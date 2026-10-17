import { canTab, isWon } from './klondike.js'

export const sessionKey = daily => daily
  ? `buga-solitaire-session-v1-daily-${daily.day ?? 'challenge'}-${daily.seed}`
  : 'buga-solitaire-session-v1'

// Treat browser storage as untrusted: reject incomplete/duplicated decks and broken piles.
export function validState(s) {
  if (!s || ![1, 3].includes(s.drawCount) || !Number.isSafeInteger(s.moves) || s.moves < 0 ||
      !Array.isArray(s.stock) || !Array.isArray(s.waste) || !Array.isArray(s.tab) || s.tab.length !== 7 ||
      !Array.isArray(s.found) || s.found.length !== 4 || ![...s.tab, ...s.found].every(Array.isArray)) return false
  const cards = [...s.stock, ...s.waste, ...s.tab.flat(), ...s.found.flat()]
  if (cards.length !== 52 || !cards.every(c => c && Number.isInteger(c.suit) && c.suit >= 0 && c.suit < 4 &&
      Number.isInteger(c.rank) && c.rank >= 1 && c.rank <= 13 && c.id === c.suit * 13 + c.rank - 1 && typeof c.up === 'boolean') ||
      new Set(cards.map(c => c.id)).size !== 52) return false
  return s.stock.every(c => !c.up) && s.waste.every(c => c.up) &&
    s.found.every(p => p.every((c, i) => c.up && c.rank === i + 1 && c.suit === p[0].suit)) &&
    s.tab.every(p => (!p.length || p.at(-1).up) && p.every((c, i) => !i || !p[i - 1].up || (c.up && canTab(c, [p[i - 1]]))))
}

export function readSession(storage, key, daily = false) {
  try {
    const data = JSON.parse(storage.getItem(key))
    if (data?.version !== 1 || !validState(data.s) || !Number.isSafeInteger(data.time) || data.time < 0 ||
        typeof data.reported !== 'boolean' || !Array.isArray(data.history) || data.history.length > 80 ||
        !data.history.every(s => validState(s) && s.drawCount === data.s.drawCount) ||
        (daily && (data.s.drawCount !== 1 || isWon(data.s)))) return null
    return data
  } catch { return null }
}

export function writeSession(storage, key, data) {
  try { storage.setItem(key, JSON.stringify({ ...data, version: 1 })); return true } catch { return false }
}
