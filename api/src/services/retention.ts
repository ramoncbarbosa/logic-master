import { DATA_RETENTION_DAYS } from '../config'

export async function runRetention(db: D1Database) {
  await db.batch([
    db
      .prepare(
        `UPDATE attempts SET player_email = NULL, ip = NULL, city = NULL, region = NULL, latitude = NULL, longitude = NULL,
           user_agent = NULL
         WHERE (ip IS NOT NULL OR player_email IS NOT NULL) AND started_at < datetime('now', ?)`,
      )
      .bind(`-${DATA_RETENTION_DAYS} days`),
    db.prepare(`DELETE FROM login_failures WHERE created_at < datetime('now', '-1 day')`),
  ])
}
