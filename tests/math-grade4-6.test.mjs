// /math grades 4–6 topic generators: contract shape, 500 seeds × 3 levels per topic, and every answer
// recomputed independently (from the expression, the question text or the diagram).
import { test } from 'node:test'
import assert from 'node:assert/strict'
const { createRng } = await import('../src/math/rng.js')
const { checkAnswer, formatAnswer } = await import('../src/math/check.js')
const GRADES = {
  4: (await import('../src/math/topics/grade4.js')).default,
  5: (await import('../src/math/topics/grade5.js')).default,
  6: (await import('../src/math/topics/grade6.js')).default,
}

const STRANDS = ['arithmetic', 'geometry', 'algebra', 'fractions', 'measurement', 'data', 'probability', 'functions', 'trigonometry', 'calculus', 'sequences', 'vectors']
const TYPES = ['number', 'fraction', 'numbers', 'choice', 'text']
const SEEDS = Array.from({ length: 500 }, (_, i) => i * 7919 + 13)

// ---------- exact rational arithmetic (independent of the generators) ----------
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a }
const R = (n, d = 1) => { if (d === 0) throw new Error('division by zero'); if (d < 0) { n = -n; d = -d } const g = gcd(n, d) || 1; return [n / g, d / g] }
const add = (a, b) => R(a[0] * b[1] + b[0] * a[1], a[1] * b[1])
const sub = (a, b) => R(a[0] * b[1] - b[0] * a[1], a[1] * b[1])
const mul = (a, b) => R(a[0] * b[0], a[1] * b[1])
const div = (a, b) => R(a[0] * b[1], a[1] * b[0])
const eq = (a, b) => a[0] * b[1] === b[0] * a[1]
const dec = s => { const [w, f = ''] = String(s).replace(/,/g, '').split('.'); return R(Number(w + f), 10 ** f.length) }
const toR = v => {
  if (typeof v === 'number') return dec(String(v))
  const m = String(v).match(/^(\d+) (\d+)\/(\d+)$/)
  if (m) return R(Number(m[1]) * Number(m[3]) + Number(m[2]), Number(m[3]))
  const f = String(v).match(/^(-?\d+)\/(\d+)$/)
  if (f) return R(Number(f[1]), Number(f[2]))
  return dec(v)
}

// Evaluate one side of an expression: numbers (1,234 / 3.5), fractions 3/4, mixed 2 1/3, + − × ÷ ( ).
function evalExpr(src) {
  const toks = []
  const re = /\s*(\d+ \d+\/\d+|\d+\/\d+|\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?|[+−×÷()])/y
  let m, pos = 0
  const s = src.trim()
  while (pos < s.length) {
    re.lastIndex = pos
    m = re.exec(s)
    if (!m) throw new Error(`cannot parse "${s}" at ${pos}`)
    toks.push(m[1]); pos = re.lastIndex
  }
  let i = 0
  const atom = () => {
    const t = toks[i++]
    if (t === '(') { const v = sum(); assert.equal(toks[i++], ')'); return v }
    return toR(t)
  }
  const prod = () => { let v = atom(); while (toks[i] === '×' || toks[i] === '÷') { const op = toks[i++]; const w = atom(); v = op === '×' ? mul(v, w) : div(v, w) } return v }
  function sum() { let v = prod(); while (toks[i] === '+' || toks[i] === '−') { const op = toks[i++]; const w = prod(); v = op === '+' ? add(v, w) : sub(v, w) } return v }
  const v = sum()
  assert.equal(i, toks.length, `trailing tokens in ${src}`)
  return v
}

const nums = q => (q.replace(/\(השתמשו[^)]*\)|\(π ≈ 3\.14\)/g, '').match(/\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?/g) || []).map(s => Number(s.replace(/,/g, '')))
const svgNums = svg => [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(m => m[1]).filter(t => /^\d+$/.test(t)).map(Number)
const lcm = (a, b) => (a / gcd(a, b)) * b
const isPrime = n => { if (n < 2) return false; for (let k = 2; k * k <= n; k++) if (n % k === 0) return false; return true }

// ---------- independent expected answers ----------
// Returns the expected answer (number, rational [n,d] or choice string), or undefined when the
// exercise is checked through its expression instead.
const PLACE = ['האחדות', 'העשרות', 'המאות', 'האלפים', 'עשרות האלפים', 'מאות האלפים']
const ROUND = { 'לעשרת הקרובה': 10, 'למאה הקרובה': 100, 'לאלף הקרוב': 1000, 'לעשרת האלפים הקרובה': 10000 }
const UNIT = { 'מילימטרים': 1, 'סנטימטרים': 10, 'מטרים': 1000, 'קילומטרים': 1e6, 'גרמים': 1, 'גרם': 1, 'קילוגרמים': 1000, 'מיליליטרים': 1, 'ליטרים': 1000 }
const QUAD_PAIRS = { 'ריבוע': 2, 'מלבן': 2, 'מקבילית': 2, 'מעוין': 2, 'טרפז': 1, 'טרפז ישר-זווית': 1, 'דלתון': 0, 'מרובע': 0 }
const wordsNum = (q, re1, word1) => { const m = q.match(re1); return m ? Number(m[1]) : q.includes(word1) ? 1 : 0 }

const EXPECT = {
  'place-value-million'(ex, lv) {
    if (lv === 1) { const m = ex.q.match(/ספרת (.+) במספר ([\d,]+)\?/); const s = m[2].replace(/,/g, ''); return Number(s[s.length - 1 - PLACE.indexOf(m[1])]) }
    if (lv === 2) { const m = ex.q.match(/הספרה (\d) במספר ([\d,]+)\?/); const s = m[2].replace(/,/g, ''); assert.equal(s.split(m[1]).length, 2, 'digit must be unique'); return Number(m[1]) * 10 ** (s.length - 1 - s.indexOf(m[1])) }
    const m = ex.q.match(/עגלו את ([\d,]+) (.+)\./), n = Number(m[1].replace(/,/g, '')), u = ROUND[m[2]]
    return Math.floor(n / u + 0.5) * u
  },
  'long-division'(ex, lv) {
    if (lv < 3) return undefined
    const [a, d] = nums(ex.expr)
    return ex.q.includes('שארית?') ? a % d : Math.floor(a / d)
  },
  'divisibility-primes'(ex, lv) {
    if (lv === 3) return isPrime(Number(ex.q.match(/המספר (\d+)/)[1])) ? 'ראשוני' : 'פריק'
    const m = ex.q.match(/האם ([\d,]+) מתחלק ב-(\d+)/)
    return Number(m[1].replace(/,/g, '')) % Number(m[2]) === 0 ? 'כן' : 'לא'
  },
  'fraction-of-number'(ex, lv) {
    const n = nums(ex.q)
    if (lv < 3) return (n[2] * n[0]) / n[1]
    return (n[2] / n[0]) * n[1]
  },
  'angle-types'(ex, lv) {
    const n = nums(ex.q)
    if (lv === 1) { const d = n[0]; return d < 90 ? 'זווית חדה' : d === 90 ? 'זווית ישרה' : d < 180 ? 'זווית קהה' : 'זווית שטוחה' }
    if (lv === 2) return 90 - n[0]
    return 180 - n.reduce((s, x) => s + x, 0)
  },
  'triangle-types'(ex, lv) {
    if (lv === 1) {
      const [a, b, c] = svgNums(ex.svg)
      assert.ok(a + b > c && a + c > b && b + c > a, 'triangle inequality')
      const k = new Set([a, b, c]).size
      return k === 1 ? 'שווה צלעות' : k === 2 ? 'שווה שוקיים' : 'שונה צלעות'
    }
    const n = nums(ex.q)
    if (lv === 2) { assert.equal(n[0] + n[1] + n[2], 180); const mx = Math.max(...n); return mx < 90 ? 'חד-זווית' : mx === 90 ? 'ישר-זווית' : 'קהה-זווית' }
    if (/שווה צלעות שאורך/.test(ex.q)) return 3 * n[0]
    if (/היקף משולש שווה צלעות/.test(ex.q)) return n[0] / 3
    if (/^היקף משולש שווה שוקיים/.test(ex.q)) { assert.ok(n[1] < n[0] - n[1], 'isosceles triangle inequality'); return (n[0] - n[1]) / 2 }
    assert.ok(n[1] < 2 * n[0], 'isosceles triangle inequality')
    return 2 * n[0] + n[1]
  },
  'parallel-perpendicular'(ex, lv) {
    if (lv === 3) {
      const name = ex.q.match(/בשרטוט (.+)\. כמה/)[1]
      assert.ok(name in QUAD_PAIRS, name)
      const P = ex.svg.match(/<polygon points="([^"]+)"/)[1].split(' ').map(p => p.split(',').map(Number))
      const dir = i => { const a = P[i], b = P[(i + 1) % 4], l = Math.hypot(b[0] - a[0], b[1] - a[1]); return [(b[0] - a[0]) / l, (b[1] - a[1]) / l] }
      const D = [0, 1, 2, 3].map(dir)
      // drawing is rounded to 0.1px, so allow a small tolerance
      const par = (a, b) => Math.abs(a[0] * b[1] - a[1] * b[0]) < 0.01
      const right = (a, b) => Math.abs(a[0] * b[0] + a[1] * b[1]) < 0.01
      const pairs = (par(D[0], D[2]) ? 1 : 0) + (par(D[1], D[3]) ? 1 : 0)
      if (/זוגות/.test(ex.q)) { assert.equal(pairs, QUAD_PAIRS[name], `${name} drawn with ${pairs} parallel pairs`); return pairs }
      return [0, 1, 2, 3].filter(i => right(D[i], D[(i + 1) % 4])).length
    }
    const L = [...ex.svg.matchAll(/<line x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"/g)].map(m => m.slice(1).map(Number))
    assert.equal(L.length, 2)
    const v = L.map(([x1, y1, x2, y2]) => { const l = Math.hypot(x2 - x1, y2 - y1); return [(x2 - x1) / l, (y2 - y1) / l] })
    const cross = Math.abs(v[0][0] * v[1][1] - v[0][1] * v[1][0]), dot = Math.abs(v[0][0] * v[1][0] + v[0][1] * v[1][1])
    if (cross < 0.01) return 'מקבילים'
    if (dot < 0.01) return 'מאונכים'
    assert.ok(dot > 0.3, 'non-perpendicular lines must look clearly non-perpendicular')
    return 'נחתכים אך לא מאונכים'
  },
  'rectangle-area-perimeter'(ex, lv) {
    if (lv < 3) {
      let [a, b] = svgNums(ex.svg)
      if (b === undefined) b = a
      return lv === 1 ? 2 * (a + b) : a * b
    }
    const n = nums(ex.q)
    if (/^שטח המלבן/.test(ex.q)) return n[0] / n[1]
    if (/^היקף המלבן/.test(ex.q)) return n[0] / 2 - n[1]
    return (n[0] / 4) ** 2
  },
  // grade 5
  'common-multiples-divisors'(ex, lv) {
    if (/אוטובוס/.test(ex.q)) { const [a, b] = [...ex.q.matchAll(/כל (\d+) דקות/g)].map(m => Number(m[1])); return lcm(a, b) }
    const n = nums(ex.q)
    if (lv === 2) return gcd(n[0], n[1])
    return n.reduce(lcm)
  },
  'decimals-place-value'(ex, lv) {
    if (lv === 3) return undefined
    const f = ex.q.match(/: (\d+)\/(\d+)$/)
    if (f) return R(Number(f[1]), Number(f[2]))
    const w = wordsNum(ex.q, /(\d+) שלמים/, 'שלם אחד')
    const t = wordsNum(ex.q, /(\d+) עשיריות/, 'עשירית אחת'), h = wordsNum(ex.q, /(\d+) מאיות/, 'מאית אחת')
    return R(w * 100 + t * 10 + h, 100)
  },
  'measurement-units'(ex) {
    const m = ex.q.match(/^המירו ([\d.,]+) (\S+) ל(\S+)\.$/)
    assert.ok(m && UNIT[m[2]] && UNIT[m[3]], ex.q)
    return mul(dec(m[1]), R(UNIT[m[2]], UNIT[m[3]]))
  },
  'triangle-quadrilateral-angles'(ex, lv) {
    const n = nums(ex.q)
    if (lv === 1) return 180 - n[0] - n[1]
    if (lv === 3) return 360 - n[0] - n[1] - n[2]
    if (/זווית הראש \(/.test(ex.q)) return (180 - n[0]) / 2
    if (/כל זווית בסיס/.test(ex.q)) return 180 - 2 * n[0]
    return 90 - n[0]
  },
  'parallelogram-area'(ex, lv) {
    const n = nums(ex.q)
    if (lv < 3) { if (lv === 2) assert.ok(n[2] > n[1], 'slanted side longer than height'); return n[0] * n[1] }
    return n[0] / n[1]
  },
  'triangle-area'(ex) {
    const n = nums(ex.q)
    if (/^שטח המשולש/.test(ex.q)) return (2 * n[0]) / n[1]
    return (n[0] * n[1]) / 2
  },
  'trapezoid-area'(ex, lv) {
    const n = nums(ex.q)
    if (lv === 3) return (2 * n[0]) / (n[1] + n[2])
    if (lv === 2) assert.equal(n[3] ** 2, n[2] ** 2 + (n[0] - n[1]) ** 2, 'slanted leg must fit the drawing (Pythagoras)')
    return ((n[0] + n[1]) * n[2]) / 2
  },
  'box-surface-area'(ex, lv) {
    const n = nums(ex.q)
    if (lv === 1) return 4 * (n[0] + n[1] + n[2])
    if (lv === 2) return 2 * (n[0] * n[1] + n[0] * n[2] + n[1] * n[2])
    if (/בלי מכסה/.test(ex.q)) return 2 * (n[0] * n[1] + n[0] * n[2] + n[1] * n[2]) - n[0] * n[1]
    if (/שטח הפנים של קובייה שאורך/.test(ex.q)) return 6 * n[0] * n[0]
    return Math.sqrt(n[0] / 6)
  },
  // grade 6
  'fractions-decimals-percents'(ex) {
    let m
    if ((m = ex.q.match(/^כתבו כאחוזים: (\d+)\/(\d+)$/))) return mul(R(Number(m[1]), Number(m[2])), R(100))
    if ((m = ex.q.match(/^כתבו כאחוזים: ([\d.]+)$/))) return mul(dec(m[1]), R(100))
    if ((m = ex.q.match(/^כתבו כמספר עשרוני: (\d+)%$/))) return R(Number(m[1]), 100)
    if ((m = ex.q.match(/^כתבו כמספר עשרוני: (\d+)\/(\d+)$/))) return R(Number(m[1]), Number(m[2]))
    m = ex.q.match(/^כתבו כשבר מצומצם: (\d+)%$/)
    const want = R(Number(m[1]), 100)
    assert.equal(ex.answer, `${want[0]}/${want[1]}`, 'answer must be fully reduced')
    return want
  },
  percent(ex) {
    let m
    if ((m = ex.q.match(/כמה הם (\d+)% מ-(\d+)\?/))) return (Number(m[1]) * Number(m[2])) / 100
    if ((m = ex.q.match(/מחיר משחק (\d+) ₪, ויש עליו הנחה של (\d+)%/))) return (Number(m[1]) * (100 - Number(m[2]))) / 100
    if ((m = ex.q.match(/^(\d+)% מהתלמידים בבית הספר הם (\d+) תלמידים/))) return (Number(m[2]) * 100) / Number(m[1])
    m = ex.q.match(/היו (\d+) שאלות, ויובל ענה נכון על (\d+)/)
    return (Number(m[2]) / Number(m[1])) * 100
  },
  'ratio-scale'(ex, lv) {
    if (lv === 1) { const m = ex.q.match(/(\d+):(\d+)\. יש (\d+)/); return (Number(m[3]) / Number(m[1])) * Number(m[2]) }
    if (lv === 2) {
      const m = ex.q.match(/^(\S+) ו(\S+) חילקו ביניהם (\d+) מדבקות ביחס (\d+):(\d+)/), who = ex.q.match(/עכשיו ל(\S+)\?$/)[1]
      const T = Number(m[3]), a = Number(m[4]), b = Number(m[5])
      return (T / (a + b)) * (who === m[1] ? a : b)
    }
    let m
    if ((m = ex.q.match(/1:([\d,]+) המרחק בין שתי נקודות הוא (\d+) ס״מ\. מה המרחק במציאות ב(קילומטרים|מטרים)/))) {
      const cm = Number(m[1].replace(/,/g, '')) * Number(m[2])
      return m[3] === 'מטרים' ? R(cm, 100) : R(cm, 100000)
    }
    m = ex.q.match(/הוא ([\d.,]+) (ק״מ|מ׳)\. .*1:([\d,]+)\?/)
    return div(mul(dec(m[1]), R(m[2] === 'ק״מ' ? 100000 : 100)), R(Number(m[3].replace(/,/g, ''))))
  },
  average(ex) {
    let m
    if ((m = ex.q.match(/(?:המספרים|במבחנים): ([\d, ]+)[?.]/))) { const xs = m[1].split(', ').map(Number); return xs.reduce((s, x) => s + x, 0) / xs.length }
    if ((m = ex.q.match(/ב-(\d+) מבחנים הוא (\d+)\..*יהיה (\d+)\?/))) { const n = Number(m[1]); const need = (n + 1) * Number(m[3]) - n * Number(m[2]); assert.ok(need >= 0 && need <= 100, 'grade 0–100'); return need }
    m = ex.q.match(/הממוצע של (\d+) מספרים הוא (\d+)\. \d+ מהם הם ([\d, ]+)\./)
    const xs = m[3].split(', ').map(Number)
    assert.equal(xs.length, Number(m[1]) - 1)
    return Number(m[1]) * Number(m[2]) - xs.reduce((s, x) => s + x, 0)
  },
  'circle-circumference'(ex) {
    const n = nums(ex.q)
    if (/הקוטר שלו/.test(ex.q) && /^מהו/.test(ex.q)) return 3.14 * n[0]
    if (/הרדיוס שלו/.test(ex.q) && /^מהו/.test(ex.q)) return 2 * 3.14 * n[0]
    return /הקוטר/.test(ex.q) ? n[0] / 3.14 : n[0] / 3.14 / 2
  },
  'circle-area'(ex) {
    const n = nums(ex.q)
    if (/חצי עיגול/.test(ex.q)) return (3.14 * n[0] * n[0]) / 2
    if (/הקוטר שלו/.test(ex.q)) return 3.14 * (n[0] / 2) ** 2
    if (/הרדיוס שלו/.test(ex.q)) return 3.14 * n[0] * n[0]
    return Math.sqrt(n[0] / 3.14)
  },
  'volume-box-cube'(ex) {
    const n = nums(ex.q)
    if (/^נפח תיבה הוא/.test(ex.q)) return n[0] / (n[1] * n[2])
    if (/^נפח קובייה הוא/.test(ex.q)) return Math.round(Math.cbrt(n[0]))
    if (/ליטרים/.test(ex.q)) return (n[0] * n[1] * n[2]) / 1000
    if (/של קובייה/.test(ex.q)) return n[0] ** 3
    return n[0] * n[1] * n[2]
  },
}

// Expression-based check: the answer substituted for '?' must make both sides equal;
// '☐' comparisons must get the right sign.
function checkByExpr(ex) {
  const expr = ex.expr
  if (expr.includes('☐')) {
    const [l, r] = expr.split('☐').map(evalExpr)
    const want = l[0] * r[1] > r[0] * l[1] ? '>' : l[0] * r[1] < r[0] * l[1] ? '<' : '='
    assert.equal(ex.answer, want, expr)
    return true
  }
  if (!expr.includes('=') || !expr.includes('?')) return false
  const val = toR(ex.answer)
  const sides = expr.split('=').map(s => s.trim())
  const subst = s => (s === '?' ? val : evalExpr(s.replace('?', ex.type === 'fraction' ? String(ex.answer) : String(ex.answer))))
  const l = subst(sides[0]), r = subst(sides[1])
  assert.ok(eq(l, r), `${expr} with ? = ${ex.answer}`)
  return true
}

function matchesExpected(ex, want) {
  if (typeof want === 'string') return assert.equal(ex.answer, want, ex.q)
  const got = toR(ex.answer)
  if (Array.isArray(want)) return assert.ok(eq(got, want), `${ex.q} ${ex.expr || ''}: got ${ex.answer}, want ${want[0]}/${want[1]}`)
  assert.ok(Number.isFinite(want), `expected value for ${ex.q}`)
  const tol = Math.max(1e-9, (ex.tol || 0) / 10)
  assert.ok(Math.abs(got[0] / got[1] - want) <= tol * Math.max(1, Math.abs(want)), `${ex.q} ${ex.expr || ''}: got ${ex.answer}, want ${want}`)
}

function validateShape(ex, where) {
  assert.ok(ex && typeof ex === 'object', where)
  assert.ok(typeof ex.q === 'string' && ex.q.trim(), `${where}: q`)
  assert.ok(TYPES.includes(ex.type), `${where}: type ${ex.type}`)
  assert.ok(typeof ex.explain === 'string' && ex.explain.trim(), `${where}: explain`)
  for (const k of ['q', 'expr', 'explain', 'unit']) {
    if (ex[k] === undefined) continue
    assert.ok(typeof ex[k] === 'string' && ex[k].trim(), `${where}: ${k} empty`)
    assert.ok(!/undefined|NaN|Infinity|null|\[object/.test(ex[k]), `${where}: bad text in ${k}: ${ex[k]}`)
  }
  if (ex.type === 'number') assert.ok(typeof ex.answer === 'number' && Number.isFinite(ex.answer), `${where}: numeric answer ${ex.answer}`)
  if (ex.type === 'number') assert.ok(ex.answer >= 0, `${where}: no negative answers in grades 4–6`)
  if (ex.type === 'fraction') {
    const m = String(ex.answer).match(/^(\d+)\/(\d+)$/)
    assert.ok(m, `${where}: fraction format ${ex.answer}`)
    assert.equal(gcd(Number(m[1]), Number(m[2])), 1, `${where}: fraction must be reduced ${ex.answer}`)
    assert.ok(Number(m[2]) > 1, `${where}: whole numbers use type number`)
  }
  if (ex.type === 'choice') {
    assert.ok(Array.isArray(ex.choices) && ex.choices.length >= 2 && ex.choices.length <= 5, `${where}: choices`)
    assert.equal(new Set(ex.choices).size, ex.choices.length, `${where}: duplicate choices`)
    assert.ok(ex.choices.includes(ex.answer), `${where}: answer among choices`)
  }
  if (ex.tol !== undefined) assert.ok(ex.tol > 0 && ex.tol < 1, `${where}: tol`)
  if (ex.svg !== undefined) {
    assert.match(ex.svg, /^<svg [^>]*viewBox="0 0 \d+(\.\d+)? \d+(\.\d+)?"[^>]*>.*<\/svg>$/s, `${where}: svg wrapper`)
    assert.ok(!/NaN|undefined|Infinity/.test(ex.svg), `${where}: svg numbers`)
    const h = Number(ex.svg.match(/viewBox="0 0 [\d.]+ ([\d.]+)"/)[1])
    assert.ok(h <= 240, `${where}: svg height ${h}`)
    for (const tag of ex.svg.match(/<[a-z]+\s[^>]*>/g)) {
      const names = [...tag.matchAll(/\s([a-zA-Z-]+)="/g)].map(m => m[1])
      assert.equal(new Set(names).size, names.length, `${where}: duplicate attribute in ${tag}`)
    }
    for (const m of ex.svg.matchAll(/\s(?:x|y|x1|y1|x2|y2|cx|cy)="([-\d.]+)"/g)) {
      const v = Number(m[1])
      assert.ok(v >= -2 && v <= 290, `${where}: coordinate ${v} outside the drawing`)
    }
  }
  // the framework's checker must accept the expected answer written the way we show it
  assert.ok(checkAnswer(ex, formatAnswer(ex)), `${where}: checker rejects its own answer ${formatAnswer(ex)}`)
}

for (const [g, topics] of Object.entries(GRADES)) {
  test(`grade ${g}: topic metadata follows the contract`, () => {
    assert.ok(topics.length >= 10 && topics.length <= 14, `grade ${g} has ${topics.length} topics`)
    assert.equal(new Set(topics.map(t => t.slug)).size, topics.length, 'unique slugs')
    assert.equal(new Set(topics.map(t => t.title)).size, topics.length, 'unique titles')
    for (const t of topics) {
      assert.match(t.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, t.slug)
      assert.equal(t.grade, Number(g), `${t.slug} grade`)
      assert.ok(STRANDS.includes(t.strand), `${t.slug} strand`)
      for (const k of ['title', 'emoji', 'desc', 'intro']) assert.ok(typeof t[k] === 'string' && t[k].trim(), `${t.slug} ${k}`)
      assert.ok(t.desc.length >= 120 && t.desc.length <= 160, `${t.slug} desc length ${t.desc.length}`)
      assert.ok(Array.isArray(t.tips) && t.tips.length >= 2 && t.tips.length <= 4, `${t.slug} tips`)
      assert.ok(t.example && t.example.q && t.example.a && t.example.steps.length >= 1, `${t.slug} example`)
      assert.ok(Array.isArray(t.faq) && t.faq.length >= 2 && t.faq.length <= 3 && t.faq.every(f => f.q && f.a), `${t.slug} faq`)
      assert.ok(Array.isArray(t.levels) && t.levels.length === 3 && t.levels.every(l => l.trim()), `${t.slug} levels`)
      assert.equal(typeof t.gen, 'function')
    }
  })
}

test('descriptions are unique across grades 4–6', () => {
  const all = Object.values(GRADES).flat().map(t => t.desc)
  assert.equal(new Set(all).size, all.length)
})

for (const [g, topics] of Object.entries(GRADES)) {
  for (const t of topics) {
    test(`grade ${g} / ${t.slug}: 500 seeds × 3 levels are valid and correct`, () => {
      for (const level of [1, 2, 3]) {
        for (const seed of SEEDS) {
          const ex = t.gen(level, createRng(seed))
          const where = `${t.slug} L${level} seed ${seed}`
          validateShape(ex, where)
          // deterministic for a seed
          assert.deepEqual(t.gen(level, createRng(seed)), ex, `${where}: deterministic`)
          const viaExpr = ex.expr ? checkByExpr(ex) : false
          const fn = EXPECT[t.slug]
          const want = fn ? fn(ex, level) : undefined
          if (want !== undefined) matchesExpected(ex, want)
          assert.ok(viaExpr || want !== undefined, `${where}: answer was not independently verified`)
        }
      }
    })
  }
}

test('levels genuinely differ: most level-3 exercises never appear at level 1', () => {
  for (const t of Object.values(GRADES).flat()) {
    const key = ex => `${ex.q}|${ex.expr || ''}|${ex.answer}`
    const l1 = new Set(SEEDS.map(s => key(t.gen(1, createRng(s)))))
    const l3 = SEEDS.map(s => key(t.gen(3, createRng(s))))
    const overlap = l3.filter(k => l1.has(k)).length
    assert.ok(overlap / l3.length < 0.1, `${t.slug}: ${overlap} of ${l3.length} level-3 items also at level 1`)
  }
})
