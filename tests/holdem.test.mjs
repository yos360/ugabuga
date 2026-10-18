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

import { bettingLimits, nextHand, seededRandom, stepBot } from '../src/arcade/logic/holdem.js'
const chips = game => game.pot + game.players.reduce((n, p) => n + p.stack, 0)
const passive = game => act(game, legalActions(game).includes('check') ? 'check' : 'call')
function street(game) { const before = game.stage; for (let n = 0; n < 30 && game.stage === before; n++) game = passive(game); return game }
function custom(stacks, bets, current = 0, actedAt = {}, lastRaise = 10) {
  const s = newHoldem({ opponents: stacks.length - 1, seed: 41 })
  return { ...s, current, currentBet: Math.max(...bets), lastRaise, actedAt, pot: bets.reduce((a,b) => a+b,0), players: s.players.map((p,i) => ({ ...p, stack: stacks[i], bet: bets[i], total: bets[i], allIn: stacks[i] === 0 })) }
}
test('heads-up button posts SB, acts first preflop and last postflop', () => {
  for (const dealer of [0,1]) {
    let s = newHoldem({ opponents:1, dealer, seed:12 })
    assert.equal(s.smallBlindSeat,dealer); assert.equal(s.bigBlindSeat,1-dealer); assert.equal(s.current,dealer)
    s = street(s); assert.equal(s.stage,'flop'); assert.equal(s.current,1-dealer)
  }
})
test('3–6 seats rotate action clockwise from blinds / button', () => {
  for (let count=3;count<=6;count++) for(let dealer=0;dealer<count;dealer++) {
    let s=newHoldem({opponents:count-1,dealer,seed:9})
    assert.equal(s.smallBlindSeat,(dealer+1)%count); assert.equal(s.bigBlindSeat,(dealer+2)%count); assert.equal(s.current,(dealer+3)%count)
    s=street(s); assert.equal(s.stage,'flop'); assert.equal(s.current,(dealer+1)%count)
    s=street(s); assert.equal(s.stage,'turn'); assert.equal(s.current,(dealer+1)%count)
  }
})
test('next hand rotates the dealer, skips busted seats, preserves bankroll and increases blinds', () => {
  let s=newHoldem({opponents:4,stacks:[1000,0,1000,0,1000],dealer:0,handNumber:4,seed:1})
  assert.equal(s.smallBlindSeat,2);assert.equal(s.bigBlindSeat,4)
  while(s.stage!=='ended') s=act(s,'fold')
  const n=nextHand(s);assert.equal(n.dealer,2);assert.equal(n.bigBlind,20);assert.equal(chips(n),3000);assert.equal(n.players[1].hole.length,0)
  assert.equal(nextHand(n),n)
})
test('heads-up on nonadjacent surviving seats and one survivor never posts phantom blinds', () => {
  const s=newHoldem({stacks:[0,100,0,100],dealer:1,seed:1})
  assert.equal(s.smallBlindSeat,1);assert.equal(s.bigBlindSeat,3);assert.equal(s.current,1)
  const end=newHoldem({stacks:[0,100,0,0]});assert.equal(end.stage,'ended');assert.equal(end.pot,0);assert.equal(chips(end),100)
})
test('raise-to minimum follows the previous full raise; invalid values are rejected', () => {
  let s=newHoldem({opponents:3,seed:2})
  for (const n of [19,NaN,Infinity,20.5,1001]) assert.equal(act(s,'raise',n),s)
  s=act(s,'raise',35);assert.equal(s.lastRaise,25);assert.equal(bettingLimits(s).min,60)
  assert.equal(act(s,'raise',59),s);s=act(s,'raise',60);assert.equal(s.currentBet,60)
})
test('short all-in does not reopen a prior caller; unacted players retain raises', () => {
  let s=custom([90,5,100],[10,10,10],1,{0:10})
  s=act(s,'all-in');assert.equal(s.currentBet,15);assert.equal(s.lastRaise,10);assert.ok(legalActions(s).includes('raise'))
  s=act(s,'call');assert.equal(s.current,0);assert.deepEqual(legalActions(s),['fold','call']);assert.equal(act(s,'all-in'),s)
  s=act(s,'call');assert.equal(s.stage,'flop')
})
test('cumulative short all-ins reopen once a full raise is faced', () => {
  let s=custom([100,5,10,100],[10,10,10,10],1,{0:10})
  s=act(s,'all-in');s=act(s,'all-in');s=act(s,'call')
  assert.equal(s.current,0);assert.ok(legalActions(s).includes('raise'));assert.equal(bettingLimits(s).min,30)
})
test('short stacks can call all-in without raising; lone active player cannot bet into a dry side pot', () => {
  let s=custom([3,0,100],[5,20,20],0,{2:20})
  assert.deepEqual(legalActions(s),['fold','call','all-in']);s=act(s,'call');assert.equal(s.stage,'ended');assert.equal(chips(s),148)
  s=custom([100,0],[5,10],0)
  assert.deepEqual(legalActions(s),['fold','call']);s=act(s,'call');assert.equal(s.stage,'ended');assert.equal(chips(s),115)
})
test('short blinds preserve exact pot and force remaining player to answer before runout', () => {
  let s=newHoldem({opponents:1,stacks:[100,8],seed:3})
  assert.equal(s.pot,13);assert.equal(s.current,0);assert.equal(bettingLimits(s).toCall,3)
  s=act(s,'call');assert.equal(s.stage,'ended');assert.equal(chips(s),108)
  s=newHoldem({opponents:1,stacks:[2,3],seed:3});assert.equal(s.stage,'ended');assert.equal(chips(s),5)
})
test('fold-to-win pays exactly once and clears committed chips', () => {
  let s=newHoldem({opponents:1,seed:3});s=act(s,'fold')
  assert.equal(s.stage,'ended');assert.equal(s.board.length,0);assert.equal(s.result.showdown,false);assert.equal(chips(s),2000)
  assert.ok(s.players.every(p=>p.total===0&&p.bet===0));assert.equal(settle(s),s)
})
test('odd chips go clockwise left of dealer, including tied side pots', () => {
  const board=[card(10,0,100),card(11,0,101),card(12,0,102),card(13,0,103),card(1,0,104)]
  let s=newHoldem({opponents:2,dealer:0,seed:7})
  s={...s,boardDeck:board,pot:15,players:s.players.map((p,i)=>({...p,stack:0,total:5,bet:5,folded:i===2,hole:[card(2+i,1,110+i*2),card(5+i,2,111+i*2)]}))}
  const done=settle(s);assert.deepEqual(done.result.awards,[7,8,0]);assert.equal(chips(done),15)
})
test('daily seed, bot RNG, and reload continuation are deterministic without Math.random', () => {
  const original=Math.random
  Math.random=()=>{throw new Error('unexpected global randomness')}
  try {
    let a=newHoldem({seed:20261018}), b=newHoldem({seed:20261018})
    assert.deepEqual(a,b)
    for(let n=0;n<100&&a.stage!=='ended';n++) {
      a=a.current===0?passive(a):stepBot(a)
      b=JSON.parse(JSON.stringify(b));b=b.current===0?passive(b):stepBot(b)
      assert.deepEqual(a,b)
    }
    assert.equal(a.stage,'ended');assert.deepEqual(nextHand(a),nextHand(b))
    assert.notDeepEqual(newHoldem({seed:1}).boardDeck,newHoldem({seed:2}).boardDeck)
  } finally { Math.random=original }
})
test('random legal games conserve integer chips and terminate for every difficulty / seat count', () => {
  const random=seededRandom(987)
  for(const difficulty of ['easy','medium','hard']) for(let count=2;count<=6;count++) for(let trial=0;trial<25;trial++) {
    const stacks=Array.from({length:count},()=>1+Math.floor(random()*400))
    let s=newHoldem({stacks,difficulty,seed:trial+1}), expected=stacks.reduce((a,b)=>a+b,0), turns=0
    while(s.stage!=='ended'&&turns++<250) {
      const choice=botDecision(s,s.current,random);assert.ok(legalActions(s).includes(choice.type))
      if(choice.amount!=null){const l=bettingLimits(s);assert.ok(choice.amount>=l.min&&choice.amount<=l.max)}
      const previous=s;s=act(s,choice.type,choice.amount);assert.notEqual(s,previous)
      assert.equal(chips(s),expected);assert.ok(s.players.every(p=>Number.isSafeInteger(p.stack)&&p.stack>=0))
      if(s.stage!=='ended')assert.equal(s.pot,s.players.reduce((n,p)=>n+p.total,0))
    }
    assert.equal(s.stage,'ended')
  }
})

test('a checked player may raise an incomplete opening all-in bet', () => {
  let s=custom([100,5,100],[0,0,0],1,{0:0})
  s={...s,stage:'flop',board:s.boardDeck.slice(0,3)}
  s=act(s,'all-in');s=act(s,'call')
  assert.equal(s.current,0);assert.ok(legalActions(s).includes('raise'));assert.equal(bettingLimits(s).min,10)
  s=act(s,'raise',10);assert.equal(s.currentBet,10);assert.equal(s.lastRaise,10)
})
test('arbitrary legal raises and multiple all-ins preserve the bankroll', () => {
  const random=seededRandom(2026)
  for(let trial=0;trial<500;trial++) {
    const stacks=Array.from({length:2+trial%5},()=>1+Math.floor(random()*500))
    let s=newHoldem({stacks,seed:trial}), initial=chips(s), turns=0
    while(s.stage!=='ended'&&turns++<200) {
      const legal=legalActions(s), action=legal[Math.floor(random()*legal.length)], l=bettingLimits(s)
      s=act(s,action,l.min+Math.floor(random()*(l.max-l.min+1)))
      assert.equal(chips(s),initial)
      assert.ok(s.players.every(p=>Number.isSafeInteger(p.stack)&&p.stack>=0))
    }
    assert.equal(s.stage,'ended')
  }
})

test('unmatched excess is refunded, not reported as a side-pot victory', () => {
  const board=[card(2,0,200),card(3,1,201),card(4,2,202),card(9,3,203),card(13,0,204)]
  let s=newHoldem({opponents:1,seed:1})
  s={...s,boardDeck:board,pot:400,players:[{...s.players[0],stack:0,total:100,hole:[card(1,1,210),card(5,2,211)]},{...s.players[1],stack:0,total:300,hole:[card(13,1,212),card(13,2,213)]}]}
  const done=settle(s);assert.deepEqual(done.result.awards,[200,0]);assert.deepEqual(done.result.refunds,[0,200]);assert.deepEqual(done.result.winners,[0]);assert.equal(chips(done),400)
})
