// Grade 5 (כיתה ה׳) math topics — common multiples/divisors, fractions with unlike denominators,
// fraction × whole, decimals (meaning, add/subtract, ×÷10/100/1000), unit conversion, angle sums,
// areas of parallelogram/triangle/trapezoid, box surface area. Pure data + generators (see the /math contract).

// ---------- helpers ----------
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a }
const lcm = (a, b) => (a / gcd(a, b)) * b
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
const polygon = (pts, fill = '#7dd3fc') => `<polygon points="${pts.map(p => `${F(p[0])},${F(p[1])}`).join(' ')}" fill="${fill}" fill-opacity=".45" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>`
const norm = v => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l] }
// Map math coordinates (y up) into a W×H box, keeping proportions.
const fit = (pts, W, H, pad) => {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1])
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys)
  const s = Math.min((W - 2 * pad) / ((maxX - minX) || 1), (H - 2 * pad) / ((maxY - minY) || 1))
  const ox = (W - (maxX - minX) * s) / 2, oy = (H - (maxY - minY) * s) / 2
  return pts.map(p => [ox + (p[0] - minX) * s, H - oy - (p[1] - minY) * s])
}
const centroid = pts => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length]
// Label just outside the middle of side a–b (away from the shape's centre c).
const sideLabel = (a, b, c, s, color = 'currentColor') => {
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  let n = [-(b[1] - a[1]), b[0] - a[0]]
  n = norm(n)
  if ((m[0] - c[0]) * n[0] + (m[1] - c[1]) * n[1] < 0) n = [-n[0], -n[1]]
  return txt(m[0] + n[0] * 15, m[1] + n[1] * 13, s, color)
}
// Angle mark at vertex V between rays to P and Q (screen coords), with a label inside the angle.
const angleMark = (V, P, Q, label, deg, color = '#d33') => {
  const u = norm([P[0] - V[0], P[1] - V[1]]), w = norm([Q[0] - V[0], Q[1] - V[1]])
  let out = ''
  if (Math.abs(deg - 90) < 0.01) {
    const k = 13
    out += `<path d="M${F(V[0] + u[0] * k)},${F(V[1] + u[1] * k)} L${F(V[0] + (u[0] + w[0]) * k)},${F(V[1] + (u[1] + w[1]) * k)} L${F(V[0] + w[0] * k)},${F(V[1] + w[1] * k)}" fill="none" stroke="${color}" stroke-width="2"/>`
  } else {
    const R = 18, cross = u[0] * w[1] - u[1] * w[0]
    out += `<path d="M${F(V[0] + u[0] * R)},${F(V[1] + u[1] * R)} A${R},${R} 0 0,${cross > 0 ? 1 : 0} ${F(V[0] + w[0] * R)},${F(V[1] + w[1] * R)}" fill="none" stroke="${color}" stroke-width="2"/>`
  }
  if (label) {
    const sum = [u[0] + w[0], u[1] + w[1]]
    const b = Math.hypot(sum[0], sum[1]) < 1e-6 ? [u[1], -u[0]] : norm(sum)
    const half = (deg * Math.PI) / 360
    const d = Math.min(58, 12 + 16 / Math.max(Math.sin(half), 0.2))
    out += txt(V[0] + b[0] * d, V[1] + b[1] * d, label, color, 14)
  }
  return out
}
// Triangle from its three angles (A at the left of the base AB). Returns screen points [A, B, C].
const triByAngles = (A, B, W = 260, H = 190, pad = 34) => {
  const rad = x => (x * Math.PI) / 180, C = 180 - A - B
  const b = Math.sin(rad(B)) / Math.sin(rad(C))
  return fit([[0, 0], [1, 0], [b * Math.cos(rad(A)), b * Math.sin(rad(A))]], W, H, pad)
}

// ---------- topics ----------
const dstr = (n, scale) => String(Number((n / scale).toFixed(Math.round(Math.log10(scale)))))
const dval = (n, scale) => Number((n / scale).toFixed(Math.round(Math.log10(scale))))
const wholes = w => (w === 1 ? 'שלם אחד' : `${w} שלמים`)
const tenths = t => (t === 1 ? 'עשירית אחת' : `${t} עשיריות`)
const hundredths = h => (h === 1 ? 'מאית אחת' : `${h} מאיות`)
const and = s => (/^\d/.test(s) ? `ו-${s}` : `ו${s}`)
const PLACES_MOVED = { 10: 'מקום אחד', 100: 'שני מקומות', 1000: 'שלושה מקומות' }

const multiplesDivisors = {
  slug: 'common-multiples-divisors',
  grade: 5,
  strand: 'arithmetic',
  title: 'כפולה משותפת קטנה ומחלק משותף גדול',
  emoji: '🔗',
  desc: 'תרגול כפולה משותפת קטנה ביותר (כמ״ק) ומחלק משותף גדול ביותר (ממ״ג) לכיתה ה׳: שני מספרים, שלושה מספרים ובעיות מילוליות — הכנה למכנה משותף בשברים.',
  intro: 'כפולה של מספר היא תוצאה של כפל המספר במספר שלם: הכפולות של 6 הן 6, 12, 18, 24... כפולה משותפת קטנה ביותר של שני מספרים היא המספר הקטן ביותר שמופיע ברשימות הכפולות של שניהם. מחלק של מספר הוא מספר שמחלק אותו בלי שארית, והמחלק המשותף הגדול ביותר הוא המספר הגדול ביותר שמחלק את שניהם. הכפולה המשותפת משמשת למציאת מכנה משותף, והמחלק המשותף — לצמצום שברים.',
  tips: [
    'כמ״ק: עוברים על הכפולות של המספר הגדול ובודקים איזו מהן מתחלקת גם במספר הקטן.',
    'ממ״ג: מתחילים מהמספר הקטן ויורדים עד שמוצאים מספר שמחלק את שניהם.',
    'אם מספר אחד מתחלק בשני (כמו 12 ו-4), הכמ״ק הוא המספר הגדול והממ״ג הוא הקטן.',
  ],
  example: { q: 'מהי הכפולה המשותפת הקטנה ביותר של 6 ו-8?', steps: ['כפולות של 8: 8, 16, 24, 32...', '8 ו-16 לא מתחלקים ב-6, אבל 24 מתחלק (24 = 6 × 4).'], a: '24' },
  faq: [
    { q: 'מה הקשר לשברים?', a: 'כדי לחבר 1/6 + 3/8 צריך מכנה משותף, והמכנה המשותף הקטן ביותר הוא הכמ״ק של 6 ו-8, כלומר 24. כדי לצמצם 18/24 מחלקים במחלק המשותף הגדול ביותר, 6.' },
    { q: 'האם מכפלת המספרים היא תמיד כפולה משותפת?', a: 'כן, אבל לא תמיד הקטנה ביותר. 6 × 8 = 48 היא כפולה משותפת, אבל 24 קטנה יותר.' },
  ],
  levels: ['כמ״ק של שני מספרים', 'ממ״ג של שני מספרים', 'כמ״ק של שלושה מספרים ובעיות'],
  gen(level, r) {
    if (level === 1) {
      let a, b
      do { a = r.int(2, 12); b = r.int(2, 12) } while (a === b)
      const l = lcm(a, b)
      return { q: `מהי הכפולה המשותפת הקטנה ביותר של ${a} ו-${b}?`, type: 'number', answer: l, explain: `הכפולות של ${Math.max(a, b)}: ${Array.from({ length: l / Math.max(a, b) }, (_, i) => (i + 1) * Math.max(a, b)).join(', ')}. הראשונה שמתחלקת גם ב-${Math.min(a, b)} היא ${l}.` }
    }
    if (level === 2) {
      let g, m, n
      do { g = r.int(2, 12); m = r.int(1, 9); n = r.int(1, 9) } while (m === n || gcd(m, n) !== 1 || g * Math.max(m, n) > 120)
      const a = g * m, b = g * n
      return { q: `מהו המחלק המשותף הגדול ביותר של ${a} ו-${b}?`, type: 'number', answer: g, explain: `${a} = ${g} × ${m}, ${b} = ${g} × ${n}. ל-${m} ו-${n} אין מחלק משותף מלבד 1, ולכן הממ״ג הוא ${g}.` }
    }
    if (r.bool()) {
      let a, b, c
      do { a = r.int(2, 10); b = r.int(2, 10); c = r.int(2, 12) } while (new Set([a, b, c]).size < 3 || lcm(lcm(a, b), c) > 180)
      const l = lcm(lcm(a, b), c)
      return { q: `מהי הכפולה המשותפת הקטנה ביותר של ${a}, ${b} ו-${c}?`, type: 'number', answer: l, explain: `הכמ״ק של ${a} ו-${b} הוא ${lcm(a, b)}, והכמ״ק של ${lcm(a, b)} ו-${c} הוא ${l}.` }
    }
    let a, b
    do { a = r.int(4, 20); b = r.int(4, 20) } while (a === b || a % b === 0 || b % a === 0 || lcm(a, b) > 120)
    const l = lcm(a, b)
    return {
      q: `אוטובוס קו 1 יוצא מהתחנה כל ${a} דקות, ואוטובוס קו 2 יוצא כל ${b} דקות. עכשיו שניהם יצאו יחד. בעוד כמה דקות הם ייצאו שוב יחד בפעם הבאה?`,
      type: 'number', unit: 'דקות', answer: l,
      explain: `מחפשים את הכפולה המשותפת הקטנה ביותר של ${a} ו-${b}: ${l}.`,
    }
  },
}

const unlikeFractions = {
  slug: 'add-subtract-unlike-fractions',
  grade: 5,
  strand: 'fractions',
  title: 'חיבור וחיסור שברים עם מכנים שונים',
  emoji: '🍰',
  desc: 'חיבור וחיסור שברים עם מכנים שונים לכיתה ה׳: מציאת מכנה משותף, הרחבה, חישוב וצמצום — כולל מספרים מעורבים. תרגול בשלוש רמות עם פתרון מלא לכל תרגיל.',
  intro: 'אי אפשר לחבר ישירות שליש ורבע, כי החלקים בגדלים שונים. לכן מרחיבים את השברים למכנה משותף — מספר שמתחלק בשני המכנים (רצוי הכפולה המשותפת הקטנה ביותר) — ואז מחברים או מחסרים את המונים. לדוגמה: 1/3 + 1/4 = 4/12 + 3/12 = 7/12. במספרים מעורבים מחשבים שלמים ושברים בנפרד, ובחיסור לפעמים צריך לפרוט שלם.',
  tips: [
    'מוצאים מכנה משותף, מרחיבים את שני השברים, ורק אז מחברים או מחסרים מונים.',
    'אם מכנה אחד מתחלק בשני (כמו 4 ו-12) — המכנה הגדול הוא המכנה המשותף.',
    'בסוף מצמצמים ומעבירים שבר מדומה למספר מעורב.',
  ],
  example: { q: '5/6 − 3/8 = ?', steps: ['מכנה משותף: 24.', '5/6 = 20/24, 3/8 = 9/24.', '20/24 − 9/24 = 11/24.'], a: '11/24' },
  faq: [
    { q: 'האם אפשר להשתמש במכפלת המכנים כמכנה משותף?', a: 'כן, תמיד אפשר. אבל אם יש מכנה משותף קטן יותר, המספרים יהיו קטנים יותר ויהיה פחות לצמצם בסוף.' },
    { q: 'מה עושים כשבחיסור מספרים מעורבים השבר הראשון קטן יותר?', a: 'פורטים שלם אחד לשבר. למשל 3 1/4 − 1 1/2 = 3 1/4 − 1 2/4 = 2 5/4 − 1 2/4 = 1 3/4.' },
  ],
  levels: ['מכנה אחד מתחלק בשני', 'מכנים שונים כלשהם', 'מספרים מעורבים'],
  gen(level, r) {
    let d1, d2, a, b, w1 = 0, w2 = 0
    if (level === 1) { d1 = r.int(2, 6); d2 = d1 * r.int(2, 4); if (r.bool()) [d1, d2] = [d2, d1] }
    else { do { d1 = r.int(2, 10); d2 = r.int(2, 10) } while (d1 === d2 || d1 % d2 === 0 || d2 % d1 === 0) }
    do a = r.int(1, d1 - 1); while (gcd(a, d1) !== 1)
    do b = r.int(1, d2 - 1); while (gcd(b, d2) !== 1)
    if (level === 3) { w1 = r.int(1, 6); w2 = r.int(1, 6) }
    let N1 = w1 * d1 + a, N2 = w2 * d2 + b
    let add = r.bool()
    if (!add && N1 * d2 === N2 * d1) add = true
    if (!add && N1 * d2 < N2 * d1) { [d1, d2] = [d2, d1]; [a, b] = [b, a]; [w1, w2] = [w2, w1]; [N1, N2] = [N2, N1] }
    const m = lcm(d1, d2)
    const n = add ? N1 * (m / d1) + N2 * (m / d2) : N1 * (m / d1) - N2 * (m / d2)
    const op = add ? '+' : '−'
    const f1 = level === 3 ? `${w1} ${a}/${d1}` : `${a}/${d1}`, f2 = level === 3 ? `${w2} ${b}/${d2}` : `${b}/${d2}`
    const explain = level === 3
      ? `מרחיבים למכנה ${m}: ${w1} ${a * m / d1}/${m} ${op} ${w2} ${b * m / d2}/${m}. התוצאה: ${mixedStr(n, m)}.`
      : `מכנה משותף ${m}: ${a * m / d1}/${m} ${op} ${b * m / d2}/${m} = ${n}/${m}${fracStr(n, m) !== `${n}/${m}` ? ` = ${fracStr(n, m)}` : ''}.`
    return { q: level === 3 ? 'חשבו (אפשר לענות במספר מעורב או בשבר):' : 'חשבו וצמצמו אם אפשר:', expr: `${f1} ${op} ${f2} = ?`, ...fracAns(n, m), explain }
  },
}

const fractionTimesWhole = {
  slug: 'fraction-times-whole',
  grade: 5,
  strand: 'fractions',
  title: 'כפל שבר במספר שלם',
  emoji: '✖️',
  desc: 'כפל שבר במספר שלם לכיתה ה׳: כופלים את המונה במספר השלם, מצמצמים ומעבירים למספר מעורב — כולל כפל מספר מעורב בשלם, עם הסבר ודפי עבודה להדפסה.',
  intro: 'כפל שבר במספר שלם הוא חיבור חוזר: 3 × 2/5 = 2/5 + 2/5 + 2/5 = 6/5. לכן כופלים את המונה במספר השלם והמכנה נשאר כמו שהוא. אם אפשר — מצמצמים קודם, למשל 5/12 × 8: מצמצמים את 8 ו-12 ב-4 ומקבלים 10/3 = 3 1/3. כשכופלים מספר מעורב בשלם אפשר לכפול את השלמים ואת השבר בנפרד ולחבר.',
  tips: [
    'מונה × מספר שלם; המכנה לא משתנה.',
    'צמצום לפני כפל חוסך מספרים גדולים: מצמצמים את השלם עם המכנה.',
    'מספר מעורב × שלם: (שלמים × שלם) + (שבר × שלם).',
  ],
  example: { q: '2 3/4 × 6 = ?', steps: ['2 × 6 = 12.', '3/4 × 6 = 18/4 = 4 1/2.', '12 + 4 1/2 = 16 1/2.'], a: '16 1/2' },
  faq: [
    { q: 'למה התוצאה קטנה מהמספר השלם?', a: 'כשכופלים בשבר קטן מ-1 לוקחים רק חלק מהמספר. 3/4 × 8 = 6, כלומר שלושה רבעים מ-8.' },
    { q: 'האם 3/4 × 8 זה כמו 3/4 מ-8?', a: 'כן. "שבר מכמות" ו"שבר כפול מספר" הם אותו דבר, ואפשר לחשב בכל אחת מהדרכים.' },
  ],
  levels: ['שבר × מספר קטן', 'שבר × מספר גדול, עם צמצום', 'מספר מעורב × שלם'],
  gen(level, r) {
    const d = r.int(2, 12), n = level === 1 ? r.int(2, 5) : r.int(4, 20)
    let a
    do a = r.int(1, d - 1); while (gcd(a, d) !== 1)
    if (level === 3) {
      const w = r.int(1, 5), N = (w * d + a) * n
      return { q: 'חשבו (אפשר לענות במספר מעורב):', expr: `${w} ${a}/${d} × ${n} = ?`, ...fracAns(N, d), explain: `${w} × ${n} = ${w * n}, ${a}/${d} × ${n} = ${a * n}/${d}. ביחד: ${mixedStr(N, d)}.` }
    }
    const left = r.bool()
    return { q: 'חשבו וצמצמו אם אפשר:', expr: left ? `${a}/${d} × ${n} = ?` : `${n} × ${a}/${d} = ?`, ...fracAns(a * n, d), explain: `כופלים את המונה: ${a} × ${n} = ${a * n}, ולכן ${a * n}/${d}${fracStr(a * n, d) !== `${a * n}/${d}` ? ` = ${mixedStr(a * n, d)}` : ''}.` }
  },
}

const decimalsMeaning = {
  slug: 'decimals-place-value',
  grade: 5,
  strand: 'fractions',
  title: 'מספרים עשרוניים — כתיבה והשוואה',
  emoji: '🔟',
  desc: 'מספרים עשרוניים לכיתה ה׳: עשיריות, מאיות ואלפיות, מעבר משבר עשרוני למספר עשרוני והשוואת מספרים עשרוניים — כולל המלכודות הנפוצות, עם פתרונות.',
  intro: 'מספר עשרוני הוא דרך אחרת לכתוב שברים שהמכנה שלהם 10, 100, 1000... הספרה הראשונה אחרי הנקודה היא ספרת העשיריות, השנייה — המאיות, והשלישית — האלפיות. כך 0.7 = 7/10, 0.07 = 7/100 ו-3.25 = 3 ו-25/100. כדי להשוות מספרים עשרוניים משווים קודם את השלמים, ואם הם שווים — ספרה אחר ספרה אחרי הנקודה, משמאל לימין.',
  tips: [
    'אפס בסוף החלק העשרוני לא משנה את המספר: 0.5 = 0.50.',
    'מאיות נכתבות בשתי ספרות אחרי הנקודה: 7/100 = 0.07 (ולא 0.7).',
    'מספר עם יותר ספרות אחרי הנקודה אינו בהכרח גדול יותר: 0.5 > 0.45.',
  ],
  example: { q: 'איזה מספר גדול יותר: 2.08 או 2.8?', steps: ['השלמים שווים (2).', 'עשיריות: ב-2.08 יש 0, ב-2.8 יש 8.', '8 > 0.'], a: '2.8 > 2.08' },
  faq: [
    { q: 'איך קוראים את 3.25?', a: '"שלוש נקודה עשרים וחמש", או "שלושה שלמים ועשרים וחמש מאיות".' },
    { q: 'למה 0.5 גדול מ-0.45?', a: 'כי 0.5 = 0.50, כלומר 50 מאיות, ו-0.45 הם 45 מאיות בלבד. משווים עשיריות קודם: 5 עשיריות מול 4 עשיריות.' },
  ],
  levels: ['עשיריות', 'מאיות ואלפיות', 'השוואת מספרים עשרוניים'],
  gen(level, r) {
    if (level === 1) {
      const t = r.int(1, 9)
      if (r.bool()) return { q: `כתבו כמספר עשרוני: ${t}/10`, type: 'number', answer: dval(t, 10), explain: `${tenths(t)} = 0.${t}.` }
      const w = r.int(1, 20)
      return { q: `כתבו כמספר עשרוני: ${wholes(w)} ${and(tenths(t))}.`, type: 'number', answer: dval(w * 10 + t, 10), explain: `השלמים לפני הנקודה, העשיריות בספרה הראשונה אחריה: ${w}.${t}.` }
    }
    if (level === 2) {
      const f = r.int(0, 2)
      if (f === 0) { const h = r.int(1, 99); return { q: `כתבו כמספר עשרוני: ${h}/100`, type: 'number', answer: dval(h, 100), explain: `${hundredths(h)}: שתי ספרות אחרי הנקודה — ${dstr(h, 100)}.` } }
      if (f === 1) { const w = r.int(1, 15), h = r.int(1, 9); return { q: `כתבו כמספר עשרוני: ${wholes(w)} ${and(hundredths(h))}.`, type: 'number', answer: dval(w * 100 + h, 100), explain: `${hundredths(h)} = 0.0${h}, ולכן המספר הוא ${dstr(w * 100 + h, 100)}.` } }
      const k = r.int(1, 999)
      return { q: `כתבו כמספר עשרוני: ${k}/1000`, type: 'number', answer: dval(k, 1000), explain: `${k === 1 ? 'אלפית אחת' : `${k} אלפיות`}: שלוש ספרות אחרי הנקודה — ${dstr(k, 1000)}.` }
    }
    const w = r.int(0, 9)
    const part = () => { const len = r.int(1, 3); let v; do v = r.int(1, 10 ** len - 1); while (v % 10 === 0); return [String(v).padStart(len, '0'), len] }
    let [s1, l1] = part(), s2, l2
    if (r.bool(0.15)) { s2 = s1 + '0'; l2 = l1 + 1 } else { do [s2, l2] = part(); while (s2 === s1) }
    let w2 = w
    if (r.bool(0.2)) w2 = w === 0 ? 1 : w + r.pick([-1, 1])
    const X = w * 1000 + Number(s1) * 10 ** (3 - l1), Y = w2 * 1000 + Number(s2) * 10 ** (3 - l2)
    const ans = X > Y ? '>' : X < Y ? '<' : '='
    const x = `${w}.${s1}`, y = `${w2}.${s2}`
    return {
      q: 'איזה סימן מתאים: <, > או =?',
      expr: `${x} ☐ ${y}`,
      type: 'choice', choices: r.shuffle(['<', '>', '=']), answer: ans,
      explain: w !== w2 ? `משווים קודם את השלמים: ${w} ${ans} ${w2}.` : ans === '=' ? 'אפס בסוף החלק העשרוני לא משנה את המספר, ולכן המספרים שווים.' : `השלמים שווים. משלימים לאותו מספר ספרות: ${w}.${s1.padEnd(3, '0')} ${ans} ${w}.${s2.padEnd(3, '0')}.`,
    }
  },
}

const decimalsAddSub = {
  slug: 'decimals-add-subtract',
  grade: 5,
  strand: 'fractions',
  title: 'חיבור וחיסור מספרים עשרוניים',
  emoji: '🧾',
  desc: 'חיבור וחיסור מספרים עשרוניים לכיתה ה׳: עשיריות ומאיות, מספרים עם כמות ספרות שונה אחרי הנקודה וחיסור עשרוני משלם — מיישרים נקודה מתחת לנקודה ופותרים.',
  intro: 'בחיבור ובחיסור של מספרים עשרוניים כותבים את המספרים במאונך כך שהנקודה העשרונית נמצאת מתחת לנקודה, ולכן עשיריות מתחת לעשיריות ומאיות מתחת למאיות. אם למספר אחד יש פחות ספרות אחרי הנקודה, משלימים אפסים (2.5 = 2.50). אחר כך מחשבים כמו במספרים שלמים, ומורידים את הנקודה למקומה בתוצאה.',
  tips: [
    'נקודה מתחת לנקודה!',
    'משלימים אפסים כדי שלשני המספרים יהיה אותו מספר ספרות אחרי הנקודה.',
    'מספר שלם אפשר לכתוב עם נקודה: 20 = 20.00.',
  ],
  example: { q: '20 − 7.35 = ?', steps: ['כותבים 20 כ-20.00.', '20.00 − 7.35 במאונך, עם פריטה.', 'התוצאה 12.65.'], a: '12.65' },
  faq: [
    { q: 'למה חשוב ליישר את הנקודות?', a: 'כדי לחבר ספרות מאותו ערך מקום. אם מיישרים לימין כמו בשלמים, מחברים עשיריות עם מאיות ומקבלים תשובה שגויה.' },
    { q: 'איך בודקים את התשובה?', a: 'באומדן: 7.35 קרוב ל-7, ו-20 − 7 = 13, כך שהתשובה 12.65 הגיונית. בחיסור אפשר גם לבדוק בחיבור: 12.65 + 7.35 = 20.' },
  ],
  levels: ['עשיריות', 'מאיות וכמות ספרות שונה', 'חיסור משלם ושלושה מספרים'],
  gen(level, r) {
    if (level === 1) {
      const a = r.int(11, 999), b = r.int(11, 999), add = r.bool()
      const [x, y] = add || a >= b ? [a, b] : [b, a]
      const v = add ? x + y : x - y
      return { q: 'חשבו:', expr: `${dstr(x, 10)} ${add ? '+' : '−'} ${dstr(y, 10)} = ?`, type: 'number', answer: dval(v, 10), explain: `נקודה מתחת לנקודה: ${dstr(x, 10)} ${add ? '+' : '−'} ${dstr(y, 10)} = ${dstr(v, 10)}.` }
    }
    if (level === 2) {
      const a = r.int(101, 9999), b = r.bool() ? r.int(2, 99) * 10 : r.int(101, 2999), add = r.bool()
      const [x, y] = add || a >= b ? [a, b] : [b, a]
      const v = add ? x + y : x - y
      return { q: 'חשבו:', expr: `${dstr(x, 100)} ${add ? '+' : '−'} ${dstr(y, 100)} = ?`, type: 'number', answer: dval(v, 100), explain: `משלימים אפסים ומיישרים נקודות: ${(x / 100).toFixed(2)} ${add ? '+' : '−'} ${(y / 100).toFixed(2)} = ${dstr(v, 100)}.` }
    }
    if (r.bool()) {
      const W = r.int(2, 50)
      let b
      do b = r.int(1, W * 100 - 1); while (b % 100 === 0)
      return { q: 'חשבו:', expr: `${W} − ${dstr(b, 100)} = ?`, type: 'number', answer: dval(W * 100 - b, 100), explain: `${W} = ${W}.00, ולכן ${W}.00 − ${(b / 100).toFixed(2)} = ${dstr(W * 100 - b, 100)}.` }
    }
    const a = r.int(101, 4999), b = r.int(11, 2999), c = r.int(11, a + b - 1)
    const v = a + b - c
    return { q: 'חשבו:', expr: `${dstr(a, 100)} + ${dstr(b, 100)} − ${dstr(c, 100)} = ?`, type: 'number', answer: dval(v, 100), explain: `משמאל לימין: ${dstr(a, 100)} + ${dstr(b, 100)} = ${dstr(a + b, 100)}, ואז ${dstr(a + b, 100)} − ${dstr(c, 100)} = ${dstr(v, 100)}.` }
  },
}

const S6 = 1e6
const times10 = {
  slug: 'decimals-times-10-100',
  grade: 5,
  strand: 'fractions',
  title: 'כפל וחילוק מספרים עשרוניים ב-10, 100 ו-1000',
  emoji: '↔️',
  desc: 'כפל וחילוק מספרים עשרוניים ב-10, ב-100 וב-1000 לכיתה ה׳: הזזת הנקודה העשרונית ימינה ושמאלה, השלמת אפסים ומציאת המספר החסר בתרגיל — עם הסברים.',
  intro: 'כשכופלים מספר ב-10 כל ספרה עוברת למקום גדול פי 10, ולכן הנקודה העשרונית "זזה" מקום אחד ימינה: 3.45 × 10 = 34.5. ב-100 הנקודה זזה שני מקומות ימינה, וב-1000 — שלושה. בחילוק ב-10, 100 או 1000 הנקודה זזה שמאלה באותו מספר מקומות. כשחסרות ספרות משלימים אפסים: 4.2 × 100 = 420 ו-3 ÷ 100 = 0.03.',
  tips: [
    'סופרים את האפסים: 10 — מקום אחד, 100 — שניים, 1000 — שלושה.',
    'כפל ← הנקודה זזה ימינה (המספר גדל). חילוק ← הנקודה זזה שמאלה (המספר קטן).',
    'אם אין מספיק ספרות — מוסיפים אפסים.',
  ],
  example: { q: '0.6 ÷ 100 = ?', steps: ['חילוק ב-100: הנקודה זזה שני מקומות שמאלה.', 'משלימים אפסים: 0.6 ← 0.06 ← 0.006.'], a: '0.006' },
  faq: [
    { q: 'למה אומרים שהנקודה זזה, אם בעצם הספרות זזות?', a: 'נכון, בפועל כל ספרה עוברת למקום אחר וערכה משתנה פי 10. "הזזת הנקודה" היא דרך נוחה לזכור את התוצאה.' },
    { q: 'כמה זה 2.5 × 1000?', a: 'הנקודה זזה שלושה מקומות ימינה ומשלימים אפסים: 2500.' },
  ],
  levels: ['כפל ב-10 וב-100', 'חילוק ב-10 וב-100', 'כפל וחילוק ב-1000 ומספר חסר'],
  gen(level, r) {
    const dec = r.int(1, 3)
    let X = r.int(1, 9999) * 10 ** (3 - dec) * 1000 // value × 10^6, up to 3 decimals
    if (level === 2 && r.bool(0.3)) X = r.int(1, 999) * S6
    const f = level === 3 ? r.pick([10, 100, 1000]) : r.pick([10, 100])
    const x = dstr(X, S6)
    if (level === 1) return { q: 'חשבו:', expr: `${x} × ${f} = ?`, type: 'number', answer: dval(X * f, S6), explain: `כפל ב-${f}: הנקודה זזה ${PLACES_MOVED[f]} ימינה — ${dstr(X * f, S6)}.` }
    if (level === 2) return { q: 'חשבו:', expr: `${x} ÷ ${f} = ?`, type: 'number', answer: dval(X / f, S6), explain: `חילוק ב-${f}: הנקודה זזה ${PLACES_MOVED[f]} שמאלה — ${dstr(X / f, S6)}.` }
    const mul = r.bool(), Y = mul ? X * f : X / f, y = dstr(Y, S6)
    const form = r.int(0, 1)
    if (form === 0) return { q: 'השלימו את המספר החסר:', expr: `${x} ${mul ? '×' : '÷'} ? = ${y}`, type: 'number', answer: f, explain: `הנקודה זזה ${PLACES_MOVED[f]} ${mul ? 'ימינה' : 'שמאלה'}, ולכן ${mul ? 'כפלו' : 'חילקו'} ב-${f}.` }
    return { q: 'השלימו את המספר החסר:', expr: `? ${mul ? '×' : '÷'} ${f} = ${y}`, type: 'number', answer: dval(X, S6), explain: `פעולה הפוכה: ${y} ${mul ? '÷' : '×'} ${f} = ${x}.` }
  },
}

// [big unit, small unit, factor, big unit plural name, small unit plural name]
const UNITS = [
  ['מ׳', 'ס״מ', 100, 'מטרים', 'סנטימטרים'],
  ['ס״מ', 'מ״מ', 10, 'סנטימטרים', 'מילימטרים'],
  ['ק״מ', 'מ׳', 1000, 'קילומטרים', 'מטרים'],
  ['ק״ג', 'גרם', 1000, 'קילוגרמים', 'גרמים'],
  ['ליטר', 'מ״ל', 1000, 'ליטרים', 'מיליליטרים'],
]

const units = {
  slug: 'measurement-units',
  grade: 5,
  strand: 'measurement',
  title: 'המרת יחידות מידה — אורך, משקל ונפח',
  emoji: '📏',
  desc: 'המרת יחידות מידה לכיתה ה׳: ק״מ, מטר, ס״מ ומ״מ; ק״ג וגרם; ליטר ומ״ל — כולל מספרים עשרוניים כמו 3.5 מטרים בסנטימטרים או 75 גרם בקילוגרמים.',
  intro: 'יחידות המידה בשיטה המטרית בנויות על 10, 100 ו-1000: מטר אחד = 100 ס״מ, ס״מ אחד = 10 מ״מ, קילומטר = 1000 מטר, קילוגרם = 1000 גרם וליטר = 1000 מ״ל. כדי לעבור מיחידה גדולה ליחידה קטנה כופלים (יוצאים יותר יחידות), וכדי לעבור מיחידה קטנה ליחידה גדולה מחלקים. כאן נעזרים בכפל ובחילוק עשרוניים ב-10, 100 ו-1000.',
  tips: [
    'גדולה ← קטנה: כופלים. קטנה ← גדולה: מחלקים.',
    '"קילו" = אלף: קילומטר = 1000 מטר, קילוגרם = 1000 גרם.',
    '"מילי" = אלפית: מיליליטר = 1/1000 ליטר, מילימטר = 1/1000 מטר.',
  ],
  example: { q: 'המירו 1,250 מטרים לקילומטרים.', steps: ['ממטרים לקילומטרים — מיחידה קטנה לגדולה, ולכן מחלקים.', '1250 ÷ 1000 = 1.25.'], a: '1.25 ק״מ' },
  faq: [
    { q: 'כמה סנטימטרים יש בקילומטר?', a: 'בקילומטר 1000 מטרים, ובכל מטר 100 ס״מ, ולכן 1000 × 100 = 100,000 ס״מ.' },
    { q: 'איך זוכרים אם לכפול או לחלק?', a: 'חושבים: יחידה קטנה "נכנסת" הרבה פעמים ביחידה גדולה, ולכן מספר היחידות הקטנות גדול יותר — כופלים.' },
  ],
  levels: ['המרות במספרים שלמים', 'מיחידה גדולה לקטנה (עשרוניים)', 'מיחידה קטנה לגדולה (עשרוניים)'],
  gen(level, r) {
    const [bigU, smallU, f, bigPl, smallPl] = r.pick(UNITS)
    if (level === 1) {
      const k = r.int(2, 30)
      if (r.bool()) return { q: `המירו ${k} ${bigPl} ל${smallPl}.`, type: 'number', unit: smallU, answer: k * f, explain: `מיחידה גדולה לקטנה כופלים: ${k} × ${f} = ${num(k * f)}.` }
      return { q: `המירו ${num(k * f)} ${smallPl} ל${bigPl}.`, type: 'number', unit: bigU, answer: k, explain: `מיחידה קטנה לגדולה מחלקים: ${num(k * f)} ÷ ${f} = ${k}.` }
    }
    // small-unit amount S, not a whole number of big units
    let S
    do S = f === 1000 && r.bool() ? 10 * r.int(101, 2000) : r.int(f + 1, 20 * f); while (S % f === 0)
    const B = dstr(S, f)
    if (level === 2) return { q: `המירו ${B} ${bigPl} ל${smallPl}.`, type: 'number', unit: smallU, answer: S, explain: `מיחידה גדולה לקטנה כופלים: ${B} × ${f} = ${num(S)}.` }
    const S3 = r.bool(0.35) ? r.int(1, f - 1) : S
    return { q: `המירו ${num(S3)} ${smallPl} ל${bigPl}.`, type: 'number', unit: bigU, answer: dval(S3, f), explain: `מיחידה קטנה לגדולה מחלקים: ${num(S3)} ÷ ${f} = ${dstr(S3, f)}.` }
  },
}

// Convex quadrilateral (screen points) with integer angle labels that add up to exactly 360°.
function quadWithAngles(r) {
  for (;;) {
    const L = r.int(150, 210)
    const P = [[0, 0], [L, 0], [L - r.int(-30, 50), r.int(90, 150)], [r.int(-30, 50), r.int(90, 150)]]
    const ang = P.map((p, i) => {
      const a = P[(i + 3) % 4], b = P[(i + 1) % 4]
      const u = [a[0] - p[0], a[1] - p[1]], v = [b[0] - p[0], b[1] - p[1]]
      return (Math.acos((u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))) * 180) / Math.PI
    })
    if (Math.abs(ang.reduce((s, x) => s + x, 0) - 360) > 0.01 || ang.some(x => x < 55 || x > 135)) continue
    const rounded = ang.slice(0, 3).map(Math.round)
    const last = 360 - rounded[0] - rounded[1] - rounded[2]
    if (Math.abs(last - ang[3]) > 2) continue
    return { pts: fit(P, 260, 190, 34), deg: [...rounded, last] }
  }
}

const angleSums = {
  slug: 'triangle-quadrilateral-angles',
  grade: 5,
  strand: 'geometry',
  title: 'סכום הזוויות במשולש ובמרובע',
  emoji: '📐',
  desc: 'סכום הזוויות במשולש הוא 180° ובמרובע 360°: תרגול לכיתה ה׳ במציאת זווית חסרה במשולש, במשולש שווה שוקיים ובמשולש ישר-זווית ובמרובע — עם שרטוטים.',
  intro: 'בכל משולש סכום שלוש הזוויות הוא 180°, ובכל מרובע סכום ארבע הזוויות הוא 360° (אפשר לחלק כל מרובע בעזרת אלכסון לשני משולשים). לכן אם יודעים את כל הזוויות חוץ מאחת, מחסרים את סכומן מ-180° או מ-360°. במשולש שווה שוקיים זוויות הבסיס שוות, ובמשולש ישר-זווית שתי הזוויות החדות משלימות זו את זו ל-90°.',
  tips: [
    'משולש: 180° פחות שתי הזוויות הידועות.',
    'שווה שוקיים: (180° − זווית הראש) ÷ 2 = כל זווית בסיס.',
    'מרובע: 360° פחות שלוש הזוויות הידועות.',
  ],
  example: { q: 'במשולש שווה שוקיים זווית הראש היא 40°. מה גודל כל זווית בסיס?', steps: ['שתי זוויות הבסיס יחד: 180° − 40° = 140°.', 'הן שוות: 140° ÷ 2 = 70°.'], a: '70°' },
  faq: [
    { q: 'למה סכום הזוויות במשולש הוא 180°?', a: 'אם גוזרים את שלוש הפינות של משולש מנייר ומניחים אותן זו ליד זו, הן יוצרות יחד זווית שטוחה — 180°.' },
    { q: 'כמה זוויות קהות יכולות להיות במשולש?', a: 'לכל היותר אחת. שתי זוויות קהות כבר יחד גדולות מ-180°.' },
  ],
  levels: ['זווית שלישית במשולש', 'משולש שווה שוקיים וישר-זווית', 'זווית רביעית במרובע'],
  gen(level, r) {
    const triSvg = (A, B, labels) => {
      // draw with the largest angle on top, so the triangle is wide rather than a thin spike
      const deg0 = [A, B, 180 - A - B], top = deg0.indexOf(Math.max(...deg0)), order = [(top + 1) % 3, (top + 2) % 3, top]
      const deg = order.map(k => deg0[k]), lab = order.map(k => labels[k])
      const P = triByAngles(deg[0], deg[1]), col = l => (l === '?' ? '#2563eb' : '#d33')
      return svg(260, 190, polygon(P) + angleMark(P[0], P[1], P[2], lab[0], deg[0], col(lab[0])) + angleMark(P[1], P[2], P[0], lab[1], deg[1], col(lab[1])) + angleMark(P[2], P[0], P[1], lab[2], deg[2], col(lab[2])), 'משולש')
    }
    if (level === 1) {
      let A, B, C
      do { A = r.int(20, 120); B = r.int(20, 120); C = 180 - A - B } while (C < 20)
      const miss = r.int(0, 2), deg = [A, B, C], lab = deg.map((x, i) => (i === miss ? '?' : `${x}°`))
      const known = deg.filter((_, i) => i !== miss)
      return { q: `שתי זוויות במשולש הן ${known[0]}° ו-${known[1]}°. מה גודל הזווית השלישית?`, svg: triSvg(A, B, lab), type: 'number', unit: 'מעלות', answer: deg[miss], explain: `180° − ${known[0]}° − ${known[1]}° = ${deg[miss]}°.` }
    }
    if (level === 2) {
      const f = r.int(0, 2)
      if (f === 0) {
        const apex = 2 * r.int(15, 70), base = (180 - apex) / 2
        return { q: `במשולש שווה שוקיים זווית הראש (בין שתי השוקיים) היא ${apex}°. מה גודל כל אחת מזוויות הבסיס?`, svg: triSvg(base, base, ['?', '?', `${apex}°`]), type: 'number', unit: 'מעלות', answer: base, explain: `זוויות הבסיס שוות: (180° − ${apex}°) ÷ 2 = ${base}°.` }
      }
      if (f === 1) {
        const base = r.int(25, 80), apex = 180 - 2 * base
        return { q: `במשולש שווה שוקיים כל זווית בסיס היא ${base}°. מה גודל זווית הראש?`, svg: triSvg(base, base, [`${base}°`, `${base}°`, '?']), type: 'number', unit: 'מעלות', answer: apex, explain: `180° − 2 × ${base}° = ${apex}°.` }
      }
      const a = r.int(15, 75)
      return { q: `במשולש ישר-זווית אחת הזוויות החדות היא ${a}°. מה גודל הזווית החדה השנייה?`, svg: triSvg(90, a, ['', `${a}°`, '?']), type: 'number', unit: 'מעלות', answer: 90 - a, explain: `שתי הזוויות החדות יחד הן 180° − 90° = 90°, ולכן 90° − ${a}° = ${90 - a}°.` }
    }
    const { pts, deg } = quadWithAngles(r)
    const miss = r.int(0, 3)
    let body = polygon(pts, '#ffd23f')
    pts.forEach((p, i) => { body += angleMark(p, pts[(i + 1) % 4], pts[(i + 3) % 4], i === miss ? '?' : `${deg[i]}°`, deg[i], i === miss ? '#2563eb' : '#d33') })
    const known = deg.filter((_, i) => i !== miss)
    return { q: `שלוש זוויות במרובע הן ${known[0]}°, ${known[1]}° ו-${known[2]}°. מה גודל הזווית הרביעית?`, svg: svg(260, 190, body, 'מרובע'), type: 'number', unit: 'מעלות', answer: deg[miss], explain: `סכום הזוויות במרובע 360°: 360° − ${known[0]}° − ${known[1]}° − ${known[2]}° = ${deg[miss]}°.` }
  },
}

const TRIPLES = [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13], [9, 12, 15], [12, 9, 15], [8, 15, 17], [15, 8, 17]]
// Dashed height from a (screen) to its foot f, with a right-angle mark and a label.
const heightLine = (top, foot, label, dir = 1, labelDir = -dir) =>
  seg(top, foot, 2, ' stroke-dasharray="5 4"') +
  `<path d="M${F(foot[0] + 10 * dir)},${F(foot[1])} L${F(foot[0] + 10 * dir)},${F(foot[1] - 10)} L${F(foot[0])},${F(foot[1] - 10)}" fill="none" stroke="currentColor" stroke-width="1.5"/>` +
  (label ? txt(foot[0] + 14 * labelDir, (top[1] + foot[1]) / 2, label, '#2563eb') : '')

function shapeWithHeight(mathPts, heightTop, heightFoot, sideLabels, hLabel, fill, extraDash) {
  const all = [...mathPts, heightTop, heightFoot, ...(extraDash || [])]
  const S = fit(all, 260, 190, 30)
  const P = S.slice(0, mathPts.length), top = S[mathPts.length], foot = S[mathPts.length + 1]
  const C0 = centroid(P)
  let body = polygon(P, fill)
  if (extraDash) body += seg(S[mathPts.length + 2], S[mathPts.length + 3], 1.5, ' stroke-dasharray="3 4"')
  const dir = foot[0] > C0[0] ? -1 : 1
  const xs = P.map(p => p[0]), minX = Math.min(...xs), maxX = Math.max(...xs)
  // label beside the dashed height: outside when the foot is outside the shape, else on the roomier side
  const labelDir = foot[0] <= minX + 1 ? -1 : foot[0] >= maxX - 1 ? 1 : maxX - foot[0] > foot[0] - minX ? 1 : -1
  body += heightLine(top, foot, hLabel, dir, labelDir)
  sideLabels.forEach(([i, s]) => { if (s) body += sideLabel(P[i], P[(i + 1) % P.length], C0, s) })
  return svg(260, 190, body, 'צורה עם גובה')
}

const parallelogramArea = {
  slug: 'parallelogram-area',
  grade: 5,
  strand: 'geometry',
  title: 'שטח מקבילית',
  emoji: '▱',
  desc: 'שטח מקבילית לכיתה ה׳: צלע × הגובה לאותה צלע, הבחנה בין הגובה לצלע המשופעת ומציאת גובה או צלע לפי השטח — תרגול עם שרטוטים ופתרונות מלאים.',
  intro: 'מקבילית היא מרובע שבו כל זוג צלעות נגדיות מקבילות. אם גוזרים ממנה משולש בצד אחד ומעבירים אותו לצד השני מקבלים מלבן — ולכן שטח המקבילית = צלע × הגובה לצלע הזו. הגובה הוא הקו המאונך לצלע (הקו המקווקו בשרטוט), ולא הצלע המשופעת. צלע משופעת ארוכה תמיד יותר מהגובה.',
  tips: [
    'שטח = צלע × הגובה שיורד אל אותה צלע.',
    'לא כופלים בצלע המשופעת! מחפשים את הקו המאונך.',
    'גובה לפי שטח: שטח ÷ צלע.',
  ],
  example: { q: 'במקבילית הצלע 10 ס״מ, הגובה אליה 6 ס״מ והצלע המשופעת 7 ס״מ. מהו השטח?', steps: ['משתמשים בצלע ובגובה המאונך לה: 10 × 6.', 'הצלע המשופעת (7) אינה דרושה לחישוב השטח.'], a: '60 סמ״ר' },
  faq: [
    { q: 'האם מלבן הוא מקבילית?', a: 'כן — מלבן הוא מקבילית שכל זוויותיה ישרות, ושם הגובה הוא פשוט הצלע השנייה.' },
    { q: 'למה צריך דווקא את הגובה?', a: 'כי כשמזיזים את המשולש ויוצרים מלבן, הגובה הופך לרוחב המלבן. הצלע המשופעת לא משתנה, אבל המקבילית יכולה "להשתטח" — והשטח קטן.' },
  ],
  levels: ['צלע וגובה', 'עם צלע משופעת (נתון מיותר)', 'מציאת גובה או צלע לפי השטח'],
  gen(level, r) {
    const [s, h, c] = r.pick(TRIPLES)
    const b = r.int(Math.max(s + 2, 5), Math.max(s + 6, 2 * c))
    const pts = [[0, 0], [b, 0], [b + s, h], [s, h]]
    const draw = (bl, hl, cl) => shapeWithHeight(pts, [s, h], [s, 0], [[0, bl], [1, cl]], hl, '#c4b5fd')
    if (level === 1) return { q: `מהו שטח המקבילית? הצלע ${b} ס״מ והגובה אליה ${h} ס״מ.`, svg: draw(String(b), String(h), ''), type: 'number', unit: 'סמ״ר', answer: b * h, explain: `צלע × גובה: ${b} × ${h} = ${b * h}.` }
    if (level === 2) return { q: `במקבילית שבשרטוט הצלע התחתונה ${b} ס״מ, הגובה אליה ${h} ס״מ והצלע המשופעת ${c} ס״מ. מהו שטח המקבילית?`, svg: draw(String(b), String(h), String(c)), type: 'number', unit: 'סמ״ר', answer: b * h, explain: `משתמשים בגובה המאונך ולא בצלע המשופעת: ${b} × ${h} = ${b * h}.` }
    if (r.bool()) return { q: `שטח המקבילית ${b * h} סמ״ר והצלע ${b} ס״מ. מה אורך הגובה לצלע זו?`, svg: draw(String(b), '?', ''), type: 'number', unit: 'ס״מ', answer: h, explain: `גובה = שטח ÷ צלע: ${b * h} ÷ ${b} = ${h}.` }
    return { q: `שטח המקבילית ${b * h} סמ״ר והגובה ${h} ס״מ. מה אורך הצלע שאליה יורד הגובה?`, svg: draw('?', String(h), ''), type: 'number', unit: 'ס״מ', answer: b, explain: `צלע = שטח ÷ גובה: ${b * h} ÷ ${h} = ${b}.` }
  },
}

const triangleArea = {
  slug: 'triangle-area',
  grade: 5,
  strand: 'geometry',
  title: 'שטח משולש',
  emoji: '🔺',
  desc: 'שטח משולש לכיתה ה׳: (צלע × גובה) ÷ 2 במשולש ישר-זווית, חד-זווית וקהה-זווית — כולל גובה מחוץ למשולש ומציאת גובה לפי שטח. תרגול עם שרטוטים.',
  intro: 'שני משולשים זהים מרכיבים יחד מקבילית, ולכן שטח משולש הוא חצי משטח המקבילית: שטח = (צלע × הגובה לצלע) ÷ 2. במשולש ישר-זווית הניצבים מאונכים זה לזה, ולכן אחד הוא הגובה לשני: שטח = ניצב × ניצב ÷ 2. במשולש קהה-זווית הגובה לצלע יכול ליפול מחוץ למשולש, על המשך הצלע — והנוסחה נשארת אותה נוסחה.',
  tips: [
    'שטח משולש = צלע × גובה ÷ 2.',
    'ישר-זווית: ניצב × ניצב ÷ 2.',
    'גובה לפי שטח: שטח × 2 ÷ צלע.',
  ],
  example: { q: 'במשולש הצלע 12 ס״מ והגובה אליה 7 ס״מ. מהו השטח?', steps: ['12 × 7 = 84.', '84 ÷ 2 = 42.'], a: '42 סמ״ר' },
  faq: [
    { q: 'למה מחלקים ב-2?', a: 'כי כל משולש הוא בדיוק חצי ממקבילית (או ממלבן) עם אותה צלע ואותו גובה.' },
    { q: 'מה עושים כשהגובה נופל מחוץ למשולש?', a: 'ממשיכים את הצלע בקו מקווקו, מורידים אליה גובה, וכופלים את הצלע המקורית (בלי ההמשך) בגובה וחוצים.' },
  ],
  levels: ['משולש ישר-זווית', 'צלע וגובה (גובה בתוך המשולש)', 'גובה מחוץ למשולש ומציאת גובה'],
  gen(level, r) {
    if (level === 1) {
      const a = 2 * r.int(2, 10), b = r.int(3, 18)
      const [x, y] = r.bool() ? [a, b] : [b, a]
      const P = fit([[0, 0], [x, 0], [0, y]], 260, 190, 34), C0 = centroid(P)
      const body = polygon(P, '#fdba74') + angleMark(P[0], P[1], P[2], '', 90, 'currentColor') + sideLabel(P[0], P[1], C0, String(x)) + sideLabel(P[2], P[0], C0, String(y))
      return { q: `במשולש ישר-זווית אורכי הניצבים ${x} ס״מ ו-${y} ס״מ. מהו שטח המשולש?`, svg: svg(260, 190, body, 'משולש ישר-זווית'), type: 'number', unit: 'סמ״ר', answer: (x * y) / 2, explain: `ניצב × ניצב ÷ 2: ${x} × ${y} ÷ 2 = ${(x * y) / 2}.` }
    }
    let b, h
    do { b = r.int(4, 20); h = r.int(3, 16) } while ((b * h) % 2 || h > 1.2 * b)
    if (level === 2) {
      const x = r.int(Math.ceil(b / 4), Math.floor((3 * b) / 4))
      return { q: `במשולש שבשרטוט הצלע ${b} ס״מ והגובה אליה ${h} ס״מ. מהו שטח המשולש?`, svg: shapeWithHeight([[0, 0], [b, 0], [x, h]], [x, h], [x, 0], [[0, String(b)]], String(h), '#fdba74'), type: 'number', unit: 'סמ״ר', answer: (b * h) / 2, explain: `${b} × ${h} ÷ 2 = ${(b * h) / 2}.` }
    }
    const e = r.int(2, Math.max(3, Math.round(b * 0.6)))
    if (r.bool()) {
      return { q: `במשולש קהה-זווית הצלע ${b} ס״מ, והגובה אליה (שנופל על המשך הצלע) ${h} ס״מ. מהו שטח המשולש?`, svg: shapeWithHeight([[0, 0], [b, 0], [-e, h]], [-e, h], [-e, 0], [[0, String(b)]], String(h), '#fdba74', [[-e, 0], [0, 0]]), type: 'number', unit: 'סמ״ר', answer: (b * h) / 2, explain: `גם כשהגובה מחוץ למשולש: ${b} × ${h} ÷ 2 = ${(b * h) / 2}.` }
    }
    const x = r.int(Math.ceil(b / 4), Math.floor((3 * b) / 4))
    return { q: `שטח המשולש ${(b * h) / 2} סמ״ר והצלע ${b} ס״מ. מה אורך הגובה לצלע זו?`, svg: shapeWithHeight([[0, 0], [b, 0], [x, h]], [x, h], [x, 0], [[0, String(b)]], '?', '#fdba74'), type: 'number', unit: 'ס״מ', answer: h, explain: `גובה = שטח × 2 ÷ צלע: ${(b * h) / 2} × 2 ÷ ${b} = ${h}.` }
  },
}

const trapezoidArea = {
  slug: 'trapezoid-area',
  grade: 5,
  strand: 'geometry',
  title: 'שטח טרפז',
  emoji: '⏢',
  desc: 'שטח טרפז לכיתה ה׳: (בסיס גדול + בסיס קטן) × גובה ÷ 2, טרפז ישר-זווית עם שוק משופעת ומציאת הגובה לפי השטח — תרגול מדורג עם שרטוטים ופתרונות.',
  intro: 'טרפז הוא מרובע שיש בו זוג אחד של צלעות מקבילות — הבסיסים. הצלעות האחרות נקראות שוקיים. אם מצמידים לטרפז טרפז זהה הפוך מקבלים מקבילית שהצלע שלה היא סכום הבסיסים, ולכן שטח הטרפז = (בסיס גדול + בסיס קטן) × גובה ÷ 2. הגובה הוא המרחק המאונך בין הבסיסים, לא השוק המשופעת.',
  tips: [
    'מחברים את שני הבסיסים, כופלים בגובה ומחלקים ב-2.',
    'בטרפז ישר-זווית השוק המאונכת היא הגובה.',
    'גובה לפי שטח: שטח × 2 ÷ (סכום הבסיסים).',
  ],
  example: { q: 'בטרפז הבסיסים 12 ס״מ ו-8 ס״מ והגובה 5 ס״מ. מהו השטח?', steps: ['סכום הבסיסים: 12 + 8 = 20.', '20 × 5 = 100.', '100 ÷ 2 = 50.'], a: '50 סמ״ר' },
  faq: [
    { q: 'האם חשוב איזה בסיס הוא הגדול?', a: 'לא. מחברים את שני הבסיסים, כך שהסדר לא משנה.' },
    { q: 'האם מקבילית היא טרפז?', a: 'לפי ההגדרה הנהוגה בבית הספר, בטרפז יש בדיוק זוג אחד של צלעות מקבילות, ולכן מקבילית אינה טרפז. בכל זאת, הנוסחה של הטרפז נותנת גם את שטח המקבילית (כשהבסיסים שווים).' },
  ],
  levels: ['בסיסים וגובה', 'טרפז ישר-זווית עם שוק משופעת', 'מציאת הגובה לפי השטח'],
  gen(level, r) {
    if (level === 2) {
      const [s, h, c] = r.pick(TRIPLES), b = r.int(3, 16), a = b + s
      const pts = [[0, 0], [a, 0], [b, h], [0, h]]
      const S = fit(pts, 260, 190, 32), C0 = centroid(S)
      const body = polygon(S, '#86efac') + angleMark(S[0], S[1], S[3], '', 90, 'currentColor') + sideLabel(S[0], S[1], C0, String(a)) + sideLabel(S[2], S[3], C0, String(b)) + sideLabel(S[3], S[0], C0, String(h)) + sideLabel(S[1], S[2], C0, String(c))
      return { q: `בטרפז ישר-זווית הבסיסים ${a} ס״מ ו-${b} ס״מ, השוק המאונכת לבסיסים ${h} ס״מ והשוק המשופעת ${c} ס״מ. מהו שטח הטרפז?`, svg: svg(260, 190, body, 'טרפז ישר-זווית'), type: 'number', unit: 'סמ״ר', answer: ((a + b) * h) / 2, explain: `השוק המאונכת היא הגובה: (${a} + ${b}) × ${h} ÷ 2 = ${((a + b) * h) / 2}.` }
    }
    let a, b, h
    do { b = r.int(3, 14); a = b + r.int(2, 12); h = r.int(3, 14) } while (((a + b) * h) % 2)
    const o = r.int(0, a - b)
    const pts = [[0, 0], [a, 0], [o + b, h], [o, h]]
    const hx = o === 0 ? o + b / 2 : o
    const draw = hl => shapeWithHeight(pts, [hx, h], [hx, 0], [[0, String(a)], [2, String(b)]], hl, '#86efac')
    if (level === 1) return { q: `בטרפז הבסיסים ${a} ס״מ ו-${b} ס״מ, והגובה ${h} ס״מ. מהו שטח הטרפז?`, svg: draw(String(h)), type: 'number', unit: 'סמ״ר', answer: ((a + b) * h) / 2, explain: `(${a} + ${b}) × ${h} ÷ 2 = ${a + b} × ${h} ÷ 2 = ${((a + b) * h) / 2}.` }
    const A = ((a + b) * h) / 2
    return { q: `שטח הטרפז ${A} סמ״ר, והבסיסים ${a} ס״מ ו-${b} ס״מ. מה גובה הטרפז?`, svg: draw('?'), type: 'number', unit: 'ס״מ', answer: h, explain: `גובה = שטח × 2 ÷ (סכום הבסיסים): ${A} × 2 ÷ ${a + b} = ${h}.` }
  },
}

// Oblique drawing of an a (width) × b (depth) × c (height) box.
function boxSvg(a, b, c, la, lb, lc) {
  const k = Math.min(150 / (a + 0.5 * b), 130 / (c + 0.4 * b))
  const W = a * k, H = c * k, dx = b * k * 0.5, dy = b * k * 0.38
  const x0 = (260 - W - dx) / 2, y0 = 190 - (190 - H - dy) / 2
  const A = [x0, y0], B = [x0 + W, y0], C = [x0 + W, y0 - H], D = [x0, y0 - H]
  const sh = p => [p[0] + dx, p[1] - dy]
  const body =
    `<polygon points="${[A, B, C, D].map(p => `${F(p[0])},${F(p[1])}`).join(' ')}" fill="#7dd3fc" fill-opacity=".45" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>` +
    `<polygon points="${[D, C, sh(C), sh(D)].map(p => `${F(p[0])},${F(p[1])}`).join(' ')}" fill="#7dd3fc" fill-opacity=".25" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>` +
    `<polygon points="${[B, sh(B), sh(C), C].map(p => `${F(p[0])},${F(p[1])}`).join(' ')}" fill="#7dd3fc" fill-opacity=".6" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>` +
    seg(A, sh(A), 1.5, ' stroke-dasharray="4 4"') + seg(sh(A), sh(B), 1.5, ' stroke-dasharray="4 4"') + seg(sh(A), sh(D), 1.5, ' stroke-dasharray="4 4"') +
    (la ? txt((A[0] + B[0]) / 2, A[1] + 13, la) : '') +
    (lc ? txt(A[0] - 14, (A[1] + D[1]) / 2, lc) : '') +
    (lb ? txt((B[0] + sh(B)[0]) / 2 + 14, (B[1] + sh(B)[1]) / 2 + 6, lb) : '')
  return svg(260, 190, body, 'תיבה')
}

const box = {
  slug: 'box-surface-area',
  grade: 5,
  strand: 'geometry',
  title: 'תיבה וקובייה — מקצועות ושטח פנים',
  emoji: '📦',
  desc: 'תיבה וקובייה לכיתה ה׳: פאות, מקצועות וקודקודים, סכום אורכי המקצועות ושטח הפנים של תיבה, של תיבה בלי מכסה ושל קובייה — עם שרטוטים ופתרונות.',
  intro: 'לתיבה יש 6 פאות מלבניות, 12 מקצועות ו-8 קודקודים. הפאות באות בזוגות זהים: שתי פאות של אורך × רוחב, שתיים של אורך × גובה ושתיים של רוחב × גובה. שטח הפנים של התיבה הוא סכום שטחי כל שש הפאות — כמה נייר צריך כדי לעטוף אותה. גם המקצועות באים בקבוצות של ארבעה: 4 באורך, 4 ברוחב ו-4 בגובה. קובייה היא תיבה שכל מקצועותיה שווים.',
  tips: [
    'סכום המקצועות = 4 × (אורך + רוחב + גובה).',
    'שטח פנים = 2 × (אורך × רוחב + אורך × גובה + רוחב × גובה).',
    'קובייה: 6 פאות ריבועיות זהות, ולכן שטח הפנים = 6 × מקצוע × מקצוע.',
  ],
  example: { q: 'מהו שטח הפנים של תיבה שמידותיה 5 × 3 × 2 ס״מ?', steps: ['5 × 3 = 15, 5 × 2 = 10, 3 × 2 = 6.', '15 + 10 + 6 = 31.', '2 × 31 = 62.'], a: '62 סמ״ר' },
  faq: [
    { q: 'מה ההבדל בין פאה, מקצוע וקודקוד?', a: 'פאה היא משטח (מלבן), מקצוע הוא קו שבו שתי פאות נפגשות, וקודקוד הוא נקודה שבה נפגשים שלושה מקצועות.' },
    { q: 'מה זו פריסה של תיבה?', a: 'הצורה השטוחה שמקבלים כשפותחים את התיבה לאורך חלק מהמקצועות. השטח של הפריסה שווה לשטח הפנים של התיבה.' },
  ],
  levels: ['סכום אורכי המקצועות', 'שטח פנים של תיבה', 'תיבה בלי מכסה וקובייה'],
  gen(level, r) {
    const a = r.int(2, 12), b = r.int(2, 10), c = r.int(2, 10)
    if (level === 1) return { q: `תיבה שמידותיה: אורך ${a} ס״מ, רוחב ${b} ס״מ וגובה ${c} ס״מ. מהו סכום האורכים של כל המקצועות?`, svg: boxSvg(a, b, c, String(a), String(b), String(c)), type: 'number', unit: 'ס״מ', answer: 4 * (a + b + c), explain: `יש 4 מקצועות מכל סוג: 4 × (${a} + ${b} + ${c}) = 4 × ${a + b + c} = ${4 * (a + b + c)}.` }
    const S = 2 * (a * b + a * c + b * c)
    if (level === 2) return { q: `מהו שטח הפנים של התיבה? אורך ${a} ס״מ, רוחב ${b} ס״מ, גובה ${c} ס״מ.`, svg: boxSvg(a, b, c, String(a), String(b), String(c)), type: 'number', unit: 'סמ״ר', answer: S, explain: `2 × (${a}×${b} + ${a}×${c} + ${b}×${c}) = 2 × (${a * b} + ${a * c} + ${b * c}) = ${S}.` }
    const f = r.int(0, 2)
    if (f === 0) {
      const open = S - a * b
      return { q: `קופסה בצורת תיבה בלי מכסה: אורך ${a} ס״מ, רוחב ${b} ס״מ וגובה ${c} ס״מ. כמה סמ״ר קרטון דרושים להכנתה?`, svg: boxSvg(a, b, c, String(a), String(b), String(c)), type: 'number', unit: 'סמ״ר', answer: open, explain: `שטח הפנים המלא ${S}, פחות המכסה (${a} × ${b} = ${a * b}): ${S} − ${a * b} = ${open}.` }
    }
    const e = r.int(2, 12)
    if (f === 1) return { q: `מהו שטח הפנים של קובייה שאורך המקצוע שלה ${e} ס״מ?`, svg: boxSvg(e, e, e, String(e), '', ''), type: 'number', unit: 'סמ״ר', answer: 6 * e * e, explain: `6 פאות של ${e} × ${e} = ${e * e}: 6 × ${e * e} = ${6 * e * e}.` }
    return { q: `שטח הפנים של קובייה הוא ${6 * e * e} סמ״ר. מה אורך המקצוע שלה?`, svg: boxSvg(e, e, e, '?', '', ''), type: 'number', unit: 'ס״מ', answer: e, explain: `שטח פאה אחת: ${6 * e * e} ÷ 6 = ${e * e}, ו-${e} × ${e} = ${e * e}, ולכן המקצוע ${e} ס״מ.` }
  },
}

export default [multiplesDivisors, unlikeFractions, fractionTimesWhole, decimalsMeaning, decimalsAddSub, times10, units, angleSums, parallelogramArea, triangleArea, trapezoidArea, box]
