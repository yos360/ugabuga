// Pure layout helpers for the math desk strips (סרגלי כפולות, סרגל מספרים לשולחן).
// Every sheet is drawn in a 210×297 viewBox (1 unit = 1 mm) with all content inside a 10 mm margin;
// math-desk-strips.css prints it at absolute size, which keeps the centimetre ruler true to size at 100%.

export const PAGE_W = 210
export const PAGE_H = 297
export const MARGIN = 12 // content edge; the print window starts at 10 mm, so the cut lines (1.5 mm out) still print
export const CONTENT_W = PAGE_W - 2 * MARGIN // 186 mm
export const CONTENT_TOP = 21
export const CONTENT_BOTTOM = 279 // the printed window ends at 286 mm; the footer line sits at 284

// 1×n … 10×n — the order of a "כפולות של n" strip.
export const multiples = n => Array.from({ length: 10 }, (_, i) => ({ a: i + 1, b: n, product: (i + 1) * n }))

// Stack strips of the given heights onto pages, top to bottom, with a gap between them.
// Returns an array of pages, each a list of { index, y }.
export function packStrips(heights, { top = CONTENT_TOP, bottom = CONTENT_BOTTOM, gap = 6 } = {}) {
  const pages = []
  let page = [], y = top
  heights.forEach((h, index) => {
    if (page.length && y + h > bottom) { pages.push(page); page = []; y = top }
    page.push({ index, y })
    y += h + gap
  })
  if (page.length) pages.push(page)
  return pages
}

// How many copies of one strip of height h fit on a page.
export const copiesPerPage = (h, { top = CONTENT_TOP, bottom = CONTENT_BOTTOM, gap = 6 } = {}) => Math.max(1, Math.floor((bottom - top + gap) / (h + gap)))

// A ten-frame split: 1–10 → one frame, 11–20 → a full frame (the ten) and a frame with the rest.
export function tenFrames(value) {
  if (value < 0 || value > 20 || !Number.isInteger(value)) throw new RangeError('tenFrames: 0–20 only')
  return value <= 10 ? [value] : [10, value - 10]
}

// 37 → { tens: 3, ones: 7 }; 100 → { hundreds: 1, tens: 0, ones: 0 }
export const baseTen = v => ({ hundreds: Math.floor(v / 100), tens: Math.floor((v % 100) / 10), ones: v % 10 })

// Ruler ticks every millimetre from 0 to `lengthMm`: { mm, kind: 'cm' | 'half' | 'mm', label? }
export function rulerTicks(lengthMm) {
  const out = []
  for (let mm = 0; mm <= lengthMm; mm++) {
    const kind = mm % 10 === 0 ? 'cm' : mm % 5 === 0 ? 'half' : 'mm'
    out.push(kind === 'cm' ? { mm, kind, label: String(mm / 10) } : { mm, kind })
  }
  return out
}

export const RANGES = { 10: { from: 1, to: 10 }, 20: { from: 1, to: 20 }, 100: { from: 1, to: 100 } }
export const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i)
