import test from 'node:test'
import assert from 'node:assert/strict'
import { LETTERS, SENTENCES, SOUNDS, WORDS, analyze, readable, syllable } from '../src/data/readingByLetters.js'

const ALL_SOUNDS = SOUNDS.map(s => s.id)

test('every word and sentence is pointed, unique and readable with the full alphabet', () => {
  assert.equal(new Set(WORDS).size, WORDS.length)
  assert.equal(new Set(SENTENCES).size, SENTENCES.length)
  for (const t of [...WORDS, ...SENTENCES]) {
    const a = analyze(t)
    assert.ok(a.sounds.length > 0, `${t}: has nikud`)
    assert.ok(a.letters.every(l => LETTERS.includes(l)), `${t}: only Hebrew letters`)
    assert.ok(readable(t, LETTERS, ALL_SOUNDS), t)
  }
})

test('the analyzer treats וֹ / וּ as vowels, final letters as base letters, and a final silent shva as nothing', () => {
  assert.deepEqual(analyze('שָׁלוֹם'), { letters: ['ש', 'ל', 'מ'], sounds: ['a', 'o'] })
  assert.deepEqual(analyze('סוּס'), { letters: ['ס'], sounds: ['u'] })
  assert.deepEqual(analyze('מֶלֶךְ'), { letters: ['מ', 'ל', 'כ'], sounds: ['e'] })
  assert.ok(analyze('אַרְנָב').sounds.includes('shva'))
})

test('a first-week selection only gets words made of those letters', () => {
  const letters = [...'אבגדמ'], sounds = ['a']
  const words = WORDS.filter(w => readable(w, letters, sounds))
  assert.ok(words.includes('אַבָּא') && words.includes('דָּג') && words.includes('גָּמָל'))
  assert.ok(!words.includes('כֶּלֶב') && !words.includes('שָׁלוֹם'))
  assert.equal(syllable('ב', 'o'), 'בֹּ')
  assert.equal(syllable('ש', 'u'), 'שׁוּ')
})
