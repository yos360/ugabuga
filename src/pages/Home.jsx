import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Sparkles, ChevronLeft } from 'lucide-react'
import SEO from '../components/ui/SEO'
import PrintStrip from '../components/ui/PrintStrip'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import { HOME_INTENTS } from '../data/kidsZone'
import { SITE_SLOGAN, CHANNEL_GO } from '../data/brand'
import { SOCIAL_LIVE } from '../data/social'
import { ElectionChip, BringChip } from '../components/home/HomeTopExtras'
import './Home.css'
import './home-v3.css'
import SponsorBanner from '../components/ui/SponsorBanner'
import { RequestTop } from '../components/home/HomeTopVariant'
import DoneRequests from '../components/ui/DoneRequests'
import HomeSpotlight from '../components/home/HomeSpotlight'
import BugaCarRun from '../components/home/BugaCarRun'
import HomeDiscover from '../components/home/HomeDiscover'
import { homeVariant, recordExperiment } from '../utils/experiments'

// Home page: one search (site or BugaPedia), four doors, eight worlds, favourites, news.
// Each destination appears once. The blog list loads after the first paint.
const SeasonColoring = lazy(() => import('../components/home/SeasonColoring'))
// Road safety week (1–6.11): an animated banner at the top, rendered only until the week ends.
const RoadWeekBanner = lazy(() => import('../components/roadsafety/RoadWeekBanner'))
// The daily family game (time tunnel, or the daily quiz on days without one) sits below the fold —
// keep its code and the month's question data out of the home page's first load.
const TodayQuiz = lazy(() => import('../components/home/TodayQuiz'))
const TodayGame = lazy(() => import('../components/home/TodayGame'))
const SiteSearchBox = lazy(() => import('../components/ui/SiteSearchBox'))

// Mounts children once the section scrolls near the viewport (immediately
// during prerender, so the static snapshots still contain the content).
function NearViewport({ children, minHeight = 320 }) {
  const ref = useRef(null)
  const [show, setShow] = useState(() => typeof window !== 'undefined' && !!window.__PRERENDER__)
  useEffect(() => {
    if (show || !ref.current) return
    if (!('IntersectionObserver' in window)) { setShow(true); return }
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { setShow(true); io.disconnect() }
    }, { rootMargin: '600px 0px' })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [show])
  return <div ref={ref} style={show ? undefined : { minHeight }}>{show && <Suspense fallback={null}>{children}</Suspense>}</div>
}

const homeFaq = [
  { q: 'האתר באמת חינמי לגמרי, בלי תשלום נסתר?', a: 'כן, כל המשחקים, הכלים וההדפסות באתר זמינים לשימוש חינמי ללא הרשמה.' },
  { q: 'מתאים גם למורות ולא רק להורים?', a: 'בהחלט — יש מתחם ייעודי לכיתה עם כלים, משחקים ותכנים שנבנו במיוחד לשימוש בבית ספר.' },
]
const homeBody = [
  'עוגה בוגה הוא אתר משחקים והדפסות חינמי לילדים, למשפחות ולמורות — בלי הרשמה, בלי תשלום, ובלי "גרסת ניסיון" חלקית. המטרה פשוטה: לתת פתרון מהיר ואמיתי לרגע שבו צריך משחק, פעילות, או הדפסה בשביל ילדים, בין אם זו מסיבת יום הולדת מחר, יום גשום היום, או שיעור שצריך למלא בעוד עשר דקות.',
  <>מה יש כאן? <Link to="/games" className="underline font-bold">משחקים לילדים</Link> לשחק יחד, מסוננים לפי גיל, זמן, ציוד ומספר משתתפים; <Link to="/online-games" className="underline font-bold">משחקי אונליין</Link> וחשיבה על כל המסך; <Link to="/printables/coloring" className="underline font-bold">דפי צביעה</Link> ו<Link to="/printables" className="underline font-bold">דפים להדפסה</Link> — מבוכים, דפי עבודה ותעודות; כלים כמו <Link to="/tools/random-picker" className="underline font-bold">גלגל מזל</Link>, בינגו היכרות, ציד אוצרות וחדרי בריחה; ועולם רעיונות לתכנון מסיבות ואירועים שלמים.</>,
  'בין אם מגיעים כהורה שמחפש פתרון מהיר לחצי שעה פנויה, כמורה שרוצה כלי לכיתה, או כמארגן מסיבה שרוצה לתכנן אירוע שלם — כל דבר באתר חינמי לשימוש, זמין מיד, ולא דורש הרשמה כדי להתחיל.',
]
const homeRelated = [ { label: 'כל המשחקים', href: '/games' }, { label: 'רעיונות ליום הולדת', href: '/ideas' }, { label: 'מתחם יוצרים', href: '/create' }, { label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' }, { label: 'דפים להדפסה', href: '/printables' } ]

const WORLDS = [
  ['🕹️', 'משחקים אונליין', '/online-games', 'חשיבה, זיכרון ותגובה', '#fff3cf'],
  ['📚', 'לומדים', '/learn', 'חשבון, קריאה, אנגלית, AI', '#e3f1ff'],
  ['🖨️', 'דפים להדפסה', '/printables', 'צביעה, דפי עבודה, לוחות', '#ffe6ee'],
  ['🕯️', 'שבתות וחגים', '/holidays', 'לוח עברי, פעילויות, ברכות', '#efe9ff'],
  ['✂️', 'יצירה', '/crafts', 'רעיונות מחומרים שיש בבית', '#fff0e3'],
  ['🦁', 'עולם החיות', '/animals', 'עובדות, תמונות וחידון', '#e6f7ec'],
  ['🧰', 'כלים שימושיים', '/tools', 'גלגל מזל, טיימר, נקדן', '#e2f4f7'],
  ['☕', 'פנאי למבוגרים', '/adults', 'תשבצים, מנדלות, זיכרון', '#f4efe6'],
]

// Quick links at the top: the pages visitors open most (real counts, last 30 days — see
// utils/pagePopularity.js), with the season's holiday always in. The order below is the fallback
// for the prerendered page and for when the counts can't load.
const SEASON = ['🕎', 'חנוכה', '/holidays/hanukkah']
const SEASON_ENDS = new Date('2026-12-13T00:00:00+02:00') // the day after the last night of Hanukkah 2026
const QUICK = [
  ['💌', 'אישורי הגעה', '/rsvp'],
  ['📖', 'הבנת הנקרא', '/learn/reading'],
  ['🔤', 'דפי אותיות', '/printables/hebrew-letters'],
  ['🎨', 'דפי צביעה', '/printables/coloring'],
  ['➕', 'חשבון לפי כיתה', '/math'],
  ['🕹️', 'משחקים אונליין', '/online-games'],
  ['🕯️', 'זמני שבת', '/shabbat-times'],
  ['🅰️', 'משחק אותיות', '/letters/game'],
  ['✍️', 'כתב יד', '/letters/cursive'],
  ['👶', 'שמות לתינוקות', '/baby-names'],
  ['✏️', 'דפי עבודה בחשבון', '/printables/math-worksheets'],
  ['📜', 'פרשת השבוע', '/parasha'],
]
const QUICK_SHOWN = 7

// "Most loved": the same real counts decide which of these show and in what order.
const LOVED_POOL = [
  ['🧩', 'חדר בריחה לילדים', '/tools/escape-rooms', 'תעלומה לכל המשפחה'],
  ['🎯', 'טריוויה לפי נושא', '/tools/trivia-quiz', 'בוחרים גיל וקושי'],
  ['🎨', 'צביעה לפי מספרים', '/printables/color-by-number', 'להדפסה ולמסך'],
  ['🔤', 'משחק אותיות', '/letters/game', 'מזהים צליל ומילה'],
  ['🗺️', 'ציד אוצרות מוכן', '/treasure-hunt/ready', 'רמזים מחורזים'],
  ['🪄', 'נקדן אוטומטי', '/tools/nakdan', 'מדביקים ומקבלים ניקוד'],
  ['💌', 'אישורי הגעה בחינם', '/rsvp', 'הזמנה עם קישור לאישור'],
  ['📖', 'הבנת הנקרא', '/learn/reading', 'קטעים ושאלות לפי כיתה'],
  ['🖨️', 'דפי אותיות להדפסה', '/printables/hebrew-letters', 'כתיבה וזיהוי אותיות'],
  ['✍️', 'כתב יד עברי', '/letters/cursive', 'מתרגלים אות אחרי אות'],
  ['📺', 'בוגה לייב', '/live', 'חידון חי לכל הכיתה'],
  ['🎲', 'קוביות סיפור', '/tools/dice/story-dice', 'מגלגלים וממציאים סיפור'],
  ['🧠', 'זיכרון באנגלית', '/printables/memory-english', 'זוגות מילים להדפסה'],
  ['🦉', 'בוגה־פדיה', '/bugapedia', 'שואלים ומקבלים תשובה'],
]
const byVisits = (list, counts) => counts.size ? [...list].sort((a, b) => (counts.get(b[2]) || 0) - (counts.get(a[2]) || 0)) : list

function usePopularity() {
  const [counts, setCounts] = useState(() => new Map())
  useEffect(() => {
    if (window.__PRERENDER__) return
    let alive = true
    const start = () => import('../utils/pagePopularity').then(m => m.loadPagePopularity()).then(c => { if (alive) setCounts(c) }).catch(() => {})
    const id = window.requestIdleCallback ? requestIdleCallback(start, { timeout: 2500 }) : setTimeout(start, 1200)
    return () => { alive = false; if (window.cancelIdleCallback) cancelIdleCallback(id); else clearTimeout(id) }
  }, [])
  return counts
}

// Every visitor sees something a little different: the newest additions always, the rest drawn at random.
function pickFresh(list, keepNewest, total, shuffle) {
  if (!shuffle) return list.slice(0, total)
  const head = list.slice(0, keepNewest), rest = list.slice(keepNewest)
  for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [rest[i], rest[j]] = [rest[j], rest[i]] }
  return [...head, ...rest].slice(0, total)
}

const SocialIcons = () => SOCIAL_LIVE.length > 0 && <div className="hp-social">{SOCIAL_LIVE.map(([id, name, href, d]) =>
  <a key={id} href={href} className={`hp-soc hp-soc-${id}`} target="_blank" rel="noopener noreferrer" aria-label={`עוגה בוגה ב${name}`}>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} fill="currentColor" /></svg>
  </a>)}</div>

// A small evening-only invitation: shown only from 18:00 to midnight in Israel.
// The initial false avoids freezing the banner into the prerendered HTML; it is decided in each visitor's browser.
function israelHour() {
  return Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', hour: '2-digit', hourCycle: 'h23' }).format(new Date()))
}
function isBedtimeInIsrael() { const hour = israelHour(); return hour >= 18 && hour < 24 }
function isMorningInIsrael() { const hour = israelHour(); return hour >= 6 && hour < 9 }
function MorningRoutineSpotlight() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const update = () => setShow(isMorningInIsrael())
    update()
    const timer = window.setInterval(update, 60_000)
    return () => window.clearInterval(timer)
  }, [])
  if (!show) return null
  return <Link to="/family/morning-routine" className="morning-routine-spotlight" aria-label="שגרת בוקר בוגה — מתחילים עכשיו">
    <span className="morning-sun" aria-hidden="true">☀️</span>
    <span className="morning-copy"><b>שגרת בוקר בוגה</b><small>משימה אחרי משימה — ויוצאים מהבית בזמן</small></span>
    <span className="morning-cta">מתחילים עכשיו ←</span>
  </Link>
}

function BedtimeStorySpotlight() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const update = () => setShow(isBedtimeInIsrael())
    update()
    const timer = window.setInterval(update, 60_000)
    return () => window.clearInterval(timer)
  }, [])
  if (!show) return null
  return <Link to="/stories" className="bedtime-story-spotlight" aria-label="סיפור קצר לילדים לפני השינה — לבחירת סיפור">
    <span className="bedtime-moon" aria-hidden="true">🌙</span>
    <span className="bedtime-copy"><b>סיפור קצר לילדים לפני השינה</b><small>בוחרים לפי גיל, 4 דקות, ונרדמים בשקט</small></span>
    <span className="bedtime-cta">לבחירת סיפור ←</span>
  </Link>
}

// "New on the site" and "From the blog", loaded after the first paint so their data stays out of the
// home bundle. The newest item always shows; the rest change from visit to visit (prerender: newest only).
function useFreshLists() {
  const [lists, setLists] = useState({ news: [], posts: [] })
  useEffect(() => {
    let alive = true
    const shuffle = !window.__PRERENDER__
    import('../data/blogPosts').then(m => {
      if (!alive) return
      const news = pickFresh(m.WHATS_NEW.slice(0, 20), 2, 5, shuffle)
      const daily = [...m.DAILY_POSTS].sort((a, b) => b.date.localeCompare(a.date))[0]
      const articles = [...m.BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date))
      const posts = [...(daily ? [daily] : []), ...pickFresh(articles, 1, 3, shuffle)]
      setLists({ news, posts })
    }).catch(() => {})
    return () => { alive = false }
  }, [])
  return lists
}

export default function Home() {
  const [mode, setMode] = useState('site')
  const [q, setQ] = useState('')
  const nav = useNavigate()
  // Experiment: what a visitor sees first under the title. Prerender (and the first paint) show the
  // search, the page as it has always been; the visitor's own variant takes over after hydration.
  const [variant, setVariant] = useState('tunnel')
  useEffect(() => { if (window.__PRERENDER__) return; const v = homeVariant(); setVariant(v); if (v === 'ai') setMode('ask'); recordExperiment('shown', v) }, [])
  const go = e => { e.preventDefault(); recordExperiment('click', variant); const v = q.trim(); nav(`/${mode === 'site' ? 'search' : 'bugapedia'}${v ? `?q=${encodeURIComponent(v)}` : ''}`) }
  const { news, posts } = useFreshLists()
  const counts = usePopularity()
  const quick = [...(new Date() < SEASON_ENDS ? [SEASON] : []), ...byVisits(QUICK, counts).slice(0, QUICK_SHOWN)]
  // A page already in the quick links doesn't show again in "most loved".
  const loved = byVisits(LOVED_POOL.filter(x => !quick.some(q => q[2] === x[2])), counts).slice(0, 6)
  const [liveBox, setLiveBox] = useState(false)
  const startLive = () => { if (mode === 'site') setLiveBox(true) }
  const plainField = <form className="hp-field" onSubmit={go}><input value={q} onFocus={startLive} onChange={e => { setQ(e.target.value); startLive() }} placeholder={mode === 'site' ? 'משחק, דף צביעה, כלי…' : 'למשל: למה השמיים כחולים?'} aria-label={mode === 'site' ? 'חיפוש באתר' : 'שאלה לבוגה־פדיה'} /><button type="submit">{mode === 'site' ? 'חיפוש' : 'לשאול'}</button></form>
  // Three versions of the opening (utils/experiments.js), each with its own look (.hp-v-*): the time
  // tunnel first, "what should we make for you?" first, or a question to Buga-pedia's AI first.
  const tunnel = <NearViewport key="tunnel"><div className="hp-sec hp-daily hp-daily-top" onClickCapture={() => recordExperiment('click', variant)}><TodayGame fallback={<TodayQuiz />} /></div></NearViewport>
  const search = <div key="search" className="hp-search" role="search">
    {variant === 'ai' && <p className="hp-ai-title"><Sparkles size={20} aria-hidden="true" /> שאלו את בוגה — בינה מלאכותית שעונה לילדים בעברית</p>}
    <div className="hp-modes" role="tablist" aria-label="סוג החיפוש">
      <button type="button" role="tab" aria-selected={mode === 'site'} onClick={() => setMode('site')}><Search size={16} /> חיפוש באתר</button>
      <button type="button" role="tab" aria-selected={mode === 'ask'} onClick={() => setMode('ask')}><Sparkles size={16} /> שאלה לבוגה־פדיה</button>
    </div>
    {/* Site search gets the live suggestions box (as on /search) once the visitor starts — loaded only then. */}
    {mode === 'site' && liveBox ? <Suspense fallback={plainField}>
      <SiteSearchBox className="hp-field" value={q} onChange={setQ} autoFocus placeholder="משחק, דף צביעה, כלי…"
        onSearch={v => { recordExperiment('click', variant); nav(`/search${v ? `?q=${encodeURIComponent(v)}` : ''}`) }} />
    </Suspense> : plainField}
  </div>
  const request = <RequestTop key="request" variant={variant} />
  const opening = variant === 'request' ? [request, tunnel, search] : variant === 'ai' ? [search, tunnel] : [tunnel, search]
  return <><SEO counterpartPath="/en" path="/" title="עוגה בוגה — משחקים, דפי פעילות ולמידה לילדים בחינם" description="משחקים לילדים, משחקי אונליין, דפי צביעה ודפי פעילות להדפסה, תרגול חשבון לפי כיתה, אותיות וקריאה — בעברית, בחינם וללא הרשמה." structuredData={faqSchema(homeFaq)} /><div className={`hp hp-v-${variant}`} dir="rtl">
    <section className="hp-hero">
      <Suspense fallback={null}><RoadWeekBanner /></Suspense>
      <div className="hp-chips"><PrintStrip /><BringChip /><ElectionChip /></div>
      <h1>{SITE_SLOGAN}</h1>
      <BugaCarRun />
      <p className="hp-lead">משחקים, דפים להדפסה, למידה וכלים לכיתה ולמסיבה — בחינם ובלי הרשמה.</p>
      <nav className="hp-quick" aria-label="הכי נצפים באתר">{quick.map(([e, t, to]) => <Link key={to} to={to}><span aria-hidden="true">{e}</span> {t}</Link>)}</nav>
      {opening}
      <a href={CHANNEL_GO} target="_blank" rel="noopener" className="mx-auto mt-4 flex min-h-[48px] w-fit items-center gap-2 rounded-full bg-[#25d366] px-5 font-bold text-white shadow-sm hover:bg-[#1ebe5b]">📲 דף חדש כל יום בוואטסאפ</a>
    </section>
    <Suspense fallback={null}><SeasonColoring /></Suspense>
    <HomeSpotlight />
    <Link to="/travel" className="travel-spotlight" aria-label="נוסעים עם בוגה — לכל מקום, גם בלי אינטרנט">
      <span className="travel-plane" aria-hidden="true">✈️</span>
      <span className="travel-copy"><b>נוסעים עם בוגה</b><small>לכל מקום, גם בלי אינטרנט — חוברות, משחקים וסיפורים לדרך</small></span>
      <span className="travel-cta">לדרך ←</span>
    </Link>
    <MorningRoutineSpotlight />
    <BedtimeStorySpotlight />
    <section className="hp-sec">
      <h2 className="hp-h2">למה נכנסתם היום?</h2>
      <div className="hp-doors">{HOME_INTENTS.map(([emoji, title, desc, to, , bg, color, src]) => <Link key={to} to={to} className="hp-door" style={{ '--bg': bg, '--c': color }}>
        <span className="hp-door-text"><b>{emoji} {title}</b><small>{desc.split(/[.—]/)[0]}</small></span>
        <img className="hp-door-art" src={src} alt="" width="720" height="720" loading="lazy" decoding="async" />
        <ChevronLeft className="hp-door-go" size={20} aria-hidden="true" />
      </Link>)}</div>
    </section>
    <HomeDiscover />
    <section className="hp-sec">
      <h2 className="hp-h2">כל העולמות של בוגה</h2>
      <div className="hp-worlds">{WORLDS.map(([e, t, to, d, bg]) => <Link key={to} to={to} className="hp-world" style={{ '--bg': bg }}><span aria-hidden="true">{e}</span><b>{t}</b><small>{d}</small></Link>)}</div>
    </section>
    <section className="hp-sec">
      <div className="hp-row-head"><h2 className="hp-h2">הכי אהובים החודש</h2><Link to="/tools">לכל הכלים ←</Link></div>
      <div className="hp-loved">{loved.map(([e, t, to, d]) => <Link key={to} to={to} className="hp-card"><span aria-hidden="true">{e}</span><b>{t}</b><small>{d}</small></Link>)}</div>
    </section>
    <NearViewport minHeight={0}><DoneRequests className="hp-sec" /></NearViewport>
    <section className="hp-sec hp-news">
      <div><h2 className="hp-h3">✨ חדש באתר</h2><ul>{news.map(x => <li key={x.to + x.title}><Link to={x.to}><span aria-hidden="true">{x.emoji}</span> {x.title}</Link></li>)}</ul><Link className="hp-more" to="/new">לכל החדש באתר ←</Link></div>
      <div><h2 className="hp-h3">📰 מהבלוג</h2><ul>{posts.map(p => <li key={p.slug}><Link to={`/blog/${p.slug}`}><span aria-hidden="true">{p.emoji}</span> {p.title}</Link></li>)}</ul><Link className="hp-more" to="/blog">לכל הפוסטים ←</Link></div>
    </section>
    <SponsorBanner />
    <footer className="hp-footer">
      <div className="hp-foot-news"><b>קצת השראה, פעם בשבוע</b><span>עד שלושה רעיונות למשחק, יצירה וזמן ביחד</span><Link to="/mail-preferences">להרשמה ←</Link></div>
      <div className="hp-foot-bottom">
        <nav aria-label="קישורי האתר">{[['אודות', '/about'], ['פרסום באתר', '/advertise'], ['מפת האתר', '/tools'], ['פרטיות', '/privacy'], ['תנאי שימוש', '/terms']].map(([t, to]) => <Link key={to} to={to}>{t}</Link>)}<Link to="/contact">צרו קשר</Link></nav>
        <SocialIcons />
      </div>
    </footer>
    <details className="hp-about"><summary>על עוגה בוגה — מה יש כאן ולמי זה מתאים</summary><SeoBody paragraphs={homeBody} faq={homeFaq} related={homeRelated} /></details>
  </div></>
}
