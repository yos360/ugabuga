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
import { LiveTop, RequestTop, BringTop, RsvpTop } from '../components/home/HomeTopVariant'
import DoneRequests from '../components/ui/DoneRequests'
import { homeVariant, recordExperiment } from '../utils/experiments'

// Home page: one search (site or BugaPedia), four doors, "today", eight worlds, favourites, news.
// Each destination appears once. The holiday card and the blog list load after the first paint.
const HolidayToday = lazy(() => import('../components/home/HolidayToday'))
// Road safety week (1–6.11): an animated banner at the top, rendered only until the week ends.
const RoadWeekBanner = lazy(() => import('../components/roadsafety/RoadWeekBanner'))
// The daily family game (time tunnel, or the daily quiz on days without one) sits below the fold —
// keep its code and the month's question data out of the home page's first load.
const TodayQuiz = lazy(() => import('../components/home/TodayQuiz'))
const TodayGame = lazy(() => import('../components/home/TodayGame'))

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
const LOVED = [
  ['🧩', 'חדר בריחה לילדים', '/tools/escape-rooms', 'תעלומה לכל המשפחה'],
  ['🎯', 'טריוויה לפי נושא', '/tools/trivia-quiz', 'בוחרים גיל וקושי'],
  ['🎨', 'צביעה לפי מספרים', '/printables/color-by-number', 'להדפסה ולמסך'],
  ['🔤', 'משחק אותיות', '/letters/game', 'מזהים צליל ומילה'],
  ['🗺️', 'ציד אוצרות מוכן', '/treasure-hunt/ready', 'רמזים מחורזים'],
  ['🪄', 'נקדן אוטומטי', '/tools/nakdan', 'מדביקים ומקבלים ניקוד'],
]
const NEW = [['📅', 'לוח שנה עברי לועזי', '/hebrew-calendar'], ['⭐', 'כוכב/ת השבוע להדפסה', '/printables/star-of-the-week'], ['📖', 'הבנת הנקרא א׳–ח׳', '/learn/reading'], ['🤖', 'אקדמיית ה־AI של בוגה', '/learn/ai']]

const SocialIcons = () => SOCIAL_LIVE.length > 0 && <div className="hp-social">{SOCIAL_LIVE.map(([id, name, href, d]) =>
  <a key={id} href={href} className={`hp-soc hp-soc-${id}`} target="_blank" rel="noopener noreferrer" aria-label={`עוגה בוגה ב${name}`}>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} fill="currentColor" /></svg>
  </a>)}</div>

// The morning routine and the bedtime story have their own strips at the top (in their hours),
// so this card is always the game of the day.
function TodayCard() {
  return <Link to="/game-of-the-day" className="hp-today hp-today-day"><span className="hp-today-ic">🎲</span><b>משחק היום</b><small>משחק חדש בכל יום</small><i>משחקים ←</i></Link>
}

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

// The three newest posts, loaded after the first paint so the post data stays out of the home bundle.
function useLatestPosts() {
  const [posts, setPosts] = useState([])
  useEffect(() => {
    let alive = true
    import('../data/blogPosts').then(m => { if (alive) setPosts([...m.BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)) }).catch(() => {})
    return () => { alive = false }
  }, [])
  return posts
}

export default function Home() {
  const [mode, setMode] = useState('site')
  const [q, setQ] = useState('')
  const nav = useNavigate()
  // Experiment: what a visitor sees first under the title. Prerender (and the first paint) show the
  // search, the page as it has always been; the visitor's own variant takes over after hydration.
  const [variant, setVariant] = useState('search')
  useEffect(() => { if (window.__PRERENDER__) return; const v = homeVariant(); setVariant(v); recordExperiment('shown', v) }, [])
  const go = e => { e.preventDefault(); recordExperiment('click', variant); const v = q.trim(); nav(`/${mode === 'site' ? 'search' : 'bugapedia'}${v ? `?q=${encodeURIComponent(v)}` : ''}`) }
  const posts = useLatestPosts()
  return <><SEO counterpartPath="/en" path="/" title="עוגה בוגה — משחקים, דפי פעילות ולמידה לילדים בחינם" description="משחקים לילדים, משחקי אונליין, דפי צביעה ודפי פעילות להדפסה, תרגול חשבון לפי כיתה, אותיות וקריאה — בעברית, בחינם וללא הרשמה." structuredData={faqSchema(homeFaq)} /><div className="hp" dir="rtl">
    <section className="hp-hero">
      <Suspense fallback={null}><RoadWeekBanner /></Suspense>
      <div className="hp-chips"><PrintStrip />{variant !== 'bring' && <BringChip />}<ElectionChip /></div>
      <h1>{SITE_SLOGAN}</h1>
      <p className="hp-lead">משחקים, דפים להדפסה, למידה וכלים לכיתה ולמסיבה — בחינם ובלי הרשמה.</p>
      {variant === 'live' && <LiveTop variant={variant} />}
      {variant === 'request' && <RequestTop variant={variant} />}
      {variant === 'bring' && <BringTop variant={variant} />}
      {variant === 'rsvp' && <RsvpTop variant={variant} />}
      <form className="hp-search" onSubmit={go} role="search">
        <div className="hp-modes" role="tablist" aria-label="סוג החיפוש">
          <button type="button" role="tab" aria-selected={mode === 'site'} onClick={() => setMode('site')}><Search size={16} /> חיפוש באתר</button>
          <button type="button" role="tab" aria-selected={mode === 'ask'} onClick={() => setMode('ask')}><Sparkles size={16} /> שאלה לבוגה־פדיה</button>
        </div>
        <div className="hp-field"><input value={q} onChange={e => setQ(e.target.value)} placeholder={mode === 'site' ? 'משחק, דף צביעה, כלי…' : 'למשל: למה השמיים כחולים?'} aria-label={mode === 'site' ? 'חיפוש באתר' : 'שאלה לבוגה־פדיה'} /><button type="submit">{mode === 'site' ? 'חיפוש' : 'לשאול'}</button></div>
      </form>
      <a href={CHANNEL_GO} target="_blank" rel="noopener" className="mx-auto mt-4 flex min-h-[48px] w-fit items-center gap-2 rounded-full bg-[#25d366] px-5 font-bold text-white shadow-sm hover:bg-[#1ebe5b]">📲 דף חדש כל יום בוואטסאפ</a>
    </section>
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
        <img className="hp-door-art" src={src} alt="" width="720" height="720" />
        <ChevronLeft className="hp-door-go" size={20} aria-hidden="true" />
      </Link>)}</div>
    </section>
    <NearViewport><div className="hp-sec hp-daily"><TodayGame fallback={<TodayQuiz />} /></div></NearViewport>
    <section className="hp-sec">
      <h2 className="hp-h2">היום בבוגה</h2>
      <div className="hp-today-row">
        <TodayCard />
        <Suspense fallback={<span className="hp-today hp-today-holiday" aria-hidden="true" />}><HolidayToday /></Suspense>
        <Link to="/trivia" className="hp-today hp-today-quiz"><span className="hp-today-ic">❓</span><b>חידון היום</b><small>5 שאלות, דקה אחת</small><i>לחידון ←</i></Link>
      </div>
    </section>
    <section className="hp-sec">
      <h2 className="hp-h2">כל העולמות של בוגה</h2>
      <div className="hp-worlds">{WORLDS.map(([e, t, to, d, bg]) => <Link key={to} to={to} className="hp-world" style={{ '--bg': bg }}><span aria-hidden="true">{e}</span><b>{t}</b><small>{d}</small></Link>)}</div>
    </section>
    <section className="hp-sec">
      <div className="hp-row-head"><h2 className="hp-h2">הכי אהובים השבוע</h2><Link to="/tools">לכל הכלים ←</Link></div>
      <div className="hp-loved">{LOVED.map(([e, t, to, d]) => <Link key={to} to={to} className="hp-card"><span aria-hidden="true">{e}</span><b>{t}</b><small>{d}</small></Link>)}</div>
    </section>
    <NearViewport minHeight={0}><DoneRequests className="hp-sec" /></NearViewport>
    <section className="hp-sec hp-news">
      <div><h2 className="hp-h3">✨ חדש באתר</h2><ul>{NEW.map(([e, t, to]) => <li key={to}><Link to={to}><span aria-hidden="true">{e}</span> {t}</Link></li>)}</ul></div>
      <div><h2 className="hp-h3">📰 מהבלוג</h2><ul>{posts.map(p => <li key={p.slug}><Link to={`/blog/${p.slug}`}><span aria-hidden="true">{p.emoji}</span> {p.title}</Link></li>)}</ul><Link className="hp-more" to="/blog">לכל הפוסטים ←</Link></div>
    </section>
    <SponsorBanner />
    <footer className="hp-footer">
      <div className="hp-foot-news"><b>קצת השראה, פעם בשבוע</b><span>עד שלושה רעיונות למשחק, יצירה וזמן ביחד</span><Link to="#mail-signup">להרשמה ←</Link></div>
      <div className="hp-foot-bottom">
        <nav aria-label="קישורי האתר">{[['אודות', '/about'], ['פרסום באתר', '/advertise'], ['מפת האתר', '/tools'], ['פרטיות', '/privacy'], ['תנאי שימוש', '/terms']].map(([t, to]) => <Link key={to} to={to}>{t}</Link>)}<a href="mailto:hellobugabuga@gmail.com">צרו קשר</a></nav>
        <SocialIcons />
      </div>
    </footer>
    <details className="hp-about"><summary>על עוגה בוגה — מה יש כאן ולמי זה מתאים</summary><SeoBody paragraphs={homeBody} faq={homeFaq} related={homeRelated} /></details>
  </div></>
}
