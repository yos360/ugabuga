import test from 'node:test'
import assert from 'node:assert/strict'
import { SCALES, JAZZ_CHORDS, GROOVES, formula, scaleNotes, scaleById } from '../src/music/styles/scales.js'

test('every scale starts on the root, rises inside one octave and has a backing', () => {
  for (const s of SCALES) {
    assert.equal(s.steps[0], 0, s.id)
    assert.ok(s.steps.every((v, i) => i === 0 || v > s.steps[i - 1]) && s.steps.at(-1) < 12, s.id)
    assert.ok(s.backing.length >= 2, s.id)
  }
  assert.equal(new Set(SCALES.map(s => s.id)).size, SCALES.length)
})
test('scale formulas read like a music book', () => {
  assert.deepEqual(formula(scaleById('major')), ['טון', 'טון', 'חצי', 'טון', 'טון', 'טון', 'חצי'])
  assert.deepEqual(formula(scaleById('hijaz')).slice(0, 2), ['חצי', 'טון וחצי'])
  assert.deepEqual(scaleNotes(60, scaleById('blues')), [60, 63, 65, 66, 67, 70, 72])
})
test('grooves are 16-step bars with chords', () => {
  for (const [id, g] of Object.entries(GROOVES)) {
    for (const p of Object.values(g.drums)) assert.equal(p.length, 16, id)
    assert.ok(g.chords.length && g.chords.every(c => c.every(Number.isInteger)), id)
  }
  assert.ok(JAZZ_CHORDS.every(c => c.notes[0] === 0))
})
