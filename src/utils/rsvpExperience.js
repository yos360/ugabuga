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
export function responseCsv(responses, labels) {
  // Spreadsheet formulas must remain literal text, even when guest input begins with = / + / - / @.
  const cell = v => {
    let text = String(v ?? '')
    if (/^[\s]*[=+@-]/.test(text)) text = "'" + text
    return `"${text.replace(/"/g, '""')}"`
  }
  const rows = [['שם', 'תשובה', 'ילדים', 'מבוגרים', 'אלרגיות', 'מי אוסף', 'הערה'], ...responses.map(r => [r.name, labels[r.status].label, r.kids, r.adults, r.allergies, r.pickup, r.note])]
  return '\uFEFF' + rows.map(r => r.map(cell).join(',')).join('\r\n')
}
export function eventCalendar(ev, now = new Date()) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(ev.date || '') ? ev.date.replaceAll('-', '') : ''
  if (!date) return null
  const times = [...String(ev.time || '').matchAll(/(?:^|[^\d])(\d{1,2}):(\d{2})(?!\d)/g)].filter(m => +m[1] < 24 && +m[2] < 60)
  const clock = m => `${m[1].padStart(2, '0')}${m[2]}00`
  const esc = v => String(v || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/[;,]/g, m => '\\' + m)
  const nextDay = new Date(`${ev.date}T12:00:00Z`); nextDay.setUTCDate(nextDay.getUTCDate() + 1)
  const tomorrow = nextDay.toISOString().slice(0, 10).replaceAll('-', '')
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Ugabuga//RSVP//HE', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
    `UID:${esc(ev.code)}@ugabuga.co.il`, `DTSTAMP:${now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    times.length ? `DTSTART;TZID=Asia/Jerusalem:${date}T${clock(times[0])}` : `DTSTART;VALUE=DATE:${date}`,
    times.length > 1 ? `DTEND;TZID=Asia/Jerusalem:${clock(times[1]) <= clock(times[0]) ? tomorrow : date}T${clock(times[1])}` : !times.length ? `DTEND;VALUE=DATE:${tomorrow}` : 'DURATION:PT1H',
    `SUMMARY:${esc(ev.title)}`, `LOCATION:${esc(ev.place)}`, `DESCRIPTION:${esc(ev.note)}`, 'END:VEVENT', 'END:VCALENDAR']
  // RFC 5545: fold UTF-8 lines at 75 octets, without splitting a code point.
  return lines.map(line => {
    let out = '', bytes = 0
    for (const c of line) { const size = new TextEncoder().encode(c).length; if (bytes + size > 75) { out += '\r\n '; bytes = 1 } out += c; bytes += size }
    return out
  }).join('\r\n') + '\r\n'
}
