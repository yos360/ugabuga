import assert from 'node:assert/strict'
import { chromium } from 'playwright'

const base = process.env.AUDIT_BASE || 'http://127.0.0.1:5199'
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined })
for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
  const context = await browser.newContext({ viewport }), page = await context.newPage(), errors = []
  page.setDefaultTimeout(10000); page.on('pageerror', error => errors.push(error.message))
  await page.goto(`${base}/online-games/hearts`); await page.getByRole('button', { name: /שחקו עכשיו/ }).click(); await page.locator('.ht-table').waitFor()
  await page.getByRole('button', { name: 'מומחה', exact: true }).click()
  const cards = page.locator('.ht-hand .ht-card'); await cards.nth(0).click(); await cards.nth(1).click(); await cards.nth(2).click()
  await page.getByRole('button', { name: 'העבירו את הקלפים', exact: true }).click()
  await page.locator('.ht-human.is-turn .is-playable').first().waitFor(); await page.locator('.ht-human.is-turn .is-playable').first().click(); await page.waitForTimeout(600)
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('buga-hearts-session-v1')))
  assert.equal(saved.difficulty, 'hard'); assert.equal([...saved.game.hands.flat(), ...saved.game.taken.flat(), ...saved.game.trick.map(item => item.card)].length, 52)
  await page.reload(); if (await page.getByRole('button', { name: /שחקו עכשיו/ }).count()) await page.getByRole('button', { name: /שחקו עכשיו/ }).click(); await page.locator('.ht-table').waitFor()
  assert.equal(await page.locator('.ht-opponents section').count(), 3); assert.deepEqual(errors, [])
  await context.close()
}
await browser.close()
console.log('Hearts mobile and desktop smoke checks passed')
