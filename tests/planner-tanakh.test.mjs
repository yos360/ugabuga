// Teachers' planner — Tanakh sequences (src/data/planner/tanakh.js): grades 2–9 in the official order,
// sane hours, steps that fit the hours, non-empty text and links only to pages that exist.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { SEQUENCES } = await import('../src/data/planner/tanakh.js')
const { LINK_TYPES } = await import('../src/data/planner/schema.js')
const topicSlugs = new Set((await Promise.all(['tanakh', 'tanakh-figures', 'tanakh-books', 'tanakh-gaps']
  .map(f => import(`../src/learn/subjects/data/${f}.js`)))).flatMap(m => m.TOPICS.map(t => t.slug)))
const parashaSlugs = new Set((await Promise.all(['genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy']
  .map(f => import(`../src/data/parasha/${f}.js`)))).flatMap(m => m.default.map(p => p[0])))
const { BOOKLETS } = await import('../src/booklets/registry.js')
const bookletSlugs = new Set(BOOKLETS.map(b => b.slug))
const EXISTS = { 'tanakh-topic': topicSlugs, parasha: parashaSlugs, booklet: bookletSlugs }
const filled = v => typeof v === 'string' && v.trim().length > 0

test('planner tanakh: one official sequence per grade 2–9', () => {
  assert.deepEqual(SEQUENCES.map(s => s.grade).sort((a, b) => a - b), [2, 3, 4, 5, 6, 7, 8, 9])
  for (const s of SEQUENCES) {
    assert.equal(s.subject, 'tanakh')
    assert.equal(s.hoursPerWeek, 2)
    assert.equal(s.official, true)
    assert.ok(filled(s.source?.title) && /^https:\/\//.test(s.source?.url), `grade ${s.grade}: source`)
    assert.ok(Array.isArray(s.units) && s.units.length > 0, `grade ${s.grade}: units`)
  }
})

test('planner tanakh: unit ids, hours and yearly totals', () => {
  for (const s of SEQUENCES) {
    const ids = new Set()
    let total = 0
    for (const u of s.units) {
      assert.match(u.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, u.id)
      assert.ok(!ids.has(u.id), `grade ${s.grade}: duplicate ${u.id}`); ids.add(u.id)
      assert.ok(Number.isInteger(u.hours) && u.hours > 0, `${u.id}: hours`)
      total += u.hours
    }
    assert.ok(total >= 50 && total <= 70, `grade ${s.grade}: total ${total}`)
  }
})

test('planner tanakh: goals, concepts and steps', () => {
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

test('planner tanakh: every link points to an existing page', () => {
  for (const s of SEQUENCES) for (const u of s.units) for (const st of u.steps) {
    assert.ok(Array.isArray(st.links))
    for (const l of st.links) {
      assert.ok(LINK_TYPES.includes(l.type) && EXISTS[l.type], `${u.id}: link type ${l.type}`)
      assert.ok(EXISTS[l.type].has(l.slug), `${u.id}: missing ${l.type} ${l.slug}`)
    }
  }
})
