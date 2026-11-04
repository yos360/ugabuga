import { useEffect, useRef, useState } from 'react'
import { LEVELS, empty, place, open, chord, toggleFlag, isWon, flagsLeft } from '../logic/mines'
import { rng } from '../logic/rng'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'
import { sfx, buzz } from '../sfx'

const NUM_COLORS = ['', '#2563eb', '#16a34a', '#dc2626', '#7c3aed', '#b45309', '#0891b2', '#1d2233', '#6b7280']
const LONG_PRESS = 380
const LEVEL_EN = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }

export default function Minesweeper({ onReport, onShare, daily, lang = 'he' }) {
  const en = lang === 'en'
  const [progress, saveProgress] = useProgress('minesweeper', { level: 'easy', best: {} })
  const [levelId, setLevelId] = useState(daily?.level || progress.level)
  const [tries, setTries] = useState(1)
  const level = LEVELS.find(l => l.id === levelId) || LEVELS[0]
  const levelName = en ? LEVEL_EN[level.id] : level.name
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
    if (daily) { daily.finish({ text: en ? `💣 Minesweeper: cleared the field in ${time} seconds${tries > 1 ? ` (attempt ${tries})` : ' on the first try!'}` : `💣 שולה מוקשים: ניקיתי את השדה תוך ${time} שניות${tries > 1 ? ` (ניסיון ${tries})` : ' בניסיון הראשון!'}`, score: time + (tries - 1) * 60, won: true }); return }
    saveProgress(p => ({ best: { ...p.best, [levelId]: p.best[levelId] ? Math.min(p.best[levelId], time) : time } }))
    onReport?.({ text: en ? `💣 I cleared the ${levelName} minefield in ${time} seconds!` : `💣 ניקיתי את שדה המוקשים ברמה ${level.name} תוך ${time} שניות!` })
  }, [won, levelId, level.name, levelName, time, saveProgress, onReport, daily, tries, en])

  const start = id => {
    const l = LEVELS.find(x => x.id === id)
    setLevelId(id); if (!daily) saveProgress({ level: id }); else setTries(t => t + 1)
    setB(empty(l.w, l.h)); setTime(0); setFlagMode(false); setShowLost(false)
  }
  const reveal = i => {
    if (won || b.lost) return
    const c = b.cells[i]
    if (c.open) { const next = chord(b, i); if (next !== b) dug(b, next); setB(next); return }
    if (flagMode) { setB(toggleFlag(b, i)); sfx('pick'); return }
    if (c.flag) return
    const base = b.placed ? b : place(b, level.mines, i, daily ? rng(daily.seed + i) : Math.random)
    const next = open(base, i)
    dug(base, next)
    setB(next)
  }
  // a mine = boom; a big empty area opening up = a whoosh; one square = a small click
  const dug = (before, after) => {
    if (after.lost) { sfx('crash'); buzz([80, 40, 120]); return }
    const opened = after.cells.filter(c => c.open).length - before.cells.filter(c => c.open).length
    sfx(opened > 8 ? 'slide' : 'place')
  }
  const flag = i => { if (!won && !b.lost && b.placed) { setB(toggleFlag(b, i)); sfx('pick') } }

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
      <Hud stats={[['💣', flagsLeft(b)], ['⏱️', time], [en ? 'Best' : 'שיא', progress.best[levelId] ?? '—']]}>
        <ToolButton onClick={() => setFlagMode(f => !f)} label={flagMode ? (en ? 'Flag mode on - tap to go back to digging' : 'מצב דגל פעיל — לחצו כדי לחזור לחפירה') : (en ? 'Flag mode' : 'מצב דגל')}>
          <span className={flagMode ? 'ms-flag-on' : ''}>{flagMode ? '🚩' : '⛏️'}</span>
        </ToolButton>
        <ToolButton onClick={() => start(levelId)} label={en ? 'New game' : 'משחק חדש'}>🔄</ToolButton>
      </Hud>
      {!daily && <div className="sp-levels" role="group" aria-label={en ? 'Difficulty' : 'רמת קושי'}>
        {LEVELS.map(l => <button key={l.id} type="button" className={`arc-chip${l.id === levelId ? ' is-on' : ''}`} onClick={() => start(l.id)}>{en ? LEVEL_EN[l.id] : l.name}</button>)}
      </div>}
      <div className="arc-field" ref={boxRef}>
        <div className="ms-board" style={{ gridTemplateColumns: `repeat(${b.w}, ${size}px)`, fontSize: size * 0.55 }} role="grid" aria-label={en ? 'Minefield' : 'שדה מוקשים'}>
          {b.cells.map((c, i) => (
            <button key={i} type="button" className={`ms-cell${c.open ? ' is-open' : ''}${c.open && c.mine ? ' is-mine' : ''}${b.boom === i ? ' is-boom' : ''}`}
              style={{ width: size, height: size, color: NUM_COLORS[c.n] }} {...handlers(i)}
              aria-label={c.open ? (c.mine ? (en ? 'Mine' : 'מוקש') : c.n ? `${c.n}` : (en ? 'Empty' : 'ריק')) : c.flag ? (en ? 'Flag' : 'דגל') : (en ? 'Closed' : 'סגור')}>
              {c.open ? (c.mine ? '💣' : c.n || '') : c.flag ? '🚩' : (b.lost && c.mine ? '💣' : '')}
            </button>
          ))}
        </div>
      </div>
      <p className="ms-help" aria-hidden="true">{flagMode ? (en ? '🚩 Flag mode: a tap marks a mine' : '🚩 מצב דגל: לחיצה מסמנת מוקש') : (en ? 'Tap to dig · long-press (or right-click) to plant a flag' : 'לחיצה חופרת · לחיצה ארוכה (או קליק ימני) שמה דגל')}</p>
      {won && !daily && <EndCard lang={lang} title={en ? '🎉 You won!' : '🎉 ניצחתם!'} text={en ? `You found all ${b.mines} mines in ${time} seconds.` : `מצאתם את כל ${b.mines} המוקשים תוך ${time} שניות.`}
        primary={en ? '▶ Again' : '▶ שוב'} onPrimary={() => start(levelId)}
        secondary={en ? '📱 Share your score' : '📱 שתפו את ההישג'} onSecondary={() => onShare?.(en ? `💣 I cleared a ${levelName} minefield in ${time} seconds! Who is faster?` : `💣 ניקיתי שדה מוקשים ברמה ${level.name} תוך ${time} שניות! מי מהיר יותר?`)} />}
      {showLost && <EndCard lang={lang} title={en ? '💥 Boom!' : '💥 בום!'} text={en ? 'You stepped on a mine. The numbers tell how many mines touch a square - try again!' : 'עליתם על מוקש. המספרים מספרים כמה מוקשים נוגעים במשבצת — נסו שוב!'}
        primary={en ? '🔄 Try again' : '🔄 לנסות שוב'} onPrimary={() => start(levelId)} />}
    </div>
  )
}
