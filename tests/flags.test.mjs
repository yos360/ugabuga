// /flags: country data, vendored SVG flags, quiz generator, colouring flags
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
const { WORLD_COUNTRIES, CONTINENTS, FAMOUS_FLAGS, FLAG_NOTES, countriesOf } = await import('../src/flags/flagsData.js')
const { LEVELS, buildRound, makeChoices, questionPool } = await import('../src/flags/flagQuiz.js')
const { COLORING_FLAGS, PAINT, flagRegions } = await import('../src/flags/coloringFlags.js')
const { CONTINENT_COPY } = await import('../src/flags/flagsCopy.js')

const svgPath = code => new URL(`../public/flag-svg/${code}.svg`, import.meta.url)
const HEBREW = /^[֐-׿][֐-׿\s\-׳״]*$/

test('195 countries: 193 UN members + Vatican + Kosovo, no duplicate codes or names', () => {
  assert.equal(WORLD_COUNTRIES.length, 195)
  assert.equal(new Set(WORLD_COUNTRIES.map(c => c.code)).size, WORLD_COUNTRIES.length)
  assert.equal(new Set(WORLD_COUNTRIES.map(c => c.name)).size, WORLD_COUNTRIES.length)
})

test('every country has a flag file, Hebrew name, Hebrew capital and a known continent', () => {
  const slugs = CONTINENTS.map(c => c.slug)
  for (const c of WORLD_COUNTRIES) {
    assert.match(c.code, /^[a-z]{2}$/, c.code)
    assert.ok(existsSync(svgPath(c.code)), `missing flag ${c.code}`)
    assert.match(readFileSync(svgPath(c.code), 'utf8'), /<svg/, c.code)
    assert.match(c.name, HEBREW, c.code)
    assert.match(c.capital, HEBREW, c.code)
    assert.ok(slugs.includes(c.continent), c.code)
  }
  assert.ok(existsSync(new URL('../public/flag-svg/LICENSE.txt', import.meta.url)), 'flag-icons MIT licence shipped')
})

test('continent counts match the standard grouping', () => {
  const n = s => countriesOf(s).length
  assert.deepEqual([n('europe'), n('asia'), n('africa'), n('north-america'), n('south-america'), n('oceania')], [46, 46, 54, 23, 12, 14])
})

test('spot-check tricky names and capitals', () => {
  const by = Object.fromEntries(WORLD_COUNTRIES.map(c => [c.code, c]))
  assert.equal(by.il.capital, 'ירושלים')
  assert.equal(by.au.capital, 'קנברה')
  assert.equal(by.ca.capital, 'אוטווה')
  assert.equal(by.tr.capital, 'אנקרה')
  assert.equal(by.br.capital, 'ברזיליה')
  assert.equal(by.kz.capital, 'אסטנה')
  assert.equal(by.mm.capital, 'נייפידו')
  assert.equal(by.ng.capital, 'אבוג׳ה')
  assert.equal(by.ch.capital, 'ברן')
  assert.equal(by.ge.name, 'גאורגיה')
})

test('famous flags, notes and continent copy refer to real entries', () => {
  const codes = new Set(WORLD_COUNTRIES.map(c => c.code))
  for (const c of FAMOUS_FLAGS) assert.ok(codes.has(c), c)
  for (const c of Object.keys(FLAG_NOTES)) assert.ok(codes.has(c), c)
  for (const { slug } of CONTINENTS) { const cp = CONTINENT_COPY[slug]; assert.ok(cp.lead && cp.faq.length >= 3, slug) }
})

// deterministic PRNG for repeatable rounds
const seeded = seed => () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296 }

test('every question has 4 unique choices that include the answer — all levels and continents', () => {
  for (const { id: level } of LEVELS) for (const cont of ['all', ...CONTINENTS.map(c => c.slug)]) for (let s = 1; s <= 15; s++) {
    const round = buildRound({ level, continent: cont, rnd: seeded(s) })
    assert.equal(round.length, 10, `${level}/${cont}`)
    assert.equal(new Set(round.map(q => q.answer)).size, round.length, 'no repeated flag in a round')
    for (const q of round) {
      assert.equal(q.choices.length, 4)
      assert.equal(new Set(q.choices).size, 4)
      assert.ok(q.choices.includes(q.answer))
      if (cont !== 'all') assert.equal(WORLD_COUNTRIES.find(c => c.code === q.answer).continent, cont)
    }
  }
})

test('hard level: wrong answers come from the same continent; easy level: from other continents', () => {
  const cont = code => WORLD_COUNTRIES.find(c => c.code === code).continent
  for (const c of WORLD_COUNTRIES) {
    const hard = makeChoices(c.code, 'hard', seeded(7))
    for (const x of hard) assert.equal(cont(x), c.continent)
    const easy = makeChoices(c.code, 'easy', seeded(7)).filter(x => x !== c.code)
    for (const x of easy) assert.notEqual(cont(x), c.continent)
  }
  assert.ok(questionPool('easy', 'all').every(c => FAMOUS_FLAGS.includes(c.code)))
})

test('colouring flags: known countries and paints, one region per colour slot', () => {
  for (const f of COLORING_FLAGS) {
    assert.ok(WORLD_COUNTRIES.some(c => c.code === f.code), f.code)
    for (const col of f.colors) assert.ok(PAINT[col], `${f.code}: ${col}`)
    const regions = flagRegions(f)
    assert.equal(regions.length, f.colors.length, f.code)
    for (const r of regions) { assert.match(r.d, /^M[\d.,\-hvaz ]+$/i, f.code); assert.ok(r.label.every(Number.isFinite), f.code) }
  }
})
