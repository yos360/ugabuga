import { Link } from 'react-router-dom'
import WobblyCard from '../components/ui/WobblyCard'
import WobblyButton from '../components/ui/WobblyButton'

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <WobblyCard hover={false} padding="p-8">
        <h1 className="text-6xl font-hand font-bold mb-4">404</h1>
        <p className="text-xl mb-2">הדף הזה נעלם מהמחברת</p>
        <p className="text-[var(--ink)]/70 mb-6">אולי מחקנו אותו בטעות. בואו נחזור לשחק.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/"><WobblyButton>לדף הבית</WobblyButton></Link>
          <Link to="/games"><WobblyButton variant="outline">כל המשחקים</WobblyButton></Link>
        </div>
      </WobblyCard>
    </div>
  )
}
