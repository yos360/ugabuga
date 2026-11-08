// English trivia / riddles / jokes (src/en/fun) and the new English arcade pages: data integrity.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { FUN_PAGES, EN_TRIVIA, EN_RIDDLES, EN_JOKES } = await import('../src/en/fun/catalog.js')
const { BRAIN_PAGES_EN } = await import('../src/en/arcade/brainPagesEn.js')
const { EXTRA } = await import('../src/en/arcade/meta/extra.js')
const { EN_WORD_TOPICS, EN_WORDS, scoreEn, enDailyWord } = await import('../src/en/arcade/games/wordsEn.js')

const pages = [...FUN_PAGES, ...Object.values(BRAIN_PAGES_EN)]

test('unique paths and titles, sane titles and descriptions', () => {
  assert.equal(new Set(pages.map(p => p.path)).size, pages.length)
  assert.equal(new Set(pages.map(p => p.title)).size, pages.length)
  assert.equal(new Set(FUN_PAGES.map(p => p.counterpart)).size, FUN_PAGES.length)
  for (const p of pages) {
    assert.match(p.path, /^\/en\/(trivia|riddles|jokes|brain-games)(\/[a-z0-9-]+)?$/, p.path)
    assert.ok(!p.path.startsWith('/en/games'), p.path)
    assert.ok(p.title.length <= 70, `${p.path} title ${p.title.length}`)
    assert.ok(p.description.length >= 100 && p.description.length <= 165, `${p.path} description ${p.description.length}`)
    assert.ok(p.emoji && p.counterpart.startsWith('/') && !p.counterpart.startsWith('/en'), p.path)
  }
})

test('every trivia question has four distinct options and its answer among them', () => {
  assert.ok(EN_TRIVIA.length >= 40)
  for (const t of EN_TRIVIA) {
    assert.ok(t.questions.length >= 12, t.slug)
    assert.equal(new Set(t.questions.map(q => q.q)).size, t.questions.length, `${t.slug} repeats a question`)
    for (const q of t.questions) {
      assert.equal(q.options.length, 4, q.q)
      assert.equal(new Set(q.options).size, 4, q.q)
      assert.ok(Number.isInteger(q.answer) && q.options[q.answer] !== undefined, q.q)
      assert.ok(q.explain && q.explain.length > 10, q.q)
    }
  }
})

test('riddles and jokes are complete and not repeated', () => {
  const rq = EN_RIDDLES.flatMap(p => p.riddles)
  for (const r of rq) assert.ok(r.q && r.a, JSON.stringify(r))
  assert.equal(new Set(rq.map(r => r.q)).size, rq.length)
  const js = EN_JOKES.flatMap(p => p.jokes)
  for (const j of js) assert.ok(j.setup && j.punchline, JSON.stringify(j))
  assert.equal(new Set(js.map(j => j.setup)).size, js.length)
})

test('new arcade games: copy present, five-letter word list valid', () => {
  for (const [slug, g] of Object.entries(EXTRA)) {
    assert.ok(g.title.length <= 70 && g.description.length <= 160, slug)
    assert.ok(g.how.length && g.tips.length && g.skills.length, slug)
  }
  for (const s of Object.values(EN_WORD_TOPICS)) for (const w of s.split(' ')) assert.match(w, /^[a-z]{5}$/)
  assert.ok(EN_WORDS.length >= 150)
  assert.deepEqual(scoreEn('allot', 'llama'), ['near', 'hit', 'near', 'miss', 'miss'])
  assert.deepEqual(scoreEn('horse', 'horse'), Array(5).fill('hit'))
  assert.ok(EN_WORDS.includes(enDailyWord(20000)))
})
