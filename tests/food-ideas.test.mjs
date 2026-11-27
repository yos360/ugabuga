import { test } from 'node:test'
import assert from 'node:assert/strict'
const { SNACKS, BREAKFASTS, AGE_GROUPS, ALLERGEN_LABELS, filterIdeas, weeklyPlan } = await import('../src/data/foodIdeas.js')
const { getCake, recipeSchema } = await import('../src/data/cakes.js')

test('both idea lists have 20 complete, unique ideas', () => {
  for (const list of [SNACKS, BREAKFASTS]) {
    assert.equal(list.length, 20)
    assert.equal(new Set(list.map(x => x.id)).size, 20)
    assert.equal(new Set(list.map(x => x.n)).size, 20)
    for (const x of list) {
      assert.ok(x.n && x.e && x.tip, x.id)
      assert.ok(x.a.length && x.a.every(a => AGE_GROUPS.some(g => g.id === a)), `${x.id} ages`)
      assert.ok(x.al.every(a => ALLERGEN_LABELS[a]), `${x.id} allergens`)
      assert.ok(x.ing.length >= 1 && x.ing.every(s => s.trim()), `${x.id} ingredients`)
      assert.ok(x.st.length >= 1 && x.st.every(s => s.trim()), `${x.id} steps`)
      assert.ok(x.m > 0 && x.m <= 60, `${x.id} minutes`)
    }
  }
})

test('filters and weekly plan', () => {
  assert.ok(filterIdeas(SNACKS, { noNuts: true }).every(x => !x.al.includes('nuts') && !x.al.includes('peanut')))
  assert.ok(filterIdeas(BREAKFASTS, { noDairy: true, noEgg: true }).every(x => !x.al.includes('dairy') && !x.al.includes('egg')))
  assert.ok(filterIdeas(SNACKS, { age: 'tot' }).every(x => x.a.includes('tot')))
  assert.ok(filterIdeas(SNACKS, { lunchbox: true }).every(x => x.lb))
  const plan = weeklyPlan(SNACKS, 5, 0)
  assert.equal(plan.length, 5)
  assert.equal(new Set(plan.map(x => x.id)).size, 5)
  assert.deepEqual(weeklyPlan([], 5), [])
})

test('toddler ideas avoid choking hazards', () => {
  for (const x of [...SNACKS, ...BREAKFASTS].filter(x => x.a.includes('tot'))) {
    assert.ok(!/פופקורן|אגוז שלם|ענבים שלמים/.test(x.n), x.id)
  }
})

test('gluten-free cake recipe: no flour, valid schema', () => {
  const c = getCake('gluten-free-cake')
  assert.ok(c)
  assert.ok(!c.ingredients.flatMap(g => g.items).some(i => /קמח חיטה|קמח לבן|קמח תופח/.test(i.name)))
  assert.ok(c.tags.includes('gluten-free'))
  const s = recipeSchema(c)
  assert.equal(s['@type'], 'Recipe')
  assert.equal(s.suitableForDiet, 'https://schema.org/GlutenFreeDiet')
  assert.ok(getCake('butter-cookies').kidsTasks.length >= 3)
})
