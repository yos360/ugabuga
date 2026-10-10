// /math grades 7–9 (חטיבת ביניים): topic metadata + every generator × 500 seeds × 3 levels, with answers
// recomputed independently (plugging roots back in, re-expanding factored forms, brute-force probability…).
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { createRng } = await import('../src/math/rng.js')
const { checkAnswer, formatAnswer, normalizeInput } = await import('../src/math/check.js')
const grade7 = (await import('../src/math/topics/grade7.js')).default
const grade8 = (await import('../src/math/topics/grade8.js')).default
const grade9 = (await import('../src/math/topics/grade9.js')).default

const SEEDS = 500
const STRANDS = ['arithmetic', 'geometry', 'algebra', 'fractions', 'measurement', 'data', 'probability', 'functions', 'trigonometry', 'calculus', 'sequences', 'vectors']
const TYPES = ['number', 'fraction', 'numbers', 'choice', 'text']

// ---------- a tiny expression evaluator for the math strings the generators print ----------
const SUPS = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', 'ⁿ': 'n' }
function tokenize(s) {
  s = s.replace(/[−–]/g, '-').replace(/[×·]/g, '*').replace(/÷/g, '/').replace(/[⁻⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ]+/g, m => '^(' + [...m].map(c => SUPS[c]).join('') + ')')
  const out = []
  for (let i = 0; i < s.length;) {
    const c = s[i]
    if (c === ' ') { i++; continue }
    const m = s.slice(i).match(/^\d+(\.\d+)?/)
    if (m) { out.push({ t: 'num', v: Number(m[0]) }); i += m[0].length; continue }
    if ('+-*/^()√'.includes(c)) { out.push({ t: c }); i++; continue }
    if (/[a-z]/.test(c)) { out.push({ t: 'var', v: c }); i++; continue }
    throw new Error(`bad char ${c} in ${s}`)
  }
  return out
}
function evaluate(str, vars = {}) {
  const tk = tokenize(str)
  let p = 0
  const peek = () => tk[p], eat = t => { if (!tk[p] || tk[p].t !== t) throw new Error(`expected ${t} in ${str}`); p++ }
  const startsAtom = x => x && (x.t === 'num' || x.t === 'var' || x.t === '(' || x.t === '√')
  function expr() { let v = term(); while (peek() && (peek().t === '+' || peek().t === '-')) { const o = tk[p++].t; const w = term(); v = o === '+' ? v + w : v - w } return v }
  function term() {
    let v = unary()
    for (;;) {
      if (peek() && (peek().t === '*' || peek().t === '/')) { const o = tk[p++].t; const w = unary(); v = o === '*' ? v * w : v / w } else if (startsAtom(peek())) v *= power()
      else return v
    }
  }
  function unary() { if (peek() && peek().t === '-') { p++; return -unary() } if (peek() && peek().t === '+') { p++; return unary() } return power() }
  function power() { const b = atom(); if (peek() && peek().t === '^') { p++; return b ** unary() } return b }
  function atom() {
    const x = tk[p++]
    if (!x) throw new Error(`unexpected end in ${str}`)
    if (x.t === 'num') return x.v
    if (x.t === 'var') { if (!(x.v in vars)) throw new Error(`no value for ${x.v} in ${str}`); return vars[x.v] }
    if (x.t === '(') { const v = expr(); eat(')'); return v }
    if (x.t === '√') return Math.sqrt(atom())
    throw new Error(`unexpected ${x.t} in ${str}`)
  }
  const v = expr()
  if (p !== tk.length) throw new Error(`trailing tokens in ${str}`)
  return v
}
const PTS = [[1.37, -0.61], [-2.13, 1.9], [0.71, 2.47], [3.3, -1.7]]
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e * Math.max(1, Math.abs(a), Math.abs(b))
const equiv = (e1, e2) => PTS.every(([x, y]) => near(evaluate(e1, { x, y }), evaluate(e2, { x, y })))
// choice exercises whose options are expressions: the answer must equal the question, no distractor may
function checkEquivChoices(ex, question) {
  assert.ok(equiv(question, ex.answer), `answer ${ex.answer} ≠ ${question}`)
  for (const c of ex.choices) if (c !== ex.answer) assert.ok(!equiv(question, c), `distractor ${c} also equals ${question}`)
}
const sides = s => s.split('=')
const plugEq = (expr, vars) => { const [l, rr] = sides(expr); return near(evaluate(l, vars), evaluate(rr, vars)) }
const svgTexts = svg => [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(m => m[1].replace(/&amp;/g, '&'))
const numIn = s => Number(String(s).replace(/[−]/g, '-').replace(/[^\d.-]/g, ''))
// a minus sign only counts after a space/bracket/start (so the Hebrew 'ו-6' is 6, not −6)
const nums = s => (s.replace(/−/g, '-').match(/(?:(?<=^|[\s(,=:])-)?\d+(\.\d+)?/g) || []).map(Number)
const fracVal = a => { const [n, d] = String(a).split('/').map(Number); return d ? n / d : n }
const ansVal = ex => (ex.type === 'fraction' ? fracVal(ex.answer) : Number(ex.answer))
const ptParse = s => s.replace(/−/g, '-').match(/\((-?\d+), (-?\d+)\)/g).map(m => m.match(/-?\d+/g).map(Number))
// gridSvg(m) screen coords back to grid units (pad 14, cell floor(208 / 2m))
const gridPoints = (svg, m) => { const s = Math.floor(208 / (2 * m)); return [...svg.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)"/g)].map(g => [Math.round((+g[1] - 14) / s - m), Math.round(m - (+g[2] - 14) / s)]) }
const labelsOf = svg => svgTexts(svg).filter(t => !/^[A-F]$/.test(t) && t !== 'α')
const linExprsIn = svg => svgTexts(svg).filter(t => t.includes('x'))

// ---------- independent checkers per topic ----------
const CHECK = {
  // grade 7
  'directed-numbers-add-sub': ex => assert.equal(evaluate(ex.expr.replace('= ?', '')), ex.answer),
  'directed-numbers-mul-div': ex => assert.ok(near(evaluate(ex.expr.replace('= ?', '')), ex.answer)),
  'order-of-operations': ex => assert.ok(near(evaluate(ex.expr.replace('= ?', '')), ex.answer)),
  'algebraic-substitution': ex => {
    const x = +ex.q.replace(/−/g, '-').match(/x = (-?\d+)/)[1], ym = ex.q.replace(/−/g, '-').match(/y = (-?\d+)/)
    assert.ok(near(evaluate(ex.expr, { x, y: ym ? +ym[1] : 0 }), ex.answer))
  },
  'like-terms': ex => checkEquivChoices(ex, ex.expr),
  'linear-equations': ex => { assert.ok(Number.isInteger(ex.answer)); assert.ok(plugEq(ex.expr, { x: ex.answer }), ex.expr) },
  'ratio-proportion': ex => {
    const q = ex.q
    if (ex.expr) { const [a, b, c] = nums(ex.expr.replace('x', '')); assert.ok(near(a / b, ex.answer / c)); return }
    let m = q.match(/ביניהם (\d+) .* ביחס (\d+):(\d+)/)
    if (m) { const [T, a, b] = [+m[1], +m[2], +m[3]]; const first = q.includes('קיבלה'); assert.equal(ex.answer, (T / (a + b)) * (first ? a : b)); return }
    m = q.match(/1:([\d,]+) .* (\d+) ס״מ/)
    if (m) { assert.ok(near(ex.answer, (+m[2] * +m[1].replace(/,/g, '')) / 100000)); return }
    m = q.match(/ביחס (\d+):(\d+):(\d+)\. השלישי קיבל (\d+)/)
    const [a, b, c, d] = m.slice(1).map(Number)
    assert.equal(ex.answer, ((a + b + c) * d) / Math.abs(c - a))
  },
  percent: ex => {
    const q = ex.q
    let m
    if ((m = q.match(/חשבו (\d+)% מ-(\d+)/))) return assert.ok(near(ex.answer, (+m[1] * +m[2]) / 100))
    if ((m = q.match(/יש (\d+) תלמידים, ו-(\d+)/))) return assert.ok(near(ex.answer, (+m[2] / +m[1]) * 100))
    if ((m = q.match(/היה (\d+) ₪\. המחיר (עלה|ירד) ב-(\d+)%/))) return assert.ok(near(ex.answer, +m[1] * (1 + (m[2] === 'עלה' ? 1 : -1) * +m[3] / 100)))
    if ((m = q.match(/(\d+)% מהתלמידים בשכבה הם (\d+)/))) return assert.ok(near(ex.answer, (+m[2] * 100) / +m[1]))
    m = q.match(/מ-(\d+) ₪ ל-([\d.]+) ₪/)
    assert.ok(near(ex.answer, (Math.abs(+m[2] - +m[1]) / +m[1]) * 100))
  },
  'vertical-adjacent-angles': ex => {
    if (ex.q.includes('מצאו את x')) {
      const [e1, e2] = linExprsIn(ex.svg).map(e => evaluate(e, { x: ex.answer }))
      assert.ok(e1 > 0 && e2 > 0 && e1 < 180 && e2 < 180, `angles ${e1}, ${e2}`)
      if (ex.q.includes('קודקודיות')) assert.ok(near(e1, e2)); else assert.ok(near(e1 + e2, 180))
      return
    }
    let m
    if ((m = ex.q.match(/ב-(\d+)°/))) return assert.equal(ex.answer * 2 + +m[1], 180)
    if ((m = ex.q.match(/פי (\d+)/))) return assert.ok(near(ex.answer + ex.answer / +m[1], 180))
    const g = numIn(svgTexts(ex.svg).find(t => t.includes('°')))
    assert.ok(ex.answer === g || ex.answer === 180 - g)
  },
  'triangle-angles': ex => {
    if (ex.q.includes('הוארכה')) { const [a, b] = svgTexts(ex.svg).filter(t => t.includes('°')).map(numIn); return assert.equal(ex.answer, a + b) }
    if (ex.q.includes('מתייחסות')) {
      const rt = ex.q.match(/(\d+):(\d+):(\d+)/).slice(1).map(Number), s = rt[0] + rt[1] + rt[2]
      return assert.ok(near(ex.answer, ((ex.q.includes('הגדולה') ? Math.max(...rt) : Math.min(...rt)) * 180) / s))
    }
    const given = svgTexts(ex.svg).filter(t => t.includes('°')).map(numIn)
    if (ex.q.includes('זווית הראש A נתונה')) return assert.equal(ex.answer, (180 - given[0]) / 2)
    if (ex.q.includes('זווית הבסיס C')) return assert.equal(ex.answer, 180 - 2 * given[0])
    assert.equal(given.length, 2)
    assert.equal(ex.answer, 180 - given[0] - given[1])
  },
  'coordinate-plane': ex => {
    if (ex.type === 'choice' && ex.q.includes('רביע')) {
      const [[x, y]] = ptParse(ex.q)
      const qd = x > 0 ? (y > 0 ? 'ראשון' : 'רביעי') : y > 0 ? 'שני' : 'שלישי'
      return assert.equal(ex.answer, `רביע ${qd}`)
    }
    if (ex.type === 'choice') { const [[x, y]] = gridPoints(ex.svg, 6); return assert.deepEqual(ptParse(ex.answer)[0], [x, y]) }
    const P = ptParse(ex.q)
    let s = 0
    for (let i = 0; i < P.length; i++) { const [a, b] = P[i], [c, d] = P[(i + 1) % P.length]; s += a * d - b * c }
    assert.ok(near(ex.answer, Math.abs(s) / 2))
  },
  'area-triangle-parallelogram-trapezoid': ex => {
    const L = labelsOf(ex.svg)
    const kind = ex.q.includes('משולש') ? 'tri' : ex.q.includes('מקבילית') ? 'par' : 'trap'
    const area = (a, h, b = 0) => (kind === 'tri' ? (a * h) / 2 : kind === 'par' ? a * h : ((a + b) * h) / 2)
    if (!ex.q.startsWith('שטח')) {
      if (kind === 'trap') { const [a, b, h] = L.map(Number); return assert.ok(near(ex.answer, area(a, h, b))) }
      const [a, h] = L.map(Number); return assert.ok(near(ex.answer, area(a, h)))
    }
    const S = nums(ex.q)[0]
    if (kind === 'trap') { const [a, b] = L.map(Number); return assert.ok(near(ex.answer, (2 * S) / (a + b))) }
    const known = Number(L.find(t => t !== '?' && t !== 'h'))
    assert.ok(near(ex.answer, kind === 'tri' ? (2 * S) / known : S / known))
  },
  // grade 8
  'distributive-law': ex => checkEquivChoices(ex, ex.expr),
  'equations-parentheses-fractions': ex => { assert.ok(Number.isInteger(ex.answer)); assert.ok(plugEq(ex.expr, { x: ex.answer }), ex.expr) },
  'linear-inequalities': ex => {
    const rel = ex.expr.match(/[<>≤≥]/)[0], [L, R] = ex.expr.split(rel)
    const holds = (rl, a, b) => (rl === '>' ? a > b : rl === '<' ? a < b : rl === '≥' ? a >= b - 1e-9 : a <= b + 1e-9)
    const sol = s => { const m = s.replace(/−/g, '-').match(/x ([<>≤≥]) (-?\d+)/); return t => holds(m[1], t, +m[2]) }
    const s0 = nums(ex.answer)[0]
    const ts = [-0.5, 0, 0.5, 1, -1, 7, -7].map(d => s0 + d)
    for (const t of ts) assert.equal(holds(rel, evaluate(L, { x: t }), evaluate(R, { x: t })), sol(ex.answer)(t), `${ex.expr} at ${t}`)
    for (const c of ex.choices) if (c !== ex.answer) assert.ok(ts.some(t => sol(c)(t) !== sol(ex.answer)(t)), `distractor ${c} equivalent`)
  },
  slope: ex => {
    let P
    if (ex.svg) P = gridPoints(ex.svg, 6); else P = ptParse(ex.q)
    const [[x1, y1], [x2, y2]] = P
    assert.ok(near(ansVal(ex), (y2 - y1) / (x2 - x1)))
  },
  'linear-function': ex => {
    const q = ex.q.replace(/−/g, '-')
    if (ex.type === 'number') {
      const f = q.match(/y = ([^.?]*?)(\.|\s+את)/)[1].replace(/-/g, '−')
      let m
      if ((m = q.match(/כאשר x = (-?\d+)/))) return assert.ok(near(evaluate(f, { x: +m[1] }), ex.answer))
      if ((m = q.match(/מתקבל y = (-?\d+)/))) return assert.ok(near(evaluate(f, { x: ex.answer }), +m[1]))
      return assert.ok(near(evaluate(f, { x: ex.answer }), 0))
    }
    const P = ptParse(ex.q)
    const rhs = s => s.replace(/^y = /, '')
    for (const [x, y] of P) assert.ok(near(evaluate(rhs(ex.answer), { x }), y))
    const m = q.match(/ששיפועו (-?\d+)/)
    if (m) assert.ok(near(evaluate(rhs(ex.answer), { x: 1 }) - evaluate(rhs(ex.answer), { x: 0 }), +m[1]))
    for (const c of ex.choices) if (c !== ex.answer) {
      const fits = P.every(([x, y]) => near(evaluate(rhs(c), { x }), y)) && (!m || near(evaluate(rhs(c), { x: 1 }) - evaluate(rhs(c), { x: 0 }), +m[1]))
      assert.ok(!fits, `distractor ${c} also fits`)
    }
  },
  'system-of-equations': ex => {
    const val = s => { const m = s.replace(/−/g, '-').match(/x = (-?\d+), y = (-?\d+)/); return { x: +m[1], y: +m[2] } }
    const eqs = ex.expr.split(';').map(s => s.trim())
    assert.ok(eqs.every(e => plugEq(e, val(ex.answer))), ex.expr)
    for (const c of ex.choices) if (c !== ex.answer) assert.ok(!eqs.every(e => plugEq(e, val(c))), `distractor ${c} solves too`)
  },
  powers: ex => {
    if (ex.expr.includes('ⁿ')) {
      const left = ex.expr.split('=')[0]
      const base = /[ax]/.test(left) ? 2 : Number(left.match(/\d/)[0])
      const v = evaluate(left.replace(/[ax]/g, String(base)))
      return assert.ok(near(Math.log(v) / Math.log(base), ex.answer))
    }
    assert.ok(near(evaluate(ex.expr.replace('= ?', '')), ansVal(ex)))
  },
  'parallel-lines-angles': ex => {
    if (ex.q.includes('מצאו את x')) {
      const [e1, e2] = linExprsIn(ex.svg).map(e => evaluate(e, { x: ex.answer }))
      assert.ok(e1 > 0 && e2 > 0 && e1 < 180 && e2 < 180, `angles ${e1}, ${e2}`)
      return assert.ok(near(e1, e2) || near(e1 + e2, 180))
    }
    const g = numIn(svgTexts(ex.svg).find(t => t.includes('°')))
    assert.ok(ex.answer === g || ex.answer === 180 - g)
  },
  'pythagorean-theorem': ex => {
    const L = labelsOf(ex.svg)
    const k = L.map(t => (t === '?' ? NaN : Number(t)))
    let exact
    if (ex.q.includes('מלבן')) exact = Math.hypot(k[0], k[1])
    else if (L[0] === '?') exact = Math.hypot(k[1], k[2])
    else exact = Math.sqrt(k[0] ** 2 - k[1] ** 2)
    assert.ok(Math.abs(ex.answer - exact) <= (ex.tol ? 0.0051 : 1e-9), `${ex.answer} vs ${exact}`)
  },
  'triangle-congruence': ex => {
    const facts = ex.q.slice(ex.q.indexOf(':') + 1, ex.q.indexOf('.')).split(',').map(s => s.trim())
    const S = facts.filter(f => /^[A-C]{2} =/.test(f)).map(f => f.slice(0, 2))
    const A = facts.filter(f => f.startsWith('∠')).map(f => f[1])
    const ineq = facts.find(f => /[<>]/.test(f))
    let want
    if (S.length === 3) want = 'צ.צ.צ'
    else if (A.length === 3) want = 'לא ניתן לקבוע חפיפה'
    else if (S.length === 1) want = S[0].includes(A[0]) && S[0].includes(A[1]) ? 'ז.צ.ז' : 'לא ניתן לקבוע חפיפה'
    else {
      const v = A[0]
      if (S[0].includes(v) && S[1].includes(v)) want = 'צ.ז.צ'
      else {
        const opp = S.find(s => !s.includes(v)), other = S.find(s => s.includes(v))
        const sameSeg = (p, q) => p.split('').sort().join('') === q.split('').sort().join('')
        const [l, rel, rr] = ineq.split(' ')
        const bigger = rel === '>' ? l : rr
        assert.ok(sameSeg(l, opp) || sameSeg(l, other))
        want = sameSeg(bigger, opp) ? 'צ.צ.ז' : 'לא ניתן לקבוע חפיפה'
      }
    }
    assert.equal(ex.answer, want, ex.q)
  },
  quadrilaterals: ex => {
    if (ex.q.includes('במרובע')) {
      const given = svgTexts(ex.svg).filter(t => t.includes('°')).map(numIn)
      assert.equal(given.length, 3)
      assert.equal(ex.answer, 360 - given.reduce((s, v) => s + v, 0))
      // the drawn quadrilateral really has those angles (convex, angles match labels)
      const P = ex.svg.match(/points="([^"]+)"/)[1].split(' ').map(p => p.split(',').map(Number))
      const ang = P.map((p, i) => { const a = P[(i + 3) % 4], b = P[(i + 1) % 4]; const u = [a[0] - p[0], a[1] - p[1]], v = [b[0] - p[0], b[1] - p[1]]; return (Math.acos((u[0] * v[0] + u[1] * v[1]) / Math.hypot(...u) / Math.hypot(...v)) * 180) / Math.PI })
      assert.ok(Math.abs(ang.reduce((s, v) => s + v, 0) - 360) < 0.5, `non-convex drawing ${ang}`)
      return
    }
    if (ex.q.includes('מעוין')) { const [d1, d2] = nums(ex.q); return assert.ok(near(ex.answer, (d1 * d2) / 2)) }
    if (ex.q.includes('∠A = ') && ex.q.includes('x')) {
      const [eA, eB] = [...ex.q.matchAll(/∠[AB] = ([^ו(]+?)(?= ו-|\s*\()/g)].map(m => m[1].trim())
      const f = x => evaluate(eA, { x }) + evaluate(eB, { x })
      const x = (180 - f(0)) / (f(1) - f(0))
      assert.ok(evaluate(eA, { x }) > 0 && evaluate(eB, { x }) > 0)
      return assert.ok(near(ex.answer, ex.q.includes('מצאו את x') ? x : Math.max(evaluate(eA, { x }), evaluate(eB, { x }))))
    }
    const g = numIn(svgTexts(ex.svg).find(t => t.includes('°')))
    assert.ok(ex.answer === g || ex.answer === 180 - g)
  },
  'mean-median-mode': ex => {
    const q = ex.q
    if (q.includes('ענו')) {
      const pairs = [...q.matchAll(/(\d+|תלמיד אחד) (?:תלמידים ענו|ענה) (\d+)/g)].map(m => [m[1] === 'תלמיד אחד' ? 1 : +m[1], +m[2]])
      const N = pairs.reduce((s, p) => s + p[0], 0)
      return assert.ok(near(ex.answer, pairs.reduce((s, p) => s + p[0] * p[1], 0) / N))
    }
    if (q.includes('הציון החסר')) {
      const known = q.match(/תלמידה: ([\d, ]+) ועוד/)[1].split(',').map(Number), m = q.match(/כל (\d+) הציונים הוא (\d+)/)
      return assert.equal(ex.answer, +m[1] * +m[2] - known.reduce((s, v) => s + v, 0))
    }
    const data = q.match(/: ([\d, ]+)\?/)[1].split(',').map(Number)
    if (q.includes('ממוצע')) return assert.ok(near(ex.answer, data.reduce((s, v) => s + v, 0) / data.length))
    if (q.includes('החציון')) { const s = [...data].sort((a, b) => a - b), n = s.length; return assert.ok(near(ex.answer, n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2)) }
    const cnt = new Map(); for (const v of data) cnt.set(v, (cnt.get(v) || 0) + 1)
    const max = Math.max(...cnt.values())
    assert.deepEqual([...cnt].filter(([, c]) => c === max).map(([v]) => v), [ex.answer])
  },
  // grade 9
  'short-multiplication-formulas': ex => checkEquivChoices(ex, ex.expr),
  factoring: ex => checkEquivChoices(ex, ex.expr),
  'algebraic-fractions': ex => checkEquivChoices(ex, ex.expr),
  'quadratic-equation': ex => {
    assert.equal(ex.answer.length, 2); assert.notEqual(ex.answer[0], ex.answer[1])
    for (const x of ex.answer) assert.ok(plugEq(ex.expr, { x }), `${ex.expr} at ${x}`)
  },
  discriminant: ex => {
    if (ex.expr.includes('k')) {
      const [L] = ex.expr.split('=')
      const f = x => evaluate(L, { x, k: ex.answer })
      const c = f(0), a = (f(1) + f(-1)) / 2 - c, b = (f(1) - f(-1)) / 2
      return assert.ok(near(b * b - 4 * a * c, 0) && ex.answer > 0)
    }
    const [L] = ex.expr.split('=')
    const f = x => evaluate(L, { x })
    const c = f(0), a = (f(1) + f(-1)) / 2 - c, b = (f(1) - f(-1)) / 2, D = b * b - 4 * a * c
    assert.equal(ex.answer, D > 0 ? 2 : D === 0 ? 1 : 0)
  },
  'parabola-vertex': ex => {
    const f = x => evaluate(ex.expr.replace('y =', ''), { x })
    const isVertex = s => { const [[h, k]] = ptParse(s); return near(f(h), k) && near(f(h + 1), f(h - 1)) }
    assert.ok(isVertex(ex.answer), `${ex.answer} for ${ex.expr}`)
    for (const c of ex.choices) if (c !== ex.answer) assert.ok(!isVertex(c), `distractor ${c}`)
  },
  'parabola-intersections': ex => {
    const f = x => evaluate(ex.expr.replace('y =', ''), { x })
    if (ex.type === 'number') return assert.equal(f(0), ex.answer)
    assert.equal(ex.answer.length, 2); assert.notEqual(ex.answer[0], ex.answer[1])
    for (const x of ex.answer) assert.ok(near(f(x), 0))
  },
  'square-roots': ex => {
    if (ex.type === 'number') return assert.ok(near(evaluate(ex.expr.replace('= ?', '')), ex.answer))
    checkEquivChoices(ex, ex.expr)
  },
  'similar-triangles': ex => {
    if (!ex.svg) { const [p, q, S] = nums(ex.q.replace('ABC', '')); return assert.equal(ex.answer, (S * p * p) / (q * q)) }
    const L = labelsOf(ex.svg)
    if (ex.q.includes('מקביל')) { const [, a, b, de] = L.map(Number); return assert.ok(near(ex.answer, (de * (a + b)) / a)) }
    const [AB, BC, DE] = L.filter(t => t !== '?').map(Number)
    assert.ok(near(ex.answer, (BC * DE) / AB))
    assert.ok(Number.isInteger(ex.answer))
  },
  'trigonometry-right-triangle': ex => {
    const L = svgTexts(ex.svg).filter(t => !/^[A-C]$/.test(t))
    if (ex.type === 'choice') {
      const [, hyp, opp, adj] = L.map(Number) // first text is the angle mark α
      assert.ok(near(hyp * hyp, opp * opp + adj * adj))
      const fn = ex.q.match(/(sin|cos|tan) A/)[1]
      const want = fn === 'sin' ? opp / hyp : fn === 'cos' ? adj / hyp : opp / adj
      assert.ok(near(fracVal(normalizeInput(ex.answer)), want))
      const vals = ex.choices.map(c => fracVal(normalizeInput(c)))
      assert.equal(new Set(vals.map(v => v.toFixed(9))).size, vals.length)
      return
    }
    const q = ex.q
    const d = Math.PI / 180
    let exact
    const m = q.match(/∠A = (\d+)° (?:והיתר AB|והניצב AC) = (\d+)/)
    if (m) {
      const al = +m[1] * d, Lg = +m[2]
      if (q.includes('והניצב AC')) exact = Lg * Math.tan(al)
      else exact = q.includes('מצאו את BC') ? Lg * Math.sin(al) : Lg * Math.cos(al)
      return assert.ok(Math.abs(ex.answer - exact) <= 0.0051)
    }
    const k = L.slice(1).map(t => (t === '' ? NaN : Number(t)))
    if (q.includes('הניצבים')) exact = Math.atan(k[0] / k[1]) / d
    else exact = Math.asin(k[1] / k[0]) / d
    assert.ok(Math.abs(ex.answer - exact) <= 0.051, `${ex.answer} vs ${exact}`)
  },
  probability: ex => {
    const q = ex.q
    let fav, tot, m
    if ((m = q.match(/בשקית (\d+) כדורים אדומים(?:, (\d+) כחולים ו-(\d+) ירוקים| ו-(\d+) כחולים)/))) {
      const cnt = { אדום: +m[1], כחול: +(m[2] || m[4]), ירוק: +(m[3] || 0) }
      tot = cnt.אדום + cnt.כחול + cnt.ירוק
      const col = q.match(/יהיה (\S+)\?/)[1]
      fav = q.includes('לא יהיה') ? tot - cnt[col] : cnt[col]
    } else if (q.includes('קובייה הוגנת')) {
      const faces = [1, 2, 3, 4, 5, 6]
      const ev = q.match(/לקבל (.+)\?/)[1]
      const isPrime = n => [2, 3, 5].includes(n)
      const test2 = ev === 'מספר זוגי' ? n => n % 2 === 0 : ev === 'מספר אי־זוגי' ? n => n % 2 : ev === 'מספר ראשוני' ? isPrime : ev === 'מספר שמתחלק ב-3' ? n => n % 3 === 0
        : ev.includes('גדול מ-') ? n => n > +ev.match(/\d+/)[0] : n => n < +ev.match(/\d+/)[0]
      fav = faces.filter(test2).length; tot = 6
    } else if (q.includes('מטבעות')) {
      const k = q.includes('שני מטבעות') ? 2 : 3
      const outs = Array.from({ length: 2 ** k }, (_, i) => [...i.toString(2).padStart(k, '0')].filter(c => c === '1').length)
      const t = q.includes('לפחות') ? h => h >= 1 : q.includes('אחד בדיוק') ? h => h === 1 : q.includes('שני "עץ" בדיוק') ? h => h === 2 : h => h === k
      fav = outs.filter(t).length; tot = 2 ** k
    } else if (q.includes('שתי קוביות')) {
      const pairs = []; for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) pairs.push([a, b])
      const s = nums(q.split('?')[0]).pop()
      const t = q.includes('אותו מספר') ? ([a, b]) => a === b : q.includes('לפחות') ? ([a, b]) => a + b >= s : ([a, b]) => a + b === s
      fav = pairs.filter(t).length; tot = 36
    } else {
      const [red, other] = nums(q)
      fav = red * (red - 1); tot = (red + other) * (red + other - 1)
    }
    assert.ok(fav > 0 && fav < tot)
    assert.ok(near(fracVal(ex.answer), fav / tot))
  },
}

const ALL = [[7, grade7], [8, grade8], [9, grade9]]

test('grades 7–9: 10–12 topics each, complete metadata', () => {
  for (const [g, list] of ALL) {
    assert.ok(list.length >= 10 && list.length <= 12, `grade ${g}: ${list.length}`)
    assert.equal(new Set(list.map(t => t.slug)).size, list.length)
    assert.equal(new Set(list.map(t => t.title)).size, list.length)
    for (const t of list) {
      assert.equal(t.grade, g)
      assert.match(t.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/)
      assert.ok(STRANDS.includes(t.strand), `${t.slug} strand`)
      for (const f of ['title', 'emoji', 'desc', 'intro']) assert.ok(typeof t[f] === 'string' && t[f].trim(), `${t.slug} ${f}`)
      assert.ok(t.desc.length >= 120 && t.desc.length <= 160, `${t.slug} desc length ${t.desc.length}`)
      assert.ok(t.tips.length >= 2 && t.tips.length <= 4, `${t.slug} tips`)
      assert.ok(t.faq.length >= 2 && t.faq.length <= 3 && t.faq.every(f => f.q && f.a), `${t.slug} faq`)
      assert.equal(t.levels.length, 3)
      assert.ok(t.example.q && t.example.a && t.example.steps.length, `${t.slug} example`)
      assert.ok(CHECK[t.slug], `${t.slug} has an independent checker`)
    }
  }
  const descs = ALL.flatMap(([, l]) => l.map(t => t.desc))
  assert.equal(new Set(descs).size, descs.length)
})

const bad = s => /undefined|NaN|Infinity|\[object/.test(String(s))

for (const [g, list] of ALL) {
  for (const t of list) {
    test(`grade ${g} · ${t.slug}: ${SEEDS} seeds × 3 levels are valid and correct`, () => {
      for (const level of [1, 2, 3]) {
        const seen = new Set()
        for (let seed = 1; seed <= SEEDS; seed++) {
          const ex = t.gen(level, createRng(seed * 7919 + level))
          const ctx = `${t.slug} L${level} seed ${seed}: ${ex.q} ${ex.expr || ''}`
          assert.ok(TYPES.includes(ex.type), ctx)
          assert.ok(typeof ex.q === 'string' && ex.q.trim(), ctx)
          assert.ok(typeof ex.explain === 'string' && ex.explain.trim(), ctx)
          for (const f of ['q', 'expr', 'explain', 'svg', 'unit']) assert.ok(!bad(ex[f] ?? ''), `${ctx} [${f}] ${ex[f]}`)
          if (ex.type === 'number') assert.ok(typeof ex.answer === 'number' && Number.isFinite(ex.answer), ctx)
          if (ex.type === 'numbers') {
            assert.ok(Array.isArray(ex.answer) && ex.answer.length >= 1 && ex.answer.every(Number.isFinite), ctx)
            assert.equal(new Set(ex.answer).size, ex.answer.length, ctx)
          }
          if (ex.type === 'fraction') {
            const m = String(ex.answer).match(/^(-?\d+)\/(\d+)$/)
            assert.ok(m, `${ctx} fraction ${ex.answer}`)
            const [n, d] = [Math.abs(+m[1]), +m[2]]
            let a = n, b = d; while (b) [a, b] = [b, a % b]
            assert.ok(d > 1 && a === 1, `${ctx} not simplified: ${ex.answer}`)
          }
          if (ex.type === 'choice') {
            assert.ok(ex.choices.length >= 2 && ex.choices.length <= 5, ctx)
            assert.ok(ex.choices.includes(ex.answer), ctx)
            assert.equal(new Set(ex.choices.map(c => normalizeInput(c).replace(/\s/g, ''))).size, ex.choices.length, `${ctx} dup choices ${ex.choices}`)
            assert.ok(ex.choices.every(c => !bad(c)), ctx)
          }
          if (ex.svg) {
            assert.match(ex.svg, /^<svg [^>]*viewBox="[^"]+"/, ctx)
            assert.ok(+ex.svg.match(/height="([\d.]+)"/)[1] <= 240, `${ctx} svg too tall`)
            assert.ok(+ex.svg.match(/width="([\d.]+)"/)[1] <= 280, `${ctx} svg too wide`)
            assert.equal((ex.svg.match(/<svg/g) || []).length, 1, ctx)
          }
          if (ex.tol != null) assert.ok(ex.tol > 0 && ex.tol <= 0.11, ctx)
          // the site's own checker accepts the formatted answer
          assert.ok(checkAnswer(ex, formatAnswer(ex)), `${ctx} checker rejects ${formatAnswer(ex)}`)
          try { CHECK[t.slug](ex) } catch (e) { e.message = `${ctx}\n${e.message}`; throw e }
          seen.add(`${ex.q}|${ex.expr}|${ex.svg}|${JSON.stringify(ex.answer)}`)
          // deterministic
          assert.deepEqual(t.gen(level, createRng(seed * 7919 + level)), ex)
        }
        assert.ok(seen.size >= 20, `${t.slug} L${level} variety ${seen.size}`)
      }
    })
  }
}
