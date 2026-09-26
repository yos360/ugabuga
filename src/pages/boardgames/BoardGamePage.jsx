import { Suspense, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import SeoBody from '../../components/ui/SeoBody'
import PrintPreview from '../../components/ui/PrintPreview'
import NotFound from '../NotFound'
import { BOARD_GAMES, boardGameBySlug } from '../../boardgames/registry'
import '../../boardgames/boardgames.css'

const TABS = [
  { id: 'play', label: '🎮 לשחק' },
  { id: 'learn', label: '🎓 ללמוד' },
  { id: 'rules', label: '📜 חוקים' },
]

function Rules({ game }) {
  return (
    <div className="bg-rules">
      {game.rules.map(s => <section key={s.h}><h3>{s.h}</h3>{s.p.map(p => <p key={p}>{p}</p>)}</section>)}
    </div>
  )
}

// /board-games/:slug — play vs computer or a friend, step-by-step lessons, and the rules (printable).
export default function BoardGamePage() {
  const { slug } = useParams()
  const game = boardGameBySlug(slug)
  const [params, setParams] = useSearchParams()
  const [printing, setPrinting] = useState(false)
  if (!game) return <NotFound />
  const tab = TABS.some(t => t.id === params.get('tab')) ? params.get('tab') : 'play'
  const setTab = t => setParams(t === 'play' ? {} : { tab: t }, { replace: true })
  const Module = game.load
  const others = BOARD_GAMES.filter(g => g.slug !== slug)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 bg-page" dir="rtl">
      <SEO title={game.seoTitle} description={game.seoDesc} path={`/board-games/${slug}`} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקי לוח קלאסיים', href: '/board-games' }, { label: game.name }]} />
      <header className="bg-head">
        <h1>{game.emoji} {game.name} – לשחק, ללמוד ולהדפיס חוקים</h1>
        <p>{game.intro}</p>
        <p className="bg-meta"><span>👥 {game.players}</span><span>🎂 גיל {game.ages}</span><span>⏱️ {game.time}</span></p>
      </header>

      <div className="bg-tabs" role="tablist">
        {TABS.map(t => <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'is-on' : ''} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>

      <section className="bg-box">
        {tab === 'rules'
          ? <>
            <div className="bg-actions bg-actions-top"><button type="button" className="bg-primary" onClick={() => setPrinting(true)}>🖨️ הדפסת החוקים</button></div>
            <Rules game={game} />
          </>
          : <Suspense fallback={<p className="bg-status">טוען את הלוח…</p>}><Module tab={tab} onPlay={() => setTab('play')} /></Suspense>}
      </section>

      {tab !== 'rules' && <section className="bg-box bg-rules-short"><h2>📜 חוקי ה{game.name} בקצרה</h2><Rules game={{ rules: game.rules.slice(0, 7) }} /></section>}

      <SeoBody faq={game.faq} />
      {others.length > 0 && <p className="bg-more">משחקי לוח נוספים: {others.map((g, k) => <span key={g.slug}>{k > 0 && ' · '}<Link to={`/board-games/${g.slug}`}>{g.emoji} {g.name}</Link></span>)}</p>}

      {printing && <PrintPreview title={`חוקי ה${game.name}`} onClose={() => setPrinting(false)}>
        <article className="buga-flow bg-print"><h2>{game.emoji} חוקי ה{game.name}</h2><Rules game={game} /><footer>עוגה בוגה · משחקי לוח קלאסיים · ugabuga.co.il</footer></article>
      </PrintPreview>}
    </div>
  )
}
