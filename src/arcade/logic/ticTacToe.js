// Tic-tac-toe (public domain): 3×3 board, flat array of 9 cells (index = row * 3 + col).
// Cell values: 0 empty, 1 = X (always starts), 2 = O.
export const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]

export const emptyBoard = () => Array(9).fill(0)
export const other = p => 3 - p
export const freeCells = b => b.flatMap((v, i) => (v ? [] : [i]))

export function turnOf(b) {
  let n = 0
  for (const v of b) if (v) n++
  return n % 2 === 0 ? 1 : 2
}

export function place(b, i, p) {
  if (b[i]) return null
  const board = b.slice()
  board[i] = p
  return board
}

// { winner, line } | { draw: true } | null (game still on)
export function result(b) {
  for (const l of LINES) {
    const p = b[l[0]]
    if (p && b[l[1]] === p && b[l[2]] === p) return { winner: p, line: l }
  }
  return b.every(Boolean) ? { draw: true } : null
}

// Perfect play score for the player to move: >0 win, 0 draw, <0 loss (faster wins score higher).
const memo = new Map()
function score(b, p) {
  const key = b.join('') + p
  const hit = memo.get(key)
  if (hit !== undefined) return hit
  let best = -Infinity
  const free = freeCells(b)
  for (const i of free) {
    b[i] = p
    const r = result(b)
    const v = r ? (r.winner ? 10 + free.length : 0) : -score(b, 3 - p)
    b[i] = 0
    if (v > best) best = v
  }
  memo.set(key, best)
  return best
}

// Every optimal move for p (the unbeatable computer picks one of them at random).
export function bestMoves(b, p) {
  const board = b.slice(), out = []
  let best = -Infinity
  for (const i of freeCells(board)) {
    board[i] = p
    const r = result(board)
    const v = r ? (r.winner ? 10 + freeCells(board).length + 1 : 0) : -score(board, 3 - p)
    board[i] = 0
    if (v > best) { best = v; out.length = 0 }
    if (v === best) out.push(i)
  }
  return out
}

export function hardMove(b, p, rand = Math.random) {
  const moves = bestMoves(b, p)
  return moves[Math.floor(rand() * moves.length)]
}

// Easy computer: always grabs a win it can see, blocks only some of the time, otherwise random —
// so young kids can beat it.
export function easyMove(b, p, rand = Math.random) {
  const free = freeCells(b)
  const lineFor = q => free.find(i => { const t = b.slice(); t[i] = q; return result(t)?.winner === q })
  const win = lineFor(p)
  if (win !== undefined) return win
  const block = lineFor(other(p))
  if (block !== undefined && rand() < 0.5) return block
  return free[Math.floor(rand() * free.length)]
}
