import { deck, shuffled } from './cards.js'
import { bestHand, compareHands } from './poker.js'

export const STREETS = { preflop: 'לפני הפלופ', flop: 'פלופ', turn: 'טרן', river: 'ריבר', ended: 'סיום' }
export const DIFFICULTIES = { easy: 'רגוע', medium: 'חכם', hard: 'מומחה' }
export const VERSION = 2
const alive = s => s.players.filter(p => !p.folded && !p.busted)
const active = s => alive(s).filter(p => !p.allIn)
const sum = (players, key) => players.reduce((n, p) => n + p[key], 0)
const pay = (p, amount) => { const paid = Math.min(p.stack, amount); return { ...p, stack: p.stack - paid, bet: p.bet + paid, total: p.total + paid, allIn: p.stack === paid } }
const nextSeat = (players, from, predicate) => {
  for (let step = 1; step <= players.length; step++) { const i = (from + step + players.length) % players.length; if (predicate(players[i])) return i }
  return -1
}
// Serializable PRNG: both dealing and decisions continue exactly after reload.
export function seededRandom(seed) {
  let value = seed >>> 0
  const random = () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return value / 4294967296 }
  random.state = () => value
  return random
}
export function blindSize(handNumber = 0) { return 10 * 2 ** Math.min(12, Math.floor(handNumber / 5)) }

export function newHoldem({ opponents = 3, difficulty = 'medium', stacks, handNumber = 0, dealer = 0, seed, rngState, rand } = {}) {
  const random = rand || seededRandom(rngState ?? seed ?? Math.floor(Math.random() * 4294967296))
  const count = Math.max(2, Math.min(6, stacks?.length || opponents + 1)), cards = shuffled(deck(), random), bigBlind = blindSize(handNumber)
  const players = Array.from({ length: count }, (_, id) => {
    const stack = Math.max(0, Math.floor(stacks?.[id] ?? 1000))
    return { id, name: id ? `בוט ${id}` : 'אתם', stack, bet: 0, total: 0, busted: !stack, folded: !stack, allIn: false, hole: stack ? cards.slice(id * 2, id * 2 + 2).map(c => ({ ...c, up: true })) : [] }
  })
  dealer = players[dealer]?.stack ? dealer : nextSeat(players, dealer, p => p.stack > 0)
  const liveCount = players.filter(p => p.stack > 0).length
  if (liveCount < 2) return { version: VERSION, players, dealer, handNumber, difficulty, bigBlind, stage: 'ended', current: -1, board: [], boardDeck: [], pot: 0, tournamentOver: true, result: { awards: players.map(() => 0), winners: players.filter(p => p.stack).map(p => p.id), pots: [] }, message: 'הטורניר הסתיים' }
  const smallBlindSeat = liveCount === 2 ? dealer : nextSeat(players, dealer, p => p.stack > 0)
  const bigBlindSeat = nextSeat(players, smallBlindSeat, p => p.stack > 0)
  players[smallBlindSeat] = pay(players[smallBlindSeat], bigBlind / 2)
  players[bigBlindSeat] = pay(players[bigBlindSeat], bigBlind)
  const state = { version: VERSION, difficulty, handNumber, bigBlind, dealer, smallBlindSeat, bigBlindSeat, stage: 'preflop', players, boardDeck: cards.slice(count * 2, count * 2 + 5).map(c => ({ ...c, up: true })), board: [], current: -1, currentBet: bigBlind, lastRaise: bigBlind, actedAt: {}, pot: sum(players, 'total'), rngState: random.state?.() ?? 1, message: `בליינדים ${bigBlind / 2}/${bigBlind}`, result: null }
  return advance(state, bigBlindSeat)
}

export function nextHand(state) {
  if (state.stage !== 'ended') return state
  const dealer = nextSeat(state.players, state.dealer, p => p.stack > 0)
  return newHoldem({ stacks: state.players.map(p => p.stack), difficulty: state.difficulty, handNumber: state.handNumber + 1, dealer, rngState: state.rngState })
}

export function bettingLimits(state, index = state.current) {
  const p = state.players[index]
  if (!p) return { toCall: 0, min: 0, max: 0, canRaise: false }
  const high = state.currentBet, toCall = Math.min(p.stack, Math.max(0, high - p.bet)), max = p.bet + p.stack
  const reopened = state.actedAt[index] == null || (state.actedAt[index] === 0 && high > 0) || high - state.actedAt[index] >= state.lastRaise
  return { toCall, min: high < state.bigBlind ? state.bigBlind : high + state.lastRaise, max, canRaise: reopened && max > high && active(state).some(other => other.id !== index) }
}
export function legalActions(state, index = state.current) {
  const p = state.players[index]
  if (index !== state.current || !p || p.folded || p.busted || p.allIn || state.stage === 'ended') return []
  const l = bettingLimits(state, index), actions = ['fold', l.toCall ? 'call' : 'check']
  if (l.canRaise && l.max >= l.min) actions.push(state.currentBet ? 'raise' : 'bet')
  if (l.max <= state.currentBet || l.canRaise) actions.push('all-in')
  return actions
}
export function sidePots(players) {
  let previous = 0
  return [...new Set(players.map(p => p.total).filter(Boolean))].sort((a, b) => a - b).map(level => {
    const contributors = players.filter(p => p.total >= level), amount = (level - previous) * contributors.length
    previous = level
    return { amount, eligible: contributors.filter(p => !p.folded).map(p => p.id) }
  }).reduce((pots, pot) => {
    const previousPot = pots.at(-1)
    if (previousPot && previousPot.eligible.join(',') === pot.eligible.join(',')) previousPot.amount += pot.amount
    else pots.push(pot)
    return pots
  }, [])
}
function finish(state, awards, pots, showdown) {
  const players = state.players.map((p, i) => ({ ...p, stack: p.stack + awards[i], bet: 0, total: 0 }))
  const winners = awards.flatMap((amount, i) => amount ? [i] : [])
  return { ...state, players, board: showdown ? state.boardDeck : state.board, current: -1, stage: 'ended', pot: 0, result: { awards, winners, pots, showdown, refunds: state.refunds || players.map(() => 0) }, message: winners.includes(0) ? `קיבלתם ${awards[0]} אסימונים` : `${winners.map(i => players[i].name).join(', ')} זכו בקופה` }
}
export function settle(state) {
  if (state.stage === 'ended') return state
  // Return the unique unmatched contribution before forming contested pots.
  const players = state.players.map(p => ({ ...p })), refunds = players.map(() => 0)
  const byContribution = [...players].sort((a, b) => b.total - a.total)
  const excess = byContribution[0].total - byContribution[1].total
  if (excess > 0) {
    const p = players[byContribution[0].id]
    p.stack += excess; p.total -= excess; p.bet = Math.max(0, p.bet - excess); refunds[p.id] = excess
  }
  state = { ...state, players, refunds, pot: sum(players, 'total') }
  const pots = sidePots(players), awards = players.map(() => 0)
  for (const pot of pots) {
    const contenders = pot.eligible.map(index => ({ index, hand: bestHand([...state.players[index].hole, ...state.boardDeck]) }))
    if (!contenders.length) throw new Error('Pot without an eligible player')
    const top = contenders.reduce((best, item) => compareHands(item.hand, best.hand) > 0 ? item : best)
    const winners = contenders.filter(item => compareHands(item.hand, top.hand) === 0).sort((a, b) => ((a.index - state.dealer - 1 + state.players.length) % state.players.length) - ((b.index - state.dealer - 1 + state.players.length) % state.players.length))
    winners.forEach((winner, order) => { awards[winner.index] += Math.floor(pot.amount / winners.length) + (order < pot.amount % winners.length ? 1 : 0) })
  }
  return finish(state, awards, pots, true)
}
function nextStreet(state) {
  if (state.stage === 'river') return settle(state)
  const stage = { preflop: 'flop', flop: 'turn', turn: 'river' }[state.stage]
  const next = { ...state, stage, board: state.boardDeck.slice(0, { flop: 3, turn: 4, river: 5 }[stage]), players: state.players.map(p => ({ ...p, bet: 0 })), currentBet: 0, lastRaise: state.bigBlind, actedAt: {}, message: STREETS[stage] }
  return advance(next, state.dealer)
}
function advance(state, from) {
  if (alive(state).length === 1) {
    const winner = alive(state)[0].id, awards = state.players.map(p => p.id === winner ? state.pot : 0)
    return finish(state, awards, [{ amount: state.pot, eligible: [winner] }], false)
  }
  const actors = active(state)
  // A lone player only calls the actual all-in, not a nominal short big blind.
  if (actors.length === 1) state = { ...state, currentBet: Math.max(...alive(state).map(p => p.bet)) }
  if (!actors.length || (actors.length === 1 && actors[0].bet >= Math.max(...alive(state).map(p => p.bet)))) return settle(state)
  const needsAction = p => !p.folded && !p.busted && !p.allIn && (state.actedAt[p.id] == null || p.bet < state.currentBet)
  if (!actors.some(needsAction)) return nextStreet(state)
  return { ...state, current: nextSeat(state.players, from, needsAction) }
}
// Bet/raise amount is the TOTAL street bet (raise-to), never an increment.
export function act(state, action, amount) {
  if (!legalActions(state).includes(action)) return state
  const index = state.current, limits = bettingLimits(state), players = state.players.map(p => ({ ...p }))
  let p = players[index]
  if (action === 'bet' || action === 'raise') {
    if (!Number.isSafeInteger(amount) || amount < limits.min || amount > limits.max) return state
    p = pay(p, amount - p.bet)
  } else if (action === 'all-in') p = pay(p, p.stack)
  else if (action === 'call') p = pay(p, limits.toCall)
  else if (action === 'fold') p.folded = true
  players[index] = p
  const increase = Math.max(0, p.bet - state.currentBet)
  const lastRaise = increase >= state.lastRaise ? increase : state.lastRaise
  const next = { ...state, players, currentBet: Math.max(state.currentBet, p.bet), lastRaise, actedAt: { ...state.actedAt, [index]: Math.max(state.currentBet, p.bet) }, pot: sum(players, 'total') }
  return advance(next, index)
}

const rank = c => c.rank === 1 ? 14 : c.rank
export function handFeatures(state, index) {
  const p = state.players[index], hole = p.hole.map(rank), cards = [...p.hole, ...state.board], ranks = new Set(cards.map(rank))
  if (ranks.has(14)) ranks.add(1)
  const flushDraw = state.board.length < 5 && [0, 1, 2, 3].some(suit => cards.filter(c => c.suit === suit).length === 4 && p.hole.some(c => c.suit === suit))
  let straightDraw = false
  for (let low = 1; low <= 10; low++) if (Array.from({ length: 5 }, (_, i) => low + i).filter(r => ranks.has(r)).length === 4) straightDraw = state.board.length < 5
  const boardRanks = state.board.map(rank), wet = [0, 1, 2, 3].some(suit => state.board.filter(c => c.suit === suit).length >= 3) || new Set(boardRanks).size < boardRanks.length
  const position = ((index - state.dealer - 1 + state.players.length) % state.players.length) / (state.players.length - 1)
  const pair = hole[0] === hole[1], suited = p.hole[0].suit === p.hole[1].suit
  let strength = pair ? .5 + hole[0] / 32 : (Math.max(...hole) * .65 + Math.min(...hole) * .35) / 20 + (suited ? .06 : 0) + (Math.abs(hole[0] - hole[1]) <= 2 ? .05 : 0)
  if (state.board.length >= 3) {
    const hand = bestHand(cards)
    strength = [ .12, .39, .58, .69, .78, .84, .93, .98, .995 ][hand.category] + (hand.kickers[0] / 14) * .06
    // A pair on the board is shared; it is not a strong private made hand.
    if (hand.category === 1 && !pair && !hole.some(r => boardRanks.includes(r))) strength -= .2
    if (wet && hand.category < 4) strength -= .08
    if (flushDraw) strength += .15
    if (straightDraw) strength += .08
  }
  return { strength, position, flushDraw, straightDraw, wet, spr: p.stack / Math.max(1, state.pot) }
}
export function botDecision(state, index = state.current, rand = Math.random) {
  const legal = legalActions(state, index)
  if (!legal.length) return { type: null }
  const limits = bettingLimits(state, index), f = handFeatures(state, index)
  const config = { easy: { noise: .3, bluff: .03, margin: -.08 }, medium: { noise: .12, bluff: .06, margin: .02 }, hard: { noise: .04, bluff: .09, margin: .04 } }[state.difficulty] || { noise: .12, bluff: .06, margin: .02 }
  const strength = f.strength + (rand() - .5) * config.noise + f.position * .04
  const odds = limits.toCall / Math.max(1, state.pot + limits.toCall), multiway = Math.max(0, alive(state).length - 2) * .035
  const raise = legal.includes('raise') ? 'raise' : legal.includes('bet') ? 'bet' : null
  const bluff = rand() < config.bluff * (f.position > .5 ? 1 : .5) && alive(state).length <= 3 && (!limits.toCall || f.flushDraw || f.straightDraw)
  if (raise && (strength > .7 + multiway || bluff)) {
    const fraction = f.wet ? .75 : strength > .85 ? 1 : .5
    const target = state.currentBet + Math.floor((state.pot + limits.toCall) * fraction)
    const amount = Math.min(limits.max, Math.max(limits.min, f.spr < 1.5 && strength > .75 ? limits.max : target))
    return { type: raise, amount }
  }
  if (limits.toCall && strength - multiway < odds + config.margin) return { type: 'fold' }
  return { type: legal.includes('check') ? 'check' : 'call' }
}
export function stepBot(state, rand) {
  if (state.stage === 'ended' || state.current === 0) return state
  const random = rand || seededRandom(state.rngState), choice = botDecision(state, state.current, random)
  return act({ ...state, rngState: random.state?.() ?? state.rngState }, choice.type, choice.amount)
}
export function runBots(state, rand) {
  let next = state, guard = 0
  while (next.stage !== 'ended' && next.current !== 0 && guard++ < 1000) next = stepBot(next, rand)
  return next
}
