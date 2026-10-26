// Buying guides (/recommended): one guide per affiliate topic, answer-first content, honest schema
// (no Product/Offer/rating/price), registered everywhere a page must be, and listed in llms.txt.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { AFFILIATE_TOPICS, affiliateForPath, affiliateProducts } from '../src/data/affiliate.js'
import { BUYING_GUIDES, BUYING_BY_ID, BUYING_HUB, buyingPath, buyingGuideSchemas, buyingHubSchemas } from '../src/data/buyingGuides.js'

const read = p => readFileSync(new URL(p, import.meta.url), 'utf8')
const app = read('../src/App.jsx')
const routes = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map(m => m[1])
const STATIC = new Set(routes.filter(p => !p.includes(':') && !p.includes('*')))
const PARAM = routes.filter(p => p.includes(':') || p.endsWith('/*')).map(p => new RegExp(`^${p.replace(/\/\*$/, '(/.*)?').replace(/:[^/]+/g, '[^/]+')}$`))
const routeExists = href => STATIC.has(href) || PARAM.some(re => re.test(href))

test('every affiliate topic has a buying guide, and every guide a topic', () => {
  assert.deepEqual(BUYING_GUIDES.map(g => g.id).sort(), AFFILIATE_TOPICS.map(t => t.id).sort())
})

test('each guide is complete: quick answer, age criteria, checklist, avoid, budget, links, 5–7 FAQs', () => {
  for (const g of BUYING_GUIDES) {
    assert.ok(g.title && g.seoTitle && g.description && g.short && g.audience && g.emoji, g.id)
    assert.ok(g.quick.q && g.quick.a.length > 80 && g.quick.rows.length >= 3, `${g.id}: quick`)
    assert.ok(g.choose.length >= 3, `${g.id}: choose`)
    assert.ok(g.items.length >= 10, `${g.id}: items`)
    for (const it of g.items) assert.ok(it.name && it.age && it.when && it.why, `${g.id}: ${it.name}`)
    assert.equal(new Set(g.items.map(i => i.name)).size, g.items.length, `${g.id}: duplicate item`)
    assert.ok(g.avoid.length >= 3 && g.budget.length >= 3, `${g.id}: avoid/budget`)
    assert.ok(g.faq.length >= 5 && g.faq.length <= 7, `${g.id}: faq`)
    assert.ok(g.related.length >= 3, `${g.id}: related`)
    for (const r of g.related) assert.ok(routeExists(r.href), `${g.id}: ${r.href} is not a route`)
    assert.ok(routeExists(g.sectionPath), `${g.id}: ${g.sectionPath}`)
    // Item types, not brands or prices.
    assert.doesNotMatch(JSON.stringify(g), /₪|\$\d|ש"ח|ש״ח|שקלים/, `${g.id}: no prices`)
  }
  assert.equal(BUYING_GUIDES.find(g => g.id === 'travel').items.length, 15)
})

const demo = [{ id: 'travel', title: 't', placements: ['/travel'], products: [
  { name: 'אוזניות', url: 'https://s.click.aliexpress.com/e/_x1', image: 'https://ae01.alicdn.com/a.jpg' },
  { name: 'רע', url: 'http://bad', image: 'https://ae01.alicdn.com/b.jpg' },
] }]

test('structured data: Article + FAQPage + ItemList, never Product/Offer/rating/price', () => {
  for (const g of BUYING_GUIDES) {
    const products = affiliateProducts(g.id)
    const schemas = buyingGuideSchemas(g, products)
    assert.deepEqual(schemas.map(s => s['@type']), ['Article', 'FAQPage', 'ItemList'])
    assert.equal(schemas[1].mainEntity.length, g.faq.length)
    assert.equal(schemas[2].itemListElement.length, g.items.length + products.length)
    assert.doesNotMatch(JSON.stringify(schemas), /"Product"|"Offer"|AggregateRating|"Review"|ratingValue|"price"|priceCurrency|"offers"/)
  }
  // With products, they are appended as plain ListItems (name + url).
  const withProducts = buyingGuideSchemas(BUYING_BY_ID.travel, affiliateProducts('travel', demo))
  const last = withProducts[2].itemListElement.at(-1)
  assert.deepEqual(Object.keys(last).sort(), ['@type', 'name', 'position', 'url'])
  assert.equal(last.url, demo[0].products[0].url)
  assert.doesNotMatch(JSON.stringify([withProducts, buyingHubSchemas()]), /"Product"|"Offer"|rating|"price"/)
})

test('the layout box never doubles the guide grid, and kids/games stay affiliate-free', () => {
  const box = [{ ...demo[0], placements: ['/travel', '/recommended'] }]
  for (const p of ['/recommended', '/recommended/travel']) assert.equal(affiliateForPath(p, box), null, p)
  for (const p of ['/kids', '/games/birthday', '/online-games/snake']) assert.equal(affiliateForPath(p, box), null, p)
})

test('routes, sitemap, menu, search and section links are registered', async () => {
  const sitemap = read('../public/sitemap-static.xml')
  const paths = [BUYING_HUB.path, ...BUYING_GUIDES.map(g => buyingPath(g.id))]
  for (const p of paths) {
    assert.ok(STATIC.has(p), `route ${p}`)
    assert.ok(sitemap.includes(`<loc>https://ugabuga.co.il${p}</loc>`), `sitemap ${p}`)
  }
  const { MENU_DOMAINS, activeDomainFor } = await import('../src/data/siteMenu.js')
  assert.ok(MENU_DOMAINS.find(d => d.id === 'family').groups.some(g => g.items.some(i => i.to === '/recommended')))
  assert.equal(activeDomainFor('/recommended/travel'), 'family')
  const search = read('../src/data/searchStatic.js')
  assert.match(search, /BUYING_GUIDES\.map/)
  // Each guide is linked from its section page.
  const sources = { travel: '../src/travel/TravelPage.jsx', party: '../src/pages/HubPage.jsx', teacher: '../src/pages/HubPage.jsx', crafts: '../src/pages/printables/ColoringPages.jsx', speech: '../src/pages/speech/SpeechHub.jsx', hanukkah: '../src/pages/holidays/HanukkahHub.jsx' }
  for (const [id, file] of Object.entries(sources)) assert.match(read(file), new RegExp(`<BuyingGuideLink id="${id}"`), id)
  // The link labels (kept light in the component) match the start of each guide's title.
  const linkSrc = read('../src/components/ui/BuyingGuideLink.jsx')
  for (const g of BUYING_GUIDES) {
    const label = linkSrc.match(new RegExp(`\\b${g.id}: '([^']+)'`))?.[1]
    assert.ok(label && g.title.startsWith(label), `${g.id}: link label`)
  }
})

test('llms.txt generator has the buying guides section', () => {
  const src = read('../scripts/generate-llms.mjs')
  assert.match(src, /## המלצות לקנייה/)
  assert.match(src, /BUYING_GUIDES\.map/)
})
