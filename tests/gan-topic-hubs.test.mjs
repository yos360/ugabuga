import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// Every link on /gan/activities and /gan/crafts opens a real page (route, dynamic route family,
// printable category or booklet), and both pages are routed, in the sitemap and in site search.
const { GAN_ACTIVITIES, GAN_CRAFTS } = await import('../src/data/ganHubs.js')
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const routes = [...app.matchAll(/path="([^"]+)"/g)].map(m => m[1])
const printables = readFileSync(new URL('../src/data/printableCategories.js', import.meta.url), 'utf8')
const booklets = readFileSync(new URL('../src/booklets/registry.js', import.meta.url), 'utf8')
const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
const dynamic = [/^\/holidays\/[a-z-]+$/, /^\/riddles\/[a-z-]+$/, /^\/printables\/coloring\/[a-z-]+$/, /^\/printables\/color-by-number\/[a-z-]+$/]
const exists = to => routes.includes(to)
  || (/^\/printables\/[a-z0-9-]+$/.test(to) && printables.includes(`slug: '${to.split('/')[2]}'`))
  || (/^\/booklets\/[a-z0-9-]+$/.test(to) && booklets.includes(`slug: '${to.split('/')[2]}'`))
  || (dynamic.some(r => r.test(to)) && sitemap.includes(`ugabuga.co.il${to}<`))
  || (sitemap.includes(`ugabuga.co.il${to}<`) && !to.startsWith('/printables/'))

for (const cfg of [GAN_ACTIVITIES, GAN_CRAFTS]) test(`${cfg.path}: links, originals and registration`, () => {
  assert.ok(routes.includes(cfg.path), 'routed')
  assert.ok(sitemap.includes(`https://ugabuga.co.il${cfg.path}<`), 'in sitemap')
  assert.ok(readFileSync(new URL('../src/data/searchStatic.js', import.meta.url), 'utf8').includes(`'${cfg.path}'`), 'in search')
  assert.ok(cfg.sections.length >= 5)
  assert.equal(cfg.originals.length, 2)
  for (const a of cfg.originals) assert.ok(a.steps.length >= 3 && a.materials && a.tip)
  assert.ok(cfg.faq.length >= 2 && cfg.faq.length <= 4)
  const seen = new Set()
  for (const s of cfg.sections) for (const [label, to] of s.links) {
    assert.ok(label && exists(to), `no page for ${to}`)
    seen.add(to)
  }
  assert.ok(seen.size >= 30, 'enough distinct links')
})
