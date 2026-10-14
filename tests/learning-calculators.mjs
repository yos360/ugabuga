import test from 'node:test'
import assert from 'node:assert/strict'
import { adultBmi, fraction, parseFraction, calculateFractions, gradeAverage, readGradeRows } from '../src/utils/learningCalculators.js'
test('adult BMI thresholds use unrounded values and reject children', () => {
  assert.equal(adultBmi(100, 200, 20).bmi, 25)
  for (const age of [2, 19, NaN]) assert.throws(() => adultBmi(50, 160, age))
  assert.throws(() => adultBmi(50, 0, 20))
  assert.match(adultBmi(18.5, 100, 20).category, /בטווח/)
  assert.match(adultBmi(24.999, 100, 20).category, /בטווח/)
  assert.match(adultBmi(30, 100, 20).category, /השמנה/)
})
test('fractions, mixed negatives, decimals and percentages', () => {
  assert.deepEqual(parseFraction('-1 1/2'), { n: -3, d: 2 })
  assert.deepEqual(parseFraction('12.5%'), { n: 1, d: 8 })
  assert.deepEqual(parseFraction('0.25'), { n: 1, d: 4 })
  assert.deepEqual(fraction(2, -4), { n: -1, d: 2 })
  for (const s of ['1/0', '', '1 4/3', 'hello']) assert.throws(() => parseFraction(s))
  const a = parseFraction('1/2'), b = parseFraction('1/3')
  for (const [op, n, d] of [['+', 5, 6], ['-', 1, 6], ['*', 1, 6], ['/', 3, 2]]) { const r = calculateFractions(a, b, op); assert.equal(r.n, n); assert.equal(r.d, d); assert.equal(r.steps.length, 2) }
  assert.throws(() => calculateFractions(a, fraction(0), '/'))
  assert.throws(() => fraction(Number.MAX_SAFE_INTEGER + 1))
})
test('grade weighting, zero, missing rows and corrupt storage', () => {
  const rows = [{ grade: '80', units: '5' }, { grade: '100', units: '2' }, { grade: '', units: '' }]
  assert.equal(gradeAverage(rows, false).average, 90)
  assert.equal(gradeAverage(rows, true).average, 600 / 7)
  assert.equal(gradeAverage([{ grade: '0', units: '1' }], false).average, 0)
  assert.equal(gradeAverage([], false), null)
  assert.throws(() => gradeAverage([{ grade: '101', units: '1' }], false))
  assert.throws(() => gradeAverage([{ grade: '90', units: '0' }], true))
  for (const value of ['bad', 'null', '[null]', '[]']) assert.equal(readGradeRows(value).length, 1)
})
