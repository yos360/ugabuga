import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useParams, useSearchParams, useNavigate } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { partyDb, partyMemory, shortLink, newId } from '../../utils/partyDb'

const STARTER = ['עוגה', 'שתייה', 'כוסות', 'צלחות', 'מפיות', 'פירות']
const SUGGESTIONS = ['חטיפים', 'סכו״ם', 'נרות', 'בלונים', 'ירקות חתוכים', 'פיצות', 'מפה חד״פ', 'קרח', 'שקיות אשפה', 'רמקול', 'מגבונים', 'עוגיות', 'שתייה קלה', 'מים']
const POLL_MS = 10000
const withIds = texts => texts.map(text => ({ id: newId(), text, takenBy: '' }))
const errorText = code => ({
  item_already_taken: 'אופס — מישהו תפס את זה רגע לפניכם 🙂',
  list_not_found: 'לא מצאנו את הרשימה. אולי הקישור נחתך?',
  not_owner: 'רק מי שיצר/ה את הרשימה יכול/ה לערוך אותה.',
  not_your_claim: 'אפשר לבטל רק פריט שתפסתם מהמכשיר הזה.',
}[code] || 'משהו השתבש בחיבור. נסו שוב בעוד רגע.')

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

// ─── Organizer ────────────────────────────────────────────────────────────────
function OrganizerView({ code: initialCode, onDone }) {
  const [code, setCode] = useState(initialCode || null)
  const ownerToken = useRef(initialCode ? partyMemory.ownerToken(initialCode) : null)
  const [title, setTitle] = useState('')
  const [items, setItems] = useState(() => initialCode ? [] : withIds(STARTER))
  const [loading, setLoading] = useState(Boolean(initialCode))
  const [newItem, setNewItem] = useState('')
  const [status, setStatus] = useState('idle') // idle | saving | saved | error
  const [busy, setBusy] = useState(false)
  const [toast, showToast] = useToast()
  const dirty = useRef(false), saveTimer = useRef(), releases = useRef([])
  const addRef = useRef()

  // Load an existing list this device owns.
  useEffect(() => {
    if (!initialCode) return
    partyDb.get(initialCode).then(row => { setTitle(row.title); setItems(row.items) }).catch(e => showToast(errorText(e.code), 'err')).finally(() => setLoading(false))
  }, [initialCode, showToast])

  // Autosave after the list exists.
  const save = useCallback(async (nextTitle, nextItems) => {
    if (!code || !ownerToken.current) return
    setStatus('saving')
    try {
      const release = releases.current; releases.current = []
      const row = await partyDb.update(code, ownerToken.current, nextTitle, nextItems.map(({ id, text, takenBy }) => ({ id, text, takenBy })), release)
      dirty.current = false
      setItems(row.items); setStatus('saved')
    } catch (e) { setStatus('error'); showToast(errorText(e.code), 'err') }
  }, [code, showToast])
  const schedule = (nextTitle, nextItems) => {
    if (!code) return
    dirty.current = true; setStatus('saving')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(nextTitle, nextItems), 700)
  }
  const changeTitle = v => { setTitle(v); schedule(v, items) }
  const changeItems = next => { setItems(next); schedule(title, next) }

  // See guests' claims arrive without refreshing.
  useEffect(() => {
    if (!code) return
    const t = setInterval(() => { if (!dirty.current && document.visibilityState === 'visible') partyDb.get(code).then(row => { if (!dirty.current) setItems(row.items) }).catch(() => {}) }, POLL_MS)
    return () => clearInterval(t)
  }, [code])

  const addText = text => {
    const t = text.trim(); if (!t) return
    changeItems([...items, { id: newId(), text: t, takenBy: '' }])
  }
  const add = () => { addText(newItem); setNewItem(''); addRef.current?.focus() }
  const remove = id => changeItems(items.filter(i => i.id !== id))
  const release = id => { releases.current.push(id); changeItems(items.map(i => i.id === id ? { ...i, takenBy: '' } : i)) }
  const suggestions = SUGGESTIONS.filter(s => !items.some(i => i.text === s)).slice(0, 8)

  // First share creates the list; later shares reuse the same short link.
  const ensureCreated = async () => {
    if (code) return code
    const token = crypto.randomUUID?.() || newId() + newId()
    const row = await partyDb.create(token, title.trim() || 'הרשימה שלנו', items.map(({ id, text, takenBy }) => ({ id, text, takenBy })))
    ownerToken.current = token
    partyMemory.rememberOwned(row.share_code, token, row.title)
    setCode(row.share_code); setTitle(row.title); setItems(row.items); setStatus('saved')
    // Update the address bar without remounting (a remount would drop the toast
    // and flash "loading"). A refresh keeps the owner in edit mode.
    window.history.replaceState(window.history.state, '', `/l/${row.share_code}?edit=1`)
    return row.share_code
  }
  const inviteText = c => `🧺 מי מביא מה ל${(title.trim() || 'מסיבה')}?\nתפסו פריט בלחיצה — בלי הרשמה 👇\n${shortLink(c)}`
  const shareWhatsApp = async () => {
    const isNew = !code
    // Open the window inside the tap itself: phones block popups opened after an await.
    const win = isNew ? window.open('', '_blank') : null
    setBusy(true)
    try {
      const c = await ensureCreated()
      const url = `https://wa.me/?text=${encodeURIComponent(inviteText(c))}`
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

  const taken = items.filter(i => i.takenBy).length
  if (loading) return <p className="py-16 text-center text-lg">טוענים את הרשימה…</p>

  return <>
    <section className="wobbly border-2 border-[var(--border)] bg-white p-4 sm:p-6 sketch-shadow">
      <label className="block font-bold" htmlFor="bl-title">לאיזה אירוע?</label>
      <input id="bl-title" value={title} onChange={e => changeTitle(e.target.value)} placeholder="למשל: יום הולדת לנועה" maxLength={80}
        className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-3 text-xl font-bold placeholder:font-normal placeholder:text-slate-400 focus:border-slate-800 focus:outline-none" />

      {code && <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">✏️ מצב עריכה — כאן משנים את הרשימה עצמה. כדי לרשום מי מביא, לחצו "סיום עריכה".</p>}
      <div className="mt-5 flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-bold">מה צריך להביא?</h2>
        {code && <span className="text-sm font-bold text-emerald-700">{taken}/{items.length} נתפסו</span>}
      </div>
      <ul className="mt-2 divide-y divide-slate-100">
        {items.map((item, n) => <li key={item.id} className="flex min-h-[52px] items-center gap-2 py-1.5">
          <input value={item.text} onChange={e => changeItems(items.map(i => i.id === item.id ? { ...i, text: e.target.value } : i))} aria-label={`פריט ${n + 1}`}
            className="min-w-0 flex-1 rounded-lg border border-transparent px-2 py-2 text-lg hover:border-slate-200 focus:border-slate-800 focus:outline-none" />
          {item.takenBy
            ? <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 py-1 pe-1 ps-3 text-sm font-bold text-emerald-800">🙋 {item.takenBy}
                <button onClick={() => release(item.id)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-emerald-200" aria-label={`שחרור ${item.text} מ${item.takenBy}`} title="שחרור">↺</button></span>
            : code && <span className="shrink-0 text-sm text-slate-400">פנוי</span>}
          <button onClick={() => remove(item.id)} className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`מחיקת ${item.text}`}>✕</button>
        </li>)}
      </ul>
      <form className="mt-3 flex gap-2" onSubmit={e => { e.preventDefault(); add() }}>
        <input ref={addRef} value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="הוסיפו פריט…" aria-label="פריט חדש" enterKeyHint="done"
          className="min-w-0 flex-1 rounded-xl border-2 border-dashed border-slate-300 px-3 py-3 text-lg focus:border-slate-800 focus:outline-none" />
        <button className="shrink-0 rounded-xl border-2 border-slate-800 bg-white px-4 text-lg font-bold">＋</button>
      </form>
      {suggestions.length > 0 && <div className="mt-3 flex flex-wrap gap-2" aria-label="הצעות להוספה">
        {suggestions.map(s => <button key={s} onClick={() => addText(s)} className="min-h-[40px] rounded-full border border-slate-300 bg-slate-50 px-3 text-sm hover:bg-yellow-50">＋ {s}</button>)}
      </div>}
    </section>

    {code && <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 py-3">
      <span className="text-sm text-slate-600">הקישור לאורחים: <bdi dir="ltr" className="font-bold text-slate-900">{shortLink(code).replace(/^https?:\/\//, '')}</bdi></span>
      <span className="text-sm font-bold" aria-live="polite">{status === 'saving' ? 'שומרים…' : status === 'error' ? '⚠️ לא נשמר' : '✓ נשמר — אפשר לערוך גם אחרי השליחה'}</span>
    </div>}
    {code && <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
      <button onClick={() => onDone(code)} disabled={status === 'saving'} className="min-h-[48px] rounded-2xl bg-slate-900 px-5 font-bold text-white disabled:opacity-60">✅ סיום עריכה — לרשימה</button>
      <button onClick={() => window.print()} className="min-h-[48px] px-3 text-sm font-bold underline">🖨️ הדפסה</button>
    </div>}

    {/* The main action stays on screen on every device. Fixed, not sticky: the
        site's overflow-x:hidden wrapper disables position:sticky. */}
    <div className="h-28 print:hidden" aria-hidden="true" />
    {createPortal(
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,.06)] backdrop-blur print:hidden" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
      <div className="mx-auto flex max-w-xl gap-2">
        <button onClick={shareWhatsApp} disabled={busy || !items.length} className="min-h-[52px] min-w-0 flex-1 whitespace-nowrap rounded-2xl bg-[#25D366] px-3 text-base font-bold text-white shadow disabled:opacity-60 sm:text-lg">{busy ? 'רגע…' : 'שליחה בוואטסאפ'}</button>
        <button onClick={copyLink} disabled={busy || !items.length} className="min-h-[52px] shrink-0 whitespace-nowrap rounded-2xl border-2 border-slate-800 bg-white px-3 font-bold disabled:opacity-60" aria-label="העתקת קישור">🔗 העתקה</button>
      </div>
    </div>,
      document.body)}
    {toast}
  </>
}

// ─── Guest ────────────────────────────────────────────────────────────────────
function GuestView({ code, isOwner, onEdit, flash }) {
  const [list, setList] = useState(null)
  const [error, setError] = useState('')
  const [name, setName] = useState(partyMemory.guestName())
  const [mine, setMine] = useState(() => partyMemory.claims(code))
  const [asking, setAsking] = useState(null) // item waiting for a name
  const [draftName, setDraftName] = useState('')
  const [pending, setPending] = useState(null)
  const [toast, showToast] = useToast()

  useEffect(() => {
    if (!flash) return
    showToast(flash)
    // Don't replay the message on refresh (React Router keeps state in history.state.usr).
    try { window.history.replaceState({ ...window.history.state, usr: null }, '') } catch { /* ignore */ }
  }, [flash, showToast])
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
      setList(row); showToast(`מעולה! ${who} מביא/ה ${item.text} ✓`)
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
      setList(row); showToast('בוטל — הפריט חזר לרשימה')
    } catch (e) { showToast(errorText(e.code), 'err'); refresh() } finally { setPending(null) }
  }

  if (error) return <div className="mx-auto max-w-md py-16 text-center"><p className="text-xl font-bold">{error}</p><Link to="/tools/bring-list" className="mt-6 inline-block rounded-xl border-2 border-slate-800 bg-white px-5 py-3 font-bold">פתחו רשימה חדשה</Link></div>
  if (!list) return <p className="py-16 text-center text-lg">טוענים את הרשימה…</p>

  const free = list.items.filter(i => !i.takenBy)
  const mineItems = list.items.filter(i => i.takenBy && mine[i.id])
  const others = list.items.filter(i => i.takenBy && !mine[i.id])
  const pct = list.items.length ? Math.round(100 * (list.items.length - free.length) / list.items.length) : 0

  const invite = `🧺 מי מביא מה ל${list.title}?\nתפסו פריט בלחיצה — בלי הרשמה 👇\n${shortLink(code)}`
  const copyOwnerLink = async () => { try { await navigator.clipboard.writeText(shortLink(code)); showToast('הקישור הועתק ✓') } catch { showToast(shortLink(code)) } }

  return <>
    {isOwner && <div className="mb-5 rounded-2xl border-2 border-slate-800 bg-[var(--postit)] p-3">
      <p className="text-center font-bold">⭐ זו הרשימה שלך <span className="font-normal">· גם את/ה יכול/ה לתפוס</span></p>
      <a href={`https://wa.me/?text=${encodeURIComponent(invite)}`} target="_blank" rel="noopener" className="mt-2 grid min-h-[48px] place-items-center rounded-xl bg-[#25D366] px-3 font-bold text-white">שליחה בוואטסאפ</a>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button onClick={onEdit} className="min-h-[44px] rounded-xl border-2 border-slate-800 bg-white px-2 font-bold">✏️ עריכה</button>
        <button onClick={copyOwnerLink} className="min-h-[44px] rounded-xl border-2 border-slate-800 bg-white px-2 font-bold">🔗 העתקה</button>
      </div>
    </div>}
    <header className="mb-5 text-center">
      <p className="text-sm font-bold text-slate-500">🧺 מי מביא מה?</p>
      <h1 className="mt-1 text-3xl sm:text-5xl">{list.title}</h1>
      <p className="mt-2 text-lg">{free.length ? <>נשארו <b>{free.length}</b> דברים — תפסו משהו 🙂</> : <b>הכול נתפס! תודה לכולם 🎉</b>}</p>
      <div className="mx-auto mt-3 h-3 max-w-sm overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="כמה כבר נתפס"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} /></div>
      {name && <p className="mt-3 text-sm text-slate-600">נרשמים בשם <b>{name}</b> · <button className="underline" onClick={() => { partyMemory.setGuestName(''); setName('') }}>לא אני</button></p>}
    </header>

    {mineItems.length > 0 && <section className="mb-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4">
      <h2 className="font-bold">✅ אני מביא/ה</h2>
      <ul className="mt-2 space-y-2">{mineItems.map(item => <li key={item.id} className="flex min-h-[48px] items-center justify-between gap-2">
        <span className="text-lg font-bold">{item.text}</span>
        <button onClick={() => unclaim(item)} disabled={pending === item.id} className="min-h-[44px] rounded-xl border border-slate-400 bg-white px-3 text-sm font-bold">{pending === item.id ? '…' : 'ביטול'}</button>
      </li>)}</ul>
    </section>}

    {free.length > 0 && <section className="wobbly border-2 border-[var(--border)] bg-white p-4 sketch-shadow">
      <h2 className="font-bold">עדיין חסר</h2>
      <ul className="mt-2 divide-y divide-slate-100">{free.map(item => <li key={item.id} className="flex min-h-[60px] items-center justify-between gap-3 py-2">
        <span className="text-lg">{item.text}</span>
        <button onClick={() => tap(item)} disabled={Boolean(pending)} className="min-h-[48px] shrink-0 rounded-xl bg-slate-900 px-4 font-bold text-white disabled:opacity-60">{pending === item.id ? 'רושמים…' : 'אני מביא/ה 🙋'}</button>
      </li>)}</ul>
    </section>}

    {others.length > 0 && <section className="mt-4 rounded-2xl bg-slate-50 p-4">
      <h2 className="text-sm font-bold text-slate-500">כבר נתפס</h2>
      <ul className="mt-2 space-y-1.5">{others.map(item => <li key={item.id} className="flex items-center justify-between gap-3 text-slate-600">
        <span className="line-through decoration-slate-300">{item.text}</span><span className="text-sm font-bold">🙋 {item.takenBy}</span>
      </li>)}</ul>
    </section>}

    <p className="mt-8 text-center text-sm text-slate-500">מארגנים אירוע משלכם? <Link to="/tools/bring-list" className="font-bold underline">פתחו רשימה כזו בחינם</Link></p>

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
      <SEO title="מי מביא מה? רשימה שיתופית למסיבה" description="מי מביא מה? רשימה שיתופית למסיבה: מחלקים בין ההורים והאורחים מי מביא כיבוד, שתייה וציוד — קישור קצר אחד לוואטסאפ, בלי הרשמה ובלי כפילויות." path="/tools/bring-list" noindex={Boolean(code || legacy)} />
      {legacy && !code ? <LegacyView encoded={legacy} /> : guest ? <>
        <GuestView key={code} code={code} isOwner={isOwner} flash={location.state?.flash} onEdit={() => setParams({ edit: '1' })} />
      </> : <>
        <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'מי מביא מה?' }]} />
        <header className="mb-5 text-center">
          <h1 className="text-4xl sm:text-5xl">🧺 מי מביא מה?</h1>
          <p className="mt-2 text-lg text-[var(--muted-foreground)]">כותבים מה צריך, שולחים קישור לוואטסאפ, וכל אחד תופס פריט בלחיצה. בלי הרשמה.</p>
        </header>
        {!code && myLists.length > 0 && <div className="mb-4 rounded-2xl bg-[var(--postit)] p-3 text-sm"><b>הרשימות שלי:</b> {myLists.map((l, n) => <span key={l.code}>{n > 0 && ' · '}<Link className="underline" to={`/l/${l.code}`}>{l.title}</Link></span>)}</div>}
        <OrganizerView key={code || 'new'} code={code} onDone={(c, flash) => navigate(`/l/${c}`, { state: flash ? { flash } : null })} />
      </>}
    </div>
  )
}
