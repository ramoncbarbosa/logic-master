import { app } from './app'
import { runRetention } from './services/retention'
import type { Bindings } from './types'

export default {
  fetch: app.fetch,
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runRetention(env.DB))
  },
} satisfies ExportedHandler<Bindings>
