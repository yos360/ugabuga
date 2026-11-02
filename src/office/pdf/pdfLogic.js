// Pure helpers for /tools/pdf: page ranges, sizes, file names, a tiny ZIP writer, and the per-URL texts.
// No DOM and no heavy libraries here, so node:test can import it directly.

// ── page ranges: "1-3, 5, 8-" → [[1,2,3],[5],[8,9,10]] ──
// Accepts spaces, Hebrew/English commas and semicolons, any dash, the word "עד", and open ends ("8-", "-3").
export function parseRanges(text, max) {
  const src = String(text || '').replace(/[‐-―־~]/g, '-').replace(/\s*עד\s*/g, '-')
  const parts = src.split(/[,;،\n،]+/).map(s => s.trim()).filter(Boolean)
  if (!parts.length) return { groups: [], error: 'כתבו אילו עמודים, למשל 1-3, 5' }
  const groups = []
  for (const p of parts) {
    const m = p.replace(/\s+/g, '').match(/^(\d*)(-?)(\d*)$/)
    if (!m || (!m[1] && !m[3])) return { groups: [], error: `לא הבנו את "${p}". כותבים מספרים, למשל 1-3, 5` }
    let a = m[1] ? +m[1] : 1
    let b = m[2] ? (m[3] ? +m[3] : max) : a
    if (a < 1 || b < 1) return { groups: [], error: 'מספרי העמודים מתחילים מ-1' }
    if (a > max || b > max) return { groups: [], error: `יש רק ${max} עמודים בקובץ` }
    const step = a <= b ? 1 : -1
    const g = []
    for (let i = a; step > 0 ? i <= b : i >= b; i += step) g.push(i)
    groups.push(g)
  }
  return { groups, error: '' }
}

// "1-3, 5" from a sorted list of page numbers (for labels and file names)
export function describePages(nums) {
  const out = []
  for (let i = 0; i < nums.length; i++) {
    let j = i
    while (j + 1 < nums.length && nums[j + 1] === nums[j] + 1) j++
    out.push(j > i ? `${nums[i]}-${nums[j]}` : String(nums[i]))
    i = j
  }
  return out.join(', ')
}

// ── sizes ──
export function formatBytes(n) {
  if (!Number.isFinite(n) || n < 0) return ''
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`
  const mb = n / (1024 * 1024)
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`
}

// How much smaller, in whole percent (0 when it did not shrink).
export function savedPercent(before, after) {
  if (!before || after >= before) return 0
  return Math.round((1 - after / before) * 100)
}

// ── names ──
export function baseName(name) {
  const n = String(name || '').split(/[\\/]/).pop().replace(/\.[a-z0-9]{1,5}$/i, '').trim()
  return n || 'קובץ'
}

export function outName(base, suffix, ext) {
  // oxlint-disable-next-line no-control-regex -- control characters are exactly what file names can't hold
  const clean = s => String(s || '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim()
  const b = clean(base).slice(0, 80) || 'קובץ'
  const s = clean(suffix)
  return `${b}${s ? ' - ' + s : ''}.${ext}`
}

// ── kinds ──
const IMG_EXT = /\.(jpe?g|png|gif|webp|bmp|avif|heic|heif)$/i
export function fileKind(file) {
  const t = (file && file.type) || '', n = (file && file.name) || ''
  if (t === 'application/pdf' || /\.pdf$/i.test(n)) return 'pdf'
  if (t.startsWith('image/') || IMG_EXT.test(n)) return 'image'
  if (/\.docx$/i.test(n) || t === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx'
  if (/\.(doc|docm|dotx?|odt|rtf|pages)$/i.test(n) || t === 'application/msword') return 'word'
  return 'other'
}

// ── array move for drag-reorder ──
export function moveItem(list, from, to) {
  if (from === to || from < 0 || from >= list.length) return list
  const out = list.slice()
  const [it] = out.splice(from, 1)
  out.splice(Math.max(0, Math.min(to, out.length)), 0, it)
  return out
}

// Compression levels: render DPI and JPEG quality
export const COMPRESS = {
  light: { label: 'קלה', hint: 'איכות כמעט כמו המקור', dpi: 150, quality: 0.8 },
  normal: { label: 'רגילה', hint: 'מומלץ: קטן וקריא', dpi: 110, quality: 0.62 },
  strong: { label: 'חזקה', hint: 'הכי קטן, פחות חד', dpi: 80, quality: 0.45 },
}

// ── minimal ZIP writer (stored, no compression; PDFs and JPGs are already compressed) ──
let CRC_TABLE
export function crc32(bytes) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      CRC_TABLE[n] = c >>> 0
    }
  }
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

// files: [{ name, data: Uint8Array }] → Uint8Array of a .zip. Names are UTF-8 (flag bit 11), so Hebrew works.
export function makeZip(files, date = new Date()) {
  const enc = new TextEncoder()
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)
  const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  const used = new Set()
  const locals = [], centrals = []
  let offset = 0
  for (const f of files) {
    let name = f.name
    for (let k = 2; used.has(name); k++) name = f.name.replace(/(\.[^.]+)?$/, ` (${k})$1`)
    used.add(name)
    const nameBytes = enc.encode(name)
    const data = f.data
    const crc = crc32(data)
    const head = new DataView(new ArrayBuffer(30))
    head.setUint32(0, 0x04034b50, true); head.setUint16(4, 20, true); head.setUint16(6, 0x0800, true)
    head.setUint16(8, 0, true); head.setUint16(10, dosTime, true); head.setUint16(12, dosDate, true)
    head.setUint32(14, crc, true); head.setUint32(18, data.length, true); head.setUint32(22, data.length, true)
    head.setUint16(26, nameBytes.length, true); head.setUint16(28, 0, true)
    locals.push(new Uint8Array(head.buffer), nameBytes, data)
    const cen = new DataView(new ArrayBuffer(46))
    cen.setUint32(0, 0x02014b50, true); cen.setUint16(4, 20, true); cen.setUint16(6, 20, true); cen.setUint16(8, 0x0800, true)
    cen.setUint16(10, 0, true); cen.setUint16(12, dosTime, true); cen.setUint16(14, dosDate, true)
    cen.setUint32(16, crc, true); cen.setUint32(20, data.length, true); cen.setUint32(24, data.length, true)
    cen.setUint16(28, nameBytes.length, true); cen.setUint32(42, offset, true)
    centrals.push(new Uint8Array(cen.buffer), nameBytes)
    offset += 30 + nameBytes.length + data.length
  }
  const cenSize = centrals.reduce((s, b) => s + b.length, 0)
  const end = new DataView(new ArrayBuffer(22))
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true)
  end.setUint32(12, cenSize, true); end.setUint32(16, offset, true)
  const parts = [...locals, ...centrals, new Uint8Array(end.buffer)]
  const out = new Uint8Array(parts.reduce((s, b) => s + b.length, 0))
  let p = 0
  for (const b of parts) { out.set(b, p); p += b.length }
  return out
}

// ── overlay placement: a box given as fractions of the page as SHOWN (after rotation) → pdf-lib drawImage args ──
// box: { fx, fy, fw, fh } from the top-left of the shown page; crop: { x, y, width, height } of the unrotated page;
// rot: the page's /Rotate (clockwise, 0/90/180/270). Returns { x, y, width, height, rotate } (rotate counter-clockwise).
export function placeOnPage(box, crop, rot) {
  const R = ((rot % 360) + 360) % 360
  const W = crop.width, H = crop.height
  const Dw = R % 180 ? H : W, Dh = R % 180 ? W : H
  const dx = box.fx * Dw, dyBottom = (box.fy + box.fh) * Dh
  const width = box.fw * Dw, height = box.fh * Dh
  let u, v
  if (R === 0) { u = dx; v = H - dyBottom }
  else if (R === 90) { u = dyBottom; v = dx }
  else if (R === 180) { u = W - dx; v = dyBottom }
  else { u = W - dyBottom; v = H - dx }
  return { x: crop.x + u, y: crop.y + v, width, height, rotate: R }
}

// ── the URLs: /tools/pdf and /tools/pdf/:action ──
export const ACTIONS = {
  '': {
    tool: 'merge', emoji: '📄',
    h1: 'כל כלי ה-PDF במקום אחד',
    title: 'כלי PDF חינם: איחוד, פיצול, דחיסה, חתימה ותמונה ל-PDF',
    desc: 'עורך PDF חינם בעברית: מאחדים קבצים, מפצלים, מקטינים, הופכים תמונות ל-PDF, חותמים ומסדרים עמודים. הכל בדפדפן, הקבצים לא יוצאים מהמחשב.',
  },
  merge: {
    tool: 'merge', emoji: '📎',
    h1: 'איחוד קבצי PDF',
    title: 'איחוד PDF חינם — חיבור כמה קבצי PDF לקובץ אחד',
    desc: 'מחברים כמה קבצי PDF ותמונות לקובץ PDF אחד, מסדרים את העמודים בגרירה ומורידים. חינם, בלי הרשמה, והקבצים לא יוצאים מהמחשב.',
  },
  split: {
    tool: 'split', emoji: '✂️',
    h1: 'פיצול PDF',
    title: 'פיצול PDF חינם — חיתוך קובץ PDF לכמה קבצים',
    desc: 'מפצלים PDF לעמודים בודדים או לפי טווחים כמו 1-3, 5 ומורידים הכל בקובץ ZIP אחד. חינם, בעברית, והקובץ לא עולה לשום שרת.',
  },
  compress: {
    tool: 'compress', emoji: '🗜️',
    h1: 'דחיסת PDF',
    title: 'דחיסת PDF חינם — הקטנת קובץ PDF לשליחה במייל ובוואטסאפ',
    desc: 'מקטינים קובץ PDF כבד בשלוש רמות דחיסה ורואים מיד כמה ירד. מתאים לשליחה במייל, בוואטסאפ ולטפסים באתרים. חינם והקובץ נשאר אצלכם.',
  },
  'images-to-pdf': {
    tool: 'merge', emoji: '🖼️',
    h1: 'המרת תמונה ל-PDF',
    title: 'תמונה ל-PDF חינם — המרת תמונות וצילומים לקובץ PDF',
    desc: 'הופכים תמונות JPG ו-PNG וצילומים מהטלפון לקובץ PDF אחד, בגודל A4 או בגודל התמונה. בלי הרשמה, בלי סימן מים, והתמונות לא יוצאות מהמכשיר.',
  },
  'pdf-to-images': {
    tool: 'images', emoji: '📸',
    h1: 'המרת PDF לתמונות',
    title: 'PDF לתמונה חינם — המרת עמודי PDF ל-JPG או PNG',
    desc: 'הופכים כל עמוד PDF לתמונת JPG או PNG באיכות גבוהה ומורידים בקובץ ZIP. חינם, בעברית, והכל קורה בדפדפן.',
  },
  sign: {
    tool: 'sign', emoji: '✍️',
    h1: 'חתימה על PDF',
    title: 'חתימה על PDF חינם — חותמים באצבע או בעכבר ומוסיפים טקסט',
    desc: 'חותמים על מסמך PDF באצבע או בעכבר, מוסיפים שם, תאריך או טקסט, ממקמים על הדף ומורידים. בלי הדפסה וסריקה, והמסמך לא יוצא מהמחשב.',
  },
  edit: {
    tool: 'merge', emoji: '🔄',
    h1: 'עריכת PDF: סידור, סיבוב ומחיקת עמודים',
    title: 'עריכת PDF חינם — סידור, סיבוב ומחיקת עמודים',
    desc: 'מסדרים מחדש עמודי PDF בגרירה, מסובבים עמודים הפוכים, מוחקים מיותרים ושומרים כקובץ חדש. חינם, בעברית, בלי להתקין תוכנה.',
  },
  'to-word': {
    tool: 'text', emoji: '📝',
    h1: 'המרת PDF לוורד',
    title: 'המרת PDF לוורד חינם — קובץ Word שאפשר לערוך, גם בעברית',
    desc: 'ממירים PDF לקובץ Word ‏(docx) עם פסקאות, כותרות ועברית מימין לשמאל, או שומרים את העיצוב בדיוק כתמונה. חינם, והקובץ לא יוצא מהמחשב.',
  },
  'from-word': {
    tool: 'fromword', emoji: '📃',
    h1: 'המרת וורד ל-PDF',
    title: 'המרת וורד ל-PDF חינם — קובץ Word לקובץ PDF בלי להתקין כלום',
    desc: 'הופכים קובץ Word ‏(docx) ל-PDF ישר בדפדפן, גם בטלפון: עברית מימין לשמאל, טבלאות ותמונות. אפשר לצרף אותו לקובצי PDF אחרים. הקובץ לא יוצא מהמכשיר.',
  },

}
