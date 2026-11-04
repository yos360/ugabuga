import { test } from 'node:test'
import assert from 'node:assert/strict'
import { STAGES, WEDDING_TASKS, daysUntil, tasksByStage } from '../src/pages/wedding/weddingPlan.js'
import { INVITATION_OCCASIONS, invitationText } from '../src/utils/invitationDesign.js'

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

test('wedding invitation: wedding wording, no age', () => {
  assert.ok(INVITATION_OCCASIONS.wedding.noAge)
  const text = invitationText({ occasion: 'wedding', name: 'נועה ואורי', date: 'חמישי, 3.6', time: '19:30', place: 'גן האירועים' })
  assert.match(text, /^הוזמנתם לחתונה של נועה ואורי!/)
  assert.doesNotMatch(text, /יום ההולדת/)
})
