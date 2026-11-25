import { SUS_GRADES, susGrade } from '../lib/sus'

type Scope = { ownerId: number; quizId?: number }

const where = (scope: Scope) =>
  scope.quizId ? { sql: 'z.owner_id = ? AND s.quiz_id = ?', params: [scope.ownerId, scope.quizId] } : { sql: 'z.owner_id = ?', params: [scope.ownerId] }

const median = (values: number[]) => {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export async function susSummary(db: D1Database, scope: Scope) {
  const w = where(scope)
  const [scores, items] = await db.batch([
    db.prepare(`SELECT s.score FROM sus_responses s JOIN quizzes z ON z.id = s.quiz_id WHERE ${w.sql}`).bind(...w.params),
    db
      .prepare(
        `SELECT AVG(q1) AS q1, AVG(q2) AS q2, AVG(q3) AS q3, AVG(q4) AS q4, AVG(q5) AS q5,
           AVG(q6) AS q6, AVG(q7) AS q7, AVG(q8) AS q8, AVG(q9) AS q9, AVG(q10) AS q10
         FROM sus_responses s JOIN quizzes z ON z.id = s.quiz_id WHERE ${w.sql}`,
      )
      .bind(...w.params),
  ])

  const values = (scores.results as { score: number }[]).map((r) => r.score)
  const itemRow = (items.results[0] ?? {}) as Record<string, number | null>
  const mean = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null

  return {
    responses: values.length,
    mean,
    median: median(values),
    grade: mean == null ? null : susGrade(mean),
    distribution: SUS_GRADES.map(({ grade }) => ({ grade, count: values.filter((v) => susGrade(v) === grade).length })),
    items: Array.from({ length: 10 }, (_, i) => ({ item: i + 1, mean: itemRow[`q${i + 1}`] ?? null })),
  }
}

export async function susRows(db: D1Database, scope: Scope) {
  const w = where(scope)
  const { results } = await db
    .prepare(
      `SELECT z.title AS quiz, s.created_at,
         s.q1, s.q2, s.q3, s.q4, s.q5, s.q6, s.q7, s.q8, s.q9, s.q10, s.score
       FROM sus_responses s JOIN quizzes z ON z.id = s.quiz_id
       WHERE ${w.sql} ORDER BY s.created_at`,
    )
    .bind(...w.params)
    .all<Record<string, string | number | null> & { score: number }>()
  return results
}
