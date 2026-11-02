// Blur faces: drag boxes (move / resize them) or paint with a brush; blur or pixelate. Burned into the file.
import { useEffect, useRef, useState } from 'react'
import { useImages } from './imageStore'
import { useWorkImage } from './useWorkImage'
import { newCanvas, freeImage, encodeCanvas } from './imageIO'
import { normRect, hitRect, moveRect, resizeRect, outName, defaultFormat } from './imageLogic'
import { Seg, Range, FormatPick, PhotoPicker, DownloadBar } from './ui'

// The photo (or just region r of it, in photo px), blurred or pixelated, at k × its size.
// Areas are later cut from this layer. Block size follows the whole photo, so preview and file match.
function effectLayer(img, kind, strength, k, r = { x: 0, y: 0, w: img.width, h: img.height }) {
  const block = Math.max(3, Math.round(Math.min(img.width, img.height) * k * (0.006 + strength * 0.004)))
  const W = Math.max(1, Math.round(r.w * k)), H = Math.max(1, Math.round(r.h * k))
  const sw = Math.max(1, Math.round(W / block)), sh = Math.max(1, Math.round(H / block))
  const small = newCanvas(sw, sh)
  const sctx = small.getContext('2d')
  sctx.imageSmoothingQuality = 'high'
  sctx.drawImage(img, r.x, r.y, r.w, r.h, 0, 0, sw, sh)
  const out = newCanvas(W, H)
  const ctx = out.getContext('2d')
  if (kind === 'pixel') {
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(small, 0, 0, W, H)
  } else {
    // two smooth upscales read as a soft blur and work in every browser (no ctx.filter needed)
    const mid = newCanvas(Math.min(W, sw * 4), Math.min(H, sh * 4))
    const mctx = mid.getContext('2d')
    mctx.imageSmoothingQuality = 'high'
    mctx.drawImage(small, 0, 0, mid.width, mid.height)
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(mid, 0, 0, W, H)
    freeImage(mid)
  }
  freeImage(small)
  return { canvas: out, x: r.x * k, y: r.y * k }
}

// Bounding box of all marks (photo px), padded and kept inside the photo.
function marksBox(shapes, W, H, pad) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  for (const s of shapes) {
    if (s.type === 'rect') { x0 = Math.min(x0, s.x); y0 = Math.min(y0, s.y); x1 = Math.max(x1, s.x + s.w); y1 = Math.max(y1, s.y + s.h) }
    else for (let i = 0; i < s.pts.length; i += 2) {
      x0 = Math.min(x0, s.pts[i] - s.r); y0 = Math.min(y0, s.pts[i + 1] - s.r); x1 = Math.max(x1, s.pts[i] + s.r); y1 = Math.max(y1, s.pts[i + 1] + s.r)
    }
  }
  const x = Math.max(0, Math.floor(x0 - pad)), y = Math.max(0, Math.floor(y0 - pad))
  return { x, y, w: Math.max(1, Math.min(W, Math.ceil(x1 + pad)) - x), h: Math.max(1, Math.min(H, Math.ceil(y1 + pad)) - y) }
}
function clipPath(ctx, shapes, k) {
  ctx.beginPath()
  for (const s of shapes) {
    if (s.type === 'rect') ctx.rect(s.x * k, s.y * k, s.w * k, s.h * k)
    else for (let i = 0; i < s.pts.length; i += 2) {
      ctx.moveTo(s.pts[i] * k + s.r * k, s.pts[i + 1] * k)
      ctx.arc(s.pts[i] * k, s.pts[i + 1] * k, s.r * k, 0, Math.PI * 2)
    }
  }
}

function paint(ctx, img, layer, shapes, k, outline) {
  const W = ctx.canvas.width, H = ctx.canvas.height
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, W, H)
  if (!shapes.length) return
  ctx.save(); clipPath(ctx, shapes, k); ctx.clip(); ctx.drawImage(layer.canvas, layer.x, layer.y); ctx.restore()
  if (outline) {
    ctx.save(); ctx.setLineDash([8, 6]); ctx.lineWidth = 2; ctx.strokeStyle = '#ffd23f'
    for (const s of shapes) if (s.type === 'rect') ctx.strokeRect(s.x * k, s.y * k, s.w * k, s.h * k)
    ctx.restore()
  }
}

export default function BlurTool() {
  const { items, selected } = useImages()
  const item = items.find(i => i.id === selected) || items[0]
  const { img, error } = useWorkImage(item, 4096)
  const [mode, setMode] = useState('rect')
  const [kind, setKind] = useState('blur')
  const [strength, setStrength] = useState(6)
  const [brush, setBrush] = useState(4)
  const [shapes, setShapes] = useState([])
  const [fmt, setFmt] = useState('jpg')
  const canvasRef = useRef(null)
  const drag = useRef(null)

  useEffect(() => { setShapes([]); if (item) setFmt(defaultFormat(item.type) === 'png' ? 'png' : 'jpg') }, [item])

  // preview resolution: about 1200px on the long side
  const k = img ? Math.min(1, 1200 / Math.max(img.width, img.height)) : 1
  const [layer, setLayer] = useState(null)
  useEffect(() => {
    if (!img) { setLayer(null); return }
    const l = effectLayer(img, kind, strength, k)
    setLayer(l)
    return () => setTimeout(() => freeImage(l.canvas), 500) // a render may still hold it for a moment
  }, [img, kind, strength, k])

  useEffect(() => {
    const c = canvasRef.current
    if (!c || !img || !layer) return
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
    paint(c.getContext('2d'), img, layer, shapes, k, true)
  }, [img, layer, shapes, k])

  const toImg = e => {
    const c = canvasRef.current, b = c.getBoundingClientRect()
    return { x: (e.clientX - b.left) / b.width * img.width, y: (e.clientY - b.top) / b.height * img.height, perPx: img.width / b.width }
  }
  const brushR = () => Math.max(img.width, img.height) * brush / 200

  const down = e => {
    if (!img) return
    e.preventDefault()
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* pointer already gone */ }
    const p = toImg(e)
    if (mode === 'brush') {
      const s = { type: 'stroke', r: brushR(), pts: [p.x, p.y] }
      drag.current = { kind: 'stroke', index: shapes.length }
      setShapes(v => [...v, s])
      return
    }
    const rects = shapes.map(s => s.type === 'rect' ? s : { x: -1e9, y: -1e9, w: 0, h: 0 })
    const grab = 14 * p.perPx
    const i = hitRect(rects, p.x, p.y, grab)
    if (i >= 0) {
      const r = rects[i]
      const nearX = Math.abs(p.x - r.x) < grab ? 'w' : Math.abs(p.x - r.x - r.w) < grab ? 'e' : ''
      const nearY = Math.abs(p.y - r.y) < grab ? 'n' : Math.abs(p.y - r.y - r.h) < grab ? 's' : ''
      drag.current = { kind: nearX && nearY ? nearY + nearX : 'move', index: i, start: p, rect: r }
      return
    }
    drag.current = { kind: 'new', index: shapes.length, start: p }
    setShapes(v => [...v, { type: 'rect', x: p.x, y: p.y, w: 0, h: 0 }])
  }
  const move = e => {
    const d = drag.current
    if (!d || !img) return
    const p = toImg(e)
    setShapes(v => v.map((s, i) => {
      if (i !== d.index) return s
      if (d.kind === 'stroke') {
        const lx = s.pts[s.pts.length - 2], ly = s.pts[s.pts.length - 1]
        const dist = Math.hypot(p.x - lx, p.y - ly), step = s.r / 2
        if (dist < step) return s
        const pts = [...s.pts]
        for (let t = step; t <= dist; t += step) pts.push(lx + (p.x - lx) * t / dist, ly + (p.y - ly) * t / dist)
        return { ...s, pts }
      }
      if (d.kind === 'new') {
        const x = Math.min(Math.max(p.x, 0), img.width), y = Math.min(Math.max(p.y, 0), img.height)
        return { type: 'rect', ...normRect(d.start.x, d.start.y, x, y) }
      }
      const dx = p.x - d.start.x, dy = p.y - d.start.y
      if (d.kind === 'move') return { type: 'rect', ...moveRect(d.rect, dx, dy, img.width, img.height) }
      return { type: 'rect', ...resizeRect(d.rect, d.kind, dx, dy, null, img.width, img.height, 10) }
    }))
  }
  const up = () => {
    const d = drag.current
    drag.current = null
    if (d?.kind === 'new') setShapes(v => v.filter((s, i) => i !== d.index || s.w * s.h > 64 * (img.width / 1200) ** 2))
  }

  const make = async () => {
    const full = effectLayer(img, kind, strength, 1, marksBox(shapes, img.width, img.height, Math.min(img.width, img.height) * 0.05))
    const c = newCanvas(img.width, img.height)
    try {
      paint(c.getContext('2d'), img, full, shapes, 1, false)
      const out = await encodeCanvas(c, fmt, 0.92)
      return { blob: out.blob, name: outName(item.name, 'מטושטש', out.ext) }
    } finally { freeImage(full.canvas); freeImage(c) }
  }

  return (
    <div className="im-tool">
      <div className="im-field">
        <PhotoPicker />
        <div className="im-stage">
          {error ? <p className="im-err">לא הצלחנו לפתוח את התמונה.</p> : !img ? <p role="status">⏳ פותחים…</p>
            : <canvas ref={canvasRef} className="draw" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
              aria-label={mode === 'rect' ? 'גררו מלבן על כל פנים שצריך לטשטש' : 'צבעו על האזור שצריך לטשטש'} />}
        </div>
        <p className="im-small">{mode === 'rect' ? 'גוררים מלבן על כל פנים. מלבן קיים אפשר להזיז, ולמתוח מהפינה.' : 'צובעים באצבע או בעכבר על מה שצריך להסתיר.'}</p>
      </div>
      <div className="im-side">
        <Seg label="איך מסמנים" value={mode} onChange={setMode} options={[{ value: 'rect', label: '▭ מלבן' }, { value: 'brush', label: '🖌️ מברשת' }]} />
        {mode === 'brush' && <Range label="עובי מברשת" value={brush} min={1} max={12} onChange={setBrush} />}
        <Seg label="סוג" value={kind} onChange={setKind} options={[{ value: 'blur', label: 'טשטוש' }, { value: 'pixel', label: 'פיקסלים' }]} />
        <Range label="עוצמה" value={strength} min={1} max={10} onChange={setStrength} />
        <div className="im-row">
          <button type="button" className="im-btn alt" disabled={!shapes.length} onClick={() => setShapes(v => v.slice(0, -1))}>↩️ ביטול</button>
          <button type="button" className="im-btn alt" disabled={!shapes.length} onClick={() => setShapes([])}>🗑️ ניקוי</button>
        </div>
        <FormatPick value={fmt} onChange={setFmt} allow={['jpg', 'png']} />
        <DownloadBar label="הורדת התמונה המטושטשת" disabled={!img || !shapes.length} make={make} />
        <p className="im-small">הטשטוש נשמר בתוך הקובץ, ומי שמקבל את התמונה לא יכול לבטל אותו.</p>
      </div>
    </div>
  )
}
