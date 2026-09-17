import { useState, useMemo } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Badge from '../../components/ui/Badge'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { useGames } from '../../hooks/useGames'

const rotations = ['-rotate-1', 'rotate-1', 'rotate-0', 'rotate-2', '-rotate-2']

function ageLabel(g) { return g.max_age ? `גילאי ${g.min_age}-${g.max_age}` : `גיל ${g.min_age}+` }
function timeLabel(g) { return g.duration_max && g.duration_max !== g.duration_min ? `${g.duration_min}-${g.duration_max} דק׳` : `${g.duration_min} דק׳` }
function playersLabel(g) { return g.max_players ? `${g.min_players}-${g.max_players} משתתפים` : `${g.min_players}+ משתתפים` }
function equipmentLabel(g) { return g.equipment_needed ? g.equipment : 'בלי ציוד' }
function difficultyLabel(g) { return g.difficulty === 'hard' ? 'קשה' : g.difficulty === 'medium' ? 'בינוני' : 'קל' }
function difficultyColor(g) { return g.difficulty === 'hard' ? 'red' : g.difficulty === 'medium' ? 'yellow' : 'green' }

export default function GamesIndex() {
  const { games, loading, error } = useGames()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { age } = useParams()
  const isGameOfDay = location.pathname === '/game-of-the-day'
  const initialQ = searchParams.get('q') || ''
  const goalFilter = searchParams.get('goal') || ''
  const contextFilter = searchParams.get('context') || ''
  const ageNumber = age ? Number.parseInt(age, 10) : null
  const [search, setSearch] = useState(initialQ)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    const candidates = games.filter(g =>
      (!goalFilter || (g.goals && g.goals.includes(goalFilter))) &&
      (!contextFilter || (g.contexts && g.contexts.includes(contextFilter))) &&
      (!q ||
      g.name.toLowerCase().includes(q) ||
      (g.short_description && g.short_description.toLowerCase().includes(q)) ||
      (g.tags && g.tags.some(t => t.includes(q))) ||
      (g.category && g.category.includes(q)) ||
      (g.goals && g.goals.some(t => t.includes(q))) ||
      (g.contexts && g.contexts.some(t => t.includes(q)))
      ) &&
      (!ageNumber || (Number(g.min_age) <= ageNumber && (!g.max_age || Number(g.max_age) >= ageNumber)))
    )
    if (!isGameOfDay) return candidates
    if (!candidates.length) return []
    const dayIndex = Math.floor(Date.now() / 86400000) % candidates.length
    return [candidates[dayIndex]]
  }, [search, games, goalFilter, contextFilter, ageNumber, isGameOfDay])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SEO title={isGameOfDay ? 'משחק היום' : ageNumber ? `משחקים לגיל ${age}` : 'כל המשחקים'} description="100+ משחקים לימי הולדת, כיתה, צהרון ומשפחה — בלי ציוד, בלי הכנה, חינם." path={isGameOfDay ? '/game-of-the-day' : ageNumber ? `/games/age/${age}` : '/games'} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כל המשחקים' }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-6">🎮 {isGameOfDay ? 'משחק היום' : ageNumber ? `משחקים לגיל ${age}` : goalFilter ? `משחקים כדי ${goalFilter}` : contextFilter ? `משחקים ל${contextFilter}` : 'כל המשחקים'}</h1>

      <form className="mx-auto mb-8 flex max-w-2xl flex-col items-stretch gap-3 sm:flex-row" onSubmit={e => e.preventDefault()}>
        <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="חפשו משחק..."
          className="wobbly flex-1 border-[3px] border-[var(--border)] bg-[var(--card)] px-5 py-3 text-lg placeholder:text-[var(--muted-foreground)] sketch-shadow" />
      </form>

      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">
        {loading ? 'טוען...' : isGameOfDay ? 'בחירה יומית אחת — משחק חדש בכל יום' : `נמצאו ${filtered.length} משחקים`}
      </p>

      {error && (
        <div className="wobbly border-2 border-[var(--accent)] bg-red-50 p-4 mb-6 text-center">
          <p className="font-bold text-[var(--accent)]">שגיאת טעינה: {error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><span className="text-5xl buga-bounce">🎂</span></div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((game, i) => (
            <Link key={game.slug || game.id} to={'/games/' + game.slug}
              className={`wobbly group relative flex flex-col border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow transition-all duration-150 hover:-translate-y-1 hover:rotate-1 hover:shadow-[6px_10px_0_var(--border)] active:scale-[0.98] ${rotations[i % rotations.length]}`}>
              <h3 className="truncate text-2xl leading-tight">{game.name}</h3>
              <p className="mt-2 line-clamp-2 text-base text-[var(--foreground)]/85">{game.short_description}</p>
              <div className="mt-3 flex flex-wrap gap-1 sm:gap-2">
                <Badge>{ageLabel(game)}</Badge>
                <Badge color="yellow">{timeLabel(game)}</Badge>
                <Badge>{playersLabel(game)}</Badge>
                <Badge color={difficultyColor(game)}>🎯 {difficultyLabel(game)}</Badge>\n                <Badge color={game.equipment_needed ? 'default' : 'blue'}>{equipmentLabel(game)}</Badge>
              </div>
              <div className="mt-auto flex items-center justify-between border-t-2 border-dashed border-[var(--border)] pt-3">
                <span className="font-display text-lg font-bold underline decoration-dashed">למשחק ←</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="wobbly mx-auto max-w-md border-2 border-[var(--border)] bg-[var(--card)] p-8 text-center sketch-shadow">
          <p className="text-xl mb-2">🤔 לא מצאנו משחקים</p>
          <p className="text-[var(--muted-foreground)] mb-4">נסו לחפש משהו אחר</p>
          <button onClick={() => setSearch('')} className="font-display text-lg font-bold text-[var(--pen)] underline decoration-dashed">ראו את כל המשחקים</button>
        </div>
      )}
    </div>
  )
}
