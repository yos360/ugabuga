import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { WORLD_COUNTRIES, CONTINENTS, COUNTRY_BY_CODE } from '../src/flags/flagsData.js'
import { COUNTRY_DETAILS, countrySource } from '../src/flags/countryDetails.js'
import { buildCountryRound } from '../src/flags/countryQuiz.js'
import { countryLead, rememberTips, letterParagraph, similarColorFlags, flagFeatures } from '../src/flags/countryInsights.js'
import { findCountry, countryTitle, countryDescription, countryFaq, coloringFor, relatedCountries } from '../src/flags/countryPageData.js'

const xml = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname)

test('all 195 country pages have sourced individual copy, SEO, FAQ and a sitemap URL', () => {
  assert.deepEqual(Object.keys(COUNTRY_DETAILS).sort(), WORLD_COUNTRIES.map(c => c.code).sort())
  const titles = new Set(), descriptions = new Set(), copy = new Set()
  for (const c of WORLD_COUNTRIES) {
    assert.equal(findCountry(c.code), c)
    const detail = COUNTRY_DETAILS[c.code]
    assert.ok(detail.description.length > 25 && detail.meaning.length > 25, c.code)
    assert.ok(!copy.has(detail.description + detail.meaning), c.code)
    copy.add(detail.description + detail.meaning)
    assert.match(countrySource(c.code), /^https:\/\/github.com\/factbook\/factbook.json\/blob\/[a-f0-9]{40}\/[a-z-]+\/[a-z]{2}\.json$/)
    const title = countryTitle(c), description = countryDescription(c)
    assert.ok(title.length <= 70 && description.length <= 165, c.code)
    assert.ok(!titles.has(title) && !descriptions.has(description), c.code)
    titles.add(title); descriptions.add(description)
    assert.ok(countryFaq(c).length >= 4, c.code)
    assert.equal(paths.filter(p => p === `/flags/${c.code}`).length, 1, c.code)
  }
  assert.equal(WORLD_COUNTRIES.filter(c => coloringFor(c.code)).length, 35)
  assert.equal(COUNTRY_BY_CODE.gq.capital, 'סיודאד דה לה פאס')
  assert.match(countryFaq(COUNTRY_BY_CODE.nr)[1].a, /אין בירה רשמית/)
  assert.match(COUNTRY_DETAILS.af.description, /לשעבר/)
})

test('country pages get distinct, data-driven body copy (not one template with the name swapped)', () => {
  const words = s => s.split(/\s+/).filter(Boolean).length
  const leads = new Set(), tipSets = new Set(), faqs = new Set()
  for (const c of WORLD_COUNTRIES) {
    const lead = countryLead(c), tips = rememberTips(c), faq = countryFaq(c)
    const body = [lead, ...tips, letterParagraph(c), ...faq.flatMap(x => [x.q, x.a])].join(' ')
    assert.ok(words(body) >= 150, `${c.code}: ${words(body)} words`)
    assert.ok(tips.length >= 2, c.code)
    // Strip the country name so only the data-driven parts are compared.
    const strip = s => s.replaceAll(c.name, '#')
    leads.add(strip(lead)); tipSets.add(strip(tips.join('|'))); faqs.add(strip(faq.map(x => x.a).join('|')))
    for (const p of similarColorFlags(c)) assert.notEqual(p.code, c.code)
  }
  assert.ok(faqs.size === WORLD_COUNTRIES.length, 'every FAQ is unique')
  assert.ok(tipSets.size > 60 && leads.size > 50, `tips ${tipSets.size}, leads ${leads.size}`)
  // Detected colours/symbols are read from the sourced descriptions — spot checks.
  assert.deepEqual(flagFeatures('fr').colors, ['red', 'white', 'blue'])
  assert.deepEqual(flagFeatures('ke').colors, ['red', 'white', 'green', 'black'])
  assert.ok(!flagFeatures('pl').symbols.includes('plant'), 'למעלה is not a leaf')
  assert.ok(!flagFeatures('au').symbols.includes('cross'), 'Southern Cross is stars')
  assert.ok(!flagFeatures('va').symbols.includes('cross'), 'crossed keys are not a cross')
  assert.ok(flagFeatures('nz').unionJack && flagFeatures('nz').colors.includes('blue'))
  assert.notEqual(countryLead(COUNTRY_BY_CODE.fr), countryLead(COUNTRY_BY_CODE.de))
})

test('invalid and prototype country codes are rejected without crashing', () => {
  for (const code of ['missing', 'IL', 'constructor', '__proto__', 'toString', '', null, undefined]) {
    assert.equal(findCountry(code), null)
    assert.equal(countrySource(code), null)
    assert.deepEqual(buildCountryRound(code), [])
  }
})

test('five-question rounds are stable, answerable, varied and stay within the chosen continent', () => {
  for (const c of WORLD_COUNTRIES) {
    const first = buildCountryRound(c.code)
    assert.deepEqual(first, buildCountryRound(c.code), 'stable prerender')
    assert.notDeepEqual(first, buildCountryRound(c.code, 1), 'fresh replay')
    for (let attempt = 0; attempt < 8; attempt++) {
      const round = buildCountryRound(c.code, attempt)
      assert.equal(round.length, 5)
      for (const q of round) {
        assert.equal(q.choices.length, 4)
        assert.equal(new Set(q.choices).size, 4)
        assert.equal(q.choices.filter(a => a === q.answer).length, 1)
      }
      assert.equal(round[0].flag, c.code)
      assert.equal(round[1].answer, c.capital)
      assert.equal(round[2].answer, CONTINENTS.find(t => t.slug === c.continent).name)
      assert.notEqual(round[3].flag, c.code)
      assert.equal(COUNTRY_BY_CODE[round[3].flag].continent, c.continent)
      assert.equal(round[4].choices.filter(name => WORLD_COUNTRIES.find(p => p.name === name).continent === c.continent).length, 1)
    }
  }
})

test('related links distinguish actual land neighbors from other countries in the continent', () => {
  for (const c of WORLD_COUNTRIES) {
    const { neighbors, others } = relatedCountries(c)
    const all = [...neighbors, ...others]
    assert.equal(new Set(all.map(p => p.code)).size, all.length)
    assert.ok(others.length <= 6)
    for (const p of all) { assert.notEqual(p.code, c.code); assert.equal(p.continent, c.continent) }
    for (const p of neighbors) assert.ok(COUNTRY_DETAILS[p.code].neighbors.includes(c.code))
  }
  assert.deepEqual(COUNTRY_DETAILS.jp.neighbors, [])
  assert.deepEqual(COUNTRY_DETAILS.au.neighbors, [])
  assert.deepEqual(COUNTRY_DETAILS.va.neighbors, ['it'])
  assert.ok(COUNTRY_DETAILS.fr.neighbors.includes('de'))
})

test('edge middleware accepts countries and existing flag tools, rejects unknown values', async t => {
  const previous = globalThis.HTMLRewriter
  globalThis.HTMLRewriter = class { on() { return this } transform(response) { return response } }
  t.after(() => { globalThis.HTMLRewriter = previous })
  const { onRequest } = await import('../functions/_middleware.js')
  const env = { ASSETS: { fetch: async url => Response.json(new URL(url).pathname === '/routes.json'
    ? ['^/flags/?$', '^/flags/[^/]+/?$', '^/flags/continents/[^/]+/?$'] : paths) } }
  for (const [path, status] of [
    ...WORLD_COUNTRIES.map(c => [`/flags/${c.code}`, 200]),
    ['/flags/il/', 200], ['/flags', 200], ['/flags/quiz', 200], ['/flags/print', 200],
    ...CONTINENTS.map(c => [`/flags/continents/${c.slug}`, 200]),
    ['/flags/xx', 404], ['/flags/constructor', 404], ['/flags/__proto__', 404], ['/flags/continents/missing', 404],
  ]) {
    const res = await onRequest({ request: new Request('https://ugabuga.co.il' + path), env,
      next: async () => new Response('<link rel="canonical" href="https://ugabuga.co.il/">', { headers: { 'Content-Type': 'text/html' } }),
    })
    assert.equal(res.status, status, path)
    if (status === 404) assert.equal(res.headers.get('X-Robots-Tag'), 'noindex')
  }
})
