import { useTranslation } from 'react-i18next'
import { Medal } from 'lucide-react'
import type { Ranking } from '@/lib/api'
import { formatDuration } from '@/lib/format'
import { cn } from '@/lib/utils'

const MEDALS = ['text-amber-500', 'text-slate-400', 'text-orange-700']

export default function RankingTable({ ranking, highlightMe = true }: { ranking: Ranking; highlightMe?: boolean }) {
  const { t } = useTranslation()
  const me = highlightMe ? ranking.me : null
  const meInTop = me && ranking.entries.some((e) => e.position === me.position && e.name === me.name)

  if (!ranking.entries.length) return <p className="text-sm text-muted-foreground">{t('ranking.empty')}</p>

  const row = (e: Ranking['entries'][number], mine: boolean, key: string) => (
    <li
      key={key}
      className={cn(
        'grid grid-cols-[2.5rem_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
        mine ? 'bg-primary/10 ring-1 ring-primary/40' : 'odd:bg-muted/40',
      )}
    >
      <span className="flex items-center gap-1 font-semibold tabular-nums">
        {e.position <= 3 ? <Medal className={cn('size-4', MEDALS[e.position - 1])} aria-hidden /> : null}
        {e.position}
      </span>
      <span className="truncate">
        {e.name}
        {mine && <span className="ml-1.5 text-xs font-medium text-primary">({t('ranking.you')})</span>}
      </span>
      <span className="font-semibold tabular-nums">
        {e.score}/{e.total}
      </span>
      <span className="w-16 text-right text-muted-foreground tabular-nums">{formatDuration(e.seconds)}</span>
    </li>
  )

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto_auto] gap-3 px-3 text-xs font-medium text-muted-foreground">
        <span>{t('ranking.position')}</span>
        <span>{t('ranking.participant')}</span>
        <span>{t('ranking.score')}</span>
        <span className="w-16 text-right">{t('ranking.time')}</span>
      </div>
      <ol className="space-y-1" aria-label={t('ranking.title')}>
        {ranking.entries.map((e, i) => row(e, !!meInTop && e.position === me!.position && e.name === me!.name, `top-${i}`))}
        {me && !meInTop && (
          <>
            <li aria-hidden className="px-3 text-center text-muted-foreground">
              ⋯
            </li>
            {row(me, true, 'me')}
          </>
        )}
      </ol>
    </div>
  )
}
