import test from 'node:test'
import assert from 'node:assert/strict'
import { GREETING_GROUPS, ALL_GREETINGS, findGreeting, whatsappLink } from '../src/data/hanukkahGreetings.js'
import { wrapLines } from '../src/data/hanukkahLighting.js'

test('six recipient groups, six greetings each, all ids unique', () => {
  assert.equal(GREETING_GROUPS.length, 6)
  for (const g of GREETING_GROUPS) assert.equal(g.greetings.length, 6, g.id)
  assert.equal(new Set(GREETING_GROUPS.map(g => g.id)).size, 6)
  assert.equal(new Set(ALL_GREETINGS.map(g => g.id)).size, ALL_GREETINGS.length)
  for (const g of ALL_GREETINGS) assert.ok(g.id.startsWith(g.group + '-'), g.id)
})

test('every greeting is short enough for a small printed card', () => {
  for (const g of ALL_GREETINGS) {
    assert.ok(g.text.length <= 130, g.id)
    assert.ok(wrapLines(g.text, 27).length <= 6, g.id)
  }
})

test('unknown ids fall back to the first greeting; WhatsApp link encodes the text', () => {
  assert.equal(findGreeting('nope').id, ALL_GREETINGS[0].id)
  assert.equal(findGreeting('kids-3').group, 'kids')
  assert.equal(whatsappLink('חג שמח!'), 'https://wa.me/?text=' + encodeURIComponent('חג שמח!'))
})
