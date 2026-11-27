import { hebrewParts } from './hebrewCalendar.js'

// Finds the next Rosh Chodesh of a Hebrew month using the browser's own Hebrew calendar (Intl).
// `names` are the month names Intl returns (Adar has three in leap years). Returns
// { days: [Date, ...] } — one date, or two when the month before has 30 days — or null when the
// Hebrew calendar isn't available. Scans up to 400 days from `from`, so every month is found.
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

export function nextRoshChodesh(names, from = new Date()) {
  const start = addDays(from, -1) // so "today is the second day" still counts
  for (let i = 0; i < 400; i++) {
    const d = addDays(start, i), h = hebrewParts(d)
    if (!h) return null
    if (h.day === 1 && names.includes(h.month)) {
      const prev = addDays(d, -1), p = hebrewParts(prev)
      const days = p && p.day === 30 ? [prev, d] : [d]
      const last = days[days.length - 1]
      if (last >= new Date(from.getFullYear(), from.getMonth(), from.getDate())) return { days }
    }
  }
  return null
}
