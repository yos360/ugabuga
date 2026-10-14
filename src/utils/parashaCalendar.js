import { HDate, HebrewCalendar, Locale } from '@hebcal/core'
import { PARASHOT } from '../data/parashot.js'

const stripNikkud = text => text.replace(/[\u0591-\u05bd\u05bf-\u05c7]/g, '')
const pad = n => String(n).padStart(2, '0')
export const civilDate = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
export function israelToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)
  const get = name => parts.find(p => p.type === name).value
  return `${get('year')}-${get('month')}-${get('day')}`
}
export function parseCivilDate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (y < 1900 || y > 2199) return null
  const date = new Date(y, m - 1, d, 12)
  return civilDate(date) === iso ? date : null
}
// The civil week is Sunday–Saturday in Israel. Saturday keeps its morning reading
// until Israeli midnight; this page makes no claims about halachic day boundaries.
export function readingForDate(iso) {
  const date = parseCivilDate(iso)
  if (!date) return null
  date.setDate(date.getDate() + (6 - date.getDay()))
  const hd = new HDate(date)
  const reading = HebrewCalendar.getSedra(hd.getFullYear(), true).lookup(hd)
  const simchatTorah = hd.getMonth() === 7 && hd.getDate() === 22
  const portions = simchatTorah ? [PARASHOT[53]] : reading.chag ? [] : [reading.num].flat().map(n => PARASHOT[n - 1])
  const holidayNames = { 'Rosh Hashana': 'ראש השנה', 'Yom Kippur': 'יום הכיפורים', 'Sukkot': 'סוכות', 'Sukkot Shabbat Chol ha-Moed': 'שבת חול המועד סוכות', 'Pesach Shabbat Chol ha-Moed': 'שבת חול המועד פסח', 'Shmini Atzeret': 'שמיני עצרת ושמחת תורה', 'Pesach': 'פסח', 'Pesach I': 'פסח', 'Pesach VII': 'שביעי של פסח', 'Shavuot': 'שבועות' }
  const holiday = reading.chag ? reading.parsha.map(p => holidayNames[p] || stripNikkud(Locale.gettext(p, 'he'))).join(' – ') : null
  return { date: civilDate(date), hebrewDate: hd.renderGematriya(), portions, holiday, name: holiday || portions.map(p => p.name).join(' – ') }
}
