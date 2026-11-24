import { createMiddleware } from 'hono/factory'
import { resolveLocale } from '../lib/i18n'
import type { AppEnv } from '../types'

export const detectLocale = createMiddleware<AppEnv>(async (c, next) => {
  c.set('locale', resolveLocale(c.req.header('accept-language')))
  await next()
})
