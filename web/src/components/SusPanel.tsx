import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import { api, type SusGrade, type SusSummary } from '@/lib/api'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Skeleton } from './ui/skeleton'
import { cn } from '@/lib/utils'

const GRADE_KEY = {
  excellent: 'sus.gradeExcellent',
  good: 'sus.gradeGood',
  ok: 'sus.gradeOk',
  poor: 'sus.gradePoor',
  awful: 'sus.gradeAwful',
} as const

const GRADE_MIN: Record<SusGrade, number> = { excellent: 85, good: 73, ok: 52, poor: 39, awful: 0 }

const BANDS: { grade: SusGrade; from: number; to: number; className: string }[] = [
  { grade: 'awful', from: 0, to: 39, className: 'bg-destructive/25' },
  { grade: 'poor', from: 39, to: 52, className: 'bg-destructive/12' },
  { grade: 'ok', from: 52, to: 73, className: 'bg-muted' },
  { grade: 'good', from: 73, to: 85, className: 'bg-success/15' },
  { grade: 'excellent', from: 85, to: 100, className: 'bg-success/30' },
]

const one = (v: number | null) => (v == null ? '—' : v.toFixed(1))

export default function SusPanel({ quizId, title, description }: { quizId?: number; title: string; description: string }) {
  const { t, i18n } = useTranslation()
  const [data, setData] = useState<SusSummary | null>(null)

  useEffect(() => {
    api.admin.sus(quizId).then(setData).catch((e) => toast.error(e.message))
  }, [quizId, i18n.language])

  if (!data) return <Skeleton className="h-64 w-full" />

  const total = Math.max(1, data.responses)

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1 space-y-1.5">
          <CardTitle>
            <h2>{title}</h2>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild className="w-full shrink-0 sm:w-auto">
          <a href={api.admin.susCsvUrl(quizId)} download>
            <Download aria-hidden /> {t('sus.exportCsv')}
          </a>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {!data.responses ? (
          <p className="text-sm text-muted-foreground">{t('sus.noResponses')}</p>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: t('sus.responses'), value: String(data.responses) },
                { label: t('sus.mean'), value: one(data.mean) },
                { label: t('sus.median'), value: one(data.median) },
                { label: t('sus.grade'), value: data.grade ? t(GRADE_KEY[data.grade]) : '—' },
              ].map((tile) => (
                <div key={tile.label} className="min-w-0 rounded-xl border p-3">
                  <dt className="text-xs text-muted-foreground">{tile.label}</dt>
                  <dd className="break-words text-xl font-semibold tabular-nums">{tile.value}</dd>
                </div>
              ))}
            </dl>

            <div className="space-y-2" role="img" aria-label={`${t('sus.mean')}: ${one(data.mean)} / 100. ${t('sus.reference')}`}>
              <div className="relative h-8 overflow-hidden rounded-lg border">
                <div className="absolute inset-0 flex">
                  {BANDS.map((b) => (
                    <div key={b.grade} className={cn('h-full border-r border-background last:border-r-0', b.className)} style={{ width: `${b.to - b.from}%` }} />
                  ))}
                </div>
                <div className="absolute inset-y-0 w-px bg-foreground/50" style={{ left: '68%' }} />
                {data.mean != null && (
                  <div className="absolute inset-y-0 flex -translate-x-1/2 items-center" style={{ left: `${Math.min(99, Math.max(1, data.mean))}%` }}>
                    <span className="h-full w-1.5 rounded-full bg-primary ring-2 ring-background" />
                  </div>
                )}
              </div>
              <div className="relative h-4 text-[11px] text-muted-foreground">
                {[0, 39, 52, 68, 73, 85, 100].map((tick) => (
                  <span
                    key={tick}
                    className={cn('absolute -translate-x-1/2 tabular-nums', tick === 68 && 'font-semibold text-foreground', tick === 0 && 'translate-x-0', tick === 100 && '-translate-x-full')}
                    style={{ left: `${tick}%` }}
                  >
                    {tick}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{t('sus.reference')}</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="space-y-3">
                <h3 className="text-sm font-medium">{t('sus.distribution')}</h3>
                <ul className="space-y-2.5">
                  {data.distribution.map((d) => (
                    <li key={d.grade} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>
                          {t(GRADE_KEY[d.grade])} <span className="text-xs text-muted-foreground">({t('sus.gradeRange', { min: GRADE_MIN[d.grade] })})</span>
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          {d.count} ({Math.round((d.count / total) * 100)}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-[var(--chart-1)]" style={{ width: `${(d.count / total) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-medium">{t('sus.items')}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2.5 rounded-sm bg-[var(--chart-1)]" aria-hidden /> {t('sus.positive')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2.5 rounded-sm bg-[var(--chart-neutral)]" aria-hidden /> {t('sus.negative')}
                  </span>
                </div>
                <ul className="space-y-2">
                  {data.items.map(({ item, mean }) => {
                    const positive = item % 2 === 1
                    return (
                      <li key={item} className="grid grid-cols-[2.25rem_minmax(0,1fr)_2.5rem] items-center gap-2 text-sm" title={t(`sus.q${item}` as 'sus.q1')}>
                        <span className="font-medium text-muted-foreground">{t('sus.itemLabel', { n: item })}</span>
                        <div className="h-2.5 rounded-full bg-muted" role="img" aria-label={`${t(`sus.q${item}` as 'sus.q1')}: ${one(mean)} / 5`}>
                          <div
                            className="h-2.5 rounded-full"
                            style={{ width: `${((mean ?? 0) / 5) * 100}%`, background: positive ? 'var(--chart-1)' : 'var(--chart-neutral)' }}
                          />
                        </div>
                        <span className="text-right tabular-nums">{one(mean)}</span>
                      </li>
                    )
                  })}
                </ul>
                <details className="text-xs text-muted-foreground">
                  <summary className="cursor-pointer">{t('sus.title')}</summary>
                  <ol className="mt-2 list-decimal space-y-1 pl-5">
                    {data.items.map(({ item }) => (
                      <li key={item}>{t(`sus.q${item}` as 'sus.q1')}</li>
                    ))}
                  </ol>
                </details>
              </section>
            </div>


          </>
        )}
      </CardContent>
    </Card>
  )
}
