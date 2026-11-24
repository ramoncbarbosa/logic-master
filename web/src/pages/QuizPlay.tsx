import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Clock,
  Lightbulb,
  ListChecks,
  Play,
  RotateCcw,
  Square,
  Target,
  Trophy,
  Volume2,
  XCircle,
} from 'lucide-react'
import {
  api,
  ApiError,
  type AnswerResult,
  type FinishResult,
  type PublicConfig,
  type PublicQuiz,
  type Ranking,
} from '@/lib/api'
import { languageTag } from '@/i18n'
import { formatDuration } from '@/lib/format'
import { playFeedback, speak, speechSupported, stopSpeaking, toEmbedUrl } from '@/lib/media'
import { usePreferences } from '@/lib/preferences'
import { runTour, runTourOnce } from '@/lib/tour'
import { useDocumentTitle } from '@/lib/use-document-title'
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
import RankingTable from '@/components/RankingTable'
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
  const { i18n } = useTranslation()
  const [quiz, setQuiz] = useState<PublicQuiz | null>(null)
  const [config, setConfig] = useState<PublicConfig | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('intro')
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState('')
  const [index, setIndex] = useState(0)
  const [reviewed, setReviewed] = useState<Reviewed[]>([])
  const [final, setFinal] = useState<FinishResult | null>(null)
  useDocumentTitle(quiz?.title)

  useEffect(() => {
    Promise.all([api.getQuiz(slug), api.config()])
      .then(([q, c]) => {
        setQuiz(q)
        setConfig(c)
      })
      .catch((e) => setError(e.message))
    return stopSpeaking
  }, [slug, i18n.language])

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

      {phase === 'result' && final && attemptId && (
        <motion.div key="result" {...phaseMotion} className="mx-auto max-w-3xl">
          <Result quiz={quiz} final={final} attemptId={attemptId} reviewed={reviewed} onRestart={restart} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Intro({ quiz, config, onStart }: { quiz: PublicQuiz; config: PublicConfig; onStart: (attemptId: string, name: string) => void }) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const embed = toEmbedUrl(quiz.videoUrl)
  const domains = config.allowedEmailDomains
  const domainList = domains.map((d) => `@${d}`).join(', ')
  const concepts = useMemo(() => [...new Set(quiz.questions.map((q) => q.concept).filter(Boolean))], [quiz])
  const minutes = Math.max(1, Math.round((quiz.questions.length * 45) / 60))

  useEffect(() => runTourOnce('intro', 900), [])

  const emailDomain = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/.exec(email.trim().toLowerCase())?.[1]
  const emailOk = !!emailDomain && (domains.length === 0 || domains.includes(emailDomain))

  async function submit(ev: FormEvent) {
    ev.preventDefault()
    setFormError(null)
    if (!name.trim()) return setFormError(t('intro.errName'))
    if (!emailDomain) return setFormError(t('intro.errEmail'))
    if (!emailOk) return setFormError(t('intro.errEmailDomain', { domains: domainList }))
    if (!consent) return setFormError(t('intro.errConsent'))
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
      setFormError(e instanceof ApiError ? e.message : t('common.connectionError'))
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,26rem)] lg:items-start">
      <section id="tour-summary" className="min-w-0 space-y-6 lg:sticky lg:top-24">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" className="-ml-3 text-muted-foreground" onClick={() => runTour('intro')}>
              <CircleHelp aria-hidden /> {t('intro.howItWorks')}
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link to={`/quiz/${quiz.slug}/ranking`}>
                <Trophy aria-hidden /> {t('intro.viewRanking')}
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{quiz.title}</h1>
          {quiz.description && <p className="text-base text-pretty text-muted-foreground sm:text-lg">{quiz.description}</p>}
        </div>

        <dl className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { icon: ListChecks, label: t('intro.statQuestions'), value: quiz.questions.length },
            { icon: Clock, label: t('intro.statDuration'), value: t('common.minutes', { count: minutes }) },
            { icon: Target, label: t('intro.statConcepts'), value: concepts.length },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border bg-card/80 p-3 shadow-sm sm:p-4">
              <s.icon className="mb-2 size-5 text-primary" aria-hidden />
              <dt className="text-xs text-muted-foreground">{s.label}</dt>
              <dd className="text-lg font-semibold tabular-nums">{s.value}</dd>
            </div>
          ))}
        </dl>

        {concepts.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('intro.practice')}</p>
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
              title={t('intro.video', { title: quiz.title })}
              className="size-full"
              allow="accelerometer; encrypted-media; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        )}
      </section>

      <Card className="min-w-0 shadow-lg shadow-primary/5">
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl">{t('intro.beforeStart')}</h2>
          </CardTitle>
          <CardDescription>{t('intro.identify')}</CardDescription>
        </CardHeader>
        <form onSubmit={submit} noValidate>
          <CardContent className="space-y-4">
            <div id="tour-name" className="space-y-2">
              <Label htmlFor="name">{t('intro.name')}</Label>
              <Input id="name" autoComplete="name" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div id="tour-email" className="space-y-2">
              <Label htmlFor="email">{t('intro.email')}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                maxLength={200}
                placeholder={t('intro.emailPlaceholder')}
                aria-describedby="email-hint"
                aria-invalid={email.length > 0 && !emailOk}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p id="email-hint" className={cn('text-xs', email && !emailOk ? 'text-destructive' : 'text-muted-foreground')}>
                {domains.length ? t('intro.emailHintDomains', { domains: domainList }) : t('intro.emailHint')}
              </p>
            </div>

            <div id="tour-consent" className="space-y-3">
              <div className="max-h-40 overflow-y-auto rounded-lg border bg-muted/50 p-3" tabIndex={0} aria-label={t('intro.consentBox')}>
                <ConsentText />
              </div>
              <div className="flex items-start gap-3">
                <Checkbox id="consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} aria-required />
                <Label htmlFor="consent" className="text-sm leading-snug font-normal">
                  <span>
                    {t('intro.consentAgree')}{' '}
                    <Link to="/privacidade" className="underline underline-offset-2" target="_blank">
                      {t('intro.privacyLink')}
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
              {busy ? t('intro.preparing') : t('intro.start')} <Play aria-hidden />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

function Ready({ name, total, onDone }: { name: string; total: number; onDone: () => void }) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const [count, setCount] = useState(3)
  const firstName = name.split(/\s+/)[0]

  useEffect(() => {
    if (reduce) {
      const timer = setTimeout(onDone, 600)
      return () => clearTimeout(timer)
    }
    if (count === 0) {
      const timer = setTimeout(onDone, 350)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 750)
    return () => clearTimeout(timer)
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
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('ready.title', { name: firstName })}</h1>
        <p className="text-muted-foreground">{t('ready.text', { count: total })}</p>
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
            {count === 0 ? t('ready.go') : count}
          </motion.span>
        </AnimatePresence>
      </div>
      <Button variant="ghost" size="sm" onClick={onDone}>
        {t('ready.skip')}
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
  const { t } = useTranslation()
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
    const opts = q.options.map((o, i) => t('question.speakOption', { letter: LETTERS[i], text: o })).join(' ')
    speak(`${t('question.speakQuestion', { n: index + 1, prompt: q.prompt })} ${q.code ? t('question.speakCode') : ''} ${opts}`, languageTag())
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
          <span className="shrink-0 font-medium tabular-nums">
            {t('question.number', { n: index + 1 })} <span className="text-muted-foreground">{t('question.ofTotal', { total })}</span>
          </span>
          {q.concept && (
            <Badge variant="secondary" className="min-w-0 truncate font-normal">
              {q.concept}
            </Badge>
          )}
          <Button
            id="tour-help"
            variant="ghost"
            size="icon"
            className="ml-auto size-8 shrink-0"
            onClick={() => runTour('question')}
            aria-label={t('question.help')}
          >
            <CircleHelp aria-hidden />
          </Button>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full bg-secondary"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label={t('question.progress')}
        >
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
          <h1 ref={headingRef} tabIndex={-1} className="text-lg leading-snug font-semibold text-pretty outline-none sm:text-2xl">
            {q.prompt}
          </h1>
          {speechSupported && (
            <div id="tour-listen" className="flex w-fit gap-1">
              <Button variant="outline" size="sm" className="rounded-full" onClick={readAloud}>
                <Volume2 aria-hidden /> {t('question.listen')}
              </Button>
              <Button variant="ghost" size="icon" className="size-8 rounded-full" onClick={stopSpeaking} aria-label={t('question.stop')}>
                <Square aria-hidden />
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-5">
          {q.imageUrl && (
            <figure className="overflow-hidden rounded-xl border bg-white p-3 sm:p-4">
              <img src={q.imageUrl} alt={q.imageAlt ?? ''} className="mx-auto max-h-72 w-auto" />
            </figure>
          )}
          {q.code && (
            <pre
              className="overflow-x-auto rounded-xl border border-white/5 bg-[oklch(0.22_0.02_275)] p-4 font-mono text-sm leading-relaxed text-[oklch(0.92_0.02_275)]"
              aria-label={t('question.code')}
            >
              <code>{q.code}</code>
            </pre>
          )}

          <fieldset id="tour-options" disabled={!!result || busy}>
            <legend className="sr-only">{t('question.options')}</legend>
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
                    <span className="min-w-0 flex-1 break-words">{opt}</span>
                    {isCorrect && <CheckCircle2 className="size-5 shrink-0 text-success" aria-label={t('question.correctAria')} />}
                    {isWrongPick && <XCircle className="size-5 shrink-0 text-destructive" aria-label={t('question.wrongAria')} />}
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
                      {result.correct ? t('question.correctTitle') : t('question.wrongTitle', { letter: LETTERS[result.correctIndex] })}
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
            {t('question.shortcuts')} <kbd className="rounded border px-1">A</kbd>–
            <kbd className="rounded border px-1">{LETTERS[q.options.length - 1]}</kbd> {t('question.shortcutChoose')} ·{' '}
            <kbd className="rounded border px-1">Enter</kbd> {t('question.shortcutConfirm')}
          </p>
          {!result ? (
            <Button id="tour-confirm" size="lg" className="w-full rounded-full sm:w-auto" onClick={confirm} disabled={selected === null || busy}>
              {t('question.confirm')}
            </Button>
          ) : (
            <Button size="lg" className="w-full rounded-full sm:w-auto" onClick={onNext}>
              {isLast ? t('question.result') : t('question.next')} <ArrowRight aria-hidden />
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
    <div className="relative size-36 sm:size-40">
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

function Result({
  quiz,
  final,
  attemptId,
  reviewed,
  onRestart,
}: {
  quiz: PublicQuiz
  final: FinishResult
  attemptId: string
  reviewed: Reviewed[]
  onRestart: () => void
}) {
  const { t } = useTranslation()
  const [ranking, setRanking] = useState<Ranking | null>(null)
  const pct = final.total ? Math.round((final.score / final.total) * 100) : 0
  const message = pct >= 90 ? t('result.msgExcellent') : pct >= 70 ? t('result.msgGood') : pct >= 50 ? t('result.msgFair') : t('result.msgLow')
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => headingRef.current?.focus({ preventScroll: true }), [])
  useEffect(() => {
    api.ranking(quiz.slug, { limit: 5, attempt: attemptId }).then(setRanking).catch(() => {})
  }, [quiz.slug, attemptId])

  return (
    <div className="space-y-6">
      <Card className="items-center gap-4 py-8 text-center shadow-lg shadow-primary/5 sm:py-10">
        <ScoreRing pct={pct} />
        <div className="space-y-1 px-4">
          <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold outline-none">
            {t('result.score', { score: final.score, total: final.total })}
          </h1>
          <p className="text-muted-foreground">{message}</p>
          <p className="text-sm text-muted-foreground">{t('result.time', { time: formatDuration(final.seconds) })}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 px-4 pt-2">
          <Button className="rounded-full" onClick={onRestart}>
            <RotateCcw aria-hidden /> {t('result.tryAgain')}
          </Button>
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/">{t('result.otherQuizzes')}</Link>
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-5 text-primary" aria-hidden />
            <h2>{t('ranking.title')}</h2>
          </CardTitle>
          {ranking?.me && (
            <CardDescription>
              {ranking.me.isThisAttempt
                ? t('ranking.yourPosition', { position: ranking.me.position, count: ranking.players })
                : t('ranking.yourBest', { position: ranking.me.position, count: ranking.players })}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {ranking ? <RankingTable ranking={ranking} /> : <Skeleton className="h-40 w-full" />}
          <Button variant="outline" className="w-full rounded-full sm:w-auto" asChild>
            <Link to={`/quiz/${quiz.slug}/ranking?attempt=${attemptId}`}>
              {t('ranking.full')} <ArrowRight aria-hidden />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t('result.byConcept')}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {final.byConcept.map((c, i) => {
            const p = c.total ? (c.correct / c.total) * 100 : 0
            return (
              <div key={`${c.concept}-${i}`}>
                <div className="mb-1.5 flex justify-between gap-3 text-sm">
                  <span>{c.concept || t('result.general')}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {c.correct}/{c.total}
                  </span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-secondary"
                  role="img"
                  aria-label={t('result.conceptAria', { concept: c.concept, correct: c.correct, total: c.total })}
                >
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
            <h2>{t('result.review')}</h2>
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
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-label={t('result.hit')} />
                    ) : (
                      <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-label={t('result.miss')} />
                    )}
                    <span>
                      {i + 1}. {q.prompt}
                    </span>
                  </p>
                  {r && (
                    <div className="mt-2 space-y-1 pl-7 text-sm">
                      <p>
                        {t('result.yourAnswer')}{' '}
                        <strong>
                          {LETTERS[r.selected]}) {q.options[r.selected]}
                        </strong>
                      </p>
                      {!r.result.correct && (
                        <p>
                          {t('result.correctAnswer')}{' '}
                          <strong>
                            {LETTERS[r.result.correctIndex]}) {q.options[r.result.correctIndex]}
                          </strong>
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
