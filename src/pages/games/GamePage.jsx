import { useParams, Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import { useGameBySlug } from '../../hooks/useGames'
import GamePlayer from '../../components/games/GamePlayer'
import { useState } from 'react'

const rotations = ['-rotate-1', 'rotate-1', 'rotate-0', 'rotate-2', '-rotate-2']
const PLAY_TOOL_ROUTES = {
  'buga-bingo': { to: '/tools/bingo-maker', label: 'צרו כרטיסיות' },
  'buga-trivia': { to: '/tools/trivia-quiz', label: 'פתחו טריוויה' },
  'hafes-umtza': { to: '/tools/scavenger-hunt-maker', label: 'צרו ציד אוצרות' },
  'galgal-hamisimot': { to: '/tools/random-picker', label: 'פתחו גלגל' },
  'etgar-hakvutzot': { to: '/tools/team-generator', label: 'חלקו לקבוצות' },
  'mi-bakvutza-sheli': { to: '/tools/team-generator', label: 'חלקו לקבוצות' },
}
const MISSING_GAME_LINKS = [
  { to: '/tools', label: '🛠️ כל הכלים' },
  { to: '/tools/trivia-quiz', label: '🎯 טריוויה BUGA' },
  { to: '/tools/buga-town', label: '🏙️ בוגהטאון' },
  { to: '/tools/bingo-maker', label: '🎟️ בינגו' },
  { to: '/tools/riddles', label: '🧩 חידות' },
  { to: '/tools/escape-rooms', label: '🔐 חדרי בריחה' },
]

export default function GamePage() {
  const { slug } = useParams()
  const { game, related, content, loading } = useGameBySlug(slug)
  const [playing, setPlaying] = useState(false)
  const playToolRoute = PLAY_TOOL_ROUTES[slug]

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><span className="text-5xl buga-bounce">🎂</span></div>
  if (!game) return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-center buga-fade-in">
      <SEO title="המשחק עבר מקום" description="בחרו משחק או כלי פעיל בעוגה בוגה." path="/games" />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקים', href: '/games' }, { label: 'משחק לא נמצא' }]} />
      <div className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-8 sketch-shadow-rich">
        <div className="text-6xl mb-3">🎮</div>
        <h1 className="text-4xl mb-3">המשחק הזה עבר מקום</h1>
        <p className="mx-auto max-w-xl text-lg text-[var(--foreground)]/75 mb-6">
          יכול להיות שזה קישור ישן או משחק שעדיין לא חובר למאגר. בינתיים אפשר להגיע מכאן לכל המשחקים והכלים הפעילים.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <Link to="/games" className="wobbly-md sketch-press inline-flex min-h-[44px] items-center border-[3px] border-[var(--border)] bg-[var(--accent)] px-5 py-2 font-display text-lg font-bold text-[var(--accent-foreground)]">כל המשחקים</Link>
          <Link to="/tools" className="wobbly-md sketch-press inline-flex min-h-[44px] items-center border-[3px] border-[var(--border)] bg-[var(--postit)] px-5 py-2 font-display text-lg font-bold">כל הכלים</Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {MISSING_GAME_LINKS.map(item => (
            <Link key={item.to} to={item.to} className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-hand text-lg underline decoration-dashed hover:bg-[var(--postit)]">{item.label}</Link>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 buga-fade-in">
      <SEO title={game.name} description={game.short_description} path={'/games/' + slug} structuredData={{
        '@context': 'https://schema.org',
        '@type': 'Game',
        'name': game.name,
        'description': game.short_description,
        'url': 'https://ugabuga.co.il/games/' + slug,
        'inLanguage': 'he',
        'isAccessibleForFree': true,
        ...(game.category ? { 'genre': game.category } : {}),
        ...(game.min_age ? { 'typicalAgeRange': game.max_age ? `${game.min_age}-${game.max_age}` : `${game.min_age}-` } : {}),
        ...(game.min_players ? { 'numberOfPlayers': { '@type': 'QuantitativeValue', 'minValue': game.min_players, ...(game.max_players ? { 'maxValue': game.max_players } : {}) } } : {}),
        'publisher': { '@type': 'Organization', 'name': 'UGABUGA', 'url': 'https://ugabuga.co.il' },
      }} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקים', href: '/games' }, { label: game.name }]} />

      <div className="flex flex-wrap items-center gap-2 text-sm font-hand text-[var(--muted-foreground)] mb-2">
        <span>{game.content_type === 'GAME_ENGINE' ? 'מנוע משחק' : game.content_type === 'GAME' ? 'משחק' : 'פעילות'}</span>
        {game.category && <><span>·</span><span>{game.category}</span></>}
      </div>

      <h1 className="text-4xl sm:text-5xl mb-4">{game.name}</h1>

      {game.quick_instructions && (
        <div className="wobbly relative border-2 border-[var(--border)] bg-[var(--postit)] p-6 sketch-shadow tape mb-6">
          <h2 className="text-2xl mb-3">מתחילים לשחק</h2>
          <p className="font-hand text-lg whitespace-pre-line">{game.quick_instructions}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {playToolRoute ? (
              <Link to={playToolRoute.to} className="wobbly-md sketch-press inline-flex min-h-[44px] items-center border-[3px] border-[var(--border)] bg-[#4caf50] px-5 py-2 font-display text-lg font-bold text-white">▶️ {playToolRoute.label}</Link>
            ) : (
              <button onClick={() => setPlaying(true)} disabled={content.length===0} className="wobbly-md sketch-press min-h-[44px] border-[3px] border-[var(--border)] bg-[#4caf50] px-5 py-2 font-display text-lg font-bold text-white cursor-pointer disabled:opacity-50">▶️ שחקו עכשיו</button>
            )}
            <Link to="/games" className="wobbly-md sketch-press inline-flex min-h-[44px] items-center border-[3px] border-[var(--border)] bg-[var(--card)] px-5 py-2 font-display text-lg font-bold">🎲 תנו לי משחק אחר</Link>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        <Badge>{game.max_age ? <>גילאי <bdi dir="ltr">{game.min_age}-{game.max_age}</bdi></> : `גיל ${game.min_age}+`}</Badge>
        <Badge color="yellow">{game.duration_max ? <><bdi dir="ltr">{game.duration_min}-{game.duration_max}</bdi> דק׳</> : `${game.duration_min} דק׳`}</Badge>
        <Badge>{game.max_players ? `${game.min_players}-${game.max_players} משתתפים` : `${game.min_players}+ משתתפים`}</Badge>
        <Badge color={game.equipment_needed ? 'default' : 'blue'}>{game.equipment_needed ? game.equipment : 'בלי ציוד'}</Badge>
        <Badge>{game.energy_level === 'high' ? '⚡ תנועה מלאה' : game.energy_level === 'low' ? '😌 רגוע' : '🔄 בינוני'}</Badge>
        <Badge>{game.noise_level === 'high' ? '📢 רועש' : game.noise_level === 'low' ? '🤫 שקט' : '🔉 רעש בינוני'}</Badge>
      </div>

      <p className="text-xl leading-relaxed mb-8">{game.short_description}</p>

      <div className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-6 sketch-shadow mb-6">
        <h2 className="text-2xl mb-4">📖 הוראות מלאות ועוד</h2>
        <div className="font-hebrew text-lg leading-relaxed whitespace-pre-line">{game.instructions}</div>
      </div>

      {game.facilitator_tip && (
        <div className="wobbly relative border-2 border-[var(--border)] bg-[var(--postit)] p-5 sketch-shadow pin mb-6">
          <h2 className="text-xl mb-2">💡 טיפ למנחה</h2>
          <p className="font-hand text-lg">{game.facilitator_tip}</p>
        </div>
      )}

      {game.age_adaptations && (
        <div className="wobbly border-2 border-dashed border-[var(--border)] bg-[var(--card)] p-5 mb-6">
          <h2 className="text-xl mb-2">🎯 התאמות גיל</h2>
          <p className="font-hand text-lg whitespace-pre-line">{game.age_adaptations}</p>
        </div>
      )}

      {game.safety_notes && (
        <div className="wobbly border-2 border-[var(--accent)] bg-[var(--card)] p-5 mb-6">
          <h2 className="text-xl mb-2">⚠️ בטיחות</h2>
          <p className="font-hand text-lg">{game.safety_notes}</p>
        </div>
      )}

      <div className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-6 sketch-shadow text-center mb-8">
        <p className="text-xl mb-3">היה לכם כיף?</p>
        <div className="flex justify-center gap-3 text-3xl">{[1,2,3,4,5].map(n => <button key={n} className="transition-transform hover:scale-125 cursor-pointer">🎂</button>)}</div>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">חדש — אין דירוגים עדיין</p>
      </div>

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
