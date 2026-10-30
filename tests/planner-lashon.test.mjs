// Teachers' planner — Hebrew language sequences (src/data/planner/lashon.js): grades 1–9, recommended order,
// yearly totals ≈ hoursPerWeek × 30, steps that fit the hours, non-empty text and links only to pages that exist.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SEQUENCES } from '../src/data/planner/lashon.js'
import { LINK_TYPES } from '../src/data/planner/schema.js'
import { loadTopics } from '../src/learn/subjects/subjects.js'
import { GRADED_READING } from '../src/learn/readingGrades.js'
import { BOOKLETS } from '../src/booklets/registry.js'

const EXISTS = {
  lesson: new Set((await loadTopics('lashon')).map(t => `lashon/${t.slug}`)),
  'heb-reading': new Set(GRADED_READING.map(r => r.slug)),
  booklet: new Set(BOOKLETS.map(b => b.slug)),
}
const filled = v => typeof v === 'string' && v.trim().length > 0

test('planner lashon: one recommended sequence per grade 1–9', () => {
  assert.deepEqual(SEQUENCES.map(s => s.grade), [1, 2, 3, 4, 5, 6, 7, 8, 9])
  for (const s of SEQUENCES) {
    assert.equal(s.subject, 'lashon')
    assert.equal(s.official, false)
    assert.equal(s.hoursPerWeek, s.grade <= 6 ? 5 : 4)
    assert.ok(filled(s.note) && s.note.includes('מומלץ'), `grade ${s.grade}: note`)
    assert.ok(filled(s.source?.title) && /^https:\/\//.test(s.source?.url), `grade ${s.grade}: source`)
    assert.ok(Array.isArray(s.units) && s.units.length > 0, `grade ${s.grade}: units`)
  }
})

test('planner lashon: unit ids, hours and yearly totals', () => {
  for (const s of SEQUENCES) {
    const ids = new Set()
    let total = 0
    for (const u of s.units) {
      assert.match(u.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, u.id)
      assert.ok(!ids.has(u.id), `grade ${s.grade}: duplicate ${u.id}`); ids.add(u.id)
      assert.ok(Number.isInteger(u.hours) && u.hours > 0, `${u.id}: hours`)
      total += u.hours
    }
    const target = s.hoursPerWeek * 30
    assert.ok(Math.abs(total - target) <= target * 0.2, `grade ${s.grade}: ${total} hours vs ${target}`)
  }
})

test('planner lashon: goals, concepts and steps', () => {
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

test('planner lashon: every link points to an existing page', () => {
  for (const s of SEQUENCES) for (const u of s.units) for (const st of u.steps) {
    assert.ok(Array.isArray(st.links))
    for (const l of st.links) {
      const where = `grade ${s.grade} / ${u.id} / ${st.title}`
      assert.ok(LINK_TYPES.includes(l.type) && EXISTS[l.type], `${where}: link type ${l.type}`)
      assert.ok(EXISTS[l.type].has(l.slug), `${where}: missing ${l.type} ${l.slug}`)
    }
  }
})
