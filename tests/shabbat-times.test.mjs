import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SHABBAT_CITIES, shabbatCity } from '../src/data/shabbatCities.js'
import { dailyTimes, formatTime, holidayCandles, monthlySheet, roundMinute, shabbatForDate, shabbatSeries } from '../src/utils/shabbatTimes.js'

const reference = JSON.parse(readFileSync(new URL('./fixtures/shabbat-times-reference.json', import.meta.url)))
const minutes = hhmm => hhmm.split(':').reduce((h, m) => h * 60 + Number(m), 0)
test('independent published luach: 30 candle/end pairs, 5 cities, 6 dates including both DST transitions', () => {
  assert.equal(reference.length, 30)
  assert.equal(new Set(reference.map(r => r.city)).size, 5)
  assert.deepEqual([...new Set(reference.map(r => r.saturday))].sort(), ['2024-10-26', '2024-11-02', '2024-12-21', '2025-03-22', '2025-03-29', '2025-06-21'])
  for (const row of reference) {
    const result = shabbatForDate(shabbatCity(row.city), row.saturday)
    assert.equal(result.friday, row.friday)
    assert.equal(row.sourceRule.havdalahDegrees, 8.5, 'only compare nightfall under the same published rule')
    for (const [actual, expected] of [[result.candles, row.candleLighting], [result.end, row.shabbatEnd]]) {
      assert.ok(Math.abs(minutes(formatTime(actual)) - minutes(expected)) <= 2, `${row.city} ${row.saturday}: ${formatTime(actual)} vs ${expected}; ${row.sourceUrl}`)
    }
  }
})

test('floor candles and ceil nightfall without accidentally rounding to nearest', () => {
  const instant = new Date('2025-06-20T16:28:45Z')
  assert.equal(roundMinute(instant, 'down').toISOString(), '2025-06-20T16:28:00.000Z')
  assert.equal(roundMinute(instant, 'up').toISOString(), '2025-06-20T16:29:00.000Z')
  const exact = new Date('2025-06-20T16:28:00Z')
  assert.equal(roundMinute(exact, 'up').getTime(), exact.getTime())
  assert.equal(formatTime(new Date('2025-03-21T15:00:00Z')), '17:00')
  assert.equal(formatTime(new Date('2025-03-28T15:00:00Z')), '18:00')
  assert.equal(formatTime(new Date('2024-10-25T15:00:00Z')), '18:00')
  assert.equal(formatTime(new Date('2024-11-01T15:00:00Z')), '17:00')
})

test('city rules, sea-level policy, nine Saturdays and invalid city/date handling', () => {
  assert.equal(SHABBAT_CITIES.length, 30)
  assert.equal(new Set(SHABBAT_CITIES.map(c => c.slug)).size, 30)
  for (const [slug, offset] of [['jerusalem', 40], ['haifa', 30], ['petah-tikva', 30], ['tel-aviv', 22], ['hadera', 30]]) assert.equal(shabbatCity(slug).offset, offset)
  for (const city of SHABBAT_CITIES) {
    assert.ok(city.latitude > 29 && city.latitude < 34 && city.longitude > 34 && city.longitude < 36)
    assert.ok(city.offset === 20 || city.offsetSource)
    const summer = shabbatSeries(city, '2025-06-15')
    assert.equal(summer.length, 9)
    assert.equal(summer[0].saturday, '2025-06-21')
    assert.equal(summer[8].saturday, '2025-08-16')
    assert.ok(summer.every(s => s.candles < s.end && s.candles < s.sunset))
    // A caller's elevation must not change this site's explicit sea-level policy.
    assert.equal(dailyTimes({ ...city, elevation: 1000 }, '2025-06-20').candles.getTime(), dailyTimes(city, '2025-06-20').candles.getTime())
  }
  assert.equal(shabbatCity('made-up-city'), undefined)
  assert.equal(shabbatForDate(SHABBAT_CITIES[0], '2025-02-30'), null)
  assert.equal(shabbatForDate(SHABBAT_CITIES[0], '2025-06-21').saturday, '2025-06-21')
  assert.equal(shabbatForDate(SHABBAT_CITIES[0], '2025-06-22').saturday, '2025-06-28')
})

test('Israel holiday transitions: second night, Shabbat to festival, festival to Shabbat', () => {
  const city = shabbatCity('jerusalem')
  const tishrei = holidayCandles(city, '2024-10-01', '2024-10-31')
  assert.deepEqual(tishrei.map(h => h.date), ['2024-10-02', '2024-10-03', '2024-10-11', '2024-10-16', '2024-10-23'])
  assert.equal(tishrei[1].afterNightfall, true)
  assert.ok(tishrei[1].instruction.includes('מאש קיימת'))
  assert.equal(tishrei[1].time.getTime(), dailyTimes(city, '2024-10-03').nightfall.getTime())
  const pesach = holidayCandles(city, '2025-04-01', '2025-04-30')
  assert.deepEqual(pesach.map(h => h.date), ['2025-04-12', '2025-04-18'])
  assert.equal(pesach[0].afterNightfall, true)
  assert.ok(shabbatForDate(city, '2025-04-12').endNote.includes('איסור מלאכה נמשך'))
  assert.ok(shabbatForDate(city, '2024-10-05').candleNote.includes('מאש קיימת'))
  assert.equal(holidayCandles(city, '2024-12-24', '2025-01-02').length, 0, 'Hanukkah is not festival candle lighting')
})

test('monthly sheet includes all Saturdays and holiday eves, with explicit civil dates', () => {
  const city = shabbatCity('netanya'), sheet = monthlySheet(city, '2024-10')
  assert.deepEqual(sheet.shabbatot.map(s => s.saturday), ['2024-10-05', '2024-10-12', '2024-10-19', '2024-10-26'])
  assert.equal(sheet.holidays.length, 5)
  assert.equal(monthlySheet(city, '2025-03').shabbatot.length, 5)
  assert.equal(monthlySheet(city, '2025-02').end, '2025-02-28')
  assert.equal(monthlySheet(city, '2024-02').end, '2024-02-29')
  for (const invalid of ['', '2025-13', '1999-12', '2100-01', '2199-12', 'invalid']) assert.equal(monthlySheet(city, invalid), null)
})

test('every city URL is in the sitemap and the route family rejects unknown slugs', () => {
  const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  for (const path of ['/shabbat-times', ...SHABBAT_CITIES.map(c => `/shabbat-times/${c.slug}`)]) assert.equal(sitemap.split(`<loc>https://ugabuga.co.il${path}</loc>`).length - 1, 1, path)
  const middleware = readFileSync(new URL('../functions/_middleware.js', import.meta.url), 'utf8')
  assert.ok(middleware.includes('/^\\/shabbat-times\\/[^/]+$/'))
})
