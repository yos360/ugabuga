import test from 'node:test'
import assert from 'node:assert/strict'
import { VOWELS, syllable } from '../src/booklets/nikudData.js'

const MARK = { patach: 'ַ', kamatz: 'ָ', tzere: 'ֵ', segol: 'ֶ', chirik: 'ִ', cholam: 'ֹ' }

test('every vowel page has six words with distinct opening letters', () => {
  assert.equal(VOWELS.length, 7)
  for (const v of VOWELS) {
    assert.equal(v.words.length, 6, v.key)
    const letters = v.words.map(([w]) => w[0])
    assert.equal(new Set(letters).size, 6, `${v.key}: opening letters repeat`)
  }
})

test('each word opens with its page vowel', () => {
  for (const v of VOWELS) for (const [word] of v.words) {
    const s = syllable(word, v.vav)
    if (v.key === 'shuruk') assert.ok(s.endsWith('וּ'), `${word}: ${s}`)
    else if (v.key === 'cholam') assert.ok(/ו[ֹֺ]/.test(s), `${word}: ${s}`)
    else assert.ok(s.normalize('NFD').includes(MARK[v.key]), `${word}: ${s}`)
  }
})
