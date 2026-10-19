import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { BRAIN_PAGES } from '../../src/data/brainPages.js'
import { BRAIN_GAMES } from '../../src/arcade/brainRegistry.js'
const base = process.env.AUDIT_BASE || 'http://127.0.0.1:5199'
const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) })
try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    const context = await browser.newContext({ viewport })
    await context.addInitScript(() => { window.__PRERENDER__ = true })
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort())
    const page = await context.newPage(), errors = [], titles = new Set()
    page.on('pageerror', e => errors.push(e.message))
    for (const content of Object.values(BRAIN_PAGES)) {
      await page.goto(base + content.path)
      await page.getByRole('heading', { level: 1, name: `🧠 ${content.title}` }).waitFor()
      assert.equal(await page.locator('h1').count(), 1)
      assert.equal(await page.locator('link[rel="canonical"]').count(), 1)
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://ugabuga.co.il' + content.path)
      assert.equal(await page.locator('meta[name="description"]').count(), 1)
      const title = await page.title(); assert.ok(!titles.has(title)); titles.add(title)
      const faq = await page.locator('script[type="application/ld+json"]').evaluateAll(nodes => nodes.map(n => JSON.parse(n.textContent)).flat().find(s => s['@type'] === 'FAQPage'))
      assert.equal(faq.mainEntity.length, content.faq.length)
      for (const { q, a } of content.faq) { await page.getByText(q, { exact: true }).waitFor(); await page.getByText(a, { exact: true }).waitFor() }
      for (const slug of content.games) assert.ok(await page.locator(`a[href="/online-games/${slug}"]`).count())
      assert.equal(await page.locator('.brain-game').count(), 0, 'guides must not duplicate playable games')
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), content.path)
    }
    for (const game of BRAIN_GAMES) {
      await page.goto(`${base}/online-games/${game.slug}`)
      await page.getByRole('heading', { level: 1 }).waitFor()
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), `https://ugabuga.co.il/online-games/${game.slug}`)
      assert.ok(await page.locator('a[href="/brain-games"]').count())
    }
    assert.deepEqual(errors, [])
    console.log(`${viewport.width}: six editorial guides and seven canonical game pages passed`)
    await context.close()
  }
} finally { await browser.close() }
