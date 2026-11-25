import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Copy, Quote } from 'lucide-react'
import { buildCitation } from '@/lib/citation'
import type { Attribution } from '@/lib/api'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

type Props = {
  title: string
  year: number
  authors: string[]
  license: string
  licenseUrl: string
  url: string
  className?: string
  printable?: boolean
  attribution?: Attribution[]
  changes?: string
}

export default function QuizCitation({ title, year, authors, license, licenseUrl, url, className, printable = false, attribution = [], changes = '' }: Props) {
  const { t, i18n } = useTranslation()
  const text = useMemo(
    () =>
      [buildCitation({
        locale: i18n.language,
        authors,
        title,
        year,
        url,
        license,
        resourceType: t('citation.resourceType'),
        accessed: new Date(),
      }),
      ...attribution.map((source) => t('citation.source', { title: source.title, authors: source.authors.join('; '), source: source.source, license: source.license, licenseUrl: source.licenseUrl }) + (source.changes ? ` ${t('citation.changes', { changes: source.changes })}` : '')),
      changes ? t('citation.changes', { changes }) : '',
      ].filter(Boolean).join('\n'),
    [i18n.language, authors, title, year, url, license, attribution, changes, t],
  )

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(t('citation.copied'))
    } catch {
      toast.error(t('citation.copyError'))
    }
  }

  return (
    <section aria-labelledby="citation-title" className={cn('space-y-3 rounded-xl border bg-card/80 p-4 shadow-sm', className)}>
      <div className="flex items-center gap-2">
        <Quote className="size-4 text-primary" aria-hidden />
        <h2 id="citation-title" className="mr-auto text-sm font-semibold">
          {t('citation.title')}
        </h2>
        {!printable && (
          <Button variant="ghost" size="sm" onClick={copy} className="print:hidden">
            <Copy aria-hidden /> {t('citation.copy')}
          </Button>
        )}
      </div>
      <p className="text-sm break-words whitespace-pre-line text-pretty">{text}</p>
      <p className="text-xs text-muted-foreground">
        {t('citation.licenseText', { license })}{' '}
        <a href={licenseUrl} target="_blank" rel="license noopener noreferrer" className="underline underline-offset-2">
          {licenseUrl}
        </a>
      </p>
    </section>
  )
}
