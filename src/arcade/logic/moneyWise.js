// "קצבה חכמה" — a 10-week pocket-money game for grades 5-6 (financial literacy).
// Every week: +20 ₪ allowance, one real-life money decision, then the child decides how much to
// put in the savings jar. Money left in the pocket "leaks" into small snacks. Goal: buy the chosen
// item by week 10 AND stay happy. Pure logic, no randomness except the seeded card order.
import { rng, shuffle } from './rng.js'

export const WEEKS = 10
export const ALLOWANCE = 20
export const START_JOY = 50
export const JOY_TARGET = 70
export const CUSHION = 30 // savings above the price needed for the third star

export const GOALS = [
  { id: 'headphones', emoji: '🎧', name: 'אוזניות', price: 120 },
  { id: 'skate', emoji: '🛹', name: 'סקייטבורד', price: 150 },
  { id: 'lego', emoji: '🧱', name: 'ערכת בנייה גדולה', price: 170 },
]

// Option: t = text, cash (− pays, + earns, goes through the pocket), bank (straight to the jar),
// joy (− … +), why = the one-sentence lesson shown after the choice.
export const SCENARIOS = [
  { id: 'pizza', emoji: '🍕', title: 'הזמנה לפיצה', text: 'נועם והחברים הולכים לפיצרייה אחרי בית הספר ומזמינים גם אותך. משולש עם שתייה עולה 25 ₪.', options: [
    { t: 'הולכים ומשלמים 25 ₪', cash: -25, joy: 12, why: 'ליהנות עם חברים זה חלק חשוב מהחיים — העיקר שזו בחירה, ושיש לה מקום בתקציב.' },
    { t: 'באים עם כריך מהבית ומתיישבים איתם', cash: 0, joy: 5, why: 'אפשר להיות חלק מהחבורה גם בלי להוציא — חשבון שווה לפעמים יותר מהוצאה.' },
    { t: 'מוותרים ומחזירים הביתה', cash: 0, joy: -4, why: 'לחסוך בכל מחיר גם עולה: קצת שמחה נשארה בחוץ.' },
  ] },
  { id: 'two-for-one', emoji: '🍫', title: 'מבצע 1+1', text: 'בקיוסק שלט גדול: "קנו שניים, שלמו 12 ₪!". חטיף אחד עולה 8 ₪. בא לך חטיף אחד.', options: [
    { t: 'קונים אחד ב־8 ₪', cash: -8, joy: 5, why: 'מבצע הוא חיסכון רק על מה שרצית לקנות. מה שלא תכננת — הוצאה.' },
    { t: 'קונים את המבצע ב־12 ₪ ואוכלים את שניהם', cash: -12, joy: 6, why: '"חסכת" 4 ₪ לעומת שני חטיפים בנפרד, אבל הוצאת 4 ₪ יותר ממה שבאת לקנות.' },
    { t: 'לא קונים', cash: 0, joy: -1, why: 'לפעמים ההחלטה הכי חכמה היא לא להוציא כלום.' },
  ] },
  { id: 'phone', emoji: '📱', title: 'המסך נסדק', text: 'הטלפון נפל ונסדק. תיקון המסך עולה 40 ₪ (ההורים אמרו: זה מהכסף שלך).', options: [
    { t: 'מתקנים — 40 ₪', cash: -40, joy: 2, why: 'הוצאה לא צפויה יכולה לבוא בכל שבוע. למי שיש קופה, זה פחות מלחיץ.' },
    { t: 'ממשיכים עם מסך סדוק', cash: 0, joy: -8, why: 'דחיית תיקון חוסכת היום, אבל הסדק מציק ויכול להחמיר.' },
  ] },
  { id: 'compare', emoji: '🖍️', title: 'השוואת מחירים', text: 'צריך ערכת צבעים לפרויקט. בחנות ליד הבית היא עולה 30 ₪, ובחנות ברחוב השני (10 דקות הליכה) — 22 ₪.', options: [
    { t: 'הולכים לחנות הרחוקה — 22 ₪', cash: -22, joy: 4, why: 'השוואת מחירים לפני קנייה חוסכת: 8 ₪ בשביל 10 דקות הליכה.' },
    { t: 'קונים בחנות הקרובה — 30 ₪', cash: -30, joy: 4, why: 'נוחות עולה כסף. לפעמים שווה, אבל כדאי לדעת כמה.' },
    { t: 'משלימים את הפרויקט עם צבעים שיש בבית', cash: 0, joy: -2, why: 'לפני שקונים, בודקים מה כבר יש בבית.' },
  ] },
  { id: 'birthday-gift', emoji: '🎂', title: 'יום הולדת לחברה', text: 'מאיה מזמינה אותך ליום ההולדת שלה. צריך מתנה.', options: [
    { t: 'מתנה יקרה בחנות — 50 ₪', cash: -50, joy: 6, why: 'מתנה יקרה לא תמיד מרגשת יותר. חשוב לקבוע תקרה לפני שנכנסים לחנות.' },
    { t: 'מתנה קטנה ב־15 ₪ וכרטיס שציירת בעצמך', cash: -15, joy: 10, why: 'מחשבה והשקעה שווים הרבה, ולא תמיד עולים הרבה.' },
    { t: 'מכינים בעצמך צמיד חרוזים מחומרים שיש בבית', cash: 0, joy: 8, why: 'מתנה עשויה ביד חוסכת כסף ונשארת בזיכרון.' },
  ] },
  { id: 'loan', emoji: '🤝', title: 'חבר מבקש הלוואה', text: 'איתי שכח את הכסף שלו ומבקש ממך 15 ₪: "אחזיר לך מחר, מבטיח!"', options: [
    { t: 'מלווים 15 ₪ בלי לשאול שאלות', cash: -15, joy: -4, why: 'כסף שהולך בלי הסכמה ברורה על החזרה עלול להיעלם וגם להכביד על החברות. מלווים רק סכום שאפשר לוותר עליו.' },
    { t: 'קונים לו חטיף ב־6 ₪ ואומרים: "הפעם עליי"', cash: -6, joy: 4, why: 'מתנה קטנה וברורה עדיפה על הלוואה מעורפלת.' },
    { t: 'מסבירים ברוגע שאין לך כסף להלוות עכשיו', cash: 0, joy: 0, why: 'מותר לסרב בנעימות. הכסף שלך הוא תוכנית, לא רק כיס פתוח.' },
  ] },
  { id: 'found-bill', emoji: '💵', title: 'מצאת שטר', text: 'בדרך לבית הספר מצאת שטר של 20 ₪ על המדרכה ליד השער. לא רואים בסביבה אף אחד.', options: [
    { t: 'מוסרים למזכירות בית הספר', cash: 0, joy: 8, why: 'השבת אבדה היא ערך, ולא כל הכסף שנקרא בדרך שייך לנו.' },
    { t: 'שמים בכיס ושותקים', cash: 20, joy: -6, why: 'כסף ששייך למישהו אחר לא באמת "מרוויחים", ויש לזה מחיר שאי אפשר לספור.' },
  ] },
  { id: 'dog', emoji: '🐕', title: 'עבודה קטנה', text: 'השכנה מבקשת שתוציא את הכלב שלה לטיול קצר בכל אחד משלושת הימים הקרובים, ותשלם 30 ₪ בסוף.', options: [
    { t: 'מסכימים ועובדים', cash: 30, joy: -2, why: 'כסף שמרוויחים בעבודה אמיתית מרגיש אחרת: אפשר גם ללמוד כמה זמן עולה כל שקל.' },
    { t: 'מסרבים — יש משחק בטלוויזיה', cash: 0, joy: 3, why: 'לזמן שלך יש ערך. כדאי לבחור במה להשקיע אותו.' },
  ] },
  { id: 'flea', emoji: '📚', title: 'שוק פשפשים', text: 'בבית הספר יש יריד יד שנייה. יש לך ארגז ספרים ומשחקים שכבר לא משתמשים בהם.', options: [
    { t: 'מוכרים ומקבלים 25 ₪', cash: 25, joy: 3, why: 'מה שלא משתמשים בו יכול להפוך לכסף — ולמישהו אחר.' },
    { t: 'שומרים הכול "ליתר ביטחון"', cash: 0, joy: 0, why: 'חפצים בארון לא מרוויחים. לפעמים שווה לשחרר.' },
  ] },
  { id: 'free-trial', emoji: '🎮', title: 'חודש ניסיון חינם', text: 'אפליקציית משחקים מציעה חודש ניסיון בחינם. בהמשך: 20 ₪ לחודש, בחיוב אוטומטי.', options: [
    { t: 'נרשמים וקובעים לעצמך תזכורת לבטל לפני סוף החודש', cash: 0, joy: 5, why: 'הצעה חינמית באמת היא כזו שמבטלים בזמן. תזכורת היא כלי תקציב.' },
    { t: 'נרשמים בלי לקרוא מה כתוב באותיות הקטנות', cash: -20, joy: 2, why: 'התנאים הקטנים הם הכסף הגדול: מנויים אוטומטיים ממשיכים לחייב עד שמבטלים.' },
    { t: 'לא נרשמים', cash: 0, joy: 0, why: 'מי שלא התחיל — לא צריך לבטל.' },
  ] },
  { id: 'gift-money', emoji: '👵', title: 'מתנה מסבתא', text: 'סבתא נתנה לך 50 ₪ בלי סיבה מיוחדת. מה עושים איתם?', options: [
    { t: 'כל ה־50 ₪ ישר לקופת החיסכון', bank: 50, joy: 3, why: 'כסף שנכנס לקופה לפני שיש הזדמנות להוציא אותו — נשמר.' },
    { t: 'חצי לקופה (25 ₪) וחצי לכיס', bank: 25, cash: 25, joy: 6, why: 'חלוקה בין חיסכון להנאה נותנת גם עתיד וגם הווה.' },
    { t: 'קונים ממתקים ומשחקים ב־50 ₪', joy: 12, why: 'כיף מיידי, אבל שבוע אחרי לא נשאר ממנו כלום מלבד זיכרון.' },
  ] },
  { id: 'donate', emoji: '❤️', title: 'איסוף לטובת הקהילה', text: 'הכיתה אוספת כסף לקניית מצרכים למשפחות במצוקה בשכונה. כל אחד תורם כמה שהוא רוצה.', options: [
    { t: 'תורמים 5 ₪', cash: -5, joy: 8, why: 'נתינה היא גם סוג של החלטה כלכלית: מחליטים מראש כמה, ולא מתחרטים.' },
    { t: 'לא תורמים הפעם', cash: 0, joy: -1, why: 'אפשר לתת גם בזמן ובמעשים, לא רק בכסף.' },
  ] },
  { id: 'pencil-case', emoji: '✏️', title: 'קלמר חדש', text: 'הרוכסן של הקלמר התקלקל. בחנות יש קלמר פשוט ב־25 ₪ וקלמר ממותג מפורסם ב־60 ₪.', options: [
    { t: 'קונים את הפשוט — 25 ₪', cash: -25, joy: 3, why: 'פונקציה לפני מותג: שניהם מחזיקים עפרונות.' },
    { t: 'קונים את הממותג — 60 ₪', cash: -60, joy: 9, why: 'מותג עולה על הנייר ובכיס, וההנאה ממנו מתגברת עם הזמן הרבה פחות מהמחיר.' },
    { t: 'מתקנים את הרוכסן עם הבית — 0 ₪', cash: 0, joy: -1, why: 'לפעמים תיקון הוא הקנייה הכי זולה.' },
  ] },
  { id: 'arcade', emoji: '🕹️', title: 'משחקי פארק', text: 'בפארק יש עמדת משחקים. כל משחק עולה 5 ₪. החברים משחקים שוב ושוב.', options: [
    { t: 'משחק אחד ויוצאים — 5 ₪', cash: -5, joy: 4, why: 'מגבילים את עצמך מראש, ונהנים בלי להתחרט.' },
    { t: 'שלושה משחקים — 15 ₪', cash: -15, joy: 7, why: 'כל משחק נוסף נותן קצת פחות הנאה אבל עולה אותו דבר.' },
    { t: 'צופים בחברים ומעודדים', cash: 0, joy: 2, why: 'גם לצפות בכיף זה כיף, וזה בחינם.' },
  ] },
  { id: 'bike-tire', emoji: '🚲', title: 'פנצ\'ר באופניים', text: 'האופניים שלך עם פנצ\'ר. תיקון במוסך עולה 30 ₪; סרטון הסבר מראה איך מתקנים לבד עם ערכה ב־12 ₪.', options: [
    { t: 'מתקנים במוסך — 30 ₪', cash: -30, joy: 3, why: 'שירות מקצועי נוח, אבל לפעמים יש דרך זולה יותר.' },
    { t: 'קונים ערכה ולומדים לתקן בעצמך — 12 ₪', cash: -12, joy: 6, why: 'מיומנות חדשה חוסכת כסף גם בפעם הבאה.' },
    { t: 'הולכים ברגל ודוחים את התיקון', cash: 0, joy: -5, why: 'דחייה חוסכת כסף היום ומאבדת נוחות.' },
  ] },
]

const num = v => (Number.isFinite(v) ? v : 0)
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

export function newGame(seed = 1, goalId = 'skate') {
  const goal = GOALS.find(g => g.id === goalId) || GOALS[1]
  const order = shuffle(rng(seed), SCENARIOS.map(s => s.id)).slice(0, WEEKS)
  return { seed, goalId: goal.id, week: 1, wallet: ALLOWANCE, saved: 0, joy: START_JOY, order, phase: 'event', last: null, note: null, history: [] }
}

export const scenarioOf = s => SCENARIOS.find(x => x.id === s.order[s.week - 1])
export const goalOf = s => GOALS.find(g => g.id === s.goalId) || GOALS[1]
export const canAfford = (s, opt) => num(opt.cash) >= 0 || s.wallet + s.saved >= -num(opt.cash)

// Pay from the pocket first, then from the savings jar.
function pay(s, amount) {
  const fromWallet = Math.min(s.wallet, amount)
  return { wallet: s.wallet - fromWallet, saved: s.saved - (amount - fromWallet), dipped: amount - fromWallet }
}

export function choose(s, index) {
  if (s.phase !== 'event') return s
  const opt = scenarioOf(s).options[index]
  if (!opt || !canAfford(s, opt)) return s
  let { wallet, saved } = s
  let dipped = 0
  const cash = num(opt.cash)
  if (cash < 0) ({ wallet, saved, dipped } = pay(s, -cash))
  else wallet += cash
  saved += num(opt.bank)
  const joy = clamp(s.joy + num(opt.joy), 0, 100)
  return { ...s, wallet, saved, joy, phase: 'feedback', last: { index, why: opt.why, dipped, joy: num(opt.joy) }, history: [...s.history, index] }
}

export const toSaving = s => (s.phase === 'feedback' ? { ...s, phase: 'save' } : s)

// Pocket money that is not moved to the jar leaks: half of it (rounded down) goes on small snacks,
// each full 5 ₪ of snacks is +1 joy.
export const leakOf = wallet => Math.floor(wallet / 2)

export function save(s, amount) {
  if (s.phase !== 'save') return s
  const put = clamp(Math.floor(num(amount)), 0, s.wallet)
  const left = s.wallet - put
  const leak = leakOf(left)
  const saved = s.saved + put
  const wallet = left - leak
  const joy = clamp(s.joy + Math.floor(leak / 5), 0, 100)
  const note = { put, leak }
  if (s.week >= WEEKS) return { ...s, saved, wallet, joy, phase: 'end', note }
  return { ...s, saved, wallet: wallet + ALLOWANCE, joy, week: s.week + 1, phase: 'event', last: null, note }
}

// At the end the pocket counts too — but it is usually small because of the leak.
export function outcome(s) {
  const goal = goalOf(s)
  const total = s.saved + s.wallet
  const reached = total >= goal.price
  const happy = s.joy >= JOY_TARGET
  const cushion = total >= goal.price + CUSHION
  const stars = (reached ? 1 : 0) + (reached && happy ? 1 : 0) + (reached && happy && cushion ? 1 : 0)
  return { total, reached, happy, cushion, stars, short: Math.max(0, goal.price - total) }
}

export const stepsToGoal = s => Math.max(0, goalOf(s).price - s.saved - s.wallet)
