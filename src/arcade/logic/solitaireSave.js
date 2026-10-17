// A solitaire game in progress, kept in this browser so a refresh or a closed tab doesn't lose it.
// Storage is untrusted: a saved deal is used only if it is a full, well-formed Klondike position.
import { canTab, isWon } from './klondike.js'

const VERSION = 1
export const HISTORY_LIMIT = 80
export const saveKey = daily => daily ? `buga-solitaire-game-daily-${daily.seed}` : 'buga-solitaire-game'

export function validState(s) {
  if (!s || !Number.isSafeInteger(s.moves) || s.moves < 0 || !Array.isArray(s.stock) || !Array.isArray(s.waste) ||
    !Array.isArray(s.tab) || s.tab.length !== 7 || !Array.isArray(s.found) || s.found.length !== 4 || ![...s.tab, ...s.found].every(Array.isArray)) return false
  const cards = [...s.stock, ...s.waste, ...s.tab.flat(), ...s.found.flat()]
  if (cards.length !== 52 || new Set(cards.map(c => c?.id)).size !== 52) return false
  if (!cards.every(c => Number.isInteger(c.suit) && c.suit >= 0 && c.suit < 4 && Number.isInteger(c.rank) && c.rank >= 1 && c.rank <= 13 &&
    c.id === c.suit * 13 + c.rank - 1 && typeof c.up === 'boolean')) return false
  return s.stock.every(c => !c.up) && s.waste.every(c => c.up) &&
    s.found.every(p => p.every((c, i) => c.up && c.rank === i + 1 && c.suit === p[0].suit)) &&
    s.tab.every(p => (!p.length || p.at(-1).up) && p.every((c, i) => !i || !p[i - 1].up || (c.up && canTab(c, [p[i - 1]]))))
}

// Returns { s, history, time } or null. A finished game is never resumed.
export function readGame(storage, key) {
  try {
    const data = JSON.parse(storage.getItem(key))
    if (data?.v !== VERSION || !validState(data.s) || isWon(data.s) || !Number.isSafeInteger(data.time) || data.time < 0 ||
      !Array.isArray(data.history) || data.history.length > HISTORY_LIMIT || !data.history.every(validState)) return null
    return { s: data.s, history: data.history, time: data.time }
  } catch { return null }
}

export function writeGame(storage, key, { s, history, time }) {
  try {
    if (!s.moves || isWon(s)) storage.removeItem(key)
    else storage.setItem(key, JSON.stringify({ v: VERSION, s, history: history.slice(-HISTORY_LIMIT), time }))
    return true
  } catch { return false }
}
