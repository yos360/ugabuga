// Pure helpers for PDF→Word and Word→PDF: rebuild lines and paragraphs from positioned PDF text,
// put visually-stored Hebrew back in reading order, write a minimal .docx, and pick page cuts.
// No DOM here, so node:test can import it.
import { makeZip } from './pdfLogic.js'

const HEB = /[֐-׿]/
const HEB_G = /[֐-׿]/g
const LAT_G = /[A-Za-z]/g
const FINALS = 'ךםןףץ'
const count = (s, re) => (s.match(re) || []).length
export const hasHebrew = s => HEB.test(s)

// ── Hebrew order ──
// Real Hebrew never starts a word with a final letter (ך ם ן ף ץ) and often ends with one.
// Votes over many strings, so one odd word can't flip a document.
export function reversedVotes(strings) {
  let start = 0, end = 0
  for (const s of strings) {
    for (const w of String(s).match(/[א-ת]{2,}/g) || []) {
      if (FINALS.includes(w[0])) start++
      if (FINALS.includes(w[w.length - 1])) end++
    }
  }
  return { start, end, reversed: start > end }
}

const MIRROR = { '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '«': '»', '»': '«' }
// LTR islands (English words, numbers, dates, e-mails) keep their inner order when a visual string is flipped.
const LTR_RUN = /[A-Za-z0-9][A-Za-z0-9.,:/%@_+'’-]*[A-Za-z0-9%]|[A-Za-z0-9]/g
// Visual order (left→right as drawn) → logical order of an RTL line.
export function reverseVisual(s) {
  const parts = []
  let last = 0
  for (const m of String(s).matchAll(LTR_RUN)) {
    if (m.index > last) parts.push({ t: s.slice(last, m.index), ltr: false })
    parts.push({ t: m[0], ltr: true })
    last = m.index + m[0].length
  }
  if (last < s.length) parts.push({ t: s.slice(last), ltr: false })
  return parts.reverse().map(p => p.ltr ? p.t : [...p.t].reverse().map(c => MIRROR[c] || c).join('')).join('')
}

// ── lines ──
// items: [{ str, x, y, w, size }] in shown-page coordinates (x right, y down, y = baseline).
// rtlDoc: is the whole document Hebrew-first (decided over all pages; this page's text decides when omitted)
export function buildLines(items, { reversed = false, rtlDoc } = {}) {
  const list = items
    .filter(it => it.str && it.str.trim() && Number.isFinite(it.x) && Number.isFinite(it.y))
    .map(it => ({ ...it, str: reversed && hasHebrew(it.str) ? reverseVisual(it.str) : it.str, size: it.size || 10, w: it.w || 0 }))
    .sort((a, b) => a.y - b.y || a.x - b.x)
  const lines = []
  for (const it of list) {
    const line = lines.find(l => Math.abs(l.y - it.y) <= Math.max(2, Math.min(l.size, it.size) * 0.45))
    if (line) { line.items.push(it); line.size = Math.max(line.size, it.size) }
    else lines.push({ y: it.y, size: it.size, items: [it] })
  }
  const text = list.map(i => i.str).join('')
  const docRtl = rtlDoc ?? count(text, HEB_G) > count(text, LAT_G)
  return lines.sort((a, b) => a.y - b.y).map(l => finishLine(l, docRtl, reversed))
}

const isLtrItem = it => !hasHebrew(it.str) && /[A-Za-z0-9]/.test(it.str)
const mirror = s => [...s].map(c => MIRROR[c] || c).join('')
function finishLine(l, docRtl, reversed) {
  const all = l.items.map(i => i.str).join('')
  // a line with Hebrew is RTL when it is mostly Hebrew, or when the whole document is (a Hebrew line quoting English)
  const rtl = count(all, HEB_G) > 0 && (docRtl || count(all, HEB_G) >= count(all, LAT_G) * 0.5)
  let items = l.items.slice().sort((a, b) => rtl ? (b.x + b.w) - (a.x + a.w) : a.x - b.x)
  if (rtl) {
    items = items.map(it => {
      // the glyph drawn for "(" in Hebrew text is the ")" shape: read right→left, brackets must be mirrored
      // (already done by reverseVisual when the strings were flipped here)
      if (!isLtrItem(it)) return reversed && hasHebrew(it.str) ? it : { ...it, str: mirror(it.str) }
      // a sentence's final "." drawn left of an English word or a number: ".02/11/2026" → "02/11/2026."
      const m = it.str.match(/^([.,:;!?]+)(?=[A-Za-z0-9])(.*)$/)
      return m ? { ...it, str: m[2] + m[1] } : it
    })
  }
  // inside an RTL line, a run of English/number pieces reads left→right: put that run back in order
  items = flipRuns(items, rtl ? isLtrItem : it => hasHebrew(it.str))
  let text = ''
  for (let i = 0; i < items.length; i++) {
    const it = items[i], prev = items[i - 1]
    if (prev) {
      // empty space between the two boxes, whichever side each is on
      const g = Math.max(it.x - (prev.x + prev.w), prev.x - (it.x + it.w))
      if (g >Math.min(prev.size, it.size) * 0.18 && !/\s$/.test(text) && !/^\s/.test(it.str)) text += ' '
    }
    text += it.str
  }
  const x0 = Math.min(...l.items.map(i => i.x)), x1 = Math.max(...l.items.map(i => i.x + i.w))
  return { text: text.replace(/\s+/g, ' ').trim(), y: l.y, size: l.size, x0, x1, rtl }
}

function flipRuns(items, inRun) {
  const out = []
  for (let i = 0; i < items.length;) {
    if (!inRun(items[i])) { out.push(items[i++]); continue }
    let j = i
    // a run may hold spaces/punctuation between its words
    while (j + 1 < items.length && (inRun(items[j + 1]) || (!hasHebrew(items[j + 1].str) && !/[A-Za-z0-9]/.test(items[j + 1].str) && j + 2 < items.length && inRun(items[j + 2])))) j++
    out.push(...items.slice(i, j + 1).reverse())
    i = j + 1
  }
  return out
}

// ── paragraphs ──
const BULLET = /^([•●▪◦‣·∙○■□➢✓✔*–-]|\(?\d{1,3}[.)]|\(?[א-ת][.)]|[a-z][.)])\s+/
const median = a => { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)] }

// The size most of the text is written in.
export function bodySize(lines) {
  const by = new Map()
  for (const l of lines) { const k = Math.round(l.size * 2) / 2; by.set(k, (by.get(k) || 0) + l.text.length) }
  let best = 11, n = -1
  for (const [k, v] of by) if (v > n) { best = k; n = v }
  return best
}

// lines of ONE page → [{ text, rtl, kind: 'h1'|'h2'|'li'|'p' }]
export function buildParagraphs(lines, body = bodySize(lines)) {
  if (!lines.length) return []
  const gaps = []
  for (let i = 1; i < lines.length; i++) { const g = lines[i].y - lines[i - 1].y; if (g > 0 && g < lines[i].size * 3) gaps.push(g) }
  const lead = median(gaps) || body * 1.2
  const left = Math.min(...lines.map(l => l.x0)), right = Math.max(...lines.map(l => l.x1))
  const width = Math.max(1, right - left)
  const kindOf = l => l.text.length < 160 && l.size >= body * 1.45 ? 'h1' : l.text.length < 160 && l.size >= body * 1.18 ? 'h2' : BULLET.test(l.text) ? 'li' : 'p'
  const paras = []
  let cur = null
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i], prev = lines[i - 1], kind = kindOf(l)
    const sameKind = kind === cur?.kind || (cur?.kind === 'li' && kind === 'p') // wrapped lines of a list item
    const newPara = !cur || kind === 'li' || !sameKind
      || l.rtl !== prev.rtl
      || l.y - prev.y > lead * 1.35 + 0.5
      || Math.abs(l.size - prev.size) > Math.max(l.size, prev.size) * 0.15
      || (prev.x1 - prev.x0) < width * 0.6 // a short line ends its paragraph
    if (newPara) { cur = { text: l.text, rtl: l.rtl, kind }; paras.push(cur) }
    else if (!cur.rtl && /[a-z]-$/.test(cur.text) && /^[a-z]/.test(l.text)) cur.text = cur.text.slice(0, -1) + l.text // re-join a hyphenated word
    else cur.text += ' ' + l.text
  }
  return paras
}

// pages: [[{ str, x, y, w, size }]] (raw positioned text per PDF page) → [[paragraph]] per page.
// Hebrew order and the document's direction are decided over ALL pages together.
export function paragraphsFromLayout(pages) {
  const strs = pages.flat().map(i => i.str)
  const reversed = reversedVotes(strs).reversed
  const all = strs.join('')
  const rtlDoc = count(all, HEB_G) > count(all, LAT_G)
  const lines = pages.map(items => buildLines(items, { reversed, rtlDoc }))
  const body = bodySize(lines.flat())
  return lines.map(ls => buildParagraphs(ls, body))
}

// ── DOCX writing ──
export const escapeXml = s => String(s)
  // eslint-disable-next-line no-control-regex -- characters XML 1.0 can't hold
  .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f￾￿]/g, '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Split a paragraph into runs: English/number islands are LTR runs, the rest follows the paragraph.
export function bidiRuns(text, paraRtl) {
  const runs = []
  let last = 0
  const push = (t, ltr) => { if (!t) return; const rtl = !ltr && (paraRtl || hasHebrew(t)); const prev = runs[runs.length - 1]; if (prev && prev.rtl === rtl) prev.text += t; else runs.push({ text: t, rtl }) }
  // an island must hold a Latin letter (bare numbers stay inside the Hebrew run, Word handles them)
  for (const m of String(text).matchAll(/[A-Za-z][A-Za-z0-9 .,:/%@_+'’&-]*[A-Za-z0-9]|[A-Za-z]/g)) {
    push(text.slice(last, m.index), false); push(m[0], true); last = m.index + m[0].length
  }
  push(text.slice(last), false)
  return runs
}

const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"'
const XML_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
const STYLE = { h1: 'Heading1', h2: 'Heading2', li: 'ListParagraph' }

function paraXml(p) {
  const ppr = (STYLE[p.kind] ? `<w:pStyle w:val="${STYLE[p.kind]}"/>` : '') + (p.rtl ? '<w:bidi/>' : '<w:bidi w:val="0"/>')
  const runs = bidiRuns(p.text, p.rtl).map(r => `<w:r>${r.rtl ? '<w:rPr><w:rtl/></w:rPr>' : ''}<w:t xml:space="preserve">${escapeXml(r.text)}</w:t></w:r>`).join('')
  return `<w:p>${ppr ? `<w:pPr>${ppr}</w:pPr>` : ''}${runs}</w:p>`
}

const A4 = { w: 11906, h: 16838 } // twips
function sectPr(rtl, margin) {
  return `<w:sectPr><w:pgSz w:w="${A4.w}" w:h="${A4.h}"/><w:pgMar w:top="${margin}" w:right="${margin}" w:bottom="${margin}" w:left="${margin}" w:header="0" w:footer="0" w:gutter="0"/>${rtl ? '<w:bidi/>' : ''}</w:sectPr>`
}

function stylesXml() {
  const run = (sz, b) => `<w:rPr>${b ? '<w:b/><w:bCs/>' : ''}<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr>`
  return XML_HEAD + `<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">`
    + `<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="en-US" w:bidi="he-IL"/></w:rPr></w:rPrDefault>`
    + `<w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>`
    + `<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>`
    + `<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="120"/><w:outlineLvl w:val="0"/></w:pPr>${run(36, true)}</w:style>`
    + `<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="200" w:after="80"/><w:outlineLvl w:val="1"/></w:pPr>${run(28, true)}</w:style>`
    + `<w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="60"/><w:ind w:start="360"/></w:pPr></w:style>`
    + `</w:styles>`
}

function pack(bodyXml, rels, media) {
  const enc = new TextEncoder()
  const types = XML_HEAD + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
    + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpeg" ContentType="image/jpeg"/>'
    + '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
    + '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
    + '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>'
  const rootRels = XML_HEAD + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    + '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'
    + '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>'
  const core = XML_HEAD + '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:creator>ugabuga.co.il</dc:creator></cp:coreProperties>'
  const docRels = XML_HEAD + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    + '<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
    + rels.join('') + '</Relationships>'
  const doc = XML_HEAD + `<w:document ${NS}><w:body>${bodyXml}</w:body></w:document>`
  return makeZip([
    { name: '[Content_Types].xml', data: enc.encode(types) },
    { name: '_rels/.rels', data: enc.encode(rootRels) },
    { name: 'docProps/core.xml', data: enc.encode(core) },
    { name: 'word/document.xml', data: enc.encode(doc) },
    { name: 'word/styles.xml', data: enc.encode(stylesXml()) },
    { name: 'word/_rels/document.xml.rels', data: enc.encode(docRels) },
    ...media,
  ])
}

// pages: [[{ text, rtl, kind }]] → .docx bytes (editable text, a page break between PDF pages)
export function docxFromParagraphs(pages) {
  const all = pages.flat()
  const rtl = all.filter(p => p.rtl).length >= all.length / 2
  const brk = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'
  const body = pages.map(ps => ps.map(paraXml).join('') || '<w:p/>').join(brk) + sectPr(rtl, 1134)
  return pack(body, [], [])
}

// images: [{ data: Uint8Array (JPEG), w, h }] → .docx with one full-page picture per page
export function docxFromImages(images) {
  const EMU_W = 7560310, EMU_H = 10560000 // A4 minus a hair, so a picture never spills a blank page
  const rels = [], media = [], parts = []
  images.forEach((im, i) => {
    const n = i + 1, k = Math.min(EMU_W / im.w, EMU_H / im.h)
    const cx = Math.round(im.w * k), cy = Math.round(im.h * k)
    rels.push(`<Relationship Id="rIdImg${n}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/page${n}.jpeg"/>`)
    media.push({ name: `word/media/page${n}.jpeg`, data: im.data })
    parts.push(`<w:p><w:pPr>${i ? '<w:pageBreakBefore/>' : ''}<w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/><w:jc w:val="center"/></w:pPr><w:r><w:drawing>`
      + `<wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="${n}" name="page ${n}"/>`
      + `<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>`
      + `<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic>`
      + `<pic:nvPicPr><pic:cNvPr id="${n}" name="page${n}.jpeg"/><pic:cNvPicPr/></pic:nvPicPr>`
      + `<pic:blipFill><a:blip r:embed="rIdImg${n}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>`
      + `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>`
      + `</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`)
  })
  return pack(parts.join('') + sectPr(false, 0), rels, media)
}

// ── Word→PDF: where to cut one tall rendered section into pages ──
// bottoms: y of every block's bottom edge (px from the section top); total: section height; page: page height;
// mTop/mBottom: page margins. Cuts land between blocks; a block taller than a page is cut where it must be.
// Returns [[from, to]] slices of the section, in px.
export function pickCuts(bottoms, total, page, mTop, mBottom) {
  const ends = [...new Set(bottoms.filter(b => b > 0 && b < total).map(b => Math.round(b)))].sort((a, b) => a - b)
  const slices = []
  let from = 0, first = true
  while (total - from > 0.5) {
    const room = first ? page - mBottom : page - mTop - mBottom
    if (total - from <= (first ? page : page - mTop)) { slices.push([from, total]); break }
    const limit = from + room
    let cut = 0
    for (const b of ends) { if (b > from + 1 && b <= limit) cut = b; if (b > limit) break }
    if (!cut) cut = limit
    slices.push([from, cut])
    from = cut; first = false
  }
  return slices
}

// Word's left/right inside a right-to-left paragraph mean start/end; docx-preview reads them literally.
export function bidiAlign(direction, textAlign) {
  if (direction !== 'rtl') return textAlign
  return textAlign === 'left' ? 'right' : textAlign === 'right' ? 'left' : textAlign
}
