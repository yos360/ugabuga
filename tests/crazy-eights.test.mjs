import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import * as ce from '../src/arcade/logic/crazyEights.js'

test('Crazy Eights deals every card once for two to four players', () => {
  for (const players of [2, 3, 4]) {
    const a = ce.newRound({ players, seed: 88 }), b = ce.newRound({ players, seed: 88 })
    assert.deepEqual(a, b)
    assert.equal(a.hands.every(hand => hand.length === (players === 2 ? 7 : 5)), true)
    assert.notEqual(a.discard[0].rank, 8)
    assert.equal(ce.validState(a), true)
  }
})

test('Crazy Eights legal cards match suit, rank, or eight', () => {
  const top = { rank: 5, suit: 2 }
  assert.equal(ce.canPlay({ rank: 9, suit: 2 }, top, 2), true)
  assert.equal(ce.canPlay({ rank: 5, suit: 0 }, top, 2), true)
  assert.equal(ce.canPlay({ rank: 8, suit: 1 }, top, 2), true)
  assert.equal(ce.canPlay({ rank: 9, suit: 0 }, top, 2), false)
})

test('playing an eight requires and applies a suit choice', () => {
  const state = ce.newRound({ players: 2, seed: 4 })
  state.turn = 0; state.hands[0] = [{ id: 7, rank: 8, suit: 0, up: true }, { id: 1, rank: 2, suit: 0, up: true }]
  const chosen = ce.playCard(state, 0, 0)
  assert.equal(chosen.phase, 'choose-suit')
  const resumed = ce.selectSuit(chosen, 0, 3)
  assert.equal(resumed.activeSuit, 3)
  assert.equal(resumed.turn, 1)
})

test('a player draws only when no card is playable', () => {
  const state = ce.newRound({ players: 2, seed: 22 })
  state.turn = 0; state.activeSuit = 0; state.discard[state.discard.length - 1] = { id: 51, rank: 13, suit: 0, up: true }
  state.hands[0] = [{ id: 15, rank: 3, suit: 1, up: true }]
  const before = state.stock.length, drawn = ce.drawCard(state, 0)
  assert.equal(drawn.stock.length, before - 1)
  state.hands[0] = [{ id: 0, rank: 1, suit: 0, up: true }]
  assert.equal(ce.drawCard(state, 0), null)
})

test('computer strategies make legal decisions and preserve all cards', () => {
  for (const difficulty of ['easy', 'normal', 'hard']) {
    let state = ce.newRound({ players: 4, seed: 617 })
    for (let turns = 0; turns < 300 && state.phase === 'play'; turns++) {
      if (state.turn === 0) {
        const move = ce.availableMoves(state, 0)[0]
        state = move === undefined ? ce.drawCard(state, 0) : ce.playCard(state, 0, move, state.hands[0][move].rank === 8 ? 0 : null)
      } else state = ce.aiTurn(state, difficulty)
      const cards = [...state.hands.flat(), ...state.stock, ...state.discard]
      assert.equal(cards.length, 52)
      assert.equal(new Set(cards.map(card => card.id)).size, 52)
    }
    assert.equal(state.phase, 'round-over')
  }
})

test('round scoring uses 50 for eights, ten for faces and advances the match', () => {
  assert.equal(ce.cardPoints({ rank: 8 }), 50)
  assert.equal(ce.cardPoints({ rank: 12 }), 10)
  assert.equal(ce.cardPoints({ rank: 6 }), 6)
  const state = ce.newRound({ players: 2, seed: 9 }); state.phase = 'round-over'; state.scores = [70, 110]; state.round = 3
  assert.equal(ce.matchWinner(state), 1)
  const next = ce.nextRound(state)
  assert.equal(next.round, 4)
  assert.deepEqual(next.scores, [70, 110])
})

test('Crazy Eights has a lazy, indexable Hebrew page', () => {
  const registry = readFileSync(new URL('../src/arcade/registry.js', import.meta.url), 'utf8')
  const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  assert.match(registry, /slug: 'crazy-eights'[\s\S]*faq:[\s\S]*import\('\.\/games\/CrazyEights'\)/)
  assert.match(sitemap, /online-games\/crazy-eights/)
})
