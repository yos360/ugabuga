import { rng } from './rng.js'

const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a)
const fraction = (n, d = 1) => {
  if (!d) return null
  const sign = d < 0 ? -1 : 1, divisor = gcd(n, d)
  return { n: sign * n / divisor, d: Math.abs(d) / divisor }
}
const key = value => `${value.n}/${value.d}`
const combine = (a, b, allowDivision = true) => [
  { value: fraction(a.value.n * b.value.d + b.value.n * a.value.d, a.value.d * b.value.d), expression: `(${a.expression}+${b.expression})`, op: '+' },
  { value: fraction(a.value.n * b.value.d - b.value.n * a.value.d, a.value.d * b.value.d), expression: `(${a.expression}-${b.expression})`, op: '-' },
  { value: fraction(b.value.n * a.value.d - a.value.n * b.value.d, a.value.d * b.value.d), expression: `(${b.expression}-${a.expression})`, op: '-' },
  { value: fraction(a.value.n * b.value.n, a.value.d * b.value.d), expression: `(${a.expression}×${b.expression})`, op: '×' },
  ...(allowDivision ? [
    { value: fraction(a.value.n * b.value.d, a.value.d * b.value.n), expression: `(${a.expression}÷${b.expression})`, op: '÷' },
    { value: fraction(b.value.n * a.value.d, b.value.d * a.value.n), expression: `(${b.expression}÷${a.expression})`, op: '÷' },
  ] : []),
].filter(item => item.value)

export function solve24(numbers, { allowDivision = true } = {}) {
  const search = items => {
    if (items.length === 1) return items[0].value.n === 24 * items[0].value.d ? items[0] : null
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const rest = items.filter((_, index) => index !== i && index !== j)
      const seen = new Set()
      for (const result of combine(items[i], items[j], allowDivision)) {
        const id = `${key(result.value)}:${result.op}`
        if (seen.has(id)) continue
        seen.add(id)
        const solved = search([...rest, result])
        if (solved) return solved
      }
    }
    return null
  }
  return search(numbers.map(value => ({ value: fraction(value), expression: String(value), op: '' })))?.expression || null
}

const LEVELS = {
  young: { max: 9, allowDivision: false },
  classic: { max: 10, allowDivision: true },
  expert: { max: 13, allowDivision: true },
}

export function puzzle(seed, level = 'classic') {
  const config = LEVELS[level] || LEVELS.classic, random = rng(seed)
  for (let attempt = 0; attempt < 2000; attempt++) {
    const numbers = Array.from({ length: 4 }, () => 1 + Math.floor(random() * config.max))
    const solution = solve24(numbers, config)
    if (solution) return { numbers, solution, level, seed }
  }
  throw new Error('No verified Buga 24 puzzle found')
}

const tokenize = source => {
  const normalized = source.replace(/[xX*]/g, '×').replace(/\//g, '÷').replace(/[−–—]/g, '-').replace(/\s+/g, '')
  const tokens = normalized.match(/\d+|[()+\-×÷]/g) || []
  return tokens.join('') === normalized ? tokens : null
}

export function evaluateExpression(source, numbers) {
  const tokens = tokenize(source)
  if (!tokens) return { ok: false, error: 'יש בתרגיל סימן שלא ניתן להשתמש בו' }
  const used = tokens.filter(token => /^\d+$/.test(token)).map(Number).sort((a, b) => a - b)
  const expected = [...numbers].sort((a, b) => a - b)
  if (used.length !== 4 || used.some((value, index) => value !== expected[index])) return { ok: false, error: 'צריך להשתמש בכל אחד מארבעת המספרים פעם אחת בדיוק' }
  let index = 0
  const primary = () => {
    if (tokens[index] === '(') {
      index++
      const value = expression()
      if (!value || tokens[index++] !== ')') return null
      return value
    }
    const token = tokens[index++]
    return /^\d+$/.test(token || '') ? fraction(Number(token)) : null
  }
  const term = () => {
    let value = primary()
    while (value && ['×', '÷'].includes(tokens[index])) {
      const op = tokens[index++], right = primary()
      if (!right) return null
      value = op === '×' ? fraction(value.n * right.n, value.d * right.d) : fraction(value.n * right.d, value.d * right.n)
      if (!value) return null
    }
    return value
  }
  const expression = () => {
    let value = term()
    while (value && ['+', '-'].includes(tokens[index])) {
      const op = tokens[index++], right = term()
      if (!right) return null
      value = op === '+' ? fraction(value.n * right.d + right.n * value.d, value.d * right.d) : fraction(value.n * right.d - right.n * value.d, value.d * right.d)
    }
    return value
  }
  const value = expression()
  if (!value || index !== tokens.length) return { ok: false, error: 'התרגיל אינו שלם' }
  return { ok: value.n === 24 * value.d, value: value.d === 1 ? value.n : value.n / value.d, error: value.n === 24 * value.d ? null : `התוצאה היא ${value.d === 1 ? value.n : `${value.n}/${value.d}`}, לא 24` }
}

export const cleanSolution = expression => expression.replace(/^\((.*)\)$/, '$1')
export const hintFor = (solution, step) => {
  if (step === 0) return `הפעולה האחרונה בפתרון היא ${solution.includes(')+(') ? 'חיבור או חיסור בין שתי קבוצות' : 'פעולה בין תוצאות ביניים'}`
  if (step === 1) return `כדאי להתחיל מהחלק ${solution.match(/\([^()]+\)/)?.[0] || 'שבסוגריים'}`
  return `פתרון אפשרי: ${cleanSolution(solution)} = 24`
}
