// Levels of the clock and fraction worksheets (/printables/clock-worksheets, /printables/fractions-worksheets).
// Pure (no JSX) so node tests can check that every level opens on an item of its own level.

function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 } }
const pick = (r, arr) => arr[Math.floor(r() * arr.length)]

export const CLOCK_LEVELS = { hours: ['שעות עגולות', [0]], half: ['חצאי שעות', [0, 30]], quarter: ['רבעי שעה', [0, 15, 30, 45]], five: ['כל 5 דקות', Array.from({ length: 12 }, (_, i) => i * 5)] }

// Every other clock (starting with the first) uses only the minutes this level adds, so a "quarter
// hours" sheet opens with a quarter, not with a round hour that the easier sheets also have.
const CLOCK_KEYS = Object.keys(CLOCK_LEVELS)
export function clockItems(level, seed) {
  const li = Math.max(0, CLOCK_KEYS.indexOf(level)), r = rng(seed * 31 + li * 7919 + 1)
  const all = CLOCK_LEVELS[CLOCK_KEYS[li]][1], lower = li ? CLOCK_LEVELS[CLOCK_KEYS[li - 1]][1] : []
  const fresh = all.filter(m => !lower.includes(m))
  return Array.from({ length: 12 }, (_, i) => [1 + Math.floor(r() * 12), pick(r, i % 2 ? all : fresh)])
}

export const FRAC_LEVELS = { easy: ['חצי, שליש ורבע', [2, 3, 4]], mid: ['עד שישיות', [2, 3, 4, 5, 6]], hard: ['עד שמיניות', [2, 3, 4, 5, 6, 8]] }

// As with the clocks: every other shape (starting with the first) uses a denominator this level adds.
const FRAC_KEYS = Object.keys(FRAC_LEVELS)
export function fractionItems(level, mode, seed) {
  const li = Math.max(0, FRAC_KEYS.indexOf(level)), r = rng(seed * 17 + li * 7919 + mode.length)
  const dens = FRAC_LEVELS[FRAC_KEYS[li]][1], lower = li ? FRAC_LEVELS[FRAC_KEYS[li - 1]][1] : []
  const fresh = dens.filter(d => !lower.includes(d))
  const one = (pool) => { const d = pick(r, pool); return { d, n: 1 + Math.floor(r() * (d - 1 || 1)), kind: r() < 0.5 ? 'pie' : 'bar' } }
  return Array.from({ length: 12 }, (_, i) => { const pool = i % 2 ? dens : fresh; return mode === 'compare' ? [one(pool), one(dens)] : one(pool) })
}

