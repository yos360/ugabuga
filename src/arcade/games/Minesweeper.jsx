import { useEffect, useRef, useState } from 'react'
import { LEVELS, empty, place, open, chord, toggleFlag, isWon, flagsLeft } from '../logic/mines'
import { rng } from '../logic/rng'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'

const NUM_COLORS = ['', '#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#b45309', '#0891b2', '#1d2233', '#6b7280']
const LONG_PRESS = 380

export default function Minesweeper({ onReport, onShare, daily }) {
  const [progress, saveProgress] = useProgress('minesweeper', { level: 'easy', best: {} })
  const [levelId, setLevelId] = useState(daily?.level || progress.level)
  const [tries, setTries] = useState(1)
  const level = LEVELS.find(l => l.id === levelId) || LEVELS[0]
  const [b, setB] = useState(() => empty(level.w, level.h))
  const [flagMode, setFlagMode] = useState(false)
  const [time, setTime] = useState(0)
  const [boxRef, box] = useBox()
  const press = useRef(null)
  const [showLost, setShowLost] = useState(false)
  const won = isWon(b)
  const running = b.placed && !won && !b.lost

  useEffect(() => {
    if (!running) return undefined
    const t = setInterval(() => setTime(x => x + 1), 1000)
    return () => clearInterval(t)
  }, [running])

  useEffect(() => {
    if (!b.lost) return undefined
    const t = setTimeout(() => setShowLost(true), 1300) // let them see where the mines were
    return () => clearTimeout(t)
  }, [b.lost])

  useEffect(() => {
    if (!won) return
    if (daily) { daily.finish({ text: `💣 שולה מוקשים: ניקיתי את השדה תוך ${time} שניות${tries > 1 ? ` (ניסיון ${tries})` : ' בניסיון הראשון!'}`, score: time + (tries - 1) * 60, won: true }); return }
    saveProgress(p => ({ best: { ...p.best, [levelId]: p.best[levelId] ? Math.min(p.best[levelId], time) : time } }))
    onReport?.({ text: `💣 ניקיתי את שדה המוקשים ברמה ${level.name} תוך ${time} שניות!` })
  }, [won, levelId, level.name, time, saveProgress, onReport, daily, tries])

  const start = id => {
    const l = LEVELS.find(x => x.id === id)
    setLevelId(id); if (!daily) saveProgress({ level: id }); else setTries(t => t + 1)
    setB(empty(l.w, l.h)); setTime(0); setFlagMode(false); setShowLost(false)
  }
  const reveal = i => {
    if (won || b.lost) return
    const c = b.cells[i]
    if (c.open) { setB(chord(b, i)); return }
    if (flagMode) { setB(toggleFlag(b, i)); return }
    if (c.flag) return
    const base = b.placed ? b : place(b, level.mines, i, daily ? rng(daily.seed + i) : Math.random)
    setB(open(base, i))
  }
  const flag = i => { if (!won && !b.lost && b.placed) setB(toggleFlag(b, i)) }

  // tap = open, long-press or right-click = flag
  const handlers = i => ({
    onPointerDown: e => {
      if (e.button === 2) return
      press.current = { i, t: setTimeout(() => { press.current = null; flag(i); navigator.vibrate?.(30) }, LONG_PRESS) }
    },
    onPointerUp: () => { if (press.current?.i === i) { clearTimeout(press.current.t); press.current = null; reveal(i) } },
    onPointerLeave: () => { if (press.current) { clearTimeout(press.current.t); press.current = null } },
    onContextMenu: e => { e.preventDefault(); if (press.current) { clearTimeout(press.current.t); press.current = null } flag(i) },
  })

  // 2px gaps between cells + padding and border around the board
  const size = Math.max(16, Math.min((box.w - 26 - (b.w - 1) * 2) / b.w, (box.h - 26 - (b.h - 1) * 2) / b.h, 54))
  return (
    <div className="arc-game">
      <Hud stats={[['💣', flagsLeft(b)], ['⏱️', time], ['שיא', progress.best[levelId] ?? '—']]}>
        <ToolButton onClick={() => setFlagMode(f => !f)} label={flagMode ? 'מצב דגל פעיל — לחצו כדי לחזור לחפירה' : 'מצב דגל'}>
          <span className={flagMode ? 'ms-flag-on' : ''}>{flagMode ? '🚩' : '⛏️'}</span>
        </ToolButton>
        <ToolButton onClick={() => start(levelId)} label="משחק חדש">🔄</ToolButton>
      </Hud>
      {!daily && <div className="sp-levels" role="group" aria-label="רמת קושי">
        {LEVELS.map(l => <button key={l.id} type="button" className={`arc-chip${l.id === levelId ? ' is-on' : ''}`} onClick={() => start(l.id)}>{l.name}</button>)}
      </div>}
      <div className="arc-field" ref={boxRef}>
        <div className="ms-board" style={{ gridTemplateColumns: `repeat(${b.w}, ${size}px)`, fontSize: size * 0.55 }} role="grid" aria-label="שדה מוקשים">
          {b.cells.map((c, i) => (
            <button key={i} type="button" className={`ms-cell${c.open ? ' is-open' : ''}${c.open && c.mine ? ' is-mine' : ''}${b.boom === i ? ' is-boom' : ''}`}
              style={{ width: size, height: size, color: NUM_COLORS[c.n] }} {...handlers(i)}
              aria-label={c.open ? (c.mine ? 'מוקש' : c.n ? `${c.n}` : 'ריק') : c.flag ? 'דגל' : 'סגור'}>
              {c.open ? (c.mine ? '💣' : c.n || '') : c.flag ? '🚩' : (b.lost && c.mine ? '💣' : '')}
            </button>
          ))}
        </div>
      </div>
      <p className="ms-help" aria-hidden="true">{flagMode ? '🚩 מצב דגל: לחיצה מסמנת מוקש' : 'לחיצה חופרת · לחיצה ארוכה (או קליק ימני) שמה דגל'}</p>
      {won && !daily && <EndCard title="🎉 ניצחתם!" text={`מצאתם את כל ${b.mines} המוקשים תוך ${time} שניות.`}
        primary="▶ שוב" onPrimary={() => start(levelId)}
        secondary="📱 שתפו את ההישג" onSecondary={() => onShare?.(`💣 ניקיתי שדה מוקשים ברמה ${level.name} תוך ${time} שניות! מי מהיר יותר?`)} />}
      {showLost && <EndCard title="💥 בום!" text="עליתם על מוקש. המספרים מספרים כמה מוקשים נוגעים במשבצת — נסו שוב!"
        primary="🔄 לנסות שוב" onPrimary={() => start(levelId)} />}
    </div>
  )
}
