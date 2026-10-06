import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Search, Share2 } from 'lucide-react'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import './Home.css'
import './home-responsive.css'
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
const doors = [
  ['יום הולדת','משחקים, כלים וספקים —\nהכול לחגיגה מושלמת.','/birthday',[124,268,188,176],'#ffe7e4','#ff6f7b','/images/home-birthday-girl-720.webp'],
  ['משחקים','מצאו משחק לפי גיל,\nזמן, משתתפים וציוד.','/games',[577,257,191,187],'#dffbef','#23c89f','/images/home-detective-boy-720.webp'],
  ['יוצרים','דפי הדפסה, תשבצים\nועיצוב משלכם.','/create',[1022,272,187,162],'#f3eaff','#a775ed','/images/home-printer-720.webp'],
  ['לכיתה','משחקים, עבודת שורשים\nודפי פעילות למורים.','/classroom',[1019,481,173,170],'#dff2ff','#28a4ef','/images/home-schoolgirl-720.webp'],
]
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
  'האתר בנוי משלושה סוגי תוכן שמשלימים אחד את השני: רשימה גדולה של כל המשחקים המסוננת לפי גיל, זמן, ציוד ומספר משתתפים; כלים אינטראקטיביים ומדפסות כמו בינגו היכרות, ציד אוצרות וחדרי בריחה; ועולם רעיונות לתכנון מסיבות ואירועים שלמים.',
  'בין אם מגיעים כהורה שמחפש פתרון מהיר לחצי שעה פנויה, כמורה שרוצה כלי לכיתה, או כמארגן מסיבה שרוצה לתכנן אירוע שלם — כל דבר באתר חינמי לשימוש, זמין מיד, ולא דורש הרשמה כדי להתחיל.',
]
const homeRelated = [ { label: 'כל המשחקים', href: '/games' }, { label: 'עולם ההשראה', href: '/ideas' }, { label: 'מתחם יוצרים', href: '/create' }, { label: 'הכנה לכיתה א׳', href: '/classroom/first-grade' }, { label: 'דפים להדפסה', href: '/printables' } ]

export default function Home() {
  const [query,setQuery] = useState('')
  const list = useRef(null)
  const navigate = useNavigate()

  const shareWebsite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'עוגה בוגה — משחקים וכלים בעברית',
          text: 'מאגר של 100+ משחקים ופעילויות לילדים, כיתות ויום הולדת',
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

  return <><SEO path="/" title="עוגה בוגה — משחקים והדפסות חינם לילדים ולמורות" description='עוגה בוגה (BUGA) — 100 משחקים, כלים להדפסה וחדרי בריחה בעברית, חינם וללא הרשמה, ליום הולדת, לכיתה ולבית.' structuredData={faqSchema(homeFaq)} /><div className="home-v2">
    <section className="home-intro">
      <h1>מה בא לכם לעשות היום?</h1>
      <p>משחקים, יצירה, דפי פעילות וכלים ליום הולדת, לכיתה ולבית — בעברית ובמקום אחד. עוגה בוגה (UGABUGA) מציעה 100 משחקים ופעילויות בחינם לכל גיל וגודל קבוצה.</p>
      <nav className="home-quick" aria-label="מתחילים מכאן">
        <Link to="/online-games" className="home-quick-btn is-play"><span aria-hidden="true">🕹️</span> לשחק עכשיו</Link>
        <Link to="/tools/bring-list" className="home-quick-btn is-list"><span aria-hidden="true">🧺</span> רשימת "מי מביא מה"</Link>
        <Link to="/printables" className="home-quick-btn is-print"><span aria-hidden="true">🖨️</span> דפים להדפסה</Link>
      </nav>
      <button onClick={shareWebsite} className="share-button" aria-label="שיתוף האתר">
        <Share2 size={20} />
        <span>שיתוף</span>
      </button>
    </section>
    <Suspense fallback={<div className="holiday-banner-slot mb-5" aria-hidden="true" />}><HolidayBanner className="mb-5" /></Suspense>
    <section className="home-doors" aria-label="בוחרים פעילות">{doors.map(([title,description,to,crop,bg,color,src], index)=><Link className="home-door" to={to} key={title} style={{'--door-bg':bg,'--door-color':color}}><div className="home-door-copy"><h2>{title}</h2><p>{description}</p></div><Art crop={crop} src={src} className={`home-door-art door-art-${index}`} /><span className="home-door-arrow"><ChevronLeft aria-hidden="true"/></span></Link>)}</section>
    <PlayNow />
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
    <section className="home-charts" aria-labelledby="home-charts-title">
      <div className="home-charts-copy">
        <span className="home-charts-tag">חדש · להדפסה בחינם</span>
        <h2 id="home-charts-title">🏠 לוחות לבית — סדר בלי ויכוחים</h2>
        <p>כותבים את השם של הילד — ומדפיסים.</p>
        <Link to="/printables/home-charts" className="home-charts-cta">לכל הלוחות ←</Link>
      </div>
      <nav className="home-charts-grid" aria-label="לוחות לבית">
        {[['📋', 'טבלת מטלות', '/printables/chore-chart'], ['⭐', 'לוח מדבקות', '/printables/reward-chart'], ['🦷', 'צחצוח שיניים', '/printables/toothbrushing-chart'], ['🚽', 'לוח גמילה', '/printables/potty-chart'], ['🗓️', 'מערכת שעות', '/printables/class-schedule']].map(([e, t, to]) => <Link key={to} to={to}><span aria-hidden="true">{e}</span>{t}</Link>)}
      </nav>
    </section>
    <section className="home-extra">
      <h2>המשחקים הפופולריים</h2>
      <div className="home-extras">
        <Link to="/tools/truth-or-buga"><h3>🎭 אמת או בוגה</h3><p>אמת או שקר, לבד או תחרות קבוצות.</p></Link>
        <Link to="/tools/eretz-ir"><h3>🗺️ ארץ־עיר</h3><p>אות אקראית, טיימר וניקוד.</p></Link>
        <Link to="/tools/bingo-maker"><h3>🎟️ בינגו</h3><p>כרטיסיות מוכנות ומותאמות להדפסה.</p></Link>
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
    <section className="home-extra">
      <SeoBody paragraphs={homeBody} faq={homeFaq} related={homeRelated} />
    </section>
  </div></>
}
