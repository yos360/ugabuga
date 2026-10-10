// /math framework: the answer checker, the registry (grades, lookup, sitemap paths, worksheets, tests)
// and a smoke run of every registered topic of every grade.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const C = await import('../src/math/check.js')
const R = await import('../src/math/registry.js')
const { exerciseProblems, evalArithmetic, exprHolds } = await import('../src/math/validate.js')
const { createRng } = await import('../src/math/rng.js')
const { mixSeed } = await import('../src/math/gen.js')
const { checkAnswer: ok, formatAnswer } = C

test('gcd, simplify and fraction formatting', () => {
  assert.equal(C.gcd(12, 18), 6)
  assert.equal(C.gcd(-4, 6), 2)
  assert.equal(C.gcd(0, 5), 5)
  assert.deepEqual(C.simplify(6, 8), [3, 4])
  assert.deepEqual(C.simplify(3, -9), [-1, 3])
  assert.deepEqual(C.simplify(0, -5), [0, 1])
  assert.throws(() => C.simplify(1, 0))
  assert.equal(C.formatFraction(10, 4), '5/2')
  assert.equal(C.formatFraction(-6, 3), '-2')
  assert.equal(C.formatFraction(0, 7), '0')
  assert.equal(C.formatMixed(7, 2), '3 1/2')
  assert.equal(C.formatMixed(-7, 2), '-3 1/2')
  assert.equal(C.formatMixed(1, 3), '1/3')
  assert.equal(C.formatNumber(12000), '12,000')
  assert.equal(C.formatNumber(4500), '4500')
  assert.equal(C.formatNumber(-3), '−3')
  assert.equal(C.formatNumber(0.1 + 0.2), '0.3')
})

test('number answers: spaces, minus signs, comma decimals, thousands, tolerance', () => {
  const ex = { type: 'number', answer: 15 }
  for (const s of ['15', ' 15 ', '15.0', '+15', '015', '30/2', '15,0', '‎15']) assert.ok(ok(ex, s), s)
  for (const s of ['', ' ', '16', '1 5x', 'abc', '15/0', '-15']) assert.ok(!ok(ex, s), `rejects ${JSON.stringify(s)}`)
  const neg = { type: 'number', answer: -3 }
  for (const s of ['-3', '−3', '–3', '- 3', '־3']) assert.ok(ok(neg, s), s)
  assert.ok(!ok(neg, '3'))
  const dec = { type: 'number', answer: 2.5 }
  for (const s of ['2.5', '2,5', '2.50', '5/2', '2 1/2', '½ 2'.replace('½ 2', '2½')]) assert.ok(ok(dec, s), s)
  const big = { type: 'number', answer: 12500 }
  for (const s of ['12500', '12,500', '12 500']) assert.ok(ok(big, s), s)
  assert.ok(ok({ type: 'number', answer: 2500 }, '2,500'), 'thousands separator')
  assert.ok(ok({ type: 'number', answer: 2.5 }, '2,500'), 'comma decimal reading also accepted')
  const tol = { type: 'number', answer: 3.14159, tol: 0.01 }
  for (const s of ['3.14', '3,14', '3.15']) assert.ok(ok(tol, s), s)
  assert.ok(!ok(tol, '3.2'))
  assert.ok(ok({ type: 'number', answer: 0.1 + 0.2 }, '0.3'), 'float noise')
  assert.ok(ok({ type: 'number', answer: 0 }, '0') && ok({ type: 'number', answer: 0 }, '-0'))
})

test('fraction answers: equivalent, mixed, exact decimals, negatives', () => {
  const ex = { type: 'fraction', answer: '3/4' }
  for (const s of ['3/4', '6/8', ' 3 / 4 ', '0.75', '0,75', '.75', '¾', '75/100']) assert.ok(ok(ex, s), s)
  for (const s of ['4/3', '3', '0.7', '3/0', '/4', '3/', '']) assert.ok(!ok(ex, s), `rejects ${s}`)
  const mixed = { type: 'fraction', answer: '7/4' }
  for (const s of ['7/4', '1 3/4', '1.75', '14/8', '1¾']) assert.ok(ok(mixed, s), s)
  assert.ok(!ok(mixed, '13/4'), '1 3/4 ≠ 13/4')
  const neg = { type: 'fraction', answer: '-2/3' }
  for (const s of ['-2/3', '−2/3', '2/-3', '-4/6']) assert.ok(ok(neg, s), s)
  assert.ok(!ok(neg, '2/3'))
  const negMixed = { type: 'fraction', answer: '-5/2' }
  assert.ok(ok(negMixed, '-2 1/2') && ok(negMixed, '−2.5'))
  assert.ok(ok({ type: 'fraction', answer: '2' }, '4/2') && ok({ type: 'fraction', answer: 2 }, '2'))
  assert.ok(!ok({ type: 'fraction', answer: '1/3' }, '0.33'), 'inexact decimal is not 1/3')
})

test('numbers (unordered lists), choice and text', () => {
  const ex = { type: 'numbers', answer: [2, -3] }
  for (const s of ['2, -3', '-3, 2', '2;−3', 'x=2 או x=-3', 'x = −3, x = 2', '2 ו-−3', '2 -3']) assert.ok(ok(ex, s), s)
  for (const s of ['2', '2, 3', '2, -3, 4', '2, 2']) assert.ok(!ok(ex, s), `rejects ${s}`)
  const dup = { type: 'numbers', answer: [1, 1] }
  assert.ok(ok(dup, '1, 1') && !ok(dup, '1'))
  const fr = { type: 'numbers', answer: ['1/2', -4] }
  assert.ok(ok(fr, '-4, 0.5') && ok(fr, '1/2, −4'))
  const mixedList = { type: 'numbers', answer: ['3/2', 1] }
  assert.ok(ok(mixedList, '1 1/2, 1'))
  const ch = { type: 'choice', answer: 'זווית חדה', choices: ['זווית חדה', 'זווית ישרה'] }
  assert.ok(ok(ch, 'זווית חדה') && ok(ch, '  זווית  חדה ') && !ok(ch, 'זווית ישרה'))
  assert.ok(ok({ type: 'choice', answer: '<' }, '<') && !ok({ type: 'choice', answer: '<' }, '>'))
  const tx = { type: 'text', answer: 'y = 2x + 1' }
  assert.ok(ok(tx, 'y=2x+1') && ok(tx, 'Y = 2X + 1') && !ok(tx, 'y=2x-1'))
  assert.ok(!ok(null, '1') && !ok({ type: 'weird', answer: 1 }, '1'))
})

test('splitList and formatAnswer round-trips', () => {
  assert.deepEqual(C.splitList('x=1, x=−2'), ['1', '-2'])
  assert.deepEqual(C.splitList('1 1/2; 3'), ['1 1/2', '3'])
  for (const ex of [{ type: 'number', answer: 12000 }, { type: 'number', answer: -2.5 }, { type: 'fraction', answer: '-7/3' }, { type: 'numbers', answer: [3, -1.5, '2/3'] }, { type: 'choice', answer: 'א', choices: ['א', 'ב'] }]) {
    assert.ok(ok(ex, formatAnswer(ex)), JSON.stringify(ex))
  }
})

test('validator helpers', () => {
  assert.equal(evalArithmetic('2 + 3 × 4'), 14)
  assert.equal(evalArithmetic('(2 + 3) × 4 − 6 ÷ 3'), 18)
  assert.equal(evalArithmetic('−3 + 1'), -2)
  assert.equal(evalArithmetic('2 + x'), null)
  assert.equal(exprHolds({ type: 'number', expr: '7 + ? = 12', answer: 5 }), true)
  assert.equal(exprHolds({ type: 'number', expr: '7 + ? = 12', answer: 6 }), false)
  assert.equal(exprHolds({ type: 'choice', expr: '47 ☐ 52', answer: '<', choices: ['<', '>', '='] }), true)
  assert.equal(exprHolds({ type: 'number', expr: '2, 4, ?', answer: 6 }), null)
  assert.deepEqual(exerciseProblems({ q: 'x', type: 'number', answer: 1, explain: 'y' }), [])
  assert.ok(exerciseProblems({ q: 'x', type: 'choice', answer: 1, choices: ['1', '1'], explain: 'y' }).length)
  assert.ok(exerciseProblems({ q: 'x', type: 'fraction', answer: '2/4', explain: 'y' }).length)
  assert.ok(exerciseProblems({ q: 'undefined', type: 'number', answer: 1, explain: 'y' }).length)
  assert.ok(exerciseProblems({ q: 'x', type: 'number', answer: NaN, explain: 'y' }).length)
})

test('grades, stages and lookups', () => {
  assert.equal(R.GRADES.length, 12)
  assert.deepEqual(R.GRADES.map(g => g.label), ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ז׳', 'ח׳', 'ט׳', 'י׳', 'י״א', 'י״ב'])
  assert.deepEqual(R.GRADES.map(g => g.stageLabel), [...Array(6).fill('יסודי'), ...Array(3).fill('חטיבת ביניים'), ...Array(3).fill('תיכון')])
  assert.deepEqual(R.STAGES.flatMap(s => s.grades), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  assert.equal(R.parseGradeParam('grade-3'), 3)
  for (const bad of ['grade-0', 'grade-13', 'grade-3x', '3', 'tests', undefined]) assert.equal(R.parseGradeParam(bad), null, String(bad))
  assert.equal(R.findTopic(1, 'add-sub-20').title, 'חיבור וחיסור עד 20')
  assert.equal(R.findTopic(1, 'nope'), null)
  assert.deepEqual(R.topicsFor(99), [])
  const groups = R.topicsByStrand(3)
  assert.equal(groups.reduce((s, g) => s + g.topics.length, 0), R.topicsFor(3).length)
  assert.ok(groups.every(g => g.label && g.topics.length))
})

test('allMathPaths: unique, well-formed, covers every topic', () => {
  const paths = R.allMathPaths()
  assert.equal(new Set(paths).size, paths.length)
  assert.equal(paths[0], '/math')
  for (const p of paths) assert.match(p, /^\/math(\/grade-\d{1,2}(\/[a-z0-9-]+)?|\/tests\/grade-\d{1,2})?$/, p)
  for (const g of R.GRADES) {
    assert.ok(paths.includes(g.path))
    for (const t of R.topicsFor(g.n)) assert.ok(paths.includes(`/math/grade-${g.n}/${t.slug}`))
    assert.equal(paths.includes(g.testPath), R.topicsFor(g.n).length > 0)
  }
})

test('worksheets and tests are reproducible, sized and varied', () => {
  const t = R.findTopic(2, 'add-sub-100')
  const a = R.makeWorksheet(t, 2, 20, 42), b = R.makeWorksheet(t, 2, 20, 42), c = R.makeWorksheet(t, 2, 20, 43)
  assert.equal(a.length, 20)
  assert.deepEqual(a, b)
  assert.notDeepEqual(a, c)
  assert.equal(new Set(a.map(e => e.expr)).size, 20, 'no repeats on a sheet')
  assert.ok(a.every(e => e.level === 2 && e.topic === 'add-sub-100'))
  for (const g of [1, 2, 3]) {
    const n = R.topicsFor(g).length
    const test10 = R.makeTest(g, 10, 7)
    assert.equal(test10.length, 10)
    assert.deepEqual(test10, R.makeTest(g, 10, 7))
    assert.equal(new Set(test10.map(e => e.topic)).size, Math.min(10, n), `grade ${g}: topics spread before repeating`)
    assert.ok(test10.every(e => e.topicTitle && exerciseProblems(e).length === 0))
    // mixed level climbs; fixed level stays
    const lv = R.makeTest(g, 20, 9).map(e => e.level)
    assert.equal(lv[0], 1); assert.equal(lv[19], 3)
    assert.ok(R.makeTest(g, 20, 9, 2).every(e => e.level === 2))
  }
  assert.deepEqual(R.makeTest(99, 10, 1), [])
})

test('seed mixing spreads small seeds', () => {
  const firsts = new Set(Array.from({ length: 50 }, (_, i) => Math.floor(createRng(mixSeed(i + 1)).next() * 10)))
  assert.ok(firsts.size >= 8, 'first draws from seeds 1..50 cover the range')
  assert.equal(mixSeed(5), mixSeed(5))
})

test('smoke: every registered topic of every grade generates valid exercises', () => {
  for (const g of R.GRADES) for (const t of R.topicsFor(g.n)) {
    assert.equal(t.grade, g.n, `${g.n}/${t.slug} grade field`)
    assert.ok(t.title && t.desc && Array.isArray(t.levels) && t.levels.length === 3 && typeof t.gen === 'function', `${g.n}/${t.slug} metadata`)
    for (const level of [1, 2, 3]) for (let s = 1; s <= 40; s++) {
      const ex = R.makeExercise(t, level, s)
      assert.deepEqual(exerciseProblems(ex), [], `${g.n}/${t.slug} L${level} seed ${s}`)
    }
  }
  const slugs = R.GRADES.map(g => R.topicsFor(g.n).map(t => t.slug))
  for (const list of slugs) assert.equal(new Set(list).size, list.length, 'unique slugs per grade')
})

test('pages module exports the four route components', () => {
  const src = readFileSync(new URL('../src/math/MathPages.jsx', import.meta.url), 'utf8')
  for (const name of ['MathHub', 'MathGrade', 'MathTopic', 'MathTest']) assert.match(src, new RegExp(`export function ${name}\\(`))
  assert.equal((src.match(/<h1[\s>]/g) || []).length, 4, 'one h1 per page component')
})
