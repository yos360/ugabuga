// "Traffic jam" — slide cars back and forth (each only along its own direction)
// until the ice-cream truck drives out of the gate on the right. The 60 boards are
// pre-solved by scripts/arcade/gen-traffic.mjs, so each is solvable and we know its
// shortest solution (used for the stars). The hint solves the CURRENT board live.
import LEVELS from '../data/traffic-levels.json'

export const N = 6
export const EXIT_ROW = 2
export const LEVEL_COUNT = LEVELS.length

// car: { id, x, y, len, h } — car 0 is the truck.
export function buildLevel(level) {
  const L = LEVELS[(level - 1) % LEVELS.length]
  return { best: L.best, cars: L.cars.map(([x, y, len, h], id) => ({ id, x, y, len, h: !!h })) }
}

function grid(cars) {
  const g = Array.from({ length: N }, () => Array(N).fill(-1))
  for (const c of cars) for (let i = 0; i < c.len; i++) g[c.y + (c.h ? 0 : i)][c.x + (c.h ? i : 0)] = c.id
  return g
}

// How far a car may slide: [most negative offset, most positive offset].
export function range(cars, id) {
  const g = grid(cars), c = cars[id]
  let lo = 0, hi = 0
  if (c.h) {
    while (c.x + lo - 1 >= 0 && g[c.y][c.x + lo - 1] === -1) lo--
    while (c.x + c.len + hi < N && g[c.y][c.x + c.len + hi] === -1) hi++
  } else {
    while (c.y + lo - 1 >= 0 && g[c.y + lo - 1][c.x] === -1) lo--
    while (c.y + c.len + hi < N && g[c.y + c.len + hi][c.x] === -1) hi++
  }
  return [lo, hi]
}

export const isWon = cars => cars[0].x + cars[0].len === N

// Shortest solution from the current position; returns the first move { id, to } or null.
export function hint(cars, maxStates = 80000) {
  const n = cars.length
  const fixed = cars.map(c => (c.h ? c.y : c.x))
  const start = cars.map(c => (c.h ? c.x : c.y))
  const key = s => s.join('')
  const first = new Map([[key(start), null]])
  let frontier = [start]
  const occ = new Int8Array(N * N)
  while (frontier.length) {
    const next = []
    for (const s of frontier) {
      if (s[0] + cars[0].len === N) return first.get(key(s))
      occ.fill(-1)
      for (let i = 0; i < n; i++) for (let k = 0; k < cars[i].len; k++) {
        const x = cars[i].h ? s[i] + k : fixed[i], y = cars[i].h ? fixed[i] : s[i] + k
        occ[y * N + x] = i
      }
      const origin = first.get(key(s))
      for (let i = 0; i < n; i++) {
        const { h, len } = cars[i]
        const at = p => (h ? occ[fixed[i] * N + p] : occ[p * N + fixed[i]])
        const push = p => {
          const t = s.slice(); t[i] = p
          const k = key(t)
          if (first.has(k)) return
          first.set(k, origin || { id: i, to: p })
          next.push(t)
        }
        for (let p = s[i] - 1; p >= 0 && at(p) === -1; p--) push(p)
        for (let p = s[i] + 1; p + len - 1 < N && at(p + len - 1) === -1; p++) push(p)
      }
      if (first.size > maxStates) return null
    }
    frontier = next
  }
  return null
}
