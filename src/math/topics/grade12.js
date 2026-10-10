// Grade 12 (כיתה י״ב) — high-school topics for 4 and 5 יח״ל (integrals, exponential/log functions,
// vectors, complex numbers, induction).
import { sup, sub, fmt, round, fracText, fracAnswer, terms, poly, choiceQ } from './grade10.js'

const DEG = Math.PI / 180
const fx = s => `f(x) = ${s}`
const dfx = s => `f′(x) = ${s}`
const Fx = s => `F(x) = ${s}`
const par = n => (n < 0 ? `(${fmt(n)})` : fmt(n))
const part = (n, den) => ({ neg: n < 0, body: `${Math.abs(n)}/${den}` })
const lin = (a, b) => terms([[a, 'x'], [b, '']])
// e to the power (k·x + c), e.g. e²ˣ⁻¹
const expE = (k, c = 0) => {
  const kx = k === 1 ? 'x' : k === -1 ? '-x' : `${k}x`
  return 'e' + sup(kx + (c ? (c > 0 ? `+${c}` : `${c}`) : ''))
}
const integral = (p, q, body) => `∫${sub(p)}${sup(q)} (${body}) dx`

// complex number a + bi as text
function cText(a, b) {
  if (b === 0) return fmt(a)
  const bi = Math.abs(b) === 1 ? 'i' : `${Math.abs(b)}i`
  if (a === 0) return (b < 0 ? '−' : '') + bi
  return `${fmt(a)} ${b < 0 ? '−' : '+'} ${bi}`
}
const vec = v => `(${v.map(fmt).join(', ')})`

// identities for induction: lhs (series), rhs (closed form), and the (n+1)-th term text
const SERIES = [
  { lhs: '1 + 2 + 3 + … + n', rhs: 'n(n + 1)/2', step: 'n + 1', stepWrong: ['n', 'n + 2', '(n + 1)/2'], wrong: ['n²/2', 'n(n − 1)/2', '(n + 1)²/4'], S: n => n * (n + 1) / 2 },
  { lhs: '1 + 3 + 5 + … + (2n − 1)', rhs: 'n²', step: '2n + 1', stepWrong: ['2n − 1', '2n + 3', '2n'], wrong: ['2n − 1', 'n(n + 1)/2', '(n + 1)² − 3'], S: n => n * n },
  { lhs: '1² + 2² + 3² + … + n²', rhs: 'n(n + 1)(2n + 1)/6', step: '(n + 1)²', stepWrong: ['n²', 'n² + 1', '(n + 2)²'], wrong: ['n²(n + 1)/2', 'n(n + 1)/2', 'n³'], S: n => n * (n + 1) * (2 * n + 1) / 6 },
  { lhs: '1³ + 2³ + 3³ + … + n³', rhs: '(n(n + 1)/2)²', step: '(n + 1)³', stepWrong: ['n³', 'n³ + 1', '(n + 1)²'], wrong: ['n(n + 1)(2n + 1)/6', 'n⁴', 'n²(n + 1)/2'], S: n => (n * (n + 1) / 2) ** 2 },
  { lhs: '1 + 2 + 4 + … + 2ⁿ⁻¹', rhs: '2ⁿ − 1', step: '2ⁿ', stepWrong: ['2ⁿ⁻¹', '2ⁿ⁺¹', '2n'], wrong: ['2ⁿ⁻¹', '2n − 1', 'n²'], S: n => 2 ** n - 1 },
  { lhs: '1/(1·2) + 1/(2·3) + … + 1/(n(n + 1))', rhs: 'n/(n + 1)', step: '1/((n + 1)(n + 2))', stepWrong: ['1/(n(n + 1))', '1/(n + 1)', '1/((n + 1)(n + 1))'], wrong: ['1/(n + 1)', '(n − 1)/n', 'n/(2n)'], S: n => n / (n + 1) },
  { lhs: '1 + 4 + 7 + … + (3n − 2)', rhs: 'n(3n − 1)/2', step: '3n + 1', stepWrong: ['3n − 2', '3n − 1', '3n + 4'], wrong: ['n(3n − 2)', 'n²', '(3n² − 1)/2'], S: n => n * (3 * n - 1) / 2 },
  { lhs: '1·2 + 2·3 + … + n(n + 1)', rhs: 'n(n + 1)(n + 2)/3', step: '(n + 1)(n + 2)', stepWrong: ['n(n + 1)', '(n + 1)²', '(n + 2)(n + 3)'], wrong: ['n²(n + 1)', 'n(n + 1)(2n + 1)/6', '2n²'], S: n => n * (n + 1) * (n + 2) / 3 },
  { lhs: '2 + 6 + 18 + … + 2·3ⁿ⁻¹', rhs: '3ⁿ − 1', step: '2·3ⁿ', stepWrong: ['2·3ⁿ⁻¹', '3ⁿ', '2·3ⁿ⁺¹'], wrong: ['2·3ⁿ − 1', '3ⁿ⁻¹ + 1', '2n²'], S: n => 3 ** n - 1 },
]

const topics = [
  {
    slug: 'antiderivative',
    grade: 12,
    strand: 'calculus',
    title: 'פונקציה קדומה ואינטגרל לא מסוים — 4–5 יח״ל',
    emoji: '∫',
    desc: 'מציאת פונקציה קדומה: אינטגרל של פולינום, פונקציה קדומה העוברת בנקודה נתונה ואינטגרל של a/x² — תרגול אמריקאי עם מסיחים מטעויות נפוצות, ל-4 ו-5 יח״ל.',
    intro: 'פונקציה קדומה של f היא פונקציה F שהנגזרת שלה היא f, כלומר F′(x) = f(x). לכל פונקציה יש אינסוף פונקציות קדומות שנבדלות בקבוע, ולכן כותבים + C. הכלל הבסיסי הוא "הפוך מגזירה": מעלים את המעריך ב-1 ומחלקים במעריך החדש — ∫xⁿ dx = xⁿ⁺¹/(n + 1) + C (עבור n ≠ −1). כשנתונה נקודה שהפונקציה הקדומה עוברת בה, מציבים אותה ומוצאים את C.',
    tips: ['בדיקה מהירה: גזרו את התשובה — צריך לקבל את הפונקציה המקורית.', '1/x² = x⁻², ולכן הפונקציה הקדומה היא −x⁻¹ = −1/x.', 'אל תשכחו את + C, אלא אם נתונה נקודה שקובעת אותו.'],
    example: { q: 'מצאו פונקציה קדומה ל-f(x) = 6x² − 4x + 1 העוברת בנקודה (1, 5)', steps: ['F(x) = 2x³ − 2x² + x + C', 'F(1) = 2 − 2 + 1 + C = 5 ⇐ C = 4'], a: 'F(x) = 2x³ − 2x² + x + 4' },
    faq: [
      { q: 'למה מוסיפים C?', a: 'כי הנגזרת של קבוע היא 0. לכן גם F(x) + 5 וגם F(x) − 3 הן פונקציות קדומות של אותה f.' },
      { q: 'מה הפונקציה הקדומה של 1/x?', a: 'ln|x| + C — זה המקרה היחיד שבו כלל החזקה לא עובד (n = −1). נלמד ב-5 יח״ל.' },
    ],
    levels: ['פולינום', 'פונקציה קדומה דרך נקודה', 'a/x² ופולינום'],
    gen(level, r) {
      // integrand terms with coefficients divisible by (power + 1)
      const pows = r.shuffle([0, 1, 2, 3]).slice(0, level === 3 ? 2 : r.int(2, 3)).sort((a, b) => b - a)
      const ks = pows.map(() => r.nz(-4, 4))
      const f = pows.map((p, i) => [ks[i] * (p + 1), p])
      const F = pows.map((p, i) => [ks[i], p + 1])
      const wrongDiv = pows.map((p, i) => [[ks[i] * (p + 1), p === 0 ? 1 : p], p + 1])
      const noDiv = pows.map((p, i) => [ks[i] * (p + 1), p + 1])
      const deriv = pows.filter(p => p > 0).map(p => [ks[pows.indexOf(p)] * (p + 1) * p, p - 1])
      if (level === 1) {
        const ans = Fx(poly(F) + ' + C')
        return {
          q: 'איזו מהפונקציות היא פונקציה קדומה של f? (C קבוע)',
          expr: fx(poly(f)),
          ...choiceQ(r, ans, [Fx(poly(noDiv) + ' + C'), Fx(poly(wrongDiv) + ' + C'), Fx(poly(deriv.length ? deriv : [[1, 0]]) + ' + C'), Fx(poly(F.map(([c, p]) => [-c, p])) + ' + C')]),
          explain: `מעלים כל מעריך ב-1 ומחלקים במעריך החדש: ${ans}. בדיקה: גוזרים ומקבלים את f.`,
        }
      }
      if (level === 2) {
        const x0 = r.int(-2, 2), C = r.int(-9, 9)
        const Fv = x => F.reduce((s, [c, p]) => s + c * x ** p, 0)
        const y0 = Fv(x0) + C
        const withC = c => Fx(poly([...F, [c, 0]]))
        const ans = withC(C)
        return {
          q: `מהי הפונקציה הקדומה של f שגרפה עובר בנקודה ${`(${fmt(x0)}, ${fmt(y0)})`}?`,
          expr: fx(poly(f)),
          ...choiceQ(r, ans, [withC(y0), withC(-C), withC(Fv(x0) !== 0 ? C + 2 * Fv(x0) : C + 3), Fx(poly([...noDiv, [y0 - noDiv.reduce((acc, [c, p]) => acc + c * x0 ** p, 0), 0]])), withC(C + 1)]),
          explain: `F(x) = ${poly(F)} + C. מציבים: F(${fmt(x0)}) = ${fmt(Fv(x0))} + C = ${fmt(y0)}, ולכן C = ${fmt(C)}.`,
        }
      }
      const a = r.nz(-9, 9)
      const polyF = poly(F)
      const ans = Fx(terms([part(-a, 'x'), { neg: polyF.startsWith('−'), body: polyF.replace(/^−/, '') }])+ ' + C')
      const mk = first => Fx(terms([first, { neg: polyF.startsWith('−'), body: polyF.replace(/^−/, '') }]) + ' + C')
      return {
        q: 'איזו מהפונקציות היא פונקציה קדומה של f? (x ≠ 0, C קבוע)',
        expr: fx(terms([part(a, 'x²'), { neg: poly(f).startsWith('−'), body: poly(f).replace(/^−/, '') }])),
        ...choiceQ(r, ans, [mk(part(a, 'x')), mk(part(-a, '(3x³)')), mk(part(-2 * a, 'x³')), mk(part(-a, 'x²'))]),
        explain: `${fmt(a)}/x² = ${fmt(a)}x⁻², והפונקציה הקדומה שלו: ${fmt(a)}x⁻¹/(−1) = ${fracText(-a, 1)}/x. ${ans}.`,
      }
    },
  },
  {
    slug: 'definite-integral',
    grade: 12,
    strand: 'calculus',
    title: 'אינטגרל מסוים — 4–5 יח״ל',
    emoji: '🧾',
    desc: 'חישוב אינטגרל מסוים לפי המשפט היסודי: F(b) − F(a) לפונקציה קווית, ריבועית ופונקציה עם x² במכנה — תרגול בשלוש רמות עם תשובה כשבר מצומצם, לכיתה י״ב.',
    intro: 'האינטגרל המסוים של f מ-a עד b מחושב לפי המשפט היסודי של החשבון האינפיניטסימלי: מוצאים פונקציה קדומה F ומחשבים F(b) − F(a). כאשר הפונקציה חיובית בקטע, האינטגרל שווה לשטח שבין הגרף לציר ה-x. אם הפונקציה שלילית בחלק מהקטע, אותו חלק נספר בסימן שלילי. הנושא נלמד ב-4 וב-5 יח״ל.',
    tips: ['כותבים את F בסוגריים מרובעים עם הגבולות, ורק אז מציבים.', 'הציבו קודם את הגבול העליון, אחר כך את התחתון, וחסרו.', 'שימו לב לסוגריים כשמציבים מספר שלילי.'],
    example: { q: 'חשבו ∫₁³ (3x² − 2x) dx', steps: ['F(x) = x³ − x²', 'F(3) = 27 − 9 = 18 ;  F(1) = 1 − 1 = 0', '18 − 0 = 18'], a: '18' },
    faq: [
      { q: 'האם האינטגרל המסוים תמיד שווה לשטח?', a: 'רק כשהפונקציה חיובית בכל הקטע. אם הגרף מתחת לציר, האינטגרל שלילי והשטח הוא הערך המוחלט שלו.' },
      { q: 'מה קורה ל-C באינטגרל מסוים?', a: 'הוא מצטמצם: (F(b) + C) − (F(a) + C) = F(b) − F(a), ולכן לא כותבים אותו.' },
    ],
    levels: ['פונקציה קווית', 'פולינום ממעלה שנייה', 'x² במכנה'],
    gen(level, r) {
      let p, q
      if (level === 3) { do { p = r.int(1, 4); q = r.int(2, 6) } while (p >= q) } else { do { p = r.int(-3, 3); q = r.int(-2, 4) } while (p >= q) }
      if (level === 1) {
        const a = r.nz(-6, 6), b = r.int(-9, 9)
        const n = a * (q * q - p * p) + 2 * b * (q - p)
        return { q: 'חשבו את האינטגרל. כתבו מספר שלם או שבר מצומצם.', expr: integral(p, q, lin(a, b)), ...fracAnswer(n, 2), explain: `F(x) = ${poly([[[a, 2], 2], [b, 1]])}. F(${fmt(q)}) − F(${fmt(p)}) = ${fracText(n, 2)}.` }
      }
      if (level === 2) {
        const a = r.nz(-4, 4), b = r.int(-6, 6), c = r.int(-9, 9)
        const n = 2 * a * (q ** 3 - p ** 3) + 3 * b * (q * q - p * p) + 6 * c * (q - p)
        return { q: 'חשבו את האינטגרל. כתבו מספר שלם או שבר מצומצם.', expr: integral(p, q, poly([[a, 2], [b, 1], [c, 0]])), ...fracAnswer(n, 6), explain: `F(x) = ${poly([[[a, 3], 3], [[b, 2], 2], [c, 1]])}. F(${fmt(q)}) − F(${fmt(p)}) = ${fracText(n, 6)}.` }
      }
      const a = r.nz(-12, 12), b = r.int(-4, 4)
      // ∫ a/x² + b x = [−a/x + b x²/2]
      const n = 2 * a * (q - p) + b * (q * q - p * p) * p * q, d = 2 * p * q
      return {
        q: 'חשבו את האינטגרל. כתבו מספר שלם או שבר מצומצם.',
        expr: integral(p, q, terms([part(a, 'x²'), [b, 'x']])),
        ...fracAnswer(n, d),
        explain: `F(x) = ${terms([part(-a, 'x'), [[b, 2], 'x²']])}. F(${q}) − F(${p}) = ${fracText(n, d)}.`,
      }
    },
  },
  {
    slug: 'area-between-curves',
    grade: 12,
    strand: 'calculus',
    title: 'חישוב שטחים בעזרת אינטגרל — 4–5 יח״ל',
    emoji: '🟩',
    desc: 'חישוב שטח בעזרת אינטגרל: שטח בין פרבולה לציר x, שטח מתחת לציר ושטח כלוא בין פרבולה לישר — תרגול בשלוש רמות לכיתה י״ב, עם תשובה כשבר מצומצם והסבר.',
    intro: 'כדי לחשב שטח כלוא בין גרף לציר ה-x מוצאים את נקודות החיתוך עם הציר — הן גבולות האינטגרל — ומחשבים את האינטגרל. אם הגרף מתחת לציר, האינטגרל שלילי, והשטח הוא ערכו המוחלט. שטח בין שני גרפים: ∫(f − g)dx, כאשר f הוא הגרף העליון בקטע, והגבולות הם נקודות החיתוך בין הגרפים. הנושא נלמד ב-4 וב-5 יח״ל.',
    tips: ['תמיד מתחילים בסקיצה — היא מראה מי הגרף העליון.', 'שטח הוא תמיד חיובי.', 'בשטח בין גרפים: "עליון פחות תחתון", ואז אינטגרל בין נקודות החיתוך.'],
    example: { q: 'מצאו את השטח הכלוא בין y = −x² + 4x לציר ה-x', steps: ['נקודות חיתוך: x = 0 ו-x = 4', '∫₀⁴ (−x² + 4x) dx = [−x³/3 + 2x²]₀⁴ = −64/3 + 32'], a: '32/3' },
    faq: [
      { q: 'מה עושים אם הגרף חוצה את הציר בתוך הקטע?', a: 'מחלקים את הקטע בנקודת החיתוך ומחשבים כל חלק בנפרד, ואז מחברים את הערכים המוחלטים.' },
      { q: 'איך יודעים מי הגרף העליון?', a: 'מציבים נקודה כלשהי בין נקודות החיתוך בשתי הפונקציות — הגדולה מביניהן היא העליונה.' },
    ],
    levels: ['פרבולה וציר x', 'מקדם מוביל כלשהו', 'פרבולה וישר'],
    gen(level, r) {
      let r1, r2
      do { r1 = r.int(-4, 3); r2 = r.int(-3, 5) } while (r1 >= r2 || r2 - r1 > 6)
      const a = level === 1 ? -1 : r.pick([1, 2, 3, -2, -3])
      const w = r2 - r1, area = [Math.abs(a) * w ** 3, 6]
      if (level < 3) {
        return {
          q: 'מהו השטח הכלוא בין גרף הפונקציה לבין ציר ה-x? כתבו מספר שלם או שבר מצומצם.',
          expr: `y = ${poly([[a, 2], [-a * (r1 + r2), 1], [a * r1 * r2, 0]])}`,
          ...fracAnswer(...area), unit: 'יח״ר',
          explain: `נקודות החיתוך עם ציר ה-x: x = ${fmt(r1)} ו-x = ${fmt(r2)}. ${a < 0 ? 'הגרף מעל הציר בקטע' : 'הגרף מתחת לציר בקטע, ולכן לוקחים ערך מוחלט'}: |∫${sub(r1)}${sup(r2)} y dx| = ${fracText(...area)}.`,
        }
      }
      const m = r.int(-3, 3), k = r.int(-5, 5)
      const b = m - a * (r1 + r2), c = k + a * r1 * r2
      return {
        q: 'מהו השטח הכלוא בין הפרבולה לבין הישר? כתבו מספר שלם או שבר מצומצם.',
        expr: `y = ${poly([[a, 2], [b, 1], [c, 0]])} ,  y = ${lin(m, k)}`,
        ...fracAnswer(...area), unit: 'יח״ר',
        explain: `נקודות החיתוך: x = ${fmt(r1)} ו-x = ${fmt(r2)}. ${a < 0 ? 'הפרבולה' : 'הישר'} הוא הגרף העליון בקטע. השטח = ∫${sub(r1)}${sup(r2)} |${poly([[a, 2], [-a * (r1 + r2), 1], [a * r1 * r2, 0]])}| dx = ${fracText(...area)}.`,
      }
    },
  },
  {
    slug: 'volume-of-revolution',
    grade: 12,
    strand: 'calculus',
    title: 'נפח גוף סיבוב — 5 יח״ל',
    emoji: '🏺',
    desc: 'נפח גוף סיבוב סביב ציר x בעזרת אינטגרל: V = π∫y²dx לישר (חרוט), לשורש ולפרבולה — תרגול בשלוש רמות ל-5 יח״ל עם תשובה כמקדם של π ופתרון מלא.',
    intro: 'כשמסובבים סביב ציר ה-x את השטח שבין גרף הפונקציה לציר, בקטע a ≤ x ≤ b, מתקבל גוף סיבוב. נפחו מחושב בנוסחה V = π∫ₐᵇ (f(x))² dx: כל "פרוסה" היא עיגול שרדיוסו f(x). למשל, סיבוב הישר y = rx/h בקטע 0 ≤ x ≤ h נותן חרוט שנפחו πr²h/3. הנושא נלמד ב-5 יח״ל.',
    tips: ['מעלים את הפונקציה בריבוע לפני האינטגרציה — לא אחרי.', '(√x)² = x, ולכן אינטגרל של שורש בריבוע הוא פשוט.', 'השאירו את π בחוץ ורק בסוף כפלו בו.'],
    example: { q: 'חשבו את נפח הגוף שנוצר מסיבוב y = 2x, 0 ≤ x ≤ 3, סביב ציר x', steps: ['V = π∫₀³ 4x² dx', '= π[4x³/3]₀³ = π · 36'], a: '36π' },
    faq: [
      { q: 'למה מעלים בריבוע?', a: 'כל חתך של הגוף הוא עיגול ברדיוס f(x), ושטחו π(f(x))². הנפח הוא "סכום" שטחי החתכים — אינטגרל.' },
      { q: 'איך מקלידים תשובה עם π?', a: 'כאן מקלידים רק את המקדם של π. למשל עבור 36π מקלידים 36, ועבור 8π/3 מקלידים 8/3.' },
    ],
    levels: ['ישר דרך הראשית (חרוט)', 'שורש', 'פרבולה וישר כללי'],
    gen(level, r) {
      const Q = 'מהו נפח הגוף שנוצר מסיבוב השטח שבין הגרף לציר ה-x סביב ציר ה-x בקטע הנתון? הקלידו את המקדם של π (מספר שלם או שבר מצומצם).'
      if (level === 1) {
        const m = r.nz(-4, 4), h = r.int(1, 6)
        return { q: Q, expr: `y = ${lin(m, 0)} ,  0 ≤ x ≤ ${h}`, ...fracAnswer(m * m * h ** 3, 3), unit: 'π', explain: `V = π∫₀${sup(h)} ${m * m}x² dx = π · ${m * m}x³/3 |₀${sup(h)} = ${fracText(m * m * h ** 3, 3)}π.` }
      }
      if (level === 2) {
        const a = r.int(1, 6), p = r.int(0, 3), q = p + r.int(1, 4)
        return { q: Q, expr: `y = √${a === 1 ? 'x' : `(${a}x)`} ,  ${p} ≤ x ≤ ${q}`, ...fracAnswer(a * (q * q - p * p), 2), unit: 'π', explain: `y² = ${a === 1 ? '' : a}x. V = π∫ ${a === 1 ? '' : a}x dx = π · ${a}x²/2 |${sub(p)}${sup(q)} = ${fracText(a * (q * q - p * p), 2)}π.` }
      }
      if (r.bool()) {
        const k = r.int(1, 3), p = r.int(0, 1), q = p + r.int(1, 2)
        return { q: Q, expr: `y = ${poly([[k, 2]])} ,  ${p} ≤ x ≤ ${q}`, ...fracAnswer(k * k * (q ** 5 - p ** 5), 5), unit: 'π', explain: `y² = ${k * k === 1 ? '' : k * k}x⁴. V = π · ${k * k}x⁵/5 |${sub(p)}${sup(q)} = ${fracText(k * k * (q ** 5 - p ** 5), 5)}π.` }
      }
      const m = r.nz(-3, 3), b = r.int(1, 4), p = r.int(0, 2), q = p + r.int(1, 3)
      // ∫ (mx + b)² = m²x³/3 + mbx² + b²x
      const n = m * m * (q ** 3 - p ** 3) + 3 * m * b * (q * q - p * p) + 3 * b * b * (q - p)
      return { q: Q, expr: `y = ${lin(m, b)} ,  ${p} ≤ x ≤ ${q}`, ...fracAnswer(n, 3), unit: 'π', explain: `y² = ${poly([[m * m, 2], [2 * m * b, 1], [b * b, 0]])}. V = π[${poly([[[m * m, 3], 3], [m * b, 2], [b * b, 1]])}]${sub(p)}${sup(q)} = ${fracText(n, 3)}π.` }
    },
  },
  {
    slug: 'exponential-log-equations',
    grade: 12,
    strand: 'functions',
    title: 'משוואות מעריכיות ולוגריתמיות — 4–5 יח״ל',
    emoji: '🔢',
    desc: 'פתרון משוואות מעריכיות ולוגריתמיות: השוואת בסיסים, הגדרת הלוגריתם, משוואות עם e ו-ln והצבת t = aˣ — תרגול בשלוש רמות לכיתה י״ב ל-4 ו-5 יח״ל.',
    intro: 'במשוואה מעריכית מנסים לכתוב את שני האגפים כחזקות של אותו בסיס ואז להשוות מעריכים: 2ˣ⁺¹ = 32 = 2⁵ ⇐ x + 1 = 5. כשאי אפשר — מפעילים לוגריתם: eˣ = 7 ⇐ x = ln 7. משוואה לוגריתמית פותרים לפי ההגדרה: log_b(y) = m ⇔ y = bᵐ, ובודקים שהביטוי שבתוך הלוגריתם חיובי. משוואה כמו 4ˣ − 6·2ˣ + 8 = 0 פותרים בהצבה t = 2ˣ.',
    tips: ['4ˣ = (2ˣ)², 9ˣ = (3ˣ)² — שימושי להצבה.', 'ln הוא לוגריתם בבסיס e: ln(eˣ) = x.', 'אחרי פתרון משוואה לוגריתמית בודקים את תחום ההגדרה.'],
    example: { q: 'פתרו: log₂(x + 3) = 4', steps: ['לפי ההגדרה: x + 3 = 2⁴ = 16', 'x = 13, ו-13 + 3 > 0'], a: 'x = 13' },
    faq: [
      { q: 'מה עושים כשהבסיסים שונים?', a: 'מנסים לכתוב את שניהם כחזקות של בסיס משותף (8 = 2³, 4 = 2²). אם אין בסיס משותף — מפעילים log או ln על שני האגפים.' },
      { q: 'למה מתקבל לפעמים פתרון שנפסל?', a: 'כי לוגריתם מוגדר רק למספרים חיוביים. פתרון שהופך את הביטוי שבתוך הלוגריתם לאפס או לשלילי — נפסל.' },
    ],
    levels: ['השוואת בסיסים', 'לוגריתם ובסיסים שונים', 'e, ln והצבה'],
    gen(level, r) {
      if (level === 1) {
        const b = r.pick([2, 3, 5]), m = r.int(b === 2 ? -2 : -1, b === 2 ? 7 : 4), a = r.pick([1, 1, 2, 3]), k = r.int(-4, 4)
        const rhs = m >= 0 ? `${b ** m}` : `1/${b ** -m}`
        return {
          q: 'פתרו את המשוואה. כתבו מספר שלם או שבר מצומצם.',
          expr: `${b}${sup(`${a === 1 ? '' : a}x${k ? (k > 0 ? '+' + k : k) : ''}`)} = ${rhs}`,
          ...fracAnswer(m - k, a),
          explain: `${rhs} = ${b}${sup(m)}, ולכן ${lin(a, k)} = ${fmt(m)} ⇐ x = ${fracText(m - k, a)}.`,
        }
      }
      if (level === 2) {
        if (r.bool()) {
          const b = r.pick([2, 3, 10]), m = r.int(1, b === 2 ? 6 : b === 3 ? 4 : 2), k = r.int(-9, 9)
          return {
            q: 'פתרו את המשוואה.',
            expr: `log${sub(b)}(${lin(1, k)}) = ${m}`,
            type: 'number', answer: b ** m - k,
            explain: `לפי ההגדרה: x ${k < 0 ? '−' : '+'} ${Math.abs(k)} = ${b}${sup(m)} = ${b ** m}, ולכן x = ${fmt(b ** m - k)}.`.replace(' + 0', '').replace(' − 0', ''),
          }
        }
        // different bases: (base^p)^x = base^q  →  x = q/p
        const base = r.pick([2, 3]), [p1, p2] = base === 2 ? r.pick([[2, 3], [3, 2], [2, 5], [3, 4], [2, 1], [4, 3]]) : r.pick([[2, 3], [3, 2], [2, 1], [1, 2]])
        return {
          q: 'פתרו את המשוואה. כתבו מספר שלם או שבר מצומצם.',
          expr: `${base ** p1}ˣ = ${base ** p2}`,
          ...fracAnswer(p2, p1),
          explain: `${base ** p1} = ${base}${sup(p1)} ו-${base ** p2} = ${base}${sup(p2)}, ולכן ${p1}x = ${p2} ⇐ x = ${fracText(p2, p1)}.`,
        }
      }
      const kind = r.pick(['sub', 'e', 'ln'])
      if (kind === 'sub') {
        const b = r.pick([2, 3]), pool = b === 2 ? [1, 2, 4, 8, 16] : [1, 3, 9, 27]
        const [t1, t2] = r.shuffle(pool).slice(0, 2)
        const x1 = Math.round(Math.log(t1) / Math.log(b)), x2 = Math.round(Math.log(t2) / Math.log(b))
        return {
          q: 'פתרו את המשוואה. הקלידו את כל הפתרונות, מופרדים בפסיק.',
          expr: `${b * b}ˣ − ${t1 + t2} · ${b}ˣ + ${t1 * t2} = 0`,
          type: 'numbers', answer: [x1, x2],
          explain: `מציבים t = ${b}ˣ: t² − ${t1 + t2}t + ${t1 * t2} = 0, ולכן t = ${t1} או t = ${t2}. ${b}ˣ = ${t1} ⇐ x = ${x1}; ${b}ˣ = ${t2} ⇐ x = ${x2}.`,
        }
      }
      if (kind === 'e') {
        const k = r.pick([1, 2, 3, -1, -2]), c = r.int(2, 30)
        const ans = round(Math.log(c) / k)
        return {
          q: 'פתרו את המשוואה. עגלו ל-2 ספרות אחרי הנקודה.',
          expr: `${expE(k)} = ${c}`,
          type: 'number', answer: ans, tol: 0.01,
          explain: `מפעילים ln על שני האגפים: ${k === 1 ? '' : k === -1 ? '−' : k}x = ln ${c}, ולכן x = ln ${c}${k === 1 ? '' : ` / ${par(k)}`} ≈ ${fmt(ans)}.`,
        }
      }
      const a = r.int(1, 4), b = r.int(-3, 5), c = r.int(1, 3)
      const ans = round((Math.exp(c) - b) / a)
      return {
        q: 'פתרו את המשוואה. עגלו ל-2 ספרות אחרי הנקודה.',
        expr: `ln(${lin(a, b)}) = ${c}`,
        type: 'number', answer: ans, tol: 0.01,
        explain: `לפי ההגדרה: ${lin(a, b)} = e${sup(c)}, ולכן x = (e${sup(c)} ${b < 0 ? '+' : '−'} ${Math.abs(b)})${a === 1 ? '' : ` / ${a}`} ≈ ${fmt(ans)}.`,
      }
    },
  },
  {
    slug: 'logarithm-rules',
    grade: 12,
    strand: 'functions',
    title: 'לוגריתמים וחוקי לוגריתמים — 4–5 יח״ל',
    emoji: '🪵',
    desc: 'חישוב לוגריתמים וחוקי הלוגריתמים: הגדרת log, לוגריתם של מכפלה ושל מנה ומעבר בסיס — תרגול בשלוש רמות לבגרות 4 ו-5 יח״ל, עם תשובה כמספר שלם או שבר.',
    intro: 'הלוגריתם log_b(a) הוא המעריך שצריך להעלות בו את b כדי לקבל a: log₂32 = 5 כי 2⁵ = 32. חוקי הלוגריתמים: log_b(xy) = log_b x + log_b y, log_b(x/y) = log_b x − log_b y, log_b(xⁿ) = n·log_b x, ומעבר בסיס: log_b a = log a / log b. הלוגריתם מוגדר רק כאשר a > 0, b > 0 ו-b ≠ 1. הנושא נלמד ב-4 וב-5 יח״ל.',
    tips: ['שאלו את עצמכם: "באיזו חזקה צריך להעלות את הבסיס?"', 'log של שבר כמו 1/9 נותן מספר שלילי: log₃(1/9) = −2.', 'כשהבסיס והמספר הם חזקות של אותו מספר: log₈32 = 5/3, כי 8 = 2³ ו-32 = 2⁵.'],
    example: { q: 'חשבו: log₆4 + log₆9', steps: ['לפי חוק המכפלה: log₆(4 · 9) = log₆36', '6² = 36'], a: '2' },
    faq: [
      { q: 'מה ההבדל בין log ל-ln?', a: 'log בלי בסיס הוא בדרך כלל לוגריתם בבסיס 10, ו-ln הוא לוגריתם בבסיס e (בערך 2.718).' },
      { q: 'האם log(x + y) = log x + log y?', a: 'לא! זו טעות נפוצה. החוק מתייחס למכפלה: log(xy) = log x + log y.' },
    ],
    levels: ['הגדרת הלוגריתם', 'מכפלה ומנה', 'מעבר בסיס'],
    gen(level, r) {
      if (level === 1) {
        const b = r.pick([2, 3, 5, 10]), n = r.int(b === 2 ? -4 : -2, b === 2 ? 7 : b === 3 ? 5 : 3)
        const arg = n >= 0 ? `${b ** n}` : `(1/${b ** -n})`
        return { q: 'חשבו את ערך הביטוי.', expr: `log${sub(b)}${arg}`, type: 'number', answer: n, explain: `${b}${sup(n)} = ${n >= 0 ? b ** n : `1/${b ** -n}`}, ולכן התשובה היא ${fmt(n)}.` }
      }
      if (level === 2) {
        const b = r.pick([2, 3, 6, 10]), k = r.int(1, b === 2 ? 6 : b === 3 ? 4 : 3)
        if (r.bool()) {
          const total = b ** k, divs = []
          for (let d = 2; d < total; d++) if (total % d === 0 && d * d !== total) divs.push(d)
          if (divs.length) {
            const m = r.pick(divs), n = total / m
            return { q: 'חשבו את ערך הביטוי.', expr: `log${sub(b)}${m} + log${sub(b)}${n}`, type: 'number', answer: k, explain: `log${sub(b)}(${m} · ${n}) = log${sub(b)}${total} = ${k}.` }
          }
        }
        const n = r.int(2, 9), m = n * b ** k
        return { q: 'חשבו את ערך הביטוי.', expr: `log${sub(b)}${m} − log${sub(b)}${n}`, type: 'number', answer: k, explain: `log${sub(b)}(${m} / ${n}) = log${sub(b)}${b ** k} = ${k}.` }
      }
      const base = r.pick([2, 3]), p = r.pick([2, 3]), maxQ = base === 2 ? 7 : 4
      let q
      do { q = r.int(-maxQ, maxQ) } while (q === 0 || q % p === 0)
      const B = base ** p, arg = q > 0 ? `${base ** q}` : `(1/${base ** -q})`
      return {
        q: 'חשבו את ערך הביטוי. כתבו שבר מצומצם.',
        expr: `log${sub(B)}${arg}`,
        ...fracAnswer(q, p),
        explain: `${B} = ${base}${sup(p)} ו-${q > 0 ? base ** q : `1/${base ** -q}`} = ${base}${sup(q)}. לכן התשובה היא ${q}/${p} = ${fracText(q, p)}.`,
      }
    },
  },
  {
    slug: 'exp-ln-derivatives',
    grade: 12,
    strand: 'calculus',
    title: 'נגזרות של eˣ ו-ln x — 4–5 יח״ל',
    emoji: '📐',
    desc: 'גזירת פונקציות מעריכיות ולוגריתמיות: (eˣ)′ = eˣ, (ln x)′ = 1/x, כלל השרשרת וגזירת מכפלה ומנה כמו x·eˣ ו-ln x / x — תרגול אמריקאי בשלוש רמות לכיתה י״ב.',
    intro: 'שתי נגזרות בסיסיות: (eˣ)′ = eˣ ו-(ln x)′ = 1/x. לפי כלל השרשרת: (e^g(x))′ = g′(x)·e^g(x), ו-(ln g(x))′ = g′(x)/g(x). למכפלה משתמשים בכלל (uv)′ = u′v + uv′, ולמנה בכלל (u/v)′ = (u′v − uv′)/v². הנושא נלמד ב-4 וב-5 יח״ל, והוא הבסיס לחקירת פונקציות מעריכיות ולוגריתמיות.',
    tips: ['(e^(kx))′ = k·e^(kx) — המעריך לא משתנה, רק מוסיפים מקדם.', '(ln(ax + b))′ = a/(ax + b).', 'במכפלה x·eˣ: הנגזרת היא eˣ + x·eˣ = (x + 1)eˣ.'],
    example: { q: 'גזרו: f(x) = x²·eˣ', steps: ['u = x², v = eˣ', 'f′ = 2x·eˣ + x²·eˣ'], a: 'f′(x) = (x² + 2x)eˣ' },
    faq: [
      { q: 'למה הנגזרת של eˣ היא eˣ?', a: 'זו התכונה המיוחדת של המספר e: שיפוע הגרף בכל נקודה שווה לגובה הגרף באותה נקודה.' },
      { q: 'מה הנגזרת של ln(5x)?', a: '5/(5x) = 1/x. זה הגיוני, כי ln(5x) = ln 5 + ln x, ו-ln 5 קבוע.' },
    ],
    levels: ['eˣ ו-ln x', 'כלל השרשרת', 'מכפלה ומנה'],
    gen(level, r) {
      if (level === 1) {
        const a = r.nz(-6, 6), b = r.nz(-5, 5), n = r.int(2, 3)
        if (r.bool()) {
          const ex = { neg: a < 0, body: `${Math.abs(a) === 1 ? '' : Math.abs(a)}eˣ` }
          const f = fx(terms([ex, [b, 'x' + sup(n)]]))
          const ans = dfx(terms([ex, [n * b, n === 2 ? 'x' : 'x²']]))
          return {
            q: 'מהי הנגזרת של הפונקציה?', expr: f,
            ...choiceQ(r, ans, [dfx(terms([{ neg: a < 0, body: `${Math.abs(a) === 1 ? '' : Math.abs(a)}xeˣ⁻¹` }, [n * b, n === 2 ? 'x' : 'x²']])), dfx(terms([ex, [b, 'x' + sup(n)]])), dfx(terms([[n * b, n === 2 ? 'x' : 'x²']])), dfx(terms([{ neg: a < 0, body: `${Math.abs(a) === 1 ? '' : Math.abs(a)}eˣ⁻¹` }, [n * b, n === 2 ? 'x' : 'x²']]))]),
            explain: `(eˣ)′ = eˣ, ולכן ${ans}.`,
          }
        }
        const f = fx(terms([[a, 'ln x'], [b, 'x²']]))
        const ans = dfx(terms([part(a, 'x'), [2 * b, 'x']]))
        return {
          q: 'מהי הנגזרת של הפונקציה? (x > 0)', expr: f,
          ...choiceQ(r, ans, [dfx(terms([[a, 'ln x'], [2 * b, 'x']])), dfx(terms([[a, 'x'], [2 * b, 'x']])), dfx(terms([part(a, 'x²'), [2 * b, 'x']])), dfx(terms([part(-a, 'x'), [2 * b, 'x']]))]),
          explain: `(ln x)′ = 1/x, ולכן ${ans}.`,
        }
      }
      if (level === 2) {
        const a = r.nz(-4, 4), c = r.int(-5, 5)
        if (r.bool()) {
          const E = expE(a, c), kx = a === 1 ? '' : a === -1 ? '−' : fmt(a)
          const ans = dfx(`${kx}${E}`)
          return {
            q: 'מהי הנגזרת של הפונקציה?', expr: fx(E),
            ...choiceQ(r, ans, [dfx(E), dfx(c ? `${kx}${expE(a)}` : `${kx}eˣ`), dfx(`${kx}x${E}`), dfx(`${a === -1 ? '' : a === 1 ? '−' : fmt(-a)}${E}`)]),
            explain: `לפי כלל השרשרת: הנגזרת של המעריך ${lin(a, c)} היא ${fmt(a)}, ולכן ${ans}.`,
          }
        }
        const p = r.int(2, 5), q = r.int(1, 9)
        const inner = lin(p, q)
        const ans = dfx(`${p}/(${inner})`)
        return {
          q: 'מהי הנגזרת של הפונקציה? (x > 0)', expr: fx(`ln(${inner})`),
          ...choiceQ(r, ans, [dfx(`1/(${inner})`), dfx(`${p}/x`), dfx(`${p}ln(${inner})`), dfx(`(${inner})/${p}`)]),
          explain: `לפי כלל השרשרת: (ln g)′ = g′/g, ו-g′ = ${p}. לכן ${ans}.`,
        }
      }
      const kind = r.pick(['xekx', 'xlnx', 'lnx/x', 'ex/x'])
      if (kind === 'xekx') {
        const k = r.pick([1, 2, 3, -1, -2]), E = expE(k)
        const ans = dfx(`(${lin(k, 1)})${E}`)
        return {
          q: 'מהי הנגזרת של הפונקציה?', expr: fx(`x${E}`),
          ...choiceQ(r, ans, [dfx(E), dfx(`${k === 1 ? '' : k === -1 ? '−' : k}${E}`), dfx(`(${lin(k, -1)})${E}`), dfx(`(${lin(1, k)})${E}`), dfx(`(x + 1)${E}`)]),
          explain: `לפי כלל המכפלה: 1 · ${E} + x · ${k === 1 ? '' : par(k)}${E} = (${lin(k, 1)})${E}.`,
        }
      }
      if (kind === 'xlnx') {
        const n = r.int(1, 3)
        const xn = n === 1 ? 'x' : 'x' + sup(n), xn1 = n === 1 ? '' : n === 2 ? 'x' : 'x' + sup(n - 1)
        const ans = n === 1 ? dfx('ln x + 1') : dfx(`${n}${xn1}ln x + ${xn1}`)
        const cands = n === 1 ? [dfx('1/x'), dfx('ln x'), dfx('ln x − 1'), dfx('x ln x + 1')] : [dfx(`${n}${xn1}ln x`), dfx(`${n}${n === 2 ? '' : 'x'}`), dfx(`${n}${xn1}ln x − ${xn1}`), dfx(`${xn1}ln x + ${xn1}`)]
        return {
          q: 'מהי הנגזרת של הפונקציה? (x > 0)', expr: fx(`${xn}ln x`),
          ...choiceQ(r, ans, cands),
          explain: `לפי כלל המכפלה: (${xn})′ · ln x + ${xn} · 1/x. ${ans}.`,
        }
      }
      if (kind === 'lnx/x') {
        const ans = dfx('(1 − ln x)/x²')
        return {
          q: 'מהי הנגזרת של הפונקציה? (x > 0)', expr: fx('ln x/x'),
          ...choiceQ(r, ans, [dfx('(ln x − 1)/x²'), dfx('1/x²'), dfx('(1 − ln x)/x'), dfx('(1 + ln x)/x²')]),
          explain: 'לפי כלל המנה: ((1/x) · x − ln x · 1) / x² = (1 − ln x)/x².',
        }
      }
      const ans = dfx('(x − 1)eˣ/x²')
      return {
        q: 'מהי הנגזרת של הפונקציה? (x ≠ 0)', expr: fx('eˣ/x'),
        ...choiceQ(r, ans, [dfx('(1 − x)eˣ/x²'), dfx('eˣ'), dfx('(x + 1)eˣ/x²'), dfx('(x − 1)eˣ/x')]),
        explain: 'לפי כלל המנה: (eˣ · x − eˣ · 1) / x² = (x − 1)eˣ/x².',
      }
    },
  },
  {
    slug: 'exp-log-extrema',
    grade: 12,
    strand: 'calculus',
    title: 'חקירת פונקציות מעריכיות ולוגריתמיות — 4–5 יח״ל',
    emoji: '🔍',
    desc: 'נקודות קיצון של פונקציות עם eˣ ו-ln x: גזירת מכפלה (x + a)eˣ, פולינום ריבועי כפול eˣ ופונקציה ax² − b·ln x — תרגול בשלוש רמות לחקירת פונקציות בכיתה י״ב.',
    intro: 'גם בפונקציות מעריכיות ולוגריתמיות מוצאים נקודות קיצון בעזרת הנגזרת. תכונה שימושית: eˣ > 0 תמיד, ולכן בביטוי כמו (x² − 4)eˣ הנגזרת מתאפסת רק כשהגורם הפולינומי מתאפס. בפונקציה עם ln x תחום ההגדרה הוא x > 0, ופתרונות שליליים נפסלים. אחרי שמוצאים את x, מציבים בפונקציה המקורית כדי למצוא את y.',
    tips: ['מוציאים eˣ כגורם משותף: (x² + 2x)eˣ = x(x + 2)eˣ.', 'eˣ אף פעם לא אפס — מחלקים בו בלי חשש.', 'עם ln x: בודקים תמיד ש-x > 0.'],
    example: { q: 'מצאו את נקודת הקיצון של f(x) = (x − 2)eˣ', steps: ['f′(x) = eˣ + (x − 2)eˣ = (x − 1)eˣ', 'f′(x) = 0 ⇐ x = 1', 'f(1) = −e ≈ −2.72, נקודת מינימום'], a: '(1, −e)' },
    faq: [
      { q: 'איך יודעים אם זו נקודת מינימום או מקסימום?', a: 'בודקים את סימן הנגזרת משני צידי הנקודה, כמו בפולינום. מכיוון ש-eˣ חיובי, מספיק לבדוק את הגורם הפולינומי.' },
      { q: 'האם eˣ יכול לגרום לנגזרת להתאפס?', a: 'לא. eˣ תמיד חיובי, ולכן הוא לא משפיע על נקודות האפס של הנגזרת, רק "מגדיל" או "מקטין" את ערכה.' },
    ],
    levels: ['(x + a)eˣ', 'פולינום ריבועי כפול eˣ', 'ax² − b·ln x'],
    gen(level, r) {
      if (level === 1) {
        const a = r.int(-6, 6)
        return {
          q: 'מצאו את שיעור ה-x של נקודת הקיצון של הפונקציה.',
          expr: fx(`${a === 0 ? 'x' : `(${lin(1, a)})`}eˣ`),
          type: 'number', answer: -a - 1,
          explain: `f′(x) = eˣ + ${a === 0 ? 'x' : `(${lin(1, a)})`}eˣ = (${lin(1, a + 1)})eˣ. מכיוון ש-eˣ > 0: x = ${fmt(-a - 1)}.`,
        }
      }
      if (level === 2) {
        let r1, r2
        do { r1 = r.int(-5, 4); r2 = r.int(-4, 5) } while (r1 >= r2)
        // f = (x² + bx + c)eˣ → f′ = (x² + (b + 2)x + b + c)eˣ
        const b = -(r1 + r2) - 2, c = r1 * r2 - b
        return {
          q: 'מצאו את שיעורי ה-x של נקודות הקיצון של הפונקציה. הקלידו את שניהם, מופרדים בפסיק.',
          expr: fx(`(${poly([[1, 2], [b, 1], [c, 0]])})eˣ`),
          type: 'numbers', answer: [r1, r2],
          explain: `f′(x) = (${poly([[1, 2], [b + 2, 1], [b + c, 0]])})eˣ. הגורם הריבועי מתאפס ב-x = ${fmt(r1)} ו-x = ${fmt(r2)}.`,
        }
      }
      const x0 = r.int(2, 4), a = r.int(1, 3), b = 2 * a * x0 * x0
      const y = round(a * x0 * x0 - b * Math.log(x0))
      return {
        q: 'לפונקציה יש נקודת קיצון אחת. מהו שיעור ה-y שלה? עגלו ל-2 ספרות אחרי הנקודה.',
        expr: fx(terms([[a, 'x²'], [-b, 'ln x']])),
        type: 'number', answer: y, tol: 0.01,
        explain: `f′(x) = ${2 * a}x − ${b}/x = 0 ⇐ x² = ${x0 * x0} ⇐ x = ${x0} (x > 0). f(${x0}) = ${a * x0 * x0} − ${b}·ln ${x0} ≈ ${fmt(y)} (נקודת מינימום).`,
      }
    },
  },
  {
    slug: 'chain-quotient-derivatives',
    grade: 12,
    strand: 'calculus',
    title: 'נגזרת של שורש, מנה והרכבה — 4–5 יח״ל',
    emoji: '🔗',
    desc: 'גזירת פונקציות מורכבות: נגזרת של שורש √(ax + b), כלל המנה לפונקציה רציונלית וכלל השרשרת לחזקה של ביטוי — תרגול אמריקאי בשלוש רמות עם מסיחים מטעויות נפוצות.',
    intro: 'כלל השרשרת: הנגזרת של פונקציה מורכבת f(g(x)) היא f′(g(x))·g′(x) — גוזרים את "החיצונית" וכופלים בנגזרת "הפנימית". לכן (√g)′ = g′/(2√g) ו-(gⁿ)′ = n·gⁿ⁻¹·g′. כלל המנה: (u/v)′ = (u′v − uv′)/v². טעויות נפוצות הן שכחת הנגזרת הפנימית והחלפת הסדר במונה של כלל המנה. הנושא נלמד ב-4 וב-5 יח״ל.',
    tips: ['אל תשכחו לכפול בנגזרת הפנימית.', 'במונה של כלל המנה: "נגזרת המונה כפול המכנה" קודם.', 'המכנה בכלל המנה מופיע בריבוע.'],
    example: { q: 'גזרו: f(x) = (2x + 1)/(x − 3)', steps: ['u = 2x + 1, v = x − 3', 'f′ = (2(x − 3) − (2x + 1) · 1)/(x − 3)²', '= −7/(x − 3)²'], a: 'f′(x) = −7/(x − 3)²' },
    faq: [
      { q: 'איך זוכרים את כלל המנה?', a: 'משפט עזר: "נגזרת עליון כפול תחתון, פחות עליון כפול נגזרת תחתון, חלקי תחתון בריבוע".' },
      { q: 'מה תחום ההגדרה של הנגזרת של √(ax + b)?', a: 'ax + b > 0 — כי בנקודה שבה הביטוי מתאפס המכנה של הנגזרת הוא אפס.' },
    ],
    levels: ['שורש של ביטוי ליניארי', 'כלל המנה', 'חזקה של ביטוי / שורש של ריבועי'],
    gen(level, r) {
      if (level === 1) {
        const a = r.nz(1, 8), b = r.int(-9, 9), g = lin(a, b)
        const top = (n, two) => (two ? `${n}/(2√(${g}))` : `${n}/√(${g})`)
        const ans = dfx(a % 2 === 0 ? top(a / 2, false) : top(a, true))
        return {
          q: 'מהי הנגזרת של הפונקציה? (בתחום ההגדרה)', expr: fx(`√(${g})`),
          ...choiceQ(r, ans, [dfx(top(1, true)), dfx(top(a, false)), dfx(`${a === 1 ? '' : a}√(${g})`), dfx(top(2 * a, false))]),
          explain: `(√g)′ = g′/(2√g), ו-g′ = ${a}. לכן ${ans}.`,
        }
      }
      if (level === 2) {
        let a, b, c, d
        do { a = r.nz(-5, 5); b = r.int(-9, 9); c = r.pick([1, 1, 2, -1]); d = r.nz(-6, 6) } while (a * d - b * c === 0 || b * c === 0)
        const num = lin(a, b), den = lin(c, d), D = a * d - b * c
        const ans = dfx(`${fmt(D)}/(${den})²`)
        return {
          q: 'מהי הנגזרת של הפונקציה? (בתחום ההגדרה)', expr: fx(`(${num})/(${den})`),
          ...choiceQ(r, ans, [dfx(`${fmt(-D)}/(${den})²`), dfx(`${fmt(D)}/(${den})`), dfx(`${fmt(a * d + b * c)}/(${den})²`), dfx(fracText(a, c))]),
          explain: `לפי כלל המנה: (${fmt(a)}·(${den}) − (${num})·${par(c)}) / (${den})² = ${fmt(D)}/(${den})².`,
        }
      }
      if (r.bool()) {
        const a = r.int(1, 4), b = r.nz(-6, 6), n = r.int(3, 6), g = lin(a, b)
        const P = k => (k === 1 ? `(${g})` : `(${g})${sup(k)}`)
        const ans = dfx(`${fmt(n * a)}${P(n - 1)}`)
        return {
          q: 'מהי הנגזרת של הפונקציה?', expr: fx(P(n)),
          ...choiceQ(r, ans, [dfx(`${n}${P(n - 1)}`), dfx(`${fmt(n * a)}${P(n)}`), dfx(`${a === 1 ? n + 1 : a}${P(n - 1)}`), dfx(`${fmt(-n * a)}${P(n - 1)}`)]),
          explain: `לפי כלל השרשרת: ${n}${P(n - 1)} · ${par(a)} = ${fmt(n * a)}${P(n - 1)}.`,
        }
      }
      const k = r.nz(-9, 16), g = poly([[1, 2], [k, 0]])
      const ans = dfx(`x/√(${g})`)
      return {
        q: 'מהי הנגזרת של הפונקציה? (בתחום ההגדרה)', expr: fx(`√(${g})`),
        ...choiceQ(r, ans, [dfx(`1/(2√(${g}))`), dfx(`2x/√(${g})`), dfx(`x√(${g})`), dfx(`x/(2√(${g}))`)]),
        explain: `(√g)′ = g′/(2√g) = 2x/(2√(${g})) = x/√(${g}).`,
      }
    },
  },
  {
    slug: 'vectors',
    grade: 12,
    strand: 'vectors',
    title: 'וקטורים במרחב — 5 יח״ל',
    emoji: '➡️',
    desc: 'וקטורים במרחב לבגרות 5 יח״ל: חיבור וכפל בסקלר, מכפלה סקלרית, תנאי לניצבות וחישוב זווית בין וקטורים — תרגול בשלוש רמות עם פתרונות מלאים.',
    intro: 'וקטור במרחב נכתב בשיעורים u = (u₁, u₂, u₃). מחברים וקטורים וכופלים אותם בסקלר רכיב אחר רכיב. המכפלה הסקלרית היא u·v = u₁v₁ + u₂v₂ + u₃v₃, והיא שווה גם ל-|u|·|v|·cos θ, כאשר θ היא הזווית בין הווקטורים. מכאן: וקטורים (שונים מאפס) ניצבים זה לזה בדיוק כשהמכפלה הסקלרית שלהם היא 0. אורך וקטור: |u| = √(u₁² + u₂² + u₃²). הנושא נלמד ב-5 יח״ל.',
    tips: ['כפל בסקלר: כל רכיב מוכפל — 3·(1, −2, 4) = (3, −6, 12).', 'ניצבות ⇔ מכפלה סקלרית 0.', 'cos θ = u·v / (|u|·|v|) — אם יוצא שלילי, הזווית קהה.'],
    example: { q: 'u = (1, 2, 2), v = (2, −1, 2). מצאו את הזווית בין הווקטורים.', steps: ['u·v = 2 − 2 + 4 = 4', '|u| = 3, |v| = 3', 'cos θ = 4/9 ⇐ θ ≈ 63.6°'], a: '≈ 63.6°' },
    faq: [
      { q: 'מה ההבדל בין מכפלה סקלרית למכפלה וקטורית?', a: 'מכפלה סקלרית נותנת מספר; מכפלה וקטורית (לא בתוכנית הבגרות) נותנת וקטור.' },
      { q: 'מתי שני וקטורים מקבילים?', a: 'כשאחד הוא כפולה של השני בסקלר: v = t·u.' },
    ],
    levels: ['צירוף ליניארי', 'מכפלה סקלרית וניצבות', 'זווית בין וקטורים'],
    gen(level, r) {
      const rv = (lo, hi) => [r.int(lo, hi), r.int(lo, hi), r.int(lo, hi)]
      if (level === 1) {
        const u = rv(-6, 6), v = rv(-6, 6), p = r.pick([2, 3, -2, 4]), q = r.pick([1, 2, 3, -1])
        const w = u.map((x, i) => p * x - q * v[i])
        const name = `${p === 1 ? '' : p === -1 ? '−' : fmt(p)}u ${q < 0 ? '+' : '−'} ${Math.abs(q) === 1 ? '' : Math.abs(q)}v`
        return {
          q: `מהו הווקטור ${name}?`,
          expr: `u = ${vec(u)} ,  v = ${vec(v)}`,
          ...choiceQ(r, vec(w), [vec(u.map((x, i) => p * x + q * v[i])), vec(u.map((x, i) => x - q * v[i])), vec(u.map((x, i) => p * x - v[i])), vec(w.map((x, i) => (i === 0 ? -x : x))), vec([w[1], w[0], w[2]])]),
          explain: `מחשבים רכיב אחר רכיב: ${vec(u.map(x => p * x))} − ${vec(v.map(x => q * x))} = ${vec(w)}.`,
        }
      }
      if (level === 2) {
        if (r.bool()) {
          const u = rv(-6, 6), v = rv(-6, 6), d = u.reduce((s, x, i) => s + x * v[i], 0)
          return { q: 'מהי המכפלה הסקלרית u·v?', expr: `u = ${vec(u)} ,  v = ${vec(v)}`, type: 'number', answer: d, explain: `u·v = ${u.map((x, i) => `${par(x)}·${par(v[i])}`).join(' + ')} = ${fmt(d)}.` }
        }
        let u1, u3, v1, v2, v3
        do { u1 = r.int(-6, 6); u3 = r.int(-6, 6); v1 = r.int(-6, 6); v2 = r.nz(-5, 5); v3 = r.int(-6, 6) } while ((u1 * v1 + u3 * v3) % v2 !== 0 || Math.abs((u1 * v1 + u3 * v3) / v2) > 12)
        const t = -(u1 * v1 + u3 * v3) / v2 + 0
        return {
          q: 'לאיזה ערך של t הווקטורים u ו-v ניצבים זה לזה?',
          expr: `u = (${fmt(u1)}, t, ${fmt(u3)}) ,  v = ${vec([v1, v2, v3])}`,
          type: 'number', answer: t,
          explain: `u·v = 0: ${par(u1)}·${par(v1)} + ${par(v2)}t + ${par(u3)}·${par(v3)} = 0 ⇐ ${fmt(v2)}t = ${fmt(-(u1 * v1 + u3 * v3))} ⇐ t = ${fmt(t)}.`,
        }
      }
      let u, v
      const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
      do { u = rv(-5, 5); v = rv(-5, 5) } while (cross(u, v).every(x => x === 0))
      const d = u.reduce((s, x, i) => s + x * v[i], 0), nu = Math.hypot(...u), nv = Math.hypot(...v)
      const th = round(Math.acos(d / (nu * nv)) / DEG, 1)
      return {
        q: 'מהי הזווית בין הווקטורים u ו-v (במעלות)? עגלו לספרה אחת אחרי הנקודה.',
        expr: `u = ${vec(u)} ,  v = ${vec(v)}`,
        type: 'number', answer: th, tol: 0.1, unit: '°',
        explain: `u·v = ${fmt(d)}, |u| = √${u.reduce((s, x) => s + x * x, 0)}, |v| = √${v.reduce((s, x) => s + x * x, 0)}. cos θ = u·v / (|u||v|) ≈ ${fmt(round(d / (nu * nv), 4))}, ולכן θ ≈ ${fmt(th)}°.`,
      }
    },
  },
  {
    slug: 'complex-numbers',
    grade: 12,
    strand: 'algebra',
    title: 'מספרים מרוכבים — 5 יח״ל',
    emoji: '🌀',
    desc: 'מספרים מרוכבים לבגרות 5 יח״ל: חיבור, חיסור וכפל בצורה אלגברית, חילוק בעזרת הצמוד ומשפט דה־מואבר להעלאה בחזקה — תרגול אמריקאי בשלוש רמות עם פתרונות.',
    intro: 'מספר מרוכב נכתב בצורה z = a + bi, כאשר i² = −1. מחברים ומחסרים חלק ממשי עם ממשי וחלק מדומה עם מדומה, וכופלים כמו בפתיחת סוגריים — וזוכרים ש-i² = −1. כדי לחלק, כופלים מונה ומכנה בצמוד של המכנה (c − di). בצורה הקוטבית z = r·cis θ, ולפי משפט דה־מואבר zⁿ = rⁿ·cis(nθ). הנושא נלמד ב-5 יח״ל.',
    tips: ['(a + bi)(c + di) = (ac − bd) + (ad + bc)i.', 'z · z̄ = a² + b² — תמיד מספר ממשי.', '1 + i = √2·cis 45°, ולכן (1 + i)⁴ = 4·cis 180° = −4.'],
    example: { q: 'חשבו: (2 + 3i)(1 − i)', steps: ['2 − 2i + 3i − 3i²', '= 2 + i + 3'], a: '5 + i' },
    faq: [
      { q: 'מה זה הצמוד?', a: 'הצמוד של a + bi הוא a − bi. מכפלת מספר בצמוד שלו נותנת את ריבוע הערך המוחלט שלו: a² + b².' },
      { q: 'למה משתמשים בצורה הקוטבית?', a: 'כי בה כפל והעלאה בחזקה פשוטים מאוד: כופלים ערכים מוחלטים ומחברים זוויות.' },
    ],
    levels: ['חיבור, חיסור וכפל', 'חילוק', 'משפט דה־מואבר'],
    gen(level, r) {
      if (level === 1) {
        const a = r.nz(-6, 6), b = r.nz(-6, 6), c = r.nz(-6, 6), d = r.nz(-6, 6), op = r.pick(['+', '−', '·', '·'])
        const z1 = cText(a, b), z2 = cText(c, d)
        let ans, cands
        if (op === '+') { ans = cText(a + c, b + d); cands = [cText(a + c, b - d), cText(a - c, b + d), cText(a + d, b + c), cText(a + c, -(b + d))] }
        else if (op === '−') { ans = cText(a - c, b - d); cands = [cText(a + c, b + d), cText(a - c, b + d), cText(c - a, d - b), cText(a - c, d - b)] }
        else { ans = cText(a * c - b * d, a * d + b * c); cands = [cText(a * c + b * d, a * d + b * c), cText(a * c, b * d), cText(a * c - b * d, a * d - b * c), cText(a * c + b * d, a * d - b * c)] }
        return {
          q: 'חשבו. איזו תשובה נכונה?',
          expr: `(${z1}) ${op} (${z2})`,
          ...choiceQ(r, ans, cands),
          explain: op === '·' ? `פותחים סוגריים: ${fmt(a * c)} ${a * d < 0 ? '−' : '+'} ${Math.abs(a * d)}i ${b * c < 0 ? '−' : '+'} ${Math.abs(b * c)}i ${b * d < 0 ? '−' : '+'} ${Math.abs(b * d)}i², ו-i² = −1: ${ans}.` : `מחשבים בנפרד את החלק הממשי ואת החלק המדומה: ${ans}.`,
        }
      }
      if (level === 2) {
        const p = r.int(-6, 6), q = r.int(-6, 6), c = r.nz(-4, 4), d = r.nz(-4, 4)
        const na = p * c - q * d, nb = p * d + q * c
        const ans = cText(p, q)
        return {
          q: 'חשבו את המנה. איזו תשובה נכונה?',
          expr: `(${cText(na, nb)}) / (${cText(c, d)})`,
          ...choiceQ(r, ans, [cText(p, -q), cText(q, p), cText(-p, q), cText(p + 1, q), cText(p, q + 1)]),
          explain: `כופלים מונה ומכנה בצמוד ${cText(c, -d)}: המכנה הופך ל-${c * c + d * d}, ומקבלים ${ans}.`,
        }
      }
      const bases = [
        { t: '1 + i', r: Math.SQRT2, th: 45, step: 2 }, { t: '1 − i', r: Math.SQRT2, th: -45, step: 2 }, { t: '−1 + i', r: Math.SQRT2, th: 135, step: 2 },
        { t: '√3 + i', r: 2, th: 30, step: 3 }, { t: '1 + i√3', r: 2, th: 60, step: 3 }, { t: '1 − i√3', r: 2, th: -60, step: 3 },
      ]
      const B = r.pick(bases), n = B.step * r.int(1, B.step === 2 ? 4 : 2)
      const R = Math.round(B.r ** n), ang = B.th * n
      const val = (mag, deg) => cText(Math.round(mag * Math.cos(deg * DEG)), Math.round(mag * Math.sin(deg * DEG)))
      const ans = val(R, ang)
      return {
        q: 'חשבו בעזרת משפט דה־מואבר. איזו תשובה נכונה?',
        expr: `(${B.t})${sup(n)}`,
        ...choiceQ(r, ans, [val(R, ang + 90), val(R, ang + 180), val(R, -ang + 90), val(Math.round(B.r * n), ang), val(R / 2, ang), val(R * 2, ang)]),
        explain: `${B.t} = ${B.r === 2 ? '2' : '√2'}·cis ${B.th}°. לפי דה־מואבר: (${B.r === 2 ? '2' : '√2'})${sup(n)}·cis ${ang}° = ${R}·cis ${ang}° = ${ans}.`,
      }
    },
  },
  {
    slug: 'induction',
    grade: 12,
    strand: 'sequences',
    title: 'אינדוקציה מתמטית — 5 יח״ל',
    emoji: '🧩',
    desc: 'הוכחה באינדוקציה מתמטית לסכומי סדרות: בדיקת הבסיס, זיהוי הנוסחה הסגורה והאיבר שמוסיפים בשלב המעבר מ-n ל-n + 1 — תרגול בשלוש רמות ל-5 יח״ל.',
    intro: 'אינדוקציה מתמטית היא שיטה להוכיח טענה לכל מספר טבעי n. שלב הבסיס: מראים שהטענה נכונה עבור n = 1. שלב המעבר: מניחים שהטענה נכונה עבור n (הנחת האינדוקציה), ומוכיחים שהיא נכונה גם עבור n + 1. בטענות על סכומים, בשלב המעבר מוסיפים לשני האגפים את האיבר ה-(n + 1) ומראים שמתקבלת הנוסחה עם n + 1 במקום n. הנושא נלמד ב-5 יח״ל.',
    tips: ['האיבר ה-(n + 1) מתקבל מהאיבר הכללי בהצבת n + 1 במקום n.', 'אחרי ההוספה כדאי להוציא גורם משותף — כך רואים מהר את הנוסחה הרצויה.', 'נוסחה שמתאימה רק ל-n = 1 עוד לא הוכחה — חייבים את שלב המעבר.'],
    example: { q: 'הוכיחו: 1 + 3 + … + (2n − 1) = n²', steps: ['בסיס: n = 1 ⇐ 1 = 1²', 'מעבר: n² + (2n + 1) = (n + 1)²'], a: 'הטענה נכונה לכל n טבעי' },
    faq: [
      { q: 'למה מספיק להוכיח שני שלבים?', a: 'הבסיס נותן את n = 1, ושלב המעבר מעביר את הנכונות מ-1 ל-2, מ-2 ל-3, וכן הלאה — כמו שורת דומינו.' },
      { q: 'מה הטעות הנפוצה בשלב המעבר?', a: 'להוסיף את האיבר ה-n במקום את האיבר ה-(n + 1), או לשכוח להוסיף אותו לשני האגפים.' },
    ],
    levels: ['חישוב סכום עבור n נתון', 'זיהוי הנוסחה הסגורה', 'האיבר שמוסיפים בשלב המעבר'],
    gen(level, r) {
      const S = r.pick(SERIES)
      if (level === 1) {
        const n = r.int(3, 7), v = S.S(n)
        const ans = Number.isInteger(v) ? { type: 'number', answer: v } : fracAnswer(n, n + 1)
        return {
          q: `נתונה הטענה שלהלן. מהו ערך הסכום באגף שמאל עבור n = ${n}? כתבו מספר שלם או שבר מצומצם.`,
          expr: `${S.lhs} = ${S.rhs}`,
          ...ans,
          explain: `מציבים n = ${n} בנוסחה (או מחברים את ${n} האיברים): ${Number.isInteger(v) ? v : fracText(n, n + 1)}.`,
        }
      }
      if (level === 2) {
        return {
          q: 'איזה ביטוי שווה לסכום לכל n טבעי (ואפשר להוכיח זאת באינדוקציה)?',
          expr: `${S.lhs} = ?`,
          ...choiceQ(r, S.rhs, S.wrong),
          explain: `בדיקה: עבור n = 1 ו-n = 2 הנוסחה ${S.rhs} נותנת ${S.S(1)} ו-${fmt(S.S(2))}, כמו הסכום. את הנכונות לכל n מוכיחים באינדוקציה.`,
        }
      }
      return {
        q: 'בשלב המעבר של ההוכחה באינדוקציה מוסיפים לסכום של n האיברים הראשונים את האיבר ה-(n + 1). מהו האיבר הזה?',
        expr: `${S.lhs} = ${S.rhs}`,
        ...choiceQ(r, S.step, S.stepWrong),
        explain: `מציבים n + 1 במקום n באיבר הכללי: ${S.step}.`,
      }
    },
  },
]

export default topics
