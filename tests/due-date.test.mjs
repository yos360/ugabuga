// Pregnancy due-date calculator (/tools/due-date): Naegele, cycle shift, conception, IVF, gestational age.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const {
  dueDate, gestationalAge, trimesterOf, analyze, addDays, toDayNumber, clampCycle, offsetDays,
  formatDateHe, formatGA, MAX_DAYS,
} = await import('../src/utils/dueDate.js')

test('Naegele: LMP + 280 days (= +1 year − 3 months + 7 days)', () => {
  assert.equal(dueDate({ method: 'lmp', date: '2026-01-01' }), '2026-10-08')
  assert.equal(dueDate({ method: 'lmp', date: '2026-05-10' }), '2027-02-14')
  assert.equal(dueDate({ method: 'lmp', date: '2026-05-10', cycle: 28 }), '2027-02-14')
})

test('cycle length shifts the due date by (cycle − 28) days, clamped to 21–35', () => {
  assert.equal(dueDate({ method: 'lmp', date: '2026-01-01', cycle: 32 }), '2026-10-12')
  assert.equal(dueDate({ method: 'lmp', date: '2026-01-01', cycle: 25 }), '2026-10-05')
  assert.equal(clampCycle(50), 35)
  assert.equal(clampCycle(10), 21)
  assert.equal(clampCycle('abc'), 28)
  assert.equal(dueDate({ method: 'lmp', date: '2026-01-01', cycle: 60 }), '2026-10-15')
})

test('conception + 266, IVF transfer + 263 (day 3) / + 261 (day 5)', () => {
  assert.equal(offsetDays({ method: 'conception' }), 266)
  assert.equal(offsetDays({ method: 'ivf', embryoDay: 3 }), 263)
  assert.equal(offsetDays({ method: 'ivf', embryoDay: 5 }), 261)
  assert.equal(dueDate({ method: 'conception', date: '2026-05-15' }), '2027-02-05')
  assert.equal(dueDate({ method: 'ivf', date: '2026-06-15', embryoDay: 5 }), '2027-03-03')
  assert.equal(dueDate({ method: 'ivf', date: '2026-06-15', embryoDay: 3 }), '2027-03-05')
  // all methods agree when the dates line up: LMP → conception 14 days later → day-5 transfer 5 days after that
  const lmp = '2026-03-01'
  const due = dueDate({ method: 'lmp', date: lmp })
  assert.equal(dueDate({ method: 'conception', date: addDays(lmp, 14) }), due)
  assert.equal(dueDate({ method: 'ivf', date: addDays(lmp, 19), embryoDay: 5 }), due)
  assert.equal(dueDate({ method: 'ivf', date: addDays(lmp, 17), embryoDay: 3 }), due)
})

test('gestational age is counted back from the due date', () => {
  assert.deepEqual(gestationalAge('2026-10-08', '2026-01-01'), { total: 0, weeks: 0, days: 0 })
  assert.deepEqual(gestationalAge('2026-10-08', '2026-03-29'), { total: 87, weeks: 12, days: 3 })
  assert.deepEqual(gestationalAge('2026-10-08', '2026-10-08'), { total: 280, weeks: 40, days: 0 })
  // cycle adjustment moves gestational age too
  const due = dueDate({ method: 'lmp', date: '2026-01-01', cycle: 35 })
  assert.equal(gestationalAge(due, '2026-01-08').total, 0)
  assert.equal(formatGA({ weeks: 12, days: 3 }), 'שבוע 12 + 3 ימים')
  assert.equal(formatGA({ weeks: 20, days: 0 }), 'שבוע 20')
  assert.equal(formatGA({ weeks: 7, days: 1 }), 'שבוע 7 + יום אחד')
})

test('trimester boundaries: <14, 14–27, 28+', () => {
  assert.equal(trimesterOf(0), 1)
  assert.equal(trimesterOf(13), 1)
  assert.equal(trimesterOf(14), 2)
  assert.equal(trimesterOf(27), 2)
  assert.equal(trimesterOf(28), 3)
  assert.equal(trimesterOf(41), 3)
  const lmp = '2026-01-01'
  assert.equal(analyze({ date: lmp }, addDays(lmp, 13 * 7 + 6)).trimester, 1)
  assert.equal(analyze({ date: lmp }, addDays(lmp, 14 * 7)).trimester, 2)
  assert.equal(analyze({ date: lmp }, addDays(lmp, 28 * 7)).trimester, 3)
})

test('leap years: Feb 29 is counted and accepted as input', () => {
  // 2027-06-01 + 280 crosses Feb 29 2028 → Mar 7 (Naegele's month rule would say Mar 8)
  assert.equal(dueDate({ method: 'lmp', date: '2027-06-01' }), '2028-03-07')
  assert.equal(dueDate({ method: 'lmp', date: '2026-06-01' }), '2027-03-08')
  assert.equal(dueDate({ method: 'lmp', date: '2028-02-29' }), '2028-12-05')
  assert.equal(toDayNumber('2027-02-29'), null)
  assert.equal(toDayNumber('2026-13-01'), null)
  assert.equal(toDayNumber(''), null)
})

test('analyze: future dates, very old dates, overdue and prerender (no today)', () => {
  assert.equal(analyze({ date: '2026-10-11' }, '2026-10-10').status, 'future')
  assert.equal(analyze({ date: 'nope' }, '2026-10-10').status, 'invalid')
  assert.equal(analyze({ date: addDays('2026-10-10', -MAX_DAYS - 1) }, '2026-10-10').status, 'tooOld')
  const ok = analyze({ date: addDays('2026-10-10', -MAX_DAYS) }, '2026-10-10')
  assert.equal(ok.status, 'ok'); assert.equal(ok.overdue, 28); assert.equal(ok.remaining, 0); assert.equal(ok.progress, 100)
  const mid = analyze({ date: '2026-07-04' }, '2026-10-10')
  assert.equal(mid.status, 'ok'); assert.equal(mid.ga.weeks, 14); assert.equal(mid.remaining, 182); assert.equal(mid.progress, 35)
  const pre = analyze({ date: '2026-07-04' }, null)
  assert.equal(pre.status, 'ok'); assert.equal(pre.due, '2027-04-10'); assert.equal(pre.ga, undefined)
})

test('Hebrew date formatting includes the weekday', () => {
  assert.equal(formatDateHe('2026-10-08'), 'יום חמישי, 8 באוקטובר 2026')
  assert.equal(formatDateHe('2027-02-05'), 'יום שישי, 5 בפברואר 2027')
})
