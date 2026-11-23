// Subscription calendar feeds written at build time by scripts/generate-holiday-calendar.mjs (owner's idea, 23.11.2026):
//   public/calendar/shabbat-<city>.ics           candle-lighting every Friday for the next year, per city
//   public/calendar/weekly-<grade>.ics           "this week's sheet" every Sunday 07:00, per grade (gan, grade-1..grade-6)
//   public/calendar/school-holidays-<level>.ics  the Ministry of Education break calendar, per level
// Calendars re-fetch the files (REFRESH-INTERVAL), so new dates and rotated sheets arrive by themselves.
// Nothing here collects anything: a feed is a public static file.
export const FEED_HOST = 'ugabuga.co.il'
export const TZ = 'Asia/Jerusalem'
export const shabbatFeedPath = slug => `/calendar/shabbat-${slug}.ics`
export const weeklyFeedPath = key => `/calendar/weekly-${key}.ics`
export const schoolFeedPath = level => `/calendar/school-holidays-${level}.ics`

export const esc = t => String(t).replace(/[\\;,]/g, m => '\\' + m).replace(/\n/g, '\\n')
const enc = new TextEncoder()
// RFC 5545: lines longer than 75 octets are folded; Hebrew is 2 bytes a letter, so fold by bytes.
export function fold(line) {
  const out = []
  let cur = '', bytes = 0
  for (const ch of line) {
    const b = enc.encode(ch).length
    if (bytes + b > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0 }
    cur += ch; bytes += b
  }
  out.push(cur)
  return out.join('\r\n ')
}
export const ymd = s => s.replaceAll('-', '')
export const hm = t => t.replace(':', '') + '00'
export const nowStamp = () => new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
const utm = campaign => `utm_source=calendar&utm_medium=reminder&utm_campaign=${campaign}`
// Adds the utm query before any #hash.
export function withUtm(path, campaign) {
  const [p, hash] = path.split('#')
  return `https://${FEED_HOST}${p}${p.includes('?') ? '&' : '?'}${utm(campaign)}${hash ? '#' + hash : ''}`
}

// Israel's DST rules (Friday before the last Sunday of March -> last Sunday of October), as Google/Apple publish them.
const VTIMEZONE = [
  'BEGIN:VTIMEZONE', `TZID:${TZ}`,
  'BEGIN:DAYLIGHT', 'TZOFFSETFROM:+0200', 'TZOFFSETTO:+0300', 'TZNAME:IDT', 'DTSTART:19700327T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=FR;BYMONTHDAY=23,24,25,26,27,28,29', 'END:DAYLIGHT',
  'BEGIN:STANDARD', 'TZOFFSETFROM:+0300', 'TZOFFSETTO:+0200', 'TZNAME:IST', 'DTSTART:19701025T020000', 'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU', 'END:STANDARD',
  'END:VTIMEZONE',
]

function wrap(prodId, name, events) {
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//ugabuga.co.il//${prodId}//HE`, 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    fold(`X-WR-CALNAME:${esc(name)}`), `X-WR-TIMEZONE:${TZ}`, 'REFRESH-INTERVAL;VALUE=DURATION:P1W', 'X-PUBLISHED-TTL:P1W',
    ...VTIMEZONE, ...events, 'END:VCALENDAR',
  ].join('\r\n') + '\r\n'
}
const event = lines => lines.map(fold).join('\r\n')
const alarm = (text, trigger) => ['BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(text)}`, `TRIGGER:${trigger}`, 'END:VALARM']

// rows: shabbatSeries(city, today, n) results: { friday, saturday, candles: Date, end: Date, reading, candleNote };
// time(date) gives 'HH:MM' in Israel time (formatTime from shabbatTimes.js).
export function buildShabbatIcs(city, rows, time, { stamp = nowStamp() } = {}) {
  const events = rows.map(s => {
    const t = time(s.candles), url = withUtm(`/shabbat-times/${city.slug}`, 'shabbat')
    const reading = s.reading.holiday ? `קריאת השבת לחג: ${s.reading.name}` : `פרשת ${s.reading.name}`
    return event([
      'BEGIN:VEVENT', `UID:shabbat-${city.slug}-${ymd(s.friday)}@${FEED_HOST}`, `DTSTAMP:${stamp}`,
      `DTSTART;TZID=${TZ}:${ymd(s.friday)}T${hm(t)}`, 'DURATION:PT15M',
      `SUMMARY:${esc(`🕯️ כניסת שבת ${t} · ${city.name}`)}`,
      `DESCRIPTION:${esc(`${reading}\nצאת השבת: ${time(s.end)}\n${s.candleNote ? s.candleNote + '\n' : ''}זמני שבת ב${city.name}: ${url}`)}`,
      `URL:${url}`, 'TRANSP:TRANSPARENT',
      ...alarm(`כניסת שבת ב${city.name} בעוד שעה (${t})`, '-PT1H'),
      'END:VEVENT',
    ])
  })
  return wrap('shabbat-times', `כניסת שבת · ${city.name} — עוגה בוגה`, events)
}

// grade: { key, name, hub, links: [[label, path], ...] }. One event each Sunday 07:00 from `today` on, for `weeks`
// weeks; the linked page rotates through grade.links by week number (stable for a given date).
export const weekIndex = iso => { const [y, m, d] = iso.split('-').map(Number); return Math.floor(Date.UTC(y, m - 1, d) / 86400000 / 7) }
export function sundaysFrom(today, weeks) {
  const [y, m, d] = today.split('-').map(Number), start = Date.UTC(y, m - 1, d), dow = new Date(start).getUTCDay()
  const first = start + ((7 - dow) % 7) * 86400000
  return Array.from({ length: weeks }, (_, i) => new Date(first + i * 7 * 86400000).toISOString().slice(0, 10))
}
export function buildWeeklyIcs(grade, { today = new Date().toISOString().slice(0, 10), weeks = 52, stamp = nowStamp() } = {}) {
  const events = sundaysFrom(today, weeks).map(day => {
    const [label, path] = grade.links[weekIndex(day) % grade.links.length]
    const url = withUtm(path, 'weekly'), hub = withUtm(grade.hub, 'weekly')
    return event([
      'BEGIN:VEVENT', `UID:weekly-${grade.key}-${ymd(day)}@${FEED_HOST}`, `DTSTAMP:${stamp}`,
      `DTSTART;TZID=${TZ}:${ymd(day)}T070000`, 'DURATION:PT15M',
      `SUMMARY:${esc(`📒 דף השבוע ל${grade.name}`)}`,
      `DESCRIPTION:${esc(`השבוע: ${label}\n${url}\nכל החומרים ל${grade.name}: ${hub}`)}`,
      `URL:${url}`, 'TRANSP:TRANSPARENT',
      ...alarm(`דף השבוע ל${grade.name}: ${label}`, 'PT0S'),
      'END:VEVENT',
    ])
  })
  return wrap('weekly-sheet', `דף השבוע ל${grade.name} — עוגה בוגה`, events)
}
