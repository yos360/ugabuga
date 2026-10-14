// Compare the hydrated content used by the prerenderer, with stable date/randomness.
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import assert from 'node:assert/strict'
const paths = ['/', '/en', '/en/hebrew-alphabet', '/en/jewish-holidays', '/holidays', '/holidays/hanukkah', '/holidays/purim', '/holidays/tu-bishvat', '/letters', '/letters/cursive', '/printables/coloring', '/printables/coloring/animals', '/games', '/game-of-the-day', '/logic-puzzles', '/tools', '/math', '/learn/multiplication-table', '/questions/family-dinner', '/treasure-hunt/home']
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH, headless: true })
const results = []
try {
  for (const path of paths) {
    const pair = []
    for (const [kind, base] of [['before', 'http://127.0.0.1:5208'], ['after', 'http://127.0.0.1:5203']]) {
      const context = await browser.newContext()
      await context.addInitScript(() => {
        window.__PRERENDER__ = true
        const RealDate = Date
        window.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['2026-10-14T12:00:00Z'])) } static now() { return new RealDate('2026-10-14T12:00:00Z').getTime() } }
        let seed = 123456
        Math.random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
      })
      await context.route('**/*', r => r.request().url().startsWith(base) && ['GET', 'HEAD'].includes(r.request().method()) ? r.continue() : r.abort())
      const page = await context.newPage()
      await page.goto(base + path, { waitUntil: 'networkidle' })
      await page.locator('main h1').waitFor()
      await page.waitForTimeout(500)
      pair.push(await page.evaluate(() => ({ title: document.title, h1: document.querySelector('main h1').textContent, text: document.querySelector('main').innerText })))
      mkdirSync(`out/audit/prerender-${kind}`, { recursive: true })
      writeFileSync(`out/audit/prerender-${kind}/${path.replaceAll('/', '_') || 'home'}.html`, await page.content())
      await context.close()
    }
    const pass = JSON.stringify(pair[0]) === JSON.stringify(pair[1])
    results.push({ path, pass, before: pair[0], after: pair[1] })
    console.log(path, pass)
  }
  writeFileSync('out/audit/prerender-comparison.json', JSON.stringify(results, null, 2))
  assert.ok(results.every(r => r.pass), 'prerendered headings, title and text must be unchanged')
} finally { await browser.close() }
