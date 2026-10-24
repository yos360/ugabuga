import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { multiples, packStrips, copiesPerPage, tenFrames, baseTen, rulerTicks, CONTENT_TOP, CONTENT_BOTTOM, PAGE_W, PAGE_H } from '../src/pages/printables/mathDeskStrips.js'

test('a multiplication strip lists 1×n … 10×n with the right products', () => {
  const eight = multiples(8)
  assert.equal(eight.length, 10)
  assert.deepEqual(eight[0], { a: 1, b: 8, product: 8 })
  assert.deepEqual(eight[9], { a: 10, b: 8, product: 80 })
  for (let n = 1; n <= 10; n++) for (const c of multiples(n)) assert.equal(c.product, c.a * n)
})

test('strips are packed onto pages without running past the safe area', () => {
  const pages = packStrips(Array(10).fill(21), { gap: 6.5 })
  assert.equal(pages.flat().length, 10)
  for (const page of pages) for (const { y } of page) { assert.ok(y >= CONTENT_TOP); assert.ok(y + 21 <= CONTENT_BOTTOM) }
  assert.equal(packStrips(Array(10).fill(15), { gap: 6.5 }).length, 1, 'small strips: all ten on one page')
  assert.equal(copiesPerPage(21, { gap: 6.5 }), pages[0].length)
})

test('ten-frames split numbers into a ten and the ones', () => {
  assert.deepEqual(tenFrames(7), [7])
  assert.deepEqual(tenFrames(10), [10])
  assert.deepEqual(tenFrames(14), [10, 4])
  assert.deepEqual(tenFrames(20), [10, 10])
  assert.throws(() => tenFrames(21))
  assert.deepEqual(baseTen(37), { hundreds: 0, tens: 3, ones: 7 })
  assert.deepEqual(baseTen(100), { hundreds: 1, tens: 0, ones: 0 })
})

test('the ruler has a tick per millimetre and a label per centimetre', () => {
  const t = rulerTicks(187)
  assert.equal(t.length, 188)
  assert.deepEqual(t.filter(x => x.kind === 'cm').map(x => x.label), Array.from({ length: 19 }, (_, i) => String(i)))
  assert.equal(t.filter(x => x.kind === 'half').length, 19)
})

test('the sheet is a full A4 page in millimetres, printed 1:1 inside the 10 mm page margin', () => {
  assert.equal(PAGE_W, 210)
  assert.equal(PAGE_H, 297)
  const css = readFileSync(new URL('../src/pages/printables/math-desk-strips.css', import.meta.url), 'utf8')
  assert.match(css, /width:190mm;max-width:190mm;height:276mm/)
  assert.match(css, /svg\{display:block;width:210mm;height:297mm;max-width:none;margin:-10mm 0 0 -10mm\}/)
  assert.ok(CONTENT_BOTTOM <= 286 - 5, 'strips stay inside the printed window')
})

test('both pages are routed, in the sitemap and in search', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  const sitemap = readFileSync(new URL('../public/sitemap-static.xml', import.meta.url), 'utf8')
  const search = readFileSync(new URL('../src/data/searchStatic.js', import.meta.url), 'utf8')
  for (const path of ['/printables/multiplication-strips', '/printables/number-strip']) {
    assert.ok(app.includes(`path="${path}"`), path)
    assert.ok(sitemap.includes(`https://ugabuga.co.il${path}<`), path)
    assert.ok(search.includes(`to: '${path}'`), path)
  }
})
