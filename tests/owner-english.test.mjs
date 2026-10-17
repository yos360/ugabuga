import { test } from 'node:test'
import assert from 'node:assert/strict'
import { englishSummary, isEnglishPath } from '../src/utils/ownerEnglish.js'

test('English visits are the /en pages and the visitors who saw them', () => {
  assert.ok(isEnglishPath('/en') && isEnglishPath('/en/games'))
  assert.ok(!isEnglishPath('/english-alphabet') && !isEnglishPath('/'))
  const stats = [
    { path: '/en/games', opens: 5, uses: 2, prints: 0 },
    { path: '/en', opens: 7, uses: 0, prints: 1 },
    { path: '/games', opens: 40, uses: 9, prints: 0 },
  ]
  const data = { by_visitor: [
    { v: 'a', source: 'google', steps: [{ p: '/en' }, { p: '/en/games' }] },
    { v: 'b', source: 'direct', steps: [{ p: '/' }, { p: '/en/games' }] },
    { v: 'c', source: 'google', steps: [{ p: '/games' }] },
  ] }
  const en = englishSummary(data, stats)
  assert.deepEqual(en.pages.map(r => r.path), ['/en', '/en/games'])
  assert.equal(en.visitors.length, 2)
  assert.equal(en.landed.length, 1)
  assert.deepEqual(en.sources, [['google', 1]])
  assert.deepEqual([en.opens, en.uses, en.prints], [12, 2, 1])
})
