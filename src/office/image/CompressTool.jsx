// Compress & resize: max side, quality or "up to X KB"; one photo with live preview, or all at once as a ZIP.
import { useEffect, useRef, useState } from 'react'
import { useImages } from './imageStore'
import { useWorkImage } from './useWorkImage'
import { decodeImage, freeImage, newCanvas, encodeCanvas, downloadZip } from './imageIO'
import { WIDTH_PRESETS, fitWithin, fitToSize, formatBytes, savedPercent, outName, defaultFormat } from './imageLogic'
import { Seg, Range, FormatPick, PhotoPicker, DownloadBar } from './ui'

function drawScaled(img, w, h) {
  const c = newCanvas(w, h)
  const ctx = c.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, c.width, c.height)
  return c
}

// → { blob, ext, size, width, height, quality }
async function compress(img, s) {
  const max = s.side || Infinity
  const base = fitWithin(img.width, img.height, max, max)
  const fmt = s.mode === 'target' && s.fmt === 'png' ? 'jpg' : s.fmt
  if (s.mode !== 'target') {
    const c = drawScaled(img, base.width, base.height)
    try { const r = await encodeCanvas(c, fmt, s.quality / 100); return { ...r, width: c.width, height: c.height, quality: s.quality / 100 } }
    finally { freeImage(c) }
  }
  const cache = new Map()
  const canvasAt = scale => {
    if (!cache.has(scale)) cache.set(scale, drawScaled(img, base.width * scale, base.height * scale))
    return cache.get(scale)
  }
  try {
    const best = await fitToSize(async ({ quality, scale }) => {
      const c = canvasAt(scale)
      const r = await encodeCanvas(c, fmt, quality)
      return { ...r, width: c.width, height: c.height, quality }
    }, s.targetKB * 1024)
    return { ...best.result, fits: best.fits }
  } finally { cache.forEach(freeImage) }
}

export default function CompressTool() {
  const { items, selected } = useImages()
  const item = items.find(i => i.id === selected) || items[0]
  const { img, error } = useWorkImage(item, 4096)
  const [s, setS] = useState({ mode: 'quality', side: 1600, quality: 80, targetKB: 500, fmt: 'jpg' })
  const set = patch => setS(v => ({ ...v, ...patch }))
  const [res, setRes] = useState(null)
  const [url, setUrl] = useState('')
  const [batch, setBatch] = useState(null) // { done, total, results }
  const fmtTouched = useRef(false)

  useEffect(() => { if (item && !fmtTouched.current) set({ fmt: defaultFormat(item.type) === 'png' ? 'png' : 'jpg' }) }, [item])

  useEffect(() => {
    if (!img) return
    let alive = true
    const t = setTimeout(async () => {
      try {
        const r = await compress(img, s)
        if (alive) setRes(r)
      } catch { if (alive) setRes(null) }
    }, 300)
    return () => { alive = false; clearTimeout(t) }
  }, [img, s])

  useEffect(() => {
    if (!res) { setUrl(''); return }
    const u = URL.createObjectURL(res.blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [res])

  const runAll = async () => {
    const results = []
    setBatch({ done: 0, total: items.length, results })
    for (const it of items) {
      let im = null
      try {
        im = await decodeImage(it.blob, 4096)
        const r = await compress(im, s)
        results.push({ id: it.id, name: outName(it.name, 'קטן', r.ext), blob: r.blob, before: it.size, after: r.size, thumb: it.thumb })
      } catch { results.push({ id: it.id, name: it.name, failed: true, thumb: it.thumb }) }
      finally { freeImage(im) }
      setBatch({ done: results.length, total: items.length, results: [...results] })
    }
    const ok = results.filter(r => !r.failed)
    if (ok.length) await downloadZip(ok, 'תמונות-מכווצות.zip')
  }

  const pngTarget = s.mode === 'target' && s.fmt === 'png'
  const bigger = res && item && res.size >= item.size
  return (
    <div className="im-tool">
      <div className="im-field">
        <PhotoPicker />
        <div className="im-stage checker">
          {error ? <p className="im-err">לא הצלחנו לפתוח את התמונה.</p>
            : url ? <img src={url} alt="תצוגה מקדימה אחרי כיווץ" style={{ maxWidth: '100%', maxHeight: '68vh', display: 'block' }} />
              : <p role="status">⏳ מכווצים…</p>}
        </div>
        {res && item && (
          <p className={'im-stat' + (bigger || res.fits === false ? ' warn' : '')} aria-live="polite">
            לפני: <b dir="ltr">{formatBytes(item.size)}</b> <span dir="ltr">({item.width}×{item.height})</span> ←
            אחרי: <b dir="ltr">{formatBytes(res.size)}</b> <span dir="ltr">({res.width}×{res.height})</span>
            {!bigger && <> · <b>{savedPercent(item.size, res.size)}% פחות</b></>}
            {bigger && <><br />הקובץ המקורי כבר קטן יותר. נסו איכות נמוכה יותר או מידות קטנות יותר.</>}
            {res.fits === false && <><br />לא הצלחנו להגיע לגודל הזה. זה הקטן ביותר שיצא.</>}
          </p>
        )}
      </div>
      <div className="im-side">
        <Seg label="איך לכווץ" value={s.mode} onChange={mode => set({ mode })} options={[{ value: 'quality', label: 'לפי איכות' }, { value: 'target', label: 'עד גודל (KB)' }]} />
        <Seg label="הצד הארוך עד (פיקסלים)" small value={s.side} onChange={side => set({ side })} options={WIDTH_PRESETS.map(p => ({ value: p.w, label: p.label }))} />
        {s.mode === 'quality'
          ? <Range label="איכות" value={s.quality} min={10} max={100} onChange={quality => set({ quality })} show={v => `${v}%`} />
          : <label className="im-field">
            <span className="im-label">גודל מקסימלי</span>
            <span className="im-row"><input type="number" inputMode="numeric" className="im-num" min={10} max={20000} value={s.targetKB} onChange={e => set({ targetKB: Math.max(10, Number(e.target.value) || 10) })} /> KB</span>
            <span className="im-seg small">{[100, 200, 500, 1000].map(k => <button key={k} type="button" className="im-chip" aria-pressed={s.targetKB === k} onClick={() => set({ targetKB: k })}>{k}</button>)}</span>
          </label>}
        <FormatPick value={s.fmt} onChange={fmt => { fmtTouched.current = true; set({ fmt }) }} />
        {pngTarget && <p className="im-small">ב-PNG אין שליטה על איכות, לכן במצב "עד גודל" התמונה תצא JPG.</p>}
        {s.fmt === 'png' && !pngTarget && <p className="im-small">PNG שומר כל פיקסל ולכן כבד. לתמונות מצלמה עדיף JPG או WebP.</p>}
        <DownloadBar label="הורדת התמונה" disabled={!res} make={async () => ({ blob: res.blob, name: outName(item.name, 'קטן', res.ext) })} />
        {items.length > 1 && (
          <div className="im-field">
            <button type="button" className="im-btn go" disabled={batch && batch.done < batch.total} onClick={runAll}>
              🗂️ כיווץ כל {items.length} התמונות (ZIP)
            </button>
            {batch && <p className="im-small" role="status">{batch.done < batch.total ? `⏳ ${batch.done} מתוך ${batch.total}…` : `✅ מוכן: ${formatBytes(batch.results.reduce((a, r) => a + (r.before || 0), 0))} ← ${formatBytes(batch.results.reduce((a, r) => a + (r.after || 0), 0))}`}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
