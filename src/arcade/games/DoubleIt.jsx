import { useCallback, useEffect, useRef, useState } from 'react'
import { SIZE, fresh, slide, spawn, canPlay, best as bestTile } from '../logic/merge'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'

const TILE = {
  2: ['#fff6d6', '#1d2233'], 4: ['#ffe9a8', '#1d2233'], 8: ['#ffc56b', '#1d2233'], 16: ['#ff9f5a', '#1d2233'],
  32: ['#ff7a6b', '#fff'], 64: ['#ff5277', '#fff'], 128: ['#7fd8ae', '#1d2233'], 256: ['#4cc3ff', '#1d2233'],
  512: ['#5b6cff', '#fff'], 1024: ['#b26bff', '#fff'], 2048: ['#ffd23f', '#1d2233'],
}
const KEYS = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down' }

export default function DoubleIt({ onReport, onShare }) {
  const [progress, saveProgress] = useProgress('merge-2048', { best: 0 })
  const [grid, setGrid] = useState(() => fresh())
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)
  const [reached, setReached] = useState(false) // 2048 card shown once per game
  const [showWin, setShowWin] = useState(false)
  const [boxRef, box] = useBox()
  const swipe = useRef(null)

  const gridRef = useRef(grid)
  useEffect(() => { gridRef.current = grid }, [grid])
  const go = useCallback(dir => {
    if (over || showWin) return
    const r = slide(gridRef.current, dir)
    if (!r.moved) return
    const next = spawn(r.grid)
    gridRef.current = next
    setGrid(next)
    if (r.gained) setScore(s => s + r.gained)
    if (!canPlay(next)) setOver(true)
    if (!reached && bestTile(next) >= 2048) { setReached(true); setShowWin(true) }
  }, [over, showWin, reached])

  useEffect(() => {
    const onKey = e => { const d = KEYS[e.key]; if (d) { e.preventDefault(); go(d) } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  useEffect(() => {
    if (score > progress.best) saveProgress({ best: score })
  }, [score, progress.best, saveProgress])
  useEffect(() => {
    if (score) onReport?.({ text: `🔢 צברתי ${score} נקודות במכפילים עד 2048 (הגעתי ל־${bestTile(grid)})!` })
  }, [score, grid, onReport])

  const restart = () => { setGrid(fresh()); setScore(0); setOver(false); setReached(false); setShowWin(false) }
  const size = Math.max(220, Math.min(box.w - 16, box.h - 16, 540))
  const gap = Math.round(size * 0.025)
  const cell = (size - gap * (SIZE + 1)) / SIZE
  const pos = (x, y) => `translate(${gap + x * (cell + gap)}px, ${gap + y * (cell + gap)}px)`

  const onDown = e => { swipe.current = { x: e.clientX, y: e.clientY } }
  const onUp = e => {
    const s = swipe.current
    swipe.current = null
    if (!s) return
    const dx = e.clientX - s.x, dy = e.clientY - s.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
    go(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'))
  }

  const tiles = []
  grid.forEach((row, y) => row.forEach((t, x) => { if (t) tiles.push({ ...t, x, y }) }))
  return (
    <div className="arc-game">
      <Hud stats={[['ניקוד', score], ['שיא', Math.max(progress.best, score)]]}>
        <ToolButton onClick={restart} label="משחק חדש">🔄</ToolButton>
      </Hud>
      <div className="arc-field" ref={boxRef}>
        <div className="mg-board" style={{ width: size, height: size }} onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => { swipe.current = null }}
          role="application" aria-label="לוח מספרים. החליקו או השתמשו בחיצי המקלדת">
          {Array.from({ length: SIZE * SIZE }, (_, i) => (
            <div key={i} className="mg-cell" style={{ width: cell, height: cell, transform: pos(i % SIZE, Math.floor(i / SIZE)) }} />
          ))}
          {tiles.map(t => {
            const [bg, fg] = TILE[t.value] || ['#1d2233', '#ffd23f']
            const digits = String(t.value).length
            return (
              <div key={t.id} className={`mg-tile${t.isNew ? ' is-new' : ''}${t.merged ? ' is-merged' : ''}`}
                style={{ width: cell, height: cell, transform: pos(t.x, t.y), '--pos': pos(t.x, t.y), background: bg, color: fg, fontSize: cell * (digits < 3 ? 0.44 : digits < 4 ? 0.36 : 0.28) }}>
                {t.value}
              </div>
            )
          })}
        </div>
      </div>
      {showWin && <EndCard title="🏆 2048!" text="הגעתם למשבצת 2048 — אלופים! אפשר להמשיך ולשבור שיאים."
        primary="▶ ממשיכים לשחק" onPrimary={() => setShowWin(false)}
        secondary="📱 שתפו את ההישג" onSecondary={() => onShare?.('🏆 הגעתי ל־2048 במכפילים של עוגה בוגה! אתם מסוגלים?')} />}
      {over && <EndCard title="😮 הלוח התמלא" text={`צברתם ${score} נקודות${score >= progress.best && score > 0 ? ' — שיא חדש! 🎉' : ''}`}
        primary="🔄 משחק חדש" onPrimary={restart}
        secondary="📱 שתפו את הניקוד" onSecondary={() => onShare?.(`🔢 צברתי ${score} נקודות במכפילים עד 2048! מי עובר אותי?`)} />}
    </div>
  )
}
