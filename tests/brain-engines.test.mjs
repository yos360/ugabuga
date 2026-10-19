import test from 'node:test'
import assert from 'node:assert/strict'
import { catalog, COUNTS, validate, move, won, solve, dailyIQ, examIndices } from '../src/arcade/logic/brain/catalog.js'
import { waterActions, riverActions, riverSafe, frogActions } from '../src/arcade/logic/brain/movement.js'
import { lightMove, solveLights } from '../src/arcade/logic/brain/lights.js'
import { matchMove, matchCatalog } from '../src/arcade/logic/brain/matchsticks.js'
import { bfs } from '../src/arcade/logic/brain/core.js'

for (const [kind, count] of Object.entries(COUNTS)) test(`${kind}: ${count} deterministic validated puzzles`, () => {
  const puzzles = catalog(kind)
  assert.equal(puzzles.length, count)
  assert.equal(new Set(puzzles.map(p => p.id)).size, count)
  for (const p of puzzles) {
    assert.ok(validate(p), p.id)
    const solution = solve(p)
    assert.ok(solution?.length, p.id)
    let state = p.initial
    for (const action of solution) { state = move(p, state, action); assert.notEqual(state, null, p.id) }
    assert.ok(won(p, state), p.id)
    if (kind === 'one') assert.equal(solution.length, 1)
  }
  assert.deepEqual(catalog(kind), puzzles)
})

test('catalogs contain distinct rules and starting states, not numbered copies', () => {
  for (const kind of Object.keys(COUNTS).filter(k => k !== 'iq')) {
    const signatures = catalog(kind).map(({ id, level, solution, ...rules }) => JSON.stringify(rules))
    assert.equal(new Set(signatures).size, signatures.length, kind)
  }
})
test('water legal actions preserve capacity and pouring volume; BFS is shortest', () => {
  for (const p of catalog('water')) {
    let state = p.initial
    for (const action of p.solution) {
      const next = move(p, state, action)
      assert.ok(next.every((v, i) => v >= 0 && v <= p.capacities[i]))
      if ('to' in action) assert.equal(next.reduce((a, b) => a + b), state.reduce((a, b) => a + b))
      state = next
    }
    assert.equal(solve(p).length, p.solution.length)
    assert.equal(move(p, p.initial, { from: 0, to: 1 }), null)
  }
  const p = { capacities: [3, 5], initial: [0, 0], target: 4, tap: true }
  assert.equal(bfs(p.initial, s => waterActions(p, s), s => s.includes(4)).length, 6)
})
test('river crossings preserve capacity, rower side and unattended-bank rules', () => {
  for (const p of catalog('river')) {
    let state = p.initial
    for (const action of p.solution) {
      assert.ok(action.riders.length <= p.capacity)
      assert.ok(action.riders.every(i => ((state >> i) & 1) === ((state >> p.n) & 1)))
      state = move(p, state, action); assert.ok(riverSafe(p, state))
    }
    assert.equal(state, (1 << (p.n + 1)) - 1)
    assert.equal(move(p, 0, { riders: [99] }), null)
    assert.ok(riverActions(p, 0).length)
  }
})
test('lights solver agrees with exhaustive shortest paths on every 2x2 board', () => {
  for (let mask = 0; mask < 16; mask++) {
    const p = { size: 2, initial: Array.from({ length: 4 }, (_, i) => (mask >> i) & 1) }
    const brute = bfs(p.initial, s => Array.from({ length: 4 }, (_, cell) => ({ state: lightMove(p, s, { cell }), action: { cell } })), s => s.every(v => !v))
    assert.equal(solveLights(p)?.length, brute?.length)
  }
})
test('matchsticks enforce one move, occupied sources and empty destinations', () => {
  const p = matchCatalog().find(p => p.mode === 'move'), action = p.solution[0]
  assert.equal(matchMove(p, p.initial, { from: action.from, to: action.from }), null)
  assert.equal(matchMove(p, p.initial, { from: -1, to: 0 }), null)
  const next = matchMove(p, p.initial, action)
  assert.equal(next.used, 1)
  assert.equal(next.mask.toString(2).replaceAll('0', '').length, p.initial.mask.toString(2).replaceAll('0', '').length)
})
test('frogs only move forward and jump over the other color', () => {
  for (const p of catalog('frogs')) for (const edge of frogActions(p, p.initial)) {
    const distance = (p.initial.indexOf(0) - edge.action.from) * p.initial[edge.action.from]
    assert.ok(distance === 1 || distance === 2)
    assert.equal(edge.state.filter(v => v === 0).length, 1)
  }
})
test('daily uses Israeli midnight; exam has ten worlds and age-specific bands', () => {
  assert.deepEqual(dailyIQ('2026-10-19T07:00:00Z'), dailyIQ('2026-10-19T18:00:00Z'))
  assert.notEqual(dailyIQ('2026-10-19T20:59:59Z').day, dailyIQ('2026-10-19T21:00:00Z').day)
  for (const age of ['6-8', '9-11', '12+', 'adult']) {
    const indices = examIndices(42, age)
    assert.deepEqual(indices, examIndices(42, age))
    assert.equal(new Set(indices.map(i => Math.floor(i / 50))).size, 10)
  }
  assert.ok(examIndices(42, '6-8').every(i => i % 50 < 15))
  assert.equal(catalog('iq').filter(p => p.boss).length, 50)
})
