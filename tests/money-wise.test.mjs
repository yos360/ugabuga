// "קצבה חכמה" (/online-games/money-wise): rules of the pocket-money game.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as m from '../src/arcade/logic/moneyWise.js'

test('every scenario is well formed and always has an option the child can afford', () => {
  const ids = new Set()
  for (const sc of m.SCENARIOS) {
    assert.ok(!ids.has(sc.id)); ids.add(sc.id)
    assert.ok(sc.title && sc.text && sc.emoji)
    assert.ok(sc.options.length >= 2 && sc.options.length <= 4)
    for (const o of sc.options) {
      assert.ok(o.t && o.why, `${sc.id}: text and lesson`)
      for (const k of ['cash', 'bank', 'joy']) assert.ok(o[k] === undefined || Number.isInteger(o[k]), `${sc.id}.${k}`)
    }
    assert.ok(sc.options.some(o => (o.cash ?? 0) >= 0), `${sc.id}: a free option, so nobody gets stuck`)
  }
  assert.ok(m.SCENARIOS.length >= m.WEEKS)
})

test('a new game is deterministic per seed and draws 10 different cards', () => {
  const a = m.newGame(7, 'skate'), b = m.newGame(7, 'skate'), c = m.newGame(8, 'skate')
  assert.deepEqual(a.order, b.order)
  assert.notDeepEqual(a.order, c.order)
  assert.equal(new Set(a.order).size, m.WEEKS)
  assert.equal(a.wallet, m.ALLOWANCE)
})

test('paying uses the pocket first, then the jar; unaffordable options are refused', () => {
  let s = { ...m.newGame(1), wallet: 10, saved: 50 }
  const opt = { cash: -30 }
  assert.ok(m.canAfford(s, opt))
  assert.ok(!m.canAfford({ ...s, saved: 10 }, opt))
  s.order = ['phone']; s.week = 1
  const r = m.choose(s, 0) // fix the screen, 40
  assert.equal(r.wallet, 0); assert.equal(r.saved, 20); assert.equal(r.last.dipped, 30)
  const poor = { ...s, saved: 0, wallet: 5 }
  assert.equal(m.choose(poor, 0), poor, 'cannot afford: nothing changes')
})

test('saving moves money to the jar and half of what stays in the pocket leaks', () => {
  let s = m.newGame(1)
  s = { ...s, phase: 'save', wallet: 20 }
  const r = m.save(s, 10)
  assert.equal(r.saved, 10)
  assert.equal(r.wallet, 5 + m.ALLOWANCE, '10 left, 5 leaked, 5 stays, new week +20')
  assert.equal(r.joy, s.joy + 1)
  assert.equal(r.week, 2)
  assert.equal(m.save({ ...s, wallet: 7 }, 99).saved, 7, 'cannot save more than the pocket')
  assert.equal(m.save({ ...s, wallet: 7 }, -5).saved, 0)
  assert.equal(m.save({ ...s, phase: 'event' }, 5).phase, 'event', 'ignored outside the saving step')
})

test('grandma gift can go straight to the jar', () => {
  const s = { ...m.newGame(1), order: ['gift-money'] }
  const r = m.choose(s, 0)
  assert.equal(r.saved, 50); assert.equal(r.wallet, s.wallet)
})

function play(seed, goal, pick, share) {
  let s = m.newGame(seed, goal)
  let guard = 0
  while (s.phase !== 'end') {
    assert.ok(++guard < 100, 'the game always ends')
    if (s.phase === 'event') {
      const sc = m.scenarioOf(s)
      let i = pick(s, sc)
      if (!m.canAfford(s, sc.options[i])) i = sc.options.findIndex(o => m.canAfford(s, o))
      s = m.choose(s, i)
    } else if (s.phase === 'feedback') s = m.toSaving(s)
    else s = m.save(s, Math.floor(s.wallet * share))
  }
  return { s, o: m.outcome(s) }
}

test('ten weeks always end; balance: spending everything fails, hoarding rarely earns three stars, balanced play wins', () => {
  const joyBalanced = (s, sc) => {
    let best = 0, bestV = -1e9
    sc.options.forEach((o, i) => {
      if (!m.canAfford(s, o)) return
      const v = (o.joy || 0) + 0.35 * ((o.cash || 0) + (o.bank || 0))
      if (v > bestV) { bestV = v; best = i }
    })
    return best
  }
  const frugal = (s, sc) => {
    let best = 0, bestV = -1e9
    sc.options.forEach((o, i) => { const v = (o.cash || 0) + (o.bank || 0); if (m.canAfford(s, o) && v > bestV) { bestV = v; best = i } })
    return best
  }
  const happiest = (s, sc) => {
    let best = 0, bestV = -1e9
    sc.options.forEach((o, i) => { if (m.canAfford(s, o) && o.joy > bestV) { bestV = o.joy; best = i } })
    return best
  }
  let wins = 0
  for (let seed = 1; seed <= 40; seed++) {
    assert.equal(play(seed, 'skate', happiest, 0).o.stars, 0, 'spend everything, save nothing: no goal')
    assert.ok(play(seed, 'skate', frugal, 1).o.stars <= 2, 'a pure hoarder rarely keeps up the mood')
    const r = play(seed, 'skate', joyBalanced, 1).o
    if (r.stars >= 2) wins++
  }
  assert.ok(wins >= 30, `balanced play should usually earn 2+ stars (${wins}/40)`)
})

test('outcome: stars need the goal first', () => {
  const base = { ...m.newGame(1, 'headphones'), saved: 120, wallet: 0, joy: 70 }
  assert.equal(m.outcome(base).stars, 2)
  assert.equal(m.outcome({ ...base, saved: 150 }).stars, 3)
  assert.equal(m.outcome({ ...base, saved: 119 }).stars, 0)
  assert.equal(m.outcome({ ...base, joy: 69 }).stars, 1)
})
