// Times-table path game (/learn/multiplication-game): stages, question generator, stars, hints.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const {
  PATH_URL, STAGES, PER_STAGE, SHEET_COUNT, MAX_STARS, PATH_FAQ, stageById, stageQuestions, sheetQuestions, starsFor, unlockedCount,
  totalStars, cleanProgress, recordStars, hintFor,
} = await import('../src/learn/timesPath.js')

const sorted = (a, b) => (a < b ? `${a}x${b}` : `${b}x${a}`)

test('the path covers every table 1–10 once, with reviews and a final challenge', () => {
  const singles = STAGES.filter(s => !s.review).map(s => s.tables[0])
  assert.deepEqual([...singles].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  assert.equal(new Set(STAGES.map(s => s.id)).size, STAGES.length)
  STAGES.forEach((s, i) => assert.equal(s.index, i))
  assert.deepEqual(STAGES.at(-1).tables, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  // each review only uses tables already met earlier on the path
  for (const s of STAGES.filter(x => x.review)) {
    const before = new Set(STAGES.slice(0, s.index).filter(x => !x.review).map(x => x.tables[0]))
    for (const t of s.tables) assert.ok(before.has(t), `${s.id}: table ${t} comes later`)
  }
  assert.equal(MAX_STARS, STAGES.length * 3)
  assert.equal(stageById('t7').title, 'הלוח של 7')
  assert.equal(stageById('nope'), null)
})

test('a single-table stage asks every fact of that table exactly once, with correct products', () => {
  for (const s of STAGES.filter(x => !x.review)) for (const seed of [1, 2, 99, 123456]) {
    const qs = stageQuestions(s, seed)
    const n = s.tables[0]
    assert.equal(qs.length, PER_STAGE)
    for (const q of qs) { assert.equal(q.v, q.a * q.b); assert.ok(q.a === n || q.b === n) }
    const other = qs.map(q => (q.a === n ? q.b : q.a)).sort((a, b) => a - b)
    assert.deepEqual(other, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  }
})

test('review stages ask distinct facts from their tables only', () => {
  for (const s of STAGES.filter(x => x.review)) for (let seed = 1; seed < 40; seed++) {
    const qs = stageQuestions(s, seed)
    assert.equal(qs.length, PER_STAGE)
    assert.equal(new Set(qs.map(q => sorted(q.a, q.b))).size, PER_STAGE, `${s.id} repeats a fact`)
    for (const q of qs) {
      assert.equal(q.v, q.a * q.b)
      assert.ok(s.tables.includes(q.a) && q.b >= 1 && q.b <= 10 || s.tables.includes(q.b) && q.a >= 1 && q.a <= 10)
      assert.ok(q.a !== 1 && q.b !== 1, 'reviews skip ×1')
    }
  }
})

test('the same seed rebuilds the same questions', () => {
  const s = stageById('r3')
  assert.deepEqual(stageQuestions(s, 42), stageQuestions(s, 42))
  assert.deepEqual(sheetQuestions([6, 7, 8], 7), sheetQuestions([6, 7, 8], 7))
})

test('the printable sheet has 30 correct facts from the stage tables, never the same fact twice in a row', () => {
  for (const s of STAGES) for (const seed of [3, 17, 2024]) {
    const items = sheetQuestions(s.tables, seed)
    assert.equal(items.length, SHEET_COUNT)
    items.forEach((f, i) => {
      assert.equal(f.v, f.a * f.b)
      assert.ok(s.tables.includes(f.a) || s.tables.includes(f.b))
      assert.ok(f.a <= 10 && f.b <= 10 && f.a >= 1 && f.b >= 1)
      if (i) assert.notEqual(`${f.a}x${f.b}`, `${items[i - 1].a}x${items[i - 1].b}`)
    })
  }
  // a single table: all ten facts appear on the sheet
  const seven = sheetQuestions([7], 5)
  assert.deepEqual([...new Set(seven.map(f => (f.a === 7 ? f.b : f.a)))].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
})

test('stars, unlocking and saved progress', () => {
  assert.deepEqual([10, 9, 8, 7, 6, 5, 0].map(r => starsFor(r)), [3, 2, 2, 1, 1, 0, 0])
  assert.equal(starsFor(30, 30), 3); assert.equal(starsFor(24, 30), 2); assert.equal(starsFor(18, 30), 1); assert.equal(starsFor(17, 30), 0)
  assert.equal(unlockedCount({}), 1)
  assert.equal(unlockedCount({ t1: 1 }), 2)
  assert.equal(unlockedCount({ t1: 3, t2: 2, t10: 1 }), 4)
  assert.equal(unlockedCount({ t1: 3, t10: 3 }), 2) // a gap stops the path
  assert.equal(unlockedCount(Object.fromEntries(STAGES.map(s => [s.id, 3]))), STAGES.length)
  assert.equal(totalStars({ t1: 3, t2: 2 }), 5)
  assert.deepEqual(cleanProgress({ t1: 3, t2: 7, t3: 0, bad: 2, t4: '2', t5: 1.5 }), { t1: 3, t4: 2 })
  assert.deepEqual(cleanProgress(null), {})
  const p = { t1: 2 }
  assert.equal(recordStars(p, 't1', 1), p) // never lowers
  assert.deepEqual(recordStars(p, 't1', 3), { t1: 3 })
  assert.deepEqual(recordStars(p, 't2', 2), { t1: 2, t2: 2 })
})

test('every hint equation is arithmetically true and ends with the product', () => {
  const evalEq = eq => {
    const [lhs, rhs] = eq.split(' = ')
    const js = lhs.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')
    assert.match(js, /^[\d\s+*/-]+$/)
    return [Function(`return (${js})`)(), Number(rhs)]
  }
  for (let a = 1; a <= 10; a++) for (let b = 1; b <= 10; b++) {
    const h = hintFor(a, b)
    assert.ok(h.text.length > 5)
    const [left, right] = evalEq(h.eq)
    assert.equal(right, a * b, `${a}×${b}: ${h.eq}`)
    assert.equal(left, a * b, `${a}×${b}: ${h.eq}`)
  }
})

test('page is routed, listed in the sitemap and search, and linked from the math hub', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  assert.match(app, new RegExp(`<Route path="${PATH_URL}" element={<TimesTablePath />} />`))
  assert.match(readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8'), new RegExp(`ugabuga\\.co\\.il${PATH_URL}<`))
  assert.match(readFileSync(new URL('../src/data/searchStatic.js', import.meta.url), 'utf8'), new RegExp(`to: '${PATH_URL}'`))
  assert.match(readFileSync(new URL('../src/math/MathPages.jsx', import.meta.url), 'utf8'), new RegExp(`to="${PATH_URL}"`))
  assert.ok(PATH_FAQ.length >= 4 && PATH_FAQ.every(f => f.q && f.a))
})
