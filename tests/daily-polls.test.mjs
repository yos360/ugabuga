import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DAILY_POLLS, pollForDate, percentages } from '../src/data/dailyPolls.js'

test('daily polls: ids are unique and valid for the database, 2-6 options each', () => {
  const ids = DAILY_POLLS.map(p => p.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const p of DAILY_POLLS) {
    assert.match(p.id, /^[a-z0-9-]{2,40}$/)
    assert.ok(p.options.length >= 2 && p.options.length <= 6, p.id)
  }
})

test('dated polls never overlap, and every day has a poll', () => {
  const dated = DAILY_POLLS.filter(p => p.from).sort((a, b) => a.from.localeCompare(b.from))
  for (let i = 1; i < dated.length; i++) assert.ok(dated[i].from > dated[i - 1].to, `${dated[i - 1].id} overlaps ${dated[i].id}`)
  for (let d = 0; d < 400; d++) assert.ok(pollForDate(new Date(Date.UTC(2026, 10, 1) + d * 86400000).toISOString().slice(0, 10)))
})

test('percentages add up to 100', () => {
  assert.deepEqual(percentages([1, 1, 1], 3).reduce((a, b) => a + b), 100)
  assert.deepEqual(percentages([0, 0], 2), [0, 0])
  assert.deepEqual(percentages([1, 3], 2), [25, 75])
})
