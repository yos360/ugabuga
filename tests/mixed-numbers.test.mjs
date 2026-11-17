import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { LEVELS, FAQ, toImproper, toMixed, mixedText, buildSet, checkAnswer, makeQuestion } from '../src/data/mixedNumbers.js'
import { createRng } from '../src/math/rng.js'

test('conversions go both ways', () => {
  assert.deepEqual(toImproper(2, 3, 4), { n: 11, d: 4 })
  assert.deepEqual(toMixed(17, 5), { w: 3, r: 2, d: 5 })
  assert.deepEqual(toMixed(12, 4), { w: 3, r: 0, d: 4 })
  for (let d = 2; d <= 12; d++) for (let w = 0; w <= 9; w++) for (let r = 0; r < d; r++) {
    const { n } = toImproper(w, r, d)
    assert.deepEqual(toMixed(n, d), { w, r, d })
  }
  assert.equal(mixedText(3, 0, 4), '3')
  assert.equal(mixedText(2, 3, 4), '2 3/4')
})

test('generated questions are valid, distinct and reproducible', () => {
  for (const l of LEVELS) for (let seed = 1; seed <= 40; seed++) {
    const qs = buildSet(seed, l.id, 15)
    assert.equal(qs.length, 15)
    assert.equal(new Set(qs.map(q => `${q.w}:${q.r}:${q.d}`)).size, 15)
    assert.equal(new Set(qs.map(q => q.key)).size, 15)
    for (const q of qs) {
      assert.ok(l.dens.includes(q.d) && q.w >= 1 && q.r >= 0 && q.r < q.d)
      assert.equal(q.n, q.w * q.d + q.r)
      assert.ok(q.n > q.d || (q.r === 0 && q.n >= q.d), 'the improper fraction is at least one whole')
      if (q.kind !== 'toMixed') assert.ok(q.r > 0)
    }
    assert.deepEqual(buildSet(seed, l.id, 15), qs)
  }
})

test('answer checking', () => {
  const rng = createRng(7)
  const a = { ...makeQuestion(rng, 'easy', 'toImproper') }
  assert.ok(checkAnswer(a, { n: String(a.n) }))
  assert.ok(!checkAnswer(a, { n: String(a.n + 1) }))
  assert.ok(!checkAnswer(a, { n: '' }))
  const exact = { kind: 'toMixed', w: 3, r: 0, d: 4, n: 12 }
  assert.ok(checkAnswer(exact, { w: '3', r: '' }))
  assert.ok(checkAnswer(exact, { w: '3', r: '0' }))
  assert.ok(!checkAnswer(exact, { w: '2', r: '4' }))
  const m = { kind: 'picture', w: 2, r: 3, d: 4, n: 11 }
  assert.ok(checkAnswer(m, { w: '2', r: '3' }))
  assert.ok(!checkAnswer(m, { w: '', r: '3' }))
})

test('the page is wired into the site', () => {
  const app = readFileSync('src/App.jsx', 'utf8')
  assert.match(app, /path="\/math\/mixed-numbers"/)
  assert.match(readFileSync('public/sitemap-static.xml', 'utf8'), /ugabuga\.co\.il\/math\/mixed-numbers</)
  assert.match(readFileSync('src/data/searchStatic.js', 'utf8'), /to: '\/math\/mixed-numbers'/)
  assert.ok(FAQ.length >= 4 && FAQ.every(f => f.q && f.a))
})
