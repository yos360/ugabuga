// Grade 6 (כיתה ו׳) math topics — multiplying/dividing fractions and decimals, fraction–decimal–percent
// conversions, percent problems, ratio and map scale, average, circle circumference and area (π ≈ 3.14),
// volume of a box/cube. Pure data + generators (see the /math contract).

// ---------- helpers ----------
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a }
// Integers ≥ 10,000 get a thousands comma (Israeli textbook style), smaller ones stay plain.
const num = x => (Number.isInteger(x) && Math.abs(x) >= 10000 ? x.toLocaleString('en-US') : String(x))
const fracStr = (n, d) => { const g = gcd(n, d); n /= g; d /= g; return d === 1 ? String(n) : `${n}/${d}` }
const fracAns = (n, d) => { const g = gcd(n, d); n /= g; d /= g; return d === 1 ? { type: 'number', answer: n } : { type: 'fraction', answer: `${n}/${d}` } }
const mixedStr = (n, d) => {
  const g = gcd(n, d); n /= g; d /= g
  if (d === 1) return String(n)
  if (n < d) return `${n}/${d}`
  return `${Math.floor(n / d)} ${n % d}/${d}`
}

// ---------- SVG helpers (markup strings, our own numbers only) ----------
const F = x => String(Math.round(x * 10) / 10)
const svg = (w, h, body, label) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${label}" font-family="Arial, sans-serif">${body}</svg>`
const txt = (x, y, s, color = 'currentColor', size = 15) => `<text x="${F(x)}" y="${F(y)}" font-size="${size}" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${color}">${s}</text>`
const seg = (a, b, w = 2.5, extra = '') => `<line x1="${F(a[0])}" y1="${F(a[1])}" x2="${F(b[0])}" y2="${F(b[1])}" stroke="currentColor" stroke-width="${w}" stroke-linecap="round"${extra}/>`

// ---------- topics ----------
const dstr = (n, scale) => String(Number((n / scale).toFixed(Math.round(Math.log10(scale)))))
const dval = (n, scale) => Number((n / scale).toFixed(Math.round(Math.log10(scale))))
const PI_NOTE = '(השתמשו ב-π ≈ 3.14, ואם צריך — עגלו לשתי ספרות אחרי הנקודה.)'

// Rational helpers for fraction exercises: [n, d].
const red = (n, d) => { const g = gcd(n, d); return [n / g, d / g] }
const properFrac = (r, maxD) => { let a, d; do { d = r.int(2, maxD); a = r.int(1, d - 1) } while (gcd(a, d) !== 1); return [a, d] }
const mixedOf = (r, maxD) => { const [a, d] = properFrac(r, maxD), w = r.int(1, 4); return { w, a, d, n: w * d + a, s: `${w} ${a}/${d}` } }

const fracMult = {
  slug: 'fraction-multiplication',
  grade: 6,
  strand: 'fractions',
  title: 'כפל שברים',
  emoji: '✖️',
  desc: 'כפל שברים לכיתה ו׳: מונה כפול מונה ומכנה כפול מכנה, צמצום לפני הכפל (צמצום "באלכסון") וכפל מספרים מעורבים — תרגול בשלוש רמות עם פתרונות מלאים.',
  intro: 'כדי לכפול שני שברים כופלים מונה במונה ומכנה במכנה: 2/3 × 4/5 = 8/15. אפשר לחשוב על זה כ"חלק מחלק": 2/3 × 4/5 הם שני שלישים מתוך ארבע חמישיות. כדי לחסוך מספרים גדולים מצמצמים לפני הכפל — מונה של שבר אחד עם מכנה של השבר השני. מספרים מעורבים הופכים קודם לשברים מדומים, ורק אז כופלים.',
  tips: [
    'מונה × מונה, מכנה × מכנה.',
    'צמצום באלכסון: אם מונה ומכנה (גם משברים שונים) מתחלקים באותו מספר — מצמצמים לפני הכפל.',
    'מספר מעורב ← שבר מדומה: 2 1/3 = 7/3.',
    'כפל בשבר קטן מ-1 מקטין את המספר.',
  ],
  example: { q: '1 1/2 × 2 2/3 = ?', steps: ['הופכים לשברים מדומים: 3/2 × 8/3.', 'מצמצמים: 3 עם 3, ו-8 עם 2 (ב-2): 1/1 × 4/1.', 'התוצאה 4.'], a: '4' },
  faq: [
    { q: 'למה בכפל שברים לא צריך מכנה משותף?', a: 'מכנה משותף צריך כשמחברים או מחסרים חלקים. בכפל לוקחים חלק מתוך חלק, ולכן פשוט כופלים מונים ומכנים.' },
    { q: 'למה התוצאה יצאה קטנה משני השברים?', a: 'כשכופלים שני שברים שקטנים מ-1, לוקחים חלק מתוך חלק — ולכן התוצאה קטנה משניהם. למשל חצי מחצי הוא רבע.' },
  ],
  levels: ['שבר × שבר', 'שבר × שבר עם צמצום', 'מספרים מעורבים'],
  gen(level, r) {
    let n1, d1, n2, d2, e1, e2
    if (level === 3) {
      const A = mixedOf(r, 6), B = r.bool() ? mixedOf(r, 6) : (() => { const [a, d] = properFrac(r, 9); return { n: a, d, s: `${a}/${d}` } })()
      n1 = A.n; d1 = A.d; n2 = B.n; d2 = B.d; e1 = A.s; e2 = B.s
    } else {
      for (;;) {
        [n1, d1] = properFrac(r, level === 1 ? 9 : 12); [n2, d2] = properFrac(r, level === 1 ? 9 : 12)
        const cross = gcd(n1, d2) > 1 || gcd(n2, d1) > 1
        // Level 1: no cross-cancelling (that is what level 2 adds), so the two levels never overlap.
        if (level === 1 ? !cross : cross) break
      }
      e1 = `${n1}/${d1}`; e2 = `${n2}/${d2}`
    }
    const [N, D] = red(n1 * n2, d1 * d2)
    const explain = `${level === 3 ? `כשברים מדומים: ${n1}/${d1} × ${n2}/${d2}. ` : ''}מונה × מונה ומכנה × מכנה: ${n1 * n2}/${d1 * d2}${D !== d1 * d2 ? ` = ${mixedStr(N, D)}` : ''}.`
    return { q: level === 3 ? 'חשבו (אפשר לענות במספר מעורב):' : 'חשבו וצמצמו:', expr: `${e1} × ${e2} = ?`, ...fracAns(N, D), explain }
  },
}

const fracDiv = {
  slug: 'fraction-division',
  grade: 6,
  strand: 'fractions',
  title: 'חילוק שברים',
  emoji: '➗',
  desc: 'חילוק שברים לכיתה ו׳: חילוק שלם בשבר, שבר בשלם ושבר בשבר — כפל בשבר ההופכי ("הפוך וכפול"), כולל מספרים מעורבים. תרגול מדורג עם פתרון מוסבר.',
  intro: 'חילוק בשבר שואל "כמה פעמים השבר נכנס במספר": 3 ÷ 1/4 = 12, כי בכל שלם יש 4 רבעים. הכלל: לחלק בשבר זה כמו לכפול בשבר ההופכי שלו (מחליפים בין המונה למכנה): 2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6. כשמחלקים שבר במספר שלם, כופלים את המכנה: 3/4 ÷ 3 = 3/12 = 1/4. מספרים מעורבים הופכים קודם לשברים מדומים.',
  tips: [
    'השבר הראשון נשאר, החילוק הופך לכפל, והשבר השני מתהפך.',
    'ההופכי של 5 הוא 1/5, וההופכי של 2/7 הוא 7/2.',
    'חילוק במספר קטן מ-1 מגדיל את המספר.',
  ],
  example: { q: '2 1/4 ÷ 3/8 = ?', steps: ['שבר מדומה: 2 1/4 = 9/4.', 'כופלים בהופכי: 9/4 × 8/3.', 'מצמצמים: 3/1 × 2/1 = 6.'], a: '6' },
  faq: [
    { q: 'למה התוצאה גדולה מהמספר שחילקנו?', a: 'כי מחלקים בחלק קטן מ-1, ולכן הוא "נכנס" יותר פעמים מאשר אחד שלם. למשל 6 ÷ 1/2 = 12, כי בכל שלם יש שני חצאים.' },
    { q: 'האם אפשר לחלק שברים בלי להפוך?', a: 'כן — מרחיבים למכנה משותף ומחלקים את המונים: 2/3 ÷ 4/5 = 10/15 ÷ 12/15 = 10 ÷ 12 = 5/6. התשובה זהה.' },
  ],
  levels: ['שלם ÷ שבר ושבר ÷ שלם', 'שבר ÷ שבר', 'מספרים מעורבים'],
  gen(level, r) {
    let n1, d1, n2, d2, e1, e2
    if (level === 1) {
      if (r.bool()) { const w = r.int(2, 12), [a, d] = properFrac(r, 10); n1 = w; d1 = 1; n2 = a; d2 = d; e1 = String(w); e2 = `${a}/${d}` }
      else { const [a, d] = properFrac(r, 10), w = r.int(2, 9); n1 = a; d1 = d; n2 = w; d2 = 1; e1 = `${a}/${d}`; e2 = String(w) }
    } else if (level === 2) {
      [n1, d1] = properFrac(r, 12); [n2, d2] = properFrac(r, 12)
      e1 = `${n1}/${d1}`; e2 = `${n2}/${d2}`
    } else {
      const A = mixedOf(r, 8)
      const B = r.bool() ? mixedOf(r, 6) : (() => { const [a, d] = properFrac(r, 9); return { n: a, d, s: `${a}/${d}` } })()
      n1 = A.n; d1 = A.d; n2 = B.n; d2 = B.d; e1 = A.s; e2 = B.s
    }
    const [N, D] = red(n1 * d2, d1 * n2)
    const inv = d2 === 1 ? `1/${n2}` : n2 === 1 ? String(d2) : `${d2}/${n2}`
    const first = d1 === 1 ? String(n1) : `${n1}/${d1}`
    return { q: level === 3 ? 'חשבו (אפשר לענות במספר מעורב):' : 'חשבו וצמצמו:', expr: `${e1} ÷ ${e2} = ?`, ...fracAns(N, D), explain: `כופלים בהופכי: ${first} × ${inv} = ${n1 * d2}/${d1 * n2}${D !== d1 * n2 || N !== n1 * d2 ? ` = ${mixedStr(N, D)}` : ''}.` }
  },
}

const decimalMult = {
  slug: 'decimal-multiplication',
  grade: 6,
  strand: 'fractions',
  title: 'כפל מספרים עשרוניים',
  emoji: '🔢',
  desc: 'כפל מספרים עשרוניים לכיתה ו׳: עשרוני כפול שלם, עשרוני כפול עשרוני ומאיות כפול עשיריות — כופלים כמו במספרים שלמים וסופרים ספרות אחרי הנקודה. עם פתרונות.',
  intro: 'כדי לכפול מספרים עשרוניים מתעלמים בהתחלה מהנקודה וכופלים כמו במספרים שלמים. אחר כך סופרים כמה ספרות יש אחרי הנקודה בשני הגורמים יחד, ושמים את הנקודה בתוצאה כך שיהיו אחריה אותו מספר ספרות. לדוגמה: 1.2 × 0.3 — כופלים 12 × 3 = 36, יש שתי ספרות אחרי הנקודה, ולכן התוצאה 0.36.',
  tips: [
    'כופלים בלי הנקודות, ובסוף מחזירים את הנקודה.',
    'מספר הספרות אחרי הנקודה בתוצאה = סכום הספרות אחרי הנקודה בגורמים.',
    'אם חסרות ספרות — משלימים אפסים משמאל: 0.2 × 0.3 = 0.06.',
    'אומדן עוזר: 4.9 × 3.1 צריך לצאת קרוב ל-5 × 3 = 15.',
  ],
  example: { q: '2.5 × 0.14 = ?', steps: ['25 × 14 = 350.', 'אחרי הנקודה: ספרה אחת ב-2.5 ושתיים ב-0.14 — שלוש ספרות.', '350 ← 0.350 = 0.35.'], a: '0.35' },
  faq: [
    { q: 'למה כפל ב-0.5 מקטין את המספר?', a: 'כי 0.5 הוא חצי, וכפל בחצי פירושו לקחת חצי מהמספר. כל כפל במספר שקטן מ-1 מקטין.' },
    { q: 'האם צריך ליישר את הנקודות בכפל?', a: 'לא. יישור נקודות דרוש בחיבור ובחיסור. בכפל כותבים את המספרים מיושרים לימין וסופרים ספרות אחרי הנקודה בסוף.' },
  ],
  levels: ['עשרוני × שלם', 'עשיריות × עשיריות', 'מאיות × עשיריות ומאיות'],
  gen(level, r) {
    const nz10 = (lo, hi) => { let v; do v = r.int(lo, hi); while (v % 10 === 0); return v }
    let a, sa, b, sb
    if (level === 1) { a = nz10(11, 999); sa = 10; b = r.int(2, 9); sb = 1; if (r.bool(0.4)) { a = nz10(101, 999); sa = 100 } }
    else if (level === 2) { a = nz10(2, 99); sa = 10; b = nz10(2, 99); sb = 10 }
    else { a = nz10(2, 299); sa = 100; b = nz10(2, 99); sb = r.bool() ? 10 : 100 }
    const p = a * b, sc = sa * sb, digits = Math.round(Math.log10(sc))
    return { q: 'חשבו:', expr: `${dstr(a, sa)} × ${dstr(b, sb)} = ?`, type: 'number', answer: dval(p, sc), explain: `בלי הנקודות: ${a} × ${b} = ${p}. בגורמים יש ${['', 'ספרה אחת', 'שתי ספרות', 'שלוש ספרות', 'ארבע ספרות'][digits]} אחרי הנקודה, ולכן התוצאה ${dstr(p, sc)}.` }
  },
}

const decimalDiv = {
  slug: 'decimal-division',
  grade: 6,
  strand: 'fractions',
  title: 'חילוק מספרים עשרוניים',
  emoji: '➗',
  desc: 'חילוק מספרים עשרוניים לכיתה ו׳: עשרוני בשלם, שלם בעשרוני ועשרוני בעשרוני — מכפילים את המחולק ואת המחלק ב-10 או ב-100 כדי שהמחלק יהיה שלם. עם פתרונות.',
  intro: 'כשמחלקים מספר עשרוני במספר שלם, מחלקים כרגיל ושמים בתוצאה את הנקודה מעל הנקודה של המחולק: 7.5 ÷ 3 = 2.5. כשהמחלק עשרוני, הופכים אותו למספר שלם: כופלים את המחולק ואת המחלק באותו מספר (10, 100...), והמנה לא משתנה. למשל 4.8 ÷ 0.06 = 480 ÷ 6 = 80.',
  tips: [
    'כפל של המחולק והמחלק באותו מספר לא משנה את המנה.',
    'מזיזים את הנקודה במחלק עד שהוא שלם — ואת הנקודה במחולק אותו מספר מקומות (ומשלימים אפסים אם צריך).',
    'חילוק במספר קטן מ-1 מגדיל: 6 ÷ 0.5 = 12.',
  ],
  example: { q: '6 ÷ 0.25 = ?', steps: ['כופלים את שניהם ב-100: 600 ÷ 25.', '600 ÷ 25 = 24.'], a: '24' },
  faq: [
    { q: 'למה מותר להזיז את הנקודה בשני המספרים?', a: 'כי כופלים את המחולק ואת המחלק באותו מספר. למשל 6 ÷ 2 = 3 וגם 60 ÷ 20 = 3 — היחס ביניהם נשאר זהה.' },
    { q: 'איך בודקים את התשובה?', a: 'כופלים את המנה במחלק: 24 × 0.25 = 6. אם יוצא המחולק — התשובה נכונה.' },
  ],
  levels: ['עשרוני ÷ שלם', 'שלם ÷ עשרוני', 'עשרוני ÷ עשרוני'],
  gen(level, r) {
    if (level === 1) {
      const sc = r.pick([10, 100]), n = r.int(2, 9)
      let q
      do q = r.int(2, sc === 10 ? 300 : 999); while (q % 10 === 0)
      const A = q * n
      return { q: 'חשבו:', expr: `${dstr(A, sc)} ÷ ${n} = ?`, type: 'number', answer: dval(q, sc), explain: `${dstr(A, sc)} ÷ ${n} = ${dstr(q, sc)}. בדיקה: ${dstr(q, sc)} × ${n} = ${dstr(A, sc)}.` }
    }
    if (level === 2) {
      const t = r.pick([2, 4, 5, 8, 12, 15, 25, 3, 6]), sc = t < 10 ? 10 : 100
      const step = sc / gcd(t, sc)
      const Q = step * r.int(1, Math.max(1, Math.floor(200 / step)))
      const A = (Q * t) / sc
      return { q: 'חשבו:', expr: `${A} ÷ ${dstr(t, sc)} = ?`, type: 'number', answer: Q, explain: `כופלים את שניהם ב-${sc}: ${num(A * sc)} ÷ ${t} = ${Q}.` }
    }
    const sc = r.pick([10, 100])
    let t
    do t = r.int(2, sc === 10 ? 50 : 90); while (t % 10 === 0)
    const Q = r.int(2, 60), A = Q * t
    return { q: 'חשבו:', expr: `${dstr(A, sc)} ÷ ${dstr(t, sc)} = ?`, type: 'number', answer: Q, explain: `כופלים את שניהם ב-${sc}: ${A} ÷ ${t} = ${Q}.` }
  },
}

const PCT_FRACS = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [9, 10], [1, 20], [3, 20], [7, 20], [9, 20], [11, 20], [1, 25], [4, 25], [6, 25], [1, 50], [7, 50], [1, 8], [3, 8], [5, 8], [7, 8]]

const conversions = {
  slug: 'fractions-decimals-percents',
  grade: 6,
  strand: 'fractions',
  title: 'שבר, מספר עשרוני ואחוז',
  emoji: '🔄',
  desc: 'מעבר בין שבר פשוט, מספר עשרוני ואחוזים לכיתה ו׳: 0.35 = 35%, 3/4 = 75%, 3/8 = 0.375 ו-40% = 2/5 — תרגול המרות בשלוש רמות עם הסבר קצר לכל תשובה.',
  intro: 'שבר, מספר עשרוני ואחוז הם שלוש דרכים לכתוב את אותה כמות. אחוז פירושו "מתוך 100": 35% = 35/100 = 0.35. כדי לעבור ממספר עשרוני לאחוזים כופלים ב-100; כדי לעבור משבר לאחוזים מרחיבים למכנה 100 (או מחלקים מונה במכנה וכופלים ב-100). מאחוז לשבר כותבים מכנה 100 ומצמצמים: 40% = 40/100 = 2/5.',
  tips: [
    'עשרוני ← אחוז: × 100 (0.07 = 7%).',
    'שבר ← אחוז: מרחיבים למכנה 100 (3/20 = 15/100 = 15%).',
    'אחוז ← שבר: מכנה 100 ומצמצמים (75% = 3/4).',
    'שבר ← עשרוני: מחלקים מונה במכנה (3/8 = 3 ÷ 8 = 0.375).',
  ],
  example: { q: 'כתבו 7/20 כאחוזים.', steps: ['מרחיבים פי 5: 7/20 = 35/100.', '35/100 = 35%.'], a: '35%' },
  faq: [
    { q: 'כמה אחוזים הם שלם אחד?', a: '100%. לכן 1.25 = 125% — יותר משלם אחד.' },
    { q: 'איך הופכים 1/8 לאחוזים?', a: '1 ÷ 8 = 0.125, ו-0.125 × 100 = 12.5%.' },
  ],
  levels: ['עשרוני ⇄ אחוז', 'שבר ← אחוז', 'אחוז ← שבר ושבר ← עשרוני'],
  gen(level, r) {
    if (level === 1) {
      const p = r.bool(0.85) ? r.int(1, 99) : r.pick([110, 125, 150, 175, 200, 250])
      if (r.bool()) return { q: `כתבו כאחוזים: ${dstr(p, 100)}`, type: 'number', unit: '%', answer: p, explain: `כופלים ב-100: ${dstr(p, 100)} × 100 = ${p}, כלומר ${p}%.` }
      return { q: `כתבו כמספר עשרוני: ${p}%`, type: 'number', answer: dval(p, 100), explain: `${p}% = ${p}/100 = ${dstr(p, 100)}.` }
    }
    const [n, d] = r.pick(PCT_FRACS)
    if (level === 2) {
      const pct = dval(n * 10000 / d, 100)
      return { q: `כתבו כאחוזים: ${n}/${d}`, type: 'number', unit: '%', answer: pct, explain: 100 % d === 0 ? `מרחיבים פי ${100 / d}: ${n}/${d} = ${n * 100 / d}/100 = ${pct}%.` : `${n} ÷ ${d} = ${dstr(n * 1000 / d, 1000)}, וכפול 100: ${pct}%.` }
    }
    if (r.bool()) {
      const pct = (n * 100) / d
      if (Number.isInteger(pct)) return { q: `כתבו כשבר מצומצם: ${pct}%`, type: 'fraction', answer: `${n}/${d}`, explain: `${pct}% = ${pct}/100 = ${n}/${d} (מצמצמים ב-${pct / n}).` }
    }
    return { q: `כתבו כמספר עשרוני: ${n}/${d}`, type: 'number', answer: dval(n * 1000 / d, 1000), explain: `מחלקים מונה במכנה: ${n} ÷ ${d} = ${dstr(n * 1000 / d, 1000)}.` }
  },
}

const percent = {
  slug: 'percent',
  grade: 6,
  strand: 'fractions',
  title: 'אחוזים — אחוז מכמות, מציאת השלם ומציאת האחוז',
  emoji: '💯',
  desc: 'אחוזים לכיתה ו׳: חישוב אחוז מכמות, הנחה במחיר, מציאת השלם כשידוע החלק ומציאת האחוז — בעיות מילוליות מדורגות עם פתרון מוסבר ודף עבודה להדפסה.',
  intro: 'אחוז הוא חלק מאה: 1% מכמות הוא הכמות ÷ 100. כדי למצוא p% מכמות מחשבים את 1% וכופלים ב-p, או משתמשים בשברים מוכרים: 50% = חצי, 25% = רבע, 10% = עשירית. מציאת השלם: אם 20% הם 30, אז 1% הוא 1.5 ו-100% הם 150. מציאת האחוז: חלק ÷ שלם × 100.',
  tips: [
    '10% = מחלקים ב-10; 5% = חצי מ-10%; 25% = מחלקים ב-4.',
    'הנחה של 20% ← משלמים 80% מהמחיר.',
    'מציאת השלם: חלק ÷ אחוז × 100.',
    'מציאת האחוז: חלק ÷ שלם × 100.',
  ],
  example: { q: 'חולצה עלתה 120 ₪ ויש עליה הנחה של 15%. כמה משלמים?', steps: ['10% = 12, 5% = 6, ולכן 15% = 18.', '120 − 18 = 102.'], a: '102 ₪' },
  faq: [
    { q: 'האם 30% מ-50 שווה ל-50% מ-30?', a: 'כן! שניהם 15. אחוז מכמות הוא כפל, וכפל הוא חילופי — לפעמים כך קל יותר לחשב.' },
    { q: 'מה ההבדל בין "הנחה של 20%" ל"משלמים 20%"?', a: 'בהנחה של 20% משלמים 80% מהמחיר. "משלמים 20%" פירושו שמשלמים רק חמישית מהמחיר.' },
  ],
  levels: ['אחוזים מוכרים (10%, 25%, 50%...)', 'כל אחוז שמתחלק ב-5, והנחות', 'מציאת השלם ומציאת האחוז'],
  gen(level, r) {
    if (level === 1) {
      const p = r.pick([10, 20, 25, 50, 75, 1]), step = 100 / gcd(p, 100), N = step * r.int(1, Math.floor(400 / step))
      return { q: `כמה הם ${p}% מ-${N}?`, type: 'number', answer: (p * N) / 100, explain: `${p}% = ${fracStr(p, 100)}, ולכן ${N} × ${p} ÷ 100 = ${(p * N) / 100}.` }
    }
    if (level === 2) {
      const p = 5 * r.int(1, 19), N = 20 * r.int(1, 25)
      if (r.bool(0.4)) {
        const pay = (N * (100 - p)) / 100
        return { q: `מחיר משחק ${N} ₪, ויש עליו הנחה של ${p}%. כמה משלמים אחרי ההנחה?`, type: 'number', unit: '₪', answer: pay, explain: `ההנחה: ${p}% מ-${N} = ${(p * N) / 100}. משלמים ${N} − ${(p * N) / 100} = ${pay} (כלומר ${100 - p}% מהמחיר).` }
      }
      return { q: `כמה הם ${p}% מ-${N}?`, type: 'number', answer: (p * N) / 100, explain: `1% מ-${N} הוא ${dstr(N, 100)}, ולכן ${p}% הם ${dstr(N, 100)} × ${p} = ${(p * N) / 100}.` }
    }
    if (r.bool()) {
      const p = r.pick([5, 10, 20, 25, 30, 40, 50, 60, 75, 80]), step = 100 / gcd(p, 100), W = step * r.int(1, Math.floor(600 / step)), Y = (p * W) / 100
      return { q: `${p}% מהתלמידים בבית הספר הם ${Y} תלמידים. כמה תלמידים לומדים בבית הספר?`, type: 'number', answer: W, explain: `1% = ${Y} ÷ ${p} = ${dstr(Y * 1000 / p, 1000)}, ולכן 100% = ${W}.` }
    }
    const W = r.pick([10, 20, 25, 40, 50, 200, 250, 400, 500, 80])
    let Y
    do Y = r.int(1, W - 1); while ((Y * 100) % W)
    return { q: `במבחן היו ${W} שאלות, ויובל ענה נכון על ${Y} מהן. כמה אחוזים מהשאלות הוא ענה נכון?`, type: 'number', unit: '%', answer: (Y * 100) / W, explain: `${Y} ÷ ${W} × 100 = ${(Y * 100) / W}%.` }
  },
}

const ratio = {
  slug: 'ratio-scale',
  grade: 6,
  strand: 'arithmetic',
  title: 'יחס וקנה מידה',
  emoji: '🗺️',
  desc: 'יחס וקנה מידה לכיתה ו׳: השלמת כמות לפי יחס, חלוקה של כמות ביחס נתון ומרחקים במפה בקנה מידה כמו 1:50,000 — בעיות מילוליות מדורגות עם פתרונות מלאים.',
  intro: 'יחס משווה בין שתי כמויות: אם בכיתה יש 2 בנים על כל 3 בנות, היחס בין הבנים לבנות הוא 2:3. כשמכפילים את שני חלקי היחס באותו מספר מקבלים יחס שווה (4:6, 10:15). כדי לחלק כמות ביחס 2:3 מחלקים אותה ל-5 חלקים שווים (2 + 3). קנה מידה הוא יחס בין מרחק במפה למרחק במציאות: בקנה מידה 1:50,000 כל ס״מ במפה הוא 50,000 ס״מ — חצי קילומטר — במציאות.',
  tips: [
    'מוצאים "פי כמה" גדל החלק הידוע, וכופלים גם את החלק השני באותו מספר.',
    'חלוקה ביחס a:b: מחלקים את הכמות ל-(a + b) חלקים שווים.',
    'בקנה מידה: מרחק במפה × המספר בקנה המידה = מרחק במציאות (בס״מ), ואחר כך ממירים למטרים או לק״מ.',
  ],
  example: { q: 'במפה בקנה מידה 1:25,000 המרחק בין שני כפרים 6 ס״מ. מה המרחק במציאות?', steps: ['6 × 25,000 = 150,000 ס״מ.', '150,000 ס״מ = 1,500 מ׳ = 1.5 ק״מ.'], a: '1.5 ק״מ' },
  faq: [
    { q: 'האם היחס 2:3 שווה ליחס 3:2?', a: 'לא. הסדר חשוב: 2:3 בין בנים לבנות אומר שיש פחות בנים, ו-3:2 אומר שיש יותר בנים.' },
    { q: 'מה פירוש קנה מידה 1:100,000?', a: 'כל ס״מ אחד במפה מייצג 100,000 ס״מ במציאות, כלומר 1,000 מטר = קילומטר אחד.' },
  ],
  levels: ['השלמה לפי יחס', 'חלוקת כמות ביחס', 'קנה מידה במפה'],
  gen(level, r) {
    let a, b
    do { a = r.int(1, 9); b = r.int(1, 9) } while (a === b || gcd(a, b) !== 1)
    const k = r.int(2, 12)
    if (level === 1) {
      const ctx = r.pick([['בחוג', 'בנים', 'בנות'], ['בעוגה', 'כוסות קמח', 'כוסות סוכר'], ['בגינה', 'ורדים', 'חמניות'], ['בקופסה', 'עפרונות כחולים', 'עפרונות אדומים']])
      return { q: `${ctx[0]} היחס בין ${ctx[1]} ל${ctx[2]} הוא ${a}:${b}. יש ${a * k} ${ctx[1]}. כמה ${ctx[2]} יש?`, type: 'number', answer: b * k, explain: `${a * k} ÷ ${a} = ${k}, כלומר היחס הוכפל פי ${k}. לכן ${b} × ${k} = ${b * k}.` }
    }
    if (level === 2) {
      const T = (a + b) * k, askA = r.bool()
      const [n1, n2] = r.pick([['דנה', 'יואב'], ['מאיה', 'עומר'], ['נועם', 'שירה']])
      const who = askA ? n1 : n2
      return { q: `${n1} ו${n2} חילקו ביניהם ${T} מדבקות ביחס ${a}:${b} (${a} חלקים ל${n1} ו-${b} חלקים ל${n2}). כמה מדבקות יש עכשיו ל${who}?`, type: 'number', answer: askA ? a * k : b * k, explain: `${a} + ${b} = ${a + b} חלקים. חלק אחד: ${T} ÷ ${a + b} = ${k}. ל${who}: ${askA ? a : b} × ${k} = ${askA ? a * k : b * k}.` }
    }
    const s = r.pick([1000, 2000, 5000, 10000, 20000, 25000, 50000, 100000, 200000]), d = r.int(2, 15)
    const meters = (d * s) / 100
    const useKm = meters >= 1000
    const real = useKm ? dval(meters, 1000) : meters
    if (r.bool()) {
      return { q: `במפה בקנה מידה 1:${num(s)} המרחק בין שתי נקודות הוא ${d} ס״מ. מה המרחק במציאות ב${useKm ? 'קילומטרים' : 'מטרים'}?`, type: 'number', unit: useKm ? 'ק״מ' : 'מ׳', answer: real, explain: `${d} × ${num(s)} = ${num(d * s)} ס״מ = ${num(meters)} מ׳${useKm ? ` = ${real} ק״מ` : ''}.` }
    }
    return { q: `המרחק במציאות בין שני מקומות הוא ${num(real)} ${useKm ? 'ק״מ' : 'מ׳'}. מה יהיה המרחק ביניהם במפה בקנה מידה 1:${num(s)}?`, type: 'number', unit: 'ס״מ', answer: d, explain: `${num(real)} ${useKm ? 'ק״מ' : 'מ׳'} = ${num(d * s)} ס״מ. במפה: ${num(d * s)} ÷ ${num(s)} = ${d} ס״מ.` }
  },
}

const mean = {
  slug: 'average',
  grade: 6,
  strand: 'data',
  title: 'ממוצע',
  emoji: '📊',
  desc: 'ממוצע חשבוני לכיתה ו׳: חישוב ממוצע של כמה מספרים, ממוצע ציונים ומציאת נתון חסר לפי הממוצע — כמו איזה ציון צריך כדי להגיע לממוצע רצוי. עם פתרונות.',
  intro: 'הממוצע (הממוצע החשבוני) של כמה מספרים הוא הסכום שלהם מחולק במספר הנתונים. אפשר לחשוב עליו כחלוקה שווה: אם ארבעה ילדים אספו 6, 9, 10 ו-15 צדפים ומחלקים את כולם שווה בשווה — כל אחד מקבל 40 ÷ 4 = 10. מכאן גם הדרך למצוא נתון חסר: ממוצע × מספר הנתונים = הסכום כולו.',
  tips: [
    'ממוצע = סכום הנתונים ÷ מספר הנתונים.',
    'סכום = ממוצע × מספר הנתונים.',
    'הממוצע תמיד בין הנתון הקטן לנתון הגדול.',
  ],
  example: { q: 'ממוצע הציונים של רוני ב-4 מבחנים הוא 85. איזה ציון היא צריכה במבחן החמישי כדי שהממוצע יעלה ל-87?', steps: ['סכום 4 הציונים: 4 × 85 = 340.', 'הסכום הדרוש ל-5 מבחנים: 5 × 87 = 435.', '435 − 340 = 95.'], a: '95' },
  faq: [
    { q: 'האם הממוצע חייב להיות אחד מהנתונים?', a: 'לא. הממוצע של 2, 4 ו-9 הוא 5, ואף אחד מהנתונים אינו 5. הממוצע יכול להיות גם מספר עשרוני.' },
    { q: 'מה קורה לממוצע אם מוסיפים נתון גדול מאוד?', a: 'הממוצע עולה, לפעמים בהרבה. לכן נתון קיצוני אחד יכול "למשוך" את הממוצע.' },
  ],
  levels: ['ממוצע של 4 מספרים', 'ממוצע של 5–6 ציונים', 'מציאת נתון חסר'],
  gen(level, r) {
    if (level === 1) {
      for (;;) {
        const M = r.int(5, 30), xs = [r.int(1, 40), r.int(1, 40), r.int(1, 40)], last = 4 * M - xs.reduce((s, x) => s + x, 0)
        if (last < 1 || last > 50) continue
        const all = r.shuffle([...xs, last])
        return { q: `מהו הממוצע של המספרים: ${all.join(', ')}?`, type: 'number', answer: M, explain: `סכום: ${all.join(' + ')} = ${4 * M}. ממוצע: ${4 * M} ÷ 4 = ${M}.` }
      }
    }
    if (level === 2) {
      for (;;) {
        const n = r.int(5, 6), M = r.int(60, 92), xs = Array.from({ length: n - 1 }, () => r.int(Math.max(40, M - 25), Math.min(100, M + 20)))
        const last = n * M - xs.reduce((s, x) => s + x, 0)
        if (last < 40 || last > 100) continue
        const all = r.shuffle([...xs, last])
        return { q: `אלה הציונים של שירה במבחנים: ${all.join(', ')}. מהו ממוצע הציונים שלה?`, type: 'number', answer: M, explain: `סכום הציונים: ${n * M}. יש ${n} ציונים: ${n * M} ÷ ${n} = ${M}.` }
      }
    }
    if (r.bool()) {
      for (;;) {
        const n = r.int(3, 5), M = r.int(70, 92), T = r.int(M + 1, M + 5), need = (n + 1) * T - n * M
        if (need > 100) continue
        return { q: `ממוצע הציונים של איתי ב-${n} מבחנים הוא ${M}. איזה ציון הוא צריך לקבל במבחן הבא כדי שהממוצע של כל ${n + 1} המבחנים יהיה ${T}?`, type: 'number', answer: need, explain: `סכום עכשיו: ${n} × ${M} = ${n * M}. סכום דרוש: ${n + 1} × ${T} = ${(n + 1) * T}. ${(n + 1) * T} − ${n * M} = ${need}.` }
      }
    }
    for (;;) {
      const n = r.int(4, 6), M = r.int(8, 40), xs = Array.from({ length: n - 1 }, () => r.int(1, 60)), miss = n * M - xs.reduce((s, x) => s + x, 0)
      if (miss < 1 || miss > 80) continue
      return { q: `הממוצע של ${n} מספרים הוא ${M}. ${n - 1} מהם הם ${xs.join(', ')}. מהו המספר החסר?`, type: 'number', answer: miss, explain: `סכום כל המספרים: ${n} × ${M} = ${n * M}. סכום הידועים: ${xs.reduce((s, x) => s + x, 0)}. החסר: ${n * M} − ${xs.reduce((s, x) => s + x, 0)} = ${miss}.` }
    }
  },
}

// Circle with a radius or diameter drawn and labelled.
function circleSvg(kind, label, half = false) {
  const c = [130, 95], R = 72
  let body = half
    ? `<path d="M${c[0] - R},${c[1]} A${R},${R} 0 0,1 ${c[0] + R},${c[1]} Z" fill="#ffd23f" fill-opacity=".45" stroke="currentColor" stroke-width="2.5"/>`
    : `<circle cx="${c[0]}" cy="${c[1]}" r="${R}" fill="#ffd23f" fill-opacity=".45" stroke="currentColor" stroke-width="2.5"/>`
  body += `<circle cx="${c[0]}" cy="${c[1]}" r="3" fill="currentColor"/>`
  if (kind === 'd') body += `<line x1="${c[0] - R}" y1="${c[1]}" x2="${c[0] + R}" y2="${c[1]}" stroke="#2563eb" stroke-width="2"/>` + txt(c[0] - R / 2, c[1] + 14, label, '#2563eb')
  else body += seg(c, [c[0] + R, c[1]], 2) + txt(c[0] + R / 2, c[1] + 14, label, '#2563eb')
  return svg(260, half ? 120 : 190, body, half ? 'חצי עיגול' : 'מעגל')
}

const circumference = {
  slug: 'circle-circumference',
  grade: 6,
  strand: 'geometry',
  title: 'היקף מעגל',
  emoji: '⭕',
  desc: 'היקף מעגל לכיתה ו׳: היקף = π × קוטר = 2 × π × רדיוס עם π ≈ 3.14, ומציאת הקוטר או הרדיוס לפי ההיקף — תרגול עם שרטוטים, הסבר על π ופתרונות.',
  intro: 'בכל מעגל, היקף המעגל גדול פי 3.14 בערך מהקוטר שלו. היחס הקבוע הזה נקרא פאי (π), והוא מספר אינסופי (3.14159...), ולכן בבית הספר משתמשים בקירוב π ≈ 3.14. הקוטר הוא קטע שעובר דרך מרכז המעגל מצד לצד, והרדיוס הוא חצי ממנו — מהמרכז אל המעגל. לכן: היקף = π × קוטר = 2 × π × רדיוס.',
  tips: [
    'קוטר = 2 × רדיוס.',
    'היקף = 3.14 × קוטר.',
    'קוטר לפי היקף: היקף ÷ 3.14.',
  ],
  example: { q: 'מהו היקף מעגל שהרדיוס שלו 5 ס״מ? (π ≈ 3.14)', steps: ['קוטר: 2 × 5 = 10 ס״מ.', 'היקף: 3.14 × 10 = 31.4 ס״מ.'], a: '31.4 ס״מ' },
  faq: [
    { q: 'מה ההבדל בין מעגל לעיגול?', a: 'מעגל הוא הקו הסגור (השפה), ועיגול הוא כל השטח שבתוכו. לכן מדברים על היקף המעגל ועל שטח העיגול.' },
    { q: 'למה 3.14 ולא π המדויק?', a: 'π הוא מספר שהספרות שלו אחרי הנקודה לא נגמרות ולא חוזרות. 3.14 הוא קירוב טוב מספיק לרוב החישובים.' },
  ],
  levels: ['לפי הקוטר', 'לפי הרדיוס', 'מציאת קוטר או רדיוס לפי ההיקף'],
  gen(level, r) {
    if (level === 1) {
      const d = r.int(2, 30)
      return { q: `מהו היקף מעגל שהקוטר שלו ${d} ס״מ? ${PI_NOTE}`, svg: circleSvg('d', String(d)), type: 'number', unit: 'ס״מ', answer: dval(314 * d, 100), tol: 0.01, explain: `3.14 × ${d} = ${dstr(314 * d, 100)}.` }
    }
    if (level === 2) {
      const rad = r.int(1, 25)
      return { q: `מהו היקף מעגל שהרדיוס שלו ${rad} ס״מ? ${PI_NOTE}`, svg: circleSvg('r', String(rad)), type: 'number', unit: 'ס״מ', answer: dval(628 * rad, 100), tol: 0.01, explain: `קוטר: 2 × ${rad} = ${2 * rad}. היקף: 3.14 × ${2 * rad} = ${dstr(628 * rad, 100)}.` }
    }
    const d = 2 * r.int(1, 25), C = dstr(314 * d, 100)
    if (r.bool()) return { q: `היקף מעגל הוא ${C} ס״מ. מה אורך הקוטר שלו? (π ≈ 3.14)`, svg: circleSvg('d', '?'), type: 'number', unit: 'ס״מ', answer: d, tol: 0.01, explain: `קוטר = היקף ÷ 3.14: ${C} ÷ 3.14 = ${d}.` }
    return { q: `היקף מעגל הוא ${C} ס״מ. מה אורך הרדיוס שלו? (π ≈ 3.14)`, svg: circleSvg('r', '?'), type: 'number', unit: 'ס״מ', answer: d / 2, tol: 0.01, explain: `קוטר: ${C} ÷ 3.14 = ${d}. רדיוס = חצי קוטר: ${d / 2}.` }
  },
}

const circleArea = {
  slug: 'circle-area',
  grade: 6,
  strand: 'geometry',
  title: 'שטח עיגול',
  emoji: '🟡',
  desc: 'שטח עיגול לכיתה ו׳: שטח = π × רדיוס × רדיוס עם π ≈ 3.14, חישוב לפי רדיוס או קוטר, שטח חצי עיגול ומציאת הרדיוס לפי השטח — עם שרטוטים ופתרונות.',
  intro: 'שטח העיגול שווה ל-π כפול הרדיוס בריבוע: שטח = π × r × r, ובבית הספר משתמשים בקירוב π ≈ 3.14. אפשר להבין את הנוסחה כך: אם חותכים עיגול לפרוסות דקות ומסדרים אותן לסירוגין, מתקבלת צורה שדומה למלבן שאורכו חצי היקף (π × r) ורוחבו הרדיוס. כשנתון הקוטר — מחלקים אותו קודם ב-2.',
  tips: [
    'שטח = 3.14 × רדיוס × רדיוס.',
    'נתון קוטר? רדיוס = קוטר ÷ 2.',
    'חצי עיגול: מחשבים שטח עיגול ומחלקים ב-2.',
    'השטח נמדד ביחידות ריבועיות (סמ״ר).',
  ],
  example: { q: 'מהו שטח עיגול שהקוטר שלו 10 ס״מ? (π ≈ 3.14)', steps: ['רדיוס: 10 ÷ 2 = 5.', '5 × 5 = 25.', '3.14 × 25 = 78.5.'], a: '78.5 סמ״ר' },
  faq: [
    { q: 'למה לא כופלים בקוטר?', a: 'כי בנוסחה מופיע הרדיוס בריבוע. אם כופלים בטעות קוטר × קוטר, מקבלים פי 4 מהשטח.' },
    { q: 'אם מכפילים את הרדיוס, פי כמה גדל השטח?', a: 'פי 4, כי הרדיוס מופיע פעמיים בנוסחה: 2 × 2 = 4.' },
  ],
  levels: ['לפי הרדיוס', 'לפי הקוטר', 'חצי עיגול ומציאת הרדיוס'],
  gen(level, r) {
    if (level === 1) {
      const rad = r.int(1, 20)
      return { q: `מהו שטח עיגול שהרדיוס שלו ${rad} ס״מ? ${PI_NOTE}`, svg: circleSvg('r', String(rad)), type: 'number', unit: 'סמ״ר', answer: dval(314 * rad * rad, 100), tol: 0.01, explain: `3.14 × ${rad} × ${rad} = 3.14 × ${rad * rad} = ${dstr(314 * rad * rad, 100)}.` }
    }
    if (level === 2) {
      const d = 2 * r.int(1, 20), rad = d / 2
      return { q: `מהו שטח עיגול שהקוטר שלו ${d} ס״מ? ${PI_NOTE}`, svg: circleSvg('d', String(d)), type: 'number', unit: 'סמ״ר', answer: dval(314 * rad * rad, 100), tol: 0.01, explain: `רדיוס: ${d} ÷ 2 = ${rad}. שטח: 3.14 × ${rad * rad} = ${dstr(314 * rad * rad, 100)}.` }
    }
    const rad = r.int(1, 12)
    if (r.bool()) return { q: `מהו שטח חצי עיגול שהרדיוס שלו ${rad} ס״מ? ${PI_NOTE}`, svg: circleSvg('r', String(rad), true), type: 'number', unit: 'סמ״ר', answer: dval(157 * rad * rad, 100), tol: 0.01, explain: `עיגול שלם: 3.14 × ${rad * rad} = ${dstr(314 * rad * rad, 100)}. חצי: ${dstr(157 * rad * rad, 100)}.` }
    const A = dstr(314 * rad * rad, 100)
    return { q: `שטח עיגול הוא ${A} סמ״ר. מה אורך הרדיוס? (π ≈ 3.14)`, svg: circleSvg('r', '?'), type: 'number', unit: 'ס״מ', answer: rad, tol: 0.01, explain: `${A} ÷ 3.14 = ${rad * rad}, ו-${rad} × ${rad} = ${rad * rad}, ולכן הרדיוס ${rad}.` }
  },
}

// Oblique drawing of an a (width) × b (depth) × c (height) box.
function boxSvg(a, b, c, la, lb, lc) {
  const k = Math.min(150 / (a + 0.5 * b), 130 / (c + 0.4 * b))
  const W = a * k, H = c * k, dx = b * k * 0.5, dy = b * k * 0.38
  const x0 = (260 - W - dx) / 2, y0 = 190 - (190 - H - dy) / 2
  const A = [x0, y0], B = [x0 + W, y0], C = [x0 + W, y0 - H], D = [x0, y0 - H]
  const sh = p => [p[0] + dx, p[1] - dy]
  const face = (pts, op) => `<polygon points="${pts.map(p => `${F(p[0])},${F(p[1])}`).join(' ')}" fill="#7dd3fc" fill-opacity="${op}" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>`
  const body = face([A, B, C, D], '.45') + face([D, C, sh(C), sh(D)], '.25') + face([B, sh(B), sh(C), C], '.6') +
    seg(A, sh(A), 1.5, ' stroke-dasharray="4 4"') + seg(sh(A), sh(B), 1.5, ' stroke-dasharray="4 4"') + seg(sh(A), sh(D), 1.5, ' stroke-dasharray="4 4"') +
    (la ? txt((A[0] + B[0]) / 2, A[1] + 13, la) : '') +
    (lc ? txt(A[0] - 14, (A[1] + D[1]) / 2, lc) : '') +
    (lb ? txt((B[0] + sh(B)[0]) / 2 + 14, (B[1] + sh(B)[1]) / 2 + 6, lb) : '')
  return svg(260, 190, body, 'תיבה')
}

const CUBES = [2, 3, 4, 5, 6, 7, 8, 9, 10]
const volume = {
  slug: 'volume-box-cube',
  grade: 6,
  strand: 'measurement',
  title: 'נפח תיבה וקובייה',
  emoji: '🧊',
  desc: 'נפח תיבה וקובייה לכיתה ו׳: אורך × רוחב × גובה בסמ״ק, נפח בליטרים (1 ליטר = 1,000 סמ״ק), מציאת מקצוע חסר לפי הנפח וקיבולת של אקווריום — עם שרטוטים.',
  intro: 'נפח הוא כמות המקום שגוף תופס, ומודדים אותו ביחידות מעוקבות: סמ״ק הוא נפח של קובייה שאורך המקצוע שלה 1 ס״מ. נפח תיבה = אורך × רוחב × גובה, כלומר שטח הבסיס × הגובה. נפח קובייה = מקצוע × מקצוע × מקצוע. ליטר אחד שווה ל-1,000 סמ״ק (קובייה של 10 × 10 × 10 ס״מ), ולכן כדי להמיר סמ״ק לליטרים מחלקים ב-1,000.',
  tips: [
    'נפח תיבה = אורך × רוחב × גובה.',
    'מקצוע חסר = נפח ÷ (מכפלת שני המקצועות הידועים).',
    '1 ליטר = 1,000 סמ״ק = 1 דמ״ק.',
  ],
  example: { q: 'אקווריום בצורת תיבה: 50 ס״מ × 30 ס״מ × 40 ס״מ. כמה ליטרים הוא מכיל?', steps: ['נפח: 50 × 30 × 40 = 60,000 סמ״ק.', '60,000 ÷ 1,000 = 60.'], a: '60 ליטרים' },
  faq: [
    { q: 'מה ההבדל בין נפח לשטח פנים?', a: 'שטח הפנים הוא כמה נייר צריך כדי לעטוף את התיבה (סמ״ר), והנפח הוא כמה מקום יש בתוכה (סמ״ק).' },
    { q: 'פי כמה גדל נפח קובייה כשמכפילים את המקצוע?', a: 'פי 8, כי כל אחד משלושת הממדים גדל פי 2: 2 × 2 × 2 = 8.' },
  ],
  levels: ['נפח קובייה ותיבה קטנה', 'נפח תיבה', 'מקצוע חסר, קובייה וליטרים'],
  gen(level, r) {
    if (level === 1) {
      if (r.bool()) { const e = r.pick(CUBES); return { q: `מהו הנפח של קובייה שאורך המקצוע שלה ${e} ס״מ?`, svg: boxSvg(e, e, e, String(e), '', ''), type: 'number', unit: 'סמ״ק', answer: e ** 3, explain: `${e} × ${e} × ${e} = ${e ** 3}.` } }
      const a = r.int(2, 9), b = r.int(2, 6), c = r.int(2, 6)
      return { q: `מהו נפח התיבה? אורך ${a} ס״מ, רוחב ${b} ס״מ, גובה ${c} ס״מ.`, svg: boxSvg(a, b, c, String(a), String(b), String(c)), type: 'number', unit: 'סמ״ק', answer: a * b * c, explain: `${a} × ${b} × ${c} = ${a * b * c}.` }
    }
    if (level === 2) {
      const a = r.int(4, 25), b = r.int(3, 15), c = r.int(3, 20)
      return { q: `מהו נפח התיבה? אורך ${a} ס״מ, רוחב ${b} ס״מ, גובה ${c} ס״מ.`, svg: boxSvg(a, b, c, String(a), String(b), String(c)), type: 'number', unit: 'סמ״ק', answer: a * b * c, explain: `שטח הבסיס: ${a} × ${b} = ${a * b}. כפול הגובה: ${a * b} × ${c} = ${num(a * b * c)}.` }
    }
    const f = r.int(0, 2)
    if (f === 0) {
      const a = r.int(3, 20), b = r.int(2, 12), c = r.int(2, 15), V = a * b * c
      return { q: `נפח תיבה הוא ${num(V)} סמ״ק. האורך ${a} ס״מ והרוחב ${b} ס״מ. מה הגובה?`, svg: boxSvg(a, b, c, String(a), String(b), '?'), type: 'number', unit: 'ס״מ', answer: c, explain: `שטח הבסיס: ${a} × ${b} = ${a * b}. גובה: ${num(V)} ÷ ${a * b} = ${c}.` }
    }
    if (f === 1) {
      const e = r.pick(CUBES)
      return { q: `נפח קובייה הוא ${num(e ** 3)} סמ״ק. מה אורך המקצוע שלה?`, svg: boxSvg(e, e, e, '?', '', ''), type: 'number', unit: 'ס״מ', answer: e, explain: `מחפשים מספר שכפול עצמו שלוש פעמים נותן ${num(e ** 3)}: ${e} × ${e} × ${e} = ${num(e ** 3)}.` }
    }
    const a = 10 * r.int(2, 8), b = 10 * r.int(2, 5), c = 10 * r.int(2, 6), V = a * b * c
    return { q: `אקווריום בצורת תיבה: אורך ${a} ס״מ, רוחב ${b} ס״מ וגובה ${c} ס״מ. כמה ליטרים של מים הוא מכיל כשהוא מלא?`, svg: boxSvg(a, b, c, String(a), String(b), String(c)), type: 'number', unit: 'ליטר', answer: V / 1000, explain: `נפח: ${a} × ${b} × ${c} = ${num(V)} סמ״ק. בליטר 1,000 סמ״ק: ${num(V)} ÷ 1,000 = ${V / 1000}.` }
  },
}

export default [fracMult, fracDiv, decimalMult, decimalDiv, conversions, percent, ratio, mean, circumference, circleArea, volume]
