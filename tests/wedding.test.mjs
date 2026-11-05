import { test } from 'node:test'
import assert from 'node:assert/strict'
import { STAGES, WEDDING_TASKS, BUDGET_ITEMS, daysUntil, tasksByStage, expectedGuests, weddingBudget, planToLink, planFromHash } from '../src/pages/wedding/weddingPlan.js'
import { parsePhoneBook, waNumber, phoneFor, personalReminder, waLink } from '../src/utils/personalReminders.js'
import { INVITATION_OCCASIONS, invitationText } from '../src/utils/invitationDesign.js'
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
