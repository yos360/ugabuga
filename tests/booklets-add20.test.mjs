import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// The add-to-20 booklet derives answers from its data; check the data stays inside 20 and is well-formed.
const src = readFileSync(new URL('../src/booklets/mathAdd20.jsx', import.meta.url), 'utf8')
const pairs = name => [...src.match(new RegExp(`export const ${name} = \\[([^\\n]*)\\]`))[1].matchAll(/\[(\d+), (\d+)\]/g)].map(m => [+m[1], +m[2]])

test('add-to-20 exercises stay within 20', () => {
  for (const name of ['WARM', 'NO_CROSS', 'CROSS', 'DOUBLES']) {
    const list = pairs(name)
    assert.ok(list.length >= 12, name)
    for (const [a, b] of list) assert.ok(a + b <= (name === 'WARM' ? 10 : 20) && a >= 1 && b >= 1, `${name} ${a}+${b}`)
  }
  for (const [a, b] of pairs('CROSS')) assert.ok(a + b > 10 && a < 10 && b < 10, `cross ${a}+${b}`)
  for (const [a, t] of pairs('TO_TEN')) assert.ok(t === 10 && a <= 10)
  for (const [a, t] of pairs('TO_TWENTY')) assert.ok(t === 20 && a < 20)
  for (const [a, b] of pairs('FRAMES')) assert.ok(a <= 10 && b <= 10 && a + b > 10 && a + b <= 20)
  for (const [a, b] of pairs('LINE')) assert.ok(a + b <= 20)
})
