// Supplier category landing pages (/suppliers/category/:type).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
const {
  SUPPLIER_CATEGORY_PAGES, SUPPLIER_AREA_SLUGS, categoryPageBySlug, categoryPagePath, suppliersForPage,
  supplierPageTitle, supplierSchema, areaBySlug, areaSlugOf,
} = await import('../src/data/supplierCategoryPages.js')
const { SUPPLIER_CATEGORIES, SUPPLIER_AREAS } = await import('../src/data/supplierOptions.js')

const ORIGINAL_IDS = ['entertainers', 'magic', 'cakes', 'photo', 'video', 'balloons', 'inflatables', 'music', 'venues', 'catering', 'crafts', 'design', 'costumes', 'other']

test('stored category ids stay stable and are unique', () => {
  const ids = SUPPLIER_CATEGORIES.map(c => c[0])
  for (const id of ORIGINAL_IDS) assert.ok(ids.includes(id), `missing original id ${id}`)
  assert.equal(new Set(ids).size, ids.length)
  for (const id of ids) assert.ok(id.length <= 40, `${id} fits the DB column limit`)
})

test('every category (except the catch-all "other") has exactly one landing page', () => {
  const ids = SUPPLIER_CATEGORIES.map(c => c[0]).filter(id => id !== 'other')
  assert.deepEqual([...SUPPLIER_CATEGORY_PAGES.map(p => p.id)].sort(), [...ids].sort())
  assert.ok(SUPPLIER_CATEGORY_PAGES.length >= 20)
})

test('slugs, titles, H1s and descriptions are unique and well-sized', () => {
  for (const f of ['slug', 'title', 'h1', 'description', 'short']) {
    assert.equal(new Set(SUPPLIER_CATEGORY_PAGES.map(p => p[f])).size, SUPPLIER_CATEGORY_PAGES.length, `unique ${f}`)
  }
  for (const p of SUPPLIER_CATEGORY_PAGES) {
    assert.match(p.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, p.slug)
    assert.ok(!p.title.includes('UGABUGA'), `${p.slug} title must not carry the site suffix`)
    assert.ok(p.title.length >= 20 && p.title.length <= 60, `${p.slug} title length ${p.title.length}`)
    assert.ok(p.description.length >= 120 && p.description.length <= 160, `${p.slug} description length ${p.description.length}`)
    assert.equal(categoryPageBySlug(p.slug), p)
  }
})

test('each page has substantive content', () => {
  for (const p of SUPPLIER_CATEGORY_PAGES) {
    assert.ok(p.intro.length > 80, `${p.slug} intro`)
    assert.ok(p.ages.length > 30, `${p.slug} ages`)
    assert.ok(p.includes.length >= 3, `${p.slug} includes`)
    assert.ok(p.considerations.length >= 3, `${p.slug} considerations`)
    assert.ok(p.ask.length >= 4, `${p.slug} checklist`)
    assert.ok(p.faq.length >= 3 && p.faq.length <= 4, `${p.slug} faq`)
    assert.ok(p.diy.length >= 2, `${p.slug} diy links`)
    for (const r of p.related) assert.ok(categoryPageBySlug(r) && r !== p.slug, `${p.slug} related ${r}`)
    // no price claims without verified sources
    assert.ok(!/₪|ש"ח|שקלים|\d\s*שקל/.test(JSON.stringify(p)), `${p.slug} has no prices`)
  }
})

// Route check: static App.jsx routes, or a param route whose concrete URL is in the static sitemap.
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
const routes = [...app.matchAll(/path="([^"]+)"/g)].map(m => m[1]).filter(r => r !== '*' && !r.includes('*'))
const staticRoutes = new Set(routes.filter(r => !r.includes(':')))
const paramRoutes = routes.filter(r => r.includes(':')).map(r => new RegExp(`^${r.replace(/:[a-zA-Z]+/g, '[^/]+')}$`))
const inSitemap = href => sitemap.includes(`<loc>https://ugabuga.co.il${href}</loc>`)
const routeExists = href => staticRoutes.has(href) || (paramRoutes.some(re => re.test(href)) && inSitemap(href))

test('all internal links on category pages point to existing routes', () => {
  for (const p of SUPPLIER_CATEGORY_PAGES) for (const l of p.diy) {
    assert.ok(l.label && l.href.startsWith('/'), `${p.slug} link shape`)
    assert.ok(routeExists(l.href), `${p.slug}: ${l.href} is not a known route`)
  }
  for (const r of ['/suppliers', '/suppliers/me']) assert.ok(staticRoutes.has(r), r)
})

test('area slugs cover every regional area', () => {
  const regional = SUPPLIER_AREAS.filter(a => a !== 'כל הארץ')
  assert.deepEqual(SUPPLIER_AREA_SLUGS.map(a => a[1]).sort(), [...regional].sort())
  for (const [slug, name] of SUPPLIER_AREA_SLUGS) { assert.equal(areaBySlug(slug), name); assert.equal(areaSlugOf(name), slug) }
  assert.equal(areaBySlug('nope'), '')
})

test('suppliersForPage matches category, keywords and area', () => {
  const magic = categoryPageBySlug('magic'), clowns = categoryPageBySlug('clowns')
  const list = [
    { id: 1, category: 'magic', area: 'צפון', name: 'א' },
    { id: 2, category: 'magic', area: 'כל הארץ', name: 'ב' },
    { id: 3, category: 'magic', area: 'דרום', name: 'ג' },
    { id: 4, category: 'entertainers', area: 'צפון', name: 'ד', tags: ['ליצן לגן'] },
  ]
  assert.deepEqual(suppliersForPage(magic, list).map(s => s.id), [1, 2, 3])
  assert.deepEqual(suppliersForPage(magic, list, 'צפון').map(s => s.id), [1, 2])
  assert.deepEqual(suppliersForPage(clowns, list).map(s => s.id), [4])
  assert.deepEqual(suppliersForPage(magic, null), [])
})

test('supplier page title and LocalBusiness schema', () => {
  assert.equal(supplierPageTitle({ name: 'דני', category: 'magic', area: 'צפון' }), 'דני — קוסם ליום הולדת בצפון')
  assert.equal(supplierPageTitle({ name: 'דני', category: 'other', area: '' }), 'דני')
  assert.equal(supplierPageTitle({ name: 'דני', category: 'inflatables', area: 'כל הארץ' }), 'דני — מתנפחים להשכרה בכל הארץ')
  const s = supplierSchema({ name: 'דני', slug: 'dani', category: 'magic', area: 'שרון', instagram: 'https://instagram.com/dani', facebook: '', phone: '050-0000000' })
  assert.equal(s['@type'], 'LocalBusiness')
  assert.equal(s.url, 'https://ugabuga.co.il/suppliers/dani')
  assert.deepEqual(s.sameAs, ['https://instagram.com/dani'])
  assert.equal(s.areaServed.name, 'שרון, ישראל')
  assert.ok(!('description' in s) && !('image' in s))
  assert.equal(supplierSchema({ name: 'x', slug: 'xx', area: 'כל הארץ' }).areaServed['@type'], 'Country')
  assert.equal(categoryPagePath('magic'), '/suppliers/category/magic')
})
