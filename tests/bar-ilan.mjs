import { test } from 'node:test'
import assert from 'node:assert/strict'
import { makeTest } from '../src/learn/gifted/barIlan.js'

test('Bar-Ilan practice: 24 questions, four distinct options, sound answers', () => {
  for (let seed = 1; seed <= 300; seed++) {
    const qs = makeTest(seed)
    assert.equal(qs.length, 24)
    for (const q of qs) {
      assert.equal(q.options.length, 4, `${q.kind} seed ${seed}`)
      assert.equal(new Set(q.options.map(String)).size, 4)
      assert.ok(q.answer >= 0 && q.answer < 4)
      const a = q.options[q.answer]
      if (typeof a === 'number') assert.ok(Number.isInteger(a) && a >= 0, `${q.kind}: ${a}`)
      for (const o of q.options) if (typeof o === 'number') assert.ok(Number.isFinite(o) && o >= 0)
      assert.ok(q.explain.length > 10)
    }
  }
})

test('Bar-Ilan practice: order-of-operations answer is right', () => {
  for (const q of makeTest(7).filter(x => x.kind === 'order')) {
    const expr = q.f.replace('= ?', '').replace(/×/g, '*').replace(/−/g, '-').replace(/:/g, '/')
    assert.equal(q.options[q.answer], Function(`return ${expr}`)())
  }
})
