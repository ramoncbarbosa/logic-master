import { Hono } from 'hono'
import { ATTEMPT_MAX_AGE_HOURS, CONSENT_VERSION, allowedEmailDomains } from '../config'
import { parseOptions } from '../lib/mappers'
import { visitorInfo } from '../lib/visitor'
import { rateLimit } from '../middleware/rate-limit'
import { tooManyAttemptsFromIp } from '../services/attempts'
import type { AppEnv, QuestionRow } from '../types'

const PARTICIPANT_EMAIL = /^[a-z0-9._%+-]+@([a-z0-9-]+(?:\.[a-z0-9-]+)+)$/

type StartBody = { playerName?: string; playerEmail?: string; consent?: boolean; consentVersion?: string }
type AnswerBody = { questionId?: number; selectedIndex?: number; timeMs?: number }

export const attemptRoutes = new Hono<AppEnv>()

attemptRoutes.post('/quizzes/:slug/attempts', rateLimit('RL_ATTEMPT', 'attempt'), async (c) => {
  const body = await c.req.json<StartBody>().catch((): StartBody => ({}))
  const playerName = String(body.playerName ?? '').trim().slice(0, 60)
  const playerEmail = String(body.playerEmail ?? '').trim().toLowerCase()
  if (!playerName) return c.json({ error: 'Informe seu nome' }, 400)

  const domains = allowedEmailDomains(c.env)
  const domain = PARTICIPANT_EMAIL.exec(playerEmail)?.[1]
  if (playerEmail.length > 200 || !domain) return c.json({ error: 'Informe um e-mail válido' }, 400)
  if (domains.length && !domains.includes(domain))
    return c.json({ error: `Use seu e-mail institucional (${domains.map((d) => '@' + d).join(' ou ')})` }, 400)
  if (body.consent !== true || body.consentVersion !== CONSENT_VERSION)
    return c.json({ error: 'É necessário ler e aceitar o termo de consentimento de coleta de dados' }, 400)

  const quiz = await c.env.DB.prepare(
    `SELECT q.id, (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) AS total
     FROM quizzes q WHERE q.slug = ? AND q.published = 1`,
  )
    .bind(c.req.param('slug'))
    .first<{ id: number; total: number }>()
  if (!quiz) return c.json({ error: 'Quiz não encontrado' }, 404)

  const visitor = visitorInfo(c)
  if (await tooManyAttemptsFromIp(c.env.DB, visitor.ip))
    return c.json({ error: 'Limite de tentativas por hora atingido para esta rede. Tente mais tarde.' }, 429)

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT INTO attempts (id, quiz_id, player_name, player_email, ip, country, region, city, latitude, longitude,
       user_agent, total, consent_at, consent_version)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)`,
  )
    .bind(
      id,
      quiz.id,
      playerName,
      playerEmail,
      visitor.ip,
      visitor.country,
      visitor.region,
      visitor.city,
      visitor.latitude,
      visitor.longitude,
      visitor.userAgent,
      quiz.total,
      CONSENT_VERSION,
    )
    .run()
  return c.json({ attemptId: id }, 201)
})

attemptRoutes.post('/attempts/:id/answers', async (c) => {
  const body = await c.req.json<AnswerBody>().catch((): AnswerBody => ({}))
  const attempt = await c.env.DB.prepare(
    `SELECT id, quiz_id, finished_at, started_at < datetime('now', ?) AS expired FROM attempts WHERE id = ?`,
  )
    .bind(`-${ATTEMPT_MAX_AGE_HOURS} hours`, c.req.param('id'))
    .first<{ id: string; quiz_id: number; finished_at: string | null; expired: number }>()
  if (!attempt) return c.json({ error: 'Tentativa não encontrada' }, 404)
  if (attempt.finished_at) return c.json({ error: 'Tentativa já finalizada' }, 409)
  if (attempt.expired) return c.json({ error: 'Tentativa expirada. Inicie o quiz novamente.' }, 410)

  const question = await c.env.DB.prepare('SELECT * FROM questions WHERE id = ? AND quiz_id = ?')
    .bind(Number(body.questionId), attempt.quiz_id)
    .first<QuestionRow>()
  if (!question) return c.json({ error: 'Questão inválida' }, 400)

  const selected = Number(body.selectedIndex)
  if (!Number.isInteger(selected) || selected < 0 || selected >= parseOptions(question).length)
    return c.json({ error: 'Alternativa inválida' }, 400)

  const correct = selected === question.correct_index
  const timeMs = Math.max(0, Math.min(Number(body.timeMs) || 0, 60 * 60 * 1000))
  const inserted = await c.env.DB.prepare(
    `INSERT OR IGNORE INTO answers (attempt_id, question_id, selected_index, is_correct, time_ms)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(attempt.id, question.id, selected, correct ? 1 : 0, timeMs)
    .run()
  if (!inserted.meta.changes) return c.json({ error: 'Questão já respondida' }, 409)
  if (correct) await c.env.DB.prepare('UPDATE attempts SET score = score + 1 WHERE id = ?').bind(attempt.id).run()

  return c.json({ correct, correctIndex: question.correct_index, explanation: question.explanation })
})

attemptRoutes.post('/attempts/:id/finish', async (c) => {
  const id = c.req.param('id')
  const attempt = await c.env.DB.prepare('SELECT id, quiz_id, total, finished_at FROM attempts WHERE id = ?')
    .bind(id)
    .first<{ id: string; quiz_id: number; total: number; finished_at: string | null }>()
  if (!attempt) return c.json({ error: 'Tentativa não encontrada' }, 404)

  if (!attempt.finished_at) {
    await c.env.DB.prepare(
      `UPDATE attempts SET finished_at = datetime('now'),
         score = (SELECT COUNT(*) FROM answers WHERE attempt_id = ? AND is_correct = 1)
       WHERE id = ?`,
    )
      .bind(id, id)
      .run()
  }

  const { results } = await c.env.DB.prepare(
    `SELECT q.concept, COUNT(*) AS total, COALESCE(SUM(a.is_correct), 0) AS correct
     FROM questions q LEFT JOIN answers a ON a.question_id = q.id AND a.attempt_id = ?
     WHERE q.quiz_id = ? GROUP BY q.concept ORDER BY MIN(q.position)`,
  )
    .bind(id, attempt.quiz_id)
    .all<{ concept: string; total: number; correct: number }>()
  const score = results.reduce((s, r) => s + r.correct, 0)
  return c.json({ score, total: attempt.total, byConcept: results })
})
