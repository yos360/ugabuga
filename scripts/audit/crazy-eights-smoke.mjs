import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const base = process.env.AUDIT_BASE || 'http://127.0.0.1:5199'
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined })
for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
  const context = await browser.newContext({ viewport }), page = await context.newPage(), errors = []
  page.setDefaultTimeout(7000); page.on('pageerror', error => errors.push(error.message))
  await page.goto(`${base}/online-games/crazy-eights`)
  await page.getByRole('button', { name: /שחקו עכשיו/ }).click(); await page.locator('.ce-table').waitFor()
  await page.getByRole('button', { name: '3', exact: true }).click(); await page.getByRole('button', { name: 'מומחה', exact: true }).click()
  await page.locator('.ce-me.is-turn').waitFor()
  const playable = page.locator('.ce-hand .is-playable').first(); assert.ok(await playable.count(), 'human receives a legal move after AI turns')
  await playable.click()
  if (await page.locator('.ce-suit-picker').count()) await page.locator('.ce-suit-picker button').first().click()
  await page.waitForTimeout(900)
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('buga-crazy-eights-session-v1')))
  assert.equal(saved.opponents, 3); assert.equal(saved.difficulty, 'hard'); assert.equal(saved.game.hands.length, 4)
  assert.equal([...saved.game.hands.flat(), ...saved.game.stock, ...saved.game.discard].length, 52)
  await page.reload(); if (await page.getByRole('button', { name: /שחקו עכשיו/ }).count()) await page.getByRole('button', { name: /שחקו עכשיו/ }).click(); await page.locator('.ce-table').waitFor()
  assert.equal(await page.locator('.ce-opponents section').count(), 3)
  assert.deepEqual(errors, [])
  await context.close()
}
await browser.close()
console.log('Crazy Eights mobile and desktop smoke checks passed')
