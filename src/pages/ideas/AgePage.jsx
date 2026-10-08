import { useParams, Link } from 'react-router-dom'
import SEO from '../../components/ui/SEO'
import Breadcrumbs from '../../components/ui/Breadcrumbs'
import WobblyCard from '../../components/ui/WobblyCard'
import SeoBody, { faqSchema } from '../../components/ui/SeoBody'
import { useGames } from '../../hooks/useGames'
import { gameHref } from '../../data/gameHref'
import { AGE_IDEAS, AGE_IDEA_LIST } from '../../data/ideaArticlesAges'
import { nearby } from '../../utils/nearby'

// Cross-section pages that exist in the sitemap for a given age.
const GAMES_AGES = [4, 5, 6, 7, 8, 9, 10]
const GIFT_AGES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
const GREETING_AGES = [1, 3, 5, 6, 10, 16, 18, 20, 30, 40, 50, 60, 70, 80, 90]

function ageLinks(n) {
  const links = []
  if (GAMES_AGES.includes(n)) links.push({ label: `משחקים לגיל ${n}`, href: '/games/age/' + n })
  if (GIFT_AGES.includes(n)) links.push({ label: `מתנות לגיל ${n}`, href: '/gifts/age-' + n })
  if (GREETING_AGES.includes(n)) links.push({ label: `ברכות ליום הולדת ${n}`, href: '/greetings/age-' + n })
  if (n <= 12) links.push({ label: 'משחקי יום הולדת לפי גיל', href: '/guides/birthday-games-by-age' })
  else links.push({ label: 'חדר בריחה למבוגרים', href: '/tools/escape-rooms/adult-party-mystery' }, { label: 'שאלות היכרות למבוגרים', href: '/questions/icebreaker-adults' })
  return links
}

export default function AgePage() {
  const { age } = useParams()
  const { games, loading } = useGames()
  const ageNum = parseInt(age)
  const validAge = String(ageNum) === age && ageNum >= 1 && ageNum <= 120
  const info = validAge ? AGE_IDEAS[ageNum] : null
  const bySlug = Object.fromEntries(games.map(g => [g.slug, g]))
  const picked = new Set(info?.picks.map(([slug]) => slug) || [])
  const filtered = games.filter(g => g.min_age <= ageNum && (!g.max_age || g.max_age >= ageNum) && !picked.has(g.slug))
  // Rotate the "more games" list per age so sibling age pages don't all show the same first items.
  const more = filtered.length ? nearby(filtered, (_, i) => i === (ageNum * 7) % filtered.length, info ? 6 : 12) : []
  const neighbours = info ? nearby(AGE_IDEA_LIST, n => n === ageNum, AGE_IDEA_LIST.length - 1) : []
  const prev = AGE_IDEA_LIST.filter(n => n < ageNum).pop()
  const next = AGE_IDEA_LIST.find(n => n > ageNum)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 buga-fade-in">
      <SEO title={`רעיונות ליום הולדת גיל ${age}`} description={info ? `יום הולדת לגיל ${age}: מה ילדים בגיל הזה אוהבים, כמה זמן ומי להזמין, לו״ז לדוגמה, משחקים מתאימים, אוכל וטעויות שכדאי להימנע מהן.` : `משחקים ורעיונות ליום הולדת גיל ${age} — בלי ציוד, בלי הכנה, חינם.`} path={'/ideas/age/'+age} noindex={!validAge} structuredData={info ? faqSchema(info.faq) : undefined} />
      <Breadcrumbs items={[{ label: 'ראשי', href: '/' }, { label: 'השראה', href: '/ideas' }, { label: 'גיל '+age }]} />
      <h1 className="text-4xl sm:text-5xl text-center mb-6">🎂 רעיונות ליום הולדת גיל {age}</h1>

      {info && (
        <>
          <p className="mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-[var(--foreground)]/85">{info.intro}</p>

          <div className="mb-10 grid gap-4 sm:grid-cols-3">
            {[['⏱️ אורך המסיבה', info.duration], ['👧 גודל קבוצה', info.group], ['🧠 טווח קשב', info.attention]].map(([label, value], i) => (
              <div key={label} className={`wobbly-sm border-2 border-[var(--border)] ${i === 1 ? 'bg-[var(--postit)]' : 'bg-[var(--card)]'} p-4 text-center sketch-shadow-sm`}>
                <p className="font-hand text-base text-[var(--muted-foreground)]">{label}</p>
                <p className="mt-1 font-display text-xl font-bold">{value}</p>
              </div>
            ))}
          </div>

          <div className="mb-10 grid gap-5 md:grid-cols-2">
            <WobblyCard hover={false} className="-rotate-[0.4deg]">
              <h2 className="text-2xl mb-3">מה ילדים בני {age} אוהבים</h2>
              <ul className="grid gap-2 text-lg">{info.enjoys.map(x => <li key={x}>• {x}</li>)}</ul>
            </WobblyCard>
            <WobblyCard hover={false} className="rotate-[0.4deg]">
              <h2 className="text-2xl mb-3">לו״ז לדוגמה</h2>
              <ol className="grid gap-2">
                {info.schedule.map(([time, what]) => (
                  <li key={time} className="flex gap-3 border-b border-dashed border-[var(--border)] pb-2 last:border-b-0">
                    <span className="shrink-0 font-display font-bold text-[var(--pen)]" dir="ltr">{time}</span>
                    <span>{what}</span>
                  </li>
                ))}
              </ol>
            </WobblyCard>
          </div>

          <section className="mb-10">
            <h2 className="text-3xl mb-4">6 משחקים שמתאימים בדיוק לגיל {age}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {info.picks.map(([slug, why], i) => (
                <Link key={slug} to={gameHref(slug)} className={`card-lift wobbly border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow-rich ${i % 2 ? 'rotate-1' : '-rotate-1'}`}>
                  <h3 className="text-xl font-bold">{bySlug[slug]?.name || slug}</h3>
                  <p className="mt-1 text-[var(--foreground)]/80">{why}</p>
                </Link>
              ))}
            </div>
          </section>

          <div className="mb-10 grid gap-5 md:grid-cols-2">
            <WobblyCard hover={false} className="rotate-[0.3deg]">
              <h2 className="text-2xl mb-3">אוכל ועוגה</h2>
              <ul className="grid gap-2 text-lg">{info.food.map(x => <li key={x}>• {x}</li>)}</ul>
            </WobblyCard>
            <div className="wobbly relative border-2 border-[var(--border)] bg-[var(--postit)] p-6 sketch-shadow pin">
              <h2 className="text-2xl mb-3">מה כדאי להימנע ממנו</h2>
              <ul className="grid gap-2 font-hand text-lg">{info.pitfalls.map(x => <li key={x}>• {x}</li>)}</ul>
            </div>
          </div>
        </>
      )}

      {loading ? <div className="text-center py-12 text-4xl buga-bounce">🎂</div> : more.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl mb-4">{info ? 'עוד משחקים שמתאימים לגיל ' + age : 'משחקים מתאימים'}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((g,i) => (
              <Link key={g.slug} to={gameHref(g.slug)} className={`card-lift wobbly border-2 border-[var(--border)] bg-[var(--card)] p-5 sketch-shadow-rich ${i%2?'rotate-1':'-rotate-1'}`}>
                <h3 className="text-xl font-bold">{g.name}</h3>
                <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mt-1">{g.short_description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {info && (
        <>
          <SeoBody faq={info.faq} related={ageLinks(ageNum)} />
          <nav className="mt-8" aria-label="רעיונות לפי גיל">
            <h2 className="text-2xl mb-3">רעיונות ליום הולדת בגילים אחרים</h2>
            <div className="flex flex-wrap gap-2">
              {prev && <Link to={'/ideas/age/' + prev} className="wobbly-sm border-2 border-[var(--border)] bg-[var(--postit)] px-3 py-2 font-display text-lg font-bold">→ גיל {prev}</Link>}
              {neighbours.filter(n => n !== prev && n !== next).map(n => (
                <Link key={n} to={'/ideas/age/' + n} className="wobbly-sm border-2 border-[var(--border)] bg-white px-3 py-2 font-hand text-lg underline decoration-dashed hover:bg-[var(--postit)]">גיל {n}</Link>
              ))}
              {next && <Link to={'/ideas/age/' + next} className="wobbly-sm border-2 border-[var(--border)] bg-[var(--postit)] px-3 py-2 font-display text-lg font-bold">גיל {next} ←</Link>}
            </div>
          </nav>
        </>
      )}
    </div>
  )
}
