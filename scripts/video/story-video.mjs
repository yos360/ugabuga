// Turns a recorded bedtime story into videos: YouTube (1920×1080, whole story) and Instagram Reels
// (1080×1920, in parts of up to ~85 s… or the whole story with --reels-whole).
// One slide per recorded clip (title, each paragraph, goodnight), Noa's narration on top.
//   node scripts/video/story-video.mjs <slug> [--out=DIR] [--only=youtube|reels]
// Needs: ffmpeg, Playwright Chromium, Heebo font files (FONT_DIR, woff2 from @fontsource/heebo).
import { chromium } from 'playwright'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { BEDTIME_STORIES, renderStory } from '../../src/data/bedtimeStories.js'

const [slug, ...rest] = process.argv.slice(2)
const args = Object.fromEntries(rest.map(a => a.replace(/^--/, '').split('=')))
const OUT = args.out || `out/videos/${slug}`
const FONT_DIR = process.env.FONT_DIR || 'node_modules/@fontsource/heebo/files'
const root = new URL('../../', import.meta.url).pathname
const story = BEDTIME_STORIES.find(s => s.slug === slug)
if (!story) { console.error('no such story', slug); process.exit(1) }
const r = renderStory(story)
const clips = [0, ...r.body.map((_, i) => i + 1), r.body.length + 1].map(k => `${root}public/audio/stories/${slug}/${k}.mp3`)
const dur = f => Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.toString())
const run = (cmd, a) => { const p = spawnSync(cmd, a, { stdio: ['ignore', 'ignore', 'pipe'] }); if (p.status) throw new Error(cmd + ': ' + p.stderr.toString().slice(-400)) }
const LEAD = 0.6, TAIL = 0.9 // silence before/after each clip, so slides breathe

const font = async w => `@font-face{font-family:Heebo;font-weight:${w};src:url(data:font/woff2;base64,${(await readFile(`${FONT_DIR}/heebo-hebrew-${w}-normal.woff2`)).toString('base64')})}`
const FONTS = (await Promise.all([400, 700, 900].map(font))).join('')
const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')

// Twinkling-free night sky: fixed star positions so every slide matches.
const STARS = Array.from({ length: 70 }, (_, i) => [(i * 37.7) % 100, (i * 61.3) % 100, 1 + (i % 3)])
function slideHtml({ w, h, kind, text, emoji, n, total, part, cont }) {
  const tall = h > w, base = tall ? 1080 : 1080
  const fs = kind === 'para' ? (tall ? Math.max(46, Math.min(62, 15000 / text.length)) : Math.max(40, Math.min(54, 13000 / text.length))) : 0
  return `<!doctype html><html dir="rtl"><head><meta charset="utf-8"><style>${FONTS}
  *{box-sizing:border-box;margin:0}body{width:${w}px;height:${h}px;overflow:hidden;font-family:Heebo,sans-serif;color:#fff;
  background:radial-gradient(ellipse at 50% 120%,#3b2a6e 0%,#1b1b4b 45%,#0b1030 100%)}
  .star{position:absolute;border-radius:50%;background:#fff;opacity:.7}
  .moon{position:absolute;top:${tall ? 120 : 70}px;left:${tall ? 80 : 110}px;width:${tall ? 150 : 120}px;height:${tall ? 150 : 120}px;border-radius:50%;box-shadow:-${tall ? 34 : 28}px ${tall ? 22 : 18}px 0 0 #ffe9a8;transform:rotate(-20deg)}
  .brand{position:absolute;top:${tall ? 90 : 46}px;right:${tall ? 70 : 70}px;font-weight:700;font-size:${tall ? 40 : 32}px;opacity:.92}
  .brand small{display:block;font-weight:400;font-size:${tall ? 30 : 24}px;opacity:.8}
  .wrap{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:${tall ? '260px 70px 220px' : '120px 170px 110px'};text-align:center;gap:${tall ? 50 : 34}px}
  .emoji{font-family:'Noto Color Emoji';font-size:${kind === 'title' ? (tall ? 300 : 230) : (tall ? 200 : 130)}px;line-height:1;filter:drop-shadow(0 10px 30px rgba(0,0,0,.35))}
  .title{font-weight:900;font-size:${tall ? 104 : 96}px;line-height:1.15;text-shadow:0 4px 20px rgba(0,0,0,.4)}
  .sub{font-size:${tall ? 44 : 38}px;opacity:.85}
  .card{background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.22);border-radius:36px;padding:${tall ? '50px 46px' : '44px 60px'};font-size:${fs}px;line-height:1.55;font-weight:400;max-width:${tall ? 960 : 1500}px;text-shadow:0 2px 10px rgba(0,0,0,.35)}
  .dots{position:absolute;bottom:${tall ? 150 : 50}px;left:0;right:0;display:flex;justify-content:center;gap:12px}
  .dots i{width:14px;height:14px;border-radius:50%;background:rgba(255,255,255,.3)}.dots i.on{background:#ffe9a8}
  .url{font-weight:900;font-size:${tall ? 70 : 64}px;color:#ffe9a8}
  .moral{font-size:${tall ? 50 : 44}px;line-height:1.5;max-width:${tall ? 940 : 1400}px}
  </style></head><body>
  ${STARS.map(([x, y, s]) => `<i class="star" style="left:${x}%;top:${(y * 0.7)}%;width:${s * 2}px;height:${s * 2}px"></i>`).join('')}
  <div class="moon"></div>
  <div class="brand">🎂 עוגה בוגה<small>סיפורים לפני השינה</small></div>
  ${part ? `<div style="position:absolute;top:${tall ? 230 : 140}px;right:${tall ? 70 : 70}px;padding:6px 18px;border-radius:99px;background:#ffe9a8;color:#1b1b4b;font-weight:900;font-size:${tall ? 34 : 28}px">${part}</div>` : ''}
  ${cont ? `<div style="position:absolute;bottom:${tall ? 230 : 110}px;left:0;right:0;text-align:center;font-weight:900;font-size:${tall ? 46 : 36}px;color:#ffe9a8">⬅ המשך בחלק ${cont}</div>` : ''}
  <div class="wrap">${
    kind === 'title' ? `<div class="emoji">${emoji}</div><div class="title">${esc(text)}</div><div class="sub">סיפור לפני השינה · לגילאי ${esc(story.age)}</div>`
    : kind === 'para' ? `${emoji ? `<div class="emoji">${emoji}</div>` : ''}<div class="card">${esc(text)}</div>`
    : `<div class="emoji">🌙</div><div class="title">לילה טוב, חלומות פז</div><div class="moral">💛 ${esc(r.moral)}</div><div class="sub">עוד סיפורים בחינם, עם קריינות:</div><div class="url">ugabuga.co.il</div><div class="sub">חפשו בגוגל: עוגה בוגה</div>`
  }</div>
  ${kind === 'para' ? `<div class="dots">${Array.from({ length: total }, (_, i) => `<i class="${i === n ? 'on' : ''}"></i>`).join('')}</div>` : ''}
  </body></html>`
}

const slides = clips.map((file, k) => ({
  file, d: dur(file),
  kind: k === 0 ? 'title' : k === clips.length - 1 ? 'end' : 'para',
  text: k === 0 ? r.title : k === clips.length - 1 ? '' : r.body[k - 1],
  emoji: k === 0 ? story.emoji : k === clips.length - 1 ? '' : (story.pics?.[k - 1] || ''),
  n: k - 1, total: r.body.length,
}))

async function render(fmt, w, h, extras = []) {
  const dir = `${OUT}/${fmt}`
  await mkdir(dir, { recursive: true })
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' })
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  const segs = []
  for (const [i, s] of slides.entries()) {
    await page.setContent(slideHtml({ w, h, ...s, ...(extras[i] || {}) }), { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    const png = `${dir}/s${String(i).padStart(2, '0')}.png`
    await page.screenshot({ path: png })
    // One segment: the still with a soft fade in/out, the clip padded with silence.
    const total = LEAD + s.d + TAIL, mp4 = png.replace('.png', '.mp4')
    run('ffmpeg', ['-nostdin', '-y', '-loop', '1', '-framerate', '30', '-i', png, '-i', s.file,
      '-filter_complex', `[0:v]fade=t=in:st=0:d=0.45,fade=t=out:st=${(total - 0.45).toFixed(2)}:d=0.45,format=yuv420p[v];[1:a]adelay=${LEAD * 1000}|${LEAD * 1000},apad=whole_dur=${total.toFixed(3)},aresample=44100[a]`,
      '-map', '[v]', '-map', '[a]', '-t', total.toFixed(3), '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-tune', 'stillimage', '-r', '30', '-c:a', 'aac', '-b:a', '128k', '-ac', '2', mp4])
    segs.push({ mp4, total })
  }
  await browser.close()
  return segs
}

function join(segs, out) {
  const list = out.replace(/\.mp4$/, '.txt')
  spawnSync('sh', ['-c', `printf "%s\\n" ${segs.map(s => `"file '${s.mp4.split('/').pop()}'"`).join(' ')} > "${list}"`])
  run('ffmpeg', ['-nostdin', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', out])
}

const meta = { slug, title: r.title, seconds: 0, files: [] }
if (args.only !== 'reels') {
  const segs = await render('youtube', 1920, 1080)
  const out = `${OUT}/youtube/${slug}-youtube.mp4`; join(segs, out)
  meta.seconds = Math.round(segs.reduce((a, s) => a + s.total, 0)); meta.files.push(out)
}
if (args.only !== 'youtube') {
  // Reels: parts of at most ~90 s, decided from the clip lengths before rendering, so each slide
  // can say which part it is and the last slide of a part can point to the next one.
  const max = Number(args.max || 90), len = s => LEAD + s.d + TAIL
  const groups = []; let cur = []
  slides.forEach((s, i) => { if (cur.length && cur.reduce((a, j) => a + len(slides[j]), 0) + len(s) > max) { groups.push(cur); cur = [] } cur.push(i) })
  groups.push(cur)
  const extras = slides.map((_, i) => {
    const g = groups.findIndex(x => x.includes(i)), last = groups[g].at(-1) === i
    return groups.length > 1 ? { part: `חלק ${g + 1} מתוך ${groups.length}`, cont: last && g < groups.length - 1 ? g + 2 : 0 } : {}
  })
  const segs = await render('reels', 1080, 1920, extras)
  groups.forEach((g, i) => { const out = `${OUT}/reels/${slug}-reels-${i + 1}of${groups.length}.mp4`; join(g.map(j => segs[j]), out); meta.files.push(out) })
}
// YouTube cover (1280×720) and upload texts.
{
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' })
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } })
  await page.setContent(slideHtml({ w: 1280, h: 720, ...slides[0] }).replace('class="title"', 'class="title" style="font-size:96px"'), { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await mkdir(`${OUT}/youtube`, { recursive: true })
  await page.screenshot({ path: `${OUT}/youtube/${slug}-cover.png` })
  await browser.close()
  const mins = Math.round(meta.seconds / 60) || Math.round(slides.reduce((a, s) => a + LEAD + s.d + TAIL, 0) / 60)
  meta.youtube = {
    title: `${r.title} 🌙 סיפור לפני השינה לילדים (${story.age}) | עוגה בוגה`,
    description: `${r.title} — סיפור לפני השינה לילדים בגילאי ${story.age}, בקריינות רגועה. ${r.summary}\n\n💛 המסר: ${r.moral}\n\nעוד סיפורים לפני השינה בחינם, עם קריינות ועם השם של הילד בסיפור: https://ugabuga.co.il/stories\nמשחקים, דפי צביעה ודפי עבודה לילדים — בחינם: https://ugabuga.co.il\n\n#סיפורלפניהשינה #סיפוריםלילדים #עוגהבוגה`,
    tags: ['סיפור לפני השינה', 'סיפורים לילדים', 'סיפור לילדים', 'סיפור לפני השינה לילדים', 'סיפורים בעברית', 'עוגה בוגה', story.theme],
    minutes: mins,
  }
  meta.instagram = { caption: `${story.emoji} ${r.title} — סיפור לפני השינה (${story.age}) 🌙\n${r.summary}\n\nהסיפור המלא, ועוד עשרות סיפורים עם קריינות — בחינם בעוגה בוגה (הקישור בביו)\n#סיפורלפניהשינה #סיפוריםלילדים #הורות #גן #עוגהבוגה` }
}
await writeFile(`${OUT}/meta.json`, JSON.stringify(meta, null, 1))
console.log(JSON.stringify(meta, null, 1))
