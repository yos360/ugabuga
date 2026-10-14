import { hebrewParts, gematria } from './hebrewCalendar.js'

export function minutes(text, clock = false) {
  const m = String(text).match(/^(\d{1,5}):([0-5]\d)$/)
  if (!m || (clock && +m[1] > 23)) throw new Error('כתבו שעות ודקות בפורמט שעות:דקות תקין.')
  return +m[1] * 60 + +m[2]
}
export function durationLabel(value) {
  if (!Number.isFinite(value)) throw new Error('משך זמן לא תקין.')
  return `${value < 0 ? '−' : ''}${Math.floor(Math.abs(value) / 60)}:${String(Math.abs(value) % 60).padStart(2, '0')}`
}
export function shiftMinutes(start, end, pause = 0) {
  const a = minutes(start, true), b = minutes(end, true)
  const total = (b - a + 1440) % 1440
  if (!Number.isInteger(pause) || pause < 0 || pause > total) throw new Error('ההפסקה חייבת להיות בדקות, בין אפס לאורך המשמרת.')
  return total - pause
}
export function timesheet(rows, rate = '') {
  const total = rows.reduce((sum, r) => sum + shiftMinutes(r.start, r.end, Number(r.pause)), 0)
  if (rate !== '' && (!Number.isFinite(Number(rate)) || Number(rate) < 0)) throw new Error('תעריף לשעה חייב להיות מספר שאינו שלילי.')
  return { total, pay: rate === '' ? null : total / 60 * Number(rate) }
}
const DAY = 86400000
// UTC is only a stable integer calendar-day representation; no elapsed-hour arithmetic.
export function calendarDay(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || +value.slice(0, 4) < 1000) throw new Error('בחרו תאריך תקין משנת 1000 ואילך.')
  const n = Date.parse(value + 'T00:00:00Z')
  if (!Number.isFinite(n) || new Date(n).toISOString().slice(0, 10) !== value) throw new Error('התאריך אינו תקין.')
  return n / DAY
}
export function addDateDays(value, count) {
  if (!Number.isSafeInteger(count) || Math.abs(count) > 1000000) throw new Error('מספר הימים צריך להיות שלם, עד מיליון בערך מוחלט.')
  const result = new Date((calendarDay(value) + count) * DAY).toISOString().slice(0, 10)
  calendarDay(result)
  return result
}
export function dateDifference(start, end, inclusive = false) {
  const a = calendarDay(start), b = calendarDay(end)
  if (b < a) throw new Error('תאריך הסיום צריך להיות בתאריך ההתחלה או אחריו.')
  const days = b - a + (inclusive ? 1 : 0), effectiveEnd = addDateDays(end, inclusive ? 1 : 0)
  const [y, m, d] = start.split('-').map(Number), [ey, em] = effectiveEnd.split('-').map(Number)
  let months = (ey - y) * 12 + em - m
  const anniversary = count => {
    const year = y + Math.floor((m - 1 + count) / 12), month = (m - 1 + count) % 12 + 1
    const last = new Date(Date.UTC(year, month, 0)).getUTCDate()
    return `${year}-${String(month).padStart(2, '0')}-${String(Math.min(d, last)).padStart(2, '0')}`
  }
  if (calendarDay(anniversary(months)) > calendarDay(effectiveEnd)) months--
  return { days, weeks: Math.floor(days / 7), weekDays: days % 7, months, monthDays: calendarDay(effectiveEnd) - calendarDay(anniversary(months)) }
}
export function jerusalemToday(now = new Date()) { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now) }
export function describeDate(value) {
  calendarDay(value)
  // Noon in Israel is always on the chosen day. Hebrew helper reads local civil fields.
  const localNoon = new Date(value + 'T12:00:00'), h = hebrewParts(localNoon)
  return { weekday: new Intl.DateTimeFormat('he-IL', { weekday: 'long', timeZone: 'Asia/Jerusalem' }).format(new Date(value + 'T10:00:00Z')), hebrew: h ? `${gematria(h.day)} ב${h.month} ${gematria(h.year)}` : 'תאריך עברי אינו זמין בדפדפן זה' }
}
export const CITIES = [
  ['Asia/Jerusalem','ישראל'], ['Europe/London','לונדון'], ['Europe/Paris','פריז'], ['America/New_York','ניו יורק'], ['America/Los_Angeles','לוס אנג׳לס'], ['Asia/Tokyo','טוקיו'], ['Asia/Kolkata','ניו דלהי'], ['Australia/Sydney','סידני'], ['Pacific/Auckland','אוקלנד'], ['Asia/Dubai','דובאי'], ['America/Sao_Paulo','סאו פאולו'], ['Africa/Johannesburg','יוהנסבורג'],
]
export function zoneParts(instant, zone) {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23' }).formatToParts(instant)
  const get = type => p.find(x => x.type === type).value
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` }
}
export function zoneOffset(instant, zone) {
  const p = zoneParts(instant, zone)
  return (Date.parse(`${p.date}T${p.time}:00Z`) - Math.floor(+instant / 60000) * 60000) / 60000
}
export function israelInstants(date, time) {
  calendarDay(date); minutes(time, true)
  const wall = Date.parse(`${date}T${time}:00Z`), results=[]
  // Israel uses +02 or +03; validate against Intl to catch gaps and repeated hours.
  for (const offset of [180, 120]) {
    const instant = new Date(wall - offset * 60000), p = zoneParts(instant, 'Asia/Jerusalem')
    if (p.date === date && p.time === time) results.push(instant)
  }
  return results
}
export function countText(text) {
  const value = String(text), normalized = value.normalize('NFC')
  const words = normalized.match(/[\p{L}\p{N}][\p{L}\p{N}\p{M}]*(?:['’׳״"][\p{L}\p{N}][\p{L}\p{N}\p{M}]*)*/gu) || []
  const characters = [...normalized.replace(/\p{M}/gu, '')].length
  const withoutSpaces = [...normalized.replace(/[\p{M}\s]/gu, '')].length
  const sentences = (normalized.match(/[^.!?。！？]+[.!?。！？]*/gu) || []).filter(s => /[\p{L}\p{N}]/u.test(s)).length
  const paragraphs = normalized.split(/\n\s*\n/).filter(s => s.trim()).length
  return { words: words.length, characters, withoutSpaces, sentences, paragraphs, readingMinutes: words.length ? Math.ceil(words.length / 200) : 0 }
}
