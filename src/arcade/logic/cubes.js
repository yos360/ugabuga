// "Flying cubes" — a block of small cubes floating in space. Every cube carries one
// arrow; tapping a cube sends it flying that way, but only if no other cube sits
// anywhere along that line. Arrows are assigned by simulating a removal: repeatedly
// take a random cube that has a clear line in some direction, give it that direction
// and lift it out. That order is always a valid solution, and removing a cube never
// blocks another, so every level is solvable and the player can never get stuck.
import { rng, shuffle } from './rng'

export const DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]
const key = (x, y, z) => `${x},${y},${z}`
const LIMIT = 12

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

const SIZES = [[2, 2, 2], [3, 2, 2], [3, 3, 2], [3, 3, 3], [4, 3, 3], [4, 4, 3], [4, 4, 4], [5, 4, 4], [5, 5, 4], [5, 5, 5]]
export function levelShape(level) {
  const size = SIZES[Math.min(level - 1, SIZES.length - 1)]
  // From level 5, nibble some cubes off the outside so shapes vary.
  const carve = level < 5 ? 0 : Math.min(0.22, 0.06 + (level % 4) * 0.05)
  return { size, carve }
}

export function buildLevel(level) {
  const { size: [sx, sy, sz], carve } = levelShape(level)
  const r = rng(level * 7919 + 13)
  let cells = []
  for (let x = 0; x < sx; x++) for (let y = 0; y < sy; y++) for (let z = 0; z < sz; z++) cells.push([x, y, z])
  if (carve) {
    const outer = ([x, y, z]) => x === 0 || y === 0 || z === 0 || x === sx - 1 || y === sy - 1 || z === sz - 1
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
