import { HebrewCalendar, HDate, Location, Zmanim, flags } from '@hebcal/core'
import { civilDate, parseCivilDate, readingForDate } from './parashaCalendar.js'

export const SHABBAT_NOTICE = 'הזמנים מחושבים לפי מיקום העיר ומנהגה. לשאלות הלכה ומנהג מקומי — התייעצו עם רב הקהילה.'
const MINUTE = 60000
const clock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
export const roundMinute = (date, direction) => new Date((direction === 'up' ? Math.ceil : Math.floor)(date.getTime() / MINUTE) * MINUTE)
export const formatTime = date => clock.format(date)
export const addDays = (iso, count) => { const date = parseCivilDate(iso); if (!date) return null; date.setDate(date.getDate() + count); return civilDate(date) }
export const cityLocation = city => new Location(city.latitude, city.longitude, true, 'Asia/Jerusalem', city.name, 'IL', city.geonameId, 0)
const zmanim = (city, iso) => new Zmanim(cityLocation(city), parseCivilDate(iso), false)
const chagOn = iso => (HebrewCalendar.getHolidaysOnDate(new HDate(parseCivilDate(iso)), true) || []).find(e => e.getFlags() & flags.CHAG)
const chagName = event => event?.render('he-x-NoNikud').replace('שמיני עצרת', 'שמיני עצרת ושמחת תורה')

// TimedEvent rounds to nearest minute. Use unrounded Zmanim instants instead
// so candles always floor and nightfall always ceil, as the task requires.
export function dailyTimes(city, iso) {
  if (!parseCivilDate(iso)) return null
  const z = zmanim(city, iso), sunset = z.sunset()
  return { sunset, candles: roundMinute(new Date(sunset.getTime() - city.offset * MINUTE), 'down'), nightfall: roundMinute(z.tzeit(8.5), 'up') }
}

export function shabbatForDate(city, iso) {
  const reading = readingForDate(iso)
  if (!reading) return null
  const saturday = reading.date, friday = addDays(saturday, -1)
  const start = dailyTimes(city, friday), end = dailyTimes(city, saturday)
  const fridayHoliday = chagOn(friday), nextHoliday = chagOn(addDays(saturday, 1))
  return {
    friday, saturday, hebrewDate: reading.hebrewDate, reading,
    candles: start.candles, end: end.nightfall, sunset: start.sunset,
    candleNote: fridayHoliday ? 'הדלקה מאש קיימת לפני הזמן המוצג, משום שיום שישי הוא חג.' : '',
    endNote: nextHoliday ? `בצאת השבת נכנס ${chagName(nextHoliday)}; איסור מלאכה נמשך בחג. הדלקת נרות מאש קיימת רק מהזמן המוצג ואילך.` : '',
  }
}

export function shabbatSeries(city, iso, count = 9) {
  const first = shabbatForDate(city, iso)
  return first ? Array.from({ length: count }, (_, i) => shabbatForDate(city, addDays(first.saturday, i * 7))) : []
}

export function holidayCandles(city, start, end) {
  if (!parseCivilDate(start) || !parseCivilDate(end) || end < start) return []
  const events = HebrewCalendar.calendar({ start: parseCivilDate(start), end: parseCivilDate(end), il: true, location: cityLocation(city), candlelighting: true, candleLightingMins: city.offset, havdalahDeg: 8.5, useElevation: false })
  return events.filter(e => e.getDesc() === 'Candle lighting').flatMap(event => {
    const date = civilDate(event.getDate().greg()), next = addDays(date, 1), holiday = chagOn(next)
    if (!holiday) return [] // Exclude ordinary Fridays and Chanukah candles.
    const dow = event.getDate().getDay()
    const afterNightfall = dow !== 5 && (dow === 6 || Boolean(event.getFlags() & flags.LIGHT_CANDLES_TZEIS))
    const times = dailyTimes(city, date)
    return [{ date, holiday: chagName(holiday), time: afterNightfall ? times.nightfall : times.candles, afterNightfall,
      instruction: afterNightfall ? 'מהזמן המוצג ואילך, מאש קיימת בלבד' : chagOn(date) ? 'לפני הזמן המוצג, מאש קיימת בלבד' : 'עד הזמן המוצג, לפני השקיעה',
    }]
  })
}

export function monthlySheet(city, month) {
  if (!/^\d{4}-\d{2}$/.test(month) || month < '2000-01' || month > '2099-12' || !parseCivilDate(`${month}-01`)) return null
  const start = `${month}-01`, dt = parseCivilDate(start)
  const end = civilDate(new Date(dt.getFullYear(), dt.getMonth() + 1, 0, 12))
  const shabbatot = shabbatSeries(city, start, 5).filter(s => s.saturday <= end)
  return { start, end, shabbatot, holidays: holidayCandles(city, start, end) }
}
