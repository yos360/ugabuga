import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { lemmaCandidates } from '../src/utils/enLemma.js'

test('the built-in dictionary is valid and covers the English unseen texts', () => {
  const out = execFileSync(process.execPath, ['scripts/check-dictionary.mjs'], { encoding: 'utf8' })
  assert.match(out, /dictionary OK/)
})
test('word forms reduce to their headword', () => {
  const irr = { went: 'go', children: 'child' }
  for (const [w, h] of [['studied', 'study'], ['running', 'run'], ['went', 'go'], ['children', 'child'], ['makes', 'make'], ['happily', 'happy'], ['bigger', 'big'], ["Dana's", 'dana']])
    assert.ok(lemmaCandidates(w, irr).includes(h), `${w} → ${h}`)
})
