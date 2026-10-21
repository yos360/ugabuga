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

test('the day counter goes up once per new day and keeps no id across days', async () => {
  const { nextVisitDays } = await import('../src/utils/liveActivity.js')
  const d = (day, h = 10) => new Date(2026, 9, day, h).getTime()
  const first = nextVisitDays(null, 'a', d(1))
  assert.equal(first.n, 1)
  const sameDay = nextVisitDays({ ...first, sent: 'a' }, 'a', d(1, 22))
  assert.equal(sameDay.n, 1); assert.equal(sameDay.sent, 'a')
  const nextDay = nextVisitDays({ ...first, sent: 'a' }, 'b', d(3))
  assert.equal(nextDay.n, 2); assert.equal(nextDay.sent, null)
  assert.equal(nextVisitDays({ day: 'x', n: 'junk' }, 'c', d(4)).n, 1)
})
