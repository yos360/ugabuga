// Memory / pairs (public-domain card game): flip two cards, keep them if they match.
export const THEMES = [
  ['🐶', '🐱', '🐰', '🦊', '🐼', '🐸', '🐵', '🦁', '🐯', '🐨', '🐷', '🐮', '🐔', '🐧', '🦄', '🐙', '🦋', '🐢'],
  ['🍎', '🍌', '🍇', '🍓', '🍉', '🍍', '🥝', '🍒', '🥕', '🌽', '🍕', '🧁', '🍩', '🍪', '🍿', '🍦', '🥨', '🍋'],
  ['🚗', '🚌', '🚒', '🚑', '🚜', '🚲', '🛴', '✈️', '🚀', '🚁', '⛵', '🚂', '🛸', '🏎️', '🚓', '🚕', '🛵', '🚤'],
]
// pairs per level: 1 → 6 pairs, then up to 15
export const pairsFor = level => Math.min(6 + (level - 1) * 2, 15)
export const colsFor = cards => (cards <= 12 ? 4 : cards <= 20 ? 5 : 6)

export function build(level, rand = Math.random) {
  const pairs = pairsFor(level)
  const theme = THEMES[(level - 1) % THEMES.length]
  const picks = theme.slice().sort(() => rand() - 0.5).slice(0, pairs)
  const cards = [...picks, ...picks].map((face, i) => ({ id: i, face, open: false, done: false }))
  for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]] }
  return cards
}
// Stars: a perfect game takes `pairs` turns.
export const starsForTurns = (turns, pairs) => (turns <= pairs * 1.5 ? 3 : turns <= pairs * 2.2 ? 2 : 1)
