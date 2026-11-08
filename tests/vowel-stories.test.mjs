import { test } from 'node:test'
import assert from 'node:assert/strict'
import { STAGES, STORIES } from '../src/data/vowelStories.js'

const MARK = /[֑-ׇ]/g

test('story ids are unique and every story has a known stage', () => {
  const ids = STORIES.map(s => s.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const s of STORIES) assert.ok(STAGES.some(st => st.id === s.stage), s.id)
})

test('every stage has at least two stories', () => {
  for (const st of STAGES) assert.ok(STORIES.filter(s => s.stage === st.id).length >= 2, st.id)
})

test('questions: three distinct options and a valid answer index', () => {
  for (const s of STORIES) {
    assert.equal(s.qs.length, 3, s.id)
    for (const [q, opts, a] of s.qs) {
      assert.equal(opts.length, 3, `${s.id}: ${q}`)
      assert.equal(new Set(opts).size, 3, `${s.id}: ${q}`)
      assert.ok(Number.isInteger(a) && a >= 0 && a < 3, `${s.id}: ${q}`)
    }
  }
})

test('grade 1 stages use only the vowel marks learned so far (text, questions and options)', () => {
  for (const st of STAGES.filter(x => x.marks)) {
    const allowed = new Set(st.marks)
    for (const s of STORIES.filter(x => x.stage === st.id)) {
      const all = [s.title, s.text, ...s.qs.flatMap(([q, opts]) => [q, ...opts])].join(' ')
      const bad = [...new Set(all.match(MARK) || [])].filter(m => !allowed.has(m))
      assert.deepEqual(bad.map(m => m.codePointAt(0).toString(16)), [], `${s.id} uses marks outside ${st.id}`)
    }
  }
})

test('grade 2–3 stories carry an open question', () => {
  for (const s of STORIES.filter(x => x.stage.startsWith('g'))) assert.ok(s.open, s.id)
})
