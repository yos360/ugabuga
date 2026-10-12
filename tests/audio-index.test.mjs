import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

// build-index.mjs used to overwrite the stories index with [] — the recorded stories then stopped playing.
test('the bedtime stories index lists the recorded stories', () => {
  const idx = JSON.parse(readFileSync(new URL('../public/audio/stories/index.json', import.meta.url), 'utf8'))
  assert.equal(Array.isArray(idx), false)
  assert.ok(Object.keys(idx).length >= 10)
})
