import { useEffect, useState } from 'react'
import { OWNER_EMAIL, ownerSupabase, startOwnerGoogleLogin } from '../utils/ownerAuth'
import SEO from '../components/ui/SEO'

export default function OwnerLogin({ children }) {
  const [session, setSession] = useState(undefined)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const url = new URL(window.location.href)
    const callbackError = url.searchParams.get('error') || new URLSearchParams(url.hash.slice(1)).get('error')
    if (callbackError) {
      setError('הכניסה עם Google לא הושלמה. אפשר לנסות שוב.')
      window.history.replaceState(window.history.state, '', url.pathname)
    }
    ownerSupabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      setSession(data.session)
      if (sessionError) setError('הכניסה הקודמת פגה. לחצו על Google כדי להיכנס מחדש.')
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

  async function google() {
    setBusy(true)
    setError('')
    try {
      if (session) await signOut()
      await startOwnerGoogleLogin()
    } catch (loginError) {
      setError(loginError.name === 'TimeoutError' || loginError instanceof TypeError
        ? 'החיבור מתעכב. בדקו את האינטרנט ונסו שוב.'
        : loginError.message)
    } finally {
      setBusy(false)
    }
  }

  if (session?.user?.email?.toLowerCase() === OWNER_EMAIL) {
    return <>
      <div className="mx-auto flex max-w-5xl justify-end px-4 pt-6" dir="rtl">
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
      <p className="mt-3 leading-relaxed text-slate-600">נכנסים עם חשבון Google שלך.<br />בלי סיסמה נוספת.</p>
      {session === undefined ? <p className="mt-7" role="status">בודקים את הכניסה…</p> : <>
        {session && <p className="mt-5 rounded-xl bg-amber-50 p-3 text-amber-900" role="alert">
          החשבון שנבחר אינו חשבון הבעלים. בחרו את החשבון המאושר כדי להמשיך.
        </p>}
        <button type="button" onClick={google} disabled={busy}
          className="mt-7 flex min-h-14 w-full items-center justify-center gap-3 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600 disabled:opacity-60">
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.61 4.61 0 0 1-1.99 3.03v2.52h3.23c1.89-1.74 2.98-4.31 2.98-7.38Z" />
            <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.39l-3.23-2.52c-.9.6-2.05.97-3.39.97-2.6 0-4.8-1.76-5.59-4.13H3.07v2.6A10 10 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.41 13.93A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.93v-2.6H3.07A10 10 0 0 0 2 12c0 1.61.39 3.14 1.07 4.53l3.34-2.6Z" />
            <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.83 1.51L18.7 4.6A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.93 5.47l3.34 2.6C7.2 7.7 9.4 5.94 12 5.94Z" />
          </svg>
          {busy ? 'מתחברים ל־Google…' : session ? 'בחירת חשבון Google אחר' : 'כניסה עם Google'}
        </button>
      </>}
      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
      <p className="mt-6 text-sm text-slate-500">הגישה לדוח מוגבלת לבעל האתר בלבד.</p>
    </section>
  </div>
}
