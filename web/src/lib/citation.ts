import { useEffect } from 'react'

const ABNT_MONTHS = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.']
const PARTICLES = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'van', 'von', 'del', 'la', 'le'])

const splitName = (full: string) => {
  const parts = full.trim().split(/\s+/)
  return { last: parts.at(-1) ?? full, given: parts.slice(0, -1) }
}

const abntAuthor = (full: string) => {
  const { last, given } = splitName(full)
  return given.length ? `${last.toLocaleUpperCase('pt-BR')}, ${given.join(' ')}` : last.toLocaleUpperCase('pt-BR')
}

const apaAuthor = (full: string) => {
  const { last, given } = splitName(full)
  const initials = given.filter((g) => !PARTICLES.has(g.toLowerCase())).map((g) => `${g[0]}.`)
  return initials.length ? `${last}, ${initials.join(' ')}` : last
}

const apaAuthors = (names: string[]) => {
  const list = names.map(apaAuthor)
  return list.length > 1 ? `${list.slice(0, -1).join(', ')}, & ${list.at(-1)}` : (list[0] ?? '')
}

export type CitationInput = {
  locale: string
  authors: string[]
  title: string
  year: number
  url: string
  license: string
  resourceType: string
  accessed: Date
}

export function buildCitation(c: CitationInput) {
  if (c.locale === 'pt') {
    const date = `${c.accessed.getDate()} ${ABNT_MONTHS[c.accessed.getMonth()]} ${c.accessed.getFullYear()}`
    return `${c.authors.map(abntAuthor).join('; ')}. Logic Master: ${c.title}. ${c.year}. ${c.resourceType}. Licença ${c.license}. Disponível em: ${c.url}. Acesso em: ${date}.`
  }
  return `${apaAuthors(c.authors)} (${c.year}). Logic Master: ${c.title} [${c.resourceType}]. ${c.license}. ${c.url}`
}

export function useJsonLd(id: string, data: object | null) {
  const json = data ? JSON.stringify(data) : null
  useEffect(() => {
    if (!json) return
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    el.textContent = json
    document.getElementById(id)?.remove()
    document.head.appendChild(el)
    return () => el.remove()
  }, [id, json])
}

export type LearningResourceInput = {
  name: string
  description?: string
  url: string
  inLanguage: string
  audience?: string
  teaches: string[]
  authors: string[]
  license: string
  licenseUrl: string
  downloadUrl: string
  dateCreated?: string
  dateModified?: string
}

export const learningResource = (r: LearningResourceInput) => ({
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: r.name,
  description: r.description || undefined,
  url: r.url,
  inLanguage: r.inLanguage,
  learningResourceType: 'Quiz',
  interactivityType: 'active',
  isAccessibleForFree: true,
  license: r.licenseUrl,
  conditionsOfAccess: r.license,
  educationalLevel: r.audience || undefined,
  audience: r.audience ? { '@type': 'EducationalAudience', educationalRole: 'student', audienceType: r.audience } : undefined,
  teaches: r.teaches.length ? r.teaches : undefined,
  about: 'Lógica computacional',
  author: r.authors.map((name) => ({ '@type': 'Person', name })),
  dateCreated: r.dateCreated,
  dateModified: r.dateModified,
  encoding: { '@type': 'MediaObject', encodingFormat: 'application/json', contentUrl: r.downloadUrl },
  isPartOf: { '@type': 'WebSite', name: 'Logic Master', url: new URL('/', r.url).href },
})
