import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SOCIAL_CARDS, WORD_PROBLEMS, SORTS, VOCAB_TIPS, answerOf, choicesOf } from '../src/data/firstGradeProblemSolving.js'

const PATH = '/classroom/first-grade/problem-solving'

test('social cards each have 2–3 ideas and a question', () => {
  assert.ok(SOCIAL_CARDS.length >= 8)
  assert.equal(new Set(SOCIAL_CARDS.map(c => c.id)).size, SOCIAL_CARDS.length)
  for (const c of SOCIAL_CARDS) {
    assert.ok(c.ideas.length >= 2 && c.ideas.length <= 3, c.id)
    assert.ok(c.title && c.ask && c.emoji, c.id)
  }
})

test('word problems stay within 10, mention their numbers, and offer the answer once among 3 choices', () => {
  WORD_PROBLEMS.forEach((p, i) => {
    const n = answerOf(p)
    assert.ok(n >= 1 && n <= 10, p.id)
    if (p.b > 1) assert.match(p.text, new RegExp(String(p.b)), p.id)
    const ch = choicesOf(p, i)
    assert.equal(ch.length, 3)
    assert.equal(new Set(ch).size, 3)
    assert.equal(ch.filter(x => x === n).length, 1)
    assert.ok(ch.every(x => x >= 0 && x <= 10), p.id)
  })
})

test('every sorting item belongs to one of its sheet bins, and every bin gets items', () => {
  for (const s of SORTS) {
    const bins = new Set(s.bins.map(b => b.id))
    assert.equal(bins.size, 3, s.id)
    for (const it of s.items) assert.ok(bins.has(it.bin), `${s.id}/${it.id}`)
    for (const b of bins) assert.ok(s.items.some(it => it.bin === b), `${s.id}/${b}`)
  }
  assert.ok(VOCAB_TIPS.length >= 5)
})

test('the page is routed, in the sitemap and search, and linked from /classroom/first-grade', () => {
  const read = f => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')
  assert.ok(read('src/App.jsx').includes(`path="${PATH}"`))
  assert.ok(read('public/sitemap-static.xml').includes(`https://ugabuga.co.il${PATH}<`))
  assert.ok(read('src/data/searchStatic.js').includes(`to: '${PATH}'`))
  assert.ok(read('src/pages/ClassOnePrep.jsx').includes(PATH))
})
