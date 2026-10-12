import { test } from 'node:test'
import assert from 'node:assert/strict'
import { moveId } from '../src/utils/sectionOrder.js'
import { orderSections } from '../src/utils/sectionOrder.js'

const S = ['a', 'b', 'c', 'd'].map(id => ({ id }))
test('saved order wins, unknown ids dropped, new sections appended', () => {
  assert.deepEqual(orderSections(S, ['c', 'x', 'a']).map(s => s.id), ['c', 'a', 'b', 'd'])
  assert.deepEqual(orderSections(S, null).map(s => s.id), ['a', 'b', 'c', 'd'])
})
test('moveId moves up/down and ignores out-of-range', () => {
  assert.deepEqual(moveId(['a', 'b', 'c'], 'c', 0), ['c', 'a', 'b'])
  assert.deepEqual(moveId(['a', 'b', 'c'], 'a', 1), ['b', 'a', 'c'])
  assert.deepEqual(moveId(['a', 'b', 'c'], 'a', -1), ['a', 'b', 'c'])
  assert.deepEqual(moveId(['a', 'b', 'c'], 'c', 3), ['a', 'b', 'c'])
})
