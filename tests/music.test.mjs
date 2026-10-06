// Music area: every song parses into real notes, and chord shapes are well formed.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { SONGS, parseNotes, rangeFor } = await import('../src/music/songs.js')
const { midi, noteName } = await import('../src/music/audio.js')

test('note names round-trip', () => {
  assert.equal(midi('C4'), 60); assert.equal(midi('A4'), 69); assert.equal(midi('Bb3'), 58); assert.equal(noteName(61), 'C#4')
})

test('every song parses, fits a sane range and has unique slugs', () => {
  assert.equal(new Set(SONGS.map(s => s.slug)).size, SONGS.length)
  for (const s of SONGS) {
    const seq = parseNotes(s.notes)
    assert.ok(seq.length >= 10, s.slug)
    for (const x of seq) { assert.ok(Number.isInteger(x.n) && x.n >= 43 && x.n <= 84, `${s.slug}: bad note`); assert.ok(x.d > 0 && x.d <= 4, `${s.slug}: bad duration`) }
    const r = rangeFor(seq)
    assert.ok(r.from % 12 === 0 && r.to - r.from >= 24 && Math.min(...seq.map(x => x.n)) >= r.from && Math.max(...seq.map(x => x.n)) <= r.to, s.slug)
  }
})

test('well-known openings', () => {
  const first = slug => parseNotes(SONGS.find(s => s.slug === slug).notes).slice(0, 7).map(x => noteName(x.n)).join(' ')
  assert.equal(first('twinkle-twinkle'), 'C4 C4 G4 G4 A4 A4 G4')
  assert.equal(first('ode-to-joy'), 'E4 E4 F4 G4 G4 F4 E4')
  assert.equal(first('fur-elise'), 'E5 D#5 E5 D#5 E5 B4 D5')
})
