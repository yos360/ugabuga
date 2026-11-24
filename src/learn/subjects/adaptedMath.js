// Adapted MATH exam for grades א׳–ו׳: 10 questions built from the grade's own /math topic generators
// (src/math/topics), deterministic for a seed. Only exercises that can be read aloud are used (no pictures),
// every question has three options with plausible wrong answers, and the text is also given in speakable Hebrew.
import { topicsFor, makeExercise } from '../../math/registry.js'
import { createRng } from '../../math/rng.js'
import { speakMath } from './speakMath.js'

export const ADAPTED_MATH_GRADES = [1, 2, 3, 4, 5, 6]
const FIGURE = /בציור|בתרשים|בטבלה|בלוח|בשעון|בצורה|במפה|בגרף|בעמודות/
const OPERATION = /^\s*(\d+(?:\.\d+)?)\s*([+−×÷-])\s*(\d+(?:\.\d+)?)\s*=\s*\?\s*$/
const LRI = '⁦', PDI = '⁩' // keeps "7 + 5 = ?" in left-to-right order inside Hebrew text

const decimalsOf = n => (String(n).split('.')[1] || '').length
const fix = (n, dec) => Number(n.toFixed(dec))
const show = n => String(n)

// Can this exercise become a read-aloud multiple-choice question?
export function usable(ex) {
  if (!ex || ex.svg || ex.type !== 'number' || ex.tol) return false
  const a = Number(ex.answer)
  if (!Number.isFinite(a) || a < 0 || a >= 1e9 || String(ex.answer).trim() === '') return false
  const all = `${ex.q} ${ex.expr || ''}`
  if (FIGURE.test(all) || /[a-zA-Z]/.test(ex.expr || '') || all.includes('/')) return false // pictures, letters and fractions are not read aloud here
  if (!ex.expr && /(^|[^d.])1(?![d.])/.test(ex.q)) return false // "היו 1 בלונים" reads badly
  return Boolean(ex.expr || /\d/.test(ex.q))
}

// Wrong answers: first the result of a different operation on the same numbers (the classic slip), then
// numbers just around the right one (±1, ±10, swapped digits), so that nothing is silly.
export function distractors(ex, r) {
  const a = Number(ex.answer), dec = decimalsOf(ex.answer)
  const step = 10 ** -dec
  const confusion = []
  const m = OPERATION.exec(ex.expr || '')
  if (m) {
    const x = Number(m[1]), y = Number(m[3]), d = Math.max(dec, decimalsOf(m[1]), decimalsOf(m[3]))
    const alt = { '+': [x - y, x * y], '−': [x + y, x * y], '-': [x + y, x * y], '×': [x + y, x - y], '÷': [x * y, x - y] }[m[2]]
    for (const v of alt) if (v >= 0 && v <= 4 * a + 20 && Number.isFinite(v)) confusion.push(fix(v, Math.min(d, 3)))
  }
  const near = dec ? [a + step, a - step, a + 10 * step, a - 10 * step, a + 1, a - 1] : [a + 1, a - 1, a + 2, a - 2, a + 10, a - 10]
  if (a >= 100) near.push(a + 100 * step, a - 100 * step)
  if (!dec && a >= 10 && a < 100) near.push(Number(String(a).split('').reverse().join('')))
  const seen = new Set([show(a)])
  const take = list => list.map(v => fix(v, dec)).filter(v => v >= 0 && Number.isFinite(v)).map(v => show(v)).filter(s => !seen.has(s) && seen.add(s))
  const first = take(confusion.filter(v => v !== a).map(v => fix(v, dec)))
  const rest = take(r.shuffle(near.filter(v => fix(v, dec) !== a)))
  const out = [...first.slice(0, 1), ...rest, ...first.slice(1)].slice(0, 2)
  // very small answers (0, 1, 2) can run out of near numbers; widen the circle
  for (let k = 3; out.length < 2 && k < 40; k++) for (const v of take([a + k * step])) out.push(v)
  return out
}

const withUnit = (v, ex) => (ex.unit ? (ex.unit === '%' ? `${v}%` : `${v} ${ex.unit}`) : v)
const speakOption = (v, ex) => speakMath(withUnit(v, ex))
const exKey = ex => `${ex.q}|${ex.expr || ''}|${ex.answer}`

// One adapted question from an exercise, or null.
export function toQuestion(ex, id, r) {
  if (!usable(ex)) return null
  const a = Number(ex.answer)
  const wrong = distractors(ex, r)
  if (wrong.length < 2) return null
  const values = r.shuffle([show(a), ...wrong])
  const expr = ex.expr ? `${LRI}${ex.expr}${PDI}` : ''
  return {
    id,
    q: ex.q.trim(),
    expr,
    say: speakMath(`${ex.q} ${ex.expr || ''}`),
    options: values.map(v => withUnit(v, ex)),
    sayOptions: values.map(v => speakOption(v, ex)),
    answer: values.indexOf(show(a)),
    exp: ex.explain || '',
  }
}

// n questions for a grade (topics dealt round-robin, easy exercises first, medium after).
export function adaptedMathQuestions(grade, seed = 1, n = 10) {
  const topics = topicsFor(grade)
  if (!topics.length) return []
  const r = createRng((Number(seed) || 1) * 2654435761 + grade)
  let live = r.shuffle(topics), i = 0
  const seen = new Set(), out = []
  for (let guard = 0; out.length < n && live.length && guard < n * 60; guard++) {
    const t = live[i % live.length]
    const level = out.length < Math.ceil(n / 2) ? 1 : 2
    let q = null
    for (let k = 0; k < 14 && !q; k++) {
      const ex = makeExercise(t, level, Math.floor(r.next() * 2 ** 31) + 1)
      if (!usable(ex) || seen.has(exKey(ex))) continue
      q = toQuestion(ex, `am${grade}-${seed}-${out.length}`, r)
      if (q) seen.add(exKey(ex))
    }
    if (q) { out.push(q); i++ } else { live = live.filter(x => x !== t) }
  }
  return out
}
