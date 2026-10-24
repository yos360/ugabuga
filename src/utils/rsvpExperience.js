import { cleanText, normName } from './groupTools.js'

export const RSVP_THEMES = [
  { id: 'party', label: 'חגיגה צבעונית', emoji: '🎈', bg: '#fff0f7', accent: '#a32969', ink: '#52243d' },
  { id: 'garden', label: 'חגיגה בטבע', emoji: '🌿', bg: '#eef6e8', accent: '#396b35', ink: '#29472b' },
  { id: 'sky', label: 'כחול וחלומות', emoji: '✨', bg: '#eaf4ff', accent: '#305c9e', ink: '#233c61' },
  { id: 'elegant', label: 'חגיגי וקלאסי', emoji: '🥂', bg: '#faf2df', accent: '#80622e', ink: '#48391f' },
]
export const rsvpTheme = id => RSVP_THEMES.find(t => t.id === id) || RSVP_THEMES[0]
export const isRsvpV2 = ev => ev?.ui_version === 2
export const RESPONSE_FILTERS = [['all', 'כל התשובות'], ['yes', 'מגיעים'], ['maybe', 'אולי'], ['no', 'לא מגיעים'], ['allergies', 'אלרגיות ורגישויות']]
export function filterResponses(responses, status = 'all', query = '') {
  const term = normName(query)
  return ['yes', 'maybe', 'no'].flatMap(s => responses.filter(r => r.status === s))
    .filter(r => (status === 'all' || (status === 'allergies' ? r.status !== 'no' && cleanText(r.allergies, 200) : r.status === status)) && (!term || normName(r.name).includes(term)))
}
const CSV_HEADERS = ['שם', 'תשובה', 'ילדים', 'מבוגרים', 'אלרגיות', 'מי אוסף', 'הערה']
export function responseCsv(responses, labels, headers = CSV_HEADERS) {
  // Spreadsheet formulas must remain literal text, even when guest input begins with = / + / - / @.
  const cell = v => {
    let text = String(v ?? '')
    if (/^[\s]*[=+@-]/.test(text)) text = "'" + text
    return `"${text.replace(/"/g, '""')}"`
  }
  const rows = [headers, ...responses.map(r => [r.name, labels[r.status].label, r.kids, r.adults, r.allergies, r.pickup, r.note])]
  return '\uFEFF' + rows.map(r => r.map(cell).join(',')).join('\r\n')
}
// Times as written by the organizer: "17:00–19:00", "4:30 pm", "4:00–6:00 pm" (a range shares the
// later am/pm unless that would put the start after the end, as in "11:00–1:00 pm").
export function eventTimes(text) {
  const found = [...String(text || '').matchAll(/(?:^|[^\d:])(\d{1,2})(?::(\d{2}))?(?!\d)(?:\s*([ap])\.?m\b\.?)?/gi)]
    .filter(m => m[2] !== undefined || m[3]).map(m => ({ h: +m[1], min: m[2] === undefined ? 0 : +m[2], ap: m[3]?.toLowerCase() || null }))
  for (let i = found.length - 2; i >= 0; i--) if (!found[i].ap && found[i + 1].ap && found[i].h <= found[i + 1].h && found[i + 1].h <= 12) found[i].ap = found[i + 1].ap
  return found.map(t => ({ ...t, h: t.ap && t.h >= 1 && t.h <= 12 ? (t.h % 12) + (t.ap === 'p' ? 12 : 0) : t.h }))
    .filter(t => t.h < 24 && t.min < 60).map(t => [String(t.h).padStart(2, '0'), String(t.min).padStart(2, '0')])
}
// tz: the event's time zone (Hebrew events: Israel); null = "floating" local time, for the English site.
export function eventCalendar(ev, now = new Date(), { tz = 'Asia/Jerusalem' } = {}) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(ev.date || '') ? ev.date.replaceAll('-', '') : ''
  if (!date) return null
  const times = eventTimes(ev.time).map(([h, m]) => [null, h, m])
  const clock = m => `${m[1]}${m[2]}00`
  const at = tz ? `;TZID=${tz}` : ''
  const esc = v => String(v || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/[;,]/g, m => '\\' + m)
  const nextDay = new Date(`${ev.date}T12:00:00Z`); nextDay.setUTCDate(nextDay.getUTCDate() + 1)
  const tomorrow = nextDay.toISOString().slice(0, 10).replaceAll('-', '')
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Ugabuga//RSVP//HE', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    `UID:${esc(ev.code)}@ugabuga.co.il`, `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    times.length ? `DTSTART${at}:${date}T${clock(times[0])}` : `DTSTART;VALUE=DATE:${date}`,
    times.length > 1 ? `DTEND${at}:${clock(times[1]) <= clock(times[0]) ? tomorrow : date}T${clock(times[1])}` : !times.length ? `DTEND;VALUE=DATE:${tomorrow}` : 'DURATION:PT1H',
    `SUMMARY:${esc(ev.title)}`, `LOCATION:${esc(ev.place)}`, `DESCRIPTION:${esc(ev.note)}`, 'END:VEVENT', 'END:VCALENDAR']
  // RFC 5545: fold UTF-8 lines at 75 octets, without splitting a code point.
  return lines.map(line => {
    let out = '', bytes = 0
    for (const c of line) { const size = new TextEncoder().encode(c).length; if (bytes + size > 75) { out += '\r\n '; bytes = 1 } out += c; bytes += size }
    return out
  }).join('\r\n') + '\r\n'
}
