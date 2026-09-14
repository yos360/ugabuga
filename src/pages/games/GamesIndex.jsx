import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SearchBar from '../../components/ui/SearchBar'
import WobblyCard from '../../components/ui/WobblyCard'
import Badge from '../../components/ui/Badge'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { games } from '../../data/games'

export default function GamesIndex() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [search, setSearch] = useState(query)

  const filtered = useMemo(() => {
    if (!search.trim()) return games
    const q = search.toLowerCase()
    return games.filter(g =>
      g.name.includes(q) || g.short_description.includes(q) ||
      (g.tags && g.tags.some(t => t.includes(q))) ||
      (g.category && g.category.includes(q))
    )
  }, [search])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SEO title="כל המשחקים" description="100+ משחקים לימי הולדת, כיתה, צהרון ומשפחה — בלי ציוד, בלי הכנה, חינם." path="/games" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקים' }]} />
      <h1 className="text-4xl font-hand font-bold text-center mb-6">🎮 כל המשחקים</h1>
      <SearchBar onSearch={setSearch} className="mb-8" />
      <p className="text-center text-[var(--ink)]/70 mb-6">נמצאו {filtered.length} משחקים</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(game => (
          <Link key={game.slug} to={'/games/' + game.slug}>
            <WobblyCard padding="p-5">
              <h3 className="text-xl font-bold mb-2">{game.name}</h3>
              <p className="text-sm text-[var(--ink)]/70 mb-3 line-clamp-2">{game.short_description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge>🎂 {game.min_age}+</Badge>
                <Badge>👥 {game.min_players}-{game.max_players}</Badge>
                <Badge>⏱ {game.duration_min}-{game.duration_max} דק׳</Badge>
                {!game.equipment_needed && <Badge color="green">בלי ציוד</Badge>}
              </div>
            </WobblyCard>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <WobblyCard hover={false} className="text-center max-w-md mx-auto mt-8" padding="p-8">
          <p className="text-xl mb-2">🤔 לא מצאנו משחקים</p>
          <p className="text-[var(--ink)]/70 mb-4">נסו לחפש משהו אחר</p>
          <button onClick={() => setSearch('')} className="text-[var(--blue)] font-medium hover:underline">ראו את כל המשחקים</button>
        </WobblyCard>
      )}
    </div>
  )
}
