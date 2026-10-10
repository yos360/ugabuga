// Bat mitzvah ideas guide (/ideas/bat-mitzvah-ideas): content completeness and internal links.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const D = await import('../src/data/batMitzvahIdeas.js')

const nonEmpty = s => typeof s === 'string' && s.trim().length > 0

test('all sections are filled', () => {
  assert.ok(D.INTRO.length >= 2)
  assert.deepEqual(D.FORMATS.map(f => f.id), ['party', 'trip', 'women', 'home', 'friends'])
  for (const f of D.FORMATS) for (const k of ['emoji', 'title', 'body', 'good', 'tip']) assert.ok(nonEmpty(f[k]), `${f.id}.${k}`)
  assert.ok(D.PROJECTS.length >= 4)
  assert.ok(D.THEMES.length >= 6)
  assert.ok(D.SPEECH_TIPS.length >= 4)
  assert.ok(D.BUDGET_TIPS.length >= 5)
  for (const x of [...D.PROJECTS, ...D.THEMES]) assert.ok(nonEmpty(x.title) && nonEmpty(x.body), x.title)
})

test('timeline runs from six months before to the day itself', () => {
  assert.equal(D.TIMELINE[0].when, '6 חודשים לפני')
  assert.equal(D.TIMELINE.at(-1).when, 'ביום עצמו')
  for (const s of D.TIMELINE) assert.ok(s.items.length >= 3, s.when)
})

test('FAQ is complete and unique', () => {
  assert.ok(D.FAQ.length >= 5)
  assert.equal(new Set(D.FAQ.map(f => f.q)).size, D.FAQ.length)
  for (const f of D.FAQ) assert.ok(nonEmpty(f.q) && f.a.length > 80, f.q)
})

test('bat mitzvah age is 12 wherever the copy mentions it', () => {
  const all = JSON.stringify(D)
  assert.ok(all.includes('בגיל 12'))
  assert.ok(!/בת מצווה[^.]{0,20}בגיל 13/.test(all))
})

test('internal links point to existing routes', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  const routes = new Set([...app.matchAll(/path="([^"]+)"/g)].map(m => m[1]))
  const added = new Set(['/tools/hebrew-birthday', '/ideas/bat-mitzvah-ideas'])
  const page = readFileSync(new URL('../src/pages/ideas/BatMitzvahIdeas.jsx', import.meta.url), 'utf8')
  const links = [...D.RELATED.map(r => r.href), ...[...page.matchAll(/to="([^"]+)"/g)].map(m => m[1])]
  const matches = href => routes.has(href) || added.has(href) || [...routes].some(r => r.includes(':') && new RegExp('^' + r.replace(/:[^/]+/g, '[^/]+') + '$').test(href))
  for (const href of links) assert.ok(matches(href), href)
})
