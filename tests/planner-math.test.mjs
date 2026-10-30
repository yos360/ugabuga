import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SEQUENCES } from '../src/data/planner/math.js'
import { LINK_TYPES } from '../src/data/planner/schema.js'
import { findTopic } from '../src/math/registry.js'

// Yearly hours per grade from docs/curriculum/math.md: grades 1–3 = sum of "כ-N ש׳" per topic in the new
// curriculum (126 / 128 / 140); grades 4–6 = 125 in the 2006 curriculum's opening table; grades 7–9 = sum of
// the official monthly plans for תשפ״ז (prisa_7, prisa_8, prisa_9A: 10+20+22+15+21+20+18+5+19+12 = 162).
const YEARLY_HOURS = { 1: 126, 2: 128, 3: 140, 4: 125, 5: 125, 6: 125, 7: 162, 8: 162, 9: 162 }

const nonEmpty = (v, where) => assert.ok(typeof v === 'string' && v.trim().length > 0, `${where}: empty`)

test('every grade 1–9 has exactly one math sequence', () => {
  const grades = SEQUENCES.map(s => s.grade).sort((a, b) => a - b)
  assert.deepEqual(grades, [1, 2, 3, 4, 5, 6, 7, 8, 9])
  for (const s of SEQUENCES) {
    assert.equal(s.subject, 'math')
    assert.ok(s.hoursPerWeek > 0, `grade ${s.grade}: hoursPerWeek`)
    assert.equal(typeof s.official, 'boolean')
    nonEmpty(s.source?.title, `grade ${s.grade} source.title`)
    assert.match(s.source?.url || '', /^https:\/\/(meyda|pop)\.education\.gov\.il\//, `grade ${s.grade} source.url`)
    if (s.note !== undefined) nonEmpty(s.note, `grade ${s.grade} note`)
    assert.ok(s.units.length > 0, `grade ${s.grade}: no units`)
  }
})

test('unit ids are unique kebab-case and hours are positive', () => {
  for (const s of SEQUENCES) {
    const ids = new Set()
    for (const u of s.units) {
      assert.match(u.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `grade ${s.grade}: bad id ${u.id}`)
      assert.ok(!ids.has(u.id), `grade ${s.grade}: duplicate id ${u.id}`)
      ids.add(u.id)
      assert.ok(Number.isFinite(u.hours) && u.hours > 0, `grade ${s.grade} ${u.id}: hours`)
    }
  }
})

test('total hours per grade are within ±20% of the yearly total in math.md', () => {
  for (const s of SEQUENCES) {
    const total = s.units.reduce((a, u) => a + u.hours, 0)
    const expected = YEARLY_HOURS[s.grade]
    assert.ok(Math.abs(total - expected) <= expected * 0.2, `grade ${s.grade}: ${total} hours vs ${expected}`)
  }
})

test('each unit has 1..hours steps, 2–4 goals and at most 8 concepts', () => {
  for (const s of SEQUENCES) {
    for (const u of s.units) {
      const where = `grade ${s.grade} ${u.id}`
      assert.ok(u.steps.length >= 1 && u.steps.length <= u.hours, `${where}: ${u.steps.length} steps for ${u.hours} hours`)
      assert.ok(u.goals.length >= 2 && u.goals.length <= 4, `${where}: goals`)
      assert.ok(Array.isArray(u.concepts) && u.concepts.length <= 8, `${where}: concepts`)
    }
  }
})

test('all text fields are non-empty', () => {
  for (const s of SEQUENCES) {
    for (const u of s.units) {
      const where = `grade ${s.grade} ${u.id}`
      nonEmpty(u.title, `${where} title`)
      u.goals.forEach((g, i) => nonEmpty(g, `${where} goal ${i}`))
      u.concepts.forEach((c, i) => nonEmpty(c, `${where} concept ${i}`))
      u.steps.forEach((st, i) => {
        for (const k of ['title', 'goal', 'activity', 'practice']) nonEmpty(st[k], `${where} step ${i} ${k}`)
      })
    }
  }
})

test('every link points to an existing math topic of the same grade', () => {
  let n = 0
  for (const s of SEQUENCES) {
    for (const u of s.units) {
      for (const st of u.steps) {
        assert.ok(Array.isArray(st.links), `grade ${s.grade} ${u.id}: links`)
        for (const l of st.links) {
          assert.ok(LINK_TYPES.includes(l.type), `unknown link type ${l.type}`)
          assert.equal(l.type, 'math-topic', `grade ${s.grade} ${u.id}: math sequences link only to math topics`)
          assert.ok(findTopic(s.grade, l.slug), `grade ${s.grade} ${u.id}: no math topic "${l.slug}"`)
          n++
        }
      }
    }
  }
  assert.ok(n > 0)
})
