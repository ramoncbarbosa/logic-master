import { DEFAULT_LICENSE } from '../config'
import type { QuestionInput, QuestionTranslationInput, QuizInput, QuizTranslationInput, Translations } from '../types'
import { TRANSLATABLE_LOCALES, type MessageKey, type Params } from './i18n'

export class ValidationError extends Error {
  constructor(
    public key: MessageKey,
    public params: Params = {},
    public fieldKey?: MessageKey,
    public fieldParams: Params = {},
  ) {
    super(key)
  }
}

type Field = { key: MessageKey; params?: Params }

const str = (v: unknown, field: Field, { max = 2000, required = false } = {}) => {
  if (v == null || v === '') {
    if (required) throw new ValidationError('fieldRequired', {}, field.key, field.params)
    return undefined
  }
  if (typeof v !== 'string') throw new ValidationError('fieldInvalid', {}, field.key, field.params)
  const s = v.trim()
  if (required && !s) throw new ValidationError('fieldRequired', {}, field.key, field.params)
  if (s.length > max) throw new ValidationError('fieldTooLong', { max }, field.key, field.params)
  return s
}

const url = (v: unknown, field: Field) => {
  const s = str(v, field, { max: 500 })
  if (!s) return null
  if (s.startsWith('/') && !s.startsWith('//')) return s
  try {
    if (new URL(s).protocol === 'https:') return s
  } catch {
    return invalidUrl(field)
  }
  return invalidUrl(field)
}

const invalidUrl = (field: Field): never => {
  throw new ValidationError('urlInvalid', {}, field.key, field.params)
}

const record = (v: unknown) => (v && typeof v === 'object' ? (v as Record<string, unknown>) : {})

function parseQuizTranslations(raw: unknown): Translations<QuizTranslationInput> {
  const all = record(raw)
  const out: Translations<QuizTranslationInput> = {}
  for (const locale of TRANSLATABLE_LOCALES) {
    const tr = record(all[locale])
    const title = str(tr.title, { key: 'field.title' }, { max: 150 }) ?? ''
    const videoUrl = url(tr.videoUrl, { key: 'field.video' })
    if (!title && !videoUrl) continue
    out[locale] = {
      title,
      description: str(tr.description, { key: 'field.description' }, { max: 2000 }) ?? '',
      audience: str(tr.audience, { key: 'field.audience' }, { max: 300 }) ?? '',
      objective: str(tr.objective, { key: 'field.objective' }, { max: 1000 }) ?? '',
      videoUrl,
    }
  }
  return out
}

function parseQuestionTranslations(raw: unknown, n: number, optionCount: number): Translations<QuestionTranslationInput> {
  const all = record(raw)
  const out: Translations<QuestionTranslationInput> = {}
  for (const locale of TRANSLATABLE_LOCALES) {
    const tr = record(all[locale])
    const prompt = str(tr.prompt, { key: 'field.prompt', params: { n } }, { max: 2000 })
    if (!prompt) continue
    const options = Array.isArray(tr.options) ? tr.options.map((o) => (typeof o === 'string' ? o.trim() : '')) : []
    if (options.length !== optionCount || options.some((o) => !o || o.length > 500))
      throw new ValidationError('translationOptions', { locale: locale.toUpperCase(), n, count: optionCount })
    const imageUrl = url(tr.imageUrl, { key: 'field.image', params: { n } })
    const imageAlt = str(tr.imageAlt, { key: 'field.imageAlt', params: { n } }, { max: 300 }) ?? null
    out[locale] = {
      prompt,
      concept: str(tr.concept, { key: 'field.concept', params: { n } }, { max: 80 }) ?? '',
      options,
      explanation: str(tr.explanation, { key: 'field.explanation', params: { n } }, { max: 2000 }) ?? '',
      imageUrl,
      imageAlt,
      code: str(tr.code, { key: 'field.code', params: { n } }, { max: 4000 }) ?? null,
    }
  }
  return out
}

export function parseQuizInput(body: unknown): QuizInput {
  if (!body || typeof body !== 'object') throw new ValidationError('invalidBody')
  const b = body as Record<string, unknown>

  const slug = str(b.slug, { key: 'field.slug' }, { required: true, max: 80 })!.toLowerCase()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new ValidationError('invalidSlug')

  if (!Array.isArray(b.questions)) throw new ValidationError('invalidQuestions')
  if (b.questions.length > 100) throw new ValidationError('maxQuestions')

  const questions: QuestionInput[] = b.questions.map((raw, i) => {
    const q = record(raw)
    const n = i + 1
    if (!Array.isArray(q.options)) throw new ValidationError('optionsInvalid', { n })
    const options = q.options.map((o, j) => str(o, { key: 'field.option', params: { n, m: j + 1 } }, { required: true, max: 500 })!)
    if (options.length < 2 || options.length > 6) throw new ValidationError('optionsRange', { n })
    const correctIndex = Number(q.correctIndex)
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length)
      throw new ValidationError('markCorrect', { n })
    const id = q.id == null ? undefined : Number(q.id)
    const imageUrl = url(q.imageUrl, { key: 'field.image', params: { n } })
    const imageAlt = str(q.imageAlt, { key: 'field.imageAlt', params: { n } }, { max: 300 }) ?? null
    if (imageUrl && !imageAlt) throw new ValidationError('imageAltRequired')
    return {
      id: id && Number.isInteger(id) ? id : undefined,
      prompt: str(q.prompt, { key: 'field.prompt', params: { n } }, { required: true, max: 2000 })!,
      concept: str(q.concept, { key: 'field.concept', params: { n } }, { max: 80 }) ?? '',
      imageUrl,
      imageAlt,
      code: str(q.code, { key: 'field.code', params: { n } }, { max: 4000 }) ?? null,
      options,
      correctIndex,
      explanation: str(q.explanation, { key: 'field.explanation', params: { n } }, { max: 2000 }) ?? '',
      translations: parseQuestionTranslations(q.translations, n, options.length),
    }
  })

  return {
    slug,
    title: str(b.title, { key: 'field.title' }, { required: true, max: 150 })!,
    description: str(b.description, { key: 'field.description' }, { max: 2000 }) ?? '',
    audience: str(b.audience, { key: 'field.audience' }, { max: 300 }) ?? '',
    objective: str(b.objective, { key: 'field.objective' }, { max: 1000 }) ?? '',
    coverImage: url(b.coverImage, { key: 'field.cover' }),
    videoUrl: url(b.videoUrl, { key: 'field.video' }),
    license: str(b.license, { key: 'field.license' }, { max: 60 }) ?? DEFAULT_LICENSE,
    published: b.published === true,
    questions,
    translations: parseQuizTranslations(b.translations),
  }
}
