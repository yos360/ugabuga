// /jokes/keresh: 100 Hebrew pun jokes for kids, grouped into categories.
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { KERESH_JOKES, KERESH_CATEGORIES, jokesIn, categoryOf, randomJoke, jokeShareText } = await import('../src/data/content/kereshJokes.js')
const norm = s => s.replace(/[֑-ׇ]/g, '').replace(/[^א-ת0-9 ]/g, '').replace(/\s+/g, ' ').trim()

test('exactly 100 jokes, numbered 1..100', () => {
  assert.equal(KERESH_JOKES.length, 100)
  KERESH_JOKES.forEach((j, i) => assert.equal(j.n, i + 1))
})

test('every joke has a setup and a punchline; hints are non-empty when present', () => {
  for (const j of KERESH_JOKES) {
    assert.ok(typeof j.setup === 'string' && j.setup.trim().length > 5, `setup #${j.n}`)
    assert.ok(typeof j.punchline === 'string' && j.punchline.trim().length > 0, `punchline #${j.n}`)
    if ('hint' in j) assert.ok(j.hint.trim().length > 5, `hint #${j.n}`)
  }
})

test('setups are unique (ignoring niqqud and punctuation)', () => {
  const seen = new Map()
  for (const j of KERESH_JOKES) {
    const key = norm(j.setup)
    assert.ok(!seen.has(key), `#${j.n} duplicates #${seen.get(key)}`)
    seen.set(key, j.n)
  }
})

test('every joke is in a known category, every category is non-empty, jokes are grouped in order', () => {
  const ids = KERESH_CATEGORIES.map(c => c.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.ok(ids.length >= 6 && ids.length <= 8)
  for (const j of KERESH_JOKES) assert.ok(ids.includes(j.cat), `#${j.n} category ${j.cat}`)
  for (const c of KERESH_CATEGORIES) {
    assert.ok(jokesIn(c.id).length > 0, c.id)
    assert.ok(c.label && c.emoji, c.id)
    assert.equal(categoryOf(c.id), c)
  }
  // contiguous blocks, so the printed numbered lists line up with the page numbering
  const order = KERESH_JOKES.map(j => j.cat).filter((c, i, a) => a[i - 1] !== c)
  assert.deepEqual(order, ids)
  assert.equal(jokesIn('').length, 100)
})

test('randomJoke never repeats the current joke and handles edge cases', () => {
  for (let i = 0; i < 50; i++) {
    const r = randomJoke(KERESH_JOKES, 7, () => i / 50)
    assert.notEqual(r.n, 7)
  }
  assert.equal(randomJoke([], 1), null)
  assert.equal(randomJoke([KERESH_JOKES[0]], 1).n, 1)
})

test('share text has the setup, the punchline and the link', () => {
  const j = KERESH_JOKES[0]
  const t = jokeShareText(j, 'https://ugabuga.co.il/jokes/keresh?x=1')
  assert.ok(t.includes(j.setup) && t.includes(j.punchline) && t.includes('https://ugabuga.co.il/jokes/keresh?x=1'))
})
