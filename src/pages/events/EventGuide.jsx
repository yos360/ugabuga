import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import { FONT } from '../../components/holidays/printKit'
import { eventGuide } from '../../data/eventGuides'

// One layout for the event guides in src/data/eventGuides.js (bachelorette, henna, surprise party,
// kids' venue): content sections, an optional quiz or venue-questions sheet, a checklist that works
// on screen (state only, nothing is saved or sent) and prints on A4, a call to action and FAQ.

const card = 'rounded-3xl border-2 border-[var(--border)] bg-white p-5 sketch-shadow-sm'
const sheet = { fontFamily: FONT, padding: '10mm', direction: 'rtl', color: '#111' }
const box = { border: '2px solid #333', borderRadius: 14, padding: 10, breakInside: 'avoid' }
const line = (k, h = 28) => <div key={k} style={{ borderBottom: '1.5px solid #888', height: h }} />
const checkbox = <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #333', borderRadius: 4, flexShrink: 0, marginTop: 2 }} />
const footer = path => <p style={{ fontSize: 11, marginTop: 10, color: '#555' }}>עוגה בוגה · ugabuga.co.il{path}</p>

function Section({ s }) {
  return <section id={s.id} className={`${card} mb-6 scroll-mt-20`} aria-labelledby={`${s.id}-h`}>
    <h2 id={`${s.id}-h`} className="mb-2 text-2xl font-bold">{s.emoji} {s.title}</h2>
    {s.intro && <p className="mb-3 text-lg text-[var(--muted-foreground)]">{s.intro}</p>}
    {s.kind === 'list' && <ul className="list-disc space-y-2 pr-6 text-lg">{s.items.map(t => <li key={t}>{t}</li>)}</ul>}
    {s.kind === 'steps' && <ol className="list-decimal space-y-2 pr-6 text-lg">{s.items.map(t => <li key={t}>{t}</li>)}</ol>}
    {s.kind === 'cards' && <div className="grid gap-3 sm:grid-cols-2">{s.items.map(c => <div key={c.title} className="rounded-2xl bg-amber-50 p-4">
      <h3 className="mb-1 text-lg font-bold">{c.title}</h3><p className="m-0">{c.text}</p>
    </div>)}</div>}
    {s.kind === 'table' && <div className="overflow-x-auto"><table className="w-full text-right">
      <thead><tr className="border-b-2 border-[var(--border)]">{s.cols.map(c => <th key={c} className="p-2">{c}</th>)}</tr></thead>
      <tbody>{s.rows.map(r => <tr key={r[0]} className="border-b border-[var(--border)] align-top">{r.map((c, i) => <td key={i} className={`p-2 ${i === 0 ? 'font-bold' : ''}`}>{c}</td>)}</tr>)}</tbody>
    </table></div>}
  </section>
}

function Checklist({ list }) {
  const total = list.groups.reduce((n, g) => n + g.items.length, 0)
  const [done, setDone] = useState({})
  const count = Object.values(done).filter(Boolean).length
  return <>
    <div className="mb-4 rounded-2xl bg-white p-3" aria-live="polite">
      <p className="m-0 font-bold">סימנתם {count} מתוך {total}</p>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.round(count / total * 100)}%` }} /></div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">{list.groups.map(g => <fieldset key={g.title} className="rounded-2xl border-2 border-[var(--border)] bg-white p-4">
      <legend className="px-1 text-xl font-bold"><span aria-hidden="true">{g.emoji} </span>{g.title}</legend>
      <ul className="m-0 list-none space-y-2 p-0">{g.items.map(t => <li key={t}><label className="flex min-h-[40px] cursor-pointer items-start gap-3 text-lg">
        <input type="checkbox" className="mt-1 h-6 w-6 shrink-0 accent-emerald-600" checked={!!done[t]} onChange={e => setDone(d => ({ ...d, [t]: e.target.checked }))} />
        <span className={done[t] ? 'text-slate-500 line-through' : ''}>{t}</span>
      </label></li>)}</ul>
    </fieldset>)}</div>
    <p className="mt-3 text-[var(--muted-foreground)]">הסימונים נשארים רק על המסך שלכם ונמחקים ברענון. להדפסה לחצו על הכפתור.</p>
  </>
}

function ChecklistSheet({ g }) {
  return <article className="buga-a4" dir="rtl" style={sheet}>
    <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px' }}>{g.emoji} {g.checklist.title}</h2>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {g.checklist.groups.map(x => <div key={x.title} style={box}>
        <p style={{ fontSize: 17, fontWeight: 800, margin: '0 0 6px' }}>{x.emoji} {x.title}</p>
        {x.items.map(t => <p key={t} style={{ fontSize: 13.5, margin: '0 0 6px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>{checkbox}{t}</p>)}
      </div>)}
      <div style={box}><p style={{ fontSize: 17, fontWeight: 800, margin: '0 0 6px' }}>📝 הערות</p>{[0, 1, 2, 3, 4].map(i => line(i))}</div>
    </div>
    {footer(g.path)}
  </article>
}

function QuizSheet({ g }) {
  return <article className="buga-a4" dir="rtl" style={sheet}>
    <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>{g.quiz.emoji} {g.quiz.title}</h2>
    <p style={{ fontSize: 13, margin: '4px 0 8px' }}>שם: ______________ · בכל שאלה כותבים תשובה אחת. מי שקרובה ביותר לתשובות של הכלה מנצחת!</p>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 14px' }}>
      {g.quiz.questions.map((q, i) => <div key={q} style={{ breakInside: 'avoid' }}>
        <p style={{ fontSize: 13.5, fontWeight: 700, margin: '4px 0 0' }}>{i + 1}. {q}</p>{line(i, 24)}
      </div>)}
    </div>
    {footer(g.path)}
  </article>
}

function QuestionsSheet({ g }) {
  return <article className="buga-a4" dir="rtl" style={sheet}>
    <h2 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>{g.questions.emoji} {g.questions.title}</h2>
    <p style={{ fontSize: 13, margin: '4px 0 8px' }}>שם המקום: ________________ · טלפון: ______________ · תאריך: ________</p>
    {g.questions.groups.map(x => <div key={x.title} style={{ ...box, marginBottom: 8 }}>
      <p style={{ fontSize: 15, fontWeight: 800, margin: '0 0 4px' }}>{x.title}</p>
      {x.items.map(t => <div key={t} style={{ breakInside: 'avoid', marginBottom: 2 }}>
        <p style={{ fontSize: 12.5, margin: 0, display: 'flex', gap: 8 }}>{checkbox}{t}</p>{line(t, 20)}
      </div>)}
    </div>)}
    {footer(g.path)}
  </article>
}

export default function EventGuide({ id }) {
  const g = eventGuide(id)
  const [print, setPrint] = useState(null)
  const extra = g.quiz ? { key: 'quiz', label: 'הדפסת החידון', title: g.quiz.title, C: QuizSheet } : g.questions ? { key: 'ask', label: 'הדפסת השאלות לבעל המקום', title: g.questions.title, C: QuestionsSheet } : null
  const nav = [...g.sections.map(s => [`#${s.id}`, `${s.emoji} ${s.title.split(':')[0]}`])]
  if (extra) nav.push([`#${extra.key}`, `${(g.quiz || g.questions).emoji} ${(g.quiz || g.questions).title.split(':')[0]}`])
  nav.push(['#checklist', '✅ רשימת בדיקה'])
  const Sheet = print === 'checklist' ? ChecklistSheet : extra?.C

  return <div className="mx-auto max-w-5xl px-4 py-8" dir="rtl">
    <SEO title={g.title} description={g.description} path={g.path} structuredData={faqSchema(g.faq)} />
    <Breadcrumbs items={g.crumbs} />
    <h1 className="mb-2 text-center text-4xl sm:text-5xl">{g.emoji} {g.h1}</h1>
    <p className="mx-auto mb-6 max-w-2xl text-center text-lg text-[var(--muted-foreground)]">{g.lead}</p>

    <nav className="mb-8 flex flex-wrap justify-center gap-2 text-base" aria-label="בעמוד הזה">
      {nav.map(([h, l]) => <a key={h} href={h} className="min-h-[44px] rounded-full border-2 border-[var(--border)] bg-white px-4 py-2 font-bold">{l}</a>)}
    </nav>

    {g.sections.map(s => <Section key={s.id} s={s} />)}

    {g.quiz && <section id="quiz" className={`${card} mb-6 scroll-mt-20 bg-pink-50`} aria-labelledby="quiz-h">
      <h2 id="quiz-h" className="mb-2 text-2xl font-bold">{g.quiz.emoji} {g.quiz.title}</h2>
      <p className="mb-3 text-lg">{g.quiz.intro}</p>
      <ol className="list-decimal space-y-1 pr-6 text-lg sm:columns-2">{g.quiz.questions.map(q => <li key={q}>{q}</li>)}</ol>
      <button type="button" onClick={() => setPrint('quiz')} className="mt-4 min-h-[48px] rounded-2xl bg-pink-600 px-5 font-bold text-white">🖨️ {extra.label}</button>
    </section>}

    {g.questions && <section id="ask" className={`${card} mb-6 scroll-mt-20 bg-sky-50`} aria-labelledby="ask-h">
      <h2 id="ask-h" className="mb-2 text-2xl font-bold">{g.questions.emoji} {g.questions.title}</h2>
      <p className="mb-3 text-lg">{g.questions.intro}</p>
      <div className="grid gap-3 sm:grid-cols-2">{g.questions.groups.map(x => <div key={x.title} className="rounded-2xl bg-white p-4">
        <h3 className="mb-1 text-lg font-bold">{x.title}</h3>
        <ul className="list-disc space-y-1 pr-5">{x.items.map(t => <li key={t}>{t}</li>)}</ul>
      </div>)}</div>
      <button data-print-main type="button" onClick={() => setPrint('ask')} className="mt-4 min-h-[48px] rounded-2xl bg-sky-700 px-5 font-bold text-white">🖨️ {extra.label}</button>
    </section>}

    <section id="checklist" className={`${card} mb-6 scroll-mt-20 bg-emerald-50`} aria-labelledby="cl-h">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 id="cl-h" className="m-0 text-2xl font-bold">✅ {g.checklist.title}</h2>
        <button data-print-main={g.questions ? undefined : ''} type="button" onClick={() => setPrint('checklist')} className="min-h-[48px] rounded-2xl bg-slate-900 px-5 font-bold text-white">🖨️ הדפסת הרשימה</button>
      </div>
      <Checklist list={g.checklist} />
    </section>

    <section className={`${card} mb-6 bg-amber-50 text-center`}>
      <h2 className="mb-2 text-2xl font-bold">{g.cta.emoji} {g.cta.title}</h2>
      <p className="mx-auto mb-3 max-w-xl text-lg">{g.cta.text}</p>
      <Link to={g.cta.to} className="inline-flex min-h-[48px] items-center rounded-2xl bg-slate-900 px-6 font-bold text-white">{g.cta.label} ←</Link>
    </section>

    <p className="mt-8 text-center text-lg">{g.links.map(([l, to], i) => <span key={to}>{i > 0 && ' · '}<Link className="font-bold underline" to={to}>{l}</Link></span>)}</p>

    {print && <PrintPreview title={print === 'checklist' ? g.checklist.title : extra.title} onClose={() => setPrint(null)}><Sheet g={g} /></PrintPreview>}

    <div className="mt-10"><SeoBody paragraphs={g.body} faq={g.faq} related={g.related} /></div>
  </div>
}
