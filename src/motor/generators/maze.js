import { makeRng } from '../rng'

// Maze = perfect maze (exactly one route) from a depth-first "recursive backtracker".
// Level controls: grid size, how often corridors turn, and line/path width.
// Coordinates are in millimetres inside a 180×190 drawing area (the printable part of an A4 sheet).
export const W = 180, H = 190
const COLS = [4, 5, 7, 9, 11, 14, 17]
const STRAIGHT = [0.7, 0.6, 0.45, 0.3, 0.2, 0.1, 0]  // chance to keep going the same way → fewer turns for the young

// Where the way in and the way out are: picked at random so mazes don't all look alike.
const LAYOUTS = [
  (c, r) => [{ c: c - 1, r: 0, open: 'n' }, { c: 0, r: r - 1, open: 's' }],           // top-right → bottom-left
  (c, r) => [{ c: 0, r: 0, open: 'n' }, { c: c - 1, r: r - 1, open: 's' }],           // top-left → bottom-right
  (c, r) => [{ c: Math.floor(c / 2), r: 0, open: 'n' }, { c: Math.floor(c / 2), r: r - 1, open: 's' }], // top → bottom middle
  (c, r) => [{ c: c - 1, r: 0, open: 'e' }, { c: 0, r: r - 1, open: 'w' }],           // right side → left side
  (c, r) => [{ c: c - 1, r: Math.floor(r / 2), open: 'e' }, { c: 0, r: Math.floor(r / 2), open: 'w' }],  // right middle → left middle
]

export function generateMaze({ level, seed, theme }) {
  const rng = makeRng(seed)
  const cols = Math.max(3, COLS[level] + rng.int(-1, 1))
  const rows = Math.max(3, Math.round(cols * (1 + rng.next() * 0.4)))
  const cell = Math.min((W - 24) / cols, (H - 30) / rows)
  const ox = (W - cols * cell) / 2, oy = (H - rows * cell) / 2
  const walls = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ n: true, e: true, s: true, w: true })))
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false))
  const DIRS = { n: [0, -1, 's'], s: [0, 1, 'n'], e: [1, 0, 'w'], w: [-1, 0, 'e'] }
  const [start, goal] = rng.pick(LAYOUTS)(cols, rows)
  const inside = (c, r) => c >= 0 && r >= 0 && c < cols && r < rows
  const carve = (a, d) => { const [dx, dy, back] = DIRS[d]; walls[a.r][a.c][d] = false; walls[a.r + dy][a.c + dx][back] = false }
  const algo = level <= 1 ? 'dfs' : rng.pick(['dfs', 'dfs', 'prim']) // Prim: many short branches, a different "texture"
  if (algo === 'dfs') {
    const stack = [{ ...start, dir: null }]
    seen[start.r][start.c] = true
    while (stack.length) {
      const cur = stack[stack.length - 1]
      const options = Object.keys(DIRS).filter(d => { const [dx, dy] = DIRS[d]; return inside(cur.c + dx, cur.r + dy) && !seen[cur.r + dy][cur.c + dx] })
      if (!options.length) { stack.pop(); continue }
      const d = cur.dir && options.includes(cur.dir) && rng.chance(STRAIGHT[level]) ? cur.dir : rng.pick(options)
      const [dx, dy] = DIRS[d]
      carve(cur, d); seen[cur.r + dy][cur.c + dx] = true
      stack.push({ c: cur.c + dx, r: cur.r + dy, dir: d })
    }
  } else {
    const frontier = []
    const add = (c, r) => { seen[r][c] = true; for (const [d, [dx, dy]] of Object.entries(DIRS)) if (inside(c + dx, r + dy) && !seen[r + dy][c + dx]) frontier.push({ c, r, d }) }
    add(start.c, start.r)
    while (frontier.length) {
      const i = rng.int(0, frontier.length - 1), f = frontier[i]
      frontier[i] = frontier[frontier.length - 1]; frontier.pop()
      const [dx, dy] = DIRS[f.d], nc = f.c + dx, nr = f.r + dy
      if (seen[nr][nc]) continue
      carve(f, f.d); add(nc, nr)
    }
  }
  walls[start.r][start.c][start.open] = false // openings
  walls[goal.r][goal.c][goal.open] = false
  const prev = new Map(), key = (c, r) => r * cols + c, q = [start]
  prev.set(key(start.c, start.r), null)
  while (q.length) {
    const { c, r } = q.shift()
    if (c === goal.c && r === goal.r) break
    for (const [d, [dx, dy]] of Object.entries(DIRS)) {
      const nc = c + dx, nr = r + dy
      if (walls[r][c][d] || !inside(nc, nr) || prev.has(key(nc, nr))) continue
      prev.set(key(nc, nr), { c, r }); q.push({ c: nc, r: nr })
    }
  }
  const solution = []
  for (let p = goal; p; p = prev.get(key(p.c, p.r))) solution.unshift(p)
  return {
    kind: 'maze', title: theme.mazeTitle, instruction: 'מתחילים ליד הציור שבכניסה ומגיעים ליעד, בלי לעבור דרך קיר.',
    cols, rows, cell, ox, oy, walls, start, goal, solution, startIcon: theme.start, goalIcon: theme.goal,
    stroke: [1.6, 1.4, 1.2, 1, 0.9, 0.8, 0.7][level],
  }
}
