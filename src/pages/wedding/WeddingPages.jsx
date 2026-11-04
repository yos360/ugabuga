import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import InvitationStudio from '../../components/invitations/InvitationStudio'
import { WEDDING_TASKS, daysUntil, tasksByStage } from './weddingPlan'

const STORE = 'buga-wedding-plan'
const load = () => { try { return JSON.parse(localStorage.getItem(STORE)) || {} } catch { return {} } }
const save = v => { try { localStorage.setItem(STORE, JSON.stringify(v)) } catch { /* private mode: plan just isn't kept */ } }

const STEPS = [
  { n: 1, emoji: '💌', title: 'הזמנה לחתונה', text: 'עיצוב אלגנטי עם השמות שלכם, תמונה ותאריך — לוואטסאפ, לסטורי ולהדפסה.', to: '/invitation/wedding', cta: 'לעיצוב ההזמנה' },
  { n: 2, emoji: '✅', title: 'אישורי הגעה', text: 'קישור אחד שהאורחים פותחים מהוואטסאפ ועונים בלחיצה. אתם רואים מי מגיע, כמה מנות ורגישויות במזון.', to: '/rsvp/wedding', cta: 'לפתיחת אישורי הגעה' },
  { n: 3, emoji: '🪑', title: 'סידור הושבה', text: 'בדף הניהול של אישורי ההגעה קובעים מספר שולחנות ומשבצים כל משפחה. בערב החתונה מדפיסים רשימה לעמדת הכניסה.', to: '/rsvp/wedding', cta: 'לסידור ההושבה' },
  { n: 4, emoji: '🗓️', title: 'מה עושים ומתי', text: 'רשימת משימות לפי תאריך החתונה שלכם, מהשנה שלפני ועד הבוקר של היום הגדול. מסמנים מה כבר נעשה.', to: '#plan', cta: 'לרשימת המשימות' },
]

const FAQ = [
  { q: 'המתכנן באמת חינמי?', a: 'כן. ההזמנה, אישורי ההגעה, סידור ההושבה ורשימת המשימות חינמיים לגמרי, בלי הרשמה ובלי הגבלה על מספר האורחים.' },
  { q: 'איפה נשמרת רשימת המשימות?', a: 'בדפדפן בטלפון או במחשב שבו סימנתם. היא לא עולה לשרת, ולכן כדאי לעבוד עליה תמיד מאותו מכשיר.' },
  { q: 'כמה זמן לפני החתונה שולחים הזמנות?', a: 'בדרך כלל ארבעה עד שישה שבועות לפני. שבוע־שבועיים לפני שולחים תזכורת רק למי שעוד לא אישר הגעה.' },
  { q: 'אפשר לנהל גם חינה או שבת חתן?', a: 'כן. פותחים אירוע נפרד באישורי ההגעה לכל אחד מהם, וכל אירוע מקבל קישור וסיכום משלו.' },
]

function Countdown({ date, setDate }) {
  const days = daysUntil(date)
  return <div className="mx-auto mt-6 max-w-xl rounded-3xl border-2 border-[var(--border)] bg-white p-5 text-center sketch-shadow">
    <label className="font-bold">📅 מתי החתונה?{' '}
      <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mr-2 rounded-xl border-2 border-[var(--border)] px-3 py-1" dir="ltr" />
    </label>
    {date && days !== null && <p className="mt-3 mb-0 text-2xl font-bold" role="status">
      {days > 1 ? <>עוד <span className="text-4xl text-rose-600">{days}</span> ימים לחתונה 💍</> : days === 1 ? 'החתונה מחר! 🎉' : days === 0 ? 'מזל טוב! היום מתחתנים 💍' : 'מזל טוב לזוג הטרי! 🥂'}
    </p>}
  </div>
}

function Plan({ date, done, toggle }) {
  const stages = tasksByStage(date)
  const total = WEDDING_TASKS.length, count = WEDDING_TASKS.filter(t => done[t.id]).length
  return <section id="plan" className="mt-12 scroll-mt-24" aria-labelledby="plan-title">
    <h2 id="plan-title" className="text-center text-3xl font-bold">🗓️ מה עושים ומתי</h2>
    <p className="text-center text-[var(--muted-foreground)]">{date ? 'המשימות מסודרות לפי התאריך שלכם. מה שדחוף עכשיו מסומן בצהוב.' : 'בחרו תאריך למעלה, והמשימות יסתדרו לפי הזמן שנשאר.'} סימנתם {count} מתוך {total}.</p>
    <div className="mx-auto mt-2 h-3 max-w-md overflow-hidden rounded-full bg-[var(--muted)]"><div className="h-full bg-rose-400 transition-all" style={{ width: `${Math.round(count / total * 100)}%` }} /></div>
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {stages.map(s => <div key={s.id} className={`rounded-3xl border-2 border-[var(--border)] p-5 ${s.now ? 'bg-[var(--yellow)]/40' : 'bg-white'}`}>
        <h3 className="m-0 text-xl font-bold">{s.title}{s.now && <span className="mr-2 rounded-full bg-[var(--yellow)] px-2 py-0.5 text-sm">עכשיו</span>}{s.late && <span className="mr-2 rounded-full bg-rose-100 px-2 py-0.5 text-sm">כבר עבר</span>}</h3>
        <ul className="mt-3 list-none space-y-2 p-0">
          {s.tasks.map(t => <li key={t.id}><label className="flex cursor-pointer items-start gap-2">
            <input type="checkbox" checked={!!done[t.id]} onChange={() => toggle(t.id)} className="mt-1.5 h-5 w-5 shrink-0" />
            <span className={done[t.id] ? 'text-[var(--muted-foreground)] line-through' : ''}>{t.text}{t.to && <> · <Link to={t.to} className="font-bold underline">{t.link}</Link></>}</span>
          </label></li>)}
        </ul>
      </div>)}
    </div>
  </section>
}

export function WeddingHub() {
  const [plan, setPlan] = useState({})
  useEffect(() => { setPlan(load()) }, [])
  const update = patch => setPlan(p => { const next = { ...p, ...patch }; save(next); return next })
  const done = plan.done || {}
  return <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">
    <SEO title="מתכנן חתונה חינמי — הזמנה, אישורי הגעה וסידור הושבה" description="בוגה מתחתנים: מתכנן חתונה חינמי בעברית. עיצוב הזמנה לחתונה, אישורי הגעה בוואטסאפ, סידור הושבה לשולחנות ורשימת משימות לפי תאריך החתונה — בלי הרשמה." path="/wedding" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'בוגה מתחתנים' }]} />
    <img src="/images/home-mascot-family.webp" alt="בוגה מחזיק ציור של לב" width="420" height="384" className="mx-auto h-36 w-auto" />
    <h1 className="text-center text-4xl sm:text-5xl">💍 בוגה מתחתנים</h1>
    <p className="mx-auto max-w-2xl text-center text-lg text-[var(--muted-foreground)]">מתכנן חתונה חינמי: מההזמנה, דרך אישורי ההגעה וסידור ההושבה, ועד רשימת המשימות של הבוקר לפני. הכול בעברית, בלי הרשמה.</p>
    <Countdown date={plan.date || ''} setDate={date => update({ date })} />

    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      {STEPS.map(s => {
        const inner = <><span className="text-sm font-bold text-rose-600">שלב {s.n}</span><h2 className="m-0 mt-1 text-2xl font-bold">{s.emoji} {s.title}</h2><p className="mt-2 mb-3 text-[var(--muted-foreground)]">{s.text}</p><span className="font-bold underline">{s.cta} ←</span></>
        const cls = 'block rounded-3xl border-2 border-[var(--border)] bg-white p-5 transition-transform hover:-translate-y-1 sketch-shadow'
        return s.to.startsWith('#') ? <a key={s.n} href={s.to} className={cls}>{inner}</a> : <Link key={s.n} to={s.to} className={cls}>{inner}</Link>
      })}
    </div>

    <Plan date={plan.date || ''} done={done} toggle={id => update({ done: { ...done, [id]: !done[id] } })} />

    <div className="mt-12"><SeoBody paragraphs={['בוגה מתחתנים מרכז את כל מה שזוג צריך כדי לתכנן חתונה בלי טבלאות מבולגנות: מעצבים הזמנה, שולחים קישור לאישור הגעה, רואים כמה מנות להזמין, מושיבים את האורחים בשולחנות, ומסמנים משימות לפי הזמן שנשאר עד החתונה.']} faq={FAQ} related={[{ label: 'הזמנה לחתונה', href: '/invitation/wedding' }, { label: 'אישור הגעה לחתונה', href: '/rsvp/wedding' }, { label: 'ברכות', href: '/greeting' }]} /></div>
  </div>
}

const INVITE_FAQ = [
  { q: 'מה כותבים בהזמנה לחתונה?', a: 'שמות בני הזוג, משפט הזמנה, תאריך עם יום בשבוע, שעת קבלת הפנים ושעת החופה, שם האולם וכתובת, ודרך לאשר הגעה. אפשר להוסיף שורה על חנייה או הסעות.' },
  { q: 'אפשר לצרף להזמנה אישור הגעה?', a: 'כן. יוצרים אירוע באישורי ההגעה לחתונה, מעתיקים את קישור האורחים, והוא מתווסף להזמנה ולהודעת הוואטסאפ.' },
  { q: 'ההזמנה מתאימה גם להדפסה?', a: 'כן. "הדפסה / שמירה כ־PDF" מכין דף A4 חד בעיצוב שבחרתם.' },
]

export function WeddingInvitation() {
  return <div className="mx-auto max-w-6xl px-3 py-5 sm:px-6 sm:py-8" dir="rtl">
    <SEO title="הזמנה לחתונה — עיצוב חינמי עם תמונה ושמות" description="עיצוב הזמנה לחתונה בחינם: סגנונות אלגנטיים, שמות בני הזוג, תמונה, תאריך ומקום. משתפים בוואטסאפ, בסטורי או מדפיסים, עם קישור לאישור הגעה." path="/invitation/wedding" structuredData={faqSchema(INVITE_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'בוגה מתחתנים', href: '/wedding' }, { label: 'הזמנה לחתונה' }]} />
    <h1 className="mb-3 text-center text-3xl sm:text-5xl">💌 הזמנה לחתונה</h1>
    <p className="mx-auto max-w-3xl text-center text-base text-slate-600 sm:text-lg">כותבים את השמות, התאריך והאולם, מוסיפים תמונה משותפת אם רוצים — וההזמנה מוכנה לוואטסאפ או להדפסה.</p>
    <InvitationStudio occasion="wedding" />
    <div className="mx-auto mt-10 max-w-3xl"><SeoBody faq={INVITE_FAQ} related={[{ label: 'בוגה מתחתנים — מתכנן החתונה', href: '/wedding' }, { label: 'אישור הגעה לחתונה', href: '/rsvp/wedding' }, { label: 'הזמנה לבר מצווה', href: '/invitation/bar-mitzvah' }]} /></div>
  </div>
}
