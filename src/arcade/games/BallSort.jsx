import { useEffect, useMemo, useState } from 'react'
import { buildLevel, canMove, move, isSolved, top, CAP } from '../logic/ballSort'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'

// Each color also carries a small symbol, so the game works without telling colors apart.
const BALLS = [
  ['#ff5c5c', '●'], ['#ffa62b', '▲'], ['#ffe14d', '★'], ['#4cd681', '■'], ['#45c4ff', '♥'],
  ['#5b6cff', '◆'], ['#b26bff', '✿'], ['#ff7ad1', '☾'], ['#a5733f', '✚'], ['#c9ced8', '♣'],
]

export default function BallSort({ onReport, onShare }) {
  const [progress, saveProgress] = useProgress('ball-sort', { level: 1 })
  const [level, setLevel] = useState(progress.level)
  const [tubes, setTubes] = useState(() => buildLevel(progress.level))
  const [history, setHistory] = useState([])
  const [sel, setSel] = useState(null)
  const [bad, setBad] = useState(null)
  const [extraUsed, setExtraUsed] = useState(false)
  const [boxRef, box] = useBox()
  const won = isSolved(tubes)

  const layout = useMemo(() => {
    const n = tubes.length
    const rows = box.w < 520 && n > 5 ? 2 : box.w < 900 && n > 8 ? 2 : 1
    const perRow = Math.ceil(n / rows)
    const byW = (box.w - 24) / (perRow * 1.32 + (perRow - 1) * 0.5)
    const byH = (box.h - 20) / (rows * 4.55 + (rows - 1) * 0.9 + 1.4)
    const ball = Math.max(22, Math.min(58, byW, byH))
    return { rows, perRow, ball }
  }, [tubes.length, box.w, box.h])

  const tapTube = i => {
    if (won) return
    if (sel === null) { if (tubes[i].length) setSel(i); return }
    if (sel === i) { setSel(null); return }
    if (canMove(tubes, sel, i)) {
      setHistory(h => [...h, tubes])
      setTubes(move(tubes, sel, i))
      setSel(null)
    } else if (tubes[i].length) {
      setBad(i); setTimeout(() => setBad(null), 320)
      setSel(i)
    } else setSel(null)
  }
  const undo = () => { if (!history.length) return; setTubes(history.at(-1)); setHistory(h => h.slice(0, -1)); setSel(null) }
  const addTube = () => { if (extraUsed) return; setHistory(h => [...h, tubes]); setTubes(t => [...t, []]); setExtraUsed(true) }
  const start = n => { setLevel(n); setTubes(buildLevel(n)); setHistory([]); setSel(null); setExtraUsed(false) }

  useEffect(() => {
    if (!won) return
    saveProgress(p => ({ level: Math.max(p.level, level + 1) }))
    onReport?.({ text: `🧪 סיימתי את שלב ${level} במיון כדורים ב־${history.length} מהלכים!` })
  }, [won, level, history.length, saveProgress, onReport])

  const rows = Array.from({ length: layout.rows }, (_, r) => tubes.map((t, i) => [t, i]).slice(r * layout.perRow, (r + 1) * layout.perRow))
  return (
    <div className="arc-game">
      <Hud stats={[['שלב', level], ['מהלכים', history.length]]}>
        <ToolButton onClick={undo} disabled={!history.length} label="ביטול מהלך">↩</ToolButton>
        <ToolButton onClick={addTube} disabled={extraUsed} label="מבחנה נוספת">➕</ToolButton>
        <ToolButton onClick={() => start(level)} label="שלב מחדש">🔄</ToolButton>
      </Hud>
      <div className="arc-field" ref={boxRef}>
        <div className="bs-rack" style={{ '--ball': `${layout.ball}px`, '--tube-gap': `${layout.ball * 0.5}px`, '--row-gap': `${layout.ball * 0.9}px` }}>
          {rows.map((row, r) => (
            <div className="bs-row" key={r}>
              {row.map(([t, i]) => {
                const done = t.length === CAP && t.every(b => b === t[0])
                return (
                  <button type="button" key={i} onClick={() => tapTube(i)} aria-label={`מבחנה ${i + 1}: ${t.length} כדורים`}
                    className={`bs-tube${sel === i ? ' is-sel' : ''}${done ? ' is-done' : ''}${bad === i ? ' is-bad' : ''}`}>
                    {t.map((b, k) => (
                      <span key={k} className={`bs-ball${sel === i && k === t.length - 1 ? ' is-up' : ''}`} style={{ background: BALLS[b][0] }}>{BALLS[b][1]}</span>
                    ))}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        {sel !== null && !won && tubes[sel].length > 0 && <span className="sr-only" aria-live="polite">נבחר כדור {BALLS[top(tubes[sel])][1]}</span>}
      </div>
      {won && <EndCard title="🎉 כל הכבוד!" text={`כל הצבעים מסודרים — ב־${history.length} מהלכים.`}
        primary="▶ לשלב הבא" onPrimary={() => start(level + 1)}
        secondary="📱 שתפו את ההישג" onSecondary={() => onShare?.(`🧪 סיימתי את שלב ${level} במיון כדורים! תצליחו מהר יותר?`)} />}
    </div>
  )
}
