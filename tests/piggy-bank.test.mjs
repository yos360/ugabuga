import { test } from 'node:test'
import assert from 'node:assert/strict'
import { weeksToGoal, coinAmount, coinTotal, fmt, weeksLabel, COIN_COUNT } from '../src/learn/subjects/piggyBankMath.js'

test('weeksToGoal rounds up to whole weeks', () => {
  assert.equal(weeksToGoal({ target: 100, weekly: 10, saved: 0 }).weeks, 10)
  assert.equal(weeksToGoal({ target: 100, weekly: 15, saved: 0 }).weeks, 7)
  assert.equal(weeksToGoal({ target: 100, weekly: 15, saved: 10 }).weeks, 6)
  assert.equal(weeksToGoal({ target: 250, weekly: 20, saved: 30 }).weeks, 11)
})

test('weeksToGoal is exact with decimals (no float drift)', () => {
  // 0.3 / 0.1 is 2.9999999999999996 in floats; it must be exactly 3 weeks
  assert.equal(weeksToGoal({ target: 0.3, weekly: 0.1 }).weeks, 3)
  assert.equal(weeksToGoal({ target: 10.5, weekly: 3.5 }).weeks, 3)
  assert.equal(weeksToGoal({ target: 10.6, weekly: 3.5 }).weeks, 4)
})

test('weeksToGoal handles an already reached goal', () => {
  const r = weeksToGoal({ target: 50, weekly: 5, saved: 50 })
  assert.deepEqual([r.valid, r.done, r.weeks], [true, true, 0])
  assert.equal(weeksToGoal({ target: 50, weekly: 0, saved: 80 }).done, true)
})

test('weeksToGoal rejects bad input', () => {
  assert.equal(weeksToGoal({ target: 0, weekly: 5 }).valid, false)
  assert.equal(weeksToGoal({ target: -5, weekly: 5 }).valid, false)
  assert.equal(weeksToGoal({ target: 100, weekly: 0 }).valid, false)
  assert.equal(weeksToGoal({ target: 100, weekly: -2 }).valid, false)
  assert.equal(weeksToGoal({ target: '', weekly: 5 }).valid, false)
  assert.equal(weeksToGoal({ target: 100, weekly: 'abc' }).valid, false)
  assert.equal(weeksToGoal({ target: 100, weekly: 5, saved: -1 }).valid, false)
})

test('weeksToGoal reports remaining amount and months', () => {
  const r = weeksToGoal({ target: 200, weekly: 10, saved: 50 })
  assert.equal(r.remaining, 150)
  assert.equal(r.weeks, 15)
  assert.equal(r.months, 3.4)
})

test('coinAmount: 20 coins add up to the target', () => {
  for (const target of [20, 40, 100, 150, 200, 99, 33, 7, 1250]) {
    const each = coinAmount(target)
    assert.ok(Math.abs(each * COIN_COUNT - target) < 1e-6, `target ${target}`)
  }
  assert.equal(coinAmount(100), 5)
  assert.equal(coinAmount(150), 7.5)
  assert.equal(coinAmount(33), 1.65)
  assert.equal(coinAmount(0), 0)
  assert.equal(coinAmount('x'), 0)
})

test('coinTotal grows evenly and ends on the target', () => {
  assert.equal(coinTotal(100, 1), 5)
  assert.equal(coinTotal(100, 10), 50)
  assert.equal(coinTotal(100, 20), 100)
  assert.equal(coinTotal(33, 20), 33)
  assert.equal(coinTotal(33, 7), 11.55)
})

test('formatting helpers', () => {
  assert.equal(fmt(5), '5')
  assert.equal(fmt(7.5), '7.5')
  assert.equal(fmt(1.65), '1.65')
  assert.equal(weeksLabel(1), 'שבוע אחד')
  assert.equal(weeksLabel(2), 'שבועיים')
  assert.equal(weeksLabel(9), '9 שבועות')
})

import { BOX_SIZES, netLayout, TAB, TUCK } from '../src/learn/subjects/piggyBankMath.js'

test('box net is a foldable cube/box: matching edges and fits an A4 sheet', () => {
  for (const [name, { S, H }] of Object.entries(BOX_SIZES)) {
    const n = netLayout(S, H)
    // four side panels, each as wide as the base edge, each H tall, edge to edge
    assert.equal(n.panels.length, 4, name)
    n.panels.forEach((p, i) => {
      assert.equal(p.w, S)
      assert.equal(p.h, H)
      if (i) assert.equal(p.x, n.panels[i - 1].x + S)
    })
    // lid and base are S x S, attached to panel 1 along its full top / bottom edge
    for (const f of [n.top, n.bottom]) { assert.equal(f.w, S); assert.equal(f.h, S); assert.equal(f.x, n.panels[1].x) }
    assert.equal(n.top.y + S, n.panels[1].y)
    assert.equal(n.bottom.y, n.panels[1].y + H)
    // the lid edge meeting each neighbouring panel has the same length as that panel's top edge
    assert.equal(n.top.w, n.panels[0].w)
    assert.equal(n.top.w, n.panels[2].w)
    assert.equal(n.top.h, n.panels[3].w) // far edge meets the opposite panel
    // the whole net, tabs and margins included, fits inside the 200 x 270 sheet with at least 5 mm margins
    assert.ok(n.x0 >= 5, name)
    assert.ok(n.xMax <= 195 + 1e-9, name)
    assert.ok(n.y0 - TAB >= 5, name)
    assert.ok(n.yEnd + 70 <= 270, `${name}: room for instructions`)
    assert.ok(TUCK < S)
  }
})
