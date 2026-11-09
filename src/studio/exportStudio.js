// Print export: each page rendered at print resolution with full-quality photos, then JPG / PNG,
// a ZIP of JPGs (what Israeli album labs ask for) or one PDF. Everything happens in the browser.
import { renderPage } from './render'
import { full } from './photoStore'
import { styleById } from './styles'
import { newCanvas, freeImage, canvasToBlob, downloadBlob } from '../office/image/imageIO'
import { makeZip } from '../office/image/imageLogic'

const isIOS = () => typeof navigator !== 'undefined' && (/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
// Largest canvas we dare to make: iPhone/iPad Safari historically fails above 16.7 MP.
export const maxArea = () => (isIOS() ? 16_000_000 : 48_000_000)

export function printDpi(size, bleed, wanted = 300) {
  const wIn = (size.w + 2 * bleed) / 25.4, hIn = (size.h + 2 * bleed) / 25.4
  return Math.min(wanted, Math.floor(Math.sqrt(maxArea() / (wIn * hIn))))
}

// Photo ids on a page and the largest size (px) each one is shown at, so it is decoded no bigger.
function needed(page, k) {
  const out = new Map()
  const add = (id, px) => id && out.set(id, Math.max(out.get(id) || 0, px))
  for (const it of page.items) {
    if (it.type === 'photo') add(it.photo, Math.max(it.w, it.h) * k * (it.zoom || 1) * 1.05)
    if (it.type === 'text') add(it.photoFill, Math.max(it.w, it.h) * k * (it.zoom || 1))
    if (it.type === 'mosaic') { const cell = Math.sqrt((it.w * it.h) / Math.max(1, it.count || 40)) * k * 1.3; for (const id of it.photos || []) add(id, cell) }
  }
  return out
}

export async function renderForPrint(doc, page, { dpi = 300, bleed = doc.bleed || 0, transparent = doc.transparent } = {}) {
  const k = dpi / 25.4, o = Math.round(bleed * k)
  const W = Math.round(doc.size.w * k) + 2 * o, H = Math.round(doc.size.h * k) + 2 * o
  const images = new Map()
  for (const [id, px] of needed(page, k)) { const img = await full(id, px); if (img) images.set(id, img) }
  const c = newCanvas(W, H), ctx = c.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  renderPage(ctx, page, doc.size, { k, offset: o, images, style: styleById(doc.styleId), print: true, transparent })
  for (const img of images.values()) freeImage(img)
  return c
}

const name = i => String(i + 1).padStart(3, '0')
export async function exportZip(doc, onStep) {
  const dpi = printDpi(doc.size, doc.bleed)
  const files = []
  for (let i = 0; i < doc.pages.length; i++) {
    onStep?.(i + 1, doc.pages.length)
    const c = await renderForPrint(doc, doc.pages[i], { dpi })
    const blob = await canvasToBlob(c, 'image/jpeg', 0.93)
    freeImage(c)
    files.push({ name: `${name(i)}.jpg`, data: new Uint8Array(await blob.arrayBuffer()) })
  }
  downloadBlob(new Blob([makeZip(files, new Date())], { type: 'application/zip' }), 'album-for-print.zip')
  return dpi
}
export async function exportPdf(doc, onStep, fileName = 'album-for-print.pdf') {
  const { PDFDocument } = await import('pdf-lib')
  const pdf = await PDFDocument.create()
  const dpi = printDpi(doc.size, doc.bleed)
  const pt = mm => (mm * 72) / 25.4
  for (let i = 0; i < doc.pages.length; i++) {
    onStep?.(i + 1, doc.pages.length)
    const c = await renderForPrint(doc, doc.pages[i], { dpi })
    const blob = await canvasToBlob(c, 'image/jpeg', 0.93)
    freeImage(c)
    const jpg = await pdf.embedJpg(new Uint8Array(await blob.arrayBuffer()))
    const w = pt(doc.size.w + 2 * doc.bleed), h = pt(doc.size.h + 2 * doc.bleed)
    const p = pdf.addPage([w, h])
    p.drawImage(jpg, { x: 0, y: 0, width: w, height: h })
    if (doc.bleed) { p.setTrimBox(pt(doc.bleed), pt(doc.bleed), pt(doc.size.w), pt(doc.size.h)); p.setBleedBox(0, 0, w, h) }
  }
  pdf.setTitle('Album — ugabuga.co.il'); pdf.setCreator('ugabuga.co.il')
  downloadBlob(new Blob([await pdf.save()], { type: 'application/pdf' }), fileName)
  return dpi
}
// Collage: one image. PNG keeps transparency (photo-in-text), JPG is smaller.
export async function exportImage(doc, fmt, dpiWanted = 300) {
  const dpi = printDpi(doc.size, 0, dpiWanted)
  const c = await renderForPrint(doc, doc.pages[0], { dpi, bleed: 0 })
  const blob = await canvasToBlob(c, fmt === 'png' ? 'image/png' : 'image/jpeg', 0.93)
  freeImage(c)
  return { blob, dpi }
}
