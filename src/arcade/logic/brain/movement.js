import { bfs, range, same } from './core.js'

export function waterActions(p, state) {
  const result = []
  for (let from = 0; from < state.length; from++) {
    for (let to = 0; to < state.length; to++) {
      if (from === to) continue
      const amount = Math.min(state[from], p.capacities[to] - state[to])
      if (amount <= 0) continue
      const child = state.slice(); child[from] -= amount; child[to] += amount
      result.push({ action: { from, to }, state: child })
    }
    if (p.tap) {
      if (state[from] < p.capacities[from]) { const child = state.slice(); child[from] = p.capacities[from]; result.push({ action: { fill: from }, state: child }) }
      if (state[from] > 0) { const child = state.slice(); child[from] = 0; result.push({ action: { empty: from }, state: child }) }
    }
  }
  return result
}
export const waterWon = (p, state) => state.includes(p.target)
export const solveWater = (p, state = p.initial) => bfs(state, s => waterActions(p, s), s => waterWon(p, s))

// Last bit is the adult rower. An unattended bank cannot contain a conflict pair.
export function riverSafe(p, state) {
  const side = (state >> p.n) & 1
  return p.conflicts.every(([a, b]) => ((state >> a) & 1) !== ((state >> b) & 1) || ((state >> a) & 1) === side)
}
export function riverActions(p, state) {
  const side = (state >> p.n) & 1, result = []
  for (let mask = 0; mask < (1 << p.n); mask++) {
    const riders = range(p.n).filter(i => mask & (1 << i))
    if (riders.length > p.capacity || riders.some(i => ((state >> i) & 1) !== side)) continue
    const child = state ^ mask ^ (1 << p.n)
    if (riverSafe(p, child)) result.push({ action: { riders }, state: child })
  }
  return result
}
export const riverWon = (p, state) => state === (1 << (p.n + 1)) - 1
export const solveRiver = (p, state = p.initial) => bfs(state, s => riverActions(p, s), s => riverWon(p, s))

export function frogActions(p, state) {
  const empty = state.indexOf(0), result = []
  state.forEach((direction, from) => {
    const distance = (empty - from) * direction
    if (!direction || (distance !== 1 && distance !== 2)) return
    if (distance === 2 && state[from + direction] !== -direction) return
    const child = state.slice(); child[empty] = direction; child[from] = 0
    result.push({ action: { from }, state: child })
  })
  return result
}
export const frogWon = (p, state) => same(state, p.goal)
export const solveFrogs = (p, state = p.initial) => bfs(state, s => frogActions(p, s), s => frogWon(p, s))

export function applyLegal(p, state, action, actions) {
  return actions(p, state).find(edge => same(edge.action, action))?.state ?? null
}

let waters, rivers, frogs
export function waterCatalog() {
  if (waters) return waters
  const all = []
  for (let a = 3; a <= 14; a++) for (let b = a + 1; b <= 17; b++) for (let target = 1; target < b; target++) {
    if (target === a) continue
    const p = { kind: 'water', capacities: [a, b], initial: [0, 0], target, tap: true }
    const solution = solveWater(p)
    if (solution && solution.length >= 3) all.push({ ...p, solution })
  }
  all.sort((a, b) => a.solution.length - b.solution.length || a.capacities[1] - b.capacities[1])
  // Sample the entire difficulty range, not just the easiest capacity pairs.
  waters = range(100).map(i => all[Math.floor(i * (all.length - 1) / 99)])
  return waters
}
export function riverCatalog() {
  if (rivers) return rivers
  const all = []
  for (let n = 3; n <= 5; n++) {
    const pairs = range(n).flatMap(a => range(n).filter(b => b > a).map(b => [a, b]))
    for (let mask = 1; mask < (1 << pairs.length); mask++) for (let capacity = 1; capacity <= 3; capacity++) {
      const conflicts = pairs.filter((_, i) => mask & (1 << i))
      if (conflicts.length < 2) continue
      const p = { kind: 'river', n, capacity, conflicts, initial: 0 }
      const solution = solveRiver(p)
      if (solution && solution.length >= 5) all.push({ ...p, solution })
    }
  }
  all.sort((a, b) => a.solution.length - b.solution.length || a.conflicts.length - b.conflicts.length)
  rivers = range(100).map(i => all[Math.floor(i * (all.length - 1) / 99)])
  return rivers
}
export function frogCatalog() {
  if (frogs) return frogs
  const all = []
  for (let left = 1; left <= 5; left++) for (let right = 1; right <= 5; right++) {
    const p = { kind: 'frogs', initial: [...Array(left).fill(1), 0, ...Array(right).fill(-1)], goal: [...Array(right).fill(-1), 0, ...Array(left).fill(1)] }
    const solution = solveFrogs(p)
    if (solution) {
      let state = p.initial
      for (let step = 0; step < solution.length - 1; step++) {
        all.push({ ...p, initial: state, solution: solution.slice(step) })
        state = applyLegal(p, state, solution[step], frogActions)
      }
    }
  }
  all.sort((a, b) => a.solution.length - b.solution.length)
  frogs = range(50).map(i => all[Math.floor(i * (all.length - 1) / 49)])
  return frogs
}
