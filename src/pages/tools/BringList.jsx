import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { partyDb, partyMemory, shortLink, newId } from '../../utils/partyDb'

const POLL_MS = 10000
const starter = ['עוגה', 'שתייה', 'כוסות', 'צלחות', 'פירות', 'מפיות', 'בלונים', 'רמקול']
const fresh = () => starter.map(text => ({ id: newId(), text, takenBy: '' }))
const newToken = () => crypto.randomUUID?.() || newId() + newId()
// Lists touched by the short-lived "split" version may carry claims[]; show their names too.
const takerOf = item => item.takenBy || (item.claims || []).map(c => c.name).join(', ')
const errorText = code => ({
  item_already_taken: 'אופס — מישהו תפס את זה רגע לפניכם 🙂',
  list_not_found: 'לא מצאנו את הרשימה. אולי הקישור נחתך?',
  not_owner: 'רק מי שיצר/ה את הרשימה יכול/ה לשנות אותה.',
  not_your_claim: 'אפשר לבטל רק פריט שתפסתם מהמכשיר הזה.',
}[code] || 'משהו השתבש בחיבור. נסו שוב בעוד רגע.')
const inviteText = (title, code) => `🧺 מי מביא מה ל${title || 'מסיבה'}?\nתפסו פריט בלחיצה — בלי הרשמה 👇\n${shortLink(code)}`

function useToast() {
  const [toast, setToast] = useState(null)
  const timer = useRef()
  const show = useCallback((text, tone = 'ok') => {
    clearTimeout(timer.current); setToast({ text, tone })
    timer.current = setTimeout(() => setToast(null), 3000)
  }, [])
  const node = toast && createPortal(<div data-bl-toast role="status" aria-live="polite" className={`fixed inset-x-4 bottom-6 z-50 mx-auto max-w-md rounded-2xl px-4 py-3 text-center font-bold text-white shadow-lg ${toast.tone === 'err' ? 'bg-rose-600' : 'bg-slate-900'}`}>{toast.text}</div>, document.body)
  return [node, show]
}

// One item row. The organizer edits the text; everyone marks who brings it with
// an explicit "אישור" (never on blur, so one typed letter can't claim an item).
function ItemRow({ item, isOwner, mine, busy, asking, onText, onRemove, onStartClaim, onConfirm, onCancelAsk, onUnclaim, onRelease }) {
  const [name, setName] = useState('')
  const taker = takerOf(item)
  const submit = e => { e.preventDefault(); if (name.trim()) onConfirm(name.trim()) }
  return <li className={`rounded-2xl border-2 p-3 transition ${taker ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
    <div className="flex items-center gap-2">
      {isOwner
        ? <input value={item.text} onChange={e => onText(e.target.value)} aria-label="פריט" placeholder="שם הפריט"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[17px] font-bold focus:border-slate-800 focus:outline-none" />
        : <span className="min-w-0 flex-1 px-1 text-[17px] font-bold">{item.text}{item.qty && <span className="font-normal text-slate-500"> · {item.qty}</span>}</span>}
      {!taker && !asking && <button onClick={onStartClaim} disabled={busy || !item.text.trim()}
        className="min-h-[44px] shrink-0 whitespace-nowrap rounded-xl border-2 border-slate-800 bg-white px-3 font-bold disabled:opacity-40 print:hidden">
        {busy ? 'רושמים…' : isOwner ? 'מי מביא?' : '🙋 אני מביא/ה'}</button>}
      {isOwner && <button onClick={onRemove} className="grid h-10 w-9 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 print:hidden" aria-label={`מחיקת ${item.text || 'פריט'}`}>✕</button>}
    </div>

    {asking && !taker && <form onSubmit={submit} className="mt-2 flex gap-2">
      <input autoFocus value={name} onChange={e => setName(e.target.value)} maxLength={40} enterKeyHint="done"
        placeholder={isOwner ? 'מי מביא? כתבו שם' : 'השם שלך'} aria-label={`מי מביא ${item.text}`}
        className="min-w-0 flex-1 rounded-lg border-2 border-slate-800 bg-white px-3 py-2.5 text-[17px] focus:outline-none" />
      <button disabled={!name.trim() || busy} className="shrink-0 rounded-lg bg-emerald-600 px-4 font-bold text-white disabled:opacity-40">{busy ? '…' : '✓ אישור'}</button>
      <button type="button" onClick={onCancelAsk} className="shrink-0 px-1 text-sm text-slate-500 underline">ביטול</button>
    </form>}

    {taker && <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
      <span className="font-bold text-emerald-700">✅ {taker} מביא/ה את זה</span>
      {mine ? <button onClick={onUnclaim} disabled={busy} className="text-slate-500 underline print:hidden">ביטול</button>
        : isOwner && <button onClick={onRelease} className="text-slate-500 underline print:hidden">שחרור</button>}
    </div>}
  </li>
}

export default function BringList() {
  const { code: pathCode } = useParams()
  const [params] = useSearchParams()
  const code0 = pathCode || params.get('code')
  const legacy = params.get('list')

  const [code, setCode] = useState(code0 || null)
  const ownerToken = useRef(code0 ? partyMemory.ownerToken(code0) : null)
  const [owner, setOwner] = useState(!code0 || Boolean(ownerToken.current))
  const [title, setTitle] = useState(code0 ? '' : 'מסיבת סוף שנה')
  const [items, setItems] = useState(() => code0 ? [] : fresh())
  const [loading, setLoading] = useState(Boolean(code0))
  const [error, setError] = useState('')
  const [newItem, setNewItem] = useState('')
  const [mine, setMine] = useState(() => code0 ? partyMemory.claims(code0) : {})
  const [asking, setAsking] = useState(null) // id of the item whose name field is open
  const [pending, setPending] = useState(null)
  const [status, setStatus] = useState('')
  const [sharing, setSharing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [toast, showToast] = useToast()
  const dirty = useRef(false), saveTimer = useRef(), releases = useRef([])
  const addRef = useRef()

  const load = useCallback(() => code ? partyDb.get(code).then(row => {
    if (dirty.current) return
    setTitle(row.title); setItems(row.items)
  }).catch(e => setError(errorText(e.code))) : Promise.resolve(), [code])
  useEffect(() => { if (code0) load().finally(() => setLoading(false)) }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!code) return
    const t = setInterval(() => { if (!dirty.current && document.visibilityState === 'visible') load() }, POLL_MS)
    return () => clearInterval(t)
  }, [code, load])

  // Organizer edits save automatically once the list exists.
  const schedule = (nextTitle, nextItems) => {
    if (!code || !ownerToken.current) return
    dirty.current = true; setStatus('שומרים…')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        const release = releases.current; releases.current = []
        const row = await partyDb.update(code, ownerToken.current, nextTitle, nextItems.filter(i => i.text.trim()), release, null)
        dirty.current = false; setStatus('✓ נשמר')
        setItems(old => [...row.items, ...old.filter(i => !i.text.trim())])
      } catch (e) { setStatus('⚠️ לא נשמר'); showToast(errorText(e.code), 'err') }
    }, 700)
  }
  const changeTitle = v => { setTitle(v); schedule(v, items) }
  const changeItems = next => { setItems(next); schedule(title, next) }
  const add = () => {
    const t = newItem.trim(); if (!t) return
    changeItems([...items, { id: newId(), text: t, takenBy: '' }]); setNewItem(''); addRef.current?.focus()
  }

  // The list is created (and gets its short link) the first time it's shared or claimed.
  const ensureCreated = async () => {
    if (code) return code
    const token = newToken()
    const row = await partyDb.create(token, title.trim() || 'הרשימה שלנו', items.filter(i => i.text.trim()))
    ownerToken.current = token; setOwner(true)
    partyMemory.rememberOwned(row.share_code, token, row.title)
    setCode(row.share_code); setTitle(row.title); setItems(row.items)
    window.history.replaceState(window.history.state, '', `/l/${row.share_code}`)
    return row.share_code
  }
  const canShare = items.some(i => i.text.trim())
  const shareWhatsApp = async () => {
    const win = code ? null : window.open('', '_blank') // phones block popups opened after an await
    setSharing(true)
    try {
      const c = await ensureCreated()
      const url = `https://wa.me/?text=${encodeURIComponent(inviteText(title.trim() || 'הרשימה שלנו', c))}`
      if (win) win.location.href = url; else window.open(url, '_blank', 'noopener')
    } catch (e) { win?.close(); showToast(errorText(e.code), 'err') } finally { setSharing(false) }
  }
  const copyLink = async () => {
    setSharing(true)
    try {
      const c = await ensureCreated()
      try { await navigator.clipboard.writeText(shortLink(c)); showToast('הקישור הועתק ✓ הדביקו אותו בוואטסאפ') } catch { showToast(shortLink(c)) }
    } catch (e) { showToast(errorText(e.code), 'err') } finally { setSharing(false) }
  }

  // Who brings what. Guests with a remembered name claim in one tap.
  const startClaim = item => {
    const remembered = partyMemory.guestName()
    if (!owner && remembered) return claim(item, remembered)
    setAsking(item.id)
  }
  const claim = async (item, who) => {
    setPending(item.id)
    try {
      const c = await ensureCreated()
      const token = newToken()
      const row = await partyDb.claim(c, item.id, who, token)
      partyMemory.setClaim(c, item.id, token); setMine(partyMemory.claims(c))
      if (!owner) partyMemory.setGuestName(who)
      setItems(old => [...row.items, ...old.filter(i => !i.text.trim())]); setAsking(null)
      showToast(`✓ ${who} מביא/ה ${item.text}`)
    } catch (e) { showToast(errorText(e.code), 'err'); load() } finally { setPending(null) }
  }
  const unclaim = async item => {
    setPending(item.id)
    try {
      const row = await partyDb.unclaim(code, item.id, mine[item.id])
      partyMemory.setClaim(code, item.id, null); setMine(partyMemory.claims(code))
      setItems(old => [...row.items, ...old.filter(i => !i.text.trim())]); showToast('בוטל — הפריט פנוי שוב')
    } catch (e) { showToast(errorText(e.code), 'err'); load() } finally { setPending(null) }
  }
  const release = item => { releases.current.push(item.id); changeItems(items.map(i => i.id === item.id ? { ...i, takenBy: '', claims: [] } : i)) }
  const deleteList = async () => {
    try { await partyDb.remove(code, ownerToken.current); partyMemory.forgetOwned(code); setConfirmDelete(false); setDeleted(true) }
    catch (e) { showToast(errorText(e.code), 'err') }
  }

  const legacyData = useMemo(() => { try { return legacy ? JSON.parse(decodeURIComponent(escape(atob(legacy)))) : null } catch { return null } }, [legacy])
  const visible = owner ? items : items.filter(i => i.text?.trim())
  const filled = visible.filter(i => i.text?.trim())
  const taken = filled.filter(i => takerOf(i)).length
  const myLists = partyMemory.myLists().filter(l => l.code !== code).slice(0, 5)
  const card = 'wobbly border-2 border-[var(--border)] bg-white p-4 sketch-shadow sm:p-5'

  let body
  if (deleted) body = <div className="py-10 text-center"><p className="text-xl font-bold">🗑️ הרשימה נמחקה</p><a href="/tools/bring-list" className="mt-6 inline-block rounded-xl border-2 border-slate-800 bg-white px-5 py-3 font-bold">פתחו רשימה חדשה</a></div>
  else if (legacy && !code0) body = <div className="mx-auto max-w-md rounded-2xl bg-amber-50 p-5 text-center">
    <p className="text-lg">זה קישור ישן שלא שומר מי תפס מה. בקשו ממי ששלח/ה לפתוח רשימה חדשה.</p>
    {legacyData?.items?.length > 0 && <ul className="mt-3 space-y-1">{legacyData.items.map((i, n) => <li key={n}>{i.text}{i.takenBy ? ` — ${i.takenBy}` : ''}</li>)}</ul>}
    <Link to="/tools/bring-list" className="mt-4 inline-block rounded-xl border-2 border-slate-800 bg-white px-5 py-3 font-bold">פתחו רשימה חדשה</Link>
  </div>
  else if (error) body = <div className="py-10 text-center"><p className="text-xl font-bold">{error}</p><Link to="/tools/bring-list" className="mt-6 inline-block rounded-xl border-2 border-slate-800 bg-white px-5 py-3 font-bold">פתחו רשימה חדשה</Link></div>
  else if (loading) body = <p className="py-16 text-center text-lg">טוענים את הרשימה…</p>
  else body = <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
    <section className={card}>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-dashed pb-4">
        {owner
          ? <label className="flex-1 font-bold">שם הרשימה<input value={title} onChange={e => changeTitle(e.target.value)} maxLength={80} placeholder="למשל: יום הולדת לנועה"
              className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-lg focus:border-slate-800 focus:outline-none" /></label>
          : <h2 className="flex-1 text-2xl font-bold">{title}</h2>}
        <span className="rounded-full bg-emerald-100 px-3 py-2 font-bold text-emerald-800">{taken}/{filled.length} נתפסו</span>
      </div>

      <ul className="mt-4 space-y-3">
        {visible.map(item => <ItemRow key={item.id} item={item} isOwner={owner} mine={Boolean(mine[item.id])} busy={pending === item.id} asking={asking === item.id}
          onText={v => changeItems(items.map(i => i.id === item.id ? { ...i, text: v } : i))}
          onRemove={() => changeItems(items.filter(i => i.id !== item.id))}
          onStartClaim={() => startClaim(item)} onConfirm={who => claim(item, who)} onCancelAsk={() => setAsking(null)}
          onUnclaim={() => unclaim(item)} onRelease={() => release(item)} />)}
      </ul>

      {owner && <form className="mt-4 flex gap-2" onSubmit={e => { e.preventDefault(); add() }}>
        <input ref={addRef} value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="הוסיפו פריט חדש" enterKeyHint="done" aria-label="פריט חדש"
          className="min-w-0 flex-1 rounded-xl border-2 border-dashed border-slate-300 px-3 py-2.5 text-[17px] focus:border-slate-800 focus:outline-none" />
        <button className="shrink-0 rounded-xl border-2 border-slate-800 bg-white px-4 font-bold">＋ הוספה</button>
      </form>}
      {owner && code && status && <p className="mt-3 text-center text-sm text-slate-500" aria-live="polite">{status}</p>}
    </section>

    <aside className="wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-5">
      <h2 className="font-display text-2xl font-bold">איך זה עובד?</h2>
      {owner
        ? <ol className="mt-3 list-decimal space-y-2 pr-5"><li>נותנים שם לרשימה.</li><li>מוסיפים את כל מה שצריך.</li><li>שולחים בוואטסאפ.</li><li>כל אחד תופס פריט פנוי — ורואים כאן מי מביא מה.</li></ol>
        : <ol className="mt-3 list-decimal space-y-2 pr-5"><li>בוחרים פריט פנוי.</li><li>לוחצים „אני מביא/ה” וכותבים שם.</li><li>זהו — כולם רואים שזה עליכם.</li></ol>}
      {owner && <>
        <button onClick={shareWhatsApp} disabled={sharing || !canShare} className="mt-5 w-full rounded-xl bg-[#25D366] px-4 py-3 text-lg font-bold text-white disabled:opacity-60">📱 {sharing ? 'רגע…' : 'שליחה בוואטסאפ'}</button>
        <button onClick={copyLink} disabled={sharing || !canShare} className="mt-2 w-full rounded-xl border-2 border-slate-800 bg-white px-4 py-3 font-bold disabled:opacity-60">🔗 העתקת קישור</button>
        {code && <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-center text-sm">הקישור: <bdi dir="ltr" className="font-bold">{shortLink(code).replace(/^https?:\/\//, '')}</bdi></p>}
      </>}
      <button onClick={() => window.print()} className="mt-2 w-full rounded-xl border-2 border-slate-800 bg-white px-4 py-3 font-bold">🖨️ הדפסה</button>
      {owner
        ? <p className="mt-4 text-sm text-slate-600">מי שמקבל את הקישור לא יכול לשנות או למחוק פריטים — רק לתפוס פריט פנוי.</p>
        : <p className="mt-4 text-sm text-slate-600">מארגנים משהו בעצמכם? <Link to="/tools/bring-list" className="font-bold underline">פתחו רשימה משלכם</Link></p>}
      {owner && code && <button onClick={() => setConfirmDelete(true)} className="mt-3 text-sm text-rose-700 underline">🗑️ מחיקת הרשימה</button>}
      {owner && !code && myLists.length > 0 && <p className="mt-4 text-sm"><b>הרשימות שלי:</b> {myLists.map((l, n) => <span key={l.code}>{n > 0 && ' · '}<a className="underline" href={`/l/${l.code}`}>{l.title}</a></span>)}</p>}
    </aside>
  </div>

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <SEO title="מי מביא מה? רשימה שיתופית למסיבה" description="מי מביא מה? רשימה שיתופית למסיבה: מחלקים בין ההורים והאורחים מי מביא כיבוד, שתייה וציוד — קישור אחד לוואטסאפ, בלי בלגן ובלי כפילויות." path="/tools/bring-list" noindex={Boolean(code0 || legacy)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'מי מביא מה?' }]} />
      <header className="mb-7 text-center">
        <h1 className="text-4xl sm:text-5xl">🧺 מי מביא מה?</h1>
        <p className="mt-2 text-lg text-[var(--muted-foreground)]">רשימה שיתופית למסיבה — כל אחד תופס פריט, בלי הרשמה.</p>
      </header>
      {body}
      {confirmDelete && createPortal(<div className="fixed inset-0 z-50 grid items-end bg-black/40 sm:items-center" onClick={() => setConfirmDelete(false)}>
        <div onClick={e => e.stopPropagation()} className="mx-auto w-full max-w-md rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl" role="alertdialog" aria-modal="true" aria-labelledby="bl-del-q">
          <h2 id="bl-del-q" className="text-xl font-bold">למחוק את הרשימה?</h2>
          <p className="mt-1 text-slate-600">„{title}” תימחק לכל מי שקיבל את הקישור. אי אפשר לשחזר.</p>
          <div className="mt-4 flex gap-2">
            <button onClick={deleteList} className="min-h-[52px] flex-1 rounded-2xl bg-rose-600 text-lg font-bold text-white">כן, למחוק</button>
            <button onClick={() => setConfirmDelete(false)} className="min-h-[52px] rounded-2xl border-2 border-slate-300 px-4 font-bold">ביטול</button>
          </div>
        </div>
      </div>, document.body)}
      {toast}
    </div>
  )
}
