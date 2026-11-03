// /excel: a tiny spreadsheet engine — refs, formulas (SUM, AVERAGE, IF…), fill, sort,
// charts and the lesson checks. Pure functions, no React, so tests can drive it.

// ── refs ───────────────────────────────
export const colName = c => String.fromCharCode(65 + c)
export const refName = (c, r) => colName(c) + (r + 1)
export function parseRef(s) {
  const m = /^\$?([A-Za-z])\$?(\d{1,3})$/.exec(String(s).trim())
  if (!m) return null
  return { c: m[1].toUpperCase().charCodeAt(0) - 65, r: Number(m[2]) - 1 }
}
export function parseRange(s) {
  const [a, b = a] = String(s).split(':')
  const p = parseRef(a), q = parseRef(b)
  if (!p || !q) return null
  return { c0: Math.min(p.c, q.c), c1: Math.max(p.c, q.c), r0: Math.min(p.r, q.r), r1: Math.max(p.r, q.r) }
}
export const rangeName = g => g.c0 === g.c1 && g.r0 === g.r1 ? refName(g.c0, g.r0) : `${refName(g.c0, g.r0)}:${refName(g.c1, g.r1)}`
export function rangeRefs(g) {
  if (typeof g === 'string') g = parseRange(g)
  const out = []
  for (let r = g.r0; r <= g.r1; r++) for (let c = g.c0; c <= g.c1; c++) out.push(refName(c, r))
  return out
}

// ── values ───────────────────────────────
export class Err { constructor(code) { this.code = code } toString() { return this.code } }
export const isErr = v => v instanceof Err
const NUM_RE = /^\s*-?(\d+(\.\d*)?|\.\d+)\s*$/
export function literal(raw) {
  if (raw == null || raw === '') return null
  const s = String(raw)
  if (NUM_RE.test(s)) return Number(s)
  const pct = /^\s*(-?\d+(\.\d+)?)\s*%\s*$/.exec(s)
  if (pct) return Number(pct[1]) / 100
  return s
}
const toNum = v => {
  if (isErr(v)) return v
  if (v == null || v === '') return 0
  if (typeof v === 'number') return v
  if (typeof v === 'boolean') return v ? 1 : 0
  return NUM_RE.test(v) ? Number(v) : new Err('#VALUE!')
}
const toStr = v => v == null ? '' : typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : String(v)
const truthy = v => { const n = toNum(v); return isErr(n) ? n : n !== 0 }

// Hebrew letters outside quotes in a formula = the keyboard was left in Hebrew.
export const hebrewInFormula = f => /[א-ת]/.test(String(f).replace(/"[^"]*"?/g, ''))

// ── tokenizer + parser ───────────────────────────────
const TOKEN = /\s*(?:(\d+(?:\.\d+)?|\.\d+)|("(?:[^"]|"")*")|(\$?[A-Za-z]\$?\d{1,3}(?::\$?[A-Za-z]\$?\d{1,3})?)(?![A-Za-z0-9(])|([A-Za-z][A-Za-z0-9.]*)|(<>|<=|>=|[-+*/^&=<>(),;%]))/y
function tokenize(src) {
  const out = []
  TOKEN.lastIndex = 0
  while (TOKEN.lastIndex < src.length) {
    if (/^\s*$/.test(src.slice(TOKEN.lastIndex))) break
    const at = TOKEN.lastIndex
    const m = TOKEN.exec(src)
    if (!m || TOKEN.lastIndex === at) return null
    if (m[1]) out.push({ t: 'num', v: Number(m[1]) })
    else if (m[2]) out.push({ t: 'str', v: m[2].slice(1, -1).replace(/""/g, '"') })
    else if (m[3]) out.push({ t: 'ref', v: m[3].toUpperCase() })
    else if (m[4]) out.push({ t: 'name', v: m[4].toUpperCase() })
    else out.push({ t: 'op', v: m[5] === ';' ? ',' : m[5] })
  }
  return out
}
function parse(tokens) {
  let i = 0
  const peek = () => tokens[i], isOp = v => tokens[i]?.t === 'op' && tokens[i].v === v
  const eat = v => { if (!isOp(v)) throw new Error('expected ' + v); i++ }
  const bin = (next, ops) => () => {
    let a = next()
    while (tokens[i]?.t === 'op' && ops.includes(tokens[i].v)) { const op = tokens[i++].v; a = { k: 'bin', op, a, b: next() } }
    return a
  }
  const primary = () => {
    const t = peek()
    if (!t) throw new Error('end')
    i++
    if (t.t === 'num') return { k: 'lit', v: t.v }
    if (t.t === 'str') return { k: 'lit', v: t.v }
    if (t.t === 'ref') return t.v.includes(':') ? { k: 'range', v: t.v } : { k: 'ref', v: t.v }
    if (t.t === 'name') {
      if (isOp('(')) {
        i++
        const args = []
        if (!isOp(')')) { args.push(cmp()); while (isOp(',')) { i++; args.push(cmp()) } }
        eat(')')
        return { k: 'fn', name: t.v, args }
      }
      if (t.v === 'TRUE' || t.v === 'FALSE') return { k: 'lit', v: t.v === 'TRUE' }
      return { k: 'bad', code: '#NAME?' }
    }
    if (t.v === '(') { const e = cmp(); eat(')'); return e }
    if (t.v === '-' || t.v === '+') return { k: 'neg', sign: t.v, a: power() }
    throw new Error('unexpected ' + t.v)
  }
  const postfix = () => { let a = primary(); while (isOp('%')) { i++; a = { k: 'pct', a } } return a }
  const power = bin(postfix, ['^'])
  const mul = bin(power, ['*', '/'])
  const add = bin(mul, ['+', '-'])
  const cat = bin(add, ['&'])
  const cmp = bin(cat, ['=', '<>', '<', '>', '<=', '>='])
  const ast = cmp()
  if (i < tokens.length) throw new Error('trailing')
  return ast
}

// ── functions ───────────────────────────────
const flat = args => args.flatMap(a => Array.isArray(a) ? a : [a])
const nums = (args) => {
  const out = []
  for (const a of args) {
    if (Array.isArray(a)) { for (const v of a) { if (isErr(v)) return v; if (typeof v === 'number') out.push(v) } }
    else { const n = toNum(a); if (isErr(n)) return n; out.push(n) }
  }
  return out
}
function criteria(crit) {
  const s = toStr(crit)
  const m = /^(<=|>=|<>|<|>|=)?(.*)$/.exec(s)
  const op = m[1] || '=', rhs = literal(m[2])
  return v => compare(op, v ?? (typeof rhs === 'number' ? null : ''), rhs)
}
const FN = {
  SUM: a => { const n = nums(a); return isErr(n) ? n : n.reduce((x, y) => x + y, 0) },
  AVERAGE: a => { const n = nums(a); return isErr(n) ? n : n.length ? n.reduce((x, y) => x + y, 0) / n.length : new Err('#DIV/0!') },
  MIN: a => { const n = nums(a); return isErr(n) ? n : n.length ? Math.min(...n) : 0 },
  MAX: a => { const n = nums(a); return isErr(n) ? n : n.length ? Math.max(...n) : 0 },
  COUNT: a => flat(a).filter(v => typeof v === 'number').length,
  COUNTA: a => flat(a).filter(v => v != null && v !== '').length,
  COUNTBLANK: a => flat(a).filter(v => v == null || v === '').length,
  ROUND: ([x, d = 0]) => { const n = toNum(x), k = toNum(d); if (isErr(n)) return n; if (isErr(k)) return k; const f = 10 ** k; return Math.round(n * f) / f },
  ABS: ([x]) => { const n = toNum(x); return isErr(n) ? n : Math.abs(n) },
  IF: ([c, t = true, f = false]) => { const b = truthy(c); return isErr(b) ? b : b ? t : f },
  AND: a => { for (const v of flat(a)) { const b = truthy(v); if (isErr(b)) return b; if (!b) return false } return true },
  OR: a => { for (const v of flat(a)) { const b = truthy(v); if (isErr(b)) return b; if (b) return true } return false },
  COUNTIF: ([range, crit]) => { const ok = criteria(crit); return (Array.isArray(range) ? range : [range]).filter(v => ok(v)).length },
  SUMIF: ([range, crit, sum]) => {
    const ok = criteria(crit), rs = Array.isArray(range) ? range : [range], ss = Array.isArray(sum) ? sum : rs
    return rs.reduce((acc, v, k) => acc + (ok(v) && typeof ss[k] === 'number' ? ss[k] : 0), 0)
  },
}
export const FUNCTIONS = Object.keys(FN)

function compare(op, a, b) {
  let x = a, y = b
  if (typeof x === 'number' || typeof y === 'number') {
    if (x == null) x = 0
    if (y == null) y = 0
  }
  let d
  if (typeof x === 'number' && typeof y === 'number') d = x - y
  else if (typeof x === 'number') d = -1
  else if (typeof y === 'number') d = 1
  else d = toStr(x).toLowerCase().localeCompare(toStr(y).toLowerCase(), 'he')
  return op === '=' ? d === 0 : op === '<>' ? d !== 0 : op === '<' ? d < 0 : op === '>' ? d > 0 : op === '<=' ? d <= 0 : d >= 0
}

function evalAst(n, get) {
  switch (n.k) {
    case 'lit': return n.v
    case 'bad': return new Err(n.code)
    case 'ref': { const p = parseRef(n.v); return p ? get(p.c, p.r) : new Err('#REF!') }
    case 'range': return rangeRefs(parseRange(n.v)).map(r => { const p = parseRef(r); return get(p.c, p.r) })
    case 'neg': { const v = toNum(evalAst(n.a, get)); return isErr(v) ? v : n.sign === '-' ? -v : v }
    case 'pct': { const v = toNum(evalAst(n.a, get)); return isErr(v) ? v : v / 100 }
    case 'fn': {
      const f = FN[n.name]
      if (!f) return new Err('#NAME?')
      if (n.name === 'IF') {
        const c = evalAst(n.args[0] ?? { k: 'lit', v: false }, get)
        if (isErr(c)) return c
        const b = truthy(Array.isArray(c) ? c[0] : c)
        if (isErr(b)) return b
        const pick = b ? n.args[1] : n.args[2]
        return pick ? evalAst(pick, get) : b
      }
      return f(n.args.map(a => evalAst(a, get)))
    }
    case 'bin': {
      const a = evalAst(n.a, get), b = evalAst(n.b, get)
      if (Array.isArray(a) || Array.isArray(b)) return new Err('#VALUE!')
      if (isErr(a)) return a
      if (isErr(b)) return b
      if (n.op === '&') return toStr(a) + toStr(b)
      if (['=', '<>', '<', '>', '<=', '>='].includes(n.op)) return compare(n.op, a, b)
      const x = toNum(a), y = toNum(b)
      if (isErr(x)) return x
      if (isErr(y)) return y
      if (n.op === '+') return x + y
      if (n.op === '-') return x - y
      if (n.op === '*') return x * y
      if (n.op === '/') return y === 0 ? new Err('#DIV/0!') : x / y
      return x ** y
    }
  }
  return new Err('#VALUE!')
}

export function evalFormula(src, get) {
  const body = String(src).replace(/^=/, '')
  if (hebrewInFormula(body)) return new Err('#NAME?')
  const tokens = tokenize(body)
  if (!tokens || !tokens.length) return new Err('#ERROR!')
  let ast
  try { ast = parse(tokens) } catch { return new Err('#ERROR!') }
  const v = evalAst(ast, get)
  return Array.isArray(v) ? (v.length === 1 ? v[0] : new Err('#VALUE!')) : v
}

// Evaluates every cell (memoised, circular refs → #CIRC!). Returns { ref: value }.
export function evaluate(cells) {
  const memo = {}, busy = new Set()
  const get = (c, r) => {
    const ref = refName(c, r)
    if (ref in memo) return memo[ref]
    const raw = cells[ref]
    if (raw == null || raw === '') return null
    if (!String(raw).startsWith('=')) return (memo[ref] = literal(raw))
    if (busy.has(ref)) return new Err('#CIRC!')
    busy.add(ref)
    const v = evalFormula(raw, get)
    busy.delete(ref)
    return (memo[ref] = v)
  }
  for (const ref of Object.keys(cells)) { const p = parseRef(ref); if (p) get(p.c, p.r) }
  return memo
}

// ── display ───────────────────────────────
const nf = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
const cf = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
export function display(v, fmt, cur = '₪') {
  if (v == null) return ''
  if (isErr(v)) return v.code
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'
  if (typeof v === 'number') {
    if (fmt?.cur) return cur + cf.format(v)
    return String(Math.abs(v) >= 1000 ? Math.round(v * 100) / 100 : nf.format(v)).replace(/,/g, '')
  }
  return String(v)
}

// ── editing helpers ───────────────────────────────
// Shift the relative refs of a formula (fill handle / Ctrl+D). $A$1 stays.
export function shiftFormula(f, dr, dc) {
  if (!String(f).startsWith('=')) return f
  return String(f).replace(/("(?:[^"]|"")*")|(\$?)([A-Za-z])(\$?)(\d{1,3})(?![A-Za-z0-9(])/g, (all, str, d1, col, d2, row, offset, whole) => {
    if (str) return str
    if (/[A-Za-z]/.test(whole[offset - 1] || '')) return all
    const c = d1 ? col.toUpperCase().charCodeAt(0) - 65 : col.toUpperCase().charCodeAt(0) - 65 + dc
    const r = d2 ? Number(row) - 1 : Number(row) - 1 + dr
    if (c < 0 || c > 25 || r < 0) return '#REF!'
    return `${d1}${colName(c)}${d2}${r + 1}`
  })
}

// Fill `target` (a range that starts with `src`) the way the fill handle does: formulas
// shift, 2+ numbers in a line continue as a series, everything else repeats.
export function fill(state, src, target) {
  const cells = { ...state.cells }, fmt = { ...state.fmt }
  const h = src.r1 - src.r0 + 1, w = src.c1 - src.c0 + 1
  const down = target.r1 > src.r1
  const series = (line) => {
    const vs = line.map(ref => literal(state.cells[ref]))
    if (vs.length < 2 || !vs.every(v => typeof v === 'number')) return null
    const step = vs[1] - vs[0]
    return vs.every((v, k) => k === 0 || Math.abs(v - vs[k - 1] - step) < 1e-9) ? { last: vs[vs.length - 1], step } : null
  }
  for (let r = target.r0; r <= target.r1; r++) for (let c = target.c0; c <= target.c1; c++) {
    if (r >= src.r0 && r <= src.r1 && c >= src.c0 && c <= src.c1) continue
    const sr = src.r0 + ((r - src.r0) % h), sc = src.c0 + ((c - src.c0) % w)
    const from = refName(sc, sr), to = refName(c, r), raw = state.cells[from]
    const line = down ? rangeRefs({ c0: c, c1: c, r0: src.r0, r1: src.r1 }) : rangeRefs({ c0: src.c0, c1: src.c1, r0: r, r1: r })
    const s = series(line)
    if (s) cells[to] = String(Math.round((s.last + s.step * (down ? r - src.r1 : c - src.c1)) * 1e9) / 1e9)
    else if (raw == null || raw === '') delete cells[to]
    else cells[to] = shiftFormula(raw, r - sr, c - sc)
    if (state.fmt[from]) fmt[to] = { ...state.fmt[from] }; else delete fmt[to]
  }
  return { ...state, cells, fmt }
}

// The block of non-empty cells around (c, r) — what Excel calls the current region.
export function region(cells, c, r) {
  const has = (cc, rr) => cc >= 0 && rr >= 0 && cells[refName(cc, rr)] != null && cells[refName(cc, rr)] !== ''
  const g = { c0: c, c1: c, r0: r, r1: r }
  for (let grew = true; grew;) {
    grew = false
    const tryGrow = (key, d, test) => { if (test()) { g[key] += d; grew = true } }
    tryGrow('r0', -1, () => { for (let x = g.c0 - 1; x <= g.c1 + 1; x++) if (has(x, g.r0 - 1)) return true; return false })
    tryGrow('r1', 1, () => { for (let x = g.c0 - 1; x <= g.c1 + 1; x++) if (has(x, g.r1 + 1)) return true; return false })
    tryGrow('c0', -1, () => { for (let y = g.r0 - 1; y <= g.r1 + 1; y++) if (has(g.c0 - 1, y)) return true; return false })
    tryGrow('c1', 1, () => { for (let y = g.r0 - 1; y <= g.r1 + 1; y++) if (has(g.c1 + 1, y)) return true; return false })
  }
  return g
}

// Sort the rows of `g` by column `byCol` (row 1 is always the header and never moves).
export function sortRows(state, g, byCol, dir) {
  const r0 = Math.max(g.r0, 1)
  if (r0 > g.r1) return state
  const values = evaluate(state.cells)
  const rows = []
  for (let r = r0; r <= g.r1; r++) {
    const row = []
    for (let c = g.c0; c <= g.c1; c++) { const ref = refName(c, r); row.push({ raw: state.cells[ref], fmt: state.fmt[ref] }) }
    rows.push({ key: values[refName(byCol, r)] ?? null, row })
  }
  const sign = dir === 'desc' ? -1 : 1
  rows.sort((a, b) => {
    if (a.key == null && b.key == null) return 0
    if (a.key == null) return 1
    if (b.key == null) return -1
    if (typeof a.key === 'number' && typeof b.key === 'number') return sign * (a.key - b.key)
    if (typeof a.key === 'number') return -1
    if (typeof b.key === 'number') return 1
    return sign * String(a.key).localeCompare(String(b.key), 'he')
  })
  const cells = { ...state.cells }, fmt = { ...state.fmt }
  rows.forEach((x, k) => x.row.forEach((cell, j) => {
    const ref = refName(g.c0 + j, r0 + k)
    if (cell.raw == null) delete cells[ref]; else cells[ref] = cell.raw
    if (cell.fmt) fmt[ref] = cell.fmt; else delete fmt[ref]
  }))
  return { ...state, cells, fmt }
}

// A chart over a selection: first column = labels, second = values. Leading rows whose
// value is not a number (headers) are skipped.
export function chartFrom(state, g, kind) {
  const values = evaluate(state.cells)
  const vc = g.c1 > g.c0 ? g.c0 + 1 : g.c0
  let r0 = g.r0
  while (r0 <= g.r1 && typeof values[refName(vc, r0)] !== 'number') r0++
  if (r0 > g.r1) return null
  return { kind, c0: g.c0, c1: vc, r0, r1: g.r1 }
}
export function chartData(state, chart) {
  const values = evaluate(state.cells)
  const out = []
  for (let r = chart.r0; r <= chart.r1; r++) {
    const v = values[refName(chart.c1, r)]
    out.push({ label: chart.c1 > chart.c0 ? display(values[refName(chart.c0, r)]) : String(r + 1), value: typeof v === 'number' ? v : 0 })
  }
  return out
}

export function setFmt(state, g, key, on) {
  const fmt = { ...state.fmt }
  for (const ref of rangeRefs(g)) {
    const f = { ...(fmt[ref] || {}) }
    if (on) f[key] = true; else delete f[key]
    if (Object.keys(f).length) fmt[ref] = f; else delete fmt[ref]
  }
  return { ...state, fmt }
}

// ── lesson states and checks ───────────────────────────────
export const emptyState = () => ({ cells: {}, fmt: {}, chart: null })
export function startState(sheet) {
  return { cells: { ...(sheet?.cells || {}) }, fmt: JSON.parse(JSON.stringify(sheet?.fmt || {})), chart: null }
}

// Applies a task's solution: { cells, ops: [['bold'|'cur', range] | ['fill', src, target] | ['sort', range, col, dir] | ['chart', range, kind]] }
export function applySolution(state, sol) {
  let s = { ...state, cells: { ...state.cells, ...(sol.cells || {}) }, fmt: { ...state.fmt } }
  for (const ref of Object.keys(sol.cells || {})) if (sol.cells[ref] === '') delete s.cells[ref]
  for (const [op, a, b, c] of sol.ops || []) {
    if (op === 'bold' || op === 'cur') s = setFmt(s, parseRange(a), op === 'bold' ? 'b' : 'cur', true)
    else if (op === 'fill') s = fill(s, parseRange(a), parseRange(b))
    else if (op === 'sort') s = sortRows(s, parseRange(a), parseRef(b + '1').c, c)
    else if (op === 'chart') s = { ...s, chart: chartFrom(s, parseRange(a), b) }
  }
  return s
}

const same = (v, want) => typeof want === 'number'
  ? typeof v === 'number' && Math.abs(v - want) < 1e-6 * Math.max(1, Math.abs(want))
  : v != null && !isErr(v) && String(v).trim() === String(want).trim()
const isFx = (state, ref) => String(state.cells[ref] ?? '').startsWith('=')
const fxHas = (state, ref, s) => String(state.cells[ref] ?? '').toUpperCase().replace(/\s+/g, '').includes(String(s).toUpperCase())

// One check → true/false. `start` is the state the task began with (for "rows kept together").
export function runCheck(ck, state, start) {
  const values = evaluate(state.cells)
  switch (ck.t) {
    case 'val': return same(values[ck.ref] ?? null, ck.v)
    case 'empty': return state.cells[ck.ref] == null || state.cells[ck.ref] === ''
    case 'fx': return isFx(state, ck.ref) && (ck.fn == null || fxHas(state, ck.ref, ck.fn + '(')) && (ck.has == null || fxHas(state, ck.ref, ck.has)) && (ck.v == null || same(values[ck.ref], ck.v))
    case 'fxRange': return rangeRefs(ck.range).every((ref, k) => isFx(state, ref) && (ck.fn == null || fxHas(state, ref, ck.fn + '(')) && same(values[ref], ck.vs[k]))
    case 'bold': return rangeRefs(ck.range).every(ref => state.fmt[ref]?.b)
    case 'cur': return rangeRefs(ck.range).every(ref => typeof values[ref] !== 'number' || state.fmt[ref]?.cur)
    case 'sorted': {
      const g = parseRange(ck.range), col = parseRef(ck.col + '1').c
      const keys = []
      for (let r = g.r0; r <= g.r1; r++) keys.push(values[refName(col, r)])
      const ok = keys.every((k, i) => i === 0 || (typeof k === 'number' ? (ck.dir === 'desc' ? keys[i - 1] >= k : keys[i - 1] <= k)
        : (ck.dir === 'desc' ? String(keys[i - 1]).localeCompare(String(k), 'he') >= 0 : String(keys[i - 1]).localeCompare(String(k), 'he') <= 0)))
      if (!ok || !start) return ok
      const rows = s => { const out = []; for (let r = g.r0; r <= g.r1; r++) out.push(rangeRefs({ c0: g.c0, c1: g.c1, r0: r, r1: r }).map(ref => s.cells[ref] ?? '').join('|')); return out.sort().join('\n') }
      return rows(state) === rows(start)
    }
    case 'chart': {
      const ch = state.chart
      if (!ch || (ck.kind && ch.kind !== ck.kind)) return false
      return rangeName({ c0: ch.c0, c1: ch.c1, r0: ch.r0, r1: ch.r1 }) === ck.range
    }
  }
  return false
}
export const checkTask = (task, state, start) => task.checks.map(ck => ({ label: ck.label, ok: runCheck(ck, state, start) }))
