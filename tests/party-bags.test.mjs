import test from 'node:test'
import assert from 'node:assert/strict'
import { BAG_AGES, BAG_BUDGETS, BAG_ITEMS, itemsFor, sampleBag } from '../src/data/partyBags.js'

const AGE_IDS = BAG_AGES.map(a => a.id)

test('items have unique ids and only known ages', () => {
  assert.equal(new Set(BAG_ITEMS.map(i => i.id)).size, BAG_ITEMS.length)
  for (const i of BAG_ITEMS) {
    assert.ok(i.ages.length > 0, i.id)
    for (const a of i.ages) assert.ok(AGE_IDS.includes(a), `${i.id}: ${a}`)
  }
})

test('ages 2-3 never get items with small parts', () => {
  for (const i of BAG_ITEMS) if (i.ages.includes('toddler')) assert.equal(i.smallParts, false, i.id)
  assert.ok(itemsFor('toddler').every(i => !i.smallParts))
})

test('every age and budget gets a sample bag inside the budget', () => {
  for (const age of AGE_IDS) for (const b of BAG_BUDGETS) for (const clean of [false, true]) {
    const { items, total } = sampleBag(age, b.max, clean)
    assert.ok(items.length >= 2, `${age}/${b.id}/${clean}`)
    assert.ok(items.length <= 4)
    assert.equal(total, items.reduce((s, i) => s + i.price, 0))
    assert.ok(total <= b.max, `${age}/${b.id}: ${total}`)
    assert.ok(items.filter(i => i.price === 0).length <= 1)
    for (const i of items) {
      assert.ok(i.ages.includes(age))
      if (clean) assert.ok(!i.plastic && !i.sweet, i.id)
    }
  }
})
