import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { verify } from 'hono/jwt'
import { SESSION_COOKIE } from '../config'
import type { AppEnv } from '../types'

export const requireOwner = createMiddleware<AppEnv>(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) return c.json({ error: 'Não autenticado' }, 401)
  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256')
    c.set('ownerId', Number(payload.sub))
  } catch {
    return c.json({ error: 'Sessão inválida ou expirada' }, 401)
  }
  await next()
})
