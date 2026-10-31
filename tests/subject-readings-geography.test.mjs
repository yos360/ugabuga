// Geography reading passages (src/learn/subjects/readings/geography.js): shape, grades 2–9,
// questions with four distinct options and a valid answer, an open question, and topic links
// that point at real geography lessons.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { READINGS } = await import('../src/learn/subjects/readings/geography.js')
const lessons = (await Promise.all(['geography', 'geography-more'].map(f => import(`../src/learn/subjects/data/${f}.js`)))).flatMap(m => m.TOPICS)
const lessonSlugs = new Set(lessons.map(t => t.slug))
const words = s => s.split(/\s+/).filter(Boolean).length

test('geography readings: unique slugs and complete fields', () => {
  const slugs = new Set()
  for (const r of READINGS) {
    assert.match(r.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, r.slug)
    assert.ok(!slugs.has(r.slug), `duplicate ${r.slug}`); slugs.add(r.slug)
    for (const k of ['title', 'emoji', 'kind']) assert.ok(typeof r[k] === 'string' && r[k].trim(), `${r.slug}.${k}`)
    assert.ok(Array.isArray(r.text) && r.text.length >= 2 && r.text.every(p => typeof p === 'string' && p.trim()), `${r.slug}: text`)
  }
})

test('geography readings: six per grade, ב׳–ט׳, longer in higher grades', () => {
  for (const r of READINGS) assert.ok(Number.isInteger(r.grade) && r.grade >= 2 && r.grade <= 9, `${r.slug}: grade ${r.grade}`)
  for (let g = 2; g <= 9; g++) assert.equal(READINGS.filter(r => r.grade === g).length, 6, `grade ${g}`)
  const avg = g => { const l = READINGS.filter(r => r.grade === g); return l.reduce((n, r) => n + words(r.text.join(' ')), 0) / l.length }
  for (const r of READINGS) assert.ok(words(r.text.join(' ')) >= 70, `${r.slug}: too short`)
  assert.ok(avg(9) > avg(2) * 2, 'grade 9 passages are much longer than grade 2')
})

test('geography readings: questions have four distinct options and a valid answer', () => {
  const used = new Set()
  for (const r of READINGS) {
    assert.ok(r.q.length >= 4 && r.q.length <= 5, `${r.slug}: ${r.q.length} questions`)
    for (const [q, options, answer] of r.q) {
      assert.ok(typeof q === 'string' && q.trim(), `${r.slug}: question text`)
      assert.equal(options.length, 4, `${r.slug}: ${q}`)
      assert.equal(new Set(options.map(o => o.trim())).size, 4, `${r.slug}: distinct options in "${q}"`)
      assert.ok(Number.isInteger(answer) && answer >= 0 && answer <= 3, `${r.slug}: answer index in "${q}"`)
      used.add(answer)
    }
    assert.ok(new Set(r.q.map(x => x[2])).size >= 2, `${r.slug}: answers in one position`)
  }
  assert.equal(used.size, 4, 'every answer position is used')
})

test('geography readings: open questions with model answers', () => {
  for (const r of READINGS) {
    assert.ok(r.open.length >= 1 && r.open.length <= 2, `${r.slug}: open`)
    for (const [q, a] of r.open) assert.ok(q.trim() && a.trim().length > 10, `${r.slug}: open "${q}"`)
  }
})

test('geography readings: topic links point at geography lessons', () => {
  for (const r of READINGS) if (r.topic != null) assert.ok(lessonSlugs.has(r.topic), `${r.slug} → ${r.topic}`)
})
