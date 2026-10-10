// Pure answer checking for the /math exercises (see the topic contract): numbers with tolerance,
// fractions (equivalent / mixed / exact decimals), unordered number sets, choices and short text.
// No DOM, no React — imported by the pages and by node tests.

export function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a
}

// [n, d] reduced, denominator positive. d must not be 0.
export function simplify(n, d) {
  if (!d) throw new Error('zero denominator')
  if (d < 0) { n = -n; d = -d }
  const g = gcd(n, d) || 1
  return [n / g + 0, d / g]
}

// 'n/d' reduced, or a plain integer string when the denominator is 1.
export function formatFraction(n, d = 1) {
  const [a, b] = simplify(n, d)
  return b === 1 ? String(a) : `${a}/${b}`
}

// 3, 4 → '¾'-free mixed form '1 1/2' for improper fractions (display only).
export function formatMixed(n, d = 1) {
  const [a, b] = simplify(n, d)
  if (b === 1 || Math.abs(a) < b) return formatFraction(a, b)
  const w = Math.trunc(a / b), r = Math.abs(a % b)
  return `${w} ${r}/${b}`
}

// Big numbers get a thousands separator the way Israeli textbooks print them (10,000).
export function formatNumber(x) {
  if (typeof x !== 'number' || !Number.isFinite(x)) return String(x)
  const v = Math.round(x * 1e9) / 1e9
  if (Number.isInteger(v) && Math.abs(v) >= 10000) return v.toLocaleString('en-US').replace('-', '−')
  return String(v).replace('-', '−')
}

const VULGAR = { '½': ' 1/2', '⅓': ' 1/3', '⅔': ' 2/3', '¼': ' 1/4', '¾': ' 3/4', '⅕': ' 1/5', '⅛': ' 1/8' }

// Unify what people actually type: Hebrew/Unicode minus and dashes, fraction slash, ÷ as a fraction bar
// in answers, invisible direction marks, non-breaking spaces, full-width digits.
export function normalizeInput(s) {
  return String(s ?? '')
    .replace(/[‎‏‪-‮⁦-⁩]/g, '')
    .replace(/[   ]/g, ' ')
    .replace(/[−–—‐‑־]/g, '-')
    .replace(/[⁄∕]/g, '/')
    .replace(/[½⅓⅔¼¾⅕⅛]/g, c => VULGAR[c])
    .replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/\s+/g, ' ')
    .trim()
}

export function isBlank(s) { return normalizeInput(s) === '' }

// A single written value as an exact rational [n, d] — integer, decimal (dot or comma), 'a/b',
// mixed 'w a/b'. Returns null when it is not a value. Thousands separators ('10,000') are allowed.
// A comma is ambiguous ('2,500' = 2500 or 2.5), so this returns every reading.
export function parseRationals(raw) {
  let s = normalizeInput(raw).replace(/^\+/, '')
  if (!s) return []
  s = s.replace(/\s*\/\s*/g, '/').replace(/^-\s+/, '-')
  let m = s.match(/^(-?)(\d+) (\d+)\/(\d+)$/)
  if (m) {
    const w = +m[2], a = +m[3], b = +m[4]
    if (!b) return []
    const n = w * b + a
    return [simplify(m[1] ? -n : n, b)]
  }
  m = s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/)
  if (m) {
    const [p] = decimalRationals(m[1]), [q] = decimalRationals(m[2])
    if (!p || !q || q[0] === 0) return []
    return [simplify(p[0] * q[1], p[1] * q[0])]
  }
  s = s.replace(/ /g, '')
  const out = []
  if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) out.push(...decimalRationals(s.replace(/,/g, '')))
  if (/^-?\d*,\d+$/.test(s)) out.push(...decimalRationals(s.replace(',', '.')))
  if (/^-?(\d+\.?\d*|\.\d+)$/.test(s)) out.push(...decimalRationals(s))
  return out
}

function decimalRationals(s) {
  const m = String(s).match(/^(-?)(\d*)\.?(\d*)$/)
  if (!m || (m[2] === '' && m[3] === '')) return []
  const dec = m[3].slice(0, 9), d = 10 ** dec.length
  const n = Number((m[2] || '0') + dec)
  return [simplify(m[1] ? -n : n, d)]
}

// Expected fraction answers come as 'a/b', 'a', a number, or 'w a/b'.
export function toRational(v) {
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return [v, 1]
    const r = parseRationals(String(v))
    return r[0] || null
  }
  return parseRationals(v)[0] || null
}

const sameRational = (a, b) => a[0] * b[1] === b[0] * a[1]
const valueOf = ([n, d]) => n / d

function numberMatches(expected, input, tol) {
  const want = typeof expected === 'number' ? expected : Number(expected)
  const t = Math.max(Number(tol) || 0, 1e-9 * Math.max(1, Math.abs(want)))
  return parseRationals(input).some(r => Math.abs(valueOf(r) - want) <= t)
}

function fractionMatches(expected, input) {
  const want = toRational(expected)
  if (!want) return false
  return parseRationals(input).some(r => sameRational(r, want))
}

// Split a typed list: '2, -3', '2;-3', 'x=2 או x=-3', '2 ו-3'.
export function splitList(input) {
  return normalizeInput(input)
    .replace(/[a-zA-Z]\s*[=:]/g, ' ')
    .replace(/(^|\s)ו-?(?=[\d-])/g, ' ')
    .replace(/[֐-׿]+/g, ' ')
    .split(/[;,|]|\s+(?![\d]+\/)/)
    .map(x => x.trim())
    .filter(Boolean)
}

function numbersMatch(expected, input, tol) {
  const want = [...expected]
  const got = splitList(input)
  if (got.length !== want.length) return false
  const used = new Array(want.length).fill(false)
  for (const g of got) {
    const i = want.findIndex((w, k) => !used[k] && (typeof w === 'number' ? numberMatches(w, g, tol) : fractionMatches(w, g)))
    if (i < 0) return false
    used[i] = true
  }
  return true
}

const textKey = s => normalizeInput(s).replace(/['"׳״`]/g, '').replace(/\s+/g, '').toLowerCase()

// The one entry point: does `input` answer exercise `ex` correctly?
export function checkAnswer(ex, input) {
  if (!ex || isBlank(input)) return false
  switch (ex.type) {
    case 'number': return numberMatches(ex.answer, input, ex.tol)
    case 'fraction': return fractionMatches(ex.answer, input)
    case 'numbers': return Array.isArray(ex.answer) && numbersMatch(ex.answer, input, ex.tol)
    case 'choice': return normalizeInput(input) === normalizeInput(ex.answer)
    case 'text': return textKey(input) === textKey(ex.answer)
    default: return false
  }
}

// Human-readable correct answer for feedback and answer keys.
export function formatAnswer(ex) {
  if (!ex) return ''
  if (ex.type === 'number') return formatNumber(Number(ex.answer))
  if (ex.type === 'numbers') return ex.answer.map(v => (typeof v === 'number' ? formatNumber(v) : String(v).replace('-', '−'))).join(' , ')
  if (ex.type === 'fraction') return String(ex.answer).replace('-', '−')
  return String(ex.answer)
}
