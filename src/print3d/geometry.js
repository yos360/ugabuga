// Printable 3D models built from code (three.js geometry -> STL).
// Shared by the browser (name keychain maker, live preview) and by
// scripts/print3d/build-models.mjs, which writes the ready-made files to public/3d/models/.
// Units are millimetres; every model lies flat on the bed (z = 0) in its printing pose,
// needs no supports, and is made of a few touching/overlapping solids that slicers merge.
import * as THREE from 'three'
import { Font } from 'three/examples/jsm/loaders/FontLoader.js'
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export const FONT_URL = '/fonts/3d/noto-hebrew-800.typeface.json'
export const makeFont = json => new Font(json)

const HEBREW = /[֐-׿]/
// Visual left-to-right order for text that contains Hebrew: the letters are drawn
// left to right, so a Hebrew name is reversed, but runs of digits/Latin keep their order.
export function visualOrder(text) {
  if (!HEBREW.test(text)) return text
  return (text.match(/[A-Za-z0-9]+|[^A-Za-z0-9]/g) || []).reverse().join('')
}

// Characters the 3D font has (Hebrew letters, digits, Latin, a few marks).
export const cleanName = (text, font) => [...String(text || '')].filter(ch => ch === ' ' || font.data.glyphs[ch]).join('').replace(/\s+/g, ' ').trim()

const boxOf = shapes => {
  const b = new THREE.Box2()
  for (const s of shapes) for (const p of s.getPoints(4)) b.expandByPoint(p)
  return b
}

// Text as flat shapes whose letters are `height` mm tall (measured on the real outlines),
// centred on the origin. maxWidth shrinks long names.
export function textShapes(font, text, height, maxWidth = Infinity) {
  const probe = font.generateShapes(visualOrder(text), 100)
  if (!probe.length) return { shapes: [], w: 0, h: 0 }
  const b0 = boxOf(probe)
  let size = 100 * height / (b0.max.y - b0.min.y)
  const w0 = (b0.max.x - b0.min.x) * size / 100
  if (w0 > maxWidth) size *= maxWidth / w0
  const shapes = font.generateShapes(visualOrder(text), size)
  const b = boxOf(shapes)
  const cx = (b.min.x + b.max.x) / 2, cy = (b.min.y + b.max.y) / 2
  const moved = shapes.map(s => {
    const m = new THREE.Shape(s.getPoints(8).map(p => new THREE.Vector2(p.x - cx, p.y - cy)))
    m.holes = s.holes.map(h => new THREE.Path(h.getPoints(8).map(p => new THREE.Vector2(p.x - cx, p.y - cy))))
    return m
  })
  return { shapes: moved, w: b.max.x - b.min.x, h: b.max.y - b.min.y }
}

const extrude = (shapes, depth, z0 = 0, curveSegments = 24) => {
  const g = new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: false, curveSegments })
  g.translate(0, 0, z0)
  return g.index ? g.toNonIndexed() : g
}
const merge = geoms => mergeGeometries(geoms.map(g => {
  const n = g.index ? g.toNonIndexed() : g
  for (const k of Object.keys(n.attributes)) if (k !== 'position' && k !== 'normal') n.deleteAttribute(k)
  return n
}), false)

const circlePath = (x, y, r, PathType = THREE.Path) => {
  const p = new PathType()
  p.absarc(x, y, r, 0, Math.PI * 2, true)
  return p
}

function roundedRect(x0, y0, w, h, r) {
  const s = new THREE.Shape()
  s.moveTo(x0 + r, y0)
  s.lineTo(x0 + w - r, y0); s.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r)
  s.lineTo(x0 + w, y0 + h - r); s.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h)
  s.lineTo(x0 + r, y0 + h); s.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r)
  s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0)
  return s
}

// ---------- name keychain / door sign ----------
export const NAME_STYLES = {
  keychain: { label: 'מחזיק מפתחות', textH: 9, maxW: 70, pad: 3.5, base: 3, raise: 1.8, radius: 4, tab: 11, hole: 2.6 },
  sign: { label: 'שלט לדלת החדר', textH: 24, maxW: 190, pad: 9, base: 4, raise: 2.5, radius: 7, tab: 0, hole: 2 },
}

// Returns { base, text } geometries; base has the hanging hole(s).
export function nameModel(font, rawText, styleKey = 'keychain') {
  const st = NAME_STYLES[styleKey] || NAME_STYLES.keychain
  const text = cleanName(rawText, font) || 'בוגה'
  const { shapes, w, h } = textShapes(font, text, st.textH, st.maxW)
  const bw = w + st.pad * 2 + st.tab, bh = h + st.pad * 2
  // the text sits in the left part; a keychain gets a round-ended tab with a hole on the right
  const x0 = -w / 2 - st.pad, y0 = -bh / 2
  const base = roundedRect(x0, y0, bw, bh, Math.min(st.radius, bh / 2 - 0.01))
  if (st.tab) base.holes.push(circlePath(x0 + bw - st.tab / 2 - 1.2, 0, st.hole))
  else base.holes.push(circlePath(x0 + 4.5, y0 + bh - 4.5, st.hole), circlePath(x0 + bw - 4.5, y0 + bh - 4.5, st.hole))
  const baseGeo = extrude([base], st.base)
  const textGeo = extrude(shapes, st.raise + 0.2, st.base - 0.2, 8)
  return { base: baseGeo, text: textGeo, text_: text, size: { w: bw, h: bh, z: st.base + st.raise } }
}

// ---------- dreidel (two parts: body printed upside down, handle pushed into its hole) ----------
// Returns { main, accent } lists of geometries. assembled = the standing dreidel for the preview.
export function dreidelParts(font, letters = ['נ', 'ג', 'ה', 'פ'], assembled = false) {
  const S = 28, half = S / 2, holeR = 3.3, holeDepth = 8
  // body in printing pose: the top face (with the handle hole) on the bed, the point up
  const parts = [], accent = []
  const ring = new THREE.Shape([[-half, -half], [half, -half], [half, half], [-half, half]].map(([x, y]) => new THREE.Vector2(x, y)))
  ring.holes.push(circlePath(0, 0, holeR))
  parts.push(extrude([ring], holeDepth))
  const solid = new THREE.Shape([[-half, -half], [half, -half], [half, half], [-half, half]].map(([x, y]) => new THREE.Vector2(x, y)))
  parts.push(extrude([solid], S - holeDepth + 0.1, holeDepth - 0.1))
  const tip = new THREE.ConeGeometry(half * Math.SQRT2, half, 4, 1)
  tip.rotateX(Math.PI / 2) // apex to +z
  tip.rotateZ(Math.PI / 4)
  tip.translate(0, 0, S + half / 2 - 0.1)
  parts.push(tip.index ? tip.toNonIndexed() : tip)
  // letters on the four sides, upright when the dreidel stands (up = -z in this pose)
  const up = new THREE.Vector3(0, 0, -1)
  const normals = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, -1, 0)]
  letters.forEach((ch, i) => {
    const { shapes } = textShapes(font, ch, 15)
    const g = extrude(shapes, 1.4, 0, 10)
    const n = normals[i], r = new THREE.Vector3().crossVectors(up, n)
    const m = new THREE.Matrix4().makeBasis(r, up, n)
    m.setPosition(n.clone().multiplyScalar(half - 0.2).add(new THREE.Vector3(0, 0, S / 2)))
    g.applyMatrix4(m)
    accent.push(g)
  })
  // handle, standing next to the body: a grip with a pin on top
  const hx = assembled ? 0 : S + 6
  const grip = new THREE.CylinderGeometry(4.2, 4.6, 20, 40); grip.rotateX(Math.PI / 2); grip.translate(hx, 0, 10)
  const pin = new THREE.CylinderGeometry(holeR - 0.25, holeR - 0.25, holeDepth - 0.4, 40); pin.rotateX(Math.PI / 2); pin.translate(hx, 0, 20 + (holeDepth - 0.4) / 2 - 0.1)
  const handle = [grip.toNonIndexed(), pin.toNonIndexed()]
  if (assembled) {
    // flip the body so the point is down, then sit the handle (pin down) in its hole
    const flip = new THREE.Matrix4().makeRotationX(Math.PI)
    for (const g of [...parts, ...accent]) g.applyMatrix4(flip).translate(0, 0, S + half)
    for (const g of handle) g.applyMatrix4(flip).translate(0, 0, S + half + 20 - 0.1)
  }
  return { main: [...parts, ...handle], accent }
}
export const dreidelModel = (font, letters) => { const p = dreidelParts(font, letters); return merge([...p.main, ...p.accent]) }

// ---------- hanukkiah (decoration / play only) ----------
export function hanukkiahParts(font) {
  const parts = []
  const W = 172, D = 36, H = 8
  parts.push(extrude([roundedRect(-W / 2, -D / 2, W, D, 6)], H))
  const holderY = 6, outerR = 8, innerR = 5.4
  const holder = (x, z0, h) => {
    const s = new THREE.Shape(); s.absarc(x, holderY, outerR, 0, Math.PI * 2, false)
    s.holes.push(circlePath(x, holderY, innerR))
    return extrude([s], h, z0, 48)
  }
  const pillar = (x, z0, h) => {
    const s = new THREE.Shape(); s.absarc(x, holderY, outerR, 0, Math.PI * 2, false)
    return extrude([s], h, z0, 48)
  }
  for (let i = 0; i < 4; i++) {
    const x = 16 + i * 18.5
    parts.push(pillar(x, H - 0.1, 2.1), holder(x, H + 2, 16))
    parts.push(pillar(-x, H - 0.1, 2.1), holder(-x, H + 2, 16))
  }
  parts.push(pillar(0, H - 0.1, 16.1), holder(0, H + 16, 16)) // the shamash, higher
  const { shapes } = textShapes(font, 'חנוכה שמח', 7.5, 120)
  const t = extrude(shapes, 1.6, H - 0.2, 8); t.translate(0, -D / 2 + 7, 0)
  return { main: parts, accent: [t] }
}
export const hanukkiahModel = font => { const p = hanukkiahParts(font); return merge([...p.main, ...p.accent]) }

// The page preview: [main colour, accent colour] in display pose.
export function previewModel(font, key) {
  const p = key === 'dreidel-pe' ? dreidelParts(font, ['נ', 'ג', 'ה', 'פ'], true)
    : key === 'dreidel-shin' ? dreidelParts(font, ['נ', 'ג', 'ה', 'ש'], true)
      : key === 'hanukkiah' ? hanukkiahParts(font)
        : key === 'star-of-david-cutter' ? { main: [cookieCutterModel(starOfDavidPoints(36))], accent: [] } : null
  if (!p) return null
  return [merge(p.main), ...(p.accent.length ? [merge(p.accent)] : [])]
}

// ---------- cookie cutters ----------
// Outward offset of a simple polygon (counter-clockwise points), with a miter limit.
export function offsetPolygon(pts, d, miterLimit = 2.2) {
  const n = pts.length, out = []
  for (let i = 0; i < n; i++) {
    const a = pts[(i - 1 + n) % n], b = pts[i], c = pts[(i + 1) % n]
    const e1 = new THREE.Vector2().subVectors(b, a).normalize(), e2 = new THREE.Vector2().subVectors(c, b).normalize()
    const n1 = new THREE.Vector2(e1.y, -e1.x), n2 = new THREE.Vector2(e2.y, -e2.x) // outward for CCW
    const bis = new THREE.Vector2().addVectors(n1, n2)
    const cos = bis.length() / 2
    if (cos < 1e-6) { out.push(b.clone().addScaledVector(n1, d)); continue }
    bis.normalize()
    const len = d / cos
    const convex = e1.x * e2.y - e1.y * e2.x > 0
    if (convex && len > d * miterLimit) { // bevel the sharp outer tip
      out.push(b.clone().addScaledVector(n1, d), b.clone().addScaledVector(n2, d))
    } else out.push(b.clone().addScaledVector(bis, len))
  }
  return out
}

export function starOfDavidPoints(R = 36) {
  const r = R / Math.sqrt(3), pts = []
  for (let k = 0; k < 12; k++) {
    const ang = Math.PI / 2 + k * Math.PI / 6
    const rad = k % 2 === 0 ? R : r
    pts.push(new THREE.Vector2(Math.cos(ang) * rad, Math.sin(ang) * rad))
  }
  return pts
}

// A cutter from any CCW outline: thin wall (cutting edge on top) and a flat rim on the bed.
export function cookieCutterModel(outline, { wall = 1.2, height = 15, rim = 4.5, rimH = 2 } = {}) {
  const toShape = (outer, inner) => {
    const s = new THREE.Shape(outer)
    s.holes.push(new THREE.Path(inner))
    return s
  }
  const wallShape = toShape(offsetPolygon(outline, wall, 4), outline)
  const rimShape = toShape(offsetPolygon(outline, rim, 1.5), outline)
  return merge([extrude([wallShape], height), extrude([rimShape], rimH)])
}

// ---------- export ----------
export function toSTL(geoms) {
  const group = new THREE.Group()
  for (const g of [].concat(geoms)) group.add(new THREE.Mesh(g))
  group.updateMatrixWorld(true)
  return new STLExporter().parse(group, { binary: true }) // DataView
}

export function sizeOf(geoms) {
  const b = new THREE.Box3()
  for (const g of [].concat(geoms)) { g.computeBoundingBox(); b.union(g.boundingBox) }
  return { x: +(b.max.x - b.min.x).toFixed(1), y: +(b.max.y - b.min.y).toFixed(1), z: +(b.max.z - b.min.z).toFixed(1), minZ: +b.min.z.toFixed(2) }
}
