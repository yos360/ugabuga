import { useEffect, useMemo, useState } from 'react'
import { VARIANTS, LEVELS, newGame, legalMoves, applyMove, status, computerMove, rc, idx, isDark } from './engine'

// Interactive checkers board. Selection is step-by-step: tap a piece, then each landing square of the
// capture chain, so multi-jumps are played exactly as on a real board.

function Board({ state, onMove, disabled, flipped = false, lastMove }) {
  const moves = useMemo(() => (disabled ? [] : legalMoves(state)), [state, disabled])
  const [prefix, setPrefix] = useState([])
  useEffect(() => setPrefix([]), [state])
  const matching = moves.filter(m => prefix.every((p, i) => m.path[i] === p))
  const movable = new Set(moves.map(m => m.path[0]))
  const next = new Set(prefix.length ? matching.map(m => m.path[prefix.length]).filter(x => x !== undefined) : [])
  const mustCapture = moves.length && moves[0].captures.length > 0
  const lastSet = new Set(lastMove ? lastMove.path : [])

  const click = i => {
    if (disabled) return
    if (movable.has(i) && (!prefix.length || !next.has(i))) { setPrefix([i]); return }
    if (!next.has(i)) { setPrefix([]); return }
    const np = [...prefix, i]
    const done = moves.filter(m => m.path.length === np.length && np.every((p, k) => m.path[k] === p))
    const more = moves.some(m => m.path.length > np.length && np.every((p, k) => m.path[k] === p))
    if (done.length && !more) { setPrefix([]); onMove(done[0]) } else setPrefix(np)
  }
  const shown = prefix.length ? prefix : []
  const board = state.board.slice()
  if (shown.length > 1) { const p = board[shown[0]]; board[shown[0]] = 0; board[shown[shown.length - 1]] = p }

  const cells = []
  for (let vr = 0; vr < 8; vr++) for (let vc = 0; vc < 8; vc++) {
    const r = flipped ? 7 - vr : vr, c = flipped ? 7 - vc : vc, i = idx(r, c), p = board[i]
    const dark = isDark(r, c)
    const cls = ['ck-cell', dark ? 'is-dark' : 'is-light', lastSet.has(i) ? 'is-last' : '', next.has(i) ? 'is-target' : '',
      shown.includes(i) ? 'is-path' : '', !prefix.length && mustCapture && movable.has(i) ? 'is-must' : ''].join(' ')
    cells.push(
      <button key={i} type="button" className={cls} disabled={!dark} onClick={() => click(i)}
        aria-label={`${'אבגדהוזח'[c]}${8 - r}${p ? (p > 0 ? ' אבן כהה' : ' אבן בהירה') + (Math.abs(p) === 2 ? ' מלך' : '') : ''}`}>
        {p !== 0 && <span className={`ck-piece ${p > 0 ? 'ck-dark' : 'ck-light'}${prefix[0] === i || shown[shown.length - 1] === i && shown.length > 1 ? ' is-sel' : ''}`}>{Math.abs(p) === 2 && '👑'}</span>}
        {next.has(i) && !p && <span className="ck-dot" aria-hidden="true" />}
      </button>
    )
  }
  return <div className="ck-board" dir="ltr">{cells}</div>
}

const count = (b, s) => b.filter(p => Math.sign(p) === s).length

export function CheckersPlay() {
  const [variant, setVariant] = useState('basic')
  const [mode, setMode] = useState('computer')
  const [level, setLevel] = useState(1)
  const [state, setState] = useState(() => newGame('basic'))
  const st = status(state)
  const cpuTurn = mode === 'computer' && state.turn === -1 && !st.over
  const last = state.history.at(-1)?.move

  useEffect(() => {
    if (!cpuTurn) return
    const t = setTimeout(() => { const m = computerMove(state, level); if (m) setState(s => applyMove(s, m)) }, 450)
    return () => clearTimeout(t)
  }, [cpuTurn, state, level])

  const restart = (v = variant) => setState(newGame(v))
  const undo = () => {
    let s = state, n = mode === 'computer' ? (state.turn === 1 ? 2 : 1) : 1
    while (n-- > 0 && s.history.length) { const h = s.history.at(-1); s = { ...s, board: h.prev, turn: -s.turn, history: s.history.slice(0, -1), quiet: 0 } }
    setState(s)
  }
  const who = s => (s === 1 ? (mode === 'computer' ? 'אתם (כהים)' : 'הכהים') : mode === 'computer' ? 'המחשב (בהירים)' : 'הבהירים')

  return (
    <div className="bg-play">
      <div className="bg-controls">
        <label>מצב: <select value={mode} onChange={e => { setMode(e.target.value); restart() }}><option value="computer">נגד המחשב</option><option value="friend">נגד חבר (על אותו מסך)</option></select></label>
        {mode === 'computer' && <label>רמה: <select value={level} onChange={e => setLevel(+e.target.value)}>{LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}</select></label>}
        <label>חוקים: <select value={variant} onChange={e => { setVariant(e.target.value); restart(e.target.value) }}>{Object.values(VARIANTS).map(v => <option key={v.id} value={v.id}>{v.label}</option>)}</select></label>
      </div>
      <p className="bg-status" role="status">
        {st.over ? (st.winner === 0 ? `🤝 תיקו! ${st.reason}` : `🏆 ${who(st.winner)} ניצחו! (${st.reason})`)
          : cpuTurn ? '🤔 המחשב חושב…' : `תור: ${who(state.turn)}${legalMoves(state)[0]?.captures.length ? ' – חובה לאכול!' : ''}`}
      </p>
      <Board state={state} onMove={m => setState(s => applyMove(s, m))} disabled={st.over || cpuTurn} lastMove={last} />
      <div className="bg-score"><span>⚫ כהים: {count(state.board, 1)}</span><span>⚪ בהירים: {count(state.board, -1)}</span></div>
      <div className="bg-actions">
        <button type="button" className="bg-primary" onClick={() => restart()}>🔄 משחק חדש</button>
        <button type="button" onClick={undo} disabled={!state.history.length}>↩️ ביטול מהלך</button>
      </div>
    </div>
  )
}

// ---- lessons ----
const P = (list, variant = 'basic') => { const b = Array(64).fill(0); for (const [r, c, p] of list) b[idx(r, c)] = p; return { board: b, turn: 1, variant, quiet: 0, history: [] } }
const lightLeft = s => s.board.filter(p => p < 0).length

export const CHECKERS_LESSONS = [
  { title: 'הלוח והאבנים', text: 'משחקים על לוח של 8×8 משבצות, רק על המשבצות הכהות. לכל שחקן 12 אבנים בשלוש השורות הקרובות אליו. הכהים מתחילים. המטרה: לאכול את כל האבנים של היריב או לחסום אותן כך שלא יוכל לזוז.', setup: () => newGame('basic'), info: true },
  { title: 'צעד ראשון', text: 'אבן זזה משבצת אחת באלכסון קדימה, אל משבצת כהה ריקה. לחצו על האבן ואז על אחת הנקודות.', setup: () => P([[5, 2, 1], [1, 6, -1]]), goal: () => true, ok: 'מעולה! ככה זזים בדמקה – תמיד באלכסון, תמיד קדימה.' },
  { title: 'אכילה', text: 'כשאבן של היריב צמודה אליכם באלכסון, ומאחוריה משבצת ריקה – קופצים מעליה ו"אוכלים" אותה. נסו לאכול את האבן הבהירה.', setup: () => P([[5, 2, 1], [4, 3, -1], [1, 0, -1]]), goal: m => m.captures.length > 0, ok: 'אכלתם! האבן של היריב יוצאת מהלוח.' },
  { title: 'חובה לאכול', text: 'אם אפשר לאכול – חובה לאכול! שימו לב: רק האבן שמסומנת בצהוב יכולה לזוז עכשיו.', setup: () => P([[5, 0, 1], [5, 4, 1], [4, 5, -1], [0, 1, -1]]), goal: m => m.captures.length > 0, ok: 'נכון! כשיש אכילה – היא קודמת לכל מהלך אחר.' },
  { title: 'שרשרת אכילות', text: 'אם אחרי אכילה אפשר לאכול שוב – ממשיכים לקפוץ באותו תור. אכלו שתי אבנים בבת אחת!', setup: () => P([[6, 1, 1], [5, 2, -1], [3, 4, -1], [0, 7, -1]]), goal: m => m.captures.length >= 2, ok: 'וואו, דאבל! שרשרת אכילות היא הדרך לתפוס הרבה אבנים בבת אחת.' },
  { title: 'להפוך למלך', text: 'אבן שמגיעה לשורה האחרונה בצד של היריב הופכת ל"מלך" 👑. הביאו את האבן לשורה העליונה.', setup: () => P([[1, 2, 1], [4, 7, -1]]), goal: (m, s) => Math.abs(s.board[m.path.at(-1)]) === 2, ok: 'יש לכם מלך! 👑' },
  { title: 'המלך זז לכל הכיוונים', text: 'מלך יכול לזוז באלכסון גם אחורה. הזיזו את המלך אחורה – למטה.', setup: () => P([[3, 4, 2], [0, 1, -1]]), goal: m => rc(m.path.at(-1))[0] > rc(m.path[0])[0], ok: 'בדיוק! המלך חזק כי הוא יכול לחזור אחורה ולתקוף מכל כיוון.' },
  { title: 'ניצחון!', text: 'ליריב נשארה אבן אחת. אכלו אותה ונצחו במשחק.', setup: () => P([[3, 2, 2], [2, 3, -1], [7, 0, 1]]), goal: (m, s) => lightLeft(s) === 0, ok: '🏆 ניצחתם! עכשיו אתם מוכנים לשחק משחק שלם.' },
]

export function CheckersLearn({ onPlay }) {
  return <LessonRunner lessons={CHECKERS_LESSONS} onPlay={onPlay} render={(state, onMove, disabled) => <Board state={state} onMove={onMove} disabled={disabled} lastMove={state.history.at(-1)?.move} />} apply={applyMove} />
}

// Shared lesson runner (used by the other board games too).
export function LessonRunner({ lessons, render, apply, onPlay }) {
  const [n, setN] = useState(0)
  const [state, setState] = useState(() => lessons[0].setup())
  const [result, setResult] = useState(null) // 'ok' | 'no'
  const L = lessons[n]
  const go = k => { setN(k); setState(lessons[k].setup()); setResult(null) }
  const onMove = m => {
    const s = apply(state, m)
    setState(s)
    if (L.goal(m, s, state)) setResult('ok')
    else { setResult('no'); setTimeout(() => { setState(L.setup()); setResult(null) }, 1400) }
  }
  return (
    <div className="bg-learn">
      <ol className="bg-lesson-steps" aria-label="שיעורים">
        {lessons.map((l, k) => <li key={l.title}><button type="button" className={k === n ? 'is-on' : ''} onClick={() => go(k)}>{k + 1}</button></li>)}
      </ol>
      <h3>שיעור {n + 1}: {L.title}</h3>
      <p className="bg-lesson-text">{L.text}</p>
      {result === 'ok' && <p className="bg-lesson-ok" role="status">✔️ {L.ok}</p>}
      {result === 'no' && <p className="bg-lesson-no" role="status">כמעט! נסו שוב…</p>}
      {render(state, onMove, !!L.info || result === 'ok')}
      <div className="bg-actions">
        {(L.info || result === 'ok') && (n + 1 < lessons.length
          ? <button type="button" className="bg-primary" onClick={() => go(n + 1)}>לשיעור הבא ←</button>
          : <button type="button" className="bg-primary" onClick={onPlay}>🎮 לשחק משחק אמיתי</button>)}
        {!L.info && <button type="button" onClick={() => go(n)}>🔁 להתחיל את השיעור מחדש</button>}
      </div>
    </div>
  )
}
