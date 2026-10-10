// Touch-typing course data: keyboard layouts (by physical key = KeyboardEvent.code),
// finger assignment, lessons and original practice texts. Pure data + tiny helpers,
// shared by /typing, /typing/test, /typing/english and /typing/game and by tests.

// ── fingers ───────────────────────────────
// Order = left pinky → right pinky, then thumbs. Colors are the on-screen zones.
export const FINGERS = {
  LP: { name: 'זרת שמאל', short: 'זרת', hand: 'L', color: '#f6a5c0' },
  LR: { name: 'קמיצה שמאל', short: 'קמיצה', hand: 'L', color: '#ffc879' },
  LM: { name: 'אמה שמאל', short: 'אמה', hand: 'L', color: '#fff07a' },
  LI: { name: 'אצבע מורה שמאל', short: 'מורה', hand: 'L', color: '#9be29a' },
  RI: { name: 'אצבע מורה ימין', short: 'מורה', hand: 'R', color: '#8fd3f4' },
  RM: { name: 'אמה ימין', short: 'אמה', hand: 'R', color: '#b9a6f2' },
  RR: { name: 'קמיצה ימין', short: 'קמיצה', hand: 'R', color: '#f2a6e6' },
  RP: { name: 'זרת ימין', short: 'זרת', hand: 'R', color: '#ff9f8f' },
  TH: { name: 'אגודל', short: 'אגודל', hand: 'B', color: '#d9dde8' },
}

// Standard touch-typing finger chart (same physical keys for every layout).
const FINGER_KEYS = {
  LP: ['Backquote', 'Digit1', 'KeyQ', 'KeyA', 'KeyZ', 'Tab', 'CapsLock', 'ShiftLeft'],
  LR: ['Digit2', 'KeyW', 'KeyS', 'KeyX'],
  LM: ['Digit3', 'KeyE', 'KeyD', 'KeyC'],
  LI: ['Digit4', 'Digit5', 'KeyR', 'KeyT', 'KeyF', 'KeyG', 'KeyV', 'KeyB'],
  RI: ['Digit6', 'Digit7', 'KeyY', 'KeyU', 'KeyH', 'KeyJ', 'KeyN', 'KeyM'],
  RM: ['Digit8', 'KeyI', 'KeyK', 'Comma'],
  RR: ['Digit9', 'KeyO', 'KeyL', 'Period'],
  RP: ['Digit0', 'Minus', 'Equal', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash', 'Semicolon', 'Quote', 'Slash', 'Enter', 'ShiftRight', 'Backspace'],
  TH: ['Space'],
}
export const FINGER_OF = Object.fromEntries(Object.entries(FINGER_KEYS).flatMap(([f, codes]) => codes.map(c => [c, f])))
export const HOME_CODES = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon']

// ── layouts ───────────────────────────────
// Each key: [code, base char, shifted char (only where it's used in lessons)].
// Hebrew = the standard Israeli layout (SI-1452) as shipped in Windows/macOS/Linux.
const DIGITS = [['Backquote', ';'], ['Digit1', '1', '!'], ['Digit2', '2'], ['Digit3', '3'], ['Digit4', '4'], ['Digit5', '5'], ['Digit6', '6'], ['Digit7', '7'], ['Digit8', '8'], ['Digit9', '9'], ['Digit0', '0'], ['Minus', '-'], ['Equal', '=']]
const HE_ROWS = [
  DIGITS,
  [['KeyQ', '/'], ['KeyW', "'"], ['KeyE', 'ק'], ['KeyR', 'ר'], ['KeyT', 'א'], ['KeyY', 'ט'], ['KeyU', 'ו'], ['KeyI', 'ן'], ['KeyO', 'ם'], ['KeyP', 'פ'], ['BracketLeft', ']'], ['BracketRight', '[']],
  [['KeyA', 'ש'], ['KeyS', 'ד'], ['KeyD', 'ג'], ['KeyF', 'כ'], ['KeyG', 'ע'], ['KeyH', 'י'], ['KeyJ', 'ח'], ['KeyK', 'ל'], ['KeyL', 'ך'], ['Semicolon', 'ף'], ['Quote', ',', '"']],
  [['KeyZ', 'ז'], ['KeyX', 'ס'], ['KeyC', 'ב'], ['KeyV', 'ה'], ['KeyB', 'נ'], ['KeyN', 'מ'], ['KeyM', 'צ'], ['Comma', 'ת'], ['Period', 'ץ'], ['Slash', '.', '?']],
]
const EN_ROWS = [
  [['Backquote', '`'], ['Digit1', '1', '!'], ['Digit2', '2'], ['Digit3', '3'], ['Digit4', '4'], ['Digit5', '5'], ['Digit6', '6'], ['Digit7', '7'], ['Digit8', '8'], ['Digit9', '9'], ['Digit0', '0'], ['Minus', '-'], ['Equal', '=']],
  [['KeyQ', 'q'], ['KeyW', 'w'], ['KeyE', 'e'], ['KeyR', 'r'], ['KeyT', 't'], ['KeyY', 'y'], ['KeyU', 'u'], ['KeyI', 'i'], ['KeyO', 'o'], ['KeyP', 'p'], ['BracketLeft', '['], ['BracketRight', ']']],
  [['KeyA', 'a'], ['KeyS', 's'], ['KeyD', 'd'], ['KeyF', 'f'], ['KeyG', 'g'], ['KeyH', 'h'], ['KeyJ', 'j'], ['KeyK', 'k'], ['KeyL', 'l'], ['Semicolon', ';', ':'], ['Quote', "'", '"']],
  [['KeyZ', 'z'], ['KeyX', 'x'], ['KeyC', 'c'], ['KeyV', 'v'], ['KeyB', 'b'], ['KeyN', 'n'], ['KeyM', 'm'], ['Comma', ',', '<'], ['Period', '.', '>'], ['Slash', '/', '?']],
].map(row => row.map(([code, base, shift]) => [code, base, shift ?? (/^[a-z]$/.test(base) ? base.toUpperCase() : undefined)]))

// The English letter printed on each physical key — shown small on the Hebrew keyboard.
const LATIN_LABEL = Object.fromEntries(EN_ROWS.flat().map(([code, base]) => [code, base.toUpperCase()]))

function makeLayout(id, rows, letterRe, dir) {
  const byCode = {}
  const byChar = {}
  for (const row of rows) for (const [code, base, shift] of row) {
    byCode[code] = { code, base, shift, latin: LATIN_LABEL[code], finger: FINGER_OF[code] }
    if (!(base in byChar)) byChar[base] = { code, shift: false }
    if (shift && !(shift in byChar)) byChar[shift] = { code, shift: true }
  }
  byChar[' '] = { code: 'Space', shift: false }
  return { id, rows: rows.map(r => r.map(k => k[0])), byCode, byChar, letterRe, dir }
}
export const LAYOUTS = {
  he: makeLayout('he', HE_ROWS, /^[א-ת]$/, 'rtl'),
  en: makeLayout('en', EN_ROWS, /^[a-zA-Z]$/, 'ltr'),
}
export const HEBREW_LETTERS = 'אבגדהוזחטיכךלמםנןסעפףצץקרשת'.split('')

// Which key + finger produces a character (+ which Shift, opposite hand, if needed).
export function keyFor(layout, ch) {
  const k = layout.byChar[ch]
  if (!k) return null
  const finger = FINGER_OF[k.code]
  const shiftCode = k.shift ? (FINGERS[finger].hand === 'L' ? 'ShiftRight' : 'ShiftLeft') : null
  return { code: k.code, finger, shift: k.shift, shiftCode }
}

// ── word bank (Hebrew, כתיב מלא, no niqqud) ───────────────────────────────
// Lessons draw from this list, filtered to the letters learned so far.
export const HE_WORDS = (
  // home row only: ש ד ג כ ע י ח ל ך ף
  'שלג כלי דג גדי ילד כל על לך יש שלי עלי גיל שלך דלי חג כף דף חי שיח ידע לחי שכל שליח לילך דייג גל די יד ילדי ידיד גלגל דגל כדי חלל כיף עף דיג גליל חלש חדש לחש כלל ליד עדיף חליל עליך ' +
  // + top row: ק ר א ט ו ן ם פ
  'אור קול פרי שיר עיר ירוק אדום שלום יום אוכל פרח עוף דואר קיר ארוך קטן גדול כדור חלון עולם שעון שולחן ירח פיל קוף דוד אוטו אגם שוקולד עיפרון טלפון ארון קרח חורף טיול גשר ריקוד שוטר פארק אולם חדר דרך שוק לחם חיוך עכשיו אולי קודם אחרי פעם כולם רק גם אם לא כי של יודע יכול אומר קורא אחד קפוא חלום אוויר דרור קרוב רחוק פרפר קטיף שורש ' +
  // all letters
  'בית ספר אמא אבא משפחה חבר חברה מים שמש ים בוקר ערב לילה גשם ענן כוכב ירח חתול כלב סוס ציפור דבורה נמלה פרפר עץ פרח גן כיתה מורה תלמיד מחברת עיפרון מחק סרגל תיק ספרייה שולחן כיסא מטבח חלון דלת מפתח שעון מכונית אוטובוס רכבת אופניים כביש עיר כפר שדה הר נהר ים חוף חול אבן מתנה עוגה נר בלון שמחה משחק כדור קובייה בובה צעצוע שיר ריקוד תוף גיטרה פסנתר תמונה צבע אדום כחול צהוב ירוק לבן שחור גדול קטן חם קר מהר לאט יפה טוב חדש ישן ראשון שני שלישי אחד שתיים שלוש ארבע חמש שש שבע שמונה תשע עשר אני אתה את הוא היא אנחנו אתם הם שלי שלך שלנו מה מי איפה מתי למה כן לא גם רק עוד כבר היום מחר אתמול תמיד אולי ביחד לבד אוכל לחם חלב ביצה גבינה תפוח בננה ענבים מלפפון עגבנייה מרק פיצה גלידה מיץ תה קפה רוצה אוהב יודע רואה שומע הולך רץ קופץ שר צוחק אוכל שותה ישן קורא כותב מצייר בונה משחק לומד עוזר מחכה מביא נותן פותח סוגר'
).split(/\s+/).filter(Boolean).filter((w, i, a) => a.indexOf(w) === i)

// Most common everyday words — the "words" stage.
export const HE_COMMON = [
  'של את על לא זה גם כל אני הוא היא יש עם מה כי אם רק עוד כמו אבל או אחד שני הם אנחנו אתה',
  'היום מחר אתמול עכשיו תמיד פעם כאן שם איפה מתי למה איך מי כמה הרבה קצת טוב יפה גדול קטן חדש',
  'בית ספר משפחה חבר אמא אבא ילד ילדה מורה כיתה שולחן חלון דלת מים לחם אוכל שמש גשם עץ פרח כלב חתול',
  'הולך בא רוצה אוהב יודע חושב אומר רואה שומע עושה נותן לוקח כותב קורא משחק לומד צוחק שר רץ ישן',
]

// Original sentences, no punctuation (punctuation has its own lessons later).
export const HE_SENTENCES = [
  'הילדים משחקים בחצר אחרי בית הספר',
  'אבא מכין חביתה עם עגבניות לארוחת בוקר',
  'החתול ישן על הספה ליד החלון',
  'בחורף יורד גשם ואנחנו לובשים מעיל',
  'סבתא מספרת לנו סיפור לפני השינה',
  'הכלב שלנו אוהב לרוץ בפארק',
  'מחר נלך לים עם כל המשפחה',
  'אני קורא ספר חדש על החלל והכוכבים',
  'המורה ביקשה מאיתנו לכתוב שיר קצר',
  'בקיץ אנחנו אוכלים אבטיח קר ומתוק',
  'אחותי הקטנה למדה לרכוב על אופניים',
  'בגינה גדלים פרחים צהובים ואדומים',
  'אנחנו בונים מגדל גבוה מקוביות',
  'הציפורים שרות על העץ מול הבית',
  'בשבת נוסעים לבקר את סבא וסבתא',
  'כל בוקר אני מצחצח שיניים ושוטף פנים',
]

const HE_PUNCT_DOT = [
  'היום בבוקר קמתי מוקדם, אכלתי ויצאתי לגן.',
  'בתיק יש מחברת, עיפרון, מחק וסרגל.',
  'השמש זורחת, הציפורים שרות והיום מתחיל.',
  'אחרי השיעור הלכנו לספרייה, ושם קראנו יחד.',
  'בערב סידרתי את החדר, ואז הלכתי לישון.',
]
const HE_PUNCT_Q = [
  'מה אתם אוהבים לאכול בארוחת ערב?',
  'איזה כיף, מחר יוצאים לטיול!',
  'מי רוצה לשחק איתי בכדור?',
  'כל הכבוד, הצלחת בפעם הראשונה!',
  'איפה שמתי את המפתחות?',
  'שקט, התינוק ישן!',
]
const HE_NUMBERS = [
  '1 2 3 4 5 6 7 8 9 0',
  'בכיתה שלנו יש 32 ילדים ושתי מורות.',
  'הטיול יוצא בשעה 8 וחוזר בשעה 14.',
  'קניתי 6 תפוחים ועוד 4 בננות.',
  'בשנה יש 12 חודשים, ובכל שבוע יש 7 ימים.',
  'הבית שלנו הוא מספר 19, ואנחנו גרים בקומה 3.',
  'סבא חוגג 70, ואני חוגג 9!',
  '10 20 30 40 50 60 70 80 90 100',
]

// ── lessons ───────────────────────────────
// kind: 'keys' = drill new keys (+ words using only learned keys); 'words' = word list;
// 'lines' = fixed sentences. `keys` = new characters introduced in this lesson.
export const STAGES_HE = [
  { id: 'home', title: 'שורת הבית', emoji: '🏠', target: 8 },
  { id: 'top', title: 'השורה העליונה', emoji: '⬆️', target: 10 },
  { id: 'bottom', title: 'השורה התחתונה', emoji: '⬇️', target: 12 },
  { id: 'words', title: 'מילים נפוצות', emoji: '🔤', target: 15 },
  { id: 'sentences', title: 'משפטים', emoji: '📝', target: 18 },
  { id: 'punct', title: 'סימני פיסוק ומספרים', emoji: '❗', target: 15 },
]
export const LESSONS_HE = [
  { id: 'he-1', stage: 'home', kind: 'keys', keys: ['כ', 'ח'], title: 'כ ו-ח: האצבעות המורות', tip: 'מניחים את האצבעות המורות על כ ועל ח — יש עליהן בליטה קטנה שאפשר להרגיש בלי להסתכל.' },
  { id: 'he-2', stage: 'home', kind: 'keys', keys: ['ג', 'ל'], title: 'ג ו-ל: האמות', tip: 'האמה השמאלית על ג, האמה הימנית על ל. אחרי כל הקשה חוזרים לשורת הבית.' },
  { id: 'he-3', stage: 'home', kind: 'keys', keys: ['ד', 'ך'], title: 'ד ו-ך: הקמיצות', tip: 'הקמיצות על ד ועל ך. הן חלשות יותר — מקלידים לאט ובעדינות.' },
  { id: 'he-4', stage: 'home', kind: 'keys', keys: ['ש', 'ף'], title: 'ש ו-ף: הזרתות', tip: 'הזרת השמאלית על ש, הזרת הימנית על ף. האגודלים נחים על מקש הרווח.' },
  { id: 'he-5', stage: 'home', kind: 'keys', keys: ['ע', 'י'], title: 'ע ו-י: מתיחה פנימה', tip: 'האצבע המורה זזה צעד אחד פנימה: שמאל ל-ע, ימין ל-י, ומיד חוזרת למקום.' },
  { id: 'he-6', stage: 'home', kind: 'keys', keys: [], title: 'מילים משורת הבית', tip: 'כבר אפשר לכתוב מילים שלמות: שלג, ילד, דגל. מנסים לא להציץ במקלדת!' },
  { id: 'he-7', stage: 'top', kind: 'keys', keys: ['ר', 'א'], title: 'ר ו-א: מורה שמאל למעלה', tip: 'האצבע המורה השמאלית עולה מ-כ ל-ר, ומ-ע ל-א.' },
  { id: 'he-8', stage: 'top', kind: 'keys', keys: ['ו', 'ט'], title: 'ו ו-ט: מורה ימין למעלה', tip: 'האצבע המורה הימנית עולה מ-ח ל-ו, ומ-י ל-ט.' },
  { id: 'he-9', stage: 'top', kind: 'keys', keys: ['ק', 'ן'], title: 'ק ו-ן: האמות למעלה', tip: 'האמה השמאלית עולה מ-ג ל-ק, והאמה הימנית מ-ל ל-ן.' },
  { id: 'he-10', stage: 'top', kind: 'keys', keys: ['ם', 'פ'], title: 'ם ו-פ: קמיצה וזרת ימין', tip: 'הקמיצה הימנית עולה ל-ם, והזרת הימנית ל-פ.' },
  { id: 'he-11', stage: 'top', kind: 'keys', keys: [], title: 'מילים עם השורה העליונה', tip: 'עכשיו יש כבר הרבה מילים: שלום, אור, חלון. שומרים על קצב קבוע.' },
  { id: 'he-12', stage: 'bottom', kind: 'keys', keys: ['ה', 'נ'], title: 'ה ו-נ: מורה שמאל למטה', tip: 'האצבע המורה השמאלית יורדת מ-כ ל-ה, ומ-ע ל-נ.' },
  { id: 'he-13', stage: 'bottom', kind: 'keys', keys: ['מ', 'צ'], title: 'מ ו-צ: מורה ימין למטה', tip: 'האצבע המורה הימנית יורדת מ-י ל-מ, ומ-ח ל-צ.' },
  { id: 'he-14', stage: 'bottom', kind: 'keys', keys: ['ב', 'ת'], title: 'ב ו-ת: האמות למטה', tip: 'האמה השמאלית יורדת ל-ב, והאמה הימנית ל-ת.' },
  { id: 'he-15', stage: 'bottom', kind: 'keys', keys: ['ס', 'ץ', 'ז'], title: 'ס, ץ ו-ז: קמיצות וזרת', tip: 'הקמיצה השמאלית ל-ס, הקמיצה הימנית ל-ץ, והזרת השמאלית ל-ז.' },
  { id: 'he-16', stage: 'bottom', kind: 'keys', keys: [], title: 'כל האותיות', tip: 'למדתם את כל 27 האותיות! עכשיו מתרגלים מילים מכל המקלדת.' },
  { id: 'he-17', stage: 'words', kind: 'words', keys: [], words: HE_COMMON[0], title: 'מילים קצרות ונפוצות', tip: 'המילים הנפוצות ביותר בעברית. כדאי להקליד אותן עד שהאצבעות זוכרות לבד.' },
  { id: 'he-18', stage: 'words', kind: 'words', keys: [], words: HE_COMMON[1], title: 'מילים של זמן ומקום', tip: 'קצב קבוע חשוב יותר ממהירות. אם יש טעות — נושמים וממשיכים.' },
  { id: 'he-19', stage: 'words', kind: 'words', keys: [], words: HE_COMMON[2], title: 'מילים מהבית ומהכיתה', tip: 'מסתכלים על המסך, לא על הידיים.' },
  { id: 'he-20', stage: 'words', kind: 'words', keys: [], words: HE_COMMON[3], title: 'פעלים', tip: 'פעלים יומיומיים. שימו לב לאותיות הסופיות.' },
  { id: 'he-21', stage: 'sentences', kind: 'lines', keys: [], lines: HE_SENTENCES.slice(0, 8), title: 'משפטים קצרים', tip: 'משפט שלם בלי לעצור. הרווח — באגודל.' },
  { id: 'he-22', stage: 'sentences', kind: 'lines', keys: [], lines: HE_SENTENCES.slice(8), title: 'עוד משפטים', tip: 'נסו לקרוא מילה אחת קדימה בזמן שאתם מקלידים.' },
  { id: 'he-23', stage: 'punct', kind: 'lines', keys: ['.', ','], lines: HE_PUNCT_DOT, title: 'נקודה ופסיק', tip: 'בעברית הנקודה היא בזרת ימין (המקש של / באנגלית), והפסיק נמצא ליד ף.' },
  { id: 'he-24', stage: 'punct', kind: 'lines', keys: ['?', '!'], lines: HE_PUNCT_Q, title: 'סימן שאלה וסימן קריאה', tip: 'סימן שאלה: מחזיקים Shift שמאלי ומקישים בזרת ימין על מקש הנקודה. סימן קריאה: Shift ימני ו-1. תמיד מחזיקים Shift ביד השנייה.' },
  { id: 'he-25', stage: 'punct', kind: 'lines', keys: '1234567890'.split(''), lines: HE_NUMBERS, title: 'מספרים', tip: 'שורת המספרים רחוקה — כל אצבע עולה שתי שורות מהמקש שלה בשורת הבית.' },
]

// ── English track (smaller) ───────────────────────────────
export const EN_WORDS = 'a add all ask dad fall flask glad hall had has lad lass sad salad flag gas'.split(' ').concat(
  'the of and to in is it you that he was for on are as with his they at be this from have or one had by word but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil its now find long down day did get come made may part'.split(' '),
).filter((w, i, a) => a.indexOf(w) === i)
export const STAGES_EN = [
  { id: 'home', title: 'Home row', emoji: '🏠', target: 8 },
  { id: 'top', title: 'Top row', emoji: '⬆️', target: 10 },
  { id: 'bottom', title: 'Bottom row', emoji: '⬇️', target: 12 },
  { id: 'sentences', title: 'Sentences', emoji: '📝', target: 15 },
]
export const LESSONS_EN = [
  { id: 'en-1', stage: 'home', kind: 'keys', keys: ['f', 'j'], title: 'f and j', tip: 'האצבעות המורות על F ועל J — יש עליהם בליטות קטנות.' },
  { id: 'en-2', stage: 'home', kind: 'keys', keys: ['d', 'k'], title: 'd and k', tip: 'האמות על D ועל K.' },
  { id: 'en-3', stage: 'home', kind: 'keys', keys: ['s', 'l'], title: 's and l', tip: 'הקמיצות על S ועל L.' },
  { id: 'en-4', stage: 'home', kind: 'keys', keys: ['a', 'g', 'h'], title: 'a, g and h', tip: 'הזרת השמאלית על A, והמורות נמתחות פנימה ל-G ול-H.' },
  { id: 'en-5', stage: 'top', kind: 'keys', keys: ['r', 'u', 'e', 'i'], title: 'r u e i', tip: 'המורות עולות ל-R ול-U, האמות ל-E ול-I.' },
  { id: 'en-6', stage: 'top', kind: 'keys', keys: ['t', 'y', 'o', 'w'], title: 't y o w', tip: 'המורות נמתחות ל-T ול-Y, הקמיצות עולות ל-W ול-O.' },
  { id: 'en-7', stage: 'top', kind: 'keys', keys: ['q', 'p'], title: 'q and p', tip: 'הזרתות עולות: שמאל ל-Q, ימין ל-P.' },
  { id: 'en-8', stage: 'bottom', kind: 'keys', keys: ['v', 'm', 'c', 'n'], title: 'v m c n', tip: 'המורות יורדות ל-V ול-M (ול-N), האמה השמאלית ל-C.' },
  { id: 'en-9', stage: 'bottom', kind: 'keys', keys: ['b', 'x', 'z'], title: 'b x z', tip: 'המורה השמאלית ל-B, הקמיצה ל-X והזרת ל-Z.' },
  { id: 'en-10', stage: 'sentences', kind: 'lines', keys: ['.', ','], lines: ['we like to read a good book.', 'the sun is hot, so we go to the sea.', 'my dog can run very fast.', 'look at the big red kite, it can fly.', 'we play ball in the park after school.'], title: 'Sentences', tip: 'משפטים שלמים עם נקודה ופסיק.' },
  { id: 'en-11', stage: 'sentences', kind: 'lines', keys: ['T', 'I', 'M', 'W', 'S', 'A'], lines: ['Today is a sunny day.', 'I have a little cat.', 'My friend Sam can swim.', 'We visit Tel Aviv in May.', 'She sings a song.'], title: 'Capital letters', tip: 'אות גדולה = מחזיקים Shift ביד השנייה ומקישים על האות.' },
]

// ── original passages for the speed test ───────────────────────────────
export const PASSAGES_HE = [
  'בבוקר יצאנו לטיול קצר ליד הנחל. המים זרמו לאט בין האבנים, וצפרדע קטנה קפצה מעלה אל עלה ירוק. אחי ניסה לתפוס אותה, אבל היא הייתה מהירה ממנו. בסוף ישבנו על הגדה, אכלנו כריכים והקשבנו לציפורים.',
  'לנמלים יש עבודה גם כשאף אחד לא רואה. הן אוספות פירורים, סוחבות זרעים גדולים מהן ובונות מנהרות ארוכות מתחת לאדמה. כשנמלה אחת מוצאת אוכל, היא משאירה ריח על הדרך, וכל החברות שלה יודעות לאן ללכת.',
  'בספרייה של בית הספר יש פינה שקטה עם כריות צבעוניות. בהפסקה הגדולה אני אוהבת לשבת שם עם ספר על חיות הים. היום קראתי על תמנון שיודע לפתוח צנצנת, ולא האמנתי שזה אפשרי.',
  'הגשם הראשון של החורף הגיע בלילה. בבוקר כל הרחוב הריח אחרת, והשלוליות נצצו באור השמש. הילדים קפצו בהן במגפיים, והכלב של השכנים רץ אחריהם ונבח בשמחה.',
  'הירח לא מאיר בעצמו. הוא מחזיר את האור של השמש, כמו מראה גדולה בשמיים. בכל לילה אנחנו רואים חלק אחר ממנו, ולכן פעם הוא נראה כמו עיגול מלא ופעם כמו חיוך דק.',
  'סבא שלי יודע לאפות לחם. הוא מערבב קמח, מים, שמרים וקצת מלח, ולש את הבצק בידיים חזקות. אחר כך מחכים שעה שהבצק יתפח. כשהלחם יוצא מהתנור, כל הבית מתמלא בריח חם ונעים.',
  'הדבורים עובדות יחד כמו צוות אחד. יש דבורים שאוספות צוף מהפרחים, יש שמנקות את הכוורת ויש ששומרות על הכניסה. בזכותן גדלים פירות וירקות רבים, ולכן חשוב לשמור עליהן.',
  'אתמול למדתי לרכוב על אופניים בלי גלגלי עזר. בהתחלה נפלתי פעמיים, אבל אבא החזיק את המושב ורץ לידי. פתאום הוא עזב, ואני המשכתי לבד עד סוף השביל. איזו הרגשה מצוינת!',
  'הצב הולך לאט, אבל הוא אף פעם לא מוותר. הוא נושא את הבית שלו על הגב, וכשמשהו מפחיד אותו הוא פשוט מכניס את הראש פנימה. יש צבים שחיים יותר ממאה שנה.',
  'בשוק של יום שישי יש המון צבעים. ערימות של תפוזים, עגבניות אדומות, פלפלים צהובים ועשבי תיבול ירוקים. המוכרים קוראים בקול, ואמא שלי תמיד יודעת בדיוק מאיפה לקנות את התותים הכי מתוקים.',
  'כשאני רוצה להירגע, אני מנגן בפסנתר. אני לא מנגן מושלם, אבל זה לא משנה. הצלילים ממלאים את החדר, והמחשבות שלי נעשות שקטות יותר. לפעמים אחותי מצטרפת ושרה איתי.',
  'ציפורים רבות נודדות פעמיים בשנה. בסתיו הן עפות דרומה אל ארצות חמות, ובאביב הן חוזרות צפונה. ישראל נמצאת בדיוק על הדרך שלהן, ולכן אפשר לראות כאן מיליוני ציפורים בשמיים.',
  'החבר הכי טוב שלי עבר לגור בעיר אחרת. בהתחלה הייתי עצוב מאוד, אבל אז החלטנו לכתוב מכתבים. בכל שבוע אני מספר לו מה קרה בכיתה, והוא שולח לי ציורים של הבית החדש שלו.',
  'בערב שבת כל המשפחה יושבת סביב השולחן. סבתא מביאה מרק חם, אבא מברך על היין, והאחים הקטנים מתווכחים מי יקבל את החלה הכי גדולה. אחרי האוכל משחקים יחד במשחק קלפים.',
  'פעם בשנה יורד שלג על ההרים בצפון. אנשים נוסעים לשם במיוחד כדי לבנות איש שלג ולהתגלגל במורד. האוויר קר מאוד, ולכן חשוב ללבוש כפפות, כובע וצעיף, ולשתות משהו חם בסוף היום.',
  'המחשב הראשון היה גדול כמו חדר שלם. היום יש לנו בכיס טלפון חזק ממנו פי אלף. ובכל זאת, הדבר החשוב באמת הוא לא המכשיר אלא מה שאנחנו בוחרים לעשות איתו.',
  'בגינה שלנו גדל עץ לימון. בחורף הוא מלא בפירות צהובים, ואנחנו מכינים מהם לימונדה עם נענע. השכנים באים לקטוף, ובתמורה הם מביאים לנו ריבה שהם מכינים מהתאנים שלהם.',
  'כדי לבנות מגדל גבוה מקוביות צריך סבלנות. מתחילים מבסיס רחב ויציב, ומוסיפים קובייה אחרי קובייה. אם המגדל נופל, לא מתייאשים. בונים שוב, ולומדים מה לעשות אחרת.',
  'הכוכבים שאנחנו רואים בלילה רחוקים מאיתנו מאוד. האור שלהם נוסע שנים רבות עד שהוא מגיע אלינו. כלומר, כשאנחנו מסתכלים על כוכב, אנחנו רואים אותו כמו שהוא היה פעם, לפני הרבה זמן.',
  'ביום הולדת שמונה קיבלתי במתנה ערכה לגידול צמחים. שתלתי זרעים בעציץ קטן, השקיתי אותם כל בוקר ושמתי אותם ליד החלון. אחרי שבוע ראיתי עלה ירוק ראשון, וצעקתי משמחה!',
  'האם ידעתם שלתמנון יש שלושה לבבות? הוא גם יכול לשנות צבע כדי להסתתר, ולהתכווץ כדי לעבור דרך חור קטן מאוד. מדענים חושבים שהוא אחד היצורים החכמים ביותר בים.',
  'בכל בוקר אני מכין לעצמי את התיק. אני בודק שיש מחברות, קלמר ובקבוק מים, ומוסיף כריך ותפוח. כשהכול מוכן מהערב, הבוקר עובר בלי לחץ, ואני מגיע לכיתה בזמן ובמצב רוח טוב.',
]
