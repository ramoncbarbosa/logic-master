import { createMiddleware } from 'hono/factory'
import type { AppEnv } from '../types'

export const noStore = createMiddleware<AppEnv>(async (c, next) => {
  await next()
  c.header('Cache-Control', 'no-store')
})
