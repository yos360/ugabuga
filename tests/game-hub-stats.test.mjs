import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { hubStats, hubStatsParagraphs, hubStatsFaq } from '../src/data/gameHubStats.js'
import { fitsAge, fitsDuration, fitsNoEquipment, fitsQuiet, fitsMovement, fitsClassroom, fitsBirthday, fitsIcebreaker } from '../src/data/gameFilters.js'

const games = JSON.parse(readFileSync(new URL('../public/data/games.json', import.meta.url), 'utf8')).filter(g => g.status === 'active')
const words = s => s.split(/\s+/).filter(Boolean).length

// A sample of the hub filters used by /games/<slug> and /games/age/N (the real ones live in gameCategories.js).
const HUBS = {
  '5-minutes': g => fitsDuration(g, 5), '10-minutes': g => fitsDuration(g, 10), '15-minutes': g => fitsDuration(g, 15),
  quiet: fitsQuiet, movement: fitsMovement, 'no-equipment': fitsNoEquipment, classroom: fitsClassroom,
  birthday: fitsBirthday, icebreaker: fitsIcebreaker,
  ...Object.fromEntries([4, 5, 6, 7, 8, 9, 10].map(a => [`age-${a}`, g => fitsAge(g, a)])),
}

test('hub pages get their own computed numbers, examples and FAQ', () => {
  const seen = new Set()
  for (const [slug, filter] of Object.entries(HUBS)) {
    const list = games.filter(filter)
    if (list.length < 3) continue
    const label = `אוסף ${slug}`
    const paragraphs = hubStatsParagraphs(list, label), faq = hubStatsFaq(list, label)
    assert.equal(paragraphs.length, 2, slug)
    const body = [...paragraphs, ...faq.flatMap(f => [f.q, f.a])].join(' ')
    assert.ok(words(body) >= 80, `${slug}: ${words(body)} words`)
    assert.match(paragraphs[0], new RegExp(`${list.length} משחקים`))
    // The label is the only shared part: strip it and the text must still differ between hubs.
    const key = body.replaceAll(label, '')
    assert.ok(!seen.has(key), `${slug} repeats another hub`)
    seen.add(key)
    const s = hubStats(list)
    assert.ok(s.noGear <= s.total && s.quiet <= s.total)
    for (const g of [s.shortest, s.longest, s.biggest, s.youngest].filter(Boolean)) assert.ok(list.includes(g), slug)
  }
  assert.ok(seen.size >= 10)
  assert.equal(hubStats(games.slice(0, 2)), null)
  assert.equal(hubStatsFaq(games, 'x', { skipAge: true }).some(f => f.q.includes('מאיזה גיל')), false)
})
