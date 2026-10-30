// Teachers' planner — music and visual art sequences (grades 1–9): valid shapes, sane hours,
// non-empty text and 'page' links only to routes that exist.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const { SEQUENCES: MUSIC } = await import('../src/data/planner/music.js')
const { SEQUENCES: ART } = await import('../src/data/planner/art.js')
const { LINK_TYPES, PLANNER_SUBJECTS } = await import('../src/data/planner/schema.js')

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
const PATHS = new Set([
  ...[...app.matchAll(/<Route\s[^>]*path="([^"]+)"/g)].map(m => m[1]),
  ...[...sitemap.matchAll(/<loc>https:\/\/ugabuga\.co\.il(\/[^<]*)<\/loc>/g)].map(m => m[1]),
])
const filled = v => typeof v === 'string' && v.trim().length > 0

function checkSequence(s, subject) {
  assert.equal(s.subject, subject)
  assert.ok(PLANNER_SUBJECTS[s.subject])
  assert.equal(typeof s.official, 'boolean')
  assert.ok(s.hoursPerWeek > 0)
  assert.ok(filled(s.source?.title) && /^https:\/\//.test(s.source?.url), `${subject} ${s.grade}: source`)
  if (!s.official) assert.ok(filled(s.note), `${subject} ${s.grade}: note`)
  assert.ok(Array.isArray(s.units) && s.units.length > 0)
  const ids = new Set()
  let total = 0
  for (const u of s.units) {
    const where = `${subject} ${s.grade} ${u.id}`
    assert.match(u.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, where)
    assert.ok(!ids.has(u.id), `${where}: duplicate id`); ids.add(u.id)
    assert.ok(Number.isInteger(u.hours) && u.hours > 0, `${where}: hours`)
    total += u.hours
    assert.ok(filled(u.title), `${where}: title`)
    assert.ok(u.goals.length >= 2 && u.goals.length <= 4 && u.goals.every(filled), `${where}: goals`)
    assert.ok(u.concepts.length <= 8 && u.concepts.every(filled), `${where}: concepts`)
    assert.ok(u.steps.length >= Math.min(u.hours, 6) && u.steps.length <= u.hours, `${where}: ${u.steps.length} steps for ${u.hours} hours`)
    for (const st of u.steps) {
      for (const k of ['title', 'goal', 'activity', 'practice']) assert.ok(filled(st[k]), `${where}: step ${k}`)
      assert.ok(Array.isArray(st.links), `${where}: links`)
      for (const l of st.links) {
        assert.ok(LINK_TYPES.includes(l.type), `${where}: link type ${l.type}`)
        assert.equal(l.type, 'page', `${where}: unexpected link type ${l.type}`)
        assert.ok(PATHS.has(l.slug), `${where}: missing page ${l.slug}`)
      }
    }
  }
  const target = s.hoursPerWeek * 30
  assert.ok(total >= target * 0.8 && total <= target * 1.2, `${subject} ${s.grade}: total ${total} vs ${target}`)
}

for (const [subject, list] of [['music', MUSIC], ['art', ART]]) {
  test(`planner ${subject}: grades 1–9, valid sequences`, () => {
    assert.deepEqual(list.map(s => s.grade), [1, 2, 3, 4, 5, 6, 7, 8, 9])
    for (const s of list) checkSequence(s, subject)
  })
}
