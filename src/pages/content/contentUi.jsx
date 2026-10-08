import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import WobblyCard from '../../components/ui/WobblyCard'
import { nearby } from '../../utils/nearby'

// Shared building blocks of the content pages (animals, riddles, jokes, hunts, ABC).
export const Chip = ({ to, children, hl }) => <Link to={to} className={`wobbly-sm border-2 border-[var(--border)] ${hl ? 'bg-[var(--postit)]' : 'bg-white'} px-3 py-2 font-bold`}>{children}</Link>
export const Header = ({ emoji, title, intro }) => (
  <header className="text-center mb-6"><div className="text-6xl mb-2">{emoji}</div><h1 className="text-4xl md:text-5xl font-hand font-bold mb-2">{title}</h1>{intro && <p className="text-lg">{intro}</p>}</header>
)
export function Hub({ seo, crumbs, emoji, title, intro, items, base, sub }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 buga-fade-in">
      <SEO {...seo} />
      <Breadcrumbs items={crumbs} />
      <Header emoji={emoji} title={title} intro={intro} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(p => <Link key={p.slug} to={base + p.slug} className="block"><WobblyCard hover padding="p-4" className="h-full"><div className="text-3xl">{p.emoji}</div><h2 className="font-hand font-bold text-xl">{p.title}</h2>{sub && <p className="text-sm text-[var(--muted-foreground)]">{sub(p)}</p>}</WobblyCard></Link>)}
      </div>
    </div>
  )
}
export function More({ items, base, current, all, allLabel }) {
  return (
    <section className="mt-10"><h2 className="text-2xl font-hand font-bold mb-3">עוד</h2>
      <div className="flex flex-wrap gap-2">{nearby(items, x => x.slug === current, 12).map(o => <Chip key={o.slug} to={base + o.slug}>{o.emoji} {o.title || o.name}</Chip>)}<Chip to={all} hl>{allLabel} ←</Chip></div>
    </section>
  )
}

