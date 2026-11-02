// /tools/shifts — free duty-roster / shift planner. Everything stays in this browser (localStorage).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import ShiftBoard from './ShiftBoard'
import {
  PRESETS, DAY_SHORT, ALL_DAYS, MAX_DAYS, addDays, dayDiff, dateRange, dateRuns, fmtDate, todayISO, isISO, uid,
  parsePeople, effectiveRules, describeRules, planFromPreset, buildSlots, normalizeCells, schedule, checkConflicts,
  totals, spread, unlockAll, toWhatsApp, personText, personDuties, matrix, toCSV,
} from './shiftLogic'
import '../../excel/excel.css'
import './shifts.css'

const STORE = 'ugabuga-shifts'
const freshRoster = () => ({ id: uid('r'), name: '', people: [], plan: planFromPreset('kitchen', todayISO()), cells: {}, seed: 1, step: 1, built: false, updated: Date.now() })
function loadStore() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE) || 'null')
    if (s && Array.isArray(s.rosters) && s.rosters.length) return { cur: s.rosters.some(r => r.id === s.cur) ? s.cur : s.rosters[0].id, rosters: s.rosters }
  } catch { /* broken or blocked storage */ }
  const r = freshRoster()
  return { cur: r.id, rosters: [r] }
}
const saveStore = s => { try { localStorage.setItem(STORE, JSON.stringify(s)) } catch { /* private mode / full */ } }
const rosterName = r => r.name || `${r.plan.title} · ${fmtDate(r.plan.start)}`

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true } catch { /* fall back */ }
  try {
    const ta = document.createElement('textarea')
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'
    document.body.appendChild(ta); ta.select()
    const ok = document.execCommand('copy'); ta.remove(); return ok
  } catch { return false }
}

const Page = ({ children }) => <div className="mx-auto max-w-5xl px-4 py-8 buga-fade-in" dir="rtl">{children}</div>
const STEPS = ['מי בתורנות', 'אילו תורנויות', 'הסידור']

function DayToggles({ value, onChange, label }) {
  return (
    <div className="sp-days" role="group" aria-label={label}>
      {DAY_SHORT.map((d, i) => (
        <button key={i} type="button" aria-pressed={value.includes(i)} onClick={() => onChange(value.includes(i) ? value.filter(x => x !== i) : [...value, i].sort())}>{d}</button>
      ))}
    </div>
  )
}

// ── step 1 ───────────────────────────────
function PeopleStep({ roster, update, next }) {
  const [text, setText] = useState('')
  const [open, setOpen] = useState(null)
  const [off, setOff] = useState({ from: '', to: '' })
  const { people, plan } = roster
  const addFromText = () => {
    const have = new Set(people.map(p => p.name))
    const added = parsePeople(text).filter(p => !have.has(p.name)).map(p => ({ id: uid('p'), ...p, rules: {} }))
    if (added.length) update(r => ({ ...r, people: [...r.people, ...added] }))
    setText('')
    return added.length
  }
  const setPerson = (id, fn) => update(r => ({ ...r, people: r.people.map(p => p.id === id ? fn(p) : p) }))
  const setRule = (id, k, v) => setPerson(id, p => ({ ...p, rules: { ...(p.rules || {}), [k]: v } }))

  return (
    <div className="xl-box space-y-3">
      <label className="sp-label" htmlFor="sp-paste">שם בכל שורה. אפשר להדביק מוואטסאפ או מאקסל, ולהוסיף הערה אחרי מקף.</label>
      <textarea id="sp-paste" className="sp-input sp-paste" rows={6} value={text} onChange={e => setText(e.target.value)}
        placeholder={'דני כהן\nרוני לוי - לא בימי שישי\nמשה: רק בוקר\nיוסי - חופשה 12.11-15.11'} />
      <div className="flex flex-wrap gap-2">
        <button type="button" className="xl-btn" onClick={addFromText} disabled={!text.trim()}>➕ הוספה לרשימה</button>
        {people.length > 0 && <button type="button" className="xl-btn alt" onClick={() => { if (window.confirm('למחוק את כל הרשימה?')) update(r => ({ ...r, people: [] })) }}>🗑 ניקוי הרשימה</button>}
      </div>

      {people.length > 0 && <>
        <h3 className="sp-h3">{people.length} אנשים</h3>
        <ol className="sp-people">
          {people.map((p, n) => {
            const tags = describeRules(effectiveRules(p, plan), plan)
            const manual = p.rules || {}
            return (
              <li key={p.id}>
                <div className="sp-prow">
                  <span className="sp-num">{n + 1}</span>
                  <input className="sp-input sp-pname" aria-label="שם" value={p.name} onChange={e => setPerson(p.id, x => ({ ...x, name: e.target.value.slice(0, 40) }))} />
                  <input className="sp-input sp-pnote" aria-label={`הערה ל${p.name}`} placeholder="הערה: לא בשישי / רק בוקר / חופשה 3.11-5.11" value={p.note || ''} onChange={e => setPerson(p.id, x => ({ ...x, note: e.target.value.slice(0, 120) }))} />
                  <button type="button" className="sp-icon" aria-expanded={open === p.id} aria-label={`הגבלות ל${p.name}`} onClick={() => setOpen(o => o === p.id ? null : p.id)}>⚙️</button>
                  <button type="button" className="sp-icon" aria-label={`מחיקת ${p.name}`} onClick={() => update(r => ({ ...r, people: r.people.filter(x => x.id !== p.id) }))}>✕</button>
                </div>
                {tags.length > 0 && <div className="sp-tags">{tags.map(t => <span key={t}>{t}</span>)}</div>}
                {open === p.id && (
                  <div className="sp-rules">
                    <div><span>לא בימים:</span><DayToggles label="ימים בלי תורנות" value={manual.noDays || []} onChange={v => setRule(p.id, 'noDays', v)} /></div>
                    {plan.shifts.length > 1 && (
                      <div><span>לא במשמרות:</span>
                        <div className="sp-days">{plan.shifts.map(s => {
                          const on = (manual.noShifts || []).includes(s.id)
                          return <button key={s.id} type="button" aria-pressed={on} onClick={() => setRule(p.id, 'noShifts', on ? manual.noShifts.filter(x => x !== s.id) : [...(manual.noShifts || []), s.id])}>{s.name}</button>
                        })}</div>
                      </div>
                    )}
                    <div><span>לא זמינים בתאריכים:</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <input type="date" className="sp-input" aria-label="מתאריך" value={off.from} onChange={e => setOff(o => ({ ...o, from: e.target.value }))} />
                        <span>עד</span>
                        <input type="date" className="sp-input" aria-label="עד תאריך" value={off.to} onChange={e => setOff(o => ({ ...o, to: e.target.value }))} />
                        <button type="button" className="xl-btn alt" disabled={!isISO(off.from)} onClick={() => {
                          const to = isISO(off.to) && dayDiff(off.from, off.to) >= 0 ? off.to : off.from
                          setRule(p.id, 'offDates', [...new Set([...(manual.offDates || []), ...dateRange(off.from, to)])])
                          setOff({ from: '', to: '' })
                        }}>הוספה</button>
                      </div>
                      {(manual.offDates || []).length > 0 && (
                        <div className="sp-tags">{dateRuns(manual.offDates).map(t => <span key={t}>{t}</span>)}
                          <button type="button" className="sp-link" onClick={() => setRule(p.id, 'offDates', [])}>ניקוי תאריכים</button></div>
                      )}
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      </>}
      <div className="flex justify-end">
        <button type="button" className="xl-btn go" disabled={!people.length && !text.trim()} onClick={() => { if (text.trim()) addFromText(); next() }}>הבא: התורנויות ←</button>
      </div>
    </div>
  )
}

// ── step 2 ───────────────────────────────
function DutiesStep({ roster, update, build }) {
  const { plan, people } = roster
  const setPlan = fn => update(r => ({ ...r, plan: fn(r.plan) }))
  const setShift = (id, patch) => setPlan(p => ({ ...p, shifts: p.shifts.map(s => s.id === id ? { ...s, ...patch } : s) }))
  const days = dayDiff(plan.start, plan.end) + 1
  const slots = useMemo(() => buildSlots(plan), [plan])
  const spots = slots.reduce((s, x) => s + x.need, 0)
  // a different kind of duty starts from an empty grid (old locks would land on unrelated shifts)
  const pickPreset = id => update(r => ({ ...r, plan: planFromPreset(id, isISO(r.plan.start) ? r.plan.start : todayISO()), cells: {} }))
  const setLen = n => setPlan(p => ({ ...p, end: addDays(p.start, n - 1) }))

  return (
    <div className="xl-box space-y-4">
      <div className="sp-presets">
        {PRESETS.map(p => (
          <button key={p.id} type="button" aria-pressed={plan.preset === p.id} onClick={() => pickPreset(p.id)}><span aria-hidden="true">{p.emoji}</span>{p.label}</button>
        ))}
        <button type="button" aria-pressed={plan.preset === 'custom'} onClick={() => pickPreset('custom')}><span aria-hidden="true">✏️</span>משהו אחר</button>
      </div>

      <div className="sp-form">
        <label>שם הסידור<input className="sp-input" value={plan.title} onChange={e => setPlan(p => ({ ...p, title: e.target.value.slice(0, 60) }))} /></label>
        <label>מתאריך<input type="date" className="sp-input" value={plan.start} onChange={e => { const v = e.target.value; if (isISO(v)) setPlan(p => ({ ...p, start: v, end: addDays(v, Math.max(0, dayDiff(p.start, p.end))) })) }} /></label>
        <label>עד תאריך<input type="date" className="sp-input" value={plan.end} min={plan.start} onChange={e => { const v = e.target.value; if (isISO(v) && dayDiff(plan.start, v) >= 0) setPlan(p => ({ ...p, end: dayDiff(p.start, v) < MAX_DAYS ? v : addDays(p.start, MAX_DAYS - 1) })) }} /></label>
      </div>
      <div className="sp-quick" role="group" aria-label="משך">
        {[[7, 'שבוע'], [14, 'שבועיים'], [21, '3 שבועות'], [28, '4 שבועות']].map(([n, l]) => <button key={n} type="button" aria-pressed={days === n} onClick={() => setLen(n)}>{l}</button>)}
      </div>

      <div className="space-y-2">
        {plan.shifts.map(s => (
          <div key={s.id} className="sp-shift">
            <label className="sp-grow">משמרת<input className="sp-input" value={s.name} onChange={e => setShift(s.id, { name: e.target.value.slice(0, 30) })} /></label>
            <label>שעה<input type="time" className="sp-input" value={s.start || ''} onChange={e => setShift(s.id, { start: e.target.value })} /></label>
            <label>שעות<input type="number" inputMode="numeric" min="0" max="24" className="sp-input sp-n" value={s.hours || ''} onChange={e => setShift(s.id, { hours: Math.max(0, Math.min(24, +e.target.value || 0)) })} /></label>
            <label>אנשים<input type="number" inputMode="numeric" min="1" max="20" className="sp-input sp-n" value={s.need} onChange={e => setShift(s.id, { need: Math.max(1, Math.min(20, Math.round(+e.target.value) || 1)) })} /></label>
            <DayToggles label={`ימים של ${s.name}`} value={s.days || ALL_DAYS} onChange={v => setShift(s.id, { days: v })} />
            {plan.shifts.length > 1 && <button type="button" className="sp-icon" aria-label={`מחיקת ${s.name}`} onClick={() => setPlan(p => ({ ...p, shifts: p.shifts.filter(x => x.id !== s.id) }))}>✕</button>}
          </div>
        ))}
        {plan.shifts.length < 12 && <button type="button" className="xl-btn alt" onClick={() => setPlan(p => ({ ...p, shifts: [...p.shifts, { id: uid('s'), name: `משמרת ${p.shifts.length + 1}`, start: '', hours: 0, need: 1, days: [...ALL_DAYS] }] }))}>➕ עוד משמרת</button>}
      </div>

      <div className="sp-form">
        <label>מנוחה בין תורנויות
          <select className="sp-input" value={plan.restHours} onChange={e => setPlan(p => ({ ...p, restHours: +e.target.value }))}>
            <option value={0}>בלי מינימום</option><option value={8}>לפחות 8 שעות</option><option value={12}>לפחות 12 שעות</option><option value={16}>לפחות 16 שעות</option>
          </select>
        </label>
        <label>ימים
          <select className="sp-input" value={plan.dayGap} onChange={e => setPlan(p => ({ ...p, dayGap: +e.target.value }))}>
            <option value={0}>אפשר כמה ביום</option><option value={1}>לא פעמיים באותו יום</option><option value={2}>לא יומיים ברצף</option>
          </select>
        </label>
      </div>

      <p className="sp-sum">{days} ימים · {spots} שיבוצים{people.length ? ` · בערך ${Math.round(spots / people.length * 10) / 10} לכל אחד` : ''}</p>
      <div className="flex justify-end">
        <button type="button" className="xl-btn go" disabled={!people.length || !slots.length} onClick={build}>✨ {roster.built ? 'עדכון הסידור' : 'יצירת סידור הוגן'}</button>
      </div>
      {!people.length && <p className="sp-hint">קודם מוסיפים אנשים בשלב 1.</p>}
    </div>
  )
}

// ── step 3 outputs ───────────────────────────────
function Outputs({ roster, cells, slots, onPrint, toast }) {
  const { plan, people } = roster
  const [pid, setPid] = useState('')
  const person = people.find(p => p.id === pid)
  const wa = () => toWhatsApp({ title: roster.name || plan.title, plan, people, cells, slots })
  const csv = () => {
    const blob = new Blob([toCSV({ plan, people, cells, slots })], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${(plan.title || 'תורנויות').replace(/[\\/:*?"<>|]/g, '')} ${fmtDate(plan.start)}.csv`
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }
  const share = async () => { try { await navigator.share({ title: plan.title, text: wa() }) } catch { /* cancelled */ } }
  const mine = person ? personDuties(person.id, slots, cells) : []
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="xl-btn" onClick={async () => toast(await copyText(wa()) ? 'הועתק! מדביקים בקבוצה' : 'לא הצלחתי להעתיק')}>📋 העתקה לוואטסאפ</button>
        <button type="button" className="xl-btn alt" onClick={onPrint}>🖨️ הדפסה</button>
        <button type="button" className="xl-btn alt" onClick={csv}>📊 קובץ לאקסל</button>
        {typeof navigator !== 'undefined' && navigator.share && <button type="button" className="xl-btn alt" onClick={share}>📤 שיתוף</button>}
      </div>
      <div className="xl-box space-y-2">
        <label className="sp-label" htmlFor="sp-me">מתי אני בתורנות?</label>
        <select id="sp-me" className="sp-input" value={pid} onChange={e => setPid(e.target.value)}>
          <option value="">בחרו שם…</option>
          {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {person && <>
          <ul className="sp-mine">
            {mine.map(s => <li key={s.key}><b>{DAY_SHORT[s.dow]} {fmtDate(s.date)}</b> {s.shift.name}</li>)}
            {!mine.length && <li>אין תורנויות בסידור הזה</li>}
          </ul>
          <button type="button" className="xl-btn alt" onClick={async () => toast(await copyText(personText({ person, plan, cells, slots })) ? 'הועתק' : 'לא הצלחתי להעתיק')}>📋 העתקת הרשימה של {person.name}</button>
        </>}
      </div>
    </div>
  )
}

function PrintSheet({ roster, cells, slots, tot }) {
  const { head, rows } = matrix({ plan: roster.plan, people: roster.people, cells, slots })
  return (
    <div className="sp-print" dir="rtl">
      <h1>{rosterName(roster)}</h1>
      <p>{fmtDate(roster.plan.start)}–{fmtDate(roster.plan.end)}</p>
      <table>
        <thead><tr>{head.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
      </table>
      <p className="sp-print-tot">{tot.map(t => `${t.name}: ${t.count}`).join(' · ')}</p>
    </div>
  )
}

const FAQ = [
  { q: 'איך עושים סידור תורנויות הוגן?', a: 'מכניסים את השמות פעם אחת, בוחרים סוג תורנות ולוחצים על יצירה. המחשבון מחלק כך שההפרש בין מי שקיבל הכי הרבה למי שקיבל הכי מעט יהיה תורנות אחת לכל היותר, ומציג ליד כל שם כמה תורנויות יש לו.' },
  { q: 'אפשר להגדיר מי לא יכול מתי?', a: 'כן. כותבים הערה ליד השם, למשל „לא בימי שישי”, „רק בוקר”, „לא לילות” או „חופשה 12.11-15.11”, והכלי מבין אותה לבד. אפשר גם לסמן ימים, משמרות ותאריכים בכפתור ⚙️.' },
  { q: 'איך מזיזים מישהו?', a: 'גוררים את השם למשבצת אחרת. גרירה על שם אחר מחליפה ביניהם. בטלפון מחזיקים רגע על השם וגוררים, או מקישים על השם ואז על היעד. ⟲ מבטל.' },
  { q: 'מה עושה „ערבוב מחדש”?', a: 'מחלק מחדש את כל מי שלא נעול. מי שנעלתם 🔒 נשאר בדיוק במקום.' },
  { q: 'מה המשמעות של אדום?', a: 'שיבוץ ששובר כלל: מישהו ביום שביקש לא, פחות מדי מנוחה בין משמרות (למשל לילה ואז בוקר), פעמיים באותו יום או יומיים ברצף. ליד הטבלה כתובה הסיבה.' },
  { q: 'הסידור נשמר? מישהו רואה אותו?', a: 'הוא נשמר רק בדפדפן הזה, ואפשר להחזיק כמה סידורים בשמות שונים. שום דבר לא נשלח לשרת. כדי לשתף, מעתיקים לוואטסאפ, מדפיסים או מורידים קובץ לאקסל.' },
]

// ── page ───────────────────────────────
export default function ShiftPlanner() {
  const [store, setStore] = useState(() => { const r = freshRoster(); return { cur: r.id, rosters: [r] } })
  const [ready, setReady] = useState(false)
  const [hist, setHist] = useState({ past: [], future: [] })
  const [msg, setMsg] = useState('')
  const [focus, setFocus] = useState('')
  const [printing, setPrinting] = useState(false)
  const topRef = useRef(null)

  useEffect(() => { setStore(loadStore()); setReady(true) }, [])
  useEffect(() => { if (ready) saveStore(store) }, [store, ready])
  const switchTo = fn => { setHist({ past: [], future: [] }); setFocus(''); setStore(fn) }

  const roster = store.rosters.find(r => r.id === store.cur) || store.rosters[0]
  const update = useCallback(fn => setStore(s => ({ ...s, rosters: s.rosters.map(r => r.id === s.cur ? { ...fn(r), updated: Date.now() } : r) })), [])
  const toast = useCallback(t => { setMsg(t); setTimeout(() => setMsg(''), 2200) }, [])

  const { plan, people } = roster
  const slots = useMemo(() => buildSlots(plan), [plan])
  const cells = useMemo(() => normalizeCells(slots, roster.cells, people), [slots, roster.cells, people])
  const conflicts = useMemo(() => checkConflicts(people, plan, cells, slots), [people, plan, cells, slots])
  const tot = useMemo(() => totals(people, slots, cells), [people, slots, cells])
  const empty = useMemo(() => slots.reduce((n, s) => n + cells[s.key].filter(c => !c.p).length, 0), [slots, cells])
  const lockedN = tot.reduce((n, t) => n + t.locked, 0)

  const setCells = useCallback(next => {
    if (next === cells) return
    setHist(h => ({ past: [...h.past.slice(-99), cells], future: [] }))
    update(r => ({ ...r, cells: next }))
  }, [cells, update])
  const undo = useCallback(() => {
    if (!hist.past.length) return
    const prev = hist.past[hist.past.length - 1]
    setHist(h => ({ past: h.past.slice(0, -1), future: [cells, ...h.future] }))
    update(r => ({ ...r, cells: prev }))
  }, [hist, cells, update])
  const redo = useCallback(() => {
    if (!hist.future.length) return
    const nx = hist.future[0]
    setHist(h => ({ past: [...h.past, cells], future: h.future.slice(1) }))
    update(r => ({ ...r, cells: nx }))
  }, [hist, cells, update])

  useEffect(() => {
    if (roster.step !== 3) return
    const onKey = e => {
      if (!(e.ctrlKey || e.metaKey) || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return
      const k = e.key.toLowerCase()
      if ((k === 'z' || k === 'ז') && !e.shiftKey) { e.preventDefault(); undo() }
      else if (k === 'y' || k === 'ט' || (k === 'z' && e.shiftKey)) { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [roster.step, undo, redo])

  const goStep = n => { update(r => ({ ...r, step: n })); topRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }) }
  const build = () => {
    const seed = (roster.seed || 1) + 1
    setCells(schedule({ people, plan, cells, seed }))
    update(r => ({ ...r, seed, step: 3, built: true }))
    topRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }
  const shuffle = () => {
    const seed = (roster.seed || 1) + 1
    setCells(schedule({ people, plan, cells, seed }))
    update(r => ({ ...r, seed }))
  }
  const newRoster = () => { const r = freshRoster(); switchTo(s => ({ cur: r.id, rosters: [...s.rosters, r] })) }
  const copyRoster = () => {
    const r = { ...roster, id: uid('r'), name: `${rosterName(roster)} (עותק)`, updated: Date.now() }
    switchTo(s => ({ cur: r.id, rosters: [...s.rosters, r] }))
  }
  const removeRoster = () => {
    if (!window.confirm(`למחוק את „${rosterName(roster)}”?`)) return
    switchTo(s => {
      const rest = s.rosters.filter(r => r.id !== s.cur)
      if (!rest.length) { const r = freshRoster(); return { cur: r.id, rosters: [r] } }
      return { cur: rest[0].id, rosters: rest }
    })
  }
  const print = () => {
    setPrinting(true)
    document.documentElement.classList.add('sp-printing')
    const done = () => { document.documentElement.classList.remove('sp-printing'); setPrinting(false); window.removeEventListener('afterprint', done) }
    window.addEventListener('afterprint', done)
    setTimeout(() => { window.print(); setTimeout(done, 500) }, 60)
  }

  const step = roster.built ? roster.step : Math.min(roster.step, 2)
  const badN = Object.keys(conflicts).length
  const reasons = useMemo(() => [...new Set(Object.values(conflicts).flat())], [conflicts])

  return <Page>
    <SEO title="סידור משמרות ותורנויות חינם — בונים, גוררים ומשתפים" description="כלי חינמי לסידור משמרות, תורנות מטבח, שמירות ותורנות ניקיון: מכניסים שמות פעם אחת, מקבלים טבלת תורנויות הוגנת, ומזיזים בגרירה. הדפסה, וואטסאפ ואקסל, בלי הרשמה." path="/tools/shifts" structuredData={faqSchema(FAQ)} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כלים', href: '/tools' }, { label: 'סידור משמרות' }]} />
    <h1 ref={topRef} className="text-4xl sm:text-5xl text-center mb-2"><span aria-hidden="true">📋 </span>סידור משמרות ותורנויות</h1>
    <p className="text-center text-lg mb-5">מכניסים את השמות פעם אחת, מקבלים סידור הוגן, ומזיזים בגרירה.</p>

    <div className="sp-rosters">
      <label className="sr-only" htmlFor="sp-roster">הסידורים שלי</label>
      <select id="sp-roster" className="sp-input" value={store.cur} onChange={e => { const v = e.target.value; switchTo(s => ({ ...s, cur: v })) }}>
        {store.rosters.map(r => <option key={r.id} value={r.id}>{rosterName(r)}</option>)}
      </select>
      <input className="sp-input" aria-label="שם הסידור השמור" placeholder="שם לסידור (למשל: מטבח פלוגה ב)" value={roster.name} onChange={e => update(r => ({ ...r, name: e.target.value.slice(0, 50) }))} />
      <button type="button" className="sp-icon" title="סידור חדש" aria-label="סידור חדש" onClick={newRoster}>➕</button>
      <button type="button" className="sp-icon" title="שכפול" aria-label="שכפול הסידור" onClick={copyRoster}>⧉</button>
      <button type="button" className="sp-icon" title="מחיקה" aria-label="מחיקת הסידור" onClick={removeRoster}>🗑</button>
    </div>

    <nav className="sp-steps" aria-label="שלבים">
      {STEPS.map((t, i) => (
        <button key={t} type="button" aria-current={step === i + 1 ? 'step' : undefined} disabled={i === 2 && !roster.built} onClick={() => goStep(i + 1)}>
          <span>{i + 1}</span>{t}{i === 0 && people.length ? ` (${people.length})` : ''}
        </button>
      ))}
    </nav>

    {step === 1 && <PeopleStep roster={roster} update={update} next={() => goStep(2)} />}
    {step === 2 && <DutiesStep roster={roster} update={update} build={build} />}
    {step === 3 && <div className="space-y-4">
      <div className="sp-toolbar">
        <button type="button" className="xl-btn alt" onClick={undo} disabled={!hist.past.length} aria-label="ביטול פעולה" title="ביטול (Ctrl+Z)">↶</button>
        <button type="button" className="xl-btn alt" onClick={redo} disabled={!hist.future.length} aria-label="חזרה על פעולה" title="חזרה (Ctrl+Y)">↷</button>
        <button type="button" className="xl-btn" onClick={shuffle}>🔀 ערבוב מחדש</button>
        {lockedN > 0 && <button type="button" className="xl-btn alt" onClick={() => setCells(unlockAll(cells))}>🔓 שחרור {lockedN} נעולים</button>}
        <label className="sp-focus">
          <span className="sr-only">הדגשת אדם</span>
          <select className="sp-input" value={focus} onChange={e => setFocus(e.target.value)}>
            <option value="">הדגשה: כולם</option>
            {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
      </div>
      <p className="sp-status" aria-live="polite">
        {spread(tot) <= 1 ? '✓ חלוקה הוגנת' : `⚠️ פער של ${spread(tot)} תורנויות בין האנשים`}
        {badN ? ` · 🔴 ${badN === 1 ? 'בעיה אחת' : `${badN} בעיות`}` : ' · אין התנגשויות'}
        {empty ? ` · ${empty === 1 ? 'מקום ריק אחד' : `${empty} מקומות ריקים`}` : ''}
        {lockedN ? ` · 🔒 ${lockedN}` : ''}
      </p>
      <ShiftBoard plan={plan} people={people} slots={slots} cells={cells} conflicts={conflicts} tot={tot} focus={focus} onCells={setCells} />
      {reasons.length > 0 && (
        <div className="sp-bad" role="status">
          <b>מה אדום ולמה:</b>
          <ul>{reasons.slice(0, 12).map(r => <li key={r}>{r}</li>)}</ul>
          {reasons.length > 12 && <p>ועוד {reasons.length - 12}…</p>}
        </div>
      )}
      <Outputs roster={roster} cells={cells} slots={slots} onPrint={print} toast={toast} />
    </div>}

    {msg && <div className="sp-toast" role="status">{msg}</div>}
    {printing && createPortal(<PrintSheet roster={roster} cells={cells} slots={slots} tot={tot} />, document.body)}

    <div className="mt-12"><SeoBody
      paragraphs={[
        'סידור משמרות וטבלת תורנויות בלי אקסל ובלי נוסחאות: תורנות מטבח בצבא, סידור שמירות של 4 או 8 שעות, משמרות בוקר, ערב ולילה בעבודה, תורנות ניקיון בכיתה, תורנות בבית לילדים ותורנות הסעות. מכניסים את הרשימה פעם אחת, והכלי בונה סידור עבודה שמחלק שווה בשווה, שומר על מנוחה בין משמרות ולא משבץ אנשים כשהם ביקשו חופש.',
        'אחרי שהסידור מוכן משחקים איתו חופשי: גוררים שם ממשבצת למשבצת, מחליפים בין שניים, נועלים את מי שחייב להישאר, ומערבבים את השאר. כל שינוי מעדכן את הספירה ליד כל שם, כך שרואים מיד שהחלוקה הוגנת. בסוף מעתיקים לקבוצת הוואטסאפ, מדפיסים טבלה לרוחב A4 או מורידים קובץ שנפתח באקסל.',
      ]}
      faq={FAQ}
      related={[{ label: 'קורס אקסל חינם', href: '/excel' }, { label: 'כל הכלים', href: '/tools' }]}
    /></div>
  </Page>
}
