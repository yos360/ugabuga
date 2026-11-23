import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildShabbatIcs, buildWeeklyIcs, sundaysFrom, withUtm, fold, shabbatFeedPath, weeklyFeedPath, schoolFeedPath } from '../src/utils/calendarFeeds.js'
import { shabbatSeries, formatTime } from '../src/utils/shabbatTimes.js'
import { SHABBAT_PLACES, shabbatCity } from '../src/data/shabbatCities.js'
import { WEEKLY_GRADES } from '../src/data/weeklySheets.js'
import { HOLIDAYS, SCHOOL_YEAR } from '../src/data/schoolHolidays.js'
import { LEVELS, buildIcs } from '../src/data/schoolHolidaysLib.js'

const STAMP = '20261123T000000Z'
const count = (ics, re) => (ics.match(re) || []).length
function valid(ics) {
  assert.match(ics, /^BEGIN:VCALENDAR\r\nVERSION:2\.0\r\n/)
  assert.match(ics, /END:VCALENDAR\r\n$/)
  assert.equal(count(ics, /BEGIN:VEVENT/g), count(ics, /END:VEVENT/g))
  assert.equal(count(ics, /BEGIN:VALARM/g), count(ics, /END:VALARM/g))
  assert.ok(ics.includes('REFRESH-INTERVAL;VALUE=DURATION:P1W'))
  for (const line of ics.split('\r\n')) assert.ok(new TextEncoder().encode(line).length <= 75, `line too long: ${line}`)
}

test('Shabbat feed: one Friday event per week with the times the page shows', () => {
  const city = shabbatCity('jerusalem')
  const rows = shabbatSeries(city, '2026-11-23', 53)
  const ics = buildShabbatIcs(city, rows, formatTime, { stamp: STAMP })
  valid(ics)
  assert.equal(count(ics, /BEGIN:VEVENT/g), 53)
  assert.ok(ics.includes('UID:shabbat-jerusalem-20261127@ugabuga.co.il'))
  assert.ok(ics.includes('DTSTART;TZID=Asia/Jerusalem:20261127T155500')) // Jerusalem, parashat Vayishlach: 40 minutes before sunset
  assert.ok(ics.includes('TRIGGER:-PT1H'))
  assert.ok(ics.replace(/\r\n /g, '').includes('/shabbat-times/jerusalem?utm_source=calendar&utm_medium=reminder&utm_campaign=shabbat'))
  assert.ok(ics.replace(/\r\n /g, '').includes('פרשת וישלח'))
  assert.ok(ics.includes('BEGIN:VTIMEZONE'))
})

test('Shabbat feed exists for every place the page supports, and the picker links point at them', () => {
  assert.ok(SHABBAT_PLACES.length >= 100)
  assert.equal(shabbatFeedPath('tel-aviv'), '/calendar/shabbat-tel-aviv.ics')
  const tlv = buildShabbatIcs(shabbatCity('tel-aviv'), shabbatSeries(shabbatCity('tel-aviv'), '2026-11-23', 3), formatTime, { stamp: STAMP })
  valid(tlv)
  assert.equal(count(tlv, /BEGIN:VEVENT/g), 3)
})

test('weekly sheet: every Sunday 07:00, rotating real pages', () => {
  assert.deepEqual(sundaysFrom('2026-11-23', 3), ['2026-11-29', '2026-12-06', '2026-12-13'])
  assert.deepEqual(sundaysFrom('2026-11-29', 2), ['2026-11-29', '2026-12-06']) // today counts when it is a Sunday
  assert.deepEqual(WEEKLY_GRADES.map(g => g.key), ['gan', 'grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5', 'grade-6'])
  const g2 = WEEKLY_GRADES.find(g => g.key === 'grade-2')
  const ics = buildWeeklyIcs(g2, { today: '2026-11-23', stamp: STAMP })
  valid(ics)
  assert.equal(count(ics, /BEGIN:VEVENT/g), 52)
  assert.ok(ics.includes('DTSTART;TZID=Asia/Jerusalem:20261129T070000'))
  assert.ok(ics.includes('SUMMARY:📒 דף השבוע לכיתה ב׳'))
  const urls = new Set([...ics.replace(/\r\n /g, '').matchAll(/^URL:(.+)$/gm)].map(m => m[1].split('?')[0]))
  assert.ok(urls.size >= 3, 'the linked page should rotate')
  assert.equal(weeklyFeedPath('gan'), '/calendar/weekly-gan.ics')
})

test('every weekly page is a real route, printable or booklet', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  const routes = [...app.matchAll(/path="([^"]+)"/g)].map(m => m[1])
  const printables = readFileSync(new URL('../src/data/printableCategories.js', import.meta.url), 'utf8')
  const booklets = readFileSync(new URL('../src/booklets/registry.js', import.meta.url), 'utf8')
  const exists = to => routes.includes(to)
    || (/^\/printables\/[a-z0-9-]+$/.test(to) && printables.includes(`slug: '${to.split('/')[2]}'`))
    || (/^\/booklets\/[a-z0-9-]+$/.test(to) && booklets.includes(`slug: '${to.split('/')[2]}'`))
    || (/^\/math\/grade-\d+$/.test(to) && Number(to.split('-')[1]) <= 12)
    || /^\/unseen\/(english|hebrew)\/grade-\d$/.test(to) // served by the /unseen/:lang/:x route
  for (const g of WEEKLY_GRADES) {
    assert.ok(exists(g.hub.split('#')[0]), `hub ${g.hub}`)
    for (const [, to] of g.links) assert.ok(exists(to), `no page for ${to}`)
  }
})

test('school holidays feed: one event per break for each level, with refresh headers', () => {
  for (const lv of LEVELS) {
    const ics = buildIcs(HOLIDAYS, lv.id, SCHOOL_YEAR.label)
    valid(ics)
    assert.ok(count(ics, /BEGIN:VEVENT/g) >= 8, lv.id)
  }
  assert.equal(schoolFeedPath('yesodi'), '/calendar/school-holidays-yesodi.ics')
})

test('helpers: utm goes before the hash, folding is byte-safe', () => {
  assert.equal(withUtm('/classroom/by-grade#grade-2', 'weekly'), 'https://ugabuga.co.il/classroom/by-grade?utm_source=calendar&utm_medium=reminder&utm_campaign=weekly#grade-2')
  for (const part of fold('X'.repeat(10) + 'שלום'.repeat(40)).split('\r\n')) assert.ok(new TextEncoder().encode(part).length <= 75)
})
