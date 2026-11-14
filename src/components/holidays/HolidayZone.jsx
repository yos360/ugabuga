import { Link } from 'react-router-dom'

// "אזור החג" — the top of a holiday hub: one row per kind of thing people come for (do together,
// games, learning, for the class…), each with its best pages. Used by Hanukkah and by every hub
// that has `hub.zones` (src/holidays/*.jsx).
// zones: [{ emoji, title, color, links: [[emoji, label, blurb, to], …] }]
export default function HolidayZone({ zones, label }) {
  return <nav aria-label={label} className="mb-10 space-y-5">
    {zones.map((z, i) => <section key={z.title} aria-labelledby={`hz-${i}`} className={`rounded-3xl border-2 border-[var(--border)] ${z.color} p-4 sm:p-5`}>
      <h2 id={`hz-${i}`} className="mb-3 text-2xl font-black"><span aria-hidden="true">{z.emoji} </span>{z.title}</h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {z.links.map(([emoji, text, blurb, to]) => <li key={to}>
          <Link to={to} className="flex h-full min-h-[64px] items-start gap-3 rounded-2xl border-2 border-[var(--border)] bg-white p-3 transition-transform hover:-translate-y-0.5">
            <span aria-hidden="true" className="text-3xl leading-none">{emoji}</span>
            <span><b className="block text-lg leading-tight">{text}</b><span className="text-sm text-[var(--muted-foreground)]">{blurb}</span></span>
          </Link>
        </li>)}
      </ul>
    </section>)}
  </nav>
}
