import { useCallback, useEffect, useRef, useState } from 'react'
import { buildLineMask, floodFill, undoFill } from './phoneColoringFill'

// Colour the drawing on the screen: tap an area to fill it, pinch (or the + button) to zoom in on
// small parts and drag to move around. Nothing leaves the device; the finished picture can be
// saved or shared as a PNG.
const MAX_SIZE = 1400 // the drawings are 1408 px: keep their thin lines, so fills don't leak
const MAX_ZOOM = 6
const COLORS = ['#ef4444', '#f97316', '#facc15', '#84cc16', '#22c55e', '#14b8a6', '#38bdf8', '#3b82f6', '#8b5cf6', '#ec4899', '#f9a8d4', '#a16207', '#fde68a', '#94a3b8', '#1f2937', '#ffffff']
const NAMES = ['אדום', 'כתום', 'צהוב', 'ירוק בהיר', 'ירוק', 'טורקיז', 'תכלת', 'כחול', 'סגול', 'ורוד', 'ורוד בהיר', 'חום', 'בז׳', 'אפור', 'שחור', 'מחק (לבן)']
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16))
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

export default function PhoneColoring({ src, name, onClose }) {
  const canvasRef = useRef(null)
  const boxRef = useRef(null)
  const state = useRef(null) // { w, h, mask, color: ImageData, lines: canvas }
  const undo = useRef([])
  const [undoCount, setUndoCount] = useState(0)
  const [color, setColor] = useState(COLORS[0])
  const [view, setView] = useState({ s: 1, x: 0, y: 0 })
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [shape, setShape] = useState('1 / 1')
  const gesture = useRef({ pts: new Map(), moved: false, multi: false })

  const paint = useCallback(() => {
    const s = state.current, cv = canvasRef.current
    if (!s || !cv) return
    const ctx = cv.getContext('2d')
    ctx.globalCompositeOperation = 'source-over'
    ctx.putImageData(s.color, 0, 0)
    // The line art on top: white paper multiplies away, the black lines stay crisp over the colour.
    ctx.globalCompositeOperation = 'multiply'
    ctx.drawImage(s.lines, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
  }, [])

  useEffect(() => {
    let live = true
    const img = new Image()
    img.onload = () => {
      if (!live) return
      // An SVG without a size reports 300x150 (or 0): draw every drawing at the full size, so thin
      // lines stay dark and closed.
      // The canvas takes the drawing's own shape (some are tall), its long side MAX_SIZE.
      const nw = img.naturalWidth || MAX_SIZE, nh = img.naturalHeight || MAX_SIZE
      const w = nw >= nh ? MAX_SIZE : Math.round((MAX_SIZE * nw) / nh), h = nh >= nw ? MAX_SIZE : Math.round((MAX_SIZE * nh) / nw)
      const lines = document.createElement('canvas')
      lines.width = w; lines.height = h
      const lc = lines.getContext('2d', { willReadFrequently: true })
      lc.fillStyle = '#fff'; lc.fillRect(0, 0, w, h)
      lc.drawImage(img, 0, 0, w, h)
      const color = new ImageData(w, h)
      color.data.fill(255)
      state.current = { w, h, mask: buildLineMask(lc.getImageData(0, 0, w, h).data, w, h), color, lines }
      const cv = canvasRef.current
      if (cv) { cv.width = w; cv.height = h }
      setShape(`${w} / ${h}`)
      setReady(true)
    }
    img.onerror = () => { if (live) setFailed(true) }
    img.src = src
    return () => { live = false }
  }, [src])

  useEffect(() => { if (ready) paint() }, [ready, paint])

  // A full-screen layer: keep the page behind it still, and let Escape close it.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [onClose])

  const remember = change => { undo.current = [...undo.current.slice(-19), change]; setUndoCount(undo.current.length) }
  const fillAt = (clientX, clientY) => {
    const s = state.current, cv = canvasRef.current
    if (!s || !cv) return
    const r = cv.getBoundingClientRect() // already includes the zoom
    const x = Math.floor(((clientX - r.left) / r.width) * s.w), y = Math.floor(((clientY - r.top) / r.height) * s.h)
    const change = floodFill(s.color.data, s.mask, s.w, s.h, x, y, hex(color))
    if (change) { remember(change); paint() }
  }
  const back = () => {
    const s = state.current, change = undo.current.at(-1)
    if (!s || !change) return
    undoFill(s.color.data, change)
    undo.current = undo.current.slice(0, -1); setUndoCount(undo.current.length)
    paint()
  }
  const clear = () => {
    const s = state.current
    if (!s) return
    remember({ full: new Uint8ClampedArray(s.color.data) })
    s.color.data.fill(255)
    paint()
  }

  // Keep the zoomed drawing from being dragged off the screen.
  const fit = v => {
    const box = boxRef.current?.getBoundingClientRect(), cv = canvasRef.current
    const w = cv?.offsetWidth || box?.width || 0, h = cv?.offsetHeight || box?.height || 0
    const s = clamp(v.s, 1, MAX_ZOOM), mx = (w * (s - 1)) / 2, my = (h * (s - 1)) / 2
    return { s, x: clamp(v.x, -mx, mx), y: clamp(v.y, -my, my) }
  }
  const zoomBy = f => setView(v => fit({ s: v.s * f, x: v.x * f, y: v.y * f }))

  const onDown = e => {
    const g = gesture.current
    e.currentTarget.setPointerCapture?.(e.pointerId)
    if (!g.pts.size) { g.moved = false; g.multi = false }
    g.pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (g.pts.size === 2) {
      const [a, b] = [...g.pts.values()]
      g.multi = true
      g.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, v: view }
    } else if (g.pts.size === 1) g.pan = { x: e.clientX, y: e.clientY, v: view }
  }
  const onMove = e => {
    const g = gesture.current
    if (!g.pts.has(e.pointerId)) return
    g.pts.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (g.pts.size >= 2 && g.pinch) {
      const [a, b] = [...g.pts.values()], p = g.pinch
      const f = Math.hypot(a.x - b.x, a.y - b.y) / p.d
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2
      setView(fit({ s: p.v.s * f, x: p.v.x * f + (mx - p.mx), y: p.v.y * f + (my - p.my) }))
    } else if (g.pts.size === 1 && g.pan) {
      const dx = e.clientX - g.pan.x, dy = e.clientY - g.pan.y
      if (Math.hypot(dx, dy) > 8) g.moved = true
      if (g.moved && g.pan.v.s > 1) setView(fit({ ...g.pan.v, x: g.pan.v.x + dx, y: g.pan.v.y + dy }))
    }
  }
  const onUp = e => {
    const g = gesture.current
    if (!g.pts.has(e.pointerId)) return
    g.pts.delete(e.pointerId)
    // A plain tap (one finger, hardly moved, no pinch along the way) fills.
    if (!g.pts.size && !g.moved && !g.multi && e.type === 'pointerup') fillAt(e.clientX, e.clientY)
    if (g.pts.size === 1) { const [p] = [...g.pts.values()]; g.pan = { ...p, v: view }; g.pinch = null }
  }
  const onWheel = e => { if (e.deltaY) zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15) }

  const save = () => {
    canvasRef.current?.toBlob(async blob => {
      if (!blob) return
      const file = new File([blob], 'ugabuga-coloring.png', { type: 'image/png' })
      try {
        if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: name }); return }
      } catch (err) { if (err?.name === 'AbortError') return }
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob); a.download = file.name
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(a.href), 4000)
    }, 'image/png')
  }

  const btn = 'rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm font-bold disabled:opacity-40'
  const round = 'h-11 w-11 rounded-full border-2 border-slate-300 bg-white text-xl font-black shadow disabled:opacity-40'
  return <div className="no-print fixed inset-0 z-[1000] flex flex-col bg-[#fffaf0]" dir="rtl" role="dialog" aria-modal="true" aria-label={`צביעה במסך: ${name}`}>
    <div className="flex items-center gap-2 border-b-2 border-slate-200 bg-white px-3 py-2">
      <strong className="min-w-0 flex-1 truncate">🎨 {name}</strong>
      <button type="button" className={btn} onClick={back} disabled={!undoCount}>↩️ ביטול</button>
      <button type="button" className={btn} onClick={clear} disabled={!ready}>🧽 מהתחלה</button>
      <button type="button" className={`${btn} border-pink-400`} onClick={save} disabled={!ready}>💾 שמירה</button>
      <button type="button" className={btn} onClick={onClose} aria-label="סגירה">✕</button>
    </div>
    <div ref={boxRef} className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-2" style={{ touchAction: 'none' }}
      onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onWheel={onWheel}>
      {failed ? <p>לא הצלחנו לטעון את הציור. נסו לרענן את הדף.</p>
        : <canvas ref={canvasRef} width={MAX_SIZE} height={MAX_SIZE} aria-label="הציור. הקישו על אזור כדי לצבוע אותו, צבטו כדי להגדיל"
          className="max-h-full max-w-full rounded-xl border-2 border-slate-200 bg-white shadow"
          style={{ aspectRatio: shape, cursor: 'pointer', transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})`, transformOrigin: 'center', willChange: 'transform' }} />}
      {!ready && !failed && <p className="absolute">טוענים את הציור…</p>}
      <div className="absolute bottom-3 left-3 flex flex-col gap-2" onPointerDown={e => e.stopPropagation()}>
        <button type="button" className={round} onClick={() => zoomBy(1.6)} disabled={view.s >= MAX_ZOOM} aria-label="הגדלה">+</button>
        <button type="button" className={round} onClick={() => zoomBy(1 / 1.6)} disabled={view.s <= 1} aria-label="הקטנה">−</button>
        {view.s > 1 && <button type="button" className={`${round} text-base`} onClick={() => setView({ s: 1, x: 0, y: 0 })} aria-label="כל הציור">⤢</button>}
      </div>
    </div>
    <div className="border-t-2 border-slate-200 bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
      <p className="m-0 mb-2 text-center text-sm text-slate-600">בוחרים צבע ומקישים על אזור · צובטים או לוחצים + כדי להגדיל חלקים קטנים</p>
      <div className="mx-auto flex max-w-xl flex-wrap justify-center gap-2" role="radiogroup" aria-label="צבעים">
        {COLORS.map((c, i) => <button key={c} type="button" role="radio" aria-checked={color === c} aria-label={NAMES[i]} onClick={() => setColor(c)}
          className="h-10 w-10 rounded-full border-2" style={{ background: c, borderColor: color === c ? '#111' : '#cbd5e1', boxShadow: color === c ? '0 0 0 3px #fff, 0 0 0 5px #111' : 'none' }}>
          {c === '#ffffff' ? '🧽' : ''}</button>)}
      </div>
    </div>
  </div>
}
