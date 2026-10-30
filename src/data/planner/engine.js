// The timetable planner's engine: given the teacher's classes and weekly timetable, which lesson of the
// year's sequence (./math.js, ./tanakh.js, ./english.js — see ./schema.js) falls on each period.
// A class's lesson number = how many of its periods came before this one on school days since the first
// day of the year (./schoolYear.js), plus the teacher's own shift (skip ahead / repeat).
import { SCHOOL_YEAR, addDays, noSchool } from './schoolYear.js'

export const DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳']
export const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8]
export const GRADE_LETTERS = ['', 'א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ז׳', 'ח׳', 'ט׳', 'י׳', 'י״א', 'י״ב']
export const levelOf = grade => (grade >= 7 ? 'secondary' : 'elementary')
export const emptyPlan = () => ({ classes: [], slots: {}, extraOff: [], shifts: {} })
const slotKey = (day, period) => `${day}-${period}`
export const slotsOf = (plan, classId) => Object.entries(plan.slots).filter(([, id]) => id === classId).map(([k]) => k.split('-').map(Number))

// Lessons of a class before (date, period): its periods on every school day from the start of the year.
export function lessonIndex(plan, cls, iso, period) {
  const mine = slotsOf(plan, cls.id)
  if (!mine.length) return 0
  const off = { level: levelOf(cls.grade), extra: plan.extraOff }
  let n = 0
  for (let d = SCHOOL_YEAR.start; d < iso; d = addDays(d, 1)) {
    if (noSchool(d, off)) continue
    const day = new Date(`${d}T12:00:00`).getDay()
    n += mine.filter(([sd]) => sd === day).length
  }
  const today = new Date(`${iso}T12:00:00`).getDay()
  n += mine.filter(([sd, sp]) => sd === today && sp < period).length
  return Math.max(0, n + (plan.shifts[cls.id] || 0))
}

// The lesson at position `index` of a sequence: its unit, the lesson's number within the unit and the step.
export function lessonAt(seq, index) {
  let left = index
  for (const [u, unit] of seq.units.entries()) {
    if (left < unit.hours) {
      const step = unit.steps[Math.min(unit.steps.length - 1, Math.floor((left * unit.steps.length) / unit.hours))]
      return { unit, unitNumber: u + 1, units: seq.units.length, k: left + 1, step }
    }
    left -= unit.hours
  }
  return null // past the end of the year's sequence: review time
}

// Every period of one week (Sunday iso), day by day: the class and its lesson, or why there's no school.
export function weekPlan(plan, sequences, sunday) {
  return DAYS.map((label, day) => {
    const iso = addDays(sunday, day)
    const periods = PERIODS.map(period => {
      const cls = plan.classes.find(c => c.id === plan.slots[slotKey(day, period)])
      if (!cls) return null
      const why = noSchool(iso, { level: levelOf(cls.grade), extra: plan.extraOff })
      const seq = sequences[`${cls.subject}-${cls.grade}`]
      const index = lessonIndex(plan, cls, iso, period)
      return { period, cls, why, index, lesson: !why && seq ? lessonAt(seq, index) : null, seq }
    }).filter(Boolean)
    return { day, label, iso, periods }
  })
}

// Where a step's link points on the site.
export function linkHref(link, grade) {
  const s = link.slug
  switch (link.type) {
    case 'math-topic': return `/math/grade-${grade}/${s}`
    case 'tanakh-topic': return `/learn/tanakh/${s}`
    case 'parasha': return `/parasha/${s}`
    case 'grammar': return `/learn/english-grammar/${s}`
    case 'vocab': { const [g, unit] = s.split('/'); return `/learn/english/${g}/vocabulary/${unit}` }
    case 'reading': return `/learn/english-reading/${s}`
    case 'unseen': return `/unseen/english/${s}`
    case 'booklet': return `/booklets/${s}`
    default: return null
  }
}
export const LINK_LABELS = { 'math-topic': '🧮 תרגול באתר', 'tanakh-topic': '📖 השיעור באתר', parasha: '📜 פרשת השבוע', grammar: '📘 דקדוק + דף עבודה', vocab: '🔤 אוצר מילים', reading: '📖 קריאה עם מילון', unseen: '📝 אנסין', booklet: '📒 חוברת' }
