export const SUS_ITEMS = 10

export type SusGrade = 'excellent' | 'good' | 'ok' | 'poor' | 'awful'

export const SUS_GRADES: { grade: SusGrade; min: number }[] = [
  { grade: 'excellent', min: 85 },
  { grade: 'good', min: 73 },
  { grade: 'ok', min: 52 },
  { grade: 'poor', min: 39 },
  { grade: 'awful', min: 0 },
]

export const susScore = (answers: number[]) =>
  answers.reduce((sum, value, i) => sum + (i % 2 === 0 ? value - 1 : 5 - value), 0) * 2.5

export const susGrade = (score: number): SusGrade => SUS_GRADES.find((g) => score >= g.min)!.grade

export const isValidSusAnswers = (v: unknown): v is number[] =>
  Array.isArray(v) && v.length === SUS_ITEMS && v.every((n) => Number.isInteger(n) && n >= 1 && n <= 5)
