import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { AREAS, skillById, SKILLS, skillsFor } from '../../data/tutoring/skills'
import { DAYS_OPTIONS, DEFAULTS, decodePlan, encodePlan, GRADE_NAMES, MAX_SKILLS, MINUTES_OPTIONS } from '../../data/tutoring/plan'
import { readStore } from './store'
import '../../learn/learn.css'

// /tutoring: a parent picks the grade and what is hard, and gets a week or a month of short daily sessions.
// Nothing about the child is asked for, and no sign-up.
const STEP = 'mt-6 ln-box'
const Num = ({ n }) => <span aria-hidden="true" className="ml-2 inline-grid h-8 w-8 place-items-center rounded-full bg-[var(--yellow,#ffd23f)] font-black">{n}</span>
const FAQ = [
  ['כמה זמן ביום צריך?', 'אפשר להתחיל מעשר דקות ביום. לילד שמתקשה עדיף מפגש קצר וקבוע על פני מפגש ארוך ונדיר.'],
  ['מה קורה אם הילד לא מצליח?', 'מסמנים "היה קשה", והתוכנית נשארת בשלב הזה גם במפגש הבא במקום להתקדם.'],
  ['צריך להירשם?', 'לא. הכול פתוח וחינמי, בלי הרשמה ובלי פרטים על הילד. ההתקדמות נשמרת בדפדפן שלכם.'],
  ['אפשר להדפיס הכול?', 'כן. אפשר להדפיס את התוכנית כטבלה למקרר, דף עבודה ליום אחד, דפים לשבוע שלם או את כל דפי העבודה יחד, כולל דפי תשובות.'],
  ['זה מחליף מורה או אבחון?', 'לא. זו עזרה לתרגול בבית. אם הקושי נמשך, כדאי לדבר עם המורה או עם יועצת בית הספר.'],
]

export default function TutoringHome() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(() => ({ ...DEFAULTS, ...(params.get('g') || params.get('s') ? decodePlan(params.toString()) : {}) }))
  const [area, setArea] = useState(() => skillById(plan.skills[0])?.area || 'reading')
  const [last, setLast] = useState(null)
  useEffect(() => { setLast(readStore().last || null) }, [])
  const set = patch => setPlan(p => ({ ...p, ...patch }))
  const setGrade = grade => set({ grade, skills: plan.skills.filter(id => { const s = skillById(id); return grade >= s.grades[0] && grade <= s.grades[1] }) })
  const toggle = id => set({ skills: plan.skills.includes(id) ? plan.skills.filter(x => x !== id) : plan.skills.length < MAX_SKILLS ? [...plan.skills, id] : plan.skills })
  const shown = skillsFor(plan.grade, area)
  const full = plan.skills.length >= MAX_SKILLS

  return <div className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
    <SEO title="שיעורי עזר בבית: תוכנית אישית לילד שמתקשה בלימודים" description="בוחרים כיתה ובמה הילד מתקשה, ומקבלים תוכנית שבועית או חודשית: מפגש קצר בכל יום, תרגול באתר ודפי עבודה להדפסה. בחינם ובלי הרשמה." path="/tutoring"
      structuredData={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, { label: 'שיעורי עזר בבית' }]} />

    <header className="grid items-center gap-3 sm:grid-cols-[1fr_170px]">
      <div>
        <h1 className="text-4xl font-black sm:text-5xl">שיעורי עזר בבית</h1>
        <p className="mt-2 text-lg">הילד מתקשה בלימודים? בוחרים כיתה ובמה קשה, ומקבלים תוכנית לשבוע או לחודש. מפגש קצר בכל יום, עם הסבר להורה, תרגול ודף עבודה.</p>
      </div>
      <img src="/images/home-mascot-class.webp" alt="בוגה בכיתה" width="420" height="384" className="mx-auto h-36 w-auto" />
    </header>

    {last && <p className="mt-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-3 text-center font-bold">יש לכם תוכנית פתוחה. <Link to={`/tutoring/plan?${last}`} className="underline">להמשיך בה ←</Link></p>}

    <section className={STEP} aria-labelledby="t-grade">
      <h2 id="t-grade" className="text-2xl font-black"><Num n={1} />באיזו כיתה?</h2>
      <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8">{GRADE_NAMES.slice(1).map((g, i) => <button key={g} type="button" className="ln-chip justify-center" aria-pressed={plan.grade === i + 1} onClick={() => setGrade(i + 1)}>{g}</button>)}</div>
    </section>

    <section className={STEP} aria-labelledby="t-skills">
      <h2 id="t-skills" className="text-2xl font-black"><Num n={2} />במה קשה?</h2>
      <p className="mt-1">אפשר לבחור עד {MAX_SKILLS} נושאים. כדאי להתחיל מהקושי שהכי מפריע עכשיו.</p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="תחום">{AREAS.map(a => <button key={a.id} type="button" className="ln-chip" aria-pressed={area === a.id} onClick={() => setArea(a.id)}>{a.emoji} {a.title}</button>)}</div>
      {shown.length ? <ul className="mt-3 grid gap-2 sm:grid-cols-2">{shown.map(s => {
        const on = plan.skills.includes(s.id)
        return <li key={s.id}><button type="button" aria-pressed={on} disabled={full && !on} onClick={() => toggle(s.id)} className={`h-full min-h-[76px] w-full rounded-2xl border-2 p-3 text-right transition-colors disabled:opacity-40 ${on ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-white hover:border-slate-500'}`}>
          <span className="block font-black">{on ? '✅' : s.emoji} {s.title}</span>
          <span className="mt-0.5 block text-sm">{s.short}</span>
        </button></li>
      })}</ul> : <p className="mt-3">בתחום הזה אין עדיין נושאים לכיתה {GRADE_NAMES[plan.grade]}.</p>}
      {plan.skills.length > 0 && <p className="mt-3 font-bold">נבחרו: {plan.skills.map(id => skillById(id).title).join(' · ')}</p>}
    </section>

    <section className={STEP} aria-labelledby="t-time">
      <h2 id="t-time" className="text-2xl font-black"><Num n={3} />כמה זמן יש לכם?</h2>
      <fieldset className="mt-3"><legend className="font-bold">משך התוכנית</legend><div className="mt-1 flex flex-wrap gap-2">{[[1, 'שבוע'], [4, 'חודש']].map(([w, l]) => <button key={w} type="button" className="ln-chip" aria-pressed={plan.weeks === w} onClick={() => set({ weeks: w })}>{l}</button>)}</div></fieldset>
      <fieldset className="mt-3"><legend className="font-bold">ימים בשבוע</legend><div className="mt-1 flex flex-wrap gap-2">{DAYS_OPTIONS.map(d => <button key={d} type="button" className="ln-chip" aria-pressed={plan.days === d} onClick={() => set({ days: d })}>{d} ימים</button>)}</div></fieldset>
      <fieldset className="mt-3"><legend className="font-bold">דקות ביום</legend><div className="mt-1 flex flex-wrap gap-2">{MINUTES_OPTIONS.map(m => <button key={m} type="button" className="ln-chip" aria-pressed={plan.minutes === m} onClick={() => set({ minutes: m })}>{m} דקות</button>)}</div></fieldset>
      <fieldset className="mt-3"><legend className="font-bold">מאיפה מתחילים?</legend><div className="mt-1 flex flex-wrap gap-2">
        <button type="button" className="ln-chip" aria-pressed={plan.base} onClick={() => set({ base: true })}>🧱 מהבסיס</button>
        <button type="button" className="ln-chip" aria-pressed={!plan.base} onClick={() => set({ base: false })}>🎒 מהחומר של הכיתה</button>
      </div></fieldset>
      <label className="mt-3 flex min-h-[44px] items-center gap-2 font-bold"><input type="checkbox" className="h-5 w-5" checked={plan.focus} onChange={e => set({ focus: e.target.checked })} /> קשה לשבת הרבה זמן? נוסיף הפסקת תנועה בכל מפגש</label>
    </section>

    <div className="mt-6 text-center">
      <button type="button" className="ln-btn go" disabled={!plan.skills.length} onClick={() => navigate(`/tutoring/plan?${encodePlan(plan)}`)}>{plan.skills.length ? 'בונים את התוכנית ←' : 'בחרו נושא אחד לפחות'}</button>
    </div>

    <section className="mt-10"><h2 className="text-2xl font-black">במה אפשר לעזור</h2>
      {AREAS.map(a => <div key={a.id} className="mt-3"><h3 className="text-lg font-black">{a.emoji} {a.title}</h3>
        <ul className="mt-1 flex flex-wrap gap-2">{SKILLS.filter(s => s.area === a.id).map(s => <li key={s.id}><Link to={`/tutoring/${s.id}`} className="ln-chip !min-h-[40px] !py-1 text-sm">{s.title}</Link></li>)}</ul>
      </div>)}
    </section>

    <section className="mt-10"><h2 className="text-2xl font-black">שאלות נפוצות</h2>
      {FAQ.map(([q, a]) => <details key={q} className="mt-2 rounded-xl border-2 border-slate-200 bg-white p-3"><summary className="cursor-pointer font-bold">{q}</summary><p className="mt-1">{a}</p></details>)}
    </section>
  </div>
}
