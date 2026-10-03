import { useEffect, useRef, useState } from 'react'
import { N, EXIT_ROW, LEVEL_COUNT, buildLevel, range, isWon, hint as nextMove } from '../logic/traffic'
import { useBox, useProgress, starsFor } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'

const CAR_COLORS = ['#4cc3ff', '#7fd8ae', '#ffd23f', '#b26bff', '#ffa62b', '#5b6cff', '#c9ced8', '#a5733f', '#ff7ad1', '#45c4ff', '#9be15d', '#ffb8d9', '#8fcaff']
const BORDER = 4

export default function TrafficJam({ onReport, onShare }) {
  const [progress, saveProgress] = useProgress('traffic-jam', { level: 1 })
  const [level, setLevel] = useState(progress.level)
  const [data, setData] = useState(() => buildLevel(progress.level))
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
    saveProgress(p => ({ level: Math.max(p.level, level + 1) }))
    onReport?.({ text: `🚚 שחררתי את משאית הגלידה בשלב ${level} של פקק תנועה ב־${moves} מהלכים!` })
  }, [won, level, moves, saveProgress, onReport])

  return (
    <div className="arc-game">
      <Hud stats={[['שלב', level], ['מהלכים', moves], ['שיא אפשרי', data.best]]}>
        <ToolButton onClick={undo} disabled={!history.length} label="ביטול מהלך">↩</ToolButton>
        <ToolButton onClick={showHint} label="רמז">💡</ToolButton>
        <ToolButton onClick={() => start(level)} label="שלב מחדש">🔄</ToolButton>
      </Hud>
      <div className="arc-field" ref={boxRef}>
        <div className="tj-wrap">
          <div className="tj-board" style={{ width: size, height: size, backgroundSize: `${cell}px ${cell}px`, backgroundPosition: '-1px -1px' }} aria-label="חניון 6 על 6. גררו מכוניות כדי לפנות דרך למשאית הגלידה">
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
                <button type="button" key={c.id} aria-label={c.id === 0 ? 'משאית הגלידה' : `מכונית ${c.id}`}
                  className={`tj-car${isDrag ? ' is-drag' : ''}${hinted ? ' is-hint' : ''}${out ? ' is-out' : ''}`}
                  style={{ width: w, height: h, transform: `translate(${x}px, ${y}px)`, left: 0, top: 0, background: c.id === 0 ? '#ff5c8a' : CAR_COLORS[(c.id - 1) % CAR_COLORS.length], '--emoji': `${cell * 0.42}px`, opacity: out ? 0 : 1 }}
                  onPointerDown={e => onDown(e, c)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { dragRef.current = null; setDrag(null) }}>
                  <span aria-hidden="true">{c.id === 0 ? '🍦' : c.len === 3 ? (c.h ? '🚌' : '🚛') : ''}</span>
                </button>
              )
            })}
          </div>
        </div>
        {hintMove && <div className="arc-toast" key={`${hintMove.id}-${hintMove.to}`}>💡 הזיזו את המכונית המהבהבת {hintMove.to > (cars[hintMove.id].h ? cars[hintMove.id].x : cars[hintMove.id].y) ? (cars[hintMove.id].h ? 'ימינה' : 'למטה') : (cars[hintMove.id].h ? 'שמאלה' : 'למעלה')}</div>}
      </div>
      {won && <EndCard title={stars === 3 ? '🎉 מושלם!' : '🎉 המשאית יצאה!'} stars={stars}
        text={`פתרתם ב־${moves} מהלכים (הכי מעט אפשרי: ${data.best}).${level >= LEVEL_COUNT ? ' סיימתם את כל השלבים — מתחילים סבב חדש!' : ''}`}
        primary="▶ לשלב הבא" onPrimary={() => start(level + 1)}
        secondary="📱 שתפו את ההישג" onSecondary={() => onShare?.(`🚚 פתרתי את שלב ${level} בפקק תנועה ב־${moves} מהלכים! תצליחו בפחות?`)} />}
    </div>
  )
}
