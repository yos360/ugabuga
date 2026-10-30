// Teachers' planner — civics (grade 9) and homeroom (grades 1–9) sequences: valid shapes, sane hours,
// calendar windows inside the school year, non-empty text and links only to pages that exist.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const { SEQUENCES: CIVICS } = await import('../src/data/planner/civics.js')
const { SEQUENCES: HOMEROOM } = await import('../src/data/planner/homeroom.js')
const { LINK_TYPES, PLANNER_SUBJECTS } = await import('../src/data/planner/schema.js')
const { SCHOOL_YEAR, noSchool, addDays } = await import('../src/data/planner/schoolYear.js')
const { loadTopics } = await import('../src/learn/subjects/subjects.js')

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
const PATHS = new Set([
  ...[...app.matchAll(/<Route\s[^>]*path="([^"]+)"/g)].map(m => m[1]),
  ...[...sitemap.matchAll(/<loc>https:\/\/ugabuga\.co\.il(\/[^<]*)<\/loc>/g)].map(m => m[1]),
])
const lessonCache = {}
const lessonExists = async slug => {
  const [subject, topic] = slug.split('/')
  lessonCache[subject] ??= new Set((await loadTopics(subject)).map(t => t.slug))
  return lessonCache[subject].has(topic)
}
const filled = v => typeof v === 'string' && v.trim().length > 0
const ISO = /^\d{4}-\d{2}-\d{2}$/
const levelOf = g => (g >= 7 ? 'secondary' : 'elementary')

function checkSteps(where, steps) {
  assert.ok(Array.isArray(steps) && steps.length >= 1, `${where}: steps`)
  for (const st of steps) {
    for (const k of ['title', 'goal', 'activity', 'practice']) assert.ok(filled(st[k]), `${where}: step ${k}`)
    assert.ok(Array.isArray(st.links), `${where}: links`)
  }
}
function checkSequence(s, subject) {
  assert.equal(s.subject, subject)
  assert.ok(PLANNER_SUBJECTS[s.subject])
  assert.ok(filled(s.source?.title) && /^https:\/\//.test(s.source?.url), `grade ${s.grade}: source`)
  assert.ok(Array.isArray(s.units) && s.units.length > 0)
  const ids = new Set()
  for (const u of s.units) {
    const where = `${subject} ${s.grade} ${u.id}`
    assert.match(u.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, where)
    assert.ok(!ids.has(u.id), `${where}: duplicate id`); ids.add(u.id)
    assert.ok(Number.isInteger(u.hours) && u.hours > 0, `${where}: hours`)
    assert.ok(filled(u.title), `${where}: title`)
    assert.ok(u.goals.length >= 2 && u.goals.length <= 4 && u.goals.every(filled), `${where}: goals`)
    assert.ok(u.concepts.length <= 8 && u.concepts.every(filled), `${where}: concepts`)
    checkSteps(where, u.steps)
    assert.ok(u.steps.length <= u.hours, `${where}: more steps than hours`)
  }
}
const allSteps = s => [...s.units.flatMap(u => u.steps), ...(s.calendar || []).flatMap(c => c.steps)]

test('planner civics: grade 9 only, official, 2 h/week, 54–66 h', () => {
  assert.deepEqual(CIVICS.map(s => s.grade), [9])
  const [s] = CIVICS
  checkSequence(s, 'civics')
  assert.equal(s.official, true)
  assert.equal(s.hoursPerWeek, 2)
  const total = s.units.reduce((a, u) => a + u.hours, 0)
  assert.ok(total >= 54 && total <= 66, `total ${total}`)
  // the seven mandatory topics first, with the program's hours
  assert.deepEqual(s.units.slice(0, 7).map(u => u.hours), [2, 4, 13, 4, 3, 4, 4])
})

test('planner homeroom: grades 1–9, 1 h/week, recommended (not official)', () => {
  assert.deepEqual(HOMEROOM.map(s => s.grade), [1, 2, 3, 4, 5, 6, 7, 8, 9])
  for (const s of HOMEROOM) {
    checkSequence(s, 'homeroom')
    assert.equal(s.official, false)
    assert.equal(s.hoursPerWeek, 1)
    assert.ok(filled(s.note), `grade ${s.grade}: note`)
  }
})

test('planner homeroom: calendar windows inside the school year', () => {
  for (const s of HOMEROOM) {
    assert.ok(Array.isArray(s.calendar) && s.calendar.length >= 10, `grade ${s.grade}: calendar`)
    const end = SCHOOL_YEAR.end[levelOf(s.grade)]
    let prev = ''
    for (const c of s.calendar) {
      const where = `grade ${s.grade} ${c.title} ${c.from}`
      assert.match(c.from, ISO, where); assert.match(c.to, ISO, where)
      assert.ok(c.from <= c.to, `${where}: from > to`)
      assert.ok(c.from >= SCHOOL_YEAR.start && c.to <= end, `${where}: outside the year`)
      assert.ok(c.from > prev, `${where}: overlaps or out of order`); prev = c.to
      let schoolDays = 0
      for (let d = c.from; d <= c.to; d = addDays(d, 1)) if (!noSchool(d, { level: levelOf(s.grade) })) schoolDays++
      assert.ok(schoolDays > 0, `${where}: no school days`)
      assert.ok(filled(c.title), where)
      assert.ok(c.goals.length >= 2 && c.goals.length <= 4 && c.goals.every(filled), `${where}: goals`)
      checkSteps(where, c.steps)
    }
  }
})

test('planner civics + homeroom: every link points to an existing page', async () => {
  for (const s of [...CIVICS, ...HOMEROOM]) for (const st of allSteps(s)) for (const l of st.links) {
    const where = `${s.subject} ${s.grade} ${st.title}`
    assert.ok(LINK_TYPES.includes(l.type), `${where}: link type ${l.type}`)
    if (l.type === 'lesson') assert.ok(await lessonExists(l.slug), `${where}: missing lesson ${l.slug}`)
    else if (l.type === 'page') assert.ok(PATHS.has(l.slug), `${where}: missing page ${l.slug}`)
    else assert.fail(`${where}: unexpected link type ${l.type}`)
  }
})
