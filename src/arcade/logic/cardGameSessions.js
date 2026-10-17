import { deck } from './cards.js'
import { pairsFor, THEMES } from './memory.js'

export const cardSessionKey = (game, daily) => `buga-${game}-session-v1${daily ? `-daily-${daily.day ?? 'challenge'}-${daily.seed}` : ''}`
const count = n => Number.isSafeInteger(n) && n >= 0

export function validSpider(s) {
  if (!s || ![1, 2, 4].includes(s.suits) || !count(s.moves) || !count(s.done) || s.done > 8 ||
      !Array.isArray(s.doneSuits) || s.doneSuits.length !== s.done || !Array.isArray(s.stock) || s.stock.length > 50 || s.stock.length % 10 ||
      !Array.isArray(s.tab) || s.tab.length !== 10 || !s.tab.every(Array.isArray)) return false
  const suits = s.suits === 1 ? [0] : s.suits === 2 ? [0, 1] : [0, 1, 2, 3]
  const expected = deck(suits, 8 / suits.length)
  const cards = [...s.stock, ...s.tab.flat()]
  if (cards.length + s.done * 13 !== 104 || new Set(cards.map(c => c?.id)).size !== cards.length ||
      !cards.every(c => c && Number.isInteger(c.id) && expected[c.id]?.suit === c.suit && expected[c.id]?.rank === c.rank && typeof c.up === 'boolean') ||
      !s.doneSuits.every(suit => suits.includes(suit)) || !s.stock.every(c => !c.up) ||
      !s.tab.every(p => (!p.length || p.at(-1).up) && p.every((c, i) => !i || !p[i - 1].up || c.up))) return false
  return suits.every(suit => Array.from({ length: 13 }, (_, i) => i + 1).every(rank =>
    cards.filter(c => c.suit === suit && c.rank === rank).length + s.doneSuits.filter(v => v === suit).length === 8 / suits.length))
}

export function validMemory(data) {
  if (!data || !Number.isSafeInteger(data.level) || data.level < 1 || !count(data.turns) || typeof data.peek !== 'boolean' ||
      !Array.isArray(data.cards) || data.cards.length !== pairsFor(data.level) * 2) return false
  const cards = data.cards, theme = THEMES[(data.level - 1) % THEMES.length]
  if (new Set(cards.map(c => c?.id)).size !== cards.length || !cards.every(c => c && Number.isInteger(c.id) && c.id >= 0 && c.id < cards.length &&
      theme.includes(c.face) && typeof c.open === 'boolean' && typeof c.done === 'boolean' && (!c.done || c.open))) return false
  return [...new Set(cards.map(c => c.face))].every(face => {
    const pair = cards.filter(c => c.face === face)
    return pair.length === 2 && pair[0].done === pair[1].done
  }) && cards.filter(c => c.done).length / 2 <= data.turns
}

export function readCardSession(storage, key, game, daily) {
  try {
    const data = JSON.parse(storage.getItem(key))
    if (data?.version !== 1 || typeof data.reported !== 'boolean') return null
    if (game === 'spider') {
      if (!validSpider(data.s) || !Array.isArray(data.history) || data.history.length > 60 ||
          !data.history.every(s => validSpider(s) && s.suits === data.s.suits) || (daily && (data.s.suits !== 1 || data.s.done === 8))) return null
    } else {
      if (!validMemory(data) || (daily && (data.level !== daily.level || data.cards.every(c => c.done)))) return null
      // Close an interrupted turn; never restore a mismatch without its cleanup timer.
      data.cards = data.cards.map(c => ({ ...c, open: c.done }))
    }
    return data
  } catch { return null }
}

export function writeCardSession(storage, key, data) {
  try { storage.setItem(key, JSON.stringify({ ...data, version: 1 })); return true } catch { return false }
}
