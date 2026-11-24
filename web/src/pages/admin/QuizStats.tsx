import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from 'recharts'
import { ArrowLeft, CheckCircle2, Download, RefreshCw, Trash2 } from 'lucide-react'
import { api, type AttemptRow, type QuizStats as Stats } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import LocationGlobe from '@/components/LocationGlobe'
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

const fmtPct = (v: number | null | undefined) => (v == null ? '—' : `${Math.round(v)}%`)
const fmtDuration = (s: number | null | undefined) => {
  if (s == null) return '—'
  const m = Math.floor(s / 60)
  const sec = Math.round(s % 60)
  return m ? `${m} min ${sec}s` : `${sec}s`
}
const fmtDate = (s: string | null) => (s ? new Date(s.replace(' ', 'T') + 'Z').toLocaleString('pt-BR') : '—')

const accuracyConfig = { accuracy: { label: 'Acertos (%)', color: 'var(--chart-1)' } } satisfies ChartConfig
const countConfig = { count: { label: 'Participantes', color: 'var(--chart-1)' } } satisfies ChartConfig
const attemptsConfig = { attempts: { label: 'Tentativas', color: 'var(--chart-1)' } } satisfies ChartConfig

export default function QuizStats() {
  const id = Number(useParams().id)
  const [stats, setStats] = useState<Stats | null>(null)
  const [attempts, setAttempts] = useState<AttemptRow[] | null>(null)

  const load = () =>
    Promise.all([api.admin.stats(id), api.admin.attempts(id)])
      .then(([s, a]) => {
        setStats(s)
        setAttempts(a)
        document.title = `Dados: ${s.quiz.title} — Logic Master`
      })
      .catch((e) => toast.error(e.message))

  useEffect(() => {
    load()
  }, [id])

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
    concept: c.concept || 'Geral',
    accuracy: c.answered ? (c.correct / c.answered) * 100 : 0,
    answered: c.answered,
  }))

  async function removeAttempt(a: AttemptRow) {
    try {
      await api.admin.deleteAttempt(a.id)
      toast.success('Dados do participante excluídos')
      load()
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  const tiles = [
    { label: 'Tentativas', value: String(s.attempts) },
    { label: 'Concluídas', value: `${s.finished ?? 0}`, hint: `${fmtPct(completion)} de conclusão` },
    { label: 'Média de acertos', value: fmtPct(s.avgPct) },
    { label: 'Tempo médio', value: fmtDuration(s.avgSeconds) },
    { label: 'Participantes (e-mails)', value: String(s.uniqueEmails ?? 0) },
    { label: 'IPs distintos', value: String(s.uniqueIps ?? 0) },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" asChild>
          <Link to="/admin">
            <ArrowLeft aria-hidden /> Voltar
          </Link>
        </Button>
        <h1 className="mr-auto text-2xl font-bold md:text-3xl">{stats.quiz.title}</h1>
        <Button variant="outline" onClick={load}>
          <RefreshCw aria-hidden /> Atualizar
        </Button>
        <Button variant="outline" asChild>
          <a href={api.admin.csvUrl(id)} download>
            <Download aria-hidden /> Exportar CSV
          </a>
        </Button>
      </div>

      <section aria-label="Resumo" className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {tiles.map((t) => (
          <Card key={t.label} className="gap-1 py-4">
            <CardHeader className="px-4">
              <CardDescription>{t.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{t.value}</CardTitle>
              {t.hint && <p className="text-xs text-muted-foreground">{t.hint}</p>}
            </CardHeader>
          </Card>
        ))}
      </section>

      <Tabs defaultValue="geral">
        <TabsList>
          <TabsTrigger value="geral">Visão geral</TabsTrigger>
          <TabsTrigger value="questoes">Questões</TabsTrigger>
          <TabsTrigger value="participantes">Participantes ({attempts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="grid gap-4 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Taxa de acerto por questão</CardTitle>
              <CardDescription>Questões com barras baixas indicam conteúdos que precisam ser retomados em aula.</CardDescription>
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
                          return q ? `${q.label} · ${q.concept} (${q.answered} respostas)` : ''
                        }}
                        formatter={(v) => `${Math.round(Number(v))}% de acerto`}
                      />
                    }
                  />
                  <Bar dataKey="accuracy" fill="var(--color-accuracy)" radius={[4, 4, 0, 0]} maxBarSize={36}>
                    <LabelList dataKey="accuracy" position="top" className="fill-muted-foreground" fontSize={11} formatter={(v) => `${Math.round(Number(v))}%`} />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição de notas</CardTitle>
              <CardDescription>Quantidade de participantes por número de acertos (tentativas concluídas).</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={countConfig} className="h-64 w-full">
                <BarChart data={scoreDist} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="score" tickLine={false} axisLine={false} label={{ value: 'acertos', position: 'insideBottom', offset: -2 }} height={36} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} />
                  <ChartTooltip content={<ChartTooltipContent labelFormatter={(l) => `${l} acertos`} />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acerto por conceito</CardTitle>
              <CardDescription>Desempenho agregado por tema de lógica.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={accuracyConfig} className="w-full" style={{ height: Math.max(200, perConcept.length * 34) }}>
                <BarChart data={perConcept} layout="vertical" margin={{ right: 40 }} accessibilityLayer>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis type="category" dataKey="concept" width={150} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(v) => `${Math.round(Number(v))}% de acerto`} />} />
                  <Bar dataKey="accuracy" fill="var(--color-accuracy)" radius={[0, 4, 4, 0]} maxBarSize={22}>
                    <LabelList dataKey="accuracy" position="right" className="fill-muted-foreground" fontSize={11} formatter={(v) => `${Math.round(Number(v))}%`} />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tentativas por dia</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.perDay.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem dados ainda.</p>
              ) : (
                <ChartContainer config={attemptsConfig} className="h-64 w-full">
                  <BarChart data={stats.perDay.map((d) => ({ ...d, label: d.day.split('-').reverse().slice(0, 2).join('/') }))} accessibilityLayer>
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

          <Card className="overflow-hidden lg:col-span-2">
            <CardHeader>
              <CardTitle>Origem dos participantes</CardTitle>
              <CardDescription>Localização aproximada (cidade) obtida pelo IP. Arraste para girar; ele volta a girar sozinho após alguns segundos parado.</CardDescription>
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
                      {q.answered} respostas · {fmtPct(q.accuracy)} de acerto · tempo médio {q.avgTimeMs == null ? '—' : `${Math.round(q.avgTimeMs / 1000)}s`}
                    </span>
                  </div>
                  <CardTitle className="text-base leading-snug">{q.prompt}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2" aria-label="Distribuição das respostas por alternativa">
                    {q.options.map((o, i) => {
                      const correct = i === q.correctIndex
                      const pct = q.answered ? (o.count / q.answered) * 100 : 0
                      return (
                        <li key={i} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-sm">
                          <span className="flex items-center gap-1.5">
                            {correct && <CheckCircle2 className="size-4 text-success" aria-label="Alternativa correta" />}
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
              <CardTitle>Participantes</CardTitle>
              <CardDescription>
                Dados coletados com consentimento. IPs e e-mails são anonimizados automaticamente após 180 dias.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attempts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma tentativa registrada.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Início</TableHead>
                      <TableHead className="text-right">Acertos</TableHead>
                      <TableHead>
                        <span className="sr-only">Ações</span>
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
                        <TableCell className="text-xs">{fmtDate(a.startedAt)}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {a.finishedAt ? `${a.score}/${a.total}` : <Badge variant="outline">em andamento</Badge>}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="icon" variant="ghost" aria-label={`Excluir dados de ${a.playerName}`}>
                                <Trash2 aria-hidden />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Excluir dados de {a.playerName}?</DialogTitle>
                                <DialogDescription>
                                  A tentativa e todas as respostas desse participante serão apagadas permanentemente
                                  (atendimento a pedido de exclusão — LGPD). Esta ação não pode ser desfeita.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancelar</Button>
                                </DialogClose>
                                <DialogClose asChild>
                                  <Button variant="destructive" onClick={() => removeAttempt(a)}>
                                    Excluir
                                  </Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
