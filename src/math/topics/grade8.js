// Grade 8 (כיתה ח׳) math topics — Israeli middle-school curriculum: distributive law, equations
// and inequalities, the linear function and slope, systems of equations, powers, parallel lines,
// Pythagoras, congruent triangles, quadrilaterals and statistics.
import {
  MINUS, fmt, par, gcd, frac, fracShow, terms, lin, quad, pt, xpm, choiceSet,
  svgWrap, svgText, svgLine, fit, polySvg, gridSvg,
} from './grade7.js'

const ACCENT = '#d33'
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
export const sup = n => String(n).split('').map(c => SUP[c] ?? c).join('')

const distributive = {
  slug: 'distributive-law',
  grade: 8,
  strand: 'algebra',
  title: 'חוק הפילוג ופתיחת סוגריים',
  emoji: '🧩',
  desc: 'חוק הפילוג לכיתה ח׳: פתיחת סוגריים, כפל ביטוי במספר שלילי, פילוג כפול (x + a)(x + b) וכינוס איברים. תרגול אמריקאי עם פתרון מלא ודף להדפסה.',
  intro: 'חוק הפילוג אומר שכדי לכפול מספר בסכום, כופלים אותו בכל אחד מהמחוברים ומחברים: a(b + c) = ab + ac. כשהמספר שמחוץ לסוגריים שלילי, הוא משנה את הסימן של כל איבר בתוכם. בחוק הפילוג המורחב כופלים כל איבר בסוגריים הראשונים בכל איבר בסוגריים השניים: (a + b)(c + d) = ac + ad + bc + bd.',
  tips: ['כופלים את המספר שמחוץ לסוגריים בכל איבר בתוכם — לא רק בראשון.', '−3(x − 4) = −3x + 12: מינוס כפול מינוס נותן פלוס.', 'בפילוג כפול יוצאים ארבעה איברים; אחרי כינוס בדרך כלל נשארים שלושה.'],
  example: { q: 'פתחו סוגריים ופשטו: (x + 3)(2x − 5)', steps: ['x × 2x = 2x²', 'x × (−5) + 3 × 2x = −5x + 6x = x', '3 × (−5) = −15'], a: '2x² + x − 15' },
  faq: [
    { q: 'מה ההבדל בין חוק הפילוג לחוק הפילוג המורחב?', a: 'בחוק הפילוג כופלים מספר (או איבר) בסוגריים. בחוק המורחב כופלים סוגריים בסוגריים — כל איבר מהראשונים בכל איבר מהשניים.' },
    { q: 'מה הטעות הנפוצה ביותר?', a: 'לשכוח לכפול גם את האיבר השני בסוגריים, או לא להפוך את הסימן כשהמספר שבחוץ שלילי.' },
  ],
  levels: ['מספר כפול סוגריים', 'שני זוגות סוגריים וכינוס', 'פילוג מורחב (סוגריים כפול סוגריים)'],
  gen(level, r) {
    if (level === 1) {
      const a = r.nz(-9, 9), b = r.nz(-9, 9), c = r.nz(-12, 12)
      const answer = lin(a * b, a * c)
      return { q: 'פתחו סוגריים:', expr: `${a === -1 ? MINUS : a === 1 ? '' : fmt(a)}(${lin(b, c)})`, type: 'choice', answer, choices: choiceSet(r, answer, [lin(a * b, c), lin(a * b, -a * c), lin(-a * b, a * c), lin(a + b, a * c), lin(a * b, a + c), lin(-a * b, -a * c)]), explain: `${fmt(a)} × ${par(b)}x = ${fmt(a * b)}x, ${fmt(a)} × ${par(c)} = ${fmt(a * c)}` }
    }
    if (level === 2) {
      const a = r.int(2, 6), b = r.nz(-8, 8), c = r.int(2, 6), d = r.nz(-8, 8), s = r.pick([1, -1])
      const X = a + s * c, K = a * b + s * c * d
      const answer = lin(X, K)
      return { q: 'פתחו סוגריים ופשטו:', expr: `${a}(${xpm(b)}) ${s > 0 ? '+' : '−'} ${c}(${xpm(d)})`, type: 'choice', answer, choices: choiceSet(r, answer, [lin(X, a * b + c * d * -s), lin(a - s * c, K), lin(X, b + s * d), lin(X, -K), lin(X + 2, K), lin(X, K + 2 * c)]), explain: `${lin(a, a * b)} ${s > 0 ? '+' : '−'} (${lin(c, c * d)}) = ${answer}` }
    }
    const a = r.pick([1, 1, 2, 3]), b = r.nz(-7, 7), c = r.pick([1, 1, 2, -1]), d = r.nz(-7, 7)
    const A = a * c, B = a * d + b * c, C = b * d
    const answer = quad(A, B, C)
    const L = `(${lin(a, b)})(${lin(c, d)})`
    return { q: 'פתחו סוגריים ופשטו:', expr: L, type: 'choice', answer, choices: choiceSet(r, answer, [quad(A, 0, C), quad(A, B, -C), quad(A, -B, C), quad(A, a * d - b * c, C), quad(A, B + 1, C), quad(A, b + d, C)]), explain: `${terms([[a, 'x']])} × ${c < 0 ? '(' + terms([[c, 'x']]) + ')' : terms([[c, 'x']])} = ${terms([[A, 'x²']])}; האיברים האמצעיים: ${terms([[a * d, 'x']])} ${b * c < 0 ? '−' : '+'} ${terms([[Math.abs(b * c), 'x']])} = ${terms([[B, 'x']])}; ${fmt(b)} × ${par(d)} = ${fmt(C)}. ביחד: ${answer}` }
  },
}

const equations = {
  slug: 'equations-parentheses-fractions',
  grade: 8,
  strand: 'algebra',
  title: 'משוואות עם סוגריים ושברים',
  emoji: '⚖️',
  desc: 'פתרון משוואות לכיתה ח׳: משוואות עם סוגריים משני הצדדים, מינוס לפני סוגריים ומשוואות עם שברים (כפל במכנה משותף). תרגול אינסופי עם פתרון מפורט.',
  intro: 'כשיש במשוואה סוגריים, פותחים אותם בעזרת חוק הפילוג ומכנסים איברים דומים בכל אגף. כשיש במשוואה שברים, כופלים את שני האגפים במכנה המשותף של כל השברים, וכך מקבלים משוואה בלי שברים. אחר כך פותרים כרגיל: מעבירים איברים, מכנסים ומחלקים במקדם של x.',
  tips: ['מינוס לפני סוגריים: −(x − 4) = −x + 4.', 'בשברים כופלים כל איבר בשני האגפים במכנה המשותף — גם איברים שאינם שברים.', 'בסוף בודקים על ידי הצבה במשוואה המקורית.'],
  example: { q: 'פתרו: x/2 + x/3 = 10', steps: ['כופלים ב-6: 3x + 2x = 60', '5x = 60', 'x = 12'], a: 'x = 12' },
  faq: [
    { q: 'איך בוחרים במה לכפול משוואה עם שברים?', a: 'בוחרים את המכנה המשותף הקטן ביותר של כל השברים (הכפולה המשותפת הקטנה של המכנים). כך המספרים נשארים קטנים.' },
    { q: 'מה עושים אם x נעלם במהלך הפתרון?', a: 'אם מתקבל שוויון נכון (כמו 3 = 3) — לכל x יש פתרון. אם מתקבל שוויון שגוי (כמו 3 = 5) — למשוואה אין פתרון.' },
  ],
  levels: ['סוגריים באגף אחד', 'סוגריים בשני האגפים ומינוס', 'משוואות עם שברים'],
  gen(level, r) {
    if (level === 1) {
      const x = r.nz(-10, 10), a = r.int(2, 9), b = r.nz(-9, 9), c = a * (x + b)
      return { q: 'פתרו את המשוואה:', expr: `${a}(${xpm(b)}) = ${fmt(c)}`, type: 'number', answer: x, explain: `מחלקים ב-${a}: ${xpm(b)} = ${fmt(c / a)}, ולכן x = ${fmt(x)}` }
    }
    if (level === 2) {
      const x = r.nz(-10, 10), a = r.int(2, 7), b = r.nz(-8, 8), d = r.nz(-8, 8)
      let c = r.int(1, 6)
      if (a - c === 0) c = a + 1
      // a(x + b) − c(x + d) = e
      const e = a * (x + b) - c * (x + d)
      return { q: 'פתרו את המשוואה:', expr: `${a}(${xpm(b)}) − ${c === 1 ? '' : c}(${xpm(d)}) = ${fmt(e)}`, type: 'number', answer: x, explain: `פותחים סוגריים: ${lin(a, a * b)} − (${lin(c, c * d)}) = ${fmt(e)}; מכנסים: ${lin(a - c, a * b - c * d)} = ${fmt(e)}; x = ${fmt(x)}` }
    }
    if (r.bool()) {
      const PAIRS = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 6], [2, 6], [4, 5], [3, 6]]
      const [p, q] = r.pick(PAIRS), l = (p * q) / gcd(p, q)
      const x = l * r.nz(-6, 6), s = r.pick([1, -1]), c = x / p + (s * x) / q
      return { q: 'פתרו את המשוואה:', expr: `x/${p} ${s > 0 ? '+' : '−'} x/${q} = ${fmt(c)}`, type: 'number', answer: x, explain: `כופלים ב-${l}: ${l / p}x ${s > 0 ? '+' : '−'} ${l / q}x = ${fmt(c * l)} ← ${terms([[l / p + (s * l) / q, 'x']])} = ${fmt(c * l)} ← x = ${fmt(x)}` }
    }
    // (a x + b)/c = d x + e  → choose x, a, c, d, e; b = c(dx + e) − a x
    const x = r.nz(-8, 8), c = r.int(2, 6), a = r.nz(-5, 5), e = r.int(-6, 6)
    let d = r.nz(-3, 3)
    if (a === c * d) d = d + 1 || 2
    const b = c * (d * x + e) - a * x
    return { q: 'פתרו את המשוואה:', expr: `(${lin(a, b)})/${c} = ${lin(d, e)}`, type: 'number', answer: x, explain: `כופלים ב-${c}: ${lin(a, b)} = ${lin(c * d, c * e)}; מעבירים אגפים: ${terms([[a - c * d, 'x']])} = ${fmt(c * e - b)}; x = ${fmt(x)}` }
  },
}

const REL = { '>': '<', '<': '>', '≥': '≤', '≤': '≥' }
const inequalities = {
  slug: 'linear-inequalities',
  grade: 8,
  strand: 'algebra',
  title: 'אי־שוויונים ממעלה ראשונה',
  emoji: '↔️',
  desc: 'פתרון אי־שוויונים ממעלה ראשונה לכיתה ח׳: פעולות שקולות, היפוך סימן אי־השוויון בכפל או בחילוק במספר שלילי, ונעלם בשני האגפים. תרגול עם פתרונות.',
  intro: 'אי־שוויון ממעלה ראשונה נפתר כמעט כמו משוואה: מעבירים איברים, מכנסים ומחלקים במקדם של x. ההבדל החשוב: כשכופלים או מחלקים את שני האגפים במספר שלילי, סימן אי־השוויון מתהפך (גדול הופך לקטן ולהפך). הפתרון הוא קבוצה של מספרים, למשל x > 3, ואפשר לסמן אותה על ישר המספרים.',
  tips: ['חיבור או חיסור של מספר משני האגפים לא משנים את כיוון הסימן.', 'חילוק במספר שלילי הופך את הסימן: −2x > 6 ← x < −3.', 'בדיקה מהירה: בוחרים מספר מתוך הפתרון ומציבים באי־השוויון המקורי.'],
  example: { q: 'פתרו: 5 − 3x ≥ 17', steps: ['מחסרים 5: −3x ≥ 12', 'מחלקים ב-(−3) והופכים את הסימן: x ≤ −4'], a: 'x ≤ −4' },
  faq: [
    { q: 'למה הסימן מתהפך כשמחלקים במספר שלילי?', a: 'כי כפל במספר שלילי הופך את הסדר על ישר המספרים: 2 < 5, אבל −2 > −5.' },
    { q: 'מה ההבדל בין > ל-≥?', a: 'x > 3 לא כולל את 3 עצמו (עיגול ריק על ישר המספרים), ו-x ≥ 3 כולל אותו (עיגול מלא).' },
  ],
  levels: ['מקדם חיובי', 'מקדם שלילי (היפוך סימן)', 'נעלם בשני האגפים'],
  gen(level, r) {
    const rel = r.pick(['>', '<', '≥', '≤'])
    const s = r.int(-9, 9)
    let a, b, c, d, expr, flip, how
    if (level === 1) {
      a = r.int(1, 9); b = r.int(-15, 15)
      expr = `${lin(a, b)} ${rel} ${fmt(a * s + b)}`; flip = false
      how = `${a === 1 ? 'x' : a + 'x'} ${rel} ${fmt(a * s)}${a > 1 ? ` ← מחלקים ב-${a} (חיובי, הסימן נשאר)` : ''}`
    } else if (level === 2) {
      a = r.int(-9, -1); b = r.int(-15, 15)
      expr = `${terms([[b, ''], [a, 'x']])} ${rel} ${fmt(a * s + b)}`; flip = true
      how = `${terms([[a, 'x']])} ${rel} ${fmt(a * s)} ← מחלקים ב-${par(a)} והופכים את הסימן`
    } else {
      a = r.nz(-8, 8); c = r.nz(-8, 8)
      while (c === a) c = r.nz(-8, 8)
      b = r.int(-12, 12); d = (a - c) * s + b
      expr = `${lin(a, b)} ${rel} ${lin(c, d)}`; flip = a - c < 0
      how = `מעבירים אגפים: ${terms([[a - c, 'x']])} ${rel} ${fmt(d - b)}${a - c === 1 ? '' : flip ? ` ← מחלקים ב-${par(a - c)} והופכים את הסימן` : ` ← מחלקים ב-${a - c}`}`
    }
    const R = flip ? REL[rel] : rel
    const answer = `x ${R} ${fmt(s)}`
    const strict = { '>': '≥', '<': '≤', '≥': '>', '≤': '<' }
    const cands = [`x ${REL[R]} ${fmt(s)}`, `x ${R} ${fmt(-s)}`, `x ${REL[R]} ${fmt(-s)}`, `x ${strict[R]} ${fmt(s)}`, `x ${R} ${fmt(s + 1)}`]
    return { q: 'פתרו את אי־השוויון:', expr, type: 'choice', answer, choices: choiceSet(r, answer, cands), explain: `${how}: ${answer}` }
  },
}

const slope = {
  slug: 'slope',
  grade: 8,
  strand: 'functions',
  title: 'שיפוע של ישר',
  emoji: '📈',
  desc: 'שיפוע של ישר לכיתה ח׳: קריאת שיפוע מגרף, מציאת שיפוע בין שתי נקודות בנוסחה, שיפוע שלילי ושיפוע שהוא שבר. תרגול עם שרטוטים ודף עבודה להדפסה.',
  intro: 'השיפוע מתאר כמה הישר עולה או יורד כשמתקדמים יחידה אחת ימינה. בין שתי נקודות (x₁, y₁) ו-(x₂, y₂) השיפוע הוא m = (y₂ − y₁) / (x₂ − x₁) — השינוי ב-y חלקי השינוי ב-x. שיפוע חיובי — הישר עולה משמאל לימין; שיפוע שלילי — הישר יורד; ישר מקביל לציר x שיפועו 0.',
  tips: ['m = (y₂ − y₁) ÷ (x₂ − x₁) — חשוב לחסר באותו סדר למעלה ולמטה.', 'בגרף: סופרים משבצות למעלה (או למטה) ומשבצות ימינה.', 'בישר y = mx + b המקדם של x הוא השיפוע.'],
  example: { q: 'מצאו את שיפוע הישר העובר דרך (1, 2) ו-(4, −7).', steps: ['שינוי ב-y: −7 − 2 = −9', 'שינוי ב-x: 4 − 1 = 3', 'm = −9 ÷ 3 = −3'], a: '−3' },
  faq: [
    { q: 'מה השיפוע של ישר אנכי?', a: 'לישר אנכי (מקביל לציר y) אין שיפוע מוגדר, כי השינוי ב-x הוא 0 ואי אפשר לחלק באפס.' },
    { q: 'האם חשוב איזו נקודה היא הראשונה?', a: 'לא, בתנאי שמחסרים באותו סדר במונה ובמכנה. החלפת הסדר משנה את הסימן גם במונה וגם במכנה, והמנה נשארת אותו דבר.' },
  ],
  levels: ['שיפוע מגרף', 'שיפוע בין שתי נקודות', 'שיפוע שהוא שבר'],
  gen(level, r) {
    if (level === 1) {
      const m = r.nz(-3, 3), x1 = r.int(-4, 0), y1 = m > 0 ? r.int(-5, 5 - 2 * m) : r.int(-5 - 2 * m, 5)
      const x2 = x1 + 2, y2 = y1 + 2 * m
      const svg = gridSvg(6, { points: [[x1, y1, 'A'], [x2, y2, 'B']] }).replace('</svg>', lineThrough(6, x1, y1, x2, y2) + '</svg>')
      return { q: 'מהו שיפוע הישר AB שבשרטוט?', svg, type: 'number', answer: m, explain: `מ-A ל-B: ${Math.abs(2 * m)} משבצות ${m > 0 ? 'למעלה' : 'למטה'} ו-2 ימינה ← m = ${fmt(2 * m)} ÷ 2 = ${fmt(m)}` }
    }
    const x1 = r.int(-8, 8)
    let dx = r.nz(-6, 6), m, dy
    if (level === 2) { m = r.nz(-5, 5); dy = m * dx } else {
      dx = r.pick([2, 3, 4, 5, 6, -2, -3, -4, -5])
      do { dy = r.nz(-9, 9) } while (dy % dx === 0)
      m = null
    }
    const y1 = r.int(-9, 9), x2 = x1 + dx, y2 = y1 + dy
    const base = { q: `מצאו את שיפוע הישר העובר דרך הנקודות ${pt(x1, y1)} ו-${pt(x2, y2)}.`, explain: `m = (${fmt(y2)} − ${par(y1)}) ÷ (${fmt(x2)} − ${par(x1)}) = ${fmt(dy)} ÷ ${par(dx)} = ${m != null ? fmt(m) : fracShow(dy, dx)}` }
    if (level === 2) return { ...base, type: 'number', answer: m }
    return { ...base, q: base.q + ' (רשמו כשבר מצומצם)', type: 'fraction', answer: frac(dy, dx) }
  },
}

// Segment of y through two grid points, clipped to the grid (screen coords of gridSvg(m)).
function lineThrough(m, x1, y1, x2, y2) {
  const s = Math.floor(208 / (2 * m)), pad = 14
  const X = x => pad + (x + m) * s, Y = y => pad + (m - y) * s
  const k = (y2 - y1) / (x2 - x1)
  const ts = []
  for (const xx of [-m, m]) { const yy = y1 + k * (xx - x1); if (yy >= -m && yy <= m) ts.push([xx, yy]) }
  for (const yy of [-m, m]) { const xx = x1 + (yy - y1) / k; if (xx >= -m && xx <= m) ts.push([xx, yy]) }
  ts.sort((a, b) => a[0] - b[0])
  const a = ts[0], b = ts[ts.length - 1]
  return svgLine([X(a[0]), Y(a[1])], [X(b[0]), Y(b[1])], { w: 2.2, color: '#2563eb' })
}

const lineEq = (m, b) => `y = ${lin(m, b)}`
const linearFunction = {
  slug: 'linear-function',
  grade: 8,
  strand: 'functions',
  title: 'הפונקציה הקווית y = mx + b',
  emoji: '📉',
  desc: 'הפונקציה הקווית לכיתה ח׳: חישוב ערך הפונקציה, נקודת חיתוך עם ציר y, מציאת משוואת ישר לפי שיפוע ונקודה או לפי שתי נקודות. תרגול עם פתרון.',
  intro: 'פונקציה קווית היא פונקציה שהגרף שלה הוא קו ישר, ואפשר לכתוב אותה בצורה y = mx + b. המספר m הוא השיפוע, והמספר b הוא נקודת החיתוך של הישר עם ציר y — הנקודה (0, b). כדי למצוא משוואת ישר צריך שיפוע ונקודה: מציבים את הנקודה ב-y = mx + b ומוצאים את b.',
  tips: ['ב-y = mx + b: ‏m — שיפוע, b — חיתוך עם ציר y.', 'נקודה נמצאת על הישר אם הצבת ה-x שלה נותנת בדיוק את ה-y שלה.', 'משוואת ישר דרך שתי נקודות: קודם מחשבים שיפוע, ואז מציבים אחת הנקודות כדי למצוא את b.'],
  example: { q: 'מצאו את משוואת הישר ששיפועו 2 והעובר דרך (3, 1).', steps: ['y = 2x + b', 'מציבים: 1 = 2 × 3 + b', 'b = −5'], a: 'y = 2x − 5' },
  faq: [
    { q: 'איך מוצאים את נקודת החיתוך עם ציר x?', a: 'מציבים y = 0 ופותרים את המשוואה 0 = mx + b. למשל ב-y = 2x − 6 מקבלים x = 3, כלומר הנקודה (3, 0).' },
    { q: 'מתי שני ישרים מקבילים?', a: 'כשיש להם אותו שיפוע ונקודות חיתוך שונות עם ציר y, למשל y = 3x + 1 ו-y = 3x − 4.' },
  ],
  levels: ['ערך הפונקציה ונקודת חיתוך', 'משוואת ישר לפי שיפוע ונקודה', 'משוואת ישר לפי שתי נקודות'],
  gen(level, r) {
    if (level === 1) {
      const m = r.nz(-6, 6), b = r.int(-10, 10)
      const kind = r.int(0, 2)
      if (kind === 0) {
        const x = r.int(-6, 6)
        return { q: `נתונה הפונקציה ${lineEq(m, b)}. מהו ערך y כאשר x = ${fmt(x)}?`, type: 'number', answer: m * x + b, explain: `${fmt(m)} × ${par(x)} + ${par(b)} = ${fmt(m * x + b)}` }
      }
      if (kind === 1) {
        const x = r.int(-6, 6), y = m * x + b
        return { q: `נתונה הפונקציה ${lineEq(m, b)}. עבור איזה ערך של x מתקבל y = ${fmt(y)}?`, type: 'number', answer: x, explain: `${fmt(y)} = ${lin(m, b)} ← ${fmt(m)}x = ${fmt(y - b)} ← x = ${fmt(x)}` }
      }
      const x0 = r.int(-6, 6), bb = -m * x0
      return { q: `באיזה ערך של x חותך הישר ${lineEq(m, bb)} את ציר x?`, type: 'number', answer: x0, explain: `מציבים y = 0: ${lin(m, bb)} = 0 ← x = ${fmt(x0)}` }
    }
    const m = r.nz(-5, 5), b = r.int(-9, 9)
    const answer = lineEq(m, b)
    const x1 = r.nz(-6, 6), y1 = m * x1 + b
    const cands = [lineEq(m, -b), lineEq(-m, b), lineEq(m, y1), lineEq(m, b + 2 * m), lineEq(b || 1, m), lineEq(-m, -b), lineEq(m, y1 + m * x1)]
    if (level === 2) {
      return { q: `מהי משוואת הישר ששיפועו ${fmt(m)} והעובר דרך הנקודה ${pt(x1, y1)}?`, type: 'choice', answer, choices: choiceSet(r, answer, cands), explain: `y = ${fmt(m)}x + b; מציבים: ${fmt(y1)} = ${fmt(m)} × ${par(x1)} + b ← b = ${fmt(b)}. ${answer}` }
    }
    let x2 = r.nz(-6, 6)
    if (x2 === x1) x2 = x1 > 0 ? x1 - 1 || -1 : x1 + 1 || 1
    const y2 = m * x2 + b
    return { q: `מהי משוואת הישר העובר דרך הנקודות ${pt(x1, y1)} ו-${pt(x2, y2)}?`, type: 'choice', answer, choices: choiceSet(r, answer, cands), explain: `m = (${fmt(y2)} − ${par(y1)}) ÷ (${fmt(x2)} − ${par(x1)}) = ${fmt(m)}; מציבים ${pt(x1, y1)}: b = ${fmt(b)}. ${answer}` }
  },
}

const sol = (x, y) => `x = ${fmt(x)}, y = ${fmt(y)}`
const systems = {
  slug: 'system-of-equations',
  grade: 8,
  strand: 'algebra',
  title: 'מערכת משוואות עם שני נעלמים',
  emoji: '🔗',
  desc: 'מערכת של שתי משוואות עם שני נעלמים לכיתה ח׳: פתרון בשיטת ההצבה ובשיטת השוואת מקדמים (חיבור או חיסור משוואות). תרגול אמריקאי עם פתרון מלא.',
  intro: 'מערכת משוואות היא שתי משוואות עם שני נעלמים, x ו-y, שצריכות להתקיים יחד. הפתרון הוא זוג מספרים שמקיים את שתיהן. בשיטת ההצבה מבודדים נעלם אחד ממשוואה אחת ומציבים בשנייה. בשיטת השוואת המקדמים כופלים את המשוואות כך שלאחד הנעלמים יהיו מקדמים נגדיים, ואז מחברים את המשוואות והנעלם הזה נעלם. מבחינה גרפית, הפתרון הוא נקודת החיתוך של שני ישרים.',
  tips: ['אם באחת המשוואות יש x או y עם מקדם 1 — שיטת ההצבה נוחה.', 'מקדמים נגדיים (למשל 3y ו-−3y) ← מחברים את המשוואות.', 'בדיקה: מציבים את הזוג בשתי המשוואות.'],
  example: { q: 'פתרו: x + y = 10, x − y = 4', steps: ['מחברים: 2x = 14 ← x = 7', 'מציבים: 7 + y = 10 ← y = 3'], a: 'x = 7, y = 3' },
  faq: [
    { q: 'האם תמיד יש למערכת פתרון אחד?', a: 'לא. אם שני הישרים מקבילים אין פתרון, ואם הם מתלכדים (אותו ישר) יש אינסוף פתרונות.' },
    { q: 'איזו שיטה עדיפה?', a: 'שתיהן נותנות אותה תוצאה. הצבה נוחה כשנעלם כבר מבודד או שמקדמו 1; השוואת מקדמים נוחה כשהמקדמים שווים או נגדיים.' },
  ],
  levels: ['x + y ו-x − y', 'שיטת ההצבה', 'השוואת מקדמים'],
  gen(level, r) {
    const x = r.int(-8, 8), y = r.int(-8, 8)
    let e1, e2, how
    if (level === 1) {
      e1 = `x + y = ${fmt(x + y)}`; e2 = `x − y = ${fmt(x - y)}`
      how = `מחברים את המשוואות: 2x = ${fmt(2 * x)} ← x = ${fmt(x)}; מציבים: y = ${fmt(y)}`
    } else if (level === 2) {
      const a = r.nz(-5, 5), b = r.nz(-5, 5), c = r.nz(-4, 4)
      // y = c x + d ; a x + b y = e
      const d = y - c * x
      e1 = `y = ${lin(c, d)}`; e2 = `${terms([[a, 'x'], [b, 'y']])} = ${fmt(a * x + b * y)}`
      if (a + b * c === 0) { e2 = `${terms([[a + 1, 'x'], [b, 'y']])} = ${fmt((a + 1) * x + b * y)}` }
      how = `מציבים את y מהמשוואה הראשונה בשנייה ופותרים: x = ${fmt(x)}, ואז y = ${fmt(c)} × ${par(x)} + ${par(d)} = ${fmt(y)}`
    } else {
      let a = r.nz(-6, 6), b = r.nz(-6, 6), c = r.nz(-6, 6), d = r.nz(-6, 6)
      if (a * d - b * c === 0) d = d === 6 ? 5 : d + 1
      if (d === 0) d = 1
      if (a * d - b * c === 0) { a = 2; b = 3; c = 1; d = -1 }
      e1 = `${terms([[a, 'x'], [b, 'y']])} = ${fmt(a * x + b * y)}`; e2 = `${terms([[c, 'x'], [d, 'y']])} = ${fmt(c * x + d * y)}`
      how = `כופלים את המשוואות כך שלאחד הנעלמים יהיו מקדמים נגדיים, מחברים ופותרים: x = ${fmt(x)}, y = ${fmt(y)}`
    }
    const answer = sol(x, y)
    return { q: 'פתרו את מערכת המשוואות:', expr: `${e1} ;  ${e2}`, type: 'choice', answer, choices: choiceSet(r, answer, [sol(y, x), sol(x, -y), sol(-x, y), sol(x + 1, y - 1), sol(-x, -y), sol(x, y + 2)]), explain: how }
  },
}

const powers = {
  slug: 'powers',
  grade: 8,
  strand: 'arithmetic',
  title: 'חזקות וחוקי חזקות',
  emoji: '⚡',
  desc: 'חזקות לכיתה ח׳: חישוב חזקות, כפל וחילוק חזקות עם אותו בסיס, חזקה של חזקה, חזקת אפס וחזקה עם מעריך שלילי. תרגול עם פתרון מוסבר ודף להדפסה.',
  intro: 'חזקה היא כפל חוזר של מספר בעצמו: 2⁵ = 2 × 2 × 2 × 2 × 2 = 32. המספר 2 נקרא בסיס, ו-5 נקרא מעריך. בכפל חזקות עם אותו בסיס מחברים מעריכים, בחילוק מחסרים אותם, ובחזקה של חזקה כופלים אותם. כל מספר (שונה מאפס) בחזקת 0 שווה 1, וחזקה עם מעריך שלילי היא ההופכי: a⁻ⁿ = 1/aⁿ.',
  tips: ['aᵐ · aⁿ = aᵐ⁺ⁿ', 'aᵐ ÷ aⁿ = aᵐ⁻ⁿ', '(aᵐ)ⁿ = aᵐⁿ, ‏a⁰ = 1, ‏a⁻ⁿ = 1/aⁿ'],
  example: { q: 'חשבו: 2⁻³', steps: ['2⁻³ = 1/2³', '2³ = 8'], a: '1/8' },
  faq: [
    { q: 'למה כל מספר בחזקת 0 שווה 1?', a: 'כי aⁿ ÷ aⁿ = 1, ולפי חוק החילוק זה גם aⁿ⁻ⁿ = a⁰. לכן a⁰ = 1 (כאשר a שונה מאפס).' },
    { q: 'האם מעריך שלילי הופך את התוצאה לשלילית?', a: 'לא. מעריך שלילי פירושו הופכי: 2⁻² = 1/4, מספר חיובי.' },
  ],
  levels: ['חישוב חזקות', 'חוקי חזקות (מציאת המעריך)', 'חזקת אפס ומעריך שלילי'],
  gen(level, r) {
    if (level === 1) {
      const base = r.pick([2, 3, 4, 5, 10, -2, -3, 6, 7])
      const e = Math.abs(base) === 2 ? r.int(2, 7) : Math.abs(base) === 10 ? r.int(2, 5) : Math.abs(base) <= 5 ? r.int(2, 4) : 2
      return { q: 'חשבו:', expr: `${base < 0 ? `(${fmt(base)})` : base}${sup(e)} = ?`, type: 'number', answer: base ** e, explain: `${Array(e).fill(par(base)).join(' × ')} = ${fmt(base ** e)}` }
    }
    if (level === 2) {
      const v = r.pick(['a', 'x', '5', '2', '7']), m = r.int(2, 9), n = r.int(2, 6)
      const kind = r.int(0, 2)
      if (kind === 0) return { q: 'מהו המעריך n?', expr: `${v}${sup(m)} · ${v}${sup(n)} = ${v}ⁿ`, type: 'number', answer: m + n, explain: `בכפל חזקות עם אותו בסיס מחברים מעריכים: ${m} + ${n} = ${m + n}` }
      if (kind === 1) { const big = m + n; return { q: 'מהו המעריך n?', expr: `${v}${sup(big)} ÷ ${v}${sup(n)} = ${v}ⁿ`, type: 'number', answer: m, explain: `בחילוק חזקות עם אותו בסיס מחסרים מעריכים: ${big} − ${n} = ${m}` } }
      const mm = r.int(2, 5), nn = r.int(2, 5)
      return { q: 'מהו המעריך n?', expr: `(${v}${sup(mm)})${sup(nn)} = ${v}ⁿ`, type: 'number', answer: mm * nn, explain: `בחזקה של חזקה כופלים מעריכים: ${mm} × ${nn} = ${mm * nn}` }
    }
    const kind = r.int(0, 2)
    if (kind === 0) {
      const b = r.pick([2, 3, 4, 5, 10]), e = b === 2 ? r.int(1, 5) : b === 10 ? r.int(1, 3) : r.int(1, 3)
      return { q: 'חשבו (רשמו כשבר):', expr: `${b}${sup(-e)} = ?`, type: 'fraction', answer: frac(1, b ** e), explain: `${b}${sup(-e)} = 1/${b}${sup(e)} = 1/${b ** e}` }
    }
    if (kind === 1) {
      const p = r.int(2, 5), q = r.int(1, 6)
      if (gcd(p, q) !== 1 || p === q || q === 1) return { q: 'חשבו (רשמו כשבר):', expr: `${p}⁰ + ${p}${sup(-1)} = ?`, type: 'fraction', answer: frac(p + 1, p), explain: `${p}⁰ = 1, ${p}${sup(-1)} = 1/${p}; ביחד ${fracShow(p + 1, p)}` }
      return { q: 'חשבו (רשמו כשבר):', expr: `(${p}/${q})${sup(-2)} = ?`, type: 'fraction', answer: frac(q * q, p * p), explain: `מעריך שלילי ← הופכי: (${q}/${p})² = ${q * q}/${p * p}` }
    }
    const b = r.pick([2, 3, 5]), m = r.int(2, 5), n = m + r.int(1, b === 2 ? 3 : 2)
    return { q: 'חשבו (רשמו כשבר):', expr: `${b}${sup(m)} ÷ ${b}${sup(n)} = ?`, type: 'fraction', answer: frac(1, b ** (n - m)), explain: `${b}${sup(m)} ÷ ${b}${sup(n)} = ${b}${sup(m - n)} = 1/${b ** (n - m)}` }
  },
}

// Two horizontal parallel lines cut by a transversal at `theta` degrees (from +x, counter-clockwise).
// pos: 0 = upper-right, 1 = upper-left, 2 = lower-left, 3 = lower-right of each crossing.
function parallelSvg(theta, top, bottom) {
  const rad = (theta * Math.PI) / 180, cot = Math.cos(rad) / Math.sin(rad)
  const y1 = 55, y2 = 135, x1 = 120 + 40 * cot, x2 = x1 - 80 * cot
  let body = svgLine([8, y1], [232, y1], { w: 2.2 }) + svgLine([8, y2], [232, y2], { w: 2.2 })
  body += svgLine([x1 + 42 * cot, y1 - 42], [x2 - 42 * cot, y2 + 42], { w: 2.2 })
  body += svgText(224, y1 - 9, 'a', { size: 12, bold: false }) + svgText(224, y2 - 9, 'b', { size: 12, bold: false })
  const mids = [theta / 2, (theta + 180) / 2, 180 + theta / 2, 270 + theta / 2]
  const place = (P, labels) => labels.forEach((lab, i) => {
    if (!lab) return
    const span = i % 2 ? 180 - theta : theta, d = span < 55 ? 36 : 22, a = (mids[i] * Math.PI) / 180
    body += svgText(P[0] + d * Math.cos(a), P[1] - d * Math.sin(a), lab, { size: 12, fill: lab.includes('?') ? ACCENT : 'currentColor' })
  })
  place([x1, y1], top); place([x2, y2], bottom)
  return svgWrap(240, 190, body, 'ישרים מקבילים וחותך')
}
function pairName(p, q) {
  if (p === q) return 'זוויות מתאימות'
  if ((p === 2 && q === 0) || (p === 3 && q === 1)) return 'זוויות מתחלפות'
  if ((p === 2 && q === 1) || (p === 3 && q === 0)) return 'זוויות חד־צדדיות'
  return ''
}
const parallelLines = {
  slug: 'parallel-lines-angles',
  grade: 8,
  strand: 'geometry',
  title: 'זוויות בין ישרים מקבילים',
  emoji: '🛤️',
  desc: 'זוויות בין ישרים מקבילים וחותך לכיתה ח׳: זוויות מתאימות, מתחלפות וחד־צדדיות, וחישוב זוויות עם x. תרגול עם שרטוטים, פתרונות ודף עבודה להדפסה.',
  intro: 'כשישר (חותך) חוצה שני ישרים מקבילים נוצרות שמונה זוויות. זוויות מתאימות (באותו מקום בכל אחת מנקודות החיתוך) שוות זו לזו. זוויות מתחלפות (משני צדי החותך, בין המקבילים) שוות זו לזו. זוויות חד־צדדיות (באותו צד של החותך, בין המקבילים) משלימות זו את זו ל-180°.',
  tips: ['מתאימות ומתחלפות — שוות.', 'חד־צדדיות — סכומן 180°.', 'בכל נקודת חיתוך יש רק שני גדלים: α ו-180° − α.'],
  example: { q: 'a ∥ b. זווית חד־צדדית אחת היא 2x והשנייה 3x + 30°. מצאו את x.', steps: ['2x + 3x + 30 = 180', '5x = 150', 'x = 30'], a: 'x = 30' },
  faq: [
    { q: 'איך מבחינים בין זוויות מתחלפות למתאימות?', a: 'מתאימות נמצאות באותו צד של החותך ובאותו צד של כל ישר (למשל שתיהן מעל ומימין). מתחלפות נמצאות בין שני המקבילים ומשני צדי החותך — בצורת האות Z.' },
    { q: 'מה קורה אם הישרים לא מקבילים?', a: 'אז הזוויות המתאימות והמתחלפות אינן שוות. להפך: אם זוויות מתאימות שוות — הישרים מקבילים.' },
  ],
  levels: ['זוויות מתאימות ומתחלפות', 'כל סוגי הזוויות', 'משוואה עם x'],
  gen(level, r) {
    const theta = r.pick([45, 50, 55, 60, 65, 70, 75, 80, 100, 105, 110, 115, 120, 125, 130, 135])
    const size = p => (p % 2 ? 180 - theta : theta)
    if (level <= 2) {
      let p, q
      if (level === 1) { [p, q] = r.pick([[0, 0], [1, 1], [2, 2], [3, 3], [2, 0], [3, 1]]) } else { p = r.int(0, 3); q = r.int(0, 3) }
      const given = size(p), ans = size(q)
      const top = ['', '', '', ''], bottom = ['', '', '', '']
      top[p] = `${given}°`; bottom[q] = '?'
      const nm = pairName(p, q)
      return { q: 'הישרים a ו-b מקבילים. מה גודל הזווית המסומנת ב-?', svg: parallelSvg(theta, top, bottom), type: 'number', answer: ans, unit: '°', explain: nm ? `${nm} ${nm.includes('חד') ? `משלימות ל-180°: 180° − ${given}° = ${ans}°` : `שוות: ${ans}°`}` : `בכל נקודת חיתוך יש רק שני גדלים של זוויות: ${theta}° ו-${180 - theta}°. הזווית המבוקשת ${given === ans ? 'שווה לזווית הנתונה' : `משלימה את הזווית הנתונה ל-180°: 180° − ${given}°`} = ${ans}°` }
    }
    if (r.bool()) {
      // equal pair: a x + b = c x + d
      const [p, q] = r.pick([[0, 0], [2, 0], [3, 1], [1, 1]])
      const ang = size(p), a = r.int(2, 5), c = r.int(a + 1, 7)
      const xs = []
      for (let x = 5; x <= 40; x++) if (ang - a * x >= 0 && (ang - a * x) % 1 === 0 && ang - c * x > -100) xs.push(x)
      const x = r.pick(xs.filter(v => ang - c * v !== 0).length ? xs.filter(v => ang - c * v !== 0) : xs)
      const b = ang - a * x, d = ang - c * x
      const top = ['', '', '', ''], bottom = ['', '', '', '']
      top[p] = lin(a, b); bottom[q] = lin(c, d)
      return { q: 'הישרים a ו-b מקבילים. מצאו את x.', svg: parallelSvg(theta, top, bottom), type: 'number', answer: x, explain: `${pairName(p, q)} שוות: ${lin(a, b)} = ${lin(c, d)} ← ${terms([[c - a, 'x']])} = ${fmt(b - d)} ← x = ${x}` }
    }
    const [p, q] = r.pick([[2, 1], [3, 0]])
    const a = r.int(1, 4), c = r.int(1, 4), x = r.int(5, 25)
    const angP = size(p)
    const b = angP - a * x
    const d = 180 - (a + c) * x - b
    const top = ['', '', '', ''], bottom = ['', '', '', '']
    top[p] = lin(a, b); bottom[q] = lin(c, d)
    return { q: 'הישרים a ו-b מקבילים. מצאו את x.', svg: parallelSvg(theta, top, bottom), type: 'number', answer: x, explain: `זוויות חד־צדדיות משלימות ל-180°: (${lin(a, b)}) + (${lin(c, d)}) = 180 ← ${a + c}x = ${fmt(180 - b - d)} ← x = ${x}` }
  },
}

const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [6, 8, 10], [9, 12, 15], [20, 21, 29], [9, 40, 41], [12, 16, 20], [15, 20, 25], [10, 24, 26], [12, 35, 37]]
export function rightTriangleSvg(a, b, labels, names = ['A', 'B', 'C']) {
  // right angle at C (index 2); a = BC horizontal, b = AC vertical
  const F = fit([[0, b], [a, 0], [0, 0]], 230, 170)
  // sides: 0 = AB (hypotenuse), 1 = BC, 2 = CA
  return polySvg(F.P, F.w, F.h, { names, sides: labels, right: 2 })
}
const pythagoras = {
  slug: 'pythagorean-theorem',
  grade: 8,
  strand: 'geometry',
  title: 'משפט פיתגורס',
  emoji: '📐',
  desc: 'משפט פיתגורס לכיתה ח׳: חישוב היתר, חישוב ניצב, אלכסון של מלבן ותוצאות לא שלמות עם עיגול. תרגילים עם שרטוט משולש ישר זווית, פתרונות ודף להדפסה.',
  intro: 'במשולש ישר זווית, הצלע שמול הזווית הישרה נקראת יתר, ושתי הצלעות האחרות נקראות ניצבים. משפט פיתגורס קובע שסכום ריבועי הניצבים שווה לריבוע היתר: a² + b² = c². בעזרתו מוצאים צלע חסרה: את היתר — בשורש של סכום הריבועים, וניצב — בשורש של הפרש הריבועים.',
  tips: ['היתר הוא תמיד הצלע הארוכה ביותר, מול הזווית הישרה.', 'יתר: c = √(a² + b²). ניצב: a = √(c² − b²).', 'שלשות שכדאי לזכור: 3, 4, 5 · ‏5, 12, 13 · ‏8, 15, 17.'],
  example: { q: 'במשולש ישר זווית הניצבים הם 6 ס״מ ו-8 ס״מ. מהו אורך היתר?', steps: ['6² + 8² = 36 + 64 = 100', '√100 = 10'], a: '10 ס״מ' },
  faq: [
    { q: 'האם משפט פיתגורס נכון בכל משולש?', a: 'לא, רק במשולש ישר זווית. להפך: אם במשולש מתקיים a² + b² = c², המשולש ישר זווית (המשפט ההפוך).' },
    { q: 'מה עושים כשהשורש לא יוצא מספר שלם?', a: 'משאירים את התשובה כשורש (למשל √13) או מעגלים בעזרת מחשבון לפי מה שנדרש בשאלה.' },
  ],
  levels: ['חישוב היתר', 'חישוב ניצב', 'תוצאה לא שלמה (עיגול) ואלכסון מלבן'],
  gen(level, r) {
    if (level <= 2) {
      const [a0, b0, c0] = r.pick(TRIPLES), k = r.pick([1, 1, 2, 3])
      let [a, b] = r.bool() ? [a0 * k, b0 * k] : [b0 * k, a0 * k]
      const c = c0 * k
      if (level === 1) return { q: 'במשולש ABC ‏(‎∠C = 90°) נתונים אורכי הניצבים בס״מ. מהו אורך היתר AB?', svg: rightTriangleSvg(a, b, ['?', String(a), String(b)]), type: 'number', answer: c, unit: 'ס״מ', explain: `AB² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c} ← AB = √${c * c} = ${c}` }
      return { q: 'במשולש ABC ‏(‎∠C = 90°) נתונים אורך היתר ואורך ניצב אחד בס״מ. מהו אורך הניצב החסר?', svg: rightTriangleSvg(a, b, [String(c), String(a), '?']), type: 'number', answer: b, unit: 'ס״מ', explain: `AC² = ${c}² − ${a}² = ${c * c} − ${a * a} = ${b * b} ← AC = ${b}` }
    }
    let a = r.int(2, 15), b = r.int(2, 15)
    while (Number.isInteger(Math.sqrt(a * a + b * b))) b++
    const rect = r.bool()
    if (rect) {
      const d = Math.round(Math.sqrt(a * a + b * b) * 100) / 100
      const F = fit([[0, 0], [a, 0], [a, b], [0, b]], 230, 160)
      const svg = polySvg(F.P, F.w, F.h, { names: ['A', 'B', 'C', 'D'], sides: [String(a), String(b), '', ''], right: 0, fill: '#ffd23f', extra: svgLine(F.P[0], F.P[2], { w: 2, dash: true, color: ACCENT }) + svgText((F.P[0][0] + F.P[2][0]) / 2 - 10, (F.P[0][1] + F.P[2][1]) / 2 - 10, '?', { size: 13, fill: ACCENT }) })
      return { q: 'מהו אורך האלכסון AC של המלבן? (המידות בס״מ, עגלו לשתי ספרות אחרי הנקודה)', svg, type: 'number', answer: d, tol: 0.011, unit: 'ס״מ', explain: `AC² = ${a}² + ${b}² = ${a * a + b * b} ← AC = √${a * a + b * b} ≈ ${d}` }
    }
    const c = Math.max(a, b) + r.int(1, 6)
    const leg = Math.min(a, b)
    const v = c * c - leg * leg
    if (Number.isInteger(Math.sqrt(v))) {
      return { q: 'במשולש ABC ‏(‎∠C = 90°) נתונים אורכי הניצבים בס״מ. מהו אורך היתר AB? (עגלו לשתי ספרות אחרי הנקודה)', svg: rightTriangleSvg(a, b, ['?', String(a), String(b)]), type: 'number', answer: Math.round(Math.sqrt(a * a + b * b) * 100) / 100, tol: 0.011, unit: 'ס״מ', explain: `AB = √(${a}² + ${b}²) = √${a * a + b * b} ≈ ${Math.round(Math.sqrt(a * a + b * b) * 100) / 100}` }
    }
    const ans = Math.round(Math.sqrt(v) * 100) / 100
    return { q: 'במשולש ABC ‏(‎∠C = 90°) נתונים אורך היתר ואורך ניצב בס״מ. מהו אורך הניצב החסר? (עגלו לשתי ספרות אחרי הנקודה)', svg: rightTriangleSvg(leg, Math.sqrt(v), [String(c), String(leg), '?']), type: 'number', answer: ans, tol: 0.011, unit: 'ס״מ', explain: `AC = √(${c}² − ${leg}²) = √${v} ≈ ${ans}` }
  },
}

const CONG = ['צ.ז.צ', 'ז.צ.ז', 'צ.צ.צ', 'צ.צ.ז', 'לא ניתן לקבוע חפיפה']
function congruenceSvg() {
  const T = [[0, 0], [4, 0], [1.3, 2.6]]
  const F = fit(T.concat(T.map(([x, y]) => [x + 6.4, y])), 240, 130, 18)
  const left = polySvg(F.P.slice(0, 3), F.w, F.h, { names: ['B', 'C', 'A'] })
  const right = polySvg(F.P.slice(3), F.w, F.h, { names: ['E', 'F', 'D'], fill: '#86efac' })
  return left.replace('</svg>', right.replace(/^<svg[^>]*>/, ''))
}
const congruence = {
  slug: 'triangle-congruence',
  grade: 8,
  strand: 'geometry',
  title: 'משפטי חפיפת משולשים',
  emoji: '🔺',
  desc: 'משפטי חפיפת משולשים לכיתה ח׳: צ.ז.צ, ז.צ.ז, צ.צ.צ ו-צ.צ.ז — זיהוי משפט החפיפה המתאים ומקרים שבהם אי אפשר לקבוע חפיפה. תרגול עם שרטוט והסבר.',
  intro: 'שני משולשים חופפים אם אפשר להניח אחד על השני כך שיתלכדו: כל הצלעות והזוויות המתאימות שוות. כדי להוכיח חפיפה מספיק להראות שלושה נתונים מתאימים לפי אחד ממשפטי החפיפה: צ.ז.צ (שתי צלעות והזווית שביניהן), ז.צ.ז (צלע ושתי הזוויות שלידה), צ.צ.צ (שלוש צלעות) או צ.צ.ז (שתי צלעות והזווית שמול הגדולה מביניהן). שלוש זוויות שוות אינן מספיקות.',
  tips: ['צ.ז.צ — הזווית חייבת להיות בין שתי הצלעות.', 'ז.צ.ז — הצלע חייבת להיות בין שתי הזוויות.', 'צ.צ.ז — הזווית חייבת להיות מול הצלע הגדולה מבין השתיים.'],
  example: { q: 'נתון: AB = DE, ∠B = ∠E, BC = EF. לפי איזה משפט △ABC ≅ △DEF?', steps: ['הזווית B נמצאת בין הצלעות AB ו-BC', 'שתי צלעות והזווית שביניהן'], a: 'צ.ז.צ' },
  faq: [
    { q: 'למה ז.ז.ז אינו משפט חפיפה?', a: 'שני משולשים יכולים להיות בעלי אותן זוויות אבל בגדלים שונים — אחד הגדלה של השני. הם דומים, אבל לא חופפים.' },
    { q: 'למה ב-צ.צ.ז הזווית צריכה להיות מול הצלע הגדולה?', a: 'אם הזווית מול הצלע הקטנה, ייתכנו שני משולשים שונים עם אותם נתונים, ולכן אי אפשר לקבוע חפיפה.' },
  ],
  levels: ['צ.ז.צ, ז.צ.ז, צ.צ.צ', 'כולל צ.צ.ז', 'כולל מקרים שאינם מספיקים'],
  gen(level, r) {
    const V = ['A', 'B', 'C'], M = { A: 'D', B: 'E', C: 'F' }
    const side = (p, q) => `${p}${q} = ${M[p]}${M[q]}`
    const ang = p => `∠${p} = ∠${M[p]}`
    const pool = level === 1 ? ['SAS', 'ASA', 'SSS'] : level === 2 ? ['SAS', 'ASA', 'SSS', 'SSA', 'SSA'] : ['SAS', 'ASA', 'SSS', 'SSA', 'AAA', 'SSAbad', 'SSAbad']
    const kind = r.pick(pool)
    const [v, w, u] = r.shuffle(V)
    let facts, answer, why
    if (kind === 'SAS') { facts = [side(w, v), ang(v), side(v, u)]; answer = 'צ.ז.צ'; why = `הזווית ${v} נמצאת בין הצלעות ${w}${v} ו-${v}${u}` }
    else if (kind === 'ASA') { facts = [ang(v), side(v, w), ang(w)]; answer = 'ז.צ.ז'; why = `הצלע ${v}${w} נמצאת בין הזוויות ${v} ו-${w}` }
    else if (kind === 'SSS') { facts = [side(v, w), side(w, u), side(v, u)]; answer = 'צ.צ.צ'; why = 'שלוש צלעות שוות בהתאמה' }
    else if (kind === 'AAA') { facts = [ang(v), ang(w), ang(u)]; answer = 'לא ניתן לקבוע חפיפה'; why = 'שלוש זוויות שוות אינן מספיקות — המשולשים דומים אבל לא בהכרח חופפים' }
    else {
      // sides v-w and v-u, angle at w (opposite side v-u)
      const good = kind === 'SSA'
      facts = [side(v, w), side(v, u), ang(w), good ? `${v}${u} > ${v}${w}` : `${v}${u} < ${v}${w}`]
      answer = good ? 'צ.צ.ז' : 'לא ניתן לקבוע חפיפה'
      why = good ? `הזווית ${w} נמצאת מול הצלע ${v}${u}, שהיא הגדולה מבין שתי הצלעות` : `הזווית ${w} נמצאת מול הצלע הקטנה ${v}${u}, ולכן הנתונים אינם מספיקים`
    }
    const shown = kind === 'SSA' || kind === 'SSAbad' ? [...r.shuffle(facts.slice(0, 3)), facts[3]] : r.shuffle(facts)
    const choices = level === 1 ? r.shuffle(CONG.slice(0, 3)) : level === 2 ? r.shuffle(CONG.slice(0, 4)) : r.shuffle(CONG)
    return { q: `נתון: ${shown.join(', ')}. לפי איזה משפט חפיפה △ABC ≅ △DEF?`, svg: congruenceSvg(), type: 'choice', answer, choices, explain: `${why}: ${answer}` }
  },
}

const quadrilaterals = {
  slug: 'quadrilaterals',
  grade: 8,
  strand: 'geometry',
  title: 'מרובעים: מקבילית, מעוין וטרפז',
  emoji: '🔷',
  desc: 'מרובעים לכיתה ח׳: סכום הזוויות במרובע, זוויות במקבילית ובטרפז, שטח מעוין לפי אלכסונים ותכונות המקבילית. תרגול עם שרטוטים, פתרונות ודף להדפסה.',
  intro: 'סכום הזוויות בכל מרובע הוא 360°. במקבילית הצלעות הנגדיות מקבילות ושוות, הזוויות הנגדיות שוות, וכל שתי זוויות סמוכות משלימות ל-180°. בטרפז יש זוג אחד של צלעות מקבילות (בסיסים), ולכן שתי הזוויות שליד כל שוק משלימות ל-180°. מעוין הוא מקבילית שכל צלעותיה שוות; אלכסוניו מאונכים זה לזה, ושטחו הוא מכפלת האלכסונים חלקי 2.',
  tips: ['מרובע: סכום הזוויות 360°.', 'מקבילית: זוויות נגדיות שוות, זוויות סמוכות — 180°.', 'מעוין: S = (d₁ × d₂) ÷ 2.'],
  example: { q: 'במקבילית ABCD ‏∠A = 70°. מה גודל ∠B ו-∠C?', steps: ['∠B סמוכה ל-∠A: 180° − 70° = 110°', '∠C נגדית ל-∠A: 70°'], a: '∠B = 110°, ∠C = 70°' },
  faq: [
    { q: 'האם מלבן הוא מקבילית?', a: 'כן. מלבן הוא מקבילית שכל זוויותיה ישרות, וריבוע הוא גם מלבן וגם מעוין.' },
    { q: 'מה ההבדל בין טרפז למקבילית?', a: 'בטרפז רק זוג אחד של צלעות נגדיות מקבילות, ואילו במקבילית שני הזוגות מקבילים.' },
  ],
  levels: ['סכום זוויות במרובע', 'זוויות במקבילית ובטרפז', 'משוואות זוויות ושטח מעוין'],
  gen(level, r) {
    if (level === 1) {
      const A = r.int(60, 130), B = r.int(60, 130), C = r.int(50, 120)
      const D = 360 - A - B - C
      if (D < 30 || D > 170) return quadrilaterals.gen(1, r)
      const pts = quadFromAngles(A, B, C)
      if (!pts) return quadrilaterals.gen(1, r)
      const ask = r.int(0, 3), vals = [A, B, C, D]
      const F = fit(pts, 230, 170)
      const svg = polySvg(F.P, F.w, F.h, { names: ['A', 'B', 'C', 'D'], angles: vals.map((v, i) => (i === ask ? '?' : `${v}°`)), fill: '#c4b5fd' })
      const known = vals.filter((_, i) => i !== ask)
      return { q: 'מה גודל הזווית המסומנת ב-? במרובע ABCD?', svg, type: 'number', answer: vals[ask], unit: '°', explain: `360° − ${known.join('° − ')}° = ${vals[ask]}°` }
    }
    if (level === 2) {
      const a = r.int(40, 140)
      if (a === 90) return quadrilaterals.gen(2, r)
      const trap = r.bool()
      if (trap) {
        const pts = [[0, 0], [7, 0], [7 - 3 / Math.tan((r.int(55, 80) * Math.PI) / 180), 3], [3 / Math.tan((a * Math.PI) / 180), 3]]
        const F = fit(pts, 230, 150)
        const svg = polySvg(F.P, F.w, F.h, { names: ['A', 'B', 'C', 'D'], angles: [`${a}°`, '', '', '?'], fill: '#c4b5fd' })
        return { q: 'בטרפז ABCD ‏(AB ∥ DC). מה גודל הזווית D?', svg, type: 'number', answer: 180 - a, unit: '°', explain: `הזוויות A ו-D נמצאות ליד אותה שוק ומשלימות ל-180°: 180° − ${a}° = ${180 - a}°` }
      }
      const ask = r.int(1, 3)
      const vals = [a, 180 - a, a, 180 - a]
      const off = 3 / Math.tan((a * Math.PI) / 180)
      const F = fit([[0, 0], [6, 0], [6 + off, 3], [off, 3]], 230, 150)
      const svg = polySvg(F.P, F.w, F.h, { names: ['A', 'B', 'C', 'D'], angles: vals.map((v, i) => (i === 0 ? `${a}°` : i === ask ? '?' : '')), fill: '#c4b5fd' })
      return { q: 'ABCD מקבילית. מה גודל הזווית המסומנת ב-?', svg, type: 'number', answer: vals[ask], unit: '°', explain: ask === 2 ? `זוויות נגדיות במקבילית שוות: ${a}°` : `זוויות סמוכות במקבילית משלימות ל-180°: 180° − ${a}° = ${180 - a}°` }
    }
    if (r.bool()) {
      const d1 = r.int(3, 20), d2 = r.int(3, 20)
      const area = (d1 * d2) / 2
      const D1 = Math.max(d1, d2 * 0.7), D2 = Math.max(d2, d1 * 0.7) // drawn ratio clamped to keep labels legible
      const F = fit([[0, D2 / 2], [D1 / 2, 0], [0, -D2 / 2], [-D1 / 2, 0]], 220, 160)
      const extra = svgLine(F.P[0], F.P[2], { w: 1.5, dash: true }) + svgLine(F.P[1], F.P[3], { w: 1.5, dash: true }) +
        svgText((F.P[0][0] + F.P[2][0]) / 2 + 12, F.P[0][1] + (F.P[2][1] - F.P[0][1]) * 0.3, String(d2), { size: 12, fill: ACCENT }) +
        svgText(F.P[3][0] + (F.P[1][0] - F.P[3][0]) * 0.3, F.P[1][1] - 10, String(d1), { size: 12, fill: ACCENT })
      const svg = polySvg(F.P, F.w, F.h, { names: ['A', 'B', 'C', 'D'], extra, fill: '#c4b5fd' })
      return { q: `אורכי האלכסונים של המעוין ABCD הם ${d1} ס״מ ו-${d2} ס״מ. מהו שטח המעוין?`, svg, type: 'number', answer: area, unit: 'סמ״ר', explain: `${d1} × ${d2} ÷ 2 = ${fmt(area)} סמ״ר` }
    }
    // parallelogram: adjacent angles a x + b and c x + d (sum 180)
    const a = r.int(1, 4), c = r.int(1, 4), x = r.int(10, 30), b = r.int(-10, 30)
    const A = a * x + b
    if (A <= 20 || A >= 160) return quadrilaterals.gen(3, r)
    const d = 180 - A - c * x
    const larger = Math.max(A, 180 - A)
    const ask = r.bool() ? 'x' : 'big'
    return { q: ask === 'x' ? `במקבילית ABCD ‏∠A = ${lin(a, b)} ו-‏∠B = ${lin(c, d)} (במעלות). מצאו את x.` : `במקבילית ABCD ‏∠A = ${lin(a, b)} ו-‏∠B = ${lin(c, d)} (במעלות). מה גודל הזווית הגדולה במקבילית?`, type: 'number', answer: ask === 'x' ? x : larger, unit: ask === 'x' ? '' : '°', explain: `זוויות סמוכות משלימות ל-180°: ${a + c}x ${b + d < 0 ? '−' : '+'} ${Math.abs(b + d)} = 180 ← x = ${x}; ‏∠A = ${A}°, ∠B = ${180 - A}°` }
  },
}

// A convex quadrilateral with interior angles A, B, C (D implied) — walk the boundary.
function quadFromAngles(A, B, C) {
  const rad = d => (d * Math.PI) / 180
  // A=(0,0), B=(6,0); walk counter-clockwise turning left by the exterior angle at each vertex,
  // trying side lengths BC until the closing vertex D lies forward on both rays (convex).
  for (const bc of [4.5, 3.5, 5.5, 2.5, 6.5, 2, 8, 1.5, 10]) {
    const d1 = 180 - B, d2 = d1 + 180 - C
    const Cx = 6 + bc * Math.cos(rad(d1)), Cy = bc * Math.sin(rad(d1))
    const ux = Math.cos(rad(d2)), uy = Math.sin(rad(d2)), vx = Math.cos(rad(A)), vy = Math.sin(rad(A))
    // C + t u = s v
    const det = -ux * vy + vx * uy
    const t = (Cx * vy - vx * Cy) / det, sv = (ux * -Cy + uy * Cx) / det
    if (t > 1 && sv > 1) return [[0, 0], [6, 0], [Cx, Cy], [Cx + t * ux, Cy + t * uy]]
  }
  return null
}

const statistics = {
  slug: 'mean-median-mode',
  grade: 8,
  strand: 'data',
  title: 'ממוצע, חציון ושכיח',
  emoji: '📊',
  desc: 'סטטיסטיקה לכיתה ח׳: חישוב ממוצע, חציון ושכיח של נתונים, ממוצע מטבלת שכיחויות ומציאת נתון חסר לפי ממוצע. תרגול עם פתרון מוסבר ודף עבודה.',
  intro: 'מדדי מרכז מתארים במספר אחד את "האמצע" של קבוצת נתונים. הממוצע הוא סכום הנתונים חלקי מספרם. החציון הוא הנתון האמצעי אחרי שמסדרים את הנתונים לפי הגודל; אם מספר הנתונים זוגי, החציון הוא הממוצע של שני האמצעיים. השכיח הוא הנתון שמופיע הכי הרבה פעמים.',
  tips: ['ממוצע = סכום הנתונים ÷ מספר הנתונים.', 'לפני חישוב חציון — מסדרים את הנתונים מהקטן לגדול.', 'בטבלת שכיחויות: כופלים כל ערך בשכיחות שלו, מחברים ומחלקים בסך השכיחויות.'],
  example: { q: 'מצאו את החציון: 7, 3, 9, 4, 8, 5', steps: ['מסדרים: 3, 4, 5, 7, 8, 9', 'שני האמצעיים: 5 ו-7', '(5 + 7) ÷ 2 = 6'], a: '6' },
  faq: [
    { q: 'מתי עדיף חציון על ממוצע?', a: 'כשיש נתון חריג (גדול מאוד או קטן מאוד). הוא משפיע מאוד על הממוצע, אבל כמעט לא על החציון.' },
    { q: 'האם יכולים להיות כמה שכיחים?', a: 'כן. אם שני ערכים מופיעים הכי הרבה פעמים באותה מידה, לקבוצה יש שני שכיחים.' },
  ],
  levels: ['ממוצע', 'חציון ושכיח', 'נתון חסר וטבלת שכיחויות'],
  gen(level, r) {
    if (level === 1) {
      const n = r.int(4, 6), mean = r.int(5, 40)
      const data = Array.from({ length: n - 1 }, () => r.int(Math.max(0, mean - 15), mean + 15))
      const last = n * mean - data.reduce((s, v) => s + v, 0)
      if (last < 0 || last > 100) return statistics.gen(1, r)
      data.push(last)
      const list = r.shuffle(data)
      return { q: `מהו הממוצע של הנתונים: ${list.join(', ')}?`, type: 'number', answer: mean, explain: `סכום: ${list.join(' + ')} = ${n * mean}; ${n * mean} ÷ ${n} = ${mean}` }
    }
    if (level === 2) {
      if (r.bool()) {
        const n = r.int(5, 8)
        const data = Array.from({ length: n }, () => r.int(1, 30))
        const s = [...data].sort((a, b) => a - b)
        const med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2
        return { q: `מהו החציון של הנתונים: ${data.join(', ')}?`, type: 'number', answer: med, explain: `מסדרים: ${s.join(', ')}. ${n % 2 ? `הנתון האמצעי: ${med}` : `שני האמצעיים ${s[n / 2 - 1]} ו-${s[n / 2]}, החציון: ${fmt(med)}`}` }
      }
      const vals = r.shuffle([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]).slice(0, 4)
      const mode = vals[0]
      const data = r.shuffle([mode, mode, mode, vals[1], vals[1], vals[2], vals[3]])
      return { q: `מהו השכיח של הנתונים: ${data.join(', ')}?`, type: 'number', answer: mode, explain: `${mode} מופיע 3 פעמים — יותר מכל נתון אחר` }
    }
    if (r.bool()) {
      const n = r.int(4, 6), mean = r.int(60, 95)
      const known = Array.from({ length: n - 1 }, () => r.int(mean - 15, Math.min(100, mean + 15)))
      const missing = n * mean - known.reduce((s, v) => s + v, 0)
      if (missing < 40 || missing > 100) return statistics.gen(3, r)
      return { q: `ציוני מבחנים של תלמידה: ${known.join(', ')} ועוד מבחן אחד. ממוצע כל ${n} הציונים הוא ${mean}. מה הציון החסר?`, type: 'number', answer: missing, explain: `סכום כל הציונים: ${n} × ${mean} = ${n * mean}; סכום הידועים: ${known.reduce((s, v) => s + v, 0)}; החסר: ${missing}` }
    }
    let uniq, freq, N, S
    for (;;) {
      uniq = r.shuffle([0, 1, 2, 3, 4, 5]).slice(0, 3).sort((a, b) => a - b)
      freq = uniq.map(() => r.int(1, 8))
      N = freq.reduce((s, v) => s + v, 0); S = uniq.reduce((s, v, i) => s + v * freq[i], 0)
      let q = N / gcd(S, N)
      while (q % 2 === 0) q /= 2
      while (q % 5 === 0) q /= 5
      if (q === 1) break
    }
    const mean = S / N
    return { q: `בסקר שאלו תלמידים כמה אחים ואחיות יש להם: ${uniq.map((v, i) => (freq[i] === 1 ? `תלמיד אחד ענה ${v}` : `${freq[i]} תלמידים ענו ${v}`)).join(', ')}. מהו מספר האחים הממוצע? (אפשר לענות במספר עשרוני)`, type: 'number', answer: mean, explain: `(${uniq.map((v, i) => `${v} × ${freq[i]}`).join(' + ')}) ÷ ${N} = ${S} ÷ ${N} = ${fmt(mean)}` }
  },
}

export default [distributive, equations, inequalities, slope, linearFunction, systems, powers, parallelLines, pythagoras, congruence, quadrilaterals, statistics]
