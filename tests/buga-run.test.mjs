// "בוגה בורח": the course is always passable, corners and hits follow the rules, the world stays continuous.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { act, groundAt, newGame, segment, step, score, worldPosition, timesQuestion, rng, TURN_WINDOW, LANE_W, distanceToCorner } from '../src/pages/games/run/runGame.js'

const DT = 1 / 60

// A careful player: looks at the next row and answers it.
function think(s) {
  const seg = segment(s)
  if (distanceToCorner(s) <= TURN_WINDOW - 2 && s.wantTurn !== seg.turn) act(s, seg.turn < 0 ? 'left' : 'right')
  const lookAhead = s.speed * 0.45
  const row = seg.items.filter(it => !it.met && ['wall', 'low', 'high', 'pit'].includes(it.kind) && it.at > s.d && it.at - s.d < lookAhead)
  if (!row.length) return
  const walls = row.filter(it => it.kind === 'wall').map(it => it.lane)
  if (walls.length) {
    const free = [-1, 0, 1].find(l => !walls.includes(l))
    if (free !== s.lane) act(s, free < s.lane ? 'left' : 'right')
    return
  }
  if (row.some(it => it.kind === 'high')) { if (s.slide <= 0.1 && row[0].at - s.d < s.speed * 0.3) act(s, 'slide'); return }
  if (row[0].at - s.d < s.speed * 0.32) act(s, 'jump')
}

function play(seed, metres, mode) {
  const s = newGame({ seed, mode })
  let hits = 0
  while (!s.over && s.run < metres) {
    think(s)
    step(s, DT)
    if (s.events.includes('hit')) hits++
    s.events.length = 0
  }
  return { s, hits }
}

test('a careful player finishes 3 km on every course, with no hit and no crash', () => {
  for (let seed = 1; seed <= 25; seed++) {
    const { s, hits } = play(seed, 3000, 'run')
    assert.equal(s.over, false, `seed ${seed} ended by ${s.cause} at ${Math.round(s.run)}m`)
    assert.equal(hits, 0, `seed ${seed}`)
    assert.ok(s.coins > 0)
  }
})

test('every row leaves a way through and nothing stands in the turning zone', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const s = newGame({ seed })
    for (let k = 0; k < 12; k++) {
      const seg = segment(s)
      assert.notEqual(seg.dir, 2, 'the path never heads back towards itself')
      const rows = new Map()
      for (const it of seg.items) if (it.kind === 'wall') rows.set(it.at, (rows.get(it.at) || 0) + 1)
      for (const n of rows.values()) assert.ok(n <= 2, 'a wall row keeps one lane open')
      for (const it of seg.items) if (it.kind !== 'coin') assert.ok(it.at < seg.len - TURN_WINDOW, `${it.kind} too close to the corner`)
      seg.items = []
      s.d = seg.len
      s.wantTurn = seg.turn
      step(s, 0)
      assert.notEqual(segment(s), seg)
    }
  }
})

test('swipes change lanes, and at a corner a swipe towards it turns instead', () => {
  const s = newGame({ seed: 3 })
  act(s, 'left')
  assert.equal(s.lane, -1)
  act(s, 'left')
  assert.equal(s.lane, -1, 'no lane past the edge')
  const seg = segment(s)
  seg.items = []
  s.d = seg.len - 5
  const side = seg.turn < 0 ? 'left' : 'right'
  s.lane = 0
  act(s, side)
  assert.equal(s.wantTurn, seg.turn)
  assert.equal(s.lane, 0, 'turning is not a lane change')
  const dir = seg.dir
  while (segment(s) === seg) step(s, DT)
  assert.equal(segment(s).dir, (dir + seg.turn + 4) % 4)
})

test('missing a corner ends the run, and a shield saves it once', () => {
  const s = newGame({ seed: 4 })
  const seg = segment(s)
  seg.items = []
  s.d = seg.len - 1
  while (!s.over) step(s, DT)
  assert.equal(s.cause, 'corner')

  const t = newGame({ seed: 4 })
  const seg2 = segment(t)
  seg2.items = []
  t.d = seg2.len - 1
  t.shield = true
  for (let i = 0; i < 40; i++) step(t, DT)
  assert.equal(t.over, false)
  assert.equal(t.shield, false)
  assert.notEqual(segment(t), seg2)
})

test('turning a corner never moves the runner sideways', () => {
  for (const laneOffset of [-1, 0, 1]) {
    const s = newGame({ seed: 8 })
    const seg = segment(s)
    seg.items = []
    s.d = seg.len - 8
    s.lane = laneOffset
    s.laneX = laneOffset * LANE_W
    s.wantTurn = seg.turn
    let last = worldPosition(s)
    while (segment(s) === seg) {
      step(s, DT)
      const now = worldPosition(s)
      assert.ok(Math.hypot(now.x - last.x, now.z - last.z) < 1, `jumped at lane ${laneOffset}`)
      last = now
    }
  }
})

test('the first hit makes the runner stumble, a second one soon after ends the run', () => {
  const s = newGame({ seed: 5 })
  const seg = segment(s)
  seg.items = [{ id: 'a', kind: 'wall', lane: 0, at: s.d + 1 }, { id: 'b', kind: 'wall', lane: 0, at: s.d + 40 }]
  while (s.stumble === 0) step(s, DT)
  assert.equal(s.over, false)
  while (!s.over) step(s, DT)
  assert.equal(s.cause, 'wall')
})

test('jump clears low obstacles and pits, slide passes under, not the other way round', () => {
  for (const [kind, cmd, ok] of [['low', 'jump', true], ['pit', 'jump', true], ['high', 'slide', true], ['high', 'jump', false], ['low', 'slide', false]]) {
    const s = newGame({ seed: 6 })
    const seg = segment(s)
    seg.items = [{ id: 'a', kind, lane: kind === 'low' ? 0 : null, at: s.d + s.speed * 0.3 }]
    act(s, cmd)
    for (let i = 0; i < 40; i++) step(s, DT)
    assert.equal(s.stumble === 0, ok, `${kind} + ${cmd}`)
  }
})

test('the path climbs and falls, and stays level at every corner', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const s = newGame({ seed })
    let climbs = 0
    for (let k = 0; k < 10; k++) {
      const seg = segment(s)
      assert.equal(groundAt(seg, -3), seg.h0)
      assert.equal(groundAt(seg, seg.len), seg.h1)
      assert.equal(groundAt(seg, seg.len + 3), seg.h1)
      for (let d = 0; d < seg.len; d += 2) {
        assert.ok(Math.abs(groundAt(seg, d + 2) - groundAt(seg, d)) < 1.6, 'no cliff in the road')
        climbs = Math.max(climbs, Math.abs(groundAt(seg, d) - seg.h0))
      }
      seg.items = []
      s.d = seg.len
      s.wantTurn = seg.turn
      step(s, 0)
      assert.equal(segment(s).h0, seg.h1, 'the next stretch starts at the same height')
      assert.equal(segment(s).came, seg.turn, 'the next stretch knows which side the road came from')
    }
    assert.ok(climbs > 2)
  }
})

test('a spring launches the runner, and only on its own lane', () => {
  for (const lane of [0, 1]) {
    const s = newGame({ seed: 7 })
    const seg = segment(s)
    seg.items = [{ id: 'p', kind: 'pad', lane: 0, at: s.d + 1 }]
    s.lane = lane
    s.laneX = lane * LANE_W
    for (let i = 0; i < 30; i++) step(s, DT)
    assert.equal(s.y > 2, lane === 0)
  }
})

test('clean rows and coins climb the multiplier, and a hit drops it', () => {
  const s = newGame({ seed: 13 })
  const seg = segment(s)
  seg.items = []
  for (let i = 0; i < 4; i++) seg.items.push({ id: `w${i}`, kind: 'wall', lane: 1, at: s.d + 3 + i * 8 })
  for (let i = 0; i < 60; i++) seg.items.push({ id: `c${i}`, kind: 'coin', lane: 0, at: s.d + 2 + i * 0.7 })
  seg.items.push({ id: 'x', kind: 'wall', lane: 0, at: s.d + 48 })
  while (s.stumble === 0) { step(s, DT); s.peak = Math.max(s.peak || 0, s.mult) }
  assert.ok(s.peak >= 4)
  assert.equal(s.dodges, 4, 'the row that hit is not a dodge')
  assert.equal(s.mult, 1)
  assert.equal(s.close, 0, 'standing still is not a near miss')
})

test('an action just before a row is a near miss, and a row counts once', () => {
  const s = newGame({ seed: 14 })
  const seg = segment(s)
  seg.items = [{ id: 'a', kind: 'wall', lane: 0, at: s.d + 2.5 }, { id: 'b', kind: 'wall', lane: -1, at: s.d + 2.5 }]
  while (s.d < seg.items[0].at - 1.6) step(s, DT)
  act(s, 'right')
  for (let i = 0; i < 30; i++) step(s, DT)
  assert.equal(s.stumble, 0)
  assert.equal(s.dodges, 1)
  assert.equal(s.close, 1)
})

test('passing rows shakes the cookie off early', () => {
  const s = newGame({ seed: 15 })
  const seg = segment(s)
  seg.items = [0, 1, 2].map(i => ({ id: `w${i}`, kind: 'wall', lane: 1, at: s.d + 3 + i * 6 }))
  s.stumble = 8
  let escaped = false
  for (let i = 0; i < 90; i++) { step(s, DT); escaped ||= s.events.includes('escape') }
  assert.equal(escaped, true)
  assert.equal(s.stumble, 0)
})

test('a jump pressed just before landing happens on landing', () => {
  const s = newGame({ seed: 16 })
  segment(s).items = []
  act(s, 'jump')
  while (s.vy > -9) step(s, DT)
  assert.equal(s.jumps, 1)
  act(s, 'jump')
  for (let i = 0; i < 12; i++) step(s, DT)
  assert.equal(s.jumps, 2)
})

test('each run has three different missions, and finishing one pays once', () => {
  for (let seed = 1; seed <= 30; seed++) assert.equal(new Set(newGame({ seed }).missions.map(m => m.key)).size, 3)
  const s = newGame({ seed: 17 })
  const m = s.missions[0]
  s[m.key] = m.goal
  segment(s).items = []
  const before = s.bonus
  step(s, DT)
  assert.equal(m.done, true)
  assert.ok(s.events.includes('mission'))
  assert.equal(s.lastMission, m.text)
  const paid = s.bonus
  assert.ok(paid >= before + 150)
  step(s, DT)
  assert.equal(s.bonus, paid)
})

test('the times-table mode: three different answers, one right, and a right gate pays', () => {
  const r = rng(9)
  for (let i = 0; i < 300; i++) {
    const q = timesQuestion(r)
    const [a, b] = q.text.split(' × ').map(Number)
    const values = [q.answers[-1], q.answers[0], q.answers[1]]
    assert.equal(new Set(values).size, 3, q.text)
    assert.ok(values.every(v => v > 0))
    assert.equal(q.answers[q.right], a * b)
  }
  const { s } = play(11, 1500, 'times')
  assert.ok(s.right + s.wrong > 3, 'gates appear')
  const fresh = newGame({ seed: 12 })
  const before = score(fresh)
  fresh.bonus += 250
  assert.equal(score(fresh), before + 250)
})

test('the page is free of tracking and keeps no child details', () => {
  const page = readFileSync(new URL('../src/pages/games/BugaRun.jsx', import.meta.url), 'utf8')
  assert.doesNotMatch(page, /supabase|fetch\(/)
  assert.match(page, /buga-run-best/)
})
