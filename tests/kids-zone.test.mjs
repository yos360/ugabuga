// Kids zone (/kids) and the home page's intent cards: every link must land on a real page.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { KIDS_TILES, HOME_INTENTS } from '../src/data/kidsZone.js'
import { ARCADE } from '../src/arcade/registry.js'
import { parseGradeParam, findTopic } from '../src/math/registry.js'

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const routes = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map(m => m[1]).filter(p => p !== '*' && !p.endsWith('/*'))
const staticRoutes = new Set(routes.filter(p => !p.includes(':')))

// Dynamic routes we link to, with a check that the slug really exists.
const DYNAMIC = [
  [/^\/online-games\/([^/]+)$/, ([slug]) => ARCADE.some(g => g.slug === slug)],
  [/^\/math\/([^/]+)\/([^/]+)$/, ([grade, topic]) => { const n = parseGradeParam(grade); return !!(n && findTopic(n, topic)) }],
]
function exists(to) {
  const path = to.split(/[?#]/)[0]
  if (staticRoutes.has(path)) return true
  for (const [re, ok] of DYNAMIC) { const m = path.match(re); if (m) return ok(m.slice(1)) }
  return false
}

test('/kids is a route', () => {
  assert.ok(staticRoutes.has('/kids'))
})

test('every /kids tile points to an existing route', () => {
  assert.ok(KIDS_TILES.length >= 8 && KIDS_TILES.length <= 12, `${KIDS_TILES.length} tiles`)
  for (const t of KIDS_TILES) assert.ok(exists(t.to), `kids tile ${t.label} → ${t.to} is not a route`)
})

test('kids tiles stay on the site and have short labels', () => {
  assert.equal(new Set(KIDS_TILES.map(t => t.to)).size, KIDS_TILES.length)
  for (const t of KIDS_TILES) {
    assert.ok(t.to.startsWith('/') && !t.to.startsWith('//'), `${t.to} must be an internal link`)
    assert.ok(!/suppliers|bring-list|rsvp|invitation/.test(t.to), `${t.to} is not for kids browsing alone`)
    assert.ok(t.label.split(' ').length <= 2, `label too long: ${t.label}`)
    assert.ok(t.emoji, `${t.label} has no emoji`)
  }
})

test('the home intent cards point to existing routes, in the agreed order', () => {
  assert.deepEqual(HOME_INTENTS.map(c => c[3]), ['/kids', '/family', '/classroom', '/birthday'])
  for (const c of HOME_INTENTS) assert.ok(exists(c[3]), `home card ${c[1]} → ${c[3]} is not a route`)
})
