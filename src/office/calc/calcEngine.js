// /tools/calculator — scientific calculator engine (pure, no DOM).
// lexer → recursive-descent parser (AST with source ranges) → evaluator, exact-form recognition
// (3/4, 2√2, π/6), number formatting, step-by-step explanation and small editing helpers.

export class CalcError extends Error {
  constructor(message, s = 0, e = s) { super(message); this.s = s; this.e = e }
}

// ── lexer ──
// [text in source, function id]; longest first so "sin⁻¹" wins over "sin"
const FUNC_NAMES = [
  ['arcsin', 'asin'], ['arccos', 'acos'], ['arctan', 'atan'], ['sin⁻¹', 'asin'], ['cos⁻¹', 'acos'], ['tan⁻¹', 'atan'],
  ['asin', 'asin'], ['acos', 'acos'], ['atan', 'atan'], ['sqrt', 'sqrt'], ['cbrt', 'cbrt'], ['frac', 'frac'], ['root', 'root'],
  ['sin', 'sin'], ['cos', 'cos'], ['tan', 'tan'], ['log', 'log'], ['abs', 'abs'], ['exp', 'exp'], ['ln', 'ln'],
  ['√', 'sqrt'], ['∛', 'cbrt'],
]
const CONST_NAMES = [['Ans', 'ans'], ['ANS', 'ans'], ['ans', 'ans'], ['pi', 'pi'], ['π', 'pi'], ['e', 'e'], ['M', 'mem']]
const OPS = { '+': '+', '-': '−', '−': '−', '–': '−', '*': '×', '×': '×', '·': '×', '/': '÷', '÷': '÷', '^': '^', '!': '!', '%': '%', '²': '²', '³': '³', P: 'P', C: 'C' }
export const ARITY = { frac: 2, root: 2 }
export const FUNC_LABEL = { sin: 'sin', cos: 'cos', tan: 'tan', asin: 'sin⁻¹', acos: 'cos⁻¹', atan: 'tan⁻¹', log: 'log', ln: 'ln', sqrt: '√', cbrt: '∛', abs: 'abs', exp: 'exp', frac: 'frac', root: 'root' }

/**
 * Split source into tokens { k, v, s, e, open? }.
 * k: num | func | const | var | op | ( | ) | ; | bad. With { strict:true } an unknown character throws.
 */
export function tokenize(src, { vars = false, strict = true } = {}) {
  const out = []
  let i = 0
  while (i < src.length) {
    const ch = src[i]
    if (/\s/.test(ch)) { i++; continue }
    const num = /^(\d+\.?\d*|\.\d+)/.exec(src.slice(i, i + 40))
    if (num) { out.push({ k: 'num', v: num[0], s: i, e: i + num[0].length }); i += num[0].length; continue }
    if (src.startsWith('⁻¹', i)) { out.push({ k: 'op', v: '⁻¹', s: i, e: i + 2 }); i += 2; continue }
    const rest = src.slice(i)
    const fn = FUNC_NAMES.find(([n]) => /^[a-z]/.test(n) ? rest.toLowerCase().startsWith(n) : rest.startsWith(n))
    if (fn) {
      const end = i + fn[0].length
      const open = src[end] === '('
      out.push({ k: 'func', v: fn[1], s: i, e: open ? end + 1 : end, open })
      i = open ? end + 1 : end; continue
    }
    const c = CONST_NAMES.find(([n]) => rest.startsWith(n))
    if (c) { out.push({ k: 'const', v: c[1], s: i, e: i + c[0].length }); i += c[0].length; continue }
    if (vars && (ch === 'x' || ch === 'X')) { out.push({ k: 'var', v: 'x', s: i, e: i + 1 }); i++; continue }
    if (ch === '(' || ch === ')' || ch === ';') { out.push({ k: ch, v: ch, s: i, e: i + 1 }); i++; continue }
    if (OPS[ch]) { out.push({ k: 'op', v: OPS[ch], s: i, e: i + 1 }); i++; continue }
    if (strict) throw new CalcError(`תו לא מוכר: „${ch}”`, i, i + 1)
    out.push({ k: 'bad', v: ch, s: i, e: i + 1 }); i++
  }
  return out
}

// ── parser ──
const startsValue = t => t && (t.k === 'num' || t.k === 'const' || t.k === 'var' || t.k === 'func' || t.k === '(')

/** Parse source into an AST. Empty input → null. Missing ")" at the end are closed automatically. */
export function parse(src, opts = {}) {
  const toks = tokenize(src, opts)
  if (!toks.length) return null
  let i = 0
  const peek = () => toks[i]
  const end = src.length
  const missing = () => {
    const prev = toks[i - 1]
    if (!prev) return new CalcError('התרגיל ריק', 0, 0)
    if (prev.k === 'op' || prev.k === '(' || prev.k === 'func' || prev.k === ';') {
      const what = prev.k === 'op' ? `אחרי ${prev.v}` : prev.k === ';' ? 'במכנה' : 'בתוך הסוגריים'
      return new CalcError(`חסר מספר ${what}`, prev.s, prev.e)
    }
    return new CalcError('חסר מספר', end, end)
  }

  function expectClose(open) {
    const t = peek()
    if (!t) return end
    if (t.k === ')') { i++; return t.e }
    throw new CalcError('חסר סוגר „)”', open.s, t.s)
  }

  function primary() {
    const t = peek()
    if (!t) throw missing()
    if (t.k === 'num') { i++; if (t.v === '.') throw new CalcError('נקודה בלי מספר', t.s, t.e); return { t: 'num', v: parseFloat(t.v), s: t.s, e: t.e } }
    if (t.k === 'const') { i++; return { t: 'const', name: t.v, s: t.s, e: t.e } }
    if (t.k === 'var') { i++; return { t: 'var', s: t.s, e: t.e } }
    if (t.k === '(') {
      i++
      if (peek()?.k === ')') throw new CalcError('הסוגריים ריקים — חסר מספר בתוכם', t.s, peek().e)
      const a = expr()
      const e = expectClose(t)
      return { t: 'group', a, s: t.s, e }
    }
    if (t.k === 'func') {
      i++
      const arity = ARITY[t.v] || 1
      if (t.open) {
        if (peek()?.k === ')') throw new CalcError(`חסר מספר בתוך ${FUNC_LABEL[t.v]}( )`, t.s, peek().e)
        const args = [expr()]
        while (peek()?.k === ';') { i++; args.push(expr()) }
        if (args.length < arity) throw new CalcError(t.v === 'frac' ? 'חסר מכנה לשבר' : 'חסר מספר', t.s, t.e)
        if (args.length > arity) throw new CalcError('יותר מדי מספרים בתוך הפונקציה', t.s, t.e)
        const e = expectClose(t)
        return { t: 'func', name: t.v, args, s: t.s, e }
      }
      if (arity > 1) throw new CalcError('חסר סוגר „(”', t.s, t.e)
      const a = unary()
      return { t: 'func', name: t.v, args: [a], s: t.s, e: a.e }
    }
    if (t.k === ')') throw new CalcError(i === 0 ? 'סוגר „)” בלי סוגר פותח' : 'חסר מספר לפני „)”', t.s, t.e)
    if (t.k === ';') throw new CalcError('חסר מספר', t.s, t.e)
    if (t.k === 'op') throw new CalcError(`חסר מספר לפני ${t.v}`, t.s, t.e)
    throw new CalcError('תו לא מוכר', t.s, t.e)
  }
  function postfix() {
    let a = primary()
    for (;;) {
      const t = peek()
      if (t && t.k === 'op' && ['!', '%', '²', '³', '⁻¹'].includes(t.v)) { i++; a = { t: 'post', op: t.v, a, s: a.s, e: t.e, os: t.s, oe: t.e } }
      else return a
    }
  }
  function power() {
    const a = postfix()
    const t = peek()
    if (t && t.k === 'op' && t.v === '^') {
      i++
      const b = unary()
      return { t: 'bin', op: '^', a, b, s: a.s, e: b.e, os: t.s, oe: t.e }
    }
    return a
  }
  function unary() {
    const t = peek()
    if (t && t.k === 'op' && (t.v === '−' || t.v === '+')) {
      i++
      const a = unary()
      return t.v === '−' ? { t: 'neg', a, s: t.s, e: a.e } : a
    }
    return power()
  }
  function imp() {
    let a = unary()
    while (startsValue(peek())) {
      const b = unary()
      a = { t: 'bin', op: '×', implicit: true, a, b, s: a.s, e: b.e, os: b.s, oe: b.s }
    }
    return a
  }
  function binLevel(next, ops) {
    return () => {
      let a = next()
      for (;;) {
        const t = peek()
        if (t && t.k === 'op' && ops.includes(t.v)) {
          i++
          const b = next()
          a = { t: 'bin', op: t.v, a, b, s: a.s, e: b.e, os: t.s, oe: t.e }
        } else return a
      }
    }
  }
  const comb = binLevel(imp, ['P', 'C'])
  const prod = binLevel(comb, ['×', '÷'])
  const sum = binLevel(prod, ['+', '−'])
  function expr() { return sum() }

  const ast = expr()
  const t = peek()
  if (t) {
    if (t.k === ')') throw new CalcError('יש סוגר „)” מיותר', t.s, t.e)
    if (t.k === ';') throw new CalcError('„;” מותר רק בתוך שבר או שורש', t.s, t.e)
    throw new CalcError('משהו כאן לא ברור', t.s, t.e)
  }
  return ast
}

// ── evaluation ──
const DEG = Math.PI / 180
const snap = v => (Math.abs(v) < 1e-14 ? 0 : v)
const isInt = v => Number.isInteger(v) || Math.abs(v - Math.round(v)) < 1e-9 * Math.max(1, Math.abs(v))

function trig(name, x, angle, node) {
  if (angle === 'deg') {
    const r = ((x % 360) + 360) % 360
    if (Math.abs(r - Math.round(r)) < 1e-9 && Math.round(r) % 90 === 0) {
      const q = Math.round(r) / 90 % 4
      if (name === 'sin') return [0, 1, 0, -1][q]
      if (name === 'cos') return [1, 0, -1, 0][q]
      if (q % 2) throw new CalcError('tan לא מוגדר בזווית הזו (90°, 270°…)', node.s, node.e)
      return 0
    }
    x *= DEG
  } else if (name === 'tan' && Math.abs(Math.cos(x)) < 1e-15) {
    throw new CalcError('tan לא מוגדר בזווית הזו (π/2…)', node.s, node.e)
  }
  return snap(Math[name](x))
}
function invTrig(name, v, angle, node) {
  if (name !== 'atan') {
    if (Math.abs(v) > 1 + 1e-12) throw new CalcError(`${FUNC_LABEL[name]} מקבל רק מספרים בין 1− ל־1`, node.s, node.e)
    v = Math.max(-1, Math.min(1, v))
  }
  let r = Math[name](v)
  if (angle === 'deg') { r /= DEG; if (Math.abs(r - Math.round(r)) < 1e-9) r = Math.round(r) }
  return r
}
function factorial(n, node) {
  if (n < 0 || !isInt(n) || n > 170) throw new CalcError('עצרת (!) רק למספר שלם בין 0 ל־170', node.s, node.e)
  let r = 1
  for (let k = 2; k <= Math.round(n); k++) r *= k
  return r
}
function perm(n, r, node, choose) {
  if (!isInt(n) || !isInt(r) || r < 0 || n < r) throw new CalcError(`${choose ? 'nCr' : 'nPr'} צריך מספרים שלמים עם n ≥ r ≥ 0`, node.s, node.e)
  n = Math.round(n); r = Math.round(r)
  if (choose) r = Math.min(r, n - r)
  let v = 1
  for (let k = 0; k < r; k++) v = choose ? v * (n - k) / (k + 1) : v * (n - k)
  return choose ? Math.round(v) : v
}
function pow(a, b, node) {
  if (a === 0 && b === 0) throw new CalcError('0 בחזקת 0 אינו מוגדר', node.s, node.e)
  if (a === 0 && b < 0) throw new CalcError('חלוקה באפס', node.s, node.e)
  if (a < 0 && !isInt(b)) {
    const f = toFraction(b, 99)
    if (f && f[1] % 2 === 1) return (f[0] % 2 ? -1 : 1) * Math.pow(-a, b)
    throw new CalcError('חזקה שאינה שלמה של מספר שלילי', node.s, node.e)
  }
  return Math.pow(a, isInt(b) ? Math.round(b) : b)
}

/** Evaluate an AST. ctx: { angle: 'deg'|'rad', ans, mem, x } */
export function evalNode(n, ctx = {}) {
  const angle = ctx.angle || 'deg'
  const ev = m => evalNode(m, ctx)
  let v
  switch (n.t) {
    case 'num': v = n.v; break
    case 'const': v = n.name === 'pi' ? Math.PI : n.name === 'e' ? Math.E : n.name === 'ans' ? (ctx.ans ?? 0) : (ctx.mem ?? 0); break
    case 'var': v = ctx.x ?? 0; break
    case 'group': v = ev(n.a); break
    case 'neg': v = -ev(n.a); break
    case 'post': {
      const a = ev(n.a)
      if (n.op === '!') v = factorial(a, n)
      else if (n.op === '%') v = a / 100
      else if (n.op === '²') v = a * a
      else if (n.op === '³') v = a * a * a
      else { if (a === 0) throw new CalcError('חלוקה באפס', n.os, n.oe); v = 1 / a }
      break
    }
    case 'bin': {
      const a = ev(n.a)
      // Google-style percent: 200 + 10% = 220
      if ((n.op === '+' || n.op === '−') && n.b.t === 'post' && n.b.op === '%') {
        const p = ev(n.b.a) / 100
        v = n.op === '+' ? a + a * p : a - a * p
        break
      }
      const b = ev(n.b)
      if (n.op === '+') v = a + b
      else if (n.op === '−') v = a - b
      else if (n.op === '×') v = a * b
      else if (n.op === '÷') { if (b === 0) throw new CalcError('חלוקה באפס', n.os, n.oe === n.os ? n.e : n.b.e); v = a / b }
      else if (n.op === '^') v = pow(a, b, n)
      else v = perm(a, b, n, n.op === 'C')
      break
    }
    case 'func': {
      const a = ev(n.args[0])
      const f = n.name
      if (f === 'sin' || f === 'cos' || f === 'tan') v = trig(f, a, angle, n)
      else if (f === 'asin' || f === 'acos' || f === 'atan') v = invTrig(f, a, angle, n)
      else if (f === 'sqrt') { if (a < -1e-15) throw new CalcError('שורש של מספר שלילי', n.s, n.e); v = Math.sqrt(Math.max(0, a)) }
      else if (f === 'cbrt') v = Math.cbrt(a)
      else if (f === 'log' || f === 'ln') { if (a <= 0) throw new CalcError(`${f} של אפס או של מספר שלילי אינו מוגדר`, n.s, n.e); v = f === 'log' ? Math.log10(a) : Math.log(a) }
      else if (f === 'abs') v = Math.abs(a)
      else if (f === 'exp') v = Math.exp(a)
      else if (f === 'frac') { const b = ev(n.args[1]); if (b === 0) throw new CalcError('חלוקה באפס — המכנה הוא 0', n.args[1].s, n.args[1].e); v = a / b }
      else if (f === 'root') {
        const x = ev(n.args[1])
        if (a === 0) throw new CalcError('שורש מסדר 0 אינו מוגדר', n.s, n.e)
        if (x < 0) {
          if (isInt(a) && Math.round(a) % 2) v = -Math.pow(-x, 1 / a)
          else throw new CalcError('שורש זוגי של מספר שלילי', n.s, n.e)
        } else v = Math.pow(x, 1 / a)
        if (isInt(v)) v = Math.round(v)
      }
      break
    }
    default: throw new CalcError('שגיאה', n.s, n.e)
  }
  if (!Number.isFinite(v)) throw new CalcError(Number.isNaN(v) ? 'התוצאה אינה מספר' : 'המספר גדול מדי', n.s, n.e)
  return v
}

/** Evaluate source text → { ok:true, value, ast } | { ok:false, error, s, e } | { ok:false, empty:true } */
export function evaluate(src, ctx = {}) {
  try {
    const ast = parse(src, { vars: ctx.vars })
    if (!ast) return { ok: false, empty: true }
    return { ok: true, value: evalNode(ast, ctx), ast }
  } catch (err) {
    if (err instanceof CalcError) return { ok: false, error: err.message, s: err.s, e: err.e }
    throw err
  }
}

/** A fast f(x) for graphs; returns NaN where undefined. Throws CalcError on syntax errors. */
export function compile(src, ctx = {}) {
  const ast = parse(src, { vars: true })
  if (!ast) return null
  return x => { try { return evalNode(ast, { ...ctx, x }) } catch { return NaN } }
}

// ── exact forms ──
export const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a }

/** Best fraction p/q (q ≤ maxDen) equal to x within a tiny tolerance, else null. */
export function toFraction(x, maxDen = 10000, tol = 1e-11) {
  if (!Number.isFinite(x)) return null
  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x)
  if (ax > 1e12) return null
  let h1 = 1; let h0 = 0; let k1 = 0; let k0 = 1; let b = ax
  for (let n = 0; n < 40; n++) {
    const a = Math.floor(b)
    const h2 = a * h1 + h0; const k2 = a * k1 + k0
    if (k2 > maxDen) break
    h0 = h1; h1 = h2; k0 = k1; k1 = k2
    if (Math.abs(ax - h1 / k1) <= tol * Math.max(1, ax)) return [sign * h1, k1]
    const fr = b - a
    if (fr < 1e-15) break
    b = 1 / fr
  }
  return null
}

function squareFree(n) {
  let k = 1; let m = n
  for (let i = 2; i * i <= m; i++) while (m % (i * i) === 0) { m /= i * i; k *= i }
  return [k, m]
}

/**
 * Recognise value as sign·num·√rad·(π?)/den. Returns { sign, num, den, rad, pi } or null.
 * Integers come back too (den 1, rad 1).
 */
export function exactForm(v) {
  if (!Number.isFinite(v)) return null
  if (Math.abs(v) < 1e-14) return { sign: 1, num: 0, den: 1, rad: 1, pi: false }
  const sign = v < 0 ? -1 : 1
  const a = Math.abs(v)
  const f = toFraction(a, 10000)
  if (f && f[0] < 1e12) return { sign, num: f[0], den: f[1], rad: 1, pi: false }
  const fp = toFraction(a / Math.PI, 1000, 1e-12)
  if (fp && fp[0] <= 1000) return { sign, num: fp[0], den: fp[1], rad: 1, pi: true }
  const fs = toFraction(a * a, 10000, 1e-12)
  if (fs && fs[0] * fs[1] < 1e9) {
    const [k, m] = squareFree(fs[0] * fs[1])
    if (m > 1) {
      const g = gcd(k, fs[1])
      const num = k / g; const den = fs[1] / g
      if (Math.abs(num * Math.sqrt(m) / den - a) <= 1e-10 * Math.max(1, a)) return { sign, num, den, rad: m, pi: false }
    }
  }
  return null
}
/** Is the exact form more informative than the decimal? (a real fraction, a root or π) */
export const isNiceExact = x => !!x && (x.den > 1 || x.rad > 1 || x.pi)

/** Plain-text exact form, e.g. "3/4", "−2√2", "π/6", "√3/2". */
export function exactText(x, { mixed = false } = {}) {
  if (!x) return ''
  const sgn = x.sign < 0 && x.num !== 0 ? '−' : ''
  if (mixed && x.rad === 1 && !x.pi && x.den > 1 && x.num > x.den) {
    const w = Math.floor(x.num / x.den)
    return `${sgn}${w} ${x.num % x.den}/${x.den}`
  }
  const coef = x.num === 1 && (x.rad > 1 || x.pi) ? '' : String(x.num)
  return `${sgn}${coef}${x.rad > 1 ? '√' + x.rad : ''}${x.pi ? 'π' : ''}${x.den > 1 ? '/' + x.den : ''}`
}
/** Source text that re-creates the exact value inside an expression. */
export function exactSource(x) {
  const top = `${x.num === 1 && (x.rad > 1 || x.pi) ? '' : x.num}${x.rad > 1 ? `√(${x.rad})` : ''}${x.pi ? 'π' : ''}`
  const body = x.den > 1 ? `frac(${top};${x.den})` : top
  return x.sign < 0 ? `(−${body})` : body
}

// ── decimal formatting ──
const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }
export const toSup = s => String(s).split('').map(c => SUP[c] ?? c).join('')

/**
 * Format like a school calculator: up to `digits` significant digits, no float noise,
 * "…" when digits were cut, scientific ×10ⁿ outside 10⁻⁶…10¹⁰.
 * Returns { text, mant, exp, cut }.
 */
export function formatDecimal(v, digits = 10) {
  if (!Number.isFinite(v)) return { text: '—', cut: false }
  if (v === 0 || Math.abs(v) < 1e-300) return { text: '0', cut: false }
  const a = Math.abs(v)
  const clean = Number(v.toPrecision(12))
  const cut = Math.abs(Number(v.toPrecision(digits)) - clean) > 1e-12 * a
  if (a >= 1e10 || a < 1e-6) {
    const [m, e] = clean.toExponential(digits - 1).split('e')
    const mant = m.replace(/\.?0+$/, '').replace('-', '−')
    const exp = String(Number(e))
    return { text: `${mant}×10${toSup(exp)}${cut ? '…' : ''}`, mant, exp, cut }
  }
  let text = String(Number(clean.toPrecision(digits)))
  if (text.includes('e')) text = Number(text).toFixed(20).replace(/\.?0+$/, '')
  text = text.replace('-', '−')
  return { text: text + (cut ? '…' : ''), cut }
}
/** Plain number text for copying / inserting (no ellipsis, ASCII minus). */
export function plainNumber(v) {
  const clean = Number(v.toPrecision(12))
  return String(clean)
}

// ── step-by-step explanation ──
const OP_TEXT = { '+': ' + ', '−': ' − ', '×': ' × ', '÷': ' ÷ ', '^': '^', P: ' P ', C: ' C ' }
const CONST_TEXT = { pi: 'π', e: 'e', ans: 'Ans', mem: 'M' }
// steps keep simple exact values (1/3, √2, π/6) instead of long decimals
const fmt = v => {
  const x = exactForm(v)
  if (x && isNiceExact(x) && x.den <= 1000 && x.num <= 10000 && x.rad <= 1000) return exactText(x)
  return formatDecimal(v, 8).text
}

export function printNode(n, wrapNeg = false) {
  switch (n.t) {
    case 'num': { const s = fmt(n.v); return wrapNeg && (n.v < 0 || /[/√]/.test(s)) ? `(${s})` : s }
    case 'const': return CONST_TEXT[n.name]
    case 'var': return 'x'
    case 'group': return `(${printNode(n.a)})`
    case 'neg': return (wrapNeg ? '(−' : '−') + printNode(n.a, true) + (wrapNeg ? ')' : '')
    case 'post': return printNode(n.a, true) + n.op
    case 'bin':
      if (n.implicit && ['const', 'group', 'func', 'var'].includes(n.b.t)) return printNode(n.a) + printNode(n.b)
      if (n.op === '^' && n.b.t === 'num' && Number.isInteger(n.b.v) && Math.abs(n.b.v) < 1000) return printNode(n.a, true) + toSup(n.b.v)
      return printNode(n.a, n.op === '^') + OP_TEXT[n.op] + printNode(n.b, true)
    case 'func':
      if (n.name === 'frac') return `${printNode(n.args[0], true)}/${printNode(n.args[1], true)}`
      if (n.name === 'root') return `${printNode(n.args[0])}√(${printNode(n.args[1])})`
      return `${FUNC_LABEL[n.name]}(${n.args.map(a => printNode(a)).join('; ')})`
    default: return '?'
  }
}

const isLeaf = n => n.t === 'num' || n.t === 'const' || n.t === 'var'
function children(n) {
  if (n.t === 'group' || n.t === 'neg' || n.t === 'post') return [n.a]
  if (n.t === 'bin') return [n.a, n.b]
  if (n.t === 'func') return n.args
  return []
}
// a "% after + or −" stays with its parent so 200 + 10% is explained as one step
const pctChild = (n, c) => n.t === 'bin' && (n.op === '+' || n.op === '−') && c === n.b && c.t === 'post' && c.op === '%'

function label(n, angle) {
  if (n.t === 'bin') {
    if (n.op === '^') return 'חזקה — לפני כפל, חילוק, חיבור וחיסור'
    if (n.implicit) return 'כפל מקוצר (בלי סימן ×)'
    if (n.op === '×' || n.op === '÷') return 'כפל וחילוק — לפני חיבור וחיסור, משמאל לימין'
    if (n.op === 'P' || n.op === 'C') return n.op === 'P' ? 'תמורות nPr' : 'צירופים nCr'
    if (n.b.t === 'post' && n.b.op === '%') return `${n.op === '+' ? 'הוספת' : 'הורדת'} אחוזים מהמספר שלפני`
    return 'חיבור וחיסור — משמאל לימין'
  }
  if (n.t === 'post') return { '!': 'עצרת', '%': 'אחוז = חלוקה ב־100', '²': 'חזקה שנייה', '³': 'חזקה שלישית', '⁻¹': 'הופכי: 1 חלקי המספר' }[n.op]
  if (n.t === 'neg') return 'סימן מינוס'
  if (n.t === 'func') {
    if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan'].includes(n.name)) return `טריגונומטריה (${angle === 'rad' ? 'ברדיאנים' : 'במעלות'})`
    if (n.name === 'frac') return 'שבר = חילוק'
    if (n.name === 'sqrt' || n.name === 'cbrt' || n.name === 'root') return 'שורש'
    return 'פונקציה'
  }
  return ''
}

/**
 * Order of operations, one reduction per step.
 * Returns { steps: [{ before, label, inParens, result, expr }], value } or { error }.
 */
export function explain(src, ctx = {}) {
  let ast
  try { ast = parse(src, ctx) } catch (err) { return { error: err.message } }
  if (!ast) return { steps: [] }
  const steps = []
  const tidy = n => {
    if (n.t === 'group' && n.a.t === 'num') return n.a
    if (n.t === 'neg' && n.a.t === 'num') return { ...n.a, v: -n.a.v }
    return n
  }
  // find the first node (post-order, left to right) whose children are all leaves; replace it
  function reduceOnce(n, depth) {
    const kids = children(n)
    for (let k = 0; k < kids.length; k++) {
      const c = kids[k]
      if (isLeaf(c) || pctChild(n, c) && isLeaf(c.a)) continue
      const r = reduceOnce(c, depth + (n.t === 'group' || n.t === 'func' ? 1 : 0))
      if (r) {
        const replaced = tidy(r.node)
        if (n.t === 'bin') n = { ...n, [k === 0 ? 'a' : 'b']: replaced }
        else if (n.t === 'func') n = { ...n, args: n.args.map((x, j) => (j === k ? replaced : x)) }
        else n = { ...n, a: replaced }
        return { node: tidy(n), step: r.step }
      }
    }
    if (n.t === 'group') return null
    const value = evalNode(n, ctx)
    return { node: { t: 'num', v: value, s: n.s, e: n.e }, step: { before: printNode(n), label: label(n, ctx.angle), inParens: depth > 0, result: fmt(value) } }
  }
  try {
    const norm = n => tidy(n.t === 'bin' ? { ...n, a: norm(n.a), b: norm(n.b) } : n.t === 'func' ? { ...n, args: n.args.map(norm) } : n.a ? { ...n, a: norm(n.a) } : n)
    let cur = norm(ast)
    if (cur.t === 'const' || cur.t === 'var') {
      const v = evalNode(cur, ctx)
      steps.push({ before: printNode(cur), label: 'קבוע', inParens: false, result: fmt(v), expr: fmt(v) })
      return { steps, value: v }
    }
    for (let guard = 0; guard < 80 && !isLeaf(cur); guard++) {
      const r = reduceOnce(cur, 0)
      if (!r) break
      cur = tidy(r.node)
      if (r.step.before !== r.step.result) steps.push({ ...r.step, expr: printNode(cur) })
    }
    return { steps, value: evalNode(cur, ctx) }
  } catch (err) {
    if (err instanceof CalcError) return { steps, error: err.message }
    throw err
  }
}

// ── editing helpers (cursor = character offset) ──
const tolerant = src => tokenize(src, { strict: false, vars: true })

/** Where the cursor goes on ◀ / ▶ : one digit at a time inside numbers, else one token. */
export function moveCursor(src, cur, dir) {
  if (dir < 0) {
    if (cur <= 0) return 0
    const t = tolerant(src).filter(x => x.s < cur).pop()
    if (!t) return 0
    if (t.k === 'num' && cur <= t.e) return cur - 1
    return t.e < cur ? t.e : t.s
  }
  if (cur >= src.length) return src.length
  const t = tolerant(src).find(x => x.e > cur)
  if (!t) return src.length
  if (t.k === 'num' && cur >= t.s) return cur + 1
  return t.s > cur ? t.s : t.e
}

/** Backspace: removes one digit or one whole token; deleting an opener also removes its ")". */
export function deleteBefore(src, cur) {
  if (cur <= 0) return { src, cur: 0 }
  const toks = tolerant(src)
  const t = toks.filter(x => x.s < cur).pop()
  if (!t) return { src: src.slice(0, cur - 1) + src.slice(cur), cur: cur - 1 }
  if (t.k === 'num' && cur <= t.e) return { src: src.slice(0, cur - 1) + src.slice(cur), cur: cur - 1 }
  if (t.e < cur) return { src: src.slice(0, cur - 1) + src.slice(cur), cur: cur - 1 }
  if (t.k === ')') return { src, cur: t.s } // step inside instead of breaking the group
  if (t.k === '(' || (t.k === 'func' && t.open)) {
    // find the matching ")" (and ";" of a two-part function) after it
    let depth = 0; let close = null; const semis = []
    for (const x of toks) {
      if (x.s < t.e) continue
      if (x.k === '(' || (x.k === 'func' && x.open)) depth++
      else if (x.k === ';' && depth === 0) semis.push(x)
      else if (x.k === ')') { if (depth === 0) { close = x; break } depth-- }
    }
    let out = src
    if (close) out = out.slice(0, close.s) + out.slice(close.e)
    for (const s of semis.reverse()) out = out.slice(0, s.s) + '÷' + out.slice(s.e)
    out = out.slice(0, t.s) + out.slice(t.e)
    return { src: out, cur: t.s }
  }
  return { src: src.slice(0, t.s) + src.slice(t.e), cur: t.s }
}

/** Insert text at the cursor; `caret` is where the cursor ends inside the inserted text. */
export function insertAt(src, cur, text, caret = text.length) {
  return { src: src.slice(0, cur) + text + src.slice(cur), cur: cur + caret }
}
