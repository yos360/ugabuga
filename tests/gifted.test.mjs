// /learn/gifted-test: 4 types × 30 questions, one correct option each, answers re-derived from the rules
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { TYPES, VERBAL, LOGIC, SERIES, MATRICES } = await import('../src/learn/gifted/giftedData.js')

test('30 questions per type, unique ids, 4 distinct options and one marked answer', () => {
  assert.deepEqual(TYPES.map(t => t.key), ['verbal', 'series', 'matrices', 'logic'])
  const ids = new Set()
  for (const t of TYPES) {
    assert.equal(t.items.length, 30, t.key)
    for (const it of t.items) {
      assert.ok(!ids.has(it.id), `duplicate id ${it.id}`); ids.add(it.id)
      assert.equal(it.options.length, 4, it.id)
      assert.equal(new Set(it.options.map(o => JSON.stringify(o))).size, 4, `${it.id}: options must be distinct`)
      assert.ok(Number.isInteger(it.answer) && it.answer >= 0 && it.answer < 4, it.id)
      assert.ok([1, 2, 3].includes(it.level), it.id)
    }
    for (const l of [1, 2, 3]) assert.ok(t.items.some(i => i.level === l), `${t.key} has level ${l}`)
  }
  for (const it of [...VERBAL, ...LOGIC]) {
    assert.ok(it.exp && it.exp.length > 15, `${it.id} needs an explanation`)
    for (const o of it.options) assert.ok(String(o).trim(), it.id)
  }
  assert.equal(ids.size, 120)
})

test('correct answers are not all in the same position', () => {
  for (const t of TYPES) {
    const pos = new Set(t.items.map(i => i.answer))
    assert.ok(pos.size >= 3, `${t.key}: answers spread over positions`)
  }
})

// Independent evaluator of the series rules: shown terms and the next term
function nth(rule, i) {
  switch (rule.k) {
    case 'cycle': {
      let x = rule.a
      for (let j = 0; j < i; j++) {
        const [o, n] = rule.ops[j % rule.ops.length]
        x = { '+': x + n, '-': x - n, '*': x * n, '/': x / n }[o]
      }
      return x
    }
    case 'grow': return rule.a + Array.from({ length: i }, (_, j) => rule.d + j * rule.dd).reduce((s, v) => s + v, 0)
    case 'fib': { let a = rule.a, b = rule.b; for (let j = 0; j < i; j++) [a, b] = [b, a + b]; return a }
    case 'squares': return (rule.from + i) * (rule.from + i)
    case 'affine': { let x = rule.a; for (let j = 0; j < i; j++) x = rule.m * x + rule.c; return x }
    case 'inter': { const s = i % 2 === 0 ? rule.x : rule.y; return s.a + s.d * Math.floor(i / 2) }
    default: throw new Error('unknown rule ' + rule.k)
  }
}
test('number series: shown terms follow the rule and the marked option is the computed next term', () => {
  for (const s of SERIES) {
    assert.ok(s.seq.length >= 4, s.id)
    s.seq.forEach((v, i) => assert.equal(v, nth(s.rule, i), `${s.id} term ${i}`))
    const next = nth(s.rule, s.seq.length)
    assert.ok(Number.isInteger(next), s.id)
    assert.equal(s.options[s.answer], next, `${s.id}: marked option must equal the rule's next term`)
    assert.equal(s.options.filter(o => o === next).length, 1, `${s.id}: exactly one option equals the next term`)
    for (const o of s.options) assert.ok(Number.isInteger(o) && o >= 0, s.id)
  }
})

// Independent evaluator of the matrix rules: the missing cell is row 2, column 2
const BASE = { shape: 'circle', count: 1, fill: 'empty', size: 'm', rot: 0 }
const at = (by, r, c) => ({ c, r, l: (r + c) % 3, k: (c - r + 3) % 3, s: r + c })[by]
const cellOf = (m, r, c) => { const o = { ...BASE, ...m.fixed }; for (const a in m.vary) o[a] = m.vary[a].vals[at(m.vary[a].by, r, c)]; return o }
const key = o => ['shape', 'count', 'fill', 'size', 'rot'].map(k => o[k]).join('|')
test('shape matrices: the correct option is the rule-generated missing cell, no distractor equals it', () => {
  for (const m of MATRICES) {
    for (const [a, v] of Object.entries(m.vary)) {
      assert.ok(['shape', 'count', 'fill', 'size', 'rot'].includes(a), m.id)
      assert.equal(v.vals.length, v.by === 's' ? 5 : 3, `${m.id}.${a}`)
      assert.equal(new Set(v.vals).size, v.vals.length, `${m.id}.${a} values distinct`)
    }
    const missing = key(cellOf(m, 2, 2))
    assert.equal(key({ ...BASE, ...m.options[m.answer] }), missing, `${m.id}: marked option = missing cell`)
    m.options.forEach((o, j) => { if (j !== m.answer) assert.notEqual(key({ ...BASE, ...o }), missing, `${m.id}: distractor ${j}`) })
    assert.equal(new Set(m.options.map(o => key({ ...BASE, ...o }))).size, 4, `${m.id}: options look different`)
    // rotation is only visible on arrows, so it may only vary there
    const shapes = new Set([...Array(9).keys()].map(i => cellOf(m, Math.floor(i / 3), i % 3).shape).concat(m.options.map(o => o.shape)))
    if (m.vary.rot || m.options.some(o => o.rot !== m.options[m.answer].rot)) assert.deepEqual([...shapes], ['arrow'], m.id)
    for (const o of m.options) assert.ok(o.count >= 1 && o.count <= 5, m.id)
  }
})
