// Grade 10 (כיתה י׳) — high-school topics for 3, 4 and 5 יח״ל. The small formatting helpers below are
// exported and reused by grade11.js / grade12.js.

// ---------- shared helpers ----------
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻', '+': '⁺', x: 'ˣ' }
const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', '-': '₋' }
export const sup = s => String(s).split('').map(c => SUP[c] ?? c).join('')
export const sub = s => String(s).split('').map(c => SUB[c] ?? c).join('')
export const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a }
export const round = (v, k = 2) => { const p = 10 ** k; return Math.round((v + Math.sign(v) * 1e-12) * p) / p }
// number for display: unicode minus, no float noise
export const fmt = n => { const v = Math.round(n * 1e6) / 1e6; return v < 0 ? '−' + Math.abs(v) : String(Object.is(v, -0) ? 0 : v) }
export const reduce = (n, d) => { if (d < 0) { n = -n; d = -d } const g = gcd(n, d) || 1; return [n / g, d / g] }
export const fracText = (n, d = 1) => { [n, d] = reduce(n, d); return d === 1 ? fmt(n) : `${n < 0 ? '−' : ''}${Math.abs(n)}/${d}` }
// answer for a rational result: plain number when whole, otherwise a simplified 'a/b' fraction
export const fracAnswer = (n, d = 1) => { [n, d] = reduce(n, d); return d === 1 ? { type: 'number', answer: n } : { type: 'fraction', answer: `${n}/${d}` } }

// Sum of terms. Each item is [coef, varStr] (coef: integer or [num, den]) or a ready { neg, body } part.
export function terms(items) {
  const parts = []
  for (const it of items) {
    if (!Array.isArray(it)) { if (it && it.body) parts.push(it); continue }
    const [c, v = ''] = it
    let [n, d] = Array.isArray(c) ? reduce(c[0], c[1]) : [c, 1]
    if (n === 0) continue
    const neg = n < 0; n = Math.abs(n)
    let body
    if (!v) body = d === 1 ? `${n}` : `${n}/${d}`
    else if (d === 1) body = (n === 1 ? '' : n) + v
    else body = `(${n}/${d})${v}`
    parts.push({ neg, body })
  }
  if (!parts.length) return '0'
  return parts.map((p, i) => (i === 0 ? (p.neg ? '−' : '') : (p.neg ? ' − ' : ' + ')) + p.body).join('')
}
export const xp = (p, v = 'x') => (p === 0 ? '' : p === 1 ? v : v + sup(p))
// polynomial from [[coef, power], ...]
export const poly = (list, v = 'x') => terms(list.map(([c, p]) => [c, xp(p, v)]))
// "y = mx + b" with m, b integers or [n, d]
export const lineText = (m, b) => `y = ${terms([[m, 'x'], [b, '']])}`
// "(x − a)" factor text
export const shift = (a, v = 'x') => (a === 0 ? v : `(${v} ${a > 0 ? '−' : '+'} ${Math.abs(a)})`)
export const pt = (x, y) => `(${fmt(x)}, ${fmt(y)})`

// multiple-choice result: the answer plus up to 3 unique distractors, shuffled
export function choiceQ(r, answer, cands) {
  const out = [answer]
  for (const c of cands) { if (out.length >= 4) break; if (c && !out.includes(c)) out.push(c) }
  return { type: 'choice', answer, choices: r.shuffle(out) }
}

// Coordinate plane with optional points, lines {m, b} and a circle {cx, cy, R}
export function planeSvg({ points = [], lines = [], circle = null, size = 220 } = {}) {
  const vals = [0]
  for (const p of points) vals.push(p.x, p.y)
  if (circle) vals.push(circle.cx - circle.R, circle.cx + circle.R, circle.cy - circle.R, circle.cy + circle.R)
  const lo = Math.floor(Math.min(...vals)) - 1, hi = Math.ceil(Math.max(...vals)) + 1
  const pad = 12, sc = (size - 2 * pad) / (hi - lo)
  const X = x => +(pad + (x - lo) * sc).toFixed(1), Y = y => +(size - pad - (y - lo) * sc).toFixed(1)
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" font-family="sans-serif" font-size="11">`
  if (hi - lo <= 26) for (let i = lo; i <= hi; i++) {
    s += `<line x1="${X(i)}" y1="${Y(lo)}" x2="${X(i)}" y2="${Y(hi)}" stroke="currentColor" stroke-opacity="0.12"/>`
    s += `<line x1="${X(lo)}" y1="${Y(i)}" x2="${X(hi)}" y2="${Y(i)}" stroke="currentColor" stroke-opacity="0.12"/>`
  }
  s += `<line x1="${X(lo)}" y1="${Y(0)}" x2="${X(hi)}" y2="${Y(0)}" stroke="currentColor"/><line x1="${X(0)}" y1="${Y(lo)}" x2="${X(0)}" y2="${Y(hi)}" stroke="currentColor"/>`
  s += `<text x="${X(hi) - 8}" y="${Y(0) - 4}" fill="currentColor">x</text><text x="${X(0) + 4}" y="${Y(hi) + 10}" fill="currentColor">y</text>`
  for (const l of lines) s += `<line x1="${X(lo)}" y1="${Y(l.m * lo + l.b)}" x2="${X(hi)}" y2="${Y(l.m * hi + l.b)}" stroke="currentColor" stroke-width="1.6"/>`
  if (circle) s += `<circle cx="${X(circle.cx)}" cy="${Y(circle.cy)}" r="${+(circle.R * sc).toFixed(1)}" fill="none" stroke="currentColor" stroke-width="1.6"/>`
  for (const p of points) s += `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="3" fill="currentColor"/><text x="${X(p.x) + 5}" y="${Y(p.y) - 5}" fill="currentColor" font-weight="bold">${p.label || ''}</text>`
  return s + '</svg>'
}

// Triangle drawing from three side lengths (a = BC, b = CA, c = AB) with text labels
export function triangleSvg({ a, b, c, sides = {}, angles = {}, right = '', names = { A: 'A', B: 'B', C: 'C' } }) {
  const x = (b * b + c * c - a * a) / (2 * c), y = Math.sqrt(Math.max(b * b - x * x, 0))
  const pts = { A: [0, 0], B: [c, 0], C: [x, y] }
  const xs = [0, c, x], minX = Math.min(...xs), w = Math.max(...xs) - minX, h = y
  const W = 240, H = 170, pad = 24, sc = Math.min((W - 2 * pad) / w, (H - 2 * pad) / h)
  const P = k => [pad + (pts[k][0] - minX) * sc, H - pad - pts[k][1] * sc]
  const A = P('A'), B = P('B'), C = P('C'), G = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3]
  const f = v => +v.toFixed(1)
  const away = (p, d) => { const dx = p[0] - G[0], dy = p[1] - G[1], L = Math.hypot(dx, dy) || 1; return [f(p[0] + dx / L * d), f(p[1] + dy / L * d)] }
  const toward = (p, d) => away(p, -d)
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="sans-serif" font-size="12" fill="currentColor">`
  s += `<polygon points="${[A, B, C].map(p => p.map(f).join(',')).join(' ')}" fill="none" stroke="currentColor" stroke-width="1.6"/>`
  const V = { A, B, C }
  for (const k of ['A', 'B', 'C']) { const q = away(V[k], 12); s += `<text x="${q[0]}" y="${q[1] + 4}" text-anchor="middle" font-weight="bold">${names[k]}</text>` }
  const sideEnds = { a: ['B', 'C'], b: ['C', 'A'], c: ['A', 'B'] }
  for (const [k, label] of Object.entries(sides)) {
    if (!label) continue
    const [p, q] = sideEnds[k].map(n => V[n]), m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], o = away(m, 12)
    s += `<text x="${o[0]}" y="${o[1] + 4}" text-anchor="middle">${label}</text>`
  }
  for (const [k, label] of Object.entries(angles)) { if (!label) continue; const q = toward(V[k], 26); s += `<text x="${q[0]}" y="${q[1] + 4}" text-anchor="middle" font-size="11">${label}</text>` }
  if (right) {
    const v = V[right], others = ['A', 'B', 'C'].filter(n => n !== right).map(n => V[n])
    const u = others.map(o => { const dx = o[0] - v[0], dy = o[1] - v[1], L = Math.hypot(dx, dy); return [dx / L * 9, dy / L * 9] })
    s += `<polyline points="${f(v[0] + u[0][0])},${f(v[1] + u[0][1])} ${f(v[0] + u[0][0] + u[1][0])},${f(v[1] + u[0][1] + u[1][1])} ${f(v[0] + u[1][0])},${f(v[1] + u[1][1])}" fill="none" stroke="currentColor"/>`
  }
  return s + '</svg>'
}

const par = n => (n < 0 ? `(${fmt(n)})` : fmt(n))
const isSquare = n => n >= 0 && Number.isInteger(Math.sqrt(n))
const DEG = Math.PI / 180

// solution set text for a one-variable inequality
const OPS = { '>': '<', '<': '>', '≥': '≤', '≤': '≥' }
const flipOp = op => OPS[op]

// ---------- topics ----------
const topics = [
  {
    slug: 'quadratic-equations',
    grade: 10,
    strand: 'algebra',
    title: 'משוואות ריבועיות — 3–5 יח״ל',
    emoji: '🧮',
    desc: 'תרגול משוואות ריבועיות לכיתה י׳: פירוק לטרינום, מקדם מוביל שונה מ-1 ונוסחת השורשים עם דיסקרימיננטה — שלוש רמות, בדיקה מיידית ודף עבודה להדפסה.',
    intro: 'משוואה ריבועית היא משוואה מהצורה ax² + bx + c = 0 כאשר a ≠ 0. אפשר לפתור אותה בפירוק לגורמים (טרינום) או בנוסחת השורשים x = (−b ± √(b² − 4ac)) / 2a. הביטוי b² − 4ac נקרא דיסקרימיננטה: אם הוא חיובי יש שני פתרונות, אם הוא אפס יש פתרון אחד, ואם הוא שלילי אין פתרון. הנושא נלמד בכל הרמות — 3, 4 ו-5 יח״ל.',
    tips: ['קודם מעבירים את כל האיברים לאגף אחד, כך שבאגף השני יהיה 0.', 'בטרינום x² + bx + c מחפשים שני מספרים שמכפלתם c וסכומם b.', 'לפני נוסחת השורשים כדאי לחשב את הדיסקרימיננטה לבד — זה מונע טעויות סימן.'],
    example: { q: 'פתרו: x² − 5x + 6 = 0', steps: ['מחפשים שני מספרים שמכפלתם 6 וסכומם −5: אלה −2 ו-−3.', '(x − 2)(x − 3) = 0', 'מכפלה שווה לאפס כאשר אחד הגורמים שווה לאפס.'], a: 'x = 2 או x = 3' },
    faq: [
      { q: 'מתי משתמשים בנוסחת השורשים ומתי בפירוק?', a: 'פירוק לגורמים מהיר כשהפתרונות שלמים ופשוטים. נוסחת השורשים עובדת תמיד, ולכן היא הבחירה הבטוחה כשלא רואים פירוק מיד.' },
      { q: 'מה עושים כשהדיסקרימיננטה שלילית?', a: 'אין למשוואה פתרון במספרים ממשיים. בבגרות כותבים "אין פתרון".' },
      { q: 'איך מקלידים שני פתרונות?', a: 'כותבים את שני הפתרונות מופרדים בפסיק, בכל סדר, למשל 2, −3.' },
    ],
    levels: ['טרינום עם מקדם 1', 'מקדם מוביל שונה מ-1', 'נוסחת השורשים ועיגול'],
    gen(level, r) {
      if (level < 3) {
        let r1, r2
        do { r1 = r.int(-9, 9); r2 = r.int(-9, 9) } while (r1 === r2)
        const a = level === 1 ? 1 : r.pick([2, 3, 4, -1, -2, -3])
        const b = -a * (r1 + r2), c = a * r1 * r2
        return {
          q: 'פתרו את המשוואה. הקלידו את כל הפתרונות, מופרדים בפסיק.',
          expr: `${poly([[a, 2], [b, 1], [c, 0]])} = 0`,
          type: 'numbers', answer: [r1, r2],
          explain: `${a !== 1 ? `מחלקים את המשוואה ב-${fmt(a)}: ${poly([[1, 2], [-(r1 + r2), 1], [r1 * r2, 0]])} = 0. ` : ''}מפרקים לגורמים: ${shift(r1)}${shift(r2)} = 0, ולכן x = ${fmt(r1)} או x = ${fmt(r2)}.`,
        }
      }
      let a, b, c, D
      do { a = r.pick([1, 2, 3, -1, -2]); b = r.int(-9, 9); c = r.nz(-9, 9); D = b * b - 4 * a * c } while (D <= 0 || isSquare(D))
      const x1 = round((-b + Math.sqrt(D)) / (2 * a)), x2 = round((-b - Math.sqrt(D)) / (2 * a))
      return {
        q: 'פתרו בעזרת נוסחת השורשים. עגלו כל פתרון ל-2 ספרות אחרי הנקודה והקלידו את שניהם, מופרדים בפסיק.',
        expr: `${poly([[a, 2], [b, 1], [c, 0]])} = 0`,
        type: 'numbers', answer: [x1, x2], tol: 0.01,
        explain: `a = ${fmt(a)}, b = ${fmt(b)}, c = ${fmt(c)}. הדיסקרימיננטה: b² − 4ac = ${D}. x = (${fmt(-b)} ± √${D}) / ${fmt(2 * a)}, ולכן x ≈ ${fmt(x1)} או x ≈ ${fmt(x2)}.`,
      }
    },
  },
  {
    slug: 'linear-systems',
    grade: 10,
    strand: 'algebra',
    title: 'מערכת משוואות בשני נעלמים — 3–5 יח״ל',
    emoji: '⚖️',
    desc: 'מערכת של שתי משוואות ליניאריות בשני נעלמים: שיטת ההצבה ושיטת השוואת מקדמים, משוואות פשוטות ועד מקדמים שליליים — תרגול בשלוש רמות עם פתרון מוסבר.',
    intro: 'מערכת של שתי משוואות ליניאריות בשני נעלמים (x ו-y) פותרים בשתי דרכים עיקריות: שיטת ההצבה — מבודדים נעלם באחת המשוואות ומציבים בשנייה, ושיטת השוואת המקדמים — מכפילים את המשוואות כך שמקדמי אחד הנעלמים יהיו נגדיים ואז מחברים. הפתרון הוא זוג מספרים (x, y) שמקיים את שתי המשוואות יחד, והוא נקודת החיתוך של שני הישרים.',
    tips: ['בחרו לבודד את הנעלם שהמקדם שלו 1 או −1 — כך נמנעים משברים.', 'אחרי שמצאתם נעלם אחד, הציבו אותו באחת המשוואות המקוריות כדי למצוא את השני.', 'בדיקה: הציבו את שני הערכים בשתי המשוואות.'],
    example: { q: 'פתרו: 2x + y = 11 ,  x − y = 1', steps: ['מחברים את המשוואות: 3x = 12, ולכן x = 4.', 'מציבים במשוואה השנייה: 4 − y = 1, ולכן y = 3.'], a: 'x = 4, y = 3' },
    faq: [
      { q: 'מה המשמעות הגרפית של הפתרון?', a: 'כל משוואה מייצגת ישר, והפתרון הוא נקודת החיתוך של שני הישרים. ישרים מקבילים — אין פתרון.' },
      { q: 'איזו שיטה עדיפה?', a: 'כשנעלם כבר מבודד או שהמקדם שלו 1, הצבה נוחה יותר. כשהמקדמים גדולים, השוואת מקדמים לרוב מהירה יותר.' },
    ],
    levels: ['סכום והפרש', 'מקדמים חיוביים', 'מקדמים שליליים'],
    gen(level, r) {
      let a1, b1, a2, b2, x, y
      if (level === 1) { a1 = 1; b1 = 1; a2 = 1; b2 = -1; x = r.int(1, 15); y = r.int(1, 15) } else {
        const R = level === 2 ? [1, 6] : [-9, 9]
        do { a1 = r.nz(...R); b1 = r.nz(...R); a2 = r.nz(...R); b2 = r.nz(...R) } while (a1 * b2 - a2 * b1 === 0 || (level === 3 && a1 > 0 && b1 > 0 && a2 > 0 && b2 > 0))
        x = level === 2 ? r.int(-3, 9) : r.int(-10, 10); y = level === 2 ? r.int(-3, 9) : r.int(-10, 10)
      }
      const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y
      const askX = r.bool()
      return {
        q: `פתרו את מערכת המשוואות. מהו ערך ${askX ? 'x' : 'y'}?`,
        expr: `${terms([[a1, 'x'], [b1, 'y']])} = ${fmt(c1)} ,  ${terms([[a2, 'x'], [b2, 'y']])} = ${fmt(c2)}`,
        type: 'number', answer: askX ? x : y,
        explain: `אפשר לפתור בהצבה או בהשוואת מקדמים. הפתרון: x = ${fmt(x)}, y = ${fmt(y)}. בדיקה במשוואה הראשונה: ${fmt(a1)}·${par(x)} + ${fmt(b1)}·${par(y)} = ${fmt(c1)}.`,
      }
    },
  },
  {
    slug: 'line-parabola-intersection',
    grade: 10,
    strand: 'functions',
    title: 'חיתוך ישר ופרבולה — 3–5 יח״ל',
    emoji: '✂️',
    desc: 'מציאת נקודות החיתוך של ישר ופרבולה: משווים בין הפונקציות, פותרים משוואה ריבועית ומציבים — תרגול לכיתה י׳ בשלוש רמות, עם הסבר מלא לכל שאלה.',
    intro: 'כדי למצוא את נקודות החיתוך של שני גרפים משווים בין הביטויים של y: מקבלים משוואה ריבועית, ופתרונותיה הם שיעורי ה-x של נקודות החיתוך. את שיעורי ה-y מוצאים בהצבה באחת הפונקציות (הכי נוח — בישר). למשוואה עם שני פתרונות מתאימות שתי נקודות חיתוך, לפתרון יחיד — נקודת השקה, ואם אין פתרון — הישר והפרבולה לא נחתכים.',
    tips: ['משווים: ax² + bx + c = mx + k ומעבירים הכול לאגף אחד.', 'את שיעור ה-y מציבים בישר — החישוב קצר יותר.', 'בסוף כותבים כל נקודה כזוג (x, y).'],
    example: { q: 'מצאו את נקודות החיתוך של y = x² − 2x − 3 עם y = x + 1', steps: ['x² − 2x − 3 = x + 1', 'x² − 3x − 4 = 0, כלומר (x − 4)(x + 1) = 0', 'x = 4 → y = 5 ;  x = −1 → y = 0'], a: '(4, 5) ו-(−1, 0)' },
    faq: [
      { q: 'מה אם יש פתרון אחד בלבד?', a: 'אז הישר משיק לפרבולה, ויש ביניהם נקודה משותפת אחת בלבד.' },
      { q: 'צריך לשרטט?', a: 'לא חובה, אבל סקיצה קטנה עוזרת לבדוק שהתשובה הגיונית — למשל שהנקודות באמת נמצאות על הישר.' },
    ],
    levels: ['ישר אופקי', 'ישר משופע', 'מקדם מוביל ≠ 1, שיעורי y'],
    gen(level, r) {
      if (level === 1) {
        const s = r.int(1, 6), c = r.int(-9, 9), k = c + s * s
        return {
          q: 'מצאו את שיעורי ה-x של נקודות החיתוך של הפרבולה והישר. הקלידו את שניהם, מופרדים בפסיק.',
          expr: `y = ${poly([[1, 2], [c, 0]])} ,  y = ${fmt(k)}`,
          type: 'numbers', answer: [s, -s],
          explain: `${poly([[1, 2], [c, 0]])} = ${fmt(k)}, ולכן x² = ${s * s}, כלומר x = ${s} או x = −${s}.`,
        }
      }
      let r1, r2
      do { r1 = r.int(-5, 5); r2 = r.int(-5, 5) } while (r1 === r2)
      const a = level === 2 ? 1 : r.pick([2, 3, -1, -2])
      const m = level === 2 ? r.int(-4, 4) : r.nz(-4, 4), k = r.int(-6, 6)
      // a x² + bx + c − (mx + k) = a(x − r1)(x − r2)
      const b = m - a * (r1 + r2), c = k + a * r1 * r2
      const ys = [m * r1 + k, m * r2 + k]
      const askY = level === 3
      return {
        q: askY ? 'מצאו את נקודות החיתוך של הפרבולה והישר. הקלידו את שיעורי ה-y של שתי הנקודות, מופרדים בפסיק.' : 'מצאו את שיעורי ה-x של נקודות החיתוך של הפרבולה והישר. הקלידו את שניהם, מופרדים בפסיק.',
        expr: `y = ${poly([[a, 2], [b, 1], [c, 0]])} ,  y = ${terms([[m, 'x'], [k, '']])}`,
        type: 'numbers', answer: askY ? ys : [r1, r2],
        explain: `משווים ומעבירים אגפים: ${poly([[a, 2], [a * -(r1 + r2), 1], [a * r1 * r2, 0]])} = 0, ולכן x = ${fmt(r1)} או x = ${fmt(r2)}.${askY ? ` מציבים בישר: y = ${fmt(ys[0])} ו-y = ${fmt(ys[1])}. נקודות החיתוך: ${pt(r1, ys[0])}, ${pt(r2, ys[1])}.` : ''}`,
      }
    },
  },
  {
    slug: 'inequalities',
    grade: 10,
    strand: 'algebra',
    title: 'אי־שוויונים ליניאריים וריבועיים — 3–5 יח״ל',
    emoji: '↔️',
    desc: 'פתרון אי־שוויונים לכיתה י׳: אי־שוויון ממעלה ראשונה, היפוך הסימן בכפל במספר שלילי ואי־שוויון ריבועי בעזרת סקיצה של פרבולה — תרגול בשלוש רמות.',
    intro: 'פותרים אי־שוויון ממעלה ראשונה כמו משוואה, עם כלל אחד חשוב: כשמכפילים או מחלקים את שני האגפים במספר שלילי, הופכים את כיוון סימן אי־השוויון. באי־שוויון ריבועי מוצאים קודם את שורשי הביטוי, משרטטים סקיצה של הפרבולה ובודקים איפה היא מעל ציר ה-x (חיובית) ואיפה מתחתיו (שלילית).',
    tips: ['חילוק במספר שלילי — הופכים את הסימן: −2x > 6 ⟸ x < −3.', 'פרבולה "מחייכת" (a > 0) שלילית בין השורשים וחיובית מחוץ להם.', 'הסימנים ≤ ו-≥ כוללים גם את נקודות הקצה.'],
    example: { q: 'פתרו: x² − x − 6 < 0', steps: ['שורשי הביטוי: x² − x − 6 = (x − 3)(x + 2), כלומר x = 3 ו-x = −2.', 'הפרבולה פתוחה כלפי מעלה, ולכן שלילית בין השורשים.'], a: '−2 < x < 3' },
    faq: [
      { q: 'למה הופכים את הסימן כשמחלקים במספר שלילי?', a: 'כי כפל במספר שלילי הופך את הסדר: 2 < 5, אבל −2 > −5.' },
      { q: 'מה ההבדל בין "או" ל"וגם" בתשובה?', a: 'תחום כמו −2 < x < 3 הוא "וגם" (בין שני המספרים). "x < −2 או x > 3" הם שני תחומים נפרדים מחוץ לשורשים.' },
    ],
    levels: ['מעלה ראשונה, מקדם חיובי', 'משתנה בשני האגפים', 'אי־שוויון ריבועי'],
    gen(level, r) {
      const op = r.pick(['>', '<', '≥', '≤'])
      if (level < 3) {
        let a, c, b, d
        const x0 = r.int(-9, 9)
        if (level === 1) { a = r.int(2, 9); c = 0; b = r.int(-9, 9) } else {
          do { a = r.int(-6, 6); c = r.int(-6, 6) } while (a === c || a === 0 || a - c > 0)
          b = r.int(-9, 9)
        }
        d = (a - c) * x0 + b
        const lhs = terms([[a, 'x'], [b, '']]), rhs = level === 1 ? fmt(d) : terms([[c, 'x'], [d, '']])
        const k = a - c, sol = k > 0 ? op : flipOp(op)
        const ans = `x ${sol} ${fmt(x0)}`
        const naive = (d + b) % k === 0 ? (d + b) / k : x0 + 1
        return {
          q: 'פתרו את אי־השוויון. איזו תשובה נכונה?',
          expr: `${lhs} ${op} ${rhs}`,
          ...choiceQ(r, ans, [`x ${flipOp(sol)} ${fmt(x0)}`, x0 !== 0 ? `x ${sol} ${fmt(-x0)}` : `x ${sol} 1`, `x ${sol} ${fmt(naive)}`, `x ${flipOp(sol)} ${fmt(-x0 || 2)}`, `x ${sol} ${fmt(x0 + 2)}`]),
          explain: `מכנסים איברים: ${terms([[k, 'x']])} ${op} ${fmt(d - b)}. ${k < 0 ? `מחלקים ב-${fmt(k)} (מספר שלילי) ולכן הופכים את הסימן` : `מחלקים ב-${k}`}: ${ans}.`,
        }
      }
      let r1, r2
      do { r1 = r.int(-7, 6); r2 = r.int(-6, 7) } while (r1 >= r2)
      const a = r.pick([1, 1, -1])
      const b = -a * (r1 + r2), c = a * r1 * r2
      const strict = op === '>' || op === '<'
      const lt = strict ? '<' : '≤', gt = strict ? '>' : '≥'
      const positive = op === '>' || op === '≥'
      const outside = positive === (a > 0)
      const between = (p, q, s) => `${fmt(p)} ${s} x ${s} ${fmt(q)}`
      const out = (p, q, s1, s2) => `x ${s1} ${fmt(p)} או x ${s2} ${fmt(q)}`
      const ans = outside ? out(r1, r2, lt, gt) : between(r1, r2, lt)
      const lt2 = strict ? '≤' : '<', gt2 = strict ? '≥' : '>'
      const cands = [outside ? between(r1, r2, lt) : out(r1, r2, lt, gt), outside ? out(r1, r2, lt2, gt2) : between(r1, r2, lt2)]
      if (r1 !== -r2) cands.push(outside ? out(-r2, -r1, lt, gt) : between(-r2, -r1, lt))
      cands.push(outside ? out(r1 - 1, r2 + 1, lt, gt) : between(r1 - 1, r2 + 1, lt))
      return {
        q: 'פתרו את אי־השוויון. איזו תשובה נכונה?',
        expr: `${poly([[a, 2], [b, 1], [c, 0]])} ${op} 0`,
        ...choiceQ(r, ans, cands),
        explain: `שורשי הביטוי: x = ${fmt(r1)} ו-x = ${fmt(r2)}. הפרבולה פתוחה כלפי ${a > 0 ? 'מעלה' : 'מטה'}, ולכן היא ${positive ? 'חיובית' : 'שלילית'} ${outside ? 'מחוץ לשורשים' : 'בין השורשים'}: ${ans}.`,
      }
    },
  },
  {
    slug: 'slope-and-line',
    grade: 10,
    strand: 'functions',
    title: 'שיפוע ומשוואת ישר — 3–5 יח״ל',
    emoji: '📈',
    desc: 'פונקציה קווית ושיפוע: חישוב שיפוע ישר העובר דרך שתי נקודות ומציאת משוואת הישר y = mx + b — תרגול גאומטריה אנליטית לכיתה י׳ עם שרטוט במערכת צירים.',
    intro: 'פונקציה קווית נכתבת בצורה y = mx + b: m הוא השיפוע — בכמה y משתנה כש-x גדל ב-1, ו-b הוא נקודת החיתוך עם ציר ה-y. שיפוע הישר העובר דרך הנקודות (x₁, y₁) ו-(x₂, y₂) הוא m = (y₂ − y₁) / (x₂ − x₁). כדי למצוא את משוואת הישר מציבים את השיפוע ונקודה אחת בנוסחה y − y₁ = m(x − x₁).',
    tips: ['שומרים על אותו סדר נקודות במונה ובמכנה של נוסחת השיפוע.', 'שיפוע חיובי — הישר עולה; שיפוע שלילי — הישר יורד; שיפוע 0 — ישר אופקי.', 'בדיקה: הציבו את הנקודה השנייה במשוואה שקיבלתם.'],
    example: { q: 'מצאו את משוואת הישר העובר דרך A(1, 3) ו-B(4, 9)', steps: ['m = (9 − 3) / (4 − 1) = 6/3 = 2', 'y − 3 = 2(x − 1)', 'y = 2x + 1'], a: 'y = 2x + 1' },
    faq: [
      { q: 'מה השיפוע של ישר אנכי?', a: 'לישר אנכי (x = קבוע) אין שיפוע מוגדר, כי המכנה בנוסחה יוצא 0.' },
      { q: 'איך מוצאים את נקודת החיתוך עם ציר ה-y?', a: 'מציבים x = 0 במשוואת הישר. ב-y = mx + b מקבלים מיד את הנקודה (0, b).' },
    ],
    levels: ['שיפוע שלם', 'שיפוע שבר', 'משוואת הישר'],
    gen(level, r) {
      let x1, y1, x2, y2
      do {
        x1 = r.int(-6, 6); x2 = r.int(-6, 6); y1 = r.int(-6, 6); y2 = r.int(-6, 6)
      } while (x1 === x2 || (level === 1 && (y2 - y1) % (x2 - x1) !== 0) || (level === 2 && (y2 - y1) % (x2 - x1) === 0) || (level === 3 && y1 === y2))
      const dy = y2 - y1, dx = x2 - x1
      const svg = planeSvg({ points: [{ x: x1, y: y1, label: 'A' }, { x: x2, y: y2, label: 'B' }], lines: [{ m: dy / dx, b: y1 - dy / dx * x1 }] })
      const expr = `A${pt(x1, y1)} ,  B${pt(x2, y2)}`
      if (level < 3) {
        return {
          q: 'מהו שיפוע הישר העובר דרך הנקודות A ו-B?' + (level === 2 ? ' כתבו שבר מצומצם.' : ''),
          expr, svg, ...fracAnswer(dy, dx),
          explain: `m = (${fmt(y2)} − ${fmt(y1)}) / (${fmt(x2)} − ${fmt(x1)}) = ${fmt(dy)}/${fmt(dx)} = ${fracText(dy, dx)}.`.replace(/− −/g, '+ '),
        }
      }
      const m = reduce(dy, dx), b = reduce(y1 * dx - dy * x1, dx)
      const ans = lineText(m, b)
      return {
        q: 'איזו מהמשוואות היא משוואת הישר העובר דרך הנקודות A ו-B?',
        expr, svg,
        ...choiceQ(r, ans, [lineText(reduce(dx, dy), b), lineText(m, reduce(y1 * dx + dy * x1, dx)), lineText([-m[0], m[1]], b), lineText(m, [-b[0], b[1]]), lineText(m, [b[0] + b[1], b[1]])]),
        explain: `m = ${fracText(dy, dx)}. מציבים את A: y − ${fmt(y1)} = ${fracText(dy, dx)}(x − ${fmt(x1)}), ומקבלים ${ans}.`.replace(/− −/g, '+ '),
      }
    },
  },
  {
    slug: 'quadratic-function',
    grade: 10,
    strand: 'functions',
    title: 'פונקציה ריבועית: קודקוד וחיתוך עם הצירים — 3–5 יח״ל',
    emoji: '🌈',
    desc: 'הפונקציה הריבועית y = ax² + bx + c: מציאת קודקוד הפרבולה, ערך מינימום או מקסימום ונקודות חיתוך עם ציר x מצורת הקודקוד — תרגול ל-3, 4 ו-5 יח״ל.',
    intro: 'הגרף של פונקציה ריבועית הוא פרבולה. שיעור ה-x של הקודקוד הוא x = −b / 2a, ואת שיעור ה-y מוצאים בהצבה. כאשר a > 0 הפרבולה פתוחה כלפי מעלה והקודקוד הוא נקודת מינימום; כאשר a < 0 היא פתוחה כלפי מטה והקודקוד הוא נקודת מקסימום. בצורת הקודקוד y = a(x − p)² + q הקודקוד הוא פשוט (p, q). מתאים ל-3, 4 ו-5 יח״ל.',
    tips: ['x של הקודקוד = −b / 2a — שימו לב לסימן של b.', 'בצורה a(x − p)² + q: הקודקוד (p, q). שימו לב ש-(x + 2)² פירושו p = −2.', 'חיתוך עם ציר ה-x: מציבים y = 0 ופותרים.'],
    example: { q: 'מצאו את קודקוד הפרבולה y = x² − 6x + 5', steps: ['x = −(−6) / (2·1) = 3', 'y = 3² − 6·3 + 5 = −4'], a: 'הקודקוד (3, −4), נקודת מינימום' },
    faq: [
      { q: 'איך יודעים אם הקודקוד הוא מינימום או מקסימום?', a: 'לפי הסימן של a: חיובי — מינימום (פרבולה "מחייכת"), שלילי — מקסימום.' },
      { q: 'מה הקשר בין הקודקוד לשורשים?', a: 'הקודקוד נמצא בדיוק באמצע בין שני השורשים, כי הפרבולה סימטרית סביב הישר x = p.' },
    ],
    levels: ['x של הקודקוד', 'y של הקודקוד, a ≠ 1', 'חיתוך עם ציר x מצורת קודקוד'],
    gen(level, r) {
      if (level === 1) {
        const p = r.int(-7, 7), c = r.int(-9, 9)
        return {
          q: 'מהו שיעור ה-x של קודקוד הפרבולה?',
          expr: `y = ${poly([[1, 2], [-2 * p, 1], [c, 0]])}`,
          type: 'number', answer: p,
          explain: `x = −b / 2a = ${fmt(2 * p)} / 2 = ${fmt(p)}.`,
        }
      }
      if (level === 2) {
        const a = r.pick([2, 3, -1, -2, -3]), p = r.int(-5, 5), q = r.int(-9, 9)
        const b = -2 * a * p, c = a * p * p + q
        return {
          q: 'מהו שיעור ה-y של קודקוד הפרבולה?',
          expr: `y = ${poly([[a, 2], [b, 1], [c, 0]])}`,
          type: 'number', answer: q,
          explain: `x = −b / 2a = ${fmt(-b)} / ${fmt(2 * a)} = ${fmt(p)}. מציבים: y = ${fmt(q)}. מכיוון ש-a ${a > 0 ? '> 0 זו נקודת מינימום' : '< 0 זו נקודת מקסימום'}.`,
        }
      }
      const a = r.pick([1, 2, -1, -2, 3]), p = r.int(-6, 6), k = r.int(1, 5), q = -a * k * k
      const sq = `${shift(p)}²`
      return {
        q: 'מצאו את שיעורי ה-x של נקודות החיתוך של הפרבולה עם ציר ה-x. הקלידו את שניהם, מופרדים בפסיק.',
        expr: `y = ${a === 1 ? '' : a === -1 ? '−' : fmt(a)}${sq} ${q < 0 ? '−' : '+'} ${Math.abs(q)}`,
        type: 'numbers', answer: [p - k, p + k],
        explain: `מציבים y = 0: ${shift(p)}² = ${k * k}, ולכן x − ${fmt(p)} = ±${k}, כלומר x = ${fmt(p - k)} או x = ${fmt(p + k)}.`.replace('x − −', 'x + '),
      }
    },
  },
  {
    slug: 'distance-midpoint',
    grade: 10,
    strand: 'geometry',
    title: 'אמצע קטע ומרחק בין נקודות — 3–5 יח״ל',
    emoji: '📍',
    desc: 'גאומטריה אנליטית לכיתה י׳: נוסחת אמצע קטע, נוסחת המרחק בין שתי נקודות ומציאת קצה של קטע לפי האמצע — תרגול בשלוש רמות עם מערכת צירים מצוירת.',
    intro: 'בגאומטריה אנליטית מתארים נקודות בעזרת שיעורים. אמצע הקטע AB הוא הממוצע של השיעורים: M = ((x₁ + x₂)/2, (y₁ + y₂)/2). המרחק בין שתי נקודות מחושב לפי משפט פיתגורס: d = √((x₂ − x₁)² + (y₂ − y₁)²). אלה כלים בסיסיים בכל רמות הלימוד (3, 4 ו-5 יח״ל) — לחישוב אורכי צלעות, היקפים ובדיקת סוגי מרובעים.',
    tips: ['באמצע קטע מחברים שיעורים ומחלקים ב-2; במרחק מחסרים ומעלים בריבוע.', 'ההפרש בריבוע תמיד חיובי — לא משנה מאיזו נקודה מתחילים.', 'אם ידוע האמצע M וקצה A, אז B = 2M − A (בכל שיעור בנפרד).'],
    example: { q: 'A(1, 2), B(7, 10). מצאו את אורך AB ואת אמצע הקטע.', steps: ['d = √(6² + 8²) = √100 = 10', 'M = ((1 + 7)/2, (2 + 10)/2) = (4, 6)'], a: 'AB = 10, M(4, 6)' },
    faq: [
      { q: 'האם המרחק יכול לצאת מספר לא שלם?', a: 'בהחלט. לעיתים משאירים אותו כשורש (למשל √20) ולעיתים מעגלים לפי הנדרש בשאלה.' },
      { q: 'איך בודקים שמרובע הוא מקבילית?', a: 'אחת הדרכים: בודקים שהאלכסונים חוצים זה את זה — כלומר לשני האלכסונים יש אותה נקודת אמצע.' },
    ],
    levels: ['אמצע קטע', 'מרחק שלם', 'קצה הקטע / מרחק מעוגל'],
    gen(level, r) {
      if (level === 1) {
        let x1, y1, x2, y2
        do { x1 = r.int(-8, 8); x2 = r.int(-8, 8); y1 = r.int(-8, 8); y2 = r.int(-8, 8) } while ((x1 + x2) % 2 || (y1 + y2) % 2 || (x1 === x2 && y1 === y2))
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2
        return {
          q: 'מהו אמצע הקטע AB?',
          expr: `A${pt(x1, y1)} ,  B${pt(x2, y2)}`,
          svg: planeSvg({ points: [{ x: x1, y: y1, label: 'A' }, { x: x2, y: y2, label: 'B' }] }),
          ...choiceQ(r, pt(mx, my), [pt(my, mx), pt(x1 + x2, y1 + y2), pt((x2 - x1) / 2, (y2 - y1) / 2), pt(mx, -my), pt(-mx, my), pt(mx + 1, my)]),
          explain: `M = ((${fmt(x1)} + ${fmt(x2)})/2, (${fmt(y1)} + ${fmt(y2)})/2) = ${pt(mx, my)}.`,
        }
      }
      if (level === 2 || r.bool()) {
        let dx, dy
        if (level === 2) { const [a, b, s] = r.pick([[3, 4, 1], [3, 4, 2], [6, 8, 1], [5, 12, 1], [8, 6, 1]]);[dx, dy] = r.bool() ? [a * s, b * s] : [b * s, a * s] } else { do { dx = r.int(1, 9); dy = r.int(1, 9) } while (isSquare(dx * dx + dy * dy)) }
        dx *= r.pick([1, -1]); dy *= r.pick([1, -1])
        const x1 = r.int(-5, 5), y1 = r.int(-5, 5), x2 = x1 + dx, y2 = y1 + dy, d2 = dx * dx + dy * dy
        const ans = level === 2 ? Math.sqrt(d2) : round(Math.sqrt(d2))
        return {
          q: `מהו אורך הקטע AB?${level === 3 ? ' עגלו ל-2 ספרות אחרי הנקודה.' : ''}`,
          expr: `A${pt(x1, y1)} ,  B${pt(x2, y2)}`,
          svg: planeSvg({ points: [{ x: x1, y: y1, label: 'A' }, { x: x2, y: y2, label: 'B' }] }),
          type: 'number', answer: ans, ...(level === 3 ? { tol: 0.01 } : {}),
          explain: `d = √((${fmt(dx)})² + (${fmt(dy)})²) = √${d2}${level === 2 ? ` = ${ans}` : ` ≈ ${fmt(ans)}`}.`,
        }
      }
      const x1 = r.int(-6, 6), y1 = r.int(-6, 6)
      let mx, my
      do { mx = r.int(-5, 5); my = r.int(-5, 5) } while (mx === x1 && my === y1)
      const bx = 2 * mx - x1, by = 2 * my - y1
      return {
        q: 'הנקודה M היא אמצע הקטע AB. מהם שיעורי הנקודה B?',
        expr: `A${pt(x1, y1)} ,  M${pt(mx, my)}`,
        svg: planeSvg({ points: [{ x: x1, y: y1, label: 'A' }, { x: mx, y: my, label: 'M' }] }),
        ...choiceQ(r, pt(bx, by), [pt(mx - x1, my - y1), pt(2 * x1 - mx, 2 * y1 - my), pt(mx + x1, my + y1), pt(by, bx), pt(bx, -by)]),
        explain: `B = 2M − A: x = 2·${fmt(mx)} − ${fmt(x1)} = ${fmt(bx)}, y = 2·${fmt(my)} − ${fmt(y1)} = ${fmt(by)}.`.replace(/− −/g, '+ '),
      }
    },
  },
  {
    slug: 'parallel-perpendicular-lines',
    grade: 10,
    strand: 'geometry',
    title: 'ישרים מקבילים וישרים מאונכים — 3–5 יח״ל',
    emoji: '⟂',
    desc: 'ישרים מקבילים ומאונכים בגאומטריה אנליטית: שיפועים שווים, מכפלת שיפועים −1 ומשוואת ישר מאונך דרך נקודה — תרגול לכיתה י׳ בשלוש רמות עם פתרונות.',
    intro: 'שני ישרים (שאינם אנכיים) מקבילים כאשר השיפועים שלהם שווים: m₁ = m₂. הם מאונכים זה לזה כאשר מכפלת השיפועים היא −1: m₁·m₂ = −1, כלומר השיפוע המאונך הוא ההופכי הנגדי (m₂ = −1/m₁). בעזרת שני הכללים ונקודה אחת אפשר למצוא משוואה של ישר מקביל או מאונך. הנושא נלמד בכל הרמות ומשמש במיוחד בשאלות על גבהים, אנכים אמצעיים ומרובעים.',
    tips: ['שיפוע מאונך: הופכים את השבר ומחליפים סימן. ל-2/3 המאונך הוא −3/2.', 'משוואה בצורה ax + by = c: מבודדים את y כדי לראות את השיפוע.', 'ישר מאונך דרך נקודה: y − y₀ = m(x − x₀).'],
    example: { q: 'מצאו את משוואת הישר המאונך ל-y = 2x + 1 העובר דרך (4, 1)', steps: ['השיפוע המאונך: −1/2', 'y − 1 = −½(x − 4)', 'y = −½x + 3'], a: 'y = (−1/2)x + 3' },
    faq: [
      { q: 'מה המאונך לישר אופקי?', a: 'ישר אנכי (x = קבוע). במקרה זה לא משתמשים בכלל מכפלת השיפועים, כי לישר אנכי אין שיפוע.' },
      { q: 'האם ישרים מקבילים יכולים להיות אותו ישר?', a: 'אם גם השיפוע וגם נקודת החיתוך עם ציר ה-y שווים — זה אותו ישר בדיוק (ישרים מתלכדים).' },
    ],
    levels: ['מקבילים, מאונכים או אף אחד', 'שיפוע מאונך', 'משוואת ישר מאונך / מקביל'],
    gen(level, r) {
      const slopes = [[1, 1], [2, 1], [3, 1], [-1, 1], [-2, 1], [-3, 1], [1, 2], [-1, 2], [2, 3], [-2, 3], [3, 2], [-3, 4], [4, 1], [1, 3]]
      if (level === 1) {
        const m1 = r.pick(slopes), kind = r.pick(['par', 'perp', 'none'])
        let m2
        if (kind === 'par') m2 = m1
        else if (kind === 'perp') m2 = reduce(-m1[1], m1[0])
        else { do { m2 = r.pick(slopes) } while ((m2[0] === m1[0] && m2[1] === m1[1]) || m2[0] * m1[0] === -m2[1] * m1[1]) }
        let b1 = r.int(-6, 6), b2
        do { b2 = r.int(-6, 6) } while (b2 === b1)
        const ans = kind === 'par' ? 'מקבילים' : kind === 'perp' ? 'מאונכים' : 'לא מקבילים ולא מאונכים'
        return {
          q: 'מה נכון לגבי שני הישרים?',
          expr: `${lineText(m1, b1)} ,  ${lineText(m2, b2)}`,
          ...choiceQ(r, ans, ['מקבילים', 'מאונכים', 'לא מקבילים ולא מאונכים']),
          explain: `השיפועים: ${fracText(...m1)} ו-${fracText(...m2)}. ${kind === 'par' ? 'השיפועים שווים — הישרים מקבילים.' : kind === 'perp' ? 'מכפלת השיפועים היא −1 — הישרים מאונכים.' : 'השיפועים שונים ומכפלתם אינה −1.'}`,
        }
      }
      if (level === 2) {
        // line given as ax + by = c
        let a, b
        do { a = r.nz(-6, 6); b = r.nz(-6, 6) } while (gcd(a, b) !== 1)
        const c = r.int(-9, 9)
        const m = reduce(-a, b)
        return {
          q: 'מהו השיפוע של ישר המאונך לישר הנתון? כתבו שבר מצומצם או מספר שלם.',
          expr: `${terms([[a, 'x'], [b, 'y']])} = ${fmt(c)}`,
          ...fracAnswer(b, a),
          explain: `מבודדים את y: השיפוע של הישר הנתון הוא ${fracText(...m)}. השיפוע המאונך הוא ההופכי הנגדי: ${fracText(b, a)}.`,
        }
      }
      const m = r.pick(slopes), perp = r.bool(0.7)
      const ms = perp ? reduce(-m[1], m[0]) : m
      let x0, y0
      do { x0 = r.int(-6, 6); y0 = r.int(-6, 6) } while ((ms[0] * x0) % ms[1] !== 0)
      const b0 = r.int(-5, 5)
      const bb = y0 - ms[0] * x0 / ms[1]
      const ans = lineText(ms, bb)
      return {
        q: `איזו משוואה מתארת את הישר ה${perp ? 'מאונך' : 'מקביל'} לישר הנתון ועובר דרך הנקודה P${pt(x0, y0)}?`,
        expr: lineText(m, b0),
        svg: planeSvg({ points: [{ x: x0, y: y0, label: 'P' }], lines: [{ m: m[0] / m[1], b: b0 }] }),
        ...choiceQ(r, ans, [lineText(perp ? m : reduce(-m[1], m[0]), bb), lineText(perp ? reduce(m[1], m[0]) : [-m[0], m[1]], bb), lineText(ms, y0 + ms[0] * x0 / ms[1]), lineText(ms, b0), lineText(ms, bb + 1)]),
        explain: `שיפוע הישר ה${perp ? 'מאונך' : 'מקביל'}: ${fracText(...ms)}. מציבים את P: y − ${fmt(y0)} = ${fracText(...ms)}(x − ${fmt(x0)}), ומקבלים ${ans}.`.replace(/− −/g, '+ '),
      }
    },
  },
  {
    slug: 'right-triangle-trigonometry',
    grade: 10,
    strand: 'trigonometry',
    title: 'טריגונומטריה במשולש ישר זווית — 3–5 יח״ל',
    emoji: '📐',
    desc: 'סינוס, קוסינוס וטנגנס במשולש ישר זווית: חישוב צלע לפי זווית, חישוב זווית לפי שתי צלעות ומשולש שווה שוקיים — תרגול לכיתה י׳ עם שרטוט ועיגול תשובות.',
    intro: 'במשולש ישר זווית מגדירים לכל זווית חדה α: sin α = הניצב שמול הזווית / היתר, cos α = הניצב שליד הזווית / היתר, tan α = הניצב שמול / הניצב שליד. כשידועות זווית וצלע מוצאים צלע אחרת, וכשידועות שתי צלעות מוצאים זווית בעזרת הפונקציות ההפוכות במחשבון (sin⁻¹, cos⁻¹, tan⁻¹). במשולש שווה שוקיים מורידים גובה לבסיס ומקבלים שני משולשים ישרי זווית.',
    tips: ['קודם מזהים: איזו צלע היא היתר (מול הזווית הישרה) ואילו ניצבים "מול" ו"ליד" הזווית.', 'ודאו שהמחשבון במצב מעלות (DEG).', 'הגובה לבסיס במשולש שווה שוקיים חוצה את זווית הראש ואת הבסיס.'],
    example: { q: 'במשולש ABC, ∠C = 90°, AB = 10, ∠A = 30°. מצאו את BC.', steps: ['BC הוא הניצב שמול ∠A, ו-AB הוא היתר.', 'sin 30° = BC / 10', 'BC = 10 · 0.5 = 5'], a: 'BC = 5' },
    faq: [
      { q: 'איך זוכרים מה זה סינוס וקוסינוס?', a: 'סינוס — "מול חלקי יתר"; קוסינוס — "ליד חלקי יתר"; טנגנס — "מול חלקי ליד".' },
      { q: 'למה התשובה שלי שונה מעט?', a: 'כנראה עיגלתם באמצע הדרך. עדיף לשמור את כל הספרות במחשבון ולעגל רק בסוף.' },
    ],
    levels: ['צלע לפי זווית ויתר', 'זווית לפי שתי צלעות', 'משולש שווה שוקיים'],
    gen(level, r) {
      if (level === 1) {
        const c = r.int(5, 20), al = r.int(15, 75), opp = r.bool()
        const a = c * Math.sin(al * DEG), b = c * Math.cos(al * DEG)
        const ans = round(opp ? a : b)
        return {
          q: `במשולש ABC הזווית C ישרה. מצאו את אורך ${opp ? 'BC' : 'AC'}. עגלו ל-2 ספרות אחרי הנקודה.`,
          expr: `AB = ${c} ,  ∠A = ${al}° ,  ${opp ? 'BC' : 'AC'} = ?`,
          svg: triangleSvg({ a, b, c, sides: { c: String(c), [opp ? 'a' : 'b']: '?' }, angles: { A: `${al}°` }, right: 'C' }),
          type: 'number', answer: ans, tol: 0.01,
          explain: `${opp ? `BC הוא הניצב שמול ∠A: BC = AB · sin ${al}°` : `AC הוא הניצב שליד ∠A: AC = AB · cos ${al}°`} = ${c} · ${round(opp ? Math.sin(al * DEG) : Math.cos(al * DEG), 4)} ≈ ${fmt(ans)}.`,
        }
      }
      if (level === 2) {
        const mode = r.pick(['tan', 'sin', 'cos'])
        let a, b, c
        if (mode === 'tan') { a = r.int(3, 15); b = r.int(3, 15); c = Math.hypot(a, b) } else { c = r.int(8, 20); a = r.int(2, c - 1); b = Math.sqrt(c * c - a * a) }
        const al = Math.atan2(a, b) / DEG, ans = round(al, 1)
        const given = mode === 'tan' ? `BC = ${a} ,  AC = ${b}` : mode === 'sin' ? `BC = ${a} ,  AB = ${c}` : `AC = ${a} ,  AB = ${c}`
        const ang = mode === 'cos' ? Math.acos(a / c) / DEG : al
        const ans2 = round(ang, 1)
        const sides = mode === 'tan' ? { a: String(a), b: String(b) } : mode === 'sin' ? { a: String(a), c: String(c) } : { b: String(a), c: String(c) }
        const [sa, sb] = mode === 'cos' ? [b, a] : [a, b]
        return {
          q: 'במשולש ABC הזווית C ישרה. מצאו את גודל הזווית A במעלות. עגלו לספרה אחת אחרי הנקודה.',
          expr: `${given} ,  ∠A = ?`,
          svg: triangleSvg({ a: sa, b: sb, c, sides, angles: { A: '?' }, right: 'C' }),
          type: 'number', answer: mode === 'cos' ? ans2 : ans, tol: 0.1, unit: '°',
          explain: mode === 'tan' ? `tan A = BC / AC = ${a}/${b}, ולכן ∠A ≈ ${fmt(ans)}°.` : mode === 'sin' ? `sin A = BC / AB = ${a}/${c}, ולכן ∠A ≈ ${fmt(ans)}°.` : `cos A = AC / AB = ${a}/${c}, ולכן ∠A ≈ ${fmt(ans2)}°.`,
        }
      }
      const s = r.int(5, 18), th = r.int(20, 140), ask = r.pick(['base', 'height', 'area'])
      const half = th / 2 * DEG
      const base = 2 * s * Math.sin(half), h = s * Math.cos(half), area = 0.5 * s * s * Math.sin(th * DEG)
      const val = round(ask === 'base' ? base : ask === 'height' ? h : area)
      return {
        q: `משולש ABC הוא משולש שווה שוקיים (AB = AC). מצאו את ${ask === 'base' ? 'אורך הבסיס BC' : ask === 'height' ? 'אורך הגובה לבסיס BC' : 'שטח המשולש'}. עגלו ל-2 ספרות אחרי הנקודה.`,
        expr: `AB = AC = ${s} ,  ∠A = ${th}°`,
        svg: triangleSvg({ a: s, b: s, c: base, names: { A: 'B', B: 'C', C: 'A' }, sides: { a: String(s), b: String(s), c: ask === 'base' ? '?' : '' }, angles: { C: `${th}°` } }),
        type: 'number', answer: val, tol: 0.01, ...(ask === 'area' ? { unit: 'יח״ר' } : {}),
        explain: ask === 'area' ? `שטח = ½ · AB · AC · sin A = ½ · ${s}² · sin ${th}° ≈ ${fmt(val)}.` : `הגובה לבסיס חוצה את זווית הראש: במשולש ישר הזווית שנוצר הזווית היא ${th / 2}°. ${ask === 'base' ? `חצי בסיס = ${s} · sin ${th / 2}°, ולכן BC = 2 · ${s} · sin ${th / 2}° ≈ ${fmt(val)}.` : `הגובה = ${s} · cos ${th / 2}° ≈ ${fmt(val)}.`}`,
      }
    },
  },
  {
    slug: 'probability',
    grade: 10,
    strand: 'probability',
    title: 'הסתברות — 3–5 יח״ל',
    emoji: '🎲',
    desc: 'תרגול הסתברות לכיתה י׳: ניסוי פשוט עם כדורים וקובייה, שתי קוביות ומאורעות בלתי תלויים והוצאה בלי החזרה — שלוש רמות עם תשובה כשבר מצומצם והסבר מלא.',
    intro: 'כשכל התוצאות של ניסוי שוות הסתברות, ההסתברות של מאורע היא מספר התוצאות המתאימות חלקי מספר כל התוצאות האפשריות. בניסוי בשני שלבים בלתי תלויים כופלים את ההסתברויות של כל שלב. בהוצאה בלי החזרה ההסתברות בשלב השני משתנה, כי בשקית נשאר כדור אחד פחות — כאן עוזר מאוד עץ הסתברות. הנושא נלמד ב-3, 4 ו-5 יח״ל.',
    tips: ['הסתברות היא תמיד מספר בין 0 ל-1.', 'בשתי קוביות יש 36 תוצאות שוות הסתברות — כדאי לכתוב טבלה 6×6.', 'בלי החזרה: בשלב השני גם המונה וגם המכנה קטנים ב-1 (אם הוצאנו כדור מאותו סוג).'],
    example: { q: 'בשקית 3 כדורים אדומים ו-5 כחולים. מוציאים שני כדורים בלי החזרה. מה ההסתברות ששניהם אדומים?', steps: ['בשלב הראשון: 3/8', 'בשלב השני נשארו 2 אדומים מתוך 7: 2/7', 'כופלים: 3/8 · 2/7 = 6/56'], a: '3/28' },
    faq: [
      { q: 'מתי כופלים ומתי מחברים?', a: 'כופלים לאורך ענף בעץ (שלב ראשון וגם שלב שני). מחברים בין ענפים שונים שמובילים לאותו מאורע.' },
      { q: 'מה ההבדל בין עם החזרה לבלי החזרה?', a: 'עם החזרה ההרכב בשקית לא משתנה, ולכן השלבים בלתי תלויים. בלי החזרה ההרכב משתנה אחרי כל הוצאה.' },
    ],
    levels: ['ניסוי פשוט', 'שתי קוביות / עם החזרה', 'בלי החזרה'],
    gen(level, r) {
      const C = [['אדומים', 'אדום'], ['כחולים', 'כחול'], ['ירוקים', 'ירוק']]
      if (level === 1) {
        if (r.bool()) {
          const n = [r.int(1, 9), r.int(1, 9), r.int(1, 9)], k = r.int(0, 2), tot = n[0] + n[1] + n[2]
          return {
            q: `בשקית ${n[0]} כדורים אדומים, ${n[1]} כדורים כחולים ו-${n[2]} כדורים ירוקים. מוציאים כדור אחד באקראי. מה ההסתברות שהכדור ${C[k][1]}? כתבו שבר מצומצם.`,
            ...fracAnswer(n[k], tot),
            explain: `יש ${tot} כדורים, מהם ${n[k]} ${C[k][0]}: ${n[k]}/${tot} = ${fracText(n[k], tot)}.`,
          }
        }
        const kind = r.pick(['even', 'gt', 'div3'])
        const k = r.int(1, 5)
        const fav = kind === 'even' ? 3 : kind === 'gt' ? 6 - k : 2
        return {
          q: `מטילים קובייה הוגנת פעם אחת. מה ההסתברות לקבל ${kind === 'even' ? 'מספר זוגי' : kind === 'gt' ? `מספר גדול מ-${k}` : 'מספר שמתחלק ב-3'}? כתבו שבר מצומצם.`,
          ...fracAnswer(fav, 6),
          explain: `יש 6 תוצאות אפשריות, מהן ${fav} מתאימות: ${fav}/6 = ${fracText(fav, 6)}.`,
        }
      }
      if (level === 2) {
        if (r.bool()) {
          const s = r.int(2, 12), atLeast = r.bool()
          let fav = 0
          for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (atLeast ? i + j >= s : i + j === s) fav++
          return {
            q: `מטילים שתי קוביות הוגנות. מה ההסתברות שסכום המספרים ${atLeast ? `יהיה לפחות ${s}` : `יהיה ${s}`}? כתבו שבר מצומצם.`,
            ...fracAnswer(fav, 36),
            explain: `יש 36 תוצאות שוות הסתברות; ${fav} מהן מתאימות: ${fav}/36 = ${fracText(fav, 36)}.`,
          }
        }
        const a = r.int(1, 8), b = r.int(1, 8), tot = a + b, same = r.bool()
        return {
          q: `בשקית ${a} כדורים אדומים ו-${b} כדורים כחולים. מוציאים כדור, רושמים את צבעו ומחזירים אותו לשקית, ואז מוציאים כדור שני. מה ההסתברות ש${same ? 'שני הכדורים אדומים' : 'הכדור הראשון אדום והשני כחול'}? כתבו שבר מצומצם.`,
          ...fracAnswer(same ? a * a : a * b, tot * tot),
          explain: `עם החזרה השלבים בלתי תלויים: ${same ? `${a}/${tot} · ${a}/${tot}` : `${a}/${tot} · ${b}/${tot}`} = ${fracText(same ? a * a : a * b, tot * tot)}.`,
        }
      }
      const a = r.int(2, 9), b = r.int(2, 9), tot = a + b, kind = r.pick(['both', 'mixed', 'none'])
      const [n, d] = kind === 'both' ? [a * (a - 1), tot * (tot - 1)] : kind === 'none' ? [b * (b - 1), tot * (tot - 1)] : [2 * a * b, tot * (tot - 1)]
      return {
        q: `בשקית ${a} כדורים אדומים ו-${b} כדורים כחולים. מוציאים באקראי שני כדורים, בזה אחר זה, בלי החזרה. מה ההסתברות ש${kind === 'both' ? 'שני הכדורים אדומים' : kind === 'none' ? 'אף אחד מהכדורים אינו אדום' : 'יוצא כדור אחד מכל צבע'}? כתבו שבר מצומצם.`,
        ...fracAnswer(n, d),
        explain: kind === 'both' ? `${a}/${tot} · ${a - 1}/${tot - 1} = ${fracText(n, d)}.` : kind === 'none' ? `שני הכדורים כחולים: ${b}/${tot} · ${b - 1}/${tot - 1} = ${fracText(n, d)}.` : `אדום ואז כחול או כחול ואז אדום: ${a}/${tot} · ${b}/${tot - 1} + ${b}/${tot} · ${a}/${tot - 1} = ${fracText(n, d)}.`,
      }
    },
  },
  {
    slug: 'statistics',
    grade: 10,
    strand: 'data',
    title: 'סטטיסטיקה: ממוצע, חציון וסטיית תקן — 3 יח״ל',
    emoji: '📊',
    desc: 'סטטיסטיקה לבגרות 3 יח״ל: ממוצע וחציון של רשימת נתונים, ממוצע וחציון מטבלת שכיחויות וחישוב סטיית תקן — תרגול בשלוש רמות עם הסבר לכל שלב בחישוב.',
    intro: 'מדדי מרכז מתארים ערך "טיפוסי": הממוצע הוא סכום הנתונים חלקי מספרם, החציון הוא הנתון האמצעי אחרי סידור מהקטן לגדול, והשכיח הוא הנתון שמופיע הכי הרבה פעמים. סטיית התקן מודדת פיזור — עד כמה הנתונים רחוקים בממוצע מהממוצע: σ = √(Σ(xᵢ − x̄)² / n). בטבלת שכיחויות כופלים כל ערך בשכיחות שלו. הנושא שייך בעיקר לתוכנית של 3 יח״ל.',
    tips: ['לחציון חייבים קודם לסדר את הנתונים.', 'במספר זוגי של נתונים החציון הוא ממוצע שני האמצעיים.', 'סטיית תקן: מחסרים את הממוצע מכל נתון, מעלים בריבוע, מחשבים ממוצע ומוציאים שורש.'],
    example: { q: 'חשבו ממוצע וסטיית תקן של: 2, 4, 6, 8', steps: ['ממוצע: 20 / 4 = 5', 'סטיות בריבוע: 9, 1, 1, 9 — הסכום 20', 'σ = √(20 / 4) = √5 ≈ 2.24'], a: 'x̄ = 5, σ ≈ 2.24' },
    faq: [
      { q: 'מתי החציון מתאים יותר מהממוצע?', a: 'כשיש ערכים חריגים — למשל משכורות. ערך קיצוני אחד מזיז את הממוצע הרבה, אבל כמעט לא משנה את החציון.' },
      { q: 'מה המשמעות של סטיית תקן 0?', a: 'כל הנתונים שווים זה לזה — אין פיזור בכלל.' },
    ],
    levels: ['ממוצע או חציון', 'טבלת שכיחויות', 'סטיית תקן'],
    gen(level, r) {
      if (level === 1) {
        const askMean = r.bool()
        const n = askMean ? r.int(4, 7) : r.pick([5, 7, 9])
        let xs
        do { xs = Array.from({ length: n }, () => r.int(1, 30)) } while (askMean && xs.reduce((s, v) => s + v, 0) % n)
        const sorted = [...xs].sort((a, b) => a - b), sum = xs.reduce((s, v) => s + v, 0)
        return {
          q: `מהו ${askMean ? 'הממוצע' : 'החציון'} של הנתונים?`,
          expr: xs.join(', '),
          type: 'number', answer: askMean ? sum / n : sorted[(n - 1) / 2],
          explain: askMean ? `סכום הנתונים ${sum}, מספר הנתונים ${n}: ${sum} / ${n} = ${sum / n}.` : `מסדרים: ${sorted.join(', ')}. הנתון האמצעי הוא ${sorted[(n - 1) / 2]}.`,
        }
      }
      if (level === 2) {
        const start = r.int(1, 6), k = r.int(4, 5)
        const vals = Array.from({ length: k }, (_, i) => start + i)
        const fr = vals.map(() => r.int(1, 9))
        const N = fr.reduce((s, v) => s + v, 0), S = vals.reduce((s, v, i) => s + v * fr[i], 0)
        const askMean = r.bool()
        const at = idx => { let c = 0; for (let i = 0; i < k; i++) { c += fr[i]; if (idx < c) return vals[i] } }
        const med = N % 2 ? at((N - 1) / 2) : (at(N / 2 - 1) + at(N / 2)) / 2
        const W = 240, cw = (W - 70) / k
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 64" width="${W}" height="64" font-family="sans-serif" font-size="13" fill="currentColor"><rect x="1" y="1" width="${W - 2}" height="62" fill="none" stroke="currentColor"/><line x1="1" y1="32" x2="${W - 1}" y2="32" stroke="currentColor"/><line x1="${W - 69}" y1="1" x2="${W - 69}" y2="63" stroke="currentColor"/>`
        svg += `<text x="${W - 35}" y="21" text-anchor="middle">ערך</text><text x="${W - 35}" y="52" text-anchor="middle">שכיחות</text>`
        vals.forEach((v, i) => { const x = W - 69 - cw * (i + 0.5); svg += `<text x="${x.toFixed(1)}" y="21" text-anchor="middle">${v}</text>` })
        fr.forEach((v, i) => { const x = W - 69 - cw * (i + 0.5); svg += `<text x="${x.toFixed(1)}" y="52" text-anchor="middle">${v}</text>` })
        svg += '</svg>'
        return {
          q: `בטבלה מוצגת התפלגות של מספר הספרים שקראו תלמידי שכבה בחופש. מהו ${askMean ? 'הממוצע? עגלו ל-2 ספרות אחרי הנקודה.' : 'החציון?'}`,
          svg,
          type: 'number', answer: askMean ? round(S / N) : med, ...(askMean ? { tol: 0.01 } : {}),
          explain: askMean ? `ממוצע = Σ(ערך · שכיחות) / Σשכיחויות = ${S} / ${N} ≈ ${fmt(round(S / N))}.` : `יש ${N} נתונים. ${N % 2 ? `הנתון האמצעי הוא במקום ה-${(N + 1) / 2}` : `שני האמצעיים הם במקומות ${N / 2} ו-${N / 2 + 1}`}, ולפי השכיחויות המצטברות החציון הוא ${fmt(med)}.`,
        }
      }
      const n = r.int(4, 6)
      let xs
      do { xs = Array.from({ length: n }, () => r.int(1, 20)) } while (xs.reduce((s, v) => s + v, 0) % n || new Set(xs).size === 1)
      const mean = xs.reduce((s, v) => s + v, 0) / n, ss = xs.reduce((s, v) => s + (v - mean) ** 2, 0)
      const sd = round(Math.sqrt(ss / n))
      return {
        q: 'מהי סטיית התקן של הנתונים? עגלו ל-2 ספרות אחרי הנקודה.',
        expr: xs.join(', '),
        type: 'number', answer: sd, tol: 0.01,
        explain: `ממוצע: ${mean}. סכום ריבועי הסטיות: ${ss}. σ = √(${ss} / ${n}) ≈ ${fmt(sd)}.`,
      }
    },
  },
  {
    slug: 'exponents-roots',
    grade: 10,
    strand: 'algebra',
    title: 'חוקי חזקות ושורשים — 4–5 יח״ל',
    emoji: '⚡',
    desc: 'חוקי חזקות לכיתה י׳: כפל וחילוק חזקות עם בסיס זהה, חזקה עם מעריך שלילי ומעריך שבור (שורשים) — תרגול בשלוש רמות, הכנה לפונקציות מעריכיות ול-4–5 יח״ל.',
    intro: 'חוקי החזקות: aᵐ · aⁿ = aᵐ⁺ⁿ, aᵐ : aⁿ = aᵐ⁻ⁿ, (aᵐ)ⁿ = aᵐⁿ. מעריך שלילי פירושו הופכי: a⁻ⁿ = 1/aⁿ, ומעריך אפס נותן 1. מעריך שבור הוא שורש: a^(m/n) הוא השורש מסדר n של aᵐ — למשל 8^(2/3) = (∛8)² = 4. חוקים אלה הם בסיס לפונקציות מעריכיות ולוגריתמים ב-4 וב-5 יח״ל.',
    tips: ['בכפל מחברים מעריכים, בחילוק מחסרים — רק כשהבסיס זהה.', 'חזקה שלילית של שבר: הופכים את השבר ומעלים בחזקה החיובית.', 'במעריך שבור עדיף להוציא קודם שורש ואז להעלות בחזקה — המספרים קטנים יותר.'],
    example: { q: 'חשבו: 16^(3/4)', steps: ['השורש הרביעי של 16 הוא 2.', '2³ = 8'], a: '8' },
    faq: [
      { q: 'למה a⁰ = 1?', a: 'כי aⁿ : aⁿ = 1, ולפי חוק החילוק זה גם aⁿ⁻ⁿ = a⁰.' },
      { q: 'האם (−8)^(1/3) מוגדר?', a: 'שורש שלישי של מספר שלילי קיים (−2), אבל בתיכון מגדירים חזקה עם מעריך שבור רק לבסיס חיובי, כדי למנוע סתירות.' },
    ],
    levels: ['כפל וחילוק חזקות', 'מעריך שלילי', 'מעריך שבור'],
    gen(level, r) {
      if (level === 1) {
        const a = r.pick([2, 3, 5, 10]), e = r.int(0, a === 2 ? 6 : a === 3 ? 4 : 3)
        const m2 = r.int(2, 3), n2 = r.int(2, 4), k2 = m2 * n2 - e
        if (r.bool() && k2 >= 1) return {
          q: 'חשבו את ערך הביטוי.',
          expr: `(${a}${sup(m2)})${sup(n2)} ÷ ${a}${sup(k2)}`,
          type: 'number', answer: a ** e,
          explain: `(${a}${sup(m2)})${sup(n2)} = ${a}${sup(m2 * n2)} (כופלים מעריכים), ובחילוק מחסרים: ${a}${sup(m2 * n2 - k2)} = ${a ** e}.`,
        }
        const m = r.int(Math.max(2, e), 9), n = r.int(2, 9), k = m + n - e
        return {
          q: 'חשבו את ערך הביטוי.',
          expr: `${a}${sup(m)} · ${a}${sup(n)} ÷ ${a}${sup(k)}`,
          type: 'number', answer: a ** e,
          explain: `בכפל מחברים מעריכים ובחילוק מחסרים: ${m} + ${n} − ${k} = ${e}, ולכן ${a}${sup(e)} = ${a ** e}.`,
        }
      }
      if (level === 2) {
        if (r.bool()) {
          const a = r.pick([2, 3, 4, 5, 10]), n = r.int(1, a <= 3 ? 4 : 2)
          return { q: 'חשבו. כתבו שבר מצומצם.', expr: `${a}${sup(-n)}`, ...fracAnswer(1, a ** n), explain: `${a}${sup(-n)} = 1/${a}${sup(n)} = 1/${a ** n}.` }
        }
        let p, q
        do { p = r.int(1, 5); q = r.int(2, 5) } while (gcd(p, q) !== 1)
        const n = r.int(1, 3)
        return { q: 'חשבו. כתבו שבר מצומצם או מספר שלם.', expr: `(${p}/${q})${sup(-n)}`, ...fracAnswer(q ** n, p ** n), explain: `הופכים את השבר: (${q}/${p})${sup(n)} = ${q ** n}/${p ** n}.` }
      }
      const [root, n] = r.pick([[2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [2, 3], [3, 3], [4, 3], [5, 3], [2, 4], [3, 4], [2, 5]])
      let m
      do { m = r.int(1, 4) } while (gcd(m, n) !== 1 || root ** m > 1000)
      const base = root ** n, neg = r.bool(0.35)
      return {
        q: `חשבו את ערך הביטוי.${neg ? ' כתבו שבר מצומצם.' : ''}`,
        expr: `${base}^(${neg ? '−' : ''}${m}/${n})`,
        ...(neg ? fracAnswer(1, root ** m) : { type: 'number', answer: root ** m }),
        explain: `השורש מסדר ${n} של ${base} הוא ${root}, ו-${root}${sup(m)} = ${root ** m}${neg ? `. המעריך שלילי, ולכן התשובה היא ההופכי: 1/${root ** m}` : ''}.`,
      }
    },
  },
]

export default topics
