import test from 'node:test'
import assert from 'node:assert/strict'
import { presentAllowed, ZOOMS } from '../src/utils/presentMode.js'

test('projection is offered on classroom pages, not on home, owner, embeds or arcade', () => {
  for (const p of ['/learn/reading/honest-woodcutter', '/tools/countdown-timer', '/classroom', '/printables/mazes', '/math']) assert.ok(presentAllowed(p), p)
  for (const p of ['/', '/admin/activity', '/embed/timer', '/kids', '/online-games/merge-2048', '/learning']) assert.equal(presentAllowed(p), false, p)
})
test('zoom steps go up in order', () => {
  assert.deepEqual([...ZOOMS].sort((a, b) => a - b), ZOOMS)
})
