import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'
import { puzzle, WORLDS } from '../../src/arcade/logic/brain/catalog.js'

const base = process.env.AUDIT_BASE || 'http://127.0.0.1:5199'
const screenshots = process.env.BRAIN_SCREENSHOTS || 'out/brain-smoke'
await mkdir(screenshots, { recursive: true })
const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) })
const games = [['matchsticks', 'matches'], ['water-jugs', 'water'], ['river-crossing', 'river'], ['cut-the-wire', 'wires'], ['lights-out', 'lights'], ['one-move', 'one'], ['buga-iq', 'iq']]
const names = ['אדום ●', 'כחול ◆', 'ירוק ▲', 'כתום ■', 'סגול ★', 'תכלת ♥']
const friends = ['🦊 שועל', '🐔 תרנגולת', '🌽 תירס', '🐐 עז', '🥬 כרוב']
const people = ['אור', 'גל', 'טל', 'רון', 'שחר']
const readSession = (page, kind) => page.evaluate(k => JSON.parse(localStorage.getItem(`buga-arcade-brain-${k}`))?.session, kind)
async function perform(page, p, action) {
  const board = page.getByRole('main', { name: 'לוח החידה' })
  if (p.kind === 'matches') {
    await board.getByRole('button', { name: `עריכת ספרה ${Math.floor(action.from / 7) + 1}`, exact: true }).click()
    await board.getByRole('button', { name: `גפרור מספר ${action.from + 1}`, exact: true }).click()
    if ('to' in action) {
      await board.getByRole('button', { name: `עריכת ספרה ${Math.floor(action.to / 7) + 1}`, exact: true }).click()
      await board.getByRole('button', { name: `מקום מספר ${action.to + 1}`, exact: true }).click()
    }
  } else if (p.kind === 'water') {
    if ('fill' in action) await board.getByRole('button', { name: `מילוי ${action.fill + 1}`, exact: true }).click()
    else if ('empty' in action) await board.getByRole('button', { name: `ריקון ${action.empty + 1}`, exact: true }).click()
    else { await board.getByRole('button', { name: new RegExp(`^כלי ${action.from + 1}:`) }).click(); await board.getByRole('button', { name: new RegExp(`^כלי ${action.to + 1}:`) }).click() }
  } else if (p.kind === 'river') {
    for (const i of action.riders) await board.getByRole('button', { name: friends[i], exact: true }).click()
    await board.getByRole('button', { name: /חציית הנהר ·/ }).click()
  } else if (p.kind === 'lights') await board.getByRole('button', { name: new RegExp(`^נורה ${action.cell + 1},`) }).click()
  else if (p.kind === 'laser') await board.getByRole('button', { name: `תא ${action.cell + 1}, סיבוב מראה`, exact: true }).click()
  else if (p.kind === 'frogs') await board.getByRole('button', { name: new RegExp(`^משבצת ${action.from + 1}:`) }).click()
  else if (p.kind === 'wires') await board.getByRole('button', { name: `✂ ${names[action.answer]}`, exact: true }).click()
  else if (p.kind === 'scales') await board.getByRole('button', { name: `כדור ${action.answer + 1}`, exact: true }).click()
  else if (p.kind === 'liars') await board.getByRole('button', { name: people[action.answer], exact: true }).click()
  else { await board.locator('input').fill(String(action.answer)); await board.getByRole('button', { name: 'בדיקת תשובה' }).click() }
}
async function noOverflow(page) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'document horizontal overflow')
  assert.ok(await page.locator('.brain-game').evaluate(e => e.scrollWidth <= e.clientWidth), 'game horizontal overflow')
  const small = await page.locator('.brain-game button').evaluateAll(elements => elements.filter(e => e.getClientRects().length && (e.getBoundingClientRect().width < 43 || e.getBoundingClientRect().height < 43)).map(e => e.textContent))
  assert.deepEqual(small, [], 'touch targets must be at least 44px')
}
try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' })
    await context.addInitScript(() => { window.__PRERENDER__ = true })
    await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort())
    const page = await context.newPage(), errors = []
    page.setDefaultTimeout(10000); page.on('pageerror', error => errors.push(error.message))
    for (const [slug, kind] of games) {
      await page.goto(`${base}/online-games/${slug}#play`)
      await page.locator('.brain-board').waitFor()
      await noOverflow(page)
      await page.screenshot({ path: `${screenshots}/${slug}-${viewport.width}.png` })
      const p = puzzle(kind, 0)
      await perform(page, p, p.solution[0])
      const before = await readSession(page, kind)
      await page.reload(); await page.locator('.brain-board').waitFor()
      assert.deepEqual(await readSession(page, kind), before, 'reload preserves progress')
      for (const action of p.solution.slice(1)) await perform(page, p, action)
      await page.getByRole('region', { name: 'השלב נפתר' }).waitFor()
      const complete = await readSession(page, kind)
      await page.reload(); await page.getByRole('region', { name: 'השלב נפתר' }).waitFor()
      assert.deepEqual(await readSession(page, kind), complete, 'reload does not re-award points')
      await noOverflow(page)
      console.log(`${viewport.width}: ${slug} play/solve/resume/overflow passed`)
    }
    // Exercise all ten different IQ boards through world selection.
    for (let world = 0; world < WORLDS.length; world++) {
      await page.getByRole('button', { name: 'בחירת שלב ועולם', exact: false }).click()
      await page.locator('.brain-worlds button').nth(world).click()
      const p = puzzle('iq', world * 50)
      for (const action of p.solution) await perform(page, p, action)
      await page.getByRole('region', { name: 'השלב נפתר' }).waitFor()
      await noOverflow(page)
    }
    await page.getByRole('button', { name: 'IQ יומי', exact: true }).click()
    const daily = await readSession(page, 'iq')
    await page.reload(); await page.locator('.brain-board').waitFor()
    assert.equal((await readSession(page, 'iq')).index, daily.index)
    await page.getByLabel('רמת גיל', { exact: true }).selectOption('6-8')
    assert.equal((await readSession(page, 'iq')).index, daily.index, 'daily ignores age')
    await page.getByRole('button', { name: 'מבחן בוגה', exact: true }).click()
    for (let i = 0; i < 10; i++) {
      const s = await readSession(page, 'iq'), p = puzzle('iq', s.index)
      for (const action of p.solution) await perform(page, p, action)
      await page.getByRole('button', { name: i === 9 ? 'סיום האתגר' : 'לשלב הבא', exact: true }).click()
    }
    await page.getByRole('region', { name: 'סיום משחק' }).waitFor()
    assert.equal((await readSession(page, 'iq')).completed, 10)
    await page.getByRole('button', { name: 'נגד השעון', exact: true }).click()
    assert.ok((await readSession(page, 'iq')).deadline)
    await page.reload(); await page.locator('time[aria-label="זמן שנותר"]').waitFor()
    await page.clock.install()
    await page.clock.fastForward(300001)
    await page.getByRole('region', { name: 'סיום משחק' }).waitFor()
    await page.getByRole('button', { name: 'רצף', exact: true }).click()
    await page.getByRole('button', { name: '↻ התחלה מחדש', exact: true }).click()
    await page.getByRole('region', { name: 'סיום משחק' }).waitFor()
    await noOverflow(page)
    // Existing arcade entry points still render.
    for (const slug of ['solitaire', 'spider-solitaire', 'traffic-jam']) {
      await page.goto(`${base}/online-games/${slug}#play`); await page.locator('.arc-game').waitFor()
    }
    assert.deepEqual(errors, [])
    await context.close()
  }
} finally { await browser.close() }
console.log('Brain games smoke passed at mobile 390x844 and desktop 1440x900')
