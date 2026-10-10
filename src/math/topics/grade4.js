// Grade 4 (כיתה ד׳) math topics — numbers up to a million, vertical multiplication, long division,
// order of operations, divisibility and primes, simple fractions, angles, triangles, parallel and
// perpendicular lines, rectangle perimeter/area. Pure data + generators (see the /math contract).

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
const isPrime = n => { if (n < 2) return false; for (let k = 2; k * k <= n; k++) if (n % k === 0) return false; return true }

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
// Triangle from side lengths: AB = c (base), BC = a, CA = b.
const triBySides = (a, b, c, W = 260, H = 190, pad = 34) => {
  const x = (b * b + c * c - a * a) / (2 * c), y = Math.sqrt(Math.max(b * b - x * x, 0))
  return fit([[0, 0], [c, 0], [x, y]], W, H, pad)
}
const triAngles = (a, b, c) => {
  const ang = (o, p, q) => (Math.acos((p * p + q * q - o * o) / (2 * p * q)) * 180) / Math.PI
  return [ang(a, b, c), ang(b, a, c), ang(c, a, b)] // at A, B, C
}

// ---------- topics ----------
const PLACE = ['האחדות', 'העשרות', 'המאות', 'האלפים', 'עשרות האלפים', 'מאות האלפים']

const placeValue = {
  slug: 'place-value-million',
  grade: 4,
  strand: 'arithmetic',
  title: 'מספרים עד מיליון — ערך המקום ועיגול',
  emoji: '🔢',
  desc: 'תרגול מספרים עד מיליון לכיתה ד׳: ספרת האחדות, העשרות והאלפים, ערך של ספרה במספר ועיגול מספרים לעשרות, למאות ולאלפים — עם פתרון מוסבר לכל תרגיל.',
  intro: 'בשיטה העשרונית לכל ספרה יש ערך שתלוי במקום שלה במספר: אחדות, עשרות, מאות, אלפים, עשרות אלפים ומאות אלפים. כל מקום גדול פי 10 מהמקום שמימינו. לכן במספר 352,418 הספרה 5 שווה 50,000 (חמישים אלף), ואילו הספרה 8 שווה 8 בלבד. בכיתה ד׳ לומדים לקרוא, לכתוב, להשוות ולעגל מספרים עד מיליון.',
  tips: [
    'קוראים מספר גדול בקבוצות של שלוש ספרות מימין — הפסיק מפריד בין האלפים לשאר המספר.',
    'ערך הספרה = הספרה × ערך המקום שלה. למשל 7 במקום המאות שווה 700.',
    'בעיגול מסתכלים על הספרה שמימין למקום שאליו מעגלים: 5 ומעלה — מעגלים כלפי מעלה, 4 ומטה — כלפי מטה.',
  ],
  example: {
    q: 'עגלו את 352,418 לאלף הקרוב.',
    steps: ['ספרת האלפים היא 2, והספרה שמימינה (ספרת המאות) היא 4.', '4 קטנה מ-5, ולכן מעגלים כלפי מטה: ספרת האלפים נשארת 2.', 'כל הספרות שמימין לאלפים הופכות ל-0.'],
    a: '352,000',
  },
  faq: [
    { q: 'מה ההבדל בין ספרה למספר?', a: 'ספרה היא אחד מעשרת הסימנים 0–9, ומספר בנוי מספרה אחת או יותר. במספר 4,072 יש ארבע ספרות, והספרה 7 נמצאת במקום העשרות ולכן ערכה 70.' },
    { q: 'למה כותבים פסיק במספרים גדולים?', a: 'הפסיק מפריד בין קבוצות של שלוש ספרות ועוזר לקרוא את המספר נכון. את 250,000 קוראים "מאתיים וחמישים אלף".' },
    { q: 'איך מעגלים כשהספרה הקובעת היא 5?', a: 'לפי המוסכמה מעגלים כלפי מעלה. למשל, 4,500 מעוגל לאלף הקרוב הוא 5,000.' },
  ],
  levels: ['שם המקום של ספרה (עד 99,999)', 'ערך של ספרה במספר שש-ספרתי', 'עיגול מספרים עד מיליון'],
  gen(level, r) {
    if (level === 1) {
      const n = r.int(1000, 99999), s = String(n), p = r.int(0, s.length - 1)
      const d = Number(s[s.length - 1 - p])
      return { q: `מהי ספרת ${PLACE[p]} במספר ${num(n)}?`, type: 'number', answer: d, explain: `סופרים מקומות מימין: אחדות, עשרות, מאות, אלפים... במספר ${num(n)} ספרת ${PLACE[p]} היא ${d}.` }
    }
    if (level === 2) {
      for (;;) {
        const n = r.int(100000, 999999), s = String(n)
        const cand = [0, 1, 2, 3, 4, 5].filter(p => { const ch = s[5 - p]; return ch !== '0' && s.split(ch).length === 2 })
        if (!cand.length) continue
        const p = r.pick(cand), d = Number(s[5 - p]), v = d * 10 ** p
        return { q: `מה הערך של הספרה ${d} במספר ${num(n)}?`, type: 'number', answer: v, explain: `הספרה ${d} נמצאת במקום ${PLACE[p]}, ולכן ערכה ${d} × ${num(10 ** p)} = ${num(v)}.` }
      }
    }
    const units = [[10, 'לעשרת הקרובה', 'העשרות', 'האחדות'], [100, 'למאה הקרובה', 'המאות', 'העשרות'], [1000, 'לאלף הקרוב', 'האלפים', 'המאות'], [10000, 'לעשרת האלפים הקרובה', 'עשרות האלפים', 'האלפים']]
    const [u, name, place, right] = r.pick(units)
    let n = r.int(10000, 999999)
    if (n % u === 0) n += r.int(1, u - 1)
    const ans = Math.round(n / u) * u, rd = Math.floor(n / (u / 10)) % 10
    return { q: `עגלו את ${num(n)} ${name}.`, type: 'number', answer: ans, explain: `מסתכלים על ספרת ${right} (מימין למקום ${place}): היא ${rd}. ${rd >= 5 ? '5 ומעלה — מעגלים כלפי מעלה' : 'פחות מ-5 — מעגלים כלפי מטה'}, ולכן התשובה ${num(ans)}.` }
  },
}

const verticalMult = {
  slug: 'vertical-multiplication',
  grade: 4,
  strand: 'arithmetic',
  title: 'כפל במאונך',
  emoji: '✖️',
  desc: 'דפי תרגול כפל במאונך לכיתה ד׳: כפל מספר תלת-ספרתי בחד-ספרתי, כפל דו-ספרתי בדו-ספרתי ותלת-ספרתי בדו-ספרתי, עם מכפלות חלקיות והסבר שלב אחר שלב.',
  intro: 'בכפל במאונך כותבים את המספרים זה מעל זה, כשהאחדות מתחת לאחדות, וכופלים ספרה אחר ספרה מימין לשמאל. כשכופלים במספר דו-ספרתי מחשבים שתי מכפלות חלקיות — אחת בספרת האחדות ואחת בספרת העשרות (ולכן היא מתחילה ב-0 במקום האחדות) — ובסוף מחברים אותן. השיטה מבוססת על חוק הפילוג: 236 × 24 = 236 × 20 + 236 × 4.',
  tips: [
    'מיישרים את המספרים לימין: אחדות מתחת לאחדות, עשרות מתחת לעשרות.',
    'כשמכפלה של ספרות עוברת את 9, כותבים את ספרת האחדות ו"מעבירים" את העשרות לעמודה הבאה.',
    'לפני הפתרון עושים אומדן: 236 × 24 קרוב ל-240 × 20 = 4,800, כך קל לגלות טעות.',
  ],
  example: {
    q: '236 × 24 = ?',
    steps: ['מכפלה חלקית ראשונה: 236 × 4 = 944.', 'מכפלה חלקית שנייה: 236 × 20 = 4,720 (כותבים 0 במקום האחדות).', 'מחברים: 944 + 4,720 = 5,664.'],
    a: '5,664',
  },
  faq: [
    { q: 'למה כותבים 0 בשורה השנייה?', a: 'כי בשורה השנייה כופלים בספרת העשרות, כלומר בעשרות שלמות (למשל 20 ולא 2). ה-0 שומר על ערך המקום הנכון.' },
    { q: 'מה עושים עם ההעברה (הספרה הקטנה למעלה)?', a: 'מוסיפים אותה לתוצאה של הכפל בעמודה הבאה, אחרי שכופלים — לא לפני.' },
  ],
  levels: ['תלת-ספרתי × חד-ספרתי', 'דו-ספרתי × דו-ספרתי', 'תלת-ספרתי × דו-ספרתי'],
  gen(level, r) {
    const a = level === 1 ? r.int(100, 999) : level === 2 ? r.int(12, 99) : r.int(101, 999)
    const b = level === 1 ? r.int(2, 9) : r.int(12, 99)
    const p = a * b
    let explain
    if (b < 10) explain = `${a} × ${b} = ${num(p)}.`
    else {
      const u = b % 10, t = b - u
      explain = `${a} × ${u} = ${num(a * u)}, ${a} × ${t} = ${num(a * t)}, ובסך הכול ${num(a * u)} + ${num(a * t)} = ${num(p)}.`
    }
    return { q: 'פתרו בכפל במאונך:', expr: `${a} × ${b} = ?`, type: 'number', answer: p, explain }
  },
}

const longDivision = {
  slug: 'long-division',
  grade: 4,
  strand: 'arithmetic',
  title: 'חילוק ארוך',
  emoji: '➗',
  desc: 'תרגול חילוק ארוך לכיתה ד׳: חילוק מספרים תלת-ספרתיים וארבע-ספרתיים במחלק חד-ספרתי ובעשרות שלמות, וחילוק עם שארית — עם בדיקה בכפל לכל תרגיל.',
  intro: 'בחילוק ארוך מחלקים את המספר חלק אחר חלק, משמאל לימין: בכל שלב בודקים כמה פעמים המחלק "נכנס", כותבים את הספרה במנה, כופלים, מחסרים ומורידים את הספרה הבאה. כשבסוף נשאר מספר קטן מהמחלק — זו השארית. בודקים תמיד בכפל: מנה × מחלק + שארית = המחולק.',
  tips: [
    'סדר הפעולות בכל שלב: מחלקים, כופלים, מחסרים, מורידים את הספרה הבאה.',
    'השארית תמיד קטנה מהמחלק. אם יצאה גדולה יותר — אפשר להגדיל את הספרה במנה.',
    'חילוק בעשרת שלמה (למשל ÷ 30) אפשר לחשוב כך: מחלקים ב-10 ואז ב-3.',
  ],
  example: {
    q: '1,764 ÷ 7 = ?',
    steps: ['17 ÷ 7 = 2 (כי 2 × 7 = 14), נשאר 3. מורידים את 6 ← 36.', '36 ÷ 7 = 5 (35), נשאר 1. מורידים את 4 ← 14.', '14 ÷ 7 = 2, נשאר 0.', 'בדיקה: 252 × 7 = 1,764.'],
    a: '252',
  },
  faq: [
    { q: 'מה עושים כשהספרה הראשונה קטנה מהמחלק?', a: 'לוקחים שתי ספרות יחד. למשל ב-1,764 ÷ 7 מתחילים ב-17, כי 1 קטן מ-7.' },
    { q: 'איך בודקים תרגיל חילוק?', a: 'כופלים את המנה במחלק ומוסיפים את השארית. התוצאה צריכה להיות שווה למחולק.' },
  ],
  levels: ['תלת-ספרתי ÷ חד-ספרתי', 'ארבע-ספרתי ÷ חד-ספרתי או ÷ עשרות שלמות', 'חילוק עם שארית'],
  gen(level, r) {
    if (level === 1) {
      const d = r.int(2, 9), q = r.int(Math.ceil(100 / d), Math.floor(999 / d)), a = q * d
      return { q: 'פתרו בחילוק ארוך:', expr: `${a} ÷ ${d} = ?`, type: 'number', answer: q, explain: `${a} ÷ ${d} = ${q}. בדיקה: ${q} × ${d} = ${a}.` }
    }
    if (level === 2) {
      let d, q
      if (r.bool()) { d = r.int(2, 9); q = r.int(Math.ceil(1000 / d), Math.floor(9999 / d)) } else { d = r.int(2, 9) * 10; q = r.int(11, 99) }
      const a = q * d
      return { q: 'פתרו בחילוק ארוך:', expr: `${a} ÷ ${d} = ?`, type: 'number', answer: q, explain: `${a} ÷ ${d} = ${q}. בדיקה: ${q} × ${d} = ${a}.` }
    }
    const d = r.int(3, 9), q = r.int(21, 999), rem = r.int(1, d - 1), a = q * d + rem
    const askRem = r.bool()
    return {
      q: askRem ? 'חלקו בחילוק ארוך. מהי השארית?' : 'חלקו בחילוק ארוך. מהי המנה (המספר השלם, בלי השארית)?',
      expr: `${num(a)} ÷ ${d}`,
      type: 'number',
      answer: askRem ? rem : q,
      explain: `${num(a)} = ${q} × ${d} + ${rem}, ולכן המנה היא ${q} והשארית היא ${rem}.`,
    }
  },
}

const orderOps = {
  slug: 'order-of-operations',
  grade: 4,
  strand: 'arithmetic',
  title: 'סדר פעולות חשבון וסוגריים',
  emoji: '🧮',
  desc: 'תרגילי סדר פעולות חשבון לכיתה ד׳: כפל וחילוק לפני חיבור וחיסור, תרגילים עם סוגריים ותרגילים בכמה שלבים — עם פתרון מפורט שמראה מה מחשבים קודם.',
  intro: 'כשיש בתרגיל כמה פעולות, יש סדר קבוע: קודם מחשבים את מה שבתוך הסוגריים, אחר כך כפל וחילוק (משמאל לימין), ובסוף חיבור וחיסור (משמאל לימין). כך לכל תרגיל יש תשובה אחת בלבד. לדוגמה, 4 + 3 × 5 = 19 ולא 35, כי קודם כופלים.',
  tips: [
    'סוגריים ← כפל וחילוק ← חיבור וחיסור.',
    'כדאי לסמן בעיפרון את הפעולה הראשונה ולהעתיק את התרגיל המקוצר בשורה חדשה.',
    'פעולות מאותה דרגה (רק חיבור וחיסור, או רק כפל וחילוק) מחשבים משמאל לימין.',
  ],
  example: { q: '(12 + 8) × 3 − 15 ÷ 5 = ?', steps: ['סוגריים: 12 + 8 = 20.', 'כפל וחילוק: 20 × 3 = 60, 15 ÷ 5 = 3.', 'חיסור: 60 − 3 = 57.'], a: '57' },
  faq: [
    { q: 'האם חיבור תמיד בא לפני חיסור?', a: 'לא. לחיבור ולחיסור יש אותה דרגה, ולכן מחשבים אותם לפי הסדר משמאל לימין. כך גם כפל וחילוק.' },
    { q: 'למה צריך סוגריים?', a: 'הסוגריים משנים את הסדר: הם אומרים "את זה מחשבים קודם". 2 × (3 + 4) = 14, אבל 2 × 3 + 4 = 10.' },
  ],
  levels: ['שתי פעולות בלי סוגריים', 'תרגילים עם סוגריים', 'שלוש וארבע פעולות'],
  gen(level, r) {
    let e, v, steps
    if (level === 1) {
      const f = r.int(0, 3), b = r.int(2, 9), c = r.int(2, 9)
      if (f === 0) { const a = r.int(2, 50); e = `${a} + ${b} × ${c}`; v = a + b * c; steps = `קודם כפל: ${b} × ${c} = ${b * c}, ואז ${a} + ${b * c} = ${v}.` }
      else if (f === 1) { const a = r.int(2, 50); e = `${b} × ${c} + ${a}`; v = b * c + a; steps = `קודם כפל: ${b} × ${c} = ${b * c}, ואז ${b * c} + ${a} = ${v}.` }
      else if (f === 2) { const a = b * c + r.int(1, 40); e = `${a} − ${b} × ${c}`; v = a - b * c; steps = `קודם כפל: ${b} × ${c} = ${b * c}, ואז ${a} − ${b * c} = ${v}.` }
      else { const a = r.int(2, 50), k = b * c; e = `${a} + ${k} ÷ ${c}`; v = a + b; steps = `קודם חילוק: ${k} ÷ ${c} = ${b}, ואז ${a} + ${b} = ${v}.` }
    } else if (level === 2) {
      const f = r.int(0, 3)
      if (f === 0) { const a = r.int(2, 20), b = r.int(2, 20), c = r.int(2, 9); e = `(${a} + ${b}) × ${c}`; v = (a + b) * c; steps = `קודם סוגריים: ${a} + ${b} = ${a + b}, ואז ${a + b} × ${c} = ${v}.` }
      else if (f === 1) { const c = r.int(2, 20), b = c + r.int(1, 15), a = r.int(2, 9); e = `${a} × (${b} − ${c})`; v = a * (b - c); steps = `קודם סוגריים: ${b} − ${c} = ${b - c}, ואז ${a} × ${b - c} = ${v}.` }
      else if (f === 2) { const c = r.int(2, 9), s = c * r.int(2, 12), a = r.int(1, s - 1), b = s - a; e = `(${a} + ${b}) ÷ ${c}`; v = s / c; steps = `קודם סוגריים: ${a} + ${b} = ${s}, ואז ${s} ÷ ${c} = ${v}.` }
      else { const b = r.int(2, 30), c = r.int(2, 30), a = b + c + r.int(1, 50); e = `${a} − (${b} + ${c})`; v = a - (b + c); steps = `קודם סוגריים: ${b} + ${c} = ${b + c}, ואז ${a} − ${b + c} = ${v}.` }
    } else {
      const f = r.int(0, 2)
      if (f === 0) {
        const a = r.int(3, 12), b = r.int(3, 12), d = r.int(2, 9), k = r.int(1, Math.min(9, a * b - 1)), c = d * k
        e = `${a} × ${b} − ${c} ÷ ${d}`; v = a * b - k; steps = `כפל וחילוק: ${a} × ${b} = ${a * b}, ${c} ÷ ${d} = ${k}. אחר כך ${a * b} − ${k} = ${v}.`
      } else if (f === 1) {
        const a = r.int(2, 15), b = r.int(2, 15), c = r.int(2, 9), d = r.int(1, (a + b) * c - 1)
        e = `(${a} + ${b}) × ${c} − ${d}`; v = (a + b) * c - d; steps = `סוגריים: ${a + b}. כפל: ${a + b} × ${c} = ${(a + b) * c}. חיסור: ${(a + b) * c} − ${d} = ${v}.`
      } else {
        const c = r.int(2, 9), b = r.int(1, 20), a = b + c * r.int(1, 6), q = (a - b) / c, d = r.int(2, 9), g = r.int(2, 9)
        e = `(${a} − ${b}) ÷ ${c} + ${d} × ${g}`; v = q + d * g; steps = `סוגריים: ${a} − ${b} = ${a - b}. כפל וחילוק: ${a - b} ÷ ${c} = ${q}, ${d} × ${g} = ${d * g}. חיבור: ${q} + ${d * g} = ${v}.`
      }
    }
    return { q: 'חשבו לפי סדר פעולות החשבון:', expr: `${e} = ?`, type: 'number', answer: v, explain: steps }
  },
}

const DIV_RULE = {
  2: 'מספר מתחלק ב-2 אם ספרת האחדות שלו זוגית (0, 2, 4, 6 או 8).',
  5: 'מספר מתחלק ב-5 אם ספרת האחדות שלו היא 0 או 5.',
  10: 'מספר מתחלק ב-10 אם ספרת האחדות שלו היא 0.',
  3: 'מספר מתחלק ב-3 אם סכום הספרות שלו מתחלק ב-3.',
  9: 'מספר מתחלק ב-9 אם סכום הספרות שלו מתחלק ב-9.',
  6: 'מספר מתחלק ב-6 אם הוא זוגי וגם סכום הספרות שלו מתחלק ב-3.',
}
const PRIMES_100 = Array.from({ length: 99 }, (_, i) => i + 2).filter(isPrime)
const COMPOSITES_100 = Array.from({ length: 99 }, (_, i) => i + 2).filter(n => !isPrime(n))

const divisibility = {
  slug: 'divisibility-primes',
  grade: 4,
  strand: 'arithmetic',
  title: 'סימני התחלקות ומספרים ראשוניים',
  emoji: '🔍',
  desc: 'סימני התחלקות ב-2, 5 ו-10 וב-3, 6 ו-9, ומספרים ראשוניים ופריקים עד 100 — תרגול לכיתה ד׳ עם הסבר קצר לכל תשובה ודף עבודה להדפסה עם פתרונות.',
  intro: 'סימני התחלקות עוזרים לדעת אם מספר מתחלק במספר אחר בלי שארית, בלי לבצע את החילוק. בסימנים של 2, 5 ו-10 מסתכלים רק על ספרת האחדות; בסימנים של 3 ו-9 מחברים את כל הספרות. מספר ראשוני הוא מספר גדול מ-1 שמתחלק רק ב-1 ובעצמו (כמו 2, 3, 5, 7, 11). מספר שיש לו מחלקים נוספים נקרא פריק. המספר 1 אינו ראשוני ואינו פריק.',
  tips: [
    '2 — אחדות זוגית; 5 — אחדות 0 או 5; 10 — אחדות 0.',
    '3 ו-9 — מחברים את הספרות ובודקים אם הסכום מתחלק ב-3 או ב-9.',
    '6 — המספר זוגי וגם מתחלק ב-3.',
    'כדי לבדוק אם מספר עד 100 ראשוני, מספיק לנסות לחלק אותו ב-2, 3, 5 ו-7.',
  ],
  example: { q: 'האם 4,518 מתחלק ב-9?', steps: ['סכום הספרות: 4 + 5 + 1 + 8 = 18.', '18 מתחלק ב-9.'], a: 'כן, 4,518 מתחלק ב-9 (4,518 = 9 × 502).' },
  faq: [
    { q: 'האם 2 הוא מספר ראשוני?', a: 'כן. 2 מתחלק רק ב-1 ובעצמו, והוא המספר הראשוני הזוגי היחיד.' },
    { q: 'למה 1 אינו מספר ראשוני?', a: 'לפי ההגדרה, מספר ראשוני הוא מספר גדול מ-1 שיש לו בדיוק שני מחלקים. ל-1 יש מחלק אחד בלבד.' },
    { q: 'אם מספר מתחלק ב-9, האם הוא מתחלק גם ב-3?', a: 'כן, כי 9 = 3 × 3. ההפך לא תמיד נכון: 12 מתחלק ב-3 אבל לא ב-9.' },
  ],
  levels: ['התחלקות ב-2, 5 ו-10', 'התחלקות ב-3, 6 ו-9', 'ראשוני או פריק (עד 100)'],
  gen(level, r) {
    if (level === 3) {
      const prime = r.bool()
      const n = prime ? r.pick(PRIMES_100) : r.pick(COMPOSITES_100)
      let p = 2
      while (n % p) p++
      return {
        q: `האם המספר ${n} ראשוני או פריק?`,
        type: 'choice',
        choices: r.shuffle(['ראשוני', 'פריק']),
        answer: prime ? 'ראשוני' : 'פריק',
        explain: prime ? `${n} מתחלק רק ב-1 ובעצמו, ולכן הוא ראשוני.` : `${n} = ${p} × ${n / p}, כלומר יש לו מחלק נוסף מלבד 1 ו-${n}, ולכן הוא פריק.`,
      }
    }
    const k = level === 1 ? r.pick([2, 5, 10]) : r.pick([3, 6, 9])
    const yes = r.bool()
    const lo = level === 1 ? 100 : 100, hi = level === 1 ? 9999 : 99999
    let n
    if (yes) n = k * r.int(Math.ceil(lo / k), Math.floor(hi / k))
    else { do n = r.int(lo, hi); while (n % k === 0) }
    const s = String(n).split('').reduce((t, c) => t + Number(c), 0)
    const reason = level === 1
      ? `ספרת האחדות היא ${n % 10}.`
      : `סכום הספרות הוא ${s}${k === 6 ? `, והמספר ${n % 2 === 0 ? 'זוגי' : 'אי-זוגי'}` : ''}.`
    return {
      q: `האם ${num(n)} מתחלק ב-${k} ללא שארית?`,
      type: 'choice',
      choices: r.shuffle(['כן', 'לא']),
      answer: yes ? 'כן' : 'לא',
      explain: `${DIV_RULE[k]} ${reason} לכן התשובה: ${yes ? 'כן' : 'לא'}.`,
    }
  },
}

const fractionOfNumber = {
  slug: 'fraction-of-number',
  grade: 4,
  strand: 'fractions',
  title: 'שבר מכמות',
  emoji: '🍕',
  desc: 'איך מחשבים שבר מכמות? תרגול לכיתה ד׳: חצי, שליש ורבע מכמות, שברים כמו 3/4 מ-20, ומציאת השלם כשידוע החלק — עם פתרון מוסבר בשני שלבים.',
  intro: 'כדי למצוא שבר מכמות מחלקים את הכמות לפי המכנה (למספר החלקים השווים) ואז כופלים במונה (בכמה חלקים לוקחים). למשל 3/4 מ-20: רבע מ-20 הוא 20 ÷ 4 = 5, ושלושה רבעים הם 3 × 5 = 15. בכיוון ההפוך, אם יודעים כמה שווה החלק, מוצאים קודם חלק אחד ואז את השלם.',
  tips: [
    'שלב 1: כמות ÷ מכנה = גודל של חלק אחד.',
    'שלב 2: חלק אחד × מונה = התשובה.',
    'כדי למצוא את השלם: החלק ÷ מונה = חלק אחד, ואז חלק אחד × מכנה = השלם.',
  ],
  example: { q: '2/5 מהתלמידים בכיתה הם בנים, ויש 12 בנים. כמה תלמידים בכיתה?', steps: ['12 בנים הם 2 חמישיות, לכן חמישית אחת היא 12 ÷ 2 = 6.', 'הכיתה כולה היא 5 חמישיות: 6 × 5 = 30.'], a: '30 תלמידים' },
  faq: [
    { q: 'למה מחלקים במכנה?', a: 'המכנה אומר לכמה חלקים שווים מחלקים את השלם. לכן מחלקים בו כדי לדעת כמה יש בחלק אחד.' },
    { q: 'האם אפשר קודם לכפול ורק אחר כך לחלק?', a: 'כן, התוצאה זהה: 3 × 20 ÷ 4 = 15. אבל לרוב קל יותר לחלק קודם, כי המספרים נשארים קטנים.' },
  ],
  levels: ['שבר יחידה (1/2, 1/3, 1/4...) מכמות', 'שבר כלשהו מכמות', 'מציאת השלם לפי החלק'],
  gen(level, r) {
    const d = level === 1 ? r.int(2, 10) : r.int(3, 10), k = r.int(2, 12)
    if (level === 1) {
      const N = d * k
      return { q: `כמה הם 1/${d} מ-${N}?`, type: 'number', answer: k, explain: `מחלקים את ${N} ל-${d} חלקים שווים: ${N} ÷ ${d} = ${k}.` }
    }
    const n = r.int(2, d - 1)
    if (level === 2) {
      const N = d * k
      return { q: `כמה הם ${n}/${d} מ-${N}?`, type: 'number', answer: n * k, explain: `חלק אחד: ${N} ÷ ${d} = ${k}. ${n} חלקים: ${n} × ${k} = ${n * k}.` }
    }
    const Y = n * k, W = d * k
    const ctx = r.pick([
      [`${n}/${d} מהכמות הם ${Y}. מהי הכמות כולה?`, ''],
      [`${n}/${d} מהתלמידים בשכבה הלכו לטיול, והם ${Y} תלמידים. כמה תלמידים יש בשכבה?`, 'תלמידים'],
      [`נועה קראה ${n}/${d} מהספר, כלומר ${Y} עמודים. כמה עמודים יש בספר?`, 'עמודים'],
      [`בשקית יש סוכריות, ו-${n}/${d} מהן אדומות. יש ${Y} סוכריות אדומות. כמה סוכריות יש בשקית?`, 'סוכריות'],
    ])
    return { q: ctx[0], type: 'number', answer: W, ...(ctx[1] ? { unit: ctx[1] } : {}), explain: `${Y} הם ${n} חלקים, לכן חלק אחד הוא ${Y} ÷ ${n} = ${k}. השלם הוא ${d} חלקים: ${k} × ${d} = ${W}.` }
  },
}

const equivalentFractions = {
  slug: 'equivalent-fractions',
  grade: 4,
  strand: 'fractions',
  title: 'שברים שקולים — הרחבה וצמצום',
  emoji: '🟰',
  desc: 'תרגול שברים שקולים לכיתה ד׳: הרחבת שבר וצמצום שבר, השלמת המונה או המכנה החסרים, ומעבר לשבר מצומצם — עם הסבר קצר ודפי עבודה להדפסה.',
  intro: 'שברים שקולים הם שברים שונים בכתיבה ששווים בגודלם, למשל 1/2 = 2/4 = 3/6. כדי להרחיב שבר כופלים את המונה ואת המכנה באותו מספר; כדי לצמצם שבר מחלקים את המונה ואת המכנה באותו מספר. שבר שאי אפשר לצמצם יותר נקרא שבר מצומצם.',
  tips: [
    'מה שעושים למכנה — עושים גם למונה (אותו כפל או אותו חילוק).',
    'כדי למצוא פי כמה הרחיבו, מחלקים את המכנה החדש במכנה הישן.',
    'בצמצום מחפשים מספר שגם המונה וגם המכנה מתחלקים בו.',
  ],
  example: { q: '3/4 = ?/20', steps: ['20 ÷ 4 = 5, כלומר המכנה הוכפל פי 5.', 'מכפילים גם את המונה פי 5: 3 × 5 = 15.'], a: '15 (3/4 = 15/20)' },
  faq: [
    { q: 'האם הרחבה משנה את גודל השבר?', a: 'לא. מחלקים את השלם ליותר חלקים קטנים ולוקחים יותר חלקים — הכמות נשארת זהה.' },
    { q: 'איך יודעים ששבר מצומצם?', a: 'כשאין מספר (חוץ מ-1) שמחלק גם את המונה וגם את המכנה. למשל 5/8 מצומצם, אבל 6/8 אפשר לצמצם ב-2.' },
  ],
  levels: ['הרחבה — השלמת המונה', 'צמצום — השלמת המונה', 'השלמת מונה או מכנה, בשני הכיוונים'],
  gen(level, r) {
    let b, a
    do { b = r.int(2, 10); a = r.int(1, b - 1) } while (gcd(a, b) !== 1)
    const k = level === 1 ? r.int(2, 5) : r.int(2, 9)
    let expr, ans, explain
    if (level === 1) { expr = `${a}/${b} = ?/${b * k}`; ans = a * k; explain = `${b * k} ÷ ${b} = ${k}, ולכן מכפילים גם את המונה: ${a} × ${k} = ${ans}.` }
    else if (level === 2) { expr = `${a * k}/${b * k} = ?/${b}`; ans = a; explain = `${b * k} ÷ ${k} = ${b}, ולכן מחלקים גם את המונה ב-${k}: ${a * k} ÷ ${k} = ${a}.` }
    else {
      const f = r.int(0, 2)
      if (f === 0) { expr = `${a}/${b} = ${a * k}/?`; ans = b * k; explain = `המונה הוכפל פי ${k} (${a} × ${k} = ${a * k}), ולכן גם המכנה: ${b} × ${k} = ${ans}.` }
      else if (f === 1) { expr = `${a * k}/? = ${a}/${b}`; ans = b * k; explain = `${a * k} ÷ ${a} = ${k}, ולכן המכנה הוא ${b} × ${k} = ${ans}.` }
      else {
        let k2 = r.int(2, 6)
        if (k2 === k) k2 = k + 1
        expr = `${a * k}/${b * k} = ?/${b * k2}`; ans = a * k2
        explain = `מצמצמים: ${a * k}/${b * k} = ${a}/${b}. מרחיבים פי ${k2}: ${a}/${b} = ${ans}/${b * k2}.`
      }
    }
    return { q: 'השלימו את המספר החסר כך שהשברים יהיו שקולים:', expr, type: 'number', answer: ans, explain }
  },
}

const compareFractions = {
  slug: 'compare-fractions',
  grade: 4,
  strand: 'fractions',
  title: 'השוואת שברים',
  emoji: '⚖️',
  desc: 'השוואת שברים פשוטים לכיתה ד׳: שברים עם מכנה שווה, עם מונה שווה ועם מכנים שונים — בוחרים את הסימן הנכון (<, > או =) ולומדים להרחיב למכנה משותף.',
  intro: 'כשהמכנים שווים, החלקים באותו גודל — ולכן השבר עם המונה הגדול יותר גדול יותר (5/8 > 3/8). כשהמונים שווים, לוקחים אותו מספר חלקים, אבל ככל שהמכנה קטן יותר החלקים גדולים יותר (2/3 > 2/5). כשגם המונים וגם המכנים שונים, מרחיבים את שני השברים למכנה משותף ואז משווים את המונים.',
  tips: [
    'מכנה שווה ← משווים מונים.',
    'מונה שווה ← המכנה הקטן מנצח.',
    'מכנים שונים ← מרחיבים למכנה משותף (למשל מכפלת המכנים).',
    'אפשר גם להשוות לחצי: 3/7 קטן מחצי, 4/6 גדול מחצי.',
  ],
  example: { q: '3/4 ☐ 5/6', steps: ['מכנה משותף: 12.', '3/4 = 9/12, 5/6 = 10/12.', '9 < 10.'], a: '3/4 < 5/6' },
  faq: [
    { q: 'למה 1/3 גדול מ-1/4?', a: 'כי כשמחלקים שלם ל-3 חלקים כל חלק גדול יותר מאשר כשמחלקים אותו ל-4 חלקים.' },
    { q: 'מתי שני שברים שווים?', a: 'כשהם שקולים — כלומר אחרי הרחבה או צמצום מקבלים בדיוק אותו שבר, כמו 2/3 ו-8/12.' },
  ],
  levels: ['מכנה שווה', 'מונה שווה', 'מונים ומכנים שונים'],
  gen(level, r) {
    let a, b, c, d
    if (level === 1) { b = d = r.int(3, 12); a = r.int(1, b - 1); do c = r.int(1, b - 1); while (c === a) }
    else if (level === 2) { a = c = r.int(1, 5); b = r.int(a + 1, 12); do d = r.int(a + 1, 12); while (d === b) }
    else {
      for (;;) {
        b = r.int(2, 10); a = r.int(1, b - 1)
        if (r.bool(0.2)) { const k = r.int(2, 4); c = a * k; d = b * k } else { d = r.int(2, 12); c = r.int(1, d - 1) }
        if (b !== d && a !== c) break
      }
    }
    const L = a * d, R = c * b
    const ans = L > R ? '>' : L < R ? '<' : '='
    let explain
    if (level === 1) explain = `המכנים שווים, ולכן משווים את המונים: ${a} ${ans} ${c}.`
    else if (level === 2) explain = `המונים שווים, ולכן השבר עם המכנה הקטן יותר גדול יותר (החלקים שלו גדולים יותר).`
    else { const m = b * d / gcd(b, d); explain = `מרחיבים למכנה ${m}: ${a}/${b} = ${a * m / b}/${m}, ${c}/${d} = ${c * m / d}/${m}. ולכן ${a}/${b} ${ans} ${c}/${d}.` }
    return { q: 'איזה סימן מתאים: <, > או =?', expr: `${a}/${b} ☐ ${c}/${d}`, type: 'choice', choices: r.shuffle(['<', '>', '=']), answer: ans, explain }
  },
}

const likeFractions = {
  slug: 'add-subtract-like-fractions',
  grade: 4,
  strand: 'fractions',
  title: 'חיבור וחיסור שברים עם מכנה שווה',
  emoji: '➕',
  desc: 'חיבור וחיסור שברים עם מכנים שווים לכיתה ד׳: מחברים ומחסרים את המונים, משאירים את המכנה ומצמצמים — כולל תרגילים עם מספרים מעורבים והמרה לשלם.',
  intro: 'כשלשברים יש אותו מכנה, החלקים באותו גודל — ולכן פשוט מחברים או מחסרים את המונים, והמכנה נשאר כמו שהוא: 2/7 + 3/7 = 5/7. אם יוצא שבר גדול מ-1 אפשר לכתוב אותו כמספר מעורב, ובסוף כדאי לצמצם. במספרים מעורבים מחברים שלמים לשלמים ושברים לשברים.',
  tips: [
    'המכנה לא משתנה! מחברים או מחסרים רק את המונים.',
    '1 שלם = שבר שהמונה והמכנה שלו שווים (למשל 1 = 8/8).',
    'כשבחיסור מספרים מעורבים השבר הראשון קטן מדי, "פורטים" שלם אחד לשבר.',
  ],
  example: { q: '3 1/5 − 1 3/5 = ?', steps: ['1/5 קטן מ-3/5, ולכן פורטים שלם: 3 1/5 = 2 6/5.', 'שלמים: 2 − 1 = 1. שברים: 6/5 − 3/5 = 3/5.'], a: '1 3/5' },
  faq: [
    { q: 'למה לא מחברים גם את המכנים?', a: 'המכנה מתאר את סוג החלקים (שביעיות, שמיניות...). שתי שביעיות ועוד שלוש שביעיות הן חמש שביעיות — סוג החלק לא השתנה.' },
    { q: 'האם חייבים לצמצם את התשובה?', a: 'מקובל לכתוב את התשובה כשבר מצומצם, אבל תשובה שקולה (למשל 4/8 במקום 1/2) היא עדיין נכונה, והבודק כאן מקבל אותה.' },
  ],
  levels: ['חיבור שברים (עד שלם)', 'חיסור שברים', 'חיבור וחיסור מספרים מעורבים'],
  gen(level, r) {
    const d = r.int(3, 12)
    if (level === 1) {
      const a = r.int(1, d - 1), b = r.int(1, d - a)
      return { q: 'חשבו (אפשר לצמצם את התשובה):', expr: `${a}/${d} + ${b}/${d} = ?`, ...fracAns(a + b, d), explain: `מחברים את המונים: ${a} + ${b} = ${a + b}. ${a}/${d} + ${b}/${d} = ${a + b}/${d}${fracStr(a + b, d) !== `${a + b}/${d}` ? ` = ${fracStr(a + b, d)}` : ''}.` }
    }
    if (level === 2) {
      if (r.bool(0.3)) {
        const a = r.int(1, d - 1)
        return { q: 'חשבו (אפשר לצמצם את התשובה):', expr: `1 − ${a}/${d} = ?`, ...fracAns(d - a, d), explain: `1 = ${d}/${d}, ולכן ${d}/${d} − ${a}/${d} = ${d - a}/${d}${fracStr(d - a, d) !== `${d - a}/${d}` ? ` = ${fracStr(d - a, d)}` : ''}.` }
      }
      const a = r.int(2, d - 1), b = r.int(1, a - 1)
      return { q: 'חשבו (אפשר לצמצם את התשובה):', expr: `${a}/${d} − ${b}/${d} = ?`, ...fracAns(a - b, d), explain: `מחסרים את המונים: ${a} − ${b} = ${a - b}. התשובה ${a - b}/${d}${fracStr(a - b, d) !== `${a - b}/${d}` ? ` = ${fracStr(a - b, d)}` : ''}.` }
    }
    const w1 = r.int(1, 6), w2 = r.int(1, 6), a = r.int(1, d - 1), b = r.int(1, d - 1)
    const A = w1 * d + a, B = w2 * d + b
    if (r.bool() || A <= B) {
      const S = A + B
      return { q: 'חשבו וכתבו כמספר מעורב או כשבר:', expr: `${w1} ${a}/${d} + ${w2} ${b}/${d} = ?`, ...fracAns(S, d), explain: `שלמים: ${w1} + ${w2} = ${w1 + w2}. שברים: ${a}/${d} + ${b}/${d} = ${a + b}/${d}. ביחד: ${mixedStr(S, d)}.` }
    }
    const D = A - B
    return { q: 'חשבו וכתבו כמספר מעורב או כשבר:', expr: `${w1} ${a}/${d} − ${w2} ${b}/${d} = ?`, ...fracAns(D, d), explain: `${a < b ? `${a}/${d} קטן מ-${b}/${d}, ולכן פורטים שלם: ${w1} ${a}/${d} = ${w1 - 1} ${a + d}/${d}. ` : ''}התוצאה: ${mixedStr(D, d)}.` }
  },
}

// Rays from one vertex: dirs in degrees (math orientation), labels for consecutive gaps.
function raysSvg(dirs, gaps, { W = 280, H = 150 } = {}) {
  const L = 120, cosMin = Math.min(0, ...dirs.map(a => Math.cos((a * Math.PI) / 180)))
  const V = [(W - L * (1 - cosMin)) / 2 - L * cosMin, H - 14]
  const pt = a => [V[0] + L * Math.cos((a * Math.PI) / 180), V[1] - L * Math.sin((a * Math.PI) / 180)]
  let body = dirs.map(a => seg(V, pt(a), 3)).join('')
  const sorted = [...dirs].sort((x, y) => x - y)
  gaps.forEach((g, i) => {
    if (!g) return
    const a = sorted[i], b = sorted[i + 1]
    body += angleMark(V, pt(a), pt(b), g.label, b - a, g.color || '#d33')
  })
  body += `<circle cx="${F(V[0])}" cy="${F(V[1])}" r="3.5" fill="currentColor"/>`
  return svg(W, H, body, 'זוויות')
}

const angleTypes = {
  slug: 'angle-types',
  grade: 4,
  strand: 'geometry',
  title: 'זוויות — חדה, ישרה, קהה ושטוחה',
  emoji: '📐',
  desc: 'סוגי זוויות לכיתה ד׳: זווית חדה, ישרה, קהה ושטוחה, מדידה במעלות וחישוב זווית חסרה בתוך זווית ישרה או שטוחה — תרגול עם שרטוטים ופתרונות.',
  intro: 'זווית נוצרת משתי קרניים שיוצאות מאותה נקודה (קודקוד הזווית), ומודדים אותה במעלות בעזרת מד-זווית. זווית ישרה היא 90°, זווית חדה קטנה מ-90°, זווית קהה גדולה מ-90° וקטנה מ-180°, וזווית שטוחה היא 180° — שתי הקרניים יוצרות קו ישר. כשמחלקים זווית ישרה או שטוחה לכמה זוויות, סכום החלקים שווה לזווית כולה.',
  tips: [
    'חדה < 90° = ישרה < קהה < 180° = שטוחה.',
    'הפינה של דף היא זווית ישרה — אפשר להשוות אליה כל זווית.',
    'זווית חסרה בתוך זווית ישרה: 90° פחות מה שידוע. בתוך זווית שטוחה: 180° פחות מה שידוע.',
  ],
  example: { q: 'זווית שטוחה מחולקת לשתי זוויות. אחת מהן 65°. כמה מעלות בשנייה?', steps: ['זווית שטוחה היא 180°.', '180° − 65° = 115°.'], a: '115° (זווית קהה)' },
  faq: [
    { q: 'האם גודל הזווית תלוי באורך הקווים?', a: 'לא. גודל הזווית תלוי רק בפתיחה בין הקרניים. אם מאריכים את הקווים, הזווית נשארת אותה זווית.' },
    { q: 'איך מסמנים זווית ישרה בשרטוט?', a: 'מסמנים ריבוע קטן בקודקוד הזווית, במקום קשת.' },
  ],
  levels: ['זיהוי סוג הזווית', 'זווית חסרה בתוך זווית ישרה', 'זוויות חסרות על קו ישר (180°)'],
  gen(level, r) {
    if (level === 1) {
      const kind = r.int(0, 3)
      const deg = kind === 0 ? 5 * r.int(3, 17) : kind === 1 ? 90 : kind === 2 ? 5 * r.int(19, 34) : 180
      const names = ['זווית חדה', 'זווית ישרה', 'זווית קהה', 'זווית שטוחה']
      const s = kind === 3 ? raysSvg([0, 180], [{ label: '180°' }]) : raysSvg([0, deg], [{ label: deg === 90 ? '' : `${deg}°` }])
      return {
        q: `בשרטוט זווית של ${deg}°. איזה סוג זווית היא?`,
        svg: s,
        type: 'choice',
        choices: r.shuffle(names),
        answer: names[kind],
        explain: kind === 0 ? `${deg}° קטן מ-90°, ולכן זו זווית חדה.` : kind === 1 ? 'זווית של 90° בדיוק היא זווית ישרה.' : kind === 2 ? `${deg}° גדול מ-90° וקטן מ-180°, ולכן זו זווית קהה.` : 'זווית של 180° היא זווית שטוחה — הקרניים יוצרות קו ישר.',
      }
    }
    if (level === 2) {
      const a = r.int(10, 80)
      return {
        q: `זווית ישרה מחולקת לשתי זוויות. אחת מהן ${a}°. כמה מעלות בזווית השנייה (המסומנת ב-?)?`,
        svg: raysSvg([0, a, 90], [{ label: `${a}°` }, { label: '?', color: '#2563eb' }]),
        type: 'number', unit: 'מעלות', answer: 90 - a,
        explain: `זווית ישרה היא 90°, ולכן 90° − ${a}° = ${90 - a}°.`,
      }
    }
    if (r.bool()) {
      const a = 5 * r.int(4, 32)
      return {
        q: `זווית שטוחה מחולקת לשתי זוויות. אחת מהן ${a}°. כמה מעלות בזווית המסומנת ב-?`,
        svg: raysSvg([0, a, 180], [{ label: `${a}°` }, { label: '?', color: '#2563eb' }]),
        type: 'number', unit: 'מעלות', answer: 180 - a,
        explain: `זווית שטוחה היא 180°, ולכן 180° − ${a}° = ${180 - a}°.`,
      }
    }
    const a = 5 * r.int(5, 14), b = 5 * r.int(5, 14), c = 180 - a - b
    return {
      q: `שלוש זוויות יוצרות יחד זווית שטוחה. שתיים מהן ${a}° ו-${b}°. כמה מעלות בזווית המסומנת ב-?`,
      svg: raysSvg([0, a, a + c, 180], [{ label: `${a}°` }, { label: '?', color: '#2563eb' }, { label: `${b}°` }]),
      type: 'number', unit: 'מעלות', answer: c,
      explain: `סכום שלוש הזוויות הוא 180°: 180° − ${a}° − ${b}° = ${c}°.`,
    }
  },
}

function triSidesSvg(a, b, c, labels) {
  const P = triBySides(a, b, c), C0 = centroid(P)
  return svg(260, 190, polygon(P) + sideLabel(P[0], P[1], C0, labels[0]) + sideLabel(P[1], P[2], C0, labels[1]) + sideLabel(P[2], P[0], C0, labels[2]), 'משולש')
}

const triangleTypes = {
  slug: 'triangle-types',
  grade: 4,
  strand: 'geometry',
  title: 'סוגי משולשים לפי צלעות וזוויות',
  emoji: '🔺',
  desc: 'מיון משולשים לכיתה ד׳: שווה צלעות, שווה שוקיים ושונה צלעות; חד-זווית, ישר-זווית וקהה-זווית, וחישוב היקף של משולשים מיוחדים — עם שרטוטים.',
  intro: 'ממיינים משולשים בשתי דרכים. לפי הצלעות: במשולש שווה צלעות כל שלוש הצלעות שוות, במשולש שווה שוקיים יש שתי צלעות שוות (השוקיים) והצלע השלישית נקראת בסיס, ובמשולש שונה צלעות כל הצלעות שונות. לפי הזוויות: במשולש ישר-זווית יש זווית של 90°, במשולש קהה-זווית יש זווית גדולה מ-90°, ובמשולש חד-זווית כל הזוויות חדות.',
  tips: [
    'כדי למיין לפי זוויות מספיק למצוא את הזווית הגדולה: 90° — ישר-זווית, יותר — קהה-זווית, פחות — חד-זווית.',
    'משולש שווה צלעות הוא גם שווה שוקיים, אבל השם המדויק שלו הוא "שווה צלעות".',
    'היקף משולש = סכום אורכי שלוש הצלעות.',
  ],
  example: { q: 'משולש שווה שוקיים: השוק 7 ס״מ והבסיס 4 ס״מ. מהו ההיקף?', steps: ['יש שתי שוקיים שוות: 7 + 7 = 14.', 'מוסיפים את הבסיס: 14 + 4 = 18.'], a: '18 ס״מ' },
  faq: [
    { q: 'האם יכול להיות משולש עם שתי זוויות ישרות?', a: 'לא. סכום הזוויות במשולש הוא 180°, ושתי זוויות ישרות כבר תופסות את כל 180° — לא נשאר מקום לזווית שלישית.' },
    { q: 'מה ההבדל בין שוק לבסיס?', a: 'במשולש שווה שוקיים שתי הצלעות השוות נקראות שוקיים, והצלע השלישית נקראת בסיס.' },
  ],
  levels: ['מיון לפי צלעות', 'מיון לפי זוויות', 'היקף משולשים מיוחדים'],
  gen(level, r) {
    if (level === 1) {
      const kind = r.int(0, 2), names = ['שווה צלעות', 'שווה שוקיים', 'שונה צלעות']
      let a, b, c
      for (;;) {
        if (kind === 0) { a = b = c = r.int(3, 12) }
        else if (kind === 1) { a = b = r.int(4, 12); do c = r.int(3, 2 * a - 2); while (c === a) }
        else { a = r.int(4, 12); b = r.int(4, 12); c = r.int(4, 12) }
        const distinct = new Set([a, b, c]).size
        const ok = a + b > c && a + c > b && b + c > a && Math.min(...triAngles(a, b, c)) >= 22
        if (ok && (kind !== 2 || distinct === 3)) break
      }
      // base on the bottom: c is the base (AB), a = BC, b = CA
      return {
        q: 'אורכי הצלעות רשומים בשרטוט (בס״מ). מה סוג המשולש לפי הצלעות? בחרו את השם המדויק ביותר.',
        svg: triSidesSvg(a, b, c, [String(c), String(a), String(b)]),
        type: 'choice', choices: r.shuffle(names), answer: names[kind],
        explain: kind === 0 ? `כל שלוש הצלעות שוות (${a}), ולכן המשולש שווה צלעות.` : kind === 1 ? `יש שתי צלעות שוות (${a} ו-${b}), ולכן המשולש שווה שוקיים.` : `כל הצלעות שונות (${a}, ${b}, ${c}), ולכן המשולש שונה צלעות.`,
      }
    }
    if (level === 2) {
      const kind = r.int(0, 2), names = ['חד-זווית', 'ישר-זווית', 'קהה-זווית']
      let A, B, C
      if (kind === 0) { do { A = 5 * r.int(8, 17); B = 5 * r.int(8, 17); C = 180 - A - B } while (C < 40 || C > 85) }
      else if (kind === 1) { A = 5 * r.int(5, 13); B = 90 - A; C = 90; [A, B, C] = r.shuffle([A, B, C]) }
      else { const big = 5 * r.int(20, 28); A = 5 * r.int(4, Math.floor((180 - big) / 5) - 4); B = 180 - big - A; C = big; [A, B, C] = r.shuffle([A, B, C]) }
      // draw with the largest angle on top, so the triangle is wide rather than a thin spike
      const d0 = [A, B, C], top = d0.indexOf(Math.max(...d0)), deg = [(top + 1) % 3, (top + 2) % 3, top].map(k => d0[k])
      const P = triByAngles(deg[0], deg[1])
      const body = polygon(P) + angleMark(P[0], P[1], P[2], `${deg[0]}°`, deg[0]) + angleMark(P[1], P[2], P[0], `${deg[1]}°`, deg[1]) + angleMark(P[2], P[0], P[1], `${deg[2]}°`, deg[2])
      const mx = Math.max(A, B, C)
      return {
        q: `זוויות המשולש הן ${A}°, ${B}° ו-${C}°. מה סוג המשולש לפי הזוויות?`,
        svg: svg(260, 190, body, 'משולש'),
        type: 'choice', choices: r.shuffle(names), answer: names[kind],
        explain: kind === 0 ? `הזווית הגדולה היא ${mx}°, קטנה מ-90°. כל הזוויות חדות, ולכן המשולש חד-זווית.` : kind === 1 ? 'יש במשולש זווית של 90°, ולכן הוא ישר-זווית.' : `יש במשולש זווית של ${mx}° — גדולה מ-90°, ולכן הוא קהה-זווית.`,
      }
    }
    const f = r.int(0, 3)
    if (f === 0) {
      const s = r.int(3, 25)
      return { q: `משולש שווה צלעות שאורך כל צלע בו ${s} ס״מ. מהו היקפו?`, svg: triSidesSvg(s, s, s, [String(s), '', '']), type: 'number', unit: 'ס״מ', answer: 3 * s, explain: `שלוש צלעות שוות: ${s} × 3 = ${3 * s}.` }
    }
    if (f === 1) {
      const s = r.int(3, 30)
      return { q: `היקף משולש שווה צלעות הוא ${3 * s} ס״מ. מה אורך כל צלע?`, svg: triSidesSvg(s, s, s, ['?', '', '']), type: 'number', unit: 'ס״מ', answer: s, explain: `שלוש צלעות שוות: ${3 * s} ÷ 3 = ${s}.` }
    }
    let leg, base
    do { leg = r.int(4, 20); base = r.int(3, 2 * leg - 2) } while (base === leg || base < leg * 0.4)
    if (f === 2) return { q: `משולש שווה שוקיים: אורך כל שוק ${leg} ס״מ ואורך הבסיס ${base} ס״מ. מהו היקפו?`, svg: triSidesSvg(leg, leg, base, [String(base), String(leg), String(leg)]), type: 'number', unit: 'ס״מ', answer: 2 * leg + base, explain: `${leg} + ${leg} + ${base} = ${2 * leg + base}.` }
    return { q: `היקף משולש שווה שוקיים הוא ${2 * leg + base} ס״מ, ואורך הבסיס ${base} ס״מ. מה אורך כל שוק?`, svg: triSidesSvg(leg, leg, base, [String(base), '?', '?']), type: 'number', unit: 'ס״מ', answer: leg, explain: `מורידים את הבסיס: ${2 * leg + base} − ${base} = ${2 * leg}. שתי שוקיים שוות: ${2 * leg} ÷ 2 = ${leg}.` }
  },
}

function linesSvg(t1, rel, gapDeg) {
  const W = 260, H = 220, c = [W / 2, H / 2], L = 80
  const dir = t => [Math.cos((t * Math.PI) / 180), -Math.sin((t * Math.PI) / 180)]
  const d1 = dir(t1)
  let p1, d2, p2
  if (rel === 'par') {
    const n = [-d1[1], d1[0]]
    p1 = [c[0] + n[0] * 30, c[1] + n[1] * 30]; p2 = [c[0] - n[0] * 30, c[1] - n[1] * 30]; d2 = d1
  } else {
    d2 = dir(t1 + (rel === 'perp' ? 90 : gapDeg))
    p1 = [c[0] + d1[0] * 18, c[1] + d1[1] * 18]; p2 = [c[0] - d2[0] * 22, c[1] - d2[1] * 22]
  }
  const line = (p, d, col) => `<line x1="${F(p[0] - d[0] * L)}" y1="${F(p[1] - d[1] * L)}" x2="${F(p[0] + d[0] * L)}" y2="${F(p[1] + d[1] * L)}" stroke="${col}" stroke-width="3" stroke-linecap="round"/>`
  return svg(W, H, line(p1, d1, 'currentColor') + line(p2, d2, '#2563eb'), 'שני ישרים')
}

// Quadrilaterals with random proportions (math coords). Parallel pairs and right angles are measured
// from the points, so the answer always matches the drawing.
const QUAD_MAKERS = {
  'ריבוע': () => [[0, 0], [100, 0], [100, 100], [0, 100]],
  'מלבן': r => { const w = r.int(140, 190), h = r.int(60, 100); return [[0, 0], [w, 0], [w, h], [0, h]] },
  'מקבילית': r => { const b = r.int(110, 150), o = r.int(30, 60), h = r.int(70, 100); return [[0, 0], [b, 0], [b + o, h], [o, h]] },
  'מעוין': r => { const t = (r.int(50, 70) * Math.PI) / 180, c = 100 * Math.cos(t), s = 100 * Math.sin(t); return [[0, 0], [100, 0], [100 + c, s], [c, s]] },
  'טרפז': r => { const a = r.int(160, 200), b = r.int(70, 110), o = r.int(20, a - b - 20), h = r.int(70, 100); return [[0, 0], [a, 0], [o + b, h], [o, h]] },
  'טרפז ישר-זווית': r => { const a = r.int(160, 200), b = r.int(80, 130), h = r.int(70, 100); return [[0, 0], [a, 0], [b, h], [0, h]] },
  'דלתון': r => { const w = r.int(55, 80), y1 = r.int(35, 60), top = r.int(150, 175); return [[0, 0], [w, y1], [0, top], [-w, y1]] },
  'מרובע': r => [[0, 0], [r.int(150, 180), r.int(10, 30)], [r.int(110, 140), r.int(95, 115)], [r.int(15, 40), r.int(65, 85)]],
}
// [parallel pairs, right angles] each shape must have
const QUAD_EXPECT = { 'ריבוע': [2, 4], 'מלבן': [2, 4], 'מקבילית': [2, 0], 'מעוין': [2, 0], 'טרפז': [1, 0], 'טרפז ישר-זווית': [1, 2], 'דלתון': [0, 0], 'מרובע': [0, 0] }
function quadFacts(P) {
  const v = i => { const a = P[i], b = P[(i + 1) % 4], l = Math.hypot(b[0] - a[0], b[1] - a[1]); return [(b[0] - a[0]) / l, (b[1] - a[1]) / l] }
  const V = [0, 1, 2, 3].map(v)
  const cross = (a, b) => Math.abs(a[0] * b[1] - a[1] * b[0])
  const dot = (a, b) => Math.abs(a[0] * b[0] + a[1] * b[1])
  const pairs = (cross(V[0], V[2]) < 1e-6 ? 1 : 0) + (cross(V[1], V[3]) < 1e-6 ? 1 : 0)
  const rights = [0, 1, 2, 3].filter(i => dot(V[i], V[(i + 1) % 4]) < 1e-6).length
  // nothing "almost" parallel or "almost" right that a child could misread
  const clear = [cross(V[0], V[2]), cross(V[1], V[3])].every(c => c < 1e-6 || c > 0.12) && [0, 1, 2, 3].every(i => { const d = dot(V[i], V[(i + 1) % 4]); return d < 1e-6 || d > 0.12 })
  return { pairs, rights, clear }
}

const parallelPerp = {
  slug: 'parallel-perpendicular',
  grade: 4,
  strand: 'geometry',
  title: 'ישרים מקבילים ומאונכים',
  emoji: '🛤️',
  desc: 'ישרים מקבילים, מאונכים ונחתכים לכיתה ד׳: זיהוי בשרטוט, גם כשהישרים מסובבים, וספירת צלעות מקבילות וזוויות ישרות במרובעים — ריבוע, מלבן, מקבילית וטרפז.',
  intro: 'ישרים מקבילים הם ישרים שלעולם לא ייפגשו, גם אם נאריך אותם — המרחק ביניהם קבוע (כמו מסילות רכבת). ישרים מאונכים נחתכים ויוצרים ביניהם זוויות ישרות (90°). ישרים נחתכים שאינם מאונכים יוצרים זוויות חדות וקהות. במרובעים בודקים אילו צלעות מקבילות: למקבילית יש שני זוגות של צלעות מקבילות, ולטרפז זוג אחד בלבד.',
  tips: [
    'מקבילים — "הולכים באותו כיוון" ולא נפגשים.',
    'מאונכים — נפגשים בזווית ישרה, כמו הפינה של מחברת.',
    'ישרים יכולים להיות מאונכים גם כשהם לא אופקיים ואנכיים — מסובבים את הדף ובודקים.',
  ],
  example: { q: 'כמה זוגות של צלעות מקבילות יש במלבן?', steps: ['הצלע העליונה מקבילה לתחתונה.', 'הצלע הימנית מקבילה לשמאלית.'], a: '2 זוגות' },
  faq: [
    { q: 'האם ריבוע הוא מקבילית?', a: 'כן. לריבוע יש שני זוגות של צלעות נגדיות מקבילות, ולכן הוא מקבילית מיוחדת (וגם מלבן ומעוין).' },
    { q: 'איך בודקים אם שני ישרים מאונכים?', a: 'מניחים בפינת הנחתכות משולש או פינה של דף. אם הפינה מתאימה בדיוק — הזווית ישרה והישרים מאונכים.' },
  ],
  levels: ['ישרים אופקיים ואנכיים', 'ישרים מסובבים', 'צלעות מקבילות וזוויות ישרות במרובעים'],
  gen(level, r) {
    const names = { par: 'מקבילים', perp: 'מאונכים', cross: 'נחתכים אך לא מאונכים' }
    if (level <= 2) {
      const rel = r.pick(['par', 'perp', 'cross'])
      const t1 = level === 1 ? r.pick([0, 90]) : r.int(10, 80) + r.pick([0, 90])
      const gap = r.bool() ? r.int(30, 55) : r.int(125, 150)
      return {
        q: 'מה נכון לגבי שני הישרים בשרטוט?',
        svg: linesSvg(t1, rel, gap),
        type: 'choice', choices: r.shuffle(Object.values(names)), answer: names[rel],
        explain: rel === 'par' ? 'הישרים באותו כיוון ולא ייפגשו לעולם — הם מקבילים.' : rel === 'perp' ? 'הישרים נחתכים ויוצרים זווית ישרה (90°) — הם מאונכים.' : `הישרים נחתכים בזווית של ${gap < 90 ? gap : 180 - gap}° ולא בזווית ישרה — הם נחתכים אך לא מאונכים.`,
      }
    }
    for (;;) {
      const name = r.pick(Object.keys(QUAD_MAKERS)), pts = QUAD_MAKERS[name](r)
      const { pairs, rights, clear } = quadFacts(pts)
      if (!clear || pairs !== QUAD_EXPECT[name][0] || rights !== QUAD_EXPECT[name][1]) continue
      const P = fit(pts, 240, 170, 26), shape = svg(240, 170, polygon(P, '#ffd23f'), name)
      if (r.bool(0.6)) {
        return {
          q: `בשרטוט ${name}. כמה זוגות של צלעות מקבילות יש בו?`,
          svg: shape, type: 'number', answer: pairs,
          explain: pairs === 2 ? `ב${name} כל צלע מקבילה לצלע שמולה — שני זוגות.` : pairs === 1 ? `ב${name} רק שני הבסיסים מקבילים — זוג אחד.` : `ב${name} הזה אין צלעות מקבילות — 0 זוגות.`,
        }
      }
      return {
        q: `בשרטוט ${name}. כמה זוויות ישרות יש בו?`,
        svg: shape, type: 'number', answer: rights,
        explain: rights === 4 ? `ב${name} כל ארבע הזוויות ישרות.` : rights === 2 ? `ב${name} שתי זוויות ישרות — ליד הצלע המאונכת לבסיסים.` : `ב${name} הזה אין זוויות ישרות — 0.`,
      }
    }
  },
}

function rectSvg(w, h, top, side) {
  const s = Math.min(180 / w, 110 / h), W = w * s, H = h * s
  const x0 = (240 - W) / 2, y0 = (160 - H) / 2
  const pts = [[x0, y0], [x0 + W, y0], [x0 + W, y0 + H], [x0, y0 + H]]
  const C0 = centroid(pts)
  return svg(240, 160, polygon(pts, '#86efac') + (top !== '' ? sideLabel(pts[3], pts[2], C0, top) : '') + (side !== '' ? sideLabel(pts[0], pts[3], C0, side) : ''), 'מלבן')
}

const rectangle = {
  slug: 'rectangle-area-perimeter',
  grade: 4,
  strand: 'measurement',
  title: 'שטח והיקף של מלבן וריבוע',
  emoji: '▭',
  desc: 'שטח והיקף מלבן וריבוע לכיתה ד׳: חישוב היקף, חישוב שטח בסמ״ר ומציאת צלע חסרה לפי השטח או ההיקף — תרגול עם שרטוטים, יחידות מידה ופתרונות מלאים.',
  intro: 'היקף הוא אורך הקו שמקיף את הצורה — סכום אורכי כל הצלעות, ונמדד ביחידות אורך (ס״מ, מ׳). שטח הוא גודל המשטח שהצורה תופסת, ונמדד ביחידות ריבועיות (סמ״ר, מ״ר). שטח מלבן = אורך × רוחב, והיקף מלבן = 2 × (אורך + רוחב). בריבוע כל הצלעות שוות, ולכן ההיקף הוא 4 × צלע והשטח הוא צלע × צלע.',
  tips: [
    'היקף ← מחברים צלעות (ס״מ). שטח ← כופלים (סמ״ר).',
    'צלע חסרה לפי שטח: שטח ÷ הצלע הידועה.',
    'צלע חסרה לפי היקף: היקף ÷ 2 = אורך + רוחב, ואז מחסרים את הצלע הידועה.',
  ],
  example: { q: 'שטח מלבן 48 סמ״ר ואורכו 8 ס״מ. מה רוחבו ומה היקפו?', steps: ['רוחב: 48 ÷ 8 = 6 ס״מ.', 'היקף: 2 × (8 + 6) = 28 ס״מ.'], a: 'רוחב 6 ס״מ, היקף 28 ס״מ' },
  faq: [
    { q: 'מה זה סמ״ר?', a: 'סנטימטר רבוע — שטח של ריבוע שאורך צלעו 1 ס״מ. מלבן של 3 ס״מ על 4 ס״מ מכיל 12 ריבועים כאלה, ולכן שטחו 12 סמ״ר.' },
    { q: 'האם לשני מלבנים עם אותו היקף יש אותו שטח?', a: 'לא בהכרח. מלבן 1 × 9 ומלבן 5 × 5 הם בעלי אותו היקף (20), אבל השטחים שלהם 9 ו-25.' },
  ],
  levels: ['היקף', 'שטח', 'מציאת צלע חסרה'],
  gen(level, r) {
    const sq = r.bool(0.25)
    const a = r.int(2, level === 2 ? 15 : 20), b = sq ? a : r.int(2, level === 2 ? 15 : 20)
    const shape = a === b ? 'הריבוע' : 'המלבן'
    if (level === 1) return { q: `מהו היקף ${shape}? (המידות בס״מ)`, svg: rectSvg(a, b, String(a), String(b)), type: 'number', unit: 'ס״מ', answer: 2 * (a + b), explain: `2 × (${a} + ${b}) = 2 × ${a + b} = ${2 * (a + b)}.` }
    if (level === 2) return { q: `מהו שטח ${shape}? (המידות בס״מ)`, svg: rectSvg(a, b, String(a), String(b)), type: 'number', unit: 'סמ״ר', answer: a * b, explain: `${a} × ${b} = ${a * b}.` }
    const f = r.int(0, 2)
    if (f === 0) {
      const w = r.int(2, 15), h = r.int(2, 15)
      return { q: `שטח המלבן ${w * h} סמ״ר ואורך צלע אחת ${w} ס״מ. מה אורך הצלע השנייה?`, svg: rectSvg(w, h, String(w), '?'), type: 'number', unit: 'ס״מ', answer: h, explain: `${w * h} ÷ ${w} = ${h}.` }
    }
    if (f === 1) {
      const w = r.int(3, 20), h = r.int(2, 20)
      return { q: `היקף המלבן ${2 * (w + h)} ס״מ ואורך צלע אחת ${w} ס״מ. מה אורך הצלע השנייה?`, svg: rectSvg(w, h, String(w), '?'), type: 'number', unit: 'ס״מ', answer: h, explain: `חצי היקף: ${2 * (w + h)} ÷ 2 = ${w + h}. ${w + h} − ${w} = ${h}.` }
    }
    const s = r.int(2, 15)
    return { q: `היקף ריבוע הוא ${4 * s} ס״מ. מהו שטחו?`, svg: rectSvg(s, s, '?', ''), type: 'number', unit: 'סמ״ר', answer: s * s, explain: `צלע: ${4 * s} ÷ 4 = ${s}. שטח: ${s} × ${s} = ${s * s}.` }
  },
}

export default [placeValue, verticalMult, longDivision, orderOps, divisibility, fractionOfNumber, equivalentFractions, compareFractions, likeFractions, angleTypes, triangleTypes, parallelPerp, rectangle]
