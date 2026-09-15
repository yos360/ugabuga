import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import SEO from '../components/ui/SEO'
import Badge from '../components/ui/Badge'
import { useGames } from '../hooks/useGames'
import { DEFAULT_LIVE_NEWS } from '../data/liveNews'

const TRUST = ['✅ 100+ משחקים', '🆓 חינם לגמרי', '🇮🇱 הכל בעברית', '📱 עובד על הטלפון']
const CHIPS = [
  { label: 'בלי ציוד', to: '/games/no-equipment' }, { label: '5 דקות', to: '/games/5-minutes' },
  { label: 'יום הולדת', to: '/games/birthday' }, { label: 'כיתה', to: '/games/classroom' },
  { label: 'שובר קרח', to: '/games/icebreaker' }, { label: 'תנועה', to: '/games/movement' },
]
const TOOLS = [
  { to: '/tools/trivia-quiz', emoji: '🎯', title: 'טריוויה BUGA', text: 'מצבי משחק, שחקנים וחדשות בלייב', bg: '#fff3a8' },
  { to: '/tools/buga-town', emoji: '🏙️', title: 'בוגהטאון', text: 'עיר נכסים עם קוביות, שאלות וקלפים', bg: '#e8f5e9' },
  { to: '/tools/escape-rooms', emoji: '🔐', title: 'חדרי בריחה', text: 'משחקים דיגיטליים וקיטים להנחיה', bg: '#e8d5f5' },
  { to: '/calculator', emoji: '🧮', title: 'מחשבון מסיבה', text: 'כמה פיצות? כמה שתייה? בואו נחשב', bg: '#e0f7fa' },
  { to: '/greeting', emoji: '💌', title: 'מחולל ברכות', text: 'ברכה אישית ליום הולדת בשנייה', bg: '#ffe0ec' },
  { to: '/invitation', emoji: '📨', title: 'מחולל הזמנות', text: 'צרו הזמנה יפה ושלחו', bg: '#f7f2df' },
]
const LIVE_NEWS = [
  '🏙️ איתן בנה בעיר בוגהטאון — כבש 3 נכסים!',
  '⚡ שירה פתחה רצף בטריוויה — 5 תשובות נכונות!',
  '🎯 דרמה בריבוי שחקנים — מאור ניצח 10-9!',
  ...DEFAULT_LIVE_NEWS,
]
const GOALS = [
  { goal: 'להצחיק', emoji: '😂' }, { goal: 'להוציא אנרגיה', emoji: '⚡' },
  { goal: 'להרגיע', emoji: '🌙' }, { goal: 'להכיר', emoji: '🤝' },
  { goal: 'למלא זמן', emoji: '⏳' }, { goal: 'יצירתי', emoji: '🎨' },
  { goal: 'שובר קרח', emoji: '🧊' },
]
const THEMES = [
  { emoji: '⚽', name: 'מסיבת כדורגל', slug: 'football-birthday', desc: 'טורניר קטן, קבוצות צבעוניות והרבה אנרגיה', age: '5-12', budget: 'חסכוני', bg: '#e8f5e9' },
  { emoji: '🎮', name: 'מסיבת גיימינג', slug: 'gaming-birthday', desc: 'תחנות משחק, אתגרים וטקס הכתרה', age: '7-13', budget: 'חסכוני', bg: '#e8d5f5' },
  { emoji: '🗺️', name: 'חפש את המטמון', slug: 'treasure-hunt', desc: 'רמזים, חידות ואוצר בסוף — הרפתקה אחת גדולה', age: '5-12', budget: 'חסכוני', bg: '#fff3a8' },
  { emoji: '🔬', name: 'מסיבת מדע', slug: 'science-birthday', desc: 'ניסויים מתפוצצים, מתבעבעים וצבעוניים', age: '6-12', budget: 'מאוזן', bg: '#e0f7fa' },
  { emoji: '👑', name: 'מסיבת נסיכות', slug: 'princess-birthday', desc: 'כתרים, שמלות וטקס הכתרה — יום של מלוכה', age: '3-8', budget: 'מאוזן', bg: '#ffe0ec' },
]
const rotations = ['-rotate-1', 'rotate-1', 'rotate-0', 'rotate-2', '-rotate-2']

function SectionTitle({ children, kicker }) {
  return (
    <div className="mb-6">
      {kicker && <p className="font-hand kicker-squiggle text-base text-[var(--muted-foreground)]">{kicker}</p>}
      <h2 className="text-3xl sm:text-4xl mt-1"><span className="border-b-[3px] border-[var(--accent)] pb-1">{children}</span></h2>
    </div>
  )
}

function ageLabel(g) { return g.max_age ? `גילאי ${g.min_age}-${g.max_age}` : `גיל ${g.min_age}+` }
function timeLabel(g) { return g.duration_max && g.duration_max !== g.duration_min ? `${g.duration_min}-${g.duration_max} דק׳` : `${g.duration_min} דק׳` }
function playersLabel(g) { return g.max_players ? `${g.min_players}-${g.max_players} משתתפים` : `${g.min_players}+ משתתפים` }

function GameCard({ game, index = 0 }) {
  return (
    <Link to={'/games/' + game.slug}
      className={`card-lift group relative flex h-full flex-col wobbly border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow-rich ${rotations[index % rotations.length]}`}>
      <h3 className="truncate text-2xl leading-tight">{game.name}</h3>
      <p className="mt-2 line-clamp-2 text-base text-[var(--foreground)]/85">{game.short_description}</p>
      <div className="mt-3 flex flex-wrap gap-1 sm:gap-2">
        <Badge>{ageLabel(game)}</Badge>
        <Badge color="yellow">{timeLabel(game)}</Badge>
        <Badge>{playersLabel(game)}</Badge>
        <Badge color={game.equipment_needed ? 'default' : 'blue'}>{game.equipment_needed ? game.equipment : 'בלי ציוד'}</Badge>
      </div>
      <div className="mt-auto flex items-center justify-between border-t-2 border-dashed border-[var(--border)] pt-3">
        <span className="font-display text-lg font-bold underline decoration-dashed">למשחק ←</span>
      </div>
    </Link>
  )
}

export default function Home() {
  const { games, loading } = useGames()
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const popular = games.slice(0, 8)
  const term = query.trim()
  const suggestions = term.length >= 2 ? games.filter(g => g.name.includes(term)).slice(0, 6) : []

  return (
    <>
      <SEO path="/" />
      <div className="flex flex-col">
        <section className="relative torn-edge-bottom overflow-hidden bg-gradient-to-b from-[var(--postit)]/60 via-[var(--postit)]/20 to-transparent pb-10 pt-10 sm:pt-16">
          <div className="hero-blob w-64 h-64 bg-[var(--accent)] -top-10 -right-10" />
          <div className="hero-blob w-52 h-52 bg-[var(--pen)] top-40 -left-16" />
          <div className="relative mx-auto max-w-4xl px-4 text-center">
            <p className="font-hand text-xl text-[var(--muted-foreground)]">מחברת המשחקים של כולם 🎈</p>
            <h1 className="mt-2 text-4xl sm:text-6xl leading-[1.1]">עוגה בוגה — המאגר הכי שווה <span className="text-ink-gradient">למשחקים ופעילויות</span></h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg sm:text-xl text-[var(--foreground)]/80">מצאו את המשחק המושלם לכל רגע — ליום הולדת, לכיתה, לצהרון, למשפחה, או סתם לכיף</p>

            <form className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row" onSubmit={e => { e.preventDefault(); navigate('/games?q=' + encodeURIComponent(query)) }}>
              <div className="relative w-full">
                <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="חפשו משחק, פעילות, או קטגוריה..."
                  className="wobbly w-full border-[3px] border-[var(--border)] bg-[var(--card)] px-5 py-4 text-lg placeholder:text-[var(--muted-foreground)] sketch-shadow-rich" />
                {suggestions.length > 0 && (
                  <ul className="wobbly absolute inset-x-0 top-full z-30 mt-2 max-h-72 overflow-y-auto border-[3px] border-[var(--border)] bg-[var(--card)] p-2 text-right sketch-shadow-rich">
                    {suggestions.map(g => <li key={g.slug}><Link to={'/games/' + g.slug} className="flex min-h-[44px] items-center px-2 py-1 font-hand text-lg hover:bg-[var(--muted)]">{g.name}</Link></li>)}
                  </ul>
                )}
              </div>
              <button type="submit" className="btn-sheen wobbly-md sketch-press min-h-[48px] cursor-pointer border-[3px] border-[var(--border)] bg-[var(--accent)] px-5 py-2 font-display text-lg font-bold text-[var(--accent-foreground)] sm:w-40 sm:shrink-0">חפשו!</button>
            </form>

            <ul className="mt-6 flex flex-wrap justify-center gap-2">
              {TRUST.map(t => <li key={t} className="stat-pill">{t}</li>)}
            </ul>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {CHIPS.map(c => <Link key={c.to} to={c.to} className="wobbly-sm inline-flex min-h-[44px] items-center border-2 border-[var(--border)] bg-white px-4 py-1 font-hand text-lg transition-all duration-150 hover:-translate-y-0.5 hover:-rotate-2 hover:sketch-shadow-sm">{c.label}</Link>)}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10">
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="wobbly border-2 border-[var(--border)] bg-[var(--card)] p-6 sketch-shadow-rich">
              <p className="font-hand text-base text-[var(--muted-foreground)]">חדש באתר</p>
              <h2 className="text-3xl mb-3">🎮 משחקים חיים שאפשר להתחיל עכשיו</h2>
              <p className="text-lg text-[var(--foreground)]/75">טריוויה עם מצבי משחק, בוגהטאון עם נכסים וקוביות, וחדרי בריחה עם קיטים להנחיה — הכול בעברית ובסגנון עוגה בוגה.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/tools/trivia-quiz" className="wobbly-sm sketch-press border-2 border-[var(--border)] bg-[var(--accent)] px-4 py-2 font-display text-lg font-bold text-white">טריוויה BUGA</Link>
                <Link to="/tools/buga-town" className="wobbly-sm sketch-press border-2 border-[var(--border)] bg-[var(--postit)] px-4 py-2 font-display text-lg font-bold">בוגהטאון</Link>
                <Link to="/tools/escape-rooms" className="wobbly-sm sketch-press border-2 border-[var(--border)] bg-white px-4 py-2 font-display text-lg font-bold">חדרי בריחה</Link>
              </div>
            </div>
            <div className="wobbly border-2 border-[var(--border)] bg-[var(--postit)] p-5 sketch-shadow-rich">
              <h2 className="text-2xl mb-3">חדשות בלייב 🔴</h2>
              <div className="grid gap-2 font-hand text-lg">
                {LIVE_NEWS.slice(0, 5).map((item) => <div key={item} className="rounded-xl bg-white/70 px-3 py-2">{item}</div>)}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10">
          <SectionTitle kicker="הכי משוחקים אצלנו">משחקים פופולריים</SectionTitle>
          {loading ? (
            <div className="flex items-center justify-center py-12"><span className="text-4xl buga-bounce">🎂</span><span className="mr-3 font-hand text-lg">טוען משחקים...</span></div>
          ) : (
            <div className="-mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4">
              {popular.map((game, i) => <div key={game.slug || game.id} className="w-[19rem] shrink-0 snap-start"><GameCard game={game} index={i} /></div>)}
            </div>
          )}
        </section>

        <section className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10">
          <SectionTitle kicker="מתכננים לפי גיל">לפי גיל</SectionTitle>
          <div className="flex snap-x gap-3 overflow-x-auto px-1 pb-3">
            {Array.from({ length: 9 }, (_, i) => i + 4).map((age, i) => (
              <Link key={age} to={'/ideas/age/' + age} className={`card-lift flex h-20 w-20 shrink-0 snap-start items-center justify-center wobbly-sm border-[3px] border-[var(--border)] ${i % 2 ? 'bg-white rotate-1' : 'bg-[var(--postit)] -rotate-1'} font-display text-3xl font-bold sketch-shadow-sm`}>{age}</Link>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10">
          <SectionTitle kicker="לא יודעים איזו מסיבה לעשות?">עולם ההשראה 🎭</SectionTitle>
          <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4">
            {THEMES.map((theme, i) => (
              <Link key={theme.slug} to={'/ideas/themes/' + theme.slug} className={`card-lift flex w-[19rem] shrink-0 snap-start gap-3 wobbly-md border-2 border-[var(--border)] p-4 sketch-shadow-rich ${rotations[i % rotations.length]}`} style={{ backgroundColor: theme.bg }}>
                <span className="text-4xl shrink-0">{theme.emoji}</span>
                <div>
                  <h3 className="font-display text-lg font-bold">{theme.name}</h3>
                  <p className="text-sm text-[var(--foreground)]/70 mt-1">{theme.desc}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5"><Badge>גיל {theme.age}</Badge><Badge>תקציב {theme.budget}</Badge></div>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/ideas" className="font-display text-xl font-bold underline decoration-dashed">ראו את כל הרעיונות ←</Link>
        </section>

        <section className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10">
          <SectionTitle kicker="הכול מוכן בשנייה">כלים שימושיים 🛠️</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool, i) => (
              <Link key={tool.to} to={tool.to} className={`card-lift flex flex-col items-center gap-2 wobbly-md border-2 border-[var(--border)] p-6 text-center sketch-shadow-rich ${i % 2 ? 'rotate-1' : '-rotate-1'}`} style={{ backgroundColor: tool.bg }}>
                <span className="text-4xl">{tool.emoji}</span>
                <span className="font-display text-2xl font-bold">{tool.title}</span>
                <span className="font-hand text-lg text-[var(--foreground)]/70">{tool.text}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10">
          <SectionTitle kicker="מה אתם צריכים עכשיו?">לפי מטרה</SectionTitle>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {GOALS.map((g, i) => (
              <Link key={g.goal} to={'/games?goal=' + encodeURIComponent(g.goal)} className={`card-lift flex min-h-24 flex-col items-center justify-center wobbly-md border-2 border-[var(--border)] bg-[var(--card)] p-4 text-center sketch-shadow-rich ${i % 2 ? 'rotate-1' : '-rotate-1'}`}>
                <span className="text-3xl">{g.emoji}</span>
                <span className="mt-1 font-display text-xl font-bold">{g.goal}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-3xl px-4 py-14 text-center">
          <div className="wobbly border-[3px] border-[var(--border)] bg-[var(--postit)] p-10 sketch-shadow-rich">
            <h2 className="text-3xl mb-3">✨ מחפשים משחק עכשיו?</h2>
            <p className="text-lg mb-6 text-[var(--foreground)]/75">יש לנו 100+ משחקים — בלי ציוד, בלי הכנה, בלי תשלום.</p>
            <Link to="/games" className="btn-sheen wobbly-md sketch-press inline-flex items-center border-[3px] border-[var(--border)] bg-[var(--accent)] px-10 py-4 font-display text-xl font-bold text-[var(--accent-foreground)]">🎮 כל המשחקים</Link>
          </div>
        </section>
      </div>
    </>
  )
}
