// Turn the printable sheets on screen into a real PDF file, right in the browser — so people can save
// a worksheet even where the phone's own print dialog won't (in-app browsers, stuck print services).
// Each sheet is drawn to a canvas with html2canvas and placed as a JPEG on an A4 page of a tiny,
// hand-written PDF (no PDF library needed).

const A4_W = 595.28, A4_H = 841.89 // points
const PAGE_PX = 794 // A4 width at 96 dpi — sheets are laid out at this width before capture

const latin1 = s => { const b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 0xff; return b }

import { buildPdf } from './pdfWriter'
export { buildPdf } from './pdfWriter'

let pdfFontPromise
function loadPdfFont() {
  if (!pdfFontPromise) pdfFontPromise = Promise.all([
    fetch('/fonts/pdf/NotoSansHebrew-Regular.ttf'), fetch('/fonts/pdf/metrics.json'),
  ]).then(async ([font, metrics]) => {
    if (!font.ok || !metrics.ok) throw new Error('PDF font could not be loaded')
    return { bytes: new Uint8Array(await font.arrayBuffer()), metrics: await metrics.json() }
  }).catch(error => { pdfFontPromise = null; throw error })
  return pdfFontPromise
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

// Fast path. html2canvas re-clones the whole page for every sheet, which takes seconds per page.
// Most sheets are just a picture (an <svg> or <img>), a few one-line headings and the QR badge, so
// they're drawn straight onto a canvas from their measured positions. Anything else — wrapping text,
// rotated art — returns null and goes through html2canvas.
const SCALE = 1.6
function loadImage(src) { return new Promise((ok, fail) => { const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = src }) }
async function fastRender(sheet, scale) {
  const root = sheet.getBoundingClientRect(), items = []
  const visible = el => { const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity !== 0 }
  const walk = el => {
    for (const child of el.children) {
      if (!visible(child)) continue
      const cs = getComputedStyle(child)
      if (cs.transform !== 'none' && child.tagName.toLowerCase() !== 'svg') return false
      const tag = child.tagName.toLowerCase()
      if (tag === 'svg' || tag === 'img') { items.push({ kind: tag, el: child }); continue }
      const text = [...child.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim()
      if (text) {
        if (child.children.length) return false // mixed text and elements: let html2canvas lay it out
        const r = child.getBoundingClientRect(), lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.3
        if (child.getClientRects().length > 1 || r.height > lh * 1.6) return false // wraps
        items.push({ kind: 'text', el: child, text, cs })
        continue
      }
      if (walk(child) === false) return false
    }
  }
  if (walk(sheet) === false || !items.some(i => i.kind !== 'text')) return null
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(root.width * scale); canvas.height = Math.round(root.height * scale)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.scale(scale, scale)
  try {
    for (const it of items) {
      const r = it.el.getBoundingClientRect(), x = r.left - root.left, y = r.top - root.top
      if (r.width < 1 || r.height < 1) continue
      if (it.kind === 'svg') {
        const svg = it.el.cloneNode(true)
        svg.setAttribute('width', r.width); svg.setAttribute('height', r.height); svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
        const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }))
        try { ctx.drawImage(await loadImage(url), x, y, r.width, r.height) } finally { URL.revokeObjectURL(url) }
      } else if (it.kind === 'img') {
        const img = it.el.complete && it.el.naturalWidth ? it.el : await loadImage(it.el.currentSrc || it.el.src)
        const k = Math.min(r.width / img.naturalWidth, r.height / img.naturalHeight), w = img.naturalWidth * k, h = img.naturalHeight * k
        ctx.drawImage(img, x + (r.width - w) / 2, y + (r.height - h) / 2, w, h)
      } else {
        const cs = it.cs, rtl = cs.direction === 'rtl', align = cs.textAlign
        ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
        ctx.fillStyle = cs.color; ctx.direction = cs.direction; ctx.textBaseline = 'middle'
        const pl = parseFloat(cs.paddingLeft) || 0, pr = parseFloat(cs.paddingRight) || 0
        const isCenter = align === 'center', isRight = align === 'right' || (rtl && (align === 'start' || align === 'justify')) || (!rtl && align === 'end')
        ctx.textAlign = isCenter ? 'center' : isRight ? 'right' : 'left'
        const tx = isCenter ? x + r.width / 2 : isRight ? x + r.width - pr : x + pl
        ctx.fillText(it.text, tx, y + r.height / 2)
      }
    }
  } catch { return null }
  return canvas
}

const IN_APP = /FBAN|FBAV|FB_IAB|Instagram|WhatsApp|Line\/|Snapchat|TikTok|musical_ly|; wv\)/i

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

// Read the printable DOM, never OCR or guessed content. Coordinates are kept
// so a flowing sheet's text is assigned to the same PDF slice as its artwork.
function printableText(root) {
  const box = root.getBoundingClientRect(), blocks = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node
  while ((node = walker.nextNode())) {
    const el = node.parentElement, text = node.textContent.replace(/\s+/g, ' ').trim()
    if (!text || !el || el.closest('script,style')) continue
    const hidden = el.closest('[aria-hidden="true"]')
    if (hidden && root.contains(hidden)) continue
    const style = getComputedStyle(el)
    if (style.display === 'none' || style.visibility === 'hidden') continue
    const range = document.createRange(); range.selectNodeContents(node)
    const rect = range.getBoundingClientRect()
    if (!rect.width || !rect.height) continue
    blocks.push({ text, direction: style.direction, tag: el.closest('h1,h2,h3,h4,h5,h6')?.tagName || 'P', x: (rect.left - box.left) * SCALE, y: (rect.top - box.top) * SCALE, width: rect.width * SCALE })
  }
  return blocks
}

// Render the given sheet elements (.buga-a4 / .buga-flow) and save them as one PDF.
export async function savePagesAsPdf(sheets, filename, onProgress, options = {}) {
  const { default: html2canvas } = await import('html2canvas')
  const textFont = await loadPdfFont()
  // Lay the sheets out off-screen at a fixed desktop width, unaffected by the dialog's phone zoom.
  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  host.style.cssText = `position:fixed;left:-${PAGE_PX * 2}px;top:0;width:${PAGE_PX}px;direction:rtl;background:#fff;z-index:-1`
  document.body.appendChild(host)
  // html2canvas finds each font's baseline with a tiny inline GIF in the page itself; Tailwind's
  // "img { display: block }" breaks that measurement and every line of text came out several pixels
  // too low (headings' underlines crossed the words). Keep that probe inline while we capture.
  const probeFix = document.createElement('style')
  probeFix.textContent = 'img[src^="data:image/gif"]{display:inline!important;vertical-align:baseline!important}'
  document.head.appendChild(probeFix)
  const images = []
  try {
    for (let i = 0; i < sheets.length; i++) {
      onProgress?.(i + 1, sheets.length)
      const clone = sheets[i].cloneNode(true)
      clone.style.direction = getComputedStyle(sheets[i]).direction
      clone.style.width = PAGE_PX + 'px'; clone.style.maxWidth = 'none'; clone.style.zoom = '1'; clone.style.margin = '0'
      // A4 sheets fill exactly one page; flowing sheets are at least one page tall so the QR and credit sit at the bottom.
      if (clone.classList.contains('buga-a4')) clone.style.height = Math.round(PAGE_PX * 297 / 210) + 'px'
      else clone.style.minHeight = Math.round(PAGE_PX * 297 / 210) + 'px'
      host.replaceChildren(clone)
      await inlineSvgImages(clone)
      await Promise.all([...clone.querySelectorAll('svg')].filter(svg => !svg.parentElement?.closest('svg')).map(embedFonts))
      await Promise.allSettled([...clone.querySelectorAll('img')].map(img => img.decode?.()))
      const canvas = (await fastRender(clone, SCALE)) || await html2canvas(clone, { scale: SCALE, backgroundColor: '#ffffff', useCORS: true, logging: false, windowWidth: PAGE_PX })
      const blocks = printableText(clone)
      const alt = [...clone.querySelectorAll('img[alt],svg[aria-label]')].map(el => el.getAttribute('alt') || el.getAttribute('aria-label')).filter(Boolean).join('. ') || `${filename || 'עוגה בוגה'} — דף ${i + 1}`
      let offset = 0
      for (const c of sliceCanvas(canvas)) {
        const textBlocks = blocks.filter(b => b.y >= offset && b.y < offset + c.height).map(b => ({ ...b, y: b.y - offset }))
        images.push({ ...canvasToJpeg(c), alt, textBlocks })
        offset += c.height
      }
    }
  } finally {
    host.remove()
    probeFix.remove()
  }
  const blob = new Blob([buildPdf(images, { textFont, title: filename || 'עוגה בוגה', lang: sheets[0]?.closest('[lang]')?.getAttribute('lang') || document.documentElement.lang || 'he' })], { type: 'application/pdf' })
  await options.onBlob?.(blob)
  const name = (filename || 'ugabuga').replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 60) + '.pdf'
  // Remember where the file was made: a blob link that later loses its "blob:" prefix lands on
  // ugabuga.co.il/<uuid>, and the 404 page sends the visitor back here (see NotFound.jsx).
  try { localStorage.setItem('buga-last-pdf', JSON.stringify({ path: location.pathname + location.search, title: filename || '', at: Date.now() })) } catch { /* ignore */ }
  // In-app browsers (WhatsApp, Facebook, Instagram…) ignore `download` and open the blob URL itself,
  // which breaks once it is revoked — hand them the file through the share sheet instead.
  if (IN_APP.test(navigator.userAgent || '')) {
    try {
      const file = new File([blob], name, { type: 'application/pdf' })
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: name }); return 'shared' }
    } catch (e) { if (e?.name === 'AbortError') return 'cancelled' }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name
  document.body.appendChild(a); a.click(); a.remove()
  // Starting a download does not prove that the browser saved it. Keep a direct
  // user-activated fallback link; the preview owns and releases this object URL.
  return { status: 'prepared', url, name }
}
