import { useLocation, Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import { useGames } from '../../hooks/useGames'
import { CATEGORIES, CLASS_PAGES } from '../../data/gameCategories'

const rotations = ['-rotate-1', 'rotate-1', 'rotate-0', 'rotate-2', '-rotate-2']

export default function CategoryPage() {
  const { pathname } = useLocation()
  const slug = pathname.split('/').filter(Boolean).at(-1)
  const { games, loading } = useGames()

  const cat = CATEGORIES[slug]
  const cls = CLASS_PAGES[slug]
  const data = cat || cls
  if (!data) {
    const popularCategories = [
      ['birthday', 'יום הולדת'],
      ['classroom', 'כיתה'],
      ['no-equipment', 'בלי ציוד'],
      ['icebreaker', 'שוברי קרח'],
      ['movement', 'תנועה'],
      ['quiet', 'שקטים'],
    ]
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center buga-fade-in">
        <SEO title="קטגוריות משחקים" description="בחרו קטגוריית משחקים פעילה בעוגה בוגה." path="/games" noindex />
        <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקים', href: '/games' }, { label: 'בחירת קטגוריה' }]} />
        <div className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-8 sketch-shadow-rich">
          <h1 className="text-4xl mb-3">🎮 השטגוריה הזו לא פעילה</h1>
          <p className="text-lg text-[var(--foreground)]/75 mb-6">בחרו קטגוריה קיימת או עברו לכל המשחקים.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/games" className="wobbly-sm border-2 border-[var(--border)] bg-[var(--accent)] px-5 py-3 font-display text-xl font-bold text-white">כל המשחקים</Link>
            {popularCategories.map(([to, label]) => (
              <Link key={to} to={'/games/'+to} className="wobbly-sm border-2 border-[var(--border)] bg-[var(--postit)] px-5 py-3 font-display text-xl font-bold">{label}</Link>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const filter = cat ? cat.filter : (g => g.min_age <= cls.maxAge && (g.contexts||[]).includes('כיתה'))
  const filtered = games.filter(filter)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
      <SEO title={data.title} description={data.desc || data.intro.slice(0,150)} path={'/games/'+slug}
        structuredData={Array.isArray(data.faq) && data.faq.length > 0 ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          'mainEntity': data.faq.map(item => ({
            '@type': 'Question',
            'name': item.q,
            'acceptedAnswer': { '@type': 'Answer', 'text': item.a }
          }))
        } : null} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקים', href: '/games' }, { label: cls ? cls.breadcrumb : data.title }]} />
      <h1 className="text-4xl sm:text-5xl mb-4">{data.title}</h1>
      <p className="text-lg leading-relaxed text-[var(--foreground)]/85 mb-4">{data.intro}</p>
      {Array.isArray(data.body) && data.body.length > 0 && (
        <div className="max-w-3xl mb-8 space-y-4">
          {data.body.map((p, i) => (
            <p key={i} className="text-base leading-relaxed text-[var(--foreground)]/80">{p}</p>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-4xl buga-bounce">🎂</div>
      ) : (
        <>
          <p className="font-hand text-lg text-[var(--muted-foreground)] mb-4">נמצאו {filtered.length} משחקים</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((game, i) => (
              <Link key={game.slug} to={'/games/'+game.slug}
                className={`card-lift wobbly border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow-rich ${rotations[i%rotations.length]}`}>
                <h3 className="text-xl font-bold">{game.name}</h3>
                <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mt-1 mb-3">{game.short_description}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge>🎂 {game.min_age}+</Badge>
                  <Badge>⏱ <bdi dir="ltr">{game.duration_min}-{game.duration_max}</bdi>ד׳</Badge>
                </div>
              </Link>
            ))}
          </div>
          {filtered.length === 0 && <p className="text-center py-12 text-lg text-[var(--muted-foreground)]">🤔 לא נמצאו משחקים בקטגוריה זו כרגע</p>}
        </>
      )}

      {Array.isArray(data.faq) && data.faq.length > 0 && (
        <div className="max-w-3xl mt-12">
          <h2 className="text-2xl font-bold mb-4">שאלות נפוצות</h2>
          <div className="space-y-4">
            {data.faq.map((item, i) => (
              <div key={i}>
                <p className="font-bold text-[var(--foreground)]">{item.q}</p>
                <p className="text-[var(--foreground)]/80 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(data.related) && data.related.length > 0 && (
        <p className="max-w-3xl mt-8 text-[var(--foreground)]/80 leading-relaxed">
          {'שווה להסתכל גם על '}
          {data.related.map((r, i) => (
            <span key={r.href}>
              <Link to={r.href} className="underline font-bold">{r.label}</Link>
              {i < data.related.length - 1 ? (i === data.related.length - 2 ? ', ו' : ', ') : '.'}
            </span>
          ))}
        </p>
      )}
    </div>
  )
}

