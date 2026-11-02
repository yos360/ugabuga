import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// The two arithmetic booklets derive their answers from their data; check the data stays in range.
const read = f => readFileSync(new URL(`../src/booklets/${f}`, import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const line = (src, name) => src.match(new RegExp(`export const ${name} = (.*)$`, 'm'))[1]
const tuples = (src, name) => [...line(src, name).matchAll(/\[(\d+), (\d+)(?:, (\d+))?\]/g)].map(m => m.slice(1).filter(Boolean).map(Number))

test('age 4–5 booklet stays inside 10 and the pictures match the numbers', () => {
  const src = read('mathAge4.jsx')
  for (const [a, b] of [...[...line(src, 'PICS5').matchAll(/'[^']+', (\d+), (\d+)/g)].map(m => [+m[1], +m[2]])]) assert.ok(a + b <= 5 && a >= 1 && b >= 1)
  for (const m of line(src, 'PICS10').matchAll(/'[^']+', (\d+), (\d+)/g)) assert.ok(+m[1] + +m[2] <= 10)
  for (const m of line(src, 'TAKE').matchAll(/'[^']+', (\d+), (\d+)/g)) assert.ok(+m[2] < +m[1] && +m[1] <= 8)
  for (const m of line(src, 'COUNT10').matchAll(/'[^']+', (\d+)/g)) assert.ok(+m[1] >= 6 && +m[1] <= 10)
  for (const m of line(src, 'COUNT5').matchAll(/'[^']+', (\d+)/g)) assert.ok(+m[1] >= 1 && +m[1] <= 5)
  for (const [t, k] of tuples(src, 'COMPLETE')) assert.ok((t === 5 || t === 10) && k >= 1 && k < t)
  for (const m of line(src, 'MORE_LESS').matchAll(/'[^']+', (\d+), (\d+)/g)) assert.notEqual(m[1], m[2])
  const first = [...line(src, 'FIRST').matchAll(/\[(\d), (\d), '(.)'\]/g)]
  assert.equal(first.length, 12)
  for (const [, a, b, o] of first) assert.ok(o === '+' ? +a + +b <= 5 : +b < +a && +a <= 5)
})

test('grade 1 booklet stays inside 20 and crossing ten is right', () => {
  const src = read('mathGrade1.jsx')
  for (const [a, b] of tuples(src, 'ADD20')) assert.ok(a + b <= 20)
  for (const [a, b] of tuples(src, 'SUB10')) assert.ok(a <= 10 && b <= a)
  for (const [a, b] of tuples(src, 'SUB_NO_CROSS')) assert.ok(a > 10 && a <= 20 && b < 10 && a % 10 >= b, `${a}-${b}`)
  for (const [a, b] of tuples(src, 'SUB_CROSS')) assert.ok(a > 10 && a < 20 && b < 10 && a % 10 < b, `${a}-${b}`)
  for (const [a, b] of tuples(src, 'COMPARE')) assert.ok(a <= 20 && b <= 20)
  for (const [a, b] of tuples(src, 'FAMILIES')) assert.ok(a + b <= 20 && a < b + 5)
  for (const [a, b, c] of tuples(src, 'SUM_VS_NUMBER')) assert.ok(a + b <= 20 && c <= 20)
  for (const m of line(src, 'GROUPS').matchAll(/'[^']+', (\d+), (\d+)/g)) assert.ok(+m[1] <= 20 && +m[2] <= 20)
})
