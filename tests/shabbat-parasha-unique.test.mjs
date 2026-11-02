// City pages (/shabbat-times/:city) and portion pages (/parasha/:slug) must each carry their own text,
// computed from their own data, so they are not near-duplicates of their siblings.
import test from 'node:test'
import assert from 'node:assert/strict'
import { SHABBAT_PLACES, shabbatCity } from '../src/data/shabbatCities.js'
import { SHABBAT_NEARBY } from '../src/data/shabbatNearby.js'
import { cityFacts, cityParagraphs, cityFaq, cityDescription, durationText } from '../src/utils/shabbatCityFacts.js'
import { PARASHOT } from '../src/data/parashot.js'
import { hebrewNumber, refRange, nextReading, joinStats, parashaFacts, parashaParagraphs, parashaFaq, parashaDescription } from '../src/utils/parashaFacts.js'

const words = text => text.split(/\s+/).filter(Boolean).length
const TODAY = '2026-11-02'

test('every city page has at least 250 words of its own text, and no two pages share an intro or FAQ answer', () => {
  const intros = new Set(), faqs = new Set(), descriptions = new Set()
  for (const city of SHABBAT_PLACES) {
    const f = cityFacts(city, TODAY), paragraphs = cityParagraphs(f), faq = cityFaq(f)
    const text = [...paragraphs, ...faq.map(x => `${x.q} ${x.a}`)].join(' ')
    assert.ok(words(text) >= 250, `${city.slug}: ${words(text)} words`)
    assert.ok(!/undefined|NaN|null/.test(text), city.slug)
    intros.add(paragraphs[0]); descriptions.add(cityDescription(f))
    for (const x of faq.slice(0, 4)) { assert.ok(!faqs.has(x.a), `${city.slug}: ${x.q}`); faqs.add(x.a) }
    assert.ok(cityDescription(f).length <= 170, `${city.slug}: description ${cityDescription(f).length}`)
    assert.equal(f.neighbours.length, 6)
    assert.ok(Array.isArray(SHABBAT_NEARBY[city.slug]), city.slug)
    for (const [name, km] of SHABBAT_NEARBY[city.slug]) { assert.ok(km < 12, name); assert.ok(!SHABBAT_PLACES.some(c => c.name === name), name) }
  }
  assert.equal(intros.size, SHABBAT_PLACES.length)
  assert.equal(descriptions.size, SHABBAT_PLACES.length)
})

test('city facts: comparisons and year extremes are consistent', () => {
  const jlm = cityFacts(shabbatCity('jerusalem'), TODAY), eilat = cityFacts(shabbatCity('eilat'), TODAY)
  assert.deepEqual(jlm.compare.map(c => c.ref.slug), ['tel-aviv', 'haifa'])
  assert.ok(jlm.compare[0].candles < -10, 'Jerusalem lights 40 minutes before sunset, well before Tel Aviv')
  assert.equal(eilat.northRank, eilat.total, 'Eilat is the southernmost place')
  for (const f of [jlm, eilat]) {
    assert.equal(f.year.length, 52)
    assert.ok(f.earliest.candles.getTime() !== f.latest.candles.getTime())
    assert.ok(f.shortest.length <= f.weekLength && f.weekLength <= f.longest.length)
    assert.ok(f.earliest.friday.slice(5, 7) === '11' || f.earliest.friday.slice(5, 7) === '12', 'earliest candles in late autumn')
  }
  assert.equal(durationText(25 * 60 + 2), '25 שעות ושתי דקות')
  assert.equal(durationText(61), 'שעה ודקה אחת')
  assert.equal(durationText(8), '8 דקות')
  // Tayibe the city (Triangle), not the Jezreel-valley village.
  const tayibe = shabbatCity('tayibe')
  assert.ok(tayibe.latitude < 32.35 && tayibe.longitude < 35.1)
})

test('every portion page has at least 300 words of its own text, distinct from its siblings', () => {
  const w = {}
  return Promise.all(['genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy'].map(b => import(`../src/data/parasha/workbook-${b}.js`))).then(mods => {
    for (const m of mods) Object.assign(w, m.default)
    const intros = new Set(), faqs = new Set(), descriptions = new Set()
    for (const p of PARASHOT) {
      assert.ok(w[p.slug], p.slug)
      const f = parashaFacts(p, w[p.slug], TODAY), paragraphs = parashaParagraphs(f), faq = parashaFaq(f)
      const own = [...p.paragraphs, ...paragraphs, ...faq.map(x => `${x.q} ${x.a}`), ...w[p.slug].events, ...w[p.slug].characters.flat(), ...w[p.slug].concepts.flat()].join(' ')
      assert.ok(words(own) >= 300, `${p.slug}: ${words(own)} words`)
      assert.ok(!/undefined|NaN|null/.test(own), p.slug)
      assert.ok(f.next, `${p.slug} is read within the coming year`)
      intros.add(paragraphs[0]); descriptions.add(parashaDescription(f))
      for (const x of faq.slice(0, 4)) faqs.add(x.a)
    }
    assert.equal(intros.size, 54)
    assert.equal(descriptions.size, 54)
    assert.ok(faqs.size >= 54 * 4 - 2)
  })
})

test('portion references, next readings and joined portions in Israel', () => {
  assert.deepEqual([1, 15, 16, 19, 32, 50].map(hebrewNumber), ['א', 'טו', 'טז', 'יט', 'לב', 'נ'])
  assert.equal(refRange('Genesis 6:9-11:32').text, 'ו, ט – יא, לב')
  assert.deepEqual(refRange('Deuteronomy 31:1-30').to, [31, 30])
  const by = slug => PARASHOT.find(p => p.slug === slug)
  // 5787: Vayakhel–Pekudei are read separately (leap year); Nitzavim–Vayelech together on 25.9.2027.
  assert.equal(nextReading(by('vayakhel'), TODAY).with, null)
  const vayelech = nextReading(PARASHOT[51], TODAY)
  assert.equal(vayelech.date, '2027-09-25')
  assert.equal(vayelech.with.slug, PARASHOT[50].slug)
  assert.equal(nextReading(PARASHOT[53], TODAY).date, '2027-10-23', 'Vezot Haberakhah on Simchat Torah 5788')
  assert.equal(joinStats(PARASHOT[0], TODAY).joined, 0)
  assert.ok(joinStats(PARASHOT[51], TODAY).joined > 0)
})
