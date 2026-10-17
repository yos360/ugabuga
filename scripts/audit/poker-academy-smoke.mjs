import { chromium } from 'playwright'

const base = process.env.BASE_URL || 'http://127.0.0.1:5199'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const errors = []

for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
  const page = await browser.newPage({ viewportSize: viewport })
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`${base}/online-games/poker-academy`)
  await page.getByRole('button', { name: /שחקו עכשיו/ }).click()
  await page.locator('.pa-game').waitFor()
  await page.getByRole('button', { name: /מי מנצח/ }).click()
  await page.getByRole('button', { name: 'יד א׳' }).click()
  await page.getByRole('status').getByText('נכון!', { exact: false }).waitFor()
  await page.getByRole('button', { name: 'מומחים' }).click()
  await page.getByRole('button', { name: /הסתברויות/ }).click()
  await page.getByText('35%').waitFor()
  await page.reload()
  await page.locator('.pa-game').waitFor()
  await page.locator('.arc-hud').getByText('1', { exact: true }).first().waitFor()
  if (viewport.width === 390) {
    const overflow = await page.locator('.pa-game').evaluate(element => element.scrollWidth > element.clientWidth + 1)
    if (overflow) throw new Error('ממשק האקדמיה חורג מרוחב מסך נייד')
  }
  await page.close()
}

await browser.close()
if (errors.length) throw new Error(`Browser errors: ${errors.join('\n')}`)
console.log('Poker Academy mobile and desktop smoke checks passed')
