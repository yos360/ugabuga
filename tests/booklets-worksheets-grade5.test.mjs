import test from 'node:test'
import assert from 'node:assert/strict'
import * as D from '../src/booklets/worksheetsGrade5Data.js'

test('grade 5 worksheets: long division divides evenly, products are multi-digit', () => {
  for (const [a, b] of D.DIV) assert.equal(a % b, 0, `${a} ÷ ${b}`)
  for (const [a, b] of D.MULT) assert.ok(b >= 10 && b < 100 && a * b > 500, `${a} × ${b}`)
})

test('grade 5 worksheets: fractions reduce fully, expand to whole numbers, comparisons vary', () => {
  for (const f of D.FRAC_REDUCE) { const [a, b] = D.reduce(f); assert.equal(D.gcd(a, b), 1); assert.ok(b < f[1]) }
  for (const f of D.FRAC_EXPAND) assert.ok(Number.isInteger(D.expand(f)), f.join('/'))
  const signs = new Set(D.FRAC_COMPARE.map(D.compareSign))
  assert.deepEqual([...signs].sort(), ['<', '=', '>'])
  assert.equal(D.compareSign([4, 10, 2, 5]), '=')
})

test('grade 5 worksheets: decimals are exact', () => {
  assert.deepEqual(D.DEC_OPS.map(D.decResult), ['5.75', '5.15', '17', '6.25', '2.4', '23.5', '1.2', '3.1'])
  assert.deepEqual(D.decSorted(D.DEC_ORDER[1]), ['2.01', '2.1', '2.101', '2.11'])
})

test('grade 5 worksheets: word problems use the story numbers and give whole or money answers', () => {
  assert.deepEqual(D.WORD.map(w => D.evaluate(w.ex)), [252, 28, 26.7, 90, 3500, 1450])
  for (const w of D.WORD) {
    const story = w.t.join(' ')
    for (const n of w.ex.split(' ').filter(t => /\d/.test(t))) assert.ok(story.includes(n) || ['4', '7'].includes(n), `${n} in ${story}`)
    assert.ok(w.t[1].endsWith('?') && w.u)
  }
  assert.equal(D.timeAnswer(D.TIME_Q), '6 שעות ו־25 דקות')
})

test('grade 5 worksheets: reading, language, English and science answers are well formed', () => {
  for (const it of D.READING_MC) { assert.equal(it.o.length, 3); assert.equal(new Set(it.o).size, 3); assert.ok(it.a >= 0 && it.a < 3) }
  assert.ok(new Set(D.READING_MC.map(it => it.a)).size > 1)
  assert.deepEqual(D.READING_ORDER.map(r => r[1]).sort(), [1, 2, 3, 4])
  for (const [w, r] of D.ROOTS) { assert.equal(r.length, 3); assert.ok([...r].every(ch => w.includes(ch) || ch === 'ו'), `${w} ${r}`) }
  for (const it of D.ODD_ONE) { assert.equal(it.w.length, 4); assert.ok(it.w.includes(it.odd)) }
  assert.equal(new Set(D.POS_WORDS.map(([w]) => w)).size, D.POS_WORDS.length)
  for (const k of Object.keys(D.POS)) assert.ok(D.POS_WORDS.filter(([, p]) => p === k).length === 5, k)
  for (const r of D.TENSES) { assert.equal(r.f.length, 3); assert.ok(r.show >= 0 && r.show < 3) }
  for (const [s, o, a] of D.ENGLISH) { assert.ok(s.includes('___')); assert.equal(o.length, 2); assert.ok(a === 0 || a === 1) }
  assert.ok(D.SCIENCE_TF.some(r => r[1]) && D.SCIENCE_TF.some(r => !r[1]))
  for (const [, t, fix] of D.SCIENCE_TF) assert.ok(t || fix)
  assert.deepEqual(D.WATER.map(r => r[1]).sort(), [...D.WATER_BANK].sort())
})

test('grade 5 worksheets: sequences continue by their rule and riddles check out', () => {
  assert.deepEqual(D.SEQUENCES.map(D.seqNext), [[14, 17], [64, 55], [48, 96], [25, 36], [11, 16]])
  const [t, u] = [7, 2]; assert.equal(t + u, 9); assert.equal(t - u, 5); assert.equal(D.RIDDLES[0].a, '72')
  assert.equal(48 / 4 * 3, Number(D.RIDDLES[1].a))
})
