import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { puzzle, cleanSolution } from '../../src/arcade/logic/buga24.js'

const base = process.env.AUDIT_BASE || 'http://127.0.0.1:5199'
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined })

for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage(), errors = []
  page.setDefaultTimeout(6000)
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`${base}/online-games/buga-24`)
  await page.getByRole('button', { name: /שחקו עכשיו/ }).click()
  await page.locator('.b24-board').waitFor()
  await page.getByRole('button', { name: 'רמז', exact: true }).click()
  await page.getByRole('button', { name: '🎓 מצב לימודי', exact: true }).click()
  assert.equal(await page.locator('.b24-learning').count(), 1)
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('buga-24-session-v1')))
  const answer = cleanSolution(puzzle(saved.seed, saved.level).solution)
  await page.locator('#b24-expression').fill(answer)
  await page.getByRole('button', { name: 'בדיקת התרגיל', exact: true }).click()
  await page.getByText('🎉 בדיוק 24!', { exact: true }).waitFor()
  const solved = await page.evaluate(() => JSON.parse(localStorage.getItem('buga-arcade-buga-24')).solved)
  await page.reload()
  if (await page.getByRole('button', { name: /שחקו עכשיו/ }).count()) await page.getByRole('button', { name: /שחקו עכשיו/ }).click()
  await page.getByText('🎉 בדיוק 24!', { exact: true }).waitFor()
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('buga-arcade-buga-24')).solved), solved, 'refresh must not award a second win')
  assert.deepEqual(errors, [])
  await context.close()
}

await browser.close()
console.log('Buga 24 mobile and desktop smoke checks passed')
