import { Chess } from 'chess.js'

// The computer player for /chess. Rules and move generation come from chess.js (BSD-2);
// the search is ours: iterative-deepening alpha-beta with piece-square tables, MVV-LVA move
// ordering and a capture-only quiescence search. It runs in a Web Worker (engine.worker.js).
//
// For speed the search uses chess.js's internal make/unmake (`_moves`, `_makeMove`,
// `_undoMove`, `_board` in 0x88 layout). tests/chess.test.mjs checks that these still exist,
// so a chess.js upgrade that changes them fails the tests instead of breaking the page.

const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 }
// Piece-square tables from white's point of view, rank 8 first (index = row * 8 + col).
const PST = {
  p: [0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
  n: [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
  b: [-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20],
  r: [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0],
  q: [-20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20],
  k: [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20],
  // king in the endgame: walk to the centre (helps the engine actually finish won games)
  ke: [-50, -40, -30, -20, -20, -30, -40, -50, -30, -20, -10, 0, 0, -10, -20, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 30, 40, 40, 30, -10, -30, -30, -10, 20, 30, 30, 20, -10, -30, -30, -30, 0, 0, 0, 0, -30, -30, -50, -30, -30, -30, -30, -30, -30, -50],
}

export const MATE = 100000
const sqName = i => 'abcdefgh'[i & 7] + (8 - (i >> 4))

// Static evaluation from the point of view of the side to move.
export function evaluate(game) {
  const board = game._board
  let s = 0, material = 0
  const kings = []
  for (let i = 0; i < 128; i++) {
    if (i & 0x88) { i += 7; continue }
    const p = board[i]
    if (!p) continue
    if (p.type === 'k') { kings.push(i, p.color); continue }
    material += VAL[p.type]
    const row = i >> 4, col = i & 7
    const idx = p.color === 'w' ? row * 8 + col : (7 - row) * 8 + col
    const v = VAL[p.type] + PST[p.type][idx]
    s += p.color === 'w' ? v : -v
  }
  const endgame = material < 2600
  for (let k = 0; k < kings.length; k += 2) {
    const i = kings[k], color = kings[k + 1], row = i >> 4, col = i & 7
    const idx = color === 'w' ? row * 8 + col : (7 - row) * 8 + col
    const v = (endgame ? PST.ke : PST.k)[idx]
    s += color === 'w' ? v : -v
  }
  return game._turn === 'w' ? s : -s
}

const moveScore = (m, best) => {
  if (best && m.from === best.from && m.to === best.to && m.promotion === best.promotion) return 1e6
  let s = 0
  if (m.captured) s += VAL[m.captured] * 10 - VAL[m.piece] + 1000
  if (m.promotion) s += VAL[m.promotion] + 900
  return s
}
const ordered = (moves, best) => {
  const scored = moves.map(m => [moveScore(m, best), m])
  scored.sort((a, b) => b[0] - a[0])
  return scored.map(x => x[1])
}

class Timeout extends Error {}

function makeSearcher(game, deadline) {
  let nodes = 0
  const tick = () => { if ((++nodes & 1023) === 0 && deadline && Date.now() > deadline) throw new Timeout() }

  function quiesce(alpha, beta, depth) {
    tick()
    const stand = evaluate(game)
    if (stand >= beta) return stand
    if (stand > alpha) alpha = stand
    if (depth <= 0) return stand
    const caps = game._moves().filter(m => m.captured || m.promotion)
    for (const m of ordered(caps)) {
      game._makeMove(m)
      const v = -quiesce(-beta, -alpha, depth - 1)
      game._undoMove()
      if (v >= beta) return v
      if (v > alpha) alpha = v
    }
    return alpha
  }

  function search(depth, alpha, beta, ply) {
    tick()
    const moves = game._moves()
    if (!moves.length) return game._isKingAttacked(game._turn) ? -MATE + ply : 0
    if (game._halfMoves >= 100) return 0
    if (depth <= 0) return quiesce(alpha, beta, 4)
    let best = -Infinity
    for (const m of ordered(moves)) {
      game._makeMove(m)
      const v = -search(depth - 1, -beta, -alpha, ply + 1)
      game._undoMove()
      if (v > best) best = v
      if (v > alpha) alpha = v
      if (alpha >= beta) break
    }
    return best
  }

  // Scores every root move at `depth` (full window, so the scores are exact enough to add noise).
  function rootScores(moves, depth) {
    const out = []
    for (const m of moves) {
      game._makeMove(m)
      const v = -search(depth - 1, -MATE - 1, MATE + 1, 1)
      game._undoMove()
      out.push({ m, v })
    }
    return out
  }

  // Alpha-beta at the root (only the best move is exact) — used by the strongest level.
  function rootBest(moves, depth) {
    let alpha = -MATE - 1, best = null
    for (const m of moves) {
      game._makeMove(m)
      const v = -search(depth - 1, -MATE - 1, -alpha, 1)
      game._undoMove()
      if (v > alpha || !best) { alpha = v; best = { m, v } }
    }
    return best
  }

  return { rootScores, rootBest, nodes: () => nodes }
}

// Levels. מתחיל is meant to be beaten by a child: it looks only one move ahead, plays a random
// move a third of the time and gets lots of noise, so it leaves pieces hanging and misses mates.
export const LEVELS = [
  { id: 'easy', label: 'מתחיל', depth: 1, noise: 220, random: 0.35, quiet: true },
  { id: 'medium', label: 'בינוני', depth: 2, noise: 25, random: 0.04 },
  { id: 'hard', label: 'מתקדם', depth: 5, noise: 0, random: 0, timeMs: 1400 },
]
export const levelById = id => LEVELS.find(l => l.id === id) || LEVELS[1]

const pretty = m => ({ from: sqName(m.from), to: sqName(m.to), ...(m.promotion ? { promotion: m.promotion } : {}) })

// Picks a move for the side to move. `rand` can be injected for deterministic tests.
export function chooseMove(fen, levelId = 'medium', { rand = Math.random, timeMs } = {}) {
  const L = levelById(levelId)
  const game = new Chess(fen)
  const moves = game._moves()
  if (!moves.length) return null
  if (moves.length === 1) return pretty(moves[0])

  if (L.random && rand() < L.random) return pretty(moves[Math.floor(rand() * moves.length)])

  if (L.timeMs || timeMs) {
    // iterative deepening with a time budget; always finishes depth 2, keeps the last full iteration
    const deadline = Date.now() + (timeMs ?? L.timeMs)
    let best = null
    let order = ordered(moves)
    for (let d = 1; d <= L.depth; d++) {
      const s = makeSearcher(game, d <= 2 ? 0 : deadline)
      try {
        const r = s.rootBest(order, d)
        best = r
        order = ordered(moves, r.m)
        if (r.v > MATE - 100) break // found a forced mate
      } catch (e) {
        if (!(e instanceof Timeout)) throw e
        // a partial iteration leaves made moves on the board: restore the position
        while (game._history.length) game._undoMove()
        break
      }
    }
    return pretty(best.m)
  }

  const s = makeSearcher(game, 0)
  const scored = L.quiet
    // the beginner judges a move only by the position right after it (no look at the reply)
    ? moves.map(m => { game._makeMove(m); const v = game._moves().length === 0 && game._isKingAttacked(game._turn) ? MATE : -evaluate(game); game._undoMove(); return { m, v } })
    : s.rootScores(ordered(moves), L.depth)
  let best = null, bestV = -Infinity
  for (const { m, v } of scored) {
    // a found mate is never blurred by noise on the medium level
    const val = v + (v > MATE - 100 && !L.quiet ? 0 : rand() * L.noise)
    if (val > bestV) { bestV = val; best = m }
  }
  return pretty(best)
}

// Is every chess.js internal the search relies on still there?
export function engineSupported() {
  const g = new Chess()
  return ['_moves', '_makeMove', '_undoMove', '_isKingAttacked'].every(k => typeof g[k] === 'function') && Array.isArray(g._board) && Array.isArray(g._history)
}
