import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as kl from '../src/arcade/logic/klondike.js'
import { rng } from '../src/arcade/logic/rng.js'
import { readSession, writeSession, validState, sessionKey } from '../src/arcade/logic/solitaireSession.js'

test('draw-three preserves draw order, partial packets, recycling and immutable undo snapshots', () => {
  const start = kl.deal(rng(23), 3)
  const original = structuredClone(start)
  let s = kl.draw(start)
  assert.deepEqual(s.waste.map(c => c.id), start.stock.slice(-3).reverse().map(c => c.id))
  assert.equal(s.moves, 1)
  assert.deepEqual(start, original)
  for (let i = 0; i < 7; i++) s = kl.draw(s)
  assert.equal(s.stock.length, 0)
  assert.equal(s.waste.length, 24)
  s = kl.draw(s)
  assert.deepEqual(s.stock, start.stock)
  assert.deepEqual(kl.draw(s).waste, kl.draw(start).waste)
  const partial = { ...start, stock: start.stock.slice(-2), waste: [] }
  assert.equal(kl.draw(partial).waste.length, 2)
  const empty = { ...start, stock: [], waste: [] }
  assert.equal(kl.draw(empty), empty)
})

test('rejects malformed sources and broken tableau runs; supports foundation-to-tableau', () => {
  const s = kl.deal(rng(1))
  for (const src of [null, { type: 'tab', pile: 99, index: 0 }, { type: 'tab', pile: 0, index: -1 }]) {
    assert.equal(kl.legal(s, src, { type: 'tab', pile: 1 }), false)
  }
  assert.equal(kl.legal(s, { type: 'tab', pile: 0, index: 0 }, { type: 'tab', pile: 99 }), false)
  s.tab[0] = [{ suit: 0, rank: 8, up: true }, { suit: 3, rank: 7, up: true }]
  s.tab[1] = [{ suit: 1, rank: 9, up: true }]
  assert.equal(kl.apply(s, { type: 'tab', pile: 0, index: 0 }, { type: 'tab', pile: 1 }), null)
  s.found[0] = [{ suit: 0, rank: 1, up: true }]
  s.tab[2] = [{ suit: 1, rank: 2, up: true }]
  assert.ok(kl.apply(s, { type: 'found', pile: 0 }, { type: 'tab', pile: 2 }))
})

test('save round-trip includes draw mode, time and undo; rejects corrupt data and unavailable storage', () => {
  let value = null
  const storage = { getItem: () => value, setItem: (_, v) => { value = v } }
  const s = kl.deal(rng(2), 3)
  const data = { s: kl.draw(s), history: [s], time: 48, reported: false }
  assert.ok(writeSession(storage, 'test', data))
  assert.deepEqual(readSession(storage, 'test'), { ...data, version: 1 })
  assert.equal(readSession(storage, 'test', true), null)
  const corrupt = structuredClone(data)
  corrupt.s.stock[0] = corrupt.s.stock[1]
  writeSession(storage, 'test', corrupt)
  assert.equal(readSession(storage, 'test'), null)
  value = '{'
  assert.equal(readSession(storage, 'test'), null)
  const blocked = { getItem() { throw Error('blocked') }, setItem() { throw Error('quota') } }
  assert.equal(readSession(blocked, 'test'), null)
  assert.equal(writeSession(blocked, 'test', data), false)
  assert.notEqual(sessionKey(), sessionKey({ day: 1, seed: 2 }))
  assert.notEqual(sessionKey({ day: 1, seed: 2 }), sessionKey({ day: 2, seed: 3 }))
})

test('both draw modes conserve a valid deck through moves and saved undo history', () => {
  for (const count of [1, 3]) {
    let s = kl.deal(rng(42), count)
    for (let i = 0; i < 250; i++) {
      assert.ok(validState(s))
      const hint = kl.findHint(s)
      if (!hint) break
      const before = structuredClone(s)
      const next = hint.draw ? kl.draw(s) : kl.apply(s, hint.src, hint.dst)
      assert.deepEqual(s, before)
      s = next
    }
  }
})

test('daily selection is deterministic and sampled deals actually finish using legal moves', () => {
  for (const seed of [1, 42, 12345, 164000101]) {
    let s = kl.winnableDeal(seed)
    assert.deepEqual(s, kl.winnableDeal(seed))
    for (let i = 0; i < 1500 && !kl.isWon(s); i++) {
      if (kl.canAutoFinish(s)) s = kl.autoStep(s)
      else {
        const hint = kl.findHint(s)
        assert.ok(hint)
        s = hint.draw ? kl.draw(s) : kl.apply(s, hint.src, hint.dst)
      }
      assert.ok(s)
      assert.ok(validState(s))
    }
    assert.ok(kl.isWon(s))
  }
})
