import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { secureHeaders } from 'hono/secure-headers'
import { MAX_BODY_BYTES } from './config'
import { fail, t } from './lib/i18n'
import { ValidationError } from './lib/validation'
import { detectLocale } from './middleware/locale'
import { noStore } from './middleware/no-store'
import { rateLimit } from './middleware/rate-limit'
import { sameOriginJson } from './middleware/same-origin-json'
import { adminRoutes } from './routes/admin'
import { authRoutes } from './routes/auth'
import { publicRoutes } from './routes/public'
import type { AppEnv } from './types'

export const app = new Hono<AppEnv>().basePath('/api')

app.use('*', detectLocale)
app.use('*', secureHeaders())
app.use('*', noStore)
app.use('*', rateLimit('RL_GLOBAL', 'global'))
app.use('*', bodyLimit({ maxSize: MAX_BODY_BYTES, onError: (c) => fail(c, 413, 'bodyTooLarge') }))
app.use('*', sameOriginJson)

app.route('/', publicRoutes)
app.route('/auth', authRoutes)
app.route('/admin', adminRoutes)

app.notFound((c) => fail(c, 404, 'routeNotFound'))
app.onError((err, c) => {
  if (err instanceof ValidationError) {
    const field = err.fieldKey ? t(c, err.fieldKey, err.fieldParams) : ''
    return c.json({ error: t(c, err.key, { ...err.params, field }), code: err.key }, 400)
  }
  console.error(err)
  return fail(c, 500, 'internal')
})
