// Turns a recorded bedtime story into animated videos: YouTube (1920×1080, whole story) and
// Instagram Reels (1080×1920, parts of up to ~90 s). One animated scene per recorded clip
// (title, each paragraph, goodnight) from scripts/video/scenes/<slug>.mjs, Noa's narration,
// and subtitles that light up word by word, timed to the pauses in the recording.
//   node scripts/video/story-video.mjs <slug> [--out=DIR] [--only=youtube|reels] [--max=90] [--workers=4] [--segs=0,1]
// Needs: ffmpeg, Playwright Chromium, Heebo font files (FONT_DIR, woff2 from @fontsource/heebo).
import { chromium } from 'playwright'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { spawn, spawnSync } from 'node:child_process'
import { BEDTIME_STORIES, renderStory } from '../../src/data/bedtimeStories.js'
import { stageHtml } from './stage.mjs'
import { subtitleLines } from './subtitles.mjs'

const [slug, ...rest] = process.argv.slice(2)
const args = Object.fromEntries(rest.map(a => a.replace(/^--/, '').split('=')))
const OUT = args.out || `out/videos/${slug}`
const FONT_DIR = process.env.FONT_DIR || 'node_modules/@fontsource/heebo/files'
const FPS = Number(args.fps || 25), WORKERS = Number(args.workers || 4)
const root = new URL('../../', import.meta.url).pathname
const story = BEDTIME_STORIES.find(s => s.slug === slug)
if (!story) { console.error('no such story', slug); process.exit(1) }
const scenes = (await import(`./scenes/${slug}.mjs`)).default
const r = renderStory(story)
const clips = [0, ...r.body.map((_, i) => i + 1), r.body.length + 1].map(k => `${root}public/audio/stories/${slug}/${k}.mp3`)
if (scenes.length !== clips.length) { console.error(`scenes: ${scenes.length}, clips: ${clips.length}`); process.exit(1) }
const dur = f => Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.toString())
const run = (cmd, a) => { const p = spawnSync(cmd, a, { stdio: ['ignore', 'ignore', 'pipe'] }); if (p.status) throw new Error(cmd + ': ' + p.stderr.toString().slice(-400)) }
const LEAD = 0.6, TAIL = 0.9 // silence before/after each clip, so scenes breathe

const font = async w => `@font-face{font-family:Heebo;font-weight:${w};src:url(data:font/woff2;base64,${(await readFile(`${FONT_DIR}/heebo-hebrew-${w}-normal.woff2`)).toString('base64')})}`
const FONTS = (await Promise.all([400, 700, 900].map(font))).join('')
const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')

const slides = clips.map((file, k) => {
  const d = dur(file), last = k === clips.length - 1
  const text = k === 0 || last ? '' : r.body[k - 1]
  return { file, d, total: LEAD + d + TAIL, scene: scenes[k], kind: k === 0 ? 'title' : last ? 'end' : 'para',
    subs: text ? subtitleLines(text, file, d).map(s => ({ ...s, from: s.from + LEAD, to: s.to + LEAD })) : [] }
})
const END = `<div style="font-family:'Noto Color Emoji';font-size:120px">🌙</div><h1>לילה טוב, חלומות פז</h1><div class="m">💛 ${esc(r.moral)}</div><div class="s">עוד סיפורים בחינם, עם קריינות:</div><div class="u">ugabuga.co.il</div><div class="s">חפשו בגוגל: עוגה בוגה</div>`
const html = (s, w, h, extra = {}) => stageHtml({ w, h, fonts: FONTS, scene: s.scene, subs: s.subs, total: s.total,
  title: s.kind === 'title' ? r.title : '', sub: s.kind === 'title' ? `סיפור לפני השינה · לגילאי ${story.age}` : '',
  end: s.kind === 'end' ? END : '', ...extra })

// Renders one segment: poses the stage frame by frame and pipes JPEGs into ffmpeg with the clip.
async function segment(page, s, w, h, extra, mp4) {
  await page.setContent(html(s, w, h, extra), { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  const ff = spawn('ffmpeg', ['-nostdin', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', s.file,
    '-filter_complex', `[1:a]adelay=${LEAD * 1000}|${LEAD * 1000},apad=whole_dur=${s.total.toFixed(3)},aresample=44100[a]`,
    '-map', '0:v', '-map', '[a]', '-t', s.total.toFixed(3), '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '128k', '-ac', '2', mp4], { stdio: ['pipe', 'ignore', 'pipe'] })
  let err = ''; ff.stderr.on('data', d => { err = (err + d).slice(-600) })
  const done = new Promise((ok, bad) => ff.on('close', c => c ? bad(new Error('ffmpeg: ' + err)) : ok()))
  const n = Math.ceil(s.total * FPS)
  for (let f = 0; f < n; f++) {
    await page.evaluate(t => window.frame(t), f / FPS)
    const buf = await page.screenshot({ type: 'jpeg', quality: 90 })
    if (!ff.stdin.write(buf)) await new Promise(ok => ff.stdin.once('drain', ok))
  }
  ff.stdin.end()
  await done
}

async function render(fmt, w, h, extras = []) {
  const dir = `${OUT}/${fmt}`
  await mkdir(dir, { recursive: true })
  const only = args.segs ? args.segs.split(',').map(Number) : null
  const segs = slides.map((s, i) => ({ mp4: `${dir}/s${String(i).padStart(2, '0')}.mp4`, total: s.total }))
  const queue = slides.map((_, i) => i).filter(i => !only || only.includes(i))
  // One browser per worker: pages sharing a browser get throttled and render blank frames.
  await Promise.all(Array.from({ length: WORKERS }, async () => {
    const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' })
    const page = await browser.newPage({ viewport: { width: w, height: h } })
    page.on('pageerror', e => console.error('page error:', e.message))
    for (let i; (i = queue.shift()) !== undefined;) {
      const t0 = Date.now()
      await segment(page, slides[i], w, h, extras[i] || {}, segs[i].mp4)
      console.error(`${fmt} ${i + 1}/${slides.length} ${((Date.now() - t0) / 1000).toFixed(0)}s`)
    }
    await browser.close()
  }))
  return segs
}

function join(segs, out) {
  const list = out.replace(/\.mp4$/, '.txt')
  spawnSync('sh', ['-c', `printf "%s\\n" ${segs.map(s => `"file '${s.mp4.split('/').pop()}'"`).join(' ')} > "${list}"`])
  run('ffmpeg', ['-nostdin', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', out])
}

const meta = { slug, title: r.title, seconds: Math.round(slides.reduce((a, s) => a + s.total, 0)), files: [] }
if (args.only !== 'reels') {
  const segs = await render('youtube', 1920, 1080)
  if (!args.segs) { const out = `${OUT}/youtube/${slug}-youtube.mp4`; join(segs, out); meta.files.push(out) }
}
if (args.only !== 'youtube') {
  // Reels: parts of at most ~90 s, decided from the clip lengths before rendering, so each scene
  // can say which part it is and the last scene of a part can point to the next one.
  const max = Number(args.max || 90)
  const groups = []; let cur = []
  slides.forEach((s, i) => { if (cur.length && cur.reduce((a, j) => a + slides[j].total, 0) + s.total > max) { groups.push(cur); cur = [] } cur.push(i) })
  groups.push(cur)
  const extras = slides.map((_, i) => {
    const g = groups.findIndex(x => x.includes(i)), last = groups[g].at(-1) === i
    return groups.length > 1 ? { part: `חלק ${g + 1} מתוך ${groups.length}`, cont: last && g < groups.length - 1 ? g + 2 : 0 } : {}
  })
  const segs = await render('reels', 1080, 1920, extras)
  if (!args.segs) groups.forEach((g, i) => { const out = `${OUT}/reels/${slug}-reels-${i + 1}of${groups.length}.mp4`; join(g.map(j => segs[j]), out); meta.files.push(out) })
}
// YouTube cover (1280×720, a frame of the title scene) and upload texts.
{
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' })
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })
  await page.setContent(html(slides[0], 1920, 1080), { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(t => window.frame(t), slides[0].total * 0.7)
  await mkdir(`${OUT}/youtube`, { recursive: true })
  await page.screenshot({ path: `${OUT}/youtube/cover-full.png` })
  await browser.close()
  run('ffmpeg', ['-nostdin', '-y', '-i', `${OUT}/youtube/cover-full.png`, '-vf', 'scale=1280:720', `${OUT}/youtube/${slug}-cover.png`])
  meta.youtube = {
    title: `${r.title} 🌙 סיפור לפני השינה לילדים (${story.age}) | עוגה בוגה`,
    description: `${r.title} — סיפור לפני השינה לילדים בגילאי ${story.age}, בקריינות רגועה. ${r.summary}\n\n💛 המסר: ${r.moral}\n\nעוד סיפורים לפני השינה בחינם, עם קריינות ועם השם של הילד בסיפור: https://ugabuga.co.il/stories\nמשחקים, דפי צביעה ודפי עבודה לילדים — בחינם: https://ugabuga.co.il\n\n#סיפורלפניהשינה #סיפוריםלילדים #עוגהבוגה`,
    tags: ['סיפור לפני השינה', 'סיפורים לילדים', 'סיפור לילדים', 'סיפור לפני השינה לילדים', 'סיפורים בעברית', 'עוגה בוגה', story.theme],
    minutes: Math.round(meta.seconds / 60),
  }
  meta.instagram = { caption: `${story.emoji} ${r.title} — סיפור לפני השינה (${story.age}) 🌙\n${r.summary}\n\nהסיפור המלא, ועוד עשרות סיפורים עם קריינות — בחינם בעוגה בוגה (הקישור בביו)\n#סיפורלפניהשינה #סיפוריםלילדים #הורות #גן #עוגהבוגה` }
}
await writeFile(`${OUT}/meta.json`, JSON.stringify(meta, null, 1))
console.log(JSON.stringify(meta, null, 1))
