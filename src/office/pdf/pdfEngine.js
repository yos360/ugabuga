// Heavy half of /tools/pdf: pdf.js (rendering, text) + pdf-lib (writing). Loaded with import() only after
// the visitor adds a file, so the page itself stays light. Everything runs locally; nothing is uploaded.
import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { PDFDocument, degrees } from 'pdf-lib'
import { placeOnPage, COMPRESS } from './pdfLogic'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

const A4 = [595.28, 841.89]
const MAX_PIXELS = 16e6 // keep every canvas well under browser limits (phones included)
// 'print' renders without requestAnimationFrame, so work keeps going while the tab is in the background
const RENDER_INTENT = 'print'
// let the UI breathe between pages (MessageChannel isn't throttled in background tabs like setTimeout is)
const tick = () => new Promise(r => { const ch = new MessageChannel(); ch.port1.onmessage = () => r(); ch.port2.postMessage(0) })

export class PdfError extends Error {
  constructor(code, msg) { super(msg || code); this.code = code }
}

// ── reading ──
export async function openPdf(bytes, password) {
  const task = pdfjs.getDocument({ data: bytes.slice(), password, isEvalSupported: false })
  try {
    const pdf = await task.promise
    return { pdf, numPages: pdf.numPages }
  } catch (e) {
    if (e && e.name === 'PasswordException') throw new PdfError(e.code === 2 ? 'badpassword' : 'password')
    throw new PdfError('broken', e && e.message)
  }
}

// pdf-lib copy of a source, made once. Locked or odd files that pdf-lib can't read get drawn as images instead.
async function libDoc(src) {
  if (src.raster) return null
  if (!src.lib) {
    try { src.lib = await PDFDocument.load(src.bytes, { updateMetadata: false }) }
    catch { src.raster = true; return null }
  }
  return src.lib
}

function loadImg(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new PdfError('image'))
    img.src = url
  })
}
const imgCache = new Map()
const cachedImg = url => { if (!imgCache.has(url)) imgCache.set(url, loadImg(url)); return imgCache.get(url) }

const toBlob = (canvas, type, q) => new Promise((res, rej) => canvas.toBlob(b => b ? res(b) : rej(new PdfError('memory')), type, q))
const blobBytes = async b => new Uint8Array(await b.arrayBuffer())

// A photo or screenshot → upright (EXIF applied by the browser), at most 3000px, as JPEG (or PNG when it was PNG).
export async function readImage(file) {
  const url = URL.createObjectURL(file)
  try {
    const img = await loadImg(url)
    const k = Math.min(1, 3000 / Math.max(img.naturalWidth, img.naturalHeight))
    const w = Math.max(1, Math.round(img.naturalWidth * k)), h = Math.max(1, Math.round(img.naturalHeight * k))
    const c = document.createElement('canvas'); c.width = w; c.height = h
    const png = /png|gif|webp/i.test(file.type)
    const ctx = c.getContext('2d')
    if (!png) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h) }
    ctx.drawImage(img, 0, 0, w, h)
    const blob = await toBlob(c, png ? 'image/png' : 'image/jpeg', 0.9)
    return { bytes: await blobBytes(blob), mime: blob.type, w, h, url: URL.createObjectURL(blob) }
  } finally { URL.revokeObjectURL(url) }
}

// Small preview of one PDF page (its own /Rotate applied; the visitor's extra rotation is done in CSS).
export async function renderThumb(src, index, maxW = 260) {
  const page = await src.pdf.getPage(index + 1)
  const vp1 = page.getViewport({ scale: 1 })
  const scale = Math.min(maxW / vp1.width, (maxW * 1.5) / vp1.height)
  const vp = page.getViewport({ scale })
  const c = document.createElement('canvas')
  c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height)
  await page.render({ canvasContext: ctx, viewport: vp, intent: RENDER_INTENT }).promise
  const blob = await toBlob(c, 'image/jpeg', 0.8)
  page.cleanup()
  return { url: URL.createObjectURL(blob), w: vp1.width, h: vp1.height }
}

// The page exactly as shown (all rotations + overlays) on a canvas. Size: `scale` × points, capped by MAX_PIXELS.
// For image pages, one "point" is one image pixel × 0.75 (96 dpi).
export async function renderShown(item, src, scale, withOverlays = true) {
  const c = document.createElement('canvas')
  const ctx = c.getContext('2d')
  if (src.kind === 'pdf') {
    const page = await src.pdf.getPage(item.index + 1)
    const rotation = (page.rotate + item.rot) % 360
    const base = page.getViewport({ scale: 1, rotation })
    const s = Math.min(scale, Math.sqrt(MAX_PIXELS / (base.width * base.height)))
    const vp = page.getViewport({ scale: s, rotation })
    c.width = Math.max(1, Math.round(vp.width)); c.height = Math.max(1, Math.round(vp.height))
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height)
    await page.render({ canvasContext: ctx, viewport: vp, intent: RENDER_INTENT }).promise
    page.cleanup()
    c.points = [base.width, base.height]
  } else {
    const img = await cachedImg(src.url)
    const side = item.rot % 180 !== 0
    const pw = (side ? src.h : src.w) * 0.75, ph = (side ? src.w : src.h) * 0.75
    const s = Math.min(scale, Math.sqrt(MAX_PIXELS / (pw * ph)), 4 / 3) // never upscale past the photo itself
    c.width = Math.max(1, Math.round(pw * s)); c.height = Math.max(1, Math.round(ph * s))
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height)
    ctx.translate(c.width / 2, c.height / 2)
    ctx.rotate((item.rot * Math.PI) / 180)
    const dw = side ? c.height : c.width, dh = side ? c.width : c.height
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    c.points = [pw, ph]
  }
  if (withOverlays) {
    for (const o of item.overlays || []) {
      const im = await cachedImg(o.url)
      ctx.drawImage(im, o.fx * c.width, o.fy * c.height, o.fw * c.width, o.fh * c.height)
    }
  }
  return c
}

// ── writing ──
// Where an image goes on a new page: A4 (turned to match the picture) with a small margin, or the picture's own size.
function imagePage(out, pw, ph, fit) {
  if (fit === 'image') return { page: out.addPage([pw, ph]), x: 0, y: 0, w: pw, h: ph }
  const [W, H] = pw > ph ? [A4[1], A4[0]] : A4
  const m = 24, k = Math.min((W - 2 * m) / pw, (H - 2 * m) / ph)
  const w = pw * k, h = ph * k
  return { page: out.addPage([W, H]), x: (W - w) / 2, y: (H - h) / 2, w, h }
}

async function embedCanvas(out, canvas, jpegQuality, png) {
  const blob = await toBlob(canvas, png ? 'image/png' : 'image/jpeg', jpegQuality)
  const bytes = await blobBytes(blob)
  return png ? out.embedPng(bytes) : out.embedJpg(bytes)
}

// items: pages in order. opts: { compress: 'light'|'normal'|'strong'|null, fit: 'a4'|'image', onProgress(i, n) }
export async function buildPdf(items, sources, opts = {}) {
  const out = await PDFDocument.create()
  out.setProducer('ugabuga.co.il'); out.setCreator('ugabuga.co.il')
  const level = opts.compress ? COMPRESS[opts.compress] : null
  const n = items.length

  // copy all vector pages of each source in one go, so shared fonts/images are copied once
  const copied = new Map()
  if (!level) {
    const bySrc = new Map()
    for (const it of items) {
      const src = sources.get(it.src)
      if (src.kind !== 'pdf' || !(await libDoc(src))) continue
      if (!bySrc.has(src)) bySrc.set(src, [])
      bySrc.get(src).push(it)
    }
    for (const [src, list] of bySrc) {
      const pages = await out.copyPages(src.lib, list.map(it => it.index))
      list.forEach((it, i) => copied.set(it, pages[i]))
    }
  }

  const overlayImgs = new Map()
  for (let i = 0; i < n; i++) {
    const it = items[i], src = sources.get(it.src)
    opts.onProgress?.(i, n)
    if (copied.has(it)) {
      const page = out.addPage(copied.get(it))
      const R = (((page.getRotation().angle + it.rot) % 360) + 360) % 360
      page.setRotation(degrees(R))
      const crop = page.getCropBox()
      for (const o of it.overlays || []) {
        if (!overlayImgs.has(o.url)) overlayImgs.set(o.url, await out.embedPng(o.url))
        const p = placeOnPage(o, crop, R)
        page.drawImage(overlayImgs.get(o.url), { x: p.x, y: p.y, width: p.width, height: p.height, rotate: degrees(p.rotate) })
      }
    } else if (src.kind === 'image' && !level && !it.rot && !(it.overlays || []).length) {
      const img = src.mime === 'image/png' ? await out.embedPng(src.bytes) : await out.embedJpg(src.bytes)
      const spot = imagePage(out, src.w * 0.75, src.h * 0.75, opts.fit)
      spot.page.drawImage(img, { x: spot.x, y: spot.y, width: spot.w, height: spot.h })
    } else {
      // drawn as a picture: compression, locked PDFs, or rotated/signed photos
      const dpi = level ? level.dpi : 150
      // photos: aim for that dpi on an A4 sheet (long side 11.7"), not the camera's full resolution
      const scale = level && src.kind === 'image' ? (dpi * 11.7) / (0.75 * Math.max(src.w, src.h)) : dpi / 72
      const canvas = await renderShown(it, src, scale)
      const png = !level && src.kind === 'image' && src.mime === 'image/png'
      const img = await embedCanvas(out, canvas, level ? level.quality : 0.88, png)
      const [pw, ph] = canvas.points
      if (src.kind === 'image') {
        const spot = imagePage(out, pw, ph, opts.fit)
        spot.page.drawImage(img, { x: spot.x, y: spot.y, width: spot.w, height: spot.h })
      } else {
        const page = out.addPage([pw, ph])
        page.drawImage(img, { x: 0, y: 0, width: pw, height: ph })
      }
      canvas.width = canvas.height = 0
    }
    if (i % 4 === 3) await tick()
  }
  opts.onProgress?.(n, n)
  return out.save({ useObjectStreams: true })
}

// Each page → JPG/PNG, as { data, w, h }. scale 2 ≈ 144 dpi: sharp on screens and fine for printing.
export async function pagesToImages(items, sources, fmt, onProgress, scale = 2) {
  const files = []
  for (let i = 0; i < items.length; i++) {
    onProgress?.(i, items.length)
    const it = items[i]
    const canvas = await renderShown(it, sources.get(it.src), scale)
    const blob = await toBlob(canvas, fmt === 'png' ? 'image/png' : 'image/jpeg', 0.9)
    files.push({ data: await blobBytes(blob), w: canvas.width, h: canvas.height })
    canvas.width = canvas.height = 0
    await tick()
  }
  onProgress?.(items.length, items.length)
  return files
}

// All the text of the PDF pages (scanned pages have none). Lines kept, pages separated by a blank line.
export async function extractText(items, sources, onProgress) {
  const pages = []
  for (let i = 0; i < items.length; i++) {
    onProgress?.(i, items.length)
    const it = items[i], src = sources.get(it.src)
    if (src.kind !== 'pdf') continue
    const page = await src.pdf.getPage(it.index + 1)
    const tc = await page.getTextContent()
    let s = ''
    for (const t of tc.items) {
      if (typeof t.str !== 'string') continue
      s += t.str
      if (t.hasEOL) s += '\n'
    }
    pages.push(s.replace(/[ \t]+\n/g, '\n').trim())
    page.cleanup()
  }
  onProgress?.(items.length, items.length)
  return pages.filter(Boolean).join('\n\n')
}

// Positioned text of each page, in shown-page coordinates (x right, y down, y = baseline), for PDF→Word.
// Only horizontal text; image pages give an empty list.
export async function extractLayout(items, sources, onProgress) {
  const pages = []
  for (let i = 0; i < items.length; i++) {
    onProgress?.(i, items.length)
    const it = items[i], src = sources.get(it.src)
    if (src.kind !== 'pdf') { pages.push([]); continue }
    const page = await src.pdf.getPage(it.index + 1)
    const vp = page.getViewport({ scale: 1, rotation: (page.rotate + it.rot) % 360 })
    const tc = await page.getTextContent()
    const out = []
    for (const t of tc.items) {
      if (typeof t.str !== 'string' || !t.str.trim()) continue
      const m = pdfjs.Util.transform(vp.transform, t.transform)
      if (Math.abs(m[1]) > Math.abs(m[0]) * 0.05 || m[0] <= 0) continue // rotated or vertical text
      out.push({ str: t.str, x: m[4], y: m[5], w: t.width, size: Math.hypot(m[2], m[3]) })
    }
    pages.push(out)
    page.cleanup()
  }
  onProgress?.(items.length, items.length)
  return pages
}

export function closeSource(src) {
  try { src.pdf?.destroy() } catch { /* already closed */ }
  if (src.url) URL.revokeObjectURL(src.url)
}
