import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { cleanRosterNames, clearClassRoster, loadClassRoster, saveClassRoster } from '../../utils/classRoster'

export default function ClassRoster() {
  const initial = loadClassRoster()
  const [className, setClassName] = useState(initial.className)
  const [text, setText] = useState(initial.names.join('\n'))
  const [saved, setSaved] = useState(Boolean(initial.names.length))
  const names = cleanRosterNames(text)
  const store = () => { saveClassRoster({ className, names }); setText(names.join('\n')); setSaved(true) }
  const reset = () => { clearClassRoster(); setClassName(''); setText(''); setSaved(false) }

  return <div className="mx-auto max-w-3xl px-4 py-8">
    <SEO title="רשימת הכיתה שלי - שמירה ושימוש בכלי המורים" description="שומרים פעם אחת את שמות התלמידים ומשתמשים בהם במחלק הקבוצות, גלגל השמות וכלי הכיתה של עוגה בוגה. הרשימה נשמרת רק במכשיר." path="/classroom/roster" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כיתה', href: '/classroom' }, { label: 'רשימת הכיתה שלי' }]} />
    <header className="text-center"><div className="text-6xl" aria-hidden="true">👩‍🏫</div><h1 className="mt-3 text-4xl font-black">רשימת הכיתה שלי</h1><p className="mx-auto mt-3 max-w-2xl text-lg leading-8 text-[var(--muted-foreground)]">מקלידים פעם אחת ומשתמשים שוב בגלגל השמות, במחלק הקבוצות ובכלים נוספים. השמות נשמרים רק בדפדפן הזה ואינם נשלחים לאתר.</p></header>
    <div className="mt-7 rounded-3xl border-[3px] border-[var(--border)] bg-sky-50 p-5 sketch-shadow">
      <label className="block font-bold" htmlFor="roster-class">שם הכיתה <span className="font-normal text-slate-500">(לא חובה)</span></label>
      <input id="roster-class" value={className} onChange={e => { setClassName(e.target.value); setSaved(false) }} placeholder="למשל: כיתה ג׳2" className="mt-2 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-lg" />
      <label className="mt-5 block font-bold" htmlFor="roster-names">שמות התלמידים — שם אחד בכל שורה</label>
      <textarea id="roster-names" value={text} onChange={e => { setText(e.target.value); setSaved(false) }} rows={14} placeholder={'נועה\nאורי\nמיה\nיואב'} className="mt-2 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-lg leading-8" />
      <p className="mt-2 font-bold">{names.length} שמות ברשימה</p>
      <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={store} disabled={!names.length} className="rounded-xl border-[3px] border-slate-900 bg-[var(--accent)] px-6 py-3 font-black text-white disabled:opacity-50">שמור את הרשימה</button><button type="button" onClick={reset} className="rounded-xl border-2 border-slate-700 bg-white px-5 py-3 font-bold">מחק מהמכשיר</button></div>
      {saved && <p role="status" className="mt-4 rounded-xl bg-emerald-100 p-3 font-bold text-emerald-900">✓ הרשימה נשמרה במכשיר הזה</p>}
    </div>
    <section className="mt-8"><h2 className="text-center text-2xl font-black">מה אפשר לעשות עם הרשימה?</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><Link to="/tools/team-generator" className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm"><b className="text-xl">👥 לחלק לקבוצות</b><span className="mt-2 block text-slate-600">טוענים את כל הכיתה ומחלקים אוטומטית.</span></Link><Link to="/tools/random-picker" className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm"><b className="text-xl">🎡 להגריל שם</b><span className="mt-2 block text-slate-600">גלגל שמות עם אפשרות שלא לחזור על תלמיד.</span></Link></div></section>
  </div>
}
