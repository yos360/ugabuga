import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { HDate } from '@hebcal/core'
import { GAN_YEAR } from '../src/data/kindergartenYear.js'

test('every month uses hebcal’s month name, so the current month can be highlighted', () => {
  const names = new Set([7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 6].map(m => new HDate(1, m, 5786).getMonthName()))
  for (const m of GAN_YEAR) assert.ok(names.has(m.month), m.month)
})

test('every link on the year plan points to a page in the sitemap', () => {
  const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  for (const m of GAN_YEAR) for (const [label, href] of m.links) assert.ok(sitemap.includes(`https://ugabuga.co.il${href}</loc>`), `${m.name}: ${label} → ${href}`)
})
