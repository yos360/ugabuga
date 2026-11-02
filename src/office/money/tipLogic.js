// Pure logic for /tools/tip-calculator: tip, total and split between diners, in whole agorot.
export const TIP_PRESETS = [10, 12, 15, 18, 20]
export const TIP_MAX = 1e9

// bill: amount on the check; pct: tip percent; people: diners; roundUp: round each share up to a whole shekel.
export function computeTip(bill, pct, people = 1, roundUp = false) {
  if (!Number.isFinite(bill) || bill <= 0 || bill > TIP_MAX) return null
  if (!Number.isFinite(pct) || pct < 0 || pct > 100) return null
  const p = Math.floor(people)
  if (!(p >= 1 && p <= 100)) return null
  const b = Math.round(bill * 100)
  let tip = Math.round(b * pct / 100)
  let share = Math.ceil((b + tip) / p) // nobody pays an agora short
  if (roundUp) share = Math.ceil(share / 100) * 100
  const total = share * p
  tip = total - b
  return { bill: b / 100, tip: tip / 100, total: total / 100, share: share / 100, people: p, pct: b ? Math.round(tip / b * 1000) / 10 : 0 }
}
