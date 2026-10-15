import { useState } from 'react'
import PrintPreview from '../ui/PrintPreview'
import { QUIZ_MODES, quizPrintPlan } from '../../utils/parashaQuiz'
import { triviaPrintPages } from '../../utils/triviaPrint'
import './trivia-print.css'

const LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו']
const answer = q => q.options?.length ? `${LETTERS[q.options.indexOf(q.a)] || ''}. ${q.a}` : q.a

export function TriviaSheet({ title, questions, start, kind, group, page, total }) {
  const teacher = kind === 'teacher'
  return <article className="buga-flow trivia-sheet" dir="rtl" data-trivia-sheet={kind}>
    <header><p>עוגה בוגה · משחקים, לומדים וזוכרים</p><h2>{title}</h2><p>{teacher ? 'מפתח תשובות למורה ולהורה' : 'דף חידון'} · עמוד {page} מתוך {total}{group ? ` · ${group}` : ''}</p></header>
    {!teacher && <p className="trivia-name">שם / קבוצה: ____________________ · תאריך: __________</p>}
    <ol className="trivia-print-questions">{questions.map((q, i) => <li key={start + i}>
      <div className="trivia-print-question"><b>{start + i + 1}. {q.q}</b></div>
      {!teacher && (q.options?.length ? <div className="trivia-print-options">{q.options.map((o, j) => <span key={j}>◯ {LETTERS[j]}. {o}</span>)}</div> : <div className="trivia-print-line" />)}
      {(teacher || kind === 'inline') && <div className="trivia-print-answer"><b>תשובה: {answer(q)}</b>{teacher && q.explain && <p>{q.explain}</p>}</div>}
    </li>)}</ol>
    {kind === 'upside' && <div className="trivia-print-upside"><b>תשובות — מסובבים רק בסוף</b><p>{questions.map((q, i) => `${start + i + 1}. ${answer(q)}`).join(' • ')}</p></div>}
  </article>
}

// Questions are snapshotted when opening: neither answering nor changing a filter
// can silently change the relationship between student pages and their answer key.
export default function TriviaPrint({ title, questions, note }) {
  const [mode, setMode] = useState('pack'), [copies, setCopies] = useState('1'), [group, setGroup] = useState(''), [printing, setPrinting] = useState(null)
  const pages = triviaPrintPages(questions)
  const plan = quizPrintPlan(mode, copies)
  function open() { setPrinting({ title, pages, plan, group: group.trim() }) }
  return <section className="trivia-print-panel" aria-label="הדפסת חידון טריוויה"><h2>🖨️ החידון גם על דף</h2><p>{questions.length} שאלות{note ? ` · ${note}` : ' · אותן שאלות ואותו סדר תשובות כמו בחידון'}</p>
    <div className="trivia-print-controls"><label>מה להדפיס?<select value={mode} onChange={e => setMode(e.target.value)}>{QUIZ_MODES.map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select></label><label>מספר עותקים לתלמידים<input type="number" min="1" max="40" disabled={mode === 'teacher'} value={copies} onChange={e => setCopies(e.target.value)} onBlur={() => setCopies(String(Math.max(1, Math.min(40, Math.floor(Number(copies) || 1)))))} /></label><label>שם הכיתה או המשפחה (לא חובה)<input maxLength={40} value={group} onChange={e => setGroup(e.target.value)} /></label></div>
    <div className="trivia-print-actions"><button data-print-main type="button" disabled={!questions.length} onClick={open}>הדפסת החידון או הורדה כ־PDF</button><span aria-live="polite">{pages.length * plan.length} דפי A4{mode === 'pack' ? ` · ${plan.length - 1} ${plan.length === 2 ? 'עותק לתלמיד' : 'עותקים לתלמידים'} וסט תשובות אחד למורה` : ''}</span></div>
    {printing && <PrintPreview title={printing.title} copies={false} onClose={() => setPrinting(null)}>{printing.plan.flatMap(copy => printing.pages.map((p, i) => <TriviaSheet key={`${copy.key}-${i}`} title={printing.title} questions={p.questions} start={p.start} kind={copy.kind} group={printing.group} page={i + 1} total={printing.pages.length} />))}</PrintPreview>}
  </section>
}
