import { test } from 'node:test'
import assert from 'node:assert/strict'
import { HANUKKAH_GUIDES, HANUKKAH_ROOT } from '../src/en/hanukkahGuides.js'
import { holidayDates } from '../src/en/holidayDates.js'

test('Hanukkah 2026 starts on the evening of 4 December and lasts eight nights', () => {
  const d = holidayDates('hanukkah', 2026, false)
  assert.equal(d.start.toISOString().slice(0, 10), '2026-12-04')
  assert.equal((d.end - d.start) / 86400e3, 8)
})

test('the guides have unique slugs, English titles and Hebrew counterparts', () => {
  assert.equal(new Set(HANUKKAH_GUIDES.map(g => g.slug)).size, HANUKKAH_GUIDES.length)
  assert.equal(HANUKKAH_ROOT, '/en/jewish-holidays/hanukkah')
  for (const g of HANUKKAH_GUIDES) {
    assert.doesNotMatch(g.title, /[֐-׿]/)
    assert.match(g.counterpart, /^\/holidays\//)
  }
})

test('dreidel rules: gimel takes the pot, hey takes half rounded up, shin puts one in, an empty pot is refilled', async () => {
  const { newDreidelGame, playDreidel } = await import('../src/en/hanukkahGuides.js')
  let g = newDreidelGame(['A', 'B'])
  assert.deepEqual([g.coins, g.pot], [[9, 9], 2])
  g = playDreidel(g, 'hey') // A takes 1 of 2, pot 1 → everyone adds one
  assert.deepEqual([g.coins, g.pot, g.turn], [[9, 8], 3, 1])
  g = playDreidel(g, 'shin') // B puts one in
  assert.deepEqual([g.coins, g.pot, g.turn], [[9, 7], 4, 0])
  g = playDreidel(g, 'gimel') // A takes 4, pot 0 → refill
  assert.deepEqual([g.coins, g.pot], [[12, 6], 2])
  g = playDreidel(g, 'nun')
  assert.deepEqual([g.coins, g.pot, g.turn], [[12, 6], 2, 0])
  assert.equal(g.coins.reduce((a, b) => a + b) + g.pot, 20, 'tokens are never created or lost')
  let end = { ...newDreidelGame(['A', 'B']), coins: [5, 0], pot: 3 }
  end = playDreidel(end, 'nun')
  assert.equal(end.winner, 0)
})
