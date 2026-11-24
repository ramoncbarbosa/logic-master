import { useEffect, useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { BarChart3, Eye, EyeOff, FlaskConical, Loader2, LogIn, PencilLine, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { useDocumentTitle } from '@/lib/use-document-title'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LogoMark } from '@/components/Layout'

const perks = [
  { icon: PencilLine, key: 'login.perkEdit' },
  { icon: BarChart3, key: 'login.perkData' },
  { icon: ShieldCheck, key: 'login.perkSafe' },
] as const

export default function Login() {
  const { t } = useTranslation()
  useDocumentTitle(t('login.docTitle'))
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [devLogin, setDevLogin] = useState<{ email: string; password: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  useEffect(() => {
    api.me().then(() => navigate(from, { replace: true })).catch(() => {})
    api.devLogin().then(setDevLogin).catch(() => {})
  }, [from, navigate])

  async function submit(ev: FormEvent) {
    ev.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await api.login(email, password)
      navigate(from, { replace: true })
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto grid max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border bg-card shadow-xl shadow-primary/5 md:grid-cols-2"
    >
      <aside className="relative hidden flex-col justify-between gap-10 overflow-hidden bg-primary p-10 text-primary-foreground md:flex">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-black/10 blur-3xl" />
        <div className="relative flex items-center gap-2.5 font-semibold">
          <LogoMark className="bg-primary-foreground text-primary shadow-none" />
          Logic Master
        </div>
        <div className="relative space-y-6">
          <h2 className="text-2xl leading-tight font-semibold text-balance">{t('login.area')}</h2>
          <ul className="space-y-4">
            {perks.map((p) => (
              <li key={p.key} className="flex gap-3 text-sm text-primary-foreground/85">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/15">
                  <p.icon className="size-4" aria-hidden />
                </span>
                <span className="pt-1.5">{t(p.key)}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-primary-foreground/70">{t('login.restricted')}</p>
      </aside>

      <section className="min-w-0 space-y-6 p-5 sm:p-10">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">{t('login.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('login.subtitle')}</p>
        </div>

        <AnimatePresence>
          {devLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-primary/40 bg-accent/60 p-3 text-sm">
                <FlaskConical className="size-5 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-accent-foreground">{t('login.testEnv')}</p>
                  <p className="truncate text-xs text-muted-foreground">{devLogin.email}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="w-full rounded-full sm:w-auto"
                  onClick={() => {
                    setEmail(devLogin.email)
                    setPassword(devLogin.password)
                    setError(null)
                  }}
                >
                  {t('login.useTest')}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('login.email')}</Label>
            <Input id="email" type="email" required autoComplete="username" className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('login.password')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="h-11 pr-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-1 size-9 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <Alert variant="destructive" role="alert">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Button type="submit" size="lg" className="h-11 w-full rounded-full" disabled={busy}>
            {busy ? <Loader2 className="animate-spin" aria-hidden /> : <LogIn aria-hidden />}
            {busy ? t('login.entering') : t('login.enter')}
          </Button>
        </form>

        <p className="text-xs leading-relaxed text-muted-foreground">
          {t('login.forgot')} <code className="rounded bg-muted px-1">pnpm professor</code>.
        </p>
      </section>
    </motion.div>
  )
}
