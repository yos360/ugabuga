import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import SEO from '../components/ui/SEO'
import Badge from '../components/ui/Badge'
import { useGames } from '../hooks/useGames'

const TRUST = ['✅ 100+ משחקים', '🆓 חינם לגמרי', '🇮🇱 הכל בעברית', '📱 עובד על הטלפון']
const CHIPS = [
  { label: 'בלי ציוד', to: '/games/no-equipment' }, { label: '5 דקות', to: '/games/5-minutes' },
  { label: 'יום הולדת', to: '/games/birthday' }, { label: 'כיתה', to: '/games/classroom' },
  { label: 'שובר קרח', to: '/games/icebreaker' }, { label: 'תנועה', to: '/games/movement' },
]
const WORLD_DOORS = [
  { emoji: '🎮', title: 'עולם המשחקים', text: 'מאגר המשחקים, טריוויה, בוגהטאון, אמת או בוגה וחדרי בריחה.', status: 'פתוח עכשיו', to: '/games', bg: '#fff3a8' },
  { emoji: '🧑‍🍳', title: 'עולם הספקים', text: 'בעתיד: מפעילים, עוגות, בלונים, מקומות, צלמים ושירותים למסיבה.', status: 'בקרוב', bg: '#ffe0ec' },
  { emoji: '🎭', title: 'עולם הרעיונות', text: 'רעיונות למסיבות, נושאים, גילאים, פעילויות ותכנון אירוע.', status: 'קיים באתר', to: '/ideas', bg: '#e8d5f5' },
  { emoji: '🛠️', title: 'עולם הכלים', text: 'בינגו, תפזורת, טיימר, לוח ניקוד, חלוקה לקבוצות וכלים להפעלה.', status: 'קיים באתר', to: '/tools', bg: '#e0f7fa' },
  { emoji: '🖨️', title: 'עולם ההדפסות', text: 'דפי צביעה, שלטים, תעודות, תגי שם, סודוקו וערכות להדפסה.', status: 'קיים באתר', to: '/printables', bg: '#e8f5e9' },
]
const TOOLS = [
  { to: '/calculator', emoji: '🎉', title: 'מחשבון מסיבה', text: 'כמה פיצות, בקבוקים, כוסות ושקיות הפתעה צריך? מקבלים רשימת קניות מוכנה בשלוש שניות', bg: '#fff3a8', cta: 'לחישוב' },
  { to: '/tools/trivia-quiz', emoji: '🎯', title: 'טריוויה BUGA', text: 'שאלות, ניקוד וקצב מהיר לכיתה, משפחה או ערב חברים', bg: '#e0f7fa', cta: 'למשחק' },
  { to: '/tools/bingo-maker', emoji: '🎟️', title: 'בינגו מותאם', text: 'כרטיסיות מוכנות או אישיות בכל נושא, כולל דוגמאות והדפסה', bg: '#ffe0ec', cta: 'ליצירה' },
]
const GOALS = [
  { goal: 'להצחיק', emoji: '😂' }, { goal: 'להוציא אנרגיה', emoji: '⚡' },
  { goal: 'להרגיע', emoji: '🌙' }, { goal: 'להכיר', emoji: '🤝' },
  { goal: 'למלא זמן', emoji: '⏳' }, { goal: 'יצירתי', emoji: '🎨' },
  { goal: 'שובר קרח', emoji: '🧊' },
]
const CONTEXTS = [
  { label: 'יום הולדת', emoji: '🎂', to: '/games/birthday' },
  { label: 'כיתה', emoji: '🏫', to: '/games/classroom' },
  { label: 'צהרון', emoji: '🎒', to: '/games/afterschool' },
  { label: 'גן', emoji: '🧸', to: '/games/kindergarten' },
  { label: 'משפחה', emoji: '🏠', to: '/games/family' },
  { label: 'ערב חברים', emoji: '🌟', to: '/games/friends-evening' },
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
          <SectionTitle>5 דלתות לעולמות האתר</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {WORLD_DOORS.map((door, i) => {
              const card = (
                <div className={`card-lift flex h-full min-h-64 flex-col justify-between wobbly-md border-[3px] border-[var(--border)] p-5 text-center sketch-shadow-rich ${rotations[i % rotations.length]}`} style={{ backgroundColor: door.bg }}>
                  <div>
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[var(--border)] bg-white text-4xl sketch-shadow-sm">{door.emoji}</div>
                    <h2 className="text-2xl font-bold leading-tight">{door.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]/75">{door.text}</p>
                  </div>
                  <span className="mt-4 inline-flex justify-center rounded-full border-2 border-[var(--border)] bg-white px-3 py-1 font-hand text-base font-bold">{door.status}</span>
                </div>
              )
              return door.to ? <Link key={door.title} to={door.to}>{card}</Link> : <div key={door.title} aria-label={`${door.title} בקרוב`}>{card}</div>
            })}
          </div>
        </section>

        <section className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10">
          <div className="grid gap-4 sm:grid-cols-3">
            {TOOLS.map((tool, i) => (
              <Link key={tool.to} to={tool.to} className={`card-lift flex flex-col wobbly-md border-2 border-[var(--border)] p-6 sketch-shadow-rich ${i % 2 ? 'rotate-1' : '-rotate-1'}`} style={{ backgroundColor: tool.bg }}>
                <span className="text-4xl">{tool.emoji}</span>
                <span className="mt-2 font-display text-2xl font-bold">{tool.title}</span>
                <span className="mt-2 flex-1 font-hand text-lg text-[var(--foreground)]/70">{tool.text}</span>
                <span className="mt-4 font-display text-lg font-bold underline decoration-dashed">{tool.cta} ←</span>
              </Link>
            ))}
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

        <section className="mx-auto w-full min-w-0 max-w-6xl px-4 py-10">
          <SectionTitle kicker="איפה משחקים?">לפי הקשר</SectionTitle>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CONTEXTS.map((ctx, i) => (
              <Link key={ctx.to} to={ctx.to} className={`card-lift flex min-h-24 flex-col items-center justify-center wobbly-md border-2 border-[var(--border)] bg-[var(--card)] p-4 text-center sketch-shadow-rich ${i % 2 ? 'rotate-1' : '-rotate-1'}`}>
                <span className="text-3xl">{ctx.emoji}</span>
                <span className="mt-1 font-display text-xl font-bold">{ctx.label}</span>
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
