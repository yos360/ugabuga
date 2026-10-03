import { useEffect, useState } from 'react'
import { shuffle, slide, isSolved, inPlace } from '../logic/sliding'
import { rng } from '../logic/rng'
import { sfx } from '../sfx'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard } from '../ui'

// The 15 puzzle: tap a tile in the empty spot's row or column and it slides over
// (with everything between). Sizes 3×3 (8 tiles), 4×4 (15) and 5×5 (24).
const SIZES = [[3, '3×3 קל'], [4, '4×4 קלאסי'], [5, '5×5 אלופים']]

export default function SlidingPuzzle({ onReport, onShare, daily }) {
  const [progress, saveProgress] = useProgress('sliding-puzzle', { n: 3, best: {} })
  const [n, setN] = useState(daily?.level || progress.n)
  const newBoard = size => shuffle(size, daily ? rng(daily.seed) : Math.random)
  const [board, setBoard] = useState(() => newBoard(daily?.level || progress.n))
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [boxRef, box] = useBox()
  const won = isSolved(board)
  const started = moves > 0

  useEffect(() => {
    if (!started || won) return undefined
    const t = setInterval(() => setTime(x => x + 1), 1000)
    return () => clearInterval(t)
  }, [started, won])
  useEffect(() => {
    if (!won || !started) return
    sfx('win')
    if (daily) { daily.finish({ text: `🧩 פאזל הזזה ${n}×${n}: סידרתי ב־${moves} מהלכים, ${time} שניות`, score: time, won: true }); return }
    saveProgress(p => ({ best: { ...p.best, [n]: p.best[n] ? Math.min(p.best[n], moves) : moves } }))
    onReport?.({ text: `🧩 סידרתי פאזל ${n}×${n} ב־${moves} מהלכים!` })
  }, [won, started, n, moves, time, daily, saveProgress, onReport])

  const start = size => { setN(size); setBoard(newBoard(size)); setMoves(0); setTime(0); if (!daily) saveProgress({ n: size }) }
  const tap = idx => {
    if (won) return
    const b = slide(board, n, idx)
    if (!b) return
    setBoard(b); setMoves(m => m + 1); sfx('tick')
  }
  useEffect(() => {
    const onKey = e => {
      const e0 = board.indexOf(0), r = Math.floor(e0 / n), c = e0 % n
      // arrow = the direction a tile moves into the gap
      const map = { ArrowUp: [r + 1, c], ArrowDown: [r - 1, c], ArrowLeft: [r, c + 1], ArrowRight: [r, c - 1] }
      const t = map[e.key]
      if (!t) return
      e.preventDefault()
      const [y, x] = t
      if (y >= 0 && x >= 0 && y < n && x < n) tap(y * n + x)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const size = Math.max(220, Math.min(box.w - 16, box.h - 16, 520))
  const gap = Math.max(4, size * 0.018)
  const cell = (size - gap * (n + 1)) / n
  const pos = i => `translate(${gap + (i % n) * (cell + gap)}px, ${gap + Math.floor(i / n) * (cell + gap)}px)`
  const hue = v => (v - 1) / (n * n - 1) * 300
  const stars = moves <= n * n * 6 ? 3 : moves <= n * n * 12 ? 2 : 1

  return (
    <div className="arc-game">
      <Hud stats={[['מהלכים', moves], ['⏱️', time], ['במקום', `${inPlace(board)}/${n * n - 1}`]]}>
        <ToolButton onClick={() => start(n)} label="ערבוב חדש">🔀</ToolButton>
      </Hud>
      {!daily && <div className="sp-levels" role="group" aria-label="גודל">
        {SIZES.map(([s, label]) => <button key={s} type="button" className={`arc-chip${s === n ? ' is-on' : ''}`} onClick={() => start(s)}>{label}</button>)}
      </div>}
      <div className="arc-field" ref={boxRef}>
        <div className="sl-board" style={{ width: size, height: size }} role="grid" aria-label={`פאזל ${n} על ${n}`}>
          {board.map((v, i) => v ? (
            <button key={v} type="button" className={`sl-tile${v === i + 1 ? ' is-home' : ''}`} onClick={() => tap(i)}
              style={{ width: cell, height: cell, transform: pos(i), fontSize: cell * 0.42, '--h': hue(v) }} aria-label={`אריח ${v}`}>{v}</button>
          ) : null)}
        </div>
      </div>
      {won && started && !daily && <EndCard title="🎉 מסודר!" stars={stars} text={`פאזל ${n}×${n} ב־${moves} מהלכים ו־${time} שניות.`}
        primary={n < 5 ? `▶ לנסות ${n + 1}×${n + 1}` : '🔀 עוד פאזל'} onPrimary={() => start(n < 5 ? n + 1 : n)}
        secondary="📱 שתפו את ההישג" onSecondary={() => onShare?.(`🧩 סידרתי פאזל ${n}×${n} ב־${moves} מהלכים! תצליחו בפחות?`)} />}
    </div>
  )
}
