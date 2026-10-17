import { test } from 'node:test'
import assert from 'node:assert/strict'
import { deal, draw } from '../src/arcade/logic/klondike.js'
import { readGame, writeGame, saveKey, validState, HISTORY_LIMIT } from '../src/arcade/logic/solitaireSave.js'

const memory = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), m } }

test('a game in progress comes back exactly as it was', () => {
  const store = memory(), key = saveKey(null)
  const start = deal(), s = draw(draw(start))
  writeGame(store, key, { s, history: [start, draw(start)], time: 75 })
  assert.deepEqual(readGame(store, key), { s, history: [start, draw(start)], time: 75 })
})

test('an untouched deal is not saved, and the history is capped', () => {
  const store = memory(), key = saveKey(null)
  writeGame(store, key, { s: deal(), history: [], time: 0 })
  assert.equal(store.m.size, 0)
  const start = deal()
  writeGame(store, key, { s: draw(start), history: Array(HISTORY_LIMIT + 20).fill(start), time: 3 })
  assert.equal(readGame(store, key).history.length, HISTORY_LIMIT)
})

test('broken or tampered saves are ignored', () => {
  const store = memory(), key = saveKey({ seed: 5 })
  assert.equal(key, 'buga-solitaire-game-daily-5')
  const s = draw(deal())
  assert.ok(validState(s))
  const missing = { ...s, stock: s.stock.slice(1) }
  const dup = { ...s, stock: [...s.stock.slice(1), s.stock[2]] }
  const faceUpStock = { ...s, stock: s.stock.map(c => ({ ...c, up: true })) }
  for (const bad of [missing, dup, faceUpStock]) {
    assert.equal(validState(bad), false)
    store.setItem(key, JSON.stringify({ v: 1, s: bad, history: [], time: 1 }))
    assert.equal(readGame(store, key), null)
  }
  store.setItem(key, '{not json')
  assert.equal(readGame(store, key), null)
  store.setItem(key, JSON.stringify({ v: 1, s, history: [], time: -4 }))
  assert.equal(readGame(store, key), null)
})
