import { makeRng } from '../rng'

// Maze = perfect maze (exactly one route) from a depth-first "recursive backtracker".
// Level controls: grid size, how often corridors turn, and line/path width.
// Coordinates are in millimetres inside a 180×190 drawing area (the printable part of an A4 sheet).
export const W = 180, H = 190
const COLS = [4, 5, 7, 9, 11, 14, 17]
const STRAIGHT = [0.7, 0.6, 0.45, 0.3, 0.2, 0.1, 0]  // chance to keep going the same way → fewer turns for the young

export function generateMaze({ level, seed, theme }) {
  const rng = makeRng(seed)
  const cols = COLS[level], rows = Math.round(cols * 1.2)
  const cell = Math.min((W - 8) / cols, (H - 30) / rows)
  const ox = (W - cols * cell) / 2, oy = (H - rows * cell) / 2
  // walls[r][c] = {n,e,s,w}: true = wall present
  const walls = Array.from({ length: rows }, () => Array.from({ length: cols }, () => ({ n: true, e: true, s: true, w: true })))
  const seen = Array.from({ length: rows }, () => Array(cols).fill(false))
  const DIRS = { n: [0, -1, 's'], s: [0, 1, 'n'], e: [1, 0, 'w'], w: [-1, 0, 'e'] }
  const start = { c: cols - 1, r: 0 }, goal = { c: 0, r: rows - 1 } // RTL: from top-right to bottom-left
  const stack = [{ ...start, dir: null }]
  seen[start.r][start.c] = true
  while (stack.length) {
    const cur = stack[stack.length - 1]
    let options = Object.keys(DIRS).filter(d => {
      const [dx, dy] = DIRS[d], c = cur.c + dx, r = cur.r + dy
      return c >= 0 && r >= 0 && c < cols && r < rows && !seen[r][c]
    })
    if (!options.length) { stack.pop(); continue }
    let d = cur.dir && options.includes(cur.dir) && rng.chance(STRAIGHT[level]) ? cur.dir : rng.pick(options)
    const [dx, dy, back] = DIRS[d], c = cur.c + dx, r = cur.r + dy
    walls[cur.r][cur.c][d] = false; walls[r][c][back] = false
    seen[r][c] = true
    stack.push({ c, r, dir: d })
  }
  walls[start.r][start.c].n = false // openings
  walls[goal.r][goal.c].s = false
  // Answer path (BFS) for the solution sheet
  const prev = new Map(), key = (c, r) => r * cols + c, q = [start]
  prev.set(key(start.c, start.r), null)
  while (q.length) {
    const { c, r } = q.shift()
    if (c === goal.c && r === goal.r) break
    for (const [d, [dx, dy]] of Object.entries(DIRS)) {
      const nc = c + dx, nr = r + dy
      if (walls[r][c][d] || nc < 0 || nr < 0 || nc >= cols || nr >= rows || prev.has(key(nc, nr))) continue
      prev.set(key(nc, nr), { c, r }); q.push({ c: nc, r: nr })
    }
  }
  const solution = []
  for (let p = goal; p; p = prev.get(key(p.c, p.r))) solution.unshift(p)
  return {
    kind: 'maze', title: theme.mazeTitle, instruction: 'מתחילים בחץ שלמעלה ומגיעים ליעד שלמטה, בלי לעבור דרך קיר.',
    cols, rows, cell, ox, oy, walls, start, goal, solution, startIcon: theme.start, goalIcon: theme.goal,
    stroke: [1.6, 1.4, 1.2, 1, 0.9, 0.8, 0.7][level],
  }
}
