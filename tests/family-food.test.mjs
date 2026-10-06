// School-lunch ideas: data sanity — kashrut groups are consistent, allergens are flagged.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { SANDWICHES, ALLERGENS, KINDS, BREADS } = await import('../src/family/foodData.js')
const { RECIPES, EXPERIMENTS } = await import('../src/family/kidsKitchen.js')

const DAIRY = /גבינ|קוטג|לבנה|חלב|יוגורט|שמנת|חמאה(?! בוטנים)/
const MEAT = /עוף|פסטרמה|שניצל עוף|קציצות|הודו|בקר/
test('sandwiches: kinds, allergens and breads are valid and consistent', () => {
  assert.ok(SANDWICHES.length >= 40)
  assert.equal(new Set(SANDWICHES.map(s => s.id)).size, SANDWICHES.length)
  for (const s of SANDWICHES) {
    const all = s.shop.join(' ')
    assert.ok(KINDS[s.kind], s.id); assert.ok(BREADS[s.bread], s.id)
    for (const a of s.al) assert.ok(ALLERGENS[a], `${s.id}: ${a}`)
    if (s.kind === 'meat') assert.ok(!DAIRY.test(all), `${s.id}: meat with dairy`)
    if (s.kind === 'parve') assert.ok(!DAIRY.test(all) && !MEAT.test(all), `${s.id}: parve with dairy/meat`)
    if (DAIRY.test(all)) assert.ok(s.al.includes('dairy'), `${s.id}: dairy not flagged`)
    if (/בוטנים/.test(all)) assert.ok(s.al.includes('peanut'), `${s.id}: peanut not flagged`)
    if (/טחינה|חומוס|זעתר/.test(all)) assert.ok(s.al.includes('sesame'), `${s.id}: sesame not flagged`)
    if (/ביצ|מיונז|שניצל עוף|קציצות/.test(all)) assert.ok(s.al.includes('egg'), `${s.id}: egg not flagged`)
    if (/טונה/.test(all)) assert.ok(s.al.includes('fish'), `${s.id}: fish not flagged`)
    if (s.vegan) assert.ok(!s.al.some(a => ['dairy', 'egg', 'fish'].includes(a)) && !/דבש/.test(all), `${s.id}: not vegan`)
    if (s.bread !== 'ricecake') assert.ok(s.al.includes('gluten'), `${s.id}: bread without gluten flag`)
  }
})

test('recipes and experiments are complete', () => {
  for (const r of RECIPES) assert.ok(r.ingredients.length >= 3 && r.steps.length >= 3 && r.slug, r.slug)
  for (const x of EXPERIMENTS) assert.ok(x.materials.length >= 2 && x.steps.length >= 3 && x.why.length > 30, x.slug)
  assert.equal(new Set(RECIPES.map(r => r.slug)).size, RECIPES.length)
})
