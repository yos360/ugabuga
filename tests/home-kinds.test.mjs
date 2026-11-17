import test from 'node:test'
import assert from 'node:assert/strict'
import { KINDS, KIND_DEFAULT, kindCards } from '../src/data/homeKinds.js'
import { HOME_KINDS } from '../src/utils/experiments.js'
import { ITEMS, STARS } from '../src/data/homeCards.js'

test('every home kind has a headline, a lead, all four doors and cards', () => {
  assert.deepEqual(Object.keys(KINDS).sort(), [...HOME_KINDS].sort())
  assert.ok(KINDS[KIND_DEFAULT])
  for (const [id, k] of Object.entries(KINDS)) {
    assert.ok(k.h1.length > 20 && k.lead.length > 20, id)
    assert.deepEqual([...k.doors].sort(), ['class', 'gan', 'play', 'print'], `${id} doors`)
    assert.equal(k.doors[0], id, `${id} puts its own door first`)
    assert.ok(k.cardsTitle, id)
  }
})

test('every pick resolves to a real card and kinds do not show broken or duplicate cards', () => {
  const pool = [...STARS, ...ITEMS]
  for (const id of Object.keys(KINDS)) {
    const wanted = KINDS[id].picks.length, cards = kindCards(id, pool)
    assert.equal(cards.length, wanted, `${id}: some pick is not in the pool`)
    assert.equal(new Set(cards.map(c => c[3])).size, cards.length, `${id} has a duplicate`)
    for (const c of cards) assert.ok(c[0] && c[1] && c[2] && c[3].startsWith('/'), `${id} ${c[3]}`)
  }
})
