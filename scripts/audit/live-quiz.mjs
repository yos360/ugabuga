import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { offlineSiteResponse } from './offline-site.mjs'

await mkdir('out/live-quiz', { recursive: true })
const browser = await chromium.launch({ headless: true })
const context = await browser.newContext()
await context.route('**/*', route => {
  const url = route.request().url()
  if (new URL(url).origin === 'https://audit.local') return route.fulfill(offlineSiteResponse(url))
  return route.abort()
})
const page = await context.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))

await page.setViewportSize({ width: 1440, height: 1000 })
await page.goto('https://audit.local/live')
await page.locator('.live-demo').click()
assert.equal(await page.locator('.live-question-edit').count(), 3)
assert.equal(await page.locator('.live-answer.edit').count(), 12)
await page.screenshot({ path: 'out/live-quiz/builder-desktop.png', fullPage: true })

await page.locator('.live-tabbar button').nth(1).click()
const code = page.locator('.live-join-card input')
await code.fill('ab-12c3')
assert.equal(await code.inputValue(), 'AB12C3')
await page.locator('.live-join-card').screenshot({ path: 'out/live-quiz/join.png' })

for (const width of [390, 320]) {
  await page.setViewportSize({ width, height: 900 })
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  await page.screenshot({ path: `out/live-quiz/mobile-${width}.png`, fullPage: true })
}

assert.deepEqual(errors, [])
await writeFile('out/live-quiz/verified.json', JSON.stringify({ questions: 3, answers: 12, widths: [1440, 390, 320], errors }, null, 2))
await browser.close()
console.log('Buga Live builder and join checks passed')
