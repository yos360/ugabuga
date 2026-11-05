// Draws the state from runGame.js with three.js. Everything is painted and built from code, so there is nothing
// to download: the road is a stone causeway high above each world, with giants rising from far below on both sides.
import * as THREE from 'three'
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js'
import { LANE_W, WORLDS, groundAt, inZone, segment, worldPosition } from './runGame'

const PATH_W = LANE_W * 3 + 1.4
const FLOOR_Y = -34
const GIANT_CLEAR = 15 // the widest giant's reach from its centre, plus room to spare
const CORNER_CLEAR = 30
const FUR_LAYERS = 9
const QUALITY = [{ ratio: 1.5, shadows: true }, { ratio: 1, shadows: true }, { ratio: 1, shadows: false }, { ratio: 0.7, shadows: false }]
const LOOK = {
  jungle: { sky: ['#3f9fe0', '#a6e3f2', '#fff3c4'], fog: 0xb9e6d6, ridge: ['#2e7d5b', '#4f9f74', '#86c79a'], sun: '#fff6c8', stone: ['#c9b48c', '#b39c72', '#6b5b3f'], wall: ['#8d8468', '#6f6850', '#47432f'], rail: 0x7b6a4a, accent: 0xff6a3d, trim: 0x3f8f4f, low: ['#2f7d3e', '#3f9a49', '#1f5f33'], hemi: [0xf4fff0, 0x4e7a44, 2.1], sunLight: [0xfff0c8, 2.5] },
  desert: { sky: ['#2f7fd8', '#8fd0f0', '#ffe2ae'], fog: 0xf7d6a4, ridge: ['#b5613a', '#d08350', '#ebb078'], sun: '#fff2c0', stone: ['#ecc98c', '#d9ad6a', '#9a6f3c'], wall: ['#c98a52', '#a96c3c', '#70431f'], rail: 0xb5713c, accent: 0x18a999, trim: 0xe24e3a, low: ['#e0ac63', '#eec078', '#c78f4b'], hemi: [0xfff4dc, 0xa8784a, 2.1], sunLight: [0xffe6b4, 2.7] },
  candy: { sky: ['#b06cf0', '#ff9fd0', '#ffe1c9'], fog: 0xffc4dc, ridge: ['#d66bbd', '#f28fc6', '#ffb7d3'], sun: '#fff0f8', stone: ['#fff0f6', '#ffd5e6', '#e78cb4'], wall: ['#ff9dbb', '#f27aa3', '#b84a7c'], rail: 0xff5d9e, accent: 0x31c8e8, trim: 0xffd23f, low: ['#ffb3d2', '#ffd1a6', '#c9a4f2'], hemi: [0xfff2fa, 0xc77aa8, 2.3], sunLight: [0xfff0e4, 2.2] },
  night: { sky: ['#0d0b33', '#2a2570', '#7c3f9e'], fog: 0x2d2668, ridge: ['#1a174f', '#26206a', '#3a2f86'], sun: '#fdf6d0', stone: ['#51509a', '#3f3e85', '#22215a'], wall: ['#34327c', '#272566', '#16143f'], rail: 0x2a2873, accent: 0xff4fc4, trim: 0x37e6ff, low: ['#1c1a55', '#2b2878', '#141240'], hemi: [0xb8b4ff, 0x25206a, 2.2], sunLight: [0xb8c2ff, 1.3] },
}

const clamp01 = v => Math.max(0, Math.min(1, v))
const eased = v => { const k = clamp01(v); return k * k * (3 - 2 * k) }
const angleOf = dir => dir * Math.PI / 2
const generator = seed => { let n = (seed || 1) >>> 0; return () => { n = (n * 1664525 + 1013904223) >>> 0; return n / 4294967296 } }
const hex = color => new THREE.Color(color).getHex()

function canvasTexture(w, h, paint, repeat = true) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  paint(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

function paintStones(x, w, h, [light, base, dark], rows, r, wide = 2) {
  x.fillStyle = dark; x.fillRect(0, 0, w, h)
  const rowH = h / rows
  for (let row = 0; row < rows; row++) {
    const cells = wide + (row % 2), cellW = w / cells
    for (let c = -1; c <= cells; c++) {
      const px = c * cellW + (row % 2 ? cellW / 2 : 0)
      x.fillStyle = r() < 0.5 ? light : base
      x.globalAlpha = 0.72 + r() * 0.28
      x.beginPath(); x.roundRect(px + 4, row * rowH + 4, cellW - 8, rowH - 8, 14); x.fill()
      // no two stones alike: a warm or a cool cast, a lit top edge, a shaded bottom edge
      x.globalAlpha = r() * 0.14
      x.fillStyle = r() < 0.5 ? '#ffcf8a' : '#5f7f99'
      x.beginPath(); x.roundRect(px + 4, row * rowH + 4, cellW - 8, rowH - 8, 14); x.fill()
      x.globalAlpha = 0.18
      x.fillStyle = '#fff'
      x.beginPath(); x.roundRect(px + 9, row * rowH + 8, cellW - 18, 7, 4); x.fill()
      x.globalAlpha = 0.14
      x.fillStyle = '#000'
      x.beginPath(); x.roundRect(px + 9, (row + 1) * rowH - 15, cellW - 18, 8, 4); x.fill()
      x.globalAlpha = 1
    }
  }
  for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},${r() * 0.05})`; x.fillRect(r() * w, r() * h, 2 + r() * 7, 2 + r() * 5) }
}

// One long sheet across the whole road, so the stones do not repeat in a grid: worn lanes, moss, cracks, shaded edges.
const ROAD_METRES = 7.05
const roadTexture = look => canvasTexture(1024, 1024, (x, w, h) => {
  const r = generator(11)
  paintStones(x, w, h, look.stone, 12, r, 7)
  for (const lane of [0.5 - 0.28, 0.5, 0.5 + 0.28]) { // feet polish the middle of each lane
    const wear = x.createLinearGradient((lane - 0.1) * w, 0, (lane + 0.1) * w, 0)
    wear.addColorStop(0, 'rgba(255,255,255,0)'); wear.addColorStop(0.5, 'rgba(255,255,255,0.13)'); wear.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = wear; x.fillRect((lane - 0.1) * w, 0, 0.2 * w, h)
  }
  x.strokeStyle = look.stone[2]; x.lineWidth = 2.5; x.lineCap = 'round'
  for (let i = 0; i < 26; i++) {
    let px = r() * w, py = r() * h
    x.globalAlpha = 0.65
    x.beginPath(); x.moveTo(px, py)
    for (let k = 0; k < 4; k++) { px += (r() - 0.5) * 46; py += 8 + r() * 26; x.lineTo(px, py) }
    x.stroke()
  }
  x.globalAlpha = 1
  for (const side of [0, 1]) for (let i = 0; i < 46; i++) { // moss creeping in from the edges
    const reach = r() * r() * 0.16 * w
    x.fillStyle = look.low[i % 3]
    x.globalAlpha = 0.28 + r() * 0.3
    x.beginPath(); x.ellipse(side ? w - reach : reach, r() * h, 8 + r() * 26, 8 + r() * 20, r() * 3, 0, 6.3); x.fill()
  }
  x.globalAlpha = 1
  for (const [from, to] of [[0, 0.09], [1, 0.91]]) {
    const edge = x.createLinearGradient(from * w, 0, to * w, 0)
    edge.addColorStop(0, 'rgba(0,0,0,0.5)'); edge.addColorStop(1, 'rgba(0,0,0,0)')
    x.fillStyle = edge; x.fillRect(Math.min(from, to) * w, 0, 0.09 * w, h)
  }
})
const wallTexture = look => canvasTexture(512, 512, (x, w, h) => paintStones(x, w, h, look.wall, 6, generator(23)))

const floorTexture = (name, look) => canvasTexture(512, 512, (x, w, h) => {
  const r = generator(31)
  x.fillStyle = look.low[2]; x.fillRect(0, 0, w, h)
  if (name === 'night') {
    x.strokeStyle = '#3a35a0'; x.lineWidth = 8
    for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * w / 4, 0); x.lineTo(i * w / 4, h); x.moveTo(0, i * h / 4); x.lineTo(w, i * h / 4); x.stroke() }
    for (let i = 0; i < 160; i++) { x.fillStyle = ['#ffd24a', '#7ff', '#f6c'][i % 3]; x.fillRect(r() * w, r() * h, 3, 3) }
    return
  }
  for (let i = 0; i < 420; i++) {
    const px = r() * w, py = r() * h, size = 12 + r() * (name === 'desert' ? 70 : 34)
    x.fillStyle = look.low[i % 2]
    x.globalAlpha = 0.5
    for (const [ox, oy] of [[0, 0], [w, 0], [-w, 0], [0, h], [0, -h]]) { x.beginPath(); x.ellipse(px + ox, py + oy, size, size * (name === 'desert' ? 0.3 : 0.8), 0, 0, 7); x.fill() }
  }
  x.globalAlpha = 1
})

// A painted panorama: sky, sun, clouds and three ranges of far hills, seamless all the way round.
const skyTexture = (name, look) => canvasTexture(1536, 768, (x, w, h) => {
  x.scale(0.75, 0.75)
  w = 2048; h = 1024
  const r = generator(name.length * 77 + 5)
  const g = x.createLinearGradient(0, 0, 0, h * 0.56)
  look.sky.forEach((c, i) => g.addColorStop(i / 2, c))
  x.fillStyle = g; x.fillRect(0, 0, w, h)
  if (name === 'night') for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(255,255,255,${r()})`; x.fillRect(r() * w, r() * h * 0.5, 1 + r() * 2.4, 1 + r() * 2.4) }
  const sunX = w * 0.5, sunY = h * (name === 'night' ? 0.2 : 0.3)
  const glow = x.createRadialGradient(sunX, sunY, 8, sunX, sunY, 230)
  glow.addColorStop(0, look.sun); glow.addColorStop(0.2, look.sun + '77'); glow.addColorStop(1, look.sun + '00')
  x.fillStyle = glow; x.fillRect(0, 0, w, h)
  x.fillStyle = look.sun; x.beginPath(); x.arc(sunX, sunY, name === 'night' ? 66 : 54, 0, 7); x.fill()
  if (name === 'candy') for (const [cx, cy, rr, c] of [[420, 170, 96, '#ffd86b'], [1620, 230, 150, '#9fe8ff'], [1180, 90, 44, '#ff8ac0']]) {
    const b = x.createRadialGradient(cx - rr / 3, cy - rr / 3, 4, cx, cy, rr); b.addColorStop(0, '#fff'); b.addColorStop(1, c)
    x.fillStyle = b; x.beginPath(); x.arc(cx, cy, rr, 0, 7); x.fill()
  }
  for (let i = 0; i < 13; i++) {
    const cx = r() * w, cy = 90 + r() * h * 0.28, size = 30 + r() * 60
    for (let p = 0; p < 9; p++) {
      const px = cx + (r() - 0.5) * size * 3.4, py = cy + (r() - 0.5) * size * 0.5, rr = size * (0.4 + r() * 0.6)
      const b = x.createRadialGradient(px, py, 2, px, py, rr)
      const white = name === 'night' ? '120,100,200' : '255,255,255'
      b.addColorStop(0, `rgba(${white},${name === 'night' ? 0.2 : 0.85})`); b.addColorStop(1, `rgba(${white},0)`)
      x.fillStyle = b; x.beginPath(); x.ellipse(px, py, rr * 1.6, rr * 0.7, 0, 0, 7); x.fill()
    }
  }
  // ridges: sums of whole-number waves, so the left and right edges of the picture meet
  look.ridge.slice().reverse().forEach((color, layer) => {
    const base = h * (0.5 - (2 - layer) * 0.02), amp = 26 - layer * 5, freqs = [3 + layer, 7 + layer * 2, 17, 31].map(f => [f, r() * 7])
    x.fillStyle = color
    x.beginPath(); x.moveTo(0, h)
    for (let i = 0; i <= w; i += 4) {
      const a = i / w * Math.PI * 2
      const y = freqs.reduce((sum, [f, ph], k) => sum + Math.sin(a * f + ph) / (k + 1), 0)
      x.lineTo(i, base - amp * (name === 'night' ? Math.round(y * 3) / 3 : y))
    }
    x.lineTo(w, h); x.fill()
  })
  const mist = `#${look.fog.toString(16).padStart(6, '0')}`
  x.fillStyle = mist; x.fillRect(0, h * 0.53, w, h)
  const haze = x.createLinearGradient(0, h * 0.42, 0, h * 0.53)
  haze.addColorStop(0, mist + '00'); haze.addColorStop(1, mist)
  x.fillStyle = haze; x.fillRect(0, h * 0.42, w, h * 0.11)
}, false)

function labelTexture(text, { bg = '#fff4bb', fg = '#14162d', size = 150 } = {}) {
  return canvasTexture(512, 256, x => {
    x.fillStyle = bg
    x.beginPath(); x.roundRect(8, 8, 496, 240, 44); x.fill()
    x.lineWidth = 14; x.strokeStyle = '#14162d'; x.stroke()
    x.fillStyle = fg
    x.font = `900 ${size}px Heebo, Arial, sans-serif`
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.direction = 'ltr'
    x.fillText(text, 256, 136)
  }, false)
}

const glowTexture = () => canvasTexture(128, 128, (x, w) => {
  const g = x.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g; x.fillRect(0, 0, w, w)
}, false)

const towerTexture = (colors, hue) => canvasTexture(256, 512, (x, w, h) => {
  const r = generator(hue * 13 + 3)
  x.fillStyle = colors; x.fillRect(0, 0, w, h)
  for (let row = 0; row < 24; row++) for (let c = 0; c < 8; c++) {
    const lit = r() < 0.5
    x.fillStyle = lit ? ['#ffd97a', '#8df3ff', '#ff9ee0'][Math.floor(r() * 3)] : 'rgba(255,255,255,0.05)'
    x.fillRect(c * w / 8 + 7, row * h / 24 + 6, w / 8 - 14, h / 24 - 12)
  }
})

// A clump of leaves: a ball pushed in and out so it has no round outline, shaded smoothly across the bumps.
function leafClump() {
  const ball = new THREE.IcosahedronGeometry(1, 3)
  ball.deleteAttribute('uv'); ball.deleteAttribute('normal')
  const g = mergeVertices(ball), p = g.attributes.position, v = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    v.multiplyScalar(1 + 0.2 * Math.sin(v.x * 5.1 + v.y * 3.3) * Math.cos(v.z * 4.7 - v.y * 2.2) + 0.1 * Math.sin(v.x * 11 + v.z * 9))
    p.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  ball.dispose()
  return g
}

const GEO = {
  box: new THREE.BoxGeometry(1, 1, 1),
  round: new THREE.SphereGeometry(1, 12, 9),
  fine: new THREE.SphereGeometry(1, 24, 16),
  rock: new THREE.IcosahedronGeometry(1, 1),
  blob: new THREE.IcosahedronGeometry(1, 1),
  leaf: leafClump(),
  cone: new THREE.ConeGeometry(1, 1, 9),
  spire: new THREE.ConeGeometry(1, 1, 6),
  cyl: new THREE.CylinderGeometry(1, 1, 1, 9),
  taper: new THREE.CylinderGeometry(0.62, 1, 1, 8),
  torus: new THREE.TorusGeometry(1, 0.34, 8, 18),
  coin: new THREE.CylinderGeometry(0.46, 0.46, 0.13, 16),
  plane: new THREE.PlaneGeometry(1, 1),
  mesa: new THREE.CylinderGeometry(0.92, 1, 1, 9),
}

// Static parts of a stretch go into one mesh: hundreds of shapes for one draw call.
class Batch {
  parts = []
  matrix = new THREE.Matrix4()
  put(geo, color, x, y, z, sx = 1, sy = sx, sz = sx, rx = 0, ry = 0, rz = 0) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone()
    g.deleteAttribute('uv')
    this.matrix.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), new THREE.Vector3(sx, sy, sz))
    g.applyMatrix4(this.matrix)
    const n = g.attributes.position.count, c = new THREE.Color(color), rgb = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) { rgb[i * 3] = c.r; rgb[i * 3 + 1] = c.g; rgb[i * 3 + 2] = c.b }
    g.setAttribute('color', new THREE.BufferAttribute(rgb, 3))
    this.parts.push(g)
  }
  // the last part darkens towards its underside, as if lit from above through the leaves
  shadeUp(low, high) {
    const g = this.parts[this.parts.length - 1], { position, color } = g.attributes
    g.computeBoundingBox()
    const { min, max } = g.boundingBox
    for (let i = 0; i < position.count; i++) {
      const k = low + (high - low) * (position.getY(i) - min.y) / (max.y - min.y)
      color.setXYZ(i, color.getX(i) * k, color.getY(i) * k, color.getZ(i) * k)
    }
  }
  mesh(material) {
    if (!this.parts.length) return null
    const merged = mergeGeometries(this.parts)
    this.parts.forEach(p => p.dispose())
    return new THREE.Mesh(merged, material)
  }
}

// ---- the giants rising from far below, right beside the road ----
function jungleGiant(b, r, x, top, z) {
  if (r() < 0.32) { // a stepped ruin grown over with moss
    const size = 9 + r() * 5
    for (let i = 0, y = FLOOR_Y; y < top - 6; i++) {
      const step = 5.5, w = size * (1 - Math.min(i, 8) * 0.075)
      b.put(GEO.box, i % 2 ? 0x8f8a6c : 0x77785a, x, y + step / 2, z, w, step, w)
      b.put(GEO.box, 0x4f9a4a, x, y + step + 0.15, z, w * 0.99, 0.5, w * 0.99)
      y += step
    }
    return
  }
  const girth = 1.4 + r() * 1.3, height = top - FLOOR_Y
  b.put(GEO.taper, 0x6e4a2c, x, FLOOR_Y + height / 2, z, girth, height, girth)
  for (let i = 0; i < 3; i++) { const a = r() * 6.3; b.put(GEO.cyl, 0x7b5533, x + Math.cos(a) * girth * 1.6, top - 5 - i * 3, z + Math.sin(a) * girth * 1.6, 0.34, 7, 0.34, Math.sin(a) * 0.8, 0, -Math.cos(a) * 0.8) }
  for (let i = 0; i < 4; i++) {
    const a = i * 2.4, reach = i ? 3.5 + r() * 4.5 : 0, size = 4.2 + r() * 3.4
    b.put(GEO.leaf, [0x2f8f46, 0x3fae52, 0x57c060, 0x247a3e][i % 4], x + Math.cos(a) * reach, top + (r() - 0.3) * 4, z + Math.sin(a) * reach, size, size * 0.72, size, 0, r() * 6.3)
    b.shadeUp(0.45, 1.25)
  }
  for (let i = 0; i < 5; i++) { const a = r() * 6.3, reach = 2 + r() * 6, long = 4 + r() * 8; b.put(GEO.cyl, 0x3c8a44, x + Math.cos(a) * reach, top - 2 - long / 2, z + Math.sin(a) * reach, 0.09, long, 0.09) }
  if (r() < 0.5) b.put(GEO.round, 0xff5d8f, x + 3, top + 3, z + 2, 0.7)
}

function desertGiant(b, r, x, top, z) {
  const strata = [0xc4693c, 0xd98953, 0xb35a33, 0xe7a568, 0xc4693c, 0xe3b27b]
  let y = FLOOR_Y, wide = 6 + r() * 5
  if (r() < 0.3) { // a thin red spire
    b.put(GEO.spire, 0xb35a33, x, (FLOOR_Y + top + 8) / 2, z, wide * 0.5, top + 8 - FLOOR_Y, wide * 0.5, 0, r() * 3)
    b.put(GEO.rock, 0xd98953, x + 1, top + 6, z, 2.2, 1.6, 2.2)
    return
  }
  const layers = 6, step = (top - FLOOR_Y) / layers
  for (let i = 0; i < layers; i++) {
    b.put(GEO.mesa, strata[i % strata.length], x, y + step / 2, z, wide, step + 0.2, wide, 0, r() * 3)
    y += step
    wide *= 0.86 + r() * 0.1
  }
  if (r() < 0.6) {
    b.put(GEO.cyl, 0x3f9e6b, x, top + 2.2, z, 0.6, 4.6, 0.6)
    b.put(GEO.cyl, 0x3f9e6b, x + 1.1, top + 3, z, 0.34, 2.2, 0.34)
    b.put(GEO.cyl, 0x3f9e6b, x + 0.6, top + 2.1, z, 0.28, 1, 0.28, 0, 0, 1.57)
  }
}

function candyGiant(b, r, x, top, z) {
  const kind = r(), bright = [0xff5d9e, 0x31c8e8, 0xffd23f, 0x8e6cf0, 0x5fdc8f, 0xff8a3d]
  const c = () => bright[Math.floor(r() * bright.length)]
  if (kind < 0.36) { // a lollipop tree
    const size = 6 + r() * 3
    b.put(GEO.cyl, 0xfff6ee, x, (FLOOR_Y + top) / 2, z, 0.8, top - FLOOR_Y, 0.8)
    b.put(GEO.fine, c(), x, top + size * 0.7, z, size, size, 1.5)
    for (let i = 1; i <= 4; i++) { const t = new THREE.TorusGeometry(i * size / 5, 0.26, 6, 28); b.put(t, i % 2 ? 0xffffff : c(), x, top + size * 0.7, z + 1.5 * Math.cos(i / 6), 1); t.dispose() }
  } else if (kind < 0.68) { // a tower of frosted donuts
    let y = FLOOR_Y
    while (y < top) {
      const size = 5.5 + r() * 2.5
      b.put(GEO.torus, 0xd9a15f, x, y + size * 0.4, z, size, size, size * 1.2, 1.57)
      b.put(GEO.torus, c(), x, y + size * 0.55, z, size * 1.02, size * 1.02, size * 0.8, 1.57)
      y += size * 0.85
    }
  } else { // an ice-cream swirl mountain
    const layers = 9, step = (top - FLOOR_Y) / layers, tint = c()
    for (let i = 0; i < layers; i++) {
      const w = 10 * (1 - i / (layers + 1))
      b.put(GEO.round, i % 2 ? 0xfff2e2 : tint, x + Math.sin(i) * 0.8, FLOOR_Y + step * (i + 0.5), z + Math.cos(i) * 0.8, w, step * 0.8, w)
    }
    b.put(GEO.round, 0xe8243c, x, top + 1.2, z, 1.8)
  }
}

function cityGiant(b, r, x, top, z, group, materials) {
  const w = 8 + r() * 7, d = 8 + r() * 7, height = top + 14 - FLOOR_Y
  const tower = new THREE.Mesh(GEO.box, materials[Math.floor(r() * materials.length)])
  tower.position.set(x, FLOOR_Y + height / 2, z); tower.scale.set(w, height, d)
  group.add(tower)
  const neon = [0xff4fc4, 0x37e6ff, 0xffd24a, 0x7cff8a][Math.floor(r() * 4)]
  b.put(GEO.box, neon, x, top + 14.2, z, w + 0.5, 0.5, d + 0.5)
  b.put(GEO.box, 0x1a174f, x, top + 15.6, z, w * 0.5, 2.6, d * 0.5)
  b.put(GEO.cyl, neon, x, top + 19.5, z, 0.14, 6, 0.14)
  b.put(GEO.round, neon, x, top + 22.6, z, 0.5)
  for (let y = top - 18; y < top + 12; y += 8) b.put(GEO.box, neon, x, y, z, w + 0.24, 0.2, d + 0.24)
}

const GIANT = { jungle: jungleGiant, desert: desertGiant, candy: candyGiant, night: cityGiant }

function railDecor(b, world, look, x, y, z, flip) {
  if (world === 'jungle') {
    b.put(GEO.taper, 0x7a6a4f, x, y + 0.9, z, 0.3, 1.8, 0.3)
    b.put(GEO.round, 0xffc14a, x, y + 2, z, 0.28)
  } else if (world === 'desert') {
    b.put(GEO.cyl, 0x6e4a2c, x, y + 1.6, z, 0.09, 3.2, 0.09)
    b.put(GEO.box, flip ? 0xe24e3a : 0x18a999, x + 0.7, y + 2.8, z, 1.3, 0.7, 0.05)
  } else if (world === 'candy') {
    for (let i = 0; i < 5; i++) b.put(GEO.cyl, i % 2 ? 0xffffff : 0xe8243c, x, y + 0.3 + i * 0.5, z, 0.2, 0.52, 0.2)
    b.put(GEO.torus, 0xffffff, x + 0.28, y + 2.7, z, 0.34, 0.34, 0.34)
  } else {
    b.put(GEO.cyl, 0x8d8bd6, x, y + 1.7, z, 0.08, 3.4, 0.08)
    b.put(GEO.round, look.trim, x, y + 3.4, z, 0.26)
  }
}

function archway(b, world, look, y, z) {
  const inner = PATH_W / 2 + 0.2, tall = 7.5
  const stone = hex(look.stone[1]), dark = hex(look.wall[1])
  for (const side of [-1, 1]) {
    b.put(GEO.box, dark, side * inner, y + tall / 2, z, 1.1, tall, 1.3)
    b.put(GEO.box, look.accent, side * inner, y + tall * 0.72, z, 1.22, 0.5, 1.42)
    b.put(GEO.box, stone, side * inner, y + 0.4, z, 1.5, 0.8, 1.7)
  }
  if (world === 'candy') {
    const ring = new THREE.TorusGeometry(inner, 0.5, 10, 30, Math.PI)
    b.put(ring, look.accent, 0, y + tall - 0.4, z, 1); b.put(ring, 0xffffff, 0, y + tall - 0.4, z + 0.5, 0.97)
    ring.dispose()
  } else {
    b.put(GEO.box, stone, 0, y + tall + 0.45, z, inner * 2 + 3, 1, 1.7)
    b.put(GEO.box, look.trim, 0, y + tall + 1.15, z, inner * 2 + 1.5, 0.42, 1.2)
    b.put(GEO.round, look.accent, 0, y + tall + 1.9, z, 0.8)
  }
}

// One strip of road from `a` to `b` along the path; its edges are given as [x, y above the road].
function strip(seg, a, b, [xl, yl], [xr, yr], across, along) {
  const rows = Math.max(1, Math.ceil((b - a) / 2.5)), pos = [], uv = [], index = []
  for (let i = 0; i <= rows; i++) {
    const d = a + (b - a) * i / rows, h = groundAt(seg, d)
    pos.push(xl, h + yl, -d, xr, h + yr, -d)
    uv.push(0, d / along, across, d / along)
    if (i < rows) { const n = i * 2; index.push(n, n + 1, n + 2, n + 1, n + 3, n + 2) }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(index)
  g.computeVertexNormals()
  return g
}

// The inside of a cave: a vault over the road from `from` to `to`, following its rise and fall.
function vault(seg, from, to, radius, tall) {
  const rows = Math.max(1, Math.ceil((to - from) / 2.5)), sides = 14, pos = [], uv = [], index = []
  for (let i = 0; i <= rows; i++) {
    const d = from + (to - from) * i / rows, h = groundAt(seg, d)
    for (let k = 0; k <= sides; k++) {
      const a = Math.PI * k / sides
      pos.push(Math.cos(a) * radius, h + Math.sin(a) * tall - 0.4, -d)
      uv.push(k / 3, d / 5)
      if (i < rows && k < sides) { const n = i * (sides + 1) + k; index.push(n, n + sides + 1, n + 1, n + 1, n + sides + 1, n + sides + 2) }
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(index)
  g.computeVertexNormals()
  return g
}

// Rock heaped round a cave's mouth, in the colours of the world.
function caveMouth(b, world, look, r, y, z, radius, tall) {
  const rock = () => hex(look.wall[Math.floor(r() * 2)])
  for (let i = 0; i <= 26; i++) {
    const a = Math.PI * (i % 13) / 12, ring = i < 13 ? 0.9 : 2.9, size = (i < 13 ? 1.7 : 2.3) + r() * 1.3
    const x = Math.cos(a) * (radius + ring), top = y + Math.sin(a) * (tall + ring)
    if (world === 'candy') b.put(GEO.round, i % 2 ? look.accent : 0xfff2e2, x, top, z, size * 0.9)
    else b.put(GEO.rock, rock(), x, top, z, size, size * 0.9, size, r() * 3, r() * 3)
    if (world === 'jungle' && i % 3 === 1) { b.put(GEO.leaf, 0x3fae52, x, top + 1.6, z + 0.6, 2.2, 1.5, 2.2, 0, r() * 6); b.shadeUp(0.55, 1.2) }
    if (world === 'night' && i % 2) b.put(GEO.box, look.trim, x, top, z + 0.9, 1, 0.26, 0.2, 0, 0, a)
  }
}

function addCave(seg, zone, world, look, b, add, set, sprites, r, lights) {
  const radius = PATH_W / 2 + 1.1, tall = 9.8, { from, to } = zone
  add(vault(seg, from, to, radius, tall), set.cave)
  add(strip(seg, from, to, [-PATH_W / 2, 0.04], [PATH_W / 2, 0.04], 1, 1), sprites.shade)
  caveMouth(b, world, look, r, groundAt(seg, from), -from, radius, tall)
  caveMouth(b, world, look, r, groundAt(seg, to), -to, radius, tall)
  add(vault(seg, from, to, radius + 3.4, tall + 3.6), set.hill) // the hill the cave runs through, open at both ends
  const ribShape = new THREE.TorusGeometry(1, 0.05, 6, 18, Math.PI)
  const flame = world === 'night' ? look.trim : world === 'candy' ? look.accent : 0xffa23a
  for (let d = from + 3.5, i = 0; d < to - 1; d += 7, i++) {
    const y = groundAt(seg, d)
    b.put(ribShape, hex(look.wall[0]), 0, y - 0.4, -d, radius - 0.08, tall - 0.08, 7)
    const side = i % 2 ? 1 : -1
    b.put(GEO.cyl, 0x4a3524, side * (PATH_W / 2 + 0.2), y + 3, -d, 0.09, 1.1, 0.09)
    b.put(GEO.round, flame, side * (PATH_W / 2 + 0.2), y + 3.7, -d, 0.26, 0.38, 0.26)
    lights.push({ at: [side * (PATH_W / 2 + 0.2), y + 3.8, -d], color: flame, size: 4.6, opacity: 0.85 })
  }
  ribShape.dispose()
}

// A bridge of loose planks over the drop. Each plank is its own piece, so they can fall away behind Buga.
function makeBridge(seg, zone, world, look, b, sprites, r, holes) {
  const planks = []
  for (let d = zone.from + 0.5; d < zone.to; d += 0.98) if (!holes.some(at => Math.abs(at - d) < 2)) planks.push(d)
  const mesh = new THREE.InstancedMesh(GEO.box, sprites.plank, planks.length)
  const place = new THREE.Object3D(), tint = new THREE.Color()
  const shades = { jungle: [0x9a6b3c, 0x7f5730, 0xa97a48], desert: [0xc98a52, 0xa96c3c, 0xdba166], candy: [0x8a4b2a, 0x6e3a20, 0xffc1da], night: [0x3a3f9e, 0x2b2f7e, 0x37e6ff] }[world]
  const pieces = planks.map((d, i) => {
    place.position.set((r() - 0.5) * 0.3, groundAt(seg, d) - 0.11, -d)
    place.rotation.set(0, (r() - 0.5) * 0.05, 0)
    place.scale.set(PATH_W + 0.4 + (r() - 0.5) * 0.5, 0.22, 0.84)
    place.updateMatrix()
    mesh.setMatrixAt(i, place.matrix)
    mesh.setColorAt(i, tint.set(shades[Math.floor(r() * 3)]))
    return { d, x: place.position.x, y: place.position.y, yaw: place.rotation.y, wide: place.scale.x, vy: 0, down: 0, spin: (r() - 0.5) * 6, delay: r() * 1.2, gone: false }
  })
  mesh.receiveShadow = true
  mesh.frustumCulled = false
  const half = PATH_W / 2 + 0.2
  const rope = world === 'night' ? look.trim : world === 'candy' ? 0xfff2e2 : 0xc9a66b
  for (const side of [-1, 1]) {
    for (let d = zone.from; d < zone.to; d += 5) {
      const near = Math.min(d + 5, zone.to), y0 = groundAt(seg, d), y1 = groundAt(seg, near), long = near - d
      b.put(GEO.cyl, hex(look.wall[1]), side * half, y0 + 0.7, -d, 0.12, 1.9, 0.12)
      // two ropes, sagging a little between the posts
      for (const high of [0.75, 1.45]) {
        const pieces = 4
        for (let k = 0; k < pieces; k++) {
          const sag = t => (y0 + (y1 - y0) * t) + high - 0.28 * Math.sin(Math.PI * t)
          const t0 = k / pieces, t1 = (k + 1) / pieces, rise = sag(t1) - sag(t0), run = long / pieces
          b.put(GEO.cyl, rope, side * half, (sag(t0) + sag(t1)) / 2, -(d + long * (t0 + t1) / 2), 0.045, Math.hypot(rise, run), 0.045, Math.atan2(run, -rise))
        }
      }
    }
  }
  return { mesh, pieces, place }
}

// The way not taken, and until the choice both ways: a stretch of road running off from the fork.
function forkStub(seg, side, look, set, sprites, g, geometries) {
  const half = PATH_W / 2, long = 64, y = seg.h1, x = side * (half + long / 2), z = -seg.len
  const group = new THREE.Group(), road = new THREE.PlaneGeometry(long, PATH_W)
  const uv = road.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getY(i), uv.getX(i) * long / ROAD_METRES)
  road.rotateX(-Math.PI / 2)
  road.translate(x, y, z)
  const surface = new THREE.Mesh(road, set.road)
  surface.receiveShadow = true
  const b = new Batch()
  for (const edge of [-1, 1]) {
    b.put(GEO.box, look.rail, x, y + 0.27, z + edge * (half + 0.28), long, 0.55, 0.55)
    b.put(GEO.box, hex(look.wall[1]), x, y - 3.5, z + edge * (half + 0.28), long, 7, 0.55)
  }
  b.put(GEO.box, hex(look.wall[2]), x, y - 0.25, z, long, 0.4, PATH_W)
  const walls = b.mesh(sprites.lit)
  group.add(surface, walls)
  g.add(group)
  geometries.push(road, walls.geometry)
  return group
}

function makeObstacle(it, world, look, sprites) {
  const g = new THREE.Group()
  const b = new Batch()
  if (it.kind === 'wall') {
    if (it.show === 'roll') {
      const ball = new THREE.Group()
      const rock = new THREE.Mesh(GEO.blob, new THREE.MeshStandardMaterial({ color: hex(look.wall[0]), roughness: 0.85, flatShading: true }))
      ball.add(rock)
      ball.scale.setScalar(1.3); ball.position.y = 1.3
      const band = new THREE.Mesh(GEO.torus, sprites.gloss(look.accent))
      band.scale.set(1.02, 1.02, 0.4); ball.add(band)
      rock.castShadow = band.castShadow = true
      g.add(ball); g.userData.ball = ball
      return g
    }
    if (it.show === 'swing') {
      for (const side of [-1, 1]) b.put(GEO.box, hex(look.wall[1]), side * (PATH_W / 2 + 0.3), 3.8, 0, 0.5, 7.6, 0.5)
      b.put(GEO.box, hex(look.wall[0]), 0, 7.6, 0, PATH_W + 1.6, 0.6, 0.6)
      const arm = new THREE.Group(); arm.position.y = 7.4
      const rope = new THREE.Mesh(GEO.cyl, sprites.gloss(0x5a4a3a)); rope.scale.set(0.09, 5.6, 0.09); rope.position.y = -2.8
      const weight = new THREE.Mesh(GEO.blob, new THREE.MeshStandardMaterial({ color: look.accent, roughness: 0.4, flatShading: true }))
      weight.scale.setScalar(1.15); weight.position.y = -6
      weight.castShadow = true
      arm.add(rope, weight); g.add(arm); g.userData.arm = arm
    } else if (world === 'jungle') { // a totem with a cross face
      b.put(GEO.box, 0x7e6a48, 0, 1.3, 0, 2.1, 2.6, 1.4)
      b.put(GEO.box, 0x5e7e4a, 0, 2.75, 0, 2.3, 0.32, 1.5)
      for (const side of [-1, 1]) { b.put(GEO.round, 0xfff4cc, side * 0.48, 1.75, 0.68, 0.26); b.put(GEO.round, 0x1b1b2b, side * 0.48, 1.75, 0.86, 0.12) }
      b.put(GEO.box, 0x3a2f20, 0, 0.95, 0.72, 1.1, 0.26, 0.04)
    } else if (world === 'desert') {
      b.put(GEO.rock, 0xb5713c, 0, 1, 0, 1.45, 1.3, 1.1)
      b.put(GEO.rock, 0xd08350, 0.4, 2.1, 0, 0.9, 0.8, 0.8)
    } else if (world === 'candy') {
      b.put(GEO.cyl, 0xd9a15f, 0, 0.8, 0, 1.15, 1.6, 1.15)
      b.put(GEO.round, 0xff8ac0, 0, 2, 0, 1.3, 1, 1.3)
      b.put(GEO.round, 0xe8243c, 0, 3, 0, 0.36)
    } else {
      b.put(GEO.box, 0x2d2b73, 0, 1.3, 0, 2.1, 2.6, 1.4)
      for (let i = 0; i < 4; i++) b.put(GEO.box, i % 2 ? 0xffd24a : 0xff4fc4, 0, 0.4 + i * 0.62, 0.72, 2.12, 0.3, 0.04)
    }
  } else if (it.kind === 'low') {
    b.put(GEO.cyl, hex(look.wall[1]), 0, 0.44, 0, 0.44, LANE_W * 0.98, 0.44, 0, 0, 1.57)
    b.put(GEO.cyl, look.accent, 0, 0.44, 0, 0.47, 0.3, 0.47, 0, 0, 1.57)
    for (const side of [-1, 1]) b.put(GEO.cyl, look.trim, side * LANE_W * 0.3, 0.44, 0, 0.47, 0.18, 0.47, 0, 0, 1.57)
  } else if (it.kind === 'high') {
    const bar = new Batch()
    bar.put(GEO.box, look.accent, 0, 1.95, 0, PATH_W - 0.4, 0.9, 0.9)
    for (let i = -3; i <= 3; i++) bar.put(GEO.box, i % 2 ? 0xffffff : look.trim, i * 1.3, 1.95, 0.47, 0.9, 0.5, 0.04)
    const beam = bar.mesh(sprites.lit); beam.castShadow = true; g.add(beam); g.userData.bar = beam
    for (const side of [-1, 1]) {
      b.put(GEO.box, hex(look.wall[1]), side * (PATH_W / 2 + 0.25), 2.9, 0, 0.6, 5.8, 0.8)
      b.put(GEO.round, look.accent, side * (PATH_W / 2 + 0.25), 6, 0, 0.5)
    }
  } else if (it.kind === 'pad') {
    b.put(GEO.cyl, 0x34324f, 0, 0.1, 0, 1.05, 0.2, 1.05)
    const top = new THREE.Mesh(GEO.cyl, sprites.gloss(0xffd23f)); top.scale.set(0.9, 0.18, 0.9); top.position.y = 0.3
    const halo = new THREE.Mesh(GEO.torus, sprites.gloss(0xff4a5e)); halo.scale.set(0.82, 0.82, 0.5); halo.rotation.x = 1.57; halo.position.y = 0.4
    g.add(top, halo); g.userData.pad = top
  }
  const fixed = b.mesh(sprites.lit)
  if (fixed) { fixed.castShadow = true; g.add(fixed) }
  return g
}

function makePit(it, seg, sprites) {
  const g = new THREE.Group(), tiles = []
  const r = generator(Math.floor(it.at * 13) + seg.id)
  for (let row = 0; row < 3; row++) for (let c = -1; c <= 1; c++) {
    const tile = new THREE.Mesh(GEO.box, sprites.tile)
    tile.scale.set(LANE_W + 0.44, 0.36, 1.13)
    tile.position.set(c * (LANE_W + 0.47), -0.18, (row - 1) * 1.14)
    tile.userData = { delay: r() * 7, vy: 0, spin: (r() - 0.5) * 4 }
    g.add(tile); tiles.push(tile)
  }
  g.userData.tiles = tiles
  return g
}

function makeItem(it, seg, world, look, sprites, owned) {
  if (it.kind === 'pit') return makePit(it, seg, sprites)
  if (it.kind === 'coin') {
    const g = new THREE.Group()
    const c = new THREE.Mesh(sprites.coinShape, sprites.coin); c.rotation.x = 1.57; c.position.y = 1 + (it.lift || 0)
    g.add(c); g.userData.spin = g
    return g
  }
  if (it.kind === 'magnet' || it.kind === 'shield' || it.kind === 'parrot') {
    const color = it.kind === 'magnet' ? 0xff3f58 : it.kind === 'shield' ? 0x2fd3ff : 0x35e07a
    const g = new THREE.Group()
    const orb = new THREE.Mesh(GEO.blob, sprites.gloss(color)); orb.scale.setScalar(0.66); orb.position.y = 1.5
    const halo = new THREE.Mesh(GEO.torus, sprites.gloss(0xffffff)); halo.scale.set(1, 1, 0.3); halo.position.y = 1.5
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: sprites.glow, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 }))
    glow.scale.setScalar(3.6); glow.position.y = 1.5
    owned.push(glow)
    g.add(orb, halo, glow); g.userData.spin = halo
    return g
  }
  if (it.kind === 'gate') {
    const g = new THREE.Group()
    const b = new Batch()
    b.put(GEO.box, look.accent, 0, 4.2, 0, PATH_W + 1, 0.4, 0.5)
    for (const side of [-1.5, -0.5, 0.5, 1.5]) b.put(GEO.box, 0xffffff, side * LANE_W, 2.1, 0, 0.16, 4.2, 0.16)
    g.add(b.mesh(sprites.lit))
    for (const lane of [-1, 0, 1]) {
      const m = new THREE.Mesh(GEO.plane, new THREE.MeshBasicMaterial({ map: labelTexture(String(it.answers[lane])), transparent: true, side: THREE.DoubleSide, fog: false }))
      m.position.set(lane * LANE_W, 3, 0.05); m.scale.set(2.2, 1.1, 1)
      m.userData.ownMap = true
      g.add(m); owned.push(m)
    }
    return g
  }
  return makeObstacle(it, world, look, sprites)
}

// Built in small steps between frames, far ahead of the runner, so a new stretch never stalls the game.
function* makeSegment(seg, sprites, assets) {
  const world = WORLDS[seg.world], look = LOOK[world], set = assets(world)
  const g = new THREE.Group()
  g.position.set(seg.ox, 0, seg.oz)
  g.rotation.y = -angleOf(seg.dir)
  const geometries = [], owned = [], half = PATH_W / 2
  const add = (geometry, material, shadow) => {
    const m = new THREE.Mesh(geometry, material); m.receiveShadow = !!shadow; g.add(m); geometries.push(geometry); return m
  }

  const start = seg.id === 0 ? -8 : half
  const holes = seg.items.filter(it => it.kind === 'pit').map(it => it.at).sort((p, q) => p - q)
  const bridgeZone = seg.zone?.kind === 'bridge' ? seg.zone : null
  const gaps = holes.map(at => [at - 1.72, at + 1.72])
  if (bridgeZone) gaps.push([bridgeZone.from, bridgeZone.to])
  const spans = []
  let from = start
  for (const [a, b] of gaps.sort((p, q) => p[0] - q[0])) { if (a > from) spans.push([from, a]); from = Math.max(from, b) }
  spans.push([from, seg.len + half])
  const edgeEnd = seg.len - half
  for (const [a, b] of spans) {
    add(strip(seg, a, b, [-half, 0], [half, 0], 1, ROAD_METRES), set.road, true)
    add(strip(seg, a, b, [-half, -0.4], [half, -0.4], 1, 4), set.under)
    const end = Math.min(b, edgeEnd)
    if (end <= a) continue
    for (const side of [-1, 1]) {
      const inner = side * half, outer = side * (half + 0.55)
      add(strip(seg, a, end, [inner, 0], [inner, 0.55], 1, 2), set.rail, true)
      add(strip(seg, a, end, [outer, 0.55], [inner, 0.55], 1, 2), set.rail, true)
      add(strip(seg, a, end, [outer, 0.55], [outer, -7], 1, 4), set.wall)
    }
    yield
  }

  const b = new Batch(), r = generator(seg.seed)
  // pillars carrying the causeway, reaching all the way down
  const clear = (d, margin) => !seg.zone || d < seg.zone.from - margin || d > seg.zone.to + margin
  for (let d = 16; d < seg.len - 6; d += 26) {
    if (bridgeZone && !clear(d, 3)) continue // nothing holds a bridge up: that is the point of it
    const y = groundAt(seg, d) - 6
    b.put(GEO.box, hex(look.wall[1]), 0, (y + FLOOR_Y) / 2, -d, half * 1.5, y - FLOOR_Y, 3.6)
    b.put(GEO.box, hex(look.wall[0]), 0, y - 1, -d, PATH_W + 1.6, 2, 4.6)
  }
  for (let d = 10, i = 0; d < seg.len - 8; d += 9, i++) {
    if (holes.some(at => Math.abs(at - d) < 3) || !clear(d, 1)) continue
    for (const side of [-1, 1]) railDecor(b, world, look, side * (half + 0.28), groundAt(seg, d) + 0.55, -d, i % 2)
    if (i % 5 === 0) yield
  }
  const lights = []
  for (let d = 34; d < seg.len - 30; d += 66 + r() * 34) {
    if (!clear(d, 4)) continue
    archway(b, world, look, groundAt(seg, d), -d)
    for (const side of [-1, 1]) lights.push({ at: [side * (half + 0.2), groundAt(seg, d) + 5.6, -d + 0.7], color: look.accent, size: 4, opacity: 0.55 })
  }
  let bridge = null
  if (seg.zone?.kind === 'tunnel') addCave(seg, seg.zone, world, look, b, add, set, sprites, r, lights)
  if (bridgeZone) {
    bridge = makeBridge(seg, bridgeZone, world, look, b, sprites, r, holes)
    g.add(bridge.mesh)
    archway(b, world, look, groundAt(seg, bridgeZone.from), -bridgeZone.from)
    archway(b, world, look, groundAt(seg, bridgeZone.to), -bridgeZone.to)
  }
  yield
  // giants on both sides, close to the road but never on it: not on this stretch, and not on the
  // stretches that meet it at either corner, where the camera swings out wide
  for (let d = 16; d < seg.len - 10; d += 13 + r() * 13) {
    for (const side of [-1, 1]) {
      if (r() < 0.2 || ((seg.fork || side === seg.turn) && d > seg.len - CORNER_CLEAR) || (side === seg.came && d < CORNER_CLEAR)) continue
      const off = half + GIANT_CLEAR + r() * r() * 38
      const height = groundAt(seg, d) + (r() < 0.5 ? -8 + r() * 10 : 6 + r() * 18)
      GIANT[world](b, r, side * off, height, -d - (r() - 0.5) * 7, g, set.towers)
    }
    yield
  }
  // the corner: a great wall ahead and a sign that points the way
  const yEnd = seg.h1, wallColor = hex(look.wall[0])
  b.put(GEO.box, wallColor, 0, yEnd - 15, -seg.len - half - 1, PATH_W + 3, 44, 2)
  b.put(GEO.box, look.accent, 0, yEnd + 7.2, -seg.len - half - 1, PATH_W + 3.6, 0.7, 2.4)
  for (const side of [-1, 1]) {
    b.put(GEO.box, hex(look.wall[1]), side * (half + 0.4), yEnd + 4, -seg.len - half + 0.1, 1.5, 8.2, 1)
    b.put(GEO.round, look.trim, side * (half + 0.4), yEnd + 8.6, -seg.len - half + 0.1, 0.8)
  }
  // only a low kerb on the far side: after the turn the camera swings out over it
  if (!seg.fork) b.put(GEO.box, look.rail, -seg.turn * (half + 0.28), yEnd + 0.27, -seg.len, 0.55, 0.55, PATH_W)
  const stubs = seg.fork ? { [-1]: forkStub(seg, -1, look, set, sprites, g, geometries), 1: forkStub(seg, 1, look, set, sprites, g, geometries) } : null
  const arrow = new THREE.Mesh(GEO.plane, new THREE.MeshBasicMaterial({ map: seg.fork ? sprites.fork(seg.fork.gold) : seg.turn < 0 ? sprites.left : sprites.right, transparent: true }))
  arrow.position.set(0, yEnd + 3.9, -seg.len - half + 0.05); arrow.scale.set(6.4, 3.2, 1); g.add(arrow)
  owned.push(arrow)
  if (!seg.fork) for (let i = 0; i < 3; i++) {
    const chev = new THREE.Mesh(GEO.plane, sprites.chevron(seg.turn))
    chev.rotation.x = -1.57
    const d = seg.len - 8 - i * 3.4
    chev.position.set(0, groundAt(seg, d) + 0.05, -d); chev.scale.set(5, 2.6, 1); g.add(chev)
  }

  yield
  const statics = b.mesh(sprites.lit)
  if (statics) { g.add(statics); geometries.push(statics.geometry) }
  yield
  for (const { at: [x, y, z], color, size, opacity } of lights) {
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: sprites.glow, color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity }))
    glow.position.set(x, y, z); glow.scale.setScalar(size); g.add(glow); owned.push(glow)
  }
  const shared = new Set([...Object.values(GEO), sprites.coinShape])
  const items = new Map()
  for (const it of seg.items) {
    const m = makeItem(it, seg, world, look, sprites, owned)
    m.position.set(['wall', 'low', 'coin', 'magnet', 'shield', 'parrot', 'pad'].includes(it.kind) ? (it.lane ?? 0) * LANE_W : 0, groundAt(seg, it.at), -it.at)
    g.add(m)
    m.traverse(o => { if (o.geometry && !shared.has(o.geometry)) geometries.push(o.geometry) })
    items.set(it.id, { it, m })
    if (items.size % 8 === 0) yield
  }
  return { g, items, owned, geometries, bridge, stubs }
}

// ---- Buga: the yellow furry mascot, with his parrot ----
function makeBuga() {
  const root = new THREE.Group(), body = new THREE.Group()
  root.add(body)
  const material = (color, roughness = 0.7) => new THREE.MeshStandardMaterial({ color, roughness })
  const fur = material(0xffb31a, 0.85), shirt = material(0xfdfdfd), bag = material(0x2a66d9, 0.5), white = material(0xffffff, 0.25), black = material(0x14141f, 0.2), feet = material(0xff5a36, 0.5)
  const sleeve = new THREE.MeshStandardMaterial({ map: paintSleeve(), roughness: 0.75 })
  const shape = (geo, mat, x, y, z, sx = 1, sy = sx, sz = sx, parent = body) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.castShadow = true; parent.add(m); return m }
  shape(GEO.fine, fur, 0, 0.84, 0, 0.62, 0.42, 0.54)
  shape(GEO.fine, shirt, 0, 1.14, 0, 0.66, 0.68, 0.58)
  const head = new THREE.Group(); head.position.set(0, 1.95, 0); body.add(head)
  shape(GEO.fine, fur, 0, 0, 0, 0.82, 0.76, 0.76, head)

  // real fur: thin shells round the head, each showing fewer hairs than the one under it
  const shells = [], furMap = paintFur(), tip = new THREE.Color(0xffd455), root_ = new THREE.Color(0xe58f0c)
  for (let i = 1; i <= FUR_LAYERS; i++) {
    const k = i / FUR_LAYERS
    const layer = new THREE.MeshLambertMaterial({ color: root_.clone().lerp(tip, k), alphaMap: furMap, alphaTest: 0.2 + k * 0.72 })
    const shell = new THREE.Mesh(GEO.fine, layer)
    shell.scale.set(0.82 + k * 0.1, 0.76 + k * 0.1, 0.76 + k * 0.1)
    head.add(shell); shells.push(shell)
  }

  // the great crest of hair: long curling locks, blue and teal at the sides, red and orange over the top
  const hair = new Batch(), lock = plumeGeometry()
  const palette = [0x1e9be8, 0x25c1d6, 0x3f7df0, 0xff5a2e, 0xff8a1f, 0xffc42e, 0xff3f58, 0x1e9be8]
  let lockNo = 0
  for (const [lean, z, count, long] of [[0.5, 0.42, 9, 1.3], [0.2, 0.08, 11, 1.5], [-0.15, -0.26, 7, 1.05]]) {
    for (let i = 0; i < count; i++) {
      const a = (i / (count - 1) - 0.5) * 3.5, side = Math.abs(a)
      const color = side < 0.8 ? palette[3 + lockNo % 4] : palette[lockNo % 3]
      const size = long * (1 - side * 0.14)
      hair.put(lock, color, Math.sin(a) * 0.62, Math.cos(a) * 0.5 + 0.1, z, 0.4, size, 0.4, lean, a < 0 ? Math.PI : 0, -side * 0.78)
      hair.shadeUp(0.72, 1.18)
      lockNo++
    }
  }
  const crest = hair.mesh(new THREE.MeshLambertMaterial({ vertexColors: true }))
  crest.castShadow = true
  head.add(crest)
  lock.dispose()

  // the face, for the moment he looks back at the cookie
  for (const side of [-1, 1]) {
    shape(GEO.fine, white, side * 0.31, 0.2, -0.7, 0.3, 0.33, 0.22, head)
    shape(GEO.fine, material(0x8a4a1c, 0.3), side * 0.28, 0.17, -0.89, 0.16, 0.17, 0.06, head)
    shape(GEO.fine, black, side * 0.27, 0.16, -0.93, 0.09, 0.1, 0.04, head)
    shape(GEO.box, material(0x5a2f12, 0.6), side * 0.32, 0.6, -0.76, 0.34, 0.08, 0.1, head).rotation.z = side * 0.3
  }
  shape(GEO.fine, material(0xa81c3c, 0.4), 0, -0.3, -0.76, 0.46, 0.29, 0.14, head)
  shape(GEO.box, white, 0, -0.14, -0.88, 0.58, 0.11, 0.04, head)
  shape(GEO.fine, material(0xff7fa0, 0.5), 0, -0.42, -0.86, 0.2, 0.11, 0.06, head)

  shape(new THREE.CapsuleGeometry(0.4, 0.36, 8, 18), bag, 0, 1.24, 0.56, 1, 1, 0.46)
  shape(new THREE.CapsuleGeometry(0.24, 0.1, 6, 14), material(0x25bfe0, 0.45), 0, 1.06, 0.74, 1, 1, 0.26)
  for (const side of [-1, 1]) shape(GEO.box, bag, side * 0.36, 1.44, 0.2, 0.12, 0.08, 0.66)

  const parrot = new THREE.Group(); parrot.position.set(0.56, 1.72, 0.3); body.add(parrot)
  const blue = material(0x2a63e0, 0.5)
  shape(GEO.fine, blue, 0, 0, 0, 0.26, 0.32, 0.26, parrot)
  shape(GEO.fine, material(0xffe27a, 0.5), 0, -0.04, -0.14, 0.17, 0.22, 0.14, parrot)
  shape(GEO.fine, blue, 0, 0.36, -0.02, 0.24, 0.23, 0.24, parrot)
  for (const side of [-1, 1]) {
    shape(GEO.fine, white, side * 0.1, 0.42, -0.2, 0.08, 0.09, 0.05, parrot)
    shape(GEO.fine, black, side * 0.1, 0.42, -0.24, 0.04, 0.05, 0.02, parrot)
  }
  shape(GEO.cone, material(0xffb51f, 0.4), 0, 0.32, -0.3, 0.09, 0.22, 0.09, parrot).rotation.x = -1.57
  const wing = shape(GEO.fine, material(0x1d4cb5, 0.5), 0.26, 0.06, 0.05, 0.08, 0.26, 0.18, parrot)
  shape(GEO.cone, material(0x7a4a22, 0.5), 0, 0.64, 0.03, 0.09, 0.28, 0.09, parrot)

  const limb = (x, y, upper, lower, width, mat, end) => {
    const top = new THREE.Group(); top.position.set(x, y, 0); body.add(top)
    shape(new THREE.CapsuleGeometry(width, upper, 6, 12), mat, 0, -upper / 2, 0, 1, 1, 1, top)
    const joint = new THREE.Group(); joint.position.y = -upper; top.add(joint)
    shape(new THREE.CapsuleGeometry(width * 0.9, lower, 6, 12), mat, 0, -lower / 2, 0, 1, 1, 1, joint)
    end(joint, lower)
    return { top, joint }
  }
  const shoe = (joint, lower) => shape(GEO.fine, feet, 0, -lower - 0.04, -0.1, 0.2, 0.14, 0.3, joint)
  const hand = (joint, lower) => shape(GEO.fine, fur, 0, -lower - 0.06, 0, 0.17, 0.17, 0.17, joint)
  const legL = limb(-0.28, 0.58, 0.28, 0.2, 0.15, fur, shoe), legR = limb(0.28, 0.58, 0.28, 0.2, 0.15, fur, shoe)
  const armL = limb(-0.7, 1.46, 0.3, 0.26, 0.13, sleeve, hand), armR = limb(0.7, 1.46, 0.3, 0.26, 0.13, sleeve, hand)
  return { root, body, shells, parts: { legL, legR, armL, armR, wing, parrot, head } }
}

const paintFur = () => {
  const t = canvasTexture(256, 256, (x, w, h) => {
    const r = generator(5)
    x.fillStyle = '#000'; x.fillRect(0, 0, w, h)
    for (let i = 0; i < 2600; i++) {
      const v = Math.floor(70 + r() * 185)
      x.fillStyle = `rgb(${v},${v},${v})`
      x.beginPath(); x.ellipse(r() * w, r() * h, 2.4, 4.4, (r() - 0.5) * 0.9, 0, 7); x.fill()
    }
  })
  t.colorSpace = THREE.NoColorSpace
  t.repeat.set(7, 4)
  return t
}

const paintSleeve = () => canvasTexture(16, 128, (x, w, h) => {
  ;['#ff5a3c', '#ffb31a', '#ffe14d', '#36c978', '#1e9be8', '#8e6cf0'].forEach((color, i) => { x.fillStyle = color; x.fillRect(0, i * h / 6, w, h / 6) })
})

// One lock of hair: wide near the root, pointed at the tip, curling outwards.
function plumeGeometry() {
  const ball = new THREE.SphereGeometry(1, 10, 12), p = ball.attributes.position
  for (let i = 0; i < p.count; i++) {
    const t = (p.getY(i) + 1) / 2, wide = Math.min(1, t * 4) * (1 - t) ** 0.75
    p.setXYZ(i, p.getX(i) * wide + t * t * 0.9, t, p.getZ(i) * wide * 0.7)
  }
  ball.computeVertexNormals()
  return ball
}

function makeCookie() {
  const root = new THREE.Group(), g = new THREE.Group(); root.add(g)
  const dough = new THREE.MeshStandardMaterial({ color: 0xc98a4b, roughness: 0.85 })
  const disc = new THREE.Mesh(GEO.fine, dough); disc.scale.set(2.1, 2.1, 1.1); disc.castShadow = true; g.add(disc)
  const chip = new THREE.MeshStandardMaterial({ color: 0x46291a, roughness: 0.4 })
  for (let i = 0; i < 40; i++) {
    const a = i * 2.4, b = Math.acos(1 - 2 * (i + 0.5) / 40)
    const c = new THREE.Mesh(GEO.round, chip)
    c.position.set(Math.cos(a) * Math.sin(b) * 2.1, Math.cos(b) * 2.1, Math.sin(a) * Math.sin(b) * 1.1)
    c.scale.setScalar(0.24 + (i % 3) * 0.05); g.add(c)
  }
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }), dark = new THREE.MeshStandardMaterial({ color: 0x14162d, roughness: 0.2 })
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(GEO.fine, white); eye.position.set(side * 0.72, 0.62, -1.02); eye.scale.setScalar(0.44); g.add(eye)
    const pupil = new THREE.Mesh(GEO.round, dark); pupil.position.set(side * 0.68, 0.56, -1.42); pupil.scale.setScalar(0.19); g.add(pupil)
    const brow = new THREE.Mesh(GEO.box, dark); brow.position.set(side * 0.72, 1.2, -1.1); brow.scale.set(0.8, 0.14, 0.14); brow.rotation.z = side * -0.4; g.add(brow)
  }
  const mouth = new THREE.Mesh(GEO.fine, new THREE.MeshStandardMaterial({ color: 0x6a1228, roughness: 0.5 })); mouth.position.set(0, -0.55, -0.92); mouth.scale.set(1.1, 0.6, 0.3); g.add(mouth)
  for (let i = -2; i <= 2; i++) { const tooth = new THREE.Mesh(GEO.box, white); tooth.position.set(i * 0.34, -0.2, -1.18); tooth.scale.set(0.26, 0.26, 0.1); g.add(tooth) }
  return { root, body: g }
}

// Thin streaks of air past the camera, stronger with speed; kept clear of the middle of the picture.
class Wind {
  constructor(camera) {
    this.count = 36
    this.at = Array.from({ length: this.count }, (_, i) => ({ a: i * 2.4, r: 3.5 + (i % 5) * 1.1, z: -30 * (i / this.count) }))
    this.pos = new Float32Array(this.count * 6)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3))
    this.mesh = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false }))
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 5
    camera.add(this.mesh)
  }
  update(dt, power) {
    this.mesh.visible = power > 0.02
    if (!this.mesh.visible) return
    this.mesh.material.opacity = power * 0.3
    const long = 1.5 + power * 3.5
    this.at.forEach((w, i) => {
      w.z += (32 + power * 40) * dt
      if (w.z > -1) w.z = -30
      const x = Math.cos(w.a) * w.r * 1.3, y = Math.sin(w.a) * w.r * 0.9
      this.pos.set([x, y, w.z, x, y, w.z - long], i * 6)
    })
    this.mesh.geometry.attributes.position.needsUpdate = true
  }
}

// Specks hanging in the air all round the camera: leaves, sand, sugar, stars. They give the empty air depth.
const MOTES = { jungle: { color: 0xc4f07a, drift: [0.8, -1.4, 0.3] }, desert: { color: 0xffe9b8, drift: [3.6, 0.2, 0.6] }, candy: { color: 0xffffff, drift: [0.2, 0.9, 0.2] }, night: { color: 0x7ff0ff, drift: [0.3, 0.5, 0.1] } }
class Motes {
  constructor(scene, map) {
    this.count = 90
    this.reach = 24
    this.at = Float32Array.from({ length: this.count * 3 }, () => Math.random() * this.reach * 2)
    this.pos = new Float32Array(this.count * 3)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3))
    this.mesh = new THREE.Points(g, new THREE.PointsMaterial({ map, size: 0.3, transparent: true, depthWrite: false, opacity: 0.85 }))
    this.mesh.frustumCulled = false
    scene.add(this.mesh)
    this.drift = MOTES.jungle.drift
  }
  setWorld(name) {
    this.drift = MOTES[name].drift
    this.mesh.material.color.set(MOTES[name].color)
  }
  update(dt, centre) {
    const size = this.reach * 2, axes = [centre.x, centre.y, centre.z]
    for (let i = 0; i < this.count * 3; i++) {
      const axis = i % 3
      this.at[i] += this.drift[axis] * dt
      const off = ((this.at[i] - axes[axis]) % size + size) % size
      this.pos[i] = axes[axis] + off - this.reach
    }
    this.mesh.geometry.attributes.position.needsUpdate = true
  }
}

class Sparks {
  constructor(scene, map) {
    this.max = 160
    this.pos = new Float32Array(this.max * 3).fill(-999)
    this.col = new Float32Array(this.max * 3)
    this.life = new Float32Array(this.max)
    this.vel = new Float32Array(this.max * 3)
    this.next = 0
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3))
    g.setAttribute('color', new THREE.BufferAttribute(this.col, 3))
    this.mesh = new THREE.Points(g, new THREE.PointsMaterial({ map, size: 0.36, vertexColors: true, transparent: true, depthWrite: false }))
    this.mesh.frustumCulled = false
    scene.add(this.mesh)
    this.color = new THREE.Color()
  }
  burst(x, y, z, color, n, power = 5) {
    this.color.set(color)
    for (let k = 0; k < n; k++) {
      const i = this.next
      this.next = (i + 1) % this.max
      this.pos.set([x, y, z], i * 3)
      this.vel.set([(Math.random() - 0.5) * power, Math.random() * power, (Math.random() - 0.5) * power], i * 3)
      this.col.set([this.color.r, this.color.g, this.color.b], i * 3)
      this.life[i] = 0.5 + Math.random() * 0.4
    }
  }
  update(dt) {
    for (let i = 0; i < this.max; i++) {
      if (this.life[i] <= 0) { this.pos[i * 3 + 1] = -999; continue }
      this.life[i] -= dt
      this.vel[i * 3 + 1] -= 13 * dt
      for (let a = 0; a < 3; a++) this.pos[i * 3 + a] += this.vel[i * 3 + a] * dt
    }
    this.mesh.geometry.attributes.position.needsUpdate = true
    this.mesh.geometry.attributes.color.needsUpdate = true
  }
}

export function createScene(canvas, { onLost } = {}) {
  const dpr = window.devicePixelRatio || 1
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: dpr < 2, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(dpr, QUALITY[0].ratio))
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); onLost?.() })
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.02
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(LOOK.jungle.fog, 70, 300)
  const camera = new THREE.PerspectiveCamera(62, 1, 0.3, 700)
  const hemi = new THREE.HemisphereLight(0xffffff, 0x8a7a5a, 2)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight(0xfff2d0, 2.4)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  sun.shadow.bias = -0.0006
  sun.shadow.normalBias = 0.04
  Object.assign(sun.shadow.camera, { left: -28, right: 28, top: 34, bottom: -18, near: 1, far: 120 })
  scene.add(sun, sun.target)

  const glow = glowTexture()
  const lit = new THREE.MeshLambertMaterial({ vertexColors: true })
  const gloss = new Map()
  const chevrons = new Map(), forkSigns = new Map()
  const chevronTexture = canvasTexture(256, 128, (x, w, h) => {
    x.strokeStyle = '#ffd23f'; x.lineWidth = 26; x.lineJoin = 'round'; x.lineCap = 'round'
    for (const left of [40, 120]) { x.beginPath(); x.moveTo(left + 56, 20); x.lineTo(left, h / 2); x.lineTo(left + 56, h - 20); x.stroke() }
  }, false)
  const sprites = {
    lit, glow,
    left: labelTexture('←', { bg: '#ffcf33', size: 220 }),
    right: labelTexture('→', { bg: '#ffcf33', size: 220 }),
    fork(gold) {
      if (!forkSigns.has(gold)) forkSigns.set(gold, canvasTexture(512, 256, x => {
        x.fillStyle = '#ffcf33'
        x.beginPath(); x.roundRect(8, 8, 496, 240, 44); x.fill()
        x.lineWidth = 14; x.strokeStyle = '#14162d'; x.stroke()
        x.beginPath(); x.moveTo(256, 30); x.lineTo(256, 226); x.lineWidth = 8; x.stroke()
        x.fillStyle = '#14162d'; x.textAlign = 'center'; x.textBaseline = 'middle'
        for (const side of [-1, 1]) {
          const mid = 256 + side * 124
          x.font = '900 92px Heebo, Arial, sans-serif'
          x.fillText(side < 0 ? '←' : '→', mid, 76)
          x.font = '900 76px Heebo, Arial, sans-serif'
          x.fillText(side === gold ? 'זהב' : 'רגוע', mid, 172)
        }
      }, false))
      return forkSigns.get(gold)
    },
    tile: new THREE.MeshLambertMaterial({ color: 0xffffff }),
    plank: new THREE.MeshLambertMaterial({ color: 0xffffff }),
    shade: new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.34, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }),
    coin: new THREE.MeshStandardMaterial({ vertexColors: true, emissive: 0x7a4c00, metalness: 0.3, roughness: 0.32 }),
    coinShape: (() => { const b = new Batch(); b.put(GEO.coin, 0xffbf1f, 0, 0, 0, 1); b.put(GEO.coin, 0xffe27a, 0, 0, 0, 0.66, 1.25, 0.66); return b.mesh(lit).geometry })(),
    gloss(color) { if (!gloss.has(color)) gloss.set(color, new THREE.MeshStandardMaterial({ color, roughness: 0.35 })); return gloss.get(color) },
    chevron(turn) {
      if (!chevrons.has(turn)) {
        const map = chevronTexture.clone()
        if (turn > 0) { map.center.set(0.5, 0.5); map.rotation = Math.PI }
        map.needsUpdate = true
        chevrons.set(turn, new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }))
      }
      return chevrons.get(turn)
    },
  }

  // paint each world's textures the first time it is needed
  const worlds = new Map()
  const assets = name => {
    if (worlds.has(name)) return worlds.get(name)
    const look = LOOK[name]
    const set = {
      road: new THREE.MeshLambertMaterial({ map: roadTexture(look) }),
      wall: new THREE.MeshLambertMaterial({ map: wallTexture(look), side: THREE.DoubleSide }),
      cave: new THREE.MeshLambertMaterial({ map: wallTexture(look), color: 0x77707a, side: THREE.BackSide }),
      hill: new THREE.MeshLambertMaterial({ map: wallTexture(look) }),
      under: new THREE.MeshLambertMaterial({ color: new THREE.Color(look.wall[2]), side: THREE.BackSide }),
      rail: new THREE.MeshLambertMaterial({ color: look.rail, side: THREE.DoubleSide }),
      towers: name === 'night' ? [towerTexture('#17154a', 1), towerTexture('#231a5e', 2), towerTexture('#2b1450', 3)].map(map => new THREE.MeshLambertMaterial({ map, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 0.9 })) : [],
      sky: skyTexture(name, look),
      floor: floorTexture(name, look),
    }
    set.floor.repeat.set(26, 26)
    worlds.set(name, set)
    return set
  }

  const skyGeo = new THREE.SphereGeometry(520, 40, 24)
  const skyA = new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, depthWrite: false, toneMapped: false })
  const skyB = new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, depthWrite: false, transparent: true, opacity: 0, toneMapped: false })
  const skyMeshA = new THREE.Mesh(skyGeo, skyA), skyMeshB = new THREE.Mesh(skyGeo, skyB)
  skyMeshA.renderOrder = -2; skyMeshB.renderOrder = -1
  scene.add(skyMeshA, skyMeshB)
  const floor = new THREE.Mesh(GEO.plane, new THREE.MeshLambertMaterial({ color: 0xffffff }))
  floor.rotation.x = -1.57; floor.position.y = FLOOR_Y; floor.scale.set(1300, 1300, 1); scene.add(floor)

  // life in the air around the road: birds, balloons, flying cars
  const movers = new THREE.Group(); scene.add(movers)
  const flyers = []
  const flyerRand = generator(7)
  for (let i = 0; i < 10; i++) {
    const g = new THREE.Group(), balloon = new Batch(), bird = new Batch(), car = new Batch()
    const tint = [0xff5d9e, 0x31c8e8, 0xffd23f, 0x8e6cf0, 0xff8a3d][i % 5]
    balloon.put(GEO.fine, tint, 0, 0, 0, 2.2, 2.6, 2.2)
    balloon.put(GEO.fine, 0xffffff, 0, 0, 0, 2.24, 0.3, 2.24)
    balloon.put(GEO.box, 0x8a5a33, 0, -4, 0, 0.9, 0.7, 0.9)
    bird.put(GEO.fine, tint, 0, 0, 0, 0.4, 0.3, 0.8)
    bird.put(GEO.cone, 0xffb51f, 0, 0, -0.9, 0.12, 0.3, 0.12, -1.57)
    car.put(GEO.fine, 0x34324f, 0, 0, 0, 1.3, 0.5, 2.4)
    car.put(GEO.box, tint, 0, -0.1, 0, 2.5, 0.16, 4.2)
    const mb = balloon.mesh(lit), mc = car.mesh(lit), mf = bird.mesh(lit)
    const wings = [-1, 1].map(side => { const w = new THREE.Mesh(GEO.fine, sprites.gloss(tint)); w.position.x = side * 0.6; w.scale.set(0.7, 0.06, 0.3); g.add(w); return w })
    g.add(mb, mc, mf)
    movers.add(g)
    flyers.push({ g, balloon: mb, car: mc, bird: mf, wings, x: flyerRand() * 240, z: flyerRand() * 240, y: 6 + flyerRand() * 22, a: flyerRand() * 6.28 })
  }

  const sparks = new Sparks(scene, glow)
  const motes = new Motes(scene, glow)
  scene.add(camera)
  const wind = new Wind(camera)
  const contact = new THREE.Mesh(GEO.plane, new THREE.MeshBasicMaterial({ map: glow, color: 0x000000, transparent: true, depthWrite: false, opacity: 0.42, fog: false, polygonOffset: true, polygonOffsetFactor: -2 }))
  contact.rotation.x = -Math.PI / 2
  scene.add(contact)
  const rim = new THREE.DirectionalLight(0xffffff, 1.1) // from ahead, so Buga's outline stands off the road
  scene.add(rim, rim.target)
  const buga = makeBuga(); buga.root.scale.setScalar(0.74); scene.add(buga.root) // small enough to see the road past him
  const bubble = new THREE.Mesh(GEO.fine, new THREE.MeshStandardMaterial({ color: 0x4fd8ff, transparent: true, opacity: 0.16, roughness: 0.1 }))
  bubble.scale.setScalar(1.55); bubble.visible = false; scene.add(bubble)
  const cookie = makeCookie(); cookie.root.visible = false; cookie.root.scale.setScalar(0.42); scene.add(cookie.root)

  const built = new Map()
  const fog = new THREE.Color(LOOK.jungle.fog), target = new THREE.Color(), darkAir = new THREE.Color()
  const pending = new Map()
  let heading = 0, chase = 12, clock = 0, pose = 1, camX = 0, camY = 5, camZ = 8, currentWorld = null, skyFade = 1, shake = 0, orbit = 0, turnLean = 0
  let quality = 0, sampleFrom = 0, sampleFrames = 0, lastFrame = 0
  let squash = 0, dip = 0, punch = 0, laneRoll = 0, lift = 0, ready = 0, cookieSide = 0
  let cave = 0, dazzle = 0, inCave = false, dust = 0, tilt = 0, hillLook = 0

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight
    if (!w || !h) return // hidden for now: keep the picture, the observer calls again when it returns
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  const watcher = new ResizeObserver(resize)
  watcher.observe(canvas)

  const release = b => {
    scene.remove(b.g)
    b.geometries.forEach(g => g.dispose())
    b.owned.forEach(m => { if (m.userData.ownMap) m.material.map.dispose(); m.material.dispose() })
    b.bridge?.mesh.dispose()
  }

  // Planks let go a few steps behind Buga, one after another, so the bridge falls away at his heels.
  function collapseBridge(bridge, d, dt) {
    const { mesh, pieces, place } = bridge
    let moved = false
    for (const p of pieces) {
      if (p.gone || p.d > d - 0.8 - p.delay) continue
      p.vy -= 24 * dt
      p.y += p.vy * dt
      p.down += p.spin * dt
      place.position.set(p.x, p.y, -p.d)
      place.rotation.set(p.down, p.yaw, p.down * 0.6)
      place.scale.set(p.wide, 0.22, 0.84)
      place.updateMatrix()
      mesh.setMatrixAt(pieces.indexOf(p), place.matrix)
      moved = true
      if (p.y < FLOOR_Y) { p.gone = true; place.scale.setScalar(0); place.updateMatrix(); mesh.setMatrixAt(pieces.indexOf(p), place.matrix) }
    }
    if (moved) mesh.instanceMatrix.needsUpdate = true
  }

  function buildSegment(seg, until) {
    if (!pending.has(seg.id)) pending.set(seg.id, makeSegment(seg, sprites, assets))
    const job = pending.get(seg.id)
    do {
      const { done, value } = job.next()
      if (done) { pending.delete(seg.id); built.set(seg.id, value); scene.add(value.g); return }
    } while (performance.now() < until)
  }

  function updateItem(it, m, seg, dist, s, dt) {
    const u = m.userData
    if (u.spin === m) m.rotation.y = clock * 4 + it.at
    else if (u.spin) { u.spin.rotation.z = clock * 3; u.spin.rotation.x = clock * 2 }
    if (dist < -0.8 && ['wall', 'low', 'high', 'gate', 'pad'].includes(it.kind)) { m.visible = false; return } // never between the camera and Buga
    if (it.kind === 'coin') m.visible = dist > -5 && dist < 120 // the road is full of them: only draw the ones in reach
    if (dist > 110) return
    if (it.show === 'roll') { // a boulder rolling down the lane, reaching its spot as the runner does
      const away = Math.max(0, dist) * 0.6
      m.position.z = -(it.at + away)
      m.position.y = groundAt(seg, it.at + away)
      u.ball.rotation.x = away * 0.8
    } else if (it.show === 'swing' && u.arm) {
      const late = Math.max(0, dist) / s.speed * 3
      const reach = it.lane === 0 ? 1.5 * LANE_W * Math.sin(late) : it.lane * LANE_W * Math.cos(late)
      u.arm.rotation.z = Math.asin(reach / 6)
      m.position.x = 0
    } else if (it.show === 'rise') {
      const k = eased((45 - dist) / 14)
      m.position.y = groundAt(seg, it.at) - 1.2 * (1 - k)
      m.visible = k > 0.02
    } else if (it.show === 'drop' && u.bar) {
      u.bar.position.y = 5.2 * (1 - eased((50 - dist) / 18))
    } else if (u.pad) {
      u.pad.position.y = 0.3 + Math.abs(Math.sin(clock * 5)) * 0.14
    }
    if (u.tiles) for (const tile of u.tiles) {
      const d = tile.userData
      if (dist > 26 - d.delay) continue
      d.vy -= 26 * dt
      tile.position.y += d.vy * dt
      tile.rotation.x += d.spin * dt; tile.rotation.z += d.spin * 0.7 * dt
      if (tile.position.y < -60) tile.visible = false
    }
  }

  function syncSegments(s, dt) {
    const alive = new Set(s.segs.map(seg => seg.id))
    for (const [id, b] of built) if (!alive.has(id)) { release(b); built.delete(id) }
    const until = performance.now() + 3
    let ahead = -s.d
    for (let i = s.cur; i < s.segs.length; i++) {
      const seg = s.segs[i]
      // a stretch still unfinished when the runner is about to see it is finished at once
      if (!built.has(seg.id)) buildSegment(seg, ahead < 14 ? Infinity : until)
      if (!built.has(seg.id)) { ahead += seg.len; continue }
      // the road chosen at a fork takes the place of its stretch of stub
      const after = s.segs[i + 1], stubs = built.get(seg.id).stubs
      if (stubs && seg.chosen && after && built.has(after.id)) stubs[seg.turn].visible = false
      if (i === s.cur && built.get(seg.id).bridge) collapseBridge(built.get(seg.id).bridge, s.d, dt)
      for (const { it, m } of built.get(seg.id).items.values()) {
        if (it.taken) m.visible = false
        else updateItem(it, m, seg, ahead + it.at, s, dt)
      }
      ahead += seg.len
    }
  }

  function poseBuga(s, dt) {
    const { body, parts } = buga
    const stride = s.run * 0.92
    const swing = Math.sin(stride)
    const air = s.y > 0.05
    pose += ((s.slide > 0 ? 0 : 1) - pose) * Math.min(1, dt * 16)
    const legs = (leg, phase) => {
      leg.top.rotation.x = air ? (phase > 0 ? -1.1 : 0.5) : phase
      leg.joint.rotation.x = air ? 0.9 : Math.max(0, -phase) * 1.4 + 0.2
    }
    legs(parts.legL, swing); legs(parts.legR, -swing)
    const arms = (arm, phase, side) => {
      arm.top.rotation.x = air ? -2.5 : -phase
      arm.top.rotation.z = air ? side * 0.5 : 0
      arm.joint.rotation.x = air ? 0 : -1.2
    }
    arms(parts.armL, swing, -1); arms(parts.armR, -swing, 1)
    parts.wing.rotation.z = Math.sin(clock * 22) * 0.7
    // in flight the parrot grows and pulls him up by the arms
    lift += ((s.fly > 0 ? 1 : 0) - lift) * Math.min(1, dt * 7)
    parts.parrot.position.y = 1.86 + Math.abs(Math.sin(stride)) * 0.08 + lift * 1.7
    parts.parrot.position.x = 0.46 * (1 - lift)
    parts.parrot.scale.setScalar(1 + lift * 1.8)
    parts.head.rotation.x = Math.sin(stride * 2) * 0.05
    body.position.y = (air ? 0 : Math.abs(Math.cos(stride)) * 0.14) + (1 - pose) * -0.5
    body.rotation.x = (1 - pose) * 1.25 + (air ? -0.08 : -0.14)
    // a swipe towards a corner shows at once: he turns his body and the view starts round, before he gets there
    ready += ((s.fly > 0 ? 0 : s.wantTurn) - ready) * Math.min(1, dt * 10)
    body.rotation.y = (s.lane * LANE_W - s.laneX) * 0.16 - ready * 0.9
    body.rotation.z = (s.lane * LANE_W - s.laneX) * -0.12
    squash *= Math.exp(-dt * 9)
    body.scale.set(1 - squash * 0.14, 1 + squash * 0.2, 1 - squash * 0.14)
    buga.root.visible = !(s.safe > 0 && Math.floor(clock * 14) % 2 === 0)
  }

  function setWorld(name) {
    if (name === currentWorld) return
    const set = assets(name), look = LOOK[name]
    if (currentWorld) { skyB.map = set.sky; skyB.needsUpdate = true; skyB.opacity = 0; skyFade = 0 } else { skyA.map = set.sky; skyA.needsUpdate = true }
    floor.material.map = set.floor; floor.material.needsUpdate = true
    hemi.color.set(look.hemi[0]); hemi.groundColor.set(look.hemi[1])
    sun.color.set(look.sunLight[0])
    currentWorld = name
    motes.setWorld(name)
    flyers.forEach(f => {
      f.balloon.visible = name === 'desert' || name === 'candy'
      f.car.visible = name === 'night'
      f.bird.visible = name === 'jungle'
      f.wings.forEach(w => { w.visible = name === 'jungle' })
    })
  }

  function flyersUpdate(p, dt) {
    const wrap = v => ((v + 120) % 240 + 240) % 240 - 120
    const fast = currentWorld === 'night' ? 24 : currentWorld === 'jungle' ? 12 : 1.5
    for (const f of flyers) {
      f.x += Math.sin(f.a) * fast * dt; f.z += Math.cos(f.a) * fast * dt
      f.g.position.set(p.x + wrap(f.x - p.x), p.y + f.y + Math.sin(clock + f.a) * 1.2, p.z + wrap(f.z - p.z))
      f.g.rotation.y = f.a + Math.PI
      f.wings.forEach((w, i) => { w.rotation.z = Math.sin(clock * 14 + f.a) * (i ? 0.7 : -0.7) })
    }
  }

  function render(s, dt) {
    clock += dt
    const seg = segment(s), world = WORLDS[seg.world]
    setWorld(world)
    syncSegments(s, dt)
    const p = worldPosition(s), road = p.y - s.y
    const want = angleOf(p.dir)
    let delta = want - heading
    delta = Math.atan2(Math.sin(delta), Math.cos(delta))
    heading += delta * Math.min(1, dt * 9)
    turnLean += ((delta + ready * 0.3) * 0.3 - turnLean) * Math.min(1, dt * 8)

    for (const e of s.events) {
      if (e === 'coin') sparks.burst(p.x, p.y + 1.2, p.z, 0xffd23f, 8, 4.5)
      else if (e === 'hit' || e === 'over' || e === 'shield') { shake = 0.7; sparks.burst(p.x, p.y + 1.2, p.z, 0xff6a3d, 26, 8) }
      else if (e === 'pad') { squash = 1.4; sparks.burst(p.x, p.y + 0.4, p.z, 0xffffff, 18, 7) }
      else if (e === 'jump') squash = 1
      else if (e === 'power' || e === 'right') sparks.burst(p.x, p.y + 1.4, p.z, 0x7dfcff, 18, 6)
      else if (e === 'land') { squash = -1; dip = 0.22; sparks.burst(p.x, p.y + 0.2, p.z, 0xfff4d0, 10, 3.5) }
      else if (e === 'close') { shake = Math.max(shake, 0.14); sparks.burst(p.x, p.y + 1, p.z, 0xffffff, 14, 7) }
      else if (e === 'combo') sparks.burst(p.x, p.y + 1.6, p.z, 0xff5d8f, 22, 7)
      else if (e === 'mission' || e === 'escape') sparks.burst(p.x, p.y + 1.8, p.z, 0xffd23f, 36, 9)
    }
    // dust kicked up at every few strides, and a spray of it in a slide
    dust -= dt
    if (dust <= 0 && dt > 0 && s.y < 0.05) {
      dust = s.slide > 0 ? 0.04 : 0.1
      sparks.burst(p.x, road + 0.15, p.z, LOOK[world].stone[0], s.slide > 0 ? 3 : 2, s.slide > 0 ? 3 : 1.6)
    }
    sparks.update(dt)
    motes.update(dt, camera.position)

    buga.root.position.set(p.x, p.y, p.z)
    buga.root.rotation.y = -heading
    poseBuga(s, dt)
    // he leans into every climb and back on every descent, and the view looks where the road is going
    const slope = Math.atan((groundAt(seg, s.d + 2.5) - groundAt(seg, s.d - 2.5)) / 5)
    tilt += (slope - tilt) * Math.min(1, dt * 8)
    buga.body.rotation.x += tilt * 0.8
    hillLook += ((groundAt(seg, s.d + 13) - road) * 0.75 - hillLook) * Math.min(1, dt * 5)
    bubble.visible = s.shield
    bubble.position.set(p.x, p.y + 1, p.z)

    contact.position.set(p.x, road + 0.07, p.z)
    contact.scale.setScalar(Math.max(1.1, 2.1 - s.y * 0.22))
    contact.material.opacity = Math.max(0.12, 0.42 - s.y * 0.06)

    // the run opens facing the runner, with the cookie behind him, and swings round to follow
    orbit += ((s.over ? 2.6 : s.time < 1 ? Math.PI : 0) - orbit) * Math.min(1, dt * 2.6)
    const look = heading + orbit + ready * 0.4
    const fx = Math.sin(look), fz = -Math.cos(look), hx = Math.sin(heading), hz = -Math.cos(heading)
    const fast = Math.min(1, (s.speed - 12) / 12)
    const back = 6.6 - fast * 0.8
    camX += (p.x - fx * back - camX) * Math.min(1, dt * 11)
    camZ += (p.z - fz * back - camZ) * Math.min(1, dt * 11)
    camY += (Math.max(road, groundAt(seg, s.d - back)) + 4.6 + s.y * 0.55 - camY) * Math.min(1, dt * 7) // never into a slope behind him
    shake = Math.max(0, shake - dt * 1.6)
    dip = Math.max(0, dip - dt * 1.1)
    camera.position.set(camX + (Math.random() - 0.5) * shake, camY - dip + (Math.random() - 0.5) * shake, camZ + (Math.random() - 0.5) * shake)
    camera.lookAt(p.x + fx * 10, road + 1.5 + s.y * 0.6 + hillLook, p.z + fz * 10)
    laneRoll += ((s.lane * LANE_W - s.laneX) * 0.03 - laneRoll) * Math.min(1, dt * 10)
    camera.rotation.z -= turnLean + laneRoll
    punch += ((s.vy > 12 ? 8 : s.vy > 4 ? 3 : 0) - punch) * Math.min(1, dt * 6)
    const fov = (camera.aspect < 1 ? 74 : 60) + fast * 10 + punch
    if (Math.abs(fov - camera.fov) > 0.05) { camera.fov = fov; camera.updateProjectionMatrix() }
    wind.update(dt, Math.max(0, (fast - 0.25) * 1.33, punch / 8, lift))
    rim.position.set(p.x + hx * 12, p.y + 7, p.z + hz * 12)
    rim.target.position.set(p.x, p.y + 1, p.z)

    sun.position.set(p.x + 16, p.y + 34, p.z + 12)
    sun.target.position.set(p.x + hx * 8, p.y, p.z + hz * 8)
    skyMeshA.position.copy(camera.position); skyMeshB.position.copy(camera.position)
    floor.position.x = p.x; floor.position.z = p.z
    floor.material.map?.offset.set(p.x / 50, -p.z / 50)

    if (skyFade < 1) {
      skyFade = Math.min(1, skyFade + dt / 1.6)
      skyB.opacity = skyFade
      if (skyFade >= 1) { skyA.map = skyB.map; skyA.needsUpdate = true; skyB.opacity = 0 }
    }
    // a cave is dark, and coming out of one is blinding for a moment
    const nowInCave = inZone(seg, s.d, 'tunnel')
    if (inCave && !nowInCave) dazzle = 1
    inCave = nowInCave
    cave += ((nowInCave ? 1 : 0) - cave) * Math.min(1, dt * 5)
    dazzle = Math.max(0, dazzle - dt * 1.3)
    const light = LOOK[world]
    hemi.intensity = light.hemi[2] * (1 - cave * 0.5)
    sun.intensity = light.sunLight[1] * (1 - cave * 0.85)
    renderer.toneMappingExposure = 1.02 + dazzle * dazzle * 1.5
    target.set(light.fog).lerp(darkAir.set(light.wall[2]).multiplyScalar(0.55), cave)
    fog.lerp(target, Math.min(1, dt * (nowInCave ? 6 : 1.5)))
    scene.fog.color.copy(fog)
    sprites.tile.color.lerp(target.set(LOOK[world].stone[1]), Math.min(1, dt * 4))

    const showCookie = s.stumble > 0 || s.over || s.time < 2.4
    chase += ((showCookie ? (s.over ? 2.2 : 2.6) : 11) - chase) * Math.min(1, dt * 3)
    cookie.root.visible = chase < 8.5
    // while chasing it rolls beside the road's edge, so it never hides Buga or what is ahead of him
    const beside = s.over || s.time < 2.4 ? 0 : (s.laneX > 0 ? -1 : 1) * 4.6
    cookieSide += (beside - cookieSide) * Math.min(1, dt * 6)
    cookie.root.scale.setScalar(1 - Math.min(1, Math.abs(cookieSide) / 4.6) * 0.35)
    cookie.root.position.set(p.x - hx * chase - hz * cookieSide, road + 0.9 + Math.abs(Math.sin(clock * 8)) * 0.3, p.z - hz * chase + hx * cookieSide)
    cookie.root.rotation.y = -heading
    cookie.body.rotation.x = Math.sin(clock * 8) * 0.14

    flyersUpdate(p, dt)
    renderer.render(scene, camera)

    // a device that cannot keep up gets a lighter picture rather than a stutter
    if (dt > 0 && quality < QUALITY.length - 1) {
      const now = performance.now()
      // a long gap means a window throttled in the background, which says nothing about the device
      if (!sampleFrom || now - lastFrame > 400) { sampleFrom = now; sampleFrames = 0 }
      lastFrame = now
      sampleFrames++
      if (now - sampleFrom > 1200) {
        if (sampleFrames / (now - sampleFrom) * 1000 < 45) {
          const next = QUALITY[++quality]
          renderer.setPixelRatio(Math.min(dpr, next.ratio))
          resize()
          sun.castShadow = next.shadows
          buga.shells.forEach((shell, i) => { shell.visible = next.shadows || i % 2 === 0 })
        }
        sampleFrom = 0; sampleFrames = 0
      }
    }
  }

  function reset(s) {
    const p = worldPosition(s)
    heading = angleOf(p.dir); chase = 5; orbit = Math.PI; shake = 0
    camX = p.x; camY = p.y + 4; camZ = p.z - 6.6
    for (const b of built.values()) release(b)
    built.clear()
    pending.clear()
    // paint every world now, while "warming up" is on screen, so a new world never stalls the run
    for (const name of WORLDS) {
      const set = assets(name)
      for (const map of [set.sky, set.floor, set.road.map, set.wall.map]) renderer.initTexture(map)
    }
    for (const seg of s.segs) buildSegment(seg, Infinity)
  }

  function dispose() {
    for (const b of built.values()) release(b)
    built.clear()
    for (const set of worlds.values()) {
      for (const material of [set.road, set.wall, set.cave, set.hill, set.under, set.rail, ...set.towers]) { material.map?.dispose(); material.dispose() }
      set.sky.dispose(); set.floor.dispose()
    }
    watcher.disconnect()
    renderer.dispose()
    renderer.forceContextLoss() // a browser allows few live contexts: each new round must free its own
  }

  return { render, resize, reset, dispose }
}
