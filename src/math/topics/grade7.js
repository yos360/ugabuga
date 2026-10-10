// Grade 7 (כיתה ז׳) math topics — Israeli middle-school curriculum: directed numbers, order of
// operations, algebraic expressions, first-degree equations, ratio & percent, angles, triangles,
// the coordinate plane and areas of polygons. The small helpers below are shared with grades 8–9.

// ---------- shared helpers (grades 7–9) ----------
export const MINUS = '−'
const rnd = (x, p = 1e6) => Math.round(x * p) / p
export const fmt = n => { const v = rnd(n) + 0; return v < 0 ? MINUS + String(-v) : String(v) }
// operand that is not first in an expression: negatives go in parentheses
export const par = n => (n < 0 ? `(${fmt(n)})` : fmt(n))
export const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a }
// answer fraction 'a/b' (ASCII minus) or integer string
export const frac = (n, d) => { if (d < 0) { n = -n; d = -d } const g = gcd(n, d) || 1; n /= g; d /= g; return d === 1 ? String(n + 0) : `${n}/${d}` }
export const fracShow = (n, d) => frac(n, d).replace('-', MINUS)

// [[coef, monomial], ...] → '3x² − 2x + 5' (zero terms skipped, coefficient 1 hidden)
export function terms(list) {
  let out = ''
  for (const [c, m] of list) {
    if (!c) continue
    const abs = Math.abs(c)
    const body = m ? (abs === 1 ? m : fmt(abs) + m) : fmt(abs)
    if (!out) out = (c < 0 ? MINUS : '') + body
    else out += (c < 0 ? ' − ' : ' + ') + body
  }
  return out || '0'
}
export const lin = (a, b, v = 'x') => terms([[a, v], [b, '']])
export const quad = (a, b, c, v = 'x') => terms([[a, v + '²'], [b, v], [c, '']])
export const pt = (x, y) => `(${fmt(x)}, ${fmt(y)})`
// signed constant inside parentheses: x + 3 / x − 3
export const xpm = (k, v = 'x') => (k === 0 ? v : `${v} ${k < 0 ? '−' : '+'} ${fmt(Math.abs(k))}`)

// The answer plus unique distractors (skipping empties/duplicates), shuffled.
export function choiceSet(r, answer, cands, n = 4) {
  const key = s => String(s).replace(/\s+/g, '')
  const seen = new Set([key(answer)])
  const out = [answer]
  for (const c of cands) {
    if (out.length >= n) break
    if (c === '' || c == null || /undefined|NaN/.test(String(c))) continue
    const k = key(c)
    if (!seen.has(k)) { seen.add(k); out.push(String(c)) }
  }
  return r.shuffle(out)
}

// ---------- SVG helpers ----------
const f1 = x => String(Math.round(x * 10) / 10)
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
export const svgWrap = (w, h, body, label = 'שרטוט') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f1(w)} ${f1(h)}" width="${f1(w)}" height="${f1(h)}" role="img" aria-label="${label}" font-family="Arial, sans-serif">${body}</svg>`
export const svgText = (x, y, s, { size = 14, bold = true, fill = 'currentColor' } = {}) =>
  `<text x="${f1(x)}" y="${f1(y)}" font-size="${size}" text-anchor="middle" dominant-baseline="middle" fill="${fill}"${bold ? ' font-weight="700"' : ''} direction="ltr">${esc(s)}</text>`
export const svgLine = (a, b, { w = 2, dash = false, color = 'currentColor' } = {}) =>
  `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"${dash ? ' stroke-dasharray="5 4"' : ''}/>`
export const svgPoly = (pts, fill = '#7dd3fc') =>
  `<polygon points="${pts.map(p => f1(p[0]) + ',' + f1(p[1])).join(' ')}" fill="${fill}" fill-opacity=".35" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>`
const ACCENT = '#d33'

// Map math-coordinate points (y up) into a box; returns { P, w, h, s }.
export function fit(points, maxW = 240, maxH = 170, pad = 26) {
  const xs = points.map(p => p[0]), ys = points.map(p => p[1])
  const minx = Math.min(...xs), maxx = Math.max(...xs), miny = Math.min(...ys), maxy = Math.max(...ys)
  const bw = Math.max(maxx - minx, 1e-6), bh = Math.max(maxy - miny, 1e-6)
  const s = Math.min((maxW - 2 * pad) / bw, (maxH - 2 * pad) / bh)
  return { P: points.map(([x, y]) => [pad + (x - minx) * s, pad + (maxy - y) * s]), w: bw * s + 2 * pad, h: bh * s + 2 * pad, s }
}
const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l] }

// Triangle (or any polygon) in screen coords with vertex names, angle labels (inside, along the
// bisector), side labels (side i joins P[i] and P[i+1], label outside) and an optional right-angle mark.
export function polySvg(P, w, h, { names = [], angles = [], sides = [], right = -1, extra = '', fill = '#7dd3fc' } = {}) {
  const n = P.length
  const cx = P.reduce((s, p) => s + p[0], 0) / n, cy = P.reduce((s, p) => s + p[1], 0) / n
  let body = svgPoly(P, fill)
  for (let i = 0; i < n; i++) {
    const p = P[i], u = unit(p, P[(i + 1) % n]), v = unit(p, P[(i + n - 1) % n])
    let bx = u[0] + v[0], by = u[1] + v[1]
    const bl = Math.hypot(bx, by) || 1
    bx /= bl; by /= bl
    // make sure the bisector points into the polygon (towards the centroid side)
    if (bx * (cx - p[0]) + by * (cy - p[1]) < 0) { bx = -bx; by = -by }
    if (names[i]) body += svgText(p[0] - bx * 13, p[1] - by * 13, names[i], { size: 13 })
    if (i === right) {
      const a = [p[0] + u[0] * 12, p[1] + u[1] * 12], b = [p[0] + v[0] * 12, p[1] + v[1] * 12], c = [a[0] + v[0] * 12, a[1] + v[1] * 12]
      body += `<path d="M${f1(a[0])},${f1(a[1])} L${f1(c[0])},${f1(c[1])} L${f1(b[0])},${f1(b[1])}" fill="none" stroke="currentColor" stroke-width="1.5"/>`
    }
    if (angles[i]) {
      const half = Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1]))) / 2
      const d = Math.min(46, 17 / Math.max(Math.sin(half), 0.2))
      body += svgText(p[0] + bx * d, p[1] + by * d, angles[i], { size: 12, fill: angles[i].includes('?') ? ACCENT : 'currentColor' })
    }
  }
  sides.forEach((lab, i) => {
    if (!lab) return
    const a = P[i], b = P[(i + 1) % n], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2
    let nx = -(b[1] - a[1]), ny = b[0] - a[0]
    const l = Math.hypot(nx, ny) || 1
    nx /= l; ny /= l
    if (nx * (mx - cx) + ny * (my - cy) < 0) { nx = -nx; ny = -ny }
    body += svgText(mx + nx * 14, my + ny * 14, lab, { size: 13, fill: lab.includes('?') ? ACCENT : 'currentColor' })
  })
  return svgWrap(w, h, body + extra)
}

// Triangle from its angles at the three vertices (degrees), base on the bottom.
export function triangleFromAngles(A, B, C, opts = {}, box = [240, 170]) {
  const rad = d => (d * Math.PI) / 180
  // B at origin, C at (1, 0), A above
  const c = Math.sin(rad(C)) / Math.sin(rad(A))
  const pts = [[c * Math.cos(rad(B)), c * Math.sin(rad(B))], [0, 0], [1, 0]]
  const { P, w, h } = fit(pts, box[0], box[1])
  return { P, w, h, svg: polySvg(P, w, h, opts) }
}

// Square grid with axes from −m..m, optional points and polygon (coordinates in grid units).
export function gridSvg(m, { points = [], polygon = null } = {}) {
  const s = Math.floor(208 / (2 * m)), pad = 14, W = 2 * m * s + 2 * pad
  const X = x => pad + (x + m) * s, Y = y => pad + (m - y) * s
  let body = ''
  for (let i = -m; i <= m; i++) {
    body += svgLine([X(i), Y(-m)], [X(i), Y(m)], { w: i === 0 ? 2 : 0.6, color: i === 0 ? 'currentColor' : '#b8bfcc' })
    body += svgLine([X(-m), Y(i)], [X(m), Y(i)], { w: i === 0 ? 2 : 0.6, color: i === 0 ? 'currentColor' : '#b8bfcc' })
  }
  body += svgText(X(m) - 4, Y(0) - 9, 'x', { size: 12 }) + svgText(X(0) + 9, Y(m) + 4, 'y', { size: 12 })
  for (let i = -m; i <= m; i++) {
    if (i === 0 || i % (m > 6 ? 2 : 1)) continue
    body += svgText(X(i), Y(0) + 9, fmt(i), { size: 8, bold: false }) + svgText(X(0) - 8, Y(i), fmt(i), { size: 8, bold: false })
  }
  if (polygon) body += svgPoly(polygon.map(([x, y]) => [X(x), Y(y)]), '#ffd23f')
  for (const p of points) {
    body += `<circle cx="${f1(X(p[0]))}" cy="${f1(Y(p[1]))}" r="4" fill="${ACCENT}"/>`
    if (p[2]) body += svgText(X(p[0]) + (p[0] >= 0 ? 10 : -10), Y(p[1]) - 9, p[2], { size: 12, fill: ACCENT })
  }
  return svgWrap(W, W, body, 'מערכת צירים')
}

// Two lines crossing at a point: one horizontal, one at `alpha` degrees. labels for the 4 angles,
// counter-clockwise from the right-upper one: [α, 180−α, α, 180−α].
export function crossingSvg(alpha, labels) {
  alpha = Math.max(40, Math.min(140, alpha)) // keep narrow angles readable (sketch, not to scale)
  const cx = 120, cy = 85, R = 80, rad = d => (d * Math.PI) / 180
  const pt2 = (deg, r) => [cx + r * Math.cos(rad(deg)), cy - r * Math.sin(rad(deg))]
  let body = svgLine(pt2(0, 110), pt2(180, 110), { w: 2.5 }) + svgLine(pt2(alpha, R), pt2(alpha + 180, R), { w: 2.5 })
  const mids = [alpha / 2, (alpha + 180) / 2, 180 + alpha / 2, (alpha + 540) / 2]
  mids.forEach((m, i) => {
    if (!labels[i]) return
    const span = i % 2 ? 180 - alpha : alpha
    const long = labels[i].length > 4
    const [x, y] = pt2(m, span < 60 ? (long ? 66 : 52) : long ? 44 : 34)
    body += svgText(x, y, labels[i], { size: 13, fill: labels[i].includes('?') ? ACCENT : 'currentColor' })
  })
  body += `<circle cx="${cx}" cy="${cy}" r="3" fill="currentColor"/>`
  return svgWrap(240, 170, body, 'ישרים נחתכים')
}

// ---------- topics ----------
const sumExpr = nums => nums.map((n, i) => (i === 0 ? fmt(n) : n < 0 ? `+ (${fmt(n)})` : `+ ${fmt(n)}`)).join(' ')

const directedAddSub = {
  slug: 'directed-numbers-add-sub',
  grade: 7,
  strand: 'arithmetic',
  title: 'חיבור וחיסור מספרים מכוונים',
  emoji: '➕',
  desc: 'תרגול חיבור וחיסור של מספרים מכוונים (חיוביים ושליליים) לכיתה ז׳: מינוס ועוד מינוס, חיסור מספר שלילי, ישר המספרים ודף עבודה להדפסה.',
  intro: 'מספרים מכוונים הם מספרים עם סימן: חיוביים (מימין לאפס על ישר המספרים) ושליליים (משמאל לאפס). חיבור מספר חיובי מזיז אותנו ימינה על ישר המספרים, וחיבור מספר שלילי מזיז שמאלה. חיסור של מספר שווה לחיבור של המספר הנגדי לו, ולכן חיסור מספר שלילי מגדיל את התוצאה.',
  tips: ['חיסור = חיבור הנגדי: 5 − (−3) = 5 + 3 = 8.', 'שני מספרים בעלי אותו סימן: מחברים את הערכים המוחלטים ושומרים על הסימן.', 'סימנים שונים: מחסרים את הערכים המוחלטים ולוקחים את הסימן של המספר שערכו המוחלט גדול יותר.'],
  example: { q: 'חשבו: −7 − (−12) + (−4)', steps: ['−7 − (−12) = −7 + 12 = 5', '5 + (−4) = 5 − 4 = 1'], a: '1' },
  faq: [
    { q: 'כמה זה מינוס ועוד מינוס?', a: 'חיבור של שני מספרים שליליים נותן מספר שלילי: מחברים את הערכים המוחלטים ושמים מינוס. למשל −3 + (−5) = −8.' },
    { q: 'למה חיסור של מספר שלילי הוא כמו חיבור?', a: 'כי חיסור הוא חיבור של המספר הנגדי, והנגדי של מספר שלילי הוא חיובי: 4 − (−6) = 4 + 6 = 10.' },
  ],
  levels: ['שני מספרים בין −10 ל-10', 'שלושה מספרים עד 50', 'שרשרת חיבור וחיסור עד 100'],
  gen(level, r) {
    const R = [10, 50, 100][level - 1]
    const n = level === 1 ? 2 : level === 2 ? 3 : 4
    const nums = [r.nz(-R, R)]
    const ops = []
    let total = nums[0]
    for (let i = 1; i < n; i++) {
      let v = r.nz(-R, R)
      if (level === 1 && nums[0] > 0 && v > 0 && r.bool(0.7)) v = -v
      const op = r.pick(['+', '−'])
      nums.push(v); ops.push(op)
      total += op === '+' ? v : -v
    }
    let expr = fmt(nums[0])
    for (let i = 1; i < n; i++) expr += ` ${ops[i - 1]} ${par(nums[i])}`
    return { q: 'חשבו:', expr: `${expr} = ?`, type: 'number', answer: total, explain: `חיסור מספר הוא חיבור הנגדי לו: ${sumExpr(nums.map((v, i) => (i && ops[i - 1] === '−' ? -v : v)))} = ${fmt(total)}` }
  },
}

const directedMulDiv = {
  slug: 'directed-numbers-mul-div',
  grade: 7,
  strand: 'arithmetic',
  title: 'כפל וחילוק מספרים מכוונים',
  emoji: '✖️',
  desc: 'כפל וחילוק במספרים מכוונים לכיתה ז׳: חוקי הסימנים (מינוס כפול מינוס), חזקה של מספר שלילי ותרגילים בשלוש רמות קושי עם פתרונות ודף להדפסה.',
  intro: 'בכפל ובחילוק של מספרים מכוונים קובעים קודם את הסימן ואחר כך מחשבים את הערכים המוחלטים. מכפלה או מנה של שני מספרים בעלי אותו סימן היא חיובית, ושל מספרים בעלי סימנים שונים היא שלילית. כשכופלים כמה גורמים, סופרים את הגורמים השליליים: מספר זוגי שלהם נותן תוצאה חיובית ומספר אי־זוגי נותן תוצאה שלילית.',
  tips: ['(−) × (−) = (+), (−) × (+) = (−), ואותו דבר בחילוק.', 'מספר זוגי של גורמים שליליים ← תוצאה חיובית; אי־זוגי ← שלילית.', '(−2)³ = −8 אבל (−2)² = 4: חזקה זוגית של מספר שלילי חיובית.'],
  example: { q: 'חשבו: (−6) × 4 ÷ (−3)', steps: ['(−6) × 4 = −24', '−24 ÷ (−3) = 8 (שני שליליים ← חיובי)'], a: '8' },
  faq: [
    { q: 'למה מינוס כפול מינוס זה פלוס?', a: 'כפל במספר שלילי הופך את הכיוון על ישר המספרים. הפיכה פעמיים מחזירה לכיוון החיובי, ולכן (−3) × (−4) = 12.' },
    { q: 'מה ההבדל בין −3² ל-(−3)²?', a: 'ב-(−3)² מעלים בריבוע את −3 ומקבלים 9. ב-−3² מעלים בריבוע רק את 3 ושמים מינוס לפני התוצאה, כלומר −9.' },
  ],
  levels: ['כפל של שני מספרים', 'חילוק וכפל של שלושה גורמים', 'כפל, חילוק וחזקות'],
  gen(level, r) {
    if (level === 1) {
      const a = r.nz(-10, 10), b = r.nz(-10, 10)
      return { q: 'חשבו:', expr: `${par(a)} × ${par(b)} = ?`, type: 'number', answer: a * b, explain: `${a * b < 0 ? 'סימנים שונים ← תוצאה שלילית' : 'אותו סימן ← תוצאה חיובית'}: ${fmt(a * b)}` }
    }
    if (level === 2) {
      if (r.bool()) {
        const b = r.nz(-12, 12), q = r.nz(-12, 12), a = b * q
        return { q: 'חשבו:', expr: `${fmt(a)} ÷ ${par(b)} = ?`, type: 'number', answer: q, explain: `${fmt(Math.abs(a))} ÷ ${fmt(Math.abs(b))} = ${fmt(Math.abs(q))}, ו${q < 0 ? 'הסימנים שונים ולכן התוצאה שלילית' : 'הסימנים זהים ולכן התוצאה חיובית'}: ${fmt(q)}` }
      }
      const a = r.nz(-6, 6), b = r.nz(-6, 6), c = r.nz(-6, 6)
      const neg = [a, b, c].filter(v => v < 0).length
      return { q: 'חשבו:', expr: `${par(a)} × ${par(b)} × ${par(c)} = ?`, type: 'number', answer: a * b * c, explain: `יש ${neg} גורמים שליליים (${neg % 2 ? 'אי־זוגי ← שלילי' : 'זוגי ← חיובי'}): ${fmt(a * b * c)}` }
    }
    if (r.bool()) {
      const base = r.pick([-1, -2, -3, -4, -5, -10]), e = base === -1 ? r.int(3, 9) : base === -10 ? r.int(2, 4) : Math.abs(base) >= 4 ? r.int(2, 3) : r.int(2, 4)
      const sup = { 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }[e]
      const k = r.pick([-3, -2, 2, 3])
      const ans = k * base ** e
      return { q: 'חשבו:', expr: `${par(k)} × (${fmt(base)})${sup} = ?`, type: 'number', answer: ans, explain: `(${fmt(base)})${sup} = ${fmt(base ** e)} (מעריך ${e % 2 ? 'אי־זוגי ← שלילי' : 'זוגי ← חיובי'}), ואז ${fmt(k)} × ${par(base ** e)} = ${fmt(ans)}` }
    }
    const b = r.nz(-9, 9), c = r.nz(-9, 9), q = r.nz(-6, 6), a = q * c
    const ans = (a * b) / c
    return { q: 'חשבו משמאל לימין:', expr: `${fmt(a)} × ${par(b)} ÷ ${par(c)} = ?`, type: 'number', answer: ans, explain: `${fmt(a)} × ${par(b)} = ${fmt(a * b)}, ואז ${fmt(a * b)} ÷ ${par(c)} = ${fmt(ans)}` }
  },
}

const orderOfOps = {
  slug: 'order-of-operations',
  grade: 7,
  strand: 'arithmetic',
  title: 'סדר פעולות חשבון',
  emoji: '🧮',
  desc: 'סדר פעולות חשבון לכיתה ז׳: סוגריים, חזקות, כפל וחילוק ואז חיבור וחיסור — כולל מספרים שליליים. תרגול בשלוש רמות, פתרון מוסבר ודף עבודה.',
  intro: 'כשבתרגיל יש כמה פעולות, מחשבים לפי סדר קבוע: קודם מה שבתוך הסוגריים, אחר כך חזקות, אחר כך כפל וחילוק משמאל לימין, ובסוף חיבור וחיסור משמאל לימין. הסדר הזה מבטיח שלכל תרגיל יש תוצאה אחת בלבד. בכיתה ז׳ מוסיפים לסדר הפעולות גם מספרים שליליים וחזקות.',
  tips: ['סוגריים ← חזקות ← כפל וחילוק ← חיבור וחיסור.', 'כפל וחילוק באותה דרגה: מחשבים משמאל לימין. כך גם חיבור וחיסור.', 'כדאי לסמן בכל שלב רק את הפעולה שמחשבים ולהעתיק את כל השאר.'],
  example: { q: 'חשבו: 20 − 3 × (4 − 6)²', steps: ['סוגריים: 4 − 6 = −2', 'חזקה: (−2)² = 4', 'כפל: 3 × 4 = 12', 'חיסור: 20 − 12 = 8'], a: '8' },
  faq: [
    { q: 'האם כפל תמיד בא לפני חילוק?', a: 'לא. כפל וחילוק הם באותה דרגה, ולכן מחשבים אותם לפי הסדר שבו הם מופיעים, משמאל לימין. כך גם חיבור וחיסור.' },
    { q: 'מה עושים כשיש סוגריים בתוך סוגריים?', a: 'מתחילים מהסוגריים הפנימיים ביותר ויוצאים החוצה בהדרגה.' },
  ],
  levels: ['כפל או חילוק עם חיבור וחיסור', 'סוגריים ומספרים שליליים', 'חזקות, סוגריים ושליליים'],
  gen(level, r) {
    if (level === 1) {
      const a = r.int(2, 30), b = r.int(2, 9), c = r.int(2, 9)
      if (r.bool()) {
        const op = r.pick(['+', '−'])
        const ans = op === '+' ? a + b * c : a - b * c
        return { q: 'חשבו לפי סדר פעולות החשבון:', expr: `${a} ${op} ${b} × ${c} = ?`, type: 'number', answer: ans, explain: `קודם כפל: ${b} × ${c} = ${b * c}, ואז ${a} ${op} ${b * c} = ${fmt(ans)}` }
      }
      const d = b * c
      const ans = d / b + a
      return { q: 'חשבו לפי סדר פעולות החשבון:', expr: `${a} + ${d} ÷ ${b} = ?`, type: 'number', answer: ans, explain: `קודם חילוק: ${d} ÷ ${b} = ${c}, ואז ${a} + ${c} = ${ans}` }
    }
    if (level === 2) {
      const a = r.nz(-9, 9), b = r.nz(-9, 9), c = r.nz(-6, 6), d = r.nz(-20, 20)
      if (r.bool()) {
        const ans = (a - b) * c + d
        return { q: 'חשבו:', expr: `(${fmt(a)} − ${par(b)}) × ${par(c)} + ${par(d)} = ?`, type: 'number', answer: ans, explain: `סוגריים: ${fmt(a)} − ${par(b)} = ${fmt(a - b)}; כפל: ${par(a - b)} × ${par(c)} = ${fmt((a - b) * c)}; חיבור: ${fmt((a - b) * c)} + ${par(d)} = ${fmt(ans)}` }
      }
      const e = b * c
      const ans = d - e / b
      return { q: 'חשבו:', expr: `${fmt(d)} − ${par(e)} ÷ ${par(b)} = ?`, type: 'number', answer: ans, explain: `קודם חילוק: ${par(e)} ÷ ${par(b)} = ${fmt(c)}, ואז ${fmt(d)} − ${par(c)} = ${fmt(ans)}` }
    }
    const a = r.int(2, 6), b = r.nz(-5, 5), c = r.nz(-5, 5), d = r.nz(-4, 4), e = r.int(-30, 30)
    if (r.bool()) {
      const ans = e - a * (b - c) ** 2
      return { q: 'חשבו:', expr: `${fmt(e)} − ${a} × (${fmt(b)} − ${par(c)})² = ?`, type: 'number', answer: ans, explain: `סוגריים: ${fmt(b - c)}; חזקה: ${par(b - c)}² = ${(b - c) ** 2}; כפל: ${a} × ${(b - c) ** 2} = ${a * (b - c) ** 2}; חיסור: ${fmt(e)} − ${a * (b - c) ** 2} = ${fmt(ans)}` }
    }
    const ans = (d ** 2 - b) * c + e
    return { q: 'חשבו:', expr: `(${par(d)}² − ${par(b)}) × ${par(c)} + ${par(e)} = ?`, type: 'number', answer: ans, explain: `חזקה: ${par(d)}² = ${d * d}; סוגריים: ${d * d} − ${par(b)} = ${fmt(d * d - b)}; כפל: ${fmt(d * d - b)} × ${par(c)} = ${fmt((d * d - b) * c)}; חיבור: ${fmt(ans)}` }
  },
}

const substitution = {
  slug: 'algebraic-substitution',
  grade: 7,
  strand: 'algebra',
  title: 'הצבה בביטוי אלגברי',
  emoji: '🔤',
  desc: 'הצבה בביטויים אלגבריים לכיתה ז׳: מציבים מספר במקום המשתנה ומחשבים לפי סדר פעולות — גם עם מספרים שליליים, שני משתנים וחזקות. תרגול ודף עבודה.',
  intro: 'ביטוי אלגברי הוא ביטוי שיש בו משתנים (אותיות) לצד מספרים, למשל 3x + 5. כדי לחשב את ערך הביטוי מציבים מספר במקום המשתנה ומחשבים לפי סדר פעולות החשבון. כשמציבים מספר שלילי, כדאי לעטוף אותו בסוגריים כדי לא לטעות בסימנים.',
  tips: ['3x פירושו 3 כפול x.', 'מציבים מספר שלילי בתוך סוגריים: אם x = −2 אז 3x = 3 × (−2).', 'x² עם x = −3 שווה (−3)² = 9.'],
  example: { q: 'חשבו את ערך הביטוי 2x² − 5x + 1 עבור x = −2', steps: ['2 × (−2)² − 5 × (−2) + 1', '2 × 4 + 10 + 1', '8 + 10 + 1 = 19'], a: '19' },
  faq: [
    { q: 'מה ההבדל בין 2x ל-x²?', a: '2x הוא x + x (פעמיים x), ואילו x² הוא x כפול x. למשל עבור x = 5: ‏2x = 10 אבל x² = 25.' },
    { q: 'למה שמים סוגריים כשמציבים מספר שלילי?', a: 'כדי שהמינוס יישאר חלק מהמספר. בלי סוגריים קל לטעות ולחשב −3² = −9 במקום (−3)² = 9.' },
  ],
  levels: ['ax + b עם מספרים חיוביים', 'שני משתנים ומספרים שליליים', 'ביטוי עם x² וערך שלילי'],
  gen(level, r) {
    if (level === 1) {
      const a = r.int(2, 9), b = r.int(1, 20), x = r.int(1, 10), op = r.pick(['+', '−'])
      const ans = op === '+' ? a * x + b : a * x - b
      return { q: `חשבו את ערך הביטוי עבור x = ${x}:`, expr: `${a}x ${op} ${b}`, type: 'number', answer: ans, explain: `${a} × ${x} ${op} ${b} = ${a * x} ${op} ${b} = ${fmt(ans)}` }
    }
    if (level === 2) {
      const a = r.nz(-6, 6), b = r.nz(-6, 6), x = r.nz(-8, 8), y = r.nz(-8, 8)
      const ans = a * x + b * y
      return { q: `חשבו את ערך הביטוי עבור x = ${fmt(x)} ו-y = ${fmt(y)}:`, expr: terms([[a, 'x'], [b, 'y']]), type: 'number', answer: ans, explain: `${fmt(a)} × ${par(x)} + ${par(b)} × ${par(y)} = ${fmt(a * x)} + ${par(b * y)} = ${fmt(ans)}` }
    }
    const a = r.nz(-3, 3), b = r.nz(-9, 9), c = r.int(-10, 10), x = r.nz(-5, -1)
    const ans = a * x * x + b * x + c
    return { q: `חשבו את ערך הביטוי עבור x = ${fmt(x)}:`, expr: quad(a, b, c), type: 'number', answer: ans, explain: `${fmt(a)} × (${fmt(x)})² + ${par(b)} × (${fmt(x)})${c ? ` + ${par(c)}` : ''} = ${fmt(a * x * x)} + ${par(b * x)}${c ? ` + ${par(c)}` : ''} = ${fmt(ans)}` }
  },
}

const likeTerms = {
  slug: 'like-terms',
  grade: 7,
  strand: 'algebra',
  title: 'כינוס איברים דומים',
  emoji: '🧩',
  desc: 'כינוס איברים דומים ופישוט ביטויים אלגבריים לכיתה ז׳: חיבור איברים עם אותו משתנה, שני משתנים ומינוס לפני סוגריים. תרגול אמריקאי עם פתרון מלא.',
  intro: 'איברים דומים הם איברים שיש להם אותו חלק אותי, למשל 3x ו-−5x, או 2y ו-y. כדי לפשט ביטוי מחברים את המקדמים של האיברים הדומים בלבד: 3x − 5x = −2x. איברים שאינם דומים, כמו x ו-y או x ומספר חופשי, נשארים נפרדים.',
  tips: ['מסדרים את האיברים לפי סוג: איברי x, איברי y ומספרים חופשיים.', 'x לבדו פירושו 1x, ו-−x פירושו −1x.', 'מינוס לפני סוגריים הופך את הסימן של כל איבר בתוכם: −(2x − 3) = −2x + 3.'],
  example: { q: 'פשטו: 5x − 3 − (2x − 7)', steps: ['פותחים סוגריים: 5x − 3 − 2x + 7', 'מכנסים: (5x − 2x) + (−3 + 7)', '3x + 4'], a: '3x + 4' },
  faq: [
    { q: 'אפשר לחבר 3x ו-2?', a: 'לא. 3x ו-2 אינם איברים דומים, ולכן הביטוי 3x + 2 כבר מפושט.' },
    { q: 'האם x ו-x² הם איברים דומים?', a: 'לא. לאיברים דומים צריך להיות אותו משתנה באותה חזקה, ולכן x ו-x² נשארים נפרדים.' },
  ],
  levels: ['משתנה אחד ומספר', 'שני משתנים', 'מינוס לפני סוגריים'],
  gen(level, r) {
    let shown, ax, ay = 0, c, how
    if (level === 1) {
      const a = r.nz(-9, 9), b = r.nz(-9, 9), k = r.nz(-15, 15)
      shown = `${terms([[a, 'x'], [k, '']])} ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? 'x' : Math.abs(b) + 'x'}`
      ax = a + b; c = k
      how = `מכנסים את איברי x: ${fmt(a)}x ${b < 0 ? '−' : '+'} ${Math.abs(b)}x = ${fmt(ax)}x`
    } else if (level === 2) {
      const a = r.nz(-8, 8), b = r.nz(-8, 8), d = r.nz(-8, 8), e = r.nz(-8, 8)
      shown = terms([[a, 'x'], [b, 'y']]) + ` ${d < 0 ? '−' : '+'} ${Math.abs(d) === 1 ? '' : Math.abs(d)}x ${e < 0 ? '−' : '+'} ${Math.abs(e) === 1 ? '' : Math.abs(e)}y`
      ax = a + d; ay = b + e; c = 0
      how = `איברי x: ${fmt(a)} ${d < 0 ? '−' : '+'} ${Math.abs(d)} = ${fmt(ax)}; איברי y: ${fmt(b)} ${e < 0 ? '−' : '+'} ${Math.abs(e)} = ${fmt(ay)}`
    } else {
      const a = r.nz(-9, 9), k = r.nz(-12, 12), b = r.nz(-9, 9), m = r.nz(-12, 12)
      shown = `${lin(a, k)} − (${lin(b, m)})`
      ax = a - b; c = k - m
      how = `מינוס לפני סוגריים הופך את הסימנים בתוכם: −(${lin(b, m)}) = ${terms([[-b, 'x'], [-m, '']])}`
    }
    const mk = (x, y, k) => terms([[x, 'x'], [y, 'y'], [k, '']])
    const answer = mk(ax, ay, c)
    const cands = level === 2
      ? [mk(ax, -ay, c), mk(-ax, ay, c), mk(ay, ax, c), mk(-ax, -ay, c), mk(ax + 2, ay, c), mk(ax, ay - 2, c)]
      : [mk(ax, 0, -c), mk(-ax, 0, c), mk(ax + c, 0, 0), mk(ax + 2, 0, c), mk(ax, 0, c + 2), mk(ax - 2, 0, -c)]
    return { q: 'פשטו את הביטוי (כנסו איברים דומים):', expr: shown, type: 'choice', answer, choices: choiceSet(r, answer, cands), explain: `${how}. התוצאה: ${answer}` }
  },
}

const linearEquations = {
  slug: 'linear-equations',
  grade: 7,
  strand: 'algebra',
  title: 'משוואות ממעלה ראשונה',
  emoji: '⚖️',
  desc: 'פתרון משוואות ממעלה ראשונה עם נעלם אחד לכיתה ז׳: העברת אגפים, נעלם בשני האגפים וסוגריים. מחולל תרגילים אינסופי עם פתרון מפורט ודף להדפסה.',
  intro: 'משוואה ממעלה ראשונה היא שוויון שבו הנעלם x מופיע בחזקה ראשונה, למשל 3x − 5 = 16. פותרים אותה בעזרת פעולות שקולות — פעולות שעושים על שני האגפים בבת אחת ואינן משנות את הפתרון: מוסיפים או מחסרים אותו מספר, וכופלים או מחלקים באותו מספר השונה מאפס. המטרה היא לבודד את x באגף אחד.',
  tips: ['קודם מעבירים את איברי x לאגף אחד ואת המספרים לאגף השני.', 'בסוף מחלקים במקדם של x.', 'בדיקה: מציבים את הפתרון במשוואה המקורית ובודקים ששני האגפים שווים.'],
  example: { q: 'פתרו: 5x + 3 = 2x − 9', steps: ['מחסרים 2x משני האגפים: 3x + 3 = −9', 'מחסרים 3: 3x = −12', 'מחלקים ב-3: x = −4'], a: 'x = −4' },
  faq: [
    { q: 'מה זה פעולה שקולה?', a: 'פעולה שעושים על שני אגפי המשוואה ואינה משנה את קבוצת הפתרונות: חיבור או חיסור של אותו ביטוי, או כפל וחילוק באותו מספר השונה מאפס.' },
    { q: 'איך בודקים שהפתרון נכון?', a: 'מציבים את הערך שמצאתם במקום x בשני האגפים. אם מתקבל אותו מספר בשני הצדדים — הפתרון נכון.' },
  ],
  levels: ['ax + b = c', 'נעלם בשני האגפים', 'משוואות עם סוגריים'],
  gen(level, r) {
    if (level === 1) {
      const x = r.int(-6, 12), a = r.int(2, 9), b = r.nz(-20, 20), c = a * x + b
      return { q: 'פתרו את המשוואה:', expr: `${lin(a, b)} = ${fmt(c)}`, type: 'number', answer: x, explain: `${a}x = ${fmt(c)} ${b > 0 ? '−' : '+'} ${Math.abs(b)} = ${fmt(a * x)}, ולכן x = ${fmt(a * x)} ÷ ${a} = ${fmt(x)}` }
    }
    if (level === 2) {
      const x = r.nz(-12, 12), a = r.nz(-9, 9)
      let c = r.nz(-9, 9)
      if (c === a) c = a + (a < 9 ? 1 : -1)
      if (c === 0) c = 2
      const b = r.int(-20, 20), d = (a - c) * x + b
      return { q: 'פתרו את המשוואה:', expr: `${lin(a, b)} = ${lin(c, d)}`, type: 'number', answer: x, explain: `מעבירים אגפים: ${terms([[a - c, 'x']])} = ${fmt(d - b)}, ולכן x = ${fmt(d - b)} ÷ ${par(a - c)} = ${fmt(x)}` }
    }
    const x = r.nz(-10, 10), a = r.int(2, 6), b = r.nz(-8, 8), k = r.int(0, 15)
    let d = r.nz(-6, 6)
    if (d === a) d = -a
    const e = a * (x + b) - k - d * x
    const left = `${a}(${xpm(b)})${k ? ` − ${k}` : ''}`
    return { q: 'פתרו את המשוואה:', expr: `${left} = ${lin(d, e)}`, type: 'number', answer: x, explain: `פותחים סוגריים: ${lin(a, a * b - k)} = ${lin(d, e)}; מעבירים אגפים: ${terms([[a - d, 'x']])} = ${fmt(e - a * b + k)}; x = ${fmt(x)}` }
  },
}

const ratio = {
  slug: 'ratio-proportion',
  grade: 7,
  strand: 'arithmetic',
  title: 'יחס ופרופורציה',
  emoji: '⚖️',
  desc: 'יחס ופרופורציה לכיתה ז׳: חלוקה לפי יחס נתון, פתרון פרופורציה, יחס בין שלושה גדלים וקנה מידה במפה. בעיות מילוליות עם פתרון מוסבר ודף עבודה.',
  intro: 'יחס משווה בין שני גדלים (או יותר) בעזרת חילוק, למשל 3:5. פרופורציה היא שוויון בין שני יחסים, כמו 3/5 = 12/20, ואפשר לפתור אותה בכפל בהצלבה. כשמחלקים כמות לפי יחס a:b, מחלקים אותה ל-a + b חלקים שווים ונותנים לכל צד את מספר החלקים שלו.',
  tips: ['חלוקה ביחס 3:5 ← סך הכול 8 חלקים; כל חלק = הכמות ÷ 8.', 'בפרופורציה a/b = x/c מקבלים x = a × c ÷ b.', 'קנה מידה 1:50,000 פירושו ש-1 ס״מ במפה הוא 50,000 ס״מ (חצי קילומטר) במציאות.'],
  example: { q: 'דנה ויואב חילקו 56 מדבקות ביחס 3:4. כמה מדבקות קיבלה דנה?', steps: ['3 + 4 = 7 חלקים', 'חלק אחד: 56 ÷ 7 = 8', 'דנה: 3 × 8 = 24'], a: '24' },
  faq: [
    { q: 'מה ההבדל בין יחס לשבר?', a: 'יחס משווה בין שני חלקים (למשל בנים לבנות 2:3), ואילו שבר מתאר חלק מהשלם (הבנים הם 2/5 מהכיתה). אפשר לעבור מאחד לשני.' },
    { q: 'איך פותרים פרופורציה?', a: 'כופלים בהצלבה: אם a/b = x/c אז b × x = a × c, ומחלקים ב-b.' },
  ],
  levels: ['חלוקה לפי יחס', 'פרופורציה', 'שלושה חלקים וקנה מידה'],
  gen(level, r) {
    const NAMES = [['נועה', 'איתי'], ['מאיה', 'עומר'], ['תמר', 'יונתן'], ['שירה', 'אורי'], ['הילה', 'נדב']]
    if (level === 1) {
      const [n1, n2] = r.pick(NAMES)
      let a = r.int(1, 7), b = r.int(1, 9)
      if (a === b) b = a + 1
      const g = gcd(a, b); a /= g; b /= g
      const k = r.int(2, 12), total = k * (a + b), who = r.bool()
      const ans = (who ? a : b) * k
      const item = r.pick(['קלפים', 'סוכריות', 'שקלים', 'גולות'])
      return { q: `${n1} ו${n2} חילקו ביניהם ${total} ${item} ביחס ${a}:${b} (${n1}:${n2}). כמה ${item} ${who ? 'קיבלה ' + n1 : 'קיבל ' + n2}?`, type: 'number', answer: ans, explain: `${a} + ${b} = ${a + b} חלקים; חלק אחד = ${total} ÷ ${a + b} = ${k}; ${who ? n1 : n2}: ${who ? a : b} × ${k} = ${ans}` }
    }
    if (level === 2) {
      let a = r.int(1, 9), b = r.int(2, 12)
      if (a === b) b++
      const k = r.int(2, 9), c = b * k, x = a * k
      return { q: 'פתרו את הפרופורציה:', expr: `${a}/${b} = x/${c}`, type: 'number', answer: x, explain: `כפל בהצלבה: ${b}x = ${a} × ${c} = ${a * c}, ולכן x = ${a * c} ÷ ${b} = ${x}` }
    }
    if (r.bool()) {
      const scale = r.pick([10000, 20000, 25000, 50000, 100000, 200000]), cm = r.int(2, 12)
      const km = (cm * scale) / 100000
      return { q: `במפה בקנה מידה 1:${scale.toLocaleString('en-US')} המרחק בין שני יישובים הוא ${cm} ס״מ. מהו המרחק במציאות בקילומטרים?`, type: 'number', answer: km, unit: 'ק״מ', explain: `${cm} × ${scale.toLocaleString('en-US')} = ${(cm * scale).toLocaleString('en-US')} ס״מ = ${fmt(km)} ק״מ (בקילומטר יש 100,000 ס״מ)` }
    }
    let a = r.int(1, 5), b = r.int(1, 6), c = r.int(2, 7)
    while (b === a) b++
    while (c === a || c === b) c++
    const k = r.int(2, 10), diff = Math.abs(c - a) * k
    const big = c > a
    return { q: `שלושה אחים חילקו כסף ביחס ${a}:${b}:${c}. השלישי קיבל ${diff} ₪ ${big ? 'יותר' : 'פחות'} מהראשון. כמה כסף חולק בסך הכול?`, type: 'number', answer: (a + b + c) * k, unit: '₪', explain: `ההפרש בין השלישי לראשון הוא ${Math.abs(c - a)} חלקים = ${diff} ₪, ולכן חלק אחד = ${k} ₪. סך הכול ${a + b + c} חלקים × ${k} = ${(a + b + c) * k} ₪` }
  },
}

const percent = {
  slug: 'percent',
  grade: 7,
  strand: 'arithmetic',
  title: 'אחוזים',
  emoji: '💯',
  desc: 'תרגול אחוזים לכיתה ז׳: חישוב אחוז מכמות, כמה אחוזים מהווה מספר, הנחה והתייקרות ומציאת השלם מתוך חלק. בעיות מילוליות עם פתרון ודף להדפסה.',
  intro: 'אחוז הוא חלק אחד ממאה: 25% הם 25/100, כלומר רבע. כדי לחשב אחוז מכמות כופלים את הכמות במספר האחוזים ומחלקים ב-100. כדי לבדוק כמה אחוזים מהווה חלק מהשלם, מחלקים את החלק בשלם וכופלים ב-100. הנחה של 20% פירושה שמשלמים 80% מהמחיר, והתייקרות של 20% פירושה שמשלמים 120%.',
  tips: ['p% מ-N = N × p ÷ 100.', 'כמה אחוזים: חלק ÷ שלם × 100.', 'מחיר אחרי הנחה של p% = מחיר × (100 − p) ÷ 100.'],
  example: { q: 'חולצה עלתה 160 ₪ והוזלה ב-25%. מה מחירה החדש?', steps: ['25% מ-160 = 160 × 25 ÷ 100 = 40', '160 − 40 = 120'], a: '120 ₪' },
  faq: [
    { q: 'איך מחשבים 15% בראש?', a: 'מחשבים 10% (מזיזים את הנקודה העשרונית ספרה אחת שמאלה), מוסיפים חצי מזה (5%) ומחברים.' },
    { q: 'איך מוצאים את השלם אם יודעים כמה הם p%?', a: 'מחלקים את החלק ב-p ומקבלים 1%, ואז כופלים ב-100. למשל, אם 30% הם 45, אז 1% הוא 1.5 והשלם הוא 150.' },
  ],
  levels: ['אחוז מכמות', 'כמה אחוזים, הנחה והתייקרות', 'מציאת השלם ושינוי באחוזים'],
  gen(level, r) {
    if (level === 1) {
      const p = r.pick([10, 20, 25, 50, 75, 5, 30, 40]), unitN = 100 / gcd(p, 100)
      const N = unitN * r.int(1, Math.max(2, Math.floor(400 / unitN)))
      return { q: `חשבו ${p}% מ-${N}.`, type: 'number', answer: (N * p) / 100, explain: `${N} × ${p} ÷ 100 = ${fmt((N * p) / 100)}` }
    }
    if (level === 2) {
      if (r.bool()) {
        const p = r.pick([5, 10, 15, 20, 25, 30, 40, 60, 75, 80]), whole = r.pick([20, 40, 50, 80, 120, 200, 300, 400])
        const part = (whole * p) / 100
        if (Number.isInteger(part)) return { q: `בשכבה יש ${whole} תלמידים, ו-${part} מהם משתתפים בחוג רובוטיקה. כמה אחוזים מתלמידי השכבה משתתפים בחוג?`, type: 'number', answer: p, unit: '%', explain: `${part} ÷ ${whole} × 100 = ${p}%` }
      }
      const p = r.pick([10, 20, 25, 30, 40, 50]), up = r.bool(0.4)
      const price = (100 / gcd(p, 100)) * r.int(2, 30)
      const ans = (price * (up ? 100 + p : 100 - p)) / 100
      return { q: `מחירו של משחק היה ${price} ₪. המחיר ${up ? `עלה ב-${p}%` : `ירד ב-${p}% במבצע`}. מה המחיר החדש?`, type: 'number', answer: ans, unit: '₪', explain: `${p}% מ-${price} = ${fmt((price * p) / 100)}; ${price} ${up ? '+' : '−'} ${fmt((price * p) / 100)} = ${fmt(ans)} ₪` }
    }
    if (r.bool()) {
      const p = r.pick([10, 20, 25, 30, 40, 60, 75, 15, 35]), whole = (100 / gcd(p, 100)) * r.int(1, 12)
      const part = (whole * p) / 100
      return { q: `${p}% מהתלמידים בשכבה הם ${part} תלמידים. כמה תלמידים יש בשכבה?`, type: 'number', answer: whole, explain: `1% = ${part} ÷ ${p} = ${fmt(part / p)}, ולכן 100% = ${fmt(part / p)} × 100 = ${whole}` }
    }
    const p = r.pick([10, 20, 25, 40, 50, 5, 15]), up = r.bool()
    const old = (100 / gcd(p, 100)) * r.int(2, 20)
    const nw = (old * (up ? 100 + p : 100 - p)) / 100
    return { q: `מחיר של ספר ${up ? 'עלה' : 'ירד'} מ-${old} ₪ ל-${fmt(nw)} ₪. בכמה אחוזים ${up ? 'עלה' : 'ירד'} המחיר?`, type: 'number', answer: p, unit: '%', explain: `השינוי: ${fmt(Math.abs(nw - old))} ₪. ${fmt(Math.abs(nw - old))} ÷ ${old} × 100 = ${p}%` }
  },
}

const angles = {
  slug: 'vertical-adjacent-angles',
  grade: 7,
  strand: 'geometry',
  title: 'זוויות קודקודיות וזוויות צמודות',
  emoji: '📐',
  desc: 'זוויות קודקודיות וזוויות צמודות לכיתה ז׳: זוויות צמודות משלימות ל-180°, זוויות קודקודיות שוות. תרגילים עם שרטוט, משוואות זוויות ודף עבודה.',
  intro: 'כששני ישרים נחתכים נוצרות ארבע זוויות. זוויות צמודות הן שתי זוויות עם קודקוד משותף ושוק משותפת, ששוקיהן האחרות יוצרות ישר אחד; סכומן 180°. זוויות קודקודיות הן זוויות שנמצאות זו מול זו בנקודת החיתוך, ושוקי כל אחת מהן הן המשכי השוקיים של האחרת; הן שוות זו לזו.',
  tips: ['זוויות צמודות: סכומן 180°.', 'זוויות קודקודיות: שוות זו לזו.', 'אם הזוויות נתונות כביטויים עם x, בונים משוואה (שוויון או סכום 180°) ופותרים.'],
  example: { q: 'שני ישרים נחתכים. זווית אחת היא 65°. מה גודל הזווית הצמודה לה ומה גודל הזווית הקודקודית לה?', steps: ['צמודה: 180° − 65° = 115°', 'קודקודית: שווה ל-65°'], a: '115° ו-65°' },
  faq: [
    { q: 'למה זוויות קודקודיות שוות?', a: 'כל אחת מהן צמודה לאותה זווית שלישית, ולכן כל אחת שווה ל-180° פחות אותה זווית — ומכאן שהן שוות.' },
    { q: 'האם זוויות צמודות תמיד שונות זו מזו?', a: 'לא. אם הישרים מאונכים, כל ארבע הזוויות הן 90°, וכל זוג זוויות צמודות שוות זו לזו.' },
  ],
  levels: ['זווית צמודה או קודקודית', 'זוויות צמודות עם הפרש או יחס', 'משוואה עם x'],
  gen(level, r) {
    if (level === 1) {
      const a = r.int(25, 155)
      const askI = r.int(1, 3)
      const val = askI % 2 ? 180 - a : a
      const labels = [`${a}°`, '', '', '']
      labels[askI] = '?'
      return { q: 'שני ישרים נחתכים. מה גודל הזווית המסומנת ב-?', svg: crossingSvg(a, labels), type: 'number', answer: val, unit: '°', explain: askI === 2 ? `זוויות קודקודיות שוות: ${a}°` : `זוויות צמודות משלימות ל-180°: 180° − ${a}° = ${val}°` }
    }
    if (level === 2) {
      if (r.bool()) {
        const small = r.int(20, 85), diff = 180 - 2 * small
        return { q: `שתי זוויות צמודות. אחת מהן גדולה מהשנייה ב-${diff}°. מה גודל הזווית הקטנה?`, type: 'number', answer: small, unit: '°', explain: `x + (x + ${diff}) = 180 ← 2x = ${180 - diff} ← x = ${small}°` }
      }
      const k = r.pick([2, 3, 4, 5, 8, 9, 11]), small = 180 / (k + 1)
      return { q: `שתי זוויות צמודות. אחת מהן גדולה פי ${k} מהשנייה. מה גודל הזווית הגדולה?`, type: 'number', answer: small * k, unit: '°', explain: `x + ${k}x = 180 ← ${k + 1}x = 180 ← x = ${fmt(small)}°, והזווית הגדולה: ${k} × ${fmt(small)} = ${fmt(small * k)}°` }
    }
    const x = r.int(5, 30), vertical = r.bool()
    if (vertical) {
      const a = r.int(2, 5), c = r.int(a + 1, 7), b = r.int(0, 40)
      const d = (a - c) * x + b // a x + b = c x + d
      const ang = a * x + b
      if (ang > 5 && ang < 175) {
        const e1 = lin(a, b), e2 = lin(c, d)
        return { q: 'שני ישרים נחתכים. שתי הזוויות המסומנות הן זוויות קודקודיות. מצאו את x.', svg: crossingSvg(Math.min(155, Math.max(25, ang)), [`${e1}`, '', `${e2}`, '']), type: 'number', answer: x, explain: `זוויות קודקודיות שוות: ${e1} = ${e2} ← ${terms([[c - a, 'x']])} = ${fmt(b - d)} ← x = ${x} (הזווית: ${ang}°)` }
      }
    }
    // adjacent: a x + b + c x + d = 180
    const a = r.int(1, 4), c = r.int(1, 4), b = r.int(0, 30)
    const d = 180 - (a + c) * x - b
    const ang = a * x + b
    const e1 = lin(a, b), e2 = lin(c, d)
    return { q: 'שני ישרים נחתכים. שתי הזוויות המסומנות הן זוויות צמודות. מצאו את x.', svg: crossingSvg(Math.min(155, Math.max(25, ang)), [e1, e2, '', '']), type: 'number', answer: x, explain: `זוויות צמודות: ${e1} + ${e2.startsWith('−') ? '(' + e2 + ')' : e2} = 180 ← ${a + c}x ${b + d < 0 ? '−' : '+'} ${Math.abs(b + d)} = 180 ← x = ${x}` }
  },
}

const triangleAngles = {
  slug: 'triangle-angles',
  grade: 7,
  strand: 'geometry',
  title: 'סכום הזוויות במשולש',
  emoji: '🔺',
  desc: 'סכום הזוויות במשולש הוא 180° — תרגול לכיתה ז׳: זווית חסרה, משולש שווה שוקיים, זווית חיצונית וזוויות ביחס נתון. שרטוטים, פתרונות ודף להדפסה.',
  intro: 'סכום הזוויות הפנימיות בכל משולש הוא 180°. לכן אם ידועות שתי זוויות, מוצאים את השלישית על ידי חיסור מ-180°. במשולש שווה שוקיים זוויות הבסיס שוות זו לזו. זווית חיצונית למשולש — הזווית שבין צלע להמשך הצלע הסמוכה — שווה לסכום שתי הזוויות הפנימיות שאינן צמודות לה.',
  tips: ['זווית חסרה = 180° − סכום שתי הזוויות הידועות.', 'שווה שוקיים: זוויות הבסיס שוות. זווית הראש = 180° − 2 × זווית בסיס.', 'זווית חיצונית = סכום שתי הזוויות הפנימיות הרחוקות ממנה.'],
  example: { q: 'במשולש שווה שוקיים זווית הראש היא 40°. מה גודל כל אחת מזוויות הבסיס?', steps: ['180° − 40° = 140°', '140° ÷ 2 = 70°'], a: '70°' },
  faq: [
    { q: 'למה סכום הזוויות במשולש הוא 180°?', a: 'אם מעבירים דרך קודקוד אחד ישר המקביל לצלע שמולו, שלוש הזוויות של המשולש מסתדרות לאורך הישר (זוויות מתחלפות שוות) ויוצרות יחד זווית שטוחה של 180°.' },
    { q: 'האם יכולות להיות במשולש שתי זוויות ישרות?', a: 'לא. שתי זוויות של 90° כבר מגיעות ל-180°, ולא נשאר מקום לזווית שלישית.' },
  ],
  levels: ['זווית שלישית', 'משולש שווה שוקיים', 'זווית חיצונית ויחס זוויות'],
  gen(level, r) {
    if (level === 1) {
      const A = r.int(30, 110), B = r.int(25, 150 - A), C = 180 - A - B
      const ask = r.int(0, 2), vals = [A, B, C]
      const labels = vals.map((v, i) => (i === ask ? '?' : `${v}°`))
      const { svg } = triangleFromAngles(A, B, C, { names: ['A', 'B', 'C'], angles: labels })
      const known = vals.filter((_, i) => i !== ask)
      return { q: 'מה גודל הזווית המסומנת ב-? במשולש ABC?', svg, type: 'number', answer: vals[ask], unit: '°', explain: `180° − ${known[0]}° − ${known[1]}° = ${vals[ask]}°` }
    }
    if (level === 2) {
      if (r.bool()) {
        const top = 2 * r.int(10, 70), base = (180 - top) / 2
        const { svg } = triangleFromAngles(top, base, base, { names: ['A', 'B', 'C'], angles: [`${top}°`, '?', ''] })
        return { q: 'במשולש ABC שווה השוקיים (AB = AC) זווית הראש A נתונה. מה גודל הזווית B?', svg, type: 'number', answer: base, unit: '°', explain: `זוויות הבסיס שוות: (180° − ${top}°) ÷ 2 = ${base}°` }
      }
      const base = r.int(20, 80), top = 180 - 2 * base
      const { svg } = triangleFromAngles(top, base, base, { names: ['A', 'B', 'C'], angles: ['?', '', `${base}°`] })
      return { q: 'במשולש ABC שווה השוקיים (AB = AC) נתונה זווית הבסיס C. מה גודל זווית הראש A?', svg, type: 'number', answer: top, unit: '°', explain: `זוויות הבסיס שוות (${base}° כל אחת): 180° − 2 × ${base}° = ${top}°` }
    }
    if (r.bool()) {
      const A = r.int(30, 100), B = r.int(25, 145 - A), C = 180 - A - B
      const ext = A + B
      // extend BC beyond C and mark the exterior angle at C
      const rad = d => (d * Math.PI) / 180
      const c = Math.sin(rad(C)) / Math.sin(rad(A))
      const pts = [[c * Math.cos(rad(B)), c * Math.sin(rad(B))], [0, 0], [1, 0], [1.45, 0]]
      const F = fit(pts, 240, 170)
      const [pA, pB, pC, pD] = F.P
      const extLine = svgLine(pC, pD, { w: 2.2 })
      const u = unit(pC, pD), v = unit(pC, pA)
      let bx = u[0] + v[0], by = u[1] + v[1]
      const bl = Math.hypot(bx, by) || 1
      const lab = svgText(pC[0] + (bx / bl) * 26, pC[1] + (by / bl) * 26, '?', { size: 13, fill: ACCENT })
      const svg = polySvg([pA, pB, pC], F.w, F.h, { names: ['A', 'B', 'C'], angles: [`${A}°`, `${B}°`, ''], extra: extLine + lab })
      return { q: 'הצלע BC הוארכה מעבר ל-C. מה גודל הזווית החיצונית המסומנת ב-?', svg, type: 'number', answer: ext, unit: '°', explain: `זווית חיצונית שווה לסכום שתי הזוויות הפנימיות שאינן צמודות לה: ${A}° + ${B}° = ${ext}°` }
    }
    const RATIOS = [[1, 2, 3], [2, 3, 4], [1, 1, 2], [1, 3, 5], [2, 3, 5], [3, 4, 5], [1, 2, 6], [4, 5, 9], [1, 4, 5], [2, 5, 11], [5, 6, 7]]
    const rt = r.pick(RATIOS), s = rt[0] + rt[1] + rt[2], k = 180 / s
    const ask = r.pick(['הגדולה', 'הקטנה'])
    const ans = (ask === 'הגדולה' ? rt[2] : rt[0]) * k
    return { q: `זוויות משולש מתייחסות זו לזו כמו ${rt.join(':')}. מה גודל הזווית ${ask}?`, type: 'number', answer: ans, unit: '°', explain: `${rt.join(' + ')} = ${s} חלקים; חלק = 180° ÷ ${s} = ${fmt(k)}°; הזווית ${ask}: ${ask === 'הגדולה' ? rt[2] : rt[0]} × ${fmt(k)} = ${fmt(ans)}°` }
  },
}

const QUAD = ['רביע ראשון', 'רביע שני', 'רביע שלישי', 'רביע רביעי']
const coordinatePlane = {
  slug: 'coordinate-plane',
  grade: 7,
  strand: 'functions',
  title: 'מערכת צירים: נקודות ורביעים',
  emoji: '📍',
  desc: 'מערכת צירים לכיתה ז׳: קריאת שיעורי נקודה, ציר x וציר y, ארבעת הרביעים ושטח מצולע במערכת צירים. תרגול עם שרטוטים, פתרונות ודף עבודה להדפסה.',
  intro: 'מערכת צירים בנויה משני ישרי מספרים מאונכים: ציר x האופקי וציר y האנכי, שנחתכים בראשית הצירים (0, 0). כל נקודה מתוארת בזוג סדור (x, y): קודם שיעור ה-x — כמה זזים ימינה או שמאלה — ואחר כך שיעור ה-y — כמה עולים או יורדים. הצירים מחלקים את המישור לארבעה רביעים, הממוספרים נגד כיוון השעון החל מהרביע הימני העליון.',
  tips: ['בזוג הסדור (x, y) תמיד x ראשון.', 'רביע ראשון (+, +), שני (−, +), שלישי (−, −), רביעי (+, −).', 'אורך קטע אופקי = הפרש שיעורי ה-x; אורך קטע אנכי = הפרש שיעורי ה-y.'],
  example: { q: 'באיזה רביע נמצאת הנקודה (−3, 5)?', steps: ['x שלילי ← משמאל לציר y', 'y חיובי ← מעל ציר x', 'שמאל־למעלה = רביע שני'], a: 'רביע שני' },
  faq: [
    { q: 'באיזה רביע נמצאת נקודה שעל אחד הצירים?', a: 'באף רביע. נקודה כמו (0, 4) או (−2, 0) נמצאת על ציר, ולא שייכת לאף אחד מהרביעים.' },
    { q: 'איך זוכרים את סדר הרביעים?', a: 'מתחילים ברביע הימני העליון (ראשון) ומסתובבים נגד כיוון השעון: שמאלי עליון שני, שמאלי תחתון שלישי וימני תחתון רביעי.' },
  ],
  levels: ['רביעים', 'קריאת שיעורי נקודה', 'אורך ושטח במערכת צירים'],
  gen(level, r) {
    if (level === 1) {
      const x = r.nz(-9, 9), y = r.nz(-9, 9)
      const qi = x > 0 ? (y > 0 ? 0 : 3) : y > 0 ? 1 : 2
      return { q: `באיזה רביע נמצאת הנקודה ${pt(x, y)}?`, type: 'choice', answer: QUAD[qi], choices: r.shuffle(QUAD), explain: `x ${x > 0 ? 'חיובי' : 'שלילי'} ו-y ${y > 0 ? 'חיובי' : 'שלילי'} ← ${QUAD[qi]}` }
    }
    if (level === 2) {
      const x = r.nz(-5, 5), y = r.nz(-5, 5)
      const answer = pt(x, y)
      return { q: 'מהם שיעורי הנקודה A?', svg: gridSvg(6, { points: [[x, y, 'A']] }), type: 'choice', answer, choices: choiceSet(r, answer, [pt(y, x), pt(-x, y), pt(x, -y), pt(-y, -x), pt(-x, -y)]), explain: `זזים ${Math.abs(x)} ${x > 0 ? 'ימינה' : 'שמאלה'} (x = ${fmt(x)}) ו-${Math.abs(y)} ${y > 0 ? 'למעלה' : 'למטה'} (y = ${fmt(y)}): ${answer}` }
    }
    const x1 = r.int(-6, 2), y1 = r.int(-6, 2), w = r.int(2, 6), h = r.int(2, 6)
    if (r.bool()) {
      const poly = [[x1, y1], [x1 + w, y1], [x1 + w, y1 + h], [x1, y1 + h]]
      return { q: `מהו שטח המלבן שקודקודיו ${poly.map(p => pt(...p)).join(', ')}?`, svg: gridSvg(7, { polygon: poly }), type: 'number', answer: w * h, unit: 'יח״ר', explain: `רוחב: ${fmt(x1 + w)} − ${par(x1)} = ${w}; גובה: ${fmt(y1 + h)} − ${par(y1)} = ${h}; שטח: ${w} × ${h} = ${w * h}` }
    }
    const poly = [[x1, y1], [x1 + w, y1], [x1, y1 + h]]
    return { q: `מהו שטח המשולש שקודקודיו ${poly.map(p => pt(...p)).join(', ')}?`, svg: gridSvg(7, { polygon: poly }), type: 'number', answer: (w * h) / 2, unit: 'יח״ר', explain: `משולש ישר זווית: ניצב אופקי ${w}, ניצב אנכי ${h}; שטח: ${w} × ${h} ÷ 2 = ${fmt((w * h) / 2)}` }
  },
}

const polygonArea = {
  slug: 'area-triangle-parallelogram-trapezoid',
  grade: 7,
  strand: 'measurement',
  title: 'שטח משולש, מקבילית וטרפז',
  emoji: '📏',
  desc: 'חישוב שטח משולש, מקבילית וטרפז לכיתה ז׳: נוסחאות השטח, גובה לצלע ומציאת גובה או בסיס חסר לפי שטח נתון. תרגילים עם שרטוטים ודף להדפסה.',
  intro: 'שטח מקבילית שווה למכפלת צלע בגובה לאותה צלע. משולש הוא חצי ממקבילית, ולכן שטחו הוא צלע כפול הגובה אליה חלקי 2. בטרפז מחברים את שני הבסיסים, כופלים בגובה ומחלקים ב-2. הגובה הוא תמיד הקטע המאונך לבסיס — לא הצלע הנטויה.',
  tips: ['מקבילית: S = a × h.', 'משולש: S = a × h ÷ 2.', 'טרפז: S = (a + b) × h ÷ 2, כאשר a ו-b הם הבסיסים המקבילים.'],
  example: { q: 'בטרפז הבסיסים הם 8 ס״מ ו-12 ס״מ והגובה 5 ס״מ. מהו השטח?', steps: ['8 + 12 = 20', '20 × 5 = 100', '100 ÷ 2 = 50'], a: '50 סמ״ר' },
  faq: [
    { q: 'למה בשטח מקבילית לא כופלים את שתי הצלעות?', a: 'כי הצלע הנטויה ארוכה מהגובה. אם "גוזרים" משולש מצד אחד של המקבילית ומעבירים אותו לצד השני, מקבלים מלבן שאורכו הבסיס ורוחבו הגובה.' },
    { q: 'מה יחידות המידה של שטח?', a: 'יחידות ריבועיות: סמ״ר (סנטימטר רבוע), מ״ר (מטר רבוע) וכן הלאה.' },
  ],
  levels: ['משולש ומקבילית', 'טרפז', 'מציאת גובה או בסיס לפי השטח'],
  gen(level, r) {
    const draw = (kind, labels) => {
      let pts
      if (kind === 'tri') pts = [[0, 0], [labels.a, 0], [labels.a * 0.35, labels.h]]
      else if (kind === 'par') pts = [[0, 0], [labels.a, 0], [labels.a + labels.h * 0.5, labels.h], [labels.h * 0.5, labels.h]]
      else pts = [[0, 0], [labels.a, 0], [labels.a * 0.5 + labels.b * 0.5 + labels.a * 0.08, labels.h], [labels.a * 0.5 - labels.b * 0.5 + labels.a * 0.08, labels.h]]
      const F = fit(pts, 240, 160)
      const top = F.P[kind === 'tri' ? 2 : 3]
      const foot = [top[0], F.P[0][1]]
      const extra = svgLine(top, foot, { w: 1.6, dash: true, color: ACCENT }) + svgText(top[0] + 14, (top[1] + foot[1]) / 2, labels.hl, { size: 12, fill: ACCENT })
      const sides = kind === 'tri' ? [labels.al, '', ''] : kind === 'par' ? [labels.al, '', '', ''] : [labels.al, '', labels.bl, '']
      return polySvg(F.P, F.w, F.h, { sides, extra })
    }
    if (level === 1) {
      const a = r.int(3, 20), h = r.int(2, 15), tri = r.bool()
      const area = tri ? (a * h) / 2 : a * h
      return { q: `מהו שטח ה${tri ? 'משולש' : 'מקבילית'}? (המידות בס״מ)`, svg: draw(tri ? 'tri' : 'par', { a, h, al: String(a), hl: String(h) }), type: 'number', answer: area, unit: 'סמ״ר', explain: tri ? `${a} × ${h} ÷ 2 = ${fmt(area)} סמ״ר` : `${a} × ${h} = ${area} סמ״ר` }
    }
    if (level === 2) {
      const a = r.int(6, 20), b = r.int(2, a - 2), h = r.int(2, 14)
      const area = ((a + b) * h) / 2
      return { q: 'מהו שטח הטרפז? (המידות בס״מ)', svg: draw('trap', { a, b, h, al: String(a), bl: String(b), hl: String(h) }), type: 'number', answer: area, unit: 'סמ״ר', explain: `(${a} + ${b}) × ${h} ÷ 2 = ${fmt(area)} סמ״ר` }
    }
    const kind = r.pick(['tri', 'par', 'trap'])
    if (kind === 'trap') {
      const a = r.int(6, 20), b = r.int(2, a - 2), h = r.int(2, 14)
      const area = ((a + b) * h) / 2
      return { q: `שטח הטרפז הוא ${fmt(area)} סמ״ר. מהו גובה הטרפז?`, svg: draw('trap', { a, b, h, al: String(a), bl: String(b), hl: 'h' }), type: 'number', answer: h, unit: 'ס״מ', explain: `(${a} + ${b}) × h ÷ 2 = ${fmt(area)} ← ${a + b} × h = ${fmt(area * 2)} ← h = ${h}` }
    }
    const a = r.int(3, 20), h = r.int(2, 15)
    const area = kind === 'tri' ? (a * h) / 2 : a * h
    const askBase = r.bool()
    return { q: `שטח ה${kind === 'tri' ? 'משולש' : 'מקבילית'} הוא ${fmt(area)} סמ״ר. מהו ${askBase ? 'אורך הצלע המסומנת' : 'הגובה המסומן'}?`, svg: draw(kind, { a, h, al: askBase ? '?' : String(a), hl: askBase ? String(h) : '?' }), type: 'number', answer: askBase ? a : h, unit: 'ס״מ', explain: kind === 'tri' ? `${askBase ? `a × ${h}` : `${a} × h`} ÷ 2 = ${fmt(area)} ← ${askBase ? 'a' : 'h'} = ${fmt(area * 2)} ÷ ${askBase ? h : a} = ${askBase ? a : h}` : `${askBase ? `a × ${h}` : `${a} × h`} = ${fmt(area)} ← ${askBase ? 'a' : 'h'} = ${fmt(area)} ÷ ${askBase ? h : a} = ${askBase ? a : h}` }
  },
}

export default [directedAddSub, directedMulDiv, orderOfOps, substitution, likeTerms, linearEquations, ratio, percent, angles, triangleAngles, coordinatePlane, polygonArea]
