import { Hono } from 'hono'
import { EXPORT_FORMAT, EXPORT_VERSION } from '../../config'
import { fail } from '../../lib/i18n'
import { toOwnerQuestion, toQuizMeta } from '../../lib/mappers'
import { parseAttribution, parseQuizInput, validateAttributionLicense } from '../../lib/validation'
import { getQuizTranslations } from '../../services/content'
import { buildQuizExport, exportHeaders } from '../../services/export'
import { createQuiz, getOwnedQuiz, slugTaken, updateQuiz } from '../../services/quizzes'
import type { AppEnv, QuestionRow, QuizRow } from '../../types'

export const adminQuizRoutes = new Hono<AppEnv>()

adminQuizRoutes.get('/', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT q.*,
       (SELECT COUNT(*) FROM questions WHERE quiz_id = q.id) AS question_count,
       (SELECT GROUP_CONCAT(locale) FROM quiz_translations WHERE quiz_id = q.id) AS locales
     FROM quizzes q WHERE q.owner_id = ? ORDER BY q.id`,
  )
    .bind(c.get('ownerId'))
    .all<QuizRow & { question_count: number; locales: string | null }>()
  return c.json(
    results.map((q) => ({
      ...toQuizMeta(q),
      questionCount: q.question_count,
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
  const body = await c.req.json().catch(() => null)
  if (!body || body.format !== EXPORT_FORMAT || body.version !== EXPORT_VERSION) return fail(c, 400, 'importFormatInvalid')
  const input = parseQuizInput(body)
  const original = parseAttribution(body)
  if (!input.attribution.some((a) => JSON.stringify(a) === JSON.stringify(original))) input.attribution.push(original)
  if (input.attribution.length > 30) return fail(c, 400, 'importFormatInvalid')
  input.changes = ''
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
  const current = await getOwnedQuiz(c.env.DB, quizId, c.get('ownerId'))
  if (!current) return fail(c, 404, 'quizNotFound')
  const input = parseQuizInput(await c.req.json().catch(() => null))
  input.attribution = JSON.parse(current.attribution)
  validateAttributionLicense(input)
  if (input.attribution.length && !input.changes) return fail(c, 400, 'changesRequired')
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

