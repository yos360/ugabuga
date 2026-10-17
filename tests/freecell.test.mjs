import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import * as fc from '../src/arcade/logic/freecell.js'

test('FreeCell numbered deals are deterministic and contain every card once', () => {
  for (const number of [1, 24, 617, 11982, 999999]) {
    const a = fc.deal(number), b = fc.deal(number)
    assert.deepEqual(a, b)
    assert.deepEqual(a.tab.map(pile => pile.length), [7, 7, 7, 7, 6, 6, 6, 6])
    assert.equal(new Set(a.tab.flat().map(card => card.id)).size, 52)
    assert.equal(fc.validState(a), true)
  }
})

test('FreeCell sequences descend with alternating colours', () => {
  const good = [{ rank: 8, suit: 0 }, { rank: 7, suit: 1 }, { rank: 6, suit: 3 }]
  assert.equal(fc.sequence(good, 0), true)
  assert.equal(fc.sequence([{ rank: 8, suit: 0 }, { rank: 7, suit: 3 }], 0), false)
  assert.equal(fc.sequence([{ rank: 8, suit: 0 }, { rank: 6, suit: 1 }], 0), false)
})

test('FreeCell movable run limit uses free cells and empty columns', () => {
  const state = fc.deal(1)
  assert.equal(fc.movableCount(state), 5)
  state.tab[7] = []
  assert.equal(fc.movableCount(state), 10)
  assert.equal(fc.movableCount(state, 7), 5, 'an empty destination cannot also serve as temporary space')
  state.cells[0] = state.tab[0].pop()
  assert.equal(fc.movableCount(state, 7), 4)
})

test('FreeCell allows cells, foundations and valid tableau moves only', () => {
  const ace = { id: 0, rank: 1, suit: 0, up: true }, red7 = { id: 19, rank: 7, suit: 1, up: true }, black6 = { id: 5, rank: 6, suit: 0, up: true }
  const state = { version: 1, dealNumber: 1, tab: [[ace], [red7], [black6], [], [], [], [], []], cells: [null, null, null, null], found: [[], [], [], []], moves: 0 }
  assert.equal(fc.legal(state, { type: 'tab', pile: 0, index: 0 }, { type: 'found', pile: 0 }), true)
  assert.equal(fc.legal(state, { type: 'tab', pile: 2, index: 0 }, { type: 'tab', pile: 1 }), true)
  assert.equal(fc.legal(state, { type: 'tab', pile: 1, index: 0 }, { type: 'tab', pile: 2 }), false)
  const moved = fc.apply(state, { type: 'tab', pile: 0, index: 0 }, { type: 'cell', pile: 0 })
  assert.equal(moved.cells[0].rank, 1)
  assert.equal(moved.moves, 1)
})

test('FreeCell auto finish moves a solved layout home', () => {
  const found = [0, 1, 2, 3].map(suit => Array.from({ length: 12 }, (_, index) => ({ id: suit * 13 + index, suit, rank: index + 1, up: true })))
  const tab = Array.from({ length: 8 }, () => [])
  for (let suit = 0; suit < 4; suit++) tab[suit].push({ id: suit * 13 + 12, suit, rank: 13, up: true })
  const state = { version: 1, dealNumber: 1, tab, cells: [null, null, null, null], found, moves: 0 }
  const done = fc.autoFinish(state)
  assert.equal(fc.isWon(done), true)
  assert.equal(done.moves, 4)
})

test('FreeCell saved state rejects missing, duplicate and malformed cards', () => {
  const state = fc.deal(88)
  assert.equal(fc.validState(state), true)
  state.tab[0].pop()
  assert.equal(fc.validState(state), false)
  state.tab[0].push(state.tab[1][0])
  assert.equal(fc.validState(state), false)
})

test('FreeCell has a lazy, indexable Hebrew game page', () => {
  const registry = readFileSync(new URL('../src/arcade/registry.js', import.meta.url), 'utf8')
  const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  assert.match(registry, /slug: 'freecell'[\s\S]*faq:[\s\S]*import\('\.\/games\/FreeCell'\)/)
  assert.match(sitemap, /online-games\/freecell/)
})
