// Teachers' planner — מולדת וגאוגרפיה sequences (src/data/planner/geography.js): grades 2–9 in the official
// order, yearly totals that match the ministry's, steps that fit the hours, non-empty text and links only to
// lessons that exist.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { SEQUENCES } = await import('../src/data/planner/geography.js')
const { LINK_TYPES } = await import('../src/data/planner/schema.js')
const { loadTopics } = await import('../src/learn/subjects/subjects.js')
const filled = v => typeof v === 'string' && v.trim().length > 0

// Official yearly hours (docs/curriculum/geography.md): ב׳–ד׳ מולדת 2 ש״ש = 60 ש׳ לשכבה; ה׳ מפות 30 + אגן
// הים התיכון 30; ו׳ 60 (1+17+14+18+10); ז׳ — חובת הוראה 6 ש״ש על פני ז׳–ט׳ ≈ 60 לשנה; ח׳ מדעי כדור הארץ
// 12+15+20+12 ≈ 59; ט׳ 4+11+6+14+11 + פרק הסביבה (שעות לא קריאות) ≈ 60.
const OFFICIAL_TOTAL = { 2: 60, 3: 60, 4: 60, 5: 60, 6: 60, 7: 60, 8: 59, 9: 60 }

const lessonSlugs = new Set()
for (const key of ['geography', 'history', 'civics', 'science']) {
  for (const t of await loadTopics(key)) lessonSlugs.add(`${key}/${t.slug}`)
}

test('planner geography: one sequence per grade 2–9', () => {
  assert.deepEqual(SEQUENCES.map(s => s.grade).sort((a, b) => a - b), [2, 3, 4, 5, 6, 7, 8, 9])
  for (const s of SEQUENCES) {
    assert.equal(s.subject, 'geography')
    assert.equal(s.hoursPerWeek, 2)
    assert.equal(typeof s.official, 'boolean')
    // ב׳–ו׳, ח׳, ט׳: units and hours from the ministry's documents; ז׳: official order, our hours.
    assert.equal(s.official, s.grade !== 7, `grade ${s.grade}: official`)
    if (!s.official) assert.ok(filled(s.note), `grade ${s.grade}: note`)
    assert.ok(filled(s.source?.title) && /^https:\/\//.test(s.source?.url), `grade ${s.grade}: source`)
    assert.ok(Array.isArray(s.units) && s.units.length > 0, `grade ${s.grade}: units`)
  }
})

test('planner geography: unit ids, hours and yearly totals', () => {
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

test('planner geography: goals, concepts and steps', () => {
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

test('planner geography: every link points to an existing lesson', () => {
  for (const s of SEQUENCES) for (const u of s.units) for (const st of u.steps) {
    assert.ok(Array.isArray(st.links))
    for (const l of st.links) {
      assert.ok(LINK_TYPES.includes(l.type) && l.type === 'lesson', `${u.id}: link type ${l.type}`)
      assert.ok(lessonSlugs.has(l.slug), `${u.id}: missing lesson ${l.slug}`)
    }
  }
})
