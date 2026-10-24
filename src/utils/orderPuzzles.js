// "Solve, then put in order" worksheets (/printables/math-order-puzzles).
// Pure functions, no React: every sheet comes from (settings, seed), so "new sheet" is a new seed
// and nothing is stored. All results on a sheet are different from each other, so the order is
// never ambiguous, and nothing ever goes below zero.
import { rng } from './mathSheets.js'

const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1))
const pick = (r, list) => list[Math.floor(r() * list.length)]
const shuffle = (r, list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
const span = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)

export const RANGES = { 10: 'עד 10', 20: 'עד 20', 100: 'עד 100', mul: 'לוח הכפל' }
export const OPS = { '+': 'חיבור', '-': 'חיסור', mix: 'חיבור וחיסור', x: 'כפל', '÷': 'חילוק', muldiv: 'כפל וחילוק' }
export const opsFor = range => (range === 'mul' ? ['x', '÷', 'muldiv'] : ['+', '-', 'mix'])
export const COUNTS = [6, 8, 10]

// Products of the times tables 2–10 × 2–10 (what "לוח הכפל" practises).
const PRODUCTS = [...new Set(span(2, 10).flatMap(a => span(2, 10).map(b => a * b)))].sort((a, b) => a - b)

// The results a sheet may use. `main` fits the level; `extra` is only used when the sheet needs
// more distinct results than `main` has (e.g. ten additions up to 10 need one "1 + 0").
function resultPools(range, o) {
  if (o === 'x') return { main: PRODUCTS, extra: [] }
  if (o === '÷') return { main: span(2, 10), extra: [1] }
  if (range === 10) return o === '+' ? { main: span(2, 10), extra: [1] } : { main: span(1, 9), extra: [0] }
  if (range === 20) return o === '+' ? { main: span(6, 20), extra: span(2, 5) } : { main: span(1, 15), extra: [0, 16, 17, 18, 19] }
  return o === '+' ? { main: span(20, 100), extra: span(10, 19) } : { main: span(5, 90), extra: span(1, 4) }
}

// One exercise whose answer is exactly c.
function build(r, range, o, c) {
  if (o === 'x') {
    const pairs = span(2, 10).filter(a => c % a === 0 && c / a >= 2 && c / a <= 10).map(a => [a, c / a])
    const [a, b] = pick(r, pairs)
    return { a, b, o: 'x', c }
  }
  if (o === '÷') { const b = int(r, 2, 10); return { a: b * c, b, o: '÷', c } }
  if (o === '+') {
    if (c <= 1) return r() < 0.5 ? { a: c, b: 0, o, c } : { a: 0, b: c, o, c }
    if (range === 20 && c >= 11 && c <= 18 && r() < 0.75) { const a = int(r, c - 9, 9); return { a, b: c - a, o, c } } // crossing ten: 8 + 5
    const lo = range >= 100 ? Math.min(5, c - 5) : c >= 4 ? 2 : 1 // "6 + 1" only on the smallest sums
    const a = int(r, Math.max(1, lo), c - Math.max(1, lo))
    return { a, b: c - a, o, c }
  }
  // subtraction a − b = c; a never goes above the range
  if (range === 20 && c >= 2 && c <= 9 && r() < 0.75) { const a = int(r, Math.max(11, c + 2), Math.min(18, c + 9)); return { a, b: a - c, o, c } } // crossing ten: 13 − 6
  const lo = range >= 100 ? 5 : 1
  const b = int(r, lo, Math.max(lo, Math.min(range >= 100 ? 60 : 9, range - c)))
  return { a: c + b, b, o, c }
}

// `count` exercises with distinct results for the chosen range and operation(s). On a mixed sheet
// the operations take turns, so both really appear (half additions, half subtractions).
export function orderExercises({ range = 20, op = 'mix', count = 10, seed = 1 }) {
  const r = rng(seed)
  const ops = op === 'mix' ? ['+', '-'] : op === 'muldiv' ? ['x', '÷'] : [op]
  const pools = Object.fromEntries(ops.map(o => { const p = resultPools(range, o); return [o, { main: shuffle(r, p.main), extra: shuffle(r, p.extra) }] }))
  const used = new Set(), out = []
  const take = (o, key) => pools[o][key].find(c => !used.has(c))
  for (let k = 0; k < count; k++) {
    const first = ops[(k + seed) % ops.length]
    const order = [first, ...ops.filter(o => o !== first)]
    let o = order.find(x => take(x, 'main') !== undefined), c = o && take(o, 'main')
    if (o === undefined) { o = order.find(x => take(x, 'extra') !== undefined); c = o && take(o, 'extra') }
    if (o === undefined) break // never happens for the offered settings (checked in tests)
    used.add(c)
    out.push(build(r, range, o, c))
  }
  return shuffle(r, out)
}

// order[k] is the index of the exercise whose result goes in slot k (slot 0 = where the picture starts).
export function slotOrder(items, dir = 'asc') {
  const idx = items.map((_, i) => i).sort((i, j) => items[i].c - items[j].c)
  return dir === 'desc' ? idx.reverse() : idx
}

// Secret words for the self-check: exactly 6, 8 or 10 letters (spaces don't take a slot).
export const SECRET_WORDS = {
  6: ['כוכבים', 'אלופים', 'תפוזים', 'יום טוב', 'מספרים', 'פרפרים'],
  8: ['חשבון כיף', 'פרח ופרפר', 'שמש בשמים', 'גלידת תות', 'ארנב וגזר', 'יום הולדת'],
  10: ['חשבון זה כיף', 'כל הכבוד לכם', 'פרחים בגינה', 'ים כחול ושמש', 'מספרים וכיף'],
}
export const letters = word => [...word.replace(/\s/g, '')]
export const secretWord = (count, seed) => { const list = SECRET_WORDS[count]; return list[Math.abs(seed) % list.length] }

// Everything one sheet needs: the exercises, which result goes in which slot, the letter of every
// exercise (for the secret word) and the "smallest + largest" check number.
export function orderSheet({ range, op, count, dir, seed }) {
  const items = orderExercises({ range, op, count, seed })
  const order = slotOrder(items, dir)
  const word = secretWord(count, seed)
  const ls = letters(word)
  const letterOf = items.map(() => '')
  order.forEach((ex, k) => { letterOf[ex] = ls[k] })
  const cs = items.map(e => e.c)
  return { items, order, word, letterOf, check: Math.min(...cs) + Math.max(...cs) }
}
