// Tiny SVG builders for math diagrams. Output is a plain markup string (generated only from our own
// numbers — never user input) that the pages inject with dangerouslySetInnerHTML.

const f = x => (Math.round(x * 10) / 10).toString()
const wrap = (w, h, body, label = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(w)} ${f(h)}" width="${f(w)}" height="${f(h)}" role="img"${label ? ` aria-label="${label}"` : ''} font-family="Arial, sans-serif">${body}</svg>`
const text = (x, y, s, size = 14, extra = '', fill = 'currentColor') => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" text-anchor="middle" dominant-baseline="middle" fill="${fill}"${extra}>${s}</text>`

const FILLS = ['#ffd23f', '#7dd3fc', '#f9a8d4', '#86efac', '#c4b5fd', '#fdba74']

// n objects in rows of `perRow` (tens frame style when perRow = 5 or 10).
export function dotsSvg(n, { perRow = 5, kind = 'circle', color = 0 } = {}) {
  const s = 26, rows = Math.max(1, Math.ceil(n / perRow))
  const gap = perRow === 5 ? 1 : 0 // a little gap after every 5 helps counting
  let body = ''
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / perRow), c = i % perRow
    const extra = gap && perRow > 5 && c >= 5 ? 8 : 0
    const x = 14 + c * s + extra, y = 14 + r * s
    body += kind === 'square'
      ? `<rect x="${f(x - 10)}" y="${f(y - 10)}" width="20" height="20" rx="3" fill="${FILLS[color % FILLS.length]}" stroke="currentColor" stroke-width="1.5"/>`
      : `<circle cx="${f(x)}" cy="${f(y)}" r="10" fill="${FILLS[color % FILLS.length]}" stroke="currentColor" stroke-width="1.5"/>`
  }
  const w = 28 + (perRow - 1) * s + (perRow > 5 ? 8 : 0), h = 28 + (rows - 1) * s
  return wrap(w, h, body, `${n} עיגולים`)
}

// `groups` boxes each holding `each` dots (multiplication as repeated addition / equal sharing).
export function groupsSvg(groups, each) {
  const perRow = Math.min(groups, 5), boxW = 18 + Math.min(each, 5) * 16, rowsIn = Math.ceil(each / 5)
  const boxH = 14 + rowsIn * 16, gap = 10
  let body = ''
  for (let g = 0; g < groups; g++) {
    const bx = 4 + (g % perRow) * (boxW + gap), by = 4 + Math.floor(g / perRow) * (boxH + gap)
    body += `<rect x="${f(bx)}" y="${f(by)}" width="${f(boxW)}" height="${f(boxH)}" rx="10" fill="none" stroke="currentColor" stroke-width="1.5"/>`
    for (let i = 0; i < each; i++) {
      const cx = bx + 16 + (i % 5) * 16, cy = by + 15 + Math.floor(i / 5) * 16
      body += `<circle cx="${f(cx)}" cy="${f(cy)}" r="6" fill="${FILLS[g % FILLS.length]}" stroke="currentColor" stroke-width="1"/>`
    }
  }
  const rows = Math.ceil(groups / perRow)
  return wrap(8 + perRow * (boxW + gap) - gap, 8 + rows * (boxH + gap) - gap, body, `${groups} קבוצות של ${each}`)
}

// rows × cols array of squares (multiplication as an area).
export function arraySvg(rows, cols) {
  const s = Math.min(22, Math.floor(220 / Math.max(rows, cols)))
  let body = ''
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) body += `<rect x="${f(4 + c * s)}" y="${f(4 + r * s)}" width="${f(s - 3)}" height="${f(s - 3)}" rx="3" fill="#7dd3fc" stroke="currentColor" stroke-width="1"/>`
  return wrap(8 + cols * s, 8 + rows * s, body, `${rows} שורות של ${cols}`)
}

// Base-ten blocks: hundreds (flats), tens (rods), ones (cubes).
export function baseTenSvg(h, t, o) {
  let body = '', x = 4
  for (let i = 0; i < h; i++) {
    body += `<rect x="${x}" y="4" width="60" height="60" fill="#ffd23f" stroke="currentColor" stroke-width="1.5"/>`
    for (let k = 1; k < 10; k++) body += `<line x1="${x + k * 6}" y1="4" x2="${x + k * 6}" y2="64" stroke="currentColor" stroke-width=".4"/><line x1="${x}" y1="${4 + k * 6}" x2="${x + 60}" y2="${4 + k * 6}" stroke="currentColor" stroke-width=".4"/>`
    x += 68
  }
  for (let i = 0; i < t; i++) {
    body += `<rect x="${x}" y="4" width="8" height="60" fill="#86efac" stroke="currentColor" stroke-width="1.2"/>`
    for (let k = 1; k < 10; k++) body += `<line x1="${x}" y1="${4 + k * 6}" x2="${x + 8}" y2="${4 + k * 6}" stroke="currentColor" stroke-width=".4"/>`
    x += 12
  }
  if (t) x += 4
  for (let i = 0; i < o; i++) body += `<rect x="${x + (i % 5) * 11}" y="${i < 5 ? 42 : 54}" width="9" height="9" fill="#f9a8d4" stroke="currentColor" stroke-width="1"/>`
  if (o) x += Math.min(o, 5) * 11
  return wrap(Math.max(x + 4, 40), 68, body, `${h} מאות, ${t} עשרות, ${o} יחידות`)
}

// Regular-ish named shapes for "which shape is it" questions.
export function shapeSvg(kind, color = 0) {
  const fill = FILLS[color % FILLS.length], st = `fill="${fill}" stroke="currentColor" stroke-width="3" stroke-linejoin="round"`
  const poly = pts => `<polygon points="${pts.map(p => p.map(f).join(',')).join(' ')}" ${st}/>`
  const reg = (n, r = 62, rot = -Math.PI / 2) => Array.from({ length: n }, (_, i) => [80 + r * Math.cos(rot + (2 * Math.PI * i) / n), 75 + r * Math.sin(rot + (2 * Math.PI * i) / n)])
  const body = {
    circle: `<circle cx="80" cy="75" r="60" ${st}/>`,
    triangle: poly(reg(3, 66, -Math.PI / 2).map(([x, y]) => [x, y + 10])),
    square: poly([[25, 20], [135, 20], [135, 130], [25, 130]]),
    rectangle: poly([[8, 40], [152, 40], [152, 112], [8, 112]]),
    pentagon: poly(reg(5)),
    hexagon: poly(reg(6, 62, 0)),
    trapezoid: poly([[45, 30], [115, 30], [152, 120], [8, 120]]),
    rhombus: poly([[80, 8], [140, 75], [80, 142], [20, 75]]),
    octagon: poly(reg(8, 62, Math.PI / 8)),
  }[kind]
  return wrap(160, 150, body)
}

// Any polygon from vertices, with optional side labels placed outside each edge.
export function polygonSvg(pts, labels = [], { color = 1, w = 220, h = 170 } = {}) {
  const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length, cy = pts.reduce((s, p) => s + p[1], 0) / pts.length
  let body = `<polygon points="${pts.map(p => p.map(f).join(',')).join(' ')}" fill="${FILLS[color % FILLS.length]}" fill-opacity=".55" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>`
  labels.forEach((lab, i) => {
    if (lab === '' || lab == null) return
    const a = pts[i], b = pts[(i + 1) % pts.length]
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2
    let nx = mx - cx, ny = my - cy
    const len = Math.hypot(nx, ny) || 1
    nx /= len; ny /= len
    body += text(mx + nx * 14, my + ny * 12, lab, 14, ' font-weight="700"')
  })
  return wrap(w, h, body)
}

// A w × h rectangle drawn on a square grid (units = grid squares) for perimeter/area questions.
export function gridRectSvg(w, h, { label = false } = {}) {
  const s = Math.min(24, Math.floor(200 / Math.max(w + 2, h + 2)))
  const W = (w + 2) * s, H = (h + 2) * s
  let body = ''
  for (let i = 0; i <= w + 2; i++) body += `<line x1="${i * s}" y1="0" x2="${i * s}" y2="${H}" stroke="#c9cdd8" stroke-width="1"/>`
  for (let j = 0; j <= h + 2; j++) body += `<line x1="0" y1="${j * s}" x2="${W}" y2="${j * s}" stroke="#c9cdd8" stroke-width="1"/>`
  body += `<rect x="${s}" y="${s}" width="${w * s}" height="${h * s}" fill="#ffd23f" fill-opacity=".45" stroke="currentColor" stroke-width="3"/>`
  if (label) body += text(s + (w * s) / 2, s / 2, String(w), 12, ' font-weight="700"') + text(W - s / 2, s + (h * s) / 2, String(h), 12, ' font-weight="700"')
  return wrap(W, H, body, `מלבן ${w} על ${h} משבצות`)
}

// Analog clock showing h:m (m multiple of 5).
export function clockSvg(h, m) {
  let body = `<circle cx="80" cy="80" r="72" fill="#fff" stroke="currentColor" stroke-width="4"/>`
  for (let i = 1; i <= 12; i++) {
    const a = (i * Math.PI) / 6 - Math.PI / 2
    body += text(80 + 56 * Math.cos(a), 81 + 56 * Math.sin(a), String(i), 15, ' font-weight="700"')
  }
  for (let i = 0; i < 60; i++) {
    const a = (i * Math.PI) / 30, r1 = i % 5 ? 68 : 64
    body += `<line x1="${f(80 + r1 * Math.sin(a))}" y1="${f(80 - r1 * Math.cos(a))}" x2="${f(80 + 72 * Math.sin(a))}" y2="${f(80 - 72 * Math.cos(a))}" stroke="currentColor" stroke-width="${i % 5 ? 0.8 : 2}"/>`
  }
  const ha = (((h % 12) + m / 60) * Math.PI) / 6, ma = (m * Math.PI) / 30
  body += `<line x1="80" y1="80" x2="${f(80 + 36 * Math.sin(ha))}" y2="${f(80 - 36 * Math.cos(ha))}" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>`
  body += `<line x1="80" y1="80" x2="${f(80 + 54 * Math.sin(ma))}" y2="${f(80 - 54 * Math.cos(ma))}" stroke="#d33" stroke-width="3.5" stroke-linecap="round"/>`
  body += `<circle cx="80" cy="80" r="5" fill="currentColor"/>`
  return wrap(160, 160, body, 'שעון')
}

// A whole split into `parts` equal pieces with `shaded` of them coloured — circle or bar.
export function fractionSvg(parts, shaded, kind = 'circle') {
  let body = ''
  if (kind === 'bar') {
    const W = 220, w = W / parts
    for (let i = 0; i < parts; i++) body += `<rect x="${f(4 + i * w)}" y="10" width="${f(w)}" height="56" fill="${i < shaded ? '#7dd3fc' : '#fff'}" stroke="currentColor" stroke-width="2"/>`
    return wrap(W + 8, 76, body, `${shaded} מתוך ${parts} חלקים צבועים`)
  }
  if (parts === 1) body = `<circle cx="80" cy="80" r="70" fill="${shaded ? '#7dd3fc' : '#fff'}" stroke="currentColor" stroke-width="2"/>`
  for (let i = 0; parts > 1 && i < parts; i++) {
    const a0 = (2 * Math.PI * i) / parts - Math.PI / 2, a1 = (2 * Math.PI * (i + 1)) / parts - Math.PI / 2
    const x0 = 80 + 70 * Math.cos(a0), y0 = 80 + 70 * Math.sin(a0), x1 = 80 + 70 * Math.cos(a1), y1 = 80 + 70 * Math.sin(a1)
    body += `<path d="M80,80 L${f(x0)},${f(y0)} A70,70 0 ${parts === 2 ? 0 : 0},1 ${f(x1)},${f(y1)} Z" fill="${i < shaded ? '#7dd3fc' : '#fff'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`
  }
  return wrap(160, 160, body, `${shaded} מתוך ${parts} חלקים צבועים`)
}

// An angle of `deg` degrees with a marker (square for 90°).
export function angleSvg(deg, rot = 0) {
  const r = (rot * Math.PI) / 180, a = r - (deg * Math.PI) / 180
  const ox = deg > 120 ? 120 : 60, oy = 130
  const x1 = ox + 100 * Math.cos(r), y1 = oy + 100 * Math.sin(r)
  const x2 = ox + 100 * Math.cos(a), y2 = oy + 100 * Math.sin(a)
  let mark
  if (deg === 90) {
    const ux = Math.cos(r) * 16, uy = Math.sin(r) * 16, vx = Math.cos(a) * 16, vy = Math.sin(a) * 16
    mark = `<path d="M${f(ox + ux)},${f(oy + uy)} L${f(ox + ux + vx)},${f(oy + uy + vy)} L${f(ox + vx)},${f(oy + vy)}" fill="none" stroke="#d33" stroke-width="2"/>`
  } else {
    const ax = ox + 26 * Math.cos(r), ay = oy + 26 * Math.sin(r), bx = ox + 26 * Math.cos(a), by = oy + 26 * Math.sin(a)
    mark = `<path d="M${f(ax)},${f(ay)} A26,26 0 ${deg > 180 ? 1 : 0},0 ${f(bx)},${f(by)}" fill="none" stroke="#d33" stroke-width="2"/>`
  }
  const body = `<line x1="${ox}" y1="${oy}" x2="${f(x1)}" y2="${f(y1)}" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="${ox}" y1="${oy}" x2="${f(x2)}" y2="${f(y2)}" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>${mark}<circle cx="${ox}" cy="${oy}" r="3.5" fill="currentColor"/>`
  return wrap(240, 150, body, 'זווית')
}

// A ruler (cm) with a coloured strip from 0 to `len` for "how long is it" questions.
export function rulerSvg(len, max = 15) {
  const u = Math.min(20, 228 / max), W = 12 + max * u
  let body = `<rect x="${f(6 + 0)}" y="14" width="${f(len * u)}" height="16" rx="4" fill="#f9a8d4" stroke="currentColor" stroke-width="1.5"/>`
  body += `<rect x="2" y="38" width="${f(W - 4)}" height="34" rx="4" fill="#fff6d1" stroke="currentColor" stroke-width="1.5"/>`
  for (let i = 0; i <= max; i++) {
    body += `<line x1="${f(6 + i * u)}" y1="38" x2="${f(6 + i * u)}" y2="${50}" stroke="currentColor" stroke-width="1.2"/>`
    body += text(6 + i * u, 61, String(i), 10)
    if (i < max) body += `<line x1="${f(6 + (i + 0.5) * u)}" y1="38" x2="${f(6 + (i + 0.5) * u)}" y2="44" stroke="currentColor" stroke-width=".7"/>`
  }
  return wrap(W, 76, body, 'סרגל')
}

// Number line from a to b with tick labels every `step`, and a marker at `mark` labelled '?'.
export function numberLineSvg(a, b, step, mark) {
  const W = 236, x = v => 10 + ((v - a) / (b - a)) * (W - 20)
  let body = `<line x1="6" y1="40" x2="${W - 6}" y2="40" stroke="currentColor" stroke-width="2"/>`
  for (let v = a; v <= b; v += step) {
    body += `<line x1="${f(x(v))}" y1="33" x2="${f(x(v))}" y2="47" stroke="currentColor" stroke-width="1.5"/>`
    if (v === a || v === b) body += text(x(v), 60, String(v), 11)
  }
  body += `<path d="M${f(x(mark))},30 l-6,-10 h12 z" fill="#d33"/>` + text(x(mark), 12, '?', 13, ' font-weight="700"', '#d33')
  return wrap(W, 70, body, 'ישר מספרים')
}
