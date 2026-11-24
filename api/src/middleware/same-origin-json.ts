import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '../types'

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']

export const sameOriginJson = createMiddleware<AppEnv>(async (c, next) => {
  if (!SAFE_METHODS.includes(c.req.method)) {
    const origin = c.req.header('origin')
    if (origin && new URL(origin).host !== new URL(c.req.url).host) return c.json({ error: 'Origem não permitida' }, 403)
    const type = c.req.header('content-type') ?? ''
    const hasBody = Number(c.req.header('content-length') ?? 0) > 0 || !!c.req.header('transfer-encoding')
    if (hasBody && !type.includes('application/json')) return c.json({ error: 'Content-Type deve ser application/json' }, 415)
  }
  await next()
})
