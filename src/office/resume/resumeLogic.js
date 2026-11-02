// Pure data logic for /tools/resume: model defaults, sanitising, list helpers, in-place edit paths,
// undo history and a rough one-page estimate. No DOM, no network — everything stays in the browser.

export const STORE_KEY = 'ugabuga-resume-v1'
export const PAGE_W_MM = 210
export const PAGE_H_MM = 297
export const PX_PER_MM = 96 / 25.4

// Sections in their default reading order. "contact" is a pseudo-section used by sidebar templates.
export const SECTIONS = ['summary', 'experience', 'military', 'education', 'languages', 'skills', 'volunteer', 'hobbies']
export const LIST_SECTIONS = ['experience', 'education', 'military']
export const TEXT_SECTIONS = ['summary', 'skills', 'volunteer', 'hobbies']
export const OPTIONAL_SECTIONS = ['military', 'volunteer', 'hobbies']

export const DEFAULT_LABELS = {
  contact: 'פרטי קשר',
  summary: 'תקציר',
  experience: 'ניסיון תעסוקתי',
  education: 'השכלה',
  military: 'שירות צבאי / לאומי',
  languages: 'שפות',
  skills: 'כישורים',
  volunteer: 'התנדבות',
  hobbies: 'תחביבים',
}

const LIMIT = { short: 120, long: 1500, items: 20, extras: 40 }

let seq = 0
export const newId = (p = 'i') => `${p}${Date.now().toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 5)}`

export function newItem(section) {
  if (section === 'languages') return { id: newId('l'), name: '', level: '' }
  return { id: newId(section[0]), title: '', place: '', years: '', text: '' }
}

export function emptyCv() {
  return {
    personal: { name: '', title: '', phone: '', email: '', city: '', link: '', photo: '' },
    summary: '',
    experience: [newItem('experience')],
    education: [newItem('education')],
    military: [],
    languages: [newItem('languages')],
    skills: '',
    volunteer: '',
    hobbies: '',
    labels: {},
    order: null,
  }
}

export const emptyState = () => ({ cv: emptyCv(), design: { template: 'classic', accent: '', compact: false }, extras: [] })

// A fictional sample used for the "fill an example" button and the template thumbnails.
export function sampleCv() {
  return {
    personal: { name: 'נועה לוי', title: 'רכזת שירות לקוחות', phone: '050-1234567', email: 'noa.levi@example.com', city: 'פתח תקווה', link: '', photo: '' },
    summary: 'אחראית, סבלנית ואוהבת אנשים. שלוש שנות ניסיון בשירות ובמכירות, רגילה לעבוד מול יעדים ולפתור בעיות בזמן אמת.',
    experience: [
      { id: 'se1', title: 'נציגת שירות בכירה', place: 'חברת תקשורת, פתח תקווה', years: '2022 – היום', text: 'מענה ל-60 פניות ביום בטלפון ובצ׳אט\nהדרכת 5 נציגים חדשים ושיפור שביעות הרצון ב-12%' },
      { id: 'se2', title: 'מוכרת', place: 'רשת אופנה, קניון הגדול', years: '2020 – 2022', text: 'עמידה ביעדי מכירות חודשיים, סידור תצוגה וניהול מלאי' },
    ],
    education: [
      { id: 'sd1', title: 'תואר ראשון בכלכלה וניהול (בלימודים)', place: 'האוניברסיטה הפתוחה', years: '2023 – היום', text: '' },
      { id: 'sd2', title: 'בגרות מלאה, מגמת ביולוגיה', place: 'תיכון אורט', years: '2017', text: '' },
    ],
    military: [{ id: 'sm1', title: 'מש״קית ת״ש', place: 'חיל האוויר', years: '2018 – 2020', text: 'ליווי 120 חיילים ופתרון בעיות אישיות' }],
    languages: [{ id: 'sl1', name: 'עברית', level: 'שפת אם' }, { id: 'sl2', name: 'אנגלית', level: 'טובה מאוד' }, { id: 'sl3', name: 'רוסית', level: 'בסיסית' }],
    skills: 'Excel ו-Google Sheets\nמערכות CRM\nעבודה בצוות\nהקלדה עיוורת',
    volunteer: 'חונכת לימודית לנוער, עמותת „מחשבה טובה” (2021 – היום)',
    hobbies: 'ריצה, צילום, בישול',
    labels: {},
    order: null,
  }
}

// ── sanitising (anything read from localStorage is untrusted) ──
const str = (v, max = LIMIT.short) => (typeof v === 'string' ? v : v == null ? '' : String(v)).replace(/\r/g, '').slice(0, max)
const num = (v, lo, hi, d) => { const n = Number(v); return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d }
const okId = v => (typeof v === 'string' && /^[\w-]{1,40}$/.test(v) ? v : newId())
const PHOTO_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/
export const safePhoto = v => (typeof v === 'string' && v.length < 600000 && PHOTO_RE.test(v) ? v : '')

function cleanList(list, section) {
  if (!Array.isArray(list)) return []
  const seen = new Set()
  return list.slice(0, LIMIT.items).filter(x => x && typeof x === 'object').map(x => {
    let id = okId(x.id)
    if (seen.has(id)) id = newId()
    seen.add(id)
    if (section === 'languages') return { id, name: str(x.name), level: str(x.level) }
    return { id, title: str(x.title), place: str(x.place), years: str(x.years, 60), text: str(x.text, LIMIT.long) }
  })
}

export function sanitizeCv(raw) {
  const r = raw && typeof raw === 'object' ? raw : {}
  const p = r.personal && typeof r.personal === 'object' ? r.personal : {}
  const labels = {}
  if (r.labels && typeof r.labels === 'object') for (const k of Object.keys(DEFAULT_LABELS)) if (typeof r.labels[k] === 'string' && r.labels[k].trim()) labels[k] = str(r.labels[k], 60)
  const order = Array.isArray(r.order) ? r.order.filter((s, i, a) => SECTIONS.includes(s) && a.indexOf(s) === i) : null
  return {
    personal: { name: str(p.name), title: str(p.title), phone: str(p.phone, 40), email: str(p.email, 80), city: str(p.city), link: str(p.link), photo: safePhoto(p.photo) },
    summary: str(r.summary, LIMIT.long),
    experience: cleanList(r.experience),
    education: cleanList(r.education),
    military: cleanList(r.military),
    languages: cleanList(r.languages, 'languages'),
    skills: str(r.skills, LIMIT.long),
    volunteer: str(r.volunteer, LIMIT.long),
    hobbies: str(r.hobbies, LIMIT.long),
    labels,
    order: order && order.length === SECTIONS.length ? order : null,
  }
}

export const EXTRA_KINDS = ['text', 'line', 'accent', 'dots']
export function sanitizeExtras(raw) {
  if (!Array.isArray(raw)) return []
  return raw.slice(0, LIMIT.extras).filter(x => x && EXTRA_KINDS.includes(x.kind)).map(x => ({
    id: okId(x.id),
    kind: x.kind,
    x: num(x.x, 0, PAGE_W_MM - 5, 20),
    y: num(x.y, 0, PAGE_H_MM * 3, 40),
    w: num(x.w, 8, PAGE_W_MM, x.kind === 'accent' ? 25 : 80),
    size: num(x.size, 7, 28, 11),
    bold: !!x.bold,
    text: x.kind === 'text' ? str(x.text, 400) : '',
  }))
}

export function sanitizeState(raw, templateIds = null) {
  const r = raw && typeof raw === 'object' ? raw : {}
  const d = r.design && typeof r.design === 'object' ? r.design : {}
  let template = typeof d.template === 'string' ? d.template : 'classic'
  if (templateIds && !templateIds.includes(template)) template = templateIds[0]
  const accent = typeof d.accent === 'string' && /^#[0-9a-f]{6}$/i.test(d.accent) ? d.accent : ''
  return { cv: sanitizeCv(r.cv), design: { template, accent, compact: !!d.compact }, extras: sanitizeExtras(r.extras) }
}

export function loadState(storage, templateIds) {
  try {
    const s = storage && storage.getItem(STORE_KEY)
    return s ? sanitizeState(JSON.parse(s), templateIds) : null
  } catch { return null }
}
export function saveState(storage, state) {
  try { storage.setItem(STORE_KEY, JSON.stringify(state)); return true } catch { return false }
}

// ── list helpers (immutable) ──
export const addItem = (list, section) => [...list, newItem(section)].slice(0, LIMIT.items)
export const removeItem = (list, id) => list.filter(x => x.id !== id)
export const updateItem = (list, id, patch) => list.map(x => (x.id === id ? { ...x, ...patch } : x))
export function moveItem(list, id, dir) {
  const i = list.findIndex(x => x.id === id), j = i + dir
  if (i < 0 || j < 0 || j >= list.length) return list
  const out = [...list];[out[i], out[j]] = [out[j], out[i]]
  return out
}
export function moveSection(order, id, dir) {
  const list = order || SECTIONS
  const i = list.indexOf(id), j = i + dir
  if (i < 0 || j < 0 || j >= list.length) return [...list]
  const out = [...list];[out[i], out[j]] = [out[j], out[i]]
  return out
}

// Lines of a multi-line field, without empty lines and without typed bullet marks.
export const lines = text => String(text || '').split('\n').map(l => l.replace(/^\s*[-•*·–]\s*/, '').trim()).filter(Boolean)

// Replace line i of a multi-line text; an empty value removes it, a value with newlines adds lines.
export function setLine(text, i, value) {
  const ls = lines(text)
  const add = lines(value)
  if (i >= ls.length) ls.push(...add)
  else ls.splice(i, 1, ...add)
  return ls.join('\n')
}

// Write one value at a path coming from the in-place editor:
// ['personal','name'] · ['summary'] · ['skills', 2] · ['labels','skills'] · ['experience', id, 'title'] · ['experience', id, 'text', 1]
export function setPath(cv, path, value) {
  const [head, a, b, c] = path
  const v = String(value ?? '').replace(/\r/g, '')
  if (head === 'personal') return a in cv.personal && a !== 'photo' ? { ...cv, personal: { ...cv.personal, [a]: v.trim() } } : cv
  if (head === 'labels') return a in DEFAULT_LABELS ? { ...cv, labels: { ...cv.labels, [a]: v.trim() } } : cv
  if (TEXT_SECTIONS.includes(head)) return { ...cv, [head]: typeof a === 'number' ? setLine(cv[head], a, v) : v.trim() }
  if (LIST_SECTIONS.includes(head) || head === 'languages') {
    const item = cv[head].find(x => x.id === a)
    if (!item || !(b in item) || b === 'id') return cv
    const nv = b === 'text' && typeof c === 'number' ? setLine(item.text, c, v) : v.trim()
    return { ...cv, [head]: updateItem(cv[head], a, { [b]: nv }) }
  }
  return cv
}

export const label = (cv, s) => (cv.labels && cv.labels[s]) || DEFAULT_LABELS[s]

const filled = it => Object.entries(it).some(([k, v]) => k !== 'id' && typeof v === 'string' && v.trim())
export function hasContent(cv, s) {
  if (s === 'contact') return ['phone', 'email', 'city', 'link'].some(k => cv.personal[k])
  if (LIST_SECTIONS.includes(s) || s === 'languages') return cv[s].some(filled)
  return !!String(cv[s] || '').trim()
}
export const isEmptyCv = cv => !cv.personal.name && !SECTIONS.some(s => hasContent(cv, s))

// Rough page estimate in "lines" (about 50 fit on one A4 page in the normal density).
export function estimateLines(cv) {
  const wrap = (t, w = 85) => lines(t).reduce((n, l) => n + Math.max(1, Math.ceil(l.length / w)), 0)
  let n = 6
  for (const s of SECTIONS) {
    if (!hasContent(cv, s)) continue
    n += 2.5
    if (LIST_SECTIONS.includes(s)) for (const it of cv[s].filter(filled)) n += 1.6 + wrap(it.text)
    else if (s === 'languages') n += Math.ceil(cv.languages.filter(filled).length / 2)
    else if (s === 'skills') n += Math.ceil(lines(cv.skills).length / 2)
    else n += wrap(cv[s], 95)
  }
  return Math.round(n)
}
export const estimatePages = cv => Math.max(1, Math.ceil(estimateLines(cv) / 50))

// ── undo history: typing in one field within a second is one step ──
export const HISTORY_MAX = 80
export function pushHistory(stack, snapshot, key, now) {
  const last = stack[stack.length - 1]
  if (last && key && last.key === key && now - last.t < 1200) return [...stack.slice(0, -1), { ...last, t: now }]
  return [...stack, { s: snapshot, key, t: now }].slice(-HISTORY_MAX)
}

export function fileTitle(cv) {
  const name = cv.personal.name.replace(/[\\/:*?"<>|]+/g, '').trim()
  return name ? `קורות חיים - ${name}` : 'קורות חיים'
}

export const ACCENTS = ['#1f3a5f', '#0f766e', '#4338ca', '#9d174d', '#7c2d12', '#15803d', '#b45309', '#334155', '#111827']
