// /learn content sanity: dictation lists, reading questions, flashcard decks
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { DICTATION, READING, DECKS, plainWord } = await import('../src/learn/learnData.js')

test('dictation lists are clean Hebrew words without duplicates', () => {
  for (const d of DICTATION) {
    assert.ok(d.words.length >= 10, d.id)
    assert.equal(new Set(d.words).size, d.words.length, d.id)
    for (const w of d.words) assert.match(plainWord(w), /^[א-ת]+$/, `${d.id}: ${w}`)
  }
  assert.equal(plainWord('שׂמחה'), 'שמחה')
})
test('final letters only at the end of a word', () => {
  for (const d of DICTATION) for (const w of d.words) assert.doesNotMatch(plainWord(w).slice(0, -1), /[ךםןףץ]/, w)
  for (const d of DICTATION) for (const w of d.words) assert.doesNotMatch(plainWord(w).slice(-1), /[כמנפצ]/, w)
})
test('every reading question has a valid answer and unique options', () => {
  const slugs = new Set()
  for (const r of READING) {
    assert.ok(!slugs.has(r.slug)); slugs.add(r.slug)
    assert.ok(r.text.length >= 3 && r.open, r.slug)
    for (const [q, opts, c] of r.q) {
      assert.equal(opts.length, 4, q)
      assert.ok(c >= 0 && c < opts.length, q)
      assert.equal(new Set(opts).size, 4, q)
    }
  }
})
test('flashcard decks have two filled sides', () => {
  for (const d of DECKS) for (const c of d.cards) { assert.equal(c.length, 2); assert.ok(c[0] && c[1], d.id) }
})
