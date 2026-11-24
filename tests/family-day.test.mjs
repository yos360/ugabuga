import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ACTIVITIES, FAMILY_SHAPES, LOSS_GUIDE, POEM, FAMILY_IS, FAMILY_DAY_FAQ } from '../src/data/familyDay.js'

test('family day content is complete and inclusive', () => {
  assert.equal(ACTIVITIES.length, 6)
  assert.ok(new Set(ACTIVITIES.map(a => a.id)).size === 6)
  for (const a of ACTIVITIES) { assert.ok(a.steps.length >= 3 && a.care && a.grades.length) }
  assert.ok(FAMILY_SHAPES.length >= 7)
  assert.ok(LOSS_GUIDE.steps.length >= 6)
  assert.ok(POEM.lines.length > 10)
  assert.ok(FAMILY_IS.every(t => t.length < 40))
  assert.ok(FAMILY_DAY_FAQ.length >= 5)
})

test('Family Day 5787 is Sunday 7 February 2027', () => {
  const d = new Date('2027-02-07T12:00:00Z')
  const heb = new Intl.DateTimeFormat('en-u-ca-hebrew', { day: 'numeric', month: 'long', year: 'numeric' }).format(d)
  assert.equal(heb, '30 Shevat 5787')
  assert.equal(d.getUTCDay(), 0)
})
