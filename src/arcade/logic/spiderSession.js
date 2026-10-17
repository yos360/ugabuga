import { deck } from './cards.js'

export const spiderSessionKey = daily => `buga-spider-session-v1${daily ? `-daily-${daily.day ?? 'challenge'}-${daily.seed}` : ''}`
const nonNegative = value => Number.isSafeInteger(value) && value >= 0

export function validSpiderState(state) {
  if (!state || ![1, 2, 4].includes(state.suits) || !nonNegative(state.moves) || !nonNegative(state.done) || state.done > 8 ||
      !Array.isArray(state.doneSuits) || state.doneSuits.length !== state.done || !Array.isArray(state.stock) ||
      state.stock.length > 50 || state.stock.length % 10 !== 0 || !Array.isArray(state.tab) || state.tab.length !== 10 ||
      !state.tab.every(Array.isArray)) return false
  const suits = state.suits === 1 ? [0] : state.suits === 2 ? [0, 1] : [0, 1, 2, 3]
  const expected = deck(suits, 8 / suits.length)
  const cards = [...state.stock, ...state.tab.flat()]
  if (cards.length + state.done * 13 !== 104 || new Set(cards.map(card => card?.id)).size !== cards.length ||
      !cards.every(card => card && Number.isInteger(card.id) && expected[card.id]?.suit === card.suit && expected[card.id]?.rank === card.rank && typeof card.up === 'boolean') ||
      !state.doneSuits.every(suit => suits.includes(suit)) || !state.stock.every(card => !card.up) ||
      !state.tab.every(pile => (!pile.length || pile.at(-1).up) && pile.every((card, index) => index === 0 || !pile[index - 1].up || card.up))) return false
  return suits.every(suit => Array.from({ length: 13 }, (_, index) => index + 1).every(rank =>
    cards.filter(card => card.suit === suit && card.rank === rank).length + state.doneSuits.filter(doneSuit => doneSuit === suit).length === 8 / suits.length))
}

export function readSpiderSession(storage, key, daily = false) {
  try {
    const data = JSON.parse(storage.getItem(key))
    if (data?.version !== 1 || typeof data.reported !== 'boolean' || !validSpiderState(data.state) ||
        !Array.isArray(data.history) || data.history.length > 60 ||
        !data.history.every(item => validSpiderState(item) && item.suits === data.state.suits) ||
        (daily && (data.state.suits !== 1 || data.state.done === 8))) return null
    return data
  } catch { return null }
}

export function writeSpiderSession(storage, key, data) {
  try { storage.setItem(key, JSON.stringify({ ...data, version: 1 })); return true } catch { return false }
}
