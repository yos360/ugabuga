// Teachers' planner — science & technology sequences (src/data/planner/science.js): grades 1–9, the official
// topics with sane hours, steps that fit the hours, non-empty text and links only to lessons that exist.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { SEQUENCES } = await import('../src/data/planner/science.js')
const { LINK_TYPES } = await import('../src/data/planner/schema.js')
const { SUBJECT_BY_KEY, loadTopics } = await import('../src/learn/subjects/subjects.js')
const lessonSlugs = new Set((await Promise.all(Object.keys(SUBJECT_BY_KEY)
  .map(async key => (await loadTopics(key)).map(t => `${key}/${t.slug}`)))).flat())
const EXISTS = { lesson: lessonSlugs }
const filled = v => typeof v === 'string' && v.trim().length > 0

// Yearly hours per grade from the content specifications (docs/curriculum/science.md, table "שעות").
const DOC_TOTAL = { 1: 60, 2: 90, 3: 90, 4: 90, 5: 90, 6: 120, 7: 110, 8: 140, 9: 140 }

test('planner science: one sequence per grade 1–9', () => {
  assert.deepEqual(SEQUENCES.map(s => s.grade).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9])
  for (const s of SEQUENCES) {
    assert.equal(s.subject, 'science')
    assert.equal(s.official, false, `grade ${s.grade}: order within the year is recommended`)
    assert.ok(Number.isInteger(s.hoursPerWeek) && s.hoursPerWeek >= 2 && s.hoursPerWeek <= 5, `grade ${s.grade}: hoursPerWeek`)
    assert.ok(filled(s.source?.title) && /^https:\/\//.test(s.source?.url), `grade ${s.grade}: source`)
    assert.ok(filled(s.note), `grade ${s.grade}: note`)
    assert.ok(Array.isArray(s.units) && s.units.length > 0, `grade ${s.grade}: units`)
  }
})

test('planner science: unit ids, hours and yearly totals (±15% of the specification)', () => {
  for (const s of SEQUENCES) {
    const ids = new Set()
    let total = 0
    for (const u of s.units) {
      assert.match(u.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, u.id)
      assert.ok(!ids.has(u.id), `grade ${s.grade}: duplicate ${u.id}`); ids.add(u.id)
      assert.ok(Number.isInteger(u.hours) && u.hours > 0, `${u.id}: hours`)
      total += u.hours
    }
    const doc = DOC_TOTAL[s.grade]
    assert.ok(Math.abs(total - doc) <= doc * 0.15, `grade ${s.grade}: total ${total} vs ${doc}`)
  }
})

test('planner science: goals, concepts and steps', () => {
  for (const s of SEQUENCES) for (const u of s.units) {
    const where = `grade ${s.grade} ${u.id}`
    assert.ok(filled(u.title), `${where}: title`)
    assert.ok(u.goals.length >= 2 && u.goals.length <= 4 && u.goals.every(filled), `${where}: goals`)
    assert.ok(u.concepts.length <= 8 && u.concepts.every(filled), `${where}: concepts`)
    assert.ok(u.steps.length >= 1 && u.steps.length <= u.hours, `${where}: ${u.steps.length} steps for ${u.hours} hours`)
    assert.ok(u.steps.length >= Math.min(u.hours, 6), `${where}: too few steps`)
    for (const st of u.steps) for (const k of ['title', 'goal', 'activity', 'practice']) assert.ok(filled(st[k]), `${where}: step ${k}`)
  }
})

test('planner science: every link points to an existing lesson', () => {
  for (const s of SEQUENCES) for (const u of s.units) for (const st of u.steps) {
    assert.ok(Array.isArray(st.links))
    for (const l of st.links) {
      assert.ok(LINK_TYPES.includes(l.type) && EXISTS[l.type], `${u.id}: link type ${l.type}`)
      assert.ok(EXISTS[l.type].has(l.slug), `${u.id}: missing ${l.type} ${l.slug}`)
    }
  }
})
