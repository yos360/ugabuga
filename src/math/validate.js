// Structural validation of one generated exercise against the topic contract. Used by the node tests
// of every grade (returns a list of problems; empty = valid).
import { checkAnswer, formatAnswer, toRational, formatFraction } from './check.js'

const TYPES = ['number', 'fraction', 'numbers', 'choice', 'text']
const BAD = /undefined|NaN|Infinity|\[object|null\b/

export function exerciseProblems(ex) {
  const p = []
  if (!ex || typeof ex !== 'object') return ['not an object']
  if (typeof ex.q !== 'string' || !ex.q.trim()) p.push('empty q')
  if (!TYPES.includes(ex.type)) p.push(`bad type ${ex.type}`)
  if (typeof ex.explain !== 'string' || !ex.explain.trim()) p.push('empty explain')
  for (const k of ['q', 'expr', 'explain', 'unit', 'svg']) {
    if (ex[k] != null && typeof ex[k] !== 'string') p.push(`${k} not a string`)
    else if (ex[k] && BAD.test(ex[k])) p.push(`${k} contains ${ex[k].match(BAD)[0]}: ${ex[k].slice(0, 80)}`)
  }
  if (ex.svg != null) {
    if (!/^<svg[\s>]/.test(ex.svg) || !ex.svg.endsWith('</svg>')) p.push('svg not wrapped in <svg>')
    if (/<script|\son\w+=|javascript:/i.test(ex.svg)) p.push('svg has script')
  }
  if (ex.tol != null && !(typeof ex.tol === 'number' && ex.tol >= 0 && Number.isFinite(ex.tol))) p.push('bad tol')
  switch (ex.type) {
    case 'number':
      if (typeof ex.answer !== 'number' || !Number.isFinite(ex.answer)) p.push(`number answer not finite: ${ex.answer}`)
      break
    case 'fraction': {
      const r = toRational(ex.answer)
      if (!r) p.push(`fraction answer unparsable: ${ex.answer}`)
      else if (typeof ex.answer === 'string' && /\//.test(ex.answer) && formatFraction(...r) !== ex.answer.replace(/\s/g, '').replace('−', '-')) p.push(`fraction not simplified: ${ex.answer}`)
      break
    }
    case 'numbers':
      if (!Array.isArray(ex.answer) || !ex.answer.length) p.push('numbers answer not a non-empty array')
      else for (const v of ex.answer) if (!(typeof v === 'number' ? Number.isFinite(v) : toRational(v))) p.push(`bad list item ${v}`)
      break
    case 'choice': {
      const c = ex.choices
      if (!Array.isArray(c) || c.length < 2 || c.length > 5) p.push('choices must be 2–5')
      else {
        if (new Set(c.map(String)).size !== c.length) p.push(`duplicate choices: ${c.join('|')}`)
        if (!c.map(String).includes(String(ex.answer))) p.push(`answer ${ex.answer} not in choices`)
        if (c.some(x => typeof x !== 'string' || !x.trim() || BAD.test(x))) p.push('bad choice text')
      }
      break
    }
    case 'text':
      if (typeof ex.answer !== 'string' || !ex.answer.trim()) p.push('empty text answer')
      break
  }
  if (!p.length && !checkAnswer(ex, formatAnswer(ex))) p.push(`formatted answer does not check: ${formatAnswer(ex)}`)
  return p
}

// Exact evaluation of a simple arithmetic line (+ − × ÷, parentheses) — returns null if unsupported.
export function evalArithmetic(s) {
  const src = String(s).replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/,(?=\d{3}\b)/g, '').replace(/\s+/g, '')
  if (!/^[\d+\-*/().]+$/.test(src)) return null
  let i = 0
  const peek = () => src[i]
  const num = () => {
    if (peek() === '(') { i++; const v = add(); if (src[i++] !== ')') throw new Error('paren'); return v }
    if (peek() === '-') { i++; return -num() }
    const m = src.slice(i).match(/^\d+(\.\d+)?/)
    if (!m) throw new Error('num')
    i += m[0].length
    return Number(m[0])
  }
  const mul = () => { let v = num(); while (peek() === '*' || peek() === '/') { const o = src[i++], w = num(); v = o === '*' ? v * w : v / w } return v }
  const add = () => { let v = mul(); while (peek() === '+' || peek() === '-') { const o = src[i++], w = mul(); v = o === '+' ? v + w : v - w } return v }
  try { const v = add(); return i === src.length ? v : null } catch { return null }
}

// For exercises whose expr is an equation with a '?' (e.g. '7 + ? = 12') or a comparison box
// ('47 ☐ 52'), plug the answer in and check the statement is true. Returns null when not applicable.
export function exprHolds(ex) {
  if (!ex.expr) return null
  const ans = ex.type === 'choice' ? String(ex.answer) : String(ex.answer)
  if (ex.expr.includes('☐') && ['<', '>', '='].includes(ans)) {
    const [l, r] = ex.expr.split('☐').map(evalArithmetic)
    if (l == null || r == null) return null
    return ans === '<' ? l < r : ans === '>' ? l > r : Math.abs(l - r) < 1e-9
  }
  if ((ex.expr.match(/\?/g) || []).length !== 1 || !ex.expr.includes('=') || ex.type !== 'number') return null
  const sides = ex.expr.replace('?', `(${ans})`).split('=')
  if (sides.length !== 2) return null
  const [l, r] = sides.map(evalArithmetic)
  if (l == null || r == null) return null
  return Math.abs(l - r) <= Math.max(1e-9, ex.tol || 0)
}
