import { createMiddleware } from 'hono/factory'
import { isLocale, resolveLocale } from '../lib/i18n'
import type { AppEnv } from '../types'

export const detectLocale = createMiddleware<AppEnv>(async (c, next) => {
  const forced = c.req.query('lang')
  c.set('locale', isLocale(forced) ? forced : resolveLocale(c.req.header('accept-language')))
  await next()
})
