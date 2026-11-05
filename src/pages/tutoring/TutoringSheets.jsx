import { useEffect, useState } from 'react'
import PrintPreview from '../../components/ui/PrintPreview'
import { SheetPages } from '../planner/LessonSheets'
import { GRADE_NAMES, sessionParts } from '../../data/tutoring/plan'
import { loadSheet } from './resolve'

// Everything a tutoring plan prints: the plan itself as a table to hang on the fridge, and the worksheets of a
// session or a whole week: one guide page for the parent, then each worksheet with its answers. The sheets load
// before the preview opens, so print and preview show the same pages.
const PAGE = { padding: '10mm 12mm 24mm', textAlign: 'right' }
const Lines = ({ n }) => Array.from({ length: n }, (_, i) => <div key={i} className="mt-6 border-b border-slate-400" />)
const nameLine = <p className="flex justify-between text-sm"><span>שם: ______________</span><span>תאריך: ________</span></p>

export const planName = o => `${o.weeks === 1 ? 'תוכנית שבועית' : 'תוכנית חודשית'} לכיתה ${GRADE_NAMES[o.grade]}`

export function PlanSheet({ o, sessions }) {
  const weeks = [...new Set(sessions.map(x => x.week))]
  const skills = [...new Map(sessions.map(x => [x.skill.id, x.skill])).values()]
  return <article className="buga-flow" dir="rtl" style={PAGE}>
    <h2 className="text-2xl font-black">📅 {planName(o)}</h2>
    <p className="text-sm">{o.days} ימים בשבוע · {o.minutes} דקות ביום · {skills.map(s => s.title).join(' · ')}</p>
    {weeks.map(w => <section key={w} className="mt-3">
      {o.weeks > 1 && <h3 className="text-lg font-black">שבוע {w}</h3>}
      <table className="border-collapse text-sm" style={{ width: '100%' }}>
        <thead><tr><th className="border border-slate-400 p-1">✓</th><th className="border border-slate-400 p-1">יום</th><th className="border border-slate-400 p-1">מה לומדים</th><th className="border border-slate-400 p-1">איך היה?</th></tr></thead>
        <tbody>{sessions.filter(x => x.week === w).map(x => <tr key={x.index}>
          <td className="border border-slate-400 p-1 text-center" style={{ width: '7%' }}>☐</td>
          <td className="whitespace-nowrap border border-slate-400 p-1" style={{ width: '15%' }}>{x.day}</td>
          <td className="border border-slate-400 p-1"><b>{x.title}</b> · {x.final ? 'כל הנושאים' : x.skill.title}</td>
          <td className="whitespace-nowrap border border-slate-400 p-1 text-center" style={{ width: '16%' }}>😀 🙂 😣</td>
        </tr>)}</tbody>
      </table>
    </section>)}
    <h3 className="mt-4 text-lg font-black">💡 להורה</h3>
    <ul className="list-disc pr-5 text-sm">{skills.map(s => <li key={s.id}><b>{s.title}:</b> {s.tip}</li>)}
      <li>מסיימים כשעוד נעים. מפגש קצר שנגמר בהצלחה עדיף על מפגש ארוך שנגמר בדמעות.</li></ul>
  </article>
}

function Guide({ s, o }) {
  const t = sessionParts(o.minutes, o.focus)
  return <div className="mb-2 rounded-lg border border-slate-400 p-2 text-sm" style={{ breakInside: 'avoid' }}>
    <p className="font-black">{s.day}{o.weeks > 1 ? `, שבוע ${s.week}` : ''}: {s.title} ({s.final ? 'כל הנושאים' : s.skill.title})</p>
    <p><b>חימום ({t.warm} דק׳):</b> {s.warmup}</p>
    <p><b>לומדים יחד ({t.learn} דק׳):</b> {s.step.how}</p>
    <p><b>מתרגלים ({t.practice} דק׳):</b> דף העבודה של היום, או התרגול באתר.</p>
    {t.brk > 0 && <p><b>הפסקה ({t.brk} דק׳):</b> קמים, מתמתחים וקופצים קצת.</p>}
    <p><b>מסיימים ({t.end} דק׳):</b> {s.closer}</p>
  </div>
}

function ReadingSheet({ part }) {
  const t = part.text
  return <>
    <article className="buga-flow" dir="rtl" style={PAGE}>
      <h2 className="text-2xl font-black">{t.emoji} {t.title}</h2>
      {nameLine}
      <div className={`mt-2 ${t.level <= 2 ? 'text-xl leading-loose' : ''}`}>{t.text.map((x, i) => <p key={i} className="mt-2">{x}</p>)}</div>
      <ol className="mt-3 list-decimal space-y-2 pr-6">{t.q.map(([q, opts], i) => <li key={i}><b>{q}</b><p className="flex flex-wrap gap-x-5">{opts.map((a, j) => <span key={j}>◯ {a}</span>)}</p></li>)}</ol>
      {t.open?.slice(0, 1).map(([q]) => <div key={q} className="mt-3"><b>{q}</b><Lines n={2} /></div>)}
    </article>
    <article className="buga-flow" dir="rtl" style={PAGE}>
      <h2 className="text-xl font-black">תשובות: {t.title}</h2>
      <ol className="mt-2 list-decimal pr-6">{t.q.map(([q, opts, a], i) => <li key={i}>{q} <b>{opts[a]}</b></li>)}</ol>
      {t.open?.slice(0, 1).map(([q, a]) => <p key={q} className="mt-2"><b>{q}</b> {a}</p>)}
    </article>
  </>
}

function DictationSheet({ part }) {
  return <>
    <article className="buga-flow" dir="rtl" style={PAGE}>
      <h2 className="text-2xl font-black">✏️ הכתבה: {part.title}</h2>
      {nameLine}
      <ol className="mt-3 list-decimal pr-6">{part.words.map(w => <li key={w} className="mt-5 border-b border-slate-400">&nbsp;</li>)}</ol>
    </article>
    <article className="buga-flow" dir="rtl" style={PAGE}>
      <h2 className="text-xl font-black">להורה: המילים להקראה</h2>
      <ol className="mt-2 list-decimal pr-6 text-lg">{part.words.map(w => <li key={w}>{w}</li>)}</ol>
    </article>
  </>
}

function UnseenSheet({ part }) {
  const t = part.test
  return <>
    <article className="buga-flow" dir="ltr" lang="en" style={{ ...PAGE, textAlign: 'left' }}>
      <h2 className="text-2xl font-black">{t.title}</h2>
      {t.texts.map((x, i) => <section key={i}>{x.title && <h3 className="font-black">{x.title}</h3>}{(x.paragraphs || []).map((p, j) => <p key={j} className="mt-2">{p}</p>)}</section>)}
      <ol className="mt-3 list-decimal space-y-2 pl-6">{t.questions.map((q, i) => <li key={i}><b>{q.q}</b>{q.type === 'mc' ? <ol className="pl-5" style={{ listStyleType: 'lower-alpha' }}>{q.options.map(a => <li key={a}>{a}</li>)}</ol> : <Lines n={2} />}</li>)}</ol>
    </article>
    <article className="buga-flow" dir="rtl" style={PAGE}>
      <h2 className="text-xl font-black">תשובות: {t.title}</h2>
      <ol className="mt-2 list-decimal pr-6">{t.questions.map((q, i) => <li key={i} dir="ltr" style={{ textAlign: 'right' }}>{q.type === 'mc' ? q.options[q.answer] : q.answer}</li>)}</ol>
    </article>
  </>
}

function TaskSheet({ part, young }) {
  return <article className="buga-flow" dir="rtl" style={PAGE}>
    <h2 className="text-2xl font-black">דף משימה: {part.step.title}</h2>
    {nameLine}
    <p className="mt-3">{part.step.how}</p>
    <p className="mt-2"><b>באתר:</b> {part.label.replace(/^\S+\s/, '')}, <bdi dir="ltr">ugabuga.co.il{part.to}</bdi></p>
    {young ? <>
      <p className="mt-6 text-xl font-bold">הצלחתי! מציירים כאן כוכב לכל דבר שהלך טוב:</p>
      <div className="mt-3 rounded-xl border-2 border-dashed border-slate-400" style={{ height: '70mm' }} />
      <p className="mt-6 font-bold">להורה: מה עוד צריך לתרגל?</p><Lines n={2} />
    </> : <>
      <p className="mt-4 font-bold">מה למדתי היום?</p><Lines n={3} />
      <p className="mt-6 font-bold">מה עוד קשה לי?</p><Lines n={2} />
    </>}
  </article>
}

function PartSheet({ s, part, young }) {
  if (part.kind === 'reading') return <ReadingSheet part={part} />
  if (part.kind === 'dictation') return <DictationSheet part={part} />
  if (part.kind === 'unseen') return <UnseenSheet part={part} />
  if (part.kind === 'task') return <TaskSheet part={part} young={young} />
  const title = s.review ? `${s.title}: ${part.step.title}` : `דף עבודה: ${part.step.title}`
  return part.Math ? <part.Math title={title} sub={part.skill.title} items={part.items} /> : <SheetPages parts={[part]} title={title} sub={part.skill.title} />
}

// Loads the worksheets of the given sessions, then opens the print preview.
export function PrintSessions({ sessions, o, title, onClose }) {
  const [sheets, setSheets] = useState(null)
  useEffect(() => {
    let live = true
    Promise.all(sessions.map(s => loadSheet(s, o))).then(all => { if (live) setSheets(all) })
    return () => { live = false }
  }, [sessions, o])
  if (!sheets) return <p className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-5 py-2 font-bold text-white" role="status">מכינים את הדפים…</p>
  return <PrintPreview title={title} onClose={onClose} copies={false}>
    <article className="buga-flow" dir="rtl" style={PAGE}>
      <h2 className="text-2xl font-black">להורה: איך עובדים</h2>
      <p className="mb-2 text-sm">אחרי העמוד הזה נמצאים דפי העבודה, ואחרי כל דף התשובות שלו.</p>
      {sessions.map(s => <Guide key={s.index} s={s} o={o} />)}
    </article>
    {sessions.map((s, i) => sheets[i].map((part, j) => <PartSheet key={`${s.index}-${j}`} s={s} part={part} young={o.grade <= 2} />))}
  </PrintPreview>
}
