// Text on a photo: Hebrew (RTL), several texts, font / size / colour / outline / box, drag or tap to place.
import { useEffect, useRef, useState } from 'react'
import { useImages } from './imageStore'
import { useWorkImage } from './useWorkImage'
import { newCanvas, freeImage, encodeCanvas } from './imageIO'
import { hitRect, clamp, outName, defaultFormat } from './imageLogic'
import { Seg, Range, FormatPick, PhotoPicker, DownloadBar } from './ui'
import { GOOGLE_FONTS, loadGoogleFont } from '../fonts/googleFonts'

const FONTS = [
  { id: 'heavy', label: 'עבה', family: 'Heebo', weight: 900 },
  { id: 'plain', label: 'רגיל', family: 'Heebo', weight: 500 },
  { id: 'hand', label: 'כתב יד', family: 'KtavYad', weight: 400 },
  { id: 'stam', label: 'סת״ם', family: 'Stam', weight: 400 },
  { id: 'serif', label: 'קלאסי', family: 'Frank Ruhl Libre', weight: 700, fallback: '"Times New Roman", David, serif' },
]
// More Hebrew Google fonts, offered in a select under the quick picks
const MORE_FONTS = GOOGLE_FONTS.filter(f => f.he && !['heebo', 'frank-ruhl-libre'].includes(f.id))
  .map(f => ({ id: 'g-' + f.id, gid: f.id, label: f.label, family: f.family, weight: f.weights === '400' ? 400 : 700 }))
const COLORS = ['#ffffff', '#14162d', '#ffd23f', '#ff4d6d', '#2bb673', '#3a86ff']
const fontOf = id => FONTS.find(f => f.id === id) || MORE_FONTS.find(f => f.id === id) || FONTS[0]
const cssFont = (f, px) => `${f.weight} ${px}px "${f.family}", ${f.fallback || 'Heebo, Arial, sans-serif'}`

let nextId = 1
const newLayer = (y = 0.5) => ({ id: nextId++, text: 'מזל טוב!', x: 0.5, y, size: 10, color: '#ffffff', stroke: '#14162d', strokeW: 4, font: 'heavy', box: false, boxColor: '#14162d' })

// Draw all texts on ctx sized W×H; returns each text's bounding box (canvas px) for hit tests.
function drawTexts(ctx, layers, W, H, selectedId) {
  ctx.save()
  ctx.direction = 'rtl'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineJoin = 'round'
  const boxes = layers.map(l => {
    const f = fontOf(l.font)
    const px = Math.max(6, l.size / 100 * W)
    ctx.font = cssFont(f, px)
    const lines = String(l.text || ' ').split('\n')
    const lh = px * 1.25
    const w = Math.max(...lines.map(s => ctx.measureText(s).width), px * 0.5)
    const h = lh * lines.length
    const cx = l.x * W, cy = l.y * H
    const pad = px * 0.3
    const box = { x: cx - w / 2 - pad, y: cy - h / 2 - pad, w: w + pad * 2, h: h + pad * 2 }
    if (l.box) {
      ctx.save(); ctx.globalAlpha = 0.75; ctx.fillStyle = l.boxColor
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(box.x, box.y, box.w, box.h, pad); else ctx.rect(box.x, box.y, box.w, box.h)
      ctx.fill(); ctx.restore()
    }
    lines.forEach((s, i) => {
      const y = cy - h / 2 + lh * (i + 0.5)
      if (l.strokeW > 0) { ctx.lineWidth = px * l.strokeW / 22; ctx.strokeStyle = l.stroke; ctx.strokeText(s, cx, y) }
      ctx.fillStyle = l.color; ctx.fillText(s, cx, y)
    })
    if (l.id === selectedId) {
      ctx.save(); ctx.setLineDash([6, 5]); ctx.lineWidth = 2; ctx.strokeStyle = '#ffd23f'
      ctx.strokeRect(box.x, box.y, box.w, box.h); ctx.restore()
    }
    return box
  })
  ctx.restore()
  return boxes
}

export default function TextTool() {
  const { items, selected } = useImages()
  const item = items.find(i => i.id === selected) || items[0]
  const { img, error } = useWorkImage(item, 4096)
  const [layers, setLayers] = useState(() => [newLayer(0.82)])
  const [sel, setSel] = useState(() => layers[0].id)
  const [fmt, setFmt] = useState('jpg')
  const [fontsReady, setFontsReady] = useState(0)
  const canvasRef = useRef(null)
  const boxes = useRef([])
  const drag = useRef(null)

  const cur = layers.find(l => l.id === sel)
  const set = patch => setLayers(v => v.map(l => l.id === sel ? { ...l, ...patch } : l))

  useEffect(() => { if (item) setFmt(defaultFormat(item.type) === 'png' ? 'png' : 'jpg') }, [item])
  // canvas can't wait for web fonts by itself: load the ones in use, then redraw
  const fontKey = [...new Set(layers.map(l => l.font))].sort().join(',')
  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts || !fontKey) return
    const want = fontKey.split(',').map(id => {
      const f = fontOf(id)
      return (f.gid ? loadGoogleFont(f.gid) : Promise.resolve()).then(() => document.fonts.load(cssFont(f, 40), 'אבג'))
    })
    Promise.all(want).then(() => setFontsReady(n => n + 1)).catch(() => {})
  }, [fontKey])

  const k = img ? Math.min(1, 1200 / Math.max(img.width, img.height)) : 1
  useEffect(() => {
    const c = canvasRef.current
    if (!c || !img) return
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k)
    const ctx = c.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, c.width, c.height)
    boxes.current = drawTexts(ctx, layers, c.width, c.height, sel)
  }, [img, k, layers, sel, fontsReady])

  const at = e => {
    const c = canvasRef.current, b = c.getBoundingClientRect()
    return { x: (e.clientX - b.left) / b.width, y: (e.clientY - b.top) / b.height, cx: (e.clientX - b.left) / b.width * c.width, cy: (e.clientY - b.top) / b.height * c.height }
  }
  const down = e => {
    if (!img) return
    e.preventDefault()
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* pointer already gone */ }
    const p = at(e)
    const i = hitRect(boxes.current, p.cx, p.cy)
    if (i >= 0) {
      const l = layers[i]
      setSel(l.id)
      drag.current = { id: l.id, dx: l.x - p.x, dy: l.y - p.y }
    } else if (cur) {
      // tap on an empty spot moves the chosen text there
      set({ x: clamp(p.x, 0, 1), y: clamp(p.y, 0, 1) })
      drag.current = { id: cur.id, dx: 0, dy: 0 }
    }
  }
  const move = e => {
    const d = drag.current
    if (!d) return
    const p = at(e)
    setLayers(v => v.map(l => l.id === d.id ? { ...l, x: clamp(p.x + d.dx, 0, 1), y: clamp(p.y + d.dy, 0, 1) } : l))
  }
  const up = () => { drag.current = null }

  const add = () => { const l = newLayer(0.5); l.text = 'טקסט'; setLayers(v => [...v, l]); setSel(l.id) }
  const del = () => { const rest = layers.filter(l => l.id !== sel); setLayers(rest); setSel(rest[rest.length - 1]?.id ?? null) }

  const make = async () => {
    const c = newCanvas(img.width, img.height)
    try {
      const ctx = c.getContext('2d')
      ctx.drawImage(img, 0, 0)
      drawTexts(ctx, layers, c.width, c.height, null)
      const out = await encodeCanvas(c, fmt, 0.92)
      return { blob: out.blob, name: outName(item.name, 'עם-טקסט', out.ext) }
    } finally { freeImage(c) }
  }

  return (
    <div className="im-tool">
      <div className="im-field">
        <PhotoPicker />
        <div className="im-stage">
          {error ? <p className="im-err">לא הצלחנו לפתוח את התמונה.</p> : !img ? <p role="status">⏳ פותחים…</p>
            : <canvas ref={canvasRef} className="draw" style={{ cursor: 'move' }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label="התמונה עם הטקסט. גוררים טקסט כדי להזיז אותו" />}
        </div>
        <p className="im-small">גוררים את הטקסט למקום, או נוגעים במקום ריק כדי להעביר אליו את הטקסט המסומן.</p>
      </div>
      <div className="im-side">
        {layers.length > 1 && (
          <Seg label="טקסט לעריכה" small value={sel} onChange={setSel} options={layers.map((l, i) => ({ value: l.id, label: `${i + 1}. ${(l.text || '').split('\n')[0].slice(0, 10) || '…'}` }))} />
        )}
        {cur ? <>
          <label className="im-field">
            <span className="im-label">הטקסט</span>
            <textarea className="im-text" dir="rtl" value={cur.text} onChange={e => set({ text: e.target.value })} rows={2} />
          </label>
          <Seg label="גופן" small value={cur.font} onChange={font => set({ font })} options={FONTS.map(f => ({ value: f.id, label: f.label }))} />
          <label className="im-field">
            <span className="im-label">עוד גופנים</span>
            <select value={cur.font.startsWith('g-') ? cur.font : ''} onChange={e => e.target.value && set({ font: e.target.value })} className="min-h-[40px] rounded-xl border-2 border-slate-200 bg-white px-2 font-semibold">
              <option value="">בחרו גופן מגוגל…</option>
              {MORE_FONTS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </label>
          <Range label="גודל" value={cur.size} min={2} max={30} step={0.5} onChange={size => set({ size })} />
          <div className="im-field">
            <span className="im-label">צבע</span>
            <div className="im-row">
              {COLORS.map(c => <button key={c} type="button" className="im-chip" aria-pressed={cur.color === c} aria-label={c} onClick={() => set({ color: c })} style={{ background: c, width: 40, padding: 0 }} />)}
              <input type="color" className="im-color" value={cur.color} onChange={e => set({ color: e.target.value })} aria-label="צבע אחר" />
            </div>
          </div>
          <Range label="מסגרת לאותיות" value={cur.strokeW} min={0} max={10} onChange={strokeW => set({ strokeW })} />
          <div className="im-row">
            <span className="im-label">צבע המסגרת</span>
            <input type="color" className="im-color" value={cur.stroke} onChange={e => set({ stroke: e.target.value })} aria-label="צבע המסגרת" />
            <button type="button" className="im-chip" aria-pressed={cur.box} onClick={() => set({ box: !cur.box })}>▭ רקע לטקסט</button>
            {cur.box && <input type="color" className="im-color" value={cur.boxColor} onChange={e => set({ boxColor: e.target.value })} aria-label="צבע הרקע" />}
          </div>
        </> : <p className="im-small">אין טקסט. הוסיפו אחד.</p>}
        <div className="im-row">
          <button type="button" className="im-btn alt" onClick={add}>➕ עוד טקסט</button>
          {cur && <button type="button" className="im-btn alt" onClick={del}>🗑️ מחיקה</button>}
        </div>
        <FormatPick value={fmt} onChange={setFmt} allow={['jpg', 'png']} />
        <DownloadBar label="הורדת התמונה" disabled={!img} make={make} />
      </div>
    </div>
  )
}
