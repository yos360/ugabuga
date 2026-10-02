import { useEffect, useState } from 'react'
import { daysUntil } from '../../utils/israelDate'
import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import HolidayShell from '../../components/holidays/HolidayShell'
import { currentInfo } from '../../holidays/list'

// The main page of any holiday area, built from the config: hero with countdown,
// a card per page, an optional "how to" box, SEO copy. Content: h.info + h.hub.
const CARD_COLORS = ['bg-yellow-100', 'bg-pink-100', 'bg-blue-100', 'bg-green-100', 'bg-orange-100', 'bg-purple-100', 'bg-lime-100']

function Countdown({ h }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(t) }, [])
  const o = currentInfo(h, new Date(now)), start = new Date(o.start).getTime(), end = new Date(o.end).getTime()
  const days = daysUntil(start, now)
  const w = h.hub.countdown
  return <p className="text-3xl font-bold">{now >= end ? w.after : now >= start ? w.during : days <= 0 ? `הערב החג מתחיל! ${h.emoji}` : days === 1 ? w.tomorrow : `עוד ${days} ימים ${w.before}`}</p>
}

export default function HolidayHub({ h }) {
  const c = h.hub
  return (
    <HolidayShell h={h}>
      <SEO title={c.title} description={c.desc} path={h.base} structuredData={faqSchema(c.faq)} />
      <div className={`mb-8 rounded-3xl border-2 border-slate-800 bg-gradient-to-b ${c.gradient} p-6 text-center text-white sketch-shadow`}>
        <p className="text-6xl mb-2" aria-hidden="true">{h.emoji}</p>
        <h1 className="text-4xl sm:text-5xl mb-3 text-white">{c.h1}</h1>
        <Countdown h={h} />
        <p className="mt-2 opacity-90">{currentInfo(h).datesText}</p>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {h.pages.slice(1).map((p, i) => <Link key={p.to} to={p.to} className={`wobbly flex flex-col border-2 border-[var(--border)] ${CARD_COLORS[i % CARD_COLORS.length]} p-5 sketch-shadow transition-transform hover:-translate-y-1`}>
          <span className="mb-1 text-4xl" aria-hidden="true">{p.emoji}</span>
          <h2 className="text-2xl font-bold">{p.title || p.label}</h2>
          <p className="flex-1 text-[var(--muted-foreground)]">{p.blurb}</p>
          <span className="mt-2 font-bold underline decoration-dashed">כניסה ←</span>
        </Link>)}
        {(c.extraCards || []).map((p, i) => <Link key={p.to} to={p.to} className={`wobbly flex flex-col border-2 border-[var(--border)] ${CARD_COLORS[(i + 5) % CARD_COLORS.length]} p-5 sketch-shadow transition-transform hover:-translate-y-1`}>
          <span className="mb-1 text-4xl" aria-hidden="true">{p.emoji}</span>
          <h2 className="text-2xl font-bold">{p.label}</h2>
          <p className="flex-1 text-[var(--muted-foreground)]">{p.blurb}</p>
          <span className="mt-2 font-bold underline decoration-dashed">כניסה ←</span>
        </Link>)}
      </div>

      {c.box && <section className="mb-10 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--postit)] p-5">
        <h2 className="text-2xl font-bold mb-3">{c.box.title}</h2>
        {c.box.ordered
          ? <ol className="list-decimal space-y-2 pr-6">{c.box.items.map((t, i) => <li key={i}>{t}</li>)}</ol>
          : <ul className="list-disc space-y-2 pr-6">{c.box.items.map((t, i) => <li key={i}>{t}</li>)}</ul>}
        {c.box.note && <p className="mt-3 text-sm text-[var(--muted-foreground)]">{c.box.note}</p>}
      </section>}

      <SeoBody paragraphs={c.body} faq={c.faq} related={c.related} />
    </HolidayShell>
  )
}
