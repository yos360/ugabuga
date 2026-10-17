import { deck, shuffled } from './cards.js'
import { bestHand, compareHands } from './poker.js'

export const STREETS = { preflop: 'לפני הפלופ', flop: 'פלופ', turn: 'טרן', river: 'ריבר', ended: 'סיום' }
export const DIFFICULTIES = { easy: 'רגוע', medium: 'חכם', hard: 'מומחה' }
const alive = state => state.players.filter(player => !player.folded)
const active = state => state.players.filter(player => !player.folded && !player.allIn)
const highestBet = state => Math.max(0, ...state.players.map(player => player.bet))
const pay = (player, amount) => { const paid = Math.min(player.stack, Math.max(0, amount)); return { ...player, stack: player.stack - paid, bet: player.bet + paid, total: player.total + paid, allIn: player.stack === paid } }

export function blindSize(handNumber = 0) { return 10 * 2 ** Math.floor(handNumber / 5) }

export function newHoldem({ opponents = 3, difficulty = 'medium', stacks, handNumber = 0, rand = Math.random } = {}) {
  const count = Math.max(2, Math.min(6, opponents + 1)), cards = shuffled(deck(), rand), bigBlind = blindSize(handNumber), players = Array.from({ length: count }, (_, index) => ({ id: index, name: index ? `בוט ${index}` : 'אתם', stack: stacks?.[index] ?? 1000, bet: 0, total: 0, folded: false, allIn: false, hole: [{ ...cards[index * 2], up: true }, { ...cards[index * 2 + 1], up: true }] }))
  const smallIndex = count === 2 ? 0 : 1, bigIndex = count === 2 ? 1 : 2
  players[smallIndex] = pay(players[smallIndex], bigBlind / 2); players[bigIndex] = pay(players[bigIndex], bigBlind)
  return { difficulty, handNumber, bigBlind, dealer: 0, stage: 'preflop', players, boardDeck: cards.slice(count * 2, count * 2 + 5).map(card => ({ ...card, up: true })), board: [], current: count === 2 ? 0 : (bigIndex + 1) % count, acted: [], pot: bigBlind * 1.5, message: `בליינדים ${bigBlind / 2}/${bigBlind}`, result: null }
}

export function legalActions(state, index = state.current) {
  const player = state.players[index]
  if (!player || player.folded || player.allIn || state.stage === 'ended') return []
  const toCall = highestBet(state) - player.bet, actions = ['fold']
  if (!toCall) actions.push('check'); else actions.push('call')
  if (player.stack > toCall) actions.push(highestBet(state) ? 'raise' : 'bet')
  if (player.stack) actions.push('all-in')
  return actions
}

function sidePots(players) {
  const levels = [...new Set(players.map(player => player.total).filter(Boolean))].sort((a, b) => a - b); let previous = 0
  return levels.map(level => { const contributors = players.filter(player => player.total >= level), amount = (level - previous) * contributors.length; previous = level; return { amount, eligible: contributors.filter(player => !player.folded).map(player => player.id) } }).filter(pot => pot.amount)
}
export { sidePots }

export function settle(state) {
  const players = state.players.map(player => ({ ...player })), pots = sidePots(players), awards = Array(players.length).fill(0)
  for (const pot of pots) {
    const contenders = pot.eligible.map(index => ({ index, hand: bestHand([...players[index].hole, ...state.boardDeck]) }))
    const top = contenders.reduce((best, item) => compareHands(item.hand, best.hand) > 0 ? item : best), winners = contenders.filter(item => compareHands(item.hand, top.hand) === 0)
    winners.forEach((winner, order) => { awards[winner.index] += Math.floor(pot.amount / winners.length) + (order < pot.amount % winners.length ? 1 : 0) })
  }
  players.forEach((player, index) => { player.stack += awards[index] })
  const winners = awards.map((amount, index) => ({ amount, index })).filter(item => item.amount === Math.max(...awards) && item.amount > 0).map(item => item.index)
  return { ...state, players, board: state.boardDeck, stage: 'ended', current: -1, pot: 0, result: { awards, winners, pots }, message: winners.includes(0) ? `זכיתם ב־${awards[0]} אסימונים!` : winners.length > 1 ? 'הקופה התחלקה' : `${players[winners[0]]?.name || 'היריב'} זכה בקופה` }
}

function settleLast(state) {
  const winner = alive(state)[0], players = state.players.map(player => player.id === winner.id ? { ...player, stack: player.stack + state.pot } : player)
  return { ...state, players, stage: 'ended', current: -1, result: { awards: players.map(player => player.id === winner.id ? state.pot : 0), winners: [winner.id], pots: [{ amount: state.pot, eligible: [winner.id] }] }, message: winner.id === 0 ? `כל היריבים פרשו — זכיתם ב־${state.pot} אסימונים!` : `${winner.name} זכה אחרי שכל האחרים פרשו`, pot: 0 }
}

function nextStreet(state) {
  if (state.stage === 'river') return settle(state)
  const nextStage = state.stage === 'preflop' ? 'flop' : state.stage === 'flop' ? 'turn' : 'river', count = nextStage === 'flop' ? 3 : nextStage === 'turn' ? 4 : 5
  const players = state.players.map(player => ({ ...player, bet: 0 })), first = players.find(player => !player.folded && !player.allIn)?.id ?? -1
  const next = { ...state, stage: nextStage, board: state.boardDeck.slice(0, count), players, current: first, acted: [], message: STREETS[nextStage] }
  return active(next).length <= 1 ? nextStreet(next) : next
}

export function act(state, action, amount = state.bigBlind) {
  const index = state.current, allowed = legalActions(state, index)
  if (!allowed.includes(action)) return state
  let players = state.players.map(player => ({ ...player })), player = players[index], raised = false
  if (action === 'fold') player = { ...player, folded: true }
  if (action === 'call') player = pay(player, highestBet(state) - player.bet)
  if (action === 'bet' || action === 'raise') { player = pay(player, highestBet(state) - player.bet + Math.max(state.bigBlind, amount)); raised = true }
  if (action === 'all-in') { raised = player.bet + player.stack > highestBet(state); player = pay(player, player.stack) }
  players[index] = player
  let next = { ...state, players, pot: players.reduce((sum, item) => sum + item.total, 0), acted: raised ? [index] : [...new Set([...state.acted, index])] }
  if (alive(next).length === 1) return settleLast(next)
  const max = highestBet(next), roundDone = active(next).every(item => item.bet === max && next.acted.includes(item.id))
  if (roundDone) return nextStreet(next)
  for (let step = 1; step <= players.length; step++) { const candidate = (index + step) % players.length; if (!players[candidate].folded && !players[candidate].allIn) { next.current = candidate; break } }
  return next
}

function holeStrength(cards) {
  const values = cards.map(card => card.rank === 1 ? 14 : card.rank), pair = values[0] === values[1], suited = cards[0].suit === cards[1].suit
  return (pair ? 2 + values[0] / 14 : (Math.max(...values) + Math.min(...values) / 2) / 14) + (suited ? .25 : 0) + (Math.abs(values[0] - values[1]) <= 2 ? .2 : 0)
}

export function botDecision(state, index, rand = Math.random) {
  const legal = legalActions(state, index), player = state.players[index], toCall = highestBet(state) - player.bet
  let strength = state.board.length >= 3 ? bestHand([...player.hole, ...state.board]).category + .4 : holeStrength(player.hole)
  strength += state.difficulty === 'easy' ? rand() * 2 - .7 : state.difficulty === 'hard' ? rand() * .25 : rand() * .8 - .2
  if (legal.includes('raise') && strength >= 3.1) return { type: 'raise', amount: Math.max(state.bigBlind, Math.floor(state.pot / 2)) }
  if (legal.includes('bet') && strength >= 2.1) return { type: 'bet', amount: Math.max(state.bigBlind, Math.floor(state.pot / 2)) }
  if (legal.includes('fold') && toCall > 0 && strength < .9 && toCall > state.bigBlind) return { type: 'fold' }
  if (legal.includes('call')) return { type: 'call' }
  return { type: legal.includes('check') ? 'check' : legal.at(-1) }
}

export function runBots(state, rand = Math.random) {
  let next = state, guard = 0
  while (next.stage !== 'ended' && next.current !== 0 && guard++ < 100) { const choice = botDecision(next, next.current, rand); next = act(next, choice.type, choice.amount) }
  return next
}
