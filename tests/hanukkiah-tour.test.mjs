import test from 'node:test'
import assert from 'node:assert/strict'
import { TOUR_NIGHTS, TOUR_MISSIONS, flamesOnNight, formatNightDate } from '../src/data/hanukkiahTour.js'

test('the tour covers eight consecutive nights, Hanukkah 2026 from 4.12 to 11.12', () => {
  assert.deepEqual(TOUR_NIGHTS.map(n => n.n), [1, 2, 3, 4, 5, 6, 7, 8])
  assert.equal(TOUR_NIGHTS[0].date, '2026-12-04')
  for (let i = 1; i < TOUR_NIGHTS.length; i++) {
    const gap = (new Date(TOUR_NIGHTS[i].date) - new Date(TOUR_NIGHTS[i - 1].date)) / 864e5
    assert.equal(gap, 1, `night ${i + 1}`)
  }
  assert.equal(formatNightDate(TOUR_NIGHTS[7].date), '11.12')
  // 4.12.2026 is a Friday, so nights 1 and 8 fall on Friday.
  assert.equal(new Date(TOUR_NIGHTS[0].date).getUTCDay(), 5)
  assert.equal(new Date(TOUR_NIGHTS[7].date).getUTCDay(), 5)
})

test('missions fill the 3×3 sheet with unique ids', () => {
  assert.equal(TOUR_MISSIONS.length, 9)
  assert.equal(new Set(TOUR_MISSIONS.map(m => m.id)).size, 9)
})

test('each hanukkiah burns the night\'s candles plus the shamash', () => {
  assert.equal(flamesOnNight(1), 2)
  assert.equal(flamesOnNight(8), 9)
})
