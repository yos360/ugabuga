import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Sparkles, ChevronLeft } from 'lucide-react'
import SEO from '../components/ui/SEO'
import PrintStrip from '../components/ui/PrintStrip'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import { HOME_INTENTS } from '../data/kidsZone'
import { SITE_SLOGAN } from '../data/brand'
import { ElectionChip } from '../components/home/HomeTopExtras'
import './Home.css'
import './home-v3.css'
import SponsorBanner from '../components/ui/SponsorBanner'

// Home page: one search (site or BugaPedia), four doors, "today", eight worlds, favourites, news.
// Each destination appears once. The holiday card and the blog list load after the first paint.
const HolidayToday = lazy(() => import('../components/home/HolidayToday'))
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

// The site's social accounts — an entry shows up only once its address is filled in.
const SOCIAL = [
  ['tiktok', 'טיקטוק', '', 'M12.53.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z'],
  ['instagram', 'אינסטגרם', '', 'M12 2.2c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z'],
  ['facebook', 'פייסבוק', '', 'M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z'],
  ['youtube', 'יוטיוב', '', 'M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z'],
]
const SOCIAL_LIVE = SOCIAL.filter(([, , href]) => href)
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
  const go = e => { e.preventDefault(); const v = q.trim(); nav(`/${mode === 'site' ? 'search' : 'bugapedia'}${v ? `?q=${encodeURIComponent(v)}` : ''}`) }
  const posts = useLatestPosts()
  return <><SEO counterpartPath="/en" path="/" title="עוגה בוגה — משחקים, דפי פעילות ולמידה לילדים בחינם" description="משחקים לילדים, משחקי אונליין, דפי צביעה ודפי פעילות להדפסה, תרגול חשבון לפי כיתה, אותיות וקריאה — בעברית, בחינם וללא הרשמה." structuredData={faqSchema(homeFaq)} /><div className="hp" dir="rtl">
    <section className="hp-hero">
      <div className="hp-chips"><PrintStrip /><ElectionChip /></div>
      <h1>{SITE_SLOGAN}</h1>
      <p className="hp-lead">משחקים, דפים להדפסה, למידה וכלים לכיתה ולמסיבה — בחינם ובלי הרשמה.</p>
      <form className="hp-search" onSubmit={go} role="search">
        <div className="hp-modes" role="tablist" aria-label="סוג החיפוש">
          <button type="button" role="tab" aria-selected={mode === 'site'} onClick={() => setMode('site')}><Search size={16} /> חיפוש באתר</button>
          <button type="button" role="tab" aria-selected={mode === 'ask'} onClick={() => setMode('ask')}><Sparkles size={16} /> שאלה לבוגה־פדיה</button>
        </div>
        <div className="hp-field"><input value={q} onChange={e => setQ(e.target.value)} placeholder={mode === 'site' ? 'משחק, דף צביעה, כלי…' : 'למשל: למה השמיים כחולים?'} aria-label={mode === 'site' ? 'חיפוש באתר' : 'שאלה לבוגה־פדיה'} /><button type="submit">{mode === 'site' ? 'חיפוש' : 'לשאול'}</button></div>
      </form>
    </section>
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
    <section className="hp-sec hp-news">
      <div><h2 className="hp-h3">✨ חדש באתר</h2><ul>{NEW.map(([e, t, to]) => <li key={to}><Link to={to}><span aria-hidden="true">{e}</span> {t}</Link></li>)}</ul></div>
      <div><h2 className="hp-h3">📰 מהבלוג</h2><ul>{posts.map(p => <li key={p.slug}><Link to={`/blog/${p.slug}`}><span aria-hidden="true">{p.emoji}</span> {p.title}</Link></li>)}</ul><Link className="hp-more" to="/blog">לכל הפוסטים ←</Link></div>
    </section>
    <SponsorBanner />
    <footer className="hp-footer">
      <div className="hp-foot-news"><b>קצת השראה, פעם בשבוע</b><span>עד שלושה רעיונות למשחק, יצירה וזמן ביחד</span><Link to="/mail-preferences">להרשמה ←</Link></div>
      <div className="hp-foot-bottom">
        <nav aria-label="קישורי האתר">{[['אודות', '/about'], ['פרסום באתר', '/advertise'], ['מפת האתר', '/tools'], ['פרטיות', '/privacy'], ['תנאי שימוש', '/terms']].map(([t, to]) => <Link key={to} to={to}>{t}</Link>)}<a href="mailto:hellobugabuga@gmail.com">צרו קשר</a></nav>
        <SocialIcons />
      </div>
    </footer>
    <details className="hp-about"><summary>על עוגה בוגה — מה יש כאן ולמי זה מתאים</summary><SeoBody paragraphs={homeBody} faq={homeFaq} related={homeRelated} /></details>
  </div></>
}
