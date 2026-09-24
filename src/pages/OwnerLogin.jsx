import { useEffect, useState } from 'react'
import { OWNER_EMAIL, ownerSupabase, signInOwnerWithPassword, startOwnerEmailLogin } from '../utils/ownerAuth'
import SEO from '../components/ui/SEO'

export default function OwnerLogin({ children }) {
  const [session, setSession] = useState(undefined)
  const [busy, setBusy] = useState(false)
  const [password, setPassword] = useState('')
  const [showLink, setShowLink] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const url = new URL(window.location.href)
    const hashParams = new URLSearchParams(url.hash.slice(1))
    const callbackError = url.searchParams.get('error_description') || hashParams.get('error_description')
      || url.searchParams.get('error') || hashParams.get('error')
    if (callbackError) {
      setError(/expired|invalid/i.test(callbackError)
        ? 'הקישור פג תוקף או כבר נוצל. היכנסו עם הסיסמה.'
        : 'הכניסה לא הושלמה. היכנסו עם הסיסמה.')
      window.history.replaceState(window.history.state, '', url.pathname)
    }
    ownerSupabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      setSession(data.session)
      if (sessionError) setError('הכניסה הקודמת פגה. היכנסו שוב עם הסיסמה.')
    }).catch(() => {
      if (!active) return
      setSession(null)
      setError('לא הצלחנו לבדוק את הכניסה. נסו שוב.')
    })
    const { data: { subscription } } = ownerSupabase.auth.onAuthStateChange((_event, next) => {
      if (active) setSession(next)
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [])

  async function signOut() {
    const { error: signOutError } = await ownerSupabase.auth.signOut({ scope: 'local' })
    if (signOutError) throw new Error('היציאה לא הושלמה. נסו שוב.')
    setSession(null)
  }

  const friendly = err => (err.name === 'TimeoutError' || err instanceof TypeError
    ? 'החיבור מתעכב. בדקו את האינטרנט ונסו שוב.'
    : err.message)

  async function loginWithPassword(event) {
    event.preventDefault()
    if (!password) { setError('הקלידו את הסיסמה.'); return }
    setBusy(true)
    setError('')
    try {
      if (session) await signOut()
      await signInOwnerWithPassword(password)
      setPassword('')
    } catch (loginError) {
      setError(friendly(loginError))
    } finally {
      setBusy(false)
    }
  }

  async function sendLink() {
    setBusy(true)
    setError('')
    try {
      if (session) await signOut()
      await startOwnerEmailLogin()
      setSent(true)
    } catch (loginError) {
      setError(friendly(loginError))
    } finally {
      setBusy(false)
    }
  }

  if (session?.user?.email?.toLowerCase() === OWNER_EMAIL) {
    return <>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 pt-6" dir="rtl">
        <nav aria-label="אזור בעלים" className="flex flex-wrap gap-2">{[['/admin/activity', '📊 דוח פעילות'], ['/admin/suppliers', '🎪 ניהול ספקים']].map(([href, label]) =>
          <a key={href} href={href} aria-current={location.pathname === href ? 'page' : undefined}
            className={`min-h-11 rounded-xl border-2 px-4 py-2 font-bold ${location.pathname === href ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 bg-white'}`}>{label}</a>)}</nav>
        <button onClick={() => signOut().catch(() => setError('היציאה לא הושלמה. נסו שוב.'))}
          className="min-h-11 rounded-xl border-2 border-slate-200 bg-white px-5 py-2 font-bold">יציאה מהחשבון</button>
      </div>
      {error && <p role="alert" className="mx-auto max-w-5xl px-4 text-red-700">{error}</p>}
      {children}
    </>
  }

  return <div className="mx-auto max-w-md px-4 py-12 sm:py-20" dir="rtl">
    <SEO title="כניסת בעלים" description="כניסה מאובטחת לדוח פעילות עוגה בוגה." noindex path="/admin/login" />
    <section className="rounded-3xl border-2 border-slate-200 bg-white p-7 text-center shadow-[0_7px_0_#e5e7eb]">
      <p className="font-bold text-violet-600">עוגה בוגה · אזור בעלים</p>
      <h1 className="mt-3 text-3xl font-black">הדוח הפרטי שלך</h1>
      <p className="mt-3 leading-relaxed text-slate-600">הקלידו את סיסמת הבעלים כדי לראות את הדוח.</p>
      {session === undefined ? <p className="mt-7" role="status">בודקים את הכניסה…</p> : <>
        {session && <p className="mt-5 rounded-xl bg-amber-50 p-3 text-amber-900" role="alert">
          החשבון המחובר אינו חשבון הבעלים. היכנסו עם סיסמת הבעלים.
        </p>}
        <form onSubmit={loginWithPassword} className="mt-7 text-right">
          <input type="email" name="username" autoComplete="username" value={OWNER_EMAIL} readOnly hidden />
          <label htmlFor="owner-password" className="mb-2 block font-bold text-slate-700">סיסמה</label>
          <input id="owner-password" type="password" autoComplete="current-password" value={password}
            onChange={e => setPassword(e.target.value)} dir="ltr"
            className="min-h-14 w-full rounded-xl border-2 border-slate-300 bg-white px-4 text-lg focus-visible:border-violet-600 focus-visible:outline-none" />
          <button type="submit" disabled={busy}
            className="mt-4 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-violet-600 px-4 py-3 text-lg font-bold text-white shadow-sm transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600 disabled:opacity-60">
            <span aria-hidden="true">🔑</span>{busy ? 'נכנסים…' : 'כניסה'}
          </button>
        </form>
        {showLink ? <div className="mt-6 border-t border-slate-200 pt-5">
          {sent ? <div className="rounded-xl bg-emerald-50 p-4 text-emerald-900" role="status">
            <p className="font-bold">✉️ הקישור נשלח למייל של בעל האתר.</p>
            <p className="mt-1 text-sm">הקישור תקף לשעה. אם לא הגיע, בדקו בתיקיית הספאם.</p>
          </div> : <button type="button" onClick={sendLink} disabled={busy}
            className="min-h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-2 font-bold text-slate-800 disabled:opacity-60">
            שלחו לי קישור כניסה למייל
          </button>}
        </div> : <button type="button" onClick={() => setShowLink(true)}
          className="mt-5 min-h-11 text-sm font-bold text-violet-700 underline underline-offset-4">
          אין לי סיסמה / שכחתי — כניסה עם קישור למייל
        </button>}
      </>}
      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
      <p className="mt-6 text-sm text-slate-500">הגישה לדוח מוגבלת לבעל האתר בלבד.</p>
    </section>
  </div>
}
