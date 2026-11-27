import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { GREETING_PAGES_FAMILY } from '../src/data/content/greetingPagesFamily.js'
import { GREETING_PAGES } from '../src/data/content/greetings.js'
import { GREETING_GROUPS } from '../src/data/content/greetingsExtra.js'
import { SEVEN_BLESSINGS, BLESSING_SLOTS, anniversaryInfo } from '../src/data/weddingGuides.js'

const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')

test('family greeting pages: complete, unique and registered', () => {
  assert.equal(GREETING_PAGES_FAMILY.length, 11)
  const slugs = new Set(GREETING_PAGES.map(p => p.slug))
  assert.equal(slugs.size, GREETING_PAGES.length, 'slugs are unique')
  const grouped = Object.values(GREETING_GROUPS).flat()
  for (const p of GREETING_PAGES_FAMILY) {
    assert.ok(p.title && p.description && p.intro && p.emoji, p.slug)
    assert.ok(p.greetings.length >= 10 && p.greetings.length <= 15, p.slug)
    assert.equal(new Set(p.greetings).size, p.greetings.length, p.slug)
    assert.ok(p.tips.length >= 3 && p.faq.length >= 2, p.slug)
    assert.ok(grouped.includes(p.slug), `${p.slug} is in a hub group`)
    assert.ok(sitemap.includes(`<loc>https://ugabuga.co.il/greetings/${p.slug}</loc>`), `${p.slug} in sitemap`)
  }
})

test('seven blessings: seven items, each opens or closes correctly', () => {
  assert.equal(SEVEN_BLESSINGS.length, 7)
  assert.equal(BLESSING_SLOTS.length, 7)
  SEVEN_BLESSINGS.forEach((b, i) => assert.equal(b.n, i + 1))
  assert.match(SEVEN_BLESSINGS[0].text, /בּוֹרֵא פְּרִי הַגָּפֶן/)
  assert.match(SEVEN_BLESSINGS[6].text, /מְשַׂמֵּחַ הֶחָתָן עִם הַכַּלָּה/)
  for (const url of ['wedding/sheva-brachot', 'wedding/anniversary-ideas']) assert.ok(sitemap.includes(`<loc>https://ugabuga.co.il/${url}</loc>`), url)
})

test('anniversaryInfo: exact, between and invalid years', () => {
  assert.equal(anniversaryInfo(25).exact.name, 'חתונת כסף')
  const r = anniversaryInfo(27)
  assert.equal(r.exact, null)
  assert.equal(r.below.y, 25)
  assert.equal(r.next.y, 30)
  assert.equal(anniversaryInfo(0), null)
  assert.equal(anniversaryInfo('x'), null)
  assert.equal(anniversaryInfo(70).next, null)
})
