// /speech/language/prepositions: concepts, "where is the cat?" pictures and contrast groups, the
// "put the …" room, the cut-and-paste sheet plan, and the route/sitemap/search/menu entries.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  LEVELS, CONCEPTS, conceptById, SCENES, sceneById, CARD_SCENES, GROUPS, whereRound, THINGS, FACTS, ZONES, zoneById,
  placeRound, sheetPlan, placeText, seeded, levelOfFact,
} from '../src/data/speech/prepositions.js'

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const HEBREW = /^[א-ת׳״־ ,.…]+$/

test('route, sitemap, search, menu and the language page list', () => {
  const p = '/speech/language/prepositions'
  assert.ok(read('src/App.jsx').includes(`path="${p}"`))
  assert.ok(read('public/sitemap-static.xml').includes(`https://ugabuga.co.il${p}<`))
  assert.ok(read('src/data/searchStatic.js').includes(`to: '${p}'`))
  assert.ok(read('src/data/siteMenu.js').includes(`to: '${p}'`))
  assert.ok(read('src/data/speech/language.js').includes(`path: '${p}'`))
})

test('concepts: every level has some, each has ideas and a picture of its own concept', () => {
  assert.equal(new Set(CONCEPTS.map(c => c.id)).size, CONCEPTS.length)
  for (const l of LEVELS) assert.ok(CONCEPTS.some(c => c.level === l.id), `level ${l.id}`)
  for (const c of CONCEPTS) {
    assert.ok(c.move && c.objects, c.id)
    assert.equal(sceneById[c.scene]?.concept, c.id, c.id)
    if (c.pair) assert.ok(conceptById[c.pair], `${c.id} pair`)
  }
  for (const w of ['על', 'מתחת ל…', 'בתוך', 'מחוץ ל…', 'ליד', 'לפני', 'מאחורי', 'בין', 'מעל', 'למעלה', 'למטה', 'קרוב', 'רחוק']) assert.ok(CONCEPTS.some(c => c.word === w), w)
  assert.ok(CONCEPTS.filter(c => c.level === 4).every(c => ['right', 'left'].includes(c.id)), 'right/left only at the advanced level')
})

test('scenes: plain Hebrew sentences about the cat, card sentences unique', () => {
  assert.equal(new Set(SCENES.map(s => s.id)).size, SCENES.length)
  for (const s of SCENES) {
    assert.ok(conceptById[s.concept], s.id)
    assert.match(s.s, HEBREW, s.s)
    assert.ok(s.s.startsWith('החתול '), s.s)
  }
  const texts = CARD_SCENES.map(s => s.s)
  assert.equal(new Set(texts).size, texts.length)
})

test('contrast groups: one picture per concept, no ambiguous pairs', () => {
  const clash = [['out', 'next'], ['out', 'right'], ['out', 'left'], ['next', 'right'], ['next', 'left'], ['next', 'front'], ['next', 'out'], ['near', 'next']]
  for (const g of GROUPS) {
    assert.ok(g.ids.length >= 2 && g.ids.length <= 3)
    const cs = g.ids.map(id => sceneById[id].concept)
    assert.equal(new Set(cs).size, cs.length, g.ids.join())
    for (const [a, b] of clash) assert.ok(!(cs.includes(a) && cs.includes(b)), `${a}+${b} in ${g.ids}`)
    assert.equal(new Set(g.ids.map(id => sceneById[id].ref)).size, 1, `${g.ids}: one reference drawing`)
  }
  for (const s of SCENES) assert.ok(GROUPS.some(g => g.ids.includes(s.id)), `${s.id} is in no group`)
  for (const l of LEVELS) assert.ok(GROUPS.some(g => g.level === l.id), `level ${l.id} has no group`)
})

test('where-rounds: target inside the group, new concepts asked at their level', () => {
  const rand = seeded(5)
  for (const l of LEVELS) for (let n = 0; n < 200; n++) {
    const r = whereRound(l.id, rand)
    assert.ok(r.ids.includes(r.target))
    assert.ok(conceptById[sceneById[r.target].concept].level <= l.id)
  }
})

test('room facts point at real zones; every zone describes itself', () => {
  for (const f of FACTS) {
    assert.ok(conceptById[f.concept], f.id)
    assert.ok(f.zones.length && f.zones.every(z => zoneById[z]), f.id)
    assert.match(f.text, HEBREW, f.text)
  }
  for (const z of ZONES) assert.ok(z.where && FACTS.some(f => f.zones.includes(z.id)), z.id)
  for (const t of THINGS) assert.ok(t.name.startsWith('ה') && t.e, t.id)
  assert.equal(placeText(THINGS[0], FACTS[1]), 'שימו את הכדור מתחת לשולחן')
  const rand = seeded(9)
  for (const l of LEVELS) for (let n = 0; n < 100; n++) assert.ok(levelOfFact(placeRound(l.id, rand).fact) <= l.id)
})

test('cut-and-paste sheets: six different things, places never shared, new concepts included', () => {
  for (const l of LEVELS) for (let seed = 0; seed < 40; seed++) {
    const plan = sheetPlan(l.id, seed)
    assert.equal(plan.length, 6, `level ${l.id}`)
    assert.equal(new Set(plan.map(p => p.thing.id)).size, 6)
    const zones = plan.flatMap(p => p.fact.zones)
    assert.equal(new Set(zones).size, zones.length, 'two instructions share a place')
    assert.ok(plan.every(p => levelOfFact(p.fact) <= l.id))
    assert.ok(plan.some(p => levelOfFact(p.fact) === l.id), `level ${l.id} sheet has nothing new`)
  }
  assert.deepEqual(sheetPlan(2, 3), sheetPlan(2, 3), 'same seed, same sheet')
})
