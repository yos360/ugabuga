import test from 'node:test'
import assert from 'node:assert/strict'
import { mailQuota } from '../functions/api/mail.js'

test('confirmations and reminders use separate daily counters', () => {
  const day = '2026-10-17'
  assert.deepEqual(mailQuota(undefined, 'confirm', day), { key: `confirm:${day}`, max: 15 })
  assert.deepEqual(mailQuota(undefined, 'reminder', day), { key: `send:${day}`, max: 35 })
  assert.deepEqual(mailQuota('200', 'confirm', day).max, 60)
  assert.deepEqual(mailQuota('200', 'reminder', day).max, 140)
})

test('the split never exceeds the daily limit and keeps at least one of each', () => {
  for (const limit of [2, 3, 10, 50, 99, 10000, 999999]) {
    const c = mailQuota(limit, 'confirm', 'd').max, r = mailQuota(limit, 'reminder', 'd').max
    assert.ok(c >= 1 && r >= 1, String(limit))
    assert.ok(c + r <= Math.min(10000, limit), String(limit))
    assert.ok(c <= r, String(limit))
  }
  assert.equal(mailQuota('junk', 'confirm', 'd').max, 15)
})
