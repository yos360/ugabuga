// Data and pure helpers for /math/mixed-numbers (mixed numbers and improper fractions, grades 4–5).
// Everything here is plain JS so tests/mixed-numbers.test.mjs can check it without a browser.
import { createRng } from '../math/rng.js'

export function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1 }

// w n/d → (w·d + n)/d
export function toImproper(w, n, d) { return { n: w * d + n, d } }

// n/d → whole part and remainder over the same denominator (no simplifying: that is a separate step).
export function toMixed(n, d) { return { w: Math.floor(n / d), r: n % d, d } }

// Text forms used in explanations and the printable answer key (always left to right).
export function mixedText(w, r, d) { return r === 0 ? `${w}` : w === 0 ? `${r}/${d}` : `${w} ${r}/${d}` }

export const LEVELS = [
  { id: 'easy', label: '🟢 קל', note: 'מכנים ⁦2–5⁩, עד 3 שלמים', dens: [2, 3, 4, 5], maxW: 3 },
  { id: 'mid', label: '🟡 בינוני', note: 'מכנים עד 8', dens: [2, 3, 4, 5, 6, 8], maxW: 5 },
  { id: 'hard', label: '🔴 מאתגר', note: 'מכנים עד 12, גם שלמים בלי שארית', dens: [3, 4, 5, 6, 7, 8, 9, 10, 12], maxW: 9 },
]

export const KINDS = {
  toImproper: 'כתבו כשבר מדומה',
  toMixed: 'כתבו כמספר מעורב',
  picture: 'איזה מספר מעורב מצויר כאן?',
}

// One question. `kind` is 'toImproper', 'toMixed' or 'picture'.
// The answer is always stored as { w, r, d } (mixed) and { n, d } (improper) so both forms can be shown.
export function makeQuestion(rng, levelId, kind) {
  const level = LEVELS.find(l => l.id === levelId) || LEVELS[0]
  const d = rng.pick(level.dens)
  const w = rng.int(1, kind === 'picture' ? Math.min(level.maxW, 3) : level.maxW)
  // On the hard level a toMixed question sometimes divides exactly (12/4 = 3), a classic trap.
  const exact = levelId === 'hard' && kind === 'toMixed' && rng.bool(0.25)
  const r = exact ? 0 : rng.int(1, d - 1)
  const imp = toImproper(w, r, d)
  return { kind, w, r, d, n: imp.n, key: `${kind}:${w}:${r}:${d}` }
}

// A set of distinct questions mixing the three kinds, reproducible from a seed (for print + answers).
export function buildSet(seed, levelId, count = 10, kinds = ['toImproper', 'toMixed', 'picture']) {
  const rng = createRng(seed), out = [], seen = new Set()
  for (let guard = 0; out.length < count && guard < 500; guard++) {
    const q = makeQuestion(rng, levelId, kinds[out.length % kinds.length])
    if (seen.has(`${q.w}:${q.r}:${q.d}`)) continue
    seen.add(`${q.w}:${q.r}:${q.d}`)
    out.push(q)
  }
  return out
}

// Check a typed answer. For toImproper only the numerator is asked (the denominator is given).
// For toMixed/picture the whole part and the numerator are asked; an empty numerator counts as 0.
export function checkAnswer(q, input) {
  const num = s => (String(s ?? '').trim() === '' ? NaN : Number(String(s).trim()))
  if (q.kind === 'toImproper') return num(input.n) === q.n
  const w = num(input.w), r = String(input.r ?? '').trim() === '' ? 0 : num(input.r)
  return w === q.w && r === q.r
}

// Equations inside Hebrew sentences are wrapped in LTR isolates (U+2066…U+2069) so they read left to right.
const ltr = s => `⁦${s}⁩`

export function explain(q) {
  const { w, r, d, n } = q
  if (q.kind === 'toImproper') return `כל שלם הוא ${ltr(`${d}/${d}`)}, אז ${w} שלמים הם ${ltr(`${w} × ${d} = ${w * d}`)} חלקים. מוסיפים את ${r} החלקים: ${ltr(`${w * d} + ${r} = ${n}`)}. התשובה: ${ltr(`${n}/${d}`)}.`
  if (q.kind === 'toMixed') return r === 0
    ? `${ltr(`${n} ÷ ${d} = ${w}`)} בדיוק, בלי שארית — אז ${ltr(`${n}/${d}`)} הוא המספר השלם ${w}.`
    : `${ltr(`${n} ÷ ${d} = ${w}`)} ושארית ${r}. המנה היא מספר השלמים, והשארית היא המונה: ${ltr(mixedText(w, r, d))}.`
  return `יש ${w} ${w === 1 ? 'עיגול שלם' : 'עיגולים שלמים'}, ובעיגול האחרון צבועים ${r} חלקים מתוך ${d}. ביחד: ${ltr(mixedText(w, r, d))}, שהם גם ${ltr(`${n}/${d}`)}.`
}

export const TEACH_STEPS = [
  { emoji: '🍕', title: 'מתחילים מפיצות, לא מכללים', text: 'שואלים "כמה רבעים יש בשתי פיצות ועוד רבע?" ונותנים לספור משולשים. רק אחרי כמה ספירות כאלה מגלים יחד את הקיצור: כופלים את השלמים במכנה ומוסיפים את המונה.' },
  { emoji: '➗', title: 'חילוק עם שארית כבר מוכר', text: 'המעבר משבר מדומה למספר מעורב הוא בדיוק חילוק עם שארית מכיתה ג׳: המנה היא השלמים והשארית היא המונה. כדאי להגיד את זה במפורש, כי ילדים לא תמיד מחברים בעצמם.' },
  { emoji: '📏', title: 'ישר המספרים', text: 'מסמנים על ישר המספרים את 1, 2, 3 ומחלקים כל קטע לשלישים. מגלים ש־7/3 נמצא בין 2 ל־3, קרוב יותר ל־2. כך רואים שהשבר המדומה והמספר המעורב הם אותה נקודה.' },
  { emoji: '🔁', title: 'תמיד בודקים הלוך וחזור', text: 'אחרי כל המרה ממירים בחזרה. אם 2 3/4 הפך ל־11/4, אז 11 ÷ 4 צריך לתת 2 ושארית 3. הבדיקה הזאת תופסת כמעט כל טעות חישוב.' },
]

export const MISTAKES = [
  { title: 'מכפילים את השלם במונה במקום במכנה', text: 'ב־2 3/4 כותבים (2 × 3 + 4)/4 = 10/4. מזכירים שכל שלם הוא ארבעה רבעים, ולכן השלם מוכפל במספר החלקים בשלם — במכנה.' },
  { title: 'משנים גם את המכנה', text: 'כותבים 11/8 במקום 11/4, כי "השלמים נכנסו פנימה". גודל החלקים לא השתנה: אלה עדיין רבעים, ולכן המכנה נשאר 4.' },
  { title: 'שוכחים לחבר את המונה', text: '2 3/4 הופך ל־8/4. זה בדיוק שתי פיצות, בלי שלושת הרבעים הנוספים. ציור קטן ליד התרגיל מונע את זה.' },
  { title: 'שבר שווה ל־1 נשאר בתוך המספר המעורב', text: 'כותבים 2 4/4 או 1 5/5. כשהמונה שווה למכנה זה עוד שלם: 2 4/4 = 3. וכששארית החילוק היא 0 התשובה היא מספר שלם, כמו 12/4 = 3.' },
]

export const FAQ = [
  { q: 'מה זה מספר מעורב?', a: 'מספר מעורב הוא מספר שלם ושבר שכתובים יחד, למשל 2 3/4 (שתיים ושלושה רבעים). הוא אומר שיש שני שלמים ועוד שלושה רבעים של שלם נוסף.' },
  { q: 'מה זה שבר מדומה?', a: 'שבר מדומה הוא שבר שהמונה שלו גדול מהמכנה או שווה לו, כמו 11/4 או 5/5. הוא "מדומה" כי הוא נראה כמו חלק משלם, אבל בעצם הוא שלם אחד או יותר. כל שבר מדומה אפשר לכתוב כמספר מעורב או כמספר שלם.' },
  { q: 'איך הופכים מספר מעורב לשבר מדומה?', a: 'כופלים את השלם במכנה ומוסיפים את המונה. התוצאה היא המונה החדש, והמכנה נשאר אותו דבר. למשל 2 3/4: 2 × 4 = 8, ועוד 3 הם 11, ולכן 2 3/4 = 11/4.' },
  { q: 'איך הופכים שבר מדומה למספר מעורב?', a: 'מחלקים את המונה במכנה. המנה היא מספר השלמים, השארית היא המונה החדש, והמכנה נשאר. למשל 17/5: 17 ÷ 5 = 3 ושארית 2, ולכן 17/5 = 3 2/5. אם אין שארית, התשובה היא מספר שלם.' },
  { q: 'באיזו כיתה לומדים מספר מעורב?', a: 'מספרים מעורבים מופיעים כבר בכיתה ד׳, בחיבור וחיסור שברים עם מכנה שווה, ובכיתה ה׳ ההמרה הלוך וחזור היא חלק קבוע מחיבור, חיסור וכפל של שברים. הסדר המדויק משתנה בין ספרי הלימוד.' },
  { q: 'יש כאן דף עבודה להדפסה?', a: 'כן. בלחיצה על "דף עבודה להדפסה" נפתח דף עם 15 תרגילים — המרה לשבר מדומה, המרה למספר מעורב וזיהוי מציור — ודף תשובות. "סט אחר" מייצר תרגילים חדשים, ואפשר לבחור רמת קושי.' },
]

export const MORE_LINKS = [
  { label: '🍕 שברים לכיתות ד׳–ה׳: איך מלמדים', href: '/math/fractions' },
  { label: 'חיבור וחיסור שברים עם מכנה שווה (ד׳)', href: '/math/grade-4/add-subtract-like-fractions' },
  { label: 'חיבור וחיסור עם מכנים שונים (ה׳)', href: '/math/grade-5/add-subtract-unlike-fractions' },
  { label: 'כפל שבר במספר שלם (ה׳)', href: '/math/grade-5/fraction-times-whole' },
  { label: 'דפי עבודה בשברים עם ציורים', href: '/printables/fractions-worksheets' },
  { label: 'מחשבון שברים', href: '/tools/fraction-calculator' },
]
