// /tools/shifts: duty-roster scheduler — fairness, rules, locks, free-play edits, outputs
import { test } from 'node:test'
import assert from 'node:assert/strict'
const L = await import('../src/office/shifts/shiftLogic.js')

const START = '2026-11-01' // a Sunday
const people = n => Array.from({ length: n }, (_, i) => ({ id: `p${i}`, name: `חייל ${i + 1}`, note: '' }))
const plan = (preset, over = {}) => ({ ...L.planFromPreset(preset, START), ...over })
const run = (ppl, pl, cells, seed = 7) => {
  const out = L.schedule({ people: ppl, plan: pl, cells, seed })
  const slots = L.buildSlots(pl)
  return { out, slots, tot: L.totals(ppl, slots, out), conf: L.checkConflicts(ppl, pl, out, slots) }
}
const filled = (out, slots) => slots.every(s => out[s.key].every(c => c.p))

test('dates: weekday, ranges, formatting', () => {
  assert.equal(L.weekday(START), 0)
  assert.equal(L.addDays('2026-12-31', 1), '2027-01-01')
  assert.equal(L.dateRange(START, '2026-11-14').length, 14)
  assert.equal(L.dateRange(START, '2027-12-31').length, L.MAX_DAYS)
  assert.equal(L.fmtDate('2026-11-05'), '5.11')
  assert.deepEqual(L.dateRuns(new Set(['2026-11-03', '2026-11-01', '2026-11-02', '2026-11-07'])), ['1.11–3.11', '7.11'])
})

test('parsePeople: lines, notes, WhatsApp, Excel, numbering, commas, dedupe', () => {
  const got = L.parsePeople([
    '1. דני כהן - לא בימי שישי',
    '2) רוני: רק בוקר',
    '[12/10/2026, 09:14] משה לוי',
    'יוסי\tחופשה 12.11-15.11',
    '~ אבי 050-1234567',
    'דני כהן',
    '',
    'שרה, רחל, לאה',
    '7',
  ].join('\n'))
  assert.deepEqual(got.map(p => p.name), ['דני כהן', 'רוני', 'משה לוי', 'יוסי', 'אבי', 'שרה', 'רחל', 'לאה'])
  assert.equal(got[0].note, 'לא בימי שישי')
  assert.equal(got[1].note, 'רק בוקר')
  assert.equal(got[3].note, 'חופשה 12.11-15.11')
})

test('parseNote: days, weekends, only-shift, no-shift, dates and ranges', () => {
  const work = plan('work')
  const id = n => work.shifts.find(s => s.name === n).id
  let r = L.parseNote('לא בימי שישי', work)
  assert.deepEqual([...r.noDays], [5])
  r = L.parseNote('בלי סופ"ש', work)
  assert.deepEqual([...r.noDays].sort(), [5, 6])
  r = L.parseNote('רק בוקר', work)
  assert.deepEqual([...r.noShifts].sort(), [id('ערב'), id('לילה')].sort())
  r = L.parseNote('לא לילות', work)
  assert.deepEqual([...r.noShifts], [id('לילה')])
  r = L.parseNote('רק בימי ראשון ושני', work)
  assert.deepEqual([...r.noDays].sort(), [2, 3, 4, 5, 6])
  r = L.parseNote('חופשה 3.11-5.11, וגם 7.11', work)
  assert.deepEqual([...r.offDates].sort(), ['2026-11-03', '2026-11-04', '2026-11-05', '2026-11-07'])
  r = L.parseNote('מילואים 2-4.11', work)
  assert.deepEqual([...r.offDates].sort(), ['2026-11-02', '2026-11-03', '2026-11-04'])
  r = L.parseNote('מפקד צוות', work)
  assert.equal(r.noDays.size + r.noShifts.size + r.offDates.size, 0)
  assert.deepEqual(L.describeRules(L.parseNote('לא בשבת, לא לילה', work), work), ['לא בימי שבת', 'לא ב: לילה'])
})

test('kitchen duty, 12 soldiers, 2 weeks: full, fair (spread ≤ 1), no back-to-back days', () => {
  const ppl = people(12), pl = plan('kitchen')
  for (const seed of [1, 2, 3, 42, 99]) {
    const { out, slots, tot, conf } = run(ppl, pl, {}, seed)
    assert.equal(slots.length, 14)
    assert.ok(filled(out, slots))
    assert.ok(L.spread(tot) <= 1, `seed ${seed}: spread ${L.spread(tot)}`)
    assert.equal(tot.reduce((s, t) => s + t.count, 0), 28)
    assert.deepEqual(conf, {}, `seed ${seed}`)
  }
})

test('guards 4h: rest ≥ 8h between guards, fair', () => {
  const ppl = people(9), pl = plan('guard4')
  const { out, slots, tot, conf } = run(ppl, pl)
  assert.equal(slots.length, 42)
  assert.ok(filled(out, slots))
  assert.deepEqual(conf, {})
  assert.ok(L.spread(tot) <= 1)
  for (const p of ppl) {
    const mine = L.personDuties(p.id, slots, out)
    for (let i = 1; i < mine.length; i++) assert.ok(mine[i].startH - mine[i - 1].endH >= 8)
  }
})

test('work shifts: never night then morning; constraints respected', () => {
  const ppl = people(12)
  ppl[0].note = 'לא בימי שישי'
  ppl[1].note = 'רק בוקר'
  ppl[2].note = 'חופשה 3.11-5.11'
  ppl[3].rules = { noDays: [6], noShifts: [], offDates: [] }
  const pl = plan('work', { end: '2026-11-14' })
  for (let seed = 1; seed <= 10; seed++) {
  const { out, slots, tot, conf } = run(ppl, pl, {}, seed)
  assert.ok(filled(out, slots))
  assert.deepEqual(conf, {})
  const night = pl.shifts.find(s => s.name === 'לילה').id
  for (const s of slots) {
    const ids = out[s.key].map(c => c.p)
    if (s.dow === 5) assert.ok(!ids.includes('p0'))
    if (s.shift.name !== 'בוקר') assert.ok(!ids.includes('p1'))
    if (['2026-11-03', '2026-11-04', '2026-11-05'].includes(s.date)) assert.ok(!ids.includes('p2'))
    if (s.dow === 6) assert.ok(!ids.includes('p3'))
    if (s.shift.id === night) {
      const morning = slots.find(x => x.date === L.addDays(s.date, 1) && x.shift.name === 'בוקר')
      if (morning) for (const id of ids) assert.ok(!out[morning.key].some(c => c.p === id), 'night then morning')
    }
  }
  assert.ok(L.spread(tot) <= 1, `seed ${seed}: spread ${L.spread(tot)}`)
  }
})

test('impossible rules show up as red conflicts with a Hebrew reason', () => {
  const ppl = people(2).map(p => ({ ...p, note: 'לא בימי ראשון' }))
  const pl = { ...plan('kitchen'), end: START }
  const { out, conf } = run(ppl, pl)
  const key = L.slotKey(START, pl.shifts[0].id)
  assert.ok(out[key].every(c => c.p))
  assert.match(conf[`${key}#0`][0], /אין זמינות בימי ראשון/)
})

test('locks are kept when regenerating; unlocked ones reshuffle', () => {
  const ppl = people(12), pl = plan('kitchen')
  let { out } = run(ppl, pl, {}, 1)
  const k3 = L.slotKey('2026-11-03', 's1'), k9 = L.slotKey('2026-11-09', 's1')
  out = L.assignPerson(out, { key: k3, i: 0 }, 'p5')
  out = L.toggleLock(out, { key: k3, i: 0 })
  out = L.assignPerson(out, { key: k9, i: 1 }, 'p11')
  out = L.toggleLock(out, { key: k9, i: 1 })
  for (const seed of [2, 3, 4, 5]) {
    const again = L.schedule({ people: ppl, plan: pl, cells: out, seed })
    assert.deepEqual(again[k3][0], { p: 'p5', l: true })
    assert.deepEqual(again[k9][1], { p: 'p11', l: true })
    const tot = L.totals(ppl, L.buildSlots(pl), again)
    assert.ok(L.spread(tot) <= 1)
  }
  const a = L.schedule({ people: ppl, plan: pl, cells: out, seed: 2 })
  const b = L.schedule({ people: ppl, plan: pl, cells: out, seed: 3 })
  assert.notDeepEqual(a, b)
  assert.deepEqual(L.schedule({ people: ppl, plan: pl, cells: out, seed: 2 }), a)
})

test('moveChip: move to empty, swap with chip, same slot, locks travel with chip', () => {
  const cells = {
    A: [{ p: 'x', l: true }, { p: 'y', l: false }],
    B: [{ p: 'z', l: false }, { p: null, l: false }],
  }
  const moved = L.moveChip(cells, { key: 'A', i: 1 }, { key: 'B', i: 1 })
  assert.deepEqual(moved.A, [{ p: 'x', l: true }, { p: null, l: false }])
  assert.deepEqual(moved.B, [{ p: 'z', l: false }, { p: 'y', l: false }])
  assert.deepEqual(cells.A[1], { p: 'y', l: false }, 'input untouched')
  const swapped = L.moveChip(cells, { key: 'A', i: 0 }, { key: 'B', i: 0 })
  assert.deepEqual(swapped.A[0], { p: 'z', l: false })
  assert.deepEqual(swapped.B[0], { p: 'x', l: true })
  const inSlot = L.moveChip(cells, { key: 'A', i: 0 }, { key: 'A', i: 1 })
  assert.deepEqual(inSlot.A, [{ p: 'y', l: false }, { p: 'x', l: true }])
  assert.equal(L.moveChip(cells, { key: 'B', i: 1 }, { key: 'A', i: 0 }), cells, 'empty source: no-op')
  assert.equal(L.moveChip(cells, { key: 'A', i: 0 }, { key: 'A', i: 0 }), cells)
  assert.deepEqual(L.clearChip(cells, { key: 'A', i: 0 }).A[0], { p: null, l: false })
  assert.equal(L.toggleLock(cells, { key: 'B', i: 1 }), cells, 'cannot lock an empty spot')
})

test('a manual move that breaks a rule is flagged; swap back clears it', () => {
  const ppl = people(12), pl = plan('kitchen')
  const { out, slots } = run(ppl, pl)
  const s0 = slots[0], s1 = slots[1]
  const pid = out[s0.key][0].p
  const target = out[s1.key][0]
  const bad = L.moveChip(out, { key: s0.key, i: 0 }, { key: s1.key, i: 0 })
  // pid now on day 2; if pid's partner swapped onto day 1 nothing else changes, so add pid to day 1 too
  const both = L.assignPerson(bad, { key: s0.key, i: 0 }, pid)
  const conf = L.checkConflicts(ppl, pl, both, slots)
  assert.ok(Object.values(conf).flat().some(t => /יומיים ברצף/.test(t)))
  assert.equal(L.moveChip(bad, { key: s1.key, i: 0 }, { key: s0.key, i: 0 })[s1.key][0].p, target.p)
})

test('normalizeCells drops removed people and resizes slots', () => {
  const ppl = people(3), pl = plan('kitchen', { end: '2026-11-02' })
  const slots = L.buildSlots(pl)
  const cells = { [slots[0].key]: [{ p: 'p0', l: true }, { p: 'gone', l: true }, { p: 'p2', l: false }], junk: [{ p: 'p1' }] }
  const n = L.normalizeCells(slots, cells, ppl)
  assert.deepEqual(n[slots[0].key], [{ p: 'p0', l: true }, { p: null, l: false }])
  assert.deepEqual(n[slots[1].key], [{ p: null, l: false }, { p: null, l: false }])
  assert.equal(n.junk, undefined)
})

test('WhatsApp text: single shift is a line per day; several shifts get a header per day', () => {
  const ppl = [{ id: 'a', name: 'דני' }, { id: 'b', name: 'רוני' }]
  const pl = plan('kitchen', { end: '2026-11-02' })
  const cells = { [L.slotKey(START, 's1')]: [{ p: 'a' }, { p: 'b' }], [L.slotKey('2026-11-02', 's1')]: [{ p: 'b' }, { p: null }] }
  assert.equal(L.toWhatsApp({ title: 'מטבח פלוגה ב', plan: pl, people: ppl, cells }),
    '*מטבח פלוגה ב*\n1.11–2.11\n\n*א׳ 1.11* דני, רוני\n*ב׳ 2.11* רוני, ___')
  const w = plan('work', { end: START })
  const wc = L.schedule({ people: people(6), plan: w, seed: 1 })
  const txt = L.toWhatsApp({ title: '', plan: w, people: people(6), cells: wc })
  const lines = txt.split('\n')
  assert.equal(lines[0], '*משמרות בוקר/ערב/לילה*')
  assert.equal(lines[3], '*א׳ 1.11*')
  assert.match(lines[4], /^בוקר \(07:00\): חייל \d+, חייל \d+$/)
  assert.match(lines[6], /^לילה \(23:00\): חייל \d+$/)
  assert.equal(L.personText({ person: ppl[1], plan: pl, cells }), '*רוני — תורנות מטבח*\nא׳ 1.11 · מטבח (05:30)\nב׳ 2.11 · מטבח (05:30)\nסה״כ: 2')
})

test('CSV: BOM, header, quoted names, a row per day', () => {
  const ppl = [{ id: 'a', name: 'דני' }, { id: 'b', name: 'כהן, רוני' }]
  const pl = plan('kitchen', { end: '2026-11-02' })
  const csv = L.toCSV({ plan: pl, people: ppl, cells: { [L.slotKey(START, 's1')]: [{ p: 'a' }, { p: 'b' }] } })
  assert.ok(csv.startsWith('﻿תאריך,יום,מטבח (05:30)\r\n'))
  const rows = csv.slice(1).split('\r\n')
  assert.equal(rows.length, 3)
  assert.equal(rows[1], '1.11,ראשון,"דני, כהן, רוני"')
})

test('class cleaning skips Friday/Saturday; home chores: one chore a day each when possible', () => {
  const cls = plan('class')
  assert.ok(L.buildSlots(cls).every(s => s.dow <= 4))
  const kids = people(4), home = plan('home')
  const { out, slots, conf, tot } = run(kids, home)
  assert.ok(filled(out, slots))
  assert.ok(L.spread(tot) <= 1)
  // 3 chores a day, 4 kids, one per day each → possible, so no conflicts
  assert.deepEqual(conf, {})
})

test('scheduler copes with nobody / too few people', () => {
  const pl = plan('kitchen', { end: START })
  assert.deepEqual(L.schedule({ people: [], plan: pl })[L.slotKey(START, 's1')], [{ p: null, l: false }, { p: null, l: false }])
  const one = L.schedule({ people: people(1), plan: pl })[L.slotKey(START, 's1')]
  assert.equal(one.filter(c => c.p).length, 1)
})
