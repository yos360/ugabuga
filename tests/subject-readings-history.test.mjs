// History reading passages (src/learn/subjects/readings/history.js): shape, quiz integrity and
// links to existing history lessons.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { READINGS } = await import('../src/learn/subjects/readings/history.js')
const { loadTopics } = await import('../src/learn/subjects/subjects.js')
const { TOPICS: GAPS } = await import('../src/learn/subjects/data/history-gaps.js')
const topicSlugs = new Set([...(await loadTopics('history')), ...GAPS].map(t => t.slug))

test('history readings: unique slugs, grades 2–9, three or more per grade', () => {
  const slugs = new Set()
  for (const r of READINGS) {
    assert.match(r.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, r.slug)
    assert.ok(!slugs.has(r.slug), `duplicate ${r.slug}`); slugs.add(r.slug)
    assert.ok(Number.isInteger(r.grade) && r.grade >= 2 && r.grade <= 9, `${r.slug}: grade ${r.grade}`)
    for (const k of ['title', 'emoji', 'kind']) assert.ok(typeof r[k] === 'string' && r[k].trim(), `${r.slug}.${k}`)
    assert.ok(Array.isArray(r.text) && r.text.length >= 2 && r.text.every(p => typeof p === 'string' && p.trim()), `${r.slug}: text`)
  }
  for (let g = 2; g <= 9; g++) assert.ok(READINGS.filter(r => r.grade === g).length >= 3, `grade ${g}`)
})

test('history readings: questions have 4 distinct options and a valid answer', () => {
  for (const r of READINGS) {
    assert.ok(r.q.length >= 4 && r.q.length <= 5, `${r.slug}: ${r.q.length} questions`)
    for (const [q, options, answer] of r.q) {
      assert.ok(typeof q === 'string' && q.trim(), r.slug)
      assert.equal(options.length, 4, `${r.slug}: ${q}`)
      assert.equal(new Set(options.map(o => o.trim())).size, 4, `${r.slug}: distinct options in "${q}"`)
      assert.ok(Number.isInteger(answer) && answer >= 0 && answer < 4, `${r.slug}: answer of "${q}"`)
    }
    assert.ok(r.open.length >= 1, `${r.slug}: open question`)
    for (const [q, a] of r.open) assert.ok(q.trim() && a.trim(), `${r.slug}: open "${q}"`)
  }
  const pos = READINGS.flatMap(r => r.q.map(x => x[2]))
  for (const p of [0, 1, 2, 3]) assert.ok(pos.filter(x => x === p).length >= pos.length / 8, `answers spread (position ${p})`)
})

test('history readings: linked topics exist', () => {
  for (const r of READINGS) if (r.topic != null) assert.ok(topicSlugs.has(r.topic), `${r.slug} → ${r.topic}`)
})
