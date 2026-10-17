import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as sp from '../src/arcade/logic/spider.js'
import { build } from '../src/arcade/logic/memory.js'
import { rng } from '../src/arcade/logic/rng.js'
import { validSpider, validMemory, readCardSession, writeCardSession, cardSessionKey } from '../src/arcade/logic/cardGameSessions.js'
const memory = () => ({ level: 1, cards: build(1, rng(5)), turns: 0, peek: false, reported: false })
const store = () => { let value; return { getItem: () => value, setItem: (_, v) => { value = v } } }

test('Spider saves validate all difficulty decks, row deals and immutable undo states', () => {
  for (const suits of [1, 2, 4]) {
    let s = sp.deal(suits, rng(7)), history = []
    const storage = store()
    for (let i = 0; i < 150; i++) {
      assert.ok(validSpider(s))
      writeCardSession(storage, 's', { s, history, reported: false })
      assert.deepEqual(readCardSession(storage, 's', 'spider').s, s)
      const hint = sp.findHint(s)
      if (!hint) break
      const before = structuredClone(s)
      const next = hint.deal ? sp.dealRow(s) : sp.apply(s, hint.from, hint.index, hint.to)
      assert.deepEqual(s, before)
      history = [...history.slice(-59), s]; s = next
    }
  }
})

test('Spider rejects missing or duplicate cards and invalid collected suit totals', () => {
  const s = sp.deal(2, rng(1))
  const broken = structuredClone(s); broken.stock[0] = broken.stock[1]
  assert.equal(validSpider(broken), false)
  assert.equal(validSpider({ ...s, stock: s.stock.slice(1) }), false)
  assert.equal(validSpider({ ...s, done: 1, doneSuits: [3] }), false)
  const storage = store()
  writeCardSession(storage, 's', { s, history: [], reported: false })
  assert.equal(readCardSession(storage, 's', 'spider', { seed: 1 }), null)
})

test('Memory resumes an interrupted mismatch face-down and preserves completed pairs', () => {
  const data = memory(), storage = store()
  const face = data.cards[0].face
  data.cards = data.cards.map(c => c.face === face ? { ...c, done: true, open: true } : c)
  data.turns = 2
  const remaining = data.cards.filter(c => !c.done)
  const a = remaining[0], b = remaining.find(c => c.face !== a.face)
  a.open = b.open = true
  assert.ok(validMemory(data))
  writeCardSession(storage, 'm', data)
  const restored = readCardSession(storage, 'm', 'memory')
  assert.equal(restored.turns, 2)
  assert.equal(restored.cards.filter(c => c.open).length, 2)
  assert.ok(restored.cards.filter(c => c.open).every(c => c.done))
})

test('Memory rejects broken pair states, unsupported levels and corrupt storage', () => {
  const data = memory(), storage = store()
  data.cards[0].done = data.cards[0].open = true; data.turns = 1
  assert.equal(validMemory(data), false)
  assert.equal(validMemory({ ...memory(), level: 0 }), false)
  assert.equal(validMemory({ ...memory(), turns: -1 }), false)
  storage.setItem('m', '{')
  assert.equal(readCardSession(storage, 'm', 'memory'), null)
  const blocked = { getItem() { throw Error('denied') }, setItem() { throw Error('quota') } }
  assert.equal(readCardSession(blocked, 'm', 'memory'), null)
  assert.equal(writeCardSession(blocked, 'm', memory()), false)
})

test('ordinary, daily and marathon saves are isolated; daily memory level must match', () => {
  assert.notEqual(cardSessionKey('memory'), cardSessionKey('spider'))
  assert.notEqual(cardSessionKey('memory'), cardSessionKey('memory', { day: 1, seed: 2 }))
  assert.notEqual(cardSessionKey('memory', { day: 1, seed: 2 }), cardSessionKey('memory', { seed: 2 }))
  const storage = store()
  writeCardSession(storage, 'm', memory())
  assert.equal(readCardSession(storage, 'm', 'memory', { level: 4 }), null)
  assert.ok(readCardSession(storage, 'm', 'memory', { level: 1 }))
})
