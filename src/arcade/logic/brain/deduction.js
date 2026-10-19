import { rng, shuffle } from '../rng.js'
import { permutations, range } from './core.js'

export function wireClue(order, clue) {
  const a = order.indexOf(clue.a), b = order.indexOf(clue.b)
  if (clue.type === 'before') return a < b
  if (clue.type === 'adjacent') return Math.abs(a - b) === 1
  return a !== clue.position
}
export function solveWires(p) {
  return [...new Set(permutations(range(p.n)).filter(order => p.clues.every(clue => wireClue(order, clue))).map(order => order[p.position]))]
}
export function makeWires(index) {
  const n = 4 + Math.min(2, Math.floor(index / 50)), random = rng(9701 + index)
  const order = shuffle(random, range(n)), position = index % n
  let clues = order.slice(1).map((b, i) => ({ type: 'before', a: order[i], b }))
  const extras = order.flatMap((a, i) => [{ type: 'not', a, position: (i + 1) % n }, ...(i < n - 1 ? [{ type: 'adjacent', a, b: order[i + 1] }] : [])])
  clues = shuffle(random, [...clues, ...extras])
  for (const clue of [...clues]) {
    const smaller = clues.filter(c => c !== clue)
    if (solveWires({ n, position, clues: smaller }).length === 1) clues = smaller
  }
  return { kind: 'wires', n, position, clues, initial: null, solution: [{ answer: order[position] }] }
}

export function codeFeedback(secret, guess) {
  const exact = secret.filter((v, i) => guess[i] === v).length
  const present = secret.filter(v => guess.includes(v)).length
  return [exact, present - exact]
}
const codes = permutations(range(6)).map(p => p.slice(0, 3)).filter((p, i, all) => all.findIndex(q => q.join('') === p.join('')) === i)
export function solveCode(p) {
  return codes.filter(code => p.clues.every(({ guess, exact, misplaced }) => {
    const feedback = codeFeedback(code, guess)
    return feedback[0] === exact && feedback[1] === misplaced
  })).map(code => code.join(''))
}
export function makeCode(index) {
  const secret = codes[(index * 7) % codes.length], random = rng(index + 411)
  const clues = []
  for (const guess of shuffle(random, codes).filter(code => code.join('') !== secret.join(''))) {
    const [exact, misplaced] = codeFeedback(secret, guess)
    clues.push({ guess, exact, misplaced })
    if (solveCode({ clues }).length === 1) break
  }
  return { kind: 'code', initial: null, clues, solution: [{ answer: secret.join('') }] }
}

export function scaleResult(heavy, left, right) {
  const delta = Number(left.includes(heavy)) - Number(right.includes(heavy))
  return Math.sign(delta)
}
export const solveScales = p => range(p.n).filter(heavy => p.weighings.every(w => scaleResult(heavy, w.left, w.right) === w.result))
export function makeScales(index) {
  const n = 6 + index % 4, random = rng(700 + index), heavy = Math.floor(random() * n), weighings = []
  let candidates = range(n)
  while (candidates.length > 1) {
    const order = shuffle(random, candidates), count = Math.ceil(order.length / 3)
    const left = order.slice(0, count), right = order.slice(count, count * 2)
    // For two candidates both pans contain one ball; all comparisons have equal counts.
    const result = scaleResult(heavy, left, right)
    weighings.push({ left, right, result }); candidates = candidates.filter(h => scaleResult(h, left, right) === result)
  }
  return { kind: 'scales', n, weighings, initial: null, solution: [{ answer: heavy }] }
}

export function makeMagic(index) {
  const offset = index, factor = 1 + index % 3, raw = [8, 1, 6, 3, 5, 7, 4, 9, 2]
  const grid = raw.map(v => v * factor + offset), missing = index % 9, answer = grid[missing]
  grid[missing] = null
  return { kind: 'magic', grid, missing, sum: 15 * factor + offset * 3, initial: null, solution: [{ answer }] }
}
export function solveMagic(p) {
  const r = Math.floor(p.missing / 3), row = p.grid.slice(r * 3, r * 3 + 3), answer = p.sum - row.reduce((s, v) => s + (v ?? 0), 0)
  const grid = p.grid.map(v => v ?? answer)
  const lines = [...range(3).map(i => [i * 3, i * 3 + 1, i * 3 + 2]), ...range(3).map(i => [i, i + 3, i + 6]), [0, 4, 8], [2, 4, 6]]
  return new Set(grid).size === 9 && lines.every(line => line.reduce((sum, i) => sum + grid[i], 0) === p.sum) ? [answer] : []
}

const statementTrue = (candidate, s) => s.not ? candidate !== s.target : candidate === s.target
export const solveLiars = p => range(p.n).filter(candidate => p.statements.filter(s => statementTrue(candidate, s)).length === p.truths)
export function makeLiars(index) {
  const random = rng(index + 317), n = 3 + index % 3, culprit = index % n
  for (;;) {
    const statements = range(n).map(() => ({ target: Math.floor(random() * n), not: random() > 0.5 }))
    const truths = statements.filter(s => statementTrue(culprit, s)).length
    if (truths === 0 || truths === n) continue
    const p = { kind: 'liars', n, truths, statements, initial: null }
    if (solveLiars(p).length === 1) return { ...p, solution: [{ answer: culprit }] }
  }
}

// Beam enters from the left. Each tile is empty (0), slash (1) or backslash (2).
export function traceLaser(p, state) {
  let row = p.entry, col = 0, dr = 0, dc = 1; const visited = new Set(), path = []
  while (row >= 0 && col >= 0 && row < p.size && col < p.size) {
    const id = `${row},${col},${dr},${dc}`
    if (visited.has(id)) return { hit: false, path }
    visited.add(id); path.push(row * p.size + col)
    const mirror = state[row * p.size + col]
    if (mirror === 1) [dr, dc] = [-dc, -dr]
    if (mirror === 2) [dr, dc] = [dc, dr]
    row += dr; col += dc
  }
  return { hit: row === p.target.row && col === p.target.col, path }
}
export function laserMove(p, state, { cell }) {
  if (!Number.isInteger(cell) || cell < 0 || cell >= state.length || !state[cell]) return null
  const next = state.slice(); next[cell] = 3 - next[cell]; return next
}
export function solveLaser(p, state = p.initial) {
  const mirrors = range(state.length).filter(i => state[i]); let best = null
  for (let mask = 0; mask < (1 << mirrors.length); mask++) {
    let next = state; const path = []
    mirrors.forEach((cell, i) => { if (mask & (1 << i)) { next = laserMove(p, next, { cell }); path.push({ cell }) } })
    if (traceLaser(p, next).hit && (!best || path.length < best.length)) best = path
  }
  return best
}
export function makeLaser(index) {
  const size = index < 24 ? 4 : 5, local = index < 24 ? index : index - 24
  const entry = local % size, col = 1 + Math.floor(local / size) % (size - 1)
  const down = Math.floor(local / (size * (size - 1))) % 2 === 0
  const initial = Array(size * size).fill(0); initial[entry * size + col] = down ? 1 : 2
  const p = { kind: 'laser', size, entry, target: { row: down ? size : -1, col }, initial }
  if (index >= 24) {
    // Three bends: enter, turn vertically, turn right, then turn toward the target.
    initial.fill(0)
    const middle = (entry + 1 + Math.floor(local / size) % 4) % size
    const cells = [entry * size + 1, middle * size + 1, middle * size + 3]
    const correct = [middle > entry ? 2 : 1, middle > entry ? 2 : 1, down ? 2 : 1]
    const flipped = 1 + local % 7
    cells.forEach((cell, i) => { initial[cell] = flipped & (1 << i) ? 3 - correct[i] : correct[i] })
    p.target.col = 3
  }
  return { ...p, solution: solveLaser(p) }
}
