import type { Context } from 'hono'
import type { AppEnv } from '../types'

export const clientIp = (c: Context<AppEnv>) =>
  c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

const coord = (v: unknown, max: number) => {
  const n = Number(v)
  return v != null && v !== '' && Number.isFinite(n) && Math.abs(n) <= max ? Math.round(n * 1e4) / 1e4 : null
}

const decode = (v: string | null) => {
  if (!v) return null
  try {
    return decodeURIComponent(v).slice(0, 100)
  } catch {
    return null
  }
}

export function visitorInfo(c: Context<AppEnv>) {
  const h = c.req.raw.headers
  const cf = (c.req.raw as Request & { cf?: Record<string, unknown> }).cf ?? {}
  return {
    ip: clientIp(c),
    country: h.get('x-lm-country') ?? (cf.country as string | undefined) ?? null,
    region: decode(h.get('x-lm-region')) ?? (cf.region as string | undefined) ?? null,
    city: decode(h.get('x-lm-city')) ?? (cf.city as string | undefined) ?? null,
    latitude: coord(h.get('x-lm-lat') ?? cf.latitude, 90),
    longitude: coord(h.get('x-lm-lon') ?? cf.longitude, 180),
    userAgent: h.get('user-agent')?.slice(0, 300) ?? null,
  }
}
