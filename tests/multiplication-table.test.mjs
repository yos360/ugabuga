// Multiplication-table pages (/learn/multiplication-table…): grid logic, verified tricks, page metadata.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const {
  MT_BASE, MT_NUMBERS, MT_PAGES, MT_PATHS, GRIDS, NUMBER_INFO, buildGrid, range, isSquare, squaresUpTo, uniqueFacts, factPairs,
  digitSum, occurrences, timesList, nineFingers, decompose, quizFor, roundExercises, numberMeta, numberFaq, numberPath, allPageMeta,
} = await import('../src/learn/multiplicationTable.js')

test('grids hold the right products', () => {
  const g = buildGrid(GRIDS.ten.rows, GRIDS.ten.cols)
  assert.equal(g.length, 10); assert.ok(g.every(row => row.length === 10))
  for (const row of g) for (const c of row) assert.equal(c.v, c.r * c.c)
  assert.equal(g[6][7].v, 56) // 7×8
  assert.equal(Math.max(...g.flat().map(c => c.v)), 100)
  assert.deepEqual(g.flat().filter(c => c.square).map(c => c.v), squaresUpTo(10))
  const t = buildGrid(GRIDS.twelve.rows, GRIDS.twelve.cols)
  assert.equal(t.flat().length, 144); assert.equal(t[11][11].v, 144)
  const tens = buildGrid(GRIDS.tens.rows, GRIDS.tens.cols)
  assert.deepEqual(GRIDS.tens.cols, [10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
  assert.equal(Math.max(...tens.flat().map(c => c.v)), 1000)
  // the table is symmetric (commutativity)
  for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) assert.equal(g[r][c].v, g[c][r].v)
})

test('ranges and counting helpers', () => {
  assert.deepEqual(range(1, 5), [1, 2, 3, 4, 5])
  assert.deepEqual(range(100, 300, 100), [100, 200, 300])
  assert.equal(uniqueFacts(10), 55)
  assert.equal(factPairs(range(1, 10)).length, 55)
  assert.equal(factPairs([3, 4, 6, 7, 8, 9]).length, 21)
  assert.deepEqual(squaresUpTo(10), [1, 4, 9, 16, 25, 36, 49, 64, 81, 100])
  assert.ok(squaresUpTo(12).every(isSquare)); assert.ok(!isSquare(56))
  assert.equal(occurrences(24), 4); assert.equal(occurrences(36), 3); assert.equal(occurrences(100), 1); assert.equal(occurrences(11), 0)
  assert.deepEqual(timesList(7, 12).map(f => f.v), [7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84])
})

test('the tricks quoted on the pages are true', () => {
  for (let k = 1; k <= 10; k++) {
    assert.equal(nineFingers(k).value, 9 * k) // finger trick
    assert.equal(digitSum(9 * k), 9) // digit sum 9 up to 9×10
    assert.equal(9 * k, 10 * k - k)
    assert.equal(4 * k, k * 2 * 2) // double, double
    assert.equal(8 * k, k * 2 * 2 * 2)
    assert.equal(7 * k, 5 * k + 2 * k)
    assert.equal(6 * k, 5 * k + k)
    assert.ok([0, 5].includes((5 * k) % 10))
  }
  for (let k = 1; k <= 12; k++) {
    assert.ok([3, 6, 9].includes(digitSum(3 * k) % 9 || 9), `3×${k}`)
    assert.equal(12 * k, 10 * k + 2 * k)
    assert.equal(11 * k, 10 * k + k)
    if (k % 2 === 0) assert.equal((6 * k) % 10, k % 10, `6×${k}`)
  }
  for (let k = 1; k <= 9; k++) assert.equal(11 * k, Number(`${k}${k}`))
  assert.deepEqual(range(1, 10).map(k => (8 * k) % 10), [8, 6, 4, 2, 0, 8, 6, 4, 2, 0])
  assert.equal(7 * 8, 56)
  assert.deepEqual(nineFingers(4), { tens: 3, ones: 6, value: 36 })
})

test('decompose splits by place value and sums correctly', () => {
  const d = decompose(23, 4)
  assert.deepEqual(d.parts.map(p => p.p), [20, 3]); assert.equal(d.total, 92)
  assert.equal(decompose(243, 3).total, 729)
  assert.deepEqual(decompose(105, 6).parts.map(p => p.p), [100, 5])
  for (let a = 1; a < 300; a += 7) for (const b of [1, 4, 9, 13]) assert.equal(decompose(a, b).total, a * b)
})

test('quizzes and round exercises are deterministic and valid', () => {
  for (const n of MT_NUMBERS) {
    const q = quizFor(n)
    assert.equal(q.length, 10)
    assert.deepEqual(quizFor(n), q)
    assert.ok(q.every(x => (x.a === n || x.b === n) && x.v === x.a * x.b))
    assert.equal(new Set(q.map(x => x.a * 100 + x.b)).size, 10)
  }
  const ex = roundExercises(5)
  assert.equal(ex.length, 24)
  assert.deepEqual(roundExercises(5), ex)
  assert.ok(ex.every(e => e.v === e.a * e.b && e.v <= 1000 && (e.a % 10 === 0 || e.b % 10 === 0)))
  assert.equal(new Set(ex.map(e => `${e.a}x${e.b}`)).size, ex.length)
})

test('page metadata is complete and unique', () => {
  const metas = allPageMeta()
  assert.equal(metas.length, 15)
  for (const m of metas) {
    assert.ok(m.path.startsWith(MT_BASE), m.path)
    assert.ok(!/UGABUGA/.test(m.title), m.title)
    assert.ok(m.description.length >= 120 && m.description.length <= 160, `${m.path}: description ${m.description.length}`)
    assert.ok(m.h1 && m.title.includes(m.h1), m.path)
  }
  for (const f of ['path', 'title', 'description', 'h1']) assert.equal(new Set(metas.map(m => m[f])).size, metas.length, f)
  assert.deepEqual(MT_PATHS, metas.map(m => m.path))
  assert.equal(new Set(MT_PATHS).size, 15)
  assert.equal(MT_PAGES[100].path, '/learn/multiplication-table/100')
  assert.equal(numberPath(7), '/learn/multiplication-table/of/7')
  assert.equal(numberMeta(13), null); assert.equal(numberMeta(0), null)
})

test('every number has tips and a correct FAQ', () => {
  for (const n of MT_NUMBERS) {
    const info = NUMBER_INFO[n]
    assert.ok(info.intro && info.relation && info.short && info.tips.length >= 2, `${n}`)
    const faq = numberFaq(n)
    assert.ok(faq.length >= 4)
    assert.ok(faq[0].a.startsWith(`${n} כפול ${info.hard} שווה ${n * info.hard}.`))
  }
  const qs = MT_NUMBERS.flatMap(n => numberFaq(n).map(f => f.q))
  assert.equal(new Set(qs).size, qs.length)
})
