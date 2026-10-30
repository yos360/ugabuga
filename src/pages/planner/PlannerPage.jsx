import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { PLANNER_SUBJECTS } from '../../data/planner/schema'
import { SCHOOL_YEAR, addDays, isoOf, weekStart } from '../../data/planner/schoolYear'
import { DAYS, GRADE_LETTERS, LINK_LABELS, PERIODS, emptyPlan, linkHref, weekPlan } from '../../data/planner/engine'

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
  .then(async r => { const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || 'השירות לא זמין כרגע.'); return d })

function CloudBox({ cloud, onLogout }) {
  const [email, setEmail] = useState(''), [state, setState] = useState('idle'), [msg, setMsg] = useState('')
  if (cloud.email) return <p className="mx-auto mt-4 max-w-2xl rounded-2xl bg-emerald-50 p-3 text-center">☁️ מחוברים כ־<bdi dir="ltr" className="font-bold">{cloud.email}</bdi> · {cloud.saving ? 'שומרים…' : 'המערכת נשמרת בענן ✓'} · <button type="button" className="underline" onClick={onLogout}>התנתקות מהמכשיר הזה</button></p>
  const send = async e => {
    e.preventDefault(); setState('sending')
    try { await api({ action: 'login', email }); setState('sent') } catch (err) { setMsg(err.message); setState('error') }
  }
  return <div className="mx-auto mt-4 max-w-2xl rounded-2xl border-2 border-sky-200 bg-sky-50 p-3 text-center">
    {state === 'sent' ? <p className="font-bold" role="status">📬 שלחנו לכם קישור כניסה למייל. לחצו עליו בכל מכשיר — והמערכת תופיע שם.</p> : <>
      <p className="font-bold">☁️ רוצים את המערכת גם בטלפון ובמחשב של בית הספר? הכניסו מייל ונשלח קישור כניסה.</p>
      <form onSubmit={send} className="mt-2 flex flex-wrap justify-center gap-2">
        <input type="email" dir="ltr" required value={email} onChange={e => setEmail(e.target.value)} placeholder="המייל שלכם" aria-label="המייל שלכם" className="min-h-[44px] min-w-[220px] rounded-xl border-2 border-sky-200 bg-white px-3" />
        <button type="submit" disabled={state === 'sending'} className="min-h-[44px] rounded-xl bg-sky-600 px-4 font-black text-white disabled:opacity-60">{state === 'sending' ? 'שולחים…' : 'שלחו לי קישור'}</button>
      </form>
      {state === 'error' && <p className="mt-1 font-bold text-red-700" role="alert">{msg}</p>}
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">בלי סיסמה. המייל משמש לכניסה ולעדכונים על מערכת השעות, ולא נמסר לאף אחד.</p>
    </>}
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

function Timetable({ plan, setPlan }) {
  const set = (day, period, id) => setPlan(p => { const slots = { ...p.slots }; if (id) slots[`${day}-${period}`] = id; else delete slots[`${day}-${period}`]; return { ...p, slots } })
  return <div className="overflow-x-auto"><table className="w-full min-w-[640px] border-collapse text-center">
    <thead><tr><th className="p-1">שעה</th>{DAYS.map(d => <th key={d} className="p-1">יום {d}</th>)}</tr></thead>
    <tbody>{PERIODS.map(p => <tr key={p}><th className="p-1">{p}</th>{DAYS.map((d, day) => <td key={d} className="p-1">
      <select value={plan.slots[`${day}-${p}`] || ''} onChange={e => set(day, p, e.target.value)} aria-label={`יום ${d} שעה ${p}`}
        className={`min-h-[40px] w-full rounded-lg border-2 px-1 text-sm ${plan.slots[`${day}-${p}`] ? 'border-violet-300 bg-violet-50 font-bold' : 'border-slate-200 bg-white'}`}>
        <option value="">—</option>{plan.classes.map(c => <option key={c.id} value={c.id}>{classLabel(c)}</option>)}
      </select></td>)}</tr>)}</tbody>
  </table></div>
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

function Week({ plan, setPlan, seqs }) {
  const today = isoOf(new Date())
  const [sunday, setSunday] = useState(() => weekStart(today < SCHOOL_YEAR.start ? SCHOOL_YEAR.start : today))
  const [open, setOpen] = useState(null)
  const [printing, setPrinting] = useState(false)
  const week = useMemo(() => weekPlan(plan, seqs, sunday), [plan, seqs, sunday])
  const shift = (id, d) => setPlan(p => ({ ...p, shifts: { ...p.shifts, [id]: (p.shifts[id] || 0) + d } }))
  const dayOff = (iso, on) => setPlan(p => ({ ...p, extraOff: on ? [...p.extraOff, [iso, 'אין לימודים']] : p.extraOff.filter(([d]) => d !== iso) }))
  return <section aria-labelledby="week-h">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 id="week-h" className="text-2xl font-black">📅 השבוע שלי · {shortDate(sunday)}–{shortDate(addDays(sunday, 5))}</h2>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="ln-chip" onClick={() => setSunday(addDays(sunday, -7))}>→ שבוע קודם</button>
        <button type="button" className="ln-chip" onClick={() => setSunday(weekStart(today))}>השבוע</button>
        <button type="button" className="ln-chip" onClick={() => setSunday(addDays(sunday, 7))}>שבוע הבא ←</button>
        <button type="button" className="min-h-[44px] rounded-full bg-violet-600 px-4 font-black text-white" onClick={() => setPrinting(true)}>🖨️ הדפסת השבוע</button>
      </div>
    </div>
    <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{week.map(d => <div key={d.iso} className="rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-3">
      <div className="flex items-center justify-between"><b>יום {d.label} · {shortDate(d.iso)}</b>
        {d.periods.length > 0 && <label className="text-xs"><input type="checkbox" checked={plan.extraOff.some(([x]) => x === d.iso)} onChange={e => dayOff(d.iso, e.target.checked)} /> אין לימודים</label>}</div>
      {!d.periods.length ? <p className="mt-2 text-sm text-[var(--muted-foreground)]">אין שיעורים במערכת</p>
        : <ul className="mt-2 space-y-2">{d.periods.map(p => { const key = `${d.iso}-${p.period}`; return <li key={key} className="rounded-xl bg-white p-2">
          <button type="button" className="w-full text-right" onClick={() => setOpen(open === key ? null : key)} aria-expanded={open === key}>
            <b>שעה {p.period} · {classLabel(p.cls)}</b><br />
            <span className="text-sm">{p.why ? `🌴 ${p.why}` : p.lesson ? p.lesson.step.title : 'חזרה וסיכום'}</span>
          </button>
          {open === key && !p.why && <div className="mt-2 border-t pt-2"><LessonPlan p={p} />
            <div className="mt-2 flex gap-2 text-sm"><button type="button" className="underline" onClick={() => shift(p.cls.id, 1)}>⏭️ דלגו לשיעור הבא</button><button type="button" className="underline" onClick={() => shift(p.cls.id, -1)}>🔁 חזרו על השיעור</button></div>
          </div>}
        </li> })}</ul>}
    </div>)}</div>
    {printing && <PrintPreview title={`השבוע שלי ${shortDate(sunday)}`} onClose={() => setPrinting(false)}>
      {week.filter(d => d.periods.some(p => !p.why)).map(d => <article key={d.iso} className="buga-flow buga-a4" dir="rtl" style={{ padding: '10mm 12mm' }}>
        <h2 className="text-2xl font-black">יום {d.label} · {shortDate(d.iso)}</h2>
        {d.periods.filter(p => !p.why).map(p => <section key={p.period} className="mt-3 border-b border-slate-300 pb-3"><p className="text-lg font-black">שעה {p.period} · {classLabel(p.cls)}</p><LessonPlan p={p} /></section>)}
      </article>)}
    </PrintPreview>}
  </section>
}

export default function PlannerPage() {
  const seqs = useSequences()
  const [plan, setPlanState] = useState(emptyPlan)
  const [cloud, setCloud] = useState({ token: null, email: null, saving: false })
  useEffect(() => {
    const local = load()
    setPlanState(local)
    // Arriving from the sign-in mail (#login=<token>): keep the token, drop it from the address bar.
    const fromLink = /^#login=([\w.-]+)$/.exec(window.location.hash)?.[1]
    if (fromLink) { writeStore(TOKEN_KEY, fromLink); window.history.replaceState(null, '', window.location.pathname) }
    const token = fromLink || readStore(TOKEN_KEY)
    if (!token) return
    api({ action: 'get', token }).then(d => {
      setCloud({ token, email: d.email, saving: false })
      const remote = d.plan, hasLocal = local.classes.length > 0
      // The newer copy wins; a device with nothing yet takes the cloud copy.
      if (remote?.classes && (!hasLocal || (d.updated_at && (!local.savedAt || new Date(d.updated_at) > new Date(local.savedAt))))) { const merged = { ...emptyPlan(), ...remote }; save(merged); setPlanState(merged) }
      else if (hasLocal) api({ action: 'save', token, plan: local }).catch(() => {})
    }).catch(() => { writeStore(TOKEN_KEY, null) })
  }, [])
  // Cloud saves are batched: the last change within 1.5 seconds is sent.
  useEffect(() => {
    if (!cloud.token || !plan.savedAt) return
    setCloud(c => ({ ...c, saving: true }))
    const timer = setTimeout(() => api({ action: 'save', token: cloud.token, plan }).finally(() => setCloud(c => ({ ...c, saving: false }))), 1500)
    return () => clearTimeout(timer)
  }, [plan, cloud.token])
  const setPlan = f => setPlanState(p => { const next = { ...(typeof f === 'function' ? f(p) : f), savedAt: new Date().toISOString() }; save(next); return next })
  const logout = () => { writeStore(TOKEN_KEY, null); setCloud({ token: null, email: null, saving: false }) }
  const removeClass = id => setPlan(p => ({ ...p, classes: p.classes.filter(c => c.id !== id), slots: Object.fromEntries(Object.entries(p.slots).filter(([, v]) => v !== id)) }))
  const hasSlots = Object.keys(plan.slots).length > 0
  return <div className="mx-auto max-w-6xl px-4 py-8" dir="rtl">
    <SEO title="מערכת השעות המתעדכנת (בטא) — מערך שיעור לכל שעה לפי תוכנית הלימודים" description="מורים מכניסים את מערכת השעות ומקבלים לכל שעה את השיעור הבא לפי תוכנית משרד החינוך, עם מערך שיעור קצר, קישורים לתרגול והדפסה של כל השבוע. בחינם." path="/planner" />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'לומדים', href: '/learn' }, { label: 'מערכת השעות שלי' }]} />
    <h1 className="text-center text-4xl sm:text-5xl"><span aria-hidden="true">🗓️ </span>מערכת השעות המתעדכנת <span className="align-middle rounded-full bg-amber-300 px-3 py-1 text-base font-black">בטא</span></h1>
    <p className="mx-auto mt-3 max-w-2xl rounded-2xl bg-amber-50 p-3 text-center">🧪 <b>גרסת בטא — אנחנו בונים את זה יחד איתכם.</b> המערכת עוד משתפרת כל הזמן. משהו חסר או לא מדויק? <Link to="/request" className="font-bold underline">ספרו לנו</Link>.</p>
    <p className="mx-auto mt-2 max-w-2xl text-center text-lg">מכניסים את המערכת פעם אחת — ולכל שעה מקבלים את השיעור הבא לפי תוכנית הלימודים, מערך שיעור קצר וקישורים לתרגול. החגים והחופשות של {SCHOOL_YEAR.name} כבר בפנים.</p>
    <p className="mx-auto mt-1 max-w-2xl text-center text-sm text-[var(--muted-foreground)]">אתם תמיד יכולים לדלג, לחזור או לשנות. בלי כניסה — המערכת נשמרת רק בדפדפן הזה.</p>
    <CloudBox cloud={cloud} onLogout={logout} />
    {!seqs ? <p className="mt-8 text-center" role="status">טוענים…</p> : <>
      <section className="mt-8 rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-5" aria-labelledby="classes-h">
        <h2 id="classes-h" className="text-2xl font-black">1. הכיתות שלי</h2>
        <div className="mt-3"><AddClass seqs={seqs} onAdd={c => setPlan(p => ({ ...p, classes: [...p.classes, c] }))} /></div>
        {plan.classes.length > 0 && <ul className="mt-3 flex flex-wrap gap-2">{plan.classes.map(c => { const s = seqs[`${c.subject}-${c.grade}`]; return <li key={c.id} className="flex items-center gap-2 rounded-full border-2 border-violet-200 bg-violet-50 px-3 py-1">
          <b>{classLabel(c)}</b><span className="text-xs">{s?.official ? '· לפי הסדר הרשמי' : '· סדר מומלץ'}</span>
          <button type="button" onClick={() => removeClass(c.id)} aria-label={`הסרת ${classLabel(c)}`}>✕</button></li> })}</ul>}
      </section>
      {plan.classes.length > 0 && <section className="mt-6 rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] p-5" aria-labelledby="tt-h">
        <h2 id="tt-h" className="text-2xl font-black">2. המערכת השבועית</h2>
        <p className="mb-2 text-sm">בוחרים בכל משבצת איזו כיתה לומדת בה.</p>
        <Timetable plan={plan} setPlan={setPlan} />
      </section>}
      {hasSlots && <div className="mt-6"><Week plan={plan} setPlan={setPlan} seqs={seqs} /></div>}
      {plan.classes.length > 0 && <details className="mt-6 text-sm"><summary className="cursor-pointer font-bold">מאיפה הסדר?</summary>
        <ul className="mt-2 list-disc pr-5">{plan.classes.map(c => { const s = seqs[`${c.subject}-${c.grade}`]; return s && <li key={c.id}>{classLabel(c)}: {s.official ? 'לפי ' : 'סדר מומלץ על בסיס '}<a href={s.source.url} target="_blank" rel="noopener noreferrer" className="underline">{s.source.title}</a>{s.note ? ` — ${s.note}` : ''}</li> })}</ul>
      </details>}
    </>}
  </div>
}
