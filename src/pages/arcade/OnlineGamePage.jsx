import { useCallback, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { faqSchema } from '../../components/ui/SeoBody'
import NotFound from '../NotFound'
import { ARCADE, arcadeGame } from '../../arcade/registry'
import ArcadeStage from '../../arcade/ArcadeStage'
import { shareGameText } from '../../arcade/stage'
import { shareOnWhatsApp } from '../../utils/share'
import { WhatsAppIcon } from '../../components/layout/WhatsAppShare'
import '../../arcade/arcade.css'

// /online-games/:slug — the page explains the game (for parents and for Google);
// "play" opens the full-screen stage on top (#play in the URL, so Back closes it).
export default function OnlineGamePage() {
  const { slug } = useParams()
  const game = arcadeGame(slug)
  const { hash } = useLocation()
  const navigate = useNavigate()
  const pushed = useRef(false)
  const playing = !!game && hash === '#play'

  useEffect(() => { if (!playing) pushed.current = false }, [playing])
  // No automatic full screen: the browser's "swipe to exit" banner covers the game. The ⛶ button is there for whoever wants it.
  const open = () => {
    pushed.current = true
    navigate({ hash: '#play' })
  }
  const close = useCallback(() => {
    if (pushed.current) navigate(-1)
    else navigate({ hash: '' }, { replace: true })
  }, [navigate])

  if (!game) return <NotFound />
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: game.name,
    description: game.description,
    url: `https://ugabuga.co.il/online-games/${game.slug}`,
    inLanguage: 'he',
    genre: game.genre || 'Puzzle',
    gamePlatform: ['Web browser', 'Mobile', 'Desktop'],
    applicationCategory: 'Game',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'ILS' },
    publisher: { '@type': 'Organization', name: 'UGABUGA' },
  }
  const others = ARCADE.filter(g => g.slug !== game.slug)
  return (
    <div className="arc-page" dir="rtl" style={{ '--game-color': game.color }}>
      <SEO title={game.seoTitle} description={game.description} path={`/online-games/${game.slug}`} structuredData={game.faq ? [schema, faqSchema(game.faq)] : schema} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקי אונליין', href: '/online-games' }, { label: game.name }]} />
      <header className="arc-hero">
        <h1>{game.emoji} {game.h1 || game.name}</h1>
      </header>
      <section className="arc-play-hero">
        <div className="arc-play-art" aria-hidden="true">{game.emoji}</div>
        <div>
          <p>{game.description}</p>
          <button type="button" className="arc-play-btn" onClick={open}>▶ שחקו עכשיו</button>
          <div className="arc-meta">
            <span>🎂 גיל {game.ages}</span><span>📱 טלפון ומחשב</span><span>🆓 חינם, בלי הרשמה</span>
          </div>
        </div>
      </section>
      <div className="arc-info">
        <section className="arc-box">
          <h2>איך משחקים?</h2>
          <ol>{game.how.map(s => <li key={s}>{s}</li>)}</ol>
        </section>
        <section className="arc-box">
          <h2>טיפים לאלופים</h2>
          <ul>{game.tips.map(s => <li key={s}>{s}</li>)}</ul>
          <h2 style={{ marginTop: 16 }}>מה זה מפתח?</h2>
          <ul>{game.skills.map(s => <li key={s}>{s}</li>)}</ul>
        </section>
      </div>
      {game.faq && (
        <section className="arc-box arc-faq">
          <h2>שאלות נפוצות</h2>
          {game.faq.map(f => <div key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>)}
        </section>
      )}
      {game.related && (
        <p className="arc-related">
          <span>עוד באותו נושא:</span>
          {game.related.map(r => <Link key={r.href} to={r.href}>{r.label}</Link>)}
        </p>
      )}
      <p style={{ textAlign: 'center', margin: '0 0 28px' }}>
        <button type="button" className="arc-share" style={{ height: 50, fontSize: 18, padding: '0 22px' }} onClick={() => shareOnWhatsApp(shareGameText(game))}>
          <WhatsAppIcon size={22} /> שתפו את המשחק בוואטסאפ
        </button>
      </p>
      <section className="arc-more">
        <h2>עוד משחקי אונליין</h2>
        <div className="arc-grid">
          {others.map(g => (
            <Link key={g.slug} to={`/online-games/${g.slug}`} className="arc-card" style={{ '--game-color': g.color }}>
              <span className="arc-card-art" aria-hidden="true" style={{ height: 100, fontSize: 52 }}>{g.emoji}</span>
              <h2>{g.name}</h2>
              <p>{g.tagline}</p>
            </Link>
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: 20 }}><Link to="/online-games" className="underline font-bold">לכל משחקי האונליין ←</Link></p>
      </section>
      {playing && <ArcadeStage game={game} onClose={close} />}
    </div>
  )
}
