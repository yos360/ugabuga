// Holiday reminder calendars (owner's idea, 23.11.2026): a visitor subscribes once and their own
// calendar shows "a week / a month until <holiday>" with a link back to the holiday page, every year.
// The feeds are static files (public/calendar/holidays-<lead>.ics) written at build time by
// scripts/generate-holiday-calendar.mjs; calendars re-fetch them, so new dates arrive by themselves.
export const REMINDER_LEADS = { week: 7, month: 30 }
export const CALENDAR_HOST = 'ugabuga.co.il'
export const calendarPath = lead => `/calendar/holidays-${lead}.ics`

// "2027-03-22T18:30:00+02:00" → "2027-03-22" (the local date as written), minus n days.
export function shiftDate(isoDate, days) {
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d) - days * 86400000)
  return t.toISOString().slice(0, 10)
}

export const esc = t => String(t).replace(/[\\;,]/g, m => '\\' + m).replace(/\n/g, '\\n')
const ymd = s => s.replaceAll('-', '')
// Lines longer than 75 octets are folded (RFC 5545); Hebrew is 2 bytes a letter, so fold by bytes.
export function fold(line) {
  const out = []
  let cur = '', bytes = 0
  for (const ch of line) {
    const b = new TextEncoder().encode(ch).length
    if (bytes + b > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0 }
    cur += ch; bytes += b
  }
  out.push(cur)
  return out.join('\r\n ')
}

// holidays: [{ slug, name, emoji, path, start, datesText, solemn? }]; lead: 'week' | 'month'.
// Only reminders on or after `today` are written (a past reminder is noise).
export function buildReminderIcs(holidays, lead, { today = new Date().toISOString().slice(0, 10), stamp = '20261123T000000Z' } = {}) {
  const days = REMINDER_LEADS[lead]
  if (!days) throw new Error(`unknown lead ${lead}`)
  const when = lead === 'week' ? 'עוד שבוע' : 'עוד חודש'
  const events = holidays
    .map(h => ({ ...h, on: shiftDate(h.start, days) }))
    .filter(h => h.on >= today)
    .sort((a, b) => a.on.localeCompare(b.on))
    .map(h => {
      const url = `https://${CALENDAR_HOST}${h.path}?utm_source=calendar&utm_medium=reminder&utm_campaign=${lead}`
      const what = h.solemn ? 'חומרים לכיתה ולבית' : 'דפי צביעה, חוברות ופעילויות להדפסה'
      return [
        'BEGIN:VEVENT',
        `UID:${h.slug}-${ymd(h.start.slice(0, 10))}-${lead}@${CALENDAR_HOST}`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${ymd(h.on)}`,
        `DTEND;VALUE=DATE:${ymd(shiftDate(h.on, -1))}`,
        `SUMMARY:${esc(`${h.emoji} ${when} ${h.name} — עוגה בוגה`)}`,
        `DESCRIPTION:${esc(`${h.datesText}\n${what} בחינם: ${url}`)}`,
        `URL:${url}`,
        'TRANSP:TRANSPARENT',
        'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(`${when} ${h.name}`)}`, 'TRIGGER:PT9H', 'END:VALARM',
        'END:VEVENT',
      ].map(fold).join('\r\n')
    })
  const name = `עוגה בוגה — תזכורת לחגים (${lead === 'week' ? 'שבוע' : 'חודש'} לפני)`
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ugabuga.co.il//holiday-reminders//HE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    fold(`X-WR-CALNAME:${esc(name)}`), 'X-WR-TIMEZONE:Asia/Jerusalem', 'REFRESH-INTERVAL;VALUE=DURATION:P1W', 'X-PUBLISHED-TTL:P1W',
    ...events, 'END:VCALENDAR',
  ].join('\r\n') + '\r\n'
}

// "Next year's birthday, straight to the calendar": an all-day reminder 30 days before the same date next year.
// Only the event date is used; no names or guest data ever go into the link or the file.
export function nextYearReminderDate(isoDate, days = 30) {
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number)
  // Feb 29 has no twin next year: use Feb 28 (the day before March 1), never March 1.
  const leapless = m === 2 && d === 29 && !(((y + 1) % 4 === 0 && (y + 1) % 100 !== 0) || (y + 1) % 400 === 0)
  const next = `${y + 1}-${String(m).padStart(2, '0')}-${String(leapless ? 28 : d).padStart(2, '0')}`
  return shiftDate(next, days)
}
export const BDAY_TITLE = '🎂 עוד חודש יום ההולדת — הזמנה בעוגה בוגה'
export const BDAY_URL = `https://${CALENDAR_HOST}/rsvp?utm_source=calendar&utm_medium=reminder&utm_campaign=birthday`
const BDAY_DETAILS = `זה הזמן להכין הזמנה ליום ההולדת: ${BDAY_URL}`

export function birthdayGoogleUrl(isoDate) {
  const on = nextYearReminderDate(isoDate)
  const q = new URLSearchParams({ action: 'TEMPLATE', text: BDAY_TITLE, dates: `${ymd(on)}/${ymd(shiftDate(on, -1))}`, details: BDAY_DETAILS })
  return `https://calendar.google.com/calendar/render?${q}`
}

export function birthdayIcs(isoDate, { stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z' } = {}) {
  const on = nextYearReminderDate(isoDate)
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ugabuga.co.il//birthday-reminder//HE', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT', `UID:birthday-${ymd(on)}-${stamp}@${CALENDAR_HOST}`, `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${ymd(on)}`, `DTEND;VALUE=DATE:${ymd(shiftDate(on, -1))}`,
    `SUMMARY:${esc(BDAY_TITLE)}`, `DESCRIPTION:${esc(BDAY_DETAILS)}`, `URL:${BDAY_URL}`, 'TRANSP:TRANSPARENT',
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc('עוד חודש יום ההולדת')}`, 'TRIGGER:PT9H', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].map(fold).join('\r\n') + '\r\n'
}

// A birthday event: the adult-birthday template, or a title that says "יום הולדת" (class/vaad templates excluded).
export function isBirthdayEvent(ev) {
  if (!ev || !ev.date) return false
  if (ev.extras?.type === 'adult-birthday') return true
  if (ev.extras?.type) return false
  return /הולדת|birthday/i.test(ev.title || '')
}
