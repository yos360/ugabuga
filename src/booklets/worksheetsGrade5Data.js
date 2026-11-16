// Data for "דפי עבודה לכיתה ה׳ — חוברת משולבת": math, reading, Hebrew language, English, science and thinking.
// Every answer that can be computed is computed here (tests/booklets-worksheets-grade5.test.mjs).

export const LETTERS = ['א', 'ב', 'ג']
export const gcd = (a, b) => (b ? gcd(b, a % b) : a)
export const num = n => n.toLocaleString('en-US')

// ---------- Math ----------
export const MULT = [[34, 26], [47, 18], [125, 12], [208, 35], [63, 49], [316, 24], [72, 58], [405, 17]]
export const DIV = [[756, 6], [912, 8], [1325, 5], [2484, 4], [868, 7], [3150, 9], [1476, 6], [2835, 7]]

export const FRAC_REDUCE = [[6, 8], [10, 15], [12, 16], [9, 27], [14, 21], [18, 24]]
export const reduce = ([a, b]) => { const g = gcd(a, b); return [a / g, b / g] }
// [numerator, denominator, new denominator] → fill the new numerator
export const FRAC_EXPAND = [[2, 3, 12], [3, 5, 20], [1, 4, 16], [5, 6, 18]]
export const expand = ([a, b, d]) => (a * d) / b
export const FRAC_COMPARE = [[5, 8, 3, 4], [2, 3, 3, 5], [4, 10, 2, 5], [5, 6, 7, 9], [4, 9, 1, 2], [7, 12, 2, 3]]
export const compareSign = ([a, b, c, d]) => { const l = a * d, r = c * b; return l > r ? '>' : l < r ? '<' : '=' }

// Decimals as strings, computed in thousandths so floating point never shows.
const milli = s => Math.round(Number(s) * 1000)
const fromMilli = m => { const s = (m / 1000).toFixed(3).replace(/0+$/, '').replace(/\.$/, ''); return s }
export const DEC_OPS = [['3.45', '+', '2.3'], ['7.8', '−', '2.65'], ['12.06', '+', '4.94'], ['10', '−', '3.75'], ['0.6', '×', '4'], ['2.35', '×', '10'], ['4.8', '÷', '4'], ['15.5', '÷', '5']]
export const decResult = ([a, op, b]) => {
  if (op === '+') return fromMilli(milli(a) + milli(b))
  if (op === '−') return fromMilli(milli(a) - milli(b))
  if (op === '×') return fromMilli(milli(a) * Number(b))
  return fromMilli(milli(a) / Number(b))
}
export const DEC_ORDER = [['0.5', '0.45', '0.09', '0.6'], ['2.1', '2.01', '2.11', '2.101'], ['3.7', '3.07', '3.17', '3.71']]
export const decSorted = row => [...row].sort((x, y) => milli(x) - milli(y))

// Word problems: `ex` is the full computation (× ÷ − +), `a` the answer as written in the key.
export const WORD = [
  { t: ['נועה קוראת 18 עמודים בכל יום.', 'כמה עמודים תקרא ב־14 ימים?'], ex: '18 × 14', u: 'עמודים' },
  { t: ['בבית הספר 336 תלמידים בשכבה ה׳. הם מתחלקים שווה בשווה ל־12 קבוצות.', 'כמה תלמידים בכל קבוצה?'], ex: '336 ÷ 12', u: 'תלמידים' },
  { t: ['עומר קנה 3 מחברות ב־7.5 ₪ כל אחת ועט ב־4.2 ₪.', 'כמה שילם בסך הכול?'], ex: '3 × 7.5 + 4.2', u: '₪' },
  { t: ['משחק עולה 120 ₪. בחנות יש הנחה של רבע מהמחיר.', 'כמה עולה המשחק אחרי ההנחה?'], ex: '120 − 120 ÷ 4', u: '₪' },
  { t: ['בחווה 4 לולים, ובכל לול 125 תרנגולות. כל תרנגולת מטילה ביצה אחת ביום.', 'כמה ביצים מטילות כל התרנגולות בשבוע?'], ex: '4 × 125 × 7', u: 'ביצים' },
  { t: ['ליאת רצה 3 סיבובים במסלול של 400 מטרים, ואחר כך עוד 250 מטרים.', 'כמה מטרים רצה בסך הכול?'], ex: '3 × 400 + 250', u: 'מטרים' },
]
// Tiny evaluator for the expressions above (no eval): × and ÷ before + and −.
export function evaluate(ex) {
  const tokens = ex.split(' ')
  const terms = [], signs = ['+']
  let cur = Number(tokens[0])
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i], v = Number(tokens[i + 1])
    if (op === '×') cur *= v
    else if (op === '÷') cur /= v
    else { terms.push(cur); signs.push(op); cur = v }
  }
  terms.push(cur)
  return Math.round(terms.reduce((s, t, i) => (signs[i] === '−' ? s - t : s + t), 0) * 1000) / 1000
}
export const TIME_Q = { t: ['הטיול של שכבה ה׳ יצא ב־08:15 וחזר ב־14:40.', 'כמה זמן נמשך הטיול?'], from: [8, 15], to: [14, 40] }
export const timeAnswer = ({ from, to }) => { const m = to[0] * 60 + to[1] - (from[0] * 60 + from[1]); return `${Math.floor(m / 60)} שעות ו־${m % 60} דקות` }

// ---------- Reading ----------
export const READING_MC = [
  { q: 'מאיפה מגיעים העגורים לעמק החולה?', o: ['מאפריקה', 'מצפון אירופה ומרוסיה', 'מאילת'], a: 1 },
  { q: 'למה החקלאים בעמק החולה דאגו כשהעגורים התחילו להישאר לכל החורף?', o: ['כי העגורים אכלו את הגידולים בשדות', 'כי העגורים הרעישו בלילה', 'כי העגורים בנו קנים על הבתים'], a: 0 },
  { q: 'מה עשו כדי לפתור את הבעיה?', o: ['גירשו את העגורים מהעמק', 'בנו גדר גבוהה סביב השדות', 'מפזרים לעגורים תירס במקום אחד'], a: 2 },
  { q: 'איך עפים העגורים בדרך כלל?', o: ['לבד, כל עגור בדרך שלו', 'בלהקות בצורת האות V', 'רק בלילה ובגובה נמוך'], a: 1 },
  { q: 'מה המילה המתאימה במקום "נודדים" במשפט "העגורים נודדים פעמיים בשנה"?', o: ['עוברים ממקום למקום', 'ישנים', 'מתחבאים'], a: 0 },
]
export const READING_ORDER = [
  // [sentence, place in the yearly journey]
  ['העגורים עוזבים את ישראל וטסים צפונה לקנן', 4],
  ['בסתיו העגורים יוצאים מצפון אירופה דרומה', 1],
  ['חלק מהעגורים ממשיכים לאפריקה, וחלק נשארים בעמק החולה', 2],
  ['כל החורף העגורים אוכלים בשדות ובאגמון', 3],
]
export const READING_OPEN = [
  'הכותב אומר שהפתרון בעמק החולה טוב "לכולם". הסבירו למי הוא טוב ולמה (שתי סיבות).',
  'האם הייתם רוצים לבקר באגמון החולה בחורף? כתבו שני משפטים ונמקו.',
]

// ---------- Hebrew language ----------
export const ROOTS = [['מכתב', 'כתב'], ['תלמיד', 'למד'], ['משחק', 'שחק'], ['סיפור', 'ספר'], ['שומרים', 'שמר'], ['זיכרון', 'זכר'], ['מגדל', 'גדל'], ['הדלקה', 'דלק']]
export const dashed = root => [...root].join('־')
export const ODD_ONE = [
  { w: ['כתבה', 'מכתב', 'כתובת', 'כתום'], odd: 'כתום', root: 'כתב' },
  { w: ['ספרייה', 'ספינה', 'סיפור', 'ספרן'], odd: 'ספינה', root: 'ספר' },
  { w: ['תלמיד', 'מלח', 'לימוד', 'מלמדת'], odd: 'מלח', root: 'למד' },
  { w: ['גידול', 'מגדל', 'גדר', 'גדולה'], odd: 'גדר', root: 'גדל' },
]
export const POS = { n: 'שם עצם', v: 'פועל', a: 'שם תואר' }
export const POS_WORDS = [
  ['חתול', 'n'], ['קפצה', 'v'], ['גבוה', 'a'], ['עיפרון', 'n'], ['שרו', 'v'], ['עצוב', 'a'], ['אכלנו', 'v'], ['ים', 'n'],
  ['אדום', 'a'], ['מטוס', 'n'], ['רחב', 'a'], ['הלכתי', 'v'], ['חלון', 'n'], ['עגול', 'a'], ['שחינו', 'v'],
]
// Each row: past / present / future for "הוא"; `show` is the one form printed, the other two are blanks.
export const TENSES = [
  { f: ['כתב', 'כותב', 'יכתוב'], show: 0 }, { f: ['שמר', 'שומר', 'ישמור'], show: 1 }, { f: ['למד', 'לומד', 'ילמד'], show: 2 },
  { f: ['אכל', 'אוכל', 'יאכל'], show: 0 }, { f: ['רקד', 'רוקד', 'ירקוד'], show: 1 }, { f: ['סגר', 'סוגר', 'יסגור'], show: 2 },
  { f: ['פתח', 'פותח', 'יפתח'], show: 0 }, { f: ['שלח', 'שולח', 'ישלח'], show: 1 },
]

// ---------- English ----------
export const ENGLISH = [
  ['Yael ___ to school every day.', ['walk', 'walks'], 1],
  ['Look! The children ___ in the park.', ['are playing', 'play'], 0],
  ['My brothers ___ football on Fridays.', ['plays', 'play'], 1],
  ['Yesterday I ___ at home.', ['was', 'were'], 0],
  ['Omer and Dana ___ at the beach last week.', ['was', 'were'], 1],
  ['___ you like pizza?', ['Do', 'Does'], 0],
  ['___ your sister speak English?', ['Do', 'Does'], 1],
  ['Right now, Grandma ___ a cake.', ['is baking', 'bakes'], 0],
  ['An elephant is ___ than a dog.', ['big', 'bigger'], 1],
  ['There ___ three apples on the table.', ['is', 'are'], 1],
]
export const EN_WORDS = [['library', 'ספרייה'], ['tired', 'עייף'], ['always', 'תמיד'], ['beach', 'חוף ים'], ['yesterday', 'אתמול'], ['hungry', 'רעב']]

// ---------- Science ----------
export const SCIENCE_TF = [
  ['הלב שולח דם לכל חלקי הגוף.', true, ''],
  ['בריאות עובר חמצן מהאוויר אל הדם.', true, ''],
  ['העורקים מובילים דם אל הלב, והוורידים מובילים דם מהלב.', false, 'הפוך: עורקים — מהלב, ורידים — אל הלב'],
  ['לאדם יש ריאה אחת.', false, 'יש שתי ריאות'],
  ['הסרעפת היא שריר שעוזר לנו לנשום.', true, ''],
  ['קרח נמס והופך מיד לגז.', false, 'קרח נמס והופך לנוזל — מים'],
  ['צמחים מייצרים מזון בעזרת אור השמש.', true, ''],
  ['הירח מאיר מעצמו, כמו השמש.', false, 'הירח מחזיר את אור השמש'],
  ['פחם ונפט הם משאבים מתכלים.', true, ''],
  ['אנרגיית רוח היא אנרגיה מתחדשת.', true, ''],
]
export const WATER_BANK = ['התאדות', 'התעבות', 'משקעים', 'הים', 'מי תהום']
export const WATER = [
  ['השמש מחממת את מי הים, והמים הופכים לאדים שעולים לאוויר. התהליך נקרא', 'התאדות'],
  ['האדים מתקררים למעלה והופכים לטיפות זעירות שיוצרות עננים. התהליך נקרא', 'התעבות'],
  ['גשם, ברד ושלג שיורדים מהעננים נקראים', 'משקעים'],
  ['חלק ממי הגשם זורמים בנחלים ובנהרות, ובסוף מגיעים חזרה אל', 'הים'],
  ['חלק אחר מחלחל לתוך האדמה ונאגר מתחת לפני הקרקע. המים האלה נקראים', 'מי תהום'],
]

// ---------- Thinking ----------
// Sequences: first four shown, the next two are blanks. next(prev, index) gives the number at that index.
export const SEQUENCES = [
  { start: [2, 5, 8, 11], rule: 'מוסיפים 3', next: x => x + 3 },
  { start: [100, 91, 82, 73], rule: 'מחסירים 9', next: x => x - 9 },
  { start: [3, 6, 12, 24], rule: 'כופלים ב־2', next: x => x * 2 },
  { start: [1, 4, 9, 16], rule: 'מספרים ריבועיים: 1×1, 2×2, 3×3…', next: (x, i) => (i + 1) * (i + 1) },
  { start: [1, 2, 4, 7], rule: 'מוסיפים 1, 2, 3, 4…', next: (x, i) => x + i },
]
export const seqNext = s => { const out = [...s.start]; while (out.length < 6) out.push(s.next(out[out.length - 1], out.length)); return out.slice(4) }
export const RIDDLES = [
  { t: 'אני מספר דו־ספרתי. סכום הספרות שלי הוא 9, וספרת העשרות שלי גדולה ב־5 מספרת האחדות. מי אני?', a: '72' },
  { t: 'לגלעד יש פי 3 גולות מאשר ללאה. יחד יש להם 48 גולות. כמה גולות יש לגלעד?', a: '36' },
  { t: 'מאיה גבוהה משירה. תמר נמוכה משירה. מי הכי גבוהה מהשלוש?', a: 'מאיה' },
]
