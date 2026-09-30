import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import WobblyCard from '../../components/ui/WobblyCard'
import Badge from '../../components/ui/Badge'
import { ESCAPE_ROOMS } from '../../data/escapeRoomsExpanded'
import { ESCAPE_COLLECTIONS } from '../../data/escapeCollections'
import NotFound from '../NotFound'

export default function EscapeCollection() {
  const { slug } = useParams()
  const c = ESCAPE_COLLECTIONS[slug]
  if (!c) return <NotFound />
  const rooms = ESCAPE_ROOMS.filter(c.filter)
  const schema = {
    '@context': 'https://schema.org', '@type': 'ItemList', name: c.title,
    itemListElement: rooms.map((r, i) => ({ '@type': 'ListItem', position: i + 1, url: 'https://ugabuga.co.il/tools/escape-rooms/' + r.id, name: r.title })),
  }
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title={c.title} description={c.description} path={'/tools/escape-rooms/topic/' + slug} structuredData={schema} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חדרי בריחה', href: '/tools/escape-rooms' }, { label: c.title }]} />
      <header className="text-center mb-8">
        <div className="text-6xl mb-2">{c.emoji}</div>
        <h1 className="text-4xl md:text-5xl font-hand font-bold mb-3">{c.title}</h1>
        <p className="text-lg max-w-3xl mx-auto">{c.intro}</p>
        <p className="mt-2 text-[var(--muted-foreground)]">{rooms.length} חדרים · לשחק באתר או להדפיס · חינם</p>
      </header>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rooms.map((r) => (
          <Link key={r.id} to={'/tools/escape-rooms/' + r.id} className="block">
            <WobblyCard hover padding="p-5" className="h-full">
              <div className="text-4xl mb-2">{r.emoji}</div>
              <h2 className="font-hand font-bold text-2xl mb-1">{r.title}</h2>
              <p className="text-[var(--muted-foreground)] mb-3">{r.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge>{r.audience}</Badge>
                {r.difficulty && <Badge color="yellow">{r.difficulty}</Badge>}
                {r.duration && <Badge color="blue">{r.duration}</Badge>}
              </div>
            </WobblyCard>
          </Link>
        ))}
      </div>
      <WobblyCard hover={false} padding="p-6" className="mt-10 bg-[var(--postit)]">
        <h2 className="text-2xl font-hand font-bold mb-3">טיפים להפעלה</h2>
        <ul className="list-disc pr-5 space-y-1 text-lg">{c.tips.map((t) => <li key={t}>{t}</li>)}</ul>
      </WobblyCard>
      <section className="mt-10">
        <h2 className="text-2xl font-hand font-bold mb-3">עוד אוספים</h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ESCAPE_COLLECTIONS).filter(([k]) => k !== slug).map(([k, x]) => <Link key={k} to={'/tools/escape-rooms/topic/' + k} className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">{x.emoji} {x.title}</Link>)}
        </div>
      </section>
    </div>
  )
}
