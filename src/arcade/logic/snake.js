// Snake (public-domain arcade game): eat apples, grow, don't bite yourself.
// "Soft walls" mode (default for kids) lets the snake pass through the edges.
export const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' }

export function start(w, h, rand = Math.random) {
  const y = Math.floor(h / 2), x = Math.floor(w / 4)
  const body = [[x + 2, y], [x + 1, y], [x, y]]
  return placeApple({ w, h, body, dir: 'right', queue: [], score: 0, dead: false }, rand)
}

export function placeApple(s, rand = Math.random) {
  const used = new Set(s.body.map(([x, y]) => `${x},${y}`))
  const free = []
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) if (!used.has(`${x},${y}`)) free.push([x, y])
  return { ...s, apple: free.length ? free[Math.floor(rand() * free.length)] : null }
}

// Queue a turn (up to 2 ahead, so quick double-turns aren't lost).
export function turn(s, dir) {
  const last = s.queue.at(-1) || s.dir
  if (dir === last || dir === OPPOSITE[last] || s.queue.length >= 2) return s
  return { ...s, queue: [...s.queue, dir] }
}

export function step(s, walls, rand = Math.random) {
  if (s.dead) return s
  const dir = s.queue[0] || s.dir
  const [dx, dy] = DIRS[dir]
  let [x, y] = s.body[0]
  x += dx; y += dy
  if (!walls) { x = (x + s.w) % s.w; y = (y + s.h) % s.h }
  const eats = s.apple && x === s.apple[0] && y === s.apple[1]
  const body = eats ? s.body : s.body.slice(0, -1)
  const hitWall = x < 0 || y < 0 || x >= s.w || y >= s.h
  if (hitWall || body.some(([bx, by]) => bx === x && by === y)) return { ...s, dir, queue: s.queue.slice(1), dead: true }
  const next = { ...s, body: [[x, y], ...body], dir, queue: s.queue.slice(1), score: s.score + (eats ? 1 : 0) }
  return eats ? placeApple(next, rand) : next
}

// Speed: ms per step, faster as the snake grows.
export const speedFor = score => Math.max(70, 170 - score * 4)
