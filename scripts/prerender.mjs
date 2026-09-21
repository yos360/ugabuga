import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { createServer } from 'node:http'
import { resolve, dirname, extname } from 'node:path'
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'

const require = createRequire(import.meta.url)
const playwright = process.env.PRERENDER_PLAYWRIGHT || 'playwright'
const { chromium } = require(playwright)
if (process.platform !== 'win32') {
  try { await access(chromium.executablePath()) }
  catch { execFileSync(process.execPath, [require.resolve('playwright/cli'), 'install', 'chromium'], { stdio: 'inherit' }) }
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
  const xml = await readFile('public/sitemap.xml', 'utf8')
  const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname)
  const context = await browser.newContext()
  await context.addInitScript(() => { window.__PRERENDER__ = true })
  // Never record analytics/activity or depend on third-party availability at build time.
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort())
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
      const html = await page.content()
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
  // Rasterize the existing brand favicon for iOS; no new illustration is needed.
  const iconPage = await context.newPage({ viewport: { width: 180, height: 180 } })
  const favicon = await readFile('public/favicon.svg', 'utf8')
  await iconPage.setContent(`<html><head><style>html,body{margin:0;width:180px;height:180px;background:#fffaf0}svg{width:156px;height:156px;margin:12px}</style></head><body>${favicon}</body></html>`)
  await iconPage.screenshot({ path: resolve(dist, 'apple-touch-icon.png') })
  console.log(`SEO checks passed: ${snapshots.length} unique pages with initial HTML content.`)
} finally {
  await browser.close()
  await new Promise(done => server.close(done))
}
