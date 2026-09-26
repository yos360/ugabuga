import { Link } from 'react-router-dom'

// The printables card, shared by /printables and the classroom hub so the same
// sheet looks the same wherever it appears.
export const printableHref = cat => cat.href || (cat.slug === 'mandalas' ? '/printables/mandalas' : cat.generated ? '/printables/activity/' + cat.slug : '/printables/' + cat.slug)

export default function PrintableCard({ cat, index = 0 }) {
  return <Link to={printableHref(cat)}
    className={`wobbly group relative flex flex-col border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow transition-all duration-150 hover:-translate-y-1 hover:rotate-1 ${index % 2 ? 'rotate-[0.5deg]' : '-rotate-[0.5deg]'}`}>
    <div className="flex items-center gap-3 mb-2">
      <span className="text-3xl">{cat.emoji}</span>
      <div>
        <h3 className="font-display text-xl font-bold">{cat.title}</h3>
        <span className="wobbly-sm inline-flex items-center border border-[var(--border)] bg-[var(--postit)] px-2 py-0.5 text-xs font-bold">{cat.count}{typeof cat.count === 'number' ? ' דפים' : ''}</span>
      </div>
    </div>
    <p className="text-sm text-[var(--muted-foreground)] flex-1">{cat.desc}</p>
    <span className="mt-3 font-display text-base font-bold text-[var(--pen)] underline decoration-dashed">צפייה והדפסה ←</span>
  </Link>
}
