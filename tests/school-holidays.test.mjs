import test from 'node:test'
import assert from 'node:assert/strict'
import { HOLIDAYS, HUB_COPY } from '../src/data/schoolHolidays.js'
import { LEVELS, rangeFor, nextBreak, countdown, buildIcs, dayCount, weekday, formatLong } from '../src/data/schoolHolidaysLib.js'

const heb = new Intl.DateTimeFormat('he-u-ca-hebrew', { day: 'numeric', month: 'long', timeZone: 'UTC' })
const hebOf = s => heb.format(new Date(s + 'T12:00:00Z'))

test('every entry has dates for every level, ordered and valid', () => {
  for (const b of HOLIDAYS) for (const l of LEVELS) {
    const r = rangeFor(b, l.id)
    assert.ok(r, `${b.slug} ${l.id}`)
    assert.match(r.from, /^\d{4}-\d{2}-\d{2}$/)
    assert.ok(r.from <= r.to, `${b.slug} order`)
    if (r.back) assert.ok(r.back > r.to, `${b.slug} back after end`)
  }
})

test('unique slugs; pages have SEO copy', () => {
  assert.equal(new Set(HOLIDAYS.map(b => b.slug)).size, HOLIDAYS.length)
  const titles = new Set()
  for (const b of HOLIDAYS.filter(x => x.page)) {
    for (const k of ['seoTitle', 'pageTitle', 'description', 'intro', 'teaser']) assert.ok(b[k], `${b.slug}.${k}`)
    assert.ok(b.description.length >= 100 && b.description.length <= 170, `${b.slug} description length ${b.description.length}`)
    assert.ok(b.faq.length >= 2 && b.about.length >= 2)
    assert.ok(!titles.has(b.seoTitle)); titles.add(b.seoTitle)
  }
  assert.ok(HUB_COPY.description.length <= 170)
})

test('key dates match the Hebrew calendar', () => {
  const r = id => rangeFor(HOLIDAYS.find(b => b.slug === id), 'yesodi')
  assert.equal(hebOf('2026-12-04'), '24 בכסלו') // first candle that evening
  assert.equal(weekday(r('hanukkah').from), 'ראשון')
  assert.equal(hebOf(r('purim').from), '14 באדר ב׳')
  assert.equal(hebOf('2027-04-22'), '15 בניסן')
  assert.equal(hebOf(r('pesach').to), '21 בניסן')
  assert.equal(hebOf(r('yom-haatzmaut').from), '5 באייר')
  assert.equal(hebOf(r('lag-baomer').from), '18 באייר')
  assert.equal(hebOf(r('shavuot').to), '6 בסיוון')
  assert.equal(dayCount(r('pesach').from, r('pesach').to), 16)
})

test('next break and countdown', () => {
  assert.equal(nextBreak(HOLIDAYS, 'yesodi', '2026-10-10').slug, 'hanukkah')
  assert.equal(nextBreak(HOLIDAYS, 'yesodi', '2026-12-08').slug, 'hanukkah')
  assert.equal(nextBreak(HOLIDAYS, 'al', '2027-06-21').slug, 'summer')
  const h = HOLIDAYS.find(b => b.slug === 'hanukkah')
  assert.deepEqual(countdown(h, 'gan', '2026-12-01'), { state: 'before', days: 5 })
  assert.deepEqual(countdown(h, 'gan', '2026-12-10'), { state: 'during', days: 2 })
  assert.equal(formatLong('2026-12-06'), 'יום ראשון, 6 בדצמבר 2026')
})

test('ics export has an all-day event per entry', () => {
  const ics = buildIcs(HOLIDAYS, 'gan', 'תשפ״ז')
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, HOLIDAYS.length)
  assert.match(ics, /DTSTART;VALUE=DATE:20261206\r\nDTEND;VALUE=DATE:20261213/)
})
