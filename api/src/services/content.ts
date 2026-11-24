import { BASE_LOCALE, TRANSLATABLE_LOCALES, type Locale } from '../lib/i18n'
import type { QuestionRow, QuizRow, QuizInput, Translations, QuestionTranslationInput, QuizTranslationInput } from '../types'

const QUIZ_COLUMNS = `q.id, q.owner_id, q.slug, q.cover_image, q.license, q.published, q.created_at, q.updated_at,
  COALESCE(NULLIF(t.video_url, ''), q.video_url) AS video_url,
  COALESCE(NULLIF(t.title, ''), q.title) AS title, COALESCE(NULLIF(t.description, ''), q.description) AS description,
  COALESCE(NULLIF(t.audience, ''), q.audience) AS audience, COALESCE(NULLIF(t.objective, ''), q.objective) AS objective`

const QUESTION_COLUMNS = `q.id, q.quiz_id, q.position, q.correct_index,
  COALESCE(t.prompt, q.prompt) AS prompt, COALESCE(t.concept, q.concept) AS concept,
  COALESCE(t.options, q.options) AS options, COALESCE(t.explanation, q.explanation) AS explanation,
  COALESCE(t.image_url, q.image_url) AS image_url, COALESCE(t.image_alt, q.image_alt) AS image_alt,
  COALESCE(t.code, q.code) AS code`

export const localizedQuizSql = (where: string) =>
  `SELECT ${QUIZ_COLUMNS} FROM quizzes q LEFT JOIN quiz_translations t ON t.quiz_id = q.id AND t.locale = ? WHERE ${where}`

export const getLocalizedQuestions = async (db: D1Database, quizId: number, locale: Locale) =>
  (
    await db
      .prepare(
        `SELECT ${QUESTION_COLUMNS} FROM questions q
         LEFT JOIN question_translations t ON t.question_id = q.id AND t.locale = ?
         WHERE q.quiz_id = ? ORDER BY q.position`,
      )
      .bind(locale, quizId)
      .all<QuestionRow>()
  ).results

export const getLocalizedQuestion = (db: D1Database, questionId: number, quizId: number, locale: Locale) =>
  db
    .prepare(
      `SELECT ${QUESTION_COLUMNS} FROM questions q
       LEFT JOIN question_translations t ON t.question_id = q.id AND t.locale = ?
       WHERE q.id = ? AND q.quiz_id = ?`,
    )
    .bind(locale, questionId, quizId)
    .first<QuestionRow>()

export const getLocalizedQuiz = (db: D1Database, quizId: number, locale: Locale) =>
  db.prepare(localizedQuizSql('q.id = ?')).bind(locale, quizId).first<QuizRow>()

type QuizTranslationRow = Omit<QuizTranslationInput, 'videoUrl'> & { locale: Locale; video_url: string | null }
type QuestionTranslationRow = { question_id: number; locale: Locale; prompt: string; concept: string; options: string; explanation: string; image_url: string | null; image_alt: string | null; code: string | null }

export async function getQuizTranslations(db: D1Database, quizId: number) {
  const [quizRows, questionRows] = await db.batch([
    db.prepare('SELECT locale, title, description, audience, objective, video_url FROM quiz_translations WHERE quiz_id = ?').bind(quizId),
    db
      .prepare(
        `SELECT t.* FROM question_translations t JOIN questions q ON q.id = t.question_id WHERE q.quiz_id = ?`,
      )
      .bind(quizId),
  ])
  const quiz: Translations<QuizTranslationInput> = {}
  for (const r of quizRows.results as QuizTranslationRow[])
    quiz[r.locale] = { title: r.title, description: r.description, audience: r.audience, objective: r.objective, videoUrl: r.video_url }
  const questions = new Map<number, Translations<QuestionTranslationInput>>()
  for (const r of questionRows.results as QuestionTranslationRow[]) {
    const entry = questions.get(r.question_id) ?? {}
    entry[r.locale] = {
      prompt: r.prompt,
      concept: r.concept,
      options: JSON.parse(r.options),
      explanation: r.explanation,
      imageUrl: r.image_url,
      imageAlt: r.image_alt,
      code: r.code,
    }
    questions.set(r.question_id, entry)
  }
  return { quiz, questions }
}

export async function saveTranslations(db: D1Database, quizId: number, input: QuizInput) {
  const { results: ids } = await db
    .prepare('SELECT id FROM questions WHERE quiz_id = ? ORDER BY position')
    .bind(quizId)
    .all<{ id: number }>()

  const stmts: D1PreparedStatement[] = [
    db.prepare('DELETE FROM quiz_translations WHERE quiz_id = ?').bind(quizId),
    db.prepare('DELETE FROM question_translations WHERE question_id IN (SELECT id FROM questions WHERE quiz_id = ?)').bind(quizId),
  ]

  for (const locale of TRANSLATABLE_LOCALES) {
    const tr = input.translations[locale]
    if (tr)
      stmts.push(
        db
          .prepare(
            'INSERT INTO quiz_translations (quiz_id, locale, title, description, audience, objective, video_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
          )
          .bind(quizId, locale, tr.title, tr.description, tr.audience, tr.objective, tr.videoUrl),
      )
    input.questions.forEach((q, i) => {
      const qt = q.translations[locale]
      const questionId = ids[i]?.id
      if (!qt || !questionId) return
      stmts.push(
        db
          .prepare(
            `INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(questionId, locale, qt.prompt, qt.concept, JSON.stringify(qt.options), qt.explanation, qt.imageUrl, qt.imageAlt, qt.code),
      )
    })
  }
  await db.batch(stmts)
}

export const isBaseLocale = (locale: Locale) => locale === BASE_LOCALE
