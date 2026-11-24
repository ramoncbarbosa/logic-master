export type RankingEntry = { position: number; name: string; score: number; total: number; seconds: number }

const RANKED = `
  WITH finished AS (
    SELECT id, COALESCE(player_email, id) AS player, player_name, score, total, finished_at,
      CAST(ROUND((julianday(finished_at) - julianday(started_at)) * 86400) AS INTEGER) AS seconds
    FROM attempts WHERE quiz_id = ? AND finished_at IS NOT NULL
  ),
  best AS (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY player ORDER BY score DESC, seconds ASC, finished_at ASC) AS rn FROM finished
  ),
  ranked AS (
    SELECT id, player, player_name, score, total, seconds, RANK() OVER (ORDER BY score DESC, seconds ASC) AS position
    FROM best WHERE rn = 1
  )`

export const publicName = (full: string) => {
  const parts = full.trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 1) return parts[0] ?? '—'
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`
}

type Row = { id: string; player: string; player_name: string; score: number; total: number; seconds: number; position: number }

const toEntry = (r: Row): RankingEntry => ({
  position: r.position,
  name: publicName(r.player_name),
  score: r.score,
  total: r.total,
  seconds: r.seconds,
})

export async function quizRanking(db: D1Database, quizId: number, limit: number, attemptId?: string) {
  const [top, count, me] = await db.batch([
    db.prepare(`${RANKED} SELECT * FROM ranked ORDER BY position, player_name LIMIT ?`).bind(quizId, limit),
    db.prepare(`${RANKED} SELECT COUNT(*) AS players FROM ranked`).bind(quizId),
    db
      .prepare(
        `${RANKED} SELECT r.* FROM ranked r
         WHERE r.player = (SELECT COALESCE(player_email, id) FROM attempts WHERE id = ? AND quiz_id = ?)`,
      )
      .bind(quizId, attemptId ?? '', quizId),
  ])
  const mine = (me.results as Row[])[0]
  return {
    entries: (top.results as Row[]).map(toEntry),
    players: (count.results as { players: number }[])[0]?.players ?? 0,
    me: mine ? { ...toEntry(mine), isThisAttempt: mine.id === attemptId } : null,
  }
}
