// "Flying cubes" — a block of small cubes floating in space. Every cube carries one
// arrow; tapping a cube sends it flying that way, but only if no other cube sits
// anywhere along that line. Arrows are assigned by simulating a removal: repeatedly
// take a random cube that has a clear line in some direction, give it that direction
// and lift it out. That order is always a valid solution, and removing a cube never
// blocks another, so every level is solvable and the player can never get stuck.
import { rng, shuffle } from './rng.js'

export const DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]
const key = (x, y, z) => `${x},${y},${z}`
const LIMIT = 16

export function isFree(cubes, cube) {
  return !blocker(cubes, cube)
}
// First cube standing in this cube's way (or null).
export function blocker(cubes, cube) {
  const occ = new Map()
  for (const o of cubes) if (!o.gone && o.id !== cube.id) occ.set(key(o.x, o.y, o.z), o)
  for (let i = 1; i <= LIMIT; i++) {
    const hit = occ.get(key(cube.x + cube.d[0] * i, cube.y + cube.d[1] * i, cube.z + cube.d[2] * i))
    if (hit) return hit
  }
  return null
}

// Levels come in worlds of 20 — each world a different shape that grows from small to big.
// The level number seeds everything, so "level 57" is the same puzzle for everyone.
export const PER_WORLD = 20
const box = (a, b, c) => { const out = []; for (let x = 0; x < a; x++) for (let y = 0; y < b; y++) for (let z = 0; z < c; z++) out.push([x, y, z]); return out }
const where = (n, test) => { const out = []; for (let x = -n; x <= n; x++) for (let y = -n; y <= n; y++) for (let z = -n; z <= n; z++) if (test(x, y, z)) out.push([x, y, z]); return out }
const HEART = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...']
const STAR = ['...#...', '..###..', '#######', '.#####.', '.##.##.', '##...##']
const bitmap = (rows, depth) => { const out = []; rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === '#') for (let z = 0; z < depth; z++) out.push([x, rows.length - 1 - y, z]) })); return out }
export const WORLDS = [
  { name: 'קובייה', emoji: '🧊', cells: t => { const s = [[2, 2, 2], [3, 2, 2], [3, 3, 2], [3, 3, 3], [4, 3, 3], [4, 4, 3], [4, 4, 4], [5, 4, 4], [5, 5, 4], [5, 5, 5]][Math.min(9, Math.floor(t / 2))]; return box(...s) } },
  { name: 'מגדל', emoji: '🗼', cells: t => box(2 + (t > 9 ? 1 : 0), 4 + Math.floor(t / 3), 2 + (t > 14 ? 1 : 0)) },
  { name: 'פירמידה', emoji: '🔺', cells: t => { const n = 3 + Math.floor(t / 4), out = []; for (let y = 0; y < n; y++) { const w = n - y; for (let x = 0; x < w; x++) for (let z = 0; z < w; z++) out.push([x + y / 2, y, z + y / 2]) } return out.map(([x, y, z]) => [Math.round(x * 2), y * 2, Math.round(z * 2)]).map(([x, y, z]) => [x / 2, y / 2, z / 2]).map(([x, y, z]) => [Math.floor(x), y, Math.floor(z)]).filter((c, i, a) => a.findIndex(d => d.join() === c.join()) === i) } },
  { name: 'פלוס', emoji: '➕', cells: t => { const n = 1 + Math.floor(t / 5); return where(n + 1, (x, y, z) => [x, y, z].filter(v => v !== 0).length <= 1 || (Math.abs(x) + Math.abs(y) + Math.abs(z) <= 1 + Math.floor(t / 7))) } },
  { name: 'מדרגות', emoji: '🪜', cells: t => { const n = 3 + Math.floor(t / 4), d = 2 + (t % 2), out = []; for (let x = 0; x < n; x++) for (let y = 0; y <= x; y++) for (let z = 0; z < d; z++) out.push([x, y, z]); return out } },
  { name: 'טבעת', emoji: '⭕', cells: t => { const n = 4 + Math.floor(t / 5), h = 1 + Math.floor((t % 5) / 2); return box(n, h, n).filter(([x, , z]) => x === 0 || z === 0 || x === n - 1 || z === n - 1 || (t > 12 && (x === 1 || z === 1))) } },
  { name: 'יהלום', emoji: '💎', cells: t => { const r = 1 + Math.floor(t / 7); return where(r + 1, (x, y, z) => Math.abs(x) + Math.abs(y) + Math.abs(z) <= r + (t % 7 > 3 ? 1 : 0)) } },
  { name: 'לב', emoji: '❤️', cells: t => bitmap(HEART, 1 + Math.floor(t / 5)) },
  { name: 'כדור', emoji: '🔮', cells: t => { const r = 1.6 + t * 0.12; return where(Math.ceil(r), (x, y, z) => x * x + y * y + z * z <= r * r) } },
  { name: 'גשר', emoji: '🌉', cells: t => { const n = 5 + Math.floor(t / 4), h = 3 + Math.floor(t / 7), d = 2 + (t > 10 ? 1 : 0); return box(n, h, d).filter(([x, y]) => y === h - 1 || x < 2 || x >= n - 2 || (t > 15 && x === Math.floor(n / 2))) } },
  { name: 'כוכב', emoji: '⭐', cells: t => bitmap(STAR, 1 + Math.floor(t / 5)) },
  { name: 'מסגרת', emoji: '🔲', cells: t => { const n = 3 + Math.floor(t / 4); return box(n, n, n).filter(([x, y, z]) => [x, y, z].filter(v => v === 0 || v === n - 1).length >= 2 || (t > 9 && y === 0)) } },
  { name: 'משקולת', emoji: '🏋️', cells: t => { const n = 2 + Math.floor(t / 7), l = 3 + Math.floor(t / 3); return box(n * 2 + l, n, n).filter(([x, y, z]) => x < n || x >= n + l || (y === Math.floor(n / 2) && z === Math.floor(n / 2)) || (t > 12 && y === Math.floor(n / 2))) } },
  { name: 'מבוך', emoji: '🌀', cells: t => { const n = 5 + Math.floor(t / 5) * 2; return box(n, 1 + Math.floor(t / 8), n).filter(([x, , z]) => x % 2 === 0 || z % 2 === 0) } },
  { name: 'סלעים', emoji: '🪨', cells: t => box(4 + Math.floor(t / 7), 4 + Math.floor(t / 8), 4 + Math.floor(t / 9)) , carve: 0.25 },
]
export const LEVEL_COUNT = WORLDS.length * PER_WORLD
export function worldOf(level) {
  const i = Math.floor((level - 1) / PER_WORLD)
  return { index: i % WORLDS.length, round: Math.floor(i / WORLDS.length), step: (level - 1) % PER_WORLD, ...WORLDS[i % WORLDS.length] }
}
export function levelShape(level) {
  const w = worldOf(level)
  // Later in each world (and on every lap after the last world) some outside cubes are nibbled away.
  const carve = w.carve ?? (w.step < 8 && !w.round ? 0 : Math.min(0.2, 0.04 + (w.step % 5) * 0.035 + w.round * 0.04))
  return { cells: w.cells(Math.min(19, w.step + w.round * 4)), carve }
}

export function buildLevel(level) {
  const { cells: raw, carve } = levelShape(level)
  const r = rng(level * 7919 + 13)
  // normalise to start at 0
  const min = [0, 1, 2].map(i => Math.min(...raw.map(c => c[i])))
  let cells = raw.map(c => c.map((v, i) => v - min[i]))
  const [sx, sy, sz] = [0, 1, 2].map(i => Math.max(...cells.map(c => c[i])) + 1)
  if (carve && cells.length > 12) {
    const has = new Set(cells.map(c => key(...c)))
    const outer = ([x, y, z]) => DIRS.some(d => !has.has(key(x + d[0], y + d[1], z + d[2])))
    const drop = new Set(shuffle(r, cells.filter(outer)).slice(0, Math.round(cells.length * carve)).map(c => key(...c)))
    cells = cells.filter(c => !drop.has(key(...c)))
  }
  // Removal simulation → directions.
  const remaining = new Set(cells.map(c => key(...c)))
  const dirOf = new Map()
  const order = []
  while (remaining.size) {
    const list = shuffle(r, [...remaining])
    let done = false
    for (const k of list) {
      const [x, y, z] = k.split(',').map(Number)
      for (const d of shuffle(r, DIRS)) {
        let clear = true
        for (let i = 1; i <= LIMIT; i++) if (remaining.has(key(x + d[0] * i, y + d[1] * i, z + d[2] * i))) { clear = false; break }
        if (clear) { dirOf.set(k, d); remaining.delete(k); order.push(k); done = true; break }
      }
      if (done) break
    }
    if (!done) throw new Error('flying-cubes: no removable cube (should never happen)')
  }
  const cx = (sx - 1) / 2, cy = (sy - 1) / 2, cz = (sz - 1) / 2
  const cubes = cells.map(([x, y, z], id) => ({ id, x, y, z, px: x - cx, py: y - cy, pz: z - cz, d: dirOf.get(key(x, y, z)), gone: false, color: Math.floor(r() * 6) }))
  return { cubes, size: [sx, sy, sz], radius: Math.hypot(sx, sy, sz) / 2 }
}

export const freeCubes = cubes => cubes.filter(c => !c.gone && isFree(cubes, c))
