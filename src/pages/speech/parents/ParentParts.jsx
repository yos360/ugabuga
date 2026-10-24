import { Link } from 'react-router-dom'

// Small building blocks shared by the /speech/parents pages.

const PARENT_PAGES = [
  { href: '/speech/parents/language-milestones', label: '🗣️ התפתחות שפה לפי גיל' },
  { href: '/speech/parents/sound-acquisition', label: '🔤 גיל רכישת הצלילים' },
]

export function Section({ id, title, children, intro }) {
  return <section id={id} className="mt-12 scroll-mt-24">
    <h2 className="text-2xl font-black sm:text-3xl">{title}</h2>
    {intro && <p className="mt-2 leading-relaxed text-[var(--foreground)]/80">{intro}</p>}
    <div className="mt-4">{children}</div>
  </section>
}

export const Bullets = ({ items, className = '' }) => <ul className={`space-y-1.5 ${className}`}>
  {items.map(t => <li key={t} className="mr-5 list-disc leading-relaxed">{t}</li>)}
</ul>

export function OnThisPage({ items }) {
  return <nav aria-label="בעמוד הזה" className="mt-6 flex flex-wrap justify-center gap-2">
    {items.map(([id, label]) => <a key={id} href={`#${id}`} className="rounded-full border-2 border-[var(--border)] bg-[var(--card)] px-3 py-1 text-sm font-bold hover:bg-[var(--postit)]">{label}</a>)}
  </nav>
}

export function SiblingNav({ path }) {
  return <nav aria-label="מידע נוסף להורים" className="mt-4 flex flex-wrap justify-center gap-2">
    {PARENT_PAGES.map(p => p.href === path
      ? <span key={p.href} aria-current="page" className="rounded-full border-2 border-[var(--border)] bg-[var(--yellow)] px-4 py-1.5 font-bold">{p.label}</span>
      : <Link key={p.href} to={p.href} className="rounded-full border-2 border-[var(--border)] bg-[var(--card)] px-4 py-1.5 font-bold hover:bg-[var(--muted)]/30">{p.label}</Link>)}
  </nav>
}

export function Sources({ list }) {
  return <section id="sources" className="mt-12 scroll-mt-24">
    <h2 className="text-2xl font-black">מקורות</h2>
    <p className="mt-1 text-sm text-[var(--muted-foreground)]">התוכן נכתב על בסיס המקורות האלה ומוצג בטווחים מעוגלים. מקורות שונים מגדירים "גיל רכישה" בדרכים שונות, ולכן הגילים בהם אינם זהים.</p>
    <ol className="mt-3 list-decimal space-y-1.5 pr-6 text-[15px] leading-relaxed">
      {list.map(s => <li key={s.title}>{s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">{s.title}</a> : s.title}</li>)}
    </ol>
  </section>
}
