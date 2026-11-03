import test from 'node:test'
import assert from 'node:assert/strict'
import { parsePageRange, pageKind } from '../src/utils/pageRange.js'
import { gradesOf } from '../src/booklets/grades.js'

test('booklet grades are read from the audience', () => {
  assert.deepEqual(gradesOf('כיתה ה׳'), [5])
  assert.deepEqual(gradesOf('כיתה ז׳ (חטיבת ביניים)'), [7])
  assert.deepEqual(gradesOf('כיתות א׳–ג׳'), [1, 2, 3])
  assert.deepEqual(gradesOf('גן חובה עד כיתה ב׳'), [1, 2])
  assert.deepEqual(gradesOf('סוף כיתה א׳ ותחילת כיתה ב׳'), [1, 2])
  assert.deepEqual(gradesOf('כיתות י׳–י״ב'), [])
  assert.deepEqual(gradesOf('גיל 4'), [])
})

test('page ranges: lists, ranges, reversed ranges, clamped to the booklet', () => {
  assert.equal(parsePageRange('', 10), null)
  assert.deepEqual([...parsePageRange('2-4, 9', 10)], [2, 3, 4, 9])
  assert.deepEqual([...parsePageRange('5-3', 10)], [3, 4, 5])
  assert.deepEqual([...parsePageRange('8-20', 10)], [8, 9, 10])
  assert.equal(parsePageRange('abc', 10), false)
  assert.equal(parsePageRange('15', 10), false)
})

test('page kinds come from the page titles', () => {
  assert.equal(pageKind('דף תשובות'), 'key')
  assert.equal(pageKind('✅ דף תשובות להורים'), 'key')
  assert.equal(pageKind('תעודת סיום'), 'certificate')
  assert.equal(pageKind('חילוק ארוך'), 'page')
})
