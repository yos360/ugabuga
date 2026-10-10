// /math topics for grades 1–3: metadata per the contract, and 500 seeds × 3 levels of every generator.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { createRng } = await import('../src/math/rng.js')
const { mixSeed } = await import('../src/math/gen.js')
const { exerciseProblems, exprHolds } = await import('../src/math/validate.js')
const { checkAnswer, formatNumber } = await import('../src/math/check.js')
const grades = {
  1: (await import('../src/math/topics/grade1.js')).default,
  2: (await import('../src/math/topics/grade2.js')).default,
  3: (await import('../src/math/topics/grade3.js')).default,
}
const STRANDS = ['arithmetic', 'geometry', 'algebra', 'fractions', 'measurement', 'data', 'probability', 'functions', 'trigonometry', 'calculus', 'sequences', 'vectors']
const SEEDS = 500
const run = (t, level, seed) => t.gen(level, createRng(mixSeed(seed)))
const find = (g, slug) => grades[g].find(t => t.slug === slug)

test('each grade has 8–12 topics with complete, unique metadata', () => {
  const descs = new Set()
  for (const [g, topics] of Object.entries(grades)) {
    assert.ok(topics.length >= 8 && topics.length <= 12, `grade ${g}: ${topics.length} topics`)
    assert.equal(new Set(topics.map(t => t.slug)).size, topics.length, `grade ${g} slugs unique`)
    assert.equal(new Set(topics.map(t => t.title)).size, topics.length, `grade ${g} titles unique`)
    for (const t of topics) {
      const id = `${g}/${t.slug}`
      assert.equal(t.grade, Number(g), id)
      assert.match(t.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, id)
      assert.ok(STRANDS.includes(t.strand), `${id} strand`)
      for (const k of ['title', 'emoji', 'desc', 'intro']) assert.ok(typeof t[k] === 'string' && t[k].trim(), `${id} ${k}`)
      assert.ok(t.desc.length >= 120 && t.desc.length <= 160, `${id} desc length ${t.desc.length}`)
      assert.ok(!descs.has(t.desc), `${id} desc unique`); descs.add(t.desc)
      assert.ok(Array.isArray(t.tips) && t.tips.length >= 2 && t.tips.length <= 4, `${id} tips`)
      assert.ok(t.example?.q && t.example.a && t.example.steps?.length, `${id} example`)
      assert.ok(Array.isArray(t.faq) && t.faq.length >= 2 && t.faq.length <= 3 && t.faq.every(f => f.q && f.a), `${id} faq`)
      assert.ok(Array.isArray(t.levels) && t.levels.length === 3 && t.levels.every(Boolean), `${id} levels`)
      assert.equal(typeof t.gen, 'function', id)
    }
  }
})

test('every generator is valid for 500 seeds at every level, and equations check out', () => {
  for (const topics of Object.values(grades)) for (const t of topics) for (const level of [1, 2, 3]) {
    for (let seed = 1; seed <= SEEDS; seed++) {
      const ex = run(t, level, seed * 7919 + level)
      const where = `${t.grade}/${t.slug} L${level} seed ${seed}`
      assert.deepEqual(exerciseProblems(ex), [], `${where}: ${JSON.stringify(ex).slice(0, 300)}`)
      // primary-school answers are whole, non-negative numbers
      if (ex.type === 'number') assert.ok(Number.isInteger(ex.answer) && ex.answer >= 0, `${where}: answer ${ex.answer}`)
      const holds = exprHolds(ex)
      if (holds !== null) assert.equal(holds, true, `${where}: ${ex.expr} with ${ex.answer}`)
      // determinism
      assert.deepEqual(run(t, level, seed * 7919 + level), ex, `${where} deterministic`)
    }
  }
})

test('levels genuinely differ', () => {
  for (const topics of Object.values(grades)) for (const t of topics) {
    const sig = level => new Set(Array.from({ length: 200 }, (_, i) => { const e = run(t, level, i + 1); return `${e.q}|${e.expr || ''}|${e.svg || ''}` }))
    const [a, b, c] = [sig(1), sig(2), sig(3)]
    const overlap = (x, y) => [...x].filter(v => y.has(v)).length / Math.min(x.size, y.size)
    assert.ok(overlap(a, b) < 0.5 && overlap(b, c) < 0.5 && overlap(a, c) < 0.5, `${t.grade}/${t.slug} levels overlap`)
    assert.ok(a.size > 3 && b.size > 3 && c.size > 3, `${t.grade}/${t.slug} variety`)
  }
})

test('number ranges follow the grade', () => {
  const maxIn = (t, level) => Math.max(...Array.from({ length: 300 }, (_, i) => { const e = run(t, level, i + 1); return Math.max(...`${e.q} ${e.expr || ''}`.replace(/,(?=\d{3})/g, '').match(/\d+/g)?.map(Number) || [0], typeof e.answer === 'number' ? e.answer : 0) }))
  for (const t of grades[1]) for (const l of [1, 2, 3]) assert.ok(maxIn(t, l) <= 100, `${t.slug} L${l} stays within 100`)
  for (const t of grades[2]) for (const l of [1, 2, 3]) assert.ok(maxIn(t, l) <= 1000, `${t.slug} L${l} stays within 1000`)
  for (const t of grades[3]) for (const l of [1, 2, 3]) assert.ok(maxIn(t, l) <= 10000, `${t.slug} L${l} stays within 10,000`)
  // the add/sub-20 levels are what they say
  const t = find(1, 'add-sub-20')
  for (let s = 1; s <= SEEDS; s++) {
    const e1 = run(t, 1, s), [a1, op1, b1] = e1.expr.split(' ')
    assert.ok(op1 === '+' ? (+a1 % 10) + +b1 < 10 : (+a1 % 10) >= +b1, `no carry: ${e1.expr}`)
    const e2 = run(t, 2, s), [a2, , b2] = e2.expr.split(' ')
    assert.ok(+a2 < 10 && +b2 < 10 && +a2 + +b2 > 10, `carry: ${e2.expr}`)
    const e3 = run(t, 3, s), [a3, , b3] = e3.expr.split(' ')
    assert.ok(+a3 > 10 && (+a3 % 10) < +b3 && +b3 < 10, `borrow: ${e3.expr}`)
  }
})

test('topic-specific answers are right', () => {
  const div = find(3, 'division-remainder')
  for (let s = 1; s <= SEEDS; s++) for (const l of [2, 3]) {
    const e = run(div, l, s), [n, d] = e.expr.split(' ÷ ').map(Number)
    assert.ok(n % d > 0, `has remainder: ${e.expr}`)
    assert.equal(e.answer, e.q.includes('השארית') ? n % d : Math.floor(n / d), e.q)
  }
  const even = find(2, 'even-odd')
  for (let s = 1; s <= SEEDS; s++) for (const l of [1, 2, 3]) {
    const e = run(even, l, s)
    const n = l === 3 ? e.expr.split(' + ').reduce((a, b) => a + Number(b), 0) : Number(e.q.match(/\d+/)[0])
    assert.equal(e.answer, n % 2 ? 'אי-זוגי' : 'זוגי', e.q)
  }
  const clock = find(2, 'clock')
  for (let s = 1; s <= SEEDS; s++) for (const l of [1, 2, 3]) {
    const e = run(clock, l, s), [h, m] = e.answer.split(':').map(Number)
    assert.ok(h >= 1 && h <= 12 && m % 5 === 0 && m < 60, e.answer)
    if (l === 1) assert.equal(m, 0)
    if (l === 2) assert.ok([15, 30, 45].includes(m))
    for (const c of e.choices) assert.match(c, /^(1[0-2]|[1-9]):[0-5][05]$/)
  }
  const frac = find(3, 'simple-fractions')
  for (let s = 1; s <= SEEDS; s++) {
    const e = run(frac, 2, s)
    const shaded = (e.svg.match(/#7dd3fc/g) || []).length, parts = (e.svg.match(/<(path|rect)/g) || []).length
    assert.ok(checkAnswer(e, `${shaded}/${parts}`), `${shaded}/${parts} vs ${e.answer}`)
  }
  const per = find(3, 'perimeter')
  for (let s = 1; s <= SEEDS; s++) {
    const e = run(per, 2, s)
    const sides = [...e.svg.matchAll(/>(\d+)<\/text>/g)].map(m => Number(m[1]))
    assert.equal(e.answer, sides.reduce((a, b) => a + b, 0))
  }
  const cmp = find(3, 'numbers-10000')
  for (let s = 1; s <= SEEDS; s++) {
    const e = run(cmp, 3, s), n = Number(e.q.match(/[\d,]+/)[0].replace(/,/g, '')), to = e.q.includes('לעשרת') ? 10 : e.q.includes('למאה') ? 100 : 1000
    assert.equal(e.answer, Math.round(n / to) * to)
  }
})

test('explanations end at the right answer for number exercises', () => {
  for (const topics of Object.values(grades)) for (const t of topics) for (const level of [1, 2, 3]) for (let s = 1; s <= 100; s++) {
    const e = run(t, level, s)
    if (e.type !== 'number') continue
    const shown = [String(e.answer), formatNumber(e.answer)]
    assert.ok(shown.some(x => e.explain.includes(x)), `${t.grade}/${t.slug} L${level}: "${e.explain}" lacks ${e.answer}`)
  }
})
