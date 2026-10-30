import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { rpcInit, rpcUrl } from '../../utils/qrVariants'

// "בקרוב": the teachers' timetable planner — enter your weekly timetable once and every lesson is ready
// (a lesson plan and a worksheet, following the Ministry of Education curriculum). Until it opens, teachers
// join a waiting list (migration 20261030160000) and hear from us once, when it's live.
const cleanPath = p => (/^\/[a-z0-9/_-]{0,119}$/.test(p || '') ? p : null)

export default function PlannerBanner({ className = '' }) {
  const { pathname } = useLocation()
  const [email, setEmail] = useState(''), [teaches, setTeaches] = useState('')
  const [state, setState] = useState('idle')
  const send = async e => {
    e.preventDefault()
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email.trim())) { setState('bad'); return }
    setState('sending')
    const ok = await fetch(rpcUrl('join_planner_waitlist'), rpcInit({ p_email: email.trim(), p_teaches: teaches.trim() || null, p_from_path: cleanPath(pathname) }))
      .then(r => r.ok && r.json()).then(v => v === true, () => false)
    setState(ok ? 'done' : 'error')
  }
  return <section className={`no-print rounded-[28px] border-2 border-violet-300 bg-gradient-to-l from-violet-50 to-amber-50 p-5 ${className}`} dir="rtl" aria-label="בקרוב: מערכת השעות למורים">
    <div className="flex flex-wrap items-start gap-4">
      <span className="text-5xl" aria-hidden="true">🗓️</span>
      <div className="min-w-[240px] flex-1">
        <p className="text-sm font-black text-violet-700">בקרוב · למורים ולגננות</p>
        <h2 className="text-2xl font-black">מכניסים את מערכת השעות — וכל שיעור מוכן</h2>
        <p className="mt-1">לכל שעה במערכת שלכם: מערך שיעור קצר ודף עבודה להדפסה, לפי תוכנית הלימודים של משרד החינוך, והשיעור הבא תמיד ממשיך מאיפה שעצרתם. אתם יכולים לשנות כל דבר. בחינם.</p>
      </div>
    </div>
    {state === 'done'
      ? <p className="mt-3 rounded-2xl bg-white p-3 text-center text-lg font-black" role="status">🎉 נרשמתם! נשלח לכם מייל אחד כשהמערכת עולה.</p>
      : <form onSubmit={send} className="mt-3 flex flex-wrap gap-2" noValidate>
        <input type="email" dir="ltr" value={email} onChange={e => { setEmail(e.target.value); if (state === 'bad') setState('idle') }} placeholder="המייל שלכם" aria-label="המייל שלכם" maxLength={120} className="min-h-[48px] min-w-[200px] flex-1 rounded-2xl border-2 border-violet-200 bg-white px-3" />
        <input value={teaches} onChange={e => setTeaches(e.target.value)} placeholder="מה מלמדים? למשל: אנגלית ג׳ (רשות)" aria-label="מה אתם מלמדים (רשות)" maxLength={120} className="min-h-[48px] min-w-[200px] flex-1 rounded-2xl border-2 border-violet-200 bg-white px-3" />
        <button type="submit" disabled={state === 'sending'} className="min-h-[48px] rounded-2xl bg-violet-600 px-5 font-black text-white disabled:opacity-60">{state === 'sending' ? 'שולחים…' : 'תודיעו לי כשזה עולה'}</button>
        {state === 'bad' && <p className="w-full font-bold text-red-700" role="alert">בדקו את כתובת המייל.</p>}
        {state === 'error' && <p className="w-full font-bold text-red-700" role="alert">משהו השתבש. נסו שוב בעוד רגע.</p>}
        <p className="w-full text-xs text-[var(--muted-foreground)]">המייל משמש רק כדי להודיע לכם פעם אחת כשהמערכת עולה. הוא לא מתפרסם ולא נמסר לאף אחד.</p>
      </form>}
  </section>
}
