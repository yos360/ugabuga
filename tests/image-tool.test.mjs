// /tools/image: pure logic of the image studio (sizes, names, crop, collage, target size, wand, zip)
import { test } from 'node:test'
import assert from 'node:assert/strict'
const L = await import('../src/office/image/imageLogic.js')

test('bytes, percent and names', () => {
  assert.equal(L.formatBytes(500), '500 B')
  assert.equal(L.formatBytes(350 * 1024), '350 KB')
  assert.equal(L.formatBytes(2.5 * 1024 * 1024), '2.5 MB')
  assert.equal(L.formatBytes(24 * 1024 * 1024), '24 MB')
  assert.equal(L.savedPercent(1000, 250), 75)
  assert.equal(L.savedPercent(1000, 1200), -20)
  assert.equal(L.outName('IMG_0001.HEIC', '', 'jpg'), 'IMG_0001.jpg')
  assert.equal(L.outName('טיול שנתי.jpeg', 'קטן', 'webp'), 'טיול שנתי-קטן.webp')
  assert.equal(L.outName('a:b?.png', 'x', 'png'), 'a-b-x.png')
  assert.equal(L.outName('', '', 'jpg'), 'תמונה.jpg')
  assert.deepEqual(L.uniqueNames(['a.jpg', 'A.jpg', 'b.jpg', 'a.jpg']), ['a.jpg', 'A (2).jpg', 'b.jpg', 'a (3).jpg'])
  assert.equal(L.extForMime('image/jpeg'), 'jpg')
  assert.equal(L.defaultFormat('image/png'), 'png')
  assert.equal(L.defaultFormat('image/gif'), 'jpg')
  assert.ok(L.isHeic({ name: 'x.HEIC', type: '' }))
  assert.ok(L.isHeic({ name: 'x', type: 'image/heif' }))
  assert.ok(!L.isHeic({ name: 'x.jpg', type: 'image/jpeg' }))
})

test('fit and canvas-safe sizes never upscale and keep the ratio', () => {
  assert.deepEqual(L.fitWithin(4000, 3000, 1600), { width: 1600, height: 1200 })
  assert.deepEqual(L.fitWithin(800, 600, 1600), { width: 800, height: 600 })
  assert.deepEqual(L.fitWithin(3000, 4000, 1080, 1080), { width: 810, height: 1080 })
  const s = L.safeSize(9000, 6000)
  assert.ok(s.width <= 4096 && s.width * s.height <= 16e6)
  assert.ok(Math.abs(s.width / s.height - 1.5) < 0.01)
  const big = L.safeSize(4000, 4000, 8192)
  assert.ok(big.width * big.height <= 16e6)
})

test('target size: best quality that fits, shrinks pixels when even low quality is too big', async () => {
  // fake encoder: size grows with quality and with area
  const enc = ({ quality, scale }) => Promise.resolve({ size: Math.round(1e6 * scale * scale * (0.2 + quality)) })
  const easy = await L.fitToSize(enc, 2e6)
  assert.equal(easy.quality, 0.92); assert.equal(easy.scale, 1); assert.ok(easy.fits)
  const mid = await L.fitToSize(enc, 800e3)
  assert.ok(mid.fits && mid.scale === 1 && mid.result.size <= 800e3 && mid.quality > 0.5 && mid.quality < 0.62, JSON.stringify(mid))
  const hard = await L.fitToSize(enc, 100e3)
  assert.ok(hard.fits && hard.scale < 1 && hard.result.size <= 100e3, JSON.stringify(hard))
  const impossible = await L.fitToSize(() => Promise.resolve({ size: 5e6 }), 1000)
  assert.equal(impossible.fits, false)
})

test('crop: centred ratio rects, move and resize stay inside and keep the ratio', () => {
  assert.deepEqual(L.centeredCrop(4000, 3000, null), { x: 0, y: 0, w: 4000, h: 3000 })
  const sq = L.centeredCrop(4000, 3000, 1)
  assert.deepEqual(sq, { x: 500, y: 0, w: 3000, h: 3000 })
  const story = L.centeredCrop(4000, 3000, 9 / 16)
  assert.ok(Math.abs(story.w / story.h - 9 / 16) < 1e-9 && story.h === 3000)
  assert.deepEqual(L.moveRect(sq, 5000, -50, 4000, 3000), { x: 1000, y: 0, w: 3000, h: 3000 })
  // free: dragging the west edge past the east edge stops at min width
  const free = L.resizeRect({ x: 100, y: 100, w: 200, h: 200 }, 'w', 500, 0, null, 1000, 1000, 20)
  assert.equal(free.w, 20); assert.equal(free.x + free.w, 300)
  // locked: south-east corner grows, north-west corner stays, ratio holds, clamped to image
  const r = L.resizeRect({ x: 100, y: 100, w: 400, h: 500 }, 'se', 2000, 2000, 4 / 5, 1000, 1000, 20)
  assert.equal(r.x, 100); assert.equal(r.y, 100)
  assert.ok(Math.abs(r.w / r.h - 0.8) < 1e-9 && r.y + r.h <= 1000 + 1e-9 && r.x + r.w <= 1000 + 1e-9)
  // locked: north-west corner keeps the south-east corner fixed
  const nw = L.resizeRect({ x: 200, y: 200, w: 300, h: 300 }, 'nw', -100, -40, 1, 1000, 1000)
  assert.equal(nw.x + nw.w, 500); assert.equal(nw.y + nw.h, 500); assert.equal(nw.w, nw.h); assert.equal(nw.w, 400)
  assert.deepEqual(L.rotatedSize(4000, 3000, 1), { width: 3000, height: 4000 })
  assert.deepEqual(L.rotatedSize(4000, 3000, -2), { width: 4000, height: 3000 })
  assert.deepEqual(L.roundRect({ x: 0.4, y: 0.6, w: 10.2, h: 9.9 }), { x: 0, y: 1, w: 10, h: 10 })
  assert.deepEqual(L.roundRect({ x: 89.6, y: 0, w: 10.4, h: 10.4 }, 100, 100), { x: 90, y: 0, w: 10, h: 10 })
  assert.deepEqual(L.roundRect({ x: 99.6, y: 0, w: 10.4, h: 10.4 }, 100, 100), { x: 90, y: 0, w: 10, h: 10 })
})

test('rect helpers for blur boxes and text hits', () => {
  assert.deepEqual(L.normRect(50, 80, 10, 20), { x: 10, y: 20, w: 40, h: 60 })
  const rects = [{ x: 0, y: 0, w: 100, h: 100 }, { x: 50, y: 50, w: 100, h: 100 }]
  assert.equal(L.hitRect(rects, 60, 60), 1)
  assert.equal(L.hitRect(rects, 10, 10), 0)
  assert.equal(L.hitRect(rects, 300, 300), -1)
})

test('collage: every layout of 2–9 photos covers the canvas once, first photo on the right', () => {
  for (let n = 2; n <= 9; n++) {
    const layouts = L.collageLayouts(n)
    assert.ok(layouts.length >= 4, `n=${n}`)
    assert.equal(new Set(layouts.map(l => l.id)).size, layouts.length)
    for (const l of layouts) {
      assert.equal(l.cells.length, n, `${l.id} n=${n}`)
      const area = l.cells.reduce((s, c) => s + c.w * c.h, 0)
      assert.ok(Math.abs(area - 1) < 1e-9, `${l.id} n=${n} area ${area}`)
      for (const c of l.cells) assert.ok(c.x >= -1e-9 && c.y >= -1e-9 && c.x + c.w <= 1 + 1e-9 && c.y + c.h <= 1 + 1e-9)
      // no two cells overlap
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        const a = l.cells[i], b = l.cells[j]
        const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)
        assert.ok(ox <= 1e-9 || oy <= 1e-9, `${l.id} n=${n} cells ${i},${j} overlap`)
      }
    }
    const first = layouts.find(l => l.id === 'rows').cells[0]
    assert.ok(first.x + first.w > 1 - 1e-9, 'RTL: first cell touches the right edge')
  }
  assert.equal(L.collageLayouts(20)[0].cells.length, 9)
})

test('collage: gaps are even around and between photos; cover crop keeps the ratio', () => {
  const cells = L.collageLayouts(2).find(l => l.id === 'rows').cells
  const px = L.cellRects(cells, 1000, 500, 20).sort((a, b) => a.x - b.x)
  assert.deepEqual(px[0], { x: 20, y: 20, w: 470, h: 460 })
  assert.deepEqual(px[1], { x: 510, y: 20, w: 470, h: 460 })
  const c = L.coverCrop(4000, 3000, 1000, 1000)
  assert.deepEqual(c, { sx: 500, sy: 0, sw: 3000, sh: 3000 })
  const t = L.coverCrop(3000, 4000, 1080, 1920)
  assert.ok(Math.abs(t.sw / t.sh - 1080 / 1920) < 1e-9 && t.sh === 4000)
})

test('wand: contiguous fill stops at a different colour; global fill takes every match', () => {
  // 5×3: white | red wall in column 2 | white
  const w = 5, h = 3, px = new Uint8ClampedArray(w * h * 4)
  for (let p = 0; p < w * h; p++) {
    const red = p % w === 2
    px.set(red ? [220, 20, 20, 255] : [250, 250, 248, 255], p * 4)
  }
  const m = L.floodMask(px, w, h, 0, 0, 10, true)
  assert.equal(L.countMask(m), 6)
  assert.equal(m[1], 1); assert.equal(m[3], 0)
  assert.equal(L.countMask(L.floodMask(px, w, h, 0, 0, 10, false)), 12)
  assert.equal(L.countMask(L.floodMask(px, w, h, 0, 0, 100, true)), 15)
  assert.equal(L.countMask(L.floodMask(px, w, h, 9, 9, 10)), 0)
  const out = L.applyMask(px.slice(), m, w, h, true)
  assert.equal(out[3], 0)
  assert.equal(out[(2) * 4 + 3], 140, 'edge pixel next to the cleared area is softened')
  assert.equal(out[(4) * 4 + 3], 255)
  assert.ok(L.colorDistance(0, 0, 0, 255, 255, 255) === 100 && L.colorDistance(10, 10, 10, 10, 10, 10) === 0)
})

test('zip: valid store-only archive with UTF-8 names and correct CRCs', () => {
  assert.equal(L.crc32(new TextEncoder().encode('123456789')), 0xcbf43926)
  const a = new TextEncoder().encode('hello'), b = new Uint8Array([1, 2, 3])
  const zip = L.makeZip([{ name: 'שלום.jpg', data: a }, { name: 'שלום.jpg', data: b }])
  const dv = new DataView(zip.buffer)
  assert.equal(dv.getUint32(0, true), 0x04034b50)
  const end = zip.length - 22
  assert.equal(dv.getUint32(end, true), 0x06054b50)
  assert.equal(dv.getUint16(end + 10, true), 2)
  const cdOffset = dv.getUint32(end + 16, true), cdSize = dv.getUint32(end + 12, true)
  assert.equal(cdOffset + cdSize, end)
  assert.equal(dv.getUint32(cdOffset, true), 0x02014b50)
  assert.equal(dv.getUint32(cdOffset + 16, true), L.crc32(a))
  const names = new TextDecoder().decode(zip)
  assert.ok(names.includes('שלום.jpg') && names.includes('שלום (2).jpg'))
})
