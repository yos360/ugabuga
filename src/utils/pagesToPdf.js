// Turn the printable sheets on screen into a real PDF file, right in the browser — so people can save
// a worksheet even where the phone's own print dialog won't (in-app browsers, stuck print services).
// Each sheet is drawn to a canvas with html2canvas and placed as a JPEG on an A4 page of a tiny,
// hand-written PDF (no PDF library needed).

const A4_W = 595.28, A4_H = 841.89 // points
const PAGE_PX = 794 // A4 width at 96 dpi — sheets are laid out at this width before capture

const latin1 = s => { const b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 0xff; return b }

// images: [{ bytes: Uint8Array (JPEG), width, height }] → PDF bytes, one A4 page per image.
export function buildPdf(images) {
  const chunks = [], offsets = []
  let length = 0
  const push = part => { const b = typeof part === 'string' ? latin1(part) : part; chunks.push(b); length += b.length }
  const obj = (n, body) => { offsets[n] = length; push(`${n} 0 obj\n`); body(); push('\nendobj\n') }

  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')
  const pageIds = images.map((_, i) => 3 + i * 3)
  obj(1, () => push('<< /Type /Catalog /Pages 2 0 R >>'))
  obj(2, () => push(`<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${images.length} >>`))
  images.forEach((img, i) => {
    const page = pageIds[i], content = page + 1, xobj = page + 2
    // Fit the sheet inside the page, keeping its proportions, centred.
    const scale = Math.min(A4_W / img.width, A4_H / img.height), w = img.width * scale, h = img.height * scale
    const x = (A4_W - w) / 2, y = A4_H - h // top-aligned
    obj(page, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_W} ${A4_H}] /Resources << /XObject << /Im${i} ${xobj} 0 R >> >> /Contents ${content} 0 R >>`))
    const draw = `q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /Im${i} Do Q`
    obj(content, () => push(`<< /Length ${draw.length} >>\nstream\n${draw}\nendstream`))
    obj(xobj, () => { push(`<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.bytes.length} >>\nstream\n`); push(img.bytes); push('\nendstream') })
  })
  const xref = length, count = 3 + images.length * 3
  push(`xref\n0 ${count}\n0000000000 65535 f \n`)
  for (let n = 1; n < count; n++) push(`${String(offsets[n]).padStart(10, '0')} 00000 n \n`)
  push(`trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`)
  const out = new Uint8Array(length)
  let at = 0
  for (const c of chunks) { out.set(c, at); at += c.length }
  return out
}

function canvasToJpeg(canvas) {
  const data = atob(canvas.toDataURL('image/jpeg', 0.9).split(',')[1])
  return { bytes: latin1(data), width: canvas.width, height: canvas.height }
}

// An <svg> is drawn by html2canvas as a standalone picture, which can't load outside files —
// so artwork referenced by <image href="/print-art/…"> is inlined as a data URL first.
const dataUrls = new Map()
function toDataUrl(src) {
  if (!dataUrls.has(src)) dataUrls.set(src, fetch(src).then(r => r.blob()).then(b => new Promise((ok, fail) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.onerror = fail; fr.readAsDataURL(b) })).catch(() => src))
  return dataUrls.get(src)
}
async function inlineSvgImages(root) {
  await Promise.all([...root.querySelectorAll('svg image')].map(async el => {
    const src = el.getAttribute('href') || el.getAttribute('xlink:href')
    if (!src || src.startsWith('data:')) return
    const data = await toDataUrl(src)
    el.setAttribute('href', data)
  }))
}

// An <svg> drawn as a picture can't see the page's web fonts either (the dashed tracing font, Heebo),
// so the @font-face rules it uses are copied into the svg with the font files inlined as data URLs.
const norm = f => f.trim().replace(/^['"]|['"]$/g, '').toLowerCase()
let faceBlocks = null
async function allFontFaces() {
  if (!faceBlocks) faceBlocks = (async () => {
    const out = []
    for (const sheet of [...document.styleSheets]) {
      let rules = null
      try { rules = sheet.cssRules } catch { rules = null }
      if (rules) { for (const r of rules) if (r.type === 5) out.push({ css: r.cssText, base: sheet.href || location.href }) }
      else if (sheet.href) {
        try { const text = await (await fetch(sheet.href)).text(); for (const m of text.matchAll(/@font-face\s*{[^}]*}/g)) out.push({ css: m[0], base: sheet.href }) } catch { /* skip */ }
      }
    }
    return out
  })()
  return faceBlocks
}
const HEBREW_OR_BASIC = /U\+(0?0[0-9A-F]{2}-00FF|0590|05[0-9A-F]{2})/i
async function embedFonts(svg) {
  const used = new Map() // family → set of weights
  const add = (fam, w) => { if (!fam) return; for (const f of fam.split(',')) { const k = norm(f); if (!used.has(k)) used.set(k, new Set()); used.get(k).add(String(w || 400)) } }
  for (const el of [svg, ...svg.querySelectorAll('*')]) {
    const fam = el.getAttribute('font-family') || el.style?.fontFamily
    const weight = el.getAttribute('font-weight') || el.style?.fontWeight || svg.getAttribute('font-weight')
    if (fam) add(fam, weight)
    else if (el.tagName.toLowerCase() === 'text' && weight) add(svg.getAttribute('font-family'), weight)
  }
  if (!used.size) return
  const css = []
  for (const { css: block, base } of await allFontFaces()) {
    const fam = norm(block.match(/font-family:\s*([^;]+);/)?.[1] || '')
    if (!used.has(fam)) continue
    const range = block.match(/unicode-range:\s*([^;}]+)/)?.[1]
    if (range && !HEBREW_OR_BASIC.test(range)) continue
    const w = block.match(/font-weight:\s*(\d+)/)?.[1]
    if (w && ![...used.get(fam)].some(u => Math.abs(+u - +w) <= 100 || u === 'bold' && +w >= 700)) continue
    const url = block.match(/url\(["']?([^"')]+)["']?\)/)?.[1]
    if (!url) continue
    const data = await toDataUrl(new URL(url, base).href)
    css.push(block.replace(/src:[^;}]+/, `src: url(${data})`))
  }
  if (!css.length) return
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
  style.textContent = css.join('\n')
  svg.insertBefore(style, svg.firstChild)
}

// Slice a tall canvas (a flowing text sheet) into A4-proportioned pieces.
function sliceCanvas(canvas) {
  const pageH = Math.round(canvas.width * A4_H / A4_W)
  if (canvas.height <= pageH * 1.02) return [canvas]
  const out = []
  for (let top = 0; top < canvas.height; top += pageH) {
    const c = document.createElement('canvas')
    c.width = canvas.width; c.height = Math.min(pageH, canvas.height - top)
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height)
    ctx.drawImage(canvas, 0, top, canvas.width, c.height, 0, 0, canvas.width, c.height)
    out.push(c)
  }
  return out
}

// Render the given sheet elements (.buga-a4 / .buga-flow) and save them as one PDF.
export async function savePagesAsPdf(sheets, filename, onProgress) {
  const { default: html2canvas } = await import('html2canvas')
  // Lay the sheets out off-screen at a fixed desktop width, unaffected by the dialog's phone zoom.
  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  host.style.cssText = `position:fixed;left:-${PAGE_PX * 2}px;top:0;width:${PAGE_PX}px;direction:rtl;background:#fff;z-index:-1`
  document.body.appendChild(host)
  const images = []
  try {
    for (let i = 0; i < sheets.length; i++) {
      onProgress?.(i + 1, sheets.length)
      const clone = sheets[i].cloneNode(true)
      clone.style.width = PAGE_PX + 'px'; clone.style.maxWidth = 'none'; clone.style.zoom = '1'; clone.style.margin = '0'
      // A4 sheets fill exactly one page; flowing sheets are at least one page tall so the QR and credit sit at the bottom.
      if (clone.classList.contains('buga-a4')) clone.style.height = Math.round(PAGE_PX * 297 / 210) + 'px'
      else clone.style.minHeight = Math.round(PAGE_PX * 297 / 210) + 'px'
      host.replaceChildren(clone)
      await inlineSvgImages(clone)
      await Promise.all([...clone.querySelectorAll('svg')].filter(svg => !svg.parentElement?.closest('svg')).map(embedFonts))
      await Promise.allSettled([...clone.querySelectorAll('img')].map(img => img.decode?.()))
      const canvas = await html2canvas(clone, { scale: 1.6, backgroundColor: '#ffffff', useCORS: true, logging: false, windowWidth: PAGE_PX })
      for (const c of sliceCanvas(canvas)) images.push(canvasToJpeg(c))
    }
  } finally {
    host.remove()
  }
  const blob = new Blob([buildPdf(images)], { type: 'application/pdf' })
  const name = (filename || 'ugabuga').replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 60) + '.pdf'
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30000)
  return 'downloaded'
}
