import i18n from '@/i18n'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: 'same-origin',
    ...init,
    headers: {
      'Accept-Language': i18n.language,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new ApiError(res.status, data.error ?? i18n.t('common.connectionError'))
  }
  return res.json() as Promise<T>
}

const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) })

export type QuizMeta = {
  id: number
  slug: string
  title: string
  description: string
  audience: string
  objective: string
  coverImage: string | null
  videoUrl: string | null
  license: string
  licenseUrl: string
  authors: string[]
  attribution: Attribution[]
  changes: string
  published: boolean
  createdAt: string
  updatedAt: string
  questionCount?: number
  concepts?: string[]
  locales?: string[]
}

export type PublicQuestion = {
  id: number
  position: number
  prompt: string
  concept: string
  imageUrl: string | null
  imageAlt: string | null
  code: string | null
  options: string[]
  correctIndex: number
  explanation: string
}

export type Locale = 'pt' | 'en' | 'es' | 'fr'
export type TranslatableLocale = Exclude<Locale, 'pt'>

export type QuizTranslation = { title: string; description: string; audience: string; objective: string; videoUrl: string | null }
export type QuestionTranslation = {
  prompt: string
  concept: string
  options: string[]
  explanation: string
  imageUrl: string | null
  imageAlt: string | null
  code: string | null
}
export type Translations<T> = Partial<Record<TranslatableLocale, T>>

export type OwnerQuestion = PublicQuestion & { translations: Translations<QuestionTranslation> }

export type PublicQuiz = QuizMeta & { questions: PublicQuestion[] }
export type OwnerQuiz = QuizMeta & { questions: OwnerQuestion[]; translations: Translations<QuizTranslation> }

export type AnswerResult = { correct: boolean; correctIndex: number; explanation: string }
export type FinishResult = { score: number; total: number; seconds: number; byConcept: { concept: string; total: number; correct: number }[] }
export type PublicConfig = {
  locales: Locale[]
  licenses: Record<string, string>
}

export type Attribution = {
  title: string
  authors: string[]
  source: string
  license: string
  licenseUrl: string
  changes: string
}

type ExportQuestionText = {
  prompt: string
  concept?: string
  options: string[]
  explanation?: string
  imageUrl?: string
  imageAlt?: string
  code?: string
}
type ExportQuizText = { title: string; description?: string; audience?: string; objective?: string }

export type QuizExport = ExportQuizText & {
  format: 'logic-master-quiz'
  version: number
  authors: string[]
  license: string
  licenseUrl: string
  source: string
  repository: string
  attribution: Attribution[]
  changes: string
  slug: string
  translations: Translations<ExportQuizText>
  questions: (ExportQuestionText & { correctIndex: number; translations: Translations<ExportQuestionText> })[]
}
export type Owner = { id: number; name: string; email: string }

export type QuizInput = {
  slug: string
  title: string
  description: string
  audience: string
  objective: string
  coverImage: string | null
  videoUrl: string | null
  license: string
  authors: string[]
  attribution: Attribution[]
  changes: string
  published: boolean
  questions: {
    id?: number
    prompt: string
    concept: string
    imageUrl: string | null
    imageAlt: string | null
    code: string | null
    options: string[]
    correctIndex: number
    explanation: string
    translations: Translations<QuestionTranslation>
  }[]
  translations: Translations<QuizTranslation>
}

export type SusGrade = 'excellent' | 'good' | 'ok' | 'poor' | 'awful'
export type SusSummary = {
  responses: number
  mean: number | null
  median: number | null
  grade: SusGrade | null
  distribution: { grade: SusGrade; count: number }[]
  items: { item: number; mean: number | null }[]
}

export function localizeQuizExport(data: QuizExport, locale: string) {
  const tr = locale === 'pt' ? undefined : data.translations[locale as TranslatableLocale]
  return {
    title: tr?.title || data.title,
    description: tr?.description || data.description || '',
    audience: tr?.audience || data.audience || '',
    objective: tr?.objective || data.objective || '',
    questions: data.questions.map((q) => {
      const qt = locale === 'pt' ? undefined : q.translations[locale as TranslatableLocale]
      return {
        ...q,
        ...qt,
        imageUrl: qt?.imageUrl || q.imageUrl,
        imageAlt: qt?.imageAlt || q.imageAlt,
        code: qt?.code || q.code,
        correctIndex: q.correctIndex,
      }
    }),
  }
}

export const api = {
  config: () => request<PublicConfig>('/config'),
  listQuizzes: () => request<QuizMeta[]>('/quizzes'),
  getQuiz: (slug: string) => request<PublicQuiz>(`/quizzes/${encodeURIComponent(slug)}`),
  sendSus: (slug: string, body: { id: string; answers: number[] }) => post<{ score: number }>(`/quizzes/${encodeURIComponent(slug)}/sus`, body),
  quizExport: (slug: string) => request<QuizExport>(`/quizzes/${encodeURIComponent(slug)}/export.json`),
  exportUrl: (slug: string) => `/api/quizzes/${encodeURIComponent(slug)}/export.json`,

  devLogin: () => request<{ email: string; password: string } | null>('/auth/dev-login'),
  me: () => request<Owner>('/auth/me'),
  login: (email: string, password: string) => post<Owner>('/auth/login', { email, password }),
  logout: () => post<{ ok: true }>('/auth/logout'),

  admin: {
    listQuizzes: () => request<QuizMeta[]>('/admin/quizzes'),
    getQuiz: (id: number) => request<OwnerQuiz>(`/admin/quizzes/${id}`),
    createQuiz: (input: QuizInput) => post<{ id: number }>('/admin/quizzes', input),
    importQuiz: (data: unknown) => post<{ id: number; slug: string }>('/admin/quizzes/import', data),
    exportUrl: (id: number) => `/api/admin/quizzes/${id}/export.json`,
    updateQuiz: (id: number, input: QuizInput) =>
      request<{ id: number }>(`/admin/quizzes/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
    deleteQuiz: (id: number) => request<{ ok: true }>(`/admin/quizzes/${id}`, { method: 'DELETE' }),
    sus: (quizId?: number) => request<SusSummary>(`/admin/sus${quizId ? `?quiz=${quizId}` : ''}`),
    susCsvUrl: (quizId?: number) => `/api/admin/sus/export.csv?lang=${i18n.language}${quizId ? `&quiz=${quizId}` : ''}`,
  },
}
