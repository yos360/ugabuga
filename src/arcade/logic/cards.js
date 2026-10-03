// Shared playing-card helpers for the solitaire games.
// card: { id, suit: 0..3 (♠ ♥ ♦ ♣), rank: 1..13, up: boolean }
export const SUITS = ['♠', '♥', '♦', '♣']
export const isRed = card => card.suit === 1 || card.suit === 2
export const rankLabel = r => ({ 1: 'A', 11: 'J', 12: 'Q', 13: 'K' })[r] || String(r)

export function shuffled(cards, rand = Math.random) {
  const a = cards.slice()
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

export function deck(suits = [0, 1, 2, 3], copies = 1) {
  const out = []
  let id = 0
  for (let c = 0; c < copies; c++) for (const suit of suits) for (let rank = 1; rank <= 13; rank++) out.push({ id: id++, suit, rank, up: false })
  return out
}

export const top = pile => pile[pile.length - 1]
export const flipTop = pile => (pile.length && !top(pile).up ? [...pile.slice(0, -1), { ...top(pile), up: true }] : pile)
