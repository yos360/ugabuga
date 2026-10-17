import { deck, shuffled } from './cards.js'
import { rng } from './rng.js'

export const cardValue = card => Math.min(card.rank, 10)

const meldCandidates = hand => {
  const candidates = []
  for (let rank = 1; rank <= 13; rank++) {
    const indices = hand.map((card, index) => card.rank === rank ? index : -1).filter(index => index >= 0)
    if (indices.length >= 3) {
      if (indices.length === 4) candidates.push({ type: 'set', rank, indices, mask: indices.reduce((mask, index) => mask | (1 << index), 0) })
      for (let omit = 0; omit < indices.length; omit++) {
        const part = indices.length === 3 ? indices : indices.filter((_, index) => index !== omit)
        candidates.push({ type: 'set', rank, indices: part, mask: part.reduce((mask, index) => mask | (1 << index), 0) })
        if (indices.length === 3) break
      }
    }
  }
  for (let suit = 0; suit < 4; suit++) {
    const suited = hand.map((card, index) => ({ card, index })).filter(item => item.card.suit === suit).sort((a, b) => a.card.rank - b.card.rank)
    for (let start = 0; start < suited.length; start++) for (let end = start + 2; end < suited.length; end++) {
      const slice = suited.slice(start, end + 1)
      if (slice.every((item, index) => !index || item.card.rank === slice[index - 1].card.rank + 1)) {
        const indices = slice.map(item => item.index)
        candidates.push({ type: 'run', suit, min: slice[0].card.rank, max: slice.at(-1).card.rank, indices, mask: indices.reduce((mask, index) => mask | (1 << index), 0) })
      }
    }
  }
  return candidates
}

export function bestMelds(hand) {
  const candidates = meldCandidates(hand), total = hand.reduce((sum, card) => sum + cardValue(card), 0)
  let best = { value: 0, melds: [] }
  const search = (start, used, value, melds) => {
    if (value > best.value) best = { value, melds: [...melds] }
    for (let index = start; index < candidates.length; index++) {
      const meld = candidates[index]
      if (used & meld.mask) continue
      search(index + 1, used | meld.mask, value + meld.indices.reduce((sum, cardIndex) => sum + cardValue(hand[cardIndex]), 0), [...melds, meld])
    }
  }
  search(0, 0, 0, [])
  const used = new Set(best.melds.flatMap(meld => meld.indices))
  return { melds: best.melds.map(meld => ({ ...meld, cards: meld.indices.map(index => hand[index]) })), deadwood: total - best.value, deadwoodCards: hand.filter((_, index) => !used.has(index)) }
}

export function layoffDeadwood(cards, melds) {
  const open = melds.map(meld => meld.type === 'set'
    ? { type: 'set', rank: meld.rank, suits: new Set(meld.cards.map(card => card.suit)) }
    : { type: 'run', suit: meld.suit, min: meld.min, max: meld.max })
  const remaining = [...cards]
  let changed = true
  while (changed) {
    changed = false
    for (let index = 0; index < remaining.length; index++) {
      const card = remaining[index]
      const target = open.find(meld => meld.type === 'set' ? meld.rank === card.rank && !meld.suits.has(card.suit) && meld.suits.size < 4 : meld.suit === card.suit && (card.rank === meld.min - 1 || card.rank === meld.max + 1))
      if (!target) continue
      if (target.type === 'set') target.suits.add(card.suit)
      else if (card.rank === target.min - 1) target.min--
      else target.max++
      remaining.splice(index, 1); changed = true; break
    }
  }
  return { cards: remaining, deadwood: remaining.reduce((sum, card) => sum + cardValue(card), 0) }
}

export function scoreKnock(knockerHand, opponentHand) {
  const knocker = bestMelds(knockerHand), opponent = bestMelds(opponentHand)
  if (knocker.deadwood > 10) return null
  if (knocker.deadwood === 0) return { winner: 'knocker', points: 25 + opponent.deadwood, gin: true, undercut: false, knockerDeadwood: 0, opponentDeadwood: opponent.deadwood }
  const laid = layoffDeadwood(opponent.deadwoodCards, knocker.melds)
  if (laid.deadwood <= knocker.deadwood) return { winner: 'opponent', points: 25 + knocker.deadwood - laid.deadwood, gin: false, undercut: true, knockerDeadwood: knocker.deadwood, opponentDeadwood: laid.deadwood }
  return { winner: 'knocker', points: laid.deadwood - knocker.deadwood, gin: false, undercut: false, knockerDeadwood: knocker.deadwood, opponentDeadwood: laid.deadwood }
}

export function dealRound({ seed = Math.floor(Math.random() * 0x7fffffff), dealer = 1, scores = [0, 0], round = 1 } = {}) {
  const cards = shuffled(deck().map(card => ({ ...card, up: true })), rng(seed)), hands = [[], []]
  for (let count = 0; count < 10; count++) { hands[0].push(cards.pop()); hands[1].push(cards.pop()) }
  const first = cards.pop()
  return { version: 1, seed, dealer, round, scores: [...scores], hands, stock: cards, discard: [first], turn: (dealer + 1) % 2, phase: 'draw', drawnSource: null, drawnId: null, result: null }
}

export function drawCard(state, player, source) {
  if (state.phase !== 'draw' || state.turn !== player || !['stock', 'discard'].includes(source)) return null
  if (source === 'stock' && !state.stock.length) return { ...state, phase: 'round-over', result: { draw: true, points: 0 } }
  const card = source === 'stock' ? state.stock.at(-1) : state.discard.at(-1)
  return { ...state, hands: state.hands.map((hand, seat) => seat === player ? [...hand, card] : [...hand]), stock: source === 'stock' ? state.stock.slice(0, -1) : [...state.stock],
    discard: source === 'discard' ? state.discard.slice(0, -1) : [...state.discard], phase: 'discard', drawnSource: source, drawnId: card.id }
}

export function discardCard(state, player, index, knock = false) {
  if (state.phase !== 'discard' || state.turn !== player || !state.hands[player][index]) return null
  const card = state.hands[player][index]
  if (state.drawnSource === 'discard' && card.id === state.drawnId) return null
  const hands = state.hands.map(hand => [...hand]); hands[player].splice(index, 1)
  if (knock) {
    const scored = scoreKnock(hands[player], hands[1 - player])
    if (!scored) return null
    const winner = scored.winner === 'knocker' ? player : 1 - player, scores = state.scores.map((score, seat) => seat === winner ? score + scored.points : score)
    return { ...state, hands, discard: [...state.discard, card], phase: Math.max(...scores) >= 100 ? 'match-over' : 'round-over', scores, result: { ...scored, winner, knocker: player }, drawnSource: null, drawnId: null }
  }
  return { ...state, hands, discard: [...state.discard, card], turn: 1 - player, phase: 'draw', drawnSource: null, drawnId: null }
}

const discardChoice = (hand, forbiddenId = null, difficulty = 'normal') => {
  const options = hand.map((card, index) => ({ card, index })).filter(item => item.card.id !== forbiddenId).map(item => ({ ...item, analysis: bestMelds(hand.filter((_, index) => index !== item.index)) }))
  return options.reduce((best, item) => {
    if (item.analysis.deadwood !== best.analysis.deadwood) return item.analysis.deadwood < best.analysis.deadwood ? item : best
    if (difficulty === 'easy') return item.index < best.index ? item : best
    return cardValue(item.card) > cardValue(best.card) ? item : best
  }).index
}

export function aiTurn(state, difficulty = 'normal') {
  if (state.turn !== 1 || state.phase !== 'draw') return state
  const current = bestMelds(state.hands[1]).deadwood, discardTop = state.discard.at(-1)
  const withDiscard = [...state.hands[1], discardTop], discardIndex = discardChoice(withDiscard, discardTop.id, difficulty)
  const improved = bestMelds(withDiscard.filter((_, index) => index !== discardIndex)).deadwood < current
  let next = drawCard(state, 1, improved ? 'discard' : 'stock')
  if (next.phase === 'round-over') return next
  const index = discardChoice(next.hands[1], next.drawnSource === 'discard' ? next.drawnId : null, difficulty)
  const finalHand = next.hands[1].filter((_, cardIndex) => cardIndex !== index), deadwood = bestMelds(finalHand).deadwood
  const knock = deadwood === 0 || (difficulty === 'hard' && deadwood <= 10) || (difficulty === 'normal' && deadwood <= 5)
  return discardCard(next, 1, index, knock)
}

export function nextRound(state) {
  if (!['round-over', 'match-over'].includes(state.phase)) return state
  return dealRound({ seed: state.seed + 1, dealer: 1 - state.dealer, scores: state.phase === 'match-over' ? [0, 0] : state.scores, round: state.phase === 'match-over' ? 1 : state.round + 1 })
}

export function validState(value) {
  if (value?.version !== 1 || !Array.isArray(value.hands) || value.hands.length !== 2 || !Array.isArray(value.stock) || !Array.isArray(value.discard) || !value.discard.length) return false
  const cards = [...value.hands.flat(), ...value.stock, ...value.discard]
  return cards.length === 52 && new Set(cards.map(card => card.id)).size === 52 && [0, 1].includes(value.turn) && ['draw', 'discard', 'round-over', 'match-over'].includes(value.phase)
}
