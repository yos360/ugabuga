import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildLineMask, floodFill, undoFill } from '../src/pages/printables/phoneColoringFill.js'
import { QR_OFFERS, qrForSheet, qrOffer } from '../src/data/printMessages.js'
import { shortTarget } from '../functions/p/[[path]].js'

// A 20x20 white sheet with a black vertical line at x=10 splits it into two areas.
function sheet() {
  const w = 20, h = 20, px = new Uint8ClampedArray(w * h * 4).fill(255)
  for (let y = 0; y < h; y++) { const j = (y * w + 10) * 4; px[j] = px[j + 1] = px[j + 2] = 0 }
  return { w, h, px }
}
const at = (rgba, w, x, y) => [...rgba.slice((y * w + x) * 4, (y * w + x) * 4 + 3)]

test('a tap fills its own area only, and creeps under the line', () => {
  const { w, h, px } = sheet()
  const mask = buildLineMask(px, w, h)
  const color = new Uint8ClampedArray(w * h * 4).fill(255)
  assert.ok(floodFill(color, mask, w, h, 2, 2, [255, 0, 0]))
  assert.deepEqual(at(color, w, 0, 19), [255, 0, 0])
  assert.deepEqual(at(color, w, 10, 5), [255, 0, 0]) // under the line, no white rim
  assert.deepEqual(at(color, w, 15, 5), [255, 255, 255]) // the other side stays white
  assert.ok(!floodFill(color, mask, w, h, 2, 2, [255, 0, 0]), 'same colour again changes nothing')
  assert.ok(floodFill(color, mask, w, h, 15, 5, [0, 0, 255]))
  assert.deepEqual(at(color, w, 19, 19), [0, 0, 255])
  assert.deepEqual(at(color, w, 2, 2), [255, 0, 0])
})

test('a small gap in an outline does not let the colour leak out, and undo puts it back', () => {
  // A 30x30 square outline (x/y 5..24) with a 3-pixel gap in its top side.
  const w = 30, h = 30, px = new Uint8ClampedArray(w * h * 4).fill(255)
  const ink = (x, y) => { const j = (y * w + x) * 4; px[j] = px[j + 1] = px[j + 2] = 0 }
  for (let i = 5; i <= 24; i++) { if (i < 14 || i > 16) ink(i, 5); ink(i, 24); ink(5, i); ink(24, i) }
  const mask = buildLineMask(px, w, h)
  const color = new Uint8ClampedArray(w * h * 4).fill(255)
  const change = floodFill(color, mask, w, h, 15, 15, [255, 0, 0])
  assert.ok(change)
  assert.deepEqual(at(color, w, 15, 15), [255, 0, 0])
  assert.deepEqual(at(color, w, 1, 1), [255, 255, 255], 'outside stays white')
  undoFill(color, change)
  assert.deepEqual(at(color, w, 15, 15), [255, 255, 255])
})

test('a tap on the line itself fills the nearest area; off the sheet does nothing', () => {
  const { w, h, px } = sheet()
  const mask = buildLineMask(px, w, h)
  const color = new Uint8ClampedArray(w * h * 4).fill(255)
  assert.ok(floodFill(color, mask, w, h, 10, 10, [0, 255, 0]))
  assert.ok(!floodFill(color, mask, w, h, -1, 3, [0, 255, 0]))
  assert.ok(!floodFill(color, mask, w, h, 3, 20, [0, 255, 0]))
})

test('coloring sheets offer colouring on the phone through the printed QR', () => {
  const o = QR_OFFERS.coloring
  assert.equal(o.fresh.id, 'a6')
  assert.equal(o.control.id, 'c6')
  const path = '/printables/coloring/animals/3'
  const { variant, url } = qrForSheet(qrOffer('coloring', path) && { qrOffer: 'coloring', qrPath: path }, 'fresh', null, 'https://ugabuga.co.il', path)
  assert.equal(variant.id, 'a6')
  assert.equal(url, `https://ugabuga.co.il/p/a6${path}`)
  const landing = new URL(shortTarget('https://ugabuga.co.il', ['a6', 'printables', 'coloring', 'animals', '3']))
  assert.equal(landing.pathname, path)
  assert.equal(landing.searchParams.get('show'), 'color')
})

test('the coloring page marks its sheet and opens the screen colouring from ?show=color', () => {
  const page = readFileSync(new URL('../src/pages/printables/ColoringDrawing.jsx', import.meta.url), 'utf8')
  const landing = readFileSync(new URL('../src/utils/qrLanding.js', import.meta.url), 'utf8')
  assert.match(page, /qrOffer\('coloring', path\)/)
  assert.match(page, /get\('show'\) === 'color'/)
  assert.match(landing, /'color'/)
})
