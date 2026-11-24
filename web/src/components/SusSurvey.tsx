import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'motion/react'
import { HeartHandshake, Send } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import { cn } from '@/lib/utils'

const ITEMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const
const SCALE = [1, 2, 3, 4, 5] as const

export default function SusSurvey({ attemptId }: { attemptId: string }) {
  const { t } = useTranslation()
  const [answers, setAnswers] = useState<(number | null)[]>(() => ITEMS.map(() => null))
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)
  const done = answers.filter((a) => a !== null).length

  async function submit(ev: FormEvent) {
    ev.preventDefault()
    setError(null)
    if (done < ITEMS.length) return setError(t('sus.incomplete'))
    setStatus('sending')
    try {
      await api.sendSus(attemptId, { answers: answers as number[], comment: comment.trim() || undefined })
      setStatus('done')
    } catch (e) {
      setError((e as Error).message)
      setStatus('idle')
    }
  }

  return (
    <Card>
      <AnimatePresence mode="wait" initial={false}>
        {status === 'done' ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-2 px-6 py-4 text-center">
            <HeartHandshake className="mx-auto size-10 text-primary" aria-hidden />
            <p className="text-lg font-semibold" role="status">
              {t('sus.thanks')}
            </p>
            <p className="text-sm text-muted-foreground">{t('sus.thanksText')}</p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} exit={{ opacity: 0 }} noValidate>
            <CardHeader>
              <CardTitle>
                <h2>{t('sus.title')}</h2>
              </CardTitle>
              <CardDescription>{t('sus.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {ITEMS.map((n, i) => (
                <fieldset key={n} className="rounded-xl border p-3 sm:p-4">
                  <legend className="sr-only">{t(`sus.q${n}`)}</legend>
                  <p aria-hidden className="mb-3 text-sm leading-snug font-medium text-pretty">
                    {n}. {t(`sus.q${n}`)}
                  </p>
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {SCALE.map((v) => (
                      <label
                        key={v}
                        className={cn(
                          'grid h-10 cursor-pointer place-items-center rounded-lg border text-sm font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                          answers[i] === v ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent',
                        )}
                      >
                        <input
                          type="radio"
                          name={`sus-${n}`}
                          value={v}
                          className="sr-only"
                          checked={answers[i] === v}
                          onChange={() => setAnswers((a) => a.map((x, j) => (j === i ? v : x)))}
                          aria-label={`${t('sus.scaleValue', { n: v })}${v === 1 ? ` (${t('sus.scaleLow')})` : v === 5 ? ` (${t('sus.scaleHigh')})` : ''}`}
                        />
                        <span aria-hidden>{v}</span>
                      </label>
                    ))}
                  </div>
                  <div aria-hidden className="mt-1.5 flex justify-between gap-2 text-[11px] text-muted-foreground">
                    <span>{t('sus.scaleLow')}</span>
                    <span className="text-right">{t('sus.scaleHigh')}</span>
                  </div>
                </fieldset>
              ))}
              <div className="space-y-2 pt-2">
                <Label htmlFor="sus-comment">{t('sus.comment')}</Label>
                <Textarea
                  id="sus-comment"
                  maxLength={1000}
                  placeholder={t('sus.commentPlaceholder')}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              {error && (
                <Alert variant="destructive" role="alert">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex-wrap justify-between gap-3 pt-6">
              <span className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
                {t('sus.progress', { done })}
              </span>
              <Button type="submit" className="w-full rounded-full sm:w-auto" disabled={status === 'sending'}>
                <Send aria-hidden /> {status === 'sending' ? t('sus.sending') : t('sus.submit')}
              </Button>
            </CardFooter>
          </motion.form>
        )}
      </AnimatePresence>
    </Card>
  )
}
