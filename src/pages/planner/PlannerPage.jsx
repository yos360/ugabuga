import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { PLANNER_SUBJECTS } from '../../data/planner/schema'
import { SCHOOL_YEAR, addDays, isoOf, noSchool, weekStart } from '../../data/planner/schoolYear'
import { DAYS, GRADE_LETTERS, LINK_LABELS, MARKS, PERIODS, emptyPlan, lessonAt, levelOf, linkHref, markKey, weekPlan } from '../../data/planner/engine'
import { LEVELS, SheetPages, useLessonSheet } from './LessonSheets'

// /planner — "מערכת השעות שלי": the teacher adds classes, places them in the weekly timetable, and sees each
// week's periods with the lesson that falls on them (official curriculum order, school holidays skipped),
// a short lesson plan for each and a printable week. Saved in this browser only (localStorage).
const KEY = 'ugabuga:planner'
// Every subject's sequences file (src/data/planner/<subject>.js); schema, engine and the calendar are not.
const SEQ_FILES = Object.fromEntries(Object.entries(import.meta.glob('../../data/planner/*.js'))
  .filter(([path]) => !/\/(schema|engine|schoolYear)\.js$/.test(path)))
const load = () => { try { return { ...emptyPlan(), ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return emptyPlan() } }
const save = plan => { try { localStorage.setItem(KEY, JSON.stringify(plan)) } catch { /* storage blocked */ } }

// The cloud copy (functions/api/planner.js): a sign-in link by email, then the plan follows the teacher to
// every device. The token from the link stays in this browser.
const TOKEN_KEY = 'ugabuga:planner-token'
const readStore = k => { try { return localStorage.getItem(k) } catch { return null } }
const writeStore = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v) } catch { /* storage blocked */ } }
const api = body => fetch('/api/planner', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  .then(async r => { const d = await r.json().catch(() => ({})); if (!r.ok) throw Object.assign(new Error(d.error || 'השירות לא זמין כרגע.'), { status: r.status }); return d })

function CloudBox({ cloud, onLogout }) {
  const [email, setEmail] = useState(''), [state, setState] = useState('idle'), [msg, setMsg] = useState('')
  if (cloud.email) return <p className="mx-auto mt-4 max-w-2xl rounded-2xl bg-emerald-50 p-3 text-center">☁️ מחוברים כ־<bdi dir="ltr" className="font-bold">{cloud.email}</bdi> · {cloud.saving ? 'שומרים…' : cloud.failed ? <b className="text-red-700">⚠️ השמירה בענן לא הצליחה — נשמר בדפדפן הזה, ננסה שוב בשינוי הבא</b> : 'המערכת נשמרת בענן ✓'} · <button type="button" className="underline" onClick={onLogout}>התנתקות מהמכשיר הזה</button></p>
  const send = async e => {
    e.preventDefault(); setState('sending')
    try { await api({ action: 'login', email }); setState('sent') } catch (err) { setMsg(err.message); setState('error') }
  }
  return <div id="cloud-box" className="mx-auto mt-4 max-w-2xl scroll-mt-24 rounded-2xl border-2 border-sky-200 bg-sky-50 p-3 text-center">
    {state === 'sent' ? <p className="font-bold" role="status">📬 שלחנו לכם קישור כניסה למייל. לחצו עליו בכל מכשיר — והמערכת תופיע שם.</p> : <>
      <p className="font-bold">☁️ שמירה בטוחה: הכניסו מייל, והיומן שלכם יישמר בענן — לא ילך לאיבוד ויופיע בטלפון ובמחשב של בית הספר.</p>
      <form onSubmit={send} className="mt-2 flex flex-wrap justify-center gap-2">
        <input type="email" dir="ltr" required value={email} onChange={e => setEmail(e.target.value)} placeholder="המייל שלכם" aria-label="המייל שלכם" className="min-h-[44px] min-w-[220px] rounded-xl border-2 border-sky-200 bg-white px-3" />
        <button type="submit" disabled={state === 'sending'} className="min-h-[44px] rounded-xl bg-sky-600 px-4 font-black text-white disabled:opacity-60">{state === 'sending' ? 'שולחים…' : 'שלחו לי קישור'}</button>
      </form>
      {state === 'error' && <p className="mt-1 font-bold text-red-700" role="alert">{msg}</p>}
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">בלי סיסמה. המייל משמש לכניסה ולעדכונים על מערכת השעות, ולא נמסר לאף אחד.</p>
    </>}
  </div>
}
// Always on screen while the diary has something: that it is saved, when, and where.
function SaveBadge({ plan, cloud }) {
  if (!plan.classes.length || !plan.savedAt) return null
  const time = new Date(plan.savedAt).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
  const [text, tone] = cloud.email
    ? cloud.saving ? ['☁️ שומרים…', 'bg-sky-100 border-sky-300'] : cloud.failed ? ['⚠️ נשמר רק במכשיר — הענן לא זמין כרגע', 'bg-amber-100 border-amber-400'] : [`✓ נשמר בענן · ${time}`, 'bg-emerald-100 border-emerald-400']
    : [`✓ נשמר במכשיר הזה · ${time}`, 'bg-emerald-50 border-emerald-300']
  return <div className="sticky top-2 z-20 mx-auto mt-4 flex w-fit max-w-full flex-wrap items-center justify-center gap-2 rounded-full border-2 bg-white/95 px-3 py-1 text-sm font-bold shadow-sm" role="status">
    <span className={`rounded-full border px-2 ${tone}`}>{text}</span>
    {!cloud.email && <a href="#cloud-box" className="text-sky-700 underline">לשמירה בענן</a>}
  </div>
}
const shortDate = iso => iso.split('-').slice(1).reverse().join('.')
const classLabel = c => `${PLANNER_SUBJECTS[c.subject].emoji} ${c.name || `${PLANNER_SUBJECTS[c.subject].title} ${GRADE_LETTERS[c.grade]}`}`

function useSequences() {
  const [seqs, setSeqs] = useState(null)
  useEffect(() => {
    let live = true
    Promise.all(Object.values(SEQ_FILES).map(f => f().then(m => m.SEQUENCES || []).catch(() => [])))
      .then(all => { if (live) setSeqs(Object.fromEntries(all.flat().map(s => [`${s.subject}-${s.grade}`, s]))) })
    return () => { live = false }
  }, [])
  return seqs
}

function AddClass({ seqs, onAdd }) {
  const [subject, setSubject] = useState('math'), [grade, setGrade] = useState(''), [name, setName] = useState('')
  const grades = Object.values(seqs || {}).filter(s => s.subject === subject).map(s => s.grade).sort((a, b) => a - b)
  const subjects = Object.entries(PLANNER_SUBJECTS).filter(([k]) => Object.values(seqs || {}).some(s => s.subject === k))
  const add = e => { e.preventDefault(); if (!grade) return; onAdd({ id: `c${Date.now().toString(36)}`, subject, grade: Number(grade), name: name.trim() }); setName('') }
  const field = 'min-h-[44px] rounded-xl border-2 border-[var(--border)] bg-white px-3'
  return <form onSubmit={add} className="flex flex-wrap items-end gap-2">
    <label className="font-bold">מקצוע<select value={subject} onChange={e => { setSubject(e.target.value); setGrade('') }} className={`${field} block`}>{subjects.map(([k, s]) => <option key={k} value={k}>{s.emoji} {s.title}</option>)}</select></label>
    <label className="font-bold">כיתה<select value={grade} onChange={e => setGrade(e.target.value)} className={`${field} block`} required><option value="">בחרו</option>{grades.map(g => <option key={g} value={g}>{GRADE_LETTERS[g]}</option>)}</select></label>
    <label className="font-bold">שם (רשות)<input value={name} onChange={e => setName(e.target.value)} maxLength={20} placeholder="למשל: ג׳1" className={`${field} block w-28`} /></label>
    <button type="submit" disabled={!grade} className="min-h-[44px] rounded-xl bg-violet-600 px-4 font-black text-white disabled:opacity-40">➕ הוספה</button>
  </form>
}

// Each class gets its own colour, in the class chips and in the timetable.
const COLORS = ['border-violet-400 bg-violet-100', 'border-sky-400 bg-sky-100', 'border-amber-400 bg-amber-100', 'border-emerald-400 bg-emerald-100', 'border-rose-400 bg-rose-100', 'border-lime-400 bg-lime-100']
const colorOf = (plan, id) => COLORS[Math.max(0, plan.classes.findIndex(c => c.id === id)) % COLORS.length]

// Pick a class above, then tap the empty periods it is taught in. A filled period never changes by a tap —
// only its own ✕ clears it, so nothing is erased by accident.
function Timetable({ plan, setPlan, active }) {
  const byId = Object.fromEntries(plan.classes.map(c => [c.id, c]))
  const put = key => { if (active) setPlan(p => byId[p.slots[key]] ? p : { ...p, slots: { ...p.slots, [key]: active } }) }
  const clear = key => setPlan(p => { const slots = { ...p.slots }; delete slots[key]; return { ...p, slots } })
  const [phoneDay, setPhoneDay] = useState(0)
  const cellOf = (day, p) => { const key = `${day}-${p}`, cls = byId[plan.slots[key]], d = DAYS[day]
    return cls ? <div className={`flex min-h-[44px] w-full items-center justify-between gap-1 rounded-lg border-2 px-2 text-sm font-bold ${colorOf(plan, cls.id)}`}>
      <span>{classLabel(cls)}</span>
      <button type="button" onClick={() => clear(key)} aria-label={`מחיקת ${classLabel(cls)} מיום ${d} שעה ${p}`} title="מחיקה מהמשבצת" className="min-h-[32px] rounded-full px-2 text-slate-600 hover:bg-white hover:text-red-600">✕</button>
    </div>
      : <button type="button" onClick={() => put(key)} aria-label={`יום ${d} שעה ${p}: להוסיף ${active && byId[active] ? classLabel(byId[active]) : ''}`}
        className="min-h-[44px] w-full rounded-lg border-2 border-dashed border-slate-300 bg-white text-sm text-slate-500 hover:border-violet-400 hover:text-violet-600">+</button> }
  return <>
  {/* Phone: one day at a time. */}
  <div className="sm:hidden">
    <div className="mb-2 grid grid-cols-6 gap-1" role="tablist" aria-label="יום בשבוע">{DAYS.map((d, day) => <button key={d} type="button" role="tab" aria-selected={phoneDay === day} onClick={() => setPhoneDay(day)}
      className={`min-h-[44px] rounded-lg border-2 font-black ${phoneDay === day ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-200 bg-white'}`}>{d}{Object.keys(plan.slots).some(k => k.startsWith(`${day}-`)) ? ' •' : ''}</button>)}</div>
    <ol className="space-y-1">{PERIODS.map(p => <li key={p} className="flex items-center gap-2"><b className="w-12 shrink-0 text-sm">שעה {p}</b>{cellOf(phoneDay, p)}</li>)}</ol>
  </div>
  <div className="hidden overflow-x-auto sm:block"><table className="w-full min-w-[640px] border-collapse text-center">
    <thead><tr><th className="p-1">שעה</th>{DAYS.map(d => <th key={d} className="p-1">יום {d}</th>)}</tr></thead>
    <tbody>{PERIODS.map(p => <tr key={p}><th className="p-1">{p}</th>{DAYS.map((d, day) => <td key={d} className="p-1">{cellOf(day, p)}</td>)}</tr>)}</tbody>
  </table></div>
  </>
}

// The short lesson plan for one period, built from the sequence step.
function LessonPlan({ p, compact }) {
  const { lesson, cls } = p
  if (!lesson) return <p className="text-[var(--muted-foreground)]">סיימתם את הרצף של השנה — זמן לחזרה ולסיכום 🎉</p>
  const { unit, step, k } = lesson
  return <div className={compact ? 'text-sm' : ''}>
    <p className="font-black">{unit.title} · שיעור {k} מתוך {unit.hours}</p>
    <p className="mt-1"><b>היום:</b> {step.title}</p>
    <p><b>🎯 מטרה:</b> {step.goal}</p>
    {!compact && <>
      <p><b>🚪 פתיחה (5 דק׳):</b> {k === 1 ? `מה אנחנו כבר יודעים על "${unit.title}"? שאלה פתוחה לכיתה ורשימה על הלוח.` : 'חזרה קצרה על מה שלמדנו בשיעור הקודם — שתיים־שלוש שאלות לכיתה.'}</p>
      <p><b>📣 הסבר (15 דק׳):</b> {step.activity}</p>
      <p><b>✏️ תרגול (20 דק׳):</b> {step.practice}</p>
      <p><b>🏁 סיכום (5 דק׳):</b> כל תלמיד כותב משפט אחד: מה למדתי היום. {k === unit.hours ? 'זה השיעור האחרון ביחידה — אפשר לבדוק את היעדים:' : ''}</p>
      {k === unit.hours && <ul className="list-disc pr-5">{unit.goals.map(g => <li key={g}>{g}</li>)}</ul>}
    </>}
    {!compact && <p className="mt-1 text-xs no-print"><Link to={`/request?q=${encodeURIComponent(`הערה על מערכת השעות — ${PLANNER_SUBJECTS[cls.subject].title} ${GRADE_LETTERS[cls.grade]}, "${unit.title}": `)}`} target="_blank" className="underline">משהו לא מדויק בשיעור הזה? ספרו לנו</Link></p>}
    {step.links?.length > 0 && <div className="mt-2 flex flex-wrap gap-2 no-print">{step.links.map(l => { const to = linkHref(l, cls.grade); return to && <Link key={`${l.type}-${l.slug}`} to={to} target="_blank" className="ln-chip !min-h-[36px] text-sm">{LINK_LABELS[l.type]} ↗</Link> })}</div>}
  </div>
}

// A period's printable worksheet (or unit quiz) at a level, after its lesson plan.
function PeriodSheet({ p, level, unitQuiz }) {
  const parts = useLessonSheet(p.lesson, p.cls.grade, level, unitQuiz)
  if (!p.lesson) return null
  if (!parts) return <p className="p-4 text-center" role="status">מכינים את הדף…</p>
  const lv = LEVELS.find(l => l[0] === level)[1]
  // Lessons with no quiz source on the site (literature, reading, homeroom…) still print: a task page built from
  // the lesson itself, with room to write — never an empty print.
  if (!parts.length) {
    const { step, unit } = p.lesson
    const lines = n => Array.from({ length: n }, (_, i) => <div key={i} className="mt-6 border-b border-slate-400" />)
    return <article className="buga-flow buga-a4" dir="rtl" style={{ padding: '10mm 12mm' }}>
      <h2 className="text-2xl font-black">דף משימה: {step.title}</h2>
      <p className="flex justify-between text-sm"><span>שם: ______________</span><span>תאריך: ________</span></p>
      <p className="mt-1 font-bold">{classLabel(p.cls)} · {unit.title}</p>
      <p className="mt-3"><b>🎯 מה לומדים היום:</b> {step.goal}</p>
      <h3 className="mt-4 text-lg font-black">✏️ המשימה</h3>
      <p>{step.practice}</p>
      {lines(level === 'easy' ? 6 : level === 'advanced' ? 12 : 9)}
      <h3 className="mt-6 text-lg font-black">🏁 מה למדתי היום?</h3>
      {lines(2)}
    </article>
  }
  return <SheetPages parts={parts} title={`${unitQuiz ? 'בוחן סיום יחידה' : 'דף עבודה'}: ${unitQuiz ? p.lesson.unit.title : p.lesson.step.title}`} sub={`${classLabel(p.cls)} · ${lv}`} />
}

// A teacher's note on a lesson. With "remind me" on, it shows at the class's following lessons until marked done.
// Saved while typing (after a short pause) and when the checkbox changes; an emptied note is removed.
function NoteBox({ note, onSave }) {
  const [text, setText] = useState(note?.t || ''), [saved, setSaved] = useState(false)
  const next = note ? note.next : true
  const save = (t, n) => { const clean = t.trim(); if (clean === (note?.t || '') && n === next) return; onSave(clean ? { t: clean, next: n } : null); setSaved(true) }
  useEffect(() => { const t = setTimeout(() => save(text, next), 600); return () => clearTimeout(t) }, [text]) // eslint-disable-line react-hooks/exhaustive-deps
  return <div className="rounded-xl border-2 border-yellow-200 bg-yellow-50 p-2">
    <label className="font-bold">📝 הערות לשיעור
      <textarea value={text} onChange={e => { setText(e.target.value); setSaved(false) }} rows={2} maxLength={500}
        placeholder="למשל: לא הספקנו את תרגיל 4 · להביא קוביות · נועה ואיתי היו חסרים" className="mt-1 block w-full rounded-lg border-2 border-yellow-200 bg-white p-2 font-normal" /></label>
    <div className="mt-1 flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-1"><input type="checkbox" checked={next} onChange={e => save(text || note?.t || '', e.target.checked)} disabled={!text.trim() && !note} /> 🔔 להזכיר לי בשיעור הבא של הכיתה</label>
      {saved && <span className="text-xs font-bold text-emerald-700">נשמר ✓</span>}
    </div>
  </div>
}
// Reminders waiting for this lesson, each with "done".
function Reminders({ list, onDone }) {
  if (!list.length) return null
  return <div className="mb-2 space-y-1">{list.map(([k, n]) => <div key={k} className="flex items-start justify-between gap-2 rounded-xl border-2 border-amber-300 bg-amber-50 p-2 text-sm">
    <span>🔔 <b>תזכורת מ{n.from}:</b> {n.t}</span>
    <button type="button" onClick={() => onDone(k)} className="min-h-[32px] shrink-0 rounded-lg border-2 border-amber-400 bg-white px-2 font-bold">✓ טופל</button>
  </div>)}</div>
}
// The class list, one name per line (saved when the box loses focus).
function StudentsEditor({ cls, onSave }) {
  const [text, setText] = useState((cls.students || []).join('\n'))
  const names = text.split('\n').map(s => s.trim()).filter(Boolean)
  // Saved while typing (after a short pause), so closing the page never loses the list.
  useEffect(() => {
    const clean = [...new Set(names)].slice(0, 60)
    if (clean.join('\n') === (cls.students || []).join('\n')) return
    const t = setTimeout(() => onSave(clean), 600)
    return () => clearTimeout(t)
  }, [text]) // eslint-disable-line react-hooks/exhaustive-deps
  return <label className="mt-2 block w-full rounded-xl border-2 border-violet-200 bg-white p-2 text-sm font-bold">👥 התלמידים של {classLabel(cls)} — שם בכל שורה (אפשר להדביק רשימה)
    <textarea value={text} onChange={e => setText(e.target.value)} rows={5}
      className="mt-1 block w-full rounded-lg border-2 border-slate-200 p-2 font-normal" placeholder={'נועה כהן\nאיתי לוי\n…'} />
    <span className="font-normal text-[var(--muted-foreground)]">נשמר אצלכם בלבד (ובענן שלכם אם התחברתם). לא נמסר לאף אחד.</span>
  </label>
}
// Per lesson, one tap per student cycles: — → ✅ → 🟡 → ❌ → 🏠 (absent).
const STUDENT_MARKS = [['', '—'], ['done', '✅'], ['part', '🟡'], ['no', '❌'], ['absent', '🏠']]
const STUDENT_LEGEND = '✅ עשה · 🟡 חלקית · ❌ לא עשה · 🏠 חסר'
function StudentMarks({ names, marks, onChange }) {
  if (!names?.length) return null
  const cycle = name => { const i = STUDENT_MARKS.findIndex(([s]) => s === (marks[name] || '')); onChange({ ...marks, [name]: STUDENT_MARKS[(i + 1) % STUDENT_MARKS.length][0] }) }
  const count = s => names.filter(n => marks[n] === s).length
  return <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-2">
    <div className="flex flex-wrap items-center justify-between gap-2"><b>👥 מה כל תלמיד עשה</b>
      <button type="button" className="rounded-lg border-2 border-emerald-400 bg-white px-2 text-xs font-bold" onClick={() => onChange(Object.fromEntries(names.map(n => [n, marks[n] === 'absent' ? 'absent' : 'done'])))}>✅ כולם עשו</button></div>
    <p className="text-xs">לחיצה על שם מחליפה: {STUDENT_LEGEND}</p>
    <div className="mt-1 flex flex-wrap gap-1">{names.map(n => <button key={n} type="button" onClick={() => cycle(n)} className={`min-h-[36px] rounded-full border-2 px-2 text-sm ${marks[n] ? 'border-violet-400 bg-white font-bold' : 'border-slate-200 bg-white'}`}>{STUDENT_MARKS.find(([s]) => s === (marks[n] || ''))[1]} {n}</button>)}</div>
    <p className="mt-1 text-xs">✅ {count('done')} · 🟡 {count('part')} · ❌ {count('no')} · 🏠 {count('absent')}</p>
  </div>
}
// Notes of a class written before `key` that still ask to be reminded.
const remindersFor = (notes, classId, key) => Object.entries(notes || {}).filter(([k, n]) => n.c === classId && n.next && !n.done && k < key).sort()

// Under an opened period: mark it, print its worksheet at a level, the unit quiz, or a page for a substitute.
function LessonTools({ p, iso, plan, setPlan }) {
  const [level, setLevel] = useState('regular')
  const [print, setPrint] = useState(null) // 'sheet' | 'quiz' | 'sub'
  const key = markKey(iso, p.period), mark = plan.marks?.[key]?.s
  const setMark = s => setPlan(pl => { const marks = { ...(pl.marks || {}) }; if (marks[key]?.s === s) delete marks[key]; else marks[key] = { c: p.cls.id, s }; return { ...pl, marks } })
  const last = p.lesson && p.lesson.k === p.lesson.unit.hours && !p.lesson.dated
  return <div className="mt-2 space-y-2 border-t pt-2 text-sm no-print">
    <div className="flex flex-wrap gap-1">{MARKS.map(([s, label]) => <button key={s} type="button" aria-pressed={mark === s} onClick={() => setMark(s)} className={`rounded-full border-2 px-2 py-1 ${mark === s ? 'border-violet-500 bg-violet-100 font-bold' : 'border-slate-200'}`}>{label}</button>)}</div>
    {(mark === 'missed' || mark === 'repeat') && <p className="text-xs">השיעור הבא של הכיתה יחזור על השיעור הזה.</p>}
    {p.cls.students?.length ? <StudentMarks names={p.cls.students} marks={plan.att?.[key]?.s || {}} onChange={s => setPlan(pl => ({ ...pl, att: { ...(pl.att || {}), [key]: { c: p.cls.id, s } } }))} />
      : <p className="text-xs">💡 רוצים לסמן מה כל תלמיד עשה? הוסיפו רשימת תלמידים ב״הכיתות שלי״ (👥).</p>}
    <NoteBox key={key} note={plan.notes?.[key]} onSave={n => setPlan(pl => { const notes = { ...(pl.notes || {}) }; if (n) notes[key] = { ...n, c: p.cls.id, from: `יום ${DAYS[new Date(`${iso}T12:00:00`).getDay()]} ${shortDate(iso)}, שעה ${p.period}` }; else delete notes[key]; return { ...pl, notes } })} />
    <div className="flex flex-wrap items-center gap-1"><span className="font-bold">רמת הדף:</span>{LEVELS.map(([l, label]) => <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)} className={`rounded-full border-2 px-2 py-1 ${level === l ? 'border-emerald-500 bg-emerald-50 font-bold' : 'border-slate-200'}`}>{label}</button>)}</div>
    <div className="flex flex-wrap gap-2">
      <button type="button" className="rounded-xl bg-violet-600 px-3 py-1.5 font-bold text-white" onClick={() => setPrint('sheet')}>🖨️ דף עבודה לשיעור</button>
      {last && <button type="button" className="rounded-xl bg-amber-500 px-3 py-1.5 font-bold text-white" onClick={() => setPrint('quiz')}>📝 בוחן סיום יחידה</button>}
      <button type="button" className="rounded-xl border-2 border-slate-300 px-3 py-1.5 font-bold" onClick={() => setPrint('sub')}>📋 לממלא מקום</button>
    </div>
    {print && <PrintPreview title={print === 'sub' ? `לממלא מקום — ${classLabel(p.cls)}` : `${classLabel(p.cls)} — ${print === 'quiz' ? 'בוחן' : 'דף עבודה'}`} onClose={() => setPrint(null)}>
      {print === 'sub' && <article className="buga-flow buga-a4" dir="rtl" style={{ padding: '12mm' }}>
        <h2 className="text-2xl font-black">📋 לממלא/ת מקום · {classLabel(p.cls)} · שעה {p.period}</h2>
        <p className="mt-1">תודה שאתם מחליפים אותי היום! הכול מוכן — אין צורך להכין דבר.</p>
        <div className="mt-3 rounded-2xl border-2 border-slate-300 p-3"><LessonPlan p={p} /></div>
        <p className="mt-3"><b>דף העבודה מצורף בעמוד הבא.</b> אחרי השיעור: אספו את הדפים והשאירו לי פתק — מה הספקתם ומי היה חסר.</p>
        <p className="mt-6">פתק למורה: ___________________________________________</p>
      </article>}
      <PeriodSheet p={p} level={level} unitQuiz={print === 'quiz'} />
    </PrintPreview>}
  </div>
}

// The quick way, no timetable: subject, grade, how many hours a week, and the topic and lesson the class is on
// now → the next lesson, which moves on by itself as school days pass, a worksheet for it, or worksheets for
// the week. `idx` is the lesson's place in the year's sequence (fractional: 2 h/week moves 0.4 a school day).
const QUICK_KEY = 'ugabuga:planner-quick'
const unitStart = (seq, u) => seq.units.slice(0, u).reduce((n, x) => n + x.hours, 0)
const yearLessons = seq => unitStart(seq, seq.units.length)
const isSchoolDay = (iso, grade) => !noSchool(iso, { level: levelOf(grade), extra: [] })
const nextSchoolDay = (iso, grade) => { let d = iso; for (let i = 0; i < 30 && !isSchoolDay(d, grade); i++) d = addDays(d, 1); return d }
const WEEKDAY = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'שבת']
function QuickLesson({ seqs }) {
  const today = isoOf(new Date())
  const [q, setQ] = useState(null)
  const [level, setLevel] = useState('regular'), [print, setPrint] = useState(0)
  useEffect(() => {
    let saved = null
    try { saved = JSON.parse(localStorage.getItem(QUICK_KEY) || 'null') } catch { /* storage blocked */ }
    const seq = saved?.subject && seqs[`${saved.subject}-${saved.grade}`]
    if (seq) {
      const hpw = saved.hpw || 5, perDay = hpw / (levelOf(saved.grade) === 'elementary' ? 6 : 5)
      // Older saves kept { unit, pos }.
      let idx = saved.idx ?? unitStart(seq, saved.unit || 0) + (saved.pos || 0)
      // Moves on for every school day that passed since the last visit.
      for (let d = saved.date || today; d < today; d = addDays(d, 1)) if (isSchoolDay(d, saved.grade)) idx += perDay
      setQ({ subject: saved.subject, grade: saved.grade, hpw, idx: Math.min(idx, yearLessons(seq)), date: today, notes: saved.notes || {} })
    } else {
      const first = Object.values(seqs).find(s => s.subject === 'math') || Object.values(seqs)[0]
      setQ(first ? { subject: first.subject, grade: first.grade, hpw: 5, idx: 0, date: today } : null)
    }
  }, [seqs, today])
  useEffect(() => { if (q) try { localStorage.setItem(QUICK_KEY, JSON.stringify(q)) } catch { /* storage blocked */ } }, [q])
  if (!q) return null
  const seq = seqs[`${q.subject}-${q.grade}`]
  const subjects = Object.entries(PLANNER_SUBJECTS).filter(([k]) => Object.values(seqs).some(s => s.subject === k))
  const grades = Object.values(seqs).filter(s => s.subject === q.subject).map(s => s.grade).sort((a, b) => a - b)
  const cls = { id: 'quick', subject: q.subject, grade: q.grade, name: '' }
  const at = Math.floor(q.idx)
  const lessonOf = n => ({ period: n + 1, cls, lesson: lessonAt(seq, at + n) })
  const p = lessonOf(0)
  const unit = p.lesson ? p.lesson.unitNumber - 1 : seq.units.length - 1
  // Friday evening, Shabbat or a holiday: show the lesson of the next school day.
  const day = nextSchoolDay(today, q.grade)
  const dayLabel = day === today ? `היום · ${shortDate(today)}` : `השיעור הבא · יום ${WEEKDAY[new Date(`${day}T12:00:00`).getDay()]} ${shortDate(day)}`
  // A step can span a few lessons; the week's pack prints each different worksheet once.
  const weekSheets = count => {
    const out = []
    for (let n = 0; out.length < count && n < 40; n++) { const x = lessonOf(n); if (!x.lesson) break; if (!out.some(o => o.lesson.step === x.lesson.step)) out.push(x) }
    return out
  }
  const choose = patch => setQ(x => ({ ...x, idx: 0, ...patch, date: today }))
  // Notes are kept per subject and grade, so switching never loses them.
  const qc = `quick-${q.subject}-${q.grade}`, nk = `${qc}:${String(at).padStart(4, '0')}`
  const goTo = idx => setQ(x => ({ ...x, idx: Math.max(0, Math.min(idx, yearLessons(seq))), date: today }))
  const field = 'min-h-[44px] w-full rounded-xl border-2 border-[var(--border)] bg-white px-3 block'
  return <section className="mt-8 rounded-3xl border-2 border-emerald-300 bg-emerald-50 p-4 sm:p-5" aria-labelledby="quick-h">
    <h2 id="quick-h" className="text-2xl font-black">⚡ השיעור של היום — בלי למלא מערכת</h2>
    <p className="mb-3">בוחרים מקצוע, כיתה ואיפה הכיתה נמצאת עכשיו. השיעור מתקדם לבד מיום ליום. <b>הורים?</b> כך מקבלים גם דפי תרגול לבית לכל השבוע.</p>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <label className="font-bold">מקצוע<select value={q.subject} onChange={e => { const g = Object.values(seqs).filter(s => s.subject === e.target.value).map(s => s.grade).sort((a, b) => a - b)[0]; choose({ subject: e.target.value, grade: g }) }} className={field}>{subjects.map(([k, s]) => <option key={k} value={k}>{s.emoji} {s.title}</option>)}</select></label>
      <label className="font-bold">כיתה<select value={q.grade} onChange={e => choose({ grade: Number(e.target.value) })} className={field}>{grades.map(g => <option key={g} value={g}>{GRADE_LETTERS[g]}</option>)}</select></label>
      <label className="font-bold">שעות בשבוע<select value={q.hpw} onChange={e => setQ(x => ({ ...x, hpw: Number(e.target.value) }))} className={field}>{[1, 2, 3, 4, 5, 6].map(h => <option key={h} value={h}>{h}</option>)}</select></label>
      <label className="col-span-2 font-bold sm:col-span-1">שיעור ביחידה<select value={p.lesson ? p.lesson.k : ''} onChange={e => goTo(unitStart(seq, unit) + Number(e.target.value) - 1)} className={field}>{Array.from({ length: seq.units[unit].hours }, (_, i) => <option key={i} value={i + 1}>שיעור {i + 1} מתוך {seq.units[unit].hours}</option>)}</select></label>
      <label className="col-span-2 font-bold sm:col-span-4">הנושא עכשיו<select value={unit} onChange={e => goTo(unitStart(seq, Number(e.target.value)))} className={field}>{seq.units.map((u, i) => <option key={i} value={i}>{i + 1}. {u.title}</option>)}</select></label>
    </div>
    <div className="mt-4 rounded-2xl bg-white p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <b className="text-lg">📅 {dayLabel}</b>
        <div className="flex gap-2">
          <button type="button" className="ln-chip" disabled={at === 0} onClick={() => goTo(at - 1)}>→ הקודם</button>
          <button type="button" className="ln-chip" onClick={() => goTo(at + 1)}>הבא ←</button>
        </div>
      </div>
      <Reminders list={remindersFor(q.notes, qc, nk)} onDone={k => setQ(x => ({ ...x, notes: { ...x.notes, [k]: { ...x.notes[k], done: true } } }))} />
      <LessonPlan p={p} />
      {p.lesson && <div className="mt-3 space-y-2 border-t pt-3 no-print">
        <NoteBox key={nk} note={q.notes?.[nk]} onSave={n => setQ(x => { const notes = { ...(x.notes || {}) }; if (n) notes[nk] = { ...n, c: qc, from: `השיעור של ${shortDate(day)}` }; else delete notes[nk]; return { ...x, notes } })} />
        <div className="flex flex-wrap items-center gap-1"><span className="font-bold">רמת הדף:</span>{LEVELS.map(([l, label]) => <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)} className={`rounded-full border-2 px-2 py-1 ${level === l ? 'border-emerald-500 bg-emerald-50 font-bold' : 'border-slate-200'}`}>{label}</button>)}</div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="min-h-[44px] rounded-xl bg-violet-600 px-4 font-black text-white" onClick={() => setPrint(1)}>🖨️ דף עבודה לשיעור הזה</button>
          <button type="button" className="min-h-[44px] rounded-xl bg-emerald-600 px-4 font-black text-white" onClick={() => setPrint(5)}>🖨️ דפי עבודה לכל השבוע (5 דפים)</button>
        </div>
      </div>}
    </div>
    {print > 0 && <PrintPreview title={`${classLabel(cls)} — ${print === 1 ? 'דף עבודה' : 'דפי עבודה לשבוע'}`} onClose={() => setPrint(0)}>
      {weekSheets(print).map(x => <PeriodSheet key={x.period} p={x} level={level} />)}
    </PrintPreview>}
  </section>
}

// "Add to my calendar": the next 8 weeks of lessons as an .ics file (iPhone, Outlook, Google). Bell times are a
// common Israeli schedule, editable here; each event has a stable UID, so importing again updates it.
const BELLS = ['08:00', '08:50', '09:55', '10:45', '11:50', '12:40', '13:30', '14:20']
const LESSON_MINUTES = 45
const icsText = s => String(s).replace(/\\/g, '\\\\').replace(/[,;]/g, m => `\\${m}`).replace(/\n/g, '\\n')
const icsTime = (iso, hhmm, plus = 0) => { const [h, m] = hhmm.split(':').map(Number), t = h * 60 + m + plus; return `${iso.replace(/-/g, '')}T${String(Math.floor(t / 60)).padStart(2, '0')}${String(t % 60).padStart(2, '0')}00` }
function CalendarExport({ plan, setPlan, seqs, sunday }) {
  const [open, setOpen] = useState(false)
  const bells = plan.bells || BELLS
  const download = () => {
    const events = []
    for (let w = 0; w < 8; w++) for (const d of weekPlan(plan, seqs, addDays(sunday, w * 7))) for (const p of d.periods) {
      if (p.why) continue
      const name = p.cls.name || `${PLANNER_SUBJECTS[p.cls.subject].title} ${GRADE_LETTERS[p.cls.grade]}`
      const what = p.lesson ? p.lesson.step.title : 'חזרה וסיכום'
      events.push(['BEGIN:VEVENT', `UID:${d.iso}-${p.period}-${p.cls.id}@ugabuga.co.il`, `DTSTAMP:${icsTime(isoOf(new Date()), '00:00')}Z`,
        `DTSTART;TZID=Asia/Jerusalem:${icsTime(d.iso, bells[p.period - 1])}`, `DTEND;TZID=Asia/Jerusalem:${icsTime(d.iso, bells[p.period - 1], LESSON_MINUTES)}`,
        `SUMMARY:${icsText(`${name} · ${what}`)}`, `DESCRIPTION:${icsText(`${p.lesson ? `מטרה: ${p.lesson.step.goal}\n` : ''}מערך שיעור ודף עבודה: https://ugabuga.co.il/planner`)}`, 'END:VEVENT'].join('\r\n'))
    }
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ugabuga//planner//HE', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:מערכת השעות שלי', 'X-WR-TIMEZONE:Asia/Jerusalem', ...events, 'END:VCALENDAR'].join('\r\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' })); a.download = 'מערכת-השעות.ics'; a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 2000)
  }
  return <>
    <button type="button" className="ln-chip" aria-expanded={open} onClick={() => setOpen(!open)}>📅 להוסיף ליומן שלי</button>
    {open && <div className="w-full rounded-2xl border-2 border-sky-200 bg-sky-50 p-3 text-sm">
      <p>השיעורים של 8 השבועות הקרובים ייכנסו ליומן בטלפון או במחשב (אייפון, אאוטלוק, גוגל). שיניתם משהו? מורידים שוב — השיעורים מתעדכנים.</p>
      <details className="mt-1"><summary className="cursor-pointer font-bold">שעות הצלצול בבית הספר שלכם</summary>
        <div className="mt-1 grid grid-cols-4 gap-1 sm:grid-cols-8">{bells.map((t, i) => <label key={i} className="text-xs">שעה {i + 1}<input type="time" value={t} onChange={e => setPlan(p => { const b = [...(p.bells || BELLS)]; b[i] = e.target.value || BELLS[i]; return { ...p, bells: b } })} className="block w-full rounded border p-1" /></label>)}</div>
      </details>
      <button type="button" onClick={download} className="mt-2 min-h-[44px] rounded-xl bg-sky-600 px-4 font-black text-white">⬇️ הורדה ליומן</button>
      <p className="mt-1 text-xs">ביומן גוגל: calendar.google.com ← הגדרות ← ייבוא, ובוחרים את הקובץ.</p>
    </div>}
  </>
}

function Week({ plan, setPlan, seqs }) {
  const today = isoOf(new Date())
  const [sunday, setSunday] = useState(() => weekStart(today < SCHOOL_YEAR.start ? SCHOOL_YEAR.start : today))
  const [open, setOpen] = useState(null)
  const [printing, setPrinting] = useState(false)
  const [withSheets, setWithSheets] = useState(true), [weekLevel, setWeekLevel] = useState('regular')
  const week = useMemo(() => weekPlan(plan, seqs, sunday), [plan, seqs, sunday])
  const shift = (id, d) => setPlan(p => ({ ...p, shifts: { ...p.shifts, [id]: (p.shifts[id] || 0) + d } }))
  const dayOff = (iso, on) => setPlan(p => ({ ...p, extraOff: on ? [...p.extraOff, [iso, 'אין לימודים']] : p.extraOff.filter(([d]) => d !== iso) }))
  return <section aria-labelledby="week-h">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div><h2 id="week-h" className="text-2xl font-black">3. מה מלמדים השבוע · {shortDate(sunday)}–{shortDate(addDays(sunday, 5))}</h2>
        <p className="text-sm">לכל שעה כבר מחכה השיעור הבא. לחצו על שיעור — ותקבלו מערך שיעור ודף עבודה להדפסה.</p></div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="ln-chip" onClick={() => setSunday(addDays(sunday, -7))}>→ שבוע קודם</button>
        <button type="button" className="ln-chip" onClick={() => setSunday(weekStart(today))}>השבוע</button>
        <button type="button" className="ln-chip" onClick={() => setSunday(addDays(sunday, 7))}>שבוע הבא ←</button>
        <button type="button" className="min-h-[44px] rounded-full bg-violet-600 px-4 font-black text-white" onClick={() => setPrinting(true)}>🖨️ הדפסת השבוע</button>
        <CalendarExport plan={plan} setPlan={setPlan} seqs={seqs} sunday={sunday} />
      </div>
    </div>
    <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{week.map(d => <div key={d.iso} className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-3">
      <div className="flex items-center justify-between"><b>יום {d.label} · {shortDate(d.iso)}</b>
        {d.periods.length > 0 && <label className="text-xs"><input type="checkbox" checked={plan.extraOff.some(([x]) => x === d.iso)} onChange={e => dayOff(d.iso, e.target.checked)} /> אין לימודים</label>}</div>
      {!d.periods.length ? <p className="mt-2 text-sm text-[var(--muted-foreground)]">אין שיעורים במערכת</p>
        : <ul className="mt-2 space-y-2">{d.periods.map(p => { const key = `${d.iso}-${p.period}`, mk = markKey(d.iso, p.period), rem = p.why ? [] : remindersFor(plan.notes, p.cls.id, mk); return <li key={key} className="rounded-xl bg-white p-2">
          <button type="button" className="w-full text-right" onClick={() => setOpen(open === key ? null : key)} aria-expanded={open === key}>
            <b>שעה {p.period} · {classLabel(p.cls)}</b>{rem.length > 0 && <span className="ms-1 rounded-full bg-amber-200 px-2 text-xs font-bold">🔔 {rem.length}</span>}{plan.notes?.[mk] && <span className="ms-1 text-xs">📝</span>}<br />
            <span className="text-sm">{p.why ? `🌴 ${p.why}` : p.lesson ? p.lesson.step.title : 'חזרה וסיכום'}</span>
          </button>
          {open === key && !p.why && <div className="mt-2 border-t pt-2"><Reminders list={rem} onDone={k => setPlan(pl => ({ ...pl, notes: { ...pl.notes, [k]: { ...pl.notes[k], done: true } } }))} /><LessonPlan p={p} />
            <LessonTools p={p} iso={d.iso} plan={plan} setPlan={setPlan} />
            <div className="mt-2 flex gap-2 text-xs"><button type="button" className="underline" onClick={() => shift(p.cls.id, 1)}>⏭️ לדלג על השיעור</button><button type="button" className="underline" onClick={() => shift(p.cls.id, -1)}>↩️ לחזור שיעור אחד אחורה</button></div>
          </div>}
          {plan.marks?.[markKey(d.iso, p.period)] && <span className="text-xs">{MARKS.find(m => m[0] === plan.marks[markKey(d.iso, p.period)].s)?.[1]}</span>}
        </li> })}</ul>}
    </div>)}</div>
    {printing && <PrintPreview title={`השבוע שלי ${shortDate(sunday)}`} onClose={() => setPrinting(false)}>
      <div className="no-print mb-3 flex flex-wrap items-center gap-2" dir="rtl">
        <label className="font-bold"><input type="checkbox" checked={withSheets} onChange={e => setWithSheets(e.target.checked)} /> עם דפי עבודה</label>
        {withSheets && LEVELS.map(([l, label]) => <button key={l} type="button" aria-pressed={weekLevel === l} onClick={() => setWeekLevel(l)} className={`rounded-full border-2 px-3 py-1 ${weekLevel === l ? 'border-emerald-500 bg-emerald-50 font-bold' : 'border-slate-200 bg-white'}`}>{label}</button>)}
      </div>
      {week.filter(d => d.periods.some(p => !p.why)).map(d => <div key={d.iso}>
        <article className="buga-flow buga-a4" dir="rtl" style={{ padding: '10mm 12mm' }}>
          <h2 className="text-2xl font-black">יום {d.label} · {shortDate(d.iso)}</h2>
          {d.periods.filter(p => !p.why).map(p => <section key={p.period} className="mt-3 border-b border-slate-300 pb-3"><p className="text-lg font-black">שעה {p.period} · {classLabel(p.cls)}</p><LessonPlan p={p} /></section>)}
        </article>
        {withSheets && d.periods.filter(p => !p.why).map(p => <PeriodSheet key={p.period} p={p} level={weekLevel} />)}
      </div>)}
    </PrintPreview>}
  </section>
}

export default function PlannerPage() {
  const seqs = useSequences()
  const [plan, setPlanState] = useState(emptyPlan)
  const [cloud, setCloud] = useState({ token: null, email: null, saving: false })
  // Load this browser's copy, then the cloud copy. The newer edit wins, compared by the plan's own savedAt (both
  // stamped by a browser) against the plan on screen right now — so edits made while loading are never replaced.
  // Coming back to the tab (or another tab saving) loads again, so an old tab never sends an old copy.
  useEffect(() => {
    const adopt = remote => setPlanState(cur => {
      if (!remote?.classes) return cur
      const newer = !cur.classes.length || (remote.savedAt && (!cur.savedAt || remote.savedAt > cur.savedAt))
      if (!newer) return cur
      const merged = { ...emptyPlan(), ...remote }; save(merged); return merged
    })
    const fromCloud = token => api({ action: 'get', token }).then(d => { setCloud(c => ({ ...c, token, email: d.email })); adopt(d.plan) })
      .catch(err => { if (err.status === 401) { writeStore(TOKEN_KEY, null); setCloud({ token: null, email: null, saving: false }) } })
    setPlanState(load())
    // Arriving from the sign-in mail (#login=<token>): keep the token, drop it from the address bar.
    const fromLink = /^#login=([\w.-]+)$/.exec(window.location.hash)?.[1]
    if (fromLink) { writeStore(TOKEN_KEY, fromLink); window.history.replaceState(null, '', window.location.pathname) }
    const token = fromLink || readStore(TOKEN_KEY)
    if (token) fromCloud(token)
    const refresh = () => { if (document.visibilityState !== 'visible') return; adopt(load()); const t = readStore(TOKEN_KEY); if (t) fromCloud(t) }
    const onStorage = e => { if (e.key === KEY) adopt(load()) }
    document.addEventListener('visibilitychange', refresh); window.addEventListener('focus', refresh); window.addEventListener('storage', onStorage)
    return () => { document.removeEventListener('visibilitychange', refresh); window.removeEventListener('focus', refresh); window.removeEventListener('storage', onStorage) }
  }, [])
  // Cloud saves are batched: the last change within 1.5 seconds is sent; a failed save says so.
  useEffect(() => {
    if (!cloud.token || !plan.savedAt) return
    setCloud(c => ({ ...c, saving: true }))
    const timer = setTimeout(() => api({ action: 'save', token: cloud.token, plan })
      .then(() => setCloud(c => ({ ...c, saving: false, failed: false })), () => setCloud(c => ({ ...c, saving: false, failed: true }))), 1500)
    return () => clearTimeout(timer)
  }, [plan, cloud.token])
  const setPlan = f => setPlanState(p => { const next = { ...(typeof f === 'function' ? f(p) : f), savedAt: new Date().toISOString() }; save(next); return next })
  const logout = () => { writeStore(TOKEN_KEY, null); setCloud({ token: null, email: null, saving: false }) }
  const removeClass = id => window.confirm(`למחוק את ${classLabel(plan.classes.find(c => c.id === id))} עם כל השעות, ההערות וסימוני התלמידים שלה?`) && setPlan(p => ({ ...p, classes: p.classes.filter(c => c.id !== id), slots: Object.fromEntries(Object.entries(p.slots).filter(([, v]) => v !== id)),
    marks: Object.fromEntries(Object.entries(p.marks || {}).filter(([, m]) => m.c !== id)), notes: Object.fromEntries(Object.entries(p.notes || {}).filter(([, m]) => m.c !== id)), att: Object.fromEntries(Object.entries(p.att || {}).filter(([, m]) => m.c !== id)), shifts: Object.fromEntries(Object.entries(p.shifts || {}).filter(([k]) => k !== id)) }))
  const hasSlots = Object.keys(plan.slots).length > 0
  // The class being placed in the timetable: the one picked, else the newest.
  const [picked, setPicked] = useState(null), [editStudents, setEditStudents] = useState(null)
  const active = plan.classes.some(c => c.id === picked) ? picked : plan.classes.at(-1)?.id
  // "See an example": one class with a few periods, so the week below fills in at once.
  const example = () => {
    const s = seqs['math-3'] || Object.values(seqs)[0]
    if (!s) return
    const id = `c${Date.now().toString(36)}`
    setPlan(p => ({ ...p, classes: [...p.classes, { id, subject: s.subject, grade: s.grade, name: '' }], slots: { ...p.slots, '0-1': id, '1-2': id, '2-1': id, '3-3': id, '4-2': id } }))
  }
  return <div className="mx-auto max-w-6xl px-4 py-8" dir="rtl">
    <SEO title="מערכת השעות המתעדכנת (בטא) — מערך שיעור לכל שעה לפי תוכנית הלימודים" description="מורים מכניסים את מערכת השעות ומקבלים לכל שעה את השיעור הבא לפי תוכנית משרד החינוך, עם מערך שיעור קצר, קישורים לתרגול והדפסה של כל השבוע. בחינם." path="/planner" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, { label: 'מערכת השעות שלי' }]} />
    <h1 className="text-center text-4xl sm:text-5xl"><span aria-hidden="true">🗓️ </span>מערכת השעות המתעדכנת <span className="align-middle rounded-full bg-amber-300 px-3 py-1 text-base font-black">בטא</span></h1>
    <p className="mx-auto mt-2 max-w-2xl text-center text-lg">השיעור הבא לפי תוכנית הלימודים, מערך שיעור ודפי עבודה להדפסה — בחינם. החגים והחופשות של {SCHOOL_YEAR.name} כבר בפנים.</p>
    <p className="mx-auto mt-1 max-w-2xl text-center text-sm text-[var(--muted-foreground)]">🧪 גרסת בטא שמשתפרת כל הזמן. משהו חסר או לא מדויק? <Link to="/request" className="font-bold underline">ספרו לנו</Link></p>
    {seqs && <QuickLesson seqs={seqs} />}
    <h2 className="mt-10 text-center text-3xl font-black">🗓️ או: כל המערכת שלכם</h2>
    <p className="mx-auto mt-1 max-w-2xl text-center">מלמדים כמה כיתות? מכניסים את המערכת פעם אחת, ולכל שעה בשבוע מחכה השיעור הבא — לפי תוכנית הלימודים, עם החגים והחופשות.</p>
    <SaveBadge plan={plan} cloud={cloud} />
    {!plan.classes.length && <ol className="mx-auto mt-6 grid max-w-4xl gap-2 sm:grid-cols-3" aria-label="איך זה עובד">
      {[['1', 'מוסיפים כיתה', 'מקצוע ושכבה — למשל מתמטיקה ג׳'], ['2', 'מסמנים מתי היא לומדת', 'לוחצים על השעות שלה במערכת'], ['3', 'מקבלים את השיעורים', 'לכל שעה: מה מלמדים, מערך שיעור ודף עבודה']].map(([n, t, s]) =>
        <li key={n} className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-3 text-center"><span className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 font-black text-white">{n}</span><b className="block">{t}</b><span className="text-sm">{s}</span></li>)}
    </ol>}
    {!seqs ? <p className="mt-8 text-center" role="status">טוענים…</p> : <>
      <section className="mt-8 rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-5" aria-labelledby="classes-h">
        <h2 id="classes-h" className="text-2xl font-black">1. הכיתות שלי</h2>
        <p className="mb-2 text-sm">מוסיפים כל כיתה שאתם מלמדים. מלמדים את אותה שכבה בשתי כיתות? הוסיפו פעמיים ותנו שם (ג׳1, ג׳2).</p>
        <AddClass seqs={seqs} onAdd={c => { setPlan(p => ({ ...p, classes: [...p.classes, c] })); setPicked(c.id) }} />
        {!plan.classes.length && <p className="mt-3 text-sm">רק רוצים לראות איך זה נראה? <button type="button" onClick={example} className="font-bold text-violet-700 underline">👀 מלאו לי דוגמה</button></p>}
        {plan.classes.length > 0 && <ul className="mt-3 flex flex-wrap gap-2">{plan.classes.map(c => { const s = seqs[`${c.subject}-${c.grade}`]; return <li key={c.id} className={`flex items-center gap-2 rounded-full border-2 px-3 py-1 ${colorOf(plan, c.id)}`}>
          <b>{classLabel(c)}</b><span className="text-xs">{s?.official ? '· לפי הסדר הרשמי' : '· סדר מומלץ'}</span>
          <button type="button" onClick={() => setEditStudents(editStudents === c.id ? null : c.id)} aria-expanded={editStudents === c.id} className="rounded-full bg-white px-2 text-xs font-bold">👥 {c.students?.length ? `${c.students.length} תלמידים` : 'רשימת תלמידים'}</button>
          <button type="button" onClick={() => removeClass(c.id)} aria-label={`הסרת ${classLabel(c)}`}>✕</button></li> })}</ul>}
        {plan.classes.some(c => c.id === editStudents) && <StudentsEditor key={editStudents} cls={plan.classes.find(c => c.id === editStudents)} onSave={students => setPlan(p => ({ ...p, classes: p.classes.map(c => c.id === editStudents ? { ...c, students } : c) }))} />}
      </section>
      {plan.classes.length > 0 && <section className="mt-6 rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-5" aria-labelledby="tt-h">
        <h2 id="tt-h" className="text-2xl font-black">2. מתי כל כיתה לומדת?</h2>
        <div className="my-2 flex flex-wrap items-center gap-2"><span className="font-bold">בחרו כיתה:</span>
          {plan.classes.map(c => <button key={c.id} type="button" aria-pressed={active === c.id} onClick={() => setPicked(c.id)}
            className={`min-h-[40px] rounded-full border-2 px-3 font-bold ${colorOf(plan, c.id)} ${active === c.id ? 'ring-2 ring-violet-700 ring-offset-1' : 'opacity-70'}`}>{active === c.id ? '✓ ' : ''}{classLabel(c)}</button>)}
        </div>
        <p className="mb-2 text-sm">ועכשיו לחצו במערכת על כל השעות שבהן <b>{plan.classes.find(c => c.id === active) && classLabel(plan.classes.find(c => c.id === active))}</b> לומדת. טעיתם? ה־✕ במשבצת מוחק.</p>
        <Timetable plan={plan} setPlan={setPlan} active={active} />
        {hasSlots && <p className="mt-3 text-center"><a href="#week-h" className="inline-flex min-h-[44px] items-center rounded-full bg-violet-600 px-5 font-black text-white" style={{ color: '#fff' }}>⬇️ לשיעורים של השבוע</a></p>}
      </section>}
      {(plan.classes.length > 0 || cloud.email) && <CloudBox cloud={cloud} onLogout={logout} />}
      {plan.classes.length > 0 && !hasSlots && <p className="mt-6 rounded-2xl bg-amber-50 p-3 text-center font-bold">👆 סמנו לפחות שעה אחת במערכת — והשיעורים של השבוע יופיעו כאן.</p>}
      {hasSlots && <div className="mt-6"><Week plan={plan} setPlan={setPlan} seqs={seqs} /></div>}
      {plan.classes.length > 0 && <details className="mt-6 text-sm"><summary className="cursor-pointer font-bold">מאיפה הסדר?</summary>
        <ul className="mt-2 list-disc pr-5">{plan.classes.map(c => { const s = seqs[`${c.subject}-${c.grade}`]; return s && <li key={c.id}>{classLabel(c)}: {s.official ? 'לפי ' : 'סדר מומלץ על בסיס '}<a href={s.source.url} target="_blank" rel="noopener noreferrer" className="underline">{s.source.title}</a>{s.note ? ` — ${s.note}` : ''}</li> })}</ul>
      </details>}
    </>}
  </div>
}
