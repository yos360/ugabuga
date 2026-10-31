import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// The word-problems booklet builds its answers from its data; check the data is well-formed.
const src = readFileSync(new URL('../src/booklets/wordProblemsSpecialEd.jsx', import.meta.url), 'utf8')
const block = name => src.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\n\\](?:\\n|$)`))[1]
const rows = name => [...block(name).matchAll(/^\s*\[(.*)\],?$/gm)].map(m => m[1])

test('story problems state their numbers and stay within 10', () => {
  for (const [name, op] of [['ADD_A', '+'], ['ADD_B', '+'], ['SUB_A', '−'], ['SUB_B', '−'], ['MIXED', null]]) {
    const list = rows(name)
    assert.equal(list.length, 4, name)
    for (const r of list) {
      const m = r.match(/^'([^']+)', '([^']+)', '[^']+', (\d+), (\d+)(?:, '(.)')?$/)
      assert.ok(m, r)
      const [, story, , a, b, o] = m, sign = op || o
      assert.ok(story.includes(a) && story.includes(b), story)
      assert.ok(+a <= 10 && +b >= 1 && (sign === '+' ? +a + +b <= 10 : +b < +a), story)
    }
  }
})

test('operation, equation and comparison data are consistent', () => {
  assert.equal([...block('CHOOSE_OP').matchAll(/\['[^']+', '[+−]'\]/g)].length, 6)
  for (const r of rows('EQUATION')) {
    const [, s, a, b, op] = r.match(/^'([^']+)', (\d+), (\d+), '(.)'$/)
    assert.ok(s.includes(a) && s.includes(b), s)
    assert.ok(op === '+' ? +a + +b <= 10 : +b < +a, s)
  }
  for (const r of rows('TO_TEN')) { const k = +r.match(/(\d+)\]?$/)[1]; assert.ok(k >= 5 && k <= 9, r) }
  for (const r of rows('COMPARE')) { const c = [...r.matchAll(/\['[^']+', (\d+)\]/g)].map(m => +m[1]); assert.equal(c.length, 2); assert.notEqual(c[0], c[1]); assert.ok(Math.max(...c) <= 10) }
  for (const r of rows('DRAW')) { const m = r.match(/, (\d+), (\d+), '(.)'\]?$/); assert.ok(m[3] === '+' ? +m[1] + +m[2] <= 10 : +m[2] < +m[1]) }
})
