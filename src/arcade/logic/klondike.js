// Klondike — the classic solitaire (public-domain card game), draw one card at a time.
// Build the four foundations up by suit from A to K; on the seven tableau piles cards go
// down in alternating colors, and only a K may fill an empty pile.
import { deck, shuffled, isRed, top, flipTop } from './cards.js'
import { rng } from './rng.js'

export function deal(rand = Math.random) {
  const cards = shuffled(deck(), rand)
  const tab = []
  let k = 0
  for (let i = 0; i < 7; i++) {
    const pile = cards.slice(k, k + i + 1).map((c, j) => ({ ...c, up: j === i }))
    k += i + 1
    tab.push(pile)
  }
  return { stock: cards.slice(k).map(c => ({ ...c, up: false })), waste: [], found: [[], [], [], []], tab, moves: 0 }
}

export function canFound(card, pile) {
  if (!pile.length) return card.rank === 1
  const t = top(pile)
  return t.suit === card.suit && t.rank === card.rank - 1
}
export function canTab(card, pile) {
  if (!pile.length) return card.rank === 13
  const t = top(pile)
  return t.up && isRed(t) !== isRed(card) && t.rank === card.rank + 1
}

// Cards picked up from a source: { type: 'waste' } | { type: 'found', pile } | { type: 'tab', pile, index }
export function pick(s, src) {
  if (src.type === 'waste') return s.waste.length ? [top(s.waste)] : []
  if (src.type === 'found') return s.found[src.pile].length ? [top(s.found[src.pile])] : []
  const pile = s.tab[src.pile]
  const run = pile.slice(src.index)
  return run.length && run.every(c => c.up) ? run : []
}

export function legal(s, src, dst) {
  const cards = pick(s, src)
  if (!cards.length) return false
  if (dst.type === 'found') return cards.length === 1 && src.type !== 'found' && canFound(cards[0], s.found[dst.pile])
  if (dst.type === 'tab') return !(src.type === 'tab' && src.pile === dst.pile) && canTab(cards[0], s.tab[dst.pile])
  return false
}

export function apply(s, src, dst) {
  if (!legal(s, src, dst)) return null
  const cards = pick(s, src)
  const n = { ...s, waste: s.waste, found: s.found.slice(), tab: s.tab.slice(), moves: s.moves + 1 }
  if (src.type === 'waste') n.waste = s.waste.slice(0, -1)
  else if (src.type === 'found') n.found[src.pile] = s.found[src.pile].slice(0, -1)
  else n.tab[src.pile] = flipTop(s.tab[src.pile].slice(0, src.index))
  if (dst.type === 'found') n.found[dst.pile] = [...n.found[dst.pile], ...cards]
  else n.tab[dst.pile] = [...n.tab[dst.pile], ...cards]
  return n
}

// Tap the stock: turn one card over, or put the waste back when the stock is empty.
export function draw(s) {
  if (s.stock.length) return { ...s, stock: s.stock.slice(0, -1), waste: [...s.waste, { ...top(s.stock), up: true }], moves: s.moves + 1 }
  if (!s.waste.length) return s
  return { ...s, stock: s.waste.slice().reverse().map(c => ({ ...c, up: false })), waste: [], moves: s.moves + 1 }
}

// Best destination for a tapped card (foundation first, then a pile that keeps it useful).
export function bestTarget(s, src) {
  const cards = pick(s, src)
  if (!cards.length) return null
  if (cards.length === 1 && src.type !== 'found') {
    for (let f = 0; f < 4; f++) if (legal(s, src, { type: 'found', pile: f })) return { type: 'found', pile: f }
  }
  const fromBottom = src.type === 'tab' && src.index === 0
  const order = [...s.tab.keys()].sort((a, b) => (s.tab[a].length ? 0 : 1) - (s.tab[b].length ? 0 : 1))
  for (const p of order) {
    if (!s.tab[p].length && fromBottom) continue // moving a K from one empty spot to another is pointless
    const dst = { type: 'tab', pile: p }
    if (legal(s, src, dst)) return dst
  }
  return null
}

export const isWon = s => s.found.every(f => f.length === 13)
export const canAutoFinish = s => !s.stock.length && !s.waste.length && s.tab.every(p => p.every(c => c.up)) && !isWon(s)

// One step of the auto-finish: send the lowest available card to its foundation.
export function autoStep(s) {
  let best = null
  s.tab.forEach((p, i) => {
    if (!p.length) return
    const c = top(p)
    if (!best || c.rank < best.c.rank) best = { c, i }
  })
  if (!best) return null
  for (let f = 0; f < 4; f++) {
    const n = apply(s, { type: 'tab', pile: best.i, index: s.tab[best.i].length - 1 }, { type: 'found', pile: f })
    if (n) return n
  }
  return null
}

// Is there anything useful left to do? (for the hint button)
export function findHint(s) {
  const sources = []
  if (s.waste.length) sources.push({ type: 'waste' })
  s.tab.forEach((p, i) => {
    const first = p.findIndex(c => c.up)
    if (first >= 0) for (let j = first; j < p.length; j++) sources.push({ type: 'tab', pile: i, index: j })
  })
  for (const src of sources) {
    const dst = bestTarget(s, src)
    if (!dst) continue
    // skip shuffles that reveal nothing (moving a whole face-up pile that sits on another face-up card)
    if (src.type === 'tab' && dst.type === 'tab' && src.index > 0 && s.tab[src.pile][src.index - 1].up) continue
    if (src.type === 'tab' && dst.type === 'tab' && src.index === 0 && !s.tab[dst.pile].length) continue
    return { src, dst }
  }
  return s.stock.length || s.waste.length ? { draw: true } : null
}

// Plays a deal with the hint logic only; true if that alone wins it.
export function greedyWins(s, maxSteps = 1500) {
  let idle = 0
  for (let i = 0; i < maxSteps; i++) {
    if (isWon(s) || canAutoFinish(s)) return true
    const h = findHint(s)
    if (!h) return false
    if (h.draw) {
      if (++idle > s.stock.length + s.waste.length + 2) return false // went through the whole stock with nothing to do
      s = draw(s)
    } else { idle = 0; s = apply(s, h.src, h.dst) }
  }
  return false
}

// A deal from this seed that is surely winnable (for the daily challenge: everyone gets
// the same deal, and nobody gets a hopeless one).
export function winnableDeal(seed) {
  for (let t = 0; t < 400; t++) {
    const s = deal(rng(seed + t * 7777))
    if (greedyWins(s)) return s
  }
  return deal(rng(seed))
}
