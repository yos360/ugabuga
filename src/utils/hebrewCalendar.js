// Hebrew dates and Israeli holidays for printable calendars, computed with the browser's own
// Hebrew calendar (Intl, 'he-u-ca-hebrew') — no data file to keep up to date, works for any year.

const LETTERS = [[400, 'ת'], [300, 'ש'], [200, 'ר'], [100, 'ק'], [90, 'צ'], [80, 'פ'], [70, 'ע'], [60, 'ס'], [50, 'נ'], [40, 'מ'], [30, 'ל'], [20, 'כ'], [10, 'י'], [9, 'ט'], [8, 'ח'], [7, 'ז'], [6, 'ו'], [5, 'ה'], [4, 'ד'], [3, 'ג'], [2, 'ב'], [1, 'א']]

// 15 → ט״ו, 16 → ט״ז, 5787 → תשפ״ז, 3 → ג׳
export function gematria(n) {
  let rest = n % 1000, out = ''
  while (rest > 0) {
    if (rest === 15) { out += 'טו'; break }
    if (rest === 16) { out += 'טז'; break }
    const [v, l] = LETTERS.find(([v]) => v <= rest)
    out += l; rest -= v
  }
  return out.length === 1 ? out + '׳' : out.slice(0, -1) + '״' + out.slice(-1)
}

let fmt = null
function formatter() {
  if (fmt === null) {
    try { fmt = new Intl.DateTimeFormat('he-u-ca-hebrew', { day: 'numeric', month: 'long', year: 'numeric' }) } catch { fmt = false }
  }
  return fmt
}

// { day: 15, month: 'שבט', year: 5787 } — or null where the Hebrew calendar isn't available.
export function hebrewParts(date) {
  const f = formatter()
  if (!f) return null
  try {
    const parts = f.formatToParts(date)
    const get = t => parts.find(p => p.type === t)?.value
    const day = parseInt(get('day'), 10), year = parseInt(get('year'), 10), month = get('month')
    return Number.isFinite(day) && month ? { day, month, year } : null
  } catch { return null }
}

const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const key = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`

// Map "YYYY-M-D" → holiday name, for every day from `from` to `to` (inclusive).
export function holidayMap(from, to) {
  const map = new Map()
  const put = (d, name) => { if (d >= from && d <= to && !map.has(key(d))) map.set(key(d), name) }
  // Scan a little before the range so multi-day holidays that began earlier still show.
  for (let d = addDays(from, -10); d <= to; d = addDays(d, 1)) {
    const h = hebrewParts(d)
    if (!h) return map
    const { day, month } = h, dow = d.getDay() // 0 = Sunday … 6 = Saturday
    const is = (m, dd) => month === m && day === dd
    if (is('תשרי', 1) || is('תשרי', 2)) put(d, 'ראש השנה')
    if (is('תשרי', 10)) put(d, 'יום כיפור')
    if (is('תשרי', 15)) put(d, 'סוכות')
    if (month === 'תשרי' && day >= 16 && day <= 20) put(d, 'חול המועד')
    if (is('תשרי', 22)) put(d, 'שמחת תורה')
    if (is('כסלו', 25)) for (let i = 0; i < 8; i++) put(addDays(d, i), `חנוכה ${gematria(i + 1)}`)
    if (is('טבת', 10)) put(d, 'עשרה בטבת')
    if (is('שבט', 15)) put(d, 'ט״ו בשבט')
    // Purim is in Adar (or Adar II in a leap year); Shushan Purim the day after.
    if (is('אדר', 14) || is('אדר ב׳', 14)) { put(d, 'פורים'); put(addDays(d, 1), 'שושן פורים') }
    if (is('ניסן', 15)) put(d, 'פסח')
    if (month === 'ניסן' && day >= 16 && day <= 20) put(d, 'חול המועד')
    if (is('ניסן', 21)) put(d, 'שביעי של פסח')
    // Yom HaShoah: 27 Nisan, moved off Friday (→ Thursday) and Sunday (→ Monday).
    if (is('ניסן', 27)) put(dow === 5 ? addDays(d, -1) : dow === 0 ? addDays(d, 1) : d, 'יום השואה')
    // Yom HaAtzmaut: 5 Iyar, moved back from Fri/Sat to Thursday and forward from Monday to Tuesday;
    // Yom HaZikaron is always the day before it.
    if (is('אייר', 5)) {
      const ind = dow === 5 ? addDays(d, -1) : dow === 6 ? addDays(d, -2) : dow === 1 ? addDays(d, 1) : d
      put(addDays(ind, -1), 'יום הזיכרון'); put(ind, 'יום העצמאות')
    }
    if (is('אייר', 18)) put(d, 'ל״ג בעומר')
    if (is('אייר', 28)) put(d, 'יום ירושלים')
    if (is('סיוון', 6)) put(d, 'שבועות')
    // Tisha B'Av moves from Shabbat to Sunday.
    if (is('אב', 9)) put(dow === 6 ? addDays(d, 1) : d, 'תשעה באב')
    if (is('אב', 15)) put(d, 'ט״ו באב')
  }
  return map
}

export const dayKey = key
export const HEB_MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
export const HEB_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
export const HEB_DAY_LETTERS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']
