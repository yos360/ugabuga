import test from 'node:test'
import assert from 'node:assert/strict'
import { guestBucket, stepCategory, funnelRows, RSVP_STEPS } from '../src/utils/rsvpFunnel.js'

test('guestBucket gives buckets only', () => {
  assert.equal(guestBucket(0), null)
  assert.equal(guestBucket(-1), null)
  assert.equal(guestBucket(1.5), null)
  assert.equal(guestBucket(1), '1_10')
  assert.equal(guestBucket(10), '1_10')
  assert.equal(guestBucket(11), '11_50')
  assert.equal(guestBucket(50), '11_50')
  assert.equal(guestBucket(51), '51p')
})
test('stepCategory is fixed codes within 60 chars', () => {
  assert.equal(stepCategory('visit'), 'rsvp-step:visit')
  assert.equal(stepCategory('guests', '11_50'), 'rsvp-step:guests_11_50')
  assert.equal(stepCategory('guests', '7'), null)
  assert.equal(stepCategory('Dana Cohen'), null)
  for (const [id] of RSVP_STEPS) assert.ok((stepCategory(id, '51p') || '').length <= 60)
})
test('funnelRows sums guest buckets and computes % of step 1', () => {
  const rows = funnelRows({ visit: 200, created: 50, guests_1_10: 20, guests_11_50: 10, guests_51p: 2, upgrade_click: 3 })
  assert.equal(rows.length, RSVP_STEPS.length)
  assert.deepEqual(rows[1], { id: 'created', label: rows[1].label, n: 50, pct: 25 })
  assert.equal(rows.find(r => r.id === 'guests').n, 32)
  assert.equal(rows.find(r => r.id === 'upgrade_click').pct, 2)
  assert.equal(funnelRows({})[0].pct, null)
})
