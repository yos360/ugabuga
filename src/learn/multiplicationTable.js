// Pure data + logic for the "לוח הכפל" pages (/learn/multiplication-table…). No JSX — imported by node tests.

export const MT_BASE = '/learn/multiplication-table'
export const MT_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
export const numberPath = n => `${MT_BASE}/of/${n}`

export const range = (from, to, step = 1) => {
  const out = []
  for (let v = from; v <= to; v += step) out.push(v)
  return out
}

// A multiplication grid: header factors along rows and columns, one cell per pair.
export function buildGrid(rows, cols) {
  return rows.map(r => cols.map(c => ({ r, c, v: r * c, square: r === c })))
}
export const GRIDS = {
  ten: { rows: range(1, 10), cols: range(1, 10) },
  twelve: { rows: range(1, 12), cols: range(1, 12) },
  // "עד 1000": the basic table times whole tens — 1×10 … 10×100
  tens: { rows: range(1, 10), cols: range(10, 100, 10) },
}

export const isSquare = v => Number.isInteger(Math.sqrt(v))
export const squaresUpTo = n => range(1, n).map(k => k * k)
// Distinct facts in an n×n table once a×b and b×a count as one.
export const uniqueFacts = n => (n * (n + 1)) / 2
// The facts in a block of factors that are genuinely "new" once commutativity is used.
export function factPairs(factors) {
  const out = []
  factors.forEach((a, i) => factors.slice(i).forEach(b => out.push([a, b])))
  return out
}
// How many cells of an n×n table hold the product v (24 appears 4 times in 10×10).
export const occurrences = (v, n = 10) => buildGrid(range(1, n), range(1, n)).flat().filter(c => c.v === v).length
export const digitSum = v => String(v).split('').reduce((s, d) => s + Number(d), 0)
export const timesList = (n, upTo = 12) => range(1, upTo).map(k => ({ a: n, b: k, v: n * k }))

// The 9-times finger trick: fold finger k of ten → fingers left of it are tens, right of it are ones.
export const nineFingers = k => ({ tens: k - 1, ones: 10 - k, value: (k - 1) * 10 + (10 - k) })

// Split a number into place-value parts (243 → [200, 40, 3]) and multiply each by b.
export function decompose(a, b) {
  const parts = String(Math.abs(Math.trunc(a))).split('').map((d, i, all) => Number(d) * 10 ** (all.length - 1 - i)).filter(Boolean)
  const steps = parts.map(p => ({ p, b, v: p * b }))
  return { a, b, parts: steps, total: steps.reduce((s, x) => s + x.v, 0) }
}

// Small seeded PRNG so the first render (prerendered snapshot) is deterministic.
export function seeded(seed) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let x = t
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}
export function shuffled(arr, rand) {
  const x = [...arr]
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1));[x[i], x[j]] = [x[j], x[i]] }
  return x
}

// 10 questions on one number's table; factor order is mixed so kids see 7×3 and 3×7.
export function quizFor(n, seed = n) {
  const rand = seeded(seed * 7919 + n)
  const pool = n > 10 ? range(1, 12) : range(1, 10)
  return shuffled(pool, rand).slice(0, 10).map(k => (rand() < 0.5 ? { a: n, b: k } : { a: k, b: n })).map(q => ({ ...q, v: q.a * q.b }))
}

// Round-number practice for "עד 1000": tens × units, tens × tens, hundreds × units — all products ≤ 1000.
export function roundExercises(seed = 1, count = 24) {
  const rand = seeded(seed)
  const pick = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1))
  const out = [], seen = new Set()
  let guard = 0
  while (out.length < count && guard++ < 2000) {
    const kind = out.length % 3
    let a, b
    if (kind === 0) { a = pick(2, 9) * 10; b = pick(2, 9) }
    else if (kind === 1) { a = pick(1, 9) * 10; b = pick(1, 9) * 10 }
    else { a = pick(1, 9) * 100; b = pick(1, 9) }
    if (a * b > 1000) continue
    if (rand() < 0.5) [a, b] = [b, a]
    const key = `${a}x${b}`
    if (seen.has(key)) continue
    seen.add(key); out.push({ a, b, v: a * b })
  }
  return out
}

// ── per-number content ───────────────────────────────
// tips: verified tricks (the tests check the arithmetic behind each one).
// hard: the fact in this table kids usually stumble on; relation: how this table connects to others.
export const NUMBER_INFO = {
  1: {
    intro: 'לוח הכפל של 1 הוא הקל מכולם, ובכל זאת כדאי להתחיל ממנו: הוא מלמד מה בכלל אומר כפל. 1×6 פירושו "פעם אחת 6" — קבוצה אחת של שישה דברים.',
    tips: ['כל מספר כפול 1 נשאר בדיוק כמו שהוא: 1×7 = 7, ו-1×100 = 100.', 'גם הפוך זה עובד: 7×1 = 7 — שבע קבוצות של דבר אחד הן שבעה דברים.'],
    short: 'כל מספר כפול 1 נשאר כמו שהוא',
    hard: 10,
    relation: 'הלוח של 1 מופיע בשורה הראשונה ובטור הראשון של כל לוח כפל. מי שמבין אותו כבר יודע עשירית מהטבלה.',
  },
  2: {
    intro: 'לוח הכפל של 2 הוא בעצם כפליים: כל תרגיל בו הוא מספר ועוד אותו מספר. ילדים מכירים את זה עוד לפני שלומדים כפל — זוג נעליים, זוג ידיים, שתי עיניים.',
    tips: ['כפול 2 זה פשוט כפליים: 2×7 = 7 + 7 = 14.', 'כל התשובות בלוח של 2 זוגיות — הן נגמרות ב-0, 2, 4, 6 או 8.', 'סופרים בקפיצות של 2: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20.'],
    short: 'כפליים — מספר ועוד אותו מספר',
    hard: 7,
    relation: 'הלוח של 2 הוא הבסיס ללוחות של 4 ושל 8: כפול 4 זה כפליים פעמיים, וכפול 8 זה כפליים שלוש פעמים.',
  },
  3: {
    intro: 'בלוח הכפל של 3 כבר צריך קצת יותר זיכרון, אבל הוא בנוי מקפיצות קבועות של 3. כדאי לשנן אותו בקול, בקצב, כמו שיר: 3, 6, 9, 12, 15...',
    tips: ['סופרים בקפיצות של 3: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30.', 'בדיקה: מחברים את הספרות של כל תשובה בלוח של 3 ומקבלים 3, 6 או 9. למשל 27: 2 + 7 = 9. אם יצא משהו אחר — יש טעות.', 'כפול 3 זה כפול 2 ועוד פעם אחת: 3×8 = 16 + 8 = 24.'],
    short: 'סכום הספרות תמיד 3, 6 או 9',
    hard: 8,
    relation: 'הלוח של 6 הוא כפליים של הלוח של 3: אם 3×7 = 21, אז 6×7 = 42. והלוח של 9 הוא פי שלושה מהלוח של 3.',
  },
  4: {
    intro: 'לוח הכפל של 4 נראה מפחיד רק עד שמגלים את הסוד: הוא כפליים של כפליים. מי שיודע את הלוח של 2 כבר יודע לחשב כל תרגיל בלוח של 4.',
    tips: ['מכפילים פעמיים: 4×7 — קודם 7×2 = 14, ושוב כפליים: 28.', 'כל התשובות בלוח של 4 זוגיות.', 'כפול 4 זה חצי מכפול 8, וכפליים מכפול 2: 4×6 = 2 × 12 = 24.'],
    short: 'כפליים ושוב כפליים',
    hard: 7,
    relation: 'הלוח של 4 יושב בין הלוח של 2 ללוח של 8: כפליים של 2, וחצי של 8.',
  },
  5: {
    intro: 'לוח הכפל של 5 הוא מהאהובים על ילדים: התשובות "עגולות", קל לשמוע את הקצב שלהן, וכל אחד מכיר אותו מהשעון.',
    tips: ['התשובה תמיד נגמרת ב-0 או ב-5.', 'כפול 5 זה חצי מכפול 10: 5×8 = חצי מ-80 = 40.', 'השעון: בין כל שני מספרים על השעון עוברות 5 דקות. כשהמחוג הגדול על 4 — עברו 4×5 = 20 דקות.'],
    short: 'התשובה תמיד נגמרת ב-0 או ב-5',
    hard: 7,
    relation: 'הלוח של 5 הוא חצי מהלוח של 10, והוא גם עוזר בלוחות של 6 ושל 7: 6×n זה 5×n ועוד n.',
  },
  6: {
    intro: 'לוח הכפל של 6 פותח את "החצי הקשה" של הטבלה. החדשות הטובות: חצי ממנו כבר מוכר מהלוחות הקודמים, ויש לו כמה דפוסים שעוזרים לזכור את השאר.',
    tips: ['כפול 6 זה כפול 5 ועוד פעם אחת: 6×7 = 35 + 7 = 42.', 'כשכופלים 6 במספר זוגי, התשובה נגמרת באותה ספרה: 6×2 = 12, 6×4 = 24, 6×6 = 36, 6×8 = 48.', 'כפול 6 זה כפליים של כפול 3: 6×9 = 2 × 27 = 54.'],
    short: '6 כפול מספר זוגי נגמר באותה ספרה',
    hard: 8,
    relation: 'הלוח של 6 הוא כפליים של הלוח של 3 וחצי מהלוח של 12.',
  },
  7: {
    intro: 'לוח הכפל של 7 נחשב לקשה ביותר אצל ילדים רבים — אין לו דפוס בולט כמו ל-5 או ל-9. אבל בזכות חוק החילוף, עד שמגיעים אליו כבר מכירים רוב התרגילים שבו.',
    tips: ['כפול 7 זה כפול 5 ועוד כפול 2: 7×8 = 40 + 16 = 56.', '"5, 6, 7, 8": התשובה 56 היא 7×8 — ארבעה מספרים ברצף.', 'מי שכבר יודע את הלוחות של 1 עד 6 ושל 10, צריך ללמוד בלוח של 7 רק שלושה תרגילים חדשים: 7×7, 7×8 ו-7×9.'],
    short: 'כפול 5 ועוד כפול 2',
    hard: 8,
    relation: 'הלוח של 7 נבנה מהלוחות של 5 ושל 2. כדאי לחזור עליו יחד עם 8, כי 7×8 הוא אחד התרגילים הנשכחים ביותר.',
  },
  8: {
    intro: 'לוח הכפל של 8 נשמע ארוך, אבל הוא בעצם כפליים שלוש פעמים. יש בו גם דפוס יפה בספרת האחדות שעוזר לבדוק תשובות.',
    tips: ['מכפילים שלוש פעמים: 8×6 → 12 → 24 → 48.', 'כפול 8 זה כפליים של כפול 4: 8×7 = 2 × 28 = 56.', 'ספרות האחדות חוזרות בסדר קבוע: 8, 6, 4, 2, 0 — ושוב 8, 6, 4, 2, 0.'],
    short: 'כפליים שלוש פעמים',
    hard: 7,
    relation: 'הלוח של 8 הוא כפליים של הלוח של 4 וארבע פעמים הלוח של 2.',
  },
  9: {
    intro: 'ללוח הכפל של 9 יש את הטריקים המפורסמים ביותר — כולל טריק האצבעות שילדים אוהבים להראות לחברים. הוא נראה קשה, אבל הוא אחד הלוחות שהכי קל לבדוק.',
    tips: ['טריק האצבעות: פורשים עשר אצבעות ומקפלים את האצבע שמספרה כמו המספר שכופלים בו, כשסופרים משמאל. האצבעות שמשמאל לאצבע המקופלת הן העשרות, ואלה שמימין הן האחדות. 9×4: מקפלים את האצבע הרביעית — 3 משמאל ו-6 מימין, כלומר 36.', 'סכום הספרות של כל תשובה (עד 9×10) הוא 9: 9×7 = 63, ו-6 + 3 = 9.', 'כפול 9 זה כפול 10 פחות פעם אחת: 9×8 = 80 − 8 = 72.'],
    short: 'טריק האצבעות וסכום ספרות 9',
    hard: 7,
    relation: 'הלוח של 9 צמוד ללוח של 10: כל תשובה בו קטנה בדיוק במספר שכופלים בו מהתשובה בלוח של 10.',
  },
  10: {
    intro: 'לוח הכפל של 10 הוא הקל ביותר אחרי 1: מוסיפים אפס. הוא גם המפתח לכפל במספרים גדולים — לכפל בעשרות ובמאות.',
    tips: ['מוסיפים 0 בסוף: 10×7 = 70.', 'כפול 10 זה כפליים של כפול 5: 10×6 = 2 × 30 = 60.', 'סופרים בעשרות: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100.'],
    short: 'פשוט מוסיפים 0',
    hard: 9,
    relation: 'הלוח של 10 עוזר בלוחות של 5 (חצי ממנו), של 9 (פחות פעם אחת) ושל 11 (ועוד פעם אחת).',
  },
  11: {
    intro: 'לוח הכפל של 11 כבר מחוץ לטבלה הבסיסית של 10×10, אבל רוב התרגילים בו קלים מאוד בזכות דפוס בולט: הספרה כפולה.',
    tips: ['מ-11×1 ועד 11×9 כותבים את הספרה פעמיים: 11×4 = 44, ו-11×7 = 77.', 'כפול 11 זה כפול 10 ועוד פעם אחת: 11×12 = 120 + 12 = 132.', 'אחרי 9 הדפוס משתנה: 11×10 = 110, 11×11 = 121, 11×12 = 132.'],
    short: 'הספרה פשוט נכתבת פעמיים',
    hard: 12,
    relation: 'הלוח של 11 הוא הלוח של 10 ועוד פעם אחת — לכן מי ששולט בלוח של 10 מחשב אותו מהר.',
  },
  12: {
    intro: 'לוח הכפל של 12 שימושי במיוחד בחיים: יש 12 חודשים בשנה, 12 ביצים בתריסר ו-12 שעות על השעון. הוא מחוץ לטבלה של 10×10, ולכן נחשב להעשרה.',
    tips: ['כפול 12 זה כפול 10 ועוד כפול 2: 12×7 = 70 + 14 = 84.', 'כפול 12 זה כפליים של כפול 6: 12×8 = 2 × 48 = 96.', 'מהחיים: 3 תריסרי ביצים הם 3×12 = 36 ביצים, ובשנתיים יש 2×12 = 24 חודשים.'],
    short: 'כפול 10 ועוד כפול 2',
    hard: 7,
    relation: 'הלוח של 12 הוא כפליים של הלוח של 6, ונבנה מהלוחות של 10 ושל 2.',
  },
}

// ── page metadata ───────────────────────────────
export const MT_PAGES = {
  main: {
    path: MT_BASE,
    title: 'לוח הכפל — טבלה צבעונית אינטראקטיבית ולוח הכפל להדפסה',
    description: 'לוח הכפל המלא בצבעים: לוחצים על משבצת ורואים את התרגיל, מסתירים תשובות לתרגול ומדפיסים — צבעוני, שחור-לבן, ריק למילוי או לוח של מספר אחד.',
    h1: 'לוח הכפל',
    crumb: 'לוח הכפל',
  },
  100: {
    path: `${MT_BASE}/100`,
    title: 'לוח הכפל עד 100 — טבלת 10×10, סדר לימוד ודפים להדפסה',
    description: 'לוח הכפל עד 100: כל התרגילים מ-1×1 ועד 10×10 בטבלה אחת, כמה תרגילים באמת צריך לזכור, סדר לימוד מומלץ, דפוסים בטבלה ודפים להדפסה.',
    h1: 'לוח הכפל עד 100',
    crumb: 'לוח הכפל עד 100',
  },
  1000: {
    path: `${MT_BASE}/1000`,
    title: 'לוח הכפל עד 1000 — כפל בעשרות ובמאות, הסבר ודפי תרגול',
    description: 'לוח הכפל עד 1000: טבלת כפל בעשרות שלמות עד 10×100, כפל במאות, פירוק תרגילים גדולים לחלקים קלים, מחשבון פירוק ודפי תרגול להדפסה עם תשובות.',
    h1: 'לוח הכפל עד 1000',
    crumb: 'לוח הכפל עד 1000',
  },
}

export function numberMeta(n) {
  const info = NUMBER_INFO[n]
  if (!info) return null
  const upTo = 12
  return {
    path: numberPath(n),
    title: `לוח הכפל של ${n} — כל התרגילים, טריק לזכירה ובוחן קצר`,
    description: `לוח הכפל של ${n}: כל התרגילים מ-${n}×1 ועד ${n}×${upTo} בגדול, הטריק לזכירה (${info.short}), בוחן קצר של 10 שאלות ודף להדפסה — בחינם.`,
    h1: `לוח הכפל של ${n}`,
    crumb: `לוח הכפל של ${n}`,
  }
}

export function numberFaq(n) {
  const info = NUMBER_INFO[n]
  const b = info.hard
  return [
    { q: `כמה זה ${n} כפול ${b}?`, a: `${n} כפול ${b} שווה ${n * b}. ${info.tips[0]}` },
    { q: `איך זוכרים את לוח הכפל של ${n}?`, a: `${info.tips.slice(1).join(' ')} וכמו תמיד — כמה דקות של תרגול כל יום עדיפות על שעה אחת פעם בשבוע.` },
    { q: `מה הקשר בין לוח הכפל של ${n} ללוחות אחרים?`, a: info.relation },
    { q: `כמה תרגילים יש בלוח הכפל של ${n}?`, a: n > 10 ? `בדרך כלל מתרגלים את ${n}×1 עד ${n}×12 — שנים-עשר תרגילים. הלוח של ${n} לא נכלל בטבלה הבסיסית של 10×10, ולכן נחשב להעשרה.` : `בטבלה הבסיסית יש עשרה תרגילים: מ-${n}×1 ועד ${n}×10. בעמוד הזה הוספנו גם את ${n}×11 ו-${n}×12 למי שרוצה להמשיך.` },
  ]
}

export const MT_PATHS = [MT_PAGES.main.path, MT_PAGES[100].path, MT_PAGES[1000].path, ...MT_NUMBERS.map(numberPath)]
export const allPageMeta = () => [MT_PAGES.main, MT_PAGES[100], MT_PAGES[1000], ...MT_NUMBERS.map(numberMeta)]
