import test from 'node:test'
import assert from 'node:assert/strict'
import { nextYearReminderDate, birthdayGoogleUrl, birthdayIcs, isBirthdayEvent } from '../src/utils/holidayCalendar.js'

test('reminder is date + 1 year - 30 days', () => {
  assert.equal(nextYearReminderDate('2026-12-15'), '2027-11-15')
  assert.equal(nextYearReminderDate('2026-03-10'), '2027-02-08')
  assert.equal(nextYearReminderDate('2026-01-10'), '2026-12-11')
})

test('Feb 29 maps to Feb 28 in a non-leap next year, and stays Feb 29 before a leap year', () => {
  assert.equal(nextYearReminderDate('2028-02-29'), '2029-01-29')
  assert.equal(nextYearReminderDate('2028-02-29', 0), '2029-02-28')
  assert.equal(nextYearReminderDate('2027-02-28', 0), '2028-02-28')
})

test('google link and ics carry no personal data and a VALARM', () => {
  const g = birthdayGoogleUrl('2026-12-15')
  assert.ok(g.startsWith('https://calendar.google.com/calendar/render?action=TEMPLATE'))
  assert.match(g, /dates=20271115%2F20271116/)
  assert.ok(decodeURIComponent(g).includes('utm_campaign=birthday'))
  const ics = birthdayIcs('2026-12-15', { stamp: '20261123T000000Z' })
  assert.match(ics, /DTSTART;VALUE=DATE:20271115/)
  assert.match(ics, /BEGIN:VALARM/)
  for (const l of ics.split('\r\n')) assert.ok(new TextEncoder().encode(l).length <= 75)
})

test('birthday detection', () => {
  assert.ok(isBirthdayEvent({ date: '2026-12-15', title: 'יום ההולדת של דנה', extras: {} }))
  assert.ok(isBirthdayEvent({ date: '2026-12-15', title: 'x', extras: { type: 'adult-birthday' } }))
  assert.ok(!isBirthdayEvent({ date: '', title: 'יום הולדת', extras: {} }))
  assert.ok(!isBirthdayEvent({ date: '2026-12-15', title: 'מסיבת כיתה', extras: { type: 'class-party' } }))
})
