// Makes one unseen karaoke video: node make.mjs <slug> [textIndex]
// Output in ugabuga/.reel-upload/unseen/<slug>-<i>/: video.mp4, cover.jpg, meta.json (title, description, playlist).
// node make.mjs --queue rebuilds queue.json: every passage, one grade after another, keeping what was uploaded.
import { execFileSync } from 'node:child_process'
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const KIT = path.dirname(HERE)
const REPO = 'C:/Users/pc/Documents/ugabuga'
const VOICE = 'C:/Users/pc/Documents/ugabuga-voice'
const WORK = path.join(KIT, 'work', 'unseen-current')
const UPLOAD = `${REPO}/.reel-upload/unseen`
const env = {
  ...process.env,
  CHROME_PATH: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  FFMPEG_PATH: 'C:\\Program Files\\Photopia Director\\ffmpeg.exe',
  FFPROBE_PATH: 'C:\\Program Files\\Photopia Director\\ffprobe.exe',
}
const ORDER = ['g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'g9', 'mod-a', 'mod-c', 'mod-e', 'mod-g']

async function allTests() {
  const out = []
  const dir = `${REPO}/src/data/unseen/`
  for (const f of readdirSync(dir).filter(f => f.startsWith('tests-en'))) out.push(...(await import('file:///' + dir + f)).TESTS)
  return out
}

if (process.argv[2] === '--queue') {
  const tests = await allTests()
  const file = path.join(HERE, 'queue.json')
  const old = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : []
  const seen = new Map(old.map(q => [`${q.slug}#${q.xi}`, q]))
  const byLevel = ORDER.map(l => tests.filter(t => t.level === l).sort((a, b) => a.slug.localeCompare(b.slug)).flatMap(t => t.texts.map((_, xi) => ({ slug: t.slug, xi, level: t.level, title: t.title }))))
  const queue = []
  for (let round = 0; byLevel.some(l => round < l.length); round++) for (const l of byLevel) if (l[round]) queue.push({ ...l[round], ...(seen.get(`${l[round].slug}#${l[round].xi}`) || {}) })
  writeFileSync(file, JSON.stringify(queue, null, 1))
  console.log('queue', queue.length, queue.slice(0, 6).map(q => q.slug).join(' '))
  process.exit(0)
}

const slug = process.argv[2]
const xi = +(process.argv[3] || 0)
if (!slug) throw new Error('usage: node make.mjs <slug> [textIndex]')

// 1. the word times
const runtime = path.join(VOICE, 'runtime', readdirSync(path.join(VOICE, 'runtime'))[0], 'node.exe')
copyFileSync(path.join(HERE, 'ctc-unseen.mjs'), path.join(VOICE, 'ctc-unseen.mjs'))
console.log(execFileSync(runtime, ['ctc-unseen.mjs', slug, String(xi)], { cwd: VOICE, env: { ...env, HF_HOME: VOICE + '/hf' }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim())
const json = readFileSync(`${VOICE}/work/align/${slug}#${xi}.json`, 'utf8')
const D = JSON.parse(json)

// 2. the work folder
mkdirSync(path.join(WORK, 'out'), { recursive: true })
for (const d of ['engine', 'fonts', 'img']) if (!existsSync(path.join(WORK, d))) cpSync(path.join(KIT, 'template', d), path.join(WORK, d), { recursive: true })
for (const f of ['score.js', 'film.js', 'song.js', 'index.html', 'package.json']) copyFileSync(path.join(HERE, f), path.join(WORK, f))
writeFileSync(path.join(WORK, 'timing.json'), json)
writeFileSync(path.join(WORK, 'timing.js'), `globalThis.TIMING=${json};`)

// 3. sound, picture
const node = process.execPath
const run = (...a) => execFileSync(node, a, { cwd: WORK, env, stdio: 'inherit' })
run('song.js')
run('engine/render.js', 'video')
run('engine/render.js', 'mux', 'unseen')

// 4. what gets uploaded
const name = `${slug}-${xi}`
const up = `${UPLOAD}/${name}`
mkdirSync(up, { recursive: true })
const ff = env.FFMPEG_PATH
execFileSync(ff, ['-y', '-v', 'error', '-ss', '2.8', '-i', 'out/unseen.mp4', '-frames:v', '1', '-q:v', '2', `${up}/cover.jpg`], { cwd: WORK })
execFileSync(ff, ['-y', '-v', 'error', '-i', 'out/unseen.mp4', '-c:v', 'libx264', '-crf', '22', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', `${up}/video.mp4`], { cwd: WORK })
const score = JSON.parse(execFileSync(node, ['-e', "const s=require('./score');console.log(JSON.stringify({q:s.questions.length?s.questions[0].t0:0,end:s.endStart}))"], { cwd: WORK, encoding: 'utf8' }))
const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
const site = `https://ugabuga.co.il/unseen/english/${slug}`
const title = `${D.title} | אנסין באנגלית ${D.levelName.startsWith('כיתה') ? 'ל' + D.levelName : 'ל־' + D.levelName + ' לבגרות'} עם קריינית`.slice(0, 100)
const description = [
  `אנסין באנגלית ל${D.levelName}: קוראים יחד עם קריינית, מילה אחר מילה, עם תרגום למילים הקשות ושאלות הבנה בסוף.`,
  D.summary || '',
  '',
  `📝 המבחן המלא, התשובות וההקלטה באתר: ${site}`,
  '📚 כל האנסינים: https://ugabuga.co.il/unseen/english',
  '',
  '🔔 כל יום עולה קטע אנסין חדש, כל יום לכיתה אחרת, מכיתה ג׳ ועד הבגרות. מורים והורים יכולים לסמוך על זה ולמצוא כאן קטע לכל רמה.',
  '💬 מחפשים נושא מסוים? כתבו לנו בתגובות ונכין קטע בנושא.',
  '',
  '0:00 פתיחה',
  `0:03 הקטע באנגלית`,
  ...(score.q ? [`${mmss(score.q)} שאלות הבנה`] : []),
  `${mmss(score.end)} המבחן המלא באתר`,
  '',
  '#אנסין #אנגלית #Unseen',
].join('\n')
writeFileSync(`${up}/meta.json`, JSON.stringify({ slug, xi, title, description, playlist: `אנסין באנגלית ${D.levelName.startsWith('כיתה') ? 'ל' + D.levelName : '– ' + D.levelName}` }, null, 1))
console.log('ready', up, title)
