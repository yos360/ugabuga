import { useEffect, useMemo, useState } from 'react'

// "Today" quiz on the home page: which special day is today, and what happened on this date.
// The right answer is today's entry; the wrong answers are real entries from other dates of the
// same month, so nothing shown is made up. Data: src/data/today/MM.json (sourced from Wikipedia).
// Client-only: the page is prerendered, and the date/random picks must come from the visitor.

const MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר']
const pad = n => String(n).padStart(2, '0')

function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
  return a
}
const pick = list => list[Math.floor(Math.random() * list.length)]

// Words of 3+ letters, to keep look-alike answers (the same story on two dates) out of the options.
const words = text => new Set(String(text).replace(/[^\p{L}\p{N} ]/gu, ' ').split(/\s+/).filter(w => w.length >= 3))
function tooSimilar(a, b) {
  const A = words(a), B = words(b)
  let shared = 0
  for (const w of A) if (B.has(w)) shared++
  return shared / Math.max(1, Math.min(A.size, B.size)) >= 0.4
}

function distractors(pool, correct, getText, count = 3) {
  const out = []
  for (const item of shuffle(pool)) {
    const t = getText(item)
    if (t === getText(correct) || tooSimilar(t, getText(correct)) || out.some(o => tooSimilar(getText(o), t))) continue
    out.push(item)
    if (out.length === count) break
  }
  return out
}

function buildQuiz(data, key) {
  const today = data[key]
  if (!today) return null
  const others = Object.entries(data).filter(([k]) => k !== key).map(([, v]) => v)
  const questions = []
  if (today.days.length) {
    const correct = pick(today.days)
    const wrong = distractors(others.flatMap(v => v.days), correct, d => d.name)
    if (wrong.length === 3) questions.push({ kind: 'day', correct, options: shuffle([correct, ...wrong]) })
  }
  if (today.events.length) {
    const correct = pick(today.events) // a different year on each visit
    const wrong = distractors(others.flatMap(v => v.events), correct, e => e.text)
    if (wrong.length === 3) questions.push({ kind: 'event', correct, options: shuffle([correct, ...wrong]) })
  }
  return questions.length ? questions : null
}

function Question({ q, index, date, answer, onAnswer }) {
  const now = new Date().getFullYear()
  const title = q.kind === 'day' ? 'איזה יום מיוחד מציינים היום?' : `מה קרה בדיוק היום, ${date}, באחת השנים?`
  const label = o => q.kind === 'day' ? `${o.emoji || ''} ${o.name}` : `${o.emoji || ''} ${o.text}`
  return (
    <div className="today-q">
      <p className="today-q-title"><span className="today-q-num">{index + 1}</span>{title}</p>
      <div className="today-options">
        {q.options.map((o, i) => {
          const chosen = answer === i, isRight = o === q.correct
          const state = answer == null ? '' : isRight ? 'is-right' : chosen ? 'is-wrong' : 'is-dim'
          return <button key={i} type="button" disabled={answer != null} onClick={() => onAnswer(i)} className={`today-option ${state}`}>
            {label(o)}{answer != null && isRight ? ' ✓' : ''}{chosen && !isRight ? ' ✗' : ''}
          </button>
        })}
      </div>
      {answer != null && <p className="today-reveal" role="status">
        {q.options[answer] === q.correct ? '🎉 נכון! ' : 'כמעט! '}
        {q.kind === 'day'
          ? <>{q.correct.fun || `היום מציינים את ${q.correct.name}.`}</>
          : <>זה קרה ב־{q.correct.year}{q.correct.year < now ? `, לפני ${now - q.correct.year} שנים` : ''}. כל התשובות האחרות באמת קרו, רק בתאריכים אחרים.</>}
      </p>}
    </div>
  )
}

export default function TodayQuiz() {
  const [state, setState] = useState(null) // { date, questions }
  const [answers, setAnswers] = useState({})

  useEffect(() => {
    const d = new Date(), mm = pad(d.getMonth() + 1), key = `${mm}-${pad(d.getDate())}`
    import(`../../data/today/${mm}.json`).then(mod => {
      const questions = buildQuiz(mod.default || mod, key)
      if (questions) setState({ date: `${d.getDate()} ב${MONTHS[d.getMonth()]}`, questions })
    }).catch(() => {})
  }, [])

  const score = useMemo(() => state ? state.questions.filter((q, i) => answers[i] != null && q.options[answers[i]] === q.correct).length : 0, [state, answers])
  if (!state) return null
  const done = state.questions.every((_, i) => answers[i] != null)
  const share = () => {
    const text = `ידעתי ${score} מתוך ${state.questions.length} בחידון "מה היום היום?" של עוגה בוגה 🎂 נסו גם: https://ugabuga.co.il/?utm_source=whatsapp&utm_medium=share&utm_campaign=today_quiz`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="today-quiz" aria-label="חידון היום">
      <div className="today-head">
        <span className="today-date">📅 {state.date}</span>
        <h2>מה היום היום?</h2>
        <p>חידון קטן שמתחלף כל יום. תשובה אחת נכונה, השאר קרו בימים אחרים.</p>
      </div>
      {state.questions.map((q, i) => <Question key={i} q={q} index={i} date={state.date} answer={answers[i]} onAnswer={a => setAnswers(s => ({ ...s, [i]: a }))} />)}
      {done && <div className="today-done">
        <b>{score === state.questions.length ? '🏆 מושלם!' : `ידעתם ${score} מתוך ${state.questions.length}`}</b>
        <span>חידון חדש מחכה מחר.</span>
        <button type="button" onClick={share} className="today-share">📱 אתגרו חברים בוואטסאפ</button>
      </div>}
    </section>
  )
}
