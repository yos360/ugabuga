import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Search, Share2 } from 'lucide-react'
import SEO from '../components/ui/SEO'
import SeoBody, { faqSchema } from '../components/ui/SeoBody'
import './Home.css'
import './home-responsive.css'

function Art({ crop, src, className = '' }) {
  const [x,y,w,h] = crop
  return <span aria-hidden="true" className={`home-art ${className}`} style={src ? {backgroundImage:`url(${src})`, backgroundSize:'contain', backgroundPosition:'center bottom', aspectRatio:'1 / 1'} : {aspectRatio:`${w}/${h}`,backgroundSize:`${1536/w*100}% ${1024/h*100}%`,backgroundPosition:`${x/(1536-w)*100}% ${y/(1024-h)*100}%`}} />
}
const doors = [
  ['יום הולדת','משחקים, כלים וספקים —\nהכול לחגיגה מושלמת.','/birthday',[124,268,188,176],'#ffe7e4','#ff6f7b','/images/home-birthday-girl.webp?v=2'],
  ['משחקים','מצאו משחק לפי גיל,\nזמן, משתתפים וציוד.','/games',[577,257,191,187],'#dffbef','#23c89f','/images/home-detective-boy.webp?v=2'],
  ['יוצרים','דפי הדפסה, תשבצים\nועיצוב משלכם.','/create',[1022,272,187,162],'#f3eaff','#a775ed','/images/home-printer.webp?v=2'],
  ['לכיתה','משחקים, עבודת שורשים\nודפי פעילות למורים.','/classroom',[1019,481,173,170],'#dff2ff','#28a4ef','/images/home-schoolgirl.webp?v=2'],
]
const games = [
  ['תחנת החלל התקועה','חדר בריחה לנוער','/tools/escape-rooms?room=space-station',[116,826,232,93]],
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
const homeRelated = [ { label: 'כל המשחקים', href: '/games' }, { label: 'עולם ההשראה', href: '/ideas' }, { label: 'מתחם יוצרים', href: '/create' } ]

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
      navigator.clipboard.writeText(window.location.href)
      alert('הקישור הועתק ללוח')
    }
  }

  return <><SEO path="/" title="עוגה בוגה — משחקים והדפסות חינם לילדים ולמורות" description='עוגה בוגה (BUGA) — מעל 100 משחקים, כלים להדפסה וחדרי בריחה בעברית, חינם וללא הרשמה, ליום הולדת, לכיתה ולבית.' structuredData={faqSchema(homeFaq)} /><div className="home-v2">
    <section className="home-intro">
      <h1>מה בא לכם לעשות היום?</h1>
      <p>משחקים, יצירה, דפי פעילות וכלים ליום הולדת, לכיתה ולבית — בעברית ובמקום אחד. עוגה בוגה (UGABUGA) מציעה מעל 100 משחקים ופעילויות בחינם לכל גיל וגודל קבוצה.</p>
      <button onClick={shareWebsite} className="share-button" aria-label="שיתוף האתר">
        <Share2 size={20} />
        <span>שיתוף</span>
      </button>
    </section>
    <section className="home-doors" aria-label="בוחרים פעילות">{doors.map(([title,description,to,crop,bg,color,src], index)=><Link className="home-door" to={to} key={title} style={{'--door-bg':bg,'--door-color':color}}><div className="home-door-copy"><h2>{title}</h2><p>{description}</p></div><Art crop={crop} src={src} className={`home-door-art door-art-${index}`} /><span className="home-door-arrow"><ChevronLeft aria-hidden="true"/></span></Link>)}</section>
    <form className="home-search" role="search" onSubmit={e=>{e.preventDefault();navigate('/games'+(query.trim()?'?q='+encodeURIComponent(query.trim()):''))}}><button aria-label="חיפוש משחקים"><Search size={29}/></button><input aria-label="חפשו משחק עכשיו" placeholder="חפשו משחק עכשיו" type="search" value={query} onChange={e=>setQuery(e.target.value)}/></form>
    <section className="home-featured">
      <h2>משחקים מוחזקים</h2>
      <div className="home-carousel-wrap">
        <button className="home-scroll home-scroll-left" aria-label="גלילה שמאלה" onClick={()=>list.current.scrollBy({left:-270,behavior:'smooth'})}><ChevronLeft/></button>
        <div ref={list} className="home-games">{games.map(([title,description,to,crop])=><Link to={to} className="home-game" key={to}><Art crop={crop}/><h3>{title}</h3><p>{description}</p></Link>)}</div>
        <button className="home-scroll home-scroll-right" aria-label="גלילה ימינה" onClick={()=>list.current.scrollBy({left:270,behavior:'smooth'})}><ChevronRight/></button>
      </div>
    </section>
    <section className="home-extra">
      <h2>משחקי BUGA הפופולריים</h2>
      <div className="home-extras">
        <Link to="/tools/truth-or-buga"><h3>🎭 אמת או בוגה</h3><p>אמת או שקר, לבד או תחרות קבוצות.</p></Link>
        <Link to="/tools/eretz-ir"><h3>🗺️ ארץ־עיר</h3><p>אות אקראית, טיימר וניקוד.</p></Link>
        <Link to="/tools/bingo-maker"><h3>🎟️ בינגו</h3><p>כרטיסיות מוכנות ומותאמות להדפסה.</p></Link>
      </div>
    </section>
    <section className="home-extra">
      <SeoBody paragraphs={homeBody} faq={homeFaq} related={homeRelated} />
    </section>
  </div></>
}
