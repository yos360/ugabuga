import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// "מנהרת הזמן של בוגה" — a daily discovery game. Every question comes pre-built and source-checked in
// src/data/today-game/MM.json (see scripts/today-game): a clue is shown first, and up to three
// graded hints can be opened (each costs points), so a kid can reason their way to the answer.
// Everyone gets the same questions on the same date, so scores can be compared and shared.

const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
const MONTH_FILES = import.meta.glob('../../data/today-game/*.json')
const pad = n => String(n).padStart(2, '0')
const STORE = 'buga-mahayom-v1'
const FULL = 100, HINT_COST = 25
const OWNER_WA = '972507772930'

export const availableMonths = () => Object.keys(MONTH_FILES).map(k => k.match(/(\d\d)\.json$/)[1]).sort()

export async function loadDay(key) {
  const loader = MONTH_FILES[`../../data/today-game/${key.slice(0, 2)}.json`]
  if (!loader) return null
  const mod = await loader()
  return (mod.default || mod)[key] || null
}

export const dateLabel = key => `${+key.slice(3)} ב${MONTHS[+key.slice(0, 2) - 1]}`
const todayKey = d => `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const isoDay = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

function readStore() { try { return JSON.parse(localStorage.getItem(STORE)) || {} } catch { return {} } }
function writeStore(v) { try { localStorage.setItem(STORE, JSON.stringify(v)) } catch { /* private mode */ } }

function yearsAgo(year) {
  const now = new Date().getFullYear()
  const n = year > 0 ? now - year : now - year - 1 // no year 0 between 1 BCE and 1 CE
  return n === 1 ? 'לפני שנה' : n === 2 ? 'לפני שנתיים' : `לפני ${n.toLocaleString('he-IL')} שנים`
}

function lead(q) {
  if (q.type === 'day') return '🗓️ מה מציינים היום?'
  if (q.person) return `🎂 מי נולד היום, ${yearsAgo(q.year)}?`
  if (q.type === 'israel') return `🇮🇱 היום, ${yearsAgo(q.year)} – מה קרה?`
  return `⏳ היום, ${yearsAgo(q.year)} – מה קרה?`
}

function Question({ q, n, total, dateKey, state, onHint, onAnswer, onNext, last }) {
  const answered = state.choice != null
  const right = answered && state.choice === q.answer
  const report = `https://wa.me/${OWNER_WA}?text=${encodeURIComponent(`מצאתי טעות ב"מנהרת הזמן של בוגה" של ${dateLabel(dateKey)}, שאלה ${n + 1}: `)}`
  return (
    <div className="mh-card">
      <div className="mh-progress" aria-label={`שאלה ${n + 1} מתוך ${total}`}>
        {Array.from({ length: total }, (_, i) => <span key={i} className={i < n ? 'is-done' : i === n ? 'is-now' : ''} />)}
      </div>
      <p className="mh-lead">{lead(q)}</p>
      <div className="mh-clue"><span className="mh-clue-emoji" aria-hidden="true">{q.emoji}</span><p>{q.clue}</p></div>
      {state.hints > 0 && <ol className="mh-hints">{q.hints.slice(0, state.hints).map((h, i) => <li key={i}><b>רמז {i + 1}:</b> {h}</li>)}</ol>}
      {!answered && state.hints < q.hints.length && (
        <button type="button" className="mh-hint-btn" onClick={onHint}>💡 תנו לי רמז {state.hints + 1} <small>(−{HINT_COST} נק׳)</small></button>
      )}
      <div className="today-options mh-options">
        {q.options.map((o, i) => {
          const cls = !answered ? '' : i === q.answer ? 'is-right' : i === state.choice ? 'is-wrong' : 'is-dim'
          return <button key={i} type="button" disabled={answered} onClick={() => onAnswer(i)} className={`today-option ${cls}`}>
            {o}{answered && i === q.answer ? ' ✓' : ''}{answered && i === state.choice && i !== q.answer ? ' ✗' : ''}
          </button>
        })}
      </div>
      {answered && (
        <div className="mh-reveal" role="status">
          <p className="mh-verdict">{right ? `🎉 נכון! +${state.points} נקודות` : 'לא הפעם – אבל עכשיו אתם יודעים!'}</p>
          <p>{q.explain}</p>
          <p className="mh-src">
            {q.source && <a href={q.source} target="_blank" rel="noopener noreferrer">📖 מקור</a>}
            <a href={report} target="_blank" rel="noopener noreferrer">מצאתי טעות</a>
          </p>
          <button type="button" className="mh-next" onClick={onNext}>{last ? 'לתוצאות 🏁' : 'לשאלה הבאה ←'}</button>
        </div>
      )}
    </div>
  )
}

export default function TodayGame({ dateKey: forcedKey, archive = false, fallback = null, hideTitle = false }) {
  const [now] = useState(() => new Date())
  const dateKey = forcedKey || todayKey(now)
  const [questions, setQuestions] = useState(undefined) // undefined = loading, null = no data
  const [idx, setIdx] = useState(0)
  const [states, setStates] = useState([])
  const [streak, setStreak] = useState(0)
  const boxRef = useRef(null)
  const moved = useRef(false)
  // After "next" the new question must be in view (on phones the button sits far below the clue).
  useEffect(() => { if (!moved.current) return; boxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, [idx])

  useEffect(() => {
    let alive = true
    setQuestions(undefined); setIdx(0); setStates([])
    loadDay(dateKey).then(q => { if (alive) { setQuestions(q); setStates((q || []).map(() => ({ hints: 0, choice: null, points: 0 }))) } }).catch(() => alive && setQuestions(null))
    return () => { alive = false }
  }, [dateKey])

  const done = questions && idx >= questions.length
  const score = states.reduce((s, x) => s + x.points, 0)
  const correct = questions ? states.filter((x, i) => x.choice === questions[i]?.answer).length : 0

  const finish = finalStates => { // record the result and the daily streak (today's game only)
    setIdx(questions.length)
    if (archive) return
    const st = readStore(), today = isoDay(now)
    const y = new Date(now); y.setDate(y.getDate() - 1)
    const next = st.last === today ? (st.streak || 1) : st.last === isoDay(y) ? (st.streak || 0) + 1 : 1
    const sc = finalStates.reduce((s, x) => s + x.points, 0), ok = finalStates.filter((x, i) => x.choice === questions[i].answer).length
    writeStore({ ...st, last: today, streak: next, best: Math.max(st.best || 0, next), played: { ...(st.played || {}), [today]: { score: sc, correct: ok, total: questions.length } } })
    setStreak(next)
  }

  const share = () => {
    const text = `⏳ "מנהרת הזמן של בוגה" – ${dateLabel(dateKey)}\nגיליתי ${correct} מתוך ${questions.length} | ${score} נקודות${streak > 1 ? ` | 🔥 רצף ${streak} ימים` : ''}\nכמה אתם תגלו? https://ugabuga.co.il/time-tunnel${archive ? '/' + dateKey : ''}?utm_source=whatsapp&utm_medium=share&utm_campaign=time_tunnel`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  const update = (i, patch) => setStates(s => s.map((x, j) => j === i ? { ...x, ...patch } : x))
  const restart = () => { setIdx(0); setStates(questions.map(() => ({ hints: 0, choice: null, points: 0 }))) }

  if (questions === undefined) return null
  if (!questions) return fallback
  const max = questions.length * FULL

  return (
    <section ref={boxRef} className="today-quiz mh" aria-label="מנהרת הזמן של בוגה">
      <div className="today-head">
        <span className="today-date">📅 {dateLabel(dateKey)}{archive ? ' · מהארכיון' : ''}</span>
        {!hideTitle && <h2>⏳ מנהרת הזמן של בוגה</h2>}
        <p>{questions.length} דברים שקרו בדיוק בתאריך הזה. כמה מהם תצליחו לגלות – בעזרת הרמזים?</p>
      </div>
      {!done && <Question q={questions[idx]} n={idx} total={questions.length} dateKey={dateKey} state={states[idx]} last={idx === questions.length - 1}
        onHint={() => update(idx, { hints: states[idx].hints + 1 })}
        onAnswer={i => update(idx, { choice: i, points: i === questions[idx].answer ? Math.max(FULL - HINT_COST * states[idx].hints, HINT_COST) : 0 })}
        onNext={() => { moved.current = true; idx === questions.length - 1 ? finish(states) : setIdx(idx + 1) }} />}
      {done && (
        <div className="mh-end">
          <div className="mh-score"><b>{correct}/{questions.length}</b><span>{score} מתוך {max} נקודות</span>{!archive && <span>🔥 רצף: {streak} {streak === 1 ? 'יום' : 'ימים'}</span>}</div>
          <p>{correct === questions.length ? '🏆 גילוי מושלם!' : correct >= questions.length / 2 ? 'יפה מאוד! מחר מחכים לכם דברים חדשים.' : 'היום למדתם דברים חדשים – מחר עוד הזדמנות!'}</p>
          <div className="mh-actions">
            <button type="button" className="today-share" onClick={share}>📱 אתגרו חבר בוואטסאפ</button>
            <button type="button" className="mh-again" onClick={restart}>🔁 שחקו שוב</button>
            <Link to="/time-tunnel#archive" className="mh-again">📚 ימים קודמים</Link>
          </div>
        </div>
      )}
    </section>
  )
}
