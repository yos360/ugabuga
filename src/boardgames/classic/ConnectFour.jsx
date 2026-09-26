import { useState } from 'react'
import { Controls, StepsLearn, useComputerTurn, pickMove } from '../common'
import '../boardgames.css'

const W = 7, H = 6
const LINES = (() => {
  const out = []
  for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    const cells = [0, 1, 2, 3].map(k => [r + dr * k, c + dc * k])
    if (cells.every(([y, x]) => y >= 0 && y < H && x >= 0 && x < W)) out.push(cells.map(([y, x]) => y * W + x))
  }
  return out
})()
const winLine = b => LINES.find(l => b[l[0]] && l.every(i => b[i] === b[l[0]])) || null
export const G = {
  moves: s => [3, 2, 4, 1, 5, 0, 6].filter(c => s.b[c] === 0),
  play: (s, c) => { const b = s.b.slice(); let r = H - 1; while (b[r * W + c]) r--; b[r * W + c] = s.turn; return { b, turn: -s.turn, last: r * W + c } },
  terminal: s => (winLine(s.b) ? -1 : s.b.every(x => x) ? 0 : null),
  evaluate: s => {
    let sc = 0
    for (const l of LINES) {
      let me = 0, op = 0
      for (const i of l) { if (s.b[i] === s.turn) me++; else if (s.b[i]) op++ }
      if (me && !op) sc += me === 3 ? 12 : me === 2 ? 3 : 1
      if (op && !me) sc -= op === 3 ? 14 : op === 2 ? 3 : 1
    }
    for (let r = 0; r < H; r++) sc += (s.b[r * W + 3] === s.turn ? 3 : s.b[r * W + 3] ? -3 : 0)
    return sc
  },
}
const DEPTH = { 1: [2, 40], 2: [4, 4], 3: [7, 0] }
const fresh = () => ({ b: Array(W * H).fill(0), turn: 1, last: null })

function Play() {
  const [mode, setMode] = useState('computer'), [level, setLevel] = useState(1)
  const [s, setS] = useState(fresh)
  const line = winLine(s.b), full = s.b.every(x => x)
  const over = !!line || full
  const cpu = mode === 'computer' && s.turn === -1 && !over
  useComputerTurn(cpu, [s], () => { const [d, n] = DEPTH[level]; setS(x => G.play(x, pickMove(x, d, G, n))) })
  const name = t => (t === 1 ? (mode === 'computer' ? 'אתם (אדום)' : 'האדום') : mode === 'computer' ? 'המחשב (צהוב)' : 'הצהוב')
  const drop = c => { if (!over && !cpu && s.b[c] === 0) setS(G.play(s, c)) }
  return (
    <div className="bg-play">
      <Controls mode={mode} setMode={m => { setMode(m); setS(fresh()) }} level={level} setLevel={setLevel} />
      <p className="bg-status" role="status">{line ? `🏆 ${name(s.b[line[0]])} ניצחו – ארבע בשורה!` : full ? '🤝 הלוח מלא – תיקו' : cpu ? '🤔 המחשב חושב…' : `תור: ${name(s.turn)} – לחצו על עמודה`}</p>
      <div className="c4-board" dir="ltr">
        {Array.from({ length: W }, (_, c) => (
          <button key={c} type="button" className="c4-col" onClick={() => drop(c)} aria-label={`עמודה ${c + 1}`} disabled={over || cpu || s.b[c] !== 0}>
            {Array.from({ length: H }, (_, r) => { const v = s.b[r * W + c], i = r * W + c; return <span key={r} className={`c4-hole${v === 1 ? ' is-red' : v === -1 ? ' is-yellow' : ''}${line?.includes(i) ? ' is-win' : ''}${s.last === i ? ' is-last' : ''}`} /> })}
          </button>
        ))}
      </div>
      <div className="bg-actions"><button type="button" className="bg-primary" onClick={() => setS(fresh())}>🔄 משחק חדש</button></div>
    </div>
  )
}

const STEPS = [
  { title: 'הלוח', pic: '🔴🟡', text: 'לוח עומד עם 7 עמודות ו-6 שורות. לכל שחקן צבע משלו – אדום או צהוב.' },
  { title: 'מפילים דיסקית', pic: '⬇️', text: 'בכל תור בוחרים עמודה ומפילים אליה דיסקית. היא נופלת עד למטה – למקום הפנוי הנמוך ביותר.' },
  { title: 'המטרה', pic: '🔴🔴🔴🔴', text: 'הראשון שמסדר 4 דיסקיות בצבע שלו ברצף – בשורה, בעמודה או באלכסון – מנצח!' },
  { title: 'לחסום!', pic: '🛑', text: 'אם ליריב יש 3 ברצף – חסמו אותו מיד. וטיפ: העמודה האמצעית היא החזקה ביותר, כי ממנה יוצאים הכי הרבה רצפים.' },
  { title: 'תיקו', pic: '🤝', text: 'אם הלוח מתמלא ואף אחד לא סידר 4 – תיקו.' },
]

export default function Module({ tab, onPlay }) { return tab === 'learn' ? <StepsLearn steps={STEPS} onPlay={onPlay} /> : <Play /> }
