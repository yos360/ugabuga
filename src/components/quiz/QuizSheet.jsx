import { MathText } from './QuizEditor'

const LETTERS = ['א', 'ב', 'ג', 'ד']

// Printable version of the same quiz (paper for kids without a device), optionally with an answer key.
export function QuizSheet({ quiz, answers = false, student = '' }) {
  return <article className="buga-flow" dir={quiz.settings.dir}>
    <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 900, margin: 0 }}>{quiz.title}{answers ? ' — דף תשובות' : ''}</h2>
    {!answers && <p style={{ textAlign: 'center', margin: '6px 0 14px' }} dir="rtl">שם: {student ? <b style={{ textDecoration: 'underline' }}>{student}</b> : '______________'} &nbsp;&nbsp; כיתה: ______ &nbsp;&nbsp; תאריך: ______________</p>}
    <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>{quiz.questions.map((q, i) => <li key={q.id} style={{ breakInside: 'avoid', marginBottom: 14, fontSize: 17 }}>
      <div style={{ fontWeight: 700, whiteSpace: 'pre-line' }}><span>{i + 1}. </span><MathText>{q.q}</MathText></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '4px 18px', marginTop: 6 }}>{q.options.map((o, m) => <span key={m} style={{ fontWeight: answers && m === q.correct ? 900 : 400 }}>
        {answers && m === q.correct ? '●' : '◯'} {LETTERS[m]}. <MathText>{o}</MathText></span>)}</div>
    </li>)}</ol>
  </article>
}
