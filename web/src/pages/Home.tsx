import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { ArrowRight, Clock, ListChecks, Sparkles, Trophy } from 'lucide-react'
import { api, type QuizMeta } from '@/lib/api'
import { useDocumentTitle } from '@/lib/use-document-title'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const minutes = (n = 0) => Math.max(1, Math.round((n * 45) / 60))

export default function Home() {
  const { t, i18n } = useTranslation()
  const [quizzes, setQuizzes] = useState<QuizMeta[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  useDocumentTitle()

  useEffect(() => {
    setError(null)
    api.listQuizzes().then(setQuizzes).catch((e) => setError(e.message))
  }, [i18n.language])

  return (
    <div className="space-y-10 sm:space-y-12">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-2xl space-y-5 pt-2 text-center sm:pt-6"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
          <Sparkles className="size-3.5 text-primary" aria-hidden /> {t('home.badge')}
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
          {t('home.titleA')} <span className="text-primary">{t('home.titleB')}</span>
        </h1>
        <p className="text-base text-pretty text-muted-foreground sm:text-lg">{t('home.subtitle')}</p>
      </motion.section>

      <section aria-labelledby="quizzes-title" className="space-y-4">
        <h2 id="quizzes-title" className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          {t('home.available')}
        </h2>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!quizzes && !error && <Skeleton className="h-48 w-full rounded-xl" />}
        {quizzes?.length === 0 && <p className="text-muted-foreground">{t('home.empty')}</p>}

        <div className="grid gap-4">
          {quizzes?.map((q, i) => (
            <motion.article
              key={q.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-lg hover:shadow-primary/5 sm:p-6"
            >
              <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent" />
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1 space-y-3">
                  <h3 className="text-xl font-semibold tracking-tight">{q.title}</h3>
                  {q.description && <p className="text-sm text-muted-foreground">{q.description}</p>}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <ListChecks className="size-4" aria-hidden /> {t('common.questions', { count: q.questionCount ?? 0 })}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-4" aria-hidden /> {t('common.minutes', { count: minutes(q.questionCount) })}
                    </span>
                  </div>
                  {!!q.concepts?.length && (
                    <ul className="flex flex-wrap gap-1.5" aria-label={t('home.concepts')}>
                      {q.concepts.slice(0, 6).map((c) => (
                        <li key={c}>
                          <Badge variant="secondary" className="font-normal">
                            {c}
                          </Badge>
                        </li>
                      ))}
                      {q.concepts.length > 6 && (
                        <li>
                          <Badge variant="outline" className="font-normal">
                            +{q.concepts.length - 6}
                          </Badge>
                        </li>
                      )}
                    </ul>
                  )}
                </div>
                <div className="flex shrink-0 gap-2 sm:flex-col">
                  <Button asChild size="lg" className="flex-1 rounded-full">
                    <Link to={`/quiz/${q.slug}`} aria-label={t('home.startAria', { title: q.title })}>
                      {t('home.start')} <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="flex-1 rounded-full">
                    <Link to={`/quiz/${q.slug}/ranking`} aria-label={t('home.rankingAria', { title: q.title })}>
                      <Trophy aria-hidden /> {t('home.ranking')}
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  )
}
