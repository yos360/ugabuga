import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { TOPICS, GRADES, makeExercise, checkAnswer, outcome, nextTeam } from '../../math/mathTicTacToe'

// Classroom team game for the projector: two teams play tic-tac-toe, and a square is captured
// only after the team answers its math exercise correctly (teacher judges, or the class types it).
const COLORS = { 1: '#d9480f', 2: '#1c64d6' }
const FAQ = [
  { q: 'איך משחקים איקס־עיגול חשבוני בכיתה?', a: 'מחלקים את הכיתה לשתי קבוצות: איקס ועיגול. קבוצה בוחרת משבצת ומקבלת תרגיל. תשובה נכונה — המשבצת שלה; תשובה שגויה — המשבצת נשארת ריקה. בכל מקרה התור עובר לקבוצה השנייה. מי שמסדרת שלושה בשורה מנצחת בסיבוב.' },
  { q: 'מי בודק את התשובה?', a: 'יש שתי אפשרויות: המורה בודק/ת ולוחץ/ת ✓ או ✗ (ואפשר להציג את התשובה על המסך), או שנציג הקבוצה מקליד את התשובה והמשחק בודק לבד.' },
  { q: 'לאילו כיתות זה מתאים?', a: 'לכיתות א׳ עד ד׳. בוחרים כיתה ונושא — חיבור, חיסור בלי מספרים שליליים, לוח הכפל או תרגילים מעורבים — והתרגילים מותאמים לטווח המספרים של אותה כיתה.' },
  { q: 'אפשר לשחק על המקרן או על הלוח החכם?', a: 'כן. הלוח והתרגילים בגופן גדול, ובכפתור "מסך מלא" המשחק תופס את כל המסך. המשחק עובד גם בטלפון ובטאבלט, בחינם ובלי הרשמה.' },
]

function Mark({ team, size = '70%' }) {
  const c = COLORS[team]
  return <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
    {team === 1
      ? <path d="M22 22 L78 78 M78 22 L22 78" stroke={c} strokeWidth="14" strokeLinecap="round" fill="none" />
      : <circle cx="50" cy="50" r="30" stroke={c} strokeWidth="13" fill="none" />}
  </svg>
}

const pill = on => `min-h-[44px] rounded-full border-2 px-4 text-lg font-bold ${on ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-400 bg-white text-slate-900'}`

export default function MathTicTacToe() {
  const [names, setNames] = useState({ 1: 'קבוצת איקס', 2: 'קבוצת עיגול' })
  const [topic, setTopic] = useState('add'), [grade, setGrade] = useState(1), [mode, setMode] = useState('teacher')
  const [board, setBoard] = useState(() => Array(9).fill(0))
  const [round, setRound] = useState(0), [turn, setTurn] = useState(1)
  const [score, setScore] = useState({ 1: 0, 2: 0, draw: 0 })
  const [ask, setAsk] = useState(null) // { cell, ex, reveal, typed, verdict }
  const [full, setFull] = useState(false)
  const stage = useRef(null), dialogFocus = useRef(null)
  const end = outcome(board)
  const name = t => names[t].trim() || (t === 1 ? 'איקס' : 'עיגול')

  useEffect(() => {
    const on = () => setFull(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', on)
    return () => document.removeEventListener('fullscreenchange', on)
  }, [])
  useEffect(() => { dialogFocus.current?.focus() }, [ask?.cell, ask?.verdict])

  const pick = cell => {
    if (end || board[cell] || ask) return
    setAsk({ cell, ex: makeExercise(topic, grade), reveal: false, typed: '', verdict: null })
  }
  const judge = right => {
    if (!ask || ask.verdict) return
    if (right) {
      const b = board.slice(); b[ask.cell] = turn
      setBoard(b)
      const r = outcome(b)
      if (r) setScore(s => (r.winner ? { ...s, [r.winner]: s[r.winner] + 1 } : { ...s, draw: s.draw + 1 }))
    }
    setAsk(a => ({ ...a, verdict: right ? 'right' : 'wrong', reveal: true }))
  }
  const close = () => {
    if (ask?.verdict) setTurn(nextTeam)
    setAsk(null)
  }
  const newRound = () => {
    const r = round + 1
    setRound(r); setBoard(Array(9).fill(0)); setTurn(r % 2 ? 2 : 1); setAsk(null)
  }
  const resetAll = () => { setScore({ 1: 0, 2: 0, draw: 0 }); setRound(0); setBoard(Array(9).fill(0)); setTurn(1); setAsk(null) }
  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen?.()
    else stage.current?.requestFullscreen?.()
  }
  const onKey = e => { if (e.key === 'Escape' && ask && !ask.verdict) setAsk(null) }

  const status = end
    ? (end.winner ? `🏆 ${name(end.winner)} ניצחה בסיבוב!` : '🤝 תיקו — אף קבוצה לא יכולה להשלים שורה')
    : `התור של ${name(turn)} — בחרו משבצת`

  return <div className="mx-auto max-w-5xl px-4 py-6" dir="rtl">
    <SEO title="איקס עיגול חשבוני לכיתה — משחק חשבון קבוצתי למקרן" description="משחק חשבון לכיתה על המקרן: שתי קבוצות משחקות איקס עיגול, וכל משבצת נכבשת רק אחרי תשובה נכונה לתרגיל. חיבור, חיסור, לוח הכפל או מעורב, לכיתות א׳–ד׳. חינם ובלי הרשמה." path="/classroom/math-tic-tac-toe" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לכיתה', href: '/classroom' }, { label: 'איקס־עיגול חשבוני' }]} />
    <h1 className="mb-1 text-center text-4xl font-black sm:text-5xl"><span aria-hidden="true">❌⭕ </span>איקס־עיגול חשבוני לכיתה</h1>
    <p className="mb-5 text-center text-lg text-[var(--muted-foreground)]">שתי קבוצות, לוח אחד על המקרן: משבצת נכבשת רק בתשובה נכונה.</p>

    <section aria-label="הגדרות המשחק" className="mb-5 space-y-3 rounded-3xl border-2 border-[var(--border)] bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {[1, 2].map(t => <label key={t} className="flex items-center gap-2 text-lg font-bold">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center"><Mark team={t} size="100%" /></span>
          <span className="sr-only">שם הקבוצה של {t === 1 ? 'איקס' : 'עיגול'}</span>
          <input value={names[t]} maxLength={24} onChange={e => setNames(n => ({ ...n, [t]: e.target.value }))} className="min-h-[44px] w-full rounded-xl border-2 border-slate-400 px-3 text-lg" />
        </label>)}
      </div>
      <div role="group" aria-label="נושא" className="flex flex-wrap items-center gap-2"><b className="ml-1 text-lg">נושא:</b>
        {TOPICS.map(t => <button key={t.id} type="button" aria-pressed={topic === t.id} onClick={() => setTopic(t.id)} className={pill(topic === t.id)}><span aria-hidden="true">{t.emoji} </span>{t.label}</button>)}
      </div>
      <div role="group" aria-label="כיתה" className="flex flex-wrap items-center gap-2"><b className="ml-1 text-lg">כיתה:</b>
        {GRADES.map(g => <button key={g.n} type="button" aria-pressed={grade === g.n} onClick={() => setGrade(g.n)} className={pill(grade === g.n)}>{g.label} <small className="font-normal">({g.hint})</small></button>)}
      </div>
      <div role="group" aria-label="מי בודק" className="flex flex-wrap items-center gap-2"><b className="ml-1 text-lg">בדיקה:</b>
        <button type="button" aria-pressed={mode === 'teacher'} onClick={() => setMode('teacher')} className={pill(mode === 'teacher')}>👩‍🏫 המורה בודק/ת</button>
        <button type="button" aria-pressed={mode === 'type'} onClick={() => setMode('type')} className={pill(mode === 'type')}>⌨️ הכיתה מקלידה תשובה</button>
      </div>
    </section>

    <section ref={stage} aria-label="לוח המשחק" onKeyDown={onKey} className={`relative rounded-3xl bg-amber-50 p-3 sm:p-5 ${full ? 'flex h-screen flex-col justify-center overflow-auto' : ''}`}>
      <div className="mb-3 grid grid-cols-3 items-center gap-2 text-center">
        {[1, 'draw', 2].map(k => k === 'draw'
          ? <div key={k} className="text-lg font-bold sm:text-2xl">תיקו<br /><span className="text-3xl font-black sm:text-5xl">{score.draw}</span></div>
          : <div key={k} className={`rounded-2xl border-4 bg-white p-2 ${!end && turn === k ? 'shadow-lg' : ''}`} style={{ borderColor: !end && turn === k ? COLORS[k] : '#cbd5e1' }}>
            <div className="flex items-center justify-center gap-1 text-lg font-black sm:text-2xl" style={{ color: COLORS[k] }}><span className="inline-flex h-8 w-8 sm:h-10 sm:w-10"><Mark team={k} size="100%" /></span><span className="truncate">{name(k)}</span></div>
            <div className="text-3xl font-black sm:text-5xl" aria-label={`${score[k]} ניצחונות`}>{score[k]}</div>
          </div>)}
      </div>
      <p role="status" className="mb-3 text-center text-2xl font-black sm:text-4xl" style={{ color: end?.winner ? COLORS[end.winner] : end ? undefined : COLORS[turn] }}>{status}</p>

      <div className="mx-auto grid aspect-square w-full max-w-[min(92vw,62vh,560px)] grid-cols-3 gap-2 sm:gap-3">
        {board.map((v, i) => {
          const hot = end?.line?.includes(i)
          return <button key={i} type="button" onClick={() => pick(i)} disabled={Boolean(v || end || ask)}
            aria-label={v ? `משבצת ${i + 1}: ${name(v)}` : `משבצת ${i + 1} ריקה — לבחירה`}
            className={`flex aspect-square min-h-[44px] items-center justify-center rounded-2xl border-4 text-4xl font-black transition ${hot ? 'border-yellow-400 bg-yellow-100' : 'border-slate-800 bg-white'} ${!v && !end && !ask ? 'hover:bg-slate-100 focus-visible:bg-slate-100' : ''}`}>
            {v ? <Mark team={v} /> : <span className="text-2xl text-slate-300 sm:text-4xl" aria-hidden="true">{i + 1}</span>}
          </button>
        })}
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {end && <button type="button" onClick={newRound} className="min-h-[52px] rounded-full bg-green-600 px-6 text-xl font-black text-white">🔄 סיבוב חדש</button>}
        <button type="button" onClick={toggleFull} className="min-h-[44px] rounded-full border-2 border-slate-800 bg-white px-4 font-bold">{full ? '↙️ יציאה ממסך מלא' : '⛶ מסך מלא למקרן'}</button>
        {!end && <button type="button" onClick={newRound} className="min-h-[44px] rounded-full border-2 border-slate-400 bg-white px-4 font-bold">לוח חדש</button>}
        <button type="button" onClick={resetAll} className="min-h-[44px] rounded-full border-2 border-slate-400 bg-white px-4 font-bold">איפוס הניקוד</button>
      </div>

      {ask && <div role="dialog" aria-modal="true" aria-labelledby="mttt-ex" className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 p-3">
        <div className="w-full max-w-xl rounded-3xl bg-white p-5 text-center shadow-2xl" style={{ borderTop: `10px solid ${COLORS[turn]}` }}>
          <p className="text-xl font-bold sm:text-2xl" style={{ color: COLORS[turn] }}>{name(turn)} · משבצת {ask.cell + 1}</p>
          <p id="mttt-ex" dir="ltr" className="my-3 text-6xl font-black tabular-nums sm:text-8xl">{ask.ex.text} = {ask.reveal ? <span className="text-green-700">{ask.ex.answer}</span> : '?'}</p>
          {ask.verdict
            ? <>
              <p aria-live="assertive" className={`mb-3 text-3xl font-black sm:text-4xl ${ask.verdict === 'right' ? 'text-green-700' : 'text-red-700'}`}>{ask.verdict === 'right' ? '✅ נכון! המשבצת שלכם' : '❌ לא הפעם — המשבצת נשארת פנויה'}</p>
              <button ref={dialogFocus} type="button" onClick={close} className="min-h-[56px] rounded-full bg-slate-900 px-8 text-2xl font-black text-white">{outcome(board) ? 'לתוצאה' : 'התור עובר ←'}</button>
            </>
            : mode === 'teacher'
              ? <div className="flex flex-wrap justify-center gap-3">
                <button ref={dialogFocus} type="button" onClick={() => judge(true)} className="min-h-[64px] min-w-[120px] rounded-2xl bg-green-600 px-5 text-3xl font-black text-white">✓ נכון</button>
                <button type="button" onClick={() => judge(false)} className="min-h-[64px] min-w-[120px] rounded-2xl bg-red-600 px-5 text-3xl font-black text-white">✗ לא נכון</button>
                <button type="button" aria-pressed={ask.reveal} onClick={() => setAsk(a => ({ ...a, reveal: !a.reveal }))} className="min-h-[64px] rounded-2xl border-2 border-slate-800 bg-white px-4 text-xl font-bold">👁 {ask.reveal ? 'הסתרת' : 'הצגת'} התשובה</button>
              </div>
              : <form className="flex flex-wrap items-center justify-center gap-3" onSubmit={e => { e.preventDefault(); if (ask.typed.trim()) judge(checkAnswer(ask.ex, ask.typed)) }}>
                <label htmlFor="mttt-answer" className="sr-only">התשובה</label>
                <input id="mttt-answer" ref={dialogFocus} dir="ltr" inputMode="numeric" autoComplete="off" value={ask.typed} onChange={e => setAsk(a => ({ ...a, typed: e.target.value }))} className="min-h-[64px] w-40 rounded-2xl border-4 border-slate-800 text-center text-4xl font-black" />
                <button type="submit" className="min-h-[64px] rounded-2xl bg-slate-900 px-6 text-2xl font-black text-white">בדיקה</button>
              </form>}
          {!ask.verdict && <button type="button" onClick={() => setAsk(null)} className="mt-4 min-h-[44px] px-3 text-lg underline">ביטול — לבחור משבצת אחרת</button>}
        </div>
      </div>}
    </section>

    <div className="mt-6 rounded-2xl bg-white p-4 text-lg">
      <h2 className="mb-2 text-2xl font-black">איך משחקים</h2>
      <ol className="list-decimal space-y-1 pr-6">
        <li>מחלקים את הכיתה לשתי קבוצות וכותבים להן שמות.</li>
        <li>בוחרים נושא וכיתה. הקבוצה שבתור בוחרת משבצת ומקבלת תרגיל.</li>
        <li>תשובה נכונה — המשבצת שלה. תשובה שגויה — המשבצת נשארת פנויה. בכל מקרה התור עובר.</li>
        <li>שלושה בשורה, בטור או באלכסון — ניצחון בסיבוב. בסיבוב הבא פותחת הקבוצה השנייה.</li>
      </ol>
    </div>
    <p className="mt-6 text-center text-lg">עוד לשיעור חשבון: <Link className="font-bold underline" to="/math">תרגילי חשבון לפי כיתה</Link> · <Link className="font-bold underline" to="/learn/times-tables">תרגול לוח הכפל</Link> · <Link className="font-bold underline" to="/tools/scoreboard">לוח ניקוד לקבוצות</Link></p>
    <div className="mt-10"><SeoBody paragraphs={[
      'איקס־עיגול חשבוני הוא משחק חשבון לכיתה שמשחקים על המקרן או על הלוח החכם. הכיתה מתחלקת לשתי קבוצות, וכל קבוצה צריכה "לקנות" את המשבצת שלה בתשובה נכונה. ככה כל תרגיל חשוב: תשובה שגויה לא רק עולה בתור — היא משאירה את המשבצת פתוחה ליריבים.',
      'התרגילים נוצרים מחדש בכל פעם ומותאמים לכיתה: בכיתה א׳ חיבור וחיסור עד 20 וכפל פשוט, בכיתה ב׳ עד 100 ולוחות הכפל הקלים, בכיתה ג׳ עד 1,000 ולוח הכפל המלא, ובכיתה ד׳ עד 10,000 וכפל של מספר דו־ספרתי בחד־ספרתי. בחיסור התוצאה אף פעם לא שלילית.',
      'המורה יכול/ה לבדוק בעצמו/ה וללחוץ ✓ או ✗, או לתת לנציג הקבוצה להקליד את התשובה. המשחק סופר ניצחונות ותיקו לאורך כמה סיבובים, מזהה מוקדם כשכבר אי אפשר לנצח, ועובד גם בטלפון — בחינם ובלי הרשמה.',
    ]} faq={FAQ} related={[{ label: 'תרגילי חשבון לפי כיתה', href: '/math' }, { label: 'תרגול לוח הכפל', href: '/learn/times-tables' }, { label: 'איקס עיגול לשניים', href: '/online-games/tic-tac-toe' }, { label: 'לוחות איקס עיגול להדפסה', href: '/printables/tic-tac-toe' }, { label: 'דפי עבודה בחשבון', href: '/printables/math-worksheets' }, { label: 'משחקים לכיתה', href: '/games/classroom' }]} /></div>
  </div>
}
