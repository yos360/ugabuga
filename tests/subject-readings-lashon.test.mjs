// Lashon reading passages (src/learn/subjects/readings/lashon.js): six per grade ב׳–ט׳, well-formed
// questions, an answer-key open question, lengths that grow with the grade, and topics that exist.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { READINGS } = await import('../src/learn/subjects/readings/lashon.js')
const { SUBJECT_BY_KEY } = await import('../src/learn/subjects/subjects.js')

const files = new Set([...SUBJECT_BY_KEY.lashon.files, 'lashon', 'lashon-more', 'lashon-gaps'])
const topicSlugs = new Set()
for (const f of files) {
  const m = await import(`../src/learn/subjects/data/${f}.js`)
  for (const t of m.TOPICS) topicSlugs.add(t.slug)
}
const words = s => s.split(/\s+/).filter(Boolean).length
const WORDS = { 2: [75, 130], 3: [100, 170], 4: [140, 220], 5: [160, 250], 6: [200, 290], 7: [225, 320], 8: [250, 350], 9: [290, 400] }

test('lashon readings: shape, questions and answers', () => {
  const slugs = new Set()
  for (const r of READINGS) {
    assert.match(r.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, r.slug)
    assert.ok(!slugs.has(r.slug), `duplicate ${r.slug}`); slugs.add(r.slug)
    assert.ok(Number.isInteger(r.grade) && r.grade >= 2 && r.grade <= 9, `${r.slug}: grade ${r.grade}`)
    for (const k of ['title', 'emoji', 'kind']) assert.ok(typeof r[k] === 'string' && r[k].trim(), `${r.slug}.${k}`)
    if (r.topic !== null) assert.ok(topicSlugs.has(r.topic), `${r.slug}: unknown lashon topic ${r.topic}`)
    assert.ok(Array.isArray(r.text) && r.text.length >= 2 && r.text.every(p => typeof p === 'string' && p.trim()), `${r.slug}: text`)
    const n = words(r.text.join(' ')), [lo, hi] = WORDS[r.grade]
    assert.ok(n >= lo && n <= hi, `${r.slug}: ${n} words, grade ${r.grade} wants ${lo}–${hi}`)
    assert.ok(r.q.length >= 4 && r.q.length <= 5, `${r.slug}: ${r.q.length} questions`)
    for (const [q, options, answer] of r.q) {
      assert.ok(q.trim(), r.slug)
      assert.equal(options.length, 4, `${r.slug}: ${q}`)
      assert.equal(new Set(options.map(o => o.trim())).size, 4, `${r.slug}: distinct options in "${q}"`)
      assert.ok(Number.isInteger(answer) && answer >= 0 && answer < 4, `${r.slug}: answer index in "${q}"`)
    }
    assert.ok(r.open.length >= 1 && r.open.length <= 2, `${r.slug}: open questions`)
    for (const [q, a] of r.open) assert.ok(q.trim() && a.trim().length > 10, `${r.slug}: open "${q}"`)
  }
})

test('lashon readings: six per grade, varied answer positions', () => {
  for (let g = 2; g <= 9; g++) assert.equal(READINGS.filter(r => r.grade === g).length, 6, `grade ${g}`)
  const pos = READINGS.flatMap(r => r.q.map(x => x[2]))
  for (const p of [0, 1, 2, 3]) assert.ok(pos.filter(x => x === p).length >= pos.length / 8, `answers spread (position ${p})`)
})
