import { Hono } from 'hono'
import { fail } from '../../lib/i18n'
import type { AppEnv } from '../../types'

export const adminAttemptRoutes = new Hono<AppEnv>()

adminAttemptRoutes.delete('/:attemptId', async (c) => {
  const res = await c.env.DB.prepare(
    'DELETE FROM attempts WHERE id = ? AND quiz_id IN (SELECT id FROM quizzes WHERE owner_id = ?)',
  )
    .bind(c.req.param('attemptId'), c.get('ownerId'))
    .run()
  if (!res.meta.changes) return fail(c, 404, 'attemptNotFound')
  return c.json({ ok: true })
})
