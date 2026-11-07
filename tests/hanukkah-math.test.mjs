import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { MATH_GRADES, MATH_PROBLEMS, GEMATRIA, GAME_MODES, gameQuestion, parseAnswer } from '../src/data/hanukkahMath.js'
import { wrapLines } from '../src/data/hanukkahLighting.js'

test('every grade has six problems with unique ids and a numeric answer', () => {
  const ids = new Set()
  for (const g of MATH_GRADES) {
    const list = MATH_PROBLEMS[g.id]
    assert.equal(list.length, 6, g.id)
    for (const p of list) {
      assert.ok(!ids.has(p.id), p.id); ids.add(p.id)
      assert.ok(p.id.startsWith(g.id + '-'), p.id)
      assert.equal(typeof p.a, 'number')
      assert.ok(Number.isFinite(p.a))
      assert.ok(p.sol.length > 5)
    }
  }
})

test('the candle and gematria facts the problems rely on', () => {
  const candles = [1, 2, 3, 4, 5, 6, 7, 8].reduce((s, x) => s + x, 0)
  assert.equal(candles, 36)
  const byId = Object.fromEntries(Object.values(MATH_PROBLEMS).flat().map(p => [p.id, p.a]))
  assert.equal(byId['g3-1'], 36)
  assert.equal(byId['g3-2'], candles + 8)
  assert.equal(byId['g4-1'], 4 * 44)
  assert.equal(byId['g4-6'], GEMATRIA['נ'] + GEMATRIA['ג'] + GEMATRIA['ה'] + GEMATRIA['ש'])
  assert.equal(byId['g5-6'], 50 + 3 + 5 + 80)
  assert.equal(byId['g6-6'], 8 + 50 + 6 + 20 + 5)
  assert.equal(byId['g5-4'], (12 + 15 + 9 + 18 + 16) / 5)
  assert.equal(byId['g6-2'], 60 * 0.85)
  assert.equal(byId['g6-5'], 36 * 30)
})

test('each answer appears in its worked solution', () => {
  for (const p of Object.values(MATH_PROBLEMS).flat()) {
    assert.ok(p.sol.replace(/,/g, '').includes(String(p.a)), p.id)
  }
})

test('the printed sheet fits on one A4 page', () => {
  for (const list of Object.values(MATH_PROBLEMS)) {
    let y = 50, yKey = 50
    list.forEach((p, i) => {
      const lines = wrapLines(`${i + 1}. ${p.q}`, 66).length
      y += lines * 6.4 + 16
      yKey += lines * 6.4 + wrapLines(`${p.sol} תשובה: ${p.a} ${p.unit}`, 74).length * 5.6 + 6
    })
    assert.ok(y < 262, `sheet ends at ${y}`)
    assert.ok(yKey < 262, `answer sheet ends at ${yKey}`)
  }
})

test('the dreidel game asks questions with whole, sensible answers', () => {
  let seed = 7
  const rng = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
  for (const m of GAME_MODES) {
    for (let i = 0; i < 300; i++) {
      const q = gameQuestion(m.id, rng)
      assert.ok(Number.isInteger(q.a), `${m.id}: ${q.q}`)
      assert.ok(q.a >= 0)
      if (m.id === 'pot') assert.ok(q.a <= 20, q.q)
      if (m.id === 'gematria') assert.equal(q.letters.length, 3)
      assert.ok(q.sol.includes(String(q.a)))
    }
  }
})

test('answers are read the way children type them', () => {
  assert.equal(parseAnswer(' 1,080 '), 1080)
  assert.equal(parseAnswer('25%'), 25)
  assert.equal(parseAnswer('6.5'), 6.5)
  assert.equal(parseAnswer(''), null)
  assert.equal(parseAnswer('שש'), null)
})

test('the page is wired into the site', () => {
  const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
  const route = '/holidays/hanukkah/math'
  assert.ok(read('src/App.jsx').includes(`path="${route}"`))
  assert.ok(read('public/sitemap-static.xml').includes(`${route}<`))
  assert.ok(read('src/data/searchStatic.js').includes(`to: '${route}'`))
  assert.ok(read('src/data/whatsNew.js').includes(`to: '${route}'`))
  assert.ok(read('src/pages/holidays/HanukkahHub.jsx').includes(`'${route}'`))
  assert.ok(read('src/holidays/hanukkah.jsx').includes(`href: '${route}'`))
})
