import { useEffect, useRef, useState } from 'react'
import { build, pairsFor, colsFor, starsForTurns, THEME_NAMES } from '../logic/memory'
import { rng } from '../logic/rng'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard, Segmented } from '../ui'
import { sfx, buzz } from '../sfx'
import '../arcade.css'

// Memory: solo (levels, fewest turns, a record per level) or two players on one screen —
// a found pair scores and keeps the turn. Pick a card theme or let the levels rotate it.
const PLAYERS = [['🔴', 'שחקן 1', 'Player 1'], ['🔵', 'שחקן 2', 'Player 2']]

export default function Memory({ onReport, onShare, daily, lang = 'he' }) {
  const en = lang === 'en'
  const [progress, saveProgress] = useProgress('memory', { level: 1, theme: 'auto', best: {} })
  const [level, setLevel] = useState(daily?.level ?? progress.level)
  const [theme, setTheme] = useState(daily ? 'auto' : progress.theme ?? 'auto')
  const [duo, setDuo] = useState(false)
  const deck = (n, t = theme) => build(n, daily ? rng(daily.seed) : Math.random, t === 'auto' ? undefined : t)
  const [cards, setCards] = useState(() => deck(daily?.level ?? progress.level))
  const [picked, setPicked] = useState([])
  const [turns, setTurns] = useState(0)
  const [peek, setPeek] = useState(true) // short look at all cards when a level starts
  const [streak, setStreak] = useState(0)
  const [miss, setMiss] = useState([])
  const [toast, setToast] = useState(null)
  const [player, setPlayer] = useState(0)
  const [scores, setScores] = useState([0, 0])
  const [boxRef, box] = useBox()
  const timer = useRef(0)
  const bestBefore = useRef(progress.best?.[level])
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
    if (!won || duo) return
    if (daily) { daily.finish({ text: `🧠 משחק הזיכרון: מצאתי ${pairs} זוגות ב־${turns} תורות`, score: turns, won: true }); return }
    saveProgress(p => ({ level: Math.max(p.level, level + 1), best: { ...p.best, [level]: Math.min(p.best?.[level] ?? Infinity, turns) } }))
    onReport?.({ text: `🧠 מצאתי את כל ${pairs} הזוגות בשלב ${level} במשחק הזיכרון ב־${turns} תורות!` })
  }, [won, duo, level, pairs, turns, saveProgress, onReport, daily])

  const say = text => setToast({ text, k: Date.now() })
  const flip = i => {
    const c = cards[i]
    if (peek || c.open || c.done || picked.length === 2) return
    const next = cards.map((k, j) => (j === i ? { ...k, open: true } : k))
    const now = [...picked, i]
    setCards(next)
    sfx('flip')
    if (now.length < 2) { setPicked(now); return }
    setTurns(t => t + 1)
    const [a, b] = now
    if (next[a].face === next[b].face) {
      setCards(next.map((k, j) => (j === a || j === b ? { ...k, done: true } : k)))
      setPicked([])
      const s = streak + 1
      setStreak(s)
      if (duo) setScores(sc => sc.map((v, p) => (p === player ? v + 1 : v)))
      if (s >= 2) say(en ? `🔥 ${s} in a row!` : `🔥 ${s} ברצף!`)
      else if (duo) say(en ? `${PLAYERS[player][0]} A pair! Go again` : `${PLAYERS[player][0]} זוג! עוד תור`)
      setTimeout(() => { sfx(s >= 2 ? 'combo' : 'match'); buzz(20) }, 120)
    } else {
      setPicked(now)
      setStreak(0)
      setTimeout(() => { sfx('bump'); setMiss([a, b]) }, 450)
      timer.current = setTimeout(() => {
        setCards(cs => cs.map((k, j) => (j === a || j === b ? { ...k, open: false } : k)))
        setPicked([]); setMiss([])
        if (duo) { setPlayer(p => 1 - p); say(en ? `${PLAYERS[1 - player][0]} ${PLAYERS[1 - player][2]}'s turn` : `${PLAYERS[1 - player][0]} התור של ${PLAYERS[1 - player][1]}`) }
      }, 900)
    }
  }
  const start = (n, opts = {}) => {
    const t = opts.theme ?? theme
    clearTimeout(timer.current)
    bestBefore.current = progress.best?.[n]
    setLevel(n); setCards(deck(n, t)); setPicked([]); setTurns(0); setPeek(true)
    setStreak(0); setMiss([]); setPlayer(0); setScores([0, 0]); setToast(null)
  }
  const pickTheme = v => { const t = v === 'auto' ? 'auto' : Number(v); setTheme(t); if (!daily) saveProgress({ theme: t }); start(level, { theme: t }) }
  const pickMode = v => { setDuo(v === 'duo'); start(level) }

  const cols = colsFor(cards.length)
  const rows = Math.ceil(cards.length / cols)
  const gap = 8
  const size = Math.max(44, Math.min((box.w - 16 - gap * (cols - 1)) / cols, (box.h - 16 - gap * (rows - 1)) / rows, 130))
  const fresh = turns === 0 && picked.length === 0
  const record = !duo && won && turns < (bestBefore.current ?? Infinity) && bestBefore.current != null
  const [s1, s2] = scores

  return (
    <div className="arc-game">
      <Hud stats={duo
        ? [[PLAYERS[0][0], s1], [PLAYERS[1][0], s2], [en ? 'Pairs left' : 'נשארו', pairs - cards.filter(c => c.done).length / 2]]
        : [[en ? 'Level' : 'שלב', level], [en ? 'Pairs' : 'זוגות', `${cards.filter(c => c.done).length / 2}/${pairs}`], [en ? 'Turns' : 'תורות', turns], [en ? 'Best' : 'שיא', progress.best?.[level] ?? '—']]}>
        <ToolButton onClick={() => start(level)} label={en ? 'Restart level' : 'שלב מחדש'}>🔄</ToolButton>
      </Hud>
      {!daily && fresh && <div className="mm-options">
        <Segmented label={en ? 'Players' : 'שחקנים'} value={duo ? 'duo' : 'solo'} onChange={pickMode}
          options={[['solo', en ? '🙋 Solo' : '🙋 לבד'], ['duo', en ? '👫 Two players' : '👫 שני שחקנים']]} />
        <select className="mm-theme" aria-label={en ? 'Card theme' : 'נושא הקלפים'} value={String(theme)} onChange={e => pickTheme(e.target.value)}>
          <option value="auto">{en ? '🔀 Changes by level' : '🔀 מתחלף לפי שלב'}</option>
          {THEME_NAMES.map(([he, enName], k) => <option key={k} value={k}>{en ? enName : he}</option>)}
        </select>
      </div>}
      {duo && !won && <p className={`mm-turn is-p${player + 1}`} aria-live="polite">{PLAYERS[player][0]} {en ? `${PLAYERS[player][2]}'s turn` : `התור של ${PLAYERS[player][1]}`}</p>}
      <div className="arc-field" ref={boxRef}>
        <div className="mm-grid" style={{ gridTemplateColumns: `repeat(${cols}, ${size}px)`, gap }}>
          {cards.map((c, i) => (
            <button key={c.id} type="button" className={`mm-card${c.open || c.done || peek ? ' is-open' : ''}${c.done ? ' is-done' : ''}${miss.includes(i) ? ' is-miss' : ''}`}
              style={{ width: size, height: size }} onClick={() => flip(i)} aria-label={c.open || c.done || peek ? `${c.face} — ${en ? 'card' : 'קלף'} ${i + 1}` : en ? `Face-down card ${i + 1}` : `קלף סגור ${i + 1}`}>
              <span className="mm-inner">
                <span className="mm-back" aria-hidden="true">?</span>
                <span className="mm-face" style={{ fontSize: size * 0.56 }}>{c.face}</span>
              </span>
            </button>
          ))}
        </div>
        {peek && <div className="arc-toast">{en ? '👀 Take a good look. The cards will turn over soon!' : '👀 תסתכלו טוב… עוד רגע הקלפים מתהפכים!'}</div>}
        {!peek && toast && <div key={toast.k} className="arc-toast mm-toast">{toast.text}</div>}
      </div>
      {won && duo && <EndCard lang={lang} win={s1 !== s2}
        title={s1 === s2 ? (en ? '🤝 A tie!' : '🤝 תיקו!') : `🏆 ${PLAYERS[s1 > s2 ? 0 : 1][0]} ${en ? `${PLAYERS[s1 > s2 ? 0 : 1][2]} wins!` : `${PLAYERS[s1 > s2 ? 0 : 1][1]} ניצח!`}`}
        text={en ? `${PLAYERS[0][0]} ${s1} pairs · ${PLAYERS[1][0]} ${s2} pairs` : `${PLAYERS[0][0]} ${s1} זוגות · ${PLAYERS[1][0]} ${s2} זוגות`}
        primary={en ? '🔄 Rematch' : '🔄 משחק חוזר'} onPrimary={() => start(level)}
        secondary={en ? '▶ Bigger board' : '▶ לוח גדול יותר'} onSecondary={() => start(level + 1)} />}
      {won && !duo && !daily && <EndCard lang={lang} title={en ? '🎉 You found every pair!' : stars === 3 ? '🎉 זיכרון של פיל!' : '🎉 כל הכבוד!'} stars={stars} record={record}
        text={en ? `You found ${pairs} pairs in ${turns} turns.${record ? ' A new record for this level!' : ''}` : `מצאתם ${pairs} זוגות ב־${turns} תורות.${record ? ' שיא חדש לשלב הזה!' : ''}`}
        primary={en ? '▶ Next level' : '▶ לשלב הבא'} onPrimary={() => start(level + 1)}
        secondary={en ? 'Share your score' : '📱 שתפו את ההישג'} onSecondary={() => onShare?.(en ? `I found ${pairs} pairs in ${turns} turns on Ugabuga! Can you beat my score?` : `🧠 מצאתי ${pairs} זוגות ב־${turns} תורות במשחק הזיכרון! מי מנצח אותי?`)} />}
    </div>
  )
}
