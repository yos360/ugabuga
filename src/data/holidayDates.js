// One flat list of every holiday date the site knows (the same files scripts/generate-holiday-calendar.mjs
// reads; that script runs on import, so the list is repeated here instead of imported).
// Used by the countdown image (/holidays/countdown) and the yearly poster (/holidays/year-poster).
import { HANUKKAH } from './hanukkah.js'
import { TUBISHVAT } from './tubishvat.js'
import { PURIM } from './purim.js'
import { PESACH } from './pesach.js'
import { ATZMAUT } from './yomhaatzmaut.js'
import { LAGBAOMER } from './lagbaomer.js'
import { SHAVUOT } from './shavuot.js'
import { ROSHHASHANA } from './roshhashana.js'
import { YOMKIPPUR } from './yomkippur.js'
import { SUKKOT } from './sukkot.js'
import { SIGD } from './sigd.js'
import { RABIN } from './rabin.js'

const LIST = [
  ['hanukkah', 'חנוכה', '🕎', HANUKKAH], ['tu-bishvat', 'ט״ו בשבט', '🌳', TUBISHVAT], ['purim', 'פורים', '🎭', PURIM],
  ['pesach', 'פסח', '🍷', PESACH], ['yom-haatzmaut', 'יום העצמאות', '🇮🇱', ATZMAUT], ['lag-baomer', 'ל״ג בעומר', '🔥', LAGBAOMER],
  ['shavuot', 'שבועות', '🧀', SHAVUOT], ['rosh-hashana', 'ראש השנה', '🍎', ROSHHASHANA], ['yom-kippur', 'יום כיפור', '🕊️', YOMKIPPUR, true],
  ['sukkot', 'סוכות', '🌿', SUKKOT], ['sigd', 'חג הסיגד', '⛰️', SIGD], ['rabin', 'יום הזיכרון ליצחק רבין', '🕯️', RABIN, true],
]

const fromData = LIST.flatMap(([slug, name, emoji, info, solemn]) =>
  [info, ...(info.also || [])].map(o => ({ slug, name, emoji, path: `/holidays/${slug}`, start: o.start, datesText: o.datesText || info.datesText, solemn: !!solemn })))

// The data files hold only the next occurrence of Rosh Hashana and Yom Kippur (5788); the two of the
// school year 5787 (Sept 2026) are added here so the yearly poster is complete.
const SCHOOL_YEAR_EXTRA = [
  { slug: 'rosh-hashana', name: 'ראש השנה', emoji: '🍎', path: '/holidays/rosh-hashana', start: '2026-09-11T18:30:00+03:00', datesText: 'ראש השנה תשפ״ז: שבת וראשון, 12–13 בספטמבר 2026 (מתחיל ביום שישי בערב, 11 בספטמבר)', solemn: false },
  { slug: 'yom-kippur', name: 'יום כיפור', emoji: '🕊️', path: '/holidays/yom-kippur', start: '2026-09-20T18:00:00+03:00', datesText: 'יום כיפור תשפ״ז: מתחיל ביום ראשון בערב, 20 בספטמבר 2026, ומסתיים ביום שני בערב, 21 בספטמבר', solemn: true },
]

export const ALL_HOLIDAY_DATES = [...fromData, ...SCHOOL_YEAR_EXTRA].sort((a, b) => a.start.localeCompare(b.start))

// The school year 5787: 1.9.2026 – 31.8.2027, in calendar order.
export const SCHOOL_YEAR_5787 = ALL_HOLIDAY_DATES.filter(h => h.start.slice(0, 10) >= '2026-09-01' && h.start.slice(0, 10) <= '2027-08-31')

const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
// "2027-03-22T18:30..." -> "22 במרץ 2027" (the date as written, no timezone shifts).
export function dateLabel(iso) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return `${d} ב${MONTHS[m - 1]} ${y}`
}

// Whole calendar days from `now` (the visitor's local date) to the holiday's start date.
export function daysTo(iso, now = new Date()) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000)
}

// The first holiday that starts today or later, with the days left (0 = today).
export function nextHoliday(now = new Date()) {
  for (const h of ALL_HOLIDAY_DATES) { const days = daysTo(h.start, now); if (days >= 0) return { ...h, days } }
  return null
}

// "עוד 11 ימים", "עוד יום אחד", "עוד יומיים".
export const daysPhrase = n => n === 1 ? 'עוד יום אחד' : n === 2 ? 'עוד יומיים' : `עוד ${n} ימים`
