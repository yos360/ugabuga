import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import SEO from '../../../components/ui/SEO'
import Breadcrumbs from '../../../components/ui/Breadcrumbs'
import SeoBody, { faqSchema } from '../../../components/ui/SeoBody'
import { EnglishNotFound } from '../../EnglishLayout'
import '../../../boardgames/boardgames.css'
import '../../../arcade/arcade-ltr.css'
import { BOARD_EN } from './boardData.js'

const PLAY = {
  chess: lazy(() => import('../../../boardgames/chess/Chess').then(m => ({ default: m.ChessPlay }))),
  checkers: lazy(() => import('../../../boardgames/checkers/Checkers').then(m => ({ default: m.CheckersPlay }))),
  backgammon: lazy(() => import('../../../boardgames/backgammon/Backgammon').then(m => ({ default: m.BackgammonPlay }))),
}

function Rules({ rules }) {
  return <div className="bg-rules">{rules.map(s => <section key={s.h}><h3>{s.h}</h3>{s.p.map(p => <p key={p}>{p}</p>)}</section>)}</div>
}

// /en/chess, /en/checkers, /en/backgammon: the same boards as the Hebrew site, with English interface and copy.
export default function EnglishBoardGame({ slug }) {
  const g = BOARD_EN[slug]
  if (!g) return <EnglishNotFound />
  const Play = PLAY[slug]
  const others = Object.entries(BOARD_EN).filter(([s]) => s !== slug)
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 bg-page" dir="ltr">
      <SEO lang="en" title={g.title} description={g.description} path={g.path} counterpartPath={g.counterpart} structuredData={faqSchema(g.faq)} />
      <Breadcrumbs lang="en" items={[{ label: 'Home', href: '/en' }, { label: 'Online games', href: '/en/online-games' }, { label: g.name }]} />
      <header className="bg-head">
        <h1>{g.emoji} {g.h1}</h1>
        <p>{g.intro}</p>
        <p className="bg-meta"><span>👥 {g.players}</span><span>🎂 Ages {g.ages}</span><span>⏱️ {g.time}</span></p>
      </header>
      <section className="bg-box">
        <Suspense fallback={<p className="bg-status">Loading the board…</p>}><Play lang="en" /></Suspense>
      </section>
      <section className="bg-box bg-rules-short"><h2>📜 {g.name} rules in brief</h2><Rules rules={g.rules} /></section>
      <section className="bg-box"><h2>Tips for beginners</h2><ul>{g.tips.map(t => <li key={t}>{t}</li>)}</ul></section>
      <SeoBody lang="en" faq={g.faq} />
      <p className="bg-more">More board games: {others.map(([s, o], k) => <span key={s}>{k > 0 && ' · '}<Link to={o.path}>{o.emoji} {o.name}</Link></span>)} · <Link to="/en/online-games">All online games</Link></p>
    </div>
  )
}
