import { Link } from 'react-router-dom'
import WobblyCard from '../components/ui/WobblyCard'
import WobblyButton from '../components/ui/WobblyButton'

const QUICK_LINKS = [
  { to: '/tools', label: '🛠️ כל הכלים' },
  { to: '/games', label: '🎮 כל המשחקים' },
  { to: '/tools/trivia-quiz', label: '🎯 טריוויה BUGA' },
  { to: '/tools/truth-or-buga', label: '🎭 אמת או בוגה' },
  { to: '/tools/buga-town', label: '🏙️ בוגהטאון' },
  { to: '/tools/bingo-maker', label: '🎟️ בינגו' },
  { to: '/tools/escape-rooms', label: '🔐 חדרי בריחה' },
  { to: '/printables', label: '🖨️ דפים להדפסה' },
]

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 text-center">
      <WobblyCard hover={false} padding="p-8">
        <div className="text-6xl font-hand font-bold mb-3">404</div>
        <h1 className="text-3xl sm:text-4xl mb-3">הדף הזה עבר מקום</h1>
        <p className="mx-auto max-w-xl text-lg text-[var(--ink)]/75 mb-6">
          יכול להיות שנכנסתם מקישור ישן. לא נתקעים — בחרו יעד ונחזיר אתכם ישר למשחקים, לכלים ולפעילויות.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mb-7">
          <Link to="/"><WobblyButton>לדף הבית</WobblyButton></Link>
          <Link to="/tools"><WobblyButton variant="outline">כל הכלים</WobblyButton></Link>
          <Link to="/games"><WobblyButton variant="outline">כל המשחקים</WobblyButton></Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {QUICK_LINKS.map(item => (
            <Link key={item.to} to={item.to} className="wobbly-sm border-2 border-[var(--border)] bg-[var(--card)] px-3 py-2 font-hand text-lg underline decoration-dashed hover:bg-[var(--postit)]">
              {item.label}
            </Link>
          ))}
        </div>
      </WobblyCard>
    </div>
  )
}
