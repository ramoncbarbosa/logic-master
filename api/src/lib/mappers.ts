import type { QuestionRow, QuizRow } from '../types'
import { CONTENT_LICENSES } from '../config'

export const parseOptions = (q: QuestionRow): string[] => JSON.parse(q.options)

export const toPublicQuestion = (q: QuestionRow) => ({
  id: q.id,
  position: q.position,
  prompt: q.prompt,
  concept: q.concept,
  imageUrl: q.image_url,
  imageAlt: q.image_alt,
  code: q.code,
  options: parseOptions(q),
})

export const toOwnerQuestion = (q: QuestionRow) => ({
  ...toPublicQuestion(q),
  correctIndex: q.correct_index,
  explanation: q.explanation,
})

export const toQuizMeta = (q: QuizRow) => ({
  id: q.id,
  slug: q.slug,
  title: q.title,
  description: q.description,
  audience: q.audience,
  objective: q.objective,
  coverImage: q.cover_image,
  videoUrl: q.video_url,
  license: q.license,
  licenseUrl: CONTENT_LICENSES[q.license],
  authors: JSON.parse(q.authors) as string[],
  attribution: JSON.parse(q.attribution),
  changes: q.changes,
  published: !!q.published,
  createdAt: q.created_at,
  updatedAt: q.updated_at,
})
