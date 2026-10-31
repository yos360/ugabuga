// Civics reading passages (src/learn/subjects/readings/civics.js): shape, grade range, one right
// answer per question, and every linked topic is a real civics lesson.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { READINGS } = await import('../src/learn/subjects/readings/civics.js')
const base = await import('../src/learn/subjects/data/civics.js')
const more = await import('../src/learn/subjects/data/civics-more.js')
const topicSlugs = new Set([...base.TOPICS, ...more.TOPICS].map(t => t.slug))
const words = s => s.split(/\s+/).filter(Boolean).length

test('civics readings: shape and answers', () => {
  const slugs = new Set()
  for (const r of READINGS) {
    assert.match(r.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, r.slug)
    assert.ok(!slugs.has(r.slug), `duplicate ${r.slug}`); slugs.add(r.slug)
    assert.ok(Number.isInteger(r.grade) && r.grade >= 4 && r.grade <= 9, `${r.slug}: grade ${r.grade}`)
    for (const k of ['title', 'emoji', 'kind']) assert.ok(typeof r[k] === 'string' && r[k].trim(), `${r.slug}.${k}`)
    if (r.topic !== null) assert.ok(topicSlugs.has(r.topic), `${r.slug}: unknown topic ${r.topic}`)
    assert.ok(Array.isArray(r.text) && r.text.length >= 3 && r.text.every(p => typeof p === 'string' && p.trim()), `${r.slug}: text`)
    assert.ok(r.q.length >= 4 && r.q.length <= 5, `${r.slug}: ${r.q.length} questions`)
    for (const [question, options, answer] of r.q) {
      assert.ok(question.trim(), r.slug)
      assert.equal(options.length, 4, `${r.slug}: ${question}`)
      assert.equal(new Set(options.map(o => o.trim())).size, 4, `${r.slug}: distinct options in "${question}"`)
      assert.ok(Number.isInteger(answer) && answer >= 0 && answer < 4, `${r.slug}: index in "${question}"`)
    }
    assert.ok(r.open.length >= 1 && r.open.length <= 2, `${r.slug}: open questions`)
    for (const [question, model] of r.open) assert.ok(question.trim() && model.trim().length > 20, `${r.slug}: open "${question}"`)
  }
})

test('civics readings: six per grade, longer as grades rise, answers spread', () => {
  const avg = g => { const list = READINGS.filter(r => r.grade === g); return list.reduce((n, r) => n + words(r.text.join(' ')), 0) / list.length }
  for (let g = 4; g <= 9; g++) assert.equal(READINGS.filter(r => r.grade === g).length, 6, `grade ${g}`)
  for (let g = 5; g <= 9; g++) assert.ok(avg(g) > avg(g - 1), `grade ${g} passages should be longer than grade ${g - 1}`)
  const pos = READINGS.flatMap(r => r.q.map(q => q[2]))
  for (const p of [0, 1, 2, 3]) assert.ok(pos.filter(x => x === p).length >= pos.length / 8, `answer position ${p} is rare`)
})
