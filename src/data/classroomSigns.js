// Classroom / schedule-board signs (/printables/classroom-signs).
// Each sign: id, title (he), the same title with niqqud (nq), an optional subtitle, an icon id
// (drawn in ClassroomSigns.jsx), a colour and its group. `nq` uses the defective spelling of pointed
// text (חִנּוּךְ for חינוך); tests/classroom-signs.test.mjs checks that apart from י/ו it strips back to `he`.
export const SIGN_GROUPS = [
  ['subjects', 'מקצועות'],
  ['day', 'בין השיעורים'],
  ['week', 'ימות השבוע'],
]

export const SIGNS = [
  { id: 'math', he: 'חשבון', nq: 'חֶשְׁבּוֹן', icon: 'math', color: '#e2604c', group: 'subjects' },
  { id: 'mathematics', he: 'מתמטיקה', nq: 'מָתֵמָטִיקָה', icon: 'math', color: '#e2604c', group: 'subjects' },
  { id: 'hebrew', he: 'עברית', nq: 'עִבְרִית', icon: 'letters', color: '#4f7fd9', group: 'subjects' },
  { id: 'lashon', he: 'לשון', nq: 'לָשׁוֹן', icon: 'pencil', color: '#4f7fd9', group: 'subjects' },
  { id: 'english', he: 'אנגלית', nq: 'אַנְגְּלִית', icon: 'abc', color: '#d9508a', group: 'subjects' },
  { id: 'science', he: 'מדעים', nq: 'מַדָּעִים', icon: 'flask', color: '#2fa774', group: 'subjects' },
  { id: 'tanakh', he: 'תנ״ך', nq: 'תַּנַ״ךְ', icon: 'tablets', color: '#b07a3a', group: 'subjects' },
  { id: 'torah', he: 'תורה', nq: 'תּוֹרָה', icon: 'scroll', color: '#9a6a3c', group: 'subjects' },
  { id: 'history', he: 'היסטוריה', nq: 'הִיסְטוֹרְיָה', icon: 'hourglass', color: '#c28a2c', group: 'subjects' },
  { id: 'geography', he: 'גאוגרפיה', nq: 'גֵּאוֹגְרַפְיָה', icon: 'globe', color: '#2b9cc0', group: 'subjects' },
  { id: 'moledet', he: 'מולדת', nq: 'מוֹלֶדֶת', icon: 'pin', color: '#5a9f48', group: 'subjects' },
  { id: 'jewish', he: 'תרבות יהודית', nq: 'תַּרְבּוּת יְהוּדִית', icon: 'menorah', color: '#3d6fb6', group: 'subjects' },
  { id: 'arthistory', he: 'תולדות האמנות', nq: 'תּוֹלְדוֹת הָאָמָּנוּת', icon: 'frame', color: '#8a5bb5', group: 'subjects' },
  { id: 'art', he: 'אמנות', nq: 'אָמָּנוּת', icon: 'palette', color: '#e07a2f', group: 'subjects' },
  { id: 'music', he: 'מוזיקה', nq: 'מוּזִיקָה', icon: 'notes', color: '#7a5cd6', group: 'subjects' },
  { id: 'dance', he: 'מחול', nq: 'מָחוֹל', icon: 'dance', color: '#d9559a', group: 'subjects' },
  { id: 'pe', he: 'חינוך גופני', nq: 'חִנּוּךְ גּוּפָנִי', icon: 'ball', color: '#ee8424', group: 'subjects' },
  { id: 'sport', he: 'ספורט', nq: 'סְפּוֹרְט', icon: 'ball', color: '#ee8424', group: 'subjects' },
  { id: 'zahav', he: 'זה״ב', nq: 'זְהַ״ב', sub: 'זהירות בדרכים', subNq: 'זְהִירוּת בַּדְּרָכִים', icon: 'traffic', color: '#d64545', group: 'subjects' },
  { id: 'life', he: 'כישורי חיים', nq: 'כִּשּׁוּרֵי חַיִּים', icon: 'heart', color: '#e05a6b', group: 'subjects' },
  { id: 'social3', he: 'שלישי חברתי', nq: 'שְׁלִישִׁי חֶבְרָתִי', icon: 'people', color: '#2a9f96', group: 'subjects' },
  { id: 'social', he: 'חברתי', nq: 'חֶבְרָתִי', icon: 'people', color: '#2a9f96', group: 'subjects' },
  { id: 'chinuch', he: 'חינוך', nq: 'חִנּוּךְ', icon: 'plant', color: '#46a865', group: 'subjects' },
  { id: 'library', he: 'ספרייה', nq: 'סִפְרִיָּה', icon: 'books', color: '#a0643a', group: 'subjects' },
  { id: 'reading', he: 'קריאה', nq: 'קְרִיאָה', icon: 'openbook', color: '#3b8bd0', group: 'subjects' },
  { id: 'computers', he: 'מחשבים', nq: 'מַחְשְׁבִים', icon: 'computer', color: '#4a6fa5', group: 'subjects' },
  { id: 'tech', he: 'טכנולוגיה', nq: 'טֶכְנוֹלוֹגְיָה', icon: 'gear', color: '#5f7d8c', group: 'subjects' },
  { id: 'arabic', he: 'ערבית', nq: 'עֲרָבִית', icon: 'bubbleAr', color: '#2e9a6b', group: 'subjects' },
  { id: 'texts', he: 'טקסטים', nq: 'טֶקְסְטִים', icon: 'quill', color: '#8c6a4f', group: 'subjects' },
  { id: 'recess', he: 'הפסקה', nq: 'הַפְסָקָה', icon: 'kite', color: '#eaa915', group: 'day' },
  { id: 'snack', he: 'ארוחת עשר', nq: 'אֲרוּחַת עֶשֶׂר', icon: 'sandwich', color: '#74ad3c', group: 'day' },
  { id: 'shabbat', he: 'שבת שלום', nq: 'שַׁבָּת שָׁלוֹם', icon: 'candles', color: '#c49a1f', group: 'day' },
  { id: 'sun', he: 'יום ראשון', nq: 'יוֹם רִאשׁוֹן', icon: 'day', letter: 'א׳', color: '#e2604c', group: 'week' },
  { id: 'mon', he: 'יום שני', nq: 'יוֹם שֵׁנִי', icon: 'day', letter: 'ב׳', color: '#ee8424', group: 'week' },
  { id: 'tue', he: 'יום שלישי', nq: 'יוֹם שְׁלִישִׁי', icon: 'day', letter: 'ג׳', color: '#d9a400', group: 'week' },
  { id: 'wed', he: 'יום רביעי', nq: 'יוֹם רְבִיעִי', icon: 'day', letter: 'ד׳', color: '#46a865', group: 'week' },
  { id: 'thu', he: 'יום חמישי', nq: 'יוֹם חֲמִישִׁי', icon: 'day', letter: 'ה׳', color: '#3b8bd0', group: 'week' },
  { id: 'fri', he: 'יום שישי', nq: 'יוֹם שִׁשִּׁי', icon: 'day', letter: 'ו׳', color: '#7a5cd6', group: 'week' },
]

// Icons a custom sign can use (id, label).
export const CUSTOM_ICONS = [
  ['star', '⭐ כוכב'], ['heart', '❤️ לב'], ['books', '📚 ספרים'], ['pencil', '✏️ עיפרון'], ['notes', '🎵 תווים'],
  ['ball', '🏀 כדור'], ['plant', '🌱 צמח'], ['people', '👥 חברים'], ['flask', '🧪 מבחנה'], ['globe', '🌍 גלובוס'], ['none', 'בלי ציור'],
]

export const DEFAULT_SIGNS = ['math', 'hebrew', 'english', 'science', 'tanakh', 'history', 'art', 'music', 'pe', 'recess', 'snack', 'shabbat']

// Hebrew points and cantillation marks (not ׳ or ״, which sit outside this range).
export const stripNiqqud = s => s.replace(/[֑-ׇ]/g, '')

// Sheet: 200×262 units (fits the printable area of an A4 page). Cards span the width, stacked,
// with a gap between them so each is cut out on its own dashed line.
export const SHEET_W = 200, SHEET_H = 262
const MARGIN = 4, GAP = 6
export function cardBoxes(perPage) {
  const h = (SHEET_H - 2 * MARGIN - GAP * (perPage - 1)) / perPage
  return Array.from({ length: perPage }, (_, i) => ({ x: MARGIN, y: MARGIN + i * (h + GAP), w: SHEET_W - 2 * MARGIN, h }))
}
export const chunk = (list, n) => Array.from({ length: Math.ceil(list.length / n) }, (_, i) => list.slice(i * n, i * n + n))

// Rough width of a bold Hebrew string, in em: letters ~0.62, spaces and geresh/gershayim narrower,
// points take no width.
export function textLen(s) {
  let w = 0
  for (const ch of stripNiqqud(s)) w += ch === ' ' ? 0.3 : ch === '״' || ch === '׳' ? 0.28 : 0.62
  return w
}

// Fit a title into a box `avail` wide on a card `h` tall: one line, or two when that lets the
// letters grow by 20%+ (multi-word titles like "תולדות האמנות"; `allowTwo` false keeps one line).
// Returns { lines, fs }.
export function fitTitle(title, avail, h, hasSub = false, allowTwo = true) {
  const maxFs = h * (hasSub ? 0.3 : 0.36)
  const one = Math.min(maxFs, avail / Math.max(textLen(title), 0.6))
  const words = title.trim().split(/\s+/)
  if (words.length < 2 || !allowTwo) return { lines: [title.trim()], fs: one }
  let best = null
  for (let i = 1; i < words.length; i++) {
    const lines = [words.slice(0, i).join(' '), words.slice(i).join(' ')]
    const fs = Math.min(avail / Math.max(...lines.map(textLen)), h * (hasSub ? 0.5 : 0.62) / 2.24)
    if (!best || fs > best.fs) best = { lines, fs }
  }
  return best.fs > one * 1.2 ? best : { lines: [title.trim()], fs: one }
}
