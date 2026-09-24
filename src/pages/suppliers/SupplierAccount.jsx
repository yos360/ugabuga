import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SupplierEditor from '../../components/suppliers/SupplierEditor'
import { suppliersDb, supplierAuth, currentSupplierUser, signInWithGoogle, googleEnabled, signInWithEmail, signOutSupplier, waLink, OWNER_WHATSAPP } from '../../utils/suppliersDb'

const STATUS = {
  pending: ['⏳ ממתין לאישור', 'הכרטיס נשמר ונבדק על ידינו. בדרך כלל זה לוקח עד יום. אפשר להמשיך לערוך בינתיים.', 'bg-amber-50 border-amber-300'],
  approved: ['✅ הכרטיס שלך באוויר', 'מופיע באינדקס הספקים של עוגה בוגה.', 'bg-emerald-50 border-emerald-300'],
  hidden: ['🙈 הכרטיס מוסתר', 'הכרטיס לא מוצג כרגע. לשאלות — דברו איתנו בוואטסאפ.', 'bg-slate-50 border-slate-300'],
}

function SignIn() {
  const [email, setEmail] = useState(''), [sent, setSent] = useState(false), [err, setErr] = useState('')
  const [google, setGoogle] = useState(false)
  useEffect(() => { googleEnabled().then(setGoogle) }, [])
  const googleSignIn = async () => { setErr(''); const { error } = await signInWithGoogle(); if (error) setErr('ההתחברות עם גוגל עוד לא זמינה. נסו עם קישור למייל.') }
  const mail = async e => {
    e.preventDefault(); setErr('')
    const { error } = await signInWithEmail(email.trim())
    if (error) setErr(/rate|limit/i.test(error.message) ? 'נשלחו כבר קישורים לאחרונה. נסו שוב בעוד כמה דקות.' : 'לא הצלחנו לשלוח קישור. בדקו את כתובת המייל.')
    else setSent(true)
  }
  return <div className="mx-auto max-w-md space-y-4">
    {google && <><button onClick={googleSignIn} className="flex min-h-[56px] w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-800 bg-white text-lg font-bold">
      <svg viewBox="0 0 48 48" className="h-6 w-6" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
      המשך עם Google
    </button>
    <div className="flex items-center gap-3 text-sm text-slate-500"><span className="h-px flex-1 bg-slate-200" />או<span className="h-px flex-1 bg-slate-200" /></div></>}
    {!google && <p className="text-center font-bold">מכניסים מייל ומקבלים קישור כניסה — בלי סיסמה:</p>}
    {sent ? <p className="rounded-2xl bg-emerald-50 p-4 text-center font-bold">📬 שלחנו קישור ל-{email}. לחצו עליו כדי להיכנס.</p>
      : <form onSubmit={mail} className="flex gap-2">
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="המייל שלך" dir="ltr" className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-3 py-3 text-lg focus:border-slate-800 focus:outline-none" />
        <button className="shrink-0 rounded-xl bg-[var(--ink)] px-4 font-bold text-white">שליחת קישור</button>
      </form>}
    {err && <p className="text-center text-sm font-bold text-rose-700">{err}</p>}
  </div>
}

function Stats({ stats }) {
  const k = stats?.by_kind || {}
  const cells = [['👀', 'צפיות בדף', k.view || 0], ['💬', 'פניות בוואטסאפ', k.whatsapp || 0], ['📞', 'חיוגים', k.phone || 0], ['🌐', 'כניסות לרשתות', (k.social || 0) + (k.website || 0)]]
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{cells.map(([i, l, n]) => <div key={l} className="rounded-2xl bg-white p-4 text-center shadow-sm"><b className="block text-3xl">{n}</b><span className="text-sm text-slate-600">{i} {l}</span></div>)}</div>
}

export default function SupplierAccount() {
  const [user, setUser] = useState(undefined)
  const [cards, setCards] = useState(null)
  const [err, setErr] = useState('')
  const [requested, setRequested] = useState(false)
  const load = useCallback(() => suppliersDb.mine().then(setCards).catch(e => setErr(e.message)), [])
  useEffect(() => {
    currentSupplierUser().then(u => { setUser(u); if (u) load() })
    const { data } = supplierAuth.auth.onAuthStateChange((event, session) => { if (event === 'INITIAL_SESSION') return; const u = session?.user || null; setUser(prev => { if (u && !prev) load(); return u }) })
    return () => data.subscription.unsubscribe()
  }, [load])

  const card = cards?.[0]
  const requestPage = async () => {
    const win = window.open(waLink(OWNER_WHATSAPP, `היי! אני ${card.name} מעוגה בוגה, ואשמח לשמוע על דף נחיתה מלא 🙂`), '_blank', 'noopener')
    try { await suppliersDb.requestPage(card.id); setRequested(true) } catch { if (!win) setErr('לא הצלחנו לשלוח. נסו שוב.') }
  }

  return <div className="mx-auto max-w-6xl px-4 py-8">
    <SEO title="אזור ספקים" description="הצטרפות חינם לאינדקס הספקים של עוגה בוגה." path="/suppliers/me" noindex />
    <header className="mb-6 text-center">
      <h1 className="text-4xl sm:text-5xl">🎪 אזור ספקים</h1>
      <p className="mx-auto mt-2 max-w-2xl text-lg text-[var(--muted-foreground)]">כרטיס ספק בחינם באינדקס של עוגה בוגה — עם פניות ישירות לוואטסאפ ומדידה של כל פנייה.</p>
    </header>

    {user === undefined ? <p className="py-10 text-center">רגע…</p>
      : !user ? <>
        <div className="mx-auto mb-8 grid max-w-3xl gap-3 sm:grid-cols-3">{[['🆓', 'בחינם', 'כרטיס עם לוגו, תמונה, קצת עליכם ורשתות'], ['💬', 'פניות ישירות', 'הורים פונים אליכם בוואטסאפ, בלי תיווך'], ['📊', 'רואים תוצאות', 'כמה צפו וכמה פנו — הכל נמדד']].map(([i, t, d]) => <div key={t} className="rounded-2xl bg-white p-4 text-center shadow-sm"><span className="text-3xl">{i}</span><b className="mt-1 block">{t}</b><span className="text-sm text-slate-600">{d}</span></div>)}</div>
        <SignIn />
      </>
      : <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600"><span>מחובר/ת בתור <b dir="ltr">{user.email}</b></span><button onClick={() => signOutSupplier().then(() => { setUser(null); setCards(null) })} className="underline">יציאה</button></div>
        {err && <p className="rounded-2xl bg-rose-50 p-4 font-bold text-rose-800">{err}</p>}
        {cards === null ? <p className="py-10 text-center">טוענים…</p> : <>
          {card && <>
            <div className={`rounded-3xl border-2 p-5 ${STATUS[card.status]?.[2]}`}>
              <b className="text-xl">{STATUS[card.status]?.[0]}</b>
              <p className="mt-1">{STATUS[card.status]?.[1]}</p>
              {card.status === 'approved' && <Link to={`/suppliers/${card.slug}`} className="mt-3 inline-block rounded-xl bg-white px-4 py-2 font-bold shadow-sm">לצפייה בדף שלי ←</Link>}
            </div>
            <div><h2 className="mb-3 text-2xl font-black">📊 30 הימים האחרונים</h2><Stats stats={card.stats} /></div>
            {card.plan !== 'page' && <div className="wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-5 sm:p-6">
              <h2 className="font-display text-2xl font-bold">⭐ רוצים דף נחיתה מלא?</h2>
              <p className="mt-1">דף עסק מעוצב מבית עוגה בוגה: 5 תבניות לבחירה, גלריית תמונות, סרטונים, רשימת שירותים וכפתורי פנייה.</p>
              {card.page_request || requested ? <p className="mt-3 font-bold text-emerald-800">✓ קיבלנו את הבקשה — נחזור אליך בוואטסאפ.</p>
                : <button onClick={requestPage} className="mt-4 rounded-2xl bg-[var(--ink)] px-5 py-3 font-bold text-white">אני רוצה דף נחיתה — דברו איתי</button>}
            </div>}
          </>}
          <h2 className="text-2xl font-black">{card ? '✏️ עריכת הכרטיס' : '✨ יצירת הכרטיס שלך'}</h2>
          <SupplierEditor key={card?.id || 'new'} initial={card} saveLabel={card ? 'שמירת שינויים' : 'שליחה לאישור'}
            onSave={async p => { const saved = await suppliersDb.save(card ? { ...p, id: card.id } : p); await load(); return saved }} />
        </>}
      </div>}
  </div>
}
