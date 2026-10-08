import { useEffect, useRef, useState } from 'react'
import { emptyBoard, place, result, turnOf, easyMove, hardMove } from '../logic/ticTacToe'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, Segmented } from '../ui'
import { sfx } from '../sfx'

// X (1) always opens. Against the computer the person switches sides every game
// (X, then O, then X…), so both get to open.
const NAME = { 1: 'איקס', 2: 'עיגול' }
const Mark = ({ v }) => <span className={`ttta-mark is-p${v}`} aria-hidden="true">{v === 1 ? '✕' : '◯'}</span>
const fresh = human => ({ b: emptyBoard(), human, last: -1 })

export default function TicTacToe({ onReport, onShare }) {
  const [prefs, savePrefs] = useProgress('tic-tac-toe', { mode: 'cpu', level: 'easy', wins: 0, draws: 0 })
  const { mode, level } = prefs
  const [g, setG] = useState(() => fresh(1))
  const [score, setScore] = useState({ a: 0, b: 0, draw: 0 })
  const [boxRef, box] = useBox()
  const endRef = useRef(null)

  const turn = turnOf(g.b)
  const res = result(g.b)
  const cpu = 3 - g.human
  const cpuTurn = mode === 'cpu' && turn === cpu && !res

  useEffect(() => {
    if (!cpuTurn) return undefined
    const t = setTimeout(() => {
      const i = level === 'hard' ? hardMove(g.b, cpu) : easyMove(g.b, cpu)
      sfx('tick')
      setG(x => ({ ...x, b: place(x.b, i, cpu) || x.b, last: i }))
    }, 450)
    return () => clearTimeout(t)
  }, [cpuTurn, g.b, cpu, level])

  useEffect(() => {
    if (!res || endRef.current === g) return
    endRef.current = g
    let k = 'draw'
    if (res.winner) k = mode === 'cpu' ? (res.winner === g.human ? 'a' : 'b') : (res.winner === 1 ? 'a' : 'b')
    setScore(s => ({ ...s, [k]: s[k] + 1 }))
    if (res.draw) sfx('combo')
    else if (mode === 'cpu' && k === 'b') sfx('crash')
    else sfx('win')
    if (mode === 'cpu' && k === 'a') {
      savePrefs(p => ({ wins: p.wins + 1 }))
      onReport?.({ text: '⭕ ניצחתי את המחשב באיקס עיגול!' })
    } else if (mode === 'cpu' && k === 'draw' && level === 'hard') {
      savePrefs(p => ({ draws: p.draws + 1 }))
      onReport?.({ text: '⭕ השגתי תיקו מול המחשב הבלתי מנוצח באיקס עיגול!' })
    }
  }, [res, g, mode, level, savePrefs, onReport])

  const tap = i => {
    if (res || cpuTurn || g.b[i]) return
    sfx('eat')
    setG(x => ({ ...x, b: place(x.b, i, turnOf(x.b)) || x.b, last: i }))
  }
  const again = () => setG(x => fresh(mode === 'cpu' ? 3 - x.human : 1))
  const reset = patch => { savePrefs(patch); setScore({ a: 0, b: 0, draw: 0 }); setG(fresh(1)) }

  let msg
  if (res?.draw) msg = <>🤝 תיקו! {mode === 'cpu' && level === 'hard' ? 'מול המחשב הזה — זה כבר הישג' : ''}</>
  else if (res) msg = mode === 'cpu' ? (res.winner === g.human ? <>🏆 ניצחתם!</> : <>🤖 המחשב ניצח הפעם</>) : <>🏆 <Mark v={res.winner} /> ה{NAME[res.winner]} ניצח!</>
  else if (cpuTurn) msg = <><Mark v={cpu} /> המחשב חושב…</>
  else msg = mode === 'cpu' ? <>תורכם — אתם <Mark v={g.human} /></> : <>תור ה{NAME[turn]} <Mark v={turn} /></>

  const win = new Set(res?.line || [])
  const size = Math.max(180, Math.min(box.w - 24, box.h - 16, 460))
  const labels = mode === 'cpu' ? ['🙂 אתם', '🤖 מחשב'] : ['✕ איקס', '◯ עיגול']

  return (
    <div className="arc-game">
      <Hud stats={[[labels[0], score.a], ['🤝 תיקו', score.draw], [labels[1], score.b]]}>
        <ToolButton onClick={again} label="משחק חדש">🔄</ToolButton>
      </Hud>
      <div className="arc-seg-row">
        <Segmented label="מצב משחק" value={mode} onChange={m => reset({ mode: m })} options={[['friend', '👥 שניים'], ['cpu', '🤖 נגד המחשב']]} />
        {mode === 'cpu' && <Segmented label="רמת המחשב" value={level} onChange={l => reset({ level: l })} options={[['easy', '🐣 קל'], ['hard', '🧠 בלתי מנוצח']]} />}
      </div>
      <p className="tp-msg" role="status" aria-live="polite">{msg}</p>
      <div className="arc-field" ref={boxRef}>
        <div className="ttta-board" dir="ltr" style={{ width: size, height: size, fontSize: size * 0.22 }}>
          {g.b.map((v, i) => (
            <button key={i} type="button" className={`ttta-cell${win.has(i) ? ' is-win' : ''}${i === g.last ? ' is-new' : ''}`}
              onClick={() => tap(i)} disabled={!!v || !!res || cpuTurn}
              aria-label={`שורה ${Math.floor(i / 3) + 1}, טור ${(i % 3) + 1}${v ? `: ${NAME[v]}` : ': ריקה'}`}>
              {v ? <Mark v={v} /> : null}
            </button>
          ))}
        </div>
      </div>
      <div className="tp-actions">
        {res
          ? <>
            <button type="button" className="arc-btn arc-btn-main" onClick={again}>🔄 עוד משחק</button>
            {mode === 'cpu' && (res.winner === g.human || (res.draw && level === 'hard')) &&
              <button type="button" className="arc-btn" onClick={() => onShare?.(res.draw ? '⭕ השגתי תיקו מול המחשב הבלתי מנוצח באיקס עיגול של עוגה בוגה! תצליחו גם?' : '⭕ ניצחתי את המחשב באיקס עיגול של עוגה בוגה! מי מנצח אותי?')}>📱 שתפו</button>}
          </>
          : <span className="tp-hint">{mode === 'cpu' ? (level === 'hard' ? 'המחשב לא מפסיד אף פעם — תיקו זה ניצחון קטן 😉' : 'במשחק הבא מתחלפים: מי שהיה עיגול נהיה איקס') : 'איקס תמיד פותח · מעבירים את המכשיר, כל אחד בתורו'}</span>}
      </div>
    </div>
  )
}
