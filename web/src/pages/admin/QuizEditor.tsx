import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Save, Trash2, X } from 'lucide-react'
import { api, type QuizInput } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

type Q = QuizInput['questions'][number] & { key: string }

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
})

const slugify = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

const IMAGES = ['/img/and-gate.svg', '/img/or-gate.svg', '/img/not-gate.svg', '/img/truth-table.svg', '/img/flowchart-decision.svg', '/img/flowchart-loop.svg']

export default function QuizEditor() {
  const { id } = useParams()
  const quizId = id ? Number(id) : null
  const navigate = useNavigate()
  const [loading, setLoading] = useState(!!quizId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugTouched, setSlugTouched] = useState(!!quizId)
  const [hasAttempts, setHasAttempts] = useState(false)
  const [meta, setMeta] = useState<Omit<QuizInput, 'questions'>>({
    slug: '',
    title: '',
    description: '',
    audience: '',
    objective: '',
    coverImage: null,
    videoUrl: null,
    license: 'CC BY-SA 4.0',
    published: false,
  })
  const [questions, setQuestions] = useState<Q[]>([newQuestion()])

  useEffect(() => {
    document.title = `${quizId ? 'Editar' : 'Novo'} quiz — Logic Master`
    if (!quizId) return
    Promise.all([api.admin.getQuiz(quizId), api.admin.stats(quizId)])
      .then(([q, s]) => {
        setMeta({
          slug: q.slug,
          title: q.title,
          description: q.description,
          audience: q.audience,
          objective: q.objective,
          coverImage: q.coverImage,
          videoUrl: q.videoUrl,
          license: q.license,
          published: q.published,
        })
        setQuestions(q.questions.map((x) => ({ ...x, key: String(x.id) })))
        setHasAttempts(s.summary.attempts > 0)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [quizId])

  const updateQ = (i: number, patch: Partial<Q>) => setQuestions((qs) => qs.map((q, j) => (j === i ? { ...q, ...patch } : q)))
  const move = (i: number, d: -1 | 1) =>
    setQuestions((qs) => {
      const next = [...qs]
      ;[next[i], next[i + d]] = [next[i + d], next[i]]
      return next
    })

  async function save(ev: FormEvent) {
    ev.preventDefault()
    setError(null)
    setSaving(true)
    const input: QuizInput = {
      ...meta,
      videoUrl: meta.videoUrl || null,
      coverImage: meta.coverImage || null,
      questions: questions.map(({ key: _k, ...q }) => ({
        ...q,
        imageUrl: q.imageUrl || null,
        imageAlt: q.imageAlt || null,
        code: q.code || null,
      })),
    }
    try {
      if (quizId) await api.admin.updateQuiz(quizId, input)
      else await api.admin.createQuiz(input)
      toast.success('Quiz salvo')
      navigate('/admin')
    } catch (e) {
      setError((e as Error).message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Skeleton className="h-96 w-full" />

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" asChild>
          <Link to="/admin">
            <ArrowLeft aria-hidden /> Voltar
          </Link>
        </Button>
        <h1 className="mr-auto text-3xl font-bold">{quizId ? 'Editar quiz' : 'Novo quiz'}</h1>
        <Button type="submit" disabled={saving}>
          <Save aria-hidden /> {saving ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {hasAttempts && (
        <Alert>
          <AlertDescription>
            Este quiz já possui respostas. Alterar a ordem das alternativas ou a resposta correta afeta a interpretação
            das estatísticas já coletadas; excluir uma questão apaga suas respostas.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Informações gerais (planejamento do RED)</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              required
              maxLength={150}
              value={meta.title}
              onChange={(e) =>
                setMeta({ ...meta, title: e.target.value, slug: slugTouched ? meta.slug : slugify(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Endereço (slug)</Label>
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
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="audience">Público-alvo</Label>
            <Input id="audience" value={meta.audience} onChange={(e) => setMeta({ ...meta, audience: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="license">Licença</Label>
            <Input id="license" value={meta.license} onChange={(e) => setMeta({ ...meta, license: e.target.value })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="objective">Objetivo de aprendizagem</Label>
            <Textarea id="objective" value={meta.objective} onChange={(e) => setMeta({ ...meta, objective: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cover">Imagem de capa (caminho /img/... ou URL https)</Label>
            <Input id="cover" value={meta.coverImage ?? ''} onChange={(e) => setMeta({ ...meta, coverImage: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="video">Vídeo de apoio (YouTube ou Vimeo, opcional)</Label>
            <Input id="video" type="url" placeholder="https://www.youtube.com/watch?v=..." value={meta.videoUrl ?? ''} onChange={(e) => setMeta({ ...meta, videoUrl: e.target.value })} />
          </div>
          <div className="flex items-center gap-3">
            <Switch id="published" checked={meta.published} onCheckedChange={(v) => setMeta({ ...meta, published: v })} />
            <Label htmlFor="published">Publicado (visível para os estudantes)</Label>
          </div>
        </CardContent>
      </Card>

      <datalist id="image-suggestions">
        {IMAGES.map((src) => (
          <option key={src} value={src} />
        ))}
      </datalist>

      {questions.map((q, i) => (
        <Card key={q.key}>
          <CardHeader className="flex-row items-center gap-2">
            <CardTitle className="mr-auto">
              <h2>Questão {i + 1}</h2>
            </CardTitle>
            <Button type="button" size="icon" variant="outline" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Mover para cima">
              <ArrowUp aria-hidden />
            </Button>
            <Button type="button" size="icon" variant="outline" disabled={i === questions.length - 1} onClick={() => move(i, 1)} aria-label="Mover para baixo">
              <ArrowDown aria-hidden />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              disabled={questions.length === 1}
              onClick={() => setQuestions((qs) => qs.filter((_, j) => j !== i))}
              aria-label={`Remover questão ${i + 1}`}
            >
              <Trash2 aria-hidden />
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`prompt-${q.key}`}>Enunciado</Label>
              <Textarea id={`prompt-${q.key}`} required value={q.prompt} onChange={(e) => updateQ(i, { prompt: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`concept-${q.key}`}>Conceito avaliado</Label>
              <Input id={`concept-${q.key}`} placeholder="Ex.: Tabela-verdade" value={q.concept} onChange={(e) => updateQ(i, { concept: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`img-${q.key}`}>Imagem (opcional)</Label>
              <Input id={`img-${q.key}`} list="image-suggestions" value={q.imageUrl ?? ''} onChange={(e) => updateQ(i, { imageUrl: e.target.value })} />
            </div>
            {q.imageUrl && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`alt-${q.key}`}>Texto alternativo da imagem (obrigatório para acessibilidade)</Label>
                <Input id={`alt-${q.key}`} required value={q.imageAlt ?? ''} onChange={(e) => updateQ(i, { imageAlt: e.target.value })} />
              </div>
            )}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`code-${q.key}`}>Código / pseudocódigo (opcional)</Label>
              <Textarea id={`code-${q.key}`} className="font-mono" value={q.code ?? ''} onChange={(e) => updateQ(i, { code: e.target.value })} />
            </div>

            <fieldset className="space-y-2 md:col-span-2">
              <legend className="mb-2 text-sm font-medium">Alternativas (marque a correta)</legend>
              {q.options.map((opt, j) => (
                <div key={j} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${q.key}`}
                    className="size-4 accent-[var(--primary)]"
                    checked={q.correctIndex === j}
                    onChange={() => updateQ(i, { correctIndex: j })}
                    aria-label={`Alternativa ${j + 1} é a correta`}
                  />
                  <Input
                    required
                    value={opt}
                    aria-label={`Alternativa ${j + 1}`}
                    onChange={(e) => updateQ(i, { options: q.options.map((o, k) => (k === j ? e.target.value : o)) })}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    disabled={q.options.length <= 2}
                    aria-label={`Remover alternativa ${j + 1}`}
                    onClick={() =>
                      updateQ(i, {
                        options: q.options.filter((_, k) => k !== j),
                        correctIndex: q.correctIndex === j ? 0 : q.correctIndex > j ? q.correctIndex - 1 : q.correctIndex,
                      })
                    }
                  >
                    <X aria-hidden />
                  </Button>
                </div>
              ))}
              {q.options.length < 6 && (
                <Button type="button" variant="outline" size="sm" onClick={() => updateQ(i, { options: [...q.options, ''] })}>
                  <Plus aria-hidden /> Alternativa
                </Button>
              )}
            </fieldset>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`exp-${q.key}`}>Explicação (feedback exibido após responder)</Label>
              <Textarea id={`exp-${q.key}`} value={q.explanation} onChange={(e) => updateQ(i, { explanation: e.target.value })} />
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => setQuestions((qs) => [...qs, newQuestion()])}>
          <Plus aria-hidden /> Adicionar questão
        </Button>
        <Button type="submit" disabled={saving} className="ml-auto">
          <Save aria-hidden /> {saving ? 'Salvando…' : 'Salvar quiz'}
        </Button>
      </div>
    </form>
  )
}
