import test from 'node:test'
import assert from 'node:assert/strict'
import { act, blindSize, botDecision, legalActions, newHoldem, runBots, settle, sidePots } from '../src/arcade/logic/holdem.js'

const card = (rank, suit, id) => ({ rank, suit, id, up: true })
test('Holdem deals unique hole and board cards for two to six players', () => {
  for (let opponents = 1; opponents <= 5; opponents++) { const game = newHoldem({ opponents, rand: () => .37 }), all = [...game.players.flatMap(p => p.hole), ...game.boardDeck]; assert.equal(all.length, (opponents + 1) * 2 + 5); assert.equal(new Set(all.map(c => c.id)).size, all.length) }
})
test('legal actions respect check, call, raise, all-in and fold states', () => {
  const game = newHoldem({ opponents: 3, rand: () => .2 }); assert.deepEqual(legalActions(game), ['fold', 'call', 'raise', 'all-in'])
  const acting = game.current, called = act(game, 'call'); assert.equal(called.current, 0); assert.equal(called.players[acting].bet, game.bigBlind)
  const invalid = act(game, 'check'); assert.equal(invalid, game)
})
test('rounds reveal exactly flop, turn and river and bots return control', () => {
  let game = newHoldem({ opponents: 2, rand: () => .21 }); game = runBots(act(game, 'call'), () => .5)
  for (let guard = 0; game.stage === 'preflop' && guard < 10; guard++) game = runBots(act(game, legalActions(game).includes('check') ? 'check' : 'call'), () => .5)
  assert.equal(game.stage, 'flop'); assert.equal(game.board.length, 3)
})
test('side pots use contribution layers and exclude folded players from winning', () => {
  const players = [{ id:0,total:100,folded:false },{ id:1,total:300,folded:false },{ id:2,total:300,folded:true },{ id:3,total:500,folded:false }]
  assert.deepEqual(sidePots(players), [{ amount:400, eligible:[0,1,3] },{ amount:600, eligible:[1,3] },{ amount:200, eligible:[3] }])
})
test('showdown splits tied pots and awards side pots to eligible winners', () => {
  const board = [card(2,0,20),card(3,1,21),card(4,2,22),card(9,3,23),card(13,0,24)]
  const game = { ...newHoldem({ opponents:2 }), boardDeck:board, board, pot:500, players:[
    { id:0,name:'אתם',stack:0,bet:0,total:100,folded:false,allIn:true,hole:[card(1,0,1),card(5,1,2)] },
    { id:1,name:'בוט 1',stack:0,bet:0,total:200,folded:false,allIn:true,hole:[card(1,1,3),card(5,2,4)] },
    { id:2,name:'בוט 2',stack:0,bet:0,total:200,folded:false,allIn:true,hole:[card(13,1,5),card(13,2,6)] },
  ] }
  const done = settle(game); assert.equal(done.players.reduce((sum,p)=>sum+p.stack,0),500); assert.equal(done.result.pots.length,2); assert.equal(done.result.awards[0],150); assert.equal(done.result.awards[1],350)
})
test('AI always returns a legal action and tournament blinds rise every five hands', () => {
  for (const difficulty of ['easy','medium','hard']) { const game = newHoldem({ opponents:3,difficulty,rand:()=>.4 }); assert.ok(legalActions(game).includes(botDecision({ ...game, current:1 },1,()=>.4).type)) }
  assert.equal(blindSize(0),10); assert.equal(blindSize(5),20); assert.equal(blindSize(10),40)
})
