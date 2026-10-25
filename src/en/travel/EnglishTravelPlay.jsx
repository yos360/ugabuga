import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { EnglishTravelPage } from './EnglishTravelPage'
import TravelIcon from '../../travel/TravelIcon'
import { EnglishTravelRadio as TravelRadio } from './EnglishTravelRadio'
import { EnglishTravelListen as TravelListen } from './EnglishTravelTalkListen'
import { EnglishTravelCountdown as TravelCountdown } from './EnglishTravelCountdown'
import {EnglishBingoGame as BingoGame} from './EnglishTravelPrintables'
import Memory from '../../arcade/games/Memory'
import SlidingPuzzle from './EnglishSlidingPuzzle'
import Sudoku from './EnglishSudoku'
import ActivitySvg from '../../motor/render/ActivitySvg'
import { freshMaze } from '../../pages/printables/mazeData'
import { CbnSvg, cellKey } from '../../pages/printables/cbnShared'
import { cbnLegend } from '../../data/colorByNumber'
import { CBN_PICTURES } from '../../data/colorByNumber'

function Coloring() {
  const p = CBN_PICTURES[0], [active,setActive] = useState(1), [fills,setFills] = useState({})
  return <><div className="travel-controls">{cbnLegend(p).map(c=><button key={c.num} aria-label={`Color ${c.num}`} aria-pressed={active===c.num} style={{background:c.hex}} onClick={()=>setActive(c.num)}>{c.num}</button>)}</div><CbnSvg p={p} mode="numbers" fills={fills} onPaint={(r,c)=>setFills(f=>({...f,[cellKey(r,c)]:active}))} label="Tap to color the picture"/><button onClick={()=>setFills({})}>Clear coloring</button></>
}
function Maze() {
  const [seed,setSeed] = useState(7001), draw=useRef(null)
  return <><p>Draw a path from the entrance to the exit with your finger.</p><ActivitySvg key={seed} activity={{...freshMaze(0,seed),title:"Find the way"}} interactive draw={draw}/><button onClick={()=>setSeed(s=>s+1)}>New maze</button></>
}
const games = {memory:['🧠','Memory',Memory],puzzle:['🧩','Puzzle',SlidingPuzzle],color:['🎨','Coloring',Coloring],maze:['🌀','Maze',Maze],sudoku:['🔢','Sudoku',Sudoku],story:['📖','Story',TravelRadio],riddle:['💡','Riddle',TravelListen],bingo:['🎯','Screen bingo',BingoGame],countdown:['🚗','Nearly there?',TravelCountdown]}
const tiles=[['picker','🎲','Game'],['color','🎨','Coloring'],['story','📖','Story'],['riddle','💡','Riddle'],['bingo','🎯','Screen bingo'],['countdown','🚗','Nearly there?']]
export default function TravelPlay() {
  const [game,setGame] = useState(''), [locked,setLocked] = useState(false), [hold,setHold] = useState(false), timer=useRef(null), root=useRef(null)
  useEffect(()=>()=>clearTimeout(timer.current),[])
  const lock=async()=>{setLocked(true);try{await root.current?.requestFullscreen?.()}catch{/* optional */}}
  const unlock=()=>{setHold(true);timer.current=setTimeout(()=>{setLocked(false);setHold(false);if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{})},2200)}
  const cancel=()=>{clearTimeout(timer.current);setHold(false)}
  const G=games[game]?.[2]
  return <EnglishTravelPage slug="play" intro="Pick an activity and enjoy it at your own pace. Save the English flight bag first to use it in airplane mode." faq={[{q:'How do we lock the screen for little ones?',a:'Press Child lock. Links out of the activity are hidden. Hold the unlock button for about two seconds to leave. This helps with accidental taps but does not disable the device buttons.'}]}>
    <div ref={root} className={locked?'travel-play travel-locked':'travel-play'}>
      {locked ? <button className="travel-unlock" onPointerDown={unlock} onPointerUp={cancel} onPointerLeave={cancel} onPointerCancel={cancel} onKeyDown={e=>{if(e.key===' '&&!e.repeat)unlock()}} onKeyUp={cancel}>{hold?'Keep holding…':'🔒 Hold to leave'}</button> : <div className="travel-controls"><Link to="/travel/offline">💼 Flight bag</Link><button onClick={lock}>🔒 Child lock</button></div>}
      {game==='picker'?<><button onClick={()=>setGame('')}>← Flight mode</button><div className="travel-grid">{['memory','puzzle','maze','sudoku'].map(id=><button key={id} onClick={()=>setGame(id)}>{games[id][0]} {games[id][1]}</button>)}</div></>:game ? <><button onClick={()=>setGame('')}>← Choose another activity</button><h2>{games[game][0]} {games[game][1]}</h2><div className="travel-game ar-game"><G initialLevel="kids" lang="en" /></div></> : <div className="travel-grid">{tiles.map(([id,icon,title])=><button data-activity={id} className="travel-card" key={id} onClick={()=>setGame(id)}><TravelIcon icon={icon}/><h2>{title}</h2></button>)}</div>}
    </div>
  </EnglishTravelPage>
}
