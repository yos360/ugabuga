// /tools/keyboard: layouts, typing Hebrew on an English computer, niqqud and caret editing
import test from 'node:test'
import assert from 'node:assert/strict'
import { KB_LAYOUTS, charFor, remapPhysical, removeNiqqud, insertAt, backspaceAt, countText, NIQQUD } from '../src/office/keys/virtualKeys.js'

test('layouts cover the same physical keys', () => {
  assert.deepEqual(Object.keys(KB_LAYOUTS.he.byCode).sort(), Object.keys(KB_LAYOUTS.en.byCode).sort())
  assert.equal(charFor('he', 'KeyA'), 'ש')
  assert.equal(charFor('he', 'Comma'), 'ת')
  assert.equal(charFor('en', 'KeyA', { shift: true }), 'A')
  assert.equal(charFor('en', 'KeyA', { caps: true }), 'A')
  assert.equal(charFor('en', 'KeyA', { caps: true, shift: true }), 'a')
  assert.equal(charFor('en', 'Digit1', { caps: true }), '1')
  assert.equal(charFor('he', 'KeyA', { shift: true }), 'ש')
})

test('an English computer types Hebrew in Hebrew mode', () => {
  const word = [['KeyA', 'a'], ['KeyK', 'k'], ['KeyU', 'u'], ['KeyO', 'o']].map(([code, key]) => remapPhysical('he', { code, key })).join('')
  assert.equal(word, 'שלום')
  assert.equal(remapPhysical('he', { code: 'KeyA', key: 'A' }), 'ש') // Caps Lock on
  assert.equal(remapPhysical('he', { code: 'Comma', key: ',' }), 'ת')
})

test('keys that already type the right language pass through', () => {
  assert.equal(remapPhysical('he', { code: 'KeyA', key: 'ש' }), null)
  assert.equal(remapPhysical('he', { code: 'Digit1', key: '1' }), null)
  assert.equal(remapPhysical('he', { code: 'KeyA', key: 'a', ctrlKey: true }), null)
  assert.equal(remapPhysical('he', { code: 'Space', key: ' ' }), null)
  assert.equal(remapPhysical('en', { code: 'KeyA', key: 'a' }), null)
  assert.equal(remapPhysical('en', { code: 'KeyA', key: 'ש' }), 'a')
})

test('niqqud and editing', () => {
  for (const n of NIQQUD) assert.match(n.mark, /^[ְ-ׂ]$/)
  assert.equal(removeNiqqud('שָׁלוֹם־עוֹלָם ״א״'), 'שלום־עולם ״א״')
  assert.deepEqual(insertAt('שלם', 2, 2, 'ו'), { text: 'שלום', caret: 3 })
  assert.deepEqual(insertAt('abc', 0, 3, 'x'), { text: 'x', caret: 1 })
  assert.deepEqual(backspaceAt('בָּ', 3, 3), { text: 'בּ', caret: 2 }) // only the last mark goes
  assert.deepEqual(backspaceAt('a🙂', 3, 3), { text: 'a', caret: 1 })
  assert.deepEqual(backspaceAt('a❤️', 3, 3), { text: 'a', caret: 1 })
  assert.deepEqual(backspaceAt('abc', 0, 0), { text: 'abc', caret: 0 })
  assert.deepEqual(countText(' שָׁלוֹם  לכם '), { chars: 11, words: 2 })
})
