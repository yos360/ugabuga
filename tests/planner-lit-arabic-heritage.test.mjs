// Teachers' planner — literature (7–9), Arabic (7–9) and "בשבילי מורשת" (2–7) sequences: grades, yearly totals
// ≈ hoursPerWeek × 30, steps that fit the hours, non-empty text, and links only to pages that exist.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SEQUENCES as LITERATURE } from '../src/data/planner/literature.js'
import { SEQUENCES as ARABIC } from '../src/data/planner/arabic.js'
import { SEQUENCES as HERITAGE } from '../src/data/planner/heritage.js'
import { LINK_TYPES, PLANNER_SUBJECTS } from '../src/data/planner/schema.js'
import { SUBJECTS, loadTopics } from '../src/learn/subjects/subjects.js'
import { GRADED_READING } from '../src/learn/readingGrades.js'

const lessons = new Set()
for (const s of SUBJECTS) for (const t of await loadTopics(s.key)) lessons.add(`${s.key}/${t.slug}`)
const appRoutes = [...readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8').matchAll(/path="([^"]+)"/g)].map(m => m[1])
const sitemap = new Set([...readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  .matchAll(/<loc>https:\/\/ugabuga\.co\.il([^<]*)<\/loc>/g)].map(m => m[1] || '/'))
const routeMatches = path => appRoutes.some(r => {
  const a = r.split('/'), b = path.split('/')
  return a.length === b.length && a.every((seg, i) => seg.startsWith(':') ? b[i].length > 0 : seg === b[i])
})
const EXISTS = {
  lesson: slug => lessons.has(slug),
  'heb-reading': slug => GRADED_READING.some(r => r.slug === slug),
  page: slug => slug.startsWith('/') && (sitemap.has(slug) || routeMatches(slug)),
}
const filled = v => typeof v === 'string' && v.trim().length > 0

const CASES = [
  ['literature', LITERATURE, [7, 8, 9], 2],
  ['arabic', ARABIC, [7, 8, 9], 2],
  ['heritage', HERITAGE, [2, 3, 4, 5, 6, 7], 1],
]

for (const [subject, SEQ, grades, perWeek] of CASES) {
  test(`planner ${subject}: one sequence per grade ${grades.join(',')}`, () => {
    assert.ok(PLANNER_SUBJECTS[subject])
    assert.deepEqual(SEQ.map(s => s.grade), grades)
    for (const s of SEQ) {
      assert.equal(s.subject, subject)
      assert.equal(typeof s.official, 'boolean')
      assert.equal(s.hoursPerWeek, perWeek)
      assert.ok(filled(s.source?.title) && /^https:\/\//.test(s.source?.url), `grade ${s.grade}: source`)
      assert.ok(filled(s.note), `grade ${s.grade}: note`)
      assert.ok(Array.isArray(s.units) && s.units.length > 0, `grade ${s.grade}: units`)
    }
  })

  test(`planner ${subject}: unit ids, hours and yearly totals`, () => {
    for (const s of SEQ) {
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

  test(`planner ${subject}: goals, concepts and steps`, () => {
    for (const s of SEQ) for (const u of s.units) {
      const where = `grade ${s.grade} ${u.id}`
      assert.ok(filled(u.title), `${where}: title`)
      assert.ok(u.goals.length >= 2 && u.goals.length <= 4 && u.goals.every(filled), `${where}: goals`)
      assert.ok(u.concepts.length <= 8 && u.concepts.every(filled), `${where}: concepts`)
      assert.ok(u.steps.length >= Math.min(u.hours, 6) && u.steps.length <= u.hours, `${where}: ${u.steps.length} steps for ${u.hours} hours`)
      for (const st of u.steps) for (const k of ['title', 'goal', 'activity', 'practice']) assert.ok(filled(st[k]), `${where}: step ${k}`)
    }
  })

  test(`planner ${subject}: every link points to an existing page`, () => {
    for (const s of SEQ) for (const u of s.units) for (const st of u.steps) {
      assert.ok(Array.isArray(st.links))
      for (const l of st.links) {
        const where = `grade ${s.grade} / ${u.id} / ${st.title}`
        assert.ok(LINK_TYPES.includes(l.type) && EXISTS[l.type], `${where}: link type ${l.type}`)
        assert.ok(EXISTS[l.type](l.slug), `${where}: missing ${l.type} ${l.slug}`)
      }
    }
  })
}
