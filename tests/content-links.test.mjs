// Inline content links ([[text|/path]] in blog posts, guides, idea articles and landing pages) must
// point at a real page: a route in App.jsx or a URL in the sitemap. Broken markup is caught too.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
// The catch-all route (*) would make any path look valid, so it is left out.
const routes = [...read('src/App.jsx').matchAll(/path="([^"]+)"/g)].map(m => m[1]).filter(r => !r.includes('*'))
// known-paths.json is generated at build time; the hand-kept sitemap is always in the repo.
const known = new Set([...read('public/sitemap-static.xml').matchAll(/<loc>https:\/\/ugabuga\.co\.il([^<]*)<\/loc>/g)].map(m => m[1] || '/'))
try { for (const p of JSON.parse(read('public/known-paths.json'))) known.add(p) } catch { /* not built yet */ }
const routeRe = routes.map(r => new RegExp('^' + r.replace(/:[^/]+/g, '[^/]+') + '$'))
const exists = path => known.has(path) || routeRe.some(re => re.test(path))

const files = readdirSync(new URL('../src/data', import.meta.url)).filter(f => f.endsWith('.js')).map(f => `src/data/${f}`)

test('every inline content link points at a real page', () => {
  const bad = []
  let count = 0
  for (const f of files) for (const m of read(f).matchAll(/\[\[([^|\]]+)\|([^\]]*)\]\]/g)) {
    count++
    const path = m[2].split('#')[0].split('?')[0]
    if (!path.startsWith('/') || !exists(path)) bad.push(`${f}: ${m[0]}`)
  }
  assert.deepEqual(bad, [])
  assert.ok(count > 300, `only ${count} links`)
})

test('no half-written link markup', () => {
  const bad = []
  for (const f of files) {
    // JS arrays also start with [[ — only "[[" followed by a Hebrew label counts as markup.
    const s = read(f).replace(/\[\[[^|\]]+\|\/[^\]\s]*\]\]/g, '')
    if (/\[\[[א-ת]/.test(s)) bad.push(f)
  }
  assert.deepEqual(bad, [])
})
