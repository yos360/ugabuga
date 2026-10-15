import test from 'node:test'
import assert from 'node:assert/strict'
import { countPath, printLabel, normalizeCounts, publicDownloadPath } from '../src/utils/printCounts.js'

test('page paths match the analytics log format', () => {
  assert.equal(countPath('/Printables/Mazes/?x=1'), '/printables/mazes')
  assert.equal(countPath('/'), '/')
})
test('the badge appears only for popular pages', () => {
  assert.equal(printLabel(7), '')
  assert.equal(printLabel(undefined), '')
  assert.match(printLabel(1245), /^הורד כ־PDF 1,245 פעמים$/)
  assert.equal(printLabel(19), '')
  assert.match(printLabel(20), /20/)
  for (const n of [NaN, Infinity, -1, 20.1, '125']) assert.equal(printLabel(n), '')
})
test('private event paths and malformed data never become public download counts', () => {
  for (const p of ['/r/abcdefgh', '/l/abcdefgh', '/admin', '/account', '/q/secret', '/printables//a', '/printables/../r/private']) assert.equal(publicDownloadPath(p), null)
  assert.equal(publicDownloadPath('/cakes/chocolate?name=private#token'), '/cakes/chocolate')
  assert.deepEqual(normalizeCounts({ total: 50, pages: { '/r/private': 25, '/cakes/a': 20, '/cakes/b': 19, '/cakes/c': '100' } }), { total: 50, pages: { '/cakes/a': 20 } })
})
