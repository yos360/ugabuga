import test from 'node:test'
import assert from 'node:assert/strict'
import { newSession, restoreSession, attempt, replay, nextSession } from '../src/arcade/logic/brain/session.js'
import { puzzle, won } from '../src/arcade/logic/brain/catalog.js'
const finish = s => puzzle(s.kind, s.index).solution.reduce((state, action) => attempt(state, action), s)
test('reload preserves legal progress; completed puzzles cannot award twice', () => {
  let s = newSession('water'), p = puzzle('water', 0)
  s = attempt(s, p.solution[0])
  assert.deepEqual(restoreSession('water', JSON.parse(JSON.stringify(s))), s)
  for (const action of p.solution.slice(1)) s = attempt(s, action)
  assert.ok(won(p, replay(s))); assert.equal(s.score, 300)
  assert.deepEqual(attempt(s, p.solution[0]), s)
  assert.equal(nextSession(s).index, 1)
})
test('invalid saves and stale daily puzzles recover safely', () => {
  for (const bad of [null, {}, { ...newSession('water'), index: -1 }, { ...newSession('water'), actions: [{ from: 99, to: 0 }] }]) assert.equal(restoreSession('water', bad).actions.length, 0)
  const old = newSession('iq', { mode: 'daily', now: Date.parse('2026-10-19T08:00Z') })
  assert.notEqual(restoreSession('iq', old, Date.parse('2026-10-20T08:00Z')).day, old.day)
})
test('exam completes after exactly ten worlds; timed uses persisted absolute deadline', () => {
  let s = newSession('iq', { mode: 'exam' })
  for (let i = 0; i < 10; i++) s = nextSession(finish(s))
  assert.equal(s.completed, 10); assert.equal(s.ended, true); assert.equal(s.score, 3000)
  const timed = newSession('iq', { mode: 'timed', now: 1000 })
  assert.deepEqual(attempt(timed, puzzle('iq', timed.index).solution[0], 301000), timed)
  assert.equal(restoreSession('iq', timed, 500000).deadline, 301000)
})
test('streak ends on the first invalid action, and age changes exam selection', () => {
  const s = newSession('iq', { mode: 'streak' })
  assert.equal(attempt(s, { from: -1 }).ended, true)
  assert.notDeepEqual(newSession('iq', { mode: 'exam', age: '6-8' }).sequence, newSession('iq', { mode: 'exam', age: 'adult' }).sequence)
})
