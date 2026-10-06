// Printable calendars: Hebrew dates and Israeli holidays come from Intl's Hebrew calendar.
import { test } from 'node:test'
import assert from 'node:assert/strict'

const { gematria, hebrewParts, holidayMap, dayKey } = await import('../src/utils/hebrewCalendar.js')

test('gematria', () => {
  assert.equal(gematria(1), 'א׳')
  assert.equal(gematria(15), 'ט״ו')
  assert.equal(gematria(16), 'ט״ז')
  assert.equal(gematria(30), 'ל׳')
  assert.equal(gematria(5787), 'תשפ״ז')
})

test('hebrew date of a known day', () => {
  assert.deepEqual(hebrewParts(new Date(2026, 8, 12)), { day: 1, month: 'תשרי', year: 5787 })
})

test('holidays 2026–2027 (school year 5787)', () => {
  const map = holidayMap(new Date(2026, 8, 1), new Date(2027, 11, 31))
  const at = (y, m, d) => map.get(dayKey(new Date(y, m - 1, d)))
  assert.equal(at(2026, 9, 12), 'ראש השנה')
  assert.equal(at(2026, 9, 21), 'יום כיפור')
  assert.equal(at(2026, 12, 5), 'חנוכה א׳')
  assert.equal(at(2026, 12, 12), 'חנוכה ח׳')
  assert.equal(at(2027, 1, 23), 'ט״ו בשבט')
  assert.equal(at(2027, 3, 23), 'פורים')
  assert.equal(at(2027, 4, 22), 'פסח')
  assert.equal(at(2027, 5, 11), 'יום הזיכרון')
  assert.equal(at(2027, 5, 12), 'יום העצמאות')
  assert.equal(at(2027, 6, 11), 'שבועות')
})
