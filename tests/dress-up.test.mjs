import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// The item data is JSX, so the test reads the declarations (id, slot, name, tags) from the source.
const src = readFileSync(new URL('../src/arcade/data/dressUpItems.jsx', import.meta.url), 'utf8')
const items = [...src.matchAll(/\{ id: '([^']+)', slot: '([^']+)', name: ['"]([^'"]+)['"], tags: \[([^\]]*)\]/g)]
  .map(m => ({ id: m[1], slot: m[2], name: m[3], tags: m[4].split(',').map(t => t.trim().replace(/'/g, '')).filter(Boolean) }))
const SLOTS = ['hat', 'top', 'bottom', 'shoes', 'face', 'extra']
const OCCASIONS = ['winter', 'summer', 'birthday', 'purim']

test('dress-up: every item has a unique id, a known slot and a Hebrew name', () => {
  assert.ok(items.length >= 35, `found ${items.length} items`)
  assert.equal(new Set(items.map(i => i.id)).size, items.length)
  for (const i of items) {
    assert.ok(SLOTS.includes(i.slot), i.id)
    assert.ok(i.id.startsWith(i.slot + '-'), i.id)
    assert.match(i.name, /[א-ת]/)
    assert.ok(i.tags.length > 0 && i.tags.every(t => [...OCCASIONS, 'all'].includes(t)), i.id)
  }
})

test('dress-up: every occasion offers clothes for the body slots and something for each slot', () => {
  for (const occ of OCCASIONS) {
    for (const slot of SLOTS) {
      const n = items.filter(i => i.slot === slot && (i.tags.includes(occ) || i.tags.includes('all'))).length
      assert.ok(n >= 1, `${occ}/${slot} has no items`)
    }
    for (const slot of ['hat', 'top', 'bottom', 'shoes']) {
      assert.ok(items.filter(i => i.slot === slot && i.tags.includes(occ)).length >= 1, `${occ}/${slot} has no item made for it`)
    }
  }
})

test('dress-up: the default outfit uses items that exist', () => {
  const def = src.match(/DEFAULT_OUTFIT = \{([^}]*)\}/)[1]
  for (const id of [...def.matchAll(/'([^']+)'/g)].map(m => m[1])) assert.ok(items.some(i => i.id === id), id)
})
