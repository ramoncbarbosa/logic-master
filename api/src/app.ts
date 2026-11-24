import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { secureHeaders } from 'hono/secure-headers'
import { MAX_BODY_BYTES } from './config'
import { ValidationError } from './lib/validation'
import { noStore } from './middleware/no-store'
import { rateLimit } from './middleware/rate-limit'
import { sameOriginJson } from './middleware/same-origin-json'
import { adminRoutes } from './routes/admin'
import { attemptRoutes } from './routes/attempts'
import { authRoutes } from './routes/auth'
import { publicRoutes } from './routes/public'
import type { AppEnv } from './types'

export const app = new Hono<AppEnv>().basePath('/api')

app.use('*', secureHeaders())
app.use('*', noStore)
app.use('*', rateLimit('RL_GLOBAL', 'global'))
app.use('*', bodyLimit({ maxSize: MAX_BODY_BYTES, onError: (c) => c.json({ error: 'Requisição muito grande' }, 413) }))
app.use('*', sameOriginJson)

app.route('/', publicRoutes)
app.route('/', attemptRoutes)
app.route('/auth', authRoutes)
app.route('/admin', adminRoutes)

app.notFound((c) => c.json({ error: 'Rota não encontrada' }, 404))
app.onError((err, c) => {
  if (err instanceof ValidationError) return c.json({ error: err.message }, 400)
  console.error(err)
  return c.json({ error: 'Erro interno' }, 500)
})
