import test from 'node:test'
import assert from 'node:assert/strict'
import { visitorIdValid } from '../src/utils/liveActivity.js'

const at = (h, m = 0, day = 11) => new Date(2026, 9, day, h, m).getTime()
const midnight = day => new Date(2026, 9, day + 1, 0, 0).getTime()

test('an id made today stays valid until midnight', () => {
  const saved = { id: 'a', created: at(8), expires: midnight(11) }
  assert.equal(visitorIdValid(saved, at(23, 59)), true)
  assert.equal(visitorIdValid(saved, at(0, 1, 12)), false)
})

test('an old 24-hour id from yesterday is not carried into today', () => {
  const saved = { id: 'a', expires: at(20, 0, 10) + 86400000 } // made yesterday 20:00
  assert.equal(visitorIdValid(saved, at(9)), false)
})

test('rejects missing or broken ids', () => {
  assert.equal(visitorIdValid(null, at(9)), false)
  assert.equal(visitorIdValid({ expires: midnight(11) }, at(9)), false)
})
