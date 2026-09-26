import { useState } from 'react'
import { Controls, StepsLearn, useComputerTurn } from '../common'
import '../boardgames.css'

// Kalah rules: pits 0–5 = player 1 (bottom, left→right), 6 = player 1 store, 7–12 = player 2 (top, right→left), 13 = player 2 store.
const fresh = () => ({ p: [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0], turn: 1, last: null })
const own = t => (t === 1 ? [0, 1, 2, 3, 4, 5] : [7, 8, 9, 10, 11, 12])
const store = t => (t === 1 ? 6 : 13)
const moves = s => own(s.turn).filter(i => s.p[i] > 0)
export function sow(s, i) {
  const p = s.p.slice(), t = s.turn
  let n = p[i], k = i
  p[i] = 0
  while (n) { k = (k + 1) % 14; if (k === store(-t)) continue; p[k]++; n-- }
  let again = k === store(t)
  let captured = 0
  if (!again && own(t).includes(k) && p[k] === 1 && p[12 - k] > 0) { captured = p[12 - k] + 1; p[store(t)] += captured; p[k] = 0; p[12 - k] = 0 }
  // game over: one side empty → the other side keeps its seeds
  const done = own(1).every(x => !p[x]) || own(-1).every(x => !p[x])
  if (done) { for (const x of own(1)) { p[6] += p[x]; p[x] = 0 } for (const x of own(-1)) { p[13] += p[x]; p[x] = 0 } again = false }
  return { p, turn: again ? t : -t, last: i, again, captured, done }
}
const over = s => own(1).every(x => !s.p[x]) && own(-1).every(x => !s.p[x])
function search(s, depth, me) {
  if (over(s) || depth === 0) return (s.p[store(me)] - s.p[store(-me)]) * 10 + (own(me).reduce((a, x) => a + s.p[x], 0) - own(-me).reduce((a, x) => a + s.p[x], 0))
  const vals = moves(s).map(i => { const n = sow(s, i); return search(n, n.turn === s.turn ? depth : depth - 1, me) })
  return s.turn === me ? Math.max(...vals) : Math.min(...vals)
}
function cpuMove(s, level) {
  const ms = moves(s)
  if (level === 1) return ms[Math.floor(Math.random() * ms.length)]
  const depth = level === 2 ? 2 : 6
  let best = ms[0], bv = -Infinity
  for (const i of ms) { const n = sow(s, i); const v = search(n, n.turn === s.turn ? depth : depth - 1, s.turn); if (v > bv) { bv = v; best = i } }
  return best
}

function Play() {
  const [mode, setMode] = useState('computer'), [level, setLevel] = useState(1)
  const [s, setS] = useState(fresh)
  const [note, setNote] = useState('')
  const end = over(s)
  const cpu = mode === 'computer' && s.turn === -1 && !end
  const name = t => (t === 1 ? (mode === 'computer' ? 'אתם (למטה)' : 'השחקן למטה') : mode === 'computer' ? 'המחשב (למעלה)' : 'השחקן למעלה')
  const play = i => { const n = sow(s, i); setS(n); setNote(n.captured ? `💥 ${name(s.turn)} לכדו ${n.captured} אבנים!` : n.again ? `⭐ ${name(s.turn)} סיימו במחסן – עוד תור!` : '') }
  useComputerTurn(cpu, [s], () => play(cpuMove(s, level)), 800)
  const Pit = ({ i }) => {
    const can = !end && !cpu && own(s.turn).includes(i) && s.p[i] > 0
    return <button type="button" className={`mc-pit${can ? ' is-can' : ''}${s.last === i ? ' is-last' : ''}`} disabled={!can} onClick={() => play(i)} aria-label={`גומה עם ${s.p[i]} אבנים`}>
      <span className="mc-seeds">{Array.from({ length: Math.min(s.p[i], 12) }, (_, k) => <i key={k} />)}</span><b>{s.p[i]}</b>
    </button>
  }
  const a = s.p[6], b = s.p[13]
  return (
    <div className="bg-play">
      <Controls mode={mode} setMode={m => { setMode(m); setS(fresh()); setNote('') }} level={level} setLevel={setLevel} />
      <p className="bg-status" role="status">{end ? (a === b ? `🤝 תיקו ${a}–${b}` : `🏆 ${name(a > b ? 1 : -1)} ניצחו, ${Math.max(a, b)} מול ${Math.min(a, b)}`) : cpu ? '🤔 המחשב חושב…' : `תור: ${name(s.turn)} – בחרו גומה בצד שלכם`}</p>
      {note && <p className="bgm-msg">{note}</p>}
      <div className="mc-board" dir="ltr">
        <div className="mc-store" aria-label={`המחסן של ${name(-1)}: ${b}`}><b>{b}</b></div>
        <div className="mc-rows">
          <div className="mc-row">{[12, 11, 10, 9, 8, 7].map(i => <Pit key={i} i={i} />)}</div>
          <div className="mc-row">{[0, 1, 2, 3, 4, 5].map(i => <Pit key={i} i={i} />)}</div>
        </div>
        <div className="mc-store" aria-label={`המחסן של ${name(1)}: ${a}`}><b>{a}</b></div>
      </div>
      <p className="bgm-hint">האבנים זזות נגד כיוון השעון: אצלכם משמאל לימין, והמחסן שלכם בצד ימין.</p>
      <div className="bg-actions"><button type="button" className="bg-primary" onClick={() => { setS(fresh()); setNote('') }}>🔄 משחק חדש</button></div>
    </div>
  )
}

const STEPS = [
  { title: 'הלוח', pic: '🕳️🕳️🕳️', text: 'לכל שחקן 6 גומות בצד שלו, ומחסן גדול בקצה. בתחילת המשחק יש 4 אבנים בכל גומה.' },
  { title: 'זורעים', pic: '🌱', text: 'בתור שלכם בוחרים גומה בצד שלכם, לוקחים את כל האבנים שבה ומפזרים אותן אחת-אחת בגומות הבאות, נגד כיוון השעון – כולל המחסן שלכם, אבל לא במחסן של היריב.' },
  { title: 'עוד תור!', pic: '⭐', text: 'אם האבן האחרונה נופלת במחסן שלכם – מקבלים תור נוסף.' },
  { title: 'לכידה', pic: '💥', text: 'אם האבן האחרונה נופלת בגומה ריקה בצד שלכם, ובגומה שממולה יש אבנים – לוקחים את כל האבנים שממול ואת האבן שלכם אל המחסן.' },
  { title: 'סוף המשחק', pic: '🏆', text: 'כשכל הגומות של אחד השחקנים ריקות, המשחק נגמר: כל שחקן מעביר למחסן את האבנים שנשארו בצד שלו. מי שיש לו יותר אבנים במחסן – מנצח.' },
]
export default function Module({ tab, onPlay }) { return tab === 'learn' ? <StepsLearn steps={STEPS} onPlay={onPlay} /> : <Play /> }
