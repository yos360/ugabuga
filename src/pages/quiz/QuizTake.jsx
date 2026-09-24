import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import { quizDb, quizMemory, quizErrorText } from '../../utils/quizDb'
import { MathText } from '../../components/quiz/QuizEditor'

const LETTERS = ['א', 'ב', 'ג', 'ד']
// Deterministic shuffle per device+quiz, so a refresh keeps the same order.
function seeded(seed) { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296 } }
function shuffled(arr, rnd) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a }
const draftKey = code => `buga-quiz-draft-${code}`
const readDraft = code => { try { return JSON.parse(sessionStorage.getItem(draftKey(code))) || null } catch { return null } }
const saveDraft = (code, v) => { try { sessionStorage.setItem(draftKey(code), JSON.stringify(v)) } catch { /* ignore */ } }

export default function QuizTake() {
  const { code } = useParams()
  const [quiz, setQuiz] = useState(null), [err, setErr] = useState('')
  const [done, setDone] = useState(() => quizMemory.done(code))
  const draft = useMemo(() => readDraft(code), [code])
  const [name, setName] = useState(draft?.name || ''), [started, setStarted] = useState(!!draft?.started)
  const [answers, setAnswers] = useState(draft?.answers || {}), [step, setStep] = useState(draft?.step || 0)
  const [endsAt, setEndsAt] = useState(draft?.endsAt || 0), [now, setNow] = useState(Date.now())
  const [sending, setSending] = useState(false), [sendErr, setSendErr] = useState('')
  const deviceId = useMemo(() => quizMemory.deviceId(), [])
  const submitted = useRef(false)

  useEffect(() => { quizDb.get(code).then(setQuiz).catch(e => setErr(quizErrorText(e.code))) }, [code])
  useEffect(() => { if (started && !done) saveDraft(code, { name, started, answers, step, endsAt }) }, [code, name, started, answers, step, endsAt, done])

  const items = useMemo(() => {
    if (!quiz) return []
    const rnd = seeded(`${deviceId}:${code}`)
    const qs = quiz.settings.shuffle ? shuffled(quiz.questions, rnd) : quiz.questions
    return qs.map(q => ({ ...q, order: quiz.settings.shuffle ? shuffled(q.options.map((_, i) => i), rnd) : q.options.map((_, i) => i) }))
  }, [quiz, deviceId, code])

  const submit = async () => {
    if (submitted.current) return
    submitted.current = true; setSending(true); setSendErr('')
    try {
      const r = await quizDb.submit(code, deviceId, name.trim(), answers)
      const result = { name: name.trim(), score: r.score, total: r.total, shown: r.shown }
      quizMemory.setDone(code, result); setDone(result)
      try { sessionStorage.removeItem(draftKey(code)) } catch { /* ignore */ }
    } catch (e) {
      submitted.current = false
      setSendErr(quizErrorText(e.code))
      if (e.code === 'already_submitted') { const r = { name: name.trim(), score: null, total: items.length, shown: false }; quizMemory.setDone(code, r); setDone(r) }
    } finally { setSending(false) }
  }

  // Timer: counts down and hands the quiz in when time is up.
  useEffect(() => {
    if (!started || !endsAt || done) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [started, endsAt, done])
  const left = endsAt ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : null
  useEffect(() => { if (left === 0 && started && !done) submit() }, [left]) // eslint-disable-line react-hooks/exhaustive-deps

  const begin = e => {
    e?.preventDefault()
    if (!name.trim()) return
    setStarted(true)
    if (quiz.settings.minutes && !endsAt) setEndsAt(Date.now() + quiz.settings.minutes * 60000)
  }

  const shell = children => <div className="mx-auto min-h-[70vh] max-w-2xl px-4 py-6" dir="rtl">
    <SEO title={quiz?.title || 'מבחן'} description="מבחן אונליין" path={`/q/${code}`} noindex />
    {children}
    <p className="mt-10 text-center text-xs text-slate-400">נוצר בעוגה בוגה · <Link to="/classroom/quiz" className="underline">מורים? צרו מבחן בחינם</Link></p>
  </div>

  if (err) return shell(<div className="rounded-3xl bg-amber-50 p-8 text-center text-lg font-bold">{err}</div>)
  if (!quiz) return shell(<p className="py-20 text-center text-lg">טוענים את המבחן…</p>)
  if (done) return shell(<div className="rounded-[32px] bg-gradient-to-br from-emerald-50 to-sky-50 p-8 text-center">
    <div className="text-6xl">🎉</div>
    <h1 className="mt-3 text-3xl font-black">הוגש! כל הכבוד{done.name ? `, ${done.name}` : ''}</h1>
    {done.shown && done.score != null
      ? <p className="mt-4 text-2xl">ענית נכון על <b className="text-4xl">{done.score}</b> מתוך {done.total} שאלות</p>
      : <p className="mt-4 text-lg text-slate-600">התשובות נשלחו למורה.</p>}
  </div>)
  if (quiz.status !== 'open') return shell(<div className="rounded-3xl bg-slate-50 p-8 text-center text-lg font-bold">🔒 המבחן סגור כרגע.</div>)

  if (!started) return shell(<form onSubmit={begin} className="rounded-[32px] border-2 border-slate-200 bg-white p-6 text-center sm:p-8">
    <div className="text-5xl">📝</div>
    <h1 className="mt-2 text-3xl font-black">{quiz.title}</h1>
    <p className="mt-1 text-slate-600">{items.length} שאלות{quiz.settings.minutes ? ` · ${quiz.settings.minutes} דקות` : ''}</p>
    <p className="mb-3 mt-6 text-lg font-bold">{quiz.names.length ? 'בחרו את השם שלכם:' : 'מה השם שלכם?'}</p>
    {quiz.names.length
      ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{quiz.names.map(n => <button type="button" key={n} onClick={() => setName(n)} aria-pressed={name === n}
        className={`min-h-[52px] rounded-2xl border-2 px-3 text-lg font-bold ${name === n ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 bg-white'}`}>{n}</button>)}</div>
      : <input value={name} onChange={e => setName(e.target.value)} maxLength={40} placeholder="שם פרטי" autoFocus className="w-full rounded-2xl border-2 border-slate-300 px-4 py-3 text-center text-xl focus:border-violet-600 focus:outline-none" />}
    <button disabled={!name.trim()} className="mt-6 w-full rounded-2xl bg-violet-600 py-4 text-xl font-black text-white disabled:opacity-40">מתחילים ←</button>
  </form>)

  const review = step >= items.length
  const answeredCount = items.filter(q => answers[q.id] != null).length
  const q = items[step]
  const mm = left != null ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : null

  return shell(<div>
    <div className="mb-4 flex items-center justify-between gap-3 text-sm font-bold text-slate-600">
      <span>{name}</span>
      {mm && <span className={`rounded-full px-3 py-1 ${left < 60 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100'}`} aria-live="polite">⏱ {mm}</span>}
      <span>{answeredCount}/{items.length} נענו</span>
    </div>
    <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-violet-500 transition-all" style={{ width: `${Math.min(step, items.length) / items.length * 100}%` }} /></div>

    {!review ? <section aria-label={`שאלה ${step + 1}`} className="rounded-[28px] border-2 border-slate-200 bg-white p-5 sm:p-7">
      <p className="text-sm font-bold text-violet-700">שאלה {step + 1} מתוך {items.length}</p>
      <h1 className="mt-2 whitespace-pre-line text-2xl font-black leading-snug sm:text-3xl" dir={quiz.settings.dir}><MathText>{q.q}</MathText></h1>
      <div className="mt-5 space-y-3">{q.order.map((orig, i) => {
        const on = answers[q.id] === orig
        return <button key={orig} onClick={() => setAnswers(a => ({ ...a, [q.id]: orig }))} aria-pressed={on} dir={quiz.settings.dir}
          className={`flex min-h-[60px] w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-start text-lg font-bold transition ${on ? 'border-violet-600 bg-violet-50' : 'border-slate-200 bg-white hover:border-slate-400'}`}>
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-base ${on ? 'bg-violet-600 text-white' : 'bg-slate-100'}`}>{LETTERS[i]}</span><MathText>{q.options[orig]}</MathText>
        </button>
      })}</div>
      <div className="mt-6 flex gap-3">
        <button onClick={() => setStep(s => s - 1)} disabled={step === 0} className="rounded-2xl border-2 border-slate-200 px-5 py-3 font-bold disabled:opacity-30">→ הקודמת</button>
        <button onClick={() => setStep(s => s + 1)} className="flex-1 rounded-2xl bg-violet-600 py-3 text-lg font-black text-white">{step === items.length - 1 ? 'לסיום ←' : 'הבאה ←'}</button>
      </div>
    </section>
      : <section className="rounded-[28px] border-2 border-slate-200 bg-white p-5 text-center sm:p-7">
        <h1 className="text-2xl font-black">מוכנים להגיש?</h1>
        <p className="mt-2 text-slate-600">ענית על {answeredCount} מתוך {items.length} שאלות.{answeredCount < items.length ? ' אפשר לחזור ולהשלים:' : ''}</p>
        <div className="my-4 flex flex-wrap justify-center gap-2">{items.map((it, i) => <button key={it.id} onClick={() => setStep(i)} aria-label={`מעבר לשאלה ${i + 1}`}
          className={`grid h-11 w-11 place-items-center rounded-xl border-2 font-bold ${answers[it.id] != null ? 'border-emerald-300 bg-emerald-50' : 'border-amber-400 bg-amber-50'}`}>{i + 1}</button>)}</div>
        {sendErr && <p role="alert" className="mb-3 rounded-xl bg-rose-50 p-3 font-bold text-rose-800">{sendErr}</p>}
        <button onClick={submit} disabled={sending} className="w-full rounded-2xl bg-emerald-600 py-4 text-xl font-black text-white disabled:opacity-60">{sending ? 'שולחים…' : '✅ הגשה'}</button>
        <button onClick={() => setStep(items.length - 1)} className="mt-3 text-sm font-bold text-slate-500 underline">חזרה לשאלות</button>
      </section>}
    {!review && <div className="mt-4 flex flex-wrap justify-center gap-1.5">{items.map((it, i) => <button key={it.id} onClick={() => setStep(i)} aria-label={`מעבר לשאלה ${i + 1}`}
      className={`h-3 w-3 rounded-full ${i === step ? 'bg-violet-600' : answers[it.id] != null ? 'bg-violet-300' : 'bg-slate-200'}`} />)}</div>}
  </div>)
}
