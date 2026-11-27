import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const { solve, toSlots, matchesPattern, norm, lettersOf } = await import('../src/data/crosswordSolver.js')

test('final letters equal regular letters', () => {
  assert.equal(norm('שלום'), 'שלומ')
  assert.ok(matchesPattern('שלום', toSlots('ש_ו_')))
  assert.ok(matchesPattern('שלום', toSlots('של_ם')))
  assert.ok(matchesPattern('שלום', toSlots('שלומ')))
  assert.ok(matchesPattern('שלומ', toSlots('שלום')))
})
test('length must match and blanks match any letter', () => {
  assert.ok(!matchesPattern('שלום', toSlots('ש_ל')))
  assert.ok(!matchesPattern('שלום', toSlots('ש_ל__')))
  assert.ok(!matchesPattern('שלום', toSlots('ב___ם')))
  assert.ok(matchesPattern('שלום', toSlots(['', '', '', ''])))
})
test('punctuation in dictionary words is ignored', () => {
  assert.equal(lettersOf('בית-ספר'), 'ביתספר')
  assert.ok(matchesPattern('בית-ספר', toSlots('ב_תס_ר')))
})
test('solve: dedupes, ranks clue hits first, handles empty pattern', () => {
  const entries = [['שלום', 'ברכה'], ['שלום', 'ברכה עברית'], ['שלומ', 'x'], ['שלווה', 'שקט'], ['שמיר', 'צמח תבלין'], ['שעון', 'מודד זמן']]
  const r = solve(entries, toSlots('ש___'), 'תבלין')
  assert.equal(r[0].word, 'שמיר')
  assert.equal(r.filter(x => norm(x.word) === 'שלומ').length, 1)
  assert.deepEqual(solve(entries, []), [])
})
test('real dictionaries contain a match for a classic pattern', async () => {
  const mods = await Promise.all(['w2-3', 'w4', 'w5', 'w6-8'].map(f => import(`../src/adults/words/${f}.js`)))
  const all = mods.flatMap(m => m.WORDS)
  assert.ok(all.length > 2000)
  assert.ok(solve(all, toSlots('חיפ_')).some(x => x.word === 'חיפה'))
})
test('solver page is routed, in the sitemap and in search', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  const sm = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  const ss = readFileSync(new URL('../src/data/searchStatic.js', import.meta.url), 'utf8')
  assert.ok(app.includes('path="/tools/crossword-solver"'))
  assert.ok(sm.includes('https://ugabuga.co.il/tools/crossword-solver<'))
  assert.ok(ss.includes("'/tools/crossword-solver'"))
})
