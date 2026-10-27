import test from 'node:test'
import assert from 'node:assert/strict'
import { hanukkahNights } from '../src/utils/hanukkahTimes.js'
import { shabbatCity } from '../src/data/shabbatCities.js'
import { formatTime } from '../src/utils/shabbatTimes.js'

test('Hanukkah 5787: eight nights from Friday 4.12.2026, Fridays before Shabbat, Saturday after it', () => {
  const jlm = shabbatCity('jerusalem'), nights = hanukkahNights(jlm, '2026-10-27')
  assert.deepEqual(nights.map(x => x.date), ['2026-12-04', '2026-12-05', '2026-12-06', '2026-12-07', '2026-12-08', '2026-12-09', '2026-12-10', '2026-12-11'])
  assert.deepEqual(nights.map(x => x.n), [1, 2, 3, 4, 5, 6, 7, 8])
  assert.deepEqual(nights.map(x => x.kind), ['friday', 'saturday', 'weekday', 'weekday', 'weekday', 'weekday', 'weekday', 'friday'])
  assert.equal(nights[0].hebrewDate, 'כ״ה כסלו תשפ״ז')
  for (const x of nights) {
    if (x.kind === 'friday') assert.ok(x.time < x.sunset, 'Friday: before sunset (Shabbat candles)')
    else assert.ok(x.time > x.sunset, `${x.date}: after sunset`)
  }
  assert.equal(formatTime(nights[0].time), '15:54') // Jerusalem: 40 minutes before sunset
})

test('mid-Hanukkah still shows this year; after it, next year', () => {
  const tlv = shabbatCity('tel-aviv')
  assert.equal(hanukkahNights(tlv, '2026-11-30')[0].date, '2026-12-04')
  assert.equal(hanukkahNights(tlv, '2026-12-20')[0].date, '2027-12-24')
})
