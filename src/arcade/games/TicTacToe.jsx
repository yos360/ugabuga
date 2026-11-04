import { useEffect, useRef, useState } from 'react'
import { emptyBoard, place, result, turnOf, easyMove, mediumMove, hardMove } from '../logic/ticTacToe'
import { useBox, useProgress } from '../hooks'
import { Hud, ToolButton, Segmented } from '../ui'
import { sfx, buzz } from '../sfx'
import Confetti from '../Confetti'

// X (1) always opens. Against the computer the person switches sides every game
// (X, then O, then X…), so both get to open. The marks can be swapped for fun pairs.
// [mark 1, mark 2, name 1, name 2, name 1 (en), name 2 (en)]
const SETS = [
  ['✕', '◯', 'איקס', 'עיגול', 'X', 'O'],
  ['🐱', '🐶', 'חתול', 'כלב', 'Cat', 'Dog'],
  ['🍕', '🍩', 'פיצה', 'דונאט', 'Pizza', 'Donut'],
  ['⭐', '🌙', 'כוכב', 'ירח', 'Star', 'Moon'],
]
const LEVELS = { easy: easyMove, medium: mediumMove, hard: hardMove }
const fresh = human => ({ b: emptyBoard(), human, last: -1 })
const Mark = ({ v, s = 0 }) => <span className={`ttta-mark is-p${v}${s ? ' is-emoji' : ''}`} aria-hidden="true">{(SETS[s] || SETS[0])[v - 1]}</span>

export default function TicTacToe({ onReport, onShare, lang = 'he' }) {
  const en = lang === 'en'
  const [prefs, savePrefs] = useProgress('tic-tac-toe', { mode: 'cpu', level: 'easy', wins: 0, draws: 0, marks: 0, bestStreak: 0 })
  const { mode, level } = prefs
  const set = SETS[prefs.marks] || SETS[0]
  const name = v => (en ? set[v + 3] : set[v + 1])
  const [g, setG] = useState(() => fresh(1))
  const [score, setScore] = useState({ a: 0, b: 0, draw: 0 })
  const [streak, setStreak] = useState(0)
  const [boxRef, box] = useBox()
  const endRef = useRef(null)

  const turn = turnOf(g.b)
  const res = result(g.b)
  const cpu = 3 - g.human
  const cpuTurn = mode === 'cpu' && turn === cpu && !res

  useEffect(() => {
    if (!cpuTurn) return undefined
    const t = setTimeout(() => {
      const i = (LEVELS[level] || easyMove)(g.b, cpu)
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
    else if (mode === 'cpu' && k === 'b') { sfx('crash'); buzz([40, 30, 40]) } else { sfx('win'); buzz([20, 40, 20]) }
    if (mode !== 'cpu') return
    const s = k === 'a' ? streak + 1 : k === 'b' ? 0 : streak
    setStreak(s)
    if (k === 'a') {
      savePrefs(p => ({ wins: p.wins + 1, bestStreak: Math.max(p.bestStreak || 0, s) }))
      onReport?.({ text: en ? '⭕ I beat the computer at Tic-Tac-Toe!' : '⭕ ניצחתי את המחשב באיקס עיגול!' })
    } else if (k === 'draw' && level === 'hard') {
      savePrefs(p => ({ draws: p.draws + 1 }))
      onReport?.({ text: en ? '⭕ I drew against the unbeatable computer at Tic-Tac-Toe!' : '⭕ השגתי תיקו מול המחשב הבלתי מנוצח באיקס עיגול!' })
    }
  }, [res, g, mode, level, streak, savePrefs, onReport, en])

  const tap = i => {
    if (res || cpuTurn || g.b[i]) return
    sfx('place')
    setG(x => ({ ...x, b: place(x.b, i, turnOf(x.b)) || x.b, last: i }))
  }
  const again = () => setG(x => fresh(mode === 'cpu' ? 3 - x.human : 1))
  const reset = patch => { savePrefs(patch); setScore({ a: 0, b: 0, draw: 0 }); setStreak(0); setG(fresh(1)) }

  const youWon = res?.winner && (mode !== 'cpu' || res.winner === g.human)
  let msg
  if (res?.draw) msg = <>🤝 {en ? "It's a draw!" : 'תיקו!'} {mode === 'cpu' && level === 'hard' ? (en ? 'Against this computer, that is an achievement' : 'מול המחשב הזה — זה כבר הישג') : ''}</>
  else if (res) {
    msg = mode === 'cpu'
      ? (res.winner === g.human ? <>{en ? '🏆 You won!' : '🏆 ניצחתם!'}{streak >= 2 && <> {en ? `🔥 ${streak} in a row!` : `🔥 ${streak} ברצף!`}</>}</> : <>{en ? '🤖 The computer won this time' : '🤖 המחשב ניצח הפעם'}</>)
      : (en ? <>🏆 <Mark s={prefs.marks} v={res.winner} /> {name(res.winner)} wins!</> : <>🏆 ניצחון ל{name(res.winner)}! <Mark s={prefs.marks} v={res.winner} /></>)
  } else if (cpuTurn) msg = <><Mark s={prefs.marks} v={cpu} /> {en ? 'The computer is thinking…' : 'המחשב חושב…'}</>
  else msg = mode === 'cpu' ? <>{en ? 'Your turn - you are' : 'תורכם — אתם'} <Mark s={prefs.marks} v={g.human} /></> : (en ? <><Mark s={prefs.marks} v={turn} /> {name(turn)}'s turn</> : <>התור של ה{name(turn)} <Mark s={prefs.marks} v={turn} /></>)

  const win = new Set(res?.line || [])
  const size = Math.max(180, Math.min(box.w - 24, box.h - 16, 460))
  const labels = mode === 'cpu' ? (en ? ['🙂 You', '🤖 Computer'] : ['🙂 אתם', '🤖 מחשב']) : [`${set[0]} ${name(1)}`, `${set[1]} ${name(2)}`]
  // the winning line, in board percent: from the center of its first cell to its last
  const at = i => [((i % 3) + 0.5) * 33.33, (Math.floor(i / 3) + 0.5) * 33.33]
  const line = res?.line && [at(res.line[0]), at(res.line[2])]
  const reach = (a, b) => [a[0] + (a[0] - b[0]) * 0.28, a[1] + (a[1] - b[1]) * 0.28] // past the cell centers a little

  return (
    <div className="arc-game">
      <Hud stats={[[labels[0], score.a], [en ? '🤝 Draw' : '🤝 תיקו', score.draw], [labels[1], score.b], ...(mode === 'cpu' ? [[en ? '🔥 Best streak' : '🔥 שיא רצף', prefs.bestStreak || 0]] : [])]}>
        <ToolButton onClick={again} label={en ? 'New game' : 'משחק חדש'}>🔄</ToolButton>
      </Hud>
      <div className="arc-seg-row">
        <Segmented label={en ? 'Game mode' : 'מצב משחק'} value={mode} onChange={m => reset({ mode: m })} options={[['friend', en ? '👥 Two players' : '👥 שניים'], ['cpu', en ? '🤖 Vs computer' : '🤖 נגד המחשב']]} />
        {mode === 'cpu' && <Segmented label={en ? 'Computer level' : 'רמת המחשב'} value={level} onChange={l => reset({ level: l })} options={[['easy', en ? '🐣 Easy' : '🐣 קל'], ['medium', en ? '🦊 Medium' : '🦊 בינוני'], ['hard', en ? '🧠 Unbeatable' : '🧠 בלתי מנוצח']]} />}
        <select className="ttta-sets" aria-label={en ? 'Marks' : 'סימנים'} value={prefs.marks || 0} onChange={e => savePrefs({ marks: Number(e.target.value) })}>
          {SETS.map((s, k) => <option key={k} value={k}>{s[0]} {s[1]}</option>)}
        </select>
      </div>
      <p className="tp-msg" role="status" aria-live="polite">{msg}</p>
      <div className="arc-field" ref={boxRef}>
        <div className="ttta-board" dir="ltr" style={{ width: size, height: size, fontSize: size * 0.22 }}>
          {g.b.map((v, i) => (
            <button key={i} type="button" className={`ttta-cell${win.has(i) ? ' is-win' : ''}${i === g.last ? ' is-new' : ''}`}
              onClick={() => tap(i)} disabled={!!v || !!res || cpuTurn}
              aria-label={en ? `Row ${Math.floor(i / 3) + 1}, column ${(i % 3) + 1}${v ? `: ${name(v)}` : ': empty'}` : `שורה ${Math.floor(i / 3) + 1}, טור ${(i % 3) + 1}${v ? `: ${name(v)}` : ': ריקה'}`}>
              {v ? <Mark s={prefs.marks} v={v} /> : null}
            </button>
          ))}
          {line && <svg className={`ttta-line is-p${res.winner}`} viewBox="0 0 100 100" aria-hidden="true">
            <line x1={reach(line[0], line[1])[0]} y1={reach(line[0], line[1])[1]} x2={reach(line[1], line[0])[0]} y2={reach(line[1], line[0])[1]} pathLength="1" />
          </svg>}
        </div>
        {youWon && <Confetti key={score.a + score.b} pieces={90} />}
      </div>
      <div className="tp-actions">
        {res
          ? <>
            <button type="button" className="arc-btn arc-btn-main" onClick={again}>{en ? '🔄 Play again' : '🔄 עוד משחק'}</button>
            {mode === 'cpu' && (res.winner === g.human || (res.draw && level === 'hard')) &&
              <button type="button" className="arc-btn" onClick={() => onShare?.(en ? (res.draw ? '⭕ I drew against the unbeatable computer at Tic-Tac-Toe on Ugabuga! Can you?' : '⭕ I beat the computer at Tic-Tac-Toe on Ugabuga! Can you beat me?') : (res.draw ? '⭕ השגתי תיקו מול המחשב הבלתי מנוצח באיקס עיגול של עוגה בוגה! תצליחו גם?' : '⭕ ניצחתי את המחשב באיקס עיגול של עוגה בוגה! מי מנצח אותי?'))}>{en ? '📱 Share' : '📱 שתפו'}</button>}
          </>
          : <span className="tp-hint">{mode === 'cpu' ? (level === 'hard' ? (en ? 'The computer never loses - a draw is a small win 😉' : 'המחשב לא מפסיד אף פעם — תיקו זה ניצחון קטן 😉') : level === 'medium' ? (en ? 'It always blocks you - try making two threats at once 😉' : 'הוא תמיד חוסם — נסו ליצור שני איומים בבת אחת 😉') : (en ? 'Next game you swap: whoever was O becomes X' : 'במשחק הבא מתחלפים: מי שהיה עיגול נהיה איקס')) : (en ? `${name(1)} always starts · pass the device, take turns` : `ה${name(1)} תמיד פותח · מעבירים את המכשיר, כל אחד בתורו`)}</span>}
      </div>
    </div>
  )
}
