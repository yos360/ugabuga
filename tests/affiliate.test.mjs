import test from 'node:test'
import assert from 'node:assert/strict'
import { AFFILIATE_TOPICS, affiliateForPath } from '../src/data/affiliate.js'

const demo = [{ id: 'travel', title: 't', placements: ['/travel'], products: [
  { name: 'א', url: 'https://s.click.aliexpress.com/e/_x1', image: 'https://ae01.alicdn.com/a.jpg' },
  { name: 'ב', url: 'http://bad', image: 'https://ae01.alicdn.com/b.jpg' },
] }]

test('affiliate topics are well formed and every listed product is a valid https link', () => {
  const ids = new Set()
  for (const t of AFFILIATE_TOPICS) {
    assert.ok(t.id && !ids.has(t.id) && t.title && t.placements.length, t.id); ids.add(t.id)
    for (const p of t.placements) assert.match(p, /^\//)
    for (const p of t.products) {
      assert.ok(p.name && !/[<>]/.test(p.name), `${t.id}: name`)
      assert.match(p.url, /^https:\/\/([a-z0-9-]+\.)*(aliexpress\.(com|us|ru)|alitems\.(com|site)|rzekl\.com|s\.click\.aliexpress\.com)\//, `${t.id}: ${p.url}`)
      assert.match(p.image, /^https:\/\//)
    }
  }
})

test('picks show only where a topic has valid products, never in the kids zone, games or private links', () => {
  assert.equal(affiliateForPath('/travel/kit', demo).products.length, 1)
  assert.equal(affiliateForPath('/speech', demo), null)
  for (const p of ['/kids', '/games/birthday', '/online-games/memory', '/r/abc', '/travel/play', '/travel/offline', '/en/travel']) assert.equal(affiliateForPath(p, demo), null, p)
  // With no real products yet nothing shows anywhere.
  if (AFFILIATE_TOPICS.every(t => !t.products.length)) assert.equal(affiliateForPath('/travel'), null)
})
