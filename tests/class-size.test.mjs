import test from 'node:test'
import assert from 'node:assert/strict'
import { clampClassSize, countOptions, CLASS_DEFAULT, CLASS_MAX, CLASS_MIN } from '../src/utils/classSize.js'

test('class size stays in a sensible range', () => {
  assert.equal(clampClassSize(27), 27)
  assert.equal(clampClassSize('32'), 32)
  assert.equal(clampClassSize(500), CLASS_MAX)
  assert.equal(clampClassSize(0), CLASS_MIN)
  assert.equal(clampClassSize('abc'), CLASS_DEFAULT)
  assert.equal(clampClassSize(22.6), 23)
})
test('the class size is added to the count options once, in order', () => {
  assert.deepEqual(countOptions([1, 2, 30], 27), [1, 2, 27, 30])
  assert.deepEqual(countOptions([1, 2, 30], 30), [1, 2, 30])
})
