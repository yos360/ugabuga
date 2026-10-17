import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import TeacherGate from './TeacherGate'
import { homeworkError, homeworkLink, homeworkTeacher } from '../../utils/homework/db'
import { DICTATION_LISTS, MATCH_MAX, MATH_KINDS, MATH_MODES, MATH_OPS, MATH_RANGES, MATH_TABLES, READING_OPTIONS, TASK_TYPES, TEMPLATE_GRADES, challengeTask, cleanTask, gradeTemplate, levelTask, mathItems, newTask, parseNames, parseWords, readingPassage, scoreTone, taskProblems, taskTitle } from '../../utils/homework/tasks'
import { loadClassRoster } from '../../utils/classRoster'

const btn = 'min-h-11 rounded-xl px-4 py-2 font-bold'
const primary = `${btn} bg-violet-600 text-white shadow-[0_3px_0_#4527a8] disabled:opacity-60`
const ghost = `${btn} border-2 border-slate-200 bg-white text-slate-700 hover:border-slate-400`
const field = 'w-full rounded-xl border-2 border-slate-200 px-3 py-2'
const formatDate = iso => iso ? new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' }) : ''

// ── List ─────────────────────────────────────────────────────
export function TeacherHome() {
  return <TeacherGate title="מרחב המורה — שיעורי בית אינטראקטיביים | עוגה בוגה">{({ session, signOut }) => <HomeworkList session={session} signOut={signOut} />}</TeacherGate>
}

function HomeworkList({ session, signOut }) {
  const nav = useNavigate()
  const [list, setList] = useState(null), [counts, setCounts] = useState({}), [error, setError] = useState('')
  const load = () => Promise.all([homeworkTeacher.list(), homeworkTeacher.resultCounts()]).then(([rows, results]) => {
    setList(rows)
    const byId = {}
    for (const r of results) (byId[r.assignment_id] ||= new Set()).add(r.student_name.toLowerCase())
    setCounts(byId)
  }).catch(() => setError('לא הצלחנו לטעון. ייתכן שצריך להריץ את עדכון מסד הנתונים (homework).'))
  useEffect(() => { load() }, [])
  const remove = async item => { if (!window.confirm(`למחוק את „${item.title}” ואת כל התוצאות שלו?`)) return; await homeworkTeacher.remove(item.code).catch(() => {}); load() }
  const duplicate = async item => {
    try { const code = await homeworkTeacher.save({ title: `${item.title} (עותק)`, className: item.class_name, tasks: item.tasks, names: item.names }); nav(`/teachers/homework/${code}/edit`) } catch (e) { setError(homeworkError(e)) }
  }
  return <>
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-3xl font-black">📚 שיעורי הבית שלי</h1><p className="text-slate-600">מחובר/ת בתור {session.user.email}</p></div>
      <div className="flex gap-2"><Link to="/teachers/homework/new" className={primary}>+ שיעורי בית חדשים</Link><button onClick={signOut} className={ghost}>יציאה</button></div>
    </header>
    {error && <p className="mb-4 rounded-xl bg-amber-50 p-3 font-bold">{error}</p>}
    {!list ? <p role="status">טוענים…</p> : !list.length ? <div className="rounded-3xl bg-violet-50 p-8 text-center">
      <p className="text-5xl">📝</p><h2 className="mt-2 text-2xl font-black">עוד אין שיעורי בית</h2>
      <p className="mb-4 text-slate-600">בוחרים משימות, שולחים קישור לכיתה, ורואים כאן מי סיים.</p>
      <Link to="/teachers/homework/new" className={primary}>לבנות את שיעורי הבית הראשונים</Link>
    </div> : <ul className="grid gap-3 sm:grid-cols-2">{list.map(item => {
      const started = counts[item.id]?.size || 0
      return <li key={item.code} className="rounded-3xl border-2 border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div><h2 className="text-xl font-black">{item.title}</h2>
            <p className="text-sm text-slate-600">{[item.class_name, `${item.tasks.length} משימות`, item.due_date && `עד ${formatDate(item.due_date)}`].filter(Boolean).join(' · ')}</p></div>
          {item.status === 'closed' && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold">סגור</span>}
        </div>
        <p className="mt-2 text-sm text-slate-500">{started ? `${started} ${item.names.length ? `מתוך ${item.names.length} ` : ''}התחילו` : 'עוד אף אחד לא התחיל'}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to={`/teachers/homework/${item.code}`} className={primary}>תוצאות ושליחה</Link>
          <Link to={`/teachers/homework/${item.code}/edit`} className={ghost}>עריכה</Link>
          <button onClick={() => duplicate(item)} className={ghost}>שכפול</button>
          <button onClick={() => remove(item)} className={`${ghost} text-red-700`}>מחיקה</button>
        </div>
      </li>
    })}</ul>}
  </>
}

// ── Builder ──────────────────────────────────────────────────
export function HomeworkBuilderPage() {
  const { code } = useParams()
  return <TeacherGate title="בניית שיעורי בית | עוגה בוגה" crumbs={[{ label: code ? 'עריכת שיעורי בית' : 'שיעורי בית חדשים' }]}>{() => <HomeworkBuilder code={code} />}</TeacherGate>
}

function MathFields({ task, set }) {
  const tableOp = task.op === 'x' || task.op === '÷'
  const preview = useMemo(() => mathItems(task).slice(0, 4).map(i => i.text).join('   ·   '), [task])
  const hardPreview = useMemo(() => task.levels ? mathItems(challengeTask(task)).slice(0, 3).map(i => i.text).join('   ·   ') : '', [task])
  const maxCount = task.mode === 'match' ? MATCH_MAX : 40
  return <div className="grid gap-3 sm:grid-cols-2">
    <label className="font-bold sm:col-span-2">איך פותרים<select className={field} value={task.mode || 'type'} onChange={e => set({ mode: e.target.value, ...(e.target.value === 'match' && task.count > MATCH_MAX ? { count: 6 } : {}) })}>{MATH_MODES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
    <label className="font-bold">פעולה<select className={field} value={task.op} onChange={e => set({ op: e.target.value })}>{MATH_OPS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
    {tableOp ? <label className="font-bold">לוח<select className={field} value={task.table} onChange={e => set({ table: e.target.value === 'mix' ? 'mix' : Number(e.target.value) })}>{MATH_TABLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
      : <label className="font-bold">טווח<select className={field} value={task.range} onChange={e => set({ range: Number(e.target.value) })}>{MATH_RANGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>}
    <label className="font-bold">סוג<select className={field} value={task.kind} onChange={e => set({ kind: e.target.value })}>{MATH_KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
    <label className="font-bold">כמה תרגילים<input type="number" min="3" max={maxCount} className={field} value={task.count} onChange={e => set({ count: Number(e.target.value) })} /></label>
    <p className="text-sm text-slate-600 sm:col-span-2" dir="ltr">{preview} …</p>
    <label className="flex items-start gap-2 rounded-xl bg-orange-50 p-3 sm:col-span-2"><input type="checkbox" className="mt-1.5" checked={Boolean(task.levels)} onChange={e => set({ levels: e.target.checked })} />
      <span><b>הילדים בוחרים רמה: רגילה או 🌶️ מאתגרת</b><span className="block text-sm text-slate-600">{task.levels ? <>במאתגרת: <span dir="ltr">{hardPreview} …</span> · בטבלת התוצאות יופיע 🌶️ ליד מי שבחר אותה.</> : 'טוב לכיתה עם רמות שונות — כל ילד בוחר את האתגר שלו.'}</span></span></label>
    <p className="text-xs text-slate-500 sm:col-span-2">כל הילדים מקבלים את אותם תרגילים. <button type="button" className="underline" onClick={() => set({ seed: Math.floor(Math.random() * 1e9) + 1 })}>🎲 תרגילים אחרים</button></p>
  </div>
}

function ReadingFields({ task, set }) {
  const passage = readingPassage(task.slug)
  return <div>
    <label className="font-bold">קטע קריאה<select className={field} value={task.slug} onChange={e => set({ slug: e.target.value })}>
      {['ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳'].map(grade => <optgroup key={grade} label={`כיתה ${grade}`}>{READING_OPTIONS.filter(r => r.grade === grade).map(r => <option key={r.slug} value={r.slug}>{r.emoji} {r.title}</option>)}</optgroup>)}
    </select></label>
    {passage && <p className="mt-2 text-sm text-slate-600">{passage.text[0].slice(0, 140)}… · {passage.q.length} שאלות · עם הקראה בקול של נועה</p>}
  </div>
}

function DictationFields({ task, set }) {
  const [text, setText] = useState(task.words.join('\n'))
  const pickList = id => { const list = DICTATION_LISTS.find(d => d.id === id); set({ listId: id, words: list ? [...list.words] : task.words }); if (list) setText(list.words.join('\n')) }
  return <div className="grid gap-3">
    <label className="font-bold">רשימה<select className={field} value={task.listId} onChange={e => pickList(e.target.value)}>
      {DICTATION_LISTS.map(d => <option key={d.id} value={d.id}>{d.title} ({d.grade})</option>)}<option value="custom">📝 רשימה משלי</option>
    </select></label>
    <label className="font-bold">המילים (מילה בכל שורה, עד 30)<textarea rows={4} className={field} value={text} onChange={e => { setText(e.target.value); set({ listId: 'custom', words: parseWords(e.target.value) }) }} /></label>
    {task.listId === 'custom' && <p className="text-xs text-slate-500">מילים מהרשימות המוכנות מוקראות בקול של נועה; מילים משלכם מוקראות בקול של המכשיר. כדאי להוסיף ניקוד למילים שקל לטעות בהגייה שלהן.</p>}
  </div>
}

function QuestionsFields({ task, set }) {
  const items = task.items
  const update = (i, patch) => set({ items: items.map((item, j) => j === i ? { ...item, ...patch } : item) })
  return <div className="grid gap-4">
    <label className="font-bold">כותרת (לא חובה)<input className={field} value={task.title} onChange={e => set({ title: e.target.value })} placeholder="למשל: חזרה על פרק המים" /></label>
    {items.map((item, i) => <fieldset key={i} className="rounded-2xl border-2 border-slate-100 p-3">
      <legend className="px-1 font-bold">שאלה {i + 1}</legend>
      <input className={field} value={item.q} onChange={e => update(i, { q: e.target.value })} placeholder="נוסח השאלה" />
      <div className="mt-2 grid gap-2">{item.options.map((option, k) => <div key={k} className="flex items-center gap-2">
        <input type="radio" name={`correct-${task.seed || ''}-${i}`} checked={item.correct === k} onChange={() => update(i, { correct: k })} aria-label={`תשובה ${k + 1} נכונה`} />
        <input className={field} value={option} onChange={e => update(i, { options: item.options.map((o, m) => m === k ? e.target.value : o) })} placeholder={`תשובה ${k + 1}${item.correct === k ? ' (הנכונה)' : ''}`} />
      </div>)}</div>
      <div className="mt-2 flex flex-wrap gap-3 text-sm">
        {item.options.length < 4 && <button type="button" className="font-bold text-violet-700" onClick={() => update(i, { options: [...item.options, ''] })}>+ עוד תשובה</button>}
        {items.length > 1 && <button type="button" className="font-bold text-red-700" onClick={() => set({ items: items.filter((_, j) => j !== i) })}>מחיקת השאלה</button>}
      </div>
    </fieldset>)}
    {items.length < 30 && <button type="button" className={ghost} onClick={() => set({ items: [...items, { q: '', options: ['', ''], correct: 0 }] })}>+ שאלה נוספת</button>}
  </div>
}

const FIELDS = { math: MathFields, reading: ReadingFields, dictation: DictationFields, questions: QuestionsFields }

function HomeworkBuilder({ code }) {
  const nav = useNavigate()
  const roster = loadClassRoster()
  const [loaded, setLoaded] = useState(!code)
  const [title, setTitle] = useState(''), [className, setClassName] = useState(roster.className || ''), [dueDate, setDueDate] = useState('')
  const [names, setNames] = useState(roster.names.join('\n')), [tasks, setTasks] = useState([])
  const [busy, setBusy] = useState(false), [problems, setProblems] = useState([])
  useEffect(() => {
    if (!code) return
    homeworkTeacher.get(code).then(hw => {
      if (!hw) { setProblems(['שיעורי הבית לא נמצאו בחשבון שלך.']); return }
      setTitle(hw.title); setClassName(hw.class_name || ''); setDueDate(hw.due_date || ''); setNames(hw.names.join('\n')); setTasks(hw.tasks); setLoaded(true)
    }).catch(() => setProblems(['לא הצלחנו לטעון את שיעורי הבית.']))
  }, [code])
  const setTask = (i, patch) => setTasks(tasks.map((t, j) => j === i ? { ...t, ...patch } : t))
  const move = (i, d) => { const next = [...tasks]; [next[i], next[i + d]] = [next[i + d], next[i]]; setTasks(next) }
  const save = async () => {
    const found = [...(title.trim() ? [] : ['תנו שם לשיעורי הבית']), ...(tasks.length ? [] : ['הוסיפו לפחות משימה אחת']), ...tasks.flatMap(taskProblems)]
    setProblems(found)
    if (found.length) return
    setBusy(true)
    try {
      const saved = await homeworkTeacher.save({ code, title: title.trim(), className, dueDate, tasks: tasks.map(cleanTask), names: parseNames(names) })
      nav(`/teachers/homework/${saved}`)
    } catch (e) { setProblems([homeworkError(e)]) } finally { setBusy(false) }
  }
  if (!loaded) return problems.length ? <p className="rounded-xl bg-amber-50 p-4">{problems[0]}</p> : <p role="status">טוענים…</p>
  return <div className="grid gap-5">
    <h1 className="text-3xl font-black">{code ? '✏️ עריכת שיעורי בית' : '📝 שיעורי בית חדשים'}</h1>
    <section className="grid gap-3 rounded-3xl bg-white p-5 shadow-sm sm:grid-cols-3">
      <label className="font-bold sm:col-span-3">שם<input className={field} value={title} onChange={e => setTitle(e.target.value)} placeholder="למשל: שיעורי בית לשבוע — חשבון וקריאה" maxLength={120} /></label>
      <label className="font-bold">כיתה<input className={field} value={className} onChange={e => setClassName(e.target.value)} placeholder="ב׳2" maxLength={60} /></label>
      <label className="font-bold">להגיש עד (לא חובה)<input type="date" className={field} value={dueDate} onChange={e => setDueDate(e.target.value)} /></label>
      <label className="font-bold sm:col-span-3">שמות התלמידים (שם בכל שורה)
        <textarea rows={4} className={field} value={names} onChange={e => setNames(e.target.value)} placeholder={'דנה\nיואב\nנועה'} />
        <span className="text-xs font-normal text-slate-500">הילדים בוחרים את השם שלהם מהרשימה. אם תשאירו ריק — כל ילד כותב את שמו. {roster.names.length ? 'הרשימה מולאה מרשימת הכיתה שלכם.' : <Link to="/classroom/roster" className="underline">אפשר לשמור רשימת כיתה קבועה</Link>}</span>
      </label>
    </section>

    {!code && !tasks.length && <section className="rounded-3xl bg-amber-50 p-5">
      <h2 className="text-xl font-black">⚡ התחלה מהירה: שיעורי בית מוכנים לפי כיתה</h2>
      <p className="mb-3 text-sm text-slate-600">חשבון, משחק, קטע קריאה והכתבה שמתאימים לכיתה. אחרי הבחירה אפשר לשנות כל דבר.</p>
      <div className="flex flex-wrap gap-2">{TEMPLATE_GRADES.map(grade => <button key={grade} type="button" className={ghost} onClick={() => {
        const t = gradeTemplate(grade)
        setTasks(t.tasks); if (!title.trim()) setTitle(t.title); if (!className.trim()) setClassName(grade)
      }}>כיתה {grade}</button>)}</div>
    </section>}

    <section className="grid gap-3">
      <h2 className="text-2xl font-black">משימות ({tasks.length})</h2>
      {tasks.map((task, i) => {
        const Fields = FIELDS[task.type]
        return <article key={i} className="rounded-3xl border-2 border-violet-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xl font-black">{i + 1}. {TASK_TYPES[task.type].emoji} {TASK_TYPES[task.type].label} <span className="text-base font-normal text-slate-500">· {taskTitle(task)}</span></h3>
            <div className="flex gap-1">
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="h-9 w-9 rounded-lg border-2 disabled:opacity-30" aria-label="להזיז למעלה">▲</button>
              <button type="button" disabled={i === tasks.length - 1} onClick={() => move(i, 1)} className="h-9 w-9 rounded-lg border-2 disabled:opacity-30" aria-label="להזיז למטה">▼</button>
              <button type="button" onClick={() => setTasks(tasks.filter((_, j) => j !== i))} className="h-9 rounded-lg border-2 px-2 text-sm font-bold text-red-700">מחיקה</button>
            </div>
          </div>
          <Fields task={task} set={patch => setTask(i, patch)} />
        </article>
      })}
      {tasks.length < 12 && <div className="grid gap-2 rounded-3xl border-2 border-dashed border-violet-200 p-4 sm:grid-cols-4">
        {Object.entries(TASK_TYPES).map(([type, info]) => <button key={type} type="button" onClick={() => setTasks([...tasks, newTask(type)])} className="rounded-2xl bg-violet-50 p-3 text-right hover:bg-violet-100">
          <span className="text-2xl">{info.emoji}</span><b className="block">+ {info.label}</b><span className="text-xs text-slate-600">{info.hint}</span>
        </button>)}
      </div>}
    </section>

    {problems.length > 0 && <ul className="rounded-2xl bg-amber-50 p-4 font-bold" role="alert">{problems.map(p => <li key={p}>• {p}</li>)}</ul>}
    <div className="flex flex-wrap gap-2"><button onClick={save} disabled={busy} className={primary}>{busy ? 'שומרים…' : code ? 'שמירת השינויים' : 'שמירה וקבלת קישור לכיתה'}</button><Link to="/teachers" className={ghost}>ביטול</Link></div>
  </div>
}

// ── Results ──────────────────────────────────────────────────
export function HomeworkResultsPage() {
  const { code } = useParams()
  return <TeacherGate title="תוצאות שיעורי בית | עוגה בוגה" crumbs={[{ label: 'תוצאות' }]}>{() => <HomeworkResults code={code} />}</TeacherGate>
}

function useQr(text) {
  const [svg, setSvg] = useState('')
  useEffect(() => { import('qrcode').then(({ default: Q }) => Q.toString(text, { type: 'svg', margin: 1 })).then(setSvg).catch(() => {}) }, [text])
  return svg
}

const TONES = { good: 'bg-emerald-100 text-emerald-800', ok: 'bg-amber-100 text-amber-800', low: 'bg-red-100 text-red-700' }

function HomeworkResults({ code }) {
  const [hw, setHw] = useState(null), [rows, setRows] = useState([]), [error, setError] = useState(''), [copied, setCopied] = useState(false)
  const link = homeworkLink(code), qr = useQr(link)
  const load = () => homeworkTeacher.get(code).then(data => {
    if (!data) { setError('שיעורי הבית לא נמצאו בחשבון שלך.'); return }
    setHw(data)
    return homeworkTeacher.results(data.id).then(setRows)
  }).catch(() => setError('לא הצלחנו לטעון את התוצאות.'))
  // eslint-disable-next-line react-hooks/exhaustive-deps -- load reads only `code`
  useEffect(() => { load(); const id = setInterval(load, 20000); return () => clearInterval(id) }, [code])
  if (error) return <p className="rounded-xl bg-amber-50 p-4 font-bold">{error}</p>
  if (!hw) return <p role="status">טוענים…</p>

  const byStudent = new Map()
  for (const name of hw.names) byStudent.set(name.toLowerCase(), { name, tasks: {} })
  for (const r of rows) {
    const key = r.student_name.toLowerCase()
    if (!byStudent.has(key)) byStudent.set(key, { name: r.student_name, tasks: {} })
    byStudent.get(key).tasks[r.task_index] = r
  }
  const students = [...byStudent.values()]
  const started = students.filter(s => Object.keys(s.tasks).length)
  const notStarted = students.filter(s => !Object.keys(s.tasks).length)
  // Items most of the class missed, per task: worth going over in class.
  const hard = hw.tasks.map((task, t) => {
    const misses = {}
    let tried = 0
    // A challenge exercise is a different exercise, so misses are kept per level ("hard:3").
    for (const r of rows.filter(x => x.task_index === t)) { tried++; for (const d of r.details || []) if (!d.ok) { const k = `${d.lv === 'hard' ? 'hard' : ''}:${d.i}`; misses[k] = (misses[k] || 0) + 1 } }
    const mathText = {}
    const label = key => {
      const [lv, raw] = key.split(':'), i = Number(raw)
      if (task.type === 'math') return `${(mathText[lv] ||= mathItems(levelTask(task, lv)))[i]?.text || ''}${lv ? ' 🌶️' : ''}`
      return task.type === 'reading' ? readingPassage(task.slug)?.q[i]?.[0] : task.type === 'dictation' ? task.words[i] : task.items[i]?.q
    }
    return { t, tried, top: Object.entries(misses).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([key, n]) => ({ text: label(key), n })) }
  }).filter(x => x.top.length)
  const shareText = `📚 ${hw.title}${hw.due_date ? ` (להגיש עד ${formatDate(hw.due_date)})` : ''}\nנכנסים, בוחרים את השם ופותרים 👇\n${link}`
  const copy = () => navigator.clipboard?.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) }).catch(() => {})
  const toggle = async () => { await homeworkTeacher.setStatus(code, hw.status === 'open' ? 'closed' : 'open').catch(() => {}); load() }

  return <div className="grid gap-6">
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="text-3xl font-black">{hw.title}</h1><p className="text-slate-600">{[hw.class_name, `${hw.tasks.length} משימות`, hw.due_date && `עד ${formatDate(hw.due_date)}`].filter(Boolean).join(' · ')}</p></div>
      <div className="flex flex-wrap gap-2"><Link to={`/teachers/homework/${code}/edit`} className={ghost}>עריכה</Link><button onClick={toggle} className={ghost}>{hw.status === 'open' ? '🔒 לסגור הגשה' : '🔓 לפתוח מחדש'}</button><Link to="/teachers" className={ghost}>כל שיעורי הבית</Link></div>
    </header>

    <section className="grid items-center gap-4 rounded-3xl bg-violet-50 p-5 sm:grid-cols-[160px_1fr]">
      {qr ? <div className="mx-auto w-40 rounded-2xl bg-white p-2" dangerouslySetInnerHTML={{ __html: qr }} /> : <div />}
      <div>
        <h2 className="text-xl font-black">שולחים לכיתה</h2>
        <p className="mb-2 text-slate-600">קוד: <b dir="ltr" className="text-2xl tracking-widest">{code}</b> · סורקים, או נכנסים לקישור:</p>
        <p dir="ltr" className="mb-3 break-all font-bold text-violet-800">{link}</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={copy} className={ghost}>{copied ? '✓ הועתק' : '📋 העתקת הקישור'}</button>
          <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className={`${btn} bg-[#25D366] text-white`}>💬 שליחה בוואטסאפ להורים</a>
          <a href={link} target="_blank" rel="noopener noreferrer" className={ghost}>👀 לראות כמו תלמיד</a>
        </div>
      </div>
    </section>

    <section>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2"><h2 className="text-2xl font-black">מי עשה מה</h2><span className="text-sm text-slate-500">{started.length} התחילו · {notStarted.length} עוד לא · מתעדכן לבד כל 20 שניות</span></div>
      {students.length ? <div className="overflow-x-auto rounded-3xl bg-white shadow-sm"><table className="w-full text-right text-sm">
        <thead><tr className="border-b-2"><th className="p-3">תלמיד/ה</th>{hw.tasks.map((task, i) => <th key={i} className="p-3" title={taskTitle(task)}>{TASK_TYPES[task.type].emoji} {i + 1}</th>)}<th className="p-3">סה״כ</th></tr></thead>
        <tbody>{students.map(s => {
          const list = Object.values(s.tasks), score = list.reduce((a, r) => a + r.score, 0), total = list.reduce((a, r) => a + r.total, 0)
          return <tr key={s.name} className="border-b">
            <td className="p-3 font-bold">{s.name}</td>
            {hw.tasks.map((_, i) => { const r = s.tasks[i]; return <td key={i} className="p-3">{r
              ? <span title={`${Math.round(r.seconds / 60)} דק׳ · ${r.attempts} ניסיונות${r.details?.[0]?.lv === 'hard' ? ' · רמה מאתגרת' : ''}`} className={`rounded-lg px-2 py-0.5 font-bold ${TONES[scoreTone(r.score, r.total)]}`}>{r.score}/{r.total}{r.details?.[0]?.lv === 'hard' && ' 🌶️'}</span>
              : <span className="text-slate-300">—</span>}</td> })}
            <td className="p-3 font-bold">{list.length ? `${list.length}/${hw.tasks.length} · ${total ? Math.round((score / total) * 100) : 0}%` : <span className="font-normal text-slate-400">לא התחיל</span>}</td>
          </tr>
        })}</tbody>
      </table></div> : <p className="rounded-2xl bg-slate-50 p-4">עוד אף אחד לא התחיל. שלחו את הקישור לכיתה.</p>}
      <p className="mt-2 text-xs text-slate-500">הציון סופר תשובות נכונות בניסיון הראשון. ילד שפותר שוב — נשמר הניסיון האחרון.</p>
    </section>

    {hard.length > 0 && <section>
      <h2 className="mb-3 text-2xl font-black">🎯 מה כדאי לחזור עליו בכיתה</h2>
      <div className="grid gap-3 sm:grid-cols-2">{hard.map(h => <div key={h.t} className="rounded-3xl bg-white p-4 shadow-sm">
        <h3 className="mb-2 font-black">{TASK_TYPES[hw.tasks[h.t].type].emoji} {taskTitle(hw.tasks[h.t])}</h3>
        <ul className="space-y-1">{h.top.map(x => <li key={x.text} className="flex justify-between gap-2"><span dir="auto">{x.text}</span><span className="shrink-0 font-bold text-red-700">{x.n} מתוך {h.tried} טעו</span></li>)}</ul>
      </div>)}</div>
    </section>}
  </div>
}
