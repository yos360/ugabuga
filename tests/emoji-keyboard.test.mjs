// /tools/emoji: categories are well-formed and Hebrew search finds what people type
import test from 'node:test'
import assert from 'node:assert/strict'
import { EMOJI_CATS, searchEmoji } from '../src/office/keys/emojiData.js'

test('every category has unique emoji with Hebrew names', () => {
  for (const c of EMOJI_CATS) {
    assert.ok(c.items.length >= 40, c.id)
    assert.equal(new Set(c.items.map(i => i.e)).size, c.items.length, `duplicate in ${c.id}`)
    for (const i of c.items) {
      assert.match(i.name, /[א-ת]/, `${c.id} ${i.e}`)
      assert.doesNotMatch(i.e, /[א-תa-z]/i, `${c.id} ${i.words}`)
    }
  }
})

test('Hebrew search', () => {
  assert.ok(searchEmoji('לב').some(i => i.e === '❤️'))
  assert.ok(searchEmoji('לב אדום').every(i => i.words.includes('אדום')))
  assert.ok(searchEmoji('חתול').length >= 3)
  assert.ok(searchEmoji('מזל טוב').some(i => i.e === '🎉'))
  assert.ok(searchEmoji('ג׳ירפה').length === 1 && searchEmoji('גירפה').length === 1)
  assert.deepEqual(searchEmoji('  '), [])
  const all = searchEmoji('ה', 1000)
  assert.equal(new Set(all.map(i => i.e)).size, all.length)
})
