import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { checkTest } from '../scripts/check-unseen.mjs'
import { UNSEEN_INDEX } from '../src/data/unseen/index.js'
import { UNSEEN_LEVELS } from '../src/data/unseen/levels.js'

const dir = new URL('../src/data/unseen/', import.meta.url)
const files = readdirSync(dir).filter(f => /^tests-.*\.js$/.test(f))
const all = []
for (const f of files) all.push(...(await import(new URL(f, dir))).TESTS)

test('every unseen test passes the content checker', () => {
  const problems = all.flatMap(checkTest)
  assert.deepEqual(problems, [])
  assert.equal(new Set(all.map(t => t.slug)).size, all.length, 'slugs are unique')
})
test('the unseen index is in sync (run node scripts/generate-unseen.mjs)', () => {
  assert.deepEqual(UNSEEN_INDEX.map(t => t.slug).sort(), all.map(t => t.slug).sort())
  for (const m of UNSEEN_INDEX) { const t = all.find(x => x.slug === m.slug); assert.equal(m.title, t.title); assert.equal(m.questions, t.questions.length) }
})
test('every unseen page is in the sitemap', () => {
  const xml = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  const path = { en: 'english', he: 'hebrew' }
  for (const t of UNSEEN_INDEX) assert.ok(xml.includes(`/unseen/${path[t.lang]}/${t.slug}<`), t.slug)
  for (const L of UNSEEN_LEVELS) assert.ok(xml.includes(`/unseen/${path[L.lang]}/${L.path}<`), L.path)
})
