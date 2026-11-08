import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const { mixedQuiz, QUIZ_META } = await import('../src/learn/multiplicationTable.js')
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
const search = readFileSync(new URL('../src/data/searchStatic.js', import.meta.url), 'utf8')

test('quiz is routed, searchable and in the sitemap', () => {
  assert.match(app, /path="\/learn\/multiplication-table\/quiz" element=\{<MultiplicationQuiz \/>\}/)
  assert.match(sitemap, /ugabuga\.co\.il\/learn\/multiplication-table\/quiz</)
  assert.match(search, /to: '\/learn\/multiplication-table\/quiz'/)
  assert.ok(QUIZ_META.title.length <= 75 && QUIZ_META.description.length <= 200)
})

test('mixed quiz: 20 distinct correct exercises within the range', () => {
  for (const max of [3, 4, 5, 6, 8, 10]) {
    const qs = mixedQuiz(max, 42)
    assert.equal(qs.length, Math.min(20, qs.length))
    assert.equal(new Set(qs.map(q => `${q.a}x${q.b}`)).size, qs.length)
    for (const q of qs) { assert.equal(q.v, q.a * q.b); assert.ok(q.a >= 1 && q.a <= max && q.b >= 1 && q.b <= max) }
  }
  const six = mixedQuiz(6, 7)
  assert.equal(six.length, 20)
  assert.ok(six.every(q => q.a >= 2 && q.b >= 2), 'no trivial x1 once the range reaches 5')
  assert.deepEqual(mixedQuiz(6, 7), six, 'deterministic for a seed (prerender-safe)')
  assert.notDeepEqual(mixedQuiz(6, 8), six)
})
