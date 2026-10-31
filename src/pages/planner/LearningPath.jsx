import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { PLANNER_SUBJECTS } from '../../data/planner/schema'
import { GRADE_LETTERS, LINK_LABELS, lessonAt, linkHref } from '../../data/planner/engine'
import { LEVELS } from './LessonSheets'
import { LessonPlan, PeriodSheet, useSequences } from './PlannerPage'

// /path — "מסלול לימוד אישי": the same year sequences as the teachers' planner, one lesson at a time for a
// child learning alone, at home with a parent, or with a tutor. Self-paced: "finished" moves to the next
// lesson. Each subject and grade keeps its own place (this browser only). Opened from every subject page
// with ?subject=…&grade=….
const KEY = 'ugabuga:path'
const MODES = [['self', '🧒 לומד/ת לבד'], ['home', '🏠 לימוד ביתי עם הורה'], ['tutor', '👩‍🏫 עם מורה פרטי/ת']]
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} } }
const write = s => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* storage blocked */ } }
const yearLessons = seq => seq.units.reduce((n, u) => n + u.hours, 0)
const unitStart = (seq, u) => seq.units.slice(0, u).reduce((n, x) => n + x.hours, 0)
const todayIso = () => new Date().toISOString().slice(0, 10)

export default function LearningPath() {
  const seqs = useSequences()
  const [params, setParams] = useSearchParams()
  const [state, setState] = useState(null)
  const [level, setLevel] = useState('regular'), [print, setPrint] = useState(false)
  useEffect(() => { setState(read()) }, [])
  useEffect(() => { if (state) write(state) }, [state])
  if (!seqs || !state) return <div className="mx-auto max-w-3xl px-4 py-8" dir="rtl"><p className="text-center" role="status">טוענים…</p></div>

  const subjects = Object.entries(PLANNER_SUBJECTS).filter(([k]) => Object.values(seqs).some(s => s.subject === k))
  const gradesOf = s => Object.values(seqs).filter(x => x.subject === s).map(x => x.grade).sort((a, b) => a - b)
  const subject = PLANNER_SUBJECTS[params.get('subject')] && gradesOf(params.get('subject')).length ? params.get('subject') : state.subject || 'math'
  const grades = gradesOf(subject)
  const grade = grades.includes(Number(params.get('grade'))) ? Number(params.get('grade')) : grades.includes(state.grade) ? state.grade : grades[0]
  const mode = state.mode || 'self'
  const seq = seqs[`${subject}-${grade}`]
  const id = `${subject}-${grade}`
  const mine = state.paths?.[id] || { idx: 0, done: [] }
  const at = Math.min(mine.idx, yearLessons(seq))
  const lesson = lessonAt(seq, at)
  const p = { period: 1, cls: { id: 'path', subject, grade, name: '' }, lesson }
  const unit = lesson ? lesson.unitNumber - 1 : seq.units.length - 1
  const total = yearLessons(seq)
  const doneToday = mine.done?.at(-1) === todayIso()
  const setMine = patch => setState(s => ({ ...s, subject, grade, paths: { ...(s.paths || {}), [id]: { ...mine, ...patch } } }))
  const choose = (s, g) => { setParams({ subject: s, grade: String(g) }, { replace: true }); setState(x => ({ ...x, subject: s, grade: g })) }
  const finish = () => setMine({ idx: at + 1, done: [...(mine.done || []).filter(d => d !== todayIso()), todayIso()].slice(-400) })
  const days = (mine.done || []).length
  const field = 'min-h-[44px] w-full rounded-xl border-2 border-[var(--border)] bg-white px-3 block'
  const practice = (lesson?.step.links || []).map(l => ({ l, to: linkHref(l, grade) })).filter(x => x.to)
  const name = `${PLANNER_SUBJECTS[subject].title} ${GRADE_LETTERS[grade]}`

  return <div className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
    <SEO title="מסלול לימוד אישי — שיעור אחד ביום לפי תוכנית הלימודים" description="לימוד עצמי, לימוד ביתי או עם מורה פרטי: בוחרים מקצוע וכיתה ומקבלים כל יום את השיעור הבא לפי תוכנית הלימודים — הסבר, תרגול באתר ודף עבודה להדפסה. בחינם." path="/path" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, { label: 'מסלול לימוד אישי' }]} />
    <h1 className="text-center text-4xl sm:text-5xl"><span aria-hidden="true">🧭 </span>מסלול לימוד אישי</h1>
    <p className="mx-auto mt-2 max-w-2xl text-center text-lg">שיעור אחד ביום, לפי הסדר של תוכנית הלימודים — עם הסבר, תרגול באתר ודף עבודה. מסיימים? עוברים לשיעור הבא.</p>

    <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
      <label className="font-bold">מקצוע<select value={subject} onChange={e => choose(e.target.value, gradesOf(e.target.value)[0])} className={field}>{subjects.map(([k, s]) => <option key={k} value={k}>{s.emoji} {s.title}</option>)}</select></label>
      <label className="font-bold">כיתה<select value={grade} onChange={e => choose(subject, Number(e.target.value))} className={field}>{grades.map(g => <option key={g} value={g}>{GRADE_LETTERS[g]}</option>)}</select></label>
      <label className="col-span-2 font-bold sm:col-span-1">איך לומדים?<select value={mode} onChange={e => setState(s => ({ ...s, mode: e.target.value }))} className={field}>{MODES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
      <label className="col-span-2 font-bold sm:col-span-3">מתחילים מ…<select value={unit} onChange={e => setMine({ idx: unitStart(seq, Number(e.target.value)) })} className={field}>{seq.units.map((u, i) => <option key={i} value={i}>{i + 1}. {u.title}</option>)}</select></label>
    </div>

    <div className="mt-4" aria-label="ההתקדמות">
      <div className="flex justify-between text-sm font-bold"><span>{name} · שיעור {Math.min(at + 1, total)} מתוך {total}</span><span>{days ? `🔥 ${days} ימי לימוד` : ''}</span></div>
      <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.round((at / total) * 100)}%` }} /></div>
    </div>

    <section className="mt-4 rounded-3xl border-2 border-emerald-300 bg-emerald-50 p-4 sm:p-5" aria-labelledby="today-h">
      {!lesson ? <p id="today-h" className="text-xl font-black">🎉 סיימתם את כל השיעורים של השנה! זה הזמן לחזרה — אפשר לבחור נושא מההתחלה.</p> : <>
        <h2 id="today-h" className="text-2xl font-black">📌 היום לומדים: {lesson.step.title}</h2>
        <p className="mt-1">{lesson.unit.title} · שיעור {lesson.k} מתוך {lesson.unit.hours}</p>
        <p className="mt-2"><b>🎯 בסוף השיעור:</b> {lesson.step.goal}</p>
        <ol className="mt-3 space-y-2">
          <li className="rounded-2xl bg-white p-3"><b>1. מבינים</b> — {lesson.step.activity}</li>
          <li className="rounded-2xl bg-white p-3"><b>2. מתרגלים</b> — {lesson.step.practice}
            {practice.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{practice.map(({ l, to }) => <Link key={`${l.type}-${l.slug}`} to={to} className="ln-chip !min-h-[40px]">{LINK_LABELS[l.type]} ←</Link>)}</div>}</li>
          <li className="rounded-2xl bg-white p-3"><b>3. דף עבודה</b>
            <div className="mt-2 flex flex-wrap items-center gap-1">{LEVELS.map(([l, label]) => <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)} className={`rounded-full border-2 px-2 py-1 text-sm ${level === l ? 'border-emerald-500 bg-emerald-50 font-bold' : 'border-slate-200'}`}>{label}</button>)}
              <button type="button" onClick={() => setPrint(true)} className="min-h-[44px] rounded-xl bg-violet-600 px-4 font-black text-white">🖨️ להדפסה</button></div></li>
        </ol>
        {mode !== 'self' && <details className="mt-3 rounded-2xl bg-white p-3" open={mode === 'tutor'}><summary className="cursor-pointer font-bold">{mode === 'home' ? '👨‍👩‍👧 להורה: איך מעבירים את השיעור' : '👩‍🏫 מערך השיעור המלא'}</summary><div className="mt-2"><LessonPlan p={p} /></div></details>}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button type="button" disabled={at === 0} onClick={() => setMine({ idx: at - 1 })} className="ln-chip">→ השיעור הקודם</button>
          <button type="button" onClick={finish} className="min-h-[52px] rounded-2xl bg-emerald-600 px-6 text-lg font-black text-white shadow-sm">{doneToday ? '✅ סיימתי — לשיעור הבא' : '✅ סיימתי את השיעור'}</button>
        </div>
        <p className="mt-2 text-center text-sm text-[var(--muted-foreground)]">✓ ההתקדמות נשמרת בדפדפן הזה. כל מקצוע וכיתה זוכרים איפה עצרתם.</p>
      </>}
    </section>
    <p className="mt-6 text-center text-sm">מורים? <Link to="/planner" className="font-bold underline">מערכת השעות המתעדכנת</Link> בונה שיעור לכל שעה במערכת שלכם.</p>
    {print && lesson && <PrintPreview title={`${name} — ${lesson.step.title}`} onClose={() => setPrint(false)}><PeriodSheet p={p} level={level} /></PrintPreview>}
  </div>
}
