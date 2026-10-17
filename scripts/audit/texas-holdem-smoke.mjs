import { chromium } from 'playwright'

const base = process.env.BASE_URL || 'http://127.0.0.1:5199', browser = await chromium.launch({ channel: 'chrome', headless: true }), errors = []
for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  const context = await browser.newContext({ viewport }), page = await context.newPage(); page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) }); page.on('pageerror', error => errors.push(error.message))
  await page.goto(`${base}/online-games/texas-holdem`); await page.getByRole('button', { name: /שחקו עכשיו/ }).click(); await page.locator('.th-game').waitFor()
  if (viewport.width === 390) await page.getByRole('button', { name: '5 יריבים' }).click()
  if (await page.locator('.th-card.is-back').count() < 1) throw new Error('קלפי היריבים אינם מוסתרים')
  let reloaded = false
  for (let turn = 0; turn < 30 && !await page.getByRole('button', { name: 'היד הבאה' }).isVisible(); turn++) {
    const check = page.getByRole('button', { name: 'בדיקה', exact: true }), call = page.getByRole('button', { name: /^השוואה/ })
    if (await check.isVisible()) await check.click(); else if (await call.isVisible()) await call.click(); else throw new Error('לא נמצאה פעולה חוקית שממשיכה את היד')
    if (!reloaded) { await page.reload(); await page.locator('.th-game').waitFor(); reloaded = true }
  }
  await page.getByRole('button', { name: 'היד הבאה' }).waitFor(); if (await page.locator('.th-card.is-back').count()) throw new Error('קלפי היריבים לא נחשפו בסיום')
  if (await page.locator('.th-board .th-card:not(.is-empty)').count() !== 5) throw new Error('לא נפתח לוח מלא של חמישה קלפים')
  if (viewport.width === 390 && await page.locator('.th-game').evaluate(element => element.scrollWidth > element.clientWidth + 1)) throw new Error('שולחן ההולדם חורג מרוחב מסך נייד')
  await context.close()
}
await browser.close(); if (errors.length) throw new Error(errors.join('\n')); console.log('Texas Holdem mobile and desktop smoke checks passed')
