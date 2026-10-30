// usage: node record.mjs specs/<name>.mjs <outdir>   (site must be served on http://127.0.0.1:4173)
// Records the real tool (1920x1080, he-IL) with captions/ring/cursor, then writes rec.webm + cards + music into <outdir>.
import { createRequire } from 'node:module'
import fs from 'node:fs'
import { execSync } from 'node:child_process'
import { installOverlay, caption, unring } from './overlay.mjs'
import { titleCard, endCard } from './cards.mjs'
const { chromium } = createRequire(import.meta.url)('playwright')
const [specPath, out] = process.argv.slice(2)
const spec = (await import(new URL(specPath, 'file://' + process.cwd() + '/'))).default
fs.mkdirSync(out, { recursive: true })
// BASE=http://ugabuga.co.il HOSTMAP='MAP ugabuga.co.il 127.0.0.1' (preview on :80) makes links shown on screen read ugabuga.co.il instead of 127.0.0.1
const URL_BASE = process.env.BASE || 'http://127.0.0.1:4173'

const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--lang=he-IL', ...(process.env.HOSTMAP ? ['--host-resolver-rules=' + process.env.HOSTMAP, '--unsafely-treat-insecure-origin-as-secure=' + process.env.BASE] : [])] })
const t0 = Date.now()
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, locale: 'he-IL', timezoneId: 'Asia/Jerusalem', recordVideo: { dir: out + '/raw', size: { width: 1920, height: 1080 } } })
if (spec.setup) await spec.setup(ctx) // optional: route mocks for tools that need a backend
const page = await ctx.newPage()
const openPage = async path => { // goto + bigger page (readable at 1080p) + overlay; also used by specs that navigate
  await page.goto(URL_BASE + path, { waitUntil: 'networkidle' })
  await page.addStyleTag({ content: `html{scroll-behavior:auto!important}#root{zoom:${spec.zoom || 1.5}}` })
  await installOverlay(page)
}
await openPage(spec.path)
await page.mouse.move(960, 540)
await page.waitForTimeout(600)
const trim = (Date.now() - t0) / 1000 - 0.3 // everything before this is page loading
const marks = [] // chapter start times (seconds into the recording, after trim)
const h = { page, goto: openPage, mark: () => marks.push((Date.now() - t0) / 1000 - trim), caption, unring }
await spec.steps(page, h)
await page.waitForTimeout(800)
const total = (Date.now() - t0) / 1000 - trim
await page.screenshot({ path: out + '/shot.png' })
await ctx.close(); await browser.close()
const raw = fs.readdirSync(out + '/raw')[0]
fs.renameSync(out + '/raw/' + raw, out + '/rec.webm'); fs.rmdirSync(out + '/raw')
fs.writeFileSync(out + '/meta.json', JSON.stringify({ trim, total, marks }))

// cards
const b2 = await chromium.launch(); const p2 = await b2.newPage({ viewport: { width: 1920, height: 1080 } })
await p2.setContent(titleCard(spec.card)); await p2.evaluate(() => document.fonts.ready); await p2.screenshot({ path: out + '/title.png' })
await p2.setContent(endCard({ url: spec.fullUrl, line: spec.endLine, where: spec.endWhere })); await p2.evaluate(() => document.fonts.ready); await p2.waitForTimeout(300); await p2.screenshot({ path: out + '/end.png' })
await b2.close()
console.log(JSON.stringify({ trim, total, marks }))
