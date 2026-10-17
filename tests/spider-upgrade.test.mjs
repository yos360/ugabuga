import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as spider from '../src/arcade/logic/spider.js'
import { rng } from '../src/arcade/logic/rng.js'
import { validSpiderState, readSpiderSession, writeSpiderSession, spiderSessionKey } from '../src/arcade/logic/spiderSession.js'

const storage = () => { let value; return { getItem: () => value, setItem: (_, next) => { value = next } } }

test('Spider validates all difficulty decks through legal moves and row deals', () => {
  for (const suits of [1, 2, 4]) {
    let state = spider.deal(suits, rng(7))
    for (let step = 0; step < 180; step++) {
      assert.ok(validSpiderState(state))
      const before = structuredClone(state)
      const hint = spider.findHint(state)
      if (!hint) break
      const next = hint.deal ? spider.dealRow(state) : spider.apply(state, hint.from, hint.index, hint.to)
      assert.deepEqual(state, before, 'logic keeps undo snapshots immutable')
      assert.ok(next)
      state = next
    }
  }
})

test('Spider save round-trip preserves undo and rejects corrupt or cross-mode data', () => {
  const state = spider.deal(2, rng(11)), store = storage()
  const next = spider.dealRow(state)
  assert.ok(writeSpiderSession(store, 'spider', { state: next, history: [state], reported: false }))
  assert.deepEqual(readSpiderSession(store, 'spider'), { version: 1, state: next, history: [state], reported: false })
  const duplicate = structuredClone(next); duplicate.stock[0] = duplicate.stock[1]
  writeSpiderSession(store, 'spider', { state: duplicate, history: [], reported: false })
  assert.equal(readSpiderSession(store, 'spider'), null)
  assert.equal(readSpiderSession({ getItem() { throw Error('blocked') } }, 'spider'), null)
  assert.equal(writeSpiderSession({ setItem() { throw Error('quota') } }, 'spider', {}), false)
})

test('Spider daily saves are isolated and accept only one-suit unfinished games', () => {
  assert.notEqual(spiderSessionKey(), spiderSessionKey({ day: 1, seed: 2 }))
  assert.notEqual(spiderSessionKey({ day: 1, seed: 2 }), spiderSessionKey({ day: 2, seed: 3 }))
  const store = storage(), twoSuits = spider.deal(2, rng(2))
  writeSpiderSession(store, 'daily', { state: twoSuits, history: [], reported: false })
  assert.equal(readSpiderSession(store, 'daily', true), null)
})

test('smart hint prioritizes revealing a face-down card over a cosmetic same-suit move', () => {
  const state = {
    tab: [
      [{ suit: 0, rank: 9, up: false }, { suit: 1, rank: 6, up: true }],
      [{ suit: 0, rank: 7, up: true }],
      [{ suit: 0, rank: 10, up: true }, { suit: 0, rank: 9, up: true }],
      [{ suit: 0, rank: 10, up: true }],
      ...Array.from({ length: 6 }, () => []),
    ],
    stock: [], done: 0, doneSuits: [], moves: 0, suits: 4,
  }
  assert.deepEqual(spider.findHint(state), { from: 0, index: 1, to: 1 })
})
