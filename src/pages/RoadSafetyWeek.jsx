import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import Breadcrumbs from '../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import PrintPreview from '../components/ui/PrintPreview'
import TriviaPrint from '../components/quiz/TriviaPrint'
import { RoadVideo } from '../components/roadsafety/RoadWeekBanner'
import { COLORING, WORKSHEETS } from '../components/roadsafety/RoadSafetyArt'
import { GRADES, READING, SAFE_OR_NOT, WEEK_PLAN, ROAD_FAQ, ROAD_WEEK } from '../data/roadSafetyWeek'
import { seededRandom, seededShuffle } from '../utils/difficultyLevels'
import { israelToday } from '../utils/parashaCalendar'

// שבוע זהירות בדרכים: grade picker (א׳–ו׳) driving the quiz and the reading passage, a traffic-light
// lab, an online "safe or dangerous" worksheet, printable worksheets and colouring pages, and a week plan.
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]] } return b }
const NAV = [['#grades', '🎒 לפי כיתה'], ['#quiz', '❓ מבחן אמריקאי'], ['#reading', '📖 הבנת הנקרא'], ['#light', '🚦 לומדים רמזור'], ['#online', '💻 דף עבודה אונליין'], ['#print', '🖨️ דפי עבודה'], ['#coloring', '🎨 דפי צביעה'], ['#week', '📅 תוכנית לשבוע']]
const Card = ({ id, title, children, className = 'bg-white' }) => <section id={id} className={`mb-8 scroll-mt-20 rounded-3xl border-2 border-[var(--border)] ${className} p-5 sketch-shadow`}><h2 className="mb-3 text-3xl font-bold">{title}</h2>{children}</section>

function Quiz({ grade, seed }) {
  const round = useMemo(() => {
    const rand = seed === 0 ? seededRandom(grade.id * 131) : undefined
    return grade.questions.map(q => ({ ...q, shown: rand ? seededShuffle(q.options, rand) : shuffle(q.options) }))
  }, [grade, seed])
  const [i, setI] = useState(0), [picked, setPicked] = useState(null), [score, setScore] = useState(0)
  useEffect(() => { setI(0); setPicked(null); setScore(0) }, [round])
  const q = round[i]
  const choose = o => { if (picked) return; setPicked(o); if (o === q.options[0]) setScore(s => s + 1) }
  if (!q) return <div className="py-6 text-center">
    <p className="text-6xl mb-2">{score >= round.length - 1 ? '🏆' : '⭐'}</p>
    <p className="text-3xl font-bold mb-1">{score} מתוך {round.length}</p>
    <p className="text-lg">{score >= round.length - 1 ? 'אלופי הדרך! מגיעה לכם תעודת הולך רגל זהיר 🏅' : 'יפה! עוד סיבוב ותהיו מומחים לבטיחות בדרכים'}</p>
  </div>
  return <>
    <div className="mb-2 flex justify-between text-sm font-bold"><span>שאלה {i + 1} מתוך {round.length}</span><span>⭐ {score}</span></div>
    <p className="mb-4 text-2xl font-bold leading-snug">{q.q}</p>
    <div className="grid gap-2 sm:grid-cols-2">{q.shown.map(o => {
      const right = picked && o === q.options[0], wrong = picked === o && o !== q.options[0]
      return <button key={o} type="button" onClick={() => choose(o)} disabled={!!picked} className={`min-h-[56px] rounded-2xl border-2 px-3 text-right text-lg font-bold ${right ? 'border-green-600 bg-green-200' : wrong ? 'border-red-500 bg-red-100' : 'border-slate-800 bg-white hover:-translate-y-0.5'}`}>{o}</button>
    })}</div>
    {picked && <div className="mt-4 rounded-2xl bg-yellow-50 p-3" aria-live="polite">
      <p className="font-bold">{picked === q.options[0] ? '✅ נכון!' : `❌ התשובה הנכונה: ${q.options[0]}`}</p>
      <p>{q.why}</p>
      <button type="button" onClick={() => { setI(n => n + 1); setPicked(null) }} className="mt-3 min-h-[48px] rounded-xl bg-blue-600 px-6 font-bold text-white">{i + 1 < round.length ? 'לשאלה הבאה ←' : 'לתוצאה ←'}</button>
    </div>}
  </>
}

// Israeli signal order: red → red+yellow → green → flashing green → yellow; pedestrians get green while cars wait.
const STEPS = [
  { car: ['red'], ped: 'green', say: 'למכוניות אדום — הן עומדות. להולכי הרגל איש ירוק: בודקים שהמכוניות עצרו, וחוצים בהליכה.' },
  { car: ['red'], ped: 'green-blink', say: 'האיש הירוק מהבהב: מי שעוד לא התחיל — לא מתחיל לחצות. מי שבאמצע — ממשיך לצד השני.' },
  { car: ['red'], ped: 'red', say: 'כולם באדום לרגע — כדי שכל הולכי הרגל יספיקו לסיים לחצות.' },
  { car: ['red', 'yellow'], ped: 'red', say: 'אדום וצהוב יחד: הנהגים מתכוננים. עוד לא נוסעים!' },
  { car: ['green'], ped: 'red', say: 'למכוניות ירוק — הן נוסעות. הולכי הרגל מחכים על המדרכה.' },
  { car: ['green-blink'], ped: 'red', say: 'ירוק מהבהב לנהגים: עוד רגע צהוב — מתכוננים לעצור.' },
  { car: ['yellow'], ped: 'red', say: 'צהוב: הנהגים עוצרים, אם אפשר לעצור בבטחה.' },
]
function TrafficLab() {
  const [n, setN] = useState(0), [auto, setAuto] = useState(false)
  useEffect(() => { if (!auto) return; const t = setInterval(() => setN(x => (x + 1) % STEPS.length), 2600); return () => clearInterval(t) }, [auto])
  const s = STEPS[n]
  const lamp = (color, on) => `rw-lamp ${on ? `on-${color}` : ''} ${on === 'blink' ? 'blink' : ''}`
  const carOn = c => s.car.includes(c) || (c === 'green' && s.car.includes('green-blink') && 'blink')
  return <div className="grid items-center gap-5 sm:grid-cols-[auto_auto_1fr]">
    <div className="mx-auto flex flex-col gap-2 rounded-3xl bg-slate-800 p-3" aria-label="רמזור לנהגים">{['red', 'yellow', 'green'].map(c => <span key={c} className={lamp(c, carOn(c))} />)}<small className="text-center text-white">לנהגים</small></div>
    <div className="mx-auto flex flex-col gap-2 rounded-3xl bg-slate-800 p-3" aria-label="רמזור להולכי רגל">
      <span className={`${lamp('red', s.ped === 'red')} grid place-items-center text-2xl`}>🧍</span>
      <span className={`${lamp('green', s.ped === 'green' ? true : s.ped === 'green-blink' ? 'blink' : false)} grid place-items-center text-2xl`}>🚶</span>
      <small className="text-center text-white">להולכי רגל</small>
    </div>
    <div>
      <p className="mb-3 min-h-[84px] rounded-2xl bg-yellow-50 p-3 text-xl font-bold" aria-live="polite">{s.say}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setN(x => (x + 1) % STEPS.length)} className="min-h-[48px] rounded-xl bg-blue-600 px-5 font-bold text-white">השלב הבא ←</button>
        <button type="button" onClick={() => setAuto(a => !a)} className="min-h-[48px] rounded-xl border-2 border-slate-800 bg-white px-5 font-bold">{auto ? '⏸️ עצירה' : '▶️ הפעלה אוטומטית'}</button>
      </div>
    </div>
  </div>
}

function SafeOrNot() {
  const [ans, setAns] = useState({})
  const done = Object.keys(ans).length, right = SAFE_OR_NOT.filter(([t, safe]) => ans[t] === safe).length
  return <>
    <p className="mb-3 text-lg">לכל מצב — לוחצים "בטוח" או "מסוכן", ומקבלים הסבר.</p>
    <div className="grid gap-3 sm:grid-cols-2">{SAFE_OR_NOT.map(([t, safe, why]) => {
      const a = ans[t], ok = a === safe
      return <div key={t} className={`rounded-2xl border-2 p-3 ${a === undefined ? 'border-slate-300 bg-white' : ok ? 'border-green-600 bg-green-50' : 'border-red-500 bg-red-50'}`}>
        <p className="mb-2 text-lg font-bold">{t}</p>
        {a === undefined
          ? <div className="flex gap-2"><button type="button" onClick={() => setAns(x => ({ ...x, [t]: true }))} className="min-h-[44px] flex-1 rounded-xl bg-green-600 font-bold text-white">✓ בטוח</button><button type="button" onClick={() => setAns(x => ({ ...x, [t]: false }))} className="min-h-[44px] flex-1 rounded-xl bg-red-600 font-bold text-white">✗ מסוכן</button></div>
          : <p>{ok ? '✅ נכון! ' : '❌ לא בדיוק. '}{why}</p>}
      </div>
    })}</div>
    {done > 0 && <p className="mt-4 text-center text-xl font-bold" aria-live="polite">{right} נכונות מתוך {done}{done === SAFE_OR_NOT.length ? ' — סיימתם את דף העבודה! 🎉' : ''} {done > 0 && <button type="button" onClick={() => setAns({})} className="mr-2 underline">מתחילים מחדש</button>}</p>}
  </>
}

function ReadingSheet({ r, label, teacher }) {
  return <article className="buga-flow" dir="rtl" style={{ fontFamily: 'Heebo, Arial, sans-serif', padding: '10mm' }}>
    <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{r.title} — הבנת הנקרא · {label}</h2>
    <p style={{ marginBottom: 12 }}>שבוע זהירות בדרכים · שם: ______________ · תאריך: ________</p>
    {r.text.map((p, i) => <p key={i} style={{ fontSize: 18, lineHeight: 1.7, marginBottom: 8 }}>{p}</p>)}
    <h3 style={{ fontSize: 20, fontWeight: 800, margin: '14px 0 6px' }}>{teacher ? 'תשובות למורה' : 'ענו על השאלות'}</h3>
    <ol style={{ paddingRight: 22, listStyle: 'decimal' }}>{r.questions.map(([q, a]) => <li key={q} style={{ fontSize: 18, marginBottom: 12 }}>{q}{teacher ? <div><b>{a}</b></div> : <div style={{ borderBottom: '1px solid #888', height: 34 }} />}</li>)}</ol>
  </article>
}

function Reading({ grade }) {
  const r = READING[grade.id]
  const [open, setOpen] = useState({}), [print, setPrint] = useState(false)
  useEffect(() => setOpen({}), [grade])
  return <>
    <h3 className="mb-2 text-2xl font-bold">{r.title}</h3>
    <div className="mb-4 space-y-2 rounded-2xl bg-white p-4 text-xl leading-relaxed">{r.text.map((p, i) => <p key={i}>{p}</p>)}</div>
    <ol className="mb-4 space-y-2">{r.questions.map(([q, a], i) => <li key={q} className="rounded-xl bg-white p-3"><b>{i + 1}. {q}</b> <button type="button" onClick={() => setOpen(o => ({ ...o, [i]: !o[i] }))} className="mr-2 text-sm underline">{open[i] ? 'הסתרה' : 'הצגת תשובה'}</button>{open[i] && <p className="mt-1 text-green-800">{a}</p>}</li>)}</ol>
    <button type="button" onClick={() => setPrint(true)} className="min-h-[48px] rounded-xl bg-pink-600 px-6 font-bold text-white">🖨️ הדפסת הקטע עם שאלות ודף תשובות</button>
    {print && <PrintPreview title={`${r.title} — הבנת הנקרא ל${grade.label}`} onClose={() => setPrint(false)}><ReadingSheet r={r} label={grade.label} /><ReadingSheet r={r} label={grade.label} teacher /></PrintPreview>}
  </>
}

function Sheets({ list, title }) {
  const [print, setPrint] = useState(null)
  return <>
    <div className="mb-4"><button type="button" onClick={() => setPrint(list)} className="min-h-[52px] rounded-2xl bg-pink-600 px-6 text-lg font-bold text-white">🖨️ הדפיסו את כל {list.length} הדפים</button></div>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{list.map(item => <button key={item.id} type="button" onClick={() => setPrint([item])} aria-label={`הדפיסו: ${item.name}`} className="rounded-2xl border-2 border-[var(--border)] bg-white p-2 text-center sketch-shadow-sm transition-transform hover:-translate-y-1">
      <div className="aspect-[600/820]"><item.C /></div>
      <p className="mt-1 font-bold">{item.name}{item.age ? <span className="text-sm font-normal"> · {item.age}</span> : null}</p>
    </button>)}</div>
    {print && <PrintPreview title={title} onClose={() => setPrint(null)}>{print.map(item => <article className="buga-a4" key={item.id}><div className="print-art"><item.C /></div></article>)}</PrintPreview>}
  </>
}

function Status() {
  const [today, setToday] = useState('')
  useEffect(() => setToday(israelToday()), [])
  if (!today) return null
  const text = today < ROAD_WEEK.start ? 'השבוע מתחיל ביום ראשון — מתכוננים כבר עכשיו' : today <= ROAD_WEEK.end ? 'שבוע זהירות בדרכים מתקיים עכשיו!' : 'השבוע הסתיים — אבל הכללים נשארים כל השנה'
  return <p className="mt-2 text-xl font-bold">{text}</p>
}

export default function RoadSafetyWeek() {
  const [gid, setGid] = useState(1), [seed, setSeed] = useState(0)
  const grade = GRADES.find(g => g.id === gid)
  const pick = id => { setGid(id); setSeed(s => s + 1) }
  return <main className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title="שבוע זהירות בדרכים 2026 — חידון לכל כיתה, דפי עבודה, צביעה והבנת הנקרא" description="שבוע זהירות בדרכים 1–6.11.2026: מבחן אמריקאי לכל כיתה א׳–ו׳, לימוד רמזור אינטראקטיבי, דפי עבודה אונליין ולהדפסה, דפי צביעה, קטעי הבנת הנקרא ותוכנית יומית לכיתה — בחינם." path="/road-safety-week" structuredData={faqSchema(ROAD_FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'שבוע זהירות בדרכים' }]} />
    <header className="mb-6 overflow-hidden rounded-3xl border-2 border-slate-800 bg-yellow-300 p-5 text-center sketch-shadow">
      <div className="mx-auto max-w-2xl"><RoadVideo /></div>
      <h1 className="mt-4 text-4xl sm:text-5xl">🚦 שבוע זהירות בדרכים</h1>
      <p className="text-lg font-bold">{ROAD_WEEK.datesText}</p>
      <Status />
    </header>
    <nav className="mb-8 flex flex-wrap justify-center gap-2" aria-label="בדף הזה">{NAV.map(([h, l]) => <a key={h} href={h} className="rounded-full border-2 border-slate-800 bg-white px-4 py-2 font-bold">{l}</a>)}<Link to="/signs" className="rounded-full border-2 border-slate-800 bg-blue-100 px-4 py-2 font-bold">🛑 אזור התמרורים</Link></nav>

    <Card id="grades" title="🎒 בוחרים כיתה" className="bg-blue-50">
      <div className="mb-4 flex flex-wrap gap-2" role="radiogroup" aria-label="כיתה">{GRADES.map(g => <button key={g.id} type="button" role="radio" aria-checked={gid === g.id} onClick={() => pick(g.id)} className={`min-h-[48px] rounded-xl border-2 px-4 text-lg font-bold ${gid === g.id ? 'border-slate-800 bg-yellow-200' : 'border-[var(--border)] bg-white'}`}>{g.emoji} {g.label}</button>)}</div>
      <p className="mb-2 text-xl font-bold">ב{grade.label} לומדים: {grade.focus}</p>
      <ul className="mb-3 grid gap-2 sm:grid-cols-2">{grade.rules.map(r => <li key={r} className="rounded-xl bg-white p-3 text-lg">✅ {r}</li>)}</ul>
      <p className="rounded-xl bg-white p-3"><b>פעילות לכיתה: </b>{grade.activity}</p>
    </Card>

    <Card id="quiz" title={`❓ מבחן אמריקאי — ${grade.label}`} className="bg-yellow-50">
      <Quiz grade={grade} seed={seed} />
      <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setSeed(s => s + 1)} className="min-h-[48px] rounded-xl border-2 border-slate-800 bg-white px-5 font-bold">🔄 סיבוב חדש</button></div>
      <TriviaPrint title={`שבוע זהירות בדרכים — חידון ל${grade.label}`} questions={grade.questions.map(q => ({ q: q.q, a: q.options[0], options: q.options, explain: q.why }))} />
    </Card>

    <Card id="reading" title={`📖 הבנת הנקרא — ${grade.label}`} className="bg-green-50"><Reading grade={grade} /></Card>

    <Card id="light" title="🚦 לומדים רמזור"><TrafficLab /></Card>

    <Card id="online" title="💻 דף עבודה אונליין: בטוח או מסוכן?" className="bg-pink-50"><SafeOrNot /></Card>

    <Card id="print" title="🖨️ דפי עבודה להדפסה"><Sheets list={WORKSHEETS} title="דפי עבודה — שבוע זהירות בדרכים" /></Card>

    <Card id="coloring" title="🎨 דפי צביעה ותעודה" className="bg-orange-50"><Sheets list={COLORING} title="דפי צביעה — שבוע זהירות בדרכים" /></Card>

    <Card id="week" title="📅 תוכנית לשבוע — יום אחר יום" className="bg-purple-50">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{WEEK_PLAN.map(([day, e, t, d]) => <div key={day} className="rounded-2xl bg-white p-4"><p className="text-sm font-bold text-[var(--muted-foreground)]">{day}</p><p className="text-xl font-bold">{e} {t}</p><p>{d}</p></div>)}</div>
    </Card>

    <Card id="signs" title="🛑 רוצים עוד? אזור התמרורים" className="bg-blue-50">
      <p className="mb-3 text-lg">כל התמרורים בישראל עם הסבר, משחק זיהוי ותרגול — מעולה לכיתות ד׳–ו׳.</p>
      <div className="flex flex-wrap gap-2"><Link to="/signs" className="min-h-[48px] rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">לכל התמרורים ←</Link><Link to="/signs/game" className="min-h-[48px] rounded-xl border-2 border-slate-800 bg-white px-5 py-3 font-bold">🎮 משחק התמרורים</Link></div>
    </Card>

    <SeoBody paragraphs={['שבוע זהירות בדרכים הוא הזדמנות לעצור ולתרגל עם הילדים את מה שהכי חשוב בדרך: חצייה במעבר חצייה, הבנת הרמזור, חגורת בטיחות בכל מושב, קסדה ברכיבה, ו"לראות ולהיראות". כאן יש פעילות מוכנה לכל כיתה מא׳ ועד ו׳ — מבחן אמריקאי עם הסבר אחרי כל תשובה, קטע הבנת הנקרא, דפי עבודה אונליין ולהדפסה ודפי צביעה מקוריים.', 'הכללים בעמוד מותאמים לישראל: נוסעים בצד ימין ולכן מסתכלים שמאלה, ימינה ושוב שמאלה; ילדים עד גיל 9 חוצים עם מבוגר; קסדה חובה לרוכבי אופניים עד גיל 18; ואופניים חשמליים וקורקינט חשמלי מותרים רק מגיל 16.']} faq={ROAD_FAQ} related={[{ label: 'אזור התמרורים', href: '/signs' }, { label: 'משחק התמרורים', href: '/signs/game' }, { label: 'דפי צביעה', href: '/printables/coloring' }, { label: 'הבנת הנקרא לפי כיתה', href: '/learn/reading' }]} />
  </main>
}
