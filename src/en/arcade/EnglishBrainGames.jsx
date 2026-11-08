import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { faqSchema } from '../../components/ui/SeoBody'
import { BRAIN_GAMES } from '../../arcade/brainRegistry.js'
import { ARCADE_EN } from './gamesEn.js'
import { BRAIN_PAGES_EN } from './brainPagesEn.js'
import '../../arcade/arcade.css'

// English brain-game guides: /en/brain-games and /en/brain-games/<topic>.
export default function EnglishBrainGames({ topic = 'home' }) {
  const content = BRAIN_PAGES_EN[topic] || BRAIN_PAGES_EN.home
  const games = content.games.map(slug => {
    const he = BRAIN_GAMES.find(g => g.slug === slug), en = ARCADE_EN[slug]
    return he && en ? { slug, color: he.color, emoji: en.emoji, name: en.name, tagline: en.tagline } : null
  }).filter(Boolean)
  const list = { '@context': 'https://schema.org', '@type': 'ItemList', name: content.title, itemListElement: games.map((g, i) => ({ '@type': 'ListItem', position: i + 1, name: g.name, url: `https://ugabuga.co.il/en/online-games/${g.slug}` })) }
  return (
    <article className="arc-page" dir="ltr">
      <SEO lang="en" title={content.title} description={content.description} path={content.path} counterpartPath={content.counterpart} structuredData={[list, faqSchema(content.faq)]} />
      <Breadcrumbs lang="en" items={[{ label: 'Home', href: '/en' }, ...(topic === 'home' ? [] : [{ label: 'Brain games', href: '/en/brain-games' }]), { label: content.title }]} />
      <header className="arc-hero"><h1>{content.emoji} {content.title}</h1><p>{content.intro}</p></header>
      <div className="arc-grid">
        {games.map(g => (
          <Link key={g.slug} to={`/en/online-games/${g.slug}`} className="arc-card" style={{ '--game-color': g.color }}>
            <span className="arc-card-art" aria-hidden="true">{g.emoji}</span><h2>{g.name}</h2><p>{g.tagline}</p><span className="arc-play-chip">How to play and play</span>
          </Link>
        ))}
      </div>
      {content.sections.map(([title, text]) => <section className="arc-box" key={title} style={{ maxWidth: 880, margin: '24px auto', lineHeight: 1.85 }}><h2>{title}</h2><p>{text}</p></section>)}
      <section className="arc-box arc-faq" style={{ maxWidth: 880, margin: '24px auto' }}><h2>Frequently asked questions</h2>{content.faq.map(({ q, a }) => <div key={q}><h3>{q}</h3><p>{a}</p></div>)}</section>
      <nav className="arc-related" aria-label="More thinking guides">
        {Object.entries(BRAIN_PAGES_EN).filter(([key]) => key !== topic).map(([key, page]) => <Link key={key} to={page.path}>{page.title}</Link>)}
        <Link to="/en/online-games">All online games</Link>
      </nav>
    </article>
  )
}
