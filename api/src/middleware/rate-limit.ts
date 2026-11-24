import { createMiddleware } from 'hono/factory'
import { fail } from '../lib/i18n'
import { clientIp } from '../lib/visitor'
import type { AppEnv } from '../types'

type LimiterName = 'RL_GLOBAL' | 'RL_AUTH' | 'RL_ATTEMPT'

export const rateLimit = (name: LimiterName, scope: string) =>
  createMiddleware<AppEnv>(async (c, next) => {
    const limiter = c.env[name]
    if (limiter) {
      const { success } = await limiter.limit({ key: `${scope}:${clientIp(c)}` })
      if (!success) {
        c.header('Retry-After', '60')
        return fail(c, 429, 'tooManyRequests')
      }
    }
    await next()
  })
