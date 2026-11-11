// "הדפסת תלת־ממד" (/3d-print): the ready-made STL files exist and are valid, every page is routed
// and in the sitemap, the NASA previews exist, and the name keychain builds Hebrew in visual order.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { PRINT3D_MODELS, NASA_MODELS, nasaFolderUrl } from '../src/data/print3d.js'
import { makeFont, nameModel, visualOrder, dreidelModel, sizeOf } from '../src/print3d/geometry.js'

const read = p => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8')
const file = p => new URL(`../${p}`, import.meta.url)
const app = read('src/App.jsx'), sitemap = read('public/sitemap-static.xml')
const font = makeFont(JSON.parse(read('public/fonts/3d/noto-hebrew-800.typeface.json')))

test('every ready-made file is a valid binary STL', () => {
  for (const m of PRINT3D_MODELS) for (const f of [m.model + '.stl', ...m.files.map(x => x.file)]) {
    const buf = readFileSync(file(`public/3d/models/${f}`))
    const tris = buf.readUInt32LE(80)
    assert.ok(tris > 100, f)
    assert.equal(buf.length, 84 + tris * 50, `${f}: size matches its triangle count`)
  }
})

test('every 3D page is routed and in the sitemap', () => {
  const paths = ['/3d-print', '/3d-print/name-keychain', '/3d-print/space', ...PRINT3D_MODELS.map(m => `/3d-print/${m.slug}`)]
  assert.ok(app.includes('path="/3d-print"') && app.includes('path="/3d-print/:p"'), 'routes')
  for (const p of paths) {
    assert.ok(sitemap.includes(`<loc>https://ugabuga.co.il${p}</loc>`), `${p} sitemap`)
  }
})

test('NASA models have a preview image and a link to the NASA folder', () => {
  for (const m of NASA_MODELS) {
    assert.ok(statSync(file(`public/3d/nasa/${m.id}.webp`)).size > 1000, m.id)
    assert.match(nasaFolderUrl(m), /^https:\/\/github\.com\/nasa\/NASA-3D-Resources\/tree\/master\/3D%20Printing\//)
  }
})

test('Hebrew is laid out in visual order, digits and Latin keep theirs', () => {
  assert.equal(visualOrder('נועה'), 'העונ')
  assert.equal(visualOrder('אביגיל 7'), '7 ליגיבא')
  assert.equal(visualOrder('Noa'), 'Noa')
})

test('the name keychain and the dreidel sit on the bed and have a sane size', () => {
  const k = nameModel(font, 'אביגיל', 'keychain')
  const s = sizeOf([k.base, k.text])
  assert.equal(s.minZ, 0)
  assert.ok(s.x > 30 && s.x < 100 && s.y > 10 && s.y < 30, JSON.stringify(s))
  const long = sizeOf([nameModel(font, 'אלכסנדרה־מרגלית', 'keychain').base])
  assert.ok(long.x < 100, 'long names shrink')
  const d = sizeOf(dreidelModel(font, ['נ', 'ג', 'ה', 'פ']))
  assert.equal(d.minZ, 0)
  assert.ok(d.z > 40 && d.z < 45, JSON.stringify(d))
  assert.ok(existsSync(file('public/fonts/3d/OFL.txt')), 'font licence ships with the font')
})
