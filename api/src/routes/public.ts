import { Hono } from 'hono'
import { CONSENT_VERSION, LICENSE_URL, REPOSITORY_URL, RESOURCE_AUTHORS, allowedEmailDomains } from '../config'
import { LOCALES, fail } from '../lib/i18n'
import { toPublicQuestion, toQuizMeta } from '../lib/mappers'
import { getLocalizedQuestions, localizedQuizSql } from '../services/content'
import { buildQuizExport, exportHeaders } from '../services/export'
import { quizRanking } from '../services/ranking'
import type { AppEnv, QuizRow } from '../types'

export const publicRoutes = new Hono<AppEnv>()

publicRoutes.get('/health', (c) => c.json({ ok: true }))

publicRoutes.get('/config', (c) =>
  c.json({
    allowedEmailDomains: allowedEmailDomains(c.env),
    consentVersion: CONSENT_VERSION,
    locales: LOCALES,
    authors: RESOURCE_AUTHORS,
    repository: REPOSITORY_URL,
    licenseUrl: LICENSE_URL,
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
  return c.json({ ...toQuizMeta(quiz), questions: questions.map(toPublicQuestion) })
})

publicRoutes.get('/quizzes/:slug/export.json', async (c) => {
  const quiz = await c.env.DB.prepare('SELECT * FROM quizzes WHERE slug = ? AND published = 1')
    .bind(c.req.param('slug'))
    .first<QuizRow>()
  if (!quiz) return fail(c, 404, 'quizNotFound')
  const data = await buildQuizExport(c.env.DB, quiz, new URL(c.req.url).origin)
  return c.body(JSON.stringify(data, null, 2), 200, exportHeaders(quiz.slug))
})

publicRoutes.get('/quizzes/:slug/ranking', async (c) => {
  const quiz = await c.env.DB.prepare('SELECT id FROM quizzes WHERE slug = ? AND published = 1')
    .bind(c.req.param('slug'))
    .first<{ id: number }>()
  if (!quiz) return fail(c, 404, 'quizNotFound')
  const limit = Math.min(Math.max(Number(c.req.query('limit')) || 10, 1), 50)
  return c.json(await quizRanking(c.env.DB, quiz.id, limit, c.req.query('attempt') || undefined))
})
