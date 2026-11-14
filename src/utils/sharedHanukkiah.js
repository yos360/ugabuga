// Pure logic for "החנוכייה המשותפת" (/hanukkiah). No React and no Supabase here, so
// tests/shared-hanukkiah.test.mjs can run it in Node.
//
// Night rule (Israel time), the same one the database uses (hk_night() in
// supabase/migrations/202611150001_shared_hanukkiah.sql): night n runs from 14:00 on its evening's
// date until 14:00 the next day. 14:00 rather than 16:00 because on Fridays the candles are lit
// before the Shabbat candles — as early as 15:54 in Jerusalem — and the page must already show
// tonight's hanukkiah then. Lighting opens with night 1 and closes at 14:00 the day after night 8.
import { HANUKKAH } from '../data/hanukkah.js'
import { israelDayNumber } from './israelDate.js'
import { cleanText, SITE_TAG } from './groupTools.js'
import { hasLink, hasPhone, isInappropriate, FILTER_MESSAGES } from './contentFilter.js'

export const FIRST_NIGHT_DATE = HANUKKAH.firstCandle.slice(0, 10) // '2026-12-04'
export const NIGHT_START_HOUR = 14
export const NIGHTS = 8
export const HK_LIMITS = { title: 60, name: 20, wish: 80 }
export const HK_PATH = '/hanukkiah'

export const HK_KINDS = {
  family: { label: 'משפחה', emoji: '👨‍👩‍👧‍👦', example: 'החנוכייה של משפחת כהן' },
  class: { label: 'כיתה', emoji: '🏫', example: 'החנוכייה של כיתה ג׳2' },
  gan: { label: 'גן', emoji: '🧸', example: 'החנוכייה של גן חצב' },
  friends: { label: 'חברים', emoji: '🤗', example: 'החנוכייה של החבר׳ה מהשכונה' },
}

const ORDINALS = ['הראשון', 'השני', 'השלישי', 'הרביעי', 'החמישי', 'השישי', 'השביעי', 'השמיני']
export const nightName = n => (n >= 1 && n <= NIGHTS ? `הנר ${ORDINALS[n - 1]}` : '')

const partsFmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' })
function israelParts(time) {
  const p = Object.fromEntries(partsFmt.formatToParts(new Date(time)).map(x => [x.type, x.value]))
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) % 24 }
}

// Raw night number at `time`: below 1 before Hanukkah, above 8 after it.
export function nightAt(time = Date.now()) {
  const { date, hour } = israelParts(time)
  const day = israelDayNumber(`${date}T12:00:00Z`) - (hour < NIGHT_START_HOUR ? 1 : 0)
  return day - israelDayNumber(`${FIRST_NIGHT_DATE}T12:00:00Z`) + 1
}

// { phase: 'before' | 'during' | 'after', night (1–8 during, else null), days (before: calendar days to night 1) }
export function hanukkahPhase(time = Date.now()) {
  const n = nightAt(time)
  if (n < 1) return { phase: 'before', night: null, days: israelDayNumber(`${FIRST_NIGHT_DATE}T12:00:00Z`) - israelDayNumber(time) }
  if (n > NIGHTS) return { phase: 'after', night: null, days: 0 }
  return { phase: 'during', night: n, days: 0 }
}

// The civil date (YYYY-MM-DD) on whose evening night n is lit.
export function nightDate(n) {
  const d = new Date(`${FIRST_NIGHT_DATE}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n - 1)
  return d.toISOString().slice(0, 10)
}
const HE_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
export function nightDateLabel(n) {
  const iso = nightDate(n), d = new Date(`${iso}T12:00:00Z`)
  const day = d.getUTCDay() === 6 ? 'מוצאי שבת' : `יום ${HE_DAYS[d.getUTCDay()]}`
  return `${day} ${d.getUTCDate()}.${d.getUTCMonth() + 1}`
}

// A short respectful note for Friday (before Shabbat) and Saturday (after Shabbat) nights.
export function shabbatNote(n) {
  if (!(n >= 1 && n <= NIGHTS)) return ''
  const dow = new Date(`${nightDate(n)}T12:00:00Z`).getUTCDay()
  if (dow === 5) return '🕯️ הערב ערב שבת: נוהגים להדליק את נרות החנוכה לפני הדלקת נרות השבת. החנוכייה של הערב כבר פתוחה, אז אפשר להוסיף את השם עוד לפני כניסת השבת.'
  if (dow === 6) return '✨ הערב מוצאי שבת: מדליקים את נרות החנוכה אחרי צאת השבת. מי ששומר שבת מוזמן להוסיף את השם אחרי ההבדלה.'
  return ''
}

// How tonight's hanukkiah looks: n candle slots (+ the shamash), lit as people join, "+N" beyond that.
export function candleSlots(night, count) {
  const slots = Math.max(1, Math.min(NIGHTS, Number(night) || 1))
  const c = Math.max(0, Number(count) || 0)
  return { slots, lit: Math.min(c, slots), extra: Math.max(0, c - slots) }
}

// "נר אחד" / "3 נרות"
export const candlesLabel = n => (Number(n) === 1 ? 'נר אחד' : `${Number(n) || 0} נרות`)

export function validateCandle({ name, wish }) {
  const n = cleanText(name, HK_LIMITS.name), w = cleanText(wish, HK_LIMITS.wish)
  if (!n) return { ok: false, error: 'כתבו שם פרטי או כינוי.' }
  for (const t of [n, w]) {
    if (hasLink(t)) return { ok: false, error: FILTER_MESSAGES.no_links }
    if (isInappropriate(t)) return { ok: false, error: FILTER_MESSAGES.inappropriate }
    if (hasPhone(t)) return { ok: false, error: FILTER_MESSAGES.no_contact }
  }
  return { ok: true, error: '', name: n, wish: w }
}

export function validateTitle(title) {
  const t = cleanText(title, HK_LIMITS.title)
  if (!t) return { ok: false, error: 'תנו שם לחנוכייה, למשל: החנוכייה של כיתה ג׳2.' }
  if (hasLink(t)) return { ok: false, error: FILTER_MESSAGES.no_links }
  if (isInappropriate(t)) return { ok: false, error: FILTER_MESSAGES.inappropriate }
  return { ok: true, error: '', title: t }
}

// "?wa" marks visits that come from the WhatsApp text (the app sends no referrer), as in the RSVP tool.
export const waLink = link => `${link}?wa`

// The WhatsApp text: changes with the phase so it can be resent every night. Ends with the link and SITE_TAG.
export function shareText({ title, link, time = Date.now(), lit = 0 }) {
  const { phase, night, days } = hanukkahPhase(time)
  const head = `🕎 ${title}`
  let body
  if (phase === 'before') body = [`בחנוכה הזה מדליקים יחד! כל ערב כל אחד מוסיף נר עם השם שלו (ואם בא לו — גם משאלה קטנה).`, days > 1 ? `הנר הראשון בעוד ${days} ימים. שמרו את הקישור 👇` : days === 1 ? 'הנר הראשון מחר בערב. שמרו את הקישור 👇' : 'הנר הראשון הערב. שמרו את הקישור 👇']
  else if (phase === 'during') body = [`הערב ${nightName(night)} של חנוכה ✨`, lit > 0 ? `כבר ${candlesLabel(lit)} דולקים בחנוכייה שלנו — הדליקו גם אתם בלחיצה, בלי הרשמה 👇` : 'מי מדליק ראשון? בלחיצה, בלי הרשמה 👇']
  else body = ['חנוכה הסתיים — תודה שהדלקתם איתנו! כל הנרות של הקבוצה כאן 👇']
  return [head, ...body, waLink(link), SITE_TAG].join('\n')
}
