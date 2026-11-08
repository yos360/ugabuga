import { useCallback, useEffect, useRef, useState } from 'react'
import { buildLineMask, floodFill } from './phoneColoringFill'

// Colour the drawing on the screen: tap an area to fill it. Nothing leaves the device; the
// finished picture can be saved or shared as a PNG.
const SIZE = 800
const COLORS = ['#ef4444', '#f97316', '#facc15', '#84cc16', '#22c55e', '#14b8a6', '#38bdf8', '#3b82f6', '#8b5cf6', '#ec4899', '#f9a8d4', '#a16207', '#fde68a', '#94a3b8', '#1f2937', '#ffffff']
const NAMES = ['אדום', 'כתום', 'צהוב', 'ירוק בהיר', 'ירוק', 'טורקיז', 'תכלת', 'כחול', 'סגול', 'ורוד', 'ורוד בהיר', 'חום', 'בז׳', 'אפור', 'שחור', 'מחק (לבן)']
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16))

export default function PhoneColoring({ src, name, onClose }) {
  const canvasRef = useRef(null)
  const state = useRef(null) // { mask, color: ImageData, lines: canvas }
  const [color, setColor] = useState(COLORS[0])
  const [undo, setUndo] = useState([])
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

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
      const lines = document.createElement('canvas')
      lines.width = lines.height = SIZE
      const lc = lines.getContext('2d', { willReadFrequently: true })
      lc.fillStyle = '#fff'; lc.fillRect(0, 0, SIZE, SIZE)
      const k = Math.min(SIZE / (img.naturalWidth || SIZE), SIZE / (img.naturalHeight || SIZE))
      const w = (img.naturalWidth || SIZE) * k, h = (img.naturalHeight || SIZE) * k
      lc.drawImage(img, (SIZE - w) / 2, (SIZE - h) / 2, w, h)
      const pixels = lc.getImageData(0, 0, SIZE, SIZE)
      const color = new ImageData(SIZE, SIZE)
      color.data.fill(255)
      state.current = { mask: buildLineMask(pixels.data, SIZE, SIZE), color, lines }
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

  const onTap = e => {
    const s = state.current, cv = canvasRef.current
    if (!s || !cv) return
    const r = cv.getBoundingClientRect()
    const x = Math.floor(((e.clientX - r.left) / r.width) * SIZE), y = Math.floor(((e.clientY - r.top) / r.height) * SIZE)
    const before = new Uint8ClampedArray(s.color.data)
    if (floodFill(s.color.data, s.mask, SIZE, SIZE, x, y, hex(color))) {
      setUndo(u => [...u.slice(-7), before])
      paint()
    }
  }
  const back = () => {
    const s = state.current
    if (!s || !undo.length) return
    s.color.data.set(undo[undo.length - 1])
    setUndo(u => u.slice(0, -1))
    paint()
  }
  const clear = () => {
    const s = state.current
    if (!s) return
    setUndo(u => [...u.slice(-7), new Uint8ClampedArray(s.color.data)])
    s.color.data.fill(255)
    paint()
  }
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
  return <div className="no-print fixed inset-0 z-[1000] flex flex-col bg-[#fffaf0]" dir="rtl" role="dialog" aria-modal="true" aria-label={`צביעה במסך: ${name}`}>
    <div className="flex items-center gap-2 border-b-2 border-slate-200 bg-white px-3 py-2">
      <strong className="min-w-0 flex-1 truncate">🎨 {name}</strong>
      <button type="button" className={btn} onClick={back} disabled={!undo.length}>↩️ ביטול</button>
      <button type="button" className={btn} onClick={clear} disabled={!ready}>🧽 מהתחלה</button>
      <button type="button" className={`${btn} border-pink-400`} onClick={save} disabled={!ready}>💾 שמירה</button>
      <button type="button" className={btn} onClick={onClose} aria-label="סגירה">✕</button>
    </div>
    <div className="flex min-h-0 flex-1 items-center justify-center p-2">
      {failed ? <p>לא הצלחנו לטעון את הציור. נסו לרענן את הדף.</p>
        : <canvas ref={canvasRef} width={SIZE} height={SIZE} onClick={onTap} aria-label="הציור. הקישו על אזור כדי לצבוע אותו"
          className="max-h-full max-w-full rounded-xl border-2 border-slate-200 bg-white shadow" style={{ aspectRatio: '1 / 1', touchAction: 'manipulation', cursor: 'pointer' }} />}
      {!ready && !failed && <p className="absolute">טוענים את הציור…</p>}
    </div>
    <div className="border-t-2 border-slate-200 bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
      <p className="m-0 mb-2 text-center text-sm text-slate-600">בוחרים צבע ומקישים על אזור בציור</p>
      <div className="mx-auto flex max-w-xl flex-wrap justify-center gap-2" role="radiogroup" aria-label="צבעים">
        {COLORS.map((c, i) => <button key={c} type="button" role="radio" aria-checked={color === c} aria-label={NAMES[i]} onClick={() => setColor(c)}
          className="h-10 w-10 rounded-full border-2" style={{ background: c, borderColor: color === c ? '#111' : '#cbd5e1', boxShadow: color === c ? '0 0 0 3px #fff, 0 0 0 5px #111' : 'none' }}>
          {c === '#ffffff' ? '🧽' : ''}</button>)}
      </div>
    </div>
  </div>
}
