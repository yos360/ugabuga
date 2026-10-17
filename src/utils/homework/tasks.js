// Homework task types. A task is plain JSON saved with the homework ({ type, ...settings });
// everything a student sees is rebuilt from it, so the whole class gets the same exercises.
import { exercises, newSeed } from '../mathSheets.js'
import { GRADED_READING } from '../../learn/readingGrades.js'
import { DICTATION } from '../../learn/learnData.js'

export const MATH_OPS = [['+', 'חיבור'], ['-', 'חיסור'], ['mix', 'חיבור וחיסור'], ['x', 'כפל (לוח הכפל)'], ['÷', 'חילוק']]
export const MATH_RANGES = [[10, 'עד 10'], [20, 'עד 20'], [100, 'עד 100']]
export const MATH_TABLES = [['mix', 'כל הלוחות'], ...[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => [n, `לוח ${n}`])]
export const MATH_KINDS = [['regular', 'תרגילים רגילים'], ['missing', 'מספר חסר']]

export const TASK_TYPES = {
  math: { emoji: '🔢', label: 'תרגילי חשבון', hint: 'פותרים על המסך, תרגיל אחרי תרגיל' },
  reading: { emoji: '📖', label: 'הבנת הנקרא', hint: 'קטע קריאה עם הקראה בקול ושאלות' },
  dictation: { emoji: '✍️', label: 'הכתבה', hint: 'שומעים מילה וכותבים אותה' },
  questions: { emoji: '❓', label: 'שאלות משלי', hint: 'שאלות אמריקאיות שהמורה כותבת' },
}

export const READING_OPTIONS = GRADED_READING.map(r => ({ slug: r.slug, title: r.title, grade: r.grade, emoji: r.emoji, level: r.level }))
export const DICTATION_LISTS = DICTATION.map(d => ({ id: d.id, title: d.title, grade: d.grade, words: d.words }))

export function newTask(type) {
  if (type === 'math') return { type, op: '+', range: 20, table: 'mix', kind: 'regular', count: 10, seed: newSeed() }
  if (type === 'reading') return { type, slug: READING_OPTIONS[0]?.slug || '' }
  if (type === 'dictation') return { type, listId: DICTATION_LISTS[0]?.id || 'custom', words: [...(DICTATION_LISTS[0]?.words || [])] }
  return { type: 'questions', title: '', items: [{ q: '', options: ['', ''], correct: 0 }] }
}

const OP_NAMES = { '+': 'חיבור', '-': 'חיסור', mix: 'חיבור וחיסור', x: 'כפל', '÷': 'חילוק' }
export function taskTitle(task) {
  if (task.type === 'math') {
    const tableOp = task.op === 'x' || task.op === '÷'
    const scope = tableOp ? (task.table === 'mix' ? 'כל הלוחות' : `לוח ${task.table}`) : `עד ${task.range}`
    return `${OP_NAMES[task.op] || 'חשבון'} ${scope} · ${task.count} תרגילים${task.kind === 'missing' ? ' (מספר חסר)' : ''}`
  }
  if (task.type === 'reading') { const r = readingPassage(task.slug); return r ? `${r.title} (כיתה ${r.grade})` : 'קטע קריאה' }
  if (task.type === 'dictation') return `הכתבה · ${task.words?.length || 0} מילים`
  return task.title?.trim() || `שאלות · ${task.items?.length || 0}`
}

export const readingPassage = slug => GRADED_READING.find(r => r.slug === slug) || null

// Maths exercises as screen items: `parts` reads left to right, with null where the student writes.
export function mathItems(task) {
  const table = task.table === 'mix' ? 'mix' : Number(task.table) || 'mix'
  const list = exercises({ range: Number(task.range) || 20, op: task.op, type: task.kind === 'missing' ? 'missing' : 'regular', count: Math.min(Math.max(Number(task.count) || 10, 3), 40), seed: Number(task.seed) || 1, table })
  return list.map(e => {
    const sign = e.o === 'x' ? '×' : e.o
    const hide = e.hide || 'c'
    const parts = [hide === 'a' ? null : e.a, sign, hide === 'b' ? null : e.b, '=', hide === 'c' ? null : e.c]
    return { parts, answer: e[hide], text: parts.map(p => p === null ? '__' : p).join(' ') }
  })
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
  if (task.type === 'math') return Number(task.count) >= 3 && Number(task.count) <= 40 ? [] : [`${at}: בין 3 ל-40 תרגילים`]
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
