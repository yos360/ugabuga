import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { AUDIENCE_PAGES, BABY_SAFETY, KIND_TITLES } from '../src/data/purimCostumesAudience.js'

test('each audience has 12-20 complete original ideas', () => {
  assert.deepEqual(AUDIENCE_PAGES.map(p => p.slug), ['babies', 'adults', 'women'])
  const names = new Set()
  for (const p of AUDIENCE_PAGES) {
    assert.ok(p.ideas.length >= 12 && p.ideas.length <= 20, `${p.slug}: ${p.ideas.length}`)
    assert.equal(new Set(p.ideas.map(i => i.id)).size, p.ideas.length, `${p.slug}: ids`)
    for (const i of p.ideas) {
      assert.match(i.id, /^[a-z0-9-]+$/)
      for (const k of ['emoji', 'name', 'desc', 'tip']) assert.ok(i[k]?.trim(), `${i.id}: ${k}`)
      assert.ok(i.kind in KIND_TITLES, `${i.id}: kind`)
      assert.ok(i.materials.length >= 2 && i.steps.length >= 3 && i.steps.length <= 5, `${i.id}: materials/steps`)
      assert.ok(!names.has(i.name), `duplicate name ${i.name}`)
      names.add(i.name)
    }
  }
  assert.ok(BABY_SAFETY.length >= 5)
})

test('adults page offers solo, couple and group ideas', () => {
  const adults = AUDIENCE_PAGES.find(p => p.slug === 'adults').ideas
  for (const k of ['solo', 'pair', 'group']) assert.ok(adults.filter(i => i.kind === k).length >= 3, k)
})

test('the three routes and sitemap entries exist', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  const sm = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  for (const a of ['babies', 'adults', 'women']) {
    assert.ok(app.includes(`path="/holidays/purim/costumes/${a}"`), a)
    assert.ok(sm.includes(`/holidays/purim/costumes/${a}</loc>`), a)
  }
})
