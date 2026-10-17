// The interactive side of each homework task. Every player gives instant feedback, lets the child
// try again, and finally calls onDone({ score, total, seconds, details }) — score counts answers
// that were right on the first try, details keeps which items were missed for the teacher.
import { useEffect, useMemo, useRef, useState } from 'react'
import { speak, speakAndWait, stopSpeaking } from '../../utils/speak'
import { bubbleChoices, dictationCorrect, levelTask, matchAnswers, mathItems, readingPassage } from '../../utils/homework/tasks'

const now = () => Date.now()

function Progress({ at, total }) {
  return <div className="mb-4" aria-label={`${Math.min(at + 1, total)} מתוך ${total}`}>
    <div className="mb-1 flex justify-between text-sm font-bold text-slate-600"><span>{Math.min(at + 1, total)} / {total}</span></div>
    <div className="h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${(at / total) * 100}%` }} /></div>
  </div>
}

function Feedback({ state, answer }) {
  if (state === 'right') return <p className="mt-3 text-center text-xl font-black text-emerald-600" role="status">✓ נכון!</p>
  if (state === 'wrong') return <p className="mt-3 text-center text-lg font-bold text-orange-600" role="status">כמעט — נסו שוב 💪</p>
  if (state === 'shown') return <p className="mt-3 text-center text-lg font-bold text-slate-700" role="status">התשובה הנכונה: <b dir="ltr" className="text-violet-700">{answer}</b></p>
  return null
}

// Asks one item at a time; `check(value)` says whether it is right. Two wrong tries show the answer.
function useStepper(items, onDone) {
  const start = useRef(now())
  const [at, setAt] = useState(0), [tries, setTries] = useState(0), [state, setState] = useState(''), [details, setDetails] = useState([])
  const finish = list => onDone({ score: list.filter(d => d.ok).length, total: items.length, seconds: (now() - start.current) / 1000, details: list })
  const next = (list = details) => {
    setTries(0); setState('')
    if (at + 1 >= items.length) finish(list); else setAt(at + 1)
  }
  const record = (ok, extra = {}) => { const list = [...details, { i: at, ok, ...extra }]; setDetails(list); return list }
  const answer = (right, extra) => {
    if (state === 'right' || state === 'shown') return
    if (right) { const list = record(tries === 0, extra); setState('right'); setTimeout(() => next(list), 700); return }
    if (tries >= 1) { record(false, extra); setState('shown'); return }
    setTries(tries + 1); setState('wrong')
  }
  return { at, state, answer, next, item: items[at] }
}

// Maths homework: the teacher's way of solving (typing, balloons or matching), and when the teacher
// allowed it, the child first picks the regular level or the 🌶️ challenge. A challenge result marks
// every detail with lv: 'hard', so the teacher's table can show it and name the right exercises.
export function MathTask({ task, onDone }) {
  const [level, setLevel] = useState(task.levels ? '' : 'regular')
  const played = useMemo(() => levelTask(task, level), [task, level])
  if (!level) return <div className="mx-auto grid max-w-md gap-3">
    <h3 className="text-center text-xl font-black">באיזו רמה בא לך?</h3>
    <button type="button" onClick={() => setLevel('regular')} className="min-h-20 rounded-3xl border-4 border-violet-200 bg-white p-4 text-right hover:border-violet-500"><b className="block text-xl">🙂 רגילה</b><span className="text-slate-600">התרגילים שהמורה בחרה</span></button>
    <button type="button" onClick={() => setLevel('hard')} className="min-h-20 rounded-3xl border-4 border-orange-200 bg-orange-50 p-4 text-right hover:border-orange-500"><b className="block text-xl">🌶️ מאתגרת</b><span className="text-slate-600">מספרים גדולים יותר או מספר חסר</span></button>
  </div>
  const done = result => onDone(level === 'hard' ? { ...result, details: result.details.map(d => ({ ...d, lv: 'hard' })) } : result)
  const Player = played.mode === 'bubbles' ? BubblesTask : played.mode === 'match' ? MatchTask : TypeTask
  return <>
    {level === 'hard' && <p className="mb-3 text-center"><span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-black text-orange-800">🌶️ רמה מאתגרת</span></p>}
    <Player task={played} onDone={done} />
  </>
}

function TypeTask({ task, onDone }) {
  const items = useMemo(() => mathItems(task), [task])
  const { at, state, answer, next, item } = useStepper(items, onDone)
  // The typed answer belongs to one exercise; moving on starts with an empty box.
  const [typed, setTyped] = useState({ at: 0, value: '' })
  const value = typed.at === at ? typed.value : ''
  const setValue = v => setTyped({ at, value: v })
  const input = useRef(null)
  useEffect(() => { input.current?.focus() }, [at])
  const submit = event => {
    event.preventDefault()
    if (state === 'shown') { next(); return }
    if (value.trim() === '') return
    answer(Number(value) === item.answer, { given: value })
    if (Number(value) !== item.answer) setValue('')
  }
  return <form onSubmit={submit} className="mx-auto max-w-md">
    <Progress at={at} total={items.length} />
    <div dir="ltr" className="flex items-center justify-center gap-3 rounded-3xl bg-white p-6 text-4xl font-black shadow-sm sm:text-5xl">
      {item.parts.map((p, i) => p === null
        ? <input key={i} ref={input} value={value} onChange={e => setValue(e.target.value.replace(/[^\d-]/g, '').slice(0, 5))} inputMode="numeric" autoComplete="off" aria-label="התשובה"
          className={`w-24 rounded-2xl border-4 text-center outline-none ${state === 'right' ? 'border-emerald-400 bg-emerald-50' : state === 'wrong' ? 'border-orange-300' : 'border-violet-300 focus:border-violet-500'}`} disabled={state === 'right' || state === 'shown'} />
        : <span key={i}>{p}</span>)}
    </div>
    <Feedback state={state} answer={item.answer} />
    <button className="mt-5 min-h-14 w-full rounded-2xl bg-violet-600 text-xl font-black text-white shadow-[0_4px_0_#4527a8] active:translate-y-0.5">{state === 'shown' ? 'הבא ←' : 'בדיקה'}</button>
  </form>
}

const Exercise = ({ item, blank = '?' }) => <span dir="ltr" className="whitespace-nowrap">{item.parts.map((p, i) => <span key={i} className={p === null ? 'text-violet-600' : ''}>{p === null ? blank : p}{i < 4 ? ' ' : ''}</span>)}</span>

const BALLOONS = ['bg-rose-400', 'bg-sky-400', 'bg-amber-400', 'bg-emerald-400']
function BubblesTask({ task, onDone }) {
  const items = useMemo(() => mathItems(task), [task])
  const { at, state, answer, next, item } = useStepper(items, onDone)
  const choices = useMemo(() => bubbleChoices(item, at, task.seed), [item, at, task.seed])
  const [pickedAt, setPickedAt] = useState({ at: 0, list: [] })
  const picked = pickedAt.at === at ? pickedAt.list : []
  const pick = value => { setPickedAt({ at, list: [...picked, value] }); answer(value === item.answer, { given: value }) }
  return <div className="mx-auto max-w-md">
    <Progress at={at} total={items.length} />
    <div className="rounded-3xl bg-white p-6 text-center text-4xl font-black shadow-sm sm:text-5xl"><Exercise item={item} /></div>
    <div className="mt-5 grid grid-cols-2 gap-4">{choices.map((value, i) => {
      const popped = picked.includes(value) && value !== item.answer
      const right = (state === 'right' || state === 'shown') && value === item.answer
      return <button key={`${at}-${value}`} type="button" onClick={() => pick(value)} disabled={popped || state === 'right' || state === 'shown'}
        className={`hw-balloon mx-auto flex h-24 w-24 items-center justify-center rounded-full text-3xl font-black text-white shadow-lg transition sm:h-28 sm:w-28 ${right ? 'scale-110 bg-emerald-500 ring-4 ring-emerald-200' : popped ? 'scale-75 bg-slate-300 opacity-50' : `${BALLOONS[i % 4]} hover:-translate-y-1`}`}
        style={{ animationDelay: `${i * 0.3}s` }} aria-label={`התשובה ${value}`}>{value}</button>
    })}</div>
    <Feedback state={state} answer={item.answer} />
    {state === 'shown' && <button onClick={() => next()} className="mt-4 min-h-12 w-full rounded-2xl bg-violet-600 text-lg font-black text-white">הבא ←</button>}
  </div>
}

// Tap an exercise, then its answer. A pair is right on the first try when its exercise was never
// joined to a wrong answer; any answer card with the same value completes it.
function MatchTask({ task, onDone }) {
  const items = useMemo(() => mathItems(task), [task])
  const answers = useMemo(() => matchAnswers(items, task.seed), [items, task.seed])
  const start = useRef(now())
  const [chosen, setChosen] = useState(null), [matched, setMatched] = useState({}), [missed, setMissed] = useState([]), [shake, setShake] = useState(null)
  const usedAnswers = new Set(Object.values(matched))
  const tapAnswer = card => {
    if (chosen === null || usedAnswers.has(card.i)) return
    if (card.value !== items[chosen].answer) {
      setMissed(m => m.includes(chosen) ? m : [...m, chosen]); setShake(card.i); setTimeout(() => setShake(null), 450); return
    }
    const next = { ...matched, [chosen]: card.i }
    setMatched(next); setChosen(null)
    if (Object.keys(next).length === items.length) {
      const details = items.map((_, i) => ({ i, ok: !missed.includes(i) }))
      setTimeout(() => onDone({ score: details.filter(d => d.ok).length, total: items.length, seconds: (now() - start.current) / 1000, details }), 700)
    }
  }
  const pairColor = i => ['bg-rose-100 border-rose-400', 'bg-sky-100 border-sky-400', 'bg-amber-100 border-amber-400', 'bg-emerald-100 border-emerald-400', 'bg-violet-100 border-violet-400', 'bg-lime-100 border-lime-500', 'bg-pink-100 border-pink-400', 'bg-cyan-100 border-cyan-400'][i % 8]
  const answerPair = Object.fromEntries(Object.entries(matched).map(([ex, card]) => [card, Number(ex)]))
  return <div className="mx-auto max-w-xl">
    <Progress at={Object.keys(matched).length} total={items.length} />
    <p className="mb-3 text-center font-bold text-slate-600">{chosen === null ? 'בוחרים תרגיל, ואז את התשובה שלו' : 'עכשיו בוחרים את התשובה ←'}</p>
    <div className="grid grid-cols-2 gap-3">
      <div className="grid content-start gap-2">{items.map((item, i) => <button key={i} type="button" disabled={i in matched} onClick={() => setChosen(i)}
        className={`min-h-14 rounded-2xl border-4 px-2 text-2xl font-black ${i in matched ? pairColor(i) : chosen === i ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white hover:border-violet-300'}`}><Exercise item={item} /></button>)}</div>
      <div className="grid content-start gap-2">{answers.map(card => <button key={card.i} type="button" disabled={card.i in answerPair} onClick={() => tapAnswer(card)}
        className={`min-h-14 rounded-2xl border-4 text-2xl font-black transition ${card.i in answerPair ? pairColor(answerPair[card.i]) : shake === card.i ? 'hw-shake border-orange-400 bg-orange-50' : 'border-slate-200 bg-white hover:border-violet-300'}`}>{card.value}</button>)}</div>
    </div>
    {Object.keys(matched).length === items.length && <p className="mt-4 text-center text-2xl font-black text-emerald-600" role="status">🎉 כל הזוגות נמצאו!</p>}
  </div>
}

function ChoiceStep({ question, options, correct, state, onPick, picked }) {
  return <div>
    <h3 className="mb-3 text-xl font-black leading-relaxed">{question}</h3>
    <div className="grid gap-2">{options.map((option, i) => {
      const right = (state === 'right' || state === 'shown') && i === correct
      const wrong = picked.includes(i) && i !== correct
      return <button key={i} type="button" onClick={() => onPick(i)} disabled={state === 'right' || state === 'shown' || wrong}
        className={`min-h-12 rounded-2xl border-2 px-4 py-2 text-right text-lg font-bold ${right ? 'border-emerald-500 bg-emerald-50' : wrong ? 'border-orange-300 bg-orange-50 opacity-70' : 'border-slate-200 bg-white hover:border-violet-400'}`}>{option}</button>
    })}</div>
  </div>
}

function ChoiceQuiz({ questions, onDone }) {
  const { at, state, answer, next, item } = useStepper(questions, onDone)
  const [pickedAt, setPickedAt] = useState({ at: 0, list: [] })
  const picked = pickedAt.at === at ? pickedAt.list : []
  const setPicked = list => setPickedAt({ at, list })
  return <div>
    <Progress at={at} total={questions.length} />
    <ChoiceStep {...item} state={state} picked={picked} onPick={i => { setPicked([...picked, i]); answer(i === item.correct, { given: i }) }} />
    <Feedback state={state} answer={item.options[item.correct]} />
    {state === 'shown' && <button onClick={() => next()} className="mt-4 min-h-12 w-full rounded-2xl bg-violet-600 text-lg font-black text-white">הבא ←</button>}
  </div>
}

export function QuestionsTask({ task, onDone }) {
  const questions = useMemo(() => task.items.map(item => ({ question: item.q, options: item.options, correct: item.correct })), [task])
  return <div className="mx-auto max-w-xl"><ChoiceQuiz questions={questions} onDone={onDone} /></div>
}

export function ReadingTask({ task, onDone }) {
  const passage = readingPassage(task.slug)
  const [reading, setReading] = useState(-1)
  const [asking, setAsking] = useState(false)
  const readRun = useRef(0)
  useEffect(() => () => { readRun.current++; stopSpeaking() }, [])
  const questions = useMemo(() => (passage?.q || []).map(([question, options, correct]) => ({ question, options, correct })), [passage])
  if (!passage) return <p className="rounded-2xl bg-amber-50 p-4">הקטע הזה לא נמצא באתר.</p>
  // Paragraphs are read one after another in Noa's recorded voice; tapping a paragraph reads only it.
  const readFrom = async i => {
    stopSpeaking()
    const run = ++readRun.current
    for (let p = i; p < passage.text.length && run === readRun.current; p++) {
      setReading(p)
      if (!(await speakAndWait(passage.text[p], 'he-IL', { user: p === i }))) break
    }
    if (run === readRun.current) setReading(-1)
  }
  const stopReading = () => { readRun.current++; stopSpeaking(); setReading(-1) }
  return <div className="mx-auto max-w-2xl">
    {!asking && <article className="rounded-3xl bg-white p-5 shadow-sm">
      <h3 className="mb-1 text-2xl font-black">{passage.emoji} {passage.title}</h3>
      <button type="button" onClick={() => reading >= 0 ? stopReading() : readFrom(0)} className="mb-4 rounded-xl border-2 border-violet-300 px-3 py-1.5 font-bold text-violet-700">{reading >= 0 ? '⏹️ עצירה' : '🔊 להקריא לי את הקטע'}</button>
      {passage.text.map((p, i) => <p key={i} onClick={() => readFrom(i)} className={`mb-3 cursor-pointer rounded-xl p-1 text-lg leading-loose ${reading === i ? 'bg-yellow-100' : ''}`}>{p}</p>)}
      <button type="button" onClick={() => { stopReading(); setAsking(true) }} className="mt-2 min-h-14 w-full rounded-2xl bg-violet-600 text-xl font-black text-white">קראתי — לשאלות ←</button>
    </article>}
    {asking && <>
      <button type="button" onClick={() => setAsking(false)} className="mb-3 text-sm font-bold text-violet-700 underline">← לחזור לקטע</button>
      <ChoiceQuiz questions={questions} onDone={onDone} />
    </>}
  </div>
}

export function DictationTask({ task, onDone }) {
  const words = task.words || []
  const start = useRef(now())
  const [at, setAt] = useState(0), [typed, setTyped] = useState(''), [checked, setChecked] = useState(null), [details, setDetails] = useState([])
  const input = useRef(null)
  const word = words[at]
  useEffect(() => { speak(word, 'he-IL', { user: false }).catch(() => {}); input.current?.focus() }, [word])
  useEffect(() => () => stopSpeaking(), [])
  const submit = event => {
    event.preventDefault()
    if (checked !== null) {
      setChecked(null); setTyped('')
      if (at + 1 >= words.length) onDone({ score: details.filter(d => d.ok).length, total: words.length, seconds: (now() - start.current) / 1000, details })
      else setAt(at + 1)
      return
    }
    if (!typed.trim()) return
    const ok = dictationCorrect(word, typed)
    setDetails([...details, { i: at, ok, given: typed.trim() }]); setChecked(ok)
  }
  return <form onSubmit={submit} className="mx-auto max-w-md">
    <Progress at={at} total={words.length} />
    <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
      <button type="button" onClick={() => speak(word)} className="mb-4 min-h-16 rounded-2xl bg-sky-100 px-6 text-2xl font-black text-sky-800">🔊 לשמוע שוב</button>
      <input ref={input} value={typed} onChange={e => setTyped(e.target.value)} disabled={checked !== null} autoComplete="off" autoCorrect="off" spellCheck={false} aria-label="כתבו את המילה ששמעתם"
        className="w-full rounded-2xl border-4 border-violet-300 p-3 text-center text-3xl font-black outline-none focus:border-violet-500" />
      {checked === true && <p className="mt-3 text-xl font-black text-emerald-600" role="status">✓ נכון!</p>}
      {checked === false && <p className="mt-3 text-lg font-bold text-orange-600" role="status">כך כותבים: <b className="text-2xl text-violet-700">{word}</b></p>}
    </div>
    <button className="mt-5 min-h-14 w-full rounded-2xl bg-violet-600 text-xl font-black text-white shadow-[0_4px_0_#4527a8]">{checked === null ? 'בדיקה' : at + 1 >= words.length ? 'סיום ✓' : 'למילה הבאה ←'}</button>
  </form>
}

