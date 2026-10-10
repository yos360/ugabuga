import { useMemo, useState } from 'react'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import HolidayShell from '../../components/holidays/HolidayShell'
import { pickByLevel } from '../../utils/difficultyLevels'

// One quiz page for every holiday: levels, explanation after each answer,
// and a printable version with an answer page. Content comes from h.quiz.
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]] } return b }
const ROUND = 10
const MIN_ROUND = 6 // a level with fewer questions borrows from the next level up
const LEVELS = [{ id: 1, label: 'גן וכיתה א׳' }, { id: 2, label: 'כיתות ב׳–ד׳' }, { id: 3, label: 'כיתות ה׳ ומעלה' }]
const LETTERS = ['א', 'ב', 'ג', 'ד']

function PrintQuiz({ list, name, emoji }) {
  return <>
    <article className="buga-flow" dir="rtl">
      <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>{emoji} חידון {name}</h2>
      <p style={{ textAlign: 'center', marginBottom: 14 }}>שם: ______________ · הקיפו את התשובה הנכונה</p>
      {list.map((x, i) => <div key={i} className="paper-block" style={{ marginBottom: 12, breakInside: 'avoid' }}>
        <p style={{ fontWeight: 700 }}>{i + 1}. {x.q}</p>
        <p style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 22px' }}>{x.shown.map((o, k) => <span key={k}>{LETTERS[k]}. {o}</span>)}</p>
      </div>)}
    </article>
    <article className="buga-flow" dir="rtl">
      <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 800, marginBottom: 12 }}>תשובות — חידון {name}</h2>
      {list.map((x, i) => <p key={i} style={{ marginBottom: 6 }}><b>{i + 1}. {LETTERS[x.shown.indexOf(x.options[0])]} — {x.options[0]}.</b> {x.why}</p>)}
    </article>
  </>
}

export default function HolidayQuiz({ h }) {
  const Q = h.quiz
  const [level, setLevel] = useState(1)
  const [seed, setSeed] = useState(0)
  const round = useMemo(() => pickByLevel(Q.questions, level, ROUND, { min: MIN_ROUND }).map(x => ({ ...x, shown: shuffle(x.options) })), [level, seed, Q.questions])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [print, setPrint] = useState(null)
  const done = i >= round.length
  const q = round[i]

  const restart = (lv = level) => { setLevel(lv); setSeed(s => s + 1); setI(0); setPicked(null); setScore(0) }
  const choose = o => { if (picked) return; setPicked(o); if (o === q.options[0]) setScore(s => s + 1) }
  const printList = () => pickByLevel(Q.questions, level, 15, { min: MIN_ROUND }).map(x => ({ ...x, shown: shuffle(x.options) }))

  return (
    <HolidayShell h={h} crumb={`חידון ${h.name}`}>
      <SEO title={Q.title} description={Q.desc} path={`${h.base}/quiz`} structuredData={faqSchema(Q.faq)} />
      <h1 className="text-4xl sm:text-5xl text-center mb-2">❓ חידון {h.name} לילדים</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-5">{Q.questions.length} שאלות · 3 רמות · הסבר אחרי כל תשובה</p>

      <div className="mb-5 flex flex-wrap justify-center gap-2" role="radiogroup" aria-label="רמה">
        {LEVELS.map(l => <button key={l.id} type="button" role="radio" aria-checked={level === l.id} onClick={() => restart(l.id)}
          className={`min-h-[44px] rounded-xl border-2 px-4 font-bold ${level === l.id ? 'border-slate-800 bg-yellow-200' : 'border-[var(--border)] bg-white'}`}>{l.label}</button>)}
        <button data-print-main type="button" onClick={() => setPrint(printList())} className="min-h-[44px] rounded-xl border-2 border-slate-800 bg-white px-4 font-bold">🖨️ הדפיסו את החידון</button>
      </div>

      <section className={`mx-auto mb-10 max-w-2xl rounded-3xl border-2 border-[var(--border)] ${h.soft} p-5 sketch-shadow`}>
        {done ? <div className="py-6 text-center">
          {/* Thresholds as a share of the round: level-1 rounds have only 6–8 questions. */}
          <p className="text-6xl mb-2">{score >= round.length * 0.9 ? '🏆' : score >= round.length * 0.6 ? h.emoji : '⭐'}</p>
          <p className="text-3xl font-bold mb-1">{score} מתוך {round.length}</p>
          <p className="text-lg mb-4">{score >= round.length * 0.9 ? 'אלופים! כל הכבוד!' : score >= round.length * 0.6 ? `יפה מאוד! אתם יודעים הרבה על ${h.name}` : 'התחלה טובה — עוד סיבוב ותהיו מומחים'}</p>
          <button type="button" onClick={() => restart()} className="min-h-[52px] rounded-2xl bg-pink-600 px-8 text-xl font-bold text-white">🔄 סיבוב חדש</button>
        </div> : <>
          <div className="mb-2 flex justify-between text-sm font-bold"><span>שאלה {i + 1} מתוך {round.length}</span><span>⭐ {score}</span></div>
          <p className="mb-4 text-2xl font-bold leading-snug">{q.q}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {q.shown.map(o => {
              const right = picked && o === q.options[0], wrong = picked === o && o !== q.options[0]
              return <button key={o} type="button" onClick={() => choose(o)} disabled={!!picked}
                className={`min-h-[56px] rounded-2xl border-2 px-3 text-right text-lg font-bold ${right ? 'border-green-600 bg-green-200' : wrong ? 'border-red-500 bg-red-100' : 'border-slate-800 bg-white hover:-translate-y-0.5'}`}>{o}</button>
            })}
          </div>
          {picked && <div className="mt-4 rounded-2xl bg-white p-3" aria-live="polite">
            <p className="font-bold">{picked === q.options[0] ? '✅ נכון!' : `❌ התשובה הנכונה: ${q.options[0]}`}</p>
            <p>{q.why}</p>
            <button type="button" onClick={() => { setI(n => n + 1); setPicked(null) }} className="mt-3 min-h-[48px] rounded-xl bg-blue-600 px-6 font-bold text-white">{i + 1 < round.length ? 'לשאלה הבאה ←' : 'לתוצאה ←'}</button>
          </div>}
        </>}
      </section>

      <SeoBody paragraphs={Q.body} faq={Q.faq} related={Q.related} />
      {print && <PrintPreview title={`חידון ${h.name}`} onClose={() => setPrint(null)}><PrintQuiz list={print} name={h.name} emoji={h.emoji} /></PrintPreview>}
    </HolidayShell>
  )
}
