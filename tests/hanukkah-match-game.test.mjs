import test from 'node:test'
import assert from 'node:assert/strict'
import { SYMBOLS, DECKS, buildDeck, deckCards, common, layout } from '../src/data/hanukkahMatchGame.js'

test('symbols have unique ids and words', () => {
  assert.equal(SYMBOLS.length, 31)
  assert.equal(new Set(SYMBOLS.map(s => s.id)).size, SYMBOLS.length)
  assert.equal(new Set(SYMBOLS.map(s => s.w)).size, SYMBOLS.length)
  for (const s of SYMBOLS) assert.ok(s.w && (s.e || s.art), s.id)
})

test('every two cards share exactly one symbol, in both decks', () => {
  for (const d of DECKS) {
    const n = d.n
    const cards = deckCards(d.id)
    assert.equal(cards.length, n * n + n + 1, d.id)
    for (const c of cards) {
      assert.equal(c.length, n + 1, d.id)
      assert.equal(new Set(c).size, c.length, d.id)
      assert.ok(c.every(Boolean), d.id)
    }
    for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++)
      assert.equal(common(cards[i], cards[j]).length, 1, `${d.id} ${i}/${j}`)
    assert.equal(Math.max(...buildDeck(n).flat()) + 1, n * n + n + 1)
  }
})

test('layout stays inside the card and is deterministic', () => {
  for (const k of [4, 6]) {
    const a = layout(k, 42), b = layout(k, 42)
    assert.deepEqual(a, b)
    assert.equal(a.length, k)
    for (const p of a) assert.ok(p.x > 10 && p.x < 90 && p.y > 10 && p.y < 90)
  }
})
