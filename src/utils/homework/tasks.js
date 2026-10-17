// Homework task types. A task is plain JSON saved with the homework ({ type, ...settings });
// everything a student sees is rebuilt from it, so the whole class gets the same exercises.
import { exercises, newSeed } from '../mathSheets.js'
import { GRADED_READING } from '../../learn/readingGrades.js'
import { DICTATION } from '../../learn/learnData.js'

export const MATH_OPS = [['+', 'חיבור'], ['-', 'חיסור'], ['mix', 'חיבור וחיסור'], ['x', 'כפל (לוח הכפל)'], ['÷', 'חילוק']]
export const MATH_RANGES = [[10, 'עד 10'], [20, 'עד 20'], [100, 'עד 100']]
export const MATH_TABLES = [['mix', 'כל הלוחות'], ...[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => [n, `לוח ${n}`])]
export const MATH_KINDS = [['regular', 'תרגילים רגילים'], ['missing', 'מספר חסר']]
// How the child solves: typing each answer, or one of two games built from the same exercises.
export const MATH_MODES = [['type', '⌨️ כותבים את התשובה'], ['bubbles', '🎈 משחק בלונים: בוחרים את התשובה'], ['match', '🧩 משחק התאמה: מחברים תרגיל לתשובה']]
export const MATCH_MAX = 8

export const TASK_TYPES = {
  math: { emoji: '🔢', label: 'תרגילי חשבון', hint: 'פותרים על המסך — בכתיבה או במשחק' },
  reading: { emoji: '📖', label: 'הבנת הנקרא', hint: 'קטע קריאה עם הקראה בקול ושאלות' },
  dictation: { emoji: '✍️', label: 'הכתבה', hint: 'שומעים מילה וכותבים אותה' },
  questions: { emoji: '❓', label: 'שאלות משלי', hint: 'שאלות אמריקאיות שהמורה כותבת' },
}

export const READING_OPTIONS = GRADED_READING.map(r => ({ slug: r.slug, title: r.title, grade: r.grade, emoji: r.emoji, level: r.level }))
export const DICTATION_LISTS = DICTATION.map(d => ({ id: d.id, title: d.title, grade: d.grade, words: d.words }))

export function newTask(type) {
  if (type === 'math') return { type, op: '+', range: 20, table: 'mix', kind: 'regular', count: 10, mode: 'type', levels: false, seed: newSeed() }
  if (type === 'reading') return { type, slug: READING_OPTIONS[0]?.slug || '' }
  if (type === 'dictation') return { type, listId: DICTATION_LISTS[0]?.id || 'custom', words: [...(DICTATION_LISTS[0]?.words || [])] }
  return { type: 'questions', title: '', items: [{ q: '', options: ['', ''], correct: 0 }] }
}

// What the child's checklist says under a task.
export function taskHint(task) {
  if (task.type === 'math' && task.mode === 'bubbles') return 'בוחרים את התשובה הנכונה מבין הבלונים 🎈'
  if (task.type === 'math' && task.mode === 'match') return 'מחברים כל תרגיל לתשובה שלו 🧩'
  if (task.type === 'math') return 'פותרים על המסך, תרגיל אחרי תרגיל'
  return TASK_TYPES[task.type]?.hint || ''
}

const OP_NAMES = { '+': 'חיבור', '-': 'חיסור', mix: 'חיבור וחיסור', x: 'כפל', '÷': 'חילוק' }
export function taskTitle(task) {
  if (task.type === 'math') {
    const tableOp = task.op === 'x' || task.op === '÷'
    const scope = tableOp ? (task.table === 'mix' ? 'כל הלוחות' : `לוח ${task.table}`) : `עד ${task.range}`
    const game = task.mode === 'bubbles' ? 'משחק בלונים · ' : task.mode === 'match' ? 'משחק התאמה · ' : ''
    return `${game}${OP_NAMES[task.op] || 'חשבון'} ${scope} · ${mathCount(task)} תרגילים${task.kind === 'missing' ? ' (מספר חסר)' : ''}`
  }
  if (task.type === 'reading') { const r = readingPassage(task.slug); return r ? `${r.title} (כיתה ${r.grade})` : 'קטע קריאה' }
  if (task.type === 'dictation') return `הכתבה · ${task.words?.length || 0} מילים`
  return task.title?.trim() || `שאלות · ${task.items?.length || 0}`
}

export const readingPassage = slug => GRADED_READING.find(r => r.slug === slug) || null

// The matching game shows every exercise and answer at once, so it holds at most MATCH_MAX.
export const mathCount = task => Math.min(Math.max(Number(task.count) || 10, 3), task.mode === 'match' ? MATCH_MAX : 40)

// The 🌶️ level the child may pick instead: a bigger range (or every table), and a missing number
// once the range can't grow. Built from the teacher's task, so the class still shares one challenge.
export function challengeTask(task) {
  const tableOp = task.op === 'x' || task.op === '÷'
  const range = Number(task.range) || 20
  const grow = !tableOp && range < 100
  return { ...task, range: grow ? (range < 20 ? 20 : 100) : range, table: tableOp ? 'mix' : task.table,
    kind: grow ? task.kind : 'missing', seed: (Number(task.seed) || 1) + 7919, levels: false }
}
export const levelTask = (task, level) => level === 'hard' ? challengeTask(task) : task

// Maths exercises as screen items: `parts` reads left to right, with null where the student writes.
export function mathItems(task) {
  const table = task.table === 'mix' ? 'mix' : Number(task.table) || 'mix'
  const list = exercises({ range: Number(task.range) || 20, op: task.op, type: task.kind === 'missing' ? 'missing' : 'regular', count: mathCount(task), seed: Number(task.seed) || 1, table })
  return list.map(e => {
    const sign = e.o === 'x' ? '×' : e.o
    const hide = e.hide || 'c'
    const parts = [hide === 'a' ? null : e.a, sign, hide === 'b' ? null : e.b, '=', hide === 'c' ? null : e.c]
    return { parts, answer: e[hide], text: parts.map(p => p === null ? '__' : p).join(' ') }
  })
}

// The matching game's answer column: the answers in an order the whole class shares.
export function matchAnswers(items, seed = 1) {
  let x = (Number(seed) || 1) % 2147483648
  const list = items.map((item, i) => ({ i, value: item.answer }))
  for (let i = list.length - 1; i > 0; i--) { x = (x * 1103515245 + 12345) % 2147483648; const j = Math.floor((x / 2147483648) * (i + 1)); [list[i], list[j]] = [list[j], list[i]] }
  return list
}

// Four balloons per exercise: the answer and three near misses, the same for the whole class.
export function bubbleChoices(item, index, seed = 1) {
  const answer = item.answer
  const near = [1, -1, 2, -2, 10, -10, 3, -3, 5, -5].map(d => answer + d).filter(n => n >= 0 && n !== answer)
  let x = (Number(seed) || 1) * 31 + index * 7
  const pick = () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648 }
  const shuffle = list => { for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(pick() * (i + 1)); [list[i], list[j]] = [list[j], list[i]] } return list }
  return shuffle([answer, ...shuffle([...new Set(near)]).slice(0, 3)])
}

// Dictation compares letters only: no niqqud, spaces, punctuation or geresh.
export const plainWord = word => String(word || '').normalize('NFKC').replace(/[֑-ׇ]/g, '').replace(/[^\p{L}]/gu, '')
export const dictationCorrect = (word, typed) => plainWord(word) !== '' && plainWord(word) === plainWord(typed)

// The students' list: one name per line or comma.
export const parseNames = text => [...new Set(String(text || '').split(/[\n,،]+/).map(n => n.replace(/\s+/g, ' ').trim()).filter(Boolean))].slice(0, 60)
export const parseWords = text => String(text || '').split(/[\n,،]+/).map(w => w.trim()).filter(Boolean).slice(0, 30)

// Problems that stop a teacher from saving, in Hebrew.
export function taskProblems(task, index) {
  const at = `משימה ${index + 1}`
  if (task.type === 'math') {
    if (task.mode === 'match' && (Number(task.count) < 3 || Number(task.count) > MATCH_MAX)) return [`${at}: במשחק ההתאמה בין 3 ל-${MATCH_MAX} תרגילים`]
    return Number(task.count) >= 3 && Number(task.count) <= 40 ? [] : [`${at}: בין 3 ל-40 תרגילים`]
  }
  if (task.type === 'reading') return readingPassage(task.slug) ? [] : [`${at}: בחרו קטע קריאה`]
  if (task.type === 'dictation') return task.words?.length ? [] : [`${at}: הוסיפו לפחות מילה אחת להכתבה`]
  if (task.type === 'questions') {
    if (!task.items?.length) return [`${at}: הוסיפו לפחות שאלה אחת`]
    return task.items.flatMap((item, i) => {
      const options = item.options.filter(o => o.trim())
      if (!item.q.trim()) return [`${at}, שאלה ${i + 1}: חסר נוסח השאלה`]
      if (options.length < 2) return [`${at}, שאלה ${i + 1}: צריך לפחות שתי תשובות`]
      if (!item.options[item.correct]?.trim()) return [`${at}, שאלה ${i + 1}: סמנו את התשובה הנכונה`]
      return []
    })
  }
  return [`${at}: סוג משימה לא מוכר`]
}

// What is saved: questions lose empty answers (and the correct index follows its answer).
export function cleanTask(task) {
  if (task.type !== 'questions') return task
  return { ...task, title: (task.title || '').trim(), items: task.items.map(item => {
    const kept = item.options.map((o, i) => [o.trim(), i]).filter(([o]) => o)
    return { q: item.q.trim(), options: kept.map(([o]) => o), correct: Math.max(0, kept.findIndex(([, i]) => i === item.correct)) }
  }) }
}

// How a task reads in the results table.
export const scoreTone = (score, total) => { const r = total ? score / total : 0; return r >= 0.85 ? 'good' : r >= 0.6 ? 'ok' : 'low' }

// Ready-made homework per grade, for a teacher who wants to start from something and adjust.
const GRADE_PLANS = {
  'א׳': { math: [{ op: '+', range: 10, mode: 'bubbles', count: 10 }, { op: '-', range: 10, count: 8 }], reading: null, dictation: 'short' },
  'ב׳': { math: [{ op: 'mix', range: 20, count: 12 }, { op: '+', range: 20, kind: 'missing', mode: 'match', count: 6 }], reading: 'lion-mouse', dictation: 'tet-tav' },
  'ג׳': { math: [{ op: 'x', table: 'mix', count: 12, levels: true }, { op: 'mix', range: 100, mode: 'bubbles', count: 10 }], reading: 'camel', dictation: 'long' },
  'ד׳': { math: [{ op: 'x', table: 'mix', kind: 'missing', count: 15 }, { op: '÷', table: 'mix', mode: 'match', count: 8 }], reading: 'migrating-birds', dictation: 'months' },
  'ה׳': { math: [{ op: '÷', table: 'mix', count: 15, levels: true }, { op: 'mix', range: 100, kind: 'missing', count: 12 }], reading: 'water-cycle', dictation: null },
  'ו׳': { math: [{ op: 'x', table: 'mix', kind: 'missing', mode: 'bubbles', count: 15 }, { op: '÷', table: 'mix', kind: 'missing', count: 15, levels: true }], reading: 'why-sleep', dictation: null },
}
export const TEMPLATE_GRADES = Object.keys(GRADE_PLANS)

export function gradeTemplate(grade, seed = newSeed()) {
  const plan = GRADE_PLANS[grade]
  if (!plan) return null
  const tasks = plan.math.map((m, i) => ({ ...newTask('math'), ...m, seed: seed + i }))
  if (plan.reading && readingPassage(plan.reading)) tasks.push({ type: 'reading', slug: plan.reading })
  const list = DICTATION_LISTS.find(d => d.id === plan.dictation)
  if (list) tasks.push({ type: 'dictation', listId: list.id, words: [...list.words] })
  return { title: `שיעורי בית לכיתה ${grade}`, tasks }
}
