import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'
import { ArrowLeft, CheckCircle2, Download, RefreshCw, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { api, type AttemptRow, type QuizStats as Stats } from '@/lib/api'
import { formatDateTime, formatDuration, formatPercent, formatShortDate } from '@/lib/format'
import { useDocumentTitle } from '@/lib/use-document-title'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import LocationGlobe from '@/components/LocationGlobe'
import { useMediaQuery } from '@/lib/use-media-query'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const pctLabel = (v: unknown) => `${Math.round(Number(v))}%`

export default function QuizStats() {
  const { t, i18n } = useTranslation()
  const id = Number(useParams().id)
  const isMobile = useMediaQuery('(max-width: 639px)')
  const [stats, setStats] = useState<Stats | null>(null)
  const [attempts, setAttempts] = useState<AttemptRow[] | null>(null)
  useDocumentTitle(stats ? t('stats.docTitle', { title: stats.quiz.title }) : null)

  const accuracyConfig = { accuracy: { label: t('stats.accuracyLabel'), color: 'var(--chart-1)' } } satisfies ChartConfig
  const countConfig = { count: { label: t('stats.participantsLabel'), color: 'var(--chart-1)' } } satisfies ChartConfig
  const attemptsConfig = { attempts: { label: t('stats.attemptsLabel'), color: 'var(--chart-1)' } } satisfies ChartConfig

  const load = () =>
    Promise.all([api.admin.stats(id), api.admin.attempts(id)])
      .then(([s, a]) => {
        setStats(s)
        setAttempts(a)
      })
      .catch((e) => toast.error(e.message))

  useEffect(() => {
    load()
  }, [id, i18n.language])

  const scoreDist = useMemo(() => {
    if (!stats) return []
    const total = stats.perQuestion.length
    return Array.from({ length: total + 1 }, (_, score) => ({
      score: String(score),
      count: stats.scoreDistribution.filter((d) => d.score === score).reduce((s, d) => s + d.count, 0),
    }))
  }, [stats])

  if (!stats || !attempts) return <Skeleton className="h-[32rem] w-full" />

  const s = stats.summary
  const completion = s.attempts ? ((s.finished ?? 0) / s.attempts) * 100 : null
  const perQuestion = stats.perQuestion.map((q) => ({ ...q, label: `Q${q.position}`, accuracy: q.accuracy ?? 0 }))
  const perConcept = stats.perConcept.map((c) => ({
    concept: c.concept || t('result.general'),
    accuracy: c.answered ? (c.correct / c.answered) * 100 : 0,
    answered: c.answered,
  }))

  async function removeAttempt(a: AttemptRow) {
    try {
      await api.admin.deleteAttempt(a.id)
      toast.success(t('stats.deletedData'))
      load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const tiles = [
    { label: t('stats.tileAttempts'), value: String(s.attempts) },
    { label: t('stats.tileFinished'), value: `${s.finished ?? 0}`, hint: t('stats.tileCompletion', { value: formatPercent(completion) }) },
    { label: t('stats.tileAverage'), value: formatPercent(s.avgPct) },
    { label: t('stats.tileTime'), value: formatDuration(s.avgSeconds) },
    { label: t('stats.tileEmails'), value: String(s.uniqueEmails ?? 0) },
    { label: t('stats.tileIps'), value: String(s.uniqueIps ?? 0) },
  ]
  const localeTotal = stats.byLocale.reduce((sum, l) => sum + l.attempts, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" asChild>
          <Link to="/admin">
            <ArrowLeft aria-hidden /> {t('common.back')}
          </Link>
        </Button>
        <h1 className="order-first w-full text-2xl font-bold sm:order-none sm:mr-auto sm:w-auto md:text-3xl">{stats.quiz.title}</h1>
        <Button variant="outline" onClick={load}>
          <RefreshCw aria-hidden /> {t('common.refresh')}
        </Button>
        <Button variant="outline" asChild>
          <a href={api.admin.csvUrl(id)} download>
            <Download aria-hidden /> {t('stats.exportCsv')}
          </a>
        </Button>
      </div>

      <section aria-label={t('stats.summary')} className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {tiles.map((tile) => (
          <Card key={tile.label} className="gap-1 py-4">
            <CardHeader className="px-4">
              <CardDescription>{tile.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{tile.value}</CardTitle>
              {tile.hint && <p className="text-xs text-muted-foreground">{tile.hint}</p>}
            </CardHeader>
          </Card>
        ))}
      </section>

      <Tabs defaultValue="geral">
        <TabsList className="w-full sm:w-fit">
          <TabsTrigger value="geral">{t('stats.tabOverview')}</TabsTrigger>
          <TabsTrigger value="questoes">{t('stats.tabQuestions')}</TabsTrigger>
          <TabsTrigger value="participantes">{t('stats.tabParticipants', { count: attempts.length })}</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t('stats.accuracyTitle')}</CardTitle>
              <CardDescription>{t('stats.accuracyDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={accuracyConfig} className="h-72 w-full">
                <BarChart data={perQuestion} margin={{ top: 20 }} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} width={40} />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_, p) => {
                          const q = p?.[0]?.payload as (typeof perQuestion)[number] | undefined
                          return q ? t('stats.accuracyTooltip', { label: q.label, concept: q.concept, count: q.answered }) : ''
                        }}
                        formatter={(v) => t('stats.accuracyValue', { value: Math.round(Number(v)) })}
                      />
                    }
                  />
                  <Bar dataKey="accuracy" fill="var(--color-accuracy)" radius={[4, 4, 0, 0]} maxBarSize={36}>
                    {!isMobile && (
                      <LabelList dataKey="accuracy" position="top" className="fill-muted-foreground" fontSize={11} formatter={pctLabel} />
                    )}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('stats.scoreTitle')}</CardTitle>
              <CardDescription>{t('stats.scoreDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={countConfig} className="h-64 w-full">
                <BarChart data={scoreDist} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="score" tickLine={false} axisLine={false} label={{ value: t('stats.scoreAxis'), position: 'insideBottom', offset: -2 }} height={36} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} />
                  <ChartTooltip content={<ChartTooltipContent labelFormatter={(l) => t('stats.scoreTooltip', { value: l })} />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('stats.conceptTitle')}</CardTitle>
              <CardDescription>{t('stats.conceptDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={accuracyConfig} className="w-full" style={{ height: Math.max(200, perConcept.length * 34) }}>
                <BarChart data={perConcept} layout="vertical" margin={{ right: 40 }} accessibilityLayer>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="concept" width={isMobile ? 104 : 150} tickLine={false} axisLine={false} fontSize={isMobile ? 11 : 12} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(v) => t('stats.accuracyValue', { value: Math.round(Number(v)) })} />} />
                  <Bar dataKey="accuracy" fill="var(--color-accuracy)" radius={[0, 4, 4, 0]} maxBarSize={22}>
                    <LabelList dataKey="accuracy" position="right" className="fill-muted-foreground" fontSize={11} formatter={pctLabel} />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('stats.perDayTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.perDay.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('stats.noData')}</p>
              ) : (
                <ChartContainer config={attemptsConfig} className="h-64 w-full">
                  <BarChart data={stats.perDay.map((d) => ({ ...d, label: formatShortDate(d.day) }))} accessibilityLayer>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="attempts" fill="var(--color-attempts)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('stats.languagesTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.byLocale.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('stats.noData')}</p>
              ) : (
                <ul className="space-y-3">
                  {stats.byLocale.map((l) => (
                    <li key={l.locale} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{t(`languages.${l.locale as 'pt'}`, { defaultValue: l.locale })}</span>
                        <span className="tabular-nums text-muted-foreground">
                          {l.attempts} ({formatPercent((l.attempts / localeTotal) * 100)})
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-[var(--chart-1)]" style={{ width: `${(l.attempts / localeTotal) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden lg:col-span-2">
            <CardHeader>
              <CardTitle>{t('stats.originTitle')}</CardTitle>
              <CardDescription>{t('stats.originDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <LocationGlobe locations={stats.locations} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questoes" className="space-y-4">
          {stats.perQuestion.map((q) => {
            const max = Math.max(1, ...q.options.map((o) => o.count))
            return (
              <Card key={q.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">Q{q.position}</Badge>
                    {q.concept && <Badge variant="outline">{q.concept}</Badge>}
                    <span className="ml-auto text-sm tabular-nums text-muted-foreground">
                      {t('stats.questionMeta', {
                        count: q.answered,
                        accuracy: formatPercent(q.accuracy),
                        time: q.avgTimeMs == null ? '—' : formatDuration(q.avgTimeMs / 1000),
                      })}
                    </span>
                  </div>
                  <CardTitle className="text-base leading-snug">{q.prompt}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2" aria-label={t('stats.distribution')}>
                    {q.options.map((o, i) => {
                      const correct = i === q.correctIndex
                      const pct = q.answered ? (o.count / q.answered) * 100 : 0
                      return (
                        <li key={i} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-sm">
                          <span className="flex items-center gap-1.5">
                            {correct && <CheckCircle2 className="size-4 text-success" aria-label={t('stats.correctOption')} />}
                            <span className={correct ? 'font-medium' : undefined}>
                              {String.fromCharCode(65 + i)}) {o.text}
                            </span>
                          </span>
                          <span className="tabular-nums text-muted-foreground">
                            {o.count} ({Math.round(pct)}%)
                          </span>
                          <div className="col-span-2 h-2 rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full"
                              style={{ width: `${(o.count / max) * 100}%`, background: correct ? 'var(--chart-1)' : 'var(--chart-neutral)' }}
                            />
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="participantes">
          <Card>
            <CardHeader>
              <CardTitle>{t('stats.participantsTitle')}</CardTitle>
              <CardDescription>
                {t('stats.participantsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attempts.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('stats.noAttempts')}</p>
              ) : (
                <>
                  <ul className="divide-y md:hidden">
                    {attempts.map((a) => (
                      <li key={a.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-medium">{a.playerName}</p>
                            <span className="ml-auto shrink-0 text-sm tabular-nums">
                              {a.finishedAt ? `${a.score}/${a.total}` : <Badge variant="outline">{t('stats.inProgress')}</Badge>}
                            </span>
                          </div>
                          <p className="truncate text-sm text-muted-foreground">{a.playerEmail ?? '—'}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            <span className="font-mono">{a.ip ?? '—'}</span> · {[a.city, a.country].filter(Boolean).join(', ') || '—'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(a.startedAt)} · <span className="uppercase">{a.locale}</span>
                          </p>
                        </div>
                        <DeleteAttemptDialog attempt={a} onConfirm={removeAttempt} />
                      </li>
                    ))}
                  </ul>
                  <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('stats.colName')}</TableHead>
                        <TableHead>{t('stats.colEmail')}</TableHead>
                        <TableHead>{t('stats.colIp')}</TableHead>
                        <TableHead>{t('stats.colLocation')}</TableHead>
                        <TableHead>{t('stats.colStart')}</TableHead>
                        <TableHead>{t('stats.colLanguage')}</TableHead>
                        <TableHead className="text-right">{t('stats.colScore')}</TableHead>
                        <TableHead>
                          <span className="sr-only">{t('stats.colActions')}</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attempts.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{a.playerName}</TableCell>
                          <TableCell>{a.playerEmail ?? '—'}</TableCell>
                          <TableCell className="font-mono text-xs">{a.ip ?? '—'}</TableCell>
                          <TableCell className="text-xs">{[a.city, a.region, a.country].filter(Boolean).join(', ') || '—'}</TableCell>
                          <TableCell className="text-xs">{formatDateTime(a.startedAt)}</TableCell>
                          <TableCell className="text-xs uppercase">{a.locale}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {a.finishedAt ? `${a.score}/${a.total}` : <Badge variant="outline">{t('stats.inProgress')}</Badge>}
                          </TableCell>
                          <TableCell>
                            <DeleteAttemptDialog attempt={a} onConfirm={removeAttempt} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DeleteAttemptDialog({ attempt: a, onConfirm }: { attempt: AttemptRow; onConfirm: (a: AttemptRow) => void }) {
  const { t } = useTranslation()
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" aria-label={t('stats.deleteData', { name: a.playerName })}>
          <Trash2 aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('stats.deleteDataTitle', { name: a.playerName })}</DialogTitle>
          <DialogDescription>
            {t('stats.deleteDataText')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t('common.cancel')}</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive" onClick={() => onConfirm(a)}>
              {t('common.delete')}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
