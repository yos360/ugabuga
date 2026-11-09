// The photo studio editor, shared by the album designer and the collage maker.
// Photos stay in this browser (memory + IndexedDB autosave); export happens here too.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './studio-fonts.css'
import { renderPage } from './render'
import { styleById, STYLES, ALBUM_SIZES, COLLAGE_SIZES } from './styles'
import { newAlbum, newCollage, addSpread, relayoutPage, dressPage, uid, textItem, photoItem, COLLAGE_KINDS } from './doc'
import { addFiles, getPhoto, preview, saveDoc, loadDoc, restorePhotos, pickForAuto, forget } from './photoStore'
import { useCanvasEditor, startHandle } from './useCanvasEditor'
import { effectiveDpi, dpiLevel, freeSpot } from './geometry'
import Inspector, { Slider, EMOJI } from './Inspector'
import { exportPdf, exportZip, exportImage, printDpi } from './exportStudio'
import { downloadBlob, canShareFiles, shareBlob } from '../office/image/imageIO'

// sample photos in /public/studio-demo (generated for us), per event: how many
const DEMO = { wedding: 8, 'bar-mitzvah': 8, 'bat-mitzvah': 6, birthday: 5 }
const btn = 'min-h-[44px] rounded-xl border-2 border-slate-300 bg-white px-3 py-1.5 font-bold hover:border-slate-500 disabled:opacity-50'
const on = 'min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-amber-200 px-3 py-1.5 font-bold'
const card = 'rounded-2xl border-2 border-[var(--border)] bg-white p-4'
const clone = o => JSON.parse(JSON.stringify(o))

// A small picture of one spread for the strip under the editor (same renderer as the editor).
function PageThumb({ page, size, images, style, width }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const dpr = Math.min(2, window.devicePixelRatio || 1), k = (width / size.w) * dpr
    c.width = Math.round(size.w * k); c.height = Math.round(size.h * k)
    renderPage(c.getContext('2d'), page, size, { k, images, style, print: true })
  }, [page, size, images, style, width])
  return <canvas ref={ref} aria-hidden="true" className="block rounded" style={{ width, height: (width * size.h) / size.w }} />
}

export default function Studio({ product = 'album', event = 'wedding', collage = 'grid', text, storageKey }) {
  const key = storageKey || `${product}-${product === 'album' ? event : collage}`
  const [doc, setDoc] = useState(() => product === 'album' ? newAlbum({ event }) : newCollage({ kind: collage, text }))
  const [pageIdx, setPageIdx] = useState(0)
  const [selId, setSel] = useState(null)
  const [crop, setCrop] = useState(false)
  const [guides, setGuides] = useState(null)
  const [library, setLibrary] = useState([])
  const [images, setImages] = useState(() => new Map())
  const [busy, setBusy] = useState('')
  const [saved, setSaved] = useState(null)
  const [picker, setPicker] = useState(null) // callback waiting for a photo choice
  const [tab, setTab] = useState('style')
  const [order, setOrder] = useState('date')
  const [boxW, setBoxW] = useState(800)
  const hist = useRef({ past: [], future: [] })
  const docRef = useRef(doc); docRef.current = doc
  const canvas = useRef(null), wrap = useRef(null), fileIn = useRef(null)
  const page = doc.pages[Math.min(pageIdx, doc.pages.length - 1)]
  const style = styleById(doc.styleId)
  const sel = page.items.find(i => i.id === selId) || null

  // ---------- history ----------
  const commitDoc = useCallback(next => { hist.current.past.push(clone(docRef.current)); if (hist.current.past.length > 60) hist.current.past.shift(); hist.current.future = []; setDoc(next) }, [])
  const startRef = useRef(null)
  const live = useCallback((id, patch) => {
    if (!startRef.current) startRef.current = clone(docRef.current)
    setDoc(d => { const n = { ...d, pages: d.pages.map(p => p.items.some(i => i.id === id) ? { ...p, items: p.items.map(i => i.id === id ? { ...i, ...patch } : i) } : p) }; docRef.current = n; return n })
  }, [])
  const commit = useCallback(() => { if (startRef.current) { hist.current.past.push(startRef.current); hist.current.future = []; startRef.current = null } setDoc(d => ({ ...d })) }, [])
  const undo = () => { const h = hist.current; if (!h.past.length) return; h.future.push(clone(doc)); setDoc(h.past.pop()); setSel(null) }
  const redo = () => { const h = hist.current; if (!h.future.length) return; h.past.push(clone(doc)); setDoc(h.future.pop()); setSel(null) }
  const editPage = fn => { const d = clone(doc); fn(d.pages[pageIdx], d); commitDoc(d) }

  // ---------- demo: a finished example with sample photos until the visitor adds their own ----------
  const [demo, setDemo] = useState(false)
  const loadDemo = async () => {
    const names = product === 'album'
      ? Array.from({ length: DEMO[event] || DEMO.wedding }, (_, i) => `${DEMO[event] ? event : 'wedding'}-${i + 1}`)
      : Object.entries(DEMO).flatMap(([ev, n]) => Array.from({ length: n }, (_, i) => `${ev}-${i + 1}`))
    try {
      const t0 = Date.now()
      const files = await Promise.all(names.map((n, i) => fetch(`/studio-demo/${n}.webp`).then(r => { if (!r.ok) throw new Error(n); return r.blob() }).then(b => new File([b], `${n}.webp`, { type: 'image/webp', lastModified: t0 + i * 60000 }))))
      const ph = await addFiles(files, null, { persist: false })
      if (!ph.length || docRef.current.pages.some(p => p.items.some(i => i.photo || i.photos?.length))) return
      setLibrary(ph); setDemo(true)
      autoFill(ph, 'upload', true)
    } catch { /* no demo, the empty editor still works */ }
  }

  // ---------- autosave / resume ----------
  useEffect(() => { loadDoc(key).then(r => { if (r?.doc?.pages?.length) setSaved(r); else loadDemo() }) }, [key]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (saved || demo) return
    const t = setTimeout(() => saveDoc(key, { ...doc, library: library.map(p => p.id) }), 700)
    return () => clearTimeout(t)
  }, [doc, library, key, saved, demo])
  const resume = async () => {
    const d = saved.doc
    const ids = new Set(d.library || [])
    d.pages.forEach(p => p.items.forEach(i => { if (i.photo) ids.add(i.photo); if (i.photoFill) ids.add(i.photoFill); (i.photos || []).forEach(x => ids.add(x)) }))
    setBusy('טוענים את העבודה השמורה…')
    const ph = await restorePhotos([...ids])
    setLibrary(ph); setDoc(d); setPageIdx(0); setSaved(null); setBusy('')
  }
  const startOver = async () => { await forget(key); setSaved(null); loadDemo() }

  // ---------- previews of photos used anywhere ----------
  useEffect(() => {
    const ids = new Set(library.map(p => p.id))
    doc.pages.forEach(p => p.items.forEach(i => { if (i.photo) ids.add(i.photo); if (i.photoFill) ids.add(i.photoFill); (i.photos || []).forEach(x => ids.add(x)) }))
    let alive = true
    ;[...ids].filter(id => !images.has(id)).forEach(id => preview(id).then(img => { if (alive && img) setImages(m => new Map(m).set(id, img)) }))
    return () => { alive = false }
  }, [doc, library, images])

  // ---------- size of the canvas on screen ----------
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setBoxW(Math.max(260, e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const kCss = Math.min(boxW / doc.size.w, (typeof window !== 'undefined' ? window.innerHeight * 0.62 : 600) / doc.size.h)
  const dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)

  // ---------- draw ----------
  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const k = kCss * dpr
    c.width = Math.round(doc.size.w * k); c.height = Math.round(doc.size.h * k)
    const ctx = c.getContext('2d')
    if (doc.transparent) { // checkerboard so "transparent" is visible
      const s = 10 * dpr
      for (let y = 0; y < c.height; y += s) for (let x = 0; x < c.width; x += s) { ctx.fillStyle = ((x + y) / s) % 2 ? '#ffffff' : '#e9ecf2'; ctx.fillRect(x, y, s, s) }
    }
    renderPage(ctx, page, doc.size, { k, images, style, transparent: doc.transparent })
    // editor-only marks: safe margin, the fold, magnet lines, low-quality photos
    ctx.save()
    ctx.setLineDash([6 * dpr, 6 * dpr]); ctx.lineWidth = 1 * dpr
    if (doc.kind === 'album') {
      ctx.strokeStyle = 'rgba(220,38,38,0.35)'; ctx.strokeRect(12 * k, 12 * k, (doc.size.w / 2 - 24) * k, (doc.size.h - 24) * k); ctx.strokeRect((doc.size.w / 2 + 12) * k, 12 * k, (doc.size.w / 2 - 24) * k, (doc.size.h - 24) * k)
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.moveTo((doc.size.w / 2) * k, 0); ctx.lineTo((doc.size.w / 2) * k, c.height); ctx.stroke()
    }
    ctx.setLineDash([]); ctx.strokeStyle = '#ec4899'; ctx.lineWidth = 1.5 * dpr
    if (guides?.x != null) { ctx.beginPath(); ctx.moveTo(guides.x * k, 0); ctx.lineTo(guides.x * k, c.height); ctx.stroke() }
    if (guides?.y != null) { ctx.beginPath(); ctx.moveTo(0, guides.y * k); ctx.lineTo(c.width, guides.y * k); ctx.stroke() }
    for (const it of page.items) {
      if (demo || it.type !== 'photo' || !it.photo) continue // sample photos are small on purpose: no red dots
      const p = getPhoto(it.photo)
      if (p && dpiLevel(effectiveDpi(p.w, p.h, it.w, it.h, it.zoom)) === 'low') {
        ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc((it.x + 5) * k, (it.y + 5) * k, 3.2 * k, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#fff'; ctx.font = `800 ${4.2 * k}px Heebo`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', (it.x + 5) * k, (it.y + 5.2) * k)
      }
    }
    ctx.restore()
  }, [doc, page, images, style, kCss, dpr, guides, demo])

  // tapping an empty "+" frame: choose one of your photos, or upload if there are none yet
  const frameRef = useRef(null), libRef = useRef(null)
  function tapItem(id) {
    const it = docRef.current.pages.flatMap(p => p.items).find(i => i.id === id)
    if (!it || it.type !== 'photo' || it.photo) return
    frameRef.current = id
    if (!library.length) { fileIn.current.click(); return }
    setPicker(() => pid => { live(id, { photo: pid, zoom: 1, ox: 0, oy: 0 }); commit(); frameRef.current = null })
    libRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  const api = { getPage: () => docRef.current.pages[Math.min(pageIdx, docRef.current.pages.length - 1)], getDoc: () => docRef.current, kCss, selId, setSel: id => { setSel(id); if (!id) setCrop(false) }, live, commit, crop, setGuides, canvas: () => canvas.current, onTap: tapItem }
  useCanvasEditor(canvas, api)

  // keyboard: delete, arrows, undo
  useEffect(() => {
    const onKey = e => {
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return }
      if (!sel) return
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); action('del') }
      const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]
      if (m) { e.preventDefault(); const s = e.shiftKey ? 10 : 1; live(sel.id, { x: sel.x + m[0] * s, y: sel.y + m[1] * s }); commit() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // ---------- photos ----------
  const onFiles = async files => {
    if (!files?.length) return
    setBusy('קוראים את התמונות…')
    const added = await addFiles([...files], (i, n) => setBusy(`קוראים את התמונות… ${i}/${n}`))
    setBusy('')
    if (demo && added.length) {
      // the visitor's own photos replace the example completely
      setDemo(false); setLibrary(added); frameRef.current = null; setPicker(null)
      autoFill(added, order)
      return
    }
    const all = [...library, ...added]
    setLibrary(all)
    // first photos: fill the design automatically
    const used = doc.pages.some(p => p.items.some(i => i.photo || i.photoFill || i.photos?.length))
    const frame = frameRef.current
    frameRef.current = null
    if (frame && added.length && docRef.current.pages.some(p => p.items.some(i => i.id === frame && !i.photo))) {
      // uploaded from an empty frame: the photo goes into that frame, the rest wait in "your photos"
      live(frame, { photo: added[0].id, zoom: 1, ox: 0, oy: 0 }); commit(); setPicker(null)
    }
    // an album always re-flows with the new photos in their place in time (undo brings the old one back)
    else if ((!used || product === 'album') && added.length) autoFill(all)
    else if (added.length) {
      // fill empty frames on the current page / extend the mosaic
      editPage(p => {
        const q = [...added]
        for (const it of p.items) { if (it.type === 'photo' && !it.photo && q.length) it.photo = q.shift().id; if (it.type === 'text' && it.photoFill === null && doc.collage === 'photo-text' && q.length) it.photoFill = q.shift().id; if (it.type === 'mosaic') { it.photos = [...(it.photos || []), ...added.map(a => a.id)]; it.count = Math.max(it.count || 0, it.photos.length) } }
        if (q.length && doc.kind === 'collage' && doc.collage === 'grid') p.items.push(...q.map((a, i) => photoItem({ x: 10 + i * 8, y: 10 + i * 8, w: 60, h: 60 * (a.h / a.w) }, a, style)))
      })
    }
  }
  const autoFill = (all = library, ord = order, quiet = false) => {
    const { kept, blurry, dupes } = pickForAuto(all, ord)
    // in date order blurry photos keep their place in time only for mosaics; elsewhere they go last
    const use = ord === 'upload' || doc.kind === 'collage' ? kept : [...kept.filter(p => !blurry.includes(p)), ...blurry]
    const d = product === 'album'
      ? newAlbum({ event: doc.event, styleId: doc.styleId, sizeId: doc.sizeId, photos: use, perPage: doc.perPage || 3, mode: doc.mode, title: doc.pages[0].items.find(i => i.role === 'title')?.text, sub: doc.pages[0].items.find(i => i.role === 'sub')?.text })
      : newCollage({ kind: doc.collage, sizeId: doc.sizeId, styleId: doc.styleId, photos: use, text: doc.pages[0].items.find(i => i.type === 'mosaic' || (i.type === 'text' && !i.role))?.text })
    commitDoc(d); setPageIdx(0); setSel(null)
    if (quiet) return
    const how = ord === 'date' ? 'לפי תאריך הצילום' : 'לפי סדר ההעלאה'
    setDone(product === 'album'
      ? `✨ האלבום מוכן! סידרנו ${use.length} תמונות ב־${d.pages.length} כפולות (${d.pages.length * 2} עמודים), ${how}.`
      : `✨ הקולאז׳ מוכן עם ${use.length} תמונות.`)
    setNote(`${dupes ? `${dupes} תמונות כמעט כפולות לא נכנסו. ` : ''}${blurry.length && product === 'album' ? `${blurry.length} תמונות מטושטשות הועברו לסוף.` : ''}`)
  }
  const [done, setDone] = useState('')
  const [note, setNote] = useState('')
  const [more, setMore] = useState(false)
  const [allStyles, setAllStyles] = useState(false)
  const usedIds = useMemo(() => { const s = new Set(); doc.pages.forEach(p => p.items.forEach(i => { if (i.photo) s.add(i.photo); if (i.photoFill) s.add(i.photoFill) })); return s }, [doc])
  const tapLibrary = p => {
    if (picker) { picker(p.id); setPicker(null); return }
    if (sel?.type === 'photo') { live(sel.id, { photo: p.id, zoom: 1, ox: 0, oy: 0 }); commit(); return }
    if (sel?.type === 'text') { live(sel.id, { photoFill: p.id }); commit(); return }
    editPage(pg => { const w = Math.min(doc.size.w, doc.size.h) * 0.4, it = photoItem({ x: doc.size.w / 2 - w / 2, y: doc.size.h / 2 - (w * p.h) / p.w / 2, w, h: (w * p.h) / p.w }, p, style); pg.items.push(it); setSel(it.id) })
  }

  // ---------- item actions ----------
  function action(kind) {
    if (!sel) return
    if (kind === 'remove-bg') return removeBg()
    editPage(p => {
      const i = p.items.findIndex(x => x.id === sel.id)
      if (i < 0) return
      const it = p.items[i]
      if (kind === 'del') { p.items.splice(i, 1); setSel(null) }
      if (kind === 'dup') { const c = { ...clone(it), id: uid(), x: it.x + 6, y: it.y + 6, auto: false }; p.items.push(c); setSel(c.id) }
      if (kind === 'front') { p.items.splice(i, 1); p.items.push(it) }
      if (kind === 'back') { p.items.splice(i, 1); p.items.unshift(it) }
      if (kind === 'same-height') for (const o of p.items) if (o.type === 'photo' && o.id !== it.id) { const cy = o.y + o.h / 2, r = o.w / o.h; o.h = it.h; o.w = it.h * r; o.y = cy - o.h / 2 }
    })
  }
  async function removeBg() {
    if (!sel?.photo) return
    setBusy('מסירים רקע… (בפעם הראשונה נטען כלי קטן, בלי להעלות את התמונה)')
    try {
      const { removeBackground } = await import('./bgRemove')
      const p = getPhoto(sel.photo)
      const blob = await removeBackground(p.blob)
      const [np] = await addFiles([new File([blob], (p.name || 'photo').replace(/\.\w+$/, '') + '-cutout.png', { type: 'image/png' })])
      setLibrary(l => [...l, np])
      live(sel.id, { photo: np.id, border: 0, shadow: false, custom: true }); commit()
      setBusy('✨ הרקע הוסר. אפשר להזיז את הדמות לכל מקום.')
    } catch (e) { setBusy(`לא הצלחנו להסיר רקע בדפדפן הזה (${e.message || 'שגיאה'})`) }
    setTimeout(() => setBusy(''), 6000)
  }
  // new items go to an empty spot on the page (smaller if needed), never on top of what's there
  const spot = (p, w, h) => freeSpot(doc.size, p.items.filter(i => !i.hidden && i.type !== 'decor'), w, h, Math.min(doc.size.w, doc.size.h) * 0.03)
  const addText = (t = 'כותרת חדשה', o = {}) => editPage(p => { const box = spot(p, doc.size.w * 0.5, doc.size.h * 0.14), it = textItem({ text: t, font: style.title, color: style.text, size: Math.round(box.h * 0.43), ...box, ...o }); p.items.push(it); setSel(it.id) })
  const addEmoji = e => editPage(p => { const box = spot(p, doc.size.h * 0.12, doc.size.h * 0.12), it = textItem({ text: e, font: 'Heebo', size: box.h * 0.8, ...box }); p.items.push(it); setSel(it.id) })
  const addFrame = () => editPage(p => { const w = Math.min(doc.size.w, doc.size.h) * 0.35, it = photoItem(spot(p, w, w * 0.75), null, style); p.items.push(it); setSel(it.id) })
  const addMosaic = () => editPage(p => { const ids = [...library].sort((a, b) => a.date - b.date).map(x => x.id), s = Math.min(doc.size.w, doc.size.h) * 0.7; const it = { id: uid(), type: 'mosaic', shape: 'heart', text: '', font: 'Rubik', photos: ids, count: Math.max(ids.length, 30), gap: 1, radius: 8, fill: 0.5, tone: 'none', ...spot(p, s, s), rot: 0 }; p.items.push(it); setSel(it.id) })

  // ---------- page-level ----------
  const setStyle = id => { const st = styleById(id); const d = clone(doc); d.styleId = id; d.pages.forEach((p, i) => dressPage(p, d.kind === 'collage' && d.collage !== 'grid' ? { ...st, decor: [] } : st, d.size, i + 1, d.kind === 'album')); if (d.transparent) d.pages.forEach(p => { p.bg = null }); commitDoc(d) }
  const scaleAll = useRef(null)
  const onScaleAll = v => {
    if (!scaleAll.current) scaleAll.current = { base: clone(page.items), start: clone(doc) }
    const base = scaleAll.current.base
    setDoc(d => { const n = clone(d); n.pages[pageIdx].items = base.map(it => { if (it.type !== 'photo') return it; const cx = it.x + it.w / 2, cy = it.y + it.h / 2; return { ...it, w: it.w * v, h: it.h * v, x: cx - (it.w * v) / 2, y: cy - (it.h * v) / 2 } }); docRef.current = n; return n })
    setScaleV(v)
  }
  const [scaleV, setScaleV] = useState(1)
  const endScaleAll = () => { if (scaleAll.current) { hist.current.past.push(scaleAll.current.start); hist.current.future = []; scaleAll.current = null } setScaleV(1) }

  // ---------- export ----------
  const [exportMsg, setExportMsg] = useState('')
  const lowCount = useMemo(() => doc.pages.reduce((n, p) => n + p.items.filter(it => { const ph = it.type === 'photo' && it.photo && getPhoto(it.photo); return ph && dpiLevel(effectiveDpi(ph.w, ph.h, it.w, it.h, it.zoom)) === 'low' }).length, 0), [doc])
  const doExport = async fmt => {
    setSel(null)
    try {
      if (fmt === 'pdf' || fmt === 'zip') {
        const dpi = await (fmt === 'pdf' ? exportPdf : exportZip)(doc, (i, n) => setBusy(`מכינים קובץ להדפסה… כפולה ${i} מתוך ${n}`))
        setExportMsg(`הקובץ ירד ✔️ רזולוציה: ${dpi} DPI${dpi < 300 ? ' (המכשיר הזה מגביל את הגודל; במחשב יוצא 300 DPI)' : ''}.`)
      } else {
        setBusy('מכינים את התמונה…')
        const { blob, dpi } = await exportImage(doc, fmt, doc.sizeId === 'story' || doc.sizeId === 'sq' ? 200 : 300)
        const name = `collage-${doc.collage}.${fmt}`
        if (fmt !== 'png' && canShareFiles() && /Android|iPhone|iPad/.test(navigator.userAgent)) await shareBlob(blob, name); else downloadBlob(blob, name)
        setExportMsg(`התמונה ירדה ✔️ (${dpi} DPI)`)
      }
    } catch (e) { setExportMsg(`משהו השתבש בהכנת הקובץ: ${e.message || e}`) }
    setBusy('')
  }

  // ---------- UI ----------
  const overlay = sel && (() => {
    const w = sel.w * kCss, h = sel.h * kCss
    const hd = (kind, pos, cursor) => <span key={kind + pos} role="presentation" onPointerDown={e => startHandle(e, kind, sel, api)} className="absolute h-5 w-5 rounded-full border-2 border-white bg-pink-500 shadow" style={{ ...pos, cursor, touchAction: 'none' }} />
    return <div className="pointer-events-none absolute" style={{ left: sel.x * kCss, top: sel.y * kCss, width: w, height: h, transform: `rotate(${sel.rot || 0}deg)`, outline: `2px ${crop ? 'dashed' : 'solid'} #ec4899` }}>
      <div className="pointer-events-auto">
        {hd('size', { left: -10, top: -10 }, 'nwse-resize')}{hd('size', { right: -10, top: -10 }, 'nesw-resize')}
        {hd('size', { left: -10, bottom: -10 }, 'nesw-resize')}{hd('size', { right: -10, bottom: -10 }, 'nwse-resize')}
        <span role="presentation" onPointerDown={e => startHandle(e, 'rot', sel, api)} className="absolute flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-sky-500 text-sm text-white shadow" style={{ left: w / 2 - 14, top: -40, cursor: 'grab', touchAction: 'none' }}>⟳</span>
      </div>
    </div>
  })()

  const mine = demo ? 0 : library.length // the visitor's own photos (not the example)
  const styleList = product === 'album' ? STYLES[doc.event] || STYLES.wedding : Object.values(STYLES).flat()
  return <div className="studio" dir="rtl">
    {saved && <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-amber-400 bg-amber-50 p-4" role="status">
      <b>יש עבודה שמורה מ־{new Date(saved.at).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}.</b>
      <button type="button" className={on} onClick={resume}>להמשיך מאיפה שהפסקתי</button>
      <button type="button" className={btn} onClick={startOver}>להתחיל מחדש</button>
    </div>}

    {/* the three steps, always in view */}
    <ol className="m-0 mb-3 flex list-none flex-wrap gap-2 p-0 text-sm font-bold" aria-label="שלבים">
      {[['📷', 'מעלים תמונות', mine > 0], ['🎨', 'בוחרים סגנון', mine > 0], ['⬇️', product === 'album' ? 'מורידים PDF להדפסה' : 'מורידים', false]].map(([e, t, ok], i) =>
        <li key={t} className={`flex items-center gap-1.5 rounded-full border-2 px-3 py-1 ${ok ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-white'}`}><span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs text-white">{ok ? '✓' : i + 1}</span>{e} {t}</li>)}
    </ol>

    {/* step 1: photos */}
    <div className={`${card} mb-4 flex flex-wrap items-center gap-3`}>
      <input ref={fileIn} type="file" accept="image/*,.heic,.heif" multiple hidden onChange={e => { onFiles(e.target.files); e.target.value = '' }} />
      {demo && <div className="w-full rounded-xl border-2 border-amber-400 bg-amber-50 p-3" role="status">
        <p className="m-0 text-base font-black">👀 ככה זה נראה — {product === 'album' ? 'אלבום' : 'קולאז׳'} לדוגמה</p>
        <p className="m-0 mt-1 text-sm">{product === 'album' ? `${doc.pages.length} כפולות, מסודרות לבד. ` : ''}מעלים את התמונות שלכם — והן נכנסות במקום תמונות הדוגמה. אפשר גם לנסות כאן הכול: ללחוץ על תמונה, להחליף סגנון, לגרור.</p>
      </div>}
      <button type="button" className="min-h-[52px] rounded-xl bg-rose-500 px-5 py-2 text-lg font-bold text-white" onClick={() => fileIn.current.click()}>📷 {mine ? 'עוד תמונות' : 'העלאת התמונות שלכם'}</button>
      <span className="text-sm text-slate-600">{mine ? <><b>{mine} תמונות.</b> </> : product === 'album' ? <><b>בוחרים את כל התמונות בבת אחת — והאלבום מסתדר לבד.</b> </> : null}🔒 התמונות נשארות במכשיר שלכם, לא עולות לשום שרת.</span>
      {done && <div className="w-full rounded-xl border-2 border-emerald-400 bg-emerald-50 p-3" role="status">
        <p className="m-0 text-base font-black">{done}</p>
        <p className="m-0 mt-1 text-sm">{product === 'album' ? 'עוברים בין הכפולות ברצועה שמתחת לאלבום. רוצים לשנות תמונה? לוחצים עליה.' : 'רוצים לשנות? לוחצים על מה שרוצים לערוך.'} {note}</p>
      </div>}
      {busy && <span className="w-full rounded-lg bg-sky-50 p-2 text-sm font-bold" role="status">{busy}</span>}
    </div>

    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0">
        {/* toolbar */}
        <div className="mb-2 flex flex-wrap gap-1.5">
          <button type="button" className={btn} onClick={undo} disabled={!hist.current.past.length} aria-label="ביטול">↶ ביטול</button>
          <button type="button" className={btn} onClick={() => addText()}>➕ טקסט</button>
          <button type="button" className={tab === 'emoji' ? on : btn} onClick={() => setTab(tab === 'emoji' ? 'style' : 'emoji')}>😀 אימוג׳י</button>
          <button type="button" className={more ? on : btn} aria-expanded={more} onClick={() => setMore(!more)}>⋯ עוד</button>
          {more && <>
            <button type="button" className={btn} onClick={redo} disabled={!hist.current.future.length} aria-label="שחזור">↷ שחזור</button>
            <button type="button" className={btn} onClick={addFrame}>➕ מסגרת לתמונה</button>
            <button type="button" className={btn} onClick={addMosaic}>➕ צורה מתמונות (לב, מספר)</button>
          </>}
        </div>
        {tab === 'emoji' && <div className="mb-2 flex flex-wrap gap-1 rounded-xl bg-slate-50 p-2">{EMOJI.map(e => <button key={e} type="button" onClick={() => addEmoji(e)} className="h-11 w-11 rounded-lg text-2xl hover:bg-white" aria-label={`הוספת ${e}`}>{e}</button>)}</div>}
        {doc.kind === 'album' && <div className="mb-2 flex items-center justify-center gap-3" aria-label="מעבר בין כפולות">
          <button type="button" className={btn} disabled={pageIdx === 0} onClick={() => { setPageIdx(pageIdx - 1); setSel(null) }} aria-label="הכפולה הקודמת">→</button>
          <b className="text-lg">{pageIdx === 0 ? 'פתיחה' : `כפולה ${pageIdx}`} <span className="text-slate-500">({pageIdx + 1} מתוך {doc.pages.length})</span></b>
          <button type="button" className={btn} disabled={pageIdx >= doc.pages.length - 1} onClick={() => { setPageIdx(pageIdx + 1); setSel(null) }} aria-label="הכפולה הבאה">←</button>
        </div>}
        <div ref={wrap} className="relative w-full">
          <div className="relative mx-auto" style={{ width: doc.size.w * kCss, height: doc.size.h * kCss }}>
            {!library.length && !saved && <button type="button" onClick={() => fileIn.current.click()} className="absolute inset-0 z-10 m-auto flex h-fit w-fit flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-rose-400 bg-white/90 px-6 py-5 text-center shadow-lg">
              <span className="text-4xl" aria-hidden="true">📷</span>
              <b className="text-lg">מעלים תמונות</b>
              <span className="text-sm text-slate-600">{product === 'album' ? 'והאלבום מסתדר לבד לפי תאריך הצילום' : 'והן נכנסות לבד לצורה'}</span>
            </button>}
            <canvas ref={canvas} className="block rounded shadow-lg" style={{ width: doc.size.w * kCss, height: doc.size.h * kCss, touchAction: 'none', cursor: crop ? 'move' : 'default' }} aria-label="אזור העיצוב — לוחצים על תמונה או טקסט כדי לערוך" role="img" />
            {overlay}
          </div>
        </div>
        <p className="mt-2 text-center text-sm text-slate-600">👆 לוחצים על תמונה או טקסט כדי לשנות · גוררים כדי להזיז{doc.kind === 'album' ? ' · הקו האמצעי = הקפל של האלבום' : ''}</p>

        {/* the whole album at a glance */}
        {doc.kind === 'album' && <div className="mt-3 rounded-2xl bg-slate-50 p-3">
          <p className="m-0 mb-2 text-sm font-black">📖 כל האלבום — {doc.pages.length} כפולות ({doc.pages.length * 2} עמודים) · לוחצים כדי לעבור</p>
          <div className="flex gap-2 overflow-x-auto pb-2" aria-label="כפולות">
            {doc.pages.map((p, i) => <button key={p.id} type="button" onClick={() => { setPageIdx(i); setSel(null) }} aria-current={i === pageIdx} className={`shrink-0 rounded-lg border-2 bg-white p-1 text-xs font-bold ${i === pageIdx ? 'border-rose-500 ring-2 ring-rose-200' : 'border-slate-200'}`}>
              <PageThumb page={p} size={doc.size} images={images} style={style} width={150} />
              <span className="mt-1 block">{i === 0 ? 'פתיחה' : `כפולה ${i}`}</span>
            </button>)}
            <button type="button" className="shrink-0 rounded-lg border-2 border-dashed border-slate-300 bg-white px-4 text-sm font-bold" onClick={() => { const d = clone(doc); d.pages.push(addSpread(d)); commitDoc(d); setPageIdx(d.pages.length - 1) }}>➕ כפולה</button>
          </div>
          {more && <div className="flex flex-wrap gap-1.5">
            {doc.pages.length > 1 && <button type="button" className={btn} onClick={() => { const d = clone(doc); d.pages.splice(pageIdx, 1); commitDoc(d); setPageIdx(Math.max(0, pageIdx - 1)) }}>🗑️ מחיקת הכפולה הזו</button>}
            {pageIdx > 0 && <button type="button" className={btn} onClick={() => { const d = clone(doc); const [x] = d.pages.splice(pageIdx, 1); d.pages.splice(pageIdx - 1, 0, x); commitDoc(d); setPageIdx(pageIdx - 1) }}>→ להקדים את הכפולה</button>}
          </div>}
        </div>}

        {/* photo library */}
        {library.length > 0 && <div ref={libRef} className={`mt-3 rounded-xl ${picker ? 'border-2 border-rose-400 bg-rose-50 p-2' : ''}`}>
          {picker ? <div className="mb-2 flex flex-wrap items-center gap-2">
            <b className="text-base">👇 בוחרים תמונה למסגרת</b>
            <button type="button" className={btn} onClick={() => fileIn.current.click()}>📷 או להעלות תמונה חדשה</button>
            <button type="button" className={btn} onClick={() => { setPicker(null); frameRef.current = null }}>ביטול</button>
          </div> : <p className="m-0 mb-1 text-sm font-bold">התמונות שלכם — לוחצים כדי להוסיף או להחליף את התמונה שנבחרה</p>}
          <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto rounded-xl bg-slate-50 p-2">
            {library.map(p => <button key={p.id} type="button" onClick={() => tapLibrary(p)} className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 ${usedIds.has(p.id) ? 'border-emerald-500' : 'border-transparent'}`} aria-label={p.name}>
              <img src={p.thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>)}
          </div>
        </div>}
      </div>

      {/* side panel */}
      <aside className="space-y-4">
        {sel ? <div className={card}>
          <div className="mb-2 flex items-center justify-between"><h3 className="m-0 text-lg font-black">{{ photo: '🖼️ תמונה', text: '🔤 טקסט', decor: '✨ קישוט', mosaic: '🧩 פסיפס' }[sel.type]}</h3>
            <button type="button" className={btn} onClick={() => { setSel(null); setCrop(false) }}>סגירה ✕</button></div>
          {!demo && sel.type === 'photo' && sel.photo && (() => { const p = getPhoto(sel.photo), dp = p ? Math.round(effectiveDpi(p.w, p.h, sel.w, sel.h, sel.zoom)) : 0, lv = dpiLevel(dp); return p ? <p className={`m-0 mb-2 rounded-lg p-2 text-sm font-bold ${lv === 'good' ? 'bg-emerald-50 text-emerald-800' : lv === 'ok' ? 'bg-amber-50 text-amber-800' : 'bg-red-50 text-red-700'}`}>{lv === 'good' ? '🟢 איכות מצוינת להדפסה' : lv === 'ok' ? '🟡 איכות סבירה — עדיף להקטין קצת' : '🔴 איכות נמוכה להדפסה בגודל הזה — הקטינו את התמונה'} ({dp} DPI)</p> : null })()}
          <Inspector it={sel} set={patch => live(sel.id, patch)} done={commit} photos={library} onPickPhoto={cb => { if (!library.length) { fileIn.current.click(); return } setPicker(() => cb) }} onAction={action} crop={crop} setCrop={setCrop} />
        </div> : <div className={card}>
          <h3 className="m-0 mb-1 text-lg font-black">🎨 בוחרים סגנון</h3>
          <p className="m-0 mb-2 text-sm text-slate-600">לחיצה אחת — {product === 'album' ? 'כל האלבום' : 'הכול'} מתחלף.</p>
          <div className="grid grid-cols-2 gap-1.5">{(allStyles ? styleList : styleList.slice(0, 6)).map(s => <button key={s.id} type="button" onClick={() => setStyle(s.id)} className={`rounded-xl border-2 p-2 text-start text-sm font-bold ${doc.styleId === s.id ? 'border-rose-500 ring-2 ring-rose-200' : 'border-slate-200'}`} style={{ background: s.bg, color: s.text, fontFamily: `"${s.title}", Heebo` }}>
            <span className="mb-1 flex gap-1">{[s.primary, s.surface, s.accent].map((c, ci) => <i key={ci}className="inline-block h-3 w-3 rounded-full border border-black/10" style={{ background: c }} />)}</span>{s.name}
          </button>)}</div>
          {styleList.length > 6 && <button type="button" className={`${btn} mt-2 w-full`} onClick={() => setAllStyles(!allStyles)}>{allStyles ? 'פחות סגנונות' : `עוד ${styleList.length - 6} סגנונות`}</button>}
          <details className="mt-3 rounded-xl border-2 border-slate-200 p-2">
          <summary className="cursor-pointer text-sm font-bold">⚙️ עוד אפשרויות (סדר, גודל, רקע)</summary>
          <div className="mt-3 space-y-2">
            {library.length > 0 && <div className="flex flex-wrap items-center gap-1.5 text-sm font-bold">סדר התמונות:
              <button type="button" className={order === 'date' ? on : btn} aria-pressed={order === 'date'} onClick={() => { setOrder('date'); autoFill(library, 'date') }}>📅 לפי תאריך הצילום</button>
              <button type="button" className={order === 'upload' ? on : btn} aria-pressed={order === 'upload'} onClick={() => { setOrder('upload'); autoFill(library, 'upload') }}>⬆️ לפי סדר ההעלאה</button>
              <button type="button" className={btn} onClick={() => autoFill()}>🪄 לסדר הכול מחדש</button>
            </div>}
            {library.length > 0 && <Slider label="גודל כל התמונות ביחד" value={scaleV} min={0.6} max={1.4} step={0.01} onChange={onScaleAll} onDone={endScaleAll} fmt={v => `${Math.round(v * 100)}%`} />}
            <div className="flex flex-wrap gap-1.5">
              <button type="button" className={btn} onClick={() => editPage((p, d) => relayoutPage(d, p, 'justify', getPhoto))}>🧩 סידור בשורות</button>
              <button type="button" className={btn} onClick={() => editPage((p, d) => relayoutPage(d, p, 'grid', getPhoto))}>▦ סידור ברשת</button>
              <label className="flex items-center gap-2 text-sm font-bold">רקע <input type="color" value={page.bg || style.bg} onChange={e => { const v = e.target.value; setDoc(d => { const n = clone(d); n.pages[pageIdx].bg = v; return n }) }} className="h-9 w-12" /></label>
            </div>
            {product === 'album' && <>
              <label className="block text-sm font-bold">גודל האלבום
                <select value={doc.sizeId} onChange={e => { const d = newAlbum({ event: doc.event, styleId: doc.styleId, sizeId: e.target.value, photos: library.length ? pickForAuto(library).kept : [], perPage: doc.perPage, mode: doc.mode }); commitDoc(d); setPageIdx(0) }} className="mt-1 w-full rounded-lg border-2 border-slate-300 p-2">{ALBUM_SIZES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
              </label>
              <Slider label="בערך כמה תמונות בעמוד" value={doc.perPage || 3} min={1} max={8} onChange={v => setDoc(d => ({ ...d, perPage: v }))} onDone={() => library.length && autoFill()} />
            </>}
            {product === 'collage' && <>
              <div className="flex flex-wrap gap-1.5">{COLLAGE_KINDS.map(c => <button key={c.id} type="button" className={doc.collage === c.id ? on : btn} onClick={() => { commitDoc(newCollage({ kind: c.id, styleId: doc.styleId, photos: library })); setSel(null) }}>{c.emoji} {c.label}</button>)}</div>
              <label className="block text-sm font-bold">גודל
                <select value={doc.sizeId} onChange={e => commitDoc(newCollage({ kind: doc.collage, sizeId: e.target.value, styleId: doc.styleId, photos: library, text: page.items.find(i => i.type === 'mosaic' || (i.type === 'text' && !i.role))?.text }))} className="mt-1 w-full rounded-lg border-2 border-slate-300 p-2">{COLLAGE_SIZES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
              </label>
              <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={!!doc.transparent} onChange={e => commitDoc({ ...clone(doc), transparent: e.target.checked })} className="h-5 w-5" /> רקע שקוף (PNG)</label>
            </>}
          </div>
          </details>
        </div>}

        {/* export */}
        <div className={card}>
          <h3 className="m-0 mb-2 text-lg font-black">⬇️ {product === 'album' ? 'מורידים קובץ להדפסה' : 'מורידים'}</h3>
          {lowCount > 0 && !demo && <p className="m-0 mb-2 rounded-lg bg-red-50 p-2 text-sm font-bold text-red-700">🔴 {lowCount} תמונות באיכות נמוכה לגודל שלהן (מסומנות בנקודה אדומה).</p>}
          {product === 'album' ? <>
            <div className="grid gap-2">
              <button type="button" disabled={!!busy} onClick={() => doExport('pdf')} className="min-h-[52px] rounded-xl bg-rose-500 px-4 py-2 text-lg font-bold text-white disabled:opacity-60">📄 PDF להדפסה ({doc.pages.length} כפולות)</button>
              <button type="button" disabled={!!busy} onClick={() => doExport('zip')} className={btn}>🗂️ JPG לכל כפולה (ZIP למעבדה)</button>
            </div>
            <details className="mt-2 text-sm"><summary className="cursor-pointer font-bold">⚙️ הגדרות למעבדה</summary>
              <label className="mt-2 block font-bold">שוליים לחיתוך (בליד)
                <select value={doc.bleed} onChange={e => setDoc(d => ({ ...d, bleed: +e.target.value }))} className="mt-1 w-full rounded-lg border-2 border-slate-300 p-2"><option value={0}>בלי</option><option value={1}>1 מ״מ (אלבום רגיל)</option><option value={3}>3 מ״מ (לייפלאט / דפוס)</option></select>
              </label>
              <p className="m-0 mt-2 text-xs text-slate-500">{printDpi(doc.size, doc.bleed)} DPI · sRGB · הקבצים ממוספרים 001, 002… כמו שמעבדות האלבומים מבקשות.</p>
            </details>
          </> : <div className="grid gap-2">
            {!doc.transparent && <button type="button" disabled={!!busy} onClick={() => doExport('jpg')} className="min-h-[52px] rounded-xl bg-rose-500 px-4 py-2 text-lg font-bold text-white disabled:opacity-60">⬇️ JPG באיכות גבוהה</button>}
            <button type="button" disabled={!!busy} onClick={() => doExport('png')} className={doc.transparent ? 'min-h-[52px] rounded-xl bg-rose-500 px-4 py-2 text-lg font-bold text-white' : btn}>⬇️ PNG{doc.transparent ? ' שקוף' : ''}</button>
          </div>}
          {exportMsg && <p className="m-0 mt-2 text-sm font-bold" role="status">{exportMsg}</p>}
        </div>
      </aside>
    </div>
  </div>
}
