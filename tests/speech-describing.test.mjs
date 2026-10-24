// /speech/language/describing: the describing-star data (items, clues, sentences, builder options,
// riddle rounds, comparison pairs) and the route/sitemap/menu/search entries.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CATS, DIMS, ITEMS, PAIRS, YES_NO, builderOptions, describe, dimById, emptyNote, itemByT, riddleRound, sentence, value } from '../src/data/speech/describing.js'

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const NIKUD = /[֑-ׇ]/
function seeded(seed) {
  let a = seed >>> 0
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}

test('route, sitemap, search and menu', () => {
  const p = '/speech/language/describing'
  assert.ok(read('src/App.jsx').includes(`path="${p}"`))
  assert.ok(read('public/sitemap-static.xml').includes(`https://ugabuga.co.il${p}<`))
  assert.ok(read('src/data/searchStatic.js').includes(`to: '${p}'`))
  assert.ok(read('src/data/siteMenu.js').includes(`to: '${p}'`))
})

test('seven star points, unique', () => {
  assert.equal(DIMS.length, 7)
  assert.equal(new Set(DIMS.map(d => d.id)).size, 7)
  for (const d of DIMS) assert.ok(d.name && d.q.includes('?') && d.e)
})

test('30–40 items, each fully described with clues and related words', () => {
  assert.ok(ITEMS.length >= 30 && ITEMS.length <= 40, `${ITEMS.length} items`)
  assert.equal(Object.keys(itemByT).length, ITEMS.length, 'duplicate item')
  for (const it of ITEMS) {
    assert.match(it.t, /^[א-ת׳ ]+$/, it.t)
    assert.ok(it.e, `${it.t}: picture`)
    assert.ok(['m', 'f'].includes(it.g), `${it.t}: gender`)
    assert.ok(CATS[it.cat], `${it.t}: category`)
    for (const k of ['look', 'place', 'use', 'more']) assert.ok(it[k] && !it[k].endsWith('.'), `${it.t}: ${k}`)
    assert.ok(it.mat === null || (Array.isArray(it.mat) && it.mat.length), `${it.t}: mat`)
    assert.ok(it.r.length >= 4 && it.r.every(c => /[.!]$/.test(c) && !c.includes(it.t)), `${it.t}: clues must not say the answer`)
    assert.ok(it.rel.length >= 3 && it.rel.length <= 4, `${it.t}: related words`)
    const all = describe(it)
    assert.ok(all.length >= 5, `${it.t}: description too short`)
    for (const s of all) assert.ok(s.endsWith('.') && !NIKUD.test(s) && !s.includes('undefined') && !s.includes('null'), s)
    for (const d of DIMS) if (!sentence(it, d.id)) assert.ok(emptyNote(it, d.id), `${it.t}: ${d.id} empty without a note`)
  }
})

test('builder: the item value plus two other values, all different', () => {
  const rnd = seeded(3)
  for (const it of ITEMS) for (const d of DIMS) {
    const opts = builderOptions(it, d.id, rnd)
    if (!value(it, d.id)) { assert.equal(opts, null); continue }
    assert.equal(opts.length, 3, `${it.t} ${d.id}`)
    assert.equal(opts.filter(o => o.owner === it).length, 1)
    assert.equal(new Set(opts.map(o => o.label)).size, 3)
    for (const o of opts) if (o.owner !== it) assert.notEqual(o.owner.cat, it.cat)
  }
})

test('riddle rounds: six different pictures including the answer', () => {
  const rnd = seeded(9)
  let prev
  for (let k = 0; k < 300; k++) {
    const r = riddleRound(rnd, prev)
    assert.equal(r.choices.length, 6)
    assert.equal(new Set(r.choices).size, 6)
    assert.ok(r.choices.includes(r.item))
    assert.notEqual(r.item.t, prev)
    prev = r.item.t
  }
})

test('comparison pairs and guess-who questions', () => {
  for (const p of PAIRS) {
    assert.ok(itemByT[p.a] && itemByT[p.b] && p.a !== p.b, `${p.a}/${p.b}`)
    assert.ok(p.same.length >= 2 && p.diff.length >= 2)
  }
  for (const [d, q] of YES_NO) assert.ok(dimById[d] && q.endsWith('?'))
})
