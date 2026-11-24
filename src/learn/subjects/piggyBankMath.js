// Pure helpers for the piggy-bank page (savings goal calculator + the 20-coin tracker sheet).
// Money is handled in agorot (integers) so 0.1 + 0.2 style float errors never change the number of weeks.

export const COIN_COUNT = 20
export const DAYS_PER_MONTH = 30.44

const toAgorot = x => Math.round(Number(x) * 100)

// How many weeks of saving until the goal is reached.
// Returns { valid, done, remaining, weeks, months }. valid=false when the target or weekly amount is not a positive number.
export function weeksToGoal({ target, weekly, saved = 0 }) {
  const t = toAgorot(target), w = toAgorot(weekly), s = toAgorot(saved || 0)
  if (!Number.isFinite(t) || !Number.isFinite(w) || !Number.isFinite(s) || t <= 0 || s < 0) return { valid: false }
  const remainingAgorot = Math.max(0, t - s)
  if (remainingAgorot === 0) return { valid: true, done: true, remaining: 0, weeks: 0, months: 0 }
  if (w <= 0) return { valid: false }
  const weeks = Math.ceil(remainingAgorot / w)
  return { valid: true, done: false, remaining: remainingAgorot / 100, weeks, months: Math.round((weeks * 7) / DAYS_PER_MONTH * 10) / 10 }
}

// Each of the 20 coins on the tracker sheet stands for target / 20 shekels (shown with up to 2 decimals).
export function coinAmount(target) {
  const t = Number(target)
  if (!Number.isFinite(t) || t <= 0) return 0
  return Math.round((t / COIN_COUNT) * 100) / 100
}

// Running total after coin number k (1-based); the last coin always equals the target.
export function coinTotal(target, k) {
  const t = Number(target)
  if (!Number.isFinite(t) || t <= 0) return 0
  if (k >= COIN_COUNT) return t
  return Math.round(((t * k) / COIN_COUNT) * 100) / 100
}

// 3 -> "3", 1.5 -> "1.5", 1.65 -> "1.65", 12 -> "12"
export function fmt(n) {
  return String(Math.round(n * 100) / 100)
}

export function weeksLabel(n) {
  if (n === 1) return 'שבוע אחד'
  if (n === 2) return 'שבועיים'
  return `${n} שבועות`
}

// Net of a square-based box (S x S base, height H), drawn in a 200 x 270 sheet.
// Layout: a row of four side panels; the lid (S x S) is attached above panel 1 and the base below it.
// Lid: three glue tabs. Base: one tuck-in flap on its far edge. One glue tab on the right end of the panel row.
export const BOX_SIZES = {
  small: { S: 40, H: 40 },
  medium: { S: 42, H: 56 },
  large: { S: 44, H: 70 },
}
export const TAB = 7
export const TUCK = 10

export function netLayout(S, H, y0 = 22) {
  const x0 = (200 - 4 * S - TAB) / 2
  const yp = y0 + S
  const panels = [0, 1, 2, 3].map(i => ({ x: x0 + i * S, y: yp, w: S, h: H }))
  const top = { x: x0 + S, y: y0, w: S, h: S }
  const bottom = { x: x0 + S, y: yp + H, w: S, h: S }
  return { x0, y0, yp, panels, top, bottom, yEnd: yp + H + S + TUCK, xMin: x0 - 0, xMax: x0 + 4 * S + TAB }
}
