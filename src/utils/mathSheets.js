// Rule-based first-grade maths sheets: every sheet comes from (settings, seed),
// so "new sheet" is just a new seed and nothing is stored anywhere.

export function rng(seed) {
  let a = seed >>> 0 || 1
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
}
export const newSeed = () => Math.floor(Math.random() * 1e9) + 1
const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1))

// One exercise within `range`. Up to 20, most exercises cross ten (8+5, 13-6),
// because that is what first grade actually practises at that level.
function exercise(r, range, op) {
  const o = op === 'mix' ? (r() < 0.5 ? '+' : '-') : op
  const cross = range > 10 && r() < 0.7
  if (o === '+') {
    let a, b
    if (cross) { a = int(r, 2, 9); b = int(r, 11 - a, Math.min(9, range - a)) } else { a = int(r, 0, range); b = int(r, 0, range - a) }
    if (a + b === 0) b = 1
    return { a, b, o, c: a + b }
  }
  let a, b
  if (cross) { a = int(r, 11, 18); b = int(r, a - 9, 9) } else { a = int(r, 1, range); b = int(r, 0, a) }
  return { a, b, o, c: a - b }
}

export function exercises({ range, op, type, count, seed }) {
  const r = rng(seed), seen = new Set(), out = []
  for (let tries = 0; out.length < count && tries < count * 60; tries++) {
    const e = exercise(r, type === 'pictures' ? Math.min(range, 10) : range, op)
    if (type === 'pictures' && e.o === '+' && (e.a === 0 || e.b === 0)) continue
    const key = e.a + e.o + e.b
    if (seen.has(key) && tries < count * 30) continue
    seen.add(key)
    // Missing-number: hide one of the operands instead of the result.
    e.hide = type === 'missing' ? (r() < 0.5 ? 'a' : 'b') : 'c'
    out.push(e)
  }
  return out
}

// שבילים: a start number and four steps (+k / −k) that stay inside 0..range.
// hide: 'numbers' – fill the circles; 'ops' – fill the operations; 'mixed'.
export function paths({ range, count, variant, seed }) {
  const r = rng(seed), maxStep = range > 10 ? 9 : 5, out = []
  for (let i = 0; i < count; i++) {
    const nums = [int(r, 0, range)], ops = []
    for (let s = 0; s < 4; s++) {
      const cur = nums[s]
      const canUp = cur < range, canDown = cur > 0
      const up = canUp && (!canDown || r() < 0.5)
      const k = up ? int(r, 1, Math.min(maxStep, range - cur)) : int(r, 1, Math.min(maxStep, cur))
      ops.push(up ? '+' + k : '−' + k)
      nums.push(up ? cur + k : cur - k)
    }
    const hideNum = nums.map((_, j) => j > 0 && (variant === 'numbers' || (variant === 'mixed' && r() < 0.5)))
    // In the mixed variant an operation is only hidden when both numbers around it are shown.
    const hideOp = ops.map((_, j) => variant === 'ops' || (variant === 'mixed' && !hideNum[j] && !hideNum[j + 1] && r() < 0.7))
    if (!hideNum.some(Boolean) && !hideOp.some(Boolean)) hideNum[4] = true
    out.push({ nums, ops, hideNum, hideOp })
  }
  return out
}
