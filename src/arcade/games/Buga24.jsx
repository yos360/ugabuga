import { useEffect, useMemo, useRef, useState } from 'react'
import { israelDayNumber } from '../../utils/israelDate'
import { useProgress } from '../hooks'
import { puzzle, evaluateExpression, hintFor, cleanSolution } from '../logic/buga24'
import { Hud, ToolButton, EndCard } from '../ui'
import { sfx } from '../sfx'
import './buga24.css'

const LEVELS = [['young', 'צעיר · בלי חילוק'], ['classic', 'קלאסי'], ['expert', 'אלופים · עד 13']]
const sessionKey = 'buga-24-session-v1'
const freshSeed = () => Math.floor(Math.random() * 0x7fffffff)

export default function Buga24({ daily: dailyChallenge, onReport, onShare }) {
  const [day] = useState(() => israelDayNumber(Date.now()))
  const [progress, saveProgress] = useProgress('buga-24', { solved: 0, best: 0, points: 0, dailyStreak: 0, lastDaily: 0 })
  const [saved] = useState(() => {
    try {
      const value = JSON.parse(localStorage.getItem(sessionKey))
      return value?.version === 1 && (!value.daily || value.dailyDay === israelDayNumber(Date.now())) ? value : null
    } catch { return null }
  })
  const [level, setLevel] = useState(dailyChallenge ? 'classic' : LEVELS.some(([value]) => value === saved?.level) ? saved.level : 'classic')
  const [daily, setDaily] = useState(!dailyChallenge && !!saved?.daily)
  const [learning, setLearning] = useState(!dailyChallenge && !!saved?.learning)
  const [seed, setSeed] = useState(Number.isSafeInteger(saved?.seed) ? saved.seed : freshSeed())
  const [input, setInput] = useState(!dailyChallenge && typeof saved?.input === 'string' ? saved.input.slice(0, 100) : '')
  const [seconds, setSeconds] = useState(!dailyChallenge && Number.isSafeInteger(saved?.seconds) && saved.seconds >= 0 ? saved.seconds : 0)
  const [hintStep, setHintStep] = useState(!dailyChallenge && Number.isInteger(saved?.hintStep) && saved.hintStep >= 0 && saved.hintStep <= 3 ? saved.hintStep : 0)
  const [message, setMessage] = useState('')
  const [won, setWon] = useState(!dailyChallenge && !!saved?.won)
  const [roundPoints, setRoundPoints] = useState(!dailyChallenge && Number.isInteger(saved?.roundPoints) ? saved.roundPoints : 0)
  const field = useRef(null)
  const effectiveDaily = !!dailyChallenge || daily
  const activeSeed = dailyChallenge?.seed ?? (daily ? day * 2401 + ({ young: 11, classic: 29, expert: 47 }[level]) : seed)
  const current = useMemo(() => puzzle(activeSeed, level), [activeSeed, level])

  useEffect(() => {
    if (won) return undefined
    const timer = setInterval(() => { if (!document.hidden) setSeconds(value => value + 1) }, 1000)
    return () => clearInterval(timer)
  }, [won])
  useEffect(() => {
    if (dailyChallenge) return
    try { localStorage.setItem(sessionKey, JSON.stringify({ version: 1, level, daily, learning, dailyDay: day, seed, input, seconds, hintStep, won, roundPoints })) } catch { /* private mode */ }
  }, [dailyChallenge, level, daily, learning, day, seed, input, seconds, hintStep, won, roundPoints])

  const reset = (nextLevel = level, nextDaily = daily, nextLearning = learning) => {
    setLevel(nextLevel); setDaily(nextDaily); setLearning(nextLearning); setSeed(freshSeed()); setInput(''); setSeconds(0); setHintStep(0); setMessage(''); setWon(false); setRoundPoints(0)
    requestAnimationFrame(() => field.current?.focus())
  }
  const add = token => { setInput(value => value + token); setMessage('') }
  const check = () => {
    const result = evaluateExpression(input, current.numbers)
    if (!result.ok) { setMessage(result.error); sfx('bump'); return }
    const earned = Math.max(25, ({ young: 120, classic: 220, expert: 340 }[level]) - seconds - hintStep * 30)
    setRoundPoints(earned); setWon(true); sfx('win')
    saveProgress(previous => {
      const consecutive = effectiveDaily && previous.lastDaily === day - 1
      return { solved: (previous.solved || 0) + 1, best: previous.best ? Math.min(previous.best, seconds) : seconds, points: (previous.points || 0) + earned,
        dailyStreak: effectiveDaily ? (previous.lastDaily === day ? previous.dailyStreak : consecutive ? previous.dailyStreak + 1 : 1) : previous.dailyStreak,
        lastDaily: effectiveDaily ? day : previous.lastDaily }
    })
    onReport?.({ text: `🧮 פתרתי בוגה 24 ב־${seconds} שניות: ${cleanSolution(current.solution)} = 24` })
    dailyChallenge?.finish?.({ won: true, text: `הגעתי ל־24 בתוך ${seconds} שניות וקיבלתי ${earned} נקודות` })
  }
  const showHint = () => { setMessage(hintFor(current.solution, hintStep)); setHintStep(step => Math.min(3, step + 1)) }

  return <div className="arc-game b24-game">
    <Hud stats={[['זמן', `${seconds} שנ׳`], ['ניקוד', progress.points || 0], ['נפתרו', progress.solved || 0], ['רצף יומי', progress.dailyStreak || 0]]}>
      <ToolButton onClick={showHint} disabled={won} label="רמז">💡</ToolButton><ToolButton onClick={() => reset()} label="חידה חדשה">🔄</ToolButton>
    </Hud>
    {!dailyChallenge && <div className="b24-modes" role="group" aria-label="מצב משחק">
      <button type="button" className={!daily && !learning ? 'is-on' : ''} aria-pressed={!daily && !learning} onClick={() => reset(level, false, false)}>תרגול חופשי</button>
      <button type="button" className={learning ? 'is-on' : ''} aria-pressed={learning} onClick={() => reset(level, false, true)}>🎓 מצב לימודי</button>
      <button type="button" className={daily ? 'is-on' : ''} aria-pressed={daily} onClick={() => reset(level, true, false)}>🌟 אתגר יומי</button>
    </div>}
    <div className="b24-levels" role="group" aria-label="רמת קושי">{LEVELS.map(([value, label]) => <button key={value} type="button" className={level === value ? 'is-on' : ''} aria-pressed={level === value} onClick={() => reset(value, daily, learning)}>{label}</button>)}</div>
    <main className="b24-board">
      <p>השתמשו בכל מספר פעם אחת בדיוק והגיעו ל־24</p>
      <div className="b24-numbers" aria-label={`המספרים: ${current.numbers.join(', ')}`}>{current.numbers.map((number, index) => <span key={index}>{number}</span>)}</div>
      <label htmlFor="b24-expression">התרגיל שלכם</label>
      <input ref={field} id="b24-expression" value={input} onChange={event => setInput(event.target.value.slice(0, 100))} onKeyDown={event => { if (event.key === 'Enter') check() }} dir="ltr" inputMode="text" autoComplete="off" placeholder="לדוגמה: (8-2)×(7-3)" />
      <div className="b24-pad" dir="ltr">{['(', ')', '+', '−', '×', '÷'].map(token => <button type="button" key={token} onClick={() => add(token === '−' ? '-' : token)}>{token}</button>)}<button type="button" onClick={() => setInput(value => value.slice(0, -1))} aria-label="מחיקת תו">⌫</button><button type="button" onClick={() => setInput('')}>ניקוי</button></div>
      <button type="button" className="b24-check" onClick={check}>בדיקת התרגיל</button><p className="b24-message" role="status">{message}</p>
      {learning && <aside className="b24-learning"><b>🎓 לומדים תוך כדי משחק</b><p>סוגריים קובעים מה מחשבים קודם. כפל וחילוק באים לפני חיבור וחיסור.</p>{won && <p><strong>פתרון מוסבר:</strong> מחשבים תחילה את הפעולות בסוגריים בתרגיל <span dir="ltr">{cleanSolution(current.solution)}</span>, ואז מחברים את תוצאות הביניים עד 24.</p>}</aside>}
    </main>
    {won && <EndCard title="🎉 בדיוק 24!" text={`קיבלתם ${roundPoints} נקודות ופתרתם תוך ${seconds} שניות${hintStep ? ` ועם ${hintStep} רמזים` : ' בלי רמזים'}.`} primary="🧮 חידה חדשה" onPrimary={() => reset()} secondary="📱 שתפו" onSecondary={() => onShare?.(`🧮 פתרתי בוגה 24: ${cleanSolution(current.solution)} = 24`)} />}
  </div>
}
