import type { QuestionInput, QuizInput } from '../types'

export class ValidationError extends Error {}

const str = (v: unknown, field: string, { max = 2000, required = false } = {}) => {
  if (v == null || v === '') {
    if (required) throw new ValidationError(`Campo obrigatório: ${field}`)
    return undefined
  }
  if (typeof v !== 'string') throw new ValidationError(`Campo inválido: ${field}`)
  const s = v.trim()
  if (required && !s) throw new ValidationError(`Campo obrigatório: ${field}`)
  if (s.length > max) throw new ValidationError(`${field} excede ${max} caracteres`)
  return s
}

const url = (v: unknown, field: string) => {
  const s = str(v, field, { max: 500 })
  if (!s) return null
  if (s.startsWith('/') && !s.startsWith('//')) return s
  try {
    if (new URL(s).protocol === 'https:') return s
  } catch {
  }
  throw new ValidationError(`${field} deve ser um caminho local (/img/...) ou uma URL https`)
}

export function parseQuizInput(body: unknown): QuizInput {
  if (!body || typeof body !== 'object') throw new ValidationError('Corpo da requisição inválido')
  const b = body as Record<string, unknown>

  const slug = str(b.slug, 'slug', { required: true, max: 80 })!.toLowerCase()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new ValidationError('O slug deve conter apenas letras minúsculas, números e hífens')

  if (!Array.isArray(b.questions)) throw new ValidationError('Lista de questões inválida')
  if (b.questions.length > 100) throw new ValidationError('Máximo de 100 questões por quiz')

  const questions: QuestionInput[] = b.questions.map((raw, i) => {
    const q = (raw ?? {}) as Record<string, unknown>
    const label = `Questão ${i + 1}`
    if (!Array.isArray(q.options)) throw new ValidationError(`${label}: alternativas inválidas`)
    const options = q.options.map((o, j) => str(o, `${label}, alternativa ${j + 1}`, { required: true, max: 500 })!)
    if (options.length < 2 || options.length > 6) throw new ValidationError(`${label}: use de 2 a 6 alternativas`)
    const correctIndex = Number(q.correctIndex)
    if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length)
      throw new ValidationError(`${label}: marque a alternativa correta`)
    const id = q.id == null ? undefined : Number(q.id)
    return {
      id: id && Number.isInteger(id) ? id : undefined,
      prompt: str(q.prompt, `${label}: enunciado`, { required: true, max: 2000 })!,
      concept: str(q.concept, `${label}: conceito`, { max: 80 }) ?? '',
      imageUrl: url(q.imageUrl, `${label}: imagem`),
      imageAlt: str(q.imageAlt, `${label}: texto alternativo`, { max: 300 }) ?? null,
      code: str(q.code, `${label}: código`, { max: 4000 }) ?? null,
      options,
      correctIndex,
      explanation: str(q.explanation, `${label}: explicação`, { max: 2000 }) ?? '',
    }
  })

  for (const q of questions)
    if (q.imageUrl && !q.imageAlt)
      throw new ValidationError('Toda imagem precisa de texto alternativo (acessibilidade)')

  return {
    slug,
    title: str(b.title, 'título', { required: true, max: 150 })!,
    description: str(b.description, 'descrição', { max: 2000 }) ?? '',
    audience: str(b.audience, 'público-alvo', { max: 300 }) ?? '',
    objective: str(b.objective, 'objetivo', { max: 1000 }) ?? '',
    coverImage: url(b.coverImage, 'capa'),
    videoUrl: url(b.videoUrl, 'vídeo'),
    license: str(b.license, 'licença', { max: 60 }) ?? 'CC BY-SA 4.0',
    published: b.published === true,
    questions,
  }
}
