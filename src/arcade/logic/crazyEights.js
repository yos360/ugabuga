import { deck, shuffled } from './cards.js'
import { rng } from './rng.js'

export const cardPoints = card => card.rank === 8 ? 50 : card.rank > 10 ? 10 : card.rank
export const canPlay = (card, top, activeSuit) => card.rank === 8 || card.suit === activeSuit || card.rank === top.rank
export const availableMoves = (state, player = state.turn) => state.hands[player].map((card, index) => canPlay(card, state.discard.at(-1), state.activeSuit) ? index : -1).filter(index => index >= 0)

const nextPlayer = state => (state.turn + 1) % state.hands.length
const replenish = state => {
  if (state.stock.length || state.discard.length <= 1) return state
  const top = state.discard.at(-1), recycled = shuffled(state.discard.slice(0, -1), rng(state.seed + state.moves * 97))
  return { ...state, stock: recycled, discard: [top] }
}

export function newRound({ players = 2, seed = Math.floor(Math.random() * 0x7fffffff), dealer = 0, scores } = {}) {
  const count = Math.max(2, Math.min(4, players)), handSize = count === 2 ? 7 : 5
  const cards = shuffled(deck().map(card => ({ ...card, up: true })), rng(seed))
  const hands = Array.from({ length: count }, () => [])
  for (let i = 0; i < handSize; i++) for (let player = 0; player < count; player++) hands[player].push(cards.pop())
  let first = cards.pop()
  while (first.rank === 8) { cards.unshift(first); first = cards.pop() }
  return { version: 1, seed, dealer, turn: (dealer + 1) % count, hands, stock: cards, discard: [first], activeSuit: first.suit, phase: 'play', pendingEight: null,
    scores: Array.isArray(scores) && scores.length === count ? [...scores] : Array(count).fill(0), round: 1, moves: 0, winner: null }
}

const finishTurn = state => ({ ...state, turn: nextPlayer(state), moves: state.moves + 1 })

export function chooseSuit(hand) {
  const counts = [0, 0, 0, 0]
  hand.forEach(card => { if (card.rank !== 8) counts[card.suit]++ })
  return counts.indexOf(Math.max(...counts))
}

export function playCard(state, player, index, suit = null) {
  if (state.phase !== 'play' || player !== state.turn) return null
  const card = state.hands[player][index]
  if (!card || !canPlay(card, state.discard.at(-1), state.activeSuit)) return null
  const next = { ...state, hands: state.hands.map(hand => [...hand]), discard: [...state.discard, card], winner: null }
  next.hands[player].splice(index, 1)
  if (!next.hands[player].length) {
    const points = next.hands.reduce((sum, hand, opponent) => opponent === player ? sum : sum + hand.reduce((total, item) => total + cardPoints(item), 0), 0)
    next.scores = next.scores.map((score, seat) => seat === player ? score + points : score)
    return { ...next, phase: 'round-over', winner: player, roundPoints: points, moves: state.moves + 1, activeSuit: card.rank === 8 ? (suit ?? chooseSuit([])) : card.suit }
  }
  if (card.rank === 8 && suit === null) return { ...next, phase: 'choose-suit', pendingEight: player, moves: state.moves + 1 }
  next.activeSuit = card.rank === 8 ? suit : card.suit
  return finishTurn(next)
}

export function selectSuit(state, player, suit) {
  if (state.phase !== 'choose-suit' || state.pendingEight !== player || ![0, 1, 2, 3].includes(suit)) return null
  return { ...state, phase: 'play', pendingEight: null, activeSuit: suit, turn: (player + 1) % state.hands.length }
}

export function drawCard(state, player) {
  if (state.phase !== 'play' || player !== state.turn || availableMoves(state, player).length) return null
  let next = replenish(state)
  if (!next.stock.length) return finishTurn(next)
  const card = next.stock.at(-1)
  next = { ...next, stock: next.stock.slice(0, -1), hands: next.hands.map(hand => [...hand]) }
  next.hands[player].push(card)
  return canPlay(card, next.discard.at(-1), next.activeSuit) ? next : finishTurn(next)
}

const strategicScore = (state, player, index, difficulty) => {
  const card = state.hands[player][index], remaining = state.hands[player].filter((_, i) => i !== index)
  if (difficulty === 'easy') return -index
  const sameSuit = remaining.filter(item => item.suit === card.suit).length
  const dangerousOpponent = Math.min(...state.hands.filter((_, seat) => seat !== player).map(hand => hand.length)) <= 2
  let score = cardPoints(card) * 2 + sameSuit * 5
  if (card.rank === 8) score += dangerousOpponent ? 60 : -30
  if (difficulty === 'hard') score += chooseSuit(remaining) === card.suit ? 10 : 0
  return score
}

export function chooseAiMove(state, player, difficulty = 'normal') {
  const moves = availableMoves(state, player)
  if (!moves.length) return null
  return moves.reduce((best, index) => strategicScore(state, player, index, difficulty) > strategicScore(state, player, best, difficulty) ? index : best, moves[0])
}

export function aiTurn(state, difficulty = 'normal') {
  if (state.phase !== 'play' || state.turn === 0) return state
  const player = state.turn, chosen = chooseAiMove(state, player, difficulty)
  if (chosen !== null) {
    const card = state.hands[player][chosen]
    return playCard(state, player, chosen, card.rank === 8 ? chooseSuit(state.hands[player].filter((_, index) => index !== chosen)) : null)
  }
  const drawn = drawCard(state, player)
  if (!drawn || drawn.turn !== player) return drawn || state
  const afterDraw = chooseAiMove(drawn, player, difficulty)
  if (afterDraw === null) return finishTurn(drawn)
  const card = drawn.hands[player][afterDraw]
  return playCard(drawn, player, afterDraw, card.rank === 8 ? chooseSuit(drawn.hands[player].filter((_, index) => index !== afterDraw)) : null)
}

export function nextRound(state) {
  if (state.phase !== 'round-over') return state
  const next = newRound({ players: state.hands.length, seed: state.seed + 1, dealer: (state.dealer + 1) % state.hands.length, scores: state.scores })
  return { ...next, round: state.round + 1 }
}

export const matchWinner = (state, target = 100) => state.scores.findIndex(score => score >= target)

export function validState(value) {
  if (value?.version !== 1 || !Array.isArray(value.hands) || value.hands.length < 2 || value.hands.length > 4 || !Array.isArray(value.stock) || !Array.isArray(value.discard) || !value.discard.length) return false
  const cards = [...value.hands.flat(), ...value.stock, ...value.discard]
  return cards.length === 52 && new Set(cards.map(card => card.id)).size === 52 && value.turn >= 0 && value.turn < value.hands.length && [0, 1, 2, 3].includes(value.activeSuit)
}
