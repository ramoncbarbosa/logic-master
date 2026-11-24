import i18n, { languageTag } from '@/i18n'

export const formatDuration = (seconds: number | null | undefined) => {
  if (seconds == null) return '—'
  const total = Math.max(0, Math.round(seconds))
  const m = Math.floor(total / 60)
  const s = total % 60
  return m ? i18n.t('common.minutesSeconds', { m, s }) : i18n.t('common.seconds', { s })
}

export const formatDateTime = (value: string | null) =>
  value ? new Date(value.replace(' ', 'T') + 'Z').toLocaleString(languageTag()) : '—'

export const formatPercent = (value: number | null | undefined) =>
  value == null ? '—' : new Intl.NumberFormat(languageTag(), { style: 'percent', maximumFractionDigits: 0 }).format(value / 100)

export const formatShortDate = (isoDay: string) =>
  new Date(isoDay + 'T12:00:00Z').toLocaleDateString(languageTag(), { day: '2-digit', month: '2-digit' })
