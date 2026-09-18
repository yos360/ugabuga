import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import SEO from '../components/ui/SEO'
import './Home.css'
import './home-responsive.css'

function Art({ crop, src, className = '' }) {
  const [x,y,w,h] = crop
  return <span aria-hidden="true" className={`home-art ${className}`} style={src ? {backgroundImage:`url(${src})`, backgroundSize:'contain', backgroundPosition:'center bottom', aspectRatio:'1 / 1'} : {aspectRatio:`${w}/${h}`,backgroundSize:`${1536/w*100}% ${1024/h*100}%`,backgroundPosition:`${x/(1536-w)*100}% ${y/(1024-h)*100}%`}} />
}
const doors = [
  ['יום הולדת','משחקים, רעיונות וכלים\nשיעזרו לכם להרים חגיגה.','/games/birthday',[124,268,188,176],'#ffe7e4','#ff6f7b','/images/home-birthday-girl.png'],
  ['משחקים','מצאו משחק לפי גיל,\nזמן, משתתפים וציוד.','/games',[577,257,191,187],'#dffbef','#23c89f','/images/home-detective-boy.png'],
  ['יוצרים','צרו משחקים, פעילויות\nודברים אישיים משלכם.','/tools',[1022,272,187,162],'#f3eaff','#a775ed','/images/home-printer.png'],
  ['לכיתה','משחקים וכלים למורים,\nמדריכים וצהרונים.','/games/classroom',[1019,481,173,170],'#dff2ff','#28a4ef','/images/home-schoolgirl.png'],
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
    <section className="home-intro"><h1>מה משחקים היום?</h1><p>משחקים, פעילויות וכלים ליום הולדת, לכיתה ולבית — בעברית ובמקום אחד.</p></section>
    <section className="home-doors" aria-label="בוחרים פעילות">{doors.map(([title,description,to,crop,bg,color,src], index)=><Link className="home-door" to={to} key={title} style={{'--door-bg':bg,'--door-color':color}}><div className="home-door-copy"><h2>{title}</h2><p>{description}</p></div><Art crop={crop} src={src} className={`home-door-art door-art-${index}`} /><span className="home-door-arrow"><ChevronRight aria-hidden="true"/></span></Link>)}</section>
    <form className="home-search" role="search" onSubmit={e=>{e.preventDefault();navigate('/games'+(query.trim()?'?q='+encodeURIComponent(query.trim()):''))}}><button aria-label="חיפוש משחקים"><Search size={29}/></button><input aria-label="חפשו משחק עכשיו" placeholder="חפשו משחק עכשיו" type="search" value={query} onChange={e=>setQuery(e.target.value)}/></form>
    <section className="home-featured"><h2>מתחילים לשחק</h2><div className="home-carousel-wrap"><button className="home-scroll home-scroll-left" aria-label="גלילה שמאלה" onClick={()=>list.current.scrollBy({left:-270,behavior:'smooth'})}><ChevronLeft/></button><div ref={list} className="home-games">{games.map(([title,description,to,crop])=><Link to={to} className="home-game" key={to}><Art crop={crop}/><h3>{title}</h3><p>{description}</p></Link>)}</div><button className="home-scroll home-scroll-right" aria-label="גלילה ימינה" onClick={()=>list.current.scrollBy({left:270,behavior:'smooth'})}><ChevronRight/></button></div></section>
    <section className="home-extra"><h2>משחקי BUGA המרכזיים</h2><div className="home-extras"><Link to="/tools/truth-or-buga"><h3>🎭 אמת או בוגה</h3><p>אמת או שקר, לבד או תחרות קבוצות.</p></Link><Link to="/tools/eretz-ir"><h3>🗺️ ארץ־עיר</h3><p>אות אקראית, טיימר וניקוד.</p></Link><Link to="/tools/bingo-maker"><h3>🎟️ בינגו</h3><p>כרטיסיות מוכנות ומותאמות להדפסה.</p></Link></div></section>
  </div></>
}
