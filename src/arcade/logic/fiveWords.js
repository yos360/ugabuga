// "5 אותיות" — the five-letter word-guessing mode of /online-games/word-guess.
// Six tries to find a five-letter Hebrew word; each guess colours its letters:
// hit = right letter in the right place, near = in the word but elsewhere, miss = not in the word.
// Final letters count as their regular letter (ם = מ), and the last letter is shown in final form.

export const WORD_LEN = 5
export const MAX_TRIES = 6
const FINAL = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' }
const TO_FINAL = { 'כ': 'ך', 'מ': 'ם', 'נ': 'ן', 'פ': 'ף', 'צ': 'ץ' }
export const norm = ch => FINAL[ch] || ch
export const BASE_LETTERS = 'אבגדהוזחטיכלמנסעפצקרשת'
export const isBase = ch => BASE_LETTERS.includes(norm(ch))
export const normWord = w => [...w].map(norm).join('')
// Show the letter at `i` as it is written: final form at the end of the word.
export const shown = (ch, i) => (i === WORD_LEN - 1 && TO_FINAL[ch]) || ch

// Common, child-friendly five-letter words (full spelling). Checked in tests: 5 Hebrew letters,
// final forms only at the end, no duplicates.
export const FIVE_WORDS = [
  'שולחן', 'מחברת', 'מספרה', 'ארנבת', 'גלידה', 'בננות', 'תותים', 'אבטיח', 'לימון',
  'רימון', 'אפרסק', 'קיפוד', 'צפרדע', 'ינשוף', 'עכביש', 'דבורה', 'ציפור', 'תוכים', 'סוסים',
  'כלבים', 'חתולה', 'אריות', 'זברות', 'קופים', 'פילים', 'כבשים', 'ברווז', 'יונים', 'זאבים',
  'דובים', 'חסידה', 'מדוזה', 'תמנון', 'סוודר', 'חולצה', 'חצאית', 'כפפות', 'תיקים',
  'מקלדת', 'טלפון', 'מצלמה', 'מנורה', 'שמיכה', 'מרפסת', 'מעלית', 'דלתות', 'ספרים', 'מחקים',
  'לוחות', 'מורים', 'תלמיד', 'כיתות', 'הפסקה', 'שיעור', 'חופשה', 'משאית', 'צוללת', 'מונית',
  'רמזור', 'גשרים', 'ארמון', 'מלכים', 'נסיכה', 'דרקון', 'שחייה', 'קפיצה', 'קלפים', 'בובות',
  'נדנדה', 'מגלשה', 'צבעים', 'מכחול', 'פסלים', 'שירים', 'גיטרה', 'פסנתר', 'תופים', 'כינור',
  'עוגות', 'סלטים', 'חביתה', 'ביצים', 'פיתות', 'חומוס', 'פלאפל', 'שניצל', 'קציצה', 'אפונה',
  'גזרים', 'בצלים', 'ענבים', 'אגסים', 'קיווי', 'גבינה', 'קינוח', 'מסטיק', 'ארטיק', 'מיצים',
  'בקבוק', 'כוסות', 'סירים', 'עננים', 'גשמים', 'ברקים', 'רעמים', 'רוחות', 'קרחון', 'נהרות',
  'אגמים', 'יערות', 'פרחים', 'שושנה', 'כלנית', 'נרקיס', 'סביון', 'ענפים', 'זרעים', 'אבנים',
  'סלעים', 'אוויר', 'מקלחת', 'מברשת', 'רופאה', 'שוטרת', 'כבאית', 'חקלאי', 'טבחית', 'ציירת',
  'חללית', 'טילים', 'מאדים', 'שבתאי', 'רובוט', 'משפחה', 'אחיות', 'דודים', 'חברים', 'שכנים',
  'תינוק', 'ילדים', 'מסיבה', 'מתנות', 'הפתעה', 'חגיגה', 'ברכות', 'חיבוק', 'נשיקה', 'לילות',
  'רגעים', 'חנוכה', 'לביבה', 'פורים', 'מסכות', 'סוכות', 'אתרוג', 'בריכה', 'קניון', 'מסעדה',
  'מדינה', 'דגלים', 'מנעול', 'מילים', 'סיפור', 'חידות', 'שאלות', 'תשובה', 'רעיון',
  'מחשבה', 'חוכמה', 'בבקשה', 'סליחה', 'יהלום', 'חבלים', 'מדורה', 'פנסים', 'תרמיל',
  'מפלים', 'מעיין', 'בארות', 'זחלים', 'אפרוח', 'עגלים', 'גדיים', 'גמלים', 'נמרים', 'עופות',
  'נשרים', 'שבלול', 'נחשים', 'זיקית',
]

// Same order for everyone: a fixed shuffle of the list, one word per Israeli calendar day.
function shuffled(list, seed) {
  const a = [...list]
  let s = seed >>> 0
  const rnd = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1));[a[i], a[j]] = [a[j], a[i]] }
  return a
}
const DAILY_ORDER = shuffled(FIVE_WORDS, 20261011)
export const dailyWord = day => DAILY_ORDER[((day % DAILY_ORDER.length) + DAILY_ORDER.length) % DAILY_ORDER.length]
export const randomWord = (rand = Math.random, avoid) => {
  for (let t = 0; t < 20; t++) { const w = FIVE_WORDS[Math.floor(rand() * FIVE_WORDS.length)]; if (w !== avoid) return w }
  return FIVE_WORDS[0]
}

// Colour a guess against the answer (both compared without final forms). Repeated letters are
// handled like the classic game: exact hits first, then each remaining answer letter can mark one "near".
export function scoreGuess(guess, answer) {
  const g = [...normWord(guess)], a = [...normWord(answer)]
  const res = Array(WORD_LEN).fill('miss')
  const left = {}
  for (let i = 0; i < WORD_LEN; i++) { if (g[i] === a[i]) res[i] = 'hit'; else left[a[i]] = (left[a[i]] || 0) + 1 }
  for (let i = 0; i < WORD_LEN; i++) if (res[i] !== 'hit' && left[g[i]] > 0) { res[i] = 'near'; left[g[i]]-- }
  return res
}
const RANK = { miss: 1, near: 2, hit: 3 }
// Best state of every letter used so far, for colouring the keyboard.
export function keyStates(rows, answer) {
  const out = {}
  for (const row of rows) scoreGuess(row, answer).forEach((st, i) => { const l = norm([...row][i]); if (!out[l] || RANK[st] > RANK[out[l]]) out[l] = st })
  return out
}
export const shareGrid = (rows, answer) => rows.map(r => scoreGuess(r, answer).map(s => s === 'hit' ? '🟩' : s === 'near' ? '🟨' : '⬜').join('')).join('\n')
