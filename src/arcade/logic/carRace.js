// Car race rules (pure, no DOM): three lanes, the road scrolls down, the player's car
// sits near the bottom. Positions: y runs 0 (top) → 1 (bottom). Time is in seconds.
export const LANES = 3
export const PLAYER_Y = 0.8
export const HIT_RADIUS = 0.07 // how close (in y) an object must be to touch the car
export const START_LIVES = 3
export const OBSTACLES = ['🚧', '🪨', '🛢️', '🚙', '🐄']
const MIN_GAP = 0.34 // minimum distance in y between two spawn rows

// gentle = prefers-reduced-motion: slower start and a lower top speed
export function speedFor(dist, gentle = false) {
  const base = gentle ? 0.3 : 0.4
  const cap = gentle ? 0.62 : 1.0
  return Math.min(cap, base + dist * 0.00045)
}

export function startRace(gentle = false) {
  return { lane: 1, objs: [], dist: 0, stars: 0, lives: START_LIVES, over: false, nextId: 1, sinceSpawn: 0.2, invincible: 0, gentle, events: [] }
}

export function moveLane(s, dir) {
  if (s.over) return s
  const lane = Math.max(0, Math.min(LANES - 1, s.lane + (dir === 'left' ? -1 : dir === 'right' ? 1 : 0)))
  return lane === s.lane ? s : { ...s, lane }
}

export function scoreOf(s) {
  return Math.floor(s.dist / 10) + s.stars * 10
}

// A spawn row: one or two obstacles (never all three lanes), sometimes a star in a free lane.
export function makeRow(rand, nextId, dist) {
  const lanes = [0, 1, 2]
  const blocked = []
  const wantTwo = dist > 250 && rand() < Math.min(0.45, 0.15 + dist / 4000)
  for (let k = 0; k < (wantTwo ? 2 : 1); k++) blocked.push(lanes.splice(Math.floor(rand() * lanes.length), 1)[0])
  const objs = blocked.map((lane, i) => ({ id: nextId + i, lane, y: -0.08, kind: 'obstacle', face: OBSTACLES[Math.floor(rand() * OBSTACLES.length)] }))
  if (rand() < 0.7) objs.push({ id: nextId + objs.length, lane: lanes[Math.floor(rand() * lanes.length)], y: -0.08, kind: 'star', face: '⭐' })
  return objs
}

// One tick. Returns a new state; `events` lists what happened ('star' | 'crash' | 'over').
export function stepRace(s, dt, rand) {
  if (s.over) return s
  const speed = speedFor(s.dist, s.gentle)
  const dist = s.dist + speed * dt * 100
  const events = []
  let { stars, lives, nextId, sinceSpawn, invincible } = s
  invincible = Math.max(0, invincible - dt)
  const next = []
  for (const o of s.objs) {
    const y = o.y + speed * dt
    if (y > 1.12) continue
    const touching = o.lane === s.lane && Math.abs(y - PLAYER_Y) < HIT_RADIUS
    if (touching && o.kind === 'star') { stars++; events.push('star'); continue }
    if (touching && o.kind === 'obstacle' && invincible <= 0) { lives--; invincible = 1.4; events.push('crash'); continue }
    next.push({ ...o, y })
  }
  sinceSpawn += speed * dt
  let objs = next
  if (sinceSpawn >= MIN_GAP + 0.18 / Math.max(0.4, speed * 1.6)) {
    const row = makeRow(rand, nextId, dist)
    objs = [...objs, ...row]
    nextId += row.length
    sinceSpawn = 0
  }
  const over = lives <= 0
  if (over) events.push('over')
  return { ...s, dist, objs, stars, lives: Math.max(0, lives), nextId, sinceSpawn, invincible, over, events }
}
