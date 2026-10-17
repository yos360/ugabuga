import { deck, shuffled } from './cards.js'
import { rng } from './rng.js'

export const TWO_CLUBS = 40
export const QUEEN_SPADES = 11
export const passDirection = round => ['left', 'right', 'across', 'hold'][(round - 1) % 4]
export const cardPenalty = card => card.suit === 1 ? 1 : card.suit === 0 && card.rank === 12 ? 13 : 0

export function dealRound({ seed = Math.floor(Math.random() * 0x7fffffff), round = 1, scores = [0, 0, 0, 0] } = {}) {
  const cards = shuffled(deck().map(card => ({ ...card, up: true })), rng(seed))
  const hands = Array.from({ length: 4 }, () => [])
  cards.forEach((card, index) => hands[index % 4].push(card))
  hands.forEach(hand => hand.sort((a, b) => a.suit - b.suit || a.rank - b.rank))
  const direction = passDirection(round)
  return { version: 1, seed, round, scores: [...scores], hands, taken: [[], [], [], []], trick: [], turn: direction === 'hold' ? hands.findIndex(hand => hand.some(card => card.id === TWO_CLUBS)) : 0,
    lead: null, heartsBroken: false, phase: direction === 'hold' ? 'play' : 'pass', pass: direction, trickNumber: 0, lastTrickWinner: null, roundScore: null, matchWinner: null }
}

export function legalMoves(state, player = state.turn) {
  if (state.phase !== 'play' || player !== state.turn) return []
  const hand = state.hands[player]
  if (!state.trick.length && state.trickNumber === 0) return hand.map((card, index) => card.id === TWO_CLUBS ? index : -1).filter(index => index >= 0)
  if (!state.trick.length) {
    const nonHearts = hand.map((card, index) => card.suit !== 1 ? index : -1).filter(index => index >= 0)
    return state.heartsBroken || !nonHearts.length ? hand.map((_, index) => index) : nonHearts
  }
  const follow = hand.map((card, index) => card.suit === state.lead ? index : -1).filter(index => index >= 0)
  let moves = follow.length ? follow : hand.map((_, index) => index)
  if (state.trickNumber === 0 && !follow.length) {
    const safe = moves.filter(index => cardPenalty(hand[index]) === 0)
    if (safe.length) moves = safe
  }
  return moves
}

const trickWinner = trick => {
  const lead = trick[0].card.suit
  return trick.filter(item => item.card.suit === lead).reduce((best, item) => item.card.rank > best.card.rank ? item : best).player
}

export const scoreRound = taken => {
  const raw = taken.map(cards => cards.reduce((sum, card) => sum + cardPenalty(card), 0))
  const shooter = raw.indexOf(26)
  return shooter >= 0 ? raw.map((_, player) => player === shooter ? 0 : 26) : raw
}

export function playCard(state, player, index) {
  if (!legalMoves(state, player).includes(index)) return null
  const next = { ...state, hands: state.hands.map(hand => [...hand]), trick: [...state.trick], taken: state.taken.map(cards => [...cards]) }
  const [card] = next.hands[player].splice(index, 1)
  next.trick.push({ player, card }); if (next.trick.length === 1) next.lead = card.suit
  if (card.suit === 1) next.heartsBroken = true
  if (next.trick.length < 4) { next.turn = (player + 1) % 4; return next }
  const winner = trickWinner(next.trick)
  next.taken[winner].push(...next.trick.map(item => item.card)); next.lastTrickWinner = winner; next.trick = []; next.lead = null; next.turn = winner; next.trickNumber++
  if (next.trickNumber < 13) return next
  next.roundScore = scoreRound(next.taken); next.scores = next.scores.map((score, seat) => score + next.roundScore[seat]); next.phase = 'round-over'
  if (Math.max(...next.scores) >= 100) { next.matchWinner = next.scores.indexOf(Math.min(...next.scores)); next.phase = 'match-over' }
  return next
}

const passTarget = (player, direction) => direction === 'left' ? (player + 1) % 4 : direction === 'right' ? (player + 3) % 4 : (player + 2) % 4
export function choosePass(hand, difficulty = 'normal') {
  const score = card => cardPenalty(card) * 20 + (card.suit === 0 && card.rank >= 10 ? card.rank * 3 : card.rank) + (difficulty === 'hard' && card.suit === 1 ? card.rank : 0)
  return hand.map((card, index) => ({ index, score: difficulty === 'easy' ? card.rank : score(card) })).sort((a, b) => b.score - a.score).slice(0, 3).map(item => item.index).sort((a, b) => a - b)
}

export function completePassing(state, humanIndices, difficulty = 'normal') {
  if (state.phase !== 'pass' || new Set(humanIndices).size !== 3 || humanIndices.some(index => index < 0 || index >= state.hands[0].length)) return null
  const picks = [humanIndices, ...state.hands.slice(1).map(hand => choosePass(hand, difficulty))]
  const outgoing = picks.map((indices, player) => indices.map(index => state.hands[player][index]))
  const hands = state.hands.map((hand, player) => hand.filter((_, index) => !picks[player].includes(index)))
  outgoing.forEach((cards, player) => hands[passTarget(player, state.pass)].push(...cards))
  hands.forEach(hand => hand.sort((a, b) => a.suit - b.suit || a.rank - b.rank))
  return { ...state, hands, phase: 'play', turn: hands.findIndex(hand => hand.some(card => card.id === TWO_CLUBS)) }
}

export function chooseAiCard(state, player, difficulty = 'normal') {
  const moves = legalMoves(state, player)
  if (!moves.length) return null
  if (difficulty === 'easy') return moves[0]
  const hand = state.hands[player], lead = state.lead
  const currentHigh = state.trick.filter(item => item.card.suit === lead).reduce((high, item) => Math.max(high, item.card.rank), 0)
  const losing = moves.filter(index => lead !== null && hand[index].suit === lead && hand[index].rank < currentHigh)
  if (losing.length) return losing.reduce((best, index) => hand[index].rank > hand[best].rank ? index : best)
  if (!state.trick.length) return moves.reduce((best, index) => hand[index].rank < hand[best].rank ? index : best)
  return moves.reduce((best, index) => {
    const a = cardPenalty(hand[index]) * 50 + hand[index].rank, b = cardPenalty(hand[best]) * 50 + hand[best].rank
    return difficulty === 'hard' ? (a > b ? index : best) : (a < b ? index : best)
  })
}

export function nextRound(state) {
  if (!['round-over', 'match-over'].includes(state.phase)) return state
  return dealRound({ seed: state.seed + 1, round: state.phase === 'match-over' ? 1 : state.round + 1, scores: state.phase === 'match-over' ? [0, 0, 0, 0] : state.scores })
}

export function validState(value) {
  if (value?.version !== 1 || !Array.isArray(value.hands) || value.hands.length !== 4 || !Array.isArray(value.taken) || value.taken.length !== 4 || !Array.isArray(value.trick)) return false
  const cards = [...value.hands.flat(), ...value.taken.flat(), ...value.trick.map(item => item.card)]
  return cards.length === 52 && new Set(cards.map(card => card.id)).size === 52 && value.turn >= 0 && value.turn < 4
}
