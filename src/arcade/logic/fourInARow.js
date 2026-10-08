// "Four in a row" (public-domain vertical connect game): 7 columns × 6 rows, discs fall to
// the lowest free cell of a column. Board = flat array of 42 cells, index = row * COLS + col,
// row 0 is the TOP row. Cell values: 0 empty, 1 first player, 2 second player.
export const COLS = 7
export const ROWS = 6
const SIZE = COLS * ROWS
// columns tried centre-first: better moves first = much faster alpha-beta pruning
const ORDER = [3, 2, 4, 1, 5, 0, 6]
const DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]]

// Every possible line of four cells (69 of them).
export const LINES = (() => {
  const out = []
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) for (const [dr, dc] of DIRS) {
    const er = r + dr * 3, ec = c + dc * 3
    if (er >= 0 && er < ROWS && ec >= 0 && ec < COLS) out.push([0, 1, 2, 3].map(k => (r + dr * k) * COLS + c + dc * k))
  }
  return out
})()

export const emptyBoard = () => Array(SIZE).fill(0)
export const other = p => 3 - p

// Lowest free row in a column, or -1 when the column is full.
export function dropRow(b, c) {
  for (let r = ROWS - 1; r >= 0; r--) if (!b[r * COLS + c]) return r
  return -1
}
export const validCols = b => [0, 1, 2, 3, 4, 5, 6].filter(c => !b[c])

// Drops a disc; returns { board, index } (a new board) or null for a full column.
export function drop(b, c, p) {
  const r = dropRow(b, c)
  if (r < 0) return null
  const board = b.slice()
  board[r * COLS + c] = p
  return { board, index: r * COLS + c }
}

// Whose turn: player 1 always starts, so equal counts → 1.
export function turnOf(b) {
  let n = 0
  for (const v of b) if (v) n++
  return n % 2 === 0 ? 1 : 2
}

// The winning line through cell i (if the disc there completes four or more), else null.
function lineAt(b, i) {
  const p = b[i]
  if (!p) return null
  const r0 = Math.floor(i / COLS), c0 = i % COLS
  for (const [dr, dc] of DIRS) {
    const cells = [i]
    for (const s of [1, -1]) {
      let r = r0 + dr * s, c = c0 + dc * s
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && b[r * COLS + c] === p) { cells.push(r * COLS + c); r += dr * s; c += dc * s }
    }
    if (cells.length >= 4) return cells.sort((a, z) => a - z)
  }
  return null
}

// { winner, line } | { draw: true } | null (game still on)
export function result(b) {
  for (const l of LINES) {
    const p = b[l[0]]
    if (p && b[l[1]] === p && b[l[2]] === p && b[l[3]] === p) return { winner: p, line: lineAt(b, l[0]) || l }
  }
  return b.every(Boolean) ? { draw: true } : null
}

// A column where p wins right now, or -1.
export function winningCol(b, p) {
  for (const c of ORDER) {
    const r = dropRow(b, c)
    if (r < 0) continue
    const i = r * COLS + c
    b[i] = p
    const win = !!lineAt(b, i)
    b[i] = 0
    if (win) return c
  }
  return -1
}

// Easy computer: random, but it never misses a win-in-1 and always blocks the opponent's.
export function easyMove(b, p, rand = Math.random) {
  const board = b.slice()
  const win = winningCol(board, p)
  if (win >= 0) return win
  const block = winningCol(board, other(p))
  if (block >= 0) return block
  const cols = validCols(board)
  return cols[Math.floor(rand() * cols.length)]
}

// Position score from p's point of view: open lines with 2–3 of your discs are good, the
// opponent's are bad (a bit worse, so it defends), and centre-column discs are worth a little.
const LINE_SCORE = [0, 1, 6, 40]
export function evaluate(b, p) {
  let sc = 0
  for (const l of LINES) {
    let me = 0, op = 0
    for (let k = 0; k < 4; k++) { const v = b[l[k]]; if (v === p) me++; else if (v) op++ }
    if (op === 0) sc += LINE_SCORE[me]
    else if (me === 0) sc -= LINE_SCORE[op] * 1.2
  }
  for (let r = 0; r < ROWS; r++) { const v = b[r * COLS + 3]; if (v === p) sc += 3; else if (v) sc -= 3 }
  return sc
}

const WIN = 1e6
class Timeout extends Error {}

// Negamax with alpha-beta on a mutable board. Faster wins (and slower losses) score higher.
function negamax(b, p, depth, alpha, beta, ctx) {
  if ((++ctx.nodes & 1023) === 0 && ctx.deadline && Date.now() > ctx.deadline) throw new Timeout()
  const moves = []
  for (const c of ORDER) {
    const r = dropRow(b, c)
    if (r < 0) continue
    const i = r * COLS + c
    b[i] = p
    const win = !!lineAt(b, i)
    b[i] = 0
    if (win) return WIN + depth
    moves.push(i)
  }
  if (!moves.length) return 0
  if (depth === 0) return evaluate(b, p)
  let best = -Infinity
  for (const i of moves) {
    b[i] = p
    const v = -negamax(b, 3 - p, depth - 1, -beta, -alpha, ctx)
    b[i] = 0
    if (v > best) best = v
    if (v > alpha) alpha = v
    if (alpha >= beta) break
  }
  return best
}

function searchRoot(b, p, depth, ctx, first) {
  const cols = first == null ? ORDER : [first, ...ORDER.filter(c => c !== first)]
  let bestCol = -1, bestV = -Infinity, alpha = -Infinity
  for (const c of cols) {
    const r = dropRow(b, c)
    if (r < 0) continue
    const i = r * COLS + c
    b[i] = p
    const v = lineAt(b, i) ? WIN + depth : -negamax(b, 3 - p, depth - 1, -Infinity, -alpha, ctx)
    b[i] = 0
    if (v > bestV) { bestV = v; bestCol = c }
    if (v > alpha) alpha = v
  }
  return { col: bestCol, score: bestV }
}

// Hard computer: takes a win, blocks a loss, otherwise iterative deepening alpha-beta.
// Depth `minDepth` (≥5) is always completed; deeper searches run while `timeMs` allows.
export function hardMove(b, p, { minDepth = 6, maxDepth = 12, timeMs = 150 } = {}) {
  const board = b.slice()
  const win = winningCol(board, p)
  if (win >= 0) return win
  const block = winningCol(board, other(p))
  if (block >= 0) return block
  const left = board.filter(v => !v).length
  const ctx = { nodes: 0, deadline: 0 }
  let best = searchRoot(board, p, Math.min(minDepth, left), ctx, null)
  const start = Date.now()
  ctx.deadline = start + timeMs
  for (let d = minDepth + 1; d <= Math.min(maxDepth, left); d++) {
    try {
      const r = searchRoot(board, p, d, ctx, best.col)
      best = r
      if (r.score >= WIN || r.score <= -WIN) break // the outcome is already certain
    } catch (e) {
      if (e instanceof Timeout) break
      throw e
    }
  }
  return best.col
}
