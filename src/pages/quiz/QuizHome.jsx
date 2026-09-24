import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import QuizEditor, { toPayload } from '../../components/quiz/QuizEditor'
import { quizDb, quizMemory, quizErrorText, newToken } from '../../utils/quizDb'

const STEPS = [['✏️', 'כותבים שאלות', 'שאלה, 2–4 תשובות, מסמנים את הנכונה.'], ['📲', 'שולחים קישור', 'קוד סרוק על הלוח או קישור בוואטסאפ.'], ['📊', 'הציונים מגיעים לבד', 'רואים מי הגיש ואיזו שאלה הייתה קשה.']]

export default function QuizHome() {
  const nav = useNavigate()
  const [busy, setBusy] = useState(false), [err, setErr] = useState('')
  const mine = quizMemory.mine()
  const create = async quiz => {
    setBusy(true); setErr('')
    try {
      const token = newToken()
      const code = await quizDb.create(token, quiz.title, toPayload(quiz), quiz.settings, quiz.names.map(n => n.trim()).filter(Boolean))
      quizMemory.remember(code, token, quiz.title || 'מבחן')
      nav(`/classroom/quiz/${code}`)
    } catch (e) { setErr(quizErrorText(e.code)) } finally { setBusy(false) }
  }
  return <div className="mx-auto max-w-3xl px-4 py-8">
    <SEO title="מבחן אמריקאי אונליין בחינם — התלמידים עונים מהטלפון" description="יוצרים מבחן אמריקאי בעברית תוך 2 דקות, בלי הרשמה. התלמידים עונים מהטלפון או מהמחשב, והציונים נבדקים לבד. גם גרסה להדפסה." path="/classroom/quiz" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לכיתה', href: '/classroom' }, { label: 'מבחן אמריקאי' }]} />
    <header className="mb-6 text-center">
      <div className="text-5xl">📝</div>
      <h1 className="mt-2 text-4xl font-black sm:text-5xl">מבחן אמריקאי אונליין</h1>
      <p className="mx-auto mt-2 max-w-xl text-lg text-[var(--muted-foreground)]">יוצרים מבחן, התלמידים עונים מהטלפון או מהמחשב, והציונים נבדקים לבד. בלי הרשמה, בחינם.</p>
    </header>
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">{STEPS.map(([i, t, d]) => <div key={t} className="rounded-2xl bg-white p-4 text-center shadow-sm"><span className="text-3xl">{i}</span><b className="mt-1 block">{t}</b><span className="text-sm text-slate-600">{d}</span></div>)}</div>

    {mine.length > 0 && <section className="mb-6 rounded-3xl border-2 border-violet-200 bg-violet-50 p-4">
      <h2 className="mb-2 text-lg font-black">📂 המבחנים שלי</h2>
      <ul className="space-y-1.5">{mine.map(q => <li key={q.code}><Link to={`/classroom/quiz/${q.code}`} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 font-bold hover:bg-violet-100"><span className="truncate">{q.title}</span><span className="shrink-0 text-sm font-normal text-slate-500">תוצאות ←</span></Link></li>)}</ul>
    </section>}

    <h2 className="mb-3 text-2xl font-black">✨ מבחן חדש</h2>
    <QuizEditor onSubmit={create} busy={busy} submitLabel="📝 יצירת המבחן וקבלת קישור" />
    {err && <p role="alert" className="mt-3 rounded-2xl bg-rose-50 p-4 font-bold text-rose-800">{err}</p>}
    <p className="mt-6 text-center text-sm text-slate-500">🔒 שומרים רק שם פרטי וציון. הכל נמחק אוטומטית אחרי 30 יום, ואפשר למחוק קודם.</p>
  </div>
}
