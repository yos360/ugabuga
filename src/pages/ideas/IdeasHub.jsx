import { Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import WobblyCard from '../../components/ui/WobblyCard'

const doors = [
  { emoji: '🎭', title: 'לפי נושא', to: '/ideas/themes' },
  { emoji: '🎂', title: 'לפי גיל', to: '/ideas' },
  { emoji: '🏠', title: 'יום הולדת בבית', to: '/ideas/at-home' },
  { emoji: '💰', title: 'תקציב נמוך', to: '/ideas/on-budget' },
  { emoji: '🎤', title: 'בלי מפעיל', to: '/ideas/without-entertainer' },
  { emoji: '⏰', title: 'ברגע האחרון', to: '/ideas/last-minute' },
]

export default function IdeasHub() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SEO title="עולם ההשראה" description="רעיונות ליום הולדת — לפי נושא, גיל, מקום ותקציב. ערכות מסיבה מלאות עם עיצוב, אוכל, משחקים ולו״ז." path="/ideas" />
      <h1 className="text-4xl md:text-5xl font-hand font-bold text-center mb-2">🎭 עולם ההשראה</h1>
      <p className="text-center text-xl text-[var(--ink)]/70 mb-10">איזו מסיבה בא לכם לעשות?</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {doors.map(d => (
          <Link key={d.to} to={d.to}>
            <WobblyCard className="text-center" padding="p-6">
              <div className="text-5xl mb-3">{d.emoji}</div>
              <h2 className="text-lg font-bold">{d.title}</h2>
            </WobblyCard>
          </Link>
        ))}
      </div>
    </div>
  )
}
