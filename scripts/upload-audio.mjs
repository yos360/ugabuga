// Uploads recorded clips that are not in the R2 bucket yet, and records them in
// scripts/audio/r2-uploaded.txt. Run after adding any public/audio/**/*.mp3, before pushing:
//   node scripts/upload-audio.mjs
// Uses wrangler's login on this computer (npx wrangler login, once). The production site plays
// clips only from audio.ugabuga.co.il (src/utils/audioUrl.js), so a clip that is not uploaded is
// silent on the live site — tests/audio-r2.test.mjs fails until it is listed here.
import { readdirSync, readFileSync, appendFileSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import { execFileSync } from 'node:child_process'

const repo = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const root = join(repo, 'public', 'audio')
const listFile = join(repo, 'scripts', 'audio', 'r2-uploaded.txt')
const done = new Set(existsSync(listFile) ? readFileSync(listFile, 'utf8').split('\n').filter(Boolean) : [])
const walk = d => readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)])
const todo = walk(root).filter(f => f.endsWith('.mp3')).map(f => ({ f, key: 'audio/' + relative(root, f).replaceAll('\\', '/') })).filter(x => !done.has(x.key))
console.log(`${todo.length} clips to upload`)
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
for (const { f, key } of todo) {
  execFileSync(npx, ['--yes', 'wrangler@4', 'r2', 'object', 'put', `ugabuga-audio/${key}`, '--file', f, '--content-type', 'audio/mpeg', '--remote'], { stdio: 'inherit', shell: process.platform === 'win32' })
  appendFileSync(listFile, key + '\n')
}
console.log('done')
