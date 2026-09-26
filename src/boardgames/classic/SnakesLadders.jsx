import { useEffect, useRef, useState } from 'react'
import { StepsLearn } from '../common'
import '../boardgames.css'

const LADDERS = { 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 }
const SNAKES = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 }
const COLORS = [{ id: 'red', emoji: '🔴', label: 'אדום' }, { id: 'blue', emoji: '🔵', label: 'כחול' }, { id: 'green', emoji: '🟢', label: 'ירוק' }, { id: 'yellow', emoji: '🟡', label: 'צהוב' }]
const FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
// square n (1..100) → [col, row] with row 0 at the bottom, boustrophedon
const pos = n => { const r = Math.floor((n - 1) / 10), k = (n - 1) % 10; return [r % 2 ? 9 - k : k, r] }
const center = n => { const [c, r] = pos(n); return [c * 10 + 5, (9 - r) * 10 + 5] }

function Play() {
  const [setup, setSetup] = useState([{ type: 'human', name: 'אני' }, { type: 'cpu', name: 'המחשב' }])
  const [started, setStarted] = useState(false)
  const [at, setAt] = useState([0, 0])
  const [turn, setTurn] = useState(0)
  const [die, setDie] = useState(0)
  const [msg, setMsg] = useState('')
  const [winner, setWinner] = useState(null)
  const [busy, setBusy] = useState(false)
  const timers = useRef([])
  const later = (f, ms) => timers.current.push(setTimeout(f, ms))
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const start = () => { setAt(setup.map(() => 0)); setTurn(0); setWinner(null); setMsg(''); setDie(0); setStarted(true) }
  const roll = () => {
    if (busy || winner !== null) return
    setBusy(true)
    const d = 1 + Math.floor(Math.random() * 6)
    let spins = 0
    const iv = setInterval(() => { setDie(1 + Math.floor(Math.random() * 6)); if (++spins > 7) { clearInterval(iv); setDie(d); move(d) } }, 70)
  }
  const move = d => {
    const p = turn, from = at[p]
    let to = from + d
    let note = `${setup[p].name}: ${FACES[d]} ${d}`
    if (to > 100) { to = 100 - (to - 100); note += ' – יותר מ-100, חוזרים אחורה' }
    const steps = []
    for (let k = from + 1; k <= Math.min(from + d, 100); k++) steps.push(k)
    if (from + d > 100) for (let k = 99; k >= to; k--) steps.push(k)
    steps.forEach((sq, k) => later(() => setAt(a => a.map((x, i) => (i === p ? sq : x))), 180 * (k + 1)))
    const after = 180 * steps.length + 250
    later(() => {
      let final = to
      if (LADDERS[to]) { final = LADDERS[to]; note += ` · 🪜 סולם! עולים ל-${final}` }
      else if (SNAKES[to]) { final = SNAKES[to]; note += ` · 🐍 נחש! יורדים ל-${final}` }
      setAt(a => a.map((x, i) => (i === p ? final : x)))
      setMsg(note)
      if (final === 100) { setWinner(p); setBusy(false); return }
      const next = d === 6 ? p : (p + 1) % setup.length
      if (d === 6) setMsg(m => m + ' · 6 = עוד תור!')
      setTurn(next); setBusy(false)
    }, after)
  }
  // computer players roll by themselves
  useEffect(() => {
    if (!started || winner !== null || busy || setup[turn]?.type !== 'cpu') return
    const t = setTimeout(roll, 900)
    return () => clearTimeout(t)
  }, [started, turn, busy, winner]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!started) return (
    <div className="bg-play sl-setup">
      <h3>מי משחק?</h3>
      {setup.map((pl, i) => (
        <div key={i} className="sl-player">
          <span>{COLORS[i].emoji}</span>
          <input value={pl.name} onChange={e => setSetup(x => x.map((y, k) => (k === i ? { ...y, name: e.target.value } : y)))} aria-label={`שם שחקן ${i + 1}`} />
          <select value={pl.type} onChange={e => setSetup(x => x.map((y, k) => (k === i ? { ...y, type: e.target.value } : y)))}><option value="human">ילד/ה</option><option value="cpu">מחשב</option></select>
          {setup.length > 2 && <button type="button" onClick={() => setSetup(x => x.filter((_, k) => k !== i))} aria-label="הסרה">✕</button>}
        </div>
      ))}
      {setup.length < 4 && <button type="button" className="ei-addp" onClick={() => setSetup(x => [...x, { type: 'human', name: `שחקן ${x.length + 1}` }])}>➕ עוד שחקן</button>}
      <div className="bg-actions"><button type="button" className="bg-primary" onClick={start}>🎲 מתחילים!</button></div>
    </div>
  )

  const cur = setup[turn]
  return (
    <div className="bg-play">
      <p className="bg-status" role="status">{winner !== null ? `🏆 ${setup[winner].name} הגיע/ה ל-100 וניצח/ה!` : `תור: ${COLORS[turn].emoji} ${cur.name}`}</p>
      {msg && <p className="bgm-msg">{msg}</p>}
      <div className="sl-wrap">
        <div className="sl-board" dir="ltr">
          {Array.from({ length: 100 }, (_, k) => { const vr = Math.floor(k / 10), vc = k % 10, r = 9 - vr, n = r * 10 + (r % 2 ? 10 - vc : vc + 1); return <div key={k} className={`sl-sq${(vr + vc) % 2 ? ' is-alt' : ''}`}><small>{n}</small></div> })}
          <svg viewBox="0 0 100 100" className="sl-svg" aria-hidden="true">
            {Object.entries(LADDERS).map(([a, b]) => { const [x1, y1] = center(+a), [x2, y2] = center(+b); const dx = (y2 - y1), dy = -(x2 - x1), L = Math.hypot(dx, dy) || 1, ox = dx / L * 1.8, oy = dy / L * 1.8; return <g key={a} className="sl-ladder"><line x1={x1 + ox} y1={y1 + oy} x2={x2 + ox} y2={y2 + oy} /><line x1={x1 - ox} y1={y1 - oy} x2={x2 - ox} y2={y2 - oy} />{(() => { const R = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / 5)); return Array.from({ length: R }, (_, k) => { const t = (k + 0.5) / R, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t; return <line key={k} x1={x + ox} y1={y + oy} x2={x - ox} y2={y - oy} /> }) })()}</g> })}
            {Object.entries(SNAKES).map(([a, b]) => { const [x1, y1] = center(+a), [x2, y2] = center(+b); const mx = (x1 + x2) / 2 + (y2 - y1) * 0.25, my = (y1 + y2) / 2 - (x2 - x1) * 0.25; return <g key={a} className="sl-snake"><path d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`} /><circle cx={x1} cy={y1} r="2.4" /></g> })}
          </svg>
          {at.map((n, i) => { if (!n) return null; const [c, r] = pos(n); return <span key={i} className="sl-token" style={{ left: `${c * 10 + 1 + (i % 2) * 4}%`, top: `${(9 - r) * 10 + 1 + Math.floor(i / 2) * 4}%` }}>{COLORS[i].emoji}</span> })}
        </div>
      </div>
      <div className="bgm-top">
        <span className="sl-die">{die ? FACES[die] : '🎲'}</span>
        {winner === null && cur.type === 'human' && <button type="button" className="bgm-roll" onClick={roll} disabled={busy}>🎲 הטלת קוביה</button>}
      </div>
      <div className="bg-score">{setup.map((pl, i) => <span key={i}>{COLORS[i].emoji} {pl.name}: {at[i] || 'בהתחלה'}</span>)}</div>
      <div className="bg-actions"><button type="button" className="bg-primary" onClick={() => setStarted(false)}>🔄 משחק חדש</button></div>
    </div>
  )
}

const STEPS = [
  { title: 'הלוח', pic: '🔢', text: 'לוח של 100 משבצות. מתחילים מחוץ ללוח, ליד משבצת 1, והמטרה להגיע ראשונים למשבצת 100.' },
  { title: 'מטילים וזזים', pic: '🎲', text: 'בכל תור מטילים קוביה ומתקדמים לפי המספר, לפי סדר המספרים על הלוח (זיג-זג: שורה ימינה, שורה שמאלה).' },
  { title: 'סולמות', pic: '🪜', text: 'נחתתם בתחתית של סולם? מטפסים איתו למעלה!' },
  { title: 'נחשים', pic: '🐍', text: 'נחתתם על ראש של נחש? מחליקים איתו למטה, עד הזנב.' },
  { title: 'שש ועוד', pic: '⚅', text: 'יצא 6? מקבלים עוד תור. כדי לנצח צריך להגיע בדיוק ל-100 – אם יוצא יותר, מתקדמים עד 100 וחוזרים אחורה את מה שנשאר.' },
]
export default function Module({ tab, onPlay }) { return tab === 'learn' ? <StepsLearn steps={STEPS} onPlay={onPlay} /> : <Play /> }
