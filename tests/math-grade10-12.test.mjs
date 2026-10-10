// High-school math topics (grades 10–12): metadata + 500 seeds × 3 levels per topic, with every answer
// recomputed independently from the question text (parsing the math, numeric derivatives/integrals).
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { createRng } = await import('../src/math/rng.js')
const { exerciseProblems } = await import('../src/math/validate.js')
const GRADES = {
  10: (await import('../src/math/topics/grade10.js')).default,
  11: (await import('../src/math/topics/grade11.js')).default,
  12: (await import('../src/math/topics/grade12.js')).default,
}
const SEEDS = 500
const STRANDS = ['arithmetic', 'geometry', 'algebra', 'fractions', 'measurement', 'data', 'probability', 'functions', 'trigonometry', 'calculus', 'sequences', 'vectors']
const TYPES = ['number', 'fraction', 'numbers', 'choice', 'text']

// ---------- tiny math-text parser ----------
const SUPM = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+', ˣ: 'x', ⁿ: 'n' }
const SUBM = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', '₋': '-' }
const dig = s => [...s].map(c => SUBM[c] ?? c).join('')
function toJs(src) {
  let s = src.replace(/−/g, '-').replace(/[·×]/g, '*').replace(/÷/g, '/')
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺ˣⁿ]+/g, m => '^(' + [...m].map(c => SUPM[c]).join('') + ')')
  s = s.replace(/log([₀-₉]+)\s*(\d+)/g, (_, b, a) => `(L(${a})/L(${dig(b)}))`)
  s = s.replace(/log([₀-₉]+)\s*\(/g, (_, b) => `(1/L(${dig(b)}))*L(`)
  s = s.replace(/ln\s*\(/g, 'L(').replace(/ln\s*x/g, 'L(x)')
  s = s.replace(/√\(/g, 'Q(').replace(/√(\d+|x)/g, 'Q($1)')
  s = s.replace(/e/g, 'E').replace(/\s+/g, '')
  assert.ok(!/[^0-9xynELQ()+\-*/^.,]/.test(s), `unparsed chars in "${src}" → ${s}`)
  s = s.replace(/([0-9xynE)])(?=[xynELQ(])/g, '$1*')
  s = s.replace(/\^/g, '**').replace(/(^|[(*/+\-,])-/g, '$1(-1)*')
  return new Function('x', 'y', 'n', `const L=Math.log,Q=Math.sqrt,E=Math.E;return (${s})`)
}
const fnOf = s => { const f = toJs(s); return x => f(x, 0, x) }
const rhs = s => s.slice(s.indexOf('=') + 1).trim()
const parts = expr => expr.split(' ,  ')
const num = s => Number(s.replace(/−/g, '-'))
const val = ans => (typeof ans === 'number' ? ans : (() => { const [n, d] = String(ans).split('/').map(Number); return d ? n / d : n })())
const near = (a, b, tol = 1e-6, msg = '') => assert.ok(Math.abs(a - b) <= tol + 1e-9 * Math.max(1, Math.abs(b)), `${msg} expected ≈${b}, got ${a}`)
const sameSet = (got, want, tol, msg) => {
  assert.equal(got.length, want.length, `${msg} count ${JSON.stringify(got)} vs ${JSON.stringify(want)}`)
  const a = [...got].sort((p, q) => p - q), b = [...want].sort((p, q) => p - q)
  a.forEach((v, i) => near(v, b[i], tol, msg))
}
const quadCoef = f => { const c = f(0), a = (f(1) + f(-1)) / 2 - c, b = (f(1) - f(-1)) / 2; return [a, b, c] }
const quadRoots = ([a, b, c]) => { const D = b * b - 4 * a * c; return D < 0 ? [] : [(-b + Math.sqrt(D)) / (2 * a), (-b - Math.sqrt(D)) / (2 * a)] }
const simpson = (f, a, b, n = 2000) => { const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return s * h / 3 }
const dnum = (f, x, h = 1e-5) => (f(x + h) - f(x - h)) / (2 * h)
const ptsOf = s => [...s.matchAll(/\((−?[\d.]+), (−?[\d.]+)\)/g)].map(m => [num(m[1]), num(m[2])])
const field = (expr, name) => { const m = expr.match(new RegExp(name + ' = (−?[\\d.]+)')); assert.ok(m, `${name} in ${expr}`); return num(m[1]) }
const deg = Math.PI / 180

// solution-set text → predicate
function region(str) {
  const preds = str.split(' או ').map(p => {
    const cmp = (a, op, b) => (op === '<' ? a < b : op === '>' ? a > b : op === '≤' ? a <= b : a >= b)
    let m = p.match(/^(\S+) (<|≤) x (<|≤) (\S+)$/)
    if (m) return x => cmp(num(m[1]), m[2], x) && cmp(x, m[3], num(m[4]))
    m = p.match(/^x (<|>|≤|≥) (\S+)$/)
    assert.ok(m, `region "${p}"`)
    return x => cmp(x, m[1], num(m[2]))
  })
  return x => preds.some(f => f(x))
}
const GRID = Array.from({ length: 161 }, (_, i) => -20 + i * 0.25)

// derivative / antiderivative choice check: correct option matches, every distractor differs somewhere
const SAMPLE = [-3.3, -1.7, -0.4, 0.6, 1.3, 2.2, 3.7, 5.1, 8.3, 9.6, 12.5, 15.2, 18.7, 25.3]
function checkFnChoice(ex, target, label, strip = s => s, wrap = g => g) {
  const fns = Object.fromEntries(ex.choices.map(c => [c, wrap(fnOf(strip(rhs(c))))]))
  const xs = SAMPLE.filter(x => Number.isFinite(target(x)) && Number.isFinite(fns[ex.answer](x)))
  assert.ok(xs.length >= 3, `${label}: domain points`)
  for (const x of xs) near(fns[ex.answer](x), target(x), 1e-4 * Math.max(1, Math.abs(target(x))), `${label} at ${x}`)
  for (const c of ex.choices) if (c !== ex.answer) assert.ok(xs.some(x => !(Math.abs(fns[c](x) - target(x)) < 1e-6 * Math.max(1, Math.abs(target(x))))), `${label}: distractor ${c} also correct`)
}

// ---------- per-topic verifiers ----------
const V = {
  // grade 10
  'quadratic-equations'(ex, L) { sameSet(ex.answer, quadRoots(quadCoef(fnOf(ex.expr.split(' = ')[0]))), L === 3 ? 0.006 : 1e-9, 'roots') },
  'linear-systems'(ex) {
    const [e1, e2] = parts(ex.expr).map(e => { const [l, r] = e.split(' = '); const f = toJs(l); const c0 = f(0, 0); return [f(1, 0) - c0, f(0, 1) - c0, num(r) - c0] })
    const D = e1[0] * e2[1] - e1[1] * e2[0]
    assert.notEqual(D, 0)
    const x = (e1[2] * e2[1] - e1[1] * e2[2]) / D, y = (e1[0] * e2[2] - e1[2] * e2[0]) / D
    near(ex.answer, ex.q.includes('ערך x') ? x : y)
  },
  'line-parabola-intersection'(ex) {
    const [P, Ln] = parts(ex.expr).map(p => fnOf(rhs(p)))
    const xs = quadRoots(quadCoef(x => P(x) - Ln(x)))
    assert.equal(new Set(xs.map(v => v.toFixed(6))).size, 2, 'two intersection points')
    sameSet(ex.answer, ex.q.includes('שיעורי ה-y') ? xs.map(Ln) : xs, 1e-9, 'intersections')
  },
  'inequalities'(ex) {
    const m = ex.expr.match(/^(.*) (<|>|≤|≥) (.*)$/)
    const l = fnOf(m[1]), r = fnOf(m[3]), cmp = { '<': (a, b) => a < b - 1e-9, '>': (a, b) => a > b + 1e-9, '≤': (a, b) => a <= b + 1e-9, '≥': (a, b) => a >= b - 1e-9 }[m[2]]
    const truth = GRID.map(x => cmp(l(x), r(x)))
    const ans = region(ex.answer)
    GRID.forEach((x, i) => assert.equal(ans(x), truth[i], `${ex.expr} → ${ex.answer} at ${x}`))
    for (const c of ex.choices) if (c !== ex.answer) { const f = region(c); assert.ok(GRID.some((x, i) => f(x) !== truth[i]), `distractor ${c} equivalent`) }
  },
  'slope-and-line'(ex, L) {
    const [[x1, y1], [x2, y2]] = ptsOf(ex.expr)
    if (L < 3) return near(val(ex.answer), (y2 - y1) / (x2 - x1))
    const passes = c => { const f = fnOf(rhs(c)); return Math.abs(f(x1) - y1) < 1e-9 && Math.abs(f(x2) - y2) < 1e-9 }
    assert.ok(passes(ex.answer))
    for (const c of ex.choices) if (c !== ex.answer) assert.ok(!passes(c), c)
  },
  'quadratic-function'(ex, L) {
    const [a, b, c] = quadCoef(fnOf(rhs(ex.expr)))
    const xv = -b / (2 * a)
    if (L === 1) near(ex.answer, xv)
    else if (L === 2) near(ex.answer, a * xv * xv + b * xv + c)
    else sameSet(ex.answer, quadRoots([a, b, c]), 1e-9, 'x-intercepts')
  },
  'distance-midpoint'(ex) {
    const [[x1, y1], [x2, y2]] = ptsOf(ex.expr)
    if (ex.q.includes('אמצע הקטע AB?')) { const [p] = ptsOf(ex.answer); near(p[0], (x1 + x2) / 2); near(p[1], (y1 + y2) / 2) }
    else if (ex.q.includes('שיעורי הנקודה B')) { const [p] = ptsOf(ex.answer); near(p[0], 2 * x2 - x1); near(p[1], 2 * y2 - y1) }
    else near(ex.answer, Math.hypot(x2 - x1, y2 - y1), ex.tol ? 0.005 : 1e-9)
  },
  'parallel-perpendicular-lines'(ex, L) {
    if (L === 1) {
      const [m1, m2] = parts(ex.expr).map(p => { const f = fnOf(rhs(p)); return f(1) - f(0) })
      const kind = Math.abs(m1 - m2) < 1e-9 ? 'מקבילים' : Math.abs(m1 * m2 + 1) < 1e-9 ? 'מאונכים' : 'לא מקבילים ולא מאונכים'
      return assert.equal(ex.answer, kind)
    }
    if (L === 2) {
      const [l] = ex.expr.split(' = '), f = toJs(l), a = f(1, 0) - f(0, 0), b = f(0, 1) - f(0, 0)
      return near(val(ex.answer), b / a)
    }
    const f = fnOf(rhs(ex.expr)), m = f(1) - f(0), [[px, py]] = ptsOf(ex.q), perp = ex.q.includes('מאונך')
    const ok = c => { const g = fnOf(rhs(c)), mg = g(1) - g(0); return Math.abs(g(px) - py) < 1e-9 && (perp ? Math.abs(m * mg + 1) < 1e-9 : Math.abs(m - mg) < 1e-9) }
    assert.ok(ok(ex.answer))
    for (const c of ex.choices) if (c !== ex.answer) assert.ok(!ok(c), c)
  },
  'right-triangle-trigonometry'(ex, L) {
    const e = ex.expr
    if (L === 1) { const c = field(e, 'AB'), al = field(e, '∠A'); return near(ex.answer, (e.includes('BC = ?') ? c * Math.sin(al * deg) : c * Math.cos(al * deg)), 0.005) }
    if (L === 2) {
      let A
      if (/BC = \d+ ,  AC/.test(e)) A = Math.atan(field(e, 'BC') / field(e, 'AC'))
      else if (/BC = \d+ ,  AB/.test(e)) A = Math.asin(field(e, 'BC') / field(e, 'AB'))
      else A = Math.acos(field(e, 'AC') / field(e, 'AB'))
      return near(ex.answer, A / deg, 0.05)
    }
    const s = num(e.match(/AB = AC = (\d+)/)[1]), th = field(e, '∠A') * deg
    const want = ex.q.includes('הבסיס BC') ? Math.sqrt(2 * s * s - 2 * s * s * Math.cos(th)) : ex.q.includes('הגובה') ? Math.sqrt(s * s - (s * s - s * s * Math.cos(th)) / 2) : 0.5 * s * s * Math.sin(th)
    near(ex.answer, want, 0.005)
  },
  'probability'(ex, L) {
    const q = ex.q, got = val(ex.answer)
    let p
    if (q.includes('קובייה הוגנת פעם אחת')) {
      const k = q.match(/גדול מ-(\d)/)
      const ok = q.includes('זוגי') ? n => n % 2 === 0 : k ? n => n > +k[1] : n => n % 3 === 0
      p = [1, 2, 3, 4, 5, 6].filter(ok).length / 6
    } else if (q.includes('שתי קוביות')) {
      const s = +q.match(/(\d+)\?/)[1], atLeast = q.includes('לפחות')
      let c = 0
      for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (atLeast ? i + j >= s : i + j === s) c++
      p = c / 36
    } else {
      const red = +q.match(/(\d+) כדורים אדומים/)[1], blue = +q.match(/(\d+) כדורים כחולים/)[1], gm = q.match(/(\d+) כדורים ירוקים/)
      const balls = [...Array(red).fill('r'), ...Array(blue).fill('b'), ...Array(gm ? +gm[1] : 0).fill('g')]
      if (L === 1) { const col = q.includes('הכדור אדום') ? 'r' : q.includes('הכדור כחול') ? 'b' : 'g'; p = balls.filter(b => b === col).length / balls.length }
      else {
        const repl = q.includes('ומחזירים'), ev = q.includes('שני הכדורים אדומים') ? (a, b) => a === 'r' && b === 'r' : q.includes('הראשון אדום והשני כחול') ? (a, b) => a === 'r' && b === 'b' : q.includes('אף אחד') ? (a, b) => a !== 'r' && b !== 'r' : (a, b) => a !== b
        let c = 0, t = 0
        balls.forEach((a, i) => balls.forEach((b, j) => { if (!repl && i === j) return; t++; if (ev(a, b)) c++ }))
        p = c / t
      }
    }
    near(got, p, 1e-12)
    if (typeof ex.answer === 'string') { const [n, d] = ex.answer.split('/').map(Number); assert.equal(gcdT(n, d), 1, 'reduced') }
  },
  'statistics'(ex, L) {
    if (L === 2) {
      const nums = [...ex.svg.matchAll(/>(\d+)<\/text>/g)].map(m => +m[1]), k = nums.length / 2, vals = nums.slice(0, k), fr = nums.slice(k)
      const data = vals.flatMap((v, i) => Array(fr[i]).fill(v)).sort((a, b) => a - b), N = data.length
      if (ex.q.includes('ממוצע')) return near(ex.answer, data.reduce((s, v) => s + v, 0) / N, 0.005)
      return near(ex.answer, N % 2 ? data[(N - 1) / 2] : (data[N / 2 - 1] + data[N / 2]) / 2)
    }
    const xs = ex.expr.split(', ').map(Number), n = xs.length, mean = xs.reduce((s, v) => s + v, 0) / n
    if (L === 3) return near(ex.answer, Math.sqrt(xs.reduce((s, v) => s + (v - mean) ** 2, 0) / n), 0.005)
    if (ex.q.includes('ממוצע')) return near(ex.answer, mean)
    const s = [...xs].sort((a, b) => a - b); near(ex.answer, s[(n - 1) / 2])
  },
  'exponents-roots'(ex) { near(val(ex.answer), toJs(ex.expr)(), 1e-9) },

  // grade 11
  'arithmetic-sequence'(ex) {
    const given = [...ex.expr.matchAll(/a([₀-₉]+) = (−?\d+)/g)].map(m => [+dig(m[1]), num(m[2])])
    const d = given.length === 1 ? field(ex.expr, 'd') : (given[1][1] - given[0][1]) / (given[1][0] - given[0][0])
    const a1 = given[0][1] - (given[0][0] - 1) * d
    const seq = Array.from({ length: 40 }, (_, i) => a1 + i * d)
    const asked = ex.expr.match(/([aS])([₀-₉]+) = \?/), n = +dig(asked[2])
    near(ex.answer, asked[1] === 'a' ? seq[n - 1] : seq.slice(0, n).reduce((s, v) => s + v, 0))
  },
  'geometric-sequence'(ex) {
    const e = ex.expr
    if (/a₂ = /.test(e)) { const q3 = field(e, 'a₅') / field(e, 'a₂'); return near(val(ex.answer), Math.cbrt(q3), 1e-9) }
    const a1 = field(e, 'a₁'), qs = e.match(/q = (−?[\d/]+)/)[1], q = val(qs.replace('−', '-'))
    if (e.includes('S = ?')) { let s = 0, t = a1; for (let i = 0; i < 400; i++) { s += t; t *= q } return near(val(ex.answer), s, 1e-9) }
    const asked = e.match(/([aS])([₀-₉]+) = \?/), n = +dig(asked[2])
    const seq = Array.from({ length: n }, (_, i) => a1 * q ** i)
    near(ex.answer, asked[1] === 'a' ? seq[n - 1] : seq.reduce((s, v) => s + v, 0))
  },
  'growth-decay'(ex, L) {
    const e = ex.expr, M0 = field(e, 'M₀')
    if (L < 3) return near(ex.answer, M0 * field(e, 'q') ** field(e, 't'), 0.51)
    if (e.includes('Mₜ = ')) return near(ex.answer, Math.abs(((field(e, 'Mₜ') / M0) ** (1 / field(e, 't')) - 1) * 100), 0.05)
    const q = field(e, 'q'), target = num(e.match(/Mₜ > (\d+)/)[1])
    let n = 0; while (M0 * q ** n <= target) n++
    assert.equal(ex.answer, n)
  },
  'polynomial-derivatives'(ex) { const f = fnOf(rhs(ex.expr)); checkFnChoice(ex, x => dnum(f, x), ex.expr) },
  'derivative-at-point'(ex) {
    const [fe, at] = parts(ex.expr), f = fnOf(rhs(fe)), x0 = num(at.match(/f′\((−?\d+)\)/)[1])
    near(val(ex.answer), dnum(f, x0), 1e-4 * Math.max(1, Math.abs(val(ex.answer))))
  },
  'tangent-line'(ex, L) {
    const [fe, le] = parts(ex.expr), f = fnOf(rhs(fe))
    let x0
    if (L < 3) x0 = num(ex.q.match(/x = (−?\d+)/)[1])
    else { const k = fnOf(rhs(le)); const m = k(1) - k(0); x0 = GRID.find(x => Math.abs(dnum(f, x) - m) < 1e-4); assert.ok(x0 !== undefined, 'tangency point') }
    const ok = c => { const g = fnOf(rhs(c)); return Math.abs(g(x0) - f(x0)) < 1e-6 && Math.abs((g(1) - g(0)) - dnum(f, x0)) < 1e-4 }
    assert.ok(ok(ex.answer), ex.answer)
    for (const c of ex.choices) if (c !== ex.answer) assert.ok(!ok(c), c)
  },
  'extremum-points'(ex, L) {
    const f = fnOf(rhs(ex.expr)), d = x => dnum(f, x)
    const crit = []
    for (let x = -12; x < 12; x += 0.25) if (d(x) === 0 || d(x) * d(x + 0.25) < 0) { let a = x, b = x + 0.25; for (let i = 0; i < 60; i++) { const m = (a + b) / 2; if (d(a) * d(m) <= 0) b = m; else a = m } crit.push((a + b) / 2) }
    const cs = [...new Set(crit.map(v => Math.round(v * 1e5) / 1e5))]
    if (L === 1) return sameSet([ex.answer], cs, 1e-4, 'extremum')
    if (L === 2) return sameSet(ex.answer, cs, 1e-4, 'extrema')
    assert.equal(cs.length, 2)
    const wantMax = ex.q.includes('מקסימום'), xm = cs.find(x => (wantMax ? d(x - 0.1) > 0 && d(x + 0.1) < 0 : d(x - 0.1) < 0 && d(x + 0.1) > 0))
    near(ex.answer, f(Math.round(xm)), 1e-9)
  },
  'increase-decrease'(ex) {
    const f = fnOf(rhs(ex.expr)), d = x => dnum(f, x, 1e-6)
    const crit = GRID.filter(x => Math.abs(d(x)) < 1e-6 || !Number.isFinite(f(x)))
    const pts = GRID.map(x => x + 0.125).filter(x => crit.every(c => Math.abs(c - x) > 0.1) && Math.abs(x) > 0.05)
    const parse = s => { const [inc, dec] = s.split(' ; '); return [region(inc.replace('עולה: ', '')), region(dec.replace('יורדת: ', ''))] }
    const good = s => { const [I, D] = parse(s); return pts.every(x => (d(x) > 0 ? I(x) && !D(x) : D(x) && !I(x))) }
    assert.ok(good(ex.answer), `${ex.expr} → ${ex.answer}`)
    for (const c of ex.choices) if (c !== ex.answer) assert.ok(!good(c), c)
  },
  'circle-equation'(ex, L) {
    const circ = s => { const [l, r] = s.split(' = '); const f = toJs(l), R = num(r); return (x, y) => f(x, y) - R }
    const centre = g => [-(g(1, 0) - g(-1, 0)) / 4, -(g(0, 1) - g(0, -1)) / 4]
    if (L === 1) { const [a, b] = centre(circ(ex.expr)); const [p] = ptsOf(ex.answer); near(p[0], a); near(p[1], b); return }
    if (L === 2) { const g = circ(ex.expr), [a, b] = centre(g); return near(ex.answer, Math.sqrt(-g(a, b))) }
    const [[mx, my], [px, py]] = ptsOf(ex.q)
    const ok = s => { const g = circ(s), [a, b] = centre(g); return Math.abs(a - mx) < 1e-9 && Math.abs(b - my) < 1e-9 && Math.abs(g(px, py)) < 1e-9 }
    assert.ok(ok(ex.answer))
    for (const c of ex.choices) if (c !== ex.answer) assert.ok(!ok(c), c)
  },
  'sine-cosine-law'(ex, L) {
    const e = ex.expr
    if (L === 1) return near(ex.answer, field(e, 'a') * Math.sin(field(e, 'β') * deg) / Math.sin(field(e, 'α') * deg), 0.005)
    if (L === 2) { const b = field(e, 'b'), c = field(e, 'c'), A = field(e, 'α') * deg; return near(ex.answer, Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(A)), 0.005) }
    const a = field(e, 'a'), b = field(e, 'b'), c = field(e, 'c')
    assert.ok(a < b + c && b < a + c && c < a + b, 'triangle inequality')
    near(ex.answer, Math.acos((b * b + c * c - a * a) / (2 * b * c)) / deg, 0.05)
  },
  'normal-distribution'(ex, L) {
    const mu = field(ex.expr, 'μ'), s = field(ex.expr, 'σ')
    const pdf = x => Math.exp(-(((x - mu) / s) ** 2) / 2) / (s * Math.sqrt(2 * Math.PI))
    const P = (a, b) => simpson(pdf, Math.max(a, mu - 12 * s), Math.min(b, mu + 12 * s), 4000) * 100
    if (L === 1) return near(ex.answer, (field(ex.expr, 'x') - mu) / s)
    const q = ex.q
    if (L === 2) {
      let m
      if ((m = q.match(/בין (\d+) ל-(\d+)/))) return near(ex.answer, P(+m[1], +m[2]), 0.02)
      if ((m = q.match(/מעל (\d+)/))) return near(ex.answer, P(+m[1], Infinity), 0.02)
      m = q.match(/מתחת ל-(\d+)/); return near(ex.answer, P(-Infinity, +m[1]), 0.02)
    }
    const N = ex.expr.includes('N = ') ? field(ex.expr, 'N') : 0
    if (N) { let m = q.match(/מעל (\d+)/); const p = m ? P(+m[1], Infinity) : P(-Infinity, +(m = q.match(/מתחת ל-(\d+)/))[1]); return near(ex.answer, N * p / 100, 1) }
    const pc = num(q.match(/([\d.]+)% מהערכים/)[1])
    near(P(-Infinity, ex.answer), pc, 0.02)
  },
  'trig-equations'(ex) {
    const F = { sin: x => Math.sin(x * deg), cos: x => Math.cos(x * deg), tan: x => Math.tan(x * deg) }
    let s = ex.expr.replace(/−/g, '-').replace(/√(\d)/g, 'Math.sqrt($1)')
    s = s.replace(/(\d)(sin|cos|tan)/g, '$1*$2').replace(/(sin|cos|tan)²x/g, '$1(x)**2').replace(/(sin|cos|tan) (\d*)x/g, (_, f, k) => `${f}(${k || 1}*x)`)
    const [l, r] = s.split(' = ')
    const h = new Function('sin', 'cos', 'tan', 'x', `return (${l}) - (${r})`)
    const sols = Array.from({ length: 48 }, (_, i) => i * 7.5).filter(x => Math.abs(h(F.sin, F.cos, F.tan, x)) < 1e-9)
    sameSet(ex.answer, sols, 1e-9, ex.expr)
  },

  // grade 12
  'antiderivative'(ex, L) {
    const f = fnOf(rhs(ex.expr))
    const strip = s => s.replace(/ \+ C$/, '')
    if (L !== 2) return checkFnChoice(ex, f, ex.expr, strip, F => x => dnum(F, x, 1e-6))
    const [[x0, y0]] = ptsOf(ex.q)
    const ok = c => { const F = fnOf(rhs(c)); return Math.abs(F(x0) - y0) < 1e-9 && SAMPLE.every(x => Math.abs(dnum(F, x) - f(x)) < 1e-4 * Math.max(1, Math.abs(f(x)))) }
    assert.ok(ok(ex.answer), ex.answer)
    for (const c of ex.choices) if (c !== ex.answer) assert.ok(!ok(c), c)
  },
  'definite-integral'(ex) {
    const m = ex.expr.match(/^∫([₀-₉₋]+)([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+) \((.*)\) dx$/)
    const p = +dig(m[1]), q = +[...m[2]].map(c => SUPM[c]).join(''), f = fnOf(m[3])
    near(val(ex.answer), simpson(f, p, q), 1e-6)
    if (typeof ex.answer === 'string') { const [n, d] = ex.answer.split('/').map(Number); assert.equal(gcdT(n, d), 1) }
  },
  'area-between-curves'(ex) {
    const ps = parts(ex.expr).map(s => fnOf(rhs(s)))
    const h = ps.length === 1 ? ps[0] : x => ps[0](x) - ps[1](x)
    const [x1, x2] = quadRoots(quadCoef(h)).sort((a, b) => a - b)
    near(val(ex.answer), simpson(x => Math.abs(h(x)), x1, x2), 1e-6)
  },
  'volume-of-revolution'(ex) {
    const [fe, range] = parts(ex.expr), f = fnOf(rhs(fe)), [p, q] = range.split(' ≤ x ≤ ').map(Number)
    near(val(ex.answer), simpson(x => f(x) ** 2, p, q), 1e-6)
  },
  'exponential-log-equations'(ex) {
    const [l, r] = ex.expr.split(' = '), L = fnOf(l), R = fnOf(r), h = x => L(x) - R(x)
    const roots = []
    for (let x = -30.0037; x < 300; x += 0.01) {
      const a = h(x), b = h(x + 0.01)
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue
      if (a === 0) roots.push(x)
      else if (a * b < 0) { let lo = x, hi = x + 0.01; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (h(lo) * h(m) <= 0) hi = m; else lo = m } roots.push((lo + hi) / 2) }
    }
    const want = [...new Set(roots.map(v => Math.round(v * 1e6) / 1e6))]
    sameSet(Array.isArray(ex.answer) ? ex.answer : [val(ex.answer)], want, ex.tol ? 0.0051 : 1e-6, ex.expr)
  },
  'logarithm-rules'(ex) { near(val(ex.answer), toJs(ex.expr)(), 1e-9) },
  'exp-ln-derivatives'(ex) { const f = fnOf(rhs(ex.expr)); checkFnChoice(ex, x => dnum(f, x, 1e-6), ex.expr) },
  'chain-quotient-derivatives'(ex) { const f = fnOf(rhs(ex.expr)); checkFnChoice(ex, x => dnum(f, x, 1e-6), ex.expr) },
  'exp-log-extrema'(ex, L) {
    const f = fnOf(rhs(ex.expr)), d = x => dnum(f, x, 1e-6)
    const crit = []
    for (let x = -12.0371; x < 12; x += 0.125) { const a = d(x), b = d(x + 0.125); if (Number.isFinite(a) && Number.isFinite(b) && a * b < 0) { let lo = x, hi = x + 0.125; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (d(lo) * d(m) <= 0) hi = m; else lo = m } crit.push((lo + hi) / 2) } }
    if (L === 1) return sameSet([ex.answer], crit, 1e-4, 'extremum')
    if (L === 2) return sameSet(ex.answer, crit, 1e-4, 'extrema')
    assert.equal(crit.length, 1)
    near(ex.answer, f(crit[0]), 0.005)
  },
  'vectors'(ex, L) {
    const [u, v] = [...ex.expr.matchAll(/\(([^()]*)\)/g)].map(m => m[1].split(', '))
    if (L === 1) {
      const m = ex.q.match(/הווקטור (−?\d*)u ([+−]) (\d*)v\?/)
      const p = m[1] === '' ? 1 : m[1] === '−' ? -1 : num(m[1]), q = (m[2] === '+' ? 1 : -1) * (m[3] === '' ? 1 : +m[3])
      const want = u.map((x, i) => p * num(x) + q * num(v[i]))
      ptsOf3(ex.answer).forEach((x, i) => near(x, want[i])); return
    }
    if (ex.q.includes('t')) {
      const t = ex.answer, uu = u.map(x => (x === 't' ? t : num(x)))
      return assert.equal(uu.reduce((s, x, i) => s + x * num(v[i]), 0), 0)
    }
    const a = u.map(num), b = v.map(num), dot = a.reduce((s, x, i) => s + x * b[i], 0)
    if (L === 2) return assert.equal(ex.answer, dot)
    near(ex.answer, Math.acos(dot / (Math.hypot(...a) * Math.hypot(...b))) / deg, 0.05)
  },
  'complex-numbers'(ex, L) {
    const want = L === 3 ? (() => { const m = ex.expr.match(/^\((.*)\)([⁰¹²³⁴⁵⁶⁷⁸⁹]+)$/); const z = cParse(m[1]); let w = [1, 0]; const n = +[...m[2]].map(c => SUPM[c]).join(''); for (let i = 0; i < n; i++) w = cMul(w, z); return w })()
      : (() => { const m = ex.expr.match(/^\((.*)\) (.) \((.*)\)$/); const a = cParse(m[1]), b = cParse(m[3]); return m[2] === '+' ? [a[0] + b[0], a[1] + b[1]] : m[2] === '−' ? [a[0] - b[0], a[1] - b[1]] : m[2] === '·' ? cMul(a, b) : cDiv(a, b) })()
    const ok = c => { const z = cParse(c); return Math.abs(z[0] - want[0]) < 1e-6 && Math.abs(z[1] - want[1]) < 1e-6 }
    assert.ok(ok(ex.answer), `${ex.expr} = ${ex.answer}`)
    for (const c of ex.choices) if (c !== ex.answer) assert.ok(!ok(c), c)
  },
  'induction'(ex, L) {
    const [lhs, rhsT] = ex.expr.split(' = ')
    const last = fnOf(lhs.split(' + … + ')[1])
    const S = n => { let s = 0; for (let k = 1; k <= n; k++) s += last(k); return s }
    if (L === 1) { const n = +ex.q.match(/n = (\d+)/)[1]; return near(val(ex.answer), S(n), 1e-9) }
    const target = L === 2 ? S : n => S(n + 1) - S(n)
    const ok = c => [1, 2, 3, 4, 5, 6, 7, 8].every(n => Math.abs(fnOf(c)(n) - target(n)) < 1e-9)
    assert.ok(ok(ex.answer), ex.answer)
    if (L === 3) assert.ok(Math.abs(fnOf(rhsT)(5) - S(5)) < 1e-9, 'closed form in statement')
    for (const c of ex.choices) if (c !== ex.answer) assert.ok(!ok(c), c)
  },
}
function gcdT(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a }
const ptsOf3 = s => s.slice(1, -1).split(', ').map(num)
function cParse(s) {
  const t = s.replace(/−/g, '-').replace(/\s+/g, '')
  let re = 0, im = 0
  for (const term of t.match(/[+-]?[^+-]+/g)) {
    if (term.includes('i')) { const c = term.replace('i', ''); im += c === '' || c === '+' ? 1 : c === '-' ? -1 : num(c.replace(/√3/, String(Math.sqrt(3))).replace(/^([+-]?)$/, '$11')) }
    else re += num(term.replace(/√3/, String(Math.sqrt(3))))
  }
  return [re, im]
}
const cMul = ([a, b], [c, d]) => [a * c - b * d, a * d + b * c]
const cDiv = ([a, b], [c, d]) => { const m = c * c + d * d; return [(a * c + b * d) / m, (b * c - a * d) / m] }

// ---------- tests ----------
const ALL = Object.entries(GRADES).flatMap(([g, list]) => list.map(t => [Number(g), t]))

test('topic metadata is complete and unique', () => {
  for (const [g, list] of Object.entries(GRADES)) {
    assert.ok(list.length >= 10 && list.length <= 14, `grade ${g} topic count ${list.length}`)
    assert.equal(new Set(list.map(t => t.slug)).size, list.length, `grade ${g} unique slugs`)
    assert.equal(new Set(list.map(t => t.title)).size, list.length, `grade ${g} unique titles`)
  }
  assert.equal(new Set(ALL.map(([, t]) => t.desc)).size, ALL.length, 'unique descriptions')
  for (const [g, t] of ALL) {
    const id = `${g}/${t.slug}`
    assert.match(t.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, id)
    assert.equal(t.grade, g, id)
    assert.ok(STRANDS.includes(t.strand), `${id} strand`)
    assert.match(t.title, /יח״ל/, `${id} title marks the level`)
    for (const f of ['title', 'emoji', 'desc', 'intro']) assert.ok(typeof t[f] === 'string' && t[f].trim(), `${id} ${f}`)
    assert.ok(t.desc.length >= 120 && t.desc.length <= 160, `${id} desc length ${t.desc.length}`)
    assert.ok(t.tips.length >= 2 && t.tips.length <= 4, `${id} tips`)
    assert.ok(t.faq.length >= 2 && t.faq.length <= 3 && t.faq.every(f => f.q && f.a), `${id} faq`)
    assert.ok(t.example.q && t.example.steps.length && t.example.a, `${id} example`)
    assert.equal(t.levels.length, 3, `${id} levels`)
    assert.ok(!JSON.stringify([t.title, t.desc, t.intro, t.tips, t.example, t.faq, t.levels]).includes('undefined'), `${id} text`)
  }
})

for (const [g, t] of ALL) {
  test(`grade ${g} · ${t.slug}: ${SEEDS} seeds × 3 levels are valid and correct`, () => {
    assert.ok(V[t.slug], `verifier for ${t.slug}`)
    for (const L of [1, 2, 3]) {
      const seen = new Set()
      for (let seed = 1; seed <= SEEDS; seed++) {
        const ex = t.gen(L, createRng(seed * 7919 + L))
        const id = `${g}/${t.slug} L${L} seed ${seed}`
        assert.ok(typeof ex.q === 'string' && ex.q.trim(), `${id} q`)
        assert.ok(TYPES.includes(ex.type), `${id} type`)
        const text = [ex.q, ex.expr, ex.explain, ex.svg, ex.unit, ...(ex.choices || [])].filter(v => v !== undefined).join(' ')
        assert.ok(!/undefined|NaN|Infinity|\[object/.test(text), `${id} bad text: ${text}`)
        assert.ok(typeof ex.explain === 'string' && ex.explain.trim(), `${id} explain`)
        if (ex.svg) assert.match(ex.svg, /^<svg [^>]*viewBox="[^"]+"[\s\S]*<\/svg>$/, `${id} svg`)
        if (ex.type === 'number') assert.ok(typeof ex.answer === 'number' && Number.isFinite(ex.answer), `${id} number ${ex.answer}`)
        if (ex.type === 'numbers') { assert.ok(Array.isArray(ex.answer) && ex.answer.length >= 1 && ex.answer.every(Number.isFinite), `${id} numbers`); assert.equal(new Set(ex.answer).size, ex.answer.length, `${id} distinct numbers`) }
        if (ex.type === 'fraction') { assert.match(ex.answer, /^-?\d+\/\d+$/, `${id} fraction`); const [n, d] = ex.answer.split('/').map(Number); assert.ok(d > 1 && gcdT(n, d) === 1, `${id} reduced fraction ${ex.answer}`) }
        if (ex.type === 'choice') {
          assert.ok(Array.isArray(ex.choices) && ex.choices.length >= 3 && ex.choices.length <= 5, `${id} choices ${JSON.stringify(ex.choices)}`)
          assert.ok(ex.choices.includes(ex.answer), `${id} answer in choices`)
          assert.equal(new Set(ex.choices).size, ex.choices.length, `${id} unique choices`)
        }
        if (ex.tol !== undefined) assert.ok(ex.tol > 0 && ex.tol <= 1, `${id} tol`)
        assert.deepEqual(exerciseProblems(ex), [], `${id} contract`)
        try { V[t.slug](ex, L) } catch (e) { e.message = `${id}: ${e.message}\n  q: ${ex.q}\n  expr: ${ex.expr}\n  answer: ${JSON.stringify(ex.answer)}`; throw e }
        seen.add(JSON.stringify([ex.q, ex.expr, ex.svg]))
      }
      assert.ok(seen.size > 8, `${g}/${t.slug} L${L} variety ${seen.size}`)
    }
  })
}

test('levels genuinely differ (different questions per level for the same seed)', () => {
  for (const [g, t] of ALL) {
    let diff = 0
    for (let seed = 1; seed <= 30; seed++) {
      const qs = [1, 2, 3].map(L => { const e = t.gen(L, createRng(seed)); return e.q + '|' + e.expr + '|' + e.type })
      if (new Set(qs).size === 3) diff++
    }
    assert.ok(diff >= 25, `${g}/${t.slug} levels too similar (${diff}/30)`)
  }
})
