import { rng } from '../rng.js'
import { range } from './core.js'

export function lightMove(p, state, action) {
  const { cell } = action
  if (!Number.isInteger(cell) || cell < 0 || cell >= p.size * p.size) return null
  const next = state.slice(), row = Math.floor(cell / p.size), col = cell % p.size
  for (const [dr, dc] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const r = row + dr, c = col + dc
    if (r >= 0 && r < p.size && c >= 0 && c < p.size) next[r * p.size + c] ^= 1
  }
  return next
}
export const lightsWon = (_p, state) => state.every(x => x === 0)
// Gaussian elimination over GF(2), then enumerate the small nullspace for minimum presses.
export function solveLights(p, state = p.initial) {
  const n = p.size * p.size
  const columns = range(n).map(cell => lightMove(p, Array(n).fill(0), { cell }))
  const rows = range(n).map(i => [...columns.map(col => col[i]), state[i]])
  const pivots = []; let rank = 0
  for (let c = 0; c < n; c++) {
    const pivot = rows.findIndex((row, i) => i >= rank && row[c])
    if (pivot < 0) continue
    ;[rows[rank], rows[pivot]] = [rows[pivot], rows[rank]]
    for (let r = 0; r < n; r++) if (r !== rank && rows[r][c]) for (let j = c; j <= n; j++) rows[r][j] ^= rows[rank][j]
    pivots.push(c); rank++
  }
  if (rows.some(row => row.slice(0, n).every(v => !v) && row[n])) return null
  const free = range(n).filter(c => !pivots.includes(c)); let best = null
  for (let mask = 0; mask < 2 ** free.length; mask++) {
    const x = Array(n).fill(0)
    free.forEach((c, i) => { x[c] = (mask >> i) & 1 })
    pivots.forEach((c, r) => { x[c] = free.reduce((v, f) => v ^ (rows[r][f] & x[f]), rows[r][n]) })
    const solution = x.flatMap((v, cell) => v ? [{ cell }] : [])
    if (!best || solution.length < best.length) best = solution
  }
  return best
}
let catalog
export function lightsCatalog() {
  if (catalog) return catalog
  const all = [], seen = new Set()
  for (let seed = 1; all.length < 220; seed++) {
    const size = 3 + Math.min(3, Math.floor(all.length / 55)), random = rng(seed * 101)
    const p = { kind: 'lights', size }; let initial = Array(size * size).fill(0)
    const count = 2 + Math.floor((all.length % 55) / 8) + size - 3
    const cells = new Set()
    while (cells.size < count) cells.add(Math.floor(random() * size * size))
    for (const cell of cells) initial = lightMove(p, initial, { cell })
    const id = initial.join('')
    if (seen.has(id) || lightsWon(p, initial)) continue
    seen.add(id); all.push({ ...p, initial, solution: solveLights(p, initial) })
  }
  catalog = all
  return catalog
}
