// Minesweeper (public-domain puzzle). The first tap is always safe and opens an area:
// mines are placed only after it, away from the tapped cell and its neighbors.
export const LEVELS = [
  { id: 'easy', name: 'קל', w: 8, h: 8, mines: 8 },
  { id: 'medium', name: 'בינוני', w: 10, h: 12, mines: 18 },
  { id: 'hard', name: 'קשה', w: 12, h: 16, mines: 34 },
]

// cell: { mine, n (mines around), open, flag }
export function empty(w, h) {
  return { w, h, mines: 0, placed: false, lost: false, cells: Array.from({ length: w * h }, () => ({ mine: false, n: 0, open: false, flag: false })) }
}

export function neighbors(b, i) {
  const x = i % b.w, y = Math.floor(i / b.w), out = []
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue
    const nx = x + dx, ny = y + dy
    if (nx >= 0 && ny >= 0 && nx < b.w && ny < b.h) out.push(ny * b.w + nx)
  }
  return out
}

export function place(b, mines, safe, rand = Math.random) {
  const banned = new Set([safe, ...neighbors(b, safe)])
  const spots = b.cells.map((_, i) => i).filter(i => !banned.has(i))
  for (let i = spots.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [spots[i], spots[j]] = [spots[j], spots[i]] }
  const cells = b.cells.map(c => ({ ...c, mine: false, n: 0 }))
  for (const i of spots.slice(0, Math.min(mines, spots.length))) cells[i].mine = true
  const nb = { ...b, cells, mines: Math.min(mines, spots.length), placed: true }
  cells.forEach((c, i) => { c.n = neighbors(nb, i).filter(k => cells[k].mine).length })
  return nb
}

// Open a cell (flood-filling zeros). Returns a new board.
export function open(b, i) {
  const c = b.cells[i]
  if (c.open || c.flag || b.lost) return b
  const cells = b.cells.slice()
  if (c.mine) {
    // reveal every mine
    return { ...b, lost: true, boom: i, cells: cells.map(k => (k.mine ? { ...k, open: true } : k)) }
  }
  const stack = [i]
  while (stack.length) {
    const k = stack.pop()
    if (cells[k].open || cells[k].flag) continue
    cells[k] = { ...cells[k], open: true }
    if (cells[k].n === 0) for (const nk of neighbors(b, k)) if (!cells[nk].open && !cells[nk].mine) stack.push(nk)
  }
  return { ...b, cells }
}

// Tap an open number whose flags are all placed → open the rest around it.
export function chord(b, i) {
  const c = b.cells[i]
  if (!c.open || !c.n) return b
  const around = neighbors(b, i)
  if (around.filter(k => b.cells[k].flag).length !== c.n) return b
  let nb = b
  for (const k of around) nb = open(nb, k)
  return nb
}

export const toggleFlag = (b, i) => (b.cells[i].open ? b : { ...b, cells: b.cells.map((c, k) => (k === i ? { ...c, flag: !c.flag } : c)) })
export const isWon = b => b.placed && !b.lost && b.cells.every(c => c.mine || c.open)
export const flagsLeft = b => b.mines - b.cells.filter(c => c.flag).length
