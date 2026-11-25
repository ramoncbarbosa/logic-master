import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowDown, ArrowLeft, ArrowUp, CheckCircle2, Languages, Plus, Save, Trash2, X } from 'lucide-react'
import {
  api,
  type Locale,
  type QuestionTranslation,
  type QuizInput,
  type QuizTranslation,
  type TranslatableLocale,
  type Translations,
} from '@/lib/api'
import { LANGUAGES } from '@/i18n'
import { useDocumentTitle } from '@/lib/use-document-title'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

type BaseQuestion = Omit<QuizInput['questions'][number], 'translations'>
type Q = BaseQuestion & { key: string; translations: Translations<QuestionTranslation> }
type Meta = Omit<QuizInput, 'questions' | 'translations'>

const BLANK_QUIZ_TR: QuizTranslation = { title: '', description: '', audience: '', objective: '', videoUrl: null }

const newQuestion = (): Q => ({
  key: crypto.randomUUID(),
  prompt: '',
  concept: '',
  imageUrl: null,
  imageAlt: null,
  code: null,
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
  translations: {},
})

const blankQuestionTr = (q: Q): QuestionTranslation => ({
  prompt: '',
  concept: '',
  options: q.options.map(() => ''),
  explanation: '',
  imageUrl: null,
  imageAlt: null,
  code: null,
})

const questionTr = (q: Q, locale: TranslatableLocale): QuestionTranslation => {
  const tr = q.translations[locale] ?? blankQuestionTr(q)
  return { ...tr, options: q.options.map((_, i) => tr.options[i] ?? '') }
}

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

const IMAGES = ['and-gate', 'or-gate', 'not-gate', 'truth-table', 'flowchart-decision', 'flowchart-nested', 'flowchart-loop', 'flowchart-while']

export default function QuizEditor() {
  const { t } = useTranslation()
  const { id } = useParams()
  const quizId = id ? Number(id) : null
  const navigate = useNavigate()
  useDocumentTitle(quizId ? t('editor.docEdit') : t('editor.docNew'))
  const [loading, setLoading] = useState(!!quizId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(!!quizId)
  const [licenses, setLicenses] = useState<string[]>([])
  const [lang, setLang] = useState<Locale>('pt')
  const [meta, setMeta] = useState<Meta>({
    slug: '',
    title: '',
    description: '',
    audience: '',
    objective: '',
    coverImage: null,
    videoUrl: null,
    license: 'CC BY-NC-SA 4.0',
    authors: [],
    attribution: [],
    changes: '',
    published: false,
  })
  const [quizTr, setQuizTr] = useState<Translations<QuizTranslation>>({})
  const [questions, setQuestions] = useState<Q[]>([newQuestion()])
  const isBase = lang === 'pt'
  const trLocale = lang as TranslatableLocale

  useEffect(() => {
    api.config().then((c) => setLicenses(Object.keys(c.licenses))).catch((e) => setError(e.message))
    if (!quizId) api.me().then((owner) => setMeta((m) => ({ ...m, authors: m.authors.length ? m.authors : [owner.name] }))).catch((e) => setError(e.message))
    if (!quizId) return
    api.admin.getQuiz(quizId)
      .then((q) => {
        setMeta({
          slug: q.slug,
          title: q.title,
          description: q.description,
          audience: q.audience,
          objective: q.objective,
          coverImage: q.coverImage,
          videoUrl: q.videoUrl,
          license: q.license,
          authors: q.authors,
          attribution: q.attribution,
          changes: q.changes,
          published: q.published,
        })
        setQuizTr(q.translations ?? {})
        setQuestions(
          q.questions.map((x) => ({
            id: x.id,
            key: String(x.id),
            prompt: x.prompt,
            concept: x.concept,
            imageUrl: x.imageUrl,
            imageAlt: x.imageAlt,
            code: x.code,
            options: x.options,
            correctIndex: x.correctIndex,
            explanation: x.explanation,
            translations: x.translations ?? {},
          })),
        )
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [quizId])

  const updateQ = (i: number, patch: Partial<Q>) => setQuestions((qs) => qs.map((q, j) => (j === i ? { ...q, ...patch } : q)))
  const updateQTr = (i: number, patch: Partial<QuestionTranslation>) =>
    setQuestions((qs) =>
      qs.map((q, j) => (j === i ? { ...q, translations: { ...q.translations, [trLocale]: { ...questionTr(q, trLocale), ...patch } } } : q)),
    )
  const updateQuizTr = (patch: Partial<QuizTranslation>) =>
    setQuizTr((tr) => ({ ...tr, [trLocale]: { ...(tr[trLocale] ?? BLANK_QUIZ_TR), ...patch } }))
  const move = (i: number, d: -1 | 1) =>
    setQuestions((qs) => {
      const next = [...qs]
      ;[next[i], next[i + d]] = [next[i + d], next[i]]
      return next
    })
  const mapTranslations = (q: Q, fn: (tr: QuestionTranslation) => QuestionTranslation) =>
    Object.fromEntries(Object.entries(q.translations).map(([k, tr]) => [k, fn(tr as QuestionTranslation)])) as Translations<QuestionTranslation>

  const translatedCount = (locale: TranslatableLocale) => questions.filter((q) => q.translations[locale]?.prompt.trim()).length

  async function save(ev: FormEvent) {
    ev.preventDefault()
    setError(null)
    setSaving(true)
    const input: QuizInput = {
      ...meta,
      authors: meta.authors.map((name) => name.trim()).filter(Boolean),
      videoUrl: meta.videoUrl || null,
      coverImage: meta.coverImage || null,
      translations: Object.fromEntries(
        Object.entries(quizTr).map(([locale, tr]) => [locale, { ...BLANK_QUIZ_TR, ...tr, videoUrl: tr?.videoUrl || null }]),
      ),
      questions: questions.map(({ key: _key, ...q }) => ({
        ...q,
        imageUrl: q.imageUrl || null,
        imageAlt: q.imageAlt || null,
        code: q.code || null,
        translations: Object.fromEntries(
          (Object.keys(q.translations) as TranslatableLocale[]).map((locale) => {
            const tr = questionTr({ ...q, key: '' }, locale)
            return [locale, { ...tr, imageUrl: tr.imageUrl || null, imageAlt: tr.imageAlt || null, code: tr.code || null }]
          }),
        ),
      })),
    }
    try {
      if (quizId) await api.admin.updateQuiz(quizId, input)
      else await api.admin.createQuiz(input)
      toast.success(t('editor.saved'))
      navigate('/admin')
    } catch (e) {
      setError((e as Error).message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Skeleton className="h-96 w-full" />

  const qt = quizTr[trLocale] ?? BLANK_QUIZ_TR

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" asChild>
          <Link to="/admin">
            <ArrowLeft aria-hidden /> {t('common.back')}
          </Link>
        </Button>
        <h1 className="order-first w-full text-2xl font-bold sm:order-none sm:mr-auto sm:w-auto sm:text-3xl">
          {quizId ? t('editor.titleEdit') : t('editor.titleNew')}
        </h1>
        <Button type="submit" disabled={saving}>
          <Save aria-hidden /> {saving ? t('common.saving') : t('common.save')}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Languages className="size-4 text-primary" aria-hidden /> {t('editor.contentLanguage')}
        </p>
        <div role="tablist" aria-label={t('editor.contentLanguage')} className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {LANGUAGES.map((l) => {
            const selected = lang === l.code
            const done = l.code === 'pt' ? null : translatedCount(l.code)
            return (
              <button
                key={l.code}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setLang(l.code)}
                className={cn(
                  'flex min-w-0 flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                  selected ? 'border-primary bg-accent text-accent-foreground' : 'hover:bg-muted',
                )}
              >
                <span aria-hidden>{l.flag}</span>
                <span className="min-w-0 flex-1 break-words font-medium">{t(`languages.${l.code}`)}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {done === null ? t('editor.base') : `${done}/${questions.length}`}
                </span>
              </button>
            )
          })}
        </div>
        {!isBase && (
          <Alert>
            <AlertDescription>{t('editor.translationHint', { language: t(`languages.${lang}`) })}</AlertDescription>
          </Alert>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>{t('editor.general')}</h2>
          </CardTitle>
        </CardHeader>
        {isBase ? (
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">{t('editor.title')}</Label>
              <Input
                id="title"
                required
                maxLength={150}
                value={meta.title}
                onChange={(e) => setMeta({ ...meta, title: e.target.value, slug: slugTouched ? meta.slug : slugify(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">{t('editor.slug')}</Label>
              <Input
                id="slug"
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                value={meta.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setMeta({ ...meta, slug: e.target.value })
                }}
              />
              <p className="text-xs text-muted-foreground">/quiz/{meta.slug || '…'}</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">{t('editor.description')}</Label>
              <Textarea id="description" value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="audience">{t('editor.audience')}</Label>
              <Input id="audience" value={meta.audience} onChange={(e) => setMeta({ ...meta, audience: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="license">{t('editor.license')}</Label>
              <Select value={meta.license} onValueChange={(license) => setMeta({ ...meta, license })}>
                <SelectTrigger id="license" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>{licenses.map((license) => <SelectItem key={license} value={license}>{license}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="authors">{t('editor.authors')}</Label>
              <Textarea id="authors" required value={meta.authors.join('\n')} onChange={(e) => setMeta({ ...meta, authors: e.target.value.split('\n') })} aria-describedby="authors-hint" />
              <p id="authors-hint" className="text-xs text-muted-foreground">{t('editor.authorsHint')}</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="changes">{t('editor.changes')}</Label>
              <Textarea id="changes" required={meta.attribution.length > 0} maxLength={1000} value={meta.changes} onChange={(e) => setMeta({ ...meta, changes: e.target.value })} aria-describedby="changes-hint" />
              <p id="changes-hint" className="text-xs text-muted-foreground">{t('editor.changesHint')}</p>
              {meta.attribution.length > 0 && <div className="space-y-2 rounded-lg border p-3 text-sm">
                <p className="font-medium">{t('editor.attribution')}</p>
                <ul className="space-y-2">{meta.attribution.map((source, i) => <li key={i}>
                  <a href={source.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{source.title}</a>
                  {' · '}{source.authors.join('; ')}{' · '}
                  <a href={source.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{source.license}</a>
                  {source.changes && <p>{source.changes}</p>}
                </li>)}</ul>
              </div>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="objective">{t('editor.objective')}</Label>
              <Textarea id="objective" value={meta.objective} onChange={(e) => setMeta({ ...meta, objective: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cover">{t('editor.cover')}</Label>
              <Input id="cover" value={meta.coverImage ?? ''} onChange={(e) => setMeta({ ...meta, coverImage: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video">{t('editor.video')}</Label>
              <Input
                id="video"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={meta.videoUrl ?? ''}
                onChange={(e) => setMeta({ ...meta, videoUrl: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="published" checked={meta.published} onCheckedChange={(v) => setMeta({ ...meta, published: v })} />
              <Label htmlFor="published">{t('editor.published')}</Label>
            </div>
          </CardContent>
        ) : (
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tr-title">{t('editor.title')}</Label>
              <Input id="tr-title" maxLength={150} placeholder={meta.title} value={qt.title} onChange={(e) => updateQuizTr({ title: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tr-description">{t('editor.description')}</Label>
              <Textarea
                id="tr-description"
                placeholder={meta.description}
                value={qt.description}
                onChange={(e) => updateQuizTr({ description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tr-audience">{t('editor.audience')}</Label>
              <Input id="tr-audience" placeholder={meta.audience} value={qt.audience} onChange={(e) => updateQuizTr({ audience: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tr-objective">{t('editor.objective')}</Label>
              <Input id="tr-objective" placeholder={meta.objective} value={qt.objective} onChange={(e) => updateQuizTr({ objective: e.target.value })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tr-video">{t('editor.video')}</Label>
              <Input
                id="tr-video"
                type="url"
                placeholder={meta.videoUrl || 'https://www.youtube.com/watch?v=...'}
                value={qt.videoUrl ?? ''}
                onChange={(e) => updateQuizTr({ videoUrl: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">{t('editor.videoHint')}</p>
            </div>
          </CardContent>
        )}
      </Card>

      <datalist id="image-suggestions">
        {IMAGES.map((name) => (
          <option key={name} value={isBase ? `/img/${name}.svg` : `/img/${lang}/${name}.svg`} />
        ))}
      </datalist>

      {questions.map((q, i) =>
        isBase ? (
          <Card key={q.key}>
            <CardHeader className="flex flex-wrap items-center gap-2">
              <CardTitle className="mr-auto">
                <h2>{t('editor.question', { n: i + 1 })}</h2>
              </CardTitle>
              <Button type="button" size="icon" variant="outline" disabled={i === 0} onClick={() => move(i, -1)} aria-label={t('editor.moveUp')}>
                <ArrowUp aria-hidden />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={i === questions.length - 1}
                onClick={() => move(i, 1)}
                aria-label={t('editor.moveDown')}
              >
                <ArrowDown aria-hidden />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={questions.length === 1}
                onClick={() => setQuestions((qs) => qs.filter((_, j) => j !== i))}
                aria-label={t('editor.removeQuestion', { n: i + 1 })}
              >
                <Trash2 aria-hidden />
              </Button>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`prompt-${q.key}`}>{t('editor.prompt')}</Label>
                <Textarea id={`prompt-${q.key}`} required value={q.prompt} onChange={(e) => updateQ(i, { prompt: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`concept-${q.key}`}>{t('editor.concept')}</Label>
                <Input
                  id={`concept-${q.key}`}
                  placeholder={t('editor.conceptPlaceholder')}
                  value={q.concept}
                  onChange={(e) => updateQ(i, { concept: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`img-${q.key}`}>{t('editor.image')}</Label>
                <Input id={`img-${q.key}`} list="image-suggestions" value={q.imageUrl ?? ''} onChange={(e) => updateQ(i, { imageUrl: e.target.value })} />
              </div>
              {q.imageUrl && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={`alt-${q.key}`}>{t('editor.imageAlt')}</Label>
                  <Input id={`alt-${q.key}`} required value={q.imageAlt ?? ''} onChange={(e) => updateQ(i, { imageAlt: e.target.value })} />
                </div>
              )}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`code-${q.key}`}>{t('editor.code')}</Label>
                <Textarea id={`code-${q.key}`} className="font-mono" value={q.code ?? ''} onChange={(e) => updateQ(i, { code: e.target.value })} />
              </div>

              <fieldset className="space-y-2 md:col-span-2">
                <legend className="mb-2 text-sm font-medium">{t('editor.optionsLegend')}</legend>
                {q.options.map((opt, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${q.key}`}
                      className="size-4 shrink-0 accent-[var(--primary)]"
                      checked={q.correctIndex === j}
                      onChange={() => updateQ(i, { correctIndex: j })}
                      aria-label={t('editor.optionIsCorrect', { n: j + 1 })}
                    />
                    <Input
                      required
                      value={opt}
                      aria-label={t('editor.option', { n: j + 1 })}
                      onChange={(e) => updateQ(i, { options: q.options.map((o, k) => (k === j ? e.target.value : o)) })}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="shrink-0"
                      disabled={q.options.length <= 2}
                      aria-label={t('editor.removeOption', { n: j + 1 })}
                      onClick={() =>
                        updateQ(i, {
                          options: q.options.filter((_, k) => k !== j),
                          correctIndex: q.correctIndex === j ? 0 : q.correctIndex > j ? q.correctIndex - 1 : q.correctIndex,
                          translations: mapTranslations(q, (tr) => ({ ...tr, options: tr.options.filter((_, k) => k !== j) })),
                        })
                      }
                    >
                      <X aria-hidden />
                    </Button>
                  </div>
                ))}
                {q.options.length < 6 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      updateQ(i, {
                        options: [...q.options, ''],
                        translations: mapTranslations(q, (tr) => ({ ...tr, options: [...tr.options, ''] })),
                      })
                    }
                  >
                    <Plus aria-hidden /> {t('editor.addOption')}
                  </Button>
                )}
              </fieldset>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`exp-${q.key}`}>{t('editor.explanation')}</Label>
                <Textarea id={`exp-${q.key}`} value={q.explanation} onChange={(e) => updateQ(i, { explanation: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        ) : (
          <TranslationCard key={`${q.key}-${lang}`} q={q} n={i + 1} tr={questionTr(q, trLocale)} onChange={(patch) => updateQTr(i, patch)} />
        ),
      )}

      <div className="flex flex-wrap gap-2">
        {isBase && (
          <Button type="button" variant="outline" onClick={() => setQuestions((qs) => [...qs, newQuestion()])}>
            <Plus aria-hidden /> {t('editor.addQuestion')}
          </Button>
        )}
        <Button type="submit" disabled={saving} className="ml-auto">
          <Save aria-hidden /> {saving ? t('common.saving') : t('editor.saveQuiz')}
        </Button>
      </div>
    </form>
  )
}

function TranslationCard({
  q,
  n,
  tr,
  onChange,
}: {
  q: Q
  n: number
  tr: QuestionTranslation
  onChange: (patch: Partial<QuestionTranslation>) => void
}) {
  const { t } = useTranslation()
  const done = !!tr.prompt.trim()
  return (
    <Card className={cn(!done && 'border-dashed')}>
      <CardHeader className="flex flex-wrap items-center gap-2">
        <CardTitle className="mr-auto">
          <h2>{t('editor.question', { n })}</h2>
        </CardTitle>
        {done && <CheckCircle2 className="size-5 text-success" aria-hidden />}
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={`tr-prompt-${q.key}`}>{t('editor.prompt')}</Label>
          <Textarea id={`tr-prompt-${q.key}`} placeholder={q.prompt} value={tr.prompt} onChange={(e) => onChange({ prompt: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`tr-concept-${q.key}`}>{t('editor.concept')}</Label>
          <Input id={`tr-concept-${q.key}`} placeholder={q.concept} value={tr.concept} onChange={(e) => onChange({ concept: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`tr-img-${q.key}`}>{t('editor.image')}</Label>
          <Input
            id={`tr-img-${q.key}`}
            list="image-suggestions"
            placeholder={q.imageUrl ?? ''}
            value={tr.imageUrl ?? ''}
            onChange={(e) => onChange({ imageUrl: e.target.value })}
          />
        </div>
        {(q.imageUrl || tr.imageUrl) && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`tr-alt-${q.key}`}>{t('editor.imageAlt')}</Label>
            <Input id={`tr-alt-${q.key}`} placeholder={q.imageAlt ?? ''} value={tr.imageAlt ?? ''} onChange={(e) => onChange({ imageAlt: e.target.value })} />
          </div>
        )}
        {(q.code || tr.code) && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor={`tr-code-${q.key}`}>{t('editor.code')}</Label>
            <Textarea
              id={`tr-code-${q.key}`}
              className="font-mono"
              placeholder={q.code ?? ''}
              value={tr.code ?? ''}
              onChange={(e) => onChange({ code: e.target.value })}
            />
          </div>
        )}
        <fieldset className="space-y-2 md:col-span-2">
          <legend className="mb-2 text-sm font-medium">{t('editor.optionsLegendTranslation')}</legend>
          {q.options.map((opt, j) => (
            <div key={j} className="flex items-center gap-2">
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-md border text-xs font-semibold',
                  j === q.correctIndex && 'border-success bg-success text-white',
                )}
                title={j === q.correctIndex ? t('editor.correct') : undefined}
              >
                {String.fromCharCode(65 + j)}
              </span>
              <Input
                placeholder={opt}
                aria-label={t('editor.option', { n: j + 1 })}
                value={tr.options[j] ?? ''}
                onChange={(e) => onChange({ options: tr.options.map((o, k) => (k === j ? e.target.value : o)) })}
              />
            </div>
          ))}
        </fieldset>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={`tr-exp-${q.key}`}>{t('editor.explanation')}</Label>
          <Textarea id={`tr-exp-${q.key}`} placeholder={q.explanation} value={tr.explanation} onChange={(e) => onChange({ explanation: e.target.value })} />
        </div>
      </CardContent>
    </Card>
  )
}
