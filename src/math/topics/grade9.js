// Grade 9 (כיתה ט׳) math topics — Israeli middle-school curriculum: short multiplication formulas,
// factoring, algebraic fractions, the quadratic equation (quadratic formula, discriminant), the
// parabola, square roots, similar triangles, right-triangle trigonometry and probability.
import {
  fmt, par, gcd, frac, fracShow, terms, lin, quad, pt, xpm, choiceSet,
  svgText, svgLine, fit, polySvg,
} from './grade7.js'

const fx = k => `(${xpm(k)})` // (x + k)
const coef = (c, v) => (c === 1 ? v : c === -1 ? '−' + v : fmt(c) + v)

const shortMult = {
  slug: 'short-multiplication-formulas',
  grade: 9,
  strand: 'algebra',
  title: 'נוסחאות הכפל המקוצר',
  emoji: '✳️',
  desc: 'נוסחאות הכפל המקוצר לכיתה ט׳: ריבוע של סכום, ריבוע של הפרש והפרש ריבועים — (a + b)², (a − b)², (a + b)(a − b). תרגול אמריקאי עם פתרון מלא.',
  intro: 'נוסחאות הכפל המקוצר הן קיצורי דרך לפתיחת סוגריים נפוצים. ריבוע של סכום: (a + b)² = a² + 2ab + b². ריבוע של הפרש: (a − b)² = a² − 2ab + b². הפרש ריבועים: (a + b)(a − b) = a² − b². הטעות הנפוצה היא לשכוח את האיבר האמצעי 2ab — (a + b)² אינו a² + b².',
  tips: ['(a + b)² = a² + 2ab + b²', '(a − b)² = a² − 2ab + b²', '(a + b)(a − b) = a² − b²'],
  example: { q: 'פתחו: (3x − 2)²', steps: ['a = 3x, b = 2', 'a² = 9x², 2ab = 12x, b² = 4', '9x² − 12x + 4'], a: '9x² − 12x + 4' },
  faq: [
    { q: 'למה (a + b)² לא שווה a² + b²?', a: 'כי (a + b)² = (a + b)(a + b), ובפתיחת הסוגריים מתקבלים גם שני האיברים ab ו-ba, שיחד הם 2ab.' },
    { q: 'איך הנוסחאות עוזרות בחשבון בעל פה?', a: 'למשל 51² = (50 + 1)² = 2500 + 100 + 1 = 2601, ו-49 × 51 = (50 − 1)(50 + 1) = 2500 − 1 = 2499.' },
  ],
  levels: ['(x ± a)²', 'הפרש ריבועים ו-(ax ± b)²', 'שני משתנים'],
  gen(level, r) {
    if (level === 1) {
      const a = r.nz(-12, 12)
      const answer = quad(1, 2 * a, a * a)
      return { q: 'פתחו לפי נוסחת הכפל המקוצר:', expr: `${fx(a)}²`, type: 'choice', answer, choices: choiceSet(r, answer, [quad(1, 0, a * a), quad(1, a, a * a), quad(1, -2 * a, a * a), quad(1, 2 * a, -a * a), quad(1, 0, -a * a), quad(1, 2 * a, 2 * a)]), explain: `x² ${a > 0 ? '+' : '−'} 2 × ${Math.abs(a)} × x + ${Math.abs(a)}² = ${answer}` }
    }
    if (level === 2) {
      const p = r.int(1, 6), q = r.int(1, 10)
      if (r.bool()) {
        const answer = quad(p * p, 0, -q * q)
        return { q: 'פתחו לפי נוסחת הכפל המקוצר:', expr: `(${lin(p, q)})(${lin(p, -q)})`, type: 'choice', answer, choices: choiceSet(r, answer, [quad(p * p, 0, q * q), quad(p * p, -2 * p * q, -q * q), quad(p, 0, -q), quad(p * p, 2 * p * q, -q * q), quad(p * p, 0, -2 * q)]), explain: `הפרש ריבועים: (${coef(p, 'x')})² − ${q}² = ${answer}` }
      }
      const s = r.pick([1, -1])
      const answer = quad(p * p, 2 * s * p * q, q * q)
      return { q: 'פתחו לפי נוסחת הכפל המקוצר:', expr: `(${lin(p, s * q)})²`, type: 'choice', answer, choices: choiceSet(r, answer, [quad(p * p, 0, q * q), quad(p * p, s * p * q, q * q), quad(p * p, -2 * s * p * q, q * q), quad(p, 2 * s * p * q, q * q), quad(p * p, 2 * s * p * q, -q * q)]), explain: `(${coef(p, 'x')})² ${s > 0 ? '+' : '−'} 2 × ${coef(p, 'x')} × ${q} + ${q}² = ${answer}` }
    }
    const a = r.int(1, 5), b = r.int(1, 5), s = r.pick([1, -1, 0])
    const T = (x2, xy, y2) => terms([[x2, 'x²'], [xy, 'xy'], [y2, 'y²']])
    if (s === 0) {
      const answer = T(a * a, 0, -b * b)
      return { q: 'פתחו לפי נוסחת הכפל המקוצר:', expr: `(${terms([[a, 'x'], [b, 'y']])})(${terms([[a, 'x'], [-b, 'y']])})`, type: 'choice', answer, choices: choiceSet(r, answer, [T(a * a, 0, b * b), T(a * a, -2 * a * b, -b * b), T(a * a, 2 * a * b, -b * b), T(a, 0, -b)]), explain: `הפרש ריבועים: (${coef(a, 'x')})² − (${coef(b, 'y')})² = ${answer}` }
    }
    const answer = T(a * a, 2 * s * a * b, b * b)
    return { q: 'פתחו לפי נוסחת הכפל המקוצר:', expr: `(${terms([[a, 'x'], [s * b, 'y']])})²`, type: 'choice', answer, choices: choiceSet(r, answer, [T(a * a, 0, b * b), T(a * a, s * a * b, b * b), T(a * a, -2 * s * a * b, b * b), T(a, 2 * s * a * b, b), T(a * a, 2 * s * a * b, -b * b)]), explain: `a = ${coef(a, 'x')}, b = ${coef(b, 'y')}: a² ${s > 0 ? '+' : '−'} 2ab + b² = ${answer}` }
  },
}

const factoring = {
  slug: 'factoring',
  grade: 9,
  strand: 'algebra',
  title: 'פירוק לגורמים',
  emoji: '🧱',
  desc: 'פירוק לגורמים לכיתה ט׳: הוצאת גורם משותף, הפרש ריבועים ופירוק טרינום x² + bx + c לשני סוגריים. תרגול אמריקאי עם הסבר לכל שלב ודף עבודה להדפסה.',
  intro: 'פירוק לגורמים הוא הפעולה ההפוכה לפתיחת סוגריים: כותבים ביטוי כמכפלה. מתחילים תמיד בבדיקה אם יש גורם משותף ומוציאים אותו מחוץ לסוגריים. אחר כך בודקים אם זה הפרש ריבועים, a² − b² = (a − b)(a + b). טרינום מהצורה x² + bx + c מפרקים ל-(x + p)(x + q), כאשר p + q = b ו-p × q = c.',
  tips: ['שלב ראשון תמיד: גורם משותף.', 'הפרש ריבועים: x² − 49 = (x − 7)(x + 7).', 'בטרינום מחפשים שני מספרים שמכפלתם c וסכומם b.'],
  example: { q: 'פרקו לגורמים: x² − 2x − 15', steps: ['מחפשים מכפלה −15 וסכום −2', '−5 ו-3: (−5) × 3 = −15, ‏−5 + 3 = −2', '(x − 5)(x + 3)'], a: '(x − 5)(x + 3)' },
  faq: [
    { q: 'איך בודקים שהפירוק נכון?', a: 'פותחים את הסוגריים שקיבלתם. אם מתקבל הביטוי המקורי — הפירוק נכון.' },
    { q: 'למה צריך לפרק לגורמים?', a: 'פירוק עוזר לפתור משוואות ריבועיות (מכפלה שווה לאפס כשאחד הגורמים אפס), לצמצם שברים אלגבריים ולחשב בקלות.' },
  ],
  levels: ['הוצאת גורם משותף', 'הפרש ריבועים', 'פירוק טרינום'],
  gen(level, r) {
    if (level === 1) {
      const g = r.int(1, 6), a1 = r.int(1, 5), b1 = r.nz(-9, 9)
      if (gcd(a1, b1) !== 1) return factoring.gen(1, r)
      const G = g === 1 ? 'x' : `${g}x`
      const answer = `${G}(${lin(a1, b1)})`
      const cands = [`${G}(${lin(a1, -b1)})`, `${g === 1 ? '2' : g}(${lin(a1, b1)})`, `${G}(${lin(a1 * g, b1 * g)})`, `x(${lin(a1, b1 * g)})`, `${G}(${lin(b1, a1)})`]
      return { q: 'פרקו לגורמים (הוציאו גורם משותף):', expr: quad(g * a1, g * b1, 0), type: 'choice', answer, choices: choiceSet(r, answer, cands), explain: `הגורם המשותף הוא ${G}: ${quad(g * a1, g * b1, 0)} = ${answer}` }
    }
    if (level === 2) {
      const p = r.pick([1, 1, 1, 2, 3, 4, 5]), q = r.int(1, 12)
      if (p === q || gcd(p, q) !== 1) return factoring.gen(2, r)
      const answer = `(${lin(p, -q)})(${lin(p, q)})`
      const cands = [`(${lin(p, -q)})²`, `(${lin(p, q)})²`, `(${lin(q, -p)})(${lin(q, p)})`, `(${lin(p, -2 * q)})(${lin(p, 2 * q)})`]
      return { q: 'פרקו לגורמים (הפרש ריבועים):', expr: quad(p * p, 0, -q * q), type: 'choice', answer, choices: choiceSet(r, answer, cands), explain: `${quad(p * p, 0, -q * q)} = (${coef(p, 'x')})² − ${q}² = ${answer}` }
    }
    const p = r.nz(-9, 9), q = r.nz(-9, 9)
    if (p === q || p === -q) return factoring.gen(3, r)
    const k = r.pick([1, 1, 1, 2, 3])
    const K = k === 1 ? '' : String(k)
    const answer = `${K}${fx(p)}${fx(q)}`
    const cands = [`${K}${fx(-p)}${fx(-q)}`, `${K}${fx(p)}${fx(-q)}`, `${K}${fx(-p)}${fx(q)}`, `${K}${fx(p + q)}${fx(1)}`]
    return { q: 'פרקו לגורמים:', expr: quad(k, k * (p + q), k * p * q), type: 'choice', answer, choices: choiceSet(r, answer, cands), explain: `${k > 1 ? `מוציאים ${k} כגורם משותף: ${k}(${quad(1, p + q, p * q)}). ` : ''}מחפשים שני מספרים שמכפלתם ${fmt(p * q)} וסכומם ${fmt(p + q)}: ${fmt(p)} ו-${par(q)}. ${answer}` }
  },
}

const algFractions = {
  slug: 'algebraic-fractions',
  grade: 9,
  strand: 'algebra',
  title: 'צמצום שברים אלגבריים',
  emoji: '➗',
  desc: 'צמצום שברים אלגבריים לכיתה ט׳: פירוק המונה והמכנה לגורמים (גורם משותף, הפרש ריבועים, טרינום) וצמצום גורם משותף. תרגול אמריקאי עם פתרון מלא.',
  intro: 'שבר אלגברי הוא שבר שיש משתנה במונה או במכנה. כדי לצמצם אותו מפרקים את המונה ואת המכנה לגורמים, ורק אז מצמצמים גורם שמופיע בשניהם — כמו בצמצום שבר רגיל. אסור לצמצם מחוברים: ב-(x + 6)/6 אי אפשר "למחוק" את ה-6. חשוב גם לזכור שהמכנה אינו יכול להיות אפס, ולכן יש ערכי x שאינם מותרים.',
  tips: ['קודם מפרקים לגורמים, אחר כך מצמצמים.', 'מצמצמים רק גורמים (כופלים), לא מחוברים.', '(x² − 9)/(x − 3) = x + 3, בתנאי ש-x ≠ 3.'],
  example: { q: 'צמצמו: (x² + 5x + 6)/(x² − 4)', steps: ['מונה: (x + 2)(x + 3)', 'מכנה: (x − 2)(x + 2)', 'מצמצמים את (x + 2): (x + 3)/(x − 2)'], a: '(x + 3)/(x − 2)' },
  faq: [
    { q: 'למה אסור לצמצם מחוברים?', a: 'כי צמצום הוא חילוק של המונה והמכנה באותו גורם. ב-(x + 6)/6 חילוק ב-6 נותן (x/6 + 1)/1 ולא x.' },
    { q: 'מהו תחום ההגדרה של שבר אלגברי?', a: 'כל ערכי x שעבורם המכנה אינו אפס. למשל ב-(x + 1)/(x − 5) צריך x ≠ 5.' },
  ],
  levels: ['גורם משותף', 'הפרש ריבועים', 'טרינום והפרש ריבועים'],
  gen(level, r) {
    const note = 'צמצמו את השבר (בתחום שבו המכנה אינו אפס):'
    if (level === 1) {
      if (r.bool()) {
        const a = r.int(2, 9), b = r.nz(-9, 9)
        const answer = lin(1, b)
        return { q: note, expr: `(${lin(a, a * b)})/${a}`, type: 'choice', answer, choices: choiceSet(r, answer, [lin(1, a * b), lin(a, b), lin(1, -b), lin(a, a * b - a)]), explain: `${lin(a, a * b)} = ${a}(${lin(1, b)}); מצמצמים ב-${a}: ${answer}` }
      }
      const b = r.nz(-9, 9), a = r.int(1, 4)
      const answer = lin(a, b)
      return { q: note, expr: `(${quad(a, b, 0)})/x`, type: 'choice', answer, choices: choiceSet(r, answer, [quad(a, b, 0), lin(a, -b), lin(1, b * a), lin(a + b, 0)]), explain: `${quad(a, b, 0)} = x(${lin(a, b)}); מצמצמים ב-x: ${answer}` }
    }
    if (level === 2) {
      const p = r.int(1, 10), s = r.pick([1, -1])
      const answer = lin(1, -s * p)
      return { q: note, expr: `(${quad(1, 0, -p * p)})/(${lin(1, s * p)})`, type: 'choice', answer, choices: choiceSet(r, answer, [lin(1, s * p), lin(1, -p * p), quad(1, 0, -p), lin(1, -s * p * p)]), explain: `x² − ${p * p} = (x − ${p})(x + ${p}); מצמצמים את ${fx(s * p)}: ${answer}` }
    }
    const p = r.nz(-8, 8), q = r.nz(-8, 8)
    if (q === -p || q === p) return algFractions.gen(3, r)
    const answer = `${fx(q)}/${fx(-p)}`
    const cands = [`${fx(-q)}/${fx(p)}`, `${fx(q)}/${fx(p)}`, `${fx(p)}/${fx(-q)}`, `${fx(-q)}/${fx(-p)}`, `${fmt(q)}/${par(-p)}`]
    return { q: note, expr: `(${quad(1, p + q, p * q)})/(${quad(1, 0, -p * p)})`, type: 'choice', answer, choices: choiceSet(r, answer, cands), explain: `מונה: ${fx(p)}${fx(q)}; מכנה: ${fx(-p)}${fx(p)}; מצמצמים את ${fx(p)}: ${answer}` }
  },
}

const quadEq = {
  slug: 'quadratic-equation',
  grade: 9,
  strand: 'algebra',
  title: 'משוואה ריבועית ונוסחת השורשים',
  emoji: '🧮',
  desc: 'פתרון משוואה ריבועית לכיתה ט׳: x² = k, הוצאת גורם משותף, פירוק טרינום ונוסחת השורשים ax² + bx + c = 0. תרגול עם בדיקה מלאה, הסבר ודף להדפסה.',
  intro: 'משוואה ריבועית היא משוואה מהצורה ax² + bx + c = 0, כאשר a ≠ 0. יש לה לכל היותר שני פתרונות. משוואות פשוטות פותרים בפירוק לגורמים: אם מכפלה שווה לאפס, אחד הגורמים שווה לאפס. במקרה הכללי משתמשים בנוסחת השורשים: x = (−b ± √(b² − 4ac)) / 2a.',
  tips: ['x² = 25 ← x = 5 או x = −5 (לא לשכוח את הפתרון השלילי).', 'x² − 7x = 0 ← x(x − 7) = 0 ← x = 0 או x = 7.', 'בנוסחת השורשים מחשבים קודם את הדיסקרימיננטה b² − 4ac.'],
  example: { q: 'פתרו: 2x² − 7x + 3 = 0', steps: ['a = 2, b = −7, c = 3', 'b² − 4ac = 49 − 24 = 25, ‏√25 = 5', 'x = (7 ± 5) / 4 ← x = 3 או x = 0.5'], a: 'x = 3, x = 0.5' },
  faq: [
    { q: 'איך כותבים שני פתרונות?', a: 'רושמים את שניהם, למשל x₁ = 3, x₂ = −2. בתרגול כאן מקלידים את שני המספרים מופרדים בפסיק.' },
    { q: 'מה עושים אם b² − 4ac שלילי?', a: 'אז אין למשוואה פתרון (במספרים ממשיים), כי אי אפשר להוציא שורש ממספר שלילי.' },
  ],
  levels: ['x² = k ו-x(x − a) = 0', 'טרינום עם a = 1', 'נוסחת השורשים (a ≠ 1)'],
  gen(level, r) {
    const q = 'פתרו את המשוואה (רשמו את שני הפתרונות מופרדים בפסיק):'
    if (level === 1) {
      if (r.bool()) {
        const k = r.int(1, 15), m = r.pick([1, 1, 2, 3])
        return { q, expr: m === 1 ? `x² − ${k * k} = 0` : `${m}x² = ${m * k * k}`, type: 'numbers', answer: [k, -k], explain: `x² = ${k * k} ← x = ${k} או x = −${k}` }
      }
      const a = r.nz(-12, 12)
      return { q, expr: `${quad(1, -a, 0)} = 0`, type: 'numbers', answer: [0, a], explain: `x(${lin(1, -a)}) = 0 ← x = 0 או x = ${fmt(a)}` }
    }
    if (level === 2) {
      const p = r.nz(-10, 10), s = r.nz(-10, 10)
      if (p === s) return quadEq.gen(2, r)
      return { q, expr: `${quad(1, -(p + s), p * s)} = 0`, type: 'numbers', answer: [p, s], explain: `מחפשים שני מספרים שמכפלתם ${fmt(p * s)} וסכומם ${fmt(-(p + s))}: ${fx(-p)}${fx(-s)} = 0 ← x = ${fmt(p)} או x = ${fmt(s)}` }
    }
    const a = r.pick([2, 2, 3, 4, 5, -2]), p = r.nz(-9, 9), s = r.int(-6, 6)
    if (p % a === 0) return quadEq.gen(3, r)
    // (a x − p)(x − s) = a x² − (p + a s) x + p s
    const A = a, B = -(p + a * s), C = p * s
    const D = B * B - 4 * A * C, sq = Math.round(Math.sqrt(D))
    const r1 = p / a
    return { q, expr: `${quad(A, B, C)} = 0`, type: 'numbers', answer: [s, r1], explain: `a = ${fmt(A)}, b = ${fmt(B)}, c = ${fmt(C)}; b² − 4ac = ${D}, ‏√${D} = ${sq}; x = (${fmt(-B)} ± ${sq}) / ${par(2 * A)} ← x = ${fmt(s)} או x = ${fmt(r1)}` }
  },
}

const discriminant = {
  slug: 'discriminant',
  grade: 9,
  strand: 'algebra',
  title: 'מספר הפתרונות של משוואה ריבועית (דיסקרימיננטה)',
  emoji: '🔍',
  desc: 'הדיסקרימיננטה b² − 4ac לכיתה ט׳: קובעים אם למשוואה ריבועית יש שני פתרונות, פתרון אחד או אין פתרון, ומוצאים פרמטר לפתרון יחיד. תרגול עם פתרונות.',
  intro: 'הביטוי b² − 4ac שמתחת לשורש בנוסחת השורשים נקרא דיסקרימיננטה (ומסומן לפעמים Δ). אם הוא חיובי — למשוואה שני פתרונות שונים. אם הוא אפס — פתרון אחד בלבד. אם הוא שלילי — אין פתרון. כך אפשר לדעת כמה פתרונות יש בלי לפתור את המשוואה עד הסוף.',
  tips: ['Δ = b² − 4ac', 'Δ > 0 ← שני פתרונות; Δ = 0 ← פתרון אחד; Δ < 0 ← אין פתרון.', 'שימו לב לסימנים: אם c שלילי ו-a חיובי, ‏−4ac חיובי.'],
  example: { q: 'כמה פתרונות יש למשוואה x² − 6x + 9 = 0?', steps: ['Δ = (−6)² − 4 × 1 × 9 = 36 − 36 = 0', 'Δ = 0 ← פתרון אחד (x = 3)'], a: '1' },
  faq: [
    { q: 'מה הקשר בין הדיסקרימיננטה לגרף הפרבולה?', a: 'מספר הפתרונות שווה למספר נקודות החיתוך של הפרבולה y = ax² + bx + c עם ציר x: שתיים, אחת (הקודקוד על הציר) או אף אחת.' },
    { q: 'אם a ו-c בסימנים שונים, כמה פתרונות יש?', a: 'תמיד שניים, כי אז ‏−4ac חיובי ו-b² − 4ac בהכרח חיובי.' },
  ],
  levels: ['משוואות עם a = 1', 'מקדמים כלליים', 'מציאת פרמטר לפתרון יחיד'],
  gen(level, r) {
    if (level <= 2) {
      const want = r.pick([0, 1, 2])
      const a = level === 1 ? 1 : r.pick([2, 3, 4, 5, -1, -2, -3])
      let b, c
      if (want === 1) { const t = r.nz(-6, 6); b = -2 * a * t; c = a * t * t } else {
        b = r.int(-12, 12)
        const lim = (b * b) / (4 * a), k = r.int(1, 10)
        if (want === 0) c = a > 0 ? Math.floor(lim) + k : Math.ceil(lim) - k
        else c = a > 0 ? Math.ceil(lim) - k : Math.floor(lim) + k
      }
      const D = b * b - 4 * a * c
      const n = D > 0 ? 2 : D === 0 ? 1 : 0
      return { q: 'כמה פתרונות יש למשוואה? (0, 1 או 2)', expr: `${quad(a, b, c)} = 0`, type: 'number', answer: n, explain: `Δ = ${par(b)}² − 4 × ${par(a)} × ${par(c)} = ${b * b} ${-4 * a * c < 0 ? '−' : '+'} ${Math.abs(4 * a * c)} = ${fmt(D)} ← ${n === 2 ? 'חיובי: שני פתרונות' : n === 1 ? 'אפס: פתרון אחד' : 'שלילי: אין פתרון'}` }
    }
    if (r.bool()) {
      const h = r.nz(-9, 9), b = 2 * h
      return { q: 'לאיזה ערך של k יש למשוואה פתרון אחד בלבד?', expr: `x² ${b < 0 ? '−' : '+'} ${Math.abs(b)}x + k = 0`, type: 'number', answer: h * h, explain: `פתרון יחיד כש-Δ = 0: ${b * b} − 4k = 0 ← k = ${h * h}` }
    }
    const m = r.int(1, 9), a = r.pick([1, 1, 4, 9])
    // a x² + k x + m² = 0, k > 0: k² = 4 a m²  → k = 2 m √a
    const k = 2 * m * Math.sqrt(a)
    return { q: 'לאיזה ערך חיובי של k יש למשוואה פתרון אחד בלבד?', expr: `${a === 1 ? '' : a}x² + kx + ${m * m} = 0`, type: 'number', answer: k, explain: `Δ = k² − 4 × ${a} × ${m * m} = 0 ← k² = ${4 * a * m * m} ← k = ${k}` }
  },
}

const vertexForm = (h, k) => `y = ${h === 0 ? 'x²' : `${fx(-h)}²`}${k ? ` ${k < 0 ? '−' : '+'} ${Math.abs(k)}` : ''}`
const parabolaVertex = {
  slug: 'parabola-vertex',
  grade: 9,
  strand: 'functions',
  title: 'פרבולה: קודקוד וציר סימטריה',
  emoji: '🪂',
  desc: 'קודקוד הפרבולה וציר הסימטריה לכיתה ט׳: קריאה מצורת קודקוד y = (x − h)² + k וחישוב מהנוסחה x = −b/2a לפונקציה ריבועית. תרגול אמריקאי עם פתרון.',
  intro: 'הגרף של פונקציה ריבועית y = ax² + bx + c הוא פרבולה. אם a > 0 הפרבולה "מחייכת" והקודקוד הוא נקודת המינימום, ואם a < 0 היא "בוכה" והקודקוד הוא נקודת המקסימום. שיעור ה-x של הקודקוד הוא x = −b / 2a, ומציבים אותו בפונקציה כדי למצוא את שיעור ה-y. ציר הסימטריה הוא הישר האנכי שעובר דרך הקודקוד. בצורת הקודקוד y = (x − h)² + k הקודקוד הוא (h, k).',
  tips: ['x של הקודקוד = −b ÷ 2a.', 'y של הקודקוד: מציבים את ה-x בפונקציה.', 'ב-y = (x − 3)² + 5 הקודקוד (3, 5); ב-y = (x + 3)² + 5 הקודקוד (−3, 5).'],
  example: { q: 'מצאו את קודקוד הפרבולה y = x² − 6x + 5', steps: ['x = −(−6) ÷ (2 × 1) = 3', 'y = 9 − 18 + 5 = −4'], a: '(3, −4)' },
  faq: [
    { q: 'מה זה ציר הסימטריה?', a: 'ישר אנכי x = h העובר דרך הקודקוד. הפרבולה סימטרית סביבו: נקודות באותו גובה נמצאות במרחק שווה ממנו.' },
    { q: 'איך יודעים אם הקודקוד הוא מינימום או מקסימום?', a: 'לפי סימן המקדם a של x²: חיובי — מינימום (הפרבולה פתוחה למעלה), שלילי — מקסימום (פתוחה למטה).' },
  ],
  levels: ['צורת קודקוד', 'y = x² + bx + c', 'y = ax² + bx + c'],
  gen(level, r) {
    const h = r.int(-8, 8), k = r.int(-12, 12)
    const answer = pt(h, k)
    if (level === 1) {
      return { q: 'מהו קודקוד הפרבולה?', expr: vertexForm(h, k), type: 'choice', answer, choices: choiceSet(r, answer, [pt(-h, k), pt(h, -k), pt(k, h), pt(-h, -k), pt(h + 1, k)]), explain: `בצורה y = (x − h)² + k הקודקוד הוא (h, k): ${answer}` }
    }
    const a = level === 2 ? 1 : r.pick([2, 3, -1, -2, -3])
    if (h === 0 && level === 2) return parabolaVertex.gen(2, r)
    const b = -2 * a * h, c = k + a * h * h
    return { q: 'מהו קודקוד הפרבולה?', expr: `y = ${quad(a, b, c)}`, type: 'choice', answer, choices: choiceSet(r, answer, [pt(-h, k), pt(h, c), pt(h, -k), pt(-h, c), pt(k, h), pt(h, k + a)]), explain: `x = −b ÷ 2a = ${fmt(-b)} ÷ ${par(2 * a)} = ${fmt(h)}; y = ${fmt(a)} × ${par(h)}² + ${par(b)} × ${par(h)} + ${par(c)} = ${fmt(k)} ← ${answer}` }
  },
}

const parabolaRoots = {
  slug: 'parabola-intersections',
  grade: 9,
  strand: 'functions',
  title: 'פרבולה: נקודות חיתוך עם הצירים',
  emoji: '✂️',
  desc: 'נקודות החיתוך של פרבולה עם הצירים לכיתה ט׳: חיתוך עם ציר y (מציבים x = 0) ועם ציר x (פותרים y = 0). תרגול עם פונקציות ריבועיות, פתרונות ודף להדפסה.',
  intro: 'כדי למצוא את נקודת החיתוך של פרבולה עם ציר y מציבים x = 0, ומקבלים את הנקודה (0, c). כדי למצוא את נקודות החיתוך עם ציר x מציבים y = 0 ופותרים את המשוואה הריבועית ax² + bx + c = 0 — בפירוק לגורמים או בנוסחת השורשים. לפרבולה יכולות להיות שתי נקודות חיתוך עם ציר x, אחת או אף אחת.',
  tips: ['חיתוך עם ציר y: x = 0 ← הנקודה (0, c).', 'חיתוך עם ציר x: y = 0 ← פותרים ax² + bx + c = 0.', 'אם הפונקציה נתונה כ-y = a(x − p)(x − q), החיתוכים עם ציר x הם p ו-q.'],
  example: { q: 'מצאו את נקודות החיתוך של y = x² − x − 6 עם ציר x', steps: ['x² − x − 6 = 0', '(x − 3)(x + 2) = 0', 'x = 3 או x = −2 ← (3, 0), (−2, 0)'], a: 'x = 3, x = −2' },
  faq: [
    { q: 'למה לחיתוך עם ציר y יש תמיד נקודה אחת?', a: 'כי לכל x יש ערך y יחיד בפונקציה, ובפרט ל-x = 0. לכן כל פרבולה מהצורה y = ax² + bx + c חותכת את ציר y בדיוק בנקודה (0, c).' },
    { q: 'מה אומר שלפרבולה אין חיתוך עם ציר x?', a: 'שהיא כולה מעל הציר או כולה מתחתיו, ולמשוואה ax² + bx + c = 0 אין פתרון (הדיסקרימיננטה שלילית).' },
  ],
  levels: ['חיתוך עם ציר y ו-y = x² − k', 'y = x² + bx + c', 'מקדם מוביל שונה מ-1'],
  gen(level, r) {
    const qx = 'מהם שיעורי ה-x של נקודות החיתוך של הפרבולה עם ציר x? (רשמו את שניהם מופרדים בפסיק)'
    if (level === 1) {
      if (r.bool()) {
        const a = r.pick([1, -1, 2, -2, 3]), b = r.int(-9, 9), c = r.nz(-15, 15)
        return { q: 'מהו שיעור ה-y של נקודת החיתוך של הפרבולה עם ציר y?', expr: `y = ${quad(a, b, c)}`, type: 'number', answer: c, explain: `מציבים x = 0: y = ${fmt(c)}, כלומר הנקודה (0, ${fmt(c)})` }
      }
      const k = r.int(1, 12)
      return { q: qx, expr: `y = x² − ${k * k}`, type: 'numbers', answer: [k, -k], explain: `x² − ${k * k} = 0 ← x² = ${k * k} ← x = ±${k}` }
    }
    const p = r.nz(-8, 8), s = r.int(-8, 8)
    if (p === s) return parabolaRoots.gen(level, r)
    const a = level === 2 ? 1 : r.pick([-1, 2, -2, 3, -3])
    const A = a, B = -a * (p + s), C = a * p * s
    return { q: qx, expr: `y = ${quad(A, B, C)}`, type: 'numbers', answer: [p, s], explain: `${a !== 1 ? `מוציאים ${fmt(a)}: ${fmt(a)}(${quad(1, -(p + s), p * s)}) = 0; ` : ''}${fx(-p)}${fx(-s)} = 0 ← x = ${fmt(p)} או x = ${fmt(s)}` }
  },
}

const surd = (c, m) => (c === 1 ? `√${m}` : c === -1 ? `−√${m}` : `${fmt(c)}√${m}`)
const SQFREE = [2, 3, 5, 6, 7, 10, 11]
const roots = {
  slug: 'square-roots',
  grade: 9,
  strand: 'arithmetic',
  title: 'שורשים: פישוט וחישוב',
  emoji: '√',
  desc: 'שורשים ריבועיים לכיתה ט׳: כפל שורשים, הוצאת גורם מתחת לשורש (√72 = 6√2) וחיבור וחיסור שורשים דומים. תרגול אמריקאי עם הסבר מלא ודף להדפסה.',
  intro: 'השורש הריבועי של מספר אי־שלילי a הוא המספר האי־שלילי שבריבוע נותן a; למשל √49 = 7. לשורשים יש חוקי כפל: √a × √b = √(ab). בעזרת החוק הזה מוציאים גורם מתחת לשורש: מפרקים את המספר למכפלה של ריבוע שלם במספר אחר, למשל √72 = √(36 × 2) = 6√2. מחברים ומחסרים רק שורשים דומים — עם אותו מספר מתחת לשורש — כמו שמכנסים איברים דומים.',
  tips: ['√a × √b = √(ab)', 'מחפשים את הריבוע השלם הגדול ביותר שמחלק את המספר: 4, 9, 16, 25, 36...', '3√2 + 5√2 = 8√2, אבל √2 + √3 אי אפשר לפשט.'],
  example: { q: 'פשטו: √12 + √27', steps: ['√12 = √(4 × 3) = 2√3', '√27 = √(9 × 3) = 3√3', '2√3 + 3√3 = 5√3'], a: '5√3' },
  faq: [
    { q: 'האם √(a + b) = √a + √b?', a: 'לא! למשל √(9 + 16) = √25 = 5, אבל √9 + √16 = 3 + 4 = 7. חוק הכפל נכון, אבל אין חוק כזה לחיבור.' },
    { q: 'מתי שורש הוא מספר שלם?', a: 'כשהמספר שמתחת לשורש הוא ריבוע שלם: 1, 4, 9, 16, 25, 36 וכן הלאה. אחרת השורש הוא מספר אי־רציונלי.' },
  ],
  levels: ['כפל שורשים ושורש של ריבוע', 'הוצאת גורם מתחת לשורש', 'חיבור וחיסור שורשים'],
  gen(level, r) {
    if (level === 1) {
      if (r.bool(0.3)) {
        const n = r.int(11, 25)
        return { q: 'חשבו:', expr: `√${n * n} = ?`, type: 'number', answer: n, explain: `${n}² = ${n * n}, ולכן √${n * n} = ${n}` }
      }
      const m = r.pick(SQFREE), s = r.int(1, 4), t = r.int(1, 4)
      if (s === t && s === 1) return roots.gen(1, r)
      return { q: 'חשבו:', expr: `√${m * s * s} × √${m * t * t} = ?`, type: 'number', answer: m * s * t, explain: `√${m * s * s} × √${m * t * t} = √${m * m * s * s * t * t} = ${m * s * t}` }
    }
    if (level === 2) {
      const m = r.pick(SQFREE), k = r.int(2, 9)
      const answer = surd(k, m)
      return { q: 'פשטו (הוציאו גורם מחוץ לשורש):', expr: `√${k * k * m}`, type: 'choice', answer, choices: choiceSet(r, answer, [surd(k * k, m), surd(k + 1, m), surd(m, k * k === m ? k + 1 : k), surd(2 * k, m), surd(k - 1, m)]), explain: `√${k * k * m} = √(${k * k} × ${m}) = ${k}√${m}` }
    }
    const m = r.pick([2, 3, 5, 6, 7]), a = r.int(1, 6), n = r.int(2, 5), b = r.int(1, 4), s = r.pick([1, -1])
    const c = a + s * b * n
    if (c === 0) return roots.gen(3, r)
    const answer = surd(c, m)
    return { q: 'פשטו:', expr: `${surd(a, m)} ${s > 0 ? '+' : '−'} ${surd(b, n * n * m)}`, type: 'choice', answer, choices: choiceSet(r, answer, [surd(a + s * b, m), surd(a + s * b * n * n, m), surd(-c, m), surd(c, m * (n * n + 1)), surd(c + 1, m)]), explain: `√${n * n * m} = √(${n * n} × ${m}) = ${n}√${m}, ולכן ${surd(b, n * n * m)} = ${surd(b * n, m)}; ${surd(a, m)} ${s > 0 ? '+' : '−'} ${surd(b * n, m)} = ${answer}` }
  },
}

// Two similar triangles (same angles); side 0 = AB, 1 = BC, 2 = CA.
function similarSvg(k, small, big) {
  const T = [[1.2, 2.2], [0, 0], [3.4, 0]]
  const kk = Math.max(1.2, Math.min(k, 1.8))
  const B2 = T.map(([x, y]) => [x * kk + 5.2, y * kk])
  const F = fit(T.concat(B2), 240, 170, 20)
  const left = polySvg(F.P.slice(0, 3), F.w, F.h, { names: ['A', 'B', 'C'], sides: small })
  const right = polySvg(F.P.slice(3), F.w, F.h, { names: ['D', 'E', 'F'], sides: big, fill: '#86efac' })
  return left.replace('</svg>', right.replace(/^<svg[^>]*>/, ''))
}
const RATIOS = [[3, 2], [5, 2], [4, 3], [5, 3], [3, 4], [2, 3], [7, 2], [5, 4]]
const similar = {
  slug: 'similar-triangles',
  grade: 9,
  strand: 'geometry',
  title: 'דמיון משולשים',
  emoji: '🔻',
  desc: 'דמיון משולשים לכיתה ט׳: יחס הדמיון, חישוב צלע חסרה, קטע מקביל לצלע במשולש ויחס השטחים (ריבוע יחס הדמיון). תרגול עם שרטוטים, פתרונות ודף להדפסה.',
  intro: 'שני משולשים דומים אם הזוויות שלהם שוות בהתאמה; אז גם הצלעות המתאימות פרופורציוניות. המנה בין צלעות מתאימות נקראת יחס הדמיון k. יחס ההיקפים שווה ל-k, ויחס השטחים שווה ל-k². קטע המקביל לאחת מצלעות המשולש יוצר משולש קטן הדומה למשולש הגדול.',
  tips: ['מסדרים את הקודקודים לפי ההתאמה: △ABC ∼ △DEF ← AB/DE = BC/EF = AC/DF.', 'יחס היקפים = k; יחס שטחים = k².', 'במשולש עם DE ∥ BC: ‏AD/AB = DE/BC (שימו לב — AB, לא DB).'],
  example: { q: '△ABC ∼ △DEF, ‏AB = 4, ‏DE = 6, ‏BC = 10. מצאו את EF.', steps: ['k = DE/AB = 6/4 = 1.5', 'EF = 1.5 × 10 = 15'], a: '15' },
  faq: [
    { q: 'מה ההבדל בין דמיון לחפיפה?', a: 'במשולשים חופפים כל הצלעות שוות (יחס דמיון 1). במשולשים דומים הצורה זהה, אבל אחד יכול להיות הגדלה או הקטנה של השני.' },
    { q: 'למה יחס השטחים הוא k²?', a: 'כי שטח הוא מכפלה של שני אורכים (בסיס וגובה), וכל אחד מהם מוכפל ב-k, ולכן השטח מוכפל ב-k × k.' },
  ],
  levels: ['יחס דמיון שלם', 'יחס דמיון שבור', 'קטע מקביל ויחס שטחים'],
  gen(level, r) {
    if (level <= 2) {
      let p, q
      if (level === 1) { p = r.int(2, 4); q = 1 } else { [p, q] = r.pick(RATIOS) }
      const u = r.int(1, level === 1 ? 6 : 4), v = r.int(1, level === 1 ? 7 : 5)
      const AB = q * u, DE = p * u, BC = q * v, EF = p * v
      if (AB === BC) return similar.gen(level, r)
      const k = p / q
      return { q: '△ABC ∼ △DEF (הקודקודים לפי הסדר; השרטוט אינו בקנה מידה). מצאו את אורך הצלע EF.', svg: similarSvg(k, [String(AB), String(BC), ''], [String(DE), '?', '']), type: 'number', answer: EF, explain: `יחס הדמיון k = DE/AB = ${DE}/${AB}${`${DE}/${AB}` !== fracShow(p, q) ? ` = ${fracShow(p, q)}` : ''}; ‏EF = BC × k = ${BC} × ${fracShow(p, q)} = ${EF}` }
    }
    if (r.bool()) {
      const a = r.int(2, 8), b = r.int(1, 8), t = r.int(1, 4)
      const DE = a * t, BC = (a + b) * t
      const F = fit([[1.6, 3], [0, 0], [4, 0]], 230, 170)
      const [A, B, C] = F.P, f = a / (a + b)
      const D = [A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f], E = [A[0] + (C[0] - A[0]) * f, A[1] + (C[1] - A[1]) * f]
      const mid = (P, Q) => [(P[0] + Q[0]) / 2 - 12, (P[1] + Q[1]) / 2]
      const extra = svgLine(D, E, { w: 2.2 }) + svgText(D[0] - 10, D[1], 'D', { size: 13 }) + svgText(E[0] + 10, E[1], 'E', { size: 13 }) +
        svgText(...mid(A, D), String(a), { size: 12 }) + svgText(...mid(D, B), String(b), { size: 12 }) +
        svgText((D[0] + E[0]) / 2, D[1] - 9, String(DE), { size: 12 })
      const svg = polySvg(F.P, F.w, F.h, { names: ['A', 'B', 'C'], sides: ['', '?', ''], extra })
      return { q: 'במשולש ABC הקטע DE מקביל לצלע BC. ‏AD, ‏DB ו-DE נתונים. מצאו את BC.', svg, type: 'number', answer: BC, explain: `△ADE ∼ △ABC; AD/AB = DE/BC ← ${a}/${a + b} = ${DE}/BC ← BC = ${DE} × ${a + b} ÷ ${a} = ${BC}` }
    }
    const [p, q] = r.pick([[2, 1], [3, 1], [3, 2], [4, 1], [5, 2], [4, 3]]), u = r.int(1, 6)
    const S = q * q * u, S2 = p * p * u
    return { q: `△ABC ∼ △DEF ביחס דמיון ${p}:${q} (המשולש DEF הוא הגדול). שטח המשולש ABC הוא ${S} סמ״ר. מהו שטח המשולש DEF?`, type: 'number', answer: S2, unit: 'סמ״ר', explain: `יחס השטחים הוא ריבוע יחס הדמיון: (${p}/${q})² = ${p * p}/${q * q}; ‏${S} × ${p * p}/${q * q} = ${S2}` }
  },
}

// Right triangle with the right angle at C, angle label at A; BC = opp (vertical), AC = adj.
function trigSvg(adj, opp, sides, angleA) {
  const F = fit([[0, 0], [adj, opp], [adj, 0]], 230, 170)
  return polySvg(F.P, F.w, F.h, { names: ['A', 'B', 'C'], sides, angles: [angleA, '', ''], right: 2 })
}
const R2 = x => Math.round(x * 100) / 100
const trig = {
  slug: 'trigonometry-right-triangle',
  grade: 9,
  strand: 'trigonometry',
  title: 'טריגונומטריה במשולש ישר זווית',
  emoji: '📐',
  desc: 'טריגונומטריה במשולש ישר זווית לכיתה ט׳: סינוס, קוסינוס וטנגנס, חישוב צלע לפי זווית וחישוב זווית לפי שתי צלעות (עם מחשבון). תרגול עם שרטוט ופתרון.',
  intro: 'במשולש ישר זווית מגדירים לכל זווית חדה α שלושה יחסים: סינוס — הניצב שמול הזווית חלקי היתר; קוסינוס — הניצב שליד הזווית חלקי היתר; טנגנס — הניצב שמול הזווית חלקי הניצב שלידה. בעזרתם מחשבים צלע חסרה כשידועות זווית וצלע, ובעזרת הפונקציות ההפוכות במחשבון (sin⁻¹, cos⁻¹, tan⁻¹) מחשבים זווית כשידועות שתי צלעות.',
  tips: ['sin α = ניצב מול / יתר', 'cos α = ניצב ליד / יתר', 'tan α = ניצב מול / ניצב ליד. ודאו שהמחשבון במצב מעלות (DEG).'],
  example: { q: 'במשולש ישר זווית היתר 10 ס״מ והזווית α = 30°. מהו הניצב שמול α?', steps: ['sin 30° = ניצב מול / 10', 'ניצב מול = 10 × sin 30° = 10 × 0.5', '= 5'], a: '5 ס״מ' },
  faq: [
    { q: 'איך זוכרים מה זה סינוס, קוסינוס וטנגנס?', a: 'מזהים קודם את היתר (מול הזווית הישרה), אחר כך את הניצב שמול הזווית ואת הניצב שלידה. סינוס — מול חלקי יתר, קוסינוס — ליד חלקי יתר, טנגנס — מול חלקי ליד.' },
    { q: 'למה התוצאה במחשבון לא יוצאת נכונה?', a: 'כנראה המחשבון במצב רדיאנים (RAD). יש לעבור למצב מעלות (DEG).' },
  ],
  levels: ['זיהוי היחס (sin, cos, tan)', 'חישוב צלע לפי זווית', 'חישוב זווית לפי צלעות'],
  gen(level, r) {
    if (level === 1) {
      const [a0, b0, c0] = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]]), m = r.pick([1, 2])
      const [opp, adj] = r.bool() ? [a0 * m, b0 * m] : [b0 * m, a0 * m]
      const hyp = c0 * m
      const fn = r.pick(['sin', 'cos', 'tan'])
      const answer = fn === 'sin' ? fracShow(opp, hyp) : fn === 'cos' ? fracShow(adj, hyp) : fracShow(opp, adj)
      const all = [fracShow(opp, hyp), fracShow(adj, hyp), fracShow(opp, adj), fracShow(adj, opp), fracShow(hyp, opp)]
      return { q: `במשולש ABC ‏(‎∠C = 90°) נתונים אורכי הצלעות. מהו ${fn} A?`, svg: trigSvg(adj, opp, [String(hyp), String(opp), String(adj)], 'α'), type: 'choice', answer, choices: choiceSet(r, answer, all), explain: (fn === 'sin' ? `sin A = ניצב מול / יתר = BC/AB = ${opp}/${hyp}` : fn === 'cos' ? `cos A = ניצב ליד / יתר = AC/AB = ${adj}/${hyp}` : `tan A = ניצב מול / ניצב ליד = BC/AC = ${opp}/${adj}`) + (m > 1 ? ` = ${answer}` : '') }
    }
    const al = r.int(20, 70), rad = (al * Math.PI) / 180
    if (level === 2) {
      const kind = r.int(0, 2), L = r.int(4, 20)
      if (kind === 0) {
        const ans = R2(L * Math.sin(rad))
        return { q: `במשולש ABC ‏(‎∠C = 90°) ‏∠A = ${al}° והיתר AB = ${L} ס״מ. מצאו את BC (עגלו לשתי ספרות אחרי הנקודה).`, svg: trigSvg(L * Math.cos(rad), L * Math.sin(rad), [String(L), '?', ''], `${al}°`), type: 'number', answer: ans, tol: 0.011, unit: 'ס״מ', explain: `sin ${al}° = BC/${L} ← BC = ${L} × sin ${al}° ≈ ${ans}` }
      }
      if (kind === 1) {
        const ans = R2(L * Math.cos(rad))
        return { q: `במשולש ABC ‏(‎∠C = 90°) ‏∠A = ${al}° והיתר AB = ${L} ס״מ. מצאו את AC (עגלו לשתי ספרות אחרי הנקודה).`, svg: trigSvg(L * Math.cos(rad), L * Math.sin(rad), [String(L), '', '?'], `${al}°`), type: 'number', answer: ans, tol: 0.011, unit: 'ס״מ', explain: `cos ${al}° = AC/${L} ← AC = ${L} × cos ${al}° ≈ ${ans}` }
      }
      const ans = R2(L * Math.tan(rad))
      return { q: `במשולש ABC ‏(‎∠C = 90°) ‏∠A = ${al}° והניצב AC = ${L} ס״מ. מצאו את BC (עגלו לשתי ספרות אחרי הנקודה).`, svg: trigSvg(L, L * Math.tan(rad), ['', '?', String(L)], `${al}°`), type: 'number', answer: ans, tol: 0.011, unit: 'ס״מ', explain: `tan ${al}° = BC/${L} ← BC = ${L} × tan ${al}° ≈ ${ans}` }
    }
    const opp = r.int(2, 15), adj = r.int(2, 15)
    if (r.bool()) {
      const ang = Math.round((Math.atan(opp / adj) * 180) / Math.PI * 10) / 10
      return { q: 'במשולש ABC ‏(‎∠C = 90°) נתונים אורכי הניצבים. מצאו את הזווית A במעלות (עגלו לעשירית).', svg: trigSvg(adj, opp, ['', String(opp), String(adj)], '?'), type: 'number', answer: ang, tol: 0.1, unit: '°', explain: `tan A = ${opp}/${adj} ← A = tan⁻¹(${opp}/${adj}) ≈ ${ang}°` }
    }
    const hyp = Math.max(opp, adj) + r.int(1, 6)
    const ang = Math.round((Math.asin(opp / hyp) * 180) / Math.PI * 10) / 10
    const realAdj = Math.sqrt(hyp * hyp - opp * opp)
    return { q: 'במשולש ABC ‏(‎∠C = 90°) נתונים היתר והניצב שמול A. מצאו את הזווית A במעלות (עגלו לעשירית).', svg: trigSvg(realAdj, opp, [String(hyp), String(opp), ''], '?'), type: 'number', answer: ang, tol: 0.1, unit: '°', explain: `sin A = ${opp}/${hyp} ← A = sin⁻¹(${opp}/${hyp}) ≈ ${ang}°` }
  },
}

const probability = {
  slug: 'probability',
  grade: 9,
  strand: 'probability',
  title: 'הסתברות',
  emoji: '🎲',
  desc: 'הסתברות לכיתה ט׳: הוצאת כדור משקית, הטלת קובייה ומטבע, סכום של שתי קוביות והוצאה ללא החזרה. תשובות כשבר מצומצם, עם פתרון מוסבר ודף להדפסה.',
  intro: 'ההסתברות של מאורע היא מספר בין 0 ל-1 שמתאר עד כמה הוא סביר. כשכל התוצאות האפשריות שוות סיכוי, ההסתברות היא מספר התוצאות המתאימות חלקי מספר כל התוצאות האפשריות. בניסוי בשני שלבים — כמו הטלת שתי קוביות — אפשר לרשום את כל התוצאות בטבלה, או לכפול את ההסתברויות לאורך ענף בעץ ההסתברות.',
  tips: ['P = מספר התוצאות המתאימות ÷ מספר כל התוצאות.', 'בהטלת שתי קוביות יש 6 × 6 = 36 תוצאות שוות סיכוי.', 'בהוצאה ללא החזרה, בשלב השני יש כדור אחד פחות בשקית.'],
  example: { q: 'מטילים שתי קוביות. מה ההסתברות שסכומן 7?', steps: ['תוצאות מתאימות: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) — 6', 'כל התוצאות: 36', '6/36 = 1/6'], a: '1/6' },
  faq: [
    { q: 'מה ההסתברות של מאורע ודאי ושל מאורע בלתי אפשרי?', a: 'מאורע ודאי — 1 (למשל לקבל מספר קטן מ-7 בקובייה), מאורע בלתי אפשרי — 0 (למשל לקבל 8 בקובייה רגילה).' },
    { q: 'מה זה מאורע משלים?', a: 'המאורע "לא A". ההסתברות שלו היא 1 פחות ההסתברות של A. למשל, ההסתברות לא לקבל 6 בקובייה היא 1 − 1/6 = 5/6.' },
  ],
  levels: ['שלב אחד (שקית כדורים)', 'קובייה ומטבעות', 'שתי קוביות והוצאה ללא החזרה'],
  gen(level, r) {
    const note = '(רשמו כשבר מצומצם)'
    if (level === 1) {
      const red = r.int(2, 9), blue = r.int(2, 9), green = r.bool(0.4) ? 0 : r.int(2, 6)
      const n = red + blue + green
      const color = r.pick([['אדום', red], ['כחול', blue], ...(green ? [['ירוק', green]] : [])])
      const not = r.bool(0.25)
      const fav = not ? n - color[1] : color[1]
      return { q: `בשקית ${red} כדורים אדומים${green ? `, ${blue} כחולים ו-${green} ירוקים` : ` ו-${blue} כחולים`}. מוציאים כדור אחד באקראי. מה ההסתברות ${not ? 'שהכדור לא יהיה' : 'שהכדור יהיה'} ${color[0]}? ${note}`, type: 'fraction', answer: frac(fav, n), explain: `${fav} כדורים מתאימים מתוך ${n}: ${fracShow(fav, n)}` }
    }
    if (level === 2) {
      if (r.bool(0.65)) {
        const EV = [
          ['מספר זוגי', [2, 4, 6]], ['מספר אי־זוגי', [1, 3, 5]], ['מספר ראשוני', [2, 3, 5]], ['מספר שמתחלק ב-3', [3, 6]],
          ...[1, 2, 3, 4, 5].map(k => [`מספר גדול מ-${k}`, [1, 2, 3, 4, 5, 6].filter(v => v > k)]),
          ...[2, 3, 4, 5].map(k => [`מספר קטן מ-${k}`, [1, 2, 3, 4, 5, 6].filter(v => v < k)]),
        ]
        const [name, set] = r.pick(EV)
        return { q: `מטילים קובייה הוגנת. מה ההסתברות לקבל ${name}? ${note}`, type: 'fraction', answer: frac(set.length, 6), explain: `תוצאות מתאימות: ${set.join(', ')} — ${set.length} מתוך 6: ${fracShow(set.length, 6)}` }
      }
      const k = r.pick([2, 3])
      const EV = k === 2
        ? [['ששני המטבעות יראו "עץ"', 1], ['שיתקבל "עץ" אחד בדיוק', 2], ['שיתקבל לפחות "עץ" אחד', 3]]
        : [['שכל שלושת המטבעות יראו "עץ"', 1], ['שיתקבל "עץ" אחד בדיוק', 3], ['שיתקבלו שני "עץ" בדיוק', 3], ['שיתקבל לפחות "עץ" אחד', 7]]
      const [name, fav] = r.pick(EV), n = 2 ** k
      return { q: `מטילים ${k === 2 ? 'שני' : 'שלושה'} מטבעות הוגנים. מה ההסתברות ${name}? ${note}`, type: 'fraction', answer: frac(fav, n), explain: `יש ${n} תוצאות שוות סיכוי; ${fav} מתאימות: ${fracShow(fav, n)}` }
    }
    if (r.bool()) {
      const pairs = []
      for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) pairs.push([a, b])
      const kind = r.int(0, 2)
      let name, test
      if (kind === 0) { const s = r.int(2, 12); name = `שסכום המספרים יהיה ${s}`; test = ([a, b]) => a + b === s }
      else if (kind === 1) { const s = r.int(7, 11); name = `שסכום המספרים יהיה ${s} לפחות`; test = ([a, b]) => a + b >= s }
      else { name = 'ששתי הקוביות יראו אותו מספר'; test = ([a, b]) => a === b }
      const fav = pairs.filter(test).length
      return { q: `מטילים שתי קוביות הוגנות. מה ההסתברות ${name}? ${note}`, type: 'fraction', answer: frac(fav, 36), explain: `מתוך 36 תוצאות שוות סיכוי, ${fav} מתאימות: ${fav}/36 = ${fracShow(fav, 36)}` }
    }
    const red = r.int(2, 8), other = r.int(1, 8), n = red + other
    const fav = red * (red - 1), tot = n * (n - 1)
    return { q: `בקופסה ${red} עפרונות אדומים ו-${other} כחולים. מוציאים באקראי שני עפרונות, בזה אחר זה, בלי להחזיר. מה ההסתברות ששניהם אדומים? ${note}`, type: 'fraction', answer: frac(fav, tot), explain: `${red}/${n} × ${red - 1}/${n - 1} = ${fav}/${tot} = ${fracShow(fav, tot)}` }
  },
}

export default [shortMult, factoring, algFractions, quadEq, discriminant, parabolaVertex, parabolaRoots, roots, similar, trig, probability]
