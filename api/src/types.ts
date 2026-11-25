import type { Locale } from './lib/i18n'

export type Bindings = {
  DB: D1Database
  JWT_SECRET: string
  DEV_OWNER_EMAIL?: string
  DEV_OWNER_PASSWORD?: string
  RL_GLOBAL?: RateLimit
  RL_AUTH?: RateLimit
  RL_SUS?: RateLimit
}

export type Variables = {
  ownerId: number
  locale: Locale
}

export type AppEnv = { Bindings: Bindings; Variables: Variables }

export type OwnerRow = {
  id: number
  name: string
  email: string
  password_hash: string
  salt: string
}

export type QuizRow = {
  id: number
  owner_id: number | null
  slug: string
  title: string
  description: string
  audience: string
  objective: string
  cover_image: string | null
  video_url: string | null
  license: string
  authors: string
  attribution: string
  changes: string
  published: number
  created_at: string
  updated_at: string
}

export type QuestionRow = {
  id: number
  quiz_id: number
  position: number
  prompt: string
  concept: string
  image_url: string | null
  image_alt: string | null
  code: string | null
  options: string
  correct_index: number
  explanation: string
}

export type QuizTranslationInput = {
  title: string
  description: string
  audience: string
  objective: string
  videoUrl: string | null
}

export type QuestionTranslationInput = {
  prompt: string
  concept: string
  options: string[]
  explanation: string
  imageUrl: string | null
  imageAlt: string | null
  code: string | null
}

export type Translations<T> = Partial<Record<Locale, T>>

export type QuestionInput = {
  id?: number
  prompt: string
  concept?: string
  imageUrl?: string | null
  imageAlt?: string | null
  code?: string | null
  options: string[]
  correctIndex: number
  explanation?: string
  translations: Translations<QuestionTranslationInput>
}

export type Attribution = {
  title: string
  authors: string[]
  source: string
  license: string
  licenseUrl: string
  changes: string
}

export type QuizInput = {
  slug: string
  title: string
  description?: string
  audience?: string
  objective?: string
  coverImage?: string | null
  videoUrl?: string | null
  license?: string
  authors: string[]
  attribution: Attribution[]
  changes: string
  published?: boolean
  questions: QuestionInput[]
  translations: Translations<QuizTranslationInput>
}
