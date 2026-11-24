import { Hono } from 'hono'
import { toCsv } from '../../lib/csv'
import { toOwnerQuestion, toQuizMeta } from '../../lib/mappers'
import { parseQuizInput } from '../../lib/validation'
import { createQuiz, getOwnedQuiz, slugTaken, updateQuiz } from '../../services/quizzes'
import { quizStats } from '../../services/stats'
import type { AppEnv, QuestionRow, QuizRow } from '../../types'

const CSV_HEADER = ['nome', 'email', 'ip', 'pais', 'regiao', 'cidade', 'inicio', 'fim', 'acertos', 'total', 'consentimento_em', 'versao_termo', 'navegador']

export const adminQuizRoutes = new Hono<AppEnv>()

adminQuizRoutes.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT q.*,
       (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) AS question_count,
       (SELECT COUNT(*) FROM attempts WHERE quiz_id = q.id) AS attempt_count,
       (SELECT AVG(score * 100.0 / NULLIF(total, 0)) FROM attempts WHERE quiz_id = q.id AND finished_at IS NOT NULL) AS avg_pct
     FROM quizzes q WHERE q.owner_id = ? ORDER BY q.created_at DESC`,
  )
    .bind(c.get('ownerId'))
    .all<QuizRow & { question_count: number; attempt_count: number; avg_pct: number | null }>()
  return c.json(
    results.map((q) => ({
      ...toQuizMeta(q),
      questionCount: q.question_count,
      attemptCount: q.attempt_count,
      avgPct: q.avg_pct,
    })),
  )
})

adminQuizRoutes.post('/', async (c) => {
  const input = parseQuizInput(await c.req.json().catch(() => null))
  if (await slugTaken(c.env.DB, input.slug)) return c.json({ error: 'Já existe um quiz com esse endereço (slug)' }, 409)
  const id = await createQuiz(c.env.DB, c.get('ownerId'), input)
  return c.json({ id }, 201)
})

adminQuizRoutes.get('/:id', async (c) => {
  const quiz = await getOwnedQuiz(c.env.DB, Number(c.req.param('id')), c.get('ownerId'))
  if (!quiz) return c.json({ error: 'Quiz não encontrado' }, 404)
  const { results } = await c.env.DB.prepare('SELECT * FROM questions WHERE quiz_id = ? ORDER BY position')
    .bind(quiz.id)
    .all<QuestionRow>()
  return c.json({ ...toQuizMeta(quiz), questions: results.map(toOwnerQuestion) })
})

adminQuizRoutes.put('/:id', async (c) => {
  const quizId = Number(c.req.param('id'))
  if (!(await getOwnedQuiz(c.env.DB, quizId, c.get('ownerId')))) return c.json({ error: 'Quiz não encontrado' }, 404)
  const input = parseQuizInput(await c.req.json().catch(() => null))
  if (await slugTaken(c.env.DB, input.slug, quizId)) return c.json({ error: 'Já existe um quiz com esse endereço (slug)' }, 409)
  await updateQuiz(c.env.DB, quizId, input)
  return c.json({ id: quizId })
})

adminQuizRoutes.delete('/:id', async (c) => {
  const res = await c.env.DB.prepare('DELETE FROM quizzes WHERE id = ? AND owner_id = ?')
    .bind(Number(c.req.param('id')), c.get('ownerId'))
    .run()
  if (!res.meta.changes) return c.json({ error: 'Quiz não encontrado' }, 404)
  return c.json({ ok: true })
})

adminQuizRoutes.get('/:id/stats', async (c) => {
  const quiz = await getOwnedQuiz(c.env.DB, Number(c.req.param('id')), c.get('ownerId'))
  if (!quiz) return c.json({ error: 'Quiz não encontrado' }, 404)
  return c.json({ quiz: toQuizMeta(quiz), ...(await quizStats(c.env.DB, quiz.id)) })
})

adminQuizRoutes.get('/:id/attempts', async (c) => {
  const quiz = await getOwnedQuiz(c.env.DB, Number(c.req.param('id')), c.get('ownerId'))
  if (!quiz) return c.json({ error: 'Quiz não encontrado' }, 404)
  const limit = Math.min(Number(c.req.query('limit')) || 100, 500)
  const offset = Math.max(Number(c.req.query('offset')) || 0, 0)
  const { results } = await c.env.DB.prepare(
    `SELECT id, player_name AS playerName, player_email AS playerEmail, ip, country, region, city, user_agent AS userAgent,
       started_at AS startedAt, finished_at AS finishedAt, score, total,
       consent_at AS consentAt, consent_version AS consentVersion
     FROM attempts WHERE quiz_id = ? ORDER BY started_at DESC LIMIT ? OFFSET ?`,
  )
    .bind(quiz.id, limit, offset)
    .all()
  return c.json(results)
})

adminQuizRoutes.get('/:id/attempts.csv', async (c) => {
  const quiz = await getOwnedQuiz(c.env.DB, Number(c.req.param('id')), c.get('ownerId'))
  if (!quiz) return c.json({ error: 'Quiz não encontrado' }, 404)
  const { results } = await c.env.DB.prepare(
    `SELECT player_name, player_email, ip, country, region, city, started_at, finished_at, score, total,
       consent_at, consent_version, user_agent
     FROM attempts WHERE quiz_id = ? ORDER BY started_at`,
  )
    .bind(quiz.id)
    .all<Record<string, unknown>>()
  return c.body(toCsv(CSV_HEADER, results), 200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${quiz.slug}-tentativas.csv"`,
  })
})
