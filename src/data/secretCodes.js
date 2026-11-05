// Hebrew secret codes for /tools/secret-codes: the ciphers themselves plus the messages of the
// on-screen mission and the printable sheets. Everything is pure so the sheets and their answer
// page are always computed from the same text and can't drift apart.
export const LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת'

const TO_REGULAR = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' }
const TO_FINAL = { כ: 'ך', מ: 'ם', נ: 'ן', פ: 'ף', צ: 'ץ' }

// Niqqud is dropped and final letters become regular ones, so ם and מ share one code.
const plain = text => String(text).replace(/[֑-ׇֽֿׁׂׅׄ]/g, '').replace(/[ךםןףץ]/g, c => TO_REGULAR[c])
const restoreFinals = text => text.replace(/(?<=[א-ת])[כמנפצ](?![א-ת])/g, c => TO_FINAL[c])
const swap = (text, fn) => plain(text).replace(/[א-ת]/g, fn)
const shifted = (c, by) => LETTERS[(LETTERS.indexOf(c) + by + LETTERS.length) % LETTERS.length]
const mirrored = c => LETTERS[LETTERS.length - 1 - LETTERS.indexOf(c)]

export const SHIFT_KEYS = [1, 2, 3, 4, 5]

export const CIPHERS = [
  { id: 'shift', name: 'האות הבאה', emoji: '➡️' },
  { id: 'number', name: 'מספר במקום אות', emoji: '🔢' },
  { id: 'atbash', name: 'א״ת ב״ש', emoji: '🔁' },
  { id: 'mirror', name: 'כתב מראה', emoji: '🪞' },
]

// Numbers are separated by spaces, never hyphens: in a right-to-left paragraph "21-12" would read
// left to right, while spaced numbers stay in the order of the letters.
function toNumbers(text) {
  return plain(text).split(/\s+/)
    .map(word => [...word].filter(c => LETTERS.includes(c)).map(c => LETTERS.indexOf(c) + 1).join(' '))
    .filter(Boolean).join(' / ')
}
function fromNumbers(text) {
  const letter = n => (n >= 1 && n <= LETTERS.length ? LETTERS[n - 1] : '?')
  return String(text).split(/[/\n]/)
    .map(word => (word.match(/\d+/g) || []).map(n => letter(Number(n))).join(''))
    .filter(Boolean).join(' ')
}

export function encode(cipher, text, key = 1) {
  if (cipher === 'number') return toNumbers(text)
  if (cipher === 'atbash') return swap(text, mirrored)
  if (cipher === 'shift') return swap(text, c => shifted(c, key))
  return String(text)
}

export function decode(cipher, text, key = 1) {
  if (cipher === 'number') return restoreFinals(fromNumbers(text))
  if (cipher === 'atbash') return restoreFinals(swap(text, mirrored))
  if (cipher === 'shift') return restoreFinals(swap(text, c => shifted(c, -key)))
  return String(text)
}

// The code of one letter, for key tables and the cells of a sheet.
export function codeOf(cipher, letter, key = 1) {
  if (cipher === 'number') return String(LETTERS.indexOf(letter) + 1)
  if (cipher === 'atbash') return mirrored(letter)
  return shifted(letter, key)
}

export const keyTable = (cipher, key = 1) => [...LETTERS].map(letter => ({ letter, code: codeOf(cipher, letter, key) }))

// A typed answer counts whatever its spaces, punctuation, niqqud or final letters.
export const sameMessage = (a, b) => {
  const bare = text => plain(text).replace(/[^א-ת]/g, '')
  return bare(a) !== '' && bare(a) === bare(b)
}

// Lays a message out in rows of cells without splitting a word; null is the gap between words.
export function messageRows(message, cipher, key = 1, perRow = 15) {
  const rows = [[]]
  for (const word of plain(message).split(/\s+/).filter(Boolean)) {
    const row = rows[rows.length - 1]
    const needed = word.length + (row.length ? 1 : 0)
    const target = row.length + needed > perRow ? (rows.push([]), rows[rows.length - 1]) : row
    if (target.length) target.push(null)
    for (const c of word) target.push(codeOf(cipher, c, key))
  }
  return rows
}

// The on-screen mission: one message per cipher, getting harder.
export const MISSIONS = [
  { id: 'cakes', cipher: 'shift', key: 1, answer: 'בוגה אוהב עוגות', hint: 'כל אות הוחלפה באות שאחריה, אז חוזרים אות אחת אחורה: ג הופכת ל־ב.' },
  { id: 'secret', cipher: 'number', answer: 'יש לי סוד', hint: 'א היא 1, ב היא 2, ג היא 3. הקו האלכסוני הוא רווח בין מילים.' },
  { id: 'parrot', cipher: 'atbash', answer: 'התוכי יודע הכול', hint: 'א מתחלפת ב־ת, ב ב־ש, ג ב־ר. אפשר להיעזר בטבלה.' },
  { id: 'mirror', cipher: 'mirror', answer: 'קוראים אותי במראה', hint: 'הטקסט הפוך. קוראים אותו משמאל לימין, או מחזיקים מראה ליד המסך.' },
  { id: 'caesar', cipher: 'shift', key: 3, answer: 'קיסר אהב להזיז אותיות', hint: 'הפעם כל אות זזה שלוש אותיות קדימה, אז חוזרים שלוש אחורה: ד הופכת ל־א.' },
]

// Kindergarten sheet: a drawn shape instead of a letter, and only eight letters to know.
export const SHAPE_KEY = [
  { letter: 'א', shape: 'circle' },
  { letter: 'ב', shape: 'square' },
  { letter: 'ג', shape: 'triangle' },
  { letter: 'ד', shape: 'star' },
  { letter: 'י', shape: 'heart' },
  { letter: 'ל', shape: 'moon' },
  { letter: 'מ', shape: 'drop' },
  { letter: 'ת', shape: 'flower' },
]
export const SHAPE_WORDS = ['אבא', 'אמא', 'דג', 'בית', 'דלת', 'גמל']

export const SHEETS = [
  {
    id: 'grades-1-2', name: 'דף 2: כיתות א–ב — מספר במקום אות', title: 'פענחו את ההודעה: מספר במקום אות',
    rule: 'מחפשים כל מספר בטבלה וכותבים מתחתיו את האות.', cipher: 'number',
    messages: ['שלום לכם', 'יום שמח', 'חבר טוב', 'כל הכבוד', 'העוגה בתנור'],
    own: 'עכשיו תורכם: כתבו הודעה לחבר במספרים, ותנו לו לפענח',
  },
  {
    id: 'grades-3-4', name: 'דף 3: כיתות ג–ד — האות הבאה', title: 'פענחו את ההודעה: האות הבאה',
    rule: 'כל אות הוחלפה באות שאחריה. חוזרים אות אחת אחורה וכותבים אותה מתחת.', cipher: 'shift', key: 1,
    messages: ['הסוד מתחבא מתחת לשולחן', 'פגישה סודית אחרי ההפסקה', 'הכלב שלי יודע לשמור סוד'],
    mirror: 'כל הכבוד בלש צעיר',
  },
  {
    id: 'grades-5-6', name: 'דף 4: כיתות ה–ו — א״ת ב״ש', title: 'פענחו את ההודעה: א״ת ב״ש',
    rule: 'הא״ב מתהפך: א מתחלפת ב־ת, ב מתחלפת ב־ש. כותבים מתחת לכל אות את בת הזוג שלה.', cipher: 'atbash',
    messages: ['כל המטמון קבור מתחת לעץ הזית', 'מי שקורא את זה הוא בלש אמיתי', 'הסיסמה של היום היא עוגה בוגה', 'מחר בשעה שמונה ליד העץ הגדול'],
    tanakh: { code: 'ששך', answer: 'בבל' },
  },
]
