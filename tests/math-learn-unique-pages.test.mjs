// Thin-page guard for /math and /learn/multiplication-table/of/:n: sibling pages must carry text
// of their own (curriculum placement, prerequisites, solved samples, computed number facts), so
// Google doesn't fold them together as near-duplicates.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { KINDERGARTEN, GRADES, topicsFor, findTopic } from '../src/math/registry.js'
import { topicContext, sampleExercises, gradeChapters, testSampleItems } from '../src/math/pageContent.js'
import { TOPIC_UNITS, GRADE_PROGRAM } from '../src/math/curriculum.js'
import { MT_NUMBERS, numberFacts } from '../src/learn/multiplicationTable.js'

const allTopics = [KINDERGARTEN, ...GRADES].flatMap(g => topicsFor(g.n))
const words = s => String(s).split(/\s+/).filter(Boolean).length
const pageText = t => {
  const c = topicContext(t)
  return [c.summary, c.unitText, ...c.faq.flatMap(f => [f.q, f.a]), ...sampleExercises(t).flatMap(s => [s.ex.q, s.ex.expr || '', String(s.ex.answer), s.ex.explain || ''])].join(' ')
}

test('every curriculum entry points at a real topic and a real chapter', () => {
  for (const [key, u] of Object.entries(TOPIC_UNITS)) {
    const [g, slug] = key.split('/')
    assert.ok(findTopic(Number(g), slug), `unknown topic ${key}`)
    if (u.ch) assert.ok(GRADE_PROGRAM[g]?.chapters[u.ch], `unknown chapter ${u.ch} for ${key}`)
    assert.ok(u.ch || u.note, `${key} has neither chapter nor note`)
  }
})

test('every grade 1–12 topic is placed in the curriculum except a short, known list', () => {
  const missing = allTopics.filter(t => t.grade > 0 && !TOPIC_UNITS[`${t.grade}/${t.slug}`]).map(t => `${t.grade}/${t.slug}`)
  assert.ok(missing.length <= 5, `unplaced: ${missing.join(', ')}`)
})

test('topic pages: generated text is long enough and differs between siblings', () => {
  const seen = new Map()
  for (const t of allTopics) {
    const text = pageText(t)
    assert.ok(words(text) >= 40, `${t.grade}/${t.slug}: only ${words(text)} generated words`)
    const c = topicContext(t)
    assert.ok(!seen.has(c.summary), `${t.grade}/${t.slug} summary duplicates ${seen.get(c.summary)}`)
    seen.set(c.summary, `${t.grade}/${t.slug}`)
  }
  const a = pageText(findTopic(4, 'order-of-operations')), b = pageText(findTopic(4, 'long-division'))
  assert.notEqual(a, b)
})

test('solved samples: one per level, deterministic, with an answer', () => {
  for (const t of allTopics) {
    const s1 = sampleExercises(t), s2 = sampleExercises(t)
    assert.equal(s1.length, t.levels.length)
    s1.forEach((s, i) => {
      assert.equal(JSON.stringify(s.ex), JSON.stringify(s2[i].ex), `${t.slug} sample ${i + 1} not deterministic`)
      assert.ok(s.ex.answer !== undefined && s.ex.answer !== '', `${t.slug} sample ${i + 1} has no answer`)
    })
  }
})

test('prerequisite and follow-up links stay within reach and never point to the page itself', () => {
  for (const t of allTopics) {
    const c = topicContext(t)
    for (const x of [c.prev, c.next].filter(Boolean)) {
      assert.ok(x.topics.length >= 1 && x.topics.length <= 4)
      assert.ok(Math.abs(x.grade.n - t.grade) <= 2)
      assert.ok(!x.topics.includes(t))
    }
  }
  const p = topicContext(findTopic(4, 'order-of-operations')).prev
  assert.equal(p.topics[0].slug, 'order-of-operations-3', 'the same topic one grade down comes first')
})

test('grade chapters and test samples', () => {
  const g4 = gradeChapters(4)
  assert.ok(g4.chapters.some(c => c.topics.some(t => t.slug === 'long-division')))
  assert.equal(gradeChapters(0), null)
  for (const g of GRADES) {
    const s = testSampleItems(g.n)
    assert.ok(s.length >= 6, `grade ${g.n} test sample`)
    assert.equal(JSON.stringify(s.map(x => x.ex)), JSON.stringify(testSampleItems(g.n).map(x => x.ex)))
  }
})

test('multiplication-table number pages get distinct computed facts', () => {
  const sigs = new Set()
  for (const n of MT_NUMBERS) {
    const f = numberFacts(n)
    assert.equal(f.multiples.length, Math.floor(100 / n))
    assert.ok(f.multiples.every(m => m % n === 0 && m <= 100))
    assert.equal(f.square, n * n)
    assert.equal(f.even, f.row.filter(x => x.v % 2 === 0).length)
    if (n <= 10) assert.equal(f.newFacts.length, 11 - n)
    sigs.add(JSON.stringify([f.units, f.multiples, f.newFacts]))
  }
  assert.equal(sigs.size, MT_NUMBERS.length)
  assert.equal(numberFacts(7).distinctUnits, 10) // 7, 4, 1, 8, 5, 2, 9, 6, 3, 0
  assert.equal(numberFacts(5).distinctUnits, 2)
})
