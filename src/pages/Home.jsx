import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import SEO from '../components/ui/SEO'
import './Home.css'

function Art({ crop, className = '' }) {
  const [x,y,w,h] = crop
  return <span aria-hidden="true" className={`home-art ${className}`} style={{aspectRatio:`${w}/${h}`,backgroundSize:`${1536/w*100}% ${1024/h*100}%`,backgroundPosition:`${x/(1536-w)*100}% ${y/(1024-h)*100}%`}} />
}
const doors = [
  ['לשחק','משחקים מוכנים\nכבר מחכים לכם','/games',[124,268,188,176],'#dffbef','#23c89f'],
  ['ליצור משחק','הפכו רעיונות\nלמשחקים אמיתיים','/tools',[577,257,191,187],'#f3eaff','#a775ed'],
  ['להדפיס','קבצים מוכנים\nלהדפסה ביתית','/printables',[1022,272,187,162],'#ffe7e4','#ff7d85'],
  ['חידות וטריוויה','שאלות, אתגרים\nוידע מעולם ומלואו','/games/trivia',[126,475,188,176],'#fff6cc','#edbd15'],
  ['חדרי בריחה','חוויית בריחה\nמוכנה להפעלה','/tools/escape-rooms',[575,484,168,165],'#dff2ff','#28a4ef'],
  ['לכיתה','משחקים ותכנים\nלמורים ולתלמידים','/games/classroom',[1019,481,173,170],'#ddfaf3','#26c5b0'],
]
const games = [
  ['תחנת החלל התקועה','חדר בריחה לנוער','/tools/escape-rooms?room=space-station',[116,826,232,93]],
  ['יוצרים ציד אוצרות','מסלול רמזים משלכם','/tools/scavenger-hunt-maker',[387,826,228,93]],
  ['תיק הבלש הסודי','חדר בריחה למבוגרים','/tools/escape-rooms?room=detective-case',[654,826,230,93]],
  ['טריוויה לכל המשפחה','בוחרים נושא, גיל וקושי','/tools/trivia-quiz',[923,826,230,93]],
  ['תעלומת העוגה הנעלמת','חדר בריחה לילדים','/tools/escape-rooms?room=lost-cake',[1190,826,231,93]],
]
export default function Home() {
  const [query,setQuery] = useState('')
  const list = useRef(null)
  const navigate = useNavigate()
  return <><SEO path="/" /><div className="home-v2">
    <section className="home-intro"><h1>מה בא לכם לעשות ביום הולדת?</h1><p>משחקים, יצירה, רעיונות וחוויות שיהפכו כל יום הולדת לחגיגה בלתי נשכחת.</p></section>
    <section className="home-doors" aria-label="בוחרים פעילות">{doors.map(([title,description,to,crop,bg,color])=><Link className="home-door" to={to} key={title} style={{'--door-bg':bg,'--door-color':color}}><div className="home-door-copy"><h2>{title}</h2><p>{description}</p></div><Art crop={crop} className="home-door-art"/><span className="home-door-arrow"><ChevronRight aria-hidden="true"/></span></Link>)}</section>
    <form className="home-search" role="search" onSubmit={e=>{e.preventDefault();navigate('/games'+(query.trim()?'?q='+encodeURIComponent(query.trim()):''))}}><button aria-label="חיפוש משחקים"><Search size={29}/></button><input aria-label="חפשו משחק עכשיו" placeholder="חפשו משחק עכשיו" type="search" value={query} onChange={e=>setQuery(e.target.value)}/></form>
    <section className="home-featured"><h2>מתחילים לשחק</h2><div className="home-carousel-wrap"><button className="home-scroll home-scroll-left" aria-label="גלילה שמאלה" onClick={()=>list.current.scrollBy({left:-270,behavior:'smooth'})}><ChevronLeft/></button><div ref={list} className="home-games">{games.map(([title,description,to,crop])=><Link to={to} className="home-game" key={to}><Art crop={crop}/><h3>{title}</h3><p>{description}</p></Link>)}</div><button className="home-scroll home-scroll-right" aria-label="גלילה ימינה" onClick={()=>list.current.scrollBy({left:270,behavior:'smooth'})}><ChevronRight/></button></div></section>
    <section className="home-extra"><h2>משחקי BUGA המרכזיים</h2><div className="home-extras"><Link to="/tools/truth-or-buga"><h3>🎭 אמת או בוגה</h3><p>אמת או שקר, לבד או תחרות קבוצות.</p></Link><Link to="/tools/eretz-ir"><h3>🗺️ ארץ־עיר</h3><p>אות אקראית, טיימר וניקוד.</p></Link><Link to="/tools/bingo-maker"><h3>🎟️ בינגו</h3><p>כרטיסיות מוכנות ומותאמות להדפסה.</p></Link></div></section>
  </div></>
}
