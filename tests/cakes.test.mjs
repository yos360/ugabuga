// Birthday cakes section (/cakes): recipe data, quantity formatting, ISO durations, Recipe JSON-LD.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const {
  CAKES, CAKE_TAGS, CAKE_SLUGS, CAKE_PATHS, ALLERGENS, KOSHER_LABEL, UNITS, DIGIT_BOX, DIGIT_RECTS,
  getCake, relatedCakes, formatQty, formatIngredient, isoDuration, totalMinutes, minutesLabel,
  matchesTag, recipeSchema, ageDigits, ingredientLines, stepLines,
} = await import('../src/data/cakes.js')

const ISO = /^PT(?:[1-9]\d*H)?(?:\d+M)?$/

test('unique slugs and titles, valid metadata on every page', () => {
  assert.ok(CAKES.length >= 14)
  assert.equal(new Set(CAKE_SLUGS).size, CAKES.length)
  assert.equal(new Set(CAKES.map(c => c.title)).size, CAKES.length)
  assert.equal(new Set(CAKES.map(c => c.seoTitle)).size, CAKES.length)
  const tagIds = CAKE_TAGS.map(t => t.id)
  for (const c of CAKES) {
    assert.match(c.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, c.slug)
    assert.ok(['recipe', 'guide'].includes(c.kind), c.slug)
    for (const f of ['title', 'seoTitle', 'emoji', 'description', 'summary', 'difficulty']) assert.ok(typeof c[f] === 'string' && c[f].trim(), `${c.slug} ${f}`)
    assert.ok(!c.seoTitle.includes('UGABUGA'), `${c.slug}: SEO adds the brand`)
    assert.ok(c.description.length >= 120 && c.description.length <= 160, `${c.slug} description length ${c.description.length}`)
    assert.ok(c.intro.length >= 2, `${c.slug} intro`)
    assert.ok(c.tags.length && c.tags.every(t => tagIds.includes(t)), `${c.slug} tags`)
    assert.ok(KOSHER_LABEL[c.kosher], `${c.slug} kosher`)
    assert.ok(c.allergens.every(a => ALLERGENS[a]), `${c.slug} allergens`)
    assert.ok(c.faq.length >= 3 && c.faq.every(f => f.q && f.a), `${c.slug} faq`)
    assert.ok(c.ovenC === null || (c.ovenC >= 150 && c.ovenC <= 200), `${c.slug} oven temp`)
  }
})

test('every page has ingredients and steps; recipes have real quantities', () => {
  for (const c of CAKES) {
    assert.ok(c.ingredients.length && c.ingredients.every(g => g.items.length), `${c.slug} ingredients`)
    assert.ok(c.steps.length && stepLines(c).length >= 3, `${c.slug} steps`)
    for (const it of c.ingredients.flatMap(g => g.items)) {
      assert.ok(it.name !== undefined && (it.q === null || (typeof it.q === 'number' && it.q > 0)), `${c.slug} ${it.name}`)
      assert.ok(it.u in UNITS, `${c.slug} unit ${it.u}`)
    }
    if (c.kind === 'recipe') assert.ok(c.ingredients.flatMap(g => g.items).filter(it => it.q != null).length >= 3, `${c.slug} quantities`)
  }
})

test('gluten-free, parve and vegan claims are consistent with allergens', () => {
  for (const c of CAKES) {
    if (c.tags.includes('gluten-free')) assert.ok(!c.allergens.includes('gluten'), c.slug)
    if (c.tags.includes('vegan')) { assert.equal(c.kosher, 'parve'); assert.ok(!c.allergens.includes('eggs') && !c.allergens.includes('dairy'), c.slug) }
    if (c.kosher === 'parve') assert.ok(!c.allergens.includes('dairy'), c.slug)
    if (c.tags.includes('no-bake')) assert.equal(c.time.cook, 0, c.slug)
  }
  // the gluten-free recipe must not list flour
  const gf = getCake('gluten-free-chocolate-cake')
  assert.ok(!ingredientLines(gf).some(l => /קמח/.test(l)))
})

test('hub filters: each required chip has at least one cake', () => {
  for (const tag of ['kids', 'gluten-free', 'parve', 'no-bake', 'number']) assert.ok(CAKES.some(c => matchesTag(c, tag)), tag)
  assert.equal(CAKES.filter(c => matchesTag(c, '')).length, CAKES.length)
  assert.ok(matchesTag(getCake('chocolate-birthday-cake'), 'parve'), 'dairy-or-parve counts as parve-friendly')
  assert.ok(!matchesTag(getCake('cheesecake-cups'), 'parve'))
})

test('related links point to existing cakes, not to themselves', () => {
  for (const c of CAKES) {
    assert.equal(relatedCakes(c).length, c.related.length, `${c.slug} related`)
    assert.ok(!c.related.includes(c.slug), c.slug)
  }
})

test('quantity formatting with fractions and Hebrew units', () => {
  assert.equal(formatQty(1.75), '1¾')
  assert.equal(formatQty(0.5), '½')
  assert.equal(formatQty(1 / 3), '⅓')
  assert.equal(formatQty(2), '2')
  assert.equal(formatQty(0.98), '1')
  assert.equal(formatIngredient({ q: 1, u: 'cup', name: 'סוכר' }), '1 כוס סוכר')
  assert.equal(formatIngredient({ q: 2, u: 'cup', name: 'סוכר' }), '2 כוסות סוכר')
  assert.equal(formatIngredient({ q: 0.75, u: 'cup', name: 'קקאו' }), '¾ כוס קקאו')
  assert.equal(formatIngredient({ q: 1.75, u: 'cup', name: 'קמח' }, 2), '3½ כוסות קמח')
  assert.equal(formatIngredient({ q: 3, u: 'egg', name: '' }), '3 ביצים')
  assert.equal(formatIngredient({ q: 200, u: 'g', name: 'שוקולד' }, 1.5), '300 גרם שוקולד')
  assert.equal(formatIngredient({ q: 110, u: 'g', name: 'חמאה' }, 0.5), '55 גרם חמאה')
  assert.equal(formatIngredient({ q: null, u: '', name: 'קורט מלח' }), 'קורט מלח')
  assert.equal(formatIngredient({ q: 1, u: 'cup', name: 'חלב', note: 'או מים' }), '1 כוס חלב (או מים)')
})

test('ISO 8601 durations', () => {
  assert.equal(isoDuration(45), 'PT45M')
  assert.equal(isoDuration(60), 'PT1H')
  assert.equal(isoDuration(95), 'PT1H35M')
  assert.equal(isoDuration(0), 'PT0M')
  assert.equal(minutesLabel(45), '45 דק׳')
  assert.equal(minutesLabel(120), 'שעתיים')
  assert.equal(minutesLabel(75), 'שעה ו־15 דק׳')
  for (const c of CAKES) {
    assert.ok(totalMinutes(c) > 0, c.slug)
    for (const k of ['prep', 'cook', 'chill']) assert.ok(Number.isInteger(c.time[k]) && c.time[k] >= 0, `${c.slug} ${k}`)
    assert.match(isoDuration(totalMinutes(c)), ISO, c.slug)
  }
})

test('Recipe JSON-LD builder', () => {
  const c = getCake('chocolate-birthday-cake')
  const s = recipeSchema(c)
  assert.equal(s['@context'], 'https://schema.org')
  assert.equal(s['@type'], 'Recipe')
  assert.equal(s.name, c.title)
  assert.equal(s.url, 'https://ugabuga.co.il/cakes/chocolate-birthday-cake')
  assert.equal(s.totalTime, 'PT55M')
  assert.equal(s.prepTime, 'PT15M')
  assert.equal(s.cookTime, 'PT40M')
  assert.equal(s.recipeYield, c.yieldText)
  assert.ok(s.recipeIngredient.includes('1¾ כוסות קמח לבן'))
  assert.equal(s.recipeInstructions.length, stepLines(c).length)
  assert.deepEqual(s.recipeInstructions[0], { '@type': 'HowToStep', 'position': 1, 'text': stepLines(c)[0], 'url': `${s.url}#step-1` })
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(s)))
  for (const r of CAKES) {
    const x = recipeSchema(r)
    if (r.kind !== 'recipe') { assert.equal(x, null, r.slug); continue }
    assert.match(x.totalTime, ISO)
    assert.ok(x.recipeIngredient.length >= 3 && x.recipeIngredient.every(l => typeof l === 'string' && l.trim()), r.slug)
    assert.ok(x.recipeInstructions.every(st => st.text.trim()), r.slug)
  }
  assert.equal(recipeSchema(getCake('vegan-chocolate-cake')).suitableForDiet, 'https://schema.org/VeganDiet')
  assert.equal(recipeSchema(getCake('gluten-free-chocolate-cake')).suitableForDiet, 'https://schema.org/GlutenFreeDiet')
})

test('number cake digit templates fit a 20×30 pan with bars at least 5 cm wide', () => {
  for (let d = 0; d <= 9; d++) {
    const rects = DIGIT_RECTS[d]
    assert.ok(rects?.length, `digit ${d}`)
    for (const [x, y, w, h] of rects) {
      assert.ok(x >= 0 && y >= 0 && x + w <= DIGIT_BOX.w && y + h <= DIGIT_BOX.h, `digit ${d} inside the pan`)
      assert.ok(Math.min(w, h) >= 50, `digit ${d} bar width`)
    }
  }
  assert.deepEqual(ageDigits(5), [5])
  assert.deepEqual(ageDigits('12'), [1, 2])
  assert.deepEqual(ageDigits(''), [0])
  assert.deepEqual(ageDigits(150), [9, 9])
})

test('sitemap path helper', () => {
  assert.equal(CAKE_PATHS[0], '/cakes')
  assert.equal(CAKE_PATHS.length, CAKES.length + 1)
  assert.equal(new Set(CAKE_PATHS).size, CAKE_PATHS.length)
  assert.ok(CAKE_PATHS.slice(1).every(p => /^\/cakes\/[a-z0-9-]+$/.test(p)))
})
