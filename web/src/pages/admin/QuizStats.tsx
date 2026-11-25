import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { api, type OwnerQuiz } from '@/lib/api'
import { useDocumentTitle } from '@/lib/use-document-title'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import SusPanel from '@/components/SusPanel'

export default function QuizStats() {
  const { t, i18n } = useTranslation()
  const id = Number(useParams().id)
  const [quiz, setQuiz] = useState<OwnerQuiz | null>(null)
  const [error, setError] = useState<string | null>(null)
  useDocumentTitle(quiz ? `${quiz.title} — ${t('sus.adminTitle')}` : null)

  useEffect(() => {
    api.admin.getQuiz(id).then(setQuiz).catch((e) => setError(e.message))
  }, [id, i18n.language])

  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
  if (!quiz) return <Skeleton className="h-64 w-full" />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" asChild><Link to="/admin"><ArrowLeft aria-hidden /> {t('common.back')}</Link></Button>
        <h1 className="text-2xl font-bold sm:text-3xl">{quiz.title}</h1>
      </div>
      <SusPanel quizId={id} title={t('sus.adminTitle')} description={t('sus.adminDesc')} />
    </div>
  )
}
