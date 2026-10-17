import assert from 'node:assert/strict'
import { chromium } from 'playwright'
const base = process.env.AUDIT_BASE || 'http://127.0.0.1:5199', browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined })
for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
  const context = await browser.newContext({ viewport }), page = await context.newPage(), errors = []; page.setDefaultTimeout(9000); page.on('pageerror', error => errors.push(error.message))
  await page.goto(`${base}/online-games/gin-rummy`); await page.getByRole('button', { name: /שחקו עכשיו/ }).click(); await page.locator('.gr-table').waitFor(); await page.getByRole('button', { name: 'מומחה', exact: true }).click()
  if (!await page.locator('.gr-stock:enabled').count()) await page.waitForFunction(() => document.querySelector('.gr-stock:not(:disabled)'))
  await page.locator('.gr-stock').click(); assert.equal(await page.locator('.gr-hand .gr-card').count(), 11); await page.locator('.gr-hand .gr-card').first().click(); await page.getByRole('button', { name: 'השליכו', exact: true }).click(); await page.waitForTimeout(850)
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('buga-gin-rummy-session-v1'))); assert.equal(saved.difficulty, 'hard'); assert.equal([...saved.game.hands.flat(), ...saved.game.stock, ...saved.game.discard].length, 52)
  await page.reload(); if (await page.getByRole('button', { name: /שחקו עכשיו/ }).count()) await page.getByRole('button', { name: /שחקו עכשיו/ }).click(); await page.locator('.gr-table').waitFor(); assert.equal(await page.locator('.gr-hand .gr-card').count(), 10); assert.deepEqual(errors, []); await context.close()
}
await browser.close(); console.log('Gin Rummy mobile and desktop smoke checks passed')
