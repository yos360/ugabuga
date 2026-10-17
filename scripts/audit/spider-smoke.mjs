// Local UI regression: CHROME_PATH may point to an installed Chrome executable.
import { chromium } from 'playwright'
import { createServer } from 'vite'
import assert from 'node:assert/strict'
import { deck } from '../../src/arcade/logic/cards.js'

const server = await createServer({ server: { host: '127.0.0.1', port: 5181 } })
await server.listen()
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const errors = []; page.on('pageerror', error => errors.push(error.message))
  const open = async () => {
    await page.goto('http://127.0.0.1:5181/online-games/spider-solitaire')
    await page.locator('.arc-play-btn').click(); await page.locator('.spider-game .cd').first().waitFor()
  }
  const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('buga-spider-session-v1')))
  await open()
  assert.equal(await page.locator('.spider-game .cd').count(), 59)
  await page.getByRole('button', { name: 'בינוני · 2 צורות' }).click()
  assert.equal((await saved()).state.suits, 2)
  await page.locator('button.cd.is-back').last().click()
  assert.equal((await saved()).state.stock.length, 40)
  const afterDeal = (await saved()).state
  await open(); assert.deepEqual((await saved()).state, afterDeal)
  await page.getByRole('button', { name: 'ביטול מהלך', exact: true }).click()
  assert.equal((await saved()).state.stock.length, 50)
  await page.locator('button.cd.is-back').last().click()
  await page.getByRole('button', { name: 'קשה · 4 צורות' }).click()
  await page.locator('dialog.card-restart').waitFor(); await page.keyboard.press('Escape')
  assert.equal((await saved()).state.suits, 2)
  for (const viewport of [{ width: 320, height: 568 }, { width: 844, height: 390 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport); await page.waitForTimeout(300)
    assert.ok(await page.locator('.cd-table').evaluate(element => element.scrollWidth <= element.clientWidth + 1))
  }

  const run = deck([0], 8).slice(-13).map(card => ({ ...card, up: true }))
  const nearWin = { tab: [run.slice(1).reverse(), [run[0]], ...Array.from({ length: 8 }, () => [])], stock: [], done: 7, doneSuits: Array(7).fill(0), moves: 80, suits: 1 }
  await page.evaluate(state => localStorage.setItem('buga-spider-session-v1', JSON.stringify({ version: 1, state, history: [], reported: false })), nearWin)
  await page.setViewportSize({ width: 390, height: 844 }); await open(); await page.waitForTimeout(250)
  const source = page.getByRole('button', { name: 'A♠', exact: true }), target = page.getByRole('button', { name: '2♠', exact: true })
  const point = box => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 })
  const from = point(await source.boundingBox()), to = point(await target.boundingBox())
  const touch = await page.context().newCDPSession(page)
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [from] })
  await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [to] })
  await touch.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] })
  assert.equal((await saved()).state.done, 7)
  await page.waitForTimeout(250)
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [from] })
  await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [to] })
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await page.getByRole('alertdialog').waitFor()
  assert.equal((await saved()).state.done, 8)
  await page.screenshot({ path: '../spider-professional-mobile.png' })
  await page.keyboard.press('Escape'); await page.locator('.site-chat-launcher').waitFor({ state: 'visible' })
  assert.deepEqual(errors, [])
  console.log('PASS Spider modes, save/reload, undo, dialog, responsive layout, touch cancel/drag, victory')
} finally { await browser.close(); await server.close() }
