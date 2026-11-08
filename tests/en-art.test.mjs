import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ART_PAGES, DRAW_HUB, CBN_HUB, CBN_MANDALAS, ANSWER_HUB, LETTER_PAGE } from '../src/en/art/catalog.js'
import { HOW_TO_DRAW } from '../src/data/howToDraw.js'
import { CBN_PICTURES, CBN_MATH_KINDS, CBN_COLORS, CBN_LEVELS, CBN_THEMES, CBN_LETTER_LEVELS } from '../src/data/colorByNumber.js'
import { HOW_TO_DRAW_EN } from '../src/en/art/howToDrawText.js'
import { CBN_EN, COLOR_NAMES, LEVELS_EN, KINDS_EN, THEMES_EN, LETTER_LEVELS_EN } from '../src/en/art/cbnText.js'

const HEBREW = /[֐-׿]/

test('every Hebrew how-to-draw, color-by-number and color-by-answer page has one English page', () => {
  const counterparts = new Set(ART_PAGES.map(p => p.counterpart))
  const hebrew = [
    '/how-to-draw', ...HOW_TO_DRAW.map(d => `/how-to-draw/${d.slug}`),
    '/printables/color-by-number', '/printables/color-by-number/mandalas', ...CBN_PICTURES.map(p => `/printables/color-by-number/${p.slug}`),
    '/printables/color-by-answer', ...CBN_MATH_KINDS.map(k => `/printables/color-by-answer/${k.slug}`),
    '/printables/color-by-letter/english',
  ]
  for (const he of hebrew) assert.ok(counterparts.has(he), he)
  assert.equal(ART_PAGES.length, hebrew.length)
  // the Hebrew-letter page is left out on purpose: its whole point is telling Hebrew letters apart
  assert.ok(!counterparts.has('/printables/color-by-letter'))
})

test('paths, titles and descriptions are unique, English and the right length', () => {
  assert.equal(new Set(ART_PAGES.map(p => p.path)).size, ART_PAGES.length)
  assert.equal(new Set(ART_PAGES.map(p => p.title)).size, ART_PAGES.length)
  assert.equal(new Set(ART_PAGES.map(p => p.counterpart)).size, ART_PAGES.length)
  for (const p of ART_PAGES) {
    assert.ok(p.path.startsWith('/en/'), p.path)
    assert.ok(p.title.length <= 70, `${p.path}: title is ${p.title.length} chars`)
    assert.ok(p.description.length >= 100 && p.description.length <= 160, `${p.path}: description is ${p.description.length} chars`)
    assert.doesNotMatch(p.title + p.description, HEBREW, p.path)
    assert.ok(p.emoji, p.path)
  }
  // where the Hebrew slug is already English, the English URL is '/en' + the Hebrew path (stored compactly)
  for (const p of ART_PAGES) if (p.path !== LETTER_PAGE) assert.equal(p.path, '/en' + p.counterpart)
})

test('every item has complete English text', () => {
  for (const d of HOW_TO_DRAW) {
    const e = HOW_TO_DRAW_EN[d.slug]
    assert.ok(e, d.slug)
    assert.equal(e[2].length, d.steps.length, d.slug)
    assert.doesNotMatch(JSON.stringify(e), HEBREW, d.slug)
  }
  assert.equal(Object.keys(HOW_TO_DRAW_EN).length, HOW_TO_DRAW.length)
  for (const p of CBN_PICTURES) assert.ok(CBN_EN[p.slug]?.[0] && CBN_EN[p.slug][1], p.slug)
  assert.equal(Object.keys(CBN_EN).length, CBN_PICTURES.length)
  assert.equal(new Set(Object.values(CBN_EN).map(([n]) => n)).size, CBN_PICTURES.length)
  for (const k of Object.keys(CBN_COLORS)) assert.ok(COLOR_NAMES[k], k)
  for (const l of CBN_LEVELS) assert.ok(LEVELS_EN[l.id], l.id)
  for (const k of CBN_MATH_KINDS) assert.ok(KINDS_EN[k.id], k.id)
  for (const t of CBN_THEMES) assert.ok(THEMES_EN[t.id], t.id)
  for (const l of CBN_LETTER_LEVELS.filter(x => x.lang === 'en')) assert.ok(LETTER_LEVELS_EN[l.id], l.id)
  assert.doesNotMatch(JSON.stringify([CBN_EN, COLOR_NAMES, LEVELS_EN, KINDS_EN, THEMES_EN, LETTER_LEVELS_EN]), HEBREW)
})

test('the routes cover every page of the catalog, the first match being the right page', async () => {
  const { ART_ROUTES } = await import('../src/en/art/routes.js')
  const { matchPath } = await import('react-router-dom')
  const first = path => ART_ROUTES.find(r => matchPath({ path: r.path, end: true }, path))
  for (const p of ART_PAGES) assert.ok(first(p.path), p.path)
  assert.equal(first(CBN_MANDALAS).path, CBN_MANDALAS)
  assert.equal(first(DRAW_HUB).path, DRAW_HUB)
  assert.equal(first(ANSWER_HUB).path, ANSWER_HUB)
  assert.equal(first(CBN_HUB).path, CBN_HUB)
})
