// Lunchbox notes: the ready note bank + pure helpers for the custom note maker
// (sheet layout, text fitting, filling empty notes, draft encoding). No React here,
// so tests/lunchbox-notes.test.mjs can import it directly.

export const NOTES = {
  love: ['אוהבים אותך עד הירח וחזרה', 'את/ה הכי מיוחד/ת שיש', 'שיהיה לך יום מעולה!', 'אני גאה בך', 'מחכה לשמוע איך היה', 'חיבוק גדול מהבית', 'את/ה אמיץ/ה וחכם/ה', 'תהנה/י בהפסקה!', 'גם כשקשה — את/ה מצליח/ה', 'נתראה אחרי הצהריים', 'שולחים לך נשיקה', 'את/ה מאיר/ה לי את היום'],
  jokes: ['למה הספר היה עצוב? כי היו לו הרבה בעיות', 'מה אומר אפס לשמונה? איזו חגורה יפה!', 'למה העגבנייה הסמיקה? כי ראתה את הסלט מתלבש', 'איך קוראים לדינוזאור שישן? דינו-נוחר', 'למה המחשב הלך לרופא? כי היה לו וירוס', 'מה השעון אמר לשעון? יש לך זמן?', 'למה הפרה לא משחקת כדורגל? כי היא תמיד בועטת בדלי', 'מה אומרת הדבורה כשהיא שמחה? זזזה כיף!', 'למה העיפרון שמח? כי היה לו חוד מצויין', 'מה אמר הירח לשמש? את מאירה לי את הלילה', 'מה הצבע של הרוח? שקוף', 'למה הציפור לא הולכת לבית ספר? כי היא כבר יודעת לעוף'],
  goals: ['היום אני מנסה משהו חדש', 'אומר/ת תודה למישהו', 'שואל/ת שאלה בשיעור', 'משחק/ת עם מישהו חדש בהפסקה', 'שותה מים!', 'אוכל/ת קודם את הירק', 'עוזר/ת לחבר/ה', 'מחייך/ת לפחות 5 פעמים', 'מספר/ת לי דבר אחד שלמדתי', 'מתאמץ/ת גם כשקשה', 'משאיר/ה את הקופסה ריקה 😉', 'כותב/ת יפה במחברת'],
}
export const BANK_KEYS = ['love', 'jokes', 'goals']

// Sheet viewBox (same proportions as the ready sheet: fits the A4 print area with the QR strip).
export const SHEET_W = 200
export const SHEET_H = 270
export const COUNTS = [6, 8, 9, 12]
const GRIDS = { 6: [2, 3], 8: [2, 4], 9: [3, 3], 12: [3, 4] }
export const MAX_NOTE = 70
export const MAX_NAME = 14

// Small seeded PRNG, so a "mix" stays the same between renders until the parent reshuffles.
export function rng(seed) {
  let a = (Number(seed) >>> 0) || 1
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export function shuffle(arr, seed) {
  const r = rng(seed), out = [...arr]
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1));[out[i], out[j]] = [out[j], out[i]] }
  return out
}

// Ready notes from the chosen categories ('mix' = all), shuffled by seed.
export function bankNotes(source = 'mix', seed = 1) {
  const keys = source === 'mix' ? BANK_KEYS : BANK_KEYS.filter(k => k === source)
  return shuffle(keys.flatMap(k => NOTES[k] || []), seed)
}

// The notes that go on the sheet: each typed note keeps its slot; empty slots are filled from
// the bank when `fill` is on (never repeating a note the parent already typed) or left blank
// for handwriting. `mixOrder` scatters the parent's notes among the ready ones.
export function fillNotes(custom, { count = 12, fill = true, source = 'mix', seed = 1, mixOrder = false } = {}) {
  const n = COUNTS.includes(count) ? count : 12
  const slots = Array.from({ length: n }, (_, i) => String((custom || [])[i] || '').trim().slice(0, MAX_NOTE))
  const used = new Set(slots.filter(Boolean))
  const pool = fill ? bankNotes(source, seed).filter(t => !used.has(t)) : []
  let k = 0
  const notes = slots.map(text => (text ? { text, own: true } : { text: pool.length ? pool[k++ % pool.length] : '', own: false }))
  return mixOrder ? shuffle(notes, seed * 7 + 3) : notes
}

// Cell rectangles for a sheet, numbered the Hebrew way: first note top-right.
export function sheetCells(count = 12, { w = SHEET_W, h = SHEET_H, margin = 4, gap = 4 } = {}) {
  const [cols, rows] = GRIDS[count] || GRIDS[12]
  const cw = (w - margin * 2 - gap * (cols - 1)) / cols
  const ch = (h - margin * 2 - gap * (rows - 1)) / rows
  const cells = []
  for (let i = 0; i < cols * rows; i++) {
    const col = i % cols, row = Math.floor(i / cols)
    cells.push({ x: w - margin - cw - col * (cw + gap), y: margin + row * (ch + gap), w: cw, h: ch, col, row })
  }
  return { cols, rows, cw, ch, cells }
}

// Word-wrap to at most `maxChars` per line (long single words are split).
export function wrapText(text, maxChars) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean)
  const lines = []
  let cur = ''
  for (let w of words) {
    while (w.length > maxChars) { if (cur) { lines.push(cur); cur = '' } lines.push(w.slice(0, maxChars)); w = w.slice(maxChars) }
    const next = cur ? `${cur} ${w}` : w
    if (next.length > maxChars && cur) { lines.push(cur); cur = w } else cur = next
  }
  if (cur) lines.push(cur)
  return lines
}

// Largest font size (≤ base) at which the text fits a box of w×h (SVG units).
// Hebrew glyphs average ~0.55em wide; line height is 1.25em.
export function fitText(text, w, h, base) {
  for (let size = base; size >= 3; size = Math.round((size - 0.3) * 10) / 10) {
    const maxChars = Math.max(4, Math.floor(w / (size * 0.55)))
    const lines = wrapText(text, maxChars)
    if (lines.length * size * 1.25 <= h) return { size, lines }
  }
  const size = 3
  return { size, lines: wrapText(text, Math.max(4, Math.floor(w / (size * 0.55)))) }
}

// Draft <-> URL hash (#d=…). The hash never reaches a server; it lets a parent send the
// exact sheet to the other parent or grandma on WhatsApp.
const DRAFT_KEYS = ['name', 'sign', 'texts', 'count', 'fill', 'source', 'mixOrder', 'palette', 'frame', 'emoji', 'size', 'seed']
export function cleanDraft(d, defaults) {
  const out = { ...defaults }
  if (!d || typeof d !== 'object') return out
  for (const k of DRAFT_KEYS) if (k in d && typeof d[k] === typeof defaults[k]) out[k] = d[k]
  out.count = COUNTS.includes(out.count) ? out.count : defaults.count
  out.name = String(out.name).slice(0, MAX_NAME)
  out.sign = String(out.sign).slice(0, MAX_NAME)
  out.texts = Array.isArray(d.texts) ? d.texts.slice(0, 12).map(t => String(t || '').slice(0, MAX_NOTE)) : defaults.texts
  return out
}
export function encodeDraft(d) {
  const bytes = new TextEncoder().encode(JSON.stringify(d))
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
export function decodeDraft(s) {
  try {
    const bin = atob(String(s).replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))))
  } catch { return null }
}
