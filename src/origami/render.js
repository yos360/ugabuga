// Turns a diagram from engine.buildDiagram into SVG through a hyperscript factory `h(tag, attrs,
// ...children)` — React.createElement on the site, a string builder in the preview script.
import { sub, add, mul } from './engine.js'

const r2 = v => Math.round(v * 100) / 100
const P = pts => pts.map(p => `${r2(p[0])},${r2(p[1])}`).join(' ')
const INK = '#26324a'
const NS = { vectorEffect: 'non-scaling-stroke' }

function head(h, tip, from, u, kind, key) {
  const d = sub(tip, from), len = Math.hypot(...d) || 1, e = [d[0] / len, d[1] / len], n = [-e[1], e[0]]
  const L = 5 * u, W = 2.6 * u
  const base = sub(tip, mul(e, L))
  const pts = [tip, add(base, mul(n, W)), add(base, mul(n, -W))]
  return h('polygon', { key, points: P(pts), fill: kind === 'hollow' ? '#fff' : INK, stroke: INK, strokeWidth: 1.3, strokeLinejoin: 'round', ...NS })
}

function symbol(h, it, vb, u, key) {
  // A circular arrow in the empty strip on the left of the drawing.
  const x = vb[0] + 13 * u, y = vb[1] + vb[3] / 2, r = 8 * u
  const arc = `M${r2(x + r)} ${r2(y)} A${r2(r)} ${r2(r)} 0 1 1 ${r2(x)} ${r2(y - r)}`
  const tip = [x, y - r], from = [x + r * 0.55, y - r * 1.02]
  const label = it.kind === 'turn' ? 'הופכים' : `${Math.abs(it.deg)}°`
  const flip = it.kind === 'rotate' && it.deg < 0
  return h('g', { key, transform: flip ? `translate(${r2(2 * x)} 0) scale(-1 1)` : undefined },
    h('path', { d: arc, fill: 'none', stroke: INK, strokeWidth: 2, ...NS }),
    head(h, tip, from, u * 1.2, 'solid', 'h'),
    it.kind === 'turn' ? h('path', { d: `M${r2(x - r * 0.45)} ${r2(y + r * 0.1)} l${r2(r * 0.45)} ${r2(-r * 0.55)} l${r2(r * 0.45)} ${r2(r * 0.55)}`, fill: 'none', stroke: INK, strokeWidth: 1.5, ...NS }) : null,
    h('text', { x: r2(x), y: r2(y + r + 7 * u), fontSize: r2(5.5 * u), textAnchor: 'middle', fill: INK, fontWeight: 700, direction: 'rtl', transform: flip ? `translate(${r2(2 * x)} 0) scale(-1 1)` : undefined }, label))
}

export function renderDiagram(h, dg, { color = '#fb923c', label } = {}) {
  const u = dg.unit
  const kids = []
  dg.items.forEach((it, i) => {
    if (it.t === 'face') {
      kids.push(h('polygon', { key: `f${i}`, points: P(it.pts), fill: it.c ? color : '#ffffff', stroke: INK, strokeWidth: 1.4, strokeLinejoin: 'round', ...NS }))
      it.cr.forEach((s, j) => kids.push(h('line', { key: `c${i}-${j}`, x1: r2(s[0][0]), y1: r2(s[0][1]), x2: r2(s[1][0]), y2: r2(s[1][1]), stroke: it.c ? '#00000055' : '#94a3b8', strokeWidth: 0.9, ...NS })))
    } else if (it.t === 'fold') {
      kids.push(h('line', { key: `l${i}`, x1: r2(it.p[0]), y1: r2(it.p[1]), x2: r2(it.q[0]), y2: r2(it.q[1]), stroke: it.kind === 'mountain' ? '#b91c1c' : '#1d4ed8', strokeWidth: 2, strokeDasharray: it.kind === 'mountain' ? '9 3 2 3 2 3' : '7 4', strokeLinecap: 'butt', ...NS }))
    } else if (it.t === 'arrow') {
      kids.push(h('path', { key: `a${i}`, d: it.path, fill: 'none', stroke: INK, strokeWidth: 1.6, ...NS }))
      kids.push(head(h, it.q, it.c, u, it.kind === 'mountain' ? 'hollow' : 'solid', `ah${i}`))
      if (it.kind === 'unfold') kids.push(head(h, it.p, it.c, u, 'hollow', `at${i}`))
    } else if (it.t === 'symbol') {
      kids.push(symbol(h, it, dg.vb, u, `s${i}`))
    } else if (it.t === 'circle') {
      kids.push(h('circle', { key: `d${i}`, cx: it.c[0], cy: it.c[1], r: it.r, fill: it.fill || INK, stroke: it.stroke || 'none', strokeWidth: it.stroke ? 1.2 : 0, ...NS }))
    } else if (it.t === 'path') {
      kids.push(h('path', { key: `d${i}`, d: it.d, fill: it.fill || 'none', stroke: it.stroke || INK, strokeWidth: it.w || 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', strokeDasharray: it.dash, ...NS }))
    } else if (it.t === 'poly') {
      kids.push(h('polygon', { key: `d${i}`, points: P(it.pts), fill: it.fill === 'paper' ? color : it.fill || '#fff', stroke: INK, strokeWidth: it.w || 1.4, strokeLinejoin: 'round', ...NS }))
    }
  })
  return h('svg', { viewBox: dg.viewBox, xmlns: 'http://www.w3.org/2000/svg', role: 'img', 'aria-label': label, className: 'ori-svg' }, ...kids)
}
