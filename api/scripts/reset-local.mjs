import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const run = (cmd, args, env = {}) =>
  execFileSync(cmd, args, { cwd: root, stdio: ['ignore', 'ignore', 'inherit'], env: { ...process.env, ...env } })

rmSync(path.join(root, '.wrangler/state'), { recursive: true, force: true })
run('pnpm', ['--filter', 'api', 'db:migrate:local'])
run('node', ['api/scripts/content.mjs'])
console.log('✔ Banco local recriado com os quizzes de content/quizzes.')

const varsFile = path.join(root, 'api/.dev.vars')
const vars = existsSync(varsFile)
  ? Object.fromEntries(
      readFileSync(varsFile, 'utf8')
        .split('\n')
        .filter((l) => /^\s*[A-Z_]+=/.test(l))
        .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
    )
  : {}

if (vars.DEV_OWNER_EMAIL && vars.DEV_OWNER_PASSWORD) {
  run('node', ['api/scripts/owner.mjs', '--email', vars.DEV_OWNER_EMAIL, '--name', 'Professor(a) Teste'], {
    OWNER_PASSWORD: vars.DEV_OWNER_PASSWORD,
  })
  console.log(`  Login de teste: ${vars.DEV_OWNER_EMAIL} (senha em api/.dev.vars)`)
} else {
  console.log('  Defina DEV_OWNER_EMAIL e DEV_OWNER_PASSWORD em api/.dev.vars para criar a conta de teste.')
}
