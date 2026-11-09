// One renderer for the editor and for print: draws a page of the studio document onto a 2D canvas.
// Units on the page are millimetres; `k` = pixels per millimetre. What you see is what gets printed.
import { coverRect, mosaicCells } from './geometry'
import { DECOR, decorColor } from './styles'
import { applyTone } from './photoStore'
import { newCanvas } from '../office/image/imageIO'

const HEB = /[֐-׿]/
const rad = d => (d * Math.PI) / 180
const paths = new Map()
const pathOf = kind => { if (!paths.has(kind)) paths.set(kind, new Path2D(DECOR[kind]?.d || DECOR.star.d)); return paths.get(kind) }

function rrect(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2))
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r)
  else { ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath() }
}

// draw `img` to fill a w×h box at (0,0) with zoom / pan (ox, oy in −1…1)
function drawCover(ctx, img, w, h, zoom = 1, ox = 0, oy = 0) {
  const r = coverRect(img.width, img.height, w, h, zoom, ox, oy)
  ctx.drawImage(img, r.x, r.y, r.w, r.h)
}

function drawPhoto(ctx, it, k, env) {
  const w = it.w * k, h = it.h * k, b = (it.border || 0) * k, rr = (it.radius || 0) * k
  if (it.shadow) {
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.28)'; ctx.shadowBlur = 3 * k; ctx.shadowOffsetY = 1.2 * k
    rrect(ctx, 0, 0, w, h, rr); ctx.fillStyle = it.borderColor || '#fff'; ctx.fill(); ctx.restore()
  }
  if (b > 0) { rrect(ctx, 0, 0, w, h, rr); ctx.fillStyle = it.borderColor || '#fff'; ctx.fill() }
  const iw = w - 2 * b, ih = h - 2 * b
  ctx.save()
  ctx.translate(b, b)
  rrect(ctx, 0, 0, iw, ih, Math.max(0, rr - b))
  ctx.clip()
  let img = it.photo ? env.images.get(it.photo) : null
  if (img) {
    img = applyTone(img, it.tone, !env.print, it.photo)
    drawCover(ctx, img, iw, ih, it.zoom, it.ox, it.oy)
    if (it.vignette > 0) {
      const g = ctx.createRadialGradient(iw / 2, ih / 2, Math.min(iw, ih) * 0.25, iw / 2, ih / 2, Math.hypot(iw, ih) / 2)
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${0.75 * it.vignette})`)
      ctx.fillStyle = g; ctx.fillRect(0, 0, iw, ih)
    }
  } else if (!env.print) {
    ctx.fillStyle = '#e3e6ee'; ctx.fillRect(0, 0, iw, ih)
    ctx.fillStyle = '#9aa1b5'; ctx.font = `700 ${Math.min(iw, ih) * 0.3}px Heebo, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('+', iw / 2, ih / 2)
  }
  ctx.restore()
}

function fontStr(it, px) { return `${it.weight || 700} ${px}px "${it.font || 'Heebo'}", "Heebo", "Noto Color Emoji", sans-serif` }
export function textLines(it) { return String(it.text || '').split('\n') }

function drawText(ctx, it, k, env) {
  const w = it.w * k, h = it.h * k, px = it.size * k, lh = px * (it.lineHeight || 1.15)
  const lines = textLines(it)
  const draw = (c, color) => {
    c.font = fontStr(it, px); c.textBaseline = 'middle'
    c.textAlign = it.align === 'right' ? 'right' : it.align === 'left' ? 'left' : 'center'
    const x = it.align === 'right' ? w : it.align === 'left' ? 0 : w / 2
    const y0 = h / 2 - (lh * (lines.length - 1)) / 2
    lines.forEach((ln, i) => {
      c.direction = HEB.test(ln) ? 'rtl' : 'ltr' // 'left' / 'right' alignment stays absolute in canvas
      if (it.stroke && !it.photoFill) { c.lineJoin = 'round'; c.lineWidth = it.stroke * k; c.strokeStyle = it.strokeColor || '#fff'; c.strokeText(ln, x, y0 + i * lh) }
      c.fillStyle = color; c.fillText(ln, x, y0 + i * lh)
    })
  }
  const img = it.photoFill ? env.images.get(it.photoFill) : null
  if (!img) {
    if (it.shadow) { ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 1.5 * k; ctx.shadowOffsetY = 0.6 * k }
    draw(ctx, it.color || '#222')
    return
  }
  // photo inside the letters: text as a mask, then the photo drawn "source-in"
  const off = newCanvas(Math.max(1, w), Math.max(1, h)), oc = off.getContext('2d')
  draw(oc, '#000')
  oc.globalCompositeOperation = 'source-in'
  drawCover(oc, applyTone(img, it.tone, !env.print, it.photoFill), off.width, off.height, it.zoom, it.ox, it.oy)
  if (it.stroke) {
    oc.globalCompositeOperation = 'destination-over'
    oc.lineJoin = 'round'; oc.lineWidth = it.stroke * k * 2; oc.strokeStyle = it.strokeColor || '#fff'
    oc.font = fontStr(it, px); oc.textBaseline = 'middle'; oc.textAlign = 'center'
    lines.forEach((ln, i) => { oc.direction = HEB.test(ln) ? 'rtl' : 'ltr'; oc.strokeText(ln, w / 2, h / 2 - (lh * (lines.length - 1)) / 2 + i * lh) })
  }
  ctx.drawImage(off, 0, 0)
  off.width = off.height = 0
}

function drawDecor(ctx, it, k, env) {
  const d = DECOR[it.kind] || DECOR.star, w = it.w * k, h = it.h * k
  ctx.scale(w / 100, h / 100)
  const color = it.color || decorColor(env.style, 'primary')
  if (d.mode === 'stroke') { ctx.lineWidth = d.lw || 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color; ctx.stroke(pathOf(it.kind)) }
  else { ctx.fillStyle = color; ctx.fill(pathOf(it.kind), 'evenodd') }
}

// ---------- photo mosaic in a shape ----------
const maskCache = new Map()
export function mosaicLayout(it) {
  const count = Math.max(4, it.count || 40)
  const ratio = it.w / it.h
  const key = [it.shape, it.text, it.font, ratio.toFixed(3), count, it.fill || 0.5].join('|')
  if (maskCache.has(key)) return maskCache.get(key)
  const M = 360, mw = Math.round(ratio >= 1 ? M : M * ratio), mh = Math.round(ratio >= 1 ? M / ratio : M)
  const c = newCanvas(mw, mh), ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.fillStyle = '#000'
  if (it.shape === 'text') {
    const txt = String(it.text || '40')
    let px = mh * 1.25
    ctx.font = `900 ${px}px "${it.font || 'Heebo'}", Heebo, sans-serif`
    const tw = ctx.measureText(txt).width
    if (tw > mw * 0.98) px *= (mw * 0.98) / tw
    ctx.font = `900 ${px}px "${it.font || 'Heebo'}", Heebo, sans-serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = HEB.test(txt) ? 'rtl' : 'ltr'
    ctx.fillText(txt, mw / 2, mh / 2 + px * 0.04)
  } else if (it.shape === 'circle') {
    ctx.beginPath(); ctx.ellipse(mw / 2, mh / 2, mw / 2, mh / 2, 0, 0, Math.PI * 2); ctx.fill()
  } else {
    ctx.scale(mw / 100, mh / 100); ctx.fill(pathOf(it.shape === 'star' ? 'star' : 'heart'))
  }
  const data = ctx.getImageData(0, 0, mw, mh).data, mask = new Uint8Array(mw * mh)
  for (let i = 0; i < mask.length; i++) mask[i] = data[i * 4 + 3]
  const cells = mosaicCells(mask, mw, mh, count, it.fill || 0.5)
  // centre the block of cells inside the box
  let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0
  for (const q of cells) { minX = Math.min(minX, q.x); minY = Math.min(minY, q.y); maxX = Math.max(maxX, q.x + q.w); maxY = Math.max(maxY, q.y + q.h) }
  const dx = (mw - (maxX - minX)) / 2 - minX, dy = (mh - (maxY - minY)) / 2 - minY
  // reading order in Hebrew: rows top to bottom, each row from right to left (first photo top-right)
  const out = cells.map(q => ({ x: (q.x + dx) / mw, y: (q.y + dy) / mh, w: q.w / mw, h: q.h / mh }))
    .sort((a, b) => (Math.abs(a.y - b.y) > 1e-6 ? a.y - b.y : b.x - a.x))
  c.width = c.height = 0
  if (maskCache.size > 40) maskCache.clear()
  maskCache.set(key, out)
  return out
}
function drawMosaic(ctx, it, k, env) {
  const w = it.w * k, h = it.h * k, gap = (it.gap ?? 1) * k, cells = mosaicLayout(it)
  const ids = it.photos || []
  cells.forEach((q, i) => {
    const x = q.x * w + gap / 2, y = q.y * h + gap / 2, cw = q.w * w - gap, ch = q.h * h - gap
    if (cw <= 0 || ch <= 0) return
    ctx.save()
    rrect(ctx, x, y, cw, ch, ((it.radius || 0) / 100) * cw)
    ctx.clip()
    const img = ids.length ? env.images.get(ids[i % ids.length]) : null
    if (img) { ctx.translate(x, y); drawCover(ctx, applyTone(img, it.tone, !env.print, ids[i % ids.length]), cw, ch) }
    else if (!env.print) { ctx.fillStyle = i % 2 ? '#d7dbe6' : '#e6e9f1'; ctx.fillRect(x, y, cw, ch) }
    ctx.restore()
  })
}

const DRAW = { photo: drawPhoto, text: drawText, decor: drawDecor, mosaic: drawMosaic }

// Draw one item at its place (rotation around its centre).
export function drawItem(ctx, it, k, env) {
  ctx.save()
  ctx.globalAlpha = it.opacity ?? 1
  ctx.translate((it.x + it.w / 2) * k, (it.y + it.h / 2) * k)
  if (it.rot) ctx.rotate(rad(it.rot))
  ctx.translate((-it.w / 2) * k, (-it.h / 2) * k)
  ;(DRAW[it.type] || (() => {}))(ctx, it, k, env)
  ctx.restore()
}

// The whole page. `env`: { style, images: Map, print, k, offset (bleed px), transparent }.
export function renderPage(ctx, page, size, env) {
  const { k } = env, o = env.offset || 0
  ctx.save()
  if (!env.transparent) { ctx.fillStyle = page.bg || env.style.bg; ctx.fillRect(0, 0, size.w * k + 2 * o, size.h * k + 2 * o) }
  ctx.translate(o, o)
  for (const it of page.items) if (!it.hidden) drawItem(ctx, it, k, env)
  ctx.restore()
}
