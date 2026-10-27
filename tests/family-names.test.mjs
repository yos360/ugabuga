import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { FAMILY_NAMES, NAME_CATEGORIES, ORIGINS, categoryBySlug, explainName, familyName } from '../src/data/familyNames.js'

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('family names are complete, unique and never clash with a category page', () => {
  const slugs = new Set(), names = new Set()
  const catSlugs = Object.values(NAME_CATEGORIES).map(c => c.path.split('/').pop())
  for (const x of FAMILY_NAMES) {
    assert.match(x.slug, /^[a-z0-9-]+$/, x.slug)
    assert.ok(!slugs.has(x.slug) && !names.has(x.name), `duplicate ${x.slug}`)
    slugs.add(x.slug); names.add(x.name)
    assert.ok(!catSlugs.includes(x.slug), `${x.slug} clashes with a category page`)
    assert.ok(NAME_CATEGORIES[x.cat], `${x.slug}: unknown category ${x.cat}`)
    assert.ok(ORIGINS[x.origin], `${x.slug}: unknown origin ${x.origin}`)
    assert.ok(x.meaning.length >= 10 && x.en, `${x.slug}: meaning and English spelling`)
    if (x.cat === 'occupation') assert.ok(x.job, `${x.slug}: a trade name says which trade`)
  }
  for (const c of Object.values(NAME_CATEGORIES)) assert.ok(categoryBySlug(c.path.split('/').pop()), c.path)
})

test('only the CBS-published ranks are shown', () => {
  // CBS press release 051/2017: Cohen, Levi, Mizrahi, Peretz, Biton, Dahan, Avraham, Friedman.
  const ranked = FAMILY_NAMES.filter(x => x.top).sort((a, b) => a.top - b.top).map(x => x.slug)
  assert.deepEqual(ranked, ['cohen', 'levi', 'mizrahi', 'peretz', 'biton', 'dahan', 'abraham', 'friedman'])
})

test('the name explainer finds listed names and only gives general rules otherwise', () => {
  assert.equal(explainName('רבינוביץ').exact.slug, 'rabinovich')
  assert.equal(explainName('בן גוריון').exact.slug, 'ben-gurion')
  assert.equal(explainName('ויסוצקי').cat, 'place')
  assert.equal(explainName('גולדפרב').none, true)
  assert.equal(explainName('א'), null)
  assert.equal(familyName('cohen').name, 'כהן')
})

test('every family-name page is routed, in the sitemap and in the site search', () => {
  assert.match(read('src/App.jsx'), /path="\/family-names\/:slug" element=\{<FamilyNameRoute \/>\}/)
  const sitemap = read('public/sitemap-static.xml')
  for (const p of ['/family-names', ...Object.values(NAME_CATEGORIES).map(c => c.path), ...FAMILY_NAMES.map(x => `/family-names/${x.slug}`)]) assert.ok(sitemap.includes(`https://ugabuga.co.il${p}</loc>`), p)
  assert.match(read('src/data/searchStatic.js'), /FAMILY_NAMES\.map\(x => \(\{ to: familyNamePath\(x\)/)
})
