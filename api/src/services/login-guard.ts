import { LOGIN_LOCK_WINDOW, MAX_LOGIN_FAILURES_PER_EMAIL, MAX_LOGIN_FAILURES_PER_IP } from '../config'

export async function isLoginLocked(db: D1Database, ip: string, email: string) {
  const row = await db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM login_failures WHERE ip = ? AND created_at > datetime('now', ?)) AS byIp,
         (SELECT COUNT(*) FROM login_failures WHERE email = ? AND created_at > datetime('now', ?)) AS byEmail`,
    )
    .bind(ip, LOGIN_LOCK_WINDOW, email, LOGIN_LOCK_WINDOW)
    .first<{ byIp: number; byEmail: number }>()
  return !!row && (row.byIp >= MAX_LOGIN_FAILURES_PER_IP || row.byEmail >= MAX_LOGIN_FAILURES_PER_EMAIL)
}

export const recordLoginFailure = (db: D1Database, ip: string, email: string) =>
  db.prepare('INSERT INTO login_failures (ip, email) VALUES (?, ?)').bind(ip, email).run()

export const clearLoginFailures = (db: D1Database, ip: string, email: string) =>
  db.prepare('DELETE FROM login_failures WHERE ip = ? OR email = ?').bind(ip, email).run()
