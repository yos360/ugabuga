import { useEffect, useMemo, useRef, useState } from 'react'
import { Chess } from 'chess.js'
import LessonRunner from '../LessonRunner'
import { LEVELS } from './ai'

// Chess board on top of chess.js (rules) with a small computer player running in a Web Worker.
const GLYPH = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
const NAME = { k: 'מלך', q: 'מלכה', r: 'צריח', b: 'רץ', n: 'פרש', p: 'רגלי' }
const FILES = 'abcdefgh'

function Board({ fen, onMove, disabled, lastMove, flipped = false }) {
  const game = useMemo(() => new Chess(fen), [fen])
  const [sel, setSel] = useState(null)
  useEffect(() => setSel(null), [fen])
  const moves = useMemo(() => (disabled ? [] : game.moves({ verbose: true })), [game, disabled])
  const targets = new Map(sel ? moves.filter(m => m.from === sel).map(m => [m.to, m]) : [])
  const check = game.inCheck() ? game.board().flat().find(p => p && p.type === 'k' && p.color === game.turn())?.square : null
  const click = sq => {
    if (sel && targets.has(sq)) { const m = targets.get(sq); onMove({ from: m.from, to: m.to, promotion: m.promotion ? 'q' : undefined }); setSel(null); return }
    const p = game.get(sq)
    if (p && p.color === game.turn() && moves.some(m => m.from === sq)) setSel(sq === sel ? null : sq)
    else setSel(null)
  }
  const cells = []
  for (let vr = 0; vr < 8; vr++) for (let vc = 0; vc < 8; vc++) {
    const r = flipped ? 7 - vr : vr, c = flipped ? 7 - vc : vc
    const sq = FILES[c] + (8 - r), p = game.get(sq), dark = (r + c) % 2 === 1
    const t = targets.get(sq)
    cells.push(
      <button key={sq} type="button" onClick={() => click(sq)}
        className={['ch-cell', dark ? 'is-dark' : 'is-light', sel === sq ? 'is-sel' : '', lastMove && (lastMove.from === sq || lastMove.to === sq) ? 'is-last' : '', check === sq ? 'is-check' : ''].join(' ')}
        aria-label={`${sq}${p ? ` ${p.color === 'w' ? 'לבן' : 'שחור'} ${NAME[p.type]}` : ''}`}>
        {p && <span className={`ch-piece ${p.color === 'w' ? 'is-w' : 'is-b'}`}>{GLYPH[p.type]}</span>}
        {t && <span className={t.captured ? 'ch-cap' : 'ch-dot'} aria-hidden="true" />}
        {vc === 0 && <small className="ch-rank">{8 - r}</small>}
        {vr === 7 && <small className="ch-file">{FILES[c]}</small>}
      </button>
    )
  }
  return <div className="ch-board" dir="ltr">{cells}</div>
}

function useComputer() {
  const worker = useRef(null), cb = useRef(null), seq = useRef(0)
  useEffect(() => {
    worker.current = new Worker(new URL('./ai.worker.js', import.meta.url), { type: 'module' })
    worker.current.onmessage = e => { if (e.data.id === seq.current) cb.current?.(e.data.move) }
    return () => worker.current?.terminate()
  }, [])
  return (fen, level, done) => { cb.current = done; worker.current?.postMessage({ fen, level, id: ++seq.current }) }
}

const captured = (fen, color) => {
  const start = { p: 8, n: 2, b: 2, r: 2, q: 1 }
  const g = new Chess(fen), have = { p: 0, n: 0, b: 0, r: 0, q: 0 }
  g.board().flat().forEach(p => { if (p && p.color === color && p.type !== 'k') have[p.type]++ })
  return Object.keys(start).flatMap(t => Array(Math.max(0, start[t] - have[t])).fill(GLYPH[t])).join('')
}

export function ChessPlay() {
  const [mode, setMode] = useState('computer')
  const [level, setLevel] = useState(1)
  const [history, setHistory] = useState([{ fen: new Chess().fen(), move: null }])
  const [thinking, setThinking] = useState(false)
  const think = useComputer()
  const { fen, move: last } = history.at(-1)
  const game = useMemo(() => new Chess(fen), [fen])
  const over = game.isGameOver()
  const cpuTurn = mode === 'computer' && game.turn() === 'b' && !over

  const play = mv => {
    const g = new Chess(fen)
    try { const m = g.move(mv); setHistory(h => [...h, { fen: g.fen(), move: m }]) } catch { /* illegal */ }
  }
  useEffect(() => {
    if (!cpuTurn) return
    setThinking(true)
    const t = setTimeout(() => think(fen, level, m => { setThinking(false); if (m) play({ from: m.from, to: m.to, promotion: m.promotion }) }), 250)
    return () => clearTimeout(t)
  }, [cpuTurn, fen]) // eslint-disable-line react-hooks/exhaustive-deps

  const restart = () => { setHistory([{ fen: new Chess().fen(), move: null }]); setThinking(false) }
  const undo = () => setHistory(h => { let n = mode === 'computer' ? (game.turn() === 'w' ? 2 : 1) : 1; return h.slice(0, Math.max(1, h.length - n)) })
  const side = c => (c === 'w' ? (mode === 'computer' ? 'אתם (לבנים)' : 'הלבנים') : mode === 'computer' ? 'המחשב (שחורים)' : 'השחורים')
  let status
  if (game.isCheckmate()) status = `🏆 מט! ${side(game.turn() === 'w' ? 'b' : 'w')} ניצחו`
  else if (game.isStalemate()) status = '🤝 פט – למי שבתור אין מהלך חוקי, אבל הוא לא בשח. תיקו!'
  else if (game.isDraw()) status = '🤝 תיקו'
  else status = cpuTurn || thinking ? '🤔 המחשב חושב…' : `תור: ${side(game.turn())}${game.inCheck() ? ' – ⚠️ שח! צריך להציל את המלך' : ''}`

  return (
    <div className="bg-play">
      <div className="bg-controls">
        <label>מצב: <select value={mode} onChange={e => { setMode(e.target.value); restart() }}><option value="computer">נגד המחשב</option><option value="friend">נגד חבר (על אותו מסך)</option></select></label>
        {mode === 'computer' && <label>רמה: <select value={level} onChange={e => setLevel(+e.target.value)}>{LEVELS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}</select></label>}
      </div>
      <p className="bg-status" role="status">{status}</p>
      <p className="ch-captured" aria-label="כלים שנאכלו">{captured(fen, 'w')}</p>
      <Board fen={fen} onMove={play} disabled={over || cpuTurn || thinking} lastMove={last} />
      <p className="ch-captured" aria-label="כלים שנאכלו">{captured(fen, 'b')}</p>
      <div className="bg-actions">
        <button type="button" className="bg-primary" onClick={restart}>🔄 משחק חדש</button>
        <button type="button" onClick={undo} disabled={history.length < 2 || thinking}>↩️ ביטול מהלך</button>
      </div>
      <p className="bgm-hint">רגלי שמגיע לקצה הלוח הופך אוטומטית למלכה.</p>
    </div>
  )
}

// ---- lessons: one piece at a time, then check, mate, castling and promotion ----
const f = board => `${board} w - - 0 1`
export const CHESS_LESSONS = [
  { title: 'הלוח והכלים', text: 'שחמט משחקים על לוח של 8×8. לכל שחקן 16 כלים: מלך ♚, מלכה ♛, 2 צריחים ♜, 2 רצים ♝, 2 פרשים ♞ ו-8 רגלים ♟. הלבנים מתחילים. המטרה: "מט" – לתקוף את המלך של היריב כך שאין לו איך לברוח.', setup: () => new Chess().fen(), info: true },
  { title: 'הצריח ♜', text: 'הצריח זז בקווים ישרים – למעלה, למטה, ימינה ושמאלה – כמה משבצות שרוצה, עד שנתקל בכלי. אכלו את הרגלי השחור עם הצריח.', setup: () => f('4k3/8/8/3p4/8/8/3R4/K7'), goal: m => m.piece === 'r' && !!m.captured, ok: 'מצוין! הצריח אכל ישר קדימה.' },
  { title: 'הרץ ♝', text: 'הרץ זז רק באלכסון, כמה משבצות שרוצה. אכלו את הפרש השחור עם הרץ.', setup: () => f('4k3/8/6n1/8/8/8/2B5/K7'), goal: m => m.piece === 'b' && !!m.captured, ok: 'בדיוק! הרץ תמיד נשאר על משבצות באותו צבע.' },
  { title: 'המלכה ♛', text: 'המלכה היא הכלי החזק ביותר: זזה גם כמו צריח וגם כמו רץ. אכלו את הצריח השחור.', setup: () => f('4k3/8/8/7r/8/8/8/K2Q4'), goal: m => m.piece === 'q' && !!m.captured, ok: 'יפה! למלכה יש הכי הרבה אפשרויות.' },
  { title: 'הפרש ♞', text: 'הפרש קופץ בצורת "ר" (או L): שתי משבצות לכיוון אחד ועוד אחת הצידה. הוא היחיד שיכול לקפוץ מעל כלים! אכלו את הרץ השחור.', setup: () => f('4k3/8/8/4b3/8/3N4/8/K7'), goal: m => m.piece === 'n' && !!m.captured, ok: 'קפיצה מושלמת!' },
  { title: 'הרגלי ♟', text: 'הרגלי זז משבצת אחת קדימה (בצעד הראשון – אפשר שתיים), אבל אוכל באלכסון! אכלו את הפרש עם הרגלי.', setup: () => f('4k3/8/8/8/3n4/4P3/8/K7'), goal: m => m.piece === 'p' && !!m.captured, ok: 'נכון! רגלי הולך ישר ואוכל באלכסון.' },
  { title: 'המלך ♚ ו"שח"', text: 'המלך זז משבצת אחת לכל כיוון. כשמאיימים לאכול את המלך אומרים "שח", והיריב חייב להציל אותו. תנו שח למלך השחור עם הצריח.', setup: () => f('4k3/8/8/8/8/8/8/K6R'), goal: m => m.san.includes('+') || m.san.includes('#'), ok: 'שח! עכשיו השחור חייב לברוח או לחסום.' },
  { title: 'מט בצעד אחד', text: '"מט" זה שח שאי אפשר לברוח ממנו – וזה הניצחון. המלך השחור חסום על ידי הרגלים שלו. מצאו את המט!', setup: () => f('6k1/5ppp/8/8/8/8/8/R5K1'), goal: m => m.san.includes('#'), ok: '🏆 מט! ניצחתם. זה נקרא "מט שורה אחורית".' },
  { title: 'הצרחה', text: 'פעם אחת במשחק אפשר להזיז את המלך שתי משבצות לכיוון צריח, והצריח קופץ מעליו – "הצרחה". היא שומרת על המלך. לחצו על המלך ואז על המשבצת g1.', setup: () => 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1', goal: m => m.flags.includes('k') || m.flags.includes('q'), ok: 'הצרחתם! המלך מוגן והצריח נכנס למשחק.' },
  { title: 'הכתרה', text: 'רגלי שמגיע לשורה האחרונה הופך לכלי אחר – בדרך כלל למלכה! הביאו את הרגלי לסוף הלוח.', setup: () => f('4k3/1P6/8/8/8/8/8/K7'), goal: m => !!m.promotion, ok: '👑 הרגלי הפך למלכה! עכשיו אתם מוכנים למשחק אמיתי.' },
]

export function ChessLearn({ onPlay }) {
  const lessons = useMemo(() => CHESS_LESSONS.map(l => (l.goal ? { ...l, goal: (m, s, prev) => l.goal(m.result, s, prev) } : l)), [])
  return <LessonRunner lessons={lessons} onPlay={onPlay}
    apply={(fen, mv) => { const g = new Chess(fen); const m = g.move(mv); mv.result = m; return g.fen() }}
    render={(fen, onMove, disabled) => <Board fen={fen} disabled={disabled} onMove={mv => onMove(mv)} />} />
}
