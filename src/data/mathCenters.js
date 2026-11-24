// Math learning centers (stations) for grades 2-3: four sets of six stations each.
// Every station has a goal, materials, a printable instruction card and a deterministic generator
// (by seed) for the group's answer sheet. Each exercise carries a `kind` and `args` so the answer can be
// recomputed independently (see tests/math-centers.test.mjs).

export const PATH = '/classroom/math-centers'
export const SHEET_SIZE = 6 // exercises per station on a group's answer sheet

// ---------- tiny seeded random helpers ----------
export function rng(seed) {
  let s = (seed >>> 0) || 1
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1))
const pick = (r, list) => list[Math.floor(r() * list.length)]

// builds `n` distinct exercises; `make(r)` returns an exercise with a `key`
function unique(seed, n, make) {
  const r = rng(seed)
  const out = []
  const seen = new Set()
  let guard = 0
  while (out.length < n && guard++ < 500) {
    const ex = make(r)
    if (seen.has(ex.key)) continue
    seen.add(ex.key)
    out.push(ex)
  }
  return out
}

const shekel = n => `${n} ₪`
const timeStr = (h, m) => `${h}:${m === 0 ? '00' : '30'}`
const hourWord = n => (n === 1 ? 'שעה' : n === 2 ? 'שעתיים' : `${n} שעות`)

// ---------- exercise generators ----------
const add = (carry) => (r) => {
  for (;;) {
    const a = int(r, 11, 78), b = int(r, 11, 78)
    const need = (a % 10) + (b % 10) >= 10
    if (need !== carry || a + b > 100) continue
    return { kind: 'add', args: { a, b }, text: `${a} + ${b} =`, answer: String(a + b), key: `${a}+${b}` }
  }
}
const sub = (borrow) => (r) => {
  for (;;) {
    const a = int(r, 31, 99), b = int(r, 11, a - 1)
    const need = (a % 10) < (b % 10)
    if (need !== borrow) continue
    return { kind: 'sub', args: { a, b }, text: `${a} − ${b} =`, answer: String(a - b), key: `${a}-${b}` }
  }
}
const toHundred = (r) => {
  const a = r() < 0.5 ? int(r, 1, 9) * 10 : int(r, 1, 99)
  return { kind: 'complement', args: { a }, text: `${a} + ____ = 100`, answer: String(100 - a), key: String(a) }
}
const WORD_ADD = [
  (a, b) => `בכיתה יש ${a} בנות ו־${b} בנים. כמה ילדים יש בכיתה?`,
  (a, b) => `על המדף עמדו ${a} ספרים. הוסיפו עוד ${b} ספרים. כמה ספרים יש עכשיו על המדף?`,
  (a, b) => `בגינה פרחו ${a} פרחים אדומים ו־${b} פרחים צהובים. כמה פרחים פרחו בגינה?`,
  (a, b) => `בשבוע הראשון נאספו ${a} בקבוקים למחזור, ובשבוע השני עוד ${b}. כמה בקבוקים נאספו בשני השבועות?`,
  (a, b) => `באוטובוס ישבו ${a} נוסעים. בתחנה עלו עוד ${b} נוסעים. כמה נוסעים יש באוטובוס?`,
  (a, b) => `בקופסה יש ${a} חרוזים כחולים ו־${b} חרוזים ירוקים. כמה חרוזים יש בקופסה?`,
]
const WORD_SUB = [
  (a, b) => `בקופסה היו ${a} עפרונות. הוציאו ממנה ${b} עפרונות. כמה עפרונות נשארו בקופסה?`,
  (a, b) => `בספרייה היו ${a} ספרים על המדף. ${b} ספרים הושאלו. כמה ספרים נשארו על המדף?`,
  (a, b) => `בחנות היו ${a} בלונים. נמכרו ${b} בלונים. כמה בלונים נשארו?`,
  (a, b) => `בגן היו ${a} ילדים. ${b} ילדים חזרו הביתה. כמה ילדים נשארו בגן?`,
  (a, b) => `בעץ היו ${a} תפוחים. נקטפו ${b} תפוחים. כמה תפוחים נשארו בעץ?`,
  (a, b) => `לאספן יש ${a} מדבקות. הוא נתן לחבר ${b} מדבקות. כמה מדבקות נשארו לאספן?`,
]
const wordProblem = (r) => {
  if (r() < 0.5) {
    const a = int(r, 12, 59), b = int(r, 12, 99 - a), t = int(r, 0, WORD_ADD.length - 1)
    return { kind: 'wordAdd', args: { a, b }, text: WORD_ADD[t](a, b), answer: String(a + b), key: `wa${a}.${b}` }
  }
  const a = int(r, 41, 99), b = int(r, 12, a - 11), t = int(r, 0, WORD_SUB.length - 1)
  return { kind: 'wordSub', args: { a, b }, text: WORD_SUB[t](a, b), answer: String(a - b), key: `ws${a}.${b}` }
}

const times = (n) => (r) => {
  const a = int(r, 1, 10)
  return { kind: 'mul', args: { a, n }, text: `${a} × ${n} =`, answer: String(a * n), key: `${a}x${n}` }
}
const repeated = (r) => {
  const groups = int(r, 2, 5), size = int(r, 2, 5)
  const text = `${Array(groups).fill(size).join(' + ')} = ____ , כלומר ${groups} × ${size} = ____`
  return { kind: 'repeated', args: { groups, size }, text, answer: String(groups * size), key: `${groups}r${size}` }
}
const missing = (r) => {
  const n = int(r, 2, 5), x = int(r, 2, 10)
  const text = r() < 0.5 ? `____ × ${n} = ${x * n}` : `${n} × ____ = ${x * n}`
  return { kind: 'missing', args: { n, x }, text, answer: String(x), key: `m${n}.${x}.${text[0]}` }
}

const COIN = [{ v: 1, n: '1 ₪' }, { v: 2, n: '2 ₪' }, { v: 5, n: '5 ₪' }, { v: 10, n: '10 ₪' }]
const coins = (r) => {
  const drop = int(r, 0, COIN.length - 1)
  const picked = COIN.filter((_, i) => i !== drop).sort((x, y) => y.v - x.v)
  const counts = picked.map(() => int(r, 1, 3))
  const parts = picked.map((c, i) => (counts[i] === 1 ? `מטבע של ${c.n}` : `${counts[i]} מטבעות של ${c.n}`))
  const total = picked.reduce((s, c, i) => s + c.v * counts[i], 0)
  const text = `יש לכם ${parts.join(', ')}. כמה שקלים יש בסך הכול?`
  return { kind: 'coins', args: { parts: picked.map((c, i) => [c.v, counts[i]]) }, text, answer: shekel(total), key: text }
}
const agorot = (r) => {
  const tens = int(r, 1, 9), fifties = int(r, 1, 3)
  const text = `${tens} מטבעות של 10 אג׳ ו־${fifties} ${fifties === 1 ? 'מטבע' : 'מטבעות'} של 50 אג׳. כמה אגורות יש בסך הכול?`
  return { kind: 'agorot', args: { tens, fifties }, text, answer: `${tens * 10 + fifties * 50} אג׳`, key: `${tens}.${fifties}` }
}
const ITEMS = ['מחברת', 'עיפרון צבעוני', 'מחק', 'כדור קטן', 'חבילת קלפים', 'סרגל', 'עוגייה גדולה', 'מקל ארטיק']
const shop = (r) => {
  const i = int(r, 0, ITEMS.length - 1)
  let j = int(r, 0, ITEMS.length - 1)
  if (j === i) j = (j + 1) % ITEMS.length
  const a = int(r, 3, 45), b = int(r, 3, 45)
  return { kind: 'shop', args: { a, b }, text: `${ITEMS[i]} עולה ${shekel(a)} ו${ITEMS[j]} עולה ${shekel(b)}. כמה לשלם על שניהם?`, answer: shekel(a + b), key: `${i}.${j}.${a}.${b}` }
}
const change = (r) => {
  const paid = pick(r, [10, 20, 50, 100]), price = int(r, 3, paid - 2)
  return { kind: 'change', args: { paid, price }, text: `שילמתם ${shekel(paid)} על קנייה של ${shekel(price)}. כמה עודף מקבלים?`, answer: shekel(paid - price), key: `${paid}.${price}` }
}
const convert = (r) => {
  if (r() < 0.5) {
    const s = int(r, 1, 9), a = pick(r, [10, 20, 30, 40, 50, 60, 70, 80, 90])
    return { kind: 'toAgorot', args: { s, a }, text: `${s} ₪ ו־${a} אג׳ = ____ אג׳`, answer: `${s * 100 + a} אג׳`, key: `ta${s}.${a}` }
  }
  const s = int(r, 1, 9), a = pick(r, [10, 20, 30, 40, 50, 60, 70, 80, 90])
  return { kind: 'toShekel', args: { total: s * 100 + a }, text: `${s * 100 + a} אג׳ = ____ ₪ ו־____ אג׳`, answer: `${s} ₪ ו־${a} אג׳`, key: `ts${s}.${a}` }
}
const afford = (r) => {
  const have = int(r, 8, 30), a = int(r, 3, 15), b = int(r, 3, 15)
  if (a + b === have) return afford(r)
  return { kind: 'afford', args: { have, a, b }, text: `יש לכם ${shekel(have)}. מחיר הגלידה ${shekel(a)} ומחיר המשקה ${shekel(b)}. האם הכסף מספיק לשניהם?`, answer: a + b <= have ? 'כן' : 'לא', key: `${have}.${a}.${b}` }
}

const hourOnly = (r) => {
  const h = int(r, 1, 12)
  return { kind: 'clockRead', args: { h, m: 0 }, clock: { h, m: 0 }, text: 'איזו שעה מראה השעון?', answer: timeStr(h, 0), key: `h${h}` }
}
const halfOnly = (r) => {
  const h = int(r, 1, 12)
  return { kind: 'clockRead', args: { h, m: 30 }, clock: { h, m: 30 }, text: 'איזו שעה מראה השעון?', answer: timeStr(h, 30), key: `hh${h}` }
}
const drawHands = (r) => {
  const h = int(r, 1, 12), m = pick(r, [0, 30])
  const next = h === 12 ? 1 : h + 1
  const answer = m === 0 ? `הקטן על ${h}, הגדול על 12` : `הקטן בין ${h} ל־${next}, הגדול על 6`
  return { kind: 'clockDraw', args: { h, m }, text: `ציירו מחוגים על השעון: ${timeStr(h, m)}`, blankClock: true, answer, key: `d${h}.${m}` }
}
const plusHalf = (r) => {
  const h = int(r, 1, 12), m = pick(r, [0, 30])
  const nh = m === 0 ? h : (h === 12 ? 1 : h + 1)
  const nm = m === 0 ? 30 : 0
  return { kind: 'plusHalf', args: { h, m }, text: `השעה ${timeStr(h, m)}. מה תהיה השעה בעוד חצי שעה?`, answer: timeStr(nh, nm), key: `p${h}.${m}` }
}
const duration = (r) => {
  const h = int(r, 1, 7), len = int(r, 1, 4), m = pick(r, [0, 30])
  const eh = h + len
  return { kind: 'duration', args: { h, m, len }, text: `התחלנו ב־${timeStr(h, m)} וסיימנו ב־${timeStr(eh, m)}. כמה שעות עברו?`, answer: hourWord(len), key: `u${h}.${m}.${len}` }
}
const earlier = (r) => {
  const h1 = int(r, 1, 11), m1 = pick(r, [0, 30])
  let h2 = int(r, 1, 11), m2 = pick(r, [0, 30])
  if (h1 === h2 && m1 === m2) { m2 = m1 === 0 ? 30 : 0 }
  const v1 = h1 * 60 + m1, v2 = h2 * 60 + m2
  return { kind: 'earlier', args: { h1, m1, h2, m2 }, text: `איזו שעה מוקדמת יותר: ${timeStr(h1, m1)} או ${timeStr(h2, m2)}?`, answer: v1 < v2 ? timeStr(h1, m1) : timeStr(h2, m2), key: `e${h1}.${m1}.${h2}.${m2}` }
}

// ---------- the four sets ----------
export const SETS = [
  {
    id: 'add-sub-100', emoji: '➕', title: 'חיבור וחיסור עד 100', short: 'חיבור וחיסור',
    grades: 'ב׳–ג׳', link: { label: 'חיבור וחיסור לכיתה ב׳', href: '/math/grade-2' },
    intro: 'שישה מצבים של חיבור וחיסור בתחום ה־100: עם המרה ובלי, השלמה למאה ובעיות מילוליות.',
    stations: [
      { id: 'add-plain', emoji: '🧱', name: 'חיבור בלי המרה', goal: 'לחבר עשרות ליחידות בלי לעבור את העשרת הבאה.',
        materials: 'קוביות עשרות ויחידות (או לוח מאה), עיפרון, דף תשובות',
        steps: ['בחרו תרגיל אחד מהדף.', 'בנו את שני המספרים בקוביות: עשרות ויחידות.', 'חברו קודם את העשרות ואחר כך את היחידות.', 'כתבו את התשובה ובדקו עם חבר או חברה.'],
        challenge: 'חברו שלושה מספרים בלי המרה.', gen: add(false) },
      { id: 'add-carry', emoji: '🎒', name: 'חיבור עם המרה', goal: 'לחבר כשהיחידות עוברות את 10 ולהמיר עשר יחידות לעשרת.',
        materials: 'קוביות עשרות ויחידות, טבלת עשרות ויחידות, עיפרון',
        steps: ['בנו את שני המספרים בקוביות.', 'חברו את היחידות. עברתם 10? החליפו עשר יחידות בעשרת אחת.', 'חברו את העשרות וכתבו את הסכום.', 'הסבירו לקבוצה איך המרתם.'],
        challenge: 'מצאו שני מספרים שסכומם 91 וכתבו אותם.', gen: add(true) },
      { id: 'sub-plain', emoji: '✂️', name: 'חיסור בלי פריטה', goal: 'לחסר עשרות מעשרות ויחידות מיחידות.',
        materials: 'קוביות עשרות ויחידות, לוח מאה, עיפרון',
        steps: ['בנו את המספר הגדול בקוביות.', 'הוציאו ממנו את המספר הקטן: קודם עשרות, אחר כך יחידות.', 'ספרו מה נשאר וכתבו.', 'בדקו בחיבור: התשובה ועוד המספר הקטן.'],
        challenge: 'כתבו תרגיל חיסור שהתשובה שלו 25.', gen: sub(false) },
      { id: 'sub-borrow', emoji: '🔓', name: 'חיסור עם פריטה', goal: 'לפרוט עשרת ליחידות כשאין מספיק יחידות לחסר.',
        materials: 'קוביות עשרות ויחידות, טבלת עשרות ויחידות, עיפרון',
        steps: ['בנו את המספר הגדול בקוביות.', 'אין מספיק יחידות? פרטו עשרת אחת לעשר יחידות.', 'הוציאו את המספר הקטן וספרו מה נשאר.', 'בדקו בחיבור וכתבו את התשובה.'],
        challenge: 'הסבירו בעל־פה: למה פורטים עשרת?', gen: sub(true) },
      { id: 'to-100', emoji: '💯', name: 'השלמה ל־100', goal: 'למצוא כמה חסר כדי להגיע למאה.',
        materials: 'לוח מאה, קו מספרים עד 100, עיפרון',
        steps: ['מצאו את המספר על לוח המאה.', 'ספרו קודם לעשרת הקרובה, אחר כך בעשרות עד 100.', 'חברו את הקפיצות וכתבו כמה חסר.', 'בדקו: המספר ועוד התשובה שווה 100?'],
        challenge: 'מצאו חמישה זוגות מספרים שסכומם 100.', gen: toHundred },
      { id: 'word-problems', emoji: '📖', name: 'בעיות מילוליות', goal: 'להחליט אם חיבור או חיסור ולפתור בעיה מהחיים.',
        materials: 'עיפרון, דף תשובות, קוביות או ציור לעזרה',
        steps: ['קראו את הבעיה בקול, כל פעם ילד אחר.', 'הגידו במילים שלכם: מה ידוע ומה שואלים?', 'בחרו פעולה, חיבור או חיסור, וכתבו תרגיל.', 'כתבו את התשובה עם מילה, למשל "נשארו 32 עפרונות".'],
        challenge: 'המציאו בעיה מילולית בעצמכם והחליפו עם קבוצה אחרת.', gen: wordProblem },
    ],
  },
  {
    id: 'first-multiplication', emoji: '✖️', title: 'כפל ראשון: לוח הכפל עד 5', short: 'כפל ראשון',
    grades: 'ב׳–ג׳', link: { label: 'לוח הכפל לכיתה ג׳', href: '/math/grade-3' },
    intro: 'כפל ב־2, ב־3, ב־4 וב־5, כפל כחיבור חוזר וגם הצד ההפוך: מה חסר במכפלה.',
    stations: [
      { id: 'times-2', emoji: '👫', name: 'כפל ב־2: זוגות', goal: 'לשלוט בכפולות של 2 (כמו זוגות וכפל כפול).',
        materials: 'קוביות או כפתורים, עיפרון, דף תשובות',
        steps: ['קחו תרגיל מהדף.', 'סדרו את הקוביות בזוגות וספרו בקפיצות של 2.', 'כתבו את התשובה.', 'בדקו אותה בחיבור: המספר ועוד עצמו.'],
        challenge: 'ספרו בקול עד 20 בקפיצות של 2, בלי להסתכל.', gen: times(2) },
      { id: 'times-3', emoji: '🔺', name: 'כפל ב־3: שלשות', goal: 'לשלוט בכפולות של 3.',
        materials: 'קוביות בשלושות, קו מספרים עד 30, עיפרון',
        steps: ['סדרו קבוצות של 3 קוביות לפי התרגיל.', 'קפצו על קו המספרים בקפיצות של 3.', 'כתבו את התשובה.', 'הגידו את התרגיל המלא בקול: "ארבע פעמים שלוש הן שתים־עשרה".'],
        challenge: 'מצאו את כל הכפולות של 3 עד 30 על לוח המאה וצבעו אותן.', gen: times(3) },
      { id: 'times-4', emoji: '🚗', name: 'כפל ב־4: כפל כפול', goal: 'להבין שכפל ב־4 הוא כפל ב־2 פעמיים.',
        materials: 'קוביות, צורות בקבוצות של 4, עיפרון',
        steps: ['כפלו קודם ב־2 וכתבו את התוצאה בצד.', 'כפלו שוב ב־2 את התוצאה.', 'כתבו את התשובה של הכפל ב־4.', 'בדקו בקפיצות של 4 על קו המספרים.'],
        challenge: 'הסבירו לחבר: למה כפל ב־4 הוא "כפול כפול"?', gen: times(4) },
      { id: 'times-5', emoji: '🖐️', name: 'כפל ב־5: חמישיות', goal: 'לשלוט בכפולות של 5 ולזהות את הדפוס 5, 10, 15…',
        materials: 'לוח מאה, שעון מחוגים, עיפרון',
        steps: ['ספרו בקפיצות של 5 על לוח המאה.', 'שימו לב לספרה האחרונה של כל תשובה.', 'פתרו את התרגיל וכתבו את התשובה.', 'חפשו דפוס: איזה ספרות מופיעות בסוף?'],
        challenge: 'נסחו כלל: איך יודעים שמספר הוא כפולה של 5?', gen: times(5) },
      { id: 'repeated-add', emoji: '🧮', name: 'כפל כחיבור חוזר', goal: 'לחבר בין חיבור חוזר לבין כפל.',
        materials: 'קוביות, ציורים של קבוצות, עיפרון',
        steps: ['קראו את החיבור החוזר.', 'סדרו אותו בקוביות: כמה קבוצות וכמה בכל קבוצה?', 'חברו וכתבו את הסכום.', 'כתבו את אותו דבר כתרגיל כפל.'],
        challenge: 'ציירו שלוש קבוצות של 5 והסבירו מה כתוב בתרגיל.', gen: repeated },
      { id: 'missing-factor', emoji: '🕵️', name: 'מה חסר?', goal: 'להשלים מספר חסר בתרגיל כפל (הכנה לחילוק).',
        materials: 'קוביות, לוח מאה, עיפרון',
        steps: ['קראו את התרגיל וגלו מה חסר.', 'שאלו: כמה קבוצות של המספר נותנות את התוצאה?', 'נסו בקוביות או בקפיצות על הלוח.', 'כתבו את המספר החסר ובדקו בכפל.'],
        challenge: 'כתבו שני תרגילי "מה חסר" ובקשו מחבר לפתור.', gen: missing },
    ],
  },
  {
    id: 'money', emoji: '💰', title: 'כסף: שקלים ואגורות', short: 'כסף',
    grades: 'ב׳–ג׳', link: { label: 'חשבון לכיתה ב׳', href: '/math/grade-2' },
    intro: 'ספירת מטבעות, שקלים ואגורות, קניות, עודף והמרה בין שקל לאגורות.',
    stations: [
      { id: 'count-coins', emoji: '🪙', name: 'ספירת מטבעות', goal: 'לספור מטבעות של שקלים ולמצוא סכום.',
        materials: 'מטבעות מלאכותיים (או מגזרות נייר) של 1, 2, 5 ו־10 ₪',
        steps: ['סדרו את המטבעות לפי התרגיל.', 'ספרו קודם את הגדולים ואחר כך את הקטנים.', 'כתבו את הסכום בשקלים.', 'ספרו שוב בסדר אחר ובדקו שיצא אותו דבר.'],
        challenge: 'הרכיבו 27 ₪ בכמה שפחות מטבעות.', gen: coins },
      { id: 'count-agorot', emoji: '🔟', name: 'ספירת אגורות', goal: 'לספור מטבעות של 10 ו־50 אגורות.',
        materials: 'מטבעות מלאכותיים של 10 אג׳ ו־50 אג׳',
        steps: ['סדרו את המטבעות לפי התרגיל.', 'ספרו את מטבעות ה־50 אג׳ ואחר כך את ה־10 אג׳.', 'כתבו את הסכום באגורות.', 'כמה מטבעות של 50 אג׳ שווים שקל אחד?'],
        challenge: 'כמה מטבעות של 10 אג׳ שווים 2 ₪? כתבו והסבירו.', gen: agorot },
      { id: 'shop', emoji: '🛍️', name: 'חנות: כמה לשלם?', goal: 'לחבר מחירים ולדעת כמה כסף צריך.',
        materials: 'כרטיסי מחירים, מטבעות מלאכותיים, עיפרון',
        steps: ['קראו את המחירים בתרגיל.', 'חברו את שני המחירים.', 'שלמו בעזרת מטבעות מלאכותיים את הסכום המדויק.', 'כתבו את הסכום.'],
        challenge: 'כמה עולים שלושה פריטים ביחד? בחרו מחירים מהחנות.', gen: shop },
      { id: 'change', emoji: '🧾', name: 'עודף', goal: 'לחשב כמה עודף מקבלים.',
        materials: 'מטבעות ושטרות מלאכותיים, כרטיסי מחירים',
        steps: ['שימו את סכום התשלום ואת המחיר.', 'ספרו קדימה מהמחיר עד הסכום ששולם, כמו מוכר בחנות.', 'כתבו את העודף.', 'בדקו: המחיר ועוד העודף שווה לתשלום?'],
        challenge: 'שחקו מוכר וקונה: אחד משלם והשני מחזיר עודף.', gen: change },
      { id: 'convert', emoji: '🔄', name: 'שקלים ואגורות', goal: 'להמיר בין שקלים לאגורות ולהפך.',
        materials: 'מטבעות מלאכותיים, טבלת המרה (100 אג׳ = 1 ₪)',
        steps: ['זכרו: שקל אחד הוא 100 אגורות.', 'פרקו כל שקל ל־100 אגורות, או אספו 100 אגורות לשקל.', 'השלימו את התרגיל.', 'בדקו עם מטבעות.'],
        challenge: 'כתבו שלושה סכומים שונים ששווים 3 ₪ ו־50 אג׳.', gen: convert },
      { id: 'enough', emoji: '🤔', name: 'מספיק או לא?', goal: 'להשוות סכום כסף למחיר ולהחליט.',
        materials: 'מטבעות מלאכותיים, כרטיסי מחירים, עיפרון',
        steps: ['חברו את שני המחירים.', 'השוו אותם לסכום שיש לכם.', 'כתבו כן או לא.', 'אם לא מספיק: כמה חסר? כתבו בצד.'],
        challenge: 'מה אפשר לקנות ב־20 ₪? כתבו שתי אפשרויות.', gen: afford },
    ],
  },
  {
    id: 'clock', emoji: '🕐', title: 'שעון: שעות וחצאי שעות', short: 'שעון',
    grades: 'ב׳–ג׳', link: { label: 'מדידת זמן לכיתה ב׳', href: '/math/grade-2' },
    intro: 'קריאת שעון בשעות שלמות ובחצאי שעות, ציור מחוגים, חישוב זמן ומשך.',
    stations: [
      { id: 'whole-hour', emoji: '🕑', name: 'שעות שלמות', goal: 'לקרוא שעון מחוגים בשעה שלמה.',
        materials: 'שעון מחוגים לימודי, עיפרון, דף תשובות',
        steps: ['הסתכלו על השעון בדף.', 'המחוג הגדול על 12? זו שעה שלמה.', 'הסתכלו לאן מצביע המחוג הקטן.', 'כתבו את השעה, למשל 4:00.'],
        challenge: 'סדרו את המחוגים בשעון הלימודי לפי שעה שהחבר אומר.', gen: hourOnly, clock: true },
      { id: 'half-hour', emoji: '🕧', name: 'חצאי שעות', goal: 'לקרוא שעון בחצי שעה.',
        materials: 'שעון מחוגים לימודי, עיפרון, דף תשובות',
        steps: ['המחוג הגדול על 6? זו חצי שעה.', 'המחוג הקטן נמצא בין שני מספרים. קחו את המספר הקטן יותר.', 'כתבו את השעה, למשל 4:30.', 'הגידו בקול את השעה, למשל "ארבע וחצי".'],
        challenge: 'כתבו שלוש שעות של חצי שעה ובקשו מחבר לצייר אותן.', gen: halfOnly, clock: true },
      { id: 'draw-hands', emoji: '✏️', name: 'מציירים מחוגים', goal: 'לצייר מחוגים לפי שעה דיגיטלית.',
        materials: 'עפרונות בשני צבעים, סרגל, דף תשובות',
        steps: ['קראו את השעה הכתובה.', 'ציירו את המחוג הגדול: על 12 לשעה שלמה, על 6 לחצי שעה.', 'ציירו את המחוג הקטן, והקפידו שיהיה קצר מהגדול.', 'השוו לשעון הלימודי.'],
        challenge: 'הסבירו מה ההבדל בין המחוג הקטן לגדול.', gen: drawHands },
      { id: 'in-half-hour', emoji: '⏩', name: 'עוד חצי שעה', goal: 'לדעת מה השעה בעוד חצי שעה.',
        materials: 'שעון מחוגים לימודי, קו זמן, עיפרון',
        steps: ['הציבו את השעון הלימודי על השעה הנתונה.', 'הזיזו את המחוג הגדול חצי סיבוב.', 'קראו את השעה החדשה.', 'כתבו אותה.'],
        challenge: 'מה השעה בעוד שעה וחצי? בחרו שעה והסבירו.', gen: plusHalf },
      { id: 'duration', emoji: '⏳', name: 'כמה זמן עבר?', goal: 'לחשב משך זמן בשעות שלמות.',
        materials: 'קו זמן, שעון מחוגים לימודי, עיפרון',
        steps: ['סמנו את שעת ההתחלה על קו הזמן.', 'קפצו שעה אחר שעה עד שעת הסיום.', 'ספרו את הקפיצות.', 'כתבו כמה שעות עברו.'],
        challenge: 'כמה שעות אתם בבית הספר? בדקו בלוח השעות.', gen: duration },
      { id: 'earlier', emoji: '🌅', name: 'מוקדם או מאוחר?', goal: 'להשוות שעות ולדעת איזו מוקדמת יותר.',
        materials: 'כרטיסי שעות, שעון לימודי, עיפרון',
        steps: ['קראו את שתי השעות.', 'דמיינו את השעון ביום: מי קודם?', 'כתבו את השעה המוקדמת.', 'סדרו את הכרטיסים משעה מוקדמת למאוחרת.'],
        challenge: 'סדרו שש שעות שונות מהמוקדמת למאוחרת.', gen: earlier },
    ],
  },
]

export const GROUP_NAMES = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳']
export const ROUNDS = 6

// Group g (0-based) is at station (g + round) mod 6 in round `round` (0-based): a full rotation
export function stationFor(group, round, stations = 6) {
  return (group + round) % stations
}

export function exercisesFor(station, seed) {
  const salt = station.id.split('').reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 7)
  return unique((seed * 7919 + salt) >>> 0, SHEET_SIZE, station.gen)
}

export const TEACHER_TIPS = [
  { title: 'זמנים', items: [
    'כ־8 עד 10 דקות בכל תחנה, ועוד דקה למעבר. שש תחנות מתאימות לשיעור כפול, או לשני שיעורים של שלוש תחנות.',
    'הניחו שעון חול או טיימר גדול לעין כולם, ותנו התראה של דקה לפני סוף הסבב.',
    'בסוף הסבב הקבוצות מחליפות תחנה לפי טבלת הסבב, ולא לפי חשק הקבוצה.',
  ] },
  { title: 'ניהול רעש', items: [
    'מינו בכל קבוצה תפקידים: מנהל זמן, שומר קול (ילד שמזכיר לדבר בלחש), אחראי חומרים ומתעד שכותב על הדף.',
    'סכמו מראש: קול בגובה של שיחה בשולחן. מי שמרים את הקול מקבל כרטיס אזהרה, ולא עוצרים את כל הכיתה.',
    'פזרו את התחנות בחדר כך שתחנות שדורשות ריכוז, כמו הבעיות המילוליות, יהיו רחוקות מתחנות עם הרבה תנועה.',
  ] },
  { title: 'הבחנה בין תלמידים', items: [
    'בכל כרטיס יש שורת אתגר לקבוצות שסיימו מוקדם, ושורת המטרה מאפשרת לילדים שזקוקים לעזרה להבין מה מחפשים.',
    'לתלמידים מתקשים: חומרים מוחשיים בכל תרגיל, ופתרון תרגיל אחד לפני שמתחילים את הדף.',
    'הרכיבו קבוצות הטרוגניות, ובכל סבב החליפו את תפקיד המתעד כדי שכולם יכתבו.',
    'אפשר לתת לכל קבוצה "דף אחר", כי התרגילים נוצרים מחדש בכל לחיצה על "תרגילים חדשים".',
  ] },
  { title: 'סיכום', items: [
    'שתי דקות בסוף: קבוצה אחת מציגה פתרון שמצאה והכיתה מגיבה. בחרו תרגיל שבו טעו יותר.',
    'אספו את דפי הקבוצה, בדקו עם מפתח התשובות שבדף למורה והחזירו עם הערה אחת.',
  ] },
]

export const FAQ = [
  { q: 'מה זה מרכזי למידה (תחנות) בחשבון?', a: 'שיטה שבה הכיתה מתחלקת לקבוצות קטנות והקבוצות עוברות בין תחנות. בכל תחנה עושים משימה קצרה סביב נושא אחד, עם חומרים ביד ודף תשובות לקבוצה. כך כל הילדים פעילים ואפשר לעבוד בקבוצות קטנות.' },
  { q: 'כמה זמן כל תחנה לוקחת?', a: 'כ־8 עד 10 דקות לתחנה. שש תחנות עם מעברים לוקחות כשעה עד שעה וחצי, אפשר גם לחלק לשני שיעורים עם שלוש תחנות בכל אחד.' },
  { q: 'אפשר להדפיס רק חלק מהחומרים?', a: 'כן. אפשר להדפיס רק את כרטיסי התחנות, רק את דפי התשובות או רק את טבלת הסבב. בכל הדפסה אפשר לבחור כמה עותקים, ולקבל תרגילים חדשים לכל קבוצה.' },
  { q: 'לאיזה גיל זה מתאים?', a: 'החומרים בנויים לכיתות ב׳ וג׳. החומרים הם הצעה לעבודה בכיתה, והמורה מתאימה אותם לתוכנית ולרמת הכיתה.' },
  { q: 'איך מתמודדים עם 6 קבוצות אם יש בכיתה פחות ילדים?', a: 'אפשר לעבוד עם פחות קבוצות ולהשמיט תחנות, או לשים שתי קבוצות בתחנה בזמן מוקצר. טבלת הסבב מתאימה לשש קבוצות, ובמקרה של פחות קבוצות פשוט מסמנים קו על השורות שלא בשימוש.' },
]
