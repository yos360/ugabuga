import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Chess } from 'chess.js'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import ChessBoard from '../../chess/ChessBoard'
import Piece from '../../chess/Pieces'
import { ChessCards } from '../../chess/ChessLinks'
import { useEngine } from '../../chess/useEngine'
import { LEVELS } from '../../chess/levels'
import '../../chess/chess.css'

// /chess — the chess hub: a full game against the computer (3 levels, engine in a Web Worker)
// or two players on one device, plus links to the puzzles, the how-to page and the printable board.

const VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9 }
const ORDER = ['q', 'r', 'b', 'n', 'p']

function replay(moves) {
  const g = new Chess()
  for (const m of moves) g.move(m)
  return g
}

function Captured({ pieces, lead }) {
  return (
    <div className="cz-captured" aria-label={pieces.length ? `כלים שנאכלו: ${pieces.length}` : 'עוד לא נאכלו כלים'}>
      {pieces.map((p, i) => <Piece key={i} type={p.type} color={p.color} />)}
      {lead > 0 && <b>+{lead}</b>}
    </div>
  )
}

function Seg({ label, value, options, onChange }) {
  return (
    <div>
      <p className="cz-seg-label">{label}</p>
      <div className="cz-seg" role="group" aria-label={label}>
        {options.map(o => <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>{o.label}</button>)}
      </div>
    </div>
  )
}

const FAQ = [
  { q: 'אפשר לשחק שחמט אונליין בחינם ובלי הרשמה?', a: 'כן. הלוח נפתח ישר בדפדפן, בטלפון ובמחשב, בלי הורדה, בלי הרשמה ובלי פרסומות בתוך המשחק.' },
  { q: 'איזו רמה מתאימה לילד שרק התחיל?', a: 'ברמת "מתחיל" המחשב מסתכל רק מהלך אחד קדימה ולפעמים משחק סתם מהלך – ילד שמכיר את תנועת הכלים יכול לנצח אותו. אחרי כמה ניצחונות כדאי לעבור ל"בינוני".' },
  { q: 'איך משחקים שניים על אותו מסך?', a: 'בוחרים "שני שחקנים". כל אחד משחק בתורו, והלוח מסתובב אחרי כל מהלך כך שכל שחקן רואה את הכלים שלו מלמטה. אפשר לכבות את הסיבוב אם יושבים זה מול זה.' },
  { q: 'מה עושים כשרגלי מגיע לסוף הלוח?', a: 'הוא הופך לכלי אחר. על הלוח ייפתח חלון קטן ותבחרו למה להפוך אותו – בדרך כלל למלכה, הכלי החזק ביותר.' },
  { q: 'אפשר לבטל מהלך?', a: 'כן, הכפתור "ביטול מהלך" מחזיר את המהלך האחרון. במשחק נגד המחשב הוא מבטל גם את התשובה של המחשב, כדי שיהיה שוב תורכם.' },
]

export default function ChessPage() {
  const [mode, setMode] = useState('computer')
  const [level, setLevel] = useState('easy')
  const [human, setHuman] = useState('w')
  const [autoFlip, setAutoFlip] = useState(true)
  const [flip, setFlip] = useState(false)
  const [moves, setMoves] = useState([])
  const [thinking, setThinking] = useState(false)
  const [hint, setHint] = useState(null)
  const engine = useEngine()

  const game = useMemo(() => replay(moves), [moves])
  const fen = game.fen()
  const history = useMemo(() => game.history({ verbose: true }), [game])
  const last = history.at(-1)
  const turn = game.turn()
  const over = game.isGameOver()
  const cpuColor = mode === 'computer' ? (human === 'w' ? 'b' : 'w') : null
  const cpuTurn = cpuColor === turn && !over

  // the computer answers on its turn
  useEffect(() => {
    if (!cpuTurn) return undefined
    let live = true
    setThinking(true)
    const started = Date.now()
    engine.ask(fen, level).then(m => {
      if (!live) return
      const wait = Math.max(0, 450 - (Date.now() - started)) // a short pause so the move is visible
      setTimeout(() => {
        if (!live) return
        setThinking(false)
        if (m) setMoves(ms => (replay(ms).fen() === fen ? [...ms, m] : ms))
      }, wait)
    })
    return () => { live = false; engine.cancel(); setThinking(false) }
  }, [cpuTurn, fen, level, engine])

  const play = m => {
    setHint(null)
    try { new Chess(fen).move(m) } catch { return }
    setMoves(ms => [...ms, { from: m.from, to: m.to, ...(m.promotion ? { promotion: m.promotion } : {}) }])
  }
  const newGame = () => { setMoves([]); setHint(null) }
  const undo = () => {
    setHint(null)
    setMoves(ms => {
      if (mode !== 'computer') return ms.slice(0, -1)
      // take back the computer's answer too, so it is the player's turn again
      const turnAfter = n => (n % 2 === 0 ? 'w' : 'b')
      let n = ms.length
      do n--; while (n > 0 && turnAfter(n) !== human)
      return turnAfter(n) === human ? ms.slice(0, n) : ms
    })
  }
  const askHint = () => {
    engine.ask(fen, 'medium').then(m => { if (m) setHint(m) })
  }

  const other = c => (c === 'w' ? 'b' : 'w')
  const baseSide = mode === 'computer' ? human : autoFlip ? turn : 'w'
  const orientation = flip ? other(baseSide) : baseSide
  const bottom = orientation, top = other(orientation)

  // captured pieces and material lead
  const takenBy = { w: [], b: [] }
  for (const h of history) if (h.captured) takenBy[h.color].push({ type: h.captured, color: h.color === 'w' ? 'b' : 'w' })
  for (const c of ['w', 'b']) takenBy[c].sort((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type))
  const score = c => takenBy[c].reduce((s, p) => s + VALUE[p.type], 0)
  const lead = c => Math.max(0, score(c) - score(c === 'w' ? 'b' : 'w'))

  const sideName = c => (mode === 'computer' ? (c === human ? 'אתם' : 'המחשב') : c === 'w' ? 'הלבנים' : 'השחורים')
  let status, tone = ''
  if (game.isCheckmate()) {
    const winner = turn === 'w' ? 'b' : 'w'
    if (mode === 'computer') {
      if (winner === human) { status = `🏆 מט! ניצחתם את המחשב ברמת ${LEVELS.find(l => l.id === level).name}!`; tone = 'is-win' }
      else { status = '😮 מט – המחשב ניצח הפעם. נסו שוב, או בחרו רמה קלה יותר.'; tone = 'is-loss' }
    } else { status = `🏆 מט! ${winner === 'w' ? 'הלבנים' : 'השחורים'} ניצחו!`; tone = 'is-win' }
  } else if (game.isStalemate()) status = '🤝 פט – אין מהלך חוקי, אבל המלך לא בשח. תיקו!'
  else if (game.isThreefoldRepetition()) status = '🤝 תיקו – אותו מצב חזר שלוש פעמים.'
  else if (game.isInsufficientMaterial()) status = '🤝 תיקו – לא נשארו מספיק כלים כדי לתת מט.'
  else if (game.isDraw()) status = '🤝 תיקו – 50 מהלכים בלי אכילה ובלי תזוזת רגלי.'
  else if (thinking || cpuTurn) status = '🤔 המחשב חושב…'
  else {
    const who = mode === 'computer' ? 'תורכם' : `תור ${sideName(turn)}`
    status = game.inCheck() ? `⚠️ שח! ${who} – צריך להציל את המלך` : mode === 'computer' ? `${who} (${turn === 'w' ? 'לבנים' : 'שחורים'})` : who
  }

  const pairs = []
  for (let i = 0; i < history.length; i += 2) pairs.push([history[i], history[i + 1]])
  const movable = over || thinking ? null : mode === 'computer' ? human : 'both'

  return (
    <div className="cz-page" dir="rtl">
      <SEO title="שחמט אונליין בחינם – לשחק נגד המחשב או חבר" description="שחמט אונליין בחינם ובלי הרשמה: משחקים נגד המחשב בשלוש רמות – מתחיל, בינוני ומתקדם – או שני שחקנים על אותו מסך. סימון מהלכים חוקיים, ביטול מהלך ורמז. בטלפון ובמחשב." path="/chess" structuredData={faqSchema(FAQ)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקי אונליין', href: '/online-games' }, { label: 'שחמט אונליין' }]} />
      <header className="cz-head">
        <h1>♟️ שחמט אונליין</h1>
        <p>שחמט אונליין בחינם, ישר מהדפדפן: משחקים נגד המחשב – מרמת מתחיל שילדים מנצחים ועד רמה מתקדמת שתאתגר גם מבוגרים – או שני שחקנים על אותו טלפון. לוחצים על כלי (או גוררים אותו) והלוח מראה לאן מותר לזוז.</p>
      </header>

      <section className="cz-play" aria-label="לוח המשחק">
        <div>
          <p className={`cz-status ${tone}`} role="status" aria-live="polite">{status}</p>
          <Captured pieces={takenBy[top]} lead={lead(top)} />
          <ChessBoard fen={fen} orientation={orientation} movable={movable} onMove={play} lastMove={last} hint={hint} label="לוח שחמט – המשחק" />
          <Captured pieces={takenBy[bottom]} lead={lead(bottom)} />
          <div className="cz-actions">
            <button type="button" className="cz-btn is-primary" onClick={newGame}>🔄 משחק חדש</button>
            <button type="button" className="cz-btn" onClick={undo} disabled={!moves.length || thinking || (mode === 'computer' && moves.length < (human === 'w' ? 1 : 2))}>↩️ ביטול מהלך</button>
            <button type="button" className="cz-btn is-yellow" onClick={askHint} disabled={over || thinking || cpuTurn}>💡 רמז</button>
            <button type="button" className="cz-btn" onClick={() => setFlip(f => !f)}>🔃 סיבוב הלוח</button>
          </div>
        </div>

        <aside className="cz-side cz-box" aria-label="הגדרות ומהלכים">
          <Seg label="מצב משחק" value={mode} onChange={v => { setMode(v); newGame(); setFlip(false) }} options={[{ id: 'computer', label: '🤖 נגד המחשב' }, { id: 'friend', label: '👥 שני שחקנים' }]} />
          {mode === 'computer' ? <>
            <Seg label="רמת המחשב" value={level} onChange={setLevel} options={LEVELS} />
            <Seg label="אני משחק עם" value={human} onChange={v => { setHuman(v); newGame(); setFlip(false) }} options={[{ id: 'w', label: '⚪ לבנים' }, { id: 'b', label: '⚫ שחורים' }]} />
          </> : (
            <label className="cz-check"><input type="checkbox" checked={autoFlip} onChange={e => setAutoFlip(e.target.checked)} /> הלוח מסתובב אחרי כל מהלך</label>
          )}
          <div>
            <p className="cz-seg-label">מהלכים</p>
            <div className="cz-moves" aria-label="רשימת המהלכים">
              {pairs.length ? (
                <ol>{pairs.map(([w, b], i) => (
                  <li key={i}><span className="n">{i + 1}.</span><span className={w === last ? 'last' : ''}>{w.san}</span><span className={b && b === last ? 'last' : ''}>{b?.san || ''}</span></li>
                ))}</ol>
              ) : <p className="cz-empty">הלבנים מתחילים. בהצלחה!</p>}
            </div>
          </div>
        </aside>
      </section>

      <section className="cz-box">
        <h2>עוד בעולם השחמט</h2>
        <ChessCards except="/chess" />
      </section>

      <section className="cz-box">
        <h2>איך משחקים כאן</h2>
        <ul style={{ lineHeight: 1.8, fontSize: 17, margin: 0, paddingInlineStart: 20 }}>
          <li>לוחצים על כלי – נקודות מראות לאן הוא יכול לזוז, ועיגול מסמן כלי שאפשר לאכול. לוחצים על המשבצת, או פשוט גוררים את הכלי.</li>
          <li>רגלי שמגיע לסוף הלוח הופך לכלי שתבחרו. הצרחה: מזיזים את המלך שתי משבצות לכיוון הצריח.</li>
          <li>תקועים? כפתור 💡 מסמן בכחול מהלך טוב. טעיתם? ↩️ מבטל.</li>
          <li>לא בטוחים איך זז כלי מסוים? יש <Link to="/chess/how-to-play" className="underline font-bold">הסבר על כל כלי עם לוח לתרגול</Link>.</li>
        </ul>
      </section>

      <SeoBody
        paragraphs={[
          'שחמט הוא משחק לשני שחקנים על לוח של 64 משבצות. לכל שחקן 16 כלים, והמטרה היא לתת "מט" – לתקוף את המלך של היריב כך שאין לו שום דרך להינצל. כאן אפשר לשחק שחמט אונליין מלא: כל החוקים נבדקים אוטומטית, כולל הצרחה, הכאה דרך הילוכו והכתרה, והמשחק מכריז על שח, מט, פט ותיקו.',
          'המחשב משחק בשלוש רמות. "מתחיל" נועד לילדים ולמי שרק למד את החוקים – הוא עושה טעויות של מתחילים ומשאיר כלים בלי הגנה. "בינוני" כבר לא נותן כלים בחינם ומנצל טעויות. "מתקדם" חושב כמה מהלכים קדימה ויאתגר גם שחקנים מנוסים. המחשב חושב ברקע, כך שהלוח לא נתקע גם בטלפון ישן.',
          'רוצים להשתפר? חידות מט קצרות הן הדרך הכי טובה לראות דפוסים חוזרים – נסו את חידות השחמט שלנו. ומי שמעדיף לשחק ליד שולחן אמיתי יכול להדפיס לוח שחמט וכלים לגזירה, ולשחק בלי מסך בכלל.',
        ]}
        faq={FAQ}
        related={[
          { label: 'חידות שחמט', href: '/chess/puzzles' },
          { label: 'שיעורי שחמט לילדים', href: '/board-games/chess' },
          { label: 'דמקה אונליין', href: '/board-games/checkers' },
          { label: 'משחקי לוח קלאסיים', href: '/board-games' },
        ]}
      />
    </div>
  )
}
