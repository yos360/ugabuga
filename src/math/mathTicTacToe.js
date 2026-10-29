// Math tic-tac-toe for the classroom (/classroom/math-tic-tac-toe): pure logic only.
// Board = flat array of 9 cells (0 empty, 1 = X team, 2 = O team), same layout as the arcade game.
import { LINES, result } from '../arcade/logic/ticTacToe.js'

export const TOPICS = [
  { id: 'add', label: 'חיבור', emoji: '➕' },
  { id: 'sub', label: 'חיסור', emoji: '➖' },
  { id: 'mul', label: 'לוח הכפל', emoji: '✖️' },
  { id: 'mix', label: 'מעורב', emoji: '🎲' },
]
export const GRADES = [
  { n: 1, label: 'א׳', hint: 'עד 20' },
  { n: 2, label: 'ב׳', hint: 'עד 100' },
  { n: 3, label: 'ג׳', hint: 'עד 1,000' },
  { n: 4, label: 'ד׳', hint: 'עד 10,000' },
]

const int = (rand, lo, hi) => lo + Math.floor(rand() * (hi - lo + 1))
// Largest result for + and − per grade (subtraction never goes below zero).
const MAX = { 1: 20, 2: 100, 3: 1000, 4: 10000 }

function addition(grade, rand) {
  const max = MAX[grade], lo = grade === 1 ? 1 : max / 20
  const sum = int(rand, Math.max(2, lo * 2), max)
  const a = int(rand, Math.max(1, Math.floor(lo)), sum - Math.max(1, Math.floor(lo)))
  return { a, b: sum - a, op: '+', answer: sum }
}

function subtraction(grade, rand) {
  const { a: b, b: answer, answer: a } = addition(grade, rand)
  return { a, b, op: '−', answer }
}

// Grade 1: doubling and the 5/10 tables up to ×5; grade 2: tables 1–5 and 10; grade 3: the full 10×10;
// grade 4: the full table or a two-digit number times a one-digit number.
function multiplication(grade, rand) {
  let a, b
  if (grade === 1) { a = [2, 5, 10][int(rand, 0, 2)]; b = int(rand, 1, 5) }
  else if (grade === 2) { a = [1, 2, 3, 4, 5, 10][int(rand, 0, 5)]; b = int(rand, 1, 10) }
  else if (grade === 3 || rand() < 0.5) { a = int(rand, 2, 10); b = int(rand, 2, 10) }
  else { a = int(rand, 11, 30); b = int(rand, 2, 9) }
  if (rand() < 0.5) [a, b] = [b, a]
  return { a, b, op: '×', answer: a * b }
}

const MAKERS = { add: addition, sub: subtraction, mul: multiplication }

// One exercise: { a, b, op, answer, text } — text is written left-to-right ("7 + 5").
export function makeExercise(topic, grade, rand = Math.random) {
  const g = MAX[grade] ? grade : 1
  const t = MAKERS[topic] ? topic : ['add', 'sub', 'mul'][int(rand, 0, 2)]
  const ex = MAKERS[t](g, rand)
  return { ...ex, text: `${ex.a} ${ex.op} ${ex.b}` }
}

// Accepts what a class types: spaces, thousands separators, Arabic-Indic digits are fine.
export function checkAnswer(ex, input) {
  const digits = String(input ?? '').replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x660)).replace(/[\s,'׳]/g, '')
  return /^\d+$/.test(digits) && Number(digits) === ex.answer
}

// { winner, line } | { draw: true } | null. Ends in a draw as soon as no row can be finished by anyone,
// so the class doesn't keep answering exercises for a board that's already decided.
export function outcome(board) {
  const r = result(board)
  if (r) return r
  const open = LINES.some(l => !(l.some(i => board[i] === 1) && l.some(i => board[i] === 2)))
  return open ? null : { draw: true }
}

// After any answer (right or wrong) the turn passes to the other team.
export const nextTeam = team => (team === 1 ? 2 : 1)
