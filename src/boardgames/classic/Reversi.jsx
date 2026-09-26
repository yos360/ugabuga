import { useState } from 'react'
import { Controls, StepsLearn, useComputerTurn, pickMove } from '../common'
import '../boardgames.css'

const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
const WEIGHT = [100, -20, 10, 5, 5, 10, -20, 100, -20, -50, -2, -2, -2, -2, -50, -20, 10, -2, 1, 1, 1, 1, -2, 10, 5, -2, 1, 0, 0, 1, -2, 5, 5, -2, 1, 0, 0, 1, -2, 5, 10, -2, 1, 1, 1, 1, -2, 10, -20, -50, -2, -2, -2, -2, -50, -20, 100, -20, 10, 5, 5, 10, -20, 100]
function flips(b, i, t) {
  if (b[i]) return []
  const r = i >> 3, c = i & 7, out = []
  for (const [dr, dc] of DIRS) {
    const line = []; let y = r + dr, x = c + dc
    while (y >= 0 && y < 8 && x >= 0 && x < 8 && b[y * 8 + x] === -t) { line.push(y * 8 + x); y += dr; x += dc }
    if (line.length && y >= 0 && y < 8 && x >= 0 && x < 8 && b[y * 8 + x] === t) out.push(...line)
  }
  return out
}
const legal = (b, t) => b.map((_, i) => i).filter(i => flips(b, i, t).length)
const count = (b, t) => b.filter(x => x === t).length
const G = {
  moves: s => { const m = legal(s.b, s.turn); return m.length ? m : ['pass'] },
  play: (s, i) => { if (i === 'pass') return { b: s.b, turn: -s.turn }; const b = s.b.slice(); for (const f of flips(b, i, s.turn)) b[f] = s.turn; b[i] = s.turn; return { b, turn: -s.turn, last: i } },
  terminal: s => { if (legal(s.b, s.turn).length || legal(s.b, -s.turn).length) return null; const d = count(s.b, s.turn) - count(s.b, -s.turn); return Math.sign(d) },
  evaluate: s => { let v = 0; s.b.forEach((x, i) => { if (x) v += x * WEIGHT[i] }); v *= s.turn; return v + (legal(s.b, s.turn).length - legal(s.b, -s.turn).length) * 3 },
}
const DEPTH = { 1: [1, 150], 2: [2, 10], 3: [4, 0] }
const fresh = () => { const b = Array(64).fill(0); b[27] = b[36] = -1; b[28] = b[35] = 1; return { b, turn: 1, last: null } }

function Play() {
  const [mode, setMode] = useState('computer'), [level, setLevel] = useState(1)
  const [s, setS] = useState(fresh)
  const end = G.terminal(s) !== null
  const mine = legal(s.b, s.turn)
  const cpu = mode === 'computer' && s.turn === -1 && !end
  useComputerTurn(cpu, [s], () => { const [d, n] = DEPTH[level]; setS(x => G.play(x, pickMove(x, d, G, n))) }, 650)
  const human = !cpu && !end && !mine.length
  useComputerTurn(human, [s], () => setS(x => G.play(x, 'pass')), 1400)
  const name = t => (t === 1 ? (mode === 'computer' ? 'אתם (שחורים)' : 'השחורים') : mode === 'computer' ? 'המחשב (לבנים)' : 'הלבנים')
  const bl = count(s.b, 1), wh = count(s.b, -1)
  return (
    <div className="bg-play">
      <Controls mode={mode} setMode={m => { setMode(m); setS(fresh()) }} level={level} setLevel={setLevel} />
      <p className="bg-status" role="status">{end ? (bl === wh ? '🤝 תיקו!' : `🏆 ${name(bl > wh ? 1 : -1)} ניצחו, ${Math.max(bl, wh)} מול ${Math.min(bl, wh)}`) : cpu ? '🤔 המחשב חושב…' : !mine.length ? `ל${name(s.turn)} אין מהלך – התור עובר` : `תור: ${name(s.turn)}`}</p>
      <div className="rv-board" dir="ltr">
        {s.b.map((v, i) => { const can = !cpu && !end && mine.includes(i); return <button key={i} type="button" className={`rv-cell${can ? ' is-can' : ''}${s.last === i ? ' is-last' : ''}`} disabled={!can} onClick={() => setS(G.play(s, i))} aria-label={v ? (v === 1 ? 'שחור' : 'לבן') : can ? 'אפשר לשים כאן' : 'ריק'}>{v !== 0 && <span className={`rv-disc ${v === 1 ? 'is-b' : 'is-w'}`} />}</button> })}
      </div>
      <div className="bg-score"><span>⚫ {bl}</span><span>⚪ {wh}</span></div>
      <div className="bg-actions"><button type="button" className="bg-primary" onClick={() => setS(fresh())}>🔄 משחק חדש</button></div>
    </div>
  )
}

const STEPS = [
  { title: 'הלוח', pic: '⚫⚪', text: 'לוח של 8×8. במרכז מתחילים 4 דיסקיות: 2 שחורות ו-2 לבנות באלכסון. לכל דיסקית צד שחור וצד לבן. השחורים מתחילים.' },
  { title: 'איך שמים', pic: '⚫⚪⚪⚫', text: 'שמים דיסקית כך שבין הדיסקית החדשה לדיסקית אחרת שלכם יש שורה של דיסקיות של היריב – בקו ישר או באלכסון. כל הדיסקיות שנלכדו באמצע מתהפכות לצבע שלכם!' },
  { title: 'חייבים להפוך', pic: '🔄', text: 'מותר לשים רק במקום שהופך לפחות דיסקית אחת. אם אין לכם מקום כזה – התור עובר ליריב.' },
  { title: 'מי מנצח', pic: '🏆', text: 'כשהלוח מלא, או כששני השחקנים לא יכולים לשים – סופרים. מי שיש לו יותר דיסקיות בצבע שלו מנצח.' },
  { title: 'טיפ של אלופים', pic: '📐', text: 'הפינות הן המקומות הכי חזקים – דיסקית בפינה אי אפשר להפוך לעולם. ולהפך: המשבצות שצמודות לפינה מסוכנות, כי הן נותנות ליריב להגיע לפינה.' },
]
export default function Module({ tab, onPlay }) { return tab === 'learn' ? <StepsLearn steps={STEPS} onPlay={onPlay} /> : <Play /> }
