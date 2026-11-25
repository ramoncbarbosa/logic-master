import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const contentDir = path.join(root, 'content/quizzes')
const remote = process.argv.includes('--remote')
const target = remote ? ['--remote'] : ['--local', '--persist-to', path.join(root, '.wrangler/state')]

const wrangler = (extra) =>
  execFileSync('pnpm', ['exec', 'wrangler', 'd1', 'execute', 'logic-master-db', ...target, '--yes', ...extra], {
    cwd: path.join(root, 'api'),
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  })

const q = (v) => (v === undefined || v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`)
const bySlug = (slug) => `FROM quizzes WHERE slug = ${q(slug)}`

function quizSql(d) {
  if (d.format !== 'logic-master-quiz') throw new Error(`Formato desconhecido em ${d.slug ?? '?'}`)
  const out = [
    `INSERT INTO quizzes (owner_id, slug, title, description, audience, objective, cover_image, video_url, license, authors, attribution, changes, published)
VALUES ((SELECT id FROM owners ORDER BY id LIMIT 1), ${[d.slug, d.title, d.description ?? '', d.audience ?? '', d.objective ?? '', d.coverImage, d.videoUrl, d.license ?? 'CC BY-NC-SA 4.0', JSON.stringify(d.authors ?? []), JSON.stringify(d.attribution ?? []), d.changes ?? ''].map(q).join(', ')}, 1);`,
  ]
  for (const [locale, t] of Object.entries(d.translations ?? {}))
    out.push(
      `INSERT INTO quiz_translations (quiz_id, locale, title, description, audience, objective, video_url)
SELECT id, ${[locale, t.title ?? '', t.description ?? '', t.audience ?? '', t.objective ?? '', t.videoUrl].map(q).join(', ')} ${bySlug(d.slug)};`,
    )
  d.questions.forEach((x, i) => {
    const position = i + 1
    out.push(
      `INSERT INTO questions (quiz_id, position, prompt, concept, image_url, image_alt, code, options, correct_index, explanation)
SELECT id, ${position}, ${[x.prompt, x.concept ?? '', x.imageUrl, x.imageAlt, x.code, JSON.stringify(x.options)].map(q).join(', ')}, ${Number(x.correctIndex)}, ${q(x.explanation ?? '')} ${bySlug(d.slug)};`,
    )
    for (const [locale, t] of Object.entries(x.translations ?? {}))
      out.push(
        `INSERT INTO question_translations (question_id, locale, prompt, concept, options, explanation, image_url, image_alt, code)
SELECT qq.id, ${[locale, t.prompt, t.concept ?? '', JSON.stringify(t.options), t.explanation ?? '', t.imageUrl, t.imageAlt, t.code].map(q).join(', ')}
FROM questions qq JOIN quizzes z ON z.id = qq.quiz_id WHERE z.slug = ${q(d.slug)} AND qq.position = ${position};`,
      )
  })
  return out.join('\n')
}

const files = readdirSync(contentDir).filter((f) => f.endsWith('.json')).sort()
const quizzes = files.map((f) => JSON.parse(readFileSync(path.join(contentDir, f), 'utf8')))
const existing = new Set(JSON.parse(wrangler(['--json', '--command', 'SELECT slug FROM quizzes']))[0].results.map((r) => r.slug))
const missing = quizzes.filter((d) => !existing.has(d.slug))

if (!missing.length) {
  console.log(`✔ Nenhum quiz novo: os ${quizzes.length} de content/quizzes já estão no banco ${remote ? 'remoto' : 'local'}.`)
  process.exit(0)
}

const dir = mkdtempSync(path.join(tmpdir(), 'lm-content-'))
const file = path.join(dir, 'content.sql')
writeFileSync(file, missing.map(quizSql).join('\n') + '\n')
try {
  wrangler(['--file', file])
} finally {
  rmSync(dir, { recursive: true, force: true })
}
console.log(`✔ ${missing.length} quiz(zes) carregado(s) no banco ${remote ? 'remoto' : 'local'}: ${missing.map((d) => d.slug).join(', ')}`)
