import { execFileSync } from 'node:child_process'
import { webcrypto as crypto } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import readline from 'node:readline'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const args = process.argv.slice(2)
const flag = (name) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : undefined
}
const remote = args.includes('--remote')
const email = (flag('email') ?? '').trim().toLowerCase()
const name = (flag('name') ?? 'Professor(a)').trim()

if (!/^[^@\s']+@[^@\s']+\.[^@\s']+$/.test(email)) {
  console.error('Uso: pnpm professor --email <email> [--name "Nome"] [--remote]')
  process.exit(1)
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    rl._writeToOutput = (s) => (s.includes(question) ? process.stdout.write(s) : null)
    rl.question(question, (answer) => {
      rl.close()
      process.stdout.write('\n')
      resolve(answer)
    })
  })
}

let password = process.env.OWNER_PASSWORD
if (!password) {
  password = await askHidden('Senha (mín. 8 caracteres): ')
  const again = await askHidden('Confirme a senha: ')
  if (password !== again) {
    console.error('As senhas não conferem.')
    process.exit(1)
  }
}
if (password.length < 8) {
  console.error('A senha deve ter pelo menos 8 caracteres.')
  process.exit(1)
}

const toHex = (buf) => Buffer.from(buf).toString('hex')
const salt = crypto.getRandomValues(new Uint8Array(16))
const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100_000 }, key, 256)

const q = (s) => `'${s.replace(/'/g, "''")}'`
const sql = [
  `INSERT INTO owners (name, email, password_hash, salt) VALUES (${q(name)}, ${q(email)}, ${q(toHex(bits))}, ${q(toHex(salt))})`,
  `ON CONFLICT(email) DO UPDATE SET name = excluded.name, password_hash = excluded.password_hash, salt = excluded.salt;`,
  `UPDATE quizzes SET owner_id = (SELECT id FROM owners WHERE email = ${q(email)}) WHERE owner_id IS NULL;`,
].join(' ')

const target = remote ? ['--remote'] : ['--local', '--persist-to', path.join(root, '.wrangler/state')]
execFileSync('pnpm', ['exec', 'wrangler', 'd1', 'execute', 'logic-master-db', ...target, '--command', sql], {
  cwd: path.join(root, 'api'),
  stdio: ['ignore', 'ignore', 'inherit'],
})
console.log(`✔ Professor ${email} salvo no banco ${remote ? 'REMOTO (produção)' : 'local'}.`)
