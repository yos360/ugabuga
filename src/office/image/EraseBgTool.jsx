// Erase a solid-colour background: tap = remove similar colour (tolerance), eraser and restore brushes, undo.
// Colour-based only — it doesn't detect people, and the page says so.
import { useEffect, useRef, useState } from 'react'
import { useImages } from './imageStore'
import { useWorkImage } from './useWorkImage'
import { newCanvas, freeImage, encodeCanvas } from './imageIO'
import { floodMask, applyMask, outName } from './imageLogic'
import { Seg, Range, FormatPick, PhotoPicker, DownloadBar } from './ui'

const UNDO_MAX = 6

export default function EraseBgTool() {
  const { items, selected } = useImages()
  const item = items.find(i => i.id === selected) || items[0]
  const { img, error } = useWorkImage(item, 2000)
  const [mode, setMode] = useState('wand')
  const [tol, setTol] = useState(18)
  const [scope, setScope] = useState('touch')
  const [brush, setBrush] = useState(4)
  const [fmt, setFmt] = useState('png')
  const [undoCount, setUndoCount] = useState(0)
  const [edited, setEdited] = useState(false)
  const canvasRef = useRef(null)
  const orig = useRef(null)
  const undo = useRef([])
  const stroke = useRef(null)

  // fresh start for each photo
  useEffect(() => {
    const c = canvasRef.current
    if (!c || !img) return
    c.width = img.width; c.height = img.height
    const ctx = c.getContext('2d', { willReadFrequently: true })
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.drawImage(img, 0, 0)
    const o = newCanvas(img.width, img.height)
    o.getContext('2d').drawImage(img, 0, 0)
    orig.current = o
    undo.current = []; setUndoCount(0); setEdited(false)
    return () => { freeImage(o); undo.current = [] }
  }, [img])

  const ctxOf = () => canvasRef.current.getContext('2d', { willReadFrequently: true })
  const snapshot = () => {
    const c = canvasRef.current
    undo.current.push(ctxOf().getImageData(0, 0, c.width, c.height))
    if (undo.current.length > UNDO_MAX) undo.current.shift()
    setUndoCount(undo.current.length); setEdited(true)
  }
  const doUndo = () => {
    const d = undo.current.pop()
    if (d) ctxOf().putImageData(d, 0, 0)
    setUndoCount(undo.current.length)
  }
  const reset = () => {
    const c = canvasRef.current
    if (!c || !orig.current) return
    snapshot()
    const ctx = ctxOf()
    ctx.clearRect(0, 0, c.width, c.height); ctx.drawImage(orig.current, 0, 0)
  }

  const at = e => {
    const c = canvasRef.current, b = c.getBoundingClientRect()
    return { x: (e.clientX - b.left) / b.width * c.width, y: (e.clientY - b.top) / b.height * c.height }
  }
  const radius = () => Math.max(img.width, img.height) * brush / 200
  const dab = (from, to) => {
    const ctx = ctxOf(), r = radius()
    ctx.save()
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = r * 2
    if (mode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x + 0.01, to.y); ctx.stroke()
    } else {
      // restore: paint the original photo back inside circles along the stroke
      ctx.beginPath()
      const steps = Math.max(1, Math.ceil(Math.hypot(to.x - from.x, to.y - from.y) / (r / 2)))
      for (let i = 0; i <= steps; i++) {
        const x = from.x + (to.x - from.x) * i / steps, y = from.y + (to.y - from.y) * i / steps
        ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2)
      }
      ctx.clip()
      ctx.drawImage(orig.current, 0, 0)
    }
    ctx.restore()
  }

  const down = e => {
    if (!img) return
    e.preventDefault()
    const p = at(e)
    if (mode === 'wand') {
      const c = canvasRef.current
      snapshot()
      const ctx = ctxOf()
      const data = ctx.getImageData(0, 0, c.width, c.height)
      const mask = floodMask(data.data, c.width, c.height, p.x, p.y, tol, scope === 'touch')
      applyMask(data.data, mask, c.width, c.height, true)
      ctx.putImageData(data, 0, 0)
      return
    }
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* pointer already gone */ }
    snapshot()
    stroke.current = p
    dab(p, p)
  }
  const move = e => {
    if (!stroke.current) return
    const p = at(e)
    dab(stroke.current, p)
    stroke.current = p
  }
  const up = () => { stroke.current = null }

  const make = async () => {
    const c = canvasRef.current
    const out = await encodeCanvas(c, fmt, 0.92)
    return { blob: out.blob, name: outName(item.name, 'בלי-רקע', out.ext) }
  }

  return (
    <div className="im-tool">
      <div className="im-field">
        <PhotoPicker />
        <p className="im-stat warn">הכלי מוחק לפי צבע, ולא מזהה אנשים. הכי טוב לרקע חלק: לוגו, ציור, חתימה, מוצר על רקע לבן.</p>
        <div className="im-stage checker">
          {error ? <p className="im-err">לא הצלחנו לפתוח את התמונה.</p> : !img ? <p role="status">⏳ פותחים…</p> : null}
          <canvas ref={canvasRef} className="draw" hidden={!img} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
            aria-label={mode === 'wand' ? 'נגעו ברקע כדי למחוק אותו' : mode === 'erase' ? 'מחקו במברשת' : 'החזירו חלקים שנמחקו'} />
        </div>
        <p className="im-small">{mode === 'wand' ? 'נוגעים ברקע. נשאר רקע? מגדילים את הסף ונוגעים שוב. נמחק יותר מדי? ↩️ ומקטינים את הסף.' : mode === 'erase' ? 'מעבירים את המחק על מה שעוד צריך למחוק.' : 'מעבירים את המברשת על מה שנמחק בטעות.'}</p>
      </div>
      <div className="im-side">
        <Seg label="כלי" value={mode} onChange={setMode} options={[{ value: 'wand', label: '🪄 קסם' }, { value: 'erase', label: '🧽 מחק' }, { value: 'restore', label: '🖌️ שחזור' }]} />
        {mode === 'wand' ? <>
          <Range label="סף דמיון" value={tol} min={1} max={60} onChange={setTol} />
          <Seg label="מה למחוק" small value={scope} onChange={setScope} options={[{ value: 'touch', label: 'רק האזור שנגעתי בו' }, { value: 'all', label: 'הצבע הזה בכל התמונה' }]} />
        </> : <Range label="עובי מברשת" value={brush} min={1} max={15} onChange={setBrush} />}
        <div className="im-row">
          <button type="button" className="im-btn alt" disabled={!undoCount} onClick={doUndo}>↩️ ביטול</button>
          <button type="button" className="im-btn alt" disabled={!edited} onClick={reset}>🔄 מההתחלה</button>
        </div>
        <FormatPick value={fmt} onChange={setFmt} allow={['png', 'webp', 'jpg']} />
        {fmt === 'jpg' && <p className="im-small">ב-JPG אין שקיפות, והרקע יהיה לבן.</p>}
        <DownloadBar label="הורדה בלי רקע" disabled={!img} make={make} />
      </div>
    </div>
  )
}
