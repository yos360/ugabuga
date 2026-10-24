// Texts and pure helpers for /speech/tools/practice-sheets — printable forms for speech-language
// clinicians: a home practice log, a letter to parents, a data-tracking sheet, session notes,
// certificates and a sticker chart. Wording follows the chosen gender: 'm' (ילד), 'f' (ילדה) or
// 'n' (a general form with a slash, ילד/ה). Nothing here stores or sends anything — the page keeps
// the child's name in memory only.

import { wordsFor } from './sounds.js'

export const PATH = '/speech/tools/practice-sheets'

export const SHEET_TYPES = [
  ['log', 'יומן תרגול בבית'],
  ['letter', 'מכתב להורים'],
  ['data', 'טבלת נתונים לקלינאית'],
  ['notes', 'סיכום פגישה'],
  ['cert', 'תעודות'],
  ['chart', 'לוח מדבקות'],
  ['kit', 'ערכה: יומן + מכתב + נתונים + סיכום'],
]
export const KIT = ['letter', 'log', 'data', 'notes']

export const GENDERS = [['m', 'ילד'], ['f', 'ילדה'], ['n', 'ניסוח כללי (ילד/ה)']]

// Pick the wording for the chosen gender.
export const gw = (gender, m, f, n = `${m}/${f}`) => (gender === 'f' ? f : gender === 'm' ? m : n)

export const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

export const CUE_LEVELS = [
  ['ע', 'עצמאי', 'אומר/ת בלי עזרה'],
  ['ר', 'רמז', 'רמז מילולי, חזותי או תנועתי'],
  ['ח', 'חיקוי', 'חוזר/ת אחרי דגם של המבוגר'],
]

export const TRIAL_MARKS = [['+', 'נכון'], ['−', 'לא נכון'], ['~', 'בקירוב']]

export const CERT_TYPES = [
  ['champ', 'אלוף/ת הצליל'],
  ['week', 'תרגלתי כל השבוע'],
  ['finish', 'תעודת סיום טיפול'],
]

export const CHART_THEMES = [
  { id: 'space', label: 'מסע לירח', start: '🚀', end: '🌕', deco: ['⭐', '🪐', '✨', '☄️'], sub: 'כל תרגול מקרב את החללית לירח' },
  { id: 'garden', label: 'מזחל לפרפר', start: '🐛', end: '🦋', deco: ['🌼', '🍃', '🌷', '🐞'], sub: 'כל תרגול עוד צעד בשביל הגינה' },
  { id: 'sea', label: 'שחייה לאי', start: '🐠', end: '🏝️', deco: ['🐚', '🌊', '🐙', '⭐'], sub: 'כל תרגול עוד משיכת סנפיר אל האי' },
  { id: 'train', label: 'הרכבת לתחנה', start: '🚂', end: '🚉', deco: ['🌳', '🚦', '🌻', '☁️'], sub: 'כל תרגול עוד קרון במסילה' },
]
export const CHART_CIRCLES = 21

// The default target words for a sound and position: up to `n`, the pictured ones first.
export function defaultWords(data, position = 'initial', n = 10) {
  if (!data) return []
  const list = wordsFor(data, position).map(w => ({ t: w.w, e: w.e }))
  return [...list.filter(w => w.e), ...list.filter(w => !w.e)].slice(0, n)
}

export function defaultSentences(data, n = 4) {
  return (data?.sentences || []).slice(0, n).map(s => s.t)
}

// Words and emoji of a sound, for picturing words the clinician typed or kept.
export function emojiLookup(data) {
  const map = new Map()
  if (!data) return map
  for (const w of wordsFor(data, 'all')) if (w.e) map.set(w.w, w.e)
  for (const k of ['phrases', 'sentences']) for (const x of data[k] || []) if (x.e) map.set(x.t, x.e)
  return map
}

export const lines = text => String(text || '').split('\n').map(s => s.trim()).filter(Boolean)
export const itemsFromText = (text, lookup = new Map(), max = 12) => lines(text).slice(0, max).map(t => ({ t, e: lookup.get(t) }))

// Who the letter talks about: the name if given, otherwise "your son / your daughter".
const kidRef = (name, gender) => (name || '').trim() || gw(gender, 'בנכם', 'בתכם', 'ילדכם')
const kidHe = (name, gender) => (name || '').trim() || gw(gender, 'הוא', 'היא', 'הילד/ה')

export function letterIntro({ name = '', gender = 'n', soundLabel = '', posLabel = '', goal = '' } = {}) {
  const kid = kidRef(name, gender)
  const target = soundLabel ? `על הצליל ${soundLabel}${posLabel ? ` ${posLabel}` : ''}` : 'על הדיבור'
  const parts = [
    `בפגישות האחרונות עבדנו עם ${kid} ${target}.`,
    goal.trim() ? `המטרה שלנו כרגע: ${goal.trim().replace(/[.。]+$/, '')}.` : '',
    `${(name || '').trim() || gw(gender, 'הוא', 'היא', 'הילד/ה')} ${gw(gender, 'מתאמץ', 'מתאמצת', 'מתאמץ/ת')} ${gw(gender, 'ומתקדם', 'ומתקדמת', 'ומתקדם/ת')} יפה, ותרגול קצר בבית — כמה דקות ביום — עוזר להעביר את מה שמתרגלים בפגישה אל הדיבור של כל יום.`,
    'בדף הזה תמצאו את המילים והמשפטים של השבוע ורעיונות לתרגול קצר ונעים. תודה על השותפות!',
  ]
  return parts.filter(Boolean).join(' ')
}

export function practiceSteps({ name = '', gender = 'n' } = {}) {
  const he = kidHe(name, gender)
  return [
    'בוחרים זמן קבוע ורגוע — אחרי ארוחה, באמבטיה או לפני השינה. 5 דקות מספיקות.',
    `אומרים כל מילה ברור ולאט, ו${he} ${gw(gender, 'חוזר', 'חוזרת', 'חוזר/ת')} אחריכם — 3 עד 5 פעמים כל מילה.`,
    'הופכים את זה למשחק: מחבואים לכרטיסים, זריקת קובייה, "מי אומר ראשון" או צעד על כל מילה.',
    'כשהמילים כבר קלות — עוברים למשפטים שבדף, ואחר כך לשיחה קצרה עם המילים.',
    'מדביקים מדבקה ביומן התרגול ומביאים אותו לפגישה הבאה.',
  ]
}

export function praiseTips({ gender = 'n' } = {}) {
  const to = gw(gender, 'לו', 'לה', 'לו/לה')
  return [
    'משבחים את המאמץ ולא רק את התוצאה: "איזה יופי שניסית שוב!"',
    'כשמילה יוצאת לא מדויקת — פשוט אומרים אותה נכון בעצמכם, בטבעיות, בלי "לא, תגיד ככה".',
    'עוצרים כשעוד נהנים: עדיף תרגול קצר ושמח מארוך ומתיש.',
    `מספרים ${to} שאתם רואים את ההתקדמות — ומשתפים את הקלינאית במה שעבד.`,
  ]
}

// Certificate wording: { title, lines[] } — lines go under the name.
export function certificateText(kind, { gender = 'n', soundLabel = '' } = {}) {
  if (kind === 'week') return {
    title: 'תרגלתי כל השבוע!',
    lines: [`${gw(gender, 'תרגל', 'תרגלה', 'תרגל/ה')} בבית כל יום השבוע`, 'איזו התמדה — כל הכבוד!'],
  }
  if (kind === 'finish') return {
    title: 'תעודת סיום',
    lines: [`${gw(gender, 'סיים', 'סיימה', 'סיים/ה')} בהצלחה את המפגשים שלנו בקלינאות תקשורת`, 'למדנו, שיחקנו, התאמצנו והתקדמנו — אנחנו גאים בך!'],
  }
  return {
    title: gw(gender, 'תעודת אלוף הצליל', 'תעודת אלופת הצליל', 'תעודת אלוף/ת הצליל'),
    lines: [`${gw(gender, 'הוא אלוף', 'היא אלופת', 'אלוף/ת')} הצליל${soundLabel ? ` ${soundLabel}` : ''}!`, 'על תרגול מתמיד, אוזן קשבת והאומץ לנסות שוב ושוב'],
  }
}

// Percent of correct trials, rounded; '' when nothing was counted (or the numbers make no sense).
export function percent(correct, total) {
  const c = Number(correct), t = Number(total)
  if (!Number.isFinite(c) || !Number.isFinite(t) || t <= 0 || c < 0 || c > t) return ''
  return Math.round((c / t) * 100)
}

// 21 circles on a winding path: three rows of seven, right-to-left, then left-to-right, then back.
export function chartPath(n = CHART_CIRCLES, { cols = 7, x0 = 26, x1 = 174, y0 = 92, dy = 52 } = {}) {
  const step = (x1 - x0) / (cols - 1)
  return Array.from({ length: n }, (_, i) => {
    const row = Math.floor(i / cols), col = i % cols
    const x = row % 2 === 0 ? x1 - col * step : x0 + col * step
    return { x: +x.toFixed(2), y: y0 + row * dy, n: i + 1 }
  })
}
