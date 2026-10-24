// When Israel's clocks change.
// Israel (since 2013): summer time starts on the Friday before the last Sunday of March at 02:00 (→ 03:00)
// and ends on the last Sunday of October at 02:00 (→ 01:00).
const lastSunday = (y, m) => { const d = new Date(Date.UTC(y, m + 1, 0)); d.setUTCDate(d.getUTCDate() - d.getUTCDay()); return d }
export function israelChanges(year) {
  const spring = lastSunday(year, 2); spring.setUTCDate(spring.getUTCDate() - 2)
  return [{ kind: 'summer', date: spring }, { kind: 'winter', date: lastSunday(year, 9) }]
}
export function nextChange(now = new Date()) {
  const y = Number(now.toLocaleString('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric' }))
  const today = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' })
  return [...israelChanges(y), ...israelChanges(y + 1)].find(c => c.date.toISOString().slice(0, 10) >= today)
}
