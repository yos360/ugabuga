// Hanukkah word problems at each grade's math level, built on the site's seeded math helpers
// (createRng + the gendered kids list from src/math). Same seed → same sheet, so a print and its
// answer key always match; a new seed gives a new sheet (one per child in "print for the class").
import { createRng } from '../math/rng.js'
import { KIDS, twoKids, g } from '../math/gen.js'

const NIGHT = ['', 'הראשון', 'השני', 'השלישי', 'הרביעי', 'החמישי', 'השישי', 'השביעי', 'השמיני']
const tri = n => n * (n + 1) / 2
// Numbers as the answer key shows them: at most two decimals, no trailing zeros.
export const num = x => String(Math.round(x * 100) / 100)

// Each template: r → { q, answer }. Answers are computed from the same numbers the question shows.
const T = {
  1: [
    r => { const k = r.pick(KIDS), a = r.int(3, 9), b = r.int(2, 9); return { q: `${k.name} ${g(k, 'אכל', 'אכלה')} ${a} סופגניות ו־${b} לביבות. כמה ${g(k, 'הוא אכל', 'היא אכלה')} בסך הכול?`, answer: a + b } },
    r => { const k = r.pick(KIDS), a = r.int(10, 20), b = r.int(2, a - 3); return { q: `בקופסה היו ${a} נרות. ${k.name} ${g(k, 'הוציא', 'הוציאה')} ${b} נרות לחנוכייה. כמה נרות נשארו בקופסה?`, answer: a - b } },
    r => { const n = r.int(2, 8); return { q: `בערב ${NIGHT[n]} של חנוכה דולקים ${n} נרות ועוד השמש. כמה להבות יש בחנוכייה?`, answer: n + 1 } },
    r => { const k = r.pick(KIDS), a = r.int(3, 10), b = r.int(2, 9); return { q: `ל${k.name} היו ${a} אגוזים. בסביבון יצאה האות ג׳, ו${k.name} ${g(k, 'זכה', 'זכתה')} ב־${b} אגוזים מהקופה. כמה אגוזים יש ל${k.name} עכשיו?`, answer: a + b } },
    r => { const [x, y] = twoKids(r), a = r.int(8, 18), b = r.int(2, a - 2); return { q: `על המגש היו ${a} סופגניות. ${x.name} ו${y.name} אכלו ${b} סופגניות. כמה סופגניות נשארו על המגש?`, answer: a - b } },
    r => { const k = r.pick(KIDS), a = r.int(4, 10), b = r.int(3, 10); return { q: `${k.name} ${g(k, 'צבע', 'צבעה')} ${a} סביבונים בכחול ו־${b} סביבונים בצהוב. כמה סביבונים ${g(k, 'הוא צבע', 'היא צבעה')}?`, answer: a + b } },
  ],
  2: [
    r => { const k = r.pick(KIDS), a = r.int(25, 50), b = r.int(6, 19); return { q: `${k.name} ${g(k, 'קנה', 'קנתה')} קופסה עם ${a} נרות. בערבים הראשונים השתמשו ב־${b} נרות. כמה נרות נשארו בקופסה?`, answer: a - b } },
    r => { const m = r.pick([2, 5, 10]), k = r.int(3, 10); return { q: `בכל מגש יש ${m} סופגניות. כמה סופגניות יש ב־${k} מגשים?`, answer: m * k } },
    r => { const a = r.int(12, 55), b = r.int(11, 99 - a); return { q: `בבוקר מכרה המאפייה ${a} סופגניות, ובצהריים עוד ${b}. כמה סופגניות נמכרו בסך הכול?`, answer: a + b } },
    r => { const k = r.pick(KIDS), p = r.pick([2, 5, 10]), n = r.int(2, 6); return { q: `סופגנייה עולה ${p} שקלים. ${k.name} ${g(k, 'קנה', 'קנתה')} ${n} סופגניות. כמה שקלים ${g(k, 'שילם', 'שילמה')}?`, answer: p * n } },
    r => { const k = r.pick(KIDS), a = r.int(35, 95), b = r.int(12, a - 10); return { q: `ל${k.name} היו ${a} מטבעות שוקולד. ${g(k, 'הוא נתן', 'היא נתנה')} ${b} מטבעות לבני הדודים. כמה מטבעות נשארו ל${k.name}?`, answer: a - b } },
    r => { const n = r.int(3, 5); return { q: `כמה נרות מדליקים בסך הכול ב־${n} הערבים הראשונים של חנוכה, בלי השמש? (בערב הראשון נר אחד, בשני שניים וכן הלאה)`, answer: tri(n) } },
  ],
  3: [
    r => { const k = r.int(3, 9), m = r.int(3, 9); return { q: `${k * m} סופגניות סודרו שווה בשווה על ${k} מגשים. כמה סופגניות יש על כל מגש?`, answer: m } },
    r => { const k = r.int(3, 9), m = r.int(3, 9); return { q: `בכיתה ${k} קבוצות, ולכל קבוצה ${m} סביבונים. כמה סביבונים יש בכיתה?`, answer: k * m } },
    r => { const a = r.int(120, 480), b = r.int(110, 450); return { q: `ביום הראשון של חנוכה מכר הקיוסק ${a} סופגניות, וביום השני ${b}. כמה סופגניות נמכרו בשני הימים?`, answer: a + b } },
    r => { const n = r.int(4, 8); return { q: `כמה נרות מדליקים בסך הכול ב־${n} הערבים הראשונים של חנוכה, בלי השמש?`, answer: tri(n) } },
    r => { const k = r.pick(KIDS), m = r.int(10, 40), d = r.pick([30, 35, 40, 45]); return { q: `${k.name} ${g(k, 'הדליק', 'הדליקה')} נרות בשעה 17:${String(m).padStart(2, '0')}, והם דלקו ${d} דקות. באיזו שעה הם כבו?`, answer: `${17 + Math.floor((m + d) / 60)}:${String((m + d) % 60).padStart(2, '0')}` } },
    r => { const a = r.int(300, 900), b = r.int(100, a - 50); return { q: `במחסן של המאפייה היו ${a} שקיות קמח. לחנוכה השתמשו ב־${b} שקיות. כמה שקיות נשארו?`, answer: a - b } },
  ],
  4: [
    r => { const k = r.int(3, 8), q = r.int(4, 12), rem = r.int(1, k - 1); return { q: `${k * q + rem} מטבעות שוקולד חולקו שווה בשווה בין ${k} ילדים, והשאר נשאר בקופה. כמה מטבעות קיבל כל ילד, וכמה נשארו?`, answer: `${q} לכל ילד, ${rem} נשארו` } },
    r => { const p = r.int(12, 29), n = r.int(12, 25); return { q: `קופסת נרות עולה ${p} שקלים. בית הספר קנה ${n} קופסאות. כמה שקלים שילם בית הספר?`, answer: p * n } },
    r => { const k = r.pick(KIDS), f = r.pick([[2, 'חצי'], [4, 'רבע']]), a = f[0] * r.int(4, 12); return { q: `על המגש של ${k.name} יש ${a} סופגניות. ${f[1]} מהן ממולאות בריבה. כמה סופגניות ריבה יש על המגש?`, answer: a / f[0] } },
    r => { const k = r.pick(KIDS), n = r.int(3, 6), p = r.int(6, 9), bill = n * p > 50 ? 100 : 50; return { q: `${k.name} ${g(k, 'קנה', 'קנתה')} ${n} סופגניות ב־${p} שקלים כל אחת, ו${g(k, 'שילם', 'שילמה')} בשטר של ${bill} שקלים. כמה עודף ${g(k, 'קיבל', 'קיבלה')}?`, answer: bill - n * p } },
    r => { const n = r.int(3, 12); return { q: `בכל חנוכייה מדליקים בכל החג 44 נרות (36 נרות ועוד 8 פעמים השמש). כמה נרות צריך בשביל ${n} חנוכיות?`, answer: 44 * n } },
    r => { const k = r.pick(KIDS), a = r.int(12, 25), b = r.int(8, 15); return { q: `${k.name} ${g(k, 'הכין', 'הכינה')} כרטיס ברכה לחנוכה בצורת מלבן, באורך ${a} ס״מ וברוחב ${b} ס״מ. כמה ס״מ של סרט צריך כדי להקיף את כל הכרטיס?`, answer: 2 * (a + b) } },
  ],
  5: [
    r => { const a = 8 * r.int(3, 9), j = r.pick([3, 5]); return { q: `במאפייה הכינו ${a} סופגניות. ${j}/8 מהן ממולאות בריבה והשאר בשוקולד. כמה סופגניות שוקולד הכינו?`, answer: a - a * j / 8 } },
    r => { const k = r.pick(KIDS), p = r.int(3, 6) + 0.5, n = r.int(3, 8); return { q: `לביבה עולה ${num(p)} שקלים. ${k.name} ${g(k, 'קנה', 'קנתה')} ${n} לביבות. כמה ${g(k, 'שילם', 'שילמה')}?`, answer: num(p * n) } },
    r => { const k = r.pick(KIDS), a = 12 * r.int(2, 5); return { q: `סבתא טיגנה ${a} לביבות. ${k.name} ${g(k, 'אכל', 'אכלה')} רבע מהן, ואחר כך המשפחה אכלה שליש מהלביבות שנשארו. כמה לביבות נשארו בסוף?`, answer: a / 2 } },
    r => { const k = r.pick(KIDS), base = r.int(14, 25), d = [r.int(-3, 3), r.int(-3, 3), r.int(-3, 3), r.int(-3, 3)], v = d.map(x => base + x); v.push(5 * base - v.reduce((s, x) => s + x, 0)); return { q: `בחמשת ימי החופשה ${k.name} ${g(k, 'קרא', 'קראה')} בספר ${v.join(', ')} עמודים. כמה עמודים ${g(k, 'קרא', 'קראה')} בממוצע ביום?`, answer: base } },
    r => { const [x, y] = twoKids(r), a = 2 * r.int(6, 20); return { q: `בקופה של משחק הסביבון היו ${a} אגוזים. ${x.name} ${g(x, 'סובב', 'סובבה')} ויצאה האות ה׳, ולכן ${g(x, 'לקח', 'לקחה')} חצי מהקופה. אחר כך ${y.name} ${g(y, 'סובב', 'סובבה')} ויצאה האות פ׳, ולכן ${g(y, 'הוסיף', 'הוסיפה')} אגוז אחד לקופה. כמה אגוזים יש עכשיו בקופה?`, answer: a / 2 + 1 } },
    r => { const a = r.int(20, 40), b = r.int(15, 30); return { q: `מגש סופגניות מלבני הוא באורך ${a} ס״מ וברוחב ${b} ס״מ. מה שטח המגש בסמ״ר?`, answer: a * b } },
  ],
  6: [
    r => { const p = r.pick([8, 10, 12, 16, 20]), d = r.pick([10, 20, 25, 50]); return { q: `קופסת סופגניות עולה ${p} שקלים. ביום האחרון של חנוכה יש הנחה של ${d}%. כמה עולה הקופסה בהנחה?`, answer: num(p * (100 - d) / 100) } },
    r => { const t = 5 * r.int(6, 20); return { q: `במסיבת החנוכה של הכיתה היו ${t} סופגניות, ריבה ושוקולד ביחס של 2:3. כמה סופגניות שוקולד היו?`, answer: t * 3 / 5 } },
    r => { const n = r.pick([20, 25, 40]), p = r.pick([20, 40, 60, 80]); return { q: `בשכבה ${n} תלמידים. ${p}% מהם הביאו סביבון לטורניר. כמה תלמידים הביאו סביבון?`, answer: n * p / 100 } },
    r => { const a = r.int(4, 10), b = r.int(3, 6), c = r.int(2, 4); return { q: `קופסת נרות היא תיבה שאורכה ${a * 2} ס״מ, רוחבה ${b} ס״מ וגובהה ${c} ס״מ. מה נפח הקופסה בסמ״ק?`, answer: a * 2 * b * c } },
    r => { const a = 100 * r.int(3, 9), p = r.pick([10, 20, 30, 50]); return { q: `בשנה שעברה מכרה המאפייה בחנוכה ${a} סופגניות. השנה היא מכרה ${p}% יותר. כמה סופגניות מכרה השנה?`, answer: a * (100 + p) / 100 } },
    r => { const k = r.int(3, 9); return { q: `בכל חנוכייה מדליקים בכל החג 36 נרות ועוד שמש בכל ערב. בבניין ${k} משפחות, ולכל משפחה חנוכייה אחת. כמה נרות, כולל שמשים, ידליקו בבניין בכל החג?`, answer: 44 * k } },
  ],
  7: [
    r => { const k = r.pick(KIDS), n = r.int(4, 12), p = r.int(5, 12), s = r.pick([10, 15, 20]); return { q: `${k.name} ${g(k, 'הזמין', 'הזמינה')} ${n} סופגניות ו${g(k, 'שילם', 'שילמה')} ${n * p + s} שקלים, כולל משלוח של ${s} שקלים. מה המחיר של סופגנייה אחת? (כתבו משוואה ופתרו)`, answer: p } },
    r => { const n = r.int(9, 15); return { q: `בכל ערב של חנוכה מדליקים נר אחד יותר מבערב הקודם, ועוד שמש. אילו החג היה נמשך ${n} ימים, כמה נרות (כולל השמש) היו מדליקים בסך הכול?`, answer: n * (n + 3) / 2 } },
    r => r.pick([
      { q: 'בסביבון יש ארבע אותיות, וכל אחת יוצאת באותו סיכוי. מה ההסתברות שבשני סיבובים תצא האות ג׳ בשני הסיבובים?', answer: '1/16' },
      { q: 'בסביבון יש ארבע אותיות, וכל אחת יוצאת באותו סיכוי. מה ההסתברות שבסיבוב אחד תצא נ׳ או ה׳?', answer: '1/2' },
      { q: 'בסביבון יש ארבע אותיות, וכל אחת יוצאת באותו סיכוי. מה ההסתברות שבשני סיבובים האות ג׳ תצא לפחות פעם אחת?', answer: '7/16' },
    ]),
    r => { const s = r.int(4, 9), l = r.int(3, 8); return { q: `3 סופגניות ו־2 לביבות עולות יחד ${3 * s + 2 * l} שקלים. סופגנייה אחת ולביבה אחת עולות יחד ${s + l} שקלים. מה המחיר של סופגנייה אחת?`, answer: s } },
    r => { const n = r.pick([4, 6, 8]), gr = 50 * r.int(4, 10) * n / 2, m = r.pick([n * 3, n * 5]); return { q: `במתכון ל־${n} לביבות יש ${gr} גרם תפוחי אדמה. כמה גרם תפוחי אדמה צריך בשביל ${m} לביבות?`, answer: gr / n * m } },
    r => { const y = r.int(2000, 2030); return { q: `בית המקדש נחנך מחדש בשנת 164 לפני הספירה. כמה שנים עברו מאז ועד שנת ${y}? (שימו לב: אין "שנת אפס" — אחרי שנת 1 לפני הספירה באה שנת 1 לספירה)`, answer: 164 + y - 1 } },
  ],
}

export const MATH_LEVEL = { 'grade-1': 1, 'grade-2': 2, 'grade-3': 3, 'grade-4': 4, 'grade-5': 5, 'grade-6': 6, 'middle-school': 7 }
export const HANUKKAH_MATH_LEVELS = Object.keys(T).map(Number)

// n problems for a grade level: templates dealt in a shuffled round so each kind appears before any repeats.
export function hanukkahProblems(level, seed = 1, n = 8) {
  const list = T[level]
  if (!list) return []
  const r = createRng(seed)
  const out = [], seen = new Set()
  let order = r.shuffle(list.map((_, i) => i))
  for (let tries = 0; out.length < n && tries < n * 20; tries++) {
    if (!order.length) order = r.shuffle(list.map((_, i) => i))
    const p = list[order.shift()](r)
    if (seen.has(p.q)) continue
    seen.add(p.q)
    out.push({ ...p, answer: String(p.answer) })
  }
  return out
}

// Kindergarten: numbers for the "how many candles" and "donut maths" sheets (counting to 8, adding to 8).
export function kindergartenNumbers(seed = 1) {
  const r = createRng(seed)
  const nights = r.shuffle([1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 6)
  const items = Array.from({ length: 6 }, () => { const a = r.int(1, 5); return [a, r.int(1, 8 - a)] })
  return { nights, items }
}
