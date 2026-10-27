import { HDate, HebrewCalendar, flags } from '@hebcal/core'
import { civilDate, parseCivilDate } from './parashaCalendar.js'
import { cityLocation, dailyTimes, roundMinute } from './shabbatTimes.js'

// Hanukkah candle lighting per city (Israel calendar, Israel time).
// Weekday nights: hebcal's Chanukah time — nightfall, about 20 minutes after sunset in Israel.
// Friday: before the Shabbat candles, by the city's Shabbat candle time (same rule as /shabbat-times).
// Saturday night: after Shabbat ends (8.5°, rounded up — same as /shabbat-times).
// `hebrewDate` is the Hebrew day the night belongs to ("אור ל…"): the evening of 4.12.2026 is the eve of 25 Kislev.
const NIGHT = /^Chanukah: (\d) Candles?$/

// The next (or current) Hanukkah from `fromIso`: pass a date a week back to keep showing it during the holiday.
export function hanukkahNights(city, fromIso) {
  const start = parseCivilDate(fromIso)
  if (!start) return []
  const events = HebrewCalendar.calendar({ start, end: new Date(start.getFullYear() + 1, start.getMonth() + 2, start.getDate()), il: true, location: cityLocation(city), candlelighting: true, candleLightingMins: city.offset, havdalahDeg: 8.5, useElevation: false, mask: flags.CHANUKAH_CANDLES })
  const nights = []
  for (const e of events) {
    const m = NIGHT.exec(e.getDesc())
    if (!m) continue
    if (!nights.length && m[1] !== '1') continue // start from the first night, even mid-Hanukkah
    const n = Number(m[1]), date = civilDate(e.getDate().greg()), dow = e.getDate().getDay()
    const day = dailyTimes(city, date)
    const kind = dow === 5 ? 'friday' : dow === 6 ? 'saturday' : 'weekday'
    const time = kind === 'friday' ? day.candles : kind === 'saturday' ? day.nightfall : roundMinute(e.eventTime, 'up')
    nights.push({ n, date, dow, kind, hebrewDate: new HDate(e.getDate().greg()).next().renderGematriya(true), sunset: day.sunset, time })
    if (n === 8) break
  }
  return nights
}
