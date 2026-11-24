import type { Context } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'
import { sign } from 'hono/jwt'
import { SESSION_COOKIE, SESSION_TTL_SECONDS } from '../config'
import type { AppEnv } from '../types'

export async function startSession(c: Context<AppEnv>, ownerId: number) {
  const now = Math.floor(Date.now() / 1000)
  const token = await sign({ sub: String(ownerId), iat: now, exp: now + SESSION_TTL_SECONDS }, c.env.JWT_SECRET, 'HS256')
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: new URL(c.req.url).protocol === 'https:',
    sameSite: 'Strict',
    path: '/api',
    maxAge: SESSION_TTL_SECONDS,
  })
}

export function endSession(c: Context<AppEnv>) {
  deleteCookie(c, SESSION_COOKIE, { path: '/api' })
}
