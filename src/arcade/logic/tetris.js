// Falling blocks (the classic tetromino puzzle mechanic). Pure rules, no drawing.
// board: H rows × W columns of color strings (or null). piece: { type, rot, x, y }.
export const W = 10, H = 20
const BASE = {
  I: { size: 4, cells: [[0, 1], [1, 1], [2, 1], [3, 1]], color: '#38c6f4' },
  O: { size: 2, cells: [[0, 0], [1, 0], [0, 1], [1, 1]], color: '#ffd23f' },
  T: { size: 3, cells: [[1, 0], [0, 1], [1, 1], [2, 1]], color: '#b26bff' },
  S: { size: 3, cells: [[1, 0], [2, 0], [0, 1], [1, 1]], color: '#4cd681' },
  Z: { size: 3, cells: [[0, 0], [1, 0], [1, 1], [2, 1]], color: '#ff5c5c' },
  J: { size: 3, cells: [[0, 0], [0, 1], [1, 1], [2, 1]], color: '#5b6cff' },
  L: { size: 3, cells: [[2, 0], [0, 1], [1, 1], [2, 1]], color: '#ffa62b' },
}
export const TYPES = Object.keys(BASE)
export const colorOf = type => BASE[type].color

export const emptyBoard = () => Array.from({ length: H }, () => Array(W).fill(null))

// Cells of a piece on the board, rotated `rot` quarter turns clockwise inside its box.
export function cells(p) {
  const { size, cells: c } = BASE[p.type]
  return c.map(([x, y]) => {
    let cx = x, cy = y
    for (let r = 0; r < ((p.rot % 4) + 4) % 4; r++) [cx, cy] = [size - 1 - cy, cx]
    return [p.x + cx, p.y + cy]
  })
}

export function collides(board, p) {
  return cells(p).some(([x, y]) => x < 0 || x >= W || y >= H || (y >= 0 && board[y][x]))
}

export const spawn = type => ({ type, rot: 0, x: type === 'O' ? 4 : 3, y: type === 'I' ? -1 : 0 })

// 7-bag: every piece once, in random order, then a new bag — no long droughts.
export function makeBag(rand = Math.random) {
  const a = TYPES.slice()
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

export function tryMove(board, p, dx, dy) {
  const n = { ...p, x: p.x + dx, y: p.y + dy }
  return collides(board, n) ? null : n
}

// Rotate with simple wall kicks (slide sideways or up a bit if the turn would bump).
export function tryRotate(board, p, dir = 1) {
  const r = { ...p, rot: p.rot + dir }
  for (const [dx, dy] of [[0, 0], [-1, 0], [1, 0], [0, -1], [-2, 0], [2, 0], [0, -2]]) {
    const n = { ...r, x: r.x + dx, y: r.y + dy }
    if (!collides(board, n)) return n
  }
  return null
}

export function dropDistance(board, p) {
  let d = 0
  while (!collides(board, { ...p, y: p.y + d + 1 })) d++
  return d
}

// Lock a piece in place and clear full rows. Returns { board, cleared, rows, topOut }.
export function lock(board, p) {
  const b = board.map(r => r.slice())
  let topOut = false
  for (const [x, y] of cells(p)) {
    if (y < 0) { topOut = true; continue }
    b[y][x] = colorOf(p.type)
  }
  const rows = []
  for (let y = 0; y < H; y++) if (b[y].every(Boolean)) rows.push(y)
  const kept = b.filter((_, y) => !rows.includes(y))
  while (kept.length < H) kept.unshift(Array(W).fill(null))
  return { board: kept, cleared: rows.length, rows, topOut }
}

export const LINE_POINTS = [0, 100, 300, 500, 800]
export const levelFor = lines => 1 + Math.floor(lines / 10)
export const gravityMs = level => Math.max(70, Math.round(800 * 0.84 ** (level - 1)))
