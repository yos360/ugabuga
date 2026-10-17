import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PRINTABLES, printableContext, recommendPrintables } from '../src/data/printablesCatalog.js'

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
const routes = [...app.matchAll(/path="([^"]+)"/g)].map(m => new RegExp('^' + m[1].replace(/:[^/]+/g, '[^/]+').replace(/\*/g, '.*') + '$'))
const base = path => path.split('?')[0]

test('every recommendable printable points at an existing page, once', () => {
  assert.equal(new Set(PRINTABLES.map(p => p.id)).size, PRINTABLES.length)
  for (const p of PRINTABLES) {
    assert.ok(routes.some(r => r.test(base(p.path))), `${p.id}: ${p.path} has no route`)
    assert.ok(p.title && p.type && p.category && Array.isArray(p.topics) && Array.isArray(p.grades), p.id)
  }
})

test('the page being printed is never suggested', () => {
  for (const p of PRINTABLES) {
    const ids = recommendPrintables(p.path, { search: p.path.includes('?') ? '?' + p.path.split('?')[1] : '' }).map(r => r.id)
    assert.ok(!ids.includes(p.id), `${p.id} suggests itself`)
  }
  assert.ok(!recommendPrintables('/printables/math-worksheets/up-to-20').some(r => r.id === 'math-worksheets'))
})

test('suggestions follow topic and grade', () => {
  const grade5 = recommendPrintables('/math/grade-5/fractions')
  assert.equal(grade5.length, 3)
  assert.ok(grade5.every(r => !r.grades.length || r.grades.includes(5)), JSON.stringify(grade5.map(r => r.id)))
  const birthday = recommendPrintables('/printables/birthday-crown')
  assert.ok(birthday.every(r => r.topics.some(t => ['birthday', 'party'].includes(t))), JSON.stringify(birthday.map(r => r.id)))
  const shabbat = recommendPrintables('/shabbat-activities/candles')
  assert.ok(shabbat.filter(r => r.topics.includes('shabbat')).length >= 2, JSON.stringify(shabbat.map(r => r.id)))
  const firstGrade = recommendPrintables('/classroom/first-grade')
  assert.ok(firstGrade.every(r => r.grades.includes(1) || r.grades.includes(0)), JSON.stringify(firstGrade.map(r => r.id)))
  const hanukkah = recommendPrintables('/holidays/hanukkah/coloring')
  assert.ok(hanukkah.some(r => r.topics.includes('hanukkah')))
  assert.ok(!hanukkah.some(r => r.topics.includes('lag-baomer')))
})

test('suggestions mix kinds of activity', () => {
  for (const path of ['/math/grade-3', '/printables/mazes', '/printables/coloring/animals', '/learn/reading/grade-4']) {
    const list = recommendPrintables(path)
    assert.ok(new Set(list.map(r => r.type)).size >= 2, `${path}: ${list.map(r => r.id)}`)
  }
})

test('pages outside the catalog still get context; the English site gets none', () => {
  assert.deepEqual(printableContext('/math/grade-4/geometry').grades, [4])
  assert.ok(printableContext('/parasha/bereshit').topics.includes('parasha'))
  assert.equal(printableContext('/en/printables'), null)
  assert.deepEqual(recommendPrintables('/en/coloring-pages'), [])
  assert.equal(recommendPrintables('/some/other-page').length, 3)
})
