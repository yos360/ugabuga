import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import PrintPreview from '../../components/ui/PrintPreview'
import { sharePage } from '../../utils/share'
import { buildPlan, decodePlan, encodePlan, GRADE_NAMES, planKey, sessionParts, withMarks } from '../../data/tutoring/plan'
import { PlanSheet, PrintSessions, planName } from './TutoringSheets'
import { resolveLink } from './resolve'
import { readStore, writeStore } from './store'
import '../../learn/learn.css'

// /tutoring/plan?g=5&s=fractions.comprehension&w=4&d=4&m=15&b=1&f=0: the plan lives in the link, so it can be
// sent to a grandparent or a tutor. How each session went stays in this browser.
const FEEL = [['easy', '😀', 'היה קל'], ['ok', '🙂', 'היה בסדר'], ['hard', '😣', 'היה קשה']]

function Part({ emoji, title, min, children }) {
  return <li className="rounded-2xl border-2 border-slate-200 bg-white p-3">
    <p className="flex items-center justify-between gap-2 font-black"><span>{emoji} {title}</span><span className="rounded-full bg-amber-100 px-2 py-0.5 text-sm font-bold">{min} דק׳</span></p>
    <div className="mt-1">{children}</div>
  </li>
}

function PracticeLink({ step, session, o }) {
  const [r, setR] = useState(null)
  useEffect(() => {
    let live = true
    setR(null)
    resolveLink(step.link, session, o).then(x => { if (live) setR(x) })
    return () => { live = false }
  }, [step, session, o])
  return r ? <Link to={r.to} className="ln-chip !min-h-[44px]">{r.label} ←</Link> : <span className="ln-chip opacity-50">טוענים…</span>
}

function Session({ s, o, mark, onMark, onPrint, id }) {
  const t = sessionParts(o.minutes, o.focus)
  return <section id={id} className="scroll-mt-24 rounded-3xl border-2 border-emerald-300 bg-emerald-50 p-4" aria-label={`${s.day}: ${s.title}`}>
    <p className="text-sm font-bold">{o.weeks > 1 ? `שבוע ${s.week} · ` : ''}{s.day} · {s.final ? 'כל הנושאים' : s.skill.title}</p>
    <h3 className="text-2xl font-black">{s.skill.emoji} {s.title}{s.again ? ' (עוד יום של תרגול)' : ''}</h3>
    {s.review && !s.final && <p className="mt-1">היום לא מוסיפים חומר. חוזרים על מה שלמדנו השבוע, כדי שזה יישאר.</p>}
    {s.final && <p className="mt-1">בלי עזרה הפעם. משווים לתחילת החודש ושמחים על ההתקדמות.</p>}
    <ol className="mt-3 space-y-2">
      <Part emoji="🌤️" title="חימום" min={t.warm}>{s.warmup}</Part>
      <Part emoji="📣" title="לומדים יחד" min={t.learn}>{s.step.how}</Part>
      {t.brk > 0 && <Part emoji="🤸" title="הפסקת תנועה" min={t.brk}>קמים, מתמתחים, קופצים עשר קפיצות ושותים מים.</Part>}
      <Part emoji="✏️" title="מתרגלים" min={t.practice}>
        <div className="flex flex-wrap gap-2">
          {s.sources.map((x, i) => <PracticeLink key={i} step={x.step} session={s} o={o} />)}
          <button type="button" onClick={onPrint} className="ln-chip">🖨️ דף עבודה</button>
        </div>
      </Part>
      <Part emoji="🏁" title="מסיימים" min={t.end}>{s.closer}</Part>
    </ol>
    <div className="mt-3">
      <p className="font-bold">איך היה?</p>
      <div className="mt-1 flex flex-wrap gap-2">{FEEL.map(([k, e, label]) => <button key={k} type="button" aria-pressed={mark === k} onClick={() => onMark(mark === k ? null : k)} className="ln-chip">{e} {label}</button>)}</div>
      {mark === 'hard' && !s.review && <p className="mt-2 text-sm font-bold">זה בסדר גמור. בפעם הבאה נישאר בשלב הזה ולא נמשיך הלאה.</p>}
    </div>
  </section>
}

export default function TutoringPlan() {
  const { search } = useLocation()
  const o = useMemo(() => decodePlan(search), [search])
  const key = planKey(o)
  const [marks, setMarks] = useState({})
  const [open, setOpen] = useState(null), [print, setPrint] = useState(null), [copied, setCopied] = useState(false)
  const base = useMemo(() => buildPlan(o), [o])
  const sessions = useMemo(() => withMarks(base, marks), [base, marks])
  useEffect(() => {
    const st = readStore()
    setMarks(st.plans?.[key] || {})
    if (o.skills.length) writeStore({ ...st, last: encodePlan(o) })
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  const seo = <SEO title="התוכנית שלכם — שיעורי עזר בבית" description="תוכנית שיעורי עזר אישית לילד: מפגש קצר בכל יום, עם תרגול באתר ודפים להדפסה." path="/tutoring/plan" noindex />
  if (!sessions.length) return <div className="mx-auto max-w-3xl px-4 py-8 text-center" dir="rtl">{seo}
    <h1 className="text-3xl font-black">עוד לא בחרתם במה לעזור</h1>
    <p className="mt-4"><Link to="/tutoring" className="ln-btn inline-block">לבניית תוכנית ←</Link></p>
  </div>

  const mark = (i, v) => {
    const next = { ...marks }
    if (v) next[i] = v; else delete next[i]
    setMarks(next)
    const st = readStore()
    writeStore({ ...st, plans: { ...(st.plans || {}), [key]: next } })
    setOpen(null)
    requestAnimationFrame(() => document.getElementById('session')?.scrollIntoView({ block: 'start' }))
  }
  const doneCount = sessions.filter(x => marks[x.index]).length
  const next = sessions.find(x => !marks[x.index])
  const shown = open === null ? next : sessions[open]
  const weeks = [...new Set(sessions.map(x => x.week))]
  const skills = [...new Map(sessions.map(x => [x.skill.id, x.skill])).values()]
  const share = async () => {
    const url = `${location.origin}/tutoring/plan?${encodePlan(o)}`
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2500) } catch { sharePage('/tutoring', 'tutoring_plan') }
  }

  return <div className="mx-auto max-w-3xl px-4 py-8" dir="rtl">
    {seo}
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'שיעורי עזר בבית', href: '/tutoring' }, { label: 'התוכנית שלנו' }]} />
    <h1 className="text-center text-3xl font-black sm:text-4xl">{planName(o)}</h1>
    <p className="mt-1 text-center">{o.days} ימים בשבוע · {o.minutes} דקות ביום{o.focus ? ' · עם הפסקות תנועה' : ''}</p>
    <div className="mt-3 flex flex-wrap justify-center gap-2">{skills.map(s => <Link key={s.id} to={`/tutoring/${s.id}`} className="rounded-full bg-amber-100 px-3 py-1 font-bold">{s.emoji} {s.title}</Link>)}</div>

    <div className="mt-4" aria-label="ההתקדמות">
      <p className="flex justify-between text-sm font-bold"><span>{doneCount} מתוך {sessions.length} מפגשים</span>{doneCount > 0 && <span>כל הכבוד 💪</span>}</p>
      <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.round((doneCount / sessions.length) * 100)}%` }} /></div>
    </div>

    <div className="mt-4 flex flex-wrap justify-center gap-2">
      <button type="button" className="ln-btn" onClick={() => setPrint({ plan: true })}>🖨️ הדפסת התוכנית</button>
      <button type="button" className="ln-btn alt" onClick={() => setPrint({ list: sessions, title: 'כל דפי העבודה' })}>📚 כל דפי העבודה</button>
      <button type="button" className="ln-btn alt" onClick={share}>{copied ? '✓ הקישור הועתק' : '🔗 שליחת התוכנית'}</button>
    </div>

    <div className="mt-6">
      {shown ? <Session key={shown.index} id="session" s={shown} o={o} mark={marks[shown.index]} onMark={v => mark(shown.index, v)} onPrint={() => setPrint({ list: [shown], title: shown.title })} />
        : <section className="ln-box text-center"><p className="text-3xl">🎉</p><h2 className="text-2xl font-black">סיימתם את התוכנית!</h2><p className="mt-1">מה עדיין קשה? אפשר לבנות תוכנית נוספת.</p><p className="mt-3"><Link to="/tutoring" className="ln-btn inline-block">תוכנית חדשה ←</Link></p></section>}
    </div>

    <h2 className="mt-8 text-2xl font-black">כל המפגשים</h2>
    {weeks.map(w => <section key={w} className="mt-3">
      <div className="flex items-center justify-between gap-2">
        {o.weeks > 1 ? <h3 className="text-lg font-black">שבוע {w}</h3> : <span />}
        <button type="button" className="text-sm font-bold underline" onClick={() => setPrint({ list: sessions.filter(x => x.week === w), title: `דפי העבודה של שבוע ${w}` })}>🖨️ דפי השבוע</button>
      </div>
      <ul className="mt-1 space-y-1">{sessions.filter(x => x.week === w).map(x => {
        const m = FEEL.find(f => f[0] === marks[x.index])
        return <li key={x.index}><button type="button" aria-current={shown?.index === x.index ? 'step' : undefined} onClick={() => { setOpen(x.index); document.getElementById('session')?.scrollIntoView({ block: 'start' }) }} className={`flex min-h-[48px] w-full items-center gap-2 rounded-xl border-2 px-3 py-1 text-right ${shown?.index === x.index ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
          <span aria-hidden="true">{m ? m[1] : '⬜'}</span>
          <span className="w-20 shrink-0 text-sm">{x.day}</span>
          <span className="min-w-0"><b>{x.title}</b><span className="block text-sm text-[var(--muted-foreground)]">{x.final ? 'כל הנושאים' : x.skill.title}</span></span>
        </button></li>
      })}</ul>
    </section>)}

    <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">כיתה {GRADE_NAMES[o.grade]} · ההתקדמות נשמרת בדפדפן הזה. <Link to="/tutoring" className="font-bold underline">לשינוי התוכנית</Link></p>

    {print?.plan && <PrintPreview title={planName(o)} onClose={() => setPrint(null)}><PlanSheet o={o} sessions={sessions} /></PrintPreview>}
    {print?.list && <PrintSessions sessions={print.list} o={o} title={print.title} onClose={() => setPrint(null)} />}
  </div>
}
