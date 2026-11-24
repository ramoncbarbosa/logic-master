import { Hono } from 'hono'
import { CONSENT_VERSION, allowedEmailDomains } from '../config'
import { toPublicQuestion, toQuizMeta } from '../lib/mappers'
import type { AppEnv, QuestionRow, QuizRow } from '../types'

export const publicRoutes = new Hono<AppEnv>()

publicRoutes.get('/health', (c) => c.json({ ok: true }))

publicRoutes.get('/config', (c) =>
  c.json({ allowedEmailDomains: allowedEmailDomains(c.env), consentVersion: CONSENT_VERSION }),
)

publicRoutes.get('/quizzes', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT q.*, (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) AS question_count,
       (SELECT GROUP_CONCAT(concept, '|') FROM (SELECT DISTINCT concept FROM questions
          WHERE quiz_id = q.id AND concept <> '' ORDER BY position)) AS concepts
     FROM quizzes q WHERE q.published = 1 ORDER BY q.created_at DESC`,
  ).all<QuizRow & { question_count: number; concepts: string | null }>()
  return c.json(
    results.map((q) => ({
      ...toQuizMeta(q),
      questionCount: q.question_count,
      concepts: q.concepts ? q.concepts.split('|') : [],
    })),
  )
})

publicRoutes.get('/quizzes/:slug', async (c) => {
  const quiz = await c.env.DB.prepare('SELECT * FROM quizzes WHERE slug = ? AND published = 1')
    .bind(c.req.param('slug'))
    .first<QuizRow>()
  if (!quiz) return c.json({ error: 'Quiz não encontrado' }, 404)
  const { results } = await c.env.DB.prepare('SELECT * FROM questions WHERE quiz_id = ? ORDER BY position')
    .bind(quiz.id)
    .all<QuestionRow>()
  return c.json({ ...toQuizMeta(quiz), questions: results.map(toPublicQuestion) })
})
