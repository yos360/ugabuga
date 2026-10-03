// Sudoku (public-domain puzzle) for 4×4, 6×6 and 9×9 boards. Puzzles are generated
// here: fill a random full grid, then remove clues one by one as long as the puzzle
// still has exactly one solution.
export const LEVELS = [
  { id: 'kids', name: 'קטנטנים 4×4', n: 4, br: 2, bc: 2, keep: 7 },
  { id: 'six', name: '6×6', n: 6, br: 2, bc: 3, keep: 16 },
  { id: 'easy', name: 'קל 9×9', n: 9, br: 3, bc: 3, keep: 40 },
  { id: 'medium', name: 'בינוני', n: 9, br: 3, bc: 3, keep: 32 },
  { id: 'hard', name: 'קשה', n: 9, br: 3, bc: 3, keep: 26 },
]

function peersOf(n, br, bc) {
  const peers = []
  for (let i = 0; i < n * n; i++) {
    const r = Math.floor(i / n), c = i % n, s = new Set()
    for (let k = 0; k < n; k++) { s.add(r * n + k); s.add(k * n + c) }
    const r0 = r - (r % br), c0 = c - (c % bc)
    for (let dr = 0; dr < br; dr++) for (let dc = 0; dc < bc; dc++) s.add((r0 + dr) * n + c0 + dc)
    s.delete(i)
    peers.push([...s])
  }
  return peers
}
const PEERS = new Map()
export function peers(n, br, bc) {
  const k = `${n}:${br}:${bc}`
  if (!PEERS.has(k)) PEERS.set(k, peersOf(n, br, bc))
  return PEERS.get(k)
}

const shuffle = (a, rand) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }

// Counts solutions up to `limit` (fills `grid` in place with the first one found when fill=true).
export function solve(grid, n, br, bc, limit = 2, rand = null) {
  const P = peers(n, br, bc)
  const g = grid.slice()
  let count = 0, first = null
  const candidates = i => {
    const used = new Set(P[i].map(k => g[k]))
    const out = []
    for (let v = 1; v <= n; v++) if (!used.has(v)) out.push(v)
    return rand ? shuffle(out, rand) : out
  }
  const rec = () => {
    // most constrained empty cell first
    let best = -1, bestC = null
    for (let i = 0; i < g.length; i++) {
      if (g[i]) continue
      const c = candidates(i)
      if (!c.length) return
      if (!bestC || c.length < bestC.length) { best = i; bestC = c; if (c.length === 1) break }
    }
    if (best < 0) { count++; if (!first) first = g.slice(); return }
    for (const v of bestC) {
      g[best] = v
      rec()
      if (count >= limit) return
    }
    g[best] = 0
  }
  rec()
  return { count, solution: first }
}

export function generate(level, rand = Math.random) {
  const { n, br, bc, keep } = level
  const full = solve(Array(n * n).fill(0), n, br, bc, 1, rand).solution
  const puzzle = full.slice()
  const order = shuffle([...puzzle.keys()], rand)
  let filled = n * n
  for (const i of order) {
    if (filled <= keep) break
    const v = puzzle[i]
    puzzle[i] = 0
    if (solve(puzzle, n, br, bc, 2).count !== 1) puzzle[i] = v
    else filled--
  }
  return { puzzle, solution: full }
}

// Cells whose value clashes with a peer (shown in red).
export function conflicts(grid, n, br, bc) {
  const P = peers(n, br, bc)
  const bad = new Set()
  grid.forEach((v, i) => { if (v && P[i].some(k => grid[k] === v)) bad.add(i) })
  return bad
}
