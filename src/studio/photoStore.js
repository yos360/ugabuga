// Photos of the studio: kept in this browser only (memory + IndexedDB), never uploaded.
// Each photo: { id, name, blob, w, h, date, sharp, hash } + a decoded preview (≤ PREVIEW px) for the editor.
import { decodeImage, freeImage, heicToJpeg, newCanvas } from '../office/image/imageIO'
import { isHeic } from '../office/image/imageLogic'

const PREVIEW = 1600
const meta = new Map() // id → photo record
const previews = new Map() // id → Promise<drawable>
const filtered = new Map() // id|filter → canvas
let seq = 0
const newId = () => `p${Date.now().toString(36)}${(seq++).toString(36)}`

// ---------- IndexedDB (autosave) ----------
let dbp = null
function db() {
  if (dbp) return dbp
  dbp = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('no idb'))
    const r = indexedDB.open('buga-studio', 1)
    r.onupgradeneeded = () => { r.result.createObjectStore('photos', { keyPath: 'id' }); r.result.createObjectStore('docs') }
    r.onsuccess = () => resolve(r.result)
    r.onerror = () => reject(r.error)
  })
  return dbp
}
const tx = async (store, mode, fn) => {
  const d = await db()
  return new Promise((resolve, reject) => {
    const t = d.transaction(store, mode), s = t.objectStore(store)
    const out = fn(s)
    t.oncomplete = () => resolve(out?.result ?? out)
    t.onerror = () => reject(t.error)
  })
}
export const saveDoc = (key, doc) => tx('docs', 'readwrite', s => s.put({ doc, at: Date.now() }, key)).catch(() => {})
export const loadDoc = key => tx('docs', 'readonly', s => s.get(key)).catch(() => null)
export async function forget(key, keepIds = []) {
  await tx('docs', 'readwrite', s => s.delete(key)).catch(() => {})
  const keep = new Set(keepIds)
  for (const id of [...meta.keys()]) if (!keep.has(id)) drop(id)
}
const persistPhoto = p => tx('photos', 'readwrite', s => s.put({ id: p.id, name: p.name, blob: p.blob, w: p.w, h: p.h, date: p.date, taken: p.taken, sharp: p.sharp, hash: p.hash })).catch(() => {})
export async function restorePhotos(ids) {
  const out = []
  for (const id of ids) {
    if (meta.has(id)) { out.push(meta.get(id)); continue }
    const rec = await tx('photos', 'readonly', s => s.get(id)).catch(() => null)
    if (rec) { rec.thumb = URL.createObjectURL(rec.blob); meta.set(id, rec); out.push(rec) }
  }
  return out
}
function drop(id) {
  const p = meta.get(id)
  if (p?.thumb) URL.revokeObjectURL(p.thumb)
  meta.delete(id)
  previews.get(id)?.then(freeImage)
  previews.delete(id)
  for (const k of [...filtered.keys()]) if (k.startsWith(id + '|')) filtered.delete(k)
  tx('photos', 'readwrite', s => s.delete(id)).catch(() => {})
}
export const removePhoto = drop

// ---------- adding photos ----------
async function exifDate(blob) {
  try {
    const { default: exifr } = await import('exifr/dist/lite.esm.mjs')
    const e = await exifr.parse(blob, ['DateTimeOriginal', 'CreateDate'])
    const d = e?.DateTimeOriginal || e?.CreateDate
    return d instanceof Date && !isNaN(d) ? d.getTime() : null
  } catch { return null }
}
// Sharpness (variance of the Laplacian) and a 64-bit average hash, both on a small grey copy.
function analyse(img) {
  const side = 256, s = side / Math.max(img.width, img.height)
  const w = Math.max(8, Math.round(img.width * s)), h = Math.max(8, Math.round(img.height * s))
  const c = newCanvas(w, h), ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, w, h)
  const px = ctx.getImageData(0, 0, w, h).data, g = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) g[i] = px[i * 4] * 0.299 + px[i * 4 + 1] * 0.587 + px[i * 4 + 2] * 0.114
  let sum = 0, sum2 = 0, n = 0
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x, l = g[i - 1] + g[i + 1] + g[i - w] + g[i + w] - 4 * g[i]
    sum += l; sum2 += l * l; n++
  }
  const sharp = n ? sum2 / n - (sum / n) ** 2 : 0
  const h8 = newCanvas(8, 8), c8 = h8.getContext('2d', { willReadFrequently: true })
  c8.drawImage(img, 0, 0, 8, 8)
  const d8 = c8.getImageData(0, 0, 8, 8).data, v = []
  for (let i = 0; i < 64; i++) v.push(d8[i * 4] + d8[i * 4 + 1] + d8[i * 4 + 2])
  const mean = v.reduce((a, b) => a + b, 0) / 64
  const hash = v.map(x => (x > mean ? '1' : '0')).join('')
  freeImage(c); freeImage(h8)
  return { sharp, hash }
}
export async function addFiles(files, onProgress) {
  const out = []
  let i = 0
  for (const file of files) {
    i++
    try {
      let blob = file
      if (isHeic(file)) blob = (await heicToJpeg(file)) || file
      const img = await decodeImage(blob, PREVIEW)
      const { sharp, hash } = analyse(img)
      const full = await createImageBitmap(blob).catch(() => null)
      const w = full ? full.width : img.width, h = full ? full.height : img.height
      freeImage(full)
      const taken = await exifDate(blob)
      const p = { id: newId(), name: file.name || 'photo', blob, w, h, date: taken ?? file.lastModified ?? Date.now(), taken: taken != null, sharp, hash, thumb: URL.createObjectURL(blob) }
      meta.set(p.id, p)
      previews.set(p.id, Promise.resolve(img))
      persistPhoto(p)
      out.push(p)
    } catch { /* not an image we can read: skip */ }
    onProgress?.(i, files.length)
  }
  return out
}
export const getPhoto = id => meta.get(id)
export function preview(id) {
  if (!previews.has(id)) {
    const p = meta.get(id)
    if (!p) return Promise.resolve(null)
    previews.set(id, decodeImage(p.blob, PREVIEW).catch(() => null))
  }
  return previews.get(id)
}
// Full-quality decode for print, no larger than needed.
export async function full(id, maxSide) {
  const p = meta.get(id)
  return p ? decodeImage(p.blob, Math.min(8192, Math.max(256, Math.round(maxSide)))) : null
}

// Black & white / sepia applied to pixels (Safari has no canvas filter). Cached for previews.
export function applyTone(img, tone, cache = true, key = '') {
  if (!tone || tone === 'none') return img
  const k = key && `${key}|${tone}|${img.width}`
  if (cache && k && filtered.has(k)) return filtered.get(k)
  const c = newCanvas(img.width, img.height), ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0)
  const id = ctx.getImageData(0, 0, c.width, c.height), d = id.data
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2]
    if (tone === 'bw') { const y = r * 0.299 + g * 0.587 + b * 0.114; d[i] = d[i + 1] = d[i + 2] = y }
    else if (tone === 'sepia') { d[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189); d[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168); d[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131) }
    else if (tone === 'warm') { d[i] = Math.min(255, r * 1.08 + 6); d[i + 2] = b * 0.9 }
    else if (tone === 'cool') { d[i] = r * 0.92; d[i + 2] = Math.min(255, b * 1.08 + 6) }
  }
  ctx.putImageData(id, 0, 0)
  if (cache && k) filtered.set(k, c)
  return c
}

// Hamming distance of two hashes: ≤ 6 means "almost the same picture".
export const hashDistance = (a, b) => { let d = 0; for (let i = 0; i < 64; i++) if (a[i] !== b[i]) d++; return d }
// Photos to use automatically: sorted by date, near-duplicates collapsed to the sharpest, blurry last.
// order: 'date' (when the photo was taken — oldest first) or 'upload' (the order the user added them;
// for scanned old photos, whose date is the scan date).
export function pickForAuto(photos, order = 'date') {
  const sorted = order === 'upload' ? [...photos] : [...photos].sort((a, b) => a.date - b.date)
  const kept = []
  for (const p of sorted) {
    // only real camera times count: saved/downloaded pictures all share the upload time and must never be dropped
    const twin = !p.taken ? -1 : kept.findIndex(k => k.taken && Math.abs(k.date - p.date) < 120000 && hashDistance(k.hash, p.hash) <= 6)
    if (twin >= 0) { if (p.sharp > kept[twin].sharp) kept[twin] = p } else kept.push(p)
  }
  const median = [...kept].map(p => p.sharp).sort((a, b) => a - b)[Math.floor(kept.length / 2)] || 0
  return { kept, blurry: kept.filter(p => p.sharp < median * 0.15), dupes: photos.length - kept.length }
}
