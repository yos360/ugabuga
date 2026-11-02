// /tools/calculator — free Hebrew scientific calculator for school, with simple extra tabs.
// The main calculator loads with the page; the other tabs are separate chunks (fetched when idle).
import { Suspense, lazy, useEffect, useState } from 'react'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Calculator from './Calculator'
import './calc.css'

const loaders = {
  fractions: () => import('./tabs/FractionsTab'),
  solver: () => import('./tabs/SolverTab'),
  percent: () => import('./tabs/PercentTab'),
  stats: () => import('./tabs/StatsTab'),
  units: () => import('./tabs/UnitsTab'),
  graph: () => import('./tabs/GraphTab'),
}
const LAZY = Object.fromEntries(Object.entries(loaders).map(([k, f]) => [k, lazy(f)]))

const TABS = [
  { id: 'calc', icon: '🧮', label: 'מחשבון' },
  { id: 'fractions', icon: '½', label: 'שברים' },
  { id: 'solver', icon: 'x=', label: 'משוואות' },
  { id: 'graph', icon: '📈', label: 'גרפים' },
  { id: 'stats', icon: '📊', label: 'סטטיסטיקה' },
  { id: 'percent', icon: '%', label: 'אחוזים' },
  { id: 'units', icon: '📏', label: 'המרות' },
]

const FAQ = [
  { q: 'איך עוברים בין מעלות לרדיאנים?', a: 'לוחצים על המתג DEG/RAD בראש המחשבון. כברירת מחדל המחשבון במעלות, כמו שלומדים בבית הספר, ולכן sin(30) = 0.5. ברדיאנים sin(π÷6) נותן את אותה תוצאה.' },
  { q: 'למה התוצאה מוצגת כשבר או עם שורש?', a: 'כשהתוצאה היא שבר פשוט, שורש או כפולה של π, המחשבון מציג אותה בצורה מדויקת, למשל ¾ או 2√2, ומתחתיה את הערך העשרוני. לחיצה על S⇔D מחליפה ביניהם, ו־a b/c מציג שבר מעורב.' },
  { q: 'באיזה סדר המחשבון מחשב?', a: 'לפי סדר פעולות החשבון: סוגריים, חזקות ושורשים, כפל וחילוק משמאל לימין, ובסוף חיבור וחיסור. כפל מקוצר כמו 2π נקשר חזק יותר מחילוק, ולכן 1÷2π הוא 1 חלקי 2π. הכפתור „איך הגענו לזה?” מראה כל שלב.' },
  { q: 'מה עושים כשמופיעה הודעת שגיאה?', a: 'ההודעה כתובה בעברית ומסמנת באדום את המקום הבעייתי בתרגיל, למשל „חלוקה באפס” או „שורש של מספר שלילי”. מזיזים את הסמן בעזרת החצים או בלחיצה על התרגיל ומתקנים בלי להקליד הכול מחדש.' },
  { q: 'איך פותרים משוואה ריבועית?', a: 'בלשונית „משוואות” בוחרים ax² + bx + c = 0 ומזינים את המקדמים. מקבלים את הדיסקרימיננטה, את שני הפתרונות בצורה מדויקת ובעשרוני, את קודקוד הפרבולה ואפשרות לראות אותה בגרף.' },
  { q: 'ההיסטוריה והזיכרון נשמרים?', a: 'כן, בדפדפן שלכם בלבד. אחרי שהדף נטען המחשבון עובד גם בלי אינטרנט, בלי פרסומות ובלי הרשמה.' },
]

function readHash() {
  if (typeof window === 'undefined') return 'calc'
  const h = window.location.hash.replace('#', '')
  return TABS.some(t => t.id === h) ? h : 'calc'
}

export default function ScientificCalculator() {
  const [tab, setTab] = useState('calc')
  const [graphSeed, setGraphSeed] = useState(null)

  useEffect(() => {
    setTab(readHash())
    const onHash = () => setTab(readHash())
    window.addEventListener('hashchange', onHash)
    // fetch the other tabs in the background so they open instantly (and offline)
    const idle = window.requestIdleCallback || (f => setTimeout(f, 2500))
    const id = idle(() => Object.values(loaders).forEach(f => f().catch(() => {})))
    return () => { window.removeEventListener('hashchange', onHash); (window.cancelIdleCallback || clearTimeout)(id) }
  }, [])

  const choose = id => {
    setTab(id)
    try { history.replaceState(null, '', id === 'calc' ? window.location.pathname + window.location.search : `#${id}`) } catch { /* ignore */ }
  }
  const openGraph = expr => { setGraphSeed({ expr, at: Date.now() }); choose('graph') }
  const Tab = tab !== 'calc' ? LAZY[tab] : null

  return <div className="mx-auto max-w-6xl px-4 py-8 sc-page" dir="rtl">
    <SEO title="מחשבון מדעי אונליין בעברית — כמו של התיכון, עם שברים ושורשים" description="מחשבון מדעי חינם בעברית: sin, cos, tan, לוגריתמים, חזקות ושורשים, תוצאה כשבר מדויק, הסבר שלב אחר שלב, פתרון משוואות, גרפים וסטטיסטיקה. בלי פרסומות." path="/tools/calculator" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'מחשבון מדעי' }]} />
    <h1 className="text-3xl sm:text-4xl text-center mb-2">מחשבון מדעי</h1>
    <p className="text-center mb-5">כמו המחשבון של בית הספר, רק ברור יותר: רואים את התרגיל כמו במחברת, מקבלים תשובה מדויקת ועשרונית, ואפשר לבקש הסבר.</p>

    <nav className="sc-tabs" role="tablist" aria-label="מצבי המחשבון">
      {TABS.map(t => <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className="sc-tab" onClick={() => choose(t.id)} onMouseEnter={() => loaders[t.id]?.()} onFocus={() => loaders[t.id]?.()}>
        <span className="sc-tab-icon" aria-hidden="true">{t.icon}</span><span>{t.label}</span>
      </button>)}
    </nav>

    <div role="tabpanel" aria-label={TABS.find(t => t.id === tab)?.label}>
      <div hidden={tab !== 'calc'}><Calculator active={tab === 'calc'} /></div>
      {Tab && <Suspense fallback={<p className="sc-loading">טוען…</p>}><Tab openGraph={openGraph} seed={tab === 'graph' ? graphSeed : null} /></Suspense>}
    </div>

    <div className="mt-10 no-present"><h2 className="text-2xl mb-4">מחשבון מדעי לתלמידים — מה יש כאן?</h2>
      <SeoBody paragraphs={[
        'המחשבון בנוי כמו מחשבון מדעי של תיכון: ארבע פעולות החשבון, סוגריים, חזקות ושורשים, סינוס, קוסינוס וטנגנס והפונקציות ההפוכות, לוגריתם עשרוני וטבעי, עצרת, תמורות וצירופים, ערך מוחלט, אחוזים וזיכרון. ההבדל הוא שהתרגיל מופיע כמו שכותבים אותו במחברת, עם שבר אמיתי ושורש עם קו מעליו, ואפשר לחזור לכל מקום בתרגיל ולתקן.',
        'דוגמה: מקלידים sin(60). המחשבון מציג √3/2 ומתחתיו 0.8660254038. דוגמה נוספת: 0.1 + 0.2 נותן בדיוק 0.3, בלי השאריות המוזרות שיש בחלק מהמחשבונים באינטרנט. ובתרגיל 2 + 3 × 4 הכפתור „איך הגענו לזה?” מראה שקודם כופלים ורק אחר כך מחברים.',
        'בלשוניות הנוספות יש כלים שבמחשבון רגיל מסתתרים בתפריטים: חישוב עם שברים ומספרים מעורבים, פתרון משוואה ממעלה ראשונה ושנייה ומערכת של שתי משוואות, שרטוט גרפים עם נקודות חיתוך, ממוצע, חציון וסטיית תקן של רשימת מספרים, ממיר יחידות ואחוזים.',
      ]} faq={FAQ} related={[{ href: '/tools/percent-calculator', label: 'מחשבון אחוזים' }, { href: '/math', label: 'תרגול חשבון לפי כיתה' }, { href: '/tools', label: 'כל הכלים' }]} />
    </div>
  </div>
}
