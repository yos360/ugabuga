import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { checklistWithDates } from '../../utils/barMitzvah'
import { toISO, parseISO, formatGregHe } from '../../utils/hebrewBirthday'
import { crumbs, SpokeNav, inputCls, store } from './shared'

const PATH = '/bar-mitzvah/checklist'
const KEY = 'buga-mitzvah-checklist'

const FAQ = [
  { q: 'מה הדבר הראשון שעושים כשמתחילים לתכנן בר מצווה?', a: 'בודקים את התאריך העברי ואת השבת המתאימה, ומחליטים יחד עם החוגג או החוגגת איזו חגיגה מתאימה ומה התקציב. רק אחרי זה סוגרים מקום וספקים — כך לא מתחייבים לתאריך שלא מסתדר עם בית הכנסת או עם הלוח העברי.' },
  { q: 'מתי שולחים הזמנות לבר מצווה?', a: 'בדרך כלל 6–8 שבועות לפני האירוע. לאורחים מחו״ל או לאירוע בעונה עמוסה כדאי לשלוח "שמרו את התאריך" כבר חצי שנה מראש.' },
  { q: 'כמה זמן לפני מתחילים ללמוד לקרוא בתורה?', a: 'רוב הילדים מתחילים חצי שנה עד שנה לפני — תלוי באורך הקטע (פרשה שלמה, עלייה אחת או הפטרה) ובניסיון הקודם שלהם. כדאי לדבר עם המורה מוקדם, כי מורים טובים מתמלאים.' },
  { q: 'האם הסימונים נשמרים?', a: 'כן, במכשיר שבו סימנתם (בדפדפן). אם תעברו למכשיר אחר או תנקו את הדפדפן, הסימונים יתאפסו — לכן כדאי גם להדפיס עותק ולתלות על המקרר.' },
]

const RELATED = [
  { label: 'מחשבון תאריך בר מצווה', href: '/bar-mitzvah/date' },
  { label: 'רעיונות לבר מצווה', href: '/ideas/bar-mitzvah-ideas' },
  { label: 'ספקים לבר מצווה', href: '/suppliers/category/mitzvah' },
]

function PrintSheet({ stages, done, date }) {
  return (
    <article className="buga-flow" dir="rtl">
      <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 900, margin: 0 }}>צ׳קליסט לבר / בת מצווה</h2>
      {date && <p style={{ textAlign: 'center', margin: '4px 0 12px' }}>תאריך החגיגה: {formatGregHe(parseISO(date))}</p>}
      {stages.map(s => (
        <section key={s.id} style={{ breakInside: 'avoid', marginTop: 12 }}>
          <h3 style={{ fontSize: 19, fontWeight: 800, margin: '0 0 4px', borderBottom: '2px solid #222' }}>{s.title}{s.dueText ? ` — עד ${s.dueText}` : ''}</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {s.items.map(it => <li key={it.id} style={{ display: 'flex', gap: 8, fontSize: 15, padding: '3px 0' }}><span style={{ fontSize: 18, lineHeight: 1 }}>{done[`${s.id}.${it.id}`] ? '☑' : '☐'}</span><span>{it.text}</span></li>)}
          </ul>
        </section>
      ))}
    </article>
  )
}

export default function MitzvahChecklist() {
  const [params] = useSearchParams()
  const fromUrl = parseISO(params.get('date')) ? params.get('date') : ''
  const [date, setDate] = useState(() => fromUrl || store.get(KEY, {}).date || '')
  const [done, setDone] = useState(() => store.get(KEY, {}).done || {})
  const [today] = useState(() => toISO(new Date()))
  const [print, setPrint] = useState(false)
  useEffect(() => { store.set(KEY, { date, done }) }, [date, done])

  const stages = checklistWithDates(date, today)
  const all = stages.flatMap(s => s.items.map(it => `${s.id}.${it.id}`))
  const count = all.filter(k => done[k]).length
  const pct = Math.round(count / all.length * 100)
  const toggle = k => setDone(d => ({ ...d, [k]: !d[k] }))

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 buga-fade-in" dir="rtl">
      <SEO title="צ׳קליסט לבר מצווה ובת מצווה — מה עושים ומתי, להדפסה" description="צ׳קליסט לבר מצווה ובת מצווה לפי חודשים: משנה לפני ועד היום עצמו — מקום, ספקים, תפילין, הזמנות, נאום ומזכרות. מסמנים באתר או מדפיסים, עם תאריכים לפי מועד החגיגה." path={PATH} structuredData={faqSchema(FAQ)} />
      <Breadcrumbs items={crumbs('צ׳קליסט')} />
      <h1 className="mb-2 text-center text-4xl"><span aria-hidden="true">✅ </span>צ׳קליסט לבר מצווה ובת מצווה</h1>
      <p className="mb-6 text-center text-lg text-[var(--muted-foreground)]">צ׳קליסט לבר מצווה לפי חודשים — מה עושים שנה לפני, חצי שנה לפני ועד הבוקר של היום עצמו. מזינים את תאריך החגיגה, ולכל שלב מופיע התאריך שעד אליו כדאי לסיים.</p>

      <section className="ln-box mb-6 space-y-3" aria-label="הגדרות">
        <label className="block max-w-xs font-bold">
          תאריך החגיגה
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
        </label>
        <p className="m-0 text-sm">לא בטוחים בתאריך? <Link to="/bar-mitzvah/date" className="font-bold underline">מחשבון תאריך בר מצווה</Link></p>
        <div>
          <div className="mb-1 flex justify-between text-sm font-bold"><span>התקדמות</span><span>{count} מתוך {all.length}</span></div>
          <div className="h-4 overflow-hidden rounded-full border-2 border-[var(--border)] bg-white" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="אחוז המשימות שסומנו">
            <div className="h-full bg-[#7dd87a] transition-all" style={{ width: pct + '%' }} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="ln-btn" onClick={() => setPrint(true)}>🖨️ הדפסה</button>
          {count > 0 && <button type="button" className="ln-btn alt" onClick={() => { if (confirm('לנקות את כל הסימונים?')) setDone({}) }}>ניקוי סימונים</button>}
        </div>
      </section>

      <ol className="m-0 list-none space-y-5 p-0">
        {stages.map(s => (
          <li key={s.id} className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4">
            <h2 className="m-0 flex flex-wrap items-baseline justify-between gap-x-3 text-xl font-bold sm:text-2xl">
              <span><span aria-hidden="true">{s.emoji} </span>{s.title}</span>
              {s.dueText && <span className={`text-sm font-bold ${s.late ? 'text-rose-700' : 'text-[var(--muted-foreground)]'}`}>{s.late ? 'עבר: ' : 'עד '}{s.dueText}</span>}
            </h2>
            <ul className="m-0 mt-2 list-none space-y-1 p-0">
              {s.items.map(it => {
                const k = `${s.id}.${it.id}`
                return (
                  <li key={it.id}>
                    <label className="flex min-h-[44px] cursor-pointer items-start gap-3 py-1">
                      <input type="checkbox" checked={!!done[k]} onChange={() => toggle(k)} className="mt-1 h-6 w-6 shrink-0 accent-green-600" />
                      <span className={done[k] ? 'text-[var(--muted-foreground)] line-through' : ''}>{it.text}{it.link && <> · <Link to={it.link} className="font-bold underline" onClick={e => e.stopPropagation()}>לכלי</Link></>}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ol>

      {print && <PrintPreview title="צ׳קליסט לבר / בת מצווה" onClose={() => setPrint(false)}><PrintSheet stages={stages} done={done} date={date} /></PrintPreview>}

      <div className="mt-10">
        <SeoBody
          paragraphs={[
            'הצ׳קליסט בנוי לפי זמן ולא לפי נושא, כי כך מתכננים באמת: בכל שלב רואים רק את מה שצריך לעשות עכשיו. משימות שמתאימות רק לחלק מהמשפחות — תפילין, קריאה בתורה, קידוש בבית הכנסת — מסומנות כך, ואפשר פשוט לדלג עליהן.',
            'טיפ שחוסך הרבה לחץ: מנו מבוגר אחד שאחראי ביום עצמו על הספקים ועל לוח הזמנים. ככה ההורים יכולים להיות עם החוגג או החוגגת, לרקוד ולהתרגש — ובשביל זה עשיתם את כל הרשימה.',
          ]}
          faq={FAQ}
          related={RELATED}
        />
      </div>
      <SpokeNav current={PATH} />
    </div>
  )
}
