// /tools/pdf and /tools/pdf/:action — one studio for every everyday PDF job, all inside the browser.
// pdf.js + pdf-lib arrive only when the first file is added (pdfEngine.js), so the page itself stays light.
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import NotFound from '../../pages/NotFound'
import SignPanel from './SignPanel'
import { ACTIONS, COMPRESS, parseRanges, describePages, formatBytes, savedPercent, baseName, outName, fileKind, moveItem, makeZip } from './pdfLogic'
import '../../excel/excel.css'
import './pdf.css'

const Page = ({ children }) => <div className="mx-auto max-w-5xl px-4 py-6 buga-fade-in" dir="rtl">{children}</div>

const TOOLS = [
  ['merge', '📄', 'PDF אחד'],
  ['split', '✂️', 'פיצול'],
  ['compress', '🗜️', 'דחיסה'],
  ['images', '🖼️', 'לתמונות'],
  ['sign', '✍️', 'חתימה וטקסט'],
  ['text', '📝', 'PDF לוורד'],
  ['fromword', '📃', 'וורד ל-PDF'],
]

const FAQ = [
  { q: 'הקבצים שלי עולים לאתר?', a: 'לא. הכל קורה בתוך הדפדפן שלכם, גם במחשב וגם בטלפון. הקבצים לא נשלחים לשום שרת, ואחרי שסוגרים את הדף לא נשאר מהם כלום. אפשר אפילו לנתק את האינטרנט אחרי שהדף נטען.' },
  { q: 'איך מחברים כמה קבצי PDF לקובץ אחד?', a: 'בוחרים את כל הקבצים יחד (או מוסיפים עוד אחר כך), מסדרים את העמודים בגרירה ולוחצים "הורדה כ-PDF אחד". אפשר לערבב באותו קובץ גם תמונות וצילומים מהטלפון.' },
  { q: 'איך הופכים תמונה או צילום ל-PDF?', a: 'בוחרים תמונות מהמחשב או מגלריית הטלפון, והן הופכות לעמודים. בוחרים אם כל תמונה תהיה על דף A4 או בגודל שלה, ומורידים. תמונות שצולמו הפוך מסובבים בכפתור ⟳.' },
  { q: 'איך מקטינים PDF כדי לשלוח במייל או בוואטסאפ?', a: 'בלשונית "דחיסה" בוחרים רמה ולוחצים. רואים מיד את הגודל לפני ואחרי. דחיסה חזקה מתאימה לסריקות ולצילומים כבדים. שימו לב: בקובץ הדחוס הטקסט הופך לתמונה, כך שאי אפשר לסמן אותו.' },
  { q: 'איך חותמים על PDF בלי להדפיס?', a: 'בלשונית "חתימה וטקסט" מציירים חתימה באצבע או בעכבר (או מקלידים שם ותאריך), גוררים למקום ומצמידים. אפשר להצמיד כמה פעמים, בכמה עמודים.' },
  { q: 'איך ממירים PDF לוורד?', a: 'בלשונית "PDF לוורד" יש שתי דרכים. "טקסט לעריכה" בונה מחדש פסקאות, כותרות ורשימות, כולל עברית מימין לשמאל, ומתאים כשרוצים לשנות את התוכן. "שמירת העיצוב" שם כל עמוד כתמונה בתוך קובץ Word: נראה בדיוק כמו המקור, אבל אי אפשר לערוך אותו. טבלאות ועימוד מסובך לא תמיד עוברים אחד לאחד.' },
  { q: 'איך ממירים וורד ל-PDF?', a: 'בוחרים קובץ Word ‏(docx), והוא הופך לעמודי PDF כאן על המסך. אפשר לסדר, לצרף לקבצים אחרים ולהוריד. ב-PDF שיורד כל עמוד הוא תמונה; לטקסט חד שאפשר לסמן לוחצים "הדפסה" ובוחרים "שמירה כ-PDF". תיבות טקסט צפות ועימוד מורכב עלולים לצאת קצת אחרת מבוורד. קבצי doc ישנים צריך קודם לשמור כ-docx.' },
  { q: 'הקובץ נעול בסיסמה. מה עושים?', a: 'מקלידים את הסיסמה כשהאתר שואל. את הקובץ שיוצא שומרים בלי סיסמה, והעמודים שלו נשמרים כתמונות. בלי הסיסמה אי אפשר לפתוח אותו, וזה בכוונה.' },
]

let nextId = 1
// `t` translates a Hebrew UI string; /en/tools/pdf passes its own and `embedded` (the page chrome is English there).
const same = s => s

function download(data, name, type) {
  const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data], { type }))
  const a = document.createElement('a')
  a.href = url; a.download = name; a.rel = 'noopener'
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

function errorText(e, name, t = same) {
  const who = name ? `"${name}": ` : ''
  if (e?.code === 'password') return who + t('הקובץ נעול בסיסמה, ובלי הסיסמה אי אפשר לפתוח אותו.')
  if (e?.code === 'badpassword') return who + t('הסיסמה לא נכונה.')
  if (e?.code === 'broken') return who + t('הקובץ פגום או שהוא לא באמת PDF. נסו לשמור אותו שוב כ-PDF ולהוסיף מחדש.')
  if (e?.code === 'image') return who + t('לא הצלחנו לפתוח את התמונה. תמונות HEIC מאייפון: שלחו לעצמכם כ-JPG או צלמו מסך, ונסו שוב.')
  if (e?.code === 'memory' || e?.name === 'RangeError') return t('הקובץ גדול מדי לזיכרון של המכשיר. נסו פחות עמודים בכל פעם, או במחשב.')
  if (e?.name === 'ChunkLoadError' || /dynamically imported|Failed to fetch/i.test(e?.message || '')) return t('הכלי לא נטען (אולי האינטרנט התנתק). רעננו את הדף ונסו שוב.')
  if (e?.code === 'docx') return who + t('לא הצלחנו לקרוא את קובץ הוורד. פתחו אותו בוורד, שמרו שוב כ-docx (או ישר כ-PDF) ונסו שוב.')
  return who + t('משהו השתבש. נסו שוב, ואם זה חוזר, נסו קובץ אחר.')
}

// ── one page card in the grid ──
function PageCard({ item, n, total, selected, dragging, multiSrc, srcName, onToggle, onRotate, onDelete, onMove, onDragStart, t = same }) {
  // In the English (left-to-right) grid the "earlier" arrow points left.
  const [earlier, later] = t === same ? ['→', '←'] : ['←', '→']
  return (
    <li data-pid={item.id} className={'pdf-card' + (selected ? ' sel' : '') + (dragging ? ' drag' : '')}>
      <div className="pdf-card-top">
        <button type="button" className="pdf-handle" aria-label={t(`גרירת עמוד ${n} למקום אחר`)} title={t('גררו כדי לשנות את הסדר')} onPointerDown={e => onDragStart(e, item.id)}>⠿</button>
        <span className="pdf-num">{n}</span>
        <input type="checkbox" checked={selected} onChange={() => onToggle(item.id)} aria-label={t(`סימון עמוד ${n}`)} />
      </div>
      <button type="button" className="pdf-thumb" onClick={() => onToggle(item.id)} aria-label={t(`עמוד ${n}${selected ? ', מסומן' : ''}`)}>
        {item.thumb ? <img src={item.thumb} alt="" draggable="false" style={{ transform: `rotate(${item.rot}deg)${item.rot % 180 ? ' scale(0.83)' : ''}` }} /> : <span className="pdf-wait" aria-hidden="true" />}
        {item.overlays.length > 0 && <span className="pdf-badge" title={t('יש חתימה או טקסט בעמוד')}>✍️</span>}
      </button>
      {multiSrc && <small className="pdf-src" title={srcName}>{srcName}</small>}
      <div className="pdf-card-tools">
        <button type="button" disabled={n === 1} onClick={() => onMove(item.id, -1)} aria-label={t(`העברת עמוד ${n} לפני הקודם`)} title={t('מקום אחד קדימה')}>{earlier}</button>
        <button type="button" onClick={() => onRotate([item.id])} aria-label={t(`סיבוב עמוד ${n}`)} title={t('סיבוב')}>⟳</button>
        <button type="button" onClick={() => onDelete([item.id])} aria-label={t(`מחיקת עמוד ${n}`)} title={t('מחיקה')}>🗑</button>
        <button type="button" disabled={n === total} onClick={() => onMove(item.id, 1)} aria-label={t(`העברת עמוד ${n} אחרי הבא`)} title={t('מקום אחד אחורה')}>{later}</button>
      </div>
    </li>
  )
}

export default function PdfStudio({ t = same, embedded = false }) {
  const { action } = useParams()
  const meta = ACTIONS[action ?? '']
  const [tool, setTool] = useState(meta?.tool || 'merge')
  const [items, setItems] = useState([]) // { id, src, index, rot, thumb, overlays }
  const [sel, setSel] = useState(() => new Set())
  const [busy, setBusy] = useState(null) // { msg, i, n }
  const [errors, setErrors] = useState([])
  const [done, setDone] = useState('')
  const [hover, setHover] = useState(false)
  const [dragId, setDragId] = useState(null)
  const [fit, setFit] = useState('a4')
  const [level, setLevel] = useState('normal')
  const [splitMode, setSplitMode] = useState('each')
  const [ranges, setRanges] = useState('')
  const [imgFmt, setImgFmt] = useState('jpg')
  const [squeeze, setSqueeze] = useState(null) // { before, after, bytes, name }
  const [text, setText] = useState(null)
  const [wordMode, setWordMode] = useState('text')
  const [noText, setNoText] = useState(false)
  const [signTarget, setSignTarget] = useState(null)
  const sources = useRef(new Map())
  const engineRef = useRef(null)
  const [engine, setEngine] = useState(null)
  const itemsRef = useRef(items)
  itemsRef.current = items
  const thumbing = useRef(false)
  const fileInput = useRef(null)

  useEffect(() => { if (meta) setTool(meta.tool) }, [meta])
  // results describe the pages at that moment; any change clears them
  const sig = items.map(p => `${p.id}:${p.rot}:${p.overlays.length}`).join() + '|' + [...sel].join()
  useEffect(() => { setSqueeze(null); setText(null); setNoText(false) }, [sig, level])
  useEffect(() => () => {
    for (const s of sources.current.values()) engineRef.current?.closeSource(s)
    for (const it of itemsRef.current) if (it.thumb && sources.current.get(it.src)?.kind === 'pdf') URL.revokeObjectURL(it.thumb)
  }, [])

  const getEngine = useCallback(async () => {
    if (!engineRef.current) { engineRef.current = await import('./pdfEngine'); setEngine(engineRef.current) }
    return engineRef.current
  }, [])

  // fill in missing thumbnails one by one (keeps memory low on big files)
  const pumpThumbs = useCallback(async () => {
    if (thumbing.current) return
    thumbing.current = true
    try {
      const eng = engineRef.current
      for (;;) {
        const it = itemsRef.current.find(p => !p.thumb && !p.thumbFail)
        if (!it) break
        const src = sources.current.get(it.src)
        let patch
        try { patch = { thumb: (await eng.renderThumb(src, it.index)).url } } catch { patch = { thumbFail: true } }
        setItems(list => list.map(p => p.id === it.id ? { ...p, ...patch } : p))
        itemsRef.current = itemsRef.current.map(p => p.id === it.id ? { ...p, ...patch } : p)
      }
    } finally { thumbing.current = false }
  }, [])

  const addFiles = useCallback(async fileList => {
    const files = [...(fileList || [])]
    if (!files.length) return
    setErrors([]); setDone('')
    setBusy({ msg: t('פותחים את הקבצים…'), i: 0, n: files.length })
    const errs = [], added = [], notes = []
    let eng
    try { eng = await getEngine() } catch (e) { setBusy(null); setErrors([errorText(e, undefined, t)]); return }
    for (let f = 0; f < files.length; f++) {
      const file = files[f]
      setBusy({ msg: t(`פותחים את "${file.name}"…`), i: f, n: files.length })
      const kind = fileKind(file)
      try {
        if (kind === 'docx') {
          // Word → PDF pages, which then behave like any other PDF here
          const we = await import('./wordEngine')
          const res = await we.docxToPdf(file, (i, n) => setBusy({ msg: t(`ממירים את "${file.name}" ל-PDF…`), i, n }))
          const opened = await eng.openPdf(res.bytes)
          const id = nextId++
          sources.current.set(id, { id, kind: 'pdf', name: baseName(file.name) + '.pdf', size: res.bytes.length, bytes: res.bytes, pdf: opened.pdf, raster: false, word: { name: file.name, html: res.html } })
          for (let i = 0; i < opened.numPages; i++) added.push({ id: nextId++, src: id, index: i, rot: 0, thumb: null, overlays: [] })
          notes.push(t(`✅ "${file.name}" הפך ל-${opened.numPages === 1 ? 'עמוד אחד' : `${opened.numPages} עמודים`}. בדקו שהכל נראה טוב ולחצו "הורדה כ-PDF אחד".`))
        } else if (kind === 'pdf') {
          const bytes = new Uint8Array(await file.arrayBuffer())
          let opened, password
          for (;;) {
            try { opened = await eng.openPdf(bytes, password); break }
            catch (e) {
              if (e.code !== 'password' && e.code !== 'badpassword') throw e
              const p = window.prompt(t(`${e.code === 'badpassword' ? 'הסיסמה לא נכונה. ' : ''}הקובץ "${file.name}" נעול. מה הסיסמה?`))
              if (p === null) throw e
              password = p
            }
          }
          const id = nextId++
          sources.current.set(id, { id, kind: 'pdf', name: file.name, size: file.size, bytes, pdf: opened.pdf, raster: !!password })
          for (let i = 0; i < opened.numPages; i++) added.push({ id: nextId++, src: id, index: i, rot: 0, thumb: null, overlays: [] })
        } else if (kind === 'image') {
          const img = await eng.readImage(file)
          const id = nextId++
          sources.current.set(id, { id, kind: 'image', name: file.name, size: file.size, ...img })
          added.push({ id: nextId++, src: id, index: 0, rot: 0, thumb: img.url, overlays: [] })
        } else if (kind === 'word') {
          errs.push(t(`"${file.name}" הוא קובץ וורד ישן. פתחו אותו בוורד ושמרו כ-docx (קובץ ← שמירה בשם), ואז הוסיפו כאן.`))
        } else {
          errs.push(t(`"${file.name}" הוא לא PDF, תמונה או Word, אז דילגנו עליו.`))
        }
      } catch (e) { errs.push(errorText(e, file.name, t)) }
    }
    setItems(list => [...list, ...added])
    setErrors(errs)
    setBusy(null)
    if (notes.length) { setDone(notes.join(' ')); setTool(t => t === 'text' || t === 'fromword' ? 'merge' : t) }
  }, [getEngine, t])

  useEffect(() => { if (engine && items.some(p => !p.thumb && !p.thumbFail)) pumpThumbs() }, [items, engine, pumpThumbs])

  // ── page edits ──
  const toggle = id => setSel(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const rotate = ids => setItems(list => list.map(p => ids.includes(p.id) ? { ...p, rot: (p.rot + 90) % 360 } : p))
  const remove = ids => {
    setItems(list => list.filter(p => !ids.includes(p.id)))
    setSel(s => { const n = new Set(s); ids.forEach(i => n.delete(i)); return n })
  }
  const move = (id, d) => setItems(list => { const i = list.findIndex(p => p.id === id); return moveItem(list, i, i + d) })
  const reset = () => {
    if (items.length && !window.confirm(t('להתחיל מחדש? כל העמודים יוסרו מהמסך.'))) return
    for (const s of sources.current.values()) engine?.closeSource(s)
    sources.current.clear()
    setItems([]); setSel(new Set()); setErrors([]); setDone(''); setSignTarget(null)
  }

  // drag to reorder: pointer events, so it works with a finger too
  const onDragStart = (e, id) => {
    e.preventDefault()
    setDragId(id)
    const moveTo = ev => {
      const el = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('[data-pid]')
      if (ev.clientY < 70) window.scrollBy(0, -14)
      else if (ev.clientY > window.innerHeight - 70) window.scrollBy(0, 14)
      if (!el) return
      const over = +el.dataset.pid
      if (over === id) return
      setItems(list => moveItem(list, list.findIndex(p => p.id === id), list.findIndex(p => p.id === over)))
    }
    const end = () => { setDragId(null); window.removeEventListener('pointermove', moveTo); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end) }
    window.addEventListener('pointermove', moveTo)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
  }

  // ── what the action works on ──
  const targets = useMemo(() => sel.size ? items.filter(p => sel.has(p.id)) : items, [items, sel])
  const srcNames = useMemo(() => [...new Set(targets.map(p => p.src))].map(id => sources.current.get(id)), [targets])
  const base = srcNames.length === 1 ? baseName(srcNames[0].name) : srcNames.every(s => s?.kind === 'image') ? t('תמונות') : t('מסמך מאוחד')
  const multiSrc = sources.current.size > 1

  const run = async (label, job) => {
    setErrors([]); setDone('')
    setBusy({ msg: label, i: 0, n: 0 })
    try { await job((i, n) => setBusy({ msg: label, i, n })) }
    catch (e) { console.error(e); setErrors([errorText(e, undefined, t)]) }
    finally { setBusy(null) }
  }

  const doMerge = suffix => run(t('מכינים את ה-PDF…'), async prog => {
    const eng = await getEngine()
    const bytes = await eng.buildPdf(targets, sources.current, { fit, onProgress: prog })
    const name = outName(base, suffix ?? (srcNames.length === 1 && srcNames[0].kind === 'pdf' ? t('ערוך') : ''), 'pdf')
    download(bytes, name, 'application/pdf')
    setDone(t(`✅ ירד: ${name} (${formatBytes(bytes.length)})`))
  })

  const split = useMemo(() => {
    if (splitMode === 'each') return { groups: targets.map((_, i) => [i + 1]), error: '' }
    return parseRanges(ranges, targets.length)
  }, [splitMode, ranges, targets])

  const doSplit = () => run(t('מפצלים…'), async prog => {
    const eng = await getEngine()
    const files = []
    for (let g = 0; g < split.groups.length; g++) {
      prog(g, split.groups.length)
      const nums = split.groups[g]
      const bytes = await eng.buildPdf(nums.map(k => targets[k - 1]), sources.current, { fit })
      files.push({ name: outName(base, nums.length === 1 ? t(`עמוד ${nums[0]}`) : t(`עמודים ${describePages(nums)}`), 'pdf'), data: bytes })
    }
    if (files.length === 1) { download(files[0].data, files[0].name, 'application/pdf'); setDone(t(`✅ ירד: ${files[0].name}`)); return }
    const zip = makeZip(files)
    const name = outName(base, t(`${files.length} חלקים`), 'zip')
    download(zip, name, 'application/zip')
    setDone(t(`✅ ירד קובץ ZIP עם ${files.length} קבצי PDF (${formatBytes(zip.length)}). פותחים אותו בלחיצה כפולה.`))
  })

  const doCompress = () => run(t('דוחסים…'), async prog => {
    const eng = await getEngine()
    const before = await eng.buildPdf(targets, sources.current, { fit })
    const after = await eng.buildPdf(targets, sources.current, { fit, compress: level, onProgress: prog })
    setSqueeze({ before: before.length, after: after.length, bytes: after, orig: before, name: outName(base, t('דחוס'), 'pdf') })
  })

  const doImages = () => run(t('הופכים לתמונות…'), async prog => {
    const eng = await getEngine()
    const datas = await eng.pagesToImages(targets, sources.current, imgFmt, prog)
    const files = datas.map((im, i) => ({ name: outName(base, t(`עמוד ${items.indexOf(targets[i]) + 1}`), imgFmt), data: im.data }))
    const type = imgFmt === 'png' ? 'image/png' : 'image/jpeg'
    if (files.length === 1) { download(files[0].data, files[0].name, type); setDone(t(`✅ ירדה תמונה: ${files[0].name}`)); return }
    const zip = makeZip(files)
    const name = outName(base, t('תמונות'), 'zip')
    download(zip, name, 'application/zip')
    setDone(t(`✅ ירד קובץ ZIP עם ${files.length} תמונות (${formatBytes(zip.length)}).`))
  })

  const doText = () => run(t('מוציאים טקסט…'), async prog => {
    const eng = await getEngine()
    setText(await eng.extractText(targets, sources.current, prog))
  })

  // PDF → .docx: editable text (rebuilt paragraphs) or every page as a picture
  const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  const doWord = mode => run(t('מכינים קובץ Word…'), async prog => {
    const eng = await getEngine()
    const W = await import('./wordLogic')
    let bytes
    if (mode === 'layout') {
      bytes = W.docxFromImages(await eng.pagesToImages(targets, sources.current, 'jpg', prog, 150 / 72))
    } else {
      const pages = W.paragraphsFromLayout(await eng.extractLayout(targets, sources.current, prog))
      if (!pages.some(p => p.length)) { setNoText(true); return }
      bytes = W.docxFromParagraphs(pages)
    }
    const name = outName(base, '', 'docx')
    download(bytes, name, DOCX)
    setDone(t(`✅ ירד: ${name} (${formatBytes(bytes.length)}). פותחים בוורד, ב-Google Docs או ב-LibreOffice.`))
  })

  const printWord = () => {
    const w = srcNames.find(s => s?.word)
    if (!w) return
    import('./wordEngine').then(we => { if (!we.printDocx(w.word.html, baseName(w.word.name))) setErrors([t('הדפדפן חסם חלון חדש. אשרו חלונות קופצים לאתר ונסו שוב.')]) })
  }

  const copyText = async () => {
    try { await navigator.clipboard.writeText(text); setDone(t('✅ הטקסט הועתק. עכשיו מדביקים בוורד (Ctrl+V).')) }
    catch { setDone(t('סמנו את הטקסט בתיבה והעתיקו (Ctrl+C).')) }
  }

  const addOverlay = (id, o) => setItems(list => list.map(p => p.id === id ? { ...p, overlays: [...p.overlays, { ...o, id: nextId++ }] } : p))
  const clearOverlays = id => setItems(list => list.map(p => p.id === id ? { ...p, overlays: [] } : p))

  if (!meta) return <NotFound />
  const path = action ? `/tools/pdf/${action}` : '/tools/pdf'
  const hasImages = targets.some(p => sources.current.get(p.src)?.kind === 'image')
  const hasPdf = targets.some(p => sources.current.get(p.src)?.kind === 'pdf')
  const wordSrc = srcNames.some(s => s?.word)
  const scope = sel.size
    ? <p className="pdf-scope">{t(sel.size === 1 ? 'רק העמוד שסימנתם' : `רק ${sel.size} העמודים שסימנתם`)} · <button type="button" className="pdf-link" onClick={() => setSel(new Set())}>{t('לכל העמודים')}</button></p>
    : items.length > 1 ? <p className="pdf-scope">{t(`כל ${items.length} העמודים, לפי הסדר שעל המסך. רוצים רק חלק? סמנו אותם.`)}</p> : null
  const isBusy = !!busy
  const crumbs = [{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, ...(action ? [{ label: 'כלי PDF', href: '/tools/pdf' }, { label: meta.h1 }] : [{ label: 'כלי PDF' }])]

  const Wrap = embedded ? Fragment : Page
  return <Wrap>
    {!embedded && <>
      <SEO title={meta.title} description={meta.desc} path={path} structuredData={action ? null : faqSchema(FAQ)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl sm:text-4xl text-center mb-1"><span aria-hidden="true">{meta.emoji} </span>{meta.h1}</h1>
    </>}
    <p className="pdf-safe"><span aria-hidden="true">🔒</span> {t('חינם, בלי הרשמה, והקבצים לא יוצאים מהמחשב: הכל קורה כאן בדפדפן.')}</p>

    <div className={'pdf-studio' + (hover ? ' hover' : '')}
      onDragOver={e => { if ([...e.dataTransfer.types].includes('Files')) { e.preventDefault(); setHover(true) } }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setHover(false) }}
      onDrop={e => { if (e.dataTransfer.files.length) { e.preventDefault(); setHover(false); addFiles(e.dataTransfer.files) } }}>

      <input ref={fileInput} type="file" accept="application/pdf,.pdf,image/*,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" multiple hidden onChange={e => { addFiles(e.target.files); e.target.value = '' }} />

      {!items.length ? (
        <button type="button" className="pdf-drop" onClick={() => fileInput.current?.click()} disabled={isBusy}>
          <span className="pdf-drop-icon" aria-hidden="true">📂</span>
          <b>{t('בחירת קבצים')}</b>
          <span>{t(tool === 'fromword' ? 'או גוררים לכאן קובץ Word ‏(docx). אפשר גם כמה, ולצרף PDF ותמונות.' : 'או גוררים לכאן. PDF, תמונות וקובצי Word, כמה שרוצים, גם מגלריית הטלפון.')}</span>
        </button>
      ) : null}

      <div className="pdf-tools" role="tablist" aria-label={t('מה עושים עם הקבצים?')}>
        {TOOLS.map(([k, e, l]) => (
          <button key={k} type="button" role="tab" aria-selected={tool === k} className="pdf-tool" onClick={() => { setTool(k); setDone('') }}>
            <span aria-hidden="true">{e}</span> {t(l)}
          </button>
        ))}
      </div>

      {busy && <div className="pdf-busy" role="status" aria-live="polite">
        <span>⏳ {busy.msg}{busy.n > 1 ? t(` ${Math.min(busy.i + 1, busy.n)} מתוך ${busy.n}`) : ''}</span>
        <progress max={busy.n || 1} value={busy.n ? busy.i : undefined} />
      </div>}
      {errors.map((e, i) => <p key={i} className="pdf-err" role="alert">⚠️ {e}</p>)}

      {items.length > 0 && <section className="xl-box pdf-panel" aria-label={t('הפעולה')}>
        {tool === 'merge' && <>
          {scope}
          {hasImages && <fieldset className="pdf-row"><legend className="sr-only">{t('גודל עמוד לתמונות')}</legend>
            <span>{t('תמונות על דף:')}</span>
            <label className="pdf-chip"><input type="radio" name="fit" checked={fit === 'a4'} onChange={() => setFit('a4')} /> A4</label>
            <label className="pdf-chip"><input type="radio" name="fit" checked={fit === 'image'} onChange={() => setFit('image')} /> {t('בגודל התמונה')}</label>
          </fieldset>}
          <button type="button" className="xl-btn pdf-main" disabled={isBusy || !targets.length} onClick={() => doMerge()}>{t('⬇️ הורדה כ-PDF אחד')}</button>
          {wordSrc && <>
            <button type="button" className="xl-btn alt" onClick={printWord}>{t('🖨️ הדפסה או שמירה כ-PDF עם טקסט חד')}</button>
            <p className="pdf-hint">{t('ב-PDF שיורד מוורד כל עמוד הוא תמונה. רוצים טקסט שאפשר לסמן? לחצו הדפסה ובחרו "שמירה כ-PDF". תיבות טקסט צפות, עמודות ועימוד מורכב עלולים לצאת קצת אחרת מבוורד.')}</p>
          </>}
        </>}

        {tool === 'split' && <>
          {scope}
          <div className="pdf-row">
            <label className="pdf-chip"><input type="radio" name="split" checked={splitMode === 'each'} onChange={() => setSplitMode('each')} /> {t('כל עמוד לקובץ נפרד')}</label>
            <label className="pdf-chip"><input type="radio" name="split" checked={splitMode === 'ranges'} onChange={() => setSplitMode('ranges')} /> {t('לפי עמודים שאבחר')}</label>
          </div>
          {splitMode === 'ranges' && <div>
            <input className="pdf-input" dir="ltr" inputMode="numeric" value={ranges} onChange={e => setRanges(e.target.value)} placeholder="1-3, 5, 8-10" aria-label={t('אילו עמודים בכל קובץ')} />
            <p className="pdf-hint">{t('כל פסיק = קובץ נפרד. המספרים הם המספרים שעל העמודים כאן.')}</p>
          </div>}
          {split.error && ranges ? <p className="pdf-err">{t(split.error)}</p>
            : split.groups.length > 0 && <p className="pdf-hint">{t(`יווצרו ${split.groups.length} קבצים${split.groups.length > 1 ? ', בתוך קובץ ZIP אחד' : ''}:`)} {split.groups.slice(0, 8).map(g => describePages(g)).join(' · ')}{split.groups.length > 8 ? ' …' : ''}</p>}
          <button type="button" className="xl-btn pdf-main" disabled={isBusy || !!split.error || !split.groups.length} onClick={doSplit}>{t('✂️ פיצול והורדה')}</button>
        </>}

        {tool === 'compress' && <>
          {scope}
          <div className="pdf-row" role="radiogroup" aria-label={t('רמת דחיסה')}>
            {Object.entries(COMPRESS).map(([k, c]) => (
              <label key={k} className="pdf-chip"><input type="radio" name="level" checked={level === k} onChange={() => setLevel(k)} /> {t(c.label)} <small>({t(c.hint)})</small></label>
            ))}
          </div>
          {!squeeze && <button type="button" className="xl-btn pdf-main" disabled={isBusy} onClick={doCompress}>{t('🗜️ דחיסה')}</button>}
          {squeeze && (savedPercent(squeeze.before, squeeze.after) >= 3 ? <div className="pdf-ok" role="status">
            <span className="pdf-sizes"><s>{formatBytes(squeeze.before)}</s> {t === same ? '←' : '→'} <b>{formatBytes(squeeze.after)}</b> · {t(`קטן ב-${savedPercent(squeeze.before, squeeze.after)}%`)}</span>
            <button type="button" className="xl-btn go" onClick={() => download(squeeze.bytes, squeeze.name, 'application/pdf')}>{t('⬇️ הורדת הקובץ הדחוס')}</button>
          </div> : <div className="pdf-ok" role="status">
            <span>{t(`הקובץ כבר קטן (${formatBytes(squeeze.before)}), ודחיסה ${COMPRESS[level].label} לא מקטינה אותו.${level !== 'strong' ? ' נסו דחיסה חזקה.' : ''}`)}</span>
            <button type="button" className="xl-btn alt" onClick={() => download(squeeze.orig, outName(base, '', 'pdf'), 'application/pdf')}>{t('⬇️ הורדה בלי דחיסה')}</button>
          </div>)}
          {hasPdf && <p className="pdf-hint">{t('בקובץ הדחוס כל עמוד נשמר כתמונה: נראה אותו דבר, אבל אי אפשר לסמן בו טקסט.')}</p>}
        </>}

        {tool === 'images' && <>
          {scope}
          <div className="pdf-row">
            <span>{t('סוג:')}</span>
            <label className="pdf-chip"><input type="radio" name="fmt" checked={imgFmt === 'jpg'} onChange={() => setImgFmt('jpg')} /> JPG <small>{t('(קטן, לשליחה)')}</small></label>
            <label className="pdf-chip"><input type="radio" name="fmt" checked={imgFmt === 'png'} onChange={() => setImgFmt('png')} /> PNG <small>{t('(חד, לטקסט)')}</small></label>
          </div>
          <button type="button" className="xl-btn pdf-main" disabled={isBusy || !targets.length} onClick={doImages}>🖼️ {t(targets.length > 1 ? `הורדת ${targets.length} תמונות (ZIP)` : 'הורדת התמונה')}</button>
        </>}

        {tool === 'sign' && engine && <SignPanel items={items} engine={engine} sources={sources.current} targetId={signTarget} busy={isBusy}
          onAdd={addOverlay} onRemove={clearOverlays} onDownload={() => doMerge(t('חתום'))} t={t} />}

        {tool === 'text' && <>
          {scope}
          <div className="pdf-row" role="radiogroup" aria-label={t('איזה קובץ Word')}>
            <label className="pdf-chip"><input type="radio" name="wmode" checked={wordMode === 'text'} onChange={() => setWordMode('text')} /> {t('טקסט לעריכה')} <small>{t('(מומלץ)')}</small></label>
            <label className="pdf-chip"><input type="radio" name="wmode" checked={wordMode === 'layout'} onChange={() => setWordMode('layout')} /> {t('שמירת העיצוב')} <small>{t('(כתמונה)')}</small></label>
          </div>
          <p className="pdf-hint">{t(wordMode === 'text'
            ? 'בונים מחדש פסקאות, כותרות ורשימות, עברית מימין לשמאל. העיצוב המדויק, טבלאות ותמונות לא עוברים.'
            : 'כל עמוד נכנס לקובץ Word כתמונה: נראה בדיוק כמו המקור, אבל אי אפשר לערוך את הטקסט.')}</p>
          <button type="button" className="xl-btn pdf-main" disabled={isBusy || !targets.length || (wordMode === 'text' && !hasPdf)} onClick={() => doWord(wordMode)}>{t('⬇️ הורדה כקובץ Word')}</button>
          {noText && <div className="pdf-ok pdf-warn" role="status">
            <span>{t('לא נמצא טקסט ב-PDF: כנראה הוא סרוק או מצולם, והמילים הן חלק מהתמונה (לזה צריך זיהוי טקסט, OCR). אפשר לשמור את העיצוב.')}</span>
            <button type="button" className="xl-btn" disabled={isBusy} onClick={() => { setWordMode('layout'); setNoText(false); doWord('layout') }}>{t('⬇️ Word עם העמודים כתמונה')}</button>
          </div>}
          {text === null ? <button type="button" className="pdf-link" disabled={isBusy || !hasPdf} onClick={doText}>{t('או רק להעתיק את הטקסט')}</button>
            : text ? <>
              <textarea className="pdf-text" dir="auto" readOnly value={text} aria-label={t('הטקסט מה-PDF')} />
              <div className="pdf-row">
                <button type="button" className="xl-btn" onClick={copyText}>{t('📋 העתקה')}</button>
                <button type="button" className="xl-btn alt" onClick={() => download(new Blob(['﻿' + text], { type: 'text/plain;charset=utf-8' }), outName(base, t('טקסט'), 'txt'))}>{t('⬇️ קובץ טקסט')}</button>
              </div>
            </> : <p className="pdf-err">{t('לא נמצא טקסט. כנראה זה מסמך סרוק או צילום, ובו המילים הן חלק מהתמונה. לזה צריך תוכנת זיהוי טקסט (OCR).')}</p>}
          {!hasPdf && <p className="pdf-hint">{t('בתמונות אין טקסט לעריכה. הוסיפו קובץ PDF, או בחרו "שמירת העיצוב".')}</p>}
        </>}

        {tool === 'fromword' && <>
          <p className="pdf-hint">{t('קובץ Word ‏(docx) שמוסיפים הופך לעמודי PDF כאן על המסך. משם מורידים, מצרפים ל-PDF אחר או חותמים.')}</p>
          <button type="button" className="xl-btn pdf-main" disabled={isBusy} onClick={() => fileInput.current?.click()}>{t('📃 בחירת קובץ Word')}</button>
        </>}

        {done && <p className="pdf-done" role="status">{done}</p>}
      </section>}

      {items.length > 0 && <>
        <div className="pdf-bulk">
          <button type="button" className="xl-btn" onClick={() => fileInput.current?.click()} disabled={isBusy}>{t('＋ עוד קבצים')}</button>
          <button type="button" className="xl-btn alt" onClick={() => setSel(sel.size === items.length ? new Set() : new Set(items.map(p => p.id)))}>{t(sel.size === items.length ? 'ביטול סימון' : 'סימון הכל')}</button>
          {sel.size > 0 && <>
            <button type="button" className="xl-btn alt" onClick={() => rotate([...sel])}>{t(`⟳ סיבוב (${sel.size})`)}</button>
            <button type="button" className="xl-btn alt" onClick={() => remove([...sel])}>{t(`🗑 מחיקה (${sel.size})`)}</button>
            {tool === 'sign' && sel.size === 1 && <button type="button" className="xl-btn alt" onClick={() => setSignTarget([...sel][0])}>{t('✍️ לחתום על העמוד הזה')}</button>}
          </>}
          <button type="button" className="xl-btn alt" onClick={reset}>{t('🧹 מההתחלה')}</button>
        </div>
        <p className="pdf-hint">{t(`${items.length} עמודים · גוררים ב-⠿ כדי לשנות סדר · לוחצים על עמוד כדי לסמן אותו`)}</p>
        <ol className="pdf-grid">
          {items.map((it, i) => <PageCard key={it.id} item={it} n={i + 1} total={items.length} selected={sel.has(it.id)} dragging={dragId === it.id}
            multiSrc={multiSrc} srcName={sources.current.get(it.src)?.name}
            onToggle={toggle} onRotate={rotate} onDelete={remove} onMove={move} onDragStart={onDragStart} t={t} />)}
        </ol>
      </>}
      {hover && <div className="pdf-hover" aria-hidden="true">{t('שחררו כאן ⬇️')}</div>}
    </div>

    {!embedded && <nav className="pdf-more" aria-label="עוד כלי PDF">
      {Object.entries(ACTIONS).filter(([k]) => k && k !== action).map(([k, a]) => <Link key={k} to={`/tools/pdf/${k}`}>{a.emoji} {a.h1}</Link>)}
      {action && <Link to="/tools/pdf">📄 כל כלי ה-PDF</Link>}
    </nav>}

    {!embedded && <div className="mt-10"><SeoBody
      paragraphs={[
        'כלי PDF אחד שעושה את מה שצריך ביום-יום: לחבר כמה קבצים לאחד, להפוך צילומים מהטלפון ל-PDF, לפצל קובץ ארוך, להקטין קובץ כבד לשליחה במייל, לחתום על טופס בלי מדפסת, לסובב עמוד הפוך ולמחוק עמודים מיותרים. בלי הרשמה, בלי סימן מים ובלי הגבלה על מספר הקבצים.',
        'שלא כמו רוב האתרים, כאן הקבצים לא עולים לשום שרת: כל העבודה נעשית בתוך הדפדפן במכשיר שלכם. זה חשוב במיוחד לתלושי שכר, חוזים, תעודות ומסמכים רפואיים.',
      ]}
      faq={FAQ}
      related={[{ label: 'סורק QR ויצירת קוד QR', href: '/tools/qr-code' }, { label: 'ספירת מילים', href: '/tools/word-count' }, { label: 'קורס אקסל חינם', href: '/excel' }, { label: 'כל הכלים', href: '/tools' }]}
    /></div>}
  </Wrap>
}
