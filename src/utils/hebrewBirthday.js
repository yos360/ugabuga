// Hebrew birthday + bar/bat mitzvah calculator (/tools/hebrew-birthday).
// Calendar math and the Israel/diaspora Torah-reading schedule come from @hebcal/core;
// birthday rules (Adar in leap years, 30 Cheshvan/Kislev) follow its getBirthdayOrAnniversary.
import { HDate, HebrewCalendar, getSedra, Locale, months } from '@hebcal/core'
import { gematria, HEB_DAYS, HEB_MONTHS } from './hebrewCalendar.js'

export const MIN_YEAR = 1900
export const MAX_YEAR = 2100
export const UPCOMING_COUNT = 5
export const MITZVAH_AGE = { boy: 13, girl: 12 }

const he = s => Locale.gettext(s, 'he-x-nonikud')
// Spelled the way the rest of the site (Intl he-u-ca-hebrew) spells them.
const MONTH_FIX = { 'חשון': 'חשוון', 'סיון': 'סיוון' }

export function monthNameHe(hd) {
  const n = he(hd.getMonthName())
  return MONTH_FIX[n] || n
}

// HDate → "ט״ו בשבט תשפ״ב"
export function hebrewText(hd) {
  return `${gematria(hd.getDate())} ב${monthNameHe(hd)} ${gematria(hd.getFullYear())}`
}

// "2022-01-17" → local Date at noon (avoids DST/timezone edge cases), or null.
export function parseISO(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '')
  if (!m) return null
  const y = +m[1], mo = +m[2], d = +m[3]
  const date = new Date(y, mo - 1, d, 12)
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null
  return date
}

export const toISO = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12)

// "יום שני, 17 בינואר 2022"
export function formatGregHe(d, withWeekday = true) {
  const base = `${d.getDate()} ב${HEB_MONTHS[d.getMonth()]} ${d.getFullYear()}`
  return withWeekday ? `יום ${HEB_DAYS[d.getDay()]}, ${base}` : base
}

// The Hebrew day begins at nightfall, so someone born after sunset gets the next day's Hebrew date.
export function birthHDate(date, afterSunset = false) {
  return new HDate(afterSunset ? addDays(date, 1) : date)
}

// Hebrew birthday of `birth` (HDate) in Hebrew year `hyear`, as an HDate.
export function birthdayIn(birth, hyear) {
  return HebrewCalendar.getBirthdayOrAnniversary(hyear, birth) || null
}

// Torah portion read on a given Shabbat (HDate), Israel or diaspora schedule, in Hebrew.
export function parashaOn(hd, israel = true) {
  const r = getSedra(hd.getFullYear(), israel).lookup(hd)
  const name = r.parsha.map(he).join('־')
  return { name: r.chag ? name : `פרשת ${name}`, chag: !!r.chag }
}

// Edge cases worth explaining for this birth date (codes are rendered by the UI).
export function birthNotes(birth) {
  const m = birth.getMonth(), d = birth.getDate(), leap = HDate.isLeapYear(birth.getFullYear())
  const notes = []
  if (m === months.CHESHVAN && d === 30) notes.push('cheshvan30')
  if (m === months.KISLEV && d === 30) notes.push('kislev30')
  if (m === months.ADAR_I && !leap) notes.push('adarRegular')
  if (m === months.ADAR_I && leap) notes.push(d === 30 ? 'adar1day30' : 'adar1')
  if (m === months.ADAR_II && leap) notes.push('adar2')
  return notes
}

function describe(hd, birth) {
  const g = hd.greg()
  const date = new Date(g.getFullYear(), g.getMonth(), g.getDate(), 12)
  return {
    hyear: hd.getFullYear(),
    hebrew: hebrewText(hd),
    iso: toISO(date),
    greg: formatGregHe(date),
    weekday: HEB_DAYS[date.getDay()],
    eve: formatGregHe(addDays(date, -1)),
    // 30 Cheshvan/Kislev/Adar I moved to the 1st of the next month in a year without that day
    moved: hd.getDate() !== birth.getDate(),
    date,
  }
}

/**
 * Everything the page shows.
 * @param {{ date: string, afterSunset?: boolean, gender?: 'boy'|'girl', today?: string|null }} input
 *   `today` (ISO) anchors the "next birthdays" list; without it the list starts at the first birthday.
 */
export function analyze({ date, afterSunset = false, gender = 'boy', today = null }) {
  const g = parseISO(date)
  if (!g) return { status: 'invalid' }
  if (g.getFullYear() < MIN_YEAR || g.getFullYear() > MAX_YEAR) return { status: 'range' }

  const birth = birthHDate(g, afterSunset)
  const by = birth.getFullYear()
  const result = {
    status: 'ok',
    birth: {
      hebrew: hebrewText(birth),
      day: birth.getDate(),
      month: monthNameHe(birth),
      year: by,
      leapYear: HDate.isLeapYear(by),
      greg: formatGregHe(g),
    },
    notes: birthNotes(birth),
  }

  // Next Hebrew birthdays from `today` (inclusive), or from the first birthday.
  const t = parseISO(today)
  const from = t && t > g ? new HDate(t) : null
  let hy = from ? Math.max(by + 1, from.getFullYear()) : by + 1
  const upcoming = []
  while (upcoming.length < UPCOMING_COUNT && hy <= by + 150) {
    const hd = birthdayIn(birth, hy)
    if (hd && (!from || hd.abs() >= from.abs())) upcoming.push({ ...describe(hd, birth), age: hy - by })
    hy++
  }
  result.upcoming = upcoming

  const age = MITZVAH_AGE[gender] || 13
  const mhd = birthdayIn(birth, by + age)
  const mitzvah = { gender, age, ...describe(mhd, birth) }
  const satOffset = (6 - mitzvah.date.getDay() + 7) % 7
  const sat = addDays(mitzvah.date, satOffset)
  const satHd = new HDate(sat)
  const il = parashaOn(satHd, true), diaspora = parashaOn(satHd, false)
  mitzvah.shabbat = {
    iso: toISO(sat),
    greg: formatGregHe(sat, false),
    hebrew: hebrewText(satHd),
    sameDay: satOffset === 0,
    parasha: il.name,
    chag: il.chag,
    diaspora: diaspora.name,
    differs: il.name !== diaspora.name,
  }
  result.mitzvah = mitzvah
  return result
}
