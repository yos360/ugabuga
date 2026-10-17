import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ALL_EXPANDED_RECIPES as recipes } from '../src/data/recipesExpanded.js'
import { CAKES, recipeSchema, relatedCakes } from '../src/data/cakes.js'

const items = r => r.ingredients.flatMap(g => g.items)
// Fat by weight: butter is listed in grams; oil in ml (about 0.92 g/ml).
const fatGrams = r => items(r).reduce((n, i) => i.name.startsWith('חמאה') ? n + i.q : i.name.startsWith('שמן') && i.metricUnit === 'ml' ? n + i.metric * .92 : n, 0)
// Rolled oats do the job of flour in oat cookies, so they count with it.
const flourGrams = r => items(r).filter(i => i.name === 'קמח' || i.name === 'שיבולת שועל').reduce((n, i) => n + i.metric, 0)

test('cookie dough keeps flour:fat by weight between 1.0 and 1.7', () => {
  const cookies = recipes.filter(r => /cookies/.test(r.slug))
  assert.ok(cookies.length >= 4)
  for (const r of cookies) {
    const ratio = flourGrams(r) / fatGrams(r)
    assert.ok(ratio >= 1 && ratio <= 1.7, `${r.slug}: ${ratio.toFixed(2)}`)
  }
})

test('chocolate-chip cookies follow the classic formula, grams and cups agree', () => {
  const r = recipes.find(x => x.slug === 'chocolate-chip-cookies'), get = n => items(r).find(i => i.name.startsWith(n))
  assert.equal(get('קמח').metric / get('קמח').q, 124) // 125 g per cup, rounded
  assert.equal(get('חמאה').q, 115)
  assert.equal(items(r).find(i => i.u === 'egg').q, 1)
  assert.equal(r.ovenC, 180)
})

test('related recipes exist, exclude self and stay in the same family', () => {
  const pool = [...CAKES, ...recipes]
  const bySlug = new Map(pool.map(r => [r.slug, r]))
  // Slugs are unique across the cake hub and every expanded recipe family.
  assert.equal(new Set(pool.map(r => r.path || `/cakes/${r.slug}`)).size, bySlug.size)
  const family = r => r.path ? r.path.split('/').slice(0, -1).join('/') : '/cakes'
  for (const r of recipes) {
    assert.ok(r.related.length >= 3, r.slug)
    assert.ok(!r.related.includes(r.slug), r.slug)
    assert.equal(new Set(r.related).size, r.related.length, r.slug)
    assert.equal(relatedCakes(r).length, r.related.length, r.slug)
    for (const s of r.related) assert.ok(bySlug.has(s), `${r.slug} -> ${s}`)
    if (r.category === 'pancakes') assert.ok(r.related.every(s => bySlug.get(s).category === 'pancakes'), r.slug)
    else if (family(r) !== '/cakes') assert.ok(r.related.every(s => family(bySlug.get(s)) === family(r)), r.slug)
    else assert.ok(r.related.every(s => family(bySlug.get(s)) === '/cakes'), r.slug)
  }
  for (const slug of ['classic-challah', 'sweet-challah']) assert.ok(recipes.find(r => r.slug === slug).related.filter(s => /challah/.test(s)).length === 2, slug)
})

test('keywords come from the recipe family; birthday wording only for birthday cakes', () => {
  for (const r of recipes) {
    const k = recipeSchema(r).keywords
    assert.ok(!k.includes('עוגת יום הולדת'), `${r.slug}: ${k}`)
    assert.ok(k.length > 0, r.slug)
  }
  assert.match(recipeSchema(recipes.find(r => r.slug === 'classic-challah')).keywords, /^חלה, מתכון לשבת/)
  assert.match(recipeSchema(recipes.find(r => r.slug === 'pancakes')).keywords, /^פנקייק/)
  assert.match(recipeSchema(CAKES.find(r => r.slug === 'chocolate-birthday-cake')).keywords, /^עוגת יום הולדת/)
})

test('ages, single em dash in SEO titles, one honey-loaf pan, birthday cakes lead the hub', () => {
  const ages = Object.fromEntries(recipes.map(r => [r.slug, r.age]))
  assert.equal(ages['banana-pancakes'], '3+')
  assert.equal(ages['quick-hummus'], '4+')
  assert.equal(ages['chocolate-chip-cookies'], '6+')
  assert.ok(new Set(Object.values(ages)).size >= 3)
  for (const r of recipes) assert.ok((r.seoTitle.match(/—/g) || []).length <= 1, r.seoTitle)
  const honey = recipes.find(r => r.slug === 'honey-loaf')
  assert.doesNotMatch(honey.pan + honey.steps[0].items.join(' '), /שתי תבניות|בין התבניות/)
  assert.equal(CAKES[0].slug, 'chocolate-birthday-cake')
  assert.ok(CAKES.findIndex(c => c.path) > CAKES.findIndex(c => c.slug === 'decorating-ideas'))
})
