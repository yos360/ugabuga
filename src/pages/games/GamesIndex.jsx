import { israelDayNumber } from '../../utils/israelDate'
import { useState, useMemo } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import Badge from '../../components/ui/Badge'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import { useGames } from '../../hooks/useGames'
import { gameHref } from '../../data/gameHref'
import { GAME_FILTERS, gameFilter, durationLabel, fitsAge } from '../../data/gameFilters'
import { gameItem, searchItems } from '../../data/searchIndex'

const rotations = ['-rotate-1', 'rotate-1', 'rotate-0', 'rotate-2', '-rotate-2']

// ⁦…⁩ (LRI/PDI) isolate the numeric range as left-to-right so the
// browser's bidi algorithm can't reorder "min-max" inside RTL text — the same
// class of bug fixed with <bdi dir="ltr"> in BirthdayFamous.jsx.
function ageLabel(g) { return g.max_age ? `גילאי ⁦${g.min_age}-${g.max_age}⁩` : `גיל ${g.min_age}+` }
function playersLabel(g) { return g.max_players ? `${g.min_players}-${g.max_players} משתתפים` : `${g.min_players}+ משתתפים` }
function equipmentLabel(g) { return g.equipment_needed ? g.equipment : 'בלי ציוד' }
function difficultyLabel(g) { return g.difficulty === 'hard' ? 'קשה' : g.difficulty === 'medium' ? 'בינוני' : 'קל' }
function difficultyColor(g) { return g.difficulty === 'hard' ? 'red' : g.difficulty === 'medium' ? 'yellow' : 'green' }

const gamesIndexFaq = [
  { q: 'איך משתמשים בסינון כדי למצוא משחק מתאים?', a: 'בוחרים תחילה את הפילטר הכי מגביל (למשל "בלי ציוד" או "עד 5 דקות"), ומצמצמים משם לפי גיל ומספר משתתפים.' },
  { q: 'יש דרך לגלות משחקים חדשים בלי לחפש משהו ספציפי?', a: 'כן, אפשר פשוט לדפדף ברשימה המלאה לפי קטגוריה — לפעמים המשחק הכי מתאים הוא כזה שלא חיפשתם.' },
]
const gamesIndexBody = [
  'זו הרשימה המלאה — יותר מ-100 משחקים במקום אחד. הדרך הכי מהירה למצוא משחק היא להתחיל מהאילוץ הכי נוקשה שיש לכם באותו רגע: אם אין ציוד בכלל, מסננים לפי משחקים בלי ציוד; אם יש בדיוק חמש דקות, משחקים ל-5 דקות פנויות מתאימים בדיוק; ואם המטרה היא לפתוח מפגש קבוצתי חדש, משחקי היכרות ושוברי קרח מתחילים בדיוק מהנקודה הזאת.',
  'חלק מהמשחקים ברשימה גם קיימים כגרסה דיגיטלית או להדפסה במתחם היוצרים — אם מוצאים משחק שדורש כרטיסים או כללים כתובים, כדאי לבדוק אם יש לו גרסת הדפסה מוכנה שם.',
]
const gamesIndexRelated = [ { label: 'משחקי יום הולדת', href: '/games/birthday' }, { label: 'משחקים בלי ציוד', href: '/games/no-equipment' }, { label: 'מתחם יוצרים', href: '/create' } ]

// One page per age (/games/age/N). From 10 up every game fits, so the lists would be identical — stop at 10.
const AGE_PAGES = [4, 5, 6, 7, 8, 9, 10]
const AGE_INTRO = {
  4: 'בגיל 4 משחקים קצרים, עם חוקים של משפט אחד והרבה תנועה: לחקות, לרוץ לצבע, לעצור כשהמוזיקה נעצרת. כדאי שמבוגר יוביל, ושכולם ינצחו בסוף.',
  5: 'ילדי גן חובה כבר מחכים לתור, סופרים עד 10 ואוהבים "כאילו": משחקי תפקידים, ניחושים קלים ומשחקי קבוצה פשוטים. מתאים במיוחד למסיבות גן.',
  6: 'בגיל 6, לקראת כיתה א׳, אפשר להכניס אותיות, מספרים ומשימות קטנות. משחקים עם ניצחון ברור עובדים טוב, כל עוד הסבב קצר ואף אחד לא יוצא לזמן ארוך.',
  7: 'בכיתה א׳–ב׳ ילדים כבר קוראים הוראות ונהנים מחידות, משחקי מילים ותחרויות קבוצתיות. זה הגיל שבו חדרי בריחה פשוטים וציד אוצרות מתחילים לעבוד.',
  8: 'בגיל 8 אוהבים אתגר אמיתי: טריוויה, אסטרטגיה, משחקי זיכרון ותפקידים סודיים. אפשר לתת לילדים להוביל משחק בעצמם ולשמור ניקוד.',
  9: 'ילדי כיתות ג׳–ד׳ נהנים מחוקים מורכבים יותר, משחקי בלשים ומשחקים שצריך בהם לשכנע ולהטעות. מתאים גם לערבי כיתה וליום הולדת בבית.',
  10: 'מגיל 10 כמעט כל המשחקים מתאימים. מה שעובד הכי טוב: משחקי חברה עם הומור, טריוויה קשה, משחקי מילים ואתגרים בקבוצות — וקצת פחות "משחקי גן".',
}

export default function GamesIndex() {
  const { games, loading, error } = useGames()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const { age } = useParams()
  const isGameOfDay = location.pathname === '/game-of-the-day'
  const initialQ = searchParams.get('q') || ''
  const goalFilter = searchParams.get('goal') || ''
  const contextFilter = searchParams.get('context') || ''
  const ageNumber = age ? Number.parseInt(age, 10) : null
  const [search, setSearch] = useState(initialQ)
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ugabuga:favorites') || '[]') } catch { return [] }
  })

  function toggleFavorite(e, game) {
    e.preventDefault()
    e.stopPropagation()
    setFavorites(prev => {
      const next = prev.includes(game.slug) ? prev.filter(slug => slug !== game.slug) : [...prev, game.slug]
      try { localStorage.setItem('ugabuga:favorites', JSON.stringify(next)) } catch { /* storage blocked: keep favorites for this visit only */ }
      return next
    })
  }

  function shareGame(e, game) {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/games/${game.slug}`
    window.open(`https://wa.me/?text=${encodeURIComponent(`${game.name} — משחק בעוגה בוגה\n${url}`)}`, '_blank', 'noopener,noreferrer')
  }

  const activeFilter = gameFilter(contextFilter)
  const filtered = useMemo(() => {
    const q = search.trim()
    // text search uses the site search (word starts, Hebrew prefixes, ages: "לגיל 7"), best match first
    const rank = q ? new Map(searchItems(games.map(g => ({ ...gameItem(g), slug: g.slug })), q).map((r, i) => [r.slug, i])) : null
    const filter = gameFilter(contextFilter)
    const candidates = games.filter(g =>
      (!goalFilter || (g.goals && g.goals.includes(goalFilter))) &&
      (!contextFilter || (filter ? filter.test(g) : (g.contexts && g.contexts.includes(contextFilter)))) &&
      (!rank || rank.has(g.slug)) &&
      (!ageNumber || fitsAge(g, ageNumber))
    )
    if (rank && !isGameOfDay) return candidates.sort((a, b) => rank.get(a.slug) - rank.get(b.slug))
    // Age pages: games made for this age first (closest minimum age), so each age page leads with its own games.
    if (ageNumber && !isGameOfDay) return [...candidates].sort((a, b) => Number(b.min_age || 0) - Number(a.min_age || 0))
    if (!isGameOfDay) return candidates
    if (!candidates.length) return []
    const dayIndex = israelDayNumber(Date.now()) % candidates.length // changes at midnight in Israel, not UTC
    return [candidates[dayIndex]]
  }, [search, games, goalFilter, contextFilter, ageNumber, isGameOfDay])

  // age and filter buttons keep each other: /games/age/7?context=שקטים
  const query = searchParams.toString()
  const ageHref = a => (ageNumber === a ? '/games' : `/games/age/${a}`) + (query ? `?${query}` : '')
  const heading = isGameOfDay ? 'משחק היום'
    : `${activeFilter ? activeFilter.title : goalFilter ? `משחקים כדי ${goalFilter}` : contextFilter ? `משחקים ל${contextFilter}` : ageNumber ? 'משחקים' : 'כל המשחקים'}${ageNumber ? ` לגיל ${age}` : ''}`

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SEO title={isGameOfDay ? 'משחק היום — משחק חדש לילדים בכל יום' : ageNumber ? `משחקים לגיל ${age} — ליום הולדת, לכיתה ולבית` : 'כל המשחקים — יותר מ-100 משחקים לילדים'} description={isGameOfDay ? 'משחק היום של עוגה בוגה: בכל יום נבחר משחק אחר מתוך מאגר של 100+ משחקים לילדים, עם הוראות, גילאים ומספר משתתפים. חוזרים מחר למשחק חדש — חינם.' : ageNumber ? `משחקים לילדים בני ${age}: כל המשחקים מהמאגר שמתאימים לגיל ${age} — ליום הולדת, לכיתה, לצהרון ולמשפחה. רבים מהם בלי ציוד ובלי הכנה, וכולם חינם.` : 'יותר מ-100 משחקים לילדים ולמשפחה — ליום הולדת, לכיתה, לצהרון ולבית. מחפשים לפי שם או נושא, שומרים מועדפים ומשתפים. רבים בלי ציוד ובלי הכנה, הכול חינם.'} path={isGameOfDay ? '/game-of-the-day' : ageNumber ? `/games/age/${age}` : '/games'}
        structuredData={(!isGameOfDay && !ageNumber && !goalFilter && !contextFilter) ? faqSchema(gamesIndexFaq) : null} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'כל המשחקים' }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-6">🎮 {heading}</h1>
      {ageNumber && AGE_INTRO[ageNumber] && <p className="mx-auto -mt-3 mb-6 max-w-2xl text-center text-lg leading-relaxed text-[var(--muted-foreground)]">{AGE_INTRO[ageNumber]}</p>}

      <form className="mx-auto mb-8 flex max-w-2xl flex-col items-stretch gap-3 sm:flex-row" onSubmit={e => e.preventDefault()}>
        <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="חפשו משחק..."
          className="wobbly flex-1 border-[3px] border-[var(--border)] bg-[var(--card)] px-5 py-3 text-lg placeholder:text-[var(--muted-foreground)] sketch-shadow" />
      </form>

      {!isGameOfDay && (
        <nav aria-label="סינון משחקים" className="mx-auto mb-6 max-w-4xl">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {AGE_PAGES.map((a) => (
              <Link key={a} to={ageHref(a)} preventScrollReset aria-current={ageNumber === a ? 'true' : undefined}
                className={`min-h-[44px] inline-flex items-center rounded-full border-2 border-[var(--border)] px-4 py-1.5 font-bold ${ageNumber === a ? 'bg-[var(--yellow)]' : 'bg-[var(--card)] hover:bg-[var(--muted)]/30'}`}>
                {ageNumber === a ? '✓ ' : ''}גיל {a}
              </Link>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="font-bold text-[var(--muted-foreground)]">מתאים ל:</span>
            {GAME_FILTERS.map((f) => (
              <button key={f.id} type="button" aria-pressed={contextFilter === f.id}
                onClick={() => {
                  const next = new URLSearchParams(searchParams)
                  if (contextFilter === f.id) next.delete('context'); else next.set('context', f.id)
                  setSearchParams(next, { preventScrollReset: true })
                }}
                className={`min-h-[44px] inline-flex items-center rounded-full border-2 border-[var(--border)] px-4 py-1.5 font-bold ${contextFilter === f.id ? 'bg-[var(--yellow)]' : 'bg-[var(--card)] hover:bg-[var(--muted)]/30'}`}>
                {f.label}
              </button>
            ))}
          </div>
          {(ageNumber || goalFilter || contextFilter) && (
            <div className="mt-3 text-center">
              <Link to="/games" onClick={() => setSearch('')}
                className="min-h-[40px] inline-flex items-center rounded-full border-2 border-dashed border-[var(--border)] bg-white px-4 py-1.5 font-bold">
                ✕ ניקוי סינון
              </Link>
            </div>
          )}
        </nav>
      )}

      <p className="text-center font-hand text-lg text-[var(--muted-foreground)] mb-6">
        {loading ? 'טוען...' : isGameOfDay ? 'בחירה יומית אחת — משחק חדש בכל יום' : `נמצאו ${filtered.length} משחקים`}
      </p>

      {error && (
        <div className="wobbly border-2 border-[var(--accent)] bg-red-50 p-4 mb-6 text-center">
          <p className="font-bold text-[var(--accent)]">😕 לא הצלחנו לטעון את כל המשחקים כרגע. נסו לרענן את הדף בעוד רגע.</p>
          <button type="button" className="mt-2 underline font-bold" onClick={() => window.location.reload()}>🔄 לנסות שוב</button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="טוענים משחקים" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => <div key={i} className="animate-pulse rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-5" aria-hidden="true"><div className="h-8 w-3/5 rounded bg-[var(--muted)]" /><div className="mt-4 h-12 rounded bg-[var(--muted)]" /><div className="mt-5 flex gap-2"><div className="h-6 w-20 rounded-full bg-[var(--muted)]" /><div className="h-6 w-24 rounded-full bg-[var(--muted)]" /></div><div className="mt-8 h-5 w-28 rounded bg-[var(--muted)]" /></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {filtered.map((game, i) => (
            <Link key={game.slug || game.id} to={gameHref(game.slug)}
              className={`wobbly group relative flex flex-col border-2 border-[var(--border)] bg-[var(--card)] p-4 sm:p-5 sketch-shadow transition-all duration-150 hover:-translate-y-1 hover:rotate-1 hover:shadow-[6px_10px_0_var(--border)] active:scale-[0.98] ${rotations[i % rotations.length]}`}>
              <div className="absolute left-3 top-3 flex gap-1" dir="ltr">
                <button type="button" onClick={e => toggleFavorite(e, game)} aria-pressed={favorites.includes(game.slug)} aria-label={favorites.includes(game.slug) ? `הסר את ${game.name} מהמועדפים` : `שמור את ${game.name} במועדפים`} title={favorites.includes(game.slug) ? 'הסרה מהמועדפים' : 'שמירה במועדפים'} className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/90 text-xl shadow-sm hover:scale-110">{favorites.includes(game.slug) ? '❤️' : '♡'}</button>
                <button type="button" onClick={e => shareGame(e, game)} aria-label={`שיתוף בוואטסאפ: ${game.name}`} title="שיתוף בוואטסאפ" className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[#25D366] px-3 text-sm font-bold text-white shadow-sm hover:scale-105">שיתוף</button>
              </div>
              <h3 className="truncate pl-28 text-2xl leading-tight">{game.name}</h3>
              <p className="mt-2 line-clamp-2 text-base text-[var(--foreground)]/85">{game.short_description}</p>
              <div className="mt-3 flex flex-wrap gap-1 sm:gap-2">
                <Badge>{ageLabel(game)}</Badge>
                <Badge color="yellow">{durationLabel(game)}</Badge>
                <Badge>{playersLabel(game)}</Badge>
                <Badge color={difficultyColor(game)}>🎯 {difficultyLabel(game)}</Badge>
                <Badge color={game.equipment_needed ? 'default' : 'blue'}>{equipmentLabel(game)}</Badge>
              </div>
              <div className="mt-auto flex items-center justify-between border-t-2 border-dashed border-[var(--border)] pt-3">
                <span className="font-display text-lg font-bold underline decoration-dashed">למשחק ←</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="wobbly mx-auto max-w-md border-2 border-[var(--border)] bg-[var(--card)] p-8 text-center sketch-shadow">
          <p className="text-xl mb-2">🤔 לא מצאנו משחקים</p>
          <p className="text-[var(--muted-foreground)] mb-4">נסו לחפש משהו אחר</p>
          <button onClick={() => setSearch('')} className="font-display text-lg font-bold text-[var(--pen)] underline decoration-dashed">ראו את כל המשחקים</button>
        </div>
      )}

      {!isGameOfDay && !ageNumber && !goalFilter && !contextFilter && (
        <div className="mt-12">
          <SeoBody paragraphs={gamesIndexBody} faq={gamesIndexFaq} related={gamesIndexRelated} />
        </div>
      )}
    </div>
  )
}
