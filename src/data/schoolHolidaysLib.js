// Pure helpers for the school-holidays calendar (/school-holidays). Dates are 'YYYY-MM-DD' strings
// on the Israeli calendar; all arithmetic is done on UTC midnights so time zones never shift a day.

export const LEVELS = [
  { id: 'gan', label: 'גני ילדים', short: 'גן', emoji: '🧸' },
  { id: 'yesodi', label: 'בתי ספר יסודיים (א׳–ו׳)', short: 'יסודי', emoji: '🎒' },
  { id: 'al', label: 'חטיבות ביניים ותיכונים (ז׳–י״ב)', short: 'חט״ב ותיכון', emoji: '🎓' },
]

const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

const toUtc = s => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d) }
const dayNum = s => toUtc(s) / 86400000
export const addDays = (s, n) => new Date(toUtc(s) + n * 86400000).toISOString().slice(0, 10)
export const weekday = s => DAYS[new Date(toUtc(s)).getUTCDay()]
export const daysBetween = (from, to) => dayNum(to) - dayNum(from)
export const dayCount = (from, to) => daysBetween(from, to) + 1

// "יום חמישי, 10 בדצמבר 2026"
export function formatLong(s) {
  const d = new Date(toUtc(s))
  return `יום ${DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ב${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}
// "10.12" / "10.12.2026"
export const formatShort = (s, year = false) => { const [y, m, d] = s.split('-'); return `${Number(d)}.${Number(m)}${year ? '.' + y : ''}` }
// Words, not a dash: inside RTL text a dash between two dates is displayed in reverse order.
export const formatRange = (from, to) => from === to ? formatShort(from, true) : `${formatShort(from)} עד ${formatShort(to, true)}`

// The dates of one break for one level: { from, to, back } or null when that level has no such break.
export function rangeFor(b, level) {
  const r = b.dates[level] ?? b.dates.all
  return r ? { from: r[0], to: r[1], back: r[2] || null } : null
}

// Breaks (not the first/last school day markers) for a level, in date order.
export const breaksFor = (all, level) => all.filter(b => b.kind === 'break' && rangeFor(b, level)).sort((a, b) => rangeFor(a, level).from.localeCompare(rangeFor(b, level).from))

// The break that is happening now or is next, or null once the year is over.
export function nextBreak(all, level, today) {
  return breaksFor(all, level).find(b => rangeFor(b, level).to >= today) || null
}

// Countdown state for one break relative to `today`.
export function countdown(b, level, today) {
  const r = rangeFor(b, level)
  if (!r) return null
  if (today < r.from) return { state: 'before', days: daysBetween(today, r.from) }
  if (today <= r.to) return { state: 'during', days: daysBetween(today, r.to) }
  return { state: 'after', days: daysBetween(r.to, today) }
}

// iCalendar file with every break of a level, as all-day events (DTEND is exclusive).
export function buildIcs(all, level, yearLabel) {
  const lv = LEVELS.find(l => l.id === level)
  const ymd = s => s.replaceAll('-', '')
  const esc = t => String(t).replace(/[\\;,]/g, m => '\\' + m).replace(/\n/g, '\\n')
  const events = all.filter(b => rangeFor(b, level)).map(b => {
    const r = rangeFor(b, level)
    return [
      'BEGIN:VEVENT',
      `UID:${b.slug}-${level}-${ymd(r.from)}@ugabuga.co.il`,
      `DTSTAMP:${ymd(r.from)}T000000Z`,
      `DTSTART;VALUE=DATE:${ymd(r.from)}`,
      `DTEND;VALUE=DATE:${ymd(addDays(r.to, 1))}`,
      `SUMMARY:${esc(`${b.emoji} ${b.name} (${lv.short})`)}`,
      `DESCRIPTION:${esc(`${b.name} ${yearLabel} — לפי לוח החופשות של משרד החינוך. ugabuga.co.il/school-holidays`)}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    ].join('\r\n')
  })
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ugabuga.co.il//school-holidays//HE', 'CALSCALE:GREGORIAN', `X-WR-CALNAME:${esc(`חופשות ${yearLabel} — ${lv.short}`)}`, ...events, 'END:VCALENDAR'].join('\r\n') + '\r\n'
}
