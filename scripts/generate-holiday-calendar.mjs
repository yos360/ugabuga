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
