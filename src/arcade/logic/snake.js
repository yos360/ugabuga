// Snake (public-domain arcade game): eat apples, grow, don't bite yourself.
// Extras: rocks (in the journey levels), power-ups, a golden apple and combos.
//
// state: { w, h, body: [[x,y]…] head first, dir, queue, score, dead, apple: [x, y, gold],
//          rocks: [[x,y]…], power: { x, y, type, ttl } | null, fx: { slow, ghost } (steps left),
//          eaten, goal (journey: apples to finish), won, combo, lastEat, steps, ate, got }
export const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' }
export const POWERS = {
  slow: { icon: '🐢', name: 'האטה', steps: 45 },
  ghost: { icon: '👻', name: 'רוח רפאים', steps: 40 },
  shrink: { icon: '✂️', name: 'קיצור', steps: 0 },
}
export const COMBO_WINDOW = 14 // steps between apples that keep a combo going
const key = (x, y) => `${x},${y}`

export function start(w, h, rand = Math.random, opts = {}) {
  const rocks = opts.rocks || []
  const blocked = new Set(rocks.map(([x, y]) => key(x, y)))
  // start on the left half, heading right, on a clear row
  let y = Math.floor(h / 2), x = Math.max(2, Math.floor(w / 4))
  for (let dy = 0; dy < h; dy++) {
    const yy = (Math.floor(h / 2) + (dy % 2 ? -1 : 1) * Math.ceil(dy / 2) + h) % h
    if ([0, 1, 2, 3, 4, 5, 6].every(k => !blocked.has(key(x - 2 + k, yy)))) { y = yy; break } // room behind and 4 cells ahead
  }
  const body = [[x, y], [x - 1, y], [x - 2, y]]
  return placeApple({
    w, h, body, dir: 'right', queue: [], score: 0, dead: false, rocks, power: null, fx: { slow: 0, ghost: 0 },
    eaten: 0, goal: opts.goal || 0, level: opts.level || 0, won: false, combo: 0, lastEat: -99, steps: 0, ate: null, got: null,
  }, rand)
}

function freeCells(s, extra = []) {
  const used = new Set([...s.body, ...(s.rocks || []), ...extra].map(([x, y]) => key(x, y)))
  if (s.power) used.add(key(s.power.x, s.power.y))
  const [hx, hy] = s.body[0]
  const out = []
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) {
    if (used.has(key(x, y))) continue
    if (Math.abs(x - hx) + Math.abs(y - hy) < 2) continue // never right under the nose
    out.push([x, y])
  }
  return out
}

export function placeApple(s, rand = Math.random) {
  const free = freeCells(s)
  if (!free.length) return { ...s, apple: null }
  const [x, y] = free[Math.floor(rand() * free.length)]
  return { ...s, apple: [x, y, s.score >= 3 && rand() < 0.15] }
}

// Queue a turn (up to 2 ahead, so quick double-turns aren't lost).
export function turn(s, dir) {
  const last = s.queue.at(-1) || s.dir
  if (dir === last || dir === OPPOSITE[last] || s.queue.length >= 2) return s
  return { ...s, queue: [...s.queue, dir] }
}

export function step(s, walls, rand = Math.random) {
  if (s.dead || s.won) return s
  const dir = s.queue[0] || s.dir
  const [dx, dy] = DIRS[dir]
  let [x, y] = s.body[0]
  x += dx; y += dy
  if (!walls) { x = (x + s.w) % s.w; y = (y + s.h) % s.h }
  const fx = { slow: Math.max(0, (s.fx?.slow || 0) - 1), ghost: Math.max(0, (s.fx?.ghost || 0) - 1) }
  const steps = (s.steps || 0) + 1
  const base = { ...s, dir, queue: s.queue.slice(1), fx, steps, ate: null, got: null }
  const eats = s.apple && x === s.apple[0] && y === s.apple[1]
  const body = eats ? s.body : s.body.slice(0, -1)
  const hitWall = x < 0 || y < 0 || x >= s.w || y >= s.h
  const ghost = (s.fx?.ghost || 0) > 0
  const hitRock = (s.rocks || []).some(([rx, ry]) => rx === x && ry === y)
  const hitSelf = body.some(([bx, by]) => bx === x && by === y)
  if (hitWall || (!ghost && (hitRock || hitSelf))) return { ...base, dead: true }

  let next = { ...base, body: [[x, y], ...body] }
  if (eats) {
    const gold = !!s.apple[2]
    const combo = steps - (s.lastEat ?? -99) <= COMBO_WINDOW ? (s.combo || 0) + 1 : 1
    const mult = combo >= 3 ? 2 : 1
    next = { ...next, score: s.score + (gold ? 3 : 1) * mult, eaten: (s.eaten || 0) + 1, combo, lastEat: steps, ate: gold ? 'gold' : 'apple' }
    if (next.goal && next.eaten >= next.goal) next.won = true
    next = placeApple(next, rand)
  }
  // power-ups: picked up, timed out, or a new one appears now and then
  let power = s.power
  if (power && power.x === x && power.y === y) {
    next.got = power.type
    if (power.type === 'shrink') next.body = next.body.slice(0, Math.max(3, next.body.length - 3))
    else next.fx = { ...next.fx, [power.type]: POWERS[power.type].steps }
    power = null
  } else if (power) {
    power = power.ttl > 1 ? { ...power, ttl: power.ttl - 1 } : null
  } else if (next.score >= 2 && rand() < 0.025) {
    const free = freeCells(next, next.apple ? [next.apple] : [])
    if (free.length) {
      const [px, py] = free[Math.floor(rand() * free.length)]
      const types = next.body.length > 9 ? ['slow', 'ghost', 'shrink'] : ['slow', 'ghost']
      power = { x: px, y: py, type: types[Math.floor(rand() * types.length)], ttl: 70 }
    }
  }
  next.power = power
  return next
}

// Speed: ms per step. Faster as the snake grows; journey levels start faster; 🐢 slows down.
export function speedFor(score, s = null) {
  const base = s?.goal ? Math.max(80, 175 - (s.level || 1) * 4) : 165
  const ms = Math.max(75, base - score * 3)
  return s?.fx?.slow ? ms * 1.7 : ms
}

// ---------- journey levels ----------
// 20 hand-made layouts on a fixed 15×20 board (rotated to 20×15 on wide screens).
const LW = 15, LH = 20
const line = (x0, y0, x1, y1) => {
  const out = []
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))
  for (let i = 0; i <= n; i++) out.push([Math.round(x0 + ((x1 - x0) * i) / (n || 1)), Math.round(y0 + ((y1 - y0) * i) / (n || 1))])
  return out
}
const box = (x0, y0, x1, y1, gaps = []) => [...line(x0, y0, x1, y0), ...line(x1, y0, x1, y1), ...line(x1, y1, x0, y1), ...line(x0, y1, x0, y0)]
  .filter(([x, y]) => !gaps.some(([gx, gy]) => gx === x && gy === y))
const border = gaps => box(0, 0, LW - 1, LH - 1, gaps)
const LAYOUTS = [
  () => [],
  () => [...line(4, 6, 10, 6), ...line(4, 13, 10, 13)],
  () => [...line(7, 3, 7, 8), ...line(7, 11, 7, 16)],
  () => border([[7, 0], [7, LH - 1], [0, 10], [LW - 1, 10]]),
  () => [...line(3, 3, 5, 3), ...line(3, 3, 3, 5), ...line(9, 3, 11, 3), ...line(11, 3, 11, 5), ...line(3, 14, 3, 16), ...line(3, 16, 5, 16), ...line(11, 14, 11, 16), ...line(9, 16, 11, 16)],
  () => [...line(2, 7, 12, 7), ...line(2, 12, 12, 12)].filter(([x]) => x !== 7),
  () => [...line(7, 4, 7, 8), ...line(7, 12, 7, 15), ...line(3, 10, 5, 10), ...line(9, 10, 11, 10)],
  () => [...border([[7, 0], [7, LH - 1]]), ...line(5, 9, 9, 9), ...line(5, 10, 9, 10)],
  () => [...box(4, 5, 10, 14, [[7, 5], [7, 14]])],
  () => [...line(2, 4, 9, 4), ...line(5, 9, 12, 9), ...line(2, 14, 9, 14)],
  () => { const out = []; for (let y = 3; y < LH - 2; y += 4) for (let x = 2 + (Math.floor(y / 4) % 2) * 2; x < LW - 1; x += 4) out.push([x, y]); return out },
  () => [...border([[0, 5], [0, 14], [LW - 1, 5], [LW - 1, 14]]), ...line(7, 5, 7, 14)],
  () => [...line(3, 3, 11, 3), ...line(11, 3, 11, 16), ...line(3, 16, 9, 16), ...line(3, 6, 3, 16), ...line(6, 6, 8, 6)],
  () => [...box(2, 2, 12, 17, [[7, 2], [2, 10], [12, 10], [7, 17]]), ...line(7, 7, 7, 12)],
  () => { const out = []; for (let y = 2; y < LH - 2; y += 3) out.push(...line(y % 2 ? 1 : 4, y, y % 2 ? 10 : 13, y)); return out },
  () => [...border([[7, 0]]), ...line(4, 4, 4, 15), ...line(10, 4, 10, 15)],
  () => [...line(1, 1, 13, 18).filter((_, i) => i % 2 === 0), ...line(13, 1, 1, 18).filter((_, i) => i % 2 === 0)],
  () => [...box(1, 1, 13, 18, [[7, 1], [7, 18]]), ...box(4, 5, 10, 14, [[4, 9], [10, 10]])],
  () => [...border([[0, 3], [LW - 1, 16]]), ...line(3, 4, 11, 4), ...line(3, 9, 11, 9), ...line(3, 14, 11, 14)],
  () => [...border([[7, 0], [7, LH - 1], [0, 10], [LW - 1, 10]]), ...box(4, 6, 10, 13, [[7, 6], [7, 13]]), ...line(7, 8, 7, 11)],
]
export const LEVEL_COUNT = LAYOUTS.length
export const LEVEL_NAMES = ['שדה פתוח', 'שני גדרות', 'עמוד באמצע', 'חצר סגורה', 'ארבע פינות', 'גשרים', 'צומת', 'מבצר', 'בית קטן', 'זיגזג', 'שדה סלעים', 'שער כפול', 'ספירלה', 'כלוב', 'מדרגות', 'מסדרונות', 'איקס', 'קופסה בקופסה', 'שלוש קומות', 'הטירה']

// Returns { w, h, rocks, goal, level } — `wide` turns the board on its side.
export function levelSpec(level, wide = false) {
  const i = Math.min(Math.max(1, level), LEVEL_COUNT) - 1
  const uniq = new Map()
  for (const [x, y] of LAYOUTS[i]()) if (x >= 0 && y >= 0 && x < LW && y < LH) uniq.set(key(x, y), [x, y])
  let rocks = [...uniq.values()]
  let w = LW, h = LH
  if (wide) { rocks = rocks.map(([x, y]) => [y, x]); w = LH; h = LW }
  return { w, h, rocks, goal: 6 + Math.floor(i * 0.8), level: i + 1 }
}
export const starsForTime = (sec, goal) => (sec <= goal * 3.2 ? 3 : sec <= goal * 5 ? 2 : 1)
