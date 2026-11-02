// Signature / text stamp: draw with finger or mouse, or type; then drag it onto a page and pin it.
import { useEffect, useRef, useState } from 'react'

const COLORS = [['#14162d', 'שחור'], ['#1a47b8', 'כחול'], ['#c0262d', 'אדום']]
const FONTS = [
  ['hand', 'כתב יד', '"Segoe Script","Comic Sans MS","Gveret Levin",cursive', 600],
  ['plain', 'רגיל', 'Arial,"Segoe UI",sans-serif', 500],
  ['bold', 'מודגש', 'Arial,"Segoe UI",sans-serif', 900],
]

// Crop a canvas to its ink, return a PNG data URL + size
function trimCanvas(c) {
  const ctx = c.getContext('2d')
  const { width: w, height: h } = c
  const d = ctx.getImageData(0, 0, w, h).data
  let x0 = w, y0 = h, x1 = -1, y1 = -1
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (d[(y * w + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
  }
  if (x1 < 0) return null
  const pad = 6
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad)
  const out = document.createElement('canvas')
  out.width = x1 - x0 + 1; out.height = y1 - y0 + 1
  out.getContext('2d').drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height)
  return { url: out.toDataURL('image/png'), w: out.width, h: out.height }
}

function DrawPad({ color, padRef, onInk }) {
  const last = useRef(null)
  useEffect(() => {
    const c = padRef.current
    const r = window.devicePixelRatio || 1
    c.width = c.clientWidth * r; c.height = c.clientHeight * r
  }, [padRef])
  const pos = e => {
    const c = padRef.current, b = c.getBoundingClientRect()
    return [(e.clientX - b.left) * (c.width / b.width), (e.clientY - b.top) * (c.height / b.height)]
  }
  const down = e => { e.preventDefault(); padRef.current.setPointerCapture(e.pointerId); last.current = pos(e); move(e) }
  const move = e => {
    if (!last.current) return
    const c = padRef.current, ctx = c.getContext('2d'), p = pos(e)
    ctx.strokeStyle = color; ctx.lineWidth = Math.max(2.5, c.width / 160); ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.beginPath(); ctx.moveTo(...last.current); ctx.lineTo(...p); ctx.stroke()
    last.current = p; onInk()
  }
  const up = () => { last.current = null }
  return <canvas ref={padRef} className="pdf-pad" aria-label="משטח חתימה: ציירו כאן באצבע או בעכבר" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
}

export default function SignPanel({ items, engine, sources, targetId, onAdd, onRemove, onDownload, busy }) {
  const [mode, setMode] = useState('draw')
  const [color, setColor] = useState(COLORS[0][0])
  const [text, setText] = useState('')
  const [font, setFont] = useState('hand')
  const [inked, setInked] = useState(false)
  const [stamp, setStamp] = useState(null) // { url, w, h }
  const [pageId, setPageId] = useState(targetId || items[items.length - 1]?.id)
  const [preview, setPreview] = useState(null) // { url, w, h }
  const [box, setBox] = useState({ fx: 0.55, fy: 0.78, fw: 0.3 })
  const [added, setAdded] = useState(0)
  const pad = useRef(null), stage = useRef(null), drag = useRef(null)
  const item = items.find(p => p.id === pageId) || items[items.length - 1]
  const pageNo = items.indexOf(item) + 1

  useEffect(() => { if (targetId) setPageId(targetId) }, [targetId])

  // big preview of the chosen page (as shown, with what's already pinned)
  useEffect(() => {
    if (!stamp || !item) return
    let gone = false, url
    engine.renderShown(item, sources.get(item.src), 1.4).then(c => new Promise(res => c.toBlob(b => res([b, c.width, c.height]), 'image/jpeg', 0.85)))
      .then(([b, w, h]) => { if (gone) return; url = URL.createObjectURL(b); setPreview({ url, w, h }) })
      .catch(() => {})
    return () => { gone = true; if (url) URL.revokeObjectURL(url) }
  }, [stamp, item, engine, sources])

  const clearPad = () => { const c = pad.current; c?.getContext('2d').clearRect(0, 0, c.width, c.height); setInked(false) }

  const makeStamp = () => {
    let s = null
    if (mode === 'draw') s = trimCanvas(pad.current)
    else if (text.trim()) {
      const f = FONTS.find(x => x[0] === font)
      const c = document.createElement('canvas')
      const ctx = c.getContext('2d')
      const fontCss = `${f[3]} 120px ${f[2]}`
      ctx.font = fontCss
      c.width = Math.min(8000, Math.ceil(ctx.measureText(text.trim()).width) + 60); c.height = 260
      ctx.font = fontCss // resizing a canvas resets its context
      ctx.fillStyle = color; ctx.textBaseline = 'middle'; ctx.direction = 'rtl'; ctx.textAlign = 'right'
      ctx.fillText(text.trim(), c.width - 20, c.height / 2)
      s = trimCanvas(c)
    }
    if (!s) return
    setStamp(s)
    setBox(b => ({ ...b, fw: mode === 'draw' ? 0.3 : Math.min(0.6, 0.045 * text.trim().length + 0.08) }))
  }

  const fh = preview && stamp ? box.fw * (preview.w / preview.h) * (stamp.h / stamp.w) : 0
  const clamp = (b) => ({ ...b, fx: Math.min(Math.max(0, b.fx), 1 - b.fw), fy: Math.min(Math.max(0, b.fy), Math.max(0, 1 - fh)) })

  const startDrag = e => {
    e.preventDefault(); e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, b: box }
  }
  const moveDrag = e => {
    if (!drag.current) return
    const r = stage.current.getBoundingClientRect(), d = drag.current
    setBox(clamp({ ...d.b, fx: d.b.fx + (e.clientX - d.x) / r.width, fy: d.b.fy + (e.clientY - d.y) / r.height }))
  }
  const endDrag = () => { drag.current = null }
  // tap on the page: put the stamp's centre there
  const tapStage = e => {
    if (drag.current) return
    const r = stage.current.getBoundingClientRect()
    setBox(clamp({ ...box, fx: (e.clientX - r.left) / r.width - box.fw / 2, fy: (e.clientY - r.top) / r.height - fh / 2 }))
  }

  const pin = () => {
    onAdd(item.id, { url: stamp.url, fx: box.fx, fy: box.fy, fw: box.fw, fh })
    setAdded(a => a + 1)
  }

  if (!items.length) return null
  return (
    <div className="space-y-3 w-full">
      {!stamp ? <>
        <p className="pdf-step">1. מה מוסיפים?</p>
        <div className="pdf-seg" role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'draw'} onClick={() => setMode('draw')}>✍️ ציור חתימה</button>
          <button type="button" role="tab" aria-selected={mode === 'type'} onClick={() => setMode('type')}>🔤 הקלדת טקסט</button>
        </div>
        <div className="pdf-row">
          <span>צבע:</span>
          {COLORS.map(([c, n]) => <button key={c} type="button" className="pdf-color" style={{ background: c }} aria-label={n} aria-pressed={color === c} onClick={() => setColor(c)} />)}
        </div>
        {mode === 'draw' ? <>
          <DrawPad color={color} padRef={pad} onInk={() => setInked(true)} />
          <div className="pdf-row">
            <button type="button" className="xl-btn alt" onClick={clearPad}>🧽 ניקוי</button>
            <button type="button" className="xl-btn" disabled={!inked} onClick={makeStamp}>המשך: מיקום על הדף ←</button>
          </div>
        </> : <>
          <input className="pdf-input" value={text} onChange={e => setText(e.target.value)} placeholder="שם מלא, ת״ז, הערה…" maxLength={80} />
          <div className="pdf-row">
            {FONTS.map(([k, n, ff, fw]) => <button key={k} type="button" className="pdf-chip" aria-pressed={font === k} style={{ fontFamily: ff, fontWeight: fw }} onClick={() => setFont(k)}>{n}</button>)}
            <button type="button" className="pdf-chip" onClick={() => setText(new Date().toLocaleDateString('he-IL'))}>📅 תאריך היום</button>
          </div>
          <button type="button" className="xl-btn" disabled={!text.trim()} onClick={makeStamp}>המשך: מיקום על הדף ←</button>
        </>}
      </> : <>
        <p className="pdf-step">2. גוררים למקום הנכון ומצמידים</p>
        <div className="pdf-row">
          <label className="pdf-row">עמוד:
            <select className="pdf-input w-auto" value={item.id} onChange={e => setPageId(+e.target.value)}>
              {items.map((p, i) => <option key={p.id} value={p.id}>{i + 1}</option>)}
            </select>
          </label>
          <label className="pdf-row grow">גודל:
            <input type="range" min="0.06" max="0.9" step="0.01" value={box.fw} onChange={e => setBox(clamp({ ...box, fw: +e.target.value }))} aria-label="גודל החתימה" />
          </label>
        </div>
        <div className="pdf-stage" ref={stage} onClick={tapStage}>
          {preview ? <img src={preview.url} alt={`עמוד ${pageNo}`} draggable="false" /> : <div className="pdf-stage-wait">טוען את העמוד…</div>}
          {preview && <img src={stamp.url} alt="החתימה" className="pdf-stamp" draggable="false"
            style={{ right: 'auto', left: `${box.fx * 100}%`, top: `${box.fy * 100}%`, width: `${box.fw * 100}%` }}
            onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onClick={e => e.stopPropagation()} />}
        </div>
        <div className="pdf-row">
          <button type="button" className="xl-btn go" disabled={!preview || busy} onClick={pin}>📌 הצמדה לעמוד {pageNo}</button>
          <button type="button" className="xl-btn alt" onClick={() => { setStamp(null); setInked(false) }}>↩ חתימה אחרת</button>
          {item.overlays?.length > 0 && <button type="button" className="xl-btn alt" onClick={() => onRemove(item.id)}>🗑 ניקוי עמוד {pageNo}</button>}
        </div>
        {added > 0 && <div className="pdf-ok" role="status">
          <span>✅ הוצמד. אפשר להצמיד שוב (בעמוד אחר או במקום אחר), או להוריד.</span>
          <button type="button" className="xl-btn" disabled={busy} onClick={onDownload}>⬇️ הורדת ה-PDF החתום</button>
        </div>}
      </>}
    </div>
  )
}
