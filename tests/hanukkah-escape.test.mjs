import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { ESCAPE_TRACKS, codeOf, isRight, codeMatches, decoyCodes, lockCards } from '../src/data/hanukkahEscape.js'

test('every station has a unique id and a one-digit answer', () => {
  const ids = new Set()
  for (const t of ESCAPE_TRACKS) {
    for (const s of t.stations) {
      assert.ok(!ids.has(s.id), s.id); ids.add(s.id)
      assert.match(s.answer, /^\d$/, s.id)
      assert.ok(s.hints.length >= 2, s.id)
      assert.ok(s.solution.includes(s.answer), s.id)
    }
  }
})

test('the station facts and arithmetic hold', () => {
  const byId = Object.fromEntries(ESCAPE_TRACKS.flatMap(t => t.stations).map(s => [s.id, Number(s.answer)]))
  assert.equal(byId['gan-candles'], 3)
  assert.equal(byId['gan-donuts'], 2 + 3)
  assert.equal(byId['gan-dreidels'], 6 - 2)
  assert.equal(byId['gan-oil'], 8)
  assert.equal(byId['school-shamash'], 5 + 1)
  assert.equal(byId['school-box'], (1 + 1) + (2 + 1) + (3 + 1))
  assert.equal(byId['school-dreidel'], 3 + 5)
  assert.equal(byId['school-tray'], 3 * 4 - 7)
  assert.equal(byId['school-miracle'], 8 - 1)
})

test('answers accept the digit and the Hebrew word', () => {
  const s = ESCAPE_TRACKS[1].stations[0]
  assert.ok(isRight(s, '6')); assert.ok(isRight(s, ' שש ')); assert.ok(isRight(s, 'שישה'))
  assert.ok(!isRight(s, '5')); assert.ok(!isRight(s, ''))
})

test('the paper lock has exactly one right card and distinct codes', () => {
  for (const t of ESCAPE_TRACKS) {
    const code = codeOf(t)
    assert.equal(code.length, t.stations.length)
    assert.ok(codeMatches(t, code.split('').join(' ')))
    const decoys = decoyCodes(code)
    assert.equal(decoys.length, 5)
    assert.ok(!decoys.includes(code))
    const cards = lockCards(t)
    assert.equal(cards.length, 6)
    assert.equal(new Set(cards.map(c => c.code)).size, 6)
    assert.deepEqual(cards.filter(c => c.right).map(c => c.code), [code])
    for (const c of cards) assert.equal(c.code.length, code.length)
  }
})

test('the page is routed, in the sitemap and in search', () => {
  const path = '/holidays/hanukkah/escape-room'
  assert.ok(readFileSync('src/App.jsx', 'utf8').includes(`path="${path}"`))
  assert.ok(readFileSync('public/sitemap-static.xml', 'utf8').includes(`https://ugabuga.co.il${path}<`))
  assert.ok(readFileSync('src/data/searchStatic.js', 'utf8').includes(`'${path}'`))
})
