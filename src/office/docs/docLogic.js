// Pure helpers for /tools/document (no DOM, so node:test can run them):
// a string-based HTML sanitiser for pasted / stored content, plain-text extraction,
// the HTML-based Word (.doc) file builder, slugs and file names.

// ── sanitiser ──────────────────────────────────────────────
// Whitelist only. Clean input comes back byte-for-byte unchanged (templates are written
// that way), so running it again on stored documents never drifts.

const ALLOWED_TAGS = new Set([
  'p', 'div', 'span', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'sub', 'sup', 'mark',
  'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'hr', 'a', 'img',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th', 'colgroup', 'col', 'caption',
])
// Removed together with everything inside them.
const DROP_BLOCK = /<(script|style|iframe|object|embed|noscript|template|svg|math|head|title|textarea|select|xml|frameset|frame|applet)\b[\s\S]*?<\/\1\s*>/gi
const GLOBAL_ATTRS = new Set(['style', 'dir', 'class', 'title', 'lang', 'align'])
const TAG_ATTRS = {
  a: ['href'],
  img: ['src', 'alt', 'width', 'height'],
  td: ['colspan', 'rowspan', 'valign', 'width'],
  th: ['colspan', 'rowspan', 'valign', 'width'],
  table: ['border', 'cellpadding', 'cellspacing', 'width'],
  ol: ['start', 'type'],
  col: ['span', 'width'],
  colgroup: ['span'],
}
const STYLE_PROPS = new Set([
  'color', 'background-color', 'background', 'font-size', 'font-weight', 'font-style', 'font-family',
  'text-decoration', 'text-decoration-line', 'text-align', 'direction', 'unicode-bidi', 'line-height', 'letter-spacing',
  'margin', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right', 'margin-inline-start', 'margin-inline-end',
  'padding', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
  'border', 'border-top', 'border-bottom', 'border-left', 'border-right', 'border-color', 'border-style', 'border-width',
  'border-radius', 'border-collapse', 'width', 'height', 'min-height', 'max-width', 'vertical-align',
  'list-style-type', 'white-space', 'text-indent',
])
const BAD_STYLE_VALUE = /url\s*\(|expression|javascript:|behavior|@import|\\|<|>/i
const SAFE_HREF = /^(https?:|mailto:|tel:|#)/i
const SAFE_SRC = /^(data:image\/(png|jpe?g|gif|webp);base64,[a-z0-9+/=\s]+|https?:\/\/[^\s"'<>]+)$/i
const ALIGN = /^(left|right|center|justify)$/i

// One tag at a given position (sticky): name, attributes, optional self-closing slash.
const TAG = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s"'=<>/`]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/y
const ATTR = /([^\s"'=<>/`]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

const escAttr = v => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const decodeAttr = v => String(v).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')

export function cleanStyle(style) {
  const decls = String(style).split(';')
  const kept = []
  let changed = false
  for (const d of decls) {
    if (!d.trim()) continue
    const c = d.indexOf(':')
    const prop = c < 0 ? '' : d.slice(0, c).trim().toLowerCase()
    const value = c < 0 ? '' : d.slice(c + 1).trim()
    if (!prop || !value || !STYLE_PROPS.has(prop) || BAD_STYLE_VALUE.test(value)) { changed = true; continue }
    kept.push(d)
  }
  if (!changed) return style
  return kept.map(d => d.trim()).join(';')
}

function cleanAttr(tag, name, value) {
  const n = name.toLowerCase()
  if (n.startsWith('on')) return null
  if (!GLOBAL_ATTRS.has(n) && !(TAG_ATTRS[tag] || []).includes(n)) return null
  if (value == null) return null
  const v = decodeAttr(value)
  if (n === 'style') { const s = cleanStyle(v); return s.trim() ? s : null }
  if (n === 'dir') return /^(rtl|ltr|auto)$/i.test(v) ? v : null
  if (n === 'align') return ALIGN.test(v) ? v : null
  if (n === 'class') { const c = v.split(/\s+/).filter(x => /^dc-[\w-]+$/.test(x)).join(' '); return c || null }
  if (n === 'href') return SAFE_HREF.test(v.trim()) ? v.trim() : null
  if (n === 'src') return SAFE_SRC.test(v.trim()) ? v.trim() : null
  if (['colspan', 'rowspan', 'start', 'span', 'border', 'cellpadding', 'cellspacing'].includes(n)) return /^\d{1,3}$/.test(v) ? v : null
  if (['width', 'height'].includes(n)) return /^\d{1,4}(\.\d+)?(%|px)?$/.test(v) ? v : null
  if (n === 'valign') return /^(top|middle|bottom)$/i.test(v) ? v : null
  if (n === 'type') return /^[1aAiI]$/.test(v) ? v : null
  return v.length > 300 ? v.slice(0, 300) : v
}

function cleanTag(m) {
  const [raw, close, rawName, attrs, slash] = m
  const tag = rawName.toLowerCase()
  if (!ALLOWED_TAGS.has(tag)) return ''
  if (close) return raw === `</${rawName}>` ? raw : `</${tag}>`
  const out = []
  let changed = false
  ATTR.lastIndex = 0
  let a
  while ((a = ATTR.exec(attrs))) {
    const [araw, name, dq, sq, uq] = a
    const value = dq ?? sq ?? uq
    const kept = cleanAttr(tag, name, value)
    if (kept == null) { changed = true; continue }
    if (dq != null && kept === decodeAttr(dq) && escAttr(kept) === dq) out.push(araw)
    else { changed = true; out.push(`${name.toLowerCase()}="${escAttr(kept)}"`) }
  }
  if (!changed) return raw
  return `<${tag}${out.map(x => ' ' + x).join('')}${slash ? ' /' : ''}>`
}

export function sanitizeHtml(html) {
  let s = String(html ?? '')
  // whole blocks, comments, doctype / processing instructions / Word's conditional comments
  let prev
  do { prev = s; s = s.replace(DROP_BLOCK, '') } while (s !== prev)
  s = s.replace(/<!--[\s\S]*?(-->|$)/g, '').replace(/<![^>]*>/g, '').replace(/<\?[\s\S]*?\?>/g, '')
  let out = '', i = 0
  while (i < s.length) {
    const lt = s.indexOf('<', i)
    if (lt < 0) { out += s.slice(i); break }
    out += s.slice(i, lt)
    TAG.lastIndex = lt
    const m = TAG.exec(s)
    if (m) { out += cleanTag(m); i = lt + m[0].length }
    else { out += '&lt;'; i = lt + 1 }
  }
  return out
}

// ── plain text ─────────────────────────────────────────────
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ', apos: "'" }
export const decodeEntities = s => String(s).replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) => {
  if (e[0] === '#') { const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(n) ? String.fromCodePoint(n) : m }
  return ENTITIES[e.toLowerCase()] ?? m
})

export function htmlToText(html) {
  let s = sanitizeHtml(html)
  s = s.replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/li>/gi, '')
    .replace(/<li\b[^>]*>/gi, '\n• ')
    .replace(/<\/(td|th)>/gi, '\t')
    .replace(/<hr\b[^>]*>/gi, '\n――――――――――\n')
    .replace(/<\/?(p|div|h[1-4]|ul|ol|li|tr|table|blockquote|caption)\b[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
  s = decodeEntities(s)
  return s.split('\n').map(l => l.replace(/[ \t]+$/g, '').replace(/^[ ]+/, '')).join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

export const escapeHtml = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Plain pasted text → paragraphs.
export const textToHtml = text => String(text ?? '').replace(/\r\n?/g, '\n').split(/\n{2,}/)
  .map(par => `<p>${par.split('\n').map(escapeHtml).join('<br>') || '<br>'}</p>`).join('')

// A document's free items become ordinary blocks in flowing formats (Word, text).
export function itemsToHtml(items = []) {
  return [...items].sort((a, b) => a.y - b.y || b.x - a.x).map(it => {
    if (it.type === 'text') return it.frame ? `<div style="border:1px solid #444;padding:6pt;margin:8pt 0">${sanitizeHtml(it.html)}</div>` : `<div style="margin:8pt 0">${sanitizeHtml(it.html)}</div>`
    if (it.type === 'line' && it.o !== 'v') return `<hr style="border:0;border-top:${Math.max(1, Math.round(it.t || 2))}px ${it.dash || 'solid'} ${/^#[0-9a-f]{3,8}$/i.test(it.color || '') ? it.color : '#333'};margin:8pt 0">`
    return ''
  }).join('')
}

export const docToText = doc => (doc?.pages || []).map(p => [htmlToText(p.html), ...(p.items || []).filter(it => it.type === 'text').map(it => htmlToText(it.html))].filter(Boolean).join('\n\n')).filter(Boolean).join('\n\n')

// ── Word (.doc) export ─────────────────────────────────────
// Word opens HTML saved with this MIME type and the mso namespaces as a normal document.
export const DOC_MIME = 'application/msword'
const DOC_CSS = [
  '@page Section1{size:595.3pt 841.9pt;margin:56.7pt 51pt 56.7pt 51pt;mso-page-orientation:portrait}',
  'div.Section1{page:Section1}',
  'body{font-family:Arial,sans-serif;font-size:12pt;direction:rtl}',
  'p{margin:0 0 6pt}',
  'h1{font-size:22pt;margin:0 0 10pt}h2{font-size:17pt;margin:10pt 0 6pt}h3{font-size:14pt;margin:8pt 0 4pt}',
  'table{border-collapse:collapse;width:100%}td,th{border:1px solid #888;padding:4pt 6pt;vertical-align:top}',
  'img{max-width:100%}',
].join('\n')
const PAGE_BREAK = "<br clear=\"all\" style=\"mso-special-character:line-break;page-break-before:always\">"

export function buildDocFile(doc) {
  const title = escapeHtml(doc?.title || 'מסמך')
  const pages = (doc?.pages || []).map(p => sanitizeHtml(p.html) + itemsToHtml(p.items))
  return '﻿<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40" dir="rtl" lang="he">' +
    `<head><meta charset="utf-8"><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><title>${title}</title>` +
    '<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom><w:DoNotOptimizeForBrowser/></w:WordDocument></xml><![endif]-->' +
    `<style>${DOC_CSS}</style></head>` +
    `<body dir="rtl" lang="he"><div class="Section1" dir="rtl">${pages.join(PAGE_BREAK)}</div></body></html>`
}

// ── names ──────────────────────────────────────────────────
export const slugify = s => String(s ?? '').toLowerCase().trim().replace(/['"״׳]/g, '').replace(/[^a-z0-9֐-׿]+/g, '-').replace(/^-+|-+$/g, '')
export function fileName(title, ext) {
  const base = [...String(title ?? '')].map(ch => (ch.charCodeAt(0) < 32 || '\\/:*?"<>|'.includes(ch) ? ' ' : ch)).join('').replace(/\s+/g, ' ').trim().slice(0, 80) || 'מסמך'
  return `${base}.${ext}`
}
export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

// Hebrew date-time for the recent-documents list.
export function shortWhen(ts, now = Date.now()) {
  const d = new Date(ts)
  if (!Number.isFinite(d.getTime())) return ''
  const mins = Math.floor((now - ts) / 60000)
  if (mins < 1) return 'עכשיו'
  if (mins < 60) return `לפני ${mins} דק׳`
  const sameDay = new Date(now).toDateString() === d.toDateString()
  const hhmm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return sameDay ? `היום ${hhmm}` : `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()} ${hhmm}`
}
