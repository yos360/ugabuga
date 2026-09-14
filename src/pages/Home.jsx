import { Link } from 'react-router-dom'
import SEO from '../components/ui/SEO'
import SearchBar from '../components/ui/SearchBar'
import WobblyCard from '../components/ui/WobblyCard'
import WobblyButton from '../components/ui/WobblyButton'

const ages = [4, 5, 6, 7, 8, 9, 10, 11, 12]
const ageColors = ['#ff4d4d','#ff9f43','#ffe74c','#4caf50','#2d5da1','#ff69b4','#9c27b0','#00bcd4','#ff5722']

const themes = [
  { emoji: '⚽', name: 'כדורגל', slug: 'football-birthday', bg: '#e8f5e9' },
  { emoji: '🎮', name: 'גיימינג', slug: 'gaming-birthday', bg: '#e8d5f5' },
  { emoji: '🔬', name: 'מדע', slug: 'science-birthday', bg: '#e0f7fa' },
  { emoji: '👑', name: 'נסיכות', slug: 'princess-birthday', bg: '#ffe0ec' },
  { emoji: '🗺️', name: 'חפש מטמון', slug: 'treasure-hunt', bg: '#fff3a8' },
  { emoji: '🦖', name: 'דינוזאורים', slug: 'dinosaur-birthday', bg: '#e8f5e9' },
]

const tools = [
  { emoji: '🧮', name: 'מחשבון מסיבה', desc: 'כמה פיצות? כמה שתייה? בואו נחשב', to: '/calculator', bg: '#e0f7fa' },
  { emoji: '💌', name: 'מחולל ברכות', desc: 'ברכה אישית ליום הולדת בשנייה', to: '/greeting', bg: '#ffe0ec' },
  { emoji: '📨', name: 'מחולל הזמנות', desc: 'צרו הזמנה יפה ושתפו', to: '/invitation', bg: '#e8d5f5' },
]

const moreTools = [
  { emoji: '🧩', name: 'חידות', to: '/tools/riddles' },
  { emoji: '🎲', name: 'קוביה', to: '/tools/dice' },
  { emoji: '⏱️', name: 'טיימר', to: '/tools/countdown-timer' },
  { emoji: '🎭', name: 'אמת או חובה', to: '/tools/truth-or-dare' },
  { emoji: '🎡', name: 'גלגל שמות', to: '/tools/random-picker' },
  { emoji: '🍾', name: 'סובב בקבוק', to: '/tools/spin-the-bottle' },
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
      
      {/* Hero */}
      <section className="bg-section-yellow py-12 md:py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="hero-cake animate-float mb-4">🎂</div>
          <h1 className="text-5xl md:text-7xl font-hand font-bold mb-3 doodle-underline inline-block">עוגה בוגה</h1>
          <p className="text-xl md:text-2xl text-[var(--ink)]/70 mt-6 mb-8 max-w-2xl mx-auto">המאגר הכי שווה למשחקים ופעילויות בעברית — חינם, בלי הרשמה, פותחים ומשחקים</p>
          <SearchBar className="mb-6" />
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {filters.map(f => (
              <Link key={f.to} to={f.to}
                className="px-4 py-2 bg-white border-2 border-[var(--ink)] wobbly-sm text-sm font-medium shadow-hard-sm card-hover">
                {f.label}
              </Link>
            ))}
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-8 right-8 text-4xl animate-wiggle opacity-30 select-none">🎈</div>
        <div className="absolute top-20 left-12 text-3xl animate-float opacity-20 select-none">⭐</div>
        <div className="absolute bottom-8 right-20 text-3xl animate-bounce-gentle opacity-20 select-none">🎉</div>
      </section>

      {/* Trust bar */}
      <div className="bg-white border-y-2 border-[var(--ink)]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap justify-center gap-6 md:gap-12">
          {['✅ 100+ משחקים','🆓 חינם לגמרי','🇮🇱 הכל בעברית','📱 עובד על הטלפון'].map(t => (
            <span key={t} className="text-lg font-bold whitespace-nowrap">{t}</span>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">

        {/* By Age */}
        <section className="py-14">
          <h2 className="text-3xl md:text-4xl font-hand font-bold text-center mb-8">
            <span className="doodle-underline">🎂 לפי גיל</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {ages.map((age, i) => (
              <Link key={age} to={'/ideas/age/' + age}
                className="w-16 h-16 flex items-center justify-center text-2xl font-bold border-3 border-[var(--ink)] rounded-full shadow-hard card-hover"
                style={{ backgroundColor: ageColors[i] + '33', borderColor: ageColors[i], boxShadow: `4px 4px 0px 0px ${ageColors[i]}` }}>
                {age}
              </Link>
            ))}
          </div>
        </section>

        <hr className="section-divider" />

        {/* Inspiration */}
        <section className="py-14">
          <h2 className="text-3xl md:text-4xl font-hand font-bold text-center mb-2">
            <span className="doodle-underline">🎭 עולם ההשראה</span>
          </h2>
          <p className="text-center text-lg text-[var(--ink)]/60 mb-8">לא יודעים איזו מסיבה לעשות? יש לנו רעיון.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {themes.map(theme => (
              <Link key={theme.slug} to={'/ideas/themes/' + theme.slug}>
                <div className="border-2 border-[var(--ink)] wobbly shadow-hard card-hover text-center p-5 transition-colors"
                  style={{ backgroundColor: theme.bg }}>
                  <div className="text-5xl mb-3 drop-shadow-sm">{theme.emoji}</div>
                  <div className="font-bold text-lg">{theme.name}</div>
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
        <section className="py-14">
          <h2 className="text-3xl md:text-4xl font-hand font-bold text-center mb-8">
            <span className="doodle-underline">🛠️ כלים שימושיים</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {tools.map(tool => (
              <Link key={tool.to} to={tool.to}>
                <div className="border-2 border-[var(--ink)] wobbly shadow-hard card-hover text-center p-7"
                  style={{ backgroundColor: tool.bg }}>
                  <div className="text-5xl mb-4">{tool.emoji}</div>
                  <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
                  <p className="text-[var(--ink)]/60">{tool.desc}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {moreTools.map(t => (
              <Link key={t.to} to={t.to}
                className="flex items-center gap-2 px-4 py-3 bg-white border-2 border-[var(--ink)] wobbly-sm shadow-hard-sm card-hover font-medium">
                <span className="text-xl">{t.emoji}</span> {t.name}
              </Link>
            ))}
          </div>
        </section>

        <hr className="section-divider" />

        {/* Printables */}
        <section className="py-14 bg-section-cool rounded-3xl mb-8 px-6">
          <h2 className="text-3xl md:text-4xl font-hand font-bold text-center mb-3">
            <span className="doodle-underline">🖨️ דפים להדפסה</span>
          </h2>
          <p className="text-center text-lg text-[var(--ink)]/60 mb-6">דפי צביעה, אותיות, מבוכים, תעודות, לוחות משחק — הכל חינם להדפסה</p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {['🎨 צביעה','✏️ אותיות','🔢 מספרים','🌀 מבוכים','🏆 תעודות','🎲 לוחות משחק'].map(p => (
              <span key={p} className="px-4 py-2 bg-white border-2 border-[var(--ink)] wobbly-sm text-sm font-medium">{p}</span>
            ))}
          </div>
          <div className="text-center">
            <Link to="/printables">
              <WobblyButton variant="dark">📂 צפו בכל ההדפסות</WobblyButton>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 mb-4">
          <div className="border-3 border-[var(--ink)] wobbly shadow-hard-lg max-w-2xl mx-auto p-10 text-center"
            style={{ backgroundColor: '#fff3a8', borderWidth: '3px' }}>
            <h2 className="text-3xl font-hand font-bold mb-3">✨ מחפשים משחק עכשיו?</h2>
            <p className="text-lg mb-6 text-[var(--ink)]/70">יש לנו 100+ משחקים — בלי ציוד, בלי הכנה, בלי תשלום.</p>
            <Link to="/games">
              <WobblyButton className="text-xl px-10 py-4">🎮 כל המשחקים</WobblyButton>
            </Link>
          </div>
        </section>

      </div>
    </>
  )
}
