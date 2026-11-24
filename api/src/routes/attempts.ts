import { Hono } from 'hono'
import { ATTEMPT_MAX_AGE_HOURS, CONSENT_VERSION, allowedEmailDomains } from '../config'
import { fail } from '../lib/i18n'
import { parseOptions } from '../lib/mappers'
import { visitorInfo } from '../lib/visitor'
import { rateLimit } from '../middleware/rate-limit'
import { tooManyAttemptsFromIp } from '../services/attempts'
import { getLocalizedQuestion } from '../services/content'
import type { AppEnv } from '../types'

const PARTICIPANT_EMAIL = /^[a-z0-9._%+-]+@([a-z0-9-]+(?:\.[a-z0-9-]+)+)$/

type StartBody = { playerName?: string; playerEmail?: string; consent?: boolean; consentVersion?: string }
type AnswerBody = { questionId?: number; selectedIndex?: number; timeMs?: number }

export const attemptRoutes = new Hono<AppEnv>()

attemptRoutes.post('/quizzes/:slug/attempts', rateLimit('RL_ATTEMPT', 'attempt'), async (c) => {
  const body = await c.req.json<StartBody>().catch((): StartBody => ({}))
  const playerName = String(body.playerName ?? '').trim().slice(0, 60)
  const playerEmail = String(body.playerEmail ?? '').trim().toLowerCase()
  if (!playerName) return fail(c, 400, 'nameRequired')

  const domains = allowedEmailDomains(c.env)
  const domain = PARTICIPANT_EMAIL.exec(playerEmail)?.[1]
  if (playerEmail.length > 200 || !domain) return fail(c, 400, 'emailInvalid')
  if (domains.length && !domains.includes(domain))
    return fail(c, 400, 'emailDomain', { domains: domains.map((d) => '@' + d).join(', ') })
  if (body.consent !== true || body.consentVersion !== CONSENT_VERSION) return fail(c, 400, 'consentRequired')

  const quiz = await c.env.DB.prepare(
    `SELECT q.id, (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) AS total
     FROM quizzes q WHERE q.slug = ? AND q.published = 1`,
  )
    .bind(c.req.param('slug'))
    .first<{ id: number; total: number }>()
  if (!quiz) return fail(c, 404, 'quizNotFound')

  const visitor = visitorInfo(c)
  if (await tooManyAttemptsFromIp(c.env.DB, visitor.ip)) return fail(c, 429, 'attemptsPerHour')

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT INTO attempts (id, quiz_id, player_name, player_email, ip, country, region, city, latitude, longitude,
       user_agent, total, locale, consent_at, consent_version)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)`,
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
      c.get('locale'),
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
  if (!attempt) return fail(c, 404, 'attemptNotFound')
  if (attempt.finished_at) return fail(c, 409, 'attemptFinished')
  if (attempt.expired) return fail(c, 410, 'attemptExpired')

  const question = await getLocalizedQuestion(c.env.DB, Number(body.questionId), attempt.quiz_id, c.get('locale'))
  if (!question) return fail(c, 400, 'questionInvalid')

  const selected = Number(body.selectedIndex)
  if (!Number.isInteger(selected) || selected < 0 || selected >= parseOptions(question).length)
    return fail(c, 400, 'optionInvalid')

  const correct = selected === question.correct_index
  const timeMs = Math.max(0, Math.min(Number(body.timeMs) || 0, 60 * 60 * 1000))
  const inserted = await c.env.DB.prepare(
    `INSERT OR IGNORE INTO answers (attempt_id, question_id, selected_index, is_correct, time_ms)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(attempt.id, question.id, selected, correct ? 1 : 0, timeMs)
    .run()
  if (!inserted.meta.changes) return fail(c, 409, 'alreadyAnswered')
  if (correct) await c.env.DB.prepare('UPDATE attempts SET score = score + 1 WHERE id = ?').bind(attempt.id).run()

  return c.json({ correct, correctIndex: question.correct_index, explanation: question.explanation })
})

attemptRoutes.post('/attempts/:id/finish', async (c) => {
  const id = c.req.param('id')
  const attempt = await c.env.DB.prepare('SELECT id, quiz_id, total, finished_at FROM attempts WHERE id = ?')
    .bind(id)
    .first<{ id: string; quiz_id: number; total: number; finished_at: string | null }>()
  if (!attempt) return fail(c, 404, 'attemptNotFound')

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
    `SELECT MAX(COALESCE(t.concept, q.concept)) AS concept, COUNT(*) AS total, COALESCE(SUM(a.is_correct), 0) AS correct
     FROM questions q
     LEFT JOIN answers a ON a.question_id = q.id AND a.attempt_id = ?
     LEFT JOIN question_translations t ON t.question_id = q.id AND t.locale = ?
     WHERE q.quiz_id = ? GROUP BY q.concept ORDER BY MIN(q.position)`,
  )
    .bind(id, c.get('locale'), attempt.quiz_id)
    .all<{ concept: string; total: number; correct: number }>()
  const score = results.reduce((s, r) => s + r.correct, 0)
  const timing = await c.env.DB.prepare(
    `SELECT CAST(ROUND((julianday(finished_at) - julianday(started_at)) * 86400) AS INTEGER) AS seconds FROM attempts WHERE id = ?`,
  )
    .bind(id)
    .first<{ seconds: number }>()
  return c.json({ score, total: attempt.total, seconds: timing?.seconds ?? 0, byConcept: results })
})
