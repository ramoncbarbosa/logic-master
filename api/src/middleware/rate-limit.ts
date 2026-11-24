import { createMiddleware } from 'hono/factory'
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
        return c.json({ error: 'Muitas requisições. Aguarde um minuto e tente novamente.' }, 429)
      }
    }
    await next()
  })
