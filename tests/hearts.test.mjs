import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import * as hearts from '../src/arcade/logic/hearts.js'

test('Hearts deals 13 unique cards and rotates pass direction', () => {
  for (let round = 1; round <= 4; round++) {
    const a = hearts.dealRound({ seed: 44, round }), b = hearts.dealRound({ seed: 44, round })
    assert.deepEqual(a, b); assert.deepEqual(a.hands.map(hand => hand.length), [13, 13, 13, 13]); assert.equal(hearts.validState(a), true)
  }
  assert.deepEqual([1, 2, 3, 4].map(hearts.passDirection), ['left', 'right', 'across', 'hold'])
})

test('passing moves exactly three cards in the correct direction', () => {
  for (const round of [1, 2, 3]) {
    const state = hearts.dealRound({ seed: 7, round }), sent = state.hands[0].slice(0, 3).map(card => card.id)
    const next = hearts.completePassing(state, [0, 1, 2], 'hard')
    const target = round === 1 ? 1 : round === 2 ? 3 : 2
    assert.equal(sent.every(id => next.hands[target].some(card => card.id === id)), true)
    assert.deepEqual(next.hands.map(hand => hand.length), [13, 13, 13, 13])
  }
})

test('two of clubs opens and players must follow suit', () => {
  let state = hearts.dealRound({ seed: 81, round: 4 })
  const starter = state.turn, moves = hearts.legalMoves(state, starter)
  assert.equal(moves.length, 1); assert.equal(state.hands[starter][moves[0]].id, hearts.TWO_CLUBS)
  state = hearts.playCard(state, starter, moves[0])
  const player = state.turn, hasClubs = state.hands[player].some(card => card.suit === 3)
  assert.equal(hearts.legalMoves(state, player).every(index => !hasClubs || state.hands[player][index].suit === 3), true)
})

test('hearts cannot be led before broken unless the hand contains only hearts', () => {
  const state = hearts.dealRound({ seed: 1, round: 4 }); state.trickNumber = 4; state.trick = []; state.lead = null; state.heartsBroken = false; state.turn = 0
  const moves = hearts.legalMoves(state, 0)
  if (state.hands[0].some(card => card.suit !== 1)) assert.equal(moves.every(index => state.hands[0][index].suit !== 1), true)
  state.hands[0] = state.hands[0].map((card, index) => ({ ...card, suit: 1, id: index }))
  assert.equal(hearts.legalMoves(state, 0).length, state.hands[0].length)
})

test('first trick rejects penalty cards when a safe discard exists', () => {
  const state = hearts.dealRound({ seed: 3, round: 4 }); state.turn = 0; state.trickNumber = 0; state.lead = 3
  state.trick = [{ player: 3, card: { id: 40, suit: 3, rank: 2, up: true } }]
  state.hands[0] = [{ id: 11, suit: 0, rank: 12, up: true }, { id: 13, suit: 1, rank: 1, up: true }, { id: 27, suit: 2, rank: 2, up: true }]
  assert.deepEqual(hearts.legalMoves(state, 0), [2])
})

test('scoring includes hearts, queen of spades, and shooting the moon', () => {
  const heartCards = Array.from({ length: 13 }, (_, index) => ({ suit: 1, rank: index + 1 }))
  const queen = { suit: 0, rank: 12 }
  assert.equal(hearts.cardPenalty(queen), 13); assert.equal(hearts.cardPenalty(heartCards[0]), 1)
  assert.deepEqual(hearts.scoreRound([[...heartCards, queen], [], [], []]), [0, 26, 26, 26])
  assert.deepEqual(hearts.scoreRound([[heartCards[0]], [queen], [], []]), [1, 13, 0, 0])
})

test('AI completes legal rounds and preserves all cards', () => {
  for (const difficulty of ['easy', 'normal', 'hard']) {
    let state = hearts.dealRound({ seed: 617, round: 1 })
    state = hearts.completePassing(state, hearts.choosePass(state.hands[0], difficulty), difficulty)
    for (let move = 0; move < 52; move++) {
      const index = hearts.chooseAiCard(state, state.turn, difficulty)
      state = hearts.playCard(state, state.turn, index)
      assert.ok(state)
    }
    assert.ok(['round-over', 'match-over'].includes(state.phase)); assert.equal(state.taken.flat().length, 52); assert.equal(state.roundScore.reduce((a, b) => a + b, 0), 26)
  }
})

test('Hearts has a lazy, indexable Hebrew page', () => {
  const registry = readFileSync(new URL('../src/arcade/registry.js', import.meta.url), 'utf8')
  const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  assert.match(registry, /slug: 'hearts'[\s\S]*faq:[\s\S]*import\('\.\/games\/Hearts'\)/)
  assert.match(sitemap, /online-games\/hearts/)
})
