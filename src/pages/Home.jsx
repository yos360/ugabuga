import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SearchBar from '../components/ui/SearchBar'
import WobblyCard from '../components/ui/WobblyCard'
import WobblyButton from '../components/ui/WobblyButton'
import Badge from '../components/ui/Badge'
import { games } from '../data/games'

const ages = [4, 5, 6, 7, 8, 9, 10, 11, 12]
const ageColors = ['#ff4d4d','#ff9f43','#ffe74c','#4caf50','#2d5da1','#ff69b4','#9c27b0','#00bcd4','#ff5722']

const themes = [
  { emoji: '⚽', name: 'מסיבת כדורגל', slug: 'football-birthday', desc: 'טורניר קטן, קבוצות צבעוניות והרבה אנרגיה — מסיבה שלא צריך להמציא מחדש.', age: '5-12', budget: 'חסכוני', prep: 'minimal', bg: '#e8f5e9' },
  { emoji: '🎮', name: 'מסיבת גיימינג', slug: 'gaming-birthday', desc: 'תחנות משחק, אתגרים וטקס הכתרה — לילדים שחיים ונושמים משחקים.', age: '7-13', budget: 'חסכוני', prep: 'minimal', bg: '#e8d5f5' },
  { emoji: '🗺️', name: 'חפש את המטמון', slug: 'treasure-hunt', desc: 'רמזים, חידות ואוצר בסוף — מסיבה שהיא הרפתקה אחת גדולה.', age: '5-12', budget: 'חסכוני', prep: 'אינטנסיבי', bg: '#fff3a8' },
  { emoji: '🔬', name: 'מסיבת מדע וניסויים', slug: 'science-birthday', desc: 'ניסויים מתפוצצים, מתבעבעים וצבעוניים — הילדים מדענים ליום אחד.', age: '6-12', budget: 'מאוזן', prep: 'הכנה בינונית', bg: '#e0f7fa' },
  { emoji: '👑', name: 'מסיבת נסיכות', slug: 'princess-birthday', desc: 'כתרים, שמלות וטקס הכתרה — יום אחד של מלוכה.', age: '3-8', budget: 'מאוזן', prep: 'הכנה בינונית', bg: '#ffe0ec' },
]

const toolCards = [
  { emoji: '🧮', name: 'מחשבון מסיבה', desc: 'כמה פיצות? כמה שתייה? בואו נחשב', to: '/calculator', bg: '#e0f7fa' },
  { emoji: '💌', name: 'מחולל ברכות', desc: 'ברכה אישית ליום הולדת בשנייה', to: '/greeting', bg: '#ffe0ec' },
  { emoji: '📨', name: 'מחולל הזמנות', desc: 'צרו הזמנה יפה ושלחו', to: '/invitation', bg: '#e8d5f5' },
]

const goals = [
  { emoji: '😂', name: 'להצחיק', to: '/games?goal=להצחיק' },
  { emoji: '⚡', name: 'להוציא אנרגיה', to: '/games?goal=להוציא+אנרגיה' },
  { emoji: '🌙', name: 'להרגיע', to: '/games?goal=להרגיע' },
  { emoji: '🤝', name: 'להכיר', to: '/games?goal=להכיר' },
  { emoji: '⏳', name: 'למלא זמן', to: '/games?goal=למלא+זמן' },
  { emoji: '🎨', name: 'יצירתי', to: '/games?goal=יצירתי' },
  { emoji: '🧊', name: 'שובר קרח', to: '/games?goal=שובר+קרח' },
]

const filters = [
  { label: 'בלי ציוד', to: '/games/no-equipment' },
  { label: '5 דקות', to: '/games/5-minutes' },
  { label: 'יום הולדת', to: '/games/birthday' },
  { label: 'כיתה', to: '/games/classroom' },
  { label: 'שובר קרח', to: '/games/icebreaker' },
  { label: 'תנועה', to: '/games/movement' },
]

// Show first 8 popular games
const popularGames = games.slice(0, 8)

export default function Home() {
  return (
    <>
      <SEO path="/" />

      {/* Hero */}
      <section className="bg-section-yellow py-10 md:py-16 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-[var(--muted)] text-lg mb-2">מחברת המשחקים של כולם</p>
          <h1 className="text-4xl md:text-6xl font-hand font-bold mb-4">עוגה בוגה — המאגר הכי שווה למשחקים ופעילויות</h1>
          <p className="text-lg md:text-xl text-[var(--ink)]/70 mb-8 max-w-3xl mx-auto">
            מצאו את המשחק המושלם לכל רגע — ליום הולדת, לכיתה, לצהרון, למשפחה, או סתם לכיף
          </p>
          <SearchBar className="mb-4" />
          
          {/* Trust bar */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 py-4 mb-4">
            <span className="font-bold">✅ 100+ משחקים</span>
            <span className="font-bold">🆓 חינם לגמרי</span>
            <span className="font-bold">🇮🇱 הכל בעברית</span>
            <span className="font-bold">📱 עובד על הטלפון</span>
          </div>
          
          {/* Filter chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {filters.map(f => (
              <Link key={f.to} to={f.to}
                className="px-4 py-2 bg-white border-2 border-[var(--ink)] wobbly-sm text-sm font-medium shadow-hard-sm card-hover">
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">

        {/* Popular Games */}
        <section className="py-12">
          <p className="text-center text-[var(--muted)] mb-1">הכי משוחקים אצלנו</p>
          <h2 className="text-3xl md:text-4xl font-hand font-bold text-center mb-8">משחקים פופולריים</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {popularGames.map(game => (
              <Link key={game.slug} to={'/games/' + game.slug}>
                <WobblyCard padding="p-5" className="h-full flex flex-col">
                  <h3 className="text-lg font-bold mb-2">{game.name}</h3>
                  <p className="text-sm text-[var(--ink)]/60 mb-3 line-clamp-2 flex-1">{game.short_description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge>🎂 גיל {game.min_age}+</Badge>
                    <Badge>{game.duration_min}-{game.duration_max} דק׳</Badge>
                    <Badge>{game.min_players}-{game.max_players} משתתפים</Badge>
                    {!game.equipment_needed && <Badge color="green">בלי ציוד</Badge>}
                  </div>
                  <span className="text-[var(--blue)] font-medium text-sm">למשחק ←</span>
                </WobblyCard>
              </Link>
            ))}
          </div>
        </section>

        <hr className="section-divider" />

        {/* By Age */}
        <section className="py-12">
          <p className="text-center text-[var(--muted)] mb-1">מתכננים לפי גיל</p>
          <h2 className="text-3xl md:text-4xl font-hand font-bold text-center mb-8">לפי גיל</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {ages.map((age, i) => (
              <Link key={age} to={'/ideas/age/' + age}
                className="w-16 h-16 flex items-center justify-center text-2xl font-bold border-[3px] rounded-full shadow-hard card-hover bg-white"
                style={{ borderColor: ageColors[i], boxShadow: `4px 4px 0px 0px ${ageColors[i]}` }}>
                {age}
              </Link>
            ))}
          </div>
        </section>

        <hr className="section-divider" />

        {/* Inspiration */}
        <section className="py-12">
          <p className="text-center text-[var(--muted)] mb-1">לא יודעים איזו מסיבה לעשות?</p>
          <h2 className="text-3xl md:text-4xl font-hand font-bold text-center mb-8">עולם ההשראה 🎭</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {themes.map(theme => (
              <Link key={theme.slug} to={'/ideas/themes/' + theme.slug}>
                <div className="border-2 border-[var(--ink)] wobbly shadow-hard card-hover p-5 h-full"
                  style={{ backgroundColor: theme.bg }}>
                  <div className="flex items-start gap-3">
                    <span className="text-4xl">{theme.emoji}</span>
                    <div>
                      <h3 className="text-lg font-bold">{theme.name}</h3>
                      <p className="text-sm text-[var(--ink)]/60 mt-1 mb-3">{theme.desc}</p>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge>גיל {theme.age}</Badge>
                        <Badge>תקציב {theme.budget}</Badge>
                        <Badge>{theme.prep}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/ideas" className="text-[var(--blue)] font-bold text-lg hover:underline">ראו את כל הרעיונות ←</Link>
          </div>
        </section>

        <hr className="section-divider" />

        {/* Tools */}
        <section className="py-12">
          <p className="text-center text-[var(--muted)] mb-1">הכול מוכן בשנייה</p>
          <h2 className="text-3xl md:text-4xl font-hand font-bold text-center mb-8">כלים שימושיים 🛠️</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {toolCards.map(tool => (
              <Link key={tool.to} to={tool.to}>
                <div className="border-2 border-[var(--ink)] wobbly shadow-hard card-hover text-center p-6"
                  style={{ backgroundColor: tool.bg }}>
                  <div className="text-5xl mb-3">{tool.emoji}</div>
                  <h3 className="text-xl font-bold mb-1">{tool.name}</h3>
                  <p className="text-[var(--ink)]/60">{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <hr className="section-divider" />

        {/* Goals */}
        <section className="py-12">
          <p className="text-center text-[var(--muted)] mb-1">מה אתם צריכים עכשיו?</p>
          <h2 className="text-3xl md:text-4xl font-hand font-bold text-center mb-8">לפי מטרה</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {goals.map(g => (
              <Link key={g.name} to={g.to}
                className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-[var(--ink)] wobbly-sm shadow-hard-sm card-hover font-bold text-lg">
                <span className="text-2xl">{g.emoji}</span>{g.name}
              </Link>
            ))}
          </div>
        </section>

      </div>
    </>
  )
}
