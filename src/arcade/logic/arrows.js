// "Arrows escape" — the flat cousin of Flying Cubes. A picture made of arrow tiles; tapping a
// tile slides it off the board in its arrow's direction, but only if nothing stands in the way.
// Directions come from a simulated removal (always take a tile with a clear line out), so every
// level is solvable and taking a free tile never blocks another one: the player can't get stuck.
import { rng, shuffle } from './rng.js'

export const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }
const DIR_NAMES = Object.keys(DIRS)
const key = (x, y) => `${x},${y}`

// Shapes, as functions of a size n — grids of booleans built from simple geometry.
const grid = (w, h, test) => { const out = []; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (test(x, y, w, h)) out.push([x, y]); return out }
export const PER_WORLD = 20
export const WORLDS = [
  { name: 'ריבוע', emoji: '🟨', cells: n => grid(n, n, () => true) },
  { name: 'יהלום', emoji: '💎', cells: n => { const c = (n - 1) / 2; return grid(n, n, (x, y) => Math.abs(x - c) + Math.abs(y - c) <= c + 0.01) } },
  { name: 'עיגול', emoji: '⚪', cells: n => { const c = (n - 1) / 2, r = n / 2; return grid(n, n, (x, y) => (x - c) ** 2 + (y - c) ** 2 <= r * r * 0.92) } },
  { name: 'לב', emoji: '❤️', cells: n => grid(n, n, (x, y) => { const X = (x - (n - 1) / 2) / (n / 2.3), Y = -((y - (n - 1) / 2) / (n / 2.3)) + 0.25; return (X * X + Y * Y - 1) ** 3 - X * X * Y ** 3 <= 0 }) },
  { name: 'פלוס', emoji: '➕', cells: n => { const t = Math.max(1, Math.round(n / 3)), a = Math.floor((n - t) / 2); return grid(n, n, (x, y) => (x >= a && x < a + t) || (y >= a && y < a + t)) } },
  { name: 'מסגרת', emoji: '🖼️', cells: n => { const t = Math.max(1, Math.floor(n / 4)); return grid(n, n, (x, y) => x < t || y < t || x >= n - t || y >= n - t) } },
  { name: 'בית', emoji: '🏠', cells: n => { const roof = Math.ceil(n / 2.4), c = (n - 1) / 2; return grid(n, n, (x, y) => y >= roof || Math.abs(x - c) <= y * (c / roof) + 0.5) } },
  { name: 'מדרגות', emoji: '🪜', cells: n => grid(n, n, (x, y) => x >= n - 1 - y) },
  { name: 'משולש', emoji: '🔺', cells: n => { const c = (n - 1) / 2; return grid(n, n, (x, y) => Math.abs(x - c) <= (y + 1) * (n / 2) / n + 0.01) } },
  { name: 'שחמט', emoji: '♟️', cells: n => grid(n, n, (x, y) => (x + y) % 2 === 0 || (x % 3 === 0 && y % 3 === 0)) },
  { name: 'טבעת', emoji: '⭕', cells: n => { const c = (n - 1) / 2, r = n / 2; return grid(n, n, (x, y) => { const d = (x - c) ** 2 + (y - c) ** 2; return d <= r * r * 0.92 && d >= (r * 0.45) ** 2 }) } },
  { name: 'מבוך', emoji: '🌀', cells: n => grid(n, n, (x, y) => x % 2 === 0 || y % 2 === 0) },
  { name: 'פרפר', emoji: '🦋', cells: n => { const c = (n - 1) / 2; return grid(n, n, (x, y) => Math.abs(y - c) <= Math.abs(x - c) + 0.6 || Math.abs(x - c) < 0.6) } },
  { name: 'גלים', emoji: '🌊', cells: n => grid(n, n, (x, y) => Math.abs(y - (n - 1) / 2 - Math.round(Math.sin(x / 1.4) * n / 5)) <= n / 4) },
  { name: 'ענק', emoji: '🐘', cells: n => grid(n + 2, n, () => true) },
]
export const LEVEL_COUNT = WORLDS.length * PER_WORLD
export function worldOf(level) {
  const i = Math.floor((level - 1) / PER_WORLD)
  return { index: i % WORLDS.length, round: Math.floor(i / WORLDS.length), step: (level - 1) % PER_WORLD, ...WORLDS[i % WORLDS.length] }
}
// Board size grows inside each world (4 → 11), and a bit more on every lap.
const sizeFor = w => Math.min(13, 4 + Math.floor(w.step / 3) + w.round)

export function buildLevel(level) {
  const w = worldOf(level), n = sizeFor(w), r = rng(level * 104729 + 7)
  let cells = w.cells(n)
  if (cells.length < 4) cells = grid(n, n, () => true)
  const W = Math.max(...cells.map(c => c[0])) + 1, H = Math.max(...cells.map(c => c[1])) + 1
  const remaining = new Set(cells.map(c => key(...c)))
  const dirOf = new Map()
  const clearLine = (x, y, [dx, dy]) => { for (let i = 1; i < W + H; i++) if (remaining.has(key(x + dx * i, y + dy * i))) return false; return true }
  while (remaining.size) {
    let done = false
    for (const k of shuffle(r, [...remaining])) {
      const [x, y] = k.split(',').map(Number)
      const open = shuffle(r, DIR_NAMES).filter(d => clearLine(x, y, DIRS[d]))
      if (open.length) { dirOf.set(k, open[0]); remaining.delete(k); done = true; break }
    }
    if (!done) throw new Error('arrows: no removable tile (should never happen)')
  }
  const tiles = cells.map(([x, y], id) => ({ id, x, y, d: dirOf.get(key(x, y)), gone: false, color: Math.floor(r() * 5) }))
  return { tiles, w: W, h: H }
}

// The first tile standing in this tile's way, or null if its line out is clear.
export function blocker(tiles, t) {
  const [dx, dy] = DIRS[t.d]
  let best = null, bestI = Infinity
  for (const o of tiles) {
    if (o.gone || o.id === t.id) continue
    const i = dx ? (o.y === t.y ? (o.x - t.x) * dx : -1) : (o.x === t.x ? (o.y - t.y) * dy : -1)
    if (i > 0 && i < bestI) { best = o; bestI = i }
  }
  return best
}
export const isFree = (tiles, t) => !blocker(tiles, t)
export const freeTiles = tiles => tiles.filter(t => !t.gone && isFree(tiles, t))
