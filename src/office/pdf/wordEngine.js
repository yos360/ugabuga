// Word (.docx) → PDF, in the browser: docx-preview lays the document out as HTML pages, html2canvas
// photographs each page, pdf-lib collects them. Loaded with import() only when a .docx is added.
import { renderAsync } from 'docx-preview'
import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'
import { pickCuts, bidiAlign } from './wordLogic.js'

const toBlob = (canvas, q) => new Promise((res, rej) => canvas.toBlob(b => b ? res(b) : rej(Object.assign(new Error('memory'), { code: 'memory' })), 'image/jpeg', q))
const pt = v => { const n = parseFloat(v); return /cm$/.test(v) ? n * 72 / 2.54 : /mm$/.test(v) ? n * 72 / 25.4 : /in$/.test(v) ? n * 72 : /px$/.test(v) ? n * 0.75 : n }

export async function docxToPdf(file, onProgress) {
  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  // laid out at real size, just off-screen (html2canvas needs it rendered, not hidden)
  host.style.cssText = 'position:absolute;top:0;left:-30000px;width:1200px;background:#fff;color:#000;direction:ltr'
  const styleBox = document.createElement('div'), body = document.createElement('div')
  host.append(styleBox, body)
  document.body.appendChild(host)
  try {
    try {
      await renderAsync(await file.arrayBuffer(), body, styleBox, {
        inWrapper: false, breakPages: true, ignoreLastRenderedPageBreak: false,
        renderHeaders: true, renderFooters: true, renderFootnotes: true, useBase64URL: true, experimental: true,
      })
    } catch (e) { throw Object.assign(new Error('docx'), { code: 'docx', cause: e }) }
    // Word's left/right in a right-to-left paragraph mean start/end
    for (const el of body.querySelectorAll('p, td, th, li, span')) {
      const cs = getComputedStyle(el)
      const fixed = bidiAlign(cs.direction, cs.textAlign)
      if (fixed !== cs.textAlign) el.style.textAlign = fixed
    }
    await document.fonts?.ready
    const all = [...body.querySelectorAll('section.docx')]
    if (!all.length) throw Object.assign(new Error('docx'), { code: 'docx' })
    // a page break right before a section break leaves an empty page behind; Word doesn't print those
    const filled = all.filter(s => s.innerText.trim() || s.querySelector('img, svg, table, canvas'))
    const sections = filled.length ? filled : all.slice(0, 1)

    const out = await PDFDocument.create()
    out.setProducer('ugabuga.co.il'); out.setCreator('ugabuga.co.il')
    for (let s = 0; s < sections.length; s++) {
      onProgress?.(s, sections.length)
      const sec = sections[s]
      const wPt = pt(sec.style.width) || 595.3, hPt = pt(sec.style.minHeight) || 841.9
      const W = sec.offsetWidth, pageH = W * (hPt / wPt), total = sec.scrollHeight
      const cs = getComputedStyle(sec)
      const mTop = parseFloat(cs.paddingTop) || 0, mBottom = parseFloat(cs.paddingBottom) || 0
      const top = sec.getBoundingClientRect().top
      const bottoms = [...sec.querySelectorAll('p, li, tr, img, h1, h2, h3, h4, h5, h6')].map(el => el.getBoundingClientRect().bottom - top)
      const slices = total <= pageH + 2 ? [[0, total]] : pickCuts(bottoms, total, pageH, mTop, mBottom)
      // short sections: one shot, then cut. Long ones: one shot per page, so a long document stays sharp.
      const scale = 2, whole = W * total * scale * scale <= 24e6
      const snap = (y0, h) => html2canvas(sec, { scale, backgroundColor: '#ffffff', logging: false, useCORS: true, windowWidth: 1400, ...(h ? { y: top + window.scrollY + y0, height: h } : {}) })
      let shot = whole ? await snap() : null
      for (let i = 0; i < slices.length; i++) {
        const [y0, y1] = slices[i]
        if (!whole) shot = await snap(y0, y1 - y0)
        const sy = whole ? y0 * scale : 0
        const c = document.createElement('canvas')
        c.width = Math.round(W * scale); c.height = Math.round(pageH * scale)
        const ctx = c.getContext('2d')
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height)
        const dy = i ? mTop : 0
        const h = Math.min((y1 - y0) * scale, shot.height - sy)
        ctx.drawImage(shot, 0, sy, shot.width, h, 0, dy * scale, shot.width, h)
        const img = await out.embedJpg(new Uint8Array(await (await toBlob(c, 0.9)).arrayBuffer()))
        const page = out.addPage([wPt, hPt])
        page.drawImage(img, { x: 0, y: 0, width: wPt, height: hPt })
        c.width = c.height = 0
        if (!whole) shot.width = shot.height = 0
      }
      if (shot) shot.width = shot.height = 0
    }
    onProgress?.(sections.length, sections.length)
    return { bytes: await out.save({ useObjectStreams: true }), html: { styles: styleBox.innerHTML, body: body.innerHTML } }
  } finally { host.remove() }
}

// Print the laid-out document in its own window: the browser's "Save as PDF" then keeps real, sharp text.
export function printDocx(html, title) {
  const w = window.open('', '_blank')
  if (!w) return false
  w.document.open()
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${String(title).replace(/[<&]/g, '')}</title>
<style>@page{size:A4;margin:12mm 0}html,body{margin:0;background:#fff}section.docx{margin:0 auto!important;box-shadow:none!important;padding-top:0!important;padding-bottom:0!important;min-height:0!important;break-after:page}</style>
${html.styles}</head><body>${html.body}</body></html>`)
  w.document.close()
  const go = () => { w.focus(); w.print() }
  if (w.document.readyState === 'complete') setTimeout(go, 300); else w.addEventListener('load', () => setTimeout(go, 300))
  return true
}
