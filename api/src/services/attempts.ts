import { MAX_ATTEMPTS_PER_IP_PER_HOUR } from '../config'

export async function tooManyAttemptsFromIp(db: D1Database, ip: string) {
  const row = await db
    .prepare(`SELECT COUNT(*) AS n FROM attempts WHERE ip = ? AND started_at > datetime('now', '-1 hour')`)
    .bind(ip)
    .first<{ n: number }>()
  return (row?.n ?? 0) >= MAX_ATTEMPTS_PER_IP_PER_HOUR
}
