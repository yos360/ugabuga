import { useState } from 'react'
import { Link } from 'react-router-dom'
import PrintPreview from '../ui/PrintPreview'
import { buildParashaQuiz, quizPrintPlan, QUIZ_MODES, sourceHref, sourceLabel } from '../../utils/parashaQuiz'
import './parasha-quiz.css'

const dateLabel = iso => iso?.split('-').reverse().join('.')

export function QuizSources({ sources }) {
  return <span className="pq-sources">{sources.map((ref, i) => <span key={ref}>{i > 0 && ' · '}<a href={sourceHref(ref)} target="_blank" rel="noopener noreferrer"><bdi>{sourceLabel(ref)}</bdi></a></span>)}</span>
}

export function QuizSheet({ quiz, kind, group, date }) {
  const teacher = kind === 'teacher'
  return <article className={`buga-flow pq-sheet${teacher ? ' pq-teacher' : ''}${kind === 'upside' ? ' pq-has-upside' : ''}`} dir="rtl" data-quiz-sheet={kind}>
    <header className="pq-sheet-head">
      <p className="pq-brand">עוגה בוגה · בלשי הפרשה</p>
      <h2>{teacher ? 'מפתח תשובות — למורה ולהורה' : 'פותחים את תיק הפרשה!'}</h2>
      <p className="pq-portion">פרשת {quiz.title}{date ? ` · שבת ${dateLabel(date)}` : ''}</p>
      <p className="pq-sheet-meta">{group || 'בכיתה, בגן ובשולחן שבת'} · {quiz.questions.length} שאלות{teacher ? ' עם מקורות' : ''}</p>
    </header>
    {!teacher && <p className="pq-name">שם הבלש/ית: ____________________ <span>תאריך: __________</span></p>}
    {teacher && <p className="pq-guide">מתחילים לבד, משווים בזוגות ומסבירים איך מצאנו את התשובה. אפשר לקבל ניסוח אחר שמשמעותו זהה. בשבת משחקים בעל פה; כתיבה והכנת הדפים לפני שבת.</p>}
    <ol className="pq-question-list">
      {quiz.questions.map((q, i) => <li key={`${q.portion}-${q.q}`}>
        <div className="pq-question"><span className="pq-number">{i + 1}</span><div><strong>{q.q}</strong>{quiz.portions.length > 1 && <span className="pq-from"> · {q.portion}</span>}</div></div>
        {teacher || kind === 'inline' ? <div className="pq-answer"><p>{q.a}</p><QuizSources sources={q.sources} /></div> : <div className="pq-write-line" aria-hidden="true" />}
      </li>)}
    </ol>
    {!teacher && <div className="pq-bonus"><strong>אתגר הבלשים</strong><p>בחרו תשובה אחת ומצאו פסוק שמוכיח אותה. מה מספר הפרק והפסוק?</p><p className="pq-evidence-line">ההוכחה שלנו: __________________________________________________</p></div>}
    <div className="pq-discussion"><strong>מדברים על זה יחד</strong><p>{quiz.discussions[0]}</p>{teacher && <p className="pq-open-note">שאלה פתוחה — אין תשובה אחת נכונה. בקשו דוגמה מהחיים.</p>}</div>
    {kind === 'upside' && <div className="pq-upside"><strong>מפתח תשובות — מסובבים את הדף רק בסוף</strong><p>{quiz.questions.map((q, i) => <span key={q.q}><b>{i + 1}.</b> {q.a}{i < quiz.questions.length - 1 ? ' • ' : ''}</span>)}</p></div>}
    {teacher && <p className="pq-source-note">התשובות מבוססות על פסוקי התורה. ההפניות לפי המספור העברי; הקישורים נפתחים בספריא. התקציר המלא: ugabuga.co.il/parasha</p>}
  </article>
}

export default function ParashaQuiz({ reading, portions, compact = false }) {
  const [short, setShort] = useState(false), [mode, setMode] = useState('students'), [copies, setCopies] = useState('1'), [group, setGroup] = useState(''), [printing, setPrinting] = useState(null)
  const quiz = buildParashaQuiz(portions || reading?.portions, short)
  if (!quiz) return reading?.holiday ? <section className="pq-card pq-holiday"><h2>השבת קוראים לחג: {reading.name}</h2><p>אין השבוע פרשה רגילה. נשאיר את חידון הפרשה לשבוע הבא, ובינתיים אפשר להכין משחקים לשבת ולחג.</p><Link to="/games/shabbat">למשחקים בלי מסכים ←</Link></section> : null
  const plan = quizPrintPlan(mode, copies)
  const open = override => setPrinting({ quiz, plan: quizPrintPlan(override || mode, copies), group: group.trim(), date: reading?.date })
  return <section className={`pq-card${compact ? ' pq-compact' : ''}`} aria-label="חידון פרשת השבוע להדפסה">
    <div className="pq-card-head"><span className="pq-symbol" aria-hidden="true">🔎</span><div><p className="pq-eyebrow">בלשי הפרשה · חידון חדש בכל פרשה</p><h2>פרשת {quiz.title} — מוכנים לפצח?</h2><p>חידון להדפסה לכיתה ולשולחן שבת, עם דף תשובות למורה ולהורה.</p></div></div>
    {reading?.date && <p className="pq-week">שבת {dateLabel(reading.date)} · לפי לוח הקריאה בישראל{quiz.portions.length > 1 ? ' · שתי פרשות, חידון משותף' : ''}</p>}
    <div className="pq-controls">
      <label>מה מדפיסים?<select value={mode} onChange={e => setMode(e.target.value)}>{QUIZ_MODES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>אורך החידון<select value={short ? 'short' : 'full'} onChange={e => setShort(e.target.value === 'short')}><option value="full">חידון מלא — 10 שאלות</option><option value="short">חימום קצר — {quiz.portions.length > 1 ? 6 : 5} שאלות</option></select></label>
      <label>מספר דפי תלמידים<input type="number" min="1" max="40" value={copies} disabled={mode === 'teacher'} onChange={e => setCopies(e.target.value)} onBlur={() => setCopies(String(Math.max(1, Math.min(40, Math.floor(Number(copies) || 1)))))} /></label>
      <label>שם הכיתה או המשפחה (לא חובה)<input maxLength={40} value={group} onChange={e => setGroup(e.target.value)} placeholder="למשל: כיתה ג׳2 או משפחת כהן" /></label>
    </div>
    <div className="pq-actions"><button type="button" className="pq-primary" onClick={() => open()}>הדפסה או הורדה כ־PDF</button><button type="button" onClick={() => open('teacher')}>דף תשובות למורה / להורה</button>{mode !== 'teacher' && <button type="button" onClick={() => { setCopies('30'); setMode('pack') }}>הכינו 30 תלמידים + דף מורה</button>}</div>
    <p className="pq-print-count" aria-live="polite">{mode === 'teacher' ? 'דף תשובות אחד, עם מקורות לכל שאלה.' : mode === 'pack' ? `${plan.length - 1} דפי תלמידים ללא תשובות + דף תשובות אחד, בסוף.` : `${plan.length} דפי ${mode === 'students' ? 'שאלות בלבד, בלי תשובות.' : mode === 'upside' ? 'שאלות עם מפתח תשובות הפוך.' : 'שאלות ותשובות רגילות.'}`}</p>
    <p className="pq-note">לכיתה ולבית · בשבת משחקים בעל פה · מדפיסים ומכינים לפני שבת</p>
    {!compact && <details className="pq-screen-questions"><summary>מציצים בשאלות ובמקורות לפני ההדפסה</summary><ol>{quiz.questions.map((q, i) => <li key={`${q.portion}-${q.q}`}><details><summary>{i + 1}. {q.q}{q.challenge && <span className="pq-challenge">מעמיקים</span>}</summary><p>{q.a}</p><QuizSources sources={q.sources} /></details></li>)}</ol></details>}
    {compact && <p className="pq-more"><Link to="/parasha">לקריאת התקציר ולכל הפרשות ←</Link></p>}
    {printing && <PrintPreview title={`בלשי הפרשה — ${printing.quiz.title}`} copies={false} onClose={() => setPrinting(null)}>{printing.plan.map(sheet => <QuizSheet key={sheet.key} quiz={printing.quiz} kind={sheet.kind} group={printing.group} date={printing.date} />)}</PrintPreview>}
  </section>
}
