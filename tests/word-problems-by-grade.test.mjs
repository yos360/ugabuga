import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { GRADES, METHOD, FAQ, gradeBySlug } from '../src/data/wordProblemsByGrade.js'

const calc = e => Function(`return (${e.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')})`)()

test('every worked step is arithmetically correct and ends at the answer', () => {
  for (const g of GRADES) for (const q of g.problems) {
    for (const s of q.steps) assert.equal(calc(s.e), s.r, `${q.id}: ${s.e}`)
    assert.equal(q.steps.at(-1).r, q.answer, `${q.id}: last step is the answer`)
    assert.ok(Number.isInteger(q.answer) && q.answer > 0, q.id)
    assert.ok(q.sentence.includes(q.answer.toLocaleString('en-US')), `${q.id}: answer sentence mentions the answer`)
  }
})

test('ids are unique, 12 problems per grade in three levels', () => {
  const ids = GRADES.flatMap(g => g.problems.map(q => q.id))
  assert.equal(new Set(ids).size, ids.length)
  for (const g of GRADES) {
    assert.equal(g.problems.length, 12)
    for (const l of [1, 2, 3]) assert.equal(g.problems.filter(q => q.level === l).length, 4, `${g.slug} level ${l}`)
    assert.equal(gradeBySlug(g.slug), g)
    const answers = g.problems.map(q => q.answer)
    assert.equal(new Set(answers).size, answers.length, `${g.slug}: answers differ`)
  }
  assert.equal(METHOD.length, 4)
  assert.ok(FAQ.length >= 3)
})

test('pages are routed, in the sitemap and searchable', () => {
  const app = readFileSync('src/App.jsx', 'utf8'), map = readFileSync('public/sitemap-static.xml', 'utf8'), search = readFileSync('src/data/searchStatic.js', 'utf8')
  assert.ok(app.includes('path="/math/word-problems/:gradeSlug"'))
  for (const p of ['/math/word-problems', ...GRADES.map(g => `/math/word-problems/${g.slug}`)]) {
    assert.ok(map.includes(`https://ugabuga.co.il${p}</loc>`), p)
    assert.ok(search.includes(`to: '${p}'`), p)
  }
})
