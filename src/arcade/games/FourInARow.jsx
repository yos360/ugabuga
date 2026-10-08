import { useEffect, useRef, useState } from 'react'
import { COLS, ROWS, emptyBoard, drop, dropRow, result, easyMove, hardMove } from '../logic/fourInARow'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, Segmented } from '../ui'
import { sfx } from '../sfx'

// Player 1 = red, player 2 = yellow. Against the computer the person is always red, and
// who opens alternates every game (so does it between two friends).
const COLOR = { 1: 'אדום', 2: 'צהוב' }
const fresh = starter => ({ b: emptyBoard(), starter, moves: 0, last: -1 })
const applyDrop = (x, c) => {
  const d = drop(x.b, c, x.moves % 2 === 0 ? x.starter : 3 - x.starter)
  return d ? { ...x, b: d.board, moves: x.moves + 1, last: d.index } : x
}

export default function FourInARow({ onReport, onShare }) {
  const [prefs, savePrefs] = useProgress('four-in-a-row', { mode: 'cpu', level: 'easy', wins: 0 })
  const { mode, level } = prefs
  const [g, setG] = useState(() => fresh(1))
  const [score, setScore] = useState({ 1: 0, 2: 0, draw: 0 })
  const [boxRef, box] = useBox()
  const endRef = useRef(null)

  const turn = g.moves % 2 === 0 ? g.starter : 3 - g.starter
  const res = result(g.b)
  const cpuTurn = mode === 'cpu' && turn === 2 && !res

  // the computer's move, after a short "thinking" pause
  useEffect(() => {
    if (!cpuTurn) return undefined
    const t = setTimeout(() => {
      const c = level === 'hard' ? hardMove(g.b, 2) : easyMove(g.b, 2)
      sfx('tick')
      setG(x => applyDrop(x, c))
    }, 420)
    return () => clearTimeout(t)
  }, [cpuTurn, g.b, level])

  // game over: score once, sound, brag text for sharing
  useEffect(() => {
    if (!res || endRef.current === g) return
    endRef.current = g
    const k = res.draw ? 'draw' : res.winner
    setScore(s => ({ ...s, [k]: s[k] + 1 }))
    if (res.draw) sfx('combo')
    else if (mode === 'cpu' && res.winner === 2) sfx('crash')
    else sfx('win')
    if (mode === 'cpu' && res.winner === 1) {
      savePrefs(p => ({ wins: p.wins + 1 }))
      onReport?.({ text: `🔴 ניצחתי את המחשב בארבע בשורה (רמה ${level === 'hard' ? 'קשה' : 'קלה'})!` })
    }
  }, [res, g, mode, level, savePrefs, onReport])

  const tap = c => {
    if (res || cpuTurn || dropRow(g.b, c) < 0) return
    sfx('eat')
    setG(x => applyDrop(x, c))
  }
  const again = () => setG(x => fresh(3 - x.starter))
  const setMode = m => { savePrefs({ mode: m }); setScore({ 1: 0, 2: 0, draw: 0 }); setG(fresh(1)) }
  const setLevel = l => { savePrefs({ level: l }); setScore({ 1: 0, 2: 0, draw: 0 }); setG(fresh(1)) }

  const disc = p => <span className={`c4a-dot is-p${p}`} aria-hidden="true" />
  let msg
  if (res?.draw) msg = <>🤝 הלוח מלא — תיקו!</>
  else if (res) msg = mode === 'cpu' ? (res.winner === 1 ? <>🏆 ניצחתם! ארבע בשורה!</> : <>🤖 המחשב ניצח הפעם</>) : <>🏆 {disc(res.winner)} ה{COLOR[res.winner]} ניצח!</>
  else if (cpuTurn) msg = <>{disc(2)} המחשב חושב…</>
  else msg = <>{disc(turn)} תור {mode === 'cpu' ? 'שלכם' : `ה${COLOR[turn]}`} — לחצו על עמודה</>

  const win = new Set(res?.line || [])
  const cell = Math.max(30, Math.min((box.w - 28) / COLS, (box.h - 28) / ROWS, 84))

  return (
    <div className="arc-game">
      <Hud stats={[[mode === 'cpu' ? '🔴 אתם' : '🔴 אדום', score[1]], ['🤝 תיקו', score.draw], [mode === 'cpu' ? '🤖 מחשב' : '🟡 צהוב', score[2]]]}>
        <ToolButton onClick={again} label="משחק חדש">🔄</ToolButton>
      </Hud>
      <div className="arc-seg-row">
        <Segmented label="מצב משחק" value={mode} onChange={setMode} options={[['friend', '👥 שניים'], ['cpu', '🤖 נגד המחשב']]} />
        {mode === 'cpu' && <Segmented label="רמת המחשב" value={level} onChange={setLevel} options={[['easy', '🐣 קל'], ['hard', '🧠 קשה']]} />}
      </div>
      <p className="tp-msg" role="status" aria-live="polite">{msg}</p>
      <div className="arc-field" ref={boxRef}>
        <div className="c4a-board" dir="ltr" style={{ '--cell': `${cell}px` }}>
          {Array.from({ length: COLS }, (_, c) => {
            const free = dropRow(g.b, c) + 1
            return (
              <button key={c} type="button" className={`c4a-col is-turn-p${turn}`} onClick={() => tap(c)} disabled={!!res || cpuTurn || free === 0}
                aria-label={`עמודה ${c + 1}${free ? `, ${free} מקומות פנויים` : ', מלאה'}`}>
                {Array.from({ length: ROWS }, (_, r) => {
                  const i = r * COLS + c, v = g.b[i]
                  return <span key={r} className={`c4a-hole${v ? ` is-p${v}` : ''}${win.has(i) ? ' is-win' : ''}${i === g.last ? ' is-new' : ''}`} style={i === g.last ? { '--fall': r + 1 } : undefined} />
                })}
              </button>
            )
          })}
        </div>
      </div>
      <div className="tp-actions">
        {res
          ? <>
            <button type="button" className="arc-btn arc-btn-main" onClick={again}>🔄 עוד משחק</button>
            {mode === 'cpu' && res.winner === 1 && <button type="button" className="arc-btn" onClick={() => onShare?.('🔴 ניצחתי את המחשב בארבע בשורה בעוגה בוגה! מי מנצח אותי?')}>📱 שתפו</button>}
          </>
          : <span className="tp-hint">{mode === 'cpu' ? `${g.starter === 1 ? 'אתם פותחים' : 'המחשב פותח'} · ${level === 'hard' ? 'המחשב חושב כמה צעדים קדימה' : 'רמה קלה'}` : `ה${COLOR[g.starter]} פותח · מעבירים את המכשיר, כל אחד בתורו`}</span>}
      </div>
    </div>
  )
}
