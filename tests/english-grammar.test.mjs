import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { GRAMMAR_TOPICS, GRAMMAR_BANDS } from '../src/data/englishGrammar.js'

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('english grammar: unique slugs and every band has lessons', () => {
  const slugs = GRAMMAR_TOPICS.map(t => t.slug)
  assert.equal(new Set(slugs).size, slugs.length, 'duplicate slug')
  for (const s of slugs) assert.match(s, /^[a-z0-9-]+$/, s)
  assert.ok(GRAMMAR_TOPICS.length >= 24, `only ${GRAMMAR_TOPICS.length} topics`)
  for (const b of GRAMMAR_BANDS) assert.ok(GRAMMAR_TOPICS.filter(t => t.band === b.id).length >= 3, `${b.id}: too few topics`)
  for (const t of GRAMMAR_TOPICS) assert.ok(GRAMMAR_BANDS.some(b => b.id === t.band), `${t.slug}: unknown band ${t.band}`)
})

test('english grammar: every topic has an explanation, mistakes, worksheet drill and FAQ', () => {
  for (const t of GRAMMAR_TOPICS) {
    for (const k of ['title', 'en', 'emoji', 'rule', 'seoTitle', 'seoDesc', 'intro']) assert.ok(t[k]?.trim(), `${t.slug}: missing ${k}`)
    assert.ok(t.blocks.length >= 2, `${t.slug}: explanation needs at least 2 blocks`)
    for (const b of t.blocks) {
      assert.ok(b.h?.trim(), `${t.slug}: block without a heading`)
      assert.ok(b.p?.length || b.table || b.ex?.length, `${t.slug}: empty block "${b.h}"`)
      if (b.table) for (const r of b.table.rows) assert.equal(r.length, b.table.head.length, `${t.slug}: table row width in "${b.h}"`)
    }
    assert.ok(t.mistakes.length >= 3, `${t.slug}: at least 3 common mistakes`)
    for (const m of t.mistakes) assert.ok(m.length === 3 && m.every(x => x.trim()), `${t.slug}: mistake needs wrong, right, why`)
    assert.ok(t.drill.length >= 6, `${t.slug}: worksheet needs at least 6 fill-ins`)
    for (const [s, a] of t.drill) { assert.match(s, /___/, `${t.slug}: drill without a blank`); assert.ok(a.trim(), `${t.slug}: drill without answer`) }
    assert.ok(t.faq.length >= 3, `${t.slug}: at least 3 FAQ`)
    for (const f of t.faq) assert.ok(f.q.trim() && f.a.trim(), `${t.slug}: empty FAQ`)
  }
})

test('english grammar: quizzes have 10–15 valid multiple-choice questions with explanations', () => {
  for (const t of GRAMMAR_TOPICS) {
    assert.ok(t.quiz.length >= 10 && t.quiz.length <= 15, `${t.slug}: ${t.quiz.length} questions`)
    t.quiz.forEach((q, i) => {
      const id = `${t.slug} #${i + 1}`
      assert.ok(q.s.trim() || q.p.trim(), `${id}: no question text`)
      if (!q.s.includes('___') && !q.p) assert.fail(`${id}: a sentence without a blank needs a Hebrew prompt`)
      assert.equal(q.options.length, 4, `${id}: needs 4 options`)
      assert.equal(new Set(q.options.map(o => o.trim().toLowerCase())).size, 4, `${id}: options must be distinct`)
      for (const o of q.options) assert.ok(o.trim(), `${id}: empty option`)
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, `${id}: bad answer index`)
      assert.ok(q.exp?.trim(), `${id}: missing explanation`)
    })
    // the correct option is spread over positions, not always first
    assert.ok(new Set(t.quiz.map(q => q.answer)).size >= 2, `${t.slug}: answers all in one position`)
  }
})

test('english grammar: routed, lazy-loaded and linked from the English pages', () => {
  const app = read('src/App.jsx')
  assert.match(app, /path="\/learn\/english-grammar"/)
  assert.match(app, /path="\/learn\/english-grammar\/:slug"/)
  assert.match(app, /lazy\(\(\) => import\('\.\/learn\/englishGrammar\/EnglishGrammarPages'\)/)
  assert.doesNotMatch(app, /^import .*englishGrammar/m, 'grammar pages must not be in the entry bundle')
  assert.match(read('src/pages/english/EnglishPages.jsx'), /\/learn\/english-grammar/)
  assert.match(read('src/data/landingPages.js'), /\/learn\/english-grammar/)
})
