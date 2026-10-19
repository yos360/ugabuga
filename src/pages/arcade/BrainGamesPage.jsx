import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { faqSchema } from '../../components/ui/SeoBody'
import { BRAIN_PAGES } from '../../data/brainPages.js'
import { BRAIN_GAMES } from '../../arcade/brainRegistry.js'
import '../../arcade/arcade.css'

export default function BrainGamesPage({ topic = 'home' }) {
  const content = BRAIN_PAGES[topic]
  const games = content.games.map(slug => BRAIN_GAMES.find(game => game.slug === slug))
  const list = { '@context': 'https://schema.org', '@type': 'ItemList', name: content.title, itemListElement: games.map((game, i) => ({ '@type': 'ListItem', position: i + 1, name: game.name, url: `https://ugabuga.co.il/online-games/${game.slug}` })) }
  return <article className="arc-page" dir="rtl">
    <SEO title={content.title} description={content.description} path={content.path} structuredData={[list, faqSchema(content.faq)]} />
    <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, ...(topic === 'home' ? [] : [{ label: 'משחקי חשיבה', href: '/brain-games' }]), { label: content.title }]} />
    <header className="arc-hero"><h1>🧠 {content.title}</h1><p>{content.intro}</p></header>
    <div className="arc-grid">{games.map(game => <Link key={game.slug} to={`/online-games/${game.slug}`} className="arc-card" style={{ '--game-color': game.color }}><span className="arc-card-art" aria-hidden="true">{game.emoji}</span><h2>{game.name}</h2><p>{game.tagline}</p><span className="arc-play-chip">להוראות ולמשחק</span></Link>)}</div>
    {content.sections.map(([title, text]) => <section className="arc-box" key={title} style={{ maxWidth: 880, margin: '24px auto', lineHeight: 1.85 }}><h2>{title}</h2><p>{text}</p></section>)}
    <section className="arc-box arc-faq" style={{ maxWidth: 880, margin: '24px auto' }}><h2>שאלות נפוצות</h2>{content.faq.map(({ q, a }) => <div key={q}><h3>{q}</h3><p>{a}</p></div>)}</section>
    <nav className="arc-related" aria-label="מדריכי חשיבה נוספים">{Object.entries(BRAIN_PAGES).filter(([key]) => key !== topic).map(([key, page]) => <Link key={key} to={page.path}>{page.title}</Link>)}<Link to="/online-games">כל משחקי האונליין</Link></nav>
  </article>
}
