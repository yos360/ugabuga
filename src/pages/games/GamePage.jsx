import { useParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import Badge from '../../components/ui/Badge'
import WobblyCard from '../../components/ui/WobblyCard'
import WobblyButton from '../../components/ui/WobblyButton'
import { games } from '../../data/games'

export default function GamePage() {
  const { slug } = useParams()
  const game = games.find(g => g.slug === slug)

  if (!game) return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-hand mb-4">404 🎂</h1>
      <p>המשחק לא נמצא</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <SEO title={game.name} description={game.short_description} path={'/games/' + slug} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'משחקים', href: '/games' }, { label: game.name }]} />
      
      <h1 className="text-4xl font-hand font-bold mb-4">{game.name}</h1>
      <p className="text-lg text-[var(--ink)]/70 mb-4">{game.short_description}</p>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge>🎂 גיל {game.min_age}+</Badge>
        <Badge>👥 {game.min_players}-{game.max_players} משתתפים</Badge>
        <Badge>⏱ {game.duration_min}-{game.duration_max} דק׳</Badge>
        <Badge>{game.equipment_needed ? '🎒 ' + game.equipment : '✅ בלי ציוד'}</Badge>
        <Badge color={game.energy_level === 'high' ? 'red' : game.energy_level === 'low' ? 'green' : 'yellow'}>
          {game.energy_level === 'high' ? '⚡ אנרגטי' : game.energy_level === 'low' ? '😌 רגוע' : '🔄 בינוני'}
        </Badge>
      </div>

      {/* Quick Play */}
      {game.quick_instructions && (
        <WobblyCard hover={false} className="bg-[var(--yellow)] mb-8" padding="p-6">
          <h2 className="text-2xl font-hand font-bold mb-3">איך משחקים ב-20 שניות</h2>
          <p className="whitespace-pre-line">{game.quick_instructions}</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <WobblyButton variant="green">▶️ שחקו עכשיו</WobblyButton>
            <WobblyButton variant="outline">📖 הוראות מלאות</WobblyButton>
          </div>
        </WobblyCard>
      )}

      {/* Instructions */}
      <WobblyCard hover={false} className="mb-6" padding="p-6">
        <h2 className="text-2xl font-hand font-bold mb-3">📖 איך משחקים</h2>
        <div className="whitespace-pre-line leading-relaxed">{game.instructions}</div>
      </WobblyCard>

      {/* Facilitator tip */}
      {game.facilitator_tip && (
        <WobblyCard hover={false} className="bg-[var(--yellow)] mb-6" padding="p-6">
          <h2 className="text-2xl font-hand font-bold mb-2">💡 טיפ למנחה</h2>
          <p>{game.facilitator_tip}</p>
        </WobblyCard>
      )}

      {/* Age adaptations */}
      {game.age_adaptations && (
        <WobblyCard hover={false} className="mb-6" padding="p-6">
          <h2 className="text-2xl font-hand font-bold mb-2">🎯 התאמות גיל</h2>
          <p className="whitespace-pre-line">{game.age_adaptations}</p>
        </WobblyCard>
      )}

      {/* Safety */}
      {game.safety_notes && (
        <WobblyCard hover={false} className="border-[var(--red)] mb-6" padding="p-6">
          <h2 className="text-2xl font-hand font-bold mb-2">⚠️ בטיחות</h2>
          <p>{game.safety_notes}</p>
        </WobblyCard>
      )}

      {/* Rating */}
      <WobblyCard hover={false} className="text-center mb-6" padding="p-6">
        <p className="text-lg mb-2">היה לכם כיף?</p>
        <div className="flex justify-center gap-2 text-3xl">
          {[1,2,3,4,5].map(n => (
            <button key={n} className="hover:scale-125 transition-transform">🎂</button>
          ))}
        </div>
        <p className="text-sm text-[var(--muted)] mt-2">חדש 🎂 — אין דירוגים עדיין</p>
      </WobblyCard>
    </div>
  )
}
