import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import * as gin from '../src/arcade/logic/ginRummy.js'

const c = (rank, suit, id = suit * 13 + rank - 1) => ({ rank, suit, id, up: true })

test('Gin Rummy finds the optimal disjoint runs and sets', () => {
  const hand = [c(3, 0), c(4, 0), c(5, 0), c(7, 0), c(7, 1), c(7, 2), c(10, 1), c(11, 1), c(12, 1), c(2, 3)]
  const result = gin.bestMelds(hand)
  assert.equal(result.melds.length, 3)
  assert.equal(result.deadwood, 2)
  assert.deepEqual(result.deadwoodCards.map(card => card.rank), [2])
})

test('overlapping melds choose the lowest deadwood combination', () => {
  const hand = [c(5, 0), c(5, 1), c(5, 2), c(4, 0), c(6, 0), c(7, 0), c(9, 1), c(10, 1), c(11, 1), c(1, 3)]
  const result = gin.bestMelds(hand)
  assert.equal(result.deadwood, 11, 'the five of spades cannot be used in both a set and run')
})

test('layoffs extend sets and both ends of runs', () => {
  const knocker = gin.bestMelds([c(5, 0), c(5, 1), c(5, 2), c(7, 3), c(8, 3), c(9, 3), c(2, 0), c(3, 1), c(4, 2), c(1, 1)])
  const laid = gin.layoffDeadwood([c(5, 3), c(6, 3), c(10, 3), c(13, 0)], knocker.melds)
  assert.deepEqual(laid.cards.map(card => card.rank), [13])
  assert.equal(laid.deadwood, 10)
})

test('knock, gin and undercut scoring are correct', () => {
  const ginHand = [c(1, 0), c(2, 0), c(3, 0), c(4, 0), c(7, 1), c(7, 2), c(7, 3), c(10, 2), c(11, 2), c(12, 2)]
  const opponent = [c(1, 1), c(4, 1), c(9, 0), c(9, 1), c(9, 2), c(2, 3), c(3, 3), c(4, 3), c(11, 0), c(12, 0)]
  const scoredGin = gin.scoreKnock(ginHand, opponent)
  assert.equal(scoredGin.gin, true); assert.equal(scoredGin.points, 25 + gin.bestMelds(opponent).deadwood)
  const knocker = [c(1, 0), c(2, 0), c(3, 0), c(7, 0), c(7, 1), c(7, 2), c(10, 2), c(11, 2), c(12, 2), c(4, 3)]
  const undercut = gin.scoreKnock(knocker, ginHand)
  assert.equal(undercut.undercut, true); assert.equal(undercut.winner, 'opponent')
})

test('deals contain 52 unique cards and draw-discard flow is enforced', () => {
  const state = gin.dealRound({ seed: 617 })
  assert.equal(gin.validState(state), true); assert.deepEqual(state.hands.map(hand => hand.length), [10, 10]); assert.equal(state.stock.length, 31)
  const player = state.turn, drawn = gin.drawCard(state, player, 'discard')
  assert.equal(drawn.hands[player].length, 11); assert.equal(drawn.phase, 'discard')
  const same = drawn.hands[player].findIndex(card => card.id === drawn.drawnId)
  assert.equal(gin.discardCard(drawn, player, same), null, 'a discard pickup cannot be immediately returned')
  const next = gin.discardCard(drawn, player, same ? 0 : 1)
  assert.equal(next.hands[player].length, 10); assert.equal(next.turn, 1 - player); assert.equal(gin.validState(next), true)
})

test('all AI levels draw, discard and eventually finish rounds legally', () => {
  for (const difficulty of ['easy', 'normal', 'hard']) {
    let state = gin.dealRound({ seed: 42, dealer: 0 })
    for (let turns = 0; turns < 100 && !['round-over', 'match-over'].includes(state.phase); turns++) {
      if (state.turn === 1) state = gin.aiTurn(state, difficulty)
      else {
        state = gin.drawCard(state, 0, 'stock')
        if (state.phase === 'round-over') break
        const choices = state.hands[0].map((_, index) => index).filter(index => state.hands[0][index].id !== state.drawnId)
        const index = choices.reduce((best, candidate) => gin.bestMelds(state.hands[0].filter((_, i) => i !== candidate)).deadwood < gin.bestMelds(state.hands[0].filter((_, i) => i !== best)).deadwood ? candidate : best)
        const deadwood = gin.bestMelds(state.hands[0].filter((_, i) => i !== index)).deadwood
        state = gin.discardCard(state, 0, index, deadwood <= 10) || gin.discardCard(state, 0, index)
      }
      assert.ok(state); assert.equal(gin.validState(state), true)
    }
    assert.ok(['round-over', 'match-over'].includes(state.phase))
  }
})

test('Gin Rummy has a lazy, indexable Hebrew page', () => {
  const registry = readFileSync(new URL('../src/arcade/registry.js', import.meta.url), 'utf8'), sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  assert.match(registry, /slug: 'gin-rummy'[\s\S]*faq:[\s\S]*import\('\.\/games\/GinRummy'\)/); assert.match(sitemap, /online-games\/gin-rummy/)
})
