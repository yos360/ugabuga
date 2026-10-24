// Data checks for /speech/aac: every symbol is unique and drawable, the core board is a full
// 6 × 8 grid without repeats, topic boards are 4 core + 12 words, gendered words have all forms,
// and the page is routed and in the sitemap.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CATEGORIES, ITEMS, itemById, CORE_COLUMNS, CORE_ROWS, CORE_GRID, TOPICS, topicGrid, wordOf, spokenOf, CHOICE_QUESTION } from '../src/data/speech/aac.js'

const pictos = readFileSync(new URL('../src/pages/speech/aacPictograms.jsx', import.meta.url), 'utf8')
const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
const NIKUD = /[֑-ׇ]/

test('items: unique ids, known categories, plain words, a picture each', () => {
  assert.equal(new Set(ITEMS.map(i => i.id)).size, ITEMS.length)
  const cats = new Set(CATEGORIES.map(c => c.id))
  for (const i of ITEMS) {
    assert.ok(cats.has(i.c), `${i.id}: unknown category ${i.c}`)
    const forms = typeof i.w === 'string' ? [i.w] : [i.w.m, i.w.f, i.w.b]
    for (const f of forms) assert.match(f, /^[א-ת /]+$/, `${i.id}: "${f}" must be plain Hebrew`)
    if (typeof i.w !== 'string') {
      assert.ok(i.w.m && i.w.f && i.w.b, `${i.id}: gendered word needs m, f and b`)
      assert.ok(i.w.b.includes('/'), `${i.id}: the shared form shows both ("צריך/ה")`)
      assert.notEqual(i.w.m, i.w.f, i.id)
    }
    if (i.say) assert.ok(NIKUD.test(typeof i.say === 'string' ? i.say : i.say.m), `${i.id}: say adds niqqud`)
    assert.ok(typeof i.e === 'string' && i.e.length > 0, `${i.id}: picture`)
    if (i.e.startsWith('svg:')) assert.ok(new RegExp(`\\n  ${i.e.slice(4)}: <g`).test(pictos), `${i.id}: drawing ${i.e} is missing`)
    for (const g of ['m', 'f', 'b']) assert.ok(!spokenOf(i, g).includes('/'), `${i.id}: spoken form must be readable`)
  }
  const words = ITEMS.map(i => wordOf(i, 'b'))
  assert.equal(new Set(words).size, words.length, 'two symbols share a word')
})

test('core board: 6 columns × 8 rows, 36–48 different core words, columns by part of speech', () => {
  assert.equal(CORE_COLUMNS.length, 6)
  for (const col of CORE_COLUMNS) assert.equal(col.length, CORE_ROWS)
  const ids = CORE_COLUMNS.flat()
  assert.ok(ids.length >= 36 && ids.length <= 48, `${ids.length} words`)
  assert.equal(new Set(ids).size, ids.length, 'a word repeats on the core board')
  for (const id of ids) assert.ok(itemById[id], `unknown ${id}`)
  for (const w of ['אני', 'רוצה', 'לא', 'כן', 'עוד', 'די', 'עזרה', 'ללכת', 'לשחק', 'לאכול', 'לשתות', 'לפתוח', 'לסגור', 'לשים', 'לתת', 'להסתכל', 'מה', 'איפה', 'מי', 'טוב', 'לא טוב', 'גדול', 'קטן', 'פה', 'שם', 'עכשיו', 'אחר כך', 'סיימתי', 'שלי', 'זה'])
    assert.ok(ids.some(id => wordOf(itemById[id], 'm') === w), `core board lacks ${w}`)
  // Each column holds one or two neighbouring categories, so the colours form bands.
  for (const col of CORE_COLUMNS) assert.ok(new Set(col.map(id => itemById[id].c)).size <= 2, col.join())
  assert.equal(CORE_GRID.length, CORE_ROWS)
  assert.deepEqual(CORE_GRID[0], CORE_COLUMNS.map(c => c[0]))
})

test('topic boards: 4 core words on top, 12 topic words, all known and not repeated', () => {
  assert.equal(TOPICS.length, 6)
  for (const t of TOPICS) {
    assert.equal(t.core.length, 4, t.id)
    assert.equal(t.items.length, 12, t.id)
    const all = [...t.core, ...t.items]
    assert.equal(new Set(all).size, 16, `${t.id}: repeated word`)
    for (const id of all) assert.ok(itemById[id], `${t.id}: unknown ${id}`)
    assert.equal(topicGrid(t).length, 4)
  }
})

test('gender: the speaker form changes, plain words stay', () => {
  const need = itemById.need
  assert.equal(wordOf(need, 'm'), 'צריך')
  assert.equal(wordOf(need, 'f'), 'צריכה')
  assert.equal(wordOf(need, 'b'), 'צריך/ה')
  assert.equal(spokenOf(need, 'b'), 'צריך')
  assert.equal(spokenOf(need, 'f'), 'צריכה')
  assert.equal(wordOf(itemById.want, 'f'), 'רוצה')
  assert.ok(CHOICE_QUESTION.m && CHOICE_QUESTION.f && CHOICE_QUESTION.b)
})

test('routed and in the sitemap', () => {
  assert.ok(app.includes('path="/speech/aac"'))
  assert.ok(sitemap.includes('https://ugabuga.co.il/speech/aac<'))
})
