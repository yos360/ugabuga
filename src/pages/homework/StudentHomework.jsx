import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import { DictationTask, MathTask, QuestionsTask, ReadingTask } from '../../components/homework/TaskPlayers'
import { homeworkError, homeworkStudent } from '../../utils/homework/db'
import { TASK_TYPES, taskHint, taskTitle } from '../../utils/homework/tasks'
import SiteInvite from '../../components/ui/SiteInvite'

const PLAYERS = { math: MathTask, reading: ReadingTask, dictation: DictationTask, questions: QuestionsTask }
const nameKey = code => `buga-homework-name-${code}`
const loadName = code => { try { return localStorage.getItem(nameKey(code)) || '' } catch { return '' } }
const saveName = (code, name) => { try { if (name) localStorage.setItem(nameKey(code), name); else localStorage.removeItem(nameKey(code)) } catch { /* ignore */ } }
const stars = (score, total) => { const r = total ? score / total : 0; return r >= 0.9 ? '⭐⭐⭐' : r >= 0.6 ? '⭐⭐' : '⭐' }
const formatDue = iso => new Date(`${iso}T12:00:00`).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })

function PickName({ homework, onPick }) {
  const [typed, setTyped] = useState('')
  return <section className="rounded-3xl bg-white p-6 shadow-sm">
    <h2 className="mb-4 text-center text-2xl font-black">מי אני? 👋</h2>
    {homework.names.length ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {homework.names.map(name => <button key={name} onClick={() => onPick(name)} className="min-h-14 rounded-2xl border-2 border-violet-200 bg-violet-50 px-3 text-lg font-bold hover:border-violet-500">{name}</button>)}
    </div> : <form onSubmit={e => { e.preventDefault(); if (typed.trim()) onPick(typed.trim().slice(0, 40)) }} className="flex gap-2">
      <input value={typed} onChange={e => setTyped(e.target.value)} placeholder="השם הפרטי שלי" aria-label="השם שלי" className="min-w-0 flex-1 rounded-2xl border-2 border-slate-200 px-4 py-3 text-lg" maxLength={40} autoFocus />
      <button className="rounded-2xl bg-violet-600 px-5 font-black text-white">יאללה</button>
    </form>}
  </section>
}

export default function StudentHomework() {
  const { code: rawCode = '' } = useParams()
  const code = rawCode.toLowerCase()
  const [homework, setHomework] = useState(null), [error, setError] = useState('')
  const [name, setName] = useState(() => loadName(code))
  const [done, setDone] = useState({}), [active, setActive] = useState(null), [result, setResult] = useState(null), [sending, setSending] = useState(false)

  useEffect(() => { homeworkStudent.open(code).then(setHomework).catch(e => setError(homeworkError(e))) }, [code])
  const refresh = useCallback(() => {
    if (!name) return
    homeworkStudent.progress(code, name).then(rows => setDone(Object.fromEntries((rows || []).map(r => [r.task, r])))).catch(() => {})
  }, [code, name])
  useEffect(refresh, [refresh])
  // A remembered name that the teacher has since removed from the list is forgotten.
  const knownName = !homework || !homework.names.length || homework.names.some(n => n.toLowerCase() === name.toLowerCase())
  const currentName = knownName ? name : ''
  const pick = value => { saveName(code, value); setName(value) }

  const finish = async res => {
    setResult({ ...res, task: active }); setActive(null); setSending(true)
    try { await homeworkStudent.submit(code, currentName, active, res); refresh() } catch (e) { setResult(r => ({ ...r, error: homeworkError(e) })) } finally { setSending(false) }
  }

  const page = children => <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white px-4 py-6" dir="rtl">
    <SEO title={homework ? `${homework.title} — שיעורי בית` : 'שיעורי בית — עוגה בוגה'} description="שיעורי בית אינטראקטיביים מהמורה." path={`/hw/${code}`} noindex />
    <div className="mx-auto max-w-2xl">{children}</div>
  </div>

  if (error) return page(<p className="mt-10 rounded-3xl bg-white p-6 text-center text-lg font-bold shadow-sm">{error}</p>)
  if (!homework) return page(<p className="mt-10 text-center" role="status">טוענים את שיעורי הבית…</p>)
  const total = homework.tasks.length, finished = homework.tasks.filter((_, i) => done[i]).length

  if (active !== null) {
    const task = homework.tasks[active], Player = PLAYERS[task.type]
    return page(<>
      <button onClick={() => setActive(null)} className="mb-4 text-sm font-bold text-violet-700 underline">← חזרה לרשימת המשימות</button>
      <h1 className="mb-4 text-center text-2xl font-black">{TASK_TYPES[task.type]?.emoji} {taskTitle(task)}</h1>
      {Player ? <Player task={task} onDone={finish} /> : <p>סוג משימה לא מוכר.</p>}
    </>)
  }

  return page(<>
    <header className="mb-5 text-center">
      <p className="font-bold text-violet-700">📚 שיעורי בית{homework.class_name ? ` · ${homework.class_name}` : ''}</p>
      <h1 className="text-3xl font-black">{homework.title}</h1>
      {homework.due_date && <p className="mt-1 text-slate-600">להגיש עד {formatDue(homework.due_date)}</p>}
      {homework.status === 'closed' && <p className="mt-3 rounded-2xl bg-amber-50 p-3 font-bold">המורה סגרה את שיעורי הבית האלה.</p>}
    </header>
    {!currentName ? <PickName homework={homework} onPick={pick} /> : <>
      <div className="mb-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
        <span className="text-lg">שלום <b>{currentName}</b>! {finished === total ? 'סיימת הכל 🎉' : `סיימת ${finished} מתוך ${total}`}</span>
        <button onClick={() => pick('')} className="text-sm font-bold text-slate-500 underline">זה לא אני</button>
      </div>
      {result && <div className={`mb-4 rounded-3xl p-5 text-center ${result.error ? 'bg-amber-50' : 'bg-emerald-50'}`} role="status">
        <p className="text-4xl">{stars(result.score, result.total)}</p>
        <p className="text-xl font-black">{result.score} מתוך {result.total} נכונות בניסיון הראשון</p>
        <p className="text-sm text-slate-600">{sending ? 'שולחים למורה…' : result.error || 'נשלח למורה ✓'}</p>
      </div>}
      <ol className="space-y-3">{homework.tasks.map((task, i) => {
        const r = done[i], info = TASK_TYPES[task.type] || {}
        return <li key={i}>
          <button onClick={() => { setResult(null); setActive(i) }} disabled={homework.status === 'closed'}
            className={`flex w-full items-center gap-4 rounded-3xl border-2 p-4 text-right shadow-sm ${r ? 'border-emerald-300 bg-emerald-50' : 'border-violet-200 bg-white hover:border-violet-500'}`}>
            <span className="text-4xl">{r ? '✅' : info.emoji}</span>
            <span className="flex-1"><b className="block text-lg">{taskTitle(task)}</b><span className="text-sm text-slate-600">{r ? `${r.score} מתוך ${r.total} · אפשר לנסות שוב` : taskHint(task)}</span></span>
            <span className="text-2xl text-violet-500">←</span>
          </button>
        </li>
      })}</ol>
      {finished === total && <p className="mt-6 text-center text-2xl font-black">🎉 כל הכבוד! סיימת את כל שיעורי הבית</p>}
      {finished === total && <SiteInvite context="kids" className="mt-6" />}
    </>}
  </>)
}
