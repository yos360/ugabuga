#!/usr/bin/env node
// Page requests, handled by the daily requests task (docs/page-requests-automation.md).
//
//   node scripts/requests-inbox.mjs open <dir>          one-time key pair in <dir>; pushes requests-inbox-<stamp>
//   node scripts/requests-inbox.mjs read <dir> <sha>    waits for .github/workflows/requests-inbox.yml, decrypts
//                                                       the open requests to <dir>/inbox.json, prints only a count
//   node scripts/requests-inbox.mjs migration <spec>    writes supabase/migrations/<stamp>_page_requests_auto.sql
//                                                       from {done:[{id,title,path}], planned:[id], declined:[id]}
//
// The inbox never holds visitors' emails (the owner emails them from the owner report). The private key and
// inbox.json stay in <dir> (a scratch folder outside the repo) and are never committed: request texts must
// not reach this public repository or its logs.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const REPO = 'yos360/ugabuga'
const ROOT = resolve(new URL('..', import.meta.url).pathname)
const run = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: 'utf8', ...opts })
const stamp = () => new Date().toISOString().replace(/\D/g, '').slice(0, 14)

function open(dir) {
  mkdirSync(dir, { recursive: true })
  const priv = join(dir, 'inbox.key'), pub = join(dir, 'inbox.pub')
  run('openssl', ['genpkey', '-algorithm', 'RSA', '-pkeyopt', 'rsa_keygen_bits:3072', '-out', priv])
  run('openssl', ['pkey', '-in', priv, '-pubout', '-out', pub])
  const branch = `requests-inbox-${stamp()}`, wt = join(dir, 'worktree')
  rmSync(wt, { recursive: true, force: true })
  run('git', ['-C', ROOT, 'fetch', '-q', 'origin', 'main'])
  run('git', ['-C', ROOT, 'worktree', 'add', '-q', '-b', branch, wt, 'origin/main'])
  try {
    writeFileSync(join(wt, '.requests-inbox.pub'), readFileSync(pub))
    run('git', ['-C', wt, 'add', '.requests-inbox.pub'])
    run('git', ['-C', wt, 'commit', '-q', '-m', 'Requests inbox: one-time public key (branch deletes itself)'])
    run('git', ['-C', wt, 'push', '-q', '-u', 'origin', branch])
    const sha = run('git', ['-C', wt, 'rev-parse', 'HEAD']).trim()
    console.log(`${branch} ${sha}`)
  } finally {
    run('git', ['-C', ROOT, 'worktree', 'remove', '--force', wt])
    run('git', ['-C', ROOT, 'branch', '-D', branch])
  }
}

async function read(dir, sha) {
  let check
  for (let i = 0; i < 60; i++) { // up to ~10 minutes
    const runs = JSON.parse(run('gh', ['api', `repos/${REPO}/commits/${sha}/check-runs`])).check_runs
    check = runs.find(r => r.name === 'inbox')
    if (check?.status === 'completed') break
    await new Promise(r => setTimeout(r, 10000))
  }
  if (check?.status !== 'completed') throw new Error('requests-inbox workflow did not finish')
  if (check.conclusion !== 'success') throw new Error(`requests-inbox workflow: ${check.conclusion}`)
  const notes = JSON.parse(run('gh', ['api', '--paginate', `repos/${REPO}/check-runs/${check.id}/annotations`]))
  const get = t => notes.find(n => n.title === t)?.message
  const parts = Number(get('inbox-parts'))
  const data = Array.from({ length: parts }, (_, i) => get(`inbox-data-${i + 1}`)).join('')
  const key = run('openssl', ['pkeyutl', '-decrypt', '-inkey', join(dir, 'inbox.key'), '-pkeyopt', 'rsa_padding_mode:oaep', '-pkeyopt', 'rsa_oaep_md:sha256'],
    { input: Buffer.from(get('inbox-key'), 'base64'), encoding: 'utf8' })
  const json = run('openssl', ['enc', '-d', '-aes-256-cbc', '-pbkdf2', '-pass', `pass:${key}`], { input: Buffer.from(data, 'base64') })
  const inbox = JSON.parse(json)
  writeFileSync(join(dir, 'inbox.json'), JSON.stringify(inbox, null, 2))
  console.log(`${inbox.length} open requests -> ${join(dir, 'inbox.json')}`)
}

const sqlText = s => `'${String(s).replace(/'/g, "''")}'`
const id = x => { if (!Number.isInteger(x) || x < 1) throw new Error(`bad id ${x}`); return x }

// Every statement only moves a request forward, so the file is safe to run again.
export function migrationSql({ done = [], planned = [], declined = [] }) {
  const out = ['-- Page requests handled by the daily requests task (scripts/requests-inbox.mjs). Safe to run again.']
  for (const d of done) {
    const title = String(d.title || '').trim()
    if (!title || title.length > 120) throw new Error(`bad title for ${d.id}`)
    if (!/^\/[a-z0-9/_-]{0,119}$/.test(d.path || '')) throw new Error(`bad path for ${d.id}: ${d.path}`)
    out.push(`update public.page_requests set status = 'done', public_title = ${sqlText(title)}, result_path = ${sqlText(d.path)}, done_at = coalesce(done_at, now()) where id = ${id(d.id)} and status in ('new', 'planned');`)
  }
  if (planned.length) out.push(`update public.page_requests set status = 'planned' where id in (${planned.map(id).join(', ')}) and status = 'new';`)
  if (declined.length) out.push(`update public.page_requests set status = 'declined' where id in (${declined.map(id).join(', ')}) and status in ('new', 'planned');`)
  return out.join('\n') + '\n'
}

function migration(specPath) {
  const sql = migrationSql(JSON.parse(readFileSync(specPath, 'utf8')))
  const file = join(ROOT, 'supabase/migrations', `${stamp()}_page_requests_auto.sql`)
  if (existsSync(file)) throw new Error(`${file} exists`)
  writeFileSync(file, sql)
  console.log(file)
}

const [cmd, a, b] = process.argv.slice(2)
if (cmd === 'open' && a) open(resolve(a))
else if (cmd === 'read' && a && b) await read(resolve(a), b)
else if (cmd === 'migration' && a) migration(resolve(a))
else if (cmd) { console.error('usage: open <dir> | read <dir> <sha> | migration <spec.json>'); process.exit(1) }
