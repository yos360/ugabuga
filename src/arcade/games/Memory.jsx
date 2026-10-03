import { useEffect, useRef, useState } from 'react'
import { build, pairsFor, colsFor, starsForTurns } from '../logic/memory'
import { rng } from '../logic/rng'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'

export default function Memory({ onReport, onShare, daily }) {
  const [progress, saveProgress] = useProgress('memory', { level: 1 })
  const [level, setLevel] = useState(daily?.level ?? progress.level)
  const deck = n => build(n, daily ? rng(daily.seed) : Math.random)
  const [cards, setCards] = useState(() => deck(daily?.level ?? progress.level))
  const [picked, setPicked] = useState([])
  const [turns, setTurns] = useState(0)
  const [peek, setPeek] = useState(true) // short look at all cards when a level starts
  const [boxRef, box] = useBox()
  const timer = useRef(0)
  const pairs = pairsFor(level)
  const won = cards.length > 0 && cards.every(c => c.done)
  const stars = starsForTurns(turns, pairs)

  useEffect(() => {
    if (!peek) return undefined
    const t = setTimeout(() => setPeek(false), 1200 + pairs * 120)
    return () => clearTimeout(t)
  }, [peek, pairs])
  useEffect(() => () => clearTimeout(timer.current), [])

  useEffect(() => {
    if (!won) return
    if (daily) { daily.finish({ text: `🧠 משחק הזיכרון: מצאתי ${pairs} זוגות ב־${turns} תורות`, score: turns, won: true }); return }
    saveProgress(p => ({ level: Math.max(p.level, level + 1) }))
    onReport?.({ text: `🧠 מצאתי את כל ${pairs} הזוגות בשלב ${level} במשחק הזיכרון ב־${turns} תורות!` })
  }, [won, level, pairs, turns, saveProgress, onReport, daily])

  const flip = i => {
    const c = cards[i]
    if (peek || c.open || c.done || picked.length === 2) return
    const next = cards.map((k, j) => (j === i ? { ...k, open: true } : k))
    const now = [...picked, i]
    setCards(next)
    if (now.length < 2) { setPicked(now); return }
    setTurns(t => t + 1)
    const [a, b] = now
    if (next[a].face === next[b].face) {
      setCards(next.map((k, j) => (j === a || j === b ? { ...k, done: true } : k)))
      setPicked([])
    } else {
      setPicked(now)
      timer.current = setTimeout(() => { setCards(cs => cs.map((k, j) => (j === a || j === b ? { ...k, open: false } : k))); setPicked([]) }, 850)
    }
  }
  const start = n => { clearTimeout(timer.current); setLevel(n); setCards(deck(n)); setPicked([]); setTurns(0); setPeek(true) }

  const cols = colsFor(cards.length)
  const rows = Math.ceil(cards.length / cols)
  const gap = 8
  const size = Math.max(44, Math.min((box.w - 16 - gap * (cols - 1)) / cols, (box.h - 16 - gap * (rows - 1)) / rows, 130))

  return (
    <div className="arc-game">
      <Hud stats={[['שלב', level], ['זוגות', `${cards.filter(c => c.done).length / 2}/${pairs}`], ['תורות', turns]]}>
        <ToolButton onClick={() => start(level)} label="שלב מחדש">🔄</ToolButton>
      </Hud>
      <div className="arc-field" ref={boxRef}>
        <div className="mm-grid" style={{ gridTemplateColumns: `repeat(${cols}, ${size}px)`, gap }}>
          {cards.map((c, i) => (
            <button key={c.id} type="button" className={`mm-card${c.open || c.done || peek ? ' is-open' : ''}${c.done ? ' is-done' : ''}`}
              style={{ width: size, height: size }} onClick={() => flip(i)} aria-label={c.open || c.done ? c.face : 'קלף סגור'}>
              <span className="mm-inner">
                <span className="mm-back" aria-hidden="true">?</span>
                <span className="mm-face" style={{ fontSize: size * 0.56 }}>{c.face}</span>
              </span>
            </button>
          ))}
        </div>
        {peek && <div className="arc-toast">👀 תסתכלו טוב… עוד רגע הקלפים מתהפכים!</div>}
      </div>
      {won && !daily && <EndCard title={stars === 3 ? '🎉 זיכרון של פיל!' : '🎉 כל הכבוד!'} stars={stars} text={`מצאתם ${pairs} זוגות ב־${turns} תורות.`}
        primary="▶ לשלב הבא" onPrimary={() => start(level + 1)}
        secondary="📱 שתפו את ההישג" onSecondary={() => onShare?.(`🧠 מצאתי ${pairs} זוגות ב־${turns} תורות במשחק הזיכרון! מי מנצח אותי?`)} />}
    </div>
  )
}
