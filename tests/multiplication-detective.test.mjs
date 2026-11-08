import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/learn/MultiplicationDetective.jsx', import.meta.url), 'utf8')
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const table = readFileSync(new URL('../src/learn/MultiplicationTable.jsx', import.meta.url), 'utf8')
const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')

test('detective game is routed, linked and in the sitemap', () => {
  assert.match(app, /path="\/learn\/multiplication-table\/game" element=\{<MultiplicationDetective \/>\}/)
  assert.match(table, /to="\/learn\/multiplication-table\/game"/)
  assert.match(sitemap, /ugabuga\.co\.il\/learn\/multiplication-table\/game</)
})

test('three modes and ten tasks per round', () => {
  for (const id of ['light', 'hunt', 'twins']) assert.match(src, new RegExp(`id: '${id}'`))
  assert.match(src, /const ROUND = 10/)
})

test('round is random only after pressing start (prerender-safe)', () => {
  assert.match(src, /useState\(null\)/)
  assert.doesNotMatch(src, /useState\(\(\) => makeRound/)
})

test('twin products of a 10x10 table each sit in at least two squares', () => {
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
  const count = new Map()
  for (const r of range(1, 10)) for (const c of range(1, 10)) count.set(r * c, (count.get(r * c) || 0) + 1)
  const twins = [...count].filter(([p, n]) => n >= 2 && p > 2)
  assert.ok(twins.length >= 10, 'enough numbers for a round of 10')
  assert.equal(count.get(24), 4)
})
