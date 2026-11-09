// The studio document: an album (spreads) or a collage (one page). Pure functions that build pages,
// fill them with photos and dress them in a style. Units: millimetres.
import { justify, gridRects, gridFor } from './geometry'
import { styleById, ALBUM_SIZES, COLLAGE_SIZES, EVENTS } from './styles'

let n = 0
export const uid = () => `i${Date.now().toString(36)}${(n++).toString(36)}`
function rng(seed) { let a = seed >>> 0; return () => { a += 0x6d2b79f5; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }

export const SAFE = 12 // mm from trim and from the fold
export const photoItem = (r, p, style, extra = {}) => ({ id: uid(), type: 'photo', x: r.x, y: r.y, w: r.w, h: r.h, rot: 0, photo: p?.id || null, zoom: 1, ox: 0, oy: 0, tone: style.photo.filter || 'none', vignette: 0, radius: style.photo.radius >= 50 ? Math.min(r.w, r.h) / 2 : style.photo.radius || 0, border: style.photo.border || 0, borderColor: style.photo.borderColor || '#ffffff', shadow: !!style.photo.shadow, ...extra })
export const textItem = (o) => ({ id: uid(), type: 'text', rot: 0, weight: 700, align: 'center', lineHeight: 1.15, photoFill: null, stroke: 0, strokeColor: '#ffffff', ...o })

// ---------- style decorations (marked auto so a style change replaces them) ----------
function decorFor(style, box, seed, photos = []) {
  const out = [], r = rng(seed), s = Math.min(box.w, box.h)
  const mk = (kind, x, y, w, h, color, rot = 0, extra = {}) => out.push({ id: uid(), type: 'decor', auto: true, kind, x, y, w, h, rot, color, ...extra })
  style.decor.forEach((d, di) => {
    const col = i => (d.color === 'rainbow' ? ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'][(i + di) % 5] : d.color === 'surface' ? style.surface : d.color === 'accentSoft' ? style.accent + '44' : d.color === 'accent2' ? style.text : d.color === 'tape' ? 'rgba(255,236,170,0.85)' : style.primary)
    const c = s * 0.16
    if (d.place === 'corners') {
      ;[[box.x + 3, box.y + 3, 0], [box.x + box.w - c - 3, box.y + 3, 90], [box.x + box.w - c - 3, box.y + box.h - c - 3, 180], [box.x + 3, box.y + box.h - c - 3, 270]]
        .forEach(([x, y, rot], i) => mk(d.kind, x, y, c, c, col(i), d.kind === 'corner' || d.kind === 'branch' || d.kind === 'leaf' ? rot : 0))
    } else if (d.place === 'top') mk(d.kind, box.x, box.y + 2, box.w, s * 0.07, col(0))
    else if (d.place === 'bottom') mk(d.kind, box.x + box.w / 2 - s * 0.2, box.y + box.h - s * 0.32, s * 0.4, s * 0.32, col(0), 0, { behind: true })
    else if (d.place === 'page') mk(d.kind, box.x + 4, box.y + 4, box.w - 8, box.h - 8, col(0))
    else if (d.place === 'scatter') for (let i = 0; i < 7; i++) { const z = s * (0.035 + r() * 0.04); mk(d.kind, box.x + r() * (box.w - z), box.y + (r() < 0.5 ? r() * SAFE * 0.8 : box.h - SAFE * 0.8 + r() * (SAFE * 0.8 - z)), z, z, col(i), Math.round((r() - 0.5) * 40)) }
    else if (d.place === 'tape') for (const p of photos) mk('tape', p.x + p.w / 2 - Math.min(18, p.w * 0.35) / 2, p.y - 3, Math.min(18, p.w * 0.35), 7, col(0), Math.round((r() - 0.5) * 14), { top: true })
  })
  return out
}
// Apply / change the style of a page: colours of photos and texts, decorations rebuilt.
export function dressPage(page, style, size, seed, spread) {
  const items = page.items.filter(i => !i.auto)
  for (const it of items) {
    if (it.type === 'photo' && !it.custom) Object.assign(it, { border: style.photo.border || 0, borderColor: style.photo.borderColor || '#fff', shadow: !!style.photo.shadow, radius: style.photo.radius >= 50 ? Math.min(it.w, it.h) / 2 : style.photo.radius || 0, tone: it.toneSet ? it.tone : style.photo.filter || 'none' })
    if (it.type === 'text' && it.role) Object.assign(it, { font: it.role === 'title' ? style.title : style.body, color: it.role === 'title' ? style.text : style.primary })
  }
  const boxes = spread ? [{ x: 0, y: 0, w: size.w / 2, h: size.h }, { x: size.w / 2, y: 0, w: size.w / 2, h: size.h }] : [{ x: 0, y: 0, w: size.w, h: size.h }]
  const photos = items.filter(i => i.type === 'photo')
  const decor = boxes.flatMap((b, bi) => decorFor(style, b, seed * 7 + bi, photos.filter(p => p.x + p.w / 2 >= b.x && p.x + p.w / 2 < b.x + b.w)))
  page.items = [...decor.filter(d => d.behind || !d.top), ...items, ...decor.filter(d => d.top)]
  page.bg = style.bg
  return page
}

// ---------- layout of photos in a box ----------
function placePhotos(photos, box, style, mode, seed) {
  const gap = style.photo.gap ?? 6
  if (!photos.length) return []
  let rects
  if (mode === 'grid') rects = gridRects(gridFor(photos.length), box, gap)
  else rects = justify(photos.map(p => (p ? p.w / p.h : 1.5)), box, gap)
  const r = rng(seed)
  return rects.map((rc, i) => {
    let q = rc
    if (style.photo.tilt) { const s = 0.9; q = { x: rc.x + (rc.w * (1 - s)) / 2, y: rc.y + (rc.h * (1 - s)) / 2, w: rc.w * s, h: rc.h * s } }
    return photoItem(q, photos[i], style, style.photo.tilt ? { rot: Math.round((r() - 0.5) * 8) } : {})
  })
}

// ---------- album ----------
export function newAlbum({ event = 'wedding', styleId, sizeId = '30x30', photos = [], perPage = 3, mode = 'justify', title, sub }) {
  const style = styleById(styleId || { 'bar-mitzvah': 'b-tallit', 'bat-mitzvah': 't-pink', birthday: 'd-rainbow' }[event] || 'w-gold')
  const size = ALBUM_SIZES.find(s => s.id === sizeId) || ALBUM_SIZES[0]
  const ev = EVENTS.find(e => e.id === event) || EVENTS[0]
  const doc = { v: 1, kind: 'album', event, styleId: style.id, size: { w: size.w, h: size.h }, sizeId: size.id, bleed: 3, perPage, mode, pages: [] }
  const half = size.w / 2
  const pageBox = right => ({ x: (right ? half : 0) + SAFE, y: SAFE, w: half - 2 * SAFE, h: size.h - 2 * SAFE })
  // opening spread: Hebrew albums open from the right → title on the right page, the first photo on the left
  const list = [...photos]
  const open = { id: uid(), items: [] }
  const rb = pageBox(true), lb = pageBox(false)
  open.items.push(textItem({ role: 'title', text: title || ev.title, font: style.title, color: style.text, size: Math.round(size.h * 0.07), x: rb.x, y: rb.y + rb.h * 0.32, w: rb.w, h: rb.h * 0.2 }))
  open.items.push(textItem({ role: 'sub', text: sub || ev.sub, font: style.body, weight: 400, color: style.primary, size: Math.round(size.h * 0.03), x: rb.x, y: rb.y + rb.h * 0.54, w: rb.w, h: rb.h * 0.1 }))
  open.items.push(...placePhotos(list.splice(0, 1), lb, style, mode, 1))
  if (!photos.length) open.items.push(photoItem(lb, null, style))
  doc.pages.push(dressPage(open, style, doc.size, 1, true))
  // the rest: right page first, then left (reading order in Hebrew)
  const pattern = [perPage, Math.max(1, perPage - 1), perPage + 1, perPage, Math.max(1, perPage - 2), perPage + 1]
  let pi = 0, seed = 2
  while (list.length) {
    const sp = { id: uid(), items: [] }
    for (const right of [true, false]) {
      if (!list.length) break
      sp.items.push(...placePhotos(list.splice(0, pattern[pi++ % pattern.length]), pageBox(right), style, mode, seed++))
    }
    doc.pages.push(dressPage(sp, style, doc.size, seed, true))
  }
  if (doc.pages.length === 1 && !photos.length) {
    const sp = { id: uid(), items: [photoItem(pageBox(true), null, style), photoItem(pageBox(false), null, style)] }
    doc.pages.push(dressPage(sp, style, doc.size, 3, true))
  }
  return doc
}
export function addSpread(doc, photos = []) {
  const style = styleById(doc.styleId), half = doc.size.w / 2
  const sp = { id: uid(), items: [] }
  const boxes = [{ x: half + SAFE, y: SAFE, w: half - 2 * SAFE, h: doc.size.h - 2 * SAFE }, { x: SAFE, y: SAFE, w: half - 2 * SAFE, h: doc.size.h - 2 * SAFE }]
  if (!photos.length) boxes.forEach(b => sp.items.push(photoItem(b, null, style)))
  else { const mid = Math.ceil(photos.length / 2); sp.items.push(...placePhotos(photos.slice(0, mid), boxes[0], style, doc.mode, 9), ...placePhotos(photos.slice(mid), boxes[1], style, doc.mode, 10)) }
  return dressPage(sp, style, doc.size, doc.pages.length + 5, true)
}
// Re-flow the photos of one page in a new arrangement (keeps texts and stickers the user added).
export function relayoutPage(doc, page, mode, photosById) {
  const style = styleById(doc.styleId), spread = doc.kind === 'album'
  const ph = page.items.filter(i => i.type === 'photo')
  const rest = page.items.filter(i => i.type !== 'photo' && !i.auto)
  const half = doc.size.w / 2
  const boxes = spread ? [{ x: half + SAFE, y: SAFE, w: half - 2 * SAFE, h: doc.size.h - 2 * SAFE }, { x: SAFE, y: SAFE, w: half - 2 * SAFE, h: doc.size.h - 2 * SAFE }] : [{ x: 8, y: 8, w: doc.size.w - 16, h: doc.size.h - 16 }]
  const groups = boxes.map(() => [])
  ph.forEach(p => { const c = p.x + p.w / 2; groups[spread && c < half ? 1 : 0].push(p) })
  if (spread && (!groups[0].length || !groups[1].length)) { const all = [...groups[0], ...groups[1]]; groups[0] = all.slice(0, Math.ceil(all.length / 2)); groups[1] = all.slice(Math.ceil(all.length / 2)) }
  const placed = groups.flatMap((g, gi) => placePhotos(g.map(p => photosById(p.photo) || { w: p.w, h: p.h }), boxes[gi], style, mode, gi + 3).map((np, i) => ({ ...g[i], x: np.x, y: np.y, w: np.w, h: np.h, rot: np.rot, ox: 0, oy: 0 })))
  page.items = [...rest.filter(i => i.type === 'text' || i.type === 'mosaic'), ...placed, ...rest.filter(i => i.type === 'decor')]
  return dressPage(page, style, doc.size, 4, spread)
}

// ---------- collage ----------
export const COLLAGE_KINDS = [
  { id: 'grid', label: 'רשת תמונות', emoji: '🧱' },
  { id: 'heart', label: 'לב מתמונות', emoji: '❤️' },
  { id: 'number', label: 'מספר מתמונות', emoji: '🔢' },
  { id: 'name', label: 'שם מתמונות', emoji: '🔤' },
  { id: 'photo-text', label: 'תמונה בתוך טקסט', emoji: '🅰️' },
]
export function newCollage({ kind = 'grid', sizeId, styleId = 'd-rainbow', photos = [], text, caption }) {
  const style = styleById(styleId)
  const size = COLLAGE_SIZES.find(s => s.id === sizeId) || COLLAGE_SIZES[kind === 'number' || kind === 'name' || kind === 'photo-text' ? 2 : 0]
  const doc = { v: 1, kind: 'collage', collage: kind, styleId: style.id, size: { w: size.w, h: size.h }, sizeId: size.id, bleed: 0, mode: 'justify', transparent: kind === 'photo-text', pages: [] }
  const m = Math.min(size.w, size.h) * 0.05
  const page = { id: uid(), items: [] }
  const cap = caption ?? (kind === 'number' ? 'יום הולדת שמח!' : '')
  const capH = cap ? size.h * 0.1 : 0
  const box = { x: m, y: m, w: size.w - 2 * m, h: size.h - 2 * m - capH }
  const ids = photos.map(p => p.id) // already in the order the user chose (date or upload)
  if (kind === 'grid') page.items.push(...placePhotos(photos.length ? photos : [null, null, null, null], box, style, 'justify', 1))
  else if (kind === 'photo-text') page.items.push(textItem({ text: text || 'LOVE', font: 'Secular One', weight: 900, size: Math.min(size.h * 0.6, (size.w * 1.6) / Math.max(2, (text || 'LOVE').length)), color: style.primary, photoFill: ids[0] || null, x: m, y: m, w: size.w - 2 * m, h: size.h - 2 * m }))
  else {
    const shape = kind === 'heart' ? 'heart' : 'text'
    page.items.push({ id: uid(), type: 'mosaic', shape, text: kind === 'number' ? (text || '40') : kind === 'name' ? (text || 'נועה') : '', font: 'Rubik', photos: ids, count: Math.max(ids.length, kind === 'heart' ? 36 : 44), gap: 1.2, radius: 8, fill: 0.5, tone: 'none', x: box.x, y: box.y, w: box.w, h: box.h, rot: 0 })
  }
  if (cap) page.items.push(textItem({ role: 'title', text: cap, font: style.title, color: style.text, size: capH * 0.55, x: m, y: size.h - m - capH, w: size.w - 2 * m, h: capH }))
  if (kind !== 'photo-text') dressPage(page, { ...style, decor: kind === 'grid' ? style.decor : [] }, doc.size, 1, false)
  doc.pages.push(page)
  return doc
}
