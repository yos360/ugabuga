import { deck, shuffled } from './cards.js'
import { compareHands, evaluateFive } from './poker.js'

export const LEVELS = { easy: 'רגוע', medium: 'חכם', hard: 'מומחה' }
const visible = cards => cards.map(card => ({ ...card, up: true }))

export function newDrawGame(rand = Math.random, difficulty = 'medium', chips = 500) {
  const cards = shuffled(deck(), rand), ante = Math.min(10, chips)
  return { difficulty, stage: 'opening', player: visible(cards.slice(0, 5)), computer: visible(cards.slice(5, 10)), stock: cards.slice(10), pot: ante * 2, chips: chips - ante, computerChips: 500 - ante, selected: [], message: 'בחרו אם לבדוק או להמר לפני ההחלפה', result: null }
}

export function discardPlan(cards) {
  const hand = evaluateFive(cards), ranks = new Map()
  cards.forEach((card, index) => ranks.set(card.rank, [...(ranks.get(card.rank) || []), index]))
  if (hand.category >= 4 || hand.category === 2) return []
  const made = [...ranks.values()].filter(group => group.length >= 2).flat()
  if (made.length) return cards.map((_, index) => index).filter(index => !made.includes(index))
  const suits = [0, 1, 2, 3].map(suit => cards.map((card, index) => card.suit === suit ? index : -1).filter(index => index >= 0))
  const flushDraw = suits.find(group => group.length === 4)
  if (flushDraw) return cards.map((_, index) => index).filter(index => !flushDraw.includes(index))
  const values = cards.map((card, index) => ({ index, value: card.rank === 1 ? 14 : card.rank })).sort((a, b) => a.value - b.value)
  let straightKeep = []
  for (let start = 0; start <= 10; start++) {
    const run = new Set([start || 14, start + 1 || 2, start + 2, start + 3, start + 4])
    const keep = values.filter(item => run.has(item.value)).map(item => item.index)
    if (new Set(keep.map(index => cards[index].rank)).size === 4) straightKeep = keep
  }
  if (straightKeep.length === 4) return cards.map((_, index) => index).filter(index => !straightKeep.includes(index))
  const keep = values.slice(-2).map(item => item.index)
  return cards.map((_, index) => index).filter(index => !keep.includes(index))
}

export function exchange(hand, stock, indices) {
  const chosen = [...new Set(indices)].filter(index => index >= 0 && index < 5).slice(0, 3).sort((a, b) => a - b)
  const next = hand.slice(), remaining = stock.slice()
  for (const index of chosen) next[index] = { ...remaining.shift(), up: true }
  return { hand: next, stock: remaining, count: chosen.length }
}

export function computerAction(cards, difficulty = 'medium', rand = Math.random, facingBet = false) {
  const strength = evaluateFive(cards).category
  const noise = difficulty === 'easy' ? rand() * 3 - 1.5 : difficulty === 'hard' ? rand() * .35 : rand() * 1.1 - .3
  const estimate = strength + noise
  if (facingBet && estimate < .7) return 'fold'
  if (estimate >= 2.5 || (!facingBet && estimate >= 1.4)) return 'raise'
  return facingBet ? 'call' : 'check'
}

export function showdown(state) {
  const playerHand = evaluateFive(state.player), computerHand = evaluateFive(state.computer), comparison = compareHands(playerHand, computerHand)
  const playerWins = comparison > 0, tie = comparison === 0
  return { ...state, stage: 'ended', chips: state.chips + (playerWins ? state.pot : tie ? Math.floor(state.pot / 2) : 0), result: { playerWins, tie, playerHand, computerHand }, message: tie ? 'תיקו — הקופה מתחלקת' : playerWins ? `ניצחתם עם ${playerHand.name}!` : `המחשב ניצח עם ${computerHand.name}` }
}

export function playOpening(state, action, rand = Math.random) {
  if (state.stage !== 'opening') return state
  if (action === 'fold') return { ...state, stage: 'ended', result: { folded: true }, message: 'פרשתם מהיד' }
  const stake = action === 'bet' ? Math.min(20, state.chips) : 0
  let next = { ...state, chips: state.chips - stake, pot: state.pot + stake }
  const reply = computerAction(state.computer, state.difficulty, rand, stake > 0)
  if (reply === 'fold') return { ...next, stage: 'ended', chips: next.chips + next.pot, result: { computerFolded: true }, message: 'המחשב פרש — הקופה שלכם!' }
  const computerStake = reply === 'raise' ? Math.min(stake + 10 || 10, next.computerChips) : Math.min(stake, next.computerChips)
  next = { ...next, computerChips: next.computerChips - computerStake, pot: next.pot + computerStake, stage: 'draw', message: reply === 'raise' ? 'המחשב העלה. בחרו עד 3 קלפים להחלפה' : 'בחרו עד 3 קלפים להחלפה' }
  return next
}

export function drawCards(state) {
  if (state.stage !== 'draw') return state
  const playerDraw = exchange(state.player, state.stock, state.selected), plan = discardPlan(state.computer), computerDraw = exchange(state.computer, playerDraw.stock, plan)
  return { ...state, player: playerDraw.hand, computer: computerDraw.hand, stock: computerDraw.stock, selected: [], stage: 'final', message: `החלפתם ${playerDraw.count} קלפים, המחשב החליף ${computerDraw.count}. סבב ההימור האחרון` }
}

export function playFinal(state, action, rand = Math.random) {
  if (state.stage !== 'final') return state
  if (action === 'fold') return { ...state, stage: 'ended', result: { folded: true }, message: 'פרשתם מהיד' }
  const stake = action === 'bet' ? Math.min(30, state.chips) : 0, reply = computerAction(state.computer, state.difficulty, rand, stake > 0)
  const next = { ...state, chips: state.chips - stake, pot: state.pot + stake }
  if (reply === 'fold') return { ...next, stage: 'ended', chips: next.chips + next.pot, result: { computerFolded: true }, message: 'המחשב פרש — הקופה שלכם!' }
  const computerStake = Math.min(stake, next.computerChips)
  return showdown({ ...next, computerChips: next.computerChips - computerStake, pot: next.pot + computerStake })
}
