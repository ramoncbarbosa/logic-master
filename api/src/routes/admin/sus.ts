import { Hono } from 'hono'
import { toCsv } from '../../lib/csv'
import { t } from '../../lib/i18n'
import { susGrade } from '../../lib/sus'
import { susRows, susSummary } from '../../services/sus'
import type { AppEnv } from '../../types'

export const adminSusRoutes = new Hono<AppEnv>()

const scopeOf = (ownerId: number, quiz?: string) => ({ ownerId, quizId: quiz ? Number(quiz) || undefined : undefined })

adminSusRoutes.get('/', async (c) => c.json(await susSummary(c.env.DB, scopeOf(c.get('ownerId'), c.req.query('quiz')))))

adminSusRoutes.get('/export.csv', async (c) => {
  const rows = await susRows(c.env.DB, scopeOf(c.get('ownerId'), c.req.query('quiz')))
  const data = rows.map(({ score, ...rest }) => ({
    ...rest,
    score: score.toFixed(1),
    grade: t(c, `grade.${susGrade(score)}`),
  }))
  return c.body(toCsv(t(c, 'susCsvHeader').split(','), data), 200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="logic-master-${t(c, 'susCsvFile')}.csv"`,
  })
})
