// /tools/document (new document + templates + recent documents) and /tools/document/:template.
// A4 pages edited in place (contentEditable), plus a free layer of text boxes and lines.
// Everything stays in this browser: autosave to localStorage, print / PDF / .doc / .txt made locally.
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import NotFound from '../../pages/NotFound'
import { TEMPLATES, templateBySlug, BLANK_HTML, PAGE_W, PAGE_H } from './docTemplates'
import { sanitizeHtml, buildDocFile, DOC_MIME, docToText, itemsToHtml, fileName, newId, shortWhen, textToHtml } from './docLogic'
import { GOOGLE_FONTS, fontStack, loadGoogleFont } from '../fonts/googleFonts'
import './docs.css'

// ── local storage ───────────────────────────────────────────
const STORE = 'ugabuga-docs'
const MAX_DOCS = 15
function loadDocs() {
  try { const s = JSON.parse(localStorage.getItem(STORE) || '{}'); return Array.isArray(s.docs) ? s.docs.filter(d => d && d.id && Array.isArray(d.pages)) : [] } catch { return [] }
}
function saveDoc(doc) {
  const docs = [doc, ...loadDocs().filter(d => d.id !== doc.id)].slice(0, MAX_DOCS)
  // when the browser is full, older documents make room for the one being edited
  while (docs.length) {
    try { localStorage.setItem(STORE, JSON.stringify({ docs })); return true } catch { if (docs.length <= 1) return false; docs.pop() }
  }
  return false
}
function removeDoc(id) {
  try { localStorage.setItem(STORE, JSON.stringify({ docs: loadDocs().filter(d => d.id !== id) })) } catch { /* private mode */ }
}

const fromTemplate = (tpl, id = newId()) => ({ id, title: tpl ? tpl.name : '', template: tpl?.slug || null, updated: 0, pages: [{ html: tpl ? tpl.html : BLANK_HTML, items: tpl?.items || [] }] })

const num = (v, d) => (Number.isFinite(+v) ? +v : d)
function normItem(it) {
  const base = { id: it.id, page: it.page, x: num(it.x, 100), y: num(it.y, 100) }
  if (it.type === 'text') return { ...base, type: 'text', w: Math.max(40, num(it.w, 260)), h: Math.max(20, num(it.h, 60)), frame: !!it.frame, html: sanitizeHtml(it.html || '') || '<p><br></p>' }
  return { ...base, type: 'line', o: it.o === 'v' ? 'v' : 'h', len: Math.max(10, num(it.len, 200)), t: Math.min(20, Math.max(1, num(it.t, 2))), color: /^#[0-9a-f]{3,8}$/i.test(it.color || '') ? it.color : '#14162d', dash: ['solid', 'dashed', 'dotted'].includes(it.dash) ? it.dash : 'solid', round: !!it.round }
}
// Stored document → page list (html is only the starting content) + flat item list.
// Stable keys on first load keep prerendered markup and the client identical.
function explode(doc, fresh) {
  const pages = [], items = []
  let n = 0
  const src = doc.pages?.length ? doc.pages : [{ html: BLANK_HTML }]
  src.forEach((p, i) => {
    const key = fresh ? newId() : `pg${i}`
    pages.push({ key, html: sanitizeHtml(p.html) || BLANK_HTML })
    for (const it of p.items || []) items.push(normItem({ ...it, id: fresh ? newId() : `it${n++}`, page: key }))
  })
  return { pages, items }
}

// ── DOM helpers ─────────────────────────────────────────────
const elOf = n => (n ? (n.nodeType === 1 ? n : n.parentElement) : null)
const overflows = b => b.scrollHeight > b.clientHeight + 1
const qs = c => { try { return document.queryCommandState(c) } catch { return false } }
const cleanDom = html => String(html).replace(/\s?data-dcsel="[^"]*"/g, '')
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

function deepEdge(host, end) {
  let n = host
  for (;;) {
    const c = end ? n.lastChild : n.firstChild
    if (!c || c.nodeType !== 1 || ['BR', 'IMG', 'HR', 'TABLE'].includes(c.tagName)) break
    n = c
  }
  if (!end) return { node: n, offset: 0 }
  const last = n.lastChild
  return { node: n, offset: last && last.nodeType === 1 && last.tagName === 'BR' ? n.childNodes.length - 1 : n.childNodes.length }
}
function setCaret(node, offset) {
  const r = document.createRange()
  try { r.setStart(node, offset) } catch { return false }
  r.collapse(true)
  const s = getSelection(); s.removeAllRanges(); s.addRange(r)
  return true
}
function placeCaret(host, pc = {}) {
  host.focus({ preventScroll: true })
  if (pc.selectAll) { const r = document.createRange(); r.selectNodeContents(host); const s = getSelection(); s.removeAllRanges(); s.addRange(r); return }
  let at = deepEdge(host, !!pc.end)
  if (pc.path) {
    let node = host
    for (const i of pc.path) node = node?.childNodes[i]
    if (node) at = { node, offset: Math.min(pc.offset || 0, node.nodeType === 3 ? node.length : node.childNodes.length) }
  }
  setCaret(at.node, at.offset)
  elOf(at.node)?.scrollIntoView?.({ block: 'nearest' })
}
const pathOf = (root, node) => { const p = []; for (let n = node; n && n !== root; n = n.parentNode) p.unshift([...n.parentNode.childNodes].indexOf(n)); return p }

// What to move to the next page when a page overflows: its last block, or the last item / row of a
// trailing list or table so long lists and tables continue across pages.
function takeLast(body) {
  const kids = [...body.childNodes].filter(n => !(n.nodeType === 3 && !n.textContent.trim()))
  if (!kids.length) return null
  const last = kids[kids.length - 1]
  if (last.nodeType === 1 && (last.tagName === 'UL' || last.tagName === 'OL') && last.children.length > 1) return { node: last.lastElementChild, list: last }
  if (last.nodeType === 1 && last.tagName === 'TABLE') { const rows = last.querySelectorAll('tr'); if (rows.length > 1) return { node: rows[rows.length - 1], table: last } }
  if (kids.length === 1) return null
  return { node: last }
}
function prependTake(target, t) {
  const first = target.firstElementChild
  if (t.list) {
    if (first && first.tagName === t.list.tagName) first.insertBefore(t.node, first.firstChild)
    else { const l = t.list.cloneNode(false); l.appendChild(t.node); target.insertBefore(l, target.firstChild) }
  } else if (t.table) {
    if (first && first.tagName === 'TABLE') { const tb = first.querySelector('tbody') || first; tb.insertBefore(t.node, tb.firstChild) }
    else { const tbl = t.table.cloneNode(false); const tb = document.createElement('tbody'); tb.appendChild(t.node); tbl.appendChild(tb); target.insertBefore(tbl, target.firstChild) }
  } else target.insertBefore(t.node, target.firstChild)
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onerror = reject
    fr.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const k = Math.min(1, 1400 / Math.max(img.width, img.height))
        if (k === 1 && file.size < 600000 && /^image\/(png|jpeg|gif|webp)$/.test(file.type)) return resolve(fr.result)
        const c = document.createElement('canvas')
        c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k))
        const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height)
        resolve(c.toDataURL('image/jpeg', 0.85))
      }
      img.src = fr.result
    }
    fr.readAsDataURL(file)
  })
}

// ── icons and palettes ──────────────────────────────────────
const ICON = {
  alignR: 'M4 6h16M8 10h12M4 14h16M8 18h12', alignC: 'M4 6h16M7 10h10M4 14h16M7 18h10', alignL: 'M4 6h16M4 10h12M4 14h16M4 18h12', justify: 'M4 6h16M4 10h16M4 14h16M4 18h16',
  ul: 'M4 6h11M4 12h11M4 18h11M20 6h.01M20 12h.01M20 18h.01', ol: 'M4 6h11M4 12h11M4 18h11M19 4.5l1-.5v4M18.5 11h2l-2 3h2M18.5 17h2v3h-2',
  undo: 'M9 14l-5-5 5-5M4 9h10a6 6 0 010 12h-3', redo: 'M15 14l5-5-5-5M20 9H10a6 6 0 000 12h3',
}
const Ico = ({ d }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
const TEXT_COLORS = ['#111111', '#555555', '#d62828', '#e76f00', '#2a9d4b', '#1d6fd8', '#7b2cbf', '#d6337a']
const MARKS = ['#fff176', '#b9f6ca', '#b3e5fc', '#f8bbd0', '#ffe0b2']
const LINE_COLORS = ['#14162d', '#888888', '#d62828', '#ff9f6b', '#ffd23f', '#2fb36d', '#7cc4ff', '#1d6fd8', '#b48cf2', '#f2a7b8']
const SIZES = [10, 12, 14, 16, 18, 24, 32, 44, 60, 80]
const STYLES = [['p', 'טקסט רגיל'], ['h1', 'כותרת ראשית'], ['h2', 'כותרת'], ['h3', 'כותרת משנה']]
const FONT_PT = { 1: 8, 2: 10, 3: 12, 4: 14, 5: 18, 6: 24 }

// Toolbar button: mousedown is cancelled so the text selection stays where it was.
const Tb = ({ title, children, onClick, pressed, disabled, menu }) => (
  <button type="button" className="dc-tb" title={title} aria-label={title} aria-pressed={pressed} disabled={disabled} data-menu-btn={menu || undefined} aria-haspopup={menu ? 'menu' : undefined}
    onMouseDown={e => e.preventDefault()} onClick={onClick}>{children}</button>
)

// ── free items ──────────────────────────────────────────────
function strokeStyle(it) {
  const h = it.o !== 'v'
  const solid = it.dash === 'solid'
  const r = it.round ? it.t : 0
  return h
    ? { width: '100%', height: solid ? it.t : 0, background: solid ? it.color : 'transparent', borderTop: solid ? 0 : `${it.t}px ${it.dash} ${it.color}`, borderRadius: r }
    : { height: '100%', width: solid ? it.t : 0, background: solid ? it.color : 'transparent', borderRight: solid ? 0 : `${it.t}px ${it.dash} ${it.color}`, borderRadius: r }
}
const PAD = 9
const lineBox = it => (it.o !== 'v'
  ? { left: it.x, top: it.y - PAD, width: it.len, height: it.t + 2 * PAD }
  : { left: it.x - PAD, top: it.y, width: it.t + 2 * PAD, height: it.len })

function LineItem({ it, selected, onDrag, onDelete }) {
  return (
    <div className={'dc-item dc-line' + (it.o === 'v' ? ' v' : '') + (selected ? ' dc-selected' : '')} style={lineBox(it)}
      onPointerDown={onDrag ? e => onDrag(e, it, 'move') : undefined} role={onDrag ? 'button' : undefined} aria-label={onDrag ? 'קו — גררו כדי להזיז' : undefined}>
      <div className="dc-stroke" style={strokeStyle(it)} />
      {selected && <>
        <span className="dc-ui dc-rs a" aria-hidden="true" onPointerDown={e => onDrag(e, it, 'a')} />
        <span className="dc-ui dc-rs b" aria-hidden="true" onPointerDown={e => onDrag(e, it, 'b')} />
        <button type="button" className="dc-ui dc-del" aria-label="מחיקת הקו" title="מחיקה" onPointerDown={e => e.stopPropagation()} onClick={() => onDelete(it.id)}>✕</button>
      </>}
    </div>
  )
}

function TextBox({ it, selected, onSelect, onDrag, onDelete, boxRef }) {
  return (
    <div className={'dc-item dc-box' + (it.frame ? ' dc-framed' : '') + (selected ? ' dc-selected' : '')} style={{ left: it.x, top: it.y, width: it.w, minHeight: it.h }}
      onPointerDown={onSelect ? () => onSelect(it.id) : undefined}>
      <div className="dc-boxtext" contentEditable={!!onSelect} suppressContentEditableWarning dir="rtl" ref={boxRef} dangerouslySetInnerHTML={{ __html: it.html }} />
      {selected && <>
        <button type="button" className="dc-ui dc-grip" aria-label="גררו כדי להזיז" title="גררו כדי להזיז" onPointerDown={e => onDrag(e, it, 'move')}>✥</button>
        <button type="button" className="dc-ui dc-del" aria-label="מחיקת התיבה" title="מחיקה" onMouseDown={e => e.preventDefault()} onClick={() => onDelete(it.id)}>✕</button>
        <span className="dc-ui dc-rs corner" aria-hidden="true" onPointerDown={e => onDrag(e, it, 'corner')} />
      </>}
    </div>
  )
}

// Thumbnails are drawn only once scrolled into view (25 live pages are heavy), and not for automated
// browsers such as the prerenderer, so the template text doesn't become the hub page's own text.
const MiniPage = memo(function MiniPage({ tpl }) {
  const ref = useRef(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || navigator.webdriver) return
    if (typeof IntersectionObserver === 'undefined') { setShow(true); return }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { setShow(true); io.disconnect() } }, { rootMargin: '300px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div className="dc-thumb" aria-hidden="true" data-nosnippet="" ref={ref}>
      {tpl && show && <div className="dc-page">
        <div className="dc-body" dangerouslySetInnerHTML={{ __html: tpl.html }} />
        {(tpl.items || []).map((it, i) => it.type === 'text' ? <TextBox key={i} it={it} /> : <LineItem key={i} it={normItem(it)} />)}
      </div>}
    </div>
  )
})

// ── the editor ──────────────────────────────────────────────
function Editor({ initial, fresh }) {
  const navigate = useNavigate()
  const [first] = useState(() => explode(initial, fresh))
  const [pages, setPages] = useState(first.pages)
  const [items, setItems] = useState(first.items)
  const [title, setTitle] = useState(initial.title || '')
  const [sel, setSel] = useState(null)
  const [img, setImg] = useState(null)
  const [inCell, setInCell] = useState(false)
  const [fmt, setFmt] = useState({})
  const [menu, setMenu] = useState(null)
  // Google fonts picked earlier in this document come back with it
  useEffect(() => { const s = JSON.stringify(initial); GOOGLE_FONTS.forEach(f => { if (s.includes(f.family)) loadGoogleFont(f.id) }) }, [initial])
  const [status, setStatus] = useState('')
  const [toast, setToast] = useState('')
  const [scale, setScale] = useState(1)
  const [zoom, setZoom] = useState(false)

  const pagesRef = useRef(pages)
  const itemsRef = useRef(items)
  const titleRef = useRef(title)
  useLayoutEffect(() => { pagesRef.current = pages; itemsRef.current = items; titleRef.current = title })
  const bodies = useRef(new Map())
  const boxes = useRef(new Map())
  const stage = useRef(null)
  const wrap = useRef(null)
  const saved = useRef(null)
  const curPage = useRef(null)
  const timer = useRef(0)
  const hist = useRef({ stack: [], i: -1 })
  const dirty = useRef(false)
  const pendingCaret = useRef(null)
  const fileInput = useRef(null)
  const imgRef = useRef(null)
  const toastTimer = useRef(0)
  const sizing = useRef(false)

  const flash = useCallback(msg => { setToast(msg); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 3500) }, [])

  const serialize = useCallback(() => ({
    id: initial.id, template: initial.template || null, title: titleRef.current.trim(), updated: Date.now(),
    pages: pagesRef.current.map(p => ({
      html: cleanDom(bodies.current.get(p.key)?.innerHTML ?? p.html),
      items: itemsRef.current.filter(it => it.page === p.key).map(it => {
        const { page: _page, id: _id, ...rest } = it
        return it.type === 'text' ? { ...rest, html: cleanDom(boxes.current.get(it.id)?.innerHTML ?? it.html) } : rest
      }),
    })),
  }), [initial.id, initial.template])

  const flush = useCallback(() => {
    clearTimeout(timer.current); timer.current = 0
    const doc = serialize()
    const snap = JSON.stringify(doc.pages)
    const h = hist.current
    if (h.stack[h.i] !== snap) {
      h.stack = h.stack.slice(0, h.i + 1); h.stack.push(snap)
      if (h.stack.length > 80) h.stack.shift()
      h.i = h.stack.length - 1
      if (h.stack.length > 1) dirty.current = true
    }
    if (dirty.current) setStatus(saveDoc(doc) ? 'saved' : 'error')
    return doc
  }, [serialize])
  const changed = useCallback(soon => { clearTimeout(timer.current); timer.current = setTimeout(flush, soon ? 40 : 600) }, [flush])

  // first snapshot, save on leave
  useEffect(() => {
    hist.current = { stack: [JSON.stringify(serialize().pages)], i: 0 }
    const leave = () => { if (timer.current) flush() }
    addEventListener('pagehide', leave)
    return () => { removeEventListener('pagehide', leave); leave(); clearTimeout(toastTimer.current) }
  }, [serialize, flush])

  const restore = useCallback(snap => {
    const ex = explode({ pages: JSON.parse(snap) }, true)
    setPages(ex.pages); setItems(ex.items); setSel(null); setImg(null); imgRef.current = null
    dirty.current = true
    setTimeout(() => setStatus(saveDoc(serialize()) ? 'saved' : 'error'), 40)
  }, [serialize])
  const undo = useCallback(() => { if (timer.current) flush(); const h = hist.current; if (h.i > 0) { h.i--; restore(h.stack[h.i]) } }, [flush, restore])
  const redo = useCallback(() => { if (timer.current) flush(); const h = hist.current; if (h.i < h.stack.length - 1) { h.i++; restore(h.stack[h.i]) } }, [flush, restore])

  // ── page flow: text that no longer fits moves to the next page ──
  const flowFrom = useCallback(start => {
    let cur = start, guard = 0
    const idxOf = b => pagesRef.current.findIndex(p => bodies.current.get(p.key) === b)
    while (cur && guard++ < 500) {
      const i = idxOf(cur)
      if (i < 0) break
      const nextBody = pagesRef.current[i + 1] && bodies.current.get(pagesRef.current[i + 1].key)
      if (!overflows(cur)) {
        cur.parentElement.classList.remove('dc-over')
        if (nextBody && overflows(nextBody)) { cur = nextBody; continue }
        break
      }
      const take = takeLast(cur)
      if (!take) { cur.parentElement.classList.add('dc-over'); break }
      const s = getSelection()
      const caret = s && s.rangeCount ? { node: s.getRangeAt(0).startContainer, offset: s.getRangeAt(0).startOffset } : null
      if (nextBody) {
        prependTake(nextBody, take)
        if (caret && take.node.contains(caret.node)) { nextBody.focus({ preventScroll: true }); setCaret(caret.node, caret.offset); elOf(caret.node)?.scrollIntoView({ block: 'nearest' }) }
        continue
      }
      // no next page yet: gather what has to move and open a new page with it
      const tmp = document.createElement('div')
      prependTake(tmp, take)
      let more
      while (overflows(cur) && (more = takeLast(cur))) prependTake(tmp, more)
      const key = newId()
      if (caret && tmp.contains(caret.node)) pendingCaret.current = { key, path: pathOf(tmp, caret.node), offset: caret.offset }
      const afterKey = pagesRef.current[i].key
      setPages(ps => { const n = [...ps]; n.splice(ps.findIndex(p => p.key === afterKey) + 1, 0, { key, html: tmp.innerHTML }); return n })
      changed(true)
      break
    }
  }, [changed])

  useLayoutEffect(() => {
    const pc = pendingCaret.current
    if (pc) {
      const host = pc.box ? boxes.current.get(pc.box) : bodies.current.get(pc.key)
      if (host) { pendingCaret.current = null; placeCaret(host, pc) }
    }
    for (const p of pages) { const b = bodies.current.get(p.key); if (b && overflows(b)) { flowFrom(b); break } }
  }, [pages, items, flowFrom])

  // ── fit the A4 page to the screen width ──
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const fit = () => setScale(zoom ? 1 : Math.min(1, (el.clientWidth - 2) / PAGE_W))
    fit()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null
    ro?.observe(el)
    return () => ro?.disconnect()
  }, [zoom])

  // ── where the caret is: remembered for toolbar actions ──
  useEffect(() => {
    const on = () => {
      const s = getSelection()
      if (!s || !s.rangeCount) return
      const r = s.getRangeAt(0)
      const el = elOf(r.startContainer)
      if (!el || !stage.current?.contains(el) || !el.closest('[contenteditable="true"]')) return
      saved.current = r.cloneRange()
      const pg = el.closest('[data-page]')
      if (pg) curPage.current = pg.dataset.page
      setInCell(!!el.closest('td,th'))
      const f = { b: qs('bold'), i: qs('italic'), u: qs('underline'), ul: qs('insertUnorderedList'), ol: qs('insertOrderedList'), ltr: !!el.closest('[dir="ltr"]') }
      setFmt(prev => (Object.keys(f).every(k => prev[k] === f[k]) ? prev : f))
    }
    document.addEventListener('selectionchange', on)
    return () => document.removeEventListener('selectionchange', on)
  }, [])

  // ── print: copy the pages into a bare container that alone is printed ──
  useEffect(() => {
    let box = null
    const before = () => {
      if (!stage.current) return
      if (timer.current) flush()
      box?.remove()
      box = document.createElement('div')
      box.id = 'dc-print'
      box.setAttribute('dir', 'rtl')
      const st = document.createElement('style')
      st.textContent = '@page{size:A4;margin:0}'
      box.appendChild(st)
      stage.current.querySelectorAll('.dc-page').forEach(p => {
        const c = p.cloneNode(true)
        c.removeAttribute('style')
        c.querySelectorAll('.dc-ui').forEach(x => x.remove())
        c.querySelectorAll('[contenteditable]').forEach(x => x.removeAttribute('contenteditable'))
        c.querySelectorAll('.dc-selected').forEach(x => x.classList.remove('dc-selected'))
        c.querySelectorAll('[data-dcsel]').forEach(x => x.removeAttribute('data-dcsel'))
        box.appendChild(c)
      })
      document.body.appendChild(box)
    }
    const after = () => { box?.remove(); box = null }
    addEventListener('beforeprint', before)
    addEventListener('afterprint', after)
    return () => { removeEventListener('beforeprint', before); removeEventListener('afterprint', after); after() }
  }, [flush])

  // ── menus close on outside tap / scroll ──
  useEffect(() => {
    if (!menu) return
    const down = e => { if (!e.target.closest?.('.dc-menu,[data-menu-btn]')) setMenu(null) }
    // small page scrolls (focus, touch jitter) keep it open; scrolling the toolbar sideways closes it
    const y0 = scrollY
    const scroll = e => { if (e.target.closest?.('.dc-toolbar') || Math.abs(scrollY - y0) > 80) setMenu(null) }
    addEventListener('pointerdown', down)
    addEventListener('scroll', scroll, true)
    return () => { removeEventListener('pointerdown', down); removeEventListener('scroll', scroll, true) }
  }, [menu])
  const openMenu = (id, e) => {
    if (id === 'font') GOOGLE_FONTS.forEach(f => loadGoogleFont(f.id)) // so each name shows in its own font
    const r = e.currentTarget.getBoundingClientRect()
    setMenu(m => (m?.id === id ? null : { id, top: r.bottom + 6, right: clamp(innerWidth - r.right, 8, Math.max(8, innerWidth - 200)) }))
  }

  // ── text commands ──
  const restoreSel = useCallback(() => {
    const r = saved.current
    if (!r || !r.startContainer.isConnected || !stage.current?.contains(r.startContainer)) {
      const key = pagesRef.current.some(p => p.key === curPage.current) ? curPage.current : pagesRef.current[0].key
      const b = bodies.current.get(key)
      if (b) placeCaret(b, { end: true })
      return
    }
    const host = elOf(r.startContainer)?.closest('[contenteditable="true"]')
    if (host && document.activeElement !== host) host.focus({ preventScroll: true })
    const s = getSelection(); s.removeAllRanges(); s.addRange(r)
  }, [])
  const exec = (cmd, val, css = false) => {
    setMenu(null)
    restoreSel()
    try { document.execCommand('styleWithCSS', false, css) } catch { /* old browsers */ }
    document.execCommand(cmd, false, val)
    if (css) try { document.execCommand('styleWithCSS', false, false) } catch { /* old browsers */ }
    changed()
  }
  const hostOfSel = () => { const s = getSelection(); return s && s.rangeCount ? elOf(s.getRangeAt(0).startContainer)?.closest('[contenteditable="true"]') : null }
  const blockOfSel = () => {
    const s = getSelection(); if (!s || !s.rangeCount) return null
    const el = elOf(s.getRangeAt(0).startContainer); const host = el?.closest('[contenteditable="true"]')
    const b = el?.closest('p,h1,h2,h3,h4,li,td,th,blockquote,div')
    return b && host && host.contains(b) ? b : host
  }
  const setSize = pt => {
    setMenu(null)
    restoreSel()
    const s = getSelection()
    if (s.rangeCount && s.getRangeAt(0).collapsed) { const b = blockOfSel(); if (b) { const r = document.createRange(); r.selectNodeContents(b); s.removeAllRanges(); s.addRange(r) } }
    try { document.execCommand('styleWithCSS', false, false) } catch { /* old browsers */ }
    sizing.current = true // onInput would otherwise convert the <font size=7> before we can
    document.execCommand('fontSize', false, '7')
    sizing.current = false
    const host = hostOfSel()
    if (!host) return
    const made = []
    host.querySelectorAll('font[size="7"]').forEach(f => {
      const span = document.createElement('span'); span.style.fontSize = pt + 'pt'
      if (f.color) span.style.color = f.color
      span.append(...f.childNodes); f.replaceWith(span); made.push(span)
      span.querySelectorAll('span[style*="font-size"]').forEach(x => { x.style.fontSize = '' ; if (!x.getAttribute('style')) x.replaceWith(...x.childNodes) })
    })
    if (made.length) { const r = document.createRange(); r.setStartBefore(made[0]); r.setEndAfter(made[made.length - 1]); s.removeAllRanges(); s.addRange(r); saved.current = r.cloneRange() }
    changed()
  }
  const setBlock = tag => exec('formatBlock', `<${tag}>`)
  const toggleDir = () => {
    restoreSel()
    let b = blockOfSel()
    const host = hostOfSel()
    if (!b || b === host) { document.execCommand('formatBlock', false, '<p>'); b = blockOfSel() }
    if (!b || b === host) return
    if (b.getAttribute('dir') === 'ltr') b.removeAttribute('dir'); else b.setAttribute('dir', 'ltr')
    setFmt(f => ({ ...f, ltr: b.getAttribute('dir') === 'ltr' }))
    changed(true)
  }
  const fixFonts = host => host.querySelectorAll('font').forEach(f => {
    const span = document.createElement('span')
    if (f.color) span.style.color = f.color
    if (f.face) span.style.fontFamily = f.face
    if (FONT_PT[f.size]) span.style.fontSize = FONT_PT[f.size] + 'pt'
    span.append(...f.childNodes); f.replaceWith(span)
  })

  // ── tables ──
  const insertTable = () => exec('insertHTML', '<table><tbody>' + '<tr><td><br></td><td><br></td><td><br></td></tr>'.repeat(3) + '</tbody></table><p><br></p>')
  const cellNow = () => elOf(saved.current?.startContainer)?.closest('td,th')
  const tableOp = op => {
    const cell = cellNow(); if (!cell) return
    const tr = cell.parentElement, table = cell.closest('table')
    const rows = [...table.querySelectorAll('tr')]
    const ci = [...tr.children].indexOf(cell)
    if (op === 'row+') { const n = document.createElement('tr'); for (let k = 0; k < tr.children.length; k++) { const td = document.createElement('td'); td.innerHTML = '<br>'; n.appendChild(td) } tr.after(n) }
    if (op === 'col+') rows.forEach(r => { const ref = r.children[ci]; const c = document.createElement(ref?.tagName === 'TH' ? 'th' : 'td'); c.innerHTML = '<br>'; if (ref) ref.after(c); else r.appendChild(c) })
    if (op === 'row-') { if (rows.length <= 1) table.remove(); else tr.remove() }
    if (op === 'col-') { rows.forEach(r => r.children[ci]?.remove()); if (!table.querySelector('td,th')) table.remove() }
    if (op === 'del') table.remove()
    if (!cell.isConnected) { saved.current = null; setInCell(false) }
    changed(true)
  }

  // ── images ──
  const insertImage = async file => {
    if (!file || !file.type.startsWith('image/')) return
    try {
      const src = await readImage(file)
      exec('insertHTML', `<img src="${src}" alt="" style="width:50%">`)
      changed(true)
    } catch { flash('לא הצלחנו לקרוא את התמונה') }
  }
  const pickImg = el => {
    imgRef.current?.removeAttribute('data-dcsel')
    imgRef.current = el
    el?.setAttribute('data-dcsel', '')
    setImg(el)
  }
  const imgSize = pct => { const el = imgRef.current; if (!el) return; el.style.width = pct + '%'; el.style.height = ''; changed(true) }
  const imgDelete = () => { imgRef.current?.remove(); pickImg(null); changed(true) }

  // ── pages ──
  const addPage = (afterIdx, html = BLANK_HTML) => {
    const key = newId()
    pendingCaret.current = { key }
    setPages(ps => { const n = [...ps]; n.splice(afterIdx + 1, 0, { key, html }); return n })
    changed(true)
  }
  const pageBreak = () => {
    restoreSel()
    const s = getSelection()
    const r = s.rangeCount ? s.getRangeAt(0) : null
    const body = elOf(r?.startContainer)?.closest('.dc-body')
    const idx = body ? pagesRef.current.findIndex(p => bodies.current.get(p.key) === body) : -1
    if (!body || idx < 0) { addPage(pagesRef.current.length - 1); return }
    const tail = document.createRange()
    tail.setStart(r.startContainer, r.startOffset); tail.setEnd(body, body.childNodes.length)
    const tmp = document.createElement('div'); tmp.appendChild(tail.extractContents())
    const last = body.lastElementChild
    if (!body.textContent.trim() && !body.querySelector('img,table')) body.innerHTML = BLANK_HTML
    else if (last && !last.textContent && !last.querySelector('br,img')) last.innerHTML = '<br>'
    const hasContent = tmp.textContent.trim() || tmp.querySelector('img,table')
    addPage(idx, hasContent ? tmp.innerHTML : BLANK_HTML)
  }
  const delPage = key => {
    const b = bodies.current.get(key)
    if ((b?.textContent.trim() || itemsRef.current.some(it => it.page === key)) && !window.confirm('למחוק את העמוד עם כל מה שכתוב בו?')) return
    setPages(ps => (ps.length > 1 ? ps.filter(p => p.key !== key) : ps))
    setItems(l => l.filter(it => it.page !== key))
    changed(true)
  }

  // ── free items ──
  const visiblePage = () => {
    if (pagesRef.current.some(p => p.key === curPage.current)) {
      const el = stage.current.querySelector(`[data-page="${curPage.current}"]`)
      const r = el?.getBoundingClientRect()
      if (r && r.bottom > 0 && r.top < innerHeight) return curPage.current
    }
    for (const p of pagesRef.current) { const r = stage.current.querySelector(`[data-page="${p.key}"]`)?.getBoundingClientRect(); if (r && r.bottom > innerHeight * 0.3) return p.key }
    return pagesRef.current[0].key
  }
  const addItem = type => {
    setMenu(null)
    const key = visiblePage()
    const el = stage.current.querySelector(`[data-page="${key}"]`)
    const r = el.getBoundingClientRect()
    const k = r.width / PAGE_W || 1
    const cy = clamp(Math.round((innerHeight / 2 - r.top) / k), 140, PAGE_H - 180)
    const id = newId()
    const base = { id, page: key }
    const it = type === 'text' ? { ...base, type: 'text', x: PAGE_W / 2 - 140, y: cy - 30, w: 280, h: 60, frame: true, html: '<p>כתבו כאן</p>' }
      : type === 'v' ? { ...base, type: 'line', o: 'v', x: PAGE_W / 2, y: cy - 110, len: 220, t: 2, color: '#14162d', dash: 'solid', round: false }
        : type === 'accent' ? { ...base, type: 'line', o: 'h', x: PAGE_W / 2 - 110, y: cy, len: 220, t: 8, color: '#ffd23f', dash: 'solid', round: true }
          : { ...base, type: 'line', o: 'h', x: PAGE_W / 2 - 160, y: cy, len: 320, t: 2, color: '#14162d', dash: 'solid', round: false }
    if (type === 'text') pendingCaret.current = { box: id, selectAll: true }
    else document.activeElement?.blur?.()
    setItems(l => [...l, it])
    setSel(id)
    changed(true)
  }
  const updItem = (id, patch) => { setItems(l => l.map(it => (it.id === id ? { ...it, ...patch } : it))); changed(true) }
  const delItem = useCallback(id => { setItems(l => l.filter(it => it.id !== id)); setSel(null); changed(true) }, [changed])
  const selectItem = useCallback(id => setSel(id), [])
  const startDrag = useCallback((e, it, mode) => {
    e.preventDefault(); e.stopPropagation()
    if (it.type === 'line') document.activeElement?.blur?.()
    setSel(it.id)
    const pageEl = e.currentTarget.closest('.dc-page')
    const k = pageEl.getBoundingClientRect().width / pageEl.offsetWidth || 1
    const sx = e.clientX, sy = e.clientY, o = { ...it }
    const v = o.o === 'v'
    const move = ev => {
      const dx = (ev.clientX - sx) / k, dy = (ev.clientY - sy) / k
      let p
      if (mode === 'move') {
        const w = o.type === 'text' ? o.w : v ? o.t : o.len
        const h = o.type === 'text' ? o.h : v ? o.len : o.t
        p = { x: Math.round(clamp(o.x + dx, 0, PAGE_W - w)), y: Math.round(clamp(o.y + dy, 0, PAGE_H - h)) }
      } else if (mode === 'corner') {
        const nx = clamp(o.x + dx, 0, o.x + o.w - 60)
        p = { x: Math.round(nx), w: Math.round(o.w + (o.x - nx)), h: Math.round(clamp(o.h + dy, 24, PAGE_H - o.y)) }
      } else if (!v) {
        p = mode === 'a' ? { len: Math.round(clamp(o.len + dx, 16, PAGE_W - o.x)) } : (() => { const nx = clamp(o.x + dx, 0, o.x + o.len - 16); return { x: Math.round(nx), len: Math.round(o.len + (o.x - nx)) } })()
      } else {
        p = mode === 'b' ? { len: Math.round(clamp(o.len + dy, 16, PAGE_H - o.y)) } : (() => { const ny = clamp(o.y + dy, 0, o.y + o.len - 16); return { y: Math.round(ny), len: Math.round(o.len + (o.y - ny)) } })()
      }
      setItems(l => l.map(x => (x.id === o.id ? { ...x, ...p } : x)))
    }
    const up = () => { removeEventListener('pointermove', move); removeEventListener('pointerup', up); removeEventListener('pointercancel', up); changed(true) }
    addEventListener('pointermove', move)
    addEventListener('pointerup', up)
    addEventListener('pointercancel', up)
  }, [changed])

  // Delete / Backspace removes a selected line (or a text box when not typing in it); Esc deselects.
  useEffect(() => {
    if (!sel) return
    const key = e => {
      const typing = document.activeElement?.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '')
      if ((e.key === 'Delete' || e.key === 'Backspace') && !typing) { e.preventDefault(); delItem(sel) }
      if (e.key === 'Escape') setSel(null)
    }
    addEventListener('keydown', key)
    return () => removeEventListener('keydown', key)
  }, [sel, delItem])

  // ── stage events ──
  const onInput = e => {
    const host = e.target.closest?.('[contenteditable="true"]')
    if (!sizing.current && host?.querySelector('font')) fixFonts(host)
    const body = e.target.closest?.('.dc-body')
    if (body) flowFrom(body)
    changed()
  }
  const onPaste = e => {
    const host = e.target.closest?.('[contenteditable="true"]')
    if (!host) return
    const cd = e.clipboardData
    if (!cd) return
    const html = cd.getData('text/html'), text = cd.getData('text/plain')
    const file = [...(cd.files || [])].find(f => f.type.startsWith('image/'))
    e.preventDefault()
    if (file && !html) { insertImage(file); return }
    document.execCommand('insertHTML', false, html ? sanitizeHtml(html) : textToHtml(text))
  }
  const onKeyDown = e => {
    const mod = e.ctrlKey || e.metaKey
    if (!mod) return
    const k = e.key.toLowerCase()
    if (k === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
    else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); redo() }
    else if (k === 's') { e.preventDefault(); dirty.current = true; flush(); flash('נשמר במכשיר הזה ✓') }
  }
  const onClick = e => {
    const t = e.target
    if (t.tagName === 'IMG' && t.closest('.dc-body,.dc-boxtext')) pickImg(t)
    else if (imgRef.current) pickImg(null)
  }
  const onPointerDown = e => { if (sel && !e.target.closest('.dc-item')) setSel(null) }
  const onFocus = e => { if (e.target.classList?.contains('dc-body')) { try { document.execCommand('defaultParagraphSeparator', false, 'p') } catch { /* old browsers */ } } }

  // ── files ──
  const docName = () => titleRef.current.trim() || initial.title || 'מסמך'
  const download = (text, type, ext) => {
    const url = URL.createObjectURL(new Blob([text], { type }))
    const a = document.createElement('a')
    a.href = url; a.download = fileName(docName(), ext)
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }
  const toWord = () => { download(buildDocFile({ ...flush(), title: docName() }), DOC_MIME, 'doc'); flash('הקובץ ירד — פותחים אותו בוורד') }
  const toText = () => { download('﻿' + docToText(flush()), 'text/plain;charset=utf-8', 'txt'); flash('קובץ הטקסט ירד') }
  const copyAll = async () => {
    const doc = flush()
    const text = docToText(doc)
    const html = `<div dir="rtl">${doc.pages.map(p => sanitizeHtml(p.html) + itemsToHtml(p.items)).join('<hr>')}</div>`
    try {
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) await navigator.clipboard.write([new ClipboardItem({ 'text/plain': new Blob([text], { type: 'text/plain' }), 'text/html': new Blob([html], { type: 'text/html' }) })])
      else await navigator.clipboard.writeText(text)
      flash('הטקסט הועתק ✓')
    } catch { flash('ההעתקה לא הצליחה — סמנו את הטקסט והעתיקו ידנית') }
  }
  const print = () => { if (timer.current) flush(); setSel(null); setTimeout(() => window.print(), 60) }

  const selItem = items.find(it => it.id === sel)
  const menuItems = {
    style: STYLES.map(([tag, label]) => <button key={tag} type="button" role="menuitem" onMouseDown={e => e.preventDefault()} onClick={() => setBlock(tag)} style={{ fontSize: tag === 'h1' ? 22 : tag === 'h2' ? 19 : tag === 'h3' ? 17 : 15 }}>{label}</button>),
    font: GOOGLE_FONTS.map(f => <button key={f.id} type="button" role="menuitem" onMouseDown={e => e.preventDefault()} onClick={() => exec('fontName', f.family, true)} style={{ fontFamily: fontStack(f.id), fontSize: 17 }}>{f.he ? 'אבג ' : ''}{f.label}{f.he ? '' : ' (אנגלית)'}</button>),
    size: SIZES.map(pt => <button key={pt} type="button" role="menuitem" onMouseDown={e => e.preventDefault()} onClick={() => setSize(pt)}>{pt}</button>),
    color: TEXT_COLORS.map(c => <button key={c} type="button" className="dc-sw" style={{ background: c }} aria-label={`צבע ${c}`} onMouseDown={e => e.preventDefault()} onClick={() => exec('foreColor', c, true)} />),
    mark: [...MARKS.map(c => <button key={c} type="button" className="dc-sw" style={{ background: c }} aria-label={`סימון ${c}`} onMouseDown={e => e.preventDefault()} onClick={() => exec('hiliteColor', c, true)} />),
      <button key="none" type="button" className="dc-sw none" aria-label="בלי סימון" title="בלי סימון" onMouseDown={e => e.preventDefault()} onClick={() => exec('hiliteColor', 'transparent', true)} />],
    line: [['h', '➖ קו ישר'], ['v', '│ קו עומד'], ['accent', '🟨 קו קישוט עבה']].map(([t, label]) => <button key={t} type="button" role="menuitem" onMouseDown={e => e.preventDefault()} onClick={() => addItem(t)}>{label}</button>),
  }

  return (
    <div className="dc-app">
      <div className="dc-head">
        <label className="sr-only" htmlFor="dc-title">שם המסמך</label>
        <input id="dc-title" className="dc-title" value={title} placeholder="שם המסמך" maxLength={80} onChange={e => { setTitle(e.target.value); dirty.current = true; changed() }} />
        <span className={'dc-status' + (status === 'error' ? ' err' : '')} role="status" aria-live="polite">
          {toast || (status === 'saved' ? '✓ נשמר במכשיר הזה' : status === 'error' ? '⚠️ לא נשמר: אין מקום בדפדפן. נסו תמונה קטנה יותר' : '')}
        </span>
      </div>
      <div className="dc-files">
        <button type="button" className="dc-btn" onClick={print}>🖨️ הדפסה / PDF</button>
        <button type="button" className="dc-btn alt" onClick={toWord}>⬇️ וורד</button>
        <button type="button" className="dc-btn alt" onClick={toText}>⬇️ טקסט</button>
        <button type="button" className="dc-btn alt" onClick={copyAll}>📋 העתקה</button>
        {(scale < 1 || zoom) && <button type="button" className="dc-btn alt" onClick={() => setZoom(z => !z)}>{zoom ? '↔️ התאמה למסך' : '🔍 גודל מלא'}</button>}
        <button type="button" className="dc-btn alt" onClick={() => { if (timer.current) flush(); navigate('/tools/document') }}>📂 מסמך חדש</button>
      </div>

      <div className="dc-sticky">
        <div className="dc-toolbar" role="toolbar" aria-label="עיצוב">
          <Tb title="ביטול (Ctrl+Z)" onClick={undo}><Ico d={ICON.undo} /></Tb>
          <Tb title="חזרה (Ctrl+Y)" onClick={redo}><Ico d={ICON.redo} /></Tb>
          <span className="dc-sep" />
          <Tb title="סגנון: כותרת או טקסט" menu="style" onClick={e => openMenu('style', e)}><span className="lbl">סגנון ▾</span></Tb>
          <Tb title="גופן (פונטים של גוגל)" menu="font" onClick={e => openMenu('font', e)}><span className="lbl">גופן ▾</span></Tb>
          <Tb title="גודל אות" menu="size" onClick={e => openMenu('size', e)}><span className="lbl">גודל ▾</span></Tb>
          <span className="dc-sep" />
          <Tb title="מודגש (Ctrl+B)" pressed={!!fmt.b} onClick={() => exec('bold')}><b>B</b></Tb>
          <Tb title="נטוי (Ctrl+I)" pressed={!!fmt.i} onClick={() => exec('italic')}><i style={{ fontFamily: 'serif' }}>I</i></Tb>
          <Tb title="קו תחתון (Ctrl+U)" pressed={!!fmt.u} onClick={() => exec('underline')}><u>U</u></Tb>
          <Tb title="צבע טקסט" menu="color" onClick={e => openMenu('color', e)}><span style={{ borderBottom: '4px solid #d62828', lineHeight: 1 }}>א</span></Tb>
          <Tb title="סימון בצבע" menu="mark" onClick={e => openMenu('mark', e)}><span style={{ background: '#fff176', padding: '0 4px' }}>🖍</span></Tb>
          <span className="dc-sep" />
          <Tb title="יישור לימין" onClick={() => exec('justifyRight')}><Ico d={ICON.alignR} /></Tb>
          <Tb title="מרכוז" onClick={() => exec('justifyCenter')}><Ico d={ICON.alignC} /></Tb>
          <Tb title="יישור לשמאל" onClick={() => exec('justifyLeft')}><Ico d={ICON.alignL} /></Tb>
          <Tb title="יישור לשני הצדדים" onClick={() => exec('justifyFull')}><Ico d={ICON.justify} /></Tb>
          <span className="dc-sep" />
          <Tb title="רשימת תבליטים" pressed={!!fmt.ul} onClick={() => exec('insertUnorderedList')}><Ico d={ICON.ul} /></Tb>
          <Tb title="רשימה ממוספרת" pressed={!!fmt.ol} onClick={() => exec('insertOrderedList')}><Ico d={ICON.ol} /></Tb>
          <Tb title="כיוון הפסקה: אנגלית משמאל לימין" pressed={!!fmt.ltr} onClick={toggleDir}><span className="lbl">⇄ {fmt.ltr ? 'LTR' : 'RTL'}</span></Tb>
          <span className="dc-sep" />
          <Tb title="הוספת תיבת טקסט חופשית" onClick={() => addItem('text')}><span className="lbl">🔤 תיבת טקסט</span></Tb>
          <Tb title="הוספת קו" menu="line" onClick={e => openMenu('line', e)}><span className="lbl">➖ קו ▾</span></Tb>
          <Tb title="הוספת טבלה" onClick={insertTable}><span className="lbl">▦ טבלה</span></Tb>
          <Tb title="הוספת תמונה מהמכשיר" onClick={() => { restoreSel(); fileInput.current?.click() }}><span className="lbl">🖼️ תמונה</span></Tb>
          <Tb title="מעבר לעמוד חדש מהמקום של הסמן" onClick={pageBreak}><span className="lbl">📄 מעבר עמוד</span></Tb>
          <input ref={fileInput} type="file" accept="image/*" hidden onChange={e => { insertImage(e.target.files?.[0]); e.target.value = '' }} />
        </div>

        {selItem?.type === 'text' && (
          <div className="dc-ctx" role="toolbar" aria-label="תיבת טקסט">
            <b>תיבת טקסט:</b>
            <Tb title="מסגרת" pressed={selItem.frame} onClick={() => updItem(selItem.id, { frame: !selItem.frame })}><span className="lbl">▢ מסגרת</span></Tb>
            <span className="text-sm">גוררים ב-✥, משנים גודל בפינה</span>
            <Tb title="מחיקת התיבה" onClick={() => delItem(selItem.id)}><span className="lbl">🗑️ מחיקה</span></Tb>
          </div>
        )}
        {selItem?.type === 'line' && (
          <div className="dc-ctx" role="toolbar" aria-label="קו">
            <b>קו:</b>
            {[[1, 'דק'], [2, 'רגיל'], [4, 'עבה'], [8, 'עבה מאוד']].map(([t, l]) => <Tb key={t} title={`עובי: ${l}`} pressed={selItem.t === t} onClick={() => updItem(selItem.id, { t })}><span className="lbl">{l}</span></Tb>)}
            <span className="dc-sep" />
            {[['solid', '━━'], ['dashed', '╍╍'], ['dotted', '┅┅']].map(([d, l]) => <Tb key={d} title={d === 'solid' ? 'רציף' : d === 'dashed' ? 'מקווקו' : 'נקודות'} pressed={selItem.dash === d} onClick={() => updItem(selItem.id, { dash: d })}><span className="lbl">{l}</span></Tb>)}
            <span className="dc-sep" />
            {LINE_COLORS.map(c => <button key={c} type="button" className="dc-sw" style={{ background: c, outline: selItem.color === c ? '3px solid #1d6fd8' : 'none' }} aria-label={`צבע הקו ${c}`} onClick={() => updItem(selItem.id, { color: c })} />)}
            <span className="dc-sep" />
            <Tb title="מחיקת הקו" onClick={() => delItem(selItem.id)}><span className="lbl">🗑️ מחיקה</span></Tb>
          </div>
        )}
        {img && img.isConnected && !selItem && (
          <div className="dc-ctx" role="toolbar" aria-label="תמונה">
            <b>תמונה:</b>
            {[25, 50, 75, 100].map(p => <Tb key={p} title={`רוחב ${p}%`} onClick={() => imgSize(p)}><span className="lbl">{p}%</span></Tb>)}
            <Tb title="מחיקת התמונה" onClick={imgDelete}><span className="lbl">🗑️ מחיקה</span></Tb>
          </div>
        )}
        {inCell && !selItem && !img && (
          <div className="dc-ctx" role="toolbar" aria-label="טבלה">
            <b>טבלה:</b>
            <Tb title="הוספת שורה מתחת" onClick={() => tableOp('row+')}><span className="lbl">➕ שורה</span></Tb>
            <Tb title="הוספת עמודה" onClick={() => tableOp('col+')}><span className="lbl">➕ עמודה</span></Tb>
            <Tb title="מחיקת השורה" onClick={() => tableOp('row-')}><span className="lbl">➖ שורה</span></Tb>
            <Tb title="מחיקת העמודה" onClick={() => tableOp('col-')}><span className="lbl">➖ עמודה</span></Tb>
            <Tb title="מחיקת הטבלה" onClick={() => tableOp('del')}><span className="lbl">🗑️ טבלה</span></Tb>
          </div>
        )}
      </div>

      {menu && (
        <div className={'dc-menu' + (menu.id === 'color' || menu.id === 'mark' ? ' swatches' : '')} role="menu" style={{ top: menu.top, right: menu.right }}>
          {menuItems[menu.id]}
        </div>
      )}

      <div ref={wrap}>
        <div ref={stage} className={'dc-stage rr-block' + (zoom ? ' zoom' : '')} onInput={onInput} onPaste={onPaste} onKeyDown={onKeyDown} onClick={onClick} onPointerDown={onPointerDown} onFocus={onFocus}>
          {pages.map((p, i) => (
            <div key={p.key}>
              <div className="dc-pagebar" style={{ width: PAGE_W * scale }}>
                <span>עמוד {i + 1} מתוך {pages.length}</span>
                {pages.length > 1 && <button type="button" onClick={() => delPage(p.key)}>🗑️ מחיקת העמוד</button>}
              </div>
              <div className="dc-pagewrap" style={{ width: PAGE_W * scale, height: PAGE_H * scale }}>
                <div className="dc-page" data-page={p.key} style={scale !== 1 ? { transform: `scale(${scale})` } : undefined}>
                  <div className="dc-body" contentEditable suppressContentEditableWarning spellCheck dir="rtl" role="textbox" aria-multiline="true" aria-label={`עמוד ${i + 1}`}
                    ref={el => { if (el) bodies.current.set(p.key, el) }} dangerouslySetInnerHTML={{ __html: p.html }} />
                  {items.filter(it => it.page === p.key).map(it => (it.type === 'text'
                    ? <TextBox key={it.id} it={it} selected={sel === it.id} onSelect={selectItem} onDrag={startDrag} onDelete={delItem} boxRef={el => { if (el) boxes.current.set(it.id, el) }} />
                    : <LineItem key={it.id} it={it} selected={sel === it.id} onDrag={startDrag} onDelete={delItem} />))}
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="dc-btn alt sm dc-addpage" onClick={() => addPage(pages.length - 1)}>➕ עמוד חדש</button>
        </div>
      </div>
    </div>
  )
}

// ── pages around the editor ─────────────────────────────────
const crumbs = last => [{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, ...(last ? [{ label: 'עורך מסמכים', href: '/tools/document' }, { label: last }] : [{ label: 'עורך מסמכים' }])]
const Page = ({ children }) => <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>
const CATS = ['מכתבים', 'בית ספר וגן', 'עבודה וועד', 'אירועים וברכות', 'בית ומשפחה', 'שלטים ומודעות']

const FAQ = [
  { q: 'איך שומרים את המסמך כ-PDF?', a: 'לוחצים "הדפסה / PDF", ובחלון ההדפסה בוחרים ביעד "שמירה כ-PDF". רק דפי המסמך נשמרים, בגודל A4 ובלי כותרות של האתר. כך ממירים גם מסמך וורד ל-PDF: מעתיקים את התוכן לכאן ושומרים.' },
  { q: 'אפשר להמשיך לערוך בוורד?', a: 'כן. "⬇️ וורד" מוריד קובץ ‎.doc שנפתח בוורד, ב-Google Docs וב-LibreOffice, עם עברית מימין לשמאל, טבלאות ותמונות. תיבות טקסט חופשיות וקווים עוברים לוורד כפסקאות וקווים רגילים.' },
  { q: 'איפה המסמך נשמר? מישהו רואה אותו?', a: 'המסמך נשמר אוטומטית רק בדפדפן שלכם, במכשיר הזה. שום דבר לא נשלח לאתר. המסמכים האחרונים מופיעים בראש הדף, ואפשר למחוק כל אחד מהם ב-✕.' },
  { q: 'איך מוסיפים תיבת טקסט או קו?', a: 'לוחצים "🔤 תיבת טקסט" או "➖ קו" ובוחרים קו ישר, עומד או קו קישוט. כדי להזיז גוררים את הידית ✥ (או את הקו עצמו), כדי לשנות גודל גוררים את העיגול הלבן, ומוחקים ב-✕ או במקש Delete.' },
  { q: 'איך כותבים פסקה באנגלית?', a: 'עומדים על הפסקה ולוחצים "⇄". הפסקה עוברת לכיוון משמאל לימין, ולחיצה נוספת מחזירה אותה לעברית. כל שאר המסמך נשאר מימין לשמאל.' },
]

function TemplateGrid({ exclude, grouped }) {
  const list = TEMPLATES.filter(t => t.slug !== exclude)
  const card = t => (
    <Link key={t.slug} to={`/tools/document/${t.slug}`} className="dc-card">
      <MiniPage tpl={t} />
      <span><span aria-hidden="true">{t.emoji} </span>{t.name}</span>
    </Link>
  )
  if (!grouped) return <div className="dc-grid">{list.map(card)}</div>
  return CATS.map(c => (
    <section key={c} className="mb-6">
      <h3 className="text-xl font-bold mb-2">{c}</h3>
      <div className="dc-grid">{list.filter(t => t.cat === c).map(card)}</div>
    </section>
  ))
}

function RecentDocs({ docs, onRemove }) {
  if (!docs.length) return null
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-2">המסמכים שלכם</h2>
      <ul className="dc-recent">
        {docs.map(d => {
          const t = d.template && templateBySlug(d.template)
          return (
            <li key={d.id}>
              <Link to={`/tools/document?d=${encodeURIComponent(d.id)}`}><span aria-hidden="true">{t ? t.emoji : '📄'}</span>{d.title || (t ? t.name : 'מסמך ללא שם')} <small>{shortWhen(d.updated)} · {d.pages.length} {d.pages.length === 1 ? 'עמוד' : 'עמודים'}</small></Link>
              <button type="button" className="dc-x" aria-label={`מחיקת ${d.title || 'המסמך'} מהרשימה`} title="מחיקה מהמכשיר" onClick={() => { if (window.confirm('למחוק את המסמך מהמכשיר?')) onRemove(d.id) }}>✕</button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Hub() {
  const [sp] = useSearchParams()
  const d = sp.get('d')
  const navigate = useNavigate()
  const [docs, setDocs] = useState([])
  const [doc, setDoc] = useState(null)
  useEffect(() => { setDocs(loadDocs()) }, [d])
  useEffect(() => {
    if (!d) { setDoc(null); return }
    setDoc(loadDocs().find(x => x.id === d) || fromTemplate(null, d))
  }, [d])
  const remove = id => { removeDoc(id); setDocs(loadDocs()) }
  return (
    <Page>
      <SEO title="וורד אונליין בעברית — עורך מסמכים חינם עם תבניות" description="כותבים מסמך בעברית ישר בדפדפן, בלי להתקין וורד: מכתב רשמי, הודעה להורים, הצעת מחיר, תעודה ושלט. מדפיסים, שומרים כ-PDF או מורידים לוורד. חינם." path="/tools/document" structuredData={faqSchema(FAQ)} />
      <Breadcrumbs items={crumbs(d ? 'מסמך' : null)} />
      {d ? (
        <>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3"><span aria-hidden="true">📝 </span>עורך מסמכים</h1>
          {doc && <Editor key={doc.id} initial={doc} fresh />}
        </>
      ) : (
        <>
          <h1 className="text-4xl sm:text-5xl text-center mb-5"><span aria-hidden="true">📝 </span>וורד אונליין בעברית</h1>
          <div className="flex justify-center mb-8">
            <button type="button" className="dc-btn" style={{ fontSize: 22, minHeight: 60, padding: '10px 28px' }} onClick={() => navigate(`/tools/document?d=${newId()}`)}>➕ מסמך חדש</button>
          </div>
          <RecentDocs docs={docs} onRemove={remove} />
          <h2 className="text-2xl font-bold mb-3">או מתחילים מתבנית מוכנה</h2>
          <TemplateGrid grouped />
        </>
      )}
      <div className="mt-12"><SeoBody
        paragraphs={[
          'עורך המסמכים של עוגה בוגה עובד כמו וורד, ישר בדפדפן ובעברית: דף A4 מימין לשמאל, כותרות, הדגשה, צבעים, רשימות, טבלאות ותמונות. מוסיפים תיבת טקסט בכל מקום בדף, קווים ומפרידים, ומזיזים אותם בגרירה. כשנגמר המקום בעמוד הטקסט ממשיך לעמוד הבא לבד.',
          'יש כאן יותר מעשרים תבניות מוכנות לעריכה: מכתב רשמי, מכתב המלצה, מכתב תודה למורה ולגננת, הודעה להורים, אישור הורים לטיול, פרוטוקול ישיבה, הצעת מחיר, אישור קבלת תשלום, הזמנה, תעודת הצטיינות, מתכון, רשימת קניות, תכנית שבועית, דף עבודה עם שורות, שלטים ומודעות. בסוף מדפיסים, שומרים כ-PDF או מורידים קובץ וורד.',
        ]}
        faq={FAQ}
        related={[{ label: 'קורס אקסל חינם', href: '/excel' }, { label: 'הקלדה עיוורת', href: '/typing' }, { label: 'כל הכלים', href: '/tools' }]}
      /></div>
    </Page>
  )
}

function TemplatePage({ tpl }) {
  const [doc, setDoc] = useState(() => fromTemplate(tpl, `tpl-${tpl.slug}`))
  const [fresh, setFresh] = useState(false)
  const [resumed, setResumed] = useState(false)
  useEffect(() => {
    const saved = loadDocs().find(x => x.template === tpl.slug)
    if (saved) { setDoc(saved); setFresh(true); setResumed(true) }
  }, [tpl])
  const restart = () => { setDoc(fromTemplate(tpl)); setFresh(true); setResumed(false) }
  const others = TEMPLATES.filter(t => t.cat === tpl.cat && t.slug !== tpl.slug).slice(0, 3)
  return (
    <Page>
      <SEO title={tpl.seoTitle} description={tpl.seoDesc} path={`/tools/document/${tpl.slug}`} />
      <Breadcrumbs items={crumbs(tpl.name)} />
      <h1 className="text-3xl sm:text-4xl font-bold mb-3"><span aria-hidden="true">{tpl.emoji} </span>{tpl.name} — לעריכה ולהדפסה</h1>
      {resumed && (
        <p className="mb-3 flex flex-wrap items-center gap-2">ממשיכים מהמסמך ששמרתם.
          <button type="button" className="dc-btn alt sm" onClick={restart}>🔄 להתחיל מחדש מהתבנית</button>
        </p>
      )}
      <Editor key={doc.id} initial={doc} fresh={fresh} />
      <h2 className="text-2xl font-bold mt-10 mb-3">תבניות נוספות</h2>
      <TemplateGrid exclude={tpl.slug} />
      <div className="mt-12"><SeoBody
        paragraphs={[tpl.about, `מחליפים את הטקסט שבסוגריים המרובעים, משנים מה שרוצים, ומדפיסים או שומרים כ-PDF. אפשר גם להוריד את ה${tpl.name} כקובץ וורד ולהמשיך לערוך שם. המסמך נשמר רק בדפדפן שלכם.`]}
        faq={FAQ.slice(0, 3)}
        related={[{ label: 'עורך מסמכים: כל התבניות', href: '/tools/document' }, ...others.map(t => ({ label: t.name, href: `/tools/document/${t.slug}` }))]}
      /></div>
    </Page>
  )
}

export default function DocEditor() {
  const { template } = useParams()
  if (!template) return <Hub />
  const tpl = templateBySlug(template)
  if (!tpl) return <NotFound />
  return <TemplatePage key={tpl.slug} tpl={tpl} />
}
