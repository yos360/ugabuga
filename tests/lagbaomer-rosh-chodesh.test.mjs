import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { MONTHS, YEAR_ORDER, MONTH_BY_SLUG } from '../src/data/roshChodesh.js'
import { nextRoshChodesh } from '../src/utils/roshChodesh.js'
import * as more from '../src/data/lagbaomerMore.js'

const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')

test('12 months, all in the year order, each complete', () => {
  assert.equal(MONTHS.length, 12)
  assert.deepEqual([...YEAR_ORDER].sort(), MONTHS.map(m => m.slug).sort())
  for (const m of MONTHS) {
    for (const k of ['name', 'intro', 'greeting', 'kidTitle', 'kidIdea', 'kinderTitle', 'kinderIdea', 'rc', 'days', 'mazal']) assert.ok(m[k], `${m.slug}.${k}`)
    assert.ok(m.special.length >= 2 && m.customs.length >= 2 && m.faq.length >= 1, m.slug)
    assert.ok(MONTH_BY_SLUG[m.slug] === m)
    assert.ok(sitemap.includes(`/holidays/rosh-chodesh/${m.slug}<`), `sitemap ${m.slug}`)
  }
})

test('next Rosh Chodesh is found for every month and is the 1st of that month (or the 30th before it)', () => {
  const from = new Date(2026, 10, 27)
  for (const m of MONTHS) {
    const r = nextRoshChodesh(m.names, from)
    assert.ok(r && r.days.length >= 1 && r.days.length <= 2, m.slug)
    assert.ok(r.days[r.days.length - 1] >= from, m.slug)
  }
  // Elul 5787 starts Friday 3.9.2027, and Av has 30 days, so Rosh Chodesh Elul is two days.
  const elul = nextRoshChodesh(['אלול'], from)
  assert.equal(elul.days.length, 2)
  assert.equal(elul.days[1].getFullYear() + '-' + (elul.days[1].getMonth() + 1) + '-' + elul.days[1].getDate(), '2027-9-3')
})

test('Lag BaOmer extra pages: unique titles and non-empty items', () => {
  for (const [k, groups] of Object.entries({ story: more.LAGBAOMER_STORY, safety: more.LAGBAOMER_SAFETY, games: more.LAGBAOMER_GAMES, riddles: more.LAGBAOMER_RIDDLES, greetings: more.LAGBAOMER_GREETINGS, crafts: more.LAGBAOMER_CRAFTS })) {
    const titles = groups.flatMap(g => g.items.map(i => i.t))
    assert.equal(new Set(titles).size, titles.length, `${k} duplicate titles`)
    assert.ok(titles.length >= 8, k)
    assert.ok(groups.every(g => g.items.every(i => i.t && i.d)), k)
    assert.ok(sitemap.includes(`/holidays/lag-baomer/${k}<`), `sitemap ${k}`)
  }
})
