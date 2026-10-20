import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Share2 } from 'lucide-react'
import SEO from '../components/ui/SEO'
import PrintStrip from '../components/ui/PrintStrip'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import './Home.css'
import './home-responsive.css'
import './home-intents.css'
import { HOME_INTENTS } from '../data/kidsZone'
import { SITE_SLOGAN } from '../data/brand'
// The daily quiz/game widgets sit below the fold — keep their code (and the
// month's quiz-data chunk) out of the home page's critical path.
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
// The banner pulls in every holiday's config (print sheets, quizzes); loading it lazily keeps all of
// that out of the main bundle. The slot below reserves its height so nothing jumps when it appears.
const HolidayBanner = lazy(() => import('../components/holidays/HolidayBanner'))
import SiteSearchBox from '../components/ui/SiteSearchBox'
import PlayNow from '../components/home/PlayNow'

function Art({ crop, src, className = '' }) {
  const [x,y,w,h] = crop
  return <span aria-hidden="true" className={`home-art ${className}`} style={src ? {backgroundImage:`url(${src})`, backgroundSize:'contain', backgroundPosition:'center bottom', aspectRatio:'1 / 1'} : {aspectRatio:`${w}/${h}`,backgroundSize:`${1536/w*100}% ${1024/h*100}%`,backgroundPosition:`${x/(1536-w)*100}% ${y/(1024-h)*100}%`}} />
}
// "Why are you here today?" — the four entry doors right under the hero (data in src/data/kidsZone.js).
// They replace the old category doors (birthday / games / create / classroom), which pointed to
// mostly the same places; games and create stay one tap away in the hero buttons, PlayNow and the menu.
const games = [
  ['תחנת החלל התקועה','חדר בריחה לילדים ולנוער','/tools/escape-rooms?room=space-station',[116,826,232,93]],
  ['יוצרים ציד אוצרות','מסלול רמזים משלכם','/tools/scavenger-hunt-maker',[387,826,228,93]],
  ['תיק הבלש הסודי','חדר בריחה למבוגרים','/tools/escape-rooms?room=detective-case',[654,826,230,93]],
  ['טריוויה לכל המשפחה','בוחרים נושא, גיל וקושי','/tools/trivia-quiz',[923,826,230,93]],
  ['תעלומת העוגה הנעלמת','חדר בריחה לילדים','/tools/escape-rooms?room=lost-cake',[1190,826,231,93]],
]
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

// A deliberately small "help me choose" layer: three choices, then three useful links.
// It keeps a visitor from having to understand the whole site before they can start.
const QUICK_ACTIVITIES = [
  { to: '/games/5-minutes', emoji: '⚡', title: 'משחק ל־5 דקות', text: 'פתרון מהיר למעבר, המתנה או הפסקה.', places: ['home', 'class', 'party'], ages: ['3-5', '6-8', '9-12'], times: ['5'] },
  { to: '/letters/game', emoji: '🔤', title: 'משחק אותיות', text: 'מזהים אות, צליל ומילה במשחק קצר.', places: ['home', 'class'], ages: ['3-5', '6-8'], times: ['5', '15'] },
  { to: '/printables/kindergarten-worksheets', emoji: '🧸', title: 'דפי עבודה לגן חובה', text: 'אותיות, צלילים וחרוזים עם פתרונות.', places: ['home', 'class'], ages: ['3-5'], times: ['15', '30'] },
  { to: '/printables/hebrew-worksheets-grade-1', emoji: '✏️', title: 'דפי עברית לכיתה א׳', text: 'קריאה, כתיבה וצלילים לפי רמה.', places: ['home', 'class'], ages: ['6-8'], times: ['15', '30'] },
  { to: '/printables/hebrew-worksheets-grades-2-3', emoji: '📚', title: 'דפי עברית לכיתות ב׳–ג׳', text: 'מילים, משפטים וכתיבה עם פתרונות.', places: ['home', 'class'], ages: ['9-12'], times: ['15', '30'] },
  { to: '/tools/trivia-quiz', emoji: '🎯', title: 'טריוויה לפי נושא', text: 'בוחרים נושא, גיל וקושי — ומתחילים.', places: ['home', 'class', 'party'], ages: ['6-8', '9-12'], times: ['5', '15'] },
  { to: '/live', emoji: '🎮', title: 'בוגה לייב', text: 'חידון חי עם QR לכל הקבוצה.', places: ['class', 'party'], ages: ['6-8', '9-12'], times: ['15', '30'] },
  { to: '/tools/bingo-maker', emoji: '🎟️', title: 'בינגו מוכן', text: 'כרטיסיות ופעילות משותפת להדפסה.', places: ['class', 'party', 'home'], ages: ['3-5', '6-8', '9-12'], times: ['15', '30'] },
  { to: '/treasure-hunt/ready', emoji: '🗺️', title: 'ציד אוצרות מוכן', text: 'רמזים, משימות והדפסה — בלי להכין מאפס.', places: ['home', 'class', 'party'], ages: ['6-8', '9-12'], times: ['30'] },
  { to: '/tools/escape-rooms', emoji: '🧩', title: 'חדר בריחה', text: 'משימה גדולה יותר למשפחה או לחברים.', places: ['home', 'party'], ages: ['6-8', '9-12'], times: ['30'] },
]
const QUICK_OPTIONS = {
  place: [['home', '🏠 בבית'], ['class', '🏫 בכיתה או בגן'], ['party', '🎂 במסיבה']],
  age: [['3-5', 'גיל 3–5'], ['6-8', 'גיל 6–8'], ['9-12', 'גיל 9–12']],
  time: [['5', '5 דקות'], ['15', 'רבע שעה'], ['30', 'חצי שעה+']],
}
function QuickMatch() {
  const [choice, setChoice] = useState({ place: 'home', age: '6-8', time: '15' })
  const pick = (key, value) => setChoice(current => ({ ...current, [key]: value }))
  const suggestions = QUICK_ACTIVITIES.map(item => ({ ...item,
    score: (item.places.includes(choice.place) ? 5 : 0) + (item.ages.includes(choice.age) ? 4 : 0) + (item.times.includes(choice.time) ? 3 : 0),
  })).sort((a, b) => b.score - a.score).slice(0, 3)
  return <section className="home-quick-match" aria-labelledby="quick-match-title">
    <div className="home-quick-heading"><span aria-hidden="true">✨</span><div><h2 id="quick-match-title">לא בטוחים במה לבחור?</h2><p>3 לחיצות — ונמצא פעילות שמתאימה לכם עכשיו.</p></div></div>
    <div className="quick-choices">
      {[['place', 'איפה אתם?'], ['age', 'בן/בת כמה?'], ['time', 'כמה זמן יש?']].map(([key, label]) => <div className="quick-choice" key={key} role="group" aria-label={label}>
        <b>{label}</b><div>{QUICK_OPTIONS[key].map(([value, text]) => <button key={value} type="button" aria-pressed={choice[key] === value} onClick={() => pick(key, value)} className={choice[key] === value ? 'is-active' : ''}>{text}</button>)}</div>
      </div>)}
    </div>
    <div className="quick-results" aria-live="polite">{suggestions.map(item => <Link key={item.to} to={item.to}>
      <span aria-hidden="true">{item.emoji}</span><div><h3>{item.title}</h3><p>{item.text}</p></div><strong aria-hidden="true">←</strong>
    </Link>)}</div>
  </section>
}

// Home charts strip: after the featured games on desktop, further down on phones.
function HomeCharts({ className }) {
  return <section className={`home-charts ${className}`} aria-label="לוחות לבית">
      <div className="home-charts-copy">
        <span className="home-charts-tag">חדש · להדפסה בחינם</span>
        <h2>🏠 לוחות לבית — סדר בלי ויכוחים</h2>
        <p>כותבים את השם של הילד — ומדפיסים.</p>
        <Link to="/printables/home-charts" className="home-charts-cta">לכל הלוחות ←</Link>
      </div>
      <nav className="home-charts-grid" aria-label="לוחות לבית">
        {[['📋', 'טבלת מטלות', '/printables/chore-chart'], ['⭐', 'לוח מדבקות', '/printables/reward-chart'], ['🦷', 'צחצוח שיניים', '/printables/toothbrushing-chart'], ['🚽', 'לוח גמילה', '/printables/potty-chart'], ['🗓️', 'מערכת שעות', '/printables/class-schedule'], ['📅', 'לוח שנה 2027', '/printables/calendar-2027']].map(([e, t, to]) => <Link key={to} to={to}><span aria-hidden="true">{e}</span>{t}</Link>)}
      </nav>
    </section>
}

export default function Home() {
  const [query,setQuery] = useState('')
  const list = useRef(null)
  const navigate = useNavigate()

  const shareWebsite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'עוגה בוגה — משחקים, דפי פעילות ולמידה לילדים',
          text: SITE_SLOGAN,
          url: window.location.href,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      // writeText rejects when clipboard permission is missing (older Safari, in-app browsers).
      (navigator.clipboard ? navigator.clipboard.writeText(window.location.href) : Promise.reject(new Error('no clipboard')))
        .then(() => alert('הקישור הועתק ללוח'))
        .catch(() => prompt('העתיקו את הקישור:', window.location.href))
    }
  }

  return <><SEO counterpartPath="/en" path="/" title="עוגה בוגה — משחקים, דפי פעילות ולמידה לילדים בחינם" description="משחקים לילדים, משחקי אונליין, דפי צביעה ודפי פעילות להדפסה, תרגול חשבון לפי כיתה, אותיות וקריאה — בעברית, בחינם וללא הרשמה." structuredData={faqSchema(homeFaq)} /><div className="home-v2">
    <section className="home-intro">
      <h1>{SITE_SLOGAN}</h1>
      <PrintStrip />
      <p>משחקי אונליין, דפי צביעה והדפסה, תרגול חשבון וקריאה וכלים ליום הולדת ולכיתה — הכול במקום אחד, בלי הרשמה.</p>
    </section>
    <section className="home-intents" aria-labelledby="home-intents-title">
      <h2 id="home-intents-title">למה נכנסתם היום?</h2>
      <div className="home-doors">{HOME_INTENTS.map(([emoji,title,description,to,crop,bg,color,src], index)=><Link className={`home-door home-intent${index === 0 ? ' is-kids' : ''}`} to={to} key={to} style={{'--door-bg':bg,'--door-color':color}}>
        <div className="home-door-copy"><h3><span aria-hidden="true">{emoji} </span>{title}</h3><p>{description}</p></div>
        {index === 0 && <span className="home-intent-stickers" aria-hidden="true"><span>🎨</span><span>⭐</span><span>🔤</span></span>}
        <Art crop={crop} src={src} className={`home-door-art door-art-${index}`} /><span className="home-door-arrow"><ChevronLeft aria-hidden="true"/></span>
      </Link>)}</div>
    </section>
    <Suspense fallback={<div className="holiday-banner-slot mb-5" aria-hidden="true" />}><HolidayBanner className="mb-5" /></Suspense>
    <PlayNow />
    <QuickMatch />
    <SiteSearchBox className="home-search" buttonFirst iconSize={29} value={query} onChange={setQuery} placeholder="חפשו משחק, דף להדפסה או כלי" onSearch={v=>navigate('/search'+(v?'?q='+encodeURIComponent(v):''))}/>
    <NearViewport><TodayGame fallback={<TodayQuiz />} /></NearViewport>
    <section className="home-featured">
      <h2>משחקים מומלצים</h2>
      <div className="home-carousel-wrap">
        <button className="home-scroll home-scroll-left" aria-label="גלילה שמאלה" onClick={()=>list.current.scrollBy({left:-270,behavior:'smooth'})}><ChevronLeft/></button>
        <div ref={list} className="home-games">{games.map(([title,description,to,crop])=><Link to={to} className="home-game" key={to}><Art crop={crop}/><h3>{title}</h3><p>{description}</p></Link>)}</div>
        <button className="home-scroll home-scroll-right" aria-label="גלילה ימינה" onClick={()=>list.current.scrollBy({left:270,behavior:'smooth'})}><ChevronRight/></button>
      </div>
    </section>
    <HomeCharts />
    <section className="home-extra">
      <h2>המשחקים הפופולריים</h2>
      <div className="home-extras">
        <Link to="/live"><h3>🎮 בוגה לייב</h3><p>משחק שאלות חי עם QR ועד 100 משתתפים.</p></Link>
        <Link to="/tools/eretz-ir"><h3>🗺️ ארץ־עיר</h3><p>אות אקראית, טיימר וניקוד.</p></Link>
        <Link to="/tools/bingo-maker"><h3>🎟️ בינגו</h3><p>כרטיסיות מוכנות ומותאמות להדפסה.</p></Link>
        <Link to="/tools/dice"><h3>🎲 קוביה וירטואלית</h3><p>הטלת קוביה אחת עד חמש, בחינם.</p></Link>
      </div>
    </section>
    <section className="home-extra">
      <h2>עולמות תוכן</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-4">
        {[
          ['🎯','חידוני טריוויה','40 חידונים לפי נושא וגיל.','/trivia/topics'],
          ['🦁','עובדות על חיות','50 חיות עם עובדות וחידון.','/animals'],
          ['🧩','חידות עם תשובות','חידות לפי נושא, עם רמז.','/riddles/topics'],
          ['😂','בדיחות לילדים','בדיחות נקיות לפי נושא.','/jokes/topics'],
          ['💌','ברכות ליום הולדת','ברכות מוכנות לכל חוגג.','/birthday-greetings'],
          ['🗺️','ציד אוצרות מוכן','רמזים מחורזים להדפסה.','/treasure-hunt/ready'],
          ['🔤','אותיות באנגלית','A עד Z עם מילים ומשחק.','/abc'],
          ['⏳','מנהרת הזמן','מה קרה היום בהיסטוריה?','/time-tunnel'],
          ['🎒','הכנה לכיתה א׳','כתיבה, קריאה, חשבון ושעון.','/classroom/first-grade'],
          ['✏️','אותיות בעברית להדפסה','תרגול אותיות למעבר בעיפרון.','/printables/hebrew-letters'],
          ['🔢','דפי עבודה בחשבון','חיבור וחיסור עד 10 ועד 20.','/printables/math-worksheets'],
          ['🌀','מבוכים להדפסה','3 רמות קושי עם סיפור קצר.','/printables/mazes'],
        ].map(([emoji,title,desc,to])=>(
          <Link key={to} to={to} className="wobbly card-lift border-2 border-[var(--border)] bg-[var(--card)] sketch-shadow p-4 text-right">
            <div className="text-3xl mb-1">{emoji}</div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">{desc}</p>
          </Link>
        ))}
      </div>
    </section>
    <button onClick={shareWebsite} className="share-button" aria-label="שיתוף האתר">
      <Share2 size={20} />
      <span>שיתוף האתר</span>
    </button>
    <section className="home-extra">
      <SeoBody paragraphs={homeBody} faq={homeFaq} related={homeRelated} />
    </section>
  </div></>
}
