import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { shoppingDb, shoppingChannel, shoppingLink, newItemId, SHOPPING_PATH } from '../../utils/shoppingDb'
import { QUICK_ITEMS, arrangeItems, applyChange, splitItems, shareText } from '../../data/shoppingList'

// /tools/shopping-list — "רשימת קניות משותפת": one link for the whole family. Whoever is at the
// supermarket ticks items off, whoever is at home adds — and every phone shows it at once.
const POLL_MS = 4000
const MINE = 'ugabuga-shopping-mine'
const readMine = () => { try { const v = JSON.parse(localStorage.getItem(MINE) || '[]'); return Array.isArray(v) ? v : [] } catch { return [] } }
const rememberMine = (code, title) => { try { localStorage.setItem(MINE, JSON.stringify([{ code, title, at: Date.now() }, ...readMine().filter(l => l.code !== code)].slice(0, 10))) } catch { /* storage blocked */ } }

const ERR = {
  list_not_found: 'הרשימה לא נמצאה. אולי הקישור חסר או שהרשימה נמחקה.',
  list_full: 'הרשימה מלאה (300 פריטים). נקו את מה שכבר נקנה.',
  no_links: 'אי אפשר להוסיף קישורים לרשימה.',
  network: 'אין חיבור כרגע. נסו שוב בעוד רגע.',
}
const errText = e => ERR[e?.message] || ERR.network

const SEO_TITLE = 'רשימת קניות משותפת לסופר — מתעדכנת בלייב אצל כל המשפחה'
const SEO_DESC = 'רשימת קניות משותפת בחינם ובלי הרשמה: שולחים קישור אחד בוואטסאפ, כל אחד מוסיף מהבית ומי שבסופר מסמן — והרשימה מתעדכנת אצל כולם בלייב, מסודרת לפי מחלקות.'

export default function ShoppingList() {
  const { code } = useParams()
  return code ? <ListView key={code} code={code} /> : <Landing />
}

function Landing() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  const mine = useMemo(readMine, [])
  const create = async () => {
    setBusy(true); setError('')
    try { const l = await shoppingDb.create('רשימת קניות'); rememberMine(l.code, l.title); navigate(`${SHOPPING_PATH}/${l.code}`) } catch (e) { setError(errText(e)); setBusy(false) }
  }
  return <div className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
    <SEO title={SEO_TITLE} description={SEO_DESC} path={SHOPPING_PATH} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'רשימת קניות משותפת' }]} />
    <h1 className="text-center text-4xl sm:text-5xl"><span aria-hidden="true">🛒 </span>רשימת קניות משותפת</h1>
    <p className="mx-auto mt-3 max-w-2xl text-center text-lg">רשימה אחת לכל המשפחה: מי שבבית מוסיף, מי שבסופר מסמן — והרשימה מתעדכנת אצל כולם בלייב. בחינם, בלי הרשמה ובלי אפליקציה.</p>
    <div className="mt-6 text-center">
      <button type="button" onClick={create} disabled={busy} className="inline-flex min-h-[56px] items-center gap-2 rounded-2xl bg-emerald-600 px-8 text-xl font-black text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60">
        {busy ? 'יוצרים…' : '🛒 יוצרים רשימה חדשה'}
      </button>
      {error && <p role="alert" className="mt-3 font-bold text-red-700">{error}</p>}
    </div>
    {mine.length > 0 && <section className="mt-8">
      <h2 className="text-xl font-black">הרשימות שלי בטלפון הזה</h2>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">{mine.map(l => <li key={l.code}>
        <Link to={`${SHOPPING_PATH}/${l.code}`} className="flex min-h-[48px] items-center rounded-2xl border-2 border-emerald-200 bg-white px-4 font-bold">🛒 {l.title}</Link>
      </li>)}</ul>
    </section>}
    <section className="mt-10 grid gap-3 sm:grid-cols-3">
      {[['1', 'יוצרים רשימה', 'לוחצים על הכפתור ומקבלים רשימה ריקה עם קישור משלה.'], ['2', 'שולחים בוואטסאפ', 'שולחים את הקישור לבן או לבת הזוג, להורים או לילדים.'], ['3', 'מוסיפים ומסמנים', 'כל אחד מוסיף מהבית, ומי שבסופר מסמן ✓ — כולם רואים מיד.']].map(([n, t, d]) =>
        <div key={n} className="rounded-2xl bg-emerald-50 p-4"><b className="text-lg">{n}. {t}</b><p className="mt-1">{d}</p></div>)}
    </section>
    <section className="mt-8 space-y-3 text-lg leading-relaxed">
      <h2 className="text-2xl font-black">למה רשימה משותפת?</h2>
      <p>כי תמיד נזכרים בחלב רגע אחרי שמישהו יצא לסופר. ברשימה משותפת מי שבבית פשוט מוסיף, והפריט מופיע אצל מי שבחנות תוך שניות. מה שכבר נכנס לעגלה מסומן, כך ששניים שקונים יחד לא קונים פעמיים.</p>
      <p>הרשימה מסתדרת לבד לפי מחלקות — ירקות ופירות, חלב וביצים, לחם, בשר, מזווה, קפואים, שתייה וניקיון — כדי לעבור בסופר בסדר ולא לחזור אחורה. אפשר להדביק כמה פריטים בבת אחת, מופרדים בפסיק או כל אחד בשורה.</p>
      <p>כל מי שיש לו את הקישור יכול לערוך את הרשימה, אז שולחים אותו רק למשפחה. רשימה שלא נגעו בה חצי שנה נמחקת.</p>
    </section>
  </div>
}

function ListView({ code }) {
  const [list, setList] = useState(null), [error, setError] = useState(''), [text, setText] = useState('')
  const [copied, setCopied] = useState(false), [live, setLive] = useState(false)
  const pending = useRef(0), channel = useRef(null), input = useRef(null)

  const load = useCallback(() => shoppingDb.get(code).then(l => { if (!pending.current) { setList(l); setError('') } return l }), [code])
  useEffect(() => {
    load().then(l => rememberMine(code, l.title)).catch(e => setError(errText(e)))
    channel.current = shoppingChannel(code, () => { setLive(true); load().catch(() => {}) })
    const t = setInterval(() => { if (document.visibilityState === 'visible' && !pending.current) load().catch(() => {}) }, POLL_MS)
    const onShow = () => { if (document.visibilityState === 'visible') load().catch(() => {}) }
    document.addEventListener('visibilitychange', onShow)
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onShow); channel.current?.close() }
  }, [code, load])

  // Optimistic: show the change now, send it, then take the server's copy (which has everyone's changes).
  const change = async (op, args = {}) => {
    setList(l => (l ? applyChange(l, op, args) : l)); pending.current++
    try { const l = await shoppingDb.change(code, op, args); pending.current--; if (!pending.current) setList(l); setError(''); channel.current?.ping(l.version) }
    catch (e) { pending.current--; setError(errText(e)); load().catch(() => {}) }
  }
  const add = async words => { for (const t of splitItems(words)) await change('add', { id: newItemId(), text: t }) }
  const submit = e => { e.preventDefault(); const t = text; setText(''); add(t); input.current?.focus() }

  const link = shoppingLink(code)
  const copy = () => { navigator.clipboard?.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }).catch(() => {}) }
  const arranged = useMemo(() => arrangeItems(list?.items || []), [list])
  const onList = useMemo(() => new Set((list?.items || []).filter(i => !i.done).map(i => i.text)), [list])

  return <div className="mx-auto max-w-2xl px-4 py-6" dir="rtl">
    <SEO title={list ? `${list.title} — רשימת קניות משותפת` : 'רשימת קניות משותפת'} description={SEO_DESC} path={`${SHOPPING_PATH}/${code}`} noindex />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'רשימת קניות משותפת', href: SHOPPING_PATH }, { label: list?.title || 'הרשימה' }]} />
    <h1 className="text-center text-3xl sm:text-4xl"><span aria-hidden="true">🛒 </span>{list?.title || 'רשימת קניות'}</h1>
    <p className="mt-1 text-center text-sm text-[var(--muted-foreground)]">
      {list ? `${arranged.openCount} לקנות · ${arranged.done.length} כבר בעגלה` : 'טוען…'} · <span className={live ? 'text-emerald-700' : ''}>🟢 מתעדכן בלייב</span>
    </p>
    {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-center font-bold text-red-700">{error}</p>}

    <div className="mt-4 flex flex-wrap justify-center gap-2">
      <a href={`https://wa.me/?text=${encodeURIComponent(shareText(list?.title || 'רשימת קניות', link))}`} target="_blank" rel="noopener noreferrer"
        className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-[#25D366] px-4 font-bold text-white">💬 שליחה בוואטסאפ</a>
      <button type="button" onClick={copy} className="inline-flex min-h-[44px] items-center rounded-2xl border-2 border-[var(--border)] bg-white px-4 font-bold">{copied ? '✓ הקישור הועתק' : '🔗 העתקת קישור'}</button>
    </div>

    <form onSubmit={submit} className="sticky top-2 z-10 mt-5 flex gap-2 rounded-2xl bg-white/95 p-2 shadow-sm">
      <label htmlFor="shop-add" className="sr-only">מה להוסיף לרשימה?</label>
      <input id="shop-add" ref={input} value={text} onChange={e => setText(e.target.value)} placeholder="מה להוסיף? למשל: חלב, לחם, 2 קילו עגבניות" enterKeyHint="send" autoComplete="off"
        className="min-h-[52px] flex-1 rounded-xl border-2 border-[var(--border)] px-3 text-lg" />
      <button type="submit" disabled={!text.trim() || !list} className="min-h-[52px] rounded-xl bg-emerald-600 px-5 text-lg font-black text-white disabled:opacity-50">הוספה</button>
    </form>
    <div className="mt-3 flex flex-wrap gap-2" aria-label="הוספה מהירה">
      {QUICK_ITEMS.filter(q => !onList.has(q)).slice(0, 10).map(q => <button key={q} type="button" onClick={() => add(q)} disabled={!list}
        className="min-h-[40px] rounded-full border-2 border-emerald-200 bg-white px-3 font-bold">+ {q}</button>)}
    </div>

    {list && !list.items.length && <p className="mt-8 rounded-2xl bg-slate-50 p-6 text-center text-lg">הרשימה ריקה. מוסיפים פריט למעלה, ושולחים את הקישור למי שהולך לסופר.</p>}
    {arranged.groups.map(g => <section key={g.key} className="mt-5">
      <h2 className="text-lg font-black"><span aria-hidden="true">{g.emoji} </span>{g.label}</h2>
      <ul className="mt-1 divide-y divide-slate-100 rounded-2xl border-2 border-[var(--border)] bg-white">{g.items.map(i => <Row key={i.id} item={i} change={change} />)}</ul>
    </section>)}
    {arranged.done.length > 0 && <section className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-[var(--muted-foreground)]">✓ כבר בעגלה ({arranged.done.length})</h2>
        <button type="button" onClick={() => change('clear_done')} className="min-h-[40px] rounded-xl px-3 font-bold text-red-700">ניקוי מה שנקנה</button>
      </div>
      <ul className="mt-1 divide-y divide-slate-100 rounded-2xl border-2 border-dashed border-[var(--border)] bg-slate-50">{arranged.done.map(i => <Row key={i.id} item={i} change={change} />)}</ul>
    </section>}

    <p className="mt-8 text-center text-sm text-[var(--muted-foreground)]">כל מי שיש לו את הקישור יכול לערוך את הרשימה — שולחים אותו רק למשפחה. <Link to={SHOPPING_PATH} className="underline">רשימה חדשה</Link></p>
  </div>
}

function Row({ item, change }) {
  return <li className="flex items-center gap-2 px-3">
    <button type="button" onClick={() => change(item.done ? 'undone' : 'done', { id: item.id })} aria-pressed={item.done}
      className="flex min-h-[52px] flex-1 items-center gap-3 text-right text-lg">
      <span aria-hidden="true" className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 ${item.done ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-400'}`}>{item.done ? '✓' : ''}</span>
      <span className={item.done ? 'text-slate-400 line-through' : ''}>{item.text}</span>
    </button>
    <button type="button" onClick={() => change('remove', { id: item.id })} aria-label={`מחיקת ${item.text}`} className="min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-red-700">✕</button>
  </li>
}
