// /brit: the eighth-day calculator. /bar-mitzvah/birkon: cover designs and text wrapping.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { britDate, eveOfBrit } = await import('../src/utils/britDate.js')
const { BIRKON_DESIGNS, wrapText } = await import('../src/data/birkonDesigns.js')

test('brit is on the eighth day: born Sunday, brit the next Sunday', () => {
  const b = britDate('2026-11-01') // Sunday
  assert.equal(b.iso, '2026-11-08')
  assert.equal(b.date.getDay(), 0)
})

test('born after sunset counts from the next day', () => {
  assert.equal(britDate('2026-11-01', true).iso, '2026-11-09')
})

test('Friday and Shabbat flags and the eve', () => {
  assert.equal(britDate('2026-11-06').friday, true) // born Friday -> brit Friday
  const sat = britDate('2026-11-07') // born Saturday -> brit Saturday
  assert.equal(sat.iso, '2026-11-14')
  assert.equal(sat.shabbat, true)
  assert.equal(eveOfBrit('2026-11-01').iso, '2026-11-07')
})

test('invalid date returns null', () => {
  assert.equal(britDate(''), null)
  assert.equal(britDate('2026-02-31'), null)
})

test('birkon: six designs with unique ids and colours', () => {
  assert.equal(BIRKON_DESIGNS.length, 6)
  assert.equal(new Set(BIRKON_DESIGNS.map(d => d.id)).size, 6)
  for (const d of BIRKON_DESIGNS) assert.ok(d.name && d.bg && d.ink && d.accent)
})

test('wrapText keeps lines within the limit and never loses words', () => {
  const t = 'לבני היקר ביום הגדול שלך אנחנו גאים בך מאוד ואוהבים אותך'
  const lines = wrapText(t, 18)
  assert.ok(lines.length > 1)
  assert.ok(lines.every(l => l.length <= 18))
  assert.equal(lines.join(' '), t)
  assert.deepEqual(wrapText('', 10), [])
})
