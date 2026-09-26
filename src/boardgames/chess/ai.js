import { Chess } from 'chess.js'

// A small chess computer (alpha-beta + piece-square tables + capture search). Rules come from chess.js (BSD).
const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 }
// piece-square tables from white's point of view, rank 8 first (index = row*8+col as in chess.js board())
const PST = {
  p: [0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
  n: [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
  b: [-20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10, -10, -10, -10, -10, -10, -20],
  r: [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0],
  q: [-20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20],
  k: [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20],
}

function evaluate(game) {
  let s = 0
  const b = game.board()
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = b[r][c]
    if (!p) continue
    const i = p.color === 'w' ? r * 8 + c : (7 - r) * 8 + c
    const v = VAL[p.type] + PST[p.type][i]
    s += p.color === 'w' ? v : -v
  }
  return game.turn() === 'w' ? s : -s
}

const order = moves => moves.sort((a, b) => (b.captured ? VAL[b.captured] * 10 - VAL[b.piece] : 0) + (b.promotion ? 800 : 0) - ((a.captured ? VAL[a.captured] * 10 - VAL[a.piece] : 0) + (a.promotion ? 800 : 0)))

function quiesce(game, alpha, beta, depth) {
  const stand = evaluate(game)
  if (stand >= beta) return beta
  if (alpha < stand) alpha = stand
  if (depth <= 0) return alpha
  for (const m of order(game.moves({ verbose: true }).filter(x => x.captured))) {
    game.move(m)
    const v = -quiesce(game, -beta, -alpha, depth - 1)
    game.undo()
    if (v >= beta) return beta
    if (v > alpha) alpha = v
  }
  return alpha
}

function search(game, depth, alpha, beta, ply) {
  const moves = game.moves({ verbose: true })
  if (!moves.length) return game.inCheck() ? -100000 + ply : 0
  if (depth === 0) return quiesce(game, alpha, beta, 2)
  let best = -Infinity
  for (const m of order(moves)) {
    game.move(m)
    const v = -search(game, depth - 1, -beta, -alpha, ply + 1)
    game.undo()
    if (v > best) best = v
    if (v > alpha) alpha = v
    if (alpha >= beta) break
  }
  return best
}

export const LEVELS = [
  { id: 1, label: 'קל', depth: 1, noise: 260 },
  { id: 2, label: 'בינוני', depth: 1, noise: 15 },
  { id: 3, label: 'קשה', depth: 2, noise: 0 },
]

export function bestMove(fen, level = 2) {
  const L = LEVELS.find(l => l.id === level) || LEVELS[1]
  const game = new Chess(fen)
  const moves = order(game.moves({ verbose: true }))
  let best = null, bestV = -Infinity
  for (const m of moves) {
    game.move(m)
    let v = game.isCheckmate() ? 100000 : -search(game, L.depth - 1, -Infinity, L.noise ? Infinity : -bestV, 1)
    game.undo()
    v += Math.random() * L.noise
    if (v > bestV) { bestV = v; best = m }
  }
  return best
}
