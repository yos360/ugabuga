// English image tools: compress and resize, crop, collage, blur faces, text on a photo, HEIC to JPG and
// background removal. Everything runs in the browser; the decoding, encoding, ZIP and geometry helpers are
// shared with the Hebrew image studio (office/image/imageIO.js and imageLogic.js).
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ToolFrame from './ToolFrame'
import { Panel, Select, buttonClass, bigButtonClass, inputClass } from './ui'
import { decodeImage, heicToJpeg, newCanvas, freeImage, encodeCanvas, downloadBlob, downloadZip } from '../../office/image/imageIO'
import { isHeic, formatBytes, savedPercent, fitWithin, fitToSize, centeredCrop, moveRect, resizeRect, roundRect, normRect, hitRect, collageLayouts, cellRects, coverCrop, floodMask, applyMask, countMask, uniqueNames, COLLAGE_MIN, COLLAGE_MAX } from '../../office/image/imageLogic'

const IMAGE_TOOLS = [
  ['compress', '🗜️', 'Compress and resize'], ['crop', '✂️', 'Crop'], ['collage', '🧩', 'Collage'], ['blur', '🙈', 'Blur faces'],
  ['text', '🔤', 'Text on a photo'], ['heic', '📱', 'HEIC to JPG'], ['remove-bg', '🪄', 'Remove background'],
]
const PRIVATE = '🔒 Free, no sign-up, and your photos never leave your device: everything happens here in the browser.'
const stem = name => (String(name || '').split(/[\\/]/).pop().replace(/\.[a-z0-9]{1,5}$/i, '').replace(/[\\/:*?"<>|]+/g, '-').trim().slice(0, 80)) || 'image'
const errorText = e => e?.name === 'ChunkLoadError' || /dynamically imported|Failed to fetch/i.test(e?.message || '') ? 'The converter did not load (maybe the connection dropped). Refresh the page and try again.' : 'This file could not be opened as an image. Try a JPG or PNG.'

async function openImage(file, maxSide = 4096) {
  let blob = file
  if (isHeic(file)) blob = (await heicToJpeg(file)) || file
  return decodeImage(blob, maxSide)
}
const toCanvas = img => { const c = newCanvas(img.width, img.height); c.getContext('2d').drawImage(img, 0, 0); return c }
// Point on a canvas in its own pixels, from a pointer event.
const canvasPoint = (canvas, e) => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * canvas.width / r.width, y: (e.clientY - r.top) * canvas.height / r.height, k: canvas.width / r.width } }

function Picker({ onFiles, multiple = false, label }) {
  const input = useRef(null), [hover, setHover] = useState(false)
  return <div onDragOver={e => { e.preventDefault(); setHover(true) }} onDragLeave={() => setHover(false)} onDrop={e => { e.preventDefault(); setHover(false); if (e.dataTransfer.files.length) onFiles([...e.dataTransfer.files]) }}
    className={`rounded-2xl border-4 border-dashed p-8 text-center ${hover ? 'border-[#182139] bg-[var(--postit)]' : 'border-[var(--border)]'}`}>
    <input ref={input} type="file" accept="image/*,.heic,.heif" multiple={multiple} hidden onChange={e => { if (e.target.files.length) onFiles([...e.target.files]); e.target.value = '' }} />
    <button className={bigButtonClass} onClick={() => input.current.click()}>📂 {label || (multiple ? 'Choose photos' : 'Choose a photo')}</button>
    <p className="mt-2 text-sm">or drag and drop here · JPG, PNG, WebP, HEIC</p>
  </div>
}

// One image, loaded into a working canvas.
function useSingle() {
  const [img, setImg] = useState(null), [name, setName] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  async function load(files) {
    setBusy(true); setError('')
    try { const d = await openImage(files[0]); const c = toCanvas(d); freeImage(d); setImg(c); setName(stem(files[0].name)) } catch (e) { setError(errorText(e)) }
    setBusy(false)
  }
  return { img, setImg, name, error, busy, load, reset: () => setImg(null) }
}
async function save(canvas, name, suffix, fmt = 'jpg') {
  const { blob, ext } = await encodeCanvas(canvas, fmt, 0.92)
  downloadBlob(blob, `${name}-${suffix}.${ext}`)
}

// ── compress ──
function CompressTool() {
  const [files, setFiles] = useState([]), [width, setWidth] = useState(1600), [fmt, setFmt] = useState('jpg'), [mode, setMode] = useState('quality'), [quality, setQuality] = useState(0.75), [kb, setKb] = useState('300')
  const [results, setResults] = useState([]), [busy, setBusy] = useState(''), [error, setError] = useState('')
  async function run() {
    setBusy('Working…'); setError(''); const out = []
    for (let i = 0; i < files.length; i++) {
      setBusy(`Working… ${i + 1}/${files.length}`)
      try {
        const img = await openImage(files[i], 8192)
        const encodeAt = async scale => {
          const size = fitWithin(img.width, img.height, (width || img.width) * scale, Infinity)
          const c = newCanvas(size.width, size.height), ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(img, 0, 0, c.width, c.height)
          return { c, size }
        }
        let blob, ext, dims
        if (mode === 'size' && fmt !== 'png') {
          const target = Math.max(10, Number(kb) || 300) * 1024
          const best = await fitToSize(async ({ quality: q, scale }) => { const { c, size } = await encodeAt(scale); const r = await encodeCanvas(c, fmt, q); freeImage(c); return { ...r, size: r.size, dims: size } }, target)
          blob = best.result.blob; ext = best.result.ext; dims = best.result.dims
        } else {
          const { c, size } = await encodeAt(1); const r = await encodeCanvas(c, fmt, quality); freeImage(c); blob = r.blob; ext = r.ext; dims = size
        }
        freeImage(img)
        out.push({ name: `${stem(files[i].name)}-small.${ext}`, blob, before: files[i].size, after: blob.size, dims })
      } catch (e) { setError(`${files[i].name}: ${errorText(e)}`) }
    }
    const names = uniqueNames(out.map(o => o.name)); out.forEach((o, i) => { o.name = names[i] })
    setResults(out); setBusy('')
  }
  if (!files.length) return <Picker multiple onFiles={f => { setFiles(f); setResults([]) }} />
  return <div className="space-y-4">
    <p className="font-bold">{files.length} {files.length === 1 ? 'photo' : 'photos'} selected · {formatBytes(files.reduce((s, f) => s + f.size, 0))} <button className="underline" onClick={() => { setFiles([]); setResults([]) }}>Choose others</button></p>
    <div className="grid gap-3 sm:grid-cols-3">
      <Select label="Maximum width" value={width} onChange={e => setWidth(Number(e.target.value))} options={[[0, 'Keep the size'], [2048, '2048 px'], [1600, '1600 px'], [1280, '1280 px'], [1080, '1080 px'], [800, '800 px']]} />
      <Select label="Format" value={fmt} onChange={e => setFmt(e.target.value)} options={[['jpg', 'JPG'], ['webp', 'WebP'], ['png', 'PNG (no quality setting)']]} />
      <Select label="Aim for" value={mode} onChange={e => setMode(e.target.value)} options={[['quality', 'A quality level'], ['size', 'A file size in KB']]} />
    </div>
    {mode === 'quality' ? <label className="block font-bold">Quality: {Math.round(quality * 100)}%<input type="range" min="0.3" max="0.95" step="0.05" value={quality} onChange={e => setQuality(Number(e.target.value))} className="w-full" /></label>
      : <label className="block font-bold">Up to (KB)<input className={inputClass} type="number" min="10" value={kb} onChange={e => setKb(e.target.value)} /></label>}
    <button className={bigButtonClass} disabled={!!busy} onClick={run}>{busy || '🗜️ Compress'}</button>
    {error && <p role="alert">{error}</p>}
    {results.length > 0 && <div className="space-y-2" aria-live="polite">
      {results.map(r => <div key={r.name} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-[var(--border)] p-2"><span className="min-w-0 break-all">{r.name} · {r.dims.width}×{r.dims.height} · {formatBytes(r.before)} → <b>{formatBytes(r.after)}</b> ({savedPercent(r.before, r.after) >= 0 ? `${savedPercent(r.before, r.after)}% smaller` : 'bigger than before'})</span><button className={buttonClass} onClick={() => downloadBlob(r.blob, r.name)}>⬇️ Download</button></div>)}
      {results.length > 1 && <button className={buttonClass} onClick={() => downloadZip(results, 'photos-small.zip')}>⬇️ Download all as ZIP</button>}
    </div>}
  </div>
}

// ── HEIC ──
function HeicTool() {
  const [results, setResults] = useState([]), [busy, setBusy] = useState(''), [error, setError] = useState(''), [fmt, setFmt] = useState('jpg')
  async function run(files) {
    const out = []; setError('')
    for (let i = 0; i < files.length; i++) {
      setBusy(`Converting… ${i + 1}/${files.length}`)
      try { const img = await openImage(files[i], 8192); const c = toCanvas(img); freeImage(img); const r = await encodeCanvas(c, fmt, 0.92); freeImage(c); out.push({ name: `${stem(files[i].name)}.${r.ext}`, blob: r.blob }) } catch (e) { setError(`${files[i].name}: ${errorText(e)}`) }
    }
    const names = uniqueNames(out.map(o => o.name)); out.forEach((o, i) => { o.name = names[i] })
    setResults(out); setBusy('')
  }
  return <div className="space-y-4">
    <Select label="Convert to" value={fmt} onChange={e => setFmt(e.target.value)} options={[['jpg', 'JPG'], ['png', 'PNG']]} className="max-w-xs" />
    {busy ? <p className="text-xl font-bold" role="status">{busy}</p> : <Picker multiple label="Choose HEIC photos" onFiles={run} />}
    {error && <p role="alert">{error}</p>}
    {results.length > 0 && <div className="space-y-2">{results.map(r => <div key={r.name} className="flex items-center justify-between gap-2 rounded-xl border-2 border-[var(--border)] p-2"><span className="break-all">{r.name} · {formatBytes(r.blob.size)}</span><button className={buttonClass} onClick={() => downloadBlob(r.blob, r.name)}>⬇️ Download</button></div>)}
      {results.length > 1 && <button className={buttonClass} onClick={() => downloadZip(results, 'photos.zip')}>⬇️ Download all as ZIP</button>}</div>}
  </div>
}

// ── crop ──
const RATIOS = [['free', 'Free', null], ['1-1', 'Square 1:1', 1], ['4-5', 'Post 4:5', 4 / 5], ['9-16', 'Story 9:16', 9 / 16], ['16-9', 'Wide 16:9', 16 / 9], ['3-2', 'Photo 3:2', 3 / 2], ['a4', 'A4 portrait', 210 / 297], ['a4l', 'A4 landscape', 297 / 210]]
function CropTool() {
  const s = useSingle(), [ratioId, setRatioId] = useState('free'), [rect, setRect] = useState(null), view = useRef(null), drag = useRef(null)
  const ratio = RATIOS.find(r => r[0] === ratioId)[2]
  useEffect(() => { if (s.img) setRect(centeredCrop(s.img.width, s.img.height, ratio)) }, [s.img, ratio])
  useEffect(() => { const c = view.current; if (c && s.img) { c.width = s.img.width; c.height = s.img.height; c.getContext('2d').drawImage(s.img, 0, 0) } }, [s.img])
  if (!s.img) return <><Picker onFiles={s.load} />{s.busy && <p role="status">Opening…</p>}{s.error && <p role="alert">{s.error}</p>}</>
  const W = s.img.width, H = s.img.height
  const start = (e, handle) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); drag.current = { handle, x: e.clientX, y: e.clientY, r: rect, k: W / view.current.getBoundingClientRect().width } }
  const move = e => { const d = drag.current; if (!d) return; const dx = (e.clientX - d.x) * d.k, dy = (e.clientY - d.y) * d.k; setRect(d.handle === 'move' ? moveRect(d.r, dx, dy, W, H) : resizeRect(d.r, d.handle, dx, dy, ratio, W, H)) }
  const end = () => { drag.current = null }
  function rotate(dir) {
    const c = newCanvas(H, W), ctx = c.getContext('2d')
    ctx.translate(dir > 0 ? H : 0, dir > 0 ? 0 : W); ctx.rotate(dir * Math.PI / 2); ctx.drawImage(s.img, 0, 0)
    s.setImg(c)
  }
  function flip() { const c = newCanvas(W, H), ctx = c.getContext('2d'); ctx.translate(W, 0); ctx.scale(-1, 1); ctx.drawImage(s.img, 0, 0); s.setImg(c) }
  async function download(fmt) { const r = roundRect(rect, W, H), c = newCanvas(r.w, r.h); c.getContext('2d').drawImage(s.img, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h); await save(c, s.name, 'cropped', fmt); freeImage(c) }
  const pct = rect && { left: `${rect.x / W * 100}%`, top: `${rect.y / H * 100}%`, width: `${rect.w / W * 100}%`, height: `${rect.h / H * 100}%` }
  const handles = ratio ? ['nw', 'ne', 'sw', 'se'] : ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w']
  const at = (left, top) => ({ left: `${left}%`, top: `${top}%` })
  const pos = { nw: at(0, 0), ne: at(100, 0), sw: at(0, 100), se: at(100, 100), n: at(50, 0), s: at(50, 100), e: at(100, 50), w: at(0, 50) }
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-2">{RATIOS.map(([id, label]) => <button key={id} className="rounded-full border-2 border-[var(--border)] px-3 py-1 text-sm font-bold" aria-pressed={ratioId === id} style={ratioId === id ? { background: 'var(--postit)' } : undefined} onClick={() => setRatioId(id)}>{label}</button>)}</div>
    <div className="relative mx-auto w-fit max-w-full touch-none select-none" onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
      <canvas ref={view} className="block max-h-[70vh] max-w-full" />
      {rect && <div className="absolute cursor-move border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,.5)] outline outline-1 outline-black" style={pct} onPointerDown={e => start(e, 'move')}>
        {handles.map(h => <span key={h} onPointerDown={e => start(e, h)} className="absolute h-6 w-6 rounded-full border-2 border-black bg-white" style={{ ...pos[h], cursor: `${h}-resize`, transform: 'translate(-50%, -50%)' }} />)}
      </div>}
    </div>
    <p className="text-center text-sm">Drag the frame or its corners. {rect && `${Math.round(rect.w)} × ${Math.round(rect.h)} px`}</p>
    <div className="flex flex-wrap justify-center gap-2">
      <button className={buttonClass} onClick={() => rotate(-1)}>⟲ Rotate left</button><button className={buttonClass} onClick={() => rotate(1)}>⟳ Rotate right</button><button className={buttonClass} onClick={flip}>⇋ Flip</button>
      <button className={buttonClass} onClick={() => download('jpg')}>⬇️ Download JPG</button><button className={buttonClass} onClick={() => download('png')}>⬇️ PNG</button><button className={buttonClass} onClick={s.reset}>Another photo</button>
    </div>
  </div>
}

// ── collage ──
const COLLAGE_SIZES = [['square', 'Square (posts)', 2048, 2048], ['story', 'Story 9:16', 1080, 1920], ['a4', 'A4 portrait (print)', 2480, 3508], ['a4l', 'A4 landscape (print)', 3508, 2480]]
const LAYOUT_NAMES = { rows: 'Rows', cols: 'Columns', top: 'Big on top', side: 'Big on the side', middle: 'Big in the middle' }
function CollageTool() {
  const [imgs, setImgs] = useState([]), [layout, setLayout] = useState('rows'), [sizeId, setSizeId] = useState('square'), [gap, setGap] = useState(20), [bg, setBg] = useState('#ffffff'), [swap, setSwap] = useState(-1), [busy, setBusy] = useState(false), [error, setError] = useState('')
  const view = useRef(null)
  const layouts = imgs.length >= COLLAGE_MIN ? collageLayouts(imgs.length).map(l => ({ ...l, cells: l.cells.map(c => ({ ...c, x: 1 - c.x - c.w })) })) : []
  const current = layouts.find(l => l.id === layout) || layouts[0]
  const [, , W, H] = COLLAGE_SIZES.find(s => s[0] === sizeId)
  useEffect(() => {
    const c = view.current
    if (!c || !current) return
    c.width = W; c.height = H
    const ctx = c.getContext('2d'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H); ctx.imageSmoothingQuality = 'high'
    cellRects(current.cells, W, H, gap * W / 1000).forEach((r, i) => { const im = imgs[i]; if (!im) return; const k = coverCrop(im.width, im.height, r.w, r.h); ctx.drawImage(im, k.sx, k.sy, k.sw, k.sh, r.x, r.y, r.w, r.h); if (i === swap) { ctx.strokeStyle = '#ffca28'; ctx.lineWidth = W / 80; ctx.strokeRect(r.x, r.y, r.w, r.h) } })
  }, [imgs, current, W, H, gap, bg, swap])
  async function add(files) {
    setBusy(true); setError('')
    const out = []
    for (const f of files.slice(0, COLLAGE_MAX - imgs.length)) { try { out.push(await openImage(f, 2400)) } catch (e) { setError(`${f.name}: ${errorText(e)}`) } }
    setImgs(list => [...list, ...out].slice(0, COLLAGE_MAX)); setBusy(false)
  }
  function tap(e) {
    if (!current) return
    const p = canvasPoint(view.current, e), i = hitRect(cellRects(current.cells, W, H, 0), p.x, p.y)
    if (i < 0) return
    if (swap < 0) setSwap(i)
    else { if (i !== swap) setImgs(list => { const a = [...list];[a[i], a[swap]] = [a[swap], a[i]]; return a }); setSwap(-1) }
  }
  return <div className="space-y-4">
    {imgs.length < COLLAGE_MAX && <Picker multiple label={imgs.length ? 'Add more photos' : `Choose ${COLLAGE_MIN} to ${COLLAGE_MAX} photos`} onFiles={add} />}
    {busy && <p role="status">Opening…</p>}{error && <p role="alert">{error}</p>}
    {imgs.length === 1 && <p>Add at least one more photo.</p>}
    {current && <>
      <div className="grid gap-3 sm:grid-cols-4">
        <Select label="Layout" value={current.id} onChange={e => setLayout(e.target.value)} options={layouts.map(l => [l.id, LAYOUT_NAMES[l.id] || l.id])} />
        <Select label="Size" value={sizeId} onChange={e => setSizeId(e.target.value)} options={COLLAGE_SIZES.map(s => [s[0], s[1]])} />
        <label className="font-bold">Spacing<input type="range" min="0" max="60" value={gap} onChange={e => setGap(Number(e.target.value))} className="mt-3 w-full" /></label>
        <label className="font-bold">Background<input type="color" value={bg} onChange={e => setBg(e.target.value)} className={inputClass} /></label>
      </div>
      <canvas ref={view} onClick={tap} className="mx-auto block max-h-[70vh] max-w-full cursor-pointer rounded-xl border-2 border-[var(--border)]" />
      <p className="text-center text-sm">{swap >= 0 ? 'Now tap the photo to swap with.' : 'Tap one photo and then another to swap them.'}</p>
      <div className="flex flex-wrap justify-center gap-2"><button className={buttonClass} onClick={() => save(view.current, 'collage', sizeId, 'jpg')}>⬇️ Download JPG</button><button className={buttonClass} onClick={() => { imgs.forEach(freeImage); setImgs([]); setSwap(-1) }}>Start again</button></div>
    </>}
  </div>
}

// ── blur ──
function BlurTool() {
  const s = useSingle(), [rects, setRects] = useState([]), [mode, setMode] = useState('blur'), [strength, setStrength] = useState(14), [draft, setDraft] = useState(null), view = useRef(null), from = useRef(null)
  useEffect(() => {
    const c = view.current
    if (!c || !s.img) return
    c.width = s.img.width; c.height = s.img.height
    const ctx = c.getContext('2d'); ctx.drawImage(s.img, 0, 0)
    for (const r of [...rects, ...(draft ? [draft] : [])]) {
      const rr = roundRect(r, c.width, c.height); if (rr.w < 2 || rr.h < 2) continue
      const cell = Math.max(2, Math.round(Math.max(rr.w, rr.h) * strength / 200)), sw = Math.max(1, Math.round(rr.w / cell)), sh = Math.max(1, Math.round(rr.h / cell))
      const small = newCanvas(sw, sh), sctx = small.getContext('2d'); sctx.imageSmoothingQuality = 'high'; sctx.drawImage(s.img, rr.x, rr.y, rr.w, rr.h, 0, 0, sw, sh)
      ctx.imageSmoothingEnabled = mode === 'blur'; ctx.drawImage(small, 0, 0, sw, sh, rr.x, rr.y, rr.w, rr.h); ctx.imageSmoothingEnabled = true; freeImage(small)
      if (r === draft) { ctx.strokeStyle = '#ffca28'; ctx.lineWidth = Math.max(2, c.width / 300); ctx.strokeRect(rr.x, rr.y, rr.w, rr.h) }
    }
  }, [s.img, rects, draft, mode, strength])
  if (!s.img) return <><Picker onFiles={f => { setRects([]); s.load(f) }} />{s.busy && <p role="status">Opening…</p>}{s.error && <p role="alert">{s.error}</p>}</>
  const down = e => { e.currentTarget.setPointerCapture(e.pointerId); from.current = canvasPoint(view.current, e) }
  const moveP = e => { if (!from.current) return; const p = canvasPoint(view.current, e); setDraft(normRect(from.current.x, from.current.y, p.x, p.y)) }
  const up = () => { if (draft && draft.w > 4 && draft.h > 4) setRects(r => [...r, draft]); setDraft(null); from.current = null }
  return <div className="space-y-4">
    <div className="flex flex-wrap items-end gap-3">
      <Select label="Effect" value={mode} onChange={e => setMode(e.target.value)} options={[['blur', 'Blur'], ['pixel', 'Pixels (mosaic)']]} />
      <label className="font-bold">Strength<input type="range" min="6" max="30" value={strength} onChange={e => setStrength(Number(e.target.value))} className="mt-3 block w-40" /></label>
    </div>
    <canvas ref={view} onPointerDown={down} onPointerMove={moveP} onPointerUp={up} onPointerCancel={up} className="mx-auto block max-h-[70vh] max-w-full touch-none cursor-crosshair rounded-xl" />
    <p className="text-center text-sm">Drag a box over each face or detail you want to hide. {rects.length} {rects.length === 1 ? 'area' : 'areas'} hidden.</p>
    <div className="flex flex-wrap justify-center gap-2">
      <button className={buttonClass} disabled={!rects.length} onClick={() => setRects(r => r.slice(0, -1))}>↩ Undo</button>
      <button className={buttonClass} disabled={!rects.length} onClick={() => save(view.current, s.name, 'blurred', 'jpg')}>⬇️ Download JPG</button>
      <button className={buttonClass} onClick={() => { setRects([]); s.reset() }}>Another photo</button>
    </div>
  </div>
}

// ── text ──
const FONTS = [['Arial, sans-serif', 'Clean'], ['Georgia, serif', 'Classic'], ['Impact, "Arial Black", sans-serif', 'Bold poster'], ['"Comic Sans MS", "Comic Neue", cursive', 'Playful'], ['"Courier New", monospace', 'Typewriter']]
function TextTool() {
  const s = useSingle(), [items, setItems] = useState([]), [sel, setSel] = useState(-1), view = useRef(null), drag = useRef(null), boxes = useRef([])
  const item = items[sel]
  const update = patch => setItems(list => list.map((t, i) => i === sel ? { ...t, ...patch } : t))
  useEffect(() => {
    const c = view.current
    if (!c || !s.img) return
    c.width = s.img.width; c.height = s.img.height
    const ctx = c.getContext('2d'); ctx.drawImage(s.img, 0, 0); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'
    boxes.current = items.map((t, i) => {
      const px = t.size / 100 * c.width, x = t.x * c.width, y = t.y * c.height, rows = t.text.split('\n')
      ctx.font = `bold ${px}px ${t.font}`
      const w = Math.max(...rows.map(r => ctx.measureText(r).width), px), h = rows.length * px * 1.15
      rows.forEach((r, k) => { const ry = y - h / 2 + px * 1.15 * (k + .5); if (t.outline) { ctx.strokeStyle = t.color === '#000000' ? '#fff' : '#000'; ctx.lineWidth = px / 7; ctx.strokeText(r, x, ry) } ctx.fillStyle = t.color; ctx.fillText(r, x, ry) })
      if (i === sel) { ctx.setLineDash([px / 5, px / 8]); ctx.strokeStyle = '#ffca28'; ctx.lineWidth = Math.max(2, px / 20); ctx.strokeRect(x - w / 2 - px / 4, y - h / 2 - px / 6, w + px / 2, h + px / 3); ctx.setLineDash([]) }
      return { x: x - w / 2, y: y - h / 2, w, h }
    })
  }, [s.img, items, sel])
  if (!s.img) return <><Picker onFiles={f => { setItems([]); s.load(f) }} />{s.busy && <p role="status">Opening…</p>}{s.error && <p role="alert">{s.error}</p>}</>
  const add = () => { setItems(list => [...list, { text: 'Happy birthday!', x: .5, y: .15 + (list.length % 4) * .2, size: 9, color: '#ffffff', outline: true, font: FONTS[0][0] }]); setSel(items.length) }
  const down = e => { const p = canvasPoint(view.current, e), i = hitRect(boxes.current, p.x, p.y, 10 * p.k); setSel(i); if (i >= 0) { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { i, p, t: items[i] } } }
  const moveP = e => { const d = drag.current; if (!d) return; const p = canvasPoint(view.current, e); setItems(list => list.map((t, i) => i === d.i ? { ...t, x: Math.min(1, Math.max(0, d.t.x + (p.x - d.p.x) / view.current.width)), y: Math.min(1, Math.max(0, d.t.y + (p.y - d.p.y) / view.current.height)) } : t)) }
  const up = () => { drag.current = null }
  async function download() { const keep = sel; setSel(-1); await new Promise(r => setTimeout(r, 60)); await save(view.current, s.name, 'text', 'jpg'); setSel(keep) }
  return <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
    <div><canvas ref={view} onPointerDown={down} onPointerMove={moveP} onPointerUp={up} onPointerCancel={up} className="mx-auto block max-h-[70vh] max-w-full touch-none rounded-xl" /><p className="mt-1 text-center text-sm">Tap a text to select it, drag to move it.</p></div>
    <Panel label="Text settings">
      <button className={buttonClass} onClick={add}>+ Add text</button>
      {item ? <>
        <label className="block font-bold">Text<textarea dir="auto" className={inputClass} rows={2} maxLength={200} value={item.text} onChange={e => update({ text: e.target.value })} /></label>
        <Select label="Font" value={item.font} onChange={e => update({ font: e.target.value })} options={FONTS} />
        <label className="block font-bold">Size<input type="range" min="2" max="25" step=".5" value={item.size} onChange={e => update({ size: Number(e.target.value) })} className="w-full" /></label>
        <div className="flex items-center gap-3"><label className="font-bold">Color <input type="color" value={item.color} onChange={e => update({ color: e.target.value })} /></label><label className="flex items-center gap-1"><input type="checkbox" checked={item.outline} onChange={e => update({ outline: e.target.checked })} /> Outline</label></div>
        <button className={buttonClass} onClick={() => { setItems(list => list.filter((_, i) => i !== sel)); setSel(-1) }}>🗑 Delete this text</button>
      </> : <p className="text-sm">{items.length ? 'Tap a text on the photo to edit it.' : 'Add a text to begin.'}</p>}
      <button className={buttonClass} disabled={!items.length} onClick={download}>⬇️ Download JPG</button>
      <button className={buttonClass} onClick={() => { setItems([]); setSel(-1); s.reset() }}>Another photo</button>
    </Panel>
  </div>
}

// ── remove background ──
function RemoveBgTool() {
  const s = useSingle(), [tolerance, setTolerance] = useState(18), [everywhere, setEverywhere] = useState(false), [history, setHistory] = useState([]), [removed, setRemoved] = useState(0), view = useRef(null), data = useRef(null)
  useEffect(() => {
    const c = view.current
    if (!c || !s.img) return
    const fit = fitWithin(s.img.width, s.img.height, 2000, 2000)
    c.width = fit.width; c.height = fit.height
    const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(s.img, 0, 0, fit.width, fit.height)
    data.current = ctx.getImageData(0, 0, fit.width, fit.height); setHistory([]); setRemoved(0)
  }, [s.img])
  if (!s.img) return <><Picker onFiles={s.load} />{s.busy && <p role="status">Opening…</p>}{s.error && <p role="alert">{s.error}</p>}</>
  function tap(e) {
    const c = view.current, p = canvasPoint(c, e), img = data.current
    const before = new ImageData(new Uint8ClampedArray(img.data), img.width, img.height)
    const mask = floodMask(img.data, img.width, img.height, p.x, p.y, tolerance, !everywhere)
    applyMask(img.data, mask, img.width, img.height)
    c.getContext('2d').putImageData(img, 0, 0)
    setHistory(h => [...h.slice(-9), before]); setRemoved(n => n + countMask(mask))
  }
  function undo() { const last = history.at(-1); if (!last) return; data.current = last; view.current.getContext('2d').putImageData(last, 0, 0); setHistory(h => h.slice(0, -1)) }
  return <div className="space-y-4">
    <div className="flex flex-wrap items-end gap-4">
      <label className="font-bold">Color tolerance: {tolerance}<input type="range" min="2" max="60" value={tolerance} onChange={e => setTolerance(Number(e.target.value))} className="mt-2 block w-48" /></label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={everywhere} onChange={e => setEverywhere(e.target.checked)} /> Remove this color everywhere (not only the touching area)</label>
    </div>
    <canvas ref={view} onClick={tap} className="mx-auto block max-h-[70vh] max-w-full cursor-crosshair rounded-xl" style={{ backgroundImage: 'conic-gradient(#ddd 25%, #fff 0 50%, #ddd 0 75%, #fff 0)', backgroundSize: '20px 20px' }} />
    <p className="text-center text-sm">Tap the background to erase it. The checkered pattern shows transparent areas.{removed ? ` ${removed.toLocaleString('en-US')} pixels removed.` : ''}</p>
    <div className="flex flex-wrap justify-center gap-2">
      <button className={buttonClass} disabled={!history.length} onClick={undo}>↩ Undo</button>
      <button className={buttonClass} onClick={() => save(view.current, s.name, 'transparent', 'png')}>⬇️ Download PNG</button>
      <button className={buttonClass} onClick={s.reset}>Another photo</button>
    </div>
  </div>
}

const TOOL_COMPONENTS = { compress: CompressTool, crop: CropTool, collage: CollageTool, blur: BlurTool, text: TextTool, heic: HeicTool, 'remove-bg': RemoveBgTool }
const PAGES = {
  '': { h1: '🖼️ Free online photo editor', intro: 'Seven simple photo tools in one place: compress, crop, collage, blur faces, add text, convert HEIC and remove a plain background. Photos never leave your device.', faq: [
    { q: 'Are my photos uploaded anywhere?', a: 'No. All the editing happens in your browser, on your own device. Nothing is sent to a server, so it is safe for photos of children, documents and certificates.' },
    { q: 'Is it really free?', a: 'Yes. No sign-up, no watermark and no limit on the number of photos.' },
    { q: 'Does it work on a phone?', a: 'Yes. Every tool works with touch, and you can pick photos straight from your gallery.' },
  ] },
  compress: { h1: '🗜️ Compress and resize photos', intro: 'Make photos smaller for email, forms and messaging: choose a width, a quality or a target size in KB, and see the size before and after.', faq: [
    { q: 'How do I get a photo under 500 KB?', a: 'Choose "A file size in KB" and type 500. The tool looks for the highest quality that still fits, and shrinks the dimensions too if it has to.' },
    { q: 'Can I compress many photos at once?', a: 'Yes. Choose them all together and download them one by one or as a single ZIP file.' },
    { q: 'What is the best format?', a: 'JPG works everywhere. WebP is smaller at the same quality. PNG keeps transparency but is not compressed by quality.' },
  ] },
  crop: { h1: '✂️ Crop a photo online', intro: 'Crop by dragging, freely or at a fixed ratio (square, 4:5, story, 16:9, A4), and rotate or flip the photo.', faq: [
    { q: 'How do I crop a photo to a square?', a: 'Choose "Square 1:1", drag the frame to the right place and resize it from a corner. The shape stays square.' },
    { q: 'My photo is sideways. Can I fix it?', a: 'Yes. Use "Rotate left" or "Rotate right" before cropping.' },
  ] },
  collage: { h1: '🧩 Photo collage maker', intro: 'Combine 2 to 9 photos into one picture, with several layouts, spacing and a background color, sized for posts, stories or printing.', faq: [
    { q: 'How do I change the order of the photos?', a: 'Tap one photo and then another, and they swap places.' },
    { q: 'Can I print the collage?', a: 'Yes. Choose an A4 size: it comes out at print resolution (300 dpi).' },
  ] },
  blur: { h1: '🙈 Blur faces in a photo', intro: 'Hide faces, names or number plates before sharing a class photo: drag a box and choose blur or pixels.', faq: [
    { q: 'Can someone remove the blur?', a: 'No. The blur is burned into the new file; the hidden pixels are not stored in it.' },
    { q: 'Why blur children\'s faces?', a: 'Not every parent wants their child\'s face shared in a group chat or online. Teachers can hide those who did not agree and send one photo to everyone.' },
  ] },
  text: { h1: '🔤 Add text to a photo', intro: 'Write on a photo with a choice of fonts, sizes and colors, and an outline that keeps letters readable on any background.', faq: [
    { q: 'How do I move the text?', a: 'Tap the text on the photo and drag it. You can add several texts and edit each one.' },
    { q: 'Can I write in Hebrew?', a: 'Yes. Hebrew and other right-to-left text displays correctly.' },
  ] },
  heic: { h1: '📱 Convert HEIC to JPG', intro: 'Turn iPhone HEIC photos into JPG or PNG that open everywhere. Convert many at once and download them as a ZIP.', faq: [
    { q: 'What is HEIC?', a: 'The photo format iPhones use by default. It saves space, but many computers, websites and forms cannot open it.' },
    { q: 'Is the conversion done online?', a: 'It happens on your device. The converter downloads to your browser when you first need it, and your photos are never uploaded.' },
  ] },
  'remove-bg': { h1: '🪄 Remove a plain background', intro: 'Tap a white or single-color background to erase it and save a transparent PNG. Perfect for logos, drawings and products on a plain background.', faq: [
    { q: 'Does it work on any photo?', a: 'It works best when the background is one flat color, like a logo on white or a scanned drawing. It erases by color, so it does not recognize people.' },
    { q: 'Too much was erased. What do I do?', a: 'Press Undo, lower the color tolerance and tap again.' },
  ] },
}

export default function EnglishImage({ action = '' }) {
  const page = PAGES[action], Tool = TOOL_COMPONENTS[action]
  const path = action ? `/en/tools/image/${action}` : '/en/tools/image'
  return <ToolFrame path={path} h1={page.h1} intro={page.intro} width="max-w-5xl" faq={page.faq} bodyTitle="Questions and answers"
    related={[{ href: '/en/tools/pdf', label: 'PDF tools' }, { href: '/en/tools', label: 'all free tools' }]}>
    <p className="mb-4 text-center text-sm">{PRIVATE}</p>
    {Tool ? <Panel label={page.h1}><Tool key={action} /></Panel> : <div className="en-tool-cards">{IMAGE_TOOLS.map(([slug, emoji, label]) => <Link key={slug} to={`/en/tools/image/${slug}`} className="en-card"><span className="en-card-icon" aria-hidden="true">{emoji}</span><h2>{label}</h2><p>{PAGES[slug].intro}</p><span>Open the tool →</span></Link>)}</div>}
    <nav aria-label="More photo tools" className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
      {IMAGE_TOOLS.filter(([slug]) => slug !== action).map(([slug, emoji, label]) => <Link key={slug} to={`/en/tools/image/${slug}`} className="rounded-full border-2 border-[var(--border)] bg-[var(--card)] px-3 py-1 font-bold">{emoji} {label}</Link>)}
      {action && <Link to="/en/tools/image" className="rounded-full border-2 border-[var(--border)] bg-[var(--card)] px-3 py-1 font-bold">🖼️ All photo tools</Link>}
    </nav>
  </ToolFrame>
}
