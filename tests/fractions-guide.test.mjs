import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { STEPS, FAQ, HOME_IDEAS, MORE_LINKS, WALL_ROWS, compareFractions, simplify, gcd, lcm } from '../src/data/fractionsGuide.js'

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')

test('fractions guide: steps have unique ids, grades 4–5 and closed exercise markers', () => {
  const ids = STEPS.map(s => s.id)
  assert.equal(new Set(ids).size, ids.length)
  for (const s of STEPS) {
    assert.ok([4, 5].includes(s.grade), s.id)
    for (const k of ['title', 'idea', 'example', 'tip', 'mistake']) assert.ok(s[k]?.length > 5, `${s.id}.${k}`)
    for (const k of ['idea', 'example', 'tip', 'mistake']) assert.equal(s[k].split('`').length % 2, 1, `unbalanced backticks in ${s.id}.${k}`)
  }
  // grade 4 steps come before grade 5 steps (teaching order)
  assert.deepEqual(STEPS.map(s => s.grade), [...STEPS.map(s => s.grade)].sort())
  for (const h of HOME_IDEAS) assert.equal(h.text.split('`').length % 2, 1, h.title)
  for (const f of FAQ) assert.ok(!f.a.includes('`') && !f.q.includes('`'), 'FAQ is plain text')
})

test('fractions guide: every step links to an existing topic page of its grade', () => {
  for (const s of STEPS) {
    const m = s.topic.match(/^\/math\/grade-(\d)\/([a-z0-9-]+)$/)
    assert.ok(m, s.topic)
    assert.equal(+m[1], s.grade, s.id)
    assert.match(read(`src/math/topics/grade${m[1]}.js`), new RegExp(`slug: '${m[2]}'`), s.topic)
  }
})

test('fractions guide: page is routed, in the sitemap, search and more-links exist', () => {
  assert.match(read('src/App.jsx'), /path="\/math\/fractions"/)
  assert.match(read('public/sitemap-static.xml'), /ugabuga\.co\.il\/math\/fractions</)
  assert.match(read('src/data/searchStatic.js'), /to: '\/math\/fractions'/)
  const app = read('src/App.jsx')
  for (const l of MORE_LINKS) {
    const ok = app.includes(`path="${l.href}"`) || /^\/math\/(grade|tests\/grade)-\d/.test(l.href) || /^\/holidays\/hanukkah\/grade\//.test(l.href) || /^\/booklets\//.test(l.href)
    assert.ok(ok, l.href)
  }
})

test('fractions guide: comparison and arithmetic helpers', () => {
  assert.equal(gcd(12, 18), 6)
  assert.equal(lcm(4, 6), 12)
  assert.deepEqual(compareFractions(2, 3, 3, 5), { L: 15, x: 10, y: 9, sign: '>' })
  assert.deepEqual(compareFractions(1, 8, 1, 4), { L: 8, x: 1, y: 2, sign: '<' })
  assert.equal(compareFractions(2, 4, 3, 6).sign, '=')
  assert.deepEqual(simplify(6, 9), [2, 3])
  assert.deepEqual(simplify(4, 4), [1, 1])
  assert.ok(WALL_ROWS.every((d, i) => i === 0 || d > WALL_ROWS[i - 1]))
})
