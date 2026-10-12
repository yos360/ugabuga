// Saves a real image of every printable page (public/previews/<slug>.jpg) and lists them in
// src/data/printPreviews.json ({ path: alt }). Google Images can't see the site's printables —
// they are drawn in the browser (SVG / canvas) — so each page also shows this image (see
// PrintPreviewFigure in Layout) and uses it as its share image (og:image).
//
// Run after `npx vite build`, against a preview server:
//   npx vite preview --port 4399 &  node scripts/print-previews.mjs [--only=/printables/mazes,...] [--limit=N]
import { chromium } from 'playwright'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const ORIGIN = process.env.PREVIEW_ORIGIN || 'http://localhost:4399'
const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split('=')))
const root = new URL('../', import.meta.url)
export const previewSlug = path => path.slice(1).replace(/\//g, '--')

const xml = await readFile(new URL('public/sitemap-static.xml', root), 'utf8')
let paths = [...xml.matchAll(/<loc>https:\/\/ugabuga\.co\.il([^<]*)<\/loc>/g)].map(m => m[1])
  .filter(p => /^\/(printables|coloring|worksheets)|^\/holidays\/[^/]+\/(coloring|worksheets)$|^\/math\/grade-[^/]+\/[^/]+$|^\/math\/tests\//.test(p))
if (args.only) paths = args.only.split(',')
if (args.limit) paths = paths.slice(0, Number(args.limit))

const manifestUrl = new URL('src/data/printPreviews.json', root)
const manifest = args.only ? JSON.parse(await readFile(manifestUrl, 'utf8').catch(() => '{}')) : {}
await mkdir(new URL('public/previews/', root), { recursive: true })

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' })
let ok = 0, next = 0
async function worker() {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 2 })
  await page.route(/supabase|googletagmanager|google-analytics/, r => r.abort())
  while (next < paths.length) {
  const path = paths[next++]
  try {
    await page.goto(ORIGIN + path, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(600)
    // The first printable sheet on the page: a portrait-ish SVG/canvas/image in <main>, ≥160px wide.
    // Pages that draw their sheets only inside the print preview get it opened first.
    const findSheet = () => page.evaluate(() => {
      const els = [...document.querySelectorAll('.buga-a4, main svg, main canvas, main img')]
      for (const el of els) {
        if (el.closest('header, nav, footer, [aria-hidden="true"]')) continue
        const r = el.getBoundingClientRect()
        if (r.width < 160 || r.height < r.width * 0.9 || r.height > r.width * 2) continue
        document.querySelectorAll('[data-preview-pick]').forEach(x => x.removeAttribute('data-preview-pick'))
        el.setAttribute('data-preview-pick', '')
        return { h1: document.querySelector('h1')?.textContent?.trim() || '' }
      }
      return null
    })
    let box = await findSheet()
    if (!box) {
      const btn = page.locator('main button').filter({ hasText: /הדפס|תצוגה/ }).first()
      if (await btn.count()) { await btn.click().catch(() => {}); await page.waitForTimeout(1200); box = await findSheet() }
    }
    if (!box) { console.log('skip (no sheet)', path); continue }
    await page.waitForTimeout(150)
    const file = `public/previews/${previewSlug(path)}.jpg`
    await page.locator('[data-preview-pick]').first().screenshot({ path: new URL(file, root).pathname, type: 'jpeg', quality: 72, animations: 'disabled' })
    const name = box.h1.replace(/^[^\p{L}\p{N}]+/u, '').trim()
    manifest[path] = /להדפסה/.test(name) ? name : `${name} — דף להדפסה`
    ok++
  } catch (e) { console.log('error', path, e.message.slice(0, 80)) }
  }
  await page.close()
}
await Promise.all(Array.from({ length: Number(args.workers || 4) }, worker))
await browser.close()
await writeFile(manifestUrl, JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 0) + '\n')
console.log(`${ok}/${paths.length} previews`)
