import { DATA_RETENTION_DAYS } from '../config'

export async function runRetention(db: D1Database) {
  await db.batch([
    db
      .prepare(
        `DELETE FROM sus_responses WHERE created_at < date('now', ?)`,
      )
      .bind(`-${DATA_RETENTION_DAYS} days`),
    db.prepare(`DELETE FROM login_failures WHERE created_at < datetime('now', '-1 day')`),
  ])
}
