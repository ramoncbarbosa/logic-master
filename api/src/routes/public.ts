import { Hono } from 'hono'
import { CONTENT_LICENSES } from '../config'
import { LOCALES, fail } from '../lib/i18n'
import { toOwnerQuestion, toQuizMeta } from '../lib/mappers'
import { isValidSusAnswers, susScore } from '../lib/sus'
import { rateLimit } from '../middleware/rate-limit'
import { getLocalizedQuestions, localizedQuizSql } from '../services/content'
import { buildQuizExport, exportHeaders } from '../services/export'
import type { AppEnv, QuizRow } from '../types'

export const publicRoutes = new Hono<AppEnv>()

publicRoutes.get('/health', (c) => c.json({ ok: true }))

publicRoutes.get('/config', (c) =>
  c.json({
    locales: LOCALES,
    licenses: CONTENT_LICENSES,
  }),
)

publicRoutes.get('/quizzes', async (c) => {
  const locale = c.get('locale')
  const { results } = await c.env.DB.prepare(
    `SELECT base.*, (SELECT COUNT(*) FROM questions WHERE quiz_id = base.id) AS question_count,
       (SELECT GROUP_CONCAT(concept, '|') FROM (
          SELECT DISTINCT COALESCE(qt.concept, qq.concept) AS concept FROM questions qq
          LEFT JOIN question_translations qt ON qt.question_id = qq.id AND qt.locale = ?
          WHERE qq.quiz_id = base.id AND qq.concept <> '' ORDER BY qq.position)) AS concepts
     FROM (${localizedQuizSql('q.published = 1')}) base ORDER BY base.id`,
  )
    .bind(locale, locale)
    .all<QuizRow & { question_count: number; concepts: string | null }>()
  return c.json(
    results.map((q) => ({
      ...toQuizMeta(q),
      questionCount: q.question_count,
      concepts: q.concepts ? q.concepts.split('|') : [],
    })),
  )
})

publicRoutes.get('/quizzes/:slug', async (c) => {
  const locale = c.get('locale')
  const quiz = await c.env.DB.prepare(localizedQuizSql('q.slug = ? AND q.published = 1'))
    .bind(locale, c.req.param('slug'))
    .first<QuizRow>()
  if (!quiz) return fail(c, 404, 'quizNotFound')
  const questions = await getLocalizedQuestions(c.env.DB, quiz.id, locale)
  return c.json({ ...toQuizMeta(quiz), questions: questions.map(toOwnerQuestion) })
})

publicRoutes.get('/quizzes/:slug/export.json', async (c) => {
  const quiz = await c.env.DB.prepare('SELECT * FROM quizzes WHERE slug = ? AND published = 1')
    .bind(c.req.param('slug'))
    .first<QuizRow>()
  if (!quiz) return fail(c, 404, 'quizNotFound')
  const data = await buildQuizExport(c.env.DB, quiz, new URL(c.req.url).origin)
  return c.body(JSON.stringify(data, null, 2), 200, exportHeaders(quiz.slug))
})

publicRoutes.post('/quizzes/:slug/sus', rateLimit('RL_SUS', 'sus'), async (c) => {
  const body = await c.req.json<{ id?: unknown; answers?: unknown }>().catch(() => null)
  if (!body || typeof body.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.id)
    || !isValidSusAnswers(body.answers)) return fail(c, 400, 'susInvalid')
  const quiz = await c.env.DB.prepare('SELECT id FROM quizzes WHERE slug = ? AND published = 1')
    .bind(c.req.param('slug'))
    .first<{ id: number }>()
  if (!quiz) return fail(c, 404, 'quizNotFound')
  const score = susScore(body.answers)
  const result = await c.env.DB.prepare(
    `INSERT OR IGNORE INTO sus_responses (id, quiz_id, q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, score)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(body.id, quiz.id, ...body.answers, score).run()
  if (!result.meta.changes) return fail(c, 409, 'susAlreadySent')
  return c.json({ score }, 201)
})
