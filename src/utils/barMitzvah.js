// Bar/bat mitzvah hub logic (/bar-mitzvah/*): date planner extras, checklist dates,
// speech builder and the celebrant quiz. The Hebrew-date core (Adar I/II, 30 Cheshvan/Kislev,
// after-sunset births) lives in hebrewBirthday.js and is reused as is.
import { HDate, HebrewCalendar, getSedra, Locale, flags } from '@hebcal/core'
import { analyze, parseISO, toISO, formatGregHe, hebrewText } from './hebrewBirthday.js'
import { HEB_DAYS } from './hebrewCalendar.js'
import { PARASHOT, CHECKLIST, MEANINGS } from '../data/barMitzvah.js'

const he = s => Locale.gettext(s, 'he-x-nonikud')
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12)
const DAY = 864e5

/* ------------------------------------------------------------------ dates */

// Shabbatot on/after `iso`, each with the Torah portion (Israel schedule, diaspora noted when different).
// `keys` are hebcal's English portion names, used to look up a theme for the speech.
export function shabbatotFrom(iso, count = 4) {
  const start = parseISO(iso)
  if (!start) return []
  const first = addDays(start, (6 - start.getDay() + 7) % 7)
  const out = []
  for (let i = 0; i < count; i++) {
    const d = addDays(first, i * 7)
    const hd = new HDate(d)
    const il = getSedra(hd.getFullYear(), true).lookup(hd)
    const ds = getSedra(hd.getFullYear(), false).lookup(hd)
    const name = r => r.parsha.map(he).join('־')
    out.push({
      iso: toISO(d),
      greg: formatGregHe(d, false),
      hebrew: hebrewText(hd),
      parasha: il.chag ? name(il) : `פרשת ${name(il)}`,
      chag: !!il.chag,
      keys: il.chag ? [] : il.parsha.slice(),
      diaspora: ds.chag ? name(ds) : `פרשת ${name(ds)}`,
      differs: name(il) !== name(ds),
    })
  }
  return out
}

const SPECIAL = flags.CHAG | flags.ROSH_CHODESH | flags.CHOL_HAMOED | flags.MAJOR_FAST | flags.MINOR_FAST | flags.CHANUKAH_CANDLES
// Mondays and Thursdays on/after `iso` (the Torah is read on them too — another option for an aliyah).
export function torahWeekdays(iso, count = 4) {
  const start = parseISO(iso)
  if (!start) return []
  const out = []
  for (let d = start; out.length < count; d = addDays(d, 1)) {
    if (d.getDay() !== 1 && d.getDay() !== 4) continue
    const hd = new HDate(d)
    const ev = (HebrewCalendar.getHolidaysOnDate(hd, true) || []).filter(e => e.getFlags() & SPECIAL)
    out.push({ iso: toISO(d), greg: formatGregHe(d), hebrew: hebrewText(hd), weekday: HEB_DAYS[d.getDay()], special: ev.length ? ev.map(e => e.render('he-x-nonikud')).join(', ') : '' })
  }
  return out
}

// Common customs for starting to put on tefillin before a bar mitzvah (shown as approximate dates).
export function tefillinDates(iso) {
  const d = parseISO(iso)
  if (!d) return null
  const month = addDays(d, -30)
  const two = new Date(d.getFullYear(), d.getMonth() - 2, d.getDate(), 12)
  return { month: { iso: toISO(month), greg: formatGregHe(month, false) }, twoMonths: { iso: toISO(two), greg: formatGregHe(two, false) } }
}

// Whole days from today until `iso` (negative when it has passed).
export function daysUntil(iso, todayIso) {
  const a = parseISO(todayIso), b = parseISO(iso)
  if (!a || !b) return null
  return Math.round((b - a) / DAY)
}

/** Everything the date page shows. */
export function mitzvahPlan({ date, afterSunset = false, gender = 'boy', today = null, shabbatot = 4 }) {
  const r = analyze({ date, afterSunset, gender, today })
  if (r.status !== 'ok') return r
  const m = r.mitzvah
  return {
    ...r,
    shabbatot: shabbatotFrom(m.iso, shabbatot),
    weekdays: torahWeekdays(m.iso, 4),
    tefillin: gender === 'boy' ? tefillinDates(m.iso) : null,
    daysLeft: today ? daysUntil(m.iso, today) : null,
  }
}

/* -------------------------------------------------------------- checklist */

// Due date of each checklist stage for a given event date: stage.months before (fractional months → weeks/days).
export function stageDate(eventIso, stage) {
  const d = parseISO(eventIso)
  if (!d) return null
  if (stage.days != null) return addDays(d, -stage.days)
  return new Date(d.getFullYear(), d.getMonth() - stage.months, d.getDate(), 12)
}

export function checklistWithDates(eventIso, todayIso = null) {
  const t = parseISO(todayIso)
  return CHECKLIST.map(stage => {
    const due = stageDate(eventIso, stage)
    return { ...stage, due: due ? toISO(due) : null, dueText: due ? formatGregHe(due, false) : null, late: !!(due && t && due < t) }
  })
}

/* ----------------------------------------------------------------- speech */

export const parashaByKey = key => PARASHOT.find(p => p.key === key) || null

const clean = s => String(s || '').trim().replace(/\s+/g, ' ')
// "א, ב, ג" → "א, ב וג" (Hebrew list joining; ו is attached to the last item)
export function heList(items) {
  const xs = items.map(clean).filter(Boolean)
  if (xs.length <= 1) return xs[0] || ''
  return xs.slice(0, -1).join(', ') + ' ו' + xs[xs.length - 1]
}
const sentence = s => { const t = clean(s); return !t ? '' : /[.!?…]$/.test(t) ? t : t + '.' }

/**
 * Builds a speech draft from the celebrant's answers.
 * Returns sections [{ id, title, text }]; empty answers leave their sentences out.
 * `variant` (0/1) switches between two wordings of the opening and closing.
 */
export function buildSpeech(a, variant = 0) {
  const boy = a.gender !== 'girl'
  const g = (m, f) => boy ? m : f
  const name = clean(a.name)
  const shul = a.style !== 'party'
  const event = g('בר המצווה', 'בת המצווה')
  const sections = []

  const v = variant % 2
  const opening = shul
    ? (v === 0
      ? `שבת שלום לכולם! תודה שבאתם לחגוג איתי את ${event} שלי. ${g('אני קצת מתרגש', 'אני קצת מתרגשת')} לעמוד כאן מולכם, אז אם אדבר מהר — זה מההתרגשות.`
      : `משפחה יקרה, חברים וחברות — שבת שלום. הגעתי למצוות, ו${g('אני שמח', 'אני שמחה')} שכל האנשים שהכי חשובים לי נמצאים כאן איתי.`)
    : (v === 0
      ? `ערב טוב לכולם! ${name ? `אני ${name}, ו` : ''}זה הערב של ${event} שלי. הבטחתי לעצמי לדבר קצר — נראה אם אעמוד בזה.`
      : `שלום לכולם ותודה שבאתם! לפני שנחזור לרחבה, יש לי כמה דברים שחשוב לי להגיד.`)
  sections.push({ id: 'opening', title: 'פתיחה', text: opening.replace(/\s+/g, ' ').trim() })

  const p = parashaByKey(a.parasha)
  const idea = clean(a.parashaIdea)
  if (p || idea) {
    const parts = []
    if (p) parts.push(`${event} שלי חלה בשבוע של ${p.title}. ${sentence(p.about)}`)
    if (idea) parts.push(`מה שתפס אותי בפרשה: ${sentence(idea)}`)
    else if (p) parts.push(sentence(p.idea))
    if (clean(a.parashaLink)) parts.push(`${g('אני חושב', 'אני חושבת')} שזה קשור אליי, כי ${sentence(a.parashaLink)}`)
    sections.push({ id: 'parasha', title: shul ? 'דבר תורה' : 'משהו מהפרשה', text: parts.join(' ') })
  }

  const me = []
  const words = clean(a.words)
  if (words) me.push(`אם ${g('הייתי צריך', 'הייתי צריכה')} לתאר את עצמי בכמה מילים, ${g('הייתי בוחר', 'הייתי בוחרת')}: ${words}.`)
  if (clean(a.hobbies)) me.push(`${g('אני הכי אוהב', 'אני הכי אוהבת')} ${sentence(a.hobbies)}`)
  if (clean(a.proud)) me.push(`רגע שאני גאה בו במיוחד: ${sentence(a.proud)}`)
  if (clean(a.funny)) me.push(`ומי שמכיר אותי יודע גם ש${sentence(a.funny)}`)
  if (me.length) sections.push({ id: 'me', title: 'קצת עליי', text: me.join(' ') })

  const meanings = (a.meanings || []).map(id => MEANINGS.find(x => x.id === id)).filter(Boolean)
  const mean = []
  if (meanings.length) mean.push(`בשבילי, להגיע ל${event} זה ${heList(meanings.map(x => g(x.m, x.f)))}.`)
  if (clean(a.project)) mean.push(`לקראת היום הזה עשיתי גם פרויקט: ${sentence(a.project)}`)
  if (mean.length) sections.push({ id: 'meaning', title: `מה ${event} אומרת לי`, text: mean.join(' ') })

  const th = []
  if (clean(a.parents)) th.push(`תודה ל${clean(a.parents)} — על כל מה שאתם עושים בשבילי כל יום, ועל החגיגה הזאת.`)
  if (clean(a.siblings)) th.push(`ל${clean(a.siblings)} — תודה שאתם תמיד שם בשבילי (גם כשאנחנו רבים על השלט).`)
  if (clean(a.grandparents)) th.push(`ל${clean(a.grandparents)} — תודה על האהבה, על הסיפורים ועל זה שאתם כאן היום.`)
  if (clean(a.others)) th.push(`ותודה מיוחדת ל${sentence(a.others)}`)
  if (th.length) th.push('ולכל מי שבא היום — תודה מכל הלב.')
  if (th.length) sections.push({ id: 'thanks', title: 'תודות', text: th.join(' ') })

  const wish = clean(a.wish)
  const closing = v === 0
    ? `${wish ? `${g('אני מאחל', 'אני מאחלת')} לעצמי ${sentence(wish)} ` : ''}תודה שהקשבתם, ${shul ? 'ושבת שלום!' : 'ועכשיו — לרקוד!'}`
    : `${wish ? `בשנים הבאות אני מקווה ${sentence(wish)} ` : ''}תודה רבה לכולם שבאתם לשמוח איתי${shul ? ' — שבת שלום' : ''}!`
  sections.push({ id: 'closing', title: 'סיום', text: closing })

  return sections
}

// Rough reading time: about 110 Hebrew words a minute when speaking slowly in front of guests.
export function readingMinutes(text) {
  const words = String(text || '').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 110))
}

/* ------------------------------------------------------------------- quiz */

// Small deterministic PRNG so "another option" is reproducible in tests.
export function rng(seed) {
  let s = (seed >>> 0) || 1
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
}
const norm = s => clean(s).replace(/[״"'׳]/g, '')

// Picks `n` wrong answers from `pool`, never equal to the correct one (or to each other).
export function pickDistractors(pool, correct, n = 2, seed = 1) {
  const r = rng(seed), c = norm(correct)
  const options = [...new Set(pool.map(clean))].filter(x => x && norm(x) !== c)
  for (let i = options.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [options[i], options[j]] = [options[j], options[i]] }
  return options.slice(0, n)
}

// Numbers ("how many siblings?") get nearby numbers as distractors.
export function numberDistractors(correct, n = 2) {
  const c = parseInt(correct, 10)
  if (!Number.isFinite(c)) return []
  const out = []
  for (const d of [1, -1, 2, 3, -2, 4]) { const x = c + d; if (x >= 0 && !out.includes(x)) out.push(x); if (out.length === n) break }
  return out.map(String)
}

export const fillName = (text, name, boy) => text
  .replace(/\{name\}/g, clean(name) || (boy ? 'חתן השמחה' : 'כלת השמחה'))
  .replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_, m, f) => boy ? m : f)

/**
 * Celebrant quiz → the online quiz payload ({ id, q, options, correct }).
 * items: [{ id, q (template), correct, wrong: [] }]; questions without an answer or without
 * at least one distinct wrong answer are skipped. The correct answer's position is seeded.
 */
export function buildCelebrantQuiz({ name, gender, items }, seed = 7) {
  const boy = gender !== 'girl'
  const r = rng(seed)
  const out = []
  for (const it of items) {
    const correct = clean(it.correct)
    if (!correct) continue
    const wrong = [...new Set((it.wrong || []).map(clean).filter(w => w && norm(w) !== norm(correct)))].slice(0, 3)
    if (!wrong.length) continue
    const options = [...wrong]
    const at = Math.floor(r() * (options.length + 1))
    options.splice(at, 0, correct)
    out.push({ id: it.id, q: fillName(it.q, name, boy), options, correct: at })
  }
  return out
}
