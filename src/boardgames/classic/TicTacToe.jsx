import { useState } from 'react'
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

function Play() {
  const [mode, setMode] = useState('computer'), [level, setLevel] = useState(1)
  const [first, setFirst] = useState(1)
  const [s, setS] = useState(() => fresh())
  const [score, setScore] = useState({ 1: 0, [-1]: 0, 0: 0 })
  const line = winLine(s.b), full = s.b.every(x => x), over = !!line || full
  const cpu = mode === 'computer' && s.turn === -1 && !over
  useComputerTurn(cpu, [s], () => { const [d, n] = DEPTH[level]; setS(x => G.play(x, pickMove(x, d, G, n))) }, 450)
  const name = t => (t === 1 ? (mode === 'computer' ? 'אתם (❌)' : '❌') : mode === 'computer' ? 'המחשב (⭕)' : '⭕')
  const again = () => { if (over) setScore(sc => ({ ...sc, [line ? s.b[line[0]] : 0]: sc[line ? s.b[line[0]] : 0] + 1 })); const f = -first; setFirst(f); setS(fresh(f)) }
  return (
    <div className="bg-play">
      <Controls mode={mode} setMode={m => { setMode(m); setS(fresh()); setScore({ 1: 0, [-1]: 0, 0: 0 }) }} level={level} setLevel={setLevel} />
      <p className="bg-status" role="status">{line ? `🏆 ${name(s.b[line[0]])} ניצחו!` : full ? '🤝 תיקו!' : cpu ? '🤔 המחשב חושב…' : `תור: ${name(s.turn)}`}</p>
      <div className="ttt-board" dir="ltr">
        {s.b.map((v, i) => <button key={i} type="button" className={`ttt-cell${line?.includes(i) ? ' is-win' : ''}`} disabled={!!v || over || cpu} onClick={() => setS(G.play(s, i))} aria-label={v ? (v === 1 ? 'איקס' : 'עיגול') : `משבצת ${i + 1}`}>{v === 1 ? '❌' : v === -1 ? '⭕' : ''}</button>)}
      </div>
      <div className="bg-score"><span>❌ {score[1]}</span><span>🤝 {score[0]}</span><span>⭕ {score[-1]}</span></div>
      <div className="bg-actions"><button type="button" className="bg-primary" onClick={again}>🔄 {over ? 'עוד משחק' : 'להתחיל מחדש'}</button></div>
      {level === 3 && mode === 'computer' && <p className="bgm-hint">ברמה קשה המחשב לא טועה אף פעם – הכי טוב שאפשר זה תיקו 😉</p>}
    </div>
  )
}

const STEPS = [
  { title: 'הלוח', pic: '#️⃣', text: 'לוח של 3×3 משבצות. שחקן אחד הוא ❌ והשני ⭕.' },
  { title: 'בתורות', pic: '❌⭕', text: 'בכל תור מסמנים משבצת ריקה אחת בסימן שלכם.' },
  { title: 'המטרה', pic: '❌❌❌', text: 'מי שמסדר 3 סימנים בשורה, בעמודה או באלכסון – מנצח.' },
  { title: 'טיפים', pic: '💡', text: 'האמצע הוא המשבצת החזקה ביותר. ואם ליריב יש 2 בשורה – חסמו אותו! כששני השחקנים משחקים בלי טעויות, זה תמיד נגמר בתיקו.' },
]
export default function Module({ tab, onPlay }) { return tab === 'learn' ? <StepsLearn steps={STEPS} onPlay={onPlay} /> : <Play /> }
