import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const base = process.env.AUDIT_BASE || 'http://127.0.0.1:5199'
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined })
for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
  const context = await browser.newContext({ viewport }), page = await context.newPage(), errors = []
  page.setDefaultTimeout(6000); page.on('pageerror', error => errors.push(error.message))
  await page.goto(`${base}/online-games/freecell`)
  await page.getByRole('button', { name: /שחקו עכשיו/ }).click()
  await page.locator('.fc-field').waitFor()
  await page.locator('#fc-deal-number').fill('617')
  await page.getByRole('button', { name: 'פתחו חלוקה', exact: true }).click()
  assert.equal(await page.locator('.cd').count(), 52)
  const source = await page.locator('.cd').last().boundingBox(), target = await page.locator('.cd-slot').first().boundingBox()
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2)
  await page.mouse.down(); await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 5 }); await page.mouse.up()
  await page.getByText('מהלכים 1', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'ביטול מהלך', exact: true }).click()
  await page.getByText('מהלכים 0', { exact: true }).waitFor()
  await page.reload(); if (await page.getByRole('button', { name: /שחקו עכשיו/ }).count()) await page.getByRole('button', { name: /שחקו עכשיו/ }).click()
  assert.equal(await page.locator('#fc-deal-number').inputValue(), '617')
  assert.equal(await page.locator('.cd').count(), 52)
  assert.deepEqual(errors, [])
  await context.close()
}
await browser.close()
console.log('FreeCell mobile and desktop smoke checks passed')
