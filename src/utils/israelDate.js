// Calendar-day arithmetic on Israel's local date. Holidays start in the evening, so counting 24-hour
// periods said "tomorrow" on the day itself; compare dates on the Israeli calendar instead.
const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit' })
export function israelDayNumber(time) {
  const [y, m, d] = fmt.format(new Date(time)).split('-').map(Number)
  return Date.UTC(y, m - 1, d) / 86400000
}
// 0 = same Israeli date (e.g. the holiday starts tonight), 1 = tomorrow, …
export const daysUntil = (start, now = Date.now()) => israelDayNumber(start) - israelDayNumber(now)
