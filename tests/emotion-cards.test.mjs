import test from 'node:test'
import assert from 'node:assert/strict'
import { EMOTIONS, emotionLabel } from '../src/data/emotionCards.js'

const plain = t => t.replace(/[֑-ׇ]/g, '')

test('24 unique emotions; the pointed forms spell the same words as the plain ones', () => {
  assert.equal(EMOTIONS.length, 24)
  assert.equal(new Set(EMOTIONS.map(x => x.id)).size, 24)
  for (const x of EMOTIONS) {
    assert.ok(x.emoji && x.q.length > 8, x.id)
    // Nikud only adds marks — and full spelling may add a י or ו (עָיֵף / עייף), never other letters.
    for (const [p, n] of [[x.m, x.mn], [x.f, x.fn]]) assert.equal(plain(n).replace(/[יו]/g, ''), p.replace(/[יו]/g, ''), `${x.id}: ${n} vs ${p}`)
  }
})

test('labels: boy, girl, or both — one word when the forms are the same', () => {
  const happy = EMOTIONS.find(x => x.id === 'happy'), proud = EMOTIONS.find(x => x.id === 'proud')
  assert.equal(emotionLabel(happy, 'both', false), 'שמח / שמחה')
  assert.equal(emotionLabel(happy, 'f', true), 'שְׂמֵחָה')
  assert.equal(emotionLabel(proud, 'both', false), 'גאה')
})
