import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'
import { act, bettingLimits, legalActions, newHoldem, runBots } from '../../src/arcade/logic/holdem.js'

const base = process.env.BASE_URL || 'http://127.0.0.1:5199'
const output = process.env.SCREENSHOT_DIR || 'out/holdem'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ channel: process.env.CHROME_CHANNEL || 'chrome', headless: true })
const errors = []
let fixture
for (let seed = 1; seed < 200; seed++) {
  const initial = newHoldem({ opponents: 5, difficulty: 'easy', seed, dealer: 3 })
  const limits = bettingLimits(initial)
  let s = runBots(act(initial, 'raise', Math.max(limits.min, initial.currentBet + Math.floor((initial.pot + limits.toCall) / 2))))
  for (let i = 0; i < 100 && s.stage !== 'ended'; i++) s = runBots(act(s, legalActions(s).includes('check') ? 'check' : 'call'))
  if (s.result?.showdown) { fixture = initial; break }
}
assert.ok(fixture, 'deterministic playable showdown fixture')
const key = 'buga-arcade-texas-holdem'
async function openGame(page) {
  await page.goto(`${base}/online-games/texas-holdem`)
  await page.evaluate(({ key, fixture }) => localStorage.setItem(key, JSON.stringify({ wins: 0, hands: 0, best: 1000, game: fixture })), { key, fixture })
  await page.getByRole('button', { name: /שחקו עכשיו/ }).click()
  await page.locator('.th-game').waitFor()
}
async function resume(page) {
  await page.reload()
  await page.locator('.th-game').waitFor()
}
async function snapshot(page) { return page.evaluate(key => JSON.parse(localStorage.getItem(key)).game, key) }
async function noOverflow(page) {
  assert.equal(await page.locator('.th-game').evaluate(el => el.scrollWidth > el.clientWidth + 1), false, 'no horizontal game overflow')
  const boxes = await page.locator('.th-seat').evaluateAll(els => els.map(el => { const r = el.getBoundingClientRect(); return { x:r.x,y:r.y,right:r.right,bottom:r.bottom } }))
  assert.ok(boxes.every(r => r.x >= 0 && r.right <= page.viewportSize().width), 'all seats within viewport')
  assert.ok(new Set(boxes.map(r => Math.round(r.x))).size >= 3, 'seats surround the felt')
  const actions = await page.locator('.th-actions').boundingBox()
  assert.ok(actions.y + actions.height <= page.viewportSize().height, 'primary actions fit on screen')
}
try {
  for (const viewport of [{ width:390,height:844 }, { width:1440,height:900 }]) {
    const context = await browser.newContext({ viewport, reducedMotion: 'reduce' }), page = await context.newPage()
    page.on('pageerror', e => errors.push(e.message))
    page.on('console', m => { if(m.type()==='error' && !/net::|Failed to load resource/.test(m.text())) errors.push(m.text()) })
    await openGame(page)
    assert.equal(await page.locator('.th-seat').count(),6)
    assert.equal(await page.locator('.th-card.is-back').count(),10)
    await noOverflow(page)
    const before = await snapshot(page)
    await page.getByText('הגדרות הטורניר', { exact:true }).click()
    await page.getByLabel('מספר יריבים', { exact:true }).selectOption('1')
    await page.getByLabel('רמת היריבים', { exact:true }).selectOption('hard')
    assert.deepEqual(await snapshot(page),before,'settings do not reset a hand')
    await page.getByText('הגדרות הטורניר', { exact:true }).click()
    await page.getByRole('button', { name:/^RAISE/ }).click()
    const slider = page.getByRole('slider', { name:'סכום ההימור' }), limits=bettingLimits(before)
    assert.equal(Number(await slider.getAttribute('min')),limits.min)
    assert.equal(Number(await slider.getAttribute('max')),limits.max)
    for(const [label,fraction] of [['1/2 POT',.5],['3/4 POT',.75],['POT',1]]) {
      await page.getByRole('button',{name:label,exact:true}).click()
      assert.equal(Number(await slider.inputValue()),Math.min(limits.max,Math.max(limits.min,before.currentBet+Math.floor((before.pot+limits.toCall)*fraction))))
    }
    await page.getByRole('button',{name:'ALL-IN',exact:true}).click();assert.equal(Number(await slider.inputValue()),limits.max)
    await slider.fill(String(limits.min+1));assert.equal(await slider.inputValue(),String(limits.min+1))
    await page.getByRole('button',{name:'1/2 POT',exact:true}).click()
    await noOverflow(page)
    await page.screenshot({ path:`${output}/holdem-${viewport.width}-raise.png` })
    await page.getByRole('button',{name:/^RAISE \d/}).click()
    // Persist a bot turn and reload while the next decision is pending.
    await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).game.players[0].bet > 0, key)
    const afterRaise=await snapshot(page)
    assert.notEqual(afterRaise.current,0)
    await resume(page)
    let checks=0
    while(!(await snapshot(page)).result && checks++<100) {
      const s=await snapshot(page)
      if(s.current===0) await page.getByRole('button',{name:/^(CHECK|CALL)/}).click()
      else await page.waitForTimeout(150)
    }
    const ended=await snapshot(page)
    assert.equal(ended.stage,'ended');assert.equal(ended.result.showdown,true)
    assert.equal(await page.locator('.th-board .th-card:not(.is-empty)').count(),5)
    assert.ok(await page.locator('.th-showdown').innerText())
    await page.screenshot({ path:`${output}/holdem-${viewport.width}-showdown.png` })
    await resume(page);assert.deepEqual(await snapshot(page),ended,'completed tournament hand also survives reload')
    await page.getByRole('button',{name:'היד הבאה',exact:true}).click()
    const next=await snapshot(page);assert.equal(next.handNumber,ended.handNumber+1);assert.notEqual(next.dealer,ended.dealer)
    // Confirm cancellation really preserves the active tournament.
    await page.getByRole('button',{name:'טורניר חדש',exact:true}).first().click()
    const paused=await snapshot(page)
    await page.getByRole('button',{name:'חזרה למשחק',exact:true}).click()
    assert.equal((await snapshot(page)).handNumber,paused.handNumber)
    await context.close()
  }
  assert.deepEqual(errors,[])
  console.log('Holdem desktop/mobile: slider, presets, six seats, settings, mid-round reload, showdown, next hand and overflow passed')
} finally { await browser.close() }
