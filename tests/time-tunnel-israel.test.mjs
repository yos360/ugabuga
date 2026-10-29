import test from 'node:test'
import assert from 'node:assert/strict'
import { TT_ISRAEL } from '../src/data/timeTunnelIsrael.js'

test('Israel entries are well formed and each has two distinct sources', () => {
  for (const [key, items] of Object.entries(TT_ISRAEL)) {
    assert.match(key, /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/)
    for (const x of items) {
      assert.ok(Number.isInteger(x.year) && x.text.length > 10, key)
      assert.ok(['event', 'born', 'died'].includes(x.kind), key)
      assert.equal(new Set(x.srcs).size, 2, `${key}: needs two distinct sources`)
      assert.ok(x.srcs.every(u => u.startsWith('https://')), key)
    }
  }
})
