import { useEffect, useRef, useState } from 'react'
import { start as startSnake, turn, step, speedFor } from '../logic/snake'
import { useBox, useProgress, useSwipe, useArrowKeys } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'

const COLS = 17

export default function Snake({ onReport, onShare }) {
  const [progress, saveProgress] = useProgress('snake', { best: 0, walls: false })
  const [boxRef, box] = useBox()
  const fieldRef = useRef(null)
  const canvasRef = useRef(null)
  const [walls, setWalls] = useState(progress.walls)
  const [running, setRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [dead, setDead] = useState(false)
  const [record, setRecord] = useState(false)
  const game = useRef(null)

  // board size: 17 columns, rows to fill the space
  const cell = box.w ? Math.max(14, Math.min((box.w - 12) / COLS, 40)) : 20
  const rows = box.h ? Math.max(10, Math.min(Math.floor((box.h - 12) / cell), 28)) : 18
  const W = COLS * cell, H = rows * cell

  const reset = () => { game.current = startSnake(COLS, rows); setScore(0); setDead(false); setRecord(false); setRunning(false); draw() }
  // new board whenever the size changes before the game starts
  useEffect(() => {
    if (!box.w) return
    if (!game.current || (!running && !dead && game.current.h !== rows)) game.current = startSnake(COLS, rows)
    draw()
  })

  function draw() {
    const cv = canvasRef.current, s = game.current
    if (!cv || !s) return
    const dpr = window.devicePixelRatio || 1
    if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr) }
    const ctx = cv.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) {
      ctx.fillStyle = (x + y) % 2 ? '#b8e6a0' : '#c6eeaf'
      ctx.fillRect(x * cell, y * cell, cell, cell)
    }
    if (s.apple) {
      ctx.font = `${cell * 0.9}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText('🍎', s.apple[0] * cell + cell / 2, s.apple[1] * cell + cell / 2 + 1)
    }
    s.body.forEach(([x, y], i) => {
      const r = cell * 0.18, pad = i ? cell * 0.08 : cell * 0.02
      ctx.fillStyle = s.dead ? '#9ca3af' : i ? (i % 2 ? '#2f9e6b' : '#38b27a') : '#1f7a52'
      ctx.beginPath(); ctx.roundRect(x * cell + pad, y * cell + pad, cell - pad * 2, cell - pad * 2, r); ctx.fill()
    })
    // eyes
    const [hx, hy] = s.body[0]
    const [dx, dy] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[s.dir]
    ctx.fillStyle = '#fff'
    for (const side of [-1, 1]) {
      const ex = hx * cell + cell / 2 + dx * cell * 0.18 + (dy ? side * cell * 0.2 : 0)
      const ey = hy * cell + cell / 2 + dy * cell * 0.18 + (dx ? side * cell * 0.2 : 0)
      ctx.beginPath(); ctx.arc(ex, ey, cell * 0.12, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#1d2233'; ctx.beginPath(); ctx.arc(ex + dx * cell * 0.04, ey + dy * cell * 0.04, cell * 0.06, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'
    }
  }

  // game loop
  useEffect(() => {
    if (!running) return undefined
    let t = 0
    const tick = () => {
      const s = step(game.current, walls)
      game.current = s
      draw()
      if (s.score !== score) setScore(s.score)
      if (s.dead) { setRunning(false); setDead(true); setRecord(s.score > progress.best); navigator.vibrate?.(80); return }
      t = setTimeout(tick, speedFor(s.score))
    }
    t = setTimeout(tick, speedFor(game.current.score))
    return () => clearTimeout(t)
  })

  useEffect(() => {
    if (!dead) return
    saveProgress(p => ({ best: Math.max(p.best, score) }))
    if (score) onReport?.({ text: `🐍 הנחש שלי אכל ${score} תפוחים!` })
  }, [dead, score, saveProgress, onReport])

  const go = dir => {
    if (!game.current || dead) return
    game.current = turn(game.current, dir)
    if (!running) setRunning(true)
  }
  useSwipe(fieldRef, go, 18)
  useArrowKeys(go)
  const toggleWalls = () => { const w = !walls; setWalls(w); saveProgress({ walls: w }); reset() }

  return (
    <div className="arc-game">
      <Hud stats={[['🍎', score], ['שיא', Math.max(progress.best, score)]]}>
        <ToolButton onClick={() => setRunning(r => !r)} disabled={dead || !game.current} label={running ? 'הפסקה' : 'המשך'}>{running ? '⏸️' : '▶️'}</ToolButton>
        <ToolButton onClick={toggleWalls} label={walls ? 'קירות סגורים — לחצו לפתוח' : 'קירות פתוחים — לחצו לסגור'}>{walls ? '🧱' : '🌀'}</ToolButton>
        <ToolButton onClick={reset} label="משחק חדש">🔄</ToolButton>
      </Hud>
      <div className="arc-field sn-field" ref={el => { boxRef.current = el; fieldRef.current = el }}>
        <canvas ref={canvasRef} className="sn-canvas" style={{ width: W, height: H }} aria-label="לוח הנחש. החליקו או לחצו על החצים כדי לכוון" role="img" />
        {!running && !dead && <div className="sn-start">{score ? '⏸ בהפסקה — החליקו כדי להמשיך' : '👆 החליקו לכל כיוון (או חיצי המקלדת) כדי להתחיל'}<br /><small>{walls ? '🧱 קירות סגורים: אסור לגעת בקיר' : '🌀 קירות פתוחים: עוברים מצד לצד'}</small></div>}
      </div>
      <div className="sn-pad" aria-label="חצים">
        <button type="button" className="arc-tool" onClick={() => go('up')} aria-label="למעלה">⬆️</button>
        <div>
          <button type="button" className="arc-tool" onClick={() => go('right')} aria-label="ימינה">➡️</button>
          <button type="button" className="arc-tool" onClick={() => go('down')} aria-label="למטה">⬇️</button>
          <button type="button" className="arc-tool" onClick={() => go('left')} aria-label="שמאלה">⬅️</button>
        </div>
      </div>
      {dead && <EndCard title="🐍 אוי, הנחש נתקע!" text={`אכלתם ${score} תפוחים${record ? ' — שיא חדש! 🎉' : ''}.`}
        primary="🔄 עוד סיבוב" onPrimary={reset}
        secondary="📱 שתפו את הניקוד" onSecondary={() => onShare?.(`🐍 הנחש שלי אכל ${score} תפוחים! מי עובר אותי?`)} />}
    </div>
  )
}
