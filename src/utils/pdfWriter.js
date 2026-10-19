// Keep the existing raster artwork, but retain Unicode text and reading order.
// This is tagged PDF, not a declaration of PDF/UA conformance: complex diagrams
// and tables still need descriptions supplied by their source templates.
const A4_W = 595.28, A4_H = 841.89
import bidiFactory from 'bidi-js'
const bidi = bidiFactory()
export function pdfVisualText(text, direction) {
  const levels = bidi.getEmbeddingLevels(text, direction)
  const chars = text.split('')
  for (const [start, end] of bidi.getReorderSegments(text, levels)) {
    const reversed = chars.slice(start, end + 1).reverse()
    chars.splice(start, reversed.length, ...reversed)
  }
  return chars.join('')
}
const bytes = value => Uint8Array.from(value, c => c.charCodeAt(0) & 255)
export const pdfUnicode = value => '<FEFF' + Array.from({ length: String(value).length }, (_, i) => String(value).charCodeAt(i).toString(16).padStart(4, '0')).join('') + '>'

export function buildPdf(images, { title = 'Ugabuga', lang = 'he', textFont } = {}) {
  const objects = [null]
  const reserve = () => objects.push(null) - 1
  const set = (id, value) => { objects[id] = typeof value === 'string' ? bytes(value) : value }
  const stream = (dictionary, data) => {
    const head = bytes(`<< ${dictionary} /Length ${data.length} >>\nstream\n`), tail = bytes('\nendstream')
    const result = new Uint8Array(head.length + data.length + tail.length)
    result.set(head); result.set(data, head.length); result.set(tail, head.length + data.length)
    return result
  }
  const catalog = reserve(), pages = reserve(), structure = reserve(), document = reserve(), parents = reserve(), font = reserve(), info = reserve()
  const pageIds = [], sections = [], parentEntries = []
  const chars = [...new Set(images.flatMap(img => (img.textBlocks || []).flatMap(b => Array.from(b.text || ''))))]
  if (chars.length && (!textFont?.bytes?.length || !textFont.metrics)) throw new Error('PDF text font is required')
  if (chars.length > 65534) throw new Error('Too many PDF characters')
  const codes = new Map(chars.map((ch, i) => [ch, i + 1]))
  const encode = text => Array.from(text, ch => codes.get(ch).toString(16).padStart(4, '0')).join('')
  if (chars.length) {
    const descendant = reserve(), descriptor = reserve(), file = reserve(), mapping = reserve(), unicode = reserve()
    const metrics = textFont.metrics, gids = new Uint8Array((chars.length + 1) * 2)
    const widths = chars.map((ch, i) => { const cp = ch.codePointAt(0), gid = metrics.glyphs[cp] || 0; gids[(i + 1) * 2] = gid >> 8; gids[(i + 1) * 2 + 1] = gid & 255; return metrics.widths[cp] || 600 })
    let cmap = '/CIDInit /ProcSet findresource begin 12 dict begin begincmap\n/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n/CMapName /UgabugaUnicode def /CMapType 2 def\n1 begincodespacerange <0000> <FFFF> endcodespacerange\n'
    for (let start = 0; start < chars.length; start += 100) {
      const batch = chars.slice(start, start + 100)
      cmap += `${batch.length} beginbfchar\n` + batch.map(ch => `<${encode(ch)}> <${pdfUnicode(ch).slice(5, -1)}>`).join('\n') + '\nendbfchar\n'
    }
    cmap += 'endcmap CMapName currentdict /CMap defineresource pop end end'
    set(unicode, stream('', bytes(cmap)))
    set(mapping, stream('', gids))
    set(file, stream(`/Length1 ${textFont.bytes.length}`, textFont.bytes))
    set(descriptor, `<< /Type /FontDescriptor /FontName /NotoSansHebrew-Regular /Flags 4 /FontBBox [${metrics.bbox.join(' ')}] /ItalicAngle 0 /Ascent ${metrics.ascent} /Descent ${metrics.descent} /CapHeight ${metrics.ascent} /StemV 80 /FontFile2 ${file} 0 R >>`)
    set(descendant, `<< /Type /Font /Subtype /CIDFontType2 /BaseFont /NotoSansHebrew-Regular /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${descriptor} 0 R /CIDToGIDMap ${mapping} 0 R /DW 600 /W [1 [${widths.join(' ')}]] >>`)
    set(font, `<< /Type /Font /Subtype /Type0 /BaseFont /NotoSansHebrew-Regular /Encoding /Identity-H /DescendantFonts [${descendant} 0 R] /ToUnicode ${unicode} 0 R >>`)
  } else set(font, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  set(info, `<< /Title ${pdfUnicode(title)} /Creator (Ugabuga) >>`)
  images.forEach((img, i) => {
    if (!(img.width > 0 && img.height > 0) || !img.bytes?.length) throw new Error('Invalid PDF page image')
    const page = reserve(), content = reserve(), picture = reserve(), section = reserve(), figure = reserve()
    pageIds.push(page); sections.push(section)
    const scale = Math.min(A4_W / img.width, A4_H / img.height), w = img.width * scale, h = img.height * scale
    const x = (A4_W - w) / 2, y = A4_H - h
    const tags = [figure], sectionsForPage = []
    let draw = `/Figure <</MCID 0>> BDC q ${w.toFixed(3)} 0 0 ${h.toFixed(3)} ${x.toFixed(3)} ${y.toFixed(3)} cm /Im0 Do Q EMC\n`
    set(figure, `<< /Type /StructElem /S /Figure /P ${section} 0 R /Pg ${page} 0 R /K 0 /Alt ${pdfUnicode(img.alt || `${title} — ${i + 1}`)} >>`)
    for (const block of img.textBlocks || []) {
      if (!block.text?.trim()) continue
      const tag = reserve(), span = reserve(), mcid = tags.length
      const semantic = /^H[1-6]$/.test(block.tag) ? block.tag : 'P'
      const bx = x + Math.max(0, Math.min(img.width, block.x || 0)) * scale
      const by = A4_H - Math.max(0, Math.min(img.height, block.y || 0)) * scale
      const naturalWidth = Array.from(block.text, ch => textFont.metrics.widths[ch.codePointAt(0)] || 600).reduce((a, b) => a + b, 0) / 100
      const stretch = block.width > 0 ? Math.max(1, block.width * scale / naturalWidth * 100) : 100
      // Emit Hebrew runs in visual order; PDF readers restore logical order from
      // the Unicode mapping. ActualText would make PDFium reverse Hebrew twice.
      const visualText = pdfVisualText(block.text, block.direction)
      draw += `/Span <</MCID ${mcid}>> BDC BT /F0 10 Tf 3 Tr ${stretch.toFixed(3)} Tz 1 0 0 1 ${bx.toFixed(3)} ${by.toFixed(3)} Tm <${encode(visualText)}> Tj ET EMC\n`
      set(tag, `<< /Type /StructElem /S /${semantic} /P ${section} 0 R /Pg ${page} 0 R /K ${span} 0 R >>`)
      set(span, `<< /Type /StructElem /S /Span /P ${tag} 0 R /Pg ${page} 0 R /K ${mcid} >>`)
      tags.push(span)
      // Section children are paragraphs; ParentTree entries point at the Span
      // directly owning the corresponding marked-content identifier.
      sectionsForPage.push(tag)
    }
    function children() { return [figure, ...sectionsForPage].map(id => `${id} 0 R`).join(' ') }
    set(section, `<< /Type /StructElem /S /Sect /P ${document} 0 R /Pg ${page} 0 R /K [${children()}] >>`)
    parentEntries.push(`${i} [${tags.map(id => `${id} 0 R`).join(' ')}]`)
    set(page, `<< /Type /Page /Parent ${pages} 0 R /MediaBox [0 0 ${A4_W} ${A4_H}] /StructParents ${i} /Tabs /S /Resources << /Font << /F0 ${font} 0 R >> /XObject << /Im0 ${picture} 0 R >> >> /Contents ${content} 0 R >>`)
    set(content, stream('', bytes(draw)))
    set(picture, stream(`/Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode`, img.bytes))
  })
  set(catalog, `<< /Type /Catalog /Pages ${pages} 0 R /Lang ${pdfUnicode(lang)} /MarkInfo << /Marked true >> /StructTreeRoot ${structure} 0 R /ViewerPreferences << /DisplayDocTitle true >> >>`)
  set(pages, `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`)
  set(structure, `<< /Type /StructTreeRoot /K ${document} 0 R /ParentTree ${parents} 0 R /ParentTreeNextKey ${images.length} >>`)
  set(document, `<< /Type /StructElem /S /Document /P ${structure} 0 R /K [${sections.map(id => `${id} 0 R`).join(' ')}] >>`)
  set(parents, `<< /Nums [${parentEntries.join(' ')}] >>`)
  const chunks = [], offsets = [0]; let length = 0
  const push = value => { const chunk = typeof value === 'string' ? bytes(value) : value; chunks.push(chunk); length += chunk.length }
  push('%PDF-1.7\n%\xE2\xE3\xCF\xD3\n')
  for (let id = 1; id < objects.length; id++) { offsets[id] = length; push(`${id} 0 obj\n`); push(objects[id]); push('\nendobj\n') }
  const xref = length
  push(`xref\n0 ${objects.length}\n0000000000 65535 f \n`)
  for (const offset of offsets.slice(1)) push(`${String(offset).padStart(10, '0')} 00000 n \n`)
  push(`trailer\n<< /Size ${objects.length} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`)
  const result = new Uint8Array(length); let at = 0
  for (const chunk of chunks) { result.set(chunk, at); at += chunk.length }
  return result
}
