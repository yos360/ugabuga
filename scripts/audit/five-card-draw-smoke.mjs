import { chromium } from 'playwright'

const base = process.env.BASE_URL || 'http://127.0.0.1:5199', browser = await chromium.launch({ channel: 'chrome', headless: true }), errors = []
for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  const context = await browser.newContext({ viewport }), page = await context.newPage()
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) }); page.on('pageerror', error => errors.push(error.message))
  await page.goto(`${base}/online-games/five-card-draw`); await page.getByRole('button', { name: /שחקו עכשיו/ }).click(); await page.locator('.fd-game').waitFor()
  if (await page.locator('.fd-card.is-back').count() !== 5) throw new Error('קלפי המחשב אינם מוסתרים בתחילת היד')
  await page.getByRole('button', { name: 'בדיקה', exact: true }).click()
  const cards = page.locator('[aria-label="היד שלכם"] .fd-card'); await cards.nth(0).click(); await cards.nth(1).click(); await cards.nth(2).click()
  await page.getByRole('button', { name: 'החלפת 3 קלפים' }).click(); await page.getByText('סבב ההימור האחרון', { exact: false }).waitFor()
  await page.reload(); await page.locator('.fd-game').waitFor(); await page.getByRole('button', { name: 'פתיחה' }).click(); await page.locator('.fd-result').waitFor()
  if (await page.locator('.fd-card.is-back').count()) throw new Error('קלפי המחשב נשארו מוסתרים בסיום')
  if (viewport.width === 390 && await page.locator('.fd-game').evaluate(element => element.scrollWidth > element.clientWidth + 1)) throw new Error('שולחן הפוקר חורג מרוחב מסך נייד')
  await context.close()
}
await browser.close(); if (errors.length) throw new Error(errors.join('\n')); console.log('Five Card Draw mobile and desktop smoke checks passed')
