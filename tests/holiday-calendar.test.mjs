import test from 'node:test'
import assert from 'node:assert/strict'
import { buildReminderIcs, shiftDate } from '../src/utils/holidayCalendar.js'

const H = [
  { slug: 'purim', name: 'פורים', emoji: '🎭', path: '/holidays/purim', start: '2027-03-22T18:30:00+02:00', datesText: 'פורים, 23 במרץ' },
  { slug: 'rabin', name: 'יום הזיכרון ליצחק רבין', emoji: '🕯️', path: '/holidays/rabin', start: '2026-10-22T07:00:00+03:00', datesText: 'x', solemn: true },
]

test('shiftDate keeps the local date and crosses months', () => {
  assert.equal(shiftDate('2027-03-22T18:30:00+02:00', 7), '2027-03-15')
  assert.equal(shiftDate('2027-03-02', 30), '2027-01-31')
  assert.equal(shiftDate('2026-12-31', -1), '2027-01-01')
})

test('a week-ahead feed has one all-day reminder per future holiday', () => {
  const ics = buildReminderIcs(H, 'week', { today: '2026-11-23' })
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/)
  assert.match(ics, /END:VCALENDAR\r\n$/)
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 1) // Rabin 2026 is already past
  assert.match(ics, /DTSTART;VALUE=DATE:20270315/)
  assert.match(ics, /UID:purim-20270322-week@ugabuga\.co\.il/)
  assert.ok(ics.includes('utm_source=calendar'))
  for (const line of ics.split('\r\n')) assert.ok(new TextEncoder().encode(line).length <= 75, `line too long: ${line}`)
})

test('month lead and unknown lead', () => {
  assert.match(buildReminderIcs(H, 'month', { today: '2026-11-23' }), /DTSTART;VALUE=DATE:20270220/)
  assert.throws(() => buildReminderIcs(H, 'year'))
})
