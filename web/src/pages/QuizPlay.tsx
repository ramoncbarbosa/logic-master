import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  CircleHelp,
  Lightbulb,
  ListChecks,
  Play,
  RotateCcw,
  Square,
  Target,
  Volume2,
  XCircle,
} from 'lucide-react'
import { api, ApiError, type AnswerResult, type FinishResult, type PublicConfig, type PublicQuiz } from '@/lib/api'
import { playFeedback, speak, speechSupported, stopSpeaking, toEmbedUrl } from '@/lib/media'
import { usePreferences } from '@/lib/preferences'
import { runTour, runTourOnce } from '@/lib/tour'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { LogoMark } from '@/components/Layout'
import ConsentText from '@/components/ConsentText'
import { cn } from '@/lib/utils'

type Phase = 'intro' | 'ready' | 'playing' | 'result'
type Reviewed = { questionId: number; selected: number; result: AnswerResult }

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const EASE = [0.22, 1, 0.36, 1] as const

const phaseMotion = {
  initial: { opacity: 0, y: 24, scale: 0.98, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -24, scale: 0.98, filter: 'blur(6px)' },
  transition: { duration: 0.45, ease: EASE },
}

export default function QuizPlay() {
  const { slug = '' } = useParams()
  const [quiz, setQuiz] = useState<PublicQuiz | null>(null)
  const [config, setConfig] = useState<PublicConfig | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('intro')
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [index, setIndex] = useState(0)
  const [reviewed, setReviewed] = useState<Reviewed[]>([])
  const [final, setFinal] = useState<FinishResult | null>(null)

  useEffect(() => {
    Promise.all([api.getQuiz(slug), api.config()])
      .then(([q, c]) => {
        setQuiz(q)
        setConfig(c)
        document.title = `${q.title} — Logic Master`
      })
      .catch((e) => setError(e.message))
    return stopSpeaking
  }, [slug])

  const goTo = (p: Phase) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setPhase(p)
  }

  if (error)
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  if (!quiz || !config) return <Skeleton className="mx-auto h-[28rem] max-w-3xl rounded-xl" />

  const restart = () => {
    setAttemptId(null)
    setIndex(0)
    setReviewed([])
    setFinal(null)
    goTo('intro')
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {phase === 'intro' && (
        <motion.div key="intro" {...phaseMotion}>
          <Intro
            quiz={quiz}
            config={config}
            onStart={(id, name) => {
              setAttemptId(id)
              setPlayerName(name)
              goTo('ready')
            }}
          />
        </motion.div>
      )}

      {phase === 'ready' && (
        <motion.div key="ready" {...phaseMotion}>
          <Ready name={playerName} total={quiz.questions.length} onDone={() => goTo('playing')} />
        </motion.div>
      )}

      {phase === 'playing' && attemptId && (
        <motion.div key="playing" {...phaseMotion} className="mx-auto max-w-3xl">
          <AnimatePresence mode="wait" initial={false}>
            <QuestionStep
              key={quiz.questions[index].id}
              quiz={quiz}
              index={index}
              attemptId={attemptId}
              onAnswered={(r) => setReviewed((s) => [...s, r])}
              onNext={async () => {
                if (index + 1 < quiz.questions.length) {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                  return setIndex(index + 1)
                }
                try {
                  setFinal(await api.finish(attemptId))
                  goTo('result')
                } catch (e) {
                  toast.error((e as Error).message)
                }
              }}
            />
          </AnimatePresence>
        </motion.div>
      )}

      {phase === 'result' && final && (
        <motion.div key="result" {...phaseMotion} className="mx-auto max-w-3xl">
          <Result quiz={quiz} final={final} reviewed={reviewed} onRestart={restart} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Intro({ quiz, config, onStart }: { quiz: PublicQuiz; config: PublicConfig; onStart: (attemptId: string, name: string) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const embed = toEmbedUrl(quiz.videoUrl)
  const domains = config.allowedEmailDomains
  const concepts = useMemo(() => [...new Set(quiz.questions.map((q) => q.concept).filter(Boolean))], [quiz])
  const minutes = Math.max(1, Math.round((quiz.questions.length * 45) / 60))

  useEffect(() => runTourOnce('intro', 900), [])

  const emailOk = useMemo(() => {
    const domain = /^[a-z0-9._%+-]+@([a-z0-9.-]+)$/.exec(email.trim().toLowerCase())?.[1]
    return !!domain && (domains.length === 0 || domains.includes(domain))
  }, [email, domains])

  async function submit(ev: FormEvent) {
    ev.preventDefault()
    setFormError(null)
    if (!name.trim()) return setFormError('Informe seu nome.')
    if (!emailOk) return setFormError(`Use seu e-mail institucional (${domains.map((d) => '@' + d).join(' ou ')}).`)
    if (!consent) return setFormError('É necessário concordar com a coleta de dados para participar.')
    setBusy(true)
    try {
      const { attemptId } = await api.startAttempt(quiz.slug, {
        playerName: name.trim(),
        playerEmail: email.trim().toLowerCase(),
        consent,
        consentVersion: config.consentVersion,
      })
      onStart(attemptId, name.trim())
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Falha de conexão. Tente novamente.')
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,26rem)] lg:items-start">
      <section id="tour-summary" className="space-y-6 lg:sticky lg:top-24">
        <div className="space-y-3">
          <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground" onClick={() => runTour('intro')}>
            <CircleHelp aria-hidden /> Como funciona?
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{quiz.title}</h1>
          {quiz.description && <p className="text-lg text-pretty text-muted-foreground">{quiz.description}</p>}
        </div>

        <dl className="grid grid-cols-3 gap-3">
          {[
            { icon: ListChecks, label: 'Questões', value: quiz.questions.length },
            { icon: Clock, label: 'Duração', value: `~${minutes} min` },
            { icon: Target, label: 'Conceitos', value: concepts.length },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-card/80 p-4 shadow-sm">
              <s.icon className="mb-2 size-5 text-primary" aria-hidden />
              <dt className="text-xs text-muted-foreground">{s.label}</dt>
              <dd className="text-lg font-semibold tabular-nums">{s.value}</dd>
            </div>
          ))}
        </dl>

        {concepts.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">O que você vai praticar</p>
            <ul className="flex flex-wrap gap-1.5">
              {concepts.map((c) => (
                <li key={c}>
                  <Badge variant="secondary" className="font-normal">
                    {c}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        )}

        {embed && (
          <div className="aspect-video overflow-hidden rounded-xl border shadow-sm">
            <iframe
              src={embed}
              title={`Vídeo de apoio: ${quiz.title}`}
              className="size-full"
              allow="accelerometer; encrypted-media; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        )}
      </section>

      <Card className="shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">Antes de começar</h2>
          </CardTitle>
          <CardDescription>Identifique-se para registrar sua participação.</CardDescription>
        </CardHeader>
        <form onSubmit={submit} noValidate>
          <CardContent className="space-y-4">
            <div id="tour-name" className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" autoComplete="name" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div id="tour-email" className="space-y-2">
              <Label htmlFor="email">E-mail institucional</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                maxLength={200}
                placeholder={domains[0] ? `seu.nome@${domains[0]}` : 'voce@exemplo.com'}
                aria-describedby="email-hint"
                aria-invalid={email.length > 0 && !emailOk}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p id="email-hint" className={cn('text-xs', email && !emailOk ? 'text-destructive' : 'text-muted-foreground')}>
                Aceito somente e-mail {domains.map((d) => `@${d}`).join(' ou ')}.
              </p>
            </div>

            <div id="tour-consent" className="space-y-3">
              <div className="max-h-40 overflow-y-auto rounded-lg border bg-muted/50 p-3" tabIndex={0} aria-label="Termo de consentimento">
                <ConsentText domains={domains} />
              </div>
              <div className="flex items-start gap-3">
                <Checkbox id="consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} aria-required />
                <Label htmlFor="consent" className="text-sm leading-snug font-normal">
                  <span>
                    Li e concordo com a coleta e o uso dos meus dados conforme o termo acima.{' '}
                    <Link to="/privacidade" className="underline underline-offset-2" target="_blank">
                      Aviso de privacidade
                    </Link>
                  </span>
                </Label>
              </div>
            </div>

            <AnimatePresence>
              {formError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <Alert variant="destructive" role="alert">
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
          <CardFooter className="pt-6">
            <Button id="tour-start" type="submit" size="lg" disabled={busy || !consent} className="w-full rounded-full">
              {busy ? 'Preparando…' : 'Começar quiz'} <Play aria-hidden />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

function Ready({ name, total, onDone }: { name: string; total: number; onDone: () => void }) {
  const reduce = useReducedMotion()
  const [count, setCount] = useState(3)
  const firstName = name.split(/\s+/)[0]

  useEffect(() => {
    if (reduce) {
      const t = setTimeout(onDone, 600)
      return () => clearTimeout(t)
    }
    if (count === 0) {
      const t = setTimeout(onDone, 350)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setCount((c) => c - 1), 750)
    return () => clearTimeout(t)
  }, [count, reduce, onDone])

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-6 text-center" role="status" aria-live="polite">
      <motion.div
        initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        <LogoMark className="size-16 rounded-2xl text-3xl" />
      </motion.div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Tudo certo, {firstName}!</h1>
        <p className="text-muted-foreground">
          São {total} questões. Leia com atenção e confira a explicação após cada resposta.
        </p>
      </div>
      <div className="relative grid size-24 place-items-center">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border-4 border-primary/20"
          animate={reduce ? undefined : { scale: [1, 1.12, 1], opacity: [1, 0.4, 1] }}
          transition={{ duration: 0.75, repeat: Infinity }}
        />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={count}
            initial={{ y: 24, opacity: 0, scale: 0.6 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -24, opacity: 0, scale: 1.4 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="text-4xl font-bold text-primary tabular-nums"
          >
            {count === 0 ? 'Vai!' : count}
          </motion.span>
        </AnimatePresence>
      </div>
      <Button variant="ghost" size="sm" onClick={onDone}>
        Pular
      </Button>
    </div>
  )
}

function QuestionStep({
  quiz,
  index,
  attemptId,
  onAnswered,
  onNext,
}: {
  quiz: PublicQuiz
  index: number
  attemptId: string
  onAnswered: (r: Reviewed) => void
  onNext: () => void
}) {
  const q = quiz.questions[index]
  const { sound } = usePreferences()
  const [selected, setSelected] = useState<number | null>(null)
  const [result, setResult] = useState<AnswerResult | null>(null)
  const [busy, setBusy] = useState(false)
  const started = useRef(performance.now())
  const headingRef = useRef<HTMLHeadingElement>(null)
  const feedbackRef = useRef<HTMLDivElement>(null)
  const total = quiz.questions.length
  const isLast = index + 1 === total
  const progress = ((index + (result ? 1 : 0)) / total) * 100

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
    const cancel = index === 0 ? runTourOnce('question', 600) : undefined
    return () => {
      cancel?.()
      stopSpeaking()
    }
  }, [index])

  const readAloud = () => {
    const opts = q.options.map((o, i) => `Alternativa ${LETTERS[i]}: ${o}.`).join(' ')
    speak(`Questão ${index + 1}. ${q.prompt}. ${q.code ? 'Analise o código exibido na tela.' : ''} ${opts}`)
  }

  const confirm = useCallback(async () => {
    if (selected === null || result || busy) return
    setBusy(true)
    try {
      const r = await api.answer(attemptId, {
        questionId: q.id,
        selectedIndex: selected,
        timeMs: Math.round(performance.now() - started.current),
      })
      setResult(r)
      onAnswered({ questionId: q.id, selected, result: r })
      if (sound) playFeedback(r.correct)
      setTimeout(() => feedbackRef.current?.focus({ preventScroll: true }), 80)
      setTimeout(() => feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 250)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setBusy(false)
    }
  }, [selected, result, busy, attemptId, q.id, onAnswered, sound])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || document.querySelector('.driver-popover')) return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' && (e.target as HTMLInputElement).type !== 'radio') return
      if (tag === 'TEXTAREA' || tag === 'BUTTON') return
      const i = LETTERS.indexOf(e.key.toUpperCase())
      if (!result && i >= 0 && i < q.options.length) setSelected(i)
      if (e.key === 'Enter') (result ? onNext : confirm)()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [result, q.options.length, confirm, onNext])

  return (
    <motion.div
      initial={{ opacity: 0, x: 48 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -48 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="space-y-5"
    >
      <div id="tour-progress" className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium tabular-nums">
            Questão {index + 1} <span className="text-muted-foreground">de {total}</span>
          </span>
          {q.concept && (
            <Badge variant="secondary" className="font-normal">
              {q.concept}
            </Badge>
          )}
          <Button id="tour-help" variant="ghost" size="icon" className="ml-auto size-8" onClick={() => runTour('question')} aria-label="Ver tutorial">
            <CircleHelp aria-hidden />
          </Button>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-label="Progresso do quiz">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: `${(index / total) * 100}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: EASE }}
          />
        </div>
      </div>

      <Card className="shadow-lg shadow-primary/5">
        <CardHeader className="gap-4">
          <h1 ref={headingRef} tabIndex={-1} className="text-xl leading-snug font-semibold text-pretty outline-none sm:text-2xl">
            {q.prompt}
          </h1>
          {speechSupported && (
            <div id="tour-listen" className="flex w-fit gap-1">
              <Button variant="outline" size="sm" className="rounded-full" onClick={readAloud}>
                <Volume2 aria-hidden /> Ouvir questão
              </Button>
              <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={stopSpeaking} aria-label="Parar leitura">
                <Square aria-hidden />
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-5">
          {q.imageUrl && (
            <figure className="overflow-hidden rounded-xl border bg-white p-4">
              <img src={q.imageUrl} alt={q.imageAlt ?? ''} className="mx-auto max-h-72 w-auto" />
            </figure>
          )}
          {q.code && (
            <pre className="overflow-x-auto rounded-xl border border-white/5 bg-[oklch(0.22_0.02_275)] p-4 font-mono text-sm leading-relaxed text-[oklch(0.92_0.02_275)]" aria-label="Código do algoritmo">
              <code>{q.code}</code>
            </pre>
          )}

          <fieldset id="tour-options" disabled={!!result || busy}>
            <legend className="sr-only">Alternativas</legend>
            <div className="grid gap-2.5">
              {q.options.map((opt, i) => {
                const isSelected = selected === i
                const isCorrect = !!result && i === result.correctIndex
                const isWrongPick = !!result && isSelected && !result.correct
                const dimmed = !!result && !isCorrect && !isWrongPick
                return (
                  <motion.label
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: dimmed ? 0.55 : 1, y: 0, scale: isCorrect ? [1, 1.02, 1] : 1 }}
                    transition={{ duration: 0.3, delay: result ? 0 : 0.05 * i, ease: EASE }}
                    whileTap={result ? undefined : { scale: 0.985 }}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-xl border-2 bg-card p-3.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                      !result && 'hover:border-primary/40 hover:bg-accent/50',
                      isSelected && !result && 'border-primary bg-accent',
                      isCorrect && 'border-success bg-success/10',
                      isWrongPick && 'border-destructive bg-destructive/10',
                      result && 'cursor-default',
                    )}
                  >
                    <input type="radio" name={`q-${q.id}`} className="sr-only" checked={isSelected} onChange={() => setSelected(i)} />
                    <span
                      aria-hidden
                      className={cn(
                        'grid size-8 shrink-0 place-items-center rounded-lg border text-sm font-semibold transition-colors',
                        isSelected && !result && 'border-primary bg-primary text-primary-foreground',
                        isCorrect && 'border-success bg-success text-white',
                        isWrongPick && 'border-destructive bg-destructive text-white',
                      )}
                    >
                      {LETTERS[i]}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {isCorrect && <CheckCircle2 className="size-5 text-success" aria-label="Resposta correta" />}
                    {isWrongPick && <XCircle className="size-5 text-destructive" aria-label="Sua resposta (incorreta)" />}
                  </motion.label>
                )
              })}
            </div>
          </fieldset>

          <AnimatePresence>
            {result && (
              <motion.div
                ref={feedbackRef}
                tabIndex={-1}
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, height: 0, y: 8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="overflow-hidden outline-none"
              >
                <div
                  className={cn(
                    'flex gap-3 rounded-xl border p-4',
                    result.correct ? 'border-success/40 bg-success/10' : 'border-destructive/40 bg-destructive/10',
                  )}
                >
                  {result.correct ? (
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
                  ) : (
                    <Lightbulb className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
                  )}
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {result.correct ? 'Correto! 🎉' : `Quase! A resposta correta é a ${LETTERS[result.correctIndex]}.`}
                    </p>
                    <p className="text-sm leading-relaxed text-pretty text-foreground/80">{result.explanation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="justify-between gap-2 border-t pt-6">
          <p className="hidden text-xs text-muted-foreground sm:block">
            Atalhos: <kbd className="rounded border px-1">A</kbd>–<kbd className="rounded border px-1">{LETTERS[q.options.length - 1]}</kbd> escolhe ·{' '}
            <kbd className="rounded border px-1">Enter</kbd> confirma
          </p>
          {!result ? (
            <Button id="tour-confirm" size="lg" className="rounded-full" onClick={confirm} disabled={selected === null || busy}>
              Confirmar resposta
            </Button>
          ) : (
            <Button size="lg" className="rounded-full" onClick={onNext}>
              {isLast ? 'Ver resultado' : 'Próxima questão'} <ArrowRight aria-hidden />
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

function ScoreRing({ pct }: { pct: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  return (
    <div className="relative size-40">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-secondary" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          className="stroke-primary"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct / 100) }}
          transition={{ duration: 1.2, delay: 0.2, ease: EASE }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-4xl font-bold tabular-nums"
        >
          {pct}%
        </motion.span>
      </div>
    </div>
  )
}

function Result({ quiz, final, reviewed, onRestart }: { quiz: PublicQuiz; final: FinishResult; reviewed: Reviewed[]; onRestart: () => void }) {
  const pct = final.total ? Math.round((final.score / final.total) * 100) : 0
  const message =
    pct >= 90
      ? 'Excelente domínio de lógica!'
      : pct >= 70
        ? 'Muito bom! Revise os conceitos em que errou.'
        : pct >= 50
          ? 'Bom começo, vale revisar os conceitos abaixo.'
          : 'Continue praticando: revise as explicações e tente de novo.'
  const headingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => headingRef.current?.focus({ preventScroll: true }), [])

  return (
    <div className="space-y-6">
      <Card className="items-center gap-4 py-10 text-center shadow-lg shadow-primary/5">
        <ScoreRing pct={pct} />
        <div className="space-y-1">
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold outline-none">
            {final.score} de {final.total} acertos
          </h1>
          <p className="text-muted-foreground">{message}</p>
        </div>
        <div className="flex gap-2 pt-2">
          <Button className="rounded-full" onClick={onRestart}>
            <RotateCcw aria-hidden /> Tentar novamente
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/">Outros quizzes</Link>
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Desempenho por conceito</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {final.byConcept.map((c, i) => {
            const p = c.total ? (c.correct / c.total) * 100 : 0
            return (
              <div key={c.concept}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span>{c.concept || 'Geral'}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {c.correct}/{c.total}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary" role="img" aria-label={`${c.concept}: ${c.correct} de ${c.total}`}>
                  <motion.div
                    className={cn('h-full rounded-full', p === 100 ? 'bg-success' : p === 0 ? 'bg-destructive/70' : 'bg-primary')}
                    initial={{ width: 0 }}
                    animate={{ width: `${p}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.05, ease: EASE }}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Revisão das questões</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {quiz.questions.map((q, i) => {
              const r = reviewed.find((x) => x.questionId === q.id)
              return (
                <li key={q.id} className="rounded-xl border p-4">
                  <p className="flex items-start gap-2 font-medium">
                    {r?.result.correct ? (
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-label="Acertou" />
                    ) : (
                      <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-label="Errou" />
                    )}
                    <span>
                      {i + 1}. {q.prompt}
                    </span>
                  </p>
                  {r && (
                    <div className="mt-2 space-y-1 pl-7 text-sm">
                      <p>
                        Sua resposta: <strong>{LETTERS[r.selected]}) {q.options[r.selected]}</strong>
                      </p>
                      {!r.result.correct && (
                        <p>
                          Correta: <strong>{LETTERS[r.result.correctIndex]}) {q.options[r.result.correctIndex]}</strong>
                        </p>
                      )}
                      <p className="text-muted-foreground">{r.result.explanation}</p>
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
