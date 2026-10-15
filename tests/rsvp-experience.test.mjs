import test from 'node:test'
import assert from 'node:assert/strict'
import { isRsvpV2, rsvpTheme, filterResponses, responseCsv, eventCalendar } from '../src/utils/rsvpExperience.js'

test('only an explicit server version enables the new UI', () => {
  for (const ev of [null, {}, { theme:'party' }, { ui_version:1 }, { ui_version:'2' }]) assert.equal(isRsvpV2(ev), false)
  assert.equal(isRsvpV2({ ui_version:2 }), true)
  assert.equal(rsvpTheme('unknown').id, 'party')
})
test('response filters preserve source data and distinguish nonattending allergies', () => {
  const rows = [{name:'יואב', status:'no', allergies:'חלב'}, {name:'נועה',status:'yes',allergies:'בוטנים'}, {name:'נועה לוי', status:'maybe',allergies:''}]
  const before = JSON.stringify(rows)
  assert.equal(filterResponses(rows, 'allergies').length, 1)
  assert.equal(filterResponses(rows, 'all', 'נועה').length, 2)
  assert.equal(filterResponses(rows, 'yes', 'יואב').length, 0)
  assert.equal(JSON.stringify(rows), before)
})
test('CSV preserves Hebrew, quotes and newlines and neutralizes formulas', () => {
  const csv = responseCsv([{name:'=1+1',status:'yes',kids:1,adults:0,note:'שלום,"עולם"\nשורה שנייה',allergies:' @SUM(1)'}], {yes:{label:'מגיעים'}})
  assert.ok(csv.startsWith('\uFEFF'))
  assert.ok(csv.includes('"\'=1+1"'))
  assert.ok(csv.includes('"\' @SUM(1)"'))
  assert.ok(csv.includes('"שלום,""עולם""\nשורה שנייה"'))
})
test('calendar supports Israel timezone, overnight events and UTF-8 folding', () => {
  const text = eventCalendar({ code:'example',title:'יום הולדת שמח '.repeat(10),date:'2026-10-15',time:'23:00–01:00',place:'כאן,שם',note:'א\nב'}, new Date('2026-10-15T10:00:00Z'))
  assert.ok(text.includes('DTSTART;TZID=Asia/Jerusalem:20261015T230000'))
  assert.ok(text.includes('DTEND;TZID=Asia/Jerusalem:20261016T010000'))
  assert.ok(text.includes('DTSTAMP:20261015T100000Z'))
  for (const line of text.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75)
  assert.ok(eventCalendar({date:'2026-12-31',code:'all-day'}).includes('DTEND;VALUE=DATE:20270101'))
  assert.equal(eventCalendar({}), null)
})
