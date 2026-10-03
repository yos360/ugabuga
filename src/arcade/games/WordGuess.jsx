import { useEffect, useState } from 'react'
import { pickWord, LETTERS, norm, isLetter, lettersIn, misses, isWon, isLost, MAX_MISSES } from '../logic/words'
import { rng } from '../logic/rng'
import { sfx } from '../sfx'
import { useProgress } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'

// Guess the word, letter by letter. Every wrong letter pops one of 7 balloons —
// guess the word before the last balloon pops.
const BALLOON_COLORS = ['#ff5c8a', '#ffb547', '#ffe14d', '#4cd681', '#45c4ff', '#7b6cff', '#ff8ad8']
const KEY_ROWS = ['קראטוןםפ', 'שדגכעיחלךף', 'זסבהנמצתץ']

export default function WordGuess({ onReport, onShare, daily }) {
  const [progress, saveProgress] = useProgress('word-guess', { wins: 0, streak: 0, best: 0 })
  const [round, setRound] = useState(() => ({ ...pickWord(daily ? rng(daily.seed) : Math.random), guessed: new Set(), hints: 0 }))
  const [streak, setStreak] = useState(0)
  const { word, category, guessed } = round
  const won = isWon(word, guessed)
  const lost = !won && isLost(word, guessed)
  const wrong = misses(word, guessed)

  const guess = raw => {
    const l = norm(raw)
    if (won || lost || guessed.has(l) || !LETTERS.includes(l)) return
    const g = new Set(guessed); g.add(l)
    setRound(r => ({ ...r, guessed: g }))
    if (lettersIn(word).has(l)) sfx('eat'); else { sfx('crash'); navigator.vibrate?.(40) }
  }
  const hint = () => {
    if (won || lost) return
    const missing = [...lettersIn(word)].filter(l => !guessed.has(l))
    if (!missing.length) return
    const g = new Set(guessed); g.add(missing[Math.floor(Math.random() * missing.length)])
    setRound(r => ({ ...r, guessed: g, hints: r.hints + 1 }))
    sfx('power')
  }
  const next = () => setRound({ ...pickWord(Math.random, [word]), guessed: new Set(), hints: 0 })

  useEffect(() => {
    const onKey = e => { if (e.key.length === 1 && isLetter(e.key)) { e.preventDefault(); guess(e.key) } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    if (!won && !lost) return
    if (won) sfx('win')
    if (daily) { daily.finish({ text: won ? `🎈 נחשו את המילה: ניחשתי "${word}" עם ${wrong} טעויות` : `🎈 נחשו את המילה: המילה הייתה "${word}"`, score: wrong, won }); return }
    if (won) {
      const s = streak + 1
      setStreak(s)
      saveProgress(p => ({ wins: p.wins + 1, best: Math.max(p.best, s) }))
      onReport?.({ text: `🎈 ניחשתי ${s} מילים ברצף בנחשו את המילה!` })
    } else setStreak(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won, lost])

  return (
    <div className="arc-game">
      <Hud stats={[['רצף', streak], ['ניצחונות', progress.wins], ['שיא רצף', Math.max(progress.best, streak)]]}>
        <ToolButton onClick={hint} disabled={won || lost} label="רמז — חושף אות">💡</ToolButton>
        {!daily && <ToolButton onClick={next} label="מילה אחרת">🔄</ToolButton>}
      </Hud>
      <div className="arc-field wg-field">
        <div className="wg-balloons" aria-label={`נשארו ${MAX_MISSES - wrong} בלונים`}>
          {BALLOON_COLORS.map((c, i) => (
            <span key={i} className={`wg-balloon${i < wrong ? ' is-pop' : ''}`} style={{ '--c': c, '--i': i }}>
              <i />{i < wrong && <b>💥</b>}
            </span>
          ))}
        </div>
        <p className="wg-cat">הנושא: <b>{category}</b> · {[...word].filter(isLetter).length} אותיות</p>
        <div className="wg-word" dir="rtl" aria-live="polite">
          {[...word].map((ch, i) => isLetter(ch)
            ? <span key={i} className={`wg-slot${guessed.has(norm(ch)) ? ' is-on' : ''}${lost && !guessed.has(norm(ch)) ? ' is-missed' : ''}`}>{guessed.has(norm(ch)) || lost ? ch : ''}</span>
            : <span key={i} className="wg-mark">{ch}</span>)}
        </div>
        <div className="wg-keys" dir="rtl">
          {KEY_ROWS.map(row => (
            <div key={row} className="wg-row">
              {[...row].map(k => {
                const used = guessed.has(norm(k)), good = used && lettersIn(word).has(norm(k))
                return <button key={k} type="button" className={`wg-key${used ? (good ? ' is-good' : ' is-bad') : ''}`} disabled={used || won || lost} onClick={() => guess(k)}>{k}</button>
              })}
            </div>
          ))}
        </div>
      </div>
      {won && !daily && <EndCard title="🎉 ניחשתם!" text={`המילה: "${word}" · ${wrong ? `${wrong} טעויות` : 'בלי אף טעות!'}${round.hints ? ` · ${round.hints} רמזים` : ''}`}
        primary="▶ מילה הבאה" onPrimary={next}
        secondary="📱 שתפו" onSecondary={() => onShare?.(`🎈 ניחשתי ${streak} מילים ברצף בנחשו את המילה! תצליחו יותר?`)} />}
      {lost && !daily && <EndCard title="🎈 כל הבלונים התפוצצו" text={`המילה הייתה: "${word}". הבאה בטוח תצליח!`}
        primary="▶ מילה חדשה" onPrimary={next} />}
    </div>
  )
}
