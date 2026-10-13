import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { WORLD_COUNTRIES, CONTINENTS, COUNTRY_BY_CODE } from '../src/flags/flagsData.js'
import { COUNTRY_DETAILS, countrySource } from '../src/flags/countryDetails.js'
import { buildCountryRound } from '../src/flags/countryQuiz.js'
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
    assert.equal(countryFaq(c).length, 3)
    assert.equal(paths.filter(p => p === `/flags/${c.code}`).length, 1, c.code)
  }
  assert.equal(WORLD_COUNTRIES.filter(c => coloringFor(c.code)).length, 35)
  assert.equal(COUNTRY_BY_CODE.gq.capital, 'סיודאד דה לה פאס')
  assert.match(countryFaq(COUNTRY_BY_CODE.nr)[1].a, /אין בירה רשמית/)
  assert.match(COUNTRY_DETAILS.af.description, /לשעבר/)
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
