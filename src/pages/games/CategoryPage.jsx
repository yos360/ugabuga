import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import { useGames } from '../../hooks/useGames'
import { CATEGORIES, CLASS_PAGES } from '../../data/gameCategories'
import { gameHref } from '../../data/gameHref'
import { gamesCountText, durationLabel, fitsAge, fitsDuration, fitsMovement, fitsNoEquipment, fitsQuiet } from '../../data/gameFilters'

const rotations = ['-rotate-1', 'rotate-1', 'rotate-0', 'rotate-2', '-rotate-2']

// Filters inside a category page: one choice per row, "הכול" clears the row.
const FILTER_ROWS = [
  { key: 'age', label: 'גיל', options: [4, 5, 6, 7, 8, 9, 10].map(a => ({ id: String(a), label: String(a), test: g => fitsAge(g, a) })) },
  { key: 'time', label: 'משך', options: [{ id: '10', label: 'עד 10 דק׳', test: g => fitsDuration(g, 10) }, { id: '20', label: 'עד 20 דק׳', test: g => fitsDuration(g, 20) }] },
  { key: 'gear', label: 'ציוד', options: [{ id: 'none', label: 'בלי ציוד', test: fitsNoEquipment }] },
  { key: 'vibe', label: 'אופי', options: [{ id: 'quiet', label: '🤫 שקט', test: fitsQuiet }, { id: 'active', label: '🏃 עם תנועה', test: fitsMovement }] },
]

function GameFilterBar({ value, onChange, total, shown }) {
  const active = Object.values(value).some(Boolean)
  return (
    <div role="group" aria-label="סינון המשחקים בעמוד" className="mb-5 rounded-2xl border-2 border-[var(--border)] bg-white/70 p-3">
      {FILTER_ROWS.map(row => (
        <div key={row.key} className="flex flex-wrap items-center gap-2 py-1">
          <span className="min-w-[3.5rem] font-bold">{row.label}:</span>
          {[{ id: '', label: 'הכול' }, ...row.options].map(o => (
            <button key={o.id || 'all'} type="button" aria-pressed={(value[row.key] || '') === o.id}
              onClick={() => onChange({ ...value, [row.key]: o.id })}
              className={`min-h-[44px] rounded-full border-2 border-[var(--border)] px-3 py-1 text-sm font-bold ${(value[row.key] || '') === o.id ? 'bg-[var(--yellow)]' : 'bg-[var(--card)] hover:bg-[var(--muted)]/30'}`}>
              {o.label}
            </button>
          ))}
        </div>
      ))}
      <p className="mt-1 flex flex-wrap items-center gap-3 font-hand text-lg text-[var(--muted-foreground)]" role="status">
        {gamesCountText(active ? shown : total, total, active)}
        {active && <button type="button" onClick={() => onChange({})} className="underline font-bold text-[var(--foreground)]">✕ ניקוי סינון</button>}
      </p>
    </div>
  )
}

export default function CategoryPage() {
  const { pathname } = useLocation()
  const slug = pathname.split('/').filter(Boolean).at(-1)
  const { games, loading } = useGames()
  // filter choices belong to one category page; moving to another category starts clean
  const [pickedFor, setPickedFor] = useState({ slug, value: {} })
  const picked = pickedFor.slug === slug ? pickedFor.value : {}
  const setPicked = value => setPickedFor({ slug, value })

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
      ['energy', 'להוציא אנרגיה'],
      ['no-prep', 'בלי הכנה'],
      ['trivia', 'טריוויה וידע'],
    ]
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center buga-fade-in">
        <SEO title="קטגוריות משחקים" description="בחרו קטגוריית משחקים פעילה בעוגה בוגה." path="/games" noindex />
        <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקים', href: '/games' }, { label: 'בחירת קטגוריה' }]} />
        <div className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-8 sketch-shadow-rich">
          <h1 className="text-4xl mb-3">🎮 הקטגוריה הזו לא פעילה</h1>
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
  const inCategory = games.filter(filter)
  const tests = FILTER_ROWS.map(row => row.options.find(o => o.id === picked[row.key])?.test).filter(Boolean)
  const filtered = inCategory.filter(g => tests.every(t => t(g)))

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
          <GameFilterBar value={picked} onChange={setPicked} total={inCategory.length} shown={filtered.length} />
          <div className="grid auto-rows-fr sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((game, i) => (
              <Link key={game.slug} to={gameHref(game.slug)}
                className={`h-full card-lift wobbly border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow-rich ${rotations[i%rotations.length]}`}>
                <h2 className="text-xl font-bold">{game.name}</h2>
                <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mt-1 mb-3">{game.short_description}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge>🎂 גיל <bdi dir="ltr">{game.min_age}+</bdi></Badge>
                  <Badge>⏱ {durationLabel(game)}</Badge>
                </div>
              </Link>
            ))}
          </div>
          {filtered.length === 0 && <p className="text-center py-12 text-lg text-[var(--muted-foreground)]">{inCategory.length ? '🤔 אין משחקים שמתאימים לכל הסינונים — נסו להסיר אחד מהם' : '🤔 לא נמצאו משחקים בקטגוריה זו כרגע'}</p>}
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

