import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { STEPS, CHECKLIST, READINESS, TALK, CHILD_SKILLS } from '../src/data/firstGradeRegistration.js'

const PATH = '/classroom/first-grade/registration'
const read = f => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8')

test('ids are unique across steps, checklist groups and items', () => {
  for (const list of [STEPS, CHECKLIST, READINESS, CHILD_SKILLS]) assert.equal(new Set(list.map(x => x.id)).size, list.length)
  const items = CHECKLIST.flatMap(g => g.items.map(i => i.id))
  assert.equal(new Set(items).size, items.length)
  for (const g of CHECKLIST) assert.ok(g.items.length >= 3, g.id)
})

test('no municipal dates: every authority sets its own', () => {
  const text = JSON.stringify({ STEPS, CHECKLIST, READINESS, TALK })
  assert.doesNotMatch(text, /\d{1,2}[./]\d{1,2}/)
  assert.doesNotMatch(text, /20\d\d/)
})

test('talk pairs and child skills are complete', () => {
  for (const pair of TALK) assert.equal(pair.length, 2)
  for (const s of CHILD_SKILLS) assert.ok(s.m && s.f && s.emoji, s.id)
})

test('page is routed, in the sitemap, searchable and linked from first-grade prep', () => {
  assert.match(read('src/App.jsx'), new RegExp(`path="${PATH}"`))
  assert.match(read('public/sitemap-static.xml'), new RegExp(`ugabuga.co.il${PATH}<`))
  assert.match(read('src/data/searchStatic.js'), new RegExp(`to: '${PATH}'`))
  assert.match(read('src/pages/ClassOnePrep.jsx'), new RegExp(PATH))
})
