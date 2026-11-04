import { useEffect, useRef, useState } from 'react'
import { shuffle, slide, isSolved, inPlace } from '../logic/sliding'
import { rng } from '../logic/rng'
import { sfx, buzz } from '../sfx'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, EndCard, Segmented } from '../ui'

// The 15 puzzle: tap a tile in the empty spot's row or column and it slides over
// (with everything between). Sizes 3×3 (8 tiles), 4×4 (15) and 5×5 (24).
// Numbers, or a picture cut into tiles (a small number in the corner still helps).
const SIZES = [[3, '3×3 קל', '3×3 Easy'], [4, '4×4 קלאסי', '4×4 Classic'], [5, '5×5 אלופים', '5×5 Champions']]
// [big emoji, sky top, sky bottom, corner emojis]
const PICS = [
  ['🦁', '#ffd36e', '#ff7a59', ['☀️', '🌴', '🦋', '🌼']],
  ['🚀', '#1e1b4b', '#7c3aed', ['🌙', '⭐', '🪐', '✨']],
  ['🐠', '#7dd3fc', '#0e7490', ['🫧', '🐚', '🌿', '🦀']],
  ['🦄', '#fbcfe8', '#a78bfa', ['🌈', '☁️', '💖', '⭐']],
  ['🐼', '#bbf7d0', '#16a34a', ['🎋', '🌸', '🍃', '☀️']],
]
const picUrl = ([big, top, bottom, corners]) => {
  const c = [[16, 16], [84, 16], [16, 86], [84, 86]]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>`
    + `<rect width="100" height="100" fill="url(#g)"/><circle cx="50" cy="54" r="34" fill="#ffffff55"/>`
    + `<text x="50" y="57" font-size="54" text-anchor="middle" dominant-baseline="middle">${big}</text>`
    + corners.map((e, i) => `<text x="${c[i][0]}" y="${c[i][1]}" font-size="17" text-anchor="middle" dominant-baseline="middle">${e}</text>`).join('') + '</svg>'
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

export default function SlidingPuzzle({ onReport, onShare, daily, lang = 'he' }) {
  const en = lang === 'en'
  const [progress, saveProgress] = useProgress('sliding-puzzle', { n: 3, best: {}, bestTime: {}, look: 'numbers' })
  const [n, setN] = useState(daily?.level || progress.n)
  const [look, setLook] = useState(daily ? 'numbers' : progress.look ?? 'numbers')
  const [pic, setPic] = useState(() => Math.floor(Math.random() * PICS.length))
  const newBoard = size => shuffle(size, daily ? rng(daily.seed) : Math.random)
  const [board, setBoard] = useState(() => newBoard(daily?.level || progress.n))
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [peek, setPeek] = useState(false)
  const [boxRef, box] = useBox()
  const bestBefore = useRef(progress.best?.[daily?.level || progress.n])
  const peekTimer = useRef(0)
  const won = isSolved(board)
  const started = moves > 0

  useEffect(() => {
    if (!started || won) return undefined
    const t = setInterval(() => setTime(x => x + 1), 1000)
    return () => clearInterval(t)
  }, [started, won])
  useEffect(() => () => clearTimeout(peekTimer.current), [])
  useEffect(() => {
    if (!won || !started) return
    if (daily) { sfx('win'); daily.finish({ text: en ? `🧩 Sliding puzzle ${n}×${n}: solved in ${moves} moves, ${time} seconds` : `🧩 פאזל הזזה ${n}×${n}: סידרתי ב־${moves} מהלכים, ${time} שניות`, score: time, won: true }); return }
    saveProgress(p => ({
      best: { ...p.best, [n]: p.best?.[n] ? Math.min(p.best[n], moves) : moves },
      bestTime: { ...p.bestTime, [n]: p.bestTime?.[n] ? Math.min(p.bestTime[n], time) : time },
    }))
    onReport?.({ text: en ? `🧩 I solved a ${n}×${n} sliding puzzle in ${moves} moves!` : `🧩 סידרתי פאזל ${n}×${n} ב־${moves} מהלכים!` })
  }, [won, started, n, moves, time, daily, saveProgress, onReport, en])

  const start = (size, nextPic = look === 'picture') => {
    bestBefore.current = progress.best?.[size]
    setN(size); setBoard(newBoard(size)); setMoves(0); setTime(0); setPeek(false)
    if (nextPic) setPic(p => (p + 1) % PICS.length)
    if (!daily) saveProgress({ n: size })
  }
  const pickLook = v => { setLook(v); saveProgress({ look: v }); start(n, false) }
  const showPeek = () => { clearTimeout(peekTimer.current); setPeek(true); peekTimer.current = setTimeout(() => setPeek(false), 1600) }
  const tap = idx => {
    if (won) return
    const b = slide(board, n, idx)
    if (!b) return
    setBoard(b); setMoves(m => m + 1)
    if (isSolved(b)) { buzz([20, 40, 20]); return } // EndCard plays the win
    if (inPlace(b) > inPlace(board)) { sfx('place'); buzz(10) } else sfx('tick')
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
  const picture = look === 'picture'
  const art = picture ? picUrl(PICS[pic]) : null
  const span = cell * n + gap * (n - 1) // the picture covers the tiles as if there were no gaps
  const record = won && started && bestBefore.current != null && moves < bestBefore.current

  return (
    <div className="arc-game">
      <Hud stats={[[en ? 'Moves' : 'מהלכים', moves], ['⏱️', time], [en ? 'In place' : 'במקום', `${inPlace(board)}/${n * n - 1}`], [en ? 'Best' : 'שיא', progress.best?.[n] ?? '—']]}>
        <ToolButton onClick={showPeek} label={en ? 'Peek at the solution' : 'הצצה לפתרון'}>👁️</ToolButton>
        <ToolButton onClick={() => start(n)} label={en ? 'New shuffle' : 'ערבוב חדש'}>🔀</ToolButton>
      </Hud>
      {!daily && <div className="sp-levels" role="group" aria-label={en ? 'Size' : 'גודל'}>
        {SIZES.map(([s, label, labelEn]) => <button key={s} type="button" className={`arc-chip${s === n ? ' is-on' : ''}`} onClick={() => start(s)}>{en ? labelEn : label}</button>)}
        <Segmented label={en ? 'Tiles' : 'אריחים'} value={look} onChange={pickLook}
          options={[['numbers', en ? '🔢 Numbers' : '🔢 מספרים'], ['picture', en ? '🖼️ Picture' : '🖼️ תמונה']]} />
      </div>}
      <div className="arc-field" ref={boxRef}>
        <div className={`sl-board${won && started ? ' is-won' : ''}`} style={{ width: size, height: size }} role="grid" aria-label={en ? `${n} by ${n} puzzle` : `פאזל ${n} על ${n}`}>
          {board.map((v, i) => v ? (
            <button key={v} type="button" className={`sl-tile${v === i + 1 ? ' is-home' : ''}${picture ? ' is-pic' : ''}`} onClick={() => tap(i)}
              style={{
                width: cell, height: cell, transform: pos(i), fontSize: picture ? Math.max(11, cell * 0.2) : cell * 0.42, '--h': hue(v),
                ...(picture && { backgroundImage: art, backgroundSize: `${span}px ${span}px`, backgroundPosition: `${-((v - 1) % n) * (cell + gap)}px ${-Math.floor((v - 1) / n) * (cell + gap)}px` }),
              }}
              aria-label={en ? `Tile ${v}` : `אריח ${v}`}>{picture ? <span className="sl-num">{v}</span> : v}</button>
          ) : null)}
          {won && started && picture && <div className="sl-full" style={{ backgroundImage: art }} aria-hidden="true" />}
          {peek && <div className="sl-peek" aria-hidden="true">
            {picture ? <div className="sl-full" style={{ backgroundImage: art }} />
              : <div className="sl-peek-grid" style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, fontSize: cell * 0.3 }}>{Array.from({ length: n * n - 1 }, (_, k) => <b key={k}>{k + 1}</b>)}</div>}
            <span className="sl-peek-tag">{en ? '👁️ This is the goal' : '👁️ ככה זה צריך להיראות'}</span>
          </div>}
        </div>
      </div>
      {won && started && !daily && <EndCard lang={lang} title={en ? '🎉 Solved!' : '🎉 מסודר!'} stars={stars} record={record}
        text={en ? `${n}×${n} puzzle in ${moves} moves and ${time} seconds.${record ? ' A new best!' : ''}` : `פאזל ${n}×${n} ב־${moves} מהלכים ו־${time} שניות.${record ? ' שיא חדש!' : ''}`}
        primary={n < 5 ? (en ? `▶ Try ${n + 1}×${n + 1}` : `▶ לנסות ${n + 1}×${n + 1}`) : (en ? '🔀 Another puzzle' : '🔀 עוד פאזל')} onPrimary={() => start(n < 5 ? n + 1 : n)}
        secondary={en ? '📱 Share your score' : '📱 שתפו את ההישג'} onSecondary={() => onShare?.(en ? `🧩 I solved a ${n}×${n} sliding puzzle in ${moves} moves! Can you do it in fewer?` : `🧩 סידרתי פאזל ${n}×${n} ב־${moves} מהלכים! תצליחו בפחות?`)} />}
    </div>
  )
}
