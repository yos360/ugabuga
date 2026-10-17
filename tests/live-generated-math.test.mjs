import test from 'node:test'
import assert from 'node:assert/strict'
import { GENERATED_MATH_QUIZ_BANK } from '../src/data/liveQuizGeneratedMath.js'

const all = Object.values(GENERATED_MATH_QUIZ_BANK).flat()

test('generated math options are unique, positive and include the answer', () => {
  for (const item of all) {
    const values = item.options.map(Number)
    assert.equal(values.length, 4, item.id)
    assert.equal(new Set(values).size, 4, item.id)
    assert.ok(values.every(value => Number.isInteger(value) && value > 0), item.id)
    assert.ok(item.correct >= 0 && item.correct < 4, item.id)
  }
})

test('the smallest option is not a reliable hint for the correct answer', () => {
  for (const [level, items] of Object.entries(GENERATED_MATH_QUIZ_BANK)) {
    const smallest = items.filter(item => Number(item.options[item.correct]) === Math.min(...item.options.map(Number))).length
    assert.ok(smallest / items.length < 0.4, `${level}: ${smallest}/${items.length}`)
    const largest = items.filter(item => Number(item.options[item.correct]) === Math.max(...item.options.map(Number))).length
    assert.ok(largest / items.length < 0.4, `${level} largest: ${largest}/${items.length}`)
  }
  const positions = new Set(all.map(item => item.correct))
  assert.deepEqual([...positions].sort(), [0, 1, 2, 3])
})
