// Spider solitaire (public-domain card game). Ten piles; any card may sit on a card one
// rank higher, but only a run of ONE suit moves together. A full run K→A of one suit
// leaves the table. Deal 10 new cards from the stock when stuck. Clear 8 runs to win.
import { deck, shuffled, top, flipTop } from './cards.js'

export function deal(suitCount = 1, rand = Math.random) {
  const suits = suitCount === 1 ? [0] : suitCount === 2 ? [0, 1] : [0, 1, 2, 3]
  const cards = shuffled(deck(suits, 8 / suits.length), rand)
  const tab = []
  let k = 0
  for (let i = 0; i < 10; i++) {
    const n = i < 4 ? 6 : 5
    tab.push(cards.slice(k, k + n).map((c, j) => ({ ...c, up: j === n - 1 })))
    k += n
  }
  return { tab, stock: cards.slice(k).map(c => ({ ...c, up: false })), done: 0, doneSuits: [], moves: 0, suits: suitCount }
}

// Index where the movable run at the bottom of a pile starts.
export function runStart(pile) {
  let i = pile.length - 1
  if (i < 0) return -1
  while (i > 0 && pile[i - 1].up && pile[i - 1].suit === pile[i].suit && pile[i - 1].rank === pile[i].rank + 1) i--
  return i
}
export const canPick = (pile, index) => index >= 0 && index < pile.length && pile[index].up && runStart(pile) <= index

export function legal(s, from, index, to) {
  if (from === to || !canPick(s.tab[from], index)) return false
  const dst = s.tab[to]
  return !dst.length || top(dst).rank === s.tab[from][index].rank + 1
}

// Remove finished K→A runs of one suit from the bottom of a pile.
function collect(s, p) {
  const pile = s.tab[p]
  if (pile.length < 13) return s
  const run = pile.slice(-13)
  const ok = run.every((c, i) => c.up && c.suit === run[0].suit && c.rank === 13 - i)
  if (!ok) return s
  const tab = s.tab.slice()
  tab[p] = flipTop(pile.slice(0, -13))
  return { ...s, tab, done: s.done + 1, doneSuits: [...s.doneSuits, run[0].suit] }
}

export function apply(s, from, index, to) {
  if (!legal(s, from, index, to)) return null
  const tab = s.tab.slice()
  const moving = tab[from].slice(index)
  tab[from] = flipTop(tab[from].slice(0, index))
  tab[to] = [...tab[to], ...moving]
  return collect({ ...s, tab, moves: s.moves + 1 }, to)
}

export const canDeal = s => s.stock.length > 0 && s.tab.every(p => p.length > 0)
export function dealRow(s) {
  if (!canDeal(s)) return null
  let n = { ...s, tab: s.tab.map((p, i) => [...p, { ...s.stock[s.stock.length - 1 - i], up: true }]), stock: s.stock.slice(0, -10), moves: s.moves + 1 }
  for (let p = 0; p < 10; p++) n = collect(n, p)
  return n
}

// Best pile for a tapped run: same suit first, then any fitting card, then an empty pile.
export function bestTarget(s, from, index) {
  if (!canPick(s.tab[from], index)) return null
  const card = s.tab[from][index]
  let fit = null, empty = null
  for (let p = 0; p < 10; p++) {
    if (!legal(s, from, index, p)) continue
    const dst = s.tab[p]
    if (!dst.length) { if (empty === null && index > 0) empty = p; continue }
    if (top(dst).suit === card.suit) return p
    if (fit === null) fit = p
  }
  return fit ?? empty
}

export function findHint(s) {
  for (let from = 0; from < 10; from++) {
    const pile = s.tab[from]
    const i = runStart(pile)
    if (i < 0) continue
    for (let to = 0; to < 10; to++) {
      if (!legal(s, from, i, to) || !s.tab[to].length) continue
      const dst = top(s.tab[to])
      // useful: joins the same suit, or uncovers / frees something
      if (dst.suit === pile[i].suit || i === 0 || !pile[i - 1].up || pile[i - 1].rank !== pile[i].rank + 1) return { from, index: i, to }
    }
  }
  return canDeal(s) ? { deal: true } : null
}

export const isWon = s => s.done === 8
