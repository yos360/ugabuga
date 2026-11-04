// Green-screen video -> transparent sprite sheet (webp), using the installed Chrome (no ffmpeg).
// usage: node scripts/anim/sprite-from-video.mjs <video.mp4> <out.webp> [fps=12] [frameHeight=180] [cols=12]
// Used for public/anim/buga-printer.webp (10 fps, 150 high, 10 cols). Show the sheet with src/components/ui/BugaSprite.jsx.
import { chromium } from 'playwright'
import { writeFile, copyFile, mkdir } from 'node:fs/promises'
import { dirname, join, basename, resolve } from 'node:path'

const [video, out, fps = '12', fh = '180', colsArg = '12'] = process.argv.slice(2)
const work = join(dirname(resolve(video)), 'work')
await mkdir(work, { recursive: true })
await copyFile(video, join(work, 'in.mp4'))
await writeFile(join(work, 'index.html'), '<!doctype html><video id=v src="in.mp4" muted playsinline preload=auto></video>')

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage()
// serve the work folder from a made-up http origin, so the canvas is not "tainted"
const { readFile } = await import('node:fs/promises')
await page.route('http://anim.local/**', async route => {
  const f = basename(new URL(route.request().url()).pathname) || 'index.html'
  const body = await readFile(join(work, f))
  await route.fulfill({ body, contentType: f.endsWith('.mp4') ? 'video/mp4' : 'text/html' })
})
await page.goto('http://anim.local/index.html')
const res = await page.evaluate(async ({ FPS, FH, COLS }) => {
  const v = document.getElementById('v')
  await new Promise((ok, bad) => { if (v.readyState >= 2) ok(); v.onloadeddata = ok; v.onerror = () => bad(new Error('video error')) })
  const W = v.videoWidth, H = v.videoHeight, dur = v.duration
  const seek = t => new Promise(ok => { v.onseeked = ok; v.currentTime = t })
  const n = Math.floor(dur * FPS)
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const x = c.getContext('2d', { willReadFrequently: true })
  const frames = []
  let minX = W, minY = H, maxX = 0, maxY = 0
  for (let i = 0; i < n; i++) {
    await seek(Math.min(dur - 0.01, i / FPS + 0.001))
    x.drawImage(v, 0, 0)
    const img = x.getImageData(0, 0, W, H), d = img.data
    for (let p = 0; p < d.length; p += 4) {
      const r = d[p], g = d[p + 1], b = d[p + 2]
      const green = g - Math.max(r, b) // how much greener than the rest
      if (green > 25) {
        const a = Math.max(0, Math.min(1, 1 - (green - 25) / 55))
        d[p + 3] = Math.round(a * 255)
        d[p + 1] = Math.max(r, b) // remove the green spill on soft edges
      }
      if (d[p + 3] > 40) {
        const px = (p / 4) % W, py = Math.floor(p / 4 / W)
        if (px < minX) minX = px; if (px > maxX) maxX = px; if (py < minY) minY = py; if (py > maxY) maxY = py
      }
    }
    frames.push(img)
  }
  // one crop box for all frames (with a little room), then scale to FH high
  const pad = 6
  minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad); maxX = Math.min(W - 1, maxX + pad); maxY = Math.min(H - 1, maxY + pad)
  const cw = maxX - minX + 1, ch = maxY - minY + 1
  const fw = Math.round(cw * FH / ch)
  const rows = Math.ceil(frames.length / COLS)
  const sheet = document.createElement('canvas'); sheet.width = fw * COLS; sheet.height = FH * rows
  const s = sheet.getContext('2d')
  const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H
  const t = tmp.getContext('2d')
  frames.forEach((img, i) => {
    t.putImageData(img, 0, 0)
    s.drawImage(tmp, minX, minY, cw, ch, (i % COLS) * fw, Math.floor(i / COLS) * FH, fw, FH)
  })
  const url = sheet.toDataURL('image/webp', 0.72)
  return { url, frames: frames.length, fw, fh: FH, cols: COLS, rows, W, H, dur }
}, { FPS: Number(fps), FH: Number(fh), COLS: Number(colsArg) })
await browser.close()
await writeFile(out, Buffer.from(res.url.split(',')[1], 'base64'))
delete res.url
console.log(JSON.stringify(res), basename(out))
