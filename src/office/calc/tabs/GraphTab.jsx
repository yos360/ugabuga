// Quick function grapher: up to three y = … functions, drag / pinch / wheel to move and zoom,
// zeros, y-intercepts and intersections marked and listed.
import { useEffect, useMemo, useRef, useState } from 'react'
import { compile, CalcError } from '../calcEngine'
import { findZeros, fmt } from '../mathTools'

const COLORS = ['#226bd7', '#cf2f56', '#23874d']
const HOME = { cx: 0, cy: 0, scale: 32 }

function niceStep(raw) {
  const p = 10 ** Math.floor(Math.log10(raw))
  return [1, 2, 5, 10].find(m => m * p >= raw) * p
}

const same = s => s
export default function GraphTab({ seed, t = same }) {
  const [funcs, setFuncs] = useState(['x²−4', '2x+1', ''])
  const [view, setView] = useState(HOME)
  const [size, setSize] = useState({ w: 600, h: 380 })
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const ptrs = useRef(new Map())
  const viewRef = useRef(view)
  viewRef.current = view

  const [seenSeed, setSeenSeed] = useState(null)
  if (seed?.expr && seed !== seenSeed) { setSeenSeed(seed); setFuncs(f => [seed.expr, f[1], f[2]]); setView(HOME) }

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return undefined
    const fit = () => { const w = Math.max(260, Math.floor(el.clientWidth)); setSize({ w, h: Math.round(Math.min(440, Math.max(280, w * 0.7))) }) }
    fit()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null
    ro?.observe(el)
    return () => ro?.disconnect()
  }, [])

  const compiled = useMemo(() => funcs.map(src => {
    if (!src.trim()) return null
    try { return { f: compile(src, { angle: 'rad' }) } } catch (e) { return { error: t(e instanceof CalcError ? e.message : 'שגיאה') } }
  }), [funcs, t])

  const points = useMemo(() => {
    const { w } = size; const { cx, scale } = view
    const a = cx - w / 2 / scale; const b = cx + w / 2 / scale
    const list = []
    const fs = compiled.map((c, i) => (c?.f ? { f: c.f, i } : null)).filter(Boolean)
    for (const { f, i } of fs) {
      for (const x of findZeros(f, a, b)) list.push({ x, y: 0, i, kind: t(`שורש של y${i + 1}`) })
      const y0 = f(0)
      if (Number.isFinite(y0) && a <= 0 && b >= 0) list.push({ x: 0, y: y0, i, kind: t(`חיתוך y${i + 1} עם ציר y`) })
    }
    for (let p = 0; p < fs.length; p++) for (let q = p + 1; q < fs.length; q++) {
      const F = fs[p].f; const G = fs[q].f
      for (const x of findZeros(t => F(t) - G(t), a, b)) list.push({ x, y: F(x), i: -1, kind: t(`חיתוך y${fs[p].i + 1} ו־y${fs[q].i + 1}`) })
    }
    return list.slice(0, 24)
  }, [compiled, view, size, t])

  // draw
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const { w, h } = size; const { cx, cy, scale } = view
    const dpr = window.devicePixelRatio || 1
    cv.width = w * dpr; cv.height = h * dpr
    const g = cv.getContext('2d')
    if (!g) return
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    const ink = '#14162d'
    const SX = x => w / 2 + (x - cx) * scale
    const SY = y => h / 2 - (y - cy) * scale
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, w, h)
    const step = niceStep(48 / scale)
    g.lineWidth = 1
    g.font = '11px Heebo, sans-serif'
    g.fillStyle = ink
    const x0 = Math.ceil((cx - w / 2 / scale) / step) * step
    const y0 = Math.ceil((cy - h / 2 / scale) / step) * step
    g.globalAlpha = 0.12
    g.strokeStyle = ink
    g.beginPath()
    for (let x = x0; SX(x) <= w; x += step) { g.moveTo(Math.round(SX(x)) + 0.5, 0); g.lineTo(Math.round(SX(x)) + 0.5, h) }
    for (let y = y0; SY(y) >= 0; y += step) { g.moveTo(0, Math.round(SY(y)) + 0.5); g.lineTo(w, Math.round(SY(y)) + 0.5) }
    g.stroke()
    g.globalAlpha = 0.75
    g.beginPath()
    const ax = Math.min(Math.max(SY(0), 0), h); const ay = Math.min(Math.max(SX(0), 0), w)
    g.moveTo(0, ax); g.lineTo(w, ax); g.moveTo(ay, 0); g.lineTo(ay, h)
    g.stroke()
    g.globalAlpha = 0.85
    const lab = v => fmt(Math.abs(v) < step / 1e6 ? 0 : Number(v.toPrecision(6)))
    g.textAlign = 'center'; g.textBaseline = 'top'
    for (let x = x0; SX(x) <= w; x += step) if (Math.abs(x) > step / 2) g.fillText(lab(x), SX(x), Math.min(ax + 3, h - 14))
    g.textAlign = 'left'; g.textBaseline = 'middle'
    for (let y = y0; SY(y) >= 0; y += step) if (Math.abs(y) > step / 2) g.fillText(lab(y), Math.min(ay + 4, w - 30), SY(y))
    g.globalAlpha = 1
    compiled.forEach((c, i) => {
      if (!c?.f) return
      g.strokeStyle = COLORS[i]; g.lineWidth = 2.5
      g.beginPath()
      let pen = false; let prev = 0
      for (let px = 0; px <= w; px++) {
        const y = c.f(cx + (px - w / 2) / scale)
        if (!Number.isFinite(y)) { pen = false; continue }
        const sy = SY(y)
        if (pen && Math.abs(sy - prev) > h * 2) pen = false
        if (sy < -h * 4 || sy > h * 5) { pen = false; prev = sy; continue }
        if (pen) g.lineTo(px, sy); else g.moveTo(px, sy)
        pen = true; prev = sy
      }
      g.stroke()
    })
    for (const p of points) {
      g.beginPath(); g.arc(SX(p.x), SY(p.y), 5, 0, Math.PI * 2)
      g.fillStyle = '#fff'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = p.i >= 0 ? COLORS[p.i] : ink; g.stroke()
    }
  }, [compiled, view, size, points])

  // wheel zoom (non-passive so the page does not scroll)
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return undefined
    const onWheel = e => {
      e.preventDefault()
      const r = cv.getBoundingClientRect()
      zoomAt(e.deltaY < 0 ? 1.2 : 1 / 1.2, e.clientX - r.left, e.clientY - r.top)
    }
    cv.addEventListener('wheel', onWheel, { passive: false })
    return () => cv.removeEventListener('wheel', onWheel)
  }) // re-bind each render so zoomAt sees current size

  function zoomAt(k, px, py) {
    setView(v => {
      const s2 = Math.min(5000, Math.max(0.01, v.scale * k))
      const wx = v.cx + (px - size.w / 2) / v.scale; const wy = v.cy - (py - size.h / 2) / v.scale
      return { scale: s2, cx: wx - (px - size.w / 2) / s2, cy: wy + (py - size.h / 2) / s2 }
    })
  }
  const pos = e => { const r = canvasRef.current.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top } }
  const onDown = e => { canvasRef.current.setPointerCapture?.(e.pointerId); ptrs.current.set(e.pointerId, pos(e)) }
  const onMove = e => {
    const m = ptrs.current
    if (!m.has(e.pointerId)) return
    const p = pos(e); const old = m.get(e.pointerId)
    if (m.size === 1) {
      const v = viewRef.current
      setView({ ...v, cx: v.cx - (p.x - old.x) / v.scale, cy: v.cy + (p.y - old.y) / v.scale })
    } else if (m.size === 2) {
      const other = [...m.entries()].find(([id]) => id !== e.pointerId)[1]
      const d0 = Math.hypot(old.x - other.x, old.y - other.y); const d1 = Math.hypot(p.x - other.x, p.y - other.y)
      if (d0 > 10) zoomAt(d1 / d0, (p.x + other.x) / 2, (p.y + other.y) / 2)
    }
    m.set(e.pointerId, p)
  }
  const onUp = e => ptrs.current.delete(e.pointerId)

  return <div className="sc-panel">
    <section className="sc-card">
      <h2 className="sc-h2">{t('שרטוט גרפים')}</h2>
      <div className="sc-funcs">
        {funcs.map((f, i) => <label key={i} className="sc-func" dir="ltr">
          <span style={{ color: COLORS[i] }}>y{i + 1} =</span>
          <input className={`sc-input${compiled[i]?.error ? ' sc-input-bad' : ''}`} value={f} placeholder={i === 2 ? 'sin(x)' : ''} onChange={e => setFuncs(o => o.map((x, j) => (j === i ? e.target.value : x)))} aria-label={t(`פונקציה ${i + 1}`)} spellCheck={false} autoCapitalize="off" />
          {compiled[i]?.error && <small className="sc-err" dir={t === same ? 'rtl' : 'ltr'}>⚠ {compiled[i].error}</small>}
        </label>)}
      </div>
      <div className="sc-graph" ref={wrapRef}>
        <canvas ref={canvasRef} className="sc-canvas" style={{ width: size.w, height: size.h }} role="img" aria-label={t('גרף הפונקציות')}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onDoubleClick={e => { const p = pos(e); zoomAt(2, p.x, p.y) }} />
        <div className="sc-zoom">
          <button type="button" className="sc-pill" onClick={() => zoomAt(1.5, size.w / 2, size.h / 2)} aria-label={t('הגדלה')} title={t('הגדלה (גלגלת / צביטה)')}>＋</button>
          <button type="button" className="sc-pill" onClick={() => zoomAt(1 / 1.5, size.w / 2, size.h / 2)} aria-label={t('הקטנה')} title={t('הקטנה')}>－</button>
          <button type="button" className="sc-pill" onClick={() => setView(HOME)} aria-label={t('חזרה למרכז')} title={t('חזרה למרכז')}>⌂</button>
        </div>
      </div>
      <p className="sc-sub">{t('גוררים כדי להזיז, גלגלת או צביטה כדי להגדיל. כותבים x בתור המשתנה: 2x+1, x²−4, sin(x). בגרפים הזוויות ברדיאנים.')}</p>
      {points.length > 0 && <ul className="sc-points">{points.map((p, n) => <li key={n}><span className="sc-dot" style={{ borderColor: p.i >= 0 ? COLORS[p.i] : 'currentColor' }} />{p.kind}: <b dir="ltr">({fmt(p.x)}, {fmt(p.y)})</b></li>)}</ul>}
    </section>
  </div>
}
