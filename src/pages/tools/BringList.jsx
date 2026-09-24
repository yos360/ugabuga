import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useParams, useSearchParams, useNavigate } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { partyDb, partyMemory, shortLink, newId } from '../../utils/partyDb'
import { PARTY_TEMPLATES, OTHER_CAT } from '../../data/partyTemplates'

const POLL_MS = 10000
const DEFAULT_TEMPLATE = PARTY_TEMPLATES[0]
const fromTemplate = tpl => tpl.items.map(i => ({ id: newId(), text: i.text, qty: i.qty || '', cat: i.cat || OTHER_CAT, takenBy: '' }))
const errorText = code => ({
  item_already_taken: 'אופס — מישהו תפס את זה רגע לפניכם 🙂',
  list_not_found: 'לא מצאנו את הרשימה. אולי הקישור נחתך?',
  not_owner: 'רק מי שיצר/ה את הרשימה יכול/ה לערוך אותה.',
  not_your_claim: 'אפשר לבטל רק פריט שתפסתם מהמכשיר הזה.',
}[code] || 'משהו השתבש בחיבור. נסו שוב בעוד רגע.')

// Items grouped by category, categories in first-seen order.
function groupByCat(items) {
  const groups = new Map()
  for (const item of items) {
    const cat = item.cat || OTHER_CAT
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat).push(item)
  }
  return [...groups.entries()]
}
function formatDate(value) {
  if (!value) return ''
  const d = new Date(`${value}T00:00:00`)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'numeric' })
}
function detailLines(details = {}) {
  return [details.date && `📅 ${formatDate(details.date)}`, details.time && `🕔 ${details.time}`, details.place && `📍 ${details.place}`].filter(Boolean)
}
function inviteText(title, details, code) {
  const when = detailLines(details).join(' · ')
  return `🧺 מי מביא מה ל${title || 'מסיבה'}?${when ? `\n${when}` : ''}\nתפסו פריט בלחיצה — בלי הרשמה 👇\n${shortLink(code)}`
}

function useToast() {
  const [toast, setToast] = useState(null)
  const timer = useRef()
  const show = useCallback((text, tone = 'ok') => {
    clearTimeout(timer.current); setToast({ text, tone })
    timer.current = setTimeout(() => setToast(null), 3200)
  }, [])
  const node = toast && createPortal(<div data-bl-toast role="status" aria-live="polite" className={`fixed inset-x-4 bottom-24 z-50 mx-auto max-w-md rounded-2xl px-4 py-3 text-center font-bold text-white shadow-lg ${toast.tone === 'err' ? 'bg-rose-600' : 'bg-slate-900'}`}>{toast.text}</div>, document.body)
  return [node, show]
}

// ─── Organizer (create / edit) ────────────────────────────────────────────────
function OrganizerView({ code: initialCode, onDone }) {
  const [code, setCode] = useState(initialCode || null)
  const ownerToken = useRef(initialCode ? partyMemory.ownerToken(initialCode) : null)
  const [title, setTitle] = useState('')
  const [items, setItems] = useState(() => initialCode ? [] : fromTemplate(DEFAULT_TEMPLATE))
  const [details, setDetails] = useState({})
  const [showDetails, setShowDetails] = useState(false)
  const [templateId, setTemplateId] = useState(initialCode ? null : DEFAULT_TEMPLATE.id)
  const [loading, setLoading] = useState(Boolean(initialCode))
  const [newItem, setNewItem] = useState('')
  const [focusId, setFocusId] = useState(null)
  const [status, setStatus] = useState('idle') // idle | saving | saved | error
  const [busy, setBusy] = useState(false)
  const [toast, showToast] = useToast()
  const dirty = useRef(false), saveTimer = useRef(), releases = useRef([]), edited = useRef(false)
  const addRef = useRef()

  useEffect(() => {
    if (!initialCode) return
    partyDb.get(initialCode).then(row => {
      setTitle(row.title); setItems(row.items); setDetails(row.details || {})
      if (detailLines(row.details).length || row.details?.note) setShowDetails(true)
    }).catch(e => showToast(errorText(e.code), 'err')).finally(() => setLoading(false))
  }, [initialCode, showToast])

  // Autosave once the list exists.
  const save = useCallback(async (nextTitle, nextItems, nextDetails) => {
    if (!code || !ownerToken.current) return
    setStatus('saving')
    try {
      const release = releases.current; releases.current = []
      const row = await partyDb.update(code, ownerToken.current, nextTitle, nextItems.filter(i => i.text.trim()), release, nextDetails)
      dirty.current = false
      setItems(old => { const blanks = old.filter(i => !i.text.trim()); return [...row.items, ...blanks] })
      setStatus('saved')
    } catch (e) { setStatus('error'); showToast(errorText(e.code), 'err') }
  }, [code, showToast])
  const schedule = (t, it, d) => {
    edited.current = true
    if (!code) return
    dirty.current = true; setStatus('saving')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(t, it, d), 700)
  }
  const changeTitle = v => { setTitle(v); schedule(v, items, details) }
  const changeItems = next => { setItems(next); schedule(title, next, details) }
  const changeDetail = (key, value) => { const next = { ...details, [key]: value }; setDetails(next); schedule(title, items, next) }
  const patchItem = (id, patch) => changeItems(items.map(i => i.id === id ? { ...i, ...patch } : i))

  useEffect(() => {
    if (!code) return
    const t = setInterval(() => {
      if (!dirty.current && document.visibilityState === 'visible') partyDb.get(code).then(row => { if (!dirty.current) setItems(old => [...row.items, ...old.filter(i => !i.text.trim())]) }).catch(() => {})
    }, POLL_MS)
    return () => clearInterval(t)
  }, [code])

  const pickTemplate = tpl => {
    if (tpl.id === templateId) return
    if (edited.current && items.some(i => i.text.trim()) && !window.confirm('להחליף את הרשימה בתבנית החדשה? השינויים שעשיתם יימחקו.')) return
    setTemplateId(tpl.id); setItems(fromTemplate(tpl)); edited.current = false
  }
  const addToCat = cat => { const id = newId(); changeItems([...items, { id, text: '', qty: '', cat, takenBy: '' }]); setFocusId(id) }
  const add = () => {
    const t = newItem.trim(); if (!t) return
    changeItems([...items, { id: newId(), text: t, qty: '', cat: OTHER_CAT, takenBy: '' }]); setNewItem(''); addRef.current?.focus()
  }
  const remove = id => changeItems(items.filter(i => i.id !== id))
  const release = id => { releases.current.push(id); changeItems(items.map(i => i.id === id ? { ...i, takenBy: '', arrived: false } : i)) }

  const ensureCreated = async () => {
    if (code) return code
    const token = crypto.randomUUID?.() || newId() + newId()
    const row = await partyDb.create(token, title.trim() || 'הרשימה שלנו', items.filter(i => i.text.trim()), details)
    ownerToken.current = token
    partyMemory.rememberOwned(row.share_code, token, row.title)
    setCode(row.share_code); setTitle(row.title); setItems(row.items); setStatus('saved')
    window.history.replaceState(window.history.state, '', `/l/${row.share_code}?edit=1`)
    return row.share_code
  }
  const shareWhatsApp = async () => {
    const isNew = !code
    // Open the window inside the tap itself: phones block popups opened after an await.
    const win = isNew ? window.open('', '_blank') : null
    setBusy(true)
    try {
      const c = await ensureCreated()
      const url = `https://wa.me/?text=${encodeURIComponent(inviteText(title.trim() || 'הרשימה שלנו', details, c))}`
      if (win) win.location.href = url
      else if (isNew) { onDone(c, 'הרשימה מוכנה ✓'); window.location.href = url; return }
      else window.open(url, '_blank', 'noopener')
      if (isNew) onDone(c, 'הרשימה נשלחה ✓ כאן רואים מי מביא מה')
    } catch (e) { win?.close(); showToast(errorText(e.code), 'err') } finally { setBusy(false) }
  }
  const copyLink = async () => {
    const isNew = !code
    setBusy(true)
    try {
      const c = await ensureCreated()
      let msg = 'הקישור הועתק ✓'
      try { await navigator.clipboard.writeText(shortLink(c)) } catch { msg = shortLink(c) }
      if (isNew) onDone(c, msg + ' — הדביקו אותו בוואטסאפ'); else showToast(msg)
    } catch (e) { showToast(errorText(e.code), 'err') } finally { setBusy(false) }
  }

  const filled = items.filter(i => i.text.trim())
  const taken = filled.filter(i => i.takenBy).length
  if (loading) return <p className="py-16 text-center text-lg">טוענים את הרשימה…</p>
  const tpl = PARTY_TEMPLATES.find(t => t.id === templateId)

  return <>
    {!code && <section className="mb-4" aria-label="תבניות">
      <h2 className="mb-2 font-bold">1. מה חוגגים?</h2>
      <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2">
        {PARTY_TEMPLATES.map(t => <button key={t.id} onClick={() => pickTemplate(t)} aria-pressed={t.id === templateId}
          className={`min-h-[64px] w-[132px] shrink-0 snap-start rounded-2xl border-2 px-3 py-2 text-start ${t.id === templateId ? 'border-slate-900 bg-[var(--postit)] shadow-[3px_3px_0_#0f172a]' : 'border-slate-200 bg-white'}`}>
          <span className="block text-2xl leading-none">{t.emoji}</span>
          <span className="mt-1 block text-sm font-bold leading-tight">{t.name}</span>
          <span className="block text-xs text-slate-500">{t.items.length ? `${t.items.length} פריטים` : 'מאפס'}</span>
        </button>)}
      </div>
      {tpl?.hint && <p className="mt-1 text-sm text-slate-500">{tpl.hint} · הכמויות מחושבות לכ-20 אורחים, ואפשר לשנות הכול.</p>}
    </section>}

    <section className="wobbly border-2 border-[var(--border)] bg-white p-4 sm:p-6 sketch-shadow">
      {code && <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">✏️ מצב עריכה — כאן משנים את הרשימה עצמה. כדי לרשום מי מביא, לחצו "סיום עריכה".</p>}
      <label className="block font-bold" htmlFor="bl-title">{code ? 'שם האירוע' : '2. לאיזה אירוע?'}</label>
      <input id="bl-title" value={title} onChange={e => changeTitle(e.target.value)} placeholder={`למשל: ${tpl?.title && tpl.title !== '' ? tpl.title.replace('…', 'נועה') : 'יום הולדת לנועה'}`} maxLength={80}
        className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-3 text-xl font-bold placeholder:font-normal placeholder:text-slate-400 focus:border-slate-800 focus:outline-none" />

      <button onClick={() => setShowDetails(v => !v)} aria-expanded={showDetails} className="mt-3 flex min-h-[44px] w-full items-center justify-between rounded-xl bg-slate-50 px-3 text-start font-bold">
        <span>📅 מתי ואיפה? <span className="font-normal text-slate-500">(לא חובה)</span></span><span aria-hidden="true">{showDetails ? '▲' : '▼'}</span>
      </button>
      {showDetails && <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="text-sm font-bold">תאריך<input type="date" value={details.date || ''} onChange={e => changeDetail('date', e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 px-2 py-2 text-base" /></label>
        <label className="text-sm font-bold">שעה<input type="time" value={details.time || ''} onChange={e => changeDetail('time', e.target.value)} className="mt-1 w-full rounded-xl border-2 border-slate-200 px-2 py-2 text-base" /></label>
        <label className="col-span-2 text-sm font-bold">מקום<input value={details.place || ''} onChange={e => changeDetail('place', e.target.value)} maxLength={80} placeholder="למשל: אצלנו בבית / פארק הירקון" className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-base font-normal" /></label>
        <label className="col-span-2 text-sm font-bold">הודעה לאורחים<textarea value={details.note || ''} onChange={e => changeDetail('note', e.target.value)} maxLength={300} rows={2} placeholder="למשל: בלי בוטנים בבקשה 🙏" className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-base font-normal" /></label>
      </div>}

      <div className="mt-5 flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-bold">{code ? 'מה צריך להביא?' : '3. מה צריך להביא?'}</h2>
        {code && <span className="text-sm font-bold text-emerald-700">{taken}/{filled.length} נתפסו</span>}
      </div>
      {groupByCat(items).map(([cat, catItems]) => <div key={cat} className="mt-3">
        <h3 className="text-sm font-bold text-slate-500">{cat}</h3>
        <ul className="divide-y divide-slate-100">
          {catItems.map(item => <li key={item.id} className="flex min-h-[52px] items-center gap-1.5 py-1.5">
            <input value={item.text} autoFocus={item.id === focusId} onChange={e => patchItem(item.id, { text: e.target.value })} aria-label="פריט" placeholder="שם הפריט"
              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-2 text-base focus:border-slate-800 focus:outline-none" />
            <input value={item.qty || ''} onChange={e => patchItem(item.id, { qty: e.target.value })} aria-label={`כמות ${item.text}`} placeholder="כמות" maxLength={30}
              className="w-[5.5rem] shrink-0 rounded-lg border border-slate-200 px-2 py-2 text-sm text-slate-600 focus:border-slate-800 focus:outline-none" />
            {item.takenBy && <button onClick={() => release(item.id)} title="שחרור" aria-label={`שחרור ${item.text} מ${item.takenBy}`}
              className="max-w-[6.5rem] shrink-0 truncate rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">🙋 {item.takenBy} ↺</button>}
            <button onClick={() => remove(item.id)} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`מחיקת ${item.text || 'פריט'}`}>✕</button>
          </li>)}
        </ul>
        {cat !== OTHER_CAT && <button onClick={() => addToCat(cat)} className="mt-1 min-h-[40px] px-1 text-sm font-bold text-slate-600 underline decoration-dashed">＋ עוד ל{cat.replace(/^\S+\s/, '')}</button>}
      </div>)}
      <form className="mt-4 flex gap-2" onSubmit={e => { e.preventDefault(); add() }}>
        <input ref={addRef} value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="הוסיפו פריט…" aria-label="פריט חדש" enterKeyHint="done"
          className="min-w-0 flex-1 rounded-xl border-2 border-dashed border-slate-300 px-3 py-3 text-lg focus:border-slate-800 focus:outline-none" />
        <button className="shrink-0 rounded-xl border-2 border-slate-800 bg-white px-4 text-lg font-bold" aria-label="הוספת פריט">＋</button>
      </form>
    </section>

    {code && <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 py-3">
      <span className="text-sm text-slate-600">הקישור לאורחים: <bdi dir="ltr" className="font-bold text-slate-900">{shortLink(code).replace(/^https?:\/\//, '')}</bdi></span>
      <span className="text-sm font-bold" aria-live="polite">{status === 'saving' ? 'שומרים…' : status === 'error' ? '⚠️ לא נשמר' : '✓ נשמר'}</span>
    </div>}
    {code && <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
      <button onClick={() => onDone(code)} disabled={status === 'saving'} className="min-h-[48px] rounded-2xl bg-slate-900 px-5 font-bold text-white disabled:opacity-60">✅ סיום עריכה — לרשימה</button>
    </div>}

    {/* Fixed (not sticky): the site's overflow-x:hidden wrapper disables sticky. */}
    <div className="h-28 print:hidden" aria-hidden="true" />
    {createPortal(
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,.06)] backdrop-blur print:hidden" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <div className="mx-auto flex max-w-xl gap-2">
          <button onClick={shareWhatsApp} disabled={busy || !filled.length} className="min-h-[52px] min-w-0 flex-1 whitespace-nowrap rounded-2xl bg-[#25D366] px-3 text-base font-bold text-white shadow disabled:opacity-60 sm:text-lg">{busy ? 'רגע…' : code ? 'שליחה בוואטסאפ' : '4. שליחה בוואטסאפ'}</button>
          <button onClick={copyLink} disabled={busy || !filled.length} className="min-h-[52px] shrink-0 whitespace-nowrap rounded-2xl border-2 border-slate-800 bg-white px-3 font-bold disabled:opacity-60" aria-label="העתקת קישור">🔗 העתקה</button>
        </div>
      </div>,
      document.body)}
    {toast}
  </>
}

// ─── List view (guests and the organizer) ─────────────────────────────────────
function ItemText({ item }) {
  return <span className="min-w-0">
    <span className="block text-lg leading-tight">{item.text}</span>
    {item.qty && <span className="block text-sm text-slate-500">כמות: {item.qty}</span>}
  </span>
}

function GuestView({ code, isOwner, onEdit, flash }) {
  const [list, setList] = useState(null)
  const [error, setError] = useState('')
  const [name, setName] = useState(partyMemory.guestName())
  const [mine, setMine] = useState(() => partyMemory.claims(code))
  const [asking, setAsking] = useState(null)
  const [draftName, setDraftName] = useState('')
  const [pending, setPending] = useState(null)
  const [toast, showToast] = useToast()
  const merge = row => setList(prev => ({ ...prev, ...row }))

  const flashShown = useRef(false)
  useEffect(() => {
    if (!flash || !list || flashShown.current) return
    flashShown.current = true
    showToast(flash)
    try { window.history.replaceState({ ...window.history.state, usr: null }, '') } catch { /* ignore */ }
  }, [flash, list, showToast])
  const refresh = useCallback(() => partyDb.get(code).then(setList).catch(e => setError(errorText(e.code))), [code])
  useEffect(() => { refresh() }, [refresh])
  useEffect(() => {
    const t = setInterval(() => { if (document.visibilityState === 'visible') refresh() }, POLL_MS)
    return () => clearInterval(t)
  }, [refresh])

  const claim = async (item, who) => {
    setPending(item.id)
    const token = crypto.randomUUID?.() || newId() + newId()
    try {
      const row = await partyDb.claim(code, item.id, who, token)
      partyMemory.setClaim(code, item.id, token); setMine(partyMemory.claims(code))
      merge(row); showToast(`מעולה! ${who} מביא/ה ${item.text} ✓`)
    } catch (e) { showToast(errorText(e.code), 'err'); refresh() } finally { setPending(null) }
  }
  const tap = item => { if (name) claim(item, name); else { setDraftName(''); setAsking(item) } }
  const confirmName = e => {
    e.preventDefault()
    const who = draftName.trim(); if (!who) return
    partyMemory.setGuestName(who); setName(who)
    const item = asking; setAsking(null); claim(item, who)
  }
  const unclaim = async item => {
    setPending(item.id)
    try {
      const row = await partyDb.unclaim(code, item.id, mine[item.id])
      partyMemory.setClaim(code, item.id, null); setMine(partyMemory.claims(code))
      merge(row); showToast('בוטל — הפריט חזר לרשימה')
    } catch (e) { showToast(errorText(e.code), 'err'); refresh() } finally { setPending(null) }
  }
  // Organizer only: tick what already arrived on the day.
  const toggleArrived = async item => {
    const token = partyMemory.ownerToken(code); if (!token) return
    setPending(item.id)
    try {
      const next = list.items.map(i => i.id === item.id ? { ...i, arrived: !i.arrived } : i)
      merge({ items: next })
      merge(await partyDb.update(code, token, list.title, next, [], null))
    } catch (e) { showToast(errorText(e.code), 'err'); refresh() } finally { setPending(null) }
  }

  if (error) return <div className="mx-auto max-w-md py-16 text-center"><p className="text-xl font-bold">{error}</p><Link to="/tools/bring-list" className="mt-6 inline-block rounded-xl border-2 border-slate-800 bg-white px-5 py-3 font-bold">פתחו רשימה חדשה</Link></div>
  if (!list) return <p className="py-16 text-center text-lg">טוענים את הרשימה…</p>

  const items = list.items.filter(i => i.text?.trim())
  const free = items.filter(i => !i.takenBy)
  const mineItems = items.filter(i => i.takenBy && mine[i.id])
  const others = items.filter(i => i.takenBy && !mine[i.id])
  const takenCount = items.length - free.length
  const pct = items.length ? Math.round(100 * takenCount / items.length) : 0
  const details = list.details || {}
  const chips = detailLines(details)
  const invite = inviteText(list.title, details, code)
  const copyOwnerLink = async () => { try { await navigator.clipboard.writeText(shortLink(code)); showToast('הקישור הועתק ✓') } catch { showToast(shortLink(code)) } }
  const ArrivedButton = ({ item }) => isOwner
    ? <button onClick={() => toggleArrived(item)} disabled={pending === item.id} aria-pressed={Boolean(item.arrived)} className={`min-h-[36px] shrink-0 rounded-lg border px-2 text-xs font-bold ${item.arrived ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white text-slate-600'}`}>{item.arrived ? '✓ הגיע' : 'הגיע?'}</button>
    : item.arrived ? <span className="shrink-0 text-xs font-bold text-emerald-700">✓ הגיע</span> : null

  return <>
    {isOwner && <div className="mb-5 rounded-2xl border-2 border-slate-800 bg-[var(--postit)] p-3 print:hidden">
      <p className="text-center font-bold">⭐ זו הרשימה שלך <span className="font-normal">· גם את/ה יכול/ה לתפוס</span></p>
      <a href={`https://wa.me/?text=${encodeURIComponent(invite)}`} target="_blank" rel="noopener" className="mt-2 grid min-h-[48px] place-items-center rounded-xl bg-[#25D366] px-3 font-bold text-white">שליחה בוואטסאפ</a>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {[['✏️', 'עריכה', onEdit], ['🔗', 'העתקה', copyOwnerLink], ['🖨️', 'הדפסה', () => window.print()]].map(([icon, label, fn]) =>
          <button key={label} onClick={fn} className="flex min-h-[52px] flex-col items-center justify-center rounded-xl border-2 border-slate-800 bg-white text-sm font-bold leading-tight"><span aria-hidden="true">{icon}</span>{label}</button>)}
      </div>
    </div>}

    <header className="mb-4 text-center">
      <p className="text-sm font-bold text-slate-500">🧺 מי מביא מה?</p>
      <h1 className="mt-1 text-3xl sm:text-5xl">{list.title}</h1>
      {chips.length > 0 && <div className="mt-3 flex flex-wrap justify-center gap-2">{chips.map(c => <span key={c} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm font-bold">{c}</span>)}</div>}
      {details.note && <p className="mx-auto mt-3 max-w-md rounded-2xl bg-amber-50 px-4 py-2 text-start">💬 {details.note}</p>}
    </header>

    <section className="mb-4 rounded-2xl border-2 border-slate-200 bg-white p-4" aria-label="מצב ההתארגנות">
      <div className="flex items-baseline justify-between gap-2">
        <b>{free.length ? `${takenCount} מתוך ${items.length} כבר נתפסו` : 'הכול נתפס! תודה לכולם 🎉'}</b>
        {mineItems.length > 0 && <span className="text-sm font-bold text-emerald-700">את/ה מביא/ה {mineItems.length}</span>}
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="כמה כבר נתפס"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} /></div>
      {name && <p className="mt-2 text-sm text-slate-600">נרשמים בשם <b>{name}</b> · <button className="underline" onClick={() => { partyMemory.setGuestName(''); setName('') }}>לא אני</button></p>}
    </section>

    {mineItems.length > 0 && <section className="mb-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4">
      <h2 className="font-bold">✅ אני מביא/ה</h2>
      <ul className="mt-2 space-y-2">{mineItems.map(item => <li key={item.id} className="flex min-h-[48px] items-center justify-between gap-2">
        <ItemText item={item} />
        <span className="flex shrink-0 items-center gap-2"><ArrivedButton item={item} />
          <button onClick={() => unclaim(item)} disabled={pending === item.id} className="min-h-[44px] rounded-xl border border-slate-400 bg-white px-3 text-sm font-bold">{pending === item.id ? '…' : 'ביטול'}</button></span>
      </li>)}</ul>
    </section>}

    {free.length > 0 && <section className="wobbly border-2 border-[var(--border)] bg-white p-4 sketch-shadow">
      <h2 className="font-bold">עדיין חסר ({free.length})</h2>
      {groupByCat(free).map(([cat, catItems]) => <div key={cat} className="mt-3">
        <h3 className="text-sm font-bold text-slate-500">{cat}</h3>
        <ul className="divide-y divide-slate-100">{catItems.map(item => <li key={item.id} className="flex min-h-[60px] items-center justify-between gap-3 py-2">
          <ItemText item={item} />
          <button onClick={() => tap(item)} disabled={Boolean(pending)} className="min-h-[48px] shrink-0 whitespace-nowrap rounded-xl bg-slate-900 px-3 text-[15px] font-bold text-white disabled:opacity-60 print:hidden">{pending === item.id ? 'רושמים…' : 'אני מביא/ה 🙋'}</button>
        </li>)}</ul>
      </div>)}
    </section>}

    {others.length > 0 && <section className="mt-4 rounded-2xl bg-slate-50 p-4">
      <h2 className="text-sm font-bold text-slate-500">כבר נתפס ({others.length})</h2>
      <ul className="mt-2 space-y-2">{others.map(item => <li key={item.id} className="flex min-h-[36px] items-center justify-between gap-3 text-slate-600">
        <span className="min-w-0"><span className="line-through decoration-slate-300">{item.text}</span>{item.qty && <span className="text-xs text-slate-400"> · {item.qty}</span>}</span>
        <span className="flex shrink-0 items-center gap-2"><span className="text-sm font-bold">🙋 {item.takenBy}</span><ArrivedButton item={item} /></span>
      </li>)}</ul>
    </section>}

    <p className="mt-8 text-center text-sm text-slate-500 print:hidden">מארגנים אירוע משלכם? <Link to="/tools/bring-list" className="font-bold underline">פתחו רשימה כזו בחינם</Link></p>

    {asking && createPortal(<div className="fixed inset-0 z-50 grid items-end bg-black/40 sm:items-center" onClick={() => setAsking(null)}>
      <form onSubmit={confirmName} onClick={e => e.stopPropagation()} className="mx-auto w-full max-w-md rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl" role="dialog" aria-modal="true" aria-labelledby="bl-name-q">
        <h2 id="bl-name-q" className="text-xl font-bold">איך קוראים לך?</h2>
        <p className="mt-1 text-slate-600">כדי שכולם יידעו מי מביא {asking.text}. נזכור את השם לפעם הבאה.</p>
        <input autoFocus value={draftName} onChange={e => setDraftName(e.target.value)} maxLength={40} placeholder="למשל: דנה (אמא של יובל)" enterKeyHint="done"
          className="mt-3 w-full rounded-xl border-2 border-slate-300 px-3 py-3 text-lg focus:border-slate-800 focus:outline-none" />
        <div className="mt-4 flex gap-2">
          <button disabled={!draftName.trim()} className="min-h-[52px] flex-1 rounded-2xl bg-slate-900 text-lg font-bold text-white disabled:opacity-50">אני מביא/ה {asking.text}</button>
          <button type="button" onClick={() => setAsking(null)} className="min-h-[52px] rounded-2xl border-2 border-slate-300 px-4 font-bold">ביטול</button>
        </div>
      </form>
    </div>, document.body)}
    {toast}
  </>
}

// Links sent before the fix packed the whole list into the URL and could never
// save claims. Show what they held and point people to a working list.
function LegacyView({ encoded }) {
  const data = useMemo(() => { try { return JSON.parse(decodeURIComponent(escape(atob(encoded)))) } catch { return null } }, [encoded])
  return <div className="mx-auto max-w-md py-10 text-center">
    <h1 className="text-3xl">{data?.title || 'מי מביא מה?'}</h1>
    <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-lg">זה קישור ישן שלא שומר מי תפס מה. בקשו ממי ששלח/ה לפתוח רשימה חדשה — הקישור החדש קצר ושומר הכול.</p>
    {data?.items?.length > 0 && <ul className="mt-4 space-y-1 text-lg">{data.items.map((i, n) => <li key={n}>{i.text}{i.takenBy ? ` — ${i.takenBy}` : ''}</li>)}</ul>}
    <Link to="/tools/bring-list" className="mt-6 inline-block rounded-xl border-2 border-slate-800 bg-white px-5 py-3 font-bold">פתחו רשימה חדשה</Link>
  </div>
}

export default function BringList() {
  const navigate = useNavigate()
  const location = useLocation()
  const { code: pathCode } = useParams()
  const [params, setParams] = useSearchParams()
  const code = pathCode || params.get('code')
  const legacy = params.get('list')
  const isOwner = Boolean(code && partyMemory.ownerToken(code))
  const guest = Boolean(code) && !(isOwner && params.has('edit'))
  const myLists = partyMemory.myLists().filter(l => l.code !== code).slice(0, 5)

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6">
      <SEO title="מי מביא מה? רשימה שיתופית למסיבה" description="מי מביא מה? רשימה שיתופית למסיבה: תבניות מוכנות ליום הולדת, מסיבת כיתה ועל האש, כמויות מומלצות וקישור קצר אחד לוואטסאפ — בלי הרשמה ובלי כפילויות." path="/tools/bring-list" noindex={Boolean(code || legacy)} />
      {legacy && !code ? <LegacyView encoded={legacy} /> : guest ? <>
        <GuestView key={code} code={code} isOwner={isOwner} flash={location.state?.flash} onEdit={() => setParams({ edit: '1' })} />
      </> : <>
        <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'מי מביא מה?' }]} />
        <header className="mb-5 text-center">
          <h1 className="text-4xl sm:text-5xl">🧺 מי מביא מה?</h1>
          <p className="mt-2 text-lg text-[var(--muted-foreground)]">בוחרים סוג אירוע, מקבלים רשימה מוכנה עם כמויות, שולחים קישור לוואטסאפ — וכל אחד תופס פריט בלחיצה. בלי הרשמה.</p>
        </header>
        {!code && myLists.length > 0 && <div className="mb-4 rounded-2xl bg-[var(--postit)] p-3 text-sm"><b>הרשימות שלי:</b> {myLists.map((l, n) => <span key={l.code}>{n > 0 && ' · '}<Link className="underline" to={`/l/${l.code}`}>{l.title}</Link></span>)}</div>}
        <OrganizerView key={code || 'new'} code={code} onDone={(c, flash) => navigate(`/l/${c}`, { state: flash ? { flash } : null })} />
      </>}
    </div>
  )
}
