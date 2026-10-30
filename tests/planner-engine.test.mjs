import test from 'node:test'
import assert from 'node:assert/strict'
import { lessonAt, lessonIndex, weekPlan, emptyPlan } from '../src/data/planner/engine.js'
import { noSchool, weekStart } from '../src/data/planner/schoolYear.js'

const seq = { subject: 'math', grade: 3, units: [
  { id: 'a', title: 'A', hours: 2, goals: ['g'], steps: [{ title: 'a1' }, { title: 'a2' }] },
  { id: 'b', title: 'B', hours: 4, goals: ['g'], steps: [{ title: 'b1' }, { title: 'b2' }] },
] }
const cls = { id: 'c1', subject: 'math', grade: 3 }
// Sunday and Tuesday, period 2.
const plan = () => ({ ...emptyPlan(), classes: [cls], slots: { '0-2': 'c1', '2-2': 'c1' } })

test('school year: holidays, Shabbat and the end of the year have no school', () => {
  assert.equal(noSchool('2026-09-01'), null)
  assert.ok(noSchool('2026-09-12'))          // Rosh Hashana
  assert.ok(noSchool('2026-12-08'))          // Hanukkah break
  assert.ok(noSchool('2026-09-05'))          // Shabbat
  assert.ok(noSchool('2027-06-25', { level: 'secondary' }))
  assert.equal(noSchool('2027-06-25', { level: 'elementary' }), null)
  assert.equal(weekStart('2026-09-03'), '2026-08-30')
})

test('lessons are counted from the first school day, skipping holidays', () => {
  assert.equal(lessonIndex(plan(), cls, '2026-09-01', 2), 0) // Tue 1.9: first lesson
  assert.equal(lessonIndex(plan(), cls, '2026-09-06', 2), 1) // Sun 6.9: second
  assert.equal(lessonIndex(plan(), cls, '2026-09-15', 2), 3) // Tue 15.9: Sun 13.9 was Rosh Hashana
  const p = plan(); p.shifts.c1 = 2
  assert.equal(lessonIndex(p, cls, '2026-09-01', 2), 2)
})

test('the lesson at an index walks the units by their hours', () => {
  assert.equal(lessonAt(seq, 0).unit.id, 'a')
  assert.equal(lessonAt(seq, 1).step.title, 'a2')
  assert.equal(lessonAt(seq, 2).unit.id, 'b')
  assert.equal(lessonAt(seq, 2).k, 1)
  assert.equal(lessonAt(seq, 5).step.title, 'b2')
  assert.equal(lessonAt(seq, 6), null)
})

test('a week shows each period with its lesson, or the holiday', () => {
  const w = weekPlan(plan(), { 'math-3': seq }, '2026-09-06')
  assert.equal(w[0].periods[0].lesson.step.title, 'a2')
  const rh = weekPlan(plan(), { 'math-3': seq }, '2026-09-13')
  assert.ok(rh[0].periods[0].why) // Sun 13.9 Rosh Hashana
})
