import { useParams, Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { useGames } from '../../hooks/useGames'

export default function AgePage() {
  const { age } = useParams()
  const { games, loading } = useGames()
  const ageNum = parseInt(age)
  const filtered = games.filter(g => g.min_age <= ageNum && (!g.max_age || g.max_age >= ageNum))

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
      <SEO title={`רעיונות ליום הולדת גיל ${age}`} description={`משחקים ורעיונות ליום הולדת גיל ${age} — בלי ציוד, בלי הכנה, חינם.`} path={'/ideas/age/'+age} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'השראה', href: '/ideas' }, { label: 'גיל '+age }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-8">🎂 רעיונות ליום הולדת גיל {age}</h1>
      {loading ? <div className="text-center py-12 text-4xl buga-bounce">🎂</div> : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0,12).map((g,i) => (
            <Link key={g.slug} to={'/games/'+g.slug} className={`card-lift wobbly border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow-rich ${i%2?'rotate-1':'-rotate-1'}`}>
              <h3 className="text-xl font-bold">{g.name}</h3>
              <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mt-1">{g.short_description}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
