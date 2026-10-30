import test from 'node:test'
import assert from 'node:assert/strict'
import { SEQUENCES } from '../src/data/planner/english.js'
import { LINK_TYPES } from '../src/data/planner/schema.js'
import { GRAMMAR_TOPICS } from '../src/data/englishGrammar.js'
import { VOCAB_GRADES } from '../src/data/englishVocab.js'
import { READING_STORIES } from '../src/data/englishReading.js'
import { UNSEEN_INDEX } from '../src/data/unseen/index.js'
import { BOOKLETS } from '../src/booklets/registry.js'

const EXISTS = {
  grammar: new Set(GRAMMAR_TOPICS.map(t => t.slug)),
  vocab: new Set(VOCAB_GRADES.flatMap(g => g.units.map(u => `grade-${g.n}/${u.slug}`))),
  reading: new Set(READING_STORIES.map(s => s.slug)),
  unseen: new Set(UNSEEN_INDEX.filter(u => u.lang === 'en').map(u => u.slug)),
  booklet: new Set(BOOKLETS.map(b => b.slug)),
}
const text = s => typeof s === 'string' && s.trim().length > 0

test('english planner covers grades 3–9 with recommended (not official) sequences', () => {
  assert.deepEqual(SEQUENCES.map(s => s.grade), [3, 4, 5, 6, 7, 8, 9])
  for (const s of SEQUENCES) {
    assert.equal(s.subject, 'english')
    assert.equal(s.official, false)
    assert.ok(text(s.note) && s.note.includes('המשרד לא קובע סדר יחידות'))
    assert.ok(text(s.source?.title) && /^https:\/\//.test(s.source?.url))
    assert.equal(s.hoursPerWeek, s.grade === 3 ? 2 : 4)
  }
})

test('every grade totals about hoursPerWeek × 30 and units are well formed', () => {
  for (const s of SEQUENCES) {
    const ids = new Set()
    let total = 0
    for (const u of s.units) {
      const where = `grade ${s.grade} / ${u.id}`
      assert.match(u.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, where)
      assert.ok(!ids.has(u.id), `duplicate unit id: ${where}`)
      ids.add(u.id)
      assert.ok(text(u.title), where)
      assert.ok(Number.isInteger(u.hours) && u.hours > 0, where)
      total += u.hours
      assert.ok(u.goals.length >= 2 && u.goals.length <= 4 && u.goals.every(text), `goals: ${where}`)
      assert.ok(u.concepts.length <= 8 && u.concepts.every(text), `concepts: ${where}`)
      assert.ok(u.steps.length >= Math.min(u.hours, 6) && u.steps.length <= u.hours, `steps count: ${where}`)
      for (const st of u.steps) {
        for (const k of ['title', 'goal', 'activity', 'practice']) assert.ok(text(st[k]), `${where} / ${st.title} / ${k}`)
        assert.ok(Array.isArray(st.links), where)
      }
    }
    const target = s.hoursPerWeek * 30
    assert.ok(Math.abs(total - target) <= target * 0.2, `grade ${s.grade}: ${total} hours vs ${target}`)
  }
})

test('every link points to existing English material', () => {
  for (const s of SEQUENCES) for (const u of s.units) for (const st of u.steps) for (const l of st.links) {
    const where = `grade ${s.grade} / ${u.id} / ${st.title}`
    assert.ok(LINK_TYPES.includes(l.type), `${where}: bad type ${l.type}`)
    assert.ok(EXISTS[l.type]?.has(l.slug), `${where}: missing ${l.type} ${l.slug}`)
  }
})
