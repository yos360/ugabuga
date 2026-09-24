// Turns a word into a single centre line (its "skeleton") so tracing sheets show
// ONE dashed line per stroke — not the doubled outline a font gives, and none of
// the overlapping inner contours Hebrew glyphs are built from.
// Render the text on a canvas → thin it (Zhang–Suen) → walk the pixels into chains.

export const SK_SIZE = 200
const cache = new Map()

function thin(img, w, h) {
  const idx = (x, y) => y * w + x
  let changed = true
  const del = []
  const nb = (x, y) => {
    const p = [img[idx(x, y - 1)], img[idx(x + 1, y - 1)], img[idx(x + 1, y)], img[idx(x + 1, y + 1)],
      img[idx(x, y + 1)], img[idx(x - 1, y + 1)], img[idx(x - 1, y)], img[idx(x - 1, y - 1)]]
    return p
  }
  while (changed) {
    changed = false
    for (let pass = 0; pass < 2; pass++) {
      del.length = 0
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        if (!img[idx(x, y)]) continue
        const p = nb(x, y)
        let b = 0; for (const v of p) b += v
        if (b < 2 || b > 6) continue
        let a = 0; for (let i = 0; i < 8; i++) if (!p[i] && p[(i + 1) % 8]) a++
        if (a !== 1) continue
        if (pass === 0 ? (p[0] * p[2] * p[4] || p[2] * p[4] * p[6]) : (p[0] * p[2] * p[6] || p[0] * p[4] * p[6])) continue
        del.push(idx(x, y))
      }
      if (del.length) { changed = true; for (const i of del) img[i] = 0 }
    }
  }
}

function trace(img, w, h) {
  const OFF = [[0, -1], [1, 0], [0, 1], [-1, 0], [1, -1], [1, 1], [-1, 1], [-1, -1]] // 4-neighbours first
  const RING = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]]
  const on = (x, y) => x >= 0 && y >= 0 && x < w && y < h && img[y * w + x]
  const branches = (x, y) => { let c = 0; for (let i = 0; i < 8; i++) { const [ax, ay] = RING[i], [bx, by] = RING[(i + 1) % 8]; if (!on(x + ax, y + ay) && on(x + bx, y + by)) c++ } return c }
  const kind = new Int8Array(w * h) // 1 end, 2 line, 3 junction
  const pts = []
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (img[y * w + x]) { const b = branches(x, y); kind[y * w + x] = b <= 1 ? 1 : b === 2 ? 2 : 3; pts.push(y * w + x) }
  const seen = new Uint8Array(w * h), chains = []
  const walk = start => {
    const sx = start % w, sy = (start / w) | 0
    for (const [dx, dy] of OFF) {
      let x = sx + dx, y = sy + dy
      if (!on(x, y) || seen[y * w + x]) continue
      const chain = [[sx, sy]]; let px = sx, py = sy
      for (;;) {
        chain.push([x, y])
        const k = kind[y * w + x]
        if (k === 3 && chain.length > 2) break
        seen[y * w + x] = 1
        let nx = -1, ny = -1
        for (const [ex, ey] of OFF) { const qx = x + ex, qy = y + ey; if ((qx !== px || qy !== py) && on(qx, qy) && !seen[qy * w + qx] && !(qx === sx && qy === sy && chain.length < 4)) { nx = qx; ny = qy; break } }
        if (nx < 0) break
        px = x; py = y; x = nx; y = ny
      }
      chains.push(chain)
    }
    seen[start] = 1
  }
  for (const i of pts) if (kind[i] === 1 && !seen[i]) walk(i)
  for (const i of pts) if (kind[i] === 3) walk(i)
  for (const i of pts) if (!seen[i]) walk(i) // closed loops (ס, ם…)
  // Drop tiny spurs the thinning leaves at stroke ends and corners.
  return chains.filter(c => c.length > 14 || (kind[c[0][1] * w + c[0][0]] === 3 && kind[c.at(-1)[1] * w + c.at(-1)[0]] === 3 && c.length > 2))
}

const toPath = chains => chains.map(c => {
  const s = c.filter((_, i) => i % 3 === 0 || i === c.length - 1)
  return 'M' + s.map(([x, y]) => `${x} ${y}`).join('L')
}).join('')

export async function skeleton(text, { font = 'Heebo', weight = 400, rtl = true } = {}) {
  const key = `${font}|${weight}|${text}`
  if (cache.has(key)) return cache.get(key)
  const job = (async () => {
    try { await document.fonts?.load(`${weight} ${SK_SIZE}px ${font}`) } catch { /* use fallback font */ }
    const c = document.createElement('canvas'), ctx = c.getContext('2d', { willReadFrequently: true })
    const f = `${weight} ${SK_SIZE}px ${font}, Arial, sans-serif`
    ctx.font = f
    const w = Math.ceil(ctx.measureText(text).width) + 40, h = Math.ceil(SK_SIZE * 1.5), base = Math.round(SK_SIZE * 1.1)
    c.width = w; c.height = h
    ctx.font = f; ctx.direction = rtl ? 'rtl' : 'ltr'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#000'; ctx.fillText(text, w / 2, base)
    const data = ctx.getImageData(0, 0, w, h).data, img = new Uint8Array(w * h)
    for (let i = 0; i < w * h; i++) img[i] = data[i * 4 + 3] > 110 ? 1 : 0
    thin(img, w, h)
    return { d: toPath(trace(img, w, h)), w, base }
  })()
  cache.set(key, job)
  return job
}
