import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import { FONT } from '../../components/holidays/printKit'
import { SPA_STATIONS, SPA_SCHEDULE, shoppingList } from '../../data/spaParty'

// /birthday/spa-party: a home spa birthday for ages 6–12 — five stations with materials and steps,
// a two-hour schedule, a shopping list that scales with the guest count, safety notes, and three
// A4 sheets (invitations, station signs, "spa expert" certificates) in colour or for colouring.
const PATH = '/birthday/spa-party'

const T = ({ x, y, size = 16, weight = 700, fill = '#111', children }) => <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontSize={size} fontWeight={weight} fill={fill} direction="rtl">{children}</text>

const PINK = ['#fbcfe8', '#bbf7d0', '#e9d5ff', '#fde68a', '#bfdbfe', '#fed7aa']

function Cucumber({ x, y, r = 18, color }) {
  return <g>
    <circle cx={x} cy={y} r={r} fill={color ? '#86efac' : 'white'} stroke="#111" strokeWidth="2.5" />
    <circle cx={x} cy={y} r={r * 0.72} fill={color ? '#dcfce7' : 'white'} stroke="#111" strokeWidth="1.5" />
    {Array.from({ length: 6 }, (_, i) => { const a = i * Math.PI / 3; return <ellipse key={i} cx={x + Math.cos(a) * r * 0.38} cy={y + Math.sin(a) * r * 0.38} rx="2" ry="3.5" transform={`rotate(${i * 60 + 90} ${x + Math.cos(a) * r * 0.38} ${y + Math.sin(a) * r * 0.38})`} fill="#111" /> })}
  </g>
}

function Polish({ x, y, s = 1, fill }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    <rect x="-8" y="-38" width="16" height="22" rx="3" fill="#475569" stroke="#111" strokeWidth="2.5" />
    <path d="M-18 -16 H18 Q24 -16 24 -8 V14 Q24 22 16 22 H-16 Q-24 22 -24 14 V-8 Q-24 -16 -18 -16 Z" fill={fill} stroke="#111" strokeWidth="2.5" />
    <path d="M-15 -6 V10" stroke="white" strokeWidth="4" strokeLinecap="round" />
  </g>
}

function Comb({ x, y, s = 1, fill }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-34" y="-14" width="68" height="12" rx="5" fill={fill} stroke="#111" strokeWidth="2.5" />
    {Array.from({ length: 11 }, (_, i) => <rect key={i} x={-31 + i * 6} y="-2" width="3" height="16" rx="1.5" fill={fill} stroke="#111" strokeWidth="1.5" />)}
  </g>
}

function Cup({ x, y, s = 1, fill }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    <path d="M6 -40 L14 -62" stroke="#111" strokeWidth="4" strokeLinecap="round" />
    <path d="M-22 -34 H22 L16 26 H-16 Z" fill={fill} stroke="#111" strokeWidth="2.5" />
    <circle cx="-20" cy="-34" r="9" fill="#fdba74" stroke="#111" strokeWidth="2" />
    <path d="M-20 -43 V-25 M-29 -34 H-11" stroke="#111" strokeWidth="1.2" />
  </g>
}

function Jar({ x, y, s = 1, fill }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`} strokeLinejoin="round">
    <rect x="-20" y="-36" width="40" height="12" rx="3" fill={fill} stroke="#111" strokeWidth="2.5" />
    <rect x="-24" y="-24" width="48" height="50" rx="10" fill="white" stroke="#111" strokeWidth="2.5" />
    <path d="M-20 0 H20" stroke="#111" strokeWidth="1.5" strokeDasharray="3 3" />
    {[-12, -2, 8, 14, -8, 4].map((dx, i) => <circle key={i} cx={dx} cy={8 + (i % 3) * 5} r="1.6" fill="#111" />)}
  </g>
}

function Flower({ x, y, r = 10, fill }) {
  return <g>
    {Array.from({ length: 5 }, (_, i) => { const a = i * 2 * Math.PI / 5; return <circle key={i} cx={x + Math.cos(a) * r} cy={y + Math.sin(a) * r} r={r * 0.75} fill={fill} stroke="#111" strokeWidth="2" /> })}
    <circle cx={x} cy={y} r={r * 0.55} fill="#fde047" stroke="#111" strokeWidth="2" />
  </g>
}

function Towel({ x, y, s = 1, fill }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-38" y="-14" width="76" height="30" rx="15" fill={fill} stroke="#111" strokeWidth="2.5" />
    <circle cx="38" cy="1" r="15" fill={fill} stroke="#111" strokeWidth="2.5" />
    <path d="M38 1 m-8 0 a8 8 0 1 0 8 -8" fill="none" stroke="#111" strokeWidth="1.8" />
    <path d="M-20 -14 V16 M-12 -14 V16" stroke="#111" strokeWidth="1.5" />
  </g>
}

const ICONS = {
  mask: (x, y, c) => <><Cucumber x={x - 24} y={y} r={20} color={c} /><Cucumber x={x + 24} y={y} r={20} color={c} /></>,
  nails: (x, y, c) => <><Polish x={x - 22} y={y + 6} fill={c ? '#f472b6' : 'white'} /><Polish x={x + 24} y={y + 6} s={0.85} fill={c ? '#a78bfa' : 'white'} /></>,
  hair: (x, y, c) => <><Comb x={x} y={y} fill={c ? '#fbcfe8' : 'white'} /><Flower x={x + 44} y={y - 16} r={7} fill={c ? '#f9a8d4' : 'white'} /></>,
  bar: (x, y, c) => <Cup x={x} y={y + 14} fill={c ? '#fed7aa' : 'white'} />,
  scrub: (x, y, c) => <Jar x={x} y={y + 8} fill={c ? '#c4b5fd' : 'white'} />,
}

// Two invitations per sheet, with blank lines the family fills in by hand.
function InvitesPage({ color }) {
  return <svg viewBox="0 0 600 820" role="img" aria-label="הזמנה למסיבת ספא ליום הולדת" style={{ width: '100%', height: '100%', background: 'white' }}>
    {[0, 1].map(i => {
      const y = 20 + i * 400
      return <g key={i}>
        <rect x="20" y={y} width="560" height="380" rx="24" fill={color ? '#fdf2f8' : 'white'} stroke="#111" strokeWidth="2" strokeDasharray="8 6" />
        <Towel x={110} y={y + 60} s={1.1} fill={color ? '#f9a8d4' : 'white'} />
        <Cucumber x={480} y={y + 58} r={24} color={color} />
        <Flower x={300} y={y + 52} r={12} fill={color ? '#c4b5fd' : 'white'} />
        <T x={300} y={y + 128} size={40} weight={900} fill={color ? '#be185d' : '#111'}>מוזמנים למסיבת ספא!</T>
        <T x={300} y={y + 166} size={20}>חוגגים יום הולדת ל: _______________</T>
        <T x={300} y={y + 206} size={18} weight={400}>ביום: __________  בשעה: __________</T>
        <T x={300} y={y + 244} size={18} weight={400}>איפה: ______________________</T>
        <T x={300} y={y + 290} size={16} weight={700}>מסכות פנים · ציפורניים · צמות · בר שתייה</T>
        <T x={300} y={y + 322} size={14} weight={400}>מביאים רק מצב רוח טוב. יש אלרגיה? ספרו לנו מראש.</T>
        <T x={300} y={y + 352} size={14} weight={400}>אישור הגעה: _______________</T>
      </g>
    })}
  </svg>
}

// A welcome sign plus one sign for each station, six per sheet.
function SignsPage({ color }) {
  const cells = [{ id: 'welcome', name: 'ברוכים הבאים לספא', sub: 'מורידים נעליים ונרגעים' }, ...SPA_STATIONS.map(s => ({ id: s.id, name: s.name, sub: `עמדה ${SPA_STATIONS.indexOf(s) + 1}` }))]
  return <svg viewBox="0 0 600 820" role="img" aria-label="שלטים לעמדות מסיבת הספא" style={{ width: '100%', height: '100%', background: 'white' }}>
    <T x={300} y={36} size={22} weight={800}>שלטים לעמדות — גוזרים ומדביקים ליד כל עמדה</T>
    {cells.map((c, i) => {
      const col = i % 2, row = Math.floor(i / 2), x = 305 - col * 285, y = 56 + row * 252
      return <g key={c.id}>
        <rect x={x} y={y} width="275" height="240" rx="18" fill={color ? PINK[i % PINK.length] : 'white'} stroke="#111" strokeWidth="2" strokeDasharray="7 5" />
        <rect x={x + 12} y={y + 12} width="251" height="216" rx="12" fill="white" stroke="#111" strokeWidth="2" />
        {ICONS[c.id] ? ICONS[c.id](x + 137, y + 78, color) : <><Towel x={x + 120} y={y + 76} fill={color ? '#f9a8d4' : 'white'} /><Flower x={x + 210} y={y + 60} r={9} fill={color ? '#c4b5fd' : 'white'} /></>}
        <T x={x + 137} y={y + 160} size={c.name.length > 14 ? 21 : 26} weight={900}>{c.name}</T>
        <T x={x + 137} y={y + 196} size={15} weight={400}>{c.sub}</T>
      </g>
    })}
  </svg>
}

// Two certificates per sheet.
function CertsPage({ color }) {
  return <svg viewBox="0 0 600 820" role="img" aria-label="תעודת מומחיות ספא להדפסה" style={{ width: '100%', height: '100%', background: 'white' }}>
    {[0, 1].map(i => {
      const y = 20 + i * 400
      return <g key={i}>
        <rect x="20" y={y} width="560" height="380" rx="20" fill={color ? '#fefce8' : 'white'} stroke="#111" strokeWidth="2" strokeDasharray="8 6" />
        <rect x="36" y={y + 16} width="528" height="348" rx="14" fill="none" stroke={color ? '#db2777' : '#111'} strokeWidth="4" />
        {[70, 530].map(fx => <Flower key={fx} x={fx} y={y + 54} r={11} fill={color ? '#f9a8d4' : 'white'} />)}
        <T x={300} y={y + 76} size={36} weight={900} fill={color ? '#9d174d' : '#111'}>תעודת מומחיות ספא</T>
        <T x={300} y={y + 128} size={18} weight={400}>התעודה מוענקת ל:</T>
        <path d={`M150 ${y + 168} H450`} stroke="#111" strokeWidth="2" />
        <T x={300} y={y + 206} size={17} weight={400}>שהשתתפו במסיבת הספא, הכינו מסכה, קלעו צמה</T>
        <T x={300} y={y + 232} size={17} weight={400}>ובעיקר — עזרו לחברים להרגיש נפלא.</T>
        <Polish x={150} y={y + 296} s={0.8} fill={color ? '#f472b6' : 'white'} />
        <Jar x={450} y={y + 296} s={0.8} fill={color ? '#c4b5fd' : 'white'} />
        <T x={300} y={y + 300} size={15} weight={400}>תאריך: __________</T>
        <T x={300} y={y + 336} size={15} weight={400}>חתימת בעל/ת השמחה: __________</T>
      </g>
    })}
  </svg>
}

const PAGES = [
  { id: 'invites', name: 'דף 1: 2 הזמנות למילוי', C: InvitesPage },
  { id: 'signs', name: 'דף 2: 6 שלטים לעמדות', C: SignsPage },
  { id: 'certs', name: 'דף 3: 2 תעודות מומחיות ספא', C: CertsPage },
]

const SAFETY = [
  'שואלים את ההורים מראש על אלרגיות — לחלב, לשיבולת שועל, לדבש, לפירות ולקוסמטיקה. מי שאלרגי מקבל חלופה, לא "רק קצת".',
  'כל מה שנמרח על הפנים נבדק קודם על פנים כף היד. לא ליד העיניים ולא בפה.',
  'מסרק אישי לכל ילד, שנשאר אצלו. לא מעבירים מסרקים, מברשות וגומיות משומשות בין ילדים.',
  'בלי מחליק, בלי מסלסל ובלי מים חמים מדי. רק כלים קרים.',
  'לק לילדים על בסיס מים בלבד, בחדר מאוורר. בלי אצטון ובלי דבק ציפורניים.',
  'בלי שמנים אתריים ובלי קוסמטיקה של מבוגרים — עור של ילדים רגיש יותר.',
  'תמונות — רק של מי שההורים שלו הסכימו, ולא מעלים לרשתות בלי לשאול.',
]

const FAQ = [
  { q: 'איך עושים מסיבת ספא ליום הולדת בבית?', a: 'מחלקים את החדר ל־4–5 עמדות: מסכת פנים עם מלפפונים, קישוט ציפורניים, צמות ושיער, בר שתייה ופילינג סוכר שלוקחים הביתה. כל עמדה לוקחת 15–20 דקות, ומסיבה שלמה עם עוגה נכנסת בשעתיים. בעמוד יש לוח זמנים מלא, רשימת קניות לפי מספר הילדים ושלטים להדפסה.' },
  { q: 'לאיזה גיל מתאימה מסיבת ספא?', a: 'בעיקר לגילאי 6–12. לגילאי 6–8 מבוגר מורח ומקלע והילדים בוחרים, ולגילאי 9–12 הילדים עובדים בזוגות ומפנקים אחד את השני. מתחת לגיל 6 עדיף לוותר על לק ועל מסכות.' },
  { q: 'איך מכינים מסכת פנים לילדים?', a: '3 כפות יוגורט טבעי, 2 כפות שיבולת שועל טחונה דק וכפית דבש — מנה לכל 3–4 ילדים. מורחים שכבה דקה הרחק מהעיניים, משאירים 10 דקות ושוטפים במים פושרים. בודקים קודם על פנים כף היד, ומי שרגיש לחלב או לשיבולת שועל מקבל רק מלפפונים.' },
  { q: 'כמה עולה מסיבת ספא בבית?', a: 'לעשרה ילדים — בערך 150–200 ₪ לציוד ולפירות, בלי העוגה. הרבה מהדברים כבר נמצאים בבית: מגבות, שמן, קערות ומראה. המחשבון בעמוד מחשב כמויות ועלות לפי מספר הילדים.' },
  { q: 'מה נותנים במקום שקית הפתעה במסיבת ספא?', a: 'צנצנת פילינג סוכר שכל ילד מכין בעצמו עם מדבקת שם, המסרק האישי והסרט לשיער. זו מתנה שימושית שהילדים עשו בעצמם.' },
]

const chip = on => `min-h-[44px] rounded-full border-2 px-4 font-bold ${on ? 'border-slate-800 bg-pink-200' : 'border-[var(--border)] bg-white'}`
const timeAt = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`
const TIMELINE = SPA_SCHEDULE.map((s, i) => ({ ...s, from: SPA_SCHEDULE.slice(0, i).reduce((t, x) => t + x.min, 0) }))

export default function SpaParty() {
  const [kids, setKids] = useState(10), [color, setColor] = useState(true), [print, setPrint] = useState(null)
  const [open, setOpen] = useState('mask'), [age, setAge] = useState('young')
  const { rows, total } = shoppingList(kids)

  return <div className="mx-auto max-w-5xl px-4 py-8">
    <SEO title="מסיבת ספא ליום הולדת בבית — עמדות, לו״ז, רשימת קניות והזמנה להדפסה" description="איך עושים מסיבת ספא ליום הולדת בבית לגילאי 6–12: חמש עמדות (מסכת פנים מיוגורט, ציפורניים, צמות, בר שתייה ופילינג סוכר), לוח זמנים לשעתיים, רשימת קניות לפי מספר הילדים, בטיחות, והזמנה, שלטים ותעודה להדפסה בחינם." path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'יום הולדת', href: '/birthday' }, { label: 'מסיבת ספא' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🧖 מסיבת ספא ליום הולדת בבית</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">חמש עמדות פינוק שמכינים מדברים שיש במטבח, לוח זמנים לשעתיים, רשימת קניות שמחושבת לפי מספר הילדים — והזמנה, שלטים ותעודות להדפסה. לגילאי 6–12.</p>

    <nav className="mb-8 flex flex-wrap justify-center gap-2 text-lg" aria-label="בעמוד הזה">
      {[['#stations', '🧴 העמדות'], ['#schedule', '⏱️ לוח זמנים'], ['#shopping', '🛒 רשימת קניות'], ['#safety', '🦺 בטיחות'], ['#print', '🖨️ להדפסה']].map(([h, l]) => <a key={h} href={h} className="min-h-[44px] rounded-full border-2 border-[var(--border)] bg-white px-4 py-2 font-bold">{l}</a>)}
    </nav>

    <section id="stations" className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-white p-5 sketch-shadow-sm" aria-labelledby="st-h">
      <h2 id="st-h" className="mb-3 text-2xl font-bold">🧴 חמש עמדות הספא</h2>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="גיל החוגגים">
        <button type="button" aria-pressed={age === 'young'} onClick={() => setAge('young')} className={chip(age === 'young')}>🎈 גילאי 6–8</button>
        <button type="button" aria-pressed={age === 'older'} onClick={() => setAge('older')} className={chip(age === 'older')}>✨ גילאי 9–12</button>
      </div>
      <div className="space-y-3">
        {SPA_STATIONS.map((s, i) => {
          const isOpen = open === s.id
          return <div key={s.id} className="rounded-2xl border-2 border-[var(--border)]">
            <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : s.id)} className="flex min-h-[52px] w-full items-center justify-between gap-3 px-4 text-right text-xl font-bold">
              <span>{s.emoji} עמדה {i + 1}: {s.name}</span><span aria-hidden="true">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <div className="grid gap-4 border-t-2 border-dashed border-[var(--border)] p-4 sm:grid-cols-[1fr_2fr]">
              <div>
                <h3 className="mb-1 font-bold">מה צריך</h3>
                <ul className="list-disc space-y-1 pr-5">{s.materials.map(m => <li key={m}>{m}</li>)}</ul>
              </div>
              <div>
                <h3 className="mb-1 font-bold">איך עושים</h3>
                <ol className="list-decimal space-y-1 pr-5">{s.steps.map(t => <li key={t}>{t}</li>)}</ol>
                <p className="mt-3 rounded-xl bg-[var(--postit)] p-3">💡 {age === 'young' ? s.young : s.older}</p>
                <p className="mt-2 rounded-xl bg-rose-50 p-3">🦺 {s.safety}</p>
              </div>
            </div>}
          </div>
        })}
      </div>
    </section>

    <section id="schedule" className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-pink-50 p-5" aria-labelledby="sc-h">
      <h2 id="sc-h" className="mb-3 text-2xl font-bold">⏱️ לוח זמנים לשעתיים</h2>
      <ol className="space-y-2">
        {TIMELINE.map(s => <li key={s.id} className="flex gap-3 rounded-xl bg-white p-3">
          <span className="shrink-0 font-mono font-bold" dir="ltr">{timeAt(s.from)}–{timeAt(s.from + s.min)}</span>
          <span><b>{s.title}.</b> {s.text}</span>
        </li>)}
      </ol>
      <p className="mt-3 text-[var(--muted-foreground)]">הזמנים מתחילים מ־0:00 — אם המסיבה מתחילה ב־16:00, העוגה תהיה בערך ב־17:15.</p>
    </section>

    <section id="shopping" className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-white p-5" aria-labelledby="sh-h">
      <h2 id="sh-h" className="mb-3 text-2xl font-bold">🛒 רשימת קניות לפי מספר הילדים</h2>
      <label className="mb-4 flex flex-wrap items-center gap-3 text-lg font-bold">
        <span>כמה ילדים מגיעים (כולל החוגגים)?</span>
        <input type="range" min="4" max="20" value={kids} onChange={e => setKids(Number(e.target.value))} className="w-48" aria-describedby="kids-n" />
        <span id="kids-n" className="min-w-[3ch] rounded-lg bg-pink-100 px-2 text-center text-2xl" aria-live="polite">{kids}</span>
      </label>
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead><tr className="border-b-2 border-[var(--border)]"><th className="p-2">מה</th><th className="p-2">כמה</th><th className="p-2">בערך</th></tr></thead>
          <tbody>{rows.map(r => <tr key={r.id} className="border-b border-[var(--border)]">
            <td className="p-2">{r.name}</td><td className="p-2">{r.qty}</td><td className="p-2">{r.home ? 'יש בבית' : `${r.cost} ₪`}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <p className="mt-3 text-xl font-bold">סך הכול בערך {total} ₪ — כ־{Math.round(total / kids)} ₪ לילד, בלי העוגה.</p>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">המחירים הם הערכה גסה. המסרק, הסרט והצנצנת נשארים אצל הילדים, כך שלא צריך שקית הפתעה נוספת.</p>
    </section>

    <section id="safety" className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-white p-5" aria-labelledby="sa-h">
      <h2 id="sa-h" className="mb-3 text-2xl font-bold">🦺 בטיחות והיגיינה</h2>
      <ul className="list-disc space-y-2 pr-6 text-lg">{SAFETY.map(s => <li key={s}>{s}</li>)}</ul>
    </section>

    <section id="print" className="mb-8" aria-labelledby="pr-h">
      <h2 id="pr-h" className="mb-2 text-center text-2xl font-bold">🖨️ הזמנה, שלטים ותעודות להדפסה</h2>
      <div className="mb-4 flex flex-wrap justify-center gap-2" role="group" aria-label="גרסה">
        <button type="button" aria-pressed={color} onClick={() => setColor(true)} className={chip(color)}>🎨 צבעונית</button>
        <button type="button" aria-pressed={!color} onClick={() => setColor(false)} className={chip(!color)}>🖍️ לצביעה</button>
        <button data-print-main type="button" onClick={() => setPrint({ color, pages: PAGES })} className="min-h-[44px] rounded-full bg-pink-600 px-5 font-bold text-white">🖨️ הדפסת שלושת הדפים</button>
      </div>
      <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
        {PAGES.map(p => <button key={p.id} type="button" onClick={() => setPrint({ color, pages: [p] })} aria-label={`הדפסה: ${p.name}`}
          className="mx-auto w-full max-w-sm rounded-2xl border-2 border-[var(--border)] bg-white p-2 text-center sketch-shadow-sm transition-transform hover:-translate-y-1">
          <div className="aspect-[600/820]"><p.C color={color} /></div>
          <p className="mt-1 font-bold">{p.name}</p>
        </button>)}
      </div>
    </section>

    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-amber-50 p-5">
      <h2 className="mb-3 text-2xl font-bold">💡 טיפים שעושים את המסיבה</h2>
      <ul className="list-disc space-y-2 pr-6 text-lg">
        <li>מוזיקה רגועה, אור רך ומגבות מגולגלות על סל — ככה זה מרגיש כמו ספא אמיתי, גם בסלון.</li>
        <li>הורה או אח גדול בכל עמדה. ספא עם 10 ילדים ומבוגר אחד הופך מהר לבלגן.</li>
        <li>מסיבת ספא מתאימה לכל ילד שאוהב פינוק — לא רק לבנות. הזמינו את כל מי שהחוגגים רוצים.</li>
        <li>שמים ניילון או סדין ישן על השולחן בעמדת הציפורניים — הלק לא יורד מבד.</li>
        <li>מכינים את המסכה ואת קנקן המים מראש, ושומרים במקרר עד שמתחילים.</li>
      </ul>
    </section>

    <p className="mt-8 text-center text-lg">עוד ליום ההולדת: <Link className="font-bold underline" to="/birthday/party-bags">שקיות הפתעה</Link> · <Link className="font-bold underline" to="/games/birthday">משחקים ליום הולדת</Link> · <Link className="font-bold underline" to="/rsvp">אישור הגעה אונליין</Link> · <Link className="font-bold underline" to="/cakes">עוגות יום הולדת</Link> · <Link className="font-bold underline" to="/printables/birthday-checklist">צ׳ק־ליסט למסיבה</Link></p>

    {print && <PrintPreview title="מסיבת ספא — דפים להדפסה" onClose={() => setPrint(null)}>
      {print.pages.map(p => <article className="buga-a4" key={p.id}><div className="print-art"><p.C color={print.color} /></div></article>)}
    </PrintPreview>}

    <div className="mt-10"><SeoBody paragraphs={[
      'מסיבת ספא ליום הולדת היא אחת המסיבות הכי מבוקשות לגילאי 6–12, והיא לא דורשת מפעילה או ציוד יקר. מספיק לחלק את הבית לכמה עמדות, להכין מסכת פנים מיוגורט ושיבולת שועל, לק לילדים שמתקלף, סרטים לשיער ובר שתייה עם פירות — והילדים כבר מרגישים בספא.',
      'בעמוד הזה יש חמש עמדות עם רשימת ציוד, שלבי עבודה וטיפ לפי גיל, לוח זמנים מלא לשעתיים כולל עוגה, ומחשבון שמכין רשימת קניות ועלות משוערת לפי מספר הילדים. יש גם כללי בטיחות והיגיינה — אלרגיות, מסרק אישי לכל ילד ובלי כלים חמים — ושלושה דפים להדפסה: הזמנה למילוי, שלטים לעמדות ותעודת "מומחיות ספא", בצבע או לצביעה.',
    ]} faq={FAQ} related={[{ label: 'יום הולדת לילדים', href: '/birthday' }, { label: 'שקיות הפתעה', href: '/birthday/party-bags' }, { label: 'רעיונות ליום הולדת', href: '/ideas' }]} /></div>
  </div>
}
