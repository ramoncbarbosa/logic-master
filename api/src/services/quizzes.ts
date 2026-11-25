import { DEFAULT_LICENSE } from '../config'
import type { QuizInput, QuizRow } from '../types'
import { saveTranslations } from './content'

export const getOwnedQuiz = (db: D1Database, quizId: number, ownerId: number) =>
  db.prepare('SELECT * FROM quizzes WHERE id = ? AND owner_id = ?').bind(quizId, ownerId).first<QuizRow>()

export const slugTaken = async (db: D1Database, slug: string, exceptId = 0) =>
  !!(await db.prepare('SELECT 1 FROM quizzes WHERE slug = ? AND id <> ?').bind(slug, exceptId).first())

const quizValues = (input: QuizInput) => [
  input.slug,
  input.title,
  input.description ?? '',
  input.audience ?? '',
  input.objective ?? '',
  input.coverImage ?? null,
  input.videoUrl ?? null,
  input.license ?? DEFAULT_LICENSE,
  JSON.stringify(input.authors),
  JSON.stringify(input.attribution),
  input.changes,
  input.published ? 1 : 0,
]

function questionStatements(db: D1Database, quizId: number, input: QuizInput) {
  return input.questions.map((q, i) => {
    const values = [
      i + 1,
      q.prompt,
      q.concept ?? '',
      q.imageUrl ?? null,
      q.imageAlt ?? null,
      q.code ?? null,
      JSON.stringify(q.options),
      q.correctIndex,
      q.explanation ?? '',
    ]
    return q.id
      ? db
          .prepare(
            `UPDATE questions SET position = ?, prompt = ?, concept = ?, image_url = ?, image_alt = ?, code = ?,
               options = ?, correct_index = ?, explanation = ? WHERE id = ? AND quiz_id = ?`,
          )
          .bind(...values, q.id, quizId)
      : db
          .prepare(
            `INSERT INTO questions (position, prompt, concept, image_url, image_alt, code, options, correct_index, explanation, quiz_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(...values, quizId)
  })
}

export async function createQuiz(db: D1Database, ownerId: number, input: QuizInput) {
  const res = await db
    .prepare(
      `INSERT INTO quizzes (slug, title, description, audience, objective, cover_image, video_url, license, authors, attribution, changes, published, owner_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(...quizValues(input), ownerId)
    .run()
  const quizId = Number(res.meta.last_row_id)
  const stmts = questionStatements(db, quizId, { ...input, questions: input.questions.map((q) => ({ ...q, id: undefined })) })
  if (stmts.length) await db.batch(stmts)
  await saveTranslations(db, quizId, input)
  return quizId
}

export async function updateQuiz(db: D1Database, quizId: number, input: QuizInput) {
  const keepIds = input.questions.map((q) => q.id).filter((id): id is number => !!id)
  const deleteRemoved = keepIds.length
    ? db.prepare(`DELETE FROM questions WHERE quiz_id = ? AND id NOT IN (${keepIds.map(() => '?').join(',')})`).bind(quizId, ...keepIds)
    : db.prepare('DELETE FROM questions WHERE quiz_id = ?').bind(quizId)

  await db.batch([
    db
      .prepare(
        `UPDATE quizzes SET slug = ?, title = ?, description = ?, audience = ?, objective = ?, cover_image = ?, video_url = ?,
           license = ?, authors = ?, attribution = ?, changes = ?, published = ?, updated_at = datetime('now') WHERE id = ?`,
      )
      .bind(...quizValues(input), quizId),
    deleteRemoved,
    ...questionStatements(db, quizId, input),
  ])
  await saveTranslations(db, quizId, input)
}
