import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// The order-of-operations answers in the grade-7 prep booklet are typed by hand — recompute them here.
test('grade-7-prep order-of-operations answers are right', () => {
  const src = readFileSync(new URL('../src/booklets/grade7Prep.jsx', import.meta.url), 'utf8')
  const block = src.match(/export const ORDER = \[([\s\S]*?)\n\]/)[1]
  const items = [...block.matchAll(/\['([^']+)', (\d+)\]/g)]
  assert.equal(items.length, 12)
  for (const [, expr, ans] of items) {
    const js = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/(\d)²/g, '$1**2')
    assert.equal(Function(`return ${js}`)(), Number(ans), expr)
  }
})
