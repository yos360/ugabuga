import { useEffect, useRef, useState } from 'react'
import { N, EXIT_ROW, LEVEL_COUNT, buildLevel, range, isWon, hint as nextMove } from '../logic/traffic'
import { useBox, useProgress, starsFor } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'

const CAR_COLORS = ['#4cc3ff', '#7fd8ae', '#ffd23f', '#b26bff', '#ffa62b', '#5b6cff', '#c9ced8', '#a5733f', '#ff7ad1', '#45c4ff', '#9be15d', '#ffb8d9', '#8fcaff']
const BORDER = 4

export default function TrafficJam({ onReport, onShare, daily, lang = 'he' }) {
  const en = lang === 'en'
  const [progress, saveProgress] = useProgress('traffic-jam', { level: 1 })
  const [level, setLevel] = useState(daily?.level ?? progress.level)
  const [data, setData] = useState(() => buildLevel(daily?.level ?? progress.level))
  const [cars, setCars] = useState(data.cars)
  const [history, setHistory] = useState([])
  const [drag, setDrag] = useState(null) // { id, off }
  const [hintMove, setHintMove] = useState(null)
  const [won, setWon] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [boxRef, box] = useBox()
  const dragRef = useRef(null)

  const size = Math.max(240, Math.min(box.w - 40, box.h - 16, 520))
  const cell = (size - BORDER * 2) / N
  const pad = cell * 0.07

  const onDown = (e, car) => {
    if (won || leaving) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    const [lo, hi] = range(cars, car.id)
    dragRef.current = { id: car.id, h: car.h, start: car.h ? e.clientX : e.clientY, lo, hi }
    setDrag({ id: car.id, off: 0 })
    setHintMove(null)
  }
  const onMove = e => {
    const d = dragRef.current
    if (!d) return
    const px = (d.h ? e.clientX : e.clientY) - d.start
    d.off = Math.max(d.lo * cell, Math.min(d.hi * cell, px))
    setDrag({ id: d.id, off: d.off })
  }
  const onUp = () => {
    const d = dragRef.current
    dragRef.current = null
    if (!d) return
    const steps = Math.round((d.off || 0) / cell)
    setDrag(null)
    if (!steps) return
    const next = cars.map(c => (c.id === d.id ? (c.h ? { ...c, x: c.x + steps } : { ...c, y: c.y + steps }) : c))
    setHistory(h => [...h, cars])
    setCars(next)
    if (isWon(next)) { setLeaving(true); setTimeout(() => setWon(true), 650) }
  }
  const onCarKey = (e, car) => {
    const steps = car.h ? ({ ArrowLeft: -1, ArrowRight: 1 })[e.key] : ({ ArrowUp: -1, ArrowDown: 1 })[e.key]
    if (!steps) return
    e.preventDefault()
    if (won || leaving || dragRef.current) return
    const [lo, hi] = range(cars, car.id)
    if (steps < lo || steps > hi) return
    const next = cars.map(c => c.id !== car.id ? c : c.h ? { ...c, x: c.x + steps } : { ...c, y: c.y + steps })
    setHistory(h => [...h, cars]); setCars(next); setHintMove(null)
    if (isWon(next)) { setLeaving(true); setTimeout(() => setWon(true), 650) }
  }

  const start = n => {
    const d = buildLevel(n)
    setLevel(n); setData(d); setCars(d.cars); setHistory([]); setWon(false); setLeaving(false); setHintMove(null)
  }
  const undo = () => { if (!history.length || leaving) return; setCars(history.at(-1)); setHistory(h => h.slice(0, -1)); setHintMove(null) }
  const showHint = () => { const m = nextMove(cars); if (m) setHintMove(m) }

  const moves = history.length
  const stars = starsFor(moves, data.best, Math.ceil(data.best * 1.5))
  useEffect(() => {
    if (!won) return
    if (daily) { daily.finish({ text: en ? `🚚 Traffic Jam: I freed the truck in ${moves} moves (best: ${data.best})` : `🚚 פקק תנועה: שחררתי את המשאית ב־${moves} מהלכים (הכי טוב: ${data.best})`, score: moves, won: true }); return }
    saveProgress(p => ({ level: Math.max(p.level, level + 1) }))
    onReport?.({ text: en ? `🚚 I freed the ice cream truck on level ${level} of Traffic Jam in ${moves} moves!` : `🚚 שחררתי את משאית הגלידה בשלב ${level} של פקק תנועה ב־${moves} מהלכים!` })
  }, [won, level, moves, saveProgress, onReport, daily, data.best, en])

  return (
    <div className="arc-game">
      <Hud stats={[[en ? 'Level' : 'שלב', level], [en ? 'Moves' : 'מהלכים', moves], [en ? 'Best possible' : 'שיא אפשרי', data.best]]}>
        <ToolButton onClick={undo} disabled={!history.length} label={en ? 'Undo' : 'ביטול מהלך'}>↩</ToolButton>
        <ToolButton onClick={showHint} label={en ? 'Hint' : 'רמז'}>💡</ToolButton>
        <ToolButton onClick={() => start(level)} label={en ? 'Restart level' : 'שלב מחדש'}>🔄</ToolButton>
      </Hud>
      <div className="arc-field" ref={boxRef}>
        <div className="tj-wrap">
          <div className="tj-board" style={{ width: size, height: size, backgroundSize: `${cell}px ${cell}px`, backgroundPosition: '-1px -1px' }} aria-label={en ? 'Parking lot, 6 by 6. Drag cars, or pick a car and move it with the arrow keys' : 'חניון 6 על 6. גררו מכוניות או בחרו מכונית והזיזו בחיצי המקלדת'}>
            <div className="tj-gate" style={{ top: EXIT_ROW * cell + pad, height: cell - pad * 2 }} aria-hidden="true" />
            {cars.map(c => {
              const isDrag = drag?.id === c.id
              const out = leaving && c.id === 0
              const off = isDrag ? drag.off : 0
              const x = c.x * cell + pad + (c.h ? off : 0) + (out ? cell * 3 : 0)
              const y = c.y * cell + pad + (c.h ? 0 : off)
              const w = (c.h ? c.len : 1) * cell - pad * 2, h = (c.h ? 1 : c.len) * cell - pad * 2
              const hinted = hintMove?.id === c.id
              return (
                <button type="button" key={c.id} aria-label={c.id === 0 ? (en ? 'Ice cream truck' : 'משאית הגלידה') : (en ? `Car ${c.id}` : `מכונית ${c.id}`)}
                  title={c.h ? (en ? 'Move with the left and right arrows' : 'הזזה בחיצים ימינה ושמאלה') : (en ? 'Move with the up and down arrows' : 'הזזה בחיצים למעלה ולמטה')} onKeyDown={e => onCarKey(e, c)}
                  className={`tj-car${isDrag ? ' is-drag' : ''}${hinted ? ' is-hint' : ''}${out ? ' is-out' : ''}`}
                  style={{ width: w, height: h, transform: `translate(${x}px, ${y}px)`, left: 0, top: 0, background: c.id === 0 ? '#ff5c8a' : CAR_COLORS[(c.id - 1) % CAR_COLORS.length], '--emoji': `${cell * 0.42}px`, opacity: out ? 0 : 1 }}
                  onPointerDown={e => onDown(e, c)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { dragRef.current = null; setDrag(null) }}>
                  <span aria-hidden="true">{c.id === 0 ? '🍦' : c.len === 3 ? (c.h ? '🚌' : '🚛') : ''}</span>
                </button>
              )
            })}
          </div>
        </div>
        {hintMove && <div className="arc-toast" key={`${hintMove.id}-${hintMove.to}`}>💡 {en ? 'Move the flashing car ' : 'הזיזו את המכונית המהבהבת '}{hintMove.to > (cars[hintMove.id].h ? cars[hintMove.id].x : cars[hintMove.id].y) ? (cars[hintMove.id].h ? (en ? 'right' : 'ימינה') : (en ? 'down' : 'למטה')) : (cars[hintMove.id].h ? (en ? 'left' : 'שמאלה') : (en ? 'up' : 'למעלה'))}</div>}
      </div>
      {won && !daily && <EndCard lang={lang} title={stars === 3 ? (en ? '🎉 Perfect!' : '🎉 מושלם!') : (en ? '🎉 The truck is out!' : '🎉 המשאית יצאה!')} stars={stars}
        text={en ? `Solved in ${moves} moves (fewest possible: ${data.best}).${level >= LEVEL_COUNT ? ' You finished every level. Starting a new round!' : ''}` : `פתרתם ב־${moves} מהלכים (הכי מעט אפשרי: ${data.best}).${level >= LEVEL_COUNT ? ' סיימתם את כל השלבים — מתחילים סבב חדש!' : ''}`}
        primary={en ? '▶ Next level' : '▶ לשלב הבא'} onPrimary={() => start(level + 1)}
        secondary={en ? '📱 Share your score' : '📱 שתפו את ההישג'} onSecondary={() => onShare?.(en ? `🚚 I solved level ${level} of Traffic Jam in ${moves} moves! Can you do it in fewer?` : `🚚 פתרתי את שלב ${level} בפקק תנועה ב־${moves} מהלכים! תצליחו בפחות?`)} />}
    </div>
  )
}
