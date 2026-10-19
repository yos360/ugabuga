// /learn/<subject>/...: lesson data shape, quiz integrity, grade pages and sample exams, the
// concept glossary, and every page reachable (sitemap and search, kept by
// scripts/generate-learn-subjects.mjs).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
const { SUBJECTS, placeQuiz, loadTopics, loadConcepts, topicsForGrade, gradeRange, examQuestions } = await import('../src/learn/subjects/subjects.js')
const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
const search = readFileSync(new URL('../src/data/searchStatic.js', import.meta.url), 'utf8')
const words = s => s.split(/\s+/).filter(Boolean).length
const inSitemap = path => sitemap.includes(`<loc>https://ugabuga.co.il${path}</loc>`)
const MIN_GRADE_TOPICS = 4

test('every data file belongs to a subject', () => {
  const files = new Set(SUBJECTS.flatMap(s => [...s.files, `${s.key}-concepts`]))
  for (const f of readdirSync(new URL('../src/learn/subjects/data/', import.meta.url))) assert.ok(files.has(f.replace(/\.js$/, '')), `${f} is not listed in SUBJECTS[].files`)
})

for (const s of SUBJECTS) {
  const topics = await loadTopics(s.key)
  const concepts = await loadConcepts(s.key)
  test(`${s.key}: lessons are complete and quizzes have one right answer`, () => {
    assert.ok(topics.length >= 12, `${s.key} has ${topics.length} lessons`)
    const slugs = new Set(), titles = new Set(), seo = new Set()
    for (const t of topics) {
      assert.match(t.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, t.slug)
      assert.ok(!/^grade-\d+$/.test(t.slug) && t.slug !== 'concepts', `${t.slug} is a reserved slug`)
      for (const [set, v] of [[slugs, t.slug], [titles, t.title], [seo, t.seoTitle]]) { assert.ok(!set.has(v), `duplicate ${v}`); set.add(v) }
      for (const k of ['title', 'emoji', 'grades', 'seoTitle', 'seoDesc', 'intro']) assert.ok(typeof t[k] === 'string' && t[k].trim(), `${t.slug}.${k}`)
      assert.ok(gradeRange(t.grades).length, `${t.slug}: grades "${t.grades}"`)
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
      placeQuiz(t.slug, t.quiz).forEach((q, i) => assert.equal(q.options[q.answer], t.quiz[i].options[0]))
      assert.equal(t.think.length, 3, t.slug)
      assert.equal(t.faq.length, 3, t.slug)
      for (const r of t.related) assert.ok(topics.some(x => x.slug === r && r !== t.slug), `${t.slug} → ${r}`)
      assert.ok(inSitemap(`/learn/${s.key}/${t.slug}`), `sitemap: ${t.slug}`)
      assert.ok(search.includes(`'/learn/${s.key}/${t.slug}'`), `search: ${t.slug}`)
    }
    assert.ok(inSitemap(`/learn/${s.key}`), `sitemap: ${s.key}`)
    const pos = topics.flatMap(t => placeQuiz(t.slug, t.quiz).map(q => q.answer))
    for (const p of [0, 1, 2, 3]) assert.ok(pos.filter(x => x === p).length >= pos.length / 8, `${s.key}: answers spread (position ${p})`)
  })

  test(`${s.key}: grade pages and sample exams`, () => {
    let live = 0
    for (const g of s.gradeList) {
      const list = topicsForGrade(topics, g)
      const path = `/learn/${s.key}/grade-${g}`
      if (list.length < MIN_GRADE_TOPICS) { assert.ok(!inSitemap(path), `${path} is thin but in the sitemap`); continue }
      live++
      assert.ok(inSitemap(path) && inSitemap(`${path}/exam`), `sitemap: ${path}`)
      const exam = examQuestions(list, 20, 0)
      assert.equal(exam.length, Math.min(20, list.length * 8), path)
      assert.equal(new Set(exam.map(q => q.id)).size, exam.length, `${path}: no repeated question`)
      assert.deepEqual(exam.map(q => q.id), examQuestions(list, 20, 0).map(q => q.id), `${path}: the page's exam is stable`)
      assert.ok(new Set(exam.map(q => q.topic.slug)).size >= Math.min(list.length, 4), `${path}: exam spreads over topics`)
    }
    assert.ok(live >= 2, `${s.key}: only ${live} grade pages`)
  })

  test(`${s.key}: concept glossary`, () => {
    const slugs = new Set()
    for (const c of concepts) {
      assert.match(c.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, c.slug)
      assert.ok(!slugs.has(c.slug), `duplicate concept ${c.slug}`); slugs.add(c.slug)
      for (const k of ['term', 'short', 'seoTitle', 'seoDesc']) assert.ok(typeof c[k] === 'string' && c[k].trim(), `${c.slug}.${k}`)
      assert.ok(c.seoDesc.length >= 70 && c.seoDesc.length <= 170, `${c.slug}: seoDesc ${c.seoDesc.length}`)
      assert.ok(words([c.short, ...c.body, ...c.examples].join(' ')) >= 120, `${c.slug}: too thin`)
      assert.ok(c.examples.length >= 2, c.slug)
      assert.ok(topics.some(t => t.slug === c.lesson), `${c.slug}: lesson ${c.lesson}`)
      assert.equal(c.quiz.length, 3, c.slug)
      for (const q of c.quiz) assert.equal(new Set(q.options.map(o => o.trim())).size, 4, `${c.slug}: ${q.q}`)
      assert.ok(inSitemap(`/learn/${s.key}/concepts/${c.slug}`), `sitemap: concept ${c.slug}`)
    }
    for (const c of concepts) for (const r of c.related) assert.ok(slugs.has(r) && r !== c.slug, `${c.slug} → ${r}`)
    if (concepts.length) assert.ok(inSitemap(`/learn/${s.key}/concepts`))
  })
}
