// Pure geometry for the photo studio (album + collage). No DOM here, so it is unit-tested in tests/.
// Units are whatever the caller uses (the studio uses millimetres on the page).

// Axis-aligned box of an item rotated by rot degrees around its centre.
export function bbox({ x, y, w, h, rot = 0 }) {
  const r = (rot * Math.PI) / 180, c = Math.abs(Math.cos(r)), s = Math.abs(Math.sin(r))
  const bw = w * c + h * s, bh = w * s + h * c
  const cx = x + w / 2, cy = y + h / 2
  return { x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh }
}

// Snap a moving box to page guides and to the other boxes ("magnet"): left/centre/right and
// top/middle/bottom lines. Returns the offset to add and the guide lines to draw.
export function snapMove(box, others, page, threshold) {
  const xs = [], ys = []
  const addX = (v, kind) => xs.push({ v, kind })
  const addY = (v, kind) => ys.push({ v, kind })
  for (const g of page.guidesX || []) addX(g, 'page')
  for (const g of page.guidesY || []) addY(g, 'page')
  for (const o of others) {
    addX(o.x, 'item'); addX(o.x + o.w / 2, 'item'); addX(o.x + o.w, 'item')
    addY(o.y, 'item'); addY(o.y + o.h / 2, 'item'); addY(o.y + o.h, 'item')
  }
  const best = (edges, lines) => {
    let hit = null
    for (const e of edges) for (const l of lines) {
      const d = l.v - e
      if (Math.abs(d) <= threshold && (!hit || Math.abs(d) < Math.abs(hit.d))) hit = { d, v: l.v }
    }
    return hit
  }
  const hx = best([box.x, box.x + box.w / 2, box.x + box.w], xs)
  const hy = best([box.y, box.y + box.h / 2, box.y + box.h], ys)
  return { dx: hx ? hx.d : 0, dy: hy ? hy.d : 0, lineX: hx ? hx.v : null, lineY: hy ? hy.v : null }
}

// While resizing: snap a height (or width) to the same size as another photo ("same height as").
export function snapSize(value, sizes, threshold) {
  let hit = null
  for (const s of sizes) { const d = s - value; if (Math.abs(d) <= threshold && (!hit || Math.abs(d) < Math.abs(hit - value))) hit = s }
  return hit ?? value
}

// Justified rows (like a photo-book auto layout): photos keep their aspect ratio, rows fill the width,
// and the row breaks are chosen so the block fills the box height best. Returns rects in box units.
export function justify(aspects, box, gap) {
  const n = aspects.length
  if (!n) return []
  let bestRows = null, bestErr = Infinity
  // dynamic programming over consecutive row breaks would be exact; n ≤ 12 per page, so try all row counts
  // and greedily balance each row to the target height for that row count.
  for (let rows = 1; rows <= Math.min(n, 5); rows++) {
    const target = (box.h - gap * (rows - 1)) / rows
    const split = []
    let i = 0
    for (let r = 0; r < rows; r++) {
      const left = rows - r
      const row = []
      let sum = 0
      while (i < n && (row.length === 0 || n - i > left - 1)) {
        const next = sum + aspects[i]
        const hNow = row.length ? (box.w - gap * (row.length - 1)) / sum : Infinity
        const hNext = (box.w - gap * row.length) / next
        if (row.length && r < rows - 1 && Math.abs(hNow - target) <= Math.abs(hNext - target)) break
        row.push(i); sum = next; i++
        if (n - i <= left - 1) break
      }
      split.push(row)
    }
    if (i < n) split[split.length - 1].push(...Array.from({ length: n - i }, (_, k) => i + k))
    if (split.some(r => !r.length)) continue
    const heights = split.map(r => (box.w - gap * (r.length - 1)) / r.reduce((s, k) => s + aspects[k], 0))
    const total = heights.reduce((a, b) => a + b, 0) + gap * (rows - 1)
    const err = Math.abs(Math.log(total / box.h))
    if (err < bestErr) { bestErr = err; bestRows = { split, heights, total } }
  }
  const { split, heights, total } = bestRows
  const k = Math.min(1, box.h / total) // too tall → shrink everything, keep it centred
  const out = new Array(n)
  let y = box.y + (box.h - total * k) / 2
  split.forEach((row, r) => {
    const h = heights[r] * k
    const rowW = row.reduce((s, i) => s + aspects[i] * h, 0) + gap * k * (row.length - 1)
    let x = box.x + (box.w - rowW) / 2
    for (const i of row) { const w = aspects[i] * h; out[i] = { x, y, w, h }; x += w + gap * k }
    y += h + gap * k
  })
  return out
}

// Fixed grids (cells are cropped to fill): rows of columns, e.g. [2, 3] = 2 on top, 3 below.
export function gridRects(rows, box, gap) {
  const out = []
  const rh = (box.h - gap * (rows.length - 1)) / rows.length
  rows.forEach((cols, r) => {
    const cw = (box.w - gap * (cols - 1)) / cols
    for (let c = 0; c < cols; c++) out.push({ x: box.x + c * (cw + gap), y: box.y + r * (rh + gap), w: cw, h: rh })
  })
  return out
}
// A pleasant grid for n photos.
export function gridFor(n) {
  const table = { 1: [1], 2: [2], 3: [1, 2], 4: [2, 2], 5: [2, 3], 6: [3, 3], 7: [3, 4], 8: [4, 4], 9: [3, 3, 3], 10: [3, 4, 3], 11: [4, 3, 4], 12: [4, 4, 4] }
  if (table[n]) return table[n]
  const cols = Math.ceil(Math.sqrt(n * 1.5)), rows = []
  let left = n
  while (left > 0) { rows.push(Math.min(cols, left)); left -= cols }
  return rows
}

// Crop that fills a w×h frame with an iw×ih photo: zoom ≥ 1 enlarges, (ox, oy) in −1…1 pans.
export function coverRect(iw, ih, w, h, zoom = 1, ox = 0, oy = 0) {
  const s = Math.max(w / iw, h / ih) * zoom
  const dw = iw * s, dh = ih * s
  return { x: (w - dw) / 2 * (1 + ox), y: (h - dh) / 2 * (1 + oy), w: dw, h: dh, scale: s }
}

// Photo mosaic inside a shape (a number like "40", a name, a heart): mask is a w×h alpha array
// (0–255). Picks a square cell size so about `target` cells fall inside the shape. A cell counts when
// at least `fill` of its sample points are inside. Returns cells in mask pixels.
export function mosaicCells(mask, w, h, target, fill = 0.5) {
  const cellsFor = size => {
    const out = []
    const k = 4 // 4×4 sample points per cell
    for (let y = 0; y + size <= h + 0.001; y += size) for (let x = 0; x + size <= w + 0.001; x += size) {
      let inside = 0
      for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) {
        const px = Math.min(w - 1, Math.floor(x + (i + 0.5) * size / k)), py = Math.min(h - 1, Math.floor(y + (j + 0.5) * size / k))
        if (mask[py * w + px] > 127) inside++
      }
      if (inside / (k * k) >= fill) out.push({ x, y, w: size, h: size })
    }
    return out
  }
  let lo = 2, hi = Math.max(w, h), best = cellsFor(hi)
  for (let it = 0; it < 24; it++) {
    const mid = (lo + hi) / 2, cells = cellsFor(mid)
    if (Math.abs(cells.length - target) < Math.abs(best.length - target) || (cells.length >= target && best.length < target)) best = cells
    if (cells.length > target) lo = mid; else hi = mid
  }
  return best
}

// Where to drop a new item so it doesn't land on top of what's already on the page: tries the
// wanted size, then smaller ones, over a grid of positions inside the margin. Returns {x, y, w, h}.
export function freeSpot(page, items, w, h, margin = 0) {
  const area = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y))
  let best = null
  for (const k of [1, 0.75, 0.55, 0.4, 0.3]) {
    const bw = w * k, bh = h * k, spanX = page.w - 2 * margin - bw, spanY = page.h - 2 * margin - bh
    if (spanX < 0 || spanY < 0) continue
    for (let j = 0; j <= 8; j++) for (let i = 0; i <= 8; i++) {
      // start from the centre and spiral outwards, so an empty page still gets a centred item
      const fx = 0.5 + (i % 2 ? 1 : -1) * Math.ceil(i / 2) / 8, fy = 0.5 + (j % 2 ? 1 : -1) * Math.ceil(j / 2) / 8
      const r = { x: margin + spanX * fx, y: margin + spanY * fy, w: bw, h: bh }
      const o = items.reduce((s, it) => s + area(r, it), 0) / (bw * bh)
      if (o === 0) return r
      if (!best || o < best.o) best = { o, r }
    }
  }
  return best ? best.r : { x: (page.w - w) / 2, y: (page.h - h) / 2, w, h }
}

// Millimetres → pixels at a print resolution.
export const mmToPx = (mm, dpi) => Math.round((mm / 25.4) * dpi)
// Print quality of a photo shown w×h mm from an iw×ih source (after crop zoom): effective DPI.
export function effectiveDpi(iw, ih, wMm, hMm, zoom = 1) {
  const s = Math.max(wMm / iw, hMm / ih) * zoom // mm per source pixel
  return 25.4 / s
}
export const dpiLevel = dpi => (dpi >= 200 ? 'good' : dpi >= 120 ? 'ok' : 'low')
