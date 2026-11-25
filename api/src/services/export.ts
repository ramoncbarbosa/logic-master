import { CONTENT_LICENSES, EXPORT_FORMAT, EXPORT_VERSION, REPOSITORY_URL } from '../config'
import type { QuestionRow, QuizRow } from '../types'
import { getQuizTranslations } from './content'

const compact = <T extends Record<string, unknown>>(obj: T) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== '')) as Partial<T>

const compactTranslations = (all: Record<string, Record<string, unknown> | undefined>) => {
  const out: Record<string, Record<string, unknown>> = {}
  for (const [locale, tr] of Object.entries(all)) if (tr) out[locale] = compact(tr)
  return out
}

export async function buildQuizExport(db: D1Database, quiz: QuizRow, origin: string) {
  const [{ results }, translations] = await Promise.all([
    db.prepare('SELECT * FROM questions WHERE quiz_id = ? ORDER BY position').bind(quiz.id).all<QuestionRow>(),
    getQuizTranslations(db, quiz.id),
  ])
  return {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    authors: JSON.parse(quiz.authors),
    license: quiz.license,
    licenseUrl: CONTENT_LICENSES[quiz.license],
    attribution: JSON.parse(quiz.attribution),
    changes: quiz.changes,
    source: `${origin}/quiz/${quiz.slug}`,
    repository: REPOSITORY_URL,
    ...compact({
      slug: quiz.slug,
      title: quiz.title,
      description: quiz.description,
      audience: quiz.audience,
      objective: quiz.objective,
      coverImage: quiz.cover_image,
      videoUrl: quiz.video_url,
    }),
    translations: compactTranslations(translations.quiz),
    questions: results.map((q) => ({
      ...compact({
        prompt: q.prompt,
        concept: q.concept,
        imageUrl: q.image_url,
        imageAlt: q.image_alt,
        code: q.code,
      }),
      options: JSON.parse(q.options) as string[],
      correctIndex: q.correct_index,
      ...compact({ explanation: q.explanation }),
      translations: compactTranslations(translations.questions.get(q.id) ?? {}),
    })),
  }
}

export const exportHeaders = (slug: string) => ({
  'Content-Type': 'application/json; charset=utf-8',
  'Content-Disposition': `attachment; filename="${slug}.json"`,
})
