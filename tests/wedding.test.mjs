import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { STAGES, WEDDING_TASKS, BUDGET_ITEMS, DAY_SCHEDULE, SUPPLIERS, daysUntil, tasksByStage, expectedGuests, weddingBudget, addMinutes, daySchedule, scheduleText, planToLink, planFromHash } from '../src/pages/wedding/weddingPlan.js'
import { DEFAULT_SEATS, autoSeat, partySize, tableLoads, tablesNeeded } from '../src/utils/seating.js'
import { parsePhoneBook, waNumber, phoneFor, personalReminder, waLink } from '../src/utils/personalReminders.js'
import { INVITATION_OCCASIONS, INVITATION_THEMES, invitationText } from '../src/utils/invitationDesign.js'
import { LIMITS, parseNames, guestPicks } from '../src/utils/groupTools.js'

const now = new Date(2026, 10, 5)

test('wedding plan: days until the date, null without one', () => {
  assert.equal(daysUntil('2026-11-15', now), 10)
  assert.equal(daysUntil('2026-11-05', now), 0)
  assert.equal(daysUntil('', now), null)
  assert.equal(daysUntil('15/11/2026', now), null)
})

test('wedding plan: exactly one current stage, earlier stages marked late', () => {
  for (const [date, current] of [['2028-01-01', 'year'], ['2027-05-01', 'm6'], ['2026-11-20', 'm1'], ['2026-11-09', 'week'], ['2026-11-05', 'day'], ['2026-10-01', 'day']]) {
    const stages = tasksByStage(date, now)
    assert.deepEqual(stages.filter(s => s.now).map(s => s.id), [current], date)
    const i = stages.findIndex(s => s.now)
    assert.ok(stages.slice(0, i).every(s => s.late) && stages.slice(i).every(s => !s.late), date)
  }
  assert.ok(tasksByStage('', now).every(s => !s.now && !s.late))
})

test('wedding plan: every task belongs to a stage, ids are unique', () => {
  const ids = new Set(STAGES.map(s => s.id))
  assert.ok(WEDDING_TASKS.every(t => ids.has(t.stage)))
  assert.equal(new Set(WEDDING_TASKS.map(t => t.id)).size, WEDDING_TASKS.length)
})

test('how many will come: rates per group, Friday lower, venue minimum below the estimate', () => {
  const r = expectedGuests({ close: 100, friends: 100, work: 100 })
  assert.equal(r.invited, 300)
  assert.equal(r.expected, 245)
  assert.ok(r.low < r.expected && r.high > r.expected)
  assert.ok(expectedGuests({ close: 100, friends: 100, work: 100 }, 'friday').expected < r.expected)
  assert.deepEqual(expectedGuests({ close: '-5', far: 'x' }), { invited: 0, expected: 0, low: 0, high: 0, rate: 0 })
})

test('wedding budget: food by guests, typical prices by default, paid capped, gifts balance', () => {
  const r = weddingBudget({ guests: 200, perPlate: 300, gift: 400 })
  assert.equal(r.food, 60000)
  assert.equal(r.suppliers, BUDGET_ITEMS.reduce((s, b) => s + b.typical, 0))
  assert.equal(r.total, r.food + r.suppliers)
  assert.equal(r.gifts, 80000)
  assert.equal(r.balance, 80000 - r.total)
  const p = weddingBudget({ guests: 100, perPlate: 0, items: { photo: { cost: '9000', paid: '20000' }, music: { cost: '' } } })
  assert.equal(p.lines.find(l => l.id === 'photo').cost, 9000)
  assert.equal(p.lines.find(l => l.id === 'music').cost, BUDGET_ITEMS.find(b => b.id === 'music').typical)
  assert.equal(p.paid, 9000)
  assert.equal(weddingBudget({ guests: -3, perPlate: 'x' }).perGuest, 0)
})

test('day schedule: built from the chuppah, hand-set rows kept, past midnight stays in order', () => {
  assert.equal(addMinutes('23:30', 60), '00:30')
  assert.equal(addMinutes('00:10', -30), '23:40')
  const rows = daySchedule('20:00')
  assert.equal(rows.length, DAY_SCHEDULE.length)
  assert.equal(rows.find(r => r.id === 'reception').time, '18:30')
  assert.deepEqual(rows.map(r => r.id), DAY_SCHEDULE.map(s => s.id))
  const late = daySchedule('21:30').map(r => r.time)
  assert.equal(late.at(-1), '02:00')
  const moved = daySchedule('20:00', { reception: '19:45', chuppah: '10:00', main: 'x' })
  assert.equal(moved.find(r => r.id === 'chuppah').time, '20:00')
  assert.equal(moved.find(r => r.id === 'main').time, '22:00')
  assert.ok(moved.findIndex(r => r.id === 'reception') > moved.findIndex(r => r.id === 'sign'))
  assert.equal(daySchedule('').find(r => r.id === 'chuppah').time, '20:00')
})

test('day schedule: each supplier gets only their rows', () => {
  const rows = daySchedule('20:00')
  const known = new Set(SUPPLIERS.map(s => s.id))
  assert.ok(DAY_SCHEDULE.every(s => s.who.every(w => known.has(w))))
  assert.match(scheduleText(rows), /18:30 קבלת פנים נפתחת[\s\S]*20:00 חופה/)
  assert.match(scheduleText(rows), /איפור ושיער/)
  assert.match(scheduleText(rows, '', '5.11'), /עדכון 5\.11/)
  const photo = scheduleText(rows, 'photo')
  assert.doesNotMatch(photo, /מנה עיקרית|איפור ושיער/)
  assert.match(photo, /צילומי זוג/)
})

const reply = (id, name, adults = 2, kids = 0) => ({ id, name, adults, kids })

test('seating: everyone fits, families stay whole, no table overfilled', () => {
  const replies = [reply('a', 'משפחת כהן', 6), reply('b', 'דנה כהן', 3), reply('c', 'יואב לוי', 5), reply('d', 'נועה', 4), reply('e', 'אורי', 2), reply('f', 'טל', 8)]
  const { seats, left } = autoSeat(replies, {}, 3, 10)
  assert.deepEqual(left, [])
  assert.equal(Object.keys(seats).length, 6)
  assert.equal(seats.a, seats.b)
  const marks = Object.fromEntries(Object.entries(seats).map(([id, table]) => [id, { table }]))
  assert.ok(tableLoads(replies, marks, 3).every(n => n <= 10))
  assert.deepEqual(autoSeat(replies, {}, 3, 10), autoSeat([...replies], {}, 3, 10))
})

test('seating: nobody already seated moves, and their places count', () => {
  const replies = [reply('a', 'רון', 10), reply('b', 'גיל', 3), reply('c', 'מור', 9)]
  const { seats, left } = autoSeat(replies, { a: { table: 2 } }, 2, 12)
  assert.equal(seats.a, undefined)
  assert.equal(seats.c, 1)
  assert.equal(seats.b, 1)
  assert.deepEqual(left, [])
})

test('seating: groups sit together, first name alone is not a family', () => {
  const replies = [reply('a', 'רון א', 4), reply('b', 'גיל ב', 4), reply('c', 'מור ג', 4), reply('d', 'שי ד', 4)]
  const marks = { a: { group: 'חברים' }, b: { group: 'עבודה' }, c: { group: 'חברים' }, d: { group: 'עבודה' } }
  const { seats } = autoSeat(replies, marks, 2, 8)
  assert.equal(seats.a, seats.c)
  assert.equal(seats.b, seats.d)
  assert.notEqual(seats.a, seats.b)
  const named = autoSeat([reply('x', 'דנה', 6), reply('y', 'דנה', 6)], {}, 2, 8).seats
  assert.notEqual(named.x, named.y)
})

test('seating: a big family splits only when it must, what cannot fit is reported', () => {
  const big = [reply('a', 'שרה כהן', 6), reply('b', 'משה כהן', 6), reply('c', 'רות כהן', 6)]
  const r = autoSeat(big, {}, 2, 12)
  assert.deepEqual(r.left, [])
  assert.equal(new Set(Object.values(r.seats)).size, 2)
  assert.deepEqual(autoSeat([reply('a', 'רון', 14)], {}, 3, 12), { seats: {}, left: ['a'] })
  assert.deepEqual(autoSeat([reply('a', 'רון')], {}, 0, 12), { seats: {}, left: ['a'] })
  assert.equal(partySize({ kids: 0, adults: 0 }), 1)
  assert.equal(tablesNeeded(25, 12), 3)
  assert.equal(tablesNeeded(0), 0)
  assert.equal(DEFAULT_SEATS, 12)
})

test('seating database: table number and group checked, organizer only', () => {
  const sql = readFileSync(new URL('../supabase/migrations/202611050002_rsvp_smart_seating.sql', import.meta.url), 'utf8')
  assert.match(sql, /add column if not exists grp/)
  assert.match(sql, /rsvp_seat_many[\s\S]*rsvp_host_find/)
  assert.match(sql, /jsonb_build_object\('seats', n::int\)/)
  for (const key of ['type', 'lang', 'parking', 'price', 'currency', 'pay_link', 'tables', 'show_table']) assert.ok(sql.includes(`jsonb_build_object('${key}'`), key)
})

test('wedding limits: a full list can answer, the page promises what the database allows', () => {
  const sql = readFileSync(new URL('../supabase/migrations/202611050003_rsvp_wedding_capacity.sql', import.meta.url), 'utf8')
  assert.match(sql, />= 1000 then/)
  assert.match(sql, /gt_rate_check\('rsvp_answer', 120, 10000\)/)
  const page = readFileSync(new URL('../src/pages/wedding/WeddingPages.jsx', import.meta.url), 'utf8') + readFileSync(new URL('../src/utils/rsvpTypes.js', import.meta.url), 'utf8')
  assert.doesNotMatch(page, /אין הגבלה על מספר האורחים|בלי הגבלה על מספר האורחים/)
})

test('wedding invitation: only wedding styles and wedding examples', () => {
  const w = INVITATION_OCCASIONS.wedding
  const ids = new Set(INVITATION_THEMES.map(t => t.id))
  assert.ok(w.themes.length >= 3 && w.themes.every(t => ids.has(t)) && w.themes.includes('elegant'))
  for (const kids of ['dino', 'gaming', 'football', 'balloons']) assert.ok(!w.themes.includes(kids))
  assert.doesNotMatch(JSON.stringify(w), /יום הולדת|גן השעשועים|החוגג/)
})

test('plan link: stays short with a full plan, carries no guests or phones', () => {
  const plan = { date: '2027-06-03', day: 'friday', done: Object.fromEntries(WEDDING_TASKS.map(t => [t.id, true])),
    counts: { close: '100', far: '100', friends: '100', work: '50', abroad: '20' },
    budget: { guests: '350', perPlate: '320', gift: '400', items: Object.fromEntries(BUDGET_ITEMS.map(b => [b.id, { cost: '12000', paid: '3000' }])) },
    schedule: { chuppah: '20:00', times: Object.fromEntries(DAY_SCHEDULE.map(s => [s.id, '19:45'])) } }
  assert.ok(planToLink(plan, 'https://ugabuga.co.il').length < 3000)
  // Guests and their phones belong to the RSVP event and its device storage, never to this plan.
  const source = readFileSync(new URL('../src/pages/wedding/WeddingPages.jsx', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /invitees|parsePhoneBook|loadPhoneText/)
})

test('plan link: round trip, bad links ignored', () => {
  const plan = { date: '2027-06-03', done: { venue: true }, budget: { guests: '250', items: { photo: { cost: '9000' } } } }
  const link = planToLink(plan, 'https://ugabuga.co.il')
  assert.ok(link.startsWith('https://ugabuga.co.il/wedding#plan='))
  assert.deepEqual(planFromHash(link.slice(link.indexOf('#'))), plan)
  assert.equal(planFromHash('#budget'), null)
  assert.equal(planFromHash('#plan=%7Bbroken'), null)
  assert.equal(planFromHash('#plan=%5B1%5D'), null)
})

test('personal reminders: phone book from pasted lines, Israeli numbers to wa.me', () => {
  assert.equal(waNumber('050-123-4567'), '972501234567')
  assert.equal(waNumber('+972 52 765 4321'), '972527654321')
  assert.equal(waNumber('123'), null)
  const book = parsePhoneBook('נועה כהן 050-1234567\n052-7654321 - יואב\nבלי טלפון')
  assert.deepEqual(book, { 'נועה כהן': '972501234567', 'יואב': '972527654321' })
  assert.equal(phoneFor(book, 'נועה כהן'), '972501234567')
  assert.equal(phoneFor(book, 'יואב לוי'), '972527654321')
  assert.equal(phoneFor(book, 'אורי'), null)
  const msg = personalReminder('נועה כהן', { title: 'החתונה של דנה ורון', date: '2027-06-03' }, 'https://ugabuga.co.il/r/abc123')
  assert.match(msg, /^היי נועה!/)
  assert.match(msg, /החתונה של דנה ורון ביום חמישי 3\.6/)
  assert.ok(waLink('972501234567', msg).startsWith('https://wa.me/972501234567?text=%D7%94'))
})

test('guest list: pasted phones stripped from names, wedding-size list, picks by typing', () => {
  assert.deepEqual(parseNames('נועה כהן 050-1234567\n052-7654321 - יואב\n1. דנה\n+972 54 111 2233 | אורי', LIMITS.maxInvitees), ['נועה כהן', 'יואב', 'דנה', 'אורי'])
  assert.ok(LIMITS.maxInvitees >= 300)
  const many = Array.from({ length: 300 }, (_, i) => `אורח ${i}`).concat(['נועה כהן', 'נועם לוי'])
  assert.deepEqual(guestPicks(['נועה', 'יואב'], ''), ['נועה', 'יואב'])
  assert.deepEqual(guestPicks(many, ''), [])
  assert.deepEqual(guestPicks(many, 'נוע'), ['נועה כהן', 'נועם לוי'])
  assert.deepEqual(guestPicks(many, 'נועה כהן'), [])
  assert.equal(guestPicks(many, 'אורח').length, 8)
})

test('wedding invitation: wedding wording, no age', () => {
  assert.ok(INVITATION_OCCASIONS.wedding.noAge)
  const text = invitationText({ occasion: 'wedding', name: 'נועה ואורי', date: 'חמישי, 3.6', time: '19:30', place: 'גן האירועים' })
  assert.match(text, /^הוזמנתם לחתונה של נועה ואורי!/)
  assert.doesNotMatch(text, /יום ההולדת/)
})
