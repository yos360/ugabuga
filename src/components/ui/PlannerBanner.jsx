import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { rpcInit, rpcUrl } from '../../utils/qrVariants'

// The teachers' timetable planner (/planner): enter your weekly timetable once and every period gets the
// next lesson by the Ministry of Education curriculum, with a short lesson plan. It opened with math, Tanakh
// and English; teachers of other subjects leave an email to hear when theirs joins (migration 20261030160000).
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
  return <section className={`no-print rounded-[28px] border-2 border-violet-300 bg-gradient-to-l from-violet-50 to-amber-50 p-5 ${className}`} dir="rtl" aria-label="מערכת השעות למורים">
    <div className="flex flex-wrap items-start gap-4">
      <span className="text-5xl" aria-hidden="true">🗓️</span>
      <div className="min-w-[240px] flex-1">
        <p className="text-sm font-black text-violet-700">חדש · למורים · <span className="rounded-full bg-amber-300 px-2 text-[var(--ink)]">בטא</span></p>
        <h2 className="text-2xl font-black">מערכת השעות המתעדכנת — כל שיעור מוכן</h2>
        <p className="mt-1">לכל שעה במערכת שלכם: השיעור הבא לפי תוכנית הלימודים של משרד החינוך, מערך שיעור קצר וקישורים לתרגול, והדפסה של כל השבוע. החגים והחופשות כבר בפנים.</p>
      </div>
      {pathname !== '/planner' && <Link to="/planner" className="min-h-[52px] self-center rounded-2xl bg-violet-600 px-6 py-3 text-lg font-black text-white shadow-[0_4px_0_#5b21b6] hover:bg-violet-700">לבנות את המערכת שלי ←</Link>}
    </div>
    <p className="mt-3 text-sm font-bold">כרגע: מתמטיקה, תנ״ך ואנגלית. מלמדים מקצוע אחר? השאירו מייל ונודיע לכם כשהוא מצטרף.</p>
    {state === 'done'
      ? <p className="mt-2 rounded-2xl bg-white p-3 text-center text-lg font-black" role="status">🎉 תודה! נודיע לכם כשהמקצוע שלכם מצטרף.</p>
      : <form onSubmit={send} className="mt-2 flex flex-wrap gap-2" noValidate>
        <input type="email" dir="ltr" value={email} onChange={e => { setEmail(e.target.value); if (state === 'bad') setState('idle') }} placeholder="המייל שלכם" aria-label="המייל שלכם" maxLength={120} className="min-h-[44px] min-w-[200px] flex-1 rounded-2xl border-2 border-violet-200 bg-white px-3" />
        <input value={teaches} onChange={e => setTeaches(e.target.value)} placeholder="מה מלמדים? למשל: מדעים ז׳ (רשות)" aria-label="מה אתם מלמדים (רשות)" maxLength={120} className="min-h-[44px] min-w-[200px] flex-1 rounded-2xl border-2 border-violet-200 bg-white px-3" />
        <button type="submit" disabled={state === 'sending'} className="min-h-[44px] rounded-2xl border-2 border-violet-400 bg-white px-4 font-black disabled:opacity-60">{state === 'sending' ? 'שולחים…' : 'תודיעו לי'}</button>
        {state === 'bad' && <p className="w-full font-bold text-red-700" role="alert">בדקו את כתובת המייל.</p>}
        {state === 'error' && <p className="w-full font-bold text-red-700" role="alert">משהו השתבש. נסו שוב בעוד רגע.</p>}
        <p className="w-full text-xs text-[var(--muted-foreground)]">המייל משמש רק כדי להודיע לכם כשהמקצוע שלכם מצטרף. הוא לא מתפרסם ולא נמסר לאף אחד.</p>
      </form>}
  </section>
}
