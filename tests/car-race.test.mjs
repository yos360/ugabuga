import test from 'node:test'
import assert from 'node:assert/strict'
import { startRace, stepRace, moveLane, makeRow, speedFor, scoreOf, PLAYER_Y, START_LIVES } from '../src/arcade/logic/carRace.js'

const seeded = seed => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296 }

test('car race: lane changes stay inside the three lanes', () => {
  let s = startRace()
  s = moveLane(moveLane(moveLane(s, 'left'), 'left'), 'left')
  assert.equal(s.lane, 0)
  s = moveLane(moveLane(moveLane(moveLane(s, 'right'), 'right'), 'right'), 'right')
  assert.equal(s.lane, 2)
})

test('car race: a spawn row never blocks all three lanes', () => {
  const rand = seeded(7)
  for (let i = 0; i < 500; i++) {
    const row = makeRow(rand, 1, i * 20)
    const blocked = new Set(row.filter(o => o.kind === 'obstacle').map(o => o.lane))
    assert.ok(blocked.size >= 1 && blocked.size <= 2)
    for (const o of row.filter(o => o.kind === 'star')) assert.ok(!blocked.has(o.lane), 'a star never sits inside an obstacle')
  }
})

test('car race: speed rises with distance, is capped, and the gentle mode is slower', () => {
  assert.ok(speedFor(2000) > speedFor(0))
  assert.equal(speedFor(1e9), 1.0)
  assert.ok(speedFor(1e9, true) < speedFor(1e9))
  assert.ok(speedFor(0, true) < speedFor(0))
})

test('car race: a star adds to the score, a crash costs a life with a short grace period', () => {
  const base = startRace()
  const star = stepRace({ ...base, objs: [{ id: 1, lane: 1, y: PLAYER_Y, kind: 'star', face: '⭐' }] }, 0.001, seeded(1))
  assert.equal(star.stars, 1)
  assert.ok(star.events.includes('star'))
  assert.ok(scoreOf(star) >= 10)
  const hit = stepRace({ ...base, objs: [{ id: 2, lane: 1, y: PLAYER_Y, kind: 'obstacle', face: '🚧' }] }, 0.001, seeded(1))
  assert.equal(hit.lives, START_LIVES - 1)
  const again = stepRace({ ...hit, objs: [{ id: 3, lane: 1, y: PLAYER_Y, kind: 'obstacle', face: '🚧' }] }, 0.001, seeded(1))
  assert.equal(again.lives, START_LIVES - 1, 'no second hit while the grace period lasts')
  const other = stepRace({ ...base, objs: [{ id: 4, lane: 0, y: PLAYER_Y, kind: 'obstacle', face: '🚧' }] }, 0.001, seeded(1))
  assert.equal(other.lives, START_LIVES, 'an obstacle in another lane is harmless')
})

test('car race: the last crash ends the race and a long simulation stays sane', () => {
  let s = { ...startRace(), lives: 1 }
  s = stepRace({ ...s, objs: [{ id: 1, lane: 1, y: PLAYER_Y, kind: 'obstacle', face: '🪨' }] }, 0.001, seeded(2))
  assert.equal(s.over, true)
  const rand = seeded(5)
  let r = startRace()
  for (let i = 0; i < 6000 && !r.over; i++) r = stepRace(r, 1 / 60, rand)
  assert.ok(r.objs.length < 30, 'objects that leave the road are removed')
  assert.ok(r.dist > 0)
})
