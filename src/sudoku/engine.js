// Sudoku engine — plain JS, no React, shared by the /sudoku pages, the bank builder
// (scripts/sudoku/build-bank.mjs) and the tests.
//
// Boards: 4×4 (2×2 boxes), 6×6 (2×3 boxes) and 9×9 (3×3 boxes). A grid is a flat array,
// row by row, 0 = empty.
//
// DIFFICULTY (how it is graded — see grade()):
//   A human-style logical solver works on pencil-mark candidates. It fills every single it
//   can; when stuck it uses the easiest tier of techniques that makes progress (one "round"),
//   then goes back to singles. Techniques are grouped in tiers:
//     tier 1  naked single, hidden single
//     tier 2  locked candidates (pointing / claiming), naked pair, hidden pair
//     tier 3  naked triple, hidden triple, X-wing, swordfish
//   The level is the hardest tier the puzzle *requires*:
//     easy       tier 1 only and at least 36 givens (plenty of open singles at every step)
//     medium     tier 1 only, but fewer than 36 givens (fewer open singles, longer hunt)
//     hard       needs pencil-mark techniques (tier 2 or 3) — still fully solvable by
//                logic, without guessing
//     very-hard  the logical solver gets stuck — needs trial and error (chains / guessing);
//                for these we also record the backtracking effort (search nodes).
//   Every puzzle — generated or from the bank — has exactly one solution (checked by
//   countSolutions with limit 2).
//
// SPEED ON PHONES: 9×9 puzzles are not generated in the browser. A bank of graded
// base puzzles (src/sudoku/bank.js, built offline) is turned into a practically endless
// supply by seeded, validity-preserving transformations (digit relabelling, swapping rows
// inside a band, bands, columns inside a stack, stacks, transposing). These keep the
// solution unique and the required techniques identical, so the grade is preserved.
// Kids boards (4×4 / 6×6) are tiny and are generated on the fly.

export const LEVELS_9 = ['easy', 'medium', 'hard', 'very-hard']
export const EASY_MIN_GIVENS = 36

// ---------- seeded random ----------
export function rng(seed) {
  let s = seed | 0
  return () => {
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
function shuffle(a, rand) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}

// ---------- geometry ----------
const BOXES = { 4: [2, 2], 6: [2, 3], 9: [3, 3] }
const GEOM = new Map()
export function geom(n) {
  if (GEOM.has(n)) return GEOM.get(n)
  if (!BOXES[n]) throw new Error(`unsupported size ${n}`)
  const [br, bc] = BOXES[n]
  const rows = [], cols = [], boxes = []
  for (let r = 0; r < n; r++) rows.push(Array.from({ length: n }, (_, c) => r * n + c))
  for (let c = 0; c < n; c++) cols.push(Array.from({ length: n }, (_, r) => r * n + c))
  for (let b = 0; b < n; b++) {
    const r0 = Math.floor(b / (n / bc)) * br, c0 = (b % (n / bc)) * bc, cells = []
    for (let dr = 0; dr < br; dr++) for (let dc = 0; dc < bc; dc++) cells.push((r0 + dr) * n + c0 + dc)
    boxes.push(cells)
  }
  const boxOf = new Array(n * n)
  boxes.forEach((cells, b) => cells.forEach(i => { boxOf[i] = b }))
  const peers = Array.from({ length: n * n }, (_, i) => {
    const r = Math.floor(i / n), c = i % n
    const s = new Set([...rows[r], ...cols[c], ...boxes[boxOf[i]]]); s.delete(i)
    return [...s]
  })
  const g = { n, br, bc, rows, cols, boxes, units: [...rows, ...cols, ...boxes], boxOf, peers, full: (1 << n) - 1 }
  GEOM.set(n, g)
  return g
}

const POP = new Uint8Array(1 << 9)
for (let i = 1; i < POP.length; i++) POP[i] = POP[i >> 1] + (i & 1)
const pop = m => POP[m]
const lowDigit = m => 31 - Math.clz32(m & -m) + 1 // mask with one bit -> digit 1..n
const digitsOf = m => { const out = []; for (let v = 1; m; v++, m >>= 1) if (m & 1) out.push(v); return out }

// ---------- validity ----------
// Cells whose value repeats in a row, column or box.
export function conflicts(grid, n) {
  const G = geom(n), bad = new Set()
  for (const unit of G.units) {
    const seen = new Map()
    for (const i of unit) {
      const v = grid[i]
      if (!v) continue
      if (seen.has(v)) { bad.add(i); bad.add(seen.get(v)) } else seen.set(v, i)
    }
  }
  return bad
}

// ---------- brute-force counter (bitmask DFS, most-constrained cell first) ----------
// Returns { count (capped at limit), solution (first found), nodes (search effort) }.
export function countSolutions(grid, n, limit = 2, rand = null) {
  const G = geom(n), N = n * n
  if (grid.length !== N) throw new Error('bad grid length')
  if (conflicts(grid, n).size) return { count: 0, solution: null, nodes: 0, invalid: true }
  const g = Int8Array.from(grid)
  const rowM = new Int32Array(n), colM = new Int32Array(n), boxM = new Int32Array(n)
  for (let i = 0; i < N; i++) if (g[i]) {
    const bit = 1 << (g[i] - 1), r = (i / n) | 0, c = i % n
    rowM[r] |= bit; colM[c] |= bit; boxM[G.boxOf[i]] |= bit
  }
  let count = 0, solution = null, nodes = 0
  const rec = () => {
    let best = -1, bestMask = 0, bestPop = 99
    for (let i = 0; i < N; i++) {
      if (g[i]) continue
      const m = G.full & ~(rowM[(i / n) | 0] | colM[i % n] | boxM[G.boxOf[i]])
      const p = pop(m)
      if (p === 0) return
      if (p < bestPop) { best = i; bestMask = m; bestPop = p; if (p === 1) break }
    }
    if (best < 0) { count++; if (!solution) solution = Array.from(g); return }
    let ds = digitsOf(bestMask)
    if (rand) ds = shuffle(ds, rand)
    const r = (best / n) | 0, c = best % n, b = G.boxOf[best]
    for (const v of ds) {
      const bit = 1 << (v - 1)
      nodes++
      g[best] = v; rowM[r] |= bit; colM[c] |= bit; boxM[b] |= bit
      rec()
      g[best] = 0; rowM[r] &= ~bit; colM[c] &= ~bit; boxM[b] &= ~bit
      if (count >= limit) return
    }
  }
  rec()
  return { count, solution, nodes }
}

export const isUnique = (grid, n) => countSolutions(grid, n, 2).count === 1

// ---------- human-style logical solver ----------
// Works in ROUNDS so the result does not depend on scan order (and therefore is the same
// for a puzzle and any relabelled / reshuffled copy of it):
//   1. fill singles until none are left (this end state is unique);
//   2. if stuck, collect EVERY elimination the easiest productive tier offers on that same
//      snapshot, apply them all at once, count one round for that tier, and go back to 1.
function combos(arr, k, start = 0, acc = [], out = []) {
  if (acc.length === k) { out.push(acc.slice()); return out }
  for (let i = start; i < arr.length; i++) { acc.push(arr[i]); combos(arr, k, i + 1, acc, out); acc.pop() }
  return out
}

function makeState(grid, n) {
  const G = geom(n), N = n * n
  const values = Array.from(grid), cand = new Int32Array(N)
  for (let i = 0; i < N; i++) {
    if (values[i]) continue
    let m = G.full
    for (const p of G.peers[i]) if (values[p]) m &= ~(1 << (values[p] - 1))
    cand[i] = m
  }
  return { G, n, values, cand }
}
function place(S, i, v) {
  S.values[i] = v; S.cand[i] = 0
  const bit = ~(1 << (v - 1))
  for (const p of S.G.peers[i]) S.cand[p] &= bit
}
// Fill naked and hidden singles until none remain. Returns false on a contradiction.
function singles(S) {
  const { G, n } = S
  for (let again = true; again;) {
    again = false
    for (let i = 0; i < S.cand.length; i++) {
      if (S.values[i]) continue
      if (!S.cand[i]) return false
      if (pop(S.cand[i]) === 1) { place(S, i, lowDigit(S.cand[i])); again = true }
    }
    for (const unit of G.units) for (let v = 1; v <= n; v++) {
      const bit = 1 << (v - 1)
      let at = -1, k = 0, placed = false
      for (const i of unit) {
        if (S.values[i] === v) { placed = true; break }
        if (!S.values[i] && (S.cand[i] & bit)) { at = i; k++ }
      }
      if (placed) continue
      if (k === 0) return false
      if (k === 1) { place(S, at, v); again = true }
    }
  }
  return true
}

// Each finder returns eliminations [cell, mask] found on the current snapshot (no mutation).
const open = (S, cells, bit) => cells.filter(i => !S.values[i] && (S.cand[i] & bit))
function lockedCandidates(S) {
  const { G, n } = S, out = []
  for (let b = 0; b < n; b++) for (let v = 1; v <= n; v++) {
    const bit = 1 << (v - 1), cells = open(S, G.boxes[b], bit)
    if (cells.length < 2) continue
    const rs = new Set(cells.map(i => (i / n) | 0)), cs = new Set(cells.map(i => i % n))
    if (rs.size === 1) for (const i of open(S, G.rows[[...rs][0]], bit)) if (G.boxOf[i] !== b) out.push([i, bit])
    if (cs.size === 1) for (const i of open(S, G.cols[[...cs][0]], bit)) if (G.boxOf[i] !== b) out.push([i, bit])
  }
  for (const line of [...G.rows, ...G.cols]) for (let v = 1; v <= n; v++) {
    const bit = 1 << (v - 1), cells = open(S, line, bit)
    if (cells.length < 2) continue
    const bs = new Set(cells.map(i => G.boxOf[i]))
    if (bs.size !== 1) continue
    const inLine = new Set(line)
    for (const i of open(S, G.boxes[[...bs][0]], bit)) if (!inLine.has(i)) out.push([i, bit])
  }
  return out
}
function nakedSubset(S, k) {
  const out = []
  for (const unit of S.G.units) {
    const cells = unit.filter(i => !S.values[i] && pop(S.cand[i]) <= k)
    if (cells.length < k) continue
    for (const set of combos(cells, k)) {
      let m = 0
      for (const i of set) m |= S.cand[i]
      if (pop(m) !== k) continue
      for (const i of unit) if (!S.values[i] && !set.includes(i) && (S.cand[i] & m)) out.push([i, S.cand[i] & m])
    }
  }
  return out
}
function hiddenSubset(S, k) {
  const out = []
  for (const unit of S.G.units) {
    const where = new Map()
    for (let v = 1; v <= S.n; v++) {
      const cells = open(S, unit, 1 << (v - 1))
      if (cells.length >= 2 && cells.length <= k) where.set(v, cells)
    }
    if (where.size < k) continue
    for (const ds of combos([...where.keys()], k)) {
      const cells = new Set(ds.flatMap(v => where.get(v)))
      if (cells.size !== k) continue
      const keep = ds.reduce((m, v) => m | (1 << (v - 1)), 0)
      for (const i of cells) if (S.cand[i] & ~keep) out.push([i, S.cand[i] & ~keep])
    }
  }
  return out
}
function fish(S, k) {
  const { G, n } = S, out = []
  const variants = [[G.rows, G.cols, i => i % n, i => (i / n) | 0], [G.cols, G.rows, i => (i / n) | 0, i => i % n]]
  for (const [base, cover, posInLine, lineOf] of variants) {
    for (let v = 1; v <= n; v++) {
      const bit = 1 << (v - 1), lines = []
      base.forEach((line, li) => {
        const ps = open(S, line, bit).map(posInLine)
        if (ps.length >= 2 && ps.length <= k) lines.push([li, ps])
      })
      if (lines.length < k) continue
      for (const set of combos(lines, k)) {
        const covers = new Set(set.flatMap(([, ps]) => ps))
        if (covers.size !== k) continue
        const baseIdx = new Set(set.map(([li]) => li))
        for (const ci of covers) for (const i of open(S, cover[ci], bit)) if (!baseIdx.has(lineOf(i))) out.push([i, bit])
      }
    }
  }
  return out
}

export const TECHNIQUES = {
  lockedCandidates: { tier: 2, find: lockedCandidates, he: 'נעילה בשורה, בעמודה או בריבוע' },
  nakedPair: { tier: 2, find: S => nakedSubset(S, 2), he: 'זוג גלוי' },
  hiddenPair: { tier: 2, find: S => hiddenSubset(S, 2), he: 'זוג נסתר' },
  nakedTriple: { tier: 3, find: S => nakedSubset(S, 3), he: 'שלישייה גלויה' },
  hiddenTriple: { tier: 3, find: S => hiddenSubset(S, 3), he: 'שלישייה נסתרת' },
  xWing: { tier: 3, find: S => fish(S, 2), he: 'כנף X' },
  swordfish: { tier: 3, find: S => fish(S, 3), he: 'דג חרב' },
}

// Solve like a person. Returns { solved, tier (hardest needed: 1-3, 4 = stuck), rounds: {2: k, 3: k},
// used: {technique: rounds it contributed to}, grid (as far as logic got) }.
export function logicSolve(grid, n) {
  const S = makeState(grid, n), used = {}, rounds = { 2: 0, 3: 0 }
  let tier = 1
  for (;;) {
    if (!singles(S)) return { solved: false, broken: true, tier, rounds, used, grid: S.values }
    if (S.values.every(Boolean)) return { solved: true, tier, rounds, used, grid: S.values }
    let progressed = false
    for (const t of [2, 3]) {
      if (t === 3 && n < 9) break
      const elim = []
      for (const [name, tech] of Object.entries(TECHNIQUES)) {
        if (tech.tier !== t) continue
        const found = tech.find(S)
        if (found.length) { used[name] = (used[name] || 0) + 1; elim.push(...found) }
      }
      if (!elim.length) continue
      for (const [i, m] of elim) S.cand[i] &= ~m
      rounds[t]++
      if (t > tier) tier = t
      progressed = true
      break
    }
    if (!progressed) return { solved: false, tier: 4, rounds, used, grid: S.values }
  }
}

// Grade a 9×9 puzzle (assumed to have a unique solution). See the header comment.
export function grade(grid, n = 9) {
  const givens = grid.filter(Boolean).length
  const res = logicSolve(grid, n)
  let level
  if (!res.solved) level = 'very-hard'
  else if (res.tier >= 2) level = 'hard'
  else level = givens >= EASY_MIN_GIVENS ? 'easy' : 'medium'
  const out = { level, givens, tier: res.tier, rounds: res.rounds, used: res.used }
  if (level === 'very-hard') out.nodes = countSolutions(grid, n, 2).nodes
  return out
}

// ---------- generator (used offline for the 9×9 bank and live for kids boards) ----------
export function fullGrid(n, rand) {
  return countSolutions(Array(n * n).fill(0), n, 1, rand).solution
}

// Remove clues in rotationally-symmetric pairs while the puzzle stays unique and
// `keepOk(puzzle)` holds; stop at `minGivens`.
function carve(full, n, rand, { minGivens = 0, keepOk = () => true } = {}) {
  const N = n * n, puzzle = full.slice()
  const pairs = []
  for (let i = 0; i <= (N - 1) / 2; i++) pairs.push([i, N - 1 - i])
  shuffle(pairs, rand)
  let givens = N
  for (const [a, b] of pairs) {
    const k = a === b ? 1 : 2
    if (givens - k < minGivens) continue
    const va = puzzle[a], vb = puzzle[b]
    puzzle[a] = 0; puzzle[b] = 0
    if (isUnique(puzzle, n) && keepOk(puzzle)) givens -= k
    else { puzzle[a] = va; puzzle[b] = vb }
  }
  return puzzle
}

const singlesOnly = n => p => { const r = logicSolve(p, n); return r.solved && r.tier === 1 }

// Generate one puzzle of the requested level. Deterministic for a given rand.
// 9×9 levels may retry several times (fine offline; the site uses the bank instead).
export function generate(level, rand, { maxTries = 400 } = {}) {
  if (level === 'kids4' || level === 'kids6') {
    const n = level === 'kids4' ? 4 : 6
    const full = fullGrid(n, rand)
    const puzzle = carve(full, n, rand, { minGivens: n === 4 ? 6 : 14, keepOk: singlesOnly(n) })
    return { n, level, puzzle, solution: full }
  }
  for (let t = 0; t < maxTries; t++) {
    const full = fullGrid(9, rand)
    let puzzle
    if (level === 'easy') puzzle = carve(full, 9, rand, { minGivens: EASY_MIN_GIVENS + Math.floor(rand() * 4), keepOk: singlesOnly(9) })
    else if (level === 'medium') puzzle = carve(full, 9, rand, { minGivens: 27 + Math.floor(rand() * 6), keepOk: singlesOnly(9) })
    else puzzle = carve(full, 9, rand)
    const gr = grade(puzzle)
    if (gr.level === level) return { n: 9, level, puzzle, solution: full, grade: gr }
  }
  throw new Error(`could not generate a ${level} puzzle`)
}

// ---------- validity-preserving transformations ----------
// Returns a function mapping a grid to its transformed copy (same function for puzzle and solution).
export function randomTransform(n, rand) {
  const { br, bc } = geom(n)
  const perm = k => shuffle(Array.from({ length: k }, (_, i) => i), rand)
  const bandOrder = perm(n / br), rowsIn = Array.from({ length: n / br }, () => perm(br))
  const rowMap = bandOrder.flatMap((b, bi) => rowsIn[bi].map(r => b * br + r))
  const stackOrder = perm(n / bc), colsIn = Array.from({ length: n / bc }, () => perm(bc))
  const colMap = stackOrder.flatMap((s, si) => colsIn[si].map(c => s * bc + c))
  const digits = [0, ...perm(n).map(d => d + 1)]
  const transpose = br === bc && rand() < 0.5
  return grid => {
    const out = new Array(n * n)
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      const src = grid[rowMap[r] * n + colMap[c]]
      out[transpose ? c * n + r : r * n + c] = digits[src]
    }
    return out
  }
}

export const toString = grid => grid.map(v => (v ? String(v) : '.')).join('')
export const fromString = s => [...s].map(ch => (ch >= '1' && ch <= '9' ? Number(ch) : 0))
