// /speech/language/directions and /speech/language/sequencing: instruction generator, the
// "did the child do it" check, the picture sequences, and the routes/sitemap/menu/search entries.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { SCENE_ITEMS, LEVELS, levelById, makeInstruction, sheetInstructions, checkLog, seeded, CARD_LEVELS, HERZL, CONCEPTS, SHEET_COUNTS } from '../src/data/speech/directions.js'
import { SEQUENCES, storyText, connector } from '../src/data/speech/sequences.js'

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const NIKUD = /[֑-ׇ]/

test('routes, sitemap, search and menu', () => {
  const app = read('src/App.jsx'), sitemap = read('public/sitemap-static.xml'), search = read('src/data/searchStatic.js'), menu = read('src/data/siteMenu.js')
  for (const p of ['/speech/language/directions', '/speech/language/sequencing']) {
    assert.ok(app.includes(`path="${p}"`), `route ${p}`)
    assert.ok(sitemap.includes(`https://ugabuga.co.il${p}<`), `sitemap ${p}`)
    assert.ok(search.includes(`to: '${p}'`), `search ${p}`)
    assert.ok(menu.includes(`to: '${p}'`), `menu ${p}`)
  }
})

test('scene items: unique ids, each one findable by a name or a description', () => {
  assert.equal(new Set(SCENE_ITEMS.map(i => i.id)).size, SCENE_ITEMS.length)
  for (const i of SCENE_ITEMS) assert.ok(i.name || i.refs.length, i.id)
  const names = SCENE_ITEMS.flatMap(i => [i.name, ...i.refs]).filter(Boolean)
  assert.equal(new Set(names).size, names.length, 'two items share a description')
})

test('instructions: the right number of steps, different items, plain text', () => {
  const rnd = seeded('t')
  for (const l of LEVELS) for (let k = 0; k < 200; k++) {
    const ins = makeInstruction(l.id, rnd)
    assert.equal(ins.steps.length, levelById[l.id].steps)
    assert.equal(new Set(ins.steps.map(s => s.item)).size, ins.steps.length, ins.text)
    assert.ok(!NIKUD.test(ins.text) && ins.text.endsWith('.'), ins.text)
    for (const s of ins.steps) assert.ok(ins.text.includes(s.ref), `${ins.text} / ${s.ref}`)
    if (l.id === 'one') for (const s of ins.steps) assert.ok(SCENE_ITEMS.some(i => i.name === s.ref), `plain name expected: ${s.ref}`)
    if (l.id === 'concepts') for (const s of ins.steps) assert.ok(SCENE_ITEMS.some(i => i.refs.includes(s.ref)), `concept expected: ${s.ref}`)
  }
})

test('printed sheets use each item once and fill the sheet', () => {
  for (const l of LEVELS) for (const seed of ['a', 'copy1', 'copy2']) {
    const list = sheetInstructions(l.id, seed)
    assert.equal(list.length, SHEET_COUNTS[l.id], `${l.id} ${seed}`)
    const items = list.flatMap(i => i.steps.map(s => s.item))
    assert.equal(new Set(items).size, items.length)
    assert.ok(list.every(i => !i.text.includes('שימו כוכב')), 'on paper the star is drawn')
  }
})

test('checkLog: done, other order, not yet', () => {
  const steps = [{ type: 'color', item: 'sun', color: 'red' }, { type: 'circle', item: 'cat' }]
  assert.equal(checkLog(steps, []), 'open')
  assert.equal(checkLog(steps, [{ type: 'color', item: 'sun', color: 'blue' }, { type: 'circle', item: 'cat' }]), 'open')
  assert.equal(checkLog(steps, [{ type: 'color', item: 'sun', color: 'red' }, { type: 'circle', item: 'cat' }]), 'done')
  assert.equal(checkLog(steps, [{ type: 'circle', item: 'cat' }, { type: 'color', item: 'sun', color: 'red' }]), 'order')
})

test('cards, concepts and "הרצל אמר" lists', () => {
  assert.equal(CARD_LEVELS.length, 3)
  const cards = CARD_LEVELS.flatMap(l => l.cards)
  assert.equal(new Set(cards).size, cards.length)
  assert.ok(cards.every(c => !NIKUD.test(c) && c.endsWith('.')))
  assert.ok(CONCEPTS.length >= 7)
  const herzl = HERZL.flatMap(g => g.items)
  assert.equal(new Set(herzl).size, herzl.length)
  assert.ok(herzl.length >= 25)
})

test('sequences: 10–14 stories of 3–6 pictures, unique, plain text', () => {
  assert.ok(SEQUENCES.length >= 10 && SEQUENCES.length <= 14)
  assert.equal(new Set(SEQUENCES.map(s => s.id)).size, SEQUENCES.length)
  for (const s of SEQUENCES) {
    assert.ok(s.steps.length >= 3 && s.steps.length <= 6, s.id)
    assert.equal(s.level, s.steps.length, s.id)
    assert.ok(s.questions.length >= 2, s.id)
    for (const st of s.steps) {
      assert.ok(st.t && !NIKUD.test(st.t) && /[.!]$/.test(st.t), st.t)
      assert.ok(st.art.length >= 1, st.t)
    }
    const story = storyText(s)
    assert.ok(story.startsWith('קודם ') && story.includes(' בסוף '), story)
  }
  for (const n of [3, 4, 5, 6]) assert.ok(SEQUENCES.some(s => s.steps.length === n), `a story with ${n} pictures`)
  assert.equal(connector(0, 4), 'קודם')
  assert.equal(connector(3, 4), 'בסוף')
})
