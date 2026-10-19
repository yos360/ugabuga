import { rng, shuffle } from '../rng.js'
import { range, same } from './core.js'

// Segments: top, upper right, lower right, bottom, lower left, upper left, middle.
export const DIGITS = [63, 6, 91, 79, 102, 109, 125, 7, 127, 111]
export const bits = mask => range(21).filter(i => mask & (1 << i))
const board = (a, b, c) => DIGITS[a] | (DIGITS[b] << 7) | (DIGITS[c] << 14)
export function equation(mask, operator) {
  const values = range(3).map(i => DIGITS.indexOf((mask >> (i * 7)) & 127))
  return values.every(v => v >= 0) && (operator === '+' ? values[0] + values[1] : values[0] - values[1]) === values[2]
}
const targets = operator => range(10).flatMap(a => range(10).flatMap(b => {
  const c = operator === '+' ? a + b : a - b
  return c >= 0 && c < 10 ? [board(a, b, c)] : []
}))
export function solveMatches(p, state = p.initial) {
  const remaining = p.budget - state.used
  if (remaining < 0) return null
  for (const target of targets(p.operator)) {
    const remove = bits(state.mask & ~target), add = bits(target & ~state.mask)
    if (p.mode === 'remove') {
      if (remove.length === remaining && add.length === 0) return remove.map(from => ({ from }))
      continue
    }
    if (remove.length !== add.length || remove.length > remaining) continue
    const path = remove.map((from, i) => ({ from, to: add[i] })), spare = range(21).filter(i => !(state.mask & (1 << i)) && !(target & (1 << i)))
    const extra = remaining - path.length
    if (extra === 0) return path
    // Exact move budgets can include an intermediate empty location or a cycle.
    if (extra === 1 && path.length && spare.length) {
      const first = path.shift()
      return [{ from: first.from, to: spare[0] }, { from: spare[0], to: first.to }, ...path]
    }
    if (extra >= 2 && spare.length >= extra - 1) {
      const from = bits(state.mask)[0], stops = [from, ...spare.slice(0, extra - 1), from]
      return [...stops.slice(1).map((to, i) => ({ from: stops[i], to })), ...path]
    }
  }
  return null
}
export function matchMove(p, state, action) {
  const { from, to } = action
  if (state.used >= p.budget || !Number.isInteger(from) || from < 0 || from >= 21 || !(state.mask & (1 << from))) return null
  if (p.mode === 'remove') {
    if (!same(Object.keys(action), ['from'])) return null
    return { mask: state.mask & ~(1 << from), used: state.used + 1 }
  }
  if (!Number.isInteger(to) || to < 0 || to >= 21 || (state.mask & (1 << to))) return null
  return { mask: (state.mask & ~(1 << from)) | (1 << to), used: state.used + 1 }
}
export const matchWon = (p, state) => state.used === p.budget && equation(state.mask, p.operator)
let catalog
export function matchCatalog() {
  if (catalog) return catalog
  const all = [], seen = new Set()
  for (let seed = 1; all.length < 200; seed++) {
    const random = rng(seed * 7919), operator = seed % 2 ? '+' : '-', mode = seed % 4 < 2 ? 'move' : 'remove'
    const budget = 1 + Math.floor(all.length / 70), valid = targets(operator)
    const target = valid[Math.floor(random() * valid.length)]
    const lit = shuffle(random, bits(target)), unlit = shuffle(random, range(21).filter(i => !(target & (1 << i))))
    if (unlit.length < budget || lit.length < budget) continue
    let mask = target
    for (let i = 0; i < budget; i++) { mask |= 1 << unlit[i]; if (mode === 'move') mask &= ~(1 << lit[i]) }
    const id = `${operator}:${mode}:${budget}:${mask}`
    if (seen.has(id) || equation(mask, operator)) continue
    const p = { kind: 'matches', mode, budget, operator, initial: { mask, used: 0 } }
    const solution = solveMatches(p)
    if (!solution) continue
    seen.add(id); all.push({ ...p, solution })
  }
  catalog = all
  return catalog
}
