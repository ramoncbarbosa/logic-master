import type { Context } from 'hono'
import type { AppEnv } from '../types'

export const clientIp = (c: Context<AppEnv>) =>
  c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

