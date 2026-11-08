import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { TOOLS_PAGES, TOOLS_GROUPS } from '../src/en/tools/catalog.js'

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const routesSrc = readFileSync(new URL('../src/en/tools/routes.js', import.meta.url), 'utf8')
// Hebrew route patterns from App.jsx (/tools/pdf/:action becomes a regex with one segment for the param).
const HEBREW = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map(m => m[1]).filter(p => p.startsWith('/') && !p.startsWith('/en'))
const patterns = HEBREW.map(p => new RegExp('^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/:[A-Za-z]+/g, '[^/]+').replace(/\/\*$/, '(/.*)?') + '$'))
const isHebrewRoute = path => patterns.some(r => r.test(path))

test('every English tool page has a unique path and title within limits', () => {
  const paths = new Set(), titles = new Set()
  for (const p of TOOLS_PAGES) {
    assert.ok(p.path.startsWith('/en/'), p.path)
    assert.ok(!paths.has(p.path), `duplicate path ${p.path}`); paths.add(p.path)
    assert.ok(!titles.has(p.title), `duplicate title ${p.title}`); titles.add(p.title)
    assert.ok(p.title.length <= 70, `title too long (${p.title.length}): ${p.title}`)
    assert.ok(p.description.length >= 100 && p.description.length <= 170, `description length ${p.description.length}: ${p.path}`)
    assert.ok(p.emoji, `emoji missing: ${p.path}`)
    assert.doesNotMatch(p.title + p.description, /[\u0590-\u05FF]{3,}\s+[\u0590-\u05FF]{3,}/, `Hebrew prose in English copy: ${p.path}`)
  }
})

test('every counterpart is a real Hebrew route and is used once', () => {
  const seen = new Set()
  for (const p of TOOLS_PAGES) {
    if (!p.counterpart && p.unpairedReason) continue
    assert.ok(p.counterpart, `no counterpart: ${p.path}`)
    assert.ok(isHebrewRoute(p.counterpart), `not a Hebrew route: ${p.counterpart} (${p.path})`)
    assert.ok(!seen.has(p.counterpart), `counterpart used twice: ${p.counterpart}`); seen.add(p.counterpart)
  }
})

test('every page sits in a hub group and has a route', () => {
  const groups = new Set(TOOLS_GROUPS.map(g => g[0]))
  for (const p of TOOLS_PAGES) {
    if (p.path !== '/en/tools') assert.ok(groups.has(p.group), `no hub group: ${p.path}`)
    const literal = routesSrc.includes(`path: '${p.path}'`)
    const generated = /^\/en\/tools\/(pdf|image)\/([a-z-]+)$/.exec(p.path)
    assert.ok(literal || (generated && routesSrc.includes(`'${generated[2]}'`)), `no route for ${p.path}`)
  }
  for (const [id] of TOOLS_GROUPS) assert.ok(TOOLS_PAGES.some(p => p.group === id), `empty group ${id}`)
})
