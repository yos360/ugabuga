// Teachers' planner — history sequences (src/data/planner/history.js): grades 6–9 (no history before ו׳) in
// the official order with the official hours, steps that fit the hours, non-empty text and links only to
// lessons that exist.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { SEQUENCES } = await import('../src/data/planner/history.js')
const { LINK_TYPES } = await import('../src/data/planner/schema.js')
const { loadTopics } = await import('../src/learn/subjects/subjects.js')
const filled = v => typeof v === 'string' && v.trim().length > 0

// Official hours (docs/curriculum/history.md, תוכנית תשפ״ז): ו׳ 2+10+15+7+26 = 60; ז׳ התוכנית המחייבת —
// sub-units 10+8+9+5+8 + 9+4+5 = 58 (headers say 34+18, out of a 60-hour year); ח׳ 8+15+3+12+12 = 50 of 60;
// ט׳ 13+7+8+7+5+4+4+6+6 = 60.
const OFFICIAL_TOTAL = { 6: 60, 7: 58, 8: 50, 9: 60 }

const lessonSlugs = new Set()
for (const key of ['history', 'geography', 'civics']) {
  for (const t of await loadTopics(key)) lessonSlugs.add(`${key}/${t.slug}`)
}

test('planner history: one official sequence per grade 6–9', () => {
  assert.deepEqual(SEQUENCES.map(s => s.grade).sort((a, b) => a - b), [6, 7, 8, 9])
  for (const s of SEQUENCES) {
    assert.equal(s.subject, 'history')
    assert.equal(s.hoursPerWeek, 2)
    assert.equal(s.official, true)
    assert.ok(filled(s.source?.title) && /^https:\/\//.test(s.source?.url), `grade ${s.grade}: source`)
    assert.ok(Array.isArray(s.units) && s.units.length > 0, `grade ${s.grade}: units`)
  }
})

test('planner history: unit ids, hours and yearly totals', () => {
  for (const s of SEQUENCES) {
    const ids = new Set()
    let total = 0
    for (const u of s.units) {
      assert.match(u.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, u.id)
      assert.ok(!ids.has(u.id), `grade ${s.grade}: duplicate ${u.id}`); ids.add(u.id)
      assert.ok(Number.isInteger(u.hours) && u.hours > 0, `${u.id}: hours`)
      total += u.hours
    }
    const want = OFFICIAL_TOTAL[s.grade]
    assert.ok(Math.abs(total - want) <= want * 0.1, `grade ${s.grade}: total ${total}, official ${want}`)
  }
})

test('planner history: goals, concepts and steps', () => {
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

test('planner history: every link points to an existing lesson', () => {
  for (const s of SEQUENCES) for (const u of s.units) for (const st of u.steps) {
    assert.ok(Array.isArray(st.links))
    for (const l of st.links) {
      assert.ok(LINK_TYPES.includes(l.type) && l.type === 'lesson', `${u.id}: link type ${l.type}`)
      assert.ok(lessonSlugs.has(l.slug), `${u.id}: missing lesson ${l.slug}`)
    }
  }
})
