// Tanakh reading passages (src/learn/subjects/readings/tanakh.js): shape, grades, quiz integrity
// and links to existing Tanakh lessons.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { READINGS } = await import('../src/learn/subjects/readings/tanakh.js')
const { SUBJECT_BY_KEY } = await import('../src/learn/subjects/subjects.js')
const files = new Set([...SUBJECT_BY_KEY.tanakh.files, 'tanakh-gaps'])
const topics = (await Promise.all([...files].map(f => import(`../src/learn/subjects/data/${f}.js`)))).flatMap(m => m.TOPICS || [])
const topicSlugs = new Set(topics.map(t => t.slug))
const words = s => s.split(/\s+/).filter(Boolean).length
// Loose length bands: passages grow with the grade.
const WORDS = { 2: [80, 130], 3: [100, 170], 4: [140, 210], 5: [170, 240], 6: [200, 270], 7: [230, 310], 8: [260, 350], 9: [300, 390] }

test('tanakh readings: unique slugs, grades 2–9, three per grade', () => {
  const slugs = new Set()
  for (const r of READINGS) {
    assert.match(r.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, r.slug)
    assert.ok(!slugs.has(r.slug), `duplicate ${r.slug}`); slugs.add(r.slug)
    assert.ok(Number.isInteger(r.grade) && r.grade >= 2 && r.grade <= 9, `${r.slug}: grade ${r.grade}`)
  }
  for (let g = 2; g <= 9; g++) assert.ok(READINGS.filter(r => r.grade === g).length >= 3, `grade ${g}`)
})

test('tanakh readings: text, questions and answers', () => {
  for (const r of READINGS) {
    for (const k of ['title', 'emoji', 'kind']) assert.ok(typeof r[k] === 'string' && r[k].trim(), `${r.slug}.${k}`)
    assert.ok(Array.isArray(r.text) && r.text.length && r.text.every(p => typeof p === 'string' && p.trim()), `${r.slug}: text`)
    const n = words(r.text.join(' ')), [lo, hi] = WORDS[r.grade]
    assert.ok(n >= lo && n <= hi, `${r.slug}: ${n} words (grade ${r.grade}: ${lo}–${hi})`)
    assert.ok(r.q.length >= 4 && r.q.length <= 5, `${r.slug}: ${r.q.length} questions`)
    for (const [q, options, i] of r.q) {
      assert.ok(typeof q === 'string' && q.trim(), `${r.slug}: question`)
      assert.equal(options.length, 4, `${r.slug}: ${q}`)
      assert.equal(new Set(options.map(o => o.trim())).size, 4, `${r.slug}: distinct options in "${q}"`)
      assert.ok(Number.isInteger(i) && i >= 0 && i <= 3, `${r.slug}: answer index in "${q}"`)
    }
    assert.ok(new Set(r.q.map(x => x[2])).size >= 2, `${r.slug}: right answers in varied positions`)
    assert.ok(r.open.length >= 1, `${r.slug}: open question`)
    for (const o of r.open) assert.ok(o.length === 2 && o.every(x => typeof x === 'string' && x.trim()), `${r.slug}: open [question, answer]`)
  }
  const pos = READINGS.flatMap(r => r.q.map(x => x[2]))
  for (const p of [0, 1, 2, 3]) assert.ok(pos.filter(x => x === p).length >= pos.length / 8, `answers spread (position ${p})`)
})

test('tanakh readings: linked topics exist', () => {
  for (const r of READINGS) if (r.topic != null) assert.ok(topicSlugs.has(r.topic), `${r.slug} → ${r.topic}`)
})
