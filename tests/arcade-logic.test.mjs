// Online games (/online-games): rules of every game, checked on the pure logic modules.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rng } from '../src/arcade/logic/rng.js'
import * as merge from '../src/arcade/logic/merge.js'
import * as kl from '../src/arcade/logic/klondike.js'
import * as sp from '../src/arcade/logic/spider.js'
import * as ms from '../src/arcade/logic/mines.js'
import * as sd from '../src/arcade/logic/sudoku.js'
import * as sn from '../src/arcade/logic/snake.js'
import { build as buildMemory, pairsFor } from '../src/arcade/logic/memory.js'

const row = (values, y = 0) => values.map((v, x) => (v ? { id: 1000 + y * 10 + x, value: v, x, y } : null)).filter(Boolean)
const line = (tiles, y = 0) => Array.from({ length: 4 }, (_, x) => tiles.find(t => t.x === x && t.y === y)?.value || 0)

test('2048: slides, merges once per tile, keeps ids of tiles that only slide', () => {
  let r = merge.move(row([2, 2, 4, 0]), 'left')
  assert.deepEqual(line(r.tiles), [4, 4, 0, 0])
  assert.equal(r.gained, 4)
  assert.equal(r.ghosts.length, 2, 'both merged tiles slide in as ghosts')
  assert.ok(r.tiles.some(t => t.id === 1002 && t.x === 1), 'the 4 kept its id and slid')
  r = merge.move(row([2, 2, 2, 2]), 'left')
  assert.deepEqual(line(r.tiles), [4, 4, 0, 0])
  r = merge.move(row([4, 4, 8, 0]), 'left')
  assert.deepEqual(line(r.tiles), [8, 8, 0, 0], 'a new 8 does not merge again in the same move')
  r = merge.move(row([0, 2, 2, 2]), 'right')
  assert.deepEqual(line(r.tiles), [0, 0, 2, 4], 'right merges from the right edge')
  assert.equal(merge.move(row([2, 4, 8, 16]), 'left').moved, false)
  assert.equal(merge.move(row([2, 4, 8, 16]), 'right').moved, false)
  // up/down use columns
  const col = [{ id: 1, value: 2, x: 0, y: 1 }, { id: 2, value: 2, x: 0, y: 3 }]
  r = merge.move(col, 'up')
  assert.deepEqual(r.tiles.map(t => [t.value, t.x, t.y]), [[4, 0, 0]])
  // full board, no pairs → game over
  const full = []
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) full.push({ id: y * 4 + x, value: 2 ** (((x + y) % 2) + 1 + (y % 2 ? 2 : 0)), x, y })
  assert.equal(merge.canPlay(full), false)
  assert.equal(merge.spawn(full).length, 16)
})

test('2048: a long random game keeps the board consistent', () => {
  const r = rng(7)
  let tiles = merge.fresh(r), score = 0
  const dirs = ['left', 'up', 'right', 'down']
  for (let i = 0; i < 400 && merge.canPlay(tiles); i++) {
    const m = merge.move(tiles, dirs[Math.floor(r() * 4)])
    if (!m.moved) continue
    score += m.gained
    tiles = merge.spawn(m.tiles, r)
    const cells = new Set(tiles.map(t => `${t.x},${t.y}`))
    assert.equal(cells.size, tiles.length, 'no two tiles share a cell')
    assert.ok(tiles.every(t => t.x >= 0 && t.x < 4 && t.y >= 0 && t.y < 4))
  }
  assert.ok(score > 0)
})

test('solitaire (klondike): deal, rules, and card count never changes', () => {
  const r = rng(3)
  let s = kl.deal(r)
  assert.deepEqual(s.tab.map(p => p.length), [1, 2, 3, 4, 5, 6, 7])
  assert.ok(s.tab.every(p => p.at(-1).up && p.slice(0, -1).every(c => !c.up)))
  assert.equal(s.stock.length, 24)
  const count = st => st.stock.length + st.waste.length + st.found.flat().length + st.tab.flat().length
  // play greedily with the same "tap" logic the game uses
  for (let i = 0; i < 800; i++) {
    const h = kl.findHint(s)
    if (!h) break
    s = h.draw ? kl.draw(s) : kl.apply(s, h.src, h.dst)
    assert.equal(count(s), 52)
    for (const p of s.tab) if (p.length) assert.ok(p.at(-1).up, 'top card of every pile is face up')
  }
  assert.equal(kl.canTab({ suit: 0, rank: 13 }, []), true)
  assert.equal(kl.canTab({ suit: 0, rank: 12 }, []), false)
  assert.equal(kl.canTab({ suit: 1, rank: 6 }, [{ suit: 0, rank: 7, up: true }]), true)
  assert.equal(kl.canTab({ suit: 3, rank: 6 }, [{ suit: 0, rank: 7, up: true }]), false, 'same color not allowed')
  assert.equal(kl.canFound({ suit: 2, rank: 1 }, []), true)
  assert.equal(kl.canFound({ suit: 2, rank: 2 }, [{ suit: 2, rank: 1 }]), true)
})

test('solitaire: auto-finish completes a won position', () => {
  // all 52 cards face up, each suit in one pile in descending order → auto steps finish it
  let s = { stock: [], waste: [], found: [[], [], [], []], tab: [0, 1, 2, 3].map(suit => Array.from({ length: 13 }, (_, i) => ({ id: suit * 13 + i, suit, rank: 13 - i, up: true }))).concat([[], [], []]), moves: 0 }
  assert.ok(kl.canAutoFinish(s))
  for (let i = 0; i < 60 && !kl.isWon(s); i++) s = kl.autoStep(s)
  assert.ok(kl.isWon(s))
})

test('spider: deal 54 + 50, runs move only by one suit, K→A run is collected', () => {
  let s = sp.deal(2, rng(5))
  assert.equal(s.tab.flat().length, 54)
  assert.equal(s.stock.length, 50)
  const pile = [{ suit: 0, rank: 9, up: true }, { suit: 1, rank: 8, up: true }, { suit: 1, rank: 7, up: true }]
  assert.equal(sp.runStart(pile), 1)
  const run = Array.from({ length: 12 }, (_, i) => ({ id: 900 + i, suit: 0, rank: 13 - i, up: true })) // K..2
  s = { tab: [[{ id: 1, suit: 1, rank: 5, up: false }, ...run], [{ id: 2, suit: 0, rank: 1, up: true }], ...Array.from({ length: 8 }, (_, i) => [{ id: 10 + i, suit: 1, rank: 3, up: true }])], stock: [], done: 0, doneSuits: [], moves: 0 }
  s = sp.apply(s, 1, 0, 0)
  assert.equal(s.done, 1, 'finished run leaves the table')
  assert.equal(s.tab[0].length, 1)
  assert.ok(s.tab[0][0].up, 'the card under it turns face up')
  // can't deal with an empty column
  assert.equal(sp.canDeal({ ...s, stock: Array(10).fill({ suit: 0, rank: 1 }) }), false)
})

test('minesweeper: first tap is safe and opens an area; flags and win', () => {
  for (let seed = 1; seed < 30; seed++) {
    const l = ms.LEVELS[2]
    let b = ms.place(ms.empty(l.w, l.h), l.mines, 40, rng(seed))
    assert.equal(b.cells.filter(c => c.mine).length, l.mines)
    assert.equal(b.cells[40].mine, false)
    assert.equal(b.cells[40].n, 0, 'first tap cell has no mines around it')
    b = ms.open(b, 40)
    assert.ok(b.cells.filter(c => c.open).length >= 9)
    // open every safe cell → won
    b.cells.forEach((c, i) => { if (!c.mine) b = ms.open(b, i) })
    assert.ok(ms.isWon(b))
  }
  let b = ms.place(ms.empty(8, 8), 8, 0, rng(1))
  const mine = b.cells.findIndex(c => c.mine)
  b = ms.toggleFlag(b, mine)
  assert.equal(ms.open(b, mine).lost, false, 'a flagged cell does not open')
  assert.equal(ms.open(ms.toggleFlag(b, mine), mine).lost, true)
})

test('sudoku: every generated puzzle has exactly one solution', () => {
  for (const level of sd.LEVELS) {
    for (let seed = 1; seed <= 3; seed++) {
      const { puzzle, solution } = sd.generate(level, rng(seed * 31 + level.n))
      const res = sd.solve(puzzle, level.n, level.br, level.bc, 2)
      assert.equal(res.count, 1, `${level.id} unique`)
      assert.deepEqual(res.solution, solution)
      assert.equal(puzzle.filter(Boolean).length, level.keep)
      assert.equal(sd.conflicts(solution, level.n, level.br, level.bc).size, 0)
    }
  }
})

test('memory: pairs grow with the level and every card has a twin', () => {
  assert.equal(pairsFor(1), 6)
  assert.equal(pairsFor(20), 15)
  const cards = buildMemory(4, rng(2))
  assert.equal(cards.length, pairsFor(4) * 2)
  const counts = {}
  for (const c of cards) counts[c.face] = (counts[c.face] || 0) + 1
  assert.ok(Object.values(counts).every(n => n === 2))
})

test('snake: eats and grows, wraps through soft walls, dies on hard walls and on itself', () => {
  let s = sn.start(10, 10, rng(1))
  s = { ...s, apple: [s.body[0][0] + 1, s.body[0][1]] }
  const len = s.body.length
  s = sn.step(s, false, rng(1))
  assert.equal(s.body.length, len + 1)
  assert.equal(s.score, 1)
  assert.notDeepEqual(s.apple, s.body[0])
  // wrap
  let w = { w: 5, h: 5, body: [[4, 2], [3, 2], [2, 2]], dir: 'right', queue: [], score: 0, dead: false, apple: [0, 0] }
  assert.deepEqual(sn.step(w, false).body[0], [0, 2])
  assert.equal(sn.step(w, true).dead, true)
  // no U-turn into itself
  assert.equal(sn.turn(w, 'left').queue.length, 0)
  // bite itself
  w = { w: 6, h: 6, body: [[2, 2], [3, 2], [3, 3], [2, 3], [1, 3]], dir: 'left', queue: ['down'], score: 0, dead: false, apple: [5, 5] }
  assert.equal(sn.step(w, false).dead, true)
})

test('battleship: fleets never touch, a hit keeps the turn, sinking reveals the water around', async () => {
  const bs = await import('../src/arcade/logic/battleship.js')
  for (let seed = 1; seed < 40; seed++) {
    const ships = bs.randomFleet(rng(seed))
    assert.equal(ships.length, 5)
    const owner = new Map()
    ships.forEach((s, k) => s.cells.forEach(c => owner.set(c, k)))
    assert.equal(owner.size, 5 + 4 + 3 + 3 + 2, 'no overlap')
    for (const [c, k] of owner) {
      const x = c % 10, y = Math.floor(c / 10)
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy
        if (nx < 0 || ny < 0 || nx > 9 || ny > 9) continue
        const o = owner.get(ny * 10 + nx)
        assert.ok(o === undefined || o === k, 'ships do not touch, not even diagonally')
      }
    }
  }
  assert.deepEqual(bs.randomFleet(rng(5)), bs.randomFleet(rng(5)), 'same seed → same fleet (daily challenge)')
  let sea = bs.newSea(bs.randomFleet(rng(2)))
  const boat = sea.ships[4] // length 2
  let r = bs.fire(sea, boat.cells[0])
  assert.equal(r.result, 'hit')
  r = bs.fire(r.sea, boat.cells[1])
  assert.equal(r.result, 'sunk')
  assert.ok(Object.values(r.sea.shots).filter(v => v === 'miss').length >= 4, 'water around a sunk ship is revealed')
  assert.equal(bs.fire(r.sea, boat.cells[0]).result, null, 'same cell twice does nothing')
  // the smart computer always finishes the game
  for (const smart of [true, false]) {
    sea = bs.newSea(bs.randomFleet(rng(9)))
    const ai = rng(10)
    let shots = 0
    while (!bs.allSunk(sea) && shots < 100) { sea = bs.fire(sea, bs.aiShot(sea, smart, ai)).sea; shots++ }
    assert.ok(bs.allSunk(sea), `${smart ? 'smart' : 'easy'} AI sinks everything within 100 shots (took ${shots})`)
  }
})

test('daily challenge: one game per Israeli day, same seed for everyone, streak counting', async () => {
  const daily = await import('../src/arcade/daily.js')
  const { ARCADE } = await import('../src/arcade/registry.js')
  const ARCADE_SLUGS = ARCADE.map(g => g.slug)
  const base = Date.UTC(2026, 9, 3, 10) // 3 Oct 2026, 13:00 in Israel
  const a = daily.dailyFor(base), b = daily.dailyFor(base + 3600e3)
  assert.equal(a.day, b.day)
  assert.equal(a.seed, b.seed)
  // 22:30 UTC on Oct 3 is already Oct 4 in Israel
  assert.equal(daily.dailyFor(Date.UTC(2026, 9, 3, 22, 30)).day, a.day + 1)
  const seen = new Set()
  for (let d = 0; d < ARCADE.length; d++) seen.add(daily.dailyFor(base + d * 86400e3).slug)
  assert.equal(seen.size, ARCADE.length, 'every online game gets its own day, all different, before the cycle repeats')
  for (const s of seen) assert.ok(ARCADE_SLUGS.includes(s))
  const ms = daily.msToNext(base)
  assert.ok(ms > 0 && ms <= 24 * 3600e3)
  assert.equal(daily.dailyFor(base + ms + 1000).day, a.day + 1, 'the challenge changes right at Israeli midnight')
  assert.equal(daily.streak({ 10: {}, 11: {}, 12: {} }, 12), 3)
  assert.equal(daily.streak({ 10: {}, 11: {} }, 12), 2, 'not played yet today → streak still counts until tonight')
  assert.equal(daily.streak({ 9: {}, 11: {} }, 12), 1)
  assert.match(daily.dailyShareText(a, { text: 'x', streak: 3 }), /ugabuga\.co\.il\/online-games\/today\?utm_source=whatsapp/)
})

test('solitaire daily deal is always winnable and the same for everyone', () => {
  for (let day = 20000; day < 20012; day++) {
    const a = kl.winnableDeal(day * 7919 + 101), b = kl.winnableDeal(day * 7919 + 101)
    assert.deepEqual(a, b)
    assert.ok(kl.greedyWins(a))
  }
})

test('snake: a golden apple is worth 3', () => {
  const s = { w: 6, h: 6, body: [[2, 2], [1, 2], [0, 2]], dir: 'right', queue: [], score: 5, dead: false, apple: [3, 2, true] }
  const n = sn.step(s, false, rng(1))
  assert.equal(n.ate, 'gold')
  assert.equal(n.score, 8)
  assert.equal(n.body.length, 4)
})

test('snake journey: every level is fully reachable and starts with room ahead', () => {
  for (const wide of [false, true]) for (let L = 1; L <= sn.LEVEL_COUNT; L++) {
    const spec = sn.levelSpec(L, wide)
    const s = sn.start(spec.w, spec.h, rng(L), spec)
    const rocks = new Set(spec.rocks.map(([x, y]) => `${x},${y}`))
    assert.ok(s.body.every(([x, y]) => !rocks.has(`${x},${y}`)), `level ${L}: snake not on a rock`)
    const [hx, hy] = s.body[0]
    assert.ok([1, 2, 3].every(k => !rocks.has(`${(hx + k) % spec.w},${hy}`)), `level ${L}: room ahead`)
    const seen = new Set([`${hx},${hy}`]), q = [[hx, hy]]
    while (q.length) {
      const [x, y] = q.pop()
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = (x + dx + spec.w) % spec.w, ny = (y + dy + spec.h) % spec.h, k = `${nx},${ny}`
        if (!rocks.has(k) && !seen.has(k)) { seen.add(k); q.push([nx, ny]) }
      }
    }
    assert.equal(seen.size, spec.w * spec.h - rocks.size, `level ${L}${wide ? ' (wide)' : ''}: no closed-off pockets`)
    assert.ok(!rocks.has(`${s.apple[0]},${s.apple[1]}`))
  }
})

test('snake: rocks, ghost power, shrink, combos, and finishing a level', () => {
  let s = { ...sn.start(10, 10, rng(1), { rocks: [[9, 5]], goal: 2 }) }
  s = { ...s, body: [[8, 5], [7, 5], [6, 5]], dir: 'right', queue: [], apple: [0, 0, false] }
  assert.equal(sn.step(s, false).dead, true, 'rock kills')
  assert.equal(sn.step({ ...s, fx: { slow: 0, ghost: 5 } }, false).dead, false, 'ghost passes through')
  // shrink power
  const long = { ...s, rocks: [], body: Array.from({ length: 8 }, (_, i) => [8 - i, 5]), power: { x: 9, y: 5, type: 'shrink', ttl: 10 } }
  const shr = sn.step(long, false)
  assert.equal(shr.got, 'shrink')
  assert.equal(shr.body.length, 5)
  // combo: three quick apples → double points, and the goal finishes the level
  let c = { ...sn.start(12, 3, rng(2), { goal: 3 }), body: [[3, 1], [2, 1], [1, 1]], dir: 'right', queue: [] }
  for (let k = 0; k < 3; k++) { c = { ...c, apple: [c.body[0][0] + 1, 1, false], power: null }; c = sn.step(c, false, rng(k)) }
  assert.equal(c.combo, 3)
  assert.equal(c.score, 1 + 1 + 2)
  assert.equal(c.won, true)
  assert.ok(sn.speedFor(0, { fx: { slow: 10 } }) > sn.speedFor(0, null), '🐢 slows down')
})
