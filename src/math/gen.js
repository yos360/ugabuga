// Shared helpers for topic generators (deterministic: they only use the rng passed in).

// Shuffled options: the answer plus up to n-1 distinct distractors from `pool`.
export function choiceSet(r, answer, pool, n = 4) {
  const a = String(answer)
  const rest = [...new Set(pool.map(String))].filter(x => x !== a && x !== '')
  return r.shuffle([a, ...r.shuffle(rest).slice(0, n - 1)])
}

// Numeric distractors around a value (never negative unless allowed), as strings.
export function nearNumbers(answer, spread = [1, 2, 10], { allowNegative = false } = {}) {
  const out = []
  for (const d of spread) out.push(answer + d, answer - d)
  return out.filter(x => allowNegative || x >= 0)
}

// Children's names with grammatical gender, for word problems.
export const KIDS = [
  { name: 'נועה', f: true }, { name: 'יואב', f: false }, { name: 'מאיה', f: true }, { name: 'איתי', f: false },
  { name: 'תמר', f: true }, { name: 'עומר', f: false }, { name: 'שירה', f: true }, { name: 'אורי', f: false },
  { name: 'יעל', f: true }, { name: 'דניאל', f: false }, { name: 'הילה', f: true }, { name: 'אריאל', f: false },
]

// Two different kids.
export function twoKids(r) {
  const a = r.pick(KIDS)
  let b = r.pick(KIDS)
  while (b.name === a.name) b = r.pick(KIDS)
  return [a, b]
}

// Gendered verb/pronoun pick: g(kid, 'קיבל', 'קיבלה').
export const g = (kid, m, f) => (kid.f ? f : m)

// '7 + 8' style join with real minus sign.
export const fmt = n => (n < 0 ? `−${-n}` : String(n))

// A simple polygon with n vertices around a centre, mildly irregular but clearly showing every corner.
export function irregularPolygon(r, n, jitter) {
  const base = r.next() * Math.PI * 2, step = (Math.PI * 2) / n
  return Array.from({ length: n }, (_, i) => {
    const a = base + i * step + (r.next() - 0.5) * step * jitter
    const rad = 58 + r.int(0, 12)
    return [110 + rad * Math.cos(a), 85 + rad * Math.sin(a)]
  })
}

// Extra seed scramble used by the registry (createRng now mixes seeds too; kept so existing worksheet
// seeds stay reproducible and the registry doesn't depend on rng.js internals).
export function mixSeed(seed) {
  let h = (Number(seed) >>> 0) ^ 0x9e3779b9
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  h ^= h >>> 16
  return (h >>> 0) || 1
}
