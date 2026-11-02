// Pure helpers for the image studio (/tools/image): sizes, names, crop math, collage layouts,
// target-size search, colour-similar flood fill and a tiny store-only ZIP writer.
// No DOM here, so everything is testable in node (tests/image-tool.test.mjs).

// ── formats & names ───────────────────────────────
export const FORMATS = {
  jpg: { mime: 'image/jpeg', label: 'JPG', lossy: true },
  png: { mime: 'image/png', label: 'PNG', lossy: false },
  webp: { mime: 'image/webp', label: 'WebP', lossy: true },
}
export function extForMime(mime) {
  if (/jpe?g/i.test(mime || '')) return 'jpg'
  if (/webp/i.test(mime || '')) return 'webp'
  if (/png/i.test(mime || '')) return 'png'
  return 'jpg'
}
// The format to keep when the visitor didn't choose: PNG/WebP stay (they may be transparent), the rest become JPG.
export function defaultFormat(mime) {
  const e = extForMime(mime)
  return e === 'png' || e === 'webp' ? e : 'jpg'
}

export function isHeic(file) {
  const name = (file && file.name) || ''
  const type = (file && file.type) || ''
  return /heic|heif/i.test(type) || /\.(heic|heif)$/i.test(name)
}

export function baseName(name) {
  const clean = String(name || '').split(/[\\/]/).pop().replace(/\.[a-z0-9]{1,5}$/i, '')
  const printable = Array.from(clean).filter(ch => ch.charCodeAt(0) >= 32).join('')
  const safe = printable.replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').replace(/^[-\s.]+|[-\s.]+$/g, '').slice(0, 80)
  return safe || 'תמונה'
}
export function outName(name, suffix, ext) {
  return `${baseName(name)}${suffix ? '-' + suffix : ''}.${ext}`
}
// Same name twice in one ZIP would overwrite: add (2), (3)…
export function uniqueNames(names) {
  const seen = new Map()
  return names.map(n => {
    const key = n.toLowerCase()
    const count = seen.get(key) || 0
    seen.set(key, count + 1)
    if (!count) return n
    const dot = n.lastIndexOf('.')
    const alt = dot > 0 ? `${n.slice(0, dot)} (${count + 1})${n.slice(dot)}` : `${n} (${count + 1})`
    seen.set(alt.toLowerCase(), 1)
    return alt
  })
}

export function formatBytes(n) {
  if (!Number.isFinite(n) || n < 0) return ''
  if (n < 1024) return `${Math.round(n)} B`
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  const mb = n / (1024 * 1024)
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`
}
// "34% קטן יותר" — negative when the new file is bigger.
export function savedPercent(before, after) {
  if (!before) return 0
  return Math.round((1 - after / before) * 100)
}

// ── sizes ───────────────────────────────
// Scale (w,h) down to fit maxW×maxH (never up), keeping the ratio.
export function fitWithin(w, h, maxW = Infinity, maxH = Infinity) {
  const s = Math.min(1, maxW / w, maxH / h)
  return { width: Math.max(1, Math.round(w * s)), height: Math.max(1, Math.round(h * s)) }
}
// Canvas-safe size: longest side ≤ maxSide and area ≤ maxArea (iOS Safari refuses canvases over ~16.7MP).
export function safeSize(w, h, maxSide = 4096, maxArea = 16e6) {
  const s = Math.min(1, maxSide / Math.max(w, h), Math.sqrt(maxArea / (w * h)))
  return { width: Math.max(1, Math.floor(w * s)), height: Math.max(1, Math.floor(h * s)), scale: s }
}
export const WIDTH_PRESETS = [
  { w: 0, label: 'בלי שינוי' },
  { w: 2048, label: '2048' },
  { w: 1600, label: '1600' },
  { w: 1280, label: '1280' },
  { w: 1080, label: '1080' },
  { w: 800, label: '800' },
]

// Find the best (highest quality, then largest scale) encoding that fits in targetBytes.
// encode({ quality, scale }) → Promise<{ size, ... }>. Returns { result, quality, scale, fits }.
export async function fitToSize(encode, targetBytes, { maxQ = 0.92, minQ = 0.3, steps = 6, rounds = 5 } = {}) {
  let scale = 1, smallest = null
  for (let round = 0; round < rounds; round++) {
    const top = await encode({ quality: maxQ, scale })
    if (top.size <= targetBytes) return { result: top, quality: maxQ, scale, fits: true }
    const low = await encode({ quality: minQ, scale })
    if (!smallest || low.size < smallest.result.size) smallest = { result: low, quality: minQ, scale, fits: false }
    if (low.size > targetBytes) {
      // Even the lowest quality is too big: shrink the pixels (file size ~ area) and try again.
      scale *= Math.max(0.35, Math.min(0.9, Math.sqrt(targetBytes / low.size) * 0.92))
      continue
    }
    let lo = minQ, hi = maxQ, best = { result: low, quality: minQ, scale, fits: true }
    for (let i = 0; i < steps; i++) {
      const q = (lo + hi) / 2
      const r = await encode({ quality: q, scale })
      if (r.size <= targetBytes) { best = { result: r, quality: q, scale, fits: true }; lo = q } else hi = q
    }
    return best
  }
  return smallest
}

// ── crop ───────────────────────────────
// ratio = width / height; null = free
export const RATIOS = [
  { id: 'free', label: 'חופשי', ratio: null },
  { id: '1-1', label: 'ריבוע 1:1', ratio: 1 },
  { id: '4-5', label: 'פוסט 4:5', ratio: 4 / 5 },
  { id: '9-16', label: 'סטורי 9:16', ratio: 9 / 16 },
  { id: '16-9', label: 'רחב 16:9', ratio: 16 / 9 },
  { id: '3-2', label: 'תמונה 3:2', ratio: 3 / 2 },
  { id: 'a4', label: 'A4 לאורך', ratio: 210 / 297 },
  { id: 'a4l', label: 'A4 לרוחב', ratio: 297 / 210 },
]
// The biggest centred rect with this ratio inside W×H (the whole image when free).
export function centeredCrop(W, H, ratio) {
  if (!ratio) return { x: 0, y: 0, w: W, h: H }
  let w = W, h = W / ratio
  if (h > H) { h = H; w = H * ratio }
  return { x: (W - w) / 2, y: (H - h) / 2, w, h }
}
export function moveRect(r, dx, dy, W, H) {
  return { ...r, x: Math.min(Math.max(0, r.x + dx), W - r.w), y: Math.min(Math.max(0, r.y + dy), H - r.h) }
}
// Drag a handle (n, s, e, w, ne, nw, se, sw) of the starting rect by (dx, dy), inside W×H.
// With a ratio, the corner opposite the handle stays put and the ratio holds.
export function resizeRect(r, handle, dx, dy, ratio, W, H, min = 20) {
  const west = handle.includes('w'), east = handle.includes('e')
  const north = handle.includes('n'), south = handle.includes('s')
  let x0 = r.x, y0 = r.y, x1 = r.x + r.w, y1 = r.y + r.h
  if (!ratio) {
    if (west) x0 = Math.min(Math.max(0, x0 + dx), x1 - min)
    if (east) x1 = Math.max(Math.min(W, x1 + dx), x0 + min)
    if (north) y0 = Math.min(Math.max(0, y0 + dy), y1 - min)
    if (south) y1 = Math.max(Math.min(H, y1 + dy), y0 + min)
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
  }
  // corner handles only when the ratio is locked
  const ax = west ? x1 : x0, ay = north ? y1 : y0
  let w = west ? r.w - dx : r.w + dx
  let h = north ? r.h - dy : r.h + dy
  if (w / h > ratio) h = w / ratio; else w = h * ratio
  const maxW = west ? ax : W - ax, maxH = north ? ay : H - ay
  if (w > maxW) { w = maxW; h = w / ratio }
  if (h > maxH) { h = maxH; w = h * ratio }
  const minW = ratio >= 1 ? min * ratio : min, minH = minW / ratio
  if (w < minW) { w = minW; h = minH }
  return { x: west ? ax - w : ax, y: north ? ay - h : ay, w, h }
}
// Whole pixels; width and height rounded on their own so a 1:1 crop stays exactly square.
export function roundRect(r, W = Infinity, H = Infinity) {
  const w = Math.max(1, Math.min(Math.round(r.w), W)), h = Math.max(1, Math.min(Math.round(r.h), H))
  return { x: Math.max(0, Math.min(Math.round(r.x), W - w)), y: Math.max(0, Math.min(Math.round(r.y), H - h)), w, h }
}
// Size after a number of quarter turns.
export function rotatedSize(w, h, quarterTurns) {
  return ((quarterTurns % 4) + 4) % 2 ? { width: h, height: w } : { width: w, height: h }
}

// ── rects for blur / text hit tests ───────────────────────────────
export function normRect(x0, y0, x1, y1) {
  return { x: Math.min(x0, x1), y: Math.min(y0, y1), w: Math.abs(x1 - x0), h: Math.abs(y1 - y0) }
}
// Index of the topmost rect containing the point, or -1.
export function hitRect(rects, x, y, pad = 0) {
  for (let i = rects.length - 1; i >= 0; i--) {
    const r = rects[i]
    if (x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad) return i
  }
  return -1
}
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

// ── collage ───────────────────────────────
export const COLLAGE_SIZES = [
  { id: 'square', label: 'ריבוע', note: 'אינסטגרם, פייסבוק', w: 2048, h: 2048 },
  { id: 'story', label: 'סטורי', note: 'סטטוס וואטסאפ, סטורי', w: 1080, h: 1920 },
  { id: 'a4', label: 'A4 לאורך', note: 'להדפסה', w: 2480, h: 3508 },
  { id: 'a4l', label: 'A4 לרוחב', note: 'להדפסה', w: 3508, h: 2480 },
]
export const COLLAGE_MIN = 2, COLLAGE_MAX = 9

// Split n as evenly as possible into k parts, bigger parts last: (5,2) → [2,3]
function spread(n, k) {
  const base = Math.floor(n / k), extra = n % k
  return Array.from({ length: k }, (_, i) => base + (i >= k - extra ? 1 : 0))
}
function rowsIn(n, box, rowCount) {
  const k = rowCount || Math.max(1, Math.round(Math.sqrt(n)))
  const counts = spread(n, k), cells = []
  counts.forEach((c, r) => {
    for (let i = 0; i < c; i++) cells.push({ x: box.x + box.w * i / c, y: box.y + box.h * r / k, w: box.w / c, h: box.h / k })
  })
  return cells
}
const transpose = cells => cells.map(c => ({ x: c.y, y: c.x, w: c.h, h: c.w }))
// RTL: the first photo sits on the right.
const mirror = cells => cells.map(c => ({ ...c, x: 1 - c.x - c.w }))

// Layouts for n photos, in unit coordinates (0..1), first photo first.
export function collageLayouts(n) {
  n = clamp(Math.round(n) || 0, COLLAGE_MIN, COLLAGE_MAX)
  const all = { x: 0, y: 0, w: 1, h: 1 }
  const layouts = [
    { id: 'rows', label: 'שורות', cells: mirror(rowsIn(n, all)) },
    { id: 'cols', label: 'עמודות', cells: mirror(transpose(rowsIn(n, all))) },
  ]
  const rest = n - 1
  const big = n === 2 ? 0.6 : n <= 4 ? 0.62 : 0.55
  layouts.push({
    id: 'top', label: 'גדולה למעלה',
    cells: mirror([{ x: 0, y: 0, w: 1, h: big }, ...rowsIn(rest, { x: 0, y: big, w: 1, h: 1 - big }, rest > 4 ? 2 : 1)]),
  })
  // the rest stacked in one or two columns beside the big photo (a transposed strip of rows)
  layouts.push({
    id: 'side', label: 'גדולה בצד',
    cells: mirror([{ x: 0, y: 0, w: big, h: 1 }, ...transpose(rowsIn(rest, { x: 0, y: big, w: 1, h: 1 - big }, rest > 4 ? 2 : 1))]),
  })
  if (n >= 4) {
    // frame: one big photo in the middle row, the rest above and below
    const above = Math.floor(rest / 2), below = rest - above
    layouts.push({
      id: 'middle', label: 'גדולה באמצע',
      cells: mirror([
        { x: 0, y: 0.25, w: 1, h: 0.5 },
        ...rowsIn(above, { x: 0, y: 0, w: 1, h: 0.25 }, 1),
        ...rowsIn(below, { x: 0, y: 0.75, w: 1, h: 0.25 }, 1),
      ]),
    })
  }
  return layouts
}

// Unit cells → pixel rects on a W×H canvas, with `gap` px around and between photos.
export function cellRects(cells, W, H, gap = 0) {
  const eps = 1e-6
  return cells.map(c => {
    const x0 = c.x * W, y0 = c.y * H, x1 = (c.x + c.w) * W, y1 = (c.y + c.h) * H
    const l = x0 + (c.x < eps ? gap : gap / 2)
    const t = y0 + (c.y < eps ? gap : gap / 2)
    const r = x1 - (c.x + c.w > 1 - eps ? gap : gap / 2)
    const b = y1 - (c.y + c.h > 1 - eps ? gap : gap / 2)
    const x = Math.round(l), y = Math.round(t)
    return { x, y, w: Math.max(1, Math.round(r) - x), h: Math.max(1, Math.round(b) - y) }
  })
}
// Source rect that fills dw×dh without stretching (CSS object-fit: cover), centred.
export function coverCrop(sw, sh, dw, dh) {
  const s = Math.max(dw / sw, dh / sh)
  const w = dw / s, h = dh / s
  return { sx: (sw - w) / 2, sy: (sh - h) / 2, sw: w, sh: h }
}

// ── colour-similar background eraser ───────────────────────────────
// 0 (same colour) … 100 (black vs white), by the largest channel difference.
export function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.max(Math.abs(r1 - r2), Math.abs(g1 - g2), Math.abs(b1 - b2)) / 2.55
}
// Pixels whose colour is within `tolerance` of the pixel at (sx, sy).
// contiguous: only those connected to it (magic wand); otherwise everywhere in the image.
// Already-transparent pixels count as matching so a wand click flows through erased areas.
export function floodMask(rgba, w, h, sx, sy, tolerance, contiguous = true) {
  const mask = new Uint8Array(w * h)
  sx = Math.floor(sx); sy = Math.floor(sy)
  if (sx < 0 || sy < 0 || sx >= w || sy >= h) return mask
  const s = (sy * w + sx) * 4
  const r0 = rgba[s], g0 = rgba[s + 1], b0 = rgba[s + 2]
  const lim = tolerance * 2.55
  const match = p => {
    const i = p * 4
    if (rgba[i + 3] === 0) return true
    return Math.abs(rgba[i] - r0) <= lim && Math.abs(rgba[i + 1] - g0) <= lim && Math.abs(rgba[i + 2] - b0) <= lim
  }
  if (!contiguous) {
    for (let p = 0; p < w * h; p++) if (match(p)) mask[p] = 1
    return mask
  }
  const stack = new Int32Array(w * h + 1)
  let top = 0
  stack[top++] = sy * w + sx
  mask[sy * w + sx] = 1
  while (top) {
    const p = stack[--top]
    const x = p % w
    const nb = [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p >= w ? p - w : -1, p < w * (h - 1) ? p + w : -1]
    for (let k = 0; k < 4; k++) {
      const q = nb[k]
      if (q >= 0 && !mask[q] && match(q)) { mask[q] = 1; stack[top++] = q }
    }
  }
  return mask
}
// Clear masked pixels; pixels touching the cleared area get half alpha so the edge isn't jagged.
export function applyMask(rgba, mask, w, h, soften = true) {
  for (let p = 0; p < mask.length; p++) if (mask[p]) rgba[p * 4 + 3] = 0
  if (!soften) return rgba
  for (let p = 0; p < mask.length; p++) {
    if (mask[p]) continue
    const x = p % w
    const edge = (x > 0 && mask[p - 1]) || (x < w - 1 && mask[p + 1]) || (p >= w && mask[p - w]) || (p < w * (h - 1) && mask[p + w])
    if (edge) rgba[p * 4 + 3] = Math.min(rgba[p * 4 + 3], 140)
  }
  return rgba
}
export function countMask(mask) {
  let n = 0
  for (let i = 0; i < mask.length; i++) n += mask[i]
  return n
}

// ── ZIP (store only — JPG/PNG/WebP are already compressed) ───────────────────────────────
let CRC_TABLE = null
export function crc32(bytes) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      CRC_TABLE[n] = c >>> 0
    }
  }
  let c = 0xffffffff
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
// files: [{ name, data: Uint8Array }] → Uint8Array of a .zip (UTF-8 names, so Hebrew survives).
export function makeZip(files, date = new Date(2026, 0, 1)) {
  const enc = new TextEncoder()
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)
  const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  const names = uniqueNames(files.map(f => f.name))
  const locals = [], centrals = []
  let offset = 0
  files.forEach((f, i) => {
    const name = enc.encode(names[i])
    const data = f.data, crc = crc32(data)
    const lh = new DataView(new ArrayBuffer(30))
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true)
    lh.setUint16(8, 0, true); lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true)
    lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true)
    lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true)
    locals.push(new Uint8Array(lh.buffer), name, data)
    const ch = new DataView(new ArrayBuffer(46))
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true)
    ch.setUint16(10, 0, true); ch.setUint16(12, dosTime, true); ch.setUint16(14, dosDate, true)
    ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true)
    ch.setUint16(28, name.length, true); ch.setUint32(42, offset, true)
    centrals.push(new Uint8Array(ch.buffer), name)
    offset += 30 + name.length + data.length
  })
  const cdSize = centrals.reduce((s, a) => s + a.length, 0)
  const end = new DataView(new ArrayBuffer(22))
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true)
  end.setUint32(12, cdSize, true); end.setUint32(16, offset, true)
  const parts = [...locals, ...centrals, new Uint8Array(end.buffer)]
  const out = new Uint8Array(parts.reduce((s, a) => s + a.length, 0))
  let o = 0
  for (const p of parts) { out.set(p, o); o += p.length }
  return out
}
