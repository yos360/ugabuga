import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeTip } from '../src/office/money/tipLogic.js'

test('tip: plain percent', () => {
  assert.deepEqual(computeTip(240, 12), { bill: 240, tip: 28.8, total: 268.8, share: 268.8, people: 1, pct: 12 })
})

test('tip: split never pays an agora short', () => {
  const r = computeTip(100, 10, 3)
  assert.equal(r.share, 36.67)
  assert.ok(r.total >= 110)
  assert.equal(Math.round(r.share * 3 * 100), Math.round(r.total * 100))
})

test('tip: round up to whole shekel', () => {
  const r = computeTip(186.5, 15, 4, true)
  assert.equal(r.share, 54)
  assert.equal(r.total, 216)
  assert.equal(r.tip, 29.5)
})

test('tip: bad input', () => {
  assert.equal(computeTip(0, 10), null)
  assert.equal(computeTip(100, 120), null)
  assert.equal(computeTip(100, 10, 0), null)
  assert.equal(computeTip(NaN, 10), null)
})
