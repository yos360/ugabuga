import { lazy, Suspense, useEffect, useState } from 'react'

// Two pieces every school subject shares:
// - SubjectReadings: reading passages for a grade or a lesson (src/learn/subjects/readings/<subject>.js),
//   one at a time with a "🔄 קטע אחר" button, questions with feedback and printing (ReadingExercise).
// - InteractiveLesson: the lesson as steps — one section at a time, a check question after each one,
//   a progress bar and a summary with the score. Built from the lesson's own sections and quiz.
// Lesson text is plain text. Code inside it is marked with U+2066 … U+2069 (LTR isolate, see data/coding.js) and
// rendered as an LTR <code> box, so a snippet reads left-to-right, never splits across lines, and copies without
// the invisible marks. Text without the mark comes back unchanged.
export function Rich({ text }) {
  if (!text.includes('⁦')) return text
  return text.split(/⁦([^⁩]*)⁩/).map((part, i) => i % 2 ? <code key={i} dir="ltr" className="sj-code">{part}</code> : part)
}

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

// A tap-to-match game on a concept page: four terms (this one and three neighbours) against their
// definitions. Order comes from a hash of the slug and the round, so the prerendered HTML and the
// hydrated page agree. The term is blanked inside its own definition so the match isn't a giveaway.
const hash = s => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7)
const blank = (text, term) => term.length > 1 ? text.split(term).join('____') : text
export function ConceptMatch({ c, pool }) {
  const [round, setRound] = useState(0)
  const [sel, setSel] = useState(null)
  const [done, setDone] = useState([])
  const [miss, setMiss] = useState(null)
  const others = pool.filter(x => x.slug !== c.slug).slice(0, 9) // pool comes nearest-first
  if (others.length < 3) return null
  const start = (hash(c.slug) + round * 3) % others.length
  const terms = [c, ...[0, 1, 2].map(i => others[(start + i) % others.length])]
  const defs = terms.map((t, i) => ({ t, i })).sort((a, b) => hash(a.t.slug + round) - hash(b.t.slug + round))
  const pickDef = d => {
    if (sel == null || done.includes(d.t.slug)) return
    if (terms[sel].slug === d.t.slug) { setDone(x => [...x, d.t.slug]); setSel(null) }
    else { setMiss(d.t.slug); setTimeout(() => setMiss(null), 600) }
  }
  const all = done.length === terms.length
  const again = () => { setRound(n => n + 1); setDone([]); setSel(null) }
  return <section className="sj-match ln-box mt-8" aria-labelledby="match-h">
    <h2 id="match-h" className="text-2xl font-black">🎯 משחק התאמה: מושג והגדרה</h2>
    <p className="m-0">לוחצים על מושג, ואז על ההגדרה שלו.</p>
    <div className="sj-match-grid">
      <div className="sj-match-col" role="group" aria-label="מושגים">{terms.map((t, i) => <button key={t.slug} type="button" disabled={done.includes(t.slug)} aria-pressed={sel === i}
        onClick={() => setSel(i)} className={`sj-m-term ${sel === i ? 'is-sel' : ''} ${done.includes(t.slug) ? 'is-ok' : ''}`}>{t.term}</button>)}</div>
      <div className="sj-match-col" role="group" aria-label="הגדרות">{defs.map(d => <button key={d.t.slug} type="button" disabled={done.includes(d.t.slug)}
        onClick={() => pickDef(d)} className={`sj-m-def ${done.includes(d.t.slug) ? 'is-ok' : ''} ${miss === d.t.slug ? 'is-miss' : ''}`}>{done.includes(d.t.slug) && <b>{d.t.term}: </b>}<Rich text={done.includes(d.t.slug) ? d.t.short : blank(d.t.short, d.t.term)} /></button>)}</div>
    </div>
    <p className="m-0 mt-3 font-bold" role="status">{all ? '🎉 כל הכבוד — כל ההתאמות נכונות!' : sel != null ? `ועכשיו: איזו הגדרה מתאימה ל"${terms[sel].term}"?` : `${done.length} מתוך ${terms.length}`}</p>
    {all && <button type="button" className="ln-btn go mt-2" onClick={again}>🔁 עוד סיבוב, עם מושגים אחרים</button>}
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
      <div className="mt-2 space-y-2 text-lg leading-relaxed">{step.s.p.map((p, j) => <p key={j}><Rich text={p} /></p>)}</div>
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
