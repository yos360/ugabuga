import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateFive, bestHand, compareHands, winners, drawOdds, HAND_NAMES } from '../src/arcade/logic/poker.js'

let nextId = 0
const cards = source => source.trim().split(/\s+/).map(token => {
  const suit = 'SHDC'.indexOf(token.at(-1)), label = token.slice(0, -1), rank = label === 'A' ? 1 : label === 'K' ? 13 : label === 'Q' ? 12 : label === 'J' ? 11 : Number(label)
  return { id: nextId++, suit, rank, up: true }
})

test('poker evaluator recognises all nine hand categories', () => {
  const examples = ['AS KD 9H 6C 3S', 'AS AD 9H 6C 3S', 'AS AD KH KC 3S', 'AS AD AH 6C 3S', '9S 8D 7H 6C 5S', 'AS JS 9S 6S 3S', 'AS AD AH KC KS', 'AS AD AH AC 3S', '9S 8S 7S 6S 5S']
  examples.forEach((example, category) => { const result = evaluateFive(cards(example)); assert.equal(result.category, category); assert.equal(result.name, HAND_NAMES[category]) })
})

test('ace is high normally and low in a five-high straight', () => {
  assert.equal(evaluateFive(cards('AS 2D 3H 4C 5S')).kickers[0], 5)
  assert.equal(compareHands(evaluateFive(cards('AS KD QH JC 9S')), evaluateFive(cards('KS QD JH 8C 7D'))) > 0, true)
})

test('ties use all kickers and split pots exactly', () => {
  const pairAceKing = evaluateFive(cards('AS AD KH 7C 3S')), pairAceQueen = evaluateFive(cards('AC AH QH 7D 3C'))
  assert.equal(compareHands(pairAceKing, pairAceQueen) > 0, true)
  const board = cards('AS KD QH JC 10S'), result = winners([cards('2C 3C'), cards('4D 5D'), cards('AH AD')], board)
  assert.deepEqual(result.winners, [0, 1, 2])
})

test('best of seven chooses the strongest five cards', () => {
  const result = bestHand(cards('AS AD AH KC KS 2D 3D'))
  assert.equal(result.name, 'פול האוס'); assert.deepEqual(result.kickers, [14, 13])
})

test('draw odds use exact without-replacement probability', () => {
  assert.equal(drawOdds(0, 47, 2), 0)
  assert.ok(Math.abs(drawOdds(9, 47, 1) - 9 / 47) < 1e-12)
  const twoCards = 1 - (38 / 47) * (37 / 46)
  assert.ok(Math.abs(drawOdds(9, 47, 2) - twoCards) < 1e-12)
})

test('seven-card edge cases: double trips, three pairs, six-card flush and wheel', () => {
  assert.deepEqual(bestHand(cards('AS AH AD KS KH KD 2C')).score,[6,14,13])
  assert.deepEqual(bestHand(cards('AS AH KS KH QS QH 2C')).score,[2,14,13,12])
  assert.deepEqual(bestHand(cards('AS JS 9S 7S 4S 2S KH')).score,[5,14,11,9,7,4])
  assert.deepEqual(bestHand(cards('AS 2H 3D 4C 5S KD QH')).score,[4,5])
  assert.deepEqual(bestHand(cards('AS KS QS JS 10S 2H 3C')).score,[8,14])
})
test('quads on board use the private kicker; invalid duplicate card IDs are rejected', () => {
  const board=cards('9S 9H 9D 9C 2S')
  assert.deepEqual(winners([cards('AS 3H'),cards('KS QH')],board).winners,[0])
  const hand=cards('AS KS QS JS 10S');hand[4]=hand[0]
  assert.throws(()=>evaluateFive(hand));assert.throws(()=>bestHand(hand))
})
