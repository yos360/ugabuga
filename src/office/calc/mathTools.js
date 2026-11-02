// /tools/calculator school tabs — pure logic: fractions, equation solver, statistics, units, percent.
import { evaluate, toFraction, gcd, formatDecimal, exactForm, exactText, isNiceExact } from './calcEngine.js'

export const lcm = (a, b) => Math.abs(a / gcd(a, b) * b)
export const fmt = v => formatDecimal(v).text

// ── rationals { n, d } (d > 0, reduced) ──
export function rat(n, d = 1) {
  if (d === 0) throw new Error('חלוקה באפס')
  if (d < 0) { n = -n; d = -d }
  const g = gcd(n, d) || 1
  return { n: n / g, d: d / g }
}
export const add = (x, y) => { const L = lcm(x.d, y.d); return rat(x.n * (L / x.d) + y.n * (L / y.d), L) }
export const sub = (x, y) => add(x, { n: -y.n, d: y.d })
export const mul = (x, y) => rat(x.n * y.n, x.d * y.d)
export const div = (x, y) => { if (y.n === 0) throw new Error('חלוקה באפס'); return rat(x.n * y.d, x.d * y.n) }
export const ratValue = x => x.n / x.d
export function ratText(x, mixed = false) {
  const sg = x.n < 0 ? '−' : ''
  const n = Math.abs(x.n)
  if (x.d === 1) return sg + n
  if (mixed && n > x.d) return `${sg}${Math.floor(n / x.d)} ${n % x.d}/${x.d}`
  return `${sg}${n}/${x.d}`
}
/** Number → rational when it is one (0.25 → 1/4, 1/3 as float → 1/3), else null. */
export function toRat(v, maxDen = 100000) {
  const f = toFraction(v, maxDen, 1e-12)
  return f ? rat(f[0], f[1]) : null
}

/** Parse a field with the calculator engine: "1/2", "√2", "−3", "2π" … → number or null; "" → fallback. */
export function readNum(src, fallback = null) {
  if (src == null || String(src).trim() === '') return fallback
  const r = evaluate(String(src).replace(/,/g, '.'), { angle: 'deg' })
  return r.ok ? r.value : null
}

// ── fractions tab ──
/** Mixed number from parts (whole, numerator, denominator) → rational, or null if invalid. */
export function mixedToRat(whole, num, den) {
  const w = whole === '' || whole == null ? 0 : Number(whole)
  const n = num === '' || num == null ? 0 : Number(num)
  const d = den === '' || den == null ? 1 : Number(den)
  if (![w, n, d].every(Number.isInteger) || d === 0) return null
  const sign = w < 0 || (w === 0 && n * d < 0) ? -1 : 1
  return rat(sign * (Math.abs(w) * Math.abs(d) + Math.abs(n)), Math.abs(d))
}
/** a op b with readable steps. op: + − × ÷ */
export function fractionOp(a, b, op) {
  const steps = []
  let r
  if (op === '+' || op === '−') {
    const L = lcm(a.d, b.d)
    const an = a.n * (L / a.d); const bn = b.n * (L / b.d)
    if (a.d !== b.d) steps.push(`מכנה משותף ${L}: ${ratText(a)} = ${an}/${L},  ${ratText(b)} = ${bn}/${L}`)
    const top = op === '+' ? an + bn : an - bn
    steps.push(`${op === '+' ? 'מחברים' : 'מחסרים'} מונים: ${an} ${op} ${bn < 0 ? `(${bn})` : bn} = ${top}, ולכן ${top}/${L}`)
    r = rat(top, L)
  } else if (op === '×') {
    steps.push(`מונה כפול מונה ומכנה כפול מכנה: (${a.n}×${b.n})/(${a.d}×${b.d}) = ${a.n * b.n}/${a.d * b.d}`)
    r = mul(a, b)
  } else {
    if (b.n === 0) return { error: 'אי אפשר לחלק באפס' }
    steps.push(`חילוק בשבר = כפל בהופכי: ${ratText(a)} × ${b.d}/${b.n}`)
    r = div(a, b)
  }
  steps.push(`מצמצמים: ${ratText(r)}${Math.abs(r.n) > r.d && r.d > 1 ? ` = ${ratText(r, true)}` : ''}`)
  return { result: r, steps }
}

// ── equation solver ──
function exactOrDecimal(v) {
  const x = exactForm(v)
  return x && (isNiceExact(x) || x.den === 1) ? exactText(x) : fmt(v)
}

/** ax + b = c */
export function solveLinear(a, b, c) {
  if (a === 0) return b === c ? { kind: 'all', steps: [`${fmt(b)} = ${fmt(c)} תמיד נכון`] } : { kind: 'none', steps: [`${fmt(b)} ≠ ${fmt(c)}`] }
  const x = (c - b) / a
  return {
    kind: 'one', roots: [x], exact: [exactOrDecimal(x)],
    steps: [`מעבירים אגף: ${fmt(a)}x = ${fmt(c)} − ${fmt(b)} = ${fmt(c - b)}`, `מחלקים ב־${fmt(a)}: x = ${exactOrDecimal(x)}`],
  }
}

function surdParts(r) { // √(P/Q) = k√m / Q
  let k = 1; let m = r.n * r.d
  for (let i = 2; i * i <= m; i++) while (m % (i * i) === 0) { m /= i * i; k *= i }
  return { k, m, q: r.d }
}

/** ax² + bx + c = 0 — discriminant, both roots (exact when the coefficients are rational), vertex. */
export function solveQuadratic(a, b, c) {
  if (a === 0) return { ...solveLinear(b, c, 0), linear: true }
  const D = b * b - 4 * a * c
  const vx = -b / (2 * a)
  const vertex = [vx, a * vx * vx + b * vx + c]
  const steps = [`Δ = b² − 4ac = ${fmt(b)}² − 4·${fmt(a)}·${fmt(c)} = ${fmt(D)}`]
  const ra = toRat(a); const rb = toRat(b); const rc = toRat(c)
  const exactOk = ra && rb && rc && Math.abs(ra.n) < 1e6 && Math.abs(rb.n) < 1e6 && Math.abs(rc.n) < 1e6
  if (D < -1e-12 * Math.max(1, b * b)) {
    steps.push('Δ < 0 — אין פתרונות ממשיים (הפרבולה לא חותכת את ציר x)')
    return { kind: 'none', D, vertex, steps }
  }
  if (Math.abs(D) <= 1e-12 * Math.max(1, b * b)) {
    steps.push(`Δ = 0 — פתרון אחד: x = −b / 2a = ${exactOrDecimal(vx)}`)
    return { kind: 'one', D: 0, roots: [vx], exact: [exactOk ? ratText(rat(-rb.n * ra.d, 2 * rb.d * ra.n)) : exactOrDecimal(vx)], vertex, steps }
  }
  const sq = Math.sqrt(D)
  const r1 = (-b - sq) / (2 * a); const r2 = (-b + sq) / (2 * a)
  const roots = [Math.min(r1, r2), Math.max(r1, r2)]
  let exact = roots.map(exactOrDecimal)
  if (exactOk) {
    const rD = sub(mul(rb, rb), mul(rat(4), mul(ra, rc)))
    const p1 = div(rat(-rb.n, rb.d), mul(rat(2), ra))
    const { k, m, q } = surdParts(rD)
    const p2 = rat(Math.abs(k * ra.d), Math.abs(q * 2 * ra.n))
    if (m === 1) exact = [sub(p1, p2), add(p1, p2)].map(x => ratText(x))
    else {
      const Dn = lcm(p1.d, p2.d)
      const A = p1.n * (Dn / p1.d); const B = p2.n * (Dn / p2.d)
      const surd = `${B === 1 ? '' : B}√${m}`
      const one = sgn => A === 0 ? `${sgn === '−' ? '−' : ''}${surd}${Dn > 1 ? '/' + Dn : ''}` : (Dn > 1 ? `(${A} ${sgn} ${surd})/${Dn}` : `${A} ${sgn} ${surd}`)
      exact = [one('−'), one('+')]
    }
    steps.push(`√Δ = ${m === 1 ? ratText(rat(k, q)) : `${k === 1 ? '' : k}√${m}${q > 1 ? '/' + q : ''}`}`)
  } else steps.push(`√Δ ≈ ${fmt(sq)}`)
  steps.push(`x₁,₂ = (−b ± √Δ) / 2a = (${fmt(-b)} ± √${fmt(D)}) / ${fmt(2 * a)}`)
  return { kind: 'two', D, roots, exact, vertex, steps }
}

/** a1x + b1y = c1, a2x + b2y = c2 (Cramer) */
export function solve2x2(a1, b1, c1, a2, b2, c2) {
  const det = a1 * b2 - a2 * b1
  if (Math.abs(det) < 1e-12) {
    const consistent = Math.abs(a1 * c2 - a2 * c1) < 1e-12 && Math.abs(b1 * c2 - b2 * c1) < 1e-12
    return { kind: consistent ? 'all' : 'none', det: 0 }
  }
  const x = (c1 * b2 - c2 * b1) / det; const y = (a1 * c2 - a2 * c1) / det
  return {
    kind: 'one', det, x, y, exact: [exactOrDecimal(x), exactOrDecimal(y)],
    steps: [`דטרמיננטה: ${fmt(a1)}·${fmt(b2)} − ${fmt(a2)}·${fmt(b1)} = ${fmt(det)}`, `x = ${fmt(c1 * b2 - c2 * b1)} / ${fmt(det)}`, `y = ${fmt(a1 * c2 - a2 * c1)} / ${fmt(det)}`],
  }
}

// ── statistics ──
/** "1, 2.5; 3 4\n−5" → [1, 2.5, 3, 4, −5]; bad items reported. */
export function parseList(text) {
  const items = String(text).replace(/−/g, '-').split(/[\s,;]+/).filter(Boolean)
  const nums = []; const bad = []
  for (const it of items) { const v = Number(it); if (Number.isFinite(v)) nums.push(v); else bad.push(it) }
  return { nums, bad }
}
function medianOf(s) {
  const n = s.length
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
}
/** Descriptive statistics. Quartiles: median of each half (the middle value excluded when n is odd). */
export function stats(nums) {
  const n = nums.length
  if (!n) return null
  const s = [...nums].sort((a, b) => a - b)
  const sum = s.reduce((a, b) => a + b, 0)
  const mean = sum / n
  const ss = s.reduce((a, b) => a + (b - mean) ** 2, 0)
  const freq = new Map()
  for (const v of s) freq.set(v, (freq.get(v) || 0) + 1)
  const top = Math.max(...freq.values())
  const modes = top > 1 ? [...freq].filter(([, f]) => f === top).map(([v]) => v) : []
  const lower = s.slice(0, Math.floor(n / 2)); const upper = s.slice(Math.ceil(n / 2))
  const q1 = n > 1 ? medianOf(lower) : s[0]; const q3 = n > 1 ? medianOf(upper) : s[0]
  const clean = v => Number(v.toPrecision(12))
  return {
    n, sum: clean(sum), mean: clean(mean), median: medianOf(s), modes, modeCount: top,
    min: s[0], max: s[n - 1], range: clean(s[n - 1] - s[0]),
    varP: clean(ss / n), sdP: clean(Math.sqrt(ss / n)),
    varS: n > 1 ? clean(ss / (n - 1)) : null, sdS: n > 1 ? clean(Math.sqrt(ss / (n - 1))) : null,
    q1, q3, iqr: clean(q3 - q1), sorted: s, freq: [...freq],
  }
}

// ── units ──
export const UNITS = {
  angle: { label: 'זוויות', units: { deg: ['מעלות °', Math.PI / 180], rad: ['רדיאנים', 1], grad: ['גראד', Math.PI / 200], turn: ['סיבובים', 2 * Math.PI] } },
  length: { label: 'אורך', units: { mm: ['מ״מ', 0.001], cm: ['ס״מ', 0.01], m: ['מטר', 1], km: ['ק״מ', 1000], inch: ['אינץ׳', 0.0254], ft: ['רגל', 0.3048], mile: ['מייל', 1609.344] } },
  mass: { label: 'משקל', units: { g: ['גרם', 0.001], kg: ['ק״ג', 1], t: ['טון', 1000], lb: ['פאונד', 0.45359237], oz: ['אונקיה', 0.028349523125] } },
  time: { label: 'זמן', units: { s: ['שניות', 1], min: ['דקות', 60], h: ['שעות', 3600], day: ['ימים', 86400], week: ['שבועות', 604800] } },
  area: { label: 'שטח', units: { cm2: ['סמ״ר', 1e-4], m2: ['מ״ר', 1], dunam: ['דונם', 1000], km2: ['קמ״ר', 1e6] } },
  temp: { label: 'טמפרטורה', units: { c: ['צלזיוס °C', null], f: ['פרנהייט °F', null], k: ['קלווין K', null] } },
}
export function convertUnit(cat, v, from, to) {
  if (cat === 'temp') {
    const c = from === 'c' ? v : from === 'f' ? (v - 32) * 5 / 9 : v - 273.15
    return to === 'c' ? c : to === 'f' ? c * 9 / 5 + 32 : c + 273.15
  }
  const u = UNITS[cat].units
  return v * u[from][1] / u[to][1]
}
/** Radians as a multiple of π when it is a simple one: 0.5235… → "π/6". */
export function radAsPi(r) {
  const f = toFraction(r / Math.PI, 360, 1e-10)
  if (!f) return null
  const [p, q] = f
  if (p === 0) return '0'
  const top = `${p < 0 ? '−' : ''}${Math.abs(p) === 1 ? '' : Math.abs(p)}π`
  return q === 1 ? top : `${top}/${q}`
}
/** Decimal degrees → 12°30′15″ */
export function toDMS(deg) {
  const sg = deg < 0 ? '−' : ''
  let a = Math.abs(deg)
  let d = Math.floor(a); a = (a - d) * 60
  let m = Math.floor(a); let s = Math.round((a - m) * 60 * 100) / 100
  if (s >= 60) { s -= 60; m++ }
  if (m >= 60) { m -= 60; d++ }
  return `${sg}${d}°${m}′${s}″`
}

// ── graph helpers ──
/** Zeros of f on [a, b]: sign changes (bisection) and touching zeros (like x² at 0). */
export function findZeros(f, a, b, n = 800) {
  const out = []
  const h = (b - a) / n
  const xs = Array.from({ length: n + 1 }, (_, i) => a + i * h)
  const ys = xs.map(x => f(x))
  const tidy = x => { const r = Math.round(x); return Math.abs(x - r) < 1e-9 ? r : Number(x.toPrecision(10)) }
  const push = x => { if (!out.some(o => Math.abs(o - x) < h / 2)) out.push(tidy(x)) }
  for (let i = 0; i < n; i++) {
    const y0 = ys[i]; const y1 = ys[i + 1]
    if (!Number.isFinite(y0) || !Number.isFinite(y1)) continue
    if (y0 === 0) { push(xs[i]); continue }
    if (y0 * y1 < 0) {
      let lo = xs[i]; let hi = xs[i + 1]; let flo = y0
      for (let k = 0; k < 70; k++) {
        const m = (lo + hi) / 2; const fm = f(m)
        if (!Number.isFinite(fm)) break
        if (fm === 0) { lo = hi = m; break }
        if (flo * fm < 0) hi = m; else { lo = m; flo = fm }
      }
      const r = (lo + hi) / 2
      if (Math.abs(f(r)) < 1e-6) push(r)
    } else if (i > 0 && Number.isFinite(ys[i - 1]) && Math.abs(y0) < Math.abs(ys[i - 1]) && Math.abs(y0) <= Math.abs(y1) && Math.sign(y0) === Math.sign(ys[i - 1])) {
      // local minimum of |f| — a zero that only touches the axis?
      let lo = xs[i - 1]; let hi = xs[i + 1]
      for (let k = 0; k < 80; k++) {
        const m1 = lo + (hi - lo) / 3; const m2 = hi - (hi - lo) / 3
        if (Math.abs(f(m1)) < Math.abs(f(m2))) hi = m2; else lo = m1
      }
      const r = (lo + hi) / 2
      if (Math.abs(f(r)) < 1e-8) push(r)
    }
  }
  return out.sort((p, q) => p - q)
}

// ── percent ──
export const percentOf = (p, x) => p * x / 100
export const whatPercent = (a, b) => (b === 0 ? null : a / b * 100)
export const percentChange = (a, b) => (a === 0 ? null : (b - a) / Math.abs(a) * 100)
