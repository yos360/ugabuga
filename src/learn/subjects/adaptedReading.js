// Adapted READING-COMPREHENSION exam for grades ב׳–ו׳: one short passage from the subjects' reading
// files (src/learn/subjects/readings/*.js) with its multiple-choice questions, cut to three answers each.
// The same passage is used for the seed, so the exam is deterministic. Pure: callers pass the reading list.
import { adaptQuestion } from './adaptQuestion.js'

export const ADAPTED_READING_GRADES = [2, 3, 4, 5, 6] // the readings start at grade ב׳
const WORD_CAP = { 2: 130, 3: 140, 4: 150, 5: 165, 6: 185 } // prefer passages up to this length
const EXP = 'כדאי לחזור לקטע ולמצוא את המשפט שעונה על השאלה.'

export const wordCount = r => r.text.join(' ').split(/\s+/).filter(Boolean).length

// The passages of a grade that are short enough for an adapted exam (shortest ones if none is).
export function shortReadings(list, grade) {
  const pool = (list || []).filter(r => r.grade === grade && r.q?.length)
  const short = pool.filter(r => wordCount(r) <= (WORD_CAP[grade] || 150))
  return short.length ? short : [...pool].sort((a, b) => wordCount(a) - wordCount(b)).slice(0, 3)
}

// { questions, passage } for the passage chosen by `seed`, or null when the list has none for the grade.
export function adaptedReadingQuestions(list, grade, seed = 1) {
  const pool = shortReadings(list, grade)
  if (!pool.length) return null
  const r = pool[Math.abs(Math.trunc(Number(seed) || 1)) % pool.length]
  const passage = { title: r.title, emoji: r.emoji || '📖', text: r.text }
  const questions = r.q.slice(0, 5).map(([q, options, answer], k) => ({
    ...adaptQuestion({ id: `ar-${r.slug}-${k}`, q, options, answer }),
    passage,
    exp: EXP,
  }))
  return { questions, passage, slug: r.slug }
}
