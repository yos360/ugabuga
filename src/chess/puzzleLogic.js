import { Chess } from 'chess.js'

// Small exact solver for the puzzles page (and the tests): which moves mate now, and which
// first moves force mate on the next move whatever the defender does.

const key = m => m.from + m.to + (m.promotion || '')

export function matingMoves(fen) {
  const g = new Chess(fen)
  const out = []
  for (const m of g.moves({ verbose: true })) {
    g.move(m)
    if (g.isCheckmate()) out.push(m.san)
    g.undo()
  }
  return out
}

// After `move` (SAN or {from,to,promotion}) from `fen`: does every defence allow a mate in one?
export function forcesMateIn2(fen, move) {
  const g = new Chess(fen)
  try { g.move(move) } catch { return false }
  if (g.isCheckmate()) return true
  const replies = g.moves({ verbose: true })
  if (!replies.length) return false // stalemate
  for (const r of replies) {
    g.move(r)
    const mates = matingMoves(g.fen())
    g.undo()
    if (!mates.length) return false
  }
  return true
}

export function mateIn2Keys(fen) {
  const g = new Chess(fen)
  return g.moves({ verbose: true }).filter(m => forcesMateIn2(fen, m)).map(m => m.san)
}

// The defence the computer plays in a mate-in-2 puzzle: the listed one when it is legal,
// otherwise the reply that leaves the fewest mating moves (the most stubborn one).
export function bestDefence(fen, listed) {
  const g = new Chess(fen)
  if (listed) { try { return g.move(listed) } catch { /* not legal here — pick one */ } }
  let best = null, fewest = Infinity
  for (const r of g.moves({ verbose: true })) {
    g.move(r)
    const n = matingMoves(g.fen()).length
    g.undo()
    if (n < fewest) { fewest = n; best = r }
  }
  return best
}

export { key as moveKey }
