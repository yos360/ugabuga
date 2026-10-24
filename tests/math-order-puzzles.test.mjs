import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { orderExercises, orderSheet, slotOrder, opsFor, COUNTS, SECRET_WORDS, letters } from '../src/utils/orderPuzzles.js'

const RANGES = [10, 20, 100, 'mul']
const calc = e => (e.o === '+' ? e.a + e.b : e.o === '-' ? e.a - e.b : e.o === 'x' ? e.a * e.b : e.a / e.b)

test('every setting gives distinct, correct, non-negative results within the range', () => {
  for (const range of RANGES) for (const op of opsFor(range)) for (const count of COUNTS) for (let seed = 1; seed <= 150; seed++) {
    const items = orderExercises({ range, op, count, seed })
    const tag = `${range} ${op} ${count} seed ${seed}`
    assert.equal(items.length, count, tag)
    assert.equal(new Set(items.map(e => e.c)).size, count, 'distinct results: ' + tag)
    const max = range === 'mul' ? 100 : range
    for (const e of items) {
      assert.equal(calc(e), e.c, tag)
      for (const v of [e.a, e.b, e.c]) { assert.ok(Number.isInteger(v) && v >= 0, `no negatives/fractions: ${tag}`); assert.ok(v <= max, `within ${max}: ${tag} ${JSON.stringify(e)}`) }
      if (e.o === '÷') assert.ok(e.b >= 2 && e.a % e.b === 0, 'division without remainder')
      if (e.o === 'x') assert.ok(e.a >= 2 && e.a <= 10 && e.b >= 2 && e.b <= 10, 'times tables 2–10')
    }
    if (op === 'mix') assert.ok(items.some(e => e.o === '+') && items.some(e => e.o === '-'), 'both operations: ' + tag)
    if (op === 'muldiv') assert.ok(items.some(e => e.o === 'x') && items.some(e => e.o === '÷'), 'both operations: ' + tag)
  }
})

test('levels: up to 20 crosses ten often, up to 100 uses two-digit results', () => {
  let cross = 0, total = 0, twoDigit = 0, all100 = 0
  for (let seed = 1; seed <= 100; seed++) {
    for (const e of orderExercises({ range: 20, op: 'mix', count: 10, seed })) { total++; if ((e.o === '+' && e.a < 10 && e.b < 10 && e.c > 10) || (e.o === '-' && e.a > 10 && e.c < 10)) cross++ }
    for (const e of orderExercises({ range: 100, op: 'mix', count: 10, seed })) { all100++; if (e.c >= 10) twoDigit++ }
  }
  assert.ok(cross / total > 0.3, `crossing ten: ${cross}/${total}`)
  assert.ok(twoDigit / all100 > 0.9)
})

test('the slot order really sorts the results, both ways', () => {
  const s = orderSheet({ range: 20, op: 'mix', count: 10, dir: 'asc', seed: 42 })
  const asc = s.order.map(i => s.items[i].c)
  assert.deepEqual(asc, [...asc].sort((a, b) => a - b))
  const desc = slotOrder(s.items, 'desc').map(i => s.items[i].c)
  assert.deepEqual(desc, [...asc].reverse())
  // the letters, read in slot order, spell the secret word
  assert.equal(s.order.map(i => s.letterOf[i]).join(''), letters(s.word).join(''))
  assert.equal(s.check, asc[0] + asc[asc.length - 1])
})

test('secret words have exactly one letter per slot', () => {
  for (const n of COUNTS) for (const w of SECRET_WORDS[n]) assert.equal(letters(w).length, n, w)
})

test('the pages are routed, in the sitemap, in search and in the menu; the name is never recorded', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  const search = readFileSync(new URL('../src/data/searchStatic.js', import.meta.url), 'utf8')
  const menu = readFileSync(new URL('../src/data/siteMenu.js', import.meta.url), 'utf8')
  const page = readFileSync(new URL('../src/pages/printables/MathOrderPuzzles.jsx', import.meta.url), 'utf8')
  assert.ok(app.includes('path="/printables/math-order-puzzles"') && app.includes('path="/printables/math-order-puzzles/:slug"'))
  for (const slug of ['', '/up-to-10', '/up-to-20', '/up-to-100', '/multiplication']) {
    const path = '/printables/math-order-puzzles' + slug
    assert.ok(sitemap.includes(`https://ugabuga.co.il${path}<`), path)
    assert.ok(search.includes(`to: '${path}'`), path)
    if (slug) assert.ok(page.includes('`${BASE}' + slug + '`'), path)
  }
  assert.ok(menu.includes("to: '/printables/math-order-puzzles'"))
  assert.doesNotMatch(page, /localStorage|sessionStorage|fetch\(/)
  const creations = readFileSync(new URL('../src/utils/creations.js', import.meta.url), 'utf8')
  assert.doesNotMatch(creations, /math-order-puzzles/)
})
