import { useState } from 'react'
import { newQid, quizMemory } from '../../utils/quizDb'

const LETTERS = ['א', 'ב', 'ג', 'ד']
const blankQ = () => ({ id: newQid(), q: '', options: ['', '', ''], correct: null })
export const emptyQuiz = () => ({ title: '', questions: [blankQ()], settings: { showScore: true, shuffle: true, minutes: 0, dir: 'rtl' }, names: [] })
const SAMPLE = {
  title: 'בוחן קצר בחשבון',
  questions: [
    { q: 'כמה זה 7 + 5?', options: ['11', '12', '13'], correct: 1 },
    { q: 'איזה מספר גדול יותר?', options: ['48', '84', '44'], correct: 1 },
    { q: 'כמה צלעות יש למשולש?', options: ['2', '3', '4'], correct: 1 },
    { q: 'כמה זה 10 − 4?', options: ['6', '5', '14'], correct: 0 },
  ],
}

const input = 'w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-[17px] focus:border-slate-800 focus:outline-none'

// Client-side check, pointing at the first problem by question number.
export function quizProblem(quiz) {
  if (!quiz.questions.length) return 'צריך לפחות שאלה אחת.'
  for (const [i, q] of quiz.questions.entries()) {
    const n = i + 1
    if (!q.q.trim()) return `שאלה ${n}: חסר נוסח השאלה.`
    const opts = q.options.map(o => o.trim())
    if (opts.filter(Boolean).length < 2) return `שאלה ${n}: צריך לפחות 2 תשובות.`
    if (opts.some(o => !o)) return `שאלה ${n}: יש תשובה ריקה — מלאו או מחקו אותה.`
    if (q.correct == null || !opts[q.correct]) return `שאלה ${n}: סמנו את התשובה הנכונה (העיגול שליד התשובה).`
  }
  return ''
}
export const toPayload = quiz => quiz.questions.map(q => ({ id: q.id, q: q.q.trim(), options: q.options.map(o => o.trim()), correct: q.correct }))

export default function QuizEditor({ initial, onSubmit, submitLabel, busy, lockQuestions = false }) {
  const [quiz, setQuiz] = useState(() => initial || emptyQuiz())
  const [err, setErr] = useState('')
  const lists = quizMemory.classLists()
  const setQ = (i, patch) => setQuiz(z => ({ ...z, questions: z.questions.map((q, n) => n === i ? { ...q, ...patch } : q) }))
  const setOpt = (i, o, v) => setQuiz(z => ({ ...z, questions: z.questions.map((q, n) => n === i ? { ...q, options: q.options.map((x, m) => m === o ? v : x) } : q) }))
  const dropOpt = (i, o) => setQuiz(z => ({ ...z, questions: z.questions.map((q, n) => n !== i ? q : { ...q, options: q.options.filter((_, m) => m !== o), correct: q.correct === o ? null : q.correct > o ? q.correct - 1 : q.correct }) }))
  const move = (i, d) => setQuiz(z => { const qs = [...z.questions]; const j = i + d; if (j < 0 || j >= qs.length) return z; [qs[i], qs[j]] = [qs[j], qs[i]]; return { ...z, questions: qs } })
  const setS = patch => setQuiz(z => ({ ...z, settings: { ...z.settings, ...patch } }))
  const submit = e => {
    e.preventDefault()
    const p = quizProblem(quiz); setErr(p)
    if (!p) onSubmit(quiz)
  }
  const sample = () => setQuiz(z => ({ ...z, title: SAMPLE.title, questions: SAMPLE.questions.map(q => ({ ...q, id: newQid() })) }))

  return <form onSubmit={submit} className="space-y-5">
    <div className="rounded-3xl border-2 border-slate-200 bg-white p-4 sm:p-5">
      <label className="block font-bold">שם המבחן
        <input value={quiz.title} onChange={e => setQuiz(z => ({ ...z, title: e.target.value }))} maxLength={80} placeholder="למשל: בוחן בחשבון — כיתה ב׳" className={`${input} mt-1`} /></label>
      {!lockQuestions && quiz.questions.length === 1 && !quiz.questions[0].q && <button type="button" onClick={sample} className="mt-2 text-sm font-bold text-violet-700 underline">רוצים לראות איך זה עובד? מלאו מבחן לדוגמה</button>}
    </div>

    {lockQuestions
      ? <p className="rounded-2xl bg-amber-50 p-4 font-bold text-amber-900">תלמידים כבר הגישו, ולכן אי אפשר לשנות את השאלות. אפשר לשנות שם, הגדרות ורשימת שמות.</p>
      : <div className="space-y-4">{quiz.questions.map((q, i) => <fieldset key={q.id} className="rounded-3xl border-2 border-slate-200 bg-white p-4 sm:p-5">
        <legend className="px-2 text-lg font-black">שאלה {i + 1}</legend>
        <textarea value={q.q} onChange={e => setQ(i, { q: e.target.value })} maxLength={300} rows={2} placeholder="כתבו את השאלה" aria-label={`נוסח שאלה ${i + 1}`} className={input} dir={quiz.settings.dir} />
        <p className="mb-1 mt-3 text-sm font-bold text-slate-600">תשובות — לחצו על העיגול ליד התשובה הנכונה:</p>
        <div className="space-y-2">{q.options.map((o, m) => <div key={m} className="flex items-center gap-2">
          <button type="button" onClick={() => setQ(i, { correct: m })} aria-pressed={q.correct === m} aria-label={`סימון תשובה ${LETTERS[m]} כנכונה`}
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 text-lg font-black ${q.correct === m ? 'border-emerald-600 bg-emerald-500 text-white' : 'border-slate-300 bg-white text-slate-500'}`}>{q.correct === m ? '✓' : LETTERS[m]}</button>
          <input value={o} onChange={e => setOpt(i, m, e.target.value)} maxLength={150} placeholder={`תשובה ${LETTERS[m]}`} aria-label={`שאלה ${i + 1}, תשובה ${LETTERS[m]}`} className={input} dir={quiz.settings.dir} />
          {q.options.length > 2 && <button type="button" onClick={() => dropOpt(i, m)} aria-label={`מחיקת תשובה ${LETTERS[m]}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-400 hover:text-rose-600">✕</button>}
        </div>)}</div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          {q.options.length < 4 && <button type="button" onClick={() => setQ(i, { options: [...q.options, ''] })} className="rounded-xl border-2 border-dashed border-slate-300 px-3 py-1.5 font-bold">＋ תשובה</button>}
          <span className="flex-1" />
          <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="הזזה למעלה" className="rounded-lg px-2 py-1 font-bold disabled:opacity-30">↑</button>
          <button type="button" onClick={() => move(i, 1)} disabled={i === quiz.questions.length - 1} aria-label="הזזה למטה" className="rounded-lg px-2 py-1 font-bold disabled:opacity-30">↓</button>
          <button type="button" onClick={() => setQuiz(z => ({ ...z, questions: [...z.questions.slice(0, i + 1), { ...q, id: newQid(), options: [...q.options] }, ...z.questions.slice(i + 1)] }))} className="rounded-lg px-2 py-1 font-bold text-slate-600">שכפול</button>
          {quiz.questions.length > 1 && <button type="button" onClick={() => setQuiz(z => ({ ...z, questions: z.questions.filter((_, n) => n !== i) }))} className="rounded-lg px-2 py-1 font-bold text-rose-700">מחיקה</button>}
        </div>
      </fieldset>)}
        {quiz.questions.length < 50 && <button type="button" onClick={() => setQuiz(z => ({ ...z, questions: [...z.questions, blankQ()] }))} className="w-full rounded-3xl border-2 border-dashed border-slate-300 bg-white py-4 text-lg font-bold">＋ שאלה חדשה</button>}
      </div>}

    <fieldset className="space-y-3 rounded-3xl border-2 border-slate-200 bg-white p-4 sm:p-5">
      <legend className="px-2 text-lg font-black">⚙️ הגדרות</legend>
      <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={quiz.settings.showScore} onChange={e => setS({ showScore: e.target.checked })} className="h-5 w-5 accent-slate-800" />התלמיד רואה את הציון בסוף</label>
      <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={quiz.settings.shuffle} onChange={e => setS({ shuffle: e.target.checked })} className="h-5 w-5 accent-slate-800" />ערבוב סדר השאלות והתשובות לכל תלמיד (קשה יותר להעתיק)</label>
      <label className="flex flex-wrap items-center gap-2 font-bold">הגבלת זמן
        <select value={quiz.settings.minutes} onChange={e => setS({ minutes: +e.target.value })} className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2">
          <option value={0}>בלי הגבלה</option>{[5, 10, 15, 20, 30, 45, 60].map(m => <option key={m} value={m}>{m} דקות</option>)}
        </select></label>
      <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={quiz.settings.dir === 'ltr'} onChange={e => setS({ dir: e.target.checked ? 'ltr' : 'rtl' })} className="h-5 w-5 accent-slate-800" />מבחן באנגלית (כתיבה משמאל לימין)</label>
    </fieldset>

    <fieldset className="space-y-2 rounded-3xl border-2 border-slate-200 bg-white p-4 sm:p-5">
      <legend className="px-2 text-lg font-black">👧 שמות התלמידים <span className="text-sm font-normal text-slate-500">(לא חובה)</span></legend>
      <p className="text-sm text-slate-600">אם תוסיפו שמות, כל תלמיד יבחר את השם שלו מרשימה — בלי שגיאות כתיב, ותראו מי עוד לא הגיש. שם פרטי מספיק.</p>
      {lists.length > 0 && <div className="flex flex-wrap gap-2">{lists.map(l => <button type="button" key={l.name} onClick={() => setQuiz(z => ({ ...z, names: l.names.slice(0, 60) }))} className="rounded-full border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-bold">📋 {l.name} ({l.names.length})</button>)}</div>}
      <textarea value={quiz.names.join('\n')} onChange={e => setQuiz(z => ({ ...z, names: e.target.value.split('\n').slice(0, 60) }))} onBlur={() => setQuiz(z => ({ ...z, names: z.names.map(n => n.trim()).filter(Boolean) }))} rows={4} placeholder={'שם בכל שורה\nנועה\nאיתי'} aria-label="שמות התלמידים, שם בכל שורה" className={input} />
    </fieldset>

    {err && <p role="alert" className="rounded-2xl bg-rose-50 p-4 font-bold text-rose-800">{err}</p>}
    <button disabled={busy} className="w-full rounded-2xl bg-[var(--ink)] px-6 py-4 text-xl font-bold text-white disabled:opacity-60">{busy ? 'שומרים…' : submitLabel}</button>
  </form>
}

// Hebrew text with arithmetic ("כמה זה 10 − 4?") gets its numbers flipped by the
// bidi algorithm. Isolate each math run left-to-right so it reads as typed.
const MATH = /(\d[\d\s+\-−×÷*/=.,:()%]*\d%?|\d%?)/
export function MathText({ children }) {
  const text = String(children ?? '')
  return text.split(MATH).map((part, i) => i % 2 ? <bdi key={i} dir="ltr">{part}</bdi> : part)
}
