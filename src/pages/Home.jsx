import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SearchBar from '../components/ui/SearchBar'
import WobblyCard from '../components/ui/WobblyCard'
import WobblyButton from '../components/ui/WobblyButton'

const ages = [4, 5, 6, 7, 8, 9, 10, 11, 12]

const themes = [
  { emoji: '⚽', name: 'כדורגל', slug: 'football-birthday' },
  { emoji: '🎮', name: 'גיימינג', slug: 'gaming-birthday' },
  { emoji: '🔬', name: 'מדע', slug: 'science-birthday' },
  { emoji: '👑', name: 'נסיכות', slug: 'princess-birthday' },
  { emoji: '🗺️', name: 'חפש מטמון', slug: 'treasure-hunt' },
  { emoji: '🦖', name: 'דינוזאורים', slug: 'dinosaur-birthday' },
]

const tools = [
  { emoji: '🧮', name: 'מחשבון מסיבה', desc: 'כמה פיצות? כמה שתייה? בואו נחשב', to: '/calculator' },
  { emoji: '💌', name: 'מחולל ברכות', desc: 'ברכה אישית ליום הולדת בשנייה', to: '/greeting' },
  { emoji: '📨', name: 'מחולל הזמנות', desc: 'צרו הזמנה יפה ושתפו', to: '/invitation' },
]

const filters = [
  { label: '🎒 בלי ציוד', to: '/games/no-equipment' },
  { label: '⏱ 5 דקות', to: '/games/5-minutes' },
  { label: '🎂 יום הולדת', to: '/games/birthday' },
  { label: '🏫 כיתה', to: '/games/classroom' },
  { label: '👨‍👩‍👧 משפחה', to: '/games/family' },
  { label: '🏃 תנועה', to: '/games/movement' },
  { label: '🤫 שקט', to: '/games/quiet' },
  { label: '🧊 שובר קרח', to: '/games/icebreaker' },
]

export default function Home() {
  return (
    <>
      <SEO path="/" />
      <div className="max-w-6xl mx-auto px-4">

        {/* Hero */}
        <section className="text-center py-12 md:py-20">
          <h1 className="text-5xl md:text-7xl font-hand font-bold mb-4">🎂 עוגה בוגה</h1>
          <p className="text-xl md:text-2xl text-[var(--ink)]/70 mb-8">המאגר הכי שווה למשחקים ופעילויות בעברית</p>
          <SearchBar className="mb-6" />
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {filters.map(f => (
              <Link key={f.to} to={f.to}
                className="px-4 py-2 border-2 border-[var(--ink)] wobbly-sm text-sm font-medium hover:bg-[var(--yellow)] transition-colors">
                {f.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Trust bar */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 py-4 mb-12 text-center">
          <span className="text-lg">✅ 100+ משחקים</span>
          <span className="text-lg">🆓 חינם לגמרי</span>
          <span className="text-lg">🇮🇱 הכל בעברית</span>
          <span className="text-lg">📱 עובד על הטלפון</span>
        </div>

        {/* By Age */}
        <section className="mb-16">
          <h2 className="text-3xl font-hand font-bold text-center mb-6">🎂 לפי גיל</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {ages.map(age => (
              <Link key={age} to={'/ideas/age/' + age}
                className="w-14 h-14 flex items-center justify-center text-xl font-bold border-2 border-[var(--ink)] rounded-full shadow-hard-sm card-hover bg-white">
                {age}
              </Link>
            ))}
          </div>
        </section>

        {/* Inspiration */}
        <section className="mb-16">
          <h2 className="text-3xl font-hand font-bold text-center mb-2">🎭 עולם ההשראה</h2>
          <p className="text-center text-[var(--ink)]/70 mb-6">לא יודעים איזו מסיבה לעשות?</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {themes.map(theme => (
              <Link key={theme.slug} to={'/ideas/themes/' + theme.slug}>
                <WobblyCard className="text-center" padding="p-4">
                  <div className="text-4xl mb-2">{theme.emoji}</div>
                  <div className="font-bold">{theme.name}</div>
                </WobblyCard>
              </Link>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to="/ideas" className="text-[var(--blue)] font-medium hover:underline">ראו את כל הרעיונות ←</Link>
          </div>
        </section>

        {/* Tools */}
        <section className="mb-16">
          <h2 className="text-3xl font-hand font-bold text-center mb-6">🛠️ כלים שימושיים</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools.map(tool => (
              <Link key={tool.to} to={tool.to}>
                <WobblyCard className="text-center" padding="p-6">
                  <div className="text-4xl mb-3">{tool.emoji}</div>
                  <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
                  <p className="text-[var(--ink)]/70">{tool.desc}</p>
                </WobblyCard>
              </Link>
            ))}
          </div>
        </section>

        {/* Printables */}
        <section className="mb-16">
          <h2 className="text-3xl font-hand font-bold text-center mb-2">🖨️ דפים להדפסה</h2>
          <p className="text-center text-[var(--ink)]/70 mb-6">דפי צביעה, אותיות, מבוכים, תעודות — הכל חינם</p>
          <div className="text-center">
            <Link to="/printables">
              <WobblyButton variant="secondary">צפו בכל ההדפסות ←</WobblyButton>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 mb-8">
          <WobblyCard hover={false} className="max-w-xl mx-auto bg-[var(--yellow)]" padding="p-8">
            <h2 className="text-2xl font-hand font-bold mb-3">✨ מחפשים משחק עכשיו?</h2>
            <p className="mb-4">יש לנו 100+ משחקים — בלי ציוד, בלי הכנה, בלי תשלום.</p>
            <Link to="/games">
              <WobblyButton>🎮 כל המשחקים</WobblyButton>
            </Link>
          </WobblyCard>
        </section>

      </div>
    </>
  )
}
