import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { ArrowRight, Trophy } from 'lucide-react'
import { api, type PublicQuiz, type Ranking as RankingData } from '@/lib/api'
import { useDocumentTitle } from '@/lib/use-document-title'
import RankingTable from '@/components/RankingTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function Ranking() {
  const { slug = '' } = useParams()
  const [params] = useSearchParams()
  const attempt = params.get('attempt') ?? undefined
  const { t, i18n } = useTranslation()
  const [quiz, setQuiz] = useState<PublicQuiz | null>(null)
  const [ranking, setRanking] = useState<RankingData | null>(null)
  const [error, setError] = useState<string | null>(null)
  useDocumentTitle(quiz ? t('ranking.pageTitle', { title: quiz.title }) : t('ranking.title'))

  useEffect(() => {
    Promise.all([api.getQuiz(slug), api.ranking(slug, { limit: 50, attempt })])
      .then(([q, r]) => {
        setQuiz(q)
        setRanking(r)
      })
      .catch((e) => setError(e.message))
  }, [slug, attempt, i18n.language])

  if (error)
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  if (!quiz || !ranking) return <Skeleton className="mx-auto h-96 max-w-2xl rounded-xl" />

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-2xl space-y-6"
    >
      <header className="space-y-2 text-center">
        <Trophy className="mx-auto size-10 text-primary" aria-hidden />
        <h1 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">{t('ranking.pageTitle', { title: quiz.title })}</h1>
        <p className="text-sm text-pretty text-muted-foreground">{t('ranking.subtitle')}</p>
      </header>
      <Card className="shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle>{t('ranking.title')}</CardTitle>
          <CardDescription>
            {t('ranking.players', { count: ranking.players })} · {t('ranking.privacy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RankingTable ranking={ranking} />
        </CardContent>
      </Card>
      <div className="text-center">
        <Button asChild size="lg" className="rounded-full">
          <Link to={`/quiz/${slug}`}>
            {t('ranking.backToQuiz')} <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </motion.div>
  )
}
