import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SETS, SHEET_SIZE, exercisesFor, stationFor, GROUP_NAMES, ROUNDS, UNIT_ITEMS, RULER_CM, SETUP_STEPS } from '../src/data/mathCenters.js'

const shekel = n => `${n} ₪`
const t = (h, m) => `${h}:${m === 0 ? '00' : '30'}`
const hours = n => (n === 1 ? 'שעה' : n === 2 ? 'שעתיים' : `${n} שעות`)
const nextHour = h => (h === 12 ? 1 : h + 1)
const asM = cm => (cm % 100 === 0 ? `${cm / 100} מ׳` : `${Math.floor(cm / 100)} מ׳ ו־${cm % 100} ס״מ`)

// independent recomputation of every exercise kind
const recompute = {
  add: ({ a, b }) => String(a + b),
  sub: ({ a, b }) => String(a - b),
  complement: ({ a }) => String(100 - a),
  wordAdd: ({ a, b }) => String(a + b),
  wordSub: ({ a, b }) => String(a - b),
  mul: ({ a, n }) => String(a * n),
  repeated: ({ groups, size }) => String(Array(groups).fill(size).reduce((s, x) => s + x, 0)),
  missing: ({ x }) => String(x),
  coins: ({ parts }) => shekel(parts.reduce((s, [v, c]) => s + v * c, 0)),
  agorot: ({ tens, fifties }) => `${tens * 10 + fifties * 50} אג׳`,
  shop: ({ a, b }) => shekel(a + b),
  change: ({ paid, price }) => shekel(paid - price),
  toAgorot: ({ s, a }) => `${s * 100 + a} אג׳`,
  toShekel: ({ total }) => `${Math.floor(total / 100)} ₪ ו־${total % 100} אג׳`,
  afford: ({ have, a, b }) => (a + b <= have ? 'כן' : 'לא'),
  clockRead: ({ h, m }) => t(h, m),
  clockDraw: ({ h, m }) => (m === 0 ? `הקטן על ${h}, הגדול על 12` : `הקטן בין ${h} ל־${nextHour(h)}, הגדול על 6`),
  plusHalf: ({ h, m }) => (m === 0 ? t(h, 30) : t(nextHour(h), 0)),
  duration: ({ len }) => hours(len),
  earlier: ({ h1, m1, h2, m2 }) => (h1 * 60 + m1 < h2 * 60 + m2 ? t(h1, m1) : t(h2, m2)),
  ruler: ({ len }) => `${len} ס״מ`,
  mToCm: ({ m, c }) => `${m * 100 + c} ס״מ`,
  cmToM: ({ total }) => asM(total),
  compareLen: ({ a, b }) => (a > b ? asM(a) : `${b} ס״מ`),
  unit: ({ i }) => UNIT_ITEMS[i][1],
  kgAdd: ({ a, b }) => `${a + b} ק״ג`,
  kgSub: ({ a, b }) => `${a - b} ק״ג`,
  literMul: ({ n, k }) => `${n * k} ליטרים`,
  literSub: ({ a, b }) => `${a - b} ליטרים`,
}

test('four sets, six stations each, with everything a station needs', () => {
  assert.ok(SETS.length >= 4)
  for (const set of SETS) {
    assert.equal(set.stations.length, 6, set.id)
    for (const st of set.stations) {
      assert.ok(st.name && st.goal && st.materials && st.challenge, st.id)
      assert.ok(st.steps.length >= 3 && st.steps.length <= 5, st.id)
      assert.equal(typeof st.gen, 'function')
    }
  }
})

test('every exercise answer matches an independent recomputation, for many seeds', () => {
  for (const set of SETS) {
    for (const st of set.stations) {
      for (let seed = 1; seed <= 60; seed++) {
        const list = exercisesFor(st, seed)
        assert.equal(list.length, SHEET_SIZE, `${st.id} seed ${seed}`)
        assert.equal(new Set(list.map(e => e.key)).size, SHEET_SIZE, `${st.id} duplicates, seed ${seed}`)
        for (const ex of list) {
          assert.ok(recompute[ex.kind], `unknown kind ${ex.kind}`)
          assert.equal(ex.answer, recompute[ex.kind](ex.args), `${st.id} / ${ex.text}`)
          assert.ok(ex.text && ex.answer)
        }
      }
    }
  }
})

test('generation is deterministic by seed and differs between seeds', () => {
  for (const set of SETS) for (const st of set.stations) {
    assert.deepEqual(exercisesFor(st, 5), exercisesFor(st, 5))
    const a = exercisesFor(st, 1).map(e => e.key).join('|')
    const b = exercisesFor(st, 2).map(e => e.key).join('|')
    assert.notEqual(a, b, st.id)
  }
})

test('arithmetic stations keep to their stated difficulty and range', () => {
  const [addPlain, addCarry, subPlain, subBorrow] = SETS[0].stations
  for (let seed = 1; seed <= 40; seed++) {
    for (const e of exercisesFor(addPlain, seed)) { assert.ok(e.args.a % 10 + e.args.b % 10 < 10); assert.ok(e.args.a + e.args.b <= 100) }
    for (const e of exercisesFor(addCarry, seed)) { assert.ok(e.args.a % 10 + e.args.b % 10 >= 10); assert.ok(e.args.a + e.args.b <= 100) }
    for (const e of exercisesFor(subPlain, seed)) { assert.ok(e.args.a % 10 >= e.args.b % 10); assert.ok(e.args.a > e.args.b) }
    for (const e of exercisesFor(subBorrow, seed)) { assert.ok(e.args.a % 10 < e.args.b % 10); assert.ok(e.args.a > e.args.b) }
  }
})

test('multiplication stays within the 2-5 tables and money and clock values are legal', () => {
  const mult = SETS[1].stations.slice(0, 4)
  mult.forEach((st, i) => { for (const e of exercisesFor(st, 3)) assert.equal(e.args.n, i + 2) })
  for (const st of SETS[2].stations) for (const e of exercisesFor(st, 9)) {
    if (e.kind === 'change') assert.ok(e.args.paid > e.args.price)
    if (e.kind === 'agorot') assert.ok(e.args.tens >= 1 && e.args.fifties >= 1)
  }
  for (const st of SETS[3].stations) for (const e of exercisesFor(st, 9)) {
    for (const k of ['h', 'h1', 'h2']) if (e.args[k] !== undefined) assert.ok(e.args[k] >= 1 && e.args[k] <= 12)
    for (const k of ['m', 'm1', 'm2']) if (e.args[k] !== undefined) assert.ok([0, 30].includes(e.args[k]))
  }
})

test('rotation: in every round the six groups are at six different stations, and each group visits all', () => {
  assert.equal(GROUP_NAMES.length, 6)
  assert.equal(ROUNDS, 6)
  for (let r = 0; r < ROUNDS; r++) assert.equal(new Set(GROUP_NAMES.map((_, g) => stationFor(g, r))).size, 6)
  for (let g = 0; g < 6; g++) assert.equal(new Set(Array.from({ length: ROUNDS }, (_, r) => stationFor(g, r))).size, 6)
})

test('measurement set: rulers fit the drawn ruler, lengths never tie, units and liters are sensible', () => {
  const set = SETS.find(s => s.id === 'measurement')
  assert.ok(set)
  for (let seed = 1; seed <= 60; seed++) for (const st of set.stations) for (const e of exercisesFor(st, seed)) {
    if (e.kind === 'ruler') { assert.ok(e.args.start >= 0 && e.args.len >= 2 && e.args.start + e.args.len <= RULER_CM); assert.deepEqual(e.ruler, e.args) }
    if (e.kind === 'compareLen') assert.notEqual(e.args.a, e.args.b)
    if (e.kind === 'kgSub' || e.kind === 'literSub') assert.ok(e.args.a - e.args.b >= 2)
    if (e.kind === 'literMul') assert.ok(e.args.n * e.args.k >= 2)
  }
  assert.ok(new Set(UNIT_ITEMS.map(u => u[1])).size === 4)
  for (const u of ['ס״מ', 'מ׳', 'ק״ג', 'ליטר']) assert.ok(UNIT_ITEMS.filter(x => x[1] === u).length >= 3, u)
})

test('station and set ids are unique, and the setup guide is filled in', () => {
  assert.equal(new Set(SETS.map(s => s.id)).size, SETS.length)
  const ids = SETS.flatMap(s => s.stations.map(st => st.id))
  assert.equal(new Set(ids).size, ids.length)
  assert.ok(SETUP_STEPS.length >= 5 && SETUP_STEPS.every(s => s.t && s.d))
})
