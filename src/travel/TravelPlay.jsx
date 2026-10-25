import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { TravelPage } from './TravelPage'
import Memory from '../arcade/games/Memory'
import SlidingPuzzle from '../arcade/games/SlidingPuzzle'
import Sudoku from '../arcade/games/Sudoku'
import ActivitySvg from '../motor/render/ActivitySvg'
import { freshMaze } from '../pages/printables/mazeData'
import { CbnSvg, Legend, cellKey } from '../pages/printables/cbnShared'
import { CBN_PICTURES } from '../data/colorByNumber'

function Coloring() {
  const p = CBN_PICTURES[0], [active,setActive] = useState(1), [fills,setFills] = useState({})
  return <><Legend p={p} mode="numbers" active={active} onPick={setActive}/><CbnSvg p={p} mode="numbers" fills={fills} onPaint={(r,c)=>setFills(f=>({...f,[cellKey(r,c)]:active}))} label="ציור לצביעה במגע"/><button onClick={()=>setFills({})}>מנקים ציור</button></>
}
function Maze() {
  const [seed,setSeed] = useState(7001), draw=useRef(null)
  return <><p>מציירים באצבע דרך מהכניסה ליציאה.</p><ActivitySvg key={seed} activity={freshMaze(0,seed)} interactive draw={draw}/><button onClick={()=>setSeed(s=>s+1)}>מבוך חדש</button></>
}
const games = {memory:['🧠','זיכרון',Memory],puzzle:['🧩','פאזל',SlidingPuzzle],color:['🎨','צביעה',Coloring],maze:['🌀','מבוך',Maze],sudoku:['🔢','סודוקו',Sudoku]}
export default function TravelPlay() {
  const [game,setGame] = useState(''), [locked,setLocked] = useState(false), [hold,setHold] = useState(false), timer=useRef(null), root=useRef(null)
  useEffect(()=>()=>clearTimeout(timer.current),[])
  const lock=async()=>{setLocked(true);try{await root.current?.requestFullscreen?.()}catch{/* optional */}}
  const unlock=()=>{setHold(true);timer.current=setTimeout(()=>{setLocked(false);setHold(false);if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{})},2200)}
  const cancel=()=>{clearTimeout(timer.current);setHold(false)}
  const G=games[game]?.[2]
  return <TravelPage title="מסך הטיסה של בוגה" path="/travel/play" intro="בוחרים פעילות אחת ונהנים בקצב שלכם. כדי שהמשחקים יעבדו במצב טיסה, שומרים קודם את תיק הטיסה." faq={[{q:'איך נועלים את המסך לקטנים?',a:'לחצו על מנעול הילדים. הניווט החוצה מוסתר, ולשחרור מחזיקים את כפתור הפתיחה כשתי שניות. זו עזרה נגד נגיעות מקריות, ולא חסימה של כפתורי המכשיר.'}]}>
    <div ref={root} className={locked?'travel-play travel-locked':'travel-play'}>
      {locked ? <button className="travel-unlock" onPointerDown={unlock} onPointerUp={cancel} onPointerLeave={cancel} onPointerCancel={cancel} onKeyDown={e=>{if(e.key===' '&&!e.repeat)unlock()}} onKeyUp={cancel}>{hold?'ממשיכים להחזיק…':'🔒 לחצו והחזיקו כדי לצאת'}</button> : <div className="travel-controls"><Link to="/travel/offline">💼 לתיק הטיסה</Link><button onClick={lock}>🔒 מנעול ילדים</button></div>}
      {game ? <><button onClick={()=>setGame('')}>← בחירת פעילות אחרת</button><h2>{games[game][0]} {games[game][1]}</h2><div className="travel-game ar-game"><G initialLevel="kids" /></div></> : <div className="travel-grid">{Object.entries(games).map(([id,[icon,title]])=><button className="travel-card" key={id} onClick={()=>setGame(id)}><span>{icon}</span><h2>{title}</h2></button>)}</div>}
    </div>
  </TravelPage>
}
