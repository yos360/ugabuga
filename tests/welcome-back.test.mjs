import { test } from 'node:test'
import assert from 'node:assert/strict'
import { welcomeBackDue } from '../src/utils/welcomeBack.js'

const now = new Date('2026-11-23T10:00:00').getTime()
const today = new Date(now).toDateString(), yesterday = new Date(now - 864e5).toDateString()

test('welcome back: not on a first visit', () => {
  assert.equal(welcomeBackDue(null, null, now), false)
  assert.equal(welcomeBackDue({ day: today, n: 1 }, null, now), false)
})
test('welcome back: shown when coming back on another day', () => {
  assert.equal(welcomeBackDue({ day: yesterday, n: 1 }, null, now), true)
  assert.equal(welcomeBackDue({ day: today, n: 3 }, yesterday, now), true)
})
test('welcome back: only once a day', () => {
  assert.equal(welcomeBackDue({ day: yesterday, n: 4 }, today, now), false)
})
