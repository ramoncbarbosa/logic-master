import { Hono } from 'hono'
import { DUMMY_HASH, DUMMY_SALT, verifyPassword } from '../lib/password'
import { endSession, startSession } from '../lib/session'
import { clientIp } from '../lib/visitor'
import { rateLimit } from '../middleware/rate-limit'
import { requireOwner } from '../middleware/require-owner'
import { clearLoginFailures, isLoginLocked, recordLoginFailure } from '../services/login-guard'
import type { AppEnv, OwnerRow } from '../types'

type LoginBody = { email?: string; password?: string }

export const authRoutes = new Hono<AppEnv>()

authRoutes.get('/dev-login', (c) => {
  const { DEV_OWNER_EMAIL: email, DEV_OWNER_PASSWORD: password } = c.env
  return c.json(email && password ? { email, password } : null)
})

authRoutes.post('/login', rateLimit('RL_AUTH', 'auth'), async (c) => {
  const body = await c.req.json<LoginBody>().catch((): LoginBody => ({}))
  const email = String(body.email ?? '').trim().toLowerCase().slice(0, 200)
  const ip = clientIp(c)
  if (await isLoginLocked(c.env.DB, ip, email)) {
    c.header('Retry-After', '900')
    return c.json({ error: 'Muitas tentativas de login. Acesso bloqueado por 15 minutos.' }, 429)
  }

  const owner = await c.env.DB.prepare('SELECT * FROM owners WHERE email = ?').bind(email).first<OwnerRow>()
  const valid = await verifyPassword(
    String(body.password ?? '').slice(0, 200),
    owner?.password_hash ?? DUMMY_HASH,
    owner?.salt ?? DUMMY_SALT,
  )
  if (!owner || !valid) {
    await recordLoginFailure(c.env.DB, ip, email)
    return c.json({ error: 'E-mail ou senha incorretos' }, 401)
  }

  await clearLoginFailures(c.env.DB, ip, email)
  await startSession(c, owner.id)
  return c.json({ id: owner.id, name: owner.name, email: owner.email })
})

authRoutes.post('/logout', (c) => {
  endSession(c)
  return c.json({ ok: true })
})

authRoutes.get('/me', requireOwner, async (c) => {
  const owner = await c.env.DB.prepare('SELECT id, name, email FROM owners WHERE id = ?').bind(c.get('ownerId')).first()
  if (!owner) return c.json({ error: 'Não autenticado' }, 401)
  return c.json(owner)
})
