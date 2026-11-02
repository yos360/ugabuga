// /tools/pdf: page ranges, sizes, names, the ZIP writer, overlay placement, and the per-URL texts
import { test } from 'node:test'
import assert from 'node:assert/strict'
const L = await import('../src/office/pdf/pdfLogic.js')

test('parseRanges: lists, ranges, open ends, Hebrew', () => {
  assert.deepEqual(L.parseRanges('1-3,5', 10).groups, [[1, 2, 3], [5]])
  assert.deepEqual(L.parseRanges(' 2 – 4 ; 7 ', 10).groups, [[2, 3, 4], [7]])
  assert.deepEqual(L.parseRanges('8-', 10).groups, [[8, 9, 10]])
  assert.deepEqual(L.parseRanges('-2', 10).groups, [[1, 2]])
  assert.deepEqual(L.parseRanges('1 עד 3، 9', 10).groups, [[1, 2, 3], [9]])
  assert.deepEqual(L.parseRanges('3-1', 10).groups, [[3, 2, 1]])
})

test('parseRanges: kind errors', () => {
  assert.match(L.parseRanges('', 5).error, /למשל/)
  assert.match(L.parseRanges('1-9', 5).error, /רק 5/)
  assert.match(L.parseRanges('0', 5).error, /מ-1/)
  assert.match(L.parseRanges('abc', 5).error, /לא הבנו/)
  assert.equal(L.parseRanges('1-2', 5).error, '')
})

test('describePages', () => {
  assert.equal(L.describePages([1, 2, 3, 5, 7, 8]), '1-3, 5, 7-8')
  assert.equal(L.describePages([4]), '4')
})

test('formatBytes and savedPercent', () => {
  assert.equal(L.formatBytes(500), '500 B')
  assert.equal(L.formatBytes(2048), '2 KB')
  assert.equal(L.formatBytes(1.5 * 1024 * 1024), '1.5 MB')
  assert.equal(L.formatBytes(25 * 1024 * 1024), '25 MB')
  assert.equal(L.savedPercent(1000, 250), 75)
  assert.equal(L.savedPercent(1000, 1200), 0)
})

test('names and kinds', () => {
  assert.equal(L.baseName('C:\\x\\חוזה שכירות.PDF'), 'חוזה שכירות')
  assert.equal(L.baseName(''), 'קובץ')
  assert.equal(L.outName('a/b:c', 'עמוד 3', 'pdf'), 'a b c - עמוד 3.pdf')
  assert.equal(L.outName('דוח', '', 'jpg'), 'דוח.jpg')
  assert.equal(L.fileKind({ name: 'x.pdf', type: '' }), 'pdf')
  assert.equal(L.fileKind({ name: 'IMG_1.HEIC', type: '' }), 'image')
  assert.equal(L.fileKind({ name: 'a', type: 'image/png' }), 'image')
  assert.equal(L.fileKind({ name: 'letter.docx', type: '' }), 'docx')
  assert.equal(L.fileKind({ name: 'old.DOC', type: '' }), 'word')
  assert.equal(L.fileKind({ name: 'a.txt', type: 'text/plain' }), 'other')
})

test('moveItem', () => {
  assert.deepEqual(L.moveItem([1, 2, 3, 4], 0, 2), [2, 3, 1, 4])
  assert.deepEqual(L.moveItem([1, 2, 3, 4], 3, 0), [4, 1, 2, 3])
  assert.deepEqual(L.moveItem([1, 2], 1, 1), [1, 2])
})

test('crc32 known value', () => {
  assert.equal(L.crc32(new TextEncoder().encode('hello')), 0x3610a686)
})

test('makeZip: readable entries with Hebrew names and unique names', () => {
  const a = new TextEncoder().encode('%PDF-1.7 one'), b = new Uint8Array([1, 2, 3, 4, 5])
  const zip = L.makeZip([{ name: 'עמוד 1.pdf', data: a }, { name: 'עמוד 1.pdf', data: b }])
  const dv = new DataView(zip.buffer)
  const endAt = zip.length - 22
  assert.equal(dv.getUint32(endAt, true), 0x06054b50)
  assert.equal(dv.getUint16(endAt + 10, true), 2)
  let p = dv.getUint32(endAt + 16, true)
  const names = []
  for (let i = 0; i < 2; i++) {
    assert.equal(dv.getUint32(p, true), 0x02014b50)
    const nlen = dv.getUint16(p + 28, true), size = dv.getUint32(p + 20, true), off = dv.getUint32(p + 42, true)
    const name = new TextDecoder().decode(zip.slice(p + 46, p + 46 + nlen))
    names.push(name)
    assert.equal(dv.getUint32(off, true), 0x04034b50)
    const data = zip.slice(off + 30 + nlen, off + 30 + nlen + size)
    assert.equal(L.crc32(data), dv.getUint32(p + 16, true))
    assert.deepEqual(data, i ? b : a)
    p += 46 + nlen
  }
  assert.deepEqual(names, ['עמוד 1.pdf', 'עמוד 1 (2).pdf'])
})

test('placeOnPage: the box lands on the same spot of the shown page for every rotation', () => {
  const crop = { x: 0, y: 0, width: 600, height: 800 }
  const box = { fx: 0.1, fy: 0.2, fw: 0.3, fh: 0.1 }
  // shown-page point of the image's own bottom-left corner, mapped back from user space for each rotation
  const toShown = (u, v, R) => R === 0 ? [u, 800 - v] : R === 90 ? [v, u] : R === 180 ? [600 - u, v] : [800 - v, 600 - u]
  for (const R of [0, 90, 180, 270]) {
    const r = L.placeOnPage(box, crop, R)
    const Dw = R % 180 ? 800 : 600, Dh = R % 180 ? 600 : 800
    const [sx, sy] = toShown(r.x, r.y, R)
    assert.ok(Math.abs(sx - box.fx * Dw) < 1e-9, `x at ${R}`)
    assert.ok(Math.abs(sy - (box.fy + box.fh) * Dh) < 1e-9, `y at ${R}`)
    assert.equal(r.rotate, R)
    assert.ok(Math.abs(r.width - box.fw * Dw) < 1e-9)
  }
  const shifted = L.placeOnPage(box, { x: 10, y: 20, width: 600, height: 800 }, 0)
  assert.equal(shifted.x, 70)
})

test('ACTIONS: every URL has its own title/description within search limits', () => {
  const titles = new Set(), descs = new Set()
  const tools = new Set(['merge', 'split', 'compress', 'images', 'sign', 'text', 'fromword'])
  for (const [slug, a] of Object.entries(L.ACTIONS)) {
    assert.ok(tools.has(a.tool), slug)
    assert.ok(a.title.length <= 70, `${slug} title ${a.title.length}`)
    assert.ok(a.desc.length <= 165 && a.desc.length >= 80, `${slug} desc ${a.desc.length}`)
    assert.ok(a.h1 && a.emoji)
    titles.add(a.title); descs.add(a.desc)
  }
  const n = Object.keys(L.ACTIONS).length
  assert.equal(titles.size, n); assert.equal(descs.size, n)
  for (const s of ['merge', 'split', 'compress', 'images-to-pdf', 'pdf-to-images', 'sign', 'edit', 'to-word', 'from-word']) assert.ok(L.ACTIONS[s], s)
})

// ── PDF→Word / Word→PDF ──
const W = await import('../src/office/pdf/wordLogic.js')

function unzip(zip) {
  const dv = new DataView(zip.buffer, zip.byteOffset, zip.byteLength)
  const end = zip.length - 22, files = {}
  let p = dv.getUint32(end + 16, true)
  for (let k = 0; k < dv.getUint16(end + 10, true); k++) {
    const nlen = dv.getUint16(p + 28, true), size = dv.getUint32(p + 20, true), off = dv.getUint32(p + 42, true)
    files[new TextDecoder().decode(zip.slice(p + 46, p + 46 + nlen))] = zip.slice(off + 30 + nlen, off + 30 + nlen + size)
    p += 46 + nlen
  }
  return files
}
// tiny well-formedness check: every tag closes in order, entities are known, one root
function wellFormed(xml) {
  const body = xml.replace(/^<\?xml[^?]*\?>\s*/, '')
  const stack = []
  let roots = 0
  for (const m of body.matchAll(/<(\/?)([A-Za-z_][\w:.-]*)((?:\s+[\w:.-]+="[^"<]*")*)\s*(\/?)>|&([^;\s]*);|<|>/g)) {
    if (m[0] === '<' || m[0] === '>') throw new Error('stray ' + m[0] + ' near ' + body.slice(m.index - 20, m.index + 20))
    if (m[5] !== undefined) { if (!/^(amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+)$/i.test(m[5])) throw new Error('entity ' + m[5]); continue }
    if (m[1]) { const open = stack.pop(); if (open !== m[2]) throw new Error(`</${m[2]}> closes <${open}>`) }
    else if (!m[4]) { if (!stack.length) roots++; stack.push(m[2]) }
    else if (!stack.length) roots++
  }
  if (stack.length) throw new Error('unclosed ' + stack.join(','))
  if (roots !== 1) throw new Error('roots ' + roots)
  return true
}

test('Hebrew order: final letters vote, visual strings flip but keep English and numbers', () => {
  assert.equal(W.reversedVotes(['םולש םלוע', 'ןמזה']).reversed, true)
  assert.equal(W.reversedVotes(['שלום עולם', 'הזמן']).reversed, false)
  assert.equal(W.reverseVisual('hello 2024 םולש'), 'שלום 2024 hello')
  assert.equal(W.reverseVisual('(הרעה) 3.5%'), '3.5% (הערה)')
  assert.equal(W.reverseVisual('moc.liame@a ןאכ'), 'כאן moc.liame@a')
})

test('buildLines: RTL order by position, English run keeps its order, separate lines by baseline', () => {
  // "שלום Microsoft Word 2024" in a Hebrew document is drawn as: [Microsoft][Word][2024] … [שלום] (left → right)
  const items = [
    { str: 'Word', x: 200, y: 100, w: 40, size: 12 },
    { str: 'שלום', x: 300, y: 100, w: 40, size: 12 },
    { str: 'Microsoft', x: 120, y: 100.5, w: 70, size: 12 },
    { str: '2024', x: 245, y: 100, w: 30, size: 12 },
    { str: 'שורה שנייה', x: 250, y: 118, w: 90, size: 12 },
  ]
  const lines = W.buildLines(items, { rtlDoc: true })
  assert.equal(lines.length, 2)
  assert.equal(lines[0].text, 'שלום Microsoft Word 2024')
  assert.equal(lines[0].rtl, true)
  assert.equal(lines[1].text, 'שורה שנייה')
  const ltr = W.buildLines([{ str: 'world', x: 60, y: 10, w: 30, size: 10 }, { str: 'Hello', x: 20, y: 10, w: 30, size: 10 }])
  assert.equal(ltr[0].text, 'Hello world')
  assert.equal(ltr[0].rtl, false)
  // visually stored Hebrew comes back readable
  assert.equal(W.buildLines([{ str: 'םולש', x: 0, y: 0, w: 20, size: 10 }], { reversed: true })[0].text, 'שלום')
})

test('buildParagraphs: wrapped lines join, gaps and short lines split, headings and bullets found', () => {
  const L = (text, y, size = 11, x1 = 500) => ({ text, y, size, x0: 50, x1, rtl: /[א-ת]/.test(text) })
  const lines = [
    L('כותרת גדולה', 40, 20, 300),
    L('שורה ראשונה של פסקה ארוכה', 80), L('ממשיכה כאן ונגמרת.', 94, 11, 200),
    L('פסקה חדשה אחרי שורה קצרה', 108), L('עם עוד שורה', 122),
    L('אחרי רווח גדול', 160),
    L('• פריט ראשון', 174), L('• פריט שני', 188),
  ]
  const ps = W.buildParagraphs(lines)
  assert.deepEqual(ps.map(p => p.kind), ['h1', 'p', 'p', 'p', 'li', 'li'])
  assert.equal(ps[1].text, 'שורה ראשונה של פסקה ארוכה ממשיכה כאן ונגמרת.')
  assert.equal(ps[2].text, 'פסקה חדשה אחרי שורה קצרה עם עוד שורה')
  assert.equal(ps[1].rtl, true)
  const en = W.buildParagraphs([L('This is a hyphen-', 10), L('ated word', 24, 11, 200)])
  assert.equal(en[0].text, 'This is a hyphenated word')
})

test('bidiRuns: English islands become LTR runs inside a Hebrew paragraph', () => {
  assert.deepEqual(W.bidiRuns('שלום Microsoft Word 2024 תודה', true), [
    { text: 'שלום ', rtl: true }, { text: 'Microsoft Word 2024', rtl: false }, { text: ' תודה', rtl: true },
  ])
  assert.deepEqual(W.bidiRuns('Plain English', false), [{ text: 'Plain English', rtl: false }])
})

test('docx: text document is a valid package with RTL paragraphs, styles and page breaks', () => {
  const zip = W.docxFromParagraphs([
    [{ text: 'כותרת & "מרכאות" <תג>', rtl: true, kind: 'h1' }, { text: 'שלום Word', rtl: true, kind: 'p' }],
    [{ text: 'Page two', rtl: false, kind: 'li' }],
  ])
  const f = unzip(zip)
  for (const n of ['[Content_Types].xml', '_rels/.rels', 'word/document.xml', 'word/styles.xml', 'word/_rels/document.xml.rels', 'docProps/core.xml']) {
    assert.ok(f[n], n)
    assert.ok(wellFormed(new TextDecoder().decode(f[n])), n)
  }
  const doc = new TextDecoder().decode(f['word/document.xml'])
  assert.match(doc, /<w:pStyle w:val="Heading1"\/><w:bidi\/>/)
  assert.match(doc, /כותרת &amp; &quot;מרכאות&quot; &lt;תג&gt;/)
  assert.match(doc, /<w:br w:type="page"\/>/)
  assert.match(doc, /<w:r><w:t xml:space="preserve">Word<\/w:t><\/w:r>/)
  assert.match(doc, /<w:sectPr>.*<w:bidi\/><\/w:sectPr>/)
})

test('docx: picture document embeds one JPEG per page, fitted to A4', () => {
  const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9])
  const f = unzip(W.docxFromImages([{ data: jpg, w: 595, h: 842 }, { data: jpg, w: 842, h: 595 }]))
  assert.deepEqual(f['word/media/page2.jpeg'], jpg)
  const doc = new TextDecoder().decode(f['word/document.xml'])
  assert.ok(wellFormed(doc))
  assert.ok(wellFormed(new TextDecoder().decode(f['word/_rels/document.xml.rels'])))
  assert.equal((doc.match(/<wp:inline/g) || []).length, 2)
  assert.equal((doc.match(/<w:pageBreakBefore\/>/g) || []).length, 1)
  const ext = [...doc.matchAll(/<wp:extent cx="(\d+)" cy="(\d+)"/g)].map(m => [+m[1], +m[2]])
  for (const [cx, cy] of ext) assert.ok(cx <= 7560310 && cy <= 10560000)
  assert.ok(ext[1][0] > ext[1][1]) // the landscape page stays landscape
})

test('pickCuts: pages break between blocks, long blocks are cut, margins respected', () => {
  // page 1000px, margins 100; blocks end every 150px
  const bottoms = Array.from({ length: 20 }, (_, i) => 100 + (i + 1) * 150)
  const s = W.pickCuts(bottoms, 3100, 1000, 100, 100)
  assert.deepEqual(s[0], [0, 850])
  for (const [a, b] of s.slice(1, -1)) assert.ok(b - a <= 800 && bottoms.includes(b))
  assert.equal(s[s.length - 1][1], 3100)
  assert.deepEqual(W.pickCuts([], 2500, 1000, 100, 100), [[0, 900], [900, 1700], [1700, 2500]])
  assert.deepEqual(W.pickCuts([200], 700, 1000, 100, 100), [[0, 700]])
  assert.equal(W.bidiAlign('rtl', 'left'), 'right')
  assert.equal(W.bidiAlign('ltr', 'left'), 'left')
})

test('paragraphsFromLayout: visually stored Hebrew over several pages comes back readable', () => {
  const pages = [
    [{ str: 'תורתוכ', x: 400, y: 50, w: 80, size: 22 }, { str: 'םלועה לכל םולש', x: 300, y: 100, w: 180, size: 11 }],
    [{ str: 'ינש דומע ףוס', x: 330, y: 50, w: 150, size: 11 }],
  ]
  const ps = W.paragraphsFromLayout(pages)
  assert.equal(ps.length, 2)
  assert.deepEqual(ps[0].map(p => [p.kind, p.text]), [['h1', 'כותרות'], ['p', 'שלום לכל העולם']])
  assert.equal(ps[1][0].text, 'סוף עמוד שני')
  assert.equal(ps[1][0].rtl, true)
})
test('buildLines: brackets drawn in Hebrew text are mirrored, a final period moves after an English/number run', () => {
  // as Chrome draws "עם (הערה חשובה) ותאריך 02/11/2026." — "(" glyph on the left, ")" glyph on the right
  const items = [
    { str: 'עם', x: 382, y: 10, w: 20, size: 10 }, { str: ')', x: 372, y: 10, w: 4, size: 10 },
    { str: 'הערה חשובה', x: 304, y: 10, w: 68, size: 10 }, { str: '(', x: 300, y: 10, w: 4, size: 10 },
    { str: 'ותאריך', x: 240, y: 10, w: 40, size: 10 }, { str: '.02/11/2026', x: 170, y: 10, w: 60, size: 10 },
  ]
  assert.equal(W.buildLines(items, { rtlDoc: true })[0].text, 'עם (הערה חשובה) ותאריך 02/11/2026.')
})