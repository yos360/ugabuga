import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import HolidayShell from '../../components/holidays/HolidayShell'

// A page of grouped idea cards for any holiday — "what to do", costume ideas,
// mishloach-manot ideas… Content: h.lists[key] = { groups, crumb, title, desc, h1, sub, emoji, body, faq, related }.
export default function HolidayList({ h, listKey }) {
  const c = h.lists[listKey]
  const total = c.groups.reduce((n, g) => n + g.items.length, 0)
  return (
    <HolidayShell h={h} crumb={c.crumb}>
      <SEO title={c.title} description={c.desc.replace('{n}', total)} path={`${h.base}/${listKey}`} structuredData={faqSchema(c.faq)} />
      <h1 className="text-4xl sm:text-5xl text-center mb-2">{c.emoji || '💡'} {c.h1}</h1>
      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-8">{total} {c.sub}</p>
      {c.groups.map(g => <section key={g.group} className="mb-8">
        <h2 className="text-3xl font-bold mb-3">{g.group}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {g.items.map(it => <div key={it.t} className="wobbly-sm border-2 border-[var(--border)] bg-white p-4">
            <h3 className="text-xl font-bold mb-1">{it.t}</h3>
            <p className="text-[var(--muted-foreground)]">{it.d}</p>
            {it.need && <p className="mt-1 text-sm"><b>צריך:</b> {it.need}</p>}
            {it.to && <Link to={it.to} className="mt-2 inline-block font-bold text-[var(--pen)] underline decoration-dashed">לפתוח ←</Link>}
          </div>)}
        </div>
      </section>)}
      {c.tip && <p className="mb-8 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-4 text-lg">{c.tip}</p>}
      <SeoBody paragraphs={c.body} faq={c.faq} related={c.related} />
    </HolidayShell>
  )
}
