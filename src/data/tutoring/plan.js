// Builds a tutoring plan: from the grade, the chosen difficulties and the time a family has, one short session a
// day. Pure, so the plan is the same in the browser, in a shared link and on paper: all of it comes from the URL.
import { skillById } from './skills.js'

export const GRADE_NAMES = ['', 'א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ז׳', 'ח׳']
export const MAX_SKILLS = 3
export const DAYS_OPTIONS = [3, 4, 5]
export const MINUTES_OPTIONS = [10, 15, 20, 30]
const DAY_NAMES = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי']
const REVIEW_TITLE = 'חזרה על השבוע'
const FINAL_TITLE = 'בודקים כמה התקדמנו'

export const DEFAULTS = { grade: 3, skills: [], weeks: 1, days: 4, minutes: 15, base: true, focus: false }
const within = (v, list, fallback) => (list.includes(v) ? v : fallback)

// The plan as a URL query, and back. Anything unknown in a link falls back to a sensible value.
export function encodePlan(o) {
  return new URLSearchParams({ g: o.grade, s: o.skills.join('.'), w: o.weeks, d: o.days, m: o.minutes, b: o.base ? 1 : 0, f: o.focus ? 1 : 0 }).toString()
}
export function decodePlan(query) {
  const q = new URLSearchParams(query)
  const grade = Math.min(8, Math.max(1, Number(q.get('g')) || DEFAULTS.grade))
  const skills = [...new Set((q.get('s') || '').split('.'))].filter(id => {
    const s = skillById(id)
    return s && grade >= s.grades[0] && grade <= s.grades[1]
  }).slice(0, MAX_SKILLS)
  return {
    grade, skills,
    weeks: within(Number(q.get('w')), [1, 4], DEFAULTS.weeks),
    days: within(Number(q.get('d')), DAYS_OPTIONS, DEFAULTS.days),
    minutes: within(Number(q.get('m')), MINUTES_OPTIONS, DEFAULTS.minutes),
    base: q.get('b') !== '0', focus: q.get('f') === '1',
  }
}
export const planKey = o => [o.grade, o.skills.join('.'), o.weeks, o.days, o.minutes, o.base ? 1 : 0, o.focus ? 1 : 0].join('|')

// The ladder for this child. "From the basics" goes back up to two grades; "from class material" keeps to this
// grade and the one before it. Steps with no grade always stay, and a ladder never drops below three steps.
export function ladderFor(skill, grade, base = true) {
  const fits = skill.steps.filter(s => !s.grade || s.grade <= grade)
  const back = base ? 2 : 1
  const near = fits.filter(s => !s.grade || s.grade >= grade - back)
  return near.length >= 3 ? near : fits.slice(-3)
}

const WARMUPS = {
  reading: ['קוראים יחד בקול משהו שהילד אוהב: בדיחה, תיאור של משחק או שורה מספר.', 'משחק מילים: כל אחד אומר מילה שמתחילה באות האחרונה של הקודמת.', 'הילד מספר בשלושה משפטים מה קרה היום.'],
  lashon: ['בוחרים מילה ומחפשים ממנה עוד שלוש מילים מאותה משפחה.', 'כל אחד אומר משפט, והשני מוסיף לו מילה אחת.', 'כותבים על דף מילה אחת שקשה לזכור איך לאיית.'],
  math: ['חמישה תרגילים בעל פה מדברים שהילד כבר יודע, כדי להתחיל בהצלחה.', 'סופרים בקפיצות של 2, של 5 או של 10, קדימה ואחורה.', 'מחפשים מספר בחדר ושואלים עליו שאלה אחת.'],
  english: ['אומרים באנגלית שלושה דברים שרואים עכשיו בחדר.', 'משחק: אתם אומרים מילה בעברית והילד באנגלית, ואחר כך מתחלפים.', 'מקשיבים לשיר קצר באנגלית ומחפשים מילה מוכרת.'],
}
const CLOSERS = ['הילד מספר במשפט אחד מה הוא יודע עכשיו שלא ידע קודם.', 'בוחרים יחד את התרגיל שהכי הצליח ומסמנים אותו בכוכב.', 'מסיימים בתרגיל קל, כדי לסיים בהצלחה.', 'מספרים למישהו בבית מה למדנו היום.']

// How a session's minutes are split, with a short move break when sitting still is hard.
export function sessionParts(minutes, focus) {
  const brk = focus ? (minutes >= 15 ? 2 : 1) : 0
  const left = minutes - brk
  const warm = Math.max(2, Math.round(left * 0.15)), end = Math.max(1, Math.round(left * 0.1))
  const learn = Math.round((left - warm - end) * 0.45)
  return { warm, learn, practice: left - warm - end - learn, end, brk }
}

export function buildPlan(o) {
  const skills = o.skills.map(skillById).filter(Boolean)
  if (!skills.length) return []
  const ladders = skills.map(s => ladderFor(s, o.grade, o.base))
  const total = o.weeks * o.days
  // The last day of a week looks back, unless the week is too short to reach every chosen skill first. A month
  // always ends with a check of how far the child got.
  const reviews = o.days - 1 >= skills.length
  const shape = Array.from({ length: total }, (_, index) => {
    const dayOfWeek = index % o.days
    const final = o.weeks > 1 && index === total - 1
    return { index, week: Math.floor(index / o.days) + 1, day: DAY_NAMES[dayOfWeek], dayNumber: dayOfWeek + 1, final, review: final || (reviews && dayOfWeek === o.days - 1) }
  })
  let turn = 0
  for (const x of shape) x.skillIndex = x.review ? (x.week - 1) % skills.length : turn++ % skills.length
  const lessons = skills.map((_, s) => shape.filter(x => x.skillIndex === s && !x.review).length)
  const done = skills.map(() => 0)
  return shape.map(x => {
    const s = x.skillIndex, ladder = ladders[s]
    const base = { ...x, skill: skills[s], ladder, warmup: pick(WARMUPS[skills[s].area], x.index), closer: pick(CLOSERS, x.index) }
    if (x.review) {
      const reached = (k, n = done[k]) => stepAt(Math.max(0, n - 1), lessons[k], ladders[k].length)
      const at = reached(s)
      // A review mixes the last two steps of the skill; the final check takes the latest step of every skill.
      const sources = x.final ? skills.map((_, k) => ({ skill: skills[k], step: ladders[k][reached(k)] })) : [at - 1, at].filter(i => i >= 0).map(i => ({ skill: skills[s], step: ladder[i] }))
      return { ...base, stepIndex: at, step: ladder[at], title: x.final ? FINAL_TITLE : REVIEW_TITLE, level: 'regular', again: false, sources }
    }
    const j = done[s]++, at = stepAt(j, lessons[s], ladder.length)
    const again = j > 0 && stepAt(j - 1, lessons[s], ladder.length) === at
    return { ...base, stepIndex: at, step: ladder[at], title: ladder[at].title, level: again ? 'regular' : 'easy', again, sources: [{ skill: skills[s], step: ladder[at] }] }
  })
}
const pick = (list, i) => list[i % list.length]
// With fewer lessons than steps the plan stops early rather than rushing; with more, steps get a second day.
const stepAt = (j, lessons, steps) => (lessons >= steps ? Math.floor((j * steps) / lessons) : Math.min(j, steps - 1))

// A session marked "hard" holds its skill back: the next lesson of that skill repeats the step instead of moving on.
export function withMarks(sessions, marks = {}) {
  const held = {}
  return sessions.map(x => {
    const k = x.skillIndex
    const hold = held[k] || 0
    const res = hold && !x.review && x.stepIndex > 0 ? { ...x, stepIndex: Math.max(0, x.stepIndex - hold), again: true, level: 'easy' } : x
    const step = x.ladder[res.stepIndex]
    const out = res === x ? x : { ...res, step, title: step.title, sources: [{ skill: x.skill, step }] }
    if (marks[x.index] === 'hard' && !x.review) held[k] = hold + 1
    else if (marks[x.index] === 'easy' && hold) held[k] = hold - 1
    return out
  })
}

// How many exercises fit into a session's practice part.
export const exerciseCount = (minutes, level) => {
  const n = minutes >= 30 ? 12 : minutes >= 20 ? 8 : minutes >= 15 ? 6 : 4
  return level === 'easy' ? Math.max(4, n - 2) : n
}
