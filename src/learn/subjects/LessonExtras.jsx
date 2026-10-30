import { lazy, Suspense, useEffect, useState } from 'react'

// Two pieces every school subject shares:
// - SubjectReadings: reading passages for a grade or a lesson (src/learn/subjects/readings/<subject>.js),
//   one at a time with a "🔄 קטע אחר" button, questions with feedback and printing (ReadingExercise).
// - InteractiveLesson: the lesson as steps — one section at a time, a check question after each one,
//   a progress bar and a summary with the score. Built from the lesson's own sections and quiz.
const ReadingExercise = lazy(() => import('../LearnPages').then(m => ({ default: m.ReadingExercise })))
const READING_FILES = import.meta.glob('./readings/*.js')

export function useReadings(key) {
  const [list, setList] = useState(null)
  useEffect(() => {
    let live = true
    const load = READING_FILES[`./readings/${key}.js`]
    ;(load ? load().then(m => m.READINGS || []) : Promise.resolve([])).then(r => { if (live) setList(r) })
    return () => { live = false }
  }, [key])
  return list
}
// The passages for a lesson (its own first, then its grades) or for one grade.
export const readingsFor = (list, { topic, grades, grade }) => !list ? [] : grade != null
  ? list.filter(r => r.grade === grade)
  : [...list.filter(r => r.topic === topic), ...list.filter(r => r.topic !== topic && grades?.includes(r.grade))]

export function SubjectReadings({ list, title = '📖 קטע קריאה', id = 'readings' }) {
  const [i, setI] = useState(0)
  if (!list?.length) return null
  const r = list[i % list.length]
  return <section id={id} className="mt-10 scroll-mt-24" aria-labelledby={`${id}-h`}>
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h2 id={`${id}-h`} className="text-2xl font-black">{title}: {r.emoji} {r.title}</h2>
      {list.length > 1 && <button type="button" onClick={() => setI(n => n + 1)} className="min-h-[44px] rounded-full bg-emerald-600 px-5 font-black text-white shadow-[0_4px_0_#047857]">🔄 קטע אחר <span className="text-sm opacity-80">({(i % list.length) + 1}/{list.length})</span></button>}
    </div>
    <Suspense fallback={<p role="status">טוענים את הקטע…</p>}><ReadingExercise key={r.slug} r={{ level: r.grade, ...r }} headingLevel={3} /></Suspense>
  </section>
}

const LETTERS = ['א', 'ב', 'ג', 'ד']
export function InteractiveLesson({ t, quiz, onClose }) {
  // Step k shows section k and then its check question (quiz[k], wrapping if there are more sections).
  const steps = t.sections.map((s, k) => ({ s, q: quiz[k % quiz.length] }))
  const [k, setK] = useState(0)
  const [pick, setPick] = useState(null)
  const [score, setScore] = useState(0)
  const done = k >= steps.length
  const step = steps[k]
  const answer = j => { if (pick != null) return; setPick(j); if (j === step.q.answer) setScore(n => n + 1) }
  const next = () => { setPick(null); setK(n => n + 1) }
  return <section className="mb-8 rounded-[28px] border-2 border-violet-300 bg-violet-50 p-5" aria-label="שיעור אינטראקטיבי">
    <div className="flex items-center justify-between gap-2">
      <b className="text-lg">🎓 שיעור אינטראקטיבי · {done ? 'סיימתם!' : `שלב ${k + 1} מתוך ${steps.length}`}</b>
      <button type="button" onClick={onClose} className="rounded-full px-3 text-sm underline">סגירה</button>
    </div>
    <div className="mt-2 h-3 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={k}>
      <div className="h-full bg-violet-500 transition-all duration-500" style={{ width: `${(k / steps.length) * 100}%` }} />
    </div>
    {!done ? <div key={k} className="buga-fade-in mt-4">
      <h2 className="text-2xl font-black">{step.s.h}</h2>
      <div className="mt-2 space-y-2 text-lg leading-relaxed">{step.s.p.map((p, j) => <p key={j}>{p}</p>)}</div>
      <div className="mt-5 rounded-2xl bg-white p-4">
        <p className="font-black">🤔 בודקים: {step.q.q}</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">{step.q.options.map((o, j) => <button key={j} type="button" onClick={() => answer(j)} disabled={pick != null}
          className={`min-h-[48px] rounded-xl border-2 p-2 text-right font-bold ${pick != null && j === step.q.answer ? 'border-emerald-500 bg-emerald-50' : pick === j ? 'border-rose-400 bg-rose-50' : 'border-slate-200 hover:border-violet-300'}`}>{LETTERS[j]}. {o}</button>)}</div>
        {pick != null && <p className="mt-3" role="status">{pick === step.q.answer ? '✅ נכון! ' : '❌ לא בדיוק. '}{step.q.exp}</p>}
      </div>
      <div className="mt-4 text-left"><button type="button" disabled={pick == null} onClick={next} className="min-h-[48px] rounded-2xl bg-violet-600 px-6 font-black text-white disabled:opacity-40">{k === steps.length - 1 ? 'לסיכום ←' : 'לשלב הבא ←'}</button></div>
    </div> : <div className="buga-fade-in mt-4 text-center">
      <p className="text-5xl" aria-hidden="true">{score === steps.length ? '🏆' : '⭐'}</p>
      <p className="mt-2 text-2xl font-black">ענית נכון על {score} מתוך {steps.length} שאלות</p>
      <div className="mx-auto mt-3 max-w-xl rounded-2xl bg-white p-4 text-right"><b>📌 מה למדנו:</b><ul className="mt-1 list-disc pr-5">{t.facts.map((f, j) => <li key={j}>{f}</li>)}</ul></div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => { setK(0); setScore(0); setPick(null) }} className="ln-chip">🔁 שוב מההתחלה</button>
        <a href="#quiz" onClick={onClose} className="ln-chip">✅ לחידון המלא</a>
      </div>
    </div>}
  </section>
}
