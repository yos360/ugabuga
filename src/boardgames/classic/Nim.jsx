import { useState } from 'react'
import { Controls, StepsLearn, useComputerTurn } from '../common'
import '../boardgames.css'

const START = [[1, 3, 5, 7], [3, 4, 5], [2, 5, 6]]
function cpuTake(h, level) {
  const x = h.reduce((a, b) => a ^ b, 0)
  const smart = level === 3 || (level === 2 && Math.random() < 0.6)
  if (smart && x) for (let i = 0; i < h.length; i++) { const t = h[i] ^ x; if (t < h[i]) return [i, h[i] - t] }
  const idx = h.map((n, i) => (n ? i : -1)).filter(i => i >= 0)
  const i = idx[Math.floor(Math.random() * idx.length)]
  return [i, 1 + Math.floor(Math.random() * Math.min(h[i], 3))]
}

function Play() {
  const [mode, setMode] = useState('computer'), [level, setLevel] = useState(1), [setup, setSetup] = useState(0)
  const fresh = (k = setup) => ({ h: START[k].slice(), turn: 1 })
  const [s, setS] = useState(() => fresh())
  const [sel, setSel] = useState(null) // {i, n}
  const end = s.h.every(n => !n)
  const cpu = mode === 'computer' && s.turn === -1 && !end
  const take = (i, n) => { setS(x => { const h = x.h.slice(); h[i] -= n; return { h, turn: -x.turn, last: [i, n] } }); setSel(null) }
  useComputerTurn(cpu, [s], () => take(...cpuTake(s.h, level)), 900)
  const name = t => (t === 1 ? (mode === 'computer' ? 'אתם' : 'שחקן 1') : mode === 'computer' ? 'המחשב' : 'שחקן 2')
  const winner = end ? -s.turn : 0 // whoever took the last stick
  return (
    <div className="bg-play">
      <Controls mode={mode} setMode={m => { setMode(m); setS(fresh()) }} level={level} setLevel={setLevel}
        extra={<label>ערימות: <select value={setup} onChange={e => { setSetup(+e.target.value); setS(fresh(+e.target.value)); setSel(null) }}>{START.map((h, k) => <option key={k} value={k}>{h.join('-')}</option>)}</select></label>} />
      <p className="bg-status" role="status">{end ? `🏆 ${name(winner)} לקחו את הגפרור האחרון וניצחו!` : cpu ? '🤔 המחשב חושב…' : `תור: ${name(s.turn)} – לחצו על גפרורים בשורה אחת כדי לבחור כמה לקחת`}</p>
      {s.last && !end && <p className="bgm-msg">{name(-s.turn)} לקחו {s.last[1]} מהשורה {s.last[0] + 1}</p>}
      <div className="nim-heaps">
        {s.h.map((n, i) => (
          <div key={i} className="nim-row">
            <span className="nim-label">{i + 1}</span>
            {Array.from({ length: n }, (_, k) => {
              const picked = sel && sel.i === i && k >= n - sel.n
              return <button key={k} type="button" className={`nim-stick${picked ? ' is-picked' : ''}`} disabled={cpu || end} aria-label={`לקחת ${n - k} מהשורה ${i + 1}`}
                onMouseEnter={() => !cpu && setSel({ i, n: n - k })} onFocus={() => setSel({ i, n: n - k })}
                onClick={() => (sel && sel.i === i && sel.n === n - k ? take(i, n - k) : setSel({ i, n: n - k }))}>🥢</button>
            })}
          </div>
        ))}
      </div>
      {sel && !cpu && !end && <div className="bg-actions"><button type="button" className="bg-primary" onClick={() => take(sel.i, sel.n)}>לקחת {sel.n} מהשורה {sel.i + 1}</button></div>}
      <div className="bg-actions"><button type="button" onClick={() => { setS(fresh()); setSel(null) }}>🔄 משחק חדש</button></div>
    </div>
  )
}

const STEPS = [
  { title: 'הערימות', pic: '🥢🥢🥢', text: 'על השולחן כמה שורות של גפרורים (או מקלות, או אבנים).' },
  { title: 'לוקחים', pic: '✋', text: 'בכל תור בוחרים שורה אחת ולוקחים ממנה כמה גפרורים שרוצים – לפחות אחד, ואפשר גם את כל השורה. אסור לקחת משתי שורות באותו תור.' },
  { title: 'מי מנצח', pic: '🏆', text: 'מי שלוקח את הגפרור האחרון – מנצח. (יש גרסה הפוכה, "מיזר", שבה מי שלוקח אחרון מפסיד – סכמו מראש!)' },
  { title: 'הסוד המתמטי', pic: '🧮', text: 'לנים יש נוסחה מנצחת שמבוססת על ספירה בבסיס 2 (XOR). המחשב ברמה "קשה" מכיר אותה – ננסה לגלות אותה לבד? רמז: כששתי שורות שוות, מה קורה אם מחקים את היריב?' },
]
export default function Module({ tab, onPlay }) { return tab === 'learn' ? <StepsLearn steps={STEPS} onPlay={onPlay} /> : <Play /> }
