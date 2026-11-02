// Collage: 2–9 photos, a few layouts, gap / corners / background, square, story or A4 for print.
import { useEffect, useRef, useState } from 'react'
import { useImages } from './imageStore'
import { decodeImage, freeImage, newCanvas, encodeCanvas } from './imageIO'
import { COLLAGE_SIZES, COLLAGE_MAX, COLLAGE_MIN, collageLayouts, cellRects, coverCrop, hitRect } from './imageLogic'
import { Seg, Range, FormatPick, DownloadBar } from './ui'

const BGS = ['#ffffff', '#14162d', '#ffd23f', '#ffe3ec', '#dff3ff', '#e8f6e3']

function paint(ctx, W, H, { cells, imgs, gap, radius, bg, pickedIdx }) {
  const unit = Math.min(W, H) / 1000
  const rects = cellRects(cells, W, H, gap * unit)
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H)
  ctx.imageSmoothingQuality = 'high'
  rects.forEach((r, i) => {
    const img = imgs[i]
    ctx.save()
    ctx.beginPath()
    if (radius && ctx.roundRect) ctx.roundRect(r.x, r.y, r.w, r.h, Math.min(radius * unit, r.w / 2, r.h / 2)); else ctx.rect(r.x, r.y, r.w, r.h)
    ctx.clip()
    if (img) {
      const c = coverCrop(img.width, img.height, r.w, r.h)
      ctx.drawImage(img, c.sx, c.sy, c.sw, c.sh, r.x, r.y, r.w, r.h)
    } else { ctx.fillStyle = '#d9dce4'; ctx.fillRect(r.x, r.y, r.w, r.h) }
    ctx.restore()
    if (i === pickedIdx) {
      ctx.save(); ctx.lineWidth = Math.max(4, 8 * unit); ctx.strokeStyle = '#ffd23f'
      ctx.strokeRect(r.x + ctx.lineWidth / 2, r.y + ctx.lineWidth / 2, r.w - ctx.lineWidth, r.h - ctx.lineWidth); ctx.restore()
    }
  })
  return rects
}

export default function CollageTool() {
  const { items } = useImages()
  const [ids, setIds] = useState(() => items.slice(0, COLLAGE_MAX).map(i => i.id))
  const [layoutId, setLayoutId] = useState('rows')
  const [sizeId, setSizeId] = useState('square')
  const [gap, setGap] = useState(16)
  const [radius, setRadius] = useState(0)
  const [bg, setBg] = useState('#ffffff')
  const [fmt, setFmt] = useState('jpg')
  const [picked, setPicked] = useState(-1)
  const [loaded, setLoaded] = useState(() => new Set()) // ids already decoded
  const decoded = useRef(new Map())
  const canvasRef = useRef(null)
  const rectsRef = useRef([])

  // keep the selection in sync with photos added or removed above
  const known = useRef(new Set(items.map(i => i.id)))
  useEffect(() => {
    const added = items.filter(i => !known.current.has(i.id)).map(i => i.id)
    added.forEach(id => known.current.add(id))
    const have = new Set(items.map(i => i.id))
    setIds(prev => [...prev.filter(id => have.has(id)), ...added].slice(0, COLLAGE_MAX))
  }, [items])

  const n = ids.length
  const maxSide = n <= 4 ? 2048 : 1400
  // decode the chosen photos (once each), drop the ones no longer used
  useEffect(() => {
    let alive = true
    const map = decoded.current
    for (const [id, img] of map) if (!ids.includes(id)) { freeImage(img); map.delete(id) }
    ;(async () => {
      for (const id of ids) {
        if (map.has(id)) continue
        const it = items.find(i => i.id === id)
        if (!it) continue
        try {
          const img = await decodeImage(it.blob, maxSide)
          if (!alive) { freeImage(img); return }
          map.set(id, img); setLoaded(s => new Set(s).add(id))
        } catch { /* skip unreadable */ }
      }
    })()
    return () => { alive = false }
  }, [ids, items, maxSide])
  useEffect(() => () => { decoded.current.forEach(freeImage); decoded.current.clear() }, [])

  const layouts = n >= COLLAGE_MIN ? collageLayouts(n) : []
  const layout = layouts.find(l => l.id === layoutId) || layouts[0]
  const size = COLLAGE_SIZES.find(s => s.id === sizeId)

  useEffect(() => {
    const c = canvasRef.current
    if (!c || !layout) return
    const k = Math.min(1, 1100 / Math.max(size.w, size.h))
    c.width = Math.round(size.w * k); c.height = Math.round(size.h * k)
    rectsRef.current = paint(c.getContext('2d'), c.width, c.height, {
      cells: layout.cells, imgs: ids.map(id => decoded.current.get(id)), gap, radius, bg, pickedIdx: picked,
    })
  }, [layout, size, ids, gap, radius, bg, picked, loaded])

  // tap a photo, then another one, to swap them
  const onTap = e => {
    const c = canvasRef.current, b = c.getBoundingClientRect()
    const x = (e.clientX - b.left) / b.width * c.width, y = (e.clientY - b.top) / b.height * c.height
    const i = hitRect(rectsRef.current, x, y)
    if (i < 0) { setPicked(-1); return }
    if (picked < 0) { setPicked(i); return }
    if (picked !== i) setIds(v => { const a = [...v]; [a[picked], a[i]] = [a[i], a[picked]]; return a })
    setPicked(-1)
  }

  const toggle = id => setIds(v => v.includes(id) ? v.filter(x => x !== id) : v.length >= COLLAGE_MAX ? v : [...v, id])

  const make = async () => {
    const c = newCanvas(size.w, size.h)
    paint(c.getContext('2d'), size.w, size.h, { cells: layout.cells, imgs: ids.map(id => decoded.current.get(id)), gap, radius, bg, pickedIdx: -1 })
    try {
      const out = await encodeCanvas(c, fmt, 0.92)
      return { blob: out.blob, name: `קולאז׳-${size.id}.${out.ext}` }
    } finally { c.width = 0; c.height = 0 }
  }

  const loading = ids.some(id => !loaded.has(id))
  return (
    <div className="im-tool">
      <div className="im-field">
        <div className="im-stage">
          {n < COLLAGE_MIN ? <p>צריך לפחות 2 תמונות. {items.length < 2 ? 'הוסיפו עוד תמונה למעלה.' : 'סמנו תמונות ברשימה.'}</p>
            : <canvas ref={canvasRef} onClick={onTap} style={{ cursor: 'pointer' }} aria-label="תצוגת הקולאז׳. נגיעה בתמונה ואחריה בתמונה אחרת מחליפה ביניהן" />}
        </div>
        <p className="im-small">{loading ? '⏳ טוענים תמונות…' : picked >= 0 ? 'עכשיו נגעו בתמונה שאיתה להחליף.' : 'כדי להחליף מקומות: נוגעים בתמונה ואז בתמונה אחרת.'}</p>
        {items.length > 2 && (
          <div className="im-field">
            <span className="im-label">אילו תמונות ({n} מתוך עד {COLLAGE_MAX})</span>
            <div className="im-pick">
              {items.map(it => (
                <button key={it.id} type="button" aria-pressed={ids.includes(it.id)} aria-selected={ids.includes(it.id)} onClick={() => toggle(it.id)} title={it.name} style={{ opacity: ids.includes(it.id) ? 1 : 0.45 }}>
                  <img src={it.thumb} alt={it.name} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="im-side">
        {layouts.length > 0 && <Seg label="סידור" small value={layout.id} onChange={setLayoutId} options={layouts.map(l => ({ value: l.id, label: l.label }))} />}
        <Seg label="גודל" small value={sizeId} onChange={setSizeId} options={COLLAGE_SIZES.map(s => ({ value: s.id, label: s.label }))} />
        <p className="im-small">{size.note} · <span dir="ltr">{size.w}×{size.h}</span></p>
        <Range label="רווח" value={gap} min={0} max={60} onChange={setGap} />
        <Range label="פינות מעוגלות" value={radius} min={0} max={80} onChange={setRadius} />
        <div className="im-field">
          <span className="im-label">צבע רקע</span>
          <div className="im-row">
            {BGS.map(c => <button key={c} type="button" className="im-chip" aria-pressed={bg === c} aria-label={c} onClick={() => setBg(c)} style={{ background: c, width: 40, padding: 0 }} />)}
            <input type="color" className="im-color" value={bg} onChange={e => setBg(e.target.value)} aria-label="צבע אחר" />
          </div>
        </div>
        <FormatPick value={fmt} onChange={setFmt} allow={['jpg', 'png']} />
        <DownloadBar label="הורדת הקולאז׳" disabled={n < COLLAGE_MIN || loading} make={make} />
      </div>
    </div>
  )
}
