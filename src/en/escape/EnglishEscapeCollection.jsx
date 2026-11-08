import { Link } from 'react-router-dom'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import EscapeFrame, { Card, Pill } from './EscapeFrame'
import { EN_ESCAPE_ROOMS, EN_ROOM_BY_ID } from './rooms'
import { EN_ESCAPE_COLLECTIONS } from './collections'
import { ESCAPE_BASE, ESCAPE_TOPIC_META } from './catalog'

// Topic page: /en/tools/escape-rooms/topic/:slug (one route per slug, see routes.js).
export default function EnglishEscapeCollection({ slug }) {
  const c = EN_ESCAPE_COLLECTIONS[slug]
  const [, title, emoji] = ESCAPE_TOPIC_META.find(([s]) => s === slug)
  const path = `${ESCAPE_BASE}/topic/${slug}`
  const rooms = EN_ESCAPE_ROOMS.filter(c.filter)
  const listSchema = {
    '@context': 'https://schema.org', '@type': 'ItemList', name: title,
    itemListElement: rooms.map((r, i) => ({ '@type': 'ListItem', position: i + 1, url: `https://ugabuga.co.il${ESCAPE_BASE}/${r.id}`, name: r.title })),
  }
  return <EscapeFrame path={path} crumb={title} structuredData={[listSchema, faqSchema(c.faq)].filter(Boolean)}>
    <header className="text-center mb-8">
      <div className="text-6xl mb-2" aria-hidden="true">{emoji}</div>
      <h1 className="text-4xl md:text-5xl font-bold mb-3">{title}</h1>
      <p className="text-lg max-w-3xl mx-auto">{c.intro}</p>
      <p className="mt-2 opacity-75">{rooms.length} rooms · play online or print · free</p>
    </header>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {rooms.map(r => <Link key={r.id} to={`${ESCAPE_BASE}/${r.id}`} className="block">
        <Card className="h-full hover:bg-[var(--postit)]">
          <div className="text-4xl mb-2" aria-hidden="true">{r.emoji}</div>
          <h2 className="font-bold text-2xl mb-1">{r.title}</h2>
          <p className="mb-3"><span className="font-bold">Why it fits:</span> <span className="opacity-80">{r.hook}</span></p>
          <div className="flex flex-wrap gap-2"><Pill>{r.audience}</Pill><Pill tone="yellow">{r.difficulty}</Pill><Pill tone="blue">{r.duration}</Pill></div>
        </Card>
      </Link>)}
    </div>
    {c.choose?.length > 0 && <section className="mt-10 max-w-3xl">
      <h2 className="text-2xl font-bold mb-3">Which room should I choose?</h2>
      <ul className="space-y-2 text-lg">{c.choose.filter(([id]) => EN_ROOM_BY_ID[id]).map(([id, why]) => <li key={id}><Link to={`${ESCAPE_BASE}/${id}`} className="font-bold underline">{EN_ROOM_BY_ID[id].emoji} {EN_ROOM_BY_ID[id].title}</Link>: {why}</li>)}</ul>
    </section>}
    <Card className="mt-10 bg-[var(--postit)]">
      <h2 className="text-2xl font-bold mb-3">Tips for running it</h2>
      <ul className="list-disc pl-5 space-y-1 text-lg">{c.tips.map(t => <li key={t}>{t}</li>)}</ul>
    </Card>
    <div className="mt-10 max-w-3xl"><SeoBody lang="en" faq={c.faq} /></div>
    <section className="mt-10">
      <h2 className="text-2xl font-bold mb-3">More collections</h2>
      <div className="flex flex-wrap gap-2">
        <Link to={ESCAPE_BASE} className="rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">🔐 All escape rooms</Link>
        {ESCAPE_TOPIC_META.filter(([s]) => s !== slug).map(([s, t, e]) => <Link key={s} to={`${ESCAPE_BASE}/topic/${s}`} className="rounded-xl border-2 border-[var(--border)] bg-white px-3 py-2 font-bold">{e} {t}</Link>)}
      </div>
    </section>
  </EscapeFrame>
}
