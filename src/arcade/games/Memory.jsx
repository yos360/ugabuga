import { useEffect, useRef, useState } from 'react'
import { build, pairsFor, colsFor, starsForTurns } from '../logic/memory'
import { rng } from '../logic/rng'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'
import '../arcade.css'
import './memory.css'
import './cardGames.css'
import CardRestartDialog from './CardRestartDialog'
import { cardSessionKey, readCardSession, writeCardSession } from '../logic/cardGameSessions'

export default function Memory({ onReport, onShare, daily, lang = 'he' }) {
  const en = lang === 'en'
  const [progress, saveProgress] = useProgress('memory', { level: 1 })
  const storageKey = cardSessionKey('memory', daily)
  const [restored] = useState(() => { try { return readCardSession(localStorage, storageKey, 'memory', daily) } catch { return null } })
  const initialLevel = daily?.level ?? (Number.isSafeInteger(progress.level) && progress.level > 0 ? progress.level : 1)
  const [level, setLevel] = useState(restored?.level ?? initialLevel)
  const [confirm, setConfirm] = useState(false)
  const [storageOk, setStorageOk] = useState(true)
  const [round, setRound] = useState(0)
  const reported = useRef(restored?.reported || false)
  const deck = n => build(n, daily ? rng(daily.seed) : Math.random)
  const [cards, setCards] = useState(() => restored?.cards || deck(initialLevel))
  const [picked, setPicked] = useState([])
  const [turns, setTurns] = useState(restored?.turns || 0)
  const [peek, setPeek] = useState(restored?.peek ?? true) // short look at all cards when a level starts
  const [boxRef, box] = useBox()
  const timer = useRef(0)
  const pairs = pairsFor(level)
  const won = cards.length > 0 && cards.every(c => c.done)
  const stars = starsForTurns(turns, pairs)

  useEffect(() => {
    try { setStorageOk(writeCardSession(localStorage, storageKey, { level, cards, turns, peek, reported: reported.current })) }
    catch { setStorageOk(false) }
  }, [level, cards, turns, peek, storageKey])

  useEffect(() => {
    if (!peek) return undefined
    const t = setTimeout(() => setPeek(false), 1200 + pairs * 120)
    return () => clearTimeout(t)
  }, [peek, pairs, round])
  useEffect(() => () => clearTimeout(timer.current), [])

  useEffect(() => {
    if (!won || reported.current) return
    reported.current = true
    try { writeCardSession(localStorage, storageKey, { level, cards, turns, peek, reported: true }) } catch { /* storage unavailable */ }
    if (daily) { daily.finish({ text: `🧠 משחק הזיכרון: מצאתי ${pairs} זוגות ב־${turns} תורות`, score: turns, won: true }); return }
    saveProgress(p => ({ level: Math.max(p.level, level + 1) }))
    onReport?.({ text: `🧠 מצאתי את כל ${pairs} הזוגות בשלב ${level} במשחק הזיכרון ב־${turns} תורות!` })
  }, [won, level, pairs, turns, cards, peek, storageKey, saveProgress, onReport, daily])

  const flip = i => {
    const c = cards[i]
    if (confirm || peek || c.open || c.done || picked.length === 2) return
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
  const start = n => { reported.current = false; setConfirm(false); setRound(r => r + 1); clearTimeout(timer.current); setLevel(n); setCards(deck(n)); setPicked([]); setTurns(0); setPeek(true) }

  const cols = Math.max(2, Math.min(colsFor(cards.length), Math.floor((box.w - 16) / 60)))
  const rows = Math.ceil(cards.length / cols)
  const gap = 8
  const size = Math.max(52, Math.min((box.w - 16 - gap * (cols - 1)) / cols, (box.h - 16 - gap * (rows - 1)) / rows, 130))

  return (
    <div className="arc-game memory-game">
      <Hud stats={[[en ? 'Level' : 'שלב', level], [en ? 'Pairs' : 'זוגות', `${cards.filter(c => c.done).length / 2}/${pairs}`], [en ? 'Turns' : 'תורות', turns]]}>
        <ToolButton onClick={() => { if ((turns || picked.length) && !won) setConfirm(true); else start(level) }} label={en ? 'Restart level' : 'שלב מחדש'}>🔄</ToolButton>
      </Hud>
      <p className="memory-guide" role="status">{peek
        ? (en ? 'Take a good look — the cards will turn over soon!' : 'תסתכלו טוב — עוד רגע הקלפים מתהפכים!')
        : (en ? 'Find two matching cards' : 'מצאו שני קלפים עם אותה תמונה')}</p>
      <span className="card-save">{storageOk ? (en ? 'Saved on this device' : 'המשחק נשמר במכשיר זה') : (en ? 'Saving is unavailable on this device' : 'השמירה אינה זמינה במכשיר זה')}</span>
      <div className="arc-field memory-field" ref={boxRef}>
        <div className="mm-grid" style={{ gridTemplateColumns: `repeat(${cols}, ${size}px)`, gap }}>
          {cards.map((c, i) => (
            <button key={c.id} type="button" className={`mm-card${c.open || c.done || peek ? ' is-open' : ''}${c.done ? ' is-done' : ''}`}
              style={{ width: size, height: size }} onClick={() => flip(i)} disabled={peek || c.done || c.open || picked.length === 2 || confirm} aria-label={c.open || c.done || peek ? `${c.face}${c.done ? (en ? ', pair found' : ', זוג נמצא') : ''}` : en ? `Face-down card ${i + 1}` : `קלף סגור ${i + 1}`} aria-pressed={c.open || c.done}>
              <span className="mm-inner" aria-hidden="true">
                <span className="mm-back" aria-hidden="true">BUGA</span>
                <span className="mm-face" style={{ fontSize: size * 0.56 }}>{c.face}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      {confirm && <CardRestartDialog en={en} onCancel={() => setConfirm(false)} onConfirm={() => start(level)} />}
      {won && !daily && <EndCard lang={lang} title={en ? '🎉 You found every pair!' : stars === 3 ? '🎉 זיכרון של פיל!' : '🎉 כל הכבוד!'} stars={stars} text={en ? `You found ${pairs} pairs in ${turns} turns.` : `מצאתם ${pairs} זוגות ב־${turns} תורות.`}
        primary={en ? '▶ Next level' : '▶ לשלב הבא'} onPrimary={() => start(level + 1)}
        secondary={en ? 'Share your score' : '📱 שתפו את ההישג'} onSecondary={() => onShare?.(en ? `I found ${pairs} pairs in ${turns} turns on Ugabuga! Can you beat my score?` : `🧠 מצאתי ${pairs} זוגות ב־${turns} תורות במשחק הזיכרון! מי מנצח אותי?`)} />}
    </div>
  )
}
