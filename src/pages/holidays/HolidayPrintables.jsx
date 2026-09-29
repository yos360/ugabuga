import { useState } from 'react'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import HolidayShell from '../../components/holidays/HolidayShell'

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
        <button type="button" onClick={() => setPrint(c.list)} className="min-h-[52px] rounded-2xl bg-pink-600 px-8 text-xl font-bold text-white">🖨️ הדפיסו את כל {c.list.length} הדפים</button>
      </div>
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {c.list.map(item => <button key={item.id} type="button" onClick={() => setPrint([item])} aria-label={`הדפיסו: ${item.name}`}
          className="rounded-2xl border-2 border-[var(--border)] bg-white p-2 text-center sketch-shadow-sm transition-transform hover:-translate-y-1">
          <div className="aspect-[600/820]"><item.C /></div>
          <p className="mt-1 font-bold">{item.name}{item.age ? <span className="font-normal text-sm"> · {item.age}</span> : null}</p>
        </button>)}
      </div>
      <SeoBody paragraphs={c.body} faq={c.faq} related={c.related} />
      {print && <PrintPreview title={c.crumb + ' ל' + h.name} onClose={() => setPrint(null)}>{print.map(item => <article className="buga-a4" key={item.id}><div className="print-art"><item.C /></div></article>)}</PrintPreview>}
    </HolidayShell>
  )
}
