import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import { FONT } from '../../components/holidays/printKit'
import { BAG_AGES, BAG_BUDGETS, itemsFor, sampleBag } from '../../data/partyBags'

// /birthday/party-bags: what to put in birthday party bags by age and budget, a sample bag the
// page assembles from the filters, home-made and plastic-free ideas, safety notes for little ones,
// and two A4 sheets of bag labels (thank-you tags and big bag fronts) in colour or for colouring.
const PATH = '/birthday/party-bags'

const T = ({ x, y, size = 16, weight = 700, fill = '#111', children }) => <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontSize={size} fontWeight={weight} fill={fill} direction="rtl">{children}</text>

function Balloon({ x, y, r = 22, fill }) {
  return <g>
    <path d={`M${x} ${y + r * 1.2} q${-r * 0.3} ${r * 0.6} 0 ${r * 1.2} q${r * 0.3} ${r * 0.5} 0 ${r}`} fill="none" stroke="#111" strokeWidth="1.5" />
    <ellipse cx={x} cy={y} rx={r} ry={r * 1.2} fill={fill} stroke="#111" strokeWidth="2.5" />
    <path d={`M${x - 5} ${y + r * 1.2 + 6} L${x} ${y + r * 1.2} L${x + 5} ${y + r * 1.2 + 6} Z`} fill={fill} stroke="#111" strokeWidth="2" strokeLinejoin="round" />
    <path d={`M${x - r * 0.45} ${y - r * 0.5} q${r * 0.15} ${-r * 0.3} ${r * 0.4} ${-r * 0.35}`} fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
  </g>
}

function Gift({ x, y, w = 60, fill, ribbon }) {
  const h = w * 0.75
  return <g strokeLinejoin="round">
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx="4" fill={fill} stroke="#111" strokeWidth="2.5" />
    <rect x={x - w / 2 - 4} y={y - h / 2 - 12} width={w + 8} height="14" rx="3" fill={fill} stroke="#111" strokeWidth="2.5" />
    <rect x={x - 5} y={y - h / 2 - 12} width="10" height={h + 12} fill={ribbon} stroke="#111" strokeWidth="2" />
    <path d={`M${x} ${y - h / 2 - 12} c-18 -18 -26 -2 -10 2 M${x} ${y - h / 2 - 12} c18 -18 26 -2 10 2`} fill="none" stroke="#111" strokeWidth="2.5" />
  </g>
}

const PALETTE = ['#fecaca', '#bfdbfe', '#fde68a', '#bbf7d0', '#e9d5ff', '#fed7aa']

// Twelve small tags (3 × 4) to tie to the bags or stick on them.
function TagsPage({ color }) {
  return <svg viewBox="0 0 600 820" role="img" aria-label="תוויות תודה לשקיות הפתעה" style={{ width: '100%', height: '100%', background: 'white' }}>
    <T x={300} y={40} size={24} weight={800}>תוויות לשקיות ההפתעה — גוזרים ומדביקים</T>
    {Array.from({ length: 12 }, (_, i) => {
      const col = i % 3, row = Math.floor(i / 3), x = 400 - col * 190, y = 62 + row * 188
      const fill = color ? PALETTE[i % PALETTE.length] : 'white'
      return <g key={i}>
        <rect x={x} y={y} width="180" height="176" rx="14" fill="white" stroke="#111" strokeWidth="2" strokeDasharray="7 5" />
        <circle cx={x + 90} cy={y + 16} r="5" fill="white" stroke="#111" strokeWidth="2" />
        {i % 2 ? <Gift x={x + 90} y={y + 58} w={52} fill={fill} ribbon={color ? '#f87171' : 'white'} /> : <><Balloon x={x + 72} y={y + 46} r={16} fill={fill} /><Balloon x={x + 108} y={y + 50} r={16} fill={color ? PALETTE[(i + 2) % PALETTE.length] : 'white'} /></>}
        <T x={x + 90} y={y + 116} size={21} weight={900}>תודה שבאת!</T>
        <T x={x + 90} y={y + 142} size={13} weight={400}>ל: ______________</T>
        <T x={x + 90} y={y + 164} size={13} weight={400}>מ: ______________</T>
      </g>
    })}
  </svg>
}

// Four big labels for the front of the bag, with room for the guest's name.
function FrontsPage({ color }) {
  return <svg viewBox="0 0 600 820" role="img" aria-label="מדבקות גדולות לחזית שקית ההפתעה" style={{ width: '100%', height: '100%', background: 'white' }}>
    <T x={300} y={40} size={24} weight={800}>מדבקות לשקית — כותבים את השם של כל ילד</T>
    {Array.from({ length: 4 }, (_, i) => {
      const col = i % 2, row = Math.floor(i / 2), x = 305 - col * 285, y = 64 + row * 375
      const fill = color ? PALETTE[(i * 2) % PALETTE.length] : 'white'
      return <g key={i}>
        <rect x={x} y={y} width="275" height="360" rx="20" fill={color ? '#fffbeb' : 'white'} stroke="#111" strokeWidth="2" strokeDasharray="8 6" />
        <rect x={x + 14} y={y + 14} width="247" height="332" rx="14" fill="none" stroke="#111" strokeWidth="2.5" />
        <Balloon x={x + 70} y={y + 70} r={24} fill={fill} />
        <Balloon x={x + 205} y={y + 74} r={24} fill={color ? PALETTE[(i * 2 + 3) % PALETTE.length] : 'white'} />
        <Gift x={x + 137} y={y + 92} w={70} fill={color ? '#c7d2fe' : 'white'} ribbon={color ? '#f87171' : 'white'} />
        <T x={x + 137} y={y + 186} size={30} weight={900}>שקית הפתעה</T>
        <T x={x + 137} y={y + 218} size={18} weight={700}>של</T>
        <path d={`M${x + 40} ${y + 262} H${x + 235}`} stroke="#111" strokeWidth="2" />
        <T x={x + 137} y={y + 306} size={15} weight={400}>תודה שחגגת איתנו! 🎂</T>
      </g>
    })}
  </svg>
}

const PAGES = [
  { id: 'tags', name: 'דף 1: 12 תוויות "תודה שבאת"', C: TagsPage },
  { id: 'fronts', name: 'דף 2: 4 מדבקות גדולות עם שם', C: FrontsPage },
]

const HOME_MADE = [
  ['🍪', 'עוגיות בצורת המספר של הגיל', 'אופים יום לפני, עוטפים כל עוגייה בשקית שקופה וסוגרים בסרט. מצרפים פתק עם הרכיבים.'],
  ['🟣', 'בצק משחק בקופסה', 'כוס קמח, חצי כוס מלח, כף שמן ומים עד שהבצק נעים — וכמה טיפות צבע מאכל. מחלקים לקופסאות קטנות.'],
  ['🌱', 'ערכת "מגדלים שעועית"', 'כוס קרטון, צמר גפן ושלוש שעועיות בשקית קטנה, עם פתק: מרטיבים, מניחים ליד החלון ומחכים.'],
  ['📚', 'חוברת פעילות אישית', 'מדפיסים מהאתר דפי צביעה, מבוכים ותפזורת בנושא המסיבה, ומהדקים לחוברת עם השם של הילד על הכריכה.'],
  ['🖼️', 'מסגרת לתמונה מהמסיבה', 'מכינים מסגרות מקרטון במסיבה עצמה, ולמחרת מדפיסים תמונה של כל ילד ושולחים לגן או לכיתה.'],
]

const SAFETY = [
  'מתחת לגיל 3: בלי חלקים קטנים — כל מה שנכנס לגליל של נייר טואלט מסוכן לבליעה. גם לא מדבקות קטנות, חרוזים או צעצועים שמתפרקים.',
  'בלי סוללות כפתור ובלי מגנטים קטנים, באף גיל. אם בולעים אותם — זה מצב חירום.',
  'בלי בלונים לא מנופחים ובלי שאריות של בלון שהתפוצץ — זו סכנת חנק גם לילדים גדולים יותר.',
  'בלי סוכריות קשות, אגוזים שלמים, פופקורן ומסטיק לקטנים.',
  'שואלים את ההורים מראש על אלרגיות, ומדביקים על כל מה שאכיל פתק עם הרכיבים.',
]

const FAQ = [
  { q: 'מה לשים בשקית הפתעה ליום הולדת?', a: 'דבר אחד או שניים שימושיים שמתאימים לגיל, ועוד משהו קטן ואישי. לגן: צבעים עבים, בצק משחק או בועות סבון וכתר שהכינו במסיבה. לכיתות א–ג: עיפרון מעוצב, מחברת קטנה, גירים או זרעים לגידול. לכיתות ד–ו: ספר דק, משחק קלפים, חבל קפיצה או ערכת חרוזים. שקית קטנה ושימושית עדיפה על הרבה צעצועים שנשברים.' },
  { q: 'כמה כסף להשקיע בשקית הפתעה?', a: 'אין סכום מחייב. 10–20 ₪ לשקית זה מספיק כדי שתהיה שווה, ואפשר גם פחות עם דברים שמכינים בבית. כדאי שכל השקיות יהיו זהות, כדי שלא יהיו השוואות בין הילדים.' },
  { q: 'מה לשים בשקית הפתעה לגיל שנתיים או שלוש?', a: 'דברים גדולים ובטוחים: ספר קרטון, צבעי שעווה עבים, כדור רך וגדול, דלי וכף לארגז החול. בלי חלקים קטנים, בלי סוכריות קשות ובלי בלונים לא מנופחים.' },
  { q: 'אפשר שקית הפתעה בלי ממתקים ובלי פלסטיק?', a: 'כן, וזה גם עובד טוב. בעמוד יש מסנן "בלי פלסטיק ובלי ממתקים": חוברת צביעה מודפסת, צבעים, מחברת, זרעים לגידול, בצק משחק ביתי ותמונה מהמסיבה במסגרת.' },
  { q: 'חייבים לתת שקיות הפתעה?', a: 'לא. זו תוספת, לא חובה. אפשר במקומן לתת לכל ילד לקחת הביתה את היצירה שהכין במסיבה או את הכתר שצבע.' },
]

const chip = on => `min-h-[44px] rounded-full border-2 px-4 font-bold ${on ? 'border-slate-800 bg-rose-200' : 'border-[var(--border)] bg-white'}`
const priceLabel = p => (p === 0 ? 'חינם' : `כ־${p} ₪`)

export default function PartyBags() {
  const [age, setAge] = useState('gan'), [budget, setBudget] = useState('mid'), [clean, setClean] = useState(false)
  const [color, setColor] = useState(true), [print, setPrint] = useState(null)
  const max = BAG_BUDGETS.find(b => b.id === budget).max
  const ageLabel = BAG_AGES.find(a => a.id === age).label
  const ideas = itemsFor(age, { budgetMax: max, clean })
  const bag = sampleBag(age, max, clean)

  return <div className="mx-auto max-w-5xl px-4 py-8">
    <SEO title="שקיות הפתעה ליום הולדת — מה לשים לפי גיל ותקציב + תוויות להדפסה" description="מה לשים בשקיות הפתעה ליום הולדת לילדים: רעיונות לפי גיל (2–3, גן, כיתות א–ג, ד–ו) ולפי תקציב, שקית לדוגמה, שקית בלי פלסטיק וממתקים, רעיונות להכנה בבית, בטיחות לקטנים ותוויות להדפסה בחינם." path={PATH} structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'יום הולדת', href: '/birthday' }, { label: 'שקיות הפתעה' }]} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">🎁 שקיות הפתעה ליום הולדת</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">מה לשים בשקית לפי הגיל והתקציב, שקית לדוגמה שמתאימה לכם, רעיונות להכנה בבית — ותוויות "תודה שבאת" להדפסה.</p>

    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-white p-5 sketch-shadow-sm" aria-labelledby="pick-h">
      <h2 id="pick-h" className="mb-3 text-2xl font-bold">🔎 בוחרים גיל ותקציב</h2>
      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="גיל הילדים">
        {BAG_AGES.map(a => <button key={a.id} type="button" aria-pressed={age === a.id} onClick={() => setAge(a.id)} className={chip(age === a.id)}>{a.emoji} {a.label}</button>)}
      </div>
      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="תקציב לשקית">
        {BAG_BUDGETS.map(b => <button key={b.id} type="button" aria-pressed={budget === b.id} onClick={() => setBudget(b.id)} className={chip(budget === b.id)}>{b.label} לשקית</button>)}
      </div>
      <label className="mb-5 inline-flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border-2 border-[var(--border)] px-3">
        <input type="checkbox" className="h-5 w-5" checked={clean} onChange={e => setClean(e.target.checked)} />
        <span className="font-bold">🌿 בלי פלסטיק ובלי ממתקים</span>
      </label>

      <div className="mb-5 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-4" aria-live="polite">
        <h3 className="mb-2 text-xl font-bold">🛍️ שקית לדוגמה — {ageLabel}, {BAG_BUDGETS.find(b => b.id === budget).label}</h3>
        <ul className="mb-2 space-y-1 text-lg">
          {bag.items.map(i => <li key={i.id}>{i.emoji} {i.name} <span className="text-[var(--muted-foreground)]">({priceLabel(i.price)})</span></li>)}
        </ul>
        <p className="font-bold">בערך {bag.total} ₪ לשקית</p>
      </div>

      <h3 className="mb-2 text-xl font-bold">כל הרעיונות שמתאימים ({ideas.length})</h3>
      <ul className="grid gap-2 sm:grid-cols-2">
        {ideas.map(i => <li key={i.id} className="rounded-xl border-2 border-[var(--border)] p-3">
          <p className="font-bold">{i.emoji} {i.to ? <Link className="underline" to={i.to}>{i.name}</Link> : i.name} <span className="font-normal text-[var(--muted-foreground)]">· {priceLabel(i.price)}</span></p>
          {i.note && <p className="mt-1 text-[var(--muted-foreground)]">{i.note}</p>}
        </li>)}
      </ul>
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">המחירים הם הערכה גסה לפריט אחד, וכל מה שמסומן "חינם" מכינים במסיבה או מדפיסים בבית.</p>
    </section>

    <section className="mb-8" aria-labelledby="print-h">
      <h2 id="print-h" className="mb-2 text-center text-2xl font-bold">🖨️ תוויות לשקיות להדפסה</h2>
      <div className="mb-4 flex flex-wrap justify-center gap-2" role="group" aria-label="גרסה">
        <button type="button" aria-pressed={color} onClick={() => setColor(true)} className={chip(color)}>🎨 צבעונית</button>
        <button type="button" aria-pressed={!color} onClick={() => setColor(false)} className={chip(!color)}>🖍️ לצביעה</button>
        <button data-print-main type="button" onClick={() => setPrint({ color, pages: PAGES })} className="min-h-[44px] rounded-full bg-rose-600 px-5 font-bold text-white">🖨️ הדפסת שני הדפים</button>
      </div>
      <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
        {PAGES.map(p => <button key={p.id} type="button" onClick={() => setPrint({ color, pages: [p] })} aria-label={`הדפסה: ${p.name}`}
          className="mx-auto w-full max-w-sm rounded-2xl border-2 border-[var(--border)] bg-white p-2 text-center sketch-shadow-sm transition-transform hover:-translate-y-1">
          <div className="aspect-[600/820]"><p.C color={color} /></div>
          <p className="mt-1 font-bold">{p.name}</p>
        </button>)}
      </div>
    </section>

    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-amber-50 p-5">
      <h2 className="mb-3 text-2xl font-bold">🏠 שקית שמכינים בבית</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {HOME_MADE.map(([e, t, d]) => <li key={t} className="rounded-xl bg-white p-3"><p className="text-lg font-bold">{e} {t}</p><p>{d}</p></li>)}
      </ul>
    </section>

    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-white p-5">
      <h2 className="mb-3 text-2xl font-bold">🦺 בטיחות — במיוחד לקטנים</h2>
      <ul className="list-disc space-y-2 pr-6 text-lg">{SAFETY.map(s => <li key={s}>{s}</li>)}</ul>
    </section>

    <section className="mb-8 rounded-3xl border-2 border-[var(--border)] bg-white p-5">
      <h2 className="mb-3 text-2xl font-bold">💡 טיפים קטנים שעושים הבדל</h2>
      <ul className="list-disc space-y-2 pr-6 text-lg">
        <li>כל השקיות זהות — בלי "לבנים" ו"לבנות" ובלי השוואות.</li>
        <li>מכינים שתיים־שלוש שקיות רזרבה לאח קטן שהגיע או לאורח שלא אישר הגעה.</li>
        <li>מחלקים בסוף המסיבה, ליד הדלת — לא באמצע, כדי שהשקיות לא יתפזרו ויתערבבו.</li>
        <li>שם על כל שקית חוסך ויכוחים ובכי, וזה בדיוק מה שהמדבקות למעלה בשבילו.</li>
      </ul>
    </section>

    {print && <PrintPreview title="תוויות לשקיות הפתעה" onClose={() => setPrint(null)}>
      {print.pages.map(p => <article className="buga-a4" key={p.id}><div className="print-art"><p.C color={print.color} /></div></article>)}
    </PrintPreview>}

    <p className="mt-8 text-center text-lg">עוד ליום ההולדת: <Link className="font-bold underline" to="/games/birthday">משחקים ליום הולדת</Link> · <Link className="font-bold underline" to="/printables/birthday-crown">כתר להדפסה</Link> · <Link className="font-bold underline" to="/printables/birthday-checklist">צ׳ק־ליסט למסיבה</Link> · <Link className="font-bold underline" to="/calculator">מחשבון אוכל ושתייה</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'שקיות הפתעה ליום הולדת הן הדבר האחרון שהילדים לוקחים מהמסיבה, ולכן הן נזכרות. אבל שקית טובה היא לא שקית מלאה: דבר אחד או שניים שימושיים שמתאימים לגיל, ועוד משהו אישי קטן, שווים יותר מערימה של צעצועי פלסטיק שנשברים עוד באותו ערב.',
      'בעמוד בוחרים את גיל הילדים — 2–3, גן, כיתות א–ג או כיתות ד–ו — ואת התקציב לשקית, ומקבלים את כל הרעיונות שמתאימים ושקית לדוגמה שנכנסת בתקציב. אפשר לסנן גם לשקית בלי פלסטיק ובלי ממתקים, ולמצוא רעיונות שמכינים בבית. בסוף העמוד יש שני דפים להדפסה: 12 תוויות "תודה שבאת" ו־4 מדבקות גדולות עם מקום לשם של כל ילד, בצבע או לצביעה.',
    ]} faq={FAQ} related={[{ label: 'יום הולדת לילדים', href: '/birthday' }, { label: 'משחקים ליום הולדת', href: '/games/birthday' }, { label: 'מתנות לפי גיל', href: '/gifts' }]} /></div>
  </div>
}
