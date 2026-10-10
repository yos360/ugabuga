// Pregnancy due-date calculator (/tools/due-date): pure date math, no storage.
// Dates are "YYYY-MM-DD" strings handled as whole UTC days, so DST and time zones never shift a day.
// Conventions: LMP + 280 days (Naegele), shifted by (cycle − 28) days; conception + 266 days;
// IVF transfer + 266 − embryo age (day-3 → +263, day-5 → +261).

export const PREGNANCY_DAYS = 280
export const MAX_DAYS = 44 * 7 // beyond this the entered date can't be a current pregnancy
export const CYCLE_MIN = 21
export const CYCLE_MAX = 35
export const CYCLE_DEFAULT = 28

export const METHODS = [
  { id: 'lmp', label: 'יום ראשון של הווסת האחרונה', short: 'וסת אחרונה', dateLabel: 'היום הראשון של הווסת האחרונה' },
  { id: 'conception', label: 'תאריך ההתעברות', short: 'התעברות', dateLabel: 'תאריך ההתעברות' },
  { id: 'ivf', label: 'החזרת עובר (IVF)', short: 'החזרת עובר', dateLabel: 'תאריך החזרת העובר' },
]
export const EMBRYO_DAYS = [3, 5]

// Trimesters by completed weeks: 0–13+6, 14–27+6, 28 onward.
export const TRIMESTERS = [
  { n: 1, label: 'שליש ראשון', from: 0, to: 13 },
  { n: 2, label: 'שליש שני', from: 14, to: 27 },
  { n: 3, label: 'שליש שלישי', from: 28, to: 40 },
]

const DAY = 86400000

// "2026-10-10" → whole days since 1970-01-01, or null for anything that isn't a real calendar date.
export function toDayNumber(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || '').trim())
  if (!m) return null
  const y = +m[1], mo = +m[2], d = +m[3]
  const t = Date.UTC(y, mo - 1, d)
  const back = new Date(t)
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) return null
  return Math.round(t / DAY)
}

export function fromDayNumber(n) {
  return new Date(n * DAY).toISOString().slice(0, 10)
}

export const addDays = (iso, n) => { const d = toDayNumber(iso); return d === null ? null : fromDayNumber(d + n) }
export const daysBetween = (fromIso, toIso) => {
  const a = toDayNumber(fromIso), b = toDayNumber(toIso)
  return a === null || b === null ? null : b - a
}

// A local Date (e.g. new Date()) → its calendar day as "YYYY-MM-DD".
export function localISO(date) {
  const p = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`
}

export function clampCycle(cycle) {
  const c = Math.round(Number(cycle))
  if (!Number.isFinite(c)) return CYCLE_DEFAULT
  return Math.min(CYCLE_MAX, Math.max(CYCLE_MIN, c))
}

// Days from the entered date to the estimated due date, per method.
export function offsetDays({ method = 'lmp', cycle = CYCLE_DEFAULT, embryoDay = 5 } = {}) {
  if (method === 'conception') return PREGNANCY_DAYS - 14
  if (method === 'ivf') return PREGNANCY_DAYS - 14 - (embryoDay === 3 ? 3 : 5)
  return PREGNANCY_DAYS + clampCycle(cycle) - CYCLE_DEFAULT
}

export function dueDate({ method = 'lmp', date, cycle, embryoDay } = {}) {
  return addDays(date, offsetDays({ method, cycle, embryoDay }))
}

// Gestational age on `today`, counted back from the due date (= 40+0): { total, weeks, days }.
export function gestationalAge(dueIso, todayIso) {
  const left = daysBetween(todayIso, dueIso)
  if (left === null) return null
  const total = PREGNANCY_DAYS - left
  return { total, weeks: Math.floor(total / 7), days: ((total % 7) + 7) % 7 }
}

export function trimesterOf(weeks) {
  return weeks < 14 ? 1 : weeks < 28 ? 2 : 3
}

// Everything the page shows. status: 'invalid' | 'future' | 'tooOld' | 'ok' (overdue flagged separately).
export function analyze(input, todayIso) {
  const start = toDayNumber(input?.date), today = toDayNumber(todayIso)
  if (start === null) return { status: 'invalid' }
  const due = dueDate(input)
  if (today === null) return { status: 'ok', due } // "today" not known yet (prerender)
  if (start > today) return { status: 'future', due }
  const ga = gestationalAge(due, todayIso)
  if (ga.total > MAX_DAYS) return { status: 'tooOld', due }
  const remaining = PREGNANCY_DAYS - ga.total
  return {
    status: 'ok', due, ga,
    trimester: trimesterOf(ga.weeks),
    remaining: Math.max(0, remaining),
    overdue: remaining < 0 ? -remaining : 0,
    progress: Math.min(100, Math.max(0, Math.round(ga.total / PREGNANCY_DAYS * 1000) / 10)),
  }
}

// Hebrew phrasing helpers
export const HEB_MONTHS_IN = ['בינואר', 'בפברואר', 'במרץ', 'באפריל', 'במאי', 'ביוני', 'ביולי', 'באוגוסט', 'בספטמבר', 'באוקטובר', 'בנובמבר', 'בדצמבר']
export const HEB_WEEKDAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

// "2027-02-05" → "יום שישי, 5 בפברואר 2027"
export function formatDateHe(iso) {
  const n = toDayNumber(iso)
  if (n === null) return ''
  const d = new Date(n * DAY)
  return `יום ${HEB_WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${HEB_MONTHS_IN[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

// { weeks: 12, days: 3 } → "שבוע 12 + 3 ימים"
export function formatGA({ weeks, days }) {
  const d = days === 0 ? '' : days === 1 ? ' + יום אחד' : days === 2 ? ' + יומיים' : ` + ${days} ימים`
  return `שבוע ${weeks}${d}`
}

export function formatDays(n) {
  if (n === 1) return 'יום אחד'
  if (n === 2) return 'יומיים'
  return `${n} ימים`
}
