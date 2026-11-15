import test from 'node:test'
import assert from 'node:assert/strict'
import { SPA_STATIONS, SPA_SCHEDULE, SPA_SHOPPING, shoppingList } from '../src/data/spaParty.js'

test('stations and shopping items have unique ids and full content', () => {
  assert.equal(new Set(SPA_STATIONS.map(s => s.id)).size, SPA_STATIONS.length)
  assert.equal(new Set(SPA_SHOPPING.map(s => s.id)).size, SPA_SHOPPING.length)
  for (const s of SPA_STATIONS) {
    assert.ok(s.materials.length >= 3 && s.steps.length >= 3, s.id)
    assert.ok(s.young && s.older && s.safety, s.id)
  }
})

test('the schedule fills exactly two hours', () => {
  assert.equal(new Set(SPA_SCHEDULE.map(s => s.id)).size, SPA_SCHEDULE.length)
  assert.equal(SPA_SCHEDULE.reduce((t, s) => t + s.min, 0), 120)
})

test('shopping list scales with the number of kids', () => {
  let prev = 0
  for (let k = 4; k <= 20; k++) {
    const { rows, total } = shoppingList(k)
    assert.equal(total, rows.reduce((t, r) => t + r.cost, 0))
    assert.ok(total >= prev, `${k}`)
    for (const r of rows) {
      assert.ok(r.qty >= 1)
      if (r.perKids === 1) assert.equal(r.qty, k, r.id)
    }
    prev = total
  }
})
