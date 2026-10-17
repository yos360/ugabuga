// Local browser regression: node scripts/audit/solitaire-smoke.mjs
// Set CHROME_PATH when Playwright's bundled Chromium is not installed.
import { chromium } from 'playwright'
import { createServer } from 'vite'
import assert from 'node:assert/strict'
import { deck } from '../../src/arcade/logic/cards.js'
const server = await createServer({ server: { host: '127.0.0.1', port: 5180 } })
await server.listen()
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) })
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  const open = async () => {
    await page.goto('http://127.0.0.1:5180/online-games/solitaire')
    await page.locator('.arc-play-btn').click()
    await page.locator('.solitaire-game .cd').first().waitFor()
  }
  const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('buga-solitaire-session-v1')))
  const seed = async s => {
    await page.evaluate(s => localStorage.setItem('buga-solitaire-session-v1', JSON.stringify({ version: 1, s, history: [], time: 12, reported: false })), s)
    await open()
  }
  await open()
  await page.getByLabel('מספר קלפים בחלוקה').selectOption('3')
  await page.locator('button.cd.is-back').click()
  assert.equal((await saved()).s.waste.length, 3)
  const afterDraw = (await saved()).s
  await open()
  assert.deepEqual((await saved()).s, afterDraw)
  await page.getByRole('button', { name: 'ביטול מהלך', exact: true }).click()
  assert.equal((await saved()).s.stock.length, 24)
  await page.locator('button.cd.is-back').focus()
  await page.keyboard.press('Enter')
  assert.equal((await saved()).s.waste.length, 3)
  await page.getByRole('button', { name: 'משחק חדש', exact: true }).click()
  await page.getByRole('button', { name: 'המשך המשחק', exact: true }).click()
  assert.equal((await saved()).s.waste.length, 3)
  await page.screenshot({ path: '../solitaire-mobile.png' })
  assert.ok(await page.locator('.cd-table').evaluate(el => el.scrollWidth <= el.clientWidth + 1))

  const cards = deck()
  const ace = { ...cards[0], up: true }, two = { ...cards[14], up: true }
  await seed({ stock: cards.filter(c => ![0, 14].includes(c.id)), waste: [ace], found: [[], [], [], []], tab: [[two], [], [], [], [], [], []], moves: 1, drawCount: 1 })
  const source = await page.getByRole('button', { name: 'A♠', exact: true }).boundingBox()
  const dest = await page.getByRole('button', { name: '2♥', exact: true }).boundingBox()
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2)
  await page.mouse.down()
  await page.mouse.move(dest.x + dest.width / 2, dest.y + dest.height / 2, { steps: 8 })
  await page.mouse.up()
  assert.equal((await saved()).s.tab[0].length, 2)
  await page.getByRole('button', { name: 'ביטול מהלך', exact: true }).click()
  assert.equal((await saved()).s.waste.length, 1)

  await page.waitForTimeout(220)
  // Real touch input through Chromium's mobile input pipeline.
  const touch = await page.context().newCDPSession(page)
  const a = await page.getByRole('button', { name: 'A♠', exact: true }).boundingBox()
  const b = await page.getByRole('button', { name: '2♥', exact: true }).boundingBox()
  const point = box => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 })
  await page.waitForTimeout(220)
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point(a)] })
  await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [point(b)] })
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  assert.equal((await saved()).s.tab[0].length, 2)
  await page.getByRole('button', { name: 'ביטול מהלך', exact: true }).click()
  await page.waitForTimeout(220)
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point(a)] })
  await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [point(b)] })
  await touch.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] })
  assert.equal((await saved()).s.waste.length, 1)
  assert.equal(await page.locator('.is-drag').count(), 0)

  const nearWin = { stock: [], waste: [], found: [0, 1, 2, 3].map(suit => cards.filter(c => c.suit === suit && c.rank < 13).map(c => ({ ...c, up: true }))), tab: [...cards.filter(c => c.rank === 13).map(c => [{ ...c, up: true }]), [], [], []], moves: 80, drawCount: 1 }
  await seed(nearWin)
  // The board must remain unchanged until the user requests completion.
  await page.waitForTimeout(350)
  assert.deepEqual((await saved()).s, nearWin)
  await page.getByRole('button', { name: 'השלמה אוטומטית', exact: true }).click()
  await page.getByRole('button', { name: 'עצירת השלמה', exact: true }).click()
  const stopped = (await saved()).s.moves
  await page.waitForTimeout(250)
  assert.equal((await saved()).s.moves, stopped)
  await page.getByRole('button', { name: 'השלמה אוטומטית', exact: true }).click()
  await page.getByRole('alertdialog').waitFor()
  const wins = await page.evaluate(() => JSON.parse(localStorage.getItem('buga-arcade-solitaire')).wins)
  await open()
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('buga-arcade-solitaire')).wins), wins)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.getByRole('button', { name: '🃏 משחק חדש', exact: true }).click()
  await page.waitForTimeout(250)
  await page.screenshot({ path: '../solitaire-desktop.png' })
  await page.setViewportSize({ width: 844, height: 390 })
  await page.waitForTimeout(300)
  assert.ok(await page.locator('.cd-table').evaluate(el => el.scrollWidth <= el.clientWidth + 1))
  await page.goto('http://127.0.0.1:5180/online-games/spider-solitaire')
  await page.locator('.arc-play-btn').click()
  await page.locator('.cd').first().waitFor()
  assert.equal(await page.locator('.solitaire-game').count(), 0)
  assert.equal(await page.locator('.cd').count(), 59)
  assert.deepEqual(errors, [])
  console.log('PASS: mobile layout, draw-three, reload, undo, keyboard, confirmation, drag, explicit auto-finish/stop, single win reporting, desktop')
} finally { await browser.close(); await server.close() }


