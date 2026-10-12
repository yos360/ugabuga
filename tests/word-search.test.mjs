import test from 'node:test'
import assert from 'node:assert/strict'
import { wordSearch } from '../src/utils/wordSearchGrid.js'

test('every word is placed, the grid is full, and the same seed gives the same grid', () => {
  const words = ['חנוכייה', 'סופגניות', 'המכבים', 'ביתהמקדש', 'יהודה', 'אנטיוכוס', 'לביבות', 'פךהשמן', 'נסגדול', 'מודיעין']
  const a = wordSearch(words, 12, 23), b = wordSearch(words, 12, 23)
  assert.deepEqual(a.grid, b.grid)
  assert.equal(a.placed.length, words.length)
  for (const p of a.placed) assert.equal(p.cells.map(([r, c]) => a.grid[r][c]).join(''), p.word)
  assert.ok(a.grid.flat().every(Boolean))
})
