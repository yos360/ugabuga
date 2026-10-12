import test from 'node:test'
import assert from 'node:assert/strict'
import { ageParts, gematriaOf } from '../src/utils/calc.js'

test('age in years, months, days and total days', () => {
  const a = ageParts(new Date(2020, 1, 29), new Date(2026, 9, 12))
  assert.deepEqual([a.y, a.m, a.d], [6, 7, 13])
  assert.equal(a.days, 2417)
  assert.equal(a.nextAge, 7)
})
test('gematria: finals count like regular letters, niqqud ignored', () => {
  assert.equal(gematriaOf('חי').total, 18)
  assert.equal(gematriaOf('שָׁלוֹם').total, 376)
})
