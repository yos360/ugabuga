// Backgammon (שש בש) rules engine + computer player.
// Points 1..24 from the human's view; the human (+) moves 24 → 1 with home 1–6 and bears off to 0,
// the computer (−) moves 1 → 24 with home 19–24 and bears off to 25.
// Bar: the human enters from 25, the computer from 0. pts[i] > 0 = human checkers, < 0 = computer.

export const HUMAN = 1, CPU = -1

export function initialPoints() {
  const p = Array(26).fill(0)
  p[24] = 2; p[13] = 5; p[8] = 3; p[6] = 5
  p[1] = -2; p[12] = -5; p[17] = -3; p[19] = -5
  return p
}

export function newGame() {
  return { pts: initialPoints(), bar: { 1: 0, [-1]: 0 }, off: { 1: 0, [-1]: 0 }, turn: HUMAN, dice: [], left: [] }
}

export const clone = s => ({ ...s, pts: s.pts.slice(), bar: { ...s.bar }, off: { ...s.off }, dice: s.dice.slice(), left: s.left.slice() })
export const rollDie = () => 1 + Math.floor(Math.random() * 6)
export const diceToMoves = ([a, b]) => (a === b ? [a, a, a, a] : [a, b])

const own = (s, i, pl) => Math.sign(s.pts[i]) === pl ? Math.abs(s.pts[i]) : 0
const allHome = (s, pl) => {
  if (s.bar[pl]) return false
  for (let i = 1; i <= 24; i++) if (own(s, i, pl) && (pl === HUMAN ? i > 6 : i < 19)) return false
  return true
}

// Moves for one die value. from: 1..24 or 'bar'; to: 1..24 or 'off'.
export function singleMoves(s, die, pl = s.turn) {
  const out = []
  const blocked = to => Math.sign(s.pts[to]) === -pl && Math.abs(s.pts[to]) >= 2
  if (s.bar[pl]) {
    const to = pl === HUMAN ? 25 - die : die
    if (!blocked(to)) out.push({ from: 'bar', to, die })
    return out
  }
  const home = allHome(s, pl)
  for (let i = 1; i <= 24; i++) {
    if (!own(s, i, pl)) continue
    const to = i - pl * die
    if (to >= 1 && to <= 24) { if (!blocked(to)) out.push({ from: i, to, die }) }
    else if (home) {
      const exact = pl === HUMAN ? to === 0 : to === 25
      let highest = true // no own checker farther from home than i
      if (!exact) for (let j = 1; j <= 24; j++) if (own(s, j, pl) && (pl === HUMAN ? j > i : j < i)) { highest = false; break }
      if (exact || highest) out.push({ from: i, to: 'off', die })
    }
  }
  return out
}

export function applySingle(s0, m) {
  const s = clone(s0), pl = s.turn
  if (m.from === 'bar') s.bar[pl]--
  else s.pts[m.from] -= pl
  let hit = false
  if (m.to === 'off') s.off[pl]++
  else {
    if (Math.sign(s.pts[m.to]) === -pl) { s.pts[m.to] = 0; s.bar[-pl]++; hit = true }
    s.pts[m.to] += pl
  }
  const k = s.left.indexOf(m.die)
  if (k >= 0) s.left.splice(k, 1)
  return { state: s, hit }
}

// All maximal move sequences for the remaining dice (rules: use as many dice as possible; if only one
// of two different dice can be played, the larger must be played when possible).
export function sequences(s) {
  const results = []
  const seen = new Set()
  const walk = (st, seq) => {
    const vals = [...new Set(st.left)]
    let moved = false
    for (const d of vals) for (const m of singleMoves(st, d)) {
      moved = true
      walk(applySingle(st, m).state, [...seq, m])
    }
    if (!moved) {
      const key = seq.map(m => `${m.from}>${m.to}`).sort().join(',') + '|' + st.pts.join(',')
      if (!seen.has(key)) { seen.add(key); results.push({ seq, end: st }) }
    }
  }
  walk(s, [])
  const max = Math.max(0, ...results.map(r => r.seq.length))
  let best = results.filter(r => r.seq.length === max)
  if (max === 1 && s.left.length === 2 && s.left[0] !== s.left[1]) {
    const hi = Math.max(...s.left)
    if (best.some(r => r.seq[0].die === hi)) best = best.filter(r => r.seq[0].die === hi)
  }
  return best
}

// Single moves allowed right now = first steps of the maximal sequences.
export function allowedMoves(s) {
  const seqs = sequences(s)
  const out = [], keys = new Set()
  for (const r of seqs) if (r.seq.length) {
    const m = r.seq[0], k = `${m.from}>${m.to}>${m.die}`
    if (!keys.has(k)) { keys.add(k); out.push(m) }
  }
  return out
}

export const winner = s => (s.off[HUMAN] === 15 ? HUMAN : s.off[CPU] === 15 ? CPU : 0)
export function pips(s, pl) {
  let n = s.bar[pl] * 25
  for (let i = 1; i <= 24; i++) n += own(s, i, pl) * (pl === HUMAN ? i : 25 - i)
  return n
}

// ---- computer ----
function evaluate(s, pl) {
  const me = pl, op = -pl
  let score = (pips(s, op) - pips(s, me)) * 1.0
  score += (s.off[me] - s.off[op]) * 6
  score -= s.bar[me] * 14
  score += s.bar[op] * 10
  const dist = (i, pl2) => (pl2 === HUMAN ? i : 25 - i) // distance to bear-off for pl2
  for (let i = 1; i <= 24; i++) {
    const n = own(s, i, me)
    if (n >= 2) {
      const d = dist(i, me)
      score += d <= 6 ? 6 : d <= 8 ? 4 : 1.5 // made points, esp. home board / bar point
    } else if (n === 1) {
      // blot risk: opponent checkers (incl. bar) behind it within direct range
      let shooters = 0
      for (let j = 1; j <= 24; j++) {
        const c = own(s, j, op)
        if (!c) continue
        const gap = op === HUMAN ? j - i : i - j
        if (gap > 0 && gap <= 11) shooters += gap <= 6 ? 3 : 1
      }
      if (s.bar[op]) shooters += 3
      const d = dist(i, me)
      score -= Math.min(shooters, 8) * (d <= 6 ? 1.6 : 1.1)
    }
  }
  // opponent stuck on the bar vs our home board
  if (s.bar[op]) { let closed = 0; for (let k = 1; k <= 6; k++) { const i = me === HUMAN ? k : 25 - k; if (own(s, i, me) >= 2) closed++ } score += closed * 4 }
  return score
}

export const LEVELS = [
  { id: 1, label: 'קל', noise: 1e6 },
  { id: 2, label: 'בינוני', noise: 12 },
  { id: 3, label: 'קשה', noise: 0 },
]

export function computerSequence(s, level = 2) {
  const L = LEVELS.find(l => l.id === level) || LEVELS[1]
  const seqs = sequences(s)
  if (!seqs.length || !seqs[0].seq.length) return []
  let best = seqs[0], bestV = -Infinity
  for (const r of seqs) {
    const v = evaluate(r.end, s.turn) + Math.random() * L.noise
    if (v > bestV) { bestV = v; best = r }
  }
  return best.seq
}
