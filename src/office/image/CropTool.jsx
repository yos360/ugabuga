// Crop: drag the frame or its handles, free or a fixed ratio; rotate and flip.
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useImages } from './imageStore'
import { useWorkImage } from './useWorkImage'
import { newCanvas, encodeCanvas } from './imageIO'
import { RATIOS, centeredCrop, moveRect, resizeRect, roundRect, rotatedSize, outName, defaultFormat } from './imageLogic'
import { Seg, FormatPick, PhotoPicker, DownloadBar } from './ui'

// Draw src rotated (quarter turns) and flipped, scaled by k, shifted so (ox, oy) of the result lands at 0,0.
function drawTransformed(ctx, src, rot, fh, fv, k = 1, ox = 0, oy = 0) {
  const w = src.width * k, h = src.height * k
  const out = rotatedSize(w, h, rot)
  ctx.save()
  ctx.translate(out.width / 2 - ox, out.height / 2 - oy)
  ctx.scale(fh ? -1 : 1, fv ? -1 : 1)
  ctx.rotate(rot * Math.PI / 2)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(src, -w / 2, -h / 2, w, h)
  ctx.restore()
}

const HANDLES_FREE = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
const HANDLES_LOCKED = ['nw', 'ne', 'se', 'sw']

export default function CropTool() {
  const { items, selected } = useImages()
  const item = items.find(i => i.id === selected) || items[0]
  const { img, error } = useWorkImage(item, 4096)
  const [rot, setRot] = useState(0)
  const [fh, setFh] = useState(false)
  const [fv, setFv] = useState(false)
  const [ratioId, setRatioId] = useState('free')
  const [rect, setRect] = useState(null)
  const [fmt, setFmt] = useState('jpg')
  const [box, setBox] = useState(320)
  const stageRef = useRef(null)
  const canvasRef = useRef(null)
  const drag = useRef(null)

  const ratio = RATIOS.find(r => r.id === ratioId).ratio
  const base = img ? rotatedSize(img.width, img.height, rot) : null

  useEffect(() => { if (item) setFmt(defaultFormat(item.type)) }, [item])
  useEffect(() => { setRot(0); setFh(false); setFv(false) }, [img])
  useEffect(() => { if (img) { const b = rotatedSize(img.width, img.height, rot); setRect(centeredCrop(b.width, b.height, ratio)) } }, [img, rot, ratio])

  // display size: fit the stage width and ~65% of the screen height
  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return
    const measure = () => setBox(Math.max(200, el.clientWidth - 20))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const maxH = typeof window !== 'undefined' ? window.innerHeight * 0.65 : 600
  const disp = base ? (() => { const k = Math.min(box / base.width, maxH / base.height); return { w: Math.round(base.width * k), h: Math.round(base.height * k), k } })() : null

  const dW = disp?.w, dH = disp?.h, dK = disp?.k, hasRect = rect !== null
  useEffect(() => {
    const c = canvasRef.current
    if (!c || !img || !dW) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    c.width = Math.round(dW * dpr); c.height = Math.round(dH * dpr)
    drawTransformed(c.getContext('2d'), img, rot, fh, fv, dK * dpr)
  }, [img, rot, fh, fv, dW, dH, dK, hasRect])

  const start = (e, handle) => {
    e.preventDefault(); e.stopPropagation()
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* pointer already gone */ }
    drag.current = { handle, x: e.clientX, y: e.clientY, rect }
  }
  const onMove = e => {
    const d = drag.current
    if (!d || !base) return
    const dx = (e.clientX - d.x) / disp.k, dy = (e.clientY - d.y) / disp.k
    setRect(d.handle === 'move' ? moveRect(d.rect, dx, dy, base.width, base.height)
      : resizeRect(d.rect, d.handle, dx, dy, ratio, base.width, base.height, Math.max(16, base.width / 40)))
  }
  const end = () => { drag.current = null }

  const make = async () => {
    const r = roundRect(rect, base.width, base.height)
    const c = newCanvas(r.w, r.h)
    drawTransformed(c.getContext('2d'), img, rot, fh, fv, 1, r.x, r.y)
    try {
      const out = await encodeCanvas(c, fmt, 0.92)
      return { blob: out.blob, name: outName(item.name, 'חתוך', out.ext) }
    } finally { c.width = 0; c.height = 0 }
  }

  const out = rect && base ? roundRect(rect, base.width, base.height) : null
  return (
    <div className="im-tool">
      <div className="im-field">
        <PhotoPicker />
        <div className="im-stage" ref={stageRef}>
          {error ? <p className="im-err">לא הצלחנו לפתוח את התמונה.</p> : !img || !disp || !rect ? <p role="status">⏳ פותחים…</p> : (
            <div className="im-cropwrap" style={{ width: disp.w, height: disp.h }} onPointerMove={onMove} onPointerUp={end} onPointerCancel={end}>
              <canvas ref={canvasRef} style={{ width: disp.w, height: disp.h }} aria-label="התמונה לחיתוך" />
              <div className="im-croprect" onPointerDown={e => start(e, 'move')}
                style={{ left: rect.x * disp.k, top: rect.y * disp.k, width: rect.w * disp.k, height: rect.h * disp.k }}>
                {(ratio ? HANDLES_LOCKED : HANDLES_FREE).map(h => <span key={h} className={'im-h ' + h} onPointerDown={e => start(e, h)} />)}
              </div>
            </div>
          )}
        </div>
        {out && <p className="im-small">גודל אחרי חיתוך: <b dir="ltr">{out.w}×{out.h}</b> פיקסלים</p>}
      </div>
      <div className="im-side">
        <Seg label="צורה" small value={ratioId} onChange={setRatioId} options={RATIOS.map(r => ({ value: r.id, label: r.label }))} />
        <div className="im-field">
          <span className="im-label">סיבוב והיפוך</span>
          <div className="im-seg small">
            <button type="button" className="im-chip" onClick={() => setRot(r => (r + 3) % 4)}>↺ שמאלה</button>
            <button type="button" className="im-chip" onClick={() => setRot(r => (r + 1) % 4)}>↻ ימינה</button>
            <button type="button" className="im-chip" aria-pressed={fh} onClick={() => setFh(v => !v)}>⇆ מראה</button>
            <button type="button" className="im-chip" aria-pressed={fv} onClick={() => setFv(v => !v)}>⇅ הפוך</button>
          </div>
        </div>
        <button type="button" className="im-btn alt" onClick={() => base && setRect(centeredCrop(base.width, base.height, ratio))}>🔄 איפוס המסגרת</button>
        <FormatPick value={fmt} onChange={setFmt} />
        <DownloadBar label="הורדת התמונה החתוכה" disabled={!img || !rect} make={make} />
      </div>
    </div>
  )
}
