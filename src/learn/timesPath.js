// Times-table path game (/learn/multiplication-game): stages, question generator, stars, hints.
// Pure functions only, so tests can import this file without React.

export const PATH_URL = '/learn/multiplication-game'
export const PER_STAGE = 10
export const SHEET_COUNT = 30

// Learning order: the easy tables first (1, 2, 10, 5), then 3, 4, 9, then 6, 8, 7 — with a review
// stage after each group and one big mixed challenge at the end.
const ORDER = [
  [1], [2], [10], [5], 'r1',
  [3], [4], [9], 'r2',
  [6], [8], [7], 'r3',
  'all',
]
const REVIEWS = {
  r1: { tables: [1, 2, 10, 5], title: 'חזרה: 1, 2, 5 ו-10', emoji: '🏕️' },
  r2: { tables: [3, 4, 9], title: 'חזרה: 3, 4 ו-9', emoji: '⛺' },
  r3: { tables: [6, 7, 8], title: 'חזרה: 6, 7 ו-8', emoji: '🏰' },
  all: { tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], title: 'האתגר הגדול: כל הלוחות', emoji: '🏆' },
}
export const STAGES = ORDER.map((x, i) => {
  if (Array.isArray(x)) return { id: `t${x[0]}`, index: i, tables: x, review: false, title: `הלוח של ${x[0]}`, label: String(x[0]) }
  const r = REVIEWS[x]
  return { id: x, index: i, tables: r.tables, review: true, title: r.title, label: r.emoji }
})
export const stageById = id => STAGES.find(s => s.id === id) || null

// Small seeded generator (mulberry32) so a sheet or a stage can be rebuilt from its seed.
export function rng(seed) {
  let a = (seed >>> 0) || 1
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export function shuffle(list, rand) {
  const x = [...list]
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1));[x[i], x[j]] = [x[j], x[i]] }
  return x
}

const fact = (a, b) => ({ a, b, v: a * b })
const pairKey = (a, b) => (a < b ? `${a}x${b}` : `${b}x${a}`)

// One stage = PER_STAGE questions.
// Single table n: every fact n×1 … n×10 exactly once, shuffled, and n sometimes first, sometimes second.
// Review: distinct facts (3×8 and 8×3 count as the same) drawn from the stage tables × 1…10.
export function stageQuestions(stage, seed) {
  const rand = rng(seed)
  const flip = (t, k) => (rand() < 0.5 ? fact(t, k) : fact(k, t))
  if (!stage.review) {
    const n = stage.tables[0]
    return shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], rand).map(k => flip(n, k))
  }
  const pool = []
  const seen = new Set()
  for (const t of stage.tables) for (let k = 1; k <= 10; k++) {
    const key = pairKey(t, k)
    if (seen.has(key)) continue
    seen.add(key); pool.push([t, k])
  }
  // Skip the "×1" freebies in reviews when there is enough else to ask.
  const real = pool.filter(([t, k]) => t !== 1 && k !== 1)
  return shuffle(real.length >= PER_STAGE ? real : pool, rand).slice(0, PER_STAGE).map(([t, k]) => flip(t, k))
}

// Printable practice sheet: SHEET_COUNT facts from the given tables, no fact twice in a row,
// every table of the stage represented as evenly as possible.
export function sheetQuestions(tables, seed, count = SHEET_COUNT) {
  const rand = rng(seed)
  const out = []
  let last = ''
  let order = []
  while (out.length < count) {
    if (!order.length) order = shuffle(tables.flatMap(t => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(k => [t, k])), rand)
    const [t, k] = order.pop()
    const f = rand() < 0.5 ? fact(t, k) : fact(k, t)
    const key = `${f.a}x${f.b}`
    if (key === last && order.length) { order.unshift([t, k]); continue }
    last = key; out.push(f)
  }
  return out
}

// Stars from first-try answers: 10/10 → 3, 8–9 → 2, 6–7 → 1, less → 0 (stage not passed yet).
export function starsFor(right, total = PER_STAGE) {
  const r = right / total
  if (r >= 1) return 3
  if (r >= 0.8) return 2
  if (r >= 0.6) return 1
  return 0
}
export const PASS_STARS = 1

// A stage opens once the one before it earned at least one star.
export function unlockedCount(progress) {
  let n = 1
  for (const s of STAGES) { if ((progress[s.id] || 0) >= PASS_STARS && n < STAGES.length) n = s.index + 2; else break }
  return Math.min(n, STAGES.length)
}
export const totalStars = progress => STAGES.reduce((sum, s) => sum + (progress[s.id] || 0), 0)
export const MAX_STARS = STAGES.length * 3

// Keep only known stages and stars 0–3 (localStorage may hold anything).
export function cleanProgress(raw) {
  const out = {}
  if (!raw || typeof raw !== 'object') return out
  for (const s of STAGES) { const v = Number(raw[s.id]); if (Number.isInteger(v) && v >= 1 && v <= 3) out[s.id] = v }
  return out
}
// Best result wins: replaying a stage never lowers its stars.
export const recordStars = (progress, id, stars) => (stars > (progress[id] || 0) ? { ...progress, [id]: stars } : progress)

// A short way to work the fact out, shown after a wrong answer. `eq` is an LTR equation string.
export function hintFor(a, b) {
  const v = a * b, s = Math.min(a, b), g = Math.max(a, b)
  if (s === 1) return { text: 'כל מספר כפול 1 נשאר אותו מספר.', eq: `${a} × ${b} = ${v}` }
  if (g === 10) return { text: 'כפול 10 — מוסיפים אפס בסוף המספר.', eq: `${s} × 10 = ${v}` }
  if (s === 2) return { text: 'כפול 2 — כפליים: מחברים את המספר לעצמו.', eq: `${g} + ${g} = ${v}` }
  if (s === 5) return { text: `כפול 5 — חצי מכפול 10: ${g} × 10 = ${g * 10}, והחצי של ${g * 10}:`, eq: `${g * 10} ÷ 2 = ${v}` }
  if (g === 5) return { text: `כפול 5 — חצי מכפול 10: ${s} × 10 = ${s * 10}, והחצי של ${s * 10}:`, eq: `${s * 10} ÷ 2 = ${v}` }
  if (g === 9) return { text: `כפול 9 — כפול 10 ומורידים פעם אחת את ${s}:`, eq: `${s * 10} − ${s} = ${v}` }
  if (s <= 4) return { text: `מחברים את ${g} ${s === 3 ? 'שלוש' : 'ארבע'} פעמים:`, eq: `${Array(s).fill(g).join(' + ')} = ${v}` }
  // 6, 7, 8 with each other: 5 times, and then the rest.
  return { text: `מפרקים: 5 פעמים ${g}, ועוד ${s - 5} ${s - 5 === 1 ? 'פעם' : 'פעמים'} ${g}:`, eq: `${5 * g} + ${(s - 5) * g} = ${v}` }
}

export const PATH_FAQ = [
  { q: 'איך משחקים במשחק לוח הכפל?', a: 'בוחרים את השלב הפתוח הבא במסלול ופותרים 10 תרגילים. אחרי כל תשובה רואים מיד אם צדקתם, ובטעות מופיעה התשובה הנכונה עם דרך קצרה לחשב אותה. בסוף השלב מקבלים עד שלושה כוכבים, ומשלב עם כוכב אחד לפחות נפתח השלב הבא.' },
  { q: 'איך מקבלים שלושה כוכבים?', a: 'הכוכבים נקבעים לפי התשובות שנכונות בניסיון הראשון: 10 מתוך 10 — שלושה כוכבים, 8 או 9 — שניים, 6 או 7 — כוכב אחד. תרגיל שטעיתם בו חוזר בסוף השלב כדי לתרגל אותו שוב, אבל לא משנה את הניקוד. אפשר לשחק בכל שלב שוב ושוב, ונשמרת התוצאה הטובה ביותר.' },
  { q: 'למה המסלול לא הולך לפי הסדר 1, 2, 3?', a: 'המסלול מתחיל בלוחות שהכי קל לזכור — 1, 2, 10 ו-5 — וממשיך ל-3, 4 ו-9, ורק בסוף מגיע ל-6, 8 ו-7. כך כל שלב חדש נשען על מה שכבר יודעים, ובזכות חוק החילוף (3×8 = 8×3) בלוחות האחרונים נשארים מעט תרגילים חדשים באמת. אחרי כל קבוצה יש שלב חזרה שמערבב את הלוחות.' },
  { q: 'איפה נשמרת ההתקדמות?', a: 'הכוכבים נשמרים בדפדפן של המכשיר שבו משחקים, בלי הרשמה. במכשיר אחר, בגלישה בסתר או אחרי ניקוי נתוני הגלישה המסלול מתחיל מההתחלה. מורים והורים יכולים ללחוץ על "פתיחת כל השלבים" כדי לקפוץ ישר ללוח מסוים.' },
  { q: 'אפשר להדפיס דף תרגול לוח הכפל?', a: 'כן. לכל שלב יש דף תרגול בגודל A4 עם 30 תרגילים מהלוחות של אותו שלב, ועמוד תשובות נפרד לבדיקה. בכל לחיצה על "תרגילים אחרים" מתקבל דף חדש, ואפשר להדפיס כמה עותקים שונים בבת אחת.' },
]
