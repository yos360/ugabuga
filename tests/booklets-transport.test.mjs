import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// The transport booklet builds its answers from its data; check the data is well-formed.
const src = readFileSync(new URL('../src/booklets/transport.jsx', import.meta.url), 'utf8')
const block = name => src.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\n(?:export|//|const|function)`))[1]

test('transport booklet data stays in range', () => {
  for (const m of block('COUNT').matchAll(/, (\d+)\]/g)) assert.ok(+m[1] >= 2 && +m[1] <= 8)
  const q = [...block('QUANTITY').matchAll(/, (\d+)\]/g)].map(m => +m[1])
  assert.deepEqual(q, [1, 2, 3, 4, 5, 6])
  for (const m of block('SEQ').matchAll(/\[(\d+), (\d+)\]/g)) assert.ok(+m[1] + 4 <= 10 && +m[2] >= 0 && +m[2] <= 4)
  for (const m of block('ADD').matchAll(/, (\d+), (\d+)\]/g)) assert.ok(+m[1] + +m[2] <= 10 && +m[1] >= 1 && +m[2] >= 1)
  for (const m of block('FIRST').matchAll(/\['([^']+)', '(.)', '(.)', '(.)'\]/g)) assert.ok(new Set([m[2], m[3], m[4]]).size === 3, m[1])
  for (const m of block('M_WORDS').matchAll(/\['([^']+)'/g)) assert.ok(m[1].startsWith('מ'), m[1])
})
