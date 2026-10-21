import { test } from 'node:test'
import assert from 'node:assert/strict'
import { visitorName } from '../src/utils/visitorNames.js'

test('every visitor code gets a stable made-up name', () => {
  assert.deepEqual(visitorName('3fb4a6'), visitorName('3fb4a6'))
  assert.ok(visitorName('3fb4a6').name.includes(' '))
  assert.equal(visitorName(''), null)
  const names = new Set(Array.from({ length: 200 }, (_, i) => visitorName((i * 7919 * 4099).toString(16).padStart(6, '0').slice(-6)).name))
  assert.ok(names.size > 150, `only ${names.size} different names`)
})
