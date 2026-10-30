// Teachers' planner — physical education (grades 1–9): valid shapes, sane hours per year, steps per unit,
// non-empty text and links only to pages that exist.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const { SEQUENCES } = await import('../src/data/planner/pe.js')
const { LINK_TYPES, PLANNER_SUBJECTS } = await import('../src/data/planner/schema.js')

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
const PATHS = new Set([
  ...[...app.matchAll(/<Route\s[^>]*path="([^"]+)"/g)].map(m => m[1]),
  ...[...sitemap.matchAll(/<loc>https:\/\/ugabuga\.co\.il(\/[^<]*)<\/loc>/g)].map(m => m[1]),
])
const filled = v => typeof v === 'string' && v.trim().length > 0

test('planner pe: grades 1–9, subject pe, source and hours per week', () => {
  assert.deepEqual(SEQUENCES.map(s => s.grade), [1, 2, 3, 4, 5, 6, 7, 8, 9])
  for (const s of SEQUENCES) {
    assert.equal(s.subject, 'pe')
    assert.ok(PLANNER_SUBJECTS[s.subject])
    assert.equal(typeof s.official, 'boolean', `grade ${s.grade}: official`)
    assert.ok(Number.isFinite(s.hoursPerWeek) && s.hoursPerWeek > 0, `grade ${s.grade}: hoursPerWeek`)
    assert.ok(filled(s.source?.title) && /^https:\/\//.test(s.source?.url), `grade ${s.grade}: source`)
    assert.ok(filled(s.note), `grade ${s.grade}: note`)
    assert.ok(Array.isArray(s.units) && s.units.length > 0, `grade ${s.grade}: units`)
  }
})

test('planner pe: yearly total within ±20% of hoursPerWeek × 30', () => {
  for (const s of SEQUENCES) {
    const total = s.units.reduce((a, u) => a + u.hours, 0)
    const target = s.hoursPerWeek * 30
    assert.ok(total >= target * 0.8 && total <= target * 1.2, `grade ${s.grade}: total ${total} vs ${target}`)
  }
})

test('planner pe: units — unique ids, hours, goals, concepts, steps', () => {
  for (const s of SEQUENCES) {
    const ids = new Set()
    for (const u of s.units) {
      const where = `pe ${s.grade} ${u.id}`
      assert.match(u.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, where)
      assert.ok(!ids.has(u.id), `${where}: duplicate id`); ids.add(u.id)
      assert.ok(Number.isInteger(u.hours) && u.hours > 0, `${where}: hours`)
      assert.ok(filled(u.title), `${where}: title`)
      assert.ok(Array.isArray(u.goals) && u.goals.length >= 2 && u.goals.length <= 4 && u.goals.every(filled), `${where}: goals`)
      assert.ok(Array.isArray(u.concepts) && u.concepts.length <= 8 && u.concepts.every(filled), `${where}: concepts`)
      assert.ok(Array.isArray(u.steps), `${where}: steps`)
      assert.ok(u.steps.length >= Math.min(u.hours, 6) && u.steps.length <= u.hours, `${where}: ${u.steps.length} steps for ${u.hours} hours`)
      for (const st of u.steps) {
        for (const k of ['title', 'goal', 'activity', 'practice']) assert.ok(filled(st[k]), `${where}: step ${k}`)
        assert.ok(Array.isArray(st.links), `${where}: links`)
      }
    }
  }
})

test('planner pe: every link has a valid type and points to an existing page', () => {
  for (const s of SEQUENCES) for (const u of s.units) for (const st of u.steps) for (const l of st.links) {
    const where = `pe ${s.grade} ${u.id} ${st.title}`
    assert.ok(LINK_TYPES.includes(l.type), `${where}: link type ${l.type}`)
    assert.equal(l.type, 'page', `${where}: only page links expected`)
    assert.ok(PATHS.has(l.slug), `${where}: missing page ${l.slug}`)
  }
})
