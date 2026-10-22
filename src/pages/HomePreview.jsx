import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Sparkles, ChevronLeft } from 'lucide-react'
import { HOME_INTENTS } from '../data/kidsZone'
import { SITE_SLOGAN } from '../data/brand'
import PrintStrip from '../components/ui/PrintStrip'
import { ElectionChip } from '../components/home/HomeTopExtras'
import './Home.css'
import './home-preview.css'

// DESIGN PREVIEW (local only, not linked or deployed): a calmer home page in the site's own style.
// One search with two modes, four doors, one "today" row, eight worlds, one carousel, then news.
const QUICK = [['משחקים אונליין', '/online-games'], ['דפי צביעה', '/printables/coloring'], ['יום הולדת', '/birthday'], ['הבנת הנקרא', '/learn/reading'], ['בוגה לייב', '/live']]
const WORLDS = [
  ['🎮', 'משחקים', '/games', 'אונליין, למסיבה ולכיתה', '#ffefc2'],
  ['📚', 'לומדים', '/learn', 'חשבון, קריאה, אנגלית, AI', '#e3f1ff'],
  ['🖨️', 'להדפסה', '/printables', 'צביעה, דפי עבודה, לוחות', '#ffe6ee'],
  ['🎂', 'יום הולדת', '/birthday', 'רעיונות, הזמנות, משחקים', '#fff0e3'],
  ['🕯️', 'שבתות וחגים', '/holidays', 'לוח עברי, פעילויות, ברכות', '#efe9ff'],
  ['🏡', 'משפחה', '/family', 'מה עושים היום, סיפורים', '#e6f7ec'],
  ['🏫', 'לכיתה ולגן', '/classroom', 'בוגה לייב, כוכב השבוע', '#e2f4f7'],
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
const BLOG = [['🕎', 'מתכננים חנוכה 2026: פעילות לכל ערב', '/blog/hanukkah-2026-plan'], ['🌧️', 'יום גשום בבית: רעיונות לחורף', '/blog/winter-activities-at-home'], ['🤖', 'איך מדברים עם ילדים על בינה מלאכותית', '/blog/talking-to-kids-about-ai']]

function TodayCard() {
  const [h, setH] = useState(12)
  useEffect(() => { setH(new Date().getHours()) }, [])
  if (h >= 5 && h < 10) return <Link to="/family/morning-routine" className="hp-today hp-today-morning"><span className="hp-today-ic">☀️</span><b>שגרת בוקר</b><small>משימה אחרי משימה, ויוצאים בזמן</small><i>מתחילים ←</i></Link>
  if (h >= 18 || h < 5) return <Link to="/stories" className="hp-today hp-today-night"><span className="hp-today-ic">🌙</span><b>סיפור לפני השינה</b><small>קצר, רגוע ונעים</small><i>לבחירת סיפור ←</i></Link>
  return <Link to="/game-of-the-day" className="hp-today hp-today-day"><span className="hp-today-ic">🎲</span><b>משחק היום</b><small>משחק חדש בכל יום</small><i>משחקים ←</i></Link>
}

export default function HomePreview() {
  const [mode, setMode] = useState('site')
  const [q, setQ] = useState('')
  const nav = useNavigate()
  const go = e => { e.preventDefault(); const v = q.trim(); nav(mode === 'site' ? `/search${v ? `?q=${encodeURIComponent(v)}` : ''}` : `/bugapedia${v ? `?q=${encodeURIComponent(v)}` : ''}`) }
  return <div className="hp" dir="rtl">
    {/* 1 — hero: one message, one search, five shortcuts */}
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
      <nav className="hp-quick" aria-label="קיצורים">{QUICK.map(([t, to]) => <Link key={to} to={to}>{t}</Link>)}</nav>
    </section>

    {/* 2 — four doors, compact */}
    <section className="hp-sec">
      <h2 className="hp-h2">למה נכנסתם היום?</h2>
      <div className="hp-doors">{HOME_INTENTS.map(([emoji, title, desc, to, , bg, color, src]) => <Link key={to} to={to} className="hp-door" style={{ '--bg': bg, '--c': color }}>
        <span className="hp-door-art" style={{ backgroundImage: `url(${src})` }} aria-hidden="true" />
        <b>{emoji} {title}</b><small>{desc.split(/[.—]/)[0]}</small><ChevronLeft className="hp-door-go" size={20} aria-hidden="true" />
      </Link>)}</div>
    </section>

    {/* 3 — today: one row instead of separate spotlights, banners and widgets */}
    <section className="hp-sec">
      <h2 className="hp-h2">היום בבוגה</h2>
      <div className="hp-today-row">
        <TodayCard />
        <Link to="/holidays/hanukkah" className="hp-today hp-today-holiday"><span className="hp-today-ic">🕎</span><b>חנוכה מתקרב</b><small>צביעה, סביבון וחידון</small><i>לפעילויות ←</i></Link>
        <Link to="/trivia" className="hp-today hp-today-quiz"><span className="hp-today-ic">❓</span><b>חידון היום</b><small>5 שאלות, דקה אחת</small><i>לחידון ←</i></Link>
      </div>
    </section>

    {/* 4 — eight worlds replace the long card grids */}
    <section className="hp-sec">
      <h2 className="hp-h2">כל העולמות של בוגה</h2>
      <div className="hp-worlds">{WORLDS.map(([e, t, to, d, bg]) => <Link key={to} to={to} className="hp-world" style={{ '--bg': bg }}><span aria-hidden="true">{e}</span><b>{t}</b><small>{d}</small></Link>)}</div>
    </section>

    {/* 5 — one carousel of favourites */}
    <section className="hp-sec">
      <div className="hp-row-head"><h2 className="hp-h2">הכי אהובים השבוע</h2><Link to="/tools">לכל הכלים ←</Link></div>
      <div className="hp-loved">{LOVED.map(([e, t, to, d]) => <Link key={to} to={to} className="hp-card"><span aria-hidden="true">{e}</span><b>{t}</b><small>{d}</small></Link>)}</div>
    </section>

    {/* 6 — news: new on the site + from the blog, side by side */}
    <section className="hp-sec hp-news">
      <div><h2 className="hp-h3">✨ חדש באתר</h2><ul>{NEW.map(([e, t, to]) => <li key={to}><Link to={to}><span aria-hidden="true">{e}</span> {t}</Link></li>)}</ul></div>
      <div><h2 className="hp-h3">📰 מהבלוג</h2><ul>{BLOG.map(([e, t, to]) => <li key={to}><Link to={to}><span aria-hidden="true">{e}</span> {t}</Link></li>)}</ul><Link className="hp-more" to="/blog">לכל הפוסטים ←</Link></div>
    </section>

    {/* 7 — the long explanation folds away */}
    {/* 8 — compact footer (preview hides the current one): 8 headings, 3 links each, one link to the full map */}
    <footer className="hp-footer">
      <div className="hp-foot-news"><b>קצת השראה, פעם בשבוע</b><span>עד שלושה רעיונות למשחק, יצירה וזמן ביחד</span><Link to="/mail-preferences">להרשמה ←</Link></div>
      <div className="hp-foot-cols">{[
        ['🎮 משחקים', [['משחקים אונליין', '/online-games'], ['משחקים למסיבה', '/games/birthday'], ['חדרי בריחה', '/tools/escape-rooms']]],
        ['📚 לומדים', [['הבנת הנקרא', '/learn/reading'], ['לוח הכפל', '/learn/multiplication-table'], ['אנגלית', '/english']]],
        ['🖨️ להדפסה', [['דפי צביעה', '/printables/coloring'], ['דפי עבודה', '/printables/math-worksheets'], ['כוכב השבוע', '/printables/star-of-the-week']]],
        ['🎂 יום הולדת', [['רעיונות', '/ideas'], ['הזמנות', '/invitations'], ['ברכות', '/birthday-greetings']]],
        ['🕯️ שבתות וחגים', [['לוח שנה עברי', '/hebrew-calendar'], ['פרשת השבוע', '/parasha'], ['זמני שבת', '/shabbat-times']]],
        ['🏡 משפחה', [['מה עושים היום?', '/family/what-to-do'], ['סיפורים', '/stories'], ['הבלוג', '/blog']]],
        ['🏫 לכיתה', [['בוגה לייב', '/live'], ['מבחן אונליין', '/classroom/quiz'], ['קיר ברכות', '/thank-you-wall']]],
        ['ℹ️ אודות', [['אודות', '/about'], ['פרטיות', '/privacy'], ['תנאי שימוש', '/terms']]],
      ].map(([h, links]) => <div key={h}><b>{h}</b>{links.map(([t, to]) => <Link key={to} to={to}>{t}</Link>)}</div>)}</div>
      <div className="hp-foot-bottom"><Link to="/tools">🗺️ מפת האתר המלאה</Link><span>עוגה בוגה · האתר שיש בו הכל · חינם ובלי הרשמה</span><a href="mailto:hellobugabuga@gmail.com">✉️ צרו קשר</a></div>
    </footer>
    <details className="hp-about"><summary>על עוגה בוגה — מה יש כאן ולמי זה מתאים</summary><p>עוגה בוגה הוא אתר משחקים, הדפסות ולמידה חינמי לילדים, למשפחות ולמורות — בלי הרשמה ובלי תשלום. (כאן נכנס טקסט ה־SEO ושאלות נפוצות, מקופלים כברירת מחדל.)</p></details>
  </div>
}
