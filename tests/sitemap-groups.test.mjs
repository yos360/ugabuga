import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

// public/sitemap.xml is an index of per-group sitemaps; every page in sitemap-full.xml is either
// submitted in exactly one group or deliberately held back (scripts/generate-sitemap.mjs).
const read = p => readFileSync(new URL(`../public/${p}`, import.meta.url), 'utf8')
const locs = xml => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1])

test('sitemap.xml is an index whose group files all exist', () => {
  const index = read('sitemap.xml')
  assert.match(index, /<sitemapindex /)
  const groups = locs(index)
  assert.ok(groups.length >= 5)
  for (const u of groups) {
    assert.ok(existsSync(new URL(`../public${new URL(u).pathname}`, import.meta.url)), u)
    const xml = read(new URL(u).pathname.slice(1))
    assert.equal(xml.match(/<\?xml /g).length, 1, `${u} must have exactly one XML declaration`)
    assert.ok(xml.startsWith('<?xml ') && /<\/urlset>\s*$/.test(xml), u)
  }
})

test('every page is submitted once or held back, and robots.txt points at the index', async () => {
  const { HELD_BACK } = await import('../scripts/sitemap-groups.mjs')
  const full = locs(read('sitemap-full.xml'))
  const submitted = locs(read('sitemap.xml')).flatMap(u => locs(read(new URL(u).pathname.slice(1))))
  assert.equal(new Set(submitted).size, submitted.length, 'a page is submitted twice')
  const held = full.filter(u => HELD_BACK.some(re => re.test(new URL(u).pathname)))
  assert.equal(submitted.length + held.length, full.length)
  assert.ok(held.length > 0 && submitted.every(u => !held.includes(u)))
  assert.match(read('robots.txt'), /Sitemap: https:\/\/ugabuga\.co\.il\/sitemap\.xml/)
})

test('no learn page carries a lastmod that is simply the generator run date', () => {
  const dates = [...read('sitemap-static.xml').matchAll(/\/learn\/[^<]+<\/loc><lastmod>([\d-]+)/g)].map(m => m[1])
  const counts = Object.values(dates.reduce((c, d) => ({ ...c, [d]: (c[d] || 0) + 1 }), {}))
  assert.ok(Math.max(...counts) < dates.length * 0.6, 'most /learn pages share one lastmod')
})
