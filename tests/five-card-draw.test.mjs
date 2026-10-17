import test from 'node:test'
import assert from 'node:assert/strict'
import { computerAction, discardPlan, drawCards, exchange, newDrawGame, playFinal, playOpening, showdown } from '../src/arcade/logic/fiveCardDraw.js'

const card = (rank, suit, id) => ({ rank, suit, id, up: true })
test('Five Card Draw deals unique cards, antes and preserves all 52 cards', () => {
  const game = newDrawGame(() => .5); assert.equal(game.player.length, 5); assert.equal(game.computer.length, 5); assert.equal(game.stock.length, 42); assert.equal(game.pot, 20)
  assert.equal(new Set([...game.player, ...game.computer, ...game.stock].map(c => c.id)).size, 52)
})
test('discard strategy keeps made hands and draws to real poker patterns', () => {
  assert.deepEqual(discardPlan([card(10,0,1),card(11,0,2),card(12,0,3),card(13,0,4),card(1,0,5)]), [])
  assert.equal(discardPlan([card(8,0,1),card(8,1,2),card(3,2,3),card(5,3,4),card(12,0,5)]).length, 3)
  assert.equal(discardPlan([card(2,1,1),card(5,1,2),card(9,1,3),card(13,1,4),card(7,0,5)])[0], 4)
})
test('exchange replaces at most three selected cards without duplicating cards', () => {
  const game = newDrawGame(() => .2), result = exchange(game.player, game.stock, [0,1,2,3,4]); assert.equal(result.count, 3); assert.equal(result.stock.length, 39); assert.equal(new Set([...result.hand, ...result.stock, ...game.computer].map(c => c.id)).size, 49)
})
test('betting stages, folds, showdown and split pots settle chips exactly', () => {
  let game = newDrawGame(() => .1); game = playOpening(game, 'check', () => .5); assert.equal(game.stage, 'draw'); game = drawCards(game); assert.equal(game.stage, 'final'); assert.equal(playFinal(game, 'fold').stage, 'ended')
  const strong = [card(1,0,60),card(1,1,61),card(1,2,62),card(1,3,63),card(2,0,64)], weak = [card(2,0,70),card(5,1,71),card(7,2,72),card(9,3,73),card(11,0,74)]
  const won = showdown({ ...game, player: strong, computer: weak, chips: 100, pot: 40 }); assert.equal(won.chips, 140); assert.equal(won.result.playerWins, true)
  const tie = showdown({ ...game, player: strong, computer: strong.map(c => ({ ...c, id: c.id + 20 })), chips: 100, pot: 41 }); assert.equal(tie.chips, 120); assert.equal(tie.result.tie, true)
})
test('computer difficulty uses hand strength and responds legally', () => {
  const weak = [card(2,0,1),card(5,1,2),card(7,2,3),card(9,3,4),card(11,0,5)], strong = [card(1,0,6),card(1,1,7),card(1,2,8),card(1,3,9),card(2,0,10)]
  assert.equal(computerAction(weak, 'hard', () => 0, true), 'fold'); assert.equal(computerAction(strong, 'hard', () => 0, true), 'raise')
})
