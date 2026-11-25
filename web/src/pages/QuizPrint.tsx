import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Printer } from 'lucide-react'
import { api, ApiError, type PublicQuiz, type QuizExport, type TranslatableLocale } from '@/lib/api'
import { languageTag } from '@/i18n'
import { learningResource, useJsonLd } from '@/lib/citation'
import { useDocumentTitle } from '@/lib/use-document-title'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import QuizCitation from '@/components/QuizCitation'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

function localize(data: QuizExport, locale: string) {
  const tr = locale === 'pt' ? undefined : data.translations[locale as TranslatableLocale]
  const pick = (v: string | undefined, base: string | undefined) => (v ? v : (base ?? ''))
  return {
    title: pick(tr?.title, data.title),
    description: pick(tr?.description, data.description),
    audience: pick(tr?.audience, data.audience),
    objective: pick(tr?.objective, data.objective),
    questions: data.questions.map((q) => {
      const qt = locale === 'pt' ? undefined : q.translations[locale as TranslatableLocale]
      const text = qt ?? q
      return { ...text, correctIndex: q.correctIndex }
    }),
  }
}

export default function QuizPrint() {
  const { slug = '' } = useParams()
  const { t, i18n } = useTranslation()
  const [data, setData] = useState<QuizExport | null>(null)
  const [meta, setMeta] = useState<PublicQuiz | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [withAnswers, setWithAnswers] = useState(true)

  useEffect(() => {
    setError(null)
    Promise.all([api.quizExport(slug), api.getQuiz(slug)])
      .then(([d, m]) => {
        setData(d)
        setMeta(m)
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : t('common.connectionError')))
  }, [slug, i18n.language, t])

  const quiz = useMemo(() => (data ? localize(data, i18n.language) : null), [data, i18n.language])
  useDocumentTitle(quiz ? t('print.docTitle', { title: quiz.title }) : null)

  const pageUrl = `${window.location.origin}/quiz/${slug}`
  const concepts = useMemo(() => [...new Set(quiz?.questions.map((q) => q.concept ?? '').filter(Boolean) ?? [])], [quiz])
  useJsonLd(
    'quiz-jsonld',
    quiz && data
      ? learningResource({
          name: quiz.title,
          description: quiz.description,
          url: pageUrl,
          inLanguage: languageTag(i18n.language),
          audience: quiz.audience,
          teaches: concepts,
          authors: data.authors,
          license: data.license,
          licenseUrl: data.licenseUrl,
          downloadUrl: `${window.location.origin}${api.exportUrl(slug)}`,
          dateCreated: meta?.createdAt,
          dateModified: meta?.updatedAt,
        })
      : null,
  )

  if (error)
    return (
      <Alert variant="destructive" className="mx-auto max-w-3xl">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  if (!quiz || !data) return <Skeleton className="mx-auto h-[28rem] max-w-3xl rounded-xl" />

  const year = meta ? new Date(meta.createdAt.replace(' ', 'T') + 'Z').getFullYear() : new Date().getFullYear()

  return (
    <article className="print-sheet mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <Button variant="ghost" size="sm" className="-ml-3 mr-auto" asChild>
          <Link to={`/quiz/${slug}`}>
            <ArrowLeft aria-hidden /> {t('print.back')}
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Checkbox id="with-answers" checked={withAnswers} onCheckedChange={(v) => setWithAnswers(v === true)} />
          <Label htmlFor="with-answers" className="font-normal">
            {t('print.withAnswers')}
          </Label>
        </div>
        <Button onClick={() => window.print()}>
          <Printer aria-hidden /> {t('print.print')}
        </Button>
      </div>

      <header className="space-y-3 border-b pb-6">
        <p className="text-sm font-medium text-primary print:text-black">Logic Master</p>
        <h1 className="text-3xl font-bold tracking-tight text-balance">{quiz.title}</h1>
        {quiz.description && <p className="text-pretty text-muted-foreground print:text-black">{quiz.description}</p>}
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {quiz.audience && (
            <div>
              <dt className="font-semibold">{t('print.audience')}</dt>
              <dd>{quiz.audience}</dd>
            </div>
          )}
          {quiz.objective && (
            <div>
              <dt className="font-semibold">{t('print.objective')}</dt>
              <dd>{quiz.objective}</dd>
            </div>
          )}
        </dl>
      </header>

      <section aria-labelledby="questions-title" className="space-y-6">
        <h2 id="questions-title" className="text-xl font-semibold">
          {t('print.questions')}
        </h2>
        <ol className="space-y-6">
          {quiz.questions.map((q, i) => (
            <li key={i} className="space-y-3 break-inside-avoid">
              <p className="font-medium text-pretty">
                <span className="tabular-nums">{i + 1}.</span> {q.prompt}
              </p>
              {q.imageUrl && <img src={q.imageUrl} alt={q.imageAlt ?? ''} className="max-h-64 rounded-lg border bg-white p-2" />}
              {q.code && <pre className="overflow-x-auto rounded-lg border bg-muted/60 p-3 text-sm print:bg-white">{q.code}</pre>}
              <ol className="space-y-1 pl-1">
                {q.options.map((o, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="font-semibold">{LETTERS[j]})</span>
                    <span>{o}</span>
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </section>

      {withAnswers && (
        <section aria-labelledby="answers-title" className="space-y-4 border-t pt-6 print:break-before-page">
          <h2 id="answers-title" className="text-xl font-semibold">
            {t('print.answers')}
          </h2>
          <ol className="space-y-3">
            {quiz.questions.map((q, i) => (
              <li key={i} className="break-inside-avoid text-sm">
                <p className="font-semibold">
                  {i + 1}. {t('print.answer', { letter: LETTERS[q.correctIndex], option: q.options[q.correctIndex] })}
                </p>
                {q.explanation && <p className="text-pretty text-muted-foreground print:text-black">{q.explanation}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}

      <QuizCitation
        title={quiz.title}
        year={year}
        authors={data.authors}
        license={data.license}
        licenseUrl={data.licenseUrl}
        url={pageUrl}
        className="break-inside-avoid print:border-black print:shadow-none"
      />
    </article>
  )
}
