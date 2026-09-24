import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { createServer } from 'node:http'
import { resolve, dirname, extname } from 'node:path'
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'

// React portals (fixed bottom bars, toasts, dialogs) render as direct children of
// <body>, outside #root. A snapshot would freeze them into the static HTML, and
// on hydration React creates its own copy — leaving a dead duplicate on screen.
// Strip everything outside #root that isn't a script/style before serializing.
const stripPortals = page => page.evaluate(() => {
  for (const el of [...document.body.children]) {
    if (el.id === 'root' || ['SCRIPT', 'NOSCRIPT', 'STYLE', 'LINK', 'TEMPLATE'].includes(el.tagName)) continue
    el.remove()
  }
})


const require = createRequire(import.meta.url)
const playwright = process.env.PRERENDER_PLAYWRIGHT || 'playwright'
const { chromium } = require(playwright)
if (process.platform !== 'win32') {
  try { await access(chromium.executablePath()) }
  catch { execFileSync(process.execPath, [resolve(dirname(require.resolve('playwright/package.json')), 'cli.js'), 'install', 'chromium'], { stdio: 'inherit' }) }
}
const dist = resolve('dist')
const shell = await readFile(resolve(dist, 'index.html'), 'utf8')
const mime = { '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2' }
// Always serve the original shell for page requests while snapshots are built.
const server = createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  if (!extname(pathname)) { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(shell); return }
  const file = resolve(dist, '.' + pathname)
  if (!file.startsWith(dist + '/') && !file.startsWith(dist + '\\')) { res.writeHead(403); res.end(); return }
  try { res.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream'); res.end(await readFile(file)) }
  catch { res.writeHead(404); res.end() }
})
await new Promise(done => server.listen(0, '127.0.0.1', done))
const origin = `http://127.0.0.1:${server.address().port}`
const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) })
const snapshots = []
try {
  // Prerendered snapshots come from the curated static list, not the full
  // (Supabase-augmented) sitemap.xml — see scripts/generate-sitemap.mjs. Games
  // are 100+ and change independently of a deploy, so they're discovered via
  // the sitemap and rendered client-side instead of being snapshotted here.
  const xml = await readFile('public/sitemap-static.xml', 'utf8')
  const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname)
  const context = await browser.newContext()
  await context.addInitScript(() => { window.__PRERENDER__ = true })
  // Never record analytics/activity or depend on third-party availability at build time.
  // Supabase is allowed so individual game pages can load their data at build time
  // (see the game-page pass below); everything else third-party is still blocked.
  const SUPABASE_ORIGIN = 'https://judhoitufvlqxjhjgnsm.supabase.co'
  await context.route('**/*', route => { const o = new URL(route.request().url()).origin; return o === origin || o === SUPABASE_ORIGIN ? route.continue() : route.abort() })
  let next = 0
  await Promise.all(Array.from({ length: 3 }, async () => {
    const page = await context.newPage()
    while (next < paths.length) {
      const path = paths[next++]
      await page.goto(origin + path, { waitUntil: 'networkidle' })
      await page.locator('main h1').waitFor()
      const result = await page.evaluate(() => {
        const canonical = [...document.querySelectorAll('link[rel="canonical"]')]
        const descriptions = [...document.querySelectorAll('meta[name="description"]')]
        const robots = document.querySelector('meta[name="robots"]')?.content || ''
        return { title: document.title, canonical: canonical.map(x => x.href), descriptions: descriptions.length, h1: document.querySelectorAll('h1').length, robots }
      })
      if (result.canonical.length !== 1 || result.descriptions !== 1 || result.h1 !== 1 || result.robots.includes('noindex')) throw new Error(`Invalid SEO snapshot ${path}: ${JSON.stringify(result)}`)
      if (result.canonical[0] !== `https://ugabuga.co.il${path}`) throw new Error(`Wrong canonical on ${path}: ${result.canonical[0]}`)
      // Preserve relative assets, never serialize localhost URLs from DOM properties.
      // Vite injects <link rel="modulepreload"> tags with absolute URLs of this
      // temporary build server (http://127.0.0.1:PORT/...). Make them site-relative,
      // otherwise every visitor's browser tries to load files from its own localhost.
      await stripPortals(page)
      const html = (await page.content()).replaceAll(origin + '/', '/')
      snapshots.push({ path, html, title: result.title })
      if (snapshots.length % 25 === 0) console.log(`Pre-rendered ${snapshots.length}/${paths.length}`)
    }
    await page.close()
  }))
  const titles = new Set()
  for (const row of snapshots) {
    if (titles.has(row.title)) throw new Error(`Duplicate page title: ${row.title}`)
    titles.add(row.title)
    const destination = resolve(dist, row.path === '/' ? 'index.html' : row.path.slice(1) + '.html')
    await mkdir(dirname(destination), { recursive: true })
    await writeFile(destination, row.html)
  }

  // ---- Individual game pages (best effort) ----
  // Without a snapshot, a shared game link shows the *homepage* title/OG image in
  // WhatsApp/Facebook previews, because those bots read the static shell and never
  // run React. So we snapshot every /games/{slug} from the generated sitemap.xml.
  // This pass must NEVER fail the build: Supabase might be slow or a game might be
  // mid-edit, so each page is try/catch'd and simply skipped (it then keeps working
  // client-side exactly as before).
  try {
    const fullXml = await readFile('public/sitemap.xml', 'utf8')
    const staticSet = new Set(paths)
    const gamePaths = [...fullXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname).filter(p => p.startsWith('/games/') && !staticSet.has(p))
    let gi = 0, ok = 0, skipped = 0
    await Promise.all(Array.from({ length: 3 }, async () => {
      const page = await context.newPage()
      while (gi < gamePaths.length) {
        const path = gamePaths[gi++]
        try {
          await page.goto(origin + path, { waitUntil: 'networkidle', timeout: 30000 })
          await page.locator('main h1').waitFor({ timeout: 15000 })
          const result = await page.evaluate(() => ({
            title: document.title,
            canonical: [...document.querySelectorAll('link[rel="canonical"]')].map(x => x.href),
            descriptions: document.querySelectorAll('meta[name="description"]').length,
            h1: document.querySelectorAll('h1').length,
            robots: document.querySelector('meta[name="robots"]')?.content || '',
          }))
          const valid = result.canonical.length === 1 && result.canonical[0] === `https://ugabuga.co.il${path}` && result.descriptions === 1 && result.h1 === 1 && !result.robots.includes('noindex')
          if (!valid || titles.has(result.title)) { skipped++; console.warn(`Skipping game snapshot ${path}: ${JSON.stringify(result)}`); continue }
          titles.add(result.title)
          await stripPortals(page)
          const html = (await page.content()).replaceAll(origin + '/', '/')
          const destination = resolve(dist, path.slice(1) + '.html')
          await mkdir(dirname(destination), { recursive: true })
          await writeFile(destination, html)
          ok++
        } catch (err) {
          skipped++
          console.warn(`Skipping game snapshot ${path}: ${err.message}`)
        }
      }
      await page.close()
    }))
    console.log(`Game pages pre-rendered: ${ok} ok, ${skipped} skipped (of ${gamePaths.length}).`)
  } catch (err) {
    console.warn(`Game page pre-render pass failed, continuing without it: ${err.message}`)
  }
  // Versioned platform icons with opaque backgrounds and mask-safe artwork.
  const iconPage = await context.newPage()
  const favicon = await readFile('public/favicon.svg', 'utf8')
  await mkdir(resolve(dist, 'icons'), {recursive:true})
  await writeFile(resolve(dist, 'icons/ugabuga-v2.svg'), favicon)
  for (const size of [32,180,192,512]) {
    await iconPage.setViewportSize({width:size,height:size})
    await iconPage.setContent(`<html><head><style>html,body{margin:0;width:100%;height:100%;background:#fff3d7}svg{display:block;width:100%;height:100%}</style></head><body>${favicon}</body></html>`)
    await iconPage.screenshot({path:resolve(dist, `icons/ugabuga-v2-${size}.png`)})
  }
  await writeFile(resolve(dist,'icons/ugabuga-v2-maskable-512.png'),await readFile(resolve(dist,'icons/ugabuga-v2-512.png')))
  await writeFile(resolve(dist,'apple-touch-icon.png'),await readFile(resolve(dist,'icons/ugabuga-v2-180.png')))
  console.log(`SEO checks passed: ${snapshots.length} unique pages with initial HTML content.`)
} finally {
  await browser.close()
  await new Promise(done => server.close(done))
}
