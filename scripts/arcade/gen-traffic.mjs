// Builds src/arcade/data/traffic-levels.json — 60 "traffic jam" boards with a steady
// difficulty ramp. Solving random boards takes seconds, so it's done once here, not in
// the browser. Run: node scripts/arcade/gen-traffic.mjs  (deterministic for a given seed)
import { writeFile } from 'node:fs/promises'

const N = 6, EXIT = 2
// Note: the search runs for a fixed time, so reruns can pick different boards.
let seed = 20261003
const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }

function solveLen(cars, maxStates = 60000) {
  // cars: [x,y,len,h]; state = positions along each car's axis, packed in a string
  const n = cars.length
  const fixed = cars.map(c => (c[3] ? c[1] : c[0]))
  const start = cars.map(c => (c[3] ? c[0] : c[1]))
  const key = s => s.join('')
  const seen = new Set([key(start)])
  let frontier = [start], depth = 0
  const occ = new Int8Array(36)
  while (frontier.length) {
    const next = []
    for (const s of frontier) {
      if (s[0] + cars[0][2] === N) return depth
      occ.fill(-1)
      for (let i = 0; i < n; i++) for (let k = 0; k < cars[i][2]; k++) {
        const x = cars[i][3] ? s[i] + k : fixed[i], y = cars[i][3] ? fixed[i] : s[i] + k
        occ[y * 6 + x] = i
      }
      for (let i = 0; i < n; i++) {
        const h = cars[i][3], len = cars[i][2]
        const at = (p) => (h ? occ[fixed[i] * 6 + p] : occ[p * 6 + fixed[i]])
        for (let p = s[i] - 1; p >= 0 && at(p) === -1; p--) push(i, p)
        for (let p = s[i] + 1; p + len - 1 < N && at(p + len - 1) === -1; p++) push(i, p)
        function push(i, p) { const t = s.slice(); t[i] = p; const k = key(t); if (!seen.has(k)) { seen.add(k); next.push(t) } }
      }
      if (seen.size > maxStates) return -1
    }
    frontier = next; depth++
  }
  return -1
}

function randomBoard(nCars) {
  const occ = new Int8Array(36).fill(0)
  const cars = [[Math.floor(rnd() * 2), EXIT, 2, 1]]
  for (let k = 0; k < 2; k++) occ[EXIT * 6 + cars[0][0] + k] = 1
  for (let tries = 0; cars.length < nCars && tries < 300; tries++) {
    const h = rnd() < 0.5 ? 1 : 0, len = rnd() < 0.72 ? 2 : 3
    const x = Math.floor(rnd() * (h ? N - len + 1 : N)), y = Math.floor(rnd() * (h ? N : N - len + 1))
    if (h && y === EXIT) continue
    let ok = true
    for (let i = 0; i < len; i++) if (occ[(y + (h ? 0 : i)) * 6 + x + (h ? i : 0)]) { ok = false; break }
    if (!ok) continue
    for (let i = 0; i < len; i++) occ[(y + (h ? 0 : i)) * 6 + x + (h ? i : 0)] = 1
    cars.push([x, y, len, h])
  }
  return cars
}

const byLen = new Map()
const t0 = Date.now()
let boards = 0
while (Date.now() - t0 < 150000) {
  const nCars = 5 + Math.floor(rnd() * 10)
  const cars = randomBoard(nCars)
  const len = solveLen(cars)
  boards++
  if (len < 2) continue
  if (!byLen.has(len)) byLen.set(len, [])
  const list = byLen.get(len)
  if (list.length < 12) list.push(cars)
}
const lens = [...byLen.keys()].sort((a, b) => a - b)
console.log('boards tried', boards, 'solution lengths found', lens.map(l => `${l}:${byLen.get(l).length}`).join(' '))
// Ramp: 60 levels from easy to hard, each board used once, difficulty never going down.
const all = lens.flatMap(l => byLen.get(l).map(cars => ({ best: l, cars })))
const top = Math.min(lens.at(-1), 32)
const levels = []
for (let i = 0; i < 60; i++) {
  const want = Math.round(2 + (i / 59) ** 1.15 * (top - 2))
  const floor = levels.at(-1)?.best ?? 0
  const ok = all.filter(b => !b.used && b.best >= floor)
  const pick = (ok.length ? ok : all.filter(b => !b.used))
    .sort((a, b) => Math.abs(a.best - want) - Math.abs(b.best - want) || a.best - b.best)[0]
  pick.used = true
  levels.push({ best: pick.best, cars: pick.cars })
}
levels.sort((a, b) => a.best - b.best)
await writeFile(new URL('../../src/arcade/data/traffic-levels.json', import.meta.url), JSON.stringify(levels))
console.log('wrote', levels.length, 'levels; best moves:', levels.map(l => l.best).join(','))
