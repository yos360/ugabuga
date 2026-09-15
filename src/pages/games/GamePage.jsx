import { useParams, Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import { useGameBySlug } from '../../hooks/useGames'
import GamePlayer from '../../components/games/GamePlayer'
import { useState } from 'react'

const rotations = ['-rotate-1', 'rotate-1', 'rotate-0', 'rotate-2', '-rotate-2']

export default function GamePage() {
  const { slug } = useParams()
  const { game, related, content, loading } = useGameBySlug(slug)
  const [playing, setPlaying] = useState(false)

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><span className="text-5xl buga-bounce">🎂</span></div>
  if (!game) return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="wobbly max-w-md border-2 border-[var(--border)] bg-[var(--card)] p-8 text-center sketch-shadow">
        <h1 className="text-6xl">404</h1>
        <h2 className="mt-3 text-2xl">המשחק לא נמצא</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/" className="wobbly-md sketch-press inline-flex min-h-[44px] items-center border-[3px] border-[var(--border)] bg-[var(--accent)] px-5 py-2 font-display text-lg font-bold text-[var(--accent-foreground)]">לדף הבית</Link>
          <Link to="/games" className="wobbly-md sketch-press inline-flex min-h-[44px] items-center border-[3px] border-[var(--border)] bg-[var(--card)] px-5 py-2 font-display text-lg font-bold">לכל המשחקים</Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in">
      <SEO title={game.name} description={game.short_description} path={'/games/' + slug} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקים', href: '/games' }, { label: game.name }]} />

      <div className="flex flex-wrap items-center gap-2 text-sm font-hand text-[var(--muted-foreground)] mb-2">
        <span>{game.content_type === 'GAME_ENGINE' ? 'מנוע משחק' : game.content_type === 'GAME' ? 'משחק' : 'פעילות'}</span>
        {game.category && <><span>·</span><span>{game.category}</span></>}
      </div>

      <h1 className="text-4xl sm:text-5xl mb-4">{game.name}</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <Badge>{game.max_age ? `גילאי ${game.min_age}-${game.max_age}` : `גיל ${game.min_age}+`}</Badge>
        <Badge color="yellow">{game.duration_max ? `${game.duration_min}-${game.duration_max} דק׳` : `${game.duration_min} דק׳`}</Badge>
        <Badge>{game.max_players ? `${game.min_players}-${game.max_players} משתתפים` : `${game.min_players}+ משתתפים`}</Badge>
        <Badge color={game.equipment_needed ? 'default' : 'blue'}>{game.equipment_needed ? game.equipment : 'בלי ציוד'}</Badge>
        <Badge>{game.energy_level === 'high' ? '⚡ תנועה מלאה' : game.energy_level === 'low' ? '😌 רגוע' : '🔄 בינוני'}</Badge>
        <Badge>{game.noise_level === 'high' ? '📢 רועש' : game.noise_level === 'low' ? '🤫 שקט' : '🔉 רעש בינוני'}</Badge>
      </div>

      <p className="text-xl leading-relaxed mb-8">{game.short_description}</p>

      {/* Quick Play */}
      {game.quick_instructions && (
        <div className="wobbly relative border-2 border-[var(--border)] bg-[var(--postit)] p-6 sketch-shadow tape mb-8">
          <h2 className="text-2xl mb-3">איך משחקים ב-20 שניות</h2>
          <p className="font-hand text-lg whitespace-pre-line">{game.quick_instructions}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => setPlaying(true)} disabled={content.length===0} className="wobbly-md sketch-press min-h-[44px] border-[3px] border-[var(--border)] bg-[#4caf50] px-5 py-2 font-display text-lg font-bold text-white cursor-pointer disabled:opacity-50">▶️ שחקו עכשיו</button>
            <button className="wobbly-md sketch-press min-h-[44px] border-[3px] border-[var(--border)] bg-[var(--card)] px-5 py-2 font-display text-lg font-bold cursor-pointer">📖 הוראות מלאות</button>
            <Link to="/games" className="wobbly-md sketch-press inline-flex min-h-[44px] items-center border-[3px] border-[var(--border)] bg-[var(--card)] px-5 py-2 font-display text-lg font-bold">🎲 תנו לי משחק אחר</Link>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-6 sketch-shadow mb-6">
        <h2 className="text-2xl mb-4">📖 הוראות מלאות ועוד</h2>
        <div className="font-hebrew text-lg leading-relaxed whitespace-pre-line">{game.instructions}</div>
      </div>

      {/* Tip */}
      {game.facilitator_tip && (
        <div className="wobbly relative border-2 border-[var(--border)] bg-[var(--postit)] p-5 sketch-shadow pin mb-6">
          <h2 className="text-xl mb-2">💡 טיפ למנחה</h2>
          <p className="font-hand text-lg">{game.facilitator_tip}</p>
        </div>
      )}

      {/* Age */}
      {game.age_adaptations && (
        <div className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-5 mb-6">
          <h2 className="text-xl mb-2">🎯 התאמות גיל</h2>
          <p className="font-hand text-lg whitespace-pre-line">{game.age_adaptations}</p>
        </div>
      )}

      {/* Safety */}
      {game.safety_notes && (
        <div className="wobbly border-2 border-[var(--accent)] bg-[var(--card)] p-5 mb-6">
          <h2 className="text-xl mb-2">⚠️ בטיחות</h2>
          <p className="font-hand text-lg">{game.safety_notes}</p>
        </div>
      )}

      {/* Rating */}
      <div className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-6 sketch-shadow text-center mb-8">
        <p className="text-xl mb-3">היה לכם כיף?</p>
        <div className="flex justify-center gap-3 text-3xl">{[1,2,3,4,5].map(n => <button key={n} className="transition-transform hover:scale-125 cursor-pointer">🎂</button>)}</div>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">חדש — אין דירוגים עדיין</p>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="text-2xl mb-4">משחקים דומים</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {related.map((g, i) => (
              <Link key={g.slug || g.id} to={'/games/' + g.slug}
                className={`wobbly-md flex flex-col border-2 border-[var(--border)] bg-[var(--card)] p-4 sketch-shadow transition-all duration-150 hover:-translate-y-1 ${rotations[i % rotations.length]}`}>
                <h3 className="text-xl font-bold truncate">{g.name}</h3>
                <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mt-1">{g.short_description}</p>
                <span className="mt-2 font-display text-base font-bold text-[var(--pen)] underline decoration-dashed">למשחק ←</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {playing && <GamePlayer content={content} onClose={() => setPlaying(false)} />}
    </div>
  )
}
