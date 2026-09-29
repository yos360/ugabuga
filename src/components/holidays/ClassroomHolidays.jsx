import { Link } from 'react-router-dom'
import { HOLIDAYS_BY_DATE, whenOf, isOver } from '../../holidays/list'

// "חגים בכיתה ובגן" on the classroom hub: the next holidays, each with its pages.
// Built from the holiday configs, so a new holiday area appears here by itself.
export default function ClassroomHolidays({ max = 3 }) {
  const now = new Date()
  const next = HOLIDAYS_BY_DATE.filter(h => !isOver(h, now)).slice(0, max)
  return (
    <section aria-labelledby="class-holidays" className="mt-10">
      <h2 id="class-holidays" className="mb-4 text-center text-3xl font-black">🎉 חגים בכיתה ובגן</h2>
      <div className="grid gap-5 lg:grid-cols-3">
        {next.map(h => <div key={h.slug} className={`rounded-3xl border-2 border-slate-800 ${h.soft} p-6 shadow-[0_6px_0_rgba(20,30,60,.12)]`}>
          <Link to={h.base} className="flex items-center gap-3"><span className="text-5xl">{h.emoji}</span><span><span className="block text-2xl font-black">{h.name}</span><span className="text-[var(--muted-foreground)]">{whenOf(h)}</span></span></Link>
          <ul className="mt-3 space-y-1.5">{h.pages.slice(1).map(p => <li key={p.to}><Link to={p.to} className="block rounded-xl bg-white px-3 py-2 font-bold hover:bg-yellow-100">{p.emoji} {p.title || p.label}</Link></li>)}</ul>
          <Link to={h.base} className="mt-3 inline-block font-black underline decoration-dashed">לכל אזור {h.name} ←</Link>
        </div>)}
      </div>
      <p className="mt-3 text-center"><Link to="/holidays" className="font-bold underline">כל החגים ←</Link></p>
    </section>
  )
}
