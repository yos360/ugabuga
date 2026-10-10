// Logic grid puzzle engine (תשבצי היגיון): generator, exact solution counter, and a step-by-step
// "human" solver whose steps are explained in Hebrew (used for hints and for the full solution).
//
// Model: K categories × n items. Category 0 is the anchor (names). A grid cell links item a of
// category i with item b of category j: 1 = same person (✓), -1 = not (✗), 0 = unknown.
// The state is one flat Int8Array holding every pair grid (i < j).
import { THEMES, LEVELS, statement, refPhrase, clueText } from './themes.js'

export function rngOf(seed) {
  let a = (seed >>> 0) || 1
  const next = () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const int = (min, max) => min + Math.floor(next() * (max - min + 1))
  return {
    next, int,
    pick: list => list[Math.floor(next() * list.length)],
    shuffle: list => { const b = [...list]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [b[i], b[j]] = [b[j], b[i]] } return b },
  }
}

// ---- Geometry ------------------------------------------------------------------------------
export const pairs = puz => { const out = []; for (let i = 0; i < puz.K; i++) for (let j = i + 1; j < puz.K; j++) out.push([i, j]); return out }
export function cellIndex(puz, x, y) {
  const [i, a] = x, [j, b] = y
  return i < j ? puz.off[i][j] + a * puz.n + b : puz.off[j][i] + b * puz.n + a
}
export function rel(puz, st, x, y) {
  if (x[0] === y[0]) return x[1] === y[1] ? 1 : -1
  return st[cellIndex(puz, x, y)]
}
export const emptyState = puz => new Int8Array(puz.size)
export const isComplete = st => st.every(v => v !== 0)

// ---- Rules ---------------------------------------------------------------------------------
const CONTRA = { contra: true }
const STOP = { stop: true }
const ORDER_OK = { less: (a, b) => a < b, next: (a, b) => b === a + 1, adj: (a, b) => Math.abs(a - b) === 1 }
const isOrder = t => t in ORDER_OK

class Run {
  constructor(puz, st, step) { this.puz = puz; this.st = st; this.stepMode = step; this.changed = false; this.step = null }
  get(x, y) { return rel(this.puz, this.st, x, y) }
  fail() { throw CONTRA }
  emit(x, y, v, reason) {
    if (x[0] === y[0]) { if ((x[1] === y[1] ? 1 : -1) !== v) throw CONTRA; return }
    const i = cellIndex(this.puz, x, y), cur = this.st[i]
    if (cur === v) return
    if (cur !== 0) throw CONTRA
    if (this.stepMode) {
      if (this.step && this.step.reason.key !== reason.key) throw STOP
      if (!this.step) this.step = { reason, cells: [] }
      this.step.cells.push([x, y, v])
    } else this.changed = true
    this.st[i] = v
  }
}

function ruleClues(R) {
  const { puz } = R
  puz.clues.forEach((c, ci) => {
    const [x, y, z] = c.refs
    if (c.type === 'same') R.emit(x, y, 1, { key: `c${ci}`, k: 'clue', ci })
    else if (c.type === 'diff') R.emit(x, y, -1, { key: `c${ci}`, k: 'clue', ci })
    else if (c.type === 'either') {
      if (y[0] !== z[0]) R.emit(y, z, -1, { key: `c${ci}x`, k: 'either-excl', ci })
      else for (let w = 0; w < puz.n; w++) if (w !== y[1] && w !== z[1]) R.emit(x, [y[0], w], -1, { key: `c${ci}e`, k: 'either-elim', ci })
    } else if (x[0] !== y[0]) R.emit(x, y, -1, { key: `c${ci}d`, k: 'order-distinct', ci })
  })
}

function ruleLines(R) {
  const { puz } = R, n = puz.n
  for (let p = 0; p < puz.K; p++) for (let q = 0; q < puz.K; q++) {
    if (p === q) continue
    for (let a = 0; a < n; a++) {
      const x = [p, a]
      let yes = -1, yesCount = 0, unknown = -1, unknownCount = 0
      for (let b = 0; b < n; b++) { const v = R.get(x, [q, b]); if (v === 1) { yes = b; yesCount++ } else if (v === 0) { unknown = b; unknownCount++ } }
      if (yesCount > 1) R.fail()
      if (yesCount === 1) { for (let b = 0; b < n; b++) if (b !== yes && R.get(x, [q, b]) === 0) R.emit(x, [q, b], -1, { key: `o${p},${a},${q}`, k: 'only', x, y: [q, yes], minor: true }) }
      else if (unknownCount === 0) R.fail()
      else if (unknownCount === 1) R.emit(x, [q, unknown], 1, { key: `l${p},${a},${q}`, k: 'last', x, cat: q })
    }
  }
}

function ruleTrans(R) {
  const { puz } = R, n = puz.n
  for (const [p, q] of pairs(puz)) for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
    const A = [p, a], B = [q, b]
    if (R.get(A, B) !== 1) continue
    for (let k = 0; k < puz.K; k++) {
      if (k === p || k === q) continue
      for (let c = 0; c < n; c++) {
        const C = [k, c], r1 = R.get(A, C), r2 = R.get(B, C)
        if (r1 === r2) continue
        if (r1 === 0) R.emit(A, C, r2, { key: `t${p}${a}${k}${c}`, k: 'trans', link: [A, B], known: [B, C, r2], target: [A, C, r2] })
        else if (r2 === 0) R.emit(B, C, r1, { key: `t${q}${b}${k}${c}`, k: 'trans', link: [B, A], known: [A, C, r1], target: [B, C, r1] })
        else R.fail()
      }
    }
  }
}

function ruleEither(R) {
  R.puz.clues.forEach((c, ci) => {
    if (c.type !== 'either') return
    const [x, y, z] = c.refs, ry = R.get(x, y), rz = R.get(x, z)
    if (ry === -1 && rz === -1) R.fail()
    if (ry === -1) R.emit(x, z, 1, { key: `c${ci}iz`, k: 'either-infer', ci, no: y, yes: z })
    if (rz === -1) R.emit(x, y, 1, { key: `c${ci}iy`, k: 'either-infer', ci, no: z, yes: y })
    if (ry === 1) R.emit(x, z, -1, { key: `c${ci}oz`, k: 'either-one', ci, yes: y, no: z })
    if (rz === 1) R.emit(x, y, -1, { key: `c${ci}oy`, k: 'either-one', ci, yes: z, no: y })
  })
}

const domain = (R, r) => { const O = R.puz.ord, out = []; for (let v = 0; v < R.puz.n; v++) if (R.get(r, [O, v]) !== -1) out.push(v); return out }
function ruleOrder(R) {
  const O = R.puz.ord
  R.puz.clues.forEach((c, ci) => {
    if (!isOrder(c.type)) return
    const ok = ORDER_OK[c.type], [x, y] = c.refs
    const dx = domain(R, x), dy = domain(R, y)
    if (!dx.length || !dy.length) R.fail()
    for (const v of dx) if (!dy.some(w => w !== v && ok(v, w))) R.emit(x, [O, v], -1, { key: `c${ci}px`, k: 'order', ci, r: x, other: y })
    for (const w of dy) if (!dx.some(v => v !== w && ok(v, w))) R.emit(y, [O, w], -1, { key: `c${ci}py`, k: 'order', ci, r: y, other: x })
  })
}

function ruleCross(R) {
  const { puz } = R, n = puz.n
  for (const [p, k] of pairs(puz)) for (let a = 0; a < n; a++) for (let c = 0; c < n; c++) {
    const A = [p, a], C = [k, c]
    if (R.get(A, C) !== 0) continue
    for (let j = 0; j < puz.K; j++) {
      if (j === p || j === k) continue
      let blocked = true
      for (let b = 0; b < n && blocked; b++) if (R.get(A, [j, b]) !== -1 && R.get([j, b], C) !== -1) blocked = false
      if (blocked) { R.emit(A, C, -1, { key: `x${p}${a}${k}${c}`, k: 'cross', j, a: A, c: C }); break }
    }
  }
}

const RULES = [ruleClues, ruleLines, ruleTrans, ruleEither, ruleOrder, ruleCross]
const STEP_RULES = [ruleClues, ruleLines, ruleTrans, ruleEither, ruleOrder, ruleCross]

// Apply every rule until nothing changes. Returns false on a contradiction.
export function propagate(puz, st) {
  const R = new Run(puz, st, false)
  try { do { R.changed = false; for (const rule of RULES) rule(R) } while (R.changed) } catch (e) { if (e === CONTRA) return false; throw e }
  return true
}

// Proof by contradiction, one cell: "assume ✓ → contradiction → ✗" (and the reverse).
function trialStep(puz, st) {
  const order = [...Array(puz.size).keys()]
  for (const i of order) {
    if (st[i] !== 0) continue
    for (const v of [1, -1]) {
      const s2 = st.slice(); s2[i] = v
      if (!propagate(puz, s2)) {
        const [x, y] = cellRefs(puz, i)
        return { reason: { key: `trial${i}`, k: 'trial', x, y, assumed: v }, cells: [[x, y, -v]] }
      }
    }
  }
  return null
}

// The next single deduction (cells it fixes + why), or null when stuck. {contra:true} if the
// given marks already contradict the clues.
export function nextStep(puz, st0, { trial = true } = {}) {
  const st = st0.slice()
  const R = new Run(puz, st, true)
  try {
    for (const rule of STEP_RULES) { rule(R); if (R.step) return R.step }
  } catch (e) {
    if (e === STOP) return R.step
    if (e === CONTRA) return { contra: true }
    throw e
  }
  return trial ? trialStep(puz, st0) : null
}

export function applyStep(st, puz, step) { for (const [x, y, v] of step.cells) st[cellIndex(puz, x, y)] = v; return st }

// All steps from an empty grid to the solution (or until stuck).
export function solveSteps(puz, { trial = true, from } = {}) {
  const st = from ? from.slice() : emptyState(puz), steps = []
  while (!isComplete(st)) {
    const s = nextStep(puz, st, { trial })
    if (!s || s.contra) break
    applyStep(st, puz, s); steps.push(s)
  }
  return { steps, st, solved: isComplete(st) }
}

export function cellRefs(puz, idx) {
  for (const [i, j] of pairs(puz)) {
    const o = puz.off[i][j]
    if (idx >= o && idx < o + puz.n * puz.n) { const r = idx - o; return [[i, Math.floor(r / puz.n)], [j, r % puz.n]] }
  }
  return null
}

// ---- Exact solution counting -----------------------------------------------------------------
export function solutionOf(puz, st) {
  const sol = [[...Array(puz.n).keys()]]
  for (let c = 1; c < puz.K; c++) {
    const row = []
    for (let e = 0; e < puz.n; e++) { let found = -1; for (let b = 0; b < puz.n; b++) if (rel(puz, st, [0, e], [c, b]) === 1) found = b; row.push(found) }
    sol.push(row)
  }
  return sol
}

export function clueHolds(puz, sol, clue) {
  const ent = ([c, a]) => sol[c].indexOf(a)
  const [x, y, z] = clue.refs
  const ex = ent(x), ey = ent(y)
  switch (clue.type) {
    case 'same': return ex === ey
    case 'diff': return ex !== ey
    case 'either': return (ex === ey) !== (ex === ent(z))
    default: return ex !== ey && ORDER_OK[clue.type](sol[puz.ord][ex], sol[puz.ord][ey])
  }
}

export function countSolutions(puz, st0 = emptyState(puz), limit = 2) {
  const st = st0.slice()
  if (!propagate(puz, st)) return 0
  let pick = -1
  for (let j = 1; j < puz.K && pick < 0; j++) { const o = puz.off[0][j]; for (let i = o; i < o + puz.n * puz.n; i++) if (st[i] === 0) { pick = i; break } }
  if (pick < 0) { const sol = solutionOf(puz, st); return puz.clues.every(c => clueHolds(puz, sol, c)) ? 1 : 0 }
  let total = 0
  for (const v of [1, -1]) {
    const s2 = st.slice(); s2[pick] = v
    total += countSolutions(puz, s2, limit - total)
    if (total >= limit) break
  }
  return total
}

// ---- Generator -------------------------------------------------------------------------------
function withGeometry(theme, cats) {
  const K = cats.length, n = cats[0].items.length, off = []
  let o = 0
  for (let i = 0; i < K; i++) off.push(Array(K).fill(-1))
  for (let i = 0; i < K; i++) for (let j = i + 1; j < K; j++) { off[i][j] = o; o += n * n }
  return { theme, cats, K, n, off, size: o, ord: cats.findIndex(c => c.ordered), clues: [] }
}

// A puzzle "shell" holding a theme's full item lists — for rendering sentences in tests.
export function shellFor(themeId) {
  const theme = THEMES.find(t => t.id === themeId)
  return withGeometry(theme, [{ id: 'anchor', label: theme.anchor.label, items: theme.anchor.items }, ...theme.cats])
}

function instantiate(rng, L, theme) {
  const n = L.n
  let anchor = rng.shuffle(theme.anchor.items).slice(0, n)
  if (anchor.every(a => a.g === anchor[0].g)) { // mixed boys and girls, when the theme has both
    const other = theme.anchor.items.find(a => a.g !== anchor[0].g && !anchor.includes(a))
    if (other) anchor = [...anchor.slice(0, n - 1), other]
  }
  const defs = theme.cats.slice(0, L.K - 1)
  const cats = [{ id: 'anchor', label: theme.anchor.label, items: anchor }]
  for (const d of defs) {
    let items
    if (d.ordered) { const s = rng.int(0, d.items.length - n); items = d.items.slice(s, s + n) }
    else { const chosen = new Set(rng.shuffle(d.items).slice(0, n)); items = d.items.filter(x => chosen.has(x)) }
    cats.push({ ...d, items })
  }
  return withGeometry(theme, cats)
}

function weightedType(rng, w) {
  const entries = Object.entries(w).filter(([, v]) => v > 0)
  let r = rng.next() * entries.reduce((s, [, v]) => s + v, 0)
  for (const [t, v] of entries) { r -= v; if (r < 0) return t }
  return entries[0][0]
}

function randomClue(rng, puz, sol, weights) {
  const { K, n } = puz, type = weightedType(rng, weights)
  const ref = (c, e) => [c, sol[c][e]]
  const other = e => { let e2; do e2 = rng.int(0, n - 1); while (e2 === e); return e2 }
  const twoCats = () => { const ci = rng.int(0, K - 1); let cj; do cj = rng.int(0, K - 1); while (cj === ci); return [ci, cj] }
  const e = rng.int(0, n - 1)
  if (type === 'same') { const [ci, cj] = twoCats(); return { type, refs: [ref(ci, e), ref(cj, e)] } }
  if (type === 'diff') { const [ci, cj] = twoCats(); return { type, refs: [ref(ci, e), ref(cj, other(e))] } }
  if (type === 'either') {
    const ci = rng.int(0, K - 1), rest = [...Array(K).keys()].filter(c => c !== 0 && c !== ci)
    const y = ref(rng.pick(rest), e), z = ref(rng.pick(rest), other(e))
    return { type, refs: rng.next() < 0.5 ? [ref(ci, e), y, z] : [ref(ci, e), z, y] }
  }
  // ordering clue between two different people, described through non-ordered categories
  const pos = sol[puz.ord], cats = [...Array(K).keys()].filter(c => c !== puz.ord)
  const ents = [...Array(n).keys()]
  const pairsOk = []
  for (const a of ents) for (const b of ents) if (a !== b && ORDER_OK[type](pos[a], pos[b])) pairsOk.push([a, b])
  const [a, b] = rng.pick(pairsOk)
  return { type, refs: [ref(rng.pick(cats), a), ref(rng.pick(cats), b)], variant: type === 'less' ? rng.int(0, 1) : 0 }
}

const clueKey = c => `${c.type}|${c.refs.map(r => r.join(',')).join('|')}`

export function solutionGrid(puz) {
  const st = emptyState(puz)
  for (const [i, j] of pairs(puz)) for (let a = 0; a < puz.n; a++) for (let b = 0; b < puz.n; b++)
    st[cellIndex(puz, [i, a], [j, b])] = puz.sol[i].indexOf(a) === puz.sol[j].indexOf(b) ? 1 : -1
  return st
}

export function generatePuzzle(seed, levelId = 'medium', themeId = null) {
  const L = LEVELS[levelId] || LEVELS.medium
  const rng = rngOf(seed)
  const theme = THEMES.find(t => t.id === themeId) || rng.pick(THEMES)
  for (let attempt = 0; attempt < 60; attempt++) {
    const puz = instantiate(rng, L, theme)
    const sol = [[...Array(L.n).keys()]]
    for (let c = 1; c < L.K; c++) sol.push(rng.shuffle([...Array(L.n).keys()]))
    const keys = new Set()
    let guard = 0
    while (countSolutions(puz) > 1 && guard++ < 300) {
      const c = randomClue(rng, puz, sol, L.weights), key = clueKey(c)
      if (!keys.has(key)) { keys.add(key); puz.clues.push(c) }
    }
    if (countSolutions(puz) !== 1) continue
    // drop every clue the puzzle can do without → each remaining clue is needed
    for (const c of rng.shuffle(puz.clues)) {
      const rest = puz.clues.filter(x => x !== c)
      if (countSolutions({ ...puz, clues: rest }) === 1) puz.clues = rest
    }
    puz.clues = rng.shuffle(puz.clues)
    // must be solvable step by step with explainable deductions
    // (hard puzzles may need at most two "assume and reach a contradiction" steps)
    const { solved, steps } = solveSteps(puz, { trial: L.trial })
    if (!solved || steps.filter(s => s.reason.k === 'trial').length > (L.trial ? 2 : 0)) continue
    puz.sol = sol
    puz.seed = seed
    puz.level = L.id
    puz.clues.forEach(c => { c.text = clueText(puz, c) })
    return puz
  }
  throw new Error(`no puzzle for seed ${seed}`)
}

// Same puzzle for everyone on the same Israeli date.
export function dailySeed(dayNumber) { return dayNumber * 7919 + 1013 }

// ---- Hebrew explanations ----------------------------------------------------------------------
export function stepText(puz, step) {
  const r = step.reason, st = (x, y, v) => statement(puz, x, y, v === 1)
  const x0 = step.cells[0][0]
  const target = step.cells.map(([x, y, v]) => st(x, y, v))
  const list = target.length > 1 ? target.slice(0, -1).join(', ') + ' וגם ' + target.at(-1) : target[0]
  const clue = ci => `רמז ${ci + 1}`
  switch (r.k) {
    case 'clue': return `${clue(r.ci)} אומר את זה במפורש: ${list}.`
    case 'either-elim': return `לפי ${clue(r.ci)} נשארו רק שתי אפשרויות, ולכן ${list}.`
    case 'either-excl': return `לפי ${clue(r.ci)} רק אחד משני החלקים נכון — ולכן הם לא שייכים לאותו אחד: ${list}.`
    case 'either-infer': return `לפי ${clue(r.ci)} אחת משתי האפשרויות נכונה. כבר ידוע ש${st(x0, r.no, -1)}, ולכן ${list}.`
    case 'either-one': return `לפי ${clue(r.ci)} רק אחד משני החלקים נכון. כבר ידוע ש${st(x0, r.yes, 1)}, ולכן ${list}.`
    case 'order-distinct': return `${clue(r.ci)} מדבר על ${puz.theme.who.two}, ולכן ${list}.`
    case 'order': {
      const O = puz.cats[puz.ord]
      return `לפי ${clue(r.ci)}, ${list}: אחרת לא הייתה ${O.label === 'שעה' || O.label === 'שעת הגעה' ? 'שעה' : 'אפשרות'} שמתאימה ל${refPhrase(puz, r.other).s}.`
    }
    case 'only': return `כבר ידוע ש${st(r.x, r.y, 1)}, ובכל שורה ובכל עמודה יש רק ✓ אחד — ולכן ${list}.`
    case 'last': return `כל שאר האפשרויות כבר נפסלו, ונשארה רק אחת: ${list}.`
    case 'trans': {
      const [A, B] = r.link, [K1, C1, v1] = r.known
      return `ידוע ש${st(A, B, 1)}, וגם ש${st(K1, C1, v1)} — ולכן ${list}.`
    }
    case 'cross': return `בטבלת "${puz.cats[r.j].label}" אין אף אפשרות שמתאימה גם ל${refPhrase(puz, r.a).s} וגם ל${refPhrase(puz, r.c).s}, ולכן ${list}.`
    case 'trial': return `נניח ש${st(r.x, r.y, r.assumed)}. אם ממשיכים להסיק מהרמזים, מגיעים לסתירה — ולכן ${st(r.x, r.y, -r.assumed)}.`
    default: return `${list}.`
  }
}
