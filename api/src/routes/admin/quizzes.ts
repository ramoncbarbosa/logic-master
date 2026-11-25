import { Hono } from 'hono'
import { toCsv } from '../../lib/csv'
import { fail, t } from '../../lib/i18n'
import { toOwnerQuestion, toQuizMeta } from '../../lib/mappers'
import { parseQuizInput } from '../../lib/validation'
import { getQuizTranslations } from '../../services/content'
import { buildQuizExport, exportHeaders } from '../../services/export'
import { createQuiz, getOwnedQuiz, slugTaken, updateQuiz } from '../../services/quizzes'
import { quizStats } from '../../services/stats'
import type { AppEnv, QuestionRow, QuizRow } from '../../types'

export const adminQuizRoutes = new Hono<AppEnv>()

adminQuizRoutes.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT q.*,
       (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) AS question_count,
       (SELECT COUNT(*) FROM attempts WHERE quiz_id = q.id) AS attempt_count,
       (SELECT AVG(score * 100.0 / NULLIF(total, 0)) FROM attempts WHERE quiz_id = q.id AND finished_at IS NOT NULL) AS avg_pct,
       (SELECT GROUP_CONCAT(locale) FROM quiz_translations WHERE quiz_id = q.id) AS locales
     FROM quizzes q WHERE q.owner_id = ? ORDER BY q.id`,
  )
    .bind(c.get('ownerId'))
    .all<QuizRow & { question_count: number; attempt_count: number; avg_pct: number | null; locales: string | null }>()
  return c.json(
    results.map((q) => ({
      ...toQuizMeta(q),
      questionCount: q.question_count,
      attemptCount: q.attempt_count,
      avgPct: q.avg_pct,
      locales: ['pt', ...(q.locales ? q.locales.split(',') : [])],
    })),
  )
})

adminQuizRoutes.post('/', async (c) => {
  const input = parseQuizInput(await c.req.json().catch(() => null))
  if (await slugTaken(c.env.DB, input.slug)) return fail(c, 409, 'slugTaken')
  const id = await createQuiz(c.env.DB, c.get('ownerId'), input)
  return c.json({ id }, 201)
})

adminQuizRoutes.post('/import', async (c) => {
  const input = parseQuizInput(await c.req.json().catch(() => null))
  input.questions = input.questions.map((q) => ({ ...q, id: undefined }))
  input.published = false
  let slug = input.slug
  for (let n = 2; await slugTaken(c.env.DB, slug); n++) slug = `${input.slug.slice(0, 70)}-${n}`
  const id = await createQuiz(c.env.DB, c.get('ownerId'), { ...input, slug })
  return c.json({ id, slug }, 201)
})

adminQuizRoutes.get('/:id/export.json', async (c) => {
  const quiz = await getOwnedQuiz(c.env.DB, Number(c.req.param('id')), c.get('ownerId'))
  if (!quiz) return fail(c, 404, 'quizNotFound')
  const data = await buildQuizExport(c.env.DB, quiz, new URL(c.req.url).origin)
  return c.body(JSON.stringify(data, null, 2), 200, exportHeaders(quiz.slug))
})

adminQuizRoutes.get('/:id', async (c) => {
  const quiz = await getOwnedQuiz(c.env.DB, Number(c.req.param('id')), c.get('ownerId'))
  if (!quiz) return fail(c, 404, 'quizNotFound')
  const [{ results }, translations] = await Promise.all([
    c.env.DB.prepare('SELECT * FROM questions WHERE quiz_id = ? ORDER BY position').bind(quiz.id).all<QuestionRow>(),
    getQuizTranslations(c.env.DB, quiz.id),
  ])
  return c.json({
    ...toQuizMeta(quiz),
    translations: translations.quiz,
    questions: results.map((q) => ({ ...toOwnerQuestion(q), translations: translations.questions.get(q.id) ?? {} })),
  })
})

adminQuizRoutes.put('/:id', async (c) => {
  const quizId = Number(c.req.param('id'))
  if (!(await getOwnedQuiz(c.env.DB, quizId, c.get('ownerId')))) return fail(c, 404, 'quizNotFound')
  const input = parseQuizInput(await c.req.json().catch(() => null))
  if (await slugTaken(c.env.DB, input.slug, quizId)) return fail(c, 409, 'slugTaken')
  await updateQuiz(c.env.DB, quizId, input)
  return c.json({ id: quizId })
})

adminQuizRoutes.delete('/:id', async (c) => {
  const res = await c.env.DB.prepare('DELETE FROM quizzes WHERE id = ? AND owner_id = ?')
    .bind(Number(c.req.param('id')), c.get('ownerId'))
    .run()
  if (!res.meta.changes) return fail(c, 404, 'quizNotFound')
  return c.json({ ok: true })
})

adminQuizRoutes.get('/:id/stats', async (c) => {
  const quiz = await getOwnedQuiz(c.env.DB, Number(c.req.param('id')), c.get('ownerId'))
  if (!quiz) return fail(c, 404, 'quizNotFound')
  return c.json({ quiz: toQuizMeta(quiz), ...(await quizStats(c.env.DB, quiz.id, c.get('locale'))) })
})

adminQuizRoutes.get('/:id/attempts', async (c) => {
  const quiz = await getOwnedQuiz(c.env.DB, Number(c.req.param('id')), c.get('ownerId'))
  if (!quiz) return fail(c, 404, 'quizNotFound')
  const limit = Math.min(Number(c.req.query('limit')) || 100, 500)
  const offset = Math.max(Number(c.req.query('offset')) || 0, 0)
  const { results } = await c.env.DB.prepare(
    `SELECT id, player_name AS playerName, player_email AS playerEmail, ip, country, region, city, user_agent AS userAgent,
       started_at AS startedAt, finished_at AS finishedAt, score, total, locale,
       consent_at AS consentAt, consent_version AS consentVersion
     FROM attempts WHERE quiz_id = ? ORDER BY started_at DESC LIMIT ? OFFSET ?`,
  )
    .bind(quiz.id, limit, offset)
    .all()
  return c.json(results)
})

adminQuizRoutes.get('/:id/attempts.csv', async (c) => {
  const quiz = await getOwnedQuiz(c.env.DB, Number(c.req.param('id')), c.get('ownerId'))
  if (!quiz) return fail(c, 404, 'quizNotFound')
  const { results } = await c.env.DB.prepare(
    `SELECT player_name, player_email, ip, country, region, city, started_at, finished_at, score, total, locale,
       consent_at, consent_version, user_agent
     FROM attempts WHERE quiz_id = ? ORDER BY started_at`,
  )
    .bind(quiz.id)
    .all<Record<string, unknown>>()
  return c.body(toCsv(t(c, 'csvHeader').split(','), results), 200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${quiz.slug}-${t(c, 'csvFile')}.csv"`,
  })
})
