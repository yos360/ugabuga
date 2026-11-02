// Browser-only helpers: decode (EXIF orientation respected), canvases, encode, download, share.
// Nothing here talks to the network: every photo stays on the device.
import { safeSize, FORMATS, extForMime, makeZip } from './imageLogic'

export function newCanvas(w, h) {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h))
  return c
}
// Let the browser drop a canvas's pixels right away (matters on phones).
export function freeImage(img) {
  if (!img) return
  if (typeof img.close === 'function') { try { img.close() } catch { /* already closed */ } }
  else if (img instanceof HTMLCanvasElement) { img.width = 0; img.height = 0 }
}

async function decodeRaw(blob) {
  if (typeof createImageBitmap === 'function') {
    try { return await createImageBitmap(blob, { imageOrientation: 'from-image' }) }
    catch { /* old Safari ignores options or can't decode → try <img> */ }
  }
  const url = URL.createObjectURL(blob)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()
    return img
  } finally { URL.revokeObjectURL(url) }
}

// Decode a photo, scaled down so its longest side ≤ maxSide (and the area canvas-safe).
// Returns a drawable with width/height (ImageBitmap or canvas); free it with freeImage().
export async function decodeImage(blob, maxSide = 4096) {
  const raw = await decodeRaw(blob)
  const w = raw.naturalWidth || raw.width, h = raw.naturalHeight || raw.height
  if (!w || !h) throw new Error('decode')
  const size = safeSize(w, h, maxSide)
  if (size.scale >= 1 && raw instanceof ImageBitmap) return raw
  const c = newCanvas(size.width, size.height)
  const ctx = c.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(raw, 0, 0, size.width, size.height)
  freeImage(raw)
  return c
}

// One decode on add: real size + a small thumbnail; the full pixels are dropped right away.
export async function readPhoto(blob) {
  const raw = await decodeRaw(blob)
  try {
    const width = raw.naturalWidth || raw.width, height = raw.naturalHeight || raw.height
    if (!width || !height) throw new Error('decode')
    return { width, height, thumb: await thumbOf(raw, width, height) }
  } finally { freeImage(raw) }
}

// A blob: URL, not a data: URL — a blob URL means nothing outside this tab (e.g. to the site's session recorder).
async function thumbOf(img, w, h, side = 180) {
  const s = Math.min(1, side / Math.max(w, h))
  const c = newCanvas(w * s, h * s)
  const ctx = c.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, c.width, c.height)
  try { return URL.createObjectURL(await canvasToBlob(c, 'image/jpeg', 0.75)) }
  finally { freeImage(c) }
}

// HEIC (iPhone): Safari decodes it natively; everywhere else heic2any is fetched only now, on first HEIC.
export async function heicToJpeg(file) {
  try {
    const probe = await createImageBitmap(file)
    probe.close()
    return null // the browser can read it as is
  } catch { /* not natively supported */ }
  const { default: heic2any } = await import('heic2any')
  const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
  return Array.isArray(out) ? out[0] : out
}

export function canvasToBlob(canvas, mime = 'image/jpeg', quality = 0.9) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('encode')), mime, FORMATS[extForMime(mime)]?.lossy ? quality : undefined)
  })
}
// Encode in the chosen format; JPG has no transparency, so it gets a white background first.
export async function encodeCanvas(canvas, fmt = 'jpg', quality = 0.9) {
  let src = canvas
  if (fmt === 'jpg') {
    src = newCanvas(canvas.width, canvas.height)
    const ctx = src.getContext('2d')
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, src.width, src.height)
    ctx.drawImage(canvas, 0, 0)
  }
  try {
    const blob = await canvasToBlob(src, FORMATS[fmt].mime, quality)
    return { blob, size: blob.size, ext: extForMime(blob.type) } // Safari without WebP falls back to PNG
  } finally { if (src !== canvas) freeImage(src) }
}

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name; a.rel = 'noopener'
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30000)
}
export async function downloadZip(entries, zipName) {
  const files = []
  for (const e of entries) files.push({ name: e.name, data: new Uint8Array(await e.blob.arrayBuffer()) })
  downloadBlob(new Blob([makeZip(files, new Date())], { type: 'application/zip' }), zipName)
}

// Phones: "save to gallery / send in WhatsApp" through the share sheet.
export function canShareFiles() {
  try { return typeof navigator !== 'undefined' && !!navigator.canShare && navigator.canShare({ files: [new File([''], 'a.jpg', { type: 'image/jpeg' })] }) }
  catch { return false }
}
export async function shareBlob(blob, name) {
  const file = new File([blob], name, { type: blob.type })
  try { await navigator.share({ files: [file] }) } catch { /* cancelled */ }
}
