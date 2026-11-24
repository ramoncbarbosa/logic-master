import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import { verify } from 'hono/jwt'
import { SESSION_COOKIE } from '../config'
import { fail } from '../lib/i18n'
import type { AppEnv } from '../types'

export const requireOwner = createMiddleware<AppEnv>(async (c, next) => {
  const token = getCookie(c, SESSION_COOKIE)
  if (!token) return fail(c, 401, 'unauthenticated')
  try {
    const payload = await verify(token, c.env.JWT_SECRET, 'HS256')
    c.set('ownerId', Number(payload.sub))
  } catch {
    return fail(c, 401, 'sessionInvalid')
  }
  await next()
})
