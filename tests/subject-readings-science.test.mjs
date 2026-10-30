// Science reading passages (src/learn/subjects/readings/science.js): shape, grades 2–9, questions
// with one valid answer, open questions, length growing with the grade, and topic links that exist.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { READINGS } = await import('../src/learn/subjects/readings/science.js')
const { SUBJECT_BY_KEY } = await import('../src/learn/subjects/subjects.js')
const files = [...new Set([...SUBJECT_BY_KEY.science.files, 'science-gaps'])]
const topics = (await Promise.all(files.map(f => import(`../src/learn/subjects/data/${f}.js`)))).flatMap(m => m.TOPICS || [])
const topicSlugs = new Set(topics.map(t => t.slug))
const words = s => s.split(/\s+/).filter(Boolean).length
// Loose word ranges per grade (the target is ≈90–120 in ב׳ up to ≈300–380 in ט׳).
const WORDS = { 2: [75, 140], 3: [100, 180], 4: [140, 230], 5: [160, 280], 6: [200, 330], 7: [230, 380], 8: [260, 420], 9: [290, 460] }

test('science readings: unique slugs and every grade 2–9 covered', () => {
  const slugs = new Set()
  for (const r of READINGS) {
    assert.match(r.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, r.slug)
    assert.ok(!slugs.has(r.slug), `duplicate slug ${r.slug}`); slugs.add(r.slug)
    assert.ok(Number.isInteger(r.grade) && r.grade >= 2 && r.grade <= 9, `${r.slug}: grade ${r.grade}`)
  }
  for (let g = 2; g <= 9; g++) assert.ok(READINGS.filter(r => r.grade === g).length >= 3, `grade ${g} has fewer than 3 readings`)
})

test('science readings: complete passages with valid questions', () => {
  for (const r of READINGS) {
    for (const k of ['title', 'emoji', 'kind']) assert.ok(typeof r[k] === 'string' && r[k].trim(), `${r.slug}.${k}`)
    assert.ok(Array.isArray(r.text) && r.text.length >= 2 && r.text.every(p => typeof p === 'string' && p.trim()), `${r.slug}: text`)
    const n = words(r.text.join(' ')), [lo, hi] = WORDS[r.grade]
    assert.ok(n >= lo && n <= hi, `${r.slug}: ${n} words (grade ${r.grade} expects ${lo}–${hi})`)
    assert.ok(r.q.length >= 4 && r.q.length <= 5, `${r.slug}: ${r.q.length} questions`)
    for (const [q, options, ans] of r.q) {
      assert.ok(typeof q === 'string' && q.trim(), `${r.slug}: question text`)
      assert.equal(options.length, 4, `${r.slug}: ${q}`)
      assert.equal(new Set(options.map(o => o.trim())).size, 4, `${r.slug}: distinct options in "${q}"`)
      assert.ok(Number.isInteger(ans) && ans >= 0 && ans < 4, `${r.slug}: answer index in "${q}"`)
    }
    assert.ok(Array.isArray(r.open) && r.open.length >= 1 && r.open.length <= 2, `${r.slug}: open questions`)
    for (const [q, a] of r.open) assert.ok(q.trim() && a.trim().length > 20, `${r.slug}: open question and model answer`)
  }
})

test('science readings: answers spread over positions', () => {
  const pos = READINGS.flatMap(r => r.q.map(x => x[2]))
  for (const p of [0, 1, 2, 3]) assert.ok(pos.filter(x => x === p).length >= pos.length / 8, `position ${p} is rarely the answer`)
})

test('science readings: topic links point to science lessons', () => {
  for (const r of READINGS) {
    assert.ok(r.topic === null || topicSlugs.has(r.topic), `${r.slug}: unknown topic ${r.topic}`)
  }
})
