const escapeCell = (v: unknown) => {
  let s = v == null ? '' : String(v)
  if (/^[=+\-@]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

export function toCsv(header: string[], rows: Record<string, unknown>[]) {
  return '﻿' + [header.join(','), ...rows.map((r) => Object.values(r).map(escapeCell).join(','))].join('\r\n')
}
