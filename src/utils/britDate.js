import { parseISO, toISO, formatGregHe } from './hebrewBirthday.js'

// A brit milah is held on the eighth day of life (the day of birth counts as day 1). The Hebrew day
// begins at nightfall, so a baby born after sunset is counted from the next calendar day.
// General rule only: a physician and the mohel decide if health requires a postponement.
export function britDate(iso, afterSunset = false) {
  const born = parseISO(iso)
  if (!born) return null
  const days = afterSunset ? 8 : 7
  const date = new Date(born.getFullYear(), born.getMonth(), born.getDate() + days, 12)
  return { date, iso: toISO(date), text: formatGregHe(date), shabbat: date.getDay() === 6, friday: date.getDay() === 5 }
}

// The day before the brit (for planning the evening before: setting up, guests arriving).
export function eveOfBrit(iso, afterSunset = false) {
  const b = britDate(iso, afterSunset)
  if (!b) return null
  const d = new Date(b.date.getFullYear(), b.date.getMonth(), b.date.getDate() - 1, 12)
  return { date: d, iso: toISO(d), text: formatGregHe(d) }
}
