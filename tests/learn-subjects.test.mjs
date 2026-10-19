// /learn/<subject>/<topic>: lesson data shape, quiz integrity, and every page reachable (sitemap,
// search, middleware family).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const { SUBJECTS, placeQuiz } = await import('../src/learn/subjects/subjects.js')
const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
const search = readFileSync(new URL('../src/data/searchStatic.js', import.meta.url), 'utf8')
const words = s => s.split(/\s+/).filter(Boolean).length

for (const s of SUBJECTS) {
  const { TOPICS } = await import(`../src/learn/subjects/data/${s.key}.js`)
  test(`${s.key}: lessons are complete and quizzes have one right answer`, () => {
    assert.ok(TOPICS.length >= 12, `${s.key} has ${TOPICS.length} lessons`)
    const slugs = new Set(), titles = new Set(), seo = new Set()
    for (const t of TOPICS) {
      assert.match(t.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, t.slug)
      for (const [set, v] of [[slugs, t.slug], [titles, t.title], [seo, t.seoTitle]]) { assert.ok(!set.has(v), `duplicate ${v}`); set.add(v) }
      for (const k of ['title', 'emoji', 'grades', 'seoTitle', 'seoDesc', 'intro']) assert.ok(typeof t[k] === 'string' && t[k].trim(), `${t.slug}.${k}`)
      assert.ok(t.seoDesc.length >= 80 && t.seoDesc.length <= 170, `${t.slug}: seoDesc ${t.seoDesc.length} chars`)
      assert.ok(t.sections.length >= 3, t.slug)
      const body = t.sections.flatMap(x => [x.h, ...x.p]).join(' ')
      assert.ok(words(body) >= 300, `${t.slug}: ${words(body)} words — lessons must not be thin`)
      assert.ok(t.facts.length >= 4, t.slug)
      assert.equal(t.quiz.length, 8, t.slug)
      for (const q of t.quiz) {
        assert.equal(q.options.length, 4, `${t.slug}: ${q.q}`)
        assert.equal(new Set(q.options.map(o => o.trim())).size, 4, `${t.slug}: distinct options in "${q.q}"`)
        assert.ok(q.exp && q.exp.length > 10, `${t.slug}: explanation for "${q.q}"`)
      }
      // placement keeps the written-first correct option as the marked answer
      placeQuiz(t.slug, t.quiz).forEach((q, i) => assert.equal(q.options[q.answer], t.quiz[i].options[0]))
      assert.equal(t.think.length, 3, t.slug)
      assert.equal(t.faq.length, 3, t.slug)
      for (const r of t.related) assert.ok(TOPICS.some(x => x.slug === r && r !== t.slug), `${t.slug} → ${r}`)
      assert.ok(sitemap.includes(`/learn/${s.key}/${t.slug}</loc>`), `sitemap: ${t.slug}`)
      assert.ok(search.includes(`'/learn/${s.key}/${t.slug}'`), `search: ${t.slug}`)
    }
    assert.ok(sitemap.includes(`/learn/${s.key}</loc>`), `sitemap: ${s.key}`)
    const pos = TOPICS.flatMap(t => placeQuiz(t.slug, t.quiz).map(q => q.answer))
    for (const p of [0, 1, 2, 3]) assert.ok(pos.filter(x => x === p).length >= pos.length / 8, `${s.key}: answers spread (position ${p})`)
  })
}

