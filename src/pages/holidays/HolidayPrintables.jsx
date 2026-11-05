import { useState } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import HolidayShell from '../../components/holidays/HolidayShell'

// "What next" strip under the print grid: most visits to these pages ended right after the print (the tab row is
// at the top, far from the print button). Shows up to 4 other pages of the same holiday, never the current one.
function NextSteps({ h, current }) {
  const next = (h.pages || []).filter(p => p.to !== current && p.to !== h.base).slice(0, 4)
  if (!next.length) return null
  return (
    <section className="mb-10 rounded-2xl border-2 border-[var(--border)] bg-white p-4 text-center" aria-label={`עוד ל${h.name}`}>
      <h2 className="mb-3 text-2xl font-black">והלאה? עוד ל{h.name} 👇</h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {next.map(p => <Link key={p.to} to={p.to} className="flex min-h-[56px] items-center justify-center rounded-xl border-2 border-[var(--border)] px-2 py-2 text-base font-bold hover:bg-[var(--muted)]">{p.emoji} {p.label}</Link>)}
      </div>
      <p className="mt-3"><Link to={h.base} className="font-bold underline">לכל מה שיש ל{h.name} ←</Link></p>
    </section>
  )
}

// Coloring pages / worksheets for any holiday: a grid of A4 previews, print one or all.
// Content comes from h.printables[kind] = { list, crumb, title, h1, desc, sub, body, faq, related }.
export default function HolidayPrintables({ h, kind }) {
  const c = h.printables[kind]
  const [print, setPrint] = useState(null)
  return (
    <HolidayShell h={h} crumb={c.crumb}>
      <SEO title={c.title} description={c.desc} path={`${h.base}/${kind}`} structuredData={faqSchema(c.faq)} />
      <h1 className="text-4xl sm:text-5xl text-center mb-2">{c.h1}</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-5">{c.sub}</p>
      <div className="mb-6 text-center">
        <button data-print-main type="button" onClick={() => setPrint(c.list)} className="min-h-[52px] rounded-2xl bg-pink-600 px-8 text-xl font-bold text-white">🖨️ הדפיסו את כל {c.list.length} הדפים</button>
      </div>
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {c.list.map(item => <button key={item.id} type="button" onClick={() => setPrint([item])} aria-label={`הדפיסו: ${item.name}`}
          className="rounded-2xl border-2 border-[var(--border)] bg-white p-2 text-center sketch-shadow-sm transition-transform hover:-translate-y-1">
          <div className="aspect-[600/820]"><item.C /></div>
          <p className="mt-1 font-bold">{item.name}{item.age ? <span className="font-normal text-sm"> · {item.age}</span> : null}</p>
        </button>)}
      </div>
      <NextSteps h={h} current={`${h.base}/${kind}`} />
      <SeoBody paragraphs={c.body} faq={c.faq} related={c.related} />
      {print && <PrintPreview title={c.crumb + ' ל' + h.name} onClose={() => setPrint(null)}>{print.map(item => <article className="buga-a4" key={item.id}><div className="print-art"><item.C /></div></article>)}</PrintPreview>}
    </HolidayShell>
  )
}
