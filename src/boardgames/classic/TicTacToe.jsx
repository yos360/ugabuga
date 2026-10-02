import { useEffect, useRef, useState } from 'react'
import { Controls, StepsLearn, useComputerTurn, pickMove } from '../common'
import '../boardgames.css'

const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
const winLine = b => LINES.find(l => b[l[0]] && l.every(i => b[i] === b[l[0]])) || null
const G = {
  moves: s => [4, 0, 2, 6, 8, 1, 3, 5, 7].filter(i => !s.b[i]),
  play: (s, i) => { const b = s.b.slice(); b[i] = s.turn; return { b, turn: -s.turn } },
  terminal: s => (winLine(s.b) ? -1 : s.b.every(x => x) ? 0 : null),
  evaluate: () => 0,
}
const DEPTH = { 1: [1, 1000], 2: [2, 0], 3: [9, 0] }
const fresh = (first = 1) => ({ b: Array(9).fill(0), turn: first })
// Distinct colours (the ❌/⭕ emoji are both red): blue X, orange O.
const X_COLOR = '#1d5fd1', O_COLOR = '#ef7d00'
const Mark = ({ v, size }) => <span role="img" aria-label={v === 1 ? 'איקס' : 'עיגול'} style={{ color: v === 1 ? X_COLOR : O_COLOR, fontWeight: 900, fontSize: size, lineHeight: 1, fontFamily: 'Arial, sans-serif' }}>{v === 1 ? '✕' : '◯'}</span>

function Play() {
  const [mode, setMode] = useState('computer'), [level, setLevel] = useState(1)
  const [first, setFirst] = useState(1)
  const [s, setS] = useState(() => fresh())
  const [score, setScore] = useState({ 1: 0, [-1]: 0, 0: 0 })
  const line = winLine(s.b), full = s.b.every(x => x), over = !!line || full
  const cpu = mode === 'computer' && s.turn === -1 && !over
  useComputerTurn(cpu, [s], () => { const [d, n] = DEPTH[level]; setS(x => G.play(x, pickMove(x, d, G, n))) }, 450)
  const name = t => (t === 1 ? (mode === 'computer' ? <>אתם (<Mark v={1} />)</> : <Mark v={1} />) : mode === 'computer' ? <>המחשב (<Mark v={-1} />)</> : <Mark v={-1} />)
  // Score updates the moment a game ends, exactly once per game.
  const scoredRef = useRef(null)
  useEffect(() => {
    if (!over || scoredRef.current === s) return
    scoredRef.current = s
    const k = line ? s.b[line[0]] : 0
    setScore(sc => ({ ...sc, [k]: sc[k] + 1 }))
  }, [over, s, line])
  const again = () => { const f = -first; setFirst(f); setS(fresh(f)) }
  return (
    <div className="bg-play">
      <Controls mode={mode} setMode={m => { setMode(m); setS(fresh()); setScore({ 1: 0, [-1]: 0, 0: 0 }) }} level={level} setLevel={setLevel} />
      <p className="bg-status" role="status">{line ? <>🏆 {mode === 'computer' ? (s.b[line[0]] === 1 ? 'ניצחתם!' : 'המחשב ניצח!') : <><Mark v={s.b[line[0]]} /> ניצח!</>}</> : full ? '🤝 תיקו!' : cpu ? '🤔 המחשב חושב…' : <>תור: {name(s.turn)}</>}</p>
      <div className="ttt-board" dir="ltr">
        {s.b.map((v, i) => <button key={i} type="button" className={`ttt-cell${line?.includes(i) ? ' is-win' : ''}`} disabled={!!v || over || cpu} onClick={() => setS(G.play(s, i))} aria-label={v ? (v === 1 ? 'איקס' : 'עיגול') : `משבצת ${i + 1}`}>{v ? <Mark v={v} size="1.15em" /> : ''}</button>)}
      </div>
      <div className="bg-score"><span><Mark v={1} /> {mode === 'computer' ? 'אתם' : ''} {score[1]}</span><span>🤝 תיקו {score[0]}</span><span><Mark v={-1} /> {mode === 'computer' ? 'המחשב' : ''} {score[-1]}</span></div>
      <div className="bg-actions"><button type="button" className="bg-primary" onClick={again}>🔄 {over ? 'עוד משחק' : 'להתחיל מחדש'}</button></div>
      {level === 3 && mode === 'computer' && <p className="bgm-hint">ברמה קשה המחשב לא טועה אף פעם – הכי טוב שאפשר זה תיקו 😉</p>}
    </div>
  )
}

const STEPS = [
  { title: 'הלוח', pic: '#️⃣', text: 'לוח של 3×3 משבצות. שחקן אחד הוא ✕ (כחול) והשני ◯ (כתום).' },
  { title: 'בתורות', pic: <><Mark v={1} /> <Mark v={-1} /></>, text: 'בכל תור מסמנים משבצת ריקה אחת בסימן שלכם.' },
  { title: 'המטרה', pic: <><Mark v={1} /><Mark v={1} /><Mark v={1} /></>, text: 'מי שמסדר 3 סימנים בשורה, בעמודה או באלכסון – מנצח.' },
  { title: 'טיפים', pic: '💡', text: 'האמצע הוא המשבצת החזקה ביותר. ואם ליריב יש 2 בשורה – חסמו אותו! כששני השחקנים משחקים בלי טעויות, זה תמיד נגמר בתיקו.' },
]
export default function Module({ tab, onPlay }) { return tab === 'learn' ? <StepsLearn steps={STEPS} onPlay={onPlay} /> : <Play /> }
