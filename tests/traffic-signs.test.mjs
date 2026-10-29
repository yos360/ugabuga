import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { TRAFFIC_SIGNS, SIGN_CATEGORIES, findSign, filterSigns, signPath, signTitle, signDescription } from '../src/signs/signsData.js'
import { AGE_GROUPS, makeAgeExam, makeQuestions, flashcardSet } from '../src/signs/signsQuiz.js'
const xml = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
const paths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname)

test('all included signs have unique identifiers, sourced content and original local artwork', () => {
  assert.equal(TRAFFIC_SIGNS.length, 76)
  assert.equal(new Set(TRAFFIC_SIGNS.map(s => s.number)).size, TRAFFIC_SIGNS.length)
  const names = new Set()
  for (const s of TRAFFIC_SIGNS) {
    assert.match(s.number, /^\d{3}$/)
    assert.ok(!names.has(s.name)); names.add(s.name)
    for (const field of ['name','meaning','where','driver','cyclist','pedestrian']) assert.ok(s[field].length >= (field === 'name' ? 3 : 10), `${s.number}: ${field}`)
    assert.ok(SIGN_CATEGORIES.some(c => c.id === s.category))
    assert.equal(new URL(s.source).hostname, 'www.gov.il')
    assert.equal(new URL(s.source).hash, `#page=${s.sourcePage}`)
    assert.equal(s.artwork.reference, s.source)
    assert.equal(s.artwork.license, 'CC0-1.0')
    const svg = readFileSync(new URL(`../public${s.image}`, import.meta.url), 'utf8')
    assert.match(svg, /width="200" height="200"/) // Explicit intrinsic size is required by the PDF fallback renderer.
    assert.match(svg, /viewBox="0 0 200 200"/)
    assert.doesNotMatch(svg, /<script|<image|href=/)
    assert.ok(s.similar.length > 0 && s.similar.every(n => n !== s.number && findSign(n)))
    assert.equal(paths.filter(p => p === signPath(s)).length, 1)
    assert.ok(signTitle(s).length <= 70 && signDescription(s).length <= 165)
    assert.equal(s.question.options.length, 3)
    assert.equal(new Set(s.question.options).size, 3)
    assert.ok(s.question.options[s.question.answer])
    assert.ok(s.question.explanation.length > 25)
  }
  for (const p of ['/signs','/signs/game','/signs/theory']) assert.equal(paths.filter(x => x === p).length, 1)
  assert.equal(findSign('0302'), undefined)
  assert.equal(findSign('constructor'), undefined)
})

test('search combines category, name and canonical number without changing source data', () => {
  assert.equal(filterSigns(' 302 ')[0].number, '302')
  assert.equal(filterSigns('302','warning').length, 0)
  assert.ok(filterSigns('אופניים').length >= 3)
  assert.equal(filterSigns('איןכזהתמרור').length, 0)
  assert.equal(filterSigns('', 'information').length, 2)
})

test('questions preserve answer association after shuffling, including tiny categories', () => {
  for (const category of ['all', ...SIGN_CATEGORIES.map(c => c.id)]) {
    const pool = filterSigns('', category)
    for (const kind of ['identify','scenario']) {
      const qs = makeQuestions(pool, 10, kind, () => .4)
      assert.equal(qs.length, Math.min(10, pool.length))
      assert.equal(new Set(qs.map(q => q.sign.number)).size, qs.length)
      for (const q of qs) {
        assert.equal(q.options.length, 3)
        assert.equal(new Set(q.options).size, 3)
        assert.equal(q.options[q.answer], kind === 'identify' ? q.sign.name : q.sign.question.options[q.sign.question.answer])
      }
    }
  }
})

test('age exams respect the selected pool, level and advertised question count', () => {
  for (const age of AGE_GROUPS) {
    assert.ok(age.numbers.every(n => findSign(n)))
    const exam = makeAgeExam(age.id, () => .7)
    assert.equal(exam.length, age.count)
    assert.equal(new Set(exam.map(q => q.sign.number)).size, age.count)
    assert.ok(exam.every(q => age.numbers.includes(q.sign.number)))
    if (age.kind === 'identify') assert.ok(exam.every(q => q.options[q.answer] === q.sign.name))
  }
  assert.deepEqual(makeAgeExam('invalid'), [])
})

test('flashcard variants cover the full set before wrapping and handle small categories', () => {
  const sets = Array.from({ length: 7 }, (_, i) => flashcardSet(TRAFFIC_SIGNS, i))
  assert.equal(new Set(sets.flat().map(s => s.number)).size, Math.min(42, TRAFFIC_SIGNS.length))
  assert.notDeepEqual(sets[0], sets[1])
  assert.equal(flashcardSet(filterSigns('', 'information'), 0).length, 2)
  assert.deepEqual(flashcardSet([], 0), [])
})

test('edge middleware accepts all signs and activities and rejects invented identifiers', async t => {
  const previous = globalThis.HTMLRewriter
  globalThis.HTMLRewriter = class { on() { return this } transform(response) { return response } }
  t.after(() => { globalThis.HTMLRewriter = previous })
  const { onRequest } = await import('../functions/_middleware.js')
  const env = { ASSETS: { fetch: async url => Response.json(new URL(url).pathname === '/routes.json' ? ['^/signs(?:/[^/]+)?/?$'] : paths) } }
  for (const path of ['/signs','/signs/game','/signs/theory', ...TRAFFIC_SIGNS.map(signPath), '/signs/302/', '/signs/0302','/signs/999','/signs/constructor','/signs/game/missing']) {
    const status = ['/signs/0302','/signs/999','/signs/constructor','/signs/game/missing'].includes(path) ? 404 : 200
    const res = await onRequest({ request: new Request('https://ugabuga.co.il' + path), env, next: async () => new Response('<link rel="canonical" href="https://ugabuga.co.il/">', { headers: { 'Content-Type': 'text/html' } }) })
    assert.equal(res.status, status, path)
  }
})


