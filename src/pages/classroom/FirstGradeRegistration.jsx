import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import { STEPS, CHECKLIST, READINESS, TALK, TALK_TIPS, CHILD_SKILLS } from '../../data/firstGradeRegistration'

// /classroom/first-grade/registration — general guide for parents ahead of first-grade registration:
// the steps (no municipal dates — each authority sets its own), what readiness really means, a
// checklist that works on screen and prints, how to talk with the child, and an "I'm going to
// first grade" sheet for the child. Nothing is collected or sent; the checklist lives in state only.
const PATH = '/classroom/first-grade/registration'
const FONT = 'Heebo, Arial, sans-serif'
const NAV = [['#steps', '📋 שלבי הרישום'], ['#readiness', '🔍 מה בודקים'], ['#checklist', '✅ רשימת בדיקה'], ['#talk', '💬 איך מדברים'], ['#child-sheet', '🎒 דף לילד']]

const FAQ = [
  { q: 'מתי נרשמים לכיתה א׳?', a: 'כל רשות מקומית קובעת את מועדי הרישום בעצמה ומפרסמת אותם באתר שלה. ברוב המקומות הרישום נערך בחורף, כמה חודשים לפני שנת הלימודים. הדרך הבטוחה היא להיכנס לאתר העירייה או המועצה ולחפש "רישום לכיתה א׳".' },
  { q: 'האם יש מבחן כניסה לכיתה א׳?', a: 'לבית ספר אזורי רגיל נרשמים בלי מבחן, ולא מצפים שהילד יידע לקרוא. בגן הגננת מכירה את הילד לאורך השנה ויכולה לספר לכם איך הוא מסתדר בתחומי המוכנות — כדאי לבקש ממנה שיחה באמצע השנה.' },
  { q: 'מה צריך להכין לרישום?', a: 'בדרך כלל פרטי זהות של ההורים ושל הילד וכתובת מגורים עדכנית. הרשימה המדויקת משתנה מרשות לרשות, ולכן בודקים באתר הרשות לפני שמתחילים.' },
  { q: 'איך יודעים לאיזה בית ספר הילד ישובץ?', a: 'השיבוץ נעשה בדרך כלל לפי אזור הרישום של כתובת המגורים. אם אתם רוצים בית ספר אחר, בודקים מראש את התנאים ואת המועדים באתר הרשות, כי לפעמים הם מוקדמים יותר.' },
  { q: 'הילד שלי לא מכיר את כל האותיות. זה בעיה?', a: 'לא. בכיתה א׳ לומדים את האותיות ואת הקריאה מההתחלה. חשוב יותר שהילד ירגיש בטוח, ידע לבקש עזרה ויהנה ממשחקי צלילים ומילים. אם משהו בדיבור או בהבנה מטריד אתכם, משתפים את הגננת.' },
  { q: 'איך מכינים את הילד רגשית?', a: 'מדברים על בית הספר בטון רגוע ושמח, שואלים מה מעניין אותו ומה מדאיג אותו, עוברים יחד ליד בית הספר ומספרים מראש מה יקרה ביום הראשון. הדף "אני הולך לכיתה א׳" בעמוד הזה עוזר לפתוח שיחה.' },
]
const BODY = [
  'רישום לכיתה א׳ הוא רגע מרגש לכל משפחה, ולפעמים גם מבלבל: מתי נרשמים, מה צריך להכין, איך משבצים לבית ספר ומה בכלל מצפים מהילד לדעת. במדריך הזה ריכזנו את השלבים הכלליים של הרישום, רשימת בדיקה להורים שאפשר לסמן על המסך או להדפיס, ודף "אני הולך לכיתה א׳" שהילד ממלא בעצמו.',
  'חשוב לדעת: אין מועד אחד לכל הארץ. כל רשות מקומית קובעת את מועדי הרישום ואת הדרך להירשם, ולכן כל הפרטים המעשיים נמצאים באתר העירייה או המועצה שלכם. המדריך כאן עוזר להתכונן — לא מחליף את ההודעה של הרשות.',
  'מוכנות לכיתה א׳ היא לא מבחן ידע. ילד שנפרד בבוקר, מבקש עזרה, מחכה לתור ומקשיב להוראה קצרה — יסתדר בכיתה גם אם הוא עוד לא מכיר את כל האותיות. את האותיות, הקריאה והחשבון לומדים בכיתה.',
]
const RELATED = [
  { label: 'הכנה לכיתה א׳ — חוברת ומשחקים', href: '/classroom/first-grade' },
  { label: 'קורס להורים: הכנה לכיתה א׳', href: '/courses/first-grade' },
  { label: 'מוכנות לכיתה א׳ — פתרון בעיות', href: '/classroom/first-grade/problem-solving' },
  { label: 'דפי עבודה לגן חובה', href: '/printables/kindergarten-worksheets' },
  { label: 'חוברת עבודה לגיל 5', href: '/booklets/age-5' },
  { label: 'פרידה מהגן ומעבר לכיתה א׳', href: '/classroom/kindergarten-farewell' },
  { label: 'לוח שגרה להדפסה', href: '/printables/routine-chart' },
  { label: 'כרטיסיות רגשות', href: '/printables/emotion-cards' },
  { label: 'משחקים לכיתה א׳', href: '/games/kita-a' },
]

// Simple outline school bag — used in the header (coloured) and on the child sheet (to colour in).
export function SchoolBag({ size = 120, color = true }) {
  const stroke = '#1e293b'
  return <svg viewBox="0 0 120 130" width={size} height={size * 130 / 120} aria-hidden="true">
    <path d="M42 26 Q42 8 60 8 Q78 8 78 26" fill="none" stroke={stroke} strokeWidth="5" strokeLinecap="round" />
    <rect x="16" y="24" width="88" height="96" rx="18" fill={color ? '#a78bfa' : '#fff'} stroke={stroke} strokeWidth="4" />
    <path d="M16 54 Q60 70 104 54" fill="none" stroke={stroke} strokeWidth="4" />
    <rect x="34" y="76" width="52" height="32" rx="8" fill={color ? '#fde68a' : '#fff'} stroke={stroke} strokeWidth="4" />
    <line x1="46" y1="92" x2="74" y2="92" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
    <circle cx="60" cy="58" r="5" fill={color ? '#f472b6' : '#fff'} stroke={stroke} strokeWidth="3" />
    <path d="M90 34 L96 28 M96 34 L90 28" stroke={color ? '#facc15' : stroke} strokeWidth="3" strokeLinecap="round" />
  </svg>
}

const Card = ({ id, title, intro, children, className = 'bg-white' }) => <section id={id} aria-labelledby={`${id}-h`} className={`mb-8 scroll-mt-20 rounded-3xl border-2 border-[var(--border)] ${className} p-4 sm:p-6 sketch-shadow`}>
  <h2 id={`${id}-h`} className="mb-2 text-3xl font-black">{title}</h2>
  {intro && <p className="mb-4 text-lg">{intro}</p>}
  {children}
</section>
const PrintButton = ({ onClick, children }) => <button type="button" onClick={onClick} className="min-h-[48px] rounded-2xl bg-slate-900 px-5 font-bold text-white">🖨️ {children}</button>

const TOTAL = CHECKLIST.reduce((n, g) => n + g.items.length, 0)

function Checklist() {
  const [done, setDone] = useState({})
  const count = Object.values(done).filter(Boolean).length
  return <>
    <div className="mb-4 rounded-2xl bg-white p-3" aria-live="polite">
      <p className="font-bold">סימנתם {count} מתוך {TOTAL}</p>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.round(count / TOTAL * 100)}%` }} /></div>
      {count === TOTAL && <p className="mt-2 font-bold text-emerald-700">🎉 הכול מוכן! עכשיו רק נשאר להתרגש יחד.</p>}
    </div>
    <div className="grid gap-4 sm:grid-cols-2">{CHECKLIST.map(g => <fieldset key={g.id} className="rounded-2xl border-2 border-slate-200 bg-white p-4">
      <legend className="px-1 text-xl font-black"><span aria-hidden="true">{g.emoji} </span>{g.title}</legend>
      <ul className="space-y-2">{g.items.map(it => <li key={it.id}><label className="flex min-h-[40px] cursor-pointer items-start gap-3 text-lg">
        <input type="checkbox" className="mt-1 h-6 w-6 shrink-0 accent-emerald-600" checked={!!done[it.id]} onChange={e => setDone(d => ({ ...d, [it.id]: e.target.checked }))} />
        <span className={done[it.id] ? 'text-slate-500 line-through' : ''}>{it.text}</span>
      </label></li>)}</ul>
    </fieldset>)}</div>
    <p className="mt-3 text-slate-700">הסימונים נשארים רק על המסך שלכם ונמחקים ברענון. לא חייבים לסמן הכול — זו רשימה לשיחה, לא מבחן.</p>
  </>
}

const sheet = { fontFamily: FONT, padding: '10mm', direction: 'rtl', color: '#111' }
const box = { border: '2px solid #333', borderRadius: 14, padding: 10 }
const lines = n => Array.from({ length: n }, (_, i) => <div key={i} style={{ borderBottom: '1.5px solid #888', height: 30 }} />)

function ParentSheet() {
  return <article className="buga-a4" dir="rtl" style={sheet}>
    <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>רשימת בדיקה להורים — לקראת כיתה א׳</h2>
    <p style={{ fontSize: 13, margin: '4px 0 10px' }}>את מועדי הרישום ואת המסמכים הנדרשים בודקים באתר הרשות המקומית שלכם. מסמנים ✓ במה שכבר מוכן — זו רשימה לשיחה, לא מבחן.</p>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {CHECKLIST.map(g => <div key={g.id} style={{ ...box, breakInside: 'avoid' }}>
        <p style={{ fontSize: 17, fontWeight: 800, margin: '0 0 6px' }}>{g.emoji} {g.title}</p>
        {g.items.map(it => <p key={it.id} style={{ fontSize: 13.5, margin: '0 0 6px', display: 'flex', gap: 8, alignItems: 'flex-start' }}><span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #333', borderRadius: 4, flexShrink: 0, marginTop: 2 }} />{it.text}</p>)}
      </div>)}
      <div style={{ ...box, breakInside: 'avoid' }}>
        <p style={{ fontSize: 17, fontWeight: 800, margin: '0 0 6px' }}>📝 שאלות לגננת או לבית הספר</p>
        {lines(5)}
      </div>
    </div>
    <p style={{ fontSize: 11, marginTop: 10, color: '#555' }}>עוגה בוגה · ugabuga.co.il/classroom/first-grade/registration</p>
  </article>
}

function ChildSheet({ girl }) {
  const g = (m, f) => girl ? f : m
  return <article className="buga-a4" dir="rtl" style={sheet}>
    <h2 style={{ fontSize: 34, fontWeight: 800, margin: 0, textAlign: 'center' }}>אני {g('הולך', 'הולכת')} לכיתה א׳! 🎒</h2>
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 12, marginTop: 12 }}>
      <div style={{ ...box, height: 250 }}><p style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>זה אני בכיתה א׳ (ציור):</p></div>
      <div style={{ ...box, textAlign: 'center' }}><p style={{ fontSize: 17, fontWeight: 700, margin: '0 0 4px' }}>צובעים את התיק שלי:</p><SchoolBag size={150} color={false} /></div>
    </div>
    <div style={{ ...box, marginTop: 12 }}>
      <p style={{ fontSize: 17, fontWeight: 700, margin: '0 0 6px' }}>דברים שאני כבר {g('יודע', 'יודעת')} לעשות לבד (מסמנים ✓):</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {CHILD_SKILLS.map(s => <div key={s.id} style={{ border: '1.5px dashed #555', borderRadius: 10, padding: 6, textAlign: 'center', fontSize: 15 }}><div style={{ fontSize: 30 }}>{s.emoji}</div>{g(s.m, s.f)}<div style={{ width: 22, height: 22, border: '2px solid #333', borderRadius: 5, margin: '4px auto 0' }} /></div>)}
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
      <div style={box}><p style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>הדבר שאני הכי מחכה לו:</p>{lines(3)}</div>
      <div style={box}><p style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>שאלה שאני רוצה לשאול את המורה:</p>{lines(3)}</div>
    </div>
    <div style={{ ...box, marginTop: 12 }}>
      <p style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>איך אני {g('מרגיש', 'מרגישה')} כשאני {g('חושב', 'חושבת')} על כיתה א׳? (מקיפים)</p>
      <p style={{ fontSize: 34, margin: 0, display: 'flex', justifyContent: 'space-around' }}><span>😀</span><span>🤩</span><span>😊</span><span>😐</span><span>😟</span></p>
    </div>
    <p style={{ fontSize: 11, marginTop: 8, color: '#555', textAlign: 'center' }}>להורים: ממלאים יחד, והילד מסביר במילים שלו. אפשר לתלות על המקרר עד היום הראשון. · עוגה בוגה</p>
  </article>
}

export default function FirstGradeRegistration() {
  const [print, setPrint] = useState(null), [girl, setGirl] = useState(false)
  return <main className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title="רישום לכיתה א׳ — מדריך להורים: שלבים, רשימת בדיקה והכנת הילד" description="מדריך לרישום לכיתה א׳: איך נרשמים ומה מכינים, איך משבצים לבית ספר, מה באמת בודקים במוכנות, רשימת בדיקה להורים להדפסה, איך מדברים עם הילד ודף 'אני הולך לכיתה א׳' לילד. בחינם." path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לכיתה', href: '/classroom' }, { label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' }, { label: 'רישום לכיתה א׳' }]} />
    <header className="mb-6 flex flex-col items-center gap-4 rounded-3xl border-2 border-slate-200 bg-gradient-to-l from-violet-50 via-white to-amber-50 p-5 text-center sm:flex-row sm:p-8 sm:text-right">
      <SchoolBag size={110} />
      <div>
        <h1 className="text-4xl font-black sm:text-5xl">רישום לכיתה א׳ — מדריך להורים</h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-700">מה בודקים, מה מכינים ואיך מדברים עם הילד: שלבי הרישום בקצרה, מה באמת חשוב במוכנות לכיתה א׳, רשימת בדיקה לסימון ולהדפסה, ודף "אני הולך לכיתה א׳" שהילד ממלא בעצמו.</p>
      </div>
    </header>
    <nav aria-label="בעמוד הזה" className="mb-8 flex flex-wrap justify-center gap-2">{NAV.map(([h, l]) => <a key={h} href={h} className="rounded-full border-2 border-slate-800 bg-white px-4 py-2 font-bold">{l}</a>)}</nav>

    <Card id="steps" title="📋 שלבי הרישום לכיתה א׳" intro="השלבים כלליים. את המועדים, את המסמכים ואת אתר הרישום קובעת כל רשות מקומית בעצמה — לכן בכל שלב בודקים גם באתר העירייה או המועצה שלכם." className="bg-sky-50">
      <ol className="grid gap-3 sm:grid-cols-2">{STEPS.map((s, i) => <li key={s.id} className="rounded-2xl bg-white p-4">
        <h3 className="text-xl font-black"><span className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 text-base text-white">{i + 1}</span><span aria-hidden="true">{s.emoji} </span>{s.title}</h3>
        <p className="mt-2">{s.text}</p>
      </li>)}</ol>
    </Card>

    <Card id="readiness" title="🔍 מה בודקים? מוכנות, לא מבחן" intro="לבית ספר אזורי נרשמים בלי מבחן כניסה, ולא מצפים שילד יידע לקרוא בתחילת כיתה א׳. כשמדברים על מוכנות, הגננות והמורות מסתכלות בעיקר על התחומים האלה:" className="bg-amber-50">
      <div className="grid gap-3 sm:grid-cols-3">{READINESS.map(r => <div key={r.id} className="rounded-2xl bg-white p-4"><h3 className="text-xl font-black"><span aria-hidden="true">{r.emoji} </span>{r.title}</h3><p className="mt-1">{r.text}</p></div>)}</div>
      <p className="mt-4 text-slate-700">הגננת מכירה את הילד כל השנה. כדאי לבקש ממנה שיחה באמצע השנה ולשאול: "איפה הוא חזק? במה כדאי לחזק אותו עד הקיץ?". כל ילד מתפתח בקצב שלו; אם משהו מטריד אתכם, מתייעצים עם הגננת או עם איש מקצוע. להרחבה: <Link to="/courses/first-grade" className="font-bold underline">קורס קצר להורים על מוכנות לכיתה א׳</Link>.</p>
    </Card>

    <Card id="checklist" title="✅ רשימת בדיקה להורים" intro="מסמנים מה כבר מוכן ורואים מה נשאר. אפשר גם להדפיס ולתלות על המקרר." className="bg-emerald-50">
      <Checklist />
      <div className="mt-4"><PrintButton onClick={() => setPrint('parents')}>הדפסת רשימת הבדיקה</PrintButton></div>
    </Card>

    <Card id="talk" title="💬 איך מדברים עם הילד על כיתה א׳" intro="המילים שלנו קובעות אם כיתה א׳ נשמעת כמו הרפתקה או כמו מבחן. כמה משפטים שכדאי להחליף:" className="bg-violet-50">
      <div className="space-y-2">{TALK.map(([no, yes]) => <div key={no} className="grid gap-2 rounded-2xl bg-white p-3 sm:grid-cols-2">
        <p><span className="font-black text-rose-700">במקום: </span>{no}</p>
        <p><span className="font-black text-emerald-700">נסו: </span>{yes}</p>
      </div>)}</div>
      <h3 className="mt-5 text-2xl font-black">ועוד כמה רעיונות</h3>
      <ul className="mt-2 grid gap-3 sm:grid-cols-2">{TALK_TIPS.map(t => <li key={t.text} className="rounded-2xl bg-white p-3"><span aria-hidden="true" className="text-2xl">{t.emoji} </span>{t.text}</li>)}</ul>
    </Card>

    <Card id="child-sheet" title='🎒 דף לילד: "אני הולך לכיתה א׳"' intro="דף שממלאים יחד: ציור של עצמי בכיתה א׳, תיק לצביעה, מה אני כבר עושה לבד, למה אני הכי מחכה ואיך אני מרגיש. הדף פותח שיחה — ואפשר לתלות אותו עד היום הראשון." className="bg-pink-50">
      <div className="mb-4 flex flex-wrap gap-2" role="radiogroup" aria-label="נוסח הדף">
        {[[false, 'אני הולך'], [true, 'אני הולכת']].map(([v, l]) => <button key={l} type="button" role="radio" aria-checked={girl === v} onClick={() => setGirl(v)} className={`min-h-[48px] rounded-xl border-2 px-4 text-lg font-bold ${girl === v ? 'border-slate-800 bg-yellow-200' : 'border-[var(--border)] bg-white'}`}>{l}</button>)}
      </div>
      <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4">
        <SchoolBag size={90} color={false} />
        <ul className="flex-1 list-disc pr-5 text-lg">
          <li>זה אני בכיתה א׳ — מקום לציור</li>
          <li>תיק לצביעה</li>
          <li>6 דברים שאני כבר {girl ? 'יודעת' : 'יודע'} לעשות לבד</li>
          <li>למה אני הכי מחכה, ושאלה למורה</li>
          <li>איך אני {girl ? 'מרגישה' : 'מרגיש'} — מקיפים פרצוף</li>
        </ul>
      </div>
      <div className="mt-4"><PrintButton onClick={() => setPrint('child')}>הדפסת הדף לילד</PrintButton></div>
    </Card>

    <p className="mb-8 text-center text-lg">ממשיכים להתכונן: <Link to="/classroom/first-grade" className="font-bold underline">חוברת הכנה לכיתה א׳, משחקי אותיות וחשבון ←</Link></p>

    {print && <PrintPreview title={print === 'child' ? `אני ${girl ? 'הולכת' : 'הולך'} לכיתה א׳ — דף לילד` : 'רשימת בדיקה להורים — כיתה א׳'} onClose={() => setPrint(null)}>
      {print === 'parents' ? <ParentSheet /> : <ChildSheet girl={girl} />}
    </PrintPreview>}

    <SeoBody paragraphs={BODY} faq={FAQ} related={RELATED} />
  </main>
}
