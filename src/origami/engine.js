// Origami diagram engine: a tiny flat-folding simulator plus a diagram builder.
//
// A model is a list of steps; each step has Hebrew text and one operation. The paper is a stack
// of convex faces (bottom → top). Every face knows which side of the paper is showing
// (c: true = coloured side, false = white side), its crease lines and an optional tag.
// A fold reflects the selected faces that lie on the moving side of the crease line, flips them
// (the other side of the paper now shows) and puts them in front (valley) or behind (mountain).
// Because each diagram is computed from the previous state, the geometry stays consistent from
// step to step, and the tests can check every fold. Diagrams follow the usual convention: each
// step shows the paper BEFORE the action, with the fold line and an arrow.
//
// Operations:
//   { op: 'fold', from, to, sel?, mountain?, tag?, line?, bend?, arrow? }
//       Fold point `from` onto point `to` (the crease is their perpendicular bisector), or fold
//       along `line: [a, b]` moving the side that contains `from`.
//   { op: 'crease', ...same }      fold and unfold — leaves a crease line.
//   { op: 'multi', ops: [...] }    several folds shown in one diagram (e.g. both corners).
//   { op: 'turn' }                 turn the paper over (left ↔ right).
//   { op: 'rotate', deg }          rotate the paper (clockwise on screen).
//   { op: 'set', faces, marks? }   a hand-drawn state (used for 3D or "open it up" steps).
//   { op: 'done', deco? }          the finished model, with optional decorations.
// Selection `sel`: { top: k } | { bottom: k } | { tag } | { notTag } | { tags: [...] } — default: all.

const EPS = 1e-6

export const sub = (a, b) => [a[0] - b[0], a[1] - b[1]]
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]]
export const mul = (a, k) => [a[0] * k, a[1] * k]
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1]
export const cross = (a, b) => a[0] * b[1] - a[1] * b[0]
export const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
const side = (p, a, b) => cross(sub(b, a), sub(p, a))

export function reflect(p, a, b) {
  const d = sub(b, a), t = dot(sub(p, a), d) / dot(d, d)
  const foot = add(a, mul(d, t))
  return sub(mul(foot, 2), p)
}

export function area(poly) {
  let s = 0
  for (let i = 0; i < poly.length; i++) s += cross(poly[i], poly[(i + 1) % poly.length])
  return Math.abs(s) / 2
}

// Keep the part of a convex polygon where sign(side) === keep (keep = 1 or -1).
export function clipPoly(poly, a, b, keep) {
  const out = []
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length]
    const sp = side(p, a, b) * keep, sq = side(q, a, b) * keep
    if (sp >= -EPS) out.push(p)
    if ((sp > EPS && sq < -EPS) || (sp < -EPS && sq > EPS)) {
      const t = sp / (sp - sq)
      out.push(add(p, mul(sub(q, p), t)))
    }
  }
  return dedupe(out)
}

function dedupe(pts) {
  const out = []
  for (const p of pts) if (!out.length || dist(out[out.length - 1], p) > 1e-4) out.push(p)
  if (out.length > 1 && dist(out[0], out[out.length - 1]) <= 1e-4) out.pop()
  return out
}

function clipSeg([p, q], a, b, keep) {
  const sp = side(p, a, b) * keep, sq = side(q, a, b) * keep
  if (sp >= -EPS && sq >= -EPS) return [p, q]
  if (sp < -EPS && sq < -EPS) return null
  const t = sp / (sp - sq), m = add(p, mul(sub(q, p), t))
  return sp >= -EPS ? [p, m] : [m, q]
}

// The part of the infinite line a–b that lies inside a convex polygon (or null).
export function lineInPoly(poly, a, b) {
  const d = sub(b, a)
  let lo = -Infinity, hi = Infinity
  const ccw = signedArea(poly) > 0 ? 1 : -1
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length]
    // inside: ccw * cross(q - p, x - p) >= 0, with x = a + t d
    const e = sub(q, p)
    const num = ccw * cross(e, sub(a, p)), den = ccw * cross(e, d)
    if (Math.abs(den) < EPS) { if (num < -EPS) return null; continue }
    const t = -num / den
    if (den > 0) lo = Math.max(lo, t); else hi = Math.min(hi, t)
  }
  if (hi - lo < 1e-3) return null
  return [add(a, mul(d, lo)), add(a, mul(d, hi))]
}

function signedArea(poly) {
  let s = 0
  for (let i = 0; i < poly.length; i++) s += cross(poly[i], poly[(i + 1) % poly.length])
  return s / 2
}

export function bbox(points) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  for (const [x, y] of points) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y) }
  return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }
}

export const facePoints = faces => faces.flatMap(f => f.pts)

// ── Paper ─────────────────────────────────
export function rectPaper(w, h, coloredUp = false) {
  return [{ pts: [[0, 0], [w, 0], [w, h], [0, h]], c: coloredUp, cr: [], tag: '' }]
}

const cloneFace = f => ({ ...f, pts: f.pts.map(p => [...p]), cr: f.cr.map(s => s.map(p => [...p])) })

// Crease line (a, b) and the sign of the moving side for a fold op.
export function foldLine(o) {
  if (o.line) {
    const [a, b] = o.line
    return { a, b, keep: Math.sign(side(o.from, a, b)) || 1 }
  }
  const m = mul(add(o.from, o.to), 0.5), d = sub(o.to, o.from)
  const a = m, b = add(m, [-d[1], d[0]])
  return { a, b, keep: Math.sign(side(o.from, a, b)) || 1 }
}

function selected(faces, sel, a, b, keep) {
  const onSide = faces.map(f => area(clipPoly(f.pts, a, b, keep)) > 1e-3)
  if (!sel) return onSide
  if (sel.tag != null) return faces.map((f, i) => onSide[i] && f.tag === sel.tag)
  if (sel.tags) return faces.map((f, i) => onSide[i] && sel.tags.includes(f.tag))
  if (sel.notTag != null) return faces.map((f, i) => onSide[i] && f.tag !== sel.notTag)
  const idx = faces.map((_, i) => i).filter(i => onSide[i])
  const pick = new Set(sel.top ? idx.slice(-sel.top) : sel.bottom ? idx.slice(0, sel.bottom) : idx)
  return faces.map((_, i) => pick.has(i))
}

export function applyFold(faces, o) {
  const { a, b, keep } = foldLine(o)
  const sel = selected(faces, o.sel, a, b, keep)
  const stay = [], moved = []
  faces.forEach((f, i) => {
    if (!sel[i]) { stay.push(cloneFace(f)); return }
    const keepPart = clipPoly(f.pts, a, b, -keep), movePart = clipPoly(f.pts, a, b, keep)
    if (area(keepPart) > 1e-3) stay.push({ ...f, pts: keepPart, cr: f.cr.map(s => clipSeg(s, a, b, -keep)).filter(Boolean) })
    if (area(movePart) > 1e-3) {
      moved.push({
        ...f, c: !f.c, tag: o.tag ?? f.tag,
        pts: movePart.map(p => reflect(p, a, b)).reverse(),
        cr: f.cr.map(s => clipSeg(s, a, b, keep)).filter(Boolean).map(s => s.map(p => reflect(p, a, b))),
      })
    }
  })
  if (!moved.length) throw new Error('fold moved nothing')
  moved.reverse()
  if (o.under) {
    // tuck: the moved layers go just under the first face (from the top) carrying this tag
    const at = stay.map(f => f.tag).lastIndexOf(o.under)
    return [...stay.slice(0, at), ...moved, ...stay.slice(at)]
  }
  return o.mountain ? [...moved, ...stay] : [...stay, ...moved]
}

export function applyCrease(faces, o) {
  const { a, b, keep } = foldLine(o)
  const sel = selected(faces, o.sel, a, b, keep)
  return faces.map((f, i) => {
    const g = cloneFace(f)
    if (sel[i]) { const s = lineInPoly(f.pts, a, b); if (s) g.cr.push(s) }
    return g
  })
}

const mapFace = (f, fn) => ({ ...f, pts: f.pts.map(fn), cr: f.cr.map(s => s.map(fn)) })

export function applyTurn(faces) {
  const { cx } = bbox(facePoints(faces))
  return faces.map(f => ({ ...mapFace(f, ([x, y]) => [2 * cx - x, y]), c: !f.c, pts: f.pts.map(([x, y]) => [2 * cx - x, y]).reverse() })).reverse()
}

export function rotatePoint([x, y], deg, [cx, cy]) {
  const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r)
  const dx = x - cx, dy = y - cy
  return [cx + dx * c - dy * s, cy + dx * s + dy * c]
}

export function applyRotate(faces, deg, center) {
  const c = center || (({ cx, cy }) => [cx, cy])(bbox(facePoints(faces)))
  return faces.map(f => mapFace(f, p => rotatePoint(p, deg, c)))
}

const normFaces = faces => faces.map(f => ({ c: true, cr: [], tag: '', ...f }))

export function applyOp(faces, o) {
  switch (o.op) {
    case 'fold': return applyFold(faces, o)
    case 'crease': return applyCrease(faces, o)
    case 'multi': return o.ops.reduce(applyOp, faces)
    case 'turn': return applyTurn(faces)
    case 'rotate': return applyRotate(faces, o.deg, o.center)
    case 'set': return normFaces(o.faces)
    default: return faces
  }
}

// Every state of a model: states[i] is the paper before step i.
export function modelStates(model) {
  const states = [model.paper.map(cloneFace)]
  for (const st of model.steps) states.push(applyOp(states[states.length - 1], st))
  return states
}

// ── Diagram ─────────────────────────────────
// Returns { viewBox, unit, items } — plain data that a React component (or a test, or a preview
// script) turns into SVG. Coordinates are in the model's own units; `unit` is a size that is
// about 1/100 of the drawing, for arrow heads and symbols.

function annotations(faces, o, out) {
  if (o.op === 'multi') { for (const s of o.ops) annotations(faces, s, out); return }
  if (o.op !== 'fold' && o.op !== 'crease') return
  const { a, b, keep } = foldLine(o)
  const sel = selected(faces, o.sel, a, b, keep)
  const segs = faces.map((f, i) => sel[i] ? lineInPoly(f.pts, a, b) : null).filter(Boolean)
  // Merge the pieces into one line from the extreme points along the direction.
  if (segs.length) {
    const d = sub(b, a), ts = segs.flat().map(p => dot(sub(p, a), d) / dot(d, d))
    const lo = Math.min(...ts), hi = Math.max(...ts), ext = 0.06 * dist(add(a, mul(d, lo)), add(a, mul(d, hi)))
    const len = Math.sqrt(dot(d, d)), e = ext / len
    out.push({ t: 'fold', kind: o.mountain ? 'mountain' : 'valley', p: add(a, mul(d, lo - e)), q: add(a, mul(d, hi + e)) })
  }
  const from = o.arrow?.[0] || o.from
  const to = o.arrow?.[1] || (o.to || reflect(o.from, a, b))
  out.push({ t: 'arrow', kind: o.op === 'crease' ? 'unfold' : o.mountain ? 'mountain' : 'valley', p: from, q: to, bend: o.bend ?? 1 })
}

export function arrowGeometry(p, q, bend, unit) {
  const m = mul(add(p, q), 0.5), d = sub(q, p), len = Math.hypot(...d) || 1
  const n = [-d[1] / len, d[0] / len]
  const k = Math.min(0.35 * len, 28 * unit) * bend
  const c = add(m, mul(n, k))
  return { c, path: `M${f(p[0])} ${f(p[1])} Q${f(c[0])} ${f(c[1])} ${f(q[0])} ${f(q[1])}` }
}
const f = v => Math.round(v * 100) / 100

export function buildDiagram(model, i, states = modelStates(model)) {
  const step = model.steps[i]
  const faces = step.op === 'set' ? states[i + 1] : states[i]
  const items = []
  const pts = facePoints(faces)
  const decoPts = (step.deco || []).flatMap(d => d.pts || (d.c ? [d.c] : []))
  const b0 = bbox(pts.length ? pts : decoPts)
  const unit = Math.max(b0.w, b0.h) / 100
  const marks = []
  annotations(faces, step, marks)
  if (step.op === 'set' && step.marks) marks.push(...step.marks)
  const extra = []
  for (const m of marks) {
    if (m.t === 'arrow') { const g = arrowGeometry(m.p, m.q, m.bend, unit); m.c = g.c; m.path = g.path; extra.push(m.p, m.q, g.c) }
    if (m.t === 'fold') extra.push(m.p, m.q)
  }
  for (const face of faces) items.push({ t: 'face', pts: face.pts, c: face.c, cr: face.cr })
  items.push(...marks)
  if (step.op === 'done' && step.deco) items.push(...step.deco)
  if (step.op === 'set' && step.deco) items.push(...step.deco)
  if (step.op === 'turn') items.push({ t: 'symbol', kind: 'turn' })
  if (step.op === 'rotate') items.push({ t: 'symbol', kind: 'rotate', deg: step.deg })
  const bb = bbox([...pts, ...extra, ...decoPts])
  const pad = Math.max(bb.w, bb.h) * 0.07 + 2 * unit
  const symbolSpace = step.op === 'turn' || step.op === 'rotate' ? Math.max(bb.w, bb.h) * 0.22 : 0
  const vb = [bb.x0 - pad - symbolSpace, bb.y0 - pad, bb.w + 2 * pad + symbolSpace, bb.h + 2 * pad]
  return { viewBox: vb.map(f).join(' '), vb, unit: Math.max(vb[2], vb[3]) / 100, items }
}

export function allDiagrams(model) {
  const states = modelStates(model)
  return model.steps.map((_, i) => buildDiagram(model, i, states))
}
