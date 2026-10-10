// Trivia with answers (/trivia/with-answers + one page per section): data integrity.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const {
  TRIVIA_WA_SECTIONS, TRIVIA_WA_HUB, TRIVIA_WA_BASE, allTriviaQuestions, triviaWithAnswersPaths, sectionById, sectionPath, questionId, questionShareText,
} = await import('../src/data/content/triviaWithAnswers.js')
// trivia.js uses extensionless imports, so load its four topic files directly.
const TRIVIA_TOPICS = (await Promise.all([1, 2, 3, 4].map(n => import(`../src/data/content/trivia${n}.js`)))).flatMap((m, i) => m[`TRIVIA_${i + 1}`])

const norm = s => s.replace(/[\s?״"׳'—–\-.,:!]/g, '')

test('8 sections with the expected ids, each with at least 15 questions', () => {
  assert.deepEqual(TRIVIA_WA_SECTIONS.map(s => s.id), ['kids-easy', 'kids-advanced', 'family', 'general', 'israel', 'science', 'sports', 'geography'])
  for (const s of TRIVIA_WA_SECTIONS) {
    assert.match(s.id, /^[a-z]+(-[a-z]+)*$/)
    assert.ok(s.questions.length >= 15, `${s.id}: ${s.questions.length}`)
  }
  const total = allTriviaQuestions().length
  assert.ok(total >= 120 && total <= 170, `total ${total}`)
  assert.equal(total, TRIVIA_WA_SECTIONS.reduce((n, s) => n + s.questions.length, 0))
})

test('every question has a question, an answer and a one-line fact', () => {
  for (const q of allTriviaQuestions()) {
    for (const f of ['q', 'a', 'fact']) assert.ok(typeof q[f] === 'string' && q[f].trim().length > 0, `${q.id} ${f}`)
    assert.ok(q.q.trim().endsWith('?'), `${q.id} ends with ?`)
    assert.ok(q.fact.length <= 140, `${q.id} fact is short`)
    assert.ok(!q.fact.includes('\n') && q.a.length <= 60, `${q.id} answer/fact compact`)
  }
})

test('questions are unique, across all sections', () => {
  const all = allTriviaQuestions()
  assert.equal(new Set(all.map(q => norm(q.q))).size, all.length)
  assert.equal(new Set(all.map(q => q.id)).size, all.length)
})

test('page metadata: unique titles, h1s and descriptions of SEO length, plus FAQ', () => {
  const pages = [TRIVIA_WA_HUB, ...TRIVIA_WA_SECTIONS]
  for (const k of ['title', 'h1', 'description']) assert.equal(new Set(pages.map(p => p[k])).size, pages.length, `unique ${k}`)
  for (const p of pages) {
    assert.ok(p.description.length >= 120 && p.description.length <= 160, `${p.id || 'hub'} description ${p.description.length}`)
    assert.ok(!/UGABUGA/.test(p.title), 'SEO adds the site name')
    assert.ok(p.faq.length >= 2 && p.faq.every(f => f.q && f.a))
  }
  for (const s of TRIVIA_WA_SECTIONS) for (const k of ['label', 'emoji', 'audience', 'intro']) assert.ok(s[k], `${s.id} ${k}`)
})

test('paths helper lists the hub and every section page', () => {
  const paths = triviaWithAnswersPaths()
  assert.equal(paths[0], TRIVIA_WA_BASE)
  assert.equal(paths.length, TRIVIA_WA_SECTIONS.length + 1)
  assert.equal(new Set(paths).size, paths.length)
  for (const s of TRIVIA_WA_SECTIONS) {
    assert.ok(paths.includes(`/trivia/with-answers/${s.id}`))
    assert.equal(sectionPath(s.id), `/trivia/with-answers/${s.id}`)
    assert.equal(sectionById(s.id), s)
  }
  assert.equal(sectionById('nope'), undefined)
})

test('no clash with the existing /trivia/:slug topics', () => {
  assert.ok(!TRIVIA_TOPICS.some(t => t.slug === 'with-answers'))
})

test('the WhatsApp text shares the question but never the answer', () => {
  for (const s of TRIVIA_WA_SECTIONS) s.questions.forEach((q, i) => {
    const text = questionShareText(q)
    assert.ok(text.includes(q.q))
    assert.ok(!text.includes(q.fact))
    assert.match(questionId(s.id, i), new RegExp(`^${s.id}-${i + 1}$`))
  })
})
