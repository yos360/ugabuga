import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { HDate, HebrewCalendar } from '@hebcal/core'
import { PARASHOT, PARASHA_BOOKS, parashaSource } from '../src/data/parashot.js'
import { civilDate, israelToday, readingForDate } from '../src/utils/parashaCalendar.js'

// Independent published Israeli calendar, fetched 2026-10-14. Exact source URLs,
// retrieval date, HTML SHA-256 and ALL reference values are in the fixture.
// https://calendar.2net.co.il/parasha.aspx?city=נתניה&hyear=5784
// https://calendar.2net.co.il/parasha.aspx?city=נתניה&hyear=5785
const reference = JSON.parse(readFileSync(new URL('./fixtures/parasha-israel-calendar.json', import.meta.url)))
const normalize = s => s.replaceAll(' – ', ' ').replace('מטות ומסעי', 'מטות מסעי').replace('ניצבים', 'נצבים').replace('פינחס', 'פנחס').replace('יום הכיפורים', 'יום כיפור')
for (const year of reference) test(`every Shabbat of ${year.year} matches published 2net Israel calendar (${year.rows.length} dates)`, () => {
  const start = new HDate(1, 7, year.year), end = new HDate(1, 7, year.year + 1)
  const dates = []
  for (let abs = start.abs(); abs < end.abs(); abs++) { const hd = new HDate(abs); if (hd.getDay() === 6) dates.push(civilDate(hd.greg())) }
  assert.deepEqual(year.rows.map(r => r.date), dates, 'reference must cover every Shabbat, including holidays')
  for (const row of year.rows) {
    const actual = readingForDate(row.date)
    assert.equal(actual.date, row.date)
    const expected = row.reading === 'שמחת תורה' ? 'שמיני עצרת ושמחת תורה' : row.reading
    const name = actual.name.startsWith('שבת חל המועד') || actual.name.startsWith('שבת חול המועד') ? 'שבת חול המועד' : actual.name
    assert.equal(normalize(name), normalize(expected), `${row.date}: ${year.source}`)
  }
})

test('Israel schedule differs from diaspora on 23 May 2026, as published in the 5786 Israel calendar', () => {
  // https://calendar.2net.co.il/parasha.aspx?city=נתניה&hyear=5786: ז׳ בסיוון — נשא.
  assert.equal(readingForDate('2026-05-23').name, 'נשא')
  const hd = new HDate(new Date(2026, 4, 23, 12))
  assert.equal(HebrewCalendar.getSedra(5786, false).lookup(hd).chag, true)
})

test('holidays and doubled readings link the right portions', () => {
  assert.deepEqual(readingForDate('2024-09-28').portions.map(p => p.slug), ['nitzavim', 'vayelech'])
  assert.deepEqual(readingForDate('2023-10-07').portions.map(p => p.slug), ['vezot-haberakhah'])
  assert.equal(readingForDate('2023-09-16').portions.length, 0)
  assert.equal(readingForDate('2024-04-27').portions.length, 0)
  assert.equal(readingForDate('2025-04-19').name, 'שביעי של פסח')
})

test('Israel civil date, DST, Saturday and Sunday boundaries are explicit and host-independent', () => {
  assert.equal(israelToday(new Date('2026-10-17T20:59:59Z')), '2026-10-17')
  assert.equal(israelToday(new Date('2026-10-17T21:00:00Z')), '2026-10-18')
  assert.equal(israelToday(new Date('2026-12-05T21:59:59Z')), '2026-12-05')
  assert.equal(israelToday(new Date('2026-12-05T22:00:00Z')), '2026-12-06')
  assert.equal(readingForDate('2026-10-17').date, '2026-10-17')
  assert.equal(readingForDate('2026-10-18').date, '2026-10-24')
  for (const invalid of ['', 'bad', '2026-02-30', '2026-13-01', '2026-1-01', '1899-01-01', '2200-01-01']) assert.equal(readingForDate(invalid), null)
})

test('54 complete original portions have distinct slugs, ordered source ranges, and printable learning content', () => {
  const refs = JSON.parse(readFileSync(new URL('./fixtures/parasha-sefaria-ranges.json', import.meta.url)))
  assert.equal(PARASHOT.length, 54)
  assert.equal(new Set(PARASHOT.map(p => p.slug)).size, 54)
  assert.deepEqual(PARASHA_BOOKS.map(b => PARASHOT.filter(p => p.book === b).length), [12, 11, 10, 10, 11])
  assert.deepEqual(PARASHOT.map(p => p.ref), refs.refs)
  const seen = new Set()
  for (const p of PARASHOT) {
    assert.ok(p.paragraphs.length >= 3 && p.paragraphs.length <= 6, p.slug)
    for (const paragraph of p.paragraphs) { assert.ok(paragraph.length > 60, p.slug); assert.ok(!seen.has(paragraph), `reused paragraph ${p.slug}`); seen.add(paragraph) }
    assert.equal(p.questions.length, 5)
    for (const q of p.questions) { assert.ok(q.q.length > 8); assert.ok(q.a.length > 1) }
    assert.ok(p.discussion.endsWith('?'))
    assert.ok(parashaSource(p).startsWith('https://www.sefaria.org/'))
  }
})

test('all 55 URLs are discoverable and unknown portion slugs are a closed route family', () => {
  const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  for (const path of ['/parasha', ...PARASHOT.map(p => `/parasha/${p.slug}`)]) assert.equal(sitemap.split(`<loc>https://ugabuga.co.il${path}</loc>`).length - 1, 1, path)
  const middleware = readFileSync(new URL('../functions/_middleware.js', import.meta.url), 'utf8')
  assert.ok(middleware.includes('/^\\/parasha\\/[^/]+$/'))
})
