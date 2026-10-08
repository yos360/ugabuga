import { Link, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import { faqSchema } from '../../components/ui/SeoBody'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import WobblyCard from '../../components/ui/WobblyCard'
import Badge from '../../components/ui/Badge'
import { ESCAPE_ROOMS } from '../../data/escapeRoomsExpanded'
import { ESCAPE_COLLECTIONS, ESCAPE_TOPIC_GUIDES } from '../../data/escapeCollections'
import { ESCAPE_ROOM_GUIDES } from '../../data/escapeRoomGuides'
import NotFound from '../NotFound'

export default function EscapeCollection() {
  const { slug } = useParams()
  const c = ESCAPE_COLLECTIONS[slug]
  if (!c) return <NotFound />
  const g = ESCAPE_TOPIC_GUIDES[slug] || {}
  const rooms = ESCAPE_ROOMS.filter(c.filter)
  const byId = Object.fromEntries(ESCAPE_ROOMS.map((r) => [r.id, r]))
  const listSchema = {
    '@context': 'https://schema.org', '@type': 'ItemList', name: c.title,
    itemListElement: rooms.map((r, i) => ({ '@type': 'ListItem', position: i + 1, url: 'https://ugabuga.co.il/tools/escape-rooms/' + r.id, name: r.title })),
  }
  // Each card explains why the room fits THIS collection (skills for learning pages, the hook for party pages)
  // instead of repeating the room's own meta description on every collection it belongs to.
  const fitOf = (r) => ESCAPE_ROOM_GUIDES[r.id]?.[g.fit || 'hook'] || r.description
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 buga-fade-in">
      <SEO title={c.title} description={c.description} path={'/tools/escape-rooms/topic/' + slug} structuredData={[listSchema, faqSchema(g.faq)].filter(Boolean)} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'חדרי בריחה', href: '/tools/escape-rooms' }, { label: c.title }]} />
      <header className="text-center mb-8">
        <div className="text-6xl mb-2">{c.emoji}</div>
        <h1 className="text-4xl md:text-5xl font-hand font-bold mb-3">{c.title}</h1>
        <p className="text-lg max-w-3xl mx-auto">{c.intro}</p>
        <p className="mt-2 text-[var(--muted-foreground)]">{rooms.length} חדרים · לשחק באתר או להדפיס · חינם</p>
      </header>
      {g.more?.length > 0 && <div className="max-w-3xl mx-auto mb-10 space-y-3 leading-relaxed text-[var(--foreground)]/85">{g.more.map((p) => <p key={p}>{p}</p>)}</div>}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rooms.map((r) => (
          <Link key={r.id} to={'/tools/escape-rooms/' + r.id} className="block">
            <WobblyCard hover padding="p-5" className="h-full">
              <div className="text-4xl mb-2">{r.emoji}</div>
              <h2 className="font-hand font-bold text-2xl mb-1">{r.title}</h2>
              <p className="mb-3"><span className="font-bold">{g.fitLabel || 'למה הוא מתאים'}:</span> <span className="text-[var(--muted-foreground)]">{fitOf(r)}</span></p>
              <div className="flex flex-wrap gap-2">
                <Badge>{r.audience}</Badge>
                {r.difficulty && <Badge color="yellow">{r.difficulty}</Badge>}
                {r.duration && <Badge color="blue">{r.duration}</Badge>}
              </div>
            </WobblyCard>
          </Link>
        ))}
      </div>
      {g.choose?.length > 0 && (
        <section className="mt-10 max-w-3xl">
          <h2 className="text-2xl font-hand font-bold mb-3">איזה חדר לבחור?</h2>
          <ul className="space-y-2 text-lg">{g.choose.filter(([id]) => byId[id]).map(([id, why]) => (
            <li key={id}><Link to={'/tools/escape-rooms/' + id} className="font-bold underline">{byId[id].emoji} {byId[id].title}</Link> — {why}</li>
          ))}</ul>
        </section>
      )}
      <WobblyCard hover={false} padding="p-6" className="mt-10 bg-[var(--postit)]">
        <h2 className="text-2xl font-hand font-bold mb-3">טיפים להפעלה</h2>
        <ul className="list-disc pr-5 space-y-1 text-lg">{c.tips.map((t) => <li key={t}>{t}</li>)}</ul>
      </WobblyCard>
      {g.faq?.length > 0 && (
        <section className="mt-10 max-w-3xl">
          <h2 className="text-2xl font-hand font-bold mb-3">שאלות נפוצות</h2>
          <div className="space-y-4">{g.faq.map((f) => <div key={f.q}><p className="font-bold">{f.q}</p><p className="leading-relaxed text-[var(--foreground)]/85">{f.a}</p></div>)}</div>
        </section>
      )}
      <section className="mt-10">
        <h2 className="text-2xl font-hand font-bold mb-3">עוד אוספים</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/tools/escape-rooms" className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">🔐 כל חדרי הבריחה</Link>
          {Object.entries(ESCAPE_COLLECTIONS).filter(([k]) => k !== slug).map(([k, x]) => <Link key={k} to={'/tools/escape-rooms/topic/' + k} className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">{x.emoji} {x.title}</Link>)}
        </div>
      </section>
    </div>
  )
}
