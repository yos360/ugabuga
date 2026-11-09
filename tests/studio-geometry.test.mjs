import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { justify, snapMove, snapSize, coverRect, mosaicCells, gridFor, effectiveDpi, dpiLevel } from '../src/studio/geometry.js'

const box = { x: 10, y: 10, w: 280, h: 280 }
const inside = (r, b) => r.x >= b.x - 1e-6 && r.y >= b.y - 1e-6 && r.x + r.w <= b.x + b.w + 1e-6 && r.y + r.h <= b.y + b.h + 1e-6

test('justify keeps aspect ratios and stays inside the page', () => {
  const aspects = [1.5, 0.66, 1.5, 1, 1.33]
  const out = justify(aspects, box, 4)
  assert.equal(out.length, aspects.length)
  out.forEach((r, i) => {
    assert.ok(Math.abs(r.w / r.h - aspects[i]) < 1e-6, `aspect ${i}`)
    assert.ok(inside(r, box), `rect ${i} inside`)
  })
  assert.deepEqual(justify([], box, 4), [])
})

test('snapMove pulls an edge onto a nearby line', () => {
  const s = snapMove({ x: 52, y: 100, w: 40, h: 40 }, [{ x: 0, y: 0, w: 50, h: 50 }], { guidesX: [], guidesY: [] }, 3)
  assert.equal(s.dx, -2)
  assert.equal(s.lineX, 50)
  const none = snapMove({ x: 70, y: 100, w: 40, h: 40 }, [], { guidesX: [], guidesY: [] }, 3)
  assert.equal(none.dx, 0)
  assert.equal(none.lineX, null)
})

test('snapSize matches the height of another photo', () => {
  assert.equal(snapSize(99, [100, 140], 3), 100)
  assert.equal(snapSize(120, [100, 140], 3), 120)
})

test('coverRect fills the frame', () => {
  const r = coverRect(3000, 2000, 100, 100)
  assert.ok(r.w >= 100 && r.h >= 100)
  assert.equal(Math.round(r.h), 100)
})

test('mosaicCells lands near the wanted count inside a shape', () => {
  const w = 200, h = 100, mask = new Uint8Array(w * h)
  for (let y = 10; y < 90; y++) for (let x = 20; x < 180; x++) mask[y * w + x] = 255
  const cells = mosaicCells(mask, w, h, 40)
  assert.ok(cells.length >= 30 && cells.length <= 55, `got ${cells.length}`)
})

test('grids and print quality', () => {
  for (let n = 1; n <= 20; n++) assert.equal(gridFor(n).reduce((a, b) => a + b, 0), n)
  assert.equal(dpiLevel(effectiveDpi(3000, 2000, 254, 169)), 'good') // 3000 px over 10 in ≈ 300 dpi
  assert.equal(dpiLevel(effectiveDpi(600, 400, 254, 169)), 'low')
})

test('album and collage pages are routed, listed and linked', () => {
  const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')
  assert.match(app, /path="\/tools\/album"/)
  assert.match(app, /path="\/tools\/collage\/:kind"/)
  const news = readFileSync(new URL('../src/data/whatsNew.js', import.meta.url), 'utf8')
  assert.match(news, /\/tools\/album/)
  assert.match(news, /\/tools\/collage/)
})
