import { useEffect, useMemo, useRef, useState } from 'react'
import LessonRunner from '../LessonRunner'
import { HUMAN, CPU, LEVELS, newGame, clone, rollDie, diceToMoves, allowedMoves, applySingle, computerSequence, winner, pips } from './engine'

const FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
const TOP = [13, 14, 15, 16, 17, 18, 'bar', 19, 20, 21, 22, 23, 24]
const BOTTOM = [12, 11, 10, 9, 8, 7, 'bar', 6, 5, 4, 3, 2, 1]

function Stack({ n, color, max = 5, top }) {
  const shown = Math.min(n, max)
  return <div className={`bgm-stack${top ? ' is-top' : ''}`}>
    {Array.from({ length: shown }, (_, k) => <span key={k} className={`bgm-chk ${color}`}>{k === shown - 1 && n > max ? n : ''}</span>)}
  </div>
}

// The board. `moves` = allowed single moves; selection is two taps: source, then destination.
function Board({ s, moves = [], onMove, flipColors }) {
  const [from, setFrom] = useState(null)
  useEffect(() => setFrom(null), [s])
  const sources = new Set(moves.map(m => m.from))
  const targets = from === null ? new Map() : new Map(moves.filter(m => m.from === from).sort((a, b) => a.die - b.die).reverse().map(m => [m.to, m]))
  const col = pl => ((pl === HUMAN) !== !!flipColors ? 'is-white' : 'is-black')
  const pick = key => {
    if (from !== null && targets.has(key)) { const m = targets.get(key); setFrom(null); onMove(m); return }
    if (sources.has(key)) { setFrom(from === key ? null : key); return }
    setFrom(null)
  }
  const cell = (p, top) => {
    if (p === 'bar') {
      const pl = top ? CPU : HUMAN
      return <button key={'bar' + top} type="button" className={`bgm-bar${sources.has('bar') && s.turn === pl ? ' is-src' : ''}${from === 'bar' && s.turn === pl ? ' is-sel' : ''}`} onClick={() => s.turn === pl && pick('bar')} aria-label={`בר: ${s.bar[pl]}`}>
        {s.bar[pl] > 0 && <Stack n={s.bar[pl]} color={col(pl)} top={top} max={3} />}
      </button>
    }
    const v = s.pts[p], n = Math.abs(v)
    const cls = ['bgm-pt', top ? 'is-top' : 'is-bottom', p % 2 ? 'is-odd' : 'is-even', sources.has(p) ? 'is-src' : '', from === p ? 'is-sel' : '', targets.has(p) ? 'is-target' : ''].join(' ')
    return <button key={p} type="button" className={cls} onClick={() => pick(p)} aria-label={`נקודה ${p}${n ? `: ${n} ${v > 0 ? 'לבנים' : 'שחורים'}` : ''}`}>
      <i className="bgm-tri" aria-hidden="true" />
      {n > 0 && <Stack n={n} color={col(Math.sign(v))} top={top} />}
      <small className="bgm-num">{p}</small>
    </button>
  }
  const offTarget = targets.has('off')
  return (
    <div className="bgm-board" dir="ltr">
      <div className="bgm-row">{TOP.map(p => cell(p, true))}</div>
      <div className="bgm-row">{BOTTOM.map(p => cell(p, false))}</div>
      <div className="bgm-off">
        <button type="button" className={`bgm-off-slot${offTarget && s.turn === CPU ? ' is-target' : ''}`} onClick={() => s.turn === CPU && pick('off')} aria-label={`הוצאה מהלוח – הוצאו ${s.off[CPU]}`}>{s.off[CPU] > 0 && <span className={`bgm-offbar ${col(CPU)}`} style={{ height: `${s.off[CPU] * 6.2}%` }} />}<b>{s.off[CPU]}</b>{offTarget && s.turn === CPU && <em>הוצאה</em>}</button>
        <button type="button" className={`bgm-off-slot${offTarget && s.turn === HUMAN ? ' is-target' : ''}`} onClick={() => s.turn === HUMAN && pick('off')} aria-label={`הוצאה מהלוח – הוצאו ${s.off[HUMAN]}`}>{s.off[HUMAN] > 0 && <span className={`bgm-offbar ${col(HUMAN)}`} style={{ height: `${s.off[HUMAN] * 6.2}%` }} />}<b>{s.off[HUMAN]}</b>{offTarget && s.turn === HUMAN && <em>הוצאה</em>}</button>
      </div>
    </div>
  )
}

function Dice({ dice, left }) {
  if (!dice.length) return null
  const all = dice.length === 1 ? dice : dice[0] === dice[1] ? [dice[0], dice[0], dice[0], dice[0]] : dice
  const rem = [...left]
  return <div className="bgm-dice" aria-label={`קוביות: ${dice.join(' ו־')}`}>{all.map((d, k) => { const i = rem.indexOf(d); const on = i >= 0; if (on) rem.splice(i, 1); return <span key={k} className={on ? '' : 'is-used'}>{FACES[d]}</span> })}</div>
}

export function BackgammonPlay() {
  const [mode, setMode] = useState('computer')
  const [level, setLevel] = useState(1)
  const [s, setS] = useState(() => newGame())
  const [phase, setPhase] = useState('opening') // opening | roll | move | cpu | over
  const [msg, setMsg] = useState('')
  const [turnStart, setTurnStart] = useState(null)
  const timers = useRef([])
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t) }
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const moves = useMemo(() => (phase === 'move' ? allowedMoves(s) : []), [s, phase])
  const isCpu = pl => mode === 'computer' && pl === CPU
  const name = pl => (pl === HUMAN ? (mode === 'computer' ? 'אתם (לבנים)' : 'הלבנים') : mode === 'computer' ? 'המחשב (שחורים)' : 'השחורים')

  const reset = () => { timers.current.forEach(clearTimeout); setS(newGame()); setPhase('opening'); setMsg(''); setTurnStart(null) }
  const opening = () => {
    const a = rollDie(), b = rollDie()
    if (a === b) { setMsg(`שניכם הטלתם ${a} – מטילים שוב…`); return }
    const first = a > b ? HUMAN : CPU
    const st = { ...newGame(), turn: first, dice: [a, b], left: [a, b] }
    setMsg(`לבנים: ${FACES[a]} ${a} · שחורים: ${FACES[b]} ${b} → ${name(first)} מתחילים, עם ${a} ו־${b}`)
    startTurn(st)
  }
  const startTurn = st => {
    setS(st); setTurnStart(clone(st))
    if (!allowedMoves(st).length) { setPhase('wait'); setMsg(m => `${m ? m + ' · ' : ''}אין ל${name(st.turn)} מהלך אפשרי – התור עובר`); later(() => endTurn(st), 1800); return }
    if (isCpu(st.turn)) { setPhase('cpu'); playCpu(st) } else setPhase('move')
  }
  const endTurn = st => {
    if (winner(st)) { setS(st); setPhase('over'); return }
    const next = { ...clone(st), turn: -st.turn, dice: [], left: [] }
    setS(next); setTurnStart(null)
    if (isCpu(next.turn)) later(() => roll(next), 700)
    else setPhase('roll')
  }
  const roll = (st = s) => {
    const d = [rollDie(), rollDie()]
    setMsg(`${name(st.turn)} הטילו ${d[0]} ו־${d[1]}${d[0] === d[1] ? ' – דאבל! 4 מהלכים' : ''}`)
    startTurn({ ...clone(st), dice: d, left: diceToMoves(d) })
  }
  const playCpu = st => {
    const seq = computerSequence(st, level)
    let cur = st
    seq.forEach((m, k) => later(() => { cur = applySingle(cur, m).state; setS(cur); if (k === seq.length - 1) later(() => endTurn(cur), 700) }, 700 * (k + 1)))
    if (!seq.length) later(() => endTurn(st), 900)
  }
  const human = m => {
    const { state: ns, hit } = applySingle(s, m)
    setS(ns)
    if (hit) setMsg('💥 אכלתם! האבן של היריב עפה לבר')
    if (winner(ns)) { setPhase('over'); return }
    if (!ns.left.length || !allowedMoves(ns).length) { setPhase('wait'); later(() => endTurn(ns), 700) }
  }
  const undo = () => { if (turnStart) { setS(clone(turnStart)); setPhase('move') } }

  const w = winner(s)
  const gammon = w && s.off[-w] === 0
  return (
    <div className="bg-play">
      <div className="bg-controls">
        <label>מצב: <select value={mode} onChange={e => { setMode(e.target.value); reset() }}><option value="computer">נגד המחשב</option><option value="friend">נגד חבר (על אותו מסך)</option></select></label>
        {mode === 'computer' && <label>רמה: <select value={level} onChange={e => setLevel(+e.target.value)}>{LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}</select></label>}
      </div>
      <p className="bg-status" role="status">
        {phase === 'over' ? `🏆 ${name(w)} ניצחו!${gammon ? ' ועוד במארס (היריב לא הוציא אף אבן) 🎉' : ''}`
          : phase === 'cpu' ? '🤔 המחשב משחק…' : phase === 'opening' ? 'כל אחד מטיל קוביה אחת – הגבוה מתחיל' : phase === 'roll' ? `תור: ${name(s.turn)} – הטילו קוביות` : `תור: ${name(s.turn)}`}
      </p>
      {msg && <p className="bgm-msg">{msg}</p>}
      <div className="bgm-top">
        <Dice dice={s.dice} left={s.left} />
        {phase === 'opening' && <button type="button" className="bgm-roll" onClick={opening}>🎲 מי מתחיל?</button>}
        {phase === 'roll' && <button type="button" className="bgm-roll" onClick={() => roll()}>🎲 הטילו קוביות</button>}
        {phase === 'move' && <span className="bgm-hint">{moves.length ? 'לחצו על אבן מסומנת ואז על המקום שאליו היא הולכת' : ''}</span>}
      </div>
      <Board s={s} moves={phase === 'move' ? moves : []} onMove={human} />
      <div className="bg-score"><span>⚪ לבנים: נותרו {pips(s, HUMAN)} צעדים</span><span>⚫ שחורים: {pips(s, CPU)}</span></div>
      <div className="bg-actions">
        <button type="button" className="bg-primary" onClick={reset}>🔄 משחק חדש</button>
        {phase === 'move' && <button type="button" onClick={undo}>↩️ ביטול מהלכי התור</button>}
      </div>
    </div>
  )
}

// ---- lessons ----
const L = (human, cpu, left, extra = {}) => {
  const s = newGame(); s.pts = Array(26).fill(0)
  for (const [p, n] of human) s.pts[p] = n
  for (const [p, n] of cpu) s.pts[p] = -n
  s.dice = left.length === 4 ? [left[0], left[0]] : left.slice()
  s.left = left.slice(); s.bar = { 1: extra.bar || 0, [-1]: 0 }; s.off = { 1: extra.off || 0, [-1]: 0 }
  return s
}
const done = s => (!s.left.length || !allowedMoves(s).length ? true : null)

export const BACKGAMMON_LESSONS = [
  { title: 'הלוח', text: 'ללוח יש 24 משולשים ("נקודות"). לכל שחקן 15 אבנים. אתם הלבנים: זזים מנקודה 24 לכיוון נקודה 1, והבית שלכם הוא 6 הנקודות בפינה הימנית למטה. המטרה: להביא את כל האבנים הביתה ולהוציא אותן מהלוח לפני היריב.', setup: () => ({ ...newGame(), dice: [], left: [] }), info: true },
  { title: 'זזים לפי הקוביה', text: 'יצא 3 בקוביה. לחצו על האבן המסומנת ואז על המשולש שמאיר – 3 משולשים קדימה.', setup: () => L([[13, 1]], [[1, 2]], [3]), goal: () => true, ok: 'בדיוק! כל מספר בקוביה = מספר המשולשים שזזים.' },
  { title: 'שתי קוביות', text: 'בכל תור מטילים שתי קוביות ומשחקים את שתיהן – אפשר עם אותה אבן או עם שתי אבנים שונות. שחקו 5 ו-2.', setup: () => L([[13, 2]], [[1, 2]], [5, 2]), goal: (m, s) => done(s), ok: 'מצוין! השתמשתם בשתי הקוביות.' },
  { title: 'נקודה חסומה', text: 'אסור לנחות על משולש שיש בו 2 אבנים או יותר של היריב – הוא "סגור". כאן נקודה 8 סגורה, אז עם ה-5 אי אפשר ללכת מ-13 ל-8. שחקו את הקוביות בדרך אחרת.', setup: () => L([[13, 2]], [[8, 2]], [5, 3]), goal: (m, s) => done(s), ok: 'נכון! תמיד בודקים שהמקום לא סגור.' },
  { title: 'אכילה', text: 'אבן בודדת של היריב פגיעה: אם נוחתים עליה – "אוכלים" אותה, והיא עפה לבר (האמצע) וצריכה להתחיל מחדש. אכלו את האבן השחורה בנקודה 9.', setup: () => L([[13, 1], [6, 2]], [[9, 1], [2, 2]], [4]), goal: m => m.to === 9, ok: '💥 אכלתם! היריב יצטרך להכניס את האבן מחדש.' },
  { title: 'חוזרים מהבר', text: 'כשאוכלים לכם אבן, היא על הבר, וחייבים להכניס אותה ללוח לפני כל מהלך אחר – מהצד של היריב (נקודות 19–24). לחצו על האבן בבר ואז על המקום שמאיר.', setup: () => L([[13, 2]], [[22, 2], [1, 2]], [3, 5], { bar: 1 }), goal: m => (m.from === 'bar' ? true : false), ok: 'חזרתם למשחק! עם 3 נכנסים לנקודה 22, ועם 5 – לנקודה 20.' },
  { title: 'דאבל', text: 'כששתי הקוביות זהות (למשל 2 ו-2) זה "דאבל" – משחקים את המספר ארבע פעמים! שחקו ארבעה מהלכים של 2.', setup: () => L([[13, 2], [8, 2]], [[1, 2]], [2, 2, 2, 2]), goal: (m, s) => done(s), ok: 'ארבעה מהלכים בתור אחד – זה הכוח של דאבל!' },
  { title: 'הוצאת אבנים', text: 'כשכל 15 האבנים שלכם בבית (נקודות 1–6) מתחילים להוציא אותן מהלוח. עם 6 מוציאים אבן מנקודה 6. לחצו על אבן בנקודה 6 ואז על "הוצאה" בצד.', setup: () => L([[6, 5], [4, 5], [1, 5]], [[24, 2]], [6, 1]), goal: m => m.to === 'off', ok: '🏆 הוצאתם אבן! מי שמוציא ראשון את כל 15 האבנים – מנצח.' },
]

export function BackgammonLearn({ onPlay }) {
  return <LessonRunner lessons={BACKGAMMON_LESSONS} onPlay={onPlay} apply={(s, m) => applySingle(s, m).state}
    render={(s, onMove, disabled) => <>
      <div className="bgm-top"><Dice dice={s.dice} left={s.left} /></div>
      <Board s={s} moves={disabled ? [] : allowedMoves(s)} onMove={onMove} />
    </>} />
}
