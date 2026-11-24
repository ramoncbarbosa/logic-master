import { parseOptions } from '../lib/mappers'
import type { QuestionRow } from '../types'

type AnswerAggregate = { questionId: number; selectedIndex: number; count: number; correct: number; avgTimeMs: number }

export async function quizStats(db: D1Database, quizId: number) {
  const [summary, scoreDistribution, questions, answers, perConcept, perDay, byCountry, locations] = await db.batch([
    db.prepare(
      `SELECT COUNT(*) AS attempts,
         SUM(CASE WHEN finished_at IS NOT NULL THEN 1 ELSE 0 END) AS finished,
         AVG(CASE WHEN finished_at IS NOT NULL THEN score * 100.0 / NULLIF(total, 0) END) AS avgPct,
         AVG(CASE WHEN finished_at IS NOT NULL THEN (julianday(finished_at) - julianday(started_at)) * 86400 END) AS avgSeconds,
         COUNT(DISTINCT ip) AS uniqueIps, COUNT(DISTINCT player_email) AS uniqueEmails
       FROM attempts WHERE quiz_id = ?`,
    ).bind(quizId),
    db.prepare(
      `SELECT score, total, COUNT(*) AS count FROM attempts
       WHERE quiz_id = ? AND finished_at IS NOT NULL GROUP BY score, total ORDER BY score`,
    ).bind(quizId),
    db.prepare('SELECT * FROM questions WHERE quiz_id = ? ORDER BY position').bind(quizId),
    db.prepare(
      `SELECT a.question_id AS questionId, a.selected_index AS selectedIndex, COUNT(*) AS count,
         SUM(a.is_correct) AS correct, AVG(a.time_ms) AS avgTimeMs
       FROM answers a JOIN questions q ON q.id = a.question_id
       WHERE q.quiz_id = ? GROUP BY a.question_id, a.selected_index`,
    ).bind(quizId),
    db.prepare(
      `SELECT q.concept, COUNT(a.question_id) AS answered, COALESCE(SUM(a.is_correct), 0) AS correct
       FROM questions q LEFT JOIN answers a ON a.question_id = q.id
       WHERE q.quiz_id = ? GROUP BY q.concept ORDER BY MIN(q.position)`,
    ).bind(quizId),
    db.prepare(
      `SELECT date(started_at) AS day, COUNT(*) AS attempts,
         AVG(CASE WHEN finished_at IS NOT NULL THEN score * 100.0 / NULLIF(total, 0) END) AS avgPct
       FROM attempts WHERE quiz_id = ? GROUP BY day ORDER BY day`,
    ).bind(quizId),
    db.prepare(
      `SELECT COALESCE(country, '??') AS country, COUNT(*) AS attempts
       FROM attempts WHERE quiz_id = ? GROUP BY country ORDER BY attempts DESC LIMIT 15`,
    ).bind(quizId),
    db.prepare(
      `SELECT ROUND(latitude, 1) AS lat, ROUND(longitude, 1) AS lon,
         MAX(city) AS city, MAX(region) AS region, MAX(country) AS country, COUNT(*) AS attempts
       FROM attempts WHERE quiz_id = ? AND latitude IS NOT NULL AND longitude IS NOT NULL
       GROUP BY ROUND(latitude, 1), ROUND(longitude, 1) ORDER BY attempts DESC LIMIT 200`,
    ).bind(quizId),
  ])

  const aggregates = answers.results as AnswerAggregate[]
  const perQuestion = (questions.results as QuestionRow[]).map((q) => {
    const rows = aggregates.filter((r) => r.questionId === q.id)
    const answered = rows.reduce((s, r) => s + r.count, 0)
    const correct = rows.reduce((s, r) => s + r.correct, 0)
    return {
      id: q.id,
      position: q.position,
      prompt: q.prompt,
      concept: q.concept,
      correctIndex: q.correct_index,
      answered,
      correct,
      accuracy: answered ? (correct / answered) * 100 : null,
      avgTimeMs: answered ? rows.reduce((s, r) => s + r.avgTimeMs * r.count, 0) / answered : null,
      options: parseOptions(q).map((text, i) => ({ text, count: rows.find((r) => r.selectedIndex === i)?.count ?? 0 })),
    }
  })

  return {
    summary: summary.results[0],
    scoreDistribution: scoreDistribution.results,
    perQuestion,
    perConcept: perConcept.results,
    perDay: perDay.results,
    byCountry: byCountry.results,
    locations: locations.results,
  }
}
