import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Chess } from 'chess.js'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import ChessBoard from '../../chess/ChessBoard'
import { ChessCards } from '../../chess/ChessLinks'
import { PUZZLES, PUZZLE_LEVELS } from '../../chess/puzzles'
import { forcesMateIn2, bestDefence } from '../../chess/puzzleLogic'
import '../../chess/chess.css'

// /chess/puzzles — mate-in-1 and mate-in-2 puzzles solved on the board, with hints and feedback.

const STORE = 'ugabuga-chess-puzzles'
const loadSolved = () => { try { return new Set(JSON.parse(localStorage.getItem(STORE) || '[]')) } catch { return new Set() } }
const saveSolved = s => { try { localStorage.setItem(STORE, JSON.stringify([...s])) } catch { /* private mode */ } }
const sideName = c => (c === 'w' ? 'הלבנים' : 'השחורים')

const FAQ = [
  { q: 'מה זה חידת "מט בצעד אחד"?', a: 'מוצגת עמדה על הלוח, וצריך למצוא את המהלך היחיד שנותן מט מיד – שח שהמלך לא יכול להינצל ממנו. בכל החידות כאן יש פתרון אחד בלבד.' },
  { q: 'איך פותרים חידת "מט בשני צעדים"?', a: 'משחקים מהלך ראשון, המחשב עונה בהגנה הכי טובה, ואז צריך לתת מט. לרוב המהלך הראשון הוא הקרבה או מהלך שקט שסוגר למלך את הדרך.' },
  { q: 'למי מתאימות חידות השחמט?', a: 'הרמה הקלה מתאימה לילדים מגיל 6–7 שכבר מכירים את תנועת הכלים. הרמה הבינונית מלמדת דפוסי מט מפורסמים, והמאתגרת מתאימה לשחקנים שכבר משחקים משחקים שלמים.' },
  { q: 'החידות נשמרות?', a: 'החידות שפתרתם מסומנות בירוק בדפדפן הזה, כדי שתדעו מאיפה להמשיך. לא צריך הרשמה.' },
]

export default function ChessPuzzlesPage() {
  const [levelId, setLevelId] = useState('easy')
  const list = useMemo(() => PUZZLES.filter(p => p.level === levelId), [levelId])
  const [id, setId] = useState(list[0].id)
  const puzzle = PUZZLES.find(p => p.id === id)
  const [fen, setFen] = useState(puzzle.fen)
  const [stage, setStage] = useState(0) // 0: first move, 1: computer defends, 2: final move, 3: solved
  const [last, setLast] = useState(null)
  const [feedback, setFeedback] = useState(null) // { tone, text }
  const [showHint, setShowHint] = useState(false)
  const [solved, setSolved] = useState(() => new Set())
  const timers = useRef([])
  useEffect(() => { setSolved(loadSolved()) }, [])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))
  const clearLater = () => { timers.current.forEach(clearTimeout); timers.current = [] }

  const solver = new Chess(puzzle.fen).turn()
  const twoMoves = puzzle.solution.length === 3
  const index = list.findIndex(p => p.id === id)

  const open = pid => {
    clearLater()
    const p = PUZZLES.find(x => x.id === pid)
    setId(pid); setFen(p.fen); setStage(0); setLast(null); setFeedback(null); setShowHint(false)
  }
  const pickLevel = l => { setLevelId(l); open(PUZZLES.find(p => p.level === l).id) }
  const markSolved = () => {
    setStage(3)
    setSolved(prev => { const n = new Set(prev); n.add(id); saveSolved(n); return n })
  }

  const onMove = m => {
    if (stage === 1 || stage === 3) return
    const g = new Chess(fen)
    let played
    try { played = g.move(m) } catch { return }
    setFen(g.fen()); setLast(played); setShowHint(false)
    if (g.isCheckmate()) {
      markSolved()
      setFeedback({ tone: 'is-ok', text: `🏆 מט! ${puzzle.explain}` })
      return
    }
    const retry = (text, back) => {
      setFeedback({ tone: 'is-no', text })
      later(() => { setFen(back); setLast(null); setFeedback(f => (f?.tone === 'is-no' ? null : f)) }, 1500)
    }
    if (!twoMoves || stage === 2) { retry(g.inCheck() ? 'זה שח, אבל המלך עוד יכול להינצל. נסו מהלך אחר!' : 'זה עוד לא מט. נסו שוב!', fen); return }
    // mate in 2, first move: any move that forces mate next turn is accepted
    if (!forcesMateIn2(fen, played.san)) { retry('המהלך הזה לא מכריח מט בצעד הבא. חפשו מהלך חזק יותר!', fen); return }
    setStage(1)
    setFeedback({ tone: 'is-info', text: `👍 מהלך חזק! ${sideName(g.turn())} עונים…` })
    const after = g.fen()
    later(() => {
      const d = bestDefence(after, played.san === puzzle.solution[0] ? puzzle.solution[1] : undefined)
      const g2 = new Chess(after)
      const dm = g2.move({ from: d.from, to: d.to, promotion: d.promotion })
      setFen(g2.fen()); setLast(dm); setStage(2)
      setFeedback({ tone: 'is-info', text: `${sideName(g2.turn() === 'w' ? 'b' : 'w')} שיחקו ${dm.san}. עכשיו – מט!` })
    }, 800)
  }

  const showSolution = () => {
    clearLater()
    const g = new Chess(puzzle.fen)
    setFen(puzzle.fen); setLast(null); setStage(1)
    setFeedback({ tone: 'is-info', text: `הפתרון: ${puzzle.solution.join(' ')}` })
    puzzle.solution.forEach((san, i) => later(() => {
      const mv = g.move(san)
      setFen(g.fen()); setLast(mv)
      if (i === puzzle.solution.length - 1) { setStage(3); setFeedback({ tone: 'is-info', text: `הפתרון: ${puzzle.solution.join(' ')} – ${puzzle.explain}` }) }
    }, 700 * (i + 1)))
  }

  const nextId = list[(index + 1) % list.length].id
  const solverMove = stage === 2 ? puzzle.solution[2] : puzzle.solution[0]
  const hintFrom = showHint ? (() => { try { return new Chess(fen).move(solverMove).from } catch { return null } })() : null
  const level = PUZZLE_LEVELS.find(l => l.id === levelId)

  return (
    <div className="cz-page" dir="rtl">
      <SEO title="חידות שחמט – 36 חידות מט לילדים ולמבוגרים" description="חידות שחמט בחינם: 36 חידות מט בצעד אחד ובשני צעדים בשלוש רמות, פותרים על הלוח ומקבלים משוב מיד. דפוסי מט מפורסמים – מט חנוק, השורה האחורית ועוד." path="/chess/puzzles" structuredData={faqSchema(FAQ)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'שחמט אונליין', href: '/chess' }, { label: 'חידות שחמט' }]} />
      <header className="cz-head">
        <h1>🧩 חידות שחמט</h1>
        <p>חידות שחמט קצרות שפותרים ישר על הלוח: מוצאים את המהלך שנותן מט. מתחילים בדפוסים הבסיסיים, ממשיכים למטים המפורסמים ומסיימים במט בשני צעדים.</p>
      </header>

      <div className="cz-seg" role="group" aria-label="רמת החידות" style={{ maxWidth: 640, margin: '0 auto 14px' }}>
        {PUZZLE_LEVELS.map(l => <button key={l.id} type="button" aria-pressed={levelId === l.id} onClick={() => pickLevel(l.id)}>{l.emoji} {l.label}<small style={{ display: 'block', fontWeight: 600, fontSize: 12 }}>{l.sub}</small></button>)}
      </div>

      <section className="cz-play">
        <div>
          <p className="cz-status" role="status">{stage === 3 ? '✔️ נפתרה!' : `${sideName(solver)} משחקים ונותנים מט ${twoMoves ? 'בשני צעדים' : 'בצעד אחד'}`}</p>
          <ChessBoard fen={fen} orientation={solver} movable={stage === 0 || stage === 2 ? solver : null} onMove={onMove} lastMove={last} highlight={hintFrom ? [hintFrom] : []} label={`חידה ${index + 1}: ${puzzle.title}`} />
          {feedback && <p className={`cz-feedback ${feedback.tone}`} role="status">{feedback.text}</p>}
          <div className="cz-actions">
            {stage === 3
              ? <button type="button" className="cz-btn is-primary" onClick={() => open(nextId)}>לחידה הבאה ←</button>
              : <button type="button" className="cz-btn is-yellow" onClick={() => setShowHint(true)} disabled={stage === 1}>💡 רמז</button>}
            <button type="button" className="cz-btn" onClick={() => open(id)}>🔁 מההתחלה</button>
            {stage !== 3 && <button type="button" className="cz-btn" onClick={showSolution}>👀 הפתרון</button>}
          </div>
          {showHint && stage !== 3 && <p className="cz-feedback is-info">💡 {puzzle.hint} הכלי שצריך להזיז מסומן בכתום.</p>}
        </div>
        <aside className="cz-side cz-box" aria-label="רשימת החידות">
          <h2 style={{ margin: 0 }}>חידה {index + 1} מתוך {list.length}: {puzzle.title}</h2>
          <p style={{ margin: 0, color: '#4d556a' }}>{level.emoji} רמה {level.label} – {level.sub}. פתרתם {list.filter(p => solved.has(p.id)).length} מתוך {list.length}.</p>
          <div className="cz-pz-grid">
            {list.map((p, i) => <button key={p.id} type="button" className={[p.id === id ? 'is-on' : '', solved.has(p.id) ? 'is-done' : ''].join(' ')} onClick={() => open(p.id)} aria-label={`חידה ${i + 1}${solved.has(p.id) ? ' – נפתרה' : ''}`}>{solved.has(p.id) ? '✓' : i + 1}</button>)}
          </div>
        </aside>
      </section>

      <section className="cz-box">
        <h2>עוד שחמט</h2>
        <ChessCards except="/chess/puzzles" />
      </section>

      <SeoBody
        paragraphs={[
          'חידות שחמט הן הדרך המהירה ביותר להשתפר: במקום משחק שלם, מתמקדים ברגע אחד שבו יש מהלך מנצח. כשפותרים הרבה חידות מתחילים לזהות דפוסים – ובמשחק אמיתי רואים את המט לפני היריב.',
          'כל החידות כאן נבדקו במחשב: בחידות "מט בצעד אחד" יש בדיוק מהלך אחד שנותן מט, ובחידות "מט בשני צעדים" המהלך הראשון מכריח מט בכל הגנה. אם תמצאו דרך אחרת שגם היא מכריחה מט – היא תתקבל.',
          'טיפ להורים ולמורים: פתרו חידה אחת ביום יחד עם הילד, ובקשו ממנו להסביר למה המלך לא יכול לברוח. אחר כך נסו את אותו רעיון במשחק נגד המחשב.',
        ]}
        faq={FAQ}
        related={[
          { label: 'שחמט אונליין', href: '/chess' },
          { label: 'איך זז כל כלי', href: '/chess/how-to-play' },
          { label: 'חידות היגיון לילדים', href: '/tools/riddles' },
        ]}
      />
      <p className="cz-links" style={{ marginTop: 10 }}>מוכנים למשחק שלם? <Link to="/chess">שחקו נגד המחשב ←</Link></p>
    </div>
  )
}
