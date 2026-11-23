import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import { CONSENT_TEXT, GRADES, ROLES, SUBJECTS, isValidEmail, subscribeTeacher } from '../utils/teacherSignup'

const toggle = (list, v) => (list.includes(v) ? list.filter(x => x !== v) : [...list, v])
const chip = on => `cursor-pointer rounded-full border-2 px-4 py-2 font-bold ${on ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 bg-white'}`

export default function TeacherJoin() {
  const { state } = useLocation()
  const [email, setEmail] = useState(''), [role, setRole] = useState('מורה'), [grades, setGrades] = useState([]), [subjects, setSubjects] = useState([])
  const [consent, setConsent] = useState(false), [status, setStatus] = useState('idle')
  const submit = async e => {
    e.preventDefault()
    if (!consent) return
    if (!isValidEmail(email)) { setStatus('bad-email'); return }
    setStatus('sending')
    const ok = await subscribeTeacher({ email, role, grades, subjects, consent, sourcePath: state?.from })
    setStatus(ok ? 'sent' : 'error')
  }
  return <div className="mx-auto max-w-2xl px-4 py-8" dir="rtl">
    <SEO title="עדכונים למורות ולגננות — חומרים חדשים לפי כיתה" description="מייל אחד בשבוע או בשבועיים עם חומרים חדשים להדפסה לפי הכיתה שלך, וחבילות לפני כל חג. בחינם, והסרה בלחיצה." path="/teachers/join" />
    <h1 className="text-3xl font-black sm:text-4xl">📬 עדכונים למורות ולגננות</h1>
    <p className="mt-3 text-lg leading-8">פעם בשבוע או בשבועיים נשלח לכם מייל קצר עם חומרים חדשים להדפסה לפי הכיתה שלכם, וחבילות מוכנות לפני כל חג. הכול בחינם.</p>
    {status === 'sent' ? <p role="status" className="mt-6 rounded-2xl bg-emerald-50 p-5 text-lg font-bold text-emerald-800">🎉 תודה! נרשמתם. המייל הבא יגיע עם חומרים חדשים. אפשר להסיר את עצמכם בכל רגע בקישור שבתחתית כל מייל.</p>
    : <form onSubmit={submit} className="mt-6 space-y-5 rounded-3xl border-2 border-violet-200 bg-white p-5">
      <label className="block font-bold">כתובת מייל
        <input type="email" required dir="ltr" autoComplete="email" maxLength={120} value={email} onChange={e => { setEmail(e.target.value); setStatus('idle') }} className="mt-1 block w-full rounded-xl border-2 border-slate-200 p-3 text-lg font-normal" /></label>
      <label className="block font-bold">אני
        <select value={role} onChange={e => setRole(e.target.value)} className="mt-1 block w-full rounded-xl border-2 border-slate-200 p-3 text-lg font-normal">{ROLES.map(r => <option key={r}>{r}</option>)}</select></label>
      <fieldset><legend className="font-bold">איזו כיתה? (אפשר לבחור כמה)</legend><div className="mt-2 flex flex-wrap gap-2">{GRADES.map(g => <label key={g} className={chip(grades.includes(g))}><input type="checkbox" className="sr-only" checked={grades.includes(g)} onChange={() => setGrades(toggle(grades, g))} />{g}</label>)}</div></fieldset>
      <fieldset><legend className="font-bold">נושאים מעניינים (לא חובה)</legend><div className="mt-2 flex flex-wrap gap-2">{SUBJECTS.map(s => <label key={s} className={chip(subjects.includes(s))}><input type="checkbox" className="sr-only" checked={subjects.includes(s)} onChange={() => setSubjects(toggle(subjects, s))} />{s}</label>)}</div></fieldset>
      <label className="flex items-start gap-3 text-base leading-7"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-2 h-5 w-5 shrink-0" /><span>{CONSENT_TEXT} <Link to="/privacy" className="font-bold text-violet-700 underline">מדיניות הפרטיות</Link></span></label>
      <p className="text-sm text-slate-600">ההרשמה למבוגרים בלבד.</p>
      <button type="submit" disabled={!consent || status === 'sending'} className="min-h-12 rounded-2xl bg-violet-600 px-6 py-3 text-lg font-black text-white disabled:opacity-40">{status === 'sending' ? 'שולחים…' : 'מצרפים אותי'}</button>
      {status === 'bad-email' && <p role="alert" className="font-bold text-red-700">כתובת המייל לא נראית תקינה.</p>}
      {status === 'error' && <p role="alert" className="font-bold text-red-700">לא הצלחנו להירשם. נסו שוב בעוד רגע.</p>}
    </form>}
  </div>
}
