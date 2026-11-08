import { lazy, useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { faqSchema } from '../../components/ui/SeoBody'
import { EnglishNotFound } from '../EnglishLayout'
import { arcadeGame } from '../../arcade/registry'
import ArcadeStage from '../../arcade/ArcadeStage'
import { shareGameText } from '../../arcade/stage'
import { shareOnFacebook, shareOnWhatsApp } from '../../utils/share'
import { WhatsAppIcon } from '../../components/layout/WhatsAppShare'
import '../../arcade/arcade.css'
import '../../arcade/arcade-ltr.css'
import { ARCADE_EN, ARCADE_EN_GROUPS } from './gamesEn.js'
import { BOARD_PAGES } from './boardPages.js'
import { SUDOKU_PAGES } from './sudokuPages.js'

// The English side of the online games: /en/online-games (hub) and /en/online-games/<slug> (one page per game).
// Page copy lives in ./meta/*.js; the games themselves are the Hebrew site's components, rendered with lang="en".
// Games whose Hebrew component has no English mode get an English twin from ./games.
const EN_COMPONENTS = {
  'find-differences': lazy(() => import('./games/SpotDiffEn')),
  'word-guess': lazy(() => import('./games/WordGuessEn')),
}
const withHe = slug => {
  const en = ARCADE_EN[slug], he = arcadeGame(slug)
  return en && he ? { ...he, ...en, slug, ...(EN_COMPONENTS[slug] ? { component: EN_COMPONENTS[slug] } : {}) } : null
}

const FAQ = [
  { q: 'Are the games really free?', a: 'Yes. Every online game is free, with no download, no sign-up and no ads inside the game. They open right in your browser, on a phone or a computer.' },
  { q: 'Which games suit young children?', a: 'From age 5 or 6: memory, ball sort and the 4x4 sudoku. From age 8: traffic jam, 2048, the sliding puzzle and minesweeper. Every game shows its recommended age, and many have hints or an undo button.' },
  { q: 'Can two people play on the same screen?', a: 'Yes. Four in a Row, Tic-Tac-Toe, chess, checkers and backgammon can be played by two people on one phone or computer, or against the computer.' },
]

export function EnglishArcadeGame({ params }) {
  const slug = params?.slug
  const game = withHe(slug)
  const { hash } = useLocation()
  const navigate = useNavigate()
  const pushed = useRef(false)
  const playing = !!game && hash === '#play'
  useEffect(() => { if (!playing) pushed.current = false }, [playing])
  const playBtn = useRef(null)
  const [heroGone, setHeroGone] = useState(false)
  useEffect(() => {
    const el = playBtn.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(([e]) => setHeroGone(!e.isIntersecting && e.boundingClientRect.top < 0))
    io.observe(el)
    return () => io.disconnect()
  }, [slug])
  const open = () => { pushed.current = true; navigate({ hash: '#play' }) }
  const close = useCallback(() => {
    if (pushed.current) navigate(-1)
    else navigate({ hash: '' }, { replace: true })
  }, [navigate])

  if (!game) return <EnglishNotFound />
  const path = `/en/online-games/${slug}`
  const schema = {
    '@context': 'https://schema.org', '@type': 'VideoGame', name: game.name, description: game.description,
    url: `https://ugabuga.co.il${path}`, inLanguage: 'en', genre: game.genre || 'Puzzle',
    gamePlatform: ['Web browser', 'Mobile', 'Desktop'], applicationCategory: 'Game', isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, publisher: { '@type': 'Organization', name: 'Ugabuga' },
  }
  const others = Object.keys(ARCADE_EN).filter(s => s !== slug).map(withHe).filter(Boolean)
  return (
    <div className="arc-page" dir="ltr" style={{ '--game-color': game.color }}>
      <SEO lang="en" title={game.title} description={game.description} path={path} counterpartPath={`/online-games/${slug}`} structuredData={game.faq ? [schema, faqSchema(game.faq)] : schema} />
      <Breadcrumbs lang="en" items={[{ label: 'Home', href: '/en' }, { label: 'Online games', href: '/en/online-games' }, { label: game.name }]} />
      <header className="arc-hero"><h1>{game.emoji} {game.h1 || game.name}</h1></header>
      <section className="arc-play-hero">
        <div className="arc-play-art" aria-hidden="true">{game.emoji}</div>
        <div>
          <p>{game.description}</p>
          <button ref={playBtn} type="button" className="arc-play-btn" onClick={open}>▶ Play now</button>
          <div className="arc-meta"><span>🎂 Ages {game.ages}</span><span>📱 Phone and computer</span><span>🆓 Free, no sign-up</span></div>
        </div>
      </section>
      <div className="arc-info">
        <section className="arc-box"><h2>How to play</h2><ol>{game.how.map(s => <li key={s}>{s}</li>)}</ol></section>
        <section className="arc-box">
          <h2>Tips from the champions</h2><ul>{game.tips.map(s => <li key={s}>{s}</li>)}</ul>
          <h2 style={{ marginTop: 16 }}>What does it train?</h2><ul>{game.skills.map(s => <li key={s}>{s}</li>)}</ul>
        </section>
      </div>
      {game.faq && <section className="arc-box arc-faq"><h2>Frequently asked questions</h2>{game.faq.map(f => <div key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>)}</section>}
      <p style={{ textAlign: 'center', margin: '0 0 28px' }}>
        <button type="button" className="arc-share" style={{ width: 'auto', maxWidth: '100%', height: 'auto', minHeight: 50, fontSize: 18, padding: '10px 22px', whiteSpace: 'normal' }} onClick={() => shareOnWhatsApp(shareGameText(game, null, 'en'))}>
          <WhatsAppIcon size={22} /> Share this game on WhatsApp
        </button>
        <button type="button" className="arc-share" style={{ width: 'auto', maxWidth: '100%', height: 'auto', minHeight: 50, fontSize: 18, padding: '10px 22px', whiteSpace: 'normal', background: '#1877f2' }} onClick={() => shareOnFacebook()}>
          📘 Share on Facebook
        </button>
      </p>
      {heroGone && !playing && <button type="button" className="arc-sticky-play no-print" onClick={open}>▶ Play now - {game.name}</button>}
      <section className="arc-more">
        <h2>More online games</h2>
        <div className="arc-grid">
          {others.map(g => (
            <Link key={g.slug} to={`/en/online-games/${g.slug}`} className="arc-card" style={{ '--game-color': g.color }}>
              <span className="arc-card-art" aria-hidden="true" style={{ height: 100, fontSize: 52 }}>{g.emoji}</span>
              <h2>{g.name}</h2><p>{g.tagline}</p>
            </Link>
          ))}
        </div>
        <p style={{ textAlign: 'center', marginTop: 20 }}><Link to="/en/online-games" className="underline font-bold">All online games →</Link></p>
      </section>
      {playing && <ArcadeStage game={game} lang="en" onClose={close} />}
    </div>
  )
}

export function EnglishArcadeHub() {
  const { hash } = useLocation()
  useEffect(() => {
    if (hash !== '#two-players') return undefined
    const t = setTimeout(() => document.getElementById('two-players')?.scrollIntoView({ behavior: 'smooth' }), 80)
    return () => clearTimeout(t)
  }, [hash])
  const groups = ARCADE_EN_GROUPS.map(([name, slugs]) => [name, slugs.map(withHe).filter(Boolean)]).filter(([, g]) => g.length)
  const all = groups.flatMap(([, g]) => g)
  const boards = [...BOARD_PAGES, ...SUDOKU_PAGES].filter(p => p.hub)
  const twoPlayer = all.filter(g => g.twoPlayer)
  const schema = {
    '@context': 'https://schema.org', '@type': 'ItemList', name: 'Free online games for kids - Ugabuga',
    itemListElement: [...all.map(g => ({ path: `/en/online-games/${g.slug}`, name: g.name })), ...boards.map(p => ({ path: p.path, name: p.hub.name }))]
      .map((x, i) => ({ '@type': 'ListItem', position: i + 1, url: `https://ugabuga.co.il${x.path}`, name: x.name })),
  }
  return (
    <div className="arc-page" dir="ltr">
      <SEO lang="en" title="Free online games for kids - puzzles, cards and board games" description="Free online games for kids and families: puzzles, card games, chess, checkers and more. No download and no sign-up." path="/en/online-games" counterpartPath="/online-games" structuredData={[schema, faqSchema(FAQ)]} />
      <Breadcrumbs lang="en" items={[{ label: 'Home', href: '/en' }, { label: 'Online games' }]} />
      <header className="arc-hero">
        <h1>🕹️ Online games and brain teasers - tap and play</h1>
        <p>Free online games for kids and grown-ups: the classics everyone loves, next to original puzzles. No download, no sign-up and no ads inside the game. Every game opens full screen, with soft background music you can mute with 🎵.</p>
      </header>
      <Link to="/en/games/memory" className="dl-banner" style={{ '--game-color': '#ffd23f' }}>
        <span className="dl-banner-art" aria-hidden="true">🦄</span>
        <span><b>Memory matching game</b><small>Flip two cards at a time and find every pair</small></span>
        <span className="arc-play-chip">▶ Play</span>
      </Link>
      {groups.map(([name, games]) => (
        <section key={name} aria-label={name}>
          <h2 style={{ textAlign: 'center', margin: '28px 0 12px' }}>{name}</h2>
          <div className="arc-grid">
            {games.map(g => (
              <Link key={g.slug} to={`/en/online-games/${g.slug}#play`} className="arc-card" style={{ '--game-color': g.color }}>
                <span className="arc-card-art" aria-hidden="true">{g.emoji}</span>
                <h3>{g.name}</h3><p>{g.tagline}</p>
                <span className="arc-play-chip">▶ Play · Ages {g.ages}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
      {boards.length > 0 && (
        <section className="arc-two" id="two-players" aria-labelledby="board-title">
          <h2 id="board-title">♟️ Board games and sudoku</h2>
          <p>Two people on one phone or computer, taking turns, or one player against the computer. Perfect for waiting rooms, car rides and family game night.</p>
          <div className="arc-grid">
            {boards.map(p => (
              <Link key={p.path} to={p.path} className="arc-card" style={{ '--game-color': p.hub.color }}>
                <span className="arc-card-art" aria-hidden="true">{p.emoji}</span>
                <h3>{p.hub.name}</h3><p>{p.hub.tagline}</p>
                <span className="arc-play-chip">▶ Play · Ages {p.hub.ages}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
      {twoPlayer.length > 0 && <p className="arc-related" style={{ marginTop: 16 }}><span>Two-player games:</span>{twoPlayer.map(g => <Link key={g.slug} to={`/en/online-games/${g.slug}`}>{g.emoji} {g.name}</Link>)}</p>}
      <section className="arc-box" style={{ maxWidth: 860, margin: '30px auto 0' }}>
        <h2>Why are brain games good for kids?</h2>
        <p style={{ lineHeight: 1.75, fontSize: 17, margin: 0 }}>Short puzzles train planning, spatial thinking and patience, and they feel like play, not homework. Many games offer a hint or an undo button; the options appear inside each game.</p>
      </section>
      <section className="arc-box" style={{ maxWidth: 860, margin: '30px auto 0' }}>
        <h2>Frequently asked questions</h2>
        {FAQ.map(f => <div key={f.q} style={{ marginTop: 12 }}><p style={{ fontWeight: 800, margin: 0 }}>{f.q}</p><p style={{ lineHeight: 1.7, margin: 0 }}>{f.a}</p></div>)}
      </section>
    </div>
  )
}
