import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import SEO from '../components/ui/SEO'
import Badge from '../components/ui/Badge'
import { useGames } from '../hooks/useGames'

const TRUST = ['✅ 100+ משחקים', '🆓 חינם לגמרי', '🇮🇱 הכל בעברית', '📱 עובד על הטלפון']
const CHIPS = [
  { label: 'בלי ציוד', to: '/games/no-equipment' },
  { label: '5 דקות', to: '/games/5-minutes' },
  { label: 'יום הולדת', to: '/games/birthday' },
  { label: 'כיתה', to: '/games/classroom' },
  { label: 'שובר קרח', to: '/games/icebreaker' },
  { label: 'תנועה', to: '/games/movement' },
]
const TOOLS = [
  { to: '/calculator', emoji: '🧮', title: 'מחשבון מסיבה', text: 'כמה פיצות? כמה שתייה? בואו נחשב' },
  { to: '/greeting', emoji: '💌', title: 'מחולל ברכות', text: 'ברכה אישית ליום הולדת בשנייה' },
  { to: '/invitation', emoji: '📨', title: 'מחולל הזמנות', text: 'צרו הזמנה יפה ושלחו' },
]
const GOALS = [
  { goal: 'להצחיק', emoji: '😂' }, { goal: 'להוציא אנרגיה', emoji: '⚡' },
  { goal: 'להרגיע', emoji: '🌙' }, { goal: 'להכיר', emoji: '🤝' },
  { goal: 'למלא זמן', emoji: '⏳' }, { goal: 'יצירתי', emoji: '🎨' },
  { goal: 'שובר קרח', emoji: '🧊' },
]
const THEMES = [
  { emoji: '⚽', name: 'מסיבת כדורגל', slug: 'football-birthday', desc: 'טורניר קטן, קבוצות צבעוניות והרבה אנרגיה', age: '5-12', budget: 'חסכוני' },
  { emoji: '🎮', name: 'מסיבת גיימינג', slug: 'gaming-birthday', desc: 'תחנות משחק, אתגרים וטקס הכתרה', age: '7-13', budget: 'חסכוני' },
  { emoji: '🗺️', name: 'חפש את המטמון', slug: 'treasure-hunt', desc: 'רמזים, חידות ואוצר בסוף — הרפתקה אחת גדולה', age: '5-12', budget: 'חסכוני' },
  { emoji: '🔬', name: 'מסיבת מדע', slug: 'science-birthday', desc: 'ניסויים מתפוצצים, מתבעבעים וצבעוניים', age: '6-12', budget: 'מאוזן' },
  { emoji: '👑', name: 'מסיבת נסיכות', slug: 'princess-birthday', desc: 'כתרים, שמלות וטקס הכתרה — יום של מלוכה', age: '3-8', budget: 'מאוזן' },
]

const rotations = ['-rotate-1', 'rotate-1', 'rotate-0', 'rotate-2', '-rotate-2']

function SectionTitle({ children, kicker }) {
  return (
    <div className="mb-5">
      {kicker && <p className="font-hand text-base text-[var(--muted-foreground)]">{kicker}</p>}
      <h2 className="text-3xl sm:text-4xl"><span className="border-b-[3px] border-[var(--accent)] pb-1">{children}</span></h2>
    </div>
  )
}

function ageLabel(g) { return g.max_age ? `גילאי ${g.min_age}-${g.max_age}` : `גיל ${g.min_age}+` }
function timeLabel(g) { return g.duration_max && g.duration_max !== g.duration_min ? `${g.duration_min}-${g.duration_max} דק׳` : `${g.duration_min} דק׳` }
function playersLabel(g) { return g.max_players ? `${g.min_players}-${g.max_players} משתתפים` : `${g.min_players}+ משתתפים` }
function equipmentLabel(g) { return g.equipment_needed ? g.equipment : 'בלי ציוד' }

function GameCard({ game, index = 0 }) {
  return (
    <Link to={'/games/' + game.slug}
      className={`wobbly group relative mb-4 flex h-full flex-col border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow transition-all duration-150 hover:-translate-y-1 hover:rotate-1 hover:shadow-[6px_10px_0_var(--border)] active:scale-[0.98] active:shadow-none sm:mb-0 ${rotations[index % rotations.length]}`}>
      <h3 className="truncate text-2xl leading-tight">{game.name}</h3>
      <p className="mt-2 line-clamp-2 text-base text-[var(--foreground)]/85">{game.short_description}</p>
      <div className="mt-3 flex flex-wrap gap-1 sm:gap-2">
        <Badge>{ageLabel(game)}</Badge>
        <Badge color="yellow">{timeLabel(game)}</Badge>
        <Badge>{playersLabel(game)}</Badge>
        <Badge color={game.equipment_needed ? 'default' : 'blue'}>{equipmentLabel(game)}</Badge>
      </div>
      <div className="mt-auto flex items-center justify-between border-t-2 border-dashed border-[var(--border)] pt-3">
        <span className="font-display text-lg font-bold underline decoration-dashed">למשחק ←</span>
        {game.rating_count >= 10 && <span className="font-hand text-base">🎂 {(game.rating_sum / game.rating_count).toFixed(1)}</span>}
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
        {/* Hero */}
        <section className="order-1 mx-auto max-w-4xl px-4 pt-10 pb-6 text-center sm:pt-16">
          <p className="font-hand text-xl text-[var(--muted-foreground)]">מחברת המשחקים של כולם</p>
          <h1 className="mt-2 text-4xl sm:text-6xl">עוגה בוגה — המאגר הכי שווה למשחקים ופעילויות</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg sm:text-xl">מצאו את המשחק המושלם לכל רגע — ליום הולדת, לכיתה, לצהרון, למשפחה, או סתם לכיף</p>
          <form className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row" onSubmit={e => { e.preventDefault(); navigate('/games?q=' + encodeURIComponent(query)) }}>
            <div className="relative w-full">
              <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="חפשו משחק, פעילות, או קטגוריה..."
                className="wobbly w-full border-[3px] border-[var(--border)] bg-[var(--card)] px-5 py-4 text-lg placeholder:text-[var(--muted-foreground)] sketch-shadow" />
              {suggestions.length > 0 && (
                <ul className="wobbly absolute inset-x-0 top-full z-30 mt-2 max-h-72 overflow-y-auto border-[3px] border-[var(--border)] bg-[var(--card)] p-2 text-right sketch-shadow">
                  {suggestions.map(g => <li key={g.slug}><Link to={'/games/' + g.slug} className="flex min-h-[44px] items-center px-2 py-1 font-hand text-lg hover:bg-[var(--muted)]">{g.name}</Link></li>)}
                </ul>
              )}
            </div>
            <button type="submit" className="wobbly-md sketch-press min-h-[48px] cursor-pointer border-[3px] border-[var(--border)] bg-[var(--accent)] px-5 py-2 font-display text-lg font-bold text-[var(--accent-foreground)] sm:w-40 sm:shrink-0">חפשו!</button>
          </form>
          <ul className="mt-6 flex flex-wrap justify-center gap-2 font-hand text-base text-[var(--muted-foreground)]">
            {TRUST.map(t => <li key={t} className="wobbly-sm border-2 border-dashed border-[var(--border)] bg-[var(--card)]/70 px-3 py-1">{t}</li>)}
          </ul>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {CHIPS.map(c => <Link key={c.to} to={c.to} className="wobbly-sm inline-flex min-h-[44px] items-center border-2 border-[var(--border)] bg-[var(--postit)] px-4 py-1 font-hand text-lg transition-transform duration-100 hover:-rotate-2 hover:sketch-shadow-sm">{c.label}</Link>)}
          </div>
        </section>

        {/* Popular */}
        <section className="order-2 mx-auto w-full min-w-0 max-w-6xl px-4 py-10">
          <SectionTitle kicker="הכי משוחקים אצלנו">משחקים פופולריים</SectionTitle>
          {loading ? (
            <div className="flex items-center justify-center py-12"><span className="text-4xl buga-bounce">🎂</span><span className="mr-3 font-hand text-lg">טוען משחקים...</span></div>
          ) : (
            <div className="-mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-4">
              {popular.map((game, i) => <div key={game.slug || game.id} className="w-[19rem] shrink-0 snap-start"><GameCard game={game} index={i} /></div>)}
            </div>
          )}
        </section>

        {/* By age */}
        <section className="order-3 mx-auto w-full min-w-0 max-w-6xl px-4 py-10">
          <SectionTitle kicker="מתכננים לפי גיל">לפי גיל</SectionTitle>
          <div className="flex snap-x gap-3 overflow-x-auto px-1 pb-3">
            {Array.from({ length: 9 }, (_, i) => i + 4).map((age, i) => (
              <Link key={age} to={'/ideas/age/' + age}
                className={`wobbly-sm flex h-20 w-20 shrink-0 snap-start items-center justify-center border-[3px] border-[var(--border)] ${i % 2 ? 'bg-[var(--card)] rotate-1' : 'bg-[var(--postit)] -rotate-1'} font-display text-3xl font-bold sketch-shadow-sm transition-transform hover:rotate-0`}>
                {age}
              </Link>
            ))}
          </div>
        </section>

        {/* Inspiration */}
        <section className="order-4 mx-auto w-full min-w-0 max-w-6xl px-4 py-10">
          <SectionTitle kicker="לא יודעים איזו מסיבה לעשות?">עולם ההשראה 🎭</SectionTitle>
          <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4">
            {THEMES.map((theme, i) => (
              <Link key={theme.slug} to={'/ideas/themes/' + theme.slug}
                className={`wobbly-md flex w-[19rem] shrink-0 snap-start gap-3 border-2 border-[var(--border)] bg-[var(--card)] p-4 sketch-shadow transition-all duration-150 hover:-translate-y-1 hover:rotate-1 ${rotations[i % rotations.length]}`}>
                <span className="text-4xl shrink-0">{theme.emoji}</span>
                <div>
                  <h3 className="font-display text-lg font-bold">{theme.name}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">{theme.desc}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge>גיל {theme.age}</Badge><Badge>תקציב {theme.budget}</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link to="/ideas" className="font-display text-xl font-bold underline decoration-dashed">ראו את כל הרעיונות ←</Link>
        </section>

        {/* Tools */}
        <section className="order-5 mx-auto w-full min-w-0 max-w-6xl px-4 py-10">
          <SectionTitle kicker="הכול מוכן בשנייה">כלים שימושיים 🛠️</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-3">
            {TOOLS.map((tool, i) => (
              <Link key={tool.to} to={tool.to}
                className={`wobbly-md flex flex-col items-center gap-2 border-2 border-[var(--border)] bg-[var(--card)] p-5 text-center sketch-shadow transition-transform duration-100 hover:-rotate-1 ${i % 2 ? 'rotate-1' : '-rotate-1'}`}>
                <span className="text-4xl">{tool.emoji}</span>
                <span className="font-display text-2xl font-bold">{tool.title}</span>
                <span className="font-hand text-lg text-[var(--muted-foreground)]">{tool.text}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Goals */}
        <section className="order-6 mx-auto w-full min-w-0 max-w-6xl px-4 py-10">
          <SectionTitle kicker="מה אתם צריכים עכשיו?">לפי מטרה</SectionTitle>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {GOALS.map((g, i) => (
              <Link key={g.goal} to={'/games?goal=' + encodeURIComponent(g.goal)}
                className={`wobbly-md flex min-h-24 flex-col items-center justify-center border-2 border-[var(--border)] bg-[var(--card)] p-4 text-center sketch-shadow transition-transform duration-100 hover:-rotate-2 ${i % 2 ? 'rotate-1' : '-rotate-1'}`}>
                <span className="text-3xl">{g.emoji}</span>
                <span className="mt-1 font-display text-xl font-bold">{g.goal}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
