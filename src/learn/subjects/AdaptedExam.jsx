import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PrintPreview from '../../components/ui/PrintPreview'
import { hasVoice, speakAndWait, stopSpeaking } from '../../utils/speak'
import './adapted.css'

// Adapted exam ("מבחן מותאם") for children with learning difficulties: one question per screen,
// read-aloud for the question and every answer, large type, three answers instead of four, no clock,
// a second try after a wrong answer, and a short exam (10 questions). Same questions as the regular exam.

const LETTERS = ['א', 'ב', 'ג', 'ד']
const RATES = { slow: 0.7, normal: 0.88 }

export default function AdaptedExam({ name, qs, lessonHref, onRegular, onFresh }) {
  const [started, setStarted] = useState(false)
  const [i, setI] = useState(0)
  const [tries, setTries] = useState({}) // id → array of picked indexes
  const [autoRead, setAutoRead] = useState(true)
  const [rate, setRate] = useState('slow')
  const [voice, setVoice] = useState(true)
  const [printing, setPrinting] = useState(false)
  const run = useRef(0)

  useEffect(() => { hasVoice('he-IL').then(setVoice) }, [])
  useEffect(() => () => stopSpeaking(), [])

  const q = qs[i]
  const picked = q ? tries[q.id] || [] : []
  const solved = q && picked.includes(q.answer)
  const revealed = q && (solved || picked.length >= 2)
  const finished = started && i >= qs.length

  // Reads the texts one after the other; a newer reading (or leaving the question) cancels the rest.
  const readAll = async texts => {
    const id = ++run.current
    stopSpeaking()
    for (const t of texts) {
      if (run.current !== id) return
      await speakAndWait(t, 'he-IL', { rate: RATES[rate] })
    }
  }
  const readQuestion = (x = q) => readAll([`שאלה ${i + 1}.`, x.q, ...x.options.map((o, j) => `${LETTERS[j]}. ${o}`)])

  useEffect(() => {
    if (started && q && autoRead) readQuestion(q)
    return () => { run.current++ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, i])

  const pick = j => {
    if (revealed || picked.includes(j)) return
    const next = [...picked, j]
    setTries(t => ({ ...t, [q.id]: next }))
    const right = j === q.answer
    if (!autoRead) return
    if (right) readAll(['כל הכבוד! נכון.', q.exp || ''])
    else if (next.length < 2) readAll(['לא נורא. נסו שוב.'])
    else readAll([`התשובה הנכונה: ${q.options[q.answer]}.`, q.exp || ''])
  }
  const go = d => { stopSpeaking(); setI(x => x + d); window.scrollTo(0, 0) }

  const first = qs.filter(x => (tries[x.id] || [])[0] === x.answer).length
  const second = qs.filter(x => { const p = tries[x.id] || []; return p[0] !== x.answer && p[1] === x.answer }).length

  const settings = <div className="ad-settings" role="group" aria-label="הגדרות הקראה">
    <label><input type="checkbox" checked={autoRead} onChange={e => { setAutoRead(e.target.checked); if (!e.target.checked) stopSpeaking() }} /> הקראה אוטומטית</label>
    <label>מהירות: <select value={rate} onChange={e => setRate(e.target.value)}><option value="slow">איטית</option><option value="normal">רגילה</option></select></label>
  </div>

  if (!started) return <div className="ad-wrap">
    <div className="ad-card ad-intro">
      <p className="ad-big">🎧 מבחן מותאם: {name}</p>
      <ul className="ad-list">
        <li>🔊 כל שאלה וכל תשובה מוקראות בקול</li>
        <li>1️⃣ שאלה אחת על המסך, באותיות גדולות</li>
        <li>3️⃣ שלוש תשובות לבחירה במקום ארבע</li>
        <li>⏳ בלי שעון: עונים בקצב שלכם</li>
        <li>💪 טעיתם? יש עוד ניסיון</li>
        <li>📝 {qs.length} שאלות בלבד</li>
      </ul>
      {!voice && <p className="ad-note">במכשיר הזה לא נמצא קול בעברית. אפשר לפתור גם בלי הקראה, או לפתוח את הדף בטלפון או בכרום.</p>}
      {settings}
      <button type="button" className="ln-btn go ad-start" onClick={() => { setStarted(true); window.scrollTo(0, 0) }}>מתחילים ←</button>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button type="button" className="ln-btn alt" onClick={() => setPrinting(true)}>🖨️ להדפסה באותיות גדולות</button>
        <button type="button" className="ln-btn alt" onClick={onRegular}>📝 למבחן הרגיל</button>
      </div>
    </div>
    {printing && <PrintPreview title={`מבחן מותאם — ${name}`} onClose={() => setPrinting(false)}><AdaptedSheet name={name} qs={qs} /></PrintPreview>}
  </div>

  if (finished) {
    const pct = Math.round(((first + second * 0.5) / qs.length) * 100)
    return <div className="ad-wrap"><div className="ad-card ad-done" role="status">
      <p className="ad-stars" aria-hidden="true">{pct >= 80 ? '⭐⭐⭐' : pct >= 50 ? '⭐⭐' : '⭐'}</p>
      <p className="ad-big">סיימתם! כל הכבוד על ההתמדה 💛</p>
      <p className="ad-score">נכון בניסיון הראשון: <b>{first}</b> מתוך {qs.length}</p>
      {second > 0 && <p className="ad-score">נכון בניסיון השני: <b>{second}</b></p>}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button type="button" className="ln-btn go" onClick={() => { setTries({}); setI(0); onFresh() }}>🎲 עוד מבחן מותאם</button>
        <Link to={lessonHref} className="ln-btn alt">📚 לשיעורים של הכיתה</Link>
      </div>
    </div></div>
  }

  return <div className="ad-wrap">
    <div className="ad-top">
      <span className="ad-progress">שאלה {i + 1} מתוך {qs.length}</span>
      <span className="ad-dots" aria-hidden="true">{qs.map((x, k) => <i key={x.id} className={k < i ? 'is-done' : k === i ? 'is-now' : ''} />)}</span>
    </div>
    <div className="ad-card">
      <p className="ad-q">{q.q}</p>
      <button type="button" className="ad-read" onClick={() => readQuestion()}>🔊 להקריא שוב</button>
      <div className="ad-opts" role="group" aria-label={`תשובות לשאלה ${i + 1}`}>
        {q.options.map((o, j) => {
          const right = revealed && j === q.answer, wrong = picked.includes(j) && j !== q.answer
          return <div key={j} className="ad-row">
            <button type="button" className={`ad-opt ${right ? 'is-right' : ''} ${wrong ? 'is-wrong' : ''}`} disabled={revealed || wrong} aria-pressed={picked.includes(j)} onClick={() => pick(j)}>
              <b>{LETTERS[j]}.</b> {o}
            </button>
            <button type="button" className="ad-say" aria-label={`להקריא את תשובה ${LETTERS[j]}`} onClick={() => readAll([o])}>🔊</button>
          </div>
        })}
      </div>
      <div aria-live="polite">
        {solved && <p className="ad-fb ok">✔ כל הכבוד! נכון. {q.exp}</p>}
        {!revealed && picked.length === 1 && <p className="ad-fb try">לא נורא 💪 נסו שוב: נשארו עוד תשובות.</p>}
        {revealed && !solved && <p className="ad-fb no">התשובה הנכונה: <b>{q.options[q.answer]}</b>. {q.exp}</p>}
      </div>
      <div className="ad-nav">
        {i > 0 && <button type="button" className="ln-btn alt" onClick={() => go(-1)}>→ הקודמת</button>}
        {revealed && <button type="button" className="ln-btn go" onClick={() => go(1)}>{i + 1 < qs.length ? 'לשאלה הבאה ←' : 'לסיום ←'}</button>}
      </div>
    </div>
    {settings}
  </div>
}

function AdaptedSheet({ name, qs }) {
  return <>
    <article className="buga-flow ln-print sj-print ad-print" dir="rtl">
      <h2>מבחן מותאם — {name}</h2>
      <div className="meta"><span>שם: __________________</span><span>תאריך: ____________</span></div>
      <ol className="ad-print-qs">{qs.map(q => <li key={q.id}><p>{q.q}</p><ul>{q.options.map((o, j) => <li key={j}>⬜ <b>{LETTERS[j]}.</b> {o}</li>)}</ul></li>)}</ol>
    </article>
    <article className="buga-flow ln-print sj-print" dir="rtl">
      <h2>תשובות — מבחן מותאם {name}</h2>
      <ol className="sj-print-key">{qs.map(q => <li key={q.id}><b>{LETTERS[q.answer]}</b> ({q.options[q.answer]}) — {q.exp}</li>)}</ol>
    </article>
  </>
}
