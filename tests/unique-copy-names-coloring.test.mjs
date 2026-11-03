// Every baby name and every coloring drawing carries its own original copy (Search Console listed
// these pages as "crawled – not indexed": most of their text was shared templates).
import test from 'node:test'
import assert from 'node:assert/strict'
import { BABY_NAMES } from '../src/data/babyNames.js'
import { NAME_STORIES } from '../src/data/babyNameStories.js'
import { COLORING_DRAWINGS } from '../src/data/coloringDrawings.js'
import { COLORING_FACTS } from '../src/data/coloringFacts.js'

const words = t => t.split(/\s+/).filter(Boolean).length

test('every baby name has its own passage (45+ words, Hebrew only, no repeats)', () => {
  const seen = new Set()
  for (const n of BABY_NAMES) {
    const s = NAME_STORIES[n.slug]
    assert.ok(s, `${n.slug}: no story`)
    const [story, nick] = s
    assert.ok(words(story) >= 45, `${n.slug}: ${words(story)} words`)
    assert.ok(!/[a-zA-Z]/.test(story), `${n.slug}: Latin letters`)
    assert.ok(Array.isArray(nick), n.slug)
    assert.ok(!seen.has(story), `${n.slug}: duplicate story`); seen.add(story)
  }
})

test('every coloring drawing has a fact and a question, different within its subject', () => {
  for (const [subject, list] of Object.entries(COLORING_DRAWINGS)) {
    const facts = new Set(), talks = new Set()
    for (const d of list) {
      const f = COLORING_FACTS[subject]?.[d.n]
      assert.ok(f, `${subject}/${d.n}: no fact`)
      const [fact, talk] = f
      assert.ok(words(fact) >= 10 && words(talk) >= 5, `${subject}/${d.n}: too short`)
      assert.ok(!/[a-zA-Z]/.test(fact + talk), `${subject}/${d.n}: Latin letters`)
      assert.ok(!facts.has(fact) && !talks.has(talk), `${subject}/${d.n}: repeated`)
      facts.add(fact); talks.add(talk)
    }
  }
})
