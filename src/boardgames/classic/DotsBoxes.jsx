import { useState } from 'react'
import { Controls, StepsLearn, useComputerTurn } from '../common'
import '../boardgames.css'

// Dots and boxes on an N×N box grid. Lines: 'h-r-c' (above box r,c; r in 0..N) and 'v-r-c' (left of box r,c; c in 0..N).
const SIZES = [3, 4, 5]
const allLines = N => [...Array.from({ length: (N + 1) * N }, (_, k) => `h-${Math.floor(k / N)}-${k % N}`), ...Array.from({ length: N * (N + 1) }, (_, k) => `v-${Math.floor(k / (N + 1))}-${k % (N + 1)}`)]
const sides = (r, c) => [`h-${r}-${c}`, `h-${r + 1}-${c}`, `v-${r}-${c}`, `v-${r}-${c + 1}`]
const boxesOf = (line, N) => {
  const [t, r, c] = [line[0], +line.split('-')[1], +line.split('-')[2]]
  const out = []
  if (t === 'h') { if (r < N) out.push([r, c]); if (r > 0) out.push([r - 1, c]) } else { if (c < N) out.push([r, c]); if (c > 0) out.push([r, c - 1]) }
  return out
}
const drawnCount = (drawn, r, c) => sides(r, c).filter(l => drawn[l]).length
function cpuLine(s, N, level) {
  const free = allLines(N).filter(l => !s.drawn[l])
  const rnd = a => a[Math.floor(Math.random() * a.length)]
  if (level === 1) return Math.random() < 0.5 ? (free.find(l => boxesOf(l, N).some(([r, c]) => drawnCount(s.drawn, r, c) === 3)) || rnd(free)) : rnd(free)
  const completing = free.filter(l => boxesOf(l, N).some(([r, c]) => drawnCount(s.drawn, r, c) === 3))
  if (completing.length) return completing[0]
  const safe = free.filter(l => boxesOf(l, N).every(([r, c]) => drawnCount(s.drawn, r, c) < 2))
  if (safe.length) return rnd(safe)
  if (level === 2) return rnd(free)
  // hard: give away the move that hands over the fewest boxes
  let best = free[0], bestLoss = Infinity
  for (const l of free) {
    const d = { ...s.drawn, [l]: 1 }
    let loss = 0, changed = true
    while (changed) { changed = false; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (drawnCount(d, r, c) === 3) { for (const x of sides(r, c)) d[x] = 1; loss++; changed = true } }
    if (loss < bestLoss) { bestLoss = loss; best = l }
  }
  return best
}

function Play() {
  const [mode, setMode] = useState('computer'), [level, setLevel] = useState(1), [N, setN] = useState(3)
  const fresh = () => ({ drawn: {}, owner: {}, turn: 1, score: { 1: 0, [-1]: 0 } })
  const [s, setS] = useState(fresh)
  const total = N * N, end = s.score[1] + s.score[-1] === total
  const cpu = mode === 'computer' && s.turn === -1 && !end
  const draw = l => setS(x => {
    if (x.drawn[l]) return x
    const drawn = { ...x.drawn, [l]: x.turn }, owner = { ...x.owner }, score = { ...x.score }
    let got = 0
    for (const [r, c] of boxesOf(l, N)) if (drawnCount(drawn, r, c) === 4) { owner[`${r}-${c}`] = x.turn; score[x.turn]++; got++ }
    return { drawn, owner, score, turn: got ? x.turn : -x.turn, last: l }
  })
  useComputerTurn(cpu, [s], () => draw(cpuLine(s, N, level)), 600)
  const name = t => (t === 1 ? (mode === 'computer' ? 'אתם (כחול)' : 'הכחול') : mode === 'computer' ? 'המחשב (אדום)' : 'האדום')
  const cell = 100 / N
  return (
    <div className="bg-play">
      <Controls mode={mode} setMode={m => { setMode(m); setS(fresh()) }} level={level} setLevel={setLevel}
        extra={<label>גודל: <select value={N} onChange={e => { setN(+e.target.value); setS(fresh()) }}>{SIZES.map(n => <option key={n} value={n}>{n}×{n}</option>)}</select></label>} />
      <p className="bg-status" role="status">{end ? (s.score[1] === s.score[-1] ? '🤝 תיקו!' : `🏆 ${name(s.score[1] > s.score[-1] ? 1 : -1)} ניצחו!`) : cpu ? '🤔 המחשב חושב…' : `תור: ${name(s.turn)} – לחצו על קו בין שתי נקודות`}</p>
      <div className="db-board" dir="ltr">
        <svg viewBox="-6 -6 112 112" role="img" aria-label="לוח נקודות">
          {Object.entries(s.owner).map(([k, t]) => { const [r, c] = k.split('-').map(Number); return <g key={k}><rect x={c * cell + 1} y={r * cell + 1} width={cell - 2} height={cell - 2} className={t === 1 ? 'db-box-a' : 'db-box-b'} /><text x={c * cell + cell / 2} y={r * cell + cell / 2 + 3} textAnchor="middle" fontSize={cell / 3}>{t === 1 ? '😀' : '🤖'}</text></g> })}
          {allLines(N).map(l => {
            const [t, r, c] = [l[0], +l.split('-')[1], +l.split('-')[2]]
            const x1 = c * cell, y1 = r * cell, x2 = t === 'h' ? x1 + cell : x1, y2 = t === 'h' ? y1 : y1 + cell
            const d = s.drawn[l]
            return <g key={l} className="db-line" onClick={() => !d && !cpu && !end && draw(l)}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} className="db-hit" />
              <line x1={x1} y1={y1} x2={x2} y2={y2} className={d ? (d === 1 ? 'db-a' : 'db-b') + (s.last === l ? ' is-last' : '') : 'db-empty'} />
            </g>
          })}
          {Array.from({ length: (N + 1) * (N + 1) }, (_, k) => <circle key={k} cx={(k % (N + 1)) * cell} cy={Math.floor(k / (N + 1)) * cell} r="2.2" className="db-dot" />)}
        </svg>
      </div>
      <div className="bg-score"><span>😀 {name(1)}: {s.score[1]}</span><span>🤖 {name(-1)}: {s.score[-1]}</span></div>
      <div className="bg-actions"><button type="button" className="bg-primary" onClick={() => setS(fresh())}>🔄 משחק חדש</button></div>
    </div>
  )
}

const STEPS = [
  { title: 'הלוח', pic: '• • • •', text: 'לוח של נקודות בשורות ובעמודות. משחקים בתורות.' },
  { title: 'מותחים קו', pic: '•—•', text: 'בכל תור מותחים קו אחד בין שתי נקודות שכנות – למעלה-למטה או ימינה-שמאלה (לא באלכסון).' },
  { title: 'סוגרים ריבוע', pic: '⬜', text: 'מי שמותח את הקו הרביעי של ריבוע – סוגר אותו, מסמן אותו כשלו, ומקבל עוד תור!' },
  { title: 'להיזהר מהקו השלישי', pic: '⚠️', text: 'אם תמתחו את הקו השלישי של ריבוע, היריב יסגור אותו בתור הבא. נסו לא לתת לו ריבועים במתנה.' },
  { title: 'מי מנצח', pic: '🏆', text: 'כשכל הריבועים סגורים – סופרים. מי שסגר יותר ריבועים מנצח.' },
]
export default function Module({ tab, onPlay }) { return tab === 'learn' ? <StepsLearn steps={STEPS} onPlay={onPlay} /> : <Play /> }
