// Writes public/calendar/holidays-week.ics and holidays-month.ics — the holiday reminder feeds
// (see src/utils/holidayCalendar.js). Dates come from the holiday data files the site itself shows.
import { mkdir, writeFile } from 'node:fs/promises'
import { buildReminderIcs } from '../src/utils/holidayCalendar.js'
import { HANUKKAH } from '../src/data/hanukkah.js'
import { TUBISHVAT } from '../src/data/tubishvat.js'
import { PURIM } from '../src/data/purim.js'
import { PESACH } from '../src/data/pesach.js'
import { ATZMAUT } from '../src/data/yomhaatzmaut.js'
import { LAGBAOMER } from '../src/data/lagbaomer.js'
import { SHAVUOT } from '../src/data/shavuot.js'
import { ROSHHASHANA } from '../src/data/roshhashana.js'
import { YOMKIPPUR } from '../src/data/yomkippur.js'
import { SUKKOT } from '../src/data/sukkot.js'
import { SIGD } from '../src/data/sigd.js'
import { RABIN } from '../src/data/rabin.js'

const LIST = [
  ['hanukkah', 'חנוכה', '🕎', HANUKKAH], ['tu-bishvat', 'ט״ו בשבט', '🌳', TUBISHVAT], ['purim', 'פורים', '🎭', PURIM],
  ['pesach', 'פסח', '🍷', PESACH], ['yom-haatzmaut', 'יום העצמאות', '🇮🇱', ATZMAUT], ['lag-baomer', 'ל״ג בעומר', '🔥', LAGBAOMER],
  ['shavuot', 'שבועות', '🧀', SHAVUOT], ['rosh-hashana', 'ראש השנה', '🍎', ROSHHASHANA], ['yom-kippur', 'יום כיפור', '🕊️', YOMKIPPUR, true],
  ['sukkot', 'סוכות', '🌿', SUKKOT], ['sigd', 'חג הסיגד', '⛰️', SIGD], ['rabin', 'יום הזיכרון ליצחק רבין', '🕯️', RABIN, true],
]
export const HOLIDAY_DATES = LIST.flatMap(([slug, name, emoji, info, solemn]) =>
  [info, ...(info.also || [])].map(o => ({ slug, name, emoji, path: `/holidays/${slug}`, start: o.start, datesText: o.datesText || info.datesText, solemn: !!solemn })))

const today = new Date().toISOString().slice(0, 10)
const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
await mkdir(new URL('../public/calendar/', import.meta.url), { recursive: true })
for (const lead of ['week', 'month']) {
  const ics = buildReminderIcs(HOLIDAY_DATES, lead, { today, stamp })
  await writeFile(new URL(`../public/calendar/holidays-${lead}.ics`, import.meta.url), ics)
  console.log(`generate-holiday-calendar: holidays-${lead}.ics — ${(ics.match(/BEGIN:VEVENT/g) || []).length} reminders`)
}

// ── More subscription feeds (src/utils/calendarFeeds.js): Shabbat candle-lighting per city, "this week's sheet" per grade,
// and the school-holiday calendar per level. All written in this same build step.
const { SHABBAT_PLACES } = await import('../src/data/shabbatCities.js')
const { shabbatSeries, formatTime } = await import('../src/utils/shabbatTimes.js')
const { israelToday } = await import('../src/utils/parashaCalendar.js')
const { buildShabbatIcs, buildWeeklyIcs, shabbatFeedPath, weeklyFeedPath, schoolFeedPath } = await import('../src/utils/calendarFeeds.js')
const { WEEKLY_GRADES } = await import('../src/data/weeklySheets.js')
const { SCHOOL_YEAR, HOLIDAYS } = await import('../src/data/schoolHolidays.js')
const { LEVELS, buildIcs } = await import('../src/data/schoolHolidaysLib.js')

const out = path => new URL(`../public${path}`, import.meta.url)
const israel = israelToday()
for (const city of SHABBAT_PLACES) await writeFile(out(shabbatFeedPath(city.slug)), buildShabbatIcs(city, shabbatSeries(city, israel, 53), formatTime, { stamp }))
console.log(`generate-holiday-calendar: shabbat-<city>.ics — ${SHABBAT_PLACES.length} cities x 53 Fridays`)
for (const grade of WEEKLY_GRADES) await writeFile(out(weeklyFeedPath(grade.key)), buildWeeklyIcs(grade, { today: israel, stamp }))
console.log(`generate-holiday-calendar: weekly-<grade>.ics — ${WEEKLY_GRADES.length} grades x 52 Sundays`)
for (const level of LEVELS) await writeFile(out(schoolFeedPath(level.id)), buildIcs(HOLIDAYS, level.id, SCHOOL_YEAR.label))
console.log(`generate-holiday-calendar: school-holidays-<level>.ics — ${LEVELS.length} levels`)
