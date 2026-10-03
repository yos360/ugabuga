// "Block party" — drop shapes on an 8×8 board; a full row or column clears.
// The game ends when none of the three offered shapes fits anywhere.
export const N = 8

const S = (...rows) => rows.flatMap((row, y) => [...row].flatMap((ch, x) => (ch === '#' ? [[x, y]] : [])))
export const SHAPES = [
  S('#'),
  S('##'), S('#', '#'),
  S('###'), S('#', '#', '#'),
  S('####'), S('#', '#', '#', '#'),
  S('##', '##'),
  S('###', '###', '###'),
  S('##', '#.'), S('##', '.#'), S('#.', '##'), S('.#', '##'),
  S('###', '#..'), S('###', '..#'), S('#..', '###'), S('..#', '###'),
  S('###', '.#.'), S('.#.', '###'),
  S('##.', '.##'), S('.##', '##.'),
  S('#####'), S('#', '#', '#', '#', '#'),
]
export const COLORS = ['#ff7a7a', '#ffb547', '#ffd23f', '#5fd38d', '#4cc3ff', '#9b8cff', '#ff8ad8']

export const emptyBoard = () => Array.from({ length: N }, () => Array(N).fill(null))
export const shapeSize = cells => [Math.max(...cells.map(c => c[0])) + 1, Math.max(...cells.map(c => c[1])) + 1]

export function canPlace(board, cells, gx, gy) {
  return cells.every(([x, y]) => {
    const bx = gx + x, by = gy + y
    return bx >= 0 && bx < N && by >= 0 && by < N && !board[by][bx]
  })
}

export function place(board, piece, gx, gy) {
  const next = board.map(r => r.slice())
  for (const [x, y] of piece.cells) next[gy + y][gx + x] = piece.color
  const rows = [], cols = []
  for (let i = 0; i < N; i++) {
    if (next[i].every(Boolean)) rows.push(i)
    if (next.every(r => r[i])) cols.push(i)
  }
  for (const y of rows) for (let x = 0; x < N; x++) next[y][x] = null
  for (const x of cols) for (let y = 0; y < N; y++) next[y][x] = null
  const lines = rows.length + cols.length
  const gained = piece.cells.length + lines * 10 * lines // combos pay more
  return { board: next, lines, gained, cleared: { rows, cols } }
}

export function fitsAnywhere(board, cells) {
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (canPlace(board, cells, x, y)) return true
  return false
}

let pid = 1
export function dealPieces(rand = Math.random, board = null) {
  const make = () => ({ id: pid++, cells: SHAPES[Math.floor(rand() * SHAPES.length)], color: COLORS[Math.floor(rand() * COLORS.length)] })
  const pieces = [make(), make(), make()]
  // Be kind: if the board is crowded, make sure at least one piece fits.
  if (board && !pieces.some(p => fitsAnywhere(board, p.cells))) {
    for (const cells of SHAPES.slice().sort((a, b) => a.length - b.length)) {
      if (fitsAnywhere(board, cells)) { pieces[0] = { ...pieces[0], cells }; break }
    }
  }
  return pieces
}
