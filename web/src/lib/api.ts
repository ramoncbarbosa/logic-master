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
  published: boolean
  createdAt: string
  updatedAt: string
  questionCount?: number
  concepts?: string[]
  attemptCount?: number
  locales?: string[]
  avgPct?: number | null
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

export type OwnerQuestion = PublicQuestion & { correctIndex: number; explanation: string; translations: Translations<QuestionTranslation> }

export type PublicQuiz = QuizMeta & { questions: PublicQuestion[] }
export type OwnerQuiz = QuizMeta & { questions: OwnerQuestion[]; translations: Translations<QuizTranslation> }

export type AnswerResult = { correct: boolean; correctIndex: number; explanation: string }
export type FinishResult = { score: number; total: number; seconds: number; byConcept: { concept: string; total: number; correct: number }[] }
export type PublicConfig = { allowedEmailDomains: string[]; consentVersion: string; locales: Locale[] }
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

export type QuizStats = {
  quiz: QuizMeta
  summary: {
    attempts: number
    finished: number | null
    avgPct: number | null
    avgSeconds: number | null
    uniqueIps: number
    uniqueEmails: number
  }
  scoreDistribution: { score: number; total: number; count: number }[]
  perQuestion: {
    id: number
    position: number
    prompt: string
    concept: string
    correctIndex: number
    answered: number
    correct: number
    accuracy: number | null
    avgTimeMs: number | null
    options: { text: string; count: number }[]
  }[]
  perConcept: { concept: string; answered: number; correct: number }[]
  perDay: { day: string; attempts: number; avgPct: number | null }[]
  byCountry: { country: string; attempts: number }[]
  byLocale: { locale: string; attempts: number }[]
  locations: { lat: number; lon: number; city: string | null; region: string | null; country: string | null; attempts: number }[]
}

export type AttemptRow = {
  id: string
  playerName: string
  playerEmail: string | null
  ip: string | null
  country: string | null
  region: string | null
  city: string | null
  userAgent: string | null
  startedAt: string
  finishedAt: string | null
  score: number
  total: number
  consentAt: string | null
  consentVersion: string | null
  locale: string
}

export type RankingEntry = { position: number; name: string; score: number; total: number; seconds: number }
export type Ranking = { entries: RankingEntry[]; players: number; me: (RankingEntry & { isThisAttempt: boolean }) | null }

export const api = {
  config: () => request<PublicConfig>('/config'),
  listQuizzes: () => request<QuizMeta[]>('/quizzes'),
  getQuiz: (slug: string) => request<PublicQuiz>(`/quizzes/${encodeURIComponent(slug)}`),
  startAttempt: (slug: string, body: { playerName: string; playerEmail: string; consent: boolean; consentVersion: string }) =>
    post<{ attemptId: string }>(`/quizzes/${encodeURIComponent(slug)}/attempts`, body),
  answer: (attemptId: string, body: { questionId: number; selectedIndex: number; timeMs: number }) =>
    post<AnswerResult>(`/attempts/${attemptId}/answers`, body),
  finish: (attemptId: string) => post<FinishResult>(`/attempts/${attemptId}/finish`),
  ranking: (slug: string, opts: { limit?: number; attempt?: string } = {}) => {
    const q = new URLSearchParams()
    if (opts.limit) q.set('limit', String(opts.limit))
    if (opts.attempt) q.set('attempt', opts.attempt)
    return request<Ranking>(`/quizzes/${encodeURIComponent(slug)}/ranking?${q}`)
  },

  devLogin: () => request<{ email: string; password: string } | null>('/auth/dev-login'),
  me: () => request<Owner>('/auth/me'),
  login: (email: string, password: string) => post<Owner>('/auth/login', { email, password }),
  logout: () => post<{ ok: true }>('/auth/logout'),

  admin: {
    listQuizzes: () => request<QuizMeta[]>('/admin/quizzes'),
    getQuiz: (id: number) => request<OwnerQuiz>(`/admin/quizzes/${id}`),
    createQuiz: (input: QuizInput) => post<{ id: number }>('/admin/quizzes', input),
    updateQuiz: (id: number, input: QuizInput) =>
      request<{ id: number }>(`/admin/quizzes/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
    deleteQuiz: (id: number) => request<{ ok: true }>(`/admin/quizzes/${id}`, { method: 'DELETE' }),
    stats: (id: number) => request<QuizStats>(`/admin/quizzes/${id}/stats`),
    attempts: (id: number) => request<AttemptRow[]>(`/admin/quizzes/${id}/attempts?limit=500`),
    deleteAttempt: (attemptId: string) => request<{ ok: true }>(`/admin/attempts/${attemptId}`, { method: 'DELETE' }),
    csvUrl: (id: number) => `/api/admin/quizzes/${id}/attempts.csv`,
  },
}
