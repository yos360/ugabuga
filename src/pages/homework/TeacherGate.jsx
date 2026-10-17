// Teachers sign in with Google or with a link sent to any email address; the page waits for the
// session and then shows what is inside. Everything the teacher saves is tied to her account.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { homeworkTeacher } from '../../utils/homework/db'

const back = () => `${window.location.origin}/teachers`

function SignIn() {
  const [email, setEmail] = useState(''), [sent, setSent] = useState(false), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  const google = async () => { setError(''); const { error: e } = await homeworkTeacher.signInGoogle(back()); if (e) setError('ההתחברות עם גוגל לא זמינה כרגע. אפשר להתחבר עם קישור למייל.') }
  const byEmail = async event => {
    event.preventDefault(); setError(''); setBusy(true)
    const { error: e } = await homeworkTeacher.signInEmail(email.trim(), back())
    setBusy(false)
    if (e) setError(/rate|seconds/i.test(e.message) ? 'שלחנו כבר קישור לפני רגע — בדקו את המייל או נסו שוב בעוד דקה.' : 'לא הצלחנו לשלוח את הקישור. בדקו את כתובת המייל ונסו שוב.')
    else setSent(true)
  }
  return <section className="mx-auto max-w-md rounded-3xl border-2 border-violet-100 bg-white p-6 shadow-sm">
    <h2 className="mb-1 text-2xl font-black">כניסה למורים</h2>
    <p className="mb-5 text-slate-600">בלי סיסמה ובלי תשלום. שיעורי הבית והתוצאות נשמרים בחשבון שלך.</p>
    <button onClick={google} className="mb-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white font-bold hover:border-slate-400">
      <span className="text-xl font-black text-[#4285f4]">G</span> כניסה עם גוגל
    </button>
    <div className="mb-4 flex items-center gap-3 text-sm text-slate-400"><span className="h-px flex-1 bg-slate-200" />או עם כל מייל<span className="h-px flex-1 bg-slate-200" /></div>
    {sent ? <p className="rounded-2xl bg-emerald-50 p-4 font-bold" role="status">📩 שלחנו קישור כניסה ל-{email}. פתחו את המייל ולחצו על הקישור (כדאי לבדוק גם בקידומי מכירות/ספאם).</p>
      : <form onSubmit={byEmail} className="flex gap-2">
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" dir="ltr" aria-label="כתובת מייל" className="min-w-0 flex-1 rounded-2xl border-2 border-slate-200 px-3 py-2" />
        <button disabled={busy} className="rounded-2xl bg-violet-600 px-4 font-bold text-white disabled:opacity-60">{busy ? 'שולחים…' : 'שלחו לי קישור'}</button>
      </form>}
    {error && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-bold" role="alert">{error}</p>}
  </section>
}

export default function TeacherGate({ title, crumbs = [], children }) {
  const [session, setSession] = useState(undefined)
  useEffect(() => {
    homeworkTeacher.session().then(setSession).catch(() => setSession(null))
    const sub = homeworkTeacher.onAuth(setSession)
    return () => sub.unsubscribe()
  }, [])
  return <div className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title={title} description="מרחב המורה בעוגה בוגה: בונים שיעורי בית אינטראקטיביים מהפעילויות באתר ורואים מי סיים ומה הציון." path="/teachers" noindex={crumbs.length > 0} />
    <Breadcrumbs items={[{ label: 'בית', href: '/' }, { label: 'לכיתה', href: '/classroom' }, { label: 'מרחב המורה', href: crumbs.length ? '/teachers' : undefined }, ...crumbs]} />
    {session === undefined ? <p role="status" className="mt-8 text-center">טוענים…</p>
      : !session ? <>
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-black">📚 שיעורי בית אינטראקטיביים</h1>
          <p className="mx-auto mt-2 max-w-2xl text-lg text-slate-600">בונים שיעורי בית מהפעילויות של עוגה בוגה — תרגילי חשבון, הבנת הנקרא עם הקראה בקול, הכתבה ושאלות משלכם. הילדים פותרים מהטלפון או מהמחשב, מקבלים משוב מיידי, ואתם רואים מי סיים ומה הציון.</p>
        </header>
        <SignIn />
        <p className="mt-6 text-center text-sm text-slate-500">הילדים לא נרשמים: נכנסים בקישור ובוחרים את השם הפרטי שלהם. <Link to="/classroom/quiz" className="underline">מבחן אמריקאי מהיר</Link> עדיין זמין בלי הרשמה.</p>
      </>
      : children({ session, signOut: () => homeworkTeacher.signOut() })}
  </div>
}
