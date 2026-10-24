// Data checks for the /speech/language pages: categories (sizes, pictures, no word in two
// categories, generated rounds are valid) and wh-question scenes (every level covered, answers
// well-formed), plus the section page list.
import test from 'node:test'
import assert from 'node:assert/strict'
import { CATEGORIES, ICONS, FLUENCY, OPPOSITES, SORT_PAIRS, NEAR, OVERLAPS, categoryById, oddRound, sortRound, nameRound, overlaps, isNear } from '../src/data/speech/categories.js'
import { SCENES, WH, LEVELS, ANY_BOOK, whById } from '../src/data/speech/whQuestions.js'
import { LANGUAGE_PAGES } from '../src/data/speech/language.js'

function seeded(seed) {
  let a = seed >>> 0
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

test('12–16 categories of 8–12 pictured items, no word in two categories', () => {
  assert.ok(CATEGORIES.length >= 12 && CATEGORIES.length <= 16, `${CATEGORIES.length} categories`)
  assert.equal(new Set(CATEGORIES.map(c => c.id)).size, CATEGORIES.length)
  const seen = new Map()
  for (const c of CATEGORIES) {
    assert.ok(c.name && c.one && c.e, c.id)
    assert.ok(c.items.length >= 8 && c.items.length <= 12, `${c.id}: ${c.items.length} items`)
    for (const item of c.items) {
      assert.match(item.t, /^[א-ת׳״־ ]+$/, `${c.id}: "${item.t}" should be plain Hebrew`)
      assert.ok(item.e || (item.i && ICONS[item.i]), `${c.id}: ${item.t} has no picture`)
      assert.ok(!seen.has(item.t), `${item.t} is in ${seen.get(item.t)} and ${c.id}`)
      seen.set(item.t, c.id)
    }
  }
})

test('a category picture is never one of the item pictures (bingo boards need thinking, not matching)', () => {
  const used = new Set(CATEGORIES.flatMap(c => c.items.map(i => i.e).filter(Boolean)))
  for (const c of CATEGORIES) assert.ok(!used.has(c.e), `${c.id}: ${c.e} is also an item picture`)
})

test('overlap and near pairs name real categories', () => {
  for (const [a, b] of [...OVERLAPS, ...NEAR]) assert.ok(categoryById[a] && categoryById[b], `${a}/${b}`)
  for (const [a, b] of SORT_PAIRS) { assert.ok(categoryById[a] && categoryById[b]); assert.ok(!overlaps(a, b), `${a}/${b} overlap`) }
})

test('odd-one-out rounds: three from one category, one from another, never overlapping', () => {
  const rand = seeded(42)
  for (const level of ['easy', 'hard']) for (let n = 0; n < 300; n++) {
    const r = oddRound(level, rand)
    assert.equal(r.items.length, 4)
    assert.equal(new Set(r.items.map(i => i.t)).size, 4)
    assert.ok(r.oddIndex >= 0 && r.oddIndex < 4)
    assert.ok(r.odd.items.includes(r.items[r.oddIndex]))
    r.items.forEach((it, i) => { if (i !== r.oddIndex) assert.ok(r.main.items.includes(it)) })
    assert.ok(!overlaps(r.main.id, r.odd.id))
    assert.equal(isNear(r.main.id, r.odd.id), level === 'hard')
  }
})

test('sorting and naming rounds are well-formed', () => {
  const rand = seeded(7)
  for (const [a, b] of SORT_PAIRS) {
    const r = sortRound(a, b, 4, rand)
    assert.equal(r.items.filter(i => i.cat === a).length, 4)
    assert.equal(r.items.filter(i => i.cat === b).length, 4)
  }
  for (let n = 0; n < 200; n++) {
    const r = nameRound(rand)
    assert.equal(r.items.length, 4)
    assert.equal(r.options.length, 3)
    assert.equal(new Set(r.options.map(o => o.id)).size, 3)
    assert.ok(r.options.includes(r.cat))
    for (const o of r.options) if (o !== r.cat) assert.ok(!overlaps(o.id, r.cat.id))
  }
})

test('fluency prompts and opposites', () => {
  assert.ok(FLUENCY.length >= 12)
  for (const f of FLUENCY) { assert.match(f.t, /^אמרו 3 /); assert.ok(f.e); assert.ok(f.ideas.length >= 4, f.t) }
  assert.ok(OPPOSITES.length >= 10)
  const words = OPPOSITES.flatMap(p => [p.a.t, p.b.t])
  assert.equal(new Set(words).size, words.length)
  for (const p of OPPOSITES) assert.ok(p.a.e && p.b.e)
})

test('wh scenes: every scene covers every question word, three distinct answers each', () => {
  assert.ok(SCENES.length >= 6)
  assert.deepEqual(WH.map(w => w.id), ['who', 'what', 'where', 'when', 'why', 'how'])
  for (const l of LEVELS) assert.ok(WH.some(w => w.level === l.id), `level ${l.id} has no question word`)
  assert.equal(new Set(SCENES.map(s => s.id)).size, SCENES.length)
  for (const s of SCENES) {
    assert.ok(s.title && s.alt && s.items.length >= 4, s.id)
    for (const w of WH) assert.ok(s.questions.some(q => q.w === w.id), `${s.id} has no ${w.id} question`)
    assert.ok(s.questions.length <= 8, `${s.id}: at most 8 questions fit on the printed sheet`)
    for (const q of s.questions) {
      assert.ok(whById[q.w], `${s.id}: ${q.q}`)
      assert.match(q.q, /\?$/, q.q)
      assert.equal(q.opts.length, 3, q.q)
      assert.equal(new Set(q.opts.map(o => o.t)).size, 3, q.q)
      assert.ok(q.more && q.more.length > 5, q.q)
    }
    for (const it of s.items) assert.ok(it.x >= 0 && it.x <= 200 && it.y >= 0 && it.y <= 120, `${s.id}: ${it.e} outside the scene`)
  }
  for (const c of ANY_BOOK) assert.ok(whById[c.w] && c.t.endsWith('?'))
})

test('language section lists its pages under /speech/language', () => {
  const paths = LANGUAGE_PAGES.map(p => p.path)
  assert.deepEqual(paths.slice(0, 4), ['/speech/language/categories', '/speech/language/wh-questions', '/speech/language/directions', '/speech/language/sequencing'])
  assert.ok(paths.includes('/speech/language/grammar'))
  assert.equal(new Set(paths).size, paths.length)
  for (const p of LANGUAGE_PAGES) assert.match(p.path, /^\/speech\/language\/[a-z-]+$/)
test('language section pages under /speech/language', () => {
  assert.deepEqual(LANGUAGE_PAGES.map(p => p.path), ['/speech/language/categories', '/speech/language/wh-questions', '/speech/language/directions', '/speech/language/sequencing', '/speech/language/prepositions'])
})
