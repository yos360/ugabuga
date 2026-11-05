// "בוגה בורח": the rules of the 3D runner, with no drawing, so they run the same in the browser and in tests.
// The path is a chain of straight segments joined by 90° corners. A segment's items sit at a distance `at`
// along it, in a lane (-1, 0, 1), or across the whole path when lane is null.

export const LANE_W = 2.4
export const TURN_WINDOW = 15 // metres before a corner where a swipe towards it counts as turning
const CRASH_AFTER = 2.2 // metres past the corner's centre before a runner who did not turn hits the wall
const START_SPEED = 13
const MAX_SPEED = 30
const ACCEL = 0.16
const JUMP_V = 10.5
const GRAVITY = 27
const SLIDE_SECONDS = 0.75
const STUMBLE_SECONDS = 9
const INVULNERABLE_SECONDS = 1.2
const MAGNET_SECONDS = 9
const MAGNET_REACH = 11
export const CLEAR_HEIGHT = 1.1 // a low obstacle and a pit need the feet at least this high / off the ground
export const WORLDS = ['jungle', 'desert', 'candy', 'night']
const WORLD_METRES = 650
const PAD_V = 15.5
const CHAIN_PER_MULT = 12 // coins count 1 and rows more, so a clean stretch climbs one step of the multiplier
const MAX_MULT = 5
const CLOSE_SECONDS = 0.28 // an action this soon before a row makes it a near miss
const JUMP_BUFFER = 0.14 // a jump pressed just before landing still counts
const ESCAPE_SECONDS = 3 // each row passed while chased takes this much off the chase
const MISSION_BONUS = 150
const MISSIONS = [
  { key: 'coins', text: n => `לאסוף ${n} מטבעות`, goals: [30, 60, 100] },
  { key: 'close', text: n => `${n} פעמים "כמעט!"`, goals: [3, 6, 10] },
  { key: 'dodges', text: n => `לעבור ${n} מכשולים`, goals: [10, 20, 35] },
  { key: 'jumps', text: n => `לקפוץ ${n} פעמים`, goals: [8, 15, 25] },
  { key: 'run', text: n => `לרוץ ${n} מטר`, goals: [400, 800, 1500] },
  { key: 'pads', text: n => `לעוף ${n} פעמים על קפיץ`, goals: [2, 4, 6] },
  { key: 'mult', text: n => `להגיע לכפל ×${n}`, goals: [3, 4, 5] },
]

export const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]] // [x, z] of forward, for heading 0..3; right = heading + 1

export function rng(seed) {
  let x = seed >>> 0 || 1
  return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296 }
}

export function timesQuestion(r) {
  const a = 2 + Math.floor(r() * 8), b = 2 + Math.floor(r() * 8), right = a * b
  const wrong = new Set()
  for (const d of [a, b, -a, -b, 1, -1, 10, -10]) { const n = right + d; if (n > 0 && n !== right) wrong.add(n) }
  const pool = [...wrong].sort(() => r() - 0.5).slice(0, 2)
  const lane = Math.floor(r() * 3) - 1
  const answers = {}
  for (const l of [-1, 0, 1]) answers[l] = l === lane ? right : pool.pop()
  return { text: `${a} × ${b}`, answers, right: lane }
}

// One row: what stands at distance `at`. Every row leaves a way through: a free lane, a jump or a slide.
function addRow(items, r, at, level) {
  const roll = r()
  // `show` only changes how a row arrives on screen: it always stands at `at` when the runner gets there
  const add = (kind, lane, show = null) => items.push({ kind, lane, at, show })
  const lively = r() < 0.2 + level * 0.5
  if (roll < 0.34) {
    const blocked = r() < 0.35 + level * 0.4 ? 2 : 1
    const free = Math.floor(r() * 3) - 1
    const lanes = [-1, 0, 1].filter(l => l !== free).sort(() => r() - 0.5).slice(0, blocked)
    const show = !lively ? null : blocked === 1 && r() < 0.5 ? 'swing' : 'roll'
    lanes.forEach(l => add('wall', l, show))
    return free
  }
  if (roll < 0.58) { const show = lively ? 'rise' : null; [-1, 0, 1].forEach(l => add('low', l, show)); return null }
  if (roll < 0.8) { add('high', null, lively ? 'drop' : null); return null }
  add('pit', null)
  return null
}

export function groundAt(seg, d) {
  const k = (d - 16) / (seg.len - 46)
  if (k <= 0) return seg.h0
  if (k >= 1) return seg.h1
  return seg.h0 + (seg.h1 - seg.h0) * k * k * (3 - 2 * k) + seg.bump * Math.sin(Math.PI * k) ** 2
}

function coinLine(items, r, at, lane, count = 6) {
  for (let i = 0; i < count; i++) items.push({ kind: 'coin', lane, at: at + i * 2.6 })
}

function makeSegment(s, prev) {
  const r = s.random
  const id = s.nextSegment++
  const total = prev ? prev.start + prev.len : 0
  const level = Math.min(1, total / 2600)
  const len = id === 0 ? 150 : 95 + Math.floor(r() * 80)
  // the path only ever goes forward or sideways, never back, so it cannot cross itself
  const turn = s.bend !== 0 ? -s.bend : r() < 0.5 ? -1 : 1
  s.bend += turn
  let ox = 0, oz = 0, dir = 0
  if (prev) {
    ox = prev.ox + DIRS[prev.dir][0] * prev.len
    oz = prev.oz + DIRS[prev.dir][1] * prev.len
    dir = (prev.dir + prev.turn + 4) % 4
  }
  const items = []
  // two rows must never be closer than one full jump at the speed the runner will have by then
  const topSpeed = Math.min(MAX_SPEED, Math.sqrt(START_SPEED ** 2 + 2 * ACCEL * (total + len)))
  const gapBase = Math.max(24 - level * 7, topSpeed * 0.95)
  let at = id === 0 ? 48 : 22
  while (at < len - TURN_WINDOW - 14) {
    if (s.mode === 'times' && s.sinceGate >= 3) {
      items.push({ kind: 'gate', lane: null, at, ...timesQuestion(r) })
      s.sinceGate = 0
      at += 44
      continue
    }
    const free = addRow(items, r, at, level)
    s.sinceGate++
    if (free !== null) coinLine(items, r, at - 6, free, 4)
    else if (r() < 0.6) coinLine(items, r, at + 7, Math.floor(r() * 3) - 1, 4)
    if (r() < 0.07) items.push({ kind: r() < 0.5 ? 'magnet' : 'shield', lane: Math.floor(r() * 3) - 1, at: at + 11 })
    let extra = 0
    if (free !== null && r() < 0.3) {
      // a spring on the open lane: a high flight along a bow of coins, with room to land before the next row
      items.push({ kind: 'pad', lane: free, at: at + 9 })
      for (let i = 0; i < 8; i++) items.push({ kind: 'coin', lane: free, at: at + 12 + i * 2.4, lift: 4.2 * Math.sin(Math.PI * (i + 0.5) / 8) })
      extra = topSpeed * 0.9
    }
    at += gapBase + r() * 8 + extra
  }
  items.forEach((it, i) => { it.id = `${id}-${i}` })
  const h0 = prev ? prev.h1 : 0
  const h1 = id === 0 ? 3 : Math.max(0, Math.min(15, h0 + (r() - 0.5) * 16))
  return { id, ox, oz, dir, len, turn, items, start: total, world: Math.floor(total / WORLD_METRES) % WORLDS.length, seed: Math.floor(r() * 1e9), h0, h1, bump: (r() - 0.5) * 7, came: prev ? prev.turn : 0 }
}

function pickMissions(r) {
  return [...MISSIONS].sort(() => r() - 0.5).slice(0, 3).map(({ key, text, goals }) => {
    const goal = goals[Math.floor(r() * goals.length)]
    return { key, goal, text: text(goal), done: false }
  })
}

export function newGame({ seed = 1, mode = 'run' } = {}) {
  const s = {
    chain: 0, mult: 1, close: 0, dodges: 0, jumps: 0, pads: 0, sinceAct: 9, buffer: 0, slow: 0,
    missions: pickMissions(rng(seed + 1)), lastMission: null,
    random: rng(seed), mode, nextSegment: 0, bend: 0, sinceGate: 0, segs: [], cur: 0,
    d: 0, lane: 0, laneX: 0, y: 0, vy: 0, slide: 0, speed: START_SPEED, time: 0, run: 0,
    coins: 0, right: 0, wrong: 0, bonus: 0, shield: false, magnet: 0, stumble: 0, safe: 0,
    wantTurn: 0, gate: null, over: false, cause: null, events: [],
  }
  fill(s)
  return s
}

function fill(s) {
  while (s.segs.length - s.cur < 4) s.segs.push(makeSegment(s, s.segs[s.segs.length - 1]))
  while (s.cur > 1) { s.segs.shift(); s.cur-- }
}

export const segment = s => s.segs[s.cur]
export const score = s => Math.floor(s.run) + s.coins * 5 + s.bonus
export const distanceToCorner = s => segment(s).len - s.d

export function worldPosition(s) {
  const seg = segment(s), [fx, fz] = DIRS[seg.dir], [rx, rz] = DIRS[(seg.dir + 1) % 4]
  return { x: seg.ox + fx * s.d + rx * s.laneX, y: groundAt(seg, s.d) + s.y, z: seg.oz + fz * s.d + rz * s.laneX, dir: seg.dir }
}

export function act(s, cmd) {
  if (s.over) return
  if (cmd === 'left' || cmd === 'right') {
    const side = cmd === 'left' ? -1 : 1
    if (distanceToCorner(s) <= TURN_WINDOW && side === segment(s).turn) { s.wantTurn = side; s.events.push('turn'); return }
    const lane = Math.max(-1, Math.min(1, s.lane + side))
    if (lane !== s.lane) { s.lane = lane; s.sinceAct = 0; s.events.push('move') }
  } else if (cmd === 'jump') {
    if (s.y <= 0.01) jump(s)
    else s.buffer = JUMP_BUFFER
  } else if (cmd === 'slide') {
    if (s.y > 0.01) s.vy = -JUMP_V * 1.4
    s.slide = SLIDE_SECONDS
    s.sinceAct = 0
    s.events.push('slide')
  }
}

function jump(s) {
  s.vy = JUMP_V
  s.slide = 0
  s.sinceAct = 0
  s.jumps++
  s.events.push('jump')
}

function hit(s, cause) {
  if (s.safe > 0) return
  s.safe = INVULNERABLE_SECONDS
  if (s.shield) { s.shield = false; s.events.push('shield'); return }
  if (s.stumble > 0) { s.over = true; s.cause = cause; s.events.push('over'); return }
  s.stumble = STUMBLE_SECONDS
  s.speed = Math.max(START_SPEED, s.speed * 0.85)
  s.chain = 0
  s.mult = 1
  s.slow = 0.35
  s.events.push('hit')
}

function addChain(s, n) {
  s.chain += n
  const mult = Math.min(MAX_MULT, 1 + Math.floor(s.chain / CHAIN_PER_MULT))
  if (mult > s.mult) s.events.push('combo')
  s.mult = mult
}

// A whole row behind the runner, without a scratch.
function passed(s) {
  const close = s.sinceAct < CLOSE_SECONDS
  s.dodges++
  addChain(s, close ? 4 : 2)
  s.bonus += (close ? 25 : 10) * s.mult
  if (close) { s.close++; s.events.push('close') }
  if (s.stumble > 0) {
    s.stumble -= ESCAPE_SECONDS
    if (s.stumble <= 0) { s.stumble = 0; s.events.push('escape') }
  }
}

function checkMissions(s) {
  for (const m of s.missions) {
    if (m.done || s[m.key] < m.goal) continue
    m.done = true
    s.bonus += MISSION_BONUS
    s.lastMission = m.text
    s.events.push('mission')
  }
}

const inLane = (s, lane) => lane === null || Math.abs(s.laneX - lane * LANE_W) < LANE_W * 0.55

const hurts = (s, it) => it.kind === 'wall' ? inLane(s, it.lane)
  : it.kind === 'low' ? inLane(s, it.lane) && s.y < CLEAR_HEIGHT
    : it.kind === 'pit' ? s.y < 0.3
      : it.kind === 'high' ? s.slide <= 0
        : false

function meet(s, it) {
  if (it.kind === 'pad') { if (inLane(s, it.lane) && s.y < 0.5) { s.vy = PAD_V; s.slide = 0; s.pads++; s.events.push('pad') } }
  else if (it.kind === 'gate') {
    const lane = Math.round(s.laneX / LANE_W)
    s.gate = null
    if (lane === it.right) { s.right++; s.bonus += 250; s.events.push('right') } else { s.wrong++; s.events.push('wrong') }
  }
}

function collect(s, seg, from, to) {
  for (const it of seg.items) {
    if (it.taken) continue
    if (it.kind === 'coin') {
      const near = it.at >= from - 0.4 && it.at <= to + 0.4
      const pulled = s.magnet > 0 && it.at >= from - 1 && it.at <= from + MAGNET_REACH
      if ((near && inLane(s, it.lane)) || pulled) {
        it.taken = true
        s.coins++
        s.bonus += 5 * (s.mult - 1)
        addChain(s, 1)
        s.events.push('coin')
      }
    } else if ((it.kind === 'magnet' || it.kind === 'shield') && it.at >= from - 0.4 && it.at <= to + 0.4 && inLane(s, it.lane)) {
      it.taken = true
      if (it.kind === 'magnet') s.magnet = MAGNET_SECONDS; else s.shield = true
      s.events.push('power')
    }
  }
}

export function step(s, dt) {
  if (s.over) return
  s.time += dt
  s.speed = Math.min(MAX_SPEED, s.speed + ACCEL * dt)
  s.slide = Math.max(0, s.slide - dt)
  s.stumble = Math.max(0, s.stumble - dt)
  s.safe = Math.max(0, s.safe - dt)
  s.magnet = Math.max(0, s.magnet - dt)
  s.buffer = Math.max(0, s.buffer - dt)
  s.slow = Math.max(0, s.slow - dt)
  s.sinceAct += dt
  if (s.y > 0 || s.vy > 0) {
    s.vy -= GRAVITY * dt
    s.y += s.vy * dt
    if (s.y <= 0) {
      s.y = 0
      s.vy = 0
      s.events.push('land')
      if (s.buffer > 0) { s.buffer = 0; jump(s) }
    }
  }
  s.laneX += (s.lane * LANE_W - s.laneX) * Math.min(1, dt * 15)

  const seg = segment(s), from = s.d, move = s.speed * dt
  s.d += move
  s.run += move
  let row = false, hurt = false
  for (const it of seg.items) {
    if (it.kind === 'coin' || it.kind === 'magnet' || it.kind === 'shield' || it.met) continue
    if (it.at <= from || it.at > s.d) continue
    it.met = true
    if (it.kind === 'pad' || it.kind === 'gate') { meet(s, it); continue }
    row = true
    if (hurts(s, it)) { hurt = true; hit(s, it.kind); if (s.over) return }
  }
  if (row && !hurt) passed(s)
  collect(s, seg, from, s.d)
  checkMissions(s)
  s.gate = seg.items.find(it => it.kind === 'gate' && !it.met && it.at > s.d && it.at - s.d < 60) || null

  if (s.d >= seg.len && s.wantTurn === seg.turn) {
    // the offset across the old path becomes distance along the new one, so the runner does not jump
    s.d = (s.laneX * seg.turn) + (s.d - seg.len)
    s.lane = 0
    s.laneX = 0
    s.wantTurn = 0
    s.cur++
    fill(s)
  } else if (s.d >= seg.len + CRASH_AFTER) {
    if (s.shield) { s.shield = false; s.wantTurn = seg.turn; s.events.push('shield') }
    else { s.over = true; s.cause = 'corner'; s.events.push('over') }
  }
}
